# PCC Team Members

## 1. Objective
- Planned PCC schema/reference file for `PCC Team Members`.
- Category: `Team and Access`.
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
- Description: `Team and Access / Project site`
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
| Member ID | MemberId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Display Label | DisplayLabel | Text | Yes | No | No | No | MaxLength=255 |
| Member Kind | MemberKind | Choice | Yes | No | No | No |  |
| Company Label | CompanyLabel | Text | Yes | No | No | No | MaxLength=255 |
| Project Role Label | ProjectRoleLabel | Text | Yes | No | No | No | MaxLength=255 |
| Persona | Persona | Text | Yes | No | No | No | MaxLength=255 |
| Permission Template Label | PermissionTemplateLabel | Text | Yes | No | No | No | MaxLength=255 |
| Assignment Status Label | AssignmentStatusLabel | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Org Chart Parent Member ID | OrgChartParentMemberId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Has Project Site Access | HasProjectSiteAccess | Boolean | Yes | No | No | No |  |
| User Principal Name | UserPrincipalName | Text | Yes | No | No | No | MaxLength=255 |
| Person Lookup ID | PersonLookupId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Is Active | IsActive | Boolean | Yes | No | No | Yes | Indexed for query/view performance |
| Start Date UTC | StartDateUtc | DateTime | Yes | No | No | No |  |
| End Date UTC | EndDateUtc | DateTime | No | No | No | No |  |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `team and access control record`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Person/user references are stored as stable text keys for cross-site portability; SharePoint User fields may be added later for UX only.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `17`
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
