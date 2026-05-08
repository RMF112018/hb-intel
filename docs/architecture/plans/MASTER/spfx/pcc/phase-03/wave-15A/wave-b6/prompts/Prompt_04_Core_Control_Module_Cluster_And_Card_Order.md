# Prompt 04 — Core-Control Module Cluster and Card Order — UPDATED

## Role

You are the local code agent working in the `hb-intel` repository. You are implementing a controlled Project Home flagship remediation for the PCC SPFx application.

## Current execution baseline

This updated prompt supersedes the original Prompt 04 package file for this execution pass.

Start from the current accepted Wave 15A B6 baseline:

```text
Baseline HEAD: f4cb0b3974e2e0a35ae3ab1ff08246fe3b73c44b
Accepted prior prompts:
- Prompt 01 package/audit baseline: 6b0eb6089b04e845554e9d23e6f0613cfe782ec9
- Prompt 02 command hero: 2828a242b843729db1c4bb80f1aca8956a6508a9
- Prompt 02 corrective source label: 81f3b8dff1c2cc6ec295ccd7ea0ddb8f0536f8b8
- Prompt 03 compact priority rail: f4cb0b3974e2e0a35ae3ab1ff08246fe3b73c44b
```

The historical package baseline `17e4273ebd070dd62ca477297393e6c787441111` and evidence path `docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/` remain the pre-remediation evidence baseline, but implementation must be based on the current repo truth after Prompts 01–03.

## Non-negotiable agent instructions

- Do not re-read files that are still within your current context or memory. Only re-open a file when you need to verify stale, missing, contradictory, or newly changed repo truth.
- Start with `git status --short`, `git branch --show-current`, `git rev-parse HEAD`, and lockfile MD5.
- Do not touch unrelated dirty or untracked files. A previously reported unrelated untracked `test-coverage/wave-2/` directory must remain untouched if still present.
- Confirm `HEAD` contains Prompt 03 commit `f4cb0b3974e2e0a35ae3ab1ff08246fe3b73c44b`.
- Confirm the Prompt 02 corrective remains present: `grep -R "Source: live system feeds" apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.ts || echo "gate ok — no matches"`.
- Use the canonical scorecard path: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`. Do not reference the old `_v2` scorecard filename.
- Preserve the Project Home two-path contract:
  - fixture-only path remains deterministic and no-read-model;
  - read-model-driven path remains opt-in through `readModelClient`.
- Preserve bento direct-child behavior: every rendered `[data-pcc-card]` must have `parentElement === [data-pcc-bento-grid]`.
- Do not nest `PccDashboardCard` inside another `PccDashboardCard`.
- Do not introduce live writes, uploads, syncs, approvals, deletes, saves, external launches, or mutation side effects.
- Keep HBI advisory. HBI may summarize, explain, ground, and route attention; HBI must not claim autonomous decision, approval, writeback, or mutation authority.
- Keep Procore/Sage/SharePoint/PCC source-of-record boundaries explicit. Do not imply PCC owns records that remain external-system-owned.
- Do not edit `package.json`, `pnpm-lock.yaml`, package-solution files, manifests, SPFx packaging files, shared primitives, shell/tabs/hero primitives, blueprint docs, or planning docs.
- Do not change the Prompt 02 title decision. The command card remains visibly titled `Project Intelligence`; do not rename it to `Project Command Summary`.
- Do not change the Prompt 03 compact rail behavior. The Priority Actions rail remains compact-by-default with 5 visible DOM rows and a local display-only toggle.
- Prefer Project Home-local component and test changes only.

## Objective

Reorder Project Home so the first-scan operational control cluster appears immediately after the command hero and compact priority rail:

1. Approvals & Checkpoints
2. Project Readiness
3. Document Control Center

Then place setup/health state content and deferred/reference content lower.

This prompt is intentionally about card order and tier/posture preservation. It must not become a redesign of lifecycle/HBI card content, compact rail behavior, shared bento primitives, or source-system integrations.

## Current repo truth to preserve

At the current Prompt 03 baseline:

### Fixture-only path (`PccProjectHome.tsx`)

Current order:

```text
0 Project Intelligence
1 Priority Actions
2 Missing Configurations
3 Site Health Summary
4 Approvals & Checkpoints
5 Project Readiness
6 Document Control Center
7 External Platforms
8 Team Snapshot
9 Recent Activity
```

### Read-model path (`PccProjectHomeReadModelContent.tsx`)

Current order:

```text
0 Project Intelligence
1 Priority Actions
2 Missing Configurations
3 Site Health Summary
4 Procore snapshot
5 Approvals & Checkpoints
6 Project Readiness
7 Document Control Center
8 External Platforms
9 Team Snapshot
10 Recent Activity
11 Lifecycle Timeline
12 Project Memory
13 Project Lens
14 Related Records
15 Ask HBI — Grounded Project Answers
```

The current composition-order test still reflects the old order and must be updated. Do not leave order assertions ambiguous.

## Target order for this prompt

### Fixture-only target order

```text
0 Project Intelligence
1 Priority Actions
2 Approvals & Checkpoints
3 Project Readiness
4 Document Control Center
5 Site Health Summary
6 Missing Configurations
7 External Platforms
8 Team Snapshot
9 Recent Activity
```

### Read-model target order

```text
0 Project Intelligence
1 Priority Actions
2 Approvals & Checkpoints
3 Project Readiness
4 Document Control Center
5 Site Health Summary
6 Missing Configurations
7 Procore snapshot
8 External Platforms
9 Team Snapshot
10 Recent Activity
11 Lifecycle Timeline
12 Project Memory
13 Project Lens
14 Related Records
15 Ask HBI — Grounded Project Answers
```

### Explicit deferral to Prompt 05

Do **not** split or refactor `PccProjectHomeUnifiedLifecycleSection` in this prompt. Today it renders a Fragment of four direct-child cards: `Lifecycle Timeline`, `Project Memory`, `Project Lens`, and `Related Records`. Splitting that section to promote only `Lifecycle Timeline` while keeping memory/lens/related lower requires lifecycle-specific refactoring and belongs to Prompt 05.

Do **not** promote or rewrite the Ask HBI section in this prompt. Prompt 05 owns lifecycle/HBI promotion and content refinement. Prompt 04’s value is to correct the operational cluster and demote Procore/reference content below the core control modules.

## Primary files

Expected product files:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
```

Expected test files:

```text
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
```

Only edit `PccMissingConfigurationsCard.tsx` or `PccProjectHomeProcoreSnapshotCard.tsx` if an actual stale tier/region assertion or product posture defect is found during execution. The current preferred posture is:

```text
Missing Configurations: tier="state", region="state"
Procore snapshot: tier="tier3", region="deferred"
```

Do not edit `PccPriorityActionsCard.tsx`, `PccPriorityActionsRail.tsx`, `priorityActionsRailAdapter.ts`, `priorityActionsRailViewModel.ts`, or rail CSS/tests unless a compile/test failure caused by the order changes proves a surgical adjustment is required. Prompt 03 rail behavior must remain intact.

## Implementation requirements

### 1. Reorder fixture-only path

Update `PccProjectHome.tsx` to the fixture target order exactly.

Preserve:

- the `buildProjectCommandSummary(...)` fixture wiring from Prompt 02;
- the compact Priority Actions card from Prompt 03;
- Fragment return shape;
- no wrapper elements;
- no new props or backend calls;
- exactly 10 fixture-only cards.

### 2. Reorder read-model path

Update `PccProjectHomeReadModelContent.tsx` to the read-model target order exactly.

Preserve:

- `useProjectHomeReadModel(client, SAMPLE_PROJECT_PROFILE.projectId)` hook behavior;
- `commandSummary` derivation from Prompt 02;
- read-model opt-in contract;
- Procore snapshot as display-only/deferred;
- Unified Lifecycle section as one Fragment-of-four direct-child card section;
- Ask HBI as one direct-child card, idle-on-mount;
- exactly 16 read-model cards after hooks resolve.

### 3. Retier only if repo truth proves it is required

Do not retier just because a card moved.

Current expected posture:

```text
Project Intelligence: tier1 / command / hero / primary
Priority Actions: tier2 / operational / wide / standard hierarchy
Approvals & Checkpoints: tier2 / operational
Project Readiness: tier2 / operational
Document Control Center: tier2 / operational / wide
Site Health Summary: tier2 / operational
Missing Configurations: state / state
Procore snapshot: tier3 / deferred
External Platforms: tier3 / reference
Team Snapshot: tier3 / rail
Recent Activity: tier3 / reference or equivalent existing posture
Lifecycle Timeline: tier2 / detail
Project Memory: tier3 / reference
Project Lens: tier3 / rail
Related Records: tier3 / detail
Ask HBI — Grounded Project Answers: tier2 / detail
```

If the live code differs from these expectations, do not invent a new taxonomy. Make the narrowest correction needed and document it in closeout.

### 4. Rewrite the composition-order tests

`apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx` is required scope.

Update it to assert exact card-title sequence for both render paths using direct bento child cards, not broad nested heading scans.

Preferred helper shape:

```ts
function readDirectCardTitlesInOrder(grid: Element): string[] {
  return Array.from(grid.children)
    .filter((child) => child instanceof HTMLElement && child.hasAttribute('data-pcc-card'))
    .map((card) => card.querySelector('h2,h3,h4')?.textContent?.trim() ?? '(untitled)');
}
```

Do not scan every nested `h2,h3,h4` under the grid because card bodies can contain nested headings and detail panels.

Test expectations:

Fixture path exact order:

```ts
expect(titles).toEqual([
  'Project Intelligence',
  'Priority Actions',
  'Approvals & Checkpoints',
  'Project Readiness',
  'Document Control Center',
  'Site Health Summary',
  'Missing Configurations',
  'External Platforms',
  'Team Snapshot',
  'Recent Activity',
]);
```

Read-model path exact order:

```ts
expect(titles).toEqual([
  'Project Intelligence',
  'Priority Actions',
  'Approvals & Checkpoints',
  'Project Readiness',
  'Document Control Center',
  'Site Health Summary',
  'Missing Configurations',
  'Procore snapshot',
  'External Platforms',
  'Team Snapshot',
  'Recent Activity',
  'Lifecycle Timeline',
  'Project Memory',
  'Project Lens',
  'Related Records',
  'Ask HBI — Grounded Project Answers',
]);
```

For the read-model test, wait for the read-model-driven appended content to settle before reading order. Waiting for `Lifecycle Timeline` is acceptable.

### 5. Update Project Home behavior tests surgically

In `PccProjectHome.test.tsx`:

- Preserve 10-card fixture-only count.
- Preserve 16-card read-model count.
- Preserve direct-child invariant.
- Preserve exactly one `data-pcc-active-surface-panel="project-home"` marker.
- Preserve Prompt 02 command summary row assertions.
- Preserve Prompt 03 compact rail assertions:
  - compact default <= 5 rows, preferably exactly `PCC_PRIORITY_RAIL_COMPACT_MAX_VISIBLE_ITEMS`;
  - no group sections until toggle;
  - one local display-only toggle;
  - `Source-owned` row affordances;
  - no anchors / no hrefs.
- Add/adjust relative order assertions so core operational modules appear before state/deferred/reference content:
  - `Approvals & Checkpoints` before `Project Readiness`;
  - `Project Readiness` before `Document Control Center`;
  - `Document Control Center` before `Site Health Summary`;
  - `Site Health Summary` before `Missing Configurations`;
  - `Missing Configurations` before `External Platforms`;
  - read-model only: `Missing Configurations` before `Procore snapshot`, and `Procore snapshot` before `External Platforms`.

### 6. Update card-tier contract tests only if needed

In `PccCardTierContract.test.tsx`, keep these expectations intact unless the product posture truly changes:

```text
Project Home Missing Configurations card is state / state
Procore snapshot remains tier3 / deferred
```

Add a targeted Project Home assertion only if useful:

- `Missing Configurations` remains state/state after moving lower.
- `Procore snapshot` remains tier3/deferred after moving lower.
- All Project Home cards remain explicit source, layout marker, aria-labelledby, and direct-child compliant.

Do not loosen the generic card-tier loop.

## Do not

- Do not rename `Project Intelligence`.
- Do not rename `Priority Actions`.
- Do not undo the compact Priority Actions rail.
- Do not change the 5-row compact rail cap.
- Do not split `PccProjectHomeUnifiedLifecycleSection`.
- Do not rewrite `PccProjectHomeAskHbiSection`.
- Do not remove cards to make the order easier.
- Do not add wrappers.
- Do not add a route.
- Do not add launch links or action buttons.
- Do not hide state/error cards without preserving their state semantics.
- Do not modify shared primitives or shell/hero/tab files.
- Do not edit package, lockfile, manifest, SPFx packaging, blueprint, or planning docs.

## Required validation

Run targeted checks in this order.

```bash
# Pre-edit hygiene + gates
git status --short
git branch --show-current
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
grep -R "Source: live system feeds" apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.ts || echo "gate ok — no matches"

# Type contract
pnpm --filter @hbc/spfx-project-control-center check-types

# Targeted order / Project Home suites
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectHome.composition )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectHome )

# Tier / opt-in / rail regression
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccCardTierContract )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccApp.optIn )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccPriorityActionsRail )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts priorityActionsRail )

# Targeted prettier — changed files only
pnpm exec prettier --check \
  apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx \
  apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx \
  apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx \
  apps/project-control-center/src/tests/PccProjectHome.test.tsx \
  apps/project-control-center/src/tests/PccCardTierContract.test.tsx

# Whitespace + post-edit hygiene
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If Prettier flags a real diff, run `prettier --write` only against the changed file list and rerun the affected suites.

No hosted Playwright is required in this prompt. Hosted/tenant proof remains OPERATOR-PENDING until Prompt 07.

## Commit posture

Subject:

```text
feat(pcc/project-home): reorder core control cluster below command rail (Wave 15A wave-b6 Prompt 04)
```

Commit description should include:

- current problem: setup/procore content appeared above core operational controls;
- fixture path order changed to command → compact priorities → approvals/readiness/documents → health/setup → reference/history;
- read-model path order changed to command → compact priorities → approvals/readiness/documents → health/setup → Procore/reference/history → lifecycle/HBI residual block;
- explicit note that lifecycle/HBI split/promotion is deferred to Prompt 05;
- explicit note that compact Priority Actions behavior from Prompt 03 is preserved;
- explicit no-edits list: shared primitives, package files, lockfile, manifests, SPFx packaging, docs;
- lockfile MD5 unchanged;
- canonical Co-Authored-By line.

Stage paths explicitly. Never use `git add -A`. Do not use `--no-verify`.

## Closeout response

Return:

```text
Files changed:
Repo-truth confirmed:
Implementation summary:
Fixture order after change:
Read-model order after change:
Prompt 02/03 preservation:
Tests run:
Validation results:
Lockfile/package/manifest status:
No-execution/source-boundary status:
Known residual risks:
Commit:
```

Known residual risks should explicitly include:

- Lifecycle Timeline / Ask HBI are still not fully promoted into the first reference band because Prompt 05 owns lifecycle/HBI promotion and any necessary section split/refinement.
- Hosted/tenant visual proof remains OPERATOR-PENDING until Prompt 07.
