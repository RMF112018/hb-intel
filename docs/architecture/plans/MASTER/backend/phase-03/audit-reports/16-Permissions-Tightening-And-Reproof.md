# 16 — Safety Backend Permission Tightening and Re-Proof

## Scope & conclusion

The Safety application-facing backend moves from a broad staging/test Graph permission posture (relying on `Sites.FullControl.All`) to a deliberate **pre-rollout-tightened / steady-state** posture (`Sites.Selected` + per-site grants on `SAFETY_SITE_URL` and `HBCENTRAL_SITE_URL`, plus `Group.ReadWrite.All` for off-hot-path provisioning only).

The permission-posture matrix, validator, proof-bundle enforcement, and rollout gate were already in place in `backend/functions/src/utils/safety-permission-posture.ts`, `rollout-permission-inventory.ts`, `diagnose-permissions.ts`, and surfaced via `/api/health/ready`. This closure does NOT change that architecture. It adds machine-checked lock-in guards so the tightened posture cannot silently drift — either at the matrix level, at the effective Graph call-surface level, or at the per-site grant level — and publishes the before/after permission inventory with local proof-run evidence and the residual operational-step catalog.

Closure stamped as `@hbc/functions 00.000.147`.

## Before inventory

Staging/test posture as actually granted today.

| Permission | Type | Scope | Exercised on hot path? |
| --- | --- | --- | --- |
| `Sites.FullControl.All` | Application (app-only) | Tenant-wide | Convenient only; works but overreaches |
| `Group.ReadWrite.All` | Application | Tenant-wide | No — provisioning control-plane (off-hot-path) |

## After inventory (rollout-safe required set)

Required for `pre-rollout-tightened` and `steady-state` postures.

| Permission | Type | Scope | Required for | Notes |
| --- | --- | --- | --- | --- |
| `Sites.Selected` | Application (app-only) | Per-site — **`SAFETY_SITE_URL`** and **`HBCENTRAL_SITE_URL`** | All Safety ingest / preview / replay hot-path Graph reads and writes | Each site granted via `POST /sites/{siteId}/permissions` with the `write` role for the Managed Identity. `Sites.FullControl.All` is explicitly forbidden by the matrix. |
| `Group.ReadWrite.All` | Application | Tenant-wide | Provisioning saga Step 6 only (Entra security groups); off-hot-path | Gated behind `GRAPH_GROUP_PERMISSION_CONFIRMED=true`. No narrower app-only role covers the Entra group lifecycle; narrowing further is out of scope for this closure. |

## Forbidden for rollout

Must be absent from the Managed Identity in production.

- `Sites.FullControl.All`
- `Sites.Manage.All`
- `Sites.ReadWrite.All` (tenant-wide — superseded by `Sites.Selected` + per-site grants)
- `Files.ReadWrite.All` (not needed; Safety file I/O routes through `/sites/{siteId}/lists/{listId}/drive/…`)

## Guard catalog

Two call-surface categories are scanned. **The off-hot-path shared Graph client is NOT reclassified as a Safety hot-path file by this closure**; its Prompt-01 isolation classification is preserved. It is scanned only because broader Graph request shapes introduced in a shared Graph client are a latent risk for the tightened posture.

| Category | File(s) | Guard IDs |
| --- | --- | --- |
| Safety hot-path Graph data plane | `backend/functions/src/services/safety-ingestion-graph-data-plane.ts` | S1, S2 |
| Shared off-hot-path Graph client (scanned for permission-surface drift; NOT a hot-path reclassification — see closure report 15) | `backend/functions/src/services/legacy-fallback/graph-list-client.ts` | S1, S2 |
| Permission matrix drift | `backend/functions/src/utils/safety-permission-posture.ts` (`SAFETY_PERMISSION_MATRIX`) | M1, M2, M3 |
| Per-site grant inventory | `packages/features/safety/src/lists/descriptors.ts`, `backend/functions/src/config/safety-record-keeping-list-definitions.ts` | G1, G2 |

### Guard meanings

- **S1** — each scoped file contains at least one `/sites/` reference (self-diagnostic: catches a file move/rename that would quietly disable the guard).
- **S2** — each scoped file's raw source must not contain any of eleven forbidden request-path shapes, anchored with a path-boundary / string-assembly prefix: `/sites?…`, `/sites/root/…`, `/sites/getAllSites`, `/sites/delta`, `/users`, `/groups`, `/drives`, `/me`, `/applications`, `/directoryObjects`, `/organization`. Any of these would require a broader permission than `Sites.Selected`.
- **M1** — `Sites.Selected` is `required` for both `preRollout` and `steadyState`.
- **M2** — `Sites.FullControl.All` is `forbidden` for both `preRollout` and `steadyState`.
- **M3** — no matrix entry matching `/^Sites\.(Manage|ReadWrite|FullControl)\.All$/` may be `required` for either rollout tier.
- **G1** — `SAFETY_SITE_URL` and `HBCENTRAL_SITE_URL` are non-empty, distinct strings.
- **G2** — the distinct `siteUrl` set across `SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS` is exactly `{SAFETY_SITE_URL, HBCENTRAL_SITE_URL}`. A third site entering the hot path must update both this guard and the operational per-site grant workflow.

### What S2 actually covers

S2 protects the **effective Graph request-path surface** in the scoped files across every expression form: plain string literals, template literals, helper / module-level constants that assemble request paths, and concatenated or interpolated path segments. It does this by matching path-boundary-anchored forbidden-shape regular expressions against the raw source text — not just against quoted URL literals. Because any of those expression forms must still emit the forbidden substring verbatim somewhere in the source, all forms are caught. The path-boundary prefix (`/`, `'`, `"`, `` ` ``, `+`, `$`, `{`, `(`, `[`, `,`, `:`, `;`, `=`, or start-of-line after whitespace) avoids false positives on ordinary identifiers or comment words like `siteUrl`, `userId`, or `driveItem`.

## Proof-run evidence (local)

Commands and results executed against the tightened guard set at `@hbc/functions 00.000.147`:

| Step | Command | Result |
| --- | --- | --- |
| 1 | `cd backend/functions && pnpm exec vitest run --config vitest.config.ts --project unit safety-permission-call-surface` | **29 passed** (11 S2 × 2 files + 2 S1 + 3 M + 2 G) |
| 2 | `cd backend/functions && pnpm exec vitest run --config vitest.config.ts --project unit safety-permission-posture safety-rollout-readiness diagnose-permissions release-gates` | **66 passed** |
| 3 | `cd backend/functions && pnpm exec vitest run --config vitest.config.ts --project unit safety-ingestion` | **104 passed** |
| 4 | `pnpm exec vitest run --no-coverage --config /dev/null scripts/verify-functions-live-parity.test.ts` | **9 passed** |
| 5 | `cd backend/functions && pnpm exec vitest run --config vitest.config.ts --project unit` | **2131 passed, 3 skipped (pre-existing)** |

Declared scope: local unit-test proof — sufficient for matrix, call-surface, and site-grant invariants. **Not a substitute for live post-deploy smoke**, which requires a deployed staging environment and is catalogued as a residual operational step below.

## Residual operational steps (outside the repo, before rollout)

1. Remove `Sites.FullControl.All` from the Managed Identity's Graph app-role assignments if present in the target environment.
2. Ensure `Sites.Selected` and `Group.ReadWrite.All` are present on the Managed Identity (admin-consented).
3. Grant the Managed Identity the `write` role on both `SAFETY_SITE_URL` and `HBCENTRAL_SITE_URL` via `tools/grant-site-access.sh` (or the equivalent `POST /sites/{siteId}/permissions` Graph call).
4. Set the following Azure App Settings on the deployed function app:
   - `SITES_PERMISSION_MODEL=sites-selected`
   - `SITES_SELECTED_GRANT_CONFIRMED=true`
   - `GRAPH_GROUP_PERMISSION_CONFIRMED=true`
   - `SAFETY_PERMISSION_POSTURE=pre-rollout-tightened` (or `steady-state` once rollout is signed off and the proof age is within the 30-day window enforced by `SAFETY_TIGHTENED_PROOF_MAX_AGE_DAYS`)
   - `SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED=true`
   - `SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED=true`
   - `SAFETY_TIGHTENED_PROOF_EVIDENCE_ID=<immutable run id>`
   - `SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC=<ISO-8601 UTC>`
   - `SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL=sites-selected`
   - `SAFETY_ROLLOUT_GATE_ENABLED=true`
   - `SAFETY_ROLLOUT_CHECKPOINT_ID=<matches SAFETY_ROLLOUT_CHECKPOINT_ID_PATTERN>`
   - Optional: `SAFETY_ROLLOUT_GATE_EXPIRES_AT_UTC=<ISO-8601 UTC>`
5. Run the post-deploy smoke / e2e suite against staging under the tightened posture; record the run in the proof-evidence record referenced by `SAFETY_TIGHTENED_PROOF_EVIDENCE_ID`.
6. Query `/api/health/ready` with an admin token; confirm `safetyPermissionPosture.passed === true`, `safetyRolloutReadiness.gate.passed === true`, and `rolloutPermissionInventory` matches the tightened required set.

## Out of scope

- IaC / Bicep automation for Graph grants (currently manual; tracked as a follow-up).
- SPFx-client surface.
- Feature-package SharePoint-adapter modifications.
- Reclassification of `legacy-fallback/*` ownership or dependency posture. The Prompt-01 closure (report 15) classification stands.
- Post-deploy smoke execution (requires live env).

## Accepted residual risk

- A new Graph-calling file outside `safety-ingestion-graph-data-plane.ts` and `legacy-fallback/graph-list-client.ts` could introduce a broader shape. Mitigation today is review discipline; deferred remediation is a repo-wide call-surface scan or eslint restriction on Graph client usage.
- `Group.ReadWrite.All` remains tenant-wide because no narrower app-only role covers the Entra group lifecycle the provisioning saga needs.

## Version-stamp verification

Confirmed at closure time that `backend/functions/package.json` remains the single true source for `SAFETY_INGESTION_BACKEND_VERSION`: `backend/functions/src/utils/backend-version.ts` → `HBC_FUNCTIONS_BUILD_VERSION` env (CI-stamped) else `@hbc/functions/package.json`. CI workflow `main_hb-intel-function-app.yml` derives the env from `needs.build.outputs.package-version`, itself derived from `package.json`. Coordinated bump applied to `backend/functions/package.json` and `scripts/verify-functions-live-parity.test.ts` fixtures.
