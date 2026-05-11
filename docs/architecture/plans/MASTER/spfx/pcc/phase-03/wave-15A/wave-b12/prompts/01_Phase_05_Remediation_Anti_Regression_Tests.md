# PCC Phase 07 — Claude Code Opus 4.7 Execution Prompt

## Prompt 01 — Phase 05 Remediation Anti-Regression Tests

## Required Operating Mode

You are executing inside the `RMF112018/hb-intel` repo as a local code agent using Claude Code with Opus 4.7.

Follow these rules for this prompt:

- Work only inside the repo.
- Do not make broad, unfocused repo scans.
- Do not re-read files that are still within your current context or memory unless you need to verify drift or inspect a specific changed section.
- Prefer targeted file reads and targeted searches.
- Do not install dependencies.
- Do not add `echarts-for-react`.
- Do not mutate tenant systems, Procore, Sage, SharePoint, or any live external system.
- Do not introduce command-model behavior, approval execution, source-system mutation, sync execution, or autonomous HBI decisioning.
- Do not render developer/internal copy in the UI.
- Preserve Project Home Phase 06 behavior.
- Preserve Document Control’s specialized `PccDocumentsSurface`.
- Keep the bento direct-child invariant intact.
- Keep shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]` ownership intact.
- If repo truth differs from this prompt, stop and report the mismatch rather than forcing stale instructions.

## Current Phase 07 Starting Point

Prompt 00 established the current intended starting point:

```text
Current branch: main
Current HEAD at Prompt 00 closeout: ebfd9d7e44e2e9edfb1d26368fbec0afe0e58c81
Ahead of Phase 06 evidence baseline by one docs-only Phase 07 prompt-package commit.
PCC package posture: 1.0.0.218 / 1.0.0.218
pnpm-lock.yaml md5: 7c19ccfa8718a42f7f55ce178a626996
echarts: present
echarts-for-react: absent
Working tree at Prompt 00 closeout: clean
```

Phase 06 evidence commits:

```text
4c772ac3c8e48c46bb5f5bdb108fb53b1b51bb7a
e6886489bb4f85d32840f69914dfb3b615f28aaf
```

Phase 06 evidence roots:

```text
docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/
docs/architecture/evidence/pcc-live/surface-smoke-1778491135146/
```

Known current regression to test against:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
currently renders a first direct bento child card with:
  footprint="hero"
  hierarchy="primary"
  tier="tier1"
  region="command"
  eyebrow="Dashboard"
  title={tab.dashboardTitle}
  body containing tab.dashboardDescription
  body containing NO_WRITEBACK_POSTURE
  optional Cost & Time Sage book-of-record paragraph
```

Prompt 01 is tests-only. Do not fix the regression in this prompt.

## Objective

Add focused anti-regression tests that fail on the current Phase 05 regression: redundant top-level Dashboard/title-description bento cards returned on the six shared primary-dashboard pages.

This prompt intentionally adds the failing guard before Prompt 02 removes the production card.

## Scope

Create this test file:

```text
apps/project-control-center/src/tests/PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx
```

Inspect only as needed:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
```

Do not edit these files during Prompt 01 unless you discover that the new test file already exists and must be updated in place:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/analytics/
apps/project-control-center/config/package-solution.json
apps/project-control-center/package.json
pnpm-lock.yaml
```

## Surfaces Covered

The new test must cover only these six shared primary-dashboard surfaces:

```text
core-tools
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

The new test must explicitly exclude:

```text
project-home
documents
```

Rationale:

- `project-home` is owned by Phase 06 Project Home composition, read-model, gateway, row-sum, and analytics tests.
- `documents` is owned by the specialized `PccDocumentsSurface` and must not be folded into `PccPrimaryDashboardSurface`.

## Required Test Rendering Pattern

Use the direct shared-dashboard render pattern unless current local compile/type constraints prove it invalid:

```tsx
<PccBentoGrid forceMode="desktop">
  <PccPrimaryDashboardSurface activePrimaryTabId={tabId} />
</PccBentoGrid>
```

Required imports will likely include:

```tsx
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { getPrimaryNavigationTab, type PccPrimaryTabId } from '@hbc/models/pcc';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccPrimaryDashboardSurface } from '../surfaces/phase05Dashboard/PccPrimaryDashboardSurface';
```

Do not use CSS classes as selectors.

## Stable DOM Markers

Use stable markers that are actually emitted by `PccDashboardCard` and `PccBentoGrid`:

```text
[data-pcc-bento-grid]
[data-pcc-card]
data-pcc-footprint
data-pcc-card-hierarchy
data-pcc-card-tier
data-pcc-card-region
data-pcc-column-span
data-pcc-active-surface-panel
```

Do not assert implementation CSS module class names.

## Required Test Helpers

Implement helper functions similar to these, adjusted only as necessary for local conventions:

```tsx
function getGrid(container: HTMLElement): HTMLElement {
  const grid = container.querySelector<HTMLElement>('[data-pcc-bento-grid]');
  if (!grid) throw new Error('No [data-pcc-bento-grid] found');
  return grid;
}

function getDirectChildCards(grid: HTMLElement): HTMLElement[] {
  return Array.from(grid.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
  );
}

function getCardHeading(card: HTMLElement): string {
  return card.querySelector('h2, h3, h4')?.textContent?.trim() ?? '';
}
```

## Required Assertions

For each of the six affected surfaces, assert all of the following:

### 1. Direct-card structure

- The grid exists.
- Every direct bento child is a `[data-pcc-card]` element.
- There is at least one direct child card.
- The shared dashboard grid contains zero nested cards:

```text
[data-pcc-card] [data-pcc-card]
```

- The shared dashboard grid contains zero card-level active-panel markers:

```text
[data-pcc-card][data-pcc-active-surface-panel]
```

### 2. First-card target posture

The first direct child card heading must be exactly:

```text
Module status
```

The first direct child card heading must not be any of these values:

```text
Dashboard
Core Tools
Estimating & Preconstruction
Project Startup & Closeout
Project Controls
Cost & Time
Systems Administration
```

This assertion is intentionally expected to fail against the current pre-fix production source because the current first card is the generic surface identity card.

### 3. Duplicate header-card pattern is absent

Use `getPrimaryNavigationTab(tabId)` to obtain the current tab metadata.

For every direct child card, assert that no card matches all of these conditions:

- visible card heading equals `tab.dashboardTitle`;
- visible card body/text includes `tab.dashboardDescription`;
- card has all of these marker values:
  - `data-pcc-footprint="hero"`
  - `data-pcc-card-hierarchy="primary"`
  - `data-pcc-card-tier="tier1"`
  - `data-pcc-card-region="command"`

This test should fail against the current generic top-card regression.

Do not rely on the `eyebrow="Dashboard"` prop directly because `PccDashboardCard` does not currently emit a dedicated eyebrow data marker. Visible text checks may include the word `Dashboard`, but the stable guard must be heading/body/marker based.

### 4. Developer/internal UI copy is absent

For each shared dashboard grid’s rendered text, assert it does not contain forbidden developer/internal terms as visible UI copy.

Use a bounded list aligned with existing test posture:

```text
todo
tbd
placeholder
stub
mock
fixture
debug
dev-only
not implemented
lorem
developer
code agent
prompt
repo
test selector
internal only
coming soon
```

Implementation guidance:

- Run this assertion only against rendered `grid.textContent`, not source files.
- Use word-boundary regex where practical.
- Do not add broad terms such as `sample`, `preview`, or `source`; those are legitimate current end-user cues in PCC.

## Explicit Exclusions

Do not add or modify assertions for:

- Project Home card order.
- Project Home read-model count.
- Project Home row-sum choreography.
- Project Home gateway button behavior.
- Document Control surface composition.
- ECharts rendering behavior.
- Phase 06 analytics card count/order for individual surfaces.
- SPFx package version.
- Playwright live evidence.
- Tenant deployment or live page validation.

Those are handled by later prompts or existing tests.

## Expected Result Before Production Fix

After this prompt, the new focused test is expected to fail against the current source because Prompt 02 has not yet removed the generic top card.

Expected failure themes:

```text
first direct card heading is not Module status
a direct child card still matches the duplicate header-card pattern
```

This expected focused-test failure is acceptable and is the purpose of Prompt 01.

Do not change production source in Prompt 01 to make the test pass.

## Commands

First record repo state:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Then run the focused test:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccPhase07NoRedundantSharedDashboardHeaderCards
```

If the repo’s Vitest filter syntax differs, use the current working focused-test command and report the exact command.

Expected outcome:

- The focused test may fail for the two expected regression reasons above.
- If it fails for compile/type/import errors, fix the test file only.
- If it fails because the regression is already absent, stop and report that Prompt 02 may already have been applied or repo truth has drifted.

Then run typecheck:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
```

Then run targeted formatting/diff checks:

```bash
pnpm exec prettier --check apps/project-control-center/src/tests/PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx
git diff --check
git diff --stat
git diff --name-only
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Do not run live Playwright in Prompt 01.

Do not run full PCC Vitest in Prompt 01 unless the focused test unexpectedly passes after only test edits, which would indicate repo truth drift.

## Acceptance Criteria

Prompt 01 is complete when:

- The new anti-regression test file exists.
- It covers all six shared primary dashboards.
- It explicitly excludes Project Home and Documents.
- It uses stable DOM markers and no CSS class selectors.
- It creates tests that fail or would fail against the current generic top-card regression.
- The failure is limited to expected pre-fix production behavior, not test compile/type errors.
- It does not modify production source.
- It does not weaken or edit Phase 06 tests.
- It does not change dependencies, lockfile, SPFx package manifest, or package version.
- `check-types` passes.
- Prettier check on the new test file passes.
- `git diff --check` passes.
- `pnpm-lock.yaml` md5 remains `7c19ccfa8718a42f7f55ce178a626996`.

## Required Closeout Response

Report:

```text
HB: Phase 07 Prompt 01 Closeout

Branch / HEAD:
- Branch:
- HEAD:
- Working tree before:
- Working tree after:

Files changed:
- ...

Focused test result:
- Command:
- Result:
- Expected failing assertions observed:
  - ...
- Compile/type errors: yes/no

Validation:
- check-types:
- prettier:
- git diff --check:
- pnpm-lock md5 before:
- pnpm-lock md5 after:

Guardrails:
- Production source modified: yes/no
- Phase 06 tests modified: yes/no
- Project Home modified: yes/no
- Document Control modified: yes/no
- package-solution modified: yes/no
- package.json modified: yes/no
- pnpm-lock modified: yes/no
- Dependencies installed: yes/no
- Live systems touched: yes/no
- Playwright run: yes/no

Proceed / Stop:
- Proceed to Prompt 02 only if the focused failure is the expected pre-fix redundant-card failure and all non-runtime validations are clean.
```
