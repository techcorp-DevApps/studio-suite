from datetime import UTC, datetime, timedelta

import pytest
from httpx import ASGITransport, AsyncClient
from mongomock_motor import AsyncMongoMockClient

import domain
import server
from db import ensure_indexes


@pytest.fixture
async def api(monkeypatch):
    database = AsyncMongoMockClient()["studio_test"]
    await ensure_indexes(database)
    monkeypatch.setattr(server, "get_database", lambda: database)
    monkeypatch.setattr(domain, "get_database", lambda: database)
    monkeypatch.setenv("BOOTSTRAP_TOKEN", "test-bootstrap-token")
    server.get_settings.cache_clear()
    app = server.create_app()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client, database
    server.get_settings.cache_clear()


async def create_user(api, email, role):
    client, _ = api
    result = await client.post(
        "/api/admin/bootstrap",
        headers={"X-Bootstrap-Token": "test-bootstrap-token"},
        json={"email": email, "password": "a-secure-passphrase", "role": role},
    )
    assert result.status_code == 201, result.text
    return result.json()["id"]


async def login(api, email):
    response = await api[0].post("/api/auth/login", json={"email": email, "password": "a-secure-passphrase"})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def enquiry_payload(date="2030-05-10", location="Melbourne"):
    return {
        "name": "Casey Client",
        "email": "casey@example.com",
        "phone": "0400000000",
        "preferred_date": date,
        "session_type": "wedding",
        "package_preference": "undecided",
        "location": location,
        "message": "We would like to discuss our plans.",
    }


@pytest.mark.asyncio
async def test_enquiry_validation_and_idempotent_persistence(api):
    client, database = api
    invalid = await client.post(
        "/api/enquiries", headers={"Idempotency-Key": "bad"}, json=enquiry_payload("2020-01-01")
    )
    assert invalid.status_code == 422
    first = await client.post("/api/enquiries", headers={"Idempotency-Key": "retry-1"}, json=enquiry_payload())
    second = await client.post("/api/enquiries", headers={"Idempotency-Key": "retry-1"}, json=enquiry_payload())
    assert first.status_code == 201
    assert second.status_code == 200 and second.json()["replayed"] is True
    assert first.json()["enquiry"]["state"] == "tentative_request"
    assert "confirmed" not in first.json()["enquiry"]["status_message"].lower()
    assert await database.enquiries.count_documents({}) == 1


@pytest.mark.asyncio
async def test_session_logout_expiry_and_roles(api):
    client, database = api
    await create_user(api, "studio@example.com", "studio")
    invalid = await client.post("/api/auth/login", json={"email": "studio@example.com", "password": "not-the-password"})
    assert invalid.status_code == 401
    auth = await login(api, "studio@example.com")
    assert (await client.get("/api/studio/enquiries", headers=auth)).status_code == 200
    assert (await client.get("/api/client/bookings", headers=auth)).status_code == 403
    assert (await client.post("/api/auth/logout", headers=auth)).status_code == 204
    assert (await client.get("/api/studio/enquiries", headers=auth)).status_code == 401
    expired_token = "expired-token"
    import hashlib

    user = await database.users.find_one({"email": "studio@example.com"})
    await database.sessions.insert_one(
        {
            "token_hash": hashlib.sha256(expired_token.encode()).hexdigest(),
            "user_id": user["_id"],
            "expires_at": datetime.now(UTC) - timedelta(seconds=1),
        }
    )
    assert (
        await client.get("/api/studio/enquiries", headers={"Authorization": f"Bearer {expired_token}"})
    ).status_code == 401
    recovery = await client.post("/api/auth/recovery", json={"email": "unknown@example.com"})
    assert recovery.status_code == 202 and "configured" in recovery.json()["message"]


@pytest.mark.asyncio
async def test_transition_confirmation_conflict_and_client_isolation(api):
    client, database = api
    client_a = await create_user(api, "a@example.com", "client")
    await create_user(api, "b@example.com", "client")
    await create_user(api, "studio@example.com", "studio")
    studio_auth = await login(api, "studio@example.com")
    ids = []
    for key in ("one", "two"):
        response = await client.post("/api/enquiries", headers={"Idempotency-Key": key}, json=enquiry_payload())
        ids.append(response.json()["enquiry"]["id"])
    denied = await client.post(
        f"/api/studio/enquiries/{ids[0]}/transition",
        headers=await login(api, "a@example.com"),
        json={"state": "confirmed", "reason": "No"},
    )
    assert denied.status_code == 403
    for enquiry_id in ids:
        moved = await client.post(
            f"/api/studio/enquiries/{enquiry_id}/transition",
            headers=studio_auth,
            json={"state": "awaiting_studio_confirmation", "reason": "Reviewed", "client_id": client_a},
        )
        assert moved.status_code == 200
    confirmed = await client.post(
        f"/api/studio/enquiries/{ids[0]}/transition",
        headers=studio_auth,
        json={"state": "confirmed", "reason": "Studio approved", "client_id": client_a},
    )
    conflict = await client.post(
        f"/api/studio/enquiries/{ids[1]}/transition",
        headers=studio_auth,
        json={"state": "confirmed", "reason": "Studio approved", "client_id": client_a},
    )
    assert confirmed.status_code == 200
    assert conflict.status_code == 409
    a_auth, b_auth = await login(api, "a@example.com"), await login(api, "b@example.com")
    bookings = await client.get("/api/client/bookings", headers=a_auth)
    booking_id = bookings.json()["items"][0]["id"]
    assert bookings.json()["total"] == 1
    assert (await client.get(f"/api/client/bookings/{booking_id}", headers=b_auth)).status_code == 404
    assert await database.bookings.count_documents({}) == 1
