# PH7-SF-19: BD Score Benchmark Ghost Overlay — Historical Win/Loss Scoring Context

**Priority Tier:** 2 — Application Layer (BD module differentiator)
**Module:** Business Development
**Interview Decision:** Q9 — Option B confirmed
**Mold Breaker Source:** UX-MB §4 (Universal Next Move); ux-mold-breaker.md Signature Solution #4 + Signature Solution #12 (Implementation Truth); con-tech-ux-study §4 (BD module intelligence gaps)

---

# Problem Solved

Go/No-Go decision-making in construction business development is fundamentally comparative:

> “Is this project a better opportunity than the ones we've won in the past?”

But most scorecards are evaluated in isolation. A score such as **65/100** is ambiguous without historical context.

* Is that strong for this project type in this market?
* Weak for this client relationship?
* Comparable to the projects we have historically won or lost?

Without historical context, the Go/No-Go Scorecard becomes a **scoring exercise rather than a decision-support tool**. Decision-makers rely heavily on instinct and experience rather than evidence.

The **Score Benchmark Ghost Overlay** transforms the scorecard into a **benchmarked intelligence surface** by overlaying historical win/loss performance directly on the active scorecard.

This allows decision-makers to see how the current pursuit compares to historical performance across similar projects.

---

# What the Ghost Overlay Shows

For each scoring criterion:

* A “ghost” bar showing the **average score on winning pursuits**
* A “ghost” bar showing the **average score on losing pursuits**
* The **current score** for the pursuit being evaluated
* A **Win Zone band** highlighting the range where HB’s historical wins cluster
* The **distance to the Win Zone**
* Benchmark **confidence indicators**
* A **similarity score** showing how closely the comparison dataset matches the current pursuit

The overlay allows evaluators to answer questions such as:

* Are we weaker than typical wins in this criterion?
* Is the benchmark reliable?
* Are we comparing against truly similar pursuits?

Every **Win Zone gap** automatically generates a granular BIC record in `@hbc/bic-next-move` (blockers first), with ownership avatars appearing directly in the overlay tooltip and in the `@hbc/project-canvas` **My Work** lane.

---

# Mold Breaker Rationale

This feature applies **Implementation Truth** to BD scoring.

The truth of a score is not the number itself — it is **what that score means relative to history**.

This overlay introduces a new intelligence layer:

* score evaluation
* historical context
* decision guidance
* operational next moves

Signature Solution #4 (**Universal Next Move**) provides accountability by surfacing the specific actions that would move the pursuit toward the Win Zone.

No existing construction platform provides **per-criterion historical benchmarking directly inside an active scorecard**.

CRM tools such as Salesforce and HubSpot offer win/loss analytics dashboards, but they do not integrate historical benchmarking into the live evaluation interface.

The Ghost Overlay therefore becomes both:

* a **BD decision-support tool**
* the foundation for a reusable **Tier-1 primitive: `@hbc/score-benchmark`**

---

# Decision Support Layer (New Enhancements)

The enhanced design introduces an explicit **decision-support layer** above the raw benchmark.

In addition to showing benchmark data, the system provides:

### Pursuit Decision States

Each scorecard is classified into one of four states:

* **Pursue**
* **Pursue with Caution**
* **Hold for Review**
* **No-Bid Recommended**

These states are derived from:

* Win Zone proximity
* benchmark confidence
* similarity match quality
* reviewer consensus

### Loss Risk Zone

In addition to the Win Zone, the system highlights a **Loss Risk Zone** where historical losses cluster.

This helps decision-makers understand when a pursuit resembles past losses.

### AI Decision Assistance

Inline AI actions allow users to:

* generate a **No-Bid rationale**
* suggest **next actions to close benchmark gaps**
* explain **why the pursuit falls outside the Win Zone**

---

# Benchmark Confidence Model (New)

Benchmarks are now accompanied by a **confidence tier** indicating how trustworthy the comparison is.

Confidence tiers:

* **High**
* **Moderate**
* **Low**
* **Insufficient Data**

Confidence is determined by:

* sample size
* similarity score
* recency of comparable pursuits
* completeness of historical scorecard data

Low-confidence benchmarks display a **“use with caution” indicator**.

---

# Similarity Model (New)

Historical comparisons are filtered using a **similarity scoring model**.

Similarity factors include:

* project type
* delivery method
* procurement type
* value range
* geography
* owner type
* incumbent relationship
* competitor count
* schedule complexity

The overlay displays:

> “Benchmark based on 18 highly similar pursuits”

or

> “Benchmark based on 74 loosely similar pursuits”

---

# Data Model

Historical benchmark data is sourced from:

1. **Closed BD Scorecards** with known outcomes (Won / Lost / No-Bid)
2. **Living Strategic Intelligence** contributions containing market data
3. **Post-Bid Learning Loop** outcomes (SF-22)

Each completed pursuit enriches the benchmark dataset.

The persisted model is immutable and provenance-aware using `@hbc/versioned-record`.

Snapshots are frozen at Go/No-Go submission.

---

# Interface Contract

(Original interfaces preserved and expanded)

```typescript
export interface IScorecardBenchmark {
  criterionId: string;
  criterionLabel: string;
  winAvg: number | null;
  lossAvg: number | null;
  winZoneMin: number | null;
  winZoneMax: number | null;
  sampleSize: number;
  similarityScore?: number;
  benchmarkConfidence?: 'high' | 'moderate' | 'low' | 'insufficient';
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
  version: VersionedRecord;
  telemetry: IScoreBenchmarkTelemetryState;
}
```

---

# Component Architecture

```
apps/business-development/src/features/score-benchmark/
├── useScoreBenchmark.ts
├── ScoreBenchmarkGhostOverlay.tsx
├── BenchmarkSummaryPanel.tsx
├── WinZoneIndicator.tsx
├── BenchmarkFilterPanel.tsx
├── SimilarPursuitsPanel.tsx
└── BenchmarkExplainabilityPanel.tsx
```

Two new components are introduced:

* **SimilarPursuitsPanel**
* **BenchmarkExplainabilityPanel**

---

# Explainability Layer (New)

Users can open an explanation panel showing:

* why the current score falls outside the Win Zone
* which criteria contribute most to the gap
* historical comparison examples
* links to the most similar historical pursuits

Each criterion includes **reason codes**, such as:

* below historical win average
* outside predictive band
* weak benchmark confidence
* owner-type mismatch

---

# Team Decision Intelligence (New)

Go/No-Go decisions often involve multiple reviewers.

The enhanced overlay surfaces:

* reviewer score variance
* consensus strength indicator
* largest score disagreements
* role-based scoring comparison

Roles compared include:

* Business Development
* Estimating
* Operations
* Executive leadership

---

# Benchmark Filter Guardrails (New)

To prevent “benchmark shopping,” the system enforces guardrails:

* default benchmark cohort cannot be silently changed
* filter adjustments are logged
* large benchmark changes trigger warnings
* admins can define approved comparison cohorts

---

# Integration Points

(All Tier-1 primitives retained)

| Package                 | Integration                |
| ----------------------- | -------------------------- |
| `@hbc/score-benchmark`  | primitive benchmark engine |
| `@hbc/bic-next-move`    | gap ownership              |
| `@hbc/complexity`       | progressive disclosure     |
| `@hbc/versioned-record` | immutable snapshot         |
| `@hbc/related-items`    | contextual deep links      |
| `@hbc/project-canvas`   | My Work placement          |
| `@hbc/ai-assist`        | inline suggestions         |
| `@hbc/data-seeding`     | historical data            |

---

# Telemetry Expansion (Updated)

Additional metrics now tracked:

* benchmark consultation rate
* decision reversal rate
* benchmark confidence vs win-rate correlation
* filter adjustment frequency
* predictive accuracy of criteria

---

# Offline / PWA Resilience

Tablet-native operation remains unchanged.

The overlay functions offline with:

* service worker caching
* IndexedDB persistence
* background sync replay

---

# Priority & ROI

**Priority:** P1 — major BD differentiator

**Estimated effort:** 3–4 sprint weeks

**Strategic ROI:**

* transforms Go/No-Go decisions from intuition-driven to data-driven
* introduces reusable benchmark intelligence across modules
* creates a new platform primitive usable in other scoring contexts

---

# Definition of Done

Original Definition of Done retained with additional requirements:

* benchmark confidence tier implemented
* similarity model implemented
* explainability panel available
* reviewer consensus indicators implemented
* benchmark guardrails enforced
* telemetry extended

---

# ADR Reference

Create:

```
docs/architecture/adr/0103-bd-score-benchmark-ghost-overlay.md
```

Document:

* Win Zone computation model
* benchmark similarity model
* confidence scoring
* filter governance
* primitive extraction strategy