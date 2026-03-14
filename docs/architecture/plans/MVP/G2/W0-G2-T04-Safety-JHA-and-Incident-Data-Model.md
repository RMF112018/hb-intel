# W0-G2-T04 — Safety, JHA, and Incident Data Model

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 2 task plan for the Safety / JHA / Incident workflow family. Defines the list schemas, parent/child structures, seeded files, and cross-family references for all safety-phase workflows. Governed by T01 schema standards.

**Phase Reference:** Wave 0 Group 2 — Backend Hardening and Workflow Data Foundations Plan
**Depends On:** T01 (schema standards and PID contract)
**Unlocks:** T07 (provisioning saga step 4 extension for safety lists), T09 (safety list tests)
**Source Materials:** `JHA form 2026.docx`, `JHA Instructions Sheet.docx`, `Incident Report .docx`, `Site Specific Safety Plan - NORA.docx`
**ADR Output:** Contributes to ADR-0115

---

## Objective

Define the complete data model for the Safety / JHA / Incident workflow family. Safety documentation in construction is legally mandatory, frequently audited, and operationally critical. The JHA form structure (from `JHA form 2026.docx`) is one of the clearest parent/child models in the business artifacts: a JHA header record and a set of repeating job steps with hazards, controls, and PPE requirements.

The existing `Safety Log` in the 8-list core captures observations and incidents at a summary level. T04 adds the structured parent/child JHA records, dedicated incident tracking, and site safety plan tracking that the `Safety Log` alone cannot support.

---

## Why This Task Exists

The `Safety Log` (core list) captures `Category: Observation | Near Miss | Incident` with a description and corrective action. This is adequate for field-level logging but insufficient for:
- Formal JHA documentation with step-by-step hazard analysis (legally required for certain scopes)
- Detailed incident investigation with root cause analysis and contributing factors
- Site Specific Safety Plan tracking (who submitted, when, approval status)
- Safety walk and toolbox talk records that demonstrate compliance with a regular cadence requirement

Without T04 structures:
- JHAs exist only as PDF forms in the Safety folder of the department library
- Incidents are logged in the core Safety Log without the investigation fields required by OSHA recordkeeping
- Toolbox talk attendance cannot be queried or aggregated
- Wave 1 safety intelligence features have no structured data to build against

---

## Scope

T04 covers:

1. JHA Log (parent) and JHA Steps + JHA Attendees (children)
2. Incident Report (supplementing the core Safety Log)
3. Site Specific Safety Plan tracking
4. Toolbox Talks log
5. Weekly Safety Walk log
6. Subcontractor Safety Certifications list
7. Cross-family references to Project Controls and Startup

T04 does not cover:

- The core `Safety Log` list (owned by `HB_INTEL_LIST_DEFINITIONS`)
- Crisis communications plan (reference documents only, not operational lists)
- OSHA recordkeeping integration (Wave 1+ / external system integration)
- Wave 1 safety dashboard or reporting surfaces

---

## Governing Constraints

Same as T02/T03. Additionally: T04 must not create duplicate structures that compete with the core `Safety Log`. The JHA and Incident structures in T04 supplement the `Safety Log` — they do not replace it.

---

## 1. Workflow Classification Summary

| Workflow | Classification | Lists Created | Seeded Files |
|---------|--------------|--------------|-------------|
| JHA (Job Hazard Analysis) | **Seed now** | `JHA Log`, `JHA Steps`, `JHA Attendees` | `JHA Form Template.docx`, `JHA Instructions.docx` |
| Incident Report | **Seed now** | `Incident Log` | `Incident Report Form.docx` |
| Site Specific Safety Plan | **Seed now** | `Site Safety Plans` | `Site Specific Safety Plan Template.docx` |
| Toolbox Talks | **List only** | `Toolbox Talk Log` | — |
| Weekly Safety Walk | **List only** | `Safety Walk Log` | — |
| Subcontractor Safety Certifications | **List only** | `Sub Safety Certifications` | — |
| Crisis Communications Plan | **Reference file only** | — | Crisis reference documents (see §3) |

---

## 2. List Schemas

### 2.1 JHA Log (Parent List)

**Title:** `JHA Log`
**Description:** Job Hazard Analysis header records. Each JHA record represents one completed JHA form for a specific work task.
**Template:** 100

**Source material:** `JHA form 2026.docx` — header section: Project, Date, Subcontractor, Supervisor, Crew Size, Confined Space Permit #, Hot Work Permit #, Emergency Contact info.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | JHA Title / Task Description | Text | Yes | E.g., "JHA-001 — Concrete Pour — Level 3" |
| `Status` | Status | Choice | Yes | `Draft | Active | Superseded | Archived` |
| `JHADate` | JHA Date | DateTime | Yes | Date the JHA was completed |
| `SubcontractorName` | Subcontractor / Crew | Text | No | Name of sub or HBC crew |
| `Supervisor` | Supervisor | User | No | Person conducting the JHA |
| `CrewSize` | Crew Size | Number | No | |
| `WorkTask` | Work Task | Text | Yes | Specific task being analyzed |
| `Location` | Location on Site | Text | No | |
| `RequiresConfinedSpacePermit` | Confined Space Permit Required | Boolean | No | |
| `ConfinedSpacePermitNumber` | Confined Space Permit # | Text | No | |
| `RequiresHotWorkPermit` | Hot Work Permit Required | Boolean | No | |
| `HotWorkPermitNumber` | Hot Work Permit # | Text | No | |
| `EmergencyContact` | Emergency Contact # | Text | No | |
| `NearestHospital` | Nearest Hospital | Text | No | |
| `ReviewedBy` | Reviewed By | User | No | Superintendent or safety manager |
| `Notes` | Notes | MultiLineText | No | |

### 2.2 JHA Steps (Child List)

**Title:** `JHA Steps`
**Description:** Individual job steps within a JHA, each with identified hazards, controls, and PPE requirements.
**Template:** 100

**Source material:** `JHA form 2026.docx` — Step #, Job Step (task description), Hazards, Controls/Safe Practices, PPE required (checkboxes: Hard Hat, Safety Glasses, Hi-Vis Vest, Gloves, Hearing Protection, Respirator, Harness/Lanyard, Hard Sole Work Boots, Other), Why/When Used.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Step Title | Text | Yes | Brief step name, e.g., "Step 1 — Set up scaffolding" |
| `ParentRecord` | JHA Record | Lookup | Yes | `lookupListTitle: JHA Log`, `lookupFieldName: ID` |
| `StepNumber` | Step Number | Number | Yes | Sequence number within the JHA |
| `StepDescription` | Step Description | MultiLineText | Yes | Full description of the job step |
| `Hazards` | Identified Hazards | MultiLineText | Yes | List all hazards for this step |
| `Controls` | Controls / Safe Practices | MultiLineText | Yes | Mitigation measures using hierarchy of controls |
| `PPE_HardHat` | PPE — Hard Hat | Boolean | No | |
| `PPE_SafetyGlasses` | PPE — Safety Glasses | Boolean | No | |
| `PPE_HiVis` | PPE — Hi-Vis Vest | Boolean | No | |
| `PPE_Gloves` | PPE — Gloves | Boolean | No | |
| `PPE_HearingProtection` | PPE — Hearing Protection | Boolean | No | |
| `PPE_Respirator` | PPE — Respirator | Boolean | No | |
| `PPE_Harness` | PPE — Harness / Lanyard | Boolean | No | |
| `PPE_WorkBoots` | PPE — Hard Sole Work Boots | Boolean | No | |
| `PPE_Other` | PPE — Other | Text | No | Description of any non-standard PPE |
| `RiskLevel` | Risk Level | Choice | No | `Low | Medium | High` |

### 2.3 JHA Attendees (Child List)

**Title:** `JHA Attendees`
**Description:** Worker signatures and acknowledgments for a JHA. Each record is one worker who reviewed and acknowledged the JHA.
**Template:** 100
**Rationale for separate child list:** The JHA form includes a worker acknowledgment section with multiple signatories. Storing signatures/acknowledgments as separate records (rather than a multi-value text field) enables attendance counting, individual worker audit trails, and future integration with digital signature workflows.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Worker Name | Text | Yes | Name of the worker who acknowledged the JHA |
| `ParentRecord` | JHA Record | Lookup | Yes | `lookupListTitle: JHA Log`, `lookupFieldName: ID` |
| `Company` | Company | Text | No | Sub or HBC |
| `AcknowledgedDate` | Acknowledged Date | DateTime | No | |
| `SignatureMethod` | Signature Method | Choice | No | `Physical | Digital | Verbal Acknowledgment` |

---

### 2.4 Incident Log

**Title:** `Incident Log`
**Description:** Detailed incident, near miss, and unsafe condition records. Supplements the core `Safety Log` with investigation fields.
**Template:** 100

**Source material:** `Incident Report .docx` — sections: Report Header, Participants, Incident Details, Description, Root Cause Analysis, Corrective Actions.

**Relationship to core `Safety Log`:** The core `Safety Log` captures lightweight safety observations (`Category: Observation | Near Miss | Incident`). The `Incident Log` is the detailed investigation record for significant events. The two lists are not linked by a SharePoint lookup — they are complementary at different levels of detail. A single incident may have a `Safety Log` observation entry AND a more detailed `Incident Log` investigation record. Field teams may create the quick `Safety Log` entry first, then complete the `Incident Log` investigation record as a follow-up.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Incident Reference Title | Text | Yes | E.g., "INC-001 — Near Miss 2026-04-15" |
| `Status` | Status | Choice | Yes | `Open | Under Investigation | Corrective Action | Closed` |
| `IncidentType` | Incident Type | Choice | Yes | `Near Miss | Unsafe Condition | Equipment Damage | First Aid | Medical Treatment | Lost Time | Fatality | Property Damage | Other` |
| `IncidentDate` | Date & Time of Incident | DateTime | Yes | |
| `ReportedDate` | Date First Reported | DateTime | No | |
| `Location` | Location (specific) | Text | Yes | |
| `PersonCompleting` | Person Completing Report | User | No | |
| `CompanyOfReporter` | Company of Reporter | Text | No | |
| `EmployeesInvolved` | Employees Involved | MultiLineText | No | Names and companies of all involved |
| `Description` | Incident Description | MultiLineText | Yes | Detailed narrative |
| `ImmediateCauses` | Immediate Cause(s) | MultiLineText | No | |
| `ContributingFactors` | Contributing Factors | MultiLineText | No | E.g., weather, lighting, tools, workload |
| `CorrectiveActions` | Corrective Actions Taken | MultiLineText | No | |
| `CorrectiveActionsComplete` | Corrective Actions Complete | Boolean | No | |
| `OSHARecordable` | OSHA Recordable | Boolean | No | Whether this is an OSHA 300 recordable event |
| `ReviewedBy` | Reviewed By | User | No | Superintendent or safety manager |

---

### 2.5 Site Safety Plans

**Title:** `Site Safety Plans`
**Description:** Tracks the status of site-specific safety plans submitted for the project.
**Template:** 100

**Source material:** `Site Specific Safety Plan - NORA.docx` — header fields: Job #, Project Name, Site Address, Project Start Date, project team with 24-hr contact info, subcontractor safety plan submission tracking.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Plan Title | Text | Yes | E.g., "HBC Site Specific Safety Plan" or "Smith Electric SSP" |
| `PlanType` | Plan Type | Choice | Yes | `HBC SSSP | Subcontractor SSSP | Hurricane Preparedness | Emergency Action Plan | Other` |
| `Status` | Status | Choice | Yes | `Not Submitted | Submitted | Under Review | Approved | Expired | Superseded` |
| `SubcontractorName` | Subcontractor Name | Text | No | Empty if HBC plan |
| `SubmittedDate` | Submitted Date | DateTime | No | |
| `ApprovedDate` | Approved Date | DateTime | No | |
| `ExpirationDate` | Expiration Date | DateTime | No | |
| `DocumentLink` | Document Location (SharePoint) | URL | No | Link to the plan document in the library |
| `ReviewedBy` | Reviewed By | User | No | |
| `Notes` | Notes | MultiLineText | No | |

---

### 2.6 Toolbox Talk Log

**Title:** `Toolbox Talk Log`
**Description:** Records of daily or weekly toolbox safety talks.
**Template:** 100

**Source material:** `ResDir/07-Safety/Tool Box Talks` folder (indicating this is a standard HBC practice).

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Talk Topic | Text | Yes | E.g., "Fall Protection — Ladder Safety" |
| `TalkDate` | Talk Date | DateTime | Yes | |
| `Facilitator` | Facilitator | User | No | |
| `AttendeeCount` | Attendee Count | Number | No | |
| `Status` | Status | Choice | Yes | `Conducted | Missed | Rescheduled` |
| `Notes` | Notes | MultiLineText | No | |

### 2.7 Safety Walk Log

**Title:** `Safety Walk Log`
**Description:** Records of weekly safety site walks.
**Template:** 100

**Source material:** `ResDir/07-Safety/Weekly Site Walk` folder (standard HBC practice).

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Walk Record | Text | Yes | E.g., "Safety Walk — 2026-04-14" |
| `WalkDate` | Walk Date | DateTime | Yes | |
| `ConductedBy` | Conducted By | User | No | |
| `FindingsCount` | Findings Count | Number | No | |
| `FindingsResolved` | Findings Resolved | Number | No | |
| `Status` | Status | Choice | Yes | `Scheduled | Conducted | Findings Pending | Complete` |
| `Notes` | Notes | MultiLineText | No | General observations |

### 2.8 Sub Safety Certifications

**Title:** `Sub Safety Certifications`
**Description:** Tracks safety certifications, training records, and compliance documentation for subcontractors.
**Template:** 100

**Source material:** `ResDir/07-Safety/Subcontractor Certifications` folder.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Certification Name | Text | Yes | E.g., "Smith Electric — OSHA 10" |
| `SubcontractorName` | Subcontractor Name | Text | Yes | |
| `CertificationType` | Certification Type | Choice | Yes | `OSHA 10 | OSHA 30 | Competent Person | Equipment Operator | First Aid/CPR | Other` |
| `HolderName` | Certificate Holder Name | Text | No | Individual or company |
| `IssueDate` | Issue Date | DateTime | No | |
| `ExpirationDate` | Expiration Date | DateTime | No | |
| `Status` | Status | Choice | Yes | `Active | Expiring Soon | Expired | Not Submitted` |
| `DocumentLink` | Certificate Document | URL | No | |

---

## 3. Seeded File Specifications

### 3.1 JHA Form Template
- **File name:** `JHA Form Template.docx`
- **Target library:** `Project Documents` (under Safety subfolder in department library if present)
- **Asset path:** `backend/functions/src/assets/templates/JHA Form Template.docx`
- **Source:** Derived from `JHA form 2026.docx` — strip project-specific data, retain all sections and fields
- **Classification:** Seed now (forms the operational bridge until Wave 1 JHA entry feature is built)

### 3.2 JHA Instructions
- **File name:** `JHA Instructions.docx`
- **Target library:** `Project Documents`
- **Asset path:** `backend/functions/src/assets/templates/JHA Instructions.docx`
- **Source:** `JHA Instructions Sheet.docx` retained as-is (instructional, no project-specific data)
- **Classification:** Seed now (operational reference)

### 3.3 Incident Report Form
- **File name:** `Incident Report Form.docx`
- **Target library:** `Project Documents`
- **Asset path:** `backend/functions/src/assets/templates/Incident Report Form.docx`
- **Source:** Derived from `Incident Report .docx` — strip sample data, retain all fields and sections
- **Classification:** Seed now (operational bridge for incident reporting before Wave 1 incident management feature)

### 3.4 Site Specific Safety Plan Template
- **File name:** `Site Specific Safety Plan Template.docx`
- **Target library:** `Project Documents`
- **Asset path:** `backend/functions/src/assets/templates/Site Specific Safety Plan Template.docx`
- **Source:** Derived from `Site Specific Safety Plan - NORA.docx` — strip project-specific data (NORA project details), retain structure, team table, subcontractor submission tracking table
- **Classification:** Seed now (forms the operational template for all projects)
- **Note:** This is the same file referenced by the G1 T01 `safety-pack` add-on (`Safety Plan Template.docx`). G2 must not create a duplicate seeded file. Coordinate with T07 to confirm that the `safety-pack` add-on file and the T04 seeded template are the same asset or are intentionally different (the add-on may be a more elaborate version; the core seed may be a simpler reference). **T07 must resolve this coordination.**

---

## 4. Cross-Family References

### 4.1 → Project Controls (T05)

Confined Space Permits and Hot Work Permits are tracked in the `JHA Log`. T05 owns the `Permit Log`. Cross-reference: `JHA Log` items with `RequiresConfinedSpacePermit: true` reference permit numbers tracked in T05's `Permit Log` via `ConfinedSpacePermitNumber` text field.

### 4.2 → Startup (T02)

The `Site Safety Plans` list tracks whether a subcontractor has submitted their SSSP — this is also a startup checklist item in T02. The Startup Checklist Item "Site Specific Safety Plan submitted" becomes `Complete` when the `Site Safety Plans` list has an approved HBC SSSP record.

---

## 5. Acceptance Criteria

- [ ] `JHA Log` parent list schema is fully specified
- [ ] `JHA Steps` child list schema is fully specified with lookup column to `JHA Log`
- [ ] `JHA Attendees` child list schema is fully specified with lookup column to `JHA Log`
- [ ] `Incident Log` schema is fully specified including OSHA recordable flag and contributing factors fields
- [ ] `Site Safety Plans` schema is fully specified
- [ ] `Toolbox Talk Log` schema is fully specified
- [ ] `Safety Walk Log` schema is fully specified
- [ ] `Sub Safety Certifications` schema is fully specified
- [ ] All 4 seeded files are specified with asset paths
- [ ] Safety-pack add-on / T04 seeded file coordination is flagged as an open item for T07
- [ ] All lists include `pid` with `defaultValue: projectNumber` and `indexed: true`
- [ ] No T04 list duplicates the core `Safety Log` structure

---

## 6. Known Risks and Pitfalls

**Risk T04-R1: JHA Steps list is provisioned but not immediately useful until a Wave 1 entry form exists.** JHA steps cannot be entered without a structured form interface — the SharePoint default list view is inadequate for job-step-by-step entry with checkboxes. The `JHA Form Template.docx` seed bridges this gap operationally. The list structure will be ready for Wave 1.

**Risk T04-R2: Safety-pack add-on file naming conflict.** The G1 T01 `safety-pack` add-on provisions `Safety Plan Template.docx`. T04 wants to seed `Site Specific Safety Plan Template.docx`. These may be the same intent under different names. T07 must confirm whether they should be the same file or distinct files, and whether the add-on `Safety Plan Template.docx` and the T04 seeded file should be consolidated into a single asset.

**Risk T04-R3: OSHA recordability determination is complex.** The `OSHARecordable` boolean on `Incident Log` requires someone to make a recordability determination. If this field is required and PM staff are uncertain about recordability criteria, data quality will suffer. Consider making it optional (nullable) rather than boolean-required, and note that formal recordability determination may need to go through an HR or safety manager workflow.

---

## Follow-On Consumers

- **T07:** Adds all T04 lists and seeded files to provisioning configuration; resolves safety-pack add-on coordination
- **T09:** Tests for presence and structure of all T04 lists
- **Wave 1 safety features:** `JHA Log` and `JHA Steps` are primary targets for a structured JHA entry and tracking feature
- **Wave 1 intelligence layer:** `Incident Log` and `Safety Walk Log` are inputs for project safety scoring

---

*End of W0-G2-T04 — Safety, JHA, and Incident Data Model v1.0*
