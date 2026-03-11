# PH7-SF-21: Project Health Pulse — Real-Time Multi-Dimension Project Health Indicator

**Priority Tier:** 2 — Application Layer (Project Hub core differentiator)
**Module:** Project Hub
**Interview Decision:** Q10 — Option B confirmed (locked decisions applied per 17-question interview)
**Mold Breaker Source:** UX-MB §1 (Role-Based Project Canvas) + UX-MB §4 (Universal Next Move); ux-mold-breaker.md Signature Solution #1 + #4; con-tech-ux-study §6 (Project dashboard intelligence gaps)

---

## Problem Solved

Project health in construction is multi-dimensional — a project can be on schedule but over budget; on budget but with critical field constraints blocking progress; financially healthy but with an office team accumulating unresolved action items. Single-dimension health indicators ("Green / Yellow / Red") collapse this complexity into a signal that loses all actionability.

When a VP of Operations asks "How are our projects doing?", the honest answer requires four dimensions:
1. **Cost health** — Are we tracking within the approved budget and forecast?
2. **Time health** — Are we on track against the project schedule and milestones?
3. **Field health** — How many active constraints are blocking field progress?
4. **Office health** — Are BIC items being actioned on time, or are there accumulating overdue items?

Current Project Hub implementations (including Procore's dashboard) provide either a manual RAG status that someone types in a weekly report, or a single financial metric. Neither approach provides the multi-dimensional, automatically computed health picture that enables informed portfolio management.

The **Project Health Pulse** computes all four dimensions automatically from live project data — distinguishing between **leading indicators (early warnings, 70 % weight)** and **lagging results (30 % weight)** — and renders them as a compact, role-appropriate health indicator visible on the Project Canvas, in list views, and in portfolio dashboards.

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #1 (Role-Based Project Canvas) defines the VP-level canvas view as requiring a portfolio health perspective — the Project Health Pulse is the tile that makes this possible. Signature Solution #4 (Universal Next Move) grounds the Office Health dimension: BIC accountability data is the input, making health computation native to the platform rather than a separately maintained status field.

No construction platform provides automatically computed, multi-dimension project health that separates predictive leading indicators from backward-looking lagging results within each dimension. The Project Health Pulse is the first implementation of this concept grounded in live platform data, with admin-configurable dimension weights and a single intelligent next-move recommendation.

---

## Health Computation Model

### Per-Category Formula (All Four Dimensions)

Every dimension (Cost, Time, Field, Office) is computed as:

```
Category Score = (Leading Indicators × 0.70) + (Lagging Results × 0.30)
```

- **Leading Indicators (70 %)** — forward-looking, predictive signals: early warnings, trajectory metrics, and rate-of-change data that indicate where the project is heading.
- **Lagging Results (30 %)** — backward-looking, confirmatory signals: actual outcomes that have already occurred (overdue counts, overspend recorded, milestones missed).

This split ensures the Pulse is predominantly predictive rather than punitive — it surfaces risks before they become problems.

### Overall Composite Score

```
Overall Score = (Field × w_field) + (Time × w_time) + (Cost × w_cost) + (Office × w_office)
```

**Default weights** (admin-configurable):

| Dimension | Default Weight |
|-----------|---------------|
| Field     | 40 %          |
| Time      | 30 %          |
| Cost      | 15 %          |
| Office    | 15 %          |

Weights are stored as a single company-wide setting in the Admin feature (see [Admin Configuration](#admin-configuration) below). All four weights must sum to 100 %; the Admin UI enforces this constraint. A change in weights recalculates all displayed composite scores in real time — no historical snapshots are retroactively altered.

### Status Bands (All Dimensions and Composite)

| Score Range | Status      | Meaning                                                           |
|-------------|-------------|-------------------------------------------------------------------|
| 85–100      | On Track    | No critical signals; all leading indicators healthy               |
| 65–84       | Watch       | 1–2 early-warning signals; monitoring required                    |
| 40–64       | At Risk     | Multiple warning signals or one confirmed lagging problem         |
| 0–39        | Critical    | Significant confirmed problems; immediate PM action required      |
| —           | Data Pending| Metric is Procore-stubbed with no value or value >14 days stale   |

---

### Dimension 1: Cost Health

**Leading Indicators (70 %)**
- Budget-burn rate vs. expected burn rate at current project phase
- Pending change order value as a percentage of remaining budget
- Forecast-at-completion trend (improving / stable / declining over last 4 weeks)

**Lagging Results (30 %)**
- Actual spend-to-date vs. budget-to-date
- Approved change orders as a percentage of original contract value

> **Integration note:** Cost data that originates from Procore financial modules is treated as a Procore-stubbed metric in the MVP. See [Manual Entry & Stale-Data Handling](#manual-entry--stale-data-handling) for exclusion and inline-edit rules.

---

### Dimension 2: Time Health

**Leading Indicators (70 %)**
- Milestone completion rate for milestones due in the next 30 days
- Constraint count actively blocking scheduled work
- Float consumption rate (days of float consumed per week)

**Lagging Results (30 %)**
- Count and severity of already-overdue milestones
- Average days-overdue across late milestones

---

### Dimension 3: Field Health

**Leading Indicators (70 %)**
- Open constraint count by severity (Minor / Major / Critical)
- Constraint aging rate (days open per open constraint)
- Rate of new constraints opened vs. resolved in the last 14 days

**Lagging Results (30 %)**
- Count of overdue constraints (past SLA)
- Count of Critical constraints open longer than SLA threshold

| Score  | Status     | Example                                              |
|--------|------------|------------------------------------------------------|
| 90–100 | On Track   | 0–1 open constraints, none overdue                   |
| 70–89  | Watch      | 2–5 constraints, some aging                          |
| 40–69  | At Risk    | 6+ constraints or any Critical nearing SLA           |
| 0–39   | Critical   | Critical constraint overdue past SLA                 |

---

### Dimension 4: Office Health (BIC-Derived)

**Leading Indicators (70 %)**
- Ratio of BIC items due in the next 7 days that have been acknowledged
- Count of Immediate-tier BIC items approaching (within 24 h of) their SLA
- Acknowledgment completion rate for newly assigned items (last 14 days)

**Lagging Results (30 %)**
- Ratio of on-time vs. overdue BIC actions completed on this project
- Count of Immediate-tier overdue items assigned to the project team

This dimension is unique to HB Intel — no other platform can compute it because no other platform has a BIC accountability layer.

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

export interface IHealthMetric {
  key: string;              // machine identifier
  label: string;            // human-readable name
  value: number | null;     // null = excluded (no value or stale)
  isStale: boolean;         // true if last updated >14 days ago
  isManualEntry: boolean;   // true if value was entered via inline edit
  lastUpdatedAt: string | null; // ISO 8601 or null
  weight: 'leading' | 'lagging';
}

export interface IHealthDimension {
  score: number;            // 0–100; excluded metrics do not contribute
  status: HealthStatus;
  label: 'Cost' | 'Time' | 'Field' | 'Office';
  leadingScore: number;     // leading indicator sub-score (0–100)
  laggingScore: number;     // lagging result sub-score (0–100)
  metrics: IHealthMetric[]; // all metrics for this dimension
  keyMetric: string;        // human-readable primary signal: "3 overdue milestones"
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  hasExcludedMetrics: boolean; // true if any metric is null or stale
}

export interface IProjectHealthWeights {
  field: number;   // default 0.40
  time: number;    // default 0.30
  cost: number;    // default 0.15
  office: number;  // default 0.15
}

export interface IProjectHealthPulse {
  projectId: string;
  computedAt: string;          // ISO 8601
  weights: IProjectHealthWeights; // active weights at time of computation
  /** Overall composite score (admin-weighted average of dimensions) */
  overallScore: number;
  overallStatus: HealthStatus;
  dimensions: {
    cost: IHealthDimension;
    time: IHealthDimension;
    field: IHealthDimension;
    office: IHealthDimension;
  };
  /** Most urgent action the PM should take right now (bic-next-move powered) */
  topRecommendedAction: string | null;
  topRecommendedActionLink: string | null; // deep link to the source item
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
  stalenessThresholdDays: number; // default 14; metric excluded if lastUpdatedAt older than this
  /** Per-metric overrides for staleness (keyed by IHealthMetric.key) */
  metricStalenessOverrides: Record<string, number>;
}
```

### Admin UI Rules

- The weights editor enforces real-time validation: all four sliders must sum to exactly 100 %. Saving is blocked if they do not.
- Changing weights immediately updates all currently displayed composite scores for all active users (client-side recalculation from cached dimension scores).
- Historical snapshots record the weights active at the time of each snapshot; they are not retroactively recalculated.
- Only users with the `hbc-admin` role (enforced via `@hbc/auth`) may access the Health Pulse admin settings panel.

---

## Manual Entry & Stale-Data Handling

Procore-stubbed metrics — those sourced from Procore APIs not yet integrated in the MVP — are handled via **inline editable fields** in the detail panel rather than being silently zeroed or defaulted.

### Exclusion Rule

If a stubbed metric has:
- **No value** (never been entered), OR
- A `lastUpdatedAt` timestamp that is **older than the `stalenessThresholdDays` setting** (default 14 days),

then that metric is **completely excluded** from all score calculations. It does not contribute 0 — it is as if it does not exist, and the remaining metrics within its dimension are re-normalized to 100 % weight among themselves.

### Amber Banner (Contextual)

When one or more metrics have been excluded in a dimension, an **amber contextual banner** appears at the top of that dimension's tab in the detail panel:

> **"1 metric excluded from Cost health — data is missing or more than 14 days old. [Enter value ↗]"**

The banner includes a direct link that scrolls to the affected inline edit field.

### Inline Edit Behavior

- Inline edit fields appear only for Procore-stubbed metrics in the detail panel.
- Only users with the `project-health:write` permission (enforced via `@hbc/auth`) may edit values.
- On save, `isManualEntry` is set to `true` and `lastUpdatedAt` is recorded as the current timestamp.
- Saved values are persisted to the `HbcProjectHealthHistory` SharePoint list with `EntrySource = 'manual'`.
- The amber banner for that metric clears immediately upon successful save.

### Compact Card Behavior

The compact card does **not** show the amber banner directly; instead, a small amber indicator dot appears on the affected dimension bar to signal that data is incomplete. Hovering the dot (desktop) or tapping it (mobile) shows a tooltip: "Some metrics excluded — tap for details."

---

## Component Architecture

```
apps/project-hub/src/features/health-pulse/
├── useProjectHealthPulse.ts               # assembles all four dimensions; reads admin weights
├── ProjectHealthPulseCard.tsx             # compact 2×2 card for Canvas tile
├── ProjectHealthPulseDetail.tsx           # tabbed detail panel (Cost | Time | Field | Office)
├── HealthDimensionTab.tsx                 # single dimension tab with sparkline + metric rows
├── HealthMetricInlineEdit.tsx             # inline edit field for Procore-stubbed metrics
├── PortfolioHealthTable.tsx               # compact sortable table — Leadership/PX view
├── HealthPulseAdminPanel.tsx              # admin weight configuration (admin role only)
└── healthComputors/
    ├── costHealth.ts                      # leading 70 % + lagging 30 %
    ├── timeHealth.ts                      # leading 70 % + lagging 30 %
    ├── fieldHealth.ts                     # leading 70 % + lagging 30 %
    └── officeHealth.ts                    # BIC-derived; leading 70 % + lagging 30 %
```

---

## Component Specifications

### `ProjectHealthPulseCard` — Canvas Tile / Compact Display

```typescript
interface ProjectHealthPulseCardProps {
  projectId: string;
  pulse: IProjectHealthPulse;
  onOverallBadgeClick?: () => void;        // opens full detail panel
  onDimensionBarClick?: (dimension: 'cost' | 'time' | 'field' | 'office') => void; // scrolls to that tab
}
```

**Visual design principles:**
- Minimal, professional design — **no emojis**; Fluent UI icons only throughout the card.
- Overall health badge (color-coded status label) is the primary focal point — clicking it opens the full detail panel.
- 2×2 dimension grid: **Cost | Time** (top row) / **Field | Office** (bottom row).
- Each cell contains: Fluent UI dimension icon, dimension label, progress bar (colored by status), status dot, and a stale-data amber indicator dot when applicable.
- A single **Top Recommended Action** line appears below the grid when `topRecommendedAction` is non-null. It uses amber text for Watch status and red for At Risk / Critical.
- Clicking an individual dimension bar scrolls the detail panel to that dimension's tab (if detail panel is open) or opens the detail panel at that tab.
- Trend arrows per dimension are rendered when history data is available (requires at least 2 snapshots).

**No inline editing occurs in the compact card.** All editing is in the detail panel.

---

### `ProjectHealthPulseDetail` — Tabbed Detail Panel

The detail panel uses a **tabbed layout** with four tabs: **Cost | Time | Field | Office** (in that order).

```typescript
interface ProjectHealthPulseDetailProps {
  pulse: IProjectHealthPulse;
  initialTab?: 'cost' | 'time' | 'field' | 'office';
  onClose?: () => void;
}
```

**Per-tab layout (HealthDimensionTab):**

1. **Inline sparkline** — 14-day score trend line rendered at the top of the tab, above metric rows.
2. **Leading Indicators section** — labelled "Leading Indicators (Early Warnings — 70 %)" — lists each leading metric with its current value, last-updated date, and inline edit field (if Procore-stubbed).
3. **Lagging Results section** — labelled "Lagging Results (30 %)" — lists each lagging metric identically.
4. **Amber banner** — appears below the section header of the affected section when any metric is excluded.
5. **"View 90-day history" expandable chart** — collapsed by default; expands to a full 90-day score chart with dimension-level and sub-score (leading/lagging) overlays. This chart also displays manual-entry events as annotated markers.

**Top Recommended Action:**
Rendered prominently above the tab strip with a CTA link to the source item. Powered by `@hbc/bic-next-move` + `@hbc/notification-intelligence` for MVP (see [Notifications & Escalation](#notifications--escalation)). A clear comment in the component marks the upgrade path to `@hbc/ai-assist` for a future phase.

---

### `PortfolioHealthTable` — Leadership / PX Dashboard View

The portfolio view renders as a **compact sortable table** — one row per project — rather than a card grid.

```typescript
interface PortfolioHealthTableProps {
  projectIds: string[];
  onProjectClick?: (projectId: string) => void;
}
```

**Visual behavior:**
- Columns: Project Name | Overall | Cost | Time | Field | Office | Top Recommended Action
- Row background color matches the project's overall health status band.
- Each column header is sortable; default sort is Overall Status (Critical → Watch → At Risk → On Track).
- Filter control: show only At-Risk / Critical rows.
- Status dots (no progress bars) used in each dimension cell to preserve horizontal density.
- Clicking a row opens the full `ProjectHealthPulseDetail` panel for that project in a side panel.
- Export to CSV for leadership reporting.

---

## Complexity Tier Behavior

Complexity tiers control **visual richness only**. All users have full functional access to all four dimensions, the detail panel, the inline edit fields (subject to role permissions), and the portfolio table regardless of tier.

| Tier     | Visual Richness                                                              |
|----------|------------------------------------------------------------------------------|
| Essential | Compact card with 2×2 grid, status dots, overall badge, Top Recommended Action line |
| Standard  | + Progress bars, trend arrows, sparkline in detail tabs                      |
| Expert    | + 90-day history chart, leading/lagging sub-score display, manual-entry annotations |

---

## Notifications & Escalation

Notifications are **strictly in-app only** for the MVP. No email notifications are generated.

### In-App Notification Channels

| Trigger                                       | Channel                                   | Powered By                    |
|-----------------------------------------------|-------------------------------------------|-------------------------------|
| Any dimension degrades to **Critical**        | Critical toast (top of screen)            | `@hbc/bic-next-move`          |
| Overall status degrades to **At Risk** or worse | Amber banner on Project Canvas tile     | `@hbc/notification-intelligence` |
| Overall status degrades to **At Risk** or worse | Entry in My Work feed (high priority) | `@hbc/notification-intelligence` |
| Overall status improves to **Watch** or better| Informational entry in My Work feed       | `@hbc/notification-intelligence` |
| A metric is excluded (stale or missing)       | Amber banner on detail panel tab          | Component-level (no external package) |

### Future Upgrade Path

The Top Recommended Action field and notification payloads are architected to accept a drop-in replacement of `@hbc/bic-next-move` intelligence with `@hbc/ai-assist` in a future phase. The component code includes a clearly labelled `// TODO(ai-assist): replace with @hbc/ai-assist when available` comment at the call site.

---

## Health Score Persistence and History

Health scores are computed client-side from live project data on page load. To enable trend visualization and the 90-day history chart, scores are persisted daily via an Azure Functions timer job to the `HbcProjectHealthHistory` SharePoint list.

| Column             | Type        | Description                                              |
|--------------------|-------------|----------------------------------------------------------|
| `HistoryId`        | GUID        | Primary key                                              |
| `ProjectId`        | Single line | Project record ID                                        |
| `ComputedAt`       | Date/Time   | Snapshot date (daily)                                    |
| `OverallScore`     | Number      | 0–100                                                    |
| `CostScore`        | Number      | 0–100                                                    |
| `TimeScore`        | Number      | 0–100                                                    |
| `FieldScore`       | Number      | 0–100                                                    |
| `OfficeScore`      | Number      | 0–100                                                    |
| `CostLeading`      | Number      | Leading indicator sub-score for Cost                     |
| `TimeLeading`      | Number      | Leading indicator sub-score for Time                     |
| `FieldLeading`     | Number      | Leading indicator sub-score for Field                    |
| `OfficeLeading`    | Number      | Leading indicator sub-score for Office                   |
| `WeightsSnapshot`  | JSON        | Active `IProjectHealthWeights` at time of snapshot       |
| `EntrySource`      | Choice      | `'auto'` (timer job) or `'manual'` (inline edit trigger) |
| `ManualMetricKey`  | Single line | Populated when `EntrySource = 'manual'`; which metric was edited |
| `ExcludedMetrics`  | Multi-line  | JSON array of metric keys excluded from this snapshot    |

Manual entries that trigger a re-computation also write a snapshot with `EntrySource = 'manual'` so the 90-day history chart can annotate the event accurately.

---

## Integration Points

| Package                        | Integration                                                                                                     |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------|
| `@hbc/bic-next-move`           | Office Health dimension sourced from BIC state (overdue items, acknowledgment rates); powers Top Recommended Action and Critical toast notifications |
| `@hbc/notification-intelligence` | Drives amber banner on Canvas tile, My Work feed entries, and status-change notifications (in-app only)        |
| `@hbc/auth`                    | Enforces `project-health:write` permission for inline edit of Procore-stubbed metrics; enforces `hbc-admin` role for Admin Panel access |
| `@hbc/project-canvas`          | `ProjectHealthPulseTile` is a primary canvas tile for PM and VP roles                                          |
| `@hbc/complexity`              | Determines visual richness tier (Essential / Standard / Expert); all tiers receive full functional access        |
| `@hbc/search`                  | `overallStatus`, `fieldStatus`, `timeStatus` are searchable dimensions for finding at-risk projects             |
| Admin Feature                  | `IHealthPulseAdminConfig` (dimension weights + staleness threshold) stored and served from Admin feature        |
| PH9b My Work Feed (§A)         | At-Risk and Critical projects appear as high-priority feed items for PM                                         |
| Azure Functions (timer job)    | Daily snapshot writer to `HbcProjectHealthHistory` SharePoint list                                              |
| `@hbc/ai-assist` *(future)*    | Upgrade path for Top Recommended Action; replace `@hbc/bic-next-move` call site in future phase                |

---

## Priority & ROI

**Priority:** P1 — Project Hub's primary value-add for PM and VP roles; without it, Project Hub is another project list with no health intelligence.

**Estimated build effort:** 5–6 sprint-weeks (four health computors with leading/lagging split, four tabbed detail components, compact card, portfolio table, admin panel, daily history job, manual entry + stale-data handling, inline sparklines, 90-day history chart).

**ROI:** Gives VPs an instant portfolio health view that currently requires manual weekly status reports; makes health computation automatic rather than opinion-based; creates the first BIC-grounded office health dimension in the industry; separates predictive leading signals from confirmatory lagging results so PMs can intervene before problems are confirmed.

---

## Definition of Done

- [ ] `IProjectHealthPulse`, `IHealthDimension`, `IHealthMetric`, and `IProjectHealthWeights` types defined
- [ ] `IHealthPulseAdminConfig` schema defined and stored in Admin feature; default weights (40/30/15/15) seeded
- [ ] `costHealth.ts`: leading 70 % + lagging 30 % computation; Procore-stub exclusion logic
- [ ] `timeHealth.ts`: leading 70 % + lagging 30 % computation
- [ ] `fieldHealth.ts`: leading 70 % + lagging 30 % computation
- [ ] `officeHealth.ts`: BIC-derived; leading 70 % + lagging 30 % computation
- [ ] `useProjectHealthPulse`: assembles all four dimensions; applies admin weights; excludes stale/null metrics
- [ ] `ProjectHealthPulseCard`: 2×2 grid, Fluent UI icons only (no emojis), progress bars, status dots, overall badge, single Top Recommended Action line, amber indicator dot for excluded metrics
- [ ] Click behavior: overall badge → opens full detail; individual dimension bar → scrolls to that tab in detail panel
- [ ] `ProjectHealthPulseDetail`: tabbed layout (Cost | Time | Field | Office), sparkline per tab, leading/lagging sections, amber banner, "View 90-day history" expandable chart with manual-entry annotations
- [ ] `HealthMetricInlineEdit`: inline edit field for Procore-stubbed metrics; `@hbc/auth` permission gate; `isManualEntry` flag written on save
- [ ] `PortfolioHealthTable`: compact sortable table (one row per project), status dots, CSV export
- [ ] `HealthPulseAdminPanel`: weight sliders with 100 % validation; `hbc-admin` role gate
- [ ] `HbcProjectHealthHistory` SharePoint list: all columns including `EntrySource`, `ManualMetricKey`, `ExcludedMetrics`, `WeightsSnapshot`, leading sub-scores
- [ ] Azure Functions daily snapshot job writes `EntrySource = 'auto'` rows; manual save triggers `EntrySource = 'manual'` row
- [ ] Amber banner rendered in detail panel when any metric is excluded; banner links to inline edit field
- [ ] Compact card amber indicator dot rendered when any metric is excluded in that dimension
- [ ] `@hbc/project-canvas` tile integration: `ProjectHealthPulseTile` implemented
- [ ] `@hbc/bic-next-move` integration: Office Health dimension + Top Recommended Action + Critical toast
- [ ] `@hbc/notification-intelligence`: At-Risk/Critical → amber banner + My Work feed entry; Critical → toast; recovery → informational feed entry; no email notifications in MVP
- [ ] `@hbc/auth` integration: `project-health:write` for inline edit; `hbc-admin` for Admin Panel
- [ ] `@hbc/complexity` integration: all three tiers; functional parity confirmed across tiers
- [ ] `// TODO(ai-assist): replace with @hbc/ai-assist when available` comment present at bic-next-move call site in Top Recommended Action
- [ ] Unit tests ≥ 95 % on all four health computor functions, exclusion logic, and weight application
- [ ] Unit tests: weight-sum validation in admin config enforced
- [ ] Storybook: all health status states in card + detail + portfolio table; excluded-metric amber states; manual-entry state

---

## ADR Reference

Create `docs/architecture/adr/0030-project-health-pulse-model.md` documenting:
- The four renamed dimensions (Cost, Time, Field, Office) and their rationale
- The 70 % leading / 30 % lagging computation model and why predictive weight is higher
- Admin-configurable composite weights (default 40/30/15/15) and the single-company-wide-setting decision
- Procore-stubbed metric exclusion rule (null or >14 days stale = completely excluded, not zeroed)
- Inline edit authorization model via `@hbc/auth`
- Compact card design decisions (Fluent UI icons only, no emojis; click-to-tab navigation)
- Detail panel tabbed layout and 90-day history chart
- `@hbc/bic-next-move` + `@hbc/notification-intelligence` for MVP Top Recommended Action, with explicit `@hbc/ai-assist` upgrade path
- In-app-only notification strategy (amber banner + My Work feed + Critical toast; no email in MVP)
- History list schema additions (manual entry, excluded metrics, weights snapshot, leading sub-scores)
- Complexity-tier visual-richness-only policy (all tiers = full functional access)
