# Prompt 01 — PCC Live SharePoint Playwright Harness, Auth, and Safety

## Role

You are the local code agent implementing **Prompt 01** for the PCC 100-Point UI/UX Mold Breaker Scorecard evidence automation track in the `RMF112018/hb-intel` repository.

You are implementing the **live SharePoint-hosted Playwright harness foundation only**. You are **not** implementing evidence capture, scorecard scoring, screenshot suites, accessibility suites, report generation, or PCC runtime changes in this prompt.

## Critical Context

The governing scorecard has now landed in repo truth at:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Commit reference supplied by the auditor:

```text
640779bcf9bbca42bff1d21c3563c11994357abd
```

Before editing, verify that the file exists in the current local checkout. If it is missing locally, stop and report that the local branch is stale or missing the required scorecard file.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Objective

Add a safe, opt-in PCC live SharePoint Playwright lane that can later support scorecard evidence capture for the Project Control Center.

The output of this prompt must establish:

1. A dedicated live SharePoint Playwright config.
2. PCC live env parsing and missing-env/self-skip behavior.
3. A minimal runtime smoke spec proving the harness can load or clearly block without ambiguous failures.
4. Root package scripts for listing/running the lane.
5. `.gitignore` protection for auth/session/raw Playwright artifacts.
6. Documentation for operator setup, safety boundaries, and optional Brave parity.
7. No tenant mutation, no committed auth/session-sensitive artifacts, no raw Playwright artifacts committed, and no PCC runtime/source changes unless strictly necessary for harness compilation.

This prompt is a foundation step. It should not attempt to capture all EV evidence yet.

## Repo-Truth Baseline To Verify First

Verify these files before editing:

```text
package.json
apps/project-control-center/package.json
playwright.config.ts
playwright.kudos-live.config.ts
e2e/live-sharepoint/README.md
.gitignore
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
```

Also inspect only as needed for selector/harness planning:

```text
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
```

Expected current posture to confirm, not assume:

- Root `package.json` has `@playwright/test` and root Playwright scripts.
- `apps/project-control-center/package.json` remains Vitest/Vite-only and should not need PCC Playwright scripts for this prompt.
- Root `playwright.config.ts` targets local/dev-harness behavior and starts local web servers; do not modify it for the PCC live lane.
- `playwright.kudos-live.config.ts` is the live SharePoint precedent: no local web server, serial, storageState-based, opt-in.
- The PCC scorecard file exists at the required path.
- `.gitignore` already ignores general Playwright output, but may not yet ignore PCC-specific auth/session/raw Playwright artifacts.

## Non-Negotiable Safety Rules

Do **not**:

- Commit or create a real `storageState` JSON file.
- Commit tenant cookies, auth tokens, screenshots, traces, videos, HAR files, or raw auth/session-sensitive Playwright artifacts.
- Store raw secrets in code, docs, examples, logs, or comments.
- Use `.env` auto-loading for live tenant variables.
- Add live SharePoint/Graph/Procore/Sage/Autodesk/Document Crunch/Adobe Sign mutation.
- Click, trigger, or script save/submit/approve/reject/delete/provision/sync/mutate actions.
- Require live tenant execution in CI.
- Add this live lane to normal `pnpm test`, `pnpm e2e`, or CI-required scripts.
- Modify PCC runtime source, surface source, layout primitives, manifests, packages, or SharePoint packaging files unless a compile blocker proves it is unavoidable.
- Reuse SharePoint-generated CSS class names as primary selectors.
- Claim EV evidence is “captured” in this prompt unless a real artifact is created by the harness run. This prompt should usually mark EV impact as “foundation only.”

Never-commit list (must remain true for this prompt and all follow-ups):

- storageState/session files
- cookies/auth context
- raw traces/videos
- raw `test-results/`
- raw `playwright-report/`
- unsanitized console dumps
- secrets/tokens/personal data/auth context

## Tenant Target

Baseline tenant test site:

```text
https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject
```

The harness must support either site root or a specific page URL. The specific page URL must be controlled by env:

```bash
PCC_LIVE_PAGE_URL="https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/<actual-page>.aspx"
```

Do not hard-code the page path beyond examples.

## Required Environment Variables

The live lane must read these required variables:

```bash
PCC_LIVE_SITE_URL
PCC_LIVE_PAGE_URL
PCC_LIVE_STORAGE_STATE
PCC_EVIDENCE_OUTPUT_DIR
PCC_EXPECTED_PACKAGE_VERSION
```

The live lane must also define/document these optional variables:

```bash
PCC_LIVE_BRAVE_EXECUTABLE_PATH
PCC_LIVE_EDIT_PAGE_URL
PCC_LIVE_UNAUTHORIZED_STORAGE_STATE
PCC_LIVE_UNAUTHORIZED_PAGE_URL
PCC_LIVE_ENABLE_CONDITIONAL
```

Prompt 01 only needs to use the required vars plus optional Brave support. The other optional variables must be documented and typed for later prompts but should not drive live behavior unless trivial and safe.

## Required Files To Add

Add these files unless repo truth shows equivalent files already exist:

```text
playwright.pcc-live.config.ts
e2e/pcc-live/README.md
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.runtime.spec.ts
```

You may add one helper file if it materially improves type clarity:

```text
e2e/pcc-live/pcc-live.types.ts
```

Do not add the full future evidence system in this prompt.

## Files Allowed To Modify

Allowed:

```text
package.json
.gitignore
playwright.pcc-live.config.ts
e2e/pcc-live/README.md
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.runtime.spec.ts
e2e/pcc-live/pcc-live.types.ts
```

Only if already present and directly relevant:

```text
README.md
```

Do not modify:

```text
apps/project-control-center/src/**
apps/project-control-center/package.json
pnpm-lock.yaml
playwright.config.ts
playwright.kudos-live.config.ts
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
docs/explanation/design-decisions/**
docs/reference/ui-kit/doctrine/**
docs/architecture/**
packages/**
backend/**
```

If you believe a forbidden file must change, stop and report the reason instead of editing.

## Playwright Config Requirements

Create `playwright.pcc-live.config.ts` with this posture:

- Uses `defineConfig` from `@playwright/test`.
- `testDir: './e2e/pcc-live'`.
- `fullyParallel: false`.
- `workers: 1`.
- `retries: 0` by default.
- Reporter should be local-friendly, for example `list`, with no mandatory HTML report committed.
- Uses Playwright-managed Chromium by default.
- Includes `storageState` only when `PCC_LIVE_STORAGE_STATE` is non-empty.
- Does **not** define `webServer`.
- Uses `trace: 'retain-on-failure'`.
- Should not create video/screenshots by default unless failure behavior is explicitly configured and outputs remain ignored.
- Must support optional Brave as a secondary project only when `PCC_LIVE_BRAVE_EXECUTABLE_PATH` is set.
- Must not require Brave.

Recommended project names:

```text
chromium
brave-optional
```

Brave project requirement:

- Include it only conditionally when the executable path env var is set.
- Use the executable path in `launchOptions`.
- Do not fail config loading if Brave is not configured.

## Env Helper Requirements

Create `e2e/pcc-live/pcc-live.env.ts`.

It must export a typed helper that:

- Reads the required and optional env vars.
- Does not log secrets or storageState contents.
- Validates missing required env vars.
- Validates that `PCC_LIVE_STORAGE_STATE` points to an existing file only when execution intends to use the live lane.
- Provides a clear missing-env message listing missing variable names only.
- Provides a safe `skipIfMissingPccLiveEnv(test)` or equivalent helper so specs self-skip with a readable reason.
- Does not call `dotenv`.
- Does not read from `.env` automatically.
- Does not write files.

Expected status model for Prompt 01:

```ts
type PccLiveEnvStatus = 'ready' | 'missing-env' | 'missing-storage-state';
```

Recommended exported shape:

```ts
export interface PccLiveEnv {
  siteUrl: string;
  pageUrl: string;
  storageStatePath: string;
  evidenceOutputDir: string;
  expectedPackageVersion: string;
  braveExecutablePath?: string;
  editPageUrl?: string;
  unauthorizedStorageStatePath?: string;
  unauthorizedPageUrl?: string;
  conditionalEnabled: boolean;
}

export interface PccLiveEnvCheck {
  status: 'ready' | 'missing-env' | 'missing-storage-state';
  env?: PccLiveEnv;
  missingKeys: string[];
  message: string;
}
```

Keep implementation simple and strongly typed.

## Runtime Smoke Spec Requirements

Create `e2e/pcc-live/pcc-live.runtime.spec.ts`.

This first spec must:

- Self-skip clearly when env/storageState is missing.
- Navigate only to `PCC_LIVE_PAGE_URL`.
- Capture console errors and page errors into in-memory arrays.
- Assert the page reaches a loaded state without relying on SharePoint-generated class names.
- Prefer stable PCC selectors where possible:
  - `[data-pcc-bento-grid]`
  - `[data-pcc-card]`
  - `[data-pcc-horizontal-tabs]`
  - `[data-pcc-tab-id]`
  - `[data-pcc-active-surface-panel]`
- If the PCC web part is not present on the page, fail with a clear message that includes the page URL and instructs the operator to set `PCC_LIVE_PAGE_URL` to the actual hosted page.
- Must not click any mutation controls.
- May click safe PCC navigation tabs only if present and only after confirming they are `[role="tab"]` / `data-pcc-tab-id` and not a submit/save/approve/delete control.
- Should assert that at least one of the PCC root markers exists.
- Should record the expected package version value only as an operator/environment field; do not invent runtime package proof if the DOM does not expose it yet.
- Should not write the full evidence manifest yet.

Recommended test cases:

1. `PCC live environment is configured or self-skips clearly`
2. `PCC hosted page loads with Project Control Center root markers`
3. `PCC navigation/tab markers are present when hosted web part is installed`

Do not overbuild. Prompt 01 is harness/safety only.

## Root Script Requirements

Update root `package.json` scripts only.

Add scripts similar to:

```json
{
  "pcc:e2e:live:list": "playwright test --config=playwright.pcc-live.config.ts --list",
  "pcc:e2e:live": "playwright test --config=playwright.pcc-live.config.ts"
}
```

Do not wire these scripts into `test`, `e2e`, `build`, CI, or Turbo pipeline defaults.

Do not modify `apps/project-control-center/package.json`.

## `.gitignore` Requirements

Update `.gitignore` to protect auth/session/raw Playwright artifacts only. Do not add a blanket ignore for curated PCC evidence paths.

```text
# PCC live SharePoint auth/session/raw Playwright artifacts
.e2e-auth/
.secrets/
*.storageState.json
*pcc*storage*.json
*pcc*auth*.json
```

Curated and sanitized PCC evidence is repo-visible and commit-eligible after operator review.
Preferred curated evidence path:

```text
docs/architecture/evidence/pcc-live/<run-id>/
```

Also verify the repo already ignores:

```text
playwright-report/
test-results/
.DS_Store
.env
.env.local
*.pem
```

Do not remove existing ignore exceptions or canonical source-doc unignore rules.

## README Requirements

Create `e2e/pcc-live/README.md` with:

1. Purpose of the lane.
2. What it proves in Prompt 01.
3. What it intentionally does **not** prove yet.
4. Required env vars.
5. Optional env vars.
6. Tenant target example.
7. How to capture storageState safely.
8. Where to store storageState safely.
9. How to run list mode.
10. How to run live mode.
11. Optional Brave parity setup.
12. No-tenant-mutation safety rules.
13. Artifact safety rules.
14. CI posture: opt-in only, not required.
15. Troubleshooting:
    - missing env
    - missing storageState file
    - wrong PCC page URL
    - web part not installed
    - expired auth/session
    - SharePoint redirects/sign-in loops
16. EV/scorecard impact:
    - Prompt 01 is foundation only.
    - EV-52 through EV-58 are not fully captured yet.
    - EV-58 package/version proof remains `operator-pending` unless future prompts add runtime marker capture.
    - Later prompts will implement screenshot, breakpoint, accessibility, state, source, and report evidence.

StorageState capture example should be generic and safe:

```bash
pnpm exec playwright codegen "$PCC_LIVE_PAGE_URL" --save-storage "$HOME/.config/hbc/pcc-live-storageState.json"
```

Explicitly instruct:

- Do not store storageState in the repo.
- Prefer `$HOME/.config/hbc/`.
- Rotate the file periodically.
- Never paste its contents into chat or tickets.
- Curated/sanitized evidence may be committed after operator review under `docs/architecture/evidence/pcc-live/<run-id>/`.

## Scorecard / EV Impact For This Prompt

This prompt supports, but does not complete, evidence for:

```text
EV-52 SharePoint-hosted runtime screenshot evidence
EV-53 SharePoint chrome boundary evidence
EV-54 Tenant-hosted console evidence
EV-55 Tenant-hosted navigation evidence
EV-56 Tenant-hosted state rendering evidence
EV-57 SharePoint edit-mode evidence
EV-58 Package/version evidence
```

Prompt 01 should not mark these as captured in any manifest. It may state that it lays the harness foundation for later evidence collection.

Hard-stop gates supported by this foundation:

```text
HS-08 SharePoint host-fit failure
HS-09 Evidence failure
```

Do not claim either hard stop is passed based on this prompt alone.

## Implementation Steps

### Step 1 — Repo-Truth Gate

Run/inspect enough to confirm:

```bash
git status --short
test -f docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
test -f playwright.kudos-live.config.ts
test -f e2e/live-sharepoint/README.md
test -f package.json
test -f .gitignore
```

Inspect current scripts before editing:

```bash
cat package.json
```

Inspect existing live SharePoint precedent:

```bash
sed -n '1,220p' playwright.kudos-live.config.ts
sed -n '1,260p' e2e/live-sharepoint/README.md
```

Stop if the scorecard is missing.

### Step 2 — Add PCC Live Config

Create `playwright.pcc-live.config.ts` matching the requirements above.

Use the Kudos live config as a precedent for live SharePoint/no-webServer posture, but do not copy Kudos env names or write-mutation semantics.

### Step 3 — Add PCC Live Env Helper

Create `e2e/pcc-live/pcc-live.env.ts`.

Keep it dependency-free and deterministic.

### Step 4 — Add Minimal Runtime Spec

Create `e2e/pcc-live/pcc-live.runtime.spec.ts`.

The spec must be safe to run on the tenant and safe to list without env.

### Step 5 — Add Docs

Create `e2e/pcc-live/README.md`.

### Step 6 — Add Scripts

Add root scripts only:

```text
pcc:e2e:live:list
pcc:e2e:live
```

### Step 7 — Update `.gitignore`

Add PCC live auth/session/raw Playwright artifact ignores without disturbing existing rules.

### Step 8 — Validate

Run these commands:

```bash
git status --short
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:live:list
pnpm exec prettier --check --ignore-unknown playwright.pcc-live.config.ts e2e/pcc-live package.json .gitignore
git diff --check
```

Also run if feasible:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

Do **not** run the live tenant test unless env/storageState is intentionally configured. If env/storageState is missing, it is acceptable for list mode to pass and live mode to self-skip clearly.

If you do run live mode, include only pass/fail status and sanitized observations. Do not include cookies, tokens, screenshots, traces, or tenant-sensitive payloads.

## Acceptance Criteria

Prompt 01 is complete only when:

- The scorecard file exists locally at the required path.
- `playwright.pcc-live.config.ts` exists and has no `webServer`.
- The config uses managed Chromium by default.
- Brave is optional and absent unless `PCC_LIVE_BRAVE_EXECUTABLE_PATH` is set.
- Missing env/storageState produces clear self-skip behavior.
- Root scripts exist and are opt-in only.
- `.gitignore` protects PCC live auth/session/raw Playwright artifacts.
- README documents setup, storageState safety, required/optional env vars, tenant target, no mutation, CI posture, and troubleshooting.
- The smoke spec does not mutate tenant data.
- The smoke spec uses PCC `data-pcc-*` selectors first.
- Validation commands above are run and reported.
- No forbidden files are changed.
- `pnpm-lock.yaml` is unchanged.
- No unreviewed, raw, auth/session-sensitive, or unsanitized evidence artifacts are staged.

## Required Closeout Response

Return exactly this structure:

```markdown
Prompt completed.

Files changed:

- <path>
- <path>

Validation:

- `git status --short` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts --list` — <result>
- `pnpm pcc:e2e:live:list` — <result>
- `pnpm exec prettier --check --ignore-unknown playwright.pcc-live.config.ts e2e/pcc-live package.json .gitignore` — <result>
- `git diff --check` — <result>
- `pnpm --filter @hbc/spfx-project-control-center check-types` — <result or not run with reason>
- `pnpm --filter @hbc/spfx-project-control-center test` — <result or not run with reason>

Evidence / scorecard impact:

- Foundation for EV-52 through EV-58.
- Supports future HS-08 / HS-09 review.
- No EV item marked captured by this prompt unless live run artifacts were intentionally produced and kept outside git.

Safety confirmation:

- No tenant mutation added.
- No storageState committed.
- No unreviewed, raw, auth/session-sensitive, or unsanitized evidence artifacts staged.
- No PCC runtime source modified.
- `pnpm-lock.yaml` unchanged.

Residual risks or pending items:

- <items>
```

## Red Flags That Require Stopping

Stop and report instead of continuing if:

- The scorecard file is missing locally.
- The repo already has a conflicting `playwright.pcc-live.config.ts` or `e2e/pcc-live` implementation that requires migration decisions.
- You cannot add root scripts without conflicting with existing script names.
- Any required change appears to require PCC runtime source edits.
- `pnpm-lock.yaml` changes.
- The live config requires a local `webServer`.
- A test or helper would expose storageState contents or secrets.
- A test would click mutation controls.
