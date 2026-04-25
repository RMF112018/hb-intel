# Safety Field Excellence Weekly Highlights

## 1. Objective

- Schema-authority-backed reference for `Safety Field Excellence Weekly Highlights` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Approved/published weekly homepage artifact selected from `Safety Field Excellence Candidate Scores`. One record per reporting period.

## 2. List-Level Metadata

- Source Authority: `packages/features/safety/src/lists/fieldSchema.ts` (`SAFETY_FIELD_EXCELLENCE_WEEKLY_HIGHLIGHTS_FIELDS`), `packages/features/safety/src/lists/descriptors.ts` (`SafetyFieldExcellenceWeeklyHighlightsList`)
- List ID: `pending-tenant-extraction (zero-GUID fail-closed)`
- ID Provenance: provisioned by `SafetyProvisioningService` from `SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS`; live tenant GUID to be captured after first provisioning run.
- Display Name: `Safety Field Excellence Weekly Highlights`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Safety%20Field%20Excellence%20Weekly%20Highlights`
- Root Folder URL: `/sites/HBCentral/Lists/Safety Field Excellence Weekly Highlights`
- Template: `genericList (expected)`
- Classification: `business/custom`
- Description: `Approved/published weekly safety field excellence homepage artifact.`
- Hidden: `false (expected)`
- Content Types Enabled: `false (expected)`

## 3. Field Schema

| Display Name                   | Internal Name                | Type     | Required | Indexed | Lookup / Choices / Notes                                                                |
| ------------------------------ | ---------------------------- | -------- | -------- | ------- | --------------------------------------------------------------------------------------- |
| Title                          | Title                        | Text     | Yes      | No      | MaxLength=255                                                                           |
| Reporting Period               | ReportingPeriodId            | Lookup   | Yes      | Yes     | Lookup → `Safety Reporting Periods`                                                     |
| Week Start Date                | WeekStartDate                | DateTime | Yes      | Yes     | Period boundary start                                                                   |
| Week End Date                  | WeekEndDate                  | DateTime | Yes      | Yes     | Period boundary end                                                                     |
| Period Label                   | PeriodLabel                  | Text     | No       | No      | Human-readable label                                                                    |
| Publish Status                 | PublishStatus                | Choice   | Yes      | Yes     | `draft`, `pending-review`, `approved`, `published`, `archived`, `suppressed`            |
| Primary Candidate              | PrimaryCandidateId           | Lookup   | No       | No      | Lookup → `Safety Field Excellence Candidate Scores`                                     |
| Secondary Candidate IDs (JSON) | SecondaryCandidateIdsJson    | Note     | No       | No      | JSON array of candidate item IDs                                                        |
| Homepage Payload (JSON)        | HomepagePayloadJson          | Note     | No       | No      | Frozen homepage-safe payload (set on publish)                                           |
| Source Candidate IDs (JSON)    | SourceCandidateIdsJson       | Note     | No       | No      | JSON array — full candidate cohort considered for selection                             |
| Selection Method Version       | SelectionMethodVersion       | Text     | No       | No      | E.g. `selector-v1`                                                                      |
| Data Confidence                | DataConfidence               | Choice   | No       | No      | `high`, `medium`, `low`                                                                 |
| Data Quality Notes             | DataQualityNotes             | Note     | No       | No      | Multiline                                                                               |
| Editorial Override Applied     | EditorialOverrideApplied     | Boolean  | No       | No      | True when leadership overrode the recommended primary                                   |
| Override Reason                | OverrideReason               | Note     | No       | No      | Required when override applied                                                          |
| Approved By                    | ApprovedBy                   | User     | No       | No      | Person/group reference                                                                  |
| Approved At                    | ApprovedAt                   | DateTime | No       | No      | Approval timestamp                                                                      |
| Published At                   | PublishedAt                  | DateTime | No       | No      | Publication timestamp                                                                   |
| Fresh Until                    | FreshUntil                   | DateTime | No       | Yes     | Cache-freshness ceiling for homepage current-published read endpoint                    |
| Rollback From Item ID          | RollbackFromItemId           | Number   | No       | No      | Prior Weekly Highlight SharePoint item ID (not a lookup; same-list back-pointer)        |

## 4. Content Types / Forms / Behavioral Context

- Associated Content Types: `Item` (expected)
- Default List Forms: `/sites/HBCentral/Lists/Safety Field Excellence Weekly Highlights/AllItems.aspx` (expected)
- Observed Role Hint: governed publication state; the only artifact the homepage reads via the published endpoint.

## 5. Relationship Observations

- Outbound lookup references:
  - `ReportingPeriodId` → `Safety Reporting Periods`
  - `PrimaryCandidateId` → `Safety Field Excellence Candidate Scores`
- Same-list back-pointer:
  - `RollbackFromItemId` (Number) — prior Weekly Highlight SharePoint item ID; intentionally a number, not a self-lookup, to keep rollback semantics simple and audit-only.
- Logical (non-enforced) JSON references:
  - `SecondaryCandidateIdsJson`, `SourceCandidateIdsJson` → candidate IDs from `Safety Field Excellence Candidate Scores`.

## 6. Implementation-Relevant Findings

- Critical fields from descriptor contract: `ReportingPeriodId`, `WeekStartDate`, `WeekEndDate`, `PublishStatus`, `PrimaryCandidateId`, `PublishedAt`, `FreshUntil`.
- Locked choice vocabularies (do not drift in later prompts):
  - `PublishStatus`: `draft`, `pending-review`, `approved`, `published`, `archived`, `suppressed` — single canonical state machine vocabulary.
  - `DataConfidence`: `high`, `medium`, `low`.
- `HomepagePayloadJson` is the only field the homepage current-published endpoint serializes. It must be frozen on publish; later edits go to a new revision.
- `EditorialOverrideApplied = true` requires non-empty `OverrideReason`. Enforced by writers in Wave 04; not a SharePoint constraint.

## 6.1 Required Indexed Columns

Indexed via `SpFieldDefinition.indexed: true`, applied through `SafetyProvisioningService.provisionSafetyContainer()` and `SharePointProvisioningService.addListField()`:

| Column                | Why indexed is required                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `ReportingPeriodId`   | Primary filter for current-period highlight retrieval.                                                   |
| `WeekStartDate`       | Period-bounded queries and recency ordering.                                                             |
| `WeekEndDate`         | Period-bounded queries and recency ordering.                                                             |
| `PublishStatus`       | Filter for the homepage current-published endpoint (`PublishStatus eq 'published'`).                    |
| `FreshUntil`          | Cache-freshness narrowing for the homepage current-published endpoint.                                   |

Provisioning honors `indexed: true` at field create time and detects/repairs index drift on existing fields. In dry-run, drift detection on **existing** fields produces `outcome: 'updatedOrRepaired'` with the message `Dry-run: Indexed would be set to true.`. Missing fields are reported as `would be created`; index is applied at real-run create time.

## 7. Open Questions / Follow-Up Checks

- Confirm tenant GUID and item count after first provisioning run; replace `pending-tenant-extraction` with the real list ID.
- Confirm indexed-column posture under production query load.
- Re-extract after provisioning to replace the pending GUID with tenant-truth values.
