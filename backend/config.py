"""Application settings (pydantic-settings).

Reads configuration from the process environment and an optional ``backend/.env``
file. Field names map case-insensitively to environment variable names, so
``mongodb_uri`` reads ``MONGODB_URI``.

The Cloudflare R2 fields are *reserved by name* for the later media-pipeline task;
no R2 client is constructed in task 01.0.0.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = Path(__file__).parent / ".env"


class Settings(BaseSettings):
    """Typed application configuration."""

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---- Environment ----
    environment: str = "development"

    # ---- Database (canonical names only; no legacy aliases) ----
    mongodb_uri: str | None = None
    mongodb_db_name: str | None = None
    mongodb_app_name: str = "studio-suite"
    mongodb_max_pool_size: int = 20
    mongodb_server_selection_timeout_ms: int = 10000

    # ---- CORS ----
    cors_origins: str = ""
    cors_origin_regex: str | None = None

    # ---- Cloudflare R2 (RESERVED — adapter implemented in a later task) ----
    r2_account_id: str | None = None
    r2_access_key_id: str | None = None
    r2_secret_access_key: str | None = None
    r2_bucket_originals: str | None = None
    r2_bucket_derivatives: str | None = None

    @property
    def is_production(self) -> bool:
        return self.environment.strip().lower() == "production"

    def cors_origin_list(self) -> list[str]:
        """Explicit CORS origins parsed from the comma-separated ``CORS_ORIGINS``.

        Each origin is trimmed and has any trailing slash removed so browser
        ``Origin`` headers match exactly.
        """
        return [
            origin.strip().rstrip("/")
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    """Return a cached ``Settings`` instance.

    Tests that need to vary the environment can clear the cache via
    ``get_settings.cache_clear()`` and set the relevant variables in the
    process environment.
    """
    return Settings()
