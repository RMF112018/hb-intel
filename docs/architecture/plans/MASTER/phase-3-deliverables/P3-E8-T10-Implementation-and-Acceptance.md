# P3-E8-T10 — Implementation and Acceptance

**Doc ID:** P3-E8-T10
**Parent:** P3-E8 Safety Module — Master Index
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 10 of 10
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. Package Blockers

The following shared packages must be in a production-ready state before Safety Module feature implementation proceeds. Each blocker is scoped to a specific capability they enable.

| Blocker ID | Package | Capability Required | Required By |
|---|---|---|---|
| B-SAF-01 | `@hbc/acknowledgment` | Toolbox talk acknowledgment, orientation acknowledgment, SSSP section acknowledgment | T06 (toolbox), T07 (orientation) |
| B-SAF-02 | `@hbc/workflow-handoff` | SSSP approval routing, corrective action verification, override workflow, JHA approval routing | T03, T05, T08 |
| B-SAF-03 | `@hbc/bic-next-move` | Safety workspace next-move prompt registration | T09 |
| B-SAF-04 | `@hbc/my-work-feed` | Safety as a registered work-feed source module; 25 work queue item types | T09 |
| B-SAF-05 | `@hbc/related-items` | Safety record relationship registry registration | T09 |
| B-SAF-06 | `@hbc/versioned-record` | Inspection record, SSSP version, toolbox talk, evidence audit trail | T02–T07 |

**Current state:** `packages/features/safety` is a scaffold-only package (`export {}`). No production implementation exists. All six blockers represent dependencies that must be confirmed ready before Feature Safety implementation begins. Verify each package's README for current readiness tier before building production-critical behavior on top of them.

---

## 2. Implementation Stages

### Stage 8.SAF.0 — Package Blocker Verification

**Deliverables:**
- Confirm Tier-1 readiness of all 6 shared packages (B-SAF-01 through B-SAF-06)
- Document any package readiness gaps that require remediation before safety implementation
- Update package dependency declarations in `packages/features/safety/package.json`

**Verification:** All 6 shared packages respond to basic integration test calls from a safety test harness without errors.

---

### Stage 8.SAF.1 — Identity and Base Infrastructure

**Deliverables:**
- Governance layer: company registry integration (subcontractor/company identity)
- Workforce identity hybrid model (governed `workerId` + provisional fallback)
- Base evidence record infrastructure (`ISafetyEvidenceRecord`) with sensitivity and retention tiers
- SharePoint / blob storage integration for safety evidence files
- `@hbc/versioned-record` integration for safety audit trail

**Verification:** Evidence records can be created, uploaded, and retrieved; sensitivity tier enforced on read; versioned audit trail captures mutations.

---

### Stage 8.SAF.2 — SSSP Base Plan

**Deliverables:**
- `ISiteSpecificSafetyPlan` record family with governed and instance sections
- SSSP lifecycle state machine (DRAFT → PENDING_APPROVAL → APPROVED → SUPERSEDED)
- Joint approval workflow via `@hbc/workflow-handoff` (Safety Manager + PM + Superintendent)
- `safetyManagerOnly: true` enforcement at API layer for governed sections
- Rendered document output (PDF generation from approved SSSP record)
- SSSP Addendum record family with addendum approval matrix

**Verification:**
- SSSP cannot be approved without all three signatures
- Governed sections are read-only for project team users
- Rendered document generated and stored on APPROVED transition
- Addendum with `operationallyAffected = false` requires only Safety Manager signature
- Addendum with `operationallyAffected = true` requires all three signatures

---

### Stage 8.SAF.3 — Inspection Template Governance and Execution

**Deliverables:**
- `IInspectionChecklistTemplate` record family with version control
- Standard 12-section template created as workspace-level governed starting point
- Template ACTIVE/RETIRED lifecycle
- `ICompletedInspection` record family with template version pinning
- Normalized scoring algorithm (applicable sections only)
- Section response and item response capture
- `IInspectionScorecardSnapshot` immutable publication on completion

**Verification:**
- Template version is pinned at inspection creation and immutable
- Normalized score correctly excludes N/A sections and reweights applicable weights
- Snapshot published on completion; subsequent edits to inspection notes do not alter snapshot
- Inspection score < 70 triggers WQ-SAF-05

---

### Stage 8.SAF.4 — Centralized Corrective Action Ledger

**Deliverables:**
- `ISafetyCorrectiveAction` record family in centralized ledger
- All source types supported: INSPECTION, INCIDENT, JHA, OBSERVATION, EXTERNAL
- Severity-based due date defaults and priority rules
- `isOverdue` computed flag (daily sweep)
- Corrective action lifecycle (OPEN → IN_PROGRESS → PENDING_VERIFICATION → CLOSED / VOIDED)
- Verification workflow via `@hbc/workflow-handoff` (assigned party → Safety Manager)
- 25 work queue item rules registered with `@hbc/my-work-feed`

**Verification:**
- Auto-created CA from inspection has correct `sourceType: 'INSPECTION'` and `sourceRecordId`
- CRITICAL CA generates WQ-SAF-07 within 4 hours
- `isOverdue` correctly computed and drives work queue escalation
- Verification workflow completes correctly via `@hbc/workflow-handoff`

---

### Stage 8.SAF.5 — JHA and Daily Pre-Task Plan

**Deliverables:**
- `IJhaRecord` with step-hazard-control structure
- JHA lifecycle (DRAFT → PENDING_APPROVAL → APPROVED → SUPERSEDED / VOIDED)
- Competent-person designation pre-condition enforcement
- `IDailyPreTaskPlan` linked to APPROVED JHA (required)
- Daily Pre-Task completion model

**Verification:**
- JHA requiring competent person cannot be approved without valid ACTIVE designation
- Daily Pre-Task Plan creation blocked if JHA is SUPERSEDED or VOIDED
- Superseding a JHA flags linked Daily Pre-Task Plans for re-evaluation

---

### Stage 8.SAF.6 — Toolbox Talk Program

**Deliverables:**
- `IToolboxTalkPrompt` governed library with issuance record
- `IScheduleRiskMapping` governed mapping table
- Schedule integration (read-only pull of upcoming activities for prompt intelligence)
- AI-assisted gap detection for unmapped activities (Safety Manager review required)
- `IWeeklyToolboxTalkRecord` with hybrid proof model
- `@hbc/acknowledgment` integration for high-risk governed talks

**Verification:**
- Governed mapping → prompt recommendation surfaces correctly for upcoming schedule activities
- AI suggestions require Safety Manager review before becoming governed records
- High-risk governed toolbox talk requires named attendees and at least one proof element
- Prompt closure rules enforced per closure type (STANDARD / HIGH_RISK / CRITICAL)

---

### Stage 8.SAF.7 — Orientation, Subcontractor Submissions, Qualifications, SDS, Competent Person

**Deliverables:**
- `IWorkerOrientationRecord` with hybrid identity model and acknowledgment via `@hbc/acknowledgment`
- `ISubcontractorSafetySubmission` with review lifecycle
- `ICertificationRecord` with EXPIRING_SOON / EXPIRED status computation (daily sweep)
- `IHazComSdsRecord` with linked evidence
- `ICompetentPersonDesignation` with competency area scoping and certification linkage

**Verification:**
- Orientation completed with PHYSICAL_SIGNATURE requires evidence record
- Submission review workflow correctly routes to Safety Manager
- Certification expiration computed daily; EXPIRING_SOON triggers WQ-SAF-18
- Competent-person designation expiration cascades to JHA pre-condition check

---

### Stage 8.SAF.8 — Readiness Evaluation Engine

**Deliverables:**
- `ISafetyReadinessDecision` record family for project, subcontractor, and activity levels
- Governed blocker matrices (project: 8 blockers, subcontractor: 9 blockers, activity: 7 blockers)
- HARD vs. SOFT blocker enforcement
- Exception model (`IReadinessException`) with Safety Manager-only grant authority
- Override workflow (`IReadinessOverride`) with joint joint-approval via `@hbc/workflow-handoff`
- Daily/event-driven readiness re-evaluation triggers
- `IReadinessSummaryProjection` published to scorecard

**Verification:**
- HARD blocker cannot be resolved by exception — readiness must remain NOT_READY until condition resolved
- Exception with `expiresAt` auto-lapses and re-triggers blocker
- Override requires all required role acknowledgments
- Readiness re-evaluates on every relevant safety record state change

---

### Stage 8.SAF.9 — Incident Management

**Deliverables:**
- `IIncidentRecord` with three-tier privacy model
- `IIncidentPersonRecord` (always Safety Manager/Officer only)
- Incident lifecycle with LITIGATED state
- LITIGATION_HOLD retention escalation on evidence records
- Corrective action generation from incident investigation complete
- PER anonymized incident count projection

**Verification:**
- SENSITIVE and RESTRICTED incidents not visible to Superintendent
- RESTRICTED incidents show only incident type and date to PM
- `personsInvolved` never exposed outside Safety Manager / Officer role
- LITIGATED state sets all linked evidence records to LITIGATION_HOLD retention

---

### Stage 8.SAF.10 — Scorecard, Publication, and Reports

**Deliverables:**
- `ISafetyCompositeScorecard` composition from all five dimensions
- `SafetyPosture` derivation algorithm
- `ISafetyScorecardPERProjection` (sanitized; no raw scores)
- Activity spine event publication (18 event types)
- Work queue rule registration: all 25 WQ-SAF-## rules
- `@hbc/related-items` relationship registry registration
- Reports workspace (7 report types) with privacy tier enforcement
- `@hbc/bic-next-move` prompt registration

**Verification:**
- Composite scorecard correctly reflects all five dimensions
- CRITICAL posture triggers when any HARD blocker is active
- PER projection contains no raw normalized score
- Incident report respects privacy tier in report output
- All 25 work queue rules fire correctly in integration test

---

## 3. Cross-File Follow-Up Notes

| # | Note |
|---|---|
| 1 | T09 defines 25 work queue rules (WQ-SAF-01 through WQ-SAF-25). Implementation must register all 25 with `@hbc/my-work-feed`. The adapter file in `packages/features/safety/src/feeds/` is the registration point. |
| 2 | The composite safety scorecard's `overallPosture` derivation algorithm (T09 §2.2) must be implemented as a pure function in a shared utility — not duplicated across the Project Hub and PER projection paths. |
| 3 | Schedule integration (T06 §6) requires a defined API contract with the Schedule module. The Safety module reads schedule activity projections; the Schedule module does not write to Safety. The interface should be documented before Stage 8.SAF.6. |
| 4 | The SSSP rendered document (PDF) generation is architecturally similar to other rendered-document patterns in the platform. Check whether an existing shared PDF generation utility can be reused before introducing a new dependency. |
| 5 | `@hbc/acknowledgment` is used in three distinct Safety contexts (toolbox talk, orientation, SSSP section). Each context has a different `IAcknowledgmentConfig<T>`. All three config types should be defined and tested before Stage 8.SAF.6. |

---

## 4. Acceptance Criteria

All 60 criteria below must pass before the Safety Module is considered implementation-complete for Phase 3.

### AC-SAF-01 through AC-SAF-08: SSSP

- **AC-SAF-01** — An SSSP base plan can be created in DRAFT status by the Safety Manager
- **AC-SAF-02** — Governed SSSP sections are read-only for all users except Safety Manager and Safety Officer
- **AC-SAF-03** — Project-instance SSSP sections are editable by PM and Superintendent
- **AC-SAF-04** — SSSP cannot transition to APPROVED without all three approval signatures (Safety Manager, PM, Superintendent)
- **AC-SAF-05** — Any single approver rejection returns the SSSP to DRAFT with rejection notes captured
- **AC-SAF-06** — An approved SSSP generates a rendered PDF output stored as a governed evidence record
- **AC-SAF-07** — SSSP addendum with `operationallyAffected = false` requires only Safety Manager signature
- **AC-SAF-08** — SSSP addendum with `operationallyAffected = true` requires all three signatures

### AC-SAF-09 through AC-SAF-14: Inspection Program

- **AC-SAF-09** — A new inspection is created with the current ACTIVE template version pinned (immutable)
- **AC-SAF-10** — Normalized score uses only applicable sections; N/A sections are excluded from denominator
- **AC-SAF-11** — Section scoring weights are renormalized across applicable sections only
- **AC-SAF-12** — On inspection completion, an immutable `IInspectionScorecardSnapshot` is published
- **AC-SAF-13** — Subsequent edits to inspection notes do not alter the published snapshot
- **AC-SAF-14** — Failed item with `requiresCorrectiveActionOnFail = true` auto-generates a CA in the centralized ledger

### AC-SAF-15 through AC-SAF-21: Corrective Action Ledger

- **AC-SAF-15** — Corrective actions from INSPECTION, INCIDENT, JHA, OBSERVATION, and EXTERNAL sources all appear in the same centralized ledger
- **AC-SAF-16** — `sourceType` and `sourceRecordId` are immutable after CA creation
- **AC-SAF-17** — CRITICAL CA open for > 4 hours without IN_PROGRESS generates WQ-SAF-07
- **AC-SAF-18** — `isOverdue` flag is correctly computed on daily sweep (and immediately on state changes)
- **AC-SAF-19** — Overdue CRITICAL CA generates WQ-SAF-08 at CRITICAL priority
- **AC-SAF-20** — CA verification workflow correctly routes from assigned party to Safety Manager via `@hbc/workflow-handoff`
- **AC-SAF-21** — Closed CA no longer contributes to `isOverdue` count; scorecard updates accordingly

### AC-SAF-22 through AC-SAF-27: Incidents

- **AC-SAF-22** — RESTRICTED incident is visible only to Safety Manager and Safety Officer (type and date only visible to PM)
- **AC-SAF-23** — SENSITIVE incident narrative is not visible to Superintendent
- **AC-SAF-24** — `personsInvolved` field set is never exposed outside Safety Manager / Safety Officer role
- **AC-SAF-25** — Incident transitioning to LITIGATED escalates all linked evidence records to LITIGATION_HOLD retention
- **AC-SAF-26** — PER incident projection contains only anonymized counts by type — no narrative, no names
- **AC-SAF-27** — Corrective actions generated from an INVESTIGATION_COMPLETE incident carry `sourceType: 'INCIDENT'`

### AC-SAF-28 through AC-SAF-33: JHA and Daily Pre-Task

- **AC-SAF-28** — JHA requiring competent person cannot be approved without a valid ACTIVE designation for the required competency area
- **AC-SAF-29** — Daily Pre-Task Plan creation is blocked if the referenced JHA is SUPERSEDED or VOIDED
- **AC-SAF-30** — Superseding a JHA generates a work queue item to update Daily Pre-Task Plans still referencing the old JHA
- **AC-SAF-31** — JHA step-hazard-control structure is preserved in full in the record; not flattened
- **AC-SAF-32** — Daily Pre-Task Plan requires `controlsConfirmed = true` and `ppeVerified = true` before COMPLETE transition
- **AC-SAF-33** — Daily Pre-Task Plans are linked back to their JHA via `linkedDailyPreTaskIds`

### AC-SAF-34 through AC-SAF-40: Toolbox Talk Program

- **AC-SAF-34** — Governed schedule risk mappings appear before AI-suggested mappings in the prompt recommendation surface
- **AC-SAF-35** — AI-suggested schedule risk mappings require Safety Manager review before becoming governed records
- **AC-SAF-36** — High-risk governed toolbox talk record requires `namedAttendees` to be populated
- **AC-SAF-37** — Standard toolbox talk record requires only `attendeeCount > 0` for COMPLETE status
- **AC-SAF-38** — Governed high-risk prompt issued but not closed within 7 days generates WQ-SAF-14
- **AC-SAF-39** — `@hbc/acknowledgment` batch tracks per-attendee acknowledgment for high-risk talks
- **AC-SAF-40** — No toolbox talk record in current ISO week generates WQ-SAF-13

### AC-SAF-41 through AC-SAF-47: Orientation, Submissions, Qualifications

- **AC-SAF-41** — Orientation completed with `PHYSICAL_SIGNATURE` method requires a linked evidence record
- **AC-SAF-42** — Worker on site without orientation record generates WQ-SAF-17
- **AC-SAF-43** — Subcontractor submission in PENDING_REVIEW for > 5 business days generates WQ-SAF-16
- **AC-SAF-44** — Certification with `expirationDate` within 30 days computes `EXPIRING_SOON` status
- **AC-SAF-45** — Certification reaching EXPIRED state for an active scope generates WQ-SAF-19
- **AC-SAF-46** — Competent-person designation with EXPIRED backing certification auto-transitions designation to EXPIRED and generates WQ-SAF-20
- **AC-SAF-47** — Subcontractor with no APPROVED `COMPANY_SAFETY_PLAN` submission triggers BLK-SUB-01 (HARD blocker)

### AC-SAF-48 through AC-SAF-54: Readiness Engine

- **AC-SAF-48** — HARD blocker cannot be resolved by granting an exception; readiness must remain NOT_READY until condition is fully resolved
- **AC-SAF-49** — SOFT blocker can be converted to READY_WITH_EXCEPTION by Safety Manager-granted exception with documented rationale
- **AC-SAF-50** — Exception with `expiresAt` set auto-lapses on expiration; blocker reactivates; readiness re-evaluates
- **AC-SAF-51** — Activity-level override requires all three role acknowledgments (Safety Manager, PM, Superintendent)
- **AC-SAF-52** — Readiness re-evaluates on every relevant safety record state change (event-driven, not only on daily sweep)
- **AC-SAF-53** — `IReadinessSummaryProjection` published to composite scorecard reflects current decision state
- **AC-SAF-54** — Override approaching expiration (< 4 hours) generates WQ-SAF-24

### AC-SAF-55 through AC-SAF-60: Scorecard and Publication

- **AC-SAF-55** — `ISafetyCompositeScorecard` correctly incorporates all five dimensions: inspection trend, CAs, readiness, blockers, compliance
- **AC-SAF-56** — CRITICAL posture is triggered when any HARD blocker is active at project level
- **AC-SAF-57** — PER projection contains score band (HIGH/MED/LOW), not raw normalized score
- **AC-SAF-58** — All 25 work queue rules (WQ-SAF-01 through WQ-SAF-25) are registered with `@hbc/my-work-feed`
- **AC-SAF-59** — Reports workspace enforces privacy tier on incident report output
- **AC-SAF-60** — Activity spine publishes the 18 event types defined in T09 §3 on the appropriate state transitions

---

## 5. Migration Notes

The existing `ISafetyInspection` model in the monolithic P3-E8 specification is replaced by the multi-record family architecture in this T-file package. Migration from any prior scaffold or prototype data:

| Legacy Field / Record | Migration Path |
|---|---|
| `ISafetyInspection` (flat nested sections/items) | → `ICompletedInspection` + `IInspectionChecklistTemplate` (governing template must be created first) |
| `ICorrectiveAction` (inspection-tied) | → `ISafetyCorrectiveAction` with `sourceType: 'INSPECTION'` |
| `IIncidentReport` (flat) | → `IIncidentRecord` with `privacyTier: 'STANDARD'` as default on migration |
| `IJhaRecord` (existing if any) | → `IJhaRecord` new schema (step structure must be reconstructed from flat text if applicable) |
| `complianceScore` (numeric field) | → **Not migrated.** Dropped entirely. Replaced by derived `ISafetyCompositeScorecard`. |

Any inspection records migrated from legacy data must be associated with a matching inspection checklist template record. If the template does not exist, a migration template must be created with the section structure that best represents the legacy inspection items.

---

*[← T09](P3-E8-T09-Publication-Contracts-Project-Hub-PER-and-Reports.md) | [Master Index](P3-E8-Safety-Module-Field-Specification.md) | No next file →*
