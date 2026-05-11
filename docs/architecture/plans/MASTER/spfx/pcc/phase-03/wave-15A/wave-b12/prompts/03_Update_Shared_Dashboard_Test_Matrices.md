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


# Prompt 03 — Update Shared Dashboard Test Matrices

## Objective

Update existing test matrices and shared Phase 06 regression coverage to match Phase 07’s intentional shared-dashboard card-count changes.

## Files to Inspect and Update

Targeted list:

```text
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
apps/project-control-center/src/tests/PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx
```

If test filenames have drifted, search for these stable terms:

```text
EXPECTED_DIRECT_CARD_COUNT_BY_TAB
PHASE_06_PRIMARY_DASHBOARD_CARD_COUNTS
PccPrimaryDashboardSurface
core-tools
systems-administration
```

## Required Count Updates

Update shared-dashboard direct card counts to:

```text
core-tools: 2
estimating-preconstruction: 4
startup-closeout: 5
project-controls: 5
cost-time: 5
systems-administration: 5
```

Do not change Project Home row-sum tests.

Do not change Project Home fixture/read-model counts unless the current tests only use a shared matrix that now needs separation. If shared, separate Project Home/Document Control from the Phase 07 shared-dashboard count map.

## Required Comment Updates

Where comments mention Phase 06 counts, add a concise explanation:

```text
Phase 07 intentionally removes the Phase 05-regressed generic shared Dashboard top card from the six PccPrimaryDashboardSurface tabs. Counts below reflect that removal while preserving Phase 06 analytics and selected-module behavior.
```

## Do Not Weaken

Preserve assertions for:

- zero card-level active panel markers;
- shell-owned active panel marker;
- zero nested cards;
- no `Project Intelligence`;
- no developer/TODO UI copy;
- Project Home row-sum choreography;
- Project Home gateway buttons not anchors;
- `echarts-for-react` absence;
- analytics fallback text outside the chart canvas.

## Commands

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

## Acceptance Criteria

- Full PCC vitest suite passes.
- Updated tests encode Phase 07 count targets.
- Tests explicitly document that shared-dashboard count changes are intentional.
- No production source changes beyond any required Prompt 02 source edits.
- No Project Home behavior changed.
