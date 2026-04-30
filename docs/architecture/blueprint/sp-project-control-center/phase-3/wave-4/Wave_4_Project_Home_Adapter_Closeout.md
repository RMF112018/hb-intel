# Phase 3 / Wave 4 — Prompt 04 Closeout — Project Home Read-Model Adapter and State Mapping

**Classification:** Canonical Normative Plan (prompt closeout, active wave).
**Audited HEAD before commit:** `c098b5e3c` (Wave 4 Prompt 03 commit).
**Wave:** Phase 3 / Wave 4 — Project Home / Command Center backend integration.
**Companion:** `Wave_4_Scope_Lock.md`, `Wave_4_Open_Decisions.md`, `Wave_4_SPFX_Mode_Contract_Closeout.md`, `Wave_4_Backend_HTTP_Client_Closeout.md`.

---

## Files changed

| Status | Path | Notes |
| --- | --- | --- |
| `A` | `apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts` | View-model contract types. |
| `A` | `apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.ts` | Pure envelope→view-model adapter. |
| `A` | `apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.test.ts` | Adapter tests covering all 7 source statuses, mixed envelope statuses, fixture-equivalence, and array defaults. |
| `M` | `apps/project-control-center/src/surfaces/projectHome/shared.ts` | `PccCardState` extended with `'unauthorized-persona'`; `PCC_CARD_STATES` array updated. |
| `M` | `apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx` | Optional `profile?: IProjectProfile` prop; fixture fallback preserved. |
| `M` | `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx` | Optional `actions?: readonly IPriorityAction[]` prop; fixture fallback preserved. |
| `M` | `apps/project-control-center/src/surfaces/projectHome/PccSiteHealthSummaryCard.tsx` | Optional `summary?: ISiteHealthSummary` prop; fixture fallback preserved. |
| `M` | `apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx` | Optional `sources?: readonly IDocumentControlSource[]` prop; lane grouping uses `source.lane === lane`; fixture fallback preserved. |
| `M` | `apps/project-control-center/src/surfaces/projectHome/PccMissingConfigurationsCard.tsx` | Optional `missingConfigurations?: readonly IExternalSystemMissingConfig[]` prop; fixture fallback preserved. |
| `M` | `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` | Generalized `API_IMPORT_EXCEPTIONS` allowlist; adds the narrow `projectHomeAdapter.ts` exception for `mapPccSourceStatusToPreviewState`. |
| `M` | `apps/project-control-center/src/tests/PccProjectHome.test.tsx` | `PCC_CARD_STATES` assertion updated for the new state. |
| `M` | `apps/project-control-center/src/tests/PccProjectHome.states.test.tsx` | `unauthorized-persona` rendered through every card's non-preview state path. |
| `A` | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Project_Home_Adapter_Closeout.md` | This closeout. |

`PccProjectHome.tsx`, `PccApp.tsx`, `mount.tsx`, `PccSurfaceRouter.tsx`, every API client file, the backend, `packages/models`, manifests, lockfile, workflows are unchanged.

## Adapter / view-model

- **View-model:** `IPccProjectHomeViewModel` (and per-slot `IPccProjectHomeViewModelSlot<T>`) at `apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts`. Five slots: `intelligence`, `priorityActions`, `siteHealth`, `documentControl`, `missingConfigurations`.
- **Adapter:** `buildPccProjectHomeViewModel(input)` at `apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.ts`. Accepts `{ home: PccReadModelEnvelope<PccProjectHomeReadModel>; documentControl: PccReadModelEnvelope<PccDocumentControlReadModel> }`. Returns `IPccProjectHomeViewModel`.
- **No `fetch`, no async, no client/factory imports.** Single `src/api/` import: the named pure helper `mapPccSourceStatusToPreviewState`.

## `PccCardState` extension

```ts
export type PccCardState =
  | 'preview'
  | 'empty'
  | 'missing-config'
  | 'unavailable-fixture'
  | 'error'
  | 'unauthorized-persona';
```

`PccPreviewState` already renders `unauthorized-persona`; no UI work needed.

## 7-status mapping (source status → preview state → card state)

| `PccReadModelSourceStatus` | `mapPccSourceStatusToPreviewState` (8-state) | `PccCardState` (6-state) |
| --- | --- | --- |
| `available` | `preview` | `preview` |
| `stale` | `preview` | `preview` |
| `backend-unavailable` | `error` | `error` |
| `source-unavailable` | `unavailable-fixture` | `unavailable-fixture` |
| `missing-config` | `missing-config` | `missing-config` |
| `unauthorized` | `unauthorized-persona` | `unauthorized-persona` |
| `forbidden` | `unauthorized-persona` | `unauthorized-persona` |

Internal `PREVIEW_TO_CARD_STATE` map also handles `loading` → `preview` and `not-yet-implemented-operation` → `preview` for completeness; neither is produced by the source-status path today.

## Card prop compatibility

| Card | Optional prop | Behavior when supplied | Fixture fallback when omitted |
| --- | --- | --- | --- |
| `PccProjectIntelligenceCard` | `profile?: IProjectProfile` | renders hero from `profile` | `SAMPLE_PROJECT_PROFILE` |
| `PccPriorityActionsCard` | `actions?: readonly IPriorityAction[]` | renders rows from `actions`; existing tone derivation reused | `SAMPLE_PRIORITY_ACTIONS` |
| `PccSiteHealthSummaryCard` | `summary?: ISiteHealthSummary` | renders from `summary` | `SAMPLE_SITE_HEALTH_SUMMARY` |
| `PccDocumentControlCard` | `sources?: readonly IDocumentControlSource[]` | iterates `DOCUMENT_CONTROL_LANES` and filters supplied sources via `source.lane === lane` (string compare); preserves Microsoft-lane action chips and external-lane launch cue | `DOCUMENT_CONTROL_SOURCE_IDS` → `DOCUMENT_CONTROL_SOURCES` per-lane |
| `PccMissingConfigurationsCard` | `missingConfigurations?: readonly IExternalSystemMissingConfig[]` | renders rows from supplied list | `SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS` |

The 5 non-read-model-backed cards (Readiness, Approvals, External Systems, Team Snapshot, Recent Activity) are unchanged.

## Document Control card behavior

When `sources` is supplied:

1. The card iterates the canonical lane list `DOCUMENT_CONTROL_LANES` (`['microsoft-files', 'external-document-systems']` — string values, **not** objects with `.id`).
2. For each lane, it renders only the supplied sources whose `source.lane === lane`.
3. The existing tile structure (posture pill, source-of-record label, Microsoft-lane action chips, external-lane launch cue) is preserved.
4. The supplied `sources` prop is **never silently dropped** — when present, it drives the rendering.

Fixture fallback continues to use `DOCUMENT_CONTROL_LANES.flatMap(lane => fixtureSourcesInLane(lane))` so the same lane→source taxonomy is preserved for default rendering.

## Narrow guard exception

The controlled-consumption guard's api-import allowlist is generalized into `API_IMPORT_EXCEPTIONS`. Two entries today:

| Consumer file | Type-only? | Allowed source paths | Allowed identifiers | Justification |
| --- | --- | --- | --- | --- |
| `src/mount.tsx` | yes | `./api/pccReadModelClientFactory(.js)` | `IPccReadModelConfig` | Mount must carry config type forward (Prompt 02). |
| `src/surfaces/projectHome/projectHomeAdapter.ts` | no (value import) | `../../api/pccReadModelStateMapping(.js)` | `mapPccSourceStatusToPreviewState` | Pure state-mapping helper; no client consumption. |

The forbidden-identifier list (`IPccReadModelClient`, `pccReadModelClient`, `pccFixtureReadModelClient`, `createPccFixtureReadModelClient`, `createPccReadModelClient`, `resolvePccReadModelConfig`, `pccBackendReadModelClient`, `createPccBackendReadModelClient`) is preserved exactly; non-api/non-test source files outside the allowlist still fail any api import.

The Prompt 03 `fetch(` allowlist is preserved exactly: callsites in `src/api/**` remain limited to `pccBackendReadModelClient.ts` and its test file.

## Validation results

```bash
git status --short                                   # 9 modified + 3 untracked, all in scope
md5 pnpm-lock.yaml                                   # c56df7b79986896624536aab74d609f4
pnpm --filter @hbc/spfx-project-control-center check-types  # PASS
pnpm --filter @hbc/spfx-project-control-center test  # PASS — 22 files / 270 tests (was 248 in Prompt 03)
pnpm --filter @hbc/spfx-project-control-center build # PASS — 2195 modules; dist 222.91 KB JS, 20.98 KB CSS
md5 pnpm-lock.yaml                                   # c56df7b79986896624536aab74d609f4 (unchanged)
git status --short                                   # unchanged after validation
git diff --stat HEAD                                 # 9 modified files (+177 / -42)
git diff --name-only HEAD                            # 9 paths, all in scope
```

`pnpm-lock.yaml` md5 before/after identical. No changes under `backend/`, `packages/`, `.github/`. No manifest, `package.json`, lockfile, workflow, or deployment changes.

The +22 test count delta breaks down as: 11 adapter status-mapping tests, 2 mixed-envelope tests, 2 fixture-equivalence tests, 1 sparse-data test, plus 6 `unauthorized-persona` parametric assertions added to `PccProjectHome.states.test.tsx` (one per non-preview-only card; the `_` doesn't include cards that always render `state="preview"`).

## Architectural completeness

- **No orphan code.** The adapter is referenced by its own test file, by the dormancy guard's allowlist, and is ready to be wired by `PccProjectHome` in Prompt 05. The view-model types are referenced by the adapter and its test. The 5 card prop additions are exercised in default-rendering tests (existing PccProjectHome.test.tsx assertions) and the new `unauthorized-persona` parametric tests.
- **No quiet posture drift.** `PccProjectHome.tsx` is unchanged; cards render fixtures by default; the seam from Prompts 02/03 is not consumed here.
- **No silent runtime cutover.** No card imports `src/api/`. The adapter's single api import is the pure helper, encoded in the guard allowlist with a type-only-equivalent justification (pure helper, no client value).
- **Guardrail tests still cover unwired surfaces.** Cards remain blocked from api consumption; the dormancy guard's negative space is unchanged for them.

## Confirmations

- No backend HTTP changes; no new `fetch(` callsites.
- No backend Functions edits; no `packages/models` edits.
- No `mount.tsx` / `PccApp.tsx` / `PccSurfaceRouter.tsx` / shell wiring or runtime client wiring.
- No `package.json` / `pnpm-lock.yaml` / SPFx manifest / workflow / deployment / app-catalog changes.
- No backend default; fixture remains the default.
- No tenant mutation; no live external-system runtime; no Graph/PnP/SharePoint/Procore/DC/Adobe Sign runtime.
- Document Control card never silently drops the `sources` prop.

## Recommended next prompt

**Prompt 05 — Wave 4 Project Home / Command Center Opt-In Wiring.**

Prompt 05 will wire `PccProjectHome` to the Wave 2/3/4 SPFx mode/config seam: read the optional `IPccReadModelConfig` from mount, instantiate the appropriate client via `createPccReadModelClient`, fetch home + document-control envelopes, run them through `buildPccProjectHomeViewModel`, and pass the resulting slot data + state to the 5 read-model-backed cards. Backend mode remains explicit opt-in; fixture remains default; the dormancy guard will gain a Project Home consumption allowlist entry in Prompt 06.
