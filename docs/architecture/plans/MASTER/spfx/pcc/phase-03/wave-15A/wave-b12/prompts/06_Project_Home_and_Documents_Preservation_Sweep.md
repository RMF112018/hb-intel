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


# Prompt 06 — Project Home and Documents Preservation Sweep

## Objective

Verify Phase 07 did not regress Project Home or Document Control while remediating the six shared dashboards.

## Scope

This prompt should be test-focused. Do not change Project Home or Document Control source unless a direct regression caused by Phase 07 is found.

## Files to Inspect

Targeted reads only:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
```

## Project Home Preservation Assertions

Confirm tests still prove:

- Fixture path first twelve card titles remain:

```text
Priority Actions
Site Health Summary
Document Control Center
Action Exposure Mix
Project Health Trend
Project Readiness
Approvals & Checkpoints
Readiness / Approval Rollup
Missing Configurations
External Platforms
Team Snapshot
Recent Activity
```

- Read-model path still renders expected Phase 06 cards.
- Gateway actions remain `<button type="button">`.
- Gateway actions do not render `<a href>`.
- Recent Activity gateway remains disabled with visible reason.
- No `Project Intelligence`.
- Row-sum choreography remains green for applicable modes.

## Document Control Preservation Assertions

Confirm tests still prove or add scoped assertions that:

- `documents` routes to `PccDocumentsSurface`.
- `documents` is not rendered through `PccPrimaryDashboardSurface`.
- Document Control does not receive a generic shared `Dashboard` card.
- Document Control card count remains consistent with current repo truth.
- Source-unavailable state card behavior is preserved.
- Shell-owned active panel remains intact.

## Commands

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

## Acceptance Criteria

- No Project Home source edits unless necessary and justified.
- No Document Control source edits unless necessary and justified.
- Project Home and Documents tests pass.
- Phase 07 shared-dashboard changes remain isolated.
