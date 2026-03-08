# PH7-SF-21: Project Health Pulse — Real-Time Multi-Dimension Project Health Indicator

**Priority Tier:** 2 — Application Layer (Project Hub core differentiator)
**Module:** Project Hub
**Interview Decision:** Q10 — Option B confirmed
**Mold Breaker Source:** UX-MB §1 (Role-Based Project Canvas) + UX-MB §4 (Universal Next Move); ux-mold-breaker.md Signature Solution #1 + #4; con-tech-ux-study §6 (Project dashboard intelligence gaps)

---

## Problem Solved

Project health in construction is multi-dimensional — a project can be on schedule but over budget; on budget but with critical safety constraints; financially healthy but with a team about to turn over. Single-dimension health indicators ("Green / Yellow / Red") collapse this complexity into a signal that loses all actionability.

When a VP of Operations asks "How are our projects doing?", the honest answer requires four dimensions:
1. **Schedule health** — Are we on track against the project schedule?
2. **Budget health** — Are we tracking within the approved budget?
3. **Constraint health** — How many active constraints are blocking progress?
4. **Team health** — Are BIC items being actioned on time, or are there accumulating overdue items?

Current Project Hub implementations (including Procore's dashboard) provide either a manual RAG status that someone types in a weekly report, or a single financial metric. Neither approach provides the multi-dimensional, automatically computed health picture that enables informed portfolio management.

The **Project Health Pulse** computes all four dimensions automatically from live project data and renders them as a compact, role-appropriate health indicator visible on the Project Canvas, in list views, and in portfolio dashboards.

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #1 (Role-Based Project Canvas) defines the VP-level canvas view as requiring a portfolio health perspective — the Project Health Pulse is the tile that makes this possible. Signature Solution #4 (Universal Next Move) grounds the Team Health dimension: BIC accountability data is the input, making health computation native to the platform rather than a separately maintained status field.

No construction platform provides automatically computed, multi-dimension project health. The Project Health Pulse is the first implementation of this concept grounded in live platform data.

---

## Health Computation Model

### Dimension 1: Schedule Health

```
Schedule Health = f(milestone completion rate, days-overdue-per-milestone, constraint count)
```

| Score Range | Status | Meaning |
|---|---|---|
| 85–100 | 🟢 On Track | No overdue milestones; constraints resolved within SLA |
| 65–84 | 🟡 Watch | 1–2 overdue milestones; some constraints aging |
| 40–64 | 🟠 At Risk | Multiple overdue milestones; growing constraint backlog |
| 0–39 | 🔴 Critical | Significant milestone slippage; unresolved blocking constraints |

### Dimension 2: Budget Health

```
Budget Health = f(spend-to-date vs. budget, forecast-at-completion variance, approved change orders)
```

Note: Budget data integration depends on Phase 7 financial data availability. If financial data is not yet available, Budget Health displays "Data Pending" rather than a computed score.

### Dimension 3: Constraint Health

```
Constraint Health = f(
  open constraint count,
  overdue constraint count,
  constraint age (days open),
  constraint severity weighting
)
```

| Score | Status | Example |
|---|---|---|
| 90–100 | 🟢 Clear | 0–1 open constraints, none overdue |
| 70–89 | 🟡 Managing | 2–5 constraints, some aging |
| 40–69 | 🟠 Backlogged | 6+ constraints or any critical overdue |
| 0–39 | 🔴 Blocked | Critical constraint overdue >SLA |

### Dimension 4: Team Health (BIC-Derived)

```
Team Health = f(
  ratio of on-time BIC actions vs. overdue,
  count of Immediate-tier overdue items assigned to project team,
  acknowledgment completion rate
)
```

This dimension is unique to HB Intel — no other platform can compute it because no other platform has a BIC accountability layer.

---

## Interface Contract

```typescript
// In Project Hub domain types

export type HealthStatus = 'on-track' | 'watch' | 'at-risk' | 'critical' | 'data-pending';

export interface IHealthDimension {
  score: number; // 0-100
  status: HealthStatus;
  label: string; // dimension name
  keyMetric: string; // human-readable leading indicator: "3 overdue milestones"
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
}

export interface IProjectHealthPulse {
  projectId: string;
  computedAt: string; // ISO 8601
  /** Overall composite score (weighted average of dimensions) */
  overallScore: number;
  overallStatus: HealthStatus;
  dimensions: {
    schedule: IHealthDimension;
    budget: IHealthDimension;
    constraints: IHealthDimension;
    team: IHealthDimension;
  };
  /** Most urgent action the PM should take right now */
  topRecommendedAction: string | null;
}
```

---

## Component Architecture

```
apps/project-hub/src/features/health-pulse/
├── useProjectHealthPulse.ts           # computes health from live project data
├── ProjectHealthPulseCard.tsx         # compact 4-dimension card for Canvas tile
├── ProjectHealthPulseDetail.tsx       # expanded detail with trend history
├── HealthDimensionBar.tsx             # single dimension indicator (reusable)
├── PortfolioHealthOverview.tsx        # VP/Leadership view: all projects at a glance
└── healthComputors/
    ├── scheduleHealth.ts
    ├── budgetHealth.ts
    ├── constraintHealth.ts
    └── teamHealth.ts
```

---

## Component Specifications

### `ProjectHealthPulseCard` — Canvas Tile / Compact Display

```typescript
interface ProjectHealthPulseCardProps {
  projectId: string;
  pulse: IProjectHealthPulse;
  onClick?: () => void; // expands to detail view
}
```

**Visual behavior:**
- Project name + overall health badge (color + status label)
- Four dimension bars in a 2×2 grid: Schedule | Budget / Constraints | Team
- Each bar: dimension icon, label, score bar (colored), status dot
- "Key Alert" text (topRecommendedAction) in amber/red if status is Watch or worse
- Trend arrow per dimension (if history available)

### `ProjectHealthPulseDetail` — Expanded Detail Panel

**Visual behavior:**
- Expanded view with each dimension in a full card
- Per dimension: score, status, key metric, trend chart (last 4 weeks), drill-down link ("View overdue milestones", "View open constraints")
- "Top Recommended Action" prominently displayed with CTA link

### `PortfolioHealthOverview` — VP/Leadership Portfolio View

```typescript
interface PortfolioHealthOverviewProps {
  projectIds: string[];
}
```

**Visual behavior:**
- Sortable table of all projects with health dimension columns
- Row colors match health status
- Sort by: Overall Status, Schedule, Budget, Constraints, Team
- Filter by: Status (show only At-Risk / Critical)
- Export to CSV for leadership reporting

---

## Health Score Persistence and History

Health scores are computed client-side from live data on page load — no server-side pre-computation required for the initial implementation. However, to enable trend visualization, scores are persisted daily via an Azure Functions timer job to `HbcProjectHealthHistory` SharePoint list:

| Column | Type | Description |
|---|---|---|
| `HistoryId` | GUID | Primary key |
| `ProjectId` | Single line | Project record ID |
| `ComputedAt` | Date/Time | Snapshot date (daily) |
| `OverallScore` | Number | 0–100 |
| `ScheduleScore` | Number | 0–100 |
| `BudgetScore` | Number | 0–100 |
| `ConstraintScore` | Number | 0–100 |
| `TeamScore` | Number | 0–100 |

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | Team Health dimension sourced from BIC state: overdue items, acknowledgment rates |
| `@hbc/project-canvas` | `ProjectHealthPulseTile` is a primary canvas tile for PM and VP roles |
| `@hbc/notification-intelligence` | Status degrades to Critical → Immediate notification to PM and VP; improves back to On Track → Watch notification |
| `@hbc/complexity` | Essential: overall health badge only; Standard: 4-dimension card; Expert: detail panel with trend history |
| `@hbc/search` | `isOverdue`, health `status` are searchable dimensions for finding at-risk projects |
| PH9b My Work Feed (§A) | Critical projects appear as high-priority feed items for PM |

---

## Priority & ROI

**Priority:** P1 — Project Hub's primary value-add for PM and VP roles; without it, Project Hub is another project list with no health intelligence
**Estimated build effort:** 4–5 sprint-weeks (four health computors, three components, portfolio view, daily history job)
**ROI:** Gives VPs an instant portfolio health view that currently requires manual weekly status reports; makes health computation automatic rather than opinion-based; creates the first BIC-grounded team health dimension in the industry

---

## Definition of Done

- [ ] `IProjectHealthPulse` and `IHealthDimension` types defined
- [ ] `scheduleHealth.ts`: computes score from milestone completion + constraint state
- [ ] `constraintHealth.ts`: computes score from constraint count, age, severity
- [ ] `teamHealth.ts`: computes score from BIC overdue ratio + acknowledgment completion
- [ ] `budgetHealth.ts`: computes score OR returns `'data-pending'` if data unavailable
- [ ] `useProjectHealthPulse` assembles all four dimensions into `IProjectHealthPulse`
- [ ] `ProjectHealthPulseCard` renders 2×2 dimension grid with trend arrows
- [ ] `ProjectHealthPulseDetail` renders expanded dimension cards with drill-down links
- [ ] `PortfolioHealthOverview` renders sortable/filterable project table for VP role
- [ ] `HbcProjectHealthHistory` SharePoint list + Azure Functions daily snapshot job
- [ ] `@hbc/project-canvas` tile integration: `ProjectHealthPulseTile` implemented
- [ ] `@hbc/bic-next-move` integration: team health dimension uses BIC data
- [ ] `@hbc/notification-intelligence`: Critical → Immediate; recovery → Watch
- [ ] `@hbc/complexity` integration: all three tiers
- [ ] Unit tests ≥95% on all four health computor functions
- [ ] Storybook: all health status states in card + detail + portfolio view

---

## ADR Reference

Create `docs/architecture/adr/0030-project-health-pulse-model.md` documenting the four-dimension health model, the client-side computation strategy, the daily snapshot persistence approach, the BIC-derived team health dimension, and the "data-pending" budget health fallback strategy.
