# P3-E5 — Schedule Module: Analytics Intelligence and Grading

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E5-T07 |
| **Parent** | [P3-E5 Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T07: Analytics Intelligence and Grading |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

## 11. Analytics, Grading, and Confidence Model

### 11.1 ScheduleQualityGrade

The HB composite schedule quality grading framework is inspired by DCMA 14-point, GAO schedule assessment, and SmartPM-style controls. Scoring inputs are transparent and globally configurable by the Manager of Operational Excellence.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| gradeId | `string` | Yes | UUID |
| versionId | `string` | Yes | FK to ScheduleVersionRecord |
| projectId | `string` | Yes | FK to project |
| computedAt | `datetime` | Yes | Immutable |
| overallGrade | `string` | Yes | Letter grade: `A` \| `B` \| `C` \| `D` \| `F`; Governed thresholds |
| overallScore | `number` | Yes | 0-100 composite |
| controlScores | `GradingControlScore[]` | Yes | Per-control scoring |
| policyVersionId | `string` | Yes | FK to grading policy version in effect; ensures reproducibility |

**GradingControlScore object:**

| Field | Type | Description |
|-------|------|-------------|
| controlCode | `string` | Governed control code (e.g., `LOGIC_DENSITY`, `CRITICAL_PATH_FLOAT`, `HIGH_FLOAT`, `NEGATIVE_FLOAT`, `MISSING_BASELINES`, `CONSTRAINT_COUNT`, `TOTAL_FLOAT_SPREAD`, `UPDATE_FREQUENCY`, `INCOMPLETE_OPEN_ENDS`, `RESOURCE_LOADING`) |
| threshold | `number` | Governing threshold (Governed; from policy version) |
| measuredValue | `number` | Actual measured value |
| score | `number` | Control score (0-100) |
| weight | `number` | Weight in composite (Governed) |
| pass | `boolean` | Whether threshold is met |
| explanation | `string` | Human-readable finding |

### 11.2 FloatPathSnapshot

| Field | Type | Description |
|-------|------|-------------|
| floatSnapshotId | `string` | UUID |
| versionId | `string` | FK to ScheduleVersionRecord |
| computedAt | `datetime` | Immutable |
| criticalPathActivityCount | `integer` | Activities with totalFloatHrs ≤ 0 |
| nearCriticalCount | `integer` | Activities within governed near-critical float window (default: 40 hours; Governed) |
| negativeFloatCount | `integer` | Activities with totalFloatHrs < 0 |
| maxTotalFloatHrs | `number` | Max float in schedule |
| avgTotalFloatHrs | `number` | Average float |
| criticalPathIds | `string[]` | externalActivityKeys on critical path |
| nearCriticalIds | `string[]` | externalActivityKeys near-critical |
| criticalityIndex | `CriticalityEntry[]` | Per-activity criticality index (see §11.2.1) |

#### 11.2.1 Criticality Index Calculation

```
criticalityIndex(activity) = (1 - (totalFloatHrs / maxTotalFloat)) × 100
  where maxTotalFloat = maximum totalFloatHrs across all activities in version

Clamped to [0, 100].
```

Interpretation thresholds are Governed (defaults: 90+ = critical; 75-89 = near-critical; below 75 = standard). Hard-coded display defaults listed here are reference values only.

### 11.3 MilestoneSlippageTrend

Captures the version-over-version slippage history for each tracked milestone.

| Field | Type | Description |
|-------|------|-------------|
| trendId | `string` | UUID |
| projectId | `string` | FK to project |
| externalActivityKey | `string` | Milestone identity |
| trendEntries | `SlippageTrendEntry[]` | Ordered array of per-version entries |

**SlippageTrendEntry object:**

| Field | Type | Description |
|-------|------|-------------|
| versionId | `string` | FK to ScheduleVersionRecord |
| dataDate | `date` | Version data date |
| forecastFinishDate | `date` | Best-available finish at that version |
| varianceFromBaselineDays | `integer` | Days from governing baseline |
| cumulativeSlippageDays | `integer` | Total slippage since baseline |
| slippageSinceLastUpdateDays | `integer` | Slippage vs prior version |

### 11.4 ConfidenceRecord

Forecast confidence is a first-class governed multi-factor output. It is computed for each active publication cycle and for on-demand snapshots.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| confidenceId | `string` | Yes | UUID |
| projectId | `string` | Yes | FK to project |
| publicationId | `string` | No | FK to PublicationRecord if publication-time confidence |
| computedAt | `datetime` | Yes | Immutable |
| overallConfidenceScore | `number` | Yes | 0-100 composite (Governed weighting) |
| overallConfidenceLabel | `enum` | Yes | `High` \| `Moderate` \| `Low` \| `VeryLow` (Governed thresholds) |
| factorScores | `ConfidenceFactorScore[]` | Yes | Per-factor breakdown |
| policyVersionId | `string` | Yes | Grading/confidence policy in effect |
| narrativeSummary | `string` | No | System-generated narrative summary |

**ConfidenceFactorScore object:**

| Field | Type | Description |
|-------|------|-------------|
| factorCode | `string` | Governed factor code |
| factorLabel | `string` | Display label |
| score | `number` | 0-100 factor score |
| weight | `number` | Configured weight (Governed) |
| rawInputValue | `string` | The measured input (for transparency) |
| explanation | `string` | Narrative explanation |

**Governed confidence factors (configurable; defaults listed):**

| Factor Code | Default Weight | Input Source |
|-------------|---------------|--------------|
| `SCHEDULE_QUALITY` | 20% | ScheduleQualityGrade.overallScore |
| `FLOAT_PATH_EXPOSURE` | 15% | Ratio of near-critical to total activities |
| `UPDATE_STABILITY` | 15% | Avg version-over-version slippage across milestones |
| `UNRESOLVED_BLOCKERS` | 15% | Count × severity of open BlockerRecords |
| `READINESS_GAPS` | 10% | Count of NotReady readiness dimensions |
| `COMMITMENT_RELIABILITY` | 10% | Rolling PPC% over configured window |
| `SOURCE_FRESHNESS` | 10% | Days since last active canonical version import |
| `SCENARIO_ASSUMPTIONS` | 5% | Whether publication is scenario-based |

All weights, thresholds, and factor inclusions are Governed.

---


## 12. Recommendation Record Model

HBI recommendations and coaching outputs are first-class governed records. They never silently mutate authoritative schedule truth.

### 12.1 RecommendationRecord

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| recommendationId | `string` | Yes | UUID |
| projectId | `string` | Yes | FK to project |
| targetType | `enum` | Yes | `Activity` \| `Milestone` \| `WorkPackage` \| `Commitment` \| `Blocker` \| `Scenario` \| `Publication` \| `ScheduleQuality` \| `Confidence` |
| targetId | `string` | Yes | FK to the target record |
| recommendationType | `enum` | Yes | `ScheduleQualityFinding` \| `FloatRisk` \| `SlippageTrend` \| `CommitmentRisk` \| `BlockerEscalation` \| `ReadinessGap` \| `ConfidenceCollapse` \| `CoachingTip` \| `RecoveryOption` |
| title | `string` | Yes | Short title |
| rationale | `string` | Yes | Explanation of why this recommendation was generated |
| evidenceBasis | `string[]` | Yes | Array of evidence references (record IDs and types) |
| confidence | `number` | Yes | 0-100 recommendation confidence |
| confidenceLabel | `enum` | Yes | `High` \| `Moderate` \| `Low` |
| disposition | `enum` | Yes | `Pending` \| `Acknowledged` \| `Accepted` \| `Declined` \| `Promoted` \| `Superseded` |
| promotionPath | `enum` | No | `ToScenario` \| `ToWorkItem` \| `ToCommitmentChange` \| `ToPublicationReview` \| `ToBlocker`; valid when accepted |
| promotedToId | `string` | No | FK to the record created by promotion |
| respondedBy | `string` | No | userId |
| respondedAt | `datetime` | No | Response timestamp |
| responseNote | `string` | No | Why declined or notes on promotion |
| generatedAt | `datetime` | Yes | Immutable |
| policyVersionId | `string` | Yes | Policy version that triggered this recommendation |

**Business rule:** Accepting a recommendation with a `promotionPath` value creates a draft record of the indicated type. The PM must explicitly confirm before any promoted record becomes authoritative. Recommendation acceptance **never** directly modifies an ImportedActivitySnapshot, BaselineRecord, or PublicationRecord.

---


## 13. Causation Taxonomy

All coded causes use a governed enterprise taxonomy. The Manager of Operational Excellence administers the taxonomy; project teams apply codes but do not create enterprise-level codes.

### 13.1 CausationCode

| Field | Type | Description |
|-------|------|-------------|
| codeId | `string` | UUID |
| code | `string` | Short code (e.g., `DESIGN-RFI`, `WEATHER-EXTREME`, `SUB-DELAY`) |
| displayLabel | `string` | Human label |
| parentCodeId | `string` | FK to parent code (null = root) |
| tier | `integer` | Taxonomy tier depth (1 = category, 2 = type, 3 = specific) |
| applicableRecordTypes | `enum[]` | `ForecastChange` \| `Blocker` \| `ReadinessFailure` \| `MissedCommitment` \| `ForensicAttribution` \| `RecommendationRationale` \| `Escalation` \| `PublicationBasis` \| `BaselineChange` |
| isActive | `boolean` | Inactive codes cannot be newly applied but remain on historical records |
| sortOrder | `integer` | Display ordering |
| createdAt | `datetime` | Immutable |

**Taxonomy root categories (default; extensible by Admin):**

| Code | Label | Record Types |
|------|-------|-------------|
| `DESIGN` | Design Issues | All |
| `OWNER` | Owner Actions | All |
| `SUBCONTRACTOR` | Subcontractor Performance | All |
| `WEATHER` | Weather and Environmental | All |
| `REGULATORY` | Permits and Regulatory | All |
| `MATERIAL` | Material Procurement | Blocker, ReadinessFailure, MissedCommitment |
| `LABOR` | Labor Availability | Blocker, MissedCommitment |
| `EQUIPMENT` | Equipment Availability | Blocker, MissedCommitment |
| `SCHEDULE` | Schedule Planning | ForecastChange, ForensicAttribution |
| `CHANGE` | Approved Changes | ForecastChange, BaselineChange, PublicationBasis |
| `FORCE_MAJEURE` | Force Majeure | All |
| `INTERNAL` | Internal HB Issue | All |
| `OTHER` | Unclassified | All |

Freeform explanation fields layer on top of coded cause; they do not replace the coded cause requirement.

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
