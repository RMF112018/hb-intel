# PCC Project Profile

## 1. Objective
- Planned PCC schema/reference file for `PCC Project Profile`.
- Category: `Project Identity / Site Profile`.
- Storage posture: `Project site`.
- Classification posture: `contract-derived-required`.

## 2. List-Level Metadata
- List ID: ``
- Entity Type Name: ``
- URL: ``
- Default View URL: ``
- Root Folder URL: ``
- Base Template / Base Type: `100` / `0`
- Classification: `contract-derived-required`
- Description: `Project Identity / Site Profile / Project site`
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
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Project Number | ProjectNumber | Number | Yes | No | No | Yes | Indexed for query/view performance |
| Project Name | ProjectName | Text | Yes | No | No | No | MaxLength=255 |
| Project Type | ProjectType | Choice | Yes | No | No | No |  |
| Project Stage | ProjectStage | Choice | Yes | No | No | No |  |
| Project Status | ProjectStatus | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Client Name | ClientName | Text | Yes | No | No | No | MaxLength=255 |
| Project Location | ProjectLocation | Text | Yes | No | No | No | MaxLength=255 |
| Start Date | StartDate | DateTime | Yes | No | No | No |  |
| Scheduled Completion Date | ScheduledCompletionDate | DateTime | No | No | No | No |  |
| Estimated Value | EstimatedValue | Number | No | No | No | No |  |
| Project Site Url | ProjectSiteUrl | URL | No | No | No | No | Launch/reference value; no secrets or bearer tokens |
| Procore Project ID | ProcoreProjectId | Text | No | No | No | Yes | Indexed for query/view performance |
| Sage Intacct Project ID | SageIntacctProjectId | Text | No | No | No | Yes | Indexed for query/view performance |
| Template Version | TemplateVersion | Text | Yes | No | No | No | MaxLength=255 |
| Provisioning Run ID | ProvisioningRunId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Provisioned Date UTC | ProvisionedDateUtc | DateTime | Yes | No | No | No |  |
| Provisioned By UPN | ProvisionedByUpn | Text | Yes | No | No | No | MaxLength=255 |
| Source New Project Request ID | SourceNewProjectRequestId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Accounting Finalization ID | AccountingFinalizationId | Number | Yes | No | No | Yes | Indexed for query/view performance |
| Project Executive UPN | ProjectExecutiveUpn | Text | Yes | No | No | No | MaxLength=255 |
| Project Manager UPN | ProjectManagerUpn | Text | Yes | No | No | No | MaxLength=255 |
| Estimating Coordinator UPN | EstimatingCoordinatorUpn | Text | Yes | No | No | No | MaxLength=255 |
| Lead Estimator UPN | LeadEstimatorUpn | Text | Yes | No | No | No | MaxLength=255 |
| Project Accountant UPN | ProjectAccountantUpn | Number | Yes | No | No | No |  |
| Office Division | OfficeDivision | Text | Yes | No | No | No | MaxLength=255 |
| Region | Region | Text | Yes | No | No | No | MaxLength=255 |
| Market Sector | MarketSector | Text | Yes | No | No | No | MaxLength=255 |
| Delivery Method | DeliveryMethod | Text | Yes | No | No | No | MaxLength=255 |
| Contract Type | ContractType | Choice | Yes | No | No | No |  |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `project profile / project master registry`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Person/user references are stored as stable text keys for cross-site portability; SharePoint User fields may be added later for UX only.
- Procore references are read-only/mapping references; PCC does not write back into Procore in the MVP posture.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `31`
- Hidden fields: `0`
- Non-hidden lookup fields: `0`
- Unique-enforced fields: ``
- Indexed non-hidden fields: `8`
- System/OOB fields are not included in this planned schema file; live tenant extraction should append OOB fields only where integration-relevant.
- Attachments should remain disabled unless a later approved exception is recorded; evidence should be handled by Document Control references.
- Default operational views should filter first on indexed fields such as `ProjectId`, active/status/state fields, module/system keys, or due-date fields.

## 7. Open Questions / Follow-Up Checks
- Confirm final list URL, list GUID, entity type name, and form URLs after provisioning.
- Confirm whether this list should use a shared PCC content type or a list-local item content type.
- Confirm field IDs and site-column reuse before generating Graph/PnP provisioning assets.
- Confirm production index strategy against actual query patterns and expected item volume.
- Confirm whether any tenant-specific retention, sensitivity, or compliance labels apply.
