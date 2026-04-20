# P3-E5 — Schedule Module: Publication Layer

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E5-T03 |
| **Parent** | [P3-E5 Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T03: Publication Layer |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

## 3. Published Forecast Layer

The published forecast layer is the **only** layer consumed by the health spine, executive review, and governed reports. Live working state from the managed operating layer is never surfaced to executive consumers until it has been through the publication stage gate.

### 3.1 PublicationRecord

| Field | Type | Required | Calculated | Description |
|-------|------|----------|------------|-------------|
| publicationId | `string` | Yes | Yes | UUID; immutable |
| projectId | `string` | Yes | No | FK to project |
| publicationLabel | `string` | Yes | No | Human label (e.g., "March 2026 Monthly Update") |
| publicationType | `enum` | Yes | No | `MonthlyUpdate` \| `MilestoneReview` \| `IssueUpdate` \| `RecoveryPlan` \| `BaselineEstablishment` \| `AutoPublish` |
| sourceVersionId | `string` | Yes | No | FK to ScheduleVersionRecord; the import snapshot this publication is based on |
| baselineId | `string` | Yes | No | FK to BaselineRecord; variance references |
| lifecycleStatus | `enum` | Yes | No | `Draft` \| `ReadyForReview` \| `Published` \| `Superseded` |
| initiatedBy | `string` | Yes | No | userId who initiated |
| initiatedByRole | `enum` | Yes | No | `PM` \| `Scheduler` \| `PE`; aligns with Ownership Maturity Model |
| submittedForReviewAt | `datetime` | No | No | When PM/Scheduler submitted for PE review |
| reviewedBy | `string` | No | No | userId of PE reviewer |
| reviewedAt | `datetime` | No | No | PE review timestamp |
| publishedAt | `datetime` | No | No | When publication became `Published` |
| supersededAt | `datetime` | No | No | When superseded by a newer publication |
| supersededBy | `string` | No | No | publicationId of replacement |
| reconciliationSummary | `string` | No | No | Summary of how committed dates differ from source truth |
| publishBasisNotes | `string` | No | No | Narrative explanation of publication basis |
| autoPublishEligible | `boolean` | Yes | Yes | Calculated: true if governed auto-publish rules are satisfied (see §21.3) |
| autoPublishedAt | `datetime` | No | No | Set if auto-published; null if human-published |
| blockers | `PublishBlocker[]` | No | Yes | Array of governed publish blockers present at time of submission |
| confidenceRecordId | `string` | No | No | FK to ConfidenceRecord computed for this publication |

**Publication lifecycle transitions:**

```
Draft → ReadyForReview → Published → Superseded
          ↑ (PE reject) ↓
         Draft ←─────────┘
```

- Only one `Published` publication exists per project at a time (the active published forecast).
- A new publication entering `Published` automatically transitions the prior to `Superseded`.
- `AutoPublish` type skips `ReadyForReview` only when all governed auto-publish criteria are met (see §21.3).

**Business rules:**
- Executive review (`@hbc/field-annotations`) operates exclusively against `Published` publications and their child snapshots.
- Health spine metrics are computed from the most recent `Published` publication.
- PM may revise a `Draft` publication any number of times before submitting.
- PE rejection returns publication to `Draft` with a rejection reason.

### 3.2 PublicationBlocker

Governed conditions that must be resolved before a publication can advance from `ReadyForReview` to `Published`. Managed by Manager of Operational Excellence.

| Field | Type | Description |
|-------|------|-------------|
| blockerCode | `string` | Governed code (e.g., `UNRESOLVED_CRITICAL_BLOCKER`, `STALE_SOURCE`) |
| blockerDescription | `string` | Human-readable description |
| severity | `enum` | `Hard` (must resolve) \| `Soft` (warning; PE may override) |
| resolvedAt | `datetime` | When resolved; null if still active |

### 3.3 PublishedActivitySnapshot

A point-in-time copy of the activity state at time of publication, combining source truth with managed commitments. Frozen at time of publication; never modified.

| Field | Type | Description |
|-------|------|-------------|
| publishedSnapshotId | `string` | UUID; immutable |
| publicationId | `string` | FK to PublicationRecord |
| externalActivityKey | `string` | Durable activity identity |
| sourceActivityCode | `string` | From ImportedActivitySnapshot |
| activityName | `string` | From ImportedActivitySnapshot |
| publishedStartDate | `datetime` | Best-available start: committedStartDate if present, else sourceStartDate |
| publishedFinishDate | `datetime` | Best-available finish: committedFinishDate if present, else sourceFinishDate |
| publishedPercentComplete | `number` | Best-available % complete |
| varianceFromBaselineDays | `integer` | publishedFinishDate − baseline finish from governing BaselineRecord |
| sourceFinishDate | `datetime` | Source truth at time of publication (preserved) |
| committedFinishDate | `datetime` | PM commitment at time of publication (null if aligned) |
| reconciliationStatus | `enum` | Status at time of publication |
| isCriticalPath | `boolean` | totalFloatHrs ≤ 0 from source snapshot |
| isMilestone | `boolean` | Milestone flag at time of publication |

---


## 19. Schedule Summary Projection (Health Spine and Canvas Tile)

The Schedule Summary Projection is a normalized snapshot consumed by the health spine and canvas tile. It is derived **exclusively from the most recent `Published` PublicationRecord**. Live working state is never used.

### 19.1 ScheduleSummaryProjection

| Field | Type | Required | Calculated | Description |
|-------|------|----------|------------|-------------|
| summaryId | `string` | Yes | Yes | UUID |
| projectId | `string` | Yes | No | FK to project |
| sourcePublicationId | `string` | Yes | No | FK to Published PublicationRecord |
| computedAt | `datetime` | Yes | Yes | Computation timestamp |
| overallStatus | `enum` | Yes | Yes | `OnTrack` \| `AtRisk` \| `Delayed` \| `Critical`; thresholds Governed |
| schedulePercentComplete | `number` | Yes | Yes | Weighted duration-based % complete from published snapshots |
| contractCompletionDate | `date` | Yes | No | From primary BaselineRecord |
| publishedCompletionDate | `date` | Yes | No | From PublicationRecord's published completion date |
| varianceDays | `integer` | Yes | Yes | publishedCompletionDate − contractCompletionDate |
| criticalPathActivityCount | `integer` | Yes | Yes | From FloatPathSnapshot |
| nearCriticalActivityCount | `integer` | Yes | Yes | From FloatPathSnapshot |
| confidenceLabel | `enum` | Yes | No | From ConfidenceRecord.overallConfidenceLabel |
| milestoneSummary | `MilestoneSummary` | Yes | Yes | Aggregate milestone status counts |
| nextMilestone | `NextMilestoneRef` | No | Yes | Next upcoming milestone info |
| qualityGrade | `string` | No | No | From ScheduleQualityGrade.overallGrade (if Expert tier enabled) |

**MilestoneSummary:**

| Field | Type |
|-------|------|
| total | integer |
| achieved | integer |
| onTrack | integer |
| atRisk | integer |
| delayed | integer |
| critical | integer |
| notStarted | integer |

**NextMilestoneRef:**

| Field | Type |
|-------|------|
| milestoneName | string |
| publishedForecastDate | date |
| varianceDays | integer |
| status | enum |

### 19.2 Overall Status Thresholds

All thresholds are Governed. Reference defaults:

| Status | Variance Threshold (default) |
|--------|------------------------------|
| `OnTrack` | ≤ 0 days |
| `AtRisk` | 1–7 days |
| `Delayed` | 8–21 days |
| `Critical` | > 21 days |

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
