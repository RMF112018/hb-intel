# Wave 10 Workbook Source Mapping Appendix

Generated: 2026-05-01

## 1. Permit Log Workbook Inventory

Source file: `docs/reference/example/Permit_Log_Template.xlsx`

- Primary sheet: `PERMITS`
- Used range: `A1:O148`
- Frozen panes: `A2`
- Merged cells: none
- Hidden rows/columns: none
- Excel tables: none
- Named ranges: present at workbook level; legacy/global naming not specific to Wave 10 contract structure

## 2. Inspection Log Workbook Inventory

Source file: `docs/reference/example/Inspection-Log-Template.xlsx`

- Sheets: `Sheet1`, `Sheet2`
- `Sheet1` used range: `A1:F201`
- `Sheet2` used range: `A1:B5`
- `Sheet1` frozen panes: `A6`
- `Sheet1` merged cells: `A1:F1`, `A2:F2`, `A3:F3`, `A4:F4`
- Hidden rows/columns: none
- Excel tables: none
- Named ranges: none

## 3. Sheet Names and Used Ranges

| Workbook                     | Sheet   | Used range | Notes                                 |
| ---------------------------- | ------- | ---------- | ------------------------------------- |
| Permit_Log_Template.xlsx     | PERMITS | A1:O148    | Permit-centric row inventory          |
| Inspection-Log-Template.xlsx | Sheet1  | A1:F201    | Header/context rows + inspection body |
| Inspection-Log-Template.xlsx | Sheet2  | A1:B5      | small value helper sheet              |

## 4. Column Mapping Tables

### 4.1 Permit Workbook Columns

| Source column | Source header          | Target field       | Classification    |
| ------------- | ---------------------- | ------------------ | ----------------- |
| A             | #                      | `permitSequence`   | Workbook-derived  |
| B             | SUB REF                | `subReference`     | Workbook-enhanced |
| C             | TYPE                   | `permitType`       | Workbook-derived  |
| D             | LOCATION               | `location`         | Workbook-derived  |
| E             | PERMIT #               | `permitNumber`     | Workbook-derived  |
| F             | DESCRIPTION            | `description`      | Workbook-derived  |
| G             | RESPONSIBLE CONTRACTOR | `responsibleParty` | Workbook-derived  |
| H             | Address                | `siteAddress`      | Workbook-enhanced |
| I             | DATE REQUIRED          | `dateRequired`     | Workbook-derived  |
| J             | DATE SUBMITTED         | `dateSubmitted`    | Workbook-derived  |
| K             | DATE RECEIVED          | `dateReceived`     | Workbook-derived  |
| L             | DATE EXPIRES           | `dateExpires`      | Workbook-derived  |
| M             | STATUS                 | `permitStatus`     | Workbook-derived  |
| N             | AHJ                    | `ahjName`          | Workbook-derived  |
| O             | COMMENTS               | `comments`         | Workbook-derived  |

### 4.2 Inspection Workbook Columns

| Source column | Source header   | Target field        | Classification    |
| ------------- | --------------- | ------------------- | ----------------- |
| A             | Inspection      | `inspectionType`    | Workbook-derived  |
| B             | Code            | `inspectionCode`    | Workbook-derived  |
| C             | Date Called In  | `dateCalledIn`      | Workbook-derived  |
| D             | Result          | `inspectionResult`  | Workbook-derived  |
| E             | Comment         | `inspectionComment` | Workbook-derived  |
| F             | Verified Online | `verifiedOnline`    | Workbook-enhanced |

## 5. Sample Row Analysis

### 5.1 Permit Samples

Observed rows include:

- `TYPE`: `PRIMARY`, `LOGISTICS`
- `LOCATION`: `Site`, `TRAILER`, `Pool`
- `DESCRIPTION`: `Mass Grading`, `Engineering`, `Construction Field Office`
- `STATUS`: includes `Application Submitted`
- `AHJ`: includes `PBG`

### 5.2 Inspection Samples

Observed header/context rows include:

- `Main Permit # -` context row
- `List of Inspections Required`
- Body header row: `Inspection`, `Code`, `Date Called In`, `Result`, `Comment`, `Verified Online`

Observed sample inspection names include:

- `NOC/Recorded`
- `Fire Preliminary`
- `Civil Preliminary`

## 6. Status/Dropdown/Value Analysis

### 6.1 Permit Workbook

- No explicit data-validation dropdown ranges detected.
- Status semantics are inferred from status values and conditional-formatting rules.

### 6.2 Inspection Workbook

- Validation list on `D7:D180`: `Pass,Fail,Partial,N/A`.
- This list establishes explicit result vocabulary at workbook level.

## 7. Formula and Conditional Formatting Findings

### 7.1 Permit Workbook

- Formula pattern in column A (`A3:A148` style): sequence increment (`=A(n-1)+1`).
- Cached/displayed values exist for formula cells.
- Conditional formatting uses expression rules on `STATUS` column (M), including values:
  - `Pending Application`
  - `Inactive`
  - `Pending Revision`
  - `VOID`

### 7.2 Inspection Workbook

- No formulas detected.
- Conditional formatting on `D7:D180` for result values (`Pass`, `Fail`, `N/A`, `Partial`).
- Alternating-row expression styling present for `A7:F180`.

## 8. Hidden Row/Column Findings

- Permit workbook: no hidden rows/columns detected.
- Inspection workbook: no hidden rows/columns detected.

## 9. Workbook-Derived Fields

Fields directly supported by workbook headers and/or workbook validation/status structures:

- `permitNumber`
- `permitType`
- `location`
- `description`
- `responsibleParty`
- `dateRequired`
- `dateSubmitted`
- `dateReceived`
- `dateExpires`
- `permitStatus`
- `ahjName`
- `comments`
- `inspectionType`
- `inspectionCode`
- `dateCalledIn`
- `inspectionResult`
- `inspectionComment`

## 10. Workbook-Enhanced Fields

Fields guided by workbook context but requiring normalized architecture behavior:

- `subReference`
- `siteAddress`
- `verifiedOnline`
- `relatedPermitId` (from permit/inspection context linkage rows)
- `scheduledWindow`
- `resultStatus` (normalized status enum beyond raw dropdown values)

## 11. Chat-Required Fields

Required target-added fields from Wave 10 decisions, not present as workbook-derived columns:

- `revision`
- `applicationValue`
- `permitFee`
- `reInspectionFee`

Classification for all four: **Chat-required**.

## 12. Research-Informed Fields

Fields informed by inspection/permitting product-pattern review and Wave 10 architecture posture:

- `reinspectionRequestedDate`
- `reinspectionScheduledWindow`
- `failedItemSummary`
- `correctiveActionOwner`
- `correctiveActionDueDate`
- `evidenceStatus`
- `feeStatus`

Classification for these fields: **Research-informed**.

## 13. Repo-Alignment Fields

Fields required for consistency with existing PCC model/readiness/action architecture seams:

- `priorityActionCategory`
- `readinessBlockerState`
- `approvalCheckpointState`
- `evidenceLinks`
- `auditEvents`
- `sourceLineage`

Classification for these fields: **Repo-alignment**.

## 14. Ambiguous Fields Requiring User Review

Fields that remain policy-sensitive and need explicit implementation-time decisioning:

- `inspectionNumber` format/authority source
- `ahjJurisdictionType` vocabulary
- `feeDisputeReason` controlled vocabulary
- `overrideByReason` approval routing depth
- `verifiedOnline` evidence threshold semantics

Classification for these fields: **Future/deferred** until policy is finalized.

## 15. Import/Migration Posture

- Import logic will map workbook columns to target fields with explicit classification tags.
- Import will preserve provenance metadata: workbook, sheet, row, column, import timestamp.
- Chat-required and research-informed fields may be null/default at import until manually populated or policy-seeded.
- Ambiguous fields will route to review queues instead of silent auto-normalization.

## 16. Source Traceability Requirements

- Every mapped target field must retain source classification metadata.
- Workbook-derived mappings must reference exact workbook path, sheet, and column header.
- Workbook-enhanced mappings must record transformation rationale.
- Chat-required/research-informed/repo-alignment fields must include architecture rationale and authority reference.
- Wave 10 mapping posture must continue to align with:
  - Wave 8 Project Readiness framework seam ownership.
  - Wave 14 Approvals / Checkpoints authority posture.
- AHJ interactions remain launcher-link only; this appendix does not authorize runtime AHJ operations.

## 17. Field Classification Register

| Target field                | Classification    |
| --------------------------- | ----------------- |
| permitSequence              | Workbook-derived  |
| permitNumber                | Workbook-derived  |
| permitType                  | Workbook-derived  |
| location                    | Workbook-derived  |
| description                 | Workbook-derived  |
| responsibleParty            | Workbook-derived  |
| dateRequired                | Workbook-derived  |
| dateSubmitted               | Workbook-derived  |
| dateReceived                | Workbook-derived  |
| dateExpires                 | Workbook-derived  |
| permitStatus                | Workbook-derived  |
| ahjName                     | Workbook-derived  |
| comments                    | Workbook-derived  |
| inspectionType              | Workbook-derived  |
| inspectionCode              | Workbook-derived  |
| dateCalledIn                | Workbook-derived  |
| inspectionResult            | Workbook-derived  |
| inspectionComment           | Workbook-derived  |
| subReference                | Workbook-enhanced |
| siteAddress                 | Workbook-enhanced |
| verifiedOnline              | Workbook-enhanced |
| relatedPermitId             | Workbook-enhanced |
| scheduledWindow             | Workbook-enhanced |
| resultStatus                | Workbook-enhanced |
| revision                    | Chat-required     |
| applicationValue            | Chat-required     |
| permitFee                   | Chat-required     |
| reInspectionFee             | Chat-required     |
| reinspectionRequestedDate   | Research-informed |
| reinspectionScheduledWindow | Research-informed |
| failedItemSummary           | Research-informed |
| correctiveActionOwner       | Research-informed |
| correctiveActionDueDate     | Research-informed |
| evidenceStatus              | Research-informed |
| feeStatus                   | Research-informed |
| priorityActionCategory      | Repo-alignment    |
| readinessBlockerState       | Repo-alignment    |
| approvalCheckpointState     | Repo-alignment    |
| evidenceLinks               | Repo-alignment    |
| auditEvents                 | Repo-alignment    |
| sourceLineage               | Repo-alignment    |
| inspectionNumber            | Future/deferred   |
| ahjJurisdictionType         | Future/deferred   |
| feeDisputeReason            | Future/deferred   |
| overrideByReason            | Future/deferred   |
