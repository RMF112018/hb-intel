# PCC Phase 07 — Claude Code Opus 4.7 Execution Prompt

## Prompt 03 — Shared Dashboard Test Matrix Verification and Drift Remediation Gate

## Required Operating Mode

You are executing inside the `RMF112018/hb-intel` repo as a local code agent using Claude Code with Opus 4.7.

Follow these rules for this prompt:

- Work only inside the repo.
- Treat this prompt as a verification-first gate. Do not edit files unless repo-truth proves a remaining Phase 07 matrix drift.
- Do not make broad, unfocused repo scans.
- Do not re-read files that are still within your current context or memory unless you need to verify drift or inspect a specific changed section.
- Prefer targeted file reads and targeted searches.
- Do not install dependencies.
- Do not add `echarts-for-react`.
- Do not mutate tenant systems, Procore, Sage, SharePoint, Graph, Azure, app catalog, or any live external system.
- Do not introduce command-model behavior, approval execution, source-system mutation, sync execution, or autonomous HBI decisioning.
- Do not render developer/internal copy in the UI.
- Preserve Project Home Phase 06 behavior.
- Preserve Document Control's specialized `PccDocumentsSurface`.
- Keep the bento direct-child invariant intact.
- Keep shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]` ownership intact.
- If repo truth differs from this prompt, stop and report the mismatch rather than forcing stale instructions.

## Current Repo-Truth Starting Point

Prompt 02 has already been implemented and closed.

Expected current ancestry / head posture:

```text
Prompt 02 closeout commit:
  c751bdf2bafa654e8d1ecf014579caad38c7fc03

Current known main after package/version alignment:
  2fdaf00c7bcdc457393b73419e789d2cc7140aec
```

Current package posture on `main`:

```text
apps/project-control-center/config/package-solution.json solution.version: 1.0.0.219
apps/project-control-center/config/package-solution.json solution.features[0].version: 1.0.0.218
tools/spfx-shell/config/package-solution.json solution.version: 1.0.0.219
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json version: 1.0.0.219
pnpm-lock.yaml md5: 7c19ccfa8718a42f7f55ce178a626996
```

Do not change package manifests, webpart manifest, package.json, or `pnpm-lock.yaml` in this prompt.

## Phase 07 Target State Already Established

The six shared primary-dashboard surfaces must now use these direct card counts:

```text
core-tools: 2
estimating-preconstruction: 4
startup-closeout: 5
project-controls: 5
cost-time: 5
systems-administration: 5
```

The first direct bento card on each of those six shared surfaces must be:

```text
Module status
```

Project Home and Document Control are not part of the shared-dashboard matrix:

```text
project-home: preserve existing Project Home fixture/read-model counts and row-sum choreography
documents: preserve PccDocumentsSurface specialized behavior
```

Cost & Time must continue to render the Sage book-of-record cue only on `cost-time` using this marker:

```text
data-pcc-dashboard-book-of-record="cost-time"
```

## Objective

Verify that all shared dashboard test matrices and Phase 06 regression coverage already reflect the Phase 07 target state. Remediate only if a specific remaining stale assertion is found.

This prompt exists because Prompt 02 and its follow-up commits already updated the major matrix drift. Therefore, the expected result is usually:

```text
No source/test edits required; validation confirms matrices are aligned.
```

## Preflight / Drift Gate

Run and record:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git merge-base --is-ancestor c751bdf2bafa654e8d1ecf014579caad38c7fc03 HEAD && echo "Prompt 02 reachable"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Stop and report if:

- Prompt 02 closeout commit `c751bdf2bafa654e8d1ecf014579caad38c7fc03` is not reachable from `HEAD`.
- `pnpm-lock.yaml` md5 differs from `7c19ccfa8718a42f7f55ce178a626996`.
- The working tree has unrelated staged changes.
- Package manifest, webpart manifest, package.json, or lockfile changes appear in your intended diff.

If unrelated untracked or modified files exist, do not stage or modify them. Report them in closeout.

## Files to Verify

Use targeted reads/searches only for the files below:

```text
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
apps/project-control-center/src/tests/PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx
apps/project-control-center/src/tests/PccSurfaceNoDuplicateHeader.test.tsx
apps/project-control-center/src/tests/PccEstimatingPreconstructionAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccStartupCloseoutAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccProjectControlsAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccSystemsAdministrationAnalyticsCards.test.tsx
```

If file names have drifted, search only for these stable terms:

```text
EXPECTED_DIRECT_CARD_COUNT_BY_TAB
PHASE_06_PRIMARY_DASHBOARD_CARD_COUNTS
PccPhase07NoRedundantSharedDashboardHeaderCards
FIRST_OPERATIONAL_HEADING
exact 6-card direct order
exactly 6 direct cards
Systems Administration → Module status
Cost & Time → Module status
Project Controls → Module status
Project Startup & Closeout → Module status
Estimating & Preconstruction → Module status
```

## Required Verification Checks

### 1. Shared router matrix

In `PccSurfaceRouter.phase05.test.tsx`, verify:

- `EXPECTED_DIRECT_CARD_COUNT_BY_TAB` encodes:

```text
core-tools: 2
estimating-preconstruction: 4
startup-closeout: 5
project-controls: 5
cost-time: 5
systems-administration: 5
```

- Comments explain that Phase 07 removed the Phase 05-regressed generic shared Dashboard/title-description card.
- Project Home and Documents remain excluded from the shared-dashboard iteration.
- Cost & Time Sage book-of-record scoped-only assertion remains present and attribute-keyed.

### 2. Phase 06 regression coverage matrix

In `PccPhase06RegressionCoverage.test.tsx`, verify:

- `PHASE_06_PRIMARY_DASHBOARD_CARD_COUNTS` encodes:

```text
core-tools: 2
estimating-preconstruction: 4
startup-closeout: 5
project-controls: 5
cost-time: 5
systems-administration: 5
```

- Comments explain that Phase 07 intentionally removed the generic shared Dashboard card.
- Project Home fixture/read-model counts remain unchanged.
- The following assertions remain intact:
  - zero card-level active panel markers;
  - shell-owned active panel marker;
  - zero nested cards;
  - no `Project Intelligence`;
  - no developer/TODO UI copy;
  - Project Home row-sum choreography;
  - Project Home gateway buttons are not anchors;
  - `echarts-for-react` absence.

### 3. Prompt 01 anti-regression guard

In `PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx`, verify:

- It still covers only the six shared primary dashboards.
- It still asserts the first card is `Module status`.
- It still rejects the duplicate header-card pattern using heading/body/marker logic.
- It still excludes Project Home and Documents.
- It still uses stable DOM markers, not CSS classes.

Do not weaken this file.

### 4. No-duplicate-header invariant

In `PccSurfaceNoDuplicateHeader.test.tsx`, verify:

- `FIRST_OPERATIONAL_HEADING` expects `Module status` for the six shared primary-dashboard tabs.
- `project-home` and `documents` retain their specialized first-card headings.
- The no card-level active-surface-panel assertion remains intact.

### 5. Per-surface analytics order / cross-conditional locks

Across the five per-surface analytics test files, verify:

- Estimating direct order begins with:

```text
Module status → Handoff Continuity Preview → Estimate Exposure Preview → Select a module
```

- Startup & Closeout direct order begins with:

```text
Module status → Startup Readiness Completion → Responsibility Coverage → Closeout & Warranty Readiness → Select a module
```

- Project Controls direct order begins with:

```text
Module status → Constraints Aging → Permit / Inspection Readiness → Risk / Issue Severity Distribution → Select a module
```

- Cost & Time direct order begins with:

```text
Module status → Schedule Milestone Posture → Procurement / Buyout Exposure → Commitment / Cost Exposure Preview → Select a module
```

- Systems Administration direct order begins with:

```text
Module status → Integration Health Summary → Configuration Severity → Procore Mapping / Sync Posture → Select a module
```

- Cross-conditional count locks use the Phase 07 counts, not the pre-remediation `3 / 5 / 6 / 6 / 6 / 6` counts.
- Cost & Time Sage marker scoped-only tests remain unchanged and passing.
- Analytics content, source labels, chart containers, fallback summaries, accessible labels, and span override assertions remain intact.

## Drift Remediation Rules

If all verification checks pass, do not edit files.

If a stale assertion is found, update only the smallest necessary test file(s). Examples of allowed edits:

- Replace a stale shared-dashboard count with the Phase 07 target count.
- Drop a stale leading surface-identity title from an exact direct-card order expectation.
- Update a stale comment that describes `hero + Module status` as the current shared-dashboard shape.
- Update a stale `FIRST_OPERATIONAL_HEADING` value to `Module status` for one of the six shared surfaces.

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
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
tools/spfx-shell/config/package-solution.json
apps/project-control-center/package.json
pnpm-lock.yaml
```

Do not change production source in this prompt. Prompt 02 already performed the production fix.

## Validation Commands

Run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

If files were changed, also run targeted Prettier on only those files:

```bash
pnpm exec prettier --check <changed-files>
```

Always run:

```bash
git diff --check
git diff --stat
git diff --name-only
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Do not run live Playwright in this prompt.

## Acceptance Criteria

Prompt 03 is complete when one of these outcomes is true:

### PASS — no edits required

- Prompt 02 commit is reachable.
- Test matrices already encode Phase 07 target counts.
- First-card expectations already encode `Module status` for six shared surfaces.
- Full PCC vitest passes.
- `check-types` passes.
- No files changed by this prompt.
- `pnpm-lock.yaml` md5 remains unchanged.

### PASS — drift remediated

- Any stale test-matrix drift found by this prompt is corrected in the smallest necessary test file(s).
- Full PCC vitest passes.
- `check-types` passes.
- Prettier passes on changed files.
- `git diff --check` passes.
- No production source, Project Home, Documents, analytics, layout, manifest, package, or lockfile changes.
- `pnpm-lock.yaml` md5 remains unchanged.

### BLOCKED

- Prompt 02 closeout commit is not reachable.
- Package/lockfile drift appears.
- Validation fails for reasons outside this prompt's allowed test-matrix scope.
- A required fix would touch prohibited paths.

## Commit Guidance

If no files change, do not create a commit. Report a no-op verification closeout.

If drift is remediated and the user authorizes commit, commit only the changed test files by explicit path. Do not use `git add -A` or `git add .`.

Suggested commit subject if changes are needed:

```text
test(pcc): verify Phase 07 shared-dashboard matrix counts
```

Commit body should mention:

- Prompt 03 matrix drift remediation;
- target Phase 07 counts `2 / 4 / 5 / 5 / 5 / 5`;
- no production source changes;
- Project Home and Document Control preserved;
- no dependency, manifest, package, lockfile, or live-system changes;
- full PCC vitest and check-types results.

## Required Closeout Response

Report using this structure:

```text
HB: Phase 07 Prompt 03 Closeout

Verdict:
- PASS — no edits required / PASS — drift remediated / BLOCKED

Branch / HEAD:
- Branch:
- HEAD:
- Prompt 02 reachable:
- Working tree before:
- Working tree after:

Repo-truth verified:
- Package-solution solution.version:
- Package-solution feature version:
- Webpart manifest version:
- pnpm-lock md5:

Matrix verification:
- PccSurfaceRouter.phase05.test.tsx:
- PccPhase06RegressionCoverage.test.tsx:
- PccPhase07NoRedundantSharedDashboardHeaderCards.test.tsx:
- PccSurfaceNoDuplicateHeader.test.tsx:
- Per-surface analytics tests:

Files changed:
- None / list files

Validation:
- check-types:
- full PCC vitest:
- prettier, if applicable:
- git diff --check:
- pnpm-lock md5 after:

Guardrails:
- Production source modified: yes/no
- Project Home modified: yes/no
- Document Control modified: yes/no
- analytics/layout/models/ui-kit modified: yes/no
- manifests/package/lockfile modified: yes/no
- dependencies installed: yes/no
- live systems touched: yes/no
- Playwright run: yes/no

Proceed / Stop:
- ...
```
