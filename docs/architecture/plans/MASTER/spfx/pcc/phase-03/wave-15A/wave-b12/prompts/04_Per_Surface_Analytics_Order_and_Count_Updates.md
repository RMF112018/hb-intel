# PCC Phase 07 — Prompt 04 Updated Execution Prompt
## Per-Surface Analytics Order and Count Verification Gate

## Required Operating Mode

You are executing inside the `RMF112018/hb-intel` repo as a local code agent using Claude Code with Opus 4.7.

This prompt is now a **verification-first gate**, not a normal implementation prompt. Prompt 02 and Prompt 03 already updated and verified the per-surface analytics order/count tests. The expected outcome is:

```text
PASS — no edits required, no commit.
```

Only perform narrow test-file remediation if current repo truth proves one of the five per-surface analytics test files still contains stale pre-Phase-07 order/count expectations.

Follow these rules:

- Work only inside the repo.
- Do not make broad, unfocused repo scans.
- Do not re-read files that are still within your current context or memory unless you need to verify drift or inspect a specific changed section.
- Prefer targeted file reads and targeted grep/search over broad scans.
- Do not install dependencies.
- Do not add `echarts-for-react`.
- Do not mutate tenant systems, Procore, Sage, SharePoint, Graph, Azure, app catalog, or any live external system.
- Do not introduce command-model behavior, approval execution, source-system mutation, sync execution, or autonomous HBI decisioning.
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
Current observed Phase 07 / package posture: PCC 1.0.0.219
Latest known HEAD before this prompt: b9a565912c748d53029a6cc698ee094473bd28a7
Prompt 02 closeout anchor: c751bdf2bafa654e8d1ecf014579caad38c7fc03
Prompt 03 expected result: PASS / no edits / no commit
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

Important context:

- Prompt 02 removed the Phase 05-regressed generic Dashboard/title-description hero card from the six shared primary-dashboard surfaces.
- Prompt 02 relocated the Cost & Time Sage book-of-record cue into the `Module status` card while preserving `[data-pcc-dashboard-book-of-record="cost-time"]`.
- Prompt 03 verified that the shared-dashboard matrix and per-surface analytics order/count tests already match the Phase 07 target.
- The current Prompt 04 must therefore verify the per-surface analytics tests and should not produce edits unless drift is found.

---

## Objective

Verify that all per-surface analytics tests encode the Phase 07 direct-card order and counts after the duplicate shared-dashboard top card removal.

Expected target for the five analytics surfaces:

```text
estimating-preconstruction: 4 direct cards
startup-closeout: 5 direct cards
project-controls: 5 direct cards
cost-time: 5 direct cards
systems-administration: 5 direct cards
```

The first direct card in each analytics surface must be:

```text
Module status
```

The old leading surface-identity titles must not be present as the first direct card in the exact-order assertions:

```text
Estimating & Preconstruction
Project Startup & Closeout
Project Controls
Cost & Time
Systems Administration
```

Core Tools has no analytics and is covered by the shared-dashboard matrix / no-duplicate-header guards, not by this prompt except where an analytics test has an “unrelated dashboards remain unchanged” block.

---

## Preflight / Drift Gate

Run and record:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git log --oneline -8
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
- Any required remediation would touch production source, Project Home, Document Control, analytics view models, layout primitives, models, UI kit, manifests, package files, or lockfile.

If unrelated modified/untracked files exist, report them and leave them unstaged/unedited.

---

## Files to Verify

Verify these five files:

```text
apps/project-control-center/src/tests/PccEstimatingPreconstructionAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccStartupCloseoutAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccProjectControlsAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccSystemsAdministrationAnalyticsCards.test.tsx
```

Do not edit unless targeted verification finds stale order/count expectations.

---

## Required Target Orders

### Estimating & Preconstruction

```text
Module status
Handoff Continuity Preview
Estimate Exposure Preview
Select a module
```

Expected direct card count: `4`.

### Project Startup & Closeout

```text
Module status
Startup Readiness Completion
Responsibility Coverage
Closeout & Warranty Readiness
Select a module
```

Expected direct card count: `5`.

### Project Controls

```text
Module status
Constraints Aging
Permit / Inspection Readiness
Risk / Issue Severity Distribution
Select a module
```

Expected direct card count: `5`.

### Cost & Time

```text
Module status
Schedule Milestone Posture
Procurement / Buyout Exposure
Commitment / Cost Exposure Preview
Select a module
```

Expected direct card count: `5`.

Cost & Time must still preserve the scoped Sage cue test:

```text
[data-pcc-dashboard-book-of-record="cost-time"]
```

The test must remain attribute-keyed and must not rely on the cue’s prior location in the removed hero card.

### Systems Administration

```text
Module status
Integration Health Summary
Configuration Severity
Procore Mapping / Sync Posture
Select a module
```

Expected direct card count: `5`.

Systems Administration must still preserve the Procore authority/context cue test if currently present.

---

## Required Assertions to Preserve

Do not weaken or remove any existing assertions covering:

- `[data-pcc-analytics-card]` marker.
- `[data-pcc-analytics-chart]` marker.
- preview state label.
- sample-data explanation.
- deterministic source label.
- summary rows outside chart canvas.
- span override behavior.
- tablet fallback behavior if currently tested.
- `echarts-for-react` absence.
- no `Project Intelligence`.
- no card-level active panel marker.
- no nested cards.
- analytics cards remain direct children of `[data-pcc-bento-grid]`.
- Cost & Time Sage marker scoped to `cost-time`.
- Systems Administration Procore mapping/context cue where currently asserted.
- cross-conditional regression locks that verify other dashboards do not render the current surface’s analytics cards.

---

## Targeted Drift Searches

Use targeted grep/search against the five governed files. The exact command may vary, but the verification should answer these questions:

### 1. Stale exact-order headings

The exact direct-order arrays must not begin with the old surface identity headings:

```text
Estimating & Preconstruction
Project Startup & Closeout
Project Controls
Cost & Time
Systems Administration
```

Those phrases may still appear in describe labels, comments, or tab names. They are stale only if they are the first expected direct-card title in the order array after Phase 07.

### 2. Stale counts

The governed analytics tests should not assert the old shared-dashboard direct counts:

```text
toHaveLength(6)
toHaveLength(3)  # only stale in core-tools unrelated-dashboard blocks
exact 6-card direct order
exactly 6 direct cards
exactly 3 direct dashboard cards
```

Allowed exceptions:

- `toHaveLength(6)` may be legitimate if it is not a direct-card count for one of the shared-dashboard surfaces. Inspect context before editing.
- Non-card-count uses of numbers are out of scope.

### 3. Required Phase 07 count language

The files should encode:

```text
exact 4-card direct order   # Estimating
exact 5-card direct order   # Startup/Controls/Cost/Systems
exactly 2 direct dashboard cards  # core-tools unrelated-dashboard blocks where present
```

### 4. Cross-conditional locks

Cross-conditional regression locks must use:

```text
estimating-preconstruction: 4
startup-closeout: 5
project-controls: 5
cost-time: 5
core-tools unrelated-dashboard blocks: 2
```

---

## Drift Remediation Policy

Only if drift is found, edit the smallest necessary subset of the five governed test files.

Allowed edits:

- Replace stale direct-card counts with Phase 07 target counts.
- Drop stale leading surface-identity titles from exact-order arrays.
- Update stale describe/it strings that say “exact 6-card direct order” or “exactly 6 direct cards” where the Phase 07 count is now 5.
- Update stale core-tools unrelated-dashboard blocks from `3` to `2`.
- Update comments that still describe the old `surface title → Module status → analytics → Select a module` sequence.

Prohibited edits:

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

No production source, architecture docs, evidence, live tests, manifests, package files, or lockfile edits are allowed in Prompt 04.

---

## Validation

Always run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
git diff --check
git diff --stat
git diff --name-only
git diff --cached --name-only
python3 - <<'PY'
import hashlib
print(hashlib.md5(open('pnpm-lock.yaml','rb').read()).hexdigest())
PY
```

If remediation edits were made, also run targeted Prettier on only the changed test file(s):

```bash
pnpm exec prettier --check <changed-test-file-1> <changed-test-file-2>
```

Do not run live Playwright.

Do not install dependencies.

Do not touch tenant / Procore / Sage / SharePoint / Graph / Azure / app catalog.

---

## Decision Tree

### PASS — no edits required

Use this when:

- All five per-surface analytics tests already encode the Phase 07 target order/count posture.
- `check-types` passes.
- Full PCC Vitest passes.
- `git diff` is empty.
- lockfile md5 is unchanged.

No commit. No docs update. Report no-op closeout.

### PASS — drift remediated

Use this only if stale test drift was found and fixed inside the five allowed test files.

Required:

- `check-types` passes.
- Full PCC Vitest passes.
- Prettier passes on changed files.
- `git diff --check` passes.
- Lockfile md5 unchanged.
- Only explicitly allowed test files changed.

Commit only the changed files by explicit path.

Suggested commit subject:

```text
test(pcc): HB Intel Project Control Center 1.0.0.219 — close Phase 07 Prompt 04 analytics test drift
```

### BLOCKED

Use this if:

- Prompt 02 closeout commit is not reachable.
- lockfile md5 changed.
- manifest/package drift appears during this prompt.
- remediation would require prohibited files.
- production source or live behavior appears inconsistent with already-green Prompt 02/03 repo truth.

Stop and report. Do not edit. Do not commit.

---

## Required Closeout Response

Use this structure:

```text
HB: Phase 07 Prompt 04 Closeout

Verdict:
- PASS — no edits required
  - or PASS — drift remediated
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

Per-surface analytics verification:
- Estimating & Preconstruction:
- Project Startup & Closeout:
- Project Controls:
- Cost & Time:
- Systems Administration:

Assertions preserved:
- analytics card/chart markers:
- preview/sample/source copy:
- summary rows outside chart:
- span overrides/tablet fallback:
- no echarts-for-react:
- no Project Intelligence:
- no card-level active panel:
- no nested cards:
- Cost & Time Sage scoped marker:
- Systems Administration Procore cue:

Files changed:
- None
  - or list changed files

Validation:
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
