# P3-E14-T09 — Reports, Health Signals, Work Queue Publication, and Telemetry

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E14-T09 |
| **Parent** | [P3-E14 Project Warranty Module](P3-E14-Project-Warranty-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T09 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Governing Principle: Warranty Is the Operational Record; Downstream Is Read-Only

The correct publication model for the Warranty module is:

```
Warranty module                 Publication event               Downstream consumer
(operational records)  →  (Activity / Health / Work Queue)  →  (Reports / Canvas / Health Pulse)
                                                                        ↓
                                                              Read-only derived surface
```

**Three data classes — three different roles:**

| Class | Data | Write path | Read path |
|---|---|---|---|
| Warranty operational records | `WarrantyCase`, `WarrantyCoverageItem`, `SubcontractorAcknowledgment`, etc. | `@hbc/features-project-hub` warranty APIs | Direct read within project context; role-gated per T02 §5 |
| Published health and activity signals | Health Spine metrics, Activity events | Warranty module spine adapters only | Health Pulse / Activity Timeline consumers — read-only |
| Reporting aggregations | Report snapshots, export artifacts | Reports module only; populated from Warranty publication events | Report consumer read API |

**Governing rule:** Reports, Health Pulse, Work Queue, and Related Items surfaces may never write to Warranty module records. They are downstream consumers of signals that Warranty emits. Any surface that displays Warranty-derived data is strictly read-only against the Warranty domain.

---

## 2. Shared Package Consumption Contracts

The Warranty module must consume the following shared packages for all publication and telemetry concerns. Local substitutes for any of these contracts are not permitted.

| Shared package | Role in Warranty module | Gate |
|---|---|---|
| `@hbc/activity-timeline` (SF28) | Activity Spine event emission for all case lifecycle events | Stage 3 |
| `@hbc/saved-views` (SF26) | Saved-view support for Coverage Registry and Case Workspace | Stage 3 |
| `@hbc/record-form` (SF23) | Create/edit/duplicate lifecycle for coverage items and cases | Stage 3 |
| `@hbc/publish-workflow` (SF25) | Publication lifecycle for resolution records requiring org-level publication | Stage 3 |
| `@hbc/bulk-actions` (SF27) | Bulk case operations (bulk assign, bulk close, bulk evidence upload) | Stage 4 |
| `@hbc/my-work-feed` | Work Queue item creation API; all Work Queue rules in §4 | Stage 3 |
| `@hbc/notification-intelligence` | Escalation routing for SLA and acknowledgment thresholds | Stage 3 |
| `@hbc/related-items` (P3-D4) | Related Items publications for cross-module linkage | Stage 4 |

---

## 3. Activity Spine Publication

### 3.1 Governing contract

Activity Spine publication is governed by P3-D1. The Warranty module must implement a module-scoped Activity Spine adapter within `@hbc/features-project-hub`. The adapter is the exclusive writer of Warranty activity events — no other path may write to the Activity Spine on behalf of this module.

### 3.2 Activity event catalog

| Event key | Trigger | Actor | Key payload fields |
|---|---|---|---|
| `warranty.coverage.registered` | `WarrantyCoverageItem` created and activated | PM / WARRANTY_MANAGER | `coverageItemId`, `coverageType`, `responsiblePartyId`, `warrantyStartDate`, `warrantyEndDate` |
| `warranty.coverage.voided` | Coverage item voided | PM / WARRANTY_MANAGER | `coverageItemId`, `voidedReason` |
| `warranty.coverage.expired` | Daily sweep transitions item to `Expired` | System | `coverageItemId`, `expiredAt`, `openCaseCount` |
| `warranty.intake.logged` | `OwnerIntakeLog` created | PM / WARRANTY_MANAGER | `intakeId`, `caseId`, `reportChannel`, `sourceChannel` |
| `warranty.case.opened` | `WarrantyCase` created | PM / WARRANTY_MANAGER | `caseId`, `caseNumber`, `coverageItemId`, `slaTier` |
| `warranty.case.coverage-decision-made` | `WarrantyCoverageDecision` created | PM / WARRANTY_MANAGER | `caseId`, `decisionOutcome`, `decisionRationale` |
| `warranty.case.assigned` | Case transitions to `Assigned`; `WarrantyCaseAssignment` created | PM / WARRANTY_MANAGER | `caseId`, `assignmentId`, `subcontractorId`, `assignedByUserId` |
| `warranty.case.reassigned` | Prior assignment superseded; new assignment created | PM / WARRANTY_MANAGER | `caseId`, `priorAssignmentId`, `newAssignmentId`, `subcontractorId` |
| `warranty.acknowledgment.recorded` | `SubcontractorAcknowledgment` status updated from `Pending` | PM / WARRANTY_MANAGER | `caseId`, `acknowledgmentId`, `newStatus`, `enteredBy` |
| `warranty.acknowledgment.disputed` | Acknowledgment transitions to `ScopeDisputed` | PM / WARRANTY_MANAGER | `caseId`, `acknowledgmentId`, `disputeRationale` |
| `warranty.acknowledgment.dispute-resolved` | Acknowledgment transitions to `DisputeResolved` | PX / PM | `caseId`, `acknowledgmentId`, `disputeOutcome` |
| `warranty.case.awaiting-owner` | Case transitions to `AwaitingOwner` | PM / WARRANTY_MANAGER | `caseId`, `awaitingReason`, `slaPausedAt` |
| `warranty.case.awaiting-owner-resolved` | Case exits `AwaitingOwner`; SLA clock resumes | PM / WARRANTY_MANAGER | `caseId`, `slaResumedAt`, `businessDaysElapsedWhilePaused` |
| `warranty.case.visit-scheduled` | `WarrantyVisit` created in `Scheduled` state | PM / WARRANTY_MANAGER | `caseId`, `visitId`, `visitType`, `scheduledDate` |
| `warranty.case.visit-completed` | Visit transitions to `Completed` | PM / WARRANTY_MANAGER | `caseId`, `visitId`, `visitType`, `completedAt` |
| `warranty.case.corrected` | Case transitions to `Corrected` | PM / WARRANTY_MANAGER | `caseId`, `correctedByUserId`, `completionDeclarationAt` |
| `warranty.case.verification-failed` | `PendingVerification` → `InProgress` (failed gate) | PM / WARRANTY_MANAGER | `caseId`, `verificationFailureReason` |
| `warranty.case.verified` | Case transitions to `Verified` | PM / WARRANTY_MANAGER | `caseId`, `verifiedByUserId`, `verifiedAt` |
| `warranty.case.resolved` | `WarrantyCaseResolutionRecord` created | PM / WARRANTY_MANAGER | `caseId`, `resolutionRecordId`, `resolutionType`, `isBackChargeAdvisory` |
| `warranty.case.closed` | Case transitions to `Closed` | PM / WARRANTY_MANAGER | `caseId`, `closedAt`, `daysOpenTotal`, `slaCompliant` |
| `warranty.case.reopened` | Case transitions to `Reopened` | PX | `caseId`, `reopenedByUserId`, `reopenReason` |
| `warranty.case.voided` | Case voided | PM / PX | `caseId`, `voidedByUserId`, `voidedReason` |
| `warranty.backcharge.advisory-published` | Back-charge advisory published to Financial | PM / WARRANTY_MANAGER | `caseId`, `resolutionRecordId`, `subcontractorId`, `advisoryNotes` |

### 3.3 Activity event boundary

Activity events are emitted by the Warranty module adapter after each successful write. They are fire-and-observe — they do not block the write operation. Failure to emit must be logged and retried; it must not roll back the underlying Warranty record mutation.

---

## 4. Health Spine Metrics

### 4.1 Governing contract

Health Spine publication is governed by P3-D2. The Warranty module must implement a module-scoped Health Spine adapter that computes and publishes all metrics below on each trigger event. Raw record counts are never exposed to the Health Pulse consumer — only computed signal values.

### 4.2 Leading indicators (predict future risk)

Leading indicators surface before a problem occurs. The PM should act on them before they become lagging signals.

| Metric key | Definition | Signal threshold | Health signal color |
|---|---|---|---|
| `warranty.coverage.expiringSoon30d` | Count of `Active` coverage items with `warrantyEndDate ≤ today + 30d` | ≥1 with open cases: Warning; ≥1 without open cases: Advisory | Yellow / Blue |
| `warranty.coverage.expiringSoon7d` | Count of `Active` coverage items with `warrantyEndDate ≤ today + 7d` | Any value: Elevated warning | Orange |
| `warranty.case.acknowledgmentPendingRate` | % of `Assigned` cases where acknowledgment status is still `Pending` beyond 5 BD | >25%: Warning; >50%: Critical | Yellow / Red |
| `warranty.case.ownerUpdateOverdue` | Count of owner-originated cases with no `WarrantyCommunicationEvent` logged within update cadence threshold (T05 §4.4) | ≥1: Advisory; ≥3: Warning | Blue / Yellow |
| `warranty.case.slaWarningCount` | Count of open cases where SLA is within the warning window (repair SLA ≤ 5 BD remaining for Standard, ≤ 2 BD for Expedited) | ≥1: Warning | Yellow |
| `warranty.case.disputeOpenCount` | Count of cases with `acknowledgmentStatus = ScopeDisputed` | ≥1: Advisory; >3: Warning | Blue / Yellow |

### 4.3 Lagging indicators (confirm past performance)

Lagging indicators measure outcomes after events have occurred. They inform retrospectives and subcontractor performance reviews.

| Metric key | Definition | Reporting period | Notes |
|---|---|---|---|
| `warranty.case.slaComplianceRate` | % of `Closed` cases where the repair SLA deadline was not breached | Rolling 90d / project lifecycle | Numerator: closed cases where `closedAt ≤ slaRepairDeadline`; denominator: all closed cases |
| `warranty.case.avgDaysToClose` | Mean number of calendar days from `case.opened` to `case.closed` across closed cases | Rolling 90d | Excludes `Voided` and `Duplicate` terminal states |
| `warranty.case.reopenRate` | % of closed cases that were subsequently reopened | Project lifecycle | High reopen rate signals verification quality issue |
| `warranty.case.verificationFailureRate` | % of `PendingVerification` entries that returned to `InProgress` (failed the verification gate) | Project lifecycle | High rate signals subcontractor completion quality issue |
| `warranty.case.backChargeAdvisoryRate` | % of closed cases that flagged a back-charge advisory | Project lifecycle | Advisory metric; not a health signal |

### 4.4 Recurring failure signals

Recurring failure patterns are elevated to Health signals when detected. These are not simple counts — they require pattern detection across the case history.

| Signal key | Detection rule | Health impact |
|---|---|---|
| `warranty.signal.coverageExpiredWithOpenCases` | Any coverage item has transitioned to `Expired` while ≥1 case against it remains open | Critical — elevated to PX Work Queue item (WQ-WAR-14) |
| `warranty.signal.subcontractorRepeatFailure` | Same `subcontractorId` has ≥2 verification failures across any cases in the project | Warning — surfaced in Sub Burden report (§6.3) |
| `warranty.signal.slaBreachAcceleration` | ≥3 SLA breaches within a rolling 30-day window | Warning — signals systemic SLA management issue |
| `warranty.signal.ownerEscalationRisk` | Case originated from owner intake, status is `AwaitingSubcontractor` or `InProgress`, and ≥14 days have elapsed with no owner communication event logged | Warning — owner experience risk (§6.4) |
| `warranty.signal.disputeCluster` | ≥3 cases with `acknowledgmentStatus = ScopeDisputed` open simultaneously | Warning — signals systemic scope assignment problem |

### 4.5 Health signal sanitization for PER

PER receives a sanitized health band on the canvas tile and Project Health Pulse — not raw case counts or individual case content. The sanitized band is:

| Band | Condition |
|---|---|
| Green | No Warning, Critical, or Elevated signals active |
| Yellow | ≥1 Warning signal active; no Critical signals |
| Orange | ≥1 Elevated signal active (e.g., expiring coverage with open cases) |
| Red | ≥1 Critical signal active (e.g., SLA breach acceleration, coverage expired with open cases) |

Full case content, case counts, and subcontractor identity are visible to PER in the Case Workspace (read-only). The health band is not a substitute for case-level review.

---

## 5. Work Queue Publication

### 5.1 Governing contract

Work Queue publication is governed by P3-D3. The Warranty module must implement Work Queue emission via `@hbc/my-work-feed`. No local ad-hoc routing, timer polling, or process-based reminder implementation is permitted.

### 5.2 Work Queue rule catalog

| Rule ID | Trigger condition | Recipient | Priority | Dismissible |
|---|---|---|---|---|
| WQ-WAR-01 | Case transitions to `Assigned`; acknowledgment `Pending` | PM | Normal | No |
| WQ-WAR-02 | Acknowledgment `Pending` for Standard tier: 5 BD elapsed without response | PM | Warning | Yes |
| WQ-WAR-03 | Acknowledgment `Pending` for Expedited tier: 2 BD elapsed without response | PM | Warning | Yes |
| WQ-WAR-04 | Acknowledgment `Pending` for Standard tier: 10 BD elapsed (escalation threshold) | PX | Elevated | No |
| WQ-WAR-05 | Acknowledgment `Pending` for Expedited tier: 4 BD elapsed (escalation threshold) | PX | Elevated | No |
| WQ-WAR-06 | Case SLA entering warning window: Standard repair ≤ 5 BD remaining | PM | Warning | Yes |
| WQ-WAR-07 | Case SLA entering warning window: Expedited repair ≤ 2 BD remaining | PM | Warning | Yes |
| WQ-WAR-08 | Case SLA breached: repair deadline exceeded | PM | Critical | No |
| WQ-WAR-09 | Case SLA breached for Standard tier: ≥ 10 BD past deadline | PX | Elevated | No |
| WQ-WAR-10 | Scope dispute lodged (`ScopeDisputed` entered) | PM | Warning | No |
| WQ-WAR-11 | Scope dispute unresolved: Standard ≥ 10 BD; Expedited ≥ 4 BD | PX | Elevated | No |
| WQ-WAR-12 | Coverage item entering 30-day expiration window with ≥1 open case | PM | Warning | Yes |
| WQ-WAR-13 | Coverage item entering 7-day expiration window (any state) | PM | Elevated | No |
| WQ-WAR-14 | Coverage item expired while open cases remain | PX | Critical | No |
| WQ-WAR-15 | Back-charge advisory published to Financial | PM | Advisory | Yes |
| WQ-WAR-16 | Case in `Corrected` state for ≥3 BD without verification scheduled | PM | Warning | Yes |
| WQ-WAR-17 | Verification failed (`PendingVerification` → `InProgress`) | PM | Warning | No |
| WQ-WAR-18 | Owner-originated case: no communication logged within update cadence threshold (T05 §4.4) | PM | Advisory | Yes |
| WQ-WAR-19 | Owner experience risk signal active (`warranty.signal.ownerEscalationRisk`) | PM | Warning | Yes |
| WQ-WAR-20 | Case `AwaitingOwner` for ≥7 BD (Standard) or ≥3 BD (Expedited) with no follow-up logged | PM | Advisory | Yes |

### 5.3 Work Queue item content requirements

Each Work Queue item must carry:
- Module identifier: `warranty`
- Case ID (FK) or coverage item ID (FK) — for deep-link routing to the correct surface
- Human-readable action label (from T07 §5.3 Next Move action catalog)
- Due date (if SLA-linked)
- Priority tier (matches rule table above)

Work Queue items must link directly to the Warranty Case Workspace case detail or Coverage Registry item — not to the module list. A PM clicking a Work Queue item must land on the specific case that triggered it.

---

## 6. Reports Module Integration

### 6.1 Reports publication model

The Warranty module publishes report-candidate signals to the Reports module (P3-F1). The Reports module assembles snapshots into release artifacts. Warranty does not own report records — it provides the data surface. Reports module may not write back to any Warranty record.

### 6.2 Report-candidate designations and classifications

| Report | Classification | Refresh | Key data |
|---|---|---|---|
| Warranty Posture Summary | Lagging indicator snapshot | Per period / on demand | Open, Assigned, Closed, Voided case counts; SLA compliance rate; avg days to close |
| SLA Compliance Report | Lagging indicator | Per period | SLA compliance rate by tier; cases breached vs. compliant; avg days over SLA for breached cases |
| Coverage Expiration Status | Leading indicator | Daily | Active coverage items; days to expiration; open case count per item |
| Owner Experience Risk Report | Leading indicator | Weekly / on demand | Owner-originated cases; communication cadence compliance; escalation risk signals |
| Subcontractor Warranty Burden Report | Leading + lagging | Per period / on demand | Cases by subcontractor; acknowledgment compliance; scope dispute rate; verification failure rate; back-charge advisory count |
| Denial and Not-Covered Trend Report | Lagging indicator | Per period | Count of `NotCovered` and `Denied` case decisions; coverage layer distribution; common denial reasons |
| Back-Charge Advisory Log | Lagging indicator | On demand / per period | Cases with `isBackChargeAdvisory = true`; linked subcontractor; PM advisory notes |
| Verification Quality Report | Lagging indicator | Per period | Verification failure rate; reopen rate; avg cycles to closure |

### 6.3 Subcontractor warranty burden indicators

The Subcontractor Warranty Burden Report surfaces performance signals that are not visible in individual case views:

| Indicator | Computation | What it signals |
|---|---|---|
| Total case volume | Count of cases assigned to this subcontractor | Absolute workload |
| Acknowledgment compliance rate | % of assigned cases where acknowledgment was recorded within tier-specific SLA | Responsiveness posture |
| Scope dispute rate | % of assigned cases where sub disputed scope | Coverage assignment quality |
| Verification failure rate | % of sub-assigned cases that failed the verification gate ≥1 time | Repair quality |
| Avg days to corrected | Mean days from `Assigned` to `Corrected` for this subcontractor | Execution speed |
| Back-charge advisory rate | % of sub-assigned cases that triggered a back-charge advisory | Financial risk posture |
| Repeat failure rate | Count of cases where sub had ≥2 verification failures | Quality outlier signal |

These indicators are advisory — they inform the PM and PX. They do not automatically penalize a subcontractor or change case records.

### 6.4 Owner experience risk indicators

The Owner Experience Risk Report surfaces signals that a PM conversation with the owner may be overdue or at risk:

| Indicator | Computation | What it signals |
|---|---|---|
| Communication cadence compliance rate | % of owner-originated open cases where last communication log is within update cadence threshold | PM-owner communication hygiene |
| Owner experience risk signal count | Count of cases with `warranty.signal.ownerEscalationRisk` active | Imminent owner dissatisfaction risk |
| Cases in `AwaitingOwner` with no follow-up | Cases in `AwaitingOwner` state where no PM communication event has been logged in ≥5 BD | Stalled owner coordination |
| Denial communication compliance | % of `NotCovered` or `Denied` cases where a denial communication event has been logged within 3 BD of decision | Duty-of-care communication |

These indicators are visible to PM and PX. PER sees a sanitized band (§4.5), not individual communication records.

### 6.5 Denial and not-covered trend reporting

Denial trends are operationally important: a pattern of denied or not-covered claims may indicate a coverage registration gap, a sub-assignment routing error, or an owner expectation misalignment.

| Dimension | Tracked fields |
|---|---|
| Claim outcome distribution | Count and % of cases by `coverageDecisionOutcome`: `Covered`, `NotCovered`, `Denied`, `Duplicate` |
| Coverage layer of denied claims | Which coverage layer (`Product`, `Labor`, `System`) has the highest not-covered rate |
| Common denial rationale patterns | Freetext frequency analysis of `decisionRationale` (advisory; not a governed enum) |
| Denial rate trend over time | % of cases decided as `NotCovered` or `Denied` per rolling 30-day window |

### 6.6 Aging and SLA metric definitions

Aging metrics are derived from the SLA model in T04. Report consumers must not recompute these independently — they must consume the values published by the Warranty Health Spine adapter.

| Aging metric | Computation basis |
|---|---|
| Days open | `today − caseCreatedAt` (calendar days) |
| Days to SLA deadline | `slaRepairDeadline − today` (business days) |
| Days overdue | `today − slaRepairDeadline` (business days, only when past deadline) |
| Age bucket | Open 0–7d / 8–30d / 31–90d / >90d (calendar days) |
| SLA compliance at close | `closedAt ≤ slaRepairDeadline` → compliant; otherwise non-compliant |

---

## 7. Telemetry Event Catalog

### 7.1 Governing principle

Telemetry in the Warranty module serves two purposes: (1) measuring whether the mold-breaker experience is actually better than prior email-and-spreadsheet practice, and (2) detecting friction in the PM workflow that should be removed. Telemetry events must be instrumented at client-side interaction points — not derived from backend writes.

### 7.2 Surface engagement telemetry

| Event key | Trigger | Key properties |
|---|---|---|
| `warranty_coverage_registry_viewed` | PM opens Coverage Registry surface | `projectId`, `activeView`, `caseCount`, `complexityDial` |
| `warranty_case_workspace_viewed` | PM opens Warranty Case Workspace | `projectId`, `caseId`, `caseStatus`, `slaTier`, `complexityDial` |
| `warranty_canvas_tile_viewed` | Canvas tile rendered | `projectId`, `openCaseCount`, `overdueCaseCount`, `role` |
| `warranty_launch_to_pwa_escalation` | PM clicks Launch-to-PWA from SPFx | `projectId`, `action`, `sourceContext` |

### 7.3 Case management workflow telemetry

| Event key | Trigger | Key properties |
|---|---|---|
| `warranty_case_created` | User submits new case creation form | `projectId`, `caseId`, `slaTier`, `coverageLayer`, `hasIntakeLog`, `entryPath` |
| `warranty_case_assigned` | User creates subcontractor assignment | `projectId`, `caseId`, `subcontractorId`, `timeFromOpenToAssigned_bd` |
| `warranty_acknowledgment_recorded` | User records sub response | `projectId`, `caseId`, `newAcknowledgmentStatus`, `timeFromAssignedToAcknowledged_bd` |
| `warranty_scope_dispute_opened` | User records scope dispute | `projectId`, `caseId` |
| `warranty_scope_dispute_resolved` | User records dispute resolution | `projectId`, `caseId`, `disputeOutcome`, `timeToResolve_bd` |
| `warranty_case_corrected` | User enters completion declaration | `projectId`, `caseId`, `timeFromAssignedToCorrected_bd`, `evidenceCount` |
| `warranty_verification_failed` | User records verification failure | `projectId`, `caseId`, `failureCycle` |
| `warranty_case_closed` | User creates resolution record and closes case | `projectId`, `caseId`, `resolutionType`, `daysOpen`, `slaCompliant`, `isBackChargeAdvisory` |
| `warranty_case_reopened` | PX reopens a closed case | `projectId`, `caseId`, `timeSinceClosure_days` |
| `warranty_case_voided` | User voids a case | `projectId`, `caseId`, `voidedReason` |

### 7.4 Coverage registry telemetry

| Event key | Trigger | Key properties |
|---|---|---|
| `warranty_coverage_registered` | User creates coverage item | `projectId`, `coverageItemId`, `coverageType`, `entryMethod` (`manual` / `fromTurnover` / `fromCommissioning`) |
| `warranty_coverage_expiration_viewed` | User views expiring coverage advisory on a coverage item | `projectId`, `coverageItemId`, `daysToExpiration`, `openCaseCount` |
| `warranty_turnover_linkage_followed` | User navigates from coverage item to linked Closeout turnover package | `projectId`, `coverageItemId`, `turnoverRefId` |
| `warranty_commissioning_linkage_followed` | User navigates from coverage item to linked Startup commissioning record | `projectId`, `coverageItemId`, `commissioningRefId` |

### 7.5 Communications and intake telemetry

| Event key | Trigger | Key properties |
|---|---|---|
| `warranty_intake_logged` | PM creates `OwnerIntakeLog` entry | `projectId`, `caseId`, `reportChannel` |
| `warranty_communication_event_logged` | PM logs a communication event on the communications timeline | `projectId`, `caseId`, `communicationDirection`, `channel` |
| `warranty_owner_status_summary_viewed` | PM opens the Owner Status Summary block on case overview | `projectId`, `caseId`, `caseStatus` |

### 7.6 Mold-breaker UX quality telemetry

These events specifically measure whether the mold-breaking design (T07 §1) is delivering better PM outcomes than prior practice. They must be reviewed periodically by the product team.

| Event key | What it measures |
|---|---|
| `warranty_next_move_action_taken` | PM clicks the primary action from the Next Move card (vs. navigating to the action independently). High rate = Next Move is guiding work correctly |
| `warranty_next_move_dismissed` | PM dismisses a Next Move nudge without acting. High rate = wrong action suggestion or low-trust |
| `warranty_complexity_dial_changed` | PM changes the complexity dial. Frequent changes = wrong default; no changes = dial is irrelevant |
| `warranty_permission_explainer_viewed` | PM clicks "Why is this disabled?" affordance. High rate on the same control = the control should probably be removed for that role |
| `warranty_hbi_suggestion_accepted` | PM accepts an HBI assistive suggestion | High acceptance = HBI is calibrated correctly |
| `warranty_hbi_suggestion_dismissed` | PM dismisses an HBI assistive suggestion | High dismiss rate = HBI is surfacing low-quality suggestions |
| `warranty_saved_view_system_view_used` | PM uses a system-defined saved view (vs. creating their own). High rate = system views are well-targeted |
| `warranty_related_items_turnover_followed` | PM navigates to linked turnover from case workspace. Measures cross-module context value |
| `warranty_spfx_to_pwa_roundtrip_completed` | PM returns to SPFx after a PWA action (via `returnTo` deep-link). Measures handoff quality |

### 7.7 Telemetry instrumentation rules

- All telemetry is client-side only — no server-side duplication.
- Telemetry events must not carry PII beyond `projectId`, `caseId`, `coverageItemId` (all internal IDs).
- `subcontractorId` and `userId` must not be included in telemetry event payloads.
- Telemetry events are non-blocking — they must not delay UI interactions.
- HBI telemetry events (`warranty_hbi_*`) are tagged with `ai_assisted: true` for filtering in analytics.

---

## 8. Publication Boundary Enforcement

### 8.1 What downstream consumers must not do

The following are prohibited for all downstream consumers of Warranty publications:

- Write to any `WarrantyCase`, `WarrantyCoverageItem`, `SubcontractorAcknowledgment`, `OwnerIntakeLog`, `WarrantyCaseResolutionRecord`, or any other Warranty record
- Derive their own SLA computation independently of the Warranty Health Spine adapter
- Treat Activity events as source-of-truth for case state (they are audit signals; canonical state lives in the record)
- Cache Health Spine metric values and display them without re-read (stale metric surfaces must refresh from the adapter on load)

### 8.2 Reports module boundary

The Reports module is a read-only consumer of Warranty Health Spine signals and Warranty Activity events. It may never query Warranty records directly. All report content must be assembled from published event streams.

### 8.3 Work Queue boundary

Work Queue items are links and nudges — they carry a FK to the case or coverage item and a deep-link action path. They do not carry case content. When a Work Queue item is resolved (PM acts on it), the case record is updated through the Warranty module API — not through the Work Queue API.

---

*← [T08](P3-E14-T08-Lane-Ownership-PWA-SPFx-Acceptance-and-External-Collaboration-Deferrals.md) | [Master Index](P3-E14-Project-Warranty-Module-Field-Specification.md) | [T10 →](P3-E14-T10-Implementation-Guide-and-Acceptance-Criteria.md)*
