# PCC Procore Project Mappings

## 1. Objective
- Planned PCC schema/reference file for `PCC Procore Project Mappings`.
- Category: `Procore Data Layer`.
- Storage posture: `Project site or HBCentral registry`.
- Classification posture: `model-derived-required`.

## 2. List-Level Metadata
- List ID: ``
- Entity Type Name: ``
- URL: ``
- Default View URL: ``
- Root Folder URL: ``
- Base Template / Base Type: `100` / `0`
- Classification: `model-derived-required`
- Description: `Procore Data Layer / Project site or HBCentral registry`
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
| Procore Project Mapping ID | ProcoreProjectMappingId | Text | No | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Hb Central List Item ID | HbCentralListItemId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Registry Context Snapshot JSON | RegistryContextSnapshotJson | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Legacy Procore Hint | LegacyProcoreHint | Text | No | No | No | No | MaxLength=255 |
| Mapping State | MappingState | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Proposed Procore Company ID | ProposedProcoreCompanyId | Text | No | No | No | Yes | Indexed for query/view performance |
| Proposed Procore Project ID | ProposedProcoreProjectId | Text | No | No | No | Yes | Indexed for query/view performance |
| Proposed At UTC | ProposedAtUtc | DateTime | Yes | No | No | No |  |
| Proposed By Owner Role | ProposedByOwnerRole | Text | Yes | No | No | No | MaxLength=255 |
| Proposed By Owner UPN | ProposedByOwnerUpn | Text | Yes | No | No | No | MaxLength=255 |
| Procore Company ID | ProcoreCompanyId | Text | No | No | No | Yes | Indexed for query/view performance |
| Procore Project ID | ProcoreProjectId | Text | No | No | No | Yes | Indexed for query/view performance |
| Confirmed At UTC | ConfirmedAtUtc | DateTime | Yes | No | No | No |  |
| Confirmed By Owner Role | ConfirmedByOwnerRole | Text | Yes | No | No | No | MaxLength=255 |
| Confirmed By Owner UPN | ConfirmedByOwnerUpn | Text | Yes | No | No | No | MaxLength=255 |
| Last Confirmed At UTC | LastConfirmedAtUtc | DateTime | Yes | No | No | No |  |
| Freshness Band | FreshnessBand | Choice | Yes | No | No | No |  |
| Stale Reason | StaleReason | Note | No | No | No | No | RichText=false; Lines=6 |
| Conflict Reason | ConflictReason | Note | No | No | No | No | RichText=false; Lines=6 |
| Conflict Detected At UTC | ConflictDetectedAtUtc | DateTime | Yes | No | No | No |  |
| Remediation Hint | RemediationHint | Text | Yes | No | No | No | MaxLength=255 |
| Archived At UTC | ArchivedAtUtc | DateTime | No | No | No | No |  |
| Archive Reason | ArchiveReason | Note | No | No | No | No | RichText=false; Lines=6 |
| Prior State | PriorState | Choice | No | No | No | Yes | Indexed for query/view performance |
| Audit Trail Refs JSON | AuditTrailRefsJson | Note | Yes | No | No | No | RichText=false; Lines=6 |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `external-system mapping / launch reference`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Person/user references are stored as stable text keys for cross-site portability; SharePoint User fields may be added later for UX only.
- Procore references are read-only/mapping references; PCC does not write back into Procore in the MVP posture.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `27`
- Hidden fields: `0`
- Non-hidden lookup fields: `0`
- Unique-enforced fields: ``
- Indexed non-hidden fields: `9`
- System/OOB fields are not included in this planned schema file; live tenant extraction should append OOB fields only where integration-relevant.
- Attachments should remain disabled unless a later approved exception is recorded; evidence should be handled by Document Control references.
- Default operational views should filter first on indexed fields such as `ProjectId`, active/status/state fields, module/system keys, or due-date fields.

## 7. Open Questions / Follow-Up Checks
- Confirm final list URL, list GUID, entity type name, and form URLs after provisioning.
- Confirm whether this list should use a shared PCC content type or a list-local item content type.
- Confirm field IDs and site-column reuse before generating Graph/PnP provisioning assets.
- Confirm production index strategy against actual query patterns and expected item volume.
- Confirm whether any tenant-specific retention, sensitivity, or compliance labels apply.
