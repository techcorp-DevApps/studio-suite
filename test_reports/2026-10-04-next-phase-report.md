# Studio Suite next-phase verification report

## Revision scope

- Assessed base: `198f8ae773b7043e7d69b6bf75ed8ae527d95469`
- Branch: `work`
- Final commit: recorded after this report in Git history/PR
- Origin: no remote is configured in this checkout. The supplied repository identity therefore could not be independently compared with `origin`.

## Delivered

- Reconciled semantic-token/control/theme contract and documented unresolved design decisions.
- Responsive public experience with functional navigation, an honest portfolio/testimonial state and policy-safe package/process copy.
- Persisted, validated tentative enquiries with mandatory idempotency keys and server acknowledgements.
- Controlled user bootstrap, scrypt passwords, expiring/revocable hashed bearer sessions, server roles and client resource ownership.
- Studio enquiry APIs, guarded state transitions and audit events; confirmation requires a linked client.
- Unique confirmed date/location slots and a client-only booking view.
- Scoped customer-copy validation and state-authoritative booking language.
- Updated CI, environment/runbook documentation and goal ledger.

## Exact verification

| Command | Result |
| --- | --- |
| `corepack pnpm --version` | PASS — `10.34.3`. |
| `corepack pnpm install --frozen-lockfile` | PASS; pnpm reported ignored esbuild install scripts. Direct builds passed, so no scripts were broadly approved. |
| `corepack pnpm -F @is/tokens build` | PASS. |
| `corepack pnpm -F @is/tokens test` | PASS — CSS parity and required contrast pairs. |
| `corepack pnpm -F studio-suite-web lint` | PASS. |
| `corepack pnpm -F studio-suite-web build` | PASS. |
| `python -m pip install -r requirements-dev.txt` (Python 3.11 venv) | PASS. |
| `ruff check .` | PASS. |
| `pytest -q` | PASS — 17 tests. |
| Playwright full-page screenshots at 375, 768 and 1440px | PASS locally. No horizontal clipping was observed in review. Binary captures are intentionally excluded from Git because the PR transport does not support binary files. |
| Real disposable MongoDB index/concurrency suite | NOT RUN — no `mongod`, Docker service, or disposable Mongo URI was available. Mongo emulation cannot prove server atomicity. |
| Full live browser submission → two-role confirmation flow | NOT RUN — no real disposable Mongo service. API lifecycle and isolation are covered locally, but this acceptance item remains incomplete. |

## Accessibility and visual review

The three locally reviewed responsive captures showed readable navigation, form layout and minimum 48px functional controls. Inputs have programmatic labels, status/error live regions, keyboard focus styling and reduced-motion handling. Light surfaces were reviewed. A dark functional surface is not exposed; token contrast is tested but no dark gallery overlay exists. Automated lint and focused checks are not represented as certification. The exact reproduction command is recorded below so reviewers can regenerate the deliberately untracked evidence.

```bash
mkdir -p test_reports/screenshots
for width in 375 768 1440; do
  pnpm dlx playwright@1.55.1 screenshot \
    --viewport-size="${width},900" --full-page \
    http://127.0.0.1:5173 "test_reports/screenshots/public-${width}.png"
done
```

Intentional reference departures: unsupported statistics, prices, dates, awards, testimonials, and external placeholder photography were removed. The portfolio explains its consent boundary rather than publishing unapproved work. Gold and type conflicts are recorded in the authority matrix.

## Operational and provider limitations

- Live recovery mail is unavailable and the API says so without account enumeration.
- Process-local submission/login throttles protect a single replica. Multi-replica production must add trusted-ingress/distributed enforcement.
- Railway files were inspected and SPA fallback behavior comes from `serve -s`; no provider dashboard was modified or verified.
- No production deployment, production data, provider credentials, push or merge occurred.

## Deferred backlog

Private R2 media; contracts/signatures and real correspondence; payments/invoices/fulfilment; full Luma provider integration; Expo mobile; rich CMS and an approved Journal.
