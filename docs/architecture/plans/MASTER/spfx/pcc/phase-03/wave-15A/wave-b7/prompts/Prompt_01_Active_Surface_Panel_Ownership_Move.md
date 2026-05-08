# Updated Prompt 01 — Active Surface Panel Ownership Move and Immediate Test Compatibility Repair

## Objective

Move semantic active-surface panel ownership from the first bento card to the shell `main[role="tabpanel"]`, while preserving the existing tab ARIA behavior, bento direct-child invariants, card-marker compatibility, and full local test-suite viability.

This is an updated Prompt 01 because current repo truth shows that at least one existing test helper still treats `[data-pcc-active-surface-panel="<surfaceId>"]` as the first bento card. Once `main` receives that same marker, broad `querySelector` logic will resolve to `main` first and incorrectly fail the direct-child/card-tier assertions. This prompt therefore includes a narrow, immediate test compatibility repair so Prompt 01 can safely run the full package test suite.

## Mandatory Opening Instruction

Before making any changes, confirm you are operating on the current repo state.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Required Repo-Truth Checks Before Editing

Perform these checks before editing. Keep the intake targeted; do not conduct a broad repo audit unless one of these checks returns contradictory results.

1. Inspect `apps/project-control-center/src/shell/PccShell.tsx`.
   - Confirm `ACTIVE_PANEL_ID` still equals `'pcc-active-surface-panel'`.
   - Confirm `main` still has `id={ACTIVE_PANEL_ID}`, `role="tabpanel"`, `aria-labelledby={`pcc-tab-${activeSurfaceId}`}`, `className={styles.canvas}`, and `data-pcc-canvas=""`.
   - Confirm `main` still lacks `data-pcc-active-surface-panel={activeSurfaceId}` before this prompt.

2. Inspect `apps/project-control-center/src/shell/PccHorizontalTabs.tsx`.
   - Confirm `PccHorizontalTabs` still receives `panelId={ACTIVE_PANEL_ID}` from `PccShell`.
   - Confirm tabs still emit `role="tab"`, `aria-selected`, `aria-controls={panelId}`, `id={`pcc-tab-${surfaceId}`}`, and `data-pcc-tab-id`.

3. Inspect `apps/project-control-center/src/tests/PccShell.responsive.test.tsx`.
   - Confirm existing tests already assert the `id`, `role`, `aria-labelledby`, and `aria-controls` tabpanel relationship.
   - Identify where to add shell active-panel marker assertions.

4. Search tests for stale active-panel ownership assumptions before editing:
   - `getActiveBento`
   - `data-pcc-active-surface-panel`
   - `dataActiveSurfacePanel`
   - `active-panel card`
   - `active-panel parent`
   - `must mount its active panel`

5. Specifically inspect `apps/project-control-center/src/tests/PccCardTierContract.test.tsx`.
   - Confirm whether `getActiveBento` currently uses a broad selector like:
     ```ts
     container.querySelector(`[data-pcc-active-surface-panel="${surfaceId}"]`)
     ```
   - Confirm whether it then assumes the selected element’s parent is `[data-pcc-bento-grid]`.
   - Confirm whether the active command card heading-level test also uses the broad selector.

6. Inspect `apps/project-control-center/src/layout/PccDashboardCard.tsx` only if needed to confirm compatibility behavior.
   - Do not modify this shared primitive in Prompt 01.
   - Confirm card-level `dataActiveSurfacePanel` remains a compatibility bridge.

7. Inspect `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` only to check for stale source comments.
   - If the file still claims that only one rendered element carries `data-pcc-active-surface-panel`, make a narrow comment-only correction because Prompt 01 intentionally creates shell ownership while preserving temporary card-level compatibility markers.
   - Do not alter router runtime behavior.

8. Confirm package/manifest/lockfile posture:
   - `git status --short`
   - `md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml`
   - Confirm `apps/project-control-center/config/package-solution.json` exists.
   - Confirm root `config/package-solution.json` is absent or irrelevant to this prompt.
   - Do not modify `pnpm-lock.yaml`, package dependency sections, SPFx manifests, or package-solution files.

## Expected Files

Primary files expected:

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

Allowed narrow test compatibility file, if the repo-truth check confirms the stale selector logic is still present:

```text
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
```

Allowed narrow comment-only file, if repo truth confirms a stale “single active-surface-panel element” comment remains:

```text
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

Do not edit these files in this prompt unless a directly related failing test proves a narrow correction is required and you explain why in the completion report:

```text
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/surfaces/**/*
e2e/pcc-live/**/*
apps/project-control-center/config/package-solution.json
pnpm-lock.yaml
package.json
```

## Implementation Requirements

### 1. Move semantic active-panel ownership to shell `main`

In `apps/project-control-center/src/shell/PccShell.tsx`, add:

```tsx
data-pcc-active-surface-panel={activeSurfaceId}
```

to the existing shell `main` element so the resulting semantic owner is:

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

Preserve all existing attributes and child structure:

```text
PccShell
  PccProjectHeroBand
  PccHorizontalTabs
  main[role="tabpanel"][data-pcc-active-surface-panel]
    PccBentoGrid
      active surface cards
```

### 2. Preserve tab ARIA behavior

Do not change the keyboard model or tab control semantics. Preserve:

- `role="tablist"` on the tabs container;
- `role="tab"` on each tab;
- active tab `aria-selected`;
- tab `aria-controls="pcc-active-surface-panel"`;
- shell main `id="pcc-active-surface-panel"`;
- shell main `role="tabpanel"`;
- shell main `aria-labelledby={`pcc-tab-${activeSurfaceId}`}`.

### 3. Keep card marker compatibility in place

Do not remove `dataActiveSurfacePanel` props from cards in this prompt.

Card-level markers may temporarily coexist with the shell marker, but tests must distinguish:

- semantic active-panel owner: `main[role="tabpanel"][data-pcc-active-surface-panel="<surfaceId>"]`;
- deprecated compatibility marker: card-level `[data-pcc-card][data-pcc-active-surface-panel="<surfaceId>"]`.

Do not write tests that require active-panel ownership to be card-based.

### 4. Correct stale source comments, if present

If `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` still states that only one element in the rendered tree carries `data-pcc-active-surface-panel`, update that comment only.

Required comment posture:

- shell `main` is now the semantic active-panel owner;
- card-level markers may remain temporarily for compatibility;
- tests must not infer semantic ownership from the card marker.

Do not change router runtime behavior.

### 5. Repair stale test selector assumptions immediately

If `PccCardTierContract.test.tsx` still resolves the active bento by selecting the first `[data-pcc-active-surface-panel="<surfaceId>"]`, update only the stale helper/test logic needed to keep Prompt 01 valid.

Replace card-owner assumptions with shell-owner scoping.

Preferred helper shape:

```ts
function getActiveBento(container: HTMLElement, surfaceId: PccMvpSurfaceId): HTMLElement {
  const shellPanel = container.querySelector(
    `main[role="tabpanel"][data-pcc-active-surface-panel="${surfaceId}"]`,
  );
  expect(shellPanel, `surface '${surfaceId}' must mount its shell active panel`).not.toBeNull();
  expect(shellPanel!.getAttribute('id')).toBe('pcc-active-surface-panel');
  expect(shellPanel!.getAttribute('aria-labelledby')).toBe(`pcc-tab-${surfaceId}`);

  const bento = shellPanel!.querySelector('[data-pcc-bento-grid]');
  expect(bento, `surface '${surfaceId}' shell panel must contain [data-pcc-bento-grid]`).not.toBeNull();
  return bento as HTMLElement;
}
```

For any test that needs the active command card, do not use a broad `container.querySelector('[data-pcc-active-surface-panel="..."]')` selector. Scope to direct bento children and card markers, for example:

```ts
const bento = getActiveBento(container, surfaceId);
const activeCommandCard = Array.from(bento.children).find((child) =>
  child.matches(`[data-pcc-card][data-pcc-active-surface-panel="${surfaceId}"]`),
);
expect(activeCommandCard, `surface '${surfaceId}' compatibility active command card must render`).toBeTruthy();
```

This preserves compatibility-card validation without treating the card as the semantic active panel.

## Required Test Updates

### `PccShell.responsive.test.tsx`

Add or update tests to verify:

1. Default render has exactly one shell active panel:

```ts
const panels = container.querySelectorAll(
  'main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]',
);
expect(panels.length).toBe(1);
```

2. Default shell panel has:
   - `id="pcc-active-surface-panel"`;
   - `role="tabpanel"`;
   - `aria-labelledby="pcc-tab-project-home"`;
   - `data-pcc-canvas`.

3. Clicking Documents updates the shell marker and ARIA linkage:
   - `data-pcc-active-surface-panel="documents"`;
   - `aria-labelledby="pcc-tab-documents"`.

4. Clicking Site Health updates the shell marker and ARIA linkage:
   - `data-pcc-active-surface-panel="site-health"`;
   - `aria-labelledby="pcc-tab-site-health"`.

5. Every tab still has:
   - `role="tab"`;
   - `aria-controls="pcc-active-surface-panel"`;
   - non-empty `id`.

6. Do not assert that the broad selector `[data-pcc-active-surface-panel="<surfaceId>"]` has count `1`, because card-level compatibility markers may remain temporarily. Assert exactly one shell-owned marker instead.

### `PccCardTierContract.test.tsx`, if stale selector logic exists

Add or update assertions proving:

- `getActiveBento` finds the bento grid through shell `main`, not through a card parent assumption;
- every `[data-pcc-card]` remains a direct child of `[data-pcc-bento-grid]`;
- no `[data-pcc-card] [data-pcc-card]` nesting exists if such an assertion is already present or easy to add without broad refactor;
- card-level `data-pcc-active-surface-panel` checks are compatibility-only and scoped to direct bento children.

## Do Not

- Do not remove duplicate top-level header cards.
- Do not implement a Modules launcher.
- Do not introduce active module state.
- Do not introduce URL routing.
- Do not change shared layout primitives.
- Do not change surface runtime files unless a directly related failing test proves an unavoidable narrow fix.
- Do not introduce live SharePoint, Graph, Procore, Sage, Autodesk, or tenant mutation.
- Do not change package dependencies, lockfile, SPFx manifests, or package-solution files.
- Do not broadly format unrelated files.
- Do not claim Phase 2 completion, duplicate-card remediation completion, scorecard pass, or Phase 4 readiness from Prompt 01 alone.

## Validation Required

Run these commands and report results exactly:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccShell.responsive.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- PccCardTierContract.test.tsx
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check apps/project-control-center/src/shell/PccShell.tsx apps/project-control-center/src/tests/PccShell.responsive.test.tsx apps/project-control-center/src/tests/PccCardTierContract.test.tsx
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If filename-based test filtering is unsupported in this workspace, run the full package test and report the limitation.

## Required Plan Response Format

Before execution, respond with:

```markdown
## Objective

## Repo-Truth Checks Performed

## Files Proposed

## Implementation Plan

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

## Test Compatibility Repair

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
- stale tests no longer infer active-panel ownership from a card-level marker;
- bento cards remain direct children of `[data-pcc-bento-grid]`;
- duplicate header cards remain in place;
- card-level markers remain compatibility-only;
- no package/lockfile/manifest drift occurs.
