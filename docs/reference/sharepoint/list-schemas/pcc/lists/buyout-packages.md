# PCC Buyout Packages

## 1. Objective
- Planned PCC schema/reference file for `PCC Buyout Packages`.
- Category: `Buyout / Procurement`.
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
- Description: `Buyout / Procurement / Project site`
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
| Buyout Package ID | BuyoutPackageId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Package Code | PackageCode | Text | Yes | No | No | No | MaxLength=255 |
| Package Title | PackageTitle | Text | Yes | No | No | No | MaxLength=255 |
| Scope Description | ScopeDescription | Note | No | No | No | No | RichText=false; Lines=6 |
| Csi Division | CsiDivision | Text | Yes | No | No | No | MaxLength=255 |
| Cost Code | CostCode | Text | Yes | No | No | No | MaxLength=255 |
| Status | Status | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Ball In Court Person Or Role Ref | BallInCourtPersonOrRoleRef | Text | Yes | No | No | No | MaxLength=255 |
| Ball In Court Assigned At UTC | BallInCourtAssignedAtUtc | DateTime | Yes | No | No | No |  |
| Selected Vendor Name | SelectedVendorName | Text | Yes | No | No | No | MaxLength=255 |
| Procore Company ID | ProcoreCompanyId | Text | No | No | No | Yes | Indexed for query/view performance |
| Sage Vendor ID | SageVendorId | Text | No | No | No | Yes | Indexed for query/view performance |
| Pcc Award Amount | PccAwardAmount | Number | Yes | No | No | No |  |
| Original Budget Amount | OriginalBudgetAmount | Number | Yes | No | No | No |  |
| Original Budget Source | OriginalBudgetSource | Text | Yes | No | No | No | MaxLength=255 |
| Current Budget Amount | CurrentBudgetAmount | Number | Yes | No | No | No |  |
| Current Budget Source | CurrentBudgetSource | Text | Yes | No | No | No | MaxLength=255 |
| Procore Current Commitment Amount | ProcoreCurrentCommitmentAmount | Number | No | No | No | No |  |
| Sage Committed Cost Amount | SageCommittedCostAmount | Number | No | No | No | No |  |
| Loi Send Target Date | LoiSendTargetDate | DateTime | Yes | No | No | No |  |
| Loi Executed Date | LoiExecutedDate | DateTime | Yes | No | No | No |  |
| Lead Time Days | LeadTimeDays | Number | Yes | No | No | No |  |
| Lead Time Notes | LeadTimeNotes | Note | No | No | No | No | RichText=false; Lines=6 |
| Sdi Enrollment Status | SdiEnrollmentStatus | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Bond Requirement Status | BondRequirementStatus | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Comments | Comments | Note | No | No | No | No | RichText=false; Lines=6 |
| Deferred Until UTC | DeferredUntilUtc | DateTime | Yes | No | No | No |  |
| Block Reason | BlockReason | Note | No | No | No | No | RichText=false; Lines=6 |
| Created At UTC | CreatedAtUtc | DateTime | Yes | No | No | No |  |
| Updated At UTC | UpdatedAtUtc | DateTime | Yes | No | No | No |  |
| Source Lineage JSON | SourceLineageJson | Note | Yes | No | No | No | RichText=false; Lines=6 |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `buyout/procurement control record`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Source lineage fields preserve external/source-system traceability without making PCC the external system of record.
- Procore references are read-only/mapping references; PCC does not write back into Procore in the MVP posture.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `33`
- Hidden fields: `0`
- Non-hidden lookup fields: `0`
- Unique-enforced fields: ``
- Indexed non-hidden fields: `7`
- System/OOB fields are not included in this planned schema file; live tenant extraction should append OOB fields only where integration-relevant.
- Attachments should remain disabled unless a later approved exception is recorded; evidence should be handled by Document Control references.
- Default operational views should filter first on indexed fields such as `ProjectId`, active/status/state fields, module/system keys, or due-date fields.

## 7. Open Questions / Follow-Up Checks
- Confirm final list URL, list GUID, entity type name, and form URLs after provisioning.
- Confirm whether this list should use a shared PCC content type or a list-local item content type.
- Confirm field IDs and site-column reuse before generating Graph/PnP provisioning assets.
- Confirm production index strategy against actual query patterns and expected item volume.
- Confirm whether any tenant-specific retention, sensitivity, or compliance labels apply.
