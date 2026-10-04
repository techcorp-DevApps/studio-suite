"""Schemas and persistence-backed workflow for enquiries, identity, and bookings."""

import hashlib
import hmac
import secrets
from datetime import UTC, date, datetime, timedelta
from typing import Literal

from bson import ObjectId
from fastapi import Depends, Header, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field, field_validator
from pymongo.errors import DuplicateKeyError

from db import get_database
from policy import BOOKING_STATES, STATE_MESSAGES


def now() -> datetime:
    return datetime.now(UTC)


def public_id(value) -> str:
    return str(value)


def password_hash(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt$16384$8$1${salt.hex()}${digest.hex()}"


def password_matches(password: str, encoded: str) -> bool:
    try:
        _, n, r, p, salt, expected = encoded.split("$")
        actual = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=int(n), r=int(r), p=int(p))
        return hmac.compare_digest(actual.hex(), expected)
    except (ValueError, TypeError):
        return False


class EnquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(min_length=6, max_length=40)
    preferred_date: date
    session_type: Literal["wedding", "portrait", "editorial", "brand", "other"]
    package_preference: Literal["essential", "signature", "bespoke", "undecided"]
    location: str = Field(min_length=2, max_length=160)
    message: str = Field(min_length=10, max_length=2000)

    @field_validator("preferred_date")
    @classmethod
    def future_date(cls, value: date) -> date:
        if value < datetime.now(UTC).date():
            raise ValueError("Preferred date must not be in the past")
        return value


class Login(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=200)


class BootstrapUser(Login):
    role: Literal["studio", "client"]


class Transition(BaseModel):
    state: str
    reason: str = Field(min_length=2, max_length=300)
    client_id: str | None = None

    @field_validator("state")
    @classmethod
    def known_state(cls, value: str) -> str:
        if value not in BOOKING_STATES:
            raise ValueError("Unknown booking state")
        return value


def serialise_enquiry(item: dict, include_contact: bool = True) -> dict:
    result = {
        "id": public_id(item["_id"]),
        "preferred_date": item["preferred_date"],
        "session_type": item["session_type"],
        "package_preference": item["package_preference"],
        "location": item["location"],
        "message": item["message"],
        "state": item["state"],
        "status_message": STATE_MESSAGES[item["state"]],
        "created_at": item["created_at"],
    }
    if include_contact:
        result.update(name=item["name"], email=item["email"], phone=item["phone"])
    return result


async def current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Authentication required")
    token_hash = hashlib.sha256(authorization[7:].encode()).hexdigest()
    database = get_database()
    session = await database.sessions.find_one({"token_hash": token_hash, "expires_at": {"$gt": now()}})
    if not session:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired or invalid")
    user = await database.users.find_one({"_id": session["user_id"], "active": True})
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session invalid")
    user["session_id"] = session["_id"]
    return user


def require_role(role: str):
    async def dependency(user: dict = Depends(current_user)) -> dict:
        if user["role"] != role:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient role")
        return user

    return dependency


class SlidingRateLimiter:
    """Process-local defence suitable behind a single API process; proxy scaling is documented."""

    def __init__(self, limit: int, seconds: int):
        self.limit, self.window, self.hits = limit, timedelta(seconds=seconds), {}

    async def __call__(self, request: Request) -> None:
        key = request.client.host if request.client else "unknown"
        cutoff = now() - self.window
        recent = [value for value in self.hits.get(key, []) if value > cutoff]
        if len(recent) >= self.limit:
            raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Please retry later")
        self.hits[key] = [*recent, now()]


enquiry_limit = SlidingRateLimiter(10, 60)
login_limit = SlidingRateLimiter(10, 60)


async def submit_enquiry(payload: EnquiryCreate, idempotency_key: str, database) -> tuple[dict, bool]:
    if not idempotency_key or len(idempotency_key) > 128:
        raise HTTPException(400, "A valid Idempotency-Key header is required")
    existing = await database.enquiries.find_one({"idempotency_key": idempotency_key})
    if existing:
        return existing, True
    document = payload.model_dump(mode="json") | {
        "email": str(payload.email).lower(),
        "idempotency_key": idempotency_key,
        "state": "tentative_request",
        "client_id": None,
        "created_at": now(),
        "updated_at": now(),
        "audit": [],
    }
    try:
        result = await database.enquiries.insert_one(document)
        document["_id"] = result.inserted_id
        return document, False
    except DuplicateKeyError:
        return await database.enquiries.find_one({"idempotency_key": idempotency_key}), True


ALLOWED_TRANSITIONS = {
    "tentative_request": {"awaiting_studio_confirmation", "needs_human", "abandoned"},
    "awaiting_studio_confirmation": {"awaiting_client_confirmation", "confirmed", "needs_human", "abandoned"},
    "awaiting_client_confirmation": {"confirmed", "needs_human", "abandoned"},
    "needs_human": {"awaiting_studio_confirmation", "abandoned"},
}


async def transition_enquiry(database, enquiry: dict, change: Transition, actor: dict) -> dict:
    previous = enquiry["state"]
    if change.state not in ALLOWED_TRANSITIONS.get(previous, set()):
        raise HTTPException(409, f"Transition from {previous} to {change.state} is not allowed")
    try:
        client_id = ObjectId(change.client_id) if change.client_id else enquiry.get("client_id")
    except Exception as exc:
        raise HTTPException(422, "Client ID is invalid") from exc
    if client_id and not await database.users.find_one({"_id": client_id, "role": "client", "active": True}):
        raise HTTPException(409, "A valid active client account is required")
    if change.state == "confirmed" and not client_id:
        raise HTTPException(409, "A verified client must be linked before confirmation")
    audit = {"at": now(), "actor_id": actor["_id"], "from": previous, "to": change.state, "reason": change.reason}
    update = {"state": change.state, "updated_at": now(), "client_id": client_id}
    if change.state == "confirmed":
        slot = f"{enquiry['preferred_date']}:{enquiry['location'].strip().casefold()}"
        booking = {
            "enquiry_id": enquiry["_id"],
            "client_id": client_id,
            "state": "confirmed",
            "confirmed_slot": slot,
            "created_at": now(),
            "progress": "booking_confirmed",
            "audit": [audit],
        }
        try:
            await database.bookings.insert_one(booking)
        except DuplicateKeyError as exc:
            raise HTTPException(409, "That date and location already has a confirmed booking") from exc
    await database.enquiries.update_one(
        {"_id": enquiry["_id"], "state": previous}, {"$set": update, "$push": {"audit": audit}}
    )
    return await database.enquiries.find_one({"_id": enquiry["_id"]})
