# PCC Phase 07 — Claude Code Opus 4.7 Execution Prompt

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
- Preserve Project Home Phase 06 behavior unless this prompt explicitly says otherwise.
- Preserve Document Control’s specialized `PccDocumentsSurface` unless this prompt explicitly says otherwise.
- Keep the bento direct-child invariant intact.
- Keep shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]` ownership intact.
- If repo truth differs from this prompt, stop and report the mismatch rather than forcing stale instructions.

## Phase 07 Baseline

Current intended baseline:

```text
PCC package posture: 1.0.0.218 / 1.0.0.218
pnpm-lock.yaml md5: 7c19ccfa8718a42f7f55ce178a626996
Phase 06 evidence commits:
  4c772ac3c8e48c46bb5f5bdb108fb53b1b51bb7a
  e6886489bb4f85d32840f69914dfb3b615f28aaf
Phase 06 evidence root:
  docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/
  docs/architecture/evidence/pcc-live/surface-smoke-1778491135146/
```

Phase 07 objective:

```text
Remove and permanently block the Phase 05 regression where redundant top-level
Dashboard/title-description bento cards returned on the six shared primary
dashboard pages: Core Tools, Estimating & Preconstruction, Project Startup &
Closeout, Project Controls, Cost & Time, and Systems Administration.
```


# Prompt 01 — Phase 05 Remediation Anti-Regression Tests

## Objective

Add focused tests that fail on the current Phase 05 regression: redundant top-level bento cards returned on the six shared primary-dashboard pages.

This prompt intentionally adds tests before the production fix.

## Scope

Create or update:

```text
apps/project-control-center/src/tests/PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx
```

Also inspect but do not unnecessarily edit:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
```

## Surfaces Covered

```text
core-tools
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

Do not include:

```text
project-home
documents
```

Project Home and Documents have their own surfaces and preservation tests.

## Required Test Behavior

Render each shared dashboard using the same test utility pattern already used by the current test suite, usually:

```tsx
<PccBentoGrid forceMode="desktop">
  <PccPrimaryDashboardSurface activePrimaryTabId={tabId} />
</PccBentoGrid>
```

If current tests use `PccSurfaceRouter`, follow the existing local convention.

For each affected surface, assert:

1. There is at least one direct bento child.
2. The first direct card heading is exactly `Module status`.
3. The first direct card heading is **not**:
   - `Dashboard`
   - `Core Tools`
   - `Estimating & Preconstruction`
   - `Project Startup & Closeout`
   - `Project Controls`
   - `Cost & Time`
   - `Systems Administration`
4. No direct bento child card uses the duplicate header-card pattern:
   - heading equals the tab dashboard title;
   - visible body includes the tab dashboard description;
   - card marker shows command/primary/tier1 top-card posture.
5. The shared dashboard grid contains no nested `[data-pcc-card] [data-pcc-card]`.
6. The shared dashboard grid contains no card-level `[data-pcc-active-surface-panel]`.
7. The rendered text does not include developer/internal UI copy.

## Required Helper Expectations

Use stable DOM markers:

```text
[data-pcc-bento-grid]
[data-pcc-card]
data-pcc-card-tier
data-pcc-card-region
data-pcc-card-hierarchy
```

Do not assert CSS class names.

## Expected Result Before Production Fix

The new tests may fail before Prompt 02 removes the generic top card. That is acceptable and expected.

## Commands

Run focused test if available:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccPhase07NoRedundantSharedDashboardHeaderCards
```

If the project’s Vitest filter syntax differs, use the current repo’s working focused-test command.

Then run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
```

## Acceptance Criteria

- New anti-regression test file exists.
- It covers all six shared dashboards.
- It excludes Project Home and Documents.
- It fails or would fail against the current generic top-card regression.
- It does not weaken any Phase 06 tests.
- It does not modify production source.
- It does not change dependencies or lockfile.
