# Prompt 03 — Priority Actions Command Rail Compression (Updated)

## Role

You are the local code agent working in the `hb-intel` repository. You are implementing Wave 15A B6 Prompt 03 for the PCC SPFx Project Home flagship remediation.

This prompt replaces the earlier Prompt 03 draft. It incorporates the Prompt 01 audit baseline, Prompt 02 implementation state, and the auditor-required Prompt 02 source-label correction gate.

## Execution Gate — Do Not Start Product Changes Until Confirmed

Before planning or editing product code, confirm the following:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

### Required current-state gates

1. `HEAD` must include the Prompt 01 package commit:

```text
6b0eb6089b04e845554e9d23e6f0613cfe782ec9
```

2. `HEAD` must include the Prompt 02 implementation commit:

```text
2828a242b843729db1c4bb80f1aca8956a6508a9
```

3. Prompt 02 corrective follow-up must already be landed and reviewed before this prompt executes. Specifically:

- `apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.ts`
- `readModelSourceLabel('available')`

must **not** render:

```text
Source: live system feeds
```

The accepted label is:

```text
Source: PCC read-model available
```

or an equally bounded read-model label that does not use the word `live`.

If the Prompt 02 correction has not landed, **stop and report**. Do not execute Prompt 03.

4. `pnpm-lock.yaml` MD5 must remain:

```text
00570e10e3dc9015188ba503ea996943
```

5. Working tree must be clean except for user-approved in-progress files. Do not touch unrelated dirty files.

## Non-Negotiable Instructions

- Do not re-read files still within your current context or memory unless you need to verify stale, missing, contradictory, or newly changed repo truth.
- Use the canonical scorecard path:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
```

- Do not reference the old `_v2` scorecard filename.
- Preserve Project Home two-path contract:
  - fixture-only path remains deterministic and no-read-model;
  - read-model-driven path remains opt-in through `readModelClient`.
- Preserve bento direct-child behavior:
  - every rendered `[data-pcc-card]` must have `parentElement === [data-pcc-bento-grid]`;
  - do not add wrapper elements between Project Home and the bento grid;
  - do not nest `PccDashboardCard`.
- Do not introduce live writes, uploads, syncs, approvals, deletes, saves, external launches, or mutation side effects.
- Keep HBI advisory and non-mutating.
- Keep Procore/Sage/SharePoint/PCC source-of-record boundaries explicit.
- Do not edit:
  - `package.json`;
  - `pnpm-lock.yaml`;
  - package-solution files;
  - manifests;
  - SPFx packaging files;
  - shared primitives (`PccBentoGrid`, `PccDashboardCard`, `footprints.ts`);
  - shell tabs or shell hero primitives;
  - global token sheets;
  - blueprint/planning docs.
- Prefer Project Home-local source, CSS, view-model, adapter, and test changes.
- Stage explicit files only. Never use `git add -A`.
- Do not use `--no-verify`.

## Objective

Convert the Project Home Priority Actions card from a fully expanded multi-lane rail into a compact homepage command rail that surfaces the highest-value actions without dominating mobile and first-fold page height.

The baseline evidence recorded Priority Actions at approximately:

```text
phone-390 Priority Actions card height: 2573 px
```

This prompt must materially reduce first-scan density while preserving source-owned, read-only, no-execution semantics.

## Current Repo-Truth Baseline

Current files and behavior to preserve unless this prompt explicitly changes them:

```text
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.module.css
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailViewModel.ts
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
```

Important current behavior:

- `buildPccPriorityActionsRailViewModel(actions)` currently groups actions into four canonical groups.
- Suppressed categories remain `documents`, `health`, and `safety`; suppressed items are accounted for by `suppressedCount` and are not exposed through visible groups.
- Current sort semantics are:
  1. tone rank (`high`, then `medium`, then `low`);
  2. due date;
  3. id.
- Current rail renders all visible items across all groups. Existing fixture expectation is 15 visible rows.
- `PccPriorityActionsRail` currently renders only spans/sections/lists; no anchors, hrefs, or buttons.
- Per-row affordance currently says `Reference`.
- Prompt 02 added a Project Intelligence posture row; do not alter it except if a test import requires a safe update.

## Implementation Requirements

### 1. Add a compact command-rail mode without breaking the existing full view-model

Implement compact behavior using Project Home-local view-model fields and rendering logic.

Preferred shape:

- extend `IPccPriorityActionsRailViewModel` with a compact summary object, or add a derived compact helper;
- keep full grouped items available internally for accounting;
- expose compact/default display rows separately from full grouped totals;
- preserve the existing adapter’s deterministic sort semantics.

Suggested model additions:

```ts
interface IPccPriorityActionsRailCompactSummary {
  readonly maxVisibleItems: number;
  readonly visibleItems: readonly IPccPriorityRailItem[];
  readonly hiddenCount: number;
  readonly hiddenByGroup: readonly {
    readonly groupId: PccPriorityRailGroupId;
    readonly displayName: string;
    readonly hiddenCount: number;
  }[];
  readonly suppressedCount: number;
  readonly totalCandidateCount: number;
}
```

Accept equivalent naming if simpler, but the model must support tests for:

- visible row count;
- hidden/remaining count;
- hidden-by-group/category summary;
- suppressed count still tracked;
- no fixture mutation.

### 2. Compact default display target

Default Project Home rendering must show:

```text
<= 7 visible priority rows
```

Recommended default:

```text
5 visible rows
```

Use `7` only if the existing data distribution makes 5 materially less useful.

Do not implement viewport-specific logic unless it is simple, deterministic, and testable without relying on browser-only measurement.

### 3. Selection and sorting rules

Visible compact rows must be selected from the existing visible rail items using deterministic priority:

1. `tone === 'high'`;
2. valid earliest due date;
3. stable id tie-break;
4. existing group/category semantics.

Do not invent a `critical` tone or mutate `IPriorityAction`.

Do not surface suppressed categories (`documents`, `health`, `safety`) as rows in the compact default rail.

### 4. Overflow / remaining summary

When hidden actions exist, render a compact summary that explains what is not shown.

Required visible copy concepts:

```text
Remaining reference items: N
```

and group-level hidden counts where available, such as:

```text
Readiness Blockers: 4 hidden
Approval / Checkpoint Prompts: 2 hidden
```

The exact copy may be tightened, but it must:

- avoid implying workflow execution;
- avoid “open,” “launch,” “submit,” “approve,” “complete,” “sync,” “save,” or “send” as action verbs;
- make clear this is reference/display-only summary.

### 5. Full detail preservation

Use one of these patterns.

#### Preferred pattern — local preview-only expansion

Add a local display-only expand/collapse control inside `PccPriorityActionsRail`.

Required constraints:

- label must be display-only and avoid source-system action language;
- acceptable labels:
  - `Show additional reference items`;
  - `Show fewer reference items`;
- this button is allowed only because it changes local display state;
- it must not imply source workflow execution;
- it must not navigate, save, sync, submit, approve, or update records;
- it must be keyboard accessible;
- it must include test coverage that it expands/collapses rows locally only.

#### Acceptable pattern — compact summary only

Keep Project Home compact with no expansion and rely on deeper module cards/surfaces for detail.

If this option is selected:

- do not add buttons;
- render the compact summary and counts only;
- document in closeout why expansion was deferred.

### 6. Preserve no-execution posture

Priority rows must not introduce:

- anchors;
- hrefs;
- source-system launch links;
- workflow execution buttons;
- `onClick` handlers except a local expand/collapse handler, if the preferred pattern is selected;
- upload/sync/approve/submit/save/complete labels;
- silent no-op buttons.

Allowed:

- inert spans for row posture;
- a single local expand/collapse button if clearly display-only and tested.

### 7. Improve row affordance copy

Replace the vague per-row `Reference` affordance with safer source-boundary copy.

Preferred copy:

```text
Source-owned
```

Acceptable alternatives:

```text
Reference only
Source-owned reference
```

Do not use:

```text
Open
Open in source system
Launch
Act
Submit
Approve
Complete
Sync
Save
```

If an expansion button is added, the per-row affordance must remain inert and non-clickable.

### 8. Preserve row content quality

Each visible row should continue to show available row metadata:

- priority;
- title;
- summary if present;
- due date if present;
- assignee persona if present;
- related work center if present;
- category/source module label if present;
- source-owned/reference-only posture.

Keep visible priority text, not color-only tone.

### 9. Do not change card order

Prompt 03 must not reorder Project Home cards. Prompt 04 owns card-order changes.

Do not update `PccProjectHome.tsx` or `PccProjectHomeReadModelContent.tsx` unless there is a strictly necessary prop-level rail-mode addition. If a prop-level change is required, it must preserve current card order and the two-path contract.

### 10. Avoid documentation edits

Do not update blueprint, planning, scorecard, or evidence docs in Prompt 03. Capture implementation notes in the commit message and closeout response only.

## Expected File Changes

Likely files:

```text
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.module.css
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailViewModel.ts
apps/project-control-center/src/tests/PccProjectHome.test.tsx
```

Possible files if needed:

```text
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.test.ts
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
```

Do not modify other files unless a typed/test blocker requires it and you explain the blocker in closeout.

## Test Requirements

Add or update tests for all of the following.

### View-model / adapter tests

Cover:

- compact visible row count is `<= 7`;
- compact visible rows are selected using existing tone/due-date/id sort semantics;
- hidden count equals total non-suppressed visible candidates minus compact visible count;
- hidden-by-group summary is correct;
- suppressed categories remain suppressed and accounted for only in `suppressedCount`;
- input action arrays and action objects are not mutated;
- no `critical` tone or invented fields are introduced.

### Component / Project Home tests

Cover:

- Project Home fixture path renders compact rail by default;
- default visible row count is `<= 7`;
- overflow/remaining summary appears when hidden rows exist;
- per-row affordance copy is source-owned/reference-only, not vague `Reference`;
- no anchors, hrefs, or workflow execution buttons in the Priority Actions rail;
- if local expansion is added:
  - the expand/collapse control is the only button in the rail;
  - it is labeled `Show additional reference items` / `Show fewer reference items`;
  - clicking expands all or additional rows locally;
  - clicking again restores compact state;
  - no navigation, href, or source-system action occurs;
- read-model path still renders Project Home successfully;
- direct-child bento invariant still holds.

### Tests that must be updated from old baseline

The old assertion:

```text
Priority Actions rail renders 15 visible rows from SAMPLE_PRIORITY_ACTIONS
```

must be replaced with compact-default assertions.

Do not preserve the old 15-row assertion by adding hidden DOM rows. The DOM must actually render fewer rows in compact default mode.

## Validation Sequence

Run validation in this order.

### Pre-edit hygiene

```bash
git status --short
git branch --show-current
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

### Prompt 02 correction gate

Confirm no source-label regression remains:

```bash
grep -R "Source: live system feeds" apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.ts
```

Expected result: no matches.

If there is a match, stop and report. Do not execute Prompt 03.

### Type and targeted unit tests

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts priorityActionsRail )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectHome )
```

### Related guard tests

```bash
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectHome.composition )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccApp.optIn )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccCardTierContract )
```

### Targeted Prettier check

Run Prettier only against changed files. Example list:

```bash
pnpm exec prettier --check \
  apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx \
  apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx \
  apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.module.css \
  apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts \
  apps/project-control-center/src/surfaces/projectHome/priorityActionsRailViewModel.ts \
  apps/project-control-center/src/tests/PccProjectHome.test.tsx
```

If a dedicated adapter/component test is added, include it in the Prettier check.

If `--check` fails, run `--write` against the same narrow file list only, then rerun the relevant tests.

### Diff and lockfile hygiene

```bash
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

### Optional broader validation

Run only if the touched files suggest broader impact:

```bash
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts )
```

Do not run hosted Playwright in this prompt unless explicitly authorized. Record hosted/tenant proof as OPERATOR-PENDING.

## Commit Requirements

Stage explicit files only.

```bash
git add \
  apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx \
  apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx \
  apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.module.css \
  apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts \
  apps/project-control-center/src/surfaces/projectHome/priorityActionsRailViewModel.ts \
  apps/project-control-center/src/tests/PccProjectHome.test.tsx
```

Add any new test files explicitly if created.

Do not stage unrelated files.

Suggested subject:

```text
feat(pcc/project-home): compact priority actions command rail (Wave 15A wave-b6 Prompt 03)
```

Commit body must include:

- implementation summary;
- compact row count target and actual default visible count;
- overflow summary behavior;
- no-execution posture;
- files changed;
- validation run and result;
- no package/lockfile/manifest/shared primitive changes;
- lockfile MD5 unchanged at `00570e10e3dc9015188ba503ea996943`;
- hosted/tenant proof remains OPERATOR-PENDING.

## Closeout Response

Return this exact structure:

```text
Files changed:
Repo-truth confirmed:
Implementation summary:
Compact rail behavior:
Tests run:
Validation results:
Lockfile/package/manifest status:
No-execution/source-boundary status:
Known residual risks:
Commit:
```

## Residual Risks to Preserve in Closeout

- Hosted/tenant Playwright proof remains OPERATOR-PENDING.
- Actual measured phone-height reduction is not proven until the evidence suite is rerun.
- Prompt 04 still owns Project Home card reordering.
- Prompt 07 still owns screenshot-depth and accessibility evidence closeout.
