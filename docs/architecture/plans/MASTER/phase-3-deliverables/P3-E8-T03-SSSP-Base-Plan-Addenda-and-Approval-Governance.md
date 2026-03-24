# P3-E8-T03 — SSSP Base Plan, Addenda, and Approval Governance

**Doc ID:** P3-E8-T03
**Parent:** P3-E8 Safety Module — Master Index
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 3 of 10
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. SSSP Overview

The Site Specific Safety Plan (SSSP) is the foundational safety governance document for every construction project. In the Safety Module it is implemented as a **hybrid record**: a structured in-app record with governed and project-instance sections, and a rendered formal document output suitable for submission to owners, AHJs, and subcontractors.

The SSSP is not a document stored in a Documents module folder. It is a first-class Safety workspace record with lifecycle, version control, and joint approval governance.

### 1.1 Core SSSP Design Decisions

| Decision | Detail |
|---|---|
| Decision 4 | SSSP is hybrid: structured in-app + rendered formal document output |
| Decision 5 | Governed sections maintained by Safety Manager only |
| Decision 6 | Project teams can edit only designated project-instance sections |
| Decision 19 | One approved base plan + controlled addenda; full reapproval only for material changes |
| Decision 20 | Base SSSP approval requires joint sign-off: Safety Manager, PM, Superintendent |
| Decision 21 | Addenda approval: Safety always required; PM/Super when operationally affected |

---

## 2. SSSP Structure: Governed vs. Project-Instance Sections

### 2.1 Governed Sections (Safety Manager Only)

These sections are authored and maintained exclusively by the Safety Manager or Safety Officer. Project team members have read-only access. The `safetyManagerOnly: true` flag is enforced at the API layer.

| Section Key | Section Name | Description |
|---|---|---|
| `hazardIdentificationAndControl` | Hazard Identification and Control | Identified site hazards, risk levels, control hierarchy (elimination → substitution → engineering → administrative → PPE) |
| `emergencyResponseProcedures` | Emergency Response Procedures | Emergency contacts, evacuation routes, rally points, emergency action sequence, first aid/CPR resources, hospital routing |
| `safetyProgramStandards` | Safety Program Standards | Company safety policy, disciplinary framework, drug/alcohol policy, safety meeting cadence, competent person requirements |
| `regulatoryAndCodeCitationBlock` | Regulatory and Code Citations | Applicable OSHA standards, state plan amendments, project-specific code compliance requirements |
| `competentPersonRequirements` | Competent Person Requirements | Which activities require a designated competent person, qualification criteria, supervision requirements |
| `subcontractorComplianceStandards` | Subcontractor Compliance Standards | Pre-qualification requirements, safety submission requirements, site safety orientation requirements, compliance monitoring protocol |
| `incidentReportingProtocol` | Incident Reporting Protocol | Reporting chain, required timeframes, internal escalation, regulatory notification thresholds |

### 2.2 Project-Instance Sections (Project Team Editable)

These sections contain project-specific content that the project team maintains within the governed framework.

| Section Key | Section Name | Description |
|---|---|---|
| `projectContacts` | Project Contacts | Owner contact, GC safety contact, safety officer, PM, superintendent, emergency contacts — all project-specific |
| `subcontractorList` | Subcontractor List | Current subcontractors on site (company name, trade, contact) — updated as subcontractors mobilize/demobilize |
| `projectLocation` | Project Location and Description | Address, site boundaries, project description, site access instructions |
| `emergencyAssemblyAndSiteLayout` | Emergency Assembly and Site Layout | Assembly point location, site map reference, site-specific emergency routing |
| `orientationSchedule` | Orientation Schedule | Scheduled orientation dates, responsible parties, frequency |
| `projectSpecificNotes` | Project-Specific Notes | Free-text field for project team to add site-specific safety notes not covered by governed sections |

---

## 3. SSSP Lifecycle

### 3.1 State Machine

```
DRAFT ──────────────────────► PENDING_APPROVAL
  ▲                                   │
  │ (revise after rejection)          │ (approval or rejection)
  │                                   ▼
  └──────────────────────── APPROVED ◄─── (from PENDING_APPROVAL on approval)
                                │
                                │ (material change creates new DRAFT)
                                ▼
                           SUPERSEDED
```

**State descriptions:**

| State | Meaning |
|---|---|
| `DRAFT` | Base plan being authored; no approval in progress; project team may edit instance sections |
| `PENDING_APPROVAL` | Submitted for joint approval; governed sections locked; no edits until approval or rejection |
| `APPROVED` | Fully approved; governs the project; addenda can be created; governed sections remain locked |
| `SUPERSEDED` | Replaced by a newer approved base plan (material change path); read-only historical record |

### 3.2 Transition Rules

| Transition | Who May Trigger | Side Effects |
|---|---|---|
| DRAFT → PENDING_APPROVAL | Safety Manager | Locks governed sections; initiates approval workflow |
| PENDING_APPROVAL → APPROVED | All three approvers have signed | Sets `approvalDate`, `effectiveDate`; publishes rendered document; activates SSSP for project |
| PENDING_APPROVAL → DRAFT | Any approver rejects | Unlocks governed sections; captures rejection notes; resets approval record |
| APPROVED → PENDING_APPROVAL (material change) | Safety Manager | Creates new plan version; prior APPROVED plan remains active until new approval; increments `planVersion` |
| APPROVED → SUPERSEDED | System (on new APPROVED) | Sets `supersededBy` to successor plan ID; prior plan enters permanent read-only state |

### 3.3 What Constitutes a Material Change

A material change requires creating a new base plan version (full reapproval path):

- Modification of any Safety-Manager-governed section content
- Change in emergency response procedures
- Addition of a new major hazard category not covered in the current plan
- Change in subcontractor compliance standards
- Regulatory citation changes that affect field operations

Non-material changes (can be handled by addendum):

- Addition of a new subcontractor to the subcontractor list
- Update of project contacts
- Site layout or assembly point update due to construction progress
- Addition of scope-specific hazard addendum

---

## 4. Joint Approval Matrix

### 4.1 Base Plan Approval

Per Decision 20: base SSSP approval requires joint sign-off from all three roles. All three must sign before the plan reaches APPROVED state.

| Approver Role | Required | Sign-off Field | Notes |
|---|---|---|---|
| Safety Manager | Yes — always required | `safetyManagerApproval` | Must be current project Safety Manager |
| Project Manager | Yes — always required | `pmApproval` | Must be current project PM |
| Superintendent | Yes — always required | `superintendentApproval` | Must be current project Superintendent |

```typescript
interface SSSPApproval {
  safetyManagerApproval: SSSPApprovalSignature | null;
  pmApproval: SSSPApprovalSignature | null;
  superintendentApproval: SSSPApprovalSignature | null;
  allApprovedAt: string | null;         // Timestamp of final approval (last signature)
  rejections: SSSPApprovalRejection[];  // History of rejections in current approval cycle
}

interface SSSPApprovalSignature {
  userId: string;
  userName: string;
  role: 'SAFETY_MANAGER' | 'PM' | 'SUPERINTENDENT';
  signedAt: string;
  signatureMethod: 'DIGITAL' | 'ACKNOWLEDGED_IN_APP';
  comments: string | null;
}

interface SSSPApprovalRejection {
  userId: string;
  userName: string;
  role: 'SAFETY_MANAGER' | 'PM' | 'SUPERINTENDENT';
  rejectedAt: string;
  rejectionNotes: string;
}
```

**Approval sequence:** Signatures may be collected in any order. The plan transitions to APPROVED only when all three `*Approval` fields are non-null with no open rejections.

### 4.2 Addendum Approval

Per Decision 21: Safety Manager approval is always required. PM and Superintendent approval are required when `operationallyAffected = true`.

| Addendum Type | Safety Manager | PM | Superintendent |
|---|---|---|---|
| Not operationally affected | Required | Not required | Not required |
| Operationally affected | Required | Required | Required |

```typescript
interface SSSPAddendumApproval {
  safetyManagerApproval: SSSPApprovalSignature | null;
  pmApproval: SSSPApprovalSignature | null;             // Required when operationallyAffected
  superintendentApproval: SSSPApprovalSignature | null; // Required when operationallyAffected
  allRequiredApprovedAt: string | null;
  rejections: SSSPApprovalRejection[];
}
```

---

## 5. Addendum Model

### 5.1 Addendum Purpose

Addenda allow the SSSP to be updated without full reapproval for non-material changes. An addendum:

- References a specific approved base plan
- Is numbered sequentially within that base plan
- Has its own approval lifecycle
- Is incorporated by reference into the base plan's rendered document output

### 5.2 Addendum Lifecycle

```
DRAFT → PENDING_APPROVAL → APPROVED
              │
              └─► VOIDED (if recalled or rejected with no re-submission)
```

| State | Meaning |
|---|---|
| `DRAFT` | Being authored; not submitted |
| `PENDING_APPROVAL` | Submitted for required approvals |
| `APPROVED` | Approved and effective; incorporated into SSSP |
| `VOIDED` | Recalled or rejected without replacement |

### 5.3 Addendum and Base Plan Relationship

- An addendum always belongs to one base plan (`parentSsspId`)
- An addendum does not replace the base plan
- When the base plan is superseded (material change), all approved addenda to that plan remain as historical record and are listed in the new base plan's rendered output as prior amendments incorporated
- A voided addendum is retained for audit purposes

### 5.4 What an Addendum Can Contain

| `affectedSections` Value | Example Use Case |
|---|---|
| `projectContacts` | New subcontractor contact added, PM change |
| `subcontractorList` | New subcontractor mobilizing |
| `emergencyAssemblyAndSiteLayout` | Phase change moves assembly point |
| `orientationSchedule` | New phase orientation dates |
| `hazardIdentificationAndControl` | New scope (confined space) added to project |
| `safetyProgramStandards` | Updated drug/alcohol testing protocol |
| `incidentReportingProtocol` | Additional escalation path added |

If the affected section is a governed section (Safety Manager only), only the Safety Manager may draft that addendum.

---

## 6. Rendered Document Output

Per Decision 4: the SSSP is hybrid — structured in-app and rendered as a formal document output.

### 6.1 What the Rendered Document Contains

The rendered document is a PDF output generated from the approved SSSP record. It includes:

- All governed section content
- All project-instance section content
- Approved addenda incorporated by reference with addendum dates and numbers
- Approval signature block with all three approval signatures and dates
- Document version header (plan version, project name, effective date)
- HB Intel document control footer

### 6.2 Render Triggers

| Trigger | Action |
|---|---|
| Base plan transitions to APPROVED | Auto-render initiated; `renderedDocumentRef` set when complete |
| Addendum approved | Re-render to incorporate addendum; new `renderedDocumentRef` |
| Safety Manager manually requests re-render | Re-render with same version |

### 6.3 Rendered Document Storage

The rendered PDF is stored as a governed evidence record (`ISafetyEvidenceRecord`) with:
- `sourceRecordType: 'GENERAL'`
- `sensitivityTier: 'STANDARD'`
- `retentionCategory: 'EXTENDED_REGULATORY'`

The `ISiteSpecificSafetyPlan.renderedDocumentRef` points to this evidence record ID.

---

## 7. Work Queue Items from SSSP

| Trigger | Work Queue Item | Priority | Assignee |
|---|---|---|---|
| Base plan in DRAFT with no approval started, project mobilizing | Draft SSSP for approval | HIGH | Safety Manager |
| Base plan in PENDING_APPROVAL, specific approver not yet signed | Sign SSSP for Project [X] | HIGH | Unsigned approver |
| Addendum in PENDING_APPROVAL, specific approver not yet signed | Approve safety addendum for [X] | MEDIUM | Unsigned approver |
| Approved SSSP is more than 365 days old without review | Review SSSP currency | MEDIUM | Safety Manager |
| Project has no SSSP record | Create SSSP | CRITICAL | Safety Manager |

---

## 8. Locked Decisions Reinforced in This File

| Decision | Reinforced Here |
|---|---|
| 4 — SSSP is hybrid: structured + rendered | §6 |
| 5 — Governed sections Safety Manager only | §2.1 |
| 6 — Project team edits designated sections only | §2.2 |
| 7 — Safety Manager-only fields restricted | §2.1, §4.1 |
| 19 — One base plan + addenda; full reapproval for material only | §3.3 |
| 20 — Base SSSP requires joint sign-off | §4.1 |
| 21 — Addendum: Safety always; PM/Super when operationally affected | §4.2 |

---

*[← T02](P3-E8-T02-Workspace-Architecture-and-Record-Family-Map.md) | [Master Index](P3-E8-Safety-Module-Field-Specification.md) | [T04 →](P3-E8-T04-Inspection-Program-Template-Governance-and-Scorecard.md)*
