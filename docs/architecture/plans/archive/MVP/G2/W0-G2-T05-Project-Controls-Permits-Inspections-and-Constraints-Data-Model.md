# W0-G2-T05 — Project Controls, Permits, Inspections, and Constraints Data Model

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 2 task plan for the Project Controls / Permits / Inspections / Constraints workflow family. Defines the list schemas, seeded files, and cross-family references for all project controls workflows. Governed by T01 schema standards.

**Phase Reference:** Wave 0 Group 2 — Backend Hardening and Workflow Data Foundations Plan
**Depends On:** T01 (schema standards and PID contract)
**Unlocks:** T07 (provisioning saga step 4 extension for project controls lists), T09 (project controls list tests)
**Source Materials:** `10b_20260220_RequiredInspectionsList.xlsx`; ResDir structure (04-Permit, 05-Testing and Inspection, 08-Schedule)
**ADR Output:** Contributes to ADR-0115

---

## Objective

Define the complete data model for the Project Controls / Permits / Inspections / Constraints workflow family. This family governs the permit lifecycle, required inspection tracking, schedule constraints, and look-ahead planning posture for every project.

The `10b_20260220_RequiredInspectionsList.xlsx` artifact provides the clearest source-of-truth for the Required Inspections list structure. The permit and constraints structures are derived from the ResDir directory tree (04-Permit, 05-Testing and Inspection) and standard construction project controls vocabulary.

---

## Why This Task Exists

Permits and inspections are critical path dependencies for any construction project. Permit delays or missed inspections directly cause schedule failures. Currently:
- Permit tracking is a file-based exercise (PDF permits filed in `04-Permit/` subfolder trees)
- The required inspections list is an Excel spreadsheet per project
- Constraints (items blocking work from proceeding) are tracked informally
- Schedule look-ahead information exists as CPM exports and 3-week look-ahead documents in the `08-Schedule/` folder

Without structured list data for these workflows:
- Permit expiration dates cannot be queried or alerted across projects
- Missed required inspections cannot be identified until a closeout review
- Constraints cannot be systematically tracked or escalated
- Wave 1 features for schedule-risk intelligence have no structured data source

---

## Scope

T05 covers:

1. Permit Log (flat list — one record per permit)
2. Required Inspections (flat list — one record per required inspection type)
3. Constraints Log (flat list — one record per constraint item)
4. Schedule / 3-week look-ahead posture (reference file only / future feature target)

T05 does not cover:

- Change Order tracking (owned by the core `Change Order Log` in `HB_INTEL_LIST_DEFINITIONS`)
- RFI tracking (owned by the core `RFI Log`)
- Submittal tracking (owned by the core `Submittal Log`)
- Schedule software integration (Primavera P6, MS Project — Wave 1+ / external)
- Testing and inspection lab reports (these are document-centric; belong in the document library)

---

## Governing Constraints

Same as T02–T04. Cross-family constraint: T05 owns permit and inspection records; Closeout (T03) and Startup (T02) have checklist items that reference T05 records as completion signals.

---

## 1. Workflow Classification Summary

| Workflow | Classification | Lists Created | Seeded Files |
|---------|--------------|--------------|-------------|
| Permit Log | **List only** | `Permit Log` | — |
| Required Inspections | **Seed now** | `Required Inspections` | `Required Inspections Template.xlsx` |
| Constraints Log | **List only** | `Constraints Log` | — |
| 3-Week Look-Ahead / Schedule | **Reference file only** | — | (No standard template available in artifacts — use project-specific schedule) |

---

## 2. List Schemas

### 2.1 Permit Log

**Title:** `Permit Log`
**Description:** Tracks all permits required, applied for, and issued for the project.
**Template:** 100

**Source material:** `ResDir/04-Permit/` — categories: Master Permit, Permit Revisions, Private Inspection Provider, Town/City/Building Regulations. HBC Permits and Sub Permits are sub-categories.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Permit Name / Description | Text | Yes | E.g., "Master Building Permit — Town of Palm Beach" |
| `PermitType` | Permit Type | Choice | Yes | `Master Building | Roofing | Plumbing | HVAC | Electrical | Fire Suppression | Fire Alarm | Elevator | Demolition | Site / Civil | Environmental | Sub Permit | Other` |
| `IssuingAuthority` | Issuing Authority | Text | No | E.g., "Town of Palm Beach Building Dept" |
| `PermitNumber` | Permit Number | Text | No | Official permit number once issued |
| `Status` | Status | Choice | Yes | `Not Applied | Applied | Under Review | Issued | Active | Expired | Revisions Required | Final` |
| `ApplicationDate` | Application Date | DateTime | No | |
| `IssuedDate` | Issued Date | DateTime | No | |
| `ExpirationDate` | Expiration Date | DateTime | No | |
| `FinalInspectionDate` | Final Inspection Date | DateTime | No | Date final inspection was passed |
| `HolderType` | Permit Holder | Choice | No | `HBC | Subcontractor | Owner` |
| `SubcontractorName` | Subcontractor Name (if sub permit) | Text | No | |
| `CostAmount` | Permit Cost | Number | No | |
| `DocumentLink` | Permit Document (SharePoint) | URL | No | Link to permit PDF in document library |
| `Notes` | Notes | MultiLineText | No | |

---

### 2.2 Required Inspections

**Title:** `Required Inspections`
**Description:** Tracks all required inspections by trade and inspection type, with pass/fail results.
**Template:** 100

**Source material:** `10b_20260220_RequiredInspectionsList.xlsx` — fields observed: Job identifier, Main Permit #, Inspection Type, Trade, Status (Pass/Fail/Pending), Inspector Name, Inspection Date, Notes.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Inspection Description | Text | Yes | E.g., "Electrical Rough-In Inspection" |
| `Trade` | Trade | Choice | Yes | `Building | Structural | Plumbing | HVAC | Electrical | Fire Suppression | Fire Alarm | Roofing | Civil | Elevator | Special Inspection | Other` |
| `InspectionCategory` | Inspection Category | Choice | Yes | `Required (AHJ) | Private Provider | Third-Party Special | Owner Required` |
| `PermitNumber` | Related Permit # | Text | No | Cross-reference to `Permit Log` permit number |
| `Status` | Status | Choice | Yes | `Pending | Scheduled | Passed | Failed | Rescheduled | N/A` |
| `ScheduledDate` | Scheduled Date | DateTime | No | |
| `InspectionDate` | Inspection Date | DateTime | No | Actual inspection date |
| `InspectorName` | Inspector Name | Text | No | |
| `InspectorAgency` | Inspector Agency | Text | No | |
| `Result` | Result | Choice | No | `Pass | Partial Pass | Fail | Deferred` |
| `FailureReason` | Failure Reason | MultiLineText | No | Required if `Result: Fail` |
| `CorrectiveActionDue` | Corrective Action Due Date | DateTime | No | |
| `ReinspectionDate` | Re-inspection Date | DateTime | No | |
| `InspectionReportLink` | Inspection Report | URL | No | |
| `Notes` | Notes | MultiLineText | No | |

---

### 2.3 Constraints Log

**Title:** `Constraints Log`
**Description:** Tracks items that are constraining work from proceeding — information not received, approvals pending, materials delayed, access blocked.
**Template:** 100

**Source material:** Standard construction project controls vocabulary. The constraint log concept appears in the 3-week look-ahead management model referenced in `ResDir/08-Schedule/3 Week Look Ahead`.

| InternalName | DisplayName | Type | Required | Notes |
|-------------|------------|------|----------|-------|
| `pid` | Project ID | Text | Yes | `defaultValue: projectNumber`, `indexed: true` |
| `Title` | Constraint Description | Text | Yes | Brief description of the constraint |
| `ConstraintType` | Constraint Type | Choice | Yes | `Information Required | Approval Pending | Material Lead Time | Access / Sequencing | Subcontractor | Owner Decision | Permit | Weather | Other` |
| `Status` | Status | Choice | Yes | `Open | In Progress | Resolved | Deferred` |
| `WorkActivityBlocked` | Work Activity Blocked | Text | No | What work cannot proceed because of this constraint |
| `Owner` | Constraint Owner | User | No | Person responsible for resolving |
| `DateIdentified` | Date Identified | DateTime | Yes | |
| `TargetResolutionDate` | Target Resolution Date | DateTime | No | |
| `ActualResolutionDate` | Actual Resolution Date | DateTime | No | |
| `ImpactIfUnresolved` | Impact if Unresolved | Choice | No | `No Impact | Minor Delay | Moderate Delay | Critical Path Impact` |
| `RelatedPermit` | Related Permit # | Text | No | Cross-reference to Permit Log |
| `Notes` | Notes | MultiLineText | No | |

---

## 3. Seeded File Specifications

### 3.1 Required Inspections Template
- **File name:** `Required Inspections Template.xlsx`
- **Target library:** `Project Documents`
- **Asset path:** `backend/functions/src/assets/templates/Required Inspections Template.xlsx`
- **Source:** Derived from `10b_20260220_RequiredInspectionsList.xlsx` — strip project-specific data, retain column headers and inspection type categories
- **Classification:** Seed now — the Excel form is the current operational tool; the list is the future data structure; both coexist in transition period

---

## 4. Cross-Family References

### 4.1 → Closeout (T03)

The `Closeout Checklist Items` (T03) include a category "Inspections" that tracks whether final inspections are complete. The `Required Inspections` list (T05) is the source of truth for inspection status. Cross-reference: T03 checklist items in the Inspections category reference T05 inspection records by trade and title.

### 4.2 → Safety (T04)

The `JHA Log` (T04) references confined space permits and hot work permits by permit number. These permit numbers are tracked in T05's `Permit Log`. No lookup column is used — the reference is by permit number text field value.

### 4.3 → Startup (T02)

The `Startup Checklist Items` (T02) include items for permit applications. The permit records owned by T05's `Permit Log` are the status source.

---

## 5. Acceptance Criteria

- [ ] `Permit Log` list schema is fully specified with all relevant permit types and status values
- [ ] `Required Inspections` list schema is fully specified, sourced from `10b_20260220_RequiredInspectionsList.xlsx` field analysis
- [ ] `Constraints Log` schema is fully specified
- [ ] Seeded file `Required Inspections Template.xlsx` is specified with asset path
- [ ] 3-week look-ahead is classified as "Reference file only" with justification
- [ ] Cross-family references to Closeout, Safety, and Startup are documented
- [ ] No T05 list duplicates core-owned lists (RFI Log, Submittal Log, Change Order Log, Issues Log)
- [ ] All lists include `pid` with `defaultValue: projectNumber` and `indexed: true`

---

## 6. Known Risks and Pitfalls

**Risk T05-R1: Permit types vary significantly by jurisdiction and project type.** The `PermitType` choice list above represents a common set for Florida construction. If HBC operates in multiple jurisdictions, the permit types may not be comprehensive. The choice list should include `Other` as a catch-all, and Wave 1 features should allow jurisdiction-specific permit type configuration without schema changes.

**Risk T05-R2: Required Inspections varies by project type and AHJ.** The `Required Inspections` list will be empty at provisioning time for many inspection types that are not applicable to a given project. Consider whether T07 should pre-seed the `Required Inspections` list with standard inspection rows (from the Excel template), or leave it empty for PM staff to populate. Pre-seeding would be operationally valuable but adds provisioning complexity. **T07 must make this decision explicit** (same pattern as T02/T03 pre-seeded items decision).

**Risk T05-R3: The Constraints Log may be confused with the Issues Log (core list).** The core `Issues Log` tracks open issues and blockers. The `Constraints Log` specifically tracks items constraining the 3-week look-ahead schedule. These are related but distinct: issues are problems that have occurred; constraints are prerequisites that must be met for work to begin. T07 must document this distinction in the list description field to avoid operational confusion.

---

## Follow-On Consumers

- **T07:** Adds T05 lists to provisioning configuration; resolves pre-seeded inspections decision
- **T09:** Tests presence and structure of T05 lists
- **Wave 1 Project Hub:** `Permit Log` and `Required Inspections` are primary Wave 1 data sources for project controls status surfaces
- **Wave 1 schedule intelligence:** `Constraints Log` is an input for schedule risk analysis in the `@hbc/bic-next-move` package

---

*End of W0-G2-T05 — Project Controls, Permits, Inspections, and Constraints Data Model v1.0*
