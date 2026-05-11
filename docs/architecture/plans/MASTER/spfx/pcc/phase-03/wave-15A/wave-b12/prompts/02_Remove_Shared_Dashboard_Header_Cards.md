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


# Prompt 02 — Remove Shared Dashboard Header Cards

## Objective

Remove the redundant shared top-level `Dashboard` bento card from `PccPrimaryDashboardSurface` and relocate the Cost & Time Sage cue to the `Module status` card.

## Source File

Edit only as needed:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
```

## Required Production Change

Remove the first generic card that currently resembles:

```tsx
<PccDashboardCard
  footprint="hero"
  hierarchy="primary"
  tier="tier1"
  region="command"
  eyebrow="Dashboard"
  title={tab.dashboardTitle}
>
  <p className={styles.overviewBody}>{tab.dashboardDescription}</p>
  <p className={styles.overviewPosture}>{NO_WRITEBACK_POSTURE}</p>
  ...
</PccDashboardCard>
```

After this prompt, shared dashboard order must begin with:

```text
Module status
```

## Cost & Time Sage Cue Relocation

Move the existing `PRIMARY_TAB_POSTURE_NOTE['cost-time']` rendering into the `Module status` card after the module `<dl>` list.

Required behavior:

- `cost-time` still renders the exact Sage cue:

```text
Sage remains the accounting book of record for cost, commitment, and exposure data; PCC does not write back to Sage.
```

- The cue keeps the marker:

```tsx
data-pcc-dashboard-book-of-record={activePrimaryTabId}
```

- No other tab renders `[data-pcc-dashboard-book-of-record]`.

## Cleanup

After deleting the generic card:

- Remove unused `tab` variable if it is no longer required.
- Remove unused `getPrimaryNavigationTab` import if no longer required.
- Remove unused `NO_WRITEBACK_POSTURE` constant if no longer required.
- Remove unused CSS classes only if they become completely unused and tests remain green.

Do not perform broad CSS cleanup.

## Preservation Rules

Do not change:

- `renderPrimaryDashboardAnalytics` behavior except for ordering naturally shifting up after card removal.
- Analytics view models.
- Analytics span overrides.
- Project Home files.
- Document Control files.
- navigation registry.
- `PccDashboardCard` contract.
- ECharts wrapper.
- package manifests.
- dependencies.

## Target Direct Card Counts After This Prompt

```text
core-tools: 2
estimating-preconstruction: 4
startup-closeout: 5
project-controls: 5
cost-time: 5
systems-administration: 5
```

Do not assert Project Home or Documents in this prompt.

## Commands

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccPhase07NoRedundantSharedDashboardHeaderCards
```

If focused filter syntax differs, use the repo’s current Vitest command style.

## Acceptance Criteria

- Generic top-level Dashboard card is removed.
- First direct bento card is `Module status` for all six shared dashboards.
- Sage cue remains visible and scoped to Cost & Time.
- No analytics disappear.
- No Project Home source changes.
- No Document Control source changes.
- No dependency or lockfile change.
