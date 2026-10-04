# Studio Suite

Studio Suite is a pnpm monorepo with a public React experience, protected studio/client portals, and a FastAPI/MongoDB service for tentative enquiries and authoritative booking status. Media delivery, payments, contracts, live mail and Luma provider integration remain later-phase work.

## Local setup

Use the pinned package manager from the root; build tokens before the web app:

```bash
corepack pnpm --version             # 10.34.3
corepack pnpm install --frozen-lockfile
corepack pnpm -F @is/tokens build
corepack pnpm -F @is/tokens test
corepack pnpm -F studio-suite-web dev
```

In another shell:

```bash
cd backend
python3.11 -m venv .venv && source .venv/bin/activate
python -m pip install -r requirements-dev.txt
cp .env.example .env
uvicorn server:app --reload --port 8000
```

Set `VITE_BACKEND_URL=http://localhost:8000` in `web/.env`. The SPA routes `/login`, `/studio`, and `/client` require a static host fallback to `index.html` (Railway's `serve -s` command provides it).

## Configuration and security

Backend variables are `MONGODB_URI`, `MONGODB_DB_NAME`, optional Mongo timeout/pool variables, `CORS_ORIGINS`, `CORS_ORIGIN_REGEX`, `ENVIRONMENT`, `BOOTSTRAP_TOKEN`, and `SESSION_TTL_MINUTES`. Reserved R2 names are listed in `backend/.env.example` but are not active. Never commit real values.

Authentication uses scrypt password hashes and random, hashed, expiring and server-revocable bearer sessions. The browser keeps its session only in `sessionStorage`; roles and resource ownership are enforced by the API. Production should terminate TLS, restrict CORS, use a long bootstrap secret, remove/rotate that secret after provisioning, and apply distributed rate limiting at the trusted ingress when running more than one API process. No public self-registration exists.

Create a controlled studio or client identity:

```bash
curl -X POST http://localhost:8000/api/admin/bootstrap \
  -H 'Content-Type: application/json' -H 'X-Bootstrap-Token: YOUR_LOCAL_SECRET' \
  -d '{"email":"studio@example.com","password":"a-long-local-passphrase","role":"studio"}'
```

A studio transition may link a client account by its server ID; submitted email never establishes ownership. Confirmation requires that linkage. MongoDB indexes enforce unique email, enquiry idempotency keys, session tokens, TTL expiry, and one confirmed booking per supported date/location slot. Application startup creates indexes after readiness succeeds. To roll back code, deploy the prior revision; the additive collections/indexes can remain. Do not drop indexes in production without a reviewed migration.

## Checks and probes

```bash
corepack pnpm -F @is/tokens build && corepack pnpm -F @is/tokens test
corepack pnpm -F studio-suite-web lint && corepack pnpm -F studio-suite-web build
cd backend && . .venv/bin/activate && ruff check . && pytest -q
```

`GET /api/health` is liveness. `GET /api/health/db` is readiness and reports a sanitised connectivity state without stopping liveness. Tests use isolated Mongo emulation for behavior. Real Mongo index/concurrency verification requires a disposable `MONGODB_URI`; it is intentionally not claimed when unavailable.

## Deployment

`backend/railway.toml` and `web/railway.toml` define separate Railway services. Review these as infrastructure. This repository does not assert that a Railway dashboard or production environment has been changed.
