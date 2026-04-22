# 03 — Data Model and HBCentral List Architecture

## Objective

Define the authoritative structured list architecture for the Safety Record Keeping solution on HBCentral.

## Canonical references already on HBCentral

### Projects
Key fields available for reference include:

- `ID`
- `ProjectId`
- `ProjectNumber`
- `ProjectName`
- `ProjectLocation`
- `ProjectType`
- `ProjectStage`
- `SiteUrl`
- `Year`
- `projectExecutiveUpn`
- `projectManagerUpn`

### Legacy Project Fallback Registry
Key fields available for reference include:

- `ID`
- `ProjectNumber`
- `ProjectNameRaw`
- `LegacyYear`
- `FolderWebUrl`
- `MatchStatus`
- `MatchConfidence`
- `MatchedProjectListItemId`
- `MatchedProjectTitle`
- `MatchMethod`
- `IsActive`

## Proposed authoritative safety lists on HBCentral

### 1. Safety Reporting Periods
Parent record for a weekly cycle.

**Purpose**
- define the reporting week
- provide status / publish control
- support dashboards and completeness tracking

**Recommended fields**
- `Title`
- `WeekStartDate`
- `WeekEndDate`
- `PeriodLabel`
- `Status`
- `CreatedBy`
- `PublishedAt`
- `PublishedBy`
- `Notes`

### 2. Safety Project Week Records
One record per project per reporting period.

**Purpose**
- store weekly rollup by project
- aggregate multiple inspection events
- hold project-week completion / publication state

**Recommended fields**
- `Title`
- `ReportingPeriodId` (lookup)
- `ProjectLookupId` (lookup to HBCentral `Projects`, optional when canonical project found)
- `LegacyRegistryItemId` (lookup or numeric reference)
- `ProjectSourceClassification` (`project`, `legacy-only`, `project+legacy`)
- `ProjectNumber`
- `ProjectNameSnapshot`
- `ProjectStageSnapshot`
- `ProjectLocationSnapshot`
- `ExpectedInspectionThisWeek` (bool)
- `InspectionCount`
- `AverageInspectionScore`
- `HighestRiskFindingLevel`
- `WeeklySummary`
- `ManagerReviewStatus`
- `PublishStatus`

### 3. Safety Inspection Events
One record per uploaded checklist / inspection occurrence.

**Purpose**
- preserve each field inspection as a first-class record
- serve as the source for weekly averaging
- preserve auditability against raw upload

**Recommended fields**
- `Title`
- `ProjectWeekRecordId` (lookup)
- `ReportingPeriodId` (lookup)
- `SourceUploadItemId`
- `TemplateVersion`
- `InspectionDate`
- `InspectionNumber`
- `InspectorName` or `InspectorUpn`
- `ProjectNumber`
- `ProjectNameSnapshot`
- `InspectionScore`
- `TotalYes`
- `TotalNo`
- `TotalNA`
- `RawChecklistJson`
- `ParserVersion`
- `IngestionStatus`
- `DuplicateStatus`
- `RequiresReview`
- `SubmittedAt`
- `CommittedAt`

### 4. Safety Findings
Structured issues extracted from the inspection.

**Purpose**
- capture actionable or meaningful negatives
- support trend analysis and downstream signals

**Recommended fields**
- `Title`
- `InspectionEventId` (lookup)
- `ProjectWeekRecordId` (lookup)
- `SectionNumber`
- `SectionName`
- `ChecklistRowNumber`
- `ChecklistItemLabel`
- `FindingType`
- `Severity`
- `FindingSummary`
- `OriginalNoteText`
- `RequiresCorrectiveAction`
- `IsOpen`
- `DueDate`
- `OwnerSnapshot`

### 5. Safety Corrective Actions
Optional follow-up record when a finding needs explicit ownership.

**Purpose**
- track remediation of higher-value findings
- support accountability and stale issue warnings

**Recommended fields**
- `Title`
- `FindingId` (lookup)
- `ProjectWeekRecordId` (lookup)
- `AssignedTo`
- `DueDate`
- `Status`
- `ResolutionNote`
- `ResolvedAt`

### 6. Safety Ingestion Runs
Audit / observability list for uploads and parse attempts.

**Purpose**
- track upload processing
- preserve failure reasons and parser evidence

**Recommended fields**
- `Title`
- `SourceUploadItemId`
- `UploadFileName`
- `TemplateVersionDetected`
- `Checksum`
- `ValidationStatus`
- `ParseStatus`
- `ProjectResolutionStatus`
- `CommittedEntityIdsJson`
- `ErrorSummary`
- `RunStartedAt`
- `RunCompletedAt`

### 7. Safety Publish Snapshots
Optional but recommended publish layer for Safety Field Excellence.

**Purpose**
- separate transactional capture from curated downstream publishing
- support freshness tracking and rollback

**Recommended fields**
- `Title`
- `ReportingPeriodId`
- `ProjectWeekRecordId`
- `SnapshotType`
- `PayloadJson`
- `FreshUntil`
- `PublishedAt`
- `PublishedBy`

## Relationship diagram

- `Safety Reporting Periods`
  - parent of `Safety Project Week Records`
- `Safety Project Week Records`
  - parent of `Safety Inspection Events`
  - parent or linked container for `Safety Findings`
- `Safety Inspection Events`
  - parent of `Safety Findings`
- `Safety Findings`
  - parent of `Safety Corrective Actions`

## Lookup / reference guidance

Because the new structured safety lists are also on HBCentral, the design can use same-site lookup relationships where helpful, especially to:

- `Projects`
- `Safety Reporting Periods`
- `Safety Project Week Records`
- `Safety Inspection Events`

Still store key snapshot fields on the child records so reporting remains stable even if the upstream project title or stage changes later.

## Snapshot fields that should always be stored

At inspection-event and project-week level, store:

- `ProjectNumber`
- `ProjectNameSnapshot`
- `ProjectLocationSnapshot`
- `ProjectStageSnapshot`

This prevents historical drift.

## Release 1 list priority

### Must build now
- `Safety Reporting Periods`
- `Safety Project Week Records`
- `Safety Inspection Events`
- `Safety Ingestion Runs`

### Strongly recommended now
- `Safety Findings`

### Can be staged if needed
- `Safety Corrective Actions`
- `Safety Publish Snapshots`

## Why this model is correct

This model matches the real-world behavior evidenced by the existing weekly workbook and checklist workbook:

- multiple inspections can occur in one week
- weekly score is derived, not primary
- findings need to survive beyond one freeform note cell
- downstream homepage signals should come from structured rollups, not workbook text blobs
