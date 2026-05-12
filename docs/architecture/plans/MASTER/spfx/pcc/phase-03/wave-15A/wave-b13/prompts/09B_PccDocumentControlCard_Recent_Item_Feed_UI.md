# Phase 08 Prompt 09B — Redesign `PccDocumentControlCard` into PCC-Native Recent-Item Feed Tabs

## Role
Act as the implementation owner for **Phase 08 Prompt 09B** in the `RMF112018/hb-intel` repo. Execute the Project Home card redesign only after Prompt 09A is fully landed, validate the result, and return a concise but complete closeout.

---

## Baseline / Preflight
Before editing:

1. Confirm the actual current local branch and HEAD.
2. Confirm Prompt 09A is committed and present in local HEAD. The current upstream repo-truth baseline reviewed for this prompt is:
   ```text
   23ef8a26a364f919fd80d0b2a27c1b28dc17498d
   pcc: add document-control home feed contract and project-home seam
   ```
   If local HEAD has moved forward, classify the drift and proceed only when the Prompt 09B scope can be merged safely.
3. Confirm the PCC package / feature / manifest posture remains intentionally aligned at **`1.0.0.222`** unless a newer operator-approved local drift is already present.
4. Capture:
   ```bash
   git rev-parse --abbrev-ref HEAD
   git rev-parse HEAD
   git status --short
   md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
   ```
5. Preserve any operator-owned WIP. Do not wipe, normalize, restage, or “clean up” out-of-scope working-tree drift.
6. Re-open only the prompt-relevant files you will edit immediately before patching, particularly where parallel work may exist.

Do **not** re-read files still within current context or memory unless local drift is suspected, an exact edit location is needed, or a test failure requires re-verification.

---

## Parallel Dedicated Document Control Surface Safety — Mandatory
There is active parallel work occurring on the **dedicated Document Control surface**. Prompt 09B must not disrupt it.

Rules:

- Do **not** edit any file under:
  ```text
  apps/project-control-center/src/surfaces/documents/
  ```
- Do **not** alter the dedicated Documents surface source-lane architecture.
- Do **not** remove or reshape shared model fields used by dedicated Documents surface work.
- Do **not** roll back or overwrite shared-model changes from parallel work.
- If `PccDocumentControlCard.tsx`, Project Home read-model wiring, or shared imports have drifted locally, merge only the Prompt 09B Project Home card redesign into the latest local state and report the drift.
- This prompt is a **Project Home card UI migration**, not a Documents-surface migration.

---

## Current Repo-Truth Anchors
Prompt 09A has already landed and established the exact seam that Prompt 09B must consume.

As of the reviewed baseline:

1. `PccDocumentControlCard.tsx` still renders the old Project Home source-lane / source-posture tile body and still accepts:
   ```ts
   readonly sources?: readonly IDocumentControlSource[];
   ```
2. `projectHomeViewModel.ts` now exposes both:
   ```ts
   readonly documentControl: IPccProjectHomeViewModelSlot<readonly IDocumentControlSource[]>;
   readonly documentControlHomeFeed: IPccProjectHomeViewModelSlot<IPccDocumentControlHomeFeed>;
   ```
3. `projectHomeAdapter.ts` preserves the old source-array slot and adds the new additive feed slot:
   ```ts
   documentControl: slot(docStatus, docs?.sources ?? []),
   documentControlHomeFeed: slot(
     docStatus,
     docs?.homeFeed ?? EMPTY_PCC_DOCUMENT_CONTROL_HOME_FEED,
   ),
   ```
4. `PccProjectHomeReadModelContent.tsx` still intentionally uses the pre-09B wiring:
   ```tsx
   state={viewModel?.documentControl.state ?? 'preview'}
   sources={viewModel?.documentControl.data}
   ```
5. Prompt 09A added:
   ```text
   apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.wiring.test.ts
   ```
   This test currently **locks the no-retarget posture from 09A** and must be rewritten in Prompt 09B to become the positive feed-retarget guard.

Prompt 09B must use this repo truth explicitly rather than treating the new feed slot as hypothetical.

---

## Objective
Replace the current **source-lane / source-posture tile body** of Project Home `PccDocumentControlCard` with a compact, SharePoint-inspired recent-item feed driven by the Prompt 09A `IPccDocumentControlHomeFeed` contract.

The card must keep:

- eyebrow: `Documents`;
- title: `Document Control Center`;
- gateway action: `Open Document Control`;
- `footprint="wide"`;
- `tier="tier2"`;
- `region="operational"`;
- current `spanOverrides` plumbing;
- current card-level preview/degraded state behavior.

The body becomes:

- PCC-native local tab buttons:
  - `My Recent Files`
  - `Latest Changes`
- a compact top-five preview feed for the active tab.

This prompt changes the **Project Home card body and its Project Home feed wiring only**. It does **not** alter Project Home bento order, span overrides, or analytics adjacency; those remain Prompt 09C scope.

---

## Product Decisions — Closed
1. Scope is only `PccDocumentControlCard`, not the dedicated Documents surface.
2. Default selected tab on mount: `My Recent Files`.
3. The view switcher must be **tab buttons uniquely designed for PCC cards**, not a generic segmented toggle and not a new shared tab primitive.
4. Row items remain preview-only and non-executable in this phase.
5. Add explicit developer-facing documentation in the card component that row-level deep links are deferred until canonical SharePoint / OneDrive / Procore item paths and authorization gates are established in a later phase.
6. `Open Document Control` remains the only card-level enabled gateway action.
7. The card must consume the **Prompt 09A feed seam**:
   ```ts
   homeFeed?: IPccDocumentControlHomeFeed
   ```
   not the legacy `sources` prop.
8. Do **not** remove the additive Project Home `documentControl` source-array slot from `projectHomeViewModel.ts` or `projectHomeAdapter.ts` in this prompt. Prompt 09B retargets **rendering**, not the underlying additive 09A seam.
9. Preserve the fixture-only Project Home path without requiring a new prop at the `PccProjectHome.tsx` call site. `PccDocumentControlCard` must default internally to:
   ```ts
   SAMPLE_PCC_DOCUMENT_CONTROL_HOME_FEED
   ```
   when `homeFeed` is omitted.
10. Use stable timestamp labels derived from supplied fixture/read-model UTC timestamps. Do **not** compute wall-clock-relative “x days ago” labels from `Date.now()`.

---

## Required Wiring Migration
### 1. Retarget the card prop contract
Change Project Home `PccDocumentControlCard` props from:

```ts
readonly sources?: readonly IDocumentControlSource[];
```

to:

```ts
readonly homeFeed?: IPccDocumentControlHomeFeed;
```

Use the shared Prompt 09A model export. Do not create an app-local duplicate type.

### 2. Add internal fixture fallback
Implement a local resolver or equivalent card-local default so:

```ts
homeFeed === undefined
```

uses:

```ts
SAMPLE_PCC_DOCUMENT_CONTROL_HOME_FEED
```

This preserves the fixture-only `PccProjectHome.tsx` path as-is. Do **not** edit `PccProjectHome.tsx` solely to pass the fixture into the card.

### 3. Retarget `PccProjectHomeReadModelContent.tsx`
Replace the pre-09B wiring:

```tsx
state={viewModel?.documentControl.state ?? 'preview'}
sources={viewModel?.documentControl.data}
```

with feed-slot wiring:

```tsx
state={viewModel?.documentControlHomeFeed.state ?? 'preview'}
homeFeed={viewModel?.documentControlHomeFeed.data}
```

The new slot already carries the same Document Control envelope status posture through Prompt 09A. Use that seam directly.

### 4. Rewrite the Prompt 09A seam-regression test
Update:

```text
PccProjectHomeReadModelContent.wiring.test.ts
```

from a **no-retarget** guard into a **positive 09B retarget guard**.

It must assert that:

- `PccProjectHomeReadModelContent.tsx` passes:
  ```tsx
  homeFeed={viewModel?.documentControlHomeFeed.data}
  ```
- it uses:
  ```tsx
  state={viewModel?.documentControlHomeFeed.state ?? 'preview'}
  ```
- it no longer passes:
  ```tsx
  sources={viewModel?.documentControl.data}
  ```
- it does not wire `homeFeed` from `viewModel?.documentControl.data`.

Do not delete this test merely because its old assertion becomes obsolete; it is now the critical Prompt 09B handoff guard.

---

## Required Accessibility Contract for Card Tabs
Implement a compact local **manual-activation tab pattern**.

### Tablist
- wrapper:
  ```tsx
  role="tablist"
  aria-label="Document Control feed views"
  ```

### Tabs
- two native:
  ```tsx
  <button type="button" role="tab">
  ```
- each tab has:
  - stable `id`;
  - `aria-controls=<panel id>`;
  - active tab:
    - `aria-selected="true"`
    - `tabIndex={0}`
  - inactive tab:
    - `aria-selected="false"`
    - `tabIndex={-1}`

### Panels
- render both panels or an equivalent accessible structure in which each tab’s `aria-controls` target exists;
- one panel visible at a time;
- each panel has:
  - stable `id`;
  - `role="tabpanel"`;
  - `aria-labelledby=<own tab id>`;
- inactive panel must be hidden from visual display using the repo-aligned approach, such as `hidden`.

### Keyboard behavior — manual activation
- `ArrowLeft` / `ArrowRight` move roving focus between tabs **without changing the selected panel**.
- `Home` moves focus to the first tab.
- `End` moves focus to the last tab.
- `Enter` / `Space` selects the currently focused tab if it is not already selected.
- Click selects the clicked tab.
- Do not generalize this into a new shared tab primitive; this is a local Project Home card-level pattern.

Use `useId()` or a repo-aligned equivalent for stable tab/panel id wiring. Do not call hooks inside iteration callbacks.

---

## Required Data / Marker Contract
Add stable markers sufficient for unit and later Playwright evidence.

### Feed body/card-local root
Place this on the feed-body root rendered inside `PccDashboardCard` unless repo truth exposes an appropriate existing card marker seam. Do **not** modify shared `PccDashboardCard` only to carry this marker.

```text
data-pcc-document-control-card
data-pcc-document-control-feed-mode="my-recent-files|latest-changes"
```

### Tab controls
```text
data-pcc-document-control-feed-tab="my-recent-files|latest-changes"
data-pcc-document-control-feed-tab-state="active|inactive"
```

### Panels
```text
data-pcc-document-control-feed-panel="my-recent-files|latest-changes"
data-pcc-document-control-feed-panel-state="active|inactive"
```

### Feed items
```text
data-pcc-document-control-feed-item
data-pcc-document-control-feed-item-id="<id>"
data-pcc-document-control-feed-item-source="sharepoint|onedrive|procore"
data-pcc-document-control-feed-item-kind="<kind>"
data-pcc-document-control-feed-item-deep-link-posture="preview-only|future-deep-link"
```

### Latest Changes items additionally emit
```text
data-pcc-document-control-feed-change-kind="added|updated"
```

Do not add row markers that imply active launch behavior.

---

## UI Anatomy
### Card header
Keep the existing `PccDashboardCard` shell posture:

```tsx
footprint="wide"
tier="tier2"
region="operational"
eyebrow="Documents"
title="Document Control Center"
```

Keep the existing gateway action behavior unchanged.

### Card tab band
Design a compact PCC-specific card tab band:

- token-only styling;
- visually distinct from global shell nav tabs;
- clearly belongs inside the card chrome;
- active tab should have a stronger card-local rail / inset / surface treatment;
- inactive tab should remain obviously selectable but not over-emphasized;
- visible focus states must remain clear;
- no raw colors;
- no new global tokens unless existing repo practice explicitly demands it.

### Feed list
Render exactly the active feed array in a compact vertical list:

- default to the top-five order supplied by Prompt 09A;
- do not re-sort in JSX; preserve read-model/fixture order;
- each row is inert:
  - not an anchor;
  - not a button;
  - no row-level click handler;
  - no cursor/pointer styling that implies launch behavior.

Recommended row anatomy:

1. Row title — single line, truncate/ellipsis if needed.
2. Compact metadata line:
   - source pill/chip or equivalent text capsule;
   - kind label;
   - stable timestamp/change-state label.
3. Optional context line:
   - use `contextLabel`;
   - clamp/truncate to preserve card height discipline.

### My Recent Files
Display:

- item title;
- source;
- kind;
- stable timestamp label derived from `accessedAtUtc`;
- context label.

### Latest Changes
Display:

- item title;
- source;
- kind;
- `Added` or `Updated`;
- stable timestamp label derived from `changedAtUtc`;
- context label.

Do not use live wall-clock labels that make tests nondeterministic.

---

## Empty / Degraded Behavior
- If `state !== 'preview'`, preserve the existing card-level `PccPreviewState` posture.
- If `state === 'preview'` but the selected feed array is empty, render a compact in-card empty message using production-grade end-user copy.
- Do not collapse the card.
- No tooltip-only explanations.
- Empty feed presentation remains non-interactive.

---

## CSS / Code Cleanup
Update `PccProjectHome.module.css` or the repo-appropriate Project Home card CSS surface with:

- card-local tab band styling;
- active/inactive tab states;
- focus-visible states;
- panel visibility support;
- compact list spacing;
- row title truncation;
- metadata chip/label styling;
- context-line truncation/clamp;
- empty state posture.

Constraints:

- no raw colors;
- no new global resets;
- no new global tab primitive;
- no pointer affordance on feed rows;
- no source-system link visual treatment that implies clickability;
- respect current PCC token system and existing card radii/accent discipline;
- avoid new inline style blocks; use CSS modules unless an existing repo-local pattern requires otherwise.

Retire the obsolete Project Home-only source-lane/tile body implementation from `PccDocumentControlCard.tsx`. Remove dead local imports and remove now-unused Project Home CSS selectors only when they are confirmed unused after the feed redesign. Do **not** touch dedicated Documents-surface styling.

---

## Expected File Scope
Likely touched:

```text
apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.wiring.test.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.module.css
apps/project-control-center/src/tests/*DocumentControl*
apps/project-control-center/src/tests/*ProjectHome*
```

Do **not** touch:

```text
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts
packages/models/src/pcc/**
backend/functions/**
package-solution.json
ProjectControlCenterWebPart.manifest.json
pnpm-lock.yaml
```

unless an operator-owned forward drift forces a compile-safe import adjustment, in which case classify it precisely and keep it additive/minimal. Prompt 09B itself should not require model, backend, manifest, or lockfile edits.

---

## Tests
Create/update focused tests to cover:

1. `PccDocumentControlCard` renders `My Recent Files` by default.
2. It renders exactly five preview feed rows for `SAMPLE_PCC_DOCUMENT_CONTROL_HOME_FEED`.
3. Clicking `Latest Changes` activates the latest-changes panel and hides the my-recent panel.
4. Manual-activation keyboard tab behavior:
   - ArrowLeft / ArrowRight move focus only;
   - Home / End move focus only;
   - Enter / Space activate the focused tab.
5. Tab roles / `aria-selected` / `aria-controls` / `aria-labelledby` / `tabIndex` are correct.
6. Exactly one panel is visible at a time.
7. Feed row markers emit source, kind, id, and deep-link posture.
8. Latest Changes rows emit change-kind markers.
9. No feed row is an anchor or button.
10. The gateway action remains present and unchanged.
11. Non-preview card states still render the existing `PccPreviewState` posture.
12. Empty selected feed state renders compact production-grade copy.
13. The fixture-only card path works without an explicit `homeFeed` prop and resolves to the sample feed.
14. `PccProjectHomeReadModelContent.wiring.test.ts` is rewritten to positively assert `documentControlHomeFeed` wiring and negative-assert the old `sources={viewModel?.documentControl.data}` wiring.
15. Old Project Home-only source-lane/tile tests are replaced or retired correctly; dedicated Documents-surface tests are untouched.
16. No card-footprint / span-overrides / choreography change lands in Prompt 09B.

Prefer a dedicated focused test file for the card if none exists, then update only Project Home wiring/composition tests where the card-body assumptions changed. Avoid fragile CSS-class assertions.

---

## Out of Scope / Hard Stops
- No edit to `apps/project-control-center/src/surfaces/documents/`.
- No live Graph, SharePoint REST, PnP, Procore, or deep-link execution.
- No item deep links or hrefs.
- No row-level source launches.
- No removal of the additive Project Home `documentControl` source-array slot.
- No package / manifest / version bump unless operator explicitly owns a separate version bump outside this prompt.
- No lockfile mutation.
- No dependency additions.
- No Project Home bento reorder/span work.
- No analytics card reorder.
- No `projectHomeChoreography.ts` change.
- No shared tab primitive.
- No raw colors or global resets.
- No developer/debug copy in end-user UI.

---

## Validation
Run at minimum:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <all prompt-touched files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If local drift resolution requires touching shared model exports/types, also run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

If `git diff --check` reports pre-existing unrelated operator-owned WIP, classify the source precisely and state whether any Prompt 09B-touched file contributes to the failure. Do not silently claim a clean diff check when the command is red.

---

## Closeout Format
Return:

1. Verdict: `PASS` / `BLOCKED`
2. Starting and ending HEAD
3. Version posture observed
4. Files changed
5. Card tab interaction summary
6. Feed UI summary
7. Explicit statement that dedicated Documents surface files were untouched
8. Explicit statement that `projectHomeChoreography.ts` was untouched
9. Prompt 09A seam handoff summary:
   - read-model content now consumes `documentControlHomeFeed`;
   - legacy `documentControl` source-array slot remains preserved;
   - 09A wiring regression test was rewritten as the 09B positive retarget guard
10. Test / validation results
11. Lockfile MD5 before/after
12. Commit summary and description if committed
13. Residual risks / follow-up visual watchpoints for Prompt 09C / 09E
