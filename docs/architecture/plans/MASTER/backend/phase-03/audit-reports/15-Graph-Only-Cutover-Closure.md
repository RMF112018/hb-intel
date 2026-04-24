# 15 — Graph-Only Application-Facing Cutover Closure (Safety Backend)

## Scope & conclusion

The Safety application-facing **backend** ingest/preview/replay hot paths are Graph-only and locked in as of `@hbc/functions 00.000.146`. Enforcement is strict: every declared hot-path file is guarded against `@pnp/*` imports in every form (ESM static, dynamic `import()`, CommonJS `require`, `require.resolve`), SharePoint REST `/_api/` URLs, imports of isolated non-Graph seams, and PnP-behavior registration symbols. The HTTP route edge and the `SharePointService` facade are guarded together so the routes cannot bypass the application service by wiring directly into lower-level Graph seams.

## Hot-path inventory (closed)

| File | Role |
| --- | --- |
| `backend/functions/src/services/safety-ingestion-application-service.ts` | Orchestrates ingest / preview / replay |
| `backend/functions/src/services/safety-ingestion-graph-repository.ts` | Graph repository (ETag, overlay, pipeline) |
| `backend/functions/src/services/safety-ingestion-graph-data-plane.ts` | Graph HTTP layer |
| `backend/functions/src/services/graph-list-discovery-service.ts` | List GUID resolution via Graph |
| `backend/functions/src/services/safety-ingestion-preview-evaluator.ts` | Parser-authoritative preview gate |

The HTTP route file `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts` is the edge feeding this hot path and is guarded by A6.1. The facade `backend/functions/src/services/sharepoint-service.ts` delegates ingest/preview/replay to the application service and is guarded by A6.2.

## Isolated non-Graph seam inventory (quarantined)

All seams below may remain in the repository but must not be imported by any hot-path file or the route file.

| Seam | Role | May re-enter hot path? |
| --- | --- | --- |
| `sharepoint-provisioning-service.ts` | Provisioning control-plane | No |
| `legacy-fallback/review-repository.ts` | Read-only legacy project discovery | No |
| `project-requests-repository.ts` | Read-only project enrichment | No |
| `viewer-groups-repository.ts` | Read-only access-group lookup | No |
| `acknowledgment-service.ts` | Ack tracking list | No |
| `sharepoint-common.ts` | PnP `spfi`/auth helpers + re-exports of pure identity utils | No (pure utils now live in `sharepoint-identity-utils.ts`; hot path uses that module instead) |
| `managed-identity-token-service.ts` | MI token + Graph scope | Graph scope path only; PnP-behavior registration symbols banned from the hot path by A4 |

## Out of scope

`packages/features/safety/src/adapters/sharepoint/*` is the SPFx **client** adapter surface, exported from `packages/features/safety/src/index.ts` and consumed by `@hbc/spfx-safety`. It is not imported by the backend hot paths and is not governed by this closure.

## Regression guards

All pre-existing cutover assertions remain in place and continue to run. The new lock-in `describe` block (`Safety ingestion cutover guard — static import/seam invariants (lock-in)`) adds the following:

| Assertion | Scope | Rationale |
| --- | --- | --- |
| A1 | Every hot-path file | Bans `@pnp/*` imports in every form: `from '@pnp/…'`, `import('@pnp/…')`, `require('@pnp/…')`, `require.resolve('@pnp/…')`. Closes ESM, dynamic, and CJS backdoors. |
| A2 | Every hot-path file | Bans any `/_api/` URL. Broader than the legacy `/_api/web/lists` check, which remains for continuity. |
| A3 | Every hot-path file | Bans static, dynamic, and require-style imports of each isolated seam specifier listed above. |
| A4 | Every hot-path file | Bans PnP-behavior registration symbols (`registerPnP`, `pnpBehavior`, `PnpBehavior`, `SPBehavior`, `GraphBehavior`). Prevents backdoor PnP re-entry via the token service or any helper. |
| A5 | Application service | Asserts retention of `this.repositoryFactory(`, `evaluatePreviewAndLog`, `SAFETY_INGESTION_COMMIT_NOT_READY`, and the managed-identity token surface required for Graph-scope acquisition. |
| A6.1 | Route file | Routes must import `SafetyIngestionApplicationService` or `SharePointService` (facade) and must not import `@pnp/*`, any isolated seam, any lower-level Graph seam (`safety-ingestion-graph-repository`, `safety-ingestion-graph-data-plane`, `graph-list-discovery-service`), or contain any `/_api/` URL. |
| A6.2 | Facade file | `sharepoint-service.ts` must import `SafetyIngestionApplicationService` and its `ingestSafetyWorkbook`, `replaySafetyWorkbook`, and `previewSafetyWorkbook` method bodies must each delegate via `this.ingestion.`. Prevents a silent severing of the route → facade → application-service chain. |

## Version-stamp verification outcome

Verified at execution time on 2026-04-24. Derivation path:

- `backend/functions/src/services/safety-ingestion-telemetry.ts` exports `SAFETY_INGESTION_BACKEND_VERSION = resolveBackendArtifactIdentity().version`.
- `backend/functions/src/utils/backend-version.ts` → `resolveBackendArtifactIdentity()` reads `process.env.HBC_FUNCTIONS_BUILD_VERSION` else `@hbc/functions/package.json` version.
- `.github/workflows/main_hb-intel-function-app.yml` sets `HBC_FUNCTIONS_BUILD_VERSION` from `needs.build.outputs.package-version`, which is derived from `backend/functions/package.json` by the build job.

Conclusion: `backend/functions/package.json` is the single true source. Coordinated bump applied to `backend/functions/package.json` and `scripts/verify-functions-live-parity.test.ts` fixtures. No other file encodes the version.

## Execution-time plan refinements (authorized under plan §10.b and specifier refinements)

The following refinements were made during execution to satisfy the strict guard set without expanding scope beyond the approved plan’s authorization:

1. **Pure-helper extraction (plan §10.b: minimum-necessary import removal).** `sharepoint-common.ts` imports `@pnp/sp` and `@pnp/nodejs-commonjs` as top-level side-effect imports; importing any symbol from it pulls PnP wiring into the importer's module graph. The application service was importing the pure helper `toProvisioningErrorCode` from `sharepoint-common`. To remove the latent PnP pull-in while preserving behavior:
   - Created `backend/functions/src/services/sharepoint-identity-utils.ts` containing the pure identity/error utilities (`normalizeSiteUrl`, `normalizeGuid`, `normalizeSeedDate`, `isNotFoundError`, `toProvisioningErrorCode`). The module has zero `@pnp/*` imports and uses structural detection (`name === 'SharePointTokenAcquisitionError'`) to stay import-sink clean.
   - `sharepoint-common.ts` now re-exports these pure helpers from the new file and retains the PnP-bound helpers (`getPnPContext`, `waitForSite`). Existing callers that already relied on `sharepoint-common` for pure helpers remain green through back-compat re-exports; non-hot-path callers were not modified.
   - `safety-ingestion-application-service.ts` now imports `toProvisioningErrorCode` from `./sharepoint-identity-utils.js` directly.

2. **Isolated-seam specifier narrowing.** The plan listed `./legacy-fallback/` as a ban substring. Execution revealed that `backend/functions/src/services/legacy-fallback/graph-list-client.ts` is Graph-native (uses `DefaultAzureCredential` + native fetch + `https://graph.microsoft.com/v1.0`; no PnP, no `/_api/`) and is legitimately imported by the hot-path file `graph-list-discovery-service.ts`. Only `legacy-fallback/review-repository.ts` carries a live `@pnp/*` import. The specifier was therefore narrowed to `./legacy-fallback/review-repository` so A3 does not fire on the legitimate Graph import.

3. **A6 split (route layer vs. facade delegation).** The plan required A6 to directly assert that the route file imports `SafetyIngestionApplicationService`. The current architecture routes via the `SharePointService` facade, which itself imports and delegates to the application service. To faithfully enforce the invariant ("routes must reach ingest/preview/replay only through the application service") without forcing a structural refactor out of scope:
   - **A6.1 (routes):** routes must import the application service or the facade, and must not import `@pnp/*`, any isolated seam, any lower-level Graph seam, or contain any `/_api/` URL. This guarantees the routes are on the approved edge.
   - **A6.2 (facade delegation):** `sharepoint-service.ts` must import `SafetyIngestionApplicationService` and each of its three ingestion methods (`ingestSafetyWorkbook`, `replaySafetyWorkbook`, `previewSafetyWorkbook`) must delegate to the application service via `this.ingestion.`. This guarantees the facade cannot be quietly severed from the application service, closing the chain end-to-end.

## Verification commands

Run in order, smallest credible set per `docs/reference/developer/verification-commands.md`:

1. Cutover guard in isolation: `npm --workspace backend/functions test -- safety-ingestion-cutover-guard.test.ts`
2. Adjacent ingestion unit tests: `npm --workspace backend/functions test -- safety-ingestion`
3. Parity fixture test: `npm test -- scripts/verify-functions-live-parity.test.ts`
4. Backend unit project: `npm --workspace backend/functions test`

## Accepted residual risk and follow-up

A contributor could introduce PnP or REST usage in a *new* file not in the declared hot-path inventory. Today's mitigation is review discipline; the facade delegation assertion A6.2 closes the most likely silent-bypass vector (route → facade → application service chain). Deferred full remediation: a repo-wide eslint baseline with `no-restricted-imports` scoped to the backend/functions Safety ingestion surface. Not required for this closure.
