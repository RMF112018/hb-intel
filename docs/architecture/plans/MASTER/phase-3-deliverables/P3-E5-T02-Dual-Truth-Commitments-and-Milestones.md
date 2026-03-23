# P3-E5 — Schedule Module: Dual-Truth Commitments and Milestones

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E5-T02 |
| **Parent** | [P3-E5 Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T02: Dual-Truth Commitments and Milestones |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

## 2. Dual-Truth Model and Managed Operating Layer

The module maintains two distinct truth layers simultaneously:

- **Source truth**: the frozen ImportedActivitySnapshot values from the most recent active canonical version. Never modified.
- **Managed commitment truth**: PM-owned working estimates, commitments, and reconciliation adjustments. Subject to approval workflows and publication gates.

Neither truth replaces the other. Conflict and reconciliation state is explicit.

### 2.1 ManagedCommitmentRecord

The ManagedCommitmentRecord carries the PM's current working position for an activity or milestone. It is the operating layer's "live" view and the basis for publication when promoted through the publication workflow.

| Field | Type | Required | Calculated | Description |
|-------|------|----------|------------|-------------|
| commitmentId | `string` | Yes | Yes | UUID |
| projectId | `string` | Yes | No | FK to project |
| externalActivityKey | `string` | Yes | No | Durable identity link to the activity |
| sourceVersionId | `string` | Yes | No | FK to ScheduleVersionRecord driving this commitment's source context |
| commitmentType | `enum` | Yes | No | `ActivityForecast` \| `MilestoneCommitment` \| `CompletionForecast` |
| sourceStartDate | `datetime` | Yes | No | Source truth start date from active snapshot (immutable reference) |
| sourceFinishDate | `datetime` | Yes | No | Source truth finish date from active snapshot (immutable reference) |
| committedStartDate | `datetime` | No | No | PM's working start commitment; null = using source truth |
| committedFinishDate | `datetime` | No | No | PM's working finish commitment; null = using source truth |
| startVarianceDays | `integer` | No | Yes | Calculated: committedStartDate - sourceStartDate; null if no commitment |
| finishVarianceDays | `integer` | No | Yes | Calculated: committedFinishDate - sourceFinishDate; null if no commitment |
| reconciliationStatus | `enum` | Yes | Yes | `Aligned` \| `PMOverride` \| `SourceAhead` \| `ConflictRequiresReview` \| `PendingApproval` \| `Approved` \| `Rejected` |
| primaryCausationCode | `string` | No | No | FK to CausationCode; required when committedFinishDate differs from source (Governed) |
| causationCodes | `string[]` | No | No | Additional coded causes (multi-select) |
| explanation | `string` | No | No | Freeform explanation layered on top of coded cause |
| confidenceNote | `string` | No | No | PM narrative on confidence in this commitment |
| approvalRequired | `boolean` | Yes | Yes | Calculated from governed threshold rules (see §21.1) |
| approvedBy | `string` | No | No | userId of approver (PE or delegated role) |
| approvedAt | `datetime` | No | No | Approval timestamp |
| rejectionReason | `string` | No | No | Why approval was denied |
| createdBy | `string` | Yes | No | userId |
| createdAt | `datetime` | Yes | Yes | Immutable |
| lastModifiedBy | `string` | No | No | userId |
| lastModifiedAt | `datetime` | No | No | Last edit timestamp |

**Reconciliation status definitions:**

| Status | Meaning |
|--------|---------|
| `Aligned` | Committed dates match source truth within governed tolerance |
| `PMOverride` | PM has set committed dates that differ from source truth; within approval threshold |
| `SourceAhead` | New source import moved dates earlier/later; committed dates are now behind source |
| `ConflictRequiresReview` | Committed dates and source dates are in irreconcilable conflict; PM action required |
| `PendingApproval` | Change magnitude exceeds governed threshold; awaiting PE approval |
| `Approved` | PE approved; committed dates are authoritative working position |
| `Rejected` | PE rejected; prior committed dates restored; PM must revise |

**Business rules:**
- `commitmentId` is stable. When new source version activates, source date fields are updated; `reconciliationStatus` is recalculated.
- `ConflictRequiresReview` generates a work feed item via `@hbc/my-work-feed` for PM action.
- All threshold values driving `approvalRequired` are governed (see §22.2).

### 2.2 ReconciliationRecord

A timestamped audit entry created each time a ManagedCommitmentRecord's reconciliationStatus changes. Provides the forensic history of how managed commitments evolved relative to source truth.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reconciliationId | `string` | Yes | UUID |
| commitmentId | `string` | Yes | FK to ManagedCommitmentRecord |
| projectId | `string` | Yes | FK to project |
| priorStatus | `enum` | Yes | Reconciliation status before this change |
| newStatus | `enum` | Yes | Reconciliation status after this change |
| priorCommittedFinish | `datetime` | No | Finish date before this change |
| newCommittedFinish | `datetime` | No | Finish date after this change |
| sourceVersionId | `string` | Yes | FK to ScheduleVersionRecord in effect at time of change |
| triggeredBy | `enum` | Yes | `SourceImport` \| `PMEdit` \| `PEApproval` \| `PERejection` \| `System` |
| causationCode | `string` | No | FK to CausationCode |
| explanation | `string` | No | Freeform note |
| createdAt | `datetime` | Yes | Immutable |
| createdBy | `string` | Yes | userId or system |

---


## 4. Milestone Working Model

Milestones function as the executive and publication summary lens. They are derived from the imported activity snapshot layer and the managed commitment layer; they are not a separate truth layer.

### 4.1 Milestone Identification

An activity is treated as a milestone when:
- Source `activityType` is `TT_Mile` or `TT_FinMile`, **OR**
- PM sets `isMilestoneOverride = true` on the activity's ManagedCommitmentRecord

### 4.2 MilestoneRecord

The MilestoneRecord is a view-projection record combining ImportedActivitySnapshot data with ManagedCommitmentRecord data for milestone-specific display, tracking, and publication surfaces. It is not an independent source of truth.

| Field | Type | Required | Calculated | Description |
|-------|------|----------|------------|-------------|
| milestoneId | `string` | Yes | Yes | UUID; stable across versions via externalActivityKey |
| projectId | `string` | Yes | No | FK to project |
| externalActivityKey | `string` | Yes | No | Durable identity link |
| activeSnapshotId | `string` | Yes | No | FK to current active ImportedActivitySnapshot |
| milestoneName | `string` | Yes | No | From activity name (overridable by PM) |
| milestoneType | `enum` | Yes | No | See §4.4 |
| isMilestoneOverride | `boolean` | Yes | No | true = PM-flagged; not auto-detected |
| isManual | `boolean` | Yes | No | true = created in HB Intel without P6 source |
| baselineFinishDate | `date` | No | No | From active BaselineRecord for this activity; null if no baseline |
| approvedExtensionDays | `integer` | Yes | No | Days approved via change orders; default 0 |
| revisedBaselineDate | `date` | Yes | Yes | baselineFinishDate + approvedExtensionDays |
| sourceFinishDate | `date` | Yes | No | From active ImportedActivitySnapshot |
| committedFinishDate | `date` | No | No | From ManagedCommitmentRecord; null = using source |
| forecastDate | `date` | Yes | Yes | Effective forecast: committedFinishDate if set; else sourceFinishDate |
| actualDate | `date` | No | No | Set when milestone achieved; immutable once set |
| verificationStatus | `enum` | No | No | See §8.3; null until progress claim initiated |
| status | `enum` | Yes | Yes | Calculated; see §4.3 |
| varianceDays | `integer` | Yes | Yes | forecastDate − revisedBaselineDate |
| isCriticalPath | `boolean` | Yes | Yes | totalFloatHrs ≤ 0 in active snapshot |
| totalFloatHrs | `number` | No | No | From active ImportedActivitySnapshot |
| contractMilestoneFlag | `boolean` | Yes | No | From source classification; Governed mapping |
| notes | `string` | No | No | PM notes (informational only) |
| createdAt | `datetime` | Yes | Yes | Immutable |
| createdBy | `string` | Yes | No | userId |

### 4.3 Milestone Status Calculation

Status is calculated; never stored as a static field. Recalculated on each load.

```
if actualDate is not null:
  status = Achieved

else if milestoneRecord.status was Superseded (manually set):
  status = Superseded  // immutable once set

else:
  varianceDays = forecastDate - revisedBaselineDate

  evaluate against governed thresholds (Manager of Operational Excellence configures):
    if varianceDays ≤ 0:
      status = OnTrack
    else if varianceDays ≤ atRiskThreshold (default: 14 days):
      status = AtRisk
    else if varianceDays ≤ delayedThreshold (default: 30 days):
      status = Delayed
    else:
      status = Critical
```

All threshold values (`atRiskThreshold`, `delayedThreshold`) are Governed; defaults listed are for reference only and may be changed by the Manager of Operational Excellence.

**Status display:**

| Status | UI Signal | Color |
|--------|-----------|-------|
| `NotStarted` | Gray dot | Gray |
| `OnTrack` | ✓ | Green |
| `AtRisk` | ! | Yellow |
| `Delayed` | ⚠ | Orange |
| `Critical` | 🔴 | Red |
| `Achieved` | ✓ | Green (checkmark) |
| `Superseded` | — | Gray / strikethrough |

### 4.4 Milestone Type Enumeration

| Type | Description |
|------|-------------|
| `ContractCompletion` | Contract completion date |
| `SubstantialCompletion` | Owner occupancy / retention release |
| `OwnerMilestone` | Owner-specified event |
| `HBInternal` | Internal construction milestone |
| `SubMilestone` | Subcontractor phase completion |
| `Permit` | Permit approval event |
| `Inspection` | Inspection completion event |
| `Custom` | User-defined category |

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
