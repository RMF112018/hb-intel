# P3-E11-T02 — Record Families, Identity, Lifecycle, Certifications, Waivers

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E11-T02 |
| **Parent** | [P3-E11 Project Startup Module](P3-E11-Project-Startup-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T02 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Record Family Overview

Project Startup owns 28 distinct record families organized across four tiers. Every record Startup creates or writes to is exclusively owned by `@hbc/project-startup`. No other module writes to these records.

| Tier | Count | Record families |
|---|---:|---|
| **Tier 1 — Program Core** | 9 | StartupProgram, StartupProgramVersion, StartupReadinessState, ReadinessCertification, ReadinessGateRecord, ReadinessGateCriterion, ExceptionWaiverRecord, ProgramBlocker, PEMobilizationAuthorization |
| **Tier 2 — Governed Template and Task Library** | 3 | StartupTaskTemplate, StartupTaskInstance, TaskBlocker |
| **Tier 3 — Project-Scoped Operational Surfaces** | 15 | JobsiteSafetyChecklist, SafetyReadinessSection, SafetyReadinessItem, SafetyRemediationRecord, PermitVerificationDetail, ContractObligationsRegister, ContractObligation, ResponsibilityMatrix, ResponsibilityMatrixRow, ResponsibilityAssignment, ProjectExecutionBaseline, ExecutionBaselineSection, BaselineSectionField, ExecutionAssumption, PlanTeamSignature |
| **Tier 4 — Continuity** | 1 | StartupBaseline |

This four-tier split is intentional:

- Tier 1 governs the readiness program itself.
- Tier 2 mixes one org-governed template family (`StartupTaskTemplate`) with two project-scoped task-execution families.
- Tier 3 contains the project-scoped operational records that certifications review and baseline lock governs.
- Tier 4 contains the immutable continuity snapshot consumed by Closeout.

---

## 2. Identity and Provenance Model

### 2.1 Canonical Identity Rules

Every Startup record follows these baseline identity rules:

- **UUID primary keys:** All `*Id` fields are server-generated UUIDs. Client-proposed IDs are rejected.
- **Immutable IDs:** Once created, primary key values never change. Update operations never touch the PK.
- **Single owner:** Startup remains the only writer for all 28 record families, including the org-governed task template family.

Scoping rules then split by record class:

- **Project-scoped records:** All Startup records except `StartupTaskTemplate` include a `projectId` FK. Operational queries are project-scoped; there are no multi-project mutations.
- **Program-anchored records:** All project-scoped sub-surface and governance records except `StartupBaseline` also include a `programId` FK to `StartupProgram`. This enables a single join to retrieve the active readiness program without traversing the project record repeatedly.
- **Org-governed template record:** `StartupTaskTemplate` is MOE-governed and does not carry `projectId` or `programId`; it is copied into project-scoped `StartupTaskInstance` records when a Startup program is initialized.

### 2.2 Audit and Provenance Requirements

Every record that a user can create or modify must carry the following provenance fields:

| Field | Type | Rule |
|---|---|---|
| `createdAt` | `datetime (UTC)` | Server-assigned on POST; immutable after creation |
| `createdBy` | `string (userId)` | Server-assigned from session context; immutable |
| `lastModifiedAt` | `datetime (UTC)` | Server-assigned on every PATCH; never client-supplied |
| `lastModifiedBy` | `string (userId)` | Server-assigned from session context |

For records governed by `@hbc/versioned-record`, every mutation writes a version entry before applying the change. Mutation audit history is queryable per record.

**Records that require `@hbc/versioned-record` mutation versioning:**

- `StartupTaskInstance.result` — every result change must be versioned
- `SafetyReadinessItem.result` — same
- `ContractObligation.obligationStatus` — lifecycle state transitions must be versioned
- `ResponsibilityAssignment.value` and `assignedPersonName` — assignment changes must be versioned
- `BaselineSectionField.value` — baseline commitment changes must be versioned
- `ReadinessCertification.certStatus` — certification state transitions must be versioned

### 2.3 Publication States

Each project-scoped Tier 2 and Tier 3 operational record carries a `publicationState` field that tracks its status relative to readiness certification and baseline lock. The org-governed `StartupTaskTemplate` does not carry `publicationState`.

```typescript
enum PublicationState {
  Draft     = 'DRAFT',       // actively editable; no baseline lock yet
  Certified = 'CERTIFIED',   // included in an accepted ReadinessCertification
  Locked    = 'LOCKED',      // immutable; baseline lock has occurred
}
```

`publicationState` is system-maintained. It transitions as follows:
- On `ReadinessCertification` `ACCEPTED` for the owning sub-surface: the affected project-scoped operational records for that surface move to `CERTIFIED`
- On `BASELINE_LOCKED` event: all project-scoped operational records move to `LOCKED`
- During `STABILIZING`: `publicationState` may revert to `DRAFT` if PE flags a project-scoped record for re-review

| Record family group | Carries `publicationState`? | Notes |
|---|---|---|
| `StartupTaskTemplate` | No | Org-governed template family; versioned by template release, not by project certification/baseline lock |
| `StartupTaskInstance`, `TaskBlocker` | Yes | Project-scoped task execution records under Startup Program Checklist certification |
| `JobsiteSafetyChecklist`, `SafetyReadinessSection`, `SafetyReadinessItem`, `SafetyRemediationRecord` | Yes | Project-scoped Startup Safety records |
| `PermitVerificationDetail` | Yes | Project-scoped Section 4 verification record |
| `ContractObligationsRegister`, `ContractObligation`, `ResponsibilityMatrix`, `ResponsibilityMatrixRow`, `ResponsibilityAssignment`, `ProjectExecutionBaseline`, `ExecutionBaselineSection`, `BaselineSectionField`, `ExecutionAssumption`, `PlanTeamSignature` | Yes | Project-scoped ledger and baseline records governed by certification and baseline lock |

---

## 3. Tier 1 — Program Core Records

### 3.1 StartupProgram

Root record per project. Created automatically at project creation. Anchors all Startup sub-surface records.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `programId` | `string` | Yes | Yes | UUID; immutable; PK |
| `projectId` | `string` | Yes | No | FK to project record; unique per project |
| `projectName` | `string` | Yes | No | Inherited at creation; not kept in sync (denormalized snapshot) |
| `projectNumber` | `string` | Yes | No | Inherited at creation; immutable after set |
| `currentStateCode` | `enum` | Yes | Yes | Mirrors active `StartupReadinessState.stateCode`; updated on every state transition |
| `stabilizationWindowDays` | `number` | Yes | No | Default 14; PE-configurable at `MOBILIZED` transition; null until set |
| `stabilizationWindowOpensAt` | `datetime` | No | Yes | Timestamp when stabilization window opened; null until `MOBILIZED` |
| `stabilizationWindowClosesAt` | `datetime` | No | Yes | `stabilizationWindowOpensAt + stabilizationWindowDays`; null until set |
| `baselineLockedAt` | `datetime` | No | Yes | Timestamp of `BASELINE_LOCKED`; null until locked |
| `baselineLockedBy` | `string` | No | No | userId of PE who locked; null until locked |
| `createdAt` | `datetime` | Yes | Yes | |
| `createdBy` | `string` | Yes | No | |
| `lastModifiedAt` | `datetime` | Yes | Yes | |
| `lastModifiedBy` | `string` | No | No | |

### 3.2 StartupProgramVersion

Immutable audit log of every `StartupProgram` state transition. One entry per transition. Never deleted or modified.

| Field | Type | Required | Rule |
|---|---|---|---|
| `versionId` | `string` | Yes | UUID; immutable |
| `programId` | `string` | Yes | FK |
| `projectId` | `string` | Yes | FK |
| `fromStateCode` | `enum` | Yes | State before transition; null for initial DRAFT entry |
| `toStateCode` | `enum` | Yes | State after transition |
| `transitionedAt` | `datetime` | Yes | Server-assigned |
| `transitionedBy` | `string` | Yes | userId or `SYSTEM` for timer/auto-transitions |
| `transitionTrigger` | `string` | Yes | Human-readable description of what caused the transition |
| `notes` | `string` | No | PE or PM notes accompanying this transition; particularly important for regressions |

### 3.3 StartupReadinessState

Current lifecycle state. One active record per project at a time; history accumulates as `StartupProgramVersion` entries. This record is the live state — the version table is the audit log.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `stateId` | `string` | Yes | Yes | UUID; immutable |
| `programId` | `string` | Yes | No | FK |
| `stateCode` | `enum` | Yes | No | `DRAFT` \| `ACTIVE_PLANNING` \| `READINESS_REVIEW` \| `READY_FOR_MOBILIZATION` \| `MOBILIZED` \| `STABILIZING` \| `BASELINE_LOCKED` \| `ARCHIVED` |
| `enteredAt` | `datetime` | Yes | Yes | |
| `enteredBy` | `string` | Yes | No | userId or `SYSTEM` |
| `stateNotes` | `string` | No | No | Optional note about this state entry |

### 3.4 ReadinessCertification

One record per sub-surface per project. PM submits to certify a sub-surface is ready; PE reviews via `ReadinessGateRecord`.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `certId` | `string` | Yes | Yes | UUID; immutable |
| `programId` | `string` | Yes | No | FK |
| `projectId` | `string` | Yes | No | FK |
| `subSurface` | `enum` | Yes | No | `STARTUP_TASK_LIBRARY` \| `SAFETY_READINESS` \| `PERMIT_POSTING` \| `CONTRACT_OBLIGATIONS` \| `RESPONSIBILITY_MATRIX` \| `EXECUTION_BASELINE` |
| `certStatus` | `enum` | Yes | No | `NOT_SUBMITTED` \| `SUBMITTED` \| `UNDER_REVIEW` \| `ACCEPTED` \| `REJECTED` \| `CONDITIONALLY_ACCEPTED` \| `WAIVED` |
| `certVersion` | `number` | Yes | Yes | Increments on each submit; tracks how many times this cert has gone through the review cycle |
| `certifierRole` | `enum` | Yes | No | Role of the person who certifies this surface; see §3.8 for required certifiers per surface |
| `certifiedBy` | `string[]` | No | No | userIds of all parties who have signed this certification (some surfaces require co-signatories) |
| `submittedAt` | `datetime` | No | Yes | Timestamp of most recent submission |
| `submittedBy` | `string` | No | No | userId of submitter |
| `openBlockerCount` | `number` | Yes | Yes | Calculated: count of unresolved `TaskBlocker` records for this sub-surface's tasks |
| `openRemediationCount` | `number` | Yes | Yes | For `SAFETY_READINESS` only; count of unresolved `SafetyRemediationRecord` records |
| `approvedWaiverCount` | `number` | Yes | Yes | Count of `ExceptionWaiverRecord` records in `APPROVED` status for this sub-surface |
| `activeGateRecordId` | `string` | No | Yes | FK to most recent `ReadinessGateRecord` for this cert; null until PE initiates review |
| `createdAt` | `datetime` | Yes | Yes | |
| `lastModifiedAt` | `datetime` | Yes | Yes | |

### 3.5 ReadinessGateRecord

Created by PE when initiating review of a submitted `ReadinessCertification`. Documents the structured gate evaluation — what criteria were assessed, what passed, what failed, what was waived.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `gateId` | `string` | Yes | Yes | UUID; immutable |
| `certId` | `string` | Yes | No | FK to ReadinessCertification |
| `programId` | `string` | Yes | No | FK |
| `subSurface` | `enum` | Yes | No | Same as parent ReadinessCertification.subSurface |
| `gateVersion` | `number` | Yes | Yes | Increments if PE re-evaluates after corrections |
| `evaluatedAt` | `datetime` | Yes | Yes | Timestamp of gate evaluation |
| `evaluatedBy` | `string` | Yes | No | userId of PE; must have PX role |
| `gateOutcome` | `enum` | Yes | No | `ACCEPTED` \| `REJECTED` \| `CONDITIONALLY_ACCEPTED` |
| `gateNotes` | `string` | No | No | PE narrative notes on the gate evaluation; visible to PM |
| `criteria` | `ReadinessGateCriterion[]` | Yes | No | Structured criteria assessment; see §3.6 |

### 3.6 ReadinessGateCriterion

One per gate criterion per gate evaluation. The criteria set for each sub-surface is governed (see §3.7); additional criteria may be added by PE at their discretion.

| Field | Type | Required | Rule |
|---|---|---|---|
| `criterionId` | `string` | Yes | UUID; immutable |
| `gateId` | `string` | Yes | FK |
| `criterionCode` | `string` | Yes | Machine-readable code from the governed criterion set (see §3.7) |
| `criterionLabel` | `string` | Yes | Human-readable label |
| `result` | `enum` | Yes | `PASS` \| `FAIL` \| `WAIVED` \| `NOT_APPLICABLE` |
| `peNote` | `string` | No | PE note on this specific criterion; required when `result = FAIL` |

### 3.7 Governed Gate Criteria by Sub-Surface

| Sub-surface | criterionCode | criterionLabel |
|---|---|---|
| `STARTUP_TASK_LIBRARY` | `TASK_LIB_ALL_REVIEWED` | All 55 task instances have a result (Yes, No, or NA) or a documented blocker |
| `STARTUP_TASK_LIBRARY` | `TASK_LIB_CRITICAL_COMPLETE` | All tasks with severity = Critical have result = Yes or an approved waiver |
| `STARTUP_TASK_LIBRARY` | `TASK_LIB_NO_UNWAIVED_BLOCKERS` | All TaskBlockers in OPEN status have an approved ExceptionWaiverRecord |
| `SAFETY_READINESS` | `SAFETY_ALL_ASSESSED` | All 32 safety readiness items have a result |
| `SAFETY_READINESS` | `SAFETY_FAILS_REMEDIATED` | All Fail items have a SafetyRemediationRecord with `remediationNote`, `assignedPersonName`, and `dueDate` populated |
| `SAFETY_READINESS` | `SAFETY_OPEN_REMEDIATIONS_ACKNOWLEDGED` | PE has acknowledged all remediations remaining in `PENDING` or `IN_PROGRESS` status at review time, and none are PX-escalated or blocker-active unless waived |
| `PERMIT_POSTING` | `PERMITS_ALL_REVIEWED` | All 12 Section 4 items have a result |
| `PERMIT_POSTING` | `PERMITS_MATERIAL_PRESENT` | Items covering building permit and master permit are Yes or NA with documented rationale |
| `CONTRACT_OBLIGATIONS` | `CONTRACT_REGISTER_POPULATED` | At least one ContractObligation row exists |
| `CONTRACT_OBLIGATIONS` | `CONTRACT_FLAGGED_REVIEWED` | All flagged obligations have notes populated |
| `CONTRACT_OBLIGATIONS` | `CONTRACT_NEAR_DUE_ADDRESSED` | All obligations with dueDate within 30 days are addressed (not OPEN) |
| `RESPONSIBILITY_MATRIX` | `RM_PM_SHEET_ASSIGNED` | PM sheet has at least one named assignee per task category |
| `RESPONSIBILITY_MATRIX` | `RM_FIELD_SHEET_ASSIGNED` | Field sheet has at least one named assignee per task category |
| `EXECUTION_BASELINE` | `BASELINE_APPROVED` | ProjectExecutionBaseline.status = Approved |
| `EXECUTION_BASELINE` | `BASELINE_CRITICAL_FIELDS_SET` | `safetyOfficerName`, `safetyOfficerRole`, `projectStartDate`, `substantialCompletionDate`, `noticeToProceedDate`, `goalSubstantialCompletionDate`, and `goalFinalCompletionDate` are populated per T06 |
| `EXECUTION_BASELINE` | `BASELINE_SIGNED` | At least PM and PX signatures present in PlanTeamSignature array |

### 3.8 Role-Scoped Certification Ownership

Each sub-surface has defined certifier and co-certifier roles. A certification cannot be submitted unless all required certifiers have marked themselves as ready.

| Sub-surface | Required certifier(s) | PE reviewer | Notes |
|---|---|---|---|
| `STARTUP_TASK_LIBRARY` | PM (any tier) | PX | Single certifier |
| `SAFETY_READINESS` | PM + Safety Manager (co-sign) | PX | Both must sign before submission |
| `PERMIT_POSTING` | PM | PX | Superintendent contributes evidence and verification inputs, but PM submits certification |
| `CONTRACT_OBLIGATIONS` | PM | PX | PA may assist with register upkeep, but PM submits certification |
| `RESPONSIBILITY_MATRIX` | PM (proposes) + PX (reviews as part of certification) | PX | PX approval of Responsibility Matrix is part of the certification act |
| `EXECUTION_BASELINE` | PM (submits) + PX-approved PM Plan prerequisite | PX | PM Plan approval is a prerequisite, but `EXECUTION_BASELINE` still proceeds through `ReadinessCertification` review and acceptance like the other sub-surfaces |

### 3.9 ExceptionWaiverRecord

Approved waiver for a readiness blocker that cannot be resolved before mobilization.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `waiverId` | `string` | Yes | Yes | UUID; immutable |
| `programId` | `string` | Yes | No | FK |
| `certId` | `string` | Yes | No | FK to ReadinessCertification this waiver belongs to |
| `subSurface` | `enum` | Yes | No | Sub-surface this waiver applies to |
| `blockerId` | `string` | No | No | FK to TaskBlocker if waiver is for a task blocker; null for program-level waivers |
| `waivedItemRef` | `string` | Yes | No | Human-readable reference to the waived item (e.g., `Task 2.11 — Subcontractor COI`) |
| `rationale` | `string` | Yes | No | PM-authored rationale for why this item cannot be resolved pre-mobilization |
| `riskAcknowledgment` | `string` | Yes | No | PM statement acknowledging the risk of mobilizing with this item unresolved |
| `plannedResolutionDate` | `date` | Yes | No | PM's committed resolution date post-mobilization |
| `waiverStatus` | `enum` | Yes | No | `PENDING_PE_REVIEW` \| `APPROVED` \| `REJECTED` \| `RESOLVED` \| `LAPSED` |
| `requestedAt` | `datetime` | Yes | Yes | |
| `requestedBy` | `string` | Yes | No | userId of requesting PM |
| `peDecisionAt` | `datetime` | No | Yes | |
| `peDecisionBy` | `string` | No | No | userId of PE who decided |
| `peDecisionNotes` | `string` | No | No | Required when status = REJECTED |
| `resolvedAt` | `datetime` | No | Yes | Timestamp when the underlying item was resolved post-mobilization |
| `resolvedBy` | `string` | No | No | |
| `lapsedAt` | `datetime` | No | Yes | Set if `plannedResolutionDate` passes and `waiverStatus` is not RESOLVED — auto-flagged for PE attention |

**Lapse rule:** If a waiver reaches its `plannedResolutionDate` without resolution, `waiverStatus` transitions to `LAPSED` and a Work Queue item is raised for the responsible PM. Lapsed waivers do not invalidate the baseline but are recorded as `lapsedWaiversAtLock` in `StartupBaseline`.

### 3.10 ProgramBlocker

A program-level obstacle that affects the overall readiness program or spans multiple sub-surfaces. Distinct from `TaskBlocker` (which is tied to a specific task instance).

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `blockerId` | `string` | Yes | Yes | UUID; immutable |
| `programId` | `string` | Yes | No | FK |
| `projectId` | `string` | Yes | No | FK |
| `blockerScope` | `enum` | Yes | No | `PROGRAM` — affects the entire program \| `MULTI_SURFACE` — affects 2+ sub-surfaces |
| `affectedSubSurfaces` | `enum[]` | No | No | Array of sub-surface codes affected; null for PROGRAM scope |
| `blockerType` | `enum` | Yes | No | `OwnerContractNotExecuted` \| `NTPNotIssued` \| `KeyPersonnelNotNamed` \| `SiteNotAvailable` \| `InsuranceGap` \| `Other` |
| `description` | `string` | Yes | No | Full description of the blocking condition |
| `raisedBy` | `string` | Yes | No | userId of PM or PE who raised the blocker |
| `raisedAt` | `datetime` | Yes | Yes | |
| `blockerStatus` | `enum` | Yes | No | `OPEN` \| `RESOLVED` \| `WAIVED` |
| `responsibleParty` | `string` | No | No | Name or role of the party who must resolve |
| `targetResolutionDate` | `date` | No | No | |
| `escalatedToPE` | `boolean` | Yes | No | Default false; set true when PM escalates to PE for review |
| `peResponse` | `string` | No | No | PE response notes when escalated |
| `resolvedAt` | `datetime` | No | Yes | |
| `resolvedBy` | `string` | No | No | |
| `createdAt` | `datetime` | Yes | Yes | |

### 3.11 PEMobilizationAuthorization

Formal PE gate record authorizing project mobilization. One per project. Its creation advances the program to `MOBILIZED`.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `authId` | `string` | Yes | Yes | UUID; immutable |
| `programId` | `string` | Yes | No | FK; unique per program |
| `projectId` | `string` | Yes | No | FK |
| `authStatus` | `enum` | Yes | No | `ISSUED` \| `REVOKED` — revocation is audited and rare |
| `authorizedAt` | `datetime` | Yes | Yes | Timestamp of PE issuance; immutable after creation |
| `authorizedBy` | `string` | Yes | No | userId; must have PX role; enforced at API level |
| `stabilizationWindowDays` | `number` | Yes | No | Days for stabilization window; PE-set at authorization; default 14 |
| `authNotes` | `string` | No | No | PE notes accompanying the authorization |
| `certificationsSummaryAtAuth` | `object` | Yes | Yes | Snapshot of all 6 ReadinessCertification statuses at time of authorization |
| `openWaiverCountAtAuth` | `number` | Yes | Yes | Count of waivers in APPROVED status at authorization (not yet resolved) |
| `openBlockerCountAtAuth` | `number` | Yes | Yes | Count of ProgramBlockers and TaskBlockers still OPEN at authorization time |
| `revokedAt` | `datetime` | No | Yes | null unless revoked |
| `revokedBy` | `string` | No | No | userId; PX role required |
| `revocationRationale` | `string` | No | No | Required on revocation |

---

## 4. Tier 2 — Governed Template and Task Library Records

See T03 for the full field architecture of `StartupTaskTemplate`, `StartupTaskInstance`, and `TaskBlocker`. Summary here:

| Record | Purpose | Key rule |
|---|---|---|
| `StartupTaskTemplate` | Org-level governed task definition; owned by MOE | `taskNumber` and `title` immutable; versioned on template update |
| `StartupTaskInstance` | Per-project working copy of a template task | `result`, `notes`, `evidenceAttachmentIds` are project-editable; template-inherited fields are immutable |
| `TaskBlocker` | Blocker tied to a specific task instance | First-class record; feeds Work Queue; must be resolved or waived for certification |

---

## 5. Tier 3 — Safety Readiness and Permit Verification Records

See T07 for the full field architecture of `JobsiteSafetyChecklist`, `SafetyReadinessSection`, `SafetyReadinessItem`, `SafetyRemediationRecord`, and `PermitVerificationDetail`.

---

## 6. Tier 3 — Ledger Surface Records

See T04 for `ContractObligationsRegister` and `ContractObligation`.
See T05 for `ResponsibilityMatrix`, `ResponsibilityMatrixRow`, and `ResponsibilityAssignment`.
See T06 for `ProjectExecutionBaseline`, `ExecutionBaselineSection`, and `BaselineSectionField`.

---

## 7. Tier 4 — StartupBaseline Continuity Record

### 7.1 Purpose and Immutability

The `StartupBaseline` is an **immutable snapshot** created atomically when the program enters `BASELINE_LOCKED`. It is the authoritative record of launch state. Once created, no user role, no API call, and no system process may modify it. Mutation attempts return HTTP 405 with a `BASELINE_IMMUTABLE` error code.

### 7.2 StartupBaseline Field Architecture

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `snapshotId` | `string` | Yes | Yes | UUID; immutable PK |
| `programId` | `string` | Yes | No | FK; unique per program |
| `projectId` | `string` | Yes | No | FK |
| `lockedAt` | `datetime` | Yes | Yes | Timestamp of baseline lock; server-assigned |
| `lockedBy` | `string` | Yes | No | userId of PE (or `SYSTEM` for timer-triggered lock) |
| `programStateAtLock` | `string` | Yes | Yes | `BASELINE_LOCKED` — confirms state at snapshot creation |
| `stabilizationWindowDays` | `number` | Yes | Yes | Actual window duration used |
| `stabilizationActualDuration` | `number` | Yes | Yes | Actual days elapsed between MOBILIZED and BASELINE_LOCKED |
| `taskLibrarySnapshotAtLock` | `object` | Yes | Yes | `{ totalTasks, yesTasks, noTasks, naTasks, unreviewedTasks, openBlockers }` |
| `safetyReadinessSnapshotAtLock` | `object` | Yes | Yes | `{ passCount, failCount, naCount, openRemediations, resolvedRemediations }` |
| `permitPostingSnapshotAtLock` | `object[]` | Yes | Yes | Per-item array: `[ { taskNumber, description, result } ]` for all 12 Section 4 items |
| `contractObligationsSnapshotAtLock` | `object` | Yes | Yes | `{ totalObligations, flaggedObligations, openObligations, satisfiedObligations }` |
| `responsibilitySnapshotAtLock` | `object` | Yes | Yes | `{ pmSheetAssigned: bool, fieldSheetAssigned: bool, unassignedCategories: string[], primaryAssignments: [ { sheet, taskCategory, roleCode, assignedPersonName, assignedUserId, acknowledgedAt } ] }` |
| `executionBaselineFieldsAtLock` | `object` | Yes | Yes | Full `BaselineSectionField.value` map keyed by `fieldKey` across all populated sections, including non-queryable informational fields |
| `pmPlanStatusAtLock` | `enum` | Yes | Yes | `ProjectExecutionBaseline.status` at lock time |
| `certificationSummaryAtLock` | `object[]` | Yes | Yes | Array of `{ subSurface, certStatus, certVersion, certifiedBy[] }` for all 6 surfaces |
| `approvedWaiversAtLock` | `object[]` | Yes | Yes | Array of `{ waiverId, subSurface, waivedItemRef, rationale, plannedResolutionDate }` |
| `lapsedWaiversAtLock` | `object[]` | Yes | Yes | Array of waivers in LAPSED status at lock time (usually empty) |
| `openProgramBlockersAtLock` | `object[]` | Yes | Yes | Array of `{ blockerId, blockerType, description, escalatedToPE }` for OPEN program-level blockers |
| `peFlagsAtLock` | `object[]` | Yes | Yes | Array of records PE flagged for re-review during stabilization; `{ recordRef, flagNote }` |
| `authorizingPEUserId` | `string` | Yes | Yes | userId of PE who issued PEMobilizationAuthorization |
| `authorizationTimestamp` | `datetime` | Yes | Yes | Timestamp from PEMobilizationAuthorization |

### 7.3 Closeout API Contract

The `StartupBaseline` is exposed to Closeout via a dedicated read-only endpoint:

```
GET /api/startup/{projectId}/baseline
Authorization: caller must have role PX or be the @hbc/project-closeout service account
Response: StartupBaseline (full record; no field omission)
Returns 404 if no baseline exists (program not yet BASELINE_LOCKED)
Returns 403 if caller is not authorized
Returns 405 on any mutation attempt (PATCH, PUT, DELETE)
```

---

## 8. Record Lifecycle and Mutability Summary

| Record family | Mutable during | Immutable after | Versioned |
|---|---|---|---|
| `StartupProgram` | DRAFT → STABILIZING | BASELINE_LOCKED | No (see StartupProgramVersion) |
| `StartupProgramVersion` | Never modified | Creation | Yes (is itself the version record) |
| `StartupReadinessState` | N/A — one write per state | Creation | N/A |
| `ReadinessCertification` | Until BASELINE_LOCKED | BASELINE_LOCKED | Yes (certStatus changes) |
| `ReadinessGateRecord` | Until PE submits evaluation | After gateOutcome set | No |
| `ReadinessGateCriterion` | Until parent gate submitted | After gateOutcome set | No |
| `ExceptionWaiverRecord` | Until BASELINE_LOCKED (PE may resolve waivers post-lock) | Post-lock: waiverStatus only updatable | Yes (status) |
| `ProgramBlocker` | Until BASELINE_LOCKED | BASELINE_LOCKED | Yes (status) |
| `PEMobilizationAuthorization` | Never (one-write record) | Creation | No |
| `StartupTaskTemplate` | MOE-governed template release lifecycle | Between template versions | Yes |
| `StartupTaskInstance` | Until BASELINE_LOCKED | BASELINE_LOCKED | Yes (result) |
| `TaskBlocker` | Until BASELINE_LOCKED | BASELINE_LOCKED | Yes (status) |
| `JobsiteSafetyChecklist` | Until BASELINE_LOCKED | BASELINE_LOCKED | No |
| `SafetyReadinessItem` | Until BASELINE_LOCKED | BASELINE_LOCKED | Yes (result) |
| `SafetyRemediationRecord` | Until BASELINE_LOCKED | BASELINE_LOCKED | Yes (status) |
| `ContractObligationsRegister` | Until BASELINE_LOCKED | BASELINE_LOCKED | No |
| `ContractObligation` | Until BASELINE_LOCKED | BASELINE_LOCKED | Yes (obligationStatus) |
| `ResponsibilityMatrix` | Until BASELINE_LOCKED | BASELINE_LOCKED | No |
| `ResponsibilityMatrixRow` | Until BASELINE_LOCKED (governed rows: task text immutable) | BASELINE_LOCKED | No |
| `ResponsibilityAssignment` | Until BASELINE_LOCKED | BASELINE_LOCKED | Yes (value, assignedPersonName) |
| `ProjectExecutionBaseline` | Until BASELINE_LOCKED | BASELINE_LOCKED | No |
| `ExecutionBaselineSection` | Until BASELINE_LOCKED | BASELINE_LOCKED | No |
| `BaselineSectionField` | Until BASELINE_LOCKED | BASELINE_LOCKED | Yes (value) |
| `StartupBaseline` | Never | Creation | N/A — immutable by definition |

---

*[← T01](P3-E11-T01-Operating-Model-Scope-Surface-Map-Lifecycle-Continuity.md) | [Master Index](P3-E11-Project-Startup-Module-Field-Specification.md) | [T03 →](P3-E11-T03-Startup-Program-Checklist-Library-Readiness-Tasks-Blockers-Evidence.md)*
