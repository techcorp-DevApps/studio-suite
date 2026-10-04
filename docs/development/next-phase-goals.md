# Next-phase goal ledger

Assessed base: `198f8ae773b7043e7d69b6bf75ed8ae527d95469`. Branch: `work`.

| Goal | Status | Evidence | Blocker / next action |
| --- | --- | --- | --- |
| G01 | Complete | Exact baseline reproduced with pnpm 10.34.3 and Python 3.11; exact outcomes are transcribed in the final report. Repository clone has no configured origin, so URL identity cannot be independently verified. | Maintainer should restore/verify the Git remote before push. |
| G02 | Complete | Authority matrix, generated-token parity/contrast test, unified theme/control semantics. | Owner decisions listed in design matrix. |
| G03 | Complete | Responsive public portfolio, experience, package, honest testimonial state, enquiry and footer; working anchors/routes. | Approved testimonials/journal content remains unavailable. |
| G04 | Complete locally | Validated Mongo enquiry API, indexes, idempotent retry, persisted acknowledgement and connected form. | Real disposable Mongo acceptance remains incomplete in this environment. |
| G05 | Complete locally | Scrypt identities, bootstrap gate, expiring/revocable sessions, roles and ownership tests. | Live recovery mail intentionally unavailable. |
| G06 | Complete locally | Studio list/detail and guarded transitions with audit records and unique confirmation slot. | Studio UI is deliberately narrow; transition action remains API-operated. Real Mongo concurrency proof pending. |
| G07 | Complete | Client portal loads only server-owned bookings; cross-client denial tested. | Gallery/documents/payments state is explicitly unavailable. |
| G08 | Complete | Scoped image-copy and booking-state policy validator with regressions; server supplies state messages. | Full Luma integration is deferred. |
| G09 | Partial | CI suites, build/lint/test, direct SPA fallback config and locally reviewed responsive screenshots; the report includes their reproduction command because PR transport does not accept binaries. | No real Mongo daemon/provider or external deployment was available. |
| G10 | Complete | Explicit staging, commits, report and PR handoff. | Push requires a configured origin. |

## Checkpoints

- Baseline: assessment commit; original 12 backend tests and web gates passed. pnpm reported narrowly ignored esbuild install scripts, but direct builds succeeded without approving scripts.
- Workflow implementation: enquiry/auth/booking/policy suites pass under isolated Mongo emulation.
- Release candidate: see `test_reports/2026-10-04-next-phase-report.md` for exact results and residual limitations.

## Retained later-phase backlog

Private R2 media delivery; contracts/signatures and live correspondence; payments/invoices/fulfilment; full Luma provider integration; Expo mobile; rich CMS and an approved Journal.
