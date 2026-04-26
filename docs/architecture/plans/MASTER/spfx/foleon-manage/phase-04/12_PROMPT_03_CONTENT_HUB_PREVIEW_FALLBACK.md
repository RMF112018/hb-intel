# Updated Prompt 03 — Content Hub Preview Fallback

## Objective

Implement the **Content Hub preview fallback** for the `hb-intel-foleon` SPFx application when the Foleon content registry is configured but has **zero live records**, while preserving the existing filter/search no-result behavior when live records do exist.

The Content Hub preview must show the **shape of the intended archive experience** — not fake live content. It should be a polished, clearly labeled, non-functional preview of the future archive layout, including placeholder containers, metadata zones, filter/archive cues, and future reader-action locations.

## Current repo state to treat as source context

Work from the live repo `main` branch.

Prompt 01 has already completed:

```text
d583a8be9238e88ae45b08d8c7d076948d9882c4 — hb-intel-foleon: add preview fixture model
```

Prompt 01 added isolated preview model/data files:

- `apps/hb-intel-foleon/src/preview/FoleonPreviewTypes.ts`
- `apps/hb-intel-foleon/src/preview/FoleonPreviewData.ts`
- `apps/hb-intel-foleon/src/preview/__tests__/FoleonPreviewData.test.ts`

Known exports include:

- `FOLEON_PREVIEW_HIGHLIGHTS`
- `FOLEON_PREVIEW_HUB_RECORDS`
- `getFoleonHighlightsPreviewRecords()`
- `getFoleonHubPreviewRecords()`
- `isFoleonPreviewRecord()`

Prompt 02 has already completed:

```text
3322beb3f98cbff65a96649d7e9f37900859e91c — hb-intel-foleon: add highlights preview fallback
```

Prompt 02 added preview-only UI for the Highlights route:

- `apps/hb-intel-foleon/src/components/FoleonPreviewCard.tsx`
- `apps/hb-intel-foleon/src/components/FoleonPreviewFallback.tsx`
- `apps/hb-intel-foleon/src/components/FoleonPreviewFallback.module.css`
- `apps/hb-intel-foleon/src/components/__tests__/FoleonPreviewFallback.test.tsx`
- `apps/hb-intel-foleon/src/pages/__tests__/HighlightsPage.preview.test.tsx`

Prompt 02 behavior is accepted and must be preserved:

- Preview renders the intended Foleon Highlights app structure.
- Preview uses banner, feature container, compact containers, CSS media placeholders, metadata zones, summary blocks, and future action labels.
- Preview records are not passed into `FoleonCard`, `onOpenReader`, `onOpenExternal`, or `onCardImpression`.
- No fake working buttons, disabled reader buttons, anchors, iframes, mock URLs, or fake reader areas were introduced.
- Config/fetch errors still render `FoleonError`.
- Live records suppress preview fallback.
- No package or manifest version was changed.

## Global instructions for the code agent

- Use the live repo `main` branch as source of truth.
- Do not rely on prior summaries without verifying the relevant current source files.
- Do not re-read files already within your current context unless verifying a specific line, contradiction, or diff.
- Do not touch unrelated `.gitignore`, Safety files, untracked phase docs, or unrelated dirty files.
- Do not implement beyond this prompt's scope.
- Preserve current Foleon runtime proof and diagnostics.
- Preserve the runtime config bridge, manual Foleon property pane behavior, safe defaults, and diagnostics behavior introduced through versions `1.0.14.0`–`1.0.16.0`.
- Do not weaken reader origin, iframe, publish-status, display-window, or preview-URL gates.
- Do not add backend dependencies for preview content.
- Do not change SharePoint list provisioning.
- Do not change package or manifest version in Prompt 03.
- Stage only Prompt 03 files when committing.

## Files to inspect

Inspect only as needed to verify current repo truth and Prompt 01/02 implementation details:

- `apps/hb-intel-foleon/src/pages/ContentHubPage.tsx`
- `apps/hb-intel-foleon/src/components/FoleonPreviewFallback.tsx`
- `apps/hb-intel-foleon/src/components/FoleonPreviewCard.tsx`
- `apps/hb-intel-foleon/src/components/FoleonPreviewFallback.module.css`
- `apps/hb-intel-foleon/src/preview/FoleonPreviewData.ts`
- `apps/hb-intel-foleon/src/preview/FoleonPreviewTypes.ts`
- `apps/hb-intel-foleon/src/components/FoleonStates.tsx`
- existing Foleon component/page test conventions under:
  - `apps/hb-intel-foleon/src/components/__tests__/`
  - `apps/hb-intel-foleon/src/pages/__tests__/`
  - `apps/hb-intel-foleon/src/services/__tests__/`

## Files likely to modify

Expected files:

- `apps/hb-intel-foleon/src/pages/ContentHubPage.tsx`
- `apps/hb-intel-foleon/src/components/FoleonPreviewFallback.tsx`
- `apps/hb-intel-foleon/src/components/FoleonPreviewCard.tsx` only if it needs a Hub-safe variant
- `apps/hb-intel-foleon/src/components/FoleonPreviewFallback.module.css` only if Hub layout styling is needed
- `apps/hb-intel-foleon/src/pages/__tests__/ContentHubPage.preview.test.tsx`
- existing preview fallback component tests if route coverage must be expanded

Do **not** modify unless TypeScript or current component shape proves a strict need:

- `apps/hb-intel-foleon/src/pages/HighlightsPage.tsx`
- `apps/hb-intel-foleon/src/FoleonApp.tsx`
- `apps/hb-intel-foleon/src/types/foleon-content.types.ts`
- `apps/hb-intel-foleon/src/services/FoleonContentService.ts`
- `apps/hb-intel-foleon/src/services/FoleonPlacementService.ts`
- runtime/proof files
- SharePoint provisioning assets
- package/manifest/version files

## Implementation requirements

### 1. Preserve the core Hub distinction

Update `ContentHubPage.tsx` so it distinguishes:

1. **Configured + fetch succeeds + `state.records.length === 0`**
   - Render Hub preview fallback.
   - This means no real registry content exists yet.

2. **Configured + live records exist + filters/search produce `filtered.length === 0`**
   - Render the existing filter-specific empty state.
   - Do **not** render full preview fallback.

3. **Configured + live records exist + filtered records exist**
   - Render live archive cards through `FoleonCard`.
   - Preview fallback must be suppressed.

4. **Missing config**
   - Render `FoleonError`, not preview fallback.

5. **Fetch error**
   - Render `FoleonError`, not preview fallback.

### 2. Render Hub preview using existing Prompt 01/02 preview architecture

Use `getFoleonHubPreviewRecords()` from `FoleonPreviewData.ts`.

The expected empty-registry branch should be conceptually equivalent to:

```tsx
state.kind === 'ready' && state.records.length === 0 ? (
  <FoleonPreviewFallback
    route="hub"
    records={getFoleonHubPreviewRecords()}
  />
) : ...
```

Adjust exact syntax to match the accepted current component contract.

### 3. Hub preview should show the shape of the intended archive app

The Hub preview must not look like a simple empty state and must not pretend sample content is live.

It should show a polished static archive preview structure, such as:

- Clear preview/status banner explaining this is sample layout content.
- Archive/header area that communicates “All publications” / content archive posture.
- Search/filter area or filter-chip preview cues where appropriate.
- A grid/list of preview publication containers using Hub fixture records.
- Placeholder media/image zones using CSS gradients, abstract blocks, or branded shapes.
- Metadata placeholder areas for:
  - content type
  - issue/date
  - project/sector/region
  - summary text
- Future reader-action location that clearly communicates where `Read` or `Open` actions will appear later without rendering a working or disabled CTA.

Acceptable copy examples:

- `Preview archive layout`
- `Sample content structure`
- `Content coming soon`
- `Reader links will appear when published Foleon content is connected`
- `Filters will apply to live publications once the registry is populated`

### 4. Keep preview non-functional and non-deceptive

Do not implement:

- fake working buttons
- disabled `Read` buttons
- `<button disabled>`
- clickable-looking controls without handlers
- anchors without real `href`
- fake external links
- mock Foleon URLs
- fake iframes or reader previews
- fake reader areas
- telemetry for preview impressions
- preview records inside `FoleonCard`
- preview records inside `onOpenReader`, `onOpenExternal`, or search/card telemetry paths

The future action location must be a non-interactive label, badge, caption, or static pill.

Acceptable example:

```tsx
<span
  className={styles.previewActionLabel}
  aria-label="Preview only. Reader links will be available when published Foleon content is connected."
>
  Preview only · Reader links not active
</span>
```

### 5. Keep search/filter telemetry correct

Current `ContentHubPage.tsx` emits search telemetry through `onSearch` when the user enters a non-empty query.

Do not emit search/card/open telemetry for preview fixture records.

Recommended behavior:

- Keep the visible search/filter controls if they are part of the Hub page chrome.
- When `state.records.length === 0`, entering search text should not cause preview fixture filtering unless intentionally implemented as sample-only filtering with clear copy.
- Do not add telemetry tied to preview records.
- If current search telemetry fires merely because a user types in the real Hub search control while the registry is empty, do not expand it to include preview record metadata. If this existing behavior is ambiguous, document it in the closure report rather than broadening scope.

### 6. Component behavior

If `FoleonPreviewFallback` currently supports only `route="highlights"`, extend it to support:

```ts
route: "highlights" | "hub"
```

The Hub route variant should be visually related to the Highlights preview but should communicate archive/listing posture.

Suggested route-specific behavior:

- `highlights`
  - one feature card + supporting compact cards
  - homepage/highlight language

- `hub`
  - archive layout preview
  - optional filter/search skeleton row
  - grid of preview archive cards
  - archive-oriented copy

Do not regress the existing Highlights preview tests or behavior.

### 7. Type safety

Rely on TypeScript boundaries to keep preview records out of live paths.

Do not use unsafe casts such as:

```ts
record as unknown as FoleonContentRecord
```

Do not change `FoleonPreviewRecord` to become structurally compatible with `FoleonContentRecord`.

Do not modify `FoleonContentRecord` for preview purposes.

## Explicit non-goals

- Do not change Highlights behavior already implemented in Prompt 02 except to safely extend shared preview components for Hub support.
- Do not change Reader behavior.
- Do not change Manager behavior.
- Do not add backend/list dependencies.
- Do not change package version.
- Do not change manifest version.
- Do not run packaging unless repo convention unexpectedly requires it.
- Do not add `.sppkg` artifacts.
- Do not modify Safety files or unrelated webparts.
- Do not create a fake Foleon reader or iframe preview.
- Do not create real mock URLs.
- Do not add tenant REST auto-discovery.

## Testing requirements

Add or update tests proving the following.

### Content Hub page behavior

Add:

- `apps/hb-intel-foleon/src/pages/__tests__/ContentHubPage.preview.test.tsx`

Test cases must prove:

1. Configured + zero registry records renders Hub preview fallback.
2. Zero registry records does **not** render the filter-specific empty state as the primary body.
3. Live records + no filter active renders live archive through live card output, not preview.
4. Live records + search miss renders filter-empty copy, not preview.
5. Live records + type filter miss renders filter-empty copy, not preview.
6. Fetch error renders archive error, not preview.
7. Missing config renders configuration error, not preview.
8. Preview fallback does not call `onOpenReader` or `onOpenExternal`.
9. Preview fallback does not pass preview records into live card behavior.
10. Live record path still supports live card behavior.

### Preview component behavior

Update existing preview component tests, or add route-specific tests, to prove:

1. `route="hub"` renders archive-specific preview language.
2. Hub preview renders structural placeholder elements:
   - preview/status banner
   - archive/search/filter skeleton or cue
   - preview card grid/list
   - media placeholder zones
   - metadata placeholder zones
   - future action label
3. Hub preview has no anchors.
4. Hub preview has no iframes.
5. Hub preview has no fake working buttons.
6. Hub preview has no disabled reader buttons.
7. Hub preview does not expose live open/external/telemetry handlers.
8. Existing `route="highlights"` behavior still passes.

Use current testing-library/Vitest conventions already present in the repo.

## Validation commands

Run the required checks after implementation and document results:

```bash
git status --short
git branch --show-current
git log -5 --oneline

pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
```

Do not run packaging unless a repo rule unexpectedly requires it. If such a rule appears, stop before changing package or manifest versions and report the issue.

## Commit rules

- One focused commit for this prompt if changes are made.
- Stage only Prompt 03 files.
- Do not include generated `.sppkg` binaries.
- Do not include unrelated dirty/untracked files.
- Do not change package or manifest version.
- Commit message format:
  - Summary: `hb-intel-foleon: add content hub preview fallback`
  - Body: include:
    - changed behavior
    - tests run
    - runtime proof impact
    - telemetry impact
    - confirmation no package/manifest version changes
    - confirmation no Highlights regression
    - any deferred Prompt 05 packaging/version proof items

## Required closure report

```md
# Closure Report

## Summary
## Files Changed
## Behavior Implemented
## Tests Added / Updated
## Validation Commands and Results
## Runtime Proof Impact
## Telemetry Impact
## Preview / Open Safety
## Live Data Precedence
## Filter/Search No-Result Behavior
## Package / Manifest Version
## Risks / Follow-Ups
## Commit
```

The closure report must explicitly confirm:

- Hub preview renders only for configured + successful empty registry.
- Search/filter misses on an existing live corpus render the filter-specific empty state, not the full preview.
- Live records suppress preview fallback.
- Config errors and fetch errors still render `FoleonError`.
- No fake CTAs, disabled reader buttons, anchors, iframes, mock URLs, or fake reader areas were introduced.
- Preview records do not enter `FoleonCard`, `onOpenReader`, `onOpenExternal`, card impression telemetry, reader routing, or external-open paths.
- No package or manifest version changed.
