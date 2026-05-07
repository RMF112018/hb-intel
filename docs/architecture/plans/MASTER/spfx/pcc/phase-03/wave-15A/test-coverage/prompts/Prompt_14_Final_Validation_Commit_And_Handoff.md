# Prompt 14 — Final Validation, Commit, and Handoff (Updated Execution Spec)

## Context

You are executing the final validation and handoff gate for the PCC Wave 15A scorecard evidence automation package.

Use current repo truth. Do **not** re-read files that are still within your current context or memory unless exact edit context is required, a file may have changed, or a validation failure requires source inspection.

Tenant target for metadata only:

```text
https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject
```

Governing documents:

```text
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Package manifest:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/test-coverage/PACKAGE_MANIFEST.md
```

Prompt sequence expected complete before this gate:

```text
Prompt_00_Repo_Truth_Audit_And_Governing_Doc_Check.md
Prompt_01_Playwright_Live_Harness_Auth_And_Safety.md
Prompt_02_Evidence_Registry_And_Manifest_Writer.md
Prompt_03_Scorecard_Traceability_And_Hard_Stop_Model.md
Prompt_04_Surface_Page_Object_Navigation_And_Runtime_Smoke.md
Prompt_05_Surface_Screenshot_And_Full_Scroll_Evidence.md
Prompt_06_Breakpoint_Container_Overflow_Rowspan_Touch_Evidence.md
Prompt_07_Accessibility_Axe_Keyboard_Focus_ARIA_Contrast_Evidence.md
Prompt_08_Workflow_Action_Source_State_And_False_Affordance_Evidence.md
Prompt_09_Conditional_Edit_Mode_High_Zoom_Drawer_Unauthorized_State_Evidence.md
Prompt_10_Content_Language_Source_Of_Record_And_HBI_Authority_Audit.md
Prompt_11_Doctrine_Source_And_Mold_Breaker_Audit_Artifacts.md
Prompt_12_Surface_And_Primitive_Evidence_Blocks.md
Prompt_13_Scorecard_Report_Generator_And_Audit_Package.md
```

Critical distinction:

- Automate evidence generation, traceability, audit package assembly, validation, and closeout.
- Do **not** calculate a final 100-point score.
- Do **not** mark any EV captured unless the existing evidence registry already says so.
- Do **not** upgrade or normalize registry statuses.
- Do **not** mark any hard stop passed, failed, cleared, satisfied, waived, or not applicable.
- Do **not** claim 56/56, 100/100, Phase 4 readiness, Mold Breaker achievement, production readiness, deployment readiness, or client-ready acceptance.
- Final judgment remains `expert-review-required`.

---

## Objective

Execute final validation for the PCC Wave 15A scorecard evidence automation package and produce a concise final handoff.

This prompt is a **validation and handoff gate**, not a new feature implementation prompt.

The final result must establish whether the repo now contains a complete expert-review support package for:

- EV-37 through EV-106.
- EV-125 through EV-134.
- All 9 scorecard pillars.
- All 10 hard-stop gates.
- Evidence registry / manifest support.
- Scorecard traceability support.
- Surface smoke, screenshot, breakpoint, accessibility, workflow, conditional, content, doctrine-source, surface-block, and scorecard-report lanes.
- Final draft audit package generation for expert review.

The final result must clearly identify:

- validations run;
- commands that passed;
- commands blocked by environment policy;
- any skipped live-tenant tests and why;
- any remaining operator/expert-review requirements;
- any generated evidence/auth/raw artifact safety risks found or not found;
- exact files changed, if any;
- commit SHA after final commit, if one is made.

---

## Allowed Edit Scope

Default posture: **no implementation edits**.

Prompt 14 may create or update exactly one final closeout document if needed:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/test-coverage/FINAL_VALIDATION_AND_HANDOFF.md
```

Do not modify any other files unless the user explicitly approved the change before this prompt or a direct validation blocker requires a correction. If a direct validation blocker appears, stop and report the issue rather than editing outside the allowed closeout document.

Forbidden edits:

```text
PCC runtime/source files
Playwright config files
package.json
pnpm-lock.yaml
evidence registry files
scorecard model/traceability files
governing doctrine/scorecard documents
Prompt 00–13 implementation files
Prompt 00–13 prompt files
.generated evidence artifacts
auth/storage-state files
raw Playwright artifacts
screenshots/traces/videos/HAR files
```

If there are already modified or untracked files at the start:

1. Run `git status --short`.
2. Classify each item as:
   - expected Prompt 00–13 implementation file;
   - approved prompt documentation file;
   - generated evidence artifact;
   - raw Playwright artifact;
   - auth/storage file;
   - unrelated dirty file;
   - unknown.
3. Do not stage or commit unknown, auth, generated, raw, or unrelated files.
4. If the working tree contains unresolved implementation changes from prior prompts, stop and report them unless the user has explicitly approved their inclusion.

---

## Required Safety Checks

Run explicit safety checks before any commit.

### 1. Auth / storage-state / secret scan

Inspect tracked and untracked paths for forbidden auth/storage patterns. Do not print secret contents.

Required checks:

```bash
git status --short
git diff --name-only
git ls-files --others --exclude-standard
git ls-files | grep -Ei '(^|/)(\.auth|\.e2e-auth|storage-state|storagestate|cookie|cookies|session|token|secret|secrets)(/|\.|$)' || true
git ls-files --others --exclude-standard | grep -Ei '(^|/)(\.auth|\.e2e-auth|storage-state|storagestate|cookie|cookies|session|token|secret|secrets)(/|\.|$)' || true
```

If any tracked or untracked auth/storage/secret path is found, do **not** commit. Report the path category only; do not open or print the file.

### 2. Raw Playwright artifact scan

Required checks:

```bash
git ls-files | grep -Ei '(^|/)(test-results|playwright-report|trace\.zip|video\.webm|network\.har|\.har)(/|$|\.zip|\.webm|\.har)' || true
git ls-files --others --exclude-standard | grep -Ei '(^|/)(test-results|playwright-report|trace\.zip|video\.webm|network\.har|\.har)(/|$|\.zip|\.webm|\.har)' || true
```

If raw Playwright artifacts appear tracked or untracked, do **not** commit them. Report the path category only.

### 3. Generated evidence artifact scan

Evidence output folders and generated review packets should not be staged/committed automatically. Check for likely generated outputs:

```bash
git ls-files --others --exclude-standard | grep -Ei '(^|/)(evidence|evidence-output|pcc-live-evidence|pcc-live-.*evidence|audit-package|scorecard-report)(/|$)' || true
```

Generated outputs may be retained locally for operator review, but do not stage/commit them unless the user explicitly approved that exact path.

### 4. Forbidden conclusion language check

Prompt 14 closeout and final handoff documentation must not include unsupported conclusion language. Search newly edited files and intended commit files for:

```text
56/56 achieved
100/100
Phase 4 ready
Mold Breaker achieved
hard stop passed
hard stop failed
deployment ready
production ready
client ready
EV captured
```

Allowed normalized disclaimer phrases:

```text
No EV captured.
No EV marked captured.
No hard stop passed or failed.
```

---

## Required Validation Commands

Run and report the exact command and result.

### Git / repository state

```bash
git rev-parse HEAD
git status --short
git diff --check
```

### Playwright pcc-live test list and full lane

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm exec playwright test --config=playwright.pcc-live.config.ts
```

If the full live lane is too unstable because live env/storage state is not configured, run all individual specs listed below and report the full-lane blocker clearly. Do not treat self-skips caused by missing live env/storage state as failures if the spec is designed to self-skip.

### Required individual pcc-live specs

Run every current pcc-live spec:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.conditional.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.doctrine-source.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
```

If Chromium sandbox/Mach port permissions block a Playwright run, rerun only the affected Playwright command with the minimum required escalation and report that escalation was required. Do not use escalation language unless escalation actually occurred.

### Formatting and package validations

```bash
pnpm exec prettier --check --ignore-unknown e2e/pcc-live docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/test-coverage
git diff --check
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm install --frozen-lockfile
```

If `pnpm install --frozen-lockfile` is blocked by host authorization policy, report it as an **environment validation exception**, consistent with Prompts 09–13.

Do not modify `pnpm-lock.yaml`.

---

## Final Handoff Document Requirements

If creating/updating:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/test-coverage/FINAL_VALIDATION_AND_HANDOFF.md
```

The document must include:

1. Objective.
2. Scope validated.
3. Prompt sequence summary, Prompts 00–13.
4. Evidence coverage:
   - EV-37 through EV-106.
   - EV-125 through EV-134.
   - 9 pillars.
   - 10 hard stops.
5. Validation command table:
   - command;
   - result;
   - notes;
   - whether escalation was required.
6. Safety scan results:
   - auth/storage/secret scan;
   - raw Playwright artifact scan;
   - generated evidence artifact scan;
   - forbidden conclusion language scan.
7. Final artifact/report capability:
   - evidence manifest;
   - traceability model;
   - screenshot evidence;
   - breakpoint evidence;
   - accessibility evidence;
   - workflow/source/state evidence;
   - conditional evidence;
   - content/HBI/source-of-record review;
   - doctrine/source/Mold Breaker review;
   - surface/primitive evidence blocks;
   - scorecard report/audit package.
8. Residual risks / pending items:
   - manual expert scoring required;
   - manual hard-stop review required;
   - live conditional capture pending if env/storage state is not configured;
   - `pnpm install --frozen-lockfile` environment exception if applicable;
   - Playwright escalation requirement if applicable.
9. Explicit non-claims:
   - no final score calculated;
   - no hard stop passed/failed;
   - no Phase 4 readiness claim;
   - no Mold Breaker achievement claim;
   - no deployment readiness claim.
10. Commit / handoff:
   - starting HEAD;
   - ending HEAD;
   - commit SHA created by Prompt 14, if any;
   - list of committed files;
   - list of deliberately uncommitted files, if any.

Do not include raw secrets, raw auth paths, raw traces, raw console dumps, raw DOM HTML, full generated evidence payloads, full source file excerpts, or raw screenshots.

---

## Commit Instructions

After validation and safety checks:

1. Review `git status --short`.
2. Stage only approved files:
   - the final handoff document, if created/updated;
   - any explicitly approved prompt documentation file already authorized by the user.
3. Do not stage:
   - auth/storage state;
   - raw Playwright artifacts;
   - generated evidence artifacts;
   - unrelated dirty files;
   - runtime/source/config/package/lockfile changes not explicitly approved.
4. Run `git diff --cached --check` before commit.
5. Commit with a message similar to:

```text
docs(pcc-live): final validation and handoff for scorecard evidence package
```

6. Push only if the normal workflow for this repository requires push and credentials are already configured. If push fails, report the failure and leave the local commit intact.

If there are no approved file changes after validation, do not create an empty commit. Report “no commit created; validation-only closeout.”

---

## Required Closeout From Agent

Return exactly this structure:

```text
Prompt completed.

Starting HEAD:
- <sha>

Ending HEAD:
- <sha>

Files changed:
- <paths, or "None — validation-only closeout">

Validation:
- <command> — <passed / failed / skipped / blocked / passed after escalated rerun>
- <command> — <result>

Safety checks:
- Auth/storage/secret scan: <result>
- Raw Playwright artifact scan: <result>
- Generated evidence artifact scan: <result>
- Forbidden conclusion language scan: <result>

Evidence / scorecard impact:
- EV-37..EV-106 evidence automation support validated / not validated
- EV-125..EV-134 evidence block support validated / not validated
- 9 pillar traceability support validated / not validated
- 10 hard-stop worksheet support validated / not validated
- Scorecard report/audit package support validated / not validated
- No final score calculated
- No EV marked captured by Prompt 14
- No hard stop marked passed/failed

Commit:
- <commit SHA, push result, or "No commit created">

Residual risks or pending items:
- <items>
```

If any validation fails, do not summarize it as successful. Report the exact failed command and the narrowest recommended next corrective action.
