# Prompt 06 — Accessibility Issue Register and Reviewer Action Matrix — Updated

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
- Do not claim WCAG conformance, WCAG failure, accessibility pass/fail, or Phase 4 readiness.
- Do not generate or commit storageState, cookies, tokens, raw traces, videos, HAR files, raw `test-results/`, or raw `playwright-report/`.
- Do not emit raw DOM HTML, raw axe node payloads, raw `node.html`, raw `failureSummary`, raw `any/all/none` payloads, tenant-sensitive URLs, auth/session material, or unsanitized selectors/text.
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

Add detailed accessibility issue-register artifacts to the PCC accessibility lane.

New artifacts:

```text
pcc-live-accessibility-issue-register.json
pcc-live-accessibility-issue-register.md
```

The register must convert accessibility summaries and observations into localized, audit-usable findings for expert review and remediation triage.

## Why This Matters

The current accessibility lane captures axe, keyboard focus, ARIA/name/disabled-reason, contrast, reduced motion, hover-only, dialog focus, and touch-target observations. The current summary is useful, but it is not localized enough for fast remediation triage or scorecard support. The new register must identify surface, selector/rule/focus step/measurement, issue type, EV context, and recommended reviewer action without turning observations into automated pass/fail decisions.

## Current Repo Truth to Preserve

Current accessibility output files are:

```text
pcc-live-accessibility-evidence.json
pcc-live-accessibility-evidence.md
pcc-live-axe-summary.json
pcc-live-keyboard-focus-summary.json
pcc-live-aria-label-summary.json
pcc-live-contrast-summary.json
```

Prompt 06 must preserve those outputs and add the two new issue-register files.

The current accessibility evidence tuple is:

```text
EV-72..EV-82
```

Use `PCC_ACCESSIBILITY_EVIDENCE_IDS` as the authoritative accessibility EV tuple. Do not create new EV IDs.

## Repo Areas to Inspect

```text
e2e/pcc-live/pcc-live.accessibility.types.ts
e2e/pcc-live/pcc-live.accessibility-capture.ts
e2e/pcc-live/pcc-live.accessibility-evidence-writer.ts
e2e/pcc-live/pcc-live.accessibility.spec.ts
e2e/pcc-live/pcc-live.package-completeness.ts
e2e/pcc-live/pcc-live.package-completeness.spec.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-scorecard.model.ts
e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
```

## Required Changes

### 1. Add Typed Accessibility Issue Models

Add typed accessibility issue models in `pcc-live.accessibility.types.ts`, unless the repo pattern strongly favors local writer-only types.

At minimum include:

```ts
export type PccAccessibilityIssueType =
  | 'axe-violation'
  | 'aria-name-missing'
  | 'disabled-reason-missing'
  | 'focus-indicator-missing'
  | 'contrast-needs-review'
  | 'touch-target-size'
  | 'hover-only-risk'
  | 'reduced-motion-risk'
  | 'dialog-focus-needs-review';

export type PccAccessibilityIssueSeveritySignal = 'review' | 'moderate' | 'major';

export interface PccAccessibilityIssueRegisterRow {
  id: string;
  surfaceId: PccLiveSurfaceId;
  surfaceLabel?: string;
  issueType: PccAccessibilityIssueType;
  severitySignal: PccAccessibilityIssueSeveritySignal;
  selector?: string;
  ruleId?: string;
  impact?: string;
  count?: number;
  role?: string;
  tagName?: string;
  focusStep?: number;
  boundingWidth?: number;
  boundingHeight?: number;
  width?: number;
  height?: number;
  details?: string;
  status?: PccA11yObservationStatus;
  evRefs: readonly PccEvidenceId[];
  pillarRefs: readonly PccScorecardPillarRef[];
  hardStopRefs: readonly PccHardStopRef[];
  operatorReviewRequired: true;
  artifactPolicy: 'operator-review-required';
  reviewPrompt: string;
  recommendedAction: string;
}
```

Add only additional fields if they improve audit clarity without exposing raw DOM/axe payloads.

### 2. Generate Issue Rows From Existing Observations

Generate issue rows from the already-sanitized accessibility observations inside the accessibility writer. Do not change capture semantics unless a compile issue requires a directly related adjustment.

Create rows for:

- `axe-violation`
  - from each axe violation summary with `count > 0`.
- `aria-name-missing`
  - from ARIA observations where `accessibleNamePresent === false`.
- `disabled-reason-missing`
  - from ARIA observations where `disabled === true && disabledReasonPresent === false`.
- `focus-indicator-missing`
  - from keyboard observations where `hasVisibleFocusIndicator === false`.
- `contrast-needs-review`
  - from contrast observations where `needsReview === true`.
- `touch-target-size`
  - from touch target observations where `belowRecommendedSize === true`.
- `hover-only-risk`
  - from hover-only observations where `needsReview === true` or `hoverOnlyRiskCount > 0`.
- `reduced-motion-risk`
  - from reduced-motion observations where `needsReview === true`, `animationRiskCount > 0`, or `transitionRiskCount > 0`.
- `dialog-focus-needs-review`
  - from dialog-focus observations where `status === 'needs-review'`, `focusTrapObserved === false`, or notes clearly indicate a focus-review gap.

Keep issue creation deterministic and stably sorted by:

```text
issueType -> surfaceId -> selector/ruleId/focusStep -> id
```

### 3. Structured Issue Register JSON

Emit `pcc-live-accessibility-issue-register.json` as a structured object, not a bare array:

```ts
{
  runId: string;
  generatedAtIso: string;
  summary: {
    totalIssueCount: number;
    issueCountByType: Record<PccAccessibilityIssueType, number>;
    majorIssueCount: number;
    moderateIssueCount: number;
    reviewIssueCount: number;
  };
  issues: PccAccessibilityIssueRegisterRow[];
  disclaimer: string;
}
```

The disclaimer must state:

- review support only;
- no final score is calculated;
- no hard stop is passed or failed;
- no EV is finally captured;
- no WCAG conformance result is claimed;
- no Phase 4 readiness is approved.

### 4. Markdown Issue Register and Reviewer Action Matrix

Emit `pcc-live-accessibility-issue-register.md` with:

- top boundary statements:
  - review support only;
  - expert review required;
  - no final score;
  - no hard-stop pass/fail;
  - no EV final capture;
  - no WCAG conformance claim;
  - no Phase 4 readiness approval;
- “How to use this register” section:
  - use it for localization and triage;
  - verify findings manually;
  - confirm remediation in source and live evidence;
  - rerun the relevant accessibility lane after remediation;
  - do not treat issue existence as automated failure.
- issue counts by type;
- grouped sections by:
  - surface;
  - issue type;
- localized details:
  - selector/rule/focus step/role/tag/measurements when available;
  - EV refs;
  - pillar refs;
  - hard-stop refs;
  - severity signal;
  - review prompt;
  - recommended action;
- reviewer action matrix:
  - issue type;
  - likely owner/reviewer;
  - suggested action;
  - evidence artifact to check;
  - rerun guidance;
  - operator/expert review status.

Do not include raw HTML or raw axe node payloads.

### 5. Scorecard Context Mapping

Use `PCC_ACCESSIBILITY_EVIDENCE_IDS` as the accessibility EV source and `PCC_EVIDENCE_REGISTRY` to derive `pillarRefs` and `hardStopRefs`.

Do not create new EV IDs.

Recommended issue-type-to-EV mapping should use existing accessibility EV IDs only:

```ts
axe-violation:              EV-72, EV-73, EV-77, EV-82
aria-name-missing:          EV-72, EV-74, EV-78, EV-82
disabled-reason-missing:    EV-74, EV-75, EV-78, EV-82
focus-indicator-missing:    EV-73, EV-75, EV-78, EV-82
contrast-needs-review:      EV-76, EV-77, EV-82
touch-target-size:          EV-79, EV-80, EV-82
hover-only-risk:            EV-78, EV-81, EV-82
reduced-motion-risk:        EV-78, EV-81, EV-82
dialog-focus-needs-review:  EV-73, EV-74, EV-78, EV-82
```

The mapping can be implemented as a local issue-category-to-EV map because it maps issue types to the existing accessibility EV tuple. However, `pillarRefs` and `hardStopRefs` must be derived from `PCC_EVIDENCE_REGISTRY`, not hard-coded.

If an EV is missing from the registry, skip it and add an operator-review note/warning; do not create placeholder EVs.

### 6. Severity Signal Rules

Use review-support severity signals only. These are not pass/fail statuses.

Suggested deterministic severity defaults:

```text
review:
  - low-count axe summary with no serious/critical impact
  - one isolated hover/reduced-motion/dialog review item
  - a single touch target below recommended size

moderate:
  - impact serious
  - missing accessible name on focusable/control element
  - disabled control missing reason
  - focus indicator missing
  - contrast needs review

major:
  - impact critical
  - multiple issue types on the same surface affecting command/action elements
  - dialog focus needs review with modal count > 0
  - repeated missing names/disabled reasons/touch target issues on same surface
```

Tests should verify representative severity assignment without implying failure or readiness disposition.

### 7. Update Writer Result Contract

Update `WritePccAccessibilityEvidenceResult` with:

```ts
issueRegisterJsonPath: string;
issueRegisterMarkdownPath: string;
issueRegisterIssueCount: number;
```

Keep all existing result fields and file outputs unchanged.

### 8. Update Main Accessibility Markdown

Update `pcc-live-accessibility-evidence.md` to include:

- issue register JSON/Markdown paths;
- issue register total count;
- issue counts by type;
- reminder that issue rows are evidence-support signals and not automated WCAG or hard-stop outcomes.

Keep existing summaries. Do not rely on repeated warning strings as the primary audit artifact.

### 9. Sanitization and Artifact Safety

Apply plural credential redaction consistency already used by doctrine-source/screenshot/breakpoint lanes:

```text
cookies?
tokens?
sessions?
```

Preserve existing storage/auth/secret/raw artifact redaction.

Ensure all accessibility outputs, including the new issue-register JSON/Markdown, are free of:

```text
qa.user@hedrickbrothers.com
ABCDEFGHIJKLMNOPQRSTUVWXYZ123456
?x=1
<button
node.html
failureSummary
storageState
cookie
cookies
token
tokens
session
sessions
.auth
test-results
playwright-report
trace.zip
video.webm
network.har
PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Also ensure no generated output contains:

```text
hard stop passed
hard stop failed
100/100
56/56 achieved
phase 4 ready
"captured"
wcag passed
wcag failed
accessibility passed
accessibility failed
```

### 10. Package Completeness Integration

Update `pcc-live.package-completeness.ts` so the `accessibility` expected files include:

```text
pcc-live-accessibility-issue-register.json
pcc-live-accessibility-issue-register.md
```

Update `pcc-live.package-completeness.spec.ts` synthetic complete paths accordingly.

Do not modify package-completeness semantics beyond expected-file coverage.

### 11. Runbook Updates

Minimally update:

```text
e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
```

Add the two accessibility issue-register files to the accessibility artifact list / expected evidence output guidance and state that they are review-support only, not scoring authority, not WCAG conformance authority, and not hard-stop disposition authority.

### 12. Tests

Update `pcc-live.accessibility.spec.ts` to cover:

1. Writer emits the two new issue-register files and result fields.
2. Structured JSON has:
   - `runId`;
   - `generatedAtIso`;
   - `summary`;
   - `issues`;
   - `disclaimer`.
3. Synthetic issue rows for:
   - `axe-violation`;
   - `aria-name-missing`;
   - `disabled-reason-missing`;
   - `focus-indicator-missing`;
   - `contrast-needs-review`;
   - `touch-target-size`;
   - `hover-only-risk`;
   - `reduced-motion-risk`;
   - `dialog-focus-needs-review`.
4. Rows contain localized fields:
   - surface;
   - selector/rule/focus step where applicable;
   - count/impact/role/tag/measurements where applicable;
   - EV refs;
   - registry-derived `pillarRefs`;
   - registry-derived `hardStopRefs`;
   - review prompt;
   - recommended action.
5. Markdown groups by surface and issue type.
6. Markdown includes reviewer action matrix and “how to use this register.”
7. New files contain no forbidden auth/session/raw artifact terms and no raw HTML/axe payloads.
8. New files contain no scoring, WCAG pass/fail, hard-stop pass/fail, EV final-capture, Phase 4 readiness, or `_v2` claims.
9. Package-completeness spec passes with updated accessibility expected-file set.
10. Scorecard-report spec remains passing for compatibility.

Do not make issue rows a test failure condition. Tests should assert generation and safety, not that zero issues exist.

## Validation

Run exactly:

```bash
git status --short
git branch --show-current
git rev-parse --short HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check e2e/pcc-live/pcc-live.accessibility.types.ts e2e/pcc-live/pcc-live.accessibility-capture.ts e2e/pcc-live/pcc-live.accessibility-evidence-writer.ts e2e/pcc-live/pcc-live.accessibility.spec.ts e2e/pcc-live/pcc-live.package-completeness.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts e2e/pcc-live/README.md docs/architecture/evidence/pcc-live/README.md
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If an additional file is touched, add it to the targeted Prettier check.

## Acceptance Criteria

- Accessibility writer emits JSON and Markdown issue registers.
- Issue register localizes issues to surface and selector/step/rule where available.
- JSON is structured with summary and issues, not a bare array.
- Markdown includes “how to use this register” and reviewer action matrix.
- Tests cover axe, ARIA name, disabled reason, contrast, focus, touch, hover, reduced motion, and dialog issue generation.
- Package-completeness expectations include the new accessibility issue-register files.
- Scorecard-report compatibility remains intact.
- No automatic accessibility pass/fail, WCAG conformance claim, hard-stop disposition, score, EV final-capture, or Phase 4 approval is introduced.
- No product UI runtime, dependency, lockfile, manifest, package metadata, or package-solution changes are introduced.
