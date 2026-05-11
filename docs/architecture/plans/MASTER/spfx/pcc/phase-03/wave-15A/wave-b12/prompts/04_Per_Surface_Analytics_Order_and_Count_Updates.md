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


# Prompt 04 — Per-Surface Analytics Order and Count Updates

## Objective

Update all per-surface analytics tests so they match the Phase 07 direct-card order after the duplicate shared-dashboard top card is removed.

## Files to Inspect and Update

Likely files:

```text
apps/project-control-center/src/tests/PccEstimatingPreconstructionAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccStartupCloseoutAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccProjectControlsAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccSystemsAdministrationAnalyticsCards.test.tsx
```

If a file is missing or renamed, search only for the analytics card title and update the current equivalent test.

## Required Target Orders

### Estimating & Preconstruction

```text
Module status
Handoff Continuity Preview
Estimate Exposure Preview
Select a module
```

### Project Startup & Closeout

```text
Module status
Startup Readiness Completion
Responsibility Coverage
Closeout & Warranty Readiness
Select a module
```

### Project Controls

```text
Module status
Constraints Aging
Permit / Inspection Readiness
Risk / Issue Severity Distribution
Select a module
```

### Cost & Time

```text
Module status
Schedule Milestone Posture
Procurement / Buyout Exposure
Commitment / Cost Exposure Preview
Select a module
```

### Systems Administration

```text
Module status
Integration Health Summary
Configuration Severity
Procore Mapping / Sync Posture
Select a module
```

## Required Assertions to Preserve

For each analytics card, continue to assert:

- `[data-pcc-analytics-card]` marker;
- `[data-pcc-analytics-chart]` marker;
- preview state label;
- sample-data explanation;
- deterministic source label;
- summary rows outside chart canvas;
- span override behavior;
- tablet fallback behavior if currently tested;
- no `echarts-for-react`;
- no `Project Intelligence`;
- no card-level active panel marker;
- no nested cards.

## Required Count Changes

```text
estimating-preconstruction: 4
startup-closeout: 5
project-controls: 5
cost-time: 5
systems-administration: 5
```

Core Tools has no analytics and is covered elsewhere.

## Commands

Run focused tests for each changed file if feasible, then the full suite:

```bash
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center check-types
```

## Acceptance Criteria

- All per-surface analytics tests reflect the Phase 07 card order.
- All Phase 06 analytics cards remain covered.
- No analytics implementation source is changed unless a test reveals an actual source defect.
- Full PCC vitest suite passes.
