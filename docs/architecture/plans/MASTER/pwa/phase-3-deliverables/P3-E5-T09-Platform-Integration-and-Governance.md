# P3-E5 — Schedule Module: Platform Integration and Governance

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E5-T09 |
| **Parent** | [P3-E5 Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T09: Platform Integration and Governance |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

## 18. Cross-Platform Workflow, Linked Artifacts, and Shared Package Reuse

Schedule's governed upstream dependency is [P1-F14 Oracle Primavera](../phase-1-deliverables/P1-F14-Oracle-Primavera-Connector-Family.md). Until that Wave 3 connector family is implemented, transitional XER/XML/CSV imports remain acceptable repo-truth seams. The Schedule module consumes published read models or governed repositories only and must not consume raw connector layers directly.

### 18.1 Linked Artifacts via `@hbc/related-items`

The Schedule module integrates `@hbc/related-items` for the linked artifact graph. Schedule objects support typed relationships to other records within the platform. These relationships are part of explanation, readiness, forensics, escalation, and publication context.

**Schedule objects that support linked artifact relationships:**

- ImportedActivitySnapshot
- MilestoneRecord
- FieldWorkPackage
- CommitmentRecord
- BlockerRecord
- ReadinessRecord
- ProgressClaimRecord
- ManagedCommitmentRecord
- PublicationRecord
- RecommendationRecord
- ScenarioBranch

**Required relationship types (minimum):**

| Relationship Type | Schedule Object | Linked To |
|------------------|----------------|-----------|
| `RFI` | Activity, WorkPackage, Blocker | RFI records |
| `Submittal` | Activity, WorkPackage, Blocker | Submittal records |
| `Permit` | Activity, WorkPackage | Permit records |
| `Inspection` | Activity, WorkPackage, Milestone | Inspection records |
| `Drawing` | Activity, WorkPackage, Blocker | Drawing / markup records |
| `Photo` | WorkPackage, ProgressClaim, Blocker | Photo / evidence records |
| `MeetingActionItem` | Blocker, Commitment, Recommendation | Meeting action item records |
| `WorkItem` | Commitment, Blocker, Recommendation | Work items |
| `ChangeEvent` | ManagedCommitment, Milestone, Baseline | Change event records |
| `OwnerDecision` | Milestone, Blocker, Commitment | Owner decision records |
| `HBIRecommendation` | Activity, Milestone, WorkPackage | RecommendationRecords |

**Required enhancement to `@hbc/related-items`:** The `IGovernanceTimelineEvent` placeholder must be extended to support `ScheduleActivity` and `ScheduleWorkPackage` anchor types before field execution integration can proceed. This is a **blocker for Stage 5.1 integration** per P3-D1 Activity Spine contract.

### 18.2 Workflow Handoff via `@hbc/workflow-handoff`

Schedule-generated actions must become cross-platform workflow objects. Use `@hbc/workflow-handoff` for:

| Workflow Event | Handoff Type |
|---------------|-------------|
| Publication submitted for PE review | `PublicationReviewRequest` |
| Commitment magnitude exceeds threshold | `CommitmentApprovalRequest` |
| Scenario promoted to commitment | `ScenarioPromotionRequest` |
| Scenario promoted to baseline | `BaselineApprovalRequest` |
| Canonical source promotion from secondary | `CanonicalSourcePromotionRequest` |

### 18.3 Work Feed Integration via `@hbc/my-work-feed`

Register `ScheduleWorkAdapter` to surface schedule-generated work items. Work item types:

| Work Item Type | Trigger | Assignee |
|---------------|---------|---------|
| `MilestoneAtRisk` | milestone.status = AtRisk | PM |
| `MilestoneDelayed` | milestone.status = Delayed or Critical | PM + PE |
| `CommitmentPendingAcknowledgement` | AcknowledgementRecord.status = Pending (overdue) | Responsible party |
| `BlockerEscalated` | BlockerRecord.status = Escalated | Owner + PM |
| `ReconciliationRequired` | ManagedCommitmentRecord.reconciliationStatus = ConflictRequiresReview | PM |
| `PublicationPendingReview` | PublicationRecord.lifecycleStatus = ReadyForReview | PE |
| `ProgressVerificationRequired` | ProgressClaimRecord.verificationStatus = Pending | Designated verifier |
| `ConfidenceCollapsed` | ConfidenceRecord.overallConfidenceLabel = VeryLow | PM + PE |
| `SyncConflictRequiresReview` | IntentRecord.replayStatus = ConflictRequiresReview | Originating user |
| `ScheduleStalenessWarning` | Days since last active import exceeds governed threshold | PM |

### 18.4 Notification Intelligence via `@hbc/notification-intelligence`

Register schedule notification event types for threshold-triggered alerts. All notification thresholds are Governed.

| Notification Type | Default Trigger | Channel |
|------------------|----------------|---------|
| `MilestoneCriticalAlert` | milestone.status = Critical | Push + email |
| `ScheduleSlippageAlert` | varianceDays > governed threshold | Push |
| `ConfidenceCollapseAlert` | confidenceScore < governed threshold | Push + email (PM + PE) |
| `BlockerCriticalUnresolved` | Blocking blocker open > governed days | Push |
| `CommitmentOverdue` | commitment.committedDate passed; status ≠ Kept | Push |
| `PublicationStalenessAlert` | Days since last Published > governed threshold | Email |

### 18.5 Progressive Disclosure via `@hbc/complexity`

All schedule module surfaces must implement role-based progressive disclosure using `@hbc/complexity`. Analytical depth is tiered:

| Tier | Label | What Is Shown |
|------|-------|--------------|
| `Essential` | Essential | Milestone status, overall schedule health, next milestone, primary variance |
| `Standard` | Standard | Activity list, float indicators, commitment summary, blocker count, confidence label |
| `Expert` | Expert | Full analytics (grading controls, confidence factor breakdown, slippage trends, forensic comparison), scenario comparison, logic layer detail, work-package roll-up detail |

Executive consumers (PER) default to `Essential` tier unless explicitly elevated. Field users default to `Standard` for their scope. PMs and schedulers have `Expert` available. All tier assignments are Governed by the Manager of Operational Excellence.

### 18.6 Executive Review Annotation via `@hbc/field-annotations`

Per P3-E2 §4.4, the Schedule module is review-capable. Executive stakeholders annotate Published publication records via `@hbc/field-annotations`. Annotation rules:

- Annotations are stored exclusively in `@hbc/field-annotations`; never written to Schedule module records.
- No annotation triggers a write, edit, or calculation change in any Schedule module record.
- PM draft state, working commitments, and unpublished scenarios are never visible to PER.
- PER annotates only against `Published` PublicationRecord snapshots.
- Anchor types must support `{ publicationId, externalActivityKey, fieldKey }` for activity-level annotations.
- Anchor types must support `{ publicationId, milestoneId, fieldKey }` for milestone-level annotations.

### 18.7 Session State and Offline Persistence via `@hbc/session-state`

Field-layer records use `@hbc/session-state` for offline draft persistence and the IntentRecord queue. IndexedDB TTL governed per session-state contract. Conflict queue surfaces to PM via `@hbc/my-work-feed` (§18.3).

---


## 20. Governance and Policy Configuration

### 20.1 GovernedPolicySet

The centralized policy record for a project's schedule governance configuration. Managed by Manager of Operational Excellence or authorized Admin.

| Policy Area | Fields / Records Governed |
|-------------|--------------------------|
| Commitment approval thresholds | Variance magnitude requiring PE approval; separate thresholds by commitment type |
| Publication approval rules | Required review roles; auto-publish criteria; publish blocker definitions |
| Milestone status thresholds | AtRisk and Delayed variance day thresholds |
| Overall status thresholds | Variance day thresholds for schedule summary |
| Float / near-critical threshold | Hours below which an activity is near-critical |
| Criticality index bands | Score thresholds for critical / near-critical / standard display |
| Confidence factor weights | Per-factor weights and label thresholds |
| Grading controls | Control thresholds, weights, and inclusion rules |
| Look-ahead window length | Default week span for LookAheadPlan |
| Readiness dimension set | Which dimensions are required per work type |
| Progress basis assignments | Progress basis method per activity code or trade |
| Causation taxonomy | Codes, labels, hierarchy, and applicability rules |
| Location hierarchy template | Default location node hierarchy |
| Calendar rules | Source and operating calendar definitions |
| Notification thresholds | All trigger thresholds for §18.4 |
| Visibility policies | Sensitivity classes, external participant rules |
| Escalation rules | Overdue windows, escalation routing |
| Auto-publish criteria | Conditions under which auto-publish is permitted |
| PPC rolling window | Number of look-ahead windows included in rolling PPC |
| Roll-up rules | Progress weighting, sensitivity thresholds |

---


## 23. Executive Review Annotation Scope

Per P3-E2 §4.4, the Schedule module is review-capable. Executive stakeholders annotate Published publication records via `@hbc/field-annotations`. Full annotation model per §18.6.

**Annotatable surfaces (Published publication layer only):**

- PublishedActivitySnapshot: `publishedFinishDate`, `varianceFromBaselineDays`, `reconciliationStatus`
- MilestoneRecord (published view): `forecastDate`, `varianceDays`, `status`
- PublicationRecord: `reconciliationSummary`, `publishBasisNotes`
- ScheduleSummaryProjection: `overallStatus`, `varianceDays`, `confidenceLabel`
- ConfidenceRecord (when Expert tier enabled for PER): factor scores

**Annotation restrictions:**

- Annotations stored exclusively in `@hbc/field-annotations`; no annotation data written to Schedule module records
- No annotation triggers a write, edit, or calculation change in any Schedule module record
- PM draft, working commitments, unpublished scenarios, and live operating layer state are never visible to PER
- PER annotation cannot change publication lifecycle status

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
