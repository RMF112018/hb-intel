# Updated Prompt 04 — Direct-Child and No-Nested-Card Guardrail Hardening

## Objective

Harden PCC direct-child and no-nested-card guardrails after Prompts 01–03 without redoing completed active-panel ownership repairs.

Current repo truth indicates Prompt 01 already repaired `PccCardTierContract.test.tsx` so it resolves the active bento grid through shell `main[role="tabpanel"][data-pcc-active-surface-panel]`, not through a card-level marker. Prompt 04 must therefore focus on the remaining value: test hardening that proves all active surfaces keep cards as direct bento-grid children, no card nests inside another card, and compatibility card markers remain explicitly scoped as temporary card-level compatibility rather than semantic active-panel ownership.

This prompt is test-only by default. Do not edit production code unless repo truth shows a stale production comment that directly contradicts the shell-owner / card-compatibility bridge.

## Mandatory Opening Instruction

Before making any changes, confirm you are operating on the current repo state.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Scope Control

This is a guardrail hardening prompt, not a layout refactor.

Do not:

- re-implement Prompt 01 active-panel ownership changes;
- re-implement Prompt 02 shell hero metadata rendering;
- re-implement Prompt 03 metadata switching tests;
- remove duplicate top-level/header cards;
- remove or demote card-level `dataActiveSurfacePanel` / `data-pcc-active-surface-panel` markers;
- edit `PccDashboardCard.tsx`;
- edit `PccBentoGrid.tsx`;
- edit `footprints.ts`;
- edit surface runtime files;
- edit Playwright/e2e files;
- introduce live SharePoint, Graph, Procore, Sage, Autodesk, CRM, or tenant mutation;
- add package dependencies;
- edit `pnpm-lock.yaml`, manifests, package-solution files, or package dependency sections;
- broadly format unrelated files.

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
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/layout/PccDashboardCard.test.tsx
apps/project-control-center/config/package-solution.json
package.json
pnpm-lock.yaml
```

### 2. Confirm Prompt 01 active-panel repair is already present

Inspect:

```text
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
```

Confirm:

- `getActiveBento` resolves the shell active panel using:
  ```text
  main[role="tabpanel"][data-pcc-active-surface-panel="<surfaceId>"]
  ```
- `getActiveBento` then finds `[data-pcc-bento-grid]` inside shell `main`;
- the helper no longer assumes the active-panel marker belongs to a card whose parent is the bento grid;
- `getActiveCompatibilityCard` or equivalent scopes card-level compatibility markers to direct bento children;
- the file already asserts direct child posture for cards.

If these are already present, do not rewrite this file unless a clear missing guardrail exists.

If the stale card-parent helper has somehow returned, repair it using the Prompt 01 pattern and report the drift.

### 3. Confirm current bento integration guardrails

Inspect:

```text
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
```

Confirm current coverage. Expected current gap:

- it likely verifies the default render / Project Home only;
- it may not iterate all eight `PCC_MVP_SURFACE_IDS`;
- it may not explicitly assert zero nested card selectors:
  ```text
  [data-pcc-card] [data-pcc-card]
  ```

Prompt 04 should close this integration-level gap.

### 4. Confirm footprint/grid primitive tests

Inspect:

```text
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
apps/project-control-center/src/layout/PccDashboardCard.test.tsx
```

Confirm:

- `PccBentoGrid.footprints.test.tsx` already checks footprint/column/row span behavior and the compatibility marker can be emitted from `PccDashboardCard`;
- `PccDashboardCard.test.tsx` already proves `dataActiveSurfacePanel` can emit a card-level marker;
- existing wording does not describe card-level marker as semantic active-panel ownership.

If wording is stale, update test names/comments only. Do not edit the primitive.

### 5. Search for stale active-panel assumptions

Run:

```bash
rg -n "getActiveBento|dataActiveSurfacePanel|data-pcc-active-surface-panel|active-panel card|active-panel parent|must mount its active panel|active-panel carrier|querySelector\(\`\[data-pcc-active-surface-panel" apps/project-control-center/src/tests apps/project-control-center/src/layout apps/project-control-center/src/shell --glob '!**/node_modules/**'
```

Classify findings as:

- shell semantic owner;
- card-level compatibility marker;
- test helper;
- stale broad selector;
- stale wording/comment.

Required repair criteria:

- shell-rendered tests must scope semantic ownership to `main[role="tabpanel"]`;
- compatibility-card tests must scope to direct bento children:
  ```text
  [data-pcc-bento-grid] > [data-pcc-card][data-pcc-active-surface-panel="<surfaceId>"]
  ```
- no test should imply the card marker is semantic active-panel ownership;
- no shell-rendered test should assert broad global `[data-pcc-active-surface-panel]` count equals one.

## Expected Files

Expected test file:

```text
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
```

Optional test files only if repo truth shows a direct gap:

```text
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
apps/project-control-center/src/layout/PccDashboardCard.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
```

Optional new focused test, only if it keeps the integration file cleaner:

```text
apps/project-control-center/src/tests/PccShell.activePanelOwnership.test.tsx
```

Expected production files: **none**.

Do not edit:

```text
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/surfaces/**/*
e2e/pcc-live/**/*
apps/project-control-center/config/package-solution.json
package.json
pnpm-lock.yaml
```

## Implementation Requirements

### 1. Add all-surface direct-child / no-nested-card integration guardrail

In `PccApp.bentoIntegration.test.tsx`, import:

```ts
import { PCC_MVP_SURFACE_IDS, type PccMvpSurfaceId } from '@hbc/models/pcc';
import { fireEvent, render, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
```

Add explicit cleanup:

```ts
afterEach(() => {
  cleanup();
});
```

Add helper functions local to the test file:

```ts
function renderAppOnSurface(surfaceId: PccMvpSurfaceId): HTMLElement {
  const { container } = render(<PccApp forceMode="desktop" />);
  const tab = container.querySelector(`[data-pcc-tab-id="${surfaceId}"]`);
  expect(tab, `tab for '${surfaceId}' must exist`).not.toBeNull();
  fireEvent.click(tab!);
  return container;
}

function getShellPanel(container: HTMLElement, surfaceId: PccMvpSurfaceId): HTMLElement {
  const panel = container.querySelector(
    `main[role="tabpanel"][data-pcc-active-surface-panel="${surfaceId}"]`,
  );
  expect(panel, `surface '${surfaceId}' must mount exactly one shell active panel`).not.toBeNull();
  expect(panel!.tagName).toBe('MAIN');
  expect(panel!.getAttribute('role')).toBe('tabpanel');
  expect(panel!.getAttribute('aria-labelledby')).toBe(`pcc-tab-${surfaceId}`);
  return panel as HTMLElement;
}

function getBentoFromShellPanel(panel: HTMLElement, surfaceId: PccMvpSurfaceId): HTMLElement {
  const bento = panel.querySelector('[data-pcc-bento-grid]');
  expect(bento, `surface '${surfaceId}' shell panel must contain bento grid`).not.toBeNull();
  return bento as HTMLElement;
}
```

Add an all-surface test loop:

```ts
describe('PccApp bento integration — all active surfaces direct-child guardrail', () => {
  for (const surfaceId of PCC_MVP_SURFACE_IDS) {
    it(`'${surfaceId}' renders cards as direct bento children with no nested card trees`, () => {
      const container = renderAppOnSurface(surfaceId);
      const panel = getShellPanel(container, surfaceId);
      const bento = getBentoFromShellPanel(panel, surfaceId);
      const cards = Array.from(bento.querySelectorAll('[data-pcc-card]'));
      expect(cards.length, `surface '${surfaceId}' must render at least one card`).toBeGreaterThan(0);

      const nestedCards = bento.querySelectorAll('[data-pcc-card] [data-pcc-card]');
      expect(
        nestedCards.length,
        `surface '${surfaceId}' must not render nested [data-pcc-card] descendants`,
      ).toBe(0);

      for (const card of cards) {
        const title = card.querySelector('h2, h3, h4')?.textContent?.trim() ?? '(untitled)';
        expect(
          card.parentElement,
          `surface '${surfaceId}' card '${title}' must be a direct child of [data-pcc-bento-grid]`,
        ).toBe(bento);

        expect(card.getAttribute('data-pcc-card-tier'), `surface '${surfaceId}' card '${title}' tier`).toBeTruthy();
        expect(card.getAttribute('data-pcc-card-region'), `surface '${surfaceId}' card '${title}' region`).toBeTruthy();
        expect(card.getAttribute('data-pcc-footprint'), `surface '${surfaceId}' card '${title}' footprint`).toBeTruthy();
        expect(Number(card.getAttribute('data-pcc-column-span'))).toBeGreaterThan(0);
        expect(Number(card.getAttribute('data-pcc-row-span'))).toBeGreaterThan(0);
      }

      const compatibilityCards = Array.from(bento.children).filter((child) =>
        child.matches(`[data-pcc-card][data-pcc-active-surface-panel="${surfaceId}"]`),
      );
      expect(
        compatibilityCards,
        `surface '${surfaceId}' must keep one direct bento-child compatibility active-panel card`,
      ).toHaveLength(1);
    });
  }
});
```

This test intentionally overlaps some `PccCardTierContract.test.tsx` coverage, but it belongs in `PccApp.bentoIntegration.test.tsx` because it proves the full shell + active tab + bento integration path for all eight surfaces, not only default Project Home.

### 2. Preserve existing default-render tests

Do not remove existing `PccApp.bentoIntegration.test.tsx` tests unless they become redundant and clearly inferior. Prefer additive changes.

Existing default-render tests may remain as smoke/regression tests.

### 3. Add explicit no-nested-card guard to `PccCardTierContract.test.tsx` only if missing

If `PccCardTierContract.test.tsx` already catches nested cards because it gathers all cards under bento and asserts each card’s parent is bento, a separate no-nested-card selector is optional.

If you add it, keep it small and avoid broad rewrites:

```ts
const nestedCards = bento.querySelectorAll('[data-pcc-card] [data-pcc-card]');
expect(nestedCards.length, `surface '${surfaceId}' must not render nested cards`).toBe(0);
```

### 4. Keep compatibility wording precise

If touching `PccBentoGrid.footprints.test.tsx` or `PccDashboardCard.test.tsx`, update wording only if needed so it says:

- `dataActiveSurfacePanel` is a card-level compatibility marker;
- shell `main[role="tabpanel"]` is semantic active-panel ownership;
- the marker must not be described as semantic active-panel ownership.

Do not alter runtime expectations.

### 5. Do not create `PccShell.activePanelOwnership.test.tsx` unless useful

Prefer updating `PccApp.bentoIntegration.test.tsx`. Create a new focused file only if the resulting test file becomes hard to read.

## Required Assertions

Final test state must prove:

- exactly one shell active panel exists for each active surface under test;
- the shell active panel is a `MAIN`;
- the shell active panel has `role="tabpanel"`;
- the shell active panel has expected `aria-labelledby`;
- every surface renders at least one card;
- cards remain direct children of `[data-pcc-bento-grid]`;
- no `[data-pcc-card] [data-pcc-card]` nesting exists;
- card tier/region/footprint/column-span/row-span markers remain present and non-empty or positive;
- exactly one direct bento-child compatibility card remains for each active surface;
- no test relies on active-panel marker being a bento card.

## Validation Required

Run and report these commands exactly:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccApp.bentoIntegration.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- PccCardTierContract.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- PccBentoGrid.footprints.test.tsx
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx apps/project-control-center/src/tests/PccCardTierContract.test.tsx apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx apps/project-control-center/src/layout/PccDashboardCard.test.tsx apps/project-control-center/src/tests/PccShell.responsive.test.tsx apps/project-control-center/src/tests/PccShell.navigation.test.tsx apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If only `PccApp.bentoIntegration.test.tsx` is touched, it is acceptable to narrow the Prettier command to that touched file plus any actually touched optional files, but report the narrowed command clearly.

If filename-based test filtering is unsupported in this workspace, run the full package test and report that limitation.

If `prettier --check` fails only on touched files, run `prettier --write` only on touched files, then rerun:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <touched-files-only>
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

## Direct-Child / No-Nested Guardrail Plan

## Compatibility Marker Plan

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

## Direct-Child / No-Nested Guardrail Proof

## Compatibility Marker Proof

## Tests / Validation Run

## Package / Lockfile / Manifest Posture

## Residual Risks

## Next Prompt Status
```

## Completion Standard for Prompt 04

Prompt 04 is complete only when:

- it does not redo Prompt 01 active-panel ownership repairs;
- stale card-parent active-panel helper logic is absent;
- all eight active surfaces are covered by a full-app direct-child/no-nested-card integration guardrail;
- shell `main[role="tabpanel"]` remains semantic active-panel owner;
- card-level active-panel marker remains one direct bento-child compatibility card per active surface;
- direct-child and no-nested-card assertions are explicit;
- no duplicate bento header cards are removed;
- no surface runtime files are edited;
- no shared layout primitives are edited;
- no Playwright/e2e files are edited;
- no package/lockfile/manifest/package-solution drift occurs.
