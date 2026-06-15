"""Pytest fixtures for the studio-suite backend.

Tests run fully in-process — no real MongoDB and no live server:

* ``db`` is backed by ``mongomock_motor`` (an async in-memory Mongo). The app
  resolves the module-global ``_db`` lazily, so swapping it in is all that is
  needed for the readiness probe to report a connected database.
* A ``fresh_state`` autouse fixture gives every test a clean in-memory database
  and a cleared settings cache so cases stay independent.
"""

import os

# Provide a canonical MongoDB config so config/db resolution is deterministic in
# tests. The in-memory client is injected by the fresh_state fixture regardless.
os.environ.setdefault("MONGODB_URI", "mongodb://localhost:27017")
os.environ.setdefault("MONGODB_DB_NAME", "studio_suite_test")
os.environ.setdefault("ENVIRONMENT", "test")

import pytest  # noqa: E402
import pytest_asyncio  # noqa: E402
from mongomock_motor import AsyncMongoMockClient  # noqa: E402

import db as db_module  # noqa: E402
from config import get_settings  # noqa: E402


@pytest.fixture(autouse=True)
def fresh_state():
    """Give every test a clean in-memory database and settings cache."""
    db_module._db = AsyncMongoMockClient()["studio_suite_test"]
    get_settings.cache_clear()
    yield
    db_module.close_database_client()
    get_settings.cache_clear()


@pytest_asyncio.fixture
async def client():
    """An ASGI test client bound to a freshly built app instance."""
    from httpx import ASGITransport, AsyncClient

    from server import create_app

    transport = ASGITransport(app=create_app())
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
