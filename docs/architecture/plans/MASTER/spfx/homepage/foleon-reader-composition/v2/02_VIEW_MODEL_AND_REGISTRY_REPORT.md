# Foleon Reader View Model and Layout Registry Report

## Scope

Phase-04 Wave-01 Prompt-02 architecture seam. Refactors the Foleon reader rendering path so preview and ready states share a normalized **`FoleonReaderViewModel`** and route through a **lane-specific layout registry**. Adds three unique lane layout components (`ProjectSpotlightReaderLayout`, `CompanyPulseReaderLayout`, `LeadershipMessageReaderLayout`) — each emitting a stable `data-foleon-reader-layout` marker — that initially delegate to a shared internal compatibility shell so visuals stay aligned with today's rendering. **No final visual redesign is performed in this prompt.**

Scope explicitly excludes: lane-specific visual redesign (Prompts 03 / 04 / 05), preview removal, iframe origin policy / governance, Foleon route map, backend sync, SharePoint list schemas, homepage shell pairing or row placement, the Prompt-01 edge contract, Safety Field Excellence, HB Kudos, People & Culture.

## Baseline Inputs

- `docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/00_BASELINE_AUDIT.md`
- `docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/01_EDGE_CONTRACT_REPORT.md`

The baseline audit's hero/post-hero authority split and the Prompt-01 dormant edge contract are preserved verbatim. No edge-contract behavior was modified.

## Source Files Changed

| File | Change |
|---|---|
| `packages/foleon-reader/src/readers/FoleonReaderViewModel.ts` | **New.** `FoleonReaderLayoutKey` type, `FoleonReaderViewModel` shape, sub-types (chips / facts / support items / actions / iframe model / mobile gate), `resolveFoleonReaderLayoutKey(config)` typed mapper, `createPreviewFoleonReaderViewModel(config)` and `createReadyFoleonReaderViewModel(config, context)` adapters. |
| `packages/foleon-reader/src/readers/FoleonReaderLayoutRegistry.tsx` | **New.** `FoleonReaderLayoutProps`, `FOLEON_READER_LAYOUTS` registry const, `getFoleonReaderLayout(key)` accessor. |
| `packages/foleon-reader/src/readers/layouts/FoleonReaderCompatibilityLayout.tsx` | **New, internal.** Shared visual shell that renders a view model in either preview or ready state, reusing the existing `FoleonReaderModule.module.css` classes. Not exported from `index.ts`. |
| `packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx` | **New.** Lane wrapper. Emits `data-foleon-reader-layout="project-spotlight"`, `data-foleon-reader-lane="projectSpotlight"`, `data-foleon-reader-state`. Delegates to compatibility layout. |
| `packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx` | **New.** Same shape, marker `company-pulse`. |
| `packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx` | **New.** Same shape, marker `leadership-message`. |
| `packages/foleon-reader/src/readers/FoleonReaderModule.tsx` | Refactor. State machine and side effects unchanged; rendering is now: build view model → resolve layout from registry → render. Iframe element is constructed by the orchestrator and passed to the layout via `iframeSurface`. Tone / page-context props remain on the public surface for backwards compatibility but no longer drive layout differentiation. |
| `packages/foleon-reader/src/index.ts` | Add minimal public exports: `FoleonReaderLayoutKey` and view-model subtypes, `resolveFoleonReaderLayoutKey`, `FoleonReaderLayoutProps`, `FoleonReaderLayoutComponent`, `FOLEON_READER_LAYOUTS`, `getFoleonReaderLayout`. Internal compatibility layout and lane wrappers are **not** exported. |
| `packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts` | **New.** 17 adapter tests. |
| `packages/foleon-reader/src/readers/__tests__/FoleonReaderLayoutRegistry.test.tsx` | **New.** Registry routing + lane-marker assertions. |
| `packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx` | Add per-lane `data-foleon-reader-layout` assertions to the three-lane composition test alongside the existing tone markers. No behavioral assertions changed. |
| `apps/hb-homepage/config/package-solution.json` | Bump solution + feature versions `1.1.80.0` → `1.1.82.0`. |
| `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Bump web-part version `1.1.80.0` → `1.1.82.0`. |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Bump runtime-copy version `1.1.81.0` → `1.1.82.0` (lockstep with authority). |
| `packages/homepage-launcher/src/constants.ts` | Bump `HOMEPAGE_LAUNCHER_VERSION` `'1.1.80.0'` → `'1.1.82.0'`. |

`FoleonReaderPreview.tsx` is left in place as a public export for any external consumer — the orchestrator no longer renders through it, but the component is still functional. Lane-config wrappers (`ProjectSpotlightReader.tsx`, `CompanyPulseReader.tsx`, `LeadershipMessageReader.tsx`) are unchanged: they continue passing `tone` + `pageContext` to `FoleonReaderModule`, which now resolves the layout key from `config.readerKey` via the typed mapper.

## Architecture Implemented

```
FoleonEmbeddedReaderLane (unchanged)
  └─ ProjectSpotlightReader / CompanyPulseReader / LeadershipMessageReader (unchanged, thin wrappers)
       └─ FoleonReaderModule (orchestrator)
            ├─ resolveFoleonReaderContent(...)             ← unchanged
            ├─ state machine (loading / error / blocked / preview / ready)  ← unchanged
            ├─ iframe lifecycle, telemetry, mobile lazy-mount  ← unchanged
            ├─ resolveFoleonReaderLayoutKey(config)         ← NEW typed mapper
            ├─ createPreview / createReadyFoleonReaderViewModel(...)  ← NEW adapters
            └─ getFoleonReaderLayout(layoutKey)            ← NEW registry
                 └─ <ProjectSpotlightReaderLayout | CompanyPulseReaderLayout | LeadershipMessageReaderLayout>
                       └─ <FoleonReaderCompatibilityLayout>   ← INTERNAL shared shell (this prompt)
                            └─ existing visual structure (preview surface or ready surface + iframe slot)
```

The orchestrator constructs the iframe element via `FoleonIframeHost` (preserving origin policy, telemetry, and `onLoaded` / `onError` lifecycle wiring) and hands it to the layout via the `iframeSurface` prop. Layouts decide where to place the iframe surface within their own composition; today's compatibility shell places it inside the existing `.frameWrap` container.

## View Model Fields

```ts
interface FoleonReaderViewModel {
  lane: 'projectSpotlight' | 'companyPulse' | 'leadershipMessage';
  state: 'preview' | 'ready';
  readerKey: FoleonReaderKey;
  contentTypeKey: string;
  placementKey: string;
  title: string;
  summary?: string;
  eyebrow: string;
  previewLabel?: string;          // 'Preview layout' in preview state, undefined in ready
  freshnessLabel: string;
  freshnessValue: string;
  audience: string;               // defaults to 'Companywide'
  archiveGroup: string;           // defaults to 'Archive coming soon'
  chips: readonly FoleonReaderChip[];
  facts: readonly FoleonReaderFact[];
  supportItems: readonly FoleonReaderSupportItem[];
  governanceNotes: readonly string[];
  statusNotes: readonly string[];
  actions: readonly FoleonReaderAction[];
  iframe?: FoleonReaderIframeModel;     // present on ready state; visible flag governs mounting
  mobileGate?: FoleonReaderMobileGate;  // present when ready + mobile + reader not opened
  warnings: readonly string[];
  archiveNote?: string;
  titleElementId: string;               // stable `aria-labelledby` target id
}
```

Adapter rules preserved from the prior implementation:

- **Project Spotlight freshness**: `record.issueDate ?? record.publishedOn`.
- **Company Pulse / Leadership Message freshness**: `record.lastEditorialUpdate ?? record.publishedOn`.
- **Audience**: defaults to `Companywide` when `record.primaryAudience` is missing.
- **Archive group**: defaults to `Archive coming soon` when `record.archiveGroup` is missing.
- **Preview state**: never mounts an iframe, never includes any production-record-derived data, and is explicitly labeled `Preview layout`.
- **Ready state**: preserves Foleon iframe host mounting, origin policy plumbing, `onReaderOpen`, `onReaderClose`, `onEmbedError`, and `onGateBlocked` semantics.

## Layout Registry

```ts
type FoleonReaderLayoutKey = 'projectSpotlight' | 'companyPulse' | 'leadershipMessage';

interface FoleonReaderLayoutProps {
  viewModel: FoleonReaderViewModel;
  iframeSurface: ReactNode | null;
}

const FOLEON_READER_LAYOUTS: Readonly<Record<FoleonReaderLayoutKey, ComponentType<FoleonReaderLayoutProps>>> = {
  projectSpotlight: ProjectSpotlightReaderLayout,
  companyPulse:    CompanyPulseReaderLayout,
  leadershipMessage: LeadershipMessageReaderLayout,
};

function getFoleonReaderLayout(key: FoleonReaderLayoutKey): FoleonReaderLayoutComponent;
function resolveFoleonReaderLayoutKey(config: FoleonReaderModuleConfig): FoleonReaderLayoutKey | null;
```

Each lane wrapper emits, on its outer DOM element:

| Attribute | Value |
|---|---|
| `data-foleon-reader-layout` | `"project-spotlight"` \| `"company-pulse"` \| `"leadership-message"` |
| `data-foleon-reader-lane` | `"projectSpotlight"` \| `"companyPulse"` \| `"leadershipMessage"` |
| `data-foleon-reader-state` | `"preview"` \| `"ready"` |

Lane-key resolution is **explicit and type-safe**: `resolveFoleonReaderLayoutKey(config)` reads `config.readerKey` (a typed `FoleonReaderKey` union) and returns the matching `FoleonReaderLayoutKey` from a literal `Record<FoleonReaderKey, FoleonReaderLayoutKey>` mapping. There is no string-coercion or tone-based inference path.

## Preview-to-Production Parity

For each lane:

- preview and ready render through the **same** lane wrapper component.
- preview and ready emit the **same** `data-foleon-reader-layout` and `data-foleon-reader-lane` markers.
- `data-foleon-reader-state` distinguishes the two states (`"preview"` vs `"ready"`).
- the legacy `data-preview-tone` and `data-foleon-preview-route` markers are preserved on the inner preview section so existing assertions and any external observers continue to function.

The shared compatibility shell renders preview vs ready surfaces from the same view-model contract, so adding fields once propagates to both states. Later prompts can replace each lane wrapper independently without disturbing this parity.

## Behavior Preserved

| Concern | Preservation |
|---|---|
| Loading state | `FoleonLoadingState` rendered when state.kind is `'loading'`; identical render path. |
| Error state | `FoleonError` rendered when state.kind is `'error'` or resolution.kind is `'error'`. |
| Blocked state | `FoleonError` rendered with `"blocked by <reason>"` description. `onGateBlocked` callback fires with the same gate reason via `gateReasonFromBlocked`. |
| Status reporting | `onStatusChange` callback fires with the same `kind` values (`loading`, `preview`, `ready`, `blocked`, `error`) and the same payload shape. |
| Iframe lifecycle | `FoleonIframeHost` is constructed by the orchestrator with the same `src`, `title`, `policy`, `onLoaded`, `onError` props. `onReaderOpen` / `onReaderClose` semantics unchanged. |
| Origin policy | `contract.originPolicy` flows directly into `FoleonIframeHost.policy`. No change. |
| Reader telemetry | Preview emits no telemetry; ready emits via existing callbacks. Tested. |
| Mobile lazy-mount | Mobile detection (`window.matchMedia('(max-width: 720px)')`) is unchanged. The "Open reader" button and the collapsed `.mobileCard` placeholder render via the view model's `actions` and `mobileGate` fields; clicking the button fires `onActivateMobileReader` which sets `readerOpen = true`. Existing test (`keeps mobile readers collapsed until user activation`) passes unchanged. |
| Three-lane independence | The registry-routed lanes are still independent: each renders its own state, view model, and iframe (or no iframe). The "renders all three embedded reader lanes in one React tree" test passes with the new lane markers. |
| Accessibility | `aria-labelledby` relationship preserved via `viewModel.titleElementId`. Iframe `title` preserved via `viewModel.iframe.title`. Mobile-collapsed reader `aria-label` preserved. Preview "Preview layout" label preserved as visible text. No non-semantic wrappers obscure headings or actions. |

## Tests Added / Updated

**New** `packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts` (17 tests):

- `resolveFoleonReaderLayoutKey` maps each governed reader key to the matching lane.
- Preview adapter: emits preview state, lane-specific eyebrow, explicit `Preview layout` label, defaults audience/archive group, emits no actions/iframe/mobile gate, includes the `Content coming soon` chip.
- Ready adapter freshness preference: Spotlight prefers `issueDate`; Pulse and Leadership prefer `lastEditorialUpdate`. Each rule asserted with concrete date strings.
- Ready adapter defaults: missing `primaryAudience` → `Companywide`; missing `archiveGroup` → `Archive coming soon`.
- Iframe model: title formatted as `"<lane title>: <record title>"`, visibility flag honors `shouldMountIframe`.
- Mobile gate: present and populated when `mobileGateActive` is true; absent otherwise.
- Actions: always includes `open-archive`; includes `open-mobile-reader` only when `mobileGateActive` is true. Action ordering is `[open-mobile-reader, open-archive]`.
- Warnings: passes through resolution warnings as a single admin warning string when present; empty otherwise.

**New** `packages/foleon-reader/src/readers/__tests__/FoleonReaderLayoutRegistry.test.tsx`:

- Each lane key has a unique component reference.
- `getFoleonReaderLayout` and `FOLEON_READER_LAYOUTS` are consistent.
- Each lane wrapper emits the correct `data-foleon-reader-layout` / `data-foleon-reader-lane` / `data-foleon-reader-state` markers.
- Preview and ready states for the same lane share the same `data-foleon-reader-layout` marker (only `data-foleon-reader-state` differs).
- Three lane wrappers in one tree emit three distinct layout markers — proving lane differentiation independent of tone color.

**Updated** `packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx`:

- The three-lane composition test now also asserts `data-foleon-reader-layout="project-spotlight"`, `data-foleon-reader-layout="company-pulse"`, `data-foleon-reader-layout="leadership-message"` are present (one per lane), and `[data-foleon-reader-state="preview"]` matches all three.
- All existing behavior assertions are preserved — none were changed.

## Validation Commands and Results

| Command | Scope | Result |
|---|---|---|
| `pnpm --filter @hbc/foleon-reader test` (`vitest run`) | full foleon-reader test suite | **8 files / 88 tests pass** |
| `pnpm --filter @hbc/foleon-reader check-types` | foleon-reader typecheck | clean |
| `pnpm --filter @hbc/foleon-reader lint` | foleon-reader lint | clean |
| `pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage` | hbHomepage consumer surface | **32 files / 469 tests pass** (includes the package-authority lockstep test) |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | hb-webparts typecheck | 4 errors **all pre-existing on `main`** (verified via `git stash` round-trip in Prompt 01): `homepage/__tests__/hbKudosAccessibilityGuardrails.test.tsx`, `homepage/__tests__/homepageHeroDaypartPrecedence.test.tsx`, `priorityActionsRail/PriorityActionsRail.tsx`. None reference any file changed in this prompt. |

## Package / Versioning Impact

`hb-intel-homepage` SPFx solution + web-part + launcher constant + runtime-copy manifest are advanced together to `1.1.82.0`, satisfying the `hbHomepagePackageAuthority.test.ts` lockstep contract. Specifically:

- `apps/hb-homepage/config/package-solution.json` solution.version: `1.1.80.0` → `1.1.82.0`.
- `apps/hb-homepage/config/package-solution.json` features[0].version: `1.1.80.0` → `1.1.82.0`.
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` version: `1.1.80.0` → `1.1.82.0`.
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` version: `1.1.81.0` → `1.1.82.0`.
- `packages/homepage-launcher/src/constants.ts` `HOMEPAGE_LAUNCHER_VERSION`: `'1.1.80.0'` → `'1.1.82.0'`.

**Lockstep correction note.** The Prompt-01 commit (`ac2a9e869`) bumped the runtime-copy manifest at `apps/hb-webparts/src/.../HbHomepageWebPart.manifest.json` to `1.1.81.0` but did not bump the authoritative files at `apps/hb-homepage/...` or `packages/homepage-launcher/...`. The `hbHomepagePackageAuthority.test.ts` lockstep test was failing on `main` as a result. Prompt 02 corrects the lockstep by advancing **all** authority files together to `1.1.82.0`, which is the version of record for the new view-model + registry surface introduced here. The test now passes.

`@hbc/foleon-reader/package.json` (`0.1.0`) is **not** bumped — it is a workspace package with no public version contract beyond its `package.json` field, and the consumer's lockstep is governed by the SPFx authority files, not by the foleon-reader package version.

The output rendered at `data-shell-post-hero` and inside each Foleon lane slot is **visually unchanged by default** (compatibility layout reuses existing CSS classes and structure). New DOM wrappers (the lane-wrapper `<div>` carrying `data-foleon-reader-layout` markers) add additive elements but no visible geometry, color, or chrome change. The DOM is not byte-identical because of these new wrappers and markers.

## Known Follow-Up Work

- **Prompt 03** — Project Spotlight reader layout (replace `ProjectSpotlightReaderLayout` body with the lane-specific composition; stop delegating to `FoleonReaderCompatibilityLayout`).
- **Prompt 04** — Company Pulse reader layout.
- **Prompt 05** — Leadership Message reader layout.
- **Prompt 06** — Testing / package / hosted proof: Playwright / browser visual-regression coverage for all three lanes in both states; hosted geometric proof of the dormant Prompt-01 edge contract; tenant rollout runbook.
- **Plan-corpus path drift** — implementation README still references `spfx/foleon/phase-04/` while live phase plans live under `spfx/foleon-manage/phase-04/`. Resolve canonical location before Prompt 03.

## Risks / Mitigations

| Risk | Mitigation |
|---|---|
| Lane redesign in Prompts 03 / 04 / 05 introduces regressions in preview rendering. | The view model adapter is unit-tested against per-lane defaults; later prompts can refactor lane composition without rewriting the adapter contract. |
| Layout-key resolver becomes stale if `FoleonReaderKey` gains a new value. | The mapper is a `Record<FoleonReaderKey, FoleonReaderLayoutKey>` — adding a new reader key without updating the mapper is a TypeScript error. |
| External consumers depended on `FoleonReaderPreview` being routed through the module. | `FoleonReaderPreview` is preserved as a public export; only the in-module preview render path changes. External consumers using the standalone component are unaffected. |
| Iframe element construction now lives in the orchestrator and is passed via prop, raising a question of which side owns the wrapping container. | The compatibility shell wraps `iframeSurface` in `.frameWrap` (today's structure). Lane-specific Prompts 03/04/05 may decide to own the wrapping themselves, in which case the orchestrator simply continues passing the raw `<FoleonIframeHost>` element. |
| New DOM wrappers could affect CSS selectors that target the outermost reader element. | Existing markers (`data-preview-tone`, `data-foleon-preview-route`, `.shell`, `.chrome`, etc.) are preserved on the inner section. Selectors that key on those continue to function. The new wrapper carries only data attributes, no class names that compete with existing styles. |
| Tests now assert more layout markers, but tone is still emitted — could mask a regression where tone is dropped without breaking layout assertions. | Layout-marker assertions are additive; tone-marker assertions remain in the same test. A regression that drops either side will fail the existing test. |
| Prompt-01 lockstep was broken on `main` and is being corrected here. Reviewers may not have noticed the breakage if they only ran the foleon-reader package. | The lockstep test (`hbHomepagePackageAuthority.test.ts`) is part of the hbHomepage suite and now passes; the report calls out the correction explicitly. |

## Rollback Plan

The change set is purely additive at the architecture level (new files + a refactor of one file + version bumps). Rollback steps:

1. **Source rollback:** revert the foleon-reader file additions and the `FoleonReaderModule.tsx` refactor. The orchestrator's previous inline composition is preserved in git history.
2. **Test rollback:** delete the two new test files; revert the additive assertions in `FoleonReaderModule.test.tsx`.
3. **Version rollback:** revert all five version files to `1.1.80.0` (note: this also unwinds Prompt-01's runtime-copy bump to `1.1.81.0` — that was incomplete by itself, so unwinding it back to `1.1.80.0` is the cleanest restoration).
4. **Deploy rollback:** redeploy the prior `.sppkg` (solution `1.1.80.0`).

Because the public visual output is unchanged by default and the new layout markers are purely additive DOM attributes, no consumer-side rollback is required.
