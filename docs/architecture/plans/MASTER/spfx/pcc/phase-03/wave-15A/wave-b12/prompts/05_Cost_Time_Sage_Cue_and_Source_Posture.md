# PCC Phase 07 — Prompt 05 Updated Execution Prompt
## Cost & Time Sage Cue and Source Posture Test Hardening

## Required Operating Mode

You are executing inside the `RMF112018/hb-intel` repo as a local code agent using Claude Code with Opus 4.7.

This prompt is a **narrow test-hardening prompt**. Current production source is expected to already satisfy the Phase 07 posture:

- the generic shared Dashboard/title-description hero card has been removed;
- all six shared primary-dashboard surfaces begin with `Module status`;
- the Cost & Time Sage book-of-record cue has been relocated into the `Module status` card;
- the cue remains scoped only to `cost-time`.

Do **not** treat this as a broad implementation prompt. Add or harden tests only where current coverage does not fully prove the Cost & Time Sage cue/source posture.

Follow these rules:

- Work only inside the repo.
- Do not make broad, unfocused repo scans.
- Do not re-read files that are still within your current context or memory unless you need to verify drift or inspect a specific changed section.
- Prefer targeted file reads and targeted grep/search over broad scans.
- Do not install dependencies.
- Do not add `echarts-for-react`.
- Do not mutate tenant systems, Procore, Sage, SharePoint, Graph, Azure, app catalog, or any live external system.
- Do not introduce command-model behavior, approval execution, source-system mutation, sync execution, Sage sync, accounting mutation, writeback behavior, or autonomous HBI decisioning.
- Do not render developer/internal copy in the UI.
- Preserve Project Home Phase 06 behavior.
- Preserve Document Control’s specialized `PccDocumentsSurface`.
- Keep the bento direct-child invariant intact.
- Keep shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]` ownership intact.
- Do not run live Playwright.
- If repo truth differs from this prompt, stop and report the mismatch rather than forcing stale instructions.

---

## Current Repo-Truth Baseline

Current intended baseline for this prompt:

```text
Current expected branch: main
Current observed PCC package posture: 1.0.0.219
Latest known HEAD before this prompt review: 694e440723b25e6153232b60f51c048c14263c3b
Prompt 02 closeout anchor: c751bdf2bafa654e8d1ecf014579caad38c7fc03
Prompt 03 result: PASS / no edits / no commit
Prompt 04 result: PASS / no edits / no commit
pnpm-lock.yaml md5: 7c19ccfa8718a42f7f55ce178a626996
```

Current package/version posture to verify and report:

```text
apps/project-control-center/config/package-solution.json
  solution.version: 1.0.0.219
  solution.features[0].version: 1.0.0.219

tools/spfx-shell/config/package-solution.json
  solution.version: 1.0.0.219
  solution.features[0].version: 1.0.0.219

apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
  version: 1.0.0.219
```

Relevant current production source posture:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
```

Expected current source facts:

- `PRIMARY_TAB_POSTURE_NOTE['cost-time']` contains this exact cue:

```text
Sage remains the accounting book of record for cost, commitment, and exposure data; PCC does not write back to Sage.
```

- `PccPrimaryDashboardSurface` no longer imports or calls `getPrimaryNavigationTab`.
- `PccPrimaryDashboardSurface` no longer defines `NO_WRITEBACK_POSTURE`.
- The first direct rendered card in the shared dashboard is the `Module status` card.
- The Cost & Time posture note renders inside that `Module status` card as:

```tsx
<p
  className={styles.overviewBookOfRecord}
  data-pcc-dashboard-book-of-record={activePrimaryTabId}
>
  {postureNote}
</p>
```

- No generic `Dashboard` hero card should exist in `PccPrimaryDashboardSurface`.

---

## Objective

Harden tests proving that the Cost & Time Sage book-of-record cue:

1. renders the exact required cue text;
2. is scoped only to the `cost-time` dashboard;
3. lives inside the `Module status` card after Phase 07 removed the generic Dashboard/title-description hero card;
4. does not live inside a generic hero/command/title-description card;
5. does not interfere with Cost & Time selected-module behavior when `activeModuleId` belongs to `cost-time`;
6. does not imply Sage writeback, sync, posting, updating, or accounting mutation.

Expected result is a **test-only diff**.

No production source change is expected. If production source does not satisfy the posture above, stop and report `BLOCKED — production posture drift` rather than editing source in this prompt.

---

## Preflight / Drift Gate

Run and record:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git log --oneline -10
git merge-base --is-ancestor c751bdf2bafa654e8d1ecf014579caad38c7fc03 HEAD && echo "Prompt 02 closeout reachable"
python3 - <<'PY'
import hashlib
print(hashlib.md5(open('pnpm-lock.yaml','rb').read()).hexdigest())
PY
```

Stop and report `BLOCKED` if:

- Prompt 02 closeout commit `c751bdf2bafa654e8d1ecf014579caad38c7fc03` is not reachable from `HEAD`.
- The lockfile md5 is not `7c19ccfa8718a42f7f55ce178a626996`.
- There are staged changes in the files governed by this prompt.
- Any required remediation would touch production source, Project Home, Document Control, analytics view models, layout primitives, models, UI kit, manifests, package files, lockfile, docs/evidence, e2e/live tests, or live systems.

If unrelated modified/untracked files exist, report them and leave them unstaged/unedited.

---

## Files to Inspect

Inspect only as needed:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx
```

## Files Allowed to Edit

Expected edit target:

```text
apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
```

Optional edit target only if needed to avoid duplicated helper logic or if the existing router-level test is the better local anchor:

```text
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
```

Do not edit `PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx` unless a compile-only issue is introduced by a local helper import conflict, which is not expected.

Do not edit production source in this prompt.

---

## Existing Coverage to Preserve

Current tests already contain important coverage. Do not weaken it.

### `PccSurfaceRouter.phase05.test.tsx`

Preserve the existing tests that:

- assert the Cost & Time dashboard renders `[data-pcc-dashboard-book-of-record="cost-time"]`;
- assert the cue contains “Sage remains the accounting book of record”;
- assert no other primary tab renders `[data-pcc-dashboard-book-of-record]`.

### `PccCostTimeAnalyticsCards.test.tsx`

Preserve the existing tests that:

- assert the exact Cost & Time card order:

```text
Module status
Schedule Milestone Posture
Procurement / Buyout Exposure
Commitment / Cost Exposure Preview
Select a module
```

- assert all three Cost & Time analytics cards render only on Cost & Time;
- assert analytics markers and chart markers;
- assert preview/sample/source copy;
- assert fallback summary rows outside chart;
- assert analytics cards remain direct children of `[data-pcc-bento-grid]`;
- assert span overrides and tablet fallback;
- assert all Cost & Time module rows;
- assert no `Project Intelligence`;
- assert zero card-level `[data-pcc-active-surface-panel]`;
- assert `[data-pcc-dashboard-book-of-record="cost-time"]` is present on Cost & Time;
- assert non-Cost & Time shared dashboards render zero book-of-record markers;
- assert no `echarts-for-react` import.

---

## Required Test Hardening

Add or harden narrowly scoped tests, preferably in `PccCostTimeAnalyticsCards.test.tsx`, to prove the following.

### 1. Exact Sage cue text and source-system posture

Assert the marker text exactly equals or contains the full required cue:

```text
Sage remains the accounting book of record for cost, commitment, and exposure data; PCC does not write back to Sage.
```

Assert the cue text contains:

```text
does not write back to Sage
```

Assert the cue text does **not** imply affirmative writeback/sync/mutation behavior. Keep this assertion scoped to the cue node text only, not the full grid text, because surrounding Cost & Time content legitimately includes terms such as “commitment.”

Suggested forbidden affirmative patterns on the cue text:

```text
will write back
can write back
sync to Sage
syncs to Sage
post to Sage
posts to Sage
update Sage
updates Sage
mutate Sage
mutates Sage
accounting mutation
```

Do not reject the phrase `does not write back to Sage`; that phrase is required.

### 2. Cue lives inside the `Module status` card

For the Cost & Time render:

- locate `[data-pcc-dashboard-book-of-record="cost-time"]`;
- call `.closest('[data-pcc-card]')`;
- assert that nearest card’s heading is exactly:

```text
Module status
```

Also assert the nearest card has the expected current `Module status` posture:

```text
data-pcc-footprint="wide"
data-pcc-card-hierarchy="standard"
data-pcc-card-tier="tier2"
data-pcc-card-region="operational"
```

Assert it is **not** the removed generic Dashboard hero posture:

```text
data-pcc-footprint !== "hero"
data-pcc-card-hierarchy !== "primary"
data-pcc-card-tier !== "tier1"
data-pcc-card-region !== "command"
```

Use stable DOM markers only. Do not use CSS module class selectors.

### 3. Cue is not inside the selected-module card

Render Cost & Time with an active module that belongs to Cost & Time:

```tsx
<PccPrimaryDashboardSurface activePrimaryTabId="cost-time" activeModuleId="procurement-buyout" />
```

Assert:

- the selected-module card still renders;
- `[data-pcc-selected-module-card]` has:

```text
data-pcc-selected-module-id="procurement-buyout"
data-pcc-selected-module-state="preview"
data-pcc-selected-module-parent-tab="cost-time"
```

- the selected-module card’s article heading is:

```text
Procurement & Buyout
```

- the selected-module card text does **not** contain the Sage book-of-record cue;
- the Sage cue still resolves to the `Module status` card in the same render.

This proves the relocated cue does not break Cost & Time module selection and is not accidentally attached to the selected-module card.

### 4. Cue remains scoped only to Cost & Time

Preserve or harden the existing loop over non-Cost & Time shared dashboards:

```text
core-tools
estimating-preconstruction
startup-closeout
project-controls
systems-administration
```

Each must render zero `[data-pcc-dashboard-book-of-record]` markers.

If the router-level `PCC_PRIMARY_TAB_IDS` test already verifies Project Home and Documents as well, preserve it.

### 5. Generic Dashboard card remains absent

Do not duplicate the entire Prompt 01 guard, but add a local Cost & Time sanity assertion if useful:

- the first direct Cost & Time card heading is `Module status`;
- no direct child card matches the removed generic header-card pattern:
  - heading `Cost & Time`;
  - `data-pcc-footprint="hero"`;
  - `data-pcc-card-hierarchy="primary"`;
  - `data-pcc-card-tier="tier1"`;
  - `data-pcc-card-region="command"`.

Do not weaken `PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx`.

---

## Optional Comment Cleanup

`PccCostTimeAnalyticsCards.test.tsx` may still have a stale file-header comment describing the Cost & Time test as an “exact 6-card direct-child order.”

If present, update that comment to the Phase 07 posture:

```text
exact 5-card direct-child order
```

This is allowed because it is inside the governed Cost & Time test file and directly tied to Prompt 05. Do not perform broad comment cleanup outside the governed file.

---

## Prohibited Changes

Do not edit:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/analytics/**
apps/project-control-center/src/layout/**
packages/models/**
packages/ui-kit/**
apps/project-control-center/config/package-solution.json
tools/spfx-shell/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
apps/project-control-center/package.json
pnpm-lock.yaml
docs/architecture/**
e2e/**
```

Do not add:

- a standalone Sage governance card;
- a generic Dashboard card;
- Sage sync/writeback behavior;
- accounting mutation behavior;
- new dependencies;
- live-system interaction.

---

## Validation

Run focused validation first:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccCostTimeAnalyticsCards
```

Then run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
git diff --check
git diff --stat
git diff --name-only
git diff --cached --name-only
python3 - <<'PY'
import hashlib
print(hashlib.md5(open('pnpm-lock.yaml','rb').read()).hexdigest())
PY
```

If `PccSurfaceRouter.phase05.test.tsx` is edited, include it in the Prettier command.

Do not run live Playwright.

Do not install dependencies.

Do not touch tenant / Procore / Sage / SharePoint / Graph / Azure / app catalog.

---

## Decision Tree

### PASS — test hardening added

Use this when the necessary tests are added or hardened inside allowed test files and all validations pass.

Expected commit type:

```text
test(pcc): HB Intel Project Control Center 1.0.0.219 — harden Cost & Time Sage cue posture
```

Commit only changed test files by explicit path. No `git add -A`; no `git add .`.

### PASS — no edits required

Use this only if current tests already prove all required Prompt 05 assertions, including:

- exact cue copy;
- cue inside `Module status`;
- cue not in selected-module card;
- selected-module behavior for a Cost & Time module;
- no affirmative Sage sync/writeback/mutation language;
- scoped-only marker behavior.

If no edits are made, do not commit.

### BLOCKED

Use this if:

- Prompt 02 closeout is unreachable;
- lockfile md5 changed;
- production source does not match the expected Phase 07 posture;
- required remediation would touch prohibited files;
- package/manifest/lockfile drift occurs during this prompt;
- validation fails for reasons outside the allowed test scope.

Stop and report. Do not force stale instructions.

---

## Required Closeout Response

Use this structure:

```text
HB: Phase 07 Prompt 05 Closeout

Verdict:
- PASS — test hardening added
  - or PASS — no edits required
  - or BLOCKED

Branch / HEAD:
- Branch:
- HEAD:
- Prompt 02 closeout reachable:
- Working tree before:
- Working tree after:

Repo version posture:
- package-solution solution.version:
- package-solution feature version:
- webpart manifest version:
- pnpm-lock md5 before:
- pnpm-lock md5 after:

Source posture verified:
- generic Dashboard card absent:
- Cost & Time cue source constant/copy:
- cue rendered inside Module status:
- cue scoped only to cost-time:
- selected-module behavior for procurement-buyout:
- no affirmative Sage writeback/sync/mutation implication:

Files changed:
- ...

Validation:
- focused Cost & Time test:
- check-types:
- full PCC vitest:
- prettier:
- git diff --check:
- git diff / cached diff:
- lockfile md5:

Guardrails:
- Production source modified:
- Project Home modified:
- Document Control modified:
- analytics/layout/models/ui-kit modified:
- manifests/package/lockfile modified:
- dependencies installed:
- live systems touched:
- Playwright run:

Proceed / Stop:
- Proceed only if PASS.
```
