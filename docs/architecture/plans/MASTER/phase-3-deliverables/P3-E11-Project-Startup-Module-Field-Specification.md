# P3-E11: Project Startup Module — Field and Data Model Specification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E11 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |
| **Related Contracts** | P3-E1 §3.10, P3-E2 §13, P3-E3 §9.7, P3-H1 §18.6 |
| **Source Examples** | docs/reference/example/ |

---

## Purpose

This specification defines the complete data model, field definitions, status enumerations, business rules, and required workflows for the Project Startup module implementation. Every field listed here **MUST** be implemented. A developer reading this specification must have no ambiguity about what to build.

This document is grounded in the company's working operational startup processes, safety readiness protocols, role assignment matrix, and project management plan structure. The Project Startup module is an **always-on lifecycle module** that activates at project creation and provides five operational sub-surfaces:

1. **Job Startup Checklist** — 55-item tri-state operational checklist (4 sections) tracking project mobilization readiness
2. **Jobsite Safety Checklist** — 32-item startup safety readiness check (2 sections, Pass/Fail/N/A) — distinct from the Safety module's ongoing 93-item weighted inspection checklist
3. **Responsibility Matrix** — PM sheet (84 tasks × 9 roles) + Field sheet (28 tasks × 8 roles) role assignment grid
4. **Owner Contract Review** — Structured extraction of contractual obligations and required-action items from the Owner's contract
5. **Project Management Plan** — 11-section structured document capturing project-specific operational commitments for the project team

### Module Classification

Project Startup is an **always-on lifecycle module** that is active from the moment a project is created in Project Hub. The data it captures is project-specific and does not publish to org-wide derived intelligence indexes (unlike Project Closeout, which derives the LessonsIntelligenceIndex, SubIntelligenceIndex, and LearningLegacyFeed upon archive). The module provides read-only spine publication for Activity, Health, Work Queue, and Related Items surfaces.

### Source Files

- `docs/reference/example/Project_Startup_Checklist.pdf` — 55-item tri-state startup checklist (4 sections; response values: N/A / Yes / No)
- `docs/reference/example/Job Startup Checklist.pdf` — companion reference checklist (same structure)
- `docs/reference/example/Project_Safety_Checklist.pdf` — "Jobsite Safety Checklist" — 32-item startup safety readiness check (2 sections; response values: Pass / Fail / N/A)
- `docs/reference/example/Responsibility Matrix - Template.xlsx` — PM sheet (84 tasks, 9 roles) + Field sheet (28 tasks, 8 roles)
- `docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx` — Owner contract obligations matrix (45 rows, 6 columns)
- `docs/reference/example/PROJECT MANAGEMENT PLAN 2019.docx` — 11-section PM Plan template (Sections I–XI)
- `docs/reference/example/Procore Startup Checklist Summary (1).pdf` — Procore admin setup data and project metadata requirements

---

## 1. Job Startup Checklist

The Job Startup Checklist is the operational core of project mobilization tracking. It consists of 55 items in 4 sections. Each item has a tri-state result: `N/A | Yes | No`. Unanswered items default to null (not yet reviewed). The module tracks completion percentage based on applicable (non-N/A) items.

### 1.1 Checklist Header (IStartupChecklist)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| checklistId | `string` | Yes | Yes | UUID generated on creation; immutable |
| projectId | `string` | Yes | No | FK to project record; one checklist per project |
| projectName | `string` | Yes | No | Inherited from project at creation |
| projectNumber | `string` | Yes | No | Inherited from project at creation |
| createdAt | `datetime` | Yes | Yes | Timestamp of checklist creation |
| createdBy | `string` | Yes | No | userId of creator |
| lastModifiedAt | `datetime` | Yes | Yes | Timestamp of most recent item edit |
| lastModifiedBy | `string` | No | No | userId of most recent editor; null if not yet modified |
| status | `enum` | Yes | Yes | Enum: `NotStarted` \| `InProgress` \| `Complete` \| `Archived` — auto-calculated: NotStarted if no items answered; InProgress if ≥1 item answered; Complete if all applicable items answered; Archived if manually set |
| completionPercentage | `number` | Yes | Yes | **Calculated**: (count of items with result = Yes / count of total applicable items where result ≠ N/A) × 100; integer 0–100 |
| sections | `IStartupChecklistSection[]` | Yes | No | Array of 4 section objects; array length is immutable |
| notes | `string` | No | No | Optional project-level startup notes |

### 1.2 Checklist Section Model (IStartupChecklistSection)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| sectionId | `string` | Yes | Yes | UUID; immutable |
| sectionNumber | `number` | Yes | No | 1–4; immutable |
| sectionTitle | `string` | Yes | No | Enum: `ReviewOwnerContract` \| `JobStartUp` \| `OrderServicesAndEquipment` \| `PermitsPostedOnJobsite` |
| itemCount | `number` | Yes | No | Immutable item count per section: Section 1 = 4, Section 2 = 33, Section 3 = 6, Section 4 = 12 |
| items | `IStartupChecklistItem[]` | Yes | No | Array of items in this section |
| sectionCompletionPercentage | `number` | Yes | Yes | **Calculated**: (count of items with result = Yes / count of applicable items in section) × 100 |
| completedAt | `datetime` | No | Yes | Set when all applicable items in section are answered; null until then |

### 1.3 Checklist Item Model (IStartupChecklistItem)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| itemId | `string` | Yes | Yes | UUID; immutable |
| itemNumber | `string` | Yes | No | Section-prefixed number, e.g., `1.1`, `2.15`, `4.12`; immutable |
| description | `string` | Yes | No | Verbatim item text from source checklist; immutable |
| result | `enum \| null` | Yes | No | Enum: `NA` \| `Yes` \| `No` \| null — null = not yet reviewed |
| notes | `string` | No | No | Optional free-text note on this item |
| lastModifiedAt | `datetime` | No | Yes | Timestamp when result was last changed; null if never answered |
| lastModifiedBy | `string` | No | No | userId of person who last set the result |

### 1.4 All Checklist Items — Verbatim Reference

#### Section 1: Review Owner's Contract (4 items)

| Item No. | Description | Default |
|----------|-------------|---------|
| 1.1 | Split savings clause if any & Contingency usage parameters | null |
| 1.2 | Liquidated damages are? | null |
| 1.3 | Any other special terms to be aware of? | null |
| 1.4 | Allowances to track- Set up change event to track | null |

#### Section 2: Job Start-Up (33 items)

| Item No. | Description | Default |
|----------|-------------|---------|
| 2.1 | Review Bonding / SDI Requirements (HB and Subcontractor) | null |
| 2.2 | Complete Bond Application(s) and Submit to CFO to obtain (If Applicable) | null |
| 2.3 | Verify project is set up job in Accounting | null |
| 2.4 | Verify job is set up in Procore (see Job Set Up Procedures) | null |
| 2.5 | Job Turnover Meeting from Estimating to Project Team | null |
| 2.6 | Have Budget rolled from Sage Estimating to Accounting (if Applicable) | null |
| 2.7 | Have Budget rolled from Sage Accounting to Procore | null |
| 2.8 | Order Project Signs through HB Marketing Department | null |
| 2.9 | Enter Drawings and Specifications in Procore | null |
| 2.10 | Contract to Owner with Schedule of Values / Pay app | null |
| 2.11 | Obtain all Subcontractor COI prior to MOB | null |
| 2.12 | Provide owner Certificate of Insurance | null |
| 2.13 | Complete and Record Notice of Commencement | null |
| 2.14 | Set up Job Files | null |
| 2.15 | Set up Management Plan & Logistics plan (Pre-Planning/Staging Meeting) | null |
| 2.16 | Prepare Project Schedule | null |
| 2.17 | Complete Submittal Register in Procore | null |
| 2.18 | Enter items in Job Close-out | null |
| 2.19 | Pre-Construction meeting with City/County/Fire/Building (Verify their checklist) | null |
| 2.20 | Pre-Construction Meeting with Owner | null |
| 2.21 | Verify owner has provided Threshold & Testing company/under contract | null |
| 2.22 | Verify need for Photo/Video Surveys of any adjacent property/Structures | null |
| 2.23 | Verify need for any vibration monitoring | null |
| 2.24 | Write Subcontracts in Procore (Identify longest lead items & award first) | null |
| 2.25 | Confirm review of estimate, qualifications & Sub proposals after plan scope reviews | null |
| 2.26 | Create buyout tracking log (verify any owner provided items and track) | null |
| 2.27 | Prepare public relations announcements (when applicable) | null |
| 2.28 | Create, record and track the NTO. Insert date reminder in Outlook | null |
| 2.29 | Mail Notice to Owner (Certified Mail/Return Receipt) | null |
| 2.30 | Verify Owner's purchase of Builder's Risk Insurance | null |
| 2.31 | Provide Superintendent with Project Safety Plan and SDS Notebook | null |
| 2.32 | Contact local Utilities and notify them of your project and services required | null |
| 2.33 | Consider a community awareness program if warranted | null |

#### Section 3: Order Services and Equipment (6 items)

| Item No. | Description | Default |
|----------|-------------|---------|
| 3.1 | Telephone and/or Internet (ordered/set up by the IT Department) | null |
| 3.2 | Sanitary | null |
| 3.3 | Field Office (ordered through the Main Office) | null |
| 3.4 | Job Office Trailer (Permit is required) | null |
| 3.5 | Order/Re-stock First Aid Kit & Purchase/Recharge fire extinguishers | null |
| 3.6 | Other | null |

#### Section 4: Permits Posted on Jobsite (12 items)

| Item No. | Description | Default |
|----------|-------------|---------|
| 4.1 | Master permit | null |
| 4.2 | Roofing permit | null |
| 4.3 | Plumbing permit | null |
| 4.4 | HVAC permit | null |
| 4.5 | Electric permit | null |
| 4.6 | Fire Alarm permit | null |
| 4.7 | Fire Sprinklers permit | null |
| 4.8 | Elevator permit | null |
| 4.9 | Irrigation permit | null |
| 4.10 | Low Voltage permit | null |
| 4.11 | Site-Utilities — Drainage, Water & Sewer permits | null |
| 4.12 | Any Right of way, FDOT, MOT plans, etc. | null |

> **Implementation note — Section 4 / Permits module handoff**: Items 4.1–4.12 represent startup verification that permits are posted on the jobsite. They are distinct from the Permits module (P3-E7), which tracks the full permit lifecycle (expiration, inspections, status). Marking a Section 4 item as `Yes` does NOT write to the Permits module ledger. The two surfaces are parallel and complementary.

---

## 2. Jobsite Safety Checklist (Startup Safety Readiness)

The Jobsite Safety Checklist is a startup-phase safety readiness assessment. It is a 32-item Pass/Fail/N/A form used before and during initial site mobilization. This form is **distinct from the Safety module's 93-item weighted ongoing inspection checklist** (P3-E8). The Startup module owns this form. The Safety module owns the ongoing weighted inspection checklist.

> **Important boundary rule**: This safety checklist assesses initial site conditions and readiness. It does NOT feed into the Safety module's inspection scoring or correction action log. Safety module executive review exclusion rules do NOT apply here. This checklist is subject to standard executive review annotation boundaries.

Source document description: *"Hedrick Brothers policies and Procedures require implementation of accident prevention programs that provide for frequent and regular inspection of the jobsites, materials, and equipment by designated competent persons."* Response values: Pass = Satisfactory; Fail = Unsatisfactory; N/A = Not Observed.

### 2.1 Safety Readiness Header (IJobsiteSafetyChecklist)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| checklistId | `string` | Yes | Yes | UUID generated on creation; immutable |
| projectId | `string` | Yes | No | FK to project record; one checklist per project |
| projectName | `string` | Yes | No | Inherited from project at creation |
| projectNumber | `string` | Yes | No | Inherited from project at creation |
| createdAt | `datetime` | Yes | Yes | Timestamp of checklist creation |
| createdBy | `string` | Yes | No | userId of creator |
| lastModifiedAt | `datetime` | Yes | Yes | Timestamp of most recent item edit |
| lastModifiedBy | `string` | No | No | userId of most recent editor |
| status | `enum` | Yes | Yes | Enum: `NotStarted` \| `InProgress` \| `Complete` \| `Archived` — same calculation logic as §1.1 |
| passCount | `number` | Yes | Yes | **Calculated**: count of items with result = Pass |
| failCount | `number` | Yes | Yes | **Calculated**: count of items with result = Fail |
| naCount | `number` | Yes | Yes | **Calculated**: count of items with result = NA |
| openFailsExist | `boolean` | Yes | Yes | **Calculated**: true if failCount > 0 and all Fail items do not have a remediation note |
| sections | `ISafetyReadinessSection[]` | Yes | No | Array of 2 section objects; array length is immutable |
| notes | `string` | No | No | Optional overall safety readiness notes |

### 2.2 Safety Readiness Section Model (ISafetyReadinessSection)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| sectionId | `string` | Yes | Yes | UUID; immutable |
| sectionNumber | `number` | Yes | No | 1 or 2; immutable |
| sectionTitle | `string` | Yes | No | Enum: `AreasOfHighestRisk` \| `OtherRisks` |
| itemCount | `number` | Yes | No | Section 1 = 4, Section 2 = 28 |
| items | `ISafetyReadinessItem[]` | Yes | No | Array of items in this section |

### 2.3 Safety Readiness Item Model (ISafetyReadinessItem)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| itemId | `string` | Yes | Yes | UUID; immutable |
| itemNumber | `string` | Yes | No | Section-prefixed, e.g., `1.1`, `2.14`; immutable |
| description | `string` | Yes | No | Verbatim item text; immutable |
| result | `enum \| null` | Yes | No | Enum: `Pass` \| `Fail` \| `NA` \| null — null = not yet assessed |
| remediationNote | `string` | No | No | Required if result = Fail; describes corrective action taken or planned |
| lastModifiedAt | `datetime` | No | Yes | Timestamp when result last changed |
| lastModifiedBy | `string` | No | No | userId of person who last set the result |

### 2.4 All Safety Readiness Items — Verbatim Reference

#### Section 1: Areas of Highest Risk (4 items)

| Item No. | Description |
|----------|-------------|
| 1.1 | Fall Exposures |
| 1.2 | Electrical Shocks |
| 1.3 | Struck by Risks |
| 1.4 | Crushed by Risks |

#### Section 2: Other Risks — These caused most injuries (28 items)

| Item No. | Description |
|----------|-------------|
| 2.1 | Blasting/Explosives |
| 2.2 | Concrete Construction |
| 2.3 | Cranes & Elevators |
| 2.4 | Demolition |
| 2.5 | Electrical |
| 2.6 | Excavation |
| 2.7 | Fire Protection |
| 2.8 | First Aid |
| 2.9 | Flammables |
| 2.10 | Floor & Wall Openings |
| 2.11 | Gases, Fumes, Dusts |
| 2.12 | General Safety |
| 2.13 | Hazard Communication |
| 2.14 | Housekeeping |
| 2.15 | Illumination |
| 2.16 | Lockout/tagout |
| 2.17 | Maintenance |
| 2.18 | Motor Vehicles |
| 2.19 | Noise Exposure |
| 2.20 | Personal Protection |
| 2.21 | Safety Training |
| 2.22 | Sanitation |
| 2.23 | Scaffolding |
| 2.24 | Signs, Signals, Barricades |
| 2.25 | Stairways & Ladders |
| 2.26 | Steel Erection |
| 2.27 | Tools |
| 2.28 | Welding & Cutting |

---

## 3. Responsibility Matrix

The Responsibility Matrix defines role-based task ownership for a project. It consists of two sheets: **PM** (project management roles) and **Field** (field supervision roles). The matrix is populated once per project at startup and can be updated as team assignments change.

### 3.1 Responsibility Matrix Header (IResponsibilityMatrix)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| matrixId | `string` | Yes | Yes | UUID; immutable |
| projectId | `string` | Yes | No | FK to project record; one matrix per project |
| projectName | `string` | Yes | No | Inherited from project |
| projectNumber | `string` | Yes | No | Inherited from project |
| matrixDate | `date` | Yes | No | Date the matrix was established or last formally updated |
| createdAt | `datetime` | Yes | Yes | Timestamp of matrix creation |
| createdBy | `string` | Yes | No | userId of creator |
| lastModifiedAt | `datetime` | Yes | Yes | Timestamp of most recent assignment change |
| pmRows | `IResponsibilityMatrixRow[]` | Yes | No | PM sheet rows; 84 task rows |
| fieldRows | `IResponsibilityMatrixRow[]` | Yes | No | Field sheet rows; 28 task rows |
| ownerContractRows | `IOwnerContractReviewRow[]` | No | No | Owner contract obligation rows (from Owner Contract Template) |

### 3.2 PM Sheet Roles Enum

The PM sheet has 9 role columns. Valid assignment values per cell are:

```typescript
enum PMRoleAssignment {
  Primary = 'X',
  Support = 'Support',
  SignOff = 'Sign-Off',
  Review = 'Review',
  None = null,
}
```

PM sheet roles (columns):

| Column | Role Code | Full Label |
|--------|-----------|-----------|
| 3 | PX | Project Executive |
| 4 | SrPM | Senior Project Manager (Sr. PM) |
| 5 | PM2 | Project Manager 2 (PM2) |
| 6 | PM1 | Project Manager 1 (PM1) |
| 7 | PA | Project Administrator |
| 8 | QAQC | QA/QC Manager |
| 9 | ProjAcct | Project Accountant |

> **Note**: The PM template also references a `SPM` (Senior PM) task category for some tasks that appear under SPM authority. The `SrPM` role column maps to `Sr. PM` in the source template.

### 3.3 Field Sheet Roles Enum

The Field sheet has 8 role columns. Valid assignment values per cell are the same as PM sheet (`X` / `Support` / `Sign-Off` / `Review` / null). Named assignments include first names per project.

Field sheet roles (columns):

| Column | Role Code | Full Label |
|--------|-----------|-----------|
| 4 | LeadSuper | Lead Superintendent |
| 5 | MEPSuper | MEP Superintendent |
| 6 | IntSuper | Interior/Envelope Superintendent |
| 7 | AsstSuper | Assistant Superintendent |
| 8 | QAQC | QA/QC (Field) |

### 3.4 Responsibility Matrix Row Model (IResponsibilityMatrixRow)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| rowId | `string` | Yes | Yes | UUID; immutable |
| taskCategory | `string` | Yes | No | Category label (e.g., `PX`, `SPM`, `PM 1`, `PA`, `Proj Acct`, `QAQC`, `Lead Super`, `MEP Super`, `Interior/ Envelope`); for display grouping only |
| taskDescription | `string` | Yes | No | Verbatim task text from source matrix |
| sheet | `enum` | Yes | No | Enum: `PM` \| `Field` |
| assignments | `IResponsibilityAssignment[]` | Yes | No | Array of role assignments for this row |

### 3.5 Role Assignment Model (IResponsibilityAssignment)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| assignmentId | `string` | Yes | Yes | UUID; immutable |
| roleCode | `string` | Yes | No | One of the role code enums from §3.2 or §3.3 |
| assignedPersonName | `string` | No | No | Specific person assigned to this role on this project; null if not yet assigned |
| assignedUserId | `string` | No | No | FK to user record; null if person not yet in system |
| value | `enum \| null` | Yes | No | Enum: `Primary` (`X`) \| `Support` \| `SignOff` \| `Review` \| null |

### 3.6 PM Task Category Reference

The following task categories appear in the PM sheet with their item counts as defined in the source template:

| Task Category | Item Count | Description |
|---------------|-----------|-------------|
| PX | 4 | Project Executive authority tasks (sign contracts, prime and sub COs, owner notices) |
| SPM | 14 | Senior PM operational tasks (change orders below $10K, SOV review, financials, meetings) |
| PM 2 | 11 | PM2 tasks (subcontract buyout, OAC meeting management, design center) |
| PM 1 / PM1 | 11 | PM1/2 tasks (RFIs, submittals, BIM, procurement log) |
| PA | 17 | Project Administrator tasks (RFIs, submittals, permits, drawings, meeting minutes) |
| QAQC | 5 | QA/QC Manager tasks (design coordination, field verification, inspections) |
| Proj Acct | 13 | Project Accountant tasks (billing, lien waivers, insurance, COI) |
| All / PM's | 5 | All PM team tasks (recurring deadlines — payroll, expense reports, financial reports) |

### 3.7 Field Task Category Reference

| Task Category | Item Count | Description |
|---------------|-----------|-------------|
| Lead Super | 10 | Overall job lead, schedule updates, site work, landscape, utilities, roads |
| MEP Super | 5 | MEP coordination, interiors, amenities, exterior lighting, site logistics |
| Interior / Envelope | 11 | Stucco, roofing, windows, painting, flooring, trim, window coverings, MEP trim-out |
| QAQC (Field) | 1 | Building envelope submittals and details review |

---

## 4. Owner Contract Review

The Owner Contract Review captures the project team's structured extraction of key contractual obligations from the executed Owner's contract. It is grounded in the `Responsibility Matrix - Owner Contract Template.xlsx`, which uses an Article/Page/Responsible Party/Description structure.

### 4.1 Owner Contract Review Header (IOwnerContractReview)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| reviewId | `string` | Yes | Yes | UUID; immutable |
| projectId | `string` | Yes | No | FK to project record; one review per project |
| contractDate | `date` | No | No | Date of the executed Owner's contract |
| contractType | `enum` | No | No | Enum: `AIADocs` \| `ConsensusDocs` \| `ConstructionManager` \| `CostPlusWithGMP` \| `CostPlusWithoutGMP` \| `LumpSum` \| `PurchaseOrder` \| `StipulatedSum` \| `TimeAndMaterial` |
| contractValue | `number` | No | No | Total executed owner contract value; currency in USD |
| uploadedContractFileId | `string` | No | No | FK to file storage record for the uploaded executed Owner's contract |
| createdAt | `datetime` | Yes | Yes | Timestamp of review creation |
| createdBy | `string` | Yes | No | userId of creator |
| lastModifiedAt | `datetime` | Yes | Yes | Timestamp of most recent row edit |
| rows | `IOwnerContractReviewRow[]` | Yes | No | Array of obligation rows |

### 4.2 Owner Contract Review Row Model (IOwnerContractReviewRow)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| rowId | `string` | Yes | Yes | UUID; immutable |
| article | `string` | No | No | Article reference from contract document (e.g., `Article 3.2`) |
| page | `string` | No | No | Page number or section reference in executed contract |
| responsibleParty | `string` | No | No | Role or person responsible for this obligation |
| description | `string` | Yes | No | Description of the contractual requirement or obligation |
| category | `enum` | No | No | Enum: `SpecialTerms` \| `LiquidatedDamages` \| `SplitSavings` \| `Allowances` \| `BondingRequirements` \| `InsuranceRequirements` \| `ScheduleMilestones` \| `PaymentTerms` \| `ChangeOrderAuthority` \| `Warranties` \| `Other` |
| flagForReview | `boolean` | Yes | No | Manual flag indicating this obligation requires active monitoring; default false |
| notes | `string` | No | No | Additional team notes on this obligation |

---

## 5. Project Management Plan

The Project Management Plan (PM Plan) is an 11-section structured document that the project team completes at startup. It captures project-specific commitments, team philosophy alignment, risk areas, and operational protocols. The module stores each section's content as structured fields where possible, and free-text where the section is narrative.

### 5.1 PM Plan Header (IProjectManagementPlan)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| planId | `string` | Yes | Yes | UUID; immutable |
| projectId | `string` | Yes | No | FK to project record; one PM Plan per project |
| projectName | `string` | Yes | No | Inherited from project |
| projectNumber | `string` | Yes | No | Inherited from project |
| submittedBy | `string` | No | No | Name of PM submitting the plan |
| approvedBy | `string` | No | No | Name of PX approving the plan |
| submittedByUserId | `string` | No | No | FK to user record |
| approvedByUserId | `string` | No | No | FK to user record |
| planDate | `date` | No | No | Date plan was approved and signed |
| status | `enum` | Yes | No | Enum: `Draft` \| `Submitted` \| `Approved` \| `Archived` |
| lastModifiedAt | `datetime` | Yes | Yes | Timestamp of most recent edit |
| createdAt | `datetime` | Yes | Yes | Timestamp of plan creation |
| teamSignatures | `IPlanTeamSignature[]` | No | No | Array of project team members who have signed the plan |
| distributionResidential | `string[]` | No | No | Distribution list for residential market (names) |
| distributionCommercial | `string[]` | No | No | Distribution list for commercial market (names) |
| sections | `IPMPlanSection[]` | Yes | No | Array of 11 section objects; array length is immutable |

### 5.2 Team Signature Model (IPlanTeamSignature)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| signatureId | `string` | Yes | Yes | UUID; immutable |
| memberName | `string` | Yes | No | Name of signing team member |
| role | `string` | Yes | No | Project role of signing member |
| signedAt | `datetime` | No | No | Timestamp of signature; null if not yet signed |
| userId | `string` | No | No | FK to user record |

### 5.3 PM Plan Section Model (IPMPlanSection)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| sectionId | `string` | Yes | Yes | UUID; immutable |
| sectionNumber | `number` | Yes | No | 1–11 (Roman numeral equivalent: I–XI); immutable |
| sectionTitle | `string` | Yes | No | Verbatim section title (see §5.4 enumeration); immutable |
| content | `string` | No | No | Free-text content for narrative sections |
| structuredFields | `IPMPlanSectionField[]` | No | No | Array of typed structured fields for sections that have them (see §5.5) |
| isComplete | `boolean` | Yes | No | Manual indicator that the section has been reviewed and completed |
| completedAt | `datetime` | No | No | Timestamp when section was marked complete |
| completedBy | `string` | No | No | userId of person who marked section complete |

### 5.4 PM Plan Section Enumeration

| Section No. | Title | Field Capture Mode |
|-------------|-------|-------------------|
| I | Project Team Philosophy | Narrative (GRIT values) |
| II | Quality Control | Narrative + structured (Punch List Manager field) |
| III | Preconstruction Meeting | Narrative + structured date |
| IV | Safety | Structured fields + narrative |
| V | Maintaining Cost Control | Structured fields (contract amount, risk areas, savings areas) |
| VI | Project Schedule | Structured date fields + narrative |
| VII | Project Team Members Responsibilities | Narrative reference to Responsibility Matrix |
| VIII | Project Site Management | Structured subsections (Superintendent's Project Plan items) |
| IX | Project Administration | Narrative |
| X | Project Closeout | Narrative reference to Project Closeout module |
| XI | Attachments to Be Included | Checklist of required attachments |

### 5.5 Structured Section Fields (IPMPlanSectionField)

For sections that have specific required data points (as opposed to pure narrative), individual fields are captured in structured form:

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Business Rule / Formula |
|------------------------|-----------------|----------|------------|------------------------|
| fieldId | `string` | Yes | Yes | UUID; immutable |
| fieldKey | `string` | Yes | No | Machine-readable key; used for display and query |
| fieldLabel | `string` | Yes | No | Human-readable label (verbatim from PM Plan template) |
| fieldType | `enum` | Yes | No | Enum: `Text` \| `Number` \| `Date` \| `Currency` \| `Boolean` \| `Enum` \| `LongText` |
| value | `string \| number \| boolean \| Date \| null` | No | No | The field's current value; null until set |
| sectionNumber | `number` | Yes | No | Section this field belongs to |

### 5.6 Key Structured Fields by Section

#### Section IV (Safety)

| fieldKey | fieldLabel | fieldType |
|----------|-----------|-----------|
| safetyOfficerName | Project Safety Officer Assigned Name | Text |
| safetyOfficerRole | Safety Officer Role / Title | Text |
| safetyGoals | Safety Goals (project-specific) | LongText |
| safetyConcerns | Safety Concerns to be addressed | LongText |

#### Section V (Maintaining Cost Control)

| fieldKey | fieldLabel | fieldType |
|----------|-----------|-----------|
| contractAmount | This contract is based on a contract in the amount of | Currency |
| buyoutOpportunities | Areas of potential buy out | LongText |
| costRiskAreas | Areas of potential risks | LongText |
| costSavingsAreas | Areas of potential savings | LongText |

#### Section VI (Project Schedule)

| fieldKey | fieldLabel | fieldType |
|----------|-----------|-----------|
| projectStartDate | Project start date | Date |
| substantialCompletionDate | Project Substantial Completion Date (per contract) | Date |
| noticeToProceedDate | Notice to Proceed issued date | Date |
| noticeOfCommencementDate | Notice of Commencement recorded date | Date |
| noticeOfCommencementExpiration | Notice of Commencement expiration date | Date |
| goalSubstantialCompletionDate | Team goal — Substantial Completion by | Date |
| goalFinalCompletionDate | Team goal — Final Completion by | Date |
| liquidatedDamagesPerDay | Liquidated damages per day (if applicable) | Currency |
| criticalPathConcerns | Critical Path concerns identified | LongText |

#### Section VIII (Project Site Management)

| fieldKey | fieldLabel | fieldType |
|----------|-----------|-----------|
| safetyPlan | Safety (site management approach) | LongText |
| utilityServiceIssues | Utility and Service Issues | LongText |
| trafficPedestrianConsiderations | Traffic and Pedestrian Considerations | LongText |
| siteSecurity | Site Security and Visitor Check-in | LongText |
| dustErosionControl | Dust Control & Erosion | LongText |
| noiseControlHours | Noise Control and Working Hours | LongText |
| siteMaintenance | Site Maintenance | LongText |
| existingSiteConditions | Existing Site Conditions | LongText |
| permitsOnSite | Permits | LongText |
| siteWorkIssues | Site Work Issues & Concerns | LongText |

#### Section XI (Attachments to Be Included)

The source template defines a fixed attachments checklist grouped into three categories (Project Management, Project Administration, Quality & Safety). Each attachment item is treated as a boolean flag.

| fieldKey | fieldLabel | fieldType |
|----------|-----------|-----------|
| attachEstimate | Estimate | Boolean |
| attachQualifications | Qualifications | Boolean |
| attachPhasingPlan | Phasing Plan (if applicable) | Boolean |
| attachLogisticsPlan | Logistics Plan | Boolean |
| attachConstructionSchedule | Construction Schedule | Boolean |
| attachProjectBudget | Project Budget (from Procore Budget) | Boolean |
| attachScheduleOfValues | Schedule of Values | Boolean |
| attachIDSRequirements | IDS Requirements | Boolean |
| attachResponsibilityMatrix | Responsibility Matrix | Boolean |
| attachWhoToContact | List of Who to Contact | Boolean |
| attachMeetingAgendaTemplates | Meeting Agenda Templates (in Procore) | Boolean |
| attachPayAppProcedures | Pay App Procedures (Subcontractor & Owner) | Boolean |
| attachHurricanePlan | Hurricane & Tropical Storm Preparedness Plan | Boolean |
| attachCrisisManagementPlan | Crisis Management & Ice Response Plans | Boolean |
| attachLessonsLearnedReport | Lessons Learned Report | Boolean |
| attachSubScorecards | Subcontractor Scorecards | Boolean |
| attachStartupChecklist | Startup Checklist with Assignment (Procore Inspections) | Boolean |
| attachSubmittalRegister | Submittal Register | Boolean |
| attachCloseoutProcedureGuide | Closeout Procedure Guide | Boolean |
| attachCompletionAcceptanceManual | Completion & Acceptance Manual | Boolean |
| attachCloseoutPreCOChecklist | Closeout & Pre-CO Checklist (Procore Inspections) | Boolean |
| attachSafetyStartupProcess | Safety – Project Startup Process | Boolean |
| attachProjectSpecificSafetyPlan | Project Specific Safety Plan | Boolean |
| attachQualityControlProgram | Quality Control Program | Boolean |

---

## 6. Procore Project Setup Reference

The Procore Startup Checklist Summary defines required Procore Admin section fields and Prime Contract tab entries. These are not stored as operational records in HB Intel — they are reference data that the module surfaces as a setup guide. The module displays these as a read-only reference checklist and does not attempt to write to or sync with Procore directly (Procore integration is a separate workstream concern).

### 6.1 Procore Admin Fields Reference (IProCoreSetupReference)

| Field Name (camelCase) | TypeScript Type | Notes |
|------------------------|-----------------|-------|
| projectName | `string` | If different from job number name |
| totalValue | `number` | Actual owner contract value — not an estimate; update with final data at project close |
| startDate | `date` | Actual scheduled start date; update with actual at project close |
| completionDate | `date` | Estimated completion date; update with actual at project close |
| projectType | `string` | Market sector from Procore dropdown |
| squareFeet | `number` | Total project square footage |
| description | `string` | Concise and accurate project description with unit counts, building types, square footage |
| projectLocation | `string` | Project address |
| office | `string` | Procore office assignment |

### 6.2 Prime Contract Tab Reference

Required entries in Procore's Prime Contract tab (reference checklist, not synced):

- Upload executed Owner's Contract
- Complete Contract Dates
- Add Architect/Engineer
- Add Description

### 6.3 Contract and Delivery Method Reference Enums

These enums are used for the `contractType` field in §4.1 (Owner Contract Review) and for Procore setup metadata:

```typescript
enum ContractType {
  AIADocs = 'AIA Docs',
  ConsensusDocs = 'Consensus Docs',
  ConstructionManager = 'Construction Manager',
  CostPlusWithGMP = 'Cost Plus with GMP',
  CostPlusWithoutGMP = 'Cost Plus without GMP',
  LumpSum = 'Lump Sum',
  PurchaseOrder = 'Purchase Order',
  StipulatedSum = 'Stipulated Sum',
  TimeAndMaterial = 'Time & Material',
}

enum DeliveryMethod {
  ConstructionManager = 'Construction Manager',
  DesignBuild = 'Design Build',
  FastTrack = 'Fast Track',
  GeneralContractor = 'General Contractor',
  OwnersRepresentative = 'Owners Representative',
  P3 = 'P3',
  Preconstruction = 'Preconstruction',
  ProgramManager = 'Program Manager',
}
```

---

## 7. Business Rules

### 7.1 Module Lifecycle Rules

- The Project Startup module is created automatically when a new project is created in Project Hub.
- One instance of each sub-surface (startup checklist, safety readiness checklist, responsibility matrix, owner contract review, PM plan) exists per project.
- Sub-surfaces can be edited in parallel — no sequential dependency between them.
- The module does not have a single top-level "completion" gate. Each sub-surface tracks its own status independently.
- The module status displayed at the project level is determined by the composite status of all sub-surfaces (see §7.2).

### 7.2 Module-Level Composite Status

```typescript
enum StartupModuleStatus {
  NotStarted = 'NotStarted',     // All sub-surfaces are in NotStarted or no items answered
  InProgress = 'InProgress',     // At least one sub-surface has been started
  Complete = 'Complete',         // All five sub-surfaces are marked complete or approved
  Archived = 'Archived',         // Manually archived
}
```

Composite calculation:
- `NotStarted`: no sub-surface has been touched
- `InProgress`: ≥1 sub-surface is InProgress or further
- `Complete`: ALL of the following are true:
  - `IStartupChecklist.status === 'Complete'`
  - `IJobsiteSafetyChecklist.status === 'Complete'`
  - `IResponsibilityMatrix` exists and has ≥1 PM row with an assignment
  - `IOwnerContractReview` exists and has ≥1 row
  - `IProjectManagementPlan.status === 'Approved'`

### 7.3 Immutable Fields

The following fields are set on creation and MUST NOT be editable by any user role after creation:

- `checklistId`, `matrixId`, `reviewId`, `planId` on all header records
- `itemNumber` and `description` on all checklist item records
- `sectionNumber` and `sectionTitle` on all section records
- `sheet` on all `IResponsibilityMatrixRow` records
- `taskDescription` on all `IResponsibilityMatrixRow` records (task text is verbatim from template)

### 7.4 Section 4 / Permits Module Non-Interference Rule

The Job Startup Checklist Section 4 items (Permits Posted on Jobsite, items 4.1–4.12) track whether specific permits are posted on the jobsite at startup. These items have NO write relationship to the Permits module (P3-E7). The Permits module manages the full permit lifecycle independently. A `Yes` result on a Section 4 checklist item does not create, update, or close a permit record in P3-E7.

The reverse is also true: permit status in P3-E7 does NOT auto-update Section 4 checklist item results.

These two surfaces are parallel and complementary. They may be visually cross-referenced in the UI (e.g., displaying the current permit status from P3-E7 alongside the Section 4 item), but they MUST remain operationally independent in the data model.

### 7.5 Jobsite Safety Checklist / Safety Module Non-Interference Rule

The Jobsite Safety Checklist (§2) is a startup-phase readiness check owned by the Project Startup module. It has NO write relationship to the Safety module (P3-E8). The Safety module's 93-item weighted ongoing inspection checklist, corrective action log, and incident reports are entirely separate records.

- The Jobsite Safety Checklist is NOT subject to the Safety module's executive review exclusion rule.
- The Jobsite Safety Checklist DOES support executive review annotations via the standard `@hbc/field-annotations` artifact (consistent with all other Project Startup sub-surfaces).
- A `Fail` result on a Jobsite Safety Checklist item does NOT create a corrective action in the Safety module.

### 7.6 Responsibility Matrix Persistence

- The PM Plan (§5) references the Responsibility Matrix for Section VII content. The PM Plan section VII `content` field should reference the `IResponsibilityMatrix.matrixId` rather than duplicating its data.
- The Responsibility Matrix is designed to be project-specific: roles are assigned by name at startup and updated as team changes occur.
- Task descriptions are verbatim from the template and MUST NOT be edited. New project-specific task rows MAY be added to the matrix under a `Custom` task category.

### 7.7 PM Plan Approval Flow

```
Draft → Submitted → Approved → (Archived)
```

- `Draft`: plan is being completed
- `Submitted`: PM has submitted for PX review; no further PM editing without reverting to Draft
- `Approved`: PX has approved; plan is locked for standard editing
- Any modification to an `Approved` plan creates a new revision and reverts to `Draft` for the modified sections

---

## 8. Spine Publication

All Project Startup sub-surfaces publish to the standard four spine surfaces. Spine writes are read-only from the receiving spine — the Project Startup module is the source of truth for all fields below.

### 8.1 Activity Spine

| Trigger | Activity Type | Payload |
|---------|--------------|---------|
| Any checklist item result set or changed | `StartupChecklistItemUpdated` | itemNumber, description, result, changedBy |
| Any safety readiness item result set | `SafetyReadinessItemUpdated` | itemNumber, description, result, changedBy |
| PM Plan status changes to `Approved` | `PMPlanApproved` | planId, approvedBy, approvedAt |
| Startup module composite status changes to `Complete` | `StartupModuleComplete` | projectId, completedAt |
| Any Responsibility Matrix assignment changed | `ResponsibilityMatrixUpdated` | roleCode, taskDescription, oldValue, newValue, changedBy |

### 8.2 Health Spine

| Metric | Calculation |
|--------|------------|
| `startupChecklistCompletion` | `IStartupChecklist.completionPercentage` |
| `safetyReadinessOpenFails` | `IJobsiteSafetyChecklist.failCount` where items have no remediation note |
| `pmPlanStatus` | `IProjectManagementPlan.status` |
| `responsibilityMatrixAssigned` | Boolean: `true` if ≥1 PM role and ≥1 Field role has a named assignee |
| `startupModuleStatus` | Composite status from §7.2 |

### 8.3 Work Queue Spine

Items appear in the Work Queue when:

| Condition | Work Queue Item Label |
|-----------|----------------------|
| `IJobsiteSafetyChecklist.openFailsExist === true` | "Open safety readiness fails require remediation notes" |
| `IStartupChecklist.status === 'NotStarted'` and project is >7 days old | "Job startup checklist not yet started" |
| `IProjectManagementPlan.status === 'Draft'` and project is >14 days old | "Project Management Plan awaiting submission" |
| `IProjectManagementPlan.status === 'Submitted'` and >7 days since submission | "Project Management Plan awaiting PX approval" |

### 8.4 Related Items Spine

The following cross-module references are surfaced in Related Items:

| Related Module | Relationship |
|----------------|-------------|
| Permits (P3-E7) | Section 4 permit items cross-reference active permits in the Permits module |
| Safety (P3-E8) | Jobsite Safety Checklist links to the Safety module's ongoing inspection log |
| Project Closeout (P3-E10) | PM Plan Section X links to the Project Closeout module |
| Financial (P3-E4) | PM Plan Section V (cost control) links to the Financial module |
| Schedule (P3-E5) | PM Plan Section VI (schedule) links to the Schedule module |

---

## 9. Access and Role Permissions

| Role | Read | Edit — Checklists | Edit — RM | Edit — PM Plan | Approve PM Plan | Annotate |
|------|------|-------------------|-----------|----------------|-----------------|----------|
| PX (Project Executive) | Yes | Yes | Yes | Yes | Yes | Yes |
| Sr. PM / PM2 / PM1 | Yes | Yes | Yes | Yes | No | Yes |
| PA (Project Administrator) | Yes | Yes | No | No | No | Yes |
| QAQC | Yes | Yes | No | No | No | Yes |
| Safety Manager | Yes | Safety checklist only | No | No | No | Yes |
| Project Accountant | Yes | No | No | No | No | Yes |
| Field Superintendent | Yes | Section 4 / Safety checklist only | Field RM sheet only | No | No | No |
| Read-Only | Yes | No | No | No | No | No |

**Annotation boundary**: Executive review annotations use the standard `@hbc/field-annotations` artifact. Annotations MUST NOT write to the operational records of any Project Startup sub-surface. This is consistent with all other modules that support executive review.

---

## 10. Related Specifications

| Document | Relationship |
|----------|-------------|
| P3-E1 §3.10 | Module classification matrix entry for Project Startup |
| P3-E2 §13 | Source-of-truth and action-boundary matrix for Project Startup |
| P3-E3 §9.7 | Replacement notes for source files now owned by this module |
| P3-E4 | Financial module — cross-referenced in PM Plan Section V |
| P3-E5 | Schedule module — cross-referenced in PM Plan Section VI |
| P3-E7 | Permits module — Section 4 checklist boundary rule (§7.4) |
| P3-E8 | Safety module — Jobsite Safety Checklist boundary rule (§7.5) |
| P3-E10 | Project Closeout module — PM Plan Section X cross-reference |
