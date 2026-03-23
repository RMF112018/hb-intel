# P3-E6 — Constraints Module: Platform Integration and Shared Packages

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E6-T07 |
| **Parent** | [P3-E6 Constraints Module Field Specification](P3-E6-Constraints-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T07: Platform Integration and Shared Packages |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: shared platform package integration, spine event contracts, downstream Health/Work Queue/Reports contracts, and cross-module relationships. See [T06](P3-E6-T06-Publication-Review-and-Governance.md) for the publication and governance model that governs what state these packages consume.*

---

## 7. Platform Integration and Shared Packages

### 7.1 Shared package integration table

| Package | Integration point | Mode | Notes |
|---------|------------------|------|-------|
| `@hbc/field-annotations` | PER annotation layer on **published snapshots and review packages only** | Published state | Annotations anchored to `LedgerRecordSnapshot.snapshotId` or `ReviewPackage.reviewPackageId`; never on live ledger records; per T06 §6.4 |
| `@hbc/related-items` | Cross-module relationships for all four ledger record types | Live state | All four record types registered as object types; 9+ relationship types supported; see T05 §5.7 |
| `@hbc/acknowledgement` | Formal acknowledgement of escalations, disposition outcomes, and publication receipt | Live state | Used for: escalation acknowledgement workflows; disposition acknowledgement; review package receipt confirmation by PM after PER review |
| `@hbc/workflow-handoff` | Structured handoffs across ledger lifecycle | Live state | 5 handoff types (§7.2); used for disposition approval, change event approval request, escalation routing |
| `@hbc/notification-intelligence` | Priority-tiered notifications for ledger events | Live state | 8 notification types (§7.3); governed routing and thresholds |
| `@hbc/bic-next-move` | BIC/owner tracking across all four ledgers | Live state | BIC field on Risk, Constraint, Delay, Change records; `@hbc/bic-next-move` tracks who holds the ball and what action is required |
| `@hbc/versioned-record` | Record version history and audit trail | Live state | Tracks field-level change history for all four ledger records; enables "who changed what and when" audit views |
| `@hbc/my-work-feed` | Cross-module personal work aggregation | Live state | 9 work item types via `ConstraintsWorkAdapter` (§7.4) |
| `@hbc/complexity` | 3-tier progressive disclosure (Essential / Standard / Expert) | Live state | Governing field density across ledger views; risk score detail = Expert; delay analysis method = Standard/Expert; basic status = Essential |
| `@hbc/export-runtime` | Data export lifecycle and artifact generation | Async | Risk register export, constraint log CSV, delay log CSV, change event log CSV, review package PDF |
| `@hbc/session-state` | Offline-safe session persistence | Offline | Supports offline-first constraint and delay logging via IndexedDB; operation queue for mutations when reconnected |

### 7.2 `@hbc/workflow-handoff` — handoff types for Constraints module

| Handoff Type | Trigger | Recipient |
|-------------|---------|-----------|
| `ConstraintEscalationHandoff` | Constraint overdue > governed threshold | Designated Approver or manager |
| `DelayDispositionRequest` | Delay reaches `Quantified` state; disposition decision needed | Designated Approver |
| `ChangeEventApprovalRequest` | Change event transitions to `PendingApproval` | Designated Approver |
| `ReviewPackagePublicationHandoff` | Review package published and ready for executive review | Portfolio Executive Reviewer |
| `RiskMaterializationHandoff` | Risk transitions to `MaterializationPending` | PM / Risk Owner |

### 7.3 `@hbc/notification-intelligence` — notification types for Constraints module

All notification thresholds and routing are governed configuration.

| Notification Type | Trigger | Default recipients |
|------------------|---------|-------------------|
| `RiskOverdue` | Risk `targetMitigationDate < today` and status open | Risk `owner`, `bic` team |
| `HighRiskAlert` | New risk created with `riskScore ≥ governed threshold` | PM, Risk `owner` |
| `ConstraintOverdue` | Constraint `dueDate < today` and status open | Constraint `owner`, `bic` team |
| `ConstraintCriticalAlert` | New constraint created with `priority = Critical` | PM, Constraint `owner` |
| `DelayNotificationReminder` | Delay `notificationDate` not yet set and `delayStartDate < today - governed threshold` | PM |
| `DelayQuantifiedAlert` | Delay transitions to `Quantified` with `criticalPathImpact = CRITICAL` | PM, PE |
| `ChangeEventApprovalPending` | Change event in `PendingApproval` for > governed threshold days | Approver, PM |
| `ReviewPackageReadyForReview` | Review package published | Portfolio Executive Reviewer |

### 7.4 `@hbc/my-work-feed` — work item types for Constraints module (`ConstraintsWorkAdapter`)

| Work Item Type | Condition | Actor |
|---------------|-----------|-------|
| `RiskOverdueItem` | Risk `targetMitigationDate < today` and open | Risk owner |
| `RiskHighScoreItem` | New high-risk record above governed threshold | PM |
| `ConstraintOverdueItem` | Constraint `dueDate < today` and open | Constraint owner |
| `ConstraintCriticalPriorityItem` | New Critical-priority constraint | PM |
| `DelayNotificationDueItem` | Delay notification not yet sent; approaching or past threshold | PM |
| `DelayDispositionRequiredItem` | Delay at `Quantified` status; disposition needed | PM, Approver |
| `ChangeEventApprovalItem` | Change event in `PendingApproval` | Designated Approver |
| `ChangeEventClosureItem` | Change event approved; closure action needed | PM |
| `ReviewPackageAnnotationResponseItem` | PER annotation requires PM response or acknowledgement | PM |

### 7.5 Spine event contracts

#### Activity spine events

| Event | Trigger | Payload |
|-------|---------|---------|
| `RiskCreated` | PM creates risk | `{ riskId, riskNumber, projectId, category, riskScore, createdAt, createdBy }` |
| `RiskStatusChanged` | Status transition | `{ riskId, riskNumber, projectId, priorStatus, newStatus, changedAt, changedBy }` |
| `RiskSpawnedConstraint` | Constraint spawned from risk | `{ riskId, riskNumber, projectId, constraintId, constraintNumber, spawnedAt, spawnedBy }` |
| `ConstraintCreated` | PM creates constraint | `{ constraintId, constraintNumber, projectId, category, priority, createdAt, createdBy }` |
| `ConstraintStatusChanged` | Status transition | `{ constraintId, constraintNumber, projectId, priorStatus, newStatus, changedAt, changedBy }` |
| `ConstraintSpawnedDelay` | Delay spawned | `{ constraintId, constraintNumber, projectId, delayId, delayNumber, spawnedAt }` |
| `ConstraintSpawnedChange` | Change event spawned | `{ constraintId, constraintNumber, projectId, changeEventId, changeEventNumber, spawnedAt }` |
| `DelayCreated` | PM creates delay | `{ delayId, delayNumber, projectId, delayEventType, criticalPathImpact, createdAt, createdBy }` |
| `DelayQuantified` | Delay transitions to Quantified | `{ delayId, delayNumber, projectId, estimatedCalendarDays, criticalPathImpact, quantifiedAt, quantifiedBy }` |
| `DelayDispositioned` | Delay dispositioned | `{ delayId, delayNumber, projectId, dispositionOutcome, dispositionedAt, dispositionedBy }` |
| `ChangeEventCreated` | PM creates change event | `{ changeEventId, changeEventNumber, projectId, origin, totalCostImpact, createdAt, createdBy }` |
| `ChangeEventApproved` | Change event approved | `{ changeEventId, changeEventNumber, projectId, totalCostImpact, approvedDate, approvedBy }` |
| `ChangeEventPromotedToIntegrated` | Manual-to-integrated promotion | `{ changeEventId, changeEventNumber, projectId, procoreChangeEventId, promotedAt, promotedBy }` |
| `ReviewPackagePublished` | Review package published | `{ reviewPackageId, packageNumber, projectId, ledgersIncluded, publishedAt, publishedBy }` |

#### Health spine metrics

| Metric | Ledger | Update frequency |
|--------|--------|----------------|
| `openRiskCount` | Risk | On risk create/close |
| `highRiskCount` | Risk | On risk create/score change/close |
| `openConstraintCount` | Constraint | On constraint create/close |
| `overdueConstraintCount` | Constraint | Daily + on constraint edit |
| `criticalConstraintCount` | Constraint | On create/priority change/close |
| `openDelayCount` | Delay | On delay create/close |
| `criticalPathDelayCount` | Delay | On delay create/criticalPathImpact change/close |
| `totalQuantifiedDelayDays` | Delay | On quantification |
| `openChangeEventCount` | Change | On create/close |
| `pendingApprovalCostImpact` | Change | On status change/cost change |
| `totalApprovedCostImpact` | Change | On approval/close |

#### Work Queue items (live state triggers)

| Work Queue Item | Trigger | Priority |
|----------------|---------|----------|
| `RiskOverdue` | Risk overdue | Governed |
| `ConstraintOverdue` | Constraint overdue | Governed |
| `ConstraintCritical` | Critical priority constraint | High |
| `DelayNotificationDue` | Notification reminder triggered | High |
| `DelayDispositionRequired` | Delay quantified; disposition needed | Medium |
| `ChangeEventApprovalPending` | Change event pending approval | Medium |
| `ReviewPackageAnnotationResponse` | PER annotation requires response | Medium |

### 7.6 Downstream contract alignment

#### P3-D2 Project Health Contract

The Constraints module publishes two categories of metrics to the Health spine:

**Operational (live state):** Daily-updated constraint counts, overdue counts, open delay count, critical path delay count. These feed the operational health dashboard for PM/project controls.

**Review-facing (published state):** Metrics derived from the most recent published `ReviewPackage`. These feed executive review surfaces. A staleness indicator is shown if the most recent review package is older than the governed review cadence.

The health card for Constraints must reflect the four-ledger structure: separate status indicators for Risk, Constraint, Delay, and Change are required, not a single merged "Constraints" card.

#### P3-D3 Project Work Queue Contract

The Constraints module registers `ConstraintsWorkAdapter` with 9 work item types (§7.4). Work items derive from **live operational state**, not published state. Work items are surfaced to the PM and relevant BIC owners.

#### P3-F1 Reports Contract

The Constraints module supports the following report types:
- **Risk Register Report** — all open risks with score, owner, mitigation status
- **Constraint Log Report** — all constraints with status, owner, BIC, overdue flag
- **Delay Log Report** — all delays with event type, critical path impact, quantified days, notification status
- **Change Event Log Report** — all change events with status, cost impact, Procore sync state (if integrated)
- **Cross-Ledger Summary Report** — lineage summary: risk-to-constraint materialization rate, constraint-to-delay/change spawn counts
- **Review Package Export** — PDF export of published review packages for distribution

All reports generated by `@hbc/export-runtime`. Review package reports generated from **published state**. Operational reports may use live state.

---

*Navigation: [← T06 Publication, Review, and Governance](P3-E6-T06-Publication-Review-and-Governance.md) | [Master Index](P3-E6-Constraints-Module-Field-Specification.md) | [T08 Implementation and Acceptance →](P3-E6-T08-Implementation-and-Acceptance.md)*
