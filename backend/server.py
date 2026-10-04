"""FastAPI app entry for the studio-suite backend.

Loads environment, builds the app via a factory, exposes liveness and DB-readiness
health probes, and configures CORS for explicit production origins plus Railway
preview hosts. ``app`` is exported at module scope for ``uvicorn server:app``.

Note: this module defines route handlers, so it deliberately does **not** use
``from __future__ import annotations`` (which can cause FastAPI to mis-resolve
annotations and return HTTP 422 on affected endpoints).
"""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

# Populate os.environ from backend/.env before any module reads configuration.
load_dotenv(Path(__file__).parent / ".env")

from bson import ObjectId  # noqa: E402
from fastapi import Depends, FastAPI, Header, HTTPException, Response  # noqa: E402
from pymongo.errors import DuplicateKeyError  # noqa: E402
from starlette.middleware.cors import CORSMiddleware  # noqa: E402

from config import get_settings  # noqa: E402
from db import (  # noqa: E402
    check_database_connection,
    close_database_client,
    ensure_indexes,
    get_database,
)
from domain import (  # noqa: E402
    BootstrapUser,
    EnquiryCreate,
    Login,
    Transition,
    current_user,
    enquiry_limit,
    login_limit,
    now,
    password_hash,
    password_matches,
    require_role,
    serialise_enquiry,
    submit_enquiry,
    transition_enquiry,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("studio-suite")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Verify DB connectivity on startup without blocking the service.

    A briefly-unreachable database must not stop the API from starting, so the
    probe result is logged and startup continues; the Motor client is closed on
    shutdown.
    """
    status = await check_database_connection()
    if status.get("ok"):
        await ensure_indexes()
        logger.info("MongoDB connection verified (database=%s)", status.get("database"))
    else:
        logger.warning("MongoDB not reachable at startup: %s", status.get("error"))
    try:
        yield
    finally:
        close_database_client()


def _configure_cors(app: FastAPI) -> None:
    """Attach CORS middleware using explicit origins plus a preview-host regex.

    ``allow_credentials`` is enabled only when origins are not the ``["*"]``
    wildcard, avoiding the credentials-with-wildcard footgun browsers reject.
    """
    settings = get_settings()
    origins = settings.cors_origin_list() or [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        # Set CORS_ORIGIN_REGEX for ephemeral Railway preview hosts, e.g.
        # ^https://web-[a-z0-9-]+\.up\.railway\.app$
        allow_origin_regex=settings.cors_origin_regex,
        allow_credentials=origins != ["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    settings = get_settings()
    app = FastAPI(title="Studio Suite API", lifespan=lifespan)

    @app.get("/api/health")
    async def health() -> dict:
        """Liveness probe used by the Railway health check."""
        return {"ok": True, "name": "Studio Suite API", "environment": settings.environment}

    @app.get("/api/health/db")
    async def health_db() -> dict:
        """Readiness probe reporting MongoDB connectivity as a status object."""
        return await check_database_connection()

    @app.post("/api/enquiries", status_code=201, dependencies=[Depends(enquiry_limit)])
    async def create_enquiry(
        payload: EnquiryCreate, response: Response, idempotency_key: str = Header(alias="Idempotency-Key")
    ) -> dict:
        database = get_database()
        item, replayed = await submit_enquiry(payload, idempotency_key, database)
        response.status_code = 200 if replayed else 201
        return {"enquiry": serialise_enquiry(item, include_contact=False), "replayed": replayed}

    @app.post("/api/auth/login", dependencies=[Depends(login_limit)])
    async def login(payload: Login) -> dict:
        import hashlib
        import secrets
        from datetime import timedelta

        database = get_database()
        user = await database.users.find_one({"email": str(payload.email).lower(), "active": True})
        if not user or not password_matches(payload.password, user["password_hash"]):
            raise HTTPException(401, "Invalid email or password")
        token = secrets.token_urlsafe(32)
        await database.sessions.insert_one(
            {
                "token_hash": hashlib.sha256(token.encode()).hexdigest(),
                "user_id": user["_id"],
                "created_at": now(),
                "expires_at": now() + timedelta(minutes=get_settings().session_ttl_minutes),
            }
        )
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": user["role"],
            "expires_in": get_settings().session_ttl_minutes * 60,
        }

    @app.post("/api/auth/logout", status_code=204)
    async def logout(user: dict = Depends(current_user)) -> Response:
        await get_database().sessions.delete_one({"_id": user["session_id"]})
        return Response(status_code=204)

    @app.post("/api/auth/recovery", status_code=202)
    async def recovery() -> dict:
        return {
            "message": (
                "If an eligible account exists, recovery instructions will be provided "
                "when mail delivery is configured."
            )
        }

    @app.post("/api/admin/bootstrap", status_code=201)
    async def bootstrap(payload: BootstrapUser, bootstrap_token: str = Header(alias="X-Bootstrap-Token")) -> dict:
        settings = get_settings()
        if not settings.bootstrap_token or not secrets_compare(bootstrap_token, settings.bootstrap_token):
            raise HTTPException(403, "Bootstrap is not available")
        database = get_database()
        try:
            result = await database.users.insert_one(
                {
                    "email": str(payload.email).lower(),
                    "password_hash": password_hash(payload.password),
                    "role": payload.role,
                    "active": True,
                    "created_at": now(),
                }
            )
        except DuplicateKeyError as exc:
            raise HTTPException(409, "Account already exists") from exc
        return {"id": str(result.inserted_id), "email": str(payload.email).lower(), "role": payload.role}

    @app.get("/api/studio/enquiries")
    async def studio_enquiries(user: dict = Depends(require_role("studio"))) -> dict:
        items = await get_database().enquiries.find().sort("created_at", -1).to_list(200)
        return {"items": [serialise_enquiry(item) for item in items], "total": len(items)}

    @app.get("/api/studio/enquiries/{enquiry_id}")
    async def studio_enquiry(enquiry_id: str, user: dict = Depends(require_role("studio"))) -> dict:
        item = await find_enquiry(enquiry_id)
        return serialise_enquiry(item)

    @app.post("/api/studio/enquiries/{enquiry_id}/transition")
    async def transition(enquiry_id: str, change: Transition, user: dict = Depends(require_role("studio"))) -> dict:
        database = get_database()
        item = await find_enquiry(enquiry_id)
        return serialise_enquiry(await transition_enquiry(database, item, change, user))

    @app.get("/api/client/bookings")
    async def client_bookings(user: dict = Depends(require_role("client"))) -> dict:
        database = get_database()
        bookings = await database.bookings.find({"client_id": user["_id"]}).to_list(100)
        items = []
        for booking in bookings:
            enquiry = await database.enquiries.find_one({"_id": booking["enquiry_id"], "client_id": user["_id"]})
            if enquiry:
                items.append(
                    {
                        "id": str(booking["_id"]),
                        "state": booking["state"],
                        "progress": booking["progress"],
                        "status_message": "Your booking is confirmed.",
                        "enquiry": serialise_enquiry(enquiry),
                    }
                )
        return {"items": items, "total": len(items)}

    @app.get("/api/client/bookings/{booking_id}")
    async def client_booking(booking_id: str, user: dict = Depends(require_role("client"))) -> dict:
        try:
            oid = ObjectId(booking_id)
        except Exception as exc:
            raise HTTPException(404, "Booking not found") from exc
        booking = await get_database().bookings.find_one({"_id": oid, "client_id": user["_id"]})
        if not booking:
            raise HTTPException(404, "Booking not found")
        return {
            "id": str(booking["_id"]),
            "state": booking["state"],
            "progress": booking["progress"],
            "status_message": "Your booking is confirmed.",
        }

    _configure_cors(app)
    return app


def secrets_compare(value: str, expected: str) -> bool:
    import secrets

    return secrets.compare_digest(value, expected)


async def find_enquiry(enquiry_id: str) -> dict:
    try:
        oid = ObjectId(enquiry_id)
    except Exception as exc:
        raise HTTPException(404, "Enquiry not found") from exc
    item = await get_database().enquiries.find_one({"_id": oid})
    if not item:
        raise HTTPException(404, "Enquiry not found")
    return item


app = create_app()
