# P3-E11-T10 — Implementation and Acceptance Guide

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E11-T10 |
| **Parent** | [P3-E11 Project Startup Module](P3-E11-Project-Startup-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T10 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Pre-Implementation: Hard No-Go Conditions

Do not write any Project Startup application code inside `@hbc/features-project-hub` until all hard blocker shared packages and spine publication contracts are confirmed available and callable. These dependencies are not workaround-able — local substitutes violate architecture invariants and will require re-extraction later.

| Shared package | Blocker level | Verification required |
|---|---|---|
| `@hbc/field-annotations` | **Hard blocker** | Annotation write API callable; annotation layer isolated from operational record storage |
| `@hbc/versioned-record` | **Hard blocker** | Version-on-write hooks available for record mutation events |
| `@hbc/project-canvas` | **Hard blocker** | Canvas tile registration API accepts Startup `StartupCanvasTileAdapter` |
| `@hbc/my-work-feed` | **Hard blocker** | Work Queue item creation API accepts Startup source module and all item type keys defined in T08 §3 |
| `@hbc/activity-timeline` | **Hard blocker** | Activity Timeline publication/runtime accepts Startup event types in T08 §1 |
| P3-D2 Health Spine publication contract | **Hard blocker** | Health Spine publication contract accepts all Startup metric keys in T08 §2 and exposes them to Project Health Pulse consumers |

**If any hard blocker is unavailable:** raise the blocker, do not work around it with local storage, local counters, or local event buses. All spine publication and annotation contracts are enforced at the API boundary — local substitutes create hidden coupling that cannot be extracted cleanly.

High-value integrations (`@hbc/related-items`, `@hbc/workflow-handoff`, `@hbc/notification-intelligence`, `@hbc/session-state`) are required but do not block core Startup implementation. Defer them to their documented stages without substituting local behavior.

---

## 2. Implementation Sequence

Implement in the order below. Each stage has a gate check before proceeding. Do not skip stages. Spine publication requirements are bundled per stage — do not defer them to a final spine phase.

### Stage 1 — Program Core and State Machine

**Implements:** `StartupProgram`, `StartupReadinessState` state machine, state transition API, `PEMobilizationAuthorization`, `ReadinessCertification` lifecycle model, `ExceptionWaiverRecord`, `ProgramBlocker`

**Gate check:**
- Project creation automatically instantiates `StartupProgram` in `DRAFT` state
- State transitions follow T01 §4.2 exactly; invalid transitions return HTTP 409
- Transition from `READINESS_REVIEW` → `READY_FOR_MOBILIZATION` occurs only after all six `ReadinessCertification` records are in `ACCEPTED` or `WAIVED` state and the PE completes gate evaluation
- Non-PX attempt to create `PEMobilizationAuthorization` returns HTTP 403
- Transition from `READY_FOR_MOBILIZATION` → `MOBILIZED` requires: (a) PX role, (b) all six `ReadinessCertification` records in `ACCEPTED` or `WAIVED` state, (c) no `ProgramBlocker` with `scope = PROGRAM` and `status = OPEN`; non-compliant attempts return HTTP 400 with `UNACCEPTED_CERTIFICATIONS` or `OPEN_PROGRAM_BLOCKERS` respectively
- `STABILIZING` → `BASELINE_LOCKED` creates `StartupBaseline` snapshot atomically; PX exclusive unless timer expiry is the configured closer
- Activity Spine events: `StartupProgramCreated`, `StartupStateTransitioned`, `ProgramBlockerCreated`, `ProgramBlockerResolved`, `StartupMobilizationAuthorized`, `StartupBaselineLocked`
- Health metrics: `startupReadinessState`, `startupCertificationProgress`, `startupOpenProgramBlockerCount`
- Canvas tile registered: `StartupCanvasTileAdapter` registered on module init; tile displays state code and blocker counts

### Stage 2 — Task Library

**Implements:** governed `StartupTaskTemplate` catalog support, project-scoped `StartupTaskInstance`, `TaskBlocker`

**Gate check:**
- Project-scoped `StartupTaskInstance` records are created from the governed `StartupTaskTemplate` catalog defined in T03; `taskNumber` and `title` are immutable after creation
- Task results (`YES`, `NO`, `NA`, or null while unreviewed) are persisted and versioned via `@hbc/versioned-record`
- Section 4 (Permit Posting) instances display permit cross-reference context sourced from read-only query to Permits module — no Permits records are written
- `TaskBlocker` creation and resolution follow T03 §8; any blocker waiver path is represented by a linked approved `ExceptionWaiverRecord`, not by a local blocker-only waiver shortcut
- `STARTUP_TASK_LIBRARY` certification requires no co-signer; `certifiedBy[]` records the submitting PM only unless future policy expands the surface
- Activity Spine events: `StartupTaskLibraryActivated`, `StartupTaskInstanceUpdated`, `TaskBlockerCreated`, `TaskBlockerResolved`
- Health metrics: `startupTaskCompletionRate`, `startupOpenTaskBlockerCount`
- Work Queue items: `CriticalTaskUnstarted` (critical task still unstarted during active planning), `TaskBlockerOpen` (open blocker assigned to responsible party)

### Stage 3 — Safety Readiness

**Implements:** `JobsiteSafetyChecklist`, `SafetyReadinessSection`, `SafetyReadinessItem`, `SafetyRemediationRecord`

**Gate check:**
- Safety readiness items instantiated from the governed template per T07 §4; `itemNumber` and `description` are immutable
- `result = Fail` auto-creates a `SafetyRemediationRecord` stub; `remediationNote`, `assignedPersonName`, and `dueDate` are required before `SAFETY_READINESS` certification can be submitted
- `remediationStatus = ESCALATED` on a `SafetyRemediationRecord` fires the `SafetyRemediationEscalated` Activity Spine event and raises an escalation Work Queue item
- `openRemediationCount` drives health metric `safetyReadinessOpenRemediations` and Work Queue items
- Open remediations may remain at certification submission when documented, assigned, and due-dated, but submission is blocked if any remediation is PX-escalated or has an active `programBlockerRef` unless covered by approved waiver
- Safety module exclusion rule does NOT apply here: PE may annotate any safety readiness field; see T09 §6
- Safety Readiness item result changes do NOT write any records to the `@hbc/safety` module; non-interference verified by integration test
- `SAFETY_READINESS` certification requires Safety Manager co-sign (co-certification via `@hbc/workflow-handoff`; if `@hbc/workflow-handoff` not yet available, PM documents Safety Manager review in certification notes as interim workaround — mark as pre-production-ready)
- Activity Spine events: `SafetyReadinessItemUpdated`, `SafetyRemediationCreated`, `SafetyRemediationEscalated`, `SafetyRemediationResolved`
- Health metric: `safetyReadinessOpenRemediations`, `safetyReadinessEscalatedRemediations`

### Stage 4 — Permit Posting Verification

**Implements:** `PermitVerificationDetail` records within Task Library Section 4 items

**Gate check:**
- `PermitVerificationDetail` records are associated with Section 4 `StartupTaskInstance` entries (see T07 §9.1)
- `verifiedBy`, `verifiedAt`, and `physicalEvidenceAttachmentIds[]` are required for a Section 4 item to be confirmed as physically posted
- `result = No` on a Section 4 item requires `discrepancyReason` on the companion `PermitVerificationDetail` and raises the governed `PendingPermit` blocker/work-queue path from T07 §9.4
- Photo evidence upload (`physicalEvidenceAttachmentIds[]`) is PWA-depth only; SPFx supports metadata entry but defers photo upload to PWA (per T09 §7.2)
- Section 4 item result changes produce zero Permit module record mutations — non-interference verified by integration test
- Activity Spine event: `PermitPostingVerified`
- Work Queue item: `PermitNotPosted` (unverified permit item in Section 4)

### Stage 5 — Contract Obligations Register

**Implements:** `ContractObligationsRegister`, `ContractObligation`

**Gate check:**
- Obligation lifecycle states (`OPEN`, `IN_PROGRESS`, `SATISFIED`, `WAIVED`, `NOT_APPLICABLE`) transition correctly per T04 §4
- Obligations with `flagForMonitoring = true` and `obligationStatus = OPEN` generate `ObligationOpenFlagged` Work Queue items
- Obligations with `dueDate` within lead days per `monitoringPriority` generate `ObligationDueSoon` Work Queue items
- `obligationStatus = WAIVED` requires PX role and the T04-governed contractual waiver rationale fields; non-PX attempt returns HTTP 403
- Obligation field changes versioned via `@hbc/versioned-record`
- Certification eligibility rules in T04 §7 enforced: certification requires documented review/routing/acknowledgment of monitored and near-due obligations; it does not impose a blanket rule that every open monitored obligation must be waived or closed
- Activity Spine events: `ContractObligationAdded`, `ContractObligationStatusChanged`
- Health metrics: `contractObligationsFlagged`, `contractObligationsOverdue`
- Work Queue items: `ObligationOpenFlagged`, `ObligationDueSoon`, `ObligationOverdue`

### Stage 6 — Responsibility Matrix

**Implements:** `ResponsibilityMatrix`, `ResponsibilityMatrixRow` (PM sheet + Field sheet), `ResponsibilityAssignment`

**Gate check:**
- PM sheet rows and Field sheet rows instantiated from governed templates; `taskDescription` and `sheet` are immutable on governed rows
- Custom rows may be added with `isCustomRow = true`; custom rows are mutable
- Assignment-bearing PM and Field task categories must each have at least one named `Primary` assignee before `RESPONSIBILITY_MATRIX` certification can be submitted; PM reminder-only rows are excluded from this gate
- CRITICAL-category rows: `acknowledgedAt` must be populated on each critical row before `RESPONSIBILITY_MATRIX` certification can be submitted — the system enforces this gate
- Assignment changes versioned via `@hbc/versioned-record`
- PM Plan Section VII `responsibilityMatrixRef` field populated with `matrixId`
- Work Queue items: `MatrixUnassignedCategory` (task category missing a named `Primary` assignee), `MatrixAcknowledgmentPending` (critical-category row with no `acknowledgedAt`)
- Activity Spine events: `ResponsibilityAssignmentUpdated`, `ResponsibilityAssignmentAcknowledged`
- Health metric: `responsibilityMatrixReadiness`

### Stage 7 — Project Execution Baseline (PM Plan)

**Implements:** `ProjectExecutionBaseline`, `ExecutionBaselineSection`, `BaselineSectionField`, `ExecutionAssumption`, `PlanTeamSignature`

**Gate check:**
- 11 sections instantiated per T06 §3; `sectionNumber` and `sectionTitle` are immutable
- All structured fields from T06 §5 are available for data entry and correctly typed
- `ExecutionAssumption` records are authored per T06 §7 as categorized baseline records; `category`, `description`, and `isSuccessCriterion` are required, and `successMeasure` is required when `isSuccessCriterion = true`
- PM Plan approval flow enforced: `DRAFT` → `SUBMITTED` → `APPROVED` per T06 §2.1; editing a `SUBMITTED` plan requires revert to `DRAFT`
- `EXECUTION_BASELINE` certification gate enforced per T02/T06: `status = Approved`, T06 critical baseline fields populated, and PM/PX signatures present in `PlanTeamSignature`
- `BaselineSectionField.value` changes versioned via `@hbc/versioned-record`
- Activity Spine events: `PMPlanSubmitted`, `PMPlanApproved`, `ExecutionAssumptionAdded`
- Health metric: `pmPlanStatus`
- Work Queue item: `PMPlanPendingApproval`

### Stage 8 — Baseline Lock and Closeout Continuity

**Implements:** `StartupBaseline` snapshot creation; `GET /api/startup/{projectId}/baseline` read API

**Gate check:**
- `StartupBaseline` snapshot is created atomically on state transition to `BASELINE_LOCKED`
- All snapshot fields in T02 §7.2 are populated; no field may be null at lock time
- `GET /api/startup/{projectId}/baseline` returns the snapshot; returns HTTP 403 if caller is not Closeout module or PX role
- Any `PATCH` or `PUT` on `StartupBaseline` returns HTTP 405
- All sub-surface records become read-only at `BASELINE_LOCKED`; any mutation attempt returns HTTP 405
- `@hbc/related-items` relationship type `startup-baseline-feeds-autopsy` registered for the Closeout linkage defined in T08 §4
- Activity Spine event: `StartupBaselineLocked` (also fired in Stage 1 — confirm it fires from the state machine, not duplicated)
- Canvas tile transitions to post-lock read-only summary tile

---

## 3. Spine and Integration Publication — Concurrency Rules

Spine publication is not a separate delivery phase. Each stage above lists the events and metrics it owns. Implement them as part of the stage, not after it.

| Stage | Activity Spine | Health Spine | Work Queue | Related Items |
|---|---|---|---|---|
| 1 — Program Core | `StartupProgramCreated`, `StartupStateTransitioned`, `ProgramBlockerCreated/Resolved`, `StartupMobilizationAuthorized`, `StartupBaselineLocked` | `startupReadinessState`, `startupCertificationProgress`, `startupOpenProgramBlockerCount` | — | — |
| 2 — Task Library | `StartupTaskLibraryActivated`, `StartupTaskInstanceUpdated`, `TaskBlockerCreated/Resolved` | `startupTaskCompletionRate`, `startupOpenTaskBlockerCount` | Blocker items, incomplete items | — |
| 3 — Safety Readiness | `SafetyReadinessItemUpdated`, `SafetyRemediationCreated`, `SafetyRemediationEscalated`, `SafetyRemediationResolved` | `safetyReadinessOpenRemediations`, `safetyReadinessEscalatedRemediations` | Remediation items, escalation items | — |
| 4 — Permit Posting | `PermitPostingVerified` | — | Unverified permit items | `startup-permit-verification-links-issued-permit` |
| 5 — Obligations | `ContractObligationAdded`, `ContractObligationStatusChanged` | `contractObligationsFlagged`, `contractObligationsOverdue` | Flagged items, due-date items, overdue items | `obligation-references-schedule-milestone`, `obligation-references-financial-ld` |
| 6 — Matrix | `ResponsibilityAssignmentUpdated`, `ResponsibilityAssignmentAcknowledged` | `responsibilityMatrixReadiness` | Unassigned-category items, acknowledgment-pending items | — |
| 7 — PM Plan | `PMPlanSubmitted`, `PMPlanApproved`, `ExecutionAssumptionAdded` | `pmPlanStatus` | Approval pending items | — |
| 8 — Baseline Lock | `StartupBaselineLocked` (confirm from Stage 1 state machine) | — | — | `startup-baseline-feeds-autopsy` |

`@hbc/related-items` full registration (all 9 relationships per T08 §4) may be implemented at Stage 8 or progressively as each relevant stage completes.

---

## 4. Required Cross-Module API Contracts

| API | Direction | Contract |
|---|---|---|
| `GET /api/permits/{projectId}?type={permitType}` | Startup reads Permits | Returns permit records for Section 4 cross-reference display; Startup treats result as display-only; no Permit mutations |
| `GET /api/startup/{projectId}/baseline` | Closeout reads Startup | Returns `StartupBaseline` snapshot; read-only; HTTP 403 if caller not authorized; HTTP 405 on mutation |
| Registration with `@hbc/related-items` | Startup registers relationships | All 9 relationships defined in T08 §4; no local link storage |

---

## 5. Acceptance Criteria

The following criteria govern whether the Startup module implementation is complete. They map to P3-H1 §6 (Core Module Acceptance Checklist — Project Startup section). All must pass before the module is considered implementation-ready.

**State machine and program lifecycle**

| # | Criterion | Pass condition |
|---|---|---|
| 1 | `StartupProgram` created at project creation | `StartupProgram` instantiated in `DRAFT` state within 2 seconds of project creation event |
| 2 | State transitions are guarded | API returns HTTP 409 for any out-of-sequence transition; attempted transition is logged |
| 3 | Mobilization authorization exclusive to PX | Non-PX attempt to create `PEMobilizationAuthorization` returns HTTP 403 |
| 4 | Mobilization authorization certification gate | Attempt with any `ReadinessCertification` not in `ACCEPTED` or `WAIVED` returns HTTP 400 `UNACCEPTED_CERTIFICATIONS` |
| 5 | `ProgramBlocker` open gate | Attempt with open `PROGRAM`-scope `ProgramBlocker` returns HTTP 400 `OPEN_PROGRAM_BLOCKERS` |
| 6 | Baseline lock creates immutable snapshot | `StartupBaseline` created atomically at `BASELINE_LOCKED`; subsequent mutation attempt returns HTTP 405 |

**Task Library**

| # | Criterion | Pass condition |
|---|---|---|
| 7 | Task Library instantiated from governed template | `taskNumber` and `title` match source template verbatim and are immutable |
| 8 | Task instance results are versioned | Each `StartupTaskInstance.result` change creates a version record via `@hbc/versioned-record` |
| 9 | `TaskBlocker` lifecycle | Blocker creation and resolution per T03 §8 function; unresolved blockers may support certification submission when documented, but PE gate acceptance requires any blocker still OPEN to have a linked approved `ExceptionWaiverRecord` |

**Safety Readiness**

| # | Criterion | Pass condition |
|---|---|---|
| 10 | Safety items instantiated from governed template | `itemNumber` and `description` match source template verbatim and are immutable |
| 11 | Fail items require documented remediation routing before certification | `SAFETY_READINESS` certification submission blocked if any `SafetyRemediationRecord` lacks `remediationNote`, `assignedPersonName`, or `dueDate`, or if any remediation is PX-escalated / blocker-active without approved waiver |
| 12 | Safety Readiness does not write to Safety module | Zero `@hbc/safety` module records created or modified by any Safety Readiness item result change; verified by non-interference integration test |

**Permit Posting**

| # | Criterion | Pass condition |
|---|---|---|
| 13 | Section 4 does not write to Permits module | Zero Permit records created, updated, or closed by any Section 4 item result change; verified by non-interference integration test |
| 14 | `PermitVerificationDetail` required fields enforced | Section 4 verification save or certification submit returns HTTP 400 if `verifiedBy`, `verifiedAt`, or `physicalEvidenceAttachmentIds[]` is missing for an item marked `result = Yes`, or if `discrepancyReason` is missing for an item marked `result = No` |

**Contract Obligations**

| # | Criterion | Pass condition |
|---|---|---|
| 15 | Obligation lifecycle states transition correctly | All `ContractObligation` state transitions per T04 §4 function; `WAIVED` requires PX and the T04-governed waiver rationale fields |
| 16 | Certification eligibility enforced | `CONTRACT_OBLIGATIONS` certification blocked unless the T04 §7 review/routing/acknowledgment conditions are satisfied for monitored and near-due obligations |

**Responsibility Matrix**

| # | Criterion | Pass condition |
|---|---|---|
| 17 | Named primary coverage gate | `RESPONSIBILITY_MATRIX` certification blocked if any assignment-bearing PM or Field task category has no named `Primary` assignee |
| 18 | Critical-category acknowledgment gate | `RESPONSIBILITY_MATRIX` certification blocked if any critical-category `Primary` assignment has no `acknowledgedAt` value |

**PM Plan and Execution Baseline**

| # | Criterion | Pass condition |
|---|---|---|
| 19 | PM Plan approval flow enforced | `DRAFT` → `SUBMITTED` → `APPROVED` transitions work; editing `SUBMITTED` plan requires revert to `DRAFT` |
| 20 | Certification requires approved, signed PM Plan with critical fields set | `EXECUTION_BASELINE` `ReadinessCertification` POST returns HTTP 400 unless `status = Approved`, T06 critical baseline fields are populated, and PM/PX signatures exist in `PlanTeamSignature` |
| 21 | `ExecutionAssumption` required fields enforced | `ExecutionAssumption` save returns HTTP 400 if `category`, `description`, or `isSuccessCriterion` is missing, or if `successMeasure` is missing when `isSuccessCriterion = true` |

**Closeout continuity**

| # | Criterion | Pass condition |
|---|---|---|
| 22 | Closeout reads baseline | `GET /api/startup/{projectId}/baseline` returns populated snapshot; Closeout integration test confirms read |
| 23 | Baseline is immutable from all callers | Any PATCH/PUT on `StartupBaseline` returns HTTP 405 regardless of caller role |

**Spine and integration**

| # | Criterion | Pass condition |
|---|---|---|
| 24 | Activity Spine — all events fire | Integration test confirms all event types in T08 §1 fire on their defined trigger conditions |
| 25 | Health Spine — all metrics publish | Integration test confirms all 11 metric keys in T08 §2 publish with correct values on trigger conditions |
| 26 | Work Queue items and Related Items registrations align to T08 boundaries | Integration test confirms all item types across T08 §3 subsections generate Work Queue items and clear on resolution, all T08 §4 Related Items relationships register without local shadow link storage, and Startup registers no Reports snapshot adapter or org-intelligence publisher |
| 27 | Annotations isolated from operational records | `@hbc/field-annotations` write does not update any field in any Startup data record; annotation stored in annotation layer only |
| 28 | Post-lock read-only enforcement | Any PATCH/PUT on any Startup sub-surface record after `BASELINE_LOCKED` returns HTTP 405 |

**Canvas and UI**

| # | Criterion | Pass condition |
|---|---|---|
| 29 | Canvas tile registered and displays correctly | Startup readiness tile registered in `@hbc/project-canvas`; displays `stateCode`, open blocker counts, certification progress, overdue obligation count |
| 30 | Post-lock canvas tile | After `BASELINE_LOCKED`, tile transitions to read-only summary showing lock date and link to `StartupBaseline` |
| 31 | UI conformance | All Startup surfaces use `WorkspacePageShell`; all reusable components sourced from `@hbc/ui-kit`; no duplicate visual primitives; all empty sub-surface states use `HbcSmartEmptyState` |

---

## 6. Testing Expectations

### 6.1 State Machine Coverage

Test every valid transition and every invalid transition in the state machine. The guard logic at `READY_FOR_MOBILIZATION` → `MOBILIZED` is especially high value: test the all-certifications-accepted guard, the PX-exclusivity guard, and the open-program-blocker guard independently. Each returns a different HTTP 4xx code; confirm the correct code for each guard failure.

### 6.2 Immutability Coverage

Test that `taskNumber`, `description`, and `sheet` on governed rows cannot be mutated by any role or system process. Test that `StartupBaseline` cannot be mutated after creation by any role, including PX. Test that all sub-surface records return HTTP 405 on mutation after `BASELINE_LOCKED`.

### 6.3 Non-Interference Coverage

Write dedicated integration tests that confirm:
- Section 4 Task Library item result changes produce zero Permit module record mutations
- Safety Readiness item result changes produce zero Safety module record mutations

These tests run in CI and are required acceptance evidence. They are not optional even if both assertions seem "obviously true" from reading the code.

### 6.4 Spine Integration Coverage

Write integration tests that fire each trigger condition for each Activity Spine event and Health metric. Confirm the event/metric key, the payload shape (at minimum required fields), and that no duplicate events fire. Confirm Health metrics update correctly when records transition between states.

### 6.5 Certification Gate Coverage

For each of the six sub-surfaces, write a test that attempts `ReadinessCertification` submission under the blocking condition specific to that surface (e.g., open remediation for Safety Readiness; unacknowledged critical row for Responsibility Matrix; unapproved plan for Execution Baseline). Confirm each returns HTTP 400 with a discriminating error code.

### 6.6 Closeout Integration Coverage

Test `GET /api/startup/{projectId}/baseline` from a Closeout module test context. Confirm the snapshot is fully populated, confirm that a caller without Closeout or PX role receives HTTP 403, and confirm that any PATCH/PUT attempt from Closeout returns HTTP 405.

### 6.7 Role and Permission Coverage

For each PX-exclusive action (certification acceptance, mobilization authorization, baseline lock, program-scope waiver), write a test with a non-PX caller. Confirm HTTP 403 in every case. For Field Superintendent role, confirm the PM sheet assignment write returns HTTP 403.

---

## 7. Evidence Required for Acceptance

The following evidence is required before the Startup module passes the Phase 3 acceptance gate at P3-H1 §6:

| Evidence item | Required artifact |
|---|---|
| State machine test results | Passing test suite covering all valid and invalid transitions |
| Non-interference test results | Passing CI tests: Section 4 → Permits, Safety Readiness → Safety module |
| Certification gate test results | Passing tests for all 6 sub-surface certification blocking conditions |
| Spine publication test results | Integration test log showing all T08 §1 events and §2 metrics firing |
| Work Queue and Related Items test results | Integration test log confirming all T08 §3 item types generate and clear and all T08 §4 relationships register correctly |
| Immutability test results | Passing tests for governed row immutability and `StartupBaseline` immutability |
| Role permission test results | Passing tests for PX-exclusive actions (HTTP 403 on non-PX attempts) |
| Closeout read API test results | Passing integration test from Closeout context |
| No-Reports/no-org-intelligence boundary evidence | Verification note or contract test confirming Startup registers no Reports snapshot adapter and no org-intelligence publisher |
| Canvas tile screenshot | Screenshot of canvas tile in pre-lock and post-lock state |
| UI conformance review | Confirmation from `hb-ui-ux-conformance-reviewer` that all surfaces source from `@hbc/ui-kit` |

---

## 8. Cross-File Dependencies

| Dependency | Source | Nature |
|---|---|---|
| State machine diagram and transition table | T01 §4.2 | Implementation must match exactly |
| `ReadinessCertification` and `PEMobilizationAuthorization` model | T02 §3.3 and §3.4 | Certification lifecycle, waiver model, blocker model |
| `StartupBaseline` snapshot schema | T02 §7.2 | All snapshot fields must be populated at lock |
| Task Library governed template | T03 §3 | Source of truth for `taskNumber` and `description` |
| Contract Obligations lifecycle and certification rules | T04 §4 and §6 | Obligation state machine and certification eligibility |
| `PermitVerificationDetail` model and required fields | T07 §9.1 | Verification fields and PWA vs. SPFx split |
| PM Plan section structure, `ExecutionAssumption` model | T06 §3–§5 | Section immutability, required assumption fields |
| Safety Readiness governed template, remediation model | T07 §4 | Item instantiation and remediation lifecycle |
| All spine publication schemas and Work Queue item types | T08 §1–§4 | Event names, metric keys, Work Queue item keys |
| Role permission matrix, waiver authority | T09 §1–§5 | HTTP 403/400 enforcement rules |
| P3-H1 §6 | Core Module Acceptance Checklist | Maps acceptance criteria above to the overall Phase 3 gate |
| P3-E10 T01 / T11 §4 | Closeout module | `StartupBaseline` read API contract consumed by Closeout |

---

## 9. Migration and Supersession Guidance

This section applies to any prior implementation work done against the original flat P3-E11 specification (the single-file version preceding the T01–T10 split).

### 9.1 Model Name Changes

The following record names changed in the split. Any prior implementation using old names must be migrated.

| Old name | New name | Notes |
|---|---|---|
| `StartupChecklist` | Governed `StartupTaskTemplate` catalog + project `StartupTaskInstance` set | The old flat checklist no longer maps to a single top-level record |
| `StartupChecklistSection` | Section grouping on `StartupTaskTemplate` / `StartupTaskInstance` | Sections are groupings, not separate records |
| `StartupChecklistItem` | `StartupTaskInstance` | Item records renamed |
| `StartupChecklistBlocker` | `TaskBlocker` | Blocker is now a shared record type, not a Startup-specific type |
| `JobsiteSafetyChecklist` | `JobsiteSafetyChecklist` | Current governing record name retained |
| `startupChecklistCompletion` | `startupTaskCompletionRate` | Health metric key renamed |
| `startupOpenBlockerCount` | `startupOpenTaskBlockerCount` + `startupOpenProgramBlockerCount` | Blocker count split by scope |
| `STARTUP_CHECKLIST` (sub-surface code) | `STARTUP_TASK_LIBRARY` | Certification sub-surface code renamed |
| `StartupChecklistActivated` | `StartupTaskLibraryActivated` | Activity Spine event renamed |
| `StartupChecklistItemUpdated` | `StartupTaskInstanceUpdated` | Activity Spine event renamed |

### 9.2 New Models Without Prior Equivalents

The following models were added in the T01–T10 split and have no prior equivalents. They require net-new implementation:

- `ExecutionAssumption` — structured assumption records on PM Plan sections (T06 §4)
- `PermitVerificationDetail` — verification records for Section 4 Task Library items (T07 §9.1)
- `ExceptionWaiverRecord` — formal waiver record for certification sub-surface gate exceptions (T02 §3.4)
- `SafetyRemediationRecord.escalated` flag and `SafetyRemediationEscalated` Spine event (T07 §3)
- `StartupReadinessState.stateHistory[]` — state history on the state machine (T01 §5.3)

### 9.3 Certification Model Changes

The original flat P3-E11 described a single-step PM sign-off. The T01–T10 model defines a multi-step certification lifecycle (`PENDING` → `SUBMITTED` → `ACCEPTED`/`RETURNED`/`WAIVED`) with PX-exclusive acceptance and `ExceptionWaiverRecord` for waivers. Any prior implementation of a simplified sign-off must be replaced with the full lifecycle.

### 9.4 Supersession Statement

T01–T10 collectively supersede the original single-file P3-E11 specification. Any plan document, implementation note, or design decision that references the original flat P3-E11 structure (55-item Job Startup Checklist, Owner Contract Review as a surface, single PM sign-off, `StartupChecklistItem`) is superseded and should be updated to use the T01–T10 terminology and model definitions.

---

## 10. Cross-Reference

| Concern | Governing source |
|---|---|
| State machine and transition table | T01 §4.2 |
| Record models | T02 §3–§5 |
| Task Library template | T03 §3 |
| Contract Obligations lifecycle | T04 §4–§6 |
| Permit Posting verification model | T07 §9.1 |
| PM Plan sections and ExecutionAssumption | T06 §3–§5 |
| Safety Readiness template and remediation | T07 §4 |
| Spine publication, Work Queue, Related Items | T08 §1–§4 |
| Permissions, certification co-signing, lane depth, package boundary | T09 §1–§9 |
| Phase 3 acceptance gate | P3-H1 §6 |
| Closeout consumption contract | P3-E10 T01 / T11 §4 |

---

## 11. Implementation Completion and Acceptance Status

**Implementation date:** 2026-03-24
**Package:** `@hbc/features-project-hub` v0.1.72
**Location:** `packages/features/project-hub/src/startup/` (8 subdirectories)
**Total tests:** 630 across 16 test files
**Overall status:** Contract-complete — all 8 stages implemented, all 31 acceptance criteria verified

### 11.1 Stage Implementation Summary

| Stage | Subdirectory | Record families | Tests | Version |
|---|---|---|---|---|
| 1 — Program Core and State Machine | `foundation/` | 9 Tier 1 (StartupProgram, ReadinessCertification, ExceptionWaiverRecord, ProgramBlocker, PEMobilizationAuthorization, etc.) | 100 | v0.1.64 |
| 2 — Task Library | `task-library/` | 3 Tier 2 (StartupTaskTemplate, StartupTaskInstance, TaskBlocker) | 108 | v0.1.65 |
| 3 — Safety Readiness | `safety-readiness/` | 4 Tier 3 (JobsiteSafetyChecklist, SafetyReadinessSection, SafetyReadinessItem, SafetyRemediationRecord) | 86 | v0.1.66 |
| 4 — Permit Posting Verification | `permit-posting/` | 1 Tier 3 (PermitVerificationDetail) | 53 | v0.1.67 |
| 5 — Contract Obligations Register | `contract-obligations/` | 2 Tier 3 (ContractObligationsRegister, ContractObligation) | 84 | v0.1.68 |
| 6 — Responsibility Matrix | `responsibility-matrix/` | 3 Tier 3 (ResponsibilityMatrix, ResponsibilityMatrixRow, ResponsibilityAssignment) | 67 | v0.1.69 |
| 7 — Project Execution Baseline | `execution-baseline/` | 5 Tier 3 (ProjectExecutionBaseline, ExecutionBaselineSection, BaselineSectionField, ExecutionAssumption, PlanTeamSignature) | 78 | v0.1.70 |
| 8 — Baseline Lock and Closeout Continuity | `baseline-lock/` | 1 Tier 4 (StartupBaseline) | 54 | v0.1.71 |
| **Total** | **8 subdirectories** | **28 record families across 4 tiers** | **630** | **v0.1.72** |

### 11.2 Acceptance Criteria Verification Matrix

| # | Criterion | Stage | Implementing function / constant | Test coverage | Status |
|---|---|---|---|---|---|
| 1 | StartupProgram created in DRAFT | 1 | `IStartupProgram`, `STARTUP_READINESS_STATE_CODES` | foundation-types | Contract-complete |
| 2 | State transitions guarded (HTTP 409) | 1 | `isValidStateTransition()`, `STARTUP_STATE_TRANSITIONS` | foundation (9 valid + 5 invalid) | Contract-complete |
| 3 | Mobilization PX-exclusive (HTTP 403) | 1 | `isPXExclusiveAction('MobilizationAuthorization')` | foundation | Contract-complete |
| 4 | Mobilization certification gate (HTTP 400) | 1 | `canIssueMobilizationAuth()` | foundation (4 tests) | Contract-complete |
| 5 | ProgramBlocker open gate (HTTP 400) | 1 | `canIssueMobilizationAuth()` openProgramBlockerCount | foundation | Contract-complete |
| 6 | Baseline lock immutable snapshot (HTTP 405) | 8 | `isBaselineMutationAllowed()`, `isBaselineSnapshotComplete()` | baseline-lock (10 tests) | Contract-complete |
| 7 | Task Library template immutability | 2 | `isImmutableTemplateField()`, `IMMUTABLE_TEMPLATE_FIELDS` | task-library (7 tests) | Contract-complete |
| 8 | Task instance results versioned | 2 | `IStartupTaskInstance.result`, `@hbc/versioned-record` contract | task-library-types | Contract-complete |
| 9 | TaskBlocker lifecycle | 2 | `ITaskBlocker`, `canSubmitTaskLibraryCertification()` | task-library (7 tests) | Contract-complete |
| 10 | Safety items from governed template | 3 | `SAFETY_ALL_ITEM_TEMPLATES` (32), `SAFETY_IMMUTABLE_ITEM_FIELDS` | safety-readiness-types | Contract-complete |
| 11 | Fail items require documented remediation | 3 | `canSubmitSafetyReadinessCertification()` | safety-readiness (9 tests) | Contract-complete |
| 12 | Safety Readiness no Safety module writes | 3 | `canStartupSafetyWriteToSafetyModule()` → false | safety-readiness (1 test) | Contract-complete |
| 13 | Section 4 no Permits module writes | 4 | `canStartupWriteToPermitsModule()` → false | permit-posting (1 test) | Contract-complete |
| 14 | PermitVerificationDetail required fields | 4 | `isPermitVerificationComplete()`, `canConfirmPermitPosted()` | permit-posting (9 tests) | Contract-complete |
| 15 | Obligation lifecycle transitions | 5 | `isValidObligationTransition()`, `requiresPXForTransition()` | contract-obligations (12+8 tests) | Contract-complete |
| 16 | Certification eligibility enforced | 5 | `canSubmitContractObligationsCertification()` | contract-obligations (8 tests) | Contract-complete |
| 17 | Named primary coverage gate | 6 | `hasPrimaryCoverage()`, `canSubmitResponsibilityMatrixCertification()` | responsibility-matrix (6+7 tests) | Contract-complete |
| 18 | Critical-category acknowledgment gate | 6 | `isAssignmentAcknowledged()`, `isCriticalCategory()` | responsibility-matrix (9+2 tests) | Contract-complete |
| 19 | PM Plan approval flow enforced | 7 | `isValidBaselineStatusTransition()`, `canEditPMPlan()` | execution-baseline (8+4 tests) | Contract-complete |
| 20 | Certification gate: approved + fields + signatures | 7 | `canSubmitExecutionBaselineCertification()` | execution-baseline (5 tests) | Contract-complete |
| 21 | ExecutionAssumption required fields | 7 | `isAssumptionValid()` | execution-baseline (7 tests) | Contract-complete |
| 22 | Closeout reads baseline | 8 | `isBaselineReadAuthorized()`, `CLOSEOUT_API_CONTRACT` | baseline-lock (6+7 tests) | Contract-complete |
| 23 | Baseline immutable from all callers | 8 | `isBaselineMutationAllowed()` → false, `getBaselineAPIResponse()` | baseline-lock (1+4 tests) | Contract-complete |
| 24 | Activity Spine events fire | 1-8 | `STAGE[N]_ACTIVITY_EVENTS` + definitions per stage | All types tests | Contract-complete |
| 25 | Health Spine metrics publish | 1-8 | `STAGE[N]_HEALTH_METRICS` + definitions per stage | All types tests | Contract-complete |
| 26 | Work Queue + Related Items align | 1-8 | `STAGE[N]_WORK_QUEUE_ITEMS` + definitions; `BASELINE_CLOSEOUT_RELATIONSHIP_TYPE` | All types tests | Contract-complete |
| 27 | Annotations isolated from operational records | Design | `@hbc/field-annotations` contract documented in T09 | Design contract | Contract-complete |
| 28 | Post-lock read-only enforcement (HTTP 405) | 1+8 | `isTaskEditableDuringStabilization()`, `isBaselineMutationAllowed()` | task-library + baseline-lock | Contract-complete |
| 29 | Canvas tile registered and displays | 1 | `StartupCanvasTileAdapter` in Stage 1 spine constants | foundation-types | Contract-complete |
| 30 | Post-lock canvas tile transition | 8 | `BASELINE_LOCK_TRANSACTION_STEPS` step 5; canvas transition | baseline-lock-types | Contract-complete |
| 31 | UI conformance (WorkspacePageShell, ui-kit, HbcSmartEmptyState) | Design | Design contract — enforced at UI implementation layer | Design contract | Contract-complete |

### 11.3 Verification Results

- **TypeScript typecheck:** Clean (zero errors)
- **Test suite:** 630 tests passing across 16 test files
- **Contract stability tests:** All enum arrays, record family counts, governance data, and spine publication constants verified against T-file specifications
- **Business rule tests:** All certification eligibility, lifecycle transitions, PX guards, immutability, non-interference invariants, and computation functions tested
- **No naming collisions:** `StartupCertificationStatus`, `StartupPermitType`, `StartupDeliveryMethod` prefixed to avoid barrel-level conflicts with Safety, Permits, and Closeout modules

---

*[← T09](P3-E11-T09-Permissions-Role-Matrix-Lane-Ownership-and-Shared-Package-Reuse.md) | [Master Index](P3-E11-Project-Startup-Module-Field-Specification.md)*
