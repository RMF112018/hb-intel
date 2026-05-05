# PCC Admin Verification Items

## 1. Objective
- Planned PCC schema/reference file for `PCC Admin Verification Items`.
- Category: `Site Health / Repair / Admin Verification`.
- Storage posture: `Project site`.
- Classification posture: `model-derived-required`.

## 2. List-Level Metadata
- List ID: ``
- Entity Type Name: ``
- URL: ``
- Default View URL: ``
- Root Folder URL: ``
- Base Template / Base Type: `100` / `0`
- Classification: `model-derived-required`
- Description: `Site Health / Repair / Admin Verification / Project site`
- Hidden: `false`
- Item Count: ``
- Content Types Enabled: ``
- Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
- Moderation: `EnableModeration=false`
- Attachments Enabled: `false`

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| Title | Title | Text | Yes | No | No | No | MaxLength=255 |
| Admin Verification Item ID | AdminVerificationItemId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Source Module | SourceModule | Text | Yes | No | No | No | MaxLength=255 |
| Source Item ID | SourceItemId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Verification Kind | VerificationKind | Choice | Yes | No | No | No |  |
| Verification State | VerificationState | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Assigned Role | AssignedRole | Text | Yes | No | No | No | MaxLength=255 |
| Assigned UPN | AssignedUpn | Text | Yes | No | No | No | MaxLength=255 |
| Due At UTC | DueAtUtc | DateTime | Yes | No | No | Yes | Indexed for query/view performance |
| Completed At UTC | CompletedAtUtc | DateTime | No | No | No | No |  |
| Result Summary | ResultSummary | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Related Approval Request ID | RelatedApprovalRequestId | Text | Yes | No | No | Yes | Indexed for query/view performance |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `Site Health / Repair / Admin Verification operational record`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Approval-related records join to PCC Approval Requests through `ApprovalRequestId`.
- Source lineage fields preserve external/source-system traceability without making PCC the external system of record.
- Person/user references are stored as stable text keys for cross-site portability; SharePoint User fields may be added later for UX only.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `13`
- Hidden fields: `0`
- Non-hidden lookup fields: `0`
- Unique-enforced fields: ``
- Indexed non-hidden fields: `6`
- System/OOB fields are not included in this planned schema file; live tenant extraction should append OOB fields only where integration-relevant.
- Attachments should remain disabled unless a later approved exception is recorded; evidence should be handled by Document Control references.
- Default operational views should filter first on indexed fields such as `ProjectId`, active/status/state fields, module/system keys, or due-date fields.

## 7. Open Questions / Follow-Up Checks
- Confirm final list URL, list GUID, entity type name, and form URLs after provisioning.
- Confirm whether this list should use a shared PCC content type or a list-local item content type.
- Confirm field IDs and site-column reuse before generating Graph/PnP provisioning assets.
- Confirm production index strategy against actual query patterns and expected item volume.
- Confirm whether any tenant-specific retention, sensitivity, or compliance labels apply.
