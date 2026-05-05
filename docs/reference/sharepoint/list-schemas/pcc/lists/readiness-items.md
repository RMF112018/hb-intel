# PCC Readiness Items

## 1. Objective
- Planned PCC schema/reference file for `PCC Readiness Items`.
- Category: `Project Readiness`.
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
- Description: `Project Readiness / Project site`
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
| Readiness Item ID | ReadinessItemId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Domain | Domain | Text | Yes | No | No | No | MaxLength=255 |
| Lifecycle Gate | LifecycleGate | Text | Yes | No | No | No | MaxLength=255 |
| Source Module ID | SourceModuleId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Description | Description | Note | No | No | No | No | RichText=false; Lines=6 |
| Owner Persona | OwnerPersona | Text | Yes | No | No | No | MaxLength=255 |
| Assigned User UPN | AssignedUserUpn | Text | Yes | No | No | No | MaxLength=255 |
| Reviewer Persona | ReviewerPersona | Text | No | No | No | No | MaxLength=255 |
| Due Date UTC | DueDateUtc | DateTime | Yes | No | No | Yes | Indexed for query/view performance |
| Status | Status | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Severity | Severity | Choice | Yes | No | No | No |  |
| Blocker State | BlockerState | Boolean | Yes | No | No | Yes | Indexed for query/view performance |
| Posture | Posture | Choice | Yes | No | No | No |  |
| Confidence | Confidence | Choice | Yes | No | No | No |  |
| Source Health Status | SourceHealthStatus | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Dependency Item IDs JSON | DependencyItemIdsJson | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Escalation Path JSON | EscalationPathJson | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Approval Checkpoint Reference | ApprovalCheckpointReference | Text | Yes | No | No | No | MaxLength=255 |
| Related Priority Action ID | RelatedPriorityActionId | Choice | No | No | No | Yes | Indexed for query/view performance |
| Created At UTC | CreatedAtUtc | DateTime | Yes | No | No | No |  |
| Updated At UTC | UpdatedAtUtc | DateTime | Yes | No | No | No |  |
| Last Actor Persona | LastActorPersona | Text | Yes | No | No | No | MaxLength=255 |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `project readiness workflow record`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Person/user references are stored as stable text keys for cross-site portability; SharePoint User fields may be added later for UX only.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `24`
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
