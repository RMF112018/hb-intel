# P3-D2: Project Health Contract

| Field | Value |
|---|---|
| **Doc ID** | P3-D2 |
| **Phase** | Phase 3 |
| **Workstream** | D — Shared project spines |
| **Document Type** | Contract |
| **Owner** | Platform / Core Services + Project Hub platform owner |
| **Update Authority** | Architecture lead; changes require review by Platform lead and Experience lead |
| **Last Reviewed Against Repo Truth** | 2026-03-21 |
| **References** | [Phase 3 Plan §8.4](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-A3 §4](P3-A3-Shared-Spine-Publication-Contract-Set.md); [P3-C2 §3](P3-C2-Mandatory-Core-Tile-Family-Definition.md); [ADR-0110](../../../adr/ADR-0110-project-health-pulse-multi-dimension-indicator.md); [P3-A1](P3-A1-Project-Registry-and-Activation-Contract.md); [P3-A2](P3-A2-Membership-Role-Authority-Contract.md); [P3-D1](P3-D1-Project-Activity-Contract.md); [`@hbc/features-project-hub` health-pulse](../../../../../packages/features/project-hub/src/health-pulse/index.ts) |

---

## Contract Statement

This contract is the full implementation specification for the **Health spine** — the cross-module normalized project health model that Phase 3 Project Hub consumes for home/canvas health tiles, health detail views, portfolio triage, reporting inputs, and cross-project continuity.

Phase 3 uses a **hybrid health spine** (Phase 3 plan §8.4):

- A central Project Health model owns:
  - project-level status/scoring
  - explainability / confidence outputs
  - top recommended actions / escalations
  - normalized module contributions
- Modules retain richer local detail, thresholds, and drill-down logic.

P3-A3 §4 defined the publication-level contract (module metric contribution expectations, publication rules, architecture boundary). This deliverable expands that into the complete specification: health model lifecycle, canonical type system, deterministic computation pipeline, confidence model, compound risk evaluation, explainability, recommended actions, admin governance, office suppression, module metric contribution, rendering contract, integration adapters, telemetry, cross-spine integration, and cross-lane consistency.

**Repo-truth audit — 2026-03-21.** Unlike the Activity spine (P3-D1), which was a complete gap requiring new implementation, the Health spine is **fully implemented** in `@hbc/features-project-hub/src/health-pulse/` per SF21 and ADR-0110 (locked 2026-03-12). All canonical types (`IProjectHealthPulse`, `IHealthDimension`, `IHealthMetric`, `ICompoundRiskSignal`, `IHealthExplainability`, `ITopRecommendedAction`, `IPortfolioTriageProjection`, `IPulseConfidence`, `IHealthPulseAdminConfig`, `IProjectHealthTelemetry`, `IManualOverrideMetadata`), deterministic computors (scoring, confidence, compound risk, office suppression, recommendation), components (card, detail, admin panel, portfolio table, explainability drawer, dimension tab, inline edit), hooks (`useProjectHealthPulse`, `useHealthPulseAdminConfig`), integration adapters (BIC, notification, canvas, auth, complexity, telemetry, versioned-record), and governance validation are live and tested at >=95% coverage (ADR-0110 D-10). P3-C2 §3 confirms the `project-health-pulse` mandatory tile is registered and fully implemented. This contract codifies existing mature implementation as governance rather than specifying greenfield work. See §1 for full reconciliation.

---

## Contract Scope

### This contract governs

- The complete `IProjectHealthPulse` model lifecycle (metric contribution, computation, projection, rendering, telemetry)
- The canonical type system: `IProjectHealthPulse`, `IHealthDimension`, `IHealthMetric`, `IPulseConfidence`, `ICompoundRiskSignal`, `IHealthExplainability`, `ITopRecommendedAction`, `IPortfolioTriageProjection`, `IManualOverrideMetadata`, `IHealthPulseAdminConfig`, `IProjectHealthTelemetry`
- The deterministic computation pipeline (dimension scoring, overall scoring, confidence, compound risk, recommendation selection)
- Office health suppression policy model
- Admin governance configuration and validation
- Module metric contribution expectations (expanded from P3-A3 §4.1)
- Explainability contract
- Rendering contract for health consumers (card, detail, portfolio table, explainability drawer)
- Integration adapter contracts (BIC, notification, canvas, auth, complexity, telemetry, versioned-record)
- Cross-spine integration rules (Health ↔ Activity, Health → Work Queue, Health → Reporting)
- Cross-lane consistency rules (PWA / SPFx)
- Decision-quality telemetry contract

### This contract does NOT govern

- The publication-level contract definition (already locked in [P3-A3 §4](P3-A3-Shared-Spine-Publication-Contract-Set.md))
- Health tile UI design — see [P3-C2 §3](P3-C2-Mandatory-Core-Tile-Family-Definition.md) for mandatory tile spec
- Other spine specifications — see P3-D1 (Activity), P3-D3 (Work Queue), P3-D4 (Related Items)
- Module-internal health thresholds, local alerts, or drill-down behavior — module-owned per the hybrid model
- Executive review annotation artifacts — executive review annotations on Health are in a separate review-layer artifact, not in the `IProjectHealthPulse` type; see §2.5

---

## Definitions

| Term | Meaning |
|---|---|
| **Health dimension** | One of four scored categories: Cost, Time, Field, Office |
| **Health metric** | A single normalized signal contributed by a module to a health dimension (`IHealthMetric`) |
| **Pulse** | A computed snapshot of project health at a point in time (`IProjectHealthPulse`) |
| **Confidence tier** | Classification of scoring reliability: `high`, `moderate`, `low`, `unreliable` |
| **Compound risk signal** | A cross-dimension pattern indicating correlated deterioration across two or more dimensions |
| **Explainability** | Structured explanation of why a project has its current health status, what changed, and what matters most |
| **Recommended action** | A reason-coded, confidence-weighted actionable next step selected from module-contributed candidates |
| **Triage projection** | Portfolio-level classification for review prioritization: `attention-now`, `trending-down`, `data-quality-risk`, `recovering` |
| **Office suppression** | Policy-driven filtering of low-impact and duplicate office dimension signals to prevent noise |
| **Manual override** | A governed human-entered metric value with provenance metadata (reason, enteredBy, approval tracking) |
| **Leading / lagging weight** | Metric temporal classification; leading metrics weight 0.7, lagging metrics weight 0.3 |
| **Staleness threshold** | Maximum age (days) before a metric is treated as stale and excluded from scoring |

---

## 1. Current-State Reconciliation

| Artifact | Location | Status | Relevance |
|---|---|---|---|
| `IProjectHealthPulse` and all health types | `packages/features/project-hub/src/health-pulse/types/index.ts` | **Live** — mature | Complete canonical type system (13 types/interfaces) |
| `computeProjectHealthPulse()` | `health-pulse/computors/index.ts` | **Live** — mature | Deterministic scoring pipeline with dimension, overall, and composite computation |
| `computePulseConfidence()` / `computeOverallPulseConfidence()` | `health-pulse/computors/confidence/index.ts` | **Live** — mature | Confidence computation with 6-factor penalty model and tier classification |
| `evaluateCompoundRiskSignals()` | `health-pulse/computors/compound-risk/index.ts` | **Live** — mature | Cross-dimension compound risk detection (3 deterministic patterns) |
| `applyOfficeSuppressionPolicy()` | `health-pulse/computors/office-suppression/index.ts` | **Live** — mature | Office signal filtering with low-impact suppression and duplicate cluster deduplication |
| `selectTopRecommendedAction()` / `rankRecommendationCandidates()` | `health-pulse/computors/recommendation/index.ts` | **Live** — mature | Weighted recommendation ranking and selection |
| `validateHealthPulseAdminConfig()` | `health-pulse/governance/index.ts` | **Live** — mature | Admin config validation with comprehensive rule set |
| Contract constants | `health-pulse/constants/index.ts` | **Live** — mature | Locked constants: staleness threshold (14 days), leading weight (0.7), lagging weight (0.3), triage buckets, confidence tiers |
| Components | `health-pulse/components/` | **Live** — mature | ProjectHealthPulseCard, ProjectHealthPulseDetail, HealthPulseAdminPanel, PortfolioHealthTable, ExplainabilityDrawer, HealthDimensionTab, HealthMetricInlineEdit |
| Display model utilities | `health-pulse/components/displayModel.ts` | **Live** — mature | Deterministic UI projection: status/confidence variant mapping, dimension entries, trend series, portfolio filtering/sorting, override aging |
| Hooks | `health-pulse/hooks/` | **Live** — mature | `useProjectHealthPulse`, `useHealthPulseAdminConfig` with state store and query key management |
| Integration adapters | `health-pulse/integrations/` | **Live** — mature | 7 adapter families: BIC, notification, canvas, auth, complexity, telemetry, versioned-record |
| Telemetry | `health-pulse/telemetry/index.ts` | **Live** — mature | Decision-quality telemetry scope markers |
| BIC registration | `health-pulse/bic-registration.ts` | **Live** — mature | P2-C5 Blocker #4 satisfaction |
| Notification registrations | `health-pulse/notification-registrations.ts` | **Live** — mature | P2-C5 Blocker #7 satisfaction |
| Navigation resolver | `health-pulse/resolveHealthPulseActionUrl.ts` | **Live** — mature | P2-C4 §3 Pattern 3 satisfaction |
| ADR-0110 | `docs/architecture/adr/ADR-0110-project-health-pulse-multi-dimension-indicator.md` | **Accepted** | 10 governance decisions locking SF21 production behavior |
| P3-A3 §4 | Phase 3 deliverables | **Locked** (plan) | Publication-level module metric contribution expectations |
| P3-C2 §3 | Phase 3 deliverables | **Locked** (spec) | Mandatory `project-health-pulse` tile definition — fully implemented |

**Classification:** All Health spine artifacts are live and implemented at production maturity. No gaps requiring new implementation exist. This contract codifies existing production behavior. Module-specific metric contribution adapters are controlled-evolution scope (§11).

---

## 2. Health Model Lifecycle

### 2.5 Executive review layer applicability

Project Health is a **review-capable surface** in Phase 3 (see P3-E1 §7 and P3-A2 §3.2).

Portfolio Executive Reviewers may annotate the Health spine surface through the separate executive review artifact layer. The following rules apply:

| Rule | Description |
|---|---|
| **Annotation scope** | Review annotations target the rendered health surface (overall status, dimension scores, recommended actions) at full field-level depth |
| **Annotation isolation** | Executive review annotations are stored in a separate review-layer artifact; they are NOT part of `IProjectHealthPulse` or any health computation type |
| **No mutation path** | Executive review annotations MUST NOT modify `IHealthMetric` values, dimension scores, confidence tiers, compound risk signals, or any computed health output. Health source data is owned exclusively by the computation pipeline. |
| **Visibility before push** | Review annotations are visible only to the restricted executive review circle (originating reviewer, other authorized executive reviewers, PM/PE/designated surface owner) until pushed via Push-to-Project-Team (P3-A2 §3.4) |
| **Reuse of `@hbc/field-annotations`** | The executive review annotation layer SHOULD reuse `@hbc/field-annotations` where applicable. If `@hbc/field-annotations` requires enhancement for section/block anchors or non-classic field anchors to support health surface annotation, that enhancement is a **blocker dependency** for executive review implementation. See blocker note below. |

**Blocker note — field-annotations enhancement:** `@hbc/field-annotations` must be evaluated at Phase 3 kickoff to confirm whether it supports section-level or block-level anchors (not just classic field-level). If it does not, a `@hbc/field-annotations` enhancement for non-classic anchors is required before executive review on Health can be implemented. This evaluation must occur before the Health executive review feature is scoped for implementation.

### 2.1 Lifecycle stages

```
Metric Contribution → Computation → Projection → Rendering → Telemetry
```

| Stage | Actor | Action |
|---|---|---|
| **Metric Contribution** | Module metric adapters | Modules push `IHealthMetric` values into the health pipeline, each carrying `key`, `value`, `isStale`, `isManualEntry`, `lastUpdatedAt`, `weight` (leading/lagging) |
| **Computation** | `computeProjectHealthPulse()` | Deterministic scoring: dimension scoring, overall scoring, confidence, compound risk, recommendation selection — all in a single synchronous pass (ADR-0110 D-02) |
| **Projection** | Integration adapters | Computed `IProjectHealthPulse` is projected to BIC, notification, canvas, telemetry, and versioned-record formats via deterministic pure-function adapters |
| **Rendering** | Health components | Components consume `IProjectHealthPulse` and display model utilities for UI projection across complexity tiers |
| **Telemetry** | Telemetry adapter | Decision-quality KPIs are emitted preserving confidence, triage, compound-risk, and reason-code context (ADR-0110 D-09) |

### 2.2 Recomputation trigger

Metric updates MUST trigger health recomputation through the governed pipeline (P3-A3 §4.2). The recomputation path is owned by the hook/state orchestration layer (`useProjectHealthPulse`), not by individual components or adapters.

### 2.3 Pulse immutability

Computed pulses are snapshots. Historical pulses are NOT retroactively modified. If module metrics change, a new pulse is computed at the new point in time. Prior pulses remain as-is for audit and trend analysis.

### 2.4 Determinism invariant

The same `IComputeProjectHealthPulseInput` MUST always produce the same `IProjectHealthPulse` output. No random, time-dependent (beyond `computedAt`), or UI-state-dependent behavior is permitted in the computation pipeline (ADR-0110 D-02).

---

## 3. Canonical Type System

All types are defined in `packages/features/project-hub/src/health-pulse/types/index.ts` and exported through the `@hbc/features-project-hub` public surface (ADR-0110 D-01).

### 3.1 HealthStatus

```typescript
type HealthStatus = 'on-track' | 'watch' | 'at-risk' | 'critical' | 'data-pending';
```

| Status | Score band | Meaning |
|---|---|---|
| `on-track` | ≥ 85 | Project dimension or overall health is performing well |
| `watch` | ≥ 65, < 85 | Emerging concerns that warrant monitoring |
| `at-risk` | ≥ 40, < 65 | Material risk requiring active attention |
| `critical` | ≥ 0, < 40 | Severe risk requiring immediate intervention |
| `data-pending` | N/A | Insufficient valid metrics or unreliable confidence — cannot classify |

### 3.2 PulseConfidenceTier

```typescript
type PulseConfidenceTier = 'high' | 'moderate' | 'low' | 'unreliable';
```

| Tier | Score band | Meaning |
|---|---|---|
| `high` | ≥ 85 | Strong data quality; scoring is trustworthy |
| `moderate` | ≥ 65, < 85 | Adequate data; some gaps or staleness present |
| `low` | ≥ 40, < 65 | Significant data gaps; scoring should be interpreted cautiously |
| `unreliable` | < 40 | Insufficient data quality; health status forced to `data-pending` |

### 3.3 IHealthMetric

| Field | Type | Required | Description |
|---|---|---|---|
| `key` | `string` | Yes | Unique metric identifier within the dimension |
| `label` | `string` | Yes | Human-readable metric name |
| `value` | `number \| null` | Yes | Metric score (0–100) or null if no data available |
| `isStale` | `boolean` | Yes | Whether the metric is stale beyond configured thresholds |
| `isManualEntry` | `boolean` | Yes | Whether the value was manually entered (vs. system-derived) |
| `lastUpdatedAt` | `string \| null` | Yes | ISO 8601 timestamp of last update |
| `weight` | `'leading' \| 'lagging'` | Yes | Temporal classification for weighted scoring |
| `manualOverride` | `IManualOverrideMetadata \| null` | No | Override provenance when `isManualEntry` is true |

### 3.4 IManualOverrideMetadata

| Field | Type | Required | Description |
|---|---|---|---|
| `reason` | `string` | Yes | Explanation for the manual override |
| `enteredBy` | `string` | Yes | UPN of the person who entered the override |
| `enteredAt` | `string` | Yes | ISO 8601 timestamp of entry |
| `requiresApproval` | `boolean` | No | Whether the override requires approval before influencing scoring |
| `approvedBy` | `string \| null` | No | UPN of the approver |
| `approvedAt` | `string \| null` | No | ISO 8601 timestamp of approval |

### 3.5 IPulseConfidence

| Field | Type | Description |
|---|---|---|
| `tier` | `PulseConfidenceTier` | Confidence tier classification |
| `score` | `number` | Numeric confidence score (0–100) |
| `reasons` | `string[]` | Human-readable reasons for confidence penalties |

### 3.6 IHealthDimension

| Field | Type | Description |
|---|---|---|
| `score` | `number` | Weighted dimension score (0–100) |
| `status` | `HealthStatus` | Status classification from score bands |
| `label` | `'Cost' \| 'Time' \| 'Field' \| 'Office'` | Display label |
| `leadingScore` | `number` | Score from leading-weight metrics only |
| `laggingScore` | `number` | Score from lagging-weight metrics only |
| `metrics` | `IHealthMetric[]` | Source metrics for this dimension |
| `keyMetric` | `string` | Key of the most significant metric in the dimension |
| `trend` | `'improving' \| 'stable' \| 'declining' \| 'unknown'` | Directional trend derived from leading vs. lagging comparison |
| `hasExcludedMetrics` | `boolean` | Whether any metrics were excluded (stale/null) from scoring |
| `confidence` | `IPulseConfidence` | Dimension-level confidence assessment |

### 3.7 ICompoundRiskSignal

| Field | Type | Description |
|---|---|---|
| `code` | `'time-field-deterioration' \| 'cost-time-correlation' \| 'office-field-amplification' \| 'custom'` | Deterministic pattern code |
| `severity` | `'low' \| 'moderate' \| 'high' \| 'critical'` | Signal severity level |
| `affectedDimensions` | `Array<'cost' \| 'time' \| 'field' \| 'office'>` | Dimensions involved in the correlation |
| `summary` | `string` | Human-readable signal description |

### 3.8 IHealthExplainability

| Field | Type | Description |
|---|---|---|
| `whyThisStatus` | `string[]` | Reasons for the current health status (aggregated confidence reasons from all dimensions) |
| `whatChanged` | `string[]` | Recent changes contributing to the status |
| `topContributors` | `string[]` | Key metrics driving the status (one per dimension) |
| `whatMattersMost` | `string` | Most impactful actionable insight (sourced from top recommended action) |

### 3.9 ITopRecommendedAction

| Field | Type | Description |
|---|---|---|
| `actionText` | `string` | Human-readable action description |
| `actionLink` | `string \| null` | Deep-link to the relevant module surface |
| `reasonCode` | `string` | Machine-readable reason code for traceability (ADR-0110 D-06) |
| `owner` | `string \| null` | Suggested owner for the action |
| `urgency` | `number` | Urgency score (0–100); may be elevated by compound risk |
| `impact` | `number` | Impact score (0–100) |
| `confidenceWeight` | `number` | Confidence weight applied to ranking (0–100) |

### 3.10 IPortfolioTriageProjection

| Field | Type | Description |
|---|---|---|
| `bucket` | `'attention-now' \| 'trending-down' \| 'data-quality-risk' \| 'recovering'` | Portfolio triage classification |
| `sortScore` | `number` | Triage sort score (overall score + compound risk delta) |
| `triageReasons` | `string[]` | Reasons for the triage classification |

### 3.11 IProjectHealthPulse

| Field | Type | Description |
|---|---|---|
| `projectId` | `string` | Canonical project identity from P3-A1 registry |
| `computedAt` | `string` | ISO 8601 timestamp of computation |
| `overallScore` | `number` | Weighted overall health score (0–100) |
| `overallStatus` | `HealthStatus` | Overall status classification |
| `overallConfidence` | `IPulseConfidence` | Overall confidence (aggregated from 4 dimensions) |
| `dimensions` | `{ cost, time, field, office }` | Four `IHealthDimension` records |
| `compoundRisks` | `ICompoundRiskSignal[]` | Active cross-dimension compound risk signals |
| `topRecommendedAction` | `ITopRecommendedAction \| null` | Top-ranked recommended action or null if none |
| `explainability` | `IHealthExplainability` | Structured explanation of the health status |
| `triage` | `IPortfolioTriageProjection` | Portfolio-level triage classification |

### 3.12 IHealthPulseAdminConfig

| Field | Type | Description |
|---|---|---|
| `weights` | `{ field, time, cost, office: number }` | Dimension weights (must sum to 1.0) |
| `stalenessThresholdDays` | `number` | Default staleness threshold in days (default: 14) |
| `metricStalenessOverrides` | `Record<string, number>` | Per-metric staleness threshold overrides |
| `manualEntryGovernance` | `IManualEntryGovernanceConfig` | Manual override governance rules |
| `officeHealthSuppression` | `IOfficeSuppressionPolicy` | Office dimension suppression policy |
| `portfolioTriageDefaults` | `{ defaultBucket, defaultSort }` | Default triage bucket and sort mode |

Where `IManualEntryGovernanceConfig` contains:

| Field | Type | Description |
|---|---|---|
| `approvalRequiredMetricKeys` | `string[]` | Metric keys requiring approval before override takes effect |
| `maxManualInfluencePercent` | `number` | Maximum percentage (0–100) of manual influence allowed |
| `maxOverrideAgeDays` | `number` | Maximum age in days before overrides are flagged as aged |

Where `IOfficeSuppressionPolicy` contains:

| Field | Type | Description |
|---|---|---|
| `lowImpactSuppressionEnabled` | `boolean` | Whether low-impact signals are suppressed |
| `duplicateClusterWindowHours` | `number` | Time window for duplicate cluster deduplication |
| `severityWeights` | `Record<'minor' \| 'major' \| 'critical', number>` | Severity weight factors for overdue scoring |

### 3.13 IProjectHealthTelemetry

| Field | Type | Description |
|---|---|---|
| `interventionLeadTime` | `number \| null` | Time between alert and intervention (future KPI) |
| `falseAlarmRate` | `number \| null` | Ratio of alerts that were false positives (future KPI) |
| `preLagDetectionRate` | `number \| null` | Ratio of issues detected before lagging indicators confirmed (future KPI) |
| `actionAdoptionRate` | `number \| null` | Whether a recommendation existed (1) or not (0) |
| `portfolioReviewCycleTime` | `number \| null` | Time between portfolio reviews (future KPI) |
| `suppressionImpactRate` | `number \| null` | Ratio of office metrics suppressed (suppressedCount / originalCount) |

---

## 4. Deterministic Computation Pipeline

The computation pipeline is implemented in `computeProjectHealthPulse()` (`health-pulse/computors/index.ts`). All computation is deterministic (ADR-0110 D-02).

### 4.1 Dimension scoring

Each of the four dimensions (Cost, Time, Field, Office) is scored through the following pipeline:

1. **Office suppression** (Office dimension only): Apply `applyOfficeSuppressionPolicy()` to filter low-impact and duplicate signals (§10).
2. **Stale/null exclusion**: Exclude metrics where `value === null` or staleness exceeds the configured threshold. A metric is stale when `isStale === true` OR when `lastUpdatedAt` age exceeds `metricStalenessOverrides[key] ?? stalenessThresholdDays`.
3. **Leading/lagging grouping**: Separate active metrics by `weight` field.
4. **Group scoring**: Score each group using equal-weight normalization within the group: `sum(value × (1/count))`.
5. **Weighted composition**: `dimensionScore = round(leadingScore × 0.7 + laggingScore × 0.3)` (constants: `HEALTH_DIMENSION_LEADING_WEIGHT = 0.7`, `HEALTH_DIMENSION_LAGGING_WEIGHT = 0.3`).
6. **Status classification**: Map score to `HealthStatus` via score bands (§3.1).
7. **Confidence computation**: Compute dimension-level confidence per §5.

### 4.2 Overall scoring

```
overallScore = round(
  cost.score × weights.cost +
  time.score × weights.time +
  field.score × weights.field +
  office.score × weights.office
)
```

Dimension weights are configured in `IHealthPulseAdminConfig.weights` and MUST sum to 1.0 (validated by `validateHealthPulseAdminConfig()`). Overall status is classified from `overallScore` using the same score bands, except when `overallConfidence.tier === 'unreliable'` — then status is forced to `data-pending`.

### 4.3 Required dimension signal keys

Each dimension has required signal keys that impact confidence when missing:

| Dimension | Required signal keys |
|---|---|
| **Time** | `look-ahead-reliability`, `near-critical-path-volatility`, `schedule-update-quality` |
| **Cost** | `forecast-confidence`, `forecast-update-age`, `pending-change-order-aging` |
| **Field** | `production-throughput-reliability`, `rework-trend`, `plan-complete-reliability` |
| **Office** | `clustering`, `severity-weighted-overdue-signals`, `low-impact-suppression` |

Missing required signal keys generate confidence penalty reasons.

### 4.4 Data-pending rules

- A dimension status becomes `data-pending` when no valid metrics exist (all excluded) OR when dimension confidence tier is `unreliable`.
- Overall status becomes `data-pending` when `overallConfidence.tier === 'unreliable'`.
- When a dimension has no valid metrics, its score is 0.

### 4.5 Trend derivation

Trend is derived from the comparison of leading and lagging scores within a dimension:

| Condition | Trend |
|---|---|
| `leadingScore > laggingScore` | `improving` |
| `leadingScore < laggingScore` | `declining` |
| `leadingScore === laggingScore` | `stable` |

### 4.6 Default triage bucket

When `adminConfig.portfolioTriageDefaults.defaultBucket` is not set, triage bucket is derived from overall score:

| Score range | Default bucket |
|---|---|
| < 40 | `attention-now` |
| < 65 | `trending-down` |
| < 80 | `data-quality-risk` |
| ≥ 80 | `recovering` |

---

## 5. Confidence Model

Confidence is a first-class output of the Health spine, not an optional annotation (ADR-0110 D-03). The model is implemented in `health-pulse/computors/confidence/index.ts`.

### 5.1 Computation inputs

| Input | Type | Description |
|---|---|---|
| `excludedMetricRatio` | `number` (0–1) | Fraction of metrics excluded due to missing or stale values |
| `staleMetricRatio` | `number` (0–1) | Fraction of metrics that are stale beyond threshold |
| `manualInfluenceRatio` | `number` (0–1) | Fraction of active metrics that are manual entries |
| `trendHistorySufficient` | `boolean` | Whether enough historical data exists for trend analysis |
| `integrationCompleteness` | `number` (0–1) | Fraction of expected module integrations that are active |
| `additionalReasons` | `string[]` | Pre-computed reasons (e.g., missing required signal keys) |

### 5.2 Scoring formula

```
score = 100
  − clamp(excludedMetricRatio, 0, 1) × 35
  − clamp(staleMetricRatio, 0, 1) × 25
  − clamp(manualInfluenceRatio, 0, 1) × 20
  − (1 − clamp(integrationCompleteness, 0, 1)) × 20
  − (trendHistorySufficient ? 0 : 15)

confidenceScore = round(clamp(score, 0, 100))
```

### 5.3 Tier classification

The rounded score maps to a confidence tier per §3.2: `high` (≥85), `moderate` (≥65), `low` (≥40), `unreliable` (<40).

### 5.4 Reason generation

Automatic reason strings are appended for each penalty factor:

| Condition | Reason |
|---|---|
| `excludedMetricRatio > 0` | "Some metrics were excluded due to missing or stale values." |
| `staleMetricRatio > 0` | "Some metrics are stale beyond configured thresholds." |
| `manualInfluenceRatio > 0.35` | "Manual influence exceeds preferred confidence threshold." |
| `integrationCompleteness < 1` | "Integration completeness is below 100%." |
| `!trendHistorySufficient` | "Trend history is insufficient for confidence weighting." |

### 5.5 Overall confidence

Overall confidence is computed by averaging the 4 dimension confidence scores and aggregating all dimension-level reasons via `computeOverallPulseConfidence()`.

### 5.6 Display contract

Confidence tier and score MUST be visible in:
- Health card (all complexity tiers)
- Health detail view
- Explainability drawer (dedicated confidence section)
- Portfolio health table (`confidenceTier`, `confidenceScore` columns)

Confidence tier maps to visual variants: `high` → `success`, `moderate` → `info`, `low` → `warning`, `unreliable` → `error`.

---

## 6. Compound Risk Evaluation

Compound risk evaluation detects cross-dimension patterns indicating correlated deterioration. The model is deterministic (ADR-0110 D-04), implemented in `health-pulse/computors/compound-risk/index.ts`.

### 6.1 Deterioration test

A dimension is considered **deteriorating** when `trend === 'declining'` OR `status === 'at-risk'` OR `status === 'critical'`.

### 6.2 Compound risk patterns

| Pattern code | Trigger condition | Severity classification |
|---|---|---|
| `time-field-deterioration` | Time AND Field are both deteriorating | `critical` if either has status `critical`; otherwise `high` |
| `cost-time-correlation` | Cost AND Time are both deteriorating | `high` if both scores < 50; otherwise `moderate` |
| `office-field-amplification` | Office status is NOT `on-track` AND Field status is `at-risk` or `critical` | `high` if Office score < 40; otherwise `moderate` |

### 6.3 Triage impact

Compound risk signals increase the triage sort score by a severity-dependent delta:

| Severity | Triage sort delta |
|---|---|
| `critical` | +30 |
| `high` | +20 |
| `moderate` | +10 |
| `low` | +5 |

Multiple signals stack: `triageSortDelta = sum(severityToDelta(signal.severity))`.

### 6.4 Recommendation impact

Compound risk increases recommendation urgency by half the triage delta: `recommendationUrgencyDelta = round(triageSortDelta / 2)`.

### 6.5 Extensibility

The `custom` code is reserved for future compound risk patterns. New deterministic patterns require a contract update to this document.

---

## 7. Explainability Contract

Explainability is a required projected payload, not optional UI copy (ADR-0110 D-05). The `IHealthExplainability` structure is populated during computation and rendered by the `ExplainabilityDrawer` component.

### 7.1 Population rules

| Field | Source |
|---|---|
| `whyThisStatus` | Aggregated confidence reasons from all 4 dimensions |
| `whatChanged` | Caller-provided (empty array by default; populated by orchestration layer with recent delta information) |
| `topContributors` | `keyMetric` from each dimension: `[cost.keyMetric, time.keyMetric, field.keyMetric, office.keyMetric]` |
| `whatMattersMost` | Top recommended action's `actionText`; falls back to `"No recommendation candidate exceeded ranking thresholds."` |

### 7.2 Consumer rendering

The `ExplainabilityDrawer` component organizes explainability into 5 sections:

| Section key | Content source |
|---|---|
| `confidence` | Overall and dimension confidence tiers, scores, and reasons |
| `why` | `explainability.whyThisStatus` entries |
| `changed` | `explainability.whatChanged` entries |
| `contributors` | `explainability.topContributors` mapped to dimension labels |
| `matters-most` | `explainability.whatMattersMost` text |

---

## 8. Recommended Actions

The recommendation pipeline selects the single most impactful action from module-contributed candidates (ADR-0110 D-06). Implemented in `health-pulse/computors/recommendation/index.ts`.

### 8.1 Candidate shape

`IRecommendationCandidate`:

| Field | Type | Description |
|---|---|---|
| `actionText` | `string` | Human-readable action description |
| `actionLink` | `string \| null` | Deep-link to the relevant surface |
| `reasonCode` | `string` | Machine-readable reason code for traceability |
| `owner` | `string \| null` | Suggested action owner |
| `urgency` | `number` | Urgency score (0–100) |
| `impact` | `number` | Impact score (0–100) |
| `reversibilityWindowHours` | `number` | Hours available to reverse the action |
| `ownerAvailability` | `number` | Owner availability score (0–100) |
| `confidenceWeight` | `number` | Confidence weight (0–100) |

### 8.2 Ranking formula

```
rank = clamp(urgency, 0, 100) × 0.35
     + clamp(impact, 0, 100) × 0.30
     + clamp(100 − reversibilityWindowHours, 0, 100) × 0.15
     + clamp(ownerAvailability, 0, 100) × 0.10
     + clamp(confidenceWeight, 0, 100) × 0.10
```

Candidates are sorted by rank descending. The top-ranked candidate becomes `ITopRecommendedAction`.

### 8.3 Selection rules

- If no candidates are provided, `topRecommendedAction` is `null`.
- The selected action's `urgency`, `impact`, and `confidenceWeight` are clamped to 0–100 and rounded.
- `reversibilityWindowHours` and `ownerAvailability` are used only for ranking, not carried to the output.

### 8.4 Reason-code traceability

Every recommended action carries a `reasonCode` that is preserved through rendering and telemetry surfaces (ADR-0110 D-06). Reason codes are module-defined and MUST be documented per module.

### 8.5 Compound risk interaction

After initial selection, compound risk signals increase the selected recommendation's urgency per §6.4.

---

## 9. Admin Governance and Configuration

Admin governance is model behavior, not ad hoc component logic (ADR-0110 D-07). Configuration is validated by `validateHealthPulseAdminConfig()` in `health-pulse/governance/index.ts`.

### 9.1 Validation rules

| Rule | Path | Severity | Condition |
|---|---|---|---|
| Dimension weights sum | `weights` | Error | `weights.field + weights.time + weights.cost + weights.office` must equal 1.0 (within tolerance 0.000001) |
| Staleness threshold | `stalenessThresholdDays` | Error | Must be a positive integer |
| Metric staleness overrides | `metricStalenessOverrides.*` | Error | Each value must be a non-negative number |
| Manual influence percent | `manualEntryGovernance.maxManualInfluencePercent` | Error | Must be between 0 and 100 |
| Max override age | `manualEntryGovernance.maxOverrideAgeDays` | Error | Must be a positive integer |
| Cluster window | `officeHealthSuppression.duplicateClusterWindowHours` | Error | Must be a positive integer |
| Triage sort mode | `portfolioTriageDefaults.defaultSort` | Error | Must be one of: `deterioration-velocity`, `compound-risk-severity`, `unresolved-action-backlog` |
| Triage bucket | `portfolioTriageDefaults.defaultBucket` | Error | Must be one of: `attention-now`, `trending-down`, `data-quality-risk`, `recovering` |

### 9.2 Manual override governance

- **Approval-required keys:** Metrics listed in `approvalRequiredMetricKeys` require approval metadata before the override influences scoring.
- **Maximum manual influence:** `maxManualInfluencePercent` caps the fraction of active metrics that may be manual entries before a confidence penalty is triggered.
- **Override aging:** Overrides older than `maxOverrideAgeDays` are flagged via `isOverrideAged()` for review or replacement with system-derived values.

### 9.3 Storage

Admin config is stored in the SharePoint list title `HBC_HealthPulseAdminConfig` (constant: `HEALTH_PULSE_ADMIN_CONFIG_LIST_TITLE`).

### 9.4 Auth boundary

- `canEditHealthPulseMetric()` gates inline metric editing.
- `canManageHealthPulseAdminConfig()` gates admin panel access.
- `canViewHealthPulseApproval()` gates approval metadata visibility.

---

## 10. Office Health Suppression Policy

The Office dimension applies a deterministic suppression policy to prevent noisy low-impact signals from dominating health scoring (ADR-0110 D-07). Implemented in `health-pulse/computors/office-suppression/index.ts`.

### 10.1 Suppression pipeline

The pipeline runs two sequential filters:

1. **Low-impact filtering** (when `lowImpactSuppressionEnabled === true`): Remove metrics whose key contains `low-impact` or `minor-reminder` (case-insensitive).
2. **Duplicate cluster deduplication**: Group remaining metrics by cluster key (first 2 tokens of key split by `-`, `_`, or `:`). Within each cluster, retain only the most recently updated metric.

### 10.2 Severity-weighted overdue scoring

After suppression, retained metrics with overdue signals (key or label contains `overdue`) receive severity-weighted scores:

| Key contains | Severity weight source |
|---|---|
| `critical` | `severityWeights.critical` |
| `major` | `severityWeights.major` |
| Other | `severityWeights.minor` |

Score: `sum(metric.value × severityWeight)` for overdue metrics.

### 10.3 Summary output

`IOfficeSuppressionSummary`:

| Field | Type | Description |
|---|---|---|
| `originalCount` | `number` | Metric count before suppression |
| `retainedCount` | `number` | Metric count after suppression |
| `suppressedCount` | `number` | Number of suppressed metrics |
| `suppressedMetricKeys` | `string[]` | Keys of suppressed metrics |
| `severityWeightedOverdueScore` | `number` | Severity-weighted overdue score from retained metrics |

### 10.4 Confidence impact

When `suppressedCount > 0`, a confidence reason is generated: `"Office suppression removed N low-impact/duplicate signals."` This is informational, not a penalty — suppression improves signal quality.

---

## 11. Module Metric Contribution Expectations

Each always-on core module MUST contribute normalized metrics to the Health spine through deterministic integration adapters. This section expands P3-A3 §4.1.

### 11.1 Module contribution matrix

| Module | Required metric contributions | Health dimension |
|---|---|---|
| Financial | Budget variance, forecast accuracy, exposure level, cash flow status | Cost |
| Schedule | Milestone completion rate, schedule variance, critical path status | Time |
| Constraints | Open constraint count, overdue constraint count, delay impact total | Time + Office |
| Permits | Active permit count, pending inspection count, expiration risk count | Field + Office |
| Safety | Incident rate, open JHA count, checklist completion rate, orientation compliance | Field |
| Reports | Report currency (days since last approved PX Review / Owner Report) | Office |
| Work Queue | Project-scoped overdue item count, blocked item count | Office |

### 11.2 Metric shape requirements

- All metrics MUST use the `IHealthMetric` shape (§3.3).
- Every metric MUST carry `isStale`, `lastUpdatedAt`, and `isManualEntry` metadata (P3-A3 §4.2).
- Metric `value` is a score from 0–100 or `null` if no data is available.
- Metric `weight` MUST be classified as `leading` or `lagging`.

### 11.3 Scoring boundary

Modules MUST NOT directly compute health scores — the Health spine owns scoring (P3-A3 §4.3). Modules contribute raw metric values; the computation pipeline (§4) handles dimension and overall scoring.

### 11.4 Module-owned scope

Modules retain ownership of:
- Metric data sourcing and freshness
- Local thresholds and alerts
- Richer drill-down and detail views
- Module-internal audit logging

### 11.5 Recomputation trigger

Metric updates MUST trigger health recomputation through the governed recomputation pipeline (P3-A3 §4.2).

---

## 12. Rendering Contract

Health consumers MUST render health data consistently across surfaces. Display model utilities are implemented in `health-pulse/components/displayModel.ts`.

### 12.1 Complexity-tier variants

From P3-C2 §3.2:

| Tier | Rendering |
|---|---|
| `essential` | Overall status badge (on-track/watch/at-risk/critical) + single-line top recommended action |
| `standard` | Overall status + 4 dimension scores (Cost, Time, Field, Office) + trend indicators + top recommended action |
| `expert` | Full health dashboard: all dimension scores with leading/lagging breakdown, compound risk signals, explainability details, confidence tier, triage bucket |

### 12.2 Status visual mapping

`getStatusVariant()` maps `HealthStatus` to UI `StatusVariant`:

| HealthStatus | StatusVariant |
|---|---|
| `on-track` | `onTrack` |
| `watch` | `warning` |
| `at-risk` | `atRisk` |
| `critical` | `critical` |
| `data-pending` | `pending` |

### 12.3 Confidence rendering

- `getConfidenceVariant()`: `high` → `success`, `moderate` → `info`, `low` → `warning`, `unreliable` → `error`
- `getConfidenceLabel()`: `"Confidence: High"`, `"Confidence: Moderate"`, `"Confidence: Low"`, `"Confidence: Unreliable"`
- `isConfidenceCaution()`: Returns `true` for `low` or `unreliable` tiers — triggers visual caution indicators.

### 12.4 Dimension rendering

`getDimensionEntries()` returns dimensions in canonical order: `[cost, time, field, office]`.

### 12.5 Trend visualization

`buildTrendSeries()` generates a 13-point sparkline series from a base score and trend direction:
- `improving`: Upward trajectory adjustments (-8 to +8)
- `declining`: Downward trajectory adjustments (+8 to -8)
- `stable`: Flat oscillation adjustments (±1)

### 12.6 Portfolio table contract

`PortfolioHealthRow` provides the normalized row shape for portfolio health tables:

| Key fields | Purpose |
|---|---|
| `overallStatus`, `overallScore` | Primary health indicators |
| `confidenceTier`, `confidenceScore` | Data quality indicators |
| `dimensions` | Per-dimension score record |
| `compoundRiskActive`, `compoundRiskSeverity` | Compound risk state |
| `triageBucket`, `triageReasons` | Portfolio triage classification |
| `manualInfluenceHeavy` | Manual influence flag |
| `deteriorationVelocity`, `compoundRiskSeverityScore`, `unresolvedActionBacklog` | Sort mode values |

`filterPortfolioRows()` supports filtering by status, low-confidence, compound-risk-active, and manual-influence-heavy.

`sortPortfolioRows()` supports 3 sort modes: `deterioration-velocity`, `compound-risk-severity`, `unresolved-action-backlog`.

### 12.7 Mandatory rendering elements

Health surfaces MUST render:
- Overall status and score
- Four dimension scores with status indicators
- Confidence tier (with caution indicator when low/unreliable)
- Compound risk indicators when active
- Top recommended action (when available)
- Explainability access (drawer or inline)
- Triage bucket (portfolio context)

### 12.8 Freshness cues

Health surfaces MUST show computation timestamp (`computedAt`) as a freshness indicator. Stale-state cues MUST be consistent with the freshness/staleness trust vocabulary (P2-B3).

---

## 13. Integration Adapter Contracts

All integration adapters are deterministic pure-function projections with no side effects (ADR-0110 D-02). Implemented in `health-pulse/integrations/`.

### 13.1 BIC adapter

`projectHealthPulseToBicItem()` — projects `IProjectHealthPulse` to a BIC (Business Intelligence Card) next-move item for the project canvas.

### 13.2 Notification adapter

`projectHealthPulseToNotificationPayloads()` — projects pulse state changes to notification payloads for the notification-intelligence system.

### 13.3 Canvas adapter

`projectHealthPulseToCanvasTile()` — projects pulse to the canvas tile placement contract. Tile key: `project-health-pulse`, data source badge: `Hybrid`, default size: 6 columns × 1 row.

### 13.4 Auth adapter

Three auth boundary functions:
- `canEditHealthPulseMetric()` — gates inline metric editing based on role and project membership
- `canManageHealthPulseAdminConfig()` — gates admin configuration panel access
- `canViewHealthPulseApproval()` — gates approval metadata visibility

### 13.5 Complexity adapter

`projectHealthPulseByComplexity()` — provides complexity-tier-aware projections that match the 3-tier rendering model (essential/standard/expert).

### 13.6 Telemetry adapter

`projectHealthPulseToTelemetryPayload()` — maps pulse to the telemetry shape, preserving confidence, triage, compound-risk, and reason-code context (ADR-0110 D-09).

### 13.7 Versioned-record adapter

Three provenance and lineage functions:
- `projectManualOverrideToVersionedProvenance()` — tracks override provenance (who, when, reason, approval status)
- `projectMetricFreshness()` — computes metric freshness indicators for audit
- `projectPolicyChangeLineage()` — tracks admin policy change lineage

### 13.8 Reference integration surface

`IProjectHealthPulseReferenceIntegrations` aggregates all adapter functions into a single typed surface, constructed via `createProjectHealthPulseReferenceIntegrations()`. This provides a stable integration boundary for consumers.

---

## 14. Decision-Quality Telemetry Contract

Telemetry must preserve confidence, triage, compound-risk, and reason-code context with deterministic mapping (ADR-0110 D-09).

### 14.1 KPI inventory

From `IProjectHealthTelemetry`:

| KPI | Description | Current status |
|---|---|---|
| `interventionLeadTime` | Time between alert and intervention | Future KPI (null) |
| `falseAlarmRate` | Ratio of alerts that were false positives | Future KPI (null) |
| `preLagDetectionRate` | Ratio of issues detected before lagging indicators confirmed | Future KPI (null) |
| `actionAdoptionRate` | Whether a recommendation existed (1) or not (0) | Live |
| `portfolioReviewCycleTime` | Time between portfolio reviews | Future KPI (null) |
| `suppressionImpactRate` | Ratio of office metrics suppressed (suppressedCount / originalCount) | Live |

### 14.2 Context preservation

All telemetry payloads MUST include:
- Confidence tier and score at time of computation
- Triage bucket and sort score
- Compound risk signal codes and severities
- Reason codes from selected recommendations

### 14.3 Evolution governance

New telemetry KPIs or changes to existing KPI semantics require a contract update to this document.

---

## 15. Cross-Spine Integration Rules

### 15.1 Health → Activity

Health spine self-reports three event types into the Activity spine (P3-D1 §7.1, §8.7):

| Event type | Category | Significance | Trigger |
|---|---|---|---|
| `health.status-changed` | `status-change` | `notable` | Overall health status changed |
| `health.compound-risk-detected` | `alert` | `critical` | Compound risk signal detected |
| `health.action-recommended` | `record-change` | `notable` | New recommended action generated |

### 15.2 Activity → Health

Activity event volume and recency contribute to the Office health dimension via the health metric contribution path (P3-A3 §4.1). Activity-derived metrics follow the standard `IHealthMetric` shape.

### 15.3 Health → Work Queue

Health-derived recommended actions MAY generate work queue items for responsible parties. Work item creation flows through the standard Work Queue adapter registration (P3-A3 §5), not by direct Health-to-Work coupling.

### 15.4 Health → Reporting

Reports MAY include health pulse summary sections. Reporting consumes the `IProjectHealthPulse` snapshot at report generation time — it captures the computed state, not a live feed.

### 15.5 Boundary rule

Cross-spine integration uses each spine's public contract only. No direct internal coupling between spine implementations is permitted.

---

## 16. Cross-Lane Consistency

The following MUST remain consistent across both the PWA and SPFx lanes:

1. **Same data source.** Both lanes compute health from the same `IHealthMetric` inputs.
2. **Same computation.** Both lanes use the same deterministic `computeProjectHealthPulse()`.
3. **Same type system.** `IProjectHealthPulse` and all sub-types are shared.
4. **Same confidence semantics.** Confidence tiers and scores are identical.
5. **Same compound risk signals.** Same rules, same outputs.
6. **Same triage semantics.** Portfolio triage buckets and sort scores are identical.
7. **Same mandatory tile rendering.** The `project-health-pulse` mandatory tile (P3-C2 §3) shows the same data in both lanes.
8. **Lane-specific depth.** The PWA MAY offer richer drill-down (explainability drawer, admin panel, portfolio table); SPFx provides the standard health card.

---

## 17. Repo-Truth Reconciliation Notes

1. **`IProjectHealthPulse` type system — compliant**
   All 13 types/interfaces in `health-pulse/types/index.ts` are live, tested, and match this contract exactly. Classified as **compliant**.

2. **Deterministic computation pipeline — compliant**
   `computeProjectHealthPulse()` and all sub-computors implement the scoring, confidence, compound risk, and recommendation algorithms specified in §4–§8. Test coverage ≥95% (ADR-0110 D-10). Classified as **compliant**.

3. **Confidence model — compliant**
   `computePulseConfidence()` and `computeOverallPulseConfidence()` implement the 6-factor penalty formula and tier classification specified in §5. Classified as **compliant**.

4. **Compound risk evaluation — compliant**
   `evaluateCompoundRiskSignals()` implements all 3 deterministic patterns with severity classification, triage impact, and recommendation impact specified in §6. Classified as **compliant**.

5. **Office suppression — compliant**
   `applyOfficeSuppressionPolicy()` implements the 2-stage suppression pipeline (low-impact filtering, duplicate cluster deduplication) and severity-weighted overdue scoring specified in §10. Classified as **compliant**.

6. **Admin governance validation — compliant**
   `validateHealthPulseAdminConfig()` implements all validation rules in §9.1. Classified as **compliant**.

7. **Integration adapters — compliant**
   All 7 adapter families (BIC, notification, canvas, auth, complexity, telemetry, versioned-record) are implemented, tested, and deterministic. `IProjectHealthPulseReferenceIntegrations` aggregates the integration surface. Classified as **compliant**.

8. **Components — compliant**
   ProjectHealthPulseCard, ProjectHealthPulseDetail, HealthPulseAdminPanel, PortfolioHealthTable, ExplainabilityDrawer, HealthDimensionTab, and HealthMetricInlineEdit are all implemented with Storybook stories and test coverage. Classified as **compliant**.

9. **Hooks — compliant**
   `useProjectHealthPulse` and `useHealthPulseAdminConfig` are implemented with state store and query key management. Classified as **compliant**.

10. **Display model utilities — compliant**
    `displayModel.ts` implements all projection utilities specified in §12 (status variants, confidence variants, dimension entries, trend series, portfolio filtering/sorting, override aging). Classified as **compliant**.

11. **ADR-0110 — compliant**
    All 10 governance decisions (D-01 through D-10) are reflected in both implementation and this contract. Classified as **compliant**.

12. **Module metric contribution adapters — controlled evolution**
    Module-specific health metric contribution adapters (§11) exist as contract expectations. Per-module implementation is Phase 3 execution-time work. Each always-on core module must implement its metric adapter during the module delivery workstream. Classified as **controlled evolution**.

13. **Decision-quality telemetry KPIs — controlled evolution**
    `IProjectHealthTelemetry` type and scope markers are in place. `actionAdoptionRate` and `suppressionImpactRate` are live. Four remaining KPIs (`interventionLeadTime`, `falseAlarmRate`, `preLagDetectionRate`, `portfolioReviewCycleTime`) are future-scoped at `null`. Classified as **controlled evolution**.

14. **Cross-spine activity emission — requires extension**
    Health spine self-reporting of activity events (§15.1) requires implementation of the Health activity adapter once the Activity spine (P3-D1) is built. Classified as **requires extension**.

---

## 18. Acceptance Gate Reference

**Gate:** Shared spine gates — health component (Phase 3 plan §18.4)

| Field | Value |
|---|---|
| **Pass condition** | Health spine is fed by normalized module metric contributions; canvas tile, health detail, portfolio table, and reports consume the health pulse coherently |
| **Evidence required** | P3-D2 (this document), health-pulse computors/types/hooks/components at ≥95% coverage (ADR-0110 D-10), integration adapter tests, module metric contribution adapters, canvas tile rendering, cross-lane consistency verification |
| **Primary owner** | Platform / Core Services + Project Hub platform owner |

---

## 19. Policy Precedence

This contract establishes the **Health spine implementation specification** that downstream work must conform to:

| Deliverable | Relationship to P3-D2 |
|---|---|
| **ADR-0110** | Provides the 10 locked governance decisions that this contract codifies; breaking changes to pulse contracts, confidence/compound semantics, triage rules, governance policy behavior, or telemetry shape require a superseding ADR |
| **P3-A3 §4** — Health Spine Publication Contract | Provides the publication-level module metric contribution expectations that this contract expands |
| **P3-C2 §3** — Project Health Tile | Defines the mandatory `project-health-pulse` tile that consumes `IProjectHealthPulse` per the rendering contract in §12 |
| **P3-A1** — Project Registry | Provides `projectId` used in all health computations |
| **P3-A2** — Membership / Role Authority | Determines who can view/edit health metrics and manage admin configuration per the auth adapter in §13.4 |
| **P3-D1** — Project Activity Contract | Defines the Activity spine that Health publishes status-change/compound-risk/recommendation events into per §15.1 |
| **P3-E1** — Module Classification Matrix | Module health metric contribution expectations in §11 must align with module classifications |
| **P3-F1** — Reports Contract | Must consume health pulse via the reporting integration in §15.4 |
| **P3-H1** — Acceptance Checklist | Must include health spine gate evidence |
| **Any module implementation** | Must contribute `IHealthMetric` values per §11 expectations |

If a downstream deliverable conflicts with this contract, this contract takes precedence unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-22
**Governing Authority:** [Phase 3 Plan §8.4](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [ADR-0110](../../../adr/ADR-0110-project-health-pulse-multi-dimension-indicator.md)
