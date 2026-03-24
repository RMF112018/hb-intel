# P3-E11-T03 — Startup Program Checklist Library, Readiness Tasks, Blockers, Evidence

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E11-T03 |
| **Parent** | [P3-E11 Project Startup Module](P3-E11-Project-Startup-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T03 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. The Task Library Is Not a Checklist

The Job Startup Checklist is architecturally a **governed readiness task library** — not a static checklist form. The distinction is operational:

| Static checklist model (old) | Task library model (current) |
|---|---|
| Fixed form filled out once and archived | Living set of task instances, each with its own result, blocker, evidence, due date, and ownership |
| No task metadata beyond description | Each task carries category, severity, gating impact, owner role, due trigger, and SLA |
| Task "completion" = module composite math | Task result contributes to surface certification; certification requires PE gate review |
| No dependency model between tasks | Some tasks have explicit dependencies on upstream tasks |
| No acknowledgment of which tasks survive stabilization | Tasks with `activeDuringStabilization = true` may be corrected through the stabilization window |
| Flat list of items | Template/instance architecture: org-level templates generate per-project instances |

The task library operates through a **template–instance** pattern: MOE maintains a governed `StartupTaskTemplate` library at the org level; when a `StartupProgram` is created, the system instantiates one `StartupTaskInstance` per active template for that project.

---

## 2. Template–Instance Architecture

### 2.1 StartupTaskTemplate

Org-level governed task definition. Owned and versioned by MOE (Methods and Operations Excellence). Template fields define the task's identity, expected behavior, and metadata. Templates are never edited by a PM on a specific project — they are org-level configuration.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `templateId` | `string` | Yes | Yes | UUID; immutable |
| `taskNumber` | `string` | Yes | No | Section-prefixed canonical number, e.g., `1.1`, `2.11`, `4.07`; immutable across versions |
| `title` | `string` | Yes | No | Verbatim task text from source checklist; authoritative description |
| `sectionCode` | `enum` | Yes | No | `REVIEW_OWNER_CONTRACT` \| `JOB_STARTUP` \| `ORDER_SERVICES` \| `PERMIT_POSTING` |
| `category` | `enum` | Yes | No | See §3 for taxonomy |
| `severity` | `enum` | Yes | No | `CRITICAL` \| `HIGH` \| `STANDARD` |
| `gatingImpact` | `enum` | Yes | No | `BLOCKS_CERTIFICATION` \| `REQUIRES_BLOCKER_IF_OPEN` \| `ADVISORY` |
| `ownerRoleCode` | `string` | Yes | No | Primary role code responsible for completing this task (see §4) |
| `supportingRoleCodes` | `string[]` | No | No | Additional role codes with secondary responsibility |
| `dueTrigger` | `enum` | No | No | `ON_PROJECT_CREATION` \| `ON_CONTRACT_EXECUTION` \| `ON_NTP_ISSUED` \| `DAYS_BEFORE_MOBILIZATION` \| `NONE` |
| `dueOffsetDays` | `number` | No | No | For `DAYS_BEFORE_MOBILIZATION`: negative integer = days before target mobilization (e.g., -14 = 14 days before); null for other triggers |
| `evidenceTypes` | `string[]` | No | No | Expected evidence artifact types (see §5) |
| `dependsOnTaskNumbers` | `string[]` | No | No | Task numbers that must have `result = Yes` before this task's result can be set to Yes; empty array = no dependency |
| `activeDuringStabilization` | `boolean` | Yes | No | Whether this task's result may be corrected during the stabilization window; critical permits typically true |
| `applicabilityNote` | `string` | No | No | Human-readable note on when NA is appropriate (e.g., "N/A if no public-facing operations") |
| `templateVersion` | `number` | Yes | No | Increments on any template field change; instances record the version at instantiation |
| `isActive` | `boolean` | Yes | No | False = template retired; not instantiated on new projects |
| `createdAt` | `datetime` | Yes | Yes | |
| `lastModifiedAt` | `datetime` | Yes | Yes | |

### 2.2 StartupTaskInstance

Per-project working copy of a `StartupTaskTemplate`. Created automatically for every active template when `StartupProgram` is initialized. The team interacts with instances, not templates.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `instanceId` | `string` | Yes | Yes | UUID; immutable |
| `programId` | `string` | Yes | No | FK |
| `projectId` | `string` | Yes | No | FK |
| `templateId` | `string` | Yes | No | FK to parent StartupTaskTemplate |
| `templateVersion` | `number` | Yes | Yes | Template version at time of instantiation; locked after creation |
| `taskNumber` | `string` | Yes | Yes | Copied from template; immutable |
| `title` | `string` | Yes | Yes | Copied from template; immutable |
| `sectionCode` | `enum` | Yes | Yes | Copied from template; immutable |
| `category` | `enum` | Yes | Yes | Copied from template; immutable |
| `severity` | `enum` | Yes | Yes | Copied from template; immutable |
| `gatingImpact` | `enum` | Yes | Yes | Copied from template; immutable |
| `ownerRoleCode` | `string` | Yes | Yes | Copied from template; immutable |
| `activeDuringStabilization` | `boolean` | Yes | Yes | Copied from template; immutable |
| `result` | `enum \| null` | No | No | **Editable by project team.** `YES` \| `NO` \| `NA` \| null (null = not yet reviewed) |
| `notes` | `string` | No | No | Free-text notes from the project team |
| `evidenceAttachmentIds` | `string[]` | No | No | Document management layer file IDs |
| `evidenceNotes` | `string` | No | No | Description of evidence attached or referenced |
| `assignedUserId` | `string` | No | No | Specific user assigned to complete this task on this project (overrides ownerRoleCode routing) |
| `dueDate` | `date` | No | Yes | Calculated from `dueTrigger` and `dueOffsetDays` against project dates; null if trigger is NONE |
| `isOverdue` | `boolean` | Yes | Yes | True if `dueDate` is past and `result ≠ YES` and `result ≠ NA` |
| `hasActiveBlocker` | `boolean` | Yes | Yes | True if any `TaskBlocker` in OPEN status references this instance |
| `publicationState` | `enum` | Yes | Yes | `DRAFT` \| `CERTIFIED` \| `LOCKED` per T02 §2.3 |
| `lastModifiedAt` | `datetime` | No | Yes | |
| `lastModifiedBy` | `string` | No | No | |

**Immutability contract:** Fields marked as "Copied from template; immutable" (`taskNumber`, `title`, `sectionCode`, `category`, `severity`, `gatingImpact`, `ownerRoleCode`, `activeDuringStabilization`) cannot be modified by any user role or API call. Any PATCH targeting these fields is rejected with HTTP 409.

**Stabilization rule:** If `activeDuringStabilization = false`, the instance's `result` field becomes immutable at `MOBILIZED` state. If `activeDuringStabilization = true`, `result` remains mutable through `STABILIZING` state and locks only at `BASELINE_LOCKED`.

---

## 3. Task Category Taxonomy

The `category` field classifies tasks by operational domain. Categories drive Work Queue routing, certificate-section grouping, and reporting.

| Category code | Label | Typical tasks |
|---|---|---|
| `CONTRACTUAL_OBLIGATION` | Contractual Obligation Review | Reviewing contract terms, special clauses, LDs, bonding (Section 1 tasks) |
| `ADMIN_SETUP` | Administrative Setup | Procore setup, accounting setup, job files, permit applications |
| `FINANCIAL_SETUP` | Financial Setup | Budget rollover, SOV, buyout tracking log |
| `SUBCONTRACTOR_MANAGEMENT` | Subcontractor Management | COI collection, subcontract execution, buyout |
| `OWNER_COORDINATION` | Owner Coordination | Owner meeting, preconstruction meeting, COI delivery, contract delivery |
| `LEGAL_AND_NOTICE` | Legal and Notice | Notice of Commencement, Notice to Owner, NTO tracking |
| `SITE_SERVICES` | Site Services and Equipment | Sanitary, field office, job office trailer, first aid |
| `SCHEDULE_AND_PLANNING` | Schedule and Planning | Project schedule, submittal register, management plan, logistics plan |
| `TEAM_SETUP` | Team Setup | Job turnover meeting, Procore roles, team communications |
| `SAFETY_COORDINATION` | Safety Coordination | Safety plan distribution, safety officer identification (Startup checklist level) |
| `COMMUNITY_AND_EXTERNAL` | Community and External Relations | Project signage, public relations, community outreach |
| `PERMIT_POSTING` | Permit Posting Verification | Section 4 — permits physically posted on jobsite |

---

## 4. Severity, Gating Impact, and Ownership

### 4.1 Severity Definitions

| Severity | Code | Meaning | System behavior |
|---|---|---|---|
| Critical | `CRITICAL` | Must be addressed before mobilization. A `NO` result without an approved waiver blocks certification. | Automatically creates a `TaskBlocker` stub when result = NO |
| High | `HIGH` | Strong expectation of YES. A `NO` result without a documented TaskBlocker prevents certification submission. | Flags the task in the certification submission pre-check |
| Standard | `STANDARD` | Expected completion. `NO` result is allowed without a blocker, but is visible to PE in gate review. | Advisory only; no system enforcement |

### 4.2 Gating Impact Definitions

| Gating impact | Code | Effect on certification |
|---|---|---|
| Blocks certification | `BLOCKS_CERTIFICATION` | If `result = NO` or `null` and no approved `ExceptionWaiverRecord` exists, certification cannot be submitted. |
| Requires blocker if open | `REQUIRES_BLOCKER_IF_OPEN` | If `result = NO` or `null`, a `TaskBlocker` record must exist before certification can be submitted. Blockers may be unresolved — they are documented and PE sees them. |
| Advisory | `ADVISORY` | No system-level constraint. Task is visible in the certification payload; PE may review. |

The relationship between severity and gating impact is typically:
- `CRITICAL` tasks have `BLOCKS_CERTIFICATION`
- `HIGH` tasks have `REQUIRES_BLOCKER_IF_OPEN`
- `STANDARD` tasks have `ADVISORY`

These defaults may be overridden by MOE for specific tasks where the standard mapping does not apply.

### 4.3 Ownership Routing

`ownerRoleCode` specifies which role is primarily responsible for completing the task. It drives Work Queue routing and overdue notifications.

| ownerRoleCode | Routing target | Typical tasks |
|---|---|---|
| `PM` | Any PM tier (Sr. PM, PM2, PM1); routes to assigned PM | Most Section 2 and Section 3 tasks |
| `PA` | Project Administrator | Admin and compliance tasks: Procore setup, submittals, files, NTO |
| `PROJ_ACCT` | Project Accountant | Accounting setup, budget rollover, financial reports |
| `PX` | Project Executive | Bond application (involves CFO), contract signing |
| `SUPERINTENDENT` | Lead Superintendent | Site services, safety plan distribution, Section 4 permits |
| `SAFETY_MANAGER` | Safety Manager | Safety-coordination tasks in the startup checklist scope |

When `assignedUserId` is set on a `StartupTaskInstance`, Work Queue items route to that specific user instead of the role code.

---

## 5. Task Dependency Model

Some tasks cannot logically be completed before upstream tasks are done. Dependencies are enforced at the result-write level, not at the display level (users can view dependent tasks at any time).

### 5.1 Dependency Rule

If task B has `dependsOnTaskNumbers = ['2.3']`, then:
- When a user attempts to set task B's `result = YES`, the API checks that task `2.3` has `result = YES` on this project
- If task `2.3` is not `YES`, the result-write returns HTTP 422 with a `DEPENDENCY_UNSATISFIED` error listing the unsatisfied upstream tasks
- Result values of `NO` or `NA` on dependent tasks are always allowed regardless of upstream state

### 5.2 Key Dependency Chains

| Task | Depends on | Rationale |
|---|---|---|
| 2.6 Have Budget rolled from Sage Estimating to Accounting | 2.3 Verify project in Accounting | Cannot roll budget if project not in Accounting |
| 2.7 Have Budget rolled from Sage Accounting to Procore | 2.4 Verify job in Procore, 2.6 | Cannot roll to Procore if Procore not set up or Accounting budget not ready |
| 2.17 Complete Submittal Register in Procore | 2.4 Verify job in Procore | Procore must exist before submittals can be entered |
| 2.24 Write Subcontracts in Procore | 2.4 Verify job in Procore | Procore must exist before subcontracts can be entered |
| 2.28 Create, record and track the NTO | 2.13 Record Notice of Commencement | NTO sequence typically follows NOC |

### 5.3 Circular Dependency Prevention

Template updates that introduce a circular dependency chain are rejected by the MOE template management system. `dependsOnTaskNumbers` must form a directed acyclic graph.

---

## 6. Due Trigger and SLA Model

### 6.1 Due Date Calculation

When a `StartupTaskInstance` is created, the system attempts to calculate a `dueDate` based on `dueTrigger` and `dueOffsetDays` using project date signals:

| dueTrigger | Date basis | How resolved |
|---|---|---|
| `ON_PROJECT_CREATION` | `StartupProgram.createdAt` | Due = creation date (these tasks should be done immediately) |
| `ON_CONTRACT_EXECUTION` | `ContractObligationsRegister.contractDate` | Due = contract date; recalculated when contractDate is set; null until contractDate exists |
| `ON_NTP_ISSUED` | `BaselineSectionField.noticeToProceedDate` | Due = NTP date; recalculated when NTP date is set; null until set |
| `DAYS_BEFORE_MOBILIZATION` | `StartupProgram.stabilizationWindowOpensAt` (proxy for mobilization) | Due = mobilization date + `dueOffsetDays` (negative = before); null until mobilization date known |
| `NONE` | N/A | `dueDate = null`; no SLA enforced |

Due dates are best-effort guidance. They do not block result entry. They drive Work Queue items and the overdue flag.

### 6.2 Overdue and Escalation Rules

| Condition | System response |
|---|---|
| Task is overdue and `severity = CRITICAL` | Work Queue item raised for `ownerRoleCode`; ProgramBlocker stub suggested to PM |
| Task is overdue and `severity = HIGH` | Work Queue item raised for `ownerRoleCode`; advisory note in certification pre-check |
| Task is overdue and `severity = STANDARD` | No Work Queue item; displayed as overdue in the task library view |
| Task with `result = YES` after overdue | `isOverdue` clears; Work Queue item cleared |

---

## 7. Evidence Requirements

### 7.1 Evidence Types

Each `StartupTaskTemplate.evidenceTypes` array lists the expected artifacts that prove the task is complete. These are not mandatory system attachments — they are guidance for what PE expects to see when reviewing certifications.

| Evidence type code | Label | Example |
|---|---|---|
| `COI_DOCUMENT` | Certificate of Insurance | Sub COI PDF, Owner COI copy |
| `EXECUTED_DOCUMENT` | Executed Document | Signed subcontract, bond, executed prime contract |
| `RECORDED_DOCUMENT` | Recorded Legal Document | Recorded NOC (with recording stamp/date) |
| `SYSTEM_SCREENSHOT` | System Setup Confirmation | Screenshot of Procore project settings, Accounting job card |
| `PERMIT_COPY` | Permit Copy | Posted permit photograph or scanned permit |
| `MEETING_MINUTES` | Meeting Minutes | Preconstruction meeting minutes, job turnover notes |
| `SCHEDULE_FILE` | Schedule File | Uploaded CPM schedule file |
| `PLAN_OR_DOCUMENT` | Plan or Document | Logistics plan, management plan PDF |
| `CORRESPONDENCE` | Correspondence | Email or letter confirming required Owner action |

### 7.2 Evidence Visibility

Evidence attachments on `StartupTaskInstance` records are visible to:
- All roles with read access to the Startup module
- PE during ReadinessGateRecord evaluation
- The `StartupBaseline` does not snapshot evidence attachments themselves, but does record `evidenceAttachmentIds` in the `executionBaselineFieldsAtLock` map for the Section XI attachment tracking fields

---

## 8. TaskBlocker Model

### 8.1 TaskBlocker Record

A `TaskBlocker` is a first-class record tied to a specific `StartupTaskInstance`. It is distinct from `ProgramBlocker` (T02 §3.10), which is program-level.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `blockerId` | `string` | Yes | Yes | UUID; immutable |
| `instanceId` | `string` | Yes | No | FK to StartupTaskInstance |
| `programId` | `string` | Yes | No | FK |
| `projectId` | `string` | Yes | No | FK |
| `blockerType` | `enum` | Yes | No | `PENDING_OWNER_ACTION` \| `PENDING_PERMIT` \| `PENDING_SUBCONTRACTOR_COI` \| `PENDING_INTERNAL_SETUP` \| `PENDING_INFORMATION` \| `PENDING_SYSTEM_SETUP` \| `DEPENDENCY_UNSATISFIED` \| `OTHER` |
| `description` | `string` | Yes | No | Full description of the blocking condition |
| `responsibleParty` | `string` | No | No | Name or role of the party who must resolve |
| `dueDate` | `date` | No | No | Target resolution date |
| `blockerStatus` | `enum` | Yes | No | `OPEN` \| `RESOLVED` \| `WAIVED` |
| `isAutoCreated` | `boolean` | Yes | Yes | True if the system created this stub automatically (e.g., on a CRITICAL task result = NO) |
| `linkedWaiverId` | `string` | No | No | FK to ExceptionWaiverRecord if this blocker has an approved waiver |
| `resolvedAt` | `datetime` | No | Yes | |
| `resolvedBy` | `string` | No | No | |
| `createdAt` | `datetime` | Yes | Yes | |
| `createdBy` | `string` | Yes | No | userId or `SYSTEM` for auto-created stubs |

### 8.2 Blocker Lifecycle

```
OPEN → RESOLVED (task is corrected or external action taken; task result updated to YES)
OPEN → WAIVED (PE approves ExceptionWaiverRecord; linkedWaiverId set)
```

- `OPEN` blockers with `gatingImpact = BLOCKS_CERTIFICATION` prevent certification submission unless an approved waiver covers the blocker.
- `OPEN` blockers with `gatingImpact = REQUIRES_BLOCKER_IF_OPEN` are listed in the certification payload; PE sees them in the gate record.
- Resolving a blocker does not automatically change the task `result`. The PM must separately update the task result to `YES` after resolving the blocker. This ensures the task result is a deliberate human act, not a side effect of blocker management.

### 8.3 Auto-Creation Rules

The API auto-creates a `TaskBlocker` stub in these conditions:

| Condition | Auto-created blocker type | `isAutoCreated` | Behavior |
|---|---|---|---|
| Task with `severity = CRITICAL` has `result = NO` saved | `OTHER` (PM must specify) | True | Stub created with empty `description`; PM must fill in; Work Queue item raised |
| Task with `DEPENDENCY_UNSATISFIED` response blocked | `DEPENDENCY_UNSATISFIED` | True | System-created with description listing unsatisfied dependency task numbers |

Auto-created stubs are `OPEN` until PM provides `description` and either resolves or waive them. An auto-created stub with no `description` is flagged in the certification pre-check.

---

## 9. Task Completion vs. Readiness Approval — Critical Distinction

This distinction is the architectural reason the task library is not a simple checklist:

**Task completion** (`result = YES`) means: a member of the project team has confirmed that this specific action has been taken on this project. It is self-declared by the PM team. It is audited by `@hbc/versioned-record`.

**Readiness approval** (PE accepts `ReadinessCertification` for `STARTUP_TASK_LIBRARY`) means: PE has reviewed the full task library state — all results, all blockers, all waivers — and has formally accepted that the project is ready to mobilize with respect to this surface. It requires deliberate PE gate action.

A task library with 55 `YES` results is not "certified." It is "operationally complete" — eligible for certification submission. Certification requires that the PM submits and PE accepts.

Conversely, a task library with some `NO` results and documented `OPEN` blockers may still be certified if PE reviews the blockers and waivers and accepts the state as adequate for mobilization. **The PM cannot force certification by setting tasks to YES. The PE cannot be bypassed by completing tasks.**

---

## 10. Readiness Gate Criteria for STARTUP_TASK_LIBRARY

The `ReadinessGateRecord` for `STARTUP_TASK_LIBRARY` evaluates the following criteria (from T02 §3.7):

| Criterion | What PE evaluates |
|---|---|
| `TASK_LIB_ALL_REVIEWED` | Every `StartupTaskInstance` has `result ≠ null`, OR has a `TaskBlocker` in OPEN status documenting why it is unreviewed |
| `TASK_LIB_CRITICAL_COMPLETE` | All instances with `severity = CRITICAL` have `result = YES` or an approved `ExceptionWaiverRecord` |
| `TASK_LIB_NO_UNWAIVED_BLOCKERS` | All `TaskBlocker` records in `OPEN` status either have a linked approved waiver or have `gatingImpact = ADVISORY` |

PE may add additional criteria to a specific gate evaluation at their discretion.

---

## 11. Tasks Active During Stabilization

Tasks with `activeDuringStabilization = true` on their template may have their `result` corrected during the `STABILIZING` state. This applies to tasks that are commonly completed during early mobilization rather than pre-mobilization:

| Typical task examples | Rationale |
|---|---|
| Section 4 permit posting tasks | Permits often arrive during mobilization week |
| 2.11 Obtain Sub COI | Final COI sometimes received at mobilization |
| 2.12 Provide Owner COI | May be sent at NTP or mobilization |
| 2.13 Record Notice of Commencement | Often recorded at or just after mobilization |
| 2.31 Provide Superintendent with Safety Plan | Distributed at or during mobilization |

Tasks with `activeDuringStabilization = false` have their `result` field set to read-only when the program reaches `MOBILIZED`. Any attempt to update these tasks during `STABILIZING` returns HTTP 409 with `TASK_STABILIZATION_LOCKED`.

The full `activeDuringStabilization` flag for each task is defined in the template catalog in §12 below.

---

## 12. Full Task Library — Template Catalog

The following catalog defines every governed `StartupTaskTemplate` in the library. Fields shown: Task Number | Title | Category | Sev | Gating | Owner | Due Trigger | Active During Stab.

**Severity codes:** C = Critical | H = High | S = Standard
**Gating codes:** B = Blocks Certification | R = Requires Blocker | A = Advisory
**Owner codes:** PM | PA | PX | ACCT = Project Accountant | SUPER = Superintendent | SAFETY
**Due trigger codes:** PROJ = On Project Creation | CONT = On Contract Execution | NTP = On NTP Issued | MOB-N = N days before mobilization | NONE

### Section 1 — Review Owner's Contract (4 tasks)

| No. | Title | Cat | Sev | Gating | Owner | Due | Stab |
|---|---|---|---|---|---|---|---|
| 1.1 | Split savings clause if any & Contingency usage parameters | `CONTRACTUAL_OBLIGATION` | C | B | PM | CONT | No |
| 1.2 | Liquidated damages are? | `CONTRACTUAL_OBLIGATION` | C | B | PM | CONT | No |
| 1.3 | Any other special terms to be aware of? | `CONTRACTUAL_OBLIGATION` | H | R | PM | CONT | No |
| 1.4 | Allowances to track — Set up change event to track | `CONTRACTUAL_OBLIGATION` | H | R | PM | CONT | No |

### Section 2 — Job Start-Up (33 tasks)

| No. | Title | Cat | Sev | Gating | Owner | Due | Stab |
|---|---|---|---|---|---|---|---|
| 2.1 | Review Bonding / SDI Requirements (HB and Subcontractor) | `CONTRACTUAL_OBLIGATION` | C | B | PX | CONT | No |
| 2.2 | Complete Bond Application(s) and Submit to CFO to obtain (If Applicable) | `CONTRACTUAL_OBLIGATION` | C | B | PX | CONT | No |
| 2.3 | Verify project is set up job in Accounting | `ADMIN_SETUP` | H | R | ACCT | PROJ | No |
| 2.4 | Verify job is set up in Procore (see Job Set Up Procedures) | `ADMIN_SETUP` | H | R | PA | PROJ | No |
| 2.5 | Job Turnover Meeting from Estimating to Project Team | `TEAM_SETUP` | C | B | PM | PROJ | No |
| 2.6 | Have Budget rolled from Sage Estimating to Accounting (if Applicable) | `FINANCIAL_SETUP` | H | R | ACCT | PROJ | No |
| 2.7 | Have Budget rolled from Sage Accounting to Procore | `FINANCIAL_SETUP` | H | R | ACCT | PROJ | No |
| 2.8 | Order Project Signs through HB Marketing Department | `COMMUNITY_AND_EXTERNAL` | S | A | PA | MOB-21 | Yes |
| 2.9 | Enter Drawings and Specifications in Procore | `ADMIN_SETUP` | H | R | PA | MOB-14 | No |
| 2.10 | Contract to Owner with Schedule of Values / Pay app | `OWNER_COORDINATION` | C | B | PM | CONT | No |
| 2.11 | Obtain all Subcontractor COI prior to MOB | `SUBCONTRACTOR_MANAGEMENT` | C | B | PA | MOB-3 | Yes |
| 2.12 | Provide owner Certificate of Insurance | `OWNER_COORDINATION` | C | B | PM | CONT | Yes |
| 2.13 | Complete and Record Notice of Commencement | `LEGAL_AND_NOTICE` | C | B | PA | CONT | Yes |
| 2.14 | Set up Job Files | `ADMIN_SETUP` | H | R | PA | PROJ | No |
| 2.15 | Set up Management Plan & Logistics plan (Pre-Planning/Staging Meeting) | `SCHEDULE_AND_PLANNING` | C | B | PM | MOB-14 | No |
| 2.16 | Prepare Project Schedule | `SCHEDULE_AND_PLANNING` | C | B | PM | MOB-14 | No |
| 2.17 | Complete Submittal Register in Procore | `ADMIN_SETUP` | H | R | PA | MOB-14 | No |
| 2.18 | Enter items in Job Close-out | `ADMIN_SETUP` | S | A | PA | MOB-14 | No |
| 2.19 | Pre-Construction meeting with City/County/Fire/Building (Verify their checklist) | `OWNER_COORDINATION` | H | R | PM | MOB-7 | No |
| 2.20 | Pre-Construction Meeting with Owner | `OWNER_COORDINATION` | H | R | PM | MOB-7 | No |
| 2.21 | Verify owner has provided Threshold & Testing company/under contract | `OWNER_COORDINATION` | H | R | PM | MOB-14 | Yes |
| 2.22 | Verify need for Photo/Video Surveys of any adjacent property/Structures | `LEGAL_AND_NOTICE` | H | R | PM | MOB-14 | No |
| 2.23 | Verify need for any vibration monitoring | `SITE_SERVICES` | H | R | SUPER | MOB-14 | No |
| 2.24 | Write Subcontracts in Procore (Identify longest lead items & award first) | `SUBCONTRACTOR_MANAGEMENT` | H | R | PM | MOB-14 | No |
| 2.25 | Confirm review of estimate, qualifications & Sub proposals after plan scope reviews | `SUBCONTRACTOR_MANAGEMENT` | H | R | PM | MOB-14 | No |
| 2.26 | Create buyout tracking log (verify any owner provided items and track) | `FINANCIAL_SETUP` | H | R | PM | MOB-14 | No |
| 2.27 | Prepare public relations announcements (when applicable) | `COMMUNITY_AND_EXTERNAL` | S | A | PA | NONE | Yes |
| 2.28 | Create, record and track the NTO. Insert date reminder in Outlook | `LEGAL_AND_NOTICE` | C | B | PA | NTP | Yes |
| 2.29 | Mail Notice to Owner (Certified Mail/Return Receipt) | `LEGAL_AND_NOTICE` | C | B | PA | NTP | Yes |
| 2.30 | Verify Owner's purchase of Builder's Risk Insurance | `CONTRACTUAL_OBLIGATION` | C | B | PM | CONT | Yes |
| 2.31 | Provide Superintendent with Project Safety Plan and SDS Notebook | `SAFETY_COORDINATION` | C | B | SAFETY | MOB-3 | Yes |
| 2.32 | Contact local Utilities and notify them of your project and services required | `SITE_SERVICES` | H | R | SUPER | MOB-14 | No |
| 2.33 | Consider a community awareness program if warranted | `COMMUNITY_AND_EXTERNAL` | S | A | PM | NONE | Yes |

### Section 3 — Order Services and Equipment (6 tasks)

| No. | Title | Cat | Sev | Gating | Owner | Due | Stab |
|---|---|---|---|---|---|---|---|
| 3.1 | Telephone and/or Internet (ordered/set up by the IT Department) | `SITE_SERVICES` | H | R | PA | MOB-14 | Yes |
| 3.2 | Sanitary | `SITE_SERVICES` | H | R | SUPER | MOB-3 | Yes |
| 3.3 | Field Office (ordered through the Main Office) | `SITE_SERVICES` | H | R | SUPER | MOB-14 | Yes |
| 3.4 | Job Office Trailer (Permit is required) | `SITE_SERVICES` | H | R | SUPER | MOB-14 | Yes |
| 3.5 | Order/Re-stock First Aid Kit & Purchase/Recharge fire extinguishers | `SAFETY_COORDINATION` | C | B | SUPER | MOB-3 | Yes |
| 3.6 | Other | `SITE_SERVICES` | S | A | PM | NONE | Yes |

### Section 4 — Permits Posted on Jobsite (12 tasks)

Section 4 tasks are governed by the Permit Posting Verification model (T07 §4). They cross-reference the Permits module for display context but do not write to it. All Section 4 tasks have `activeDuringStabilization = true` because permits routinely arrive during early mobilization.

| No. | Title | Cat | Sev | Gating | Owner | Due | Stab |
|---|---|---|---|---|---|---|---|
| 4.01 | Master permit | `PERMIT_POSTING` | C | B | SUPER | MOB-0 | Yes |
| 4.02 | Roofing permit | `PERMIT_POSTING` | H | R | SUPER | MOB-0 | Yes |
| 4.03 | Plumbing permit | `PERMIT_POSTING` | H | R | SUPER | MOB-0 | Yes |
| 4.04 | HVAC permit | `PERMIT_POSTING` | H | R | SUPER | MOB-0 | Yes |
| 4.05 | Electric permit | `PERMIT_POSTING` | H | R | SUPER | MOB-0 | Yes |
| 4.06 | Fire Alarm permit | `PERMIT_POSTING` | H | R | SUPER | MOB-0 | Yes |
| 4.07 | Fire Sprinklers permit | `PERMIT_POSTING` | H | R | SUPER | MOB-0 | Yes |
| 4.08 | Elevator permit | `PERMIT_POSTING` | S | A | SUPER | MOB-0 | Yes |
| 4.09 | Irrigation permit | `PERMIT_POSTING` | S | A | SUPER | MOB-0 | Yes |
| 4.10 | Low Voltage permit | `PERMIT_POSTING` | S | A | SUPER | MOB-0 | Yes |
| 4.11 | Site-Utilities — Drainage, Water & Sewer permits | `PERMIT_POSTING` | H | R | SUPER | MOB-0 | Yes |
| 4.12 | Any Right of way, FDOT, MOT plans, etc. | `PERMIT_POSTING` | H | R | SUPER | MOB-0 | Yes |

> **MOB-0** for Section 4 tasks means "by mobilization date" — not before, but by. Section 4 is explicitly designed for confirmation at mobilization, hence all tasks are `activeDuringStabilization = true`.

---

## 13. Completion Criteria and Certification Eligibility

### 13.1 Definition of Certification Eligibility

The `STARTUP_TASK_LIBRARY` certification may be submitted when all of the following are true:

1. Every `StartupTaskInstance` has `result ≠ null` OR has at least one `TaskBlocker` in `OPEN` status with `description` populated
2. Every instance with `severity = CRITICAL` and `result = NO` has either (a) an auto-created blocker with `description` populated, or (b) an approved `ExceptionWaiverRecord`
3. Every instance with `severity = HIGH` and `result = NO` or `null` has a `TaskBlocker` in OPEN status (may be unresolved at submission)
4. No auto-created `TaskBlocker` stubs have empty `description` fields

`NO`-result tasks are explicitly permitted in a submitted certification. The purpose of the certification is to document the current state — not to assert that every task is complete. PE reviews the gap state and decides whether to accept, return for correction, or accept with waivers.

### 13.2 Completion Percentage Calculation

```
completionPercentage =
  count(instances where result = YES)
  ÷
  count(instances where result ≠ NA)
  × 100
```

Instances with `result = NA` are excluded from both numerator and denominator. Instances with `result = null` (not yet reviewed) reduce the denominator, pulling the percentage down.

---

*[← T02](P3-E11-T02-Record-Families-Identity-Lifecycle-Certifications-Waivers.md) | [Master Index](P3-E11-Project-Startup-Module-Field-Specification.md) | [T04 →](P3-E11-T04-Contract-Obligations-Register-Operating-Model.md)*
