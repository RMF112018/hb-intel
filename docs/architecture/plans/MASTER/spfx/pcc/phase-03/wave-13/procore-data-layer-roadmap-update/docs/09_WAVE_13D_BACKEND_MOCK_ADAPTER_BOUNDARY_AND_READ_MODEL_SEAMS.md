# Wave 13D — Backend Mock Adapter Boundary and Read-Model Seams

> Active execution authority. Backend `@hbc/functions` host changes only.
> Mock-only; GET-only; no live Procore HTTP, no SDK, no fetch / axios, no
> POST / PUT / PATCH / DELETE, no timers / queues, no secrets, no binary
> mirror. Reuses the existing read-model envelope keys
> `'procore-project-mapping'` (Wave 13B) and `'procore-sync-health'`
> (Wave 13C); no new envelope keys, no `@hbc/models` edits.

## 1. Authority

| Item                            | Value                                                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Active execution authority path | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/`         |
| Active execution authority wave | `wave-13`                                                                                             |
| Prior planning context (only)   | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-99-procore/` and its `_doc-updates/` subfolder |
| Prior planning context status   | `historical_context_only_non_authoritative`                                                           |

## 2. Objective

13D delivers the backend mock adapter boundary that downstream Wave 13E
SPFx surfaces and Wave 13F closeout will consume. Two new GET-only
routes wire the existing `'procore-project-mapping'` and
`'procore-sync-health'` envelope seams to the deterministic mock
provider. The mock provider mirrors the Wave 13 BuyoutLog precedent
exactly: three branches (known / unknown / backend-unavailable), four
local empty-payload variants (one source-unavailable + one
backend-unavailable per envelope), and full preservation of static
model context (registry field-name registry, query recommendations,
ownership-note literal, subject-area registry list, module identity)
in degraded payloads.

## 3. Files Changed

The authoritative file list is captured at commit time via
`git diff --cached --name-only`. The in-package scope is:

- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts` (additive interface methods + type imports)
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts` (additive method implementations + 4 local empty-variant constants + sample read-model imports)
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts` (additive 3-branch tests for each new method)
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts` (additive route registrations)
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts` (additive `EXPECTED_ROUTES` cascade + count update + Wave 13D GET-only path test)
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-route-guardrails.test.ts` (extends forbidden tokens with Procore runtime word-boundary regex set + sanity check that legitimate field identifiers are not blocked)
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/docs/09_WAVE_13D_BACKEND_MOCK_ADAPTER_BOUNDARY_AND_READ_MODEL_SEAMS.md` (this document)

## 4. Provider Interface Additions

`IPccReadModelProvider` (in `pcc-read-model-provider.ts`) gains two
async methods:

| Method                                                | Return type                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| `getProcoreProjectMapping(projectId, viewerPersona?)` | `Promise<PccReadModelEnvelope<PccProcoreProjectMappingReadModel>>` |
| `getProcoreSyncHealth(projectId, viewerPersona?)`     | `Promise<PccReadModelEnvelope<PccProcoreSyncHealthReadModel>>`     |

Both methods accept optional `viewerPersona`, mirroring every other
provider method on the interface. Route registration in 13D does NOT
plumb `viewerPersona` through; that decision is deferred to a future
prompt that needs persona-scoped envelopes.

## 5. Mock Provider Branches

For each new method the mock provider implements three branches in
this order, mirroring `getBuyoutLog`:

1. **Backend-unavailable** (constructor option `simulateBackendUnavailable: true`):
   - top-level envelope `sourceStatus: 'backend-unavailable'`,
   - one warning with `code: 'backend-unavailable'`, message `'Mock provider configured to simulate backend-unavailable.'`,
   - `data` is the local `*_BACKEND_UNAVAILABLE` empty variant; `data.sourcePosture.sourceStatus === 'backend-unavailable'`.
2. **Unknown project** (`projectId` not present in `knownProjects`):
   - top-level envelope `sourceStatus: 'source-unavailable'`,
   - one warning with `code: 'source-unavailable'`, message containing the unknown projectId, `source: 'pcc-mock-fixtures'`,
   - `data` is the local empty variant; `data.sourcePosture.sourceStatus === 'source-unavailable'`.
3. **Known project** (`fixture-pcc-project-001`, `fixture-pcc-project-002`):
   - top-level envelope `sourceStatus: 'available'`, zero warnings,
   - `data` is the canonical sample read model from `@hbc/models/pcc` (`SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL` / `SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL`); `data.sourcePosture.sourceStatus === 'available'`.

## 6. Empty Payload Variants

Local to `pcc-mock-read-model-provider.ts`. Static context is preserved
on every degraded variant; only project-specific arrays are emptied and
`pendingHumanReviewCount` is zeroed.

| Variant                                                        | Preserves                                                                            | Empties                                                                                    | sourceStatus          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------- |
| `EMPTY_PROCORE_PROJECT_MAPPING_READ_MODEL`                     | module identity, registry field-name registry, query recommendations, ownership note | `mappings`, `registryContexts`                                                             | `source-unavailable`  |
| `EMPTY_PROCORE_PROJECT_MAPPING_READ_MODEL_BACKEND_UNAVAILABLE` | (same)                                                                               | (same)                                                                                     | `backend-unavailable` |
| `EMPTY_PROCORE_SYNC_HEALTH_READ_MODEL`                         | module identity, subject-area registry list, ownership note                          | `syncHealthEntries`, `sourceLineages`, `objectLinks`, `curatedSummaries`, `derivedSignals` | `source-unavailable`  |
| `EMPTY_PROCORE_SYNC_HEALTH_READ_MODEL_BACKEND_UNAVAILABLE`     | (same)                                                                               | (same)                                                                                     | `backend-unavailable` |

## 7. Routes (GET-only)

Two new routes registered via the existing `registerPccReadRoute(...)`
helper in `pcc-read-model-routes.ts`:

| Function name                 | Route path                                         | Method | Provider call                                  |
| ----------------------------- | -------------------------------------------------- | ------ | ---------------------------------------------- |
| `getPccProcoreProjectMapping` | `pcc/projects/{projectId}/procore-project-mapping` | `GET`  | `provider.getProcoreProjectMapping(projectId)` |
| `getPccProcoreSyncHealth`     | `pcc/projects/{projectId}/procore-sync-health`     | `GET`  | `provider.getProcoreSyncHealth(projectId)`     |

Routes inherit the existing host middleware stack (`withAuth` →
`withTelemetry` → error handler) and the canonical `successResponse` /
`errorResponse` envelope wrappers. No POST / PUT / PATCH / DELETE; no
timers / queues; no fetch / axios.

## 8. Routes Test Cascade

`pcc-read-model-routes.test.ts` is updated additively:

- Mock provider object gains `getProcoreProjectMapping: vi.fn()` and `getProcoreSyncHealth: vi.fn()`.
- `EXPECTED_ROUTES` array gains the two new entries (kebab-case path, GET method).
- The "registers exactly the canonical route handlers" assertion bumps from `21` to `23`.
- A new `it` block asserts both 13D paths are single GET-only registrations and reject all write methods (POST / PUT / PATCH / DELETE), mirroring the Wave 10 / 11 / 12 / 13 path-specific tests already in the file.

## 9. Route Guardrails Extension

`pcc-read-model-route-guardrails.test.ts` adds a separate
word-boundary regex set:

```
/\bprocoreSdk\b/
/\bprocoreClient\b/
/\bprocoreFetch\b/
/\bprocoreApiCall\b/
/\bprocoreAuth\b/
```

These are matched after comments and string literals are stripped, so:

- A new `it` block fails if any of these tokens appear as an identifier in stripped source.
- A sibling sanity-check `it` block proves the regexes do **not** match legitimate identifiers used by 13B/13C contracts (`procoreCompanyId`, `procoreObjectId`, `procoreProjectId`).

## 10. Validation

Per the active package's `validation_gates.json` and the prompt:

- `git status --short` (pre and post)
- `md5 pnpm-lock.yaml` (pre and post; expected unchanged at `c56df7b79986896624536aab74d609f4`)
- `pnpm --filter @hbc/functions check-types`
- `pnpm --filter @hbc/functions test`
- `pnpm exec prettier --check` on every touched file
- `git diff --check`

## 11. Guardrails Preserved

- No live Procore HTTP, no SDK adoption, no `axios` / `node-fetch` / `fetch(` / `process.env` references in new backend code.
- No POST / PUT / PATCH / DELETE routes; the routes test enforces GET-only.
- No timers, queues, schedulers, or retry loops introduced.
- No `apps/**`, no other backend hosts (admin-control-plane, safety-ingestion, graph-data-plane, etc.).
- No `@hbc/models` edits — the 13B / 13C contracts and `PccReadModelResponseMap` keys are reused as-is.
- No `package.json`, `pnpm-lock.yaml`, SPFx manifest, tenant / deployment file, CI file, or workflow file.
- No SPFx 4-part manifest version bump — no SPFx manifest is touched.
- No `docs/architecture/blueprint/**` edits — deferred to 13F.
- No historical `wave-99-procore/**` artifacts modified.

## 12. Residual Risk

- Hosted / tenant / browser proof: not applicable. 13D is a backend
  mock-only deliverable; per-package validation
  (`@hbc/functions check-types` + `test`) is the appropriate truth set.
  No live endpoints are introduced.
- Blueprint authority updates (System_of_Record_Matrix and
  HB Project Control Center Target Architecture Blueprint references
  to Procore data-layer routes) are **deferred to 13F**.
