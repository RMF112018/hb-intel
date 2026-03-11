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

Every Win Zone gap is automatically surfaced as a granular BIC record in `@hbc/bic-next-move` (blockers first), with ownership avatars appearing directly in the ghost overlay tooltip and in the `@hbc/project-canvas` "My Work" lane.

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #12 (Implementation Truth Layer) applied to BD: the Implementation Truth at the scorecard level is not just the current score — it's the current score in the context of what history says that score means. Signature Solution #4 (Universal Next Move) provides the accountability: the ghost overlay surfaces what action would most improve the score toward the Win Zone.

No construction platform currently provides per-criterion historical benchmarking on active scorecards. CRM tools (Salesforce, HubSpot) provide some win/loss analytics but not per-criterion overlays on active evaluations. The Ghost Overlay is a genuine industry first and the foundation of the new reusable Tier-1 `@hbc/score-benchmark` primitive.

Decision 6 is locked: the entire benchmark model (Win Zone computation, ghost rendering, filters, AI actions, gap BIC ownership, versioning) is abstracted into `@hbc/score-benchmark` with five role- and complexity-aware UX telemetry KPIs surfaced in project canvas and admin governance.

---

## Data Model

Historical benchmark data is sourced from:
1. **Closed BD Scorecards** with a known outcome (Won / Lost / No-Bid) in HB Intel's own history (populated via `@hbc/data-seeding` during onboarding and accumulated over time)
2. **Living Strategic Intelligence** contributions that include competitive market data
3. **Post-Bid Learning Loop** outcomes (SF-22) — each completed autopsy enriches the benchmark dataset

The persisted model is immutable and provenance-aware via `@hbc/versioned-record`, with snapshot freezing at Go/No-Go submission and replay-safe offline writes.

---

## Interface Contract

```typescript
// In @hbc/score-benchmark primitive (new Tier-1 package)
export interface IScorecardBenchmark {
  criterionId: string;
  criterionLabel: string;
  winAvg: number | null;
  lossAvg: number | null;
  winZoneMin: number | null;
  winZoneMax: number | null;
  sampleSize: number;
  isStatisticallySignificant: boolean;
}
export interface IScoreGhostOverlayState {
  benchmarks: IScorecardBenchmark[];
  overallWinAvg: number | null;
  overallLossAvg: number | null;
  overallWinZoneMin: number | null;
  overallWinZoneMax: number | null;
  distanceToWinZone: number | null;
  filterContext: IBenchmarkFilterContext;
  benchmarkGeneratedAt: string;
  version: VersionedRecord; // from @hbc/versioned-record
  telemetry: IScoreBenchmarkTelemetryState;
}
export interface IBenchmarkFilterContext {
  projectType?: string;
  valueRange?: [number, number];
  geography?: string;
  ownerType?: string;
}
export interface IScoreBenchmarkTelemetryState {
  timeToGoNoGoMs: number | null;
  gapClosureLatencyMs: number | null;
  pctScorecardsReachingWinZone: number | null;
  winRateCorrelationLift: number | null;
  benchmarkCes: number | null;
}
```

---

## Component Architecture

```
apps/business-development/src/features/score-benchmark/
├── useScoreBenchmark.ts           # now delegates to @hbc/score-benchmark
├── ScoreBenchmarkGhostOverlay.tsx # per-criterion ghost bar overlay
├── BenchmarkSummaryPanel.tsx      # overall benchmark comparison panel
├── WinZoneIndicator.tsx           # distance to win zone visualization
└── BenchmarkFilterPanel.tsx       # context filter controls
```

(The entire model, offline logic, AI actions, gap BIC ownership, and telemetry are now provided by the new `@hbc/score-benchmark` primitive.)

---

## Component Specifications

### `ScoreBenchmarkGhostOverlay` — Per-Criterion Overlay

**Visual behavior (Complexity-aware):**
- Essential: single "Benchmark context available" badge on overall score
- Standard: translucent Win Zone band + dashed avg lines + tooltip
- Expert: full ghost bars + owning avatar from `@hbc/bic-next-move`
- Hover tooltip shows points below Win Zone and inline AI actions

### `BenchmarkSummaryPanel` — Overall Comparison Card

**Visual behavior:**
- Current total score vs. Win Zone range
- "Distance to Win Zone" metric
- Historical context with sample size
- Read-only in Standard mode

### `WinZoneIndicator` — Progress Visualization

**Visual behavior:**
- Horizontal spectrum with current score marker
- Win Zone boundaries labeled
- Inline AI insight buttons in Standard/Expert modes

### `BenchmarkFilterPanel` — Context Controls

**Visual behavior:**
- Dropdowns and sliders for project type, value range, geography, owner type
- Visible only in Expert mode

---

## Admin Configuration & Governance

- Benchmark filters and minimum sample size thresholds are configurable in the Admin module (Expert mode only)
- Full immutable audit trail via `@hbc/versioned-record`
- Admins can freeze/lock a benchmark snapshot at Go/No-Go submission
- Governance dashboard shows provenance of hybrid data sources, BIC ownership history for gaps, and KPI trend cards

---

## AI Action Layer Integration

AI insights ("Why is this 6 points below the Win Zone?", "Suggest next move to close the gap") appear as contextual inline buttons and tooltips inside the Ghost Overlay and WinZoneIndicator. Suggestions cite sources, require explicit approval, auto-create BIC records for gap-closing actions, and update both the criterion and the corresponding BIC record. No separate chat interface.

---

## Integration Points (All Tier-1 Primitives)

| Package | Integration |
|---|---|
| `@hbc/score-benchmark` | New Tier-1 primitive providing Win Zone computation, ghost rendering, filters, AI actions, gap ownership wiring, and telemetry |
| `@hbc/bic-next-move` | Granular per-criterion BIC ownership for Win Zone gaps with avatars in overlay tooltip and My Work |
| `@hbc/complexity` | Essential/Standard/Expert progressive disclosure |
| `@hbc/versioned-record` | Immutable provenance, audit trail, snapshot freezing, and offline-safe version persistence |
| `@hbc/related-items` | Direct deep-links from every benchmark gap |
| `@hbc/project-canvas` | Automatic placement in role-aware My Work lane and KPI surfacing |
| `@hbc/ai-assist` | Contextual gap-closing suggestions embedded inline |
| `@hbc/data-seeding` | Historical win/loss data seeding |
| `@hbc/score-benchmark` telemetry | Five KPIs (time-to-Go/No-Go, gap-closure latency, % reaching Win Zone, win-rate correlation lift, benchmark CES) surfaced in canvas and admin dashboard |

---

## Offline / PWA Resilience

Full tablet-native behavior: service worker caches the Ghost Overlay, summary panel, and filter context; IndexedDB + `@hbc/versioned-record` persists drafts and state; Background Sync replays changes with optimistic UI and "Saved locally / Queued to sync" indicators. Works identically to Punch List, RFI drafts, and the PH7-SF-18 Bid Readiness Signal.

---

## Priority & ROI

**Priority:** P1 — BD module's most visible intelligence differentiator and the seed for the platform-wide `@hbc/score-benchmark` primitive.
**Estimated build effort:** 3–4 sprint-weeks (now accelerated by reusing existing primitives).
**ROI:** Makes Go/No-Go decisions data-driven rather than instinct-driven; creates measurable operational impact via UX telemetry; positions HB Intel as the first platform with a universal benchmark primitive.

---

## Definition of Done

- [ ] New `@hbc/score-benchmark` Tier-1 primitive created and published
- [ ] All six locked integration patterns implemented and tested
- [ ] Offline/PWA resilience verified on tablet (service worker + IndexedDB + Background Sync)
- [ ] Embedded AI actions with provenance and approval guardrails
- [ ] Progressive disclosure via `@hbc/complexity` across all three modes
- [ ] Deep-links and canvas integration via `@hbc/related-items` and `@hbc/project-canvas`
- [ ] Versioned audit trail and admin governance via `@hbc/versioned-record`
- [ ] Five UX telemetry KPIs wired and surfaced
- [ ] Unit tests, Storybook stories for all modes and offline states
- [ ] ADR-00xx-score-benchmark-primitive created

---

## ADR Reference

Create `docs/architecture/adr/0103-bd-score-benchmark-ghost-overlay.md` (and companion ADR for the new `@hbc/score-benchmark` primitive) documenting the pre-aggregated benchmark computation strategy, the Win Zone definition model, the minimum sample size threshold, granular BIC integration for gaps, complexity-adaptive disclosure, offline strategy, AI Action Layer embedding, cross-module deep-linking, versioning/governance, and telemetry KPIs.
---
