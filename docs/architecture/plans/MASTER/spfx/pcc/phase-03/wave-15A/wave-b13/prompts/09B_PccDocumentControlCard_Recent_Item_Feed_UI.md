# Phase 08 Prompt 09B — Redesign `PccDocumentControlCard` into PCC-Native Recent-Item Feed Tabs

## Role
Act as the implementation owner for Phase 08 Prompt 09B. Execute the Project Home card redesign only after Prompt 09A is fully landed.

## Baseline / Preflight
Before editing:
1. Confirm Prompt 09A is committed and present in local HEAD.
2. Confirm current branch / HEAD.
3. Confirm intentional package / manifest posture remains aligned at the current operator-approved baseline, expected to begin from **`1.0.0.222`** unless a subsequent intentional bump was already recorded.
4. Capture `git status --short`.
5. Preserve any operator-owned WIP.

Do **not** re-read files still within current context or memory unless local drift is suspected or an exact edit location is needed.

## Parallel Document Control Surface Safety — Mandatory
There is active parallel work occurring on the **dedicated Document Control surface**. Prompt 09B must not disrupt it.

Rules:
- Do not edit any file under `apps/project-control-center/src/surfaces/documents/`.
- Do not alter the dedicated Documents surface source-lane architecture.
- Do not roll back or overwrite shared-model changes from parallel work.
- If `PccDocumentControlCard.tsx` or shared model imports have drifted locally, merge only the Prompt 09B card redesign into the latest local state and report the drift.

## Objective
Replace the current **source-lane / source-posture tile body** of Project Home `PccDocumentControlCard` with a compact, SharePoint-inspired recent-item feed driven by the Prompt 09A home-feed contract.

The card keeps:
- eyebrow `Documents`;
- title `Document Control Center`;
- gateway action `Open Document Control`;
- card-level preview/degraded state behavior.

The body becomes:
- PCC-native card tab buttons:
  - `My Recent Files`
  - `Latest Changes`
- a compact top-five preview feed for the active tab.

## Product Decisions — Closed
1. Scope is only `PccDocumentControlCard`, not the dedicated Documents surface.
2. Default selected tab on mount: `My Recent Files`.
3. The view switcher must be **tab buttons uniquely designed for PCC cards**, not a generic segmented toggle.
4. Row items remain preview-only and non-executable in this phase.
5. Add explicit developer-facing documentation in the card component that row-level deep links are deferred until canonical source paths / Procore record paths are established in a later phase.
6. `Open Document Control` remains the only card-level enabled gateway action.

## Required Accessibility Contract for Card Tabs
Implement a compact local tab pattern:
- wrapper: `role="tablist"` with a concise aria-label;
- two native `<button type="button" role="tab">`;
- active tab:
  - `aria-selected="true"`
  - `tabIndex={0}`
- inactive tab:
  - `aria-selected="false"`
  - `tabIndex={-1}`
- one visible panel at a time:
  - `role="tabpanel"`
  - `aria-labelledby=<active tab id>`
- support keyboard navigation:
  - ArrowLeft / ArrowRight toggles focus between the two tabs;
  - Home / End moves to first / last tab;
  - Enter / Space selects focused tab if not already selected.
- Do not generalize this into a new shared tab primitive; this is a local card-level pattern.

## Required Data / Marker Contract
Add stable markers sufficient for unit and later Playwright evidence:

Card-level:
```text
data-pcc-document-control-card
data-pcc-document-control-feed-mode="my-recent-files|latest-changes"
```

Tab controls:
```text
data-pcc-document-control-feed-tab="my-recent-files|latest-changes"
data-pcc-document-control-feed-tab-state="active|inactive"
```

Panel:
```text
data-pcc-document-control-feed-panel="my-recent-files|latest-changes"
```

Feed items:
```text
data-pcc-document-control-feed-item
data-pcc-document-control-feed-item-id="<id>"
data-pcc-document-control-feed-item-source="sharepoint|onedrive|procore"
data-pcc-document-control-feed-item-kind="<kind>"
data-pcc-document-control-feed-item-deep-link-posture="preview-only|future-deep-link"
```

Latest Changes items also emit:
```text
data-pcc-document-control-feed-change-kind="added|updated"
```

## UI Anatomy

### Card header
Keep current card shell and gateway action.

### Card tab band
Design a compact PCC-specific card tab band:
- token-only styling;
- visually distinct from global nav tabs;
- clearly belongs inside the card chrome;
- active tab should have a stronger card-local rail / inset / surface treatment;
- inactive tab should remain obviously selectable but not over-emphasized;
- no raw colors;
- no new global tokens unless existing repo practice demands it.

### Feed list
Render exactly the active feed array in a compact vertical list:
- default to top five supplied by Prompt 09A;
- do not re-sort in JSX unless defensive sorting is required; fixture/read-model order should already be deterministic;
- each row is non-interactive, not a button, not an anchor.

Recommended row anatomy:
1. Row title — single line, truncate/ellipsis if needed.
2. Compact metadata line:
   - source pill/chip;
   - kind label;
   - recency or change-state label.
3. Optional context line:
   - use `contextLabel`;
   - clamp / truncate to preserve height discipline.

### My Recent Files
Display:
- item title;
- source;
- kind;
- accessed recency/date based on fixed fixture time or already supplied deterministic timestamp;
- context label.

### Latest Changes
Display:
- item title;
- source;
- kind;
- `Added` or `Updated`;
- changed recency/date;
- context label.

Do not use live wall-clock labels that make tests nondeterministic unless the formatter is fixture-anchored.

## Empty / Degraded Behavior
- If `state !== 'preview'`, preserve existing card-level `PccPreviewState` handling.
- If `state === 'preview'` but the selected feed array is empty, render a compact in-card empty message using production-grade copy. Do not collapse the card.
- No tooltip-only explanations.

## `PccDocumentControlCard` Props
Retarget the card props from:
- `sources?: readonly IDocumentControlSource[]`
to:
- a feed view model or `homeFeed?: IPccDocumentControlHomeFeed`.

Use the Prompt 09A Project Home adapter seam. Do not keep the old source-tile body hidden behind branching compatibility unless a local test proves a narrow transitional seam is required. The Project Home summary card should fully move to the new feed-body architecture.

## CSS
Update `PccProjectHome.module.css` or the repo-appropriate Project Home card CSS surface with:
- card tab band styling;
- active/inactive card tab states;
- compact list spacing;
- row title truncation;
- metadata chips / labels;
- empty state posture.

Constraints:
- no raw colors;
- no new global resets;
- no pointer affordance on feed rows;
- no source-system link visual treatment that implies clickability;
- respect current PCC token system and existing card radii / accent discipline.

## Tests
Create/update focused tests to cover:
1. `PccDocumentControlCard` renders My Recent Files by default.
2. It renders exactly five preview feed rows for sample feed.
3. Clicking `Latest Changes` activates the latest-changes panel and hides the my-recent panel.
4. Keyboard tab navigation follows the required local tab behavior.
5. Tab roles / aria-selected / aria-labelledby / tabIndex are correct.
6. Feed row markers emit source, kind, id, deep-link posture.
7. Latest Changes emits change-kind markers.
8. No feed row is an anchor or button.
9. The gateway action remains present and unchanged.
10. Non-preview card states still render the existing preview-state posture.
11. Empty selected feed state renders compact copy.
12. Old Project Home-only source-lane/tile tests are replaced or retired correctly; dedicated Documents surface tests are untouched.

Prefer a dedicated focused test file for the card if none exists, then update only Project Home order/composition tests where the card body assumptions changed.

## Out of Scope / Hard Stops
- No edit to `apps/project-control-center/src/surfaces/documents/`.
- No live Graph / SharePoint / Procore calls.
- No item deep links or hrefs.
- No row-level source launches.
- No package/manifest/version bump unless operator explicitly owns a separate version bump outside this prompt.
- No lockfile mutation.
- No dependency additions.
- No Project Home bento reorder/span work yet.
- No analytics card reorder yet.

## Validation
Run:
```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <all prompt-touched files>
git diff --check
```

If shared model types were touched by follow-up drift resolution, also run:
```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

Record lockfile MD5 before/after.

## Closeout Format
Return:
1. Verdict
2. Starting/ending HEAD
3. Files changed
4. Card tab interaction summary
5. Feed UI summary
6. Explicit statement that dedicated Documents surface files were untouched
7. Test results
8. Lockfile MD5 before/after
9. Commit summary/description if committed
10. Follow-up visual watchpoints for Prompt 09C / 09E
