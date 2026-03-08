# PH7-SF-19: BD Score Benchmark Ghost Overlay — Historical Win/Loss Scoring Context

**Priority Tier:** 2 — Application Layer (BD module differentiator)
**Module:** Business Development
**Interview Decision:** Q9 — Option B confirmed
**Mold Breaker Source:** UX-MB §4 (Universal Next Move); ux-mold-breaker.md Signature Solution #4 + Signature Solution #12 (Implementation Truth); con-tech-ux-study §4 (BD module intelligence gaps)

---

## Problem Solved

Go/No-Go decision-making in construction business development is fundamentally comparative: "Is this project a better opportunity than the ones we've won in the past?" But scorecards are evaluated in isolation. A 65/100 score is ambiguous — is that strong for this project type in this market? Weak for this client relationship? Comparable to the projects we've won or lost?

Without historical context, the Go/No-Go Scorecard is a scoring exercise, not a decision-support tool. Decision-makers rely on instinct rather than data. The Score Benchmark Ghost Overlay transforms the scorecard from a point-in-time evaluation into a **benchmarked intelligence tool** by overlaying historical win/loss data directly on the active scorecard.

**What the Ghost Overlay shows:**
- For each scoring criterion: a "ghost" bar showing the average score on winning projects and the average score on losing projects (where data is available)
- A "Win Zone" highlighting the score range where HB's historical wins cluster
- The current scorecard's position relative to these benchmarks
- The "distance to win threshold" — how many more points would move this pursuit into the Win Zone

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #12 (Implementation Truth Layer) applied to BD: the Implementation Truth at the scorecard level is not just the current score — it's the current score in the context of what history says that score means. Signature Solution #4 (Universal Next Move) provides the accountability: the ghost overlay surfaces what action would most improve the score toward the Win Zone.

No construction platform currently provides per-criterion historical benchmarking on active scorecards. CRM tools (Salesforce, HubSpot) provide some win/loss analytics but not per-criterion overlays on active evaluations. This is a genuine industry first.

---

## Data Model

Historical benchmark data is sourced from:
1. **Closed BD Scorecards** with a known outcome (Won / Lost / No-Bid) in HB Intel's own history (populated via `@hbc/data-seeding` during onboarding and accumulated over time)
2. **Living Strategic Intelligence** contributions that include competitive market data
3. **Post-Bid Learning Loop** outcomes (SF-22) — each completed autopsy enriches the benchmark dataset

```typescript
// In BD module domain types

export interface IScorecardBenchmark {
  criterionId: string;
  criterionLabel: string;
  /** Average score on Won pursuits (null if insufficient data) */
  winAvg: number | null;
  /** Average score on Lost pursuits */
  lossAvg: number | null;
  /** Min/max of Won scores (defines the Win Zone band) */
  winZoneMin: number | null;
  winZoneMax: number | null;
  /** Number of historical records contributing to this benchmark */
  sampleSize: number;
  /** Whether sample size is sufficient for statistical confidence */
  isStatisticallySignificant: boolean;
}

export interface IScoreGhostOverlayState {
  /** Benchmark data per criterion */
  benchmarks: IScorecardBenchmark[];
  /** Aggregate benchmarks for overall score */
  overallWinAvg: number | null;
  overallLossAvg: number | null;
  overallWinZoneMin: number | null;
  overallWinZoneMax: number | null;
  /** Distance from current score to Win Zone entry (positive = above, negative = below) */
  distanceToWinZone: number | null;
  /** Project type and market filters applied */
  filterContext: IBenchmarkFilterContext;
  /** Data freshness */
  benchmarkGeneratedAt: string;
}

export interface IBenchmarkFilterContext {
  projectType?: string;      // filter: only compare similar project types
  valueRange?: [number, number]; // filter: comparable project values
  geography?: string;        // filter: regional market conditions
  ownerType?: string;        // filter: public vs private owner
}
```

---

## Component Architecture

```
apps/business-development/src/features/score-benchmark/
├── useScoreBenchmark.ts           # loads benchmark data, applies filters
├── ScoreBenchmarkGhostOverlay.tsx # per-criterion ghost bar overlay
├── BenchmarkSummaryPanel.tsx      # overall benchmark comparison panel
├── WinZoneIndicator.tsx           # distance to win zone visualization
└── BenchmarkFilterPanel.tsx       # context filter controls
```

---

## Component Specifications

### `ScoreBenchmarkGhostOverlay` — Per-Criterion Overlay

Rendered within the existing scorecard criterion scoring UI. Each criterion's score input gets a ghost overlay showing historical context.

**Visual behavior:**
- Behind each criterion's score bar: a translucent "Win Zone" band in green (min–max range of historical wins)
- A dashed line at `winAvg` (win average)
- A dashed line at `lossAvg` (loss average)
- The current score bar is rendered on top
- If current score is within the Win Zone: "In Win Zone" tooltip
- If current score is below Win Zone: "X points below Win Zone" tooltip
- Low sample size: overlay shows with warning: "Limited data (N records)"

### `BenchmarkSummaryPanel` — Overall Comparison Card

A compact summary panel in the scorecard sidebar:

**Visual behavior:**
- Current total score vs. Win Zone range: "72/100 · Win Zone: 68–82"
- "Distance to Win Zone" metric (if below): "You're 4 points below the Win Zone entry threshold"
- Historical context: "Based on N comparable projects (similar type, value range, owner type)"
- Link to `BenchmarkFilterPanel` to adjust comparison context

### `WinZoneIndicator` — Progress Visualization

A large progress indicator showing the scorecard's position on the win/loss spectrum:

**Visual behavior:**
- Horizontal spectrum: "Loss Zone" (red) | "Borderline" (amber) | "Win Zone" (green)
- Current score marker on the spectrum
- Win Zone boundaries labeled
- Historical win average marker

### `BenchmarkFilterPanel` — Context Controls

```typescript
interface BenchmarkFilterPanelProps {
  currentFilter: IBenchmarkFilterContext;
  onFilterChange: (filter: IBenchmarkFilterContext) => void;
}
```

**Visual behavior:**
- Dropdown: Project Type (building type options)
- Slider: Project Value Range
- Dropdown: Geography (regional market)
- Dropdown: Owner Type (public/private/institutional)
- "Reset to defaults" (auto-matches current scorecard's characteristics)

---

## Benchmark Data Refresh Strategy

Benchmark data is pre-computed by an Azure Functions timer job (nightly) and stored as aggregate statistics, not raw records:

- Preserves privacy of individual pursuit outcomes
- Fast query performance (pre-aggregated, not computed at query time)
- Stored in `HbcScorecardBenchmarks` SharePoint list (aggregate statistics per criterion per filter combination)

A minimum of 5 comparable records is required to display benchmark data for a criterion; otherwise, "Insufficient historical data" is shown with a note about how many more records would unlock the benchmark.

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/data-seeding` | Historical win/loss data seeded during onboarding enriches benchmarks immediately |
| `@hbc/versioned-record` | Each closed scorecard version (Won/Lost tag) contributes to benchmark dataset |
| `@hbc/ai-assist` | `risk-assessment` AI action uses benchmark data as context for its analysis |
| `@hbc/complexity` | Essential: no overlay; Standard: Win Zone indicator + summary panel; Expert: full per-criterion ghost bars + filter controls |
| PH7-SF-22 Post-Bid Learning Loop | Each completed post-bid autopsy updates the benchmark dataset with confirmed outcome data |

---

## Priority & ROI

**Priority:** P1 — BD module's most visible intelligence differentiator; transforms scorecard from a form into a decision-support tool
**Estimated build effort:** 3–4 sprint-weeks (benchmark compute job, four components, filter system, data model)
**ROI:** Makes Go/No-Go decisions data-driven rather than instinct-driven; creates competitive advantage as HB Intel accumulates its own historical win/loss dataset; no construction platform offers this today

---

## Definition of Done

- [ ] `IScorecardBenchmark` and `IScoreGhostOverlayState` types defined
- [ ] `useScoreBenchmark` loads pre-computed benchmarks with filter application
- [ ] Azure Functions nightly job computes aggregate benchmark statistics from closed scorecards
- [ ] `ScoreBenchmarkGhostOverlay` renders Win Zone band + avg markers on each criterion
- [ ] `BenchmarkSummaryPanel` renders overall comparison with distance-to-win-zone metric
- [ ] `WinZoneIndicator` renders position-on-spectrum visualization
- [ ] `BenchmarkFilterPanel` renders context filters (project type, value, geography, owner type)
- [ ] Minimum sample size check: "Insufficient data" state when <5 comparable records
- [ ] `@hbc/data-seeding` integration: historical data seeding enriches benchmarks on import
- [ ] `@hbc/complexity` integration: overlay hidden in Essential, summary in Standard, full overlay in Expert
- [ ] Unit tests on benchmark computation aggregation logic
- [ ] Storybook: in Win Zone, below Win Zone, insufficient data states

---

## ADR Reference

Create `docs/architecture/adr/0028-bd-score-benchmark-ghost-overlay.md` documenting the pre-aggregated benchmark computation strategy, the Win Zone definition model, the minimum sample size threshold, and the privacy rationale for storing only aggregate statistics.
