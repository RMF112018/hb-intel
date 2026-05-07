# Prompt 01 — Project Home Baseline Audit and Guarded Workplan

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

Conduct an exhaustive Project Home repo-truth and evidence audit, then produce a guarded implementation workplan. Do not change product code in this prompt.

## Required repo check

Before editing:

```bash
git status --short
git branch --show-current
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Primary files

```text
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/
```

## Required context

Review the package files first:

```text
README.md
00_REPO_TRUTH_SUMMARY.md
01_OPEN_DECISIONS_CLOSED.md
02_TARGET_ARCHITECTURE.md
03_IMPLEMENTATION_PLAN.md
04_ACCEPTANCE_CRITERIA.md
06_EVIDENCE_GAP_MATRIX.md
evidence/PROJECT_HOME_EVIDENCE_BASELINE_MATRIX.md
```

Then verify repo truth against the local repository.

## Audit requirements

### 1. Confirm render paths

Confirm:

- fixture-only path in `PccProjectHome.tsx`;
- read-model-driven path in `PccProjectHomeReadModelContent.tsx`;
- card order in both paths;
- card count in both paths;
- whether tests currently assert the same order/count.

### 2. Confirm evidence baseline

Inspect the current evidence path if present locally:

```text
docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/
```

Specifically inspect:

```text
surface-screenshots-1778188679091/pcc-live-dom-card-summary.json
surface-screenshots-1778188679091/pcc-live-screenshot-inventory.json
breakpoints-1778188624999/pcc-live-breakpoint-matrix.json
breakpoints-1778188624999/pcc-live-breakpoint-card-measurements.json
accessibility-1778188606395/pcc-live-axe-summary.json
content-1778188651911/content-review-findings.json
workflow-1778188695837/pcc-live-action-summary.json
workflow-1778188695837/pcc-live-false-affordance-summary.json
```

If the evidence path is not present locally, do not fabricate details. Use package baseline values and state that local evidence files were unavailable.

### 3. Confirm Project Home weakness map

Produce a concise weakness matrix:

| Area | Repo-truth/evidence | Product impact | Proposed remediation |
| ---- | ------------------- | -------------- | -------------------- |

At minimum cover:

- Project Intelligence / Command Summary;
- Priority Actions rail;
- Missing Configurations placement;
- Procore snapshot placement;
- Approvals / Readiness / Document Control cluster;
- Site Health / Setup Health;
- Lifecycle continuity;
- Ask HBI;
- External Platforms / Team / Recent Activity;
- contrast findings;
- touch target findings;
- screenshot evidence gap.

### 4. Confirm exact file-change plan

Return a prompt-by-prompt file-change plan. Do not edit files.

## Required output

Return:

```text
Repo-truth summary:
Evidence summary:
Confirmed current Project Home card order:
Confirmed target Project Home card order:
Implementation risks:
Recommended file changes by prompt:
Validation commands to run after Prompt 02:
Open blockers, if any:
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
