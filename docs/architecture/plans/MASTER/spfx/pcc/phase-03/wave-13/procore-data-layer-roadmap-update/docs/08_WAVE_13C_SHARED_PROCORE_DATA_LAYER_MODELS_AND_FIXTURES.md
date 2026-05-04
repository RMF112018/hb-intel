# Wave 13C — Shared Procore Data Layer Models and Fixtures

> Active execution authority. Models / fixtures / docs only. No runtime
> source change. No backend routes, no SPFx clients, no fetch calls, no
> mounted surfaces, no route constants. The read-model envelope key
> `'procore-sync-health'` is added as a typed FUTURE SEAM only.

## 1. Authority

| Item                            | Value                                                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Active execution authority path | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/`         |
| Active execution authority wave | `wave-13`                                                                                             |
| Prior planning context (only)   | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-99-procore/` and its `_doc-updates/` subfolder |
| Prior planning context status   | `historical_context_only_non_authoritative`                                                           |

## 2. Objective

13C delivers the cross-cutting shared Procore data-layer foundation
consumed by Wave 4-13 modules and the future Wave 13D backend mock
provider. The canonical contract list lives in the historical
`wave-99-procore/artifacts/model_contract_requirements.json` and is
treated here as a reconciled source input only. Wave 13B already
delivered the `PccProcoreProjectMapping` contract; 13C delivers the
remaining seven contracts plus the five spec-named pure helpers.

## 3. Files Changed

The authoritative file list is captured at commit time via
`git diff --cached --name-only` and `git diff --cached --stat`. The
in-package scope is:

- `packages/models/src/pcc/PccProcoreDataLayer.ts` (new)
- `packages/models/src/pcc/PccProcoreDataLayer.test.ts` (new)
- `packages/models/src/pcc/fixtures/procoreDataLayer.ts` (new)
- `packages/models/src/pcc/index.ts` (additive barrel re-export)
- `packages/models/src/pcc/PccReadModels.ts` (additive `'procore-sync-health'` typed envelope key)
- `packages/models/src/pcc/PccReadModels.test.ts` (additive cascade for the response-map literal)
- `packages/models/src/pcc/NoMutationGuard.test.ts` (allowlist for the five new pure helpers)
- `packages/models/src/pcc/fixtures/index.ts` (barrel re-export + `procoreDataLayer` group on `PCC_FIXTURES`)
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/docs/08_WAVE_13C_SHARED_PROCORE_DATA_LAYER_MODELS_AND_FIXTURES.md` (this document)

## 4. Subject-Area Registry (18)

`PCC_PROCORE_SUBJECT_AREA_REGISTRY` covers all 18 required subject areas:

| Id               | Classification      | Notes                                                                                             |
| ---------------- | ------------------- | ------------------------------------------------------------------------------------------------- |
| `projects`       | general             | Project mapping authority lives in Wave 13B `PccProcoreProjectMapping`.                           |
| `companies`      | directory           | Read-only mirror.                                                                                 |
| `directories`    | directory           | Compared against PCC team-access; PCC never auto-grants SharePoint access from this surface.      |
| `rfis`           | general             | Read-only mirror.                                                                                 |
| `submittals`     | general             | Read-only mirror.                                                                                 |
| `observations`   | general             | Read-only mirror.                                                                                 |
| `punch`          | general             | Read-only mirror.                                                                                 |
| `daily-logs`     | general             | Read-only mirror.                                                                                 |
| `drawings`       | evidence            | Metadata + object links only. No binary mirror.                                                   |
| `specifications` | evidence            | Metadata + object links only. No binary mirror.                                                   |
| `photos`         | evidence            | Metadata + object links only. No binary mirror.                                                   |
| `inspections`    | inspection-record   | Procore inspections remain Procore-owned; PCC retains permit / required-inspection log ownership. |
| `documents`      | evidence            | Metadata + object links only. No binary mirror.                                                   |
| `commitments`    | financial-reference | Reference / exposure only. **Not accounting truth.**                                              |
| `change-events`  | financial-reference | Reference / exposure only. **Not accounting truth.**                                              |
| `change-orders`  | financial-reference | Reference / exposure only. **Not accounting truth.**                                              |
| `vendors`        | directory           | Read-only mirror.                                                                                 |
| `budget`         | financial-reference | **Reference / exposure only.** Never accounting truth; never derives payment / posting outcomes.  |

Every entry declares `writebackAllowed: false` and a `writePosture` of
either `'blocked'` or `'not-authorized'`. PCC never writes back into
Procore in MVP.

## 5. Source-State Vocabulary

`PCC_PROCORE_SOURCE_STATES` covers the happy path plus 9 degraded modes
required by the prompt:

`available | mapping-missing | permission-denied | tool-disabled | stale | rate-limited | endpoint-deprecated | object-inaccessible | backend-unavailable | source-unavailable`.

`PCC_PROCORE_SYNC_STATES` covers the lifecycle of a sync attempt:

`never-synced | syncing | synced-fresh | synced-stale | sync-degraded | sync-failed | sync-disabled`.

## 6. Freshness Bands

`PCC_PROCORE_FRESHNESS_BANDS` is a re-export of Wave 13B's
`PCC_PROCORE_PROJECT_MAPPING_FRESHNESS_BANDS` to avoid duplicate
vocabulary. `PccProcoreFreshnessBand` aliases
`PccProcoreProjectMappingFreshnessBand`. The generic helper
`deriveProcoreFreshnessBand(nowUtc, lastIngestedAtUtc, bounds?)` is a
pure thin wrapper that delegates to the 13B helper; tests prove parity
across boundary timestamps.

## 7. Source Lineage, Object Links, Curated Summaries

- `PccProcoreSourceLineage` carries `subjectArea`, `procoreCompanyId`,
  `procoreObjectId`, `procoreObjectType`, `capturedAtUtc`,
  `refreshTrigger`, optional `sourceEndpointVersion` and
  `owningProvider`.
- `PccProcoreObjectLink` requires a `sourceLineage` and exposes a
  deterministic `dedupeKey` produced by
  `buildProcoreObjectLinkDedupeKey(subjectArea, procoreCompanyId, procoreObjectId, procoreObjectKey?)`.
- `PccProcoreCuratedSummary` requires a `sourceLineage` and references
  an `objectLinkId`.
- Refresh triggers (`PCC_PROCORE_SOURCE_REFRESH_TRIGGERS`):
  `manual | scheduled | on-mapping-confirmed | on-priority-action-eval | on-readiness-eval`.

Tests prove that every fixture object link, curated summary, derived
signal, and HBI-grounding-citation entry carries a non-empty source
lineage.

## 8. Derived Signal Categories (11)

`PCC_PROCORE_DERIVED_SIGNAL_CATEGORIES` covers the 11 cross-module
families required by the prompt:

`priority-action | readiness-impact | risk-exposure-signal | workflow-ball-in-court | evidence-link | document-currency-signal | financial-exposure-signal | quality-safety-exception | field-execution-gap | subcontractor-performance-signal | hbi-grounding-citation`.

`PCC_PROCORE_DERIVED_SIGNAL_KINDS` lists 16 specific signal kinds; each
maps to exactly one category through
`PCC_PROCORE_DERIVED_SIGNAL_KIND_TO_CATEGORY`. Severity vocabulary is
`info | attention | critical`; only `attention` and `critical` signals
with a valid source lineage are actionable per
`isProcoreSignalActionable`.

The fixture set exercises every category with at least one entry.
HBI-grounding citations carry a required `hbiGroundingCitationId` plus
the standard source lineage.

## 9. Sync-Health Read-Model Envelope (Typed Future Seam Only)

`PccReadModelResponseMap['procore-sync-health']` is added as a typed
future seam:

- No backend route is registered.
- No SPFx client is added.
- No `fetch` is introduced.
- No mounted PCC surface is created.
- No route constant is exposed.

The envelope payload `PccProcoreSyncHealthReadModel` aggregates module
identity, subject-area registry snapshot, per-area sync-health entries,
source lineages, object links, curated summaries, derived signals, an
ownership-note string literal, and a source posture. 13D will decide
whether to wire a backend mock provider against this envelope; 13E
will decide whether and how a SPFx surface consumes it.

## 10. Pure Helpers (5)

Per the spec:

| Helper                                    | Purpose                                                                                 |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `deriveProcoreFreshnessBand`              | Generic freshness-band wrapper over the 13B helper. Caller-supplied `nowUtc`.           |
| `isProcoreSignalActionable`               | Predicate: severity in {attention, critical} AND source lineage has structured ids.     |
| `buildProcoreObjectLinkDedupeKey`         | Deterministic dedupe key for object links (subjectArea + companyId + objectId + key?).  |
| `mapProcoreSourceStatusToPccPreviewState` | Total mapping `PccProcoreSourceState` → existing `PccReadModelSourceStatus`.            |
| `redactProcoreSyncErrorMessage`           | Defense-in-depth display / fixture-safety helper. Strips URLs, UPNs, and key fragments. |

`redactProcoreSyncErrorMessage` is a display / fixture-safety helper
**only**. Normal Procore data flow does not contain secrets, UPNs, or
live URLs — provider error strings should already be sanitized at the
ingestion boundary. The helper exists to backstop fixture safety and
accidental display of unsanitized provider strings; its existence does
not imply secrets are normal data.

All five helpers use no anchored mutation-verb prefixes (no `write`,
`sync`, `execute`, `apply`, `repair`, `upload`, `delete`, `mutate`, or
`fetch` start). All are added to the `NoMutationGuard` allowlist.

## 11. Validation

Per the active package's `validation_gates.json`:

- `git status --short` (pre and post)
- `md5 pnpm-lock.yaml` (pre and post; expected unchanged at `c56df7b79986896624536aab74d609f4`)
- `pnpm --filter @hbc/models check-types`
- `pnpm --filter @hbc/models test`
- `pnpm --filter @hbc/models build`
- `pnpm exec prettier --check` on every touched Markdown / TypeScript file
- `git diff --check`

## 12. Guardrails Preserved

- No live Procore HTTP, no SDK adoption, no write-back, no Sage posting.
- No SPFx-to-Procore direct path.
- No `package.json`, `pnpm-lock.yaml`, SPFx manifest, backend route,
  SPFx surface, tenant / deployment file, CI file, or historical
  `wave-99-procore/**` artifact modified.
- No blueprint authority docs edited (deferred to 13F).
- Wave 13B `PccProcoreProjectMapping*` types are unchanged (13C imports
  the 13B freshness vocabulary and helper; never mutates 13B).
- All helpers are pure and deterministic; clocks are caller-supplied
  via `Date` parameters, never read from `Date.now()`.
- Fixtures use deterministic IDs, fixed ISO timestamps, only
  `https://example.invalid` URLs, and only `@example.com` UPNs.

## 13. Residual Risk

- Hosted / tenant / browser proof: not applicable (model contracts only).
- Blueprint authority updates (System_of_Record_Matrix § Procore subject-area
  ownership; HB Project Control Center Target Architecture Blueprint § Project
  Procore Mapping; integrations.schema.json / integrations.fields.json) are
  **deferred to 13F**.
