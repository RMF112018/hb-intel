# W0-G2-T02 — Startup, Kickoff, and Handoff Data Model

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 2 task plan for the Startup / Kickoff / Handoff workflow family. Defines the list schemas, parent/child structures, seeded files, and cross-family references for all startup-phase workflows. Governed by T01 schema standards.

**Phase Reference:** Wave 0 Group 2 — Backend Hardening and Workflow Data Foundations Plan
**Depends On:** T01 (schema standards and PID contract)
**Unlocks:** T07 (provisioning saga step 4 extension for startup lists), T09 (startup list tests)
**Source Materials:** `Job Startup Checklist.pdf`, `Procore Startup Checklist Summary.pdf`, `Estimating Kickoff.xlsx`, `HB Internal Responsibility Matrix - Template.xlsx`, `PROJECT MANAGEMENT PLAN 2019.docx`
**ADR Output:** Contributes to ADR-0115 (G2 list schema decisions)

---

## Objective

Define the complete data model for the Startup / Kickoff / Handoff workflow family. This plan specifies every SharePoint list that will be provisioned for this family on every project site, the field schema for each list, the parent/child relationships where applicable, seeded file decisions, and cross-family references.

The output of this plan directly feeds T07's provisioning saga updates and T09's test expectations. Implementors building Step 4 extensions for this family must not invent field schemas — they must implement what this plan specifies.

---

## Why This Task Exists

Project startup is one of the most operationally critical phases in construction management. Multiple workflows converge at project initiation: contract review, Procore setup, budget transfer, permit applications, team assignment, and the kickoff meeting itself. Currently, these workflows are managed through a combination of PDF checklists, Excel templates, and Procore configuration — no structured list exists to track startup progress, capture kickoff decisions, or record handoff states for the intelligence platform.

Without a backing data structure:
- Startup completion cannot be queried or reported across projects
- The estimating-to-operations handoff has no structured representation
- The responsibility matrix — which defines who owns what on each project — is locked in a file
- Wave 1 features (e.g., a Project Hub startup status surface) have no list to build against

T02 creates the structural foundation that makes these Wave 1 features possible.

---

## Scope

T02 covers:

1. The Startup Checklist (parent/child structure)
2. The Estimating Kickoff and Responsibility Matrix
3. The Procore Startup tracking posture (reference file only)
4. The Project Management Plan posture (reference file only)
5. Cross-family references to Financial, Safety, and Project Controls

T02 does not cover:

- The Project Setup request form itself (governed by MVP Project Setup plan set)
- Provisioning saga implementation (T07)
- Test implementation (T09)
- Any UI form or Wave 1 feature for entering startup data

---

## Governing Constraints

- **T01 §1 (PID contract):** Every list in this family must include `pid` as a required indexed field with `defaultValue: status.projectNumber`
- **T01 §2 (Mandatory fields):** Every list must include `pid`, `Title`, `Status`
- **T01 §4 (Parent/child rules):** Startup Checklist and Estimating Kickoff are confirmed parent/child structures
- **T01 §6.1 (Seeded-file classification):** Applied to each workflow per §4 below
- **G1 T01 (Core lists):** Daily Reports and Meeting Minutes are core-owned; T02 does not recreate them
- **G2 Decision G2-3 (Cross-family ownership):** T02 owns startup workflows exclusively; Financial and Safety families reference T02 records, not duplicate them

---

## 1. Workflow Classification Summary

| Workflow | Classification | Lists Created | Seeded Files |
|---------|--------------|--------------|-------------|
| Job Startup Checklist | **Seed now** | `Startup Checklist`, `Startup Checklist Items` | Seeded from `Job Startup Checklist.pdf` → reference copy |
| Estimating Kickoff / Responsibility Matrix | **Seed now** | `Estimating Kickoff Log`, `Kickoff Responsibility Items` | `Estimating Kickoff.xlsx` template seeded to Project Documents |
| Internal Responsibility Matrix | **Seed now** | `Project Responsibility Matrix` | `HB Internal Responsibility Matrix - Template.xlsx` seeded to Project Documents |
| Procore Startup Setup | **Reference file only** | — | `Procore Startup Checklist.pdf` reference copy seeded |
| Project Management Plan | **Reference file only** | — | `Project Management Plan Template.docx` seeded to Project Documents |

---

## 2. List Schemas

### 2.1 Startup Checklist (Parent List)

**Title:** `Startup Checklist`
**Description:** Master startup checklist record for the project. Each project has one startup checklist instance.
**Template:** 100 (Generic List)
**Provisioning:** Created by Step 4 for every project site

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Checklist Title | Text | Yes | Display name, e.g., "25-001-01 Startup Checklist" |
| `Status` | Status | Choice | Yes | `Open | In Progress | Complete` |
| `ProjectManager` | Project Manager | User | No | PM assigned to the project |
| `ProjectExecutive` | Project Executive | User | No | PX assigned |
| `Superintendent` | Superintendent | User | No | Superintendent assigned |
| `ContractDate` | Contract Date | DateTime | No | Date of executed contract |
| `ProjectStartDate` | Project Start Date | DateTime | No | Expected construction start |
| `ProcoreProjectId` | Procore Project ID | Text | No | Procore project number if applicable |
| `Department` | Department | Choice | Yes | `commercial | luxury-residential` (mirrors `ProjectDepartment` from G1 T01) |
| `Notes` | Notes | MultiLineText | No | Free-form notes |

### 2.2 Startup Checklist Items (Child List)

**Title:** `Startup Checklist Items`
**Description:** Individual checklist items for the project startup checklist. Each item belongs to one Startup Checklist parent record.
**Template:** 100
**Provisioning:** Created by Step 4 for every project site

**Source material:** `Job Startup Checklist.pdf` (Procore inspection template). Sections: Review Owner's Contract, Job Start-up, Order Services & Equipment, Permits Posted on Jobsite.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Item Name | Text | Yes | The checklist item description |
| `ParentRecord` | Startup Checklist | Lookup | Yes | `lookupListTitle: Startup Checklist`, `lookupFieldName: ID` |
| `Category` | Category | Choice | Yes | `Contract Review | Job Setup | Services & Equipment | Permits | Procore Setup | Other` |
| `Status` | Status | Choice | Yes | `N/A | Open | Complete` |
| `AssignedTo` | Assigned To | User | No | Person responsible for completing this item |
| `DueDate` | Due Date | DateTime | No | |
| `CompletedDate` | Completed Date | DateTime | No | |
| `Notes` | Notes | MultiLineText | No | |

**Seeding note for Startup Checklist Items:** Because this is a parent/child structure, and the startup checklist items are well-defined by the `Job Startup Checklist.pdf`, G2 **may** seed the child list with pre-defined checklist item rows at provisioning time. This is an advanced seeding operation: rather than just creating empty lists, Step 4 would insert a set of default item records into the child list post-creation.

**Decision on pre-seeded items:** This seeding operation adds complexity to Step 4 (it requires list item creation in addition to list structure creation). T07 must evaluate whether pre-seeding default checklist items is in scope for Wave 0 or should be deferred to a Wave 1 feature. If deferred, the child list exists empty, and a Wave 1 feature populates it from a template. **T07 must make this decision explicit.** This plan flags it as an **unresolved seeding decision** that T07 must resolve.

---

### 2.3 Estimating Kickoff Log (Parent List)

**Title:** `Estimating Kickoff Log`
**Description:** Records the estimating kickoff meeting and project handoff from estimating to operations.
**Template:** 100
**Provisioning:** Created by Step 4 for every project site

**Source material:** `Estimating Kickoff.xlsx` — project information header, responsibility assignments, budget structure.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Kickoff Record Title | Text | Yes | E.g., "25-001-01 Estimating Kickoff" |
| `Status` | Status | Choice | Yes | `Scheduled | In Progress | Complete` |
| `KickoffDate` | Kickoff Date | DateTime | No | Date of estimating kickoff meeting |
| `EstimatingLead` | Estimating Lead | User | No | Lead estimator |
| `OperationsLead` | Operations Lead | User | No | PM taking over from estimating |
| `ContractType` | Contract Type | Choice | No | `Lump Sum | GMP | Cost Plus | CM | Other` |
| `BudgetTransferred` | Budget Transferred | Boolean | No | Whether Procore budget was transferred |
| `ScheduleReceived` | Schedule Received | Boolean | No | Whether baseline schedule was received |
| `DrawingsTransferred` | Drawings Transferred | Boolean | No | Whether drawing set was transferred |
| `Notes` | Notes | MultiLineText | No | |

### 2.4 Kickoff Responsibility Items (Child List)

**Title:** `Kickoff Responsibility Items`
**Description:** Individual task/responsibility assignments from the estimating kickoff matrix.
**Template:** 100
**Provisioning:** Created by Step 4 for every project site

**Source material:** `HB Internal Responsibility Matrix - Template.xlsx` — task categories include RFI Management, Submittal Tracking, Change Order Processing, Budget Management, Schedule Management, Safety Compliance, Quality Control, Subcontractor Management.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Task / Responsibility | Text | Yes | The task name from the responsibility matrix |
| `ParentRecord` | Kickoff Record | Lookup | Yes | `lookupListTitle: Estimating Kickoff Log`, `lookupFieldName: ID` |
| `Category` | Category | Choice | Yes | `Owner Notices | RFI | Submittal | Change Order | Budget | Schedule | Safety | Quality | Subcontractor | Other` |
| `PrimaryOwner` | Primary Owner | User | No | Person with primary responsibility |
| `SupportOwner` | Support Owner | User | No | Person with support responsibility |
| `Status` | Status | Choice | Yes | `Open | Acknowledged | Complete` |
| `Notes` | Notes | MultiLineText | No | |

---

### 2.5 Project Responsibility Matrix (Flat List)

**Title:** `Project Responsibility Matrix`
**Description:** Role and responsibility assignments for the project team. Flat list (not parent/child) because this is a single reference table for the project, not a log of repeated instances.
**Template:** 100
**Provisioning:** Created by Step 4 for every project site

**Source material:** `HB Internal Responsibility Matrix - Template.xlsx` — PM sheet and Field sheet with X (primary) and Support designations.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Role / Responsibility | Text | Yes | E.g., "RFI Management", "Budget Forecasting" |
| `Category` | Category | Choice | Yes | `Project Management | Field | Safety | Quality | Finance | Executive` |
| `PrimaryRole` | Primary Role | Choice | No | `PX | Sr. PM | PM | PA | Superintendent | Safety | QAQC | Other` |
| `PrimaryPerson` | Primary Person | User | No | Person with primary responsibility |
| `SupportPerson` | Support Person | User | No | Person with support role |
| `Notes` | Notes | Text | No | |

---

## 3. Seeded File Specifications

### 3.1 Estimating Kickoff Template
- **File name:** `Estimating Kickoff Template.xlsx`
- **Target library:** `Project Documents`
- **Asset path:** `backend/functions/src/assets/templates/Estimating Kickoff Template.xlsx`
- **Source:** Derived from `Estimating Kickoff.xlsx` business artifact — strip project-specific data, leave structure and headers
- **Purpose:** Pre-populated Excel template for project managers to use during estimating kickoff meeting until the `Estimating Kickoff Log` list is operational in a Wave 1 feature

### 3.2 Internal Responsibility Matrix Template
- **File name:** `Responsibility Matrix Template.xlsx`
- **Target library:** `Project Documents`
- **Asset path:** `backend/functions/src/assets/templates/Responsibility Matrix Template.xlsx`
- **Source:** Derived from `HB Internal Responsibility Matrix - Template.xlsx`
- **Purpose:** Working template during transition; the `Project Responsibility Matrix` list will eventually replace this

### 3.3 Project Management Plan Template
- **File name:** `Project Management Plan Template.docx`
- **Target library:** `Project Documents`
- **Asset path:** `backend/functions/src/assets/templates/Project Management Plan Template.docx`
- **Source:** Derived from `PROJECT MANAGEMENT PLAN 2019.docx` — strip project-specific data, leave structure, headers, and GRIT framework
- **Classification:** Reference file only — no backing list

### 3.4 Procore Startup Reference
- **File name:** `Procore Startup Checklist Reference.pdf`
- **Target library:** `Project Documents`
- **Asset path:** `backend/functions/src/assets/templates/Procore Startup Checklist Reference.pdf`
- **Source:** `Procore Startup Checklist Summary.pdf` — retain as a reference document (Procore configuration is out of G2 scope)
- **Classification:** Reference file only — no backing list (Procore data is in Procore, not HB Intel lists)

---

## 4. Cross-Family References

### 4.1 → Financial Family (T06)

The Estimating Kickoff is the handoff point from estimating to operations. The Financial family's buyout process begins immediately after kickoff. Cross-reference pattern:
- The `Estimating Kickoff Log` parent record stores a `ContractType` field and a `BudgetTransferred` boolean
- The Financial family's `Buyout Log` parent record (T06) stores a `KickoffComplete` boolean and may reference the kickoff date from T02's list via `pid`
- **No duplication of records** — the Buyout Log references the kickoff by `pid`, not by copying kickoff fields

### 4.2 → Safety Family (T04)

The Startup Checklist includes a "Site Specific Safety Plan" item (see `Job Startup Checklist.pdf` — safety plan submission, OSHA 300 log review). Cross-reference pattern:
- Startup Checklist Item: "Site Specific Safety Plan submitted" → `Status: Complete` when T04's `Site Safety Plan` list record is created
- The Safety family owns the site safety plan record; the Startup family has a checklist item that points to it
- **Ownership rule:** T04 owns the safety plan data; T02 has a trigger/completion item for it

### 4.3 → Project Controls Family (T05)

The Startup Checklist includes permit application items (from `Job Startup Checklist.pdf`: permits listed by trade). Cross-reference pattern:
- Startup Checklist Item: "Master permit application submitted" → `Status: Complete` when T05's `Permit Log` records the master permit
- T05 owns the permit records; T02 has startup checklist items that reference permit milestones
- **Ownership rule:** T05 owns permit data; T02 has a trigger/completion item for initial permit application

---

## 5. Acceptance Criteria

- [ ] `Startup Checklist` list schema is fully specified (all fields, types, required status, `pid` included)
- [ ] `Startup Checklist Items` list schema is fully specified (parent/child structure with lookup column specified)
- [ ] Pre-seeded item decision is resolved and documented in T07 (deferred or in-scope)
- [ ] `Estimating Kickoff Log` list schema is fully specified
- [ ] `Kickoff Responsibility Items` list schema is fully specified
- [ ] `Project Responsibility Matrix` list schema is fully specified
- [ ] All seeded files are named and asset paths specified (4 files: Estimating Kickoff Template, Responsibility Matrix Template, Project Management Plan Template, Procore Startup Checklist Reference)
- [ ] Cross-family references to Financial, Safety, and Project Controls are documented
- [ ] No T02 list duplicates a field or record type owned by T04, T05, or T06
- [ ] All lists include `pid` with `defaultValue: projectNumber` and `indexed: true`
- [ ] All Status choice fields use T01 §3.3 standard patterns

---

## 6. Known Risks and Pitfalls

**Risk T02-R1: Pre-seeded checklist item rows create test complexity.** If T07 decides to pre-seed default checklist items, every T09 test must verify both list structure and list item content. This doubles the verification surface for startup lists. The pre-seeded item decision should be made before T09 test cases are written.

**Risk T02-R2: `Department` choice on Startup Checklist must stay in sync with `ProjectDepartment` type.** If the `ProjectDepartment` type is expanded (e.g., to include `mixed-use`), the `Department` choice field on `Startup Checklist` must be updated. This is a known risk of storing a department choice in a list column — it is not automatically synchronized with the TypeScript type union.

**Risk T02-R3: The Project Management Plan template may require legal or IP review before seeding.** The `PROJECT MANAGEMENT PLAN 2019.docx` artifact contains HBC-specific proprietary content. Before creating a seeded template version, confirm that distributing a redacted version to all project sites is acceptable. If not, reclassify as "future feature target" and remove from the seeded file manifest.

**Risk T02-R4: Estimating Kickoff may be premature for list capture.** The `Estimating Kickoff.xlsx` artifact is operationally rich and complex. If the PM team does not see immediate value in the list version (they use the Excel for the meeting), the list may sit empty for Wave 0 and Wave 1. Consider whether "list only" is premature and "future feature target" is more appropriate. However, given that estimating handoff data is a high-value Wave 1 intelligence input, the "seed now" classification is appropriate — preserve the classification but document the empty-list expectation.

---

## Follow-On Consumers

- **T07:** Adds `Startup Checklist`, `Startup Checklist Items`, `Estimating Kickoff Log`, `Kickoff Responsibility Items`, and `Project Responsibility Matrix` to the Step 4 list provisioning extension; adds seeded file entries to `template-file-manifest.ts`
- **T09:** Tests for presence and correct structure of all 5 T02 lists; tests seeded files presence
- **Wave 1 Project Hub:** The `Startup Checklist` and `Estimating Kickoff Log` are the primary Wave 1 data sources for startup status surfaces in the Project Hub SPFx webpart
- **Wave 1 Estimating App:** `Estimating Kickoff Log` and `Kickoff Responsibility Items` are target data sources for the estimating handoff workflow in `apps/estimating`

---

*End of W0-G2-T02 — Startup, Kickoff, and Handoff Data Model v1.0*
