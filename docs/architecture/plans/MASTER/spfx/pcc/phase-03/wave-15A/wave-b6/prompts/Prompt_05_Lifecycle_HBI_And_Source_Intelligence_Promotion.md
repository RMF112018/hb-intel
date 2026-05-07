# Prompt 05 — Lifecycle, HBI, and Source Intelligence Promotion

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

Make lifecycle continuity and grounded HBI visible earlier on Project Home without increasing cognitive load, adding live actions, or giving HBI mutation authority.

## Required repo check

Before editing:

```bash
git status --short
git branch --show-current
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Primary files

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeUnifiedLifecycleSection.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeAskHbiSection.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
```

## Baseline problem

Unified Lifecycle and Ask HBI are strong differentiators, but current live evidence places:

- Lifecycle Timeline at index 11;
- Project Memory at index 12;
- Project Lens at index 13;
- Related Records at index 14;
- Ask HBI at index 15.

This buries the mold-breaker story.

## Implementation requirements

### 1. Promote lifecycle continuity

Implement one of the following:

#### Preferred

Create a compact `Lifecycle Continuity` summary card that appears near the core-control cluster, and demote detailed lifecycle cards lower.

#### Acceptable

Reorder existing `Lifecycle Timeline` higher and keep memory/lens/related-records lower.

#### Avoid

Adding more total cards without consolidating another lifecycle/reference card.

### 2. Promote HBI entry point

Move `Ask HBI — Grounded Project Answers` earlier, or add a compact HBI entry point while preserving the detailed panel lower.

Rules:

- HBI remains idle-on-mount unless existing tests are deliberately updated with clear justification.
- HBI must not auto-run queries on Project Home load.
- HBI copy must say grounded/advisory/no-writeback/no-decision-authority.
- Sample query controls must be touch-safe and keyboard-accessible.

### 3. Improve source intelligence

Where useful, add a compact source-confidence strip or source posture cue to the command summary or lifecycle/HBI area.

Source posture must not imply PCC owns Procore/Sage/native records.

### 4. Tests

Add/update tests that prove:

- lifecycle summary or timeline appears earlier than lower reference cards;
- Ask HBI is not last in the read-model path after remediation;
- Ask HBI remains idle-on-mount;
- HBI disclaimer/no-source-of-truth/no-writeback copy exists;
- no new route/tab/workspace marker is introduced for Ask HBI or Unified Lifecycle;
- no anchors/hrefs/workflow execution introduced.

## Do not

- Add a new `unified-lifecycle` tab.
- Add a new `ask-hbi` tab.
- Add a global search route.
- Add writeback.
- Make HBI the source of truth.

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
