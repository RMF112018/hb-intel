# Wave 2 — Prompt 06 Closeout: Document Control Model Metadata + Documents / External Systems / Site Health Preview Frames

**Phase:** 3
**Wave:** 2
**Prompt:** 06 — Document Control, External Systems, and Site Health Frames
**Status:** Complete
**Date:** 2026-04-29

## Objective Recap

Three connected deliverables:

1. **Wave 1 model alignment** — extend `packages/models/src/pcc/DocumentControl.ts` with the corrected two-lane vocabulary (lanes, action ids, action registry, source-lane fields). **Additive only.**
2. **Project Home `PccDocumentControlCard` remediation** — rebuild the Prompt 05 card body as a compact two-lane summary that consumes the canonical model.
3. **Three new preview surfaces** — Documents, External Systems, Site Health.

All Document Control actions remain **disabled / preview-only**. No live Microsoft Graph, PnP, SharePoint REST, OneDrive, Procore, Document Crunch, Adobe Sign, backend, tenant, scanner, repair-runner, sync, mirror, write-back, or mutation behavior was introduced.

## Additive Model Contract Update

### Pre-flight grep result (Refinement #5)

Workspace-wide `rg "IDocumentControlSource|DocumentControlSource|DOCUMENT_CONTROL_SOURCES|DOCUMENT_CONTROL_SOURCE_IDS"` returned matches only in:

- `packages/models/src/pcc/DocumentControl.ts` (the registry itself; the only object-literal construction site)
- `packages/models/src/pcc/DocumentControl.test.ts` (read-only — `keyof IDocumentControlSource` whitelist)
- `packages/models/src/pcc/index.ts` (re-export only)
- `packages/models/src/pcc/constants.ts` (re-export only)
- `packages/models/src/pcc/fixtures/integrations.ts` (`DocumentControlSourceId` type-import for `SAMPLE_DOCUMENT_CONTROL_SOURCE_IDS`)
- `packages/models/src/pcc/fixtures/Fixtures.test.ts` (read-only fixture import)
- `packages/models/src/pcc/fixtures/index.ts` (re-export only)
- `apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx` (read-only access to `DOCUMENT_CONTROL_SOURCES[id].*`)
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx` (read-only)

**Decision:** **no external object-literal consumers** exist. The new `IDocumentControlSource` fields are **required** and populated for every existing entry in `DOCUMENT_CONTROL_SOURCES` in the same commit. The existing `DocumentControl.test.ts` `ALLOWED_KEYS` whitelist was updated in scope to admit the new keys.

### New `@hbc/models/pcc` exports

Added under `// Document Control sources` in `packages/models/src/pcc/index.ts`:

| Export | Kind |
| --- | --- |
| `DOCUMENT_CONTROL_LANES` | `readonly ['microsoft-files', 'external-document-systems']` |
| `DocumentControlLane` | type alias |
| `DOCUMENT_CONTROL_ACTION_IDS` | `readonly ['browse', 'open', 'upload', 'download', 'copy-link', 'approval-status']` |
| `DocumentControlActionId` | type alias |
| `DocumentControlActionExecutionState` | `'preview-disabled' \| 'enabled'` (Wave 2 ships only `'preview-disabled'`) |
| `DocumentControlCapabilityPosture` | `'future-graph-managed' \| 'launch-link-visibility-only'` |
| `IDocumentControlAction` | interface |
| `DOCUMENT_CONTROL_ACTIONS` | `Readonly<Record<DocumentControlActionId, IDocumentControlAction>>` |

Existing exports preserved verbatim.

### Extended `IDocumentControlSource` (additive required fields)

```ts
export interface IDocumentControlSource {
  // ── existing ──
  id: DocumentControlSourceId;
  displayName: string;
  posture: DocumentControlSourcePosture;
  linkBehavior: DocumentControlLinkBehavior;
  notes?: string;
  // ── new (Wave 2 / Prompt 06) ──
  lane: DocumentControlLane;
  previewActionIds: readonly DocumentControlActionId[];
  capabilityPosture: DocumentControlCapabilityPosture;
  sourceOfRecordLabel: string;
  guardrail: string;
}
```

Per-source canonical mapping (populated in `DOCUMENT_CONTROL_SOURCES`):

| `id` | `lane` | `capabilityPosture` | `previewActionIds` | `sourceOfRecordLabel` |
| --- | --- | --- | --- | --- |
| `sharepoint-drive` | `microsoft-files` | `future-graph-managed` | all six action ids | `Microsoft 365 (SharePoint)` |
| `onedrive` | `microsoft-files` | `future-graph-managed` | all six action ids | `Microsoft 365 (OneDrive)` |
| `procore-files` | `external-document-systems` | `launch-link-visibility-only` | `[]` | `Procore` |
| `document-crunch` | `external-document-systems` | `launch-link-visibility-only` | `[]` | `Document Crunch` |
| `adobe-sign` | `external-document-systems` | `launch-link-visibility-only` | `[]` | `Adobe Sign` |

### Model-level test coverage

`packages/models/src/pcc/DocumentControl.test.ts` updated:

- `ALLOWED_KEYS` whitelist extended with the five new field names.
- New `describe('Document Control two-lane model (Wave 2 / Prompt 06)')` block adds 7 cases:
  - both lanes are present in `DOCUMENT_CONTROL_LANES`
  - every source's `lane` matches the canonical mapping
  - Microsoft-lane sources carry every action id and `capabilityPosture === 'future-graph-managed'`
  - External-lane sources carry zero action ids and `capabilityPosture === 'launch-link-visibility-only'`
  - every `previewActionIds` entry resolves into `DOCUMENT_CONTROL_ACTIONS`
  - **every `DOCUMENT_CONTROL_ACTIONS[id].executionState === 'preview-disabled'`** (Refinement #1)
  - source-ordering integrity: `DOCUMENT_CONTROL_SOURCE_IDS` spans the full registry

`@hbc/models` test totals after this change: **212 passed across 29 files** (was 205 / 29 — added 7 cases).

### Source-ordering discipline (Refinement #2)

`apps/project-control-center/src/surfaces/documents/shared.ts` derives lane ordering from `DOCUMENT_CONTROL_SOURCE_IDS.filter(...)` rather than `Object.keys(DOCUMENT_CONTROL_SOURCES)`. The remediated `PccDocumentControlCard` on Project Home does the same. No app-local lane membership is duplicated.

## Project Home `PccDocumentControlCard` Remediation

`apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx` — body rebuilt as a compact two-lane summary:

- consumes canonical `DOCUMENT_CONTROL_LANES`, `DOCUMENT_CONTROL_SOURCES`, `DOCUMENT_CONTROL_ACTIONS` from `@hbc/models/pcc`;
- Microsoft Files lane renders disabled action chips (`<button type="button" disabled aria-disabled="true" data-pcc-doc-action=...>`) with no `onClick`;
- External Document Systems lane renders launch / visibility cue only (`data-pcc-doc-launch-cue`) — no anchors;
- card stays compact (`footprint="wide"`); it is **not** the full Documents surface;
- existing `eyebrow` / `title` / `dataActiveSurfacePanel` handling preserved.

### Project Home test update (Refinement #4)

`apps/project-control-center/src/tests/PccProjectHome.test.tsx`:

- replaced word-blocklist assertion (`upload / approve / review / retention / permission / sync policy`) with **structural assertions**:
  - every `[data-pcc-doc-action]` element is a `<button>` with `disabled === true` and `aria-disabled === 'true'`;
  - none of those buttons carries an `onclick` attribute;
  - their `data-pcc-doc-action-execution-state` is `'preview-disabled'`;
  - no `<a[href^="http(s)://"]>` element appears in the card body;
  - external-lane rows carry `[data-pcc-doc-launch-cue]` and contain zero action buttons;
- count assertion switched from `SAMPLE_DOCUMENT_CONTROL_SOURCE_IDS.length` (3) to `DOCUMENT_CONTROL_SOURCE_IDS.length` (5) since the corrected card renders the full registry, not the fixture subset.

The deprecated `feedback_word_blocklists_break_on_corrected_copy` pattern is now memorialised in agent memory.

## Three New Preview Surfaces

### Documents — `apps/project-control-center/src/surfaces/documents/`

Six cards as direct children of `[data-pcc-bento-grid]`:

| # | Card | Footprint | Lane | Source |
| --- | --- | --- | --- | --- |
| 1 | `PccDocumentsHeaderCard` | `full` | n/a | `dataActiveSurfacePanel="documents"`; `PCC_MVP_SURFACES['documents']` |
| 2 | `PccMicrosoftFileSourceCard` (SharePoint Drive) | `wide` | `microsoft-files` | full action-chip set from `DOCUMENT_CONTROL_ACTIONS` |
| 3 | `PccMicrosoftFileSourceCard` (OneDrive) | `wide` | `microsoft-files` | same |
| 4 | `PccExternalDocSystemCard` (Procore Files) | `standard` | `external-document-systems` | launch/visibility cue + guardrail |
| 5 | `PccExternalDocSystemCard` (Document Crunch) | `standard` | `external-document-systems` | same |
| 6 | `PccExternalDocSystemCard` (Adobe Sign) | `standard` | `external-document-systems` | same |

Markers: `data-pcc-doc-lane`, `data-pcc-document-source-id`, `data-pcc-doc-action`, `data-pcc-doc-action-execution-state="preview-disabled"`, `data-pcc-doc-launch-cue`.

### External Systems — `apps/project-control-center/src/surfaces/externalSystems/`

Header card + one tile per `EXTERNAL_SYSTEM_CATALOG` entry (10 systems): SharePoint, OneDrive, Procore, Sage Intacct, Microsoft Teams, Compass, Document Crunch, Cupix, Adobe Sign, Outlook Calendar.

State resolution per system: `configured` (when in `SAMPLE_EXTERNAL_SYSTEM_LINKS`) → `missing` (when in `SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS`) → `unavailable-fixture` (otherwise). Every tile carries `data-pcc-external-system-id`, `data-pcc-external-system-state`, `data-pcc-external-system-posture`. **No `<a href>` elements anywhere.**

### Site Health — `apps/project-control-center/src/surfaces/siteHealth/`

Four cards:

1. **Overview** (`full`, `dataActiveSurfacePanel="site-health"`) — `SAMPLE_SITE_HEALTH_SUMMARY` overall severity / failing / warning / last-run.
2. **Checks** (`wide`) — one row per `SAMPLE_SITE_HEALTH_CHECKS` entry; markers: `data-pcc-site-health-check-id`, `data-pcc-site-health-check-state`, `data-pcc-site-health-severity`.
3. **Drift** (`standard`) — one row per `SAMPLE_DRIFT_INDICATORS` entry; renders `unavailable-fixture` body when the array is empty.
4. **Repair Requests** (`standard`) — one row per `SAMPLE_REPAIR_REQUESTS` entry; **non-operational placeholder** with the visible cue *"Preview placeholder · no live repair runner is active in this preview."* No `<button>` elements anywhere in the card body.

Surface tests target structural runtime seams — no buttons in the repair card, no `http(s)://` hrefs anywhere — instead of brittle word-blocklists on guardrail copy (Refinement #3).

## Per-Surface State Coverage

Every new card accepts `state?: PccCardState`; non-preview states delegate to `PccPreviewState`. The `'missing-config'` state is semantically idiomatic on Documents (External lane) and External Systems; supported uniformly on the others through the shared shell.

## Tests

| Test file | New / Modified | Cases |
| --- | --- | --- |
| `tests/PccProjectHome.test.tsx` | MODIFY (replaced word-blocklist; tightened canonical-lane assertion) | maintained |
| `tests/pcc-import-guards.test.ts` | MODIFY (added `MSGraphClient`, `GraphServiceClient`, `sp.web`, `_api/web`, `ProcoreClient`, `DocumentCrunchClient`, `AdobeSignClient`) | additive |
| `tests/PccDocumentsSurface.test.tsx` | NEW | 6 cases |
| `tests/PccExternalSystemsSurface.test.tsx` | NEW | 4 cases |
| `tests/PccSiteHealthSurface.test.tsx` | NEW | 7 cases |

App-side test totals: **158 passed across 15 files** (was 127 / 10). The 15th file is a user-shipped `PccTeamAccessSurface.test.tsx` that landed alongside the broader scope-extension; remains in scope reporting because it runs as part of the same vitest project.

Bare product names (`Graph`, `Procore`, `Document Crunch`, `Adobe Sign`) are intentionally **not** added to the import-guard scan list — they appear in legitimate JSX text in the new surfaces, and adding them would create false positives. Only runtime-construction identifiers / package specifiers are scanned.

## Validation Command Results

| Command | Result |
| --- | --- |
| `git status --short` | Clean for the Prompt 06 scope; pre-existing modifications to `.claude/settings.local.json` and a separate user-staged Prompt 07 prep set (4 surface dirs + 1 user test + Prompt 07 closeout doc) are **not** part of this commit. |
| `pnpm --filter @hbc/models check-types` | **PASS** |
| `pnpm --filter @hbc/models test` | **PASS** — 212/212 across 29 files |
| `pnpm --filter @hbc/spfx-project-control-center check-types` | **PASS** |
| `pnpm --filter @hbc/spfx-project-control-center build` | **PASS** — `vite v6.4.1`, 2194 modules transformed; emits `dist/project-control-center-app.js` (220.86 kB · gzip 65.96 kB) and `dist/spfx-project-control-center.css` (20.98 kB · gzip 3.82 kB). Bundle was **not** packaged into `.sppkg` and **not** deployed. |
| `pnpm --filter @hbc/spfx-project-control-center test` | **PASS** — 158/158 across 15 files |
| `pnpm --filter @hbc/spfx-project-control-center lint` | **PASS** — eslint clean |

## Lockfile Status

`pnpm-lock.yaml` **unchanged**. MD5 hash before and after Prompt 06 work is identical: `c56df7b79986896624536aab74d609f4`. No `pnpm install / add / update` was run during execution. No `package.json` was edited (in either package). No new direct dependencies were introduced.

## Both Surfaces Consume the Same Canonical Metadata

- Project Home `PccDocumentControlCard` imports `DOCUMENT_CONTROL_LANES`, `DOCUMENT_CONTROL_ACTIONS`, `DOCUMENT_CONTROL_SOURCES`, `DOCUMENT_CONTROL_SOURCE_IDS` from `@hbc/models/pcc`. No app-local lane / action / source-lane-membership constants.
- Documents surface (`PccDocumentsSurface`, `PccMicrosoftFileSourceCard`, `PccExternalDocSystemCard`, `shared.ts`) imports the same canonical symbols. The `sourceIdsInLane` helper in `shared.ts` filters `DOCUMENT_CONTROL_SOURCE_IDS` by the canonical `lane` field — it does not duplicate lane membership.
- Both surfaces produce the same `data-pcc-doc-lane` and `data-pcc-doc-action` markers from the same source of truth.

## Explicit No-Touch Confirmations

- **`packages/spfx`:** untouched.
- **SPFx manifests / `package-solution.json` / `.sppkg` / app-catalog packaging / deployment scripts:** none introduced.
- **Backend / Azure Functions / provisioning / template packages:** untouched.
- **CI/CD workflow files:** untouched.
- **Microsoft Graph / PnP / SharePoint REST / OneDrive runtime:** none introduced; guard test extended.
- **Procore / Document Crunch / Adobe Sign API/runtime/SDK/secrets/sync/mirror/write-back paths:** none introduced; guard test extended.
- **`@hbc/auth` / live auth integrations:** none introduced (guard-asserted from Prompt 04).
- **URL routing / route params / persisted nav state / `localStorage` / `sessionStorage` / cookies / `window.open`:** none introduced.
- **Tenant reads / real authorization / file-operation execution / approval execution / file/folder/permission mutation:** none.
- **Document-management workflow execution** (upload / download / copy-link / open / approval): rendered as **disabled chips with no executable handler** only. No active runtime path.
- **Scanner / repair runner / Graph probe / PnP probe / tenant probe / backend persistence:** none. Site Health repair card lists fixture data with explicit non-operational cue per row and zero `<button>` elements.
- **Homepage paired-row layout import / copy / adaptation:** none (guard-asserted).
- **Reintroduction of disabled rail buttons:** none (Prompt 04 guard preserved).
- **Package, solution, or manifest version bumps:** none. `apps/project-control-center/package.json` version remains `0.0.1`. The trailing instruction in the user prompt to "bump the appropriate manifest version" is not honored because no manifest exists in this scaffold and Wave 2 scope-lock W2-ODR-003 plus the Prompt 06 forbidden-work clause both prohibit version bumps; resolved in favor of "no version bump."
- **`pnpm-lock.yaml`:** unchanged.
- **New `@hbc/ui-kit` API additions, new tokens, new icons, new dependencies:** none.
- **App-local preview data introduced beyond what already exists:** none. The Wave 1 fixture surface fully covered Prompt 06's needs (Prompt 05's `teamSnapshotPlaceholder.ts` remains the sole app-local fixture and is unrelated to this prompt).

## Future-Capability Note

The Microsoft Files lane preview surface is metadata-only. **Live Microsoft Graph–backed file operations remain deferred to a later approved implementation gate.** That work will require:

- a Graph-backed implementation plan;
- an authorization model;
- a permission posture (Graph scopes, app-only vs. delegated, conditional access);
- a tenant consent review;
- a security review;

before any `executionState === 'enabled'` action ships in any runtime. The `'enabled'` value exists in the type today only as future metadata and is intentionally never branched on.

## Files Changed

**Modified (model package):** `packages/models/src/pcc/DocumentControl.ts`, `packages/models/src/pcc/index.ts`, `packages/models/src/pcc/DocumentControl.test.ts` (model-level changes were committed by upstream commit `c0e7d3105`; this Prompt 06 closeout reflects the corresponding app-side consumption).

**Modified (app):** `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`, `apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx`, `apps/project-control-center/src/tests/PccProjectHome.test.tsx`, `apps/project-control-center/src/tests/pcc-import-guards.test.ts`.

**Created (Documents surface):** `apps/project-control-center/src/surfaces/documents/{PccDocumentsSurface.tsx, PccDocumentsSurface.module.css, PccDocumentsHeaderCard.tsx, PccMicrosoftFileSourceCard.tsx, PccExternalDocSystemCard.tsx, shared.ts}`.

**Created (External Systems surface):** `apps/project-control-center/src/surfaces/externalSystems/{PccExternalSystemsSurface.tsx, PccExternalSystemsSurface.module.css, PccExternalSystemsHeaderCard.tsx, PccExternalSystemTile.tsx}`.

**Created (Site Health surface):** `apps/project-control-center/src/surfaces/siteHealth/{PccSiteHealthSurface.tsx, PccSiteHealthSurface.module.css, PccSiteHealthOverviewCard.tsx, PccSiteHealthChecksCard.tsx, PccSiteHealthDriftCard.tsx, PccSiteHealthRepairRequestsCard.tsx}`.

**Created (tests):** `apps/project-control-center/src/tests/{PccDocumentsSurface.test.tsx, PccExternalSystemsSurface.test.tsx, PccSiteHealthSurface.test.tsx}`.

**Created (closeout):** `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Prompt_06_Closeout.md` — this file.

**Scope note:** during execution of this prompt, the user committed companion work in parallel:

- `c0e7d3105 Finalize Document Control lane/action model alignment and export parity` — model package changes that finalised the additive Wave 1 model alignment described in this closeout.
- `b5300c357 Align PCC Team & Access capability and fixture model for Wave 2 preview lanes` — Team & Access model.
- `9dd7ae78f feat(pcc): implement wave 2 prompt 07 preview surfaces and tests` — Prompt 07 app surface implementations (Team & Access full surface; Approvals / Control Center Settings / Project Readiness placeholder surfaces) plus their tests.

`PccSurfaceRouter` in this commit therefore routes seven surfaces total (the three Prompt 06 surfaces + the four Prompt 07 surfaces from `9dd7ae78f`), keeping the router a single coherent file rather than splitting the routing across overlapping commits. **Substantive Prompt 06 deliverables in this commit:** the new `apps/project-control-center/src/surfaces/{documents,externalSystems,siteHealth}/` directories, three matching test files, the Project Home `PccDocumentControlCard` remediation, the structural test rewrite in `PccProjectHome.test.tsx`, the extended `pcc-import-guards.test.ts` forbidden-specifier list, and this closeout document. The model-level changes (`packages/models/src/pcc/DocumentControl.{ts,test.ts}` and the `index.ts` exports) landed upstream in `c0e7d3105` and are referenced here by consumption.
