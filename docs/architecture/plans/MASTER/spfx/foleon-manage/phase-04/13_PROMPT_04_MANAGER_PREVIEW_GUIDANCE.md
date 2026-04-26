# Updated Prompt 04 — Manager Preview Guidance

## Objective

Implement a narrowly scoped, read-only Manager-route guidance panel that explains the public preview fallback behavior now implemented for Foleon Highlights and Content Hub.

The Manager route must remain the authoritative administrative workflow for real Foleon content, placement, validation, sync, and publication management. This prompt must not create sample records, editable preview records, preview telemetry, or alternate public-route behavior.

## Current Repo Progress to Treat as Source Context

The implementation sequence has progressed as follows:

1. **Prompt 01 complete** — commit `d583a8be9238e88ae45b08d8c7d076948d9882c4`
   - Added isolated preview model and fixtures under `apps/hb-intel-foleon/src/preview/`.
   - Preview records use `source: 'preview'`, string `preview-*` IDs, display-only fields, and no URL/doc/item/embed/telemetry/open fields.
   - Preview records are intentionally not structurally assignable to `FoleonContentRecord`.

2. **Prompt 02 complete** — commit `3322beb3f98cbff65a96649d7e9f37900859e91c`
   - Added Highlights preview fallback for configured + successful empty public Highlights reads.
   - Added preview-specific UI components instead of passing preview records into `FoleonCard`.
   - Preview renders the intended Highlights app shape using placeholder containers/components/elements.
   - No fake CTAs, disabled reader buttons, anchors, iframes, mock URLs, fake reader areas, or preview telemetry were added.

3. **Prompt 03 complete** — commit `a42901ce728c8c454b7cdaceef9a13bba89b0a4b`
   - Added Content Hub preview fallback for configured + successful empty registry reads.
   - Hub preview renders archive-specific app shape: preview banner, search/filter cues, publication placeholder grid, metadata zones, media placeholders, summaries, and future reader-action labels.
   - Empty-registry search updates local input only and does not call `onSearch` or emit normal live Search telemetry.
   - Live records suppress the Hub preview, and live-corpus filter/search misses still render the filter-specific empty state.

Prompt 04 must build on that posture. It should explain the preview fallback to admins in the Manager route when the Manager data load succeeds but there are no real content records yet.

## Global Instructions for the Code Agent

- Work in `/Users/bobbyfetting/hb-intel` on the live repo.
- Use `main` as source of truth.
- Start from the current repo state after Prompt 03 commit `a42901ce728c8c454b7cdaceef9a13bba89b0a4b` unless the local branch has moved forward.
- Do not rely on prior summaries without verifying source files that are directly relevant to this prompt.
- Do not re-read files already within your current context unless verifying a specific line, contradiction, or diff.
- Do not touch unrelated `.gitignore`, Safety files, untracked phase docs, generated zip files, or unrelated dirty/staged work.
- Stage only files changed for this prompt.
- Do not implement beyond this prompt's scope.
- Preserve current Foleon runtime proof and diagnostics.
- Preserve the runtime config bridge, manual Foleon property pane behavior, safe defaults, and diagnostics behavior introduced through versions `1.0.14.0`–`1.0.16.0`.
- Do not weaken reader origin, iframe, publish-status, display-window, external-open, or preview-URL gates.
- Do not add backend dependencies for preview content.
- Do not change SharePoint list provisioning.
- Do not change package or manifest version in Prompt 04.
- Do not run packaging in Prompt 04 unless a repo rule unexpectedly requires it; if that happens, stop before changing version/package artifacts and report the issue.

## Files to Inspect

Inspect only what is needed for Manager-route guidance and test integration:

- `apps/hb-intel-foleon/src/pages/ManagePage.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageMetricCards.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageRegistryPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageContentEditorPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManagePlacementPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageSyncPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/manage/foleonManageTokens.css`
- Existing Manager tests under `apps/hb-intel-foleon/src/pages/manage/**/__tests__/**` or nearby test conventions, if present.
- Existing preview component tests only if needed to confirm terminology alignment; do not modify public preview behavior in this prompt.

## Files Likely to Modify

Expected changes should be limited to:

- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- Optional new component: `apps/hb-intel-foleon/src/pages/manage/ManagePreviewGuidancePanel.tsx`
- Manager-route tests, following existing repo conventions.

Do **not** modify these files unless TypeScript proves a strict dependency:

- `apps/hb-intel-foleon/src/components/FoleonPreviewFallback.tsx`
- `apps/hb-intel-foleon/src/components/FoleonPreviewCard.tsx`
- `apps/hb-intel-foleon/src/preview/FoleonPreviewData.ts`
- `apps/hb-intel-foleon/src/pages/HighlightsPage.tsx`
- `apps/hb-intel-foleon/src/pages/ContentHubPage.tsx`
- `apps/hb-intel-foleon/src/pages/ReaderPage.tsx`
- `apps/hb-intel-foleon/src/FoleonApp.tsx`
- runtime contract/proof files
- services/API files
- provisioning/schema files
- package/manifest files

## Implementation Requirements

### 1. Add read-only admin guidance only in the correct Manager state

Add a read-only guidance panel only when all are true:

- Manager API load has succeeded (`state.kind === 'ready'`).
- The real Manager content array is empty (`state.content.length === 0`).
- The route is the Manager route through the existing Manager page/orchestrator path.

Do **not** show the guidance panel in:

- backend-blocked state;
- API/load error state;
- loading state;
- live-content-present state;
- public Highlights route;
- public Content Hub route;
- Reader route.

### 2. Explain the completed preview fallback accurately

The guidance should tell admins what they are seeing on public routes and how to replace it with live content.

Recommended copy direction:

- `Public preview layouts are active until published registry records exist.`
- `Highlights and Content Hub now show clearly labeled preview layouts when the configured Foleon lists are connected but empty.`
- `Preview layouts do not create records, open readers, call external links, or emit production content telemetry.`
- `Publish real Foleon content and create active placements to replace public previews automatically.`
- `Search/filter telemetry remains live-content only; empty-registry preview search does not emit normal Search telemetry.`

Keep the tone administrative and factual. Avoid marketing-heavy language.

### 3. Keep management workflows authoritative

The guidance panel may include non-interactive explanatory steps, but must not replace or change:

- sync workflows;
- registry list display;
- content editor behavior;
- placement panel behavior;
- validation status behavior;
- run history behavior;
- backend API request paths;
- SharePoint list writes;
- Foleon sync behavior.

If the current no-content state renders `FoleonEmpty title="No registry records yet." description="Create a draft or sync Foleon Docs."`, preserve or refine that empty message only as needed to coexist with the guidance panel.

### 4. No fake admin actions

Do not create:

- fake preview records in the Manager registry;
- sample editable rows;
- fake sync runs;
- fake placements;
- fake validation data;
- fake call-to-action buttons;
- disabled buttons that imply unavailable actions;
- anchors without real destinations;
- fake Foleon URLs;
- iframes or reader previews;
- preview telemetry events.

If the guidance includes steps, render them as text/list content, not as fake buttons.

### 5. Accessibility and UI standards

The guidance panel must be:

- keyboard-safe;
- screen-reader understandable;
- clearly labeled as guidance/admin information;
- visually aligned with the current Manager surface tokens/classes;
- not a generic thin-border white-card if current Manager styling offers a better local pattern;
- responsive within the existing Manager layout;
- not dependent on hover for meaning.

Use existing Manager CSS module/token patterns where possible.

## Explicit Non-Goals

- Do not implement public-route fallback here; Highlights and Hub fallback are already implemented.
- Do not change public preview UI unless a direct compile failure requires a narrow adjustment.
- Do not add a property pane setting for preview mode.
- Do not add route query parameters for preview mode.
- Do not add backend/list dependencies.
- Do not write preview data to SharePoint.
- Do not add new telemetry event types for preview guidance.
- Do not change package or manifest version.
- Do not run package proof in this prompt unless a repo rule unexpectedly requires it.

## Testing Requirements

Add or update tests according to current repo conventions. Tests must prove:

1. **Ready + zero content shows guidance**
   - Manager load succeeds with empty content.
   - Guidance panel renders with copy explaining public preview layouts.

2. **Ready + live content hides guidance**
   - Manager load succeeds with one or more content records.
   - Guidance panel does not render.

3. **Blocked state remains unchanged**
   - Backend-blocked state renders the existing blocked/error behavior.
   - Guidance panel does not render.

4. **Error state remains unchanged**
   - API/load error renders the existing error behavior.
   - Guidance panel does not render.

5. **No fake admin action surface**
   - Guidance panel does not render anchors, iframes, fake reader buttons, fake sync buttons, or disabled action buttons.
   - Guidance panel does not expose editable preview content.

6. **Preview safety language is present**
   - Tests assert text or accessible labels confirming preview layouts do not create records, open readers, or emit production content telemetry.

7. **Existing Manager workflows still render**
   - Metric cards, registry panel, placement panel, and sync panel remain present in the ready state as applicable.

Use mocks at the API boundary if current Manager tests use that pattern. Do not introduce broad integration fragility.

## Validation Commands

Run the following after implementation and document results:

```bash
git status --short
git branch --show-current
git log -5 --oneline

pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
```

If validation fails, fix Prompt 04-caused failures only. Document unrelated pre-existing failures without modifying unrelated files.

Do **not** run packaging or package proof in Prompt 04 unless a repo rule unexpectedly requires it. If such a rule appears, document it and stop before changing package/manifest version.

## Commit Rules

If changes are made and validation completes:

- Stage only Prompt 04 files.
- Do not stage unrelated dirty/untracked files.
- Create one focused commit.
- Commit summary:

```text
hb-intel-foleon: add manager preview guidance
```

Commit body must include:

- behavior implemented;
- tests/validation commands run;
- runtime proof impact;
- telemetry impact;
- confirmation no backend/provisioning/package/manifest changes were made;
- confirmation Highlights and Hub public preview behavior was not changed;
- deferred Prompt 05 packaging/version proof.

## Required Closure Report

Return this closure report:

```md
# Closure Report

## Summary

## Files Changed

## Behavior Implemented

## Tests Added / Updated

## Validation Commands and Results

## Runtime Proof Impact

## Telemetry Impact

## Public Preview Impact

## Manager Workflow Impact

## Package / Manifest Version

## Risks / Follow-Ups

## Commit
```

The closure report must explicitly confirm:

- Manager guidance appears only for ready + zero real content.
- Manager guidance does not appear for blocked, error, loading, or live-content-present states.
- No fake admin actions, fake records, fake placements, fake sync runs, anchors, iframes, fake reader buttons, or disabled action buttons were introduced.
- No preview records enter Manager editable workflows.
- No preview records enter live card/open/external/telemetry paths.
- Highlights behavior was not changed.
- Content Hub behavior was not changed.
- Runtime proof and diagnostics were not changed.
- No package or manifest version changed.
- Packaging was not run unless explicitly required by repo convention.
```
