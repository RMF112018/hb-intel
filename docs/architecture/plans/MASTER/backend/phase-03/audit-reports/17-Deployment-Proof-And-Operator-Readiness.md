# 17 — Deployment Proof and Operator Readiness (Safety Backend)

## Scope & conclusion

This closure tightens deployment proof, confirms hosting-plan alignment, and establishes operator readiness for the Safety backend. Four deliverables:

1. **Artifact identity is impossible to misread.** `resolveBackendArtifactIdentity()` now normalizes `commitSha` (must be 40-char lowercase hex or `"unknown"`) and `buildTimestamp` (canonical ISO-8601 UTC or `"unknown"`); any malformed input collapses to `"unknown"` rather than leaking a truncated or human-formatted value. Both health routes (`/api/health` anonymous and `/api/health/ready` admin-gated) emit `Cache-Control: no-store, max-age=0` and `Content-Type: application/json` so artifact proof cannot be staled by an intermediate cache. All four invariants are covered by new lock-in tests (D1–D4).
2. **Hosting-plan alignment is verified.** The deploy workflow uses `Azure/functions-action@v1` (One Deploy) against a Flex Consumption (FC1) resource with blob-container deployment storage and no `WEBSITE_RUN_FROM_PACKAGE`. Lock-in guard D4 asserts the workflow continues to match this posture.
3. **A single authoritative operator runbook** at `docs/maintenance/safety-ingest-triage-and-recovery-runbook.md` gives operators a runbook-level proof path for the four high-value Safety failure modes: artifact drift, identity drift, graph grant failure, and reporting-period / item binding failure.
4. **A compact telemetry reference** at `docs/reference/developer/safety-ingest-telemetry-reference.md` catalogs the event classes, metrics, and the `failureClass` / `authLane` / `causeBucket` enums the runbook links to, with explicit retention assumptions.

Closure stamped as `@hbc/functions 00.000.148`.

## Hosting-plan alignment verdict

**Verdict: MATCH.**

| Dimension | Current state | Expected for Flex Consumption |
| --- | --- | --- |
| Hosting-plan SKU | `FC1` / `FlexConsumption` (`infra/legacy-fallback-hosting.bicep`) | `FC1` / `FlexConsumption` ✓ |
| Deployment storage | Blob container + user-assigned MI (Bicep) | Blob container mandatory ✓ |
| `WEBSITE_RUN_FROM_PACKAGE` | Not set (and guarded against by D4) | Not supported under Flex ✓ |
| Deploy action | `Azure/functions-action@v1` (One Deploy) | One Deploy is Flex-compatible ✓ |
| Auth to Azure | OIDC federated credential | No secret churn required ✓ |
| Identity stamping | Three hard gates (build manifest → pre-deploy `az` stamp + re-query → post-deploy parity probe) | Exceeds Flex minimum ✓ |

No mismatch flagged.

## Artifact-proof tightenings

### Code changes

- **`backend/functions/src/functions/health/index.ts`** — response init now sets `Content-Type: application/json` and `Cache-Control: no-store, max-age=0`. No field added, removed, or renamed on the anonymous `/api/health` response. The prohibition against weakening the minimal anonymous surface is preserved.
- **`backend/functions/src/functions/health/ready.ts`** — same headers added to the admin-gated `/api/health/ready` response.
- **`backend/functions/src/utils/backend-version.ts`** — added private `normalizeCommitSha` and `normalizeBuildTimestamp` helpers. `resolveBackendArtifactIdentity()` now passes `HBC_FUNCTIONS_BUILD_SHA` through `normalizeCommitSha` (lower-case, must match `/^[0-9a-f]{40}$/`, else `undefined`) and `HBC_FUNCTIONS_BUILD_TIMESTAMP` through `normalizeBuildTimestamp` (any value `Date.parse` accepts, canonicalized to `new Date(ms).toISOString()` Z-form, else `undefined`). In both cases, `undefined` falls through to `'unknown'`. The public return type is unchanged.
- **`backend/functions/src/utils/backend-version.test.ts`** — the existing "prefers env overrides" assertion previously used `'deadbeef'` (8-char short SHA) to document the lax resolver; with normalization in place, it now uses a valid 40-char lowercase hex SHA to document the tight contract. This is the minimum-necessary test adjustment consequent on the shape tightening.

### New guard tests (`backend/functions/src/utils/deployment-proof.test.ts`)

- **D1 — commitSha shape.** Eight scenarios (unset / empty / whitespace / valid 40-hex / uppercase / 7-char truncation / non-hex / 41-char) plus a shape-invariant sweep. Each asserts the returned `commitSha` is either `"unknown"` or matches `/^[0-9a-f]{40}$/`.
- **D2 — buildTimestamp shape.** Eight scenarios (unset / empty / whitespace / canonical ISO / ISO without ms / ISO with offset / garbage / sweep). Each asserts the returned `buildTimestamp` is either `"unknown"` or matches `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/`.
- **D3 — health handlers emit no-store cache headers.** Static-source scan of both `backend/functions/src/functions/health/index.ts` and `backend/functions/src/functions/health/ready.ts` asserts each contains `Cache-Control` paired with a value including `no-store`, and `Content-Type: application/json`.
- **D4 — deploy workflow matches Flex One Deploy posture.** Static-source scan of `.github/workflows/main_hb-intel-function-app.yml` asserts: contains `Azure/functions-action@v1`; does not contain `WEBSITE_RUN_FROM_PACKAGE`; stamps `HBC_FUNCTIONS_BUILD_VERSION`, `HBC_FUNCTIONS_BUILD_SHA`, `HBC_FUNCTIONS_BUILD_TIMESTAMP`; and wires `verify-functions-live-parity.ts` as the post-deploy parity probe.

### What is deliberately NOT changed

- No new fields on `/api/health` or `/api/health/ready`. Shape enforcement is done via tests and cache headers, not by adding `deploymentProofValid` booleans or similar. The user's prohibition against weakening the minimal anonymous surface is preserved.
- No changes to `scripts/package-functions-artifact.ts`, `.github/workflows/main_hb-intel-function-app.yml`, `infra/legacy-fallback-hosting.bicep`, `backend/functions/host.json`, `scripts/verify-functions-live-parity.ts`, or any telemetry emitter.

## Runbook and telemetry-reference additions

| Path | Purpose |
| --- | --- |
| `docs/maintenance/safety-ingest-triage-and-recovery-runbook.md` | Operator runbook with four proof paths (artifact drift, identity drift, graph grant failure, reporting-period / item binding failure). Inline `az` and Kusto commands, explicit exit criteria per path. |
| `docs/reference/developer/safety-ingest-telemetry-reference.md` | Stable reference catalog for Safety telemetry: event classes (grouped by lane), metrics, the `failureClass` / `authLane` / `causeBucket` enums, and retention assumptions. |

These are the canonical operator surfaces going forward. The runbook cites the reference for event-name shape; the reference cites the runbook for procedural triage.

## Residual operational gaps (not resolved in this closure)

- **Resource-name authority mismatch.** The deploy workflow targets `hb-intel-function-app`; IaC in `infra/legacy-fallback-hosting.bicep` provisions `func-hbintel-legacy-fallback-prod`. The runbook's artifact-drift path flags this for operator attention. Resolving whether the live resource adopts IaC, or IaC is extended to cover the live name, is an ops decision out of scope for this closure.
- **90-day default App Insights retention.** Not overridden in Bicep. Incidents requiring longer retention must export to Log Analytics within the 90-day window. Extending retention via Bicep is a follow-up.
- **No Log Analytics diagnostic-settings sink.** No declared sink in IaC or workflow. Adding one is a follow-up.
- **Sampling at 20 items/sec.** Could under-sample rare failure classes under bursty load. Adjustment is deferred until evidence warrants it.

## Proof-run evidence (local)

Commands and results at `@hbc/functions 00.000.148`:

| Step | Command | Result |
| --- | --- | --- |
| 1 | `cd backend/functions && pnpm exec vitest run --config vitest.config.ts --project unit deployment-proof` | **25 passed** (9 D1 + 8 D2 + 2 D3 + 6 D4) |
| 2 | `cd backend/functions && pnpm exec vitest run --config vitest.config.ts --project unit release-gates infra-readiness health safety-permission-call-surface backend-version` | **90 passed** |
| 3 | `cd backend/functions && pnpm exec vitest run --config vitest.config.ts --project unit safety-ingestion` | passed (104 tests) |
| 4 | `pnpm exec vitest run --no-coverage --config /dev/null scripts/verify-functions-live-parity.test.ts` | passed |
| 5 | `cd backend/functions && pnpm exec vitest run --config vitest.config.ts --project unit` | **2156 passed, 3 skipped** |

Declared scope: local unit-test proof. Post-deploy parity (`scripts/verify-functions-live-parity.ts`) is a live-host CI gate, not a local step.

## Out of scope

- IaC / Bicep changes (App Insights retention override, Log Analytics diagnostic-settings sink, resource-name reconciliation).
- Workflow changes (identity stamping is already a three-layer hard gate).
- Adding new fields to `/api/health` or `/api/health/ready` (would weaken the minimal anonymous surface).
- Generic docs churn (only the two targeted new docs are added; no unrelated doc edits).
- SPFx-client surface; feature-package SharePoint-adapter modifications.
- Operational Azure actions (MI rebind, per-site grants, env-var flips).
- Post-deploy smoke execution (requires live environment).

## Change set summary

**Ten files — six narrow edits and four new files.**

Narrow edits (six):
- `backend/functions/src/functions/health/index.ts` — add Cache-Control + Content-Type headers to the anonymous `/api/health` response.
- `backend/functions/src/functions/health/ready.ts` — same header addition to the admin-gated `/api/health/ready` response.
- `backend/functions/src/utils/backend-version.ts` — add `normalizeCommitSha` and `normalizeBuildTimestamp`; plug them into `resolveBackendArtifactIdentity()` so malformed inputs collapse to `"unknown"`.
- `backend/functions/src/utils/backend-version.test.ts` — swap the pre-existing `'deadbeef'` short-SHA fixture for a valid 40-char lowercase hex SHA so the "prefers env overrides" test documents the tight contract.
- `backend/functions/package.json` — bump `"version"` to `00.000.148`.
- `scripts/verify-functions-live-parity.test.ts` — bump BASE fixtures (`version` and `HBC_FUNCTIONS_BUILD_VERSION`) to `00.000.148`.

New files (four):
- `backend/functions/src/utils/deployment-proof.test.ts` — D1–D4 lock-in guards.
- `docs/maintenance/safety-ingest-triage-and-recovery-runbook.md` — operator runbook.
- `docs/reference/developer/safety-ingest-telemetry-reference.md` — telemetry catalog + retention assumptions.
- `docs/architecture/plans/MASTER/backend/phase-03/audit-reports/17-Deployment-Proof-And-Operator-Readiness.md` — this report.

The `backend-version.ts` and `backend-version.test.ts` edits are the documented execution-time shape-leak remediation (plan §11 constraint (b)): the pre-existing resolver allowed malformed env values (e.g., `'deadbeef'`) to pass through to the artifact identity surface; D1/D2 tightened the contract to "impossible to misread," and the pre-existing test was updated to match.
