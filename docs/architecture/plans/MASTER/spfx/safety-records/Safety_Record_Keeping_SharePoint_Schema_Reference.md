# Safety Record Keeping — SharePoint Schema Reference

Generated from the current `main` branch Safety schema authorities in the HB Intel repo:

- `packages/features/safety/src/lists/descriptors.ts`
- `packages/features/safety/src/lists/fieldSchema.ts`
- `packages/features/safety/src/lists/safetyUploadLibrary.ts`

This document covers the SharePoint containers required for the Safety application to function, plus the reference-list dependencies required for full project resolution.

## 1. Site topology

| Container | Type | Site | Repo-truth location / note |
|---|---|---|---|
| Safety Checklist Uploads | Document library | `/sites/Safety` | Server-relative path: `/sites/Safety/SafetyChecklistUploads` |
| Safety Reporting Periods | Custom list | `/sites/HBCentral` | Weekly parent records for safety inspection cycles |
| Safety Project Week Records | Custom list | `/sites/HBCentral` | One record per project per reporting period; holds weekly rollup |
| Safety Inspection Events | Custom list | `/sites/HBCentral` | Authoritative per-inspection record; preserves raw parsed evidence |
| Safety Findings | Custom list | `/sites/HBCentral` | Structured findings derived from inspection events |
| Safety Ingestion Runs | Custom list | `/sites/HBCentral` | Audit trail for upload processing attempts |

## 2. Global implementation notes

- For the five HBCentral safety lists, **GUID binding is authoritative** in the runtime adapter; list titles are logging-friendly but not the authoritative runtime identity.
- The upload library is the one exception: it can be addressed by server-relative path even when no list GUID overlay is configured.
- The Safety application also depends on two **reference lists** on `/sites/HBCentral` for full project resolution:
  - `Projects`
  - `Legacy Project Fallback Registry`
- The current repo-truth Safety field schema does **not** explicitly mark indexed columns for the five safety-owned HBCentral lists. Where indexing is not explicitly modeled, this document calls out **operationally important columns** that are likely candidates for indexing because they are used in lookups, filters, or duplicate-detection workflows.
- Recommended list-level operational settings:
  - keep standard versioning enabled for auditability
  - do not rename internal column names after provisioning
  - preserve lookup targets exactly as defined below
  - keep required choice values stable because the app persists and reads exact strings

## 3. Lookup dependency map

| Source list | Internal field | Type | Target |
|---|---|---|---|
| Safety Project Week Records | `ReportingPeriodId` | Lookup | `Safety Reporting Periods` |
| Safety Project Week Records | `ProjectLookupId` | Lookup | `Projects` |
| Safety Inspection Events | `ProjectWeekRecordId` | Lookup | `Safety Project Week Records` |
| Safety Inspection Events | `ReportingPeriodId` | Lookup | `Safety Reporting Periods` |
| Safety Inspection Events | `SupersededByInspectionEventId` | Lookup | `Safety Inspection Events` |
| Safety Findings | `InspectionEventId` | Lookup | `Safety Inspection Events` |
| Safety Findings | `ProjectWeekRecordId` | Lookup | `Safety Project Week Records` |
| Safety Ingestion Runs | `ReportingPeriodId` | Lookup | `Safety Reporting Periods` |
| Safety Ingestion Runs | `ParentRunId` | Lookup | `Safety Ingestion Runs` |

## 4. Container-by-container schema

---

## Safety Checklist Uploads

**Type:** Document library  
**Site:** `/sites/Safety`  
**Purpose:** Landing library for coordinator-submitted safety checklist workbooks  
**Server-relative path:** `/sites/Safety/SafetyChecklistUploads`

### Critical metadata columns
The current repo-truth upload-library descriptor defines these as the critical internal names:

- `InspectionNumber`
- `InspectionDate`
- `ProjectNumber`

### Valuable settings / notes
- This library is the source-of-upload truth for workbook retention and replay.
- If these metadata columns are not already present on the library, add them as document-library columns using these exact internal names.
- These three columns are the most operationally important candidates for indexing because they are central to duplicate detection, inspection identification, and project resolution.
- The runtime can address this library by server-relative path even without a GUID overlay.

---

## Safety Reporting Periods

**Type:** Custom list  
**Site:** `/sites/HBCentral`  
**Purpose:** Weekly parent records for safety inspection cycles  
**Operationally important columns:** `WeekStartDate`, `WeekEndDate`, `PeriodLabel`, `Status`

### Field schema

| Internal name | Display name | Type | Required | Choices / Lookup target | Notes |
|---|---|---:|:---:|---|---|
| `Title` | Title | Text | Yes |  | Standard title field |
| `WeekStartDate` | Week Start Date | DateTime | Yes |  | Start of reporting period |
| `WeekEndDate` | Week End Date | DateTime | Yes |  | End of reporting period |
| `PeriodLabel` | Period Label | Text | No |  | Human-readable label |
| `Status` | Status | Choice | No | `open`, `closed`, `published` | Workflow status |
| `PublishedAt` | Published At | DateTime | No |  | Publication timestamp |
| `PublishedBy` | Published By | User | No |  | Publisher |
| `Notes` | Notes | Note / MultiLineText | No |  | Administrative notes |

### Valuable settings
- Strong candidate for indexing:
  - `WeekStartDate`
  - `WeekEndDate`
  - `Status`

---

## Safety Project Week Records

**Type:** Custom list  
**Site:** `/sites/HBCentral`  
**Purpose:** One record per project per reporting period; holds weekly rollup  
**Operationally important columns:** `ReportingPeriodId`, `ProjectNumber`, `ProjectNameSnapshot`, `InspectionCount`, `AverageInspectionScore`, `PublishStatus`

### Field schema

| Internal name | Display name | Type | Required | Choices / Lookup target | Notes |
|---|---|---:|:---:|---|---|
| `Title` | Title | Text | Yes |  | Standard title field |
| `ReportingPeriodId` | Reporting Period | Lookup | Yes | `Safety Reporting Periods` | Parent reporting period |
| `ProjectLookupId` | Project | Lookup | No | `Projects` | Canonical project lookup |
| `LegacyRegistryItemId` | Legacy Registry Item | Number | No |  | Legacy fallback registry item id |
| `ProjectSourceClassification` | Project Source | Choice | No | `project`, `legacy-only`, `project+legacy`, `unresolved` | Resolution source |
| `ProjectNumber` | Project Number | Text | Yes |  | Primary project identity used by Safety |
| `ProjectNameSnapshot` | Project Name | Text | No |  | Snapshotted project name |
| `ProjectStageSnapshot` | Project Stage | Text | No |  | Snapshotted project stage |
| `ProjectLocationSnapshot` | Project Location | Text | No |  | Snapshotted project location |
| `ExpectedInspectionThisWeek` | Expected This Week | Boolean | No |  | Planned/expected inspection flag |
| `InspectionCount` | Inspection Count | Number | No |  | Weekly inspection count |
| `AverageInspectionScore` | Average Score | Number | No |  | Weekly rollup average |
| `HighestRiskFindingLevel` | Highest Risk Level | Choice | No | `info`, `medium`, `high` | Weekly severity rollup |
| `WeeklySummary` | Weekly Summary | Note / MultiLineText | No |  | Narrative summary |
| `ManagerReviewStatus` | Manager Review | Choice | No | `not-required`, `pending`, `approved` | Review state |
| `PublishStatus` | Publish Status | Choice | No | `not-started`, `awaiting-upload`, `in-progress`, `completed`, `review-required`, `published` | Status shown in workflow |

### Valuable settings
- Strong candidates for indexing:
  - `ReportingPeriodId`
  - `ProjectNumber`
  - `PublishStatus`
  - `ProjectSourceClassification`

---

## Safety Inspection Events

**Type:** Custom list  
**Site:** `/sites/HBCentral`  
**Purpose:** Authoritative per-inspection record; preserves raw parsed evidence  
**Operationally important columns:** `ProjectWeekRecordId`, `SourceUploadItemId`, `TemplateVersion`, `InspectionDate`, `InspectionNumber`, `InspectionScore`, `RawChecklistJson`, `ParserVersion`, `IngestionStatus`, `Checksum`

### Field schema

| Internal name | Display name | Type | Required | Choices / Lookup target | Notes |
|---|---|---:|:---:|---|---|
| `Title` | Title | Text | Yes |  | Standard title field |
| `ProjectWeekRecordId` | Project-Week Record | Lookup | Yes | `Safety Project Week Records` | Parent weekly record |
| `ReportingPeriodId` | Reporting Period | Lookup | Yes | `Safety Reporting Periods` | Parent period |
| `SourceUploadItemId` | Source Upload Item ID | Number | Yes |  | Upload-library item id |
| `SourceUploadWebUrl` | Source Upload URL | Text | No |  | Link back to retained workbook |
| `Checksum` | Checksum | Text | No |  | Duplicate/idempotency signal |
| `TemplateVersion` | Template Version | Text | No |  | Parsed template version |
| `ParserVersion` | Parser Version | Text | No |  | Parser build/version |
| `ScoringMode` | Scoring Mode | Choice | No | `template-compat-v1`, `normalized-vNext` | Current repo uses compat mode |
| `InspectionDate` | Inspection Date | DateTime | No |  | Inspection date |
| `InspectionNumber` | Inspection Number | Text | No |  | Workbook inspection number |
| `InspectorName` | Inspector | Text | No |  | Display name snapshot |
| `InspectorUpn` | Inspector UPN | Text | No |  | UPN snapshot |
| `ProjectNumber` | Project Number | Text | No |  | Project identifier |
| `ProjectNameSnapshot` | Project Name | Text | No |  | Project name snapshot |
| `InspectionScore` | Inspection Score | Number | No |  | Final inspection score |
| `TotalYes` | Total Yes | Number | No |  | Total yes count |
| `TotalNo` | Total No | Number | No |  | Total no count |
| `TotalNA` | Total N/A | Number | No |  | Total N/A count |
| `RawChecklistJson` | Raw Checklist JSON | Note / MultiLineText | No |  | Parsed workbook payload |
| `IngestionStatus` | Ingestion Status | Choice | No | `accepted`, `duplicate-suspected`, `superseded`, `review-required`, `rejected` | Status of inspection event |
| `DuplicateStatus` | Duplicate Status | Choice | No | `none`, `near-duplicate`, `high-confidence-duplicate` | Duplicate classification |
| `RequiresReview` | Requires Review | Boolean | No |  | Review queue signal |
| `SubmittedAt` | Submitted At | DateTime | No |  | Upload submission time |
| `CommittedAt` | Committed At | DateTime | No |  | Structured-record commit time |
| `SupersededByInspectionEventId` | Superseded By | Lookup | No | `Safety Inspection Events` | Self-lookup to replacement event |

### Valuable settings
- Strong candidates for indexing:
  - `ProjectWeekRecordId`
  - `ReportingPeriodId`
  - `ProjectNumber`
  - `InspectionDate`
  - `InspectionNumber`
  - `IngestionStatus`
  - `Checksum`
  - `RequiresReview`

---

## Safety Findings

**Type:** Custom list  
**Site:** `/sites/HBCentral`  
**Purpose:** Structured findings derived from inspection events  
**Operationally important columns:** `InspectionEventId`, `ProjectWeekRecordId`, `SectionNumber`, `ChecklistRowNumber`, `FindingType`, `Severity`

### Field schema

| Internal name | Display name | Type | Required | Choices / Lookup target | Notes |
|---|---|---:|:---:|---|---|
| `Title` | Title | Text | Yes |  | Standard title field |
| `InspectionEventId` | Inspection Event | Lookup | Yes | `Safety Inspection Events` | Parent inspection |
| `ProjectWeekRecordId` | Project-Week Record | Lookup | No | `Safety Project Week Records` | Parent weekly record |
| `SectionNumber` | Section Number | Number | No |  | Checklist section |
| `SectionName` | Section Name | Text | No |  | Section label |
| `ChecklistRowNumber` | Checklist Row | Number | No |  | Checklist row number |
| `ChecklistItemLabel` | Checklist Item | Note / MultiLineText | No |  | Checklist item text |
| `FindingType` | Finding Type | Choice | No | `no-response`, `incomplete`, `multi`, `note-only` | Finding classification |
| `Severity` | Severity | Choice | No | `info`, `medium`, `high` | Risk severity |
| `FindingSummary` | Finding Summary | Note / MultiLineText | No |  | Human-readable summary |
| `OriginalNoteText` | Original Note | Note / MultiLineText | No |  | Original note text |
| `RequiresCorrectiveAction` | Requires CA | Boolean | No |  | Corrective action flag |
| `IsOpen` | Is Open | Boolean | No |  | Open/closed state |

### Valuable settings
- Strong candidates for indexing:
  - `InspectionEventId`
  - `ProjectWeekRecordId`
  - `Severity`
  - `FindingType`
  - `IsOpen`
  - `ChecklistRowNumber`

---

## Safety Ingestion Runs

**Type:** Custom list  
**Site:** `/sites/HBCentral`  
**Purpose:** Audit trail for upload processing attempts  
**Operationally important columns:** `SourceUploadItemId`, `UploadFileName`, `TemplateVersionDetected`, `Checksum`, `ValidationStatus`, `TerminalStatus`, `CommittedEntityIdsJson`, `RunStartedAt`

### Field schema

| Internal name | Display name | Type | Required | Choices / Lookup target | Notes |
|---|---|---:|:---:|---|---|
| `Title` | Title | Text | Yes |  | Standard title field |
| `SourceUploadItemId` | Upload Item ID | Number | No |  | Upload-library item id |
| `UploadFileName` | Upload File Name | Text | No |  | Workbook file name |
| `TemplateVersionDetected` | Template Version | Text | No |  | Detected template version |
| `Checksum` | Checksum | Text | No |  | Duplicate/idempotency signal |
| `ValidationStatus` | Validation Status | Choice | No | `pending`, `passed`, `failed` | Validation phase status |
| `ParseStatus` | Parse Status | Choice | No | `pending`, `passed`, `failed`, `skipped` | Parse phase status |
| `ProjectResolutionStatus` | Project Resolution | Choice | No | `pending`, `resolved`, `unresolved`, `skipped` | Project resolution state |
| `TerminalStatus` | Terminal Status | Choice | No | `invalid-template`, `parse-error`, `reporting-period-mismatch`, `unresolved-project`, `review-required`, `committed`, `commit-failed` | Terminal pipeline outcome |
| `CommittedEntityIdsJson` | Committed IDs | Note / MultiLineText | No |  | JSON payload of committed ids |
| `ErrorClass` | Error Class | Text | No |  | Error classification |
| `ErrorSummary` | Error Summary | Note / MultiLineText | No |  | Human-readable error |
| `RunStartedAt` | Run Started | DateTime | No |  | Start time |
| `RunCompletedAt` | Run Completed | DateTime | No |  | End time |
| `AttemptNumber` | Attempt Number | Number | No |  | Replay / retry attempt number |
| `ReportingPeriodId` | Reporting Period | Lookup | No | `Safety Reporting Periods` | Parent reporting period |
| `AttemptedProjectSiteText` | Attempted Project/Site | Note / MultiLineText | No |  | Raw workbook project/site text |
| `ResolvedProjectNumber` | Resolved Project Number | Text | No |  | Resolution result |
| `ProjectSourceClassification` | Project Source | Choice | No | `project`, `legacy-only`, `project+legacy`, `unresolved` | Resolution source |
| `ReviewStatus` | Review Status | Choice | No | `none`, `pending-review`, `in-review`, `resolved`, `replayed-success`, `replayed-failed` | Review workflow state |
| `ParentRunId` | Parent Run | Lookup | No | `Safety Ingestion Runs` | Self-lookup for replay lineage |
| `ReviewedAt` | Reviewed At | DateTime | No |  | Reserved review metadata |
| `ReviewedBy` | Reviewed By | User | No |  | Reserved review metadata |
| `ResolutionNote` | Resolution Note | Note / MultiLineText | No |  | Reserved review metadata |

### Valuable settings
- Strong candidates for indexing:
  - `SourceUploadItemId`
  - `Checksum`
  - `TerminalStatus`
  - `ReviewStatus`
  - `RunStartedAt`
  - `ReportingPeriodId`
  - `ResolvedProjectNumber`
  - `ParentRunId`

## 5. Reference-list dependencies required for full functionality

These are **not safety-owned lists**, but they are required for full project resolution behavior.

### Projects (reference list on `/sites/HBCentral`)
**Critical fields required by the Safety app**
- `ProjectNumber`
- `ProjectName`
- `ProjectLocation`
- `ProjectStage`
- `projectExecutiveUpn`
- `projectManagerUpn`

### Legacy Project Fallback Registry (reference list on `/sites/HBCentral`)
**Critical fields required by the Safety app**
- `ProjectNumber`
- `ProjectNameRaw`
- `LegacyYear`
- `MatchStatus`
- `MatchedProjectListItemId`
- `IsActive`

## 5.1 Safety Graph query contract (bounded single-page lookups)

The Safety ingestion backend (`backend/functions/src/services/safety-ingestion-graph-repository.ts`) issues two compound-`$filter` Microsoft Graph list queries via the `listItemsBounded` variant. Bounded queries issue exactly one page and throw `GraphBoundedQueryTruncatedError` if the response contains `@odata.nextLink` — there is no silent paging and no in-memory narrowing fallback. Both queries depend on the listed columns being indexed at the tenant; if either index is missing, Graph's list-view-threshold behavior may reject the request or require the `Prefer` escape hatch (which is deliberately not used for these paths).

| Contract ID                       | List                          | `$top` | Required indexed columns                          | Failure semantics                                                                                                                                   |
| --------------------------------- | ----------------------------- | -----: | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `duplicate-detection-inspections` | Safety Inspection Events      | 500    | `ReportingPeriodIdLookupId`, `ProjectNumber`      | `GraphBoundedQueryTruncatedError` if `@odata.nextLink` is present — signals >500 inspections for one (period, project) or a weakened index contract. |
| `project-week-lookup`             | Safety Project Week Records   | 2      | `ReportingPeriodIdLookupId`, `ProjectNumber`      | `>1` match throws a natural-key violation; `@odata.nextLink` throws `GraphBoundedQueryTruncatedError`. `(period, project)` is the logical natural key. |

Index reconciliation: any change to the query strategy, the required indexed columns, or the top/paging posture on these contracts MUST be reflected in both the per-list authoritative documents under `docs/reference/sharepoint/list-schemas/hbcentral/lists/safety-inspection-events.md` and `safety-project-week-records.md`, and in this reference. Both doc surfaces move together.

## 6. Recommended verification checklist

Use this after comparing against the tenant-created lists:

- Verify all six safety containers exist in the correct sites.
- Verify lookup columns point to the exact targets listed above.
- Verify `Safety Checklist Uploads` includes `InspectionNumber`, `InspectionDate`, and `ProjectNumber` metadata columns.
- Verify no internal names were changed after creation.
- Verify choice fields contain the exact string values listed above.
- Verify self-lookups exist for:
  - `Safety Inspection Events`.`SupersededByInspectionEventId`
  - `Safety Ingestion Runs`.`ParentRunId`
- Verify the reference lists `Projects` and `Legacy Project Fallback Registry` exist and contain the minimum critical fields listed above.
- Review indexing on operationally important columns, especially if the tenant dataset is expected to grow materially.