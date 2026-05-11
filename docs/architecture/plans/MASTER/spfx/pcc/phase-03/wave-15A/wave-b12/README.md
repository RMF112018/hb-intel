# PCC Phase 07 Prompt Package

## Purpose

This package provides the complete execution materials for:

```text
PCC Phase 07 — Cross-Surface Operational Realignment and Phase 05 Remediation
```

Primary objective:

```text
Remove the redundant top-level Dashboard/title-description bento cards that returned
on six shared primary-dashboard pages, preserve Phase 06 analytics, and permanently
block the regression from returning.
```

## Package Contents

```text
00_Phase_07_Implementation_Plan.md
README.md
package_manifest.json

prompts/
  00_Pre_Edit_Repo_Truth_Evidence_Gate.md
  01_Phase_05_Remediation_Anti_Regression_Tests.md
  02_Remove_Shared_Dashboard_Header_Cards.md
  03_Update_Shared_Dashboard_Test_Matrices.md
  04_Per_Surface_Analytics_Order_and_Count_Updates.md
  05_Cost_Time_Sage_Cue_and_Source_Posture.md
  06_Project_Home_and_Documents_Preservation_Sweep.md
  07_Static_Guards_Accessibility_and_No_False_Affordance.md
  08_Focused_Live_Playwright_Evidence_Optional.md
  09_Closeout_Report_and_Commit_Guidance.md

auditor/
  Fresh_Session_Auditor_Prompt_Phase_07.md
```

## Execution Order

Use the prompts in numeric order.

| Prompt | Purpose | Expected Change Type |
|---|---|---|
| 00 | Pre-edit repo-truth and Phase 06 evidence gate | No source changes |
| 01 | Add anti-regression tests for duplicate shared dashboard top cards | Test-only |
| 02 | Remove generic shared Dashboard card and relocate Cost & Time Sage cue | Source |
| 03 | Update shared dashboard card-count matrices | Test |
| 04 | Update per-surface analytics order/count assertions | Test |
| 05 | Harden Cost & Time Sage cue tests | Source/test if needed |
| 06 | Project Home and Documents preservation sweep | Test-focused |
| 07 | Static guards, accessibility, and false-affordance coverage | Test-focused |
| 08 | Optional focused live Playwright evidence | E2E/evidence only if authorized |
| 09 | Closeout report and commit guidance | Documentation/reporting |

## Current Baseline

```text
PCC package posture: 1.0.0.218 / 1.0.0.218
pnpm-lock.yaml md5: 7c19ccfa8718a42f7f55ce178a626996
Phase 06 evidence commits:
  4c772ac3c8e48c46bb5f5bdb108fb53b1b51bb7a
  e6886489bb4f85d32840f69914dfb3b615f28aaf
```

## Affected Surfaces

Phase 07 remediation applies to these six shared primary-dashboard pages:

```text
core-tools
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

Do not apply the shared-dashboard remediation to:

```text
project-home
documents
```

## Final Target Card Counts

| Surface | Phase 07 target direct-card count |
|---|---:|
| `core-tools` | 2 |
| `estimating-preconstruction` | 4 |
| `startup-closeout` | 5 |
| `project-controls` | 5 |
| `cost-time` | 5 |
| `systems-administration` | 5 |

Project Home and Documents remain governed by their current specialized surfaces and tests.

## Required Final First Card

For all six affected shared dashboards, the first direct bento card must be:

```text
Module status
```

## Explicitly Prohibited Regression

The following shared-dashboard first-card pattern must not return:

```tsx
<PccDashboardCard
  footprint="hero"
  hierarchy="primary"
  tier="tier1"
  region="command"
  eyebrow="Dashboard"
  title={tab.dashboardTitle}
>
  <p>{tab.dashboardDescription}</p>
</PccDashboardCard>
```

Tests must fail if this pattern is reintroduced.

## Dependency Rules

Do not install dependencies.

Do not add:

```text
echarts-for-react
```

Expected lockfile md5 remains:

```text
7c19ccfa8718a42f7f55ce178a626996
```

## Versioning Rule

Default Phase 07 code/test remediation does not bump the SPFx package version.

Only bump from `1.0.0.218` to `1.0.0.219` if the operator explicitly authorizes tenant package generation / deployment / live validation against a newly deployed package.

## Required Validation

Minimum local validation:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Optional focused live validation is contained in Prompt 08.

## How to Use with Claude Code Opus 4.7

For each prompt:

1. Open a fresh Claude Code task or continue only if the agent still has accurate context.
2. Paste the prompt as-is.
3. Require the agent to run the requested preflight checks.
4. Review the plan before allowing edits if the prompt asks for a plan first.
5. After execution, ask the agent for the closeout output required by the prompt.
6. Do not advance to the next prompt until the previous prompt is clean or intentionally deferred.

## Auditor Prompt

Use:

```text
auditor/Fresh_Session_Auditor_Prompt_Phase_07.md
```

in a fresh ChatGPT session when you want an independent planning/implementation auditor to review:

- local agent plan;
- following-execution report;
- diffs;
- tests;
- validation output;
- Playwright evidence;
- closeout claim;
- commit summary/description.

## Important Preservation Rules

Phase 07 must preserve:

- Project Home Phase 06 card choreography.
- Project Home gateway actions as buttons, not anchors.
- Project Home `Project Intelligence` removal.
- Direct ECharts analytics implementation.
- All Phase 06 analytics cards.
- Document Control specialized surface.
- Shell-owned active surface panel marker.
- No nested cards.
- No card-level active-panel markers.
- Read-only/preview/no-writeback posture.

## Commit Guidance

Recommended summary:

```text
fix(pcc): remove redundant shared dashboard header cards
```

Recommended description should mention:

- Phase 05 remediation completed during Phase 07.
- Generic shared `Dashboard` bento card removed.
- First card is now `Module status` on affected shared dashboards.
- Cost & Time Sage cue preserved.
- Phase 06 analytics preserved.
- Project Home and Document Control preserved.
- Tests block reintroduction.
- No dependency or lockfile change.
- No command-model behavior or live writeback.
