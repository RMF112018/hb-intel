# Prompt 05 — Breakpoint Issue Register — Updated

## Role

You are acting as a senior TypeScript/Playwright test architect, SPFx evidence-harness maintainer, UI/UX audit systems engineer, and repository-quality reviewer.

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
- Do not generate or commit storageState, cookies, tokens, raw traces, videos, HAR files, raw `test-results/`, or raw `playwright-report/`.
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

Add a detailed breakpoint issue register to the PCC breakpoint lane.

New artifacts:

```text
pcc-live-breakpoint-issue-register.json
pcc-live-breakpoint-issue-register.md
```

The register must convert breakpoint summary counts and warning signals into localized, audit-usable findings tied to the observed surface, viewport, grid/card/touch-target measurement, scorecard context, and reviewer follow-up prompt.

## Why This Matters

The current breakpoint evidence can report counts for clipping, overflow, direct-child stability issues, mode mismatches, and touch-target issues. Expert auditors need localized evidence showing exactly which surface, viewport, card/action, selector, and measurement caused the issue. The register must make those issues navigable without turning them into automated failures.

## Current Repo Truth to Preserve

Current breakpoint output files are:

```text
pcc-live-breakpoint-evidence.json
pcc-live-breakpoint-evidence.md
pcc-live-breakpoint-matrix.json
pcc-live-breakpoint-card-measurements.json
pcc-live-breakpoint-touch-targets.json
```

Prompt 05 must preserve those outputs and add the two new issue-register files.

The current breakpoint evidence tuple is:

```text
EV-59..EV-71
```

Do not use the older/incorrect `EV-69..EV-76` range. Use `PCC_BREAKPOINT_EVIDENCE_IDS` as the authoritative breakpoint EV tuple.

## Repo Areas to Inspect

```text
e2e/pcc-live/pcc-live.breakpoint.types.ts
e2e/pcc-live/pcc-live.breakpoint-matrix.ts
e2e/pcc-live/pcc-live.breakpoint-capture.ts
e2e/pcc-live/pcc-live.breakpoint-evidence-writer.ts
e2e/pcc-live/pcc-live.breakpoint.spec.ts
e2e/pcc-live/pcc-live.package-completeness.ts
e2e/pcc-live/pcc-live.package-completeness.spec.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-scorecard.model.ts
e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
```

## Required Changes

### 1. Add a Typed Breakpoint Issue Model

Add a typed issue-register model in `pcc-live.breakpoint.types.ts`, unless the repo pattern strongly favors a local writer-only type.

At minimum include:

```ts
export type PccLiveBreakpointIssueType =
  | 'mode-mismatch'
  | 'horizontal-overflow'
  | 'card-clipping'
  | 'card-overflow-x'
  | 'card-overflow-y'
  | 'direct-child-invariant'
  | 'touch-target-size'
  | 'missing-grid';

export type PccLiveBreakpointIssueSeveritySignal = 'review' | 'moderate' | 'major';

export interface PccLiveBreakpointIssueRegisterRow {
  id: string;
  surfaceId: PccLiveSurfaceId;
  surfaceLabel?: string;
  viewportId: string;
  viewportLabel?: string;
  issueType: PccLiveBreakpointIssueType;
  severitySignal: PccLiveBreakpointIssueSeveritySignal;
  cardIndex?: number;
  selector?: string;
  footprint?: string;
  hierarchy?: string;
  tier?: string;
  region?: string;
  boundingWidth?: number;
  boundingHeight?: number;
  columnSpan?: number;
  rowSpan?: number;
  measuredHeight?: number;
  viewportWidth: number;
  viewportHeight: number;
  observedMode?: string;
  derivedMode?: PccLiveResponsiveMode | string;
  expectedColumns?: number;
  measuredContainerWidth?: number;
  measuredContainerHeight?: number;
  documentScrollWidth?: number;
  documentClientWidth?: number;
  viewportOverflowX?: number;
  touchTargetWidth?: number;
  touchTargetHeight?: number;
  evRefs: readonly PccEvidenceId[];
  pillarRefs: readonly PccScorecardPillarRef[];
  hardStopRefs: readonly PccHardStopRef[];
  operatorReviewRequired: true;
  artifactPolicy: 'operator-review-required';
  reviewPrompt: string;
  recommendedAction: string;
}
```

Use the exact field names where practical. Add only additional fields if they improve audit clarity.

### 2. Generate Issue Rows From Existing Measurements

Generate issue rows from sanitized existing breakpoint measurements inside the breakpoint writer. Do not change capture semantics unless a compile issue requires a directly related adjustment.

Create rows for:

- `mode-mismatch`
  - when `observedMode` exists and differs from `derivedMode`.
- `horizontal-overflow`
  - when `grid.horizontalScrollDetected` is true or `viewportOverflowX > 0` or `documentScrollWidth > documentClientWidth`.
- `card-clipping`
  - when `card.clipped` is true.
- `card-overflow-x`
  - when `card.overflowX` is true.
- `card-overflow-y`
  - when `card.overflowY` is true.
- `direct-child-invariant`
  - when `card.directChildOfGrid` is false.
- `touch-target-size`
  - when `target.belowRecommendedSize` is true or `card.minTouchTargetIssueCount > 0`.
- `missing-grid`
  - when the lane has a surface/viewport record where the grid is structurally missing or insufficient to establish grid safety. If current types always require `grid`, only add this issue when available warning text or grid metadata clearly supports it; do not force speculative missing-grid rows.

Keep issue creation deterministic and stably sorted by:

```text
issueType -> surfaceId -> viewportId -> cardIndex/selector -> id
```

### 3. Scorecard Context Mapping

Use `PCC_BREAKPOINT_EVIDENCE_IDS` as the breakpoint EV source and `PCC_EVIDENCE_REGISTRY` to derive `pillarRefs` and `hardStopRefs` for selected EVs.

Do not create new EV IDs.

Recommended issue-to-EV mapping should use existing breakpoint/container evidence IDs only:

```ts
mode-mismatch:        EV-59, EV-60, EV-69, EV-70, EV-71
horizontal-overflow:  EV-63, EV-64, EV-65, EV-69, EV-70
card-clipping:        EV-61, EV-62, EV-63, EV-64, EV-69
card-overflow-x:      EV-63, EV-64, EV-69, EV-70
card-overflow-y:      EV-61, EV-62, EV-63, EV-64
direct-child-invariant: EV-61, EV-62, EV-63, EV-69
touch-target-size:    EV-67, EV-68, EV-69, EV-70, EV-71
missing-grid:         EV-59, EV-60, EV-61, EV-62, EV-69
```

The mapping can be implemented as a local issue-category-to-EV map because it maps issue types to the existing breakpoint EV tuple. However, `pillarRefs` and `hardStopRefs` must be derived from `PCC_EVIDENCE_REGISTRY`, not hard-coded.

If an EV is missing from the registry, skip it and add an operator-review note/warning; do not create placeholder EVs.

### 4. Severity Signal Rules

Use review-support severity signals only. These are not pass/fail statuses.

Suggested deterministic severity defaults:

```text
review:
  - single mode mismatch
  - touch target below recommended size
  - one minor card overflow/clipping item where measurements are otherwise bounded

moderate:
  - horizontal overflow detected
  - direct-child invariant issue
  - multiple card/touch issues in the same surface/viewport

major:
  - viewport-level horizontal overflow plus card clipping/overflow
  - missing grid signal
  - direct-child invariant plus overflow/clipping on the same surface/viewport
```

Tests should verify representative severity assignment without implying failure or readiness disposition.

### 5. Add Writer Outputs

Update `WritePccBreakpointEvidenceResult` with:

```ts
issueRegisterJsonPath: string;
issueRegisterMarkdownPath: string;
issueRegisterIssueCount: number;
```

Write:

```text
pcc-live-breakpoint-issue-register.json
pcc-live-breakpoint-issue-register.md
```

`pcc-live-breakpoint-issue-register.json` should contain the issue rows and, if useful, a summary by issue type. Keep schema deterministic.

`pcc-live-breakpoint-issue-register.md` should include:

- top boundary statements:
  - review support only;
  - no final score;
  - no hard-stop pass/fail;
  - no EV final capture;
  - no Phase 4 readiness approval;
- issue count by type;
- grouped sections by issue type, then surface, then viewport;
- localized row details;
- reviewer prompts and recommended actions;
- artifact policy/operator-review language.

### 6. Update Main Breakpoint Markdown

Update `pcc-live-breakpoint-evidence.md` to include:

- issue register JSON/Markdown paths;
- issue register total count;
- issue counts by type;
- reminder that issue rows are evidence support and not automated failures.

Keep existing warnings. Do not rely on repeated warning strings as the primary audit artifact.

### 7. Sanitization and Artifact Safety

Apply the same plural credential redaction standard used in recent doctrine-source and screenshot prompt work:

```text
cookies?
tokens?
sessions?
```

Preserve existing storage/auth/secret/raw artifact redaction.

Ensure all new JSON/Markdown outputs are free of:

```text
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
```

### 8. Package Completeness Integration

Update `pcc-live.package-completeness.ts` so the `breakpoints` expected files include:

```text
pcc-live-breakpoint-issue-register.json
pcc-live-breakpoint-issue-register.md
```

Update `pcc-live.package-completeness.spec.ts` synthetic complete paths accordingly.

Do not modify package-completeness semantics beyond expected-file coverage.

### 9. Runbook Updates

Minimally update:

```text
e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
```

Add the two breakpoint issue-register files to the breakpoint artifact list / expected evidence output guidance and state that they are review-support only, not scoring authority.

### 10. Tests

Update `pcc-live.breakpoint.spec.ts` to cover:

1. Writer emits the two new issue-register files and result fields.
2. Synthetic issues for:
   - mode mismatch;
   - horizontal overflow;
   - card clipping;
   - card overflow-x;
   - card overflow-y;
   - direct-child invariant;
   - touch-target size.
3. Missing-grid issue only if current synthetic setup can represent it without inventing invalid input. If not, test that the model supports it but do not force an impossible runtime row.
4. Issue rows localize:
   - surface;
   - viewport;
   - card index or selector when applicable;
   - measurements;
   - EV refs;
   - registry-derived `pillarRefs` and `hardStopRefs`;
   - review prompt;
   - recommended action.
5. Markdown groups by issue type, surface, and viewport.
6. New files contain no forbidden auth/session/raw artifact terms.
7. New files contain no scoring, hard-stop pass/fail, EV final-capture, Phase 4 readiness, or `_v2` claims.
8. Package-completeness spec passes with updated breakpoint expected-file set.
9. Scorecard-report spec remains passing for compatibility.

Do not make issue rows a test failure condition. Tests should assert generation and safety, not that zero issues exist.

## Validation

Run exactly:

```bash
git status --short
git branch --show-current
git rev-parse --short HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check e2e/pcc-live/pcc-live.breakpoint.types.ts e2e/pcc-live/pcc-live.breakpoint-capture.ts e2e/pcc-live/pcc-live.breakpoint-evidence-writer.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts e2e/pcc-live/pcc-live.package-completeness.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts e2e/pcc-live/README.md docs/architecture/evidence/pcc-live/README.md
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If an additional file is touched, add it to the targeted Prettier check.

## Acceptance Criteria

- Breakpoint writer emits JSON and Markdown issue registers.
- Issue register localizes issues to surface/viewport and card/action where possible.
- Summary warnings remain, but issue-register rows become the primary audit signal.
- Tests cover synthetic mode mismatch, horizontal overflow, card clipping/overflow, direct-child, and touch-target examples.
- Package-completeness expectations include the new breakpoint issue-register files.
- Scorecard-report compatibility remains intact.
- No automatic score, EV capture, hard-stop disposition, or Phase 4 approval is introduced.
- No product UI runtime, dependency, lockfile, manifest, package metadata, or package-solution changes are introduced.
