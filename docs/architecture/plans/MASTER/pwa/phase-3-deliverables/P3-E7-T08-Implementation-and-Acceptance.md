# P3-E7-T08 — Implementation and Acceptance

**Doc ID:** P3-E7-T08
**Parent:** P3-E7 Permits Module
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 8 of 8
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. Package Blockers

The following shared packages must be operational before Permits module implementation can complete. Blockers marked **OPEN** must be resolved in the specified plan before Permits stage begins.

| ID | Package | Status | Blocking What | Resolution Path |
|---|---|---|---|---|
| B-PRM-01 | `@hbc/workflow-handoff` | **OPEN** | Cross-party handoff workflows (T05 §5); stop-work and violation response flows | Delivered by P3-F1 platform handoff plan |
| B-PRM-02 | `@hbc/acknowledgment` | **OPEN** | Deficiency resolution acknowledgment (T03 §4.3); stop-work lift acknowledgment | Delivered by P3-F1 |
| B-PRM-03 | `@hbc/field-annotations` | **OPEN** | PER annotation layer (T05 §7, T06 §6) | Delivered by P3-F2 PER readiness plan |
| B-PRM-04 | `@hbc/versioned-record` | **OPEN** | Audit trail for IssuedPermit field changes (T07 §4) | Delivered by P3-F1 |
| B-PRM-05 | `@hbc/bic-next-move` | **OPEN** | Next-move prompts in permit detail and work queue (T05 §6) | Delivered by P3-F1 |
| B-PRM-06 | `@hbc/related-items` | **OPEN** | Permit-to-schedule and permit-to-financial relationship publication (T05 §4) | Delivered by P3-F1 |

**Note:** `@hbc/my-work-feed` (work queue) is assumed operational per P3-D3 delivery. Permits work queue items (WQ-PRM-01 through WQ-PRM-15) are blocked on `@hbc/my-work-feed` readiness.

---

## 2. Implementation Guide

### Stage 7.PRM.0 — Foundation Types and Interfaces

**Deliverables:**
- All TypeScript interfaces from T02: `IPermitApplication`, `IIssuedPermit`, `IRequiredInspectionCheckpoint`, `IInspectionVisit`, `IInspectionDeficiency`, `IPermitLifecycleAction`, `IPermitEvidenceRecord`
- All type unions from T02: `PermitType`, `IssuedPermitStatus`, `PermitApplicationStatus`, `PermitLifecycleActionType`, `InspectionVisitResult`, `DeficiencySeverity`, `DeficiencyResolutionStatus`, `CheckpointStatus`, `PermitHealthTier`, `ExpirationRiskTier`, `PermitThreadRelationship`, `PermitEvidenceType`
- All supporting interfaces: `IJurisdictionContact`, `IInspectorContact`
- Package exports defined and narrowly scoped

**Verification:** TypeScript compiles with zero type errors. All interfaces match T02 specification exactly.

### Stage 7.PRM.1 — Data Layer and Persistence

**Deliverables:**
- Database schema for all 7 record types (primary keys, foreign keys, indexes)
- Repository interfaces for each record type (CRUD + query patterns)
- Validation schemas (field constraints, immutability, FK integrity)
- `PermitLifecycleAction` immutability enforcement at persistence layer

**Key constraint implementations:**
- `IssuedPermit.currentStatus` mutation rejected unless via `PermitLifecycleAction` creation
- Immutable fields (IDs, dates at issuance) rejected on update
- `InspectionDeficiency.resolutionNotes` required when `resolutionStatus = RESOLVED`

**Verification:** Unit tests on all validation rules. Mutation-via-action constraint tested with rejection scenarios.

### Stage 7.PRM.2 — PermitApplication Lifecycle

**Deliverables:**
- `PermitApplication` CRUD API
- Status transition validation per T03 §2.2
- Approval side effect: `IssuedPermit` creation + first `PermitLifecycleAction(ISSUED)` (T03 §2.3)
- Activity spine events for application status transitions (T05 §1)

**Verification:** State machine test matrix covering all valid and invalid transitions.

### Stage 7.PRM.3 — IssuedPermit Lifecycle Actions

**Deliverables:**
- `POST /api/permits/{issuedPermitId}/lifecycle-actions` endpoint (T03 §6)
- All 20 `PermitLifecycleActionType` values handled
- Transition validation table enforced (T03 §3.2)
- Acknowledgment workflow integration via `@hbc/acknowledgment` (B-PRM-02)
- Terminal state guard: no actions on CLOSED/EXPIRED/REVOKED
- Activity spine events for all lifecycle actions (T05 §1)

**Verification:** Integration test for every `PermitLifecycleActionType`. Terminal state rejection tests. Acknowledgment flow end-to-end test.

### Stage 7.PRM.4 — Required Inspection Checkpoints

**Deliverables:**
- Checkpoint template library (CRUD for `ICheckpointTemplate`)
- Auto-generation of checkpoints on permit creation from template library (T04 §1.4)
- Checkpoint status and result update via inspection visit linkage (T04 §2.1)
- xlsx import endpoint for `RequiredInspectionCheckpoint` batch creation (T04 §5, T07 §2)
- Import validation (all-or-nothing semantics)
- Activity spine events for checkpoint status changes

**Verification:** Template auto-generation tested per permit type. Import tested with valid and error cases. All-or-nothing rejection with row-level error detail.

### Stage 7.PRM.5 — Inspection Visits and Deficiencies

**Deliverables:**
- `InspectionVisit` CRUD API
- Visit result recording with checkpoint linkage update (T04 §2.1)
- `InspectionDeficiency` CRUD API
- Deficiency resolution workflow (state machine per T04 §3.2)
- Re-inspection linkage (`InspectionDeficiency.reinspectionVisitId`)
- Activity spine events for visit and deficiency changes (T05 §1)
- Work queue items WQ-PRM-04 through WQ-PRM-11 (T05 §3.2, §3.3)

**Verification:** Inspection visit → checkpoint update flow tested. Deficiency resolution state machine tested with invalid transitions rejected. Work queue item creation verified.

### Stage 7.PRM.6 — Derived Compliance Health

**Deliverables:**
- `derivePermitHealth()` function implementing T04 §4.1 algorithm exactly
- `calcExpirationRiskTier()` function per T04 §4.2
- Health recalculation triggered on all specified events (T04 §4.3)
- Health spine publication per T05 §2
- Project-level aggregate metric publication per T05 §2.2
- Thread health derivation per T04 §4.4
- Daily expiration sweep job (EXPIRATION_WARNING + EXPIRED lifecycle actions)

**Verification:** Health tier derivation tested against all conditions in T04 §4.1. Daily sweep tested against mock date-shifted permits.

### Stage 7.PRM.7 — Work Queue Items (Full Set)

**Deliverables:**
- All 15 work queue rules WQ-PRM-01 through WQ-PRM-15 implemented (T05 §3)
- Work queue item resolution triggers implemented (T05 §3.5)
- `@hbc/bic-next-move` next-move prompts registered (T05 §6) — pending B-PRM-05
- `@hbc/workflow-handoff` handoffs registered (T05 §5) — pending B-PRM-01

**Verification:** Each work queue rule tested: trigger condition creates item, resolution condition closes item.

### Stage 7.PRM.8 — Related Items Publication

**Deliverables:**
- `@hbc/related-items` relationships published (T05 §4) — pending B-PRM-06
- Permit-to-schedule milestone links
- Permit-to-constraint links
- Permit-to-financial-line links

**Verification:** Related item relationship record created on permit activation. Query from schedule module returns linked permit.

### Stage 7.PRM.9 — PER Annotation Layer

**Deliverables:**
- `@hbc/field-annotations` integration (T05 §7) — pending B-PRM-03
- Annotation anchor structure `IPermitAnnotationAnchor` implemented
- PER surface read-only mode enforced (no mutation controls)
- Annotated permit summary export (PDF/CSV)

**Verification:** Annotation creation tested for all annotatable record types. Mutation controls verified absent in PER surface mode.

### Stage 7.PRM.10 — Migration Execution

**Deliverables:**
- Migration script: `IPermit` → `IssuedPermit` per T07 §1.2
- Migration script: `IInspection` → `InspectionVisit` per T07 §1.2
- Migration script: `IInspectionIssue` → `InspectionDeficiency` per T07 §1.2
- Migration script: `IRequiredInspectionRecord` → `RequiredInspectionCheckpoint` per T07 §1.5
- Post-migration validation checklist (T07 §1.6) run and signed off
- Rollback plan documented and tested

**Verification:** All items in T07 §1.6 checklist checked and green. Record counts match before/after. Health tiers computed post-migration for all permits.

---

## 3. Cross-File Follow-Up Notes

| Note | Target Plan | Details |
|---|---|---|
| B-PRM-01 through B-PRM-06 | P3-F1 | Six shared packages must be delivered before Permits implementation completes. Track in P3-F1 platform handoff. |
| B-PRM-03 | P3-F2 | PER annotation layer specifically tied to P3-F2 executive review readiness. |
| Permit-to-financial link | P3-E4 | `PermitEvidenceRecord` for fee payment receipt may reference financial line item IDs from P3-E4. Cross-module FK must be validated. |
| Permit-to-schedule blocking | P3-E5/E6 | `@hbc/related-items` permit-gates-milestone relationship requires P3-E5/E6 to define milestone record IDs. Coordinate during P3-F1 integration sprint. |
| Thread model display | P3-G2 | P3-G2 (Permit Lane Detail) must define thread view UX. T06 §2.3 provides data model; P3-G2 owns the interaction design. |
| Required inspection template library | P3-G1 | Template library management UI (add, edit, activate/deactivate templates) belongs in admin surface. P3-G1 to confirm which lane owns template administration. |

---

## 4. Acceptance Gate

The Permits module is accepted when all of the following criteria are verified. Items marked **[MIGRATION]** apply only to the production deployment gate (not development acceptance).

### 4.1 Data Model Integrity (AC-PRM-01 through AC-PRM-10)

- **AC-PRM-01** All seven record types are fully typed with zero TypeScript errors
- **AC-PRM-02** All immutable fields on `IssuedPermit` are rejected on update attempt
- **AC-PRM-03** Direct `currentStatus` mutation on `IssuedPermit` is rejected (must use lifecycle action)
- **AC-PRM-04** `InspectionDeficiency.resolutionNotes` is enforced as required when `resolutionStatus = RESOLVED`
- **AC-PRM-05** No `complianceScore` field exists on any record type
- **AC-PRM-06** Thread relationship fields (`threadRootPermitId`, `parentPermitId`, `threadRelationshipType`) are present and correctly typed on `IssuedPermit`
- **AC-PRM-07** All FK relationships between record types are enforced (e.g., `visitId` on deficiency must reference existing visit)
- **AC-PRM-08** `PermitLifecycleAction` records are immutable once created; no update endpoint exists
- **AC-PRM-09** `PermitEvidenceRecord` carries reference URI, not binary content
- **AC-PRM-10** Responsibility envelope fields are present and typed on `IssuedPermit` and `InspectionVisit`

### 4.2 Lifecycle Governance (AC-PRM-11 through AC-PRM-20)

- **AC-PRM-11** All 20 `PermitLifecycleActionType` values are handled in the lifecycle action endpoint
- **AC-PRM-12** Invalid status transitions are rejected with a structured error
- **AC-PRM-13** Terminal state guard: no lifecycle actions accepted on CLOSED, EXPIRED, or REVOKED permits
- **AC-PRM-14** Acknowledgment workflow fires for all `requiresAcknowledgment = true` action types
- **AC-PRM-15** `PermitApplication.applicationStatus → APPROVED` creates `IssuedPermit` + first `PermitLifecycleAction(ISSUED)` atomically
- **AC-PRM-16** `RENEWAL_APPROVED` action correctly updates `expirationDate`, `renewalDate`, and recalculates health
- **AC-PRM-17** `STOP_WORK_ISSUED` sets `derivedHealthTier = CRITICAL` immediately
- **AC-PRM-18** `CLOSED` lifecycle action is rejected if any blocking checkpoint is not PASS or NOT_APPLICABLE
- **AC-PRM-19** System-generated `EXPIRED` action fires when `expirationDate < today` during daily sweep
- **AC-PRM-20** System-generated `EXPIRATION_WARNING` action fires when `daysToExpiration ≤ 30` and status is active

### 4.3 Inspection and Deficiency (AC-PRM-21 through AC-PRM-32)

- **AC-PRM-21** `RequiredInspectionCheckpoint` template library stores 14 checkpoints for `MASTER_BUILDING` permit type
- **AC-PRM-22** Checkpoint auto-generation creates correct checkpoints on permit creation
- **AC-PRM-23** xlsx import creates checkpoints with correct sequence, name, code reference, result, and verifiedOnline
- **AC-PRM-24** xlsx import is all-or-nothing: any row validation failure rejects entire import with row-level errors
- **AC-PRM-25** `InspectionVisit` result correctly propagates to linked `RequiredInspectionCheckpoint.currentResult`
- **AC-PRM-26** Multiple visits per checkpoint are supported; `currentResult` reflects most recent completed visit
- **AC-PRM-27** `InspectionDeficiency` resolution state machine rejects invalid transitions
- **AC-PRM-28** `VERIFIED_RESOLVED` transition requires `reinspectionVisitId` to be set
- **AC-PRM-29** All 7 `DeficiencyResolutionStatus` values are handled in the UI
- **AC-PRM-30** `PASS_WITH_CONDITIONS` visit result requires non-empty `inspectorNotes`
- **AC-PRM-31** `followUpRequired = true` requires `followUpDueDate` to be set
- **AC-PRM-32** Checkpoint close-out gate enforced: all 6 conditions must be met before `CLOSED` action succeeds

### 4.4 Derived Health (AC-PRM-33 through AC-PRM-38)

- **AC-PRM-33** `derivePermitHealth()` returns `CRITICAL` for permits with open HIGH-severity deficiency
- **AC-PRM-34** `derivePermitHealth()` returns `CRITICAL` for permits with `expirationRiskTier = CRITICAL`
- **AC-PRM-35** `derivePermitHealth()` returns `AT_RISK` for permits with open MEDIUM deficiency
- **AC-PRM-36** `derivePermitHealth()` returns `CLOSED` for permits with `currentStatus = CLOSED`
- **AC-PRM-37** Health spine is updated on every trigger event listed in T04 §4.3
- **AC-PRM-38** Thread health is the worst individual permit health tier in the thread

### 4.5 Work Queue and Workflow (AC-PRM-39 through AC-PRM-46)

- **AC-PRM-39** Work queue item WQ-PRM-01 fires when `expirationRiskTier → HIGH`
- **AC-PRM-40** Work queue item WQ-PRM-02 fires when `expirationRiskTier → CRITICAL`
- **AC-PRM-41** Work queue item WQ-PRM-08 fires on HIGH-severity deficiency creation
- **AC-PRM-42** Work queue item WQ-PRM-12 fires on `STOP_WORK_ISSUED` lifecycle action
- **AC-PRM-43** Work queue items are resolved when their resolution trigger fires (per T05 §3.5)
- **AC-PRM-44** `@hbc/bic-next-move` next-move prompts surface correctly in permit detail view
- **AC-PRM-45** `@hbc/workflow-handoff` handoff records created for all handoff scenarios in T05 §5
- **AC-PRM-46** Activity spine events fire for all 21 event types in T05 §1

### 4.6 UX and Reporting (AC-PRM-47 through AC-PRM-50)

- **AC-PRM-47** Permit list view health indicators display correctly (CRITICAL pinned; color coding matches T06 §2.2)
- **AC-PRM-48** Required inspections progress display shows correct completion percentage in permit detail
- **AC-PRM-49** PER surface is read-only: all mutation controls absent; annotation panel active for executives
- **AC-PRM-50** Annotated permit summary export produces correct output (all fields, open deficiencies, annotations)

### 4.7 Migration (AC-PRM-51 through AC-PRM-52) [MIGRATION]

- **AC-PRM-51** All migration validation checklist items in T07 §1.6 are green; record counts match
- **AC-PRM-52** Health tiers are recalculated for all migrated permits; no `complianceScore` field present in any migrated record

---

*[← T07](P3-E7-T07-Data-Migration-Import-and-Future-Integration.md) | [Master Index](P3-E7-Permits-Module-Field-Specification.md) | No next file →*
