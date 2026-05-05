# PCC Approval Decisions

## 1. Objective
- Planned PCC schema/reference file for `PCC Approval Decisions`.
- Category: `Approvals / Checkpoints`.
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
- Description: `Approvals / Checkpoints / Project site`
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
| Approval Decision ID | ApprovalDecisionId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Approval Request ID | ApprovalRequestId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Approval Step ID | ApprovalStepId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Approval Participant ID | ApprovalParticipantId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Actor Principal Key | ActorPrincipalKey | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Actor Role | ActorRole | Text | Yes | No | No | No | MaxLength=255 |
| Decision At UTC | DecisionAtUtc | DateTime | Yes | No | No | No |  |
| Decision Action | DecisionAction | Choice | Yes | No | No | No |  |
| Reason Code | ReasonCode | Note | No | No | No | No | RichText=false; Lines=6 |
| Comment | Comment | Note | No | No | No | No | RichText=false; Lines=6 |
| Evidence Refs JSON | EvidenceRefsJson | Note | No | No | No | No | RichText=false; Lines=6 |
| Defer Until UTC | DeferUntilUtc | DateTime | Yes | No | No | No |  |
| Follow Up Owner Principal Key | FollowUpOwnerPrincipalKey | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Risk Acknowledgement | RiskAcknowledgement | Text | Yes | No | No | No | MaxLength=255 |
| Consequence Acknowledgement | ConsequenceAcknowledgement | Text | Yes | No | No | No | MaxLength=255 |
| Escalation Target Role | EscalationTargetRole | Text | Yes | No | No | No | MaxLength=255 |
| Replacement Source Reference ID | ReplacementSourceReferenceId | Text | Yes | No | No | Yes | Indexed for query/view performance |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `approval/checkpoint workflow control`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Approval-related records join to PCC Approval Requests through `ApprovalRequestId`.
- Person/user references are stored as stable text keys for cross-site portability; SharePoint User fields may be added later for UX only.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `19`
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
