# Phase 02 — Prompt 02: Safety Field Excellence Scoring Domain Package

You are working in a fresh local code-agent session inside the live `RMF112018/hb-intel` repository.

Use `main` as authoritative repo truth unless the operator explicitly tells you to work from a feature branch.

## Objective

Implement the **pure TypeScript scoring/domain package** for dynamic Safety Field Excellence.

Wave 01 already added the schema/provisioning foundation for:

- `Safety Field Excellence Candidate Scores`
- `Safety Field Excellence Weekly Highlights`
- canonical descriptors and GUID overlay keys
- `SpFieldDefinition.indexed?: boolean`
- indexed-column propagation through the Safety provisioning path
- canonical choice vocabularies for downstream scoring/publishing

This Prompt 02 must build on that foundation. Do **not** rework the Wave 01 schema unless you find a compile-breaking defect that directly blocks this prompt.

The goal is to create deterministic, testable scoring and payload-generation logic that can later be consumed by backend rollup APIs in Prompt 03 and the publish workflow in Prompt 04.

## Current Wave Boundary

This wave is **domain logic only**.

Implement:

- eligibility gates
- score calculation
- activity/exposure confidence handling
- corrective-action scoring assumptions
- data-quality scoring
- single-perfect-score suppression
- candidate ranking helpers
- multi-signal narrative generation
- homepage payload generation helpers
- preview/no-data payload generation helpers
- exhaustive unit tests

Do **not** implement:

- backend Function App routes
- Graph repository methods
- timer triggers
- approval/publish APIs
- homepage dynamic adapter
- SPFx UI changes
- tenant provisioning execution
- manifest/package version bumps

## Wave 01 Commit Context

The preceding Wave 01 commit summary stated:

- Two new HBCentral lists were introduced:
  - `Safety Field Excellence Candidate Scores`
  - `Safety Field Excellence Weekly Highlights`
- `SafetyOverlayKey` now includes:
  - `SafetyFieldExcellenceCandidateScores`
  - `SafetyFieldExcellenceWeeklyHighlights`
- New descriptors are registered in `DESCRIPTORS_BY_KEY` and inherit fail-closed zero-GUID overlay behavior.
- `SpFieldDefinition` now supports `indexed?: boolean`.
- `toFieldDefinition()` now propagates `indexed` into backend provisioning `IFieldDefinition`.
- `SharePointProvisioningService.addListField()` now applies `Indexed: true` post-create.
- `SafetyProvisioningService.provisionSafetyContainer()` now detects and repairs index drift with dry-run reporting.
- `RollbackFromItemId` remains a `Number`, not a self-lookup.
- No SPFx webpart runtime behavior changed.

Treat these Wave 01 outcomes as the baseline.

## Canonical Choice Vocabularies

Use these exact values. Do not introduce synonyms.

### `EligibilityStatus`

```ts
type SafetyExcellenceEligibilityStatus =
  | "eligible"
  | "ineligible"
  | "low-confidence"
  | "needs-review";
```

### `ActivityEvidenceStatus`

```ts
type SafetyActivityEvidenceStatus =
  | "proven"
  | "inferred"
  | "missing";
```

### `PublishRecommendation`

```ts
type SafetyExcellencePublishRecommendation =
  | "primary"
  | "secondary"
  | "monitor"
  | "do-not-publish";
```

### `PublishStatus`

Do not write publish workflow in this prompt, but any type reference must align with:

```ts
type SafetyFieldExcellencePublishStatus =
  | "draft"
  | "pending-review"
  | "approved"
  | "published"
  | "archived"
  | "suppressed";
```

## Required Files to Inspect First

Do not re-read files still within your current context or memory.

Inspect the current repo truth for:

```text
packages/features/safety/src/domain/types.ts
packages/features/safety/src/scoring/projectWeekRollup.ts
packages/features/safety/src/scoring/scoringEngine.ts
packages/features/safety/src/scoring/findingExtraction.ts
packages/features/safety/src/lists/descriptors.ts
packages/features/safety/src/lists/fieldSchema.ts
packages/features/safety/src/lists/guidConfig.ts
apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceConsumerModel.tsx
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx
docs/architecture/plans/MASTER/spfx/safety-public/dynamic-safety-field-excellence-cutover-plan.md
docs/reference/sharepoint/list-schemas/hbcentral/lists/safety-field-excellence-candidate-scores.md
docs/reference/sharepoint/list-schemas/hbcentral/lists/safety-field-excellence-weekly-highlights.md
docs/reference/ui-kit/doctrine/
docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md
docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md
```

## Required New Package Area

Create the domain package under:

```text
packages/features/safety/src/excellence/
```

Recommended file layout:

```text
packages/features/safety/src/excellence/
  types.ts
  eligibility.ts
  scoring.ts
  exposure.ts
  correctiveActions.ts
  narrative.ts
  homepagePayload.ts
  previewPayload.ts
  ranking.ts
  index.ts
  __tests__/
    eligibility.test.ts
    scoring.test.ts
    exposure.test.ts
    correctiveActions.test.ts
    narrative.test.ts
    homepagePayload.test.ts
    previewPayload.test.ts
    ranking.test.ts
```

You may adjust file names if current repo conventions require it, but keep ownership clear and avoid putting scoring logic into render components or backend route files.

## Required Domain Types

Define domain types that align with existing Safety domain models and Wave 01 schema.

At minimum, introduce types equivalent to:

```ts
export interface SafetyActivityEvidence {
  readonly status: "proven" | "inferred" | "missing";
  readonly activeTradeCount?: number;
  readonly estimatedManpower?: number;
  readonly projectStage?: string;
  readonly source:
    | "daily-log"
    | "project-stage"
    | "inspection-density"
    | "manual"
    | "none";
  readonly notes?: string;
}

export interface SafetyExcellenceCandidateInput {
  readonly reportingPeriod: SafetyReportingPeriod;
  readonly projectWeek: SafetyProjectWeekRecord;
  readonly inspections: ReadonlyArray<SafetyInspectionEvent>;
  readonly findings: ReadonlyArray<SafetyFinding>;
  readonly priorProjectWeeks: ReadonlyArray<SafetyProjectWeekRecord>;
  readonly priorInspections: ReadonlyArray<SafetyInspectionEvent>;
  readonly priorFindings: ReadonlyArray<SafetyFinding>;
  readonly activityEvidence?: SafetyActivityEvidence;
  readonly generatedAt?: string;
  readonly generatorVersion?: string;
}

export interface SafetyExcellenceCandidateScore {
  readonly eligibilityStatus:
    | "eligible"
    | "ineligible"
    | "low-confidence"
    | "needs-review";
  readonly exclusionReasons: ReadonlyArray<string>;
  readonly compositeScore: number;
  readonly safetyPerformanceScore: number;
  readonly consistencyTrendScore: number;
  readonly activityExposureScore: number;
  readonly correctiveActionScore: number;
  readonly dataQualityScore: number;
  readonly inspectionCountWindow: number;
  readonly inspectionCountRolling: number;
  readonly averageInspectionScoreWindow: number | null;
  readonly averageInspectionScoreRolling: number | null;
  readonly inspectionTrendPct: number | null;
  readonly highestRiskFindingLevel: "info" | "medium" | "high" | null;
  readonly highSeverityFindingCount: number;
  readonly mediumSeverityFindingCount: number;
  readonly openFindingCount: number;
  readonly agedOpenFindingCount: number;
  readonly repeatFindingCount: number;
  readonly activityEvidenceStatus: "proven" | "inferred" | "missing";
  readonly activityEvidenceJson: string;
  readonly reasonSummary: string;
  readonly sourceInspectionIds: ReadonlyArray<string>;
  readonly sourceFindingIds: ReadonlyArray<string>;
  readonly generatedAt: string;
  readonly generatorVersion: string;
  readonly publishRecommendation:
    | "primary"
    | "secondary"
    | "monitor"
    | "do-not-publish";
}
```

Use existing domain types from `packages/features/safety/src/domain/types.ts` rather than duplicating models.

## Required Scoring Model

Implement this weighted scoring model:

```ts
compositeScore =
  safetyPerformanceScore * 0.30 +
  consistencyTrendScore * 0.20 +
  activityExposureScore * 0.20 +
  correctiveActionScore * 0.20 +
  dataQualityScore * 0.10;
```

Normalize all subscores to `0–100`.

Round only at the final domain boundary. Keep internal calculations stable and deterministic.

## Eligibility Gates

Implement clear eligibility gates with reason codes.

A project should not be eligible for `primary` recommendation unless it passes:

1. **Active project gate**
   - project number exists
   - project is not unresolved
   - project stage does not clearly indicate inactive/preconstruction/closeout-only unless activity evidence is proven

2. **Inspection evidence gate**
   - at least one accepted current-window inspection exists, or a documented rolling-history condition exists
   - `superseded` inspections must not count
   - `review-required` / duplicate-suspected records must reduce data quality or require review

3. **Activity/exposure gate**
   - `activityEvidence.status === "proven"` is strongest
   - `inferred` may allow `secondary` or `monitor`
   - `missing` must block `primary`

4. **Risk/finding gate**
   - unresolved high-risk findings must downgrade or exclude
   - aged open findings must materially penalize
   - repeat finding count must penalize

5. **Data quality gate**
   - missing provenance must penalize
   - invalid or incomplete inputs must not produce confident recommendations
   - candidate must carry source inspection/finding IDs

6. **Narrative explainability gate**
   - primary/secondary recommendations must have a multi-signal reason summary
   - single-score narratives are invalid

## Mandatory Low-Activity Perfect-Score Suppression

This is the most important domain rule.

A project must **not** be recommended as `primary` when the highlight basis is only a perfect score with weak activity evidence.

Implement an explicit rule equivalent to:

```ts
if (
  averageInspectionScoreWindow === 100 &&
  inspectionCountWindow <= 1 &&
  activityEvidence.status !== "proven"
) {
  eligibilityStatus = "ineligible" or "low-confidence";
  publishRecommendation = "do-not-publish" or "monitor";
  exclusionReasons includes "perfect-score-insufficient-activity-evidence";
}
```

Also guard against:

```ts
score === 100
&& totalNo === 0
&& highSeverityFindingCount === 0
&& activityEvidence.status === "missing"
```

This should never become a primary homepage highlight.

## Accepted / Excluded Inspection Statuses

Use current repo truth for ingestion status values. Unless current types force a different treatment:

- count `accepted`
- treat `duplicate-suspected` as data-quality penalty / needs-review
- exclude `superseded`
- exclude or require review for `review-required`
- exclude `rejected`

Do not silently count all inspections.

## Corrective-Action Handling

Wave 01 schema does not add a separate corrective-action list. Current Safety Findings include fields such as `RequiresCorrectiveAction` and `IsOpen`.

Implement scoring that works with current fields:

- open findings penalize
- open medium/high findings penalize more
- aged open findings should be supported when due/resolved date data becomes available
- if due/resolved date fields are not currently present, return a lower-confidence corrective-action score rather than fabricating closure performance
- document this limitation in code comments and tests

Do not invent tenant data that does not exist.

## Activity / Exposure Handling

Use available and defensible evidence only.

Supported activity sources:

- `manual`
- `daily-log`
- `project-stage`
- `inspection-density`
- `none`

If daily log/manpower data is not available in current repo truth, do not pretend it exists. Instead:

- allow `project-stage` or `inspection-density` as inferred evidence
- mark status as `inferred`
- block `primary` if evidence is not `proven`
- allow future backend Prompt 03 to enrich this input

## Ranking Helpers

Add deterministic ranking helpers for backend Prompt 03 to use later.

Ranking should prioritize:

1. eligible before low-confidence
2. higher composite score
3. proven activity evidence over inferred/missing
4. fewer high-risk/open/aged findings
5. stronger rolling consistency
6. newer generated timestamp only as a final tie-breaker

Do not rank `ineligible` or `do-not-publish` candidates above eligible/secondary candidates.

## Homepage Payload Builder

Implement a helper that builds a homepage-safe payload compatible with the existing Safety Field Excellence config contract.

The helper should produce:

- top-line summary
- primary spotlight
- secondary signals
- context metadata
- freshness metadata
- CTA metadata placeholder or supplied CTA
- data confidence / degraded notice where applicable

Do not expose:

- raw workbook JSON
- raw findings text that is not approved for homepage display
- employee performance detail
- internal backend diagnostics

The output should be suitable for a later published `HomepagePayloadJson` field.

## Preview / No-Data Payload Builder

Add a polished preview fallback payload builder.

This payload is used when no published weekly data exists.

Requirements:

- clearly labeled as preview / awaiting published weekly data
- future-state layout compatible with Safety Field Excellence surface
- does not imply a real project winner
- explains what data will appear later
- includes representative evidence labels:
  - inspection consistency
  - corrective-action response
  - active field exposure
  - finding severity trend
- CTA must be honest, such as `Open Safety hub` or `View Safety records`
- must be compatible with the existing config/model mapper

Bad fallback:

```text
No data available.
```

Good fallback:

```text
Weekly Safety Excellence Preview

Once weekly Safety records are published, this surface will highlight the project with the strongest verified field-safety performance — based on inspection consistency, active-jobsite evidence, finding response, and data quality.
```

## Required Tests

Add comprehensive unit tests. Minimum required cases:

### Eligibility / low-activity suppression

- one accepted inspection with 100% score + missing activity evidence → not `primary`
- one accepted inspection with 100% score + inferred activity evidence → not `primary`; at most `monitor` or `secondary` only if reasoned by policy
- 100% score during mobilization/closeout-like stage + no proven exposure → not `primary`
- multiple accepted inspections + proven activity + no high-risk findings → eligible

### Inspection filtering

- `superseded` inspection excluded
- `duplicate-suspected` inspection penalizes data quality or requires review
- rejected/review-required records do not inflate score

### Findings and corrective action

- high open finding downgrades/excludes
- medium open findings reduce score
- missing due/resolved dates reduce corrective-action confidence
- no findings plus missing activity evidence does not create false confidence

### Activity evidence

- proven activity increases activity score
- inferred activity supports candidate but blocks primary when other evidence is weak
- missing activity blocks primary

### Scoring and ranking

- composite score matches weighted formula
- ranking is deterministic
- eligible candidate ranks above low-confidence even if low-confidence has a higher raw score
- tie-breakers are stable

### Narrative

- primary/secondary narrative references at least two independent signals
- single-score-only narrative is rejected or downgraded
- reason summary is human-readable and homepage-safe

### Payloads

- homepage payload maps to the existing Safety Field Excellence config shape
- preview fallback is clearly marked as preview
- preview fallback does not include fake project winner
- payload excludes raw workbook JSON and sensitive/internal details

## Test Data Rules

Use explicit test builders/fixtures.

Do not depend on live SharePoint data.

Do not import backend Function App services into the pure domain tests.

Do not import React/SPFx components into scoring tests.

## Documentation Updates

Update or create a short domain README if repo conventions support it:

```text
packages/features/safety/src/excellence/README.md
```

Include:

- purpose
- inputs/outputs
- scoring dimensions
- low-activity perfect-score suppression rule
- canonical choice vocabulary dependency
- known limitations:
  - no current manpower source unless supplied as activity evidence
  - corrective-action due/resolved date scoring depends on future data enrichment
  - backend Prompt 03 owns data retrieval

## Export Surface

Update the appropriate package barrel export if one exists, such as:

```text
packages/features/safety/src/index.ts
```

or the nearest existing package export file.

Keep exports deliberate. Do not expose internal helper-only functions unless tests or later backend prompts need them.

## Constraints

- Do not modify Wave 01 list schema unless a compile-blocking defect is found.
- Do not add backend Function App routes.
- Do not add Graph repository methods.
- Do not add timer triggers.
- Do not add approval/publish workflow.
- Do not add homepage dynamic adapter or SPFx rendering changes.
- Do not alter existing Safety ingestion behavior.
- Do not change auth.
- Do not bump SPFx manifests.
- Do not re-read files still in current context.

## Verification

Run the smallest credible validation set first, then broader checks if needed.

Suggested commands, adjusted to actual repo scripts:

```bash
pnpm --filter @hbc/features-safety typecheck
pnpm --filter @hbc/features-safety test
```

If filter scripts differ, inspect package scripts and use the repo-correct commands.

Also run any targeted tests for files changed by this prompt.

Do not claim tests passed unless they actually passed.

## Required Closure Report

Return this structure:

```md
# Phase 02 — Prompt 02 Closure Report

## Summary

## Files Inspected

## Files Changed

## Domain Package Added

## Canonical Vocabulary Compliance

Confirm the implementation uses:
- EligibilityStatus: eligible, ineligible, low-confidence, needs-review
- ActivityEvidenceStatus: proven, inferred, missing
- PublishRecommendation: primary, secondary, monitor, do-not-publish
- PublishStatus references, if any: draft, pending-review, approved, published, archived, suppressed

## Low-Activity Perfect-Score Suppression Proof

Summarize the tests proving a single 100% score without proven activity cannot become primary.

## Scoring Model Summary

## Homepage Payload / Preview Payload Summary

## Validation Results

Include exact commands and pass/fail results.

## Out of Scope Confirmed

Confirm no backend routes, timer triggers, homepage dynamic adapter, or SPFx runtime changes were made.

## Risks / Follow-Up Items

## Prompt 03 Readiness

State whether backend rollup APIs can now consume the domain package.
```

## Commit Guidance

If the wave closes cleanly, use a commit title similar to:

```text
hb-intel-safety phase-02 wave 02: add safety field excellence scoring domain
```

Commit body should mention:

- pure domain package only
- canonical vocabulary reuse from Wave 01
- low-activity perfect-score suppression
- multi-signal narrative generation
- homepage-safe payload and preview payload builders
- validation commands
- no runtime homepage/backend route changes
