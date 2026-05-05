# PCC Business Audit Events

## 1. Objective
- Planned PCC schema/reference file for `PCC Business Audit Events`.
- Category: `Workflow / Business Audit / Configuration`.
- Storage posture: `Project site or HBCentral depending on event scope`.
- Classification posture: `model-derived-required`.

## 2. List-Level Metadata
- List ID: ``
- Entity Type Name: ``
- URL: ``
- Default View URL: ``
- Root Folder URL: ``
- Base Template / Base Type: `100` / `0`
- Classification: `model-derived-required`
- Description: `Workflow / Business Audit / Configuration / Project site or HBCentral depending on event scope`
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
| Business Audit Event ID | BusinessAuditEventId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Event Type | EventType | Choice | Yes | No | No | No |  |
| Subject Type | SubjectType | Choice | Yes | No | No | No |  |
| Subject ID | SubjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Actor UPN | ActorUpn | Text | Yes | No | No | No | MaxLength=255 |
| Actor Persona | ActorPersona | Text | Yes | No | No | No | MaxLength=255 |
| Occurred At UTC | OccurredAtUtc | DateTime | Yes | No | No | Yes | Indexed for query/view performance |
| Correlation ID | CorrelationId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Severity | Severity | Choice | Yes | No | No | No |  |
| Payload Summary | PayloadSummary | Note | No | No | No | No | RichText=false; Lines=6 |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Source Context Type | SourceContextType | Choice | Yes | No | No | No |  |
| Source Context ID | SourceContextId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Before Summary | BeforeSummary | Note | Yes | No | No | No | RichText=false; Lines=6 |
| After Summary | AfterSummary | Note | Yes | No | No | No | RichText=false; Lines=6 |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `business audit / history log`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Person/user references are stored as stable text keys for cross-site portability; SharePoint User fields may be added later for UX only.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `16`
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
