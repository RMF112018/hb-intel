# Prompt 04 — Core-Control Module Cluster and Card Order

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

Reorder and retier Project Home so core operational control modules appear before deferred/reference content, while preserving fixture-only and read-model-driven contracts.

## Required repo check

Before editing:

```bash
git status --short
git branch --show-current
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Primary files

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/PccMissingConfigurationsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeProcoreSnapshotCard.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
```

## Baseline problem

Current read-model order places `Missing Configurations` and `Procore snapshot` above core Tier 2 operational modules. `Procore snapshot` is `tier3/deferred` but appears before `Approvals & Checkpoints`, `Project Readiness`, and `Document Control Center`.

## Target order

Use this as the target unless Prompt 01 found a better repo-truth-specific refinement:

```text
0  Project Command Summary
1  Today's Operating Priorities
2  Approvals & Checkpoints
3  Project Readiness
4  Document Control Center
5  Site Health / Setup Health
6  Lifecycle Continuity / Lifecycle Timeline compact
7  Ask HBI / Grounded Project Answers
8  Procore / Source Posture
9  External Platforms
10 Team Snapshot
11 Recent Activity
12+ Project Memory / Project Lens / Related Records lower-detail content
```

## Implementation requirements

### 1. Reorder fixture-only path

Update `PccProjectHome.tsx` so the 10-card fixture path follows the target hierarchy as closely as possible.

Fixture-only path may not include read-model-only Procore/Unified Lifecycle/Ask HBI cards unless they already exist safely.

### 2. Reorder read-model path

Update `PccProjectHomeReadModelContent.tsx` so the read-model-driven path places:

- core operational modules before deferred/reference content;
- Procore below core operational cluster unless it is rendered as blocking/source-health posture;
- Ask HBI and lifecycle continuity earlier than the final card position.

### 3. Retier only when justified

If moving a card reveals stale tier/region semantics, update its `PccDashboardCard` props.

Examples:

- Non-blocking Procore snapshot should not remain visually high.
- Missing Configurations may be `state` but should only be high when blocking.
- External Platforms should remain reference/deferred.
- Team Snapshot and Recent Activity should remain lower-tier/reference/rail.

### 4. Tests

Update `PccProjectHome.test.tsx`:

- fixture-only card order;
- read-model-driven card order;
- direct-child invariant;
- card tier/region/footprint for primary cards;
- exactly one active surface panel;
- no `data-pcc-card` nesting.

Update `PccCardTierContract.test.tsx` if it contains Project Home order/tier assumptions.

## Do not

- Remove cards simply to pass density.
- Add wrappers.
- Add a new route.
- Create external-launch affordances.
- Hide error/state cards without preserving state semantics.

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
