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


# Prompt 05 — Cost & Time Sage Cue and Source Posture

## Objective

Add or harden tests proving the Cost & Time Sage book-of-record cue survives removal of the generic top-level dashboard card and remains scoped only to `cost-time`.

## Files to Inspect and Update

Likely files:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx
```

## Required Source Posture

`cost-time` must render:

```text
Sage remains the accounting book of record for cost, commitment, and exposure data; PCC does not write back to Sage.
```

The rendered node must have:

```text
data-pcc-dashboard-book-of-record="cost-time"
```

No other shared dashboard may render `[data-pcc-dashboard-book-of-record]`.

## Required Tests

Add assertions that:

1. `cost-time` renders the Sage cue.
2. The cue is inside the `Module status` card or otherwise not inside a generic top-level `Dashboard` card.
3. `core-tools`, `estimating-preconstruction`, `startup-closeout`, `project-controls`, and `systems-administration` do not render the book-of-record marker.
4. The selected-module card remains functional when `activeModuleId` belongs to `cost-time`.
5. Sage cue does not imply writeback or accounting mutation.

## Prohibited Changes

Do not:

- add a new standalone governance card;
- reintroduce the generic Dashboard card;
- add Sage sync/writeback behavior;
- change analytics view models;
- change package version.

## Commands

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- cost-time
pnpm --filter @hbc/spfx-project-control-center test
```

If focused syntax differs, use the current repo style.

## Acceptance Criteria

- Sage cue preserved.
- Sage cue scoped only to `cost-time`.
- No generic Dashboard card returns.
- Full PCC vitest suite passes.
