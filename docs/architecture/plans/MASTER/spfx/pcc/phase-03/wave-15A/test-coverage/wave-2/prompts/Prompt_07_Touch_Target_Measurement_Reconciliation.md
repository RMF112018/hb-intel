# Prompt 07 — Touch Target Measurement Reconciliation — Updated

## Role

You are acting as a senior TypeScript/Playwright test architect, SPFx evidence-harness maintainer, UI/UX audit systems engineer, accessibility audit systems engineer, and repository-quality reviewer.

You are working in the local repository:

```text
RMF112018/hb-intel
```

## Mandatory Session Rules

- Start from repo truth. Run `git status --short`, `git branch --show-current`, and `git rev-parse --short HEAD` before making changes.
- Do not re-read files that are still within your current context or memory. Reopen a file only if it may have changed, if exact code is required, or if prior context is stale.
- Make the smallest coherent set of changes necessary to satisfy this prompt.
- Preserve existing architecture and naming patterns unless this prompt explicitly instructs a targeted adjustment.
- Do not calculate final scorecard points.
- Do not mark hard stops as passed or failed.
- Do not mark EVs as finally captured by automation.
- Do not claim WCAG conformance, WCAG failure, accessibility pass/fail, scorecard pass/fail, or Phase 4 readiness.
- Do not generate or commit storageState, cookies, tokens, raw traces, videos, HAR files, raw `test-results/`, or raw `playwright-report/`.
- Do not emit raw DOM HTML, raw axe node payloads, tenant-sensitive URLs, auth/session material, or unsanitized selectors/text.
- Do not add live write-side PCC actions or tenant mutation behavior.
- Keep all outputs expert-review / operator-review oriented.
- Do not modify product UI runtime files.
- Do not change dependencies, `pnpm-lock.yaml`, package metadata, SPFx manifests, or package-solution files.

## Completion Summary Required

When finished, respond with:

```text
Commit summary:
<one-line summary>

Commit description:
- Objective:
- Files changed:
- What changed:
- Validation:
- Safety/scoring boundary:
- Residual risks:
- Suggested next prompt:
```

## Objective

Reconcile the breakpoint and accessibility lane touch-target measurement discrepancy.

The reviewed evidence showed:

- breakpoint evidence: `Touch target measurement count: 0`;
- accessibility evidence: `Touch target issue count: 145`.

The goal is to make the two lanes consistent, explainable, and useful for P7/P8 and HS-05/HS-07 review.

## Why This Matters

Conflicting touch-target evidence weakens field/tablet usability review. A scorecard auditor should not have to decide whether the suite measured touch targets or not. After this prompt, the suite should make clear:

- what each lane attempted to measure;
- what root/scope was used;
- how many candidates were found;
- how many were filtered out;
- what threshold was applied;
- why the two lanes may intentionally report different counts.

## Current Repo Truth to Preserve

Current breakpoint touch-target behavior:

- `measureBreakpointTouchTargets` lives in `e2e/pcc-live/pcc-live.breakpoint-capture.ts`.
- It uses a local `INTERACTIVE_SELECTOR`.
- It looks for `[data-pcc-active-surface-panel="<surfaceId>"]`, then falls back to `body`.
- It filters hidden elements using `offsetParent`.
- It filters disabled form controls.
- It applies threshold `44` on touch viewports and `32` on non-touch viewports.
- It returns `PccLiveTouchTargetMeasurement[]`.

Current accessibility touch-target behavior:

- `collectTouchTargetObservations` lives in `e2e/pcc-live/pcc-live.accessibility-capture.ts`.
- It uses a local `INTERACTIVE_SELECTOR`.
- It scopes to the supplied root selector.
- It filters hidden elements using `offsetParent`.
- It does not currently filter disabled controls.
- It applies threshold `44`.
- It returns `PccA11yTouchTargetObservation[]`.

Current issue-register outputs to preserve:

- Prompt 05 breakpoint issue register:
  - `pcc-live-breakpoint-issue-register.json`
  - `pcc-live-breakpoint-issue-register.md`
- Prompt 06 accessibility issue register:
  - `pcc-live-accessibility-issue-register.json`
  - `pcc-live-accessibility-issue-register.md`

Prompt 07 must preserve these artifacts and update their touch-target context only as needed.

## Repo Areas to Inspect

```text
e2e/pcc-live/pcc-live.breakpoint-capture.ts
e2e/pcc-live/pcc-live.breakpoint.types.ts
e2e/pcc-live/pcc-live.breakpoint-evidence-writer.ts
e2e/pcc-live/pcc-live.breakpoint.spec.ts

e2e/pcc-live/pcc-live.accessibility-capture.ts
e2e/pcc-live/pcc-live.accessibility.types.ts
e2e/pcc-live/pcc-live.accessibility-evidence-writer.ts
e2e/pcc-live/pcc-live.accessibility.spec.ts

e2e/pcc-live/pcc-live.package-completeness.ts
e2e/pcc-live/pcc-live.package-completeness.spec.ts
e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
```

## Required Changes

### 1. Root Cause Review and Diagnostic Notes

Before implementation, identify why breakpoint touch-target counts can be zero while accessibility finds many issues.

Check and document in code/tests where relevant:

- selector parity;
- root scope parity;
- active panel selection;
- tab/action placement outside active panel;
- body fallback behavior;
- visibility filtering;
- disabled element handling;
- viewport threshold difference;
- live navigation timing and `assertSurfaceActive` state.

Do not add a long architecture document. Encode the resolution in helper names, summary fields, tests, and short runbook notes.

### 2. Prefer a Small Shared Touch-Target Helper

Create a small shared helper only if it reduces duplication and avoids future drift:

```text
e2e/pcc-live/pcc-live.touch-targets.ts
```

The helper should centralize:

- interactive selector;
- safe selector/text sanitization;
- visible element filtering;
- disabled element classification;
- root selection from a Playwright `Page` and root selector;
- measurement threshold calculation;
- bounded candidate iteration;
- diagnostic counts.

Suggested helper outputs:

```ts
export type PccTouchTargetMeasurementLane = 'breakpoint' | 'accessibility';

export interface PccTouchTargetScopeDiagnostics {
  rootSelector: string;
  rootFound: boolean;
  fallbackUsed: boolean;
  candidateCount: number;
  measuredCount: number;
  hiddenFilteredCount: number;
  disabledFilteredCount: number;
  thresholdPx: number;
  measurementLane: PccTouchTargetMeasurementLane;
}

export interface PccSharedTouchTargetMeasurement {
  selector: string;
  role?: string;
  tagName: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  visible: boolean;
  disabled: boolean;
  belowRecommendedSize: boolean;
  thresholdPx: number;
  measurementLane: PccTouchTargetMeasurementLane;
}
```

Keep the helper narrow. Do not over-engineer a generic DOM audit framework.

### 3. Align Measurement Semantics Without Erasing Lane Differences

Breakpoint lane semantics:

- Purpose: responsive/viewport field-fit measurement.
- Scope: active PCC surface panel when available; explicit fallback to `body` must be visible in diagnostics.
- Threshold:
  - `44px` for touch viewports;
  - `32px` for non-touch viewports;
  - threshold must be emitted per row.
- Disabled controls:
  - may be measured or excluded, but the choice must be explicit and diagnostics must count disabled exclusions if excluded.
  - Prefer measuring visible disabled elements as candidates and surfacing disabled state if doing so improves reconciliation with accessibility evidence, unless existing behavior depends on excluding disabled controls.

Accessibility lane semantics:

- Purpose: accessibility/touch review measurement.
- Scope: accessibility active surface/root selector.
- Threshold:
  - `44px`;
  - threshold must be emitted per row.
- Disabled controls:
  - should remain visible to accessibility review where relevant because disabled controls still need communication/context review.
  - If disabled controls are excluded from touch sizing, diagnostics must explain that explicitly.

Do not force both lanes to have identical issue counts. The goal is consistency and explainability, not equal numbers.

### 4. Extend Existing Touch-Target Types

Update existing types to include threshold and diagnostic context.

Breakpoint:

- Extend `PccLiveTouchTargetMeasurement` with:
  - `thresholdPx`
  - `measurementLane: 'breakpoint'`
  - `disabled?: boolean`
  - `visible?: boolean`
  - optional `x`, `y`
- Add a surface-level or run-level diagnostic field where appropriate:
  - `touchTargetScopeDiagnostics?: PccTouchTargetScopeDiagnostics`

Accessibility:

- Extend `PccA11yTouchTargetObservation` with:
  - `thresholdPx`
  - `measurementLane: 'accessibility'`
  - `disabled?: boolean`
  - `visible?: boolean`
  - optional `x`, `y`
- Add a surface-level or run-level diagnostic field where appropriate:
  - `touchTargetScopeDiagnostics?: PccTouchTargetScopeDiagnostics`

Keep additions backward compatible for existing tests by making new fields optional only where required. Prefer non-optional fields in newly generated rows if TypeScript changes remain manageable.

### 5. Update Capture Functions

Refactor these functions to use aligned/shared logic where practical:

```text
measureBreakpointTouchTargets
collectTouchTargetObservations
```

Requirements:

- breakpoint lane should not report zero measurements across all surface/viewport pairs when visible interactive controls exist;
- accessibility lane should continue to report accessibility/touch review issues;
- both lanes should emit threshold and measurement lane;
- both lanes should emit scope diagnostics somewhere in the resulting evidence payload;
- both lanes should preserve sanitization and avoid raw DOM/text leakage.

If the breakpoint lane still reports zero targets for a surface/viewport, it must produce an explanatory diagnostic reason such as:

```text
root-not-found
no-candidates-in-root
all-candidates-hidden
all-candidates-disabled-or-excluded
measurement-error
```

Represent this as a safe enum/string. Do not include raw HTML or raw selectors beyond sanitized selectors.

### 6. Update Writers and Markdown Summaries

Update breakpoint and accessibility evidence writers to include:

- touch target measurement lane explanation;
- threshold explanation;
- total candidate/measured/filtered counts where diagnostics are available;
- clear statement that differences between lanes may be expected due to scope and threshold;
- no scoring/pass-fail/readiness claims.

Update issue-register rows for touch-target issues to include:

- `thresholdPx`;
- `measurementLane`;
- `selector`;
- `width`;
- `height`;
- surface;
- viewport when applicable;
- review prompt / recommended action already present.

Do not create new artifact files unless necessary. Prefer enriching existing JSON/Markdown outputs.

### 7. Update Tests

Update or add tests covering:

1. Shared helper or aligned logic measures visible interactive controls in a synthetic DOM.
2. Hidden controls are filtered and counted in diagnostics.
3. Disabled controls are handled consistently with the chosen lane policy and counted in diagnostics if excluded.
4. Breakpoint lane produces nonzero measurements when visible controls exist.
5. Accessibility lane still reports touch-target issues under 44px threshold.
6. Breakpoint and accessibility rows include:
   - threshold;
   - measurement lane;
   - selector;
   - width;
   - height;
   - surface;
   - viewport where applicable.
7. If a root has zero measured targets, diagnostics explain why.
8. Prompt 05 breakpoint issue register still includes touch-target issue context.
9. Prompt 06 accessibility issue register still includes touch-target issue context.
10. No score, hard-stop pass/fail, WCAG pass/fail, accessibility pass/fail, EV final-capture, or Phase 4 readiness claims.
11. No unsafe auth/session/raw artifact terms.

### 8. Package Completeness

Do not change package-completeness expected files unless this prompt introduces a new artifact file.

Expected result for this prompt:

- package-completeness semantics and expected-file lists should remain unchanged;
- `pcc-live.package-completeness.spec.ts` should still pass.

### 9. Runbook Updates

Minimally update:

```text
e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
```

Add touch-target reconciliation guidance:

- breakpoint lane = responsive/viewport field-fit touch measurement;
- accessibility lane = accessibility/touch review measurement;
- thresholds may differ by lane/viewport;
- diagnostics explain zero-count cases;
- neither lane creates automated pass/fail.

## Validation

Run exactly:

```bash
git status --short
git branch --show-current
git rev-parse --short HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check e2e/pcc-live/pcc-live.touch-targets.ts e2e/pcc-live/pcc-live.breakpoint-capture.ts e2e/pcc-live/pcc-live.breakpoint.types.ts e2e/pcc-live/pcc-live.breakpoint-evidence-writer.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts e2e/pcc-live/pcc-live.accessibility-capture.ts e2e/pcc-live/pcc-live.accessibility.types.ts e2e/pcc-live/pcc-live.accessibility-evidence-writer.ts e2e/pcc-live/pcc-live.accessibility.spec.ts e2e/pcc-live/README.md docs/architecture/evidence/pcc-live/README.md
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If no shared helper is created, remove `e2e/pcc-live/pcc-live.touch-targets.ts` from the Prettier command. If an additional touched file is necessary, add it to the targeted Prettier command.

## Acceptance Criteria

- Breakpoint lane no longer produces zero touch-target measurements when visible controls exist.
- Accessibility lane still reports accessibility/touch target issues under its review threshold.
- Both lanes explain threshold, scope, diagnostics, and measurement purpose.
- Touch target issue/register outputs identify surface, viewport where applicable, selector, width, height, threshold, and measurement lane.
- Zero-count cases include an explanatory diagnostic reason.
- Package-completeness remains passing without expected-file churn.
- No hard-stop, accessibility, WCAG, scorecard, EV-capture, or readiness pass/fail is automated.
- No product UI runtime, dependency, lockfile, manifest, package metadata, or package-solution changes are introduced.
