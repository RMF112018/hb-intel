# P3-E12: Subcontract Compliance Module — Field and Data Model Specification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E12 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |
| **Related Contracts** | P3-E1 §3.11, P3-E2 §16, P3-E4 §6 (Buyout gate), P3-H1 |
| **Source Examples** | docs/reference/example/ |

---

## Purpose

This specification defines the complete data model, field definitions, status enumerations, business rules, and required workflows for the Subcontract Compliance module implementation. Every field listed here **MUST** be implemented. A developer reading this specification must have no ambiguity about what to build.

This document is grounded in the company's working subcontract submission and compliance review workflow. The Subcontract Compliance module is an **always-on core module** with one record per subcontract per project. It provides two operational sub-surfaces:

1. **Subcontract Checklist** — Document package verification checklist confirming all required documents (contract, schedules, insurance certificates, W-9, license, SDI prequalification) are received before a subcontract is executed. Tracks over/under budget and is submitted by the project team for review by the Risk Manager and Project Executive.
2. **Compliance Waiver** — Optional form attached to a Subcontract Checklist when a subcontractor does not qualify for the company's Subcontractor Default Insurance (SDI) policy or does not carry insurance/licensing that meets company requirements. Requires full three-party digital approval: Project Executive, CFO, and Compliance Manager.

### Buyout Gate Integration

The Subcontract Compliance module enforces a hard gate on the Financial module's Buyout Log (P3-E4 §6). A Buyout Log entry MUST NOT advance to `ContractExecuted` status unless:

- The linked Subcontract Checklist has `status === 'Complete'`, **AND**
- Either no Compliance Waiver is attached, OR the attached Compliance Waiver has `status === 'Approved'`

This gate is enforced at the data layer. The Buyout Log entry holds a `subcontractChecklistId` reference field (see P3-E4 §6.1) and the status transition to `ContractExecuted` validates this condition before writing.

### Module Classification

Subcontract Compliance is an **always-on core module** that is active from the point a subcontract is being prepared for award. Multiple checklist records exist per project — one per subcontract. The module is not a single-instance module like Startup or Closeout; it is a multi-record operational module like Permits.

### Source Files

- `docs/reference/example/SUBCONTRACT CHECKLIST.xlsx` — Two worksheets:
  - **Subcontract Checklist** (44 rows × 23 cols): project header, budget section (Budget/Contract Value/Over-Under), 12-item document package checklist, Scanned/Returned-to-Sub status, PM/APM signature fields
  - **Compliance Waiver** (47 rows × 21 cols): header, Insurance Requirements waiver/reduction section, Licensing Requirements waiver section, Scope & Value section, three-party Approval section (PX, CFO, Compliance Manager)

---

## 1. Subcontract Checklist

A Subcontract Checklist record is created per subcontract. The project team completes it and submits it to the Risk Manager and Project Executive for review before the subcontract is executed.

### 1.1 Checklist Header (ISubcontractChecklist)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| checklistId | `string` | Yes | Yes | UUID; immutable; referenced by Buyout Log entry (P3-E4 §6.1 `subcontractChecklistId`) |
| projectId | `string` | Yes | No | FK to project record |
| projectNumber | `string` | Yes | No | Inherited from project at creation |
| projectName | `string` | Yes | No | Inherited from project at creation |
| buyoutLineId | `string` | No | No | FK to `IBuyoutLineItem.buyoutLineId` in P3-E4 §6.1; links this checklist to a specific Buyout Log entry |
| subcontractorName | `string` | Yes | No | Legal name of the subcontractor entity |
| scopeOfWork | `string` | Yes | No | Description of the subcontracted scope |
| dateReceived | `date` | No | No | Date the subcontract package was received from the subcontractor |
| createdAt | `datetime` | Yes | Yes | Timestamp of checklist creation |
| createdBy | `string` | Yes | No | userId of PM or PA who created the record |
| submittedAt | `datetime` | No | No | Timestamp when checklist was submitted for review; null until submitted |
| submittedBy | `string` | No | No | userId of PM who submitted |
| reviewedAt | `datetime` | No | No | Timestamp when Risk Manager / PX completed review |
| reviewedBy | `string` | No | No | userId of reviewer |
| status | `enum` | Yes | No | Enum: `Draft` \| `Submitted` \| `UnderReview` \| `Complete` \| `Rejected` \| `Void` — see §1.4 |
| budget | `number` | No | No | Budget for this scope from the Buyout Log; USD |
| contractValue | `number` | No | No | Agreed subcontract value; USD |
| overUnder | `number` | No | Yes | **Calculated**: `contractValue − budget`; positive = over budget; negative = under |
| overUnderReason | `string` | No | No | Required when `overUnder > 0`; explains the reason for the over-budget award |
| pmName | `string` | No | No | Name of the Project Manager signing off |
| pmUserId | `string` | No | No | FK to user record for PM |
| apmName | `string` | No | No | Name of the Assistant PM / Project Administrator signing off |
| apmUserId | `string` | No | No | FK to user record for APM |
| documents | `ISubcontractDocument[]` | Yes | No | Array of 12 document items (see §1.2 and §1.3); array length is immutable |
| scanned | `boolean` | Yes | No | Indicates the full package has been scanned and filed; default false |
| returnedToSub | `boolean` | Yes | No | Indicates the executed subcontract has been returned to the subcontractor; default false |
| complianceWaiver | `IComplianceWaiver \| null` | No | No | Linked waiver record; null if no waiver is required for this subcontract |
| notes | `string` | No | No | Optional internal notes |
| lastModifiedAt | `datetime` | Yes | Yes | Timestamp of most recent edit |
| lastModifiedBy | `string` | No | No | userId of most recent editor |

### 1.2 Subcontract Document Item Model (ISubcontractDocument)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| documentId | `string` | Yes | Yes | UUID; immutable |
| documentType | `enum` | Yes | No | See `SubcontractDocumentType` enum in §1.3; immutable |
| label | `string` | Yes | No | Human-readable display name; verbatim from template; immutable |
| required | `boolean` | Yes | No | Whether this document is required for all subcontracts (see §1.3 for per-type default); editable by PM for project-specific applicability |
| received | `boolean` | Yes | No | Document has been received from the subcontractor; default false |
| receivedDate | `date` | No | No | Date document was received; null until `received = true` |
| notes | `string` | No | No | Optional notes on this document item |

> **Business rule:** A checklist may only transition to `Complete` status when all items where `required = true` have `received = true`. See §1.4.

### 1.3 Document Type Enumeration (SubcontractDocumentType)

All 12 document items are pre-populated from the source template. The `required` default reflects standard company practice; PMs may override for specific subcontracts.

| Enum Value | Label | Required (Default) | Notes |
|------------|-------|-------------------|-------|
| `Contract` | Contract (with mark ups) | Yes | Executed subcontract agreement |
| `ScheduleA` | Schedule A (Scope of Work) | Yes | Defines the contracted scope |
| `ScheduleB` | Schedule B (List of Documents) | Yes | Contract exhibit listing governing documents |
| `ExhibitA` | Exhibit A (Drawing List) | Yes | List of drawings governing the scope |
| `ExhibitB` | Exhibit B (Project Schedule) | Yes | Project schedule incorporated into subcontract |
| `W9` | W-9 | Yes | IRS form required for vendor payment setup |
| `License` | License | Yes | Subcontractor's applicable state/trade license |
| `InsuranceGL` | Insurance — General Liability | Yes | Certificate of Insurance: GL |
| `InsuranceAuto` | Insurance — Auto | Yes | Certificate of Insurance: Auto |
| `InsuranceUmbrella` | Insurance — Umbrella Liability | Yes | Certificate of Insurance: Umbrella |
| `InsuranceWorkersComp` | Insurance — Workers Comp | Yes | Certificate of Insurance: Workers Comp |
| `CompassSDI` | Compass — SDI Prequalification | Yes | SDI (Subcontractor Default Insurance) prequalification via Compass; see §1.5 |

### 1.4 Checklist Status Enumeration

```typescript
enum SubcontractChecklistStatus {
  Draft = 'Draft',               // Created; project team still assembling documents
  Submitted = 'Submitted',       // PM has submitted for Risk Manager / PX review
  UnderReview = 'UnderReview',   // Reviewer has opened and is actively reviewing
  Complete = 'Complete',         // All required documents received; review passed; gate satisfied
  Rejected = 'Rejected',         // Reviewer rejected; PM must remediate and resubmit
  Void = 'Void',                 // Subcontract cancelled; checklist no longer active
}
```

**Status transition rules:**
- `Draft → Submitted`: Only when PM (or APM) submits; `dateReceived` should be set before submission
- `Submitted → UnderReview`: Risk Manager or PX opens the record for review
- `UnderReview → Complete`: All required documents received AND (no waiver attached OR attached waiver `status === 'Approved'`)
- `UnderReview → Rejected`: Reviewer rejects; rejection reason note required
- `Rejected → Draft`: PM reverts to correct; must resubmit
- `Any → Void`: Checklist voided when subcontract is cancelled

**Completion gate:** The system MUST prevent transition to `Complete` if any `ISubcontractDocument` with `required = true` has `received = false`. This is enforced at the API layer, not only in the UI.

### 1.5 SDI Prequalification Note (CompassSDI)

The `CompassSDI` document type tracks whether the subcontractor has been prequalified through Compass for the company's Subcontractor Default Insurance (SDI) program. If the subcontractor does NOT qualify (CompassSDI received = false and no alternative path), a Compliance Waiver (§2) is required before the checklist can reach `Complete` status.

**SDI waiver trigger rule:** When `CompassSDI.received = false` AND the PM marks the checklist as ready for submission, the system MUST prompt the PM to attach a Compliance Waiver. A checklist with `CompassSDI.received = false` and no attached Compliance Waiver with `status === 'Approved'` MUST NOT transition to `Complete`.

---

## 2. Compliance Waiver

The Compliance Waiver is an optional record attached to a Subcontract Checklist when a subcontractor does not qualify for SDI or does not meet the company's insurance or licensing requirements. It requires three-party digital approval: Project Executive, CFO, and Compliance Manager. A waiver may request relief from insurance requirements, licensing requirements, or both — within a single waiver document.

### 2.1 Waiver Header (IComplianceWaiver)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| waiverId | `string` | Yes | Yes | UUID; immutable |
| checklistId | `string` | Yes | No | FK to `ISubcontractChecklist.checklistId`; one waiver per checklist; immutable |
| projectId | `string` | Yes | No | Inherited from linked checklist |
| projectName | `string` | Yes | No | Inherited from project |
| projectNumber | `string` | Yes | No | Inherited from project |
| subcontractorVendorName | `string` | Yes | No | Name of the subcontractor or vendor |
| projectManagerName | `string` | No | No | PM responsible for this subcontract |
| projectManagerUserId | `string` | No | No | FK to user record |
| pcPaApmName | `string` | No | No | PC / PA / APM associated with this submission |
| pcPaApmUserId | `string` | No | No | FK to user record |
| insuranceWaiverSection | `IInsuranceWaiverSection \| null` | No | No | Insurance requirements relief request; null if no insurance waiver needed |
| licensingWaiverSection | `ILicensingWaiverSection \| null` | No | No | Licensing requirements relief request; null if no licensing waiver needed |
| scopeDescription | `string` | No | No | Description of the subcontract/PO scope covered by this waiver |
| hasEmployeesOnSite | `boolean \| null` | No | No | Does the company have employees on the project site? null = not yet answered |
| subcontractValue | `number` | No | No | Value of the subcontract or purchase order; USD |
| approvals | `IWaiverApproval[]` | Yes | No | Array of exactly 3 approval records — PX, CFO, Compliance Manager; see §2.4 |
| status | `enum` | Yes | Yes | Enum: `Draft` \| `PendingApproval` \| `Approved` \| `Rejected` \| `Void` — see §2.5 |
| waiverLevel | `enum` | Yes | No | Enum: `ProjectLevel` \| `GlobalLevel` — applies to the entire waiver; individual sections may also have level fields |
| createdAt | `datetime` | Yes | Yes | Timestamp of waiver creation |
| createdBy | `string` | Yes | No | userId of creator |
| lastModifiedAt | `datetime` | Yes | Yes | Timestamp of most recent edit |
| lastModifiedBy | `string` | No | No | userId of most recent editor |
| notes | `string` | No | No | Optional internal notes |

> **Validation rule:** At least one of `insuranceWaiverSection` or `licensingWaiverSection` MUST be non-null. A waiver with both sections null is invalid and MUST NOT be saved.

### 2.2 Insurance Waiver Section (IInsuranceWaiverSection)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| sectionId | `string` | Yes | Yes | UUID; immutable |
| action | `enum` | Yes | No | Enum: `Waived` \| `Reduced` — whether the requirement is being fully waived or reduced |
| coverageTypes | `InsuranceCoverageType[]` | Yes | No | Array of coverage types being waived or reduced; min 1 item |
| explanation | `string` | Yes | No | Explanation of what is being waived or reduced |
| riskJustification | `string` | Yes | No | Why the increased risk is justified |
| riskMitigationActions | `string` | Yes | No | What actions will be taken to reduce risk |
| level | `enum` | Yes | No | Enum: `ProjectLevel` \| `GlobalLevel` — scope of this insurance waiver |

**InsuranceCoverageType enum:**

```typescript
enum InsuranceCoverageType {
  GeneralLiability = 'GeneralLiability',
  Auto = 'Auto',
  Umbrella = 'Umbrella',
  WorkersComp = 'WorkersComp',
  ProfessionalLiability = 'ProfessionalLiability',
}
```

### 2.3 Licensing Waiver Section (ILicensingWaiverSection)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| sectionId | `string` | Yes | Yes | UUID; immutable |
| licenseJurisdictions | `LicenseJurisdiction[]` | Yes | No | Array of jurisdiction types where licensing is being waived; min 1 item |
| countyName | `string` | No | No | County name if `County` is included in `licenseJurisdictions`; null otherwise |
| riskJustification | `string` | Yes | No | Why the increased risk is justified |
| riskMitigationActions | `string` | Yes | No | What actions will be taken to reduce risk |
| level | `enum` | Yes | No | Enum: `ProjectLevel` \| `GlobalLevel` — scope of this licensing waiver |

**LicenseJurisdiction enum:**

```typescript
enum LicenseJurisdiction {
  State = 'State',
  Local = 'Local',
  County = 'County',
}
```

### 2.4 Waiver Approval Record (IWaiverApproval)

Each waiver has exactly three approval records, one per required approver role. All three must reach `Approved` status before the waiver itself is `Approved`.

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| approvalId | `string` | Yes | Yes | UUID; immutable |
| waiverId | `string` | Yes | No | FK to `IComplianceWaiver.waiverId`; immutable |
| approverRole | `enum` | Yes | No | Enum: `ProjectExecutive` \| `CFO` \| `ComplianceManager` — immutable; one of each per waiver |
| approverName | `string` | No | No | Name of the person in this role; assigned when the waiver is routed |
| approverUserId | `string` | No | No | FK to user record; null until assigned |
| status | `enum` | Yes | No | Enum: `Pending` \| `Approved` \| `Rejected` \| `Delegated` |
| actionDate | `date` | No | No | Date the approver took action (approved, rejected, or delegated); null until actioned |
| logDate | `date` | No | No | Internal log date recorded by Compliance Manager (relevant to `ComplianceManager` role) |
| notes | `string` | No | No | Approver notes or conditions on this approval |
| delegatedTo | `string` | No | No | userId of delegate if `status === 'Delegated'`; null otherwise |

**Approval sequencing:** Approvals may be obtained in any order — there is no required sequence between PX, CFO, and Compliance Manager. All three must be `Approved` (or `Delegated` with the delegate's approval recorded) before the waiver status can advance to `Approved`.

### 2.5 Waiver Status Enumeration

```typescript
enum ComplianceWaiverStatus {
  Draft = 'Draft',                   // PM is completing waiver form
  PendingApproval = 'PendingApproval', // Submitted; awaiting one or more approver actions
  Approved = 'Approved',             // All three approvals received; gate satisfied
  Rejected = 'Rejected',             // One or more approvers rejected; PM must revise and resubmit
  Void = 'Void',                     // Waiver voided (subcontract cancelled or requirements changed)
}
```

**Calculated status rule:**
- `Draft → PendingApproval`: When PM submits the waiver for approval routing; requires all required fields populated
- `PendingApproval → Approved`: **Calculated** — when all three `IWaiverApproval.status` values are `Approved`
- `PendingApproval → Rejected`: When any `IWaiverApproval.status` = `Rejected`
- `Rejected → Draft`: PM reverts to revise; rejected approval records are preserved for audit trail; new approval records created on resubmission
- `Any → Void`: Manual void action by PM or PX

---

## 3. Business Rules

### 3.1 Record Multiplicity

- One `ISubcontractChecklist` record exists per subcontract per project. Multiple checklist records per project are expected and normal — one per subcontract awarded.
- One `IComplianceWaiver` record exists per `ISubcontractChecklist`. A checklist can have zero or one waiver. Multiple waivers per checklist are not permitted; if requirements change, the existing waiver is revised and resubmitted.

### 3.2 Buyout Log Gate (Cross-Module Rule)

This rule is the primary integration constraint between Subcontract Compliance (P3-E12) and Financial/Buyout (P3-E4):

```
IBuyoutLineItem.status MUST NOT transition to 'ContractExecuted'
  UNLESS the linked subcontractChecklistId satisfies:
    ISubcontractChecklist.status === 'Complete'
    AND (
      ISubcontractChecklist.complianceWaiver === null
      OR ISubcontractChecklist.complianceWaiver.status === 'Approved'
    )
```

This gate is enforced at the API layer on the Financial module's status update endpoint for Buyout Line Items. The Subcontract Compliance module is the source-of-truth for gate satisfaction; it does not perform the gate enforcement — it surfaces the status that the Financial module checks.

A Buyout Line Item with `subcontractChecklistId = null` (checklist not yet created) also MUST NOT advance to `ContractExecuted`. The `subcontractChecklistId` field on the Buyout Line Item is required before `ContractPending` status.

### 3.3 Over/Under Budget Rule

- `overUnder` is a calculated field: `contractValue − budget`.
- When `overUnder > 0` (contract is over budget), `overUnderReason` becomes required before the checklist can transition out of `Draft` status.
- The over/under reason is surfaced to the Risk Manager and PX during their review.

### 3.4 Immutable Fields

Fields that are set at record creation and MUST NOT be editable by any role after creation:

- `checklistId`, `waiverId`, `approvalId`, `documentId`, `sectionId` — all record identifiers
- `documentType` on `ISubcontractDocument` — the 12 document types are fixed
- `approverRole` on `IWaiverApproval` — role assignments are immutable once the waiver is submitted
- `checklistId` on `IComplianceWaiver` — a waiver cannot be reassigned to a different checklist
- `projectId` on both header records

### 3.5 Audit Trail Preservation

When a waiver transitions from `Rejected → Draft` for revision:
- The existing rejected `IWaiverApproval` records MUST be preserved (not deleted) with their `status`, `actionDate`, and `notes`
- New `IWaiverApproval` records are created for the resubmission
- The waiver version or iteration should be tracked (a `submissionCount` field increments on each submission)

**Add `submissionCount` to `IComplianceWaiver`:**

| Field Name | TypeScript Type | Required | Calculated | Business Rule |
|---|---|---|---|---|
| submissionCount | `number` | Yes | Yes | **Calculated**: increments by 1 each time `status` transitions from `Draft` or `Rejected` to `PendingApproval`; starts at 0 |

### 3.6 Global-Level Waiver Scope

When a waiver section's `level` is set to `GlobalLevel`, this indicates the waiver relief applies across multiple projects for this subcontractor, not only the current project. The data model captures this designation but does not automatically propagate the waiver to other projects — that cross-project enforcement is out of Phase 3 scope. The `GlobalLevel` flag is surfaced to the Compliance Manager for tracking purposes.

### 3.7 Required Document Override

A PM may set `ISubcontractDocument.required = false` for a specific document type on a specific subcontract (e.g., a material-only purchase order that has no employees on site may not require Workers Comp insurance). This override is logged and surfaced to the Risk Manager / PX reviewer. It does not suppress the requirement globally — only for this checklist record.

---

## 4. Spine Publication

### 4.1 Activity Spine

| Trigger | Activity Type | Payload |
|---------|--------------|---------|
| Checklist created | `SubcontractChecklistCreated` | checklistId, subcontractorName, scopeOfWork, createdBy |
| Checklist submitted for review | `SubcontractChecklistSubmitted` | checklistId, subcontractorName, submittedBy |
| Checklist status changes | `SubcontractChecklistStatusChanged` | checklistId, previousStatus, newStatus, changedBy |
| Document marked received | `SubcontractDocumentReceived` | checklistId, documentType, label, receivedBy |
| Compliance Waiver created | `ComplianceWaiverCreated` | waiverId, checklistId, subcontractorVendorName, createdBy |
| Waiver approval actioned | `WaiverApprovalActioned` | waiverId, approverRole, approverName, status, actionDate |
| Waiver status changes to Approved | `ComplianceWaiverApproved` | waiverId, checklistId, subcontractorVendorName, approvedAt |
| Waiver status changes to Rejected | `ComplianceWaiverRejected` | waiverId, checklistId, rejectedBy, actionDate |
| Buyout gate satisfied (checklist Complete + waiver OK) | `SubcontractComplianceGateSatisfied` | checklistId, buyoutLineId, satisfiedAt |

### 4.2 Health Spine

| Metric | Calculation |
|--------|------------|
| `openChecklistsNotSubmitted` | Count of checklists in `Draft` status where `buyoutLineItem.status >= 'ContractPending'` |
| `checklistsUnderReview` | Count of checklists in `Submitted` or `UnderReview` status |
| `waiversPendingApproval` | Count of waivers in `PendingApproval` status |
| `overdueApprovals` | Count of `IWaiverApproval` records in `Pending` status where waiver has been in `PendingApproval` for >7 days |
| `buyoutGateBlocked` | Count of Buyout Log entries in `ContractPending` status blocked by incomplete checklist or unapproved waiver |

### 4.3 Work Queue Spine

Items appear in the Work Queue when:

| Condition | Work Queue Item Label | Assignee |
|-----------|----------------------|----------|
| Checklist in `Draft` with all required docs `received = true` for >3 days | "Subcontract checklist ready to submit" | PM |
| Checklist in `Submitted` for >5 days with no reviewer action | "Subcontract checklist awaiting review" | Risk Manager / PX |
| Waiver `IWaiverApproval.status === 'Pending'` for approver role | "Compliance waiver awaiting your approval — [subcontractor name]" | Assigned approver |
| Waiver `status === 'Rejected'` | "Compliance waiver rejected — revision required" | PM |
| Buyout Line Item in `ContractPending` with `buyoutGateBlocked === true` for >7 days | "Subcontract execution blocked — compliance incomplete" | PM |

### 4.4 Related Items Spine

| Related Module | Relationship |
|----------------|-------------|
| Financial / Buyout (P3-E4) | Checklist linked to `IBuyoutLineItem` via `buyoutLineId`; gate status surfaced on the Buyout Log entry |
| Project Startup (P3-E11) | Job Startup Checklist item 2.24 ("Write Subcontracts in Procore") links to subcontract award status |
| Permits (P3-E7) | Subcontractors performing permitted work may have associated permit records |

---

## 5. Access and Role Permissions

| Role | Read | Create Checklist | Edit Checklist | Submit Checklist | Review / Complete Checklist | Create Waiver | Approve Waiver |
|------|------|-----------------|----------------|------------------|-----------------------------|---------------|----------------|
| PX (Project Executive) | Yes | No | Yes | No | Yes | No | Yes (PX approval) |
| Sr. PM / PM2 / PM1 | Yes | Yes | Yes | Yes | No | Yes | No |
| PA (Project Administrator) | Yes | Yes | Yes | Yes | No | Yes | No |
| Risk Manager / Compliance Manager | Yes | No | No | No | Yes | No | Yes (Compliance Mgr approval) |
| CFO | Yes | No | No | No | No | No | Yes (CFO approval) |
| Project Accountant | Yes | No | No | No | No | No | No |
| QAQC | Yes | No | No | No | No | No | No |
| Read-Only | Yes | No | No | No | No | No | No |

**Review / Complete Checklist** = the action that advances a checklist from `Submitted` or `UnderReview` to `Complete` or `Rejected`. Only Risk Manager / PX may perform this action.

**Annotation boundary:** Subcontract Compliance is a review-capable surface in Phase 3. PER-sourced executive review annotations are stored via `@hbc/field-annotations` and MUST NOT mutate any checklist or waiver record. Standard annotation isolation rules apply.

---

## 6. Related Specifications

| Document | Relationship |
|----------|-------------|
| P3-E1 §3.11 | Module classification matrix entry for Subcontract Compliance |
| P3-E2 §16 | Source-of-truth and action-boundary matrix for Subcontract Compliance |
| P3-E3 §9.9 | Replacement notes — `SUBCONTRACT CHECKLIST.xlsx` |
| P3-E4 §6.1 | Buyout Line Item — `subcontractChecklistId` field and `ContractExecuted` gate rule |
| P3-E11 §1 (item 2.24) | Job Startup Checklist item for writing subcontracts cross-references this module |
