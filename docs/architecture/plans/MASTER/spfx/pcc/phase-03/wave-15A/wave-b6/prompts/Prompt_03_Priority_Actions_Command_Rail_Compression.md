# Prompt 03 — Priority Actions Command Rail Compression

## Role

You are the local code agent working in the `hb-intel` repository. You are implementing a controlled Project Home flagship remediation for the PCC SPFx application.

## Non-negotiable agent instructions

- Do not re-read files that are still within your current context or memory. Only re-open a file when you need to verify stale, missing, contradictory, or newly changed repo truth.
- Start with `git status --short` and `git branch --show-current`; do not touch unrelated dirty files.
- Treat `17e4273ebd070dd62ca477297393e6c787441111` and `docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/` as the baseline evidence named by this package.
- Use the canonical scorecard path: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`. Do not reference the old `_v2` scorecard filename.
- Preserve the Project Home two-path contract:
  - fixture-only path remains deterministic and no-read-model;
  - read-model-driven path remains opt-in through `readModelClient`.
- Preserve bento direct-child behavior: every rendered `[data-pcc-card]` must have `parentElement === [data-pcc-bento-grid]`.
- Do not nest `PccDashboardCard` inside another `PccDashboardCard`.
- Do not introduce live writes, uploads, syncs, approvals, deletes, saves, external launches, or mutation side effects.
- Keep HBI advisory. HBI may summarize, explain, ground, and route attention; HBI must not claim autonomous decision, approval, writeback, or mutation authority.
- Keep Procore/Sage/SharePoint/PCC source-of-record boundaries explicit. Do not imply PCC owns records that remain external-system-owned.
- Do not edit `package.json`, `pnpm-lock.yaml`, package-solution files, or manifests unless the prompt explicitly authorizes it. This package does not authorize those edits.
- Do not modify shared primitives (`PccBentoGrid`, `PccDashboardCard`, `footprints.ts`, shell/tabs/hero primitives) unless a blocking validation failure proves the Project Home remediation cannot be completed otherwise. Stop and report the exact blocker before touching primitives.
- Prefer Project Home-local view-model, adapter, component, CSS, and test changes.
- Run the validation commands named in the prompt before closeout. If a command cannot run, report why and what evidence remains missing.

## Objective

Convert the Project Home Priority Actions card from a full expanded rail into a compact homepage command rail that surfaces the highest-value actions without dominating mobile and first-fold page height.

## Required repo check

Before editing:

```bash
git status --short
git branch --show-current
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Primary files

```text
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.module.css
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailViewModel.ts
apps/project-control-center/src/tests/PccProjectHome.test.tsx
```

## Baseline problem

Phone evidence measured the Priority Actions card at approximately 2573px. That is too large for a homepage command rail.

## Implementation requirements

### 1. Add compact rail view-model behavior

Update or extend the priority rail adapter/view-model so Project Home can render a compact default rail.

Target default:

- no more than 7 visible rows;
- preferably 5 visible rows on phone-sized modes if responsive behavior is easy and testable;
- remaining items summarized by count and category;
- top visible rows chosen by priority/severity, due date, and existing view-model sort semantics.

Do not mutate shared model fixtures.

### 2. Preserve full detail safely

Choose one of these patterns:

#### Preferred

Add local preview-only expansion:

```text
Show additional reference items
Show fewer
```

The expansion control must be display-only and local. It must not imply workflow execution.

#### Acceptable

Keep only compact summary on Project Home and rely on deeper module cards/surfaces for detail.

### 3. Preserve no-execution posture

Priority rows must not introduce:

- anchors;
- hrefs;
- workflow buttons;
- onClick handlers that imply source-system action;
- upload/sync/approve/submit/save/complete labels.

Allowed:

- inert `span`;
- local display-only expand/collapse button if clearly labeled as display-only and tested.

### 4. Improve row copy

Each visible row should show:

- priority;
- title;
- owner/persona when available;
- due date when available;
- source module/work center when available;
- reference-only/source-owned posture.

Replace vague `Reference` affordance if it fails to explain condition/impact/next step. Better copy examples:

```text
Source-owned
Reference only
Open in source system (disabled in preview)
```

Use the safest option that avoids false affordance.

### 5. Tests

Add/update tests for:

- default visible action count <= 7;
- overflow/remaining summary exists when hidden actions exist;
- no anchors/hrefs/buttons with workflow semantics;
- display-only expansion, if added;
- no false-affordance labels;
- direct-child card invariant;
- fixture-only and read-model paths.

## Validation focus

After implementation, compare Priority Actions measured height in Playwright evidence if available. The target is a material reduction from 2573px on phone.

## Required validation

Run the narrowest relevant tests first, then the broader Project Home suite.

```bash
git status --short
git branch --show-current
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml

pnpm --filter @hbc/spfx-project-control-center check-types
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectHome )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccApp.optIn )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccCardTierContract )

pnpm exec prettier --check   apps/project-control-center/src/surfaces/projectHome   apps/project-control-center/src/tests/PccProjectHome.test.tsx   apps/project-control-center/src/tests/PccApp.optIn.test.tsx

git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If broader test impact is plausible, run:

```bash
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts )
```

## Closeout response

Return:

```text
Files changed:
Repo-truth confirmed:
Implementation summary:
Tests run:
Validation results:
Lockfile/package/manifest status:
Known residual risks:
```
