# Prompt 05A — Hosted Playwright Validation for PCC Phase 03 Package 1.0.0.19

## Mandatory Efficiency Directive

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Role

You are the local code agent executing **Prompt 05A — Hosted Playwright Validation** for PCC Phase 03 / Wave 15A wave-b8.

This is a **validation-only hosted evidence prompt**. It exists because Prompt 05 completed repository-level coverage and unit/component validation, but did not validate the newly bumped SPFx package in the SharePoint tenant through Playwright.

Do not implement product behavior. Do not refactor runtime source. Do not change tests unless a Playwright selector defect blocks evidence capture and the proposed fix is approved.

---

## Objective

Validate the deployed **HB Intel Project Control Center package 1.0.0.19** in the hosted SharePoint tenant using the PCC live Playwright lane.

The validation must prove, from hosted DOM evidence, that Phase 03 conditional command-header work is present and correct after deployment:

- the package/version resolver is aligned to `1.0.0.19`;
- the hosted page loads without console/page errors;
- the shell-owned active panel is still the semantic owner;
- all eight MVP surfaces can be navigated through the safe tabs;
- the command header changes per active surface;
- summary, cue, read-only, and command-search markers render in the hosted page;
- the Prompt 02 cues are visible in hosted DOM:
  - `project-readiness` → `no-execution`;
  - `external-systems` → `launch-context`;
- command-search remains preview-only and non-interactive;
- no duplicate/header-card removal has occurred in Phase 03;
- evidence artifacts are saved under the canonical PCC live evidence path.

---

## Current Baseline to Respect

Current accepted baseline:

```text
f8d17b9de9d29c8645749d1619fad9278d094a9b
chore(pcc): HB Intel Project Control Center 1.0.0.19
```

This commit intentionally bumped:

- `apps/project-control-center/config/package-solution.json` → `solution.version: 1.0.0.19`;
- `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json` → `version: 1.0.0.19`;
- `tools/spfx-shell/config/package-solution.json` → `solution.version: 1.0.0.19`, `feature.version: 1.0.0.18`.

Prompt 05 completed with no file changes and unit/component validation only:

- `check-types`: PASS;
- `@hbc/spfx-project-control-center test`: PASS — 91 files / 2018 tests;
- no Playwright / live hosted validation was run;
- no evidence package was generated.

Prompt 05A must close that hosted-validation gap.

---

## Required First Actions

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log -1 --oneline
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Confirm:

- current branch is `main`;
- working tree is clean before validation;
- `apps/project-control-center/config/package-solution.json` resolves to `1.0.0.19`;
- `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json` resolves to `1.0.0.19`;
- `pnpm-lock.yaml` hash is unchanged from the current accepted baseline;
- storage state is available at the configured or default path.

Run:

```bash
pnpm pcc:e2e:live:list
```

If the list command fails, stop and report the failure before running live tests.

---

## Required Environment Posture

Use the default live environment unless the user has provided alternate values.

Expected defaults are encoded in `e2e/pcc-live/pcc-live.env.ts`:

```text
PCC_LIVE_SITE_URL=https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject
PCC_LIVE_PAGE_URL=https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/CollabHome.aspx
PCC_LIVE_STORAGE_STATE=$HOME/.pcc-live-auth/pcc-live-storage-state.json
PCC_EVIDENCE_OUTPUT_DIR=docs/architecture/evidence/pcc-live
PCC_EXPECTED_PACKAGE_VERSION=derived from apps/project-control-center/config/package-solution.json
```

Because `PCC_EXPECTED_PACKAGE_VERSION` is derived from the package-solution file by default, it should resolve to `1.0.0.19`.

If overriding explicitly, use:

```bash
export PCC_EXPECTED_PACKAGE_VERSION=1.0.0.19
export PCC_EVIDENCE_OUTPUT_DIR="/Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live"
```

Do not commit storage-state files or credentials.

---

## Required Hosted Validation Commands

Run in this order:

```bash
pnpm pcc:e2e:live:list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

If `pnpm pcc:e2e:live` generates a timestamped evidence directory, capture the exact path.

After the run, inspect the generated evidence summary / manifest / JSON artifacts sufficient to complete the Hosted Evidence Matrix below.

Do not edit generated evidence artifacts unless the repo has an established sanitizer/normalizer command that must be run as part of the live evidence workflow.

---

## Hosted Evidence Matrix to Complete

For each item, report **PASS / FAIL / SKIPPED** with artifact reference or explanation.

### A. Environment and package

1. Live env status resolves to `ready`.
2. Expected package version resolves to `1.0.0.19`.
3. Hosted package/version evidence does not report mismatch.
4. Evidence output directory is under `docs/architecture/evidence/pcc-live`.

### B. Hosted shell ownership

1. Root shell marker renders.
2. Exactly one shell-owned `main[role="tabpanel"]` exists.
3. Shell panel ID is `pcc-active-surface-panel`.
4. Shell panel owns `data-pcc-active-surface-panel`.
5. Card-level compatibility markers remain separate from shell semantic ownership.
6. Broad active-panel count is expected and explained; do not force it to one until Phase 04 removes duplicate/header cards.

### C. Hosted navigation across eight surfaces

Validate all eight MVP surfaces:

```text
project-home
team-and-access
documents
project-readiness
approvals
external-systems
control-center-settings
site-health
```

For each surface confirm:

- tab exists;
- click/navigation succeeds;
- selected tab state updates;
- shell `data-pcc-active-surface-panel` equals surface ID;
- hero secondary title matches active surface;
- summary zone exists;
- cue zone exists;
- read-only cue exists;
- command-search preview slot exists.

### D. Hosted Phase 03 metadata markers

Confirm hosted DOM includes:

- `[data-pcc-hero-surface-summary]`;
- `[data-pcc-hero-summary-item]`;
- `[data-pcc-hero-surface-cues]`;
- `[data-pcc-hero-surface-cue]`;
- `[data-pcc-hero-read-only-cue]`;
- `[data-pcc-hero-command-search]`;
- `[data-pcc-command-search-state="preview"]`.

Confirm Prompt 02 cue markers:

- `[data-pcc-hero-surface-cue="no-execution"]` appears on `project-readiness`;
- `[data-pcc-hero-surface-cue="launch-context"]` appears on `external-systems`.

### E. Hosted false-affordance posture

Confirm in hosted DOM:

- command-search slot contains no `input`;
- no `button`;
- no `a`;
- no `select`;
- no `textarea`;
- no `[tabindex="0"]`;
- no `[role="button"]`;
- visible copy communicates preview/unavailable posture.

### F. Hosted stability / errors

Confirm:

- no page errors;
- no material console errors;
- no unexpected warnings from the PCC live test suite;
- screenshots and JSON artifacts were generated;
- evidence sanitizer did not over-redact safe run IDs or evidence paths;
- no credentials, raw tokens, or storage-state data are present in committed/reportable evidence.

---

## Pass / Fail Rules

Prompt 05A passes only if:

- Playwright live list succeeds;
- evidence registry succeeds;
- hosted live run succeeds or any skipped tests are intentional and clearly explained;
- package version is `1.0.0.19`;
- all eight surfaces navigate successfully in hosted DOM;
- Phase 03 shell header markers render in hosted DOM;
- `no-execution` and `launch-context` cue markers are visible in hosted DOM;
- no command-search false affordance appears;
- no package/lockfile/source/test files change as part of validation.

Prompt 05A fails if:

- the storage-state file is missing;
- the package version mismatches;
- hosted page is still serving an older package;
- any required surface fails navigation;
- shell semantic active-panel ownership regresses;
- Phase 03 header metadata markers are absent;
- command-search becomes interactive;
- Playwright artifacts show page errors or material console errors;
- validation changes source/package/lockfile files.

---

## Validation After Playwright

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git diff --check
```

If evidence artifacts were generated and are expected to be committed later, do **not** commit automatically. Report the generated path and await user direction.

If source/test/package files changed unexpectedly, stop and report the exact changed files.

---

## Required Completion Response

```markdown
## Prompt 05A Complete — Hosted Playwright Validation

## Files Changed

- State `None` unless evidence files were generated or files changed unexpectedly.

## Live Environment

- Site URL:
- Page URL:
- Storage state:
- Evidence output directory:
- Expected package version:
- Environment status:

## Hosted Evidence Path

- Evidence directory:
- Key artifacts reviewed:

## Hosted Evidence Matrix

| Area                      | Status | Evidence / Notes |
| ------------------------- | ------ | ---------------- |
| Environment and package   | ...    | ...              |
| Shell ownership           | ...    | ...              |
| Eight-surface navigation  | ...    | ...              |
| Phase 03 metadata markers | ...    | ...              |
| False-affordance posture  | ...    | ...              |
| Stability / errors        | ...    | ...              |

## Surface-by-Surface Hosted Result

| Surface                 | Tab Navigation | Shell Active ID | Hero Title | Summary Zone | Cue Zone | Read-Only Cue | Command Search | Result |
| ----------------------- | -------------- | --------------- | ---------- | ------------ | -------- | ------------- | -------------- | ------ |
| project-home            | ...            | ...             | ...        | ...          | ...      | ...           | ...            | ...    |
| team-and-access         | ...            | ...             | ...        | ...          | ...      | ...           | ...            | ...    |
| documents               | ...            | ...             | ...        | ...          | ...      | ...           | ...            | ...    |
| project-readiness       | ...            | ...             | ...        | ...          | ...      | ...           | ...            | ...    |
| approvals               | ...            | ...             | ...        | ...          | ...      | ...           | ...            | ...    |
| external-systems        | ...            | ...             | ...        | ...          | ...      | ...           | ...            | ...    |
| control-center-settings | ...            | ...             | ...        | ...          | ...      | ...           | ...            | ...    |
| site-health             | ...            | ...             | ...        | ...          | ...      | ...           | ...            | ...    |

## Prompt 02 Cue Marker Proof

- `project-readiness` / `no-execution`:
- `external-systems` / `launch-context`:

## Command Search False-Affordance Proof

- input:
- button:
- anchor:
- select:
- textarea:
- tabindex=0:
- role=button:
- visible preview/unavailable copy:

## Validation Results

- `pnpm pcc:e2e:live:list`:
- `pnpm pcc:e2e:evidence:registry`:
- `pnpm pcc:e2e:live`:
- `git status --short` after:
- `pnpm-lock.yaml` MD5 after:
- `git diff --check`:

## Package / Source Drift Audit

- package-solution:
- webpart manifest:
- package files:
- lockfile:
- source/test files:

## Remaining Issues

- State `None` only if hosted validation fully passes.
- Otherwise list each failure, likely cause, and proposed next action.

## Ready for Prompt 06?

- Yes / No.
- If yes, Prompt 06 may proceed as closeout with hosted evidence included.
```
