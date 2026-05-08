# Prompt 06 — Phase 03 Closeout and Phase 04 Duplicate-Card Handoff v2

## Mandatory Efficiency Directive

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Role

You are the local code agent executing **Prompt 06 — Phase 03 Closeout and Phase 04 Duplicate-Card Handoff** for PCC Phase 03 / Wave 15A wave-b8.

This is a **documentation-only closeout and handoff prompt**. It must not change runtime source, tests, Playwright behavior, package files, manifests, lockfile, SPFx package-solution files, evidence artifacts, or generated screenshots.

The purpose is to produce the authoritative closeout document for Phase 03 conditional command-header content and a Phase 04 duplicate/header-card removal handoff inventory grounded in current repo truth and hosted Playwright evidence.

---

## Objective

Create a comprehensive Phase 03 closeout document that:

1. Records the final Phase 03 implementation and validation state.
2. Indexes the relevant Prompt 02–05A commits and evidence artifacts.
3. Confirms hosted SharePoint Playwright validation for PCC package `1.0.0.19`.
4. Confirms the shell command header now conditionally renders surface-specific metadata across all eight MVP surfaces.
5. Confirms Phase 03 did **not** remove duplicate/header cards or card-level compatibility markers.
6. Captures the remaining Phase 04 duplicate/header-card extraction and removal inventory.
7. Identifies tests, selectors, evidence, and compatibility markers that Phase 04 must update in lockstep.
8. Records the one known non-blocking hosted-test follow-up from Prompt 05A:
   - `e2e/pcc-live/pcc-live.runtime.spec.ts:94` self-skips because it counts tab markers before `waitForPccRoot()`.

This prompt replaces the earlier narrow “Phase 4 Handoff Inventory” posture. The closeout document must include the handoff inventory, not merely create an inventory file.

---

## Current Baseline to Respect

The repo has advanced beyond the original Prompt 06 package.

Accepted Prompt 05 baseline:

```text
f8d17b9de9d29c8645749d1619fad9278d094a9b
chore(pcc): HB Intel Project Control Center 1.0.0.19
```

Prompt 05A execution reported these commits on top of `f8d17b9de`:

```text
760f7b294 chore(pcc): align package-solution feature version to 1.0.0.19
e313d0561 test(pcc): capture Phase 03 hero markers in PCC live surface smoke
7debd4da4 chore(pcc): hosted Playwright evidence for PCC 1.0.0.19 (wave-15A b8 P05A)
```

Use `git log --oneline --decorate -10` and current repo truth to resolve the full SHAs. If the short SHAs differ, use the full SHAs from the local repo.

Prompt 05A hosted validation reported:

- `pnpm pcc:e2e:live:list`: PASS — 110 tests in 16 files.
- `pnpm pcc:e2e:evidence:registry`: PASS — 8/8.
- `pnpm pcc:e2e:live`: 109 passed / 1 skipped.
- Surface smoke evidence directory:
  - `docs/architecture/evidence/pcc-live/surface-smoke-1778273132756/`
- Auxiliary hosted evidence directories:
  - `docs/architecture/evidence/pcc-live/accessibility-1778273044978/`
  - `docs/architecture/evidence/pcc-live/breakpoints-1778273063597/`
  - `docs/architecture/evidence/pcc-live/conditional-1778273097446/`
  - `docs/architecture/evidence/pcc-live/content-1778273097759/`
  - `docs/architecture/evidence/pcc-live/surface-screenshots-1778273118953/`
  - `docs/architecture/evidence/pcc-live/workflow-1778273133307/`

Hosted evidence proved:

- PCC package `1.0.0.19` validated in tenant.
- All eight surfaces passed hosted surface smoke.
- Shell semantic active-panel ownership:
  - `activePanelOwnerTagName: "MAIN"`
  - `activePanelRole: "tabpanel"`
  - `activePanelId: "pcc-active-surface-panel"`
  - `activePanelIsShellMain: true`
  - `shellActivePanelCount: 1`
- Broad `activePanelCount: 2` remains expected before Phase 04 because one card-level compatibility marker is still present.
- Phase 03 hosted hero metadata markers rendered:
  - `[data-pcc-hero-surface-summary]`
  - `[data-pcc-hero-summary-item]`
  - `[data-pcc-hero-surface-cues]`
  - `[data-pcc-hero-surface-cue]`
  - `[data-pcc-hero-read-only-cue]`
  - `[data-pcc-hero-command-search]`
  - `[data-pcc-command-search-state="preview"]`
- Prompt 02 hosted cue proof:
  - `project-readiness` includes `no-execution`;
  - `external-systems` includes `launch-context`.
- Command-search false-affordance posture passed:
  - input/button/anchor/select/textarea/tabindex0/roleButton all `0`.

Prompt 06 must verify these facts from current repo/evidence artifacts before writing the closeout.

---

## Required First Actions

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline --decorate -10
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Then verify current repo contains Prompt 05A changes:

```bash
git diff --name-status f8d17b9de9d29c8645749d1619fad9278d094a9b..HEAD -- \
  apps/project-control-center/config/package-solution.json \
  tools/spfx-shell/config/package-solution.json \
  e2e/pcc-live/pcc-live.page-object.ts \
  e2e/pcc-live/pcc-live.surface-smoke.spec.ts \
  docs/architecture/evidence/pcc-live
```

Stop and report before editing if:

- branch is not `main`;
- working tree contains uncommitted runtime/source/test/package/manifest/lockfile changes unrelated to this prompt;
- Prompt 05A evidence directory `surface-smoke-1778273132756/` is missing;
- current package-solution versions are not aligned to `1.0.0.19`;
- `pnpm-lock.yaml` changed unexpectedly;
- hosted evidence JSON reports failed surface smoke, missing Phase 03 markers, or command-search false-affordance counts greater than `0`.

Untracked prompt markdown files or forward-planning directories may be classified as pre-existing non-blocking items if they are outside Prompt 06 scope and are not modified.

---

## Files to Inspect

Inspect only the files needed to produce the closeout and handoff inventory.

### Required closeout / evidence files

```text
docs/architecture/evidence/pcc-live/surface-smoke-1778273132756/pcc-live-surface-smoke.json
docs/architecture/evidence/pcc-live/surface-smoke-1778273132756/pcc-live-surface-smoke.md
docs/architecture/evidence/pcc-live/accessibility-1778273044978/
docs/architecture/evidence/pcc-live/breakpoints-1778273063597/
docs/architecture/evidence/pcc-live/conditional-1778273097446/
docs/architecture/evidence/pcc-live/content-1778273097759/
docs/architecture/evidence/pcc-live/surface-screenshots-1778273118953/
docs/architecture/evidence/pcc-live/workflow-1778273133307/
```

Do not edit evidence files.

### Required implementation/test files

```text
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/tests/projectShellViewModel.test.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
e2e/pcc-live/pcc-live.evidence-writer.ts
e2e/pcc-live/pcc-live.env.ts
```

### Required duplicate/header-card candidate files

Find current repo paths before documenting. At minimum inspect the current component files for:

```text
Project Home — PccProjectIntelligenceCard
Documents — PccDocumentsHeaderCard
Team & Access — PccTeamAccessHeaderCard
Project Readiness — ReadinessHeroSlot / HeroCard / readiness top command card
Approvals — HomeCard / Approvals home command card
External Platforms — PccExternalSystemsLaunchPadHeaderCard
External Platforms — PccExternalSystemsHeaderCard if it still exists but is unused/legacy
Control Center Settings — overview / first primary command card
Site Health — PccSiteHealthOverviewCard
```

Use search/grep for exact component names and `dataActiveSurfacePanel`.

Do not edit these files.

---

## Output Path

Create one closeout document here unless current repo truth shows an established `closeout/` file for this exact Phase 03 wave-b8 package:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/closeout/Phase_03_Conditional_Command_Header_Content_Closeout_And_Phase_04_Handoff.md
```

If that directory does not exist, create it.

Do not overwrite unrelated closeout docs. If a closeout file already exists for this exact Phase 03 wave-b8 scope, update it instead of creating a duplicate.

---

## Required Closeout Document Structure

The closeout document must include these sections.

### 1. Objective

State that the document closes Phase 03 conditional command-header content and hands off Phase 04 duplicate/header-card extraction/removal.

### 2. Final Repo Baseline

Include:

- current `HEAD` full SHA;
- branch;
- Prompt 02 / 03 / 04 / 05 / 05A commit inventory with full SHAs where available;
- package baseline:
  - PCC app solution version `1.0.0.19`;
  - PCC app feature version `1.0.0.19`;
  - webpart manifest version `1.0.0.19`;
  - tools/spfx-shell solution version `1.0.0.19`;
  - tools/spfx-shell feature version `1.0.0.19`;
- `pnpm-lock.yaml` MD5.

### 3. Scope Completed

Summarize what Phase 03 completed:

- shell header metadata source-of-truth;
- two added Prompt 02 cues;
- conditional header rendering;
- accessibility / false-affordance hardening;
- responsive hardening across eight modes;
- targeted validation matrix;
- hosted Playwright validation.

### 4. Shell Header Contract

Document final shell/header contract:

- `surfaceHeaderMetadata.ts` remains source-of-truth.
- `deriveShellHeroViewModel` passes metadata through deterministically.
- `PccProjectHeroBand` renders:
  - summary zone;
  - cue zone;
  - read-only cue;
  - command-search preview.
- `PccCommandSearch` remains preview-only / non-interactive.
- `PccShell` owns the semantic active panel through `main[role="tabpanel"]`.

### 5. Hosted Evidence Index

Create a table for all Prompt 05A evidence directories:

| Evidence Path | Purpose | Key Proof | Status |
| ------------- | ------- | --------- | ------ |

Must include the surface-smoke directory and the six auxiliary directories.

### 6. Hosted Surface-Smoke Proof

Create a surface-by-surface table:

| Surface | Hosted Navigation | Shell Main Ownership | Header Markers | Cue IDs | Command Search | Result |
| ------- | ----------------- | -------------------- | -------------- | ------- | -------------- | ------ |

Use the values from `pcc-live-surface-smoke.json`. Do not quote excessive raw JSON.

### 7. Prompt 02 Cue Proof

Document:

- `project-readiness` / `no-execution`
- `external-systems` / `launch-context`

### 8. Validation Summary

Include repo/unit/component validation and hosted validation:

- `check-types`
- app test suite
- `pnpm pcc:e2e:live:list`
- `pnpm pcc:e2e:evidence:registry`
- `pnpm pcc:e2e:live`
- `git diff --check`
- lockfile hash stability

### 9. Package / Manifest / Lockfile Audit

Confirm no Prompt 06 package/lockfile/manifest drift.

Document that preflight alignment was intentional and necessary because the package-solution feature version had to align with solution version before hosted validation.

### 10. Phase 04 Duplicate/Header-Card Handoff Inventory

Create a comprehensive inventory table with these required fields:

| Field                        | Requirement                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| Surface ID                   | Exact `PccMvpSurfaceId`                                                                  |
| User-facing surface          | Current display name                                                                     |
| Component/File               | Exact file path                                                                          |
| Current title/eyebrow        | From repo truth                                                                          |
| Current role                 | Header card, command card, overview card, compatibility marker carrier, state card, etc. |
| Active-surface marker        | Whether it uses `dataActiveSurfacePanel`                                                 |
| Header content already moved | What Phase 03 now covers                                                                 |
| Header content still missing | What remains to extract before removal/demotion                                          |
| Operational content to keep  | Content that should remain as bento operational content                                  |
| Content to remove/demote     | Candidate Phase 04 removal/demotion                                                      |
| Test/selector risks          | Unit, integration, Playwright, evidence, broad-selector risks                            |
| Recommended Phase 04 action  | Remove, demote, split, replace, or retain                                                |
| Risk if removed too early    | Layout, test, selector, evidence, product, or SoR risk                                   |

Inventory these candidates at minimum:

```text
project-home — PccProjectIntelligenceCard
documents — PccDocumentsHeaderCard
team-and-access — PccTeamAccessHeaderCard
project-readiness — ReadinessHeroSlot / HeroCard / top command card
approvals — HomeCard / Approvals home command card
external-systems — PccExternalSystemsLaunchPadHeaderCard
external-systems — PccExternalSystemsHeaderCard if still present
control-center-settings — overview / first primary command card
site-health — PccSiteHealthOverviewCard
```

If repo truth identifies additional duplicate/header-like cards, include them.

### 11. Phase 04 Removal / Demotion Sequence

Recommend a sequenced Phase 04 prompt plan. Include at least:

1. Phase 04 P00 — repo/evidence baseline and selector contract audit.
2. Phase 04 P01 — Project Home duplicate-card disposition.
3. Phase 04 P02 — Documents + Team & Access duplicate-card disposition.
4. Phase 04 P03 — External Platforms duplicate-card disposition.
5. Phase 04 P04 — Settings + Site Health duplicate-card disposition.
6. Phase 04 P05 — Readiness + Approvals duplicate-card disposition.
7. Phase 04 P06 — card-level compatibility marker cleanup.
8. Phase 04 P07 — unit/integration selector update.
9. Phase 04 P08 — hosted Playwright evidence refresh.

For each row include:

| Prompt | Objective | Expected files | Hard stops | Validation |
| ------ | --------- | -------------- | ---------- | ---------- |

### 12. Tests / Selectors to Revisit in Phase 04

Must cover:

- unit/component tests impacted by removing duplicate cards;
- `PccApp.bentoIntegration.test.tsx`;
- `PccCardTierContract.test.tsx`;
- `PccSurfaceCommandCardContract.test.tsx`;
- `PccShell.surfaceSmoke.test.tsx`;
- `PccShell.responsive.test.tsx`;
- live Playwright page object selectors;
- evidence writer schema;
- broad `[data-pcc-active-surface-panel]` count assumptions;
- screenshot/evidence expectations.

### 13. Hard Stops for Phase 04

Explicitly state:

- Do not remove operational content without a replacement destination.
- Do not remove card-level compatibility markers until tests and Playwright selectors are updated.
- Do not force broad active-panel count to `1` until duplicate/header cards are actually removed.
- Do not remove duplicate cards without hosted evidence refresh.
- Do not implement live writeback, command routing, active module state, or full Modules launcher inside duplicate-card removal.
- Do not edit historical evidence directories.
- Do not alter package/manifest/lockfile unless a hosted tenant package refresh is explicitly required and approved.

### 14. Residual Issues / Follow-Ups

Include:

- `e2e/pcc-live/pcc-live.runtime.spec.ts:94` skip/race:
  - root cause: marker count before `waitForPccRoot()`;
  - severity: non-blocking;
  - recommended fix: small future test-hardening prompt.
- Any stale comments discovered during inspection.
- Any operational-content questions that Phase 04 must resolve before removal.

### 15. Final Closeout Recommendation

State whether Phase 03 is closed and whether Phase 04 is ready for planning.

The expected final recommendation is:

```text
Phase 03 may be closed. Phase 04 may proceed to planning and prompt-package generation, with duplicate/header-card removal gated by the handoff inventory, selector updates, and refreshed hosted Playwright evidence.
```

Only change this if repo truth contradicts it.

---

## Explicitly Prohibited

Do **not**:

- remove, demote, rename, reorder, or modify runtime duplicate/header cards;
- edit Project Home, Documents, Team & Access, Readiness, Approvals, External Platforms, Settings, or Site Health runtime composition;
- edit `PccProjectHeroBand`, `PccShell`, `PccCommandSearch`, `PccHorizontalTabs`, `PccDashboardCard`, `PccBentoGrid`, or layout primitives;
- edit tests or Playwright specs;
- edit evidence artifacts or screenshots;
- edit package files, lockfile, SPFx package-solution, or manifests;
- run live Playwright unless explicitly requested after this prompt;
- create a Phase 04 implementation prompt package;
- claim final Phase 04 readiness to remove cards without the Phase 04 P00 audit.

---

## Validation

Because Prompt 06 is documentation-only, run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec prettier --check <changed-closeout-doc>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If the closeout doc requires formatting correction, run Prettier only on the changed closeout doc:

```bash
pnpm exec prettier --write <changed-closeout-doc>
pnpm exec prettier --check <changed-closeout-doc>
git diff --check
```

Do not run broad repo Prettier.

If runtime/source/test/evidence/package files changed unexpectedly, stop and report the exact paths. Do not continue.

---

## Required Completion Response

```markdown
## Prompt 06 Complete

## Closeout Document Path

## Files Changed

- Expected: one closeout markdown file only.

## Final Phase 03 Baseline

- HEAD:
- Package version:
- Hosted evidence directory:
- Lockfile hash:

## Hosted Evidence Included

- Surface smoke:
- Accessibility:
- Breakpoints:
- Conditional:
- Content:
- Surface screenshots:
- Workflow:

## Phase 03 Closeout Summary

- Shell/header contract:
- Metadata/cue contract:
- A11y/responsive contract:
- Hosted validation result:
- Package/source drift result:

## Phase 04 Handoff Summary

- Duplicate/header-card candidates:
- Highest-risk removals:
- First recommended Phase 04 prompt:
- Tests/selectors requiring update:

## Residual Follow-Ups

- Runtime spec skip/race:
- Other:

## Validation Results

- `git status --short` before:
- `md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml` before:
- `prettier --check <changed-closeout-doc>`:
- `git diff --check`:
- lockfile hash after:
- `git status --short` after:

## Package / Lockfile / Manifest Audit

- Confirm unchanged by Prompt 06.

## Phase 03 Closeout Recommendation

- State whether Phase 03 is closed.
- State whether Phase 04 may proceed to planning.
```
