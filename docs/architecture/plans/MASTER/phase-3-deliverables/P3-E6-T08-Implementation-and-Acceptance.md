# P3-E6 — Constraints Module: Implementation and Acceptance

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E6-T08 |
| **Parent** | [P3-E6 Constraints Module Field Specification](P3-E6-Constraints-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T08: Implementation and Acceptance |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: Implementation Guide (recommended sequence, dependencies, shared package reuse, phased rollout strategy, migration notes, future-ready seams, validation guidance), acceptance gate, and package blockers.*

---

## 8. Implementation Guide

The Constraints module is implemented as part of Phase 3 **Stage 7 — Core Module Implementation**. Stage 7 must follow Stage 2 (auth), Stage 3 (spine adapters), Stage 4 (routing), and Stage 5 (shared feature infrastructure). The internal stages below decompose Stage 7 Constraints work into sequenced implementation layers. All stages within §8 are sub-scope of Phase 3 Stage 7 unless noted.

Resolve the blockers in §8.9 before beginning Stage 7.CON.1.

---

### Stage 7.CON.0 — Pre-Implementation Blocker Resolution

Must precede all other Constraints implementation stages.

#### 7.CON.0.1 — Resolve `@hbc/related-items` Constraints object types

Verify that `RiskRecord`, `ConstraintRecord`, `DelayRecord`, and `ChangeEventRecord` are registerable as object types in `@hbc/related-items`. If not, deliver the required extensions.

**Acceptance:** All four record types registerable; relationship types applicable to each confirmed.

**Blocker:** B-CON-01

#### 7.CON.0.2 — Resolve `@hbc/workflow-handoff` Constraints handoff types

Confirm or extend `@hbc/workflow-handoff` to support the 5 handoff types required for the Constraints module (T07 §7.2).

**Acceptance:** All 5 handoff types deliverable; unit tests pass.

**Blocker:** B-CON-02

#### 7.CON.0.3 — Confirm `@hbc/field-annotations` published-snapshot anchor support

Verify `@hbc/field-annotations` supports anchors on `LedgerRecordSnapshot.snapshotId` and `ReviewPackage.reviewPackageId`. Confirm annotation isolation from live ledger records is enforced by design.

**Acceptance:** Annotation anchors resolve to published snapshot context; live ledger records have no annotation write path.

**Blocker:** B-CON-03

---

### Stage 7.CON.1 — Data Model Foundation and Package Scaffold

Can begin immediately after Stage 7.CON.0. Foundational for all subsequent stages.

#### 7.CON.1.1 — Core TypeScript types

Deliver the `@hbc/features-constraints` (or equivalent) package scaffold. Define all TypeScript types for:
- `IRiskRecord`, `IConstraintRecord`, `IDelayRecord`, `IChangeEventRecord`
- `IChangeLineItem`, `IProcoreMappingRecord`
- `ITimeImpactRecord`, `ICommercialImpactRecord`
- `ILineageRecord`, `ICrossLedgerLink`, `IReviewPackage`, `ILedgerRecordSnapshot`
- All status enumerations (all four ledger lifecycle enums)
- All governed enum types (category enums, origin enums, event type enums, etc.)
- Supporting value types: `IAttachmentRef`, `ICommentEntry`, `ICostBreakdownItem`

**Acceptance:** All types compile; strict TypeScript; no `any` in public interfaces.

#### 7.CON.1.2 — State machine enforcement

Implement lifecycle state machine for each ledger. Enforce valid transitions at the service/domain layer, not just UI layer. State machine must reject invalid transitions with typed errors.

**Acceptance:** All invalid transitions rejected; valid transitions accepted; terminal state rule enforced; no-hard-delete enforced at persistence layer.

#### 7.CON.1.3 — Immutability enforcement

Enforce immutable fields (`id`, `number`, `category`, `dateIdentified`, `identifiedBy`, lineage fields) at the persistence layer. Attempt to modify immutable fields must return typed errors.

**Acceptance:** Immutable fields cannot be modified via any write path.

---

### Stage 7.CON.2 — Risk Ledger

Implement full Risk Ledger based on T01.

#### 7.CON.2.1 — Risk CRUD

Implement create, read, update, and lifecycle management for `IRiskRecord`. Implement `riskScore` calculation on save. Implement BIC team registry consumption.

**Acceptance:** Full CRUD operational; riskScore calculated correctly; BIC enum sourced from governed configuration.

#### 7.CON.2.2 — Risk list view and detail view

Implement Risk ledger list view with filtering (status, category, BIC, riskScore range), sorting, and color-coding by riskScore. Implement detail view with all fields, spawn action, comment log, and attachment management.

**Acceptance:** List and detail views functional; spawn action available on applicable records.

---

### Stage 7.CON.3 — Constraint Ledger

Implement full Constraint Ledger based on T02.

#### 7.CON.3.1 — Constraint CRUD

Full CRUD for `IConstraintRecord`. Implement `daysOpen` calculation. Implement overdue detection logic.

**Acceptance:** Full CRUD; daysOpen calculated on load; overdue detection working.

#### 7.CON.3.2 — Constraint list view and detail view

List view with filtering, sorting, color-coding. Detail view with spawn actions (spawn Delay, spawn Change Event). Comment log append-only enforcement.

**Acceptance:** List and detail views functional; spawn actions trigger lineage workflow.

---

### Stage 7.CON.4 — Delay Ledger

Implement full Delay Ledger based on T03. This is the most complex ledger due to schedule reference integration and evidence gates.

#### 7.CON.4.1 — Delay CRUD with schedule reference model

Implement `IDelayRecord` with both `Integrated` and `ManualFallback` schedule reference modes. When in `Integrated` mode, wire schedule version picker to P3-E5 `ScheduleVersionRecord` list. When in `ManualFallback`, display free-text fields.

**Acceptance:** Both modes functional; schedule version picker works if P3-E5 is available; ManualFallback mode fully self-contained without P3-E5 dependency.

**Implementation note:** Implement ManualFallback mode first. Integrated mode may be delivered as a follow-on in the same stage after P3-E5 integration is verified.

#### 7.CON.4.2 — Time impact and commercial impact separation

Implement `ITimeImpactRecord` and `ICommercialImpactRecord` as nested records within `IDelayRecord`. Enforce `separationConfirmed` boolean gate before `Quantified` transition. UI must clearly present time impact and commercial impact as separate sections with separate confidence levels.

**Acceptance:** Separation confirmed gate enforced; UI clearly separates time and cost analysis.

#### 7.CON.4.3 — Evidence gates at Quantified and Dispositioned

Implement state gate enforcement for `Quantified` and `Dispositioned` transitions. System must check all preconditions before allowing transition; display specific errors for each unmet precondition.

**Acceptance:** All preconditions enforced; clear error messages for each gate failure.

#### 7.CON.4.4 — Evidence attachments with typed categories

Implement `evidenceAttachments` array with governed `evidenceType` enum. Attachment upload, delete (soft void), and display.

**Acceptance:** Typed evidence attachments working; evidence type enum sourced from governed configuration.

---

### Stage 7.CON.5 — Change Ledger (Manual-Native Mode)

Implement Change Ledger in `ManualNative` mode based on T04. Procore-integrated mode is a future-phase implementation.

#### 7.CON.5.1 — Change event CRUD with line items

Implement `IChangeEventRecord` with line item support (`IChangeLineItem[]`). Implement `totalCostImpact` calculation from line items when present. Implement canonical status model and approval workflow.

**Acceptance:** Full CRUD; line item cost rollup working; approval workflow enforced.

#### 7.CON.5.2 — Procore mapping fields (schema-ready, not wired)

Include all `IProcoreMappingRecord` fields in the data model and TypeScript types. In `ManualNative` mode, `procoreMapping` is null. Do not implement Procore API calls. Deliver the schema foundation so future Procore integration requires no breaking model changes.

**Acceptance:** `IProcoreMappingRecord` type defined; `integrationMode` field present; no Procore API calls in Phase 3.

---

### Stage 7.CON.6 — Cross-Ledger Lineage

Implement cross-ledger lineage model based on T05.

#### 7.CON.6.1 — Spawn workflows and `LineageRecord`

Implement the three spawn paths (Risk→Constraint, Constraint→Delay, Constraint→Change Event). Create `ILineageRecord` on spawn. Pre-populate spawned record forms with seeded context from parent. Update parent's spawned array on successful spawn.

**Acceptance:** All three spawn paths working; `LineageRecord` created for each; seeded fields pre-populated; parent `spawnedIds` updated; `RiskRecord.status` auto-transitions to `MaterializationPending` on spawn.

#### 7.CON.6.2 — Peer link workflows (Delay ↔ Change Event)

Implement bidirectional Delay ↔ Change Event link. Link picker, unlink action, bidirectionality maintenance.

**Acceptance:** Bidirectional links maintained; link/unlink tracked in audit trail.

#### 7.CON.6.3 — Lineage display on detail views

Implement "Created from" banner (parent reference) and "Spawned records" / "Linked records" sections on each ledger detail view.

**Acceptance:** Lineage visible on all four detail view types; links clickable.

---

### Stage 7.CON.7 — Publication and Review Package

Implement publication model based on T06.

#### 7.CON.7.1 — Record-level snapshot publication

Implement `LedgerRecordSnapshot` creation. PM "Publish snapshot" action on individual records. Snapshot immutability enforced.

**Acceptance:** Snapshots created; immutable; PER may annotate via `@hbc/field-annotations` on snapshot anchors.

#### 7.CON.7.2 — Review package publication

Implement `ReviewPackage` creation covering one or more ledgers. PM/Approver "Publish review package" action. Package viewer for PER review.

**Acceptance:** Review packages created; multi-ledger scope supported; PER can view and annotate published packages.

---

### Stage 7.CON.8 — Shared Package Integration

Wire all shared platform packages based on T07.

#### 7.CON.8.1 — Spine event contracts

Implement all Activity spine events (T07 §7.5). Implement Health spine metric publication for all four ledgers (T07 §7.5). Verify event contracts against P3-A3 spec.

**Acceptance:** All spine events fired correctly; Health spine metrics published.

#### 7.CON.8.2 — `ConstraintsWorkAdapter` and notification registration

Register `ConstraintsWorkAdapter` with `@hbc/my-work-feed` (9 work item types). Register notification event types with `@hbc/notification-intelligence`. Verify work items surface correctly in Project Work Queue.

**Acceptance:** Work items surface in Work Queue; notifications delivered correctly.

#### 7.CON.8.3 — `@hbc/related-items` registration

Register all four record types with `@hbc/related-items`. Implement relationship UI on each detail view. Verify schedule activity links work with P3-E5 integration.

**Acceptance:** Related items panel functional on all four detail views; relationship types filter correctly per record type.

#### 7.CON.8.4 — `@hbc/versioned-record` and `@hbc/bic-next-move`

Wire `@hbc/versioned-record` for audit history on all four record types. Wire `@hbc/bic-next-move` for BIC ownership display on Constraint, Risk, Delay, and Change detail views.

**Acceptance:** Version history accessible from detail views; BIC next-move indicator functional.

---

### Stage 7.CON.9 — Export and Reports

Implement export capability based on T07 §7.6.

**Reports to deliver:** Risk Register Report, Constraint Log Report, Delay Log Report, Change Event Log Report, Cross-Ledger Summary Report, Review Package PDF export.

**Acceptance:** All report types generate without error; Review Package PDF generated from published state; CSV exports accurate.

---

### Stage 7.CON.10 — Validation, UAT, and Acceptance

Final validation and acceptance gate for the full module.

#### 7.CON.10.1 — Integration testing

Integration tests for: CRUD on all four ledgers; lifecycle state machine enforcement; lineage spawn workflows; publication workflows; spine event contracts; shared package integration.

**Acceptance:** All integration tests pass.

#### 7.CON.10.2 — User acceptance testing

UAT with 2+ sample projects covering all four ledgers, spawn workflows, publication, and PER annotation.

**Acceptance:** UAT sign-off; §8.2 acceptance gate passes.

---

### Migration and refactor notes (from old P3-E6 assumptions)

The previous P3-E6 single-file model had the following structural assumptions that are superseded:

1. **Single "Constraint Record is the fundamental unit" model** → Replaced with four peer ledgers. The Constraint Ledger is one of four peers, not the parent record type.

2. **Change Tracking as a sub-ledger of Constraints** → The Change Ledger is a peer ledger in the same module workspace. Change events have their own canonical identity and lifecycle, not "change entries linked to constraints."

3. **Delay Log as a simple logging table** → The Delay Ledger is a claims-ready contemporaneous evidence ledger with schedule reference, evidence gates, and time/cost separation.

4. **Single 36-value category enum covering all record types** → Each ledger has its own governed category/event-type taxonomy appropriate to its domain.

5. **Hard-coded 30-day escalation threshold** → All thresholds are now governed configuration. Remove hard-coded threshold from implementation.

6. **Hard delete allowed for drafts** → No hard delete after first save. Implement `Void` with reason for abandoned/error records.

7. **`@hbc/versioned-record` as upload history mechanism** → Use `@hbc/versioned-record` for field-level audit trail (who changed what and when) across all ledger records. Upload history for schedule files is a P3-E5 concern.

8. **Risk as a category within the Constraint ledger** → Risk is a separate ledger (T01). Remove any `RISK_MANAGEMENT` category from the Constraint ledger in favor of the dedicated Risk ledger.

9. **Annotations directly on live records** → Annotations via `@hbc/field-annotations` are anchored to **published snapshots** only. Remove any annotation path that writes to or reads from live ledger records.

---

### Future-phase integration seams

**Procore integration (future phase):**
- `IProcoreMappingRecord` schema is defined and typed but not wired in Phase 3.
- Manual-to-integrated promotion workflow defined in T04 §4.7 but not implemented in Phase 3.
- Implement Procore integration by wiring the sync/webhook path to the existing `procoreMapping` field structure. No schema redesign required.

**Delay claims packaging (future phase):**
- Fragnet generation, formal TIA tooling, and claims-grade packaging are future additions.
- Fields: `fragnetAvailable`, `fragnetReference`, `tiaAvailable`, `tiaReference`, `pwindowStart`, `pwindowEnd` are defined in Phase 3 data model.
- Future implementation adds tooling around these fields without schema changes.

**Schedule integration for delays (future phase enhancement):**
- Phase 3 requires both `Integrated` and `ManualFallback` modes.
- Full schedule integration (wiring `scheduleVersionId` to P3-E5 `ScheduleVersionRecord`) is available after P3-E5 Integrated mode is delivered.
- ManualFallback mode must work independently without P3-E5 dependency.

---

## 8.2 Acceptance Gate

For the comprehensive acceptance evaluation, all items below must pass before the Constraints module is declared Phase 3 complete.

### Data model and foundation

- [ ] **AC-CON-01** All four ledger TypeScript types fully defined; strict typed; no `any` in public interfaces
- [ ] **AC-CON-02** Lifecycle state machines implemented for all four ledgers; invalid transitions rejected at service layer
- [ ] **AC-CON-03** Immutable fields enforced at persistence layer for all four ledger types
- [ ] **AC-CON-04** No hard delete implemented or accessible; `Void`/`Cancelled`/`Superseded`/`Archived` with required fields enforced
- [ ] **AC-CON-05** Comment logs are append-only across all four ledgers

### Risk Ledger

- [ ] **AC-CON-06** Risk CRUD working; `riskScore` calculated correctly on save
- [ ] **AC-CON-07** Risk lifecycle (Identified → UnderAssessment → Mitigated/Accepted → MaterializationPending → Closed) enforced
- [ ] **AC-CON-08** Risk category enum sourced from governed configuration
- [ ] **AC-CON-09** Risk probability/impact scales sourced from governed configuration

### Constraint Ledger

- [ ] **AC-CON-10** Constraint CRUD working; `daysOpen` calculated on load
- [ ] **AC-CON-11** Overdue detection working; overdue constraints flagged correctly
- [ ] **AC-CON-12** Constraint lifecycle enforced; terminal states require closure reason
- [ ] **AC-CON-13** Spawn actions (spawn Delay, spawn Change Event) available on Constraint detail view

### Delay Ledger

- [ ] **AC-CON-14** Delay CRUD working in both `Integrated` and `ManualFallback` schedule reference modes
- [ ] **AC-CON-15** Time impact and commercial impact implemented as separate sections with separate confidence levels
- [ ] **AC-CON-16** `separationConfirmed` gate enforced before `Quantified` transition
- [ ] **AC-CON-17** Evidence gates at `Quantified` and `Dispositioned` enforced; specific error messages for each unmet precondition
- [ ] **AC-CON-18** Evidence attachments with typed categories working
- [ ] **AC-CON-19** `notificationDate` required; chronological validation enforced (`delayStartDate ≤ notificationDate`)

### Change Ledger

- [ ] **AC-CON-20** Change event CRUD working in `ManualNative` mode
- [ ] **AC-CON-21** Line items functional; `totalCostImpact` calculated from line items when present
- [ ] **AC-CON-22** Approval workflow enforced; `approvedDate` and `approvedBy` required at `Approved` transition
- [ ] **AC-CON-23** `IProcoreMappingRecord` schema defined and typed; `integrationMode` field present; `procoreMapping` is null in ManualNative mode
- [ ] **AC-CON-24** Canonical HB Intel identity and status model preserved; no Procore API calls in Phase 3

### Cross-ledger lineage

- [ ] **AC-CON-25** All three spawn paths working (Risk→Constraint, Constraint→Delay, Constraint→Change Event)
- [ ] **AC-CON-26** `LineageRecord` created for each spawn; immutable
- [ ] **AC-CON-27** Seeded fields pre-populated on spawned record forms
- [ ] **AC-CON-28** Parent `spawnedIds` arrays updated after successful spawn
- [ ] **AC-CON-29** `RiskRecord.status` auto-transitions to `MaterializationPending` on constraint spawn
- [ ] **AC-CON-30** Delay ↔ Change Event bidirectional peer links working; bidirectionality maintained
- [ ] **AC-CON-31** Lineage display ("Created from" + "Spawned records") visible on all four detail views

### Publication and review

- [ ] **AC-CON-32** Record-level snapshot publication working; snapshots immutable
- [ ] **AC-CON-33** Review package publication working; multi-ledger scope supported
- [ ] **AC-CON-34** PER annotations via `@hbc/field-annotations` anchored to published snapshots only; no annotation write path to live records
- [ ] **AC-CON-35** Live operational state and published state correctly separated in all views

### Shared package integration

- [ ] **AC-CON-36** All Activity spine events firing correctly; verified against P3-A3 spec
- [ ] **AC-CON-37** Health spine metrics published for all four ledgers; live metrics and published metrics correctly separated
- [ ] **AC-CON-38** `ConstraintsWorkAdapter` registered; all 9 work item types surfacing in Work Queue
- [ ] **AC-CON-39** Notification event types registered; notifications delivered correctly
- [ ] **AC-CON-40** All four record types registered in `@hbc/related-items`; relationship UI functional
- [ ] **AC-CON-41** `@hbc/versioned-record` audit history accessible from all four detail views
- [ ] **AC-CON-42** `@hbc/bic-next-move` BIC indicator functional on all four detail views

### Governance and configuration

- [ ] **AC-CON-43** All governed enumerations (categories, event types, probability/impact scales, BIC registry) loaded from governed configuration, not hard-coded
- [ ] **AC-CON-44** All governed thresholds (overdue escalation, riskScore color-coding, notification timers) loaded from governed configuration
- [ ] **AC-CON-45** Manager of Operational Excellence / Admin can configure taxonomies and thresholds without code changes

### Export and reporting

- [ ] **AC-CON-46** All 6 report types generate without error
- [ ] **AC-CON-47** Review Package PDF generated from published state
- [ ] **AC-CON-48** CSV exports accurate for all four ledger types

### Quality and testing

- [ ] **AC-CON-49** Unit test coverage > 85% on state machine transitions, validations, and calculations
- [ ] **AC-CON-50** Integration tests passing for CRUD, lifecycle, lineage, publication, and spine events
- [ ] **AC-CON-51** Performance: ledger list view loads < 1 second for 100 records; filter < 500ms
- [ ] **AC-CON-52** UAT passed with 2+ sample projects covering all four ledgers and lineage workflows
- [ ] **AC-CON-53** Package blockers B-CON-01 through B-CON-03 resolved or formally deferred with owner sign-off

---

## 8.3 Package Blockers

### B-CON-01 — `@hbc/related-items` Constraints object types

| Property | Value |
|----------|-------|
| **Blocker ID** | B-CON-01 |
| **Package** | `@hbc/related-items` |
| **Required enhancement** | Register `RiskRecord`, `ConstraintRecord`, `DelayRecord`, and `ChangeEventRecord` as object types; confirm supported relationship types per each |
| **Impact if unresolved** | Cross-module related items panel will not function for any Constraints module ledger record |
| **Precondition for** | Stage 7.CON.8.3 |

### B-CON-02 — `@hbc/workflow-handoff` Constraints handoff types

| Property | Value |
|----------|-------|
| **Blocker ID** | B-CON-02 |
| **Package** | `@hbc/workflow-handoff` |
| **Required enhancement** | Confirm or extend to support: `ConstraintEscalationHandoff`, `DelayDispositionRequest`, `ChangeEventApprovalRequest`, `ReviewPackagePublicationHandoff`, `RiskMaterializationHandoff` |
| **Impact if unresolved** | Handoff-based approval workflows for dispositions, change event approval, and review package routing will not function |
| **Precondition for** | Stage 7.CON.8 |

### B-CON-03 — `@hbc/field-annotations` published-snapshot anchor support

| Property | Value |
|----------|-------|
| **Blocker ID** | B-CON-03 |
| **Package** | `@hbc/field-annotations` |
| **Required enhancement** | Confirm support for `LedgerRecordSnapshot.snapshotId` and `ReviewPackage.reviewPackageId` anchor types; confirm that annotation write path to live ledger records is structurally prevented |
| **Impact if unresolved** | PER annotation layer will not function for Constraints module review |
| **Precondition for** | Stage 7.CON.7 |

---

*Navigation: [← T07 Platform Integration](P3-E6-T07-Platform-Integration-and-Shared-Packages.md) | [Master Index](P3-E6-Constraints-Module-Field-Specification.md)*
