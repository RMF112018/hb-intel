# Phase 02 — Prompt 03: Backend Rollup APIs for Safety Field Excellence

You are working in a fresh local code-agent session inside the live `RMF112018/hb-intel` repository.

Use `main` as authoritative repo truth unless the operator explicitly tells you to work from a feature branch.

## Objective

Implement backend Function App rollup services and APIs that assemble existing Safety Record Keeping data, call the Wave 02 `@hbc/features-safety` excellence domain package, and persist generated Safety Field Excellence candidate scores.

This must use the **existing backend Function App currently used by the Safety application**.

Do not create a second backend application.

## Current Progress Baseline

### Wave 01 completed

Wave 01 added the schema and provisioning foundation:

- `Safety Field Excellence Candidate Scores`
- `Safety Field Excellence Weekly Highlights`
- descriptors and GUID overlay keys:
  - `SafetyFieldExcellenceCandidateScores`
  - `SafetyFieldExcellenceWeeklyHighlights`
- `SpFieldDefinition.indexed?: boolean`
- indexed-column propagation through Safety provisioning
- create-time and repair-time `Indexed: true` handling
- canonical choice vocabularies:
  - `EligibilityStatus`: `eligible`, `ineligible`, `low-confidence`, `needs-review`
  - `ActivityEvidenceStatus`: `proven`, `inferred`, `missing`
  - `PublishRecommendation`: `primary`, `secondary`, `monitor`, `do-not-publish`
  - `PublishStatus`: `draft`, `pending-review`, `approved`, `published`, `archived`, `suppressed`

### Wave 02 completed

Wave 02 added the pure domain package:

```text
packages/features/safety/src/excellence/
```

Known Wave 02 outcomes:

- `generateCandidateScore(...)` or equivalent top-level orchestrator exists in the excellence package.
- Candidate scoring is pure TypeScript and deterministic.
- Candidate ranking helpers exist.
- Homepage-safe publish DTOs exist, but Prompt 05 owns final SPFx adapter mapping.
- Domain types reuse:
  - `SafetyReportingPeriod`
  - `SafetyProjectWeekRecord`
  - `SafetyInspectionEvent`
  - `SafetyFinding`
- Score scale is handled by the domain:
  - repo boundary: `inspectionScore` is fractional `0..1`
  - excellence domain: `0..100`
- Inspection handling is domain-owned:
  - `accepted` counts
  - `duplicate-suspected` / `review-required` penalize data quality and review state
  - `superseded` / `rejected` are excluded
- Mandatory low-activity perfect-score suppression is domain-owned.
- Activity evidence is domain-owned:
  - `proven` only when caller supplies `manual` or `daily-log`
  - `inferred` from project stage or rolling inspection density
  - `inferred` may support `secondary` / `monitor`, not `primary`
- Corrective-action scoring is conservative because current Safety Finding schema lacks due/resolved-date fields.
- 279/279 `@hbc/features-safety` tests passed after Wave 02.
- `@hbc/functions check-types` passed as a cross-impact guard.
- No backend routes, timer triggers, approval/publish workflow, homepage adapter, SPFx runtime code, or manifest changes were made.

Treat these outcomes as current baseline.

## Core Rule for This Wave

The backend must **assemble data and persist results**.

The backend must **not re-implement scoring, ranking, perfect-score suppression, activity inference, or narrative gating** already implemented in:

```text
packages/features/safety/src/excellence/
```

If backend code appears to duplicate domain scoring logic, stop and refactor the logic back to the excellence package or consume the existing package correctly.

## Scope

Add or update:

```text
backend/functions/src/services/safety-field-excellence-graph-repository.ts
backend/functions/src/services/safety-field-excellence-rollup-service.ts
backend/functions/src/functions/adminApi/safety-field-excellence-routes.ts
backend/functions/src/services/sharepoint-service.ts
backend/functions/src/services/safety-field-excellence-telemetry.ts
backend/functions/src/test/** or existing backend test area
```

You may adjust file locations to match current backend conventions, but preserve ownership boundaries.

## Existing Patterns to Reuse

Inspect and reuse patterns from:

```text
backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts
backend/functions/src/services/safety-ingestion-application-service.ts
backend/functions/src/services/safety-ingestion-graph-repository.ts
backend/functions/src/services/safety-ingestion-graph-data-plane.ts
backend/functions/src/services/safety-ingestion-telemetry.ts
backend/functions/src/services/graph-list-discovery-service.ts
backend/functions/src/services/sharepoint-service.ts
backend/functions/src/services/safety-provisioning-service.ts
backend/functions/src/middleware/auth.ts
backend/functions/src/middleware/authorization.ts
backend/functions/src/middleware/request-id.ts
packages/features/safety/src/excellence/
packages/features/safety/src/lists/descriptors.ts
packages/features/safety/src/lists/fieldSchema.ts
packages/features/safety/src/domain/types.ts
```

Do not re-read files still within your current context or memory.

## Required Routes

Implement these admin/control-plane routes:

```text
POST /api/safety-field-excellence/rollup/dry-run
POST /api/safety-field-excellence/rollup/generate
GET  /api/safety-field-excellence/reporting-periods/{id}/candidates
```

## Explicitly Out of Scope for Prompt 03

Do **not** implement these in this wave:

```text
GET  /api/safety-field-excellence/highlights/{id}
POST /api/safety-field-excellence/highlights/{id}/approve
POST /api/safety-field-excellence/highlights/{id}/override
POST /api/safety-field-excellence/highlights/{id}/publish
POST /api/safety-field-excellence/highlights/{id}/suppress
POST /api/safety-field-excellence/highlights/{id}/rollback
GET  /api/safety-field-excellence/homepage/current
```

Those belong to Prompt 04 / publish workflow and Prompt 05 / homepage adapter sequencing.

This wave may create service seams that Prompt 04 will reuse, but it must not publish homepage highlights.

## Route Behavior

### `POST /api/safety-field-excellence/rollup/dry-run`

Purpose:

- assemble Safety data for a reporting period
- call the excellence domain scoring package
- rank candidates
- return candidate summaries
- write nothing

Request body should support:

```ts
interface SafetyFieldExcellenceRollupRequest {
  readonly reportingPeriodId?: string;
  readonly reportingPeriodSpItemId?: number;
  readonly rollingWindowWeeks?: number; // default 4 unless repo docs specify otherwise
  readonly generatorVersion?: string;
  readonly generatedAt?: string;
  readonly activityEvidenceByProjectNumber?: Record<string, SafetyActivityEvidence>;
}
```

Notes:

- `activityEvidenceByProjectNumber` is optional.
- Do not fabricate proven activity evidence.
- If no activity evidence is provided, let the excellence domain infer or mark missing.
- If both `reportingPeriodId` and `reportingPeriodSpItemId` are absent, use the current/open period only if a current repo pattern already supports it. Otherwise return a clear validation error.

Response should include:

```ts
interface SafetyFieldExcellenceRollupDryRunResponse {
  readonly success: boolean;
  readonly dryRun: true;
  readonly reportingPeriodId: string;
  readonly reportingPeriodSpItemId: number;
  readonly generatorVersion: string;
  readonly generatedAt: string;
  readonly candidateCount: number;
  readonly eligibleCount: number;
  readonly lowConfidenceCount: number;
  readonly needsReviewCount: number;
  readonly ineligibleCount: number;
  readonly suppressedPerfectScoreCount: number;
  readonly missingActivityEvidenceCount: number;
  readonly candidates: ReadonlyArray<SafetyFieldExcellenceCandidateScore>;
  readonly diagnostics: ReadonlyArray<{
    readonly code: string;
    readonly message: string;
    readonly severity: "info" | "warning" | "error";
  }>;
}
```

### `POST /api/safety-field-excellence/rollup/generate`

Purpose:

- same assembly/scoring as dry-run
- persist candidate score records into `Safety Field Excellence Candidate Scores`
- idempotent by:
  - `ReportingPeriodId`
  - `ProjectWeekRecordId`
  - `ProjectNumber`
  - `GeneratorVersion`

Request body shape may match dry-run.

Response should include:

```ts
interface SafetyFieldExcellenceRollupGenerateResponse {
  readonly success: boolean;
  readonly dryRun: false;
  readonly reportingPeriodId: string;
  readonly reportingPeriodSpItemId: number;
  readonly generatorVersion: string;
  readonly generatedAt: string;
  readonly candidateCount: number;
  readonly createdCount: number;
  readonly updatedCount: number;
  readonly unchangedCount?: number;
  readonly eligibleCount: number;
  readonly lowConfidenceCount: number;
  readonly needsReviewCount: number;
  readonly ineligibleCount: number;
  readonly suppressedPerfectScoreCount: number;
  readonly missingActivityEvidenceCount: number;
  readonly candidateItemIds: ReadonlyArray<number>;
  readonly diagnostics: ReadonlyArray<{
    readonly code: string;
    readonly message: string;
    readonly severity: "info" | "warning" | "error";
  }>;
}
```

### `GET /api/safety-field-excellence/reporting-periods/{id}/candidates`

Purpose:

- list generated candidate score records for a reporting period
- support later Safety leadership review UI
- return persisted candidate records and scoring summary
- do not recompute unless explicitly requested by future routes

Query parameters may support:

```text
?generatorVersion=
?recommendation=
?eligibilityStatus=
?top=
```

Response should include:

```ts
interface SafetyFieldExcellenceCandidateListResponse {
  readonly success: boolean;
  readonly reportingPeriodId: string;
  readonly candidates: ReadonlyArray<PersistedSafetyFieldExcellenceCandidate>;
  readonly diagnostics: ReadonlyArray<...>;
}
```

## Repository Requirements

Implement a backend repository that owns Graph data access for this feature.

Minimum methods:

```ts
interface ISafetyFieldExcellenceGraphRepository {
  resolveReportingPeriod(input: {
    reportingPeriodId?: string;
    reportingPeriodSpItemId?: number;
  }): Promise<SafetyReportingPeriod>;

  listProjectWeeksForReportingPeriod(input: {
    reportingPeriodId: string;
    reportingPeriodSpItemId: number;
  }): Promise<ReadonlyArray<SafetyProjectWeekRecord>>;

  listInspectionsForProjectWeek(input: {
    reportingPeriodId: string;
    reportingPeriodSpItemId: number;
    projectWeekRecordId: string;
    projectWeekRecordSpItemId: number;
    projectNumber: string;
  }): Promise<ReadonlyArray<SafetyInspectionEvent>>;

  listFindingsForProjectWeek(input: {
    projectWeekRecordId: string;
    projectWeekRecordSpItemId: number;
  }): Promise<ReadonlyArray<SafetyFinding>>;

  listRollingHistory(input: {
    projectNumber: string;
    currentReportingPeriod: SafetyReportingPeriod;
    rollingWindowWeeks: number;
  }): Promise<{
    readonly priorProjectWeeks: ReadonlyArray<SafetyProjectWeekRecord>;
    readonly priorInspections: ReadonlyArray<SafetyInspectionEvent>;
    readonly priorFindings: ReadonlyArray<SafetyFinding>;
  }>;

  upsertCandidateScore(input: {
    reportingPeriod: SafetyReportingPeriod;
    projectWeek: SafetyProjectWeekRecord;
    score: SafetyExcellenceCandidateScore;
  }): Promise<{
    readonly outcome: "created" | "updated" | "unchanged";
    readonly itemId: number;
  }>;

  listCandidateScores(input: {
    reportingPeriodId: string;
    generatorVersion?: string;
    eligibilityStatus?: string;
    publishRecommendation?: string;
    top?: number;
  }): Promise<ReadonlyArray<PersistedSafetyFieldExcellenceCandidate>>;
}
```

Use actual exported names from the Wave 02 excellence package. Do not invent duplicate types if they already exist.

## Candidate Field Mapping

Map `SafetyExcellenceCandidateScore` into `Safety Field Excellence Candidate Scores` fields created in Wave 01.

Required mapping:

| Candidate Score field | SharePoint field |
|---|---|
| reporting period ID | `ReportingPeriodId` lookup |
| project-week record ID | `ProjectWeekRecordId` lookup |
| project lookup ID | `ProjectLookupId` where available |
| project number | `ProjectNumber` |
| project name snapshot | `ProjectNameSnapshot` |
| project stage snapshot | `ProjectStageSnapshot` |
| project location snapshot | `ProjectLocationSnapshot` |
| eligibility status | `EligibilityStatus` |
| exclusion reasons | `ExclusionReasonsJson` |
| composite score | `CompositeScore` |
| safety performance | `SafetyPerformanceScore` |
| consistency trend | `ConsistencyTrendScore` |
| activity exposure | `ActivityExposureScore` |
| corrective action | `CorrectiveActionScore` |
| data quality | `DataQualityScore` |
| inspection count window | `InspectionCountWindow` |
| inspection count rolling | `InspectionCountRolling` |
| average window score | `AverageInspectionScoreWindow` |
| average rolling score | `AverageInspectionScoreRolling` |
| inspection trend | `InspectionTrendPct` |
| highest risk finding | `HighestRiskFindingLevel` |
| high severity count | `HighSeverityFindingCount` |
| medium severity count | `MediumSeverityFindingCount` |
| open finding count | `OpenFindingCount` |
| aged open count | `AgedOpenFindingCount` |
| repeat finding count | `RepeatFindingCount` |
| activity evidence status | `ActivityEvidenceStatus` |
| activity evidence JSON | `ActivityEvidenceJson` |
| reason summary | `ReasonSummary` |
| source inspection IDs | `SourceInspectionIdsJson` |
| source finding IDs | `SourceFindingIdsJson` |
| generated timestamp | `GeneratedAt` |
| generator version | `GeneratorVersion` |
| recommendation | `PublishRecommendation` |

Lookup fields must use numeric SharePoint item IDs where the provisioning/write path requires them. Follow the existing Safety ingestion repository’s lookup conventions.

## Data Assembly Rules

For each project-week in the target reporting period:

1. Load the `SafetyProjectWeekRecord`.
2. Load inspections for that project-week.
3. Load findings for that project-week.
4. Load prior rolling history for the same `ProjectNumber`.
5. Resolve optional caller-supplied activity evidence by `ProjectNumber`.
6. Construct `SafetyExcellenceCandidateInput`.
7. Call the Wave 02 domain orchestrator.
8. Collect candidate score.
9. Rank candidates using the Wave 02 ranking helper.
10. In generate mode, persist candidate score records idempotently.

Do not embed scoring thresholds in backend services.

## Query Rules

Use Graph-only backend data access consistent with the Safety backend posture.

Required rules:

- use bounded queries
- use indexed columns from Wave 01:
  - `ReportingPeriodId`
  - `ProjectWeekRecordId`
  - `ProjectNumber`
  - `GeneratedAt`
- use selected fields only
- do not fetch raw workbook JSON unless absolutely required, and never return it
- treat query truncation or incomplete pagination as a diagnostic/error
- backend may page internally
- homepage must never page or aggregate raw Safety list data

## Pagination and Completeness

If using Graph list-item APIs:

- implement paging where the expected result may exceed one page
- capture all pages required for completeness
- fail or emit high-severity diagnostic if paging fails
- do not silently score partial data as complete

## Auth Requirements

Reuse existing Function App auth and authorization patterns.

Requirements:

- use existing auth middleware
- use Safety-specific route gate if present
- do not weaken security
- do not introduce anonymous write access
- dry-run is still protected because it reads operational Safety data
- generate must require the stronger Safety/admin permission posture used by existing Safety provisioning or ingestion admin routes

If there is ambiguity in existing role gates, preserve the stricter existing Safety route pattern and document any follow-up.

## Telemetry Requirements

Add telemetry for:

- rollup start
- rollup complete
- dry-run vs generate
- reporting period
- generator version
- project-week count
- candidate count
- eligible count
- low-confidence count
- needs-review count
- ineligible count
- suppressed perfect-score count
- missing activity evidence count
- query failures
- write failures
- duration
- request ID / correlation ID

Do not log raw workbook JSON or sensitive finding text.

## Diagnostics

Return bounded diagnostics from rollup service.

Suggested diagnostic categories:

- `REPORTING_PERIOD_NOT_FOUND`
- `PROJECT_WEEK_QUERY_FAILED`
- `INSPECTION_QUERY_FAILED`
- `FINDING_QUERY_FAILED`
- `ROLLING_HISTORY_QUERY_FAILED`
- `CANDIDATE_SCORE_FAILED`
- `CANDIDATE_WRITE_FAILED`
- `PARTIAL_DATA_BLOCKED`
- `ACTIVITY_EVIDENCE_MISSING`
- `PERFECT_SCORE_SUPPRESSED`
- `NO_PROJECT_WEEKS_FOUND`

Diagnostics should be useful to operators and tests, but not leak internal secrets or raw checklist data.

## No Raw Workbook JSON Rule

The following must not be returned by any Prompt 03 route:

- `RawChecklistJson`
- raw workbook contents
- raw uploaded file contents
- internal token/auth details
- full unredacted Graph error payloads
- employee performance details

If raw checklist JSON is fetched internally by an existing mapper, strip it before response and do not persist it into candidate score records.

## Idempotency Rules

`generate` must be idempotent.

Recommended candidate identity:

```text
ReportingPeriodId + ProjectWeekRecordId + ProjectNumber + GeneratorVersion
```

If candidate exists:

- update the candidate fields if values changed
- optionally return `unchanged` if all write fields match
- do not create duplicates

If multiple existing records match the identity:

- do not write blindly
- return a diagnostic or fail closed
- document remediation follow-up

## Service Ownership

### Rollup service owns:

- request validation
- reporting period resolution
- candidate input assembly
- call into excellence domain package
- aggregate counts
- rank candidates
- write orchestration for generate mode
- diagnostics/telemetry coordination

### Graph repository owns:

- list resolution
- field selection
- Graph list reads
- paging
- candidate score upsert
- candidate list reads
- mapping between Graph fields and Safety domain types

### Excellence domain owns:

- score conversion
- inspection filtering
- eligibility
- activity inference
- corrective-action scoring
- narrative
- ranking logic
- publish recommendation

Do not blur these seams.

## Required Tests

Add backend tests with mocked Graph/repository data.

Minimum required tests:

### Route tests

- dry-run route returns scored candidates and writes nothing
- generate route writes/upserts candidates
- list-candidates route returns persisted candidates
- protected route denies unauthenticated/unauthorized request if existing test harness supports auth testing

### Service tests

- rollup service calls excellence domain and returns counts
- low-activity perfect-score suppression appears in dry-run output
- generate mode writes suppressed candidates with `do-not-publish` recommendation, not primary
- missing project weeks returns bounded diagnostic
- partial query/paging failure returns failure or high-severity diagnostic
- no raw workbook JSON is returned
- caller-supplied proven activity evidence is passed into the domain
- no activity evidence lets the domain infer/missing status

### Repository tests

- candidate upsert creates new item
- candidate upsert updates existing item
- candidate upsert is idempotent where possible
- duplicate identity records fail closed
- candidate score field mapping matches Wave 01 schema
- lookup fields use numeric SharePoint item IDs

### Cross-impact

- existing Safety ingestion tests remain green
- `@hbc/functions check-types` clean
- `@hbc/features-safety check-types` clean

## Validation

Run the smallest credible set first, then broaden as needed.

Suggested commands, adjusted to actual repo scripts:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/features-safety check-types
pnpm --filter @hbc/features-safety test
```

If scripts differ, inspect package scripts and use the repo-correct commands.

Do not claim tests passed unless they actually passed.

## Required Closure Report

Return:

```md
# Phase 02 — Prompt 03 Closure Report

## Summary

## Files Inspected

## Files Changed

## Backend Routes Added

List each route and its auth posture.

## Repository / Query Contract

Explain:
- lists queried
- indexed filters used
- paging behavior
- selected fields
- no raw workbook JSON guarantee

## Excellence Domain Consumption

Confirm backend consumed the Wave 02 excellence package and did not duplicate scoring logic.

## Candidate Persistence

Explain idempotent identity and field mapping.

## Diagnostics and Telemetry

## Validation Results

Include exact commands and pass/fail results.

## Out of Scope Confirmed

Confirm no timer trigger, approval/publish workflow, homepage current endpoint, homepage adapter, SPFx runtime code, auth weakening, or manifest changes were made.

## Risks / Follow-Up Items

## Prompt 04 Readiness

State whether timer/publish workflow can now consume:
- rollup dry-run/generate service
- persisted candidate scores
- candidate list endpoint
```

## Commit Guidance

If the wave closes cleanly, use a commit title similar to:

```text
hb-intel-safety phase-02 wave 03: add safety field excellence backend rollup APIs
```

Commit body should mention:

- existing Safety backend Function App reused
- Graph-only backend data access
- dry-run / generate / list-candidates routes
- Wave 02 excellence package consumed
- candidate upsert identity
- no scoring reimplementation
- low-activity perfect-score suppression surfaced from domain output
- validation commands
- no timer/publish/homepage adapter/SPFx runtime changes
