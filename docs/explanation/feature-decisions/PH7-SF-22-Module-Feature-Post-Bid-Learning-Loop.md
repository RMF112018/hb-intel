# PH7-SF-22: Post-Bid Learning Loop — Structured Win/Loss Autopsy & Intelligence Capture

**Priority Tier:** 2 — Application Layer (cross-module intelligence; BD + Estimating)
**Module:** Business Development + Estimating (cross-module)
**Interview Decision:** Q14 — Option B confirmed
**Mold Breaker Source:** UX-MB §3 (Unified Work Graph); ux-mold-breaker.md Signature Solution #3 + Signature Solution #12 (Implementation Truth); con-tech-ux-study §4 (Post-bid intelligence gaps)

---

## Problem Solved

Every bid result — won or lost — contains valuable intelligence: why did we win? What was the client's deciding factor? What did the competitor do that we didn't anticipate? Which internal assumptions in the bid proved wrong? This intelligence is currently captured nowhere — or, at best, in a post-bid meeting discussion that leaves no structured record.

The result is that:
- BD teams repeat the same Go/No-Go mistakes on similar projects
- Estimating teams repeat the same bid strategy errors on similar pursuits
- Historical win/loss patterns are invisible, so the Score Benchmark (SF-19) has no data
- Leadership has no systematic view of what's working and what isn't in BD strategy

The **Post-Bid Learning Loop** is a structured, triggered autopsy process that:
1. Is automatically triggered when a pursuit closes (Won, Lost, or No-Bid)
2. Guides the Estimating Lead and BD Manager through a structured set of questions
3. Captures responses in a structured format usable for benchmarking and intelligence
4. Feeds approved findings into Living Strategic Intelligence (SF-20)
5. Updates the Score Benchmark dataset (SF-19) with confirmed outcome data

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #3 (Unified Work Graph) specifies: "The graph includes closed records and their outcomes — the system learns from history." The con-tech UX study §4 identifies post-bid intelligence capture as a universally absent feature: no platform closes the loop between bid outcomes and future BD/Estimating strategy.

The Post-Bid Learning Loop is the mechanism that makes HB Intel's historical intelligence grow over time. The Score Benchmark (SF-19) starts with seeded data but compounds in value with every completed autopsy. The Living Strategic Intelligence knowledge base grows with every confirmed win/loss factor. This compounding intelligence is the long-term competitive moat of HB Intel's BD module.

---

## Autopsy Trigger & Assignment

**Trigger:** When an Active Pursuit's status changes to `Won`, `Lost`, or `No-Bid`:
1. A Post-Bid Autopsy record is automatically created
2. BIC is assigned to the Estimating Lead (primary) with BD Manager as co-author
3. An Immediate-tier notification is sent to both parties
4. A 5-business-day completion window begins

**Escalation:** If the autopsy is not completed within the window, an escalation notification is sent to the Chief Estimator.

---

## Autopsy Structure

The autopsy is a structured form with five sections, using `@hbc/step-wizard` in sequential mode:

### Section 1: Outcome & Context
- Final bid result: Won / Lost / No-Bid
- Awarded contractor (if Lost): text field
- Awarded bid value (if known): number field
- HB Intel's bid value: number field
- Bid price delta (if known): auto-computed
- Was this outcome expected at Go/No-Go? Yes / No / Partially

### Section 2: Why We Won / Why We Lost
- Primary deciding factor (select from configurable list + free text):
  - Price (lowest bid) / Schedule Commitment / Safety Record / Subcontractor Relationships / Relationship with Owner / Technical Approach / Other
- Supporting factors (multi-select)
- Competitor intelligence: "What did the awarded contractor do differently?" (free text)
- Self-assessment: "What was the single biggest thing we could have done differently?" (free text)

### Section 3: Estimating Accuracy Review
- Which cost categories were closest to actual bid? (multi-select)
- Which cost categories had the largest variance? (multi-select)
- Were subcontractor quotes representative of market? Yes / No / Partially
- Key assumption that proved wrong (free text, optional)

### Section 4: Go/No-Go Retrospective
- In hindsight, was the Go/No-Go decision correct? Yes / No
- Which scoring criteria most accurately predicted the outcome?
- Which scoring criteria were misleading?
- Would you change the score? (slider: adjust each criterion in retrospect)

### Section 5: Intelligence Contributions (Pre-seeded for SF-20)
- Automatically creates draft Living Strategic Intelligence entries from:
  - Primary deciding factor → "Win/Loss Factor" entry
  - Competitor intelligence → "Competitor Intel" entry
  - Market observations → "Market Condition" entry
- Each draft entry can be edited before submission to the approval queue

---

## Interface Contract

```typescript
// In BD/Estimating domain types

export type AutopsyOutcome = 'won' | 'lost' | 'no-bid';
export type AutopsyStatus = 'not-started' | 'in-progress' | 'complete' | 'overdue';

export interface IPostBidAutopsy {
  autopsyId: string;
  pursuitId: string;
  scorecardId: string; // originating BD scorecard
  outcome: AutopsyOutcome;
  status: AutopsyStatus;
  /** Primary author (Estimating Lead) */
  primaryAuthor: IBicOwner;
  /** Co-author (BD Manager) */
  coAuthor: IBicOwner;
  /** Completion deadline */
  dueDate: string;
  completedAt: string | null;
  /** Structured answers by section */
  sections: {
    outcomeContext: IAutopsyOutcomeContext | null;
    winLossFactors: IAutopsyWinLossFactors | null;
    estimatingAccuracy: IAutopsyEstimatingAccuracy | null;
    goNoGoRetrospective: IAutopsyGoNoGoRetro | null;
    intelligenceContributions: IStrategicIntelligenceEntry[];
  };
  /** Version snapshot ID of the pursuit at autopsy time */
  pursuitSnapshotId: string;
}

export interface IAutopsyOutcomeContext {
  finalResult: AutopsyOutcome;
  awardedContractor?: string;
  awardedBidValue?: number;
  hbBidValue: number;
  bidPriceDelta?: number;
  outcomeWasExpected: 'yes' | 'no' | 'partially';
}

export interface IAutopsyWinLossFactors {
  primaryFactor: string;
  supportingFactors: string[];
  competitorIntelligence: string;
  selfAssessment: string;
}

export interface IAutopsyEstimatingAccuracy {
  accurateCostCategories: string[];
  inaccurateCostCategories: string[];
  subquotesRepresentative: 'yes' | 'no' | 'partially';
  keyWrongAssumption?: string;
}

export interface IAutopsyGoNoGoRetro {
  decisionCorrectInRetrospect: 'yes' | 'no';
  mostPredictiveCriteria: string[];
  misleadingCriteria: string[];
  retrospectiveScoreAdjustments: Record<string, number>; // criterion key → adjusted score
}
```

---

## Component Architecture

```
apps/business-development/src/features/post-bid-learning/
apps/estimating/src/features/post-bid-learning/  (shared via package reference)
├── PostBidAutopsyWizard.tsx         # full 5-section autopsy form (uses @hbc/step-wizard)
├── AutopsySummaryCard.tsx           # completed autopsy summary for record display
├── AutopsyListView.tsx              # list of all autopsies (BD/Estimating admin view)
├── LearningInsightsDashboard.tsx    # aggregated insights from all autopsies
├── usePostBidAutopsy.ts             # loads, saves, submits autopsy
└── types.ts
```

---

## Component Specifications

### `PostBidAutopsyWizard` — 5-Step Autopsy Form

Uses `@hbc/step-wizard` in sequential mode:

```typescript
interface PostBidAutopsyWizardProps {
  autopsyId: string;
  pursuit: IEstimatingPursuit;
  scorecard: IGoNoGoScorecard;
}
```

**Visual behavior:**
- 5-step vertical wizard (sidebar nav + content)
- Auto-populates: bid values from pursuit, scorecard criteria from scorecard
- Each section saves as a draft (via `@hbc/session-state`) on every field change
- Section 5 (Intelligence Contributions) pre-populates draft entries from Section 2 answers
- "Submit Autopsy" CTA on final section → marks autopsy complete → submits intelligence entries to approval queue → updates pursuit status → updates benchmark dataset

### `AutopsySummaryCard` — Completed Autopsy Display

A compact summary of key autopsy findings rendered on the pursuit record after completion:

**Visual behavior:**
- Outcome badge (Won/Lost/No-Bid), primary deciding factor, key self-assessment quote
- Link: "View Full Autopsy"

### `LearningInsightsDashboard` — Aggregated Intelligence View

Available to BD Manager, Chief Estimator, Director of Preconstruction, VP of Operations.

**Visual behavior:**
- "Win Rate by Project Type" chart
- "Top Win Factors" ranked list
- "Top Loss Factors" ranked list
- "Estimating Accuracy by Cost Category" heat map
- "Go/No-Go Decision Accuracy Rate" metric (what % of GO decisions resulted in wins)
- Filters: date range, project type, geography, client type

---

## Benchmark Dataset Update

When an autopsy is marked complete:
1. The retrospective score adjustments update the `HbcScorecardBenchmarks` compute job's input data
2. The outcome (Won/Lost) + primary factor is added to the benchmark dataset
3. The `useScoreBenchmark` hook (SF-19) will reflect this data at the next nightly refresh

This is the primary mechanism by which the Score Benchmark Ghost Overlay becomes more accurate over time.

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/step-wizard` | 5-section autopsy uses step wizard in sequential mode with draft persistence |
| `@hbc/session-state` | Draft autopsy answers persisted across sessions |
| `@hbc/bic-next-move` | Autopsy BIC assigned to Estimating Lead on trigger; transfers to BD Manager for co-author review |
| `@hbc/notification-intelligence` | Autopsy triggered → Immediate to Estimating Lead + BD Manager; overdue → Immediate escalation to CE |
| `@hbc/versioned-record` | Pursuit snapshot captured at autopsy completion; tagged `'autopsy-complete'` |
| PH7-SF-19 Score Benchmark | Completed autopsies update benchmark dataset; Go/No-Go retrospective adjustments improve benchmark accuracy |
| PH7-SF-20 Living Strategic Intelligence | Section 5 pre-seeds draft intelligence entries from autopsy findings |
| `@hbc/complexity` | Essential: autopsy wizard in simplified mode; Expert: full retrospective score adjustment controls |

---

## Priority & ROI

**Priority:** P1 — The flywheel mechanism that makes HB Intel's intelligence accumulate over time; without it, SF-19 (Score Benchmark) relies entirely on seeded historical data that never grows
**Estimated build effort:** 4–5 sprint-weeks (5-section wizard, summary card, insights dashboard, benchmark integration, intelligence entry seeding)
**ROI:** Creates compounding intelligence value: each completed autopsy improves future BD decisions; makes Go/No-Go decision quality measurable over time; closes the loop between estimating assumptions and actual bid outcomes; builds the data moat that makes HB Intel increasingly valuable the longer it is used

---

## Definition of Done

- [ ] `IPostBidAutopsy` type defined with all 5 section types
- [ ] Autopsy auto-triggered when pursuit status changes to Won/Lost/No-Bid
- [ ] BIC assigned: Estimating Lead (primary); BD Manager (co-author)
- [ ] 5-day completion SLA with escalation to Chief Estimator on overdue
- [ ] `PostBidAutopsyWizard` 5-section form using `@hbc/step-wizard`
- [ ] Auto-population from pursuit + scorecard data
- [ ] Section 5 pre-seeds intelligence entries from Sections 2 and 3 answers
- [ ] Draft persistence via `@hbc/session-state` on every field change
- [ ] `AutopsySummaryCard` renders on completed pursuit records
- [ ] `AutopsyListView` renders all autopsies (BD/Estimating admin view)
- [ ] `LearningInsightsDashboard` renders aggregated win/loss analytics
- [ ] Benchmark dataset update: outcome + factors written to benchmark compute input
- [ ] Intelligence entry seeding: Section 5 entries submitted to SF-20 approval queue
- [ ] `@hbc/versioned-record` integration: pursuit snapshot on completion
- [ ] `@hbc/notification-intelligence`: trigger → Immediate; overdue → escalation
- [ ] `@hbc/complexity` integration: all three tiers
- [ ] Unit tests on autopsy trigger logic, benchmark data update, intelligence entry seeding
- [ ] E2E test: pursuit → status change to Lost → autopsy triggered → wizard complete → intelligence entry created → benchmark updated

---

## ADR Reference

Create `docs/architecture/adr/0031-post-bid-learning-loop.md` documenting the autopsy trigger mechanism, the 5-section structure, the benchmark dataset update strategy, the intelligence entry seeding approach, and the compounding value rationale for making this a core platform feature rather than a reporting afterthought.
