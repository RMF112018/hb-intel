# Prompt-05 Validation Evidence

## Scope
Validation for PnP Ops Prompt-01..04 implementation in:
- `apps/hb-webparts/src/webparts/pnp/`
- `backend/functions/src/services/admin-control-plane/`
- `backend/functions/src/functions/adminApi/`

## Command Results
| Command | Result | Notes |
|---|---|---|
| `pnpm --filter @hbc/models check-types` | Pass | No errors. |
| `pnpm --filter @hbc/functions check-types` | Pass | No errors. |
| `pnpm --filter @hbc/functions test` | Pass | `101` test files passed (`1876` passed, `3` skipped). Includes PnP orchestrator/catalog/preflight tests. |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | Pass | No errors. |
| `pnpm --filter @hbc/spfx-hb-webparts test` | Fail (known unrelated baseline) | Homepage non-PnP tests and bundle-budget assertions fail in current branch state. Not introduced by Prompt-05 closure work. |
| `cd apps/hb-webparts && pnpm vitest run --config vitest.config.ts src/webparts/pnp/pnpOpsActionCatalog.test.ts src/webparts/pnp/pnpOpsValidation.test.ts src/webparts/pnp/pnpOpsClient.test.ts` | Pass | `3` files, `13` tests passed (targeted PnP scope). |

## Runtime Coverage Matrix
| Area | Coverage | Status |
|---|---|---|
| PnP action catalog resolution | Unit/client tests (`pnpOpsActionCatalog`, `pnpOpsClient`) | Covered |
| Required input validation by action mode | Unit tests (`pnpOpsValidation`, backend preflight tests) | Covered |
| Run lifecycle + artifact/evidence behavior | Backend unit tests (`pnp-orchestrator`, preflight, admin API contracts) | Covered |
| Unauthorized/token-missing client behavior | Client logic and test coverage via token-provider wiring | Covered |
| Live backend-connected extraction run from this environment | Attempted prerequisite check | Blocked (no configured backend URL/audience/token context in local shell runtime) |

## Live Validation Attempt and Gap
Prompt-05 requires explicit live-vs-mock accounting. In this environment:
- no runtime backend endpoint/audience variables were present in shell (`printenv` check returned no backend/function/audience values),
- PnP webpart manifest defaults for backend settings are empty by design and require tenant/runtime configuration,
- therefore an authenticated live `/api/admin/*` run could not be executed from this local non-SPFx session.

Live extraction execution remains a **deployment/runtime prerequisite gap**, not a code-closure blocker for local Prompt-05 validation evidence.

## Baseline Failures (Separated)
The broad `@hbc/spfx-hb-webparts` suite currently fails on unrelated homepage tests and bundle-budget assertions (e.g. `src/homepage/__tests__/bundleBudget.test.ts`, `compositionPreview`, `topBandWebparts`, `discoveryWebpart`). These failures were not modified in Prompt-05 closure work and are recorded as pre-existing branch baseline risk.
