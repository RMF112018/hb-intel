# Safety Inspection Events

## 1. Objective

- Schema-authority-backed reference for `Safety Inspection Events` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Authoritative per-inspection record preserving parsed payload, scoring, duplicate status, and ingestion lifecycle.

## 2. List-Level Metadata

- Source Authority: `packages/features/safety/src/lists/fieldSchema.ts`, `packages/features/safety/src/lists/descriptors.ts`
- List ID: `dca4537f-7f3a-4159-b48f-f06f2944dc59`
- ID Provenance: captured from `/tmp/hb-lists.json` and `/tmp/hbsp-Safety_Inspection_Events.json` on `2026-04-22` for `/sites/HBCentral`.
- Display Name: `Safety Inspection Events`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Safety%20Inspection%20Events`
- Root Folder URL: `/sites/HBCentral/Lists/Safety Inspection Events`
- Template: `genericList (expected)`
- Classification: `business/custom`
- Description: `Authoritative per-inspection record; preserves raw parsed evidence.`
- Hidden: `false (expected)`
- Content Types Enabled: `false (expected)`

## 3. Field Schema

| Display Name          | Internal Name                 | Type     | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                                                      |
| --------------------- | ----------------------------- | -------- | -------- | ------ | --------- | ------- | --------------------------------------------------------------------------------------- |
| Title                 | Title                         | Text     | Yes      | No     | No        | Unknown | MaxLength=255                                                                           |
| Project-Week Record   | ProjectWeekRecordId           | Lookup   | Yes      | No     | No        | Unknown | Lookup -> `Safety Project Week Records`                                                 |
| Reporting Period      | ReportingPeriodId             | Lookup   | Yes      | No     | No        | Unknown | Lookup -> `Safety Reporting Periods`                                                    |
| Source Upload Item ID | SourceUploadItemId            | Number   | Yes      | No     | No        | Unknown | Upload-library item identity                                                            |
| Source Upload URL     | SourceUploadWebUrl            | Text     | No       | No     | No        | Unknown | Upload trace-back URL                                                                   |
| Checksum              | Checksum                      | Text     | No       | No     | No        | Unknown | Deduplication signal                                                                    |
| Template Version      | TemplateVersion               | Text     | No       | No     | No        | Unknown | Parsed template version                                                                 |
| Parser Version        | ParserVersion                 | Text     | No       | No     | No        | Unknown | Parser build/version                                                                    |
| Scoring Mode          | ScoringMode                   | Choice   | No       | No     | No        | Unknown | Choices: `template-compat-v1`, `normalized-vNext`                                       |
| Inspection Date       | InspectionDate                | DateTime | No       | No     | No        | Unknown | Inspection timestamp                                                                    |
| Inspection Number     | InspectionNumber              | Text     | No       | No     | No        | Unknown | Workbook inspection number                                                              |
| Inspector             | InspectorName                 | Text     | No       | No     | No        | Unknown | Inspector display name                                                                  |
| Inspector UPN         | InspectorUpn                  | Text     | No       | No     | No        | Unknown | Inspector UPN                                                                           |
| Project Number        | ProjectNumber                 | Text     | No       | No     | No        | Unknown | Project identity snapshot                                                               |
| Project Name          | ProjectNameSnapshot           | Text     | No       | No     | No        | Unknown | Project name snapshot                                                                   |
| Inspection Score      | InspectionScore               | Number   | No       | No     | No        | Unknown | Score metric                                                                            |
| Total Yes             | TotalYes                      | Number   | No       | No     | No        | Unknown | Checklist metric                                                                        |
| Total No              | TotalNo                       | Number   | No       | No     | No        | Unknown | Checklist metric                                                                        |
| Total N/A             | TotalNA                       | Number   | No       | No     | No        | Unknown | Checklist metric                                                                        |
| Raw Checklist JSON    | RawChecklistJson              | Note     | No       | No     | No        | Unknown | Raw parsed payload                                                                      |
| Ingestion Status      | IngestionStatus               | Choice   | No       | No     | No        | Unknown | Choices: `accepted`, `duplicate-suspected`, `superseded`, `review-required`, `rejected` |
| Duplicate Status      | DuplicateStatus               | Choice   | No       | No     | No        | Unknown | Choices: `none`, `near-duplicate`, `high-confidence-duplicate`                          |
| Requires Review       | RequiresReview                | Boolean  | No       | No     | No        | Unknown | Review queue flag                                                                       |
| Submitted At          | SubmittedAt                   | DateTime | No       | No     | No        | Unknown | Submission timestamp                                                                    |
| Committed At          | CommittedAt                   | DateTime | No       | No     | No        | Unknown | Commit timestamp                                                                        |
| Superseded By         | SupersededByInspectionEventId | Lookup   | No       | No     | No        | Unknown | Lookup -> `Safety Inspection Events`                                                    |

## 4. Content Types / Forms / Behavioral Context

- Associated Content Types: `Item` (expected)
- Default List Forms: `/sites/HBCentral/Lists/Safety Inspection Events/AllItems.aspx` (expected)
- Observed Role Hint: canonical per-inspection ledger and deduplication/review source of truth.

## 5. Relationship Observations

- Outbound lookup references:
  - `ProjectWeekRecordId` -> `Safety Project Week Records`
  - `ReportingPeriodId` -> `Safety Reporting Periods`
  - `SupersededByInspectionEventId` -> `Safety Inspection Events` (self)
- Inbound reference: `Safety Findings.InspectionEventId`.
- Logical (non-enforced) join: `SourceUploadItemId` maps to `/sites/Safety` upload-library item id.

## 6. Implementation-Relevant Findings

- Critical fields from descriptor contract: `ProjectWeekRecordId`, `SourceUploadItemId`, `TemplateVersion`, `InspectionDate`, `InspectionNumber`, `InspectionScore`, `RawChecklistJson`, `ParserVersion`, `IngestionStatus`, `Checksum`.
- Candidate index fields: `ProjectWeekRecordId`, `ReportingPeriodId`, `ProjectNumber`, `InspectionDate`, `InspectionNumber`, `Checksum`, `IngestionStatus`, `RequiresReview`.
- `ScoringMode` and `IngestionStatus` choice vocabularies are strict integration contracts and should not drift silently.

## 6.1 Required Indexed Columns (Safety Graph queries)

The Safety ingestion Graph repository issues a bounded single-page compound `$filter` against this list for duplicate detection during preview. For the query to remain O(filtered rows) instead of O(period rows), BOTH of the following columns MUST be indexed at the tenant. See `SAFETY_GRAPH_QUERY_CONTRACTS['duplicate-detection-inspections']` in `backend/functions/src/services/safety-ingestion-graph-repository.ts`.

| Column                      | Why indexed is required                                                    |
| --------------------------- | -------------------------------------------------------------------------- |
| `ReportingPeriodIdLookupId` | Primary filter clause; unindexed access risks list-view threshold blocks.  |
| `ProjectNumber`             | Secondary filter clause; compound `$filter` depends on server-side narrow. |

The query is issued through `listItemsBounded` (see `backend/functions/src/services/safety-ingestion-graph-data-plane.ts`): it emits exactly one page with `$top=500` and throws `GraphBoundedQueryTruncatedError` if the response contains `@odata.nextLink`. The repository never silently paginates. Symptoms:

- If either index is missing, the bounded request fails loudly (HTTP 4xx from Graph) rather than degrading into a tenant-wide scan.
- If the filtered result set exceeds 500 rows for a single `(reportingPeriod, projectNumber)` tuple, the bounded query throws — investigate data shape before relaxing the cap.

Any change to the required indexed columns, the `$top` cap, or the bounded-query semantics for this contract MUST be reflected in `docs/architecture/plans/MASTER/spfx/safety-records/Safety_Record_Keeping_SharePoint_Schema_Reference.md §5.1` in the same change set.

## 7. Open Questions / Follow-Up Checks

- Confirm tenant GUID and item count during next extraction refresh.
- Confirm indexed-column posture for `Checksum` and `InspectionNumber` under duplicate-check workload.
- Re-extract after provisioning to replace `Unknown` index flags with tenant-truth values.
