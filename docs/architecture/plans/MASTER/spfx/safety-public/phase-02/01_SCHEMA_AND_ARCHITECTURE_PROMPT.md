# 01 — Schema and Architecture Foundation Prompt

You are working in the local `RMF112018/hb-intel` repository. Main is authoritative.

## Objective

Implement the schema, descriptors, provisioning definitions, and architecture documentation required to support dynamic Safety Field Excellence without changing current runtime behavior.

## Scope

Add the data-model foundation for:

1. `Safety Field Excellence Candidate Scores`
2. `Safety Field Excellence Weekly Highlights`

These lists support backend-generated candidate scoring and approved homepage publication.

## Files to Inspect

Do not re-read files that are still within your current context.

Inspect:

- `packages/features/safety/src/lists/descriptors.ts`
- `packages/features/safety/src/lists/fieldSchema.ts`
- `backend/functions/src/config/safety-record-keeping-list-definitions.ts`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/`
- `docs/architecture/plans/MASTER/spfx/safety-records/design-pacakge/03-Data-Model-and-HBCentral-List-Architecture.md`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/`
- `apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts`
- `docs/reference/ui-kit/doctrine/`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Required Implementation

### 1. Architecture Doc

Create or update:

```text
docs/architecture/plans/MASTER/spfx/safety-public/dynamic-safety-field-excellence-cutover-plan.md
```

Include:

- current curated architecture
- target dynamic architecture
- backend Function App integration requirement
- no browser raw-list aggregation rule
- source-mode cutover
- preview fallback requirement
- UI/UX flagship acceptance requirements
- scorecard target
- risk controls for single-score recognition

### 2. List Schema Docs

Create:

```text
docs/reference/sharepoint/list-schemas/hbcentral/lists/safety-field-excellence-candidate-scores.md
docs/reference/sharepoint/list-schemas/hbcentral/lists/safety-field-excellence-weekly-highlights.md
```

### 3. Descriptors

Extend:

```text
packages/features/safety/src/lists/descriptors.ts
```

Add descriptors for:

- `SafetyFieldExcellenceCandidateScores`
- `SafetyFieldExcellenceWeeklyHighlights`

Follow existing descriptor conventions and fail-closed GUID overlay behavior.

### 4. Field Schema

Extend:

```text
packages/features/safety/src/lists/fieldSchema.ts
```

Add:

- `SAFETY_FIELD_EXCELLENCE_CANDIDATE_SCORES_FIELDS`
- `SAFETY_FIELD_EXCELLENCE_WEEKLY_HIGHLIGHTS_FIELDS`

### 5. Backend Provisioning

Extend:

```text
backend/functions/src/config/safety-record-keeping-list-definitions.ts
```

Add both new lists to the Safety provisioning container definitions.

### 6. Index Requirements

Document index requirements for:

- `ReportingPeriodId`
- `ProjectWeekRecordId`
- `ProjectNumber`
- `PublishStatus`
- `GeneratedAt`
- `WeekStartDate`
- `WeekEndDate`
- `FreshUntil`

If provisioning utilities already support index creation, wire it. If they do not, document the gap explicitly and create a follow-up item.

## Candidate Scores Required Fields

Include at minimum:

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

## Weekly Highlights Required Fields

Include at minimum:

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

## Constraints

- Do not implement scoring.
- Do not implement backend rollup APIs.
- Do not implement homepage dynamic adapter.
- Do not alter existing Safety ingestion behavior.
- Do not alter existing homepage behavior.
- Do not modify auth posture.

## Validation

Run the narrowest valid checks available, such as:

```bash
pnpm typecheck
pnpm test --filter @hbc/features-safety
pnpm test --filter backend-functions
```

If exact scripts differ, inspect `package.json` and use repo-appropriate commands.

## Required Closure Report

Return:

- Plan Summary
- Files inspected
- Files changed
- Schema summary
- Provisioning impact
- Validation results
- Open risks
- Next prompt readiness
