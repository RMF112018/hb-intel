# W0-G2-T03 — Closeout, Turnover, and Punch Data Model

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 2 task plan for the Closeout / Turnover / Punch workflow family. Defines the list schemas, parent/child structures, seeded files, and cross-family references for all closeout-phase workflows. Governed by T01 schema standards.

**Phase Reference:** Wave 0 Group 2 — Backend Hardening and Workflow Data Foundations Plan
**Depends On:** T01 (schema standards and PID contract)
**Unlocks:** T07 (provisioning saga step 4 extension for closeout lists), T09 (closeout list tests)
**Source Materials:** `Job Closeout Checklist.pdf`, `Project Closeout Guide - DRAFT.docx`
**ADR Output:** Contributes to ADR-0115

---

## Objective

Define the complete data model for the Closeout / Turnover / Punch workflow family. Project closeout involves the most structured, verifiable, and legally consequential set of deliverables in a construction project. The checklist structure from `Job Closeout Checklist.pdf`, the phased turnover model from `Project Closeout Guide - DRAFT.docx`, and the punch list management pattern all have strong parent/child list structures that G2 must create.

---

## Why This Task Exists

Closeout is the highest-risk phase for schedule slippage and client satisfaction. The `Project Closeout Guide - DRAFT.docx` specifies a four-stage turnover sequence with 120-day advance planning. Currently, this is tracked through PDFs and manual coordination. Without structured list data:
- Closeout completion cannot be queried, tracked, or reported across projects
- The punch list (already in the 8-list core) has no grouping structure for managing batches or walkthroughs
- Turnover package tracking (O&M manuals, warranties, as-built drawings) has no structured record
- The four-stage turnover sequence has no computable status

T03 creates the data foundation for Wave 1 closeout management features.

---

## Scope

T03 covers:

1. The Job Closeout Checklist (parent/child structure)
2. The Punch List Batch / Walk Management parent list (supplementing the core `Punch List` flat list)
3. Turnover package and O&M manual tracking
4. Subcontractor evaluation posture
5. Cross-family references to Financial and Project Controls

T03 does not cover:

- The core `Punch List` flat list (owned by `HB_INTEL_LIST_DEFINITIONS` — T03 adds a parent structure only)
- Final payment processing (Financial family owns the payment records — T06)
- Final inspection records (Project Controls family owns inspection records — T05)
- Any UI for entering closeout data (Wave 1 scope)

---

## Governing Constraints

Same as T02: T01 §1 (PID), T01 §2 (mandatory fields), T01 §4 (parent/child), T01 §6 (seeded-file classification), G1 T01 (core lists not duplicated), G2 Decision G2-3 (family ownership).

---

## 1. Workflow Classification Summary

| Workflow | Classification | Lists Created | Seeded Files |
|---------|--------------|--------------|-------------|
| Job Closeout Checklist | **Seed now** | `Closeout Checklist`, `Closeout Checklist Items` | `Job Closeout Checklist Reference.pdf` |
| Punch List Batch Management | **List only** | `Punch List Batches` | — |
| Turnover Package Tracking | **List only** | `Turnover Package Log` | — |
| O&M Manual Tracking | **List only** | `O&M Manual Log` | — |
| Subcontractor Evaluation | **Seed now** | `Subcontractor Evaluations` | — |
| Project Evaluation / Case Study | **Reference file only** | — | `Project Evaluation Template.docx` (future — not from available artifacts) |
| Project Closeout Guide | **Reference file only** | — | `Project Closeout Guide.docx` seeded to Closeout folder |

---

## 2. List Schemas

### 2.1 Closeout Checklist (Parent List)

**Title:** `Closeout Checklist`
**Description:** Master closeout checklist record for the project. Each project has one closeout checklist instance.
**Template:** 100

**Source material:** `Job Closeout Checklist.pdf` — sections: Tasks, Document Tracking, Inspections, Turnover, Post Turnover, Complete Project Closeout Documents.
**Source material:** `Project Closeout Guide - DRAFT.docx` — four-stage turnover sequence with project metadata fields.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Checklist Title | Text | Yes | E.g., "25-001-01 Closeout Checklist" |
| `Status` | Status | Choice | Yes | `Not Started | In Progress | Punch Phase | Turnover Phase | Complete` |
| `TargetSubstantialCompletion` | Target Substantial Completion | DateTime | No | Contractual or target date |
| `ActualSubstantialCompletion` | Actual Substantial Completion | DateTime | No | Date SC was achieved |
| `TargetFinalCompletion` | Target Final Completion | DateTime | No | |
| `ActualFinalCompletion` | Actual Final Completion | DateTime | No | |
| `Stage1Complete` | Stage 1 — HBC Completion | Boolean | No | Four-stage turnover model from Closeout Guide |
| `Stage2Complete` | Stage 2 — Owner Punch Walkthroughs | Boolean | No | |
| `Stage3Complete` | Stage 3 — Punch Completion | Boolean | No | |
| `Stage4Complete` | Stage 4 — Final Owner Acceptance | Boolean | No | |
| `CertificateOfOccupancy` | Certificate of Occupancy Received | Boolean | No | |
| `CODate` | CO Date | DateTime | No | Date C.O. was received |
| `PunchListItemsTotal` | Punch List Items — Total | Number | No | |
| `PunchListItemsClosed` | Punch List Items — Closed | Number | No | |
| `ProjectManager` | Project Manager | User | No | |
| `Notes` | Notes | MultiLineText | No | |

### 2.2 Closeout Checklist Items (Child List)

**Title:** `Closeout Checklist Items`
**Description:** Individual checklist items for the project closeout. Belongs to one Closeout Checklist parent record.
**Template:** 100

**Source material:** `Job Closeout Checklist.pdf` — categories: Tasks, Document Tracking, Inspections, Turnover, Post Turnover, Closeout Docs.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Item Name | Text | Yes | The checklist item description |
| `ParentRecord` | Closeout Checklist | Lookup | Yes | `lookupListTitle: Closeout Checklist`, `lookupFieldName: ID` |
| `Category` | Category | Choice | Yes | `Tasks | Document Tracking | Inspections | Turnover | Post Turnover | Closeout Documents` |
| `Status` | Status | Choice | Yes | `N/A | Open | In Progress | Complete` |
| `AssignedTo` | Assigned To | User | No | |
| `DueDate` | Due Date | DateTime | No | |
| `CompletedDate` | Completed Date | DateTime | No | |
| `ResponsibleParty` | Responsible Party | Choice | No | `HBC | Owner | Architect | Sub | AHJ` — who must act |
| `Notes` | Notes | MultiLineText | No | |

**Pre-seeded items decision:** Same open question as T02 Startup Checklist Items — T07 must decide whether to pre-seed default closeout checklist rows. The `Job Closeout Checklist.pdf` provides a comprehensive standard set. Pre-seeding is valuable for operational use. **T07 must make this decision explicit.**

---

### 2.3 Punch List Batches

**Title:** `Punch List Batches`
**Description:** Groups of punch list items organized by walkthrough date, trade, or area. Provides parent-level management for the core `Punch List` flat list.
**Template:** 100
**Relationship note:** This list does NOT use a SharePoint Lookup column to link to core `Punch List` items. The relationship is expressed by convention: each `Punch List` item (in the core list) has a `PunchBatchId` text field (T03 must request this addition to the core list as a G1 T01 amendment — or handle this as an advisory cross-reference pattern).

**Important constraint:** G2 must not modify the core `Punch List` list schema directly. If cross-referencing Punch List Batches from core `Punch List` items is required, T07 must propose a `PunchBatchId` field addition to the core `Punch List` as an amendment to G1 T01 / `HB_INTEL_LIST_DEFINITIONS`. This is an open item that T07 must resolve before implementation.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Batch Name | Text | Yes | E.g., "Walk 1 — 2026-04-15" |
| `WalkDate` | Walk Date | DateTime | No | Date of the punch walkthrough |
| `WalkType` | Walk Type | Choice | No | `Owner | Architect | HBC Internal | AHJ` |
| `Status` | Status | Choice | Yes | `Open | In Progress | Complete` |
| `ItemsTotal` | Items — Total | Number | No | Count of items in this batch |
| `ItemsClosed` | Items — Closed | Number | No | Count of closed items |
| `ConductedBy` | Conducted By | User | No | |
| `Notes` | Notes | MultiLineText | No | |

---

### 2.4 Turnover Package Log

**Title:** `Turnover Package Log`
**Description:** Tracks the status of turnover deliverables: O&M manuals, as-built drawings, warranties, certifications.
**Template:** 100

**Source material:** `Project Closeout Guide - DRAFT.docx` (turnover deliverables context), `Job Closeout Checklist.pdf` (Document Tracking and Turnover sections).

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Document / Deliverable Name | Text | Yes | E.g., "Mechanical O&M Manual — HVAC" |
| `Category` | Category | Choice | Yes | `O&M Manual | As-Built Drawing | Warranty | Certification | Survey | Commissioning Report | Other` |
| `Status` | Status | Choice | Yes | `Pending | Requested | Received | Reviewed | Submitted to Owner | Accepted` |
| `SubcontractorName` | Subcontractor Name | Text | No | Sub responsible for this deliverable |
| `DateRequested` | Date Requested | DateTime | No | |
| `DateReceived` | Date Received | DateTime | No | |
| `DateSubmittedToOwner` | Date Submitted to Owner | DateTime | No | |
| `StorageLocation` | Storage Location (SharePoint) | URL | No | Link to document in SharePoint if filed |
| `Notes` | Notes | MultiLineText | No | |

---

### 2.5 Subcontractor Evaluations

**Title:** `Subcontractor Evaluations`
**Description:** Records post-project subcontractor performance evaluations.
**Template:** 100

**Source material:** `Job Closeout Checklist.pdf` (Complete Project Closeout Documents section, subcontractor evaluation item).
**Classification:** Seed now — a subcontractor scorecard SOP exists (`06 20260307_SOP_SubScorecard-DRAFT.xlsx`) and is a high-value data point for BD future intelligence features.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Evaluation Title | Text | Yes | E.g., "25-001-01 — Smith Electric Evaluation" |
| `SubcontractorName` | Subcontractor Name | Text | Yes | |
| `Trade` | Trade / Scope | Text | No | |
| `OverallRating` | Overall Rating | Choice | No | `Excellent | Good | Satisfactory | Poor | Unacceptable` |
| `SafetyRating` | Safety Rating | Choice | No | Same choice set |
| `QualityRating` | Quality Rating | Choice | No | Same choice set |
| `ScheduleRating` | Schedule / Timeliness Rating | Choice | No | Same choice set |
| `CommunicationRating` | Communication Rating | Choice | No | Same choice set |
| `RecommendForFutureWork` | Recommend for Future Work | Boolean | No | |
| `EvaluatedBy` | Evaluated By | User | No | |
| `EvaluationDate` | Evaluation Date | DateTime | No | |
| `Notes` | Notes | MultiLineText | No | |

---

## 3. Seeded File Specifications

### 3.1 Project Closeout Guide
- **File name:** `Project Closeout Guide.docx`
- **Target library:** `Project Documents` (under a Closeout subfolder path if department library includes a Closeout section — otherwise at the root of Project Documents)
- **Asset path:** `backend/functions/src/assets/templates/Project Closeout Guide.docx`
- **Source:** Derived from `Project Closeout Guide - DRAFT.docx` — retain the four-stage turnover sequence, timelines, and section structure; remove project-specific placeholder data
- **Classification:** Reference file only — the closeout guide is a methodology document; structured data is in the lists above

### 3.2 Job Closeout Checklist Reference
- **File name:** `Closeout Checklist Reference.pdf`
- **Target library:** `Project Documents`
- **Asset path:** `backend/functions/src/assets/templates/Closeout Checklist Reference.pdf`
- **Source:** `Job Closeout Checklist.pdf` retained as an operational reference alongside the list
- **Classification:** Seed now (accompanies the `Closeout Checklist` and `Closeout Checklist Items` lists as an operational bridge)

---

## 4. Cross-Family References

### 4.1 → Financial Family (T06)

The closeout process terminates with final payments to subcontractors. Cross-reference:
- `Closeout Checklist Items` includes items: "Final lien releases received" and "Final pay applications submitted" — these reference Financial family workflows
- The Financial `Buyout Log` (T06) tracks the subcontract-level pay application status; the Closeout checklist item is a completion trigger, not a record owner
- **Ownership rule:** T06 owns financial records; T03 has closeout items that reference their completion

### 4.2 → Project Controls Family (T05)

The closeout process requires final inspections (Certificate of Occupancy). Cross-reference:
- `Closeout Checklist Items` — Category: Inspections — include items for each final trade inspection
- T05 owns the `Required Inspections` list; T03's closeout items reference completion of T05 inspection records
- **Ownership rule:** T05 owns inspection records; T03 has closeout items that track their completion

---

## 5. Acceptance Criteria

- [ ] `Closeout Checklist` list schema is fully specified including four-stage status fields
- [ ] `Closeout Checklist Items` list schema is fully specified with lookup column to parent
- [ ] Pre-seeded items decision is resolved in T07
- [ ] `Punch List Batches` schema is specified; cross-reference approach to core `Punch List` is documented; `PunchBatchId` amendment request is logged as an open item for T07
- [ ] `Turnover Package Log` schema is fully specified
- [ ] `Subcontractor Evaluations` schema is fully specified
- [ ] Seeded files are specified: Project Closeout Guide and Closeout Checklist Reference
- [ ] Cross-family references to Financial and Project Controls are documented
- [ ] No T03 list duplicates records owned by T05 or T06
- [ ] All lists include `pid` with `defaultValue: projectNumber` and `indexed: true`

---

## 6. Known Risks and Pitfalls

**Risk T03-R1: The core `Punch List` list does not have a batch reference field.** Adding a `PunchBatchId` text field to the core list requires amending G1 T01 (`HB_INTEL_LIST_DEFINITIONS`). This is an intra-release dependency. T07 must either: (a) request the amendment and include it in the G2 `list-definitions.ts` extension, or (b) implement the batch-to-items relationship through a naming convention on the `Punch List` items' `Title` field instead of a structured field. Document the chosen approach in T07.

**Risk T03-R2: The Project Closeout Guide is a DRAFT.** The artifact is marked "DRAFT" and may not represent the final operational process. Before seeding it as a template file, confirm with the product owner that the guide content is approved for distribution. If not approved, remove from the seeded file manifest and reclassify as "future feature target."

**Risk T03-R3: Turnover deliverable tracking is complex in practice.** The `Turnover Package Log` schema may be oversimplified. Real O&M manuals often involve multiple revisions, multiple reviewers, and partial approvals. Wave 0 must define a tractable schema that captures the essential tracking fields without pre-building a full document management workflow. The schema above represents the minimal viable tracking model. Wave 1 refinement is expected.

---

## Follow-On Consumers

- **T07:** Adds closeout lists and seeded files to provisioning configuration
- **T09:** Tests presence and structure of T03 lists
- **Wave 1 Project Hub:** `Closeout Checklist` and `Turnover Package Log` are primary Wave 1 sources for closeout status tracking
- **Wave 1 BD / intelligence layer:** `Subcontractor Evaluations` is a primary input for the `@hbc/score-benchmark` package once the circular dependency with `@hbc/post-bid-autopsy` is resolved (CLAUDE.md §7)

---

*End of W0-G2-T03 — Closeout, Turnover, and Punch Data Model v1.0*
