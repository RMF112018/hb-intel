# Prompt 02 — Command Hero and First-Fold Hierarchy

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

Upgrade the Project Home hero from an internal-feeling project intelligence header into a flagship Project Command Summary that communicates project identity, operating posture, source confidence, and HBI advisory posture.

## Required repo check

Before editing:

```bash
git status --short
git branch --show-current
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Primary files

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.module.css
apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts
apps/project-control-center/src/tests/PccProjectHome.test.tsx
```

## Implementation requirements

### 1. Rename / retitle the command card

Replace user-visible `Project Intelligence Header` with an operator-facing title such as:

```text
Project Command Summary
```

or

```text
Project Intelligence
```

Do not keep `Project Intelligence Header` as visible copy.

Tests may continue to identify the card through stable markers or updated title expectations.

### 2. Preserve card contract

The command card must remain:

```tsx
footprint = 'hero';
hierarchy = 'primary';
tier = 'tier1';
region = 'command';
dataActiveSurfacePanel = 'project-home';
```

If repo-truth has changed, preserve equivalent command semantics and exactly one active panel marker.

### 3. Add first-fold operating posture

Add compact posture indicators derived from existing Project Home data or safe fixture/read-model props. Do not create new backend endpoints.

Target indicators:

- critical priority actions count;
- pending/blocking approvals count where available;
- readiness blocker count where available;
- document/source review status where available;
- setup/configuration blocking status where available;
- source confidence/freshness label;
- HBI advisory/no-writeback cue.

If exact counts are not readily available without broad adapter changes, use conservative copy and existing available signals rather than fabricating unsupported counts.

### 4. Fix contrast-sensitive labels

Project Home axe findings target metric labels in the command card. Adjust local Project Home CSS so metric labels remain visually subordinate but pass contrast.

Do not globally change `--pcc-color-text-muted` unless proven safe.

### 5. Tests

Update/add tests to assert:

- visible title is operator-facing;
- exactly one active panel marker exists;
- active marker is on command card;
- command card tier/region/hierarchy/footprint are correct;
- command summary contains source/HBI boundary copy;
- Project Home fixture-only and read-model paths still render.

## Do not

- Add live action buttons.
- Add external launch links.
- Increase hero height excessively.
- Remove project facts.
- Break existing project profile fallback behavior.

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
