# P3-E5 — Schedule Module: Business Rules Capabilities and Reference

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E5-T10 |
| **Parent** | [P3-E5 Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T10: Business Rules Capabilities and Reference |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

## 21. Business Rules (Complete)

### 21.1 Commitment Approval Threshold

```
approvalRequired = abs(finishVarianceDays) > approvalThreshold
  where approvalThreshold is Governed per commitmentType
  (Reference defaults: ActivityForecast = 5 days; MilestoneCommitment = 3 days; CompletionForecast = 1 day)
```

If `approvalRequired = true`: status = `PendingApproval`; PE notified via `@hbc/workflow-handoff`; forecast date not authoritative until approved.
If `approvalRequired = false`: status = `Approved` automatically; commitment is immediately authoritative.

### 21.2 Duration Conversion

All durations stored in hours. Displayed as working days (÷ hours-per-day from applicable CalendarRule, default 8). API returns hours; UI layer converts.

### 21.3 Auto-Publish Criteria

Auto-publish (`publicationType = AutoPublish`) is permitted only when all of the following Governed conditions are satisfied:
- `lifecycleStatus` would be transitioning from `ReadyForReview` to `Published`
- No `Hard` publish blockers present
- `overallStatus` is `OnTrack` or `AtRisk` (not `Delayed` or `Critical`)
- `confidenceLabel` is `High` or `Moderate`
- No open `ConflictRequiresReview` ManagedCommitmentRecords for milestones in this publication
- Source version is within governed freshness window

### 21.4 Variance Sign Convention

Positive = behind schedule (unfavorable). Negative = ahead (favorable). Zero = on time. Applied consistently to all `varianceDays` fields.

### 21.5 Identity Derivation

`externalActivityKey = {sourceId}::{sourceActivityCode}`. Key must be URL-safe. Namespaced per source to prevent collisions when multiple sources exist on a project.

### 21.6 Staleness Detection

Source freshness is evaluated as: `daysSinceLastActiveImport = today − activeScheduleVersion.activatedAt`. When this exceeds the governed threshold, a `ScheduleStalenessWarning` work item and notification are triggered.

### 21.7 Delete Flag Handling

Activities with `deleteFlag = true` in the source import are ingested to the snapshot but excluded from milestone auto-detection and all UI surfaces. Validation warning logged: "Activity [code] marked for deletion in source; not surfaced."

### 21.8 Manual Milestones

Manual milestones (`isManual = true`) have no `externalActivityKey` link to a source activity. They carry their own `baselineFinishDate` from PM entry. Float, criticality, and source dates are null. Status calculation uses PM-entered baseline and forecast dates. Manual milestones are included in milestone summary and publication.

### 21.9 Offline Precedence

IntentRecords created offline are authoritative for the creating user's session until synced. On sync, server state takes precedence for governed records. Conflicts are surfaced, not silently resolved.

### 21.10 PPC Calculation

```
PPC(window) = count(CommitmentRecords where ppcCounted = true AND status = Kept)
              / count(CommitmentRecords where ppcCounted = true AND window is closed)
              × 100
```

Only closed look-ahead windows are included. Rolling PPC uses the Governed rolling window (default: last 4 closed windows).

---


## 22. Required Capabilities

### 22.1 Schedule File Ingestion (XER / XML / CSV)

- Upload UI for PM or Scheduler per Ownership Maturity Model
- Auto-detect format; support XER (native P6), XML (P6 XML), CSV (P6 CSV)
- On parse: create ScheduleVersionRecord (Processing → Parsed), create ImportedActivitySnapshot per activity, derive externalActivityKeys, update ActivityContinuityLinks, detect milestones, compute FloatPathSnapshot, validate per §1.6
- Activation: PM/Scheduler activates Parsed version → transitions prior Active to Superseded; sets parentVersionId; triggers reconciliation status refresh on all active ManagedCommitmentRecords

### 22.2 Multi-Baseline Management

- "Establish Baseline" action requires PE approval
- PE must supply approvalBasis and causationCode
- System creates BaselineRecord; prior primary baseline marked superseded
- Baseline history viewable; each baseline shows source version and approval context

### 22.3 Commitment Management (Operating Layer)

- PM sets committedStartDate / committedFinishDate per activity
- Required: primaryCausationCode when dates differ from source
- Optional: multi-cause codes and freeform explanation
- System calculates varianceDays, evaluates approvalThreshold, creates workflow handoff if PendingApproval
- Override history preserved via ReconciliationRecord

### 22.4 Publication Workflow

- PM initiates Draft publication; selects source version, baseline reference, types reconciliation summary
- System evaluates publish blockers; PM sees blocker list before submission
- PM submits → status = ReadyForReview; PE receives workflow handoff
- PE reviews: may approve → Published; or reject → back to Draft with reason
- Auto-publish available per §21.3 conditions only

### 22.5 Field Execution Layer

- Work-package creation beneath activities: PM, superintendent, or field foreman
- Location node assignment from governed hierarchy
- Commitment creation and acknowledgement workflow
- Blocker creation with severity, owner, resolution tracking
- Readiness assessment with dimension tracking
- Look-ahead plan creation, publication, and PPC close-out
- Progress claim submission with evidence
- Progress verification and PM acceptance workflow

### 22.6 Scenario Branch Management

- PM creates scenario branch from any ScheduleVersionRecord
- Scenario activity date overrides and alternative logic entries
- Comparison output vs source dates and governing baseline
- Promotion workflow for commitment, publication, or baseline scenarios

### 22.7 Analytics and Intelligence

- ScheduleQualityGrade computed on each version activation
- FloatPathSnapshot computed on each version activation
- MilestoneSlippageTrend updated on each version activation
- ConfidenceRecord computed on each publication cycle and on-demand
- RecommendationRecords generated by rules engine on each analytics computation
- All outputs respect `@hbc/complexity` tier assignments

### 22.8 Offline-First Field Execution

- IntentRecord queue for all field-layer mutations
- Sync state tracking on all field records
- Conflict routing per §15.3
- Session state via `@hbc/session-state`
- Field users can create/update WorkPackage, Commitment, Blocker, Readiness, ProgressClaim, Acknowledgement offline

### 22.9 Export via `@hbc/export-runtime`

- Published forecast export: all PublishedActivitySnapshots for current Published publication
- Milestone list export: all MilestoneRecords with variance and status
- Commitment summary export: all CommitmentRecords with PPC metrics
- Blocker log export: open and resolved blockers
- Export integrates with `@hbc/export-runtime` per Stage 5.2 shared feature contract
- `ISavedViewContext` passed as `IExportRequest.savedViewContext` per SF-24 contract

### 22.10 Linked Artifact Graph

- All schedule objects listed in §18.1 must register with `@hbc/related-items`
- Typed relationship creation from Schedule UI
- Related items surfaced in activity, work-package, blocker, and publication detail views
- Relationship context flows into readiness assessment, forensic export, and publication notes

### 22.11 Health Spine and Canvas Tile

- ScheduleSummaryProjection computed from Published publication
- Published to health spine per P3-D2 integration contract
- Canvas tile displays: status badge, % complete, published completion date, variance, next milestone, confidence label
- SPFx lane: view summary, milestone list, publication status; Upload / full workflow → Launch-to-PWA

### 22.12 Work Feed and Notification Registration

- Register `ScheduleWorkAdapter` with `@hbc/my-work-feed` for all work item types in §18.3
- Register notification event types with `@hbc/notification-intelligence` per §18.4
- All thresholds are Governed; no hard-coded notification trigger values in module code

---


## 27. Status Enumerations (Complete Reference)

### 26.1 ScheduleVersionRecord.status
`Processing` \| `Parsed` \| `Active` \| `Superseded` \| `Failed` \| `Secondary`

### 26.2 Milestone.status (Calculated)
`NotStarted` \| `OnTrack` \| `AtRisk` \| `Delayed` \| `Critical` \| `Achieved` \| `Superseded`

### 26.3 OverallScheduleStatus (Calculated, from Published)
`OnTrack` \| `AtRisk` \| `Delayed` \| `Critical`

### 26.4 ManagedCommitmentRecord.reconciliationStatus
`Aligned` \| `PMOverride` \| `SourceAhead` \| `ConflictRequiresReview` \| `PendingApproval` \| `Approved` \| `Rejected`

### 26.5 PublicationRecord.lifecycleStatus
`Draft` \| `ReadyForReview` \| `Published` \| `Superseded`

### 26.6 ScenarioBranch.status
`Draft` \| `UnderReview` \| `Approved` \| `Rejected` \| `PromotedToCommitment` \| `PromotedToPublication` \| `Archived`

### 26.7 FieldWorkPackage.status
`Planned` \| `Ready` \| `InProgress` \| `Blocked` \| `Complete` \| `Cancelled` \| `PendingVerification`

### 26.8 CommitmentRecord.status
`Requested` \| `Acknowledged` \| `Accepted` \| `Declined` \| `Reassigned` \| `Kept` \| `Missed` \| `PartiallyKept` \| `Cancelled`

### 26.9 BlockerRecord.status
`Open` \| `InProgress` \| `Resolved` \| `Escalated` \| `Closed` \| `Withdrawn`

### 26.10 ReadinessRecord.overallReadiness
`Ready` \| `ConditionallyReady` \| `NotReady` \| `Unknown`

### 26.11 AcknowledgementRecord.status
`Pending` \| `Acknowledged` \| `Accepted` \| `Declined` \| `Reassigned` \| `Overdue` \| `Escalated` \| `Withdrawn`

### 26.12 ProgressClaimRecord.verificationStatus
`Pending` \| `Verified` \| `VerificationFailed` \| `Waived`

### 26.13 IntentRecord.replayStatus (Offline Sync)
`Pending` \| `Queued` \| `Replayed` \| `ConflictRequiresReview` \| `Failed`

### 26.14 FieldWorkPackage.syncStatus (and all field records)
`SavedLocally` \| `QueuedToSync` \| `Synced` \| `ConflictRequiresReview`

### 26.15 RecommendationRecord.disposition
`Pending` \| `Acknowledged` \| `Accepted` \| `Declined` \| `Promoted` \| `Superseded`

### 26.16 ActivityType (from CPM source)
`TT_Task` \| `TT_Mile` \| `TT_LOE` \| `TT_FinMile` \| `TT_WBS`

### 26.17 ProgressBasis
`MilestoneAchieved` \| `DurationPct` \| `PhysicalPct` \| `UnitsInstalled` \| `ResourcePct` \| `QuantityInstalled` \| `Configured`

### 26.18 ConfidenceRecord.overallConfidenceLabel
`High` \| `Moderate` \| `Low` \| `VeryLow`

---


## 28. Field Summary Index

Quick reference: primary record types and their defining section.

| Record / Object | Section | Primary Key | Authority Layer |
|----------------|---------|-------------|----------------|
| CanonicalScheduleSource | 1.1 | sourceId | Master Schedule |
| ScheduleVersionRecord | 1.2 | versionId | Master Schedule |
| BaselineRecord | 1.3 | baselineId | Master Schedule |
| ImportedActivitySnapshot | 1.4 | snapshotId | Master Schedule |
| ActivityContinuityLink | 1.5 | continuityId | Master Schedule |
| ImportedRelationshipRecord | 10.2 | relationshipId | Master Schedule |
| ManagedCommitmentRecord | 2.1 | commitmentId | Operating |
| ReconciliationRecord | 2.2 | reconciliationId | Operating (audit) |
| PublicationRecord | 3.1 | publicationId | Published Forecast |
| PublishedActivitySnapshot | 3.3 | publishedSnapshotId | Published Forecast |
| MilestoneRecord | 4.2 | milestoneId | Derived (Operating + Source) |
| ScenarioBranch | 5.1 | scenarioId | Scenario |
| ScenarioActivityRecord | 5.2 | scenarioActivityId | Scenario |
| ScenarioLogicRecord | 5.3 | scenarioLogicId | Scenario |
| FieldWorkPackage | 6.1 | workPackageId | Field Execution |
| LocationNode | 6.2 | locationId | Field Execution |
| CommitmentRecord | 6.3 | commitmentId | Field Execution |
| BlockerRecord | 6.4 | blockerId | Field Execution |
| ReadinessRecord | 6.5 | readinessId | Field Execution |
| LookAheadPlan | 6.6 | lookAheadId | Field Execution |
| AcknowledgementRecord | 7.1 | ackId | Cross-layer |
| ProgressClaimRecord | 8.1 | claimId | Field Execution |
| ProgressVerificationRecord | 8.2 | verificationId | Field Execution |
| WorkPackageLinkRecord | 10.3 | linkId | Field Execution |
| ScheduleQualityGrade | 11.1 | gradeId | Analytics |
| FloatPathSnapshot | 11.2 | floatSnapshotId | Analytics |
| MilestoneSlippageTrend | 11.3 | trendId | Analytics |
| ConfidenceRecord | 11.4 | confidenceId | Analytics |
| RecommendationRecord | 12.1 | recommendationId | Analytics / Intelligence |
| CausationCode | 13.1 | codeId | Governance |
| IntentRecord | 15.1 | intentId | Offline / Sync |
| CalendarRule | 17.2 | calendarRuleId | Governance |
| ExternalParticipantRecord | 16.2 | participantId | Governance |
| ScheduleSummaryProjection | 19.1 | summaryId | Published / Health Spine |


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
