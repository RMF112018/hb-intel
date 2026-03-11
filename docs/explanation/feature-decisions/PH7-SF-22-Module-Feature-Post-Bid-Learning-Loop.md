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

Every autopsy section gap, win/loss factor, or intelligence contribution automatically becomes a granular BIC record in `@hbc/bic-next-move` (blockers first), with ownership avatars appearing directly in the wizard and in the `@hbc/project-canvas` "My Work" lane.

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #3 (Unified Work Graph) specifies: "The graph includes closed records and their outcomes — the system learns from history." The con-tech UX study §4 identifies post-bid intelligence capture as a universally absent feature: no platform closes the loop between bid outcomes and future BD/Estimating strategy.

The Post-Bid Learning Loop is the mechanism that makes HB Intel's historical intelligence grow over time. The Score Benchmark (SF-19) and Living Strategic Intelligence (SF-20) compound in value with every completed autopsy. This compounding intelligence is the long-term competitive moat of HB Intel and the foundation of the new reusable Tier-1 `@hbc/post-bid-autopsy` primitive.

---

## Autopsy Trigger & Assignment

**Trigger:** When an Active Pursuit's status changes to `Won`, `Lost`, or `No-Bid`:
1. A Post-Bid Autopsy record is automatically created
2. Granular BIC records are created for each section/gap via `@hbc/bic-next-move`
3. An Immediate-tier notification is sent
4. A 5-business-day completion window begins

**Assignment model:**
- Estimating Lead is the primary author
- BD Manager is co-author and cross-module reviewer
- Section-level BIC ownership is auto-resolved and visible in wizard rows

**Escalation:** Overdue autopsies escalate to Chief Estimator with ownership preservation and reminder history.

---

## Autopsy Structure

The autopsy is a structured 5-section form using `@hbc/step-wizard` in sequential mode and complexity-aware behavior.

### Section 1: Outcome & Context
- Final bid result and awarded contractor/value context
- HB bid value and auto-computed deltas
- Was the outcome expected at Go/No-Go

### Section 2: Why We Won / Why We Lost
- Primary deciding factor and supporting factors
- Competitor intelligence observations
- Self-assessment on what should have been done differently

### Section 3: Estimating Accuracy Review
- Accurate/inaccurate cost categories
- Subquote representativeness assessment
- Key assumption that proved wrong

### Section 4: Go/No-Go Retrospective
- Decision correctness in hindsight
- Predictive vs misleading criteria
- Retrospective score adjustment sliders (Expert mode)

### Section 5: Intelligence Contributions
- Draft strategic intelligence entries auto-seeded from prior sections
- Entry edits prior to approval queue submission
- Deep-link and BIC relationship metadata attached to each seeded entry

**Complexity behavior:**
- Essential: collapsed autopsy badge with guided completion CTA
- Standard: full wizard and section completion controls
- Expert: full wizard + retrospective sliders + expanded insights dashboard

---

## Interface Contract

```typescript
// In @hbc/post-bid-autopsy primitive (new Tier-1 package)

export type AutopsyOutcome = 'won' | 'lost' | 'no-bid';
export type AutopsyStatus = 'not-started' | 'in-progress' | 'complete' | 'overdue';

export interface IPostBidAutopsy {
  autopsyId: string;
  pursuitId: string;
  scorecardId: string;
  outcome: AutopsyOutcome;
  status: AutopsyStatus;
  primaryAuthor: IBicOwner;
  coAuthor: IBicOwner;
  dueDate: string;
  completedAt: string | null;
  sections: {
    outcomeContext: IAutopsyOutcomeContext | null;
    winLossFactors: IAutopsyWinLossFactors | null;
    estimatingAccuracy: IAutopsyEstimatingAccuracy | null;
    goNoGoRetrospective: IAutopsyGoNoGoRetro | null;
    intelligenceContributions: IStrategicIntelligenceEntry[];
  };
  pursuitSnapshotId: string;
  bicRecords: IBicRecord[]; // granular per-section/gap ownership
  version: VersionedRecord; // from @hbc/versioned-record
  telemetry: IAutopsyTelemetryState;
}

export interface IAutopsyTelemetryState {
  autopsyCompletionLatency: number | null;
  repeatErrorReductionRate: number | null;
  intelligenceSeedingConversionRate: number | null;
  benchmarkAccuracyLift: number | null;
  autopsyCes: number | null;
}
```

(The entire model, offline logic, AI actions, gap BIC ownership, intelligence seeding, and telemetry are now provided by the new `@hbc/post-bid-autopsy` primitive.)

---

## Component Architecture

```
apps/business-development/src/features/post-bid-learning/
apps/estimating/src/features/post-bid-learning/  (shared)
├── PostBidAutopsyWizard.tsx
├── AutopsySummaryCard.tsx
├── AutopsyListView.tsx
├── LearningInsightsDashboard.tsx
├── usePostBidAutopsy.ts     # delegates to @hbc/post-bid-autopsy
└── types.ts
```

---

## Component Specifications

### `PostBidAutopsyWizard` — 5-Step Autopsy Form

Uses `@hbc/step-wizard` in sequential mode with draft and sync-state projection.

**Visual behavior:**
- Essential: collapsed badge + guided resume entry point
- Standard: full 5-step wizard with per-step validation and save
- Expert: full wizard + retrospective sliders + expanded comparative insights
- Inline AI actions available in section context (no sidecar)
- BIC owner avatars shown at section/gap level and mirrored to My Work lane

### `AutopsySummaryCard` — Completed Autopsy Display

A compact summary of key autopsy findings rendered on pursuit records.

**Visual behavior:**
- Outcome badge (Won/Lost/No-Bid)
- Primary deciding factor and key retrospective insight
- Inline links to seeded intelligence entries and benchmark impact markers

### `LearningInsightsDashboard` — Aggregated Intelligence View

Available to BD Manager, Chief Estimator, Director of Preconstruction, VP of Operations.

**Visual behavior:**
- Win/loss factor trend surfaces
- Estimating variance and repeat-error reduction indicators
- Go/No-Go retrospective alignment metrics
- Filters by date, project type, geography, client type

---

## Benchmark Dataset Update

When an autopsy is marked complete:
1. Retrospective score adjustments and outcome metadata are published via `@hbc/post-bid-autopsy`
2. Outcome + deciding factors are written to benchmark update inputs
3. Score Benchmark consumers (`@hbc/score-benchmark`) receive updated dataset signals on next refresh
4. Approved Section 5 entries are seeded into `@hbc/strategic-intelligence` approval flow

This primitive-owned update path is the primary mechanism by which benchmark accuracy and strategy intelligence improve over time.

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/post-bid-autopsy` | New Tier-1 primitive providing the entire model |
| `@hbc/bic-next-move` | Granular BIC for sections/gaps with avatar ownership projection |
| `@hbc/complexity` | Essential/Standard/Expert progressive disclosure |
| `@hbc/versioned-record` | Immutable provenance, audit trail, snapshot freezing |
| `@hbc/related-items` | Direct deep-links from findings |
| `@hbc/project-canvas` | Automatic placement in role-aware My Work lane |
| `@hbc/step-wizard` | 5-section sequential wizard |
| `@hbc/strategic-intelligence` | Intelligence seeding |
| `@hbc/score-benchmark` | Benchmark dataset update |
| `@hbc/post-bid-autopsy` telemetry | Five KPIs (autopsy-completion latency, repeat-error reduction rate, intelligence-seeding conversion rate, benchmark-accuracy lift, autopsy CES) surfaced in canvas and admin dashboard |

---

## Offline / PWA Resilience

Full tablet-native behavior: service worker caches wizard, summary card, and insights dashboard; IndexedDB + `@hbc/versioned-record` persists drafts and state; Background Sync replays changes with optimistic UI and `Saved locally / Queued to sync` indicators.

Offline state guarantees:
- Field edits and section transitions persist locally when disconnected
- Submit and approval actions queue with deterministic replay order
- Version snapshots are preserved; replay never mutates prior accepted versions
- BIC ownership links and related-item deep-links are restored after reconnect

UX indicators:
- `Saved locally` appears immediately after local persistence
- `Queued to sync` appears when network delivery is deferred
- Sync completion removes queue badge and records version metadata

Operational parity:
- Matches offline behavior used in Score Benchmark, Strategic Intelligence, and Bid Readiness
- Uses the same resilience primitives and guardrails across BD and Estimating surfaces

Failure handling:
- If replay fails, entries remain queued and retry with backoff
- Conflicted updates are written as new versions for approver review
- Escalation notifications resume only after successful sync commit

Security and governance:
- Local drafts remain scoped to authorized user/session context
- Snapshot freeze metadata is included in replay payloads
- Audit trail includes local-save timestamp and sync-commit timestamp

---

## Priority & ROI

**Priority:** P1 — The flywheel mechanism that makes HB Intel's intelligence accumulate over time; seed for the platform-wide `@hbc/post-bid-autopsy` primitive.
**Estimated build effort:** 4–5 sprint-weeks (now accelerated by reusing existing primitives).
**ROI:** Creates compounding intelligence value; makes Go/No-Go decision quality measurable; closes the loop between estimating assumptions and actual outcomes; measurable impact via UX telemetry.

---

## Definition of Done

- [ ] New `@hbc/post-bid-autopsy` Tier-1 primitive created and published
- [ ] All six locked integration patterns implemented and tested
- [ ] Offline/PWA resilience verified on tablet
- [ ] Embedded AI actions with provenance and approval guardrails
- [ ] Progressive disclosure via `@hbc/complexity` across all three modes
- [ ] Deep-links and canvas integration via `@hbc/related-items` and `@hbc/project-canvas`
- [ ] Versioned audit trail and admin governance via `@hbc/versioned-record`
- [ ] Five UX telemetry KPIs wired and surfaced
- [ ] Unit tests, Storybook stories for all modes and offline states
- [ ] ADR-0111-post-bid-autopsy-primitive created

---

## ADR Reference

Create `docs/architecture/adr/0111-post-bid-learning-loop.md` (and companion ADR for the new `@hbc/post-bid-autopsy` primitive) documenting the autopsy trigger mechanism, the 5-section structure, the benchmark dataset update strategy, the intelligence entry seeding approach, granular BIC integration, complexity-adaptive disclosure, offline strategy, AI Action Layer embedding, cross-module deep-linking, versioning/governance, and telemetry KPIs.

---
