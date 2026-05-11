# PCC Phase 07 — Claude Code Opus 4.7 Execution Prompt

## Prompt 00 — Pre-Edit Repo-Truth and Evidence Gate

## Required Operating Mode

You are executing inside the `RMF112018/hb-intel` repo as a local code agent using Claude Code with Opus 4.7.

This prompt is a **pre-edit gate** for:

```text
PCC Phase 07 — Cross-Surface Operational Realignment and Phase 05 Remediation
```

Your job in this prompt is to verify the current repo truth, Phase 06 evidence baseline, version/dependency posture, and shared-dashboard regression state **before any Phase 07 implementation edits begin**.

Do not modify production source, tests, package files, lockfiles, evidence artifacts, or documentation during this prompt. This gate is read-only.

If repo truth differs from this prompt, stop and report the mismatch. Do not force stale instructions onto the repo.

---

## Non-Negotiable Rules

- Work only inside the local `RMF112018/hb-intel` repo.
- Do not make broad, unfocused repo scans.
- Do not re-read files that are still within your current context or memory unless you need to verify drift or inspect a specific changed section.
- Prefer targeted file reads and targeted searches.
- Do not install dependencies.
- Do not run `pnpm add`, `npm install`, `yarn add`, or dependency update commands.
- Do not add or import `echarts-for-react`.
- Do not mutate tenant systems, Procore, Sage, SharePoint, or any live external system.
- Do not introduce command-model behavior, approval execution, source-system mutation, sync execution, or autonomous HBI decisioning.
- Do not render developer/internal copy in the UI.
- Do not change Project Home behavior.
- Do not change Document Control behavior.
- Do not change the bento direct-child invariant.
- Do not change shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]` ownership.
- Do not stage files.
- Do not commit files.
- Do not create a package, deploy to tenant, or generate live evidence in this prompt.

---

## Phase 07 Baseline to Verify

Expected starting posture:

```text
Default branch: main
Expected current main / Phase 06 evidence HEAD: e6886489bb4f85d32840f69914dfb3b615f28aaf
Prior Phase 06 closeout commit: 4c772ac3c8e48c46bb5f5bdb108fb53b1b51bb7a
PCC solution.version: 1.0.0.218
PCC solution.features[0].version: 1.0.0.218
pnpm-lock.yaml md5: 7c19ccfa8718a42f7f55ce178a626996
```

Expected Phase 06 evidence roots:

```text
docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/
docs/architecture/evidence/pcc-live/surface-smoke-1778491135146/
```

Expected Phase 06 live surface card-count baseline:

```text
project-home: 18
documents: 5
core-tools: 3
estimating-preconstruction: 5
startup-closeout: 6
project-controls: 6
cost-time: 6
systems-administration: 6
total live cards: 55
```

Expected Phase 07 target after later prompts, not during this gate:

```text
core-tools: 2
estimating-preconstruction: 4
startup-closeout: 5
project-controls: 5
cost-time: 5
systems-administration: 5
```

During Prompt 00, confirm whether the Phase 05 regression is still present. Do not remediate it in this prompt.

---

## Phase 07 Objective to Carry Forward

Phase 07 must remove and permanently block the Phase 05 regression where redundant top-level Dashboard/title-description bento cards returned on the six shared primary-dashboard pages:

```text
Core Tools
Estimating & Preconstruction
Project Startup & Closeout
Project Controls
Cost & Time
Systems Administration
```

Runtime tab IDs:

```text
core-tools
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

Preserved / non-remediation surfaces:

```text
project-home
documents
```

Project Home must preserve Phase 06 operational choreography, gateways, analytics, read-model behavior, and evidence-critical behavior.

Document Control must remain routed to its specialized `PccDocumentsSurface` and must not be moved into `PccPrimaryDashboardSurface`.

---

## Target Files to Inspect

Use targeted reads only. Do not scan the repo broadly unless a path has drifted.

```text
apps/project-control-center/config/package-solution.json
apps/project-control-center/package.json
pnpm-lock.yaml
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/PHASE_06_PLAYWRIGHT_CLOSEOUT.md
docs/architecture/evidence/pcc-live/surface-smoke-1778491135146/pcc-live-surface-smoke.md
```

If a file path has drifted, search only for the exact filename or nearest stable term. Example targeted searches:

```bash
git ls-files | grep 'PccPrimaryDashboardSurface.tsx'
git ls-files | grep 'PccSurfaceRouter.phase05.test.tsx'
git ls-files | grep 'PccPhase06RegressionCoverage.test.tsx'
git ls-files | grep 'PHASE_06_PLAYWRIGHT_CLOSEOUT.md'
git ls-files | grep 'pcc-live-surface-smoke.md'
```

---

## Commands to Run

Run these commands before reading source files:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse --short HEAD
git log --oneline -12
git merge-base HEAD main
git merge-base --is-ancestor 4c772ac3c8e48c46bb5f5bdb108fb53b1b51bb7a HEAD && echo "4c772ac3 reachable" || echo "4c772ac3 NOT reachable"
git merge-base --is-ancestor e6886489bb4f85d32840f69914dfb3b615f28aaf HEAD && echo "e6886489 reachable" || echo "e6886489 NOT reachable"
git diff --stat
git diff --name-only
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
cat apps/project-control-center/config/package-solution.json
cat apps/project-control-center/package.json
```

If `HEAD` is not `e6886489bb4f85d32840f69914dfb3b615f28aaf`, classify the drift:

```text
- Ahead of expected baseline with local / branch changes.
- Behind expected baseline.
- Diverged from expected baseline.
- On a non-main working branch but containing both expected Phase 06 commits.
```

Do not treat any drift as acceptable without reporting it.

---

## Required Repo-Truth Checks

Confirm and report the following.

### 1. Branch / HEAD / Cleanliness

- Current branch.
- Current full HEAD SHA.
- Current short HEAD SHA.
- Whether working tree is clean.
- Whether any untracked files are present.
- Whether any modified/staged files are present.
- Whether `git diff --stat` is empty before edits.
- Whether `git diff --name-only` is empty before edits.

If untracked or modified files exist, identify them and classify:

```text
- operator-known evidence / prompt artifacts;
- likely unrelated local work;
- potential blocker.
```

Do not delete or clean files in Prompt 00.

### 2. Commit Reachability

- Whether `4c772ac3c8e48c46bb5f5bdb108fb53b1b51bb7a` is reachable from HEAD.
- Whether `e6886489bb4f85d32840f69914dfb3b615f28aaf` is reachable from HEAD.
- Whether `HEAD` equals `e6886489bb4f85d32840f69914dfb3b615f28aaf`.
- If HEAD is not `e6886489...`, whether the difference is expected and safe for Phase 07.

### 3. Version / Package Posture

From `apps/project-control-center/config/package-solution.json`, report:

- `solution.name`
- `solution.version`
- `solution.features[0].title`
- `solution.features[0].version`
- `paths.zippedPackage`

Expected:

```text
solution.version: 1.0.0.218
solution.features[0].version: 1.0.0.218
paths.zippedPackage: solution/hb-intel-project-control-center.sppkg
```

### 4. Lockfile / Dependency Posture

Report:

- Current `pnpm-lock.yaml` md5.
- Whether it matches `7c19ccfa8718a42f7f55ce178a626996`.
- Whether `apps/project-control-center/package.json` declares `echarts`.
- Whether `apps/project-control-center/package.json` declares `echarts-for-react` in any dependency bucket.
- Whether any dependency install or lockfile mutation occurred during this prompt.

Expected:

```text
echarts present: yes, ^5.6.0
echarts-for-react present: no
lockfile md5 unchanged: yes
```

### 5. Shared Dashboard Regression Status

Inspect `apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx`.

Confirm whether this generic top-level card pattern is still present:

```tsx
<PccDashboardCard
  footprint="hero"
  hierarchy="primary"
  tier="tier1"
  region="command"
  eyebrow="Dashboard"
  title={tab.dashboardTitle}
>
  <p className={styles.overviewBody}>{tab.dashboardDescription}</p>
  ...
</PccDashboardCard>
```

Report:

- Whether `eyebrow="Dashboard"` is present.
- Whether `title={tab.dashboardTitle}` is present.
- Whether `tab.dashboardDescription` is rendered in the card body.
- Whether `footprint="hero"`, `tier="tier1"`, and `region="command"` are present on that first shared-dashboard card.
- Whether `PRIMARY_TAB_POSTURE_NOTE['cost-time']` currently places the Sage cue inside that generic first card.
- Whether `Module status` currently renders after that generic first card.
- Whether `renderPrimaryDashboardAnalytics(activePrimaryTabId)` currently renders after `Module status`.
- Whether `Selected module` remains present.

Classify the regression:

```text
Shared Dashboard Regression Status: Present / Absent / Ambiguous
```

Expected at Prompt 00 baseline:

```text
Present
```

### 6. Current Test Expectations

Inspect `apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx` and `apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx`.

Report current expected direct-card counts for the shared primary dashboards.

Expected Prompt 00 baseline:

```text
core-tools: 3
estimating-preconstruction: 5
startup-closeout: 6
project-controls: 6
cost-time: 6
systems-administration: 6
```

Also report whether tests currently describe those counts as:

```text
hero + Module status + analytics + Selected module
```

This confirms the tests still encode the duplicate generic hero card and must be updated in later prompts.

### 7. Phase 06 Evidence Baseline

Inspect:

```text
docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/PHASE_06_PLAYWRIGHT_CLOSEOUT.md
docs/architecture/evidence/pcc-live/surface-smoke-1778491135146/pcc-live-surface-smoke.md
```

Confirm:

- Expected package version `1.0.0.218`.
- Surface smoke run completed.
- 8/8 surfaces passed.
- Total live cards: 55.
- `core-tools`: 3.
- `documents`: 5.
- `estimating-preconstruction`: 5.
- `startup-closeout`: 6.
- `project-controls`: 6.
- `cost-time`: 6.
- `systems-administration`: 6.
- Active panel owner: `MAIN role=tabpanel`.
- Console errors: 0.
- Page errors: 1.
- Evidence caveats / operator-pending items, especially screenshot review or page-error caveat.

Do not edit evidence artifacts.

---

## Drift / Blocker Rules

Return `Blocked` if any of the following is true:

- Expected Phase 06 commits are not reachable from HEAD.
- `solution.version` or `solution.features[0].version` differs from `1.0.0.218` without operator-provided authorization.
- `pnpm-lock.yaml` md5 differs from `7c19ccfa8718a42f7f55ce178a626996` before edits without operator-provided authorization.
- `echarts-for-react` is declared in `apps/project-control-center/package.json`.
- The shared-dashboard regression is absent and the later Phase 07 remediation prompts would be stale.
- Project Home or Documents already appear to have been refactored into the shared dashboard unexpectedly.
- There are unexplained modified/staged files that overlap Phase 07 source/test/evidence paths.

Return `Drift Requires Operator Decision` if:

- HEAD is ahead of the expected baseline but appears intentionally advanced.
- There are operator-known untracked artifacts that do not overlap Phase 07 edit paths.
- Evidence artifacts are present but differ in path naming or timestamp.
- The regression is ambiguous because the component has been partially changed.

Return `Ready` only if:

- Phase 06 baseline is reachable and coherent.
- Version/dependency/lockfile posture matches expected baseline.
- The shared-dashboard regression is confirmed present.
- Existing tests still encode the pre-remediation card counts.
- Working tree cleanliness is acceptable for proceeding.
- No source/test/evidence files were modified during Prompt 00.

---

## Required Output Format

Return a concise but complete report in this exact structure:

```text
HB: Phase 07 Prompt 00 Repo-Truth Gate

Verdict:
- Ready / Blocked / Drift Requires Operator Decision

Branch / HEAD:
- Branch:
- HEAD:
- Expected baseline equality:
- Phase 06 commit reachability:

Working Tree:
- Status:
- Diff stat:
- Untracked / modified files:
- Operator-known items:

Version / Dependency Posture:
- solution.version:
- solution.features[0].version:
- pnpm-lock.yaml md5:
- echarts:
- echarts-for-react:

Phase 06 Evidence Baseline:
- Evidence roots reviewed:
- Surface-smoke status:
- Card-count baseline:
- Console/page errors:
- Evidence caveats:

Shared Dashboard Regression Status:
- Present / Absent / Ambiguous
- Evidence:
- Sage cue current location:
- Current first card:
- Current second card:

Current Test Expectations:
- PccSurfaceRouter.phase05.test.tsx:
- PccPhase06RegressionCoverage.test.tsx:
- Tests requiring later update:

Proceed / Do Not Proceed:
- Decision:
- Reason:
- Next prompt to run if Ready:
```

---

## Acceptance Criteria

This prompt passes only if:

- The repo is clean or only has operator-known untracked files.
- Current HEAD and Phase 06 commit reachability are explicitly reported.
- The lockfile md5 is recorded and compared to the expected baseline.
- The package version posture is explicitly reported.
- The `echarts` / `echarts-for-react` dependency posture is explicitly reported.
- The shared dashboard top-card regression is confirmed present or explicitly classified absent/ambiguous.
- Current shared-dashboard test card-count expectations are reported.
- Phase 06 evidence roots are reviewed and summarized.
- No files are modified.
- No dependencies are installed.
- No package is built.
- No live evidence is generated.
- No tenant or external source system is touched.
