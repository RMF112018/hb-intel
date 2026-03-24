# P3-E11-T05 — Responsibility Routing and Accountability Engine

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E11-T05 |
| **Parent** | [P3-E11 Project Startup Module](P3-E11-Project-Startup-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T05 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Purpose — Routing Engine, Not Spreadsheet

The Responsibility Matrix is a **role-accountability and routing engine**. It is not a spreadsheet artifact. Its purpose is to establish, at project startup, a clear and auditable assignment of who is accountable for each category of project management and field task on this specific project, and to route Work Queue items, escalation paths, and approval gates to the correct named persons throughout the project lifecycle.

The routing engine model means:

- Assignments drive Work Queue item routing for overdue or escalated tasks (T08 §3)
- `Primary` assignees own completion accountability; system routes escalations to them
- Assignment changes are versioned via `@hbc/versioned-record` with effective dates
- Critical task categories require explicit acknowledgment from the named `Primary` assignee
- The PM Plan (T06) references the matrix for Section VII rather than duplicating it
- The `StartupBaseline` snapshot captures assignment state at baseline lock for Closeout delta analysis

**Source documents:**
- `docs/reference/example/Responsibility Matrix - Template.xlsx` — PM sheet (84 tasks, 9 roles) + Field sheet (28 tasks, 8 roles)

---

## 2. Template vs. Project Assignment Overlay Model

The Responsibility Matrix operates as a two-layer model:

**Layer 1 — Governed Template (org-level):** The 84 PM sheet task rows and 28 Field sheet task rows are defined in the MOE-governed template. `taskDescription`, `taskCategory`, and `sheet` are immutable on governed rows. No implementation may alter template row text or insert additional governed rows without an explicit template update.

**Layer 2 — Project Assignment Overlay (project-level):** Each project instantiates its own `ResponsibilityMatrix` from the governed template. The project overlay adds:
- Named person assignments per role column per row
- Custom rows (PM-added, project-specific)
- Acknowledgment records for critical assignments
- Assignment effective dates and history

The overlay does not affect the template. Template changes propagate to new projects only — they do not retroactively update existing project matrices after creation.

```
Governed Template (org-level)
  taskDescription: "Review and approve all subcontracts"
  taskCategory: "PX"
  sheet: "PM"
           ↓ instantiate per project
Project Assignment Overlay (project-level)
  assignedPersonName: "James Fetterman"
  value: "Primary"
  effectiveFrom: 2026-04-01
  acknowledgedAt: 2026-04-02
```

---

## 3. ResponsibilityMatrix Header

One matrix per project. Created at project creation alongside `StartupProgram`.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `matrixId` | `string` | Yes | Yes | UUID; immutable |
| `programId` | `string` | Yes | No | FK to StartupProgram |
| `projectId` | `string` | Yes | No | FK to project; one matrix per project |
| `projectName` | `string` | Yes | No | Inherited from project |
| `projectNumber` | `string` | Yes | No | Inherited from project |
| `matrixDate` | `date` | Yes | No | Date the matrix was established or last formally reviewed |
| `createdAt` | `datetime` | Yes | Yes | Timestamp of matrix creation |
| `createdBy` | `string` | Yes | No | userId |
| `lastModifiedAt` | `datetime` | Yes | Yes | Timestamp of most recent assignment change |
| `pmRowsWithPrimaryCount` | `number` | Yes | Yes | Count of PM sheet rows where at least one assignment has `value = Primary` and `assignedPersonName` is populated |
| `fieldRowsWithPrimaryCount` | `number` | Yes | Yes | Count of Field sheet rows where at least one assignment has `value = Primary` and `assignedPersonName` is populated |
| `unacknowledgedCriticalCount` | `number` | Yes | Yes | Count of `Primary` assignments on critical task categories where `acknowledgedAt` is null |
| `certificationStatus` | `enum` | Yes | Yes | Mirrors `ReadinessCertification.certStatus` for `RESPONSIBILITY_MATRIX` sub-surface |

---

## 4. ResponsibilityMatrixRow Model

Each task row in the PM or Field sheet is a `ResponsibilityMatrixRow`. The 84 PM rows and 28 Field rows are instantiated verbatim from the governed template on matrix creation. `taskDescription`, `taskCategory`, and `sheet` are immutable on governed rows.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `rowId` | `string` | Yes | Yes | UUID; immutable |
| `matrixId` | `string` | Yes | No | FK |
| `projectId` | `string` | Yes | No | FK |
| `sheet` | `enum` | Yes | No | `PM` \| `Field`; immutable |
| `taskCategory` | `string` | Yes | No | Category label (e.g., `PX`, `SPM`, `PA`, `LeadSuper`); immutable for governed rows |
| `taskDescription` | `string` | Yes | No | Verbatim task text from template; immutable for governed rows |
| `isCriticalCategory` | `boolean` | Yes | No | `true` for task categories where `Primary` assignments require explicit acknowledgment; see §7.3 |
| `isCustomRow` | `boolean` | Yes | No | `true` for PM-added project-specific rows; `false` for template rows |
| `sortOrder` | `number` | Yes | No | Display sort order within category |
| `assignments` | `ResponsibilityAssignment[]` | Yes | No | One per role column; see §5 |

**Custom rows:** PM may add project-specific rows under a `Custom` task category. Custom rows have `isCustomRow = true`. `taskDescription` on custom rows is editable by PM. No upper limit on custom rows. Custom rows do not affect certification requirements.

---

## 5. ResponsibilityAssignment Model

Each role column cell in a matrix row is a `ResponsibilityAssignment` record. When a person is assigned or reassigned, the current assignment is updated and a version record is written via `@hbc/versioned-record`.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `assignmentId` | `string` | Yes | Yes | UUID; immutable |
| `rowId` | `string` | Yes | No | FK to ResponsibilityMatrixRow |
| `matrixId` | `string` | Yes | No | FK |
| `roleCode` | `string` | Yes | No | Role code from §6 (PM sheet) or §7 (Field sheet); immutable |
| `assignedPersonName` | `string` | No | No | Full name of the person assigned; null if not yet named |
| `assignedUserId` | `string` | No | No | FK to user record; null if person not yet in system |
| `value` | `enum \| null` | Yes | No | `Primary` \| `Support` \| `SignOff` \| `Review` \| null; see §8 for semantics |
| `effectiveFrom` | `date` | No | No | Date this assignment became effective; set when `assignedPersonName` is first populated or reassigned |
| `acknowledgedAt` | `datetime` | No | No | Timestamp when the named assignee acknowledged their assignment; required before certification for critical categories |
| `acknowledgedBy` | `string` | No | No | userId of the person who submitted acknowledgment (must match `assignedUserId` for valid ack) |
| `lastModifiedAt` | `datetime` | No | Yes | Timestamp when this assignment was last changed |
| `lastModifiedBy` | `string` | No | No | userId |

```typescript
enum ResponsibilityValue {
  Primary = 'X',       // Accountable; owns completion
  Support  = 'Support', // Contributor; works the task
  SignOff  = 'Sign-Off', // Must approve before task is complete
  Review   = 'Review',   // Must review; non-blocking
}
```

`@hbc/versioned-record` is required on `assignedPersonName`, `assignedUserId`, and `value` changes.

---

## 6. PM Sheet — Roles and Task Categories

### 6.1 PM Sheet Role Columns (9 roles)

| Column | Role Code | Full Label |
|---|---|---|
| 3 | `PX` | Project Executive |
| 4 | `SrPM` | Senior Project Manager |
| 5 | `PM2` | Project Manager 2 |
| 6 | `PM1` | Project Manager 1 |
| 7 | `PA` | Project Administrator |
| 8 | `QAQC` | QA/QC Manager |
| 9 | `ProjAcct` | Project Accountant |

> Two additional columns in the source template (`Super` and one display-annotation column) are not standard role assignment columns and are treated as display annotations only, not as `ResponsibilityAssignment` records.

### 6.2 PM Sheet Task Categories

| Task Category | Item Count | Description |
|---|---|---|
| `PX` | 4 | Project Executive authority tasks — sign contracts, prime and sub COs above threshold, Owner notices |
| `SPM` | 14 | Senior PM operational tasks — change orders below $10K, SOV review, financials, meetings |
| `PM2` | 11 | PM2 tasks — subcontract buyout, OAC meeting management, design center |
| `PM1` | 11 | PM1 tasks — RFIs, submittals, BIM, procurement log |
| `PA` | 17 | Project Administrator tasks — RFIs, submittals, permits, drawings, meeting minutes |
| `QAQC` | 5 | QA/QC Manager tasks — design coordination, field verification, inspections |
| `ProjAcct` | 13 | Project Accountant tasks — billing, lien waivers, insurance, COI |
| `All / PM's` | 5 | All PM team recurring tasks — payroll, expense reports, financial reports |

**Total PM sheet rows: 80 governed rows** (plus custom rows). Note: the source template's subtotal of 84 includes all category rows when summed across legacy and transitional rows; implementation ingests the source template exactly.

---

## 7. Field Sheet — Roles and Task Categories

### 7.1 Field Sheet Role Columns (5 active role columns)

| Column | Role Code | Full Label |
|---|---|---|
| 4 | `LeadSuper` | Lead Superintendent |
| 5 | `MEPSuper` | MEP Superintendent |
| 6 | `IntSuper` | Interior/Envelope Superintendent |
| 7 | `AsstSuper` | Assistant Superintendent |
| 8 | `QAQC_Field` | QA/QC (Field) |

> The source template lists 8 columns including a PM reference column and a notes column that are not role assignment columns.

### 7.2 Field Sheet Task Categories

| Task Category | Item Count | Description |
|---|---|---|
| `LeadSuper` | 10 | Overall job lead — schedule updates, site work, landscape, utilities, roads |
| `MEPSuper` | 5 | MEP coordination, interiors, amenities, exterior lighting, site logistics |
| `InteriorEnvelope` | 11 | Stucco, roofing, windows, painting, flooring, trim, window coverings, MEP trim-out |
| `QAQC_Field` | 2 | Building envelope submittals and details review |

**Total Field sheet rows: 28 governed rows.**

---

## 8. Accountability Semantics — What Each Value Means

The `value` field on a `ResponsibilityAssignment` is not decorative. Each value carries specific routing and accountability implications:

| Value | Code | Meaning | Routing behavior |
|---|---|---|---|
| **Primary** | `X` | This person is accountable for this task on this project. They are the named owner: they drive completion, respond to escalations, and are the Work Queue target when the task is overdue or unresolved. Only one person per row should be `Primary`; if multiple exist, the system routes to all. | Work Queue items for unresolved tasks route to this person. Escalation items route to their `accountableRoleCode` reviewer. |
| **Support** | `Support` | This person actively works the task alongside the Primary. They are contributors, not accountable owners. If Primary is absent, Support persons are fallback escalation recipients. | Work Queue advisory items (not escalation-grade) may be surfaced to Support persons. |
| **Sign-Off** | `Sign-Off` | This person must formally approve or sign before the task is considered complete. Sign-Off creates a workflow gate: the task cannot advance to the next dependent step without their approval. | Approval request Work Queue items route to this person when a task reaches the Sign-Off step. |
| **Review** | `Review` | This person must review the task output but their input is non-blocking. Task completion does not wait for their review. | Informational Work Queue items may be surfaced; no gate behavior. |

---

## 9. Routing Rules

### 9.1 Named Assignment Requirement for Certification

The matrix meets certification requirements when:
- At least one PM sheet role column for each `taskCategory` has a `value = Primary` assignment with `assignedPersonName` populated, **AND**
- At least one Field sheet role column for each `taskCategory` has a `value = Primary` assignment with `assignedPersonName` populated

Rows in the `All / PM's` category require at least one named `Primary` assignee on any PM role column.

### 9.2 Critical Category Acknowledgment Requirement

The following task categories are classified as `isCriticalCategory = true`. For any `Primary` assignment in these categories, `acknowledgedAt` must be populated before the `RESPONSIBILITY_MATRIX` certification can be submitted:

| Critical categories (PM sheet) | Rationale |
|---|---|
| `PX` | PX authority is explicit and non-delegatable; PX must acknowledge their role tasks |
| `QAQC` | Quality program requires named accountable person who has accepted responsibility |
| `ProjAcct` | Financial obligations and bonding require named accountable accountant |

| Critical categories (Field sheet) | Rationale |
|---|---|
| `LeadSuper` | Jobsite lead superintendent; safety and production accountability |
| `QAQC_Field` | Field quality accountability |

Acknowledgment is submitted by the named person (or their proxy with PM override for person not yet in the system). The API validates `acknowledgedBy` matches `assignedUserId` when both are populated.

### 9.3 Assignment Changes During Stabilization

Assignment changes (updating `assignedPersonName` or `assignedUserId`) are permitted until `BASELINE_LOCKED`. Each change writes a version record via `@hbc/versioned-record` capturing the prior value, new value, `effectiveFrom`, changed-by, and timestamp. After baseline lock, all assignment records are read-only; any PATCH returns HTTP 405.

### 9.4 Routing to Work Queue

| Condition | Work Queue item | Assigned to |
|---|---|---|
| PM sheet task category has no `Primary` assignment with `assignedPersonName` | `MatrixUnassignedCategory` | PM |
| Field sheet task category has no `Primary` assignment with `assignedPersonName` | `MatrixUnassignedCategory` | PM |
| Critical category `Primary` assignment missing `acknowledgedAt` after 3 days of being named | `MatrixAcknowledgmentPending` | Named assignee (or PM if no `assignedUserId`) |

Work Queue items clear when the triggering condition is resolved.

### 9.5 How the Matrix Feeds Readiness Blockers

An unassigned critical task category (`isCriticalCategory = true` and no named `Primary`) creates a `ProgramBlocker` at the PROGRAM scope with severity `HIGH`. This blocker is listed in the `RESPONSIBILITY_MATRIX` certification gate and must be resolved before certification submission. The matrix's `unacknowledgedCriticalCount` feeds the `ReadinessGateRecord` evaluation for the `RESPONSIBILITY_MATRIX` sub-surface (T02 §3.5).

---

## 10. Matrix and PM Plan Integration

The `ProjectExecutionBaseline` Section VII (`Project Team Members Responsibilities`) stores the `matrixId` in the `responsibilityMatrixRef` field. Section VII is rendered as an embedded view of the Responsibility Matrix — it does not duplicate task rows. The matrix is the single SoT for all role-task assignments. Any change to assignments is visible immediately in the Section VII view without requiring a PM Plan edit.

At baseline lock, `StartupBaseline.responsibilitySnapshotAtLock` captures the assignment state for Closeout delta analysis, including the primary assignee snapshot by sheet and task category.

---

## 11. Cross-Reference

| Concern | Governing source |
|---|---|
| Matrix field architecture | This file (T05) |
| StartupBaseline assignment snapshot | T02 §7.2 — `responsibilitySnapshotAtLock` |
| PM Plan Section VII integration | T06 §5 — `responsibilityMatrixRef` field |
| Certification model and gate criteria | T02 §3.3, T02 §3.5 |
| Work Queue item types | T08 §3 |
| Role permissions for matrix editing | T09 §1 |
| `@hbc/versioned-record` usage | T02 §2.2 |

---

*[← T04](P3-E11-T04-Contract-Obligations-Register-Operating-Model.md) | [Master Index](P3-E11-Project-Startup-Module-Field-Specification.md) | [T06 →](P3-E11-T06-Project-Execution-Baseline-Startup-Baselines-and-Closeout-Continuity.md)*
