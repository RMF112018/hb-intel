# Safety Ingestion Runs

## 1. Objective

- Schema-authority-backed reference for `Safety Ingestion Runs` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Operational audit list for each upload-processing attempt, including terminal outcomes and replay lineage.

## 2. List-Level Metadata

- Source Authority: `packages/features/safety/src/lists/fieldSchema.ts`, `packages/features/safety/src/lists/descriptors.ts`
- List ID: `965d5b6a-6bec-425a-b19c-6fb56c717c30`
- ID Provenance: captured from `/tmp/hb-lists.json` and `/tmp/hbsp-Safety_Ingestion_Runs.json` on `2026-04-22` for `/sites/HBCentral`.
- Display Name: `Safety Ingestion Runs`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Safety%20Ingestion%20Runs`
- Root Folder URL: `/sites/HBCentral/Lists/Safety Ingestion Runs`
- Template: `genericList (expected)`
- Classification: `business/custom`
- Description: `Audit trail for upload processing attempts.`
- Hidden: `false (expected)`
- Content Types Enabled: `false (expected)`

## 3. Field Schema

| Display Name            | Internal Name               | Type     | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                                                                                                             |
| ----------------------- | --------------------------- | -------- | -------- | ------ | --------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Title                   | Title                       | Text     | Yes      | No     | No        | Unknown | MaxLength=255                                                                                                                                  |
| Upload Item ID          | SourceUploadItemId          | Number   | No       | No     | No        | Unknown | Upload-library item identity                                                                                                                   |
| Upload File Name        | UploadFileName              | Text     | No       | No     | No        | Unknown | Source workbook filename                                                                                                                       |
| Template Version        | TemplateVersionDetected     | Text     | No       | No     | No        | Unknown | Detected template version                                                                                                                      |
| Checksum                | Checksum                    | Text     | No       | No     | No        | Unknown | Deduplication signal                                                                                                                           |
| Validation Status       | ValidationStatus            | Choice   | No       | No     | No        | Unknown | Choices: `pending`, `passed`, `failed`                                                                                                         |
| Parse Status            | ParseStatus                 | Choice   | No       | No     | No        | Unknown | Choices: `pending`, `passed`, `failed`, `skipped`                                                                                              |
| Project Resolution      | ProjectResolutionStatus     | Choice   | No       | No     | No        | Unknown | Choices: `pending`, `resolved`, `unresolved`, `skipped`                                                                                        |
| Terminal Status         | TerminalStatus              | Choice   | No       | No     | No        | Unknown | Choices: `invalid-template`, `parse-error`, `reporting-period-mismatch`, `unresolved-project`, `review-required`, `committed`, `commit-failed` |
| Committed IDs           | CommittedEntityIdsJson      | Note     | No       | No     | No        | Unknown | JSON payload of committed ids                                                                                                                  |
| Error Class             | ErrorClass                  | Text     | No       | No     | No        | Unknown | Error bucket                                                                                                                                   |
| Error Summary           | ErrorSummary                | Note     | No       | No     | No        | Unknown | Human-readable error summary                                                                                                                   |
| Run Started             | RunStartedAt                | DateTime | No       | No     | No        | Unknown | Start timestamp                                                                                                                                |
| Run Completed           | RunCompletedAt              | DateTime | No       | No     | No        | Unknown | Completion timestamp                                                                                                                           |
| Attempt Number          | AttemptNumber               | Number   | No       | No     | No        | Unknown | Replay attempt counter                                                                                                                         |
| Reporting Period        | ReportingPeriodId           | Lookup   | No       | No     | No        | Unknown | Lookup -> `Safety Reporting Periods`                                                                                                           |
| Attempted Project/Site  | AttemptedProjectSiteText    | Note     | No       | No     | No        | Unknown | Raw extracted project/site text                                                                                                                |
| Resolved Project Number | ResolvedProjectNumber       | Text     | No       | No     | No        | Unknown | Resolution output                                                                                                                              |
| Project Source          | ProjectSourceClassification | Choice   | No       | No     | No        | Unknown | Choices: `project`, `legacy-only`, `project+legacy`, `unresolved`                                                                              |
| Review Status           | ReviewStatus                | Choice   | No       | No     | No        | Unknown | Choices: `none`, `pending-review`, `in-review`, `resolved`, `replayed-success`, `replayed-failed`                                              |
| Parent Run              | ParentRunId                 | Lookup   | No       | No     | No        | Unknown | Lookup -> `Safety Ingestion Runs`                                                                                                              |
| Reviewed At             | ReviewedAt                  | DateTime | No       | No     | No        | Unknown | Review timestamp                                                                                                                               |
| Reviewed By             | ReviewedBy                  | User     | No       | No     | No        | Unknown | Reviewer identity                                                                                                                              |
| Resolution Note         | ResolutionNote              | Note     | No       | No     | No        | Unknown | Review/closure notes                                                                                                                           |

## 4. Content Types / Forms / Behavioral Context

- Associated Content Types: `Item` (expected)
- Default List Forms: `/sites/HBCentral/Lists/Safety Ingestion Runs/AllItems.aspx` (expected)
- Observed Role Hint: ingestion telemetry, failure triage, and replay lineage audit list.

## 5. Relationship Observations

- Outbound lookup references:
  - `ReportingPeriodId` -> `Safety Reporting Periods`
  - `ParentRunId` -> `Safety Ingestion Runs` (self)
- Logical (non-enforced) join: `SourceUploadItemId` aligns to upload-library item id on `/sites/Safety`.

## 6. Implementation-Relevant Findings

- Critical fields from descriptor contract: `SourceUploadItemId`, `UploadFileName`, `TemplateVersionDetected`, `Checksum`, `ValidationStatus`, `TerminalStatus`, `CommittedEntityIdsJson`, `RunStartedAt`.
- Candidate index fields: `SourceUploadItemId`, `TerminalStatus`, `RunStartedAt`, `ReportingPeriodId`, `ProjectSourceClassification`.
- Choice vocabularies for `ValidationStatus`, `ParseStatus`, `ProjectResolutionStatus`, `TerminalStatus`, and `ReviewStatus` are strict contract values.

## 7. Open Questions / Follow-Up Checks

- Confirm tenant GUID and item count during next extraction refresh.
- Confirm indexed-column posture for `TerminalStatus` and `RunStartedAt` under operational-reporting workloads.
- Re-extract after provisioning to replace `Unknown` index flags with tenant-truth values.
