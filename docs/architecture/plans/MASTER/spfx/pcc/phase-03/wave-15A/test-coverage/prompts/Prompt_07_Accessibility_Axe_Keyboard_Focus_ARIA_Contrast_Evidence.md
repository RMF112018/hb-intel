# Prompt 07 — PCC Accessibility, Axe, Keyboard, Focus, ARIA, Contrast, Reduced-Motion, Hover-Only, Touch, and Modal Evidence

## Role

You are the local code agent implementing **Prompt 07** for the PCC 100-Point UI/UX Mold Breaker Scorecard evidence automation track in the `RMF112018/hb-intel` repository.

You are implementing **safe, opt-in accessibility evidence tooling** for Axe, keyboard navigation, focus order, focus-visible behavior, ARIA/labels, disabled-control reasons, contrast, reduced motion, hover-only dependency checks, touch target checks, and drawer/modal focus evidence.

You are **not** calculating a final score, not marking evidence captured, not marking hard stops passed/failed, not editing PCC runtime/source code, and not committing live evidence artifacts automatically.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

---

## Critical Context

Prompt 01 established the PCC live Playwright harness.

Prompt 02 established evidence registry and manifest infrastructure.

Prompt 03 established scorecard pillar/hard-stop traceability.

Prompt 04 established safe live page-object/surface-smoke tooling and hardened:

- live tab navigation;
- URL origin/hostname boundary checks;
- sanitized baseline EV-52 / EV-55 output.

Prompt 05 established screenshot and DOM summary evidence tooling.

Prompt 06 established breakpoint/container/overflow/rowspan/touch evidence tooling.

The attached Prompt 07 objective was:

```text
Add @axe-core/playwright if approved/absent. Implement keyboard navigation, focus order, focus-visible, ARIA, label, disabled reason, contrast/axe, reduced motion, hover-only, touch target, and drawer/modal focus evidence for EV-72..EV-82.
```

This updated prompt expands that objective into a safe, deterministic, repo-auditable implementation contract.

---

## Dependency Posture

Current repo truth indicates root `package.json` includes `@playwright/test` but does **not** include `@axe-core/playwright`.

Prompt 07 explicitly approves adding `@axe-core/playwright` as a root `devDependency` **if still absent in local repo truth**.

Allowed dependency behavior:

1. If `@axe-core/playwright` is already present locally, do not modify dependencies.
2. If absent, add it as a root devDependency using pnpm so `pnpm-lock.yaml` changes are expected and allowed for this prompt only.
3. Do not add any other dependency.
4. Do not wire accessibility tests into default `test`, `e2e`, `build`, CI, or Turbo defaults.
5. If dependency installation fails or would require unrelated dependency churn, stop and report.

Recommended command if absent:

```bash
pnpm add -D @axe-core/playwright
```

Then verify only `package.json` and `pnpm-lock.yaml` changed for the dependency update, in addition to allowed Prompt 07 files.

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
e2e/pcc-live/pcc-live.breakpoint-capture.ts
e2e/pcc-live/pcc-live.breakpoint.types.ts
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
```

Important current selector/data-marker context:

```text
[data-pcc-horizontal-tabs]
[data-pcc-tab-id]
[data-pcc-tab-active]
[data-pcc-active-surface-panel]
[data-pcc-bento-grid]
[data-pcc-card]
[data-pcc-card-hierarchy]
[data-pcc-card-tier]
[data-pcc-card-region]
[data-pcc-footprint]
[data-pcc-heading-level]
```

Critical distinction:

```text
Automate accessibility evidence collection, inventory, and traceability.
Do not automatically calculate the final 100-point score.
Do not mark EVs captured without operator/expert review.
Do not mark hard stops passed or failed.
```

---

## Repo-Truth Gate Before Editing

Before editing, verify current checkout has Prompt 01–06 foundation and dependency posture.

Run/inspect enough to confirm:

```bash
git status --short
test -f playwright.pcc-live.config.ts
test -f e2e/pcc-live/pcc-live.env.ts
test -f e2e/pcc-live/pcc-live.surfaces.ts
test -f e2e/pcc-live/pcc-live.page-object.ts
test -f e2e/pcc-live/pcc-live.breakpoint.types.ts
test -f e2e/pcc-live/pcc-live.breakpoint.spec.ts
test -f e2e/pcc-live/pcc-evidence.types.ts
test -f e2e/pcc-live/pcc-evidence.registry.ts
test -f docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
node -e "const p=require('./package.json'); console.log(Boolean(p.devDependencies?.['@axe-core/playwright'] || p.dependencies?.['@axe-core/playwright']))"
```

Inspect only as needed:

```bash
sed -n '1,260p' e2e/pcc-live/pcc-live.page-object.ts
sed -n '1,220p' e2e/pcc-live/pcc-live.surfaces.ts
sed -n '1,220p' e2e/pcc-live/pcc-live.breakpoint-capture.ts
cat package.json
```

Stop and report if:

- any Prompt 01–06 foundation file is missing;
- `@axe-core/playwright` cannot be installed cleanly if absent;
- existing Prompt 07 accessibility files already exist and conflict with this design;
- implementation appears to require PCC runtime/source edits;
- live accessibility capture would require clicking mutation controls.

---

## Objective

Implement Prompt 07 accessibility evidence tooling that can, when live env/storageState is intentionally configured:

1. Navigate all eight PCC surfaces using the Prompt 04 safe page object.
2. Run Axe accessibility analysis safely and summarize findings.
3. Measure keyboard navigation and focus order evidence.
4. Measure focus-visible / visible-focus indicator evidence.
5. Inspect ARIA, role, label, and accessible-name evidence.
6. Inspect disabled controls for explicit disabled-state reasons.
7. Collect contrast evidence through Axe color-contrast summaries and optional computed-style heuristics.
8. Inspect reduced-motion preference behavior.
9. Inspect hover-only dependency risk.
10. Reuse or duplicate safe touch-target measurement boundaries for accessibility evidence.
11. Inspect drawer/modal/dialog focus containment evidence when present; record `not-observed` when absent rather than failing.
12. Write deterministic sanitized accessibility evidence outputs.
13. Map initial support to:
    - `EV-72` through `EV-82`.
14. Preserve review boundaries:
    - evidence output is operator-review pending;
    - no EV registry status changes;
    - no final score;
    - no hard-stop pass/fail decisions.

Accessibility evidence may contain DOM selectors, labels, and issue descriptions. Do not persist raw DOM HTML, raw Axe node HTML, raw full text content, cookies, tokens, storageState, request payloads, or unsanitized console output.

---

## Required Files To Add

Create these files unless repo truth shows equivalent files already exist:

```text
e2e/pcc-live/pcc-live.accessibility.types.ts
e2e/pcc-live/pcc-live.accessibility-capture.ts
e2e/pcc-live/pcc-live.accessibility-evidence-writer.ts
e2e/pcc-live/pcc-live.accessibility.spec.ts
```

Update these existing files only if needed:

```text
e2e/pcc-live/README.md
package.json
pnpm-lock.yaml
```

`package.json` and `pnpm-lock.yaml` may change **only** to add `@axe-core/playwright` if absent and to add an optional opt-in root script. If `@axe-core/playwright` is already present, `pnpm-lock.yaml` should remain unchanged.

Do not create committed live accessibility evidence artifacts in this prompt. Live artifacts should be written only when live tests are intentionally run with valid env/storageState and must remain uncommitted until operator review/scrubbing.

---

## Files Allowed To Modify

Allowed:

```text
e2e/pcc-live/pcc-live.accessibility.types.ts
e2e/pcc-live/pcc-live.accessibility-capture.ts
e2e/pcc-live/pcc-live.accessibility-evidence-writer.ts
e2e/pcc-live/pcc-live.accessibility.spec.ts
e2e/pcc-live/README.md
package.json
pnpm-lock.yaml
```

Do not modify:

```text
apps/project-control-center/src/**
apps/project-control-center/package.json
apps/project-control-center/config/**
apps/project-control-center/src/webparts/**
packages/**
backend/**
playwright.config.ts
playwright.kudos-live.config.ts
playwright.homepage-live.config.ts
playwright.pcc-live.config.ts
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.evidence-writer.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
e2e/pcc-live/pcc-live.screenshot.types.ts
e2e/pcc-live/pcc-live.screenshot-capture.ts
e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
e2e/pcc-live/pcc-live.screenshot.spec.ts
e2e/pcc-live/pcc-live.breakpoint.types.ts
e2e/pcc-live/pcc-live.breakpoint-matrix.ts
e2e/pcc-live/pcc-live.breakpoint-capture.ts
e2e/pcc-live/pcc-live.breakpoint-evidence-writer.ts
e2e/pcc-live/pcc-live.breakpoint.spec.ts
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
- serialize cookies, tokens, storageState, request headers, localStorage, sessionStorage, personal data, raw DOM HTML, raw Axe node HTML, or auth/session context in JSON/markdown;
- mark any EV as `captured` in the registry;
- calculate the final 100-point score;
- mark hard stops as passed or failed.

Accessibility evidence is operator-review pending. Metadata may become commit-eligible only after review/scrubbing.

Navigation remains limited to Prompt 04 safe tab navigation. Keyboard tests may press `Tab`, `Shift+Tab`, `Escape`, and arrow keys where appropriate; do not press `Enter` or `Space` on unknown controls unless the target is a safe navigation tab or the test is synthetic/local-only.

---

## Required EV Scope

Prompt 07 creates initial support artifacts for:

```text
EV-72
EV-73
EV-74
EV-75
EV-76
EV-77
EV-78
EV-79
EV-80
EV-81
EV-82
```

Define a strict tuple:

```ts
export const PCC_ACCESSIBILITY_EVIDENCE_IDS = [
  'EV-72',
  'EV-73',
  'EV-74',
  'EV-75',
  'EV-76',
  'EV-77',
  'EV-78',
  'EV-79',
  'EV-80',
  'EV-81',
  'EV-82',
] as const;
```

Rules:

- Use only EV IDs from Prompt 02 `PccEvidenceId`.
- Add compile-time guard that the tuple IDs are assignable to `PccEvidenceId`.
- Do not include EV IDs outside the specified list.
- Do not mark any of these EVs captured.
- Use status wording such as:
  - `operator-review-pending`;
  - `initial-accessibility-support`;
  - `accessibility-inventory-ready`.

Do not use status wording such as:

```text
captured
passed
complete
approved
score-ready
Phase 4 ready
```

---

## Accessibility Types Module

Create:

```text
e2e/pcc-live/pcc-live.accessibility.types.ts
```

Required exported types/interfaces:

```ts
export type PccAccessibilityEvidenceId = (typeof PCC_ACCESSIBILITY_EVIDENCE_IDS)[number];

export type PccA11yRunState = 'completed' | 'self-skipped' | 'writer-test-only';

export type PccA11yObservationStatus =
  | 'observed'
  | 'not-observed'
  | 'needs-review'
  | 'operator-review-pending';

export interface PccAxeViolationSummary {
  surfaceId: PccLiveSurfaceId;
  ruleId: string;
  impact?: string;
  count: number;
  help?: string;
  helpUrl?: string;
  tags: string[];
  sanitizedTargets: string[];
}

export interface PccKeyboardFocusObservation {
  surfaceId: PccLiveSurfaceId;
  focusStep: number;
  role?: string;
  tagName: string;
  selector: string;
  hasAccessibleName: boolean;
  hasVisibleFocusIndicator: boolean;
  boundingWidth: number;
  boundingHeight: number;
}

export interface PccAriaLabelObservation {
  surfaceId: PccLiveSurfaceId;
  selector: string;
  tagName: string;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  accessibleNamePresent: boolean;
  disabled: boolean;
  disabledReasonPresent: boolean;
  needsReview: boolean;
}

export interface PccContrastObservation {
  surfaceId: PccLiveSurfaceId;
  ruleId: 'color-contrast' | 'computed-contrast-heuristic';
  count: number;
  needsReview: boolean;
  details: string;
}

export interface PccReducedMotionObservation {
  surfaceId: PccLiveSurfaceId;
  reducedMotionEmulated: boolean;
  animationRiskCount: number;
  transitionRiskCount: number;
  needsReview: boolean;
}

export interface PccHoverOnlyObservation {
  surfaceId: PccLiveSurfaceId;
  hoverOnlyRiskCount: number;
  selectors: string[];
  needsReview: boolean;
}

export interface PccDialogFocusObservation {
  surfaceId: PccLiveSurfaceId;
  status: PccA11yObservationStatus;
  dialogCount: number;
  modalCount: number;
  focusTrapObserved?: boolean;
  notes: string[];
}

export interface PccA11yTouchTargetObservation {
  surfaceId: PccLiveSurfaceId;
  selector: string;
  role?: string;
  tagName: string;
  width: number;
  height: number;
  belowRecommendedSize: boolean;
}

export interface PccAccessibilitySurfaceEvidence {
  surfaceId: PccLiveSurfaceId;
  label: string;
  axeViolations: PccAxeViolationSummary[];
  keyboardFocus: PccKeyboardFocusObservation[];
  ariaLabels: PccAriaLabelObservation[];
  contrast: PccContrastObservation[];
  reducedMotion: PccReducedMotionObservation;
  hoverOnly: PccHoverOnlyObservation;
  dialogFocus: PccDialogFocusObservation;
  touchTargets: PccA11yTouchTargetObservation[];
  warnings: string[];
}

export interface PccAccessibilityEvidenceRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  selfSkipped: boolean;
  runState: PccA11yRunState;
  evRefs: readonly PccEvidenceId[];
  surfaces: PccAccessibilitySurfaceEvidence[];
  summary: {
    totalSurfaces: number;
    totalAxeViolations: number;
    totalKeyboardFocusStops: number;
    totalAriaNeedsReview: number;
    totalContrastNeedsReview: number;
    totalReducedMotionRisks: number;
    totalHoverOnlyRisks: number;
    totalDialogFocusNeedsReview: number;
    totalTouchTargetIssues: number;
    totalWarnings: number;
  };
  warnings: string[];
  disclaimer: string;
}
```

Add compile-time guards:

- accessibility EV tuple IDs are assignable to `PccEvidenceId`;
- EV tuple has 11 entries;
- EV tuple is unique;
- EV tuple ID union does not widen to `string`.

---

## Accessibility Capture Module

Create:

```text
e2e/pcc-live/pcc-live.accessibility-capture.ts
```

Required behavior:

1. Accept:
   - Playwright `Page`;
   - Prompt 04 `PccLivePageObject`;
   - eight surfaces;
   - optional capture limits;
   - optional Axe enabled flag.
2. For each surface:
   - navigate through Prompt 04 safe tab navigation;
   - scope analysis to the active surface panel when possible:
     - `[data-pcc-active-surface-panel="<surfaceId>"]`
   - run Axe using `@axe-core/playwright`:
     - use `new AxeBuilder({ page })`;
     - include active surface panel selector when available;
     - analyze;
     - summarize violations only.
3. Keyboard/focus:
   - collect focus order by pressing `Tab` a bounded number of times. Recommended cap: 40 focus stops per surface.
   - do not press `Enter`/`Space` on focused controls.
   - record selector, tag, role, bounding dimensions, accessible-name presence, and visible-focus indicator.
   - focus-visible heuristic may inspect computed `outlineStyle`, `outlineWidth`, `boxShadow`, or border delta on the focused element.
4. ARIA/labels:
   - inspect interactive elements:
     - `button`
     - `a[href]`
     - `[role="button"]`
     - `[role="tab"]`
     - `input`
     - `select`
     - `textarea`
     - `[tabindex]:not([tabindex="-1"])`
   - cap observations. Recommended cap: 120 per surface.
   - record role/tag/ARIA attributes and booleans only.
   - do not persist full visible text.
   - derive `accessibleNamePresent` from safe sources:
     - `aria-label`;
     - `aria-labelledby`;
     - `title`;
     - alt text for images, if applicable;
     - trimmed visible text presence as boolean only, not persisted.
5. Disabled reasons:
   - for disabled/aria-disabled controls, check for a reason via safe attributes only:
     - `aria-describedby`;
     - `data-pcc-disabled-reason`;
     - `title`;
     - adjacent reason region only as boolean, not text.
6. Contrast:
   - use Axe `color-contrast` violation summaries as the primary contrast evidence.
   - optional computed-style heuristic may count low-confidence items as `needsReview`; do not claim contrast pass/fail.
7. Reduced motion:
   - emulate `prefers-reduced-motion: reduce` for the live capture context where feasible:
     - `await page.emulateMedia({ reducedMotion: 'reduce' })`
   - inspect visible elements for CSS animation/transition risks by counting non-none animation names and non-zero transition durations.
   - do not mutate app state.
8. Hover-only:
   - inspect for likely hover-only risks such as elements with hover-revealed content patterns or controls that only appear after hover.
   - If reliable detection is not possible, record heuristic `needsReview`.
   - Do not require pass/fail.
9. Dialog/modal/drawer focus:
   - inspect existing visible `[role="dialog"]`, `[aria-modal="true"]`, `[data-pcc-drawer]`, `[data-pcc-modal]`.
   - Do not open drawers/modals unless there is a clearly safe non-mutating control marked with a stable PCC data attribute indicating preview/open only.
   - If none are present, record `status: 'not-observed'` and do not fail.
10. Touch targets:

- measure interactive controls without clicking.
- use 44px x 44px threshold for touch/accessibility evidence.
- record selector/dimensions only.

Sanitization requirements:

- Do not persist raw DOM HTML.
- Do not persist Axe `nodes[].html`.
- Do not persist full visible text.
- Do not persist href URLs with query strings.
- Do not persist email/user/contact/body text.
- Use only selectors, roles, ARIA attribute presence/short values, counts, dimensions, sanitized rule/help names, and sanitized warnings.

---

## Axe Summary Requirements

Axe output can include raw DOM snippets and targets. The capture module must summarize Axe results as follows:

Allowed:

```text
rule ID
impact
count
help
help URL after query stripping
tags
sanitized target selectors
```

Forbidden:

```text
node.html
raw failureSummary
raw any/all/none check messages if they contain DOM text
raw page URL with query strings
```

Sanitize:

- email-like values -> `[redacted-email]`
- long token-like values -> `[redacted-blob]`
- credential keywords -> `[redacted-cred]`
- query strings stripped from URLs
- target arrays capped. Recommended cap: 10 targets per rule.

---

## Accessibility Evidence Writer

Create:

```text
e2e/pcc-live/pcc-live.accessibility-evidence-writer.ts
```

Required output files:

```text
pcc-live-accessibility-evidence.json
pcc-live-accessibility-evidence.md
pcc-live-axe-summary.json
pcc-live-keyboard-focus-summary.json
pcc-live-aria-label-summary.json
pcc-live-contrast-summary.json
```

Write these under the provided run output directory:

```text
<PCC_EVIDENCE_OUTPUT_DIR>/accessibility-<run-id>/
```

Do not write under `test-results/` or `playwright-report/`.

Evidence JSON must include:

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
This output is accessibility, keyboard, focus, ARIA, contrast, reduced-motion, hover-only, touch-target, and dialog-focus evidence support for EV-72..EV-82 only. It is not a final scorecard result and does not mark any EV captured without operator review.
```

Markdown summary must include:

```text
run ID
generated timestamp
tenant site/page
expected package version
EV refs
surface accessibility summary table
axe violation count
keyboard focus stop count
ARIA needs-review count
contrast needs-review count
reduced-motion risk count
hover-only risk count
dialog/modal focus status summary
touch target issue count
operator-review reminder
not-final-scoring disclaimer
```

Sanitization requirements:

- Reuse or duplicate conservative Prompt 04/05/06 sanitization logic.
- Sanitize all free-text fields written to JSON/markdown.
- Preserve safe curated repo/output paths.
- Exclude raw Playwright/auth/session paths from artifact references if artifact references are included.
- Do not serialize cookies, tokens, storageState, request/response payloads, raw console dumps, headers, raw DOM HTML, or raw Axe node HTML.

---

## Accessibility Spec

Create:

```text
e2e/pcc-live/pcc-live.accessibility.spec.ts
```

Required tests:

### 1. Accessibility EV tuple is valid

No live env required.

Assert:

- EV tuple contains exactly `EV-72..EV-82`;
- every tuple ID exists in `REQUIRED_PCC_EVIDENCE_IDS`;
- no duplicate EV IDs;
- no EV outside Prompt 07 scope.

### 2. Accessibility writer preserves sanitized output policy

No live env required.

Use temp directory and sample fake accessibility evidence.

Assert:

- writer produces all expected JSON/markdown files;
- safe curated path remains present if included;
- unsafe strings are not present in all generated files:
  - email address;
  - token-like blob;
  - query string;
  - raw DOM HTML snippet such as `<button`;
  - raw Axe node HTML marker;
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
- no EV is represented as captured.

### 3. Accessibility capture helpers preserve synthetic DOM boundaries

No live tenant env required.

Use `page.setContent(...)` with synthetic PCC-like DOM containing:

- active surface panel;
- tab buttons;
- unlabeled button;
- labelled button;
- disabled control with/without `aria-describedby` or `data-pcc-disabled-reason`;
- small touch target;
- visible focusable elements;
- a role dialog/modal sample if practical.

Assert:

- no raw body text is persisted in observations;
- unlabeled control is marked `accessibleNamePresent: false`;
- labelled control is marked `accessibleNamePresent: true`;
- disabled reason detection works by boolean;
- small touch target is flagged;
- dialog/modal observation is either observed or not-observed without pass/fail semantics.

### 4. Axe summary strips raw DOM HTML

No live tenant env required.

Run Axe on synthetic DOM or pass a synthetic Axe-like result into the summarizer.

Assert:

- summarized violations include rule IDs/counts/tags;
- raw `node.html` is not persisted;
- raw DOM HTML snippets are absent;
- targets are capped and sanitized.

### 5. Live accessibility capture self-skips without live env

Live env required only if configured.

Use:

```ts
skipIfMissingPccLiveEnv(test);
```

When env is missing, this test self-skips clearly.

When env is configured:

- load `PCC_LIVE_PAGE_URL`;
- navigate all eight surfaces through Prompt 04 page object;
- collect accessibility evidence;
- write output files under `PCC_EVIDENCE_OUTPUT_DIR`;
- assert:
  - all eight surfaces represented;
  - output files exist;
  - no raw DOM HTML in output files;
  - no EV captured status emitted.

Important:

- Do not stage generated evidence artifacts.
- Closeout should report output directory path only plus counts.
- Do not print raw Axe result content, DOM HTML, or full issue payloads.

---

## Optional Root Script

If materially useful, add this opt-in-only script to root `package.json`:

```json
"pcc:e2e:accessibility": "playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts"
```

Do not wire it into:

```text
test
e2e
build
CI
Turbo defaults
```

Do not modify `pnpm-lock.yaml` except for the approved `@axe-core/playwright` dependency addition if absent.

If `package.json` is not changed, omit it from changed files and validation targets.

---

## README Update Requirements

Update `e2e/pcc-live/README.md` with a concise Prompt 07 section.

Include:

```text
accessibility evidence purpose
Axe dependency posture
keyboard/focus/ARIA/contrast/reduced-motion/hover-only/touch/dialog evidence scope
EV-72..EV-82 initial support scope
operator-review requirement before committing evidence
raw DOM/Axe node HTML prohibition
PCC_EVIDENCE_OUTPUT_DIR usage
run command
not-final-scoring disclaimer
```

Do not remove Prompt 01–06 safety posture.

---

## Evidence / EV Status Rules

Prompt 07 can generate accessibility evidence support for:

```text
EV-72..EV-82
```

Prompt 07 must not:

- modify `PCC_EVIDENCE_REGISTRY` statuses;
- mark any EV as `captured`;
- calculate final scorecard status;
- mark hard stops passed/failed;
- imply Phase 4 readiness.

Use language like:

```text
initial accessibility support
operator-review pending
axe summary ready for review
keyboard/focus inventory ready for review
ARIA/label inventory ready for review
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
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
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

If `@axe-core/playwright` was added, also run:

```bash
pnpm install --frozen-lockfile
```

or another repo-compatible lockfile validation command if the repo uses a different package-manager validation convention.

If `package.json` is not changed, it is acceptable to omit `package.json` from the Prettier target.

Do not run live tenant accessibility capture unless valid `PCC_LIVE_*` env and storageState are intentionally configured.

If a live run is performed, closeout must include:

```text
whether live accessibility capture ran or self-skipped
whether evidence files were written
output directory path only
surface count
axe violation summary count
keyboard focus stop count
ARIA needs-review count
contrast needs-review count
reduced-motion risk count
hover-only risk count
touch target issue count
dialog/modal observation count
warning count
no raw DOM HTML
no raw Axe node HTML
no cookies/tokens/storageState
```

---

## Acceptance Criteria

Prompt 07 is complete only when:

- accessibility EV tuple is strict and valid;
- `@axe-core/playwright` is present if absent and no unrelated dependency is added;
- accessibility capture module exists;
- accessibility evidence writer exists;
- accessibility spec exists and self-skips live capture without env/storageState;
- all eight surfaces are covered by live capture logic;
- Axe violation summaries are sanitized and do not include raw DOM HTML;
- keyboard focus order evidence is collected without activating unknown controls;
- focus-visible heuristic is recorded;
- ARIA/label observations are recorded without full text persistence;
- disabled reason detection is boolean/safe;
- contrast evidence is summarized without final pass/fail claims;
- reduced-motion evidence is recorded without mutating app data;
- hover-only risk evidence is recorded as heuristic/review-pending;
- dialog/modal focus evidence records observed/not-observed without pass/fail;
- touch target measurements are recorded without clicking;
- writer produces all expected metadata/report files in tests;
- writer excludes unsafe raw/auth/session/DOM/Axe text from JSON/markdown;
- evidence artifacts are not staged/committed automatically;
- Prompt 06 breakpoint tests still pass;
- Prompt 05 screenshot tests still pass;
- Prompt 04 surface-smoke tests still pass;
- Prompt 02 registry tests still pass;
- Prompt 03 traceability tests still pass;
- no EV is marked captured;
- no hard stop is marked passed/failed;
- no final score is calculated or implied;
- no PCC runtime/source files are modified;
- `pnpm-lock.yaml` changes only if `@axe-core/playwright` was absent and added.

---

## Stop Conditions

Stop and report instead of continuing if:

- Prompt 01–06 foundation files are missing;
- Prompt 04 URL-boundary/sanitization hardening is missing;
- Prompt 05/06 writer safety posture is missing;
- `@axe-core/playwright` cannot be added cleanly if absent;
- dependency installation causes unrelated dependency churn;
- existing Prompt 07 files conflict with this design;
- implementation requires PCC runtime/source edits;
- implementation requires Playwright config edits;
- implementation requires `.gitignore` changes;
- keyboard tests would need to press Enter/Space on unknown live controls;
- any writer would serialize cookies, storageState, tokens, raw traces/videos/HARs, raw Playwright outputs, request/response payloads, raw console dumps, raw DOM HTML, raw Axe node HTML, or unsanitized text output;
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
- dependency action — <not needed/already present/added @axe-core/playwright>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts` — <result>
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

- Accessibility/Axe evidence tooling established.
- Keyboard/focus/focus-visible evidence support established.
- ARIA/label/disabled-reason evidence support established.
- Contrast/reduced-motion/hover-only evidence support established.
- Touch target and dialog/modal focus evidence support established.
- Initial EV-72..EV-82 evidence support established.
- Evidence remains operator-review pending.
- No final 100-point score calculated.
- No hard stop marked passed/failed.

Safety confirmation:

- No tenant mutation.
- Live accessibility capture <ran/self-skipped/not run> with reason.
- No storageState committed.
- No raw Playwright artifacts committed.
- No raw console dumps committed.
- No raw DOM HTML or raw Axe node HTML committed.
- No accessibility evidence artifacts staged/committed automatically.
- No PCC runtime source modified.
- `pnpm-lock.yaml` <unchanged/changed only for @axe-core/playwright>.
- No EV marked captured.

Residual risks or pending items:

- <items>
```
