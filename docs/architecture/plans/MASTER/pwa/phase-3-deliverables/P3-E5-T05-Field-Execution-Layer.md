# P3-E5 — Schedule Module: Field Execution Layer

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E5-T05 |
| **Parent** | [P3-E5 Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T05: Field Execution Layer |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

## 6. Field Execution Layer

The field execution layer provides full commitment-based planning, execution tracking, blocker and readiness management, look-ahead scheduling, and PPC-style metrics. It is not a read-only surface or a thin note pad. All records in this layer can be created and edited offline (see §15).

### 6.1 FieldWorkPackage

A FieldWorkPackage is a child decomposition of an ImportedActivitySnapshot. Imported activities remain canonical; HB Intel may create one or more work packages beneath an activity to represent execution scope by location, trade/crew, time window, or quantity scope.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| workPackageId | `string` | Yes | UUID |
| projectId | `string` | Yes | FK to project |
| parentExternalActivityKey | `string` | Yes | FK to ImportedActivitySnapshot via externalActivityKey |
| workPackageName | `string` | Yes | Display name (e.g., "Framing — Level 3 East, Crew A") |
| workPackageScope | `string` | Yes | Narrative scope description |
| tradeCode | `string` | No | Assigned trade (FK to governed trade classification) |
| crewId | `string` | No | Assigned crew identifier |
| locationId | `string` | No | FK to LocationNode (§6.2) |
| plannedStartDate | `date` | Yes | Planned start within parent activity window |
| plannedFinishDate | `date` | Yes | Planned finish within parent activity window |
| committedStartDate | `date` | No | Field-confirmed start commitment |
| committedFinishDate | `date` | No | Field-confirmed finish commitment |
| actualStartDate | `date` | No | Recorded actual start |
| actualFinishDate | `date` | No | Recorded actual finish |
| progressBasis | `enum` | Yes | `MilestoneAchieved` \| `DurationPct` \| `PhysicalPct` \| `UnitsInstalled` \| `ResourcePct` \| `QuantityInstalled` \| `Configured`; Governed per trade/work-type |
| reportedProgressPct | `number` | No | Field-reported percent complete (0-100) |
| verifiedProgressPct | `number` | No | Verified percent complete (post-verification; see §8) |
| authoritativeProgressPct | `number` | No | Authoritative percent complete (post-PM/PE acceptance) |
| quantityPlanned | `number` | No | Planned quantity (units governed per work type) |
| quantityInstalled | `number` | No | Reported installed quantity |
| quantityVerified | `number` | No | Verified installed quantity |
| quantityUnit | `string` | No | Unit of measure (e.g., "LF", "SF", "EA") |
| calendarOverrideId | `string` | No | If field operating calendar differs from source calendar (see §6.4) |
| readinessStatus | `enum` | No | From current ReadinessRecord (derived) |
| status | `enum` | Yes | `Planned` \| `Ready` \| `InProgress` \| `Blocked` \| `Complete` \| `Cancelled` \| `PendingVerification` |
| ppcIncluded | `boolean` | Yes | true = included in PPC calculation for the look-ahead window |
| createdBy | `string` | Yes | userId |
| createdAt | `datetime` | Yes | Immutable |
| lastModifiedBy | `string` | No | userId |
| lastModifiedAt | `datetime` | No | Timestamp |
| syncStatus | `enum` | Yes | See §15; `SavedLocally` \| `QueuedToSync` \| `Synced` \| `ConflictRequiresReview` |

**Business rules:**
- A work package must fall within the date window of its parent activity's `targetStartDate`/`targetFinishDate`. Violations generate a governed warning.
- The sum of work package planned quantities must not exceed the parent activity's total planned quantity when quantity tracking is enabled. Governed tolerance is configurable.
- `authoritativeProgressPct` requires either: verification by a designated verifier, or PM/PE acceptance. See §8.

### 6.2 LocationNode (Governed Hierarchical Location Model)

The location model uses a governed hierarchy with enterprise templates and project-level tailoring. The Manager of Operational Excellence maintains enterprise location templates; PMs may add project-specific nodes within governed depth limits.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| locationId | `string` | Yes | UUID |
| projectId | `string` | Yes | FK to project |
| parentLocationId | `string` | No | FK to parent LocationNode; null = root level |
| locationName | `string` | Yes | Display name (e.g., "Tower B", "Level 3", "Zone East") |
| locationCode | `string` | Yes | Short code for filtering and classification |
| hierarchyLevel | `enum` | Yes | `Campus` \| `Building` \| `Level` \| `Zone` \| `Room` \| `Workface` \| `Custom`; Governed |
| depth | `integer` | Yes | Depth in tree (root = 1) |
| sortOrder | `integer` | Yes | Display ordering |
| isTemplate | `boolean` | Yes | true = enterprise template node; cannot be deleted at project level |
| createdBy | `string` | Yes | userId |
| createdAt | `datetime` | Yes | Immutable |

### 6.3 CommitmentRecord (Field Commitment)

A CommitmentRecord is a specific, time-bounded promise by a responsible party to complete a work package or activity by a stated date. Commitments are the unit of PPC tracking.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| commitmentId | `string` | Yes | UUID |
| projectId | `string` | Yes | FK to project |
| workPackageId | `string` | No | FK to FieldWorkPackage; null if activity-level |
| externalActivityKey | `string` | No | FK to activity if work-package not used |
| commitmentType | `enum` | Yes | `Completion` \| `MilestoneAchievement` \| `ReadinessGate` \| `Quantity` |
| responsibleUserId | `string` | Yes | userId of committing party |
| responsibleRole | `string` | Yes | Role description (e.g., "Foreman — Concrete") |
| committedDate | `date` | Yes | Promised completion date |
| committedQuantity | `number` | No | Promised quantity (if quantity commitment) |
| windowStart | `date` | Yes | Start of look-ahead window this commitment belongs to |
| windowEnd | `date` | Yes | End of look-ahead window |
| status | `enum` | Yes | `Requested` \| `Acknowledged` \| `Accepted` \| `Declined` \| `Reassigned` \| `Kept` \| `Missed` \| `PartiallyKept` \| `Cancelled` |
| acknowledgedAt | `datetime` | No | When responsible party acknowledged |
| keptAt | `datetime` | No | When commitment was confirmed kept |
| missedAt | `datetime` | No | When commitment was recorded as missed |
| missedCausationCode | `string` | No | Governed cause code for missed commitment |
| missedExplanation | `string` | No | Freeform explanation |
| ppcCounted | `boolean` | Yes | Whether included in PPC numerator/denominator |
| reminderDueAt | `datetime` | No | Governed reminder trigger date |
| escalationDueAt | `datetime` | No | Governed escalation trigger date |
| createdBy | `string` | Yes | userId |
| createdAt | `datetime` | Yes | Immutable |
| syncStatus | `enum` | Yes | Sync state (§15) |

### 6.4 BlockerRecord

A BlockerRecord is a named impediment that is preventing or threatening to prevent execution of a work package or activity.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| blockerId | `string` | Yes | UUID |
| projectId | `string` | Yes | FK to project |
| workPackageId | `string` | No | FK to FieldWorkPackage |
| externalActivityKey | `string` | No | FK to activity if no work package |
| blockerName | `string` | Yes | Short title |
| blockerDescription | `string` | Yes | Full description |
| blockerType | `enum` | Yes | `Design` \| `Material` \| `Equipment` \| `Labor` \| `Permit` \| `Inspection` \| `Owner` \| `Weather` \| `RFI` \| `Submittal` \| `Safety` \| `Funding` \| `Predecessor` \| `Other`; Governed taxonomy |
| causationCode | `string` | Yes | FK to CausationCode; Governed |
| severity | `enum` | Yes | `Informational` \| `AtRisk` \| `Blocking` \| `Critical` |
| status | `enum` | Yes | `Open` \| `InProgress` \| `Resolved` \| `Escalated` \| `Closed` \| `Withdrawn` |
| ownerUserId | `string` | Yes | userId responsible for resolution |
| reportedBy | `string` | Yes | userId who identified this blocker |
| identifiedAt | `datetime` | Yes | Immutable |
| targetResolutionDate | `date` | Yes | Date resolution is needed by |
| resolvedAt | `datetime` | No | When resolved |
| resolutionNotes | `string` | No | How it was resolved |
| scheduledImpactDays | `integer` | No | Estimated schedule impact if unresolved |
| linkedArtifacts | `LinkedArtifactRef[]` | No | Links to RFIs, submittals, etc. via `@hbc/related-items` |
| escalationDueAt | `datetime` | No | Governed escalation trigger |
| syncStatus | `enum` | Yes | Sync state (§15) |
| createdAt | `datetime` | Yes | Immutable |

### 6.5 ReadinessRecord

A ReadinessRecord captures the readiness state of a work package or activity — whether the prerequisite conditions needed to execute are in place.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| readinessId | `string` | Yes | UUID |
| projectId | `string` | Yes | FK to project |
| workPackageId | `string` | No | FK to FieldWorkPackage |
| externalActivityKey | `string` | No | FK to activity |
| assessedBy | `string` | Yes | userId who assessed |
| assessedAt | `datetime` | Yes | Immutable assessment timestamp |
| overallReadiness | `enum` | Yes | `Ready` \| `ConditionallyReady` \| `NotReady` \| `Unknown` |
| readinessDimensions | `ReadinessDimension[]` | Yes | Array of per-dimension readiness assessments |
| notes | `string` | No | Freeform readiness notes |
| blockerIds | `string[]` | No | FKs to BlockerRecords that affect readiness |
| syncStatus | `enum` | Yes | Sync state (§15) |
| createdAt | `datetime` | Yes | Immutable |

**ReadinessDimension object:**

| Field | Type | Description |
|-------|------|-------------|
| dimensionCode | `string` | Governed dimension code (e.g., `DRAWINGS`, `MATERIALS`, `LABOR`, `EQUIPMENT`, `PERMITS`, `INSPECTIONS`, `PREDECESSOR_COMPLETE`) |
| status | `enum` | `Ready` \| `AtRisk` \| `NotReady` \| `NotApplicable` |
| note | `string` | Dimension-specific note |

Governed readiness dimensions are managed by the Manager of Operational Excellence.

### 6.6 LookAheadPlan

A LookAheadPlan is the weekly or multi-week planning artifact containing the set of work packages and commitments planned for a specific look-ahead window.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| lookAheadId | `string` | Yes | UUID |
| projectId | `string` | Yes | FK to project |
| windowStart | `date` | Yes | Look-ahead window start |
| windowEnd | `date` | Yes | Look-ahead window end |
| windowWeeks | `integer` | Yes | Number of weeks spanned (Governed default; typically 3–6 weeks) |
| status | `enum` | Yes | `Draft` \| `Published` \| `InExecution` \| `Closed` |
| publishedBy | `string` | No | userId who published |
| publishedAt | `datetime` | No | Publication timestamp |
| workPackageIds | `string[]` | Yes | FieldWorkPackageIds included in this plan |
| commitmentIds | `string[]` | Yes | CommitmentRecord IDs in this window |
| ppcNumerator | `integer` | No | Count of kept commitments |
| ppcDenominator | `integer` | No | Count of total plan commitments (closed window only) |
| ppcPercent | `number` | No | Calculated: ppcNumerator / ppcDenominator × 100 (closed window) |
| createdBy | `string` | Yes | userId |
| createdAt | `datetime` | Yes | Immutable |

---


## 7. Acknowledgement and Acceptance Model

Commitments and requests directed to responsible parties require explicit acknowledgement. Acknowledgement records are first-class and support full lifecycle tracking including overdue detection and escalation.

### 7.1 AcknowledgementRecord

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ackId | `string` | Yes | UUID |
| projectId | `string` | Yes | FK to project |
| subjectType | `enum` | Yes | `Commitment` \| `PublicationReview` \| `ReconciliationRequest` \| `EscalationNotice` \| `ApprovalRequest` |
| subjectId | `string` | Yes | FK to the subject record |
| requestedBy | `string` | Yes | userId making the request |
| requestedAt | `datetime` | Yes | Immutable request timestamp |
| assignedTo | `string` | Yes | userId of the party who must respond |
| dueAt | `datetime` | No | Response deadline |
| reminderAt | `datetime` | No | Governed reminder trigger |
| escalationAt | `datetime` | No | Governed escalation trigger if not acted on |
| status | `enum` | Yes | `Pending` \| `Acknowledged` \| `Accepted` \| `Declined` \| `Reassigned` \| `Overdue` \| `Escalated` \| `Withdrawn` |
| response | `enum` | No | `Accept` \| `Decline` \| `Reassign` |
| responseNote | `string` | No | Reason for decline or reassignment |
| reassignedTo | `string` | No | userId if reassigned |
| respondedAt | `datetime` | No | When response was submitted |
| syncStatus | `enum` | Yes | Sync state (§15) |
| createdAt | `datetime` | Yes | Immutable |

**Business rules:**
- `Overdue` status is set by the system when `dueAt` passes with no response.
- `Escalated` status is set when `escalationAt` passes with no response; triggers escalation workflow via `@hbc/notification-intelligence`.
- All acknowledgement threshold values (due dates, reminder intervals, escalation windows) are Governed.

---


## 8. Actual Progress and Verification Model

Progress enters the system as a claim. Claims require verification before becoming authoritative. The distinction between reported, verified, and authoritative progress is enforced at the data layer.

### 8.1 ProgressClaimRecord

A ProgressClaimRecord is the initial field-reported progress assertion.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| claimId | `string` | Yes | UUID |
| projectId | `string` | Yes | FK to project |
| workPackageId | `string` | No | FK to FieldWorkPackage |
| externalActivityKey | `string` | No | FK to activity |
| reportedBy | `string` | Yes | userId |
| reportedAt | `datetime` | Yes | Immutable |
| progressBasis | `enum` | Yes | See §8.3 |
| reportedProgressPct | `number` | No | 0-100 |
| reportedQuantityInstalled | `number` | No | If quantity basis |
| reportedActualStart | `datetime` | No | If claiming actual start |
| reportedActualFinish | `datetime` | No | If claiming completion |
| evidenceRefs | `EvidenceRef[]` | No | Links to photos, inspection records, etc. |
| notes | `string` | No | Freeform notes |
| verificationRequired | `boolean` | Yes | Governed by work type and progress basis |
| verificationStatus | `enum` | Yes | `Pending` \| `Verified` \| `VerificationFailed` \| `Waived` |
| syncStatus | `enum` | Yes | Sync state (§15) |
| createdAt | `datetime` | Yes | Immutable |

### 8.2 ProgressVerificationRecord

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| verificationId | `string` | Yes | UUID |
| claimId | `string` | Yes | FK to ProgressClaimRecord |
| projectId | `string` | Yes | FK to project |
| verifiedBy | `string` | Yes | userId of verifier |
| verifiedAt | `datetime` | Yes | Immutable |
| verificationMethod | `enum` | Yes | `SiteWalkthrough` \| `PhotoReview` \| `InspectionRecord` \| `QuantityMeasurement` \| `SystemRecord` \| `Other` |
| verifiedProgressPct | `number` | No | Verifier's assessed % complete |
| verifiedQuantity | `number` | No | Verifier's measured quantity |
| verificationOutcome | `enum` | Yes | `Confirmed` \| `AdjustedDown` \| `AdjustedUp` \| `Rejected` |
| adjustmentReason | `string` | No | Required if adjusted or rejected |
| evidenceRefs | `EvidenceRef[]` | No | Supporting evidence |
| pmAcceptanceRequired | `boolean` | Yes | Governed: does this verification require PM/PE to accept before becoming authoritative? |
| pmAcceptedBy | `string` | No | userId of PM/PE acceptance |
| pmAcceptedAt | `datetime` | No | Acceptance timestamp |

**Authority chain:**
1. `reportedProgressPct` — field claim (informational only)
2. `verifiedProgressPct` — verifier assessment (informational until accepted)
3. Authoritative progress = `verifiedProgressPct` + `pmAcceptedAt` is set, OR `verificationRequired = false` + claim is not disputed

**Business rule:** Authoritative progress values roll up to parent activities and affect analytics, publication eligibility, and confidence calculations. Unverified claims do not affect publication-layer calculations unless Governed rules allow it.

### 8.3 Progress Basis Enumeration

All progress basis assignments to work types are Governed by the Manager of Operational Excellence.

| Basis | Description | When Used |
|-------|-------------|-----------|
| `MilestoneAchieved` | 0% until achieved, then 100% | Zero-duration milestones; binary events |
| `DurationPct` | % = actual duration / target duration | Default for most activities |
| `PhysicalPct` | Field-assessed physical completion | Structural, MEP rough-in |
| `UnitsInstalled` | Count of discrete units completed | Doors, fixtures, panels |
| `ResourcePct` | % based on resource expended | Resource-loaded activities |
| `QuantityInstalled` | Measured quantity (LF, SF, CY, etc.) | Concrete, rebar, piping |
| `Configured` | Project-specific method per activity code | Governed per activity code mapping |

---


## 9. Roll-Up Rules and Aggregation

### 9.1 Work Package to Activity Roll-Up

Roll-up rules are Governed. The Manager of Operational Excellence configures which method applies per work type and context.

| Roll-Up Dimension | Default Method | Governed Options |
|-------------------|---------------|-----------------|
| Progress % (reported) | Weighted average by quantity planned | Unweighted average; duration-weighted |
| Progress % (authoritative) | Only counts work packages with `verificationStatus = Verified` + PM accepted | Configured per work type |
| Blocker severity | Highest severity across all open blockers | — |
| Readiness | Lowest readiness level across active work packages | — |
| Commitment status | Worst active commitment status | — |
| Quantity installed | Sum of verified quantities | — |

### 9.2 Activity to Milestone Roll-Up

- Milestone `verificationStatus` is not `Authoritative` until all required FieldWorkPackages for that milestone are verified and accepted (if decomposed).
- Milestone `forecastDate` is not publication-eligible if any linked FieldWorkPackage has `status = Blocked` with `severity = Critical` unless PM explicitly overrides with documented reason.

### 9.3 Activity / Milestone to Confidence Roll-Up

- Open blockers, readiness gaps, and unverified progress reduce the confidence factor for the owning activity's forecast. See §10.4.
- Work package roll-up inputs feed the `ConfidenceRecord` directly.

### 9.4 Sensitive Parent Impacts

When work package actual progress causes a parent activity's `authoritativeProgressPct` to change by more than the governed threshold:
- The change is computed and staged.
- If the change would affect publication-eligible completion dates, PM acceptance is required before the authoritative value propagates to the publication layer.
- This prevents automated work-package progress from silently updating publication-ready values.

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
