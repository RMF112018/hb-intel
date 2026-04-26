# 02 — Backend Function App and Data Pipeline

## Objective

Extend the backend Function App currently used by the Safety application so it can generate, review, approve, publish, and serve weekly Safety Field Excellence highlights.

The homepage must interact with this backend through a read-only published-highlight endpoint. The backend continues to own raw SharePoint/Graph aggregation, scoring, approval, and provenance.

## Backend Architecture

```text
Existing Safety ingestion backend
  ├─ preview / ingest / replay
  ├─ existing Graph repository
  ├─ existing Safety list GUID overlay
  ├─ existing telemetry and route auth
  └─ new Safety Field Excellence module
       ├─ candidate generation
       ├─ scoring
       ├─ weekly timer rollup
       ├─ approval / override / publish
       └─ homepage current-published endpoint
```

## New Backend Module

Recommended files:

```text
packages/features/safety/src/excellence/
  types.ts
  eligibility.ts
  scoring.ts
  exposure.ts
  correctiveActions.ts
  narrative.ts
  homepagePayload.ts
  index.ts
  __tests__/

backend/functions/src/services/safety-field-excellence-graph-repository.ts
backend/functions/src/services/safety-field-excellence-rollup-service.ts
backend/functions/src/services/safety-field-excellence-publish-service.ts
backend/functions/src/functions/adminApi/safety-field-excellence-routes.ts
backend/functions/src/functions/scheduled/safety-field-excellence-weekly-rollup.ts
```

## New Lists

### `Safety Field Excellence Candidate Scores`

Machine-generated candidate score records.

Key fields:

- `Title`
- `ReportingPeriodId`
- `ProjectWeekRecordId`
- `ProjectLookupId`
- `ProjectNumber`
- `ProjectNameSnapshot`
- `ProjectStageSnapshot`
- `ProjectLocationSnapshot`
- `EligibilityStatus`
- `ExclusionReasonsJson`
- `CompositeScore`
- `SafetyPerformanceScore`
- `ConsistencyTrendScore`
- `ActivityExposureScore`
- `CorrectiveActionScore`
- `DataQualityScore`
- `InspectionCountWindow`
- `InspectionCountRolling`
- `AverageInspectionScoreWindow`
- `AverageInspectionScoreRolling`
- `InspectionTrendPct`
- `HighestRiskFindingLevel`
- `HighSeverityFindingCount`
- `MediumSeverityFindingCount`
- `OpenFindingCount`
- `AgedOpenFindingCount`
- `RepeatFindingCount`
- `ActivityEvidenceStatus`
- `ActivityEvidenceJson`
- `ReasonSummary`
- `SourceInspectionIdsJson`
- `SourceFindingIdsJson`
- `GeneratedAt`
- `GeneratorVersion`
- `PublishRecommendation`

### `Safety Field Excellence Weekly Highlights`

Approved/published homepage artifact.

Key fields:

- `Title`
- `ReportingPeriodId`
- `WeekStartDate`
- `WeekEndDate`
- `PeriodLabel`
- `PublishStatus`
- `PrimaryCandidateId`
- `SecondaryCandidateIdsJson`
- `HomepagePayloadJson`
- `SourceCandidateIdsJson`
- `SelectionMethodVersion`
- `DataConfidence`
- `DataQualityNotes`
- `EditorialOverrideApplied`
- `OverrideReason`
- `ApprovedBy`
- `ApprovedAt`
- `PublishedAt`
- `FreshUntil`
- `RollbackFromItemId`

## Existing Data Inputs

Use existing data first:

- `Safety Reporting Periods`
- `Safety Project Week Records`
- `Safety Inspection Events`
- `Safety Findings`
- `Safety Ingestion Runs`
- `Projects`
- `Legacy Project Fallback Registry`

## Data Gaps to Handle

The current data model does not fully prove:

- manpower
- active trade count
- work-in-place exposure
- activity hours
- corrective-action resolved date
- corrective-action due date
- repeat finding keys
- formal approval/publish metadata

The first dynamic release must not fake these. It must either add fields/schema, infer them with low/medium confidence, or mark candidates as low-confidence/needs-review.

## Scoring Package

### Eligibility Gates

A candidate must pass:

- active project gate
- current or recent valid inspection gate
- activity/exposure gate
- data quality gate
- unresolved high-risk finding gate
- narrative explainability gate

### Composite Score

```ts
CompositeScore =
  SafetyPerformanceScore * 0.30 +
  ConsistencyTrendScore * 0.20 +
  ActivityExposureScore * 0.20 +
  CorrectiveActionScore * 0.20 +
  DataQualityScore * 0.10;
```

### Low-Activity Perfect-Score Suppression

A single 100% score is not a highlight.

```ts
if (
  averageInspectionScoreWindow === 100 &&
  inspectionCountWindow <= 1 &&
  activityEvidenceStatus !== "proven"
) {
  eligibilityStatus = "ineligible";
  exclusionReasons.push("Perfect score with insufficient activity evidence.");
}
```

## API Routes

### Admin / Safety Leadership Routes

```text
POST /api/safety-field-excellence/rollup/dry-run
POST /api/safety-field-excellence/rollup/generate
GET  /api/safety-field-excellence/reporting-periods/{id}/candidates
GET  /api/safety-field-excellence/highlights/{id}
POST /api/safety-field-excellence/highlights/{id}/approve
POST /api/safety-field-excellence/highlights/{id}/override
POST /api/safety-field-excellence/highlights/{id}/publish
POST /api/safety-field-excellence/highlights/{id}/suppress
POST /api/safety-field-excellence/highlights/{id}/rollback
```

### Homepage Read Route

```text
GET /api/safety-field-excellence/homepage/current
```

Requirements:

- read-only
- returns only published homepage-safe payload
- no individual employee performance detail
- no raw findings text unless already approved for public homepage
- no raw workbook JSON
- includes freshness and provenance metadata
- cache-safe
- lightweight response

## Timer Trigger

Add scheduled weekly rollup:

```text
backend/functions/src/functions/scheduled/safety-field-excellence-weekly-rollup.ts
```

Use schedule from app setting:

```text
SAFETY_FIELD_EXCELLENCE_WEEKLY_ROLLUP_SCHEDULE
```

Recommended schedule:

```text
0 0 6 * * 1
```

Do not set `RunOnStartup=true` in production.

## Backend Function App Integration Requirements

- Reuse existing Function App deployment flow.
- Reuse existing auth middleware and delegated/app role posture.
- Reuse existing managed identity / Graph-only safety posture.
- Reuse existing telemetry patterns.
- Reuse existing request-id/correlation-id handling.
- Reuse existing safety list GUID overlay resolution.
- Do not add a second backend solely for this feature.

## Repository Query Rules

- Use bounded Graph queries.
- Use indexed fields.
- Use `$expand=fields(select=...)` for list item fields.
- Backend may page internally; homepage may not.
- Treat query truncation as a failure for rollup completeness.
- Do not rely on non-indexed random-failure headers.

## Acceptance Criteria

- Dry-run endpoint generates candidates without writes.
- Generate endpoint writes candidate records.
- Timer creates/updates draft highlight idempotently.
- Approval records approver and timestamp.
- Override requires reason.
- Publish freezes `HomepagePayloadJson`.
- Homepage current endpoint returns only published/fresh payload.
- Existing Safety ingestion behavior remains unchanged.
