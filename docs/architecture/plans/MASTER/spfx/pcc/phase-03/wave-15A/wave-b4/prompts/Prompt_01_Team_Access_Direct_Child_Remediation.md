# Prompt 01 — Team & Access Direct-Child and Breakpoint Remediation

## Objective

You are the local code agent working in the `hb-intel` repository. Implement the targeted PCC Team & Access direct-child remediation identified from the Wave 15A Playwright evidence and current repo-truth audit.

The goal is to remove the Team & Access read-model wrapper defect so every rendered `PccDashboardCard` remains a direct child of `PccBentoGrid` in all Team & Access render states.

This is a surgical remediation. Do not redesign Team & Access. Do not modify unrelated PCC surfaces.

## Context You Must Use

The current evidence run is:

```text
docs/architecture/evidence/pcc-live/20260507-134047/
```

Relevant evidence files:

```text
docs/architecture/evidence/pcc-live/20260507-134047/breakpoints-1778175676324/pcc-live-breakpoint-evidence.md
docs/architecture/evidence/pcc-live/20260507-134047/breakpoints-1778175676324/pcc-live-breakpoint-matrix.json
docs/architecture/evidence/pcc-live/20260507-134047/breakpoints-1778175676324/pcc-live-breakpoint-card-measurements.json
docs/architecture/evidence/pcc-live/20260507-134047/surface-screenshots-1778175753367/pcc-live-screenshot-evidence.md
docs/architecture/evidence/pcc-live/20260507-134047/surface-screenshots-1778175753367/pcc-live-dom-card-summary.json
```

Relevant source files:

```text
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessReadModelContent.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessLaneShell.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx
apps/project-control-center/src/tests/PccTeamAccessSurface.layout.test.tsx
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/useBentoRowSpan.ts
```

Do not re-read files that are already open and still within your current context or memory. Read only what is necessary to verify current repo-truth before editing.

## Evidence Finding To Remediate

The live breakpoint evidence reports:

```text
Surface/viewport pairs: 64
Screenshot count: 64
Card measurement count: 936
Warning count: 144
Mode mismatch count: 0
Horizontal overflow count: 0
Clipped card count: 89
Direct-child issue count: 32
```

The direct-child issue count is the highest-ROI defect because it is deterministic and maps cleanly to Team & Access:

```text
Team & Access card count: 4
Viewport count: 8
4 × 8 = 32 direct-child failures
```

The card measurements show Team & Access cards with:

```json
"directChildOfGrid": false
```

while Project Home and Documents cards remain direct children.

The breakpoint matrix also shows suspicious Team & Access grid measurements such as:

```json
"surfaceId": "team-and-access",
"measuredContainerHeight": 8
```

This is consistent with the direct-child wrapper defect.

## Repo-Truth Diagnosis

`PccShell` renders the active route content inside `PccBentoGrid`.

`PccTeamAccessLaneShell` correctly returns a `Fragment` of `PccDashboardCard` children:

```tsx
return (
  <Fragment>
    <PccTeamAccessHeaderCard />
    ...
    {showTeamViewer ? <PccTeamViewerLaneCard model={model} /> : null}
    {showPermissionRequest ? <PccPermissionRequestLaneCard model={model} /> : null}
    {showAccessManager ? <PccAccessManagerLaneCard model={model} /> : null}
  </Fragment>
);
```

The default/fixture path is already covered by `PccTeamAccessSurface.layout.test.tsx`, which verifies direct child behavior when rendering:

```tsx
<PccBentoGrid forceMode="desktop">
  <PccTeamAccessSurface previewPersona="project-manager" previewHasProjectSiteAccess={true} />
</PccBentoGrid>
```

The read-model path is the defect. `PccTeamAccessReadModelContent` wraps the lane shell in a `<div>`:

```tsx
return (
  <div data-pcc-team-access-read-model-content="preview">
    <PccTeamAccessLaneShell
      previewPersona={previewPersona}
      previewHasProjectSiteAccess={previewHasProjectSiteAccess}
    />
  </div>
);
```

That wrapper causes each `PccDashboardCard` in `PccTeamAccessLaneShell` to become a grandchild of `PccBentoGrid`, breaking the bento direct-child invariant.

The loading/error states also currently render bare wrapper `<div>` elements containing `PccPreviewState`. Those should be converted into `PccDashboardCard` children so all read-model states are compatible with bento direct-child rules.

## Required Implementation

### 1. Update `PccTeamAccessReadModelContent.tsx`

Refactor the component so it never returns a wrapper `<div>` as a direct child of `PccBentoGrid`.

#### Preview state

Return the lane shell directly:

```tsx
return (
  <PccTeamAccessLaneShell
    previewPersona={previewPersona}
    previewHasProjectSiteAccess={previewHasProjectSiteAccess}
  />
);
```

Do not wrap this in a `div`, `section`, `main`, or other element.

#### Loading state

Return a `PccDashboardCard` directly.

Requirements:

- `footprint="full"`
- `tier="state"` or other existing state-appropriate tier
- `region="state"`
- `headingLevel={2}`
- `eyebrow="Team & Access Center"` or a canonical surface display label
- `title="Loading team & access"`
- `dataActiveSurfacePanel="team-and-access"`
- body contains existing `PccPreviewState state="loading"` copy or improved equivalent

#### Error state

Return a `PccDashboardCard` directly.

Requirements:

- `footprint="full"`
- `tier="state"` or other existing state-appropriate tier
- `region="state"`
- `headingLevel={2}`
- `eyebrow="Team & Access Center"` or a canonical surface display label
- `title="Team and access unavailable"` or equivalent
- `dataActiveSurfacePanel="team-and-access"`
- body contains existing `PccPreviewState state="error"` copy or improved equivalent

#### Imports

Add only necessary imports:

```tsx
import { PCC_MVP_SURFACES } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
```

If `PCC_MVP_SURFACES` is already unavailable or creates an import collision, use the same surface label pattern as `PccTeamAccessHeaderCard.tsx`.

### 2. Preserve Active Panel Ownership

Across every Team & Access render state, exactly one element must carry:

```text
data-pcc-active-surface-panel="team-and-access"
```

The preview path should preserve ownership through `PccTeamAccessHeaderCard`.

The loading and error paths must set active panel ownership on their single state card.

### 3. Expand Tests

Update `apps/project-control-center/src/tests/PccTeamAccessSurface.layout.test.tsx`.

Add tests for the read-model path, not just the default fixture path.

You must cover:

1. Read-model preview path:
   - mock client resolves successfully
   - `PccTeamAccessSurface` receives `readModelClient`
   - Team Viewer, Permission Request, and Access Manager cards remain direct children of `[data-pcc-bento-grid]`
   - exactly one `data-pcc-active-surface-panel="team-and-access"` exists
   - no lane card is nested in another card

2. Read-model loading path:
   - before the async client resolves, rendered loading card is a direct child of `[data-pcc-bento-grid]`
   - exactly one active panel marker exists
   - no wrapper div becomes the only bento child

3. Read-model error path:
   - mock client rejects
   - rendered error card is a direct child of `[data-pcc-bento-grid]`
   - exactly one active panel marker exists

Use existing test style and helpers where possible.

Do not add brittle tests that depend on localized body copy unless necessary. Prefer structural selectors:

```text
[data-pcc-bento-grid]
[data-pcc-card]
[data-pcc-active-surface-panel]
[data-pcc-team-access-lane]
```

### 4. Do Not Change Shared Bento/Card Primitives Unless Necessary

Do not modify these files unless the targeted Team & Access changes fail to resolve the invariant:

```text
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/useBentoRowSpan.ts
apps/project-control-center/src/layout/PccBentoGrid.module.css
apps/project-control-center/src/layout/PccDashboardCard.module.css
```

Reason: the evidence indicates the direct-child issue is specific to the Team & Access read-model wrapper path. Shared primitive changes would introduce unnecessary blast radius.

### 5. Do Not Suppress Evidence Warnings

Do not alter Playwright capture logic to hide the problem.

Do not change:

```text
e2e/pcc-live/pcc-live.breakpoint-capture.ts
```

unless a separate evidence-quality task is explicitly opened later.

The current clipping/overflow warning count may be partly inflated because `PccDashboardCard.module.css` intentionally sets `.card { overflow: hidden; }`, and the capture helper treats `overflowX === "hidden"` or `overflowY === "hidden"` as overflow risk. That is not part of this remediation. This prompt targets the true-positive direct-child defect only.

## Prohibited Changes

Do not:

- redesign Team & Access
- add nested cards
- add wrapper elements between `PccBentoGrid` and `PccDashboardCard`
- suppress Playwright warnings
- change unrelated surfaces
- change evidence artifact files
- introduce live writes, mutations, Graph calls, PnP calls, or external SDK behavior
- change route IDs or surface taxonomy
- change the login/session behavior
- touch package versions unless the repo’s normal packaging workflow requires it

## Validation

Run targeted validation:

```bash
pnpm exec vitest run apps/project-control-center/src/tests/PccTeamAccessSurface.layout.test.tsx
```

Then run broader validation:

```bash
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test
pnpm --filter @hbc/project-control-center build
```

If the repo uses a different package filter name, inspect `package.json` and use the correct local workspace filter. Do not guess if the command fails because of package naming.

If a live tenant environment is available, rerun:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
```

Expected post-remediation evidence:

```text
Direct-child issue count: 0
Team & Access measuredContainerHeight: no longer 8
Mode mismatch count: 0
Horizontal overflow count: 0
```

The clipped-card count may remain nonzero because the capture rule conflates intentional `overflow: hidden` with actual clipping. Do not treat remaining clipping warnings as failure for this prompt unless the direct-child issue persists or screenshots visibly show true clipping.

## Completion Response Required

When complete, respond with:

```text
Commit summary

<one concise conventional-commit-style title>

Commit description

- Files changed
- What changed
- Tests run
- Evidence expectation after rerun
- Any remaining risks or follow-up items
```

Do not include broad commentary. Do not claim Phase 4 readiness. Do not claim the full 100-point scorecard passes.
