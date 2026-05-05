# PCC Constraint Impact Assessments

## 1. Objective
- Planned PCC schema/reference file for `PCC Constraint Impact Assessments`.
- Category: `Constraints Log`.
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
- Description: `Constraints Log / Project site`
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
| Assessment ID | AssessmentId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Constraint Item ID | ConstraintItemId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Likelihood | Likelihood | Text | Yes | No | No | No | MaxLength=255 |
| Urgency | Urgency | Text | Yes | No | No | No | MaxLength=255 |
| Schedule Impact | ScheduleImpact | Text | Yes | No | No | No | MaxLength=255 |
| Cost Impact | CostImpact | Text | Yes | No | No | No | MaxLength=255 |
| Safety Impact | SafetyImpact | Text | Yes | No | No | No | MaxLength=255 |
| Quality Impact | QualityImpact | Text | Yes | No | No | No | MaxLength=255 |
| Contract Compliance Impact | ContractComplianceImpact | Text | Yes | No | No | No | MaxLength=255 |
| Client Owner Impact | ClientOwnerImpact | Text | Yes | No | No | No | MaxLength=255 |
| Logistics Access Impact | LogisticsAccessImpact | Text | Yes | No | No | No | MaxLength=255 |
| Reputation Executive Visibility Impact | ReputationExecutiveVisibilityImpact | Text | Yes | No | No | No | MaxLength=255 |
| Governing Impact Score | GoverningImpactScore | Number | Yes | No | No | No |  |
| Risk Score | RiskScore | Number | Yes | No | No | No |  |
| Exposure Score | ExposureScore | Number | Yes | No | No | No |  |
| Severity Band | SeverityBand | Choice | Yes | No | No | No |  |
| Applied Override Codes JSON | AppliedOverrideCodesJson | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Override Rationale | OverrideRationale | Note | No | No | No | No | RichText=false; Lines=6 |
| Mitigation Rationale | MitigationRationale | Note | No | No | No | No | RichText=false; Lines=6 |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `constraint/risk exposure workflow record`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `21`
- Hidden fields: `0`
- Non-hidden lookup fields: `0`
- Unique-enforced fields: ``
- Indexed non-hidden fields: `3`
- System/OOB fields are not included in this planned schema file; live tenant extraction should append OOB fields only where integration-relevant.
- Attachments should remain disabled unless a later approved exception is recorded; evidence should be handled by Document Control references.
- Default operational views should filter first on indexed fields such as `ProjectId`, active/status/state fields, module/system keys, or due-date fields.

## 7. Open Questions / Follow-Up Checks
- Confirm final list URL, list GUID, entity type name, and form URLs after provisioning.
- Confirm whether this list should use a shared PCC content type or a list-local item content type.
- Confirm field IDs and site-column reuse before generating Graph/PnP provisioning assets.
- Confirm production index strategy against actual query patterns and expected item volume.
- Confirm whether any tenant-specific retention, sensitivity, or compliance labels apply.
