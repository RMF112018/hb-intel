# Prompt 05 — PCC Surface Screenshot, Full-Scroll, DOM Card Summary, and Initial Evidence Mapping

## Role

You are the local code agent implementing **Prompt 05** for the PCC 100-Point UI/UX Mold Breaker Scorecard evidence automation track in the `RMF112018/hb-intel` repository.

You are implementing **safe live screenshot capture scaffolding, full-scroll/scroll-segment screenshot capture, DOM card-summary extraction, screenshot inventory writing, and initial evidence mapping output** for the Project Control Center.

You are **not** calculating a final score, not marking evidence captured, not marking hard stops passed/failed, not editing PCC runtime/source code, and not committing live screenshot artifacts automatically.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

---

## Critical Context

Prompt 01 established the PCC live Playwright harness.

Prompt 02 established evidence registry and manifest infrastructure.

Prompt 03 established scorecard pillar/hard-stop traceability.

Prompt 04 established:

```text
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.evidence-writer.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
```

Prompt 04 follow-up hardened:

- live page-object URL boundary checks;
- writer-level sanitization;
- curated-path preservation;
- raw Playwright/auth/session artifact exclusion.

The attached Prompt 05 objective was:

```text
Capture above-fold, full-page, and scroll-segment screenshots for every surface. Extract DOM card summaries and map EV-37..EV-49 plus EV-125..EV-134 initial evidence.
```

This updated prompt expands that objective into a safe, deterministic, repo-auditable implementation contract.

---

## Governing References

Use current repo truth from these references:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.evidence-writer.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-evidence.manifest.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
```

Critical distinction:

```text
Automate evidence collection, inventory, and traceability.
Do not automatically calculate the final 100-point score.
Do not mark EVs captured without operator/expert review.
Do not mark hard stops passed or failed.
```

---

## Repo-Truth Gate Before Editing

Before editing, verify current checkout has Prompt 01–04 foundation.

Run/inspect enough to confirm:

```bash
git status --short
test -f playwright.pcc-live.config.ts
test -f e2e/pcc-live/pcc-live.env.ts
test -f e2e/pcc-live/pcc-live.surfaces.ts
test -f e2e/pcc-live/pcc-live.page-object.ts
test -f e2e/pcc-live/pcc-live.evidence-writer.ts
test -f e2e/pcc-live/pcc-live.surface-smoke.spec.ts
test -f e2e/pcc-live/pcc-evidence.types.ts
test -f e2e/pcc-live/pcc-evidence.registry.ts
test -f e2e/pcc-live/pcc-evidence.manifest.ts
test -f e2e/pcc-live/pcc-scorecard.traceability.ts
test -f docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Inspect only as needed:

```bash
sed -n '1,260p' e2e/pcc-live/pcc-live.page-object.ts
sed -n '1,260p' e2e/pcc-live/pcc-live.evidence-writer.ts
sed -n '1,220p' e2e/pcc-live/pcc-live.surfaces.ts
sed -n '1,220p' e2e/pcc-live/pcc-evidence.registry.ts
```

Stop and report if:

- any Prompt 01–04 foundation file is missing;
- the Prompt 04 page object no longer enforces HTTPS + expected origin + expected hostname;
- the Prompt 04 writer no longer sanitizes free-text output;
- existing Prompt 05 screenshot files already exist and conflict with this design;
- implementation appears to require PCC runtime/source edits;
- live screenshot capture would require clicking mutation controls.

---

## Objective

Implement Prompt 05 screenshot evidence tooling that can, when live env/storageState is intentionally configured:

1. Navigate all eight PCC surfaces using the Prompt 04 safe page object.
2. Capture for each surface:
   - above-fold screenshot;
   - full-page screenshot;
   - scroll-segment screenshots.
3. Extract sanitized DOM card summaries for each surface.
4. Write deterministic screenshot inventory and evidence summary files.
5. Map initial screenshot/DOM evidence support to:
   - `EV-37` through `EV-49`;
   - `EV-125` through `EV-134`.
6. Preserve review boundaries:
   - evidence output is operator-review pending;
   - no EV registry status changes;
   - no final score;
   - no hard-stop pass/fail decisions.

Screenshots are potentially tenant-sensitive. Generated screenshots must not be staged or committed unless the operator explicitly reviews/scrubs and approves them.

---

## Required Files To Add

Create these files unless repo truth shows equivalent files already exist:

```text
e2e/pcc-live/pcc-live.screenshot.types.ts
e2e/pcc-live/pcc-live.screenshot-capture.ts
e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
e2e/pcc-live/pcc-live.screenshot.spec.ts
```

Update these existing files only if needed:

```text
e2e/pcc-live/README.md
package.json
```

Do not create committed screenshot artifacts in this prompt. Live artifacts should be written only when live tests are intentionally run with valid env/storageState and must remain uncommitted until operator review/scrubbing.

---

## Files Allowed To Modify

Allowed:

```text
e2e/pcc-live/pcc-live.screenshot.types.ts
e2e/pcc-live/pcc-live.screenshot-capture.ts
e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
e2e/pcc-live/pcc-live.screenshot.spec.ts
e2e/pcc-live/README.md
package.json
```

Do not modify:

```text
apps/project-control-center/src/**
apps/project-control-center/package.json
apps/project-control-center/config/**
apps/project-control-center/src/webparts/**
packages/**
backend/**
pnpm-lock.yaml
playwright.config.ts
playwright.kudos-live.config.ts
playwright.homepage-live.config.ts
playwright.pcc-live.config.ts
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.evidence-writer.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-evidence.manifest.ts
e2e/pcc-live/pcc-evidence.registry.spec.ts
e2e/pcc-live/pcc-scorecard.types.ts
e2e/pcc-live/pcc-scorecard.model.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
e2e/pcc-live/pcc-scorecard.traceability.spec.ts
docs/reference/**
docs/explanation/**
.gitignore
```

If a forbidden file appears necessary, stop and report instead of editing.

---

## Non-Negotiable Safety Rules

Do **not**:

- click save, submit, approve, reject, delete, edit, publish, provision, sync, or mutation controls;
- run SharePoint/Graph/Procore/Sage/Autodesk/Document Crunch/Adobe Sign mutations;
- modify tenant data;
- commit storageState/session files;
- commit raw traces/videos/HARs;
- commit raw `test-results/` or raw `playwright-report/`;
- commit unsanitized console dumps;
- serialize cookies, tokens, storageState, request headers, localStorage, sessionStorage, personal data, or auth/session context in JSON/markdown;
- mark any EV as `captured` in the registry;
- calculate the final 100-point score;
- mark hard stops as passed or failed.

Screenshot files themselves may contain tenant/project information. Treat screenshots as **operator-review required** and **not auto-commit eligible**.

Navigation remains limited to Prompt 04 safe tab navigation.

---

## Required Evidence ID Scope

Prompt 05 creates initial support artifacts for these EVs:

```text
EV-37
EV-38
EV-39
EV-40
EV-41
EV-42
EV-43
EV-44
EV-45
EV-46
EV-47
EV-48
EV-49
EV-125
EV-126
EV-127
EV-128
EV-129
EV-130
EV-131
EV-132
EV-133
EV-134
```

Define a strict tuple:

```ts
export const PCC_SCREENSHOT_INITIAL_EVIDENCE_IDS = [
  'EV-37',
  'EV-38',
  ...'EV-49',
  'EV-125',
  ...'EV-134',
] as const;
```

Rules:

- Use only EV IDs from Prompt 02 `PccEvidenceId`.
- Add compile-time guard that the tuple IDs are assignable to `PccEvidenceId`.
- Do not include EV IDs outside the specified list.
- Do not mark any of these EVs captured.
- Use status wording such as:
  - `operator-review-pending`;
  - `initial-support`;
  - `screenshot-inventory-ready`.

Do not use status wording such as:

```text
captured
passed
complete
approved
score-ready
```

---

## Screenshot Types Module

Create:

```text
e2e/pcc-live/pcc-live.screenshot.types.ts
```

Required exported types/interfaces:

```ts
export type PccScreenshotKind = 'above-fold' | 'full-page' | 'scroll-segment';

export interface PccScreenshotArtifact {
  surfaceId: PccLiveSurfaceId;
  kind: PccScreenshotKind;
  path: string;
  fileName: string;
  width: number;
  height: number;
  scrollY?: number;
  viewportWidth: number;
  viewportHeight: number;
  operatorReviewRequired: true;
}

export interface PccDomCardSummary {
  surfaceId: PccLiveSurfaceId;
  index: number;
  hierarchy?: string;
  tier?: string;
  region?: string;
  footprint?: string;
  headingLevel?: string;
  headingText?: string;
  cardSelector: string;
  textWasSanitized: boolean;
}

export interface PccSurfaceScreenshotEvidence {
  surfaceId: PccLiveSurfaceId;
  label: string;
  passed: boolean;
  screenshots: PccScreenshotArtifact[];
  cardSummaries: PccDomCardSummary[];
  warnings: string[];
}

export interface PccScreenshotEvidenceRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  selfSkipped: boolean;
  runState: 'completed' | 'self-skipped' | 'writer-test-only';
  evRefs: readonly PccEvidenceId[];
  surfaces: PccSurfaceScreenshotEvidence[];
  summary: {
    totalSurfaces: number;
    surfacesWithScreenshots: number;
    totalScreenshots: number;
    totalCards: number;
    totalWarnings: number;
  };
  warnings: string[];
  disclaimer: string;
}
```

The type module should import `PccLiveSurfaceId` from Prompt 04 surface registry and `PccEvidenceId` from Prompt 02 types.

---

## Screenshot Capture Module

Create:

```text
e2e/pcc-live/pcc-live.screenshot-capture.ts
```

Required behavior:

1. Accept a Playwright `Page`, a `PccLivePageObject`, the eight surfaces, and an output screenshot directory.
2. Navigate surfaces using only the Prompt 04 page object.
3. For each surface:
   - assert surface active through page object;
   - capture above-fold screenshot;
   - capture full-page screenshot;
   - capture scroll-segment screenshots.
4. Use deterministic, safe file names:
   - `surface-{surfaceId}-above-fold.png`
   - `surface-{surfaceId}-full-page.png`
   - `surface-{surfaceId}-scroll-001.png`
   - `surface-{surfaceId}-scroll-002.png`
5. Create screenshots under:
   - `<outputDir>/screenshots/`
6. Capture screenshot metadata:
   - path;
   - filename;
   - screenshot kind;
   - viewport width/height;
   - image width/height if obtainable;
   - scrollY for scroll segments;
   - `operatorReviewRequired: true`.

Screenshot requirements:

- use `animations: 'disabled'`;
- use `caret: 'hide'`;
- use `fullPage: true` only for full-page screenshot;
- for above-fold use viewport screenshot;
- for scroll segments, scroll incrementally and capture viewport screenshots;
- cap segment count to avoid runaway pages. Recommended default: max 8 segments per surface;
- wait briefly after scrolling for layout stabilization;
- return to top after segment capture if practical.

Default screenshot mask policy:

Use Playwright screenshot masks for likely sensitive/editable controls when present:

```text
input
textarea
[contenteditable="true"]
[data-pcc-sensitive]
[data-pcc-email]
[data-pcc-phone]
[data-pcc-user-email]
[data-pcc-user-name]
[data-pcc-contact]
[data-pcc-avatar]
[data-pcc-profile]
```

Masking should not fail when selectors are absent.

Do not depend on OCR.

---

## DOM Card Summary Extraction

The screenshot capture module must also extract sanitized card summaries from each surface.

Use stable selectors:

```text
[data-pcc-card]
[data-pcc-card-hierarchy]
[data-pcc-card-tier]
[data-pcc-card-region]
[data-pcc-footprint]
[data-pcc-heading-level]
```

Required DOM card summary behavior:

- collect one summary per `[data-pcc-card]`;
- collect only data attributes and short heading text;
- do not persist full card body text;
- do not persist user/person/contact details;
- sanitize heading text:
  - strip query strings from URLs;
  - redact email-like values;
  - redact long token-like strings;
  - redact credential keywords;
  - truncate to 120 characters;
- include `textWasSanitized: true` if sanitizer changed the heading text;
- cap total card summaries per surface if necessary. Recommended cap: 80.

Recommended heading extraction:

- first child heading `[role="heading"]`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`;
- fallback to `aria-label`;
- fallback to empty string.

---

## Screenshot Evidence Writer

Create:

```text
e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
```

Required output files:

```text
pcc-live-screenshot-evidence.json
pcc-live-screenshot-evidence.md
pcc-live-screenshot-inventory.json
pcc-live-dom-card-summary.json
```

Write these under the provided run output directory:

```text
<PCC_EVIDENCE_OUTPUT_DIR>/surface-screenshots-<run-id>/
```

Do not write under `test-results/` or `playwright-report/`.

JSON evidence must include:

```text
runId
generatedAtIso
tenantSiteUrl
tenantPageUrl
expectedPackageVersion
selfSkipped
runState
evRefs
surfaces
summary
warnings
disclaimer
```

Required disclaimer:

```text
This output is screenshot and DOM-summary evidence support for EV-37..EV-49 and EV-125..EV-134 only. It is not a final scorecard result and does not mark any EV captured without operator review.
```

Markdown summary must include:

```text
run ID
generated timestamp
tenant site/page
expected package version
EV refs
surface screenshot table
screenshot inventory summary
DOM card summary count
warnings
operator-review reminder
not-final-scoring disclaimer
```

Inventory JSON must include one record per screenshot.

DOM card summary JSON must include one record per sanitized card summary.

Sanitization requirements:

- Reuse or duplicate the conservative Prompt 04 sanitization logic.
- Sanitize all free-text fields written to JSON/markdown.
- Preserve safe curated repo/output paths.
- Exclude raw Playwright/auth/session paths from artifact references if artifact references are included.
- Do not serialize cookies, tokens, storageState, request/response payloads, raw console dumps, or headers.

---

## Screenshot Spec

Create:

```text
e2e/pcc-live/pcc-live.screenshot.spec.ts
```

Required tests:

### 1. Screenshot evidence EV tuple is valid

No live env required.

Assert:

- tuple contains exactly `EV-37..EV-49` and `EV-125..EV-134`;
- every tuple ID exists in `REQUIRED_PCC_EVIDENCE_IDS`;
- no duplicate EV IDs;
- no EV outside the Prompt 05 scope.

### 2. Screenshot writer preserves sanitized output policy

No live env required.

Use temp directory and sample fake screenshot/card-summary data.

Assert:

- writer produces all four expected JSON/markdown files;
- curated safe path remains present;
- unsafe strings are not present in JSON/markdown:
  - email address;
  - token-like blob;
  - query string;
  - `storageState`;
  - `cookie`;
  - `token`;
  - `session`;
  - `.auth`;
  - `test-results`;
  - `playwright-report`;
  - `trace.zip`;
  - `video.webm`;
  - `network.har`;
- redaction markers appear where appropriate;
- disclaimer appears;
- `operatorReviewRequired: true` appears on screenshots;
- no EV is represented as captured.

### 3. DOM card summary sanitizer trims unsafe heading text

No live env required.

Test the sanitizer or extraction helper with sample unsafe heading strings.

Assert unsafe values are redacted/truncated and safe text remains useful.

### 4. Screenshot capture self-skips without live env

Live env required only if configured.

Use:

```ts
skipIfMissingPccLiveEnv(test);
```

When env is missing, this test self-skips clearly.

When env is configured:

- load `PCC_LIVE_PAGE_URL`;
- navigate all eight surfaces through Prompt 04 page object;
- capture above-fold/full-page/scroll-segment screenshots;
- extract DOM card summaries;
- write screenshot evidence files under `PCC_EVIDENCE_OUTPUT_DIR`;
- assert every surface has:
  - at least one above-fold screenshot;
  - one full-page screenshot;
  - at least one scroll segment screenshot;
  - at least one card summary or an explicit warning if no card exists;
- assert output files exist.

Important:

- Do not stage generated screenshot artifacts.
- Closeout should report output directory path only.
- Do not print screenshot contents or raw file lists beyond safe output path and counts.

---

## Optional Root Script

If materially useful, add this opt-in-only script to root `package.json`:

```json
"pcc:e2e:screenshots": "playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts"
```

Do not wire it into:

```text
test
e2e
build
CI
Turbo defaults
```

Do not modify `pnpm-lock.yaml`.

If `package.json` is not changed, omit it from changed files and validation targets.

---

## README Update Requirements

Update `e2e/pcc-live/README.md` with a concise Prompt 05 section.

Include:

```text
screenshot capture purpose
above-fold/full-page/scroll-segment capture definitions
DOM card summary extraction boundary
EV-37..EV-49 and EV-125..EV-134 initial support scope
operator-review requirement before committing screenshots
screenshot sensitivity warning
PCC_EVIDENCE_OUTPUT_DIR usage
run command
not-final-scoring disclaimer
```

Do not remove Prompt 01–04 safety posture.

---

## Evidence / EV Status Rules

Prompt 05 can generate screenshot and DOM-summary evidence support for:

```text
EV-37..EV-49
EV-125..EV-134
```

Prompt 05 must not:

- modify `PCC_EVIDENCE_REGISTRY` statuses;
- mark any EV as `captured`;
- calculate final scorecard status;
- mark hard stops passed/failed;
- imply Phase 4 readiness.

Use language like:

```text
initial screenshot support
operator-review pending
screenshot inventory ready for review
DOM summary ready for review
```

Do not use language like:

```text
captured
passed
approved
complete
score-ready
Phase 4 ready
```

---

## Validation Commands

Run and report:

```bash
git status --short
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm exec prettier --check --ignore-unknown e2e/pcc-live package.json
git diff --check
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

If `package.json` is not changed, it is acceptable to omit `package.json` from the Prettier target.

Do not run live tenant screenshot capture unless valid `PCC_LIVE_*` env and storageState are intentionally configured.

If a live run is performed, closeout must include:

```text
whether live screenshot capture ran or self-skipped
whether screenshot files were written
output directory path only
total screenshot count
surface count
DOM card summary count
no raw screenshot content
no cookies/tokens/storageState
```

---

## Acceptance Criteria

Prompt 05 is complete only when:

- screenshot evidence EV tuple is strict and valid;
- screenshot capture module exists;
- screenshot evidence writer exists;
- screenshot spec exists and self-skips live capture without env/storageState;
- all eight surfaces are covered by live capture logic;
- above-fold, full-page, and scroll-segment screenshot types are represented;
- DOM card summaries are extracted from stable `data-pcc-*` selectors and sanitized;
- writer produces the four expected metadata/report files in tests;
- writer excludes unsafe raw/auth/session text from JSON/markdown;
- screenshot artifacts are marked `operatorReviewRequired: true`;
- no screenshot artifacts are staged/committed automatically;
- Prompt 04 surface smoke tests still pass;
- Prompt 02 registry tests still pass;
- Prompt 03 traceability tests still pass;
- no EV is marked captured;
- no hard stop is marked passed/failed;
- no final score is calculated or implied;
- no PCC runtime/source files are modified;
- `pnpm-lock.yaml` is unchanged.

---

## Stop Conditions

Stop and report instead of continuing if:

- Prompt 01–04 foundation files are missing;
- Prompt 04 URL-boundary/sanitization hardening is missing;
- existing Prompt 05 files conflict with this design;
- implementation requires PCC runtime/source edits;
- implementation requires Playwright config edits;
- implementation requires `.gitignore` changes;
- `pnpm-lock.yaml` changes;
- screenshot capture would require clicking mutation controls;
- any writer would serialize cookies, storageState, tokens, raw traces/videos/HARs, raw Playwright outputs, request/response payloads, or unsanitized console output;
- any implementation attempts score calculation or hard-stop pass/fail decisions.

---

## Required Closeout Response

Return exactly this structure:

```markdown
Prompt completed.

Files changed:

- <path>
- <path>

Validation:

- `git status --short` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts --list` — <result>
- `pnpm exec prettier --check --ignore-unknown e2e/pcc-live package.json` — <result or adjusted command with reason>
- `git diff --check` — <result>
- `pnpm --filter @hbc/spfx-project-control-center check-types` — <result>
- `pnpm --filter @hbc/spfx-project-control-center test` — <result>

Evidence / scorecard impact:

- Screenshot evidence tooling established.
- Above-fold/full-page/scroll-segment capture support established.
- DOM card-summary extraction established.
- Initial EV-37..EV-49 and EV-125..EV-134 evidence support established.
- Evidence remains operator-review pending.
- No final 100-point score calculated.
- No hard stop marked passed/failed.

Safety confirmation:

- No tenant mutation.
- Live screenshot capture <ran/self-skipped/not run> with reason.
- No storageState committed.
- No raw Playwright artifacts committed.
- No raw console dumps committed.
- No screenshot artifacts staged/committed automatically.
- No PCC runtime source modified.
- `pnpm-lock.yaml` unchanged.
- No EV marked captured.

Residual risks or pending items:

- <items>
```
