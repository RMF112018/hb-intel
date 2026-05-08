# Updated Prompt 03 — Active Surface Header Metadata Switching and Compatibility Bridge Contract

## Objective

Harden the active-surface header metadata path after Prompt 02. Do **not** re-implement the shell hero metadata seam. Instead, verify and lock that the existing `PccApp` → `deriveShellHeroViewModel` → `PccShell` → `PccProjectHeroBand` path updates the compact header metadata when the active tab changes, while preserving the Prompt 01 shell/card compatibility bridge.

This prompt is primarily a test-and-contract hardening prompt. Production changes should be limited to narrow comments only if repo truth shows a stale or missing compatibility-bridge explanation. Do not remove bento header cards in this prompt.

## Mandatory Opening Instruction

Before making any changes, confirm you are operating on the current repo state.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Scope Control

This prompt must remain narrow.

Do not:

- remove duplicate top-level/header cards;
- demote card-level `dataActiveSurfacePanel` markers;
- edit `PccDashboardCard.tsx`;
- edit `PccBentoGrid.tsx`;
- edit surface runtime files unless a directly related failing test proves an unavoidable narrow correction and you stop to report first;
- rework the shell hero layout added in Prompt 02;
- introduce a Modules launcher;
- activate command search;
- introduce URL routing or active module state;
- introduce live SharePoint, Graph, Procore, Sage, Autodesk, CRM, or tenant mutation;
- edit Playwright/e2e files;
- edit package dependencies, manifests, package-solution files, or `pnpm-lock.yaml`;
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
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/tests/projectShellViewModel.test.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/config/package-solution.json
package.json
pnpm-lock.yaml
```

### 2. Confirm Prompt 02 is already implemented

Inspect:

```text
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
```

Confirm:

- `PCC_SHELL_SURFACE_HEADER_METADATA` exists;
- it is typed as an exhaustive `Record<PccMvpSurfaceId, IPccShellSurfaceHeaderMetadata>`;
- all eight surfaces have metadata;
- `IPccShellHeroViewModel` includes:
  - `surfaceSummaryItems`;
  - `surfaceCues`;
  - `readOnlyCue`;
- `deriveShellHeroViewModel(profile, activeSurfaceId)` populates those fields from active-surface metadata;
- `PccProjectHeroBand` already renders:
  - `data-pcc-hero-surface-summary`;
  - `data-pcc-hero-summary-item`;
  - `data-pcc-hero-summary-tone`;
  - `data-pcc-hero-surface-cues`;
  - `data-pcc-hero-surface-cue`;
  - `data-pcc-hero-read-only-cue`.

If any of these are missing, stop and report that Prompt 02 did not land as expected. Do not silently re-run Prompt 02 under Prompt 03.

### 3. Confirm active-surface path

Inspect:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
```

Confirm:

- `PccApp` gets active state from `usePccShellState`;
- `PccApp` calls `deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, shell.activeSurfaceId)`;
- `PccApp` passes the resulting `heroViewModel` to `PccShell`;
- `PccShell` passes `heroViewModel` to `PccProjectHeroBand`;
- `PccShell` still passes `activeSurfaceId` to `PccHorizontalTabs`;
- shell `<main>` still owns `data-pcc-active-surface-panel={activeSurfaceId}`.

Do not edit `PccApp.tsx` or `PccShell.tsx` unless repo truth contradicts the above and you stop to report first.

### 4. Confirm compatibility bridge state

Run targeted searches:

```bash
rg -n "dataActiveSurfacePanel|data-pcc-active-surface-panel" apps/project-control-center/src --glob '!**/node_modules/**'
rg -n "compatibility command card|semantic active-panel owner|shell active panel|card-level compatibility" apps/project-control-center/src --glob '!**/node_modules/**'
```

Classify results into:

- shell semantic owner;
- card-level compatibility marker;
- test helper;
- production comment;
- stale broad-marker assumption.

Confirm:

- shell `main[role="tabpanel"]` is the semantic active-panel owner;
- card-level `dataActiveSurfacePanel` remains a deprecated compatibility bridge;
- tests distinguish shell ownership from the direct bento-child compatibility card;
- duplicate bento header cards remain and must not be removed in Prompt 03.

If any stale broad `[data-pcc-active-surface-panel]` count-of-one assertion remains in a shell-rendered tree, repair that test in this prompt using the Prompt 01 pattern.

## Expected Files

Expected test files:

```text
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/projectShellViewModel.test.ts
```

Optional test files, only if repo truth shows a better fit:

```text
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/surfaceHeaderMetadata.test.ts
```

Expected production files: **none**, unless a narrow comment-only update is required.

Optional comment-only production files:

```text
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/shell/PccShell.tsx
```

Do not edit these files in Prompt 03:

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

### 1. Do not re-render or duplicate Prompt 02 metadata

Prompt 02 already owns:

- metadata type definitions;
- exhaustive metadata map;
- view-model fields;
- hero rendering zones;
- hero CSS.

Prompt 03 must not add a second metadata render location, duplicate summary/cue rows, or change the layout unless tests reveal a direct regression.

### 2. Add active-tab metadata switching coverage

Add or update tests that render `<PccApp forceMode="standardLaptop" />` and prove the shell hero metadata changes when tabs change.

Required coverage:

- default Project Home metadata;
- Documents tab click;
- Site Health tab click.

For each of those three surfaces, assert at minimum:

- secondary title matches the active surface display name;
- shell `<main>` owns `data-pcc-active-surface-panel="<surfaceId>"`;
- summary item `mode` has the expected value:
  - Project Home: `Command preview`;
  - Documents: `Document control preview`;
  - Site Health: `Site health preview`;
- summary item `authority` has the expected value:
  - Project Home: `Advisory only`;
  - Documents: `Navigation context only`;
  - Site Health: `Repair context only`;
- a key cue exists:
  - Project Home: `data-pcc-hero-surface-cue="hbi-boundary"`;
  - Documents: `data-pcc-hero-surface-cue="external-files"`;
  - Site Health: `data-pcc-hero-surface-cue="repair-boundary"`;
- `data-pcc-hero-read-only-cue` text matches the active surface metadata.

Recommended local helper inside `PccShell.responsive.test.tsx`:

```ts
function expectShellHeroMetadata(
  container: HTMLElement,
  expected: {
    readonly surfaceId: string;
    readonly secondaryTitle: string;
    readonly modeValue: string;
    readonly authorityValue: string;
    readonly cueId: string;
    readonly readOnlyCueIncludes: string;
  },
): void {
  expect(
    container
      .querySelector('main[role="tabpanel"][data-pcc-active-surface-panel]')
      ?.getAttribute('data-pcc-active-surface-panel'),
  ).toBe(expected.surfaceId);
  expect(container.querySelector('[data-pcc-hero-secondary-title]')?.textContent).toBe(
    expected.secondaryTitle,
  );

  const mode = container.querySelector('[data-pcc-hero-summary-item="mode"]');
  expect(mode?.textContent).toContain('Mode');
  expect(mode?.textContent).toContain(expected.modeValue);

  const authority = container.querySelector('[data-pcc-hero-summary-item="authority"]');
  expect(authority?.textContent).toContain('Authority');
  expect(authority?.textContent).toContain(expected.authorityValue);

  expect(container.querySelector(`[data-pcc-hero-surface-cue="${expected.cueId}"]`)).not.toBeNull();
  expect(container.querySelector('[data-pcc-hero-read-only-cue]')?.textContent).toContain(
    expected.readOnlyCueIncludes,
  );
}
```

### 3. Harden all-eight metadata contract

If `projectShellViewModel.test.ts` already covers all eight surfaces, keep that coverage and add only missing assertions.

Required all-eight assertions:

- every `PCC_MVP_SURFACE_IDS` key exists in `PCC_SHELL_SURFACE_HEADER_METADATA`;
- every surface has at least three `surfaceSummaryItems`;
- every surface has at least two `surfaceCues`;
- every item/cue has non-empty `id`, `label`, and `value`;
- `readOnlyCue` is non-empty;
- no metadata value contains `http://` or `https://`;
- no metadata value implies direct write action by using labels such as `Approve`, `Reject`, `Upload`, `Delete`, `Sync`, or `Launch` as affirmative action labels.

Important: do **not** use brittle word blocklists that would fail on negating phrases like “No approve / reject action from this header” or “no uploads, moves, deletes.” The test should guard affirmative affordance labels/URLs, not ban negated safety copy.

### 4. Harden inert rendering contract

If `PccProjectHeroBand.test.tsx` already covers inert metadata zones, keep that coverage and add only missing assertions.

Required assertions:

- summary zone exists once;
- cue zone exists once;
- read-only cue exists once;
- summary/cue/read-only zones contain no:
  - `input`;
  - `button`;
  - `a`;
  - `select`;
  - `textarea`;
  - `[tabindex="0"]`;
  - `[role="button"]`;
- command-search slot remains non-interactive and preview-only;
- no `data-pcc-source-confidence` marker is introduced;
- no pill-row markers are introduced.

### 5. Compatibility bridge comment/test posture

Add a comment in tests, or a narrow production comment only if missing, that states:

- shell `main[role="tabpanel"]` is the semantic active-panel owner;
- card-level `dataActiveSurfacePanel` / `data-pcc-active-surface-panel` is a deprecated compatibility marker;
- future duplicate-card removal should remove or demote card markers only after tests, evidence capture, and e2e selectors are updated.

Do not remove or demote the markers in Prompt 03.

### 6. Do not modify `PccApp.tsx` unless necessary

The expected current path is already correct:

```text
active tab → shell.activeSurfaceId → deriveShellHeroViewModel(profile, activeSurfaceId) → PccProjectHeroBand
```

If repo truth confirms this, do not edit `PccApp.tsx`.

## Required Tests

At minimum, the final test state must prove:

- active surface header metadata changes for Project Home, Documents, and Site Health;
- all eight surface IDs have deterministic metadata;
- compact summary/cue items render without empty labels/values;
- metadata zones introduce no interactive controls;
- command-search preview remains non-focusable/non-operational;
- Prompt 01 shell semantic owner remains intact;
- card-level compatibility markers remain in place as direct bento-child compatibility cards;
- no bento card is removed.

## Validation Required

Run and report these commands exactly:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccShell.responsive.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- PccProjectHeroBand.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- projectShellViewModel.test.ts
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check apps/project-control-center/src/tests/PccShell.responsive.test.tsx apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx apps/project-control-center/src/tests/projectShellViewModel.test.ts
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If you create `apps/project-control-center/src/tests/surfaceHeaderMetadata.test.ts`, include it in the targeted test and Prettier commands.

If you make a comment-only production edit, include that touched production file in the Prettier command.

If filename-based test filtering is unsupported, run the full package test and report the limitation.

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

## Active-Tab Metadata Switching Test Plan

## Compatibility Bridge Test / Comment Plan

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

## Active-Tab Metadata Switching Proof

## Compatibility Bridge Proof

## Rendering / Accessibility Proof

## Tests / Validation Run

## Package / Lockfile / Manifest Posture

## Residual Risks

## Next Prompt Status
```

## Completion Standard for Prompt 03

Prompt 03 is complete only when:

- it does not re-implement Prompt 02;
- active-tab changes update visible shell hero metadata for Project Home, Documents, and Site Health;
- all eight surfaces remain covered by deterministic metadata tests;
- summary/cue/read-only metadata remains non-interactive;
- command-search preview remains non-focusable/non-operational;
- shell `main[role="tabpanel"]` remains the semantic active-panel owner;
- card-level compatibility markers remain in place and are still tested as direct bento-child compatibility cards;
- duplicate bento header cards remain in place;
- no surface runtime files are edited;
- no shared layout primitives are edited;
- no Playwright/e2e files are edited;
- no package/lockfile/manifest/package-solution drift occurs.
