# Updated Prompt 06 — Targeted Validation and Phase 2 Closeout

## Objective

Run final targeted and full validation for Wave 15A wave-b7 Phase 2 shell-header consolidation, verify the final repo baseline after Prompts 01–05, and produce a reproducible closeout package that accurately reflects the current state of `main`.

This prompt replaces the original Prompt 06 because the original closeout assumptions are now stale:

- Prompt 05 has landed live Playwright shell active-panel evidence posture.
- Live tenant smoke has run and the evidence package has been committed.
- `apps/project-control-center/config/package-solution.json` and the webpart manifest are intentionally at `1.0.0.18`.
- The closeout must no longer state “no package/manifest drift” in absolute terms. It must state “no unexpected package/manifest drift beyond the intentional 1.0.0.18 version baseline.”
- Duplicate bento header cards remain in place and are deferred to the next remediation phase; do not remove them here.

## Mandatory Opening Instruction

Before making any changes, confirm you are operating on the current repo state.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Scope Control

This is a validation and closeout prompt.

Do not:

- edit production application source;
- remove duplicate bento header cards;
- remove or demote card-level `dataActiveSurfacePanel` / `data-pcc-active-surface-panel` compatibility markers;
- change Playwright behavior unless validation reveals a directly related defect and you stop to report first;
- change package dependencies;
- run `pnpm install`, `pnpm add`, or any lockfile-changing command;
- modify `pnpm-lock.yaml`;
- modify SPFx manifests, package-solution files, or `.sppkg` files;
- create new live evidence artifacts unless the user explicitly requests a new evidence run;
- commit traces, videos, raw reports, screenshots, storage state, HARs, or auth artifacts;
- broadly format unrelated files;
- claim final scorecard EV capture beyond what the committed evidence actually supports.

## Required Repo-Truth Checks Before Any Edit

### 1. Confirm local status and exact baseline

Run:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Report:

- branch;
- HEAD SHA;
- dirty files;
- lockfile hash;
- whether there are untracked artifacts;
- whether any dirty/untracked item is outside closeout scope.

Hard stop if there are unexpected dirty files in:

```text
apps/project-control-center/src/**/*
e2e/pcc-live/**/*
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/**/manifest.json
package.json
pnpm-lock.yaml
playwright-report/**/*
test-results/**/*
**/.auth/**/*
**/.e2e-auth/**/*
**/*storage-state*
**/*trace*
**/*video*
**/*.har
```

Historical committed evidence under `docs/architecture/evidence/pcc-live/surface-smoke-1778249836440/` is expected. New untracked evidence is not expected unless the user requested a new live run.

### 2. Confirm commit sequence and closeout inventory

Verify the relevant commits are present on the current branch, using `git log --oneline --decorate --max-count=30` and targeted `git show --stat --oneline <sha>` where needed.

Expected important commits:

```text
1155470cd32add1fa4b900a637f82ee7bc57b0a1  refactor(pcc): shell <main> owns active-surface panel marker (wave-b7 P01)
c7eeb1734bb1cd98a52f91c83daa05240d66a9fb  feat(pcc): shell hero surface metadata seam (wave-b7 P02)
dc8cc9f42656e63539dcfe841c7c5340b4b38e52  test(pcc): active-tab metadata switching + contract floor (wave-b7 P03)
b15741255f0b9eba2bb1370bb25886451b2f5dac  test(pcc): all-surface direct-child guardrail (wave-b7 P04)
e1775117246cc35b22bd9653afb061920c51e039  test(pcc-live): shell active-panel evidence posture (wave-b7 P05)
113d655e6358f51f81128caf9cc7dedd7908dcb6  chore(pcc): align feature.version with solution.version (1.0.0.18)
a350603a77c813f4a4166cbfe27b7206870baad1  docs(pcc-live): add surface smoke evidence package 1.0.0.18
```

Also note commit `493fa4de6f917c5fb1fcfe558fb5d9597021484d` if it is in the branch history because it introduced the Phase 03 command-header package v2 and bumped package/manifest versions to `1.0.0.18`.

If any expected commit is absent, stop and report before creating closeout documentation.

### 3. Confirm shell active-panel ownership

Inspect:

```text
apps/project-control-center/src/shell/PccShell.tsx
```

Confirm:

- `ACTIVE_PANEL_ID` equals `pcc-active-surface-panel`;
- `PccHorizontalTabs` receives `panelId={ACTIVE_PANEL_ID}`;
- shell `<main>` has:
  - `id={ACTIVE_PANEL_ID}`;
  - `role="tabpanel"`;
  - `aria-labelledby={`pcc-tab-${activeSurfaceId}`}`;
  - `data-pcc-canvas=""`;
  - `data-pcc-active-surface-panel={activeSurfaceId}`;
- `<PccBentoGrid>` remains a child of shell `<main>`.

### 4. Confirm active-panel compatibility bridge

Inspect:

```text
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
```

Confirm:

- tests resolve semantic active-panel ownership through `main[role="tabpanel"][data-pcc-active-surface-panel="<surfaceId>"]`;
- compatibility card assertions scope to direct bento children:
  ```text
  [data-pcc-bento-grid] > [data-pcc-card][data-pcc-active-surface-panel="<surfaceId>"]
  ```
- no shell-rendered test asserts broad global `[data-pcc-active-surface-panel]` count equals `1`;
- `PccApp.bentoIntegration.test.tsx` iterates all `PCC_MVP_SURFACE_IDS`;
- all eight active surfaces are covered for:
  - exactly one shell active panel;
  - no nested `[data-pcc-card] [data-pcc-card]`;
  - every card direct child of bento grid;
  - exactly one direct bento-child compatibility card.

### 5. Confirm shell hero metadata seam

Inspect:

```text
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/tests/projectShellViewModel.test.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

Confirm:

- `PCC_SHELL_SURFACE_HEADER_METADATA` covers all eight `PccMvpSurfaceId` values;
- `IPccShellHeroViewModel` includes:
  - `surfaceSummaryItems`;
  - `surfaceCues`;
  - `readOnlyCue`;
- `deriveShellHeroViewModel` derives metadata from active surface id;
- `PccProjectHeroBand` renders:
  - `data-pcc-hero-surface-summary`;
  - `data-pcc-hero-summary-item`;
  - `data-pcc-hero-summary-tone`;
  - `data-pcc-hero-surface-cues`;
  - `data-pcc-hero-surface-cue`;
  - `data-pcc-hero-read-only-cue`;
- metadata rendering remains inert and non-interactive;
- Project Home, Documents, and Site Health active-tab metadata switching tests exist;
- all-eight metadata contract floor exists.

### 6. Confirm Playwright evidence posture

Inspect:

```text
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.evidence-writer.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
docs/architecture/evidence/pcc-live/surface-smoke-1778249836440/pcc-live-surface-smoke.json
docs/architecture/evidence/pcc-live/surface-smoke-1778249836440/pcc-live-surface-smoke.md
```

Confirm:

- broad compatibility selector remains:
  ```text
  [data-pcc-active-surface-panel="<surfaceId>"]
  ```
- shell-specific selector exists:
  ```text
  main[role="tabpanel"][data-pcc-active-surface-panel="<surfaceId>"]
  ```
- `PccLiveSurfaceSmokeResult` includes:
  - `activePanelCount`;
  - `activePanelOwnerTagName`;
  - `activePanelRole`;
  - `activePanelId`;
  - `activePanelIsShellMain`;
  - `shellActivePanelFound`;
  - `shellActivePanelCount`;
- live smoke `passed` logic remains compatibility-based and does not hard-fail solely because shell-main evidence is missing;
- Markdown evidence includes active-panel owner/shell columns;
- sanitizer tests still guard unsafe artifact/auth/storage/token leakage;
- committed live evidence shows:
  - `totalSurfaces: 8`;
  - `passedSurfaces: 8`;
  - `failedSurfaces: 0`;
  - `consoleErrorCount: 0`;
  - `pageErrorCount: 0`;
  - every surface has `activePanelOwnerTagName: "MAIN"`;
  - every surface has `activePanelRole: "tabpanel"`;
  - every surface has `activePanelId: "pcc-active-surface-panel"`;
  - every surface has `activePanelIsShellMain: true`;
  - every surface has `shellActivePanelCount: 1`;
  - every surface has `activePanelCount: 2`;
  - no warnings.

Record the known caveat:

```text
The committed evidence label is expectedPackageVersion 1.0.0.18. Operator notes indicate the deployed tenant package observed at runtime may still be 1.0.0.17. The DOM evidence is substantive proof of shell ownership; the expectedPackageVersion label is local source-derived evidence metadata.
```

### 7. Confirm package / manifest / lockfile baseline

Inspect:

```text
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
pnpm-lock.yaml
package.json
```

Confirm:

- `package-solution.json` `solution.version` is `1.0.0.18`;
- `package-solution.json` `solution.features[0].version` is `1.0.0.18`;
- webpart manifest `version` is `1.0.0.18`;
- `pnpm-lock.yaml` hash remains unchanged from expected baseline:
  ```text
  00570e10e3dc9015188ba503ea996943
  ```
- no package dependency changes are present.

Important closeout wording:

- Do **not** say “no package/manifest drift” without qualification.
- Say:
  ```text
  Package/manifest baseline is intentionally 1.0.0.18 after committed version-alignment work. No additional package, manifest, package-solution, dependency, or lockfile drift was introduced during Prompt 06.
  ```

## Expected Files

Expected closeout documentation file:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b7/closeout/Phase_2_Shell_Header_Consolidation_Closeout.md
```

Create the parent directory if needed.

Expected source edits: **none**.

Optional: no additional file unless validation proves a minor closeout documentation issue.

Do not edit:

```text
apps/project-control-center/src/**/*
e2e/pcc-live/**/*
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/**/manifest.json
package.json
pnpm-lock.yaml
docs/architecture/evidence/pcc-live/surface-smoke-1778249836440/**/*
```

## Closeout Document Requirements

Create `Phase_2_Shell_Header_Consolidation_Closeout.md` with these sections:

```markdown
# Phase 2 Shell Header Consolidation Closeout

## 1. Objective

## 2. Final Repo Baseline

## 3. Commit Inventory

## 4. Scope Completed

## 5. Shell Active-Panel Ownership Proof

## 6. Shell Hero Metadata Proof

## 7. Direct-Child / No-Nested-Card Proof

## 8. Playwright / Live Evidence Proof

## 9. Package / Manifest / Lockfile Baseline

## 10. Compatibility Bridge Status

## 11. Deferred Work / Phase 3 Handoff

## 12. Validation Commands

## 13. Residual Risks
```

### Section-specific content requirements

#### 1. Objective

State that Phase 2 consolidated semantic active-surface ownership and compact surface header metadata into the shell/header layer while preserving bento cards and compatibility markers.

#### 2. Final Repo Baseline

Include:

- branch;
- HEAD SHA;
- final `git status --short`;
- lockfile hash;
- package-solution version;
- webpart manifest version.

#### 3. Commit Inventory

List all relevant commits with SHA and purpose:

- `1155470...` Prompt 01 shell active-panel owner;
- `c7eeb17...` Prompt 02 shell hero metadata seam;
- `dc8cc9f...` Prompt 03 metadata switching / contract floor;
- `b157412...` Prompt 04 all-surface direct-child guardrail;
- `e177511...` Prompt 05 Playwright shell active-panel evidence posture;
- `113d655...` version alignment;
- `a350603...` live evidence package;
- `493fa4d...` Phase 03 command-header package v2 / package-manifest bump if present on branch.

#### 4. Scope Completed

Summarize:

- shell `<main>` now owns semantic active-panel marker;
- tab clicks update shell marker and `aria-labelledby`;
- shell hero metadata exists and switches by surface;
- tests distinguish shell ownership from card compatibility marker;
- all active surfaces have full-app direct-child/no-nested-card guardrail;
- Playwright evidence records shell ownership without hard-gating tenant lag;
- live evidence committed.

#### 5. Shell Active-Panel Ownership Proof

Include exact selectors and files:

- `apps/project-control-center/src/shell/PccShell.tsx`;
- `main[role="tabpanel"][data-pcc-active-surface-panel="<surfaceId>"]`;
- `aria-labelledby="pcc-tab-<surfaceId>"`.

#### 6. Shell Hero Metadata Proof

Reference:

- `surfaceHeaderMetadata.ts`;
- `projectShellViewModel.ts`;
- `PccProjectHeroBand.tsx`;
- tests for all eight surfaces and Project Home/Documents/Site Health switching.

#### 7. Direct-Child / No-Nested-Card Proof

Reference:

- `PccApp.bentoIntegration.test.tsx`;
- `PccCardTierContract.test.tsx`;
- all eight `PCC_MVP_SURFACE_IDS`;
- direct-child card invariant;
- no nested `[data-pcc-card] [data-pcc-card]`.

#### 8. Playwright / Live Evidence Proof

Reference:

```text
docs/architecture/evidence/pcc-live/surface-smoke-1778249836440/pcc-live-surface-smoke.json
docs/architecture/evidence/pcc-live/surface-smoke-1778249836440/pcc-live-surface-smoke.md
```

State:

- 8/8 surfaces passed;
- 0 console errors;
- 0 page errors;
- all eight surfaces show shell owner:
  - `MAIN`;
  - `tabpanel`;
  - `pcc-active-surface-panel`;
  - `activePanelIsShellMain: true`;
  - `shellActivePanelCount: 1`;
  - `activePanelCount: 2`;
- no warnings.

Also include the package-version label caveat.

#### 9. Package / Manifest / Lockfile Baseline

State:

- package-solution solution and feature version are `1.0.0.18`;
- webpart manifest version is `1.0.0.18`;
- this is intentional committed baseline, not Prompt 06 drift;
- lockfile MD5 remains `00570e10e3dc9015188ba503ea996943`;
- no package dependency changes.

#### 10. Compatibility Bridge Status

State:

- shell main is semantic owner;
- card-level marker remains one direct bento-child compatibility marker per active surface;
- broad marker count is expected to be `2` in Phase 2 posture:
  - shell `main`;
  - direct bento-child compatibility card;
- do not remove card marker until the later duplicate-card/removal phase updates tests, e2e selectors, and evidence in lockstep.

#### 11. Deferred Work / Phase 3 Handoff

List:

- duplicate bento header/top-level cards remain intentionally;
- card-level active-panel compatibility marker remains intentionally;
- next phase should handle conditional command-header content / duplicate-card removal;
- update Playwright/evidence selectors when card markers are demoted/removed;
- consider future evidence writer improvement to store artifact paths as repo-relative rather than absolute local paths;
- stale `PccCardTierContract.test.tsx` top-of-file comment about `project-readiness` exclusion remains a minor cleanup when that file is next touched.

#### 12. Validation Commands

Record each command run and result.

#### 13. Residual Risks

Include:

- expectedPackageVersion evidence label caveat;
- committed evidence is baseline EV-52 / EV-55 evidence only, not final scorecard result;
- card compatibility marker removal remains pending;
- any dirty files/untracked files if present.

## Validation Required

Run and report these commands exactly:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
pnpm exec prettier --check apps/project-control-center/src/shell apps/project-control-center/src/preview/projectShellViewModel.ts apps/project-control-center/src/tests/PccShell.responsive.test.tsx apps/project-control-center/src/tests/PccCardTierContract.test.tsx apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx e2e/pcc-live/pcc-live.page-object.ts e2e/pcc-live/pcc-live.surfaces.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts e2e/pcc-live/pcc-live.evidence-writer.ts docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b7/closeout/Phase_2_Shell_Header_Consolidation_Closeout.md
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If live Playwright env/auth are unavailable, the two live tests should self-skip and the non-live tests should still run. Report self-skip honestly.

If the live surface-smoke spec already ran successfully after Prompt 05 and no source/e2e/evidence files changed since, it is still acceptable to rerun it during closeout. Do not generate a new evidence directory unless the user explicitly requests a fresh live evidence artifact.

If Prettier fails only on the closeout doc, run:

```bash
pnpm exec prettier --write docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b7/closeout/Phase_2_Shell_Header_Consolidation_Closeout.md
```

Then rerun:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
pnpm exec prettier --check docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b7/closeout/Phase_2_Shell_Header_Consolidation_Closeout.md
git diff --check
```

Do not run `pnpm install`, `pnpm add`, or any command that intentionally changes the lockfile.

## Required Plan Response Format

Before execution, respond with:

```markdown
## Objective

## Repo-Truth Checks Performed

## Files Proposed

## Closeout Document Plan

## Validation Plan

## Package / Lockfile / Manifest Baseline

## Risks / Open Items
```

## Required Following-Execution Response Format

After execution, respond with:

```markdown
## Objective

## Repo-Truth Checks Performed

## Files Changed

## What Changed

## Phase 2 Closeout Proof

## Validation Run

## Playwright / Live Evidence Status

## Package / Lockfile / Manifest Baseline

## Compatibility Bridge / Phase 3 Handoff

## Residual Risks

## Next Prompt Status
```

## Completion Standard for Prompt 06

Prompt 06 is complete only when:

- final closeout doc is created at the expected path;
- closeout doc reflects current repo truth after Prompts 01–05, version alignment, and committed live evidence;
- shell `<main role="tabpanel">` ownership is documented;
- shell hero metadata seam is documented;
- direct-child/no-nested-card guardrail is documented;
- Playwright shell-owner evidence posture and committed live evidence are documented;
- package/manifest baseline is stated as intentional `1.0.0.18`;
- lockfile hash remains unchanged;
- no production app source is edited;
- no e2e behavior is edited;
- no package/manifest/package-solution/lockfile files are edited;
- duplicate bento header cards remain deferred;
- card-level compatibility marker remains deferred;
- validation commands pass or any skipped live checks are explicitly explained.
