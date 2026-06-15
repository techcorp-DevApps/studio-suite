# studio-suite

Monorepo for the Studio Suite platform: a public, no-auth marketing front-end that
is the entry point to an auth-gated studio admin portal and individual auth-gated
client portals, backed by a FastAPI service and (in a later task) a high-resolution
burst-access media pipeline (Cloudflare R2 + Worker/CDN).

This repository currently contains the **foundation skeleton** (task 01.0.0): it
builds, runs, health-checks, and deploys. It is intentionally **not**
feature-complete — auth logic, the R2 media pipeline, and product features land in
later, separately-gated tasks.

## Layout

```
backend/     FastAPI + async MongoDB (Motor) service. Health probes, settings, tests.
web/         Vite + React 19 + Tailwind + shadcn/ui. Public marketing landing (placeholder).
mobile/      Reserved — Expo/EAS app scaffolded in task 01.1.0 (see mobile/README.md).
.github/     CI: backend (ruff + pytest) and web (lint + build) jobs on PRs to main.
test_reports/ Per-task completion reports with gate evidence.
```

Each deployable part (`backend/`, `web/`) carries its own `railway.toml` and its own
`.env.example`. Real secrets live only in gitignored `.env` files — never in git.

## Stack

- **Backend:** Python 3.11, FastAPI, Uvicorn, Motor (async MongoDB driver),
  pydantic-settings. Metadata-only persistence in MongoDB Atlas.
- **Web:** Vite, React 19, Tailwind CSS (locally built), shadcn/ui, ESLint.
- **Hosting:** Railway (one service per deployable directory).
- **Storage (reserved):** Cloudflare R2 private buckets — settings fields are
  reserved by name in this task; the adapter is implemented later.

## Run the backend (local)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt          # prod + dev tooling
cp .env.example .env                          # then fill in MONGODB_URI / MONGODB_DB_NAME
uvicorn server:app --reload --port 8000
# Liveness:  curl http://127.0.0.1:8000/api/health
# DB probe:  curl http://127.0.0.1:8000/api/health/db
```

Quality gates:

```bash
cd backend
ruff check .
pytest -q
```

The `GET /api/health/db` probe reports MongoDB connectivity as a status object and
does **not** crash the service when the database is unreachable.

## Run the web app (local)

```bash
cd web
npm ci --include=dev        # Vite is a devDependency — dev deps are required to build
cp .env.example .env        # then set VITE_BACKEND_URL
npm run dev                 # http://localhost:5173
```

Production build (what Railway runs):

```bash
cd web
npm ci --include=dev && npm run build   # outputs to web/build/
npx serve -s build                      # serve the production bundle locally
npm run lint                            # ESLint
```

## Deployment

Railway hosts one service per deployable directory, each configured by its own
`railway.toml` (`backend/railway.toml`, `web/railway.toml`). The web build command
keeps dev dependencies (`npm ci --include=dev && npm run build`) because Vite is a
devDependency; a bare production install fails with `vite: not found`.

> `backend/railway.toml`, `web/railway.toml`, and `.github/workflows/ci.yml` are
> **infrastructure** files — review them as infra, not as ordinary application code.
