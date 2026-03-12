# PH7-SF-21: Project Health Pulse — Real-Time Multi-Dimension Project Health Indicator

**Priority Tier:** 2 — Application Layer (Project Hub core differentiator)
**Module:** Project Hub
**Interview Decision:** Q10 — Option B confirmed (locked decisions applied per 17-question interview)
**Mold Breaker Source:** UX-MB §1 (Role-Based Project Canvas) + UX-MB §4 (Universal Next Move) + UX-MB §6 (Confidence-Aware Intelligence); ux-mold-breaker.md Signature Solution #1 + #4; con-tech-ux-study §5/§6 (project health blind spots and dashboard intelligence gaps)

---

## Problem Solved

Project health in construction is multi-dimensional — a project can be on schedule but over budget; on budget but with critical field constraints blocking progress; financially healthy but with an office team accumulating unresolved action items. Single-dimension health indicators ("Green / Yellow / Red") collapse this complexity into a signal that loses actionability.

When a VP of Operations asks "How are our projects doing?", the honest answer requires four dimensions:
1. **Cost health** — Are we tracking within the approved budget and forecast?
2. **Time health** — Are we on track against the project schedule and milestones?
3. **Field health** — How many active constraints are blocking field progress?
4. **Office health** — Are BIC items being actioned on time, or are there accumulating overdue items?

Current Project Hub implementations (including Procore's dashboard) provide either a manual RAG status that someone types in a weekly report, or a single financial metric. Neither approach provides the multi-dimensional, automatically computed health picture that enables informed portfolio management.

The **Project Health Pulse** computes all four dimensions automatically from live project data — distinguishing between **leading indicators (early warnings, 70% weight)** and **lagging results (30% weight)** — and renders them as a compact, role-appropriate health indicator visible on the Project Canvas, in list views, and in portfolio dashboards.

The enhanced SF21 model also answers the friction-heavy questions users ask during real operations:
- **Why this status?**
- **What changed since the last snapshot?**
- **Is this score trustworthy, or degraded by stale/manual data?**
- **What matters most right now across the portfolio?**

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #1 (Role-Based Project Canvas) defines the VP-level canvas view as requiring a portfolio health perspective — the Project Health Pulse is the tile that makes this possible. Signature Solution #4 (Universal Next Move) grounds the Office Health dimension: BIC accountability data is the input, making health computation native to the platform rather than a separately maintained status field.

No construction platform provides automatically computed, multi-dimension project health that separates predictive leading indicators from backward-looking lagging results within each dimension, while also exposing confidence and explainability. The Project Health Pulse is the first implementation of this concept grounded in live platform data, with admin-configurable dimension weights, confidence-aware interpretation, and a prioritized top recommended action.

---

## Health Computation Model

### Per-Category Formula (All Four Dimensions)

Every dimension (Cost, Time, Field, Office) is computed as:

```
Category Score = (Leading Indicators × 0.70) + (Lagging Results × 0.30)
```

- **Leading Indicators (70%)** — forward-looking, predictive signals: early warnings, trajectory metrics, and rate-of-change data that indicate where the project is heading.
- **Lagging Results (30%)** — backward-looking, confirmatory signals: actual outcomes that have already occurred (overdue counts, overspend recorded, milestones missed).

This split ensures the Pulse is predominantly predictive rather than punitive — it surfaces risks before they become confirmed outcomes.

### Overall Composite Score

```
Overall Score = (Field × w_field) + (Time × w_time) + (Cost × w_cost) + (Office × w_office)
```

**Default weights** (admin-configurable):

| Dimension | Default Weight |
|-----------|---------------|
| Field     | 40%           |
| Time      | 30%           |
| Cost      | 15%           |
| Office    | 15%           |

Weights are stored as a single company-wide setting in the Admin feature (see [Admin Configuration](#admin-configuration) below). All four weights must sum to 100%; the Admin UI enforces this constraint. A change in weights recalculates all displayed composite scores in real time — historical snapshots are not retroactively altered.

### Pulse Confidence Model

Health scores are only trustworthy when the underlying data is trustworthy. The Pulse therefore computes confidence for both overall and dimension-level health.

**Pulse Confidence tiers:**
- `high`
- `moderate`
- `low`
- `unreliable`

Confidence drivers include:
- source freshness and staleness windows
- missing integrations / excluded metrics ratio
- manual overrides and override aging
- trend-history sufficiency
- contradiction with companion risk signals

Confidence is used for interpretation, prioritization, and governance visibility. It does not silently rewrite raw scores; it qualifies how strongly users should trust those scores.

### Cross-Dimension Compound Risk Logic

Dimensions are not independent in real projects. SF21 therefore applies compound-risk rules where interacting deterioration should escalate attention.

Examples:
- Time + Field deterioration multiplier
- Cost + Time correlation escalation
- Office backlog amplifying Field constraints

When compound risk is detected:
- a **Compound Risk Warning** is rendered
- explainability includes the interacting drivers
- portfolio triage prioritization is elevated
- top recommended action ranking increases urgency

### Status Bands (All Dimensions and Composite)

| Score Range | Status       | Meaning |
|-------------|--------------|---------|
| 85–100      | On Track     | No critical signals; leading indicators healthy |
| 65–84       | Watch        | 1–2 early-warning signals; monitoring required |
| 40–64       | At Risk      | Multiple warning signals or one confirmed lagging problem |
| 0–39        | Critical     | Significant confirmed problems; immediate action required |
| —           | Data Pending | Metric is stubbed with no value, stale beyond threshold, or confidence is unreliable |

Status bands remain deterministic, but operational interpretation must include Pulse Confidence and compound-risk context.

---

### Dimension 1: Cost Health

**Leading Indicators (70%)**
- Budget-burn rate vs. expected burn rate at current project phase
- Pending change order value as a percentage of remaining budget
- Forecast-at-completion trend (improving / stable / declining over last 4 weeks)

**Lagging Results (30%)**
- Actual spend-to-date vs. budget-to-date
- Approved change orders as a percentage of original contract value

**Forecast Confidence Signals (enriched)**
- Age of last forecast update
- Percent of exposure covered by committed costs
- Unresolved change-order aging

> **Integration note:** Cost data that originates from Procore financial modules is treated as Procore-stubbed in MVP where integration is incomplete. See [Manual Entry & Stale-Data Handling](#manual-entry--stale-data-handling) for exclusion, governance, and inline-edit rules.

---

### Dimension 2: Time Health

**Leading Indicators (70%)**
- Milestone completion rate for milestones due in the next 30 days
- Constraint count actively blocking scheduled work
- Float consumption rate (days of float consumed per week)

**Lagging Results (30%)**
- Count and severity of already-overdue milestones
- Average days-overdue across late milestones

**Execution Quality Signals (enriched)**
- Look-ahead reliability
- Schedule update quality and recency
- Short-interval plan completion rate

---

### Dimension 3: Field Health

**Leading Indicators (70%)**
- Open constraint count by severity (Minor / Major / Critical)
- Constraint aging rate (days open per open constraint)
- Rate of new constraints opened vs. resolved in the last 14 days

**Lagging Results (30%)**
- Count of overdue constraints (past SLA)
- Count of Critical constraints open longer than SLA threshold

**Production / execution signals (enriched)**
- Work-plan completion reliability
- Rework trend indicators
- Production throughput consistency

| Score  | Status   | Example |
|--------|----------|---------|
| 90–100 | On Track | 0–1 open constraints, none overdue |
| 70–89  | Watch    | 2–5 constraints, some aging |
| 40–69  | At Risk  | 6+ constraints or any Critical nearing SLA |
| 0–39   | Critical | Critical constraint overdue past SLA |

---

### Dimension 4: Office Health (BIC-Derived)

**Leading Indicators (70%)**
- Ratio of BIC items due in the next 7 days that have been acknowledged
- Count of Immediate-tier BIC items approaching (within 24h of) their SLA
- Acknowledgment completion rate for newly assigned items (last 14 days)

**Lagging Results (30%)**
- Ratio of on-time vs. overdue BIC actions completed on this project
- Count of Immediate-tier overdue items assigned to the project team

**Noise Suppression / prioritization logic (enriched)**
- Duplicate action clustering
- Suppression of low-impact reminders
- Severity-weighted overdue amplification

This dimension is unique to HB Intel — no other platform can compute it because no other platform has a BIC accountability layer tied to recommendation and ownership models.

---

## Interface Contract

```typescript
// In Project Hub domain types

export type HealthStatus =
  | 'on-track'
  | 'watch'
  | 'at-risk'
  | 'critical'
  | 'data-pending';

export type PulseConfidenceTier =
  | 'high'
  | 'moderate'
  | 'low'
  | 'unreliable';

export interface IManualOverrideMetadata {
  reason: string;             // required human justification
  enteredBy: string;          // user principal / id
  enteredAt: string;          // ISO 8601 timestamp
  requiresApproval?: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export interface IHealthMetric {
  key: string;                // machine identifier
  label: string;              // human-readable name
  value: number | null;       // null = excluded (no value or stale)
  isStale: boolean;           // true if last updated > configured threshold
  isManualEntry: boolean;     // true if value entered/overridden manually
  lastUpdatedAt: string | null;
  weight: 'leading' | 'lagging';
  manualOverride?: IManualOverrideMetadata | null;
}

export interface IPulseConfidence {
  tier: PulseConfidenceTier;
  score: number;              // 0-100 confidence index for display/sorting
  reasons: string[];          // e.g. stale data, missing feed, heavy manual influence
}

export interface ICompoundRiskSignal {
  code:
    | 'time-field-deterioration'
    | 'cost-time-correlation'
    | 'office-field-amplification'
    | 'custom';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  summary: string;
  affectedDimensions: Array<'cost' | 'time' | 'field' | 'office'>;
}

export interface ITopRecommendedAction {
  actionText: string;
  actionLink: string | null;
  reasonCode: string;
  owner: string | null;
  urgency: number;            // normalized ranking factor
  impact: number;             // normalized ranking factor
  confidenceWeight: number;   // confidence-aware prioritization modifier
}

export interface IHealthExplainability {
  whyThisStatus: string[];
  whatChanged: string[];
  topContributors: string[];
  whatMattersMost: string;    // best leverage move narrative
}

export interface IHealthDimension {
  score: number;              // 0-100; excluded metrics do not contribute
  status: HealthStatus;
  label: 'Cost' | 'Time' | 'Field' | 'Office';
  leadingScore: number;       // leading indicator sub-score
  laggingScore: number;       // lagging result sub-score
  metrics: IHealthMetric[];
  keyMetric: string;          // human-readable primary signal
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  hasExcludedMetrics: boolean;
  confidence: IPulseConfidence;
}

export interface IProjectHealthWeights {
  field: number;   // default 0.40
  time: number;    // default 0.30
  cost: number;    // default 0.15
  office: number;  // default 0.15
}

export interface IProjectHealthPulse {
  projectId: string;
  computedAt: string;
  weights: IProjectHealthWeights;
  overallScore: number;
  overallStatus: HealthStatus;
  overallConfidence: IPulseConfidence;
  dimensions: {
    cost: IHealthDimension;
    time: IHealthDimension;
    field: IHealthDimension;
    office: IHealthDimension;
  };
  compoundRisks: ICompoundRiskSignal[];
  topRecommendedAction: ITopRecommendedAction | null;
  explainability: IHealthExplainability;
}
```

---

## Admin Configuration

Company-wide dimension weights and Procore-stub SLA thresholds are stored as a single settings record in the Admin feature, not inside Project Hub. This ensures one source of truth across all projects.

### Settings Schema

```typescript
// Stored in Admin feature — company-wide singleton
export interface IHealthPulseAdminConfig {
  weights: IProjectHealthWeights; // must sum to 1.0
  stalenessThresholdDays: number; // default 14
  metricStalenessOverrides: Record<string, number>;
  manualEntryGovernance: {
    approvalRequiredMetricKeys: string[];
    maxManualInfluencePercent: number; // threshold for portfolio warning
    maxOverrideAgeDays: number;        // stale override visibility threshold
  };
  officeHealthSuppression: {
    lowImpactSuppressionEnabled: boolean;
    duplicateClusterWindowHours: number;
    severityWeights: Record<'minor' | 'major' | 'critical', number>;
  };
  portfolioTriageDefaults: {
    defaultBucket: 'attention-now' | 'trending-down' | 'data-quality-risk' | 'recovering';
    defaultSort: 'deterioration-velocity' | 'compound-risk-severity' | 'unresolved-action-backlog';
  };
}
```

### Admin UI Rules

- The weights editor enforces real-time validation: all four sliders must sum to exactly 100%. Saving is blocked otherwise.
- Changing weights immediately updates all currently displayed composite scores for active users (client-side recomputation from cached dimension scores).
- Historical snapshots record weights active at snapshot time; no retroactive recomputation.
- Only users with `hbc-admin` role (enforced via `@hbc/auth`) may access Health Pulse admin settings.
- Governance controls are auditable in admin logs (manual influence thresholds, suppression settings, triage defaults).

---

## Manual Entry & Stale-Data Handling

Procore-stubbed metrics — those sourced from APIs not yet integrated in MVP — are handled via inline editable fields in the detail panel rather than being silently zeroed/defaulted.

### Exclusion Rule

If a stubbed metric has:
- **No value** (never entered), or
- `lastUpdatedAt` older than `stalenessThresholdDays` (default 14 days),

that metric is **excluded** from score calculations. It does not contribute zero; remaining in-scope metrics are re-normalized within the dimension.

### Amber Banner (Contextual)

When one or more metrics are excluded in a dimension, an amber banner appears at the top of that dimension tab:

> **"1 metric excluded from Cost health — data is missing or stale. [Enter value ↗]"**

The banner links directly to the affected inline edit field.

### Inline Edit Behavior

- Inline edit fields appear only for Procore-stubbed metrics in the detail panel.
- Only users with `project-health:write` permission (via `@hbc/auth`) may edit values.
- Manual entry requires **justification reason + contributor identity + timestamp**.
- On save, `isManualEntry = true`, `lastUpdatedAt` is set, and override metadata is captured.
- Saved values persist to `HbcProjectHealthHistory` with `EntrySource = 'manual'`.
- Amber exclusion banner clears immediately after valid save.

### Manual-Entry Governance Visibility

To prevent manual-entry bias and score manipulation:
- manually entered metrics are visually marked in detail and portfolio views
- aging overrides are flagged when older than policy threshold
- projects with high manual influence surface in **Data Quality Risk** triage bucket
- optional approval is required for configured sensitive metrics
- override influence is visible in explainability ("what changed" / "what matters most")

### Compact Card Behavior

The compact card does not render the full amber banner. Instead, a compact amber indicator dot appears on affected dimension bars. Hover/tap text:

> "Some metrics excluded or manually influenced — tap for details."

---

## Component Architecture

```
apps/project-hub/src/features/health-pulse/
├── useProjectHealthPulse.ts               # assembles dimensions + confidence + compound risk
├── ProjectHealthPulseCard.tsx             # compact 2x2 card for Canvas tile
├── ProjectHealthPulseDetail.tsx           # tabbed detail panel (Cost | Time | Field | Office)
├── HealthDimensionTab.tsx                 # single tab with sparkline + metric rows
├── HealthMetricInlineEdit.tsx             # inline edit field for Procore-stubbed metrics
├── PortfolioHealthTable.tsx               # compact sortable table + triage mode
├── HealthPulseAdminPanel.tsx              # admin weights + governance/suppression controls
└── healthComputors/
    ├── costHealth.ts                      # leading 70% + lagging 30% + forecast confidence
    ├── timeHealth.ts                      # leading 70% + lagging 30% + execution quality
    ├── fieldHealth.ts                     # leading 70% + lagging 30% + production signals
    └── officeHealth.ts                    # BIC-derived + suppression/prioritization logic
```

---

## Component Specifications

### `ProjectHealthPulseCard` — Canvas Tile / Compact Display

```typescript
interface ProjectHealthPulseCardProps {
  projectId: string;
  pulse: IProjectHealthPulse;
  onOverallBadgeClick?: () => void;
  onDimensionBarClick?: (dimension: 'cost' | 'time' | 'field' | 'office') => void;
}
```

**Visual design principles:**
- Minimal, professional design — **no emojis**; Fluent UI icons only.
- Overall health badge is primary focal point; clicking opens detail panel.
- 2x2 dimension grid: **Cost | Time** / **Field | Office**.
- Each cell contains icon, label, bar, status dot, and confidence indicator.
- Amber manual/stale indicator appears when governance or freshness affects reliability.
- **Top Recommended Action** line appears when action is available and includes reason-code affordance.
- Trend arrows per dimension render when history has at least two snapshots.

**No inline editing occurs in compact card.**

---

### `ProjectHealthPulseDetail` — Tabbed Detail Panel

The detail panel uses tabs: **Cost | Time | Field | Office**.

```typescript
interface ProjectHealthPulseDetailProps {
  pulse: IProjectHealthPulse;
  initialTab?: 'cost' | 'time' | 'field' | 'office';
  onClose?: () => void;
}
```

**Per-tab layout (`HealthDimensionTab`):**
1. Inline sparkline (14-day trend).
2. Leading Indicators section (70%).
3. Lagging Results section (30%).
4. Amber exclusion/governance banner when needed.
5. "View 90-day history" expandable chart with manual-entry annotations.

**Explainability Drawer (first-class):**
- **Why this status**
- **What changed**
- **Top contributors**
- **What matters most** (best leverage move)

**Top Recommended Action:**
Rendered above tabs with owner, urgency context, and reason code. Powered by `@hbc/bic-next-move` + `@hbc/notification-intelligence` for MVP, with explicit upgrade path to `@hbc/ai-assist`.

---

### `PortfolioHealthTable` — Leadership / PX Dashboard View

Portfolio view renders as a compact sortable table with one row per project.

```typescript
interface PortfolioHealthTableProps {
  projectIds: string[];
  onProjectClick?: (projectId: string) => void;
}
```

**Visual behavior:**
- Columns: Project Name | Overall | Confidence | Cost | Time | Field | Office | Compound Risk | Top Recommended Action
- Row background maps to overall status band.
- Status dots used in dimension cells for density.
- Clicking a row opens full detail side panel.
- CSV export for leadership reporting.

**Portfolio Triage Mode (PX/VP):**
- Buckets: **Attention Now**, **Trending Down**, **Data Quality Risk**, **Recovering**.
- Sorting options: deterioration velocity, compound-risk severity, unresolved action backlog.
- Filters: At Risk/Critical only; low-confidence only; compound-risk only.

---

## Complexity Tier Behavior

Complexity tiers control **visual richness only**. All users keep full functional access to dimensions, detail panel, and role-permitted inline edits.

| Tier      | Visual Richness |
|-----------|------------------|
| Essential | Compact card, status dots, confidence badge, top action summary |
| Standard  | + Progress bars, trend arrows, sparkline, explainability summary |
| Expert    | + 90-day chart, compound-risk diagnostics, full explainability drawer, portfolio triage analytics |

PX/VP users are expected to use Portfolio Triage Mode in Standard/Expert contexts.

---

## Notifications & Escalation

Notifications remain **in-app only** for MVP. No email notifications.

### In-App Notification Channels

| Trigger | Channel | Powered By |
|---------|---------|------------|
| Any dimension degrades to **Critical** | Critical toast | `@hbc/bic-next-move` |
| Overall degrades to **At Risk** or worse | Amber canvas banner | `@hbc/notification-intelligence` |
| Overall degrades to **At Risk** or worse | My Work high-priority entry | `@hbc/notification-intelligence` |
| Overall improves to **Watch** or better | Informational My Work entry | `@hbc/notification-intelligence` |
| Metric excluded or governance risk rises | Amber banner in detail panel | component + governance policy |
| Compound risk activated | Elevated triage marker + notification emphasis | `@hbc/notification-intelligence` |

**Office Health suppression policy applies to reminder channels** to reduce noise and alert fatigue.

### Future Upgrade Path

Top Recommended Action and notification payloads are architected for future `@hbc/ai-assist` replacement. Keep explicit implementation comment at call site:

`// TODO(ai-assist): replace with @hbc/ai-assist when available`

---

## Health Score Persistence and History

Health scores are computed client-side from live project data on page load. To enable trend visualization and 90-day history, scores are persisted daily via Azure Functions timer job to `HbcProjectHealthHistory` SharePoint list.

| Column | Type | Description |
|--------|------|-------------|
| `HistoryId` | GUID | Primary key |
| `ProjectId` | Single line | Project record ID |
| `ComputedAt` | Date/Time | Snapshot date/time |
| `OverallScore` | Number | 0–100 |
| `OverallConfidenceTier` | Choice | `high/moderate/low/unreliable` |
| `CostScore` | Number | 0–100 |
| `TimeScore` | Number | 0–100 |
| `FieldScore` | Number | 0–100 |
| `OfficeScore` | Number | 0–100 |
| `CostLeading` | Number | Leading sub-score |
| `TimeLeading` | Number | Leading sub-score |
| `FieldLeading` | Number | Leading sub-score |
| `OfficeLeading` | Number | Leading sub-score |
| `CompoundRiskCodes` | Multi-line | JSON array of active compound-risk codes |
| `TopActionReasonCode` | Single line | Reason code for selected top action |
| `WeightsSnapshot` | JSON | Active `IProjectHealthWeights` at snapshot |
| `EntrySource` | Choice | `'auto'` or `'manual'` |
| `ManualMetricKey` | Single line | Populated for manual entry snapshots |
| `ManualOverrideMetadata` | Multi-line | JSON override reason/actor/time/approval |
| `ExcludedMetrics` | Multi-line | JSON array of excluded metric keys |

Manual entries triggering recomputation also write snapshots with `EntrySource = 'manual'` so trend charts and governance review remain auditable.

---

## Integration Points

| Package | Integration |
|---------|-------------|
| `@hbc/bic-next-move` | Office Health signals, action ownership, top recommended action, critical toasts |
| `@hbc/notification-intelligence` | Canvas banners, My Work entries, escalation emphasis, compound-risk prioritization |
| `@hbc/auth` | `project-health:write` for inline edit; `hbc-admin` for admin settings; approval permissions for sensitive overrides |
| `@hbc/project-canvas` | `ProjectHealthPulseTile` on project canvas |
| `@hbc/complexity` | Visual richness tiering and progressive disclosure |
| `@hbc/search` | Searchable status/confidence dimensions for risk discovery |
| Admin Feature | `IHealthPulseAdminConfig` source of truth |
| PH9b My Work Feed (§A) | At-Risk/Critical projects + triage tasks surfaced |
| Azure Functions (timer job) | Daily snapshot writer |
| `@hbc/versioned-record` | Snapshot and governance provenance trail |
| `@hbc/ai-assist` *(future)* | Upgrade path for top-action intelligence |

---

## Priority & ROI

**Priority:** P1 — Project Hub primary value-add for PM and VP roles.

**Estimated build effort:** 5–6 sprint-weeks (four computors with leading/lagging split, confidence + compound-risk logic, detail components, portfolio triage, admin controls, history job, governance telemetry).

**ROI:** Gives leaders an instant portfolio health view that currently requires manual weekly reporting; enables earlier intervention via predictive signals; improves trust through confidence and explainability; reduces Office Health noise through suppression/prioritization governance.

---

## Definition of Done

- [ ] `IProjectHealthPulse`, `IHealthDimension`, `IHealthMetric`, `IProjectHealthWeights` defined
- [ ] `PulseConfidenceTier`, `IPulseConfidence`, and confidence computation rules implemented
- [ ] `ICompoundRiskSignal` and compound-risk detection logic implemented
- [ ] Structured `ITopRecommendedAction` model implemented with reason code + ownership fields
- [ ] Explainability model implemented (`why this status`, `what changed`, `top contributors`, `what matters most`)
- [ ] `IHealthPulseAdminConfig` defined with weights + staleness + manual-governance + suppression + triage defaults
- [ ] `costHealth.ts` enriched with forecast-confidence signals
- [ ] `timeHealth.ts` enriched with execution-quality signals
- [ ] `fieldHealth.ts` enriched with production/execution signals
- [ ] `officeHealth.ts` includes suppression/prioritization logic
- [ ] `useProjectHealthPulse` assembles dimensions, confidence, compound risk, top action, explainability
- [ ] `ProjectHealthPulseCard` shows confidence and top action reason-code affordance
- [ ] `ProjectHealthPulseDetail` provides explainability drawer and governance visibility
- [ ] `PortfolioHealthTable` supports triage buckets/sorts and data-quality-risk filtering
- [ ] Inline edit requires justification + contributor + timestamp and records override metadata
- [ ] Manual-entry governance flags aging overrides and high manual influence projects
- [ ] `HbcProjectHealthHistory` contains confidence/compound-risk/top-action/governance columns
- [ ] Azure daily snapshots write `EntrySource = 'auto'`; manual save writes `EntrySource = 'manual'`
- [ ] In-app notification flows include compound-risk emphasis and Office suppression policy
- [ ] Telemetry instrumentation includes intervention lead time, false alarm rate, pre-lag detection rate, action adoption rate, portfolio review cycle time
- [ ] Unit tests >= 95% on computors, confidence, compound risk, exclusion logic, weight application
- [ ] Storybook states include confidence tiers, explainability states, manual-governance indicators, and triage modes

---

## ADR Reference

Create `docs/architecture/adr/ADR-0110-project-health-pulse.md` documenting:
- four dimensions (Cost/Time/Field/Office) and rationale
- 70% leading / 30% lagging computation model
- admin-configurable composite weights (default 40/30/15/15)
- Pulse Confidence model and interpretation semantics
- cross-dimension compound-risk logic and escalation behavior
- top recommended action prioritization model with reason codes
- manual-entry governance (justification/identity/timestamp/approval visibility)
- Office Health suppression/prioritization strategy
- explainability drawer contract (why status / what changed / what matters most)
- portfolio triage mode model for PX/VP users
- in-app-only notification strategy and suppression rules
- history schema additions for governance, confidence, and action-reason traceability
- complexity-tier visual-richness policy (functional parity retained)
