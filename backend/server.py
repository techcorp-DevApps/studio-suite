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

from fastapi import FastAPI  # noqa: E402 — must follow load_dotenv
from starlette.middleware.cors import CORSMiddleware  # noqa: E402

from config import get_settings  # noqa: E402
from db import check_database_connection, close_database_client  # noqa: E402

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s"
)
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

    _configure_cors(app)
    return app


app = create_app()
