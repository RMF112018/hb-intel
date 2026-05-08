# Updated Prompt 01 — Active Surface Panel Ownership Move and Shell-Rendered Test Compatibility Repair

## Objective

Move semantic active-surface panel ownership from the first bento card to the shell `main[role="tabpanel"]`, while preserving tab ARIA behavior, bento direct-child invariants, card-marker compatibility, and full local test-suite viability.

This prompt is updated after Prompt 00 repo-truth intake. Prompt 00 confirmed that the original Prompt 01 scope was directionally correct but under-scoped. The implementation must repair not only `PccCardTierContract.test.tsx`, but also shell-rendered tests that currently assert a global active-panel marker count of exactly one.

Phase 2 posture:

- shell `main[role="tabpanel"]` becomes the semantic active-panel owner;
- card-level `data-pcc-active-surface-panel` markers remain temporarily as compatibility markers;
- tests must distinguish semantic shell ownership from compatibility card markers;
- Playwright/e2e evidence enrichment is deferred to Prompt 05 unless a local unit test depends on it.

## Mandatory Opening Instruction

Before making changes, confirm you are operating on the current repo state.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Scope Control

This is an implementation prompt, but it is narrow.

Do not:

- remove duplicate top-level/header cards;
- implement a Modules launcher;
- introduce active module state;
- introduce URL routing;
- change shared layout primitives;
- edit Playwright/e2e files;
- edit package dependencies, lockfile, manifests, or package-solution files;
- broadly format unrelated files;
- claim Phase 2 completion, scorecard pass, duplicate-card remediation completion, or Phase 4 readiness.

## Required Repo-Truth Checks Before Editing

Perform these checks before editing. Keep the intake targeted.

### 1. Confirm local baseline

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If relevant files are dirty, stop and report before editing.

Relevant files include:

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/config/package-solution.json
package.json
pnpm-lock.yaml
```

### 2. Confirm shell markup

Inspect:

```text
apps/project-control-center/src/shell/PccShell.tsx
```

Confirm:

- `ACTIVE_PANEL_ID` equals `'pcc-active-surface-panel'`;
- `PccHorizontalTabs` receives `panelId={ACTIVE_PANEL_ID}`;
- `main` still has:
  - `id={ACTIVE_PANEL_ID}`;
  - `role="tabpanel"`;
  - `aria-labelledby={`pcc-tab-${activeSurfaceId}`}`;
  - `className={styles.canvas}`;
  - `data-pcc-canvas=""`;
- `main` still lacks `data-pcc-active-surface-panel={activeSurfaceId}` before this prompt.

If `main` already has the marker, do not re-add it. Narrow the work to validation/comment/test posture and explain the drift.

### 3. Confirm tab ARIA contract

Inspect:

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
```

Confirm tabs still emit:

- `id={`pcc-tab-${surfaceId}`}`;
- `role="tab"`;
- `type="button"`;
- `aria-selected`;
- `aria-controls={panelId}`;
- `data-pcc-tab-id={surfaceId}`;
- active/inactive state marker;
- click handler;
- keyboard handling for ArrowRight, ArrowLeft, Home, End, Enter, and Space.

Do not change `PccHorizontalTabs.tsx` unless repo truth materially contradicts this prompt and you stop to report.

### 4. Confirm stale active-panel assumptions

Search tests before editing:

```bash
rg -n "dataActiveSurfacePanel|data-pcc-active-surface-panel|getActiveBento|active-panel card|active-panel parent|must mount its active panel|active-panel carrier" apps/project-control-center/src/tests apps/project-control-center/src/shell
```

You must inspect and classify all shell-rendered active-panel marker assertions in:

```text
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
```

If execution reveals any additional shell-rendered test that asserts a global `[data-pcc-active-surface-panel]` count of exactly `1`, treat that as in-scope for Prompt 01 repair.

Do not blanket-change surface-only tests that render without `PccShell`; only repair tests whose rendered tree includes shell `main` and therefore legitimately has shell marker + card compatibility marker coexistence.

### 5. Confirm card compatibility primitive, without editing it

Inspect only if needed:

```text
apps/project-control-center/src/layout/PccDashboardCard.tsx
```

Confirm:

- card-level `dataActiveSurfacePanel` remains a temporary compatibility bridge;
- `data-pcc-active-surface-panel={dataActiveSurfacePanel}` is still emitted on `[data-pcc-card]`.

Do not modify `PccDashboardCard.tsx`.

### 6. Confirm stale router comment

Inspect:

```text
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

If it still claims that only one rendered element carries `data-pcc-active-surface-panel`, make a narrow comment-only correction.

Do not alter router runtime behavior.

### 7. Confirm package/manifest/lockfile posture

Confirm:

- root `config/package-solution.json` is absent or irrelevant;
- `apps/project-control-center/config/package-solution.json` exists;
- Prompt 01 requires no package-solution edit;
- Prompt 01 requires no dependency, lockfile, package, or manifest edit.

## Expected Files

Expected production file:

```text
apps/project-control-center/src/shell/PccShell.tsx
```

Expected test files:

```text
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
```

Expected comment-only file if stale comment is still present:

```text
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

Do not edit these files in Prompt 01:

```text
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/surfaces/**/*
e2e/pcc-live/**/*
apps/project-control-center/config/package-solution.json
package.json
pnpm-lock.yaml
```

## Implementation Requirements

### 1. Move semantic active-panel ownership to shell `main`

In `apps/project-control-center/src/shell/PccShell.tsx`, add:

```tsx
data-pcc-active-surface-panel={activeSurfaceId}
```

to the existing shell `main` element.

The resulting semantic owner must be:

```tsx
<main
  id={ACTIVE_PANEL_ID}
  role="tabpanel"
  aria-labelledby={`pcc-tab-${activeSurfaceId}`}
  className={styles.canvas}
  data-pcc-canvas=""
  data-pcc-active-surface-panel={activeSurfaceId}
>
```

Preserve this structure:

```text
PccShell
  PccProjectHeroBand
  PccHorizontalTabs
  main[role="tabpanel"][data-pcc-active-surface-panel]
    PccBentoGrid
      active surface cards
```

### 2. Preserve tab ARIA behavior

Do not change the tab keyboard model or tab control semantics.

Preserve:

- `role="tablist"` on the tabs container;
- `role="tab"` on each tab;
- active tab `aria-selected`;
- tab `aria-controls="pcc-active-surface-panel"`;
- shell main `id="pcc-active-surface-panel"`;
- shell main `role="tabpanel"`;
- shell main `aria-labelledby={`pcc-tab-${activeSurfaceId}`}`.

### 3. Keep card marker compatibility in place

Do not remove `dataActiveSurfacePanel` props from cards in this prompt.

Tests must distinguish:

- semantic active-panel owner:
  ```text
  main[role="tabpanel"][data-pcc-active-surface-panel="<surfaceId>"]
  ```
- temporary compatibility marker:
  ```text
  [data-pcc-bento-grid] > [data-pcc-card][data-pcc-active-surface-panel="<surfaceId>"]
  ```

Do not write tests that require active-panel ownership to be card-based.

Do not assert that a broad selector like this has count `1` in shell-rendered trees:

```text
[data-pcc-active-surface-panel]
```

### 4. Correct stale router comment

If `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` still states that only one element in the rendered tree carries `data-pcc-active-surface-panel`, update that comment only.

Required comment posture:

- shell `main` is now the semantic active-panel owner;
- card-level markers may remain temporarily for compatibility;
- tests must not infer semantic ownership from the card marker;
- broad marker count may legitimately be greater than one in shell-rendered trees.

Do not change router runtime behavior.

## Required Test Updates

### 1. `PccShell.responsive.test.tsx`

Add or update tests to verify:

1. Default render has exactly one shell-owned active panel:

```ts
const shellPanels = container.querySelectorAll(
  'main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]',
);
expect(shellPanels.length).toBe(1);
```

2. Default shell panel has:
   - `id="pcc-active-surface-panel"`;
   - `role="tabpanel"`;
   - `aria-labelledby="pcc-tab-project-home"`;
   - `data-pcc-canvas`.

3. Clicking Documents updates:
   - shell marker to `documents`;
   - `aria-labelledby` to `pcc-tab-documents`.

4. Clicking Site Health updates:
   - shell marker to `site-health`;
   - `aria-labelledby` to `pcc-tab-site-health`.

5. Every tab still has:
   - `role="tab"`;
   - `aria-controls="pcc-active-surface-panel"`;
   - non-empty `id`.

Do not assert broad `[data-pcc-active-surface-panel="<surfaceId>"]` count equals `1`.

### 2. `PccShell.navigation.test.tsx`

Repair shell-rendered broad-marker assumptions.

Required pattern:

- Replace global count assertions such as:
  ```ts
  const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
  expect(panels).toHaveLength(1);
  ```
  with structural assertions.

Required assertions:

1. The selected tab remains unique:

```ts
const selectedTabs = container.querySelectorAll(
  '[data-pcc-horizontal-tabs] [data-pcc-tab-id][aria-selected="true"]',
);
expect(selectedTabs).toHaveLength(1);
expect(selectedTabs[0]?.getAttribute('data-pcc-tab-id')).toBe(id);
```

2. The shell panel exists and owns the active surface:

```ts
const shellPanel = container.querySelector(
  `main[role="tabpanel"][data-pcc-active-surface-panel="${id}"]`,
);
expect(shellPanel, `shell panel must own active surface '${id}'`).not.toBeNull();
expect(shellPanel?.getAttribute('id')).toBe('pcc-active-surface-panel');
expect(shellPanel?.getAttribute('aria-labelledby')).toBe(`pcc-tab-${id}`);
```

3. The shell panel contains the active surface grid:

```ts
const bento = shellPanel!.querySelector('[data-pcc-bento-grid]');
expect(bento).not.toBeNull();
```

4. Exactly one direct bento child remains the compatibility command/card carrier for the active surface:

```ts
const compatibilityCards = Array.from(bento!.children).filter((child) =>
  child.matches(`[data-pcc-card][data-pcc-active-surface-panel="${id}"]`),
);
expect(compatibilityCards).toHaveLength(1);
```

5. Text assertions that previously used the broad active panel should point to the compatibility card, not shell `main`, if the assertion is about the surface card’s visible content.

6. Keyboard tests that query the active marker must use shell-owner selectors, not broad selectors.

7. The test that clicks Documents must no longer assert that `[data-pcc-active-surface-panel="project-home"]` is null globally. Instead assert:
   - no shell panel exists for project-home:
     ```ts
     expect(
       container.querySelector('main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]'),
     ).toBeNull();
     ```
   - shell panel exists for documents;
   - compatibility card exists under the bento grid for documents.

### 3. `PccShell.surfaceSmoke.test.tsx`

Repair the all-surface smoke test.

Rename the test from “keeps exactly one active panel” to wording that reflects shell ownership plus card compatibility.

For each surface:

- selected tab count remains exactly one;
- shell panel count for the active surface is exactly one:
  ```ts
  const shellPanels = container.querySelectorAll(
    `main[role="tabpanel"][data-pcc-active-surface-panel="${id}"]`,
  );
  expect(shellPanels).toHaveLength(1);
  ```
- shell panel `aria-labelledby` equals `pcc-tab-${id}`;
- shell panel contains `[data-pcc-bento-grid]`;
- direct bento child compatibility card count for the active surface is exactly one:
  ```ts
  const compatibilityCards = Array.from(bento.children).filter((child) =>
    child.matches(`[data-pcc-card][data-pcc-active-surface-panel="${id}"]`),
  );
  expect(compatibilityCards).toHaveLength(1);
  ```
- do not assert broad `[data-pcc-active-surface-panel]` count equals `1`.

### 4. `PccCardTierContract.test.tsx`

Repair stale selector assumptions immediately.

Required changes:

1. Update `getActiveBento` so it finds the bento grid through shell `main`, not through a card parent assumption.

Preferred helper:

```ts
function getActiveBento(container: HTMLElement, surfaceId: PccMvpSurfaceId): HTMLElement {
  const shellPanel = container.querySelector(
    `main[role="tabpanel"][data-pcc-active-surface-panel="${surfaceId}"]`,
  );
  expect(shellPanel, `surface '${surfaceId}' must mount its shell active panel`).not.toBeNull();
  expect(shellPanel!.getAttribute('id')).toBe('pcc-active-surface-panel');
  expect(shellPanel!.getAttribute('aria-labelledby')).toBe(`pcc-tab-${surfaceId}`);

  const bento = shellPanel!.querySelector('[data-pcc-bento-grid]');
  expect(
    bento,
    `surface '${surfaceId}' shell panel must contain [data-pcc-bento-grid]`,
  ).not.toBeNull();

  return bento as HTMLElement;
}
```

2. For tests that need the compatibility command card, do not use broad `container.querySelector('[data-pcc-active-surface-panel="..."]')`.

Use direct bento-child scoping:

```ts
function getActiveCompatibilityCard(
  bento: HTMLElement,
  surfaceId: PccMvpSurfaceId,
): HTMLElement {
  const matches = Array.from(bento.children).filter((child) =>
    child.matches(`[data-pcc-card][data-pcc-active-surface-panel="${surfaceId}"]`),
  );
  expect(
    matches,
    `surface '${surfaceId}' must render one direct bento child compatibility card`,
  ).toHaveLength(1);
  return matches[0] as HTMLElement;
}
```

3. Update the active command card heading-level test to use `getActiveCompatibilityCard`.

4. Update comments/messages from “active-panel card” / “active-panel carrier” to “compatibility command card” or equivalent.

5. Keep direct-child assertions intact.

6. Do not edit `PccDashboardCard.tsx`.

### 5. Additional shell-rendered broad-marker tests discovered during execution

If another shell-rendered test fails because it asserts global active-panel marker count equals `1`, repair it using the same structural pattern:

- exactly one shell main for active surface;
- exactly one direct bento child compatibility card for active surface, if card compatibility is being asserted;
- no broad global marker count assertion.

Do not change surface-only tests unless they fail for a directly related reason.

## Recommended Test Helper Pattern

To avoid duplicating brittle selector logic, it is acceptable to introduce small local helper functions inside touched test files only.

Suggested names:

```ts
function getShellActivePanel(container: HTMLElement, surfaceId: string): HTMLElement
function getBentoFromShellPanel(shellPanel: HTMLElement): HTMLElement
function getCompatibilityActiveCard(bento: HTMLElement, surfaceId: string): HTMLElement
```

Do not add new shared production helpers for this prompt.

## Validation Required

Run and report these commands exactly:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccShell.responsive.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- PccShell.navigation.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- PccShell.surfaceSmoke.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- PccCardTierContract.test.tsx
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check apps/project-control-center/src/shell/PccShell.tsx apps/project-control-center/src/shell/PccSurfaceRouter.tsx apps/project-control-center/src/tests/PccShell.responsive.test.tsx apps/project-control-center/src/tests/PccShell.navigation.test.tsx apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx apps/project-control-center/src/tests/PccCardTierContract.test.tsx
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If filename-based test filtering is unsupported in this workspace, run the full package test and report that limitation.

If `prettier --check` fails only for touched files, run `prettier --write` only on touched files, then rerun:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check apps/project-control-center/src/shell/PccShell.tsx apps/project-control-center/src/shell/PccSurfaceRouter.tsx apps/project-control-center/src/tests/PccShell.responsive.test.tsx apps/project-control-center/src/tests/PccShell.navigation.test.tsx apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx apps/project-control-center/src/tests/PccCardTierContract.test.tsx
git diff --check
```

Do not run `pnpm install`, `pnpm add`, or any command that intentionally changes the lockfile.

## Required Plan Response Format

Before execution, respond with:

```markdown
## Objective

## Repo-Truth Checks Performed

## Files Proposed

## Implementation Plan

## Shell-Rendered Test Repair Plan

## Test / Validation Plan

## Package / Lockfile / Manifest Posture

## Risks / Open Items
```

## Required Following-Execution Response Format

After execution, respond with:

```markdown
## Objective

## Repo-Truth Checks Performed

## Files Changed

## What Changed

## Shell Active-Panel Ownership Proof

## Shell-Rendered Test Compatibility Repair

## Card Compatibility Marker Proof

## Direct-Child / Layout Proof

## Tests / Validation Run

## Package / Lockfile / Manifest Posture

## Residual Risks

## Next Prompt Status
```

## Completion Standard for Prompt 01

Prompt 01 is complete only when:

- shell `main[role="tabpanel"]` owns `data-pcc-active-surface-panel={activeSurfaceId}`;
- tab ARIA linkage remains intact;
- Project Home, Documents, and Site Health tab changes update the shell marker and `aria-labelledby`;
- `PccShell.navigation.test.tsx` no longer asserts global broad-marker count of exactly one;
- `PccShell.surfaceSmoke.test.tsx` no longer asserts global broad-marker count of exactly one;
- `PccCardTierContract.test.tsx` no longer infers active-panel ownership from a card-level marker;
- tests distinguish semantic shell owner from temporary card compatibility marker;
- bento cards remain direct children of `[data-pcc-bento-grid]`;
- duplicate header cards remain in place;
- card-level markers remain compatibility-only;
- no package/lockfile/manifest/package-solution drift occurs;
- Playwright/e2e remains untouched.
