# PCC Phase 07 — Claude Code Opus 4.7 Execution Prompt

## Prompt 02 — Remove Shared Dashboard Header Cards and Update Count Guards

## Required Operating Mode

You are executing inside the `RMF112018/hb-intel` repo as a local code agent using Claude Code with Opus 4.7.

Follow these rules for this prompt:

- Work only inside the repo.
- Do not make broad, unfocused repo scans.
- Do not re-read files that are still within your current context or memory unless you need to verify drift or inspect a specific changed section.
- Prefer targeted file reads and targeted searches.
- Do not install dependencies.
- Do not add `echarts-for-react`.
- Do not mutate tenant systems, Procore, Sage, SharePoint, Microsoft Graph, Azure, the app catalog, or any live external system.
- Do not introduce command-model behavior, approval execution, source-system mutation, sync execution, or autonomous HBI decisioning.
- Do not render developer/internal copy in the UI.
- Preserve Project Home Phase 06 behavior.
- Preserve Document Control’s specialized `PccDocumentsSurface`.
- Keep the bento direct-child invariant intact.
- Keep shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]` ownership intact.
- If repo truth differs from this prompt, stop and report the mismatch rather than forcing stale instructions.

## Current Phase 07 Starting Point

Prompt 01 has been executed and committed.

Required local starting commit posture:

```text
Prompt 01 commit: f555127b94d91f3bcea56b1e4f07f28da5bd7dc4
PCC package posture: 1.0.0.218 / 1.0.0.218
pnpm-lock.yaml md5: 7c19ccfa8718a42f7f55ce178a626996
echarts: present
echarts-for-react: absent
```

Before editing, confirm:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git merge-base --is-ancestor f555127b94d91f3bcea56b1e4f07f28da5bd7dc4 HEAD && echo "Prompt 01 reachable"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

### Branch / WIP guard

Prompt 01 closeout reported unrelated screenshot-remediation WIP in the working tree. GitHub may also show unrelated screenshot-remediation work on another branch/head. This prompt is **not** authorized to merge, rebase, reconcile, stage, or modify that work.

If any of the following files or directories are present as modified/untracked, treat them as operator-owned out-of-scope WIP and do not stage or alter them:

```text
e2e/pcc-live/pcc-live.breakpoint-capture.ts
e2e/pcc-live/pcc-live.screenshot-capture.ts
e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
e2e/pcc-live/pcc-live.screenshot.spec.ts
e2e/pcc-live/pcc-live.screenshot.types.ts
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/test-coverage/wave-4/
```

If the current local HEAD does not contain Prompt 01 commit `f555127b94d91f3bcea56b1e4f07f28da5bd7dc4`, stop and report the branch mismatch. Do not attempt to solve branch divergence inside this prompt.

## Phase 07 Objective

Remove and permanently block the Phase 05 regression where redundant top-level Dashboard/title-description bento cards returned on the six shared primary-dashboard pages:

```text
core-tools
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

Preserve:

```text
project-home
documents
```

## Objective for This Prompt

Remove the redundant shared top-level `Dashboard` bento card from `PccPrimaryDashboardSurface`, relocate the Cost & Time Sage book-of-record cue into the `Module status` card, and update the relevant component tests so the repo is green with the Phase 07 target shared-dashboard card counts.

## Files Allowed to Change

Expected production file:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
```

Expected test files:

```text
apps/project-control-center/src/tests/PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
```

Only if existing failing tests prove they encode pre-Phase-07 card counts/order, update the equivalent current per-surface analytics tests, preserving all analytics assertions:

```text
apps/project-control-center/src/tests/PccEstimatingPreconstructionAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccStartupCloseoutAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccProjectControlsAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccSystemsAdministrationAnalyticsCards.test.tsx
```

Do not edit:

```text
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/analytics/
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/PccBentoGrid.tsx
packages/models/
packages/ui-kit/
apps/project-control-center/config/package-solution.json
apps/project-control-center/package.json
pnpm-lock.yaml
```

If a test failure appears to require editing one of the prohibited areas, stop and report the specific failure rather than broadening scope.

## Required Production Change

In:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
```

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

After this prompt, the first direct bento card for each shared dashboard must be:

```text
Module status
```

### Required cleanup in `PccPrimaryDashboardSurface.tsx`

After removing the generic card:

- Remove the `tab` variable if unused.
- Remove `getPrimaryNavigationTab` from imports if unused.
- Remove `NO_WRITEBACK_POSTURE` if unused.
- Keep `PRIMARY_TAB_POSTURE_NOTE` if used for the Cost & Time cue.
- Keep `Fragment` only if still needed; remove only if cleanly unnecessary.
- Do not perform broad CSS cleanup. CSS classes such as `overviewBody` or `overviewPosture` may remain in the CSS module if unused by this component; do not churn CSS just to remove stale selectors.

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
- The cue must not imply Sage writeback, accounting mutation, sync execution, approval execution, or source-system mutation.

Approved placement:

```tsx
<PccDashboardCard
  footprint="wide"
  hierarchy="standard"
  tier="tier2"
  region="operational"
  eyebrow="Modules"
  title="Module status"
>
  <dl className={styles.moduleStatusList}>...</dl>
  {postureNote ? (
    <p
      className={styles.overviewBookOfRecord}
      data-pcc-dashboard-book-of-record={activePrimaryTabId}
    >
      {postureNote}
    </p>
  ) : null}
</PccDashboardCard>
```

You may keep `styles.overviewBookOfRecord` for the relocated paragraph unless TypeScript/CSS module typing proves otherwise.

## Target Shared-Dashboard Order

After the production change, direct card title order must be:

### Core Tools

```text
1. Module status
2. Select a module
```

### Estimating & Preconstruction

```text
1. Module status
2. Handoff Continuity Preview
3. Estimate Exposure Preview
4. Select a module
```

### Project Startup & Closeout

```text
1. Module status
2. Startup Readiness Completion
3. Responsibility Coverage
4. Closeout & Warranty Readiness
5. Select a module
```

### Project Controls

```text
1. Module status
2. Constraints Aging
3. Permit / Inspection Readiness
4. Risk / Issue Severity Distribution
5. Select a module
```

### Cost & Time

```text
1. Module status
2. Schedule Milestone Posture
3. Procurement / Buyout Exposure
4. Commitment / Cost Exposure Preview
5. Select a module
```

### Systems Administration

```text
1. Module status
2. Integration Health Summary
3. Configuration Severity
4. Procore Mapping / Sync Posture
5. Select a module
```

## Target Direct Card Counts After This Prompt

Update tests to these counts where they currently encode old shared-dashboard counts:

```text
core-tools: 2
estimating-preconstruction: 4
startup-closeout: 5
project-controls: 5
cost-time: 5
systems-administration: 5
```

Do not change Project Home or Documents expected counts/composition in this prompt.

## Required Test Updates

### 1. Prompt 01 anti-regression test

File:

```text
apps/project-control-center/src/tests/PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx
```

Expected after production fix:

- The focused test must pass.
- Do not weaken its duplicate-header-card guard.
- Do not delete the first-card `Module status` guard.
- Do not remove the developer/internal copy guard.
- Only edit this file if needed for a legitimate compile/test issue.

### 2. `PccSurfaceRouter.phase05.test.tsx`

Update old shared-dashboard count expectations and explanatory comments from:

```text
core-tools: 3
estimating-preconstruction: 5
startup-closeout: 6
project-controls: 6
cost-time: 6
systems-administration: 6
```

to:

```text
core-tools: 2
estimating-preconstruction: 4
startup-closeout: 5
project-controls: 5
cost-time: 5
systems-administration: 5
```

Update `CARD_SUMMARY_BY_TAB` / comments so they no longer describe a `hero + Module status + ... + Selected module` sequence. They should describe:

```text
Module status + analytics where applicable + Selected module
```

Do not alter Project Home or Documents routing tests.

Preserve:

- selected-module marker tests;
- HBI advisory/no-decision/no-approval/no-writeback tests;
- launch-only no-writeback tests;
- Approvals & Checkpoints no approve/reject/waive/override test;
- module status row marker tests;
- Cost & Time Sage book-of-record scoped-only test.

### 3. `PccPhase06RegressionCoverage.test.tsx`

Update only the shared primary-dashboard card counts to the Phase 07 target values.

Add or revise a nearby comment explaining:

```text
Phase 07 intentionally removes the Phase 05-regressed generic Dashboard/title-description card from the six shared primary-dashboard surfaces. Project Home fixture/read-model counts remain governed by Phase 06.
```

Preserve:

- Project Home row-sum choreography;
- Project Home gateway button assertions;
- Project Home fixture/read-model counts;
- shell-owned active-panel test;
- no nested card checks;
- no card-level active-panel checks;
- no `Project Intelligence` check;
- developer/TODO rendered-copy guard;
- `echarts-for-react` package/import guard.

### 4. Per-surface analytics tests, if applicable

If focused/full test output identifies old order/count assertions in per-surface analytics tests, update only those expectations to the target order listed above.

Preserve analytics-specific assertions:

- analytics card title;
- chart container exists;
- fallback summary rows exist;
- preview/sample data disclosure;
- source label;
- accessible labels;
- span override assertions, if present.

Do not weaken analytics validation to make the count change pass.

## Preservation Rules

Do not change:

- `renderPrimaryDashboardAnalytics` behavior except for natural ordering shift after card removal.
- analytics view models.
- analytics span overrides.
- Project Home files.
- Document Control files.
- navigation registry.
- `PccDashboardCard` contract.
- `PccBentoGrid` contract.
- ECharts wrapper.
- package manifests.
- dependencies.
- lockfile.
- live Playwright evidence.

## Commands

Run in this order.

### 1. Pre-edit repo snapshot

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git merge-base --is-ancestor f555127b94d91f3bcea56b1e4f07f28da5bd7dc4 HEAD && echo "Prompt 01 reachable"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If Prompt 01 is not reachable from HEAD, stop.

### 2. After source/test edits

Focused Prompt 01 guard must now pass:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccPhase07NoRedundantSharedDashboardHeaderCards
```

Run typecheck:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
```

Run full PCC vitest because this prompt intentionally changes shared-dashboard cardinality:

```bash
pnpm --filter @hbc/spfx-project-control-center test
```

Run Prettier on changed Phase 07 files. Include only files that exist and changed, using this list as the likely set:

```bash
pnpm exec prettier --check \
  apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx \
  apps/project-control-center/src/tests/PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx \
  apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx \
  apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx \
  apps/project-control-center/src/tests/PccEstimatingPreconstructionAnalyticsCards.test.tsx \
  apps/project-control-center/src/tests/PccStartupCloseoutAnalyticsCards.test.tsx \
  apps/project-control-center/src/tests/PccProjectControlsAnalyticsCards.test.tsx \
  apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx \
  apps/project-control-center/src/tests/PccSystemsAdministrationAnalyticsCards.test.tsx
```

If some listed files do not exist or were not changed, run Prettier only on actual changed files.

Final diff/lock checks:

```bash
git diff --check
git diff --stat
git diff --name-only
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Do not run live Playwright in this prompt.

## Expected Diff

Expected changed files usually include:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
```

The Prompt 01 test file may remain unchanged. If edited, explain why.

Per-surface analytics test files should only change if the full PCC vitest suite proves they still encode the old first-card/card-count assumptions.

No other files should be changed.

If out-of-scope WIP files appear in `git diff --name-only`, explicitly classify them as pre-existing operator WIP and do not stage them.

## Acceptance Criteria

Prompt 02 is complete when:

- Generic top-level Dashboard/title-description card is removed from `PccPrimaryDashboardSurface`.
- First direct bento card is `Module status` for all six shared dashboards.
- Prompt 01 anti-regression test passes.
- Sage cue remains visible and scoped only to Cost & Time.
- Existing Cost & Time `[data-pcc-dashboard-book-of-record="cost-time"]` marker is preserved.
- Phase 06 analytics remain present on all applicable shared dashboards.
- Shared-dashboard direct-card counts are updated to `2/4/5/5/5/5`.
- Full PCC vitest passes.
- `check-types` passes.
- Prettier passes on changed files.
- `git diff --check` passes.
- `pnpm-lock.yaml` md5 remains `7c19ccfa8718a42f7f55ce178a626996`.
- `package-solution.json`, `package.json`, and `pnpm-lock.yaml` are unchanged.
- Project Home source is unchanged.
- Document Control source is unchanged.
- Analytics source/view models/span overrides are unchanged unless a test-only expectation update proves necessary.
- No dependencies are installed.
- No live systems are touched.
- No live Playwright evidence is generated.
- No unrelated screenshot-remediation WIP is staged.

## Required Closeout Response

Report:

```text
HB: Phase 07 Prompt 02 Closeout

Verdict:
- Pass / Pass with Issues / Fail / Blocked

Branch / HEAD:
- Branch:
- Starting HEAD:
- Ending HEAD:
- Prompt 01 reachable: yes/no
- Working tree before:
- Working tree after:
- Out-of-scope WIP present: yes/no
- Out-of-scope WIP touched/staged: yes/no

Files changed:
- ...

Production change:
- Generic Dashboard card removed: yes/no
- Module status first on six shared dashboards: yes/no
- Cost & Time Sage cue relocated into Module status: yes/no
- Sage marker preserved: yes/no

Test changes:
- Prompt 01 anti-regression test: pass/fail
- Shared-dashboard counts updated: yes/no
- Per-surface analytics tests changed: yes/no, with reason

Validation:
- check-types:
- focused Prompt 01 test:
- full PCC vitest:
- prettier:
- git diff --check:
- pnpm-lock md5 before:
- pnpm-lock md5 after:

Guardrails:
- Project Home modified: yes/no
- Document Control modified: yes/no
- Analytics source modified: yes/no
- package-solution modified: yes/no
- package.json modified: yes/no
- pnpm-lock modified: yes/no
- Dependencies installed: yes/no
- Live systems touched: yes/no
- Playwright run: yes/no
- Unrelated WIP staged: yes/no

Proceed / Stop:
- Proceed to Prompt 03 only if all validation passes and scope is clean.
```

## Commit Guidance

If the operator authorizes commit after successful execution:

Suggested summary:

```text
fix(pcc): remove redundant shared dashboard header cards
```

Commit description should mention:

- Phase 07 Prompt 02 removes the Phase 05-regressed generic Dashboard/title-description card from `PccPrimaryDashboardSurface`.
- The six shared primary dashboards now begin with `Module status`.
- Cost & Time Sage book-of-record cue was relocated into the Module status card and remains scoped to `cost-time`.
- Shared-dashboard count tests were updated to `2/4/5/5/5/5`.
- Prompt 01 anti-regression guard now passes.
- Project Home and Document Control were preserved.
- Phase 06 analytics were preserved.
- Shell-owned active panel and no nested-card invariants were preserved.
- No dependency, lockfile, package, live-system, or Playwright evidence changes were made.
