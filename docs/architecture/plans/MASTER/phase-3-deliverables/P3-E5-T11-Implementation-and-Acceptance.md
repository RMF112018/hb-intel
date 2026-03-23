# P3-E5 — Schedule Module: Implementation and Acceptance

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E5-T11 |
| **Parent** | [P3-E5 Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T11: Implementation and Acceptance |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

## 24. Implementation Guide

The Schedule module is implemented as part of Phase 3 **Stage 7 — Core Module Implementation** in the overall Phase 3 plan (see `README.md`). Stage 7 must follow Stage 2 (auth), Stage 3 (spine adapters), Stage 4 (routing), and Stage 5 (shared feature infrastructure). The internal stages below decompose Stage 7 schedule work into sequenced implementation layers. All stages within §24 are sub-scope of Phase 3 Stage 7 unless noted.

The five blockers defined in §25 (B-SCH-01 through B-SCH-05) are **pre-implementation dependencies**. Evaluate and resolve them before Stage 7.1 begins.

---

### Stage 7.SCH.0 — Pre-Implementation Blocker Resolution

Must precede all other schedule implementation stages.

#### 7.SCH.0.1 — Resolve `@hbc/related-items` Schedule Anchor Types

Evaluate whether `ScheduleActivity` and `ScheduleWorkPackage` anchor types are supported in `@hbc/related-items`. Deliver the extension if not present. Required before any linked-artifact integration can proceed.

**Acceptance:** `IGovernanceTimelineEvent` supports `ScheduleActivity` and `ScheduleWorkPackage`; `@hbc/related-items` object registry accepts schedule object types.

**Blocker:** B-SCH-01, B-SCH-02

#### 7.SCH.0.2 — Resolve `@hbc/workflow-handoff` Publication and Scenario Types

Confirm or extend `@hbc/workflow-handoff` to support `PublicationReviewRequest`, `ScenarioPromotionRequest`, and `BaselineApprovalRequest` handoff types.

**Acceptance:** All three handoff types deliverable via `@hbc/workflow-handoff`; unit tests pass.

**Blocker:** B-SCH-03

#### 7.SCH.0.3 — Confirm `@hbc/complexity` Expert Tier and `@hbc/field-annotations` Anchor Support

Verify `@hbc/complexity` Expert tier is available for analytics surfaces. Confirm `@hbc/field-annotations` supports `{ publicationId, externalActivityKey, fieldKey }` anchor format (likely covered by v0.2.0 AnchorType discriminator; verify explicitly).

**Acceptance:** Expert tier renders without collision; annotation anchor resolves to published activity context.

**Blockers:** B-SCH-04, B-SCH-05

---

### Stage 7.SCH.1 — Data Model Foundation and Import Infrastructure

Can begin immediately after Stage 7.SCH.0. Foundational; all other stages depend on it.

#### 7.SCH.1.1 — Core TypeScript Types and Package Scaffold

Deliver the `@hbc/features-schedule` (or equivalent) package scaffold. Define all TypeScript types for the records specified in this document: `ICanonicalScheduleSource`, `IScheduleVersionRecord`, `IBaselineRecord`, `IImportedActivitySnapshot`, `IActivityContinuityLink`, `IImportedRelationshipRecord`, all enumerations (§26), and supporting value types (`RelationshipRef`, `ResourceRef`, `ActivityCodeValue`, `UDFValue`, `GradingControlScore`, `ConfidenceFactorScore`, `ReadinessDimension`, `SlippageTrendEntry`).

**Acceptance:** Package compiles; all types exported; no `any` types in contract surfaces; coverage threshold ≥ 85%.

#### 7.SCH.1.2 — Schedule File Parser (XER / XML / CSV)

Implement the multi-format parser for Primavera P6 XER, XML, and CSV. Parser must: identify format automatically; extract all `ImportedActivitySnapshot` fields (§1.4); extract `ImportedRelationshipRecord` data (§10.2); apply validation rules (§1.6); emit `ScheduleVersionRecord` with `Processing → Parsed` transition.

**Acceptance:** Parser correctly ingests all three reference example files (`Project_Schedule.csv`, `.xer`, `.xml`); all 24+ fields populated; validation warnings and errors reported correctly; parse time < 5 seconds for 500+ activities.

#### 7.SCH.1.3 — ExternalActivityKey Derivation and ActivityContinuityLink Maintenance

Implement `externalActivityKey` derivation (`{sourceId}::{sourceActivityCode}`), `ActivityContinuityLink` creation on first import, and link update logic on subsequent version activations. Cross-version identity must survive activity code unchanged across versions.

**Acceptance:** Same activity code across three sequential import versions produces one `ActivityContinuityLink` with three `snapshotIds`; new activity codes produce new links; deleted activity codes set `isActive = false`.

#### 7.SCH.1.4 — Version Activation Workflow

Implement version activation: `Parsed → Active` transition; prior `Active` version transitions to `Superseded`; `parentVersionId` set; `activatedAt` stamped; triggers reconciliation refresh on `ManagedCommitmentRecord`s (§2.1); triggers `FloatPathSnapshot` computation.

**Acceptance:** Activation workflow passes integration test with two sequential imports; prior version data retained; continuity links updated; reconciliation refresh triggered.

#### 7.SCH.1.5 — Baseline Management

Implement `BaselineRecord` creation, primary baseline designation, baseline supersession, and PE approval workflow via `@hbc/workflow-handoff`. Multiple concurrent non-primary baselines must be supported.

**Acceptance:** Create, approve, supersede baseline; variance calculations reference governing baseline correctly; PE approval workflow completes via workflow-handoff; prior primary baseline superseded atomically.

---

### Stage 7.SCH.2 — Canonical Source Registration and Governance

Can proceed in parallel with Stage 7.SCH.1 after package scaffold exists.

#### 7.SCH.2.1 — CanonicalScheduleSource Registration

Implement `CanonicalScheduleSource` CRUD, canonical designation (one per project), and secondary source registration. Implement `sourceOwnerRole` assignment for both current-state (PM) and future-state (Scheduler) ownership models. Promotion of secondary source to canonical requires PE approval workflow.

**Acceptance:** Project enforces single canonical source; secondary sources ingestable; ownership role assignment respected in UI; promotion requires PE approval.

#### 7.SCH.2.2 — Governed Policy Set Scaffold

Scaffold the `GovernedPolicySet` configuration surface per §20.1. All threshold and rule fields must be configurable by Manager of Operational Excellence / Admin role. No threshold values may be hard-coded in module business logic; all must read from policy.

**Acceptance:** Policy set CRUD exists; commitment approval threshold reads from policy, not code constants; unit test confirms threshold change takes effect without code deployment.

---

### Stage 7.SCH.3 — Dual-Truth Operating Layer and Managed Commitments

Must follow Stage 7.SCH.1 (activity snapshots and continuity model must exist).

#### 7.SCH.3.1 — ManagedCommitmentRecord Lifecycle

Implement `ManagedCommitmentRecord` create, update, and reconciliation status calculation. Status must recalculate on: PM edit; new version activation; PE approval/rejection. Implement `ReconciliationRecord` audit trail creation on every status transition.

**Acceptance:** All seven reconciliation statuses reachable via defined transitions; `ReconciliationRecord` created on each transition; source date refresh on version activation triggers status recalculation.

#### 7.SCH.3.2 — Commitment Approval Workflow

Implement commitment approval threshold evaluation (§21.1). When `approvalRequired = true`: status = `PendingApproval`; PE receives workflow handoff via `@hbc/workflow-handoff`; committed dates not authoritative until approved. PE approve/reject transitions status accordingly.

**Acceptance:** Override within threshold auto-approves; override exceeding threshold halts at PendingApproval; PE approval/rejection flows correctly; rejected state restores prior committed dates.

#### 7.SCH.3.3 — Causation Taxonomy Integration

Implement `CausationCode` taxonomy (§13) as governed data. Commitment, blocker, readiness, and reconciliation records must reference taxonomy codes. Freeform explanation field is permitted alongside but does not replace coded cause.

**Acceptance:** Taxonomy CRUD by Admin; taxonomy codes selectable on all applicable records; required validation enforced where spec mandates it.

---

### Stage 7.SCH.4 — Publication Workflow and Published Forecast Layer

Must follow Stage 7.SCH.3 (managed commitments must exist to drive publication content).

#### 7.SCH.4.1 — PublicationRecord Lifecycle

Implement `PublicationRecord` create/update with full `Draft → ReadyForReview → Published → Superseded` lifecycle. Implement `PublicationBlocker` evaluation on submission. Implement PE approval via `@hbc/workflow-handoff`. Auto-publish eligibility evaluated per §21.3.

**Acceptance:** Full lifecycle traversed in integration test; publish blockers prevent advancement; PE rejection returns to Draft; supersession of prior Published record is atomic.

#### 7.SCH.4.2 — PublishedActivitySnapshot Freeze

On publication reaching `Published` status, freeze `PublishedActivitySnapshot` records combining source truth and managed commitments per §3.3. Published snapshots are immutable after creation.

**Acceptance:** Published snapshots match dual-truth combination rules; no mutation possible post-publish; new publication does not modify prior published snapshots.

#### 7.SCH.4.3 — Health Spine and Canvas Publication

Implement `ScheduleSummaryProjection` (§19) computed exclusively from the most recent `Published` publication. Register with health spine per P3-D2 integration contract. Canvas tile consumes projection.

**Acceptance:** Summary computed from Published publication only; live working state does not affect health spine; canvas tile displays status badge, % complete, forecast date, variance, confidence label, next milestone.

#### 7.SCH.4.4 — Milestone Working Model

Implement `MilestoneRecord` as a view-projection combining `ImportedActivitySnapshot` + `ManagedCommitmentRecord` data. Implement milestone status calculation (§4.3) with governed thresholds. Implement manual milestone creation. Implement milestone type management.

**Acceptance:** All milestone status transitions reachable; status thresholds read from policy; manual milestones function independently; milestones update correctly when underlying commitment or source dates change.

---

### Stage 7.SCH.5 — Field Execution Layer

Must follow Stage 7.SCH.1 (activity snapshots) and Stage 7.SCH.2 (policy set). Can proceed in parallel with Stages 7.SCH.3 and 7.SCH.4.

#### 7.SCH.5.1 — FieldWorkPackage and Location Model

Implement `FieldWorkPackage` creation beneath activities with location node assignment. Implement `LocationNode` governed hierarchy with enterprise template support. Implement planned/committed/actual date fields and progress basis assignment per governed work-type rules.

**Acceptance:** Work packages create beneath activities; location hierarchy creates from enterprise templates; progress basis assignment reads from policy; date window validation enforced.

#### 7.SCH.5.2 — CommitmentRecord and LookAheadPlan

Implement `CommitmentRecord` creation, acknowledgement lifecycle (§7), and PPC tracking. Implement `LookAheadPlan` with window management and PPC close-out. Rolling PPC calculation from Governed window.

**Acceptance:** Full commitment lifecycle (Requested → Acknowledged → Accepted → Kept/Missed) functional; PPC numerator/denominator computed correctly on plan close; rolling PPC reads from policy window.

#### 7.SCH.5.3 — BlockerRecord and Escalation

Implement `BlockerRecord` with severity, ownership, status lifecycle, and escalation routing. Escalation triggers via `@hbc/notification-intelligence` when `escalationAt` threshold passes. Blocker links to related artifacts via `@hbc/related-items`.

**Acceptance:** All blocker statuses reachable; escalation notification fires at correct threshold; related-item links functional.

#### 7.SCH.5.4 — ReadinessRecord with Dimension Tracking

Implement `ReadinessRecord` with governed dimension set. Overall readiness derived from dimension statuses. Readiness assessment surfaced in work-package detail and commitment planning views.

**Acceptance:** Per-dimension status assessment stored; overall readiness derived correctly; governed dimension set loaded from policy.

#### 7.SCH.5.5 — Progress Claim and Verification Pipeline

Implement `ProgressClaimRecord` submission, evidence attachment via `@hbc/related-items`, `ProgressVerificationRecord` creation by designated verifier, and PM/PE acceptance gate (§8). Three-tier authority chain enforced: reported → verified → authoritative.

**Acceptance:** Claim without verification stays at reported tier; verification produces verified tier; PM acceptance promotes to authoritative; roll-up to parent activity respects authority tier.

---

### Stage 7.SCH.6 — Analytics and Intelligence Layer

Must follow Stage 7.SCH.1 (activity snapshots) and Stage 7.SCH.4 (publication layer for confidence computation). Can proceed in parallel with Stage 7.SCH.5.

#### 7.SCH.6.1 — Schedule Quality Grading Engine

Implement `ScheduleQualityGrade` computation with all governed grading controls (§11.1). Controls and weights must read from `GovernedPolicySet`. Triggered on each version activation.

**Acceptance:** Grade computed per activation; changing a control threshold in policy changes subsequent grade output without code change; individual control scores transparent in output.

#### 7.SCH.6.2 — Float Path Intelligence

Implement `FloatPathSnapshot` computation (§11.2) per version activation. Criticality index per activity. Critical and near-critical activity sets identified. Near-critical threshold reads from policy.

**Acceptance:** Criticality index formula verified against known schedule; near-critical threshold configurable; snapshot immutable after creation.

#### 7.SCH.6.3 — Milestone Slippage Trend

Implement `MilestoneSlippageTrend` maintenance (§11.3). New `SlippageTrendEntry` added on each version activation for each tracked milestone. Cumulative slippage and per-update slippage computed.

**Acceptance:** Trend entries added on activation; cumulative slippage computed correctly across three sequential test imports.

#### 7.SCH.6.4 — Confidence Record

Implement `ConfidenceRecord` multi-factor computation (§11.4). All factor weights and label thresholds read from `GovernedPolicySet`. Computed per publication cycle and on-demand.

**Acceptance:** Confidence score produced with all eight default factors; individual factor scores transparent; changing a factor weight in policy changes composite score; `VeryLow` label triggers work feed item.

#### 7.SCH.6.5 — Recommendation Engine

Implement `RecommendationRecord` generation via rules engine (§12). Rules fire on analytics computation events. Promotion paths create draft records of indicated type. No recommendation silently mutates authoritative records.

**Acceptance:** Recommendation fired on confidence collapse; promotion creates draft Scenario or Commitment record; authoritative records unchanged by promotion until explicitly confirmed.

---

### Stage 7.SCH.7 — Scenario Branch Model

Must follow Stage 7.SCH.1 (source snapshots for branching) and Stage 7.SCH.2 (policy for promotion rules).

#### 7.SCH.7.1 — ScenarioBranch Lifecycle and Activity Overrides

Implement `ScenarioBranch` creation from a specific `ScheduleVersionRecord`. Implement `ScenarioActivityRecord` overrides. Implement comparison output vs source dates and governing baseline.

**Acceptance:** Scenario branches correctly from chosen version; activity overrides produce comparison output; activities not overridden inherit source values.

#### 7.SCH.7.2 — Scenario Logic and Promotion

Implement `ScenarioLogicRecord` for alternative logic within scenarios. Implement promotion workflows: to commitment, to publication, to baseline (each via `@hbc/workflow-handoff`). Promotion creates appropriate draft target records.

**Acceptance:** Scenario promotion creates draft ManagedCommitmentRecords or PublicationRecord as appropriate; baseline promotion requires PE approval; source logic unmodified.

---

### Stage 7.SCH.8 — Offline-First Field Execution

Can proceed in parallel with Stage 7.SCH.5 after types exist. Prerequisite: `@hbc/session-state` integration confirmed.

#### 7.SCH.8.1 — IntentRecord Queue and Sync Infrastructure

Implement `IntentRecord` creation for all field-layer mutations (§15.1). Implement sync state lifecycle on all field records. Implement replay queue and retry behavior. Use `@hbc/session-state` for local persistence.

**Acceptance:** Field records created offline persist across app restart; sync queue replays on reconnection; `Synced` state confirmed after successful replay.

#### 7.SCH.8.2 — Conflict Detection and Routing

Implement conflict detection on replay (§15.3). Governed records with server-state divergence produce `ConflictRequiresReview` intent status. Conflict surfaced to user via `@hbc/my-work-feed` work item.

**Acceptance:** Simulated conflict (server record modified between offline create and sync) produces `ConflictRequiresReview`; work feed item created; user can resolve; non-governed conflicts auto-resolve last-write-wins.

---

### Stage 7.SCH.9 — Cross-Platform Workflow and Linked Artifacts

Must follow Stage 7.SCH.0 (blocker resolution), Stage 7.SCH.3 (commitments), Stage 7.SCH.4 (publication), Stage 7.SCH.5 (field execution). `@hbc/related-items` and `@hbc/workflow-handoff` enhancements from Stage 7.SCH.0 must be in place.

#### 7.SCH.9.1 — Linked Artifact Graph Integration

Register all schedule object types with `@hbc/related-items` (§18.1). Implement typed relationship creation from Schedule UI. Surface related items in activity, work-package, blocker, and publication detail views.

**Acceptance:** All relationship types in §18.1 table creatable; related items render in detail views; relationship context appears in publication notes.

#### 7.SCH.9.2 — Work Feed Registration and Notification Events

Register `ScheduleWorkAdapter` with `@hbc/my-work-feed` for all work item types in §18.3. Register notification event types with `@hbc/notification-intelligence` per §18.4. All thresholds read from policy.

**Acceptance:** All 10 work item types generated under correct conditions; notifications fire at threshold; changing threshold in policy changes trigger without code deployment.

#### 7.SCH.9.3 — Executive Review Annotation Integration

Confirm `@hbc/field-annotations` anchor types work for `{ publicationId, externalActivityKey, fieldKey }` and `{ publicationId, milestoneId, fieldKey }`. PER annotation surfaces accessible only against Published publication records.

**Acceptance:** PER can annotate published activity and milestone fields; annotations do not modify schedule records; PM draft state invisible to PER.

---

### Stage 7.SCH.10 — UI Surfaces and Progressive Disclosure

Must follow Stages 7.SCH.3–7.SCH.9 (all data layers must be functional before UI surfaces are implemented).

#### 7.SCH.10.1 — @hbc/complexity Tier Gating

Implement `@hbc/complexity` tier gating on all schedule module surfaces per §18.5. Essential tier: milestone status, overall health, next milestone. Standard tier: activity list, float indicators, commitment summary, blocker count, confidence label. Expert tier: full analytics, scenario comparison, logic layer detail, work-package roll-up detail.

**Acceptance:** Essential tier renders without analytics compute; Expert tier gated to authorized roles; tier assignment reads from governed policy.

#### 7.SCH.10.2 — PWA Schedule Module Surface

Implement full PWA schedule module surfaces: master-schedule view, milestone tracking, commitment management, field execution (work packages, look-ahead, blockers, readiness), publication workflow, scenario management, analytics dashboard. SPFx surfaces per P3-G1 §4.2 (summary, milestone list, publication status, launch-to-PWA for complex workflows).

**Acceptance:** All P3-G1 §4.2 SPFx capabilities present; PWA provides full workflow depth; launch-to-PWA deep links functional for upload, publication, and full analytics.

#### 7.SCH.10.3 — Saved Views and Export Integration

Integrate `@hbc/saved-views` for activity list, milestone list, commitment list, blocker log, and look-ahead plan surfaces. Integrate `@hbc/export-runtime` for export capabilities per §22.9 with `ISavedViewContext` handoff.

**Acceptance:** Saved view state persists across sessions; export produces correct output for all four export types; saved view context propagates to export correctly.

---

### Stage 7.SCH.11 — Validation and Acceptance

Must follow all Stage 7.SCH stages and Phase 3 Stage 11 (UI Conformance Review) for schedule surfaces.

#### 7.SCH.11.1 — Automated Test Suite

- Unit tests: ≥ 85% coverage on calculation logic (criticality index, milestone status, commitment approval threshold, confidence factors, PPC, roll-up rules)
- Integration tests: import pipeline, dual-truth lifecycle, publication workflow, offline sync, scenario promotion
- Performance benchmarks: import < 5 seconds for 500+ activities; UI response < 500ms for commitment edits

#### 7.SCH.11.2 — Acceptance Gate Execution

Execute all Acceptance Gate §24 (§25 in document) criteria. Integrate with two sample projects. Verify Financial module (contract dates) and Health spine integration. Complete P3-H1 §18.5 gate checklist.

---

### Stage 7.SCH Key Dependencies and Blockers

| Blocker | Package | Impact | Pre-Condition For |
|---------|---------|--------|-------------------|
| B-SCH-01 | `@hbc/related-items` | Schedule anchor types missing | Stage 7.SCH.0.1 |
| B-SCH-02 | `@hbc/related-items` | Schedule object type registration | Stage 7.SCH.9.1 |
| B-SCH-03 | `@hbc/workflow-handoff` | Publication and scenario handoff types missing | Stage 7.SCH.0.2 |
| B-SCH-04 | `@hbc/complexity` | Expert tier availability unconfirmed | Stage 7.SCH.0.3 |
| B-SCH-05 | `@hbc/field-annotations` | Publication-activity anchor format unconfirmed | Stage 7.SCH.0.3 |

---


## 25. Acceptance Gate Reference

The Schedule Module delivery is subject to Acceptance Gate §18.5 from P3-H1.

**Gate §18.5 Schedule Module Criteria (updated):**

- [ ] All activity identity fields (§1.4) imported, snapshotted, and externalActivityKey derived correctly
- [ ] ScheduleVersionRecord (§1.2) creates frozen snapshot per import; version lineage chain maintained
- [ ] BaselineRecord (§1.3) supports multiple governed baselines with PE approval
- [ ] ActivityContinuityLink (§1.5) maintained across version activations
- [ ] ImportedRelationshipRecord (§10.2) preserved per version
- [ ] ManagedCommitmentRecord (§2.1) dual-truth model with reconciliation status lifecycle
- [ ] ReconciliationRecord audit trail (§2.2) created on all status transitions
- [ ] PublicationRecord (§3.1) stage-gated lifecycle with PE approval
- [ ] PublishedActivitySnapshot (§3.3) frozen at publication; consumed by health spine and executive review
- [ ] MilestoneRecord (§4) derived from dual-truth layers; status calculated
- [ ] ScenarioBranch (§5) with activity overrides, logic overrides, and promotion workflows
- [ ] FieldWorkPackage (§6.1) decomposition with location, trade, progress basis, and sync state
- [ ] CommitmentRecord (§6.3) with PPC tracking and acknowledgement
- [ ] BlockerRecord (§6.4) with severity, escalation, and linked artifact support
- [ ] ReadinessRecord (§6.5) with dimension-level tracking
- [ ] LookAheadPlan (§6.6) with PPC close-out
- [ ] AcknowledgementRecord (§7) with full lifecycle including overdue and escalation
- [ ] ProgressClaimRecord and ProgressVerificationRecord (§8) with three-tier progress authority
- [ ] Roll-up rules (§9) from work packages to activities; sensitivity thresholds enforced
- [ ] Logic layers (§10) distinguished: source CPM, scenario, work-package links
- [ ] Impact propagation (§10.4) informational until publication
- [ ] ScheduleQualityGrade (§11.1) with configurable grading controls
- [ ] FloatPathSnapshot (§11.2) computed per import
- [ ] MilestoneSlippageTrend (§11.3) maintained
- [ ] ConfidenceRecord (§11.4) multi-factor output
- [ ] RecommendationRecord (§12) with promotion paths; no silent mutation of authoritative records
- [ ] CausationCode taxonomy (§13) governed; used across all record types
- [ ] Classification framework (§14) with source metadata normalized on import
- [ ] IntentRecord offline model (§15) with sync states and conflict routing
- [ ] Visibility policy (§16) enforced; external participant model implemented
- [ ] Dual-calendar model (§17) with divergence flagging
- [ ] `@hbc/related-items` integration (§18.1) for all listed object types
- [ ] `@hbc/workflow-handoff` used for publication review, commitment approval, scenario promotion
- [ ] `@hbc/my-work-feed` ScheduleWorkAdapter registered with all work item types
- [ ] `@hbc/notification-intelligence` schedule event types registered
- [ ] `@hbc/complexity` tier gating implemented across all module surfaces
- [ ] `@hbc/field-annotations` annotation scope limited to Published layer
- [ ] `@hbc/session-state` used for offline persistence and conflict queue
- [ ] All Governed thresholds are configurable by Manager of Operational Excellence / Admin
- [ ] Current-state and future-state ownership models both supported via governed role assignment
- [ ] ScheduleSummaryProjection (§19) computed from Published publication only
- [ ] SPFx lane parity per P3-G1 §4.2 (summary, milestone list, launch-to-PWA)
- [ ] Export via `@hbc/export-runtime` per §22.9
- [ ] Unit tests: ≥ 85% coverage on calculation logic, status computations, roll-up rules, confidence computation
- [ ] Integration tests: import, dual-truth reconciliation, publication lifecycle, offline sync workflows
- [ ] Performance: schedule import < 5 seconds for 500+ activities; UI response < 500ms for commitment edits
- [ ] Integration with Financial module (contract milestone dates) verified
- [ ] Integration with Health spine (metrics publication) verified
- [ ] User acceptance testing passed with 2+ sample projects

---


## 26. Remaining Blockers and Package Enhancement Requirements

The following shared package enhancements are required before full Schedule module implementation can complete. These are **not optional workarounds**; the module must use shared infrastructure.

| Blocker | Package | Required Enhancement | Blocking |
|---------|---------|---------------------|---------|
| B-SCH-01 | `@hbc/related-items` | Add `ScheduleActivity` and `ScheduleWorkPackage` anchor types to `IGovernanceTimelineEvent` | Stage 5.1 / Activity Spine integration |
| B-SCH-02 | `@hbc/related-items` | Register `ScheduleActivity`, `ScheduleWorkPackage`, `ScenarioBranch` as related-items object types | §18.1 linkage |
| B-SCH-03 | `@hbc/workflow-handoff` | Add `PublicationReviewRequest`, `ScenarioPromotionRequest`, `BaselineApprovalRequest` handoff types | §18.2 |
| B-SCH-04 | `@hbc/complexity` | Confirm `Expert` tier availability for field analytics surfaces; verify no collisions with Financial module tier assignments | §18.5 |
| B-SCH-05 | `@hbc/field-annotations` | Confirm `{ publicationId, externalActivityKey, fieldKey }` anchor type is supported (may be covered by v0.2.0 AnchorType discriminator) | §18.6 |

---


---

## Navigation

| File | Contents |
|------|---------|
| [P3-E5.md](P3-E5-Schedule-Module-Field-Specification.md) | Master index — Purpose, Operating Model, Ownership Maturity |
| [P3-E5-T01-Source-Identity-and-Versioning.md](P3-E5-T01-Source-Identity-and-Versioning.md) | T01: §1 Identity/Versioning/Import and §17 Dual-Calendar Model |
| [P3-E5-T02-Dual-Truth-Commitments-and-Milestones.md](P3-E5-T02-Dual-Truth-Commitments-and-Milestones.md) | T02: §2 Dual-Truth/Operating Layer and §4 Milestone Working Model |
| [P3-E5-T03-Publication-Layer.md](P3-E5-T03-Publication-Layer.md) | T03: §3 Published Forecast Layer and §19 Schedule Summary Projection |
| [P3-E5-T04-Scenario-Branch-Model.md](P3-E5-T04-Scenario-Branch-Model.md) | T04: §5 Scenario Branch Model |
| [P3-E5-T05-Field-Execution-Layer.md](P3-E5-T05-Field-Execution-Layer.md) | T05: §6 Field Execution, §7 Acknowledgement, §8 Progress/Verification, §9 Roll-Up |
| [P3-E5-T06-Logic-Dependencies-and-Propagation.md](P3-E5-T06-Logic-Dependencies-and-Propagation.md) | T06: §10 Logic Layers and Dependency Model |
| [P3-E5-T07-Analytics-Intelligence-and-Grading.md](P3-E5-T07-Analytics-Intelligence-and-Grading.md) | T07: §11 Analytics/Grading/Confidence, §12 Recommendations, §13 Causation Taxonomy |
| [P3-E5-T08-Classification-Metadata-Offline-and-Sync.md](P3-E5-T08-Classification-Metadata-Offline-and-Sync.md) | T08: §14 Classification/Metadata, §15 Offline/Sync, §16 Visibility/Participation |
| [P3-E5-T09-Platform-Integration-and-Governance.md](P3-E5-T09-Platform-Integration-and-Governance.md) | T09: §18 Cross-Platform Workflow/Shared Packages, §20 Governance/Policy, §23 Executive Review |
| [P3-E5-T10-Business-Rules-Capabilities-and-Reference.md](P3-E5-T10-Business-Rules-Capabilities-and-Reference.md) | T10: §21 Business Rules, §22 Required Capabilities, §27 Status Enumerations, §28 Field Index |
| [P3-E5-T11-Implementation-and-Acceptance.md](P3-E5-T11-Implementation-and-Acceptance.md) | T11: §24 Implementation Guide, §25 Acceptance Gate, §26 Remaining Blockers |
