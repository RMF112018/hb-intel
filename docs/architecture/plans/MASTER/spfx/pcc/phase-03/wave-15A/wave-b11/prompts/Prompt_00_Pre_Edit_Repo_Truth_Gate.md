# Prompt 00 — Pre-Edit Repo-Truth Gate — Updated

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

This prompt is a **read-only repo-truth gate**. Your job is to verify the exact implementation baseline before any runtime, test, package, dependency, or documentation edits occur.

## Known Phase 5 Closeout Baseline

The user states that Phase 5 closeout is complete and pushed as:

```text
d06d614a02f16123d8c8252f71cebc22f348bc51
```

Known closeout posture from that commit:

```text
SPFx solution version: 1.0.0.215
SPFx feature version: 1.0.0.215
Phase 5 primary tabs:
  project-home
  core-tools
  documents
  estimating-preconstruction
  startup-closeout
  project-controls
  cost-time
  systems-administration
Expected package target for Phase 06 implementation closeout: 1.0.0.216
Known Phase 5 lockfile md5 from closeout report: 00570e10e3dc9015188ba503ea996943
```

Your first gate is to confirm the local branch contains this Phase 5 closeout commit or is intentionally positioned on it.

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git merge-base --is-ancestor d06d614a02f16123d8c8252f71cebc22f348bc51 HEAD && echo "phase-5-closeout-present" || echo "phase-5-closeout-missing"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If `phase-5-closeout-missing` is printed, **stop** and report the mismatch. Do not edit files.

## Objective

Establish repo truth, confirm the Phase 06 baseline, verify dependency/version state, identify Phase 06 implementation gaps, and produce a concise implementation-readiness report.

Do not make runtime code changes.

## Global Instructions

- Do not re-read files that are still within your current context or memory unless they have changed, your context is stale, or validation requires it.
- Do not install dependencies.
- Do not add `echarts-for-react`.
- Do not run broad repo scans when targeted reads and targeted `git grep` checks are sufficient.
- Do not introduce live integrations, writeback, approval execution, source mutation, URL routing, SharePoint mutation, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Preserve every bento card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense` as the primary layout fix.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only.
- Treat this as a gate. The correct outcome may be “ready,” “ready with noted prerequisite,” or “blocked.”

## Scope

Read-only.

Allowed operations:

- targeted file reads;
- targeted `git grep` checks;
- package/version/dependency inspection;
- read-only baseline report generation in the chat response.

Prohibited operations:

- file edits;
- dependency installation;
- package/lockfile modifications;
- test or evidence artifact generation;
- Playwright runs;
- version bumping;
- staging or committing.

## Authority and Staleness Rules

Some older PCC design documents may preserve legacy surface terminology for historical context. For this Prompt 00 baseline, use this authority order when facts conflict:

1. Current source at `HEAD`.
2. Phase 5 closeout commit `d06d614a02f16123d8c8252f71cebc22f348bc51`.
3. `packages/models/src/pcc/PccPrimaryNavigation.ts` for current Phase 5 primary-tab and module registry truth.
4. Current shell/layout source for marker and bento ownership truth.
5. Basis-of-design and architecture documents for product intent, not for overriding current registry source truth when stale.

Do not “fix” stale documentation in Prompt 00. Report it as an implementation awareness item only.

## Required Repo-Truth Checks

### 1. Branch, HEAD, and working tree

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git merge-base --is-ancestor d06d614a02f16123d8c8252f71cebc22f348bc51 HEAD && echo "phase-5-closeout-present" || echo "phase-5-closeout-missing"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Report whether the working tree is clean or dirty. If dirty, categorize changes as:

```text
tracked
untracked
package/dependency
prompt/documentation
runtime source
test/evidence
unknown
```

Do not clean, revert, stage, or modify anything.

### 2. Dependency state

Inspect:

```text
apps/project-control-center/package.json
pnpm-lock.yaml
```

Confirm:

- whether `echarts` is already installed under `@hbc/spfx-project-control-center`;
- whether `echarts-for-react` is absent;
- whether any unexpected charting dependency exists;
- current lockfile md5.

Suggested targeted commands:

```bash
node -e "const p=require('./apps/project-control-center/package.json'); console.log(JSON.stringify({dependencies:p.dependencies, devDependencies:p.devDependencies}, null, 2))"
git grep -n "echarts-for-react" -- apps pnpm-lock.yaml package.json pnpm-workspace.yaml || true
git grep -n ""echarts"" -- apps/project-control-center/package.json pnpm-lock.yaml || true
```

Dependency rule:

- The local agent must not install dependencies.
- If `echarts` is missing, report that the user must run:

```bash
pnpm --filter @hbc/spfx-project-control-center add echarts
```

Recommended timing:

- Preferred: before Prompt 00, so this baseline includes the intended dependency state.
- Acceptable: after Prompt 00 and before Prompt 03.
- If installed after Prompt 00, Prompt 03 must treat `apps/project-control-center/package.json` and `pnpm-lock.yaml` deltas as user-owned dependency changes and preserve them.

### 3. SPFx package/version state

Inspect:

```text
apps/project-control-center/config/package-solution.json
```

Confirm:

- solution version;
- feature version;
- whether both remain `1.0.0.215`;
- whether Phase 06 implementation should later bump both to `1.0.0.216`.

Do not bump versions in Prompt 00.

### 4. Current source files to inspect

Read these files only as needed to answer the checks below:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_Project_Control_Center_Basis_of_Design_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
apps/project-control-center/config/package-solution.json
apps/project-control-center/package.json
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccBentoGrid.module.css
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
packages/models/src/pcc/PccPrimaryNavigation.ts
```

If a listed file has moved or no longer exists, report the exact path and continue with the closest current source of truth. Do not invent replacements.

### 5. Current Phase 5 navigation truth

From `packages/models/src/pcc/PccPrimaryNavigation.ts`, report:

- current primary tab IDs;
- current primary tab labels;
- current module IDs grouped under each primary tab;
- which modules are selectable vs disabled/deferred;
- whether the package’s planned analytics-card prompts still map to existing primary tabs.

Expected Phase 5 primary tabs unless repo truth proves otherwise:

```text
project-home
core-tools
documents
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

### 6. Current layout/card truth

From `PccDashboardCard.tsx`, `PccBentoGrid.tsx`, `PccBentoGrid.module.css`, and `footprints.ts`, confirm:

- whether `PccDashboardCard` currently lacks `spanOverrides`;
- how `data-pcc-column-span` is currently resolved;
- whether responsive modes are the 8-mode footprint contract;
- whether global footprint defaults are present;
- whether `grid-auto-flow: dense` is absent;
- whether the bento direct-child invariant is still assumed;
- whether `dataActiveSurfacePanel` remains as a legacy prop and must not be used for new surface-panel ownership.

Use a targeted grep:

```bash
git grep -n "grid-auto-flow" -- apps/project-control-center/src/layout apps/project-control-center/src/surfaces || true
git grep -n "dataActiveSurfacePanel\|data-pcc-active-surface-panel" -- apps/project-control-center/src || true
```

### 7. Current shell active-panel ownership

From `PccShell.tsx` and targeted grep, confirm:

- `main[role="tabpanel"]` owns `data-pcc-active-surface-panel`;
- bento cards are not required to own the active panel marker;
- no Phase 06 prompt should reintroduce card-level active-panel marker ownership.

### 8. Current Project Home composition truth

Inspect both render paths:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
```

Report current order for:

- fixture/no-client path;
- read-model/client path.

Compare each against Phase 06 target order:

```text
1. Priority Actions
2. Site Health Summary
3. Document Control Center
4. Project Readiness
5. Approvals & Checkpoints
6. Missing Configurations
7. External Platforms
8. Team Snapshot
9. Recent Activity
```

Also report whether the read-model path currently includes lifecycle/HBI/Procore content above External Platforms, Team Snapshot, or Recent Activity. If so, flag this as a Phase 06 choreography gap to handle in Prompt 02.

### 9. Project Intelligence absence

Confirm that Project Home does not render `Project Intelligence` as a bento card.

Use a targeted grep:

```bash
git grep -n "Project Intelligence\|PccProjectIntelligence" -- apps/project-control-center/src/surfaces/projectHome apps/project-control-center/src/tests || true
```

Report matches as either:

- historical/test-only acceptable;
- runtime Project Home render risk;
- unrelated.

### 10. Analytics and dashboard-composition absence/presence

Confirm whether these exist:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
apps/project-control-center/src/analytics/
```

Use:

```bash
test -f apps/project-control-center/src/layout/pccDashboardComposition.ts && echo "composition-present" || echo "composition-missing"
test -d apps/project-control-center/src/analytics && echo "analytics-dir-present" || echo "analytics-dir-missing"
```

Expected baseline before Phase 06 implementation:

```text
composition-missing
analytics-dir-missing
```

If present, inspect and report whether they are pre-existing work, partial Phase 06 implementation, or unrelated.

### 11. Primary dashboard surface truth

Inspect:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
```

Report:

- current card count and card purposes;
- whether it still renders a generic dashboard/overview card;
- where analytics cards will need to be inserted in later prompts;
- whether any visible copy appears developer/internal.

Do not edit it in Prompt 00.

## Required Readiness Report

Return this exact structure:

```text
HB: Phase 06 Prompt 00 Repo-Truth Gate

Verdict:
- Ready / Ready with prerequisite / Blocked

Baseline:
- Branch:
- HEAD:
- Phase 5 closeout present:
- Working tree:
- pnpm-lock md5:
- SPFx solution version:
- SPFx feature version:

Dependency State:
- echarts:
- echarts-for-react:
- User dependency action required before Prompt 03:
- Package/lockfile caution:

Repo Truth Confirmed:
- Current primary tabs:
- Shell active-panel ownership:
- PccDashboardCard span override state:
- grid-auto-flow dense state:
- Project Intelligence bento state:
- Analytics foundation state:
- Composition helper state:

Project Home Current Order:
- Fixture path:
- Read-model path:
- Target mismatch summary:

Phase 06 Gaps To Implement:
- Prompt 01:
- Prompt 02:
- Prompt 03:
- Prompt 04-11:
- Prompt 12:
- Prompt 13:
- Prompt 14:

Risks / Watch Items:
- ...

Files Inspected:
- ...

Commands Run:
- ...

Next Instruction:
- State whether to proceed to Prompt 01, stop for dependency install, or stop for baseline remediation.
```

## Non-Goals

- Do not implement span overrides.
- Do not implement dashboard composition helpers.
- Do not implement analytics.
- Do not edit code.
- Do not install dependencies.
- Do not bump SPFx version.
- Do not run Playwright.
- Do not generate evidence artifacts.
- Do not stage or commit changes.

## Validation for Prompt 00

Prompt 00 is read-only. Required validation is limited to:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git merge-base --is-ancestor d06d614a02f16123d8c8252f71cebc22f348bc51 HEAD && echo "phase-5-closeout-present" || echo "phase-5-closeout-missing"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Optional targeted checks are allowed only where needed:

```bash
git grep -n "echarts-for-react" -- apps pnpm-lock.yaml package.json pnpm-workspace.yaml || true
git grep -n ""echarts"" -- apps/project-control-center/package.json pnpm-lock.yaml || true
git grep -n "grid-auto-flow" -- apps/project-control-center/src/layout apps/project-control-center/src/surfaces || true
git grep -n "dataActiveSurfacePanel\|data-pcc-active-surface-panel" -- apps/project-control-center/src || true
git grep -n "Project Intelligence\|PccProjectIntelligence" -- apps/project-control-center/src/surfaces/projectHome apps/project-control-center/src/tests || true
test -f apps/project-control-center/src/layout/pccDashboardComposition.ts && echo "composition-present" || echo "composition-missing"
test -d apps/project-control-center/src/analytics && echo "analytics-dir-present" || echo "analytics-dir-missing"
```

Do not run the full component suite, typecheck suite, prettier, `git diff --check`, or Playwright in Prompt 00 unless the user explicitly asks for a heavier pre-edit validation pass.

## Closeout Report for Prompt 00

Report:

- no files changed;
- no dependency/package/lockfile changes made by the agent;
- no SPFx solution/feature version changes made;
- whether `echarts` is already installed or user action is required before Prompt 03;
- whether `echarts-for-react` remains absent;
- whether Phase 06 prompts are aligned to the actual current source;
- risks or follow-up items to carry into Prompt 01.
