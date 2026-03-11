# PH7-SF-18: Estimating Bid Readiness Signal — Real-Time Bid Preparation Health Indicator
**Priority Tier:** 2 — Application Layer (Estimating module differentiator)
**Module:** Estimating
**Interview Decision:** Q2 — Option B confirmed (initially; redirected to shared package framing; Bid Readiness Signal confirmed as Estimating-specific Mold Breaker)
**Mold Breaker Source:** UX-MB §7 (Tablet-Native Field UX, applied to Estimating workflows); ux-mold-breaker.md Signature Solution #4 (Universal Next Move, applied to bid preparation); con-tech-ux-study §5 (Estimating module gaps)

---
## Problem Solved

Bid preparation failures — submitting an incomplete bid, missing a bid bond requirement, forgetting to include an addendum — are among the most costly mistakes a general contractor can make. They result in bid rejection, damaged owner relationships, and in competitive markets, they eliminate the company from consideration entirely.

Current estimating software (and Procore's estimating module) shows bid status as a simple stage label: "Active" / "Pending" / "Submitted". This tells the estimator nothing about readiness. The Bid Readiness Signal replaces the static stage label with a **real-time health indicator** that answers: "Is this bid actually ready to submit?"

**What makes a bid ready:**
- All required cost sections are populated with values (no blank line items in required categories)
- Bid bond / bid security is confirmed and documented
- All addenda have been acknowledged by the Estimating Lead
- Subcontractor coverage meets the required trade coverage threshold
- Bid documents have been attached (plans, specs, contract form)
- The bid value has been reviewed and signed off by the Chief Estimator
- The submission deadline has not passed

The Bid Readiness Signal computes a health score from these criteria and surfaces it at the top of every Active Pursuit — visible at a glance in the list view and detailed in the record view. Every incomplete criterion is automatically surfaced as a granular BIC record in `@hbc/bic-next-move` (blockers first), with ownership avatars appearing directly in the compact Signal row and in the `@hbc/project-canvas` “My Work” lane.

---
## Mold Breaker Rationale

This is a direct application of the `@hbc/bic-next-move` philosophy (Universal Next Move, Signature Solution #4) at the bid preparation level: every bid preparation requirement has an owner, a completion state, and a due date — and the system makes the incomplete requirements visible rather than hiding them behind a status field.

No current construction platform provides real-time bid readiness computation. Procore's estimating module shows bid status but not bid health. The Bid Readiness Signal is the Estimating module's most visible UX differentiator and the foundation of the new reusable Tier-1 `@hbc/health-indicator` primitive.

---
## Bid Readiness Score Model

### Readiness Criteria (Configurable by Admin)

| Criterion | Weight | Completion Condition | Blocker? |
|---|---|---|---|
| Cost sections populated | 30% | All required cost categories have at least one line item with a value | Yes |
| Bid bond confirmed | 15% | Bid bond document attached OR "Not Required" marked | Yes |
| Addenda acknowledged | 15% | All issued addenda acknowledged by Estimating Lead | Yes |
| Subcontractor coverage | 20% | Required trade categories have ≥1 sub quote | No |
| Bid documents attached | 10% | Plans + specs attached in `@hbc/sharepoint-docs` context | No |
| CE sign-off | 10% | Chief Estimator has reviewed (via `@hbc/acknowledgment`) | Yes |

**Readiness Score:** Weighted sum of completed criteria (0–100%)

**Status Labels:**
- 🟢 **Ready to Bid** (90–100%, no blockers)
- 🟡 **Nearly Ready** (70–89%, no blocking gaps)
- 🟠 **Attention Needed** (50–69% OR any blocker incomplete)
- 🔴 **Not Ready** (<50% OR critical blocker missing)

---
## Interface Contract

```typescript
// In @hbc/health-indicator primitive (new Tier-1 package)

export interface IHealthIndicatorCriterion {
  criterionId: string;
  label: string;
  weight: number;
  isBlocker: boolean;
  isComplete: (item: IHealthIndicatorItem) => boolean;
  completionDescription: (item: IHealthIndicatorItem) => string;
  actionHref: (item: IHealthIndicatorItem) => string;
  resolveAssignee: (item: IHealthIndicatorItem) => IBicOwner | null;
}

export interface IHealthIndicatorState {
  score: number;
  status: 'ready' | 'nearly-ready' | 'attention-needed' | 'not-ready';
  criteria: Array<{ /* ... */ }>;
  blockers: IHealthIndicatorCriterion[];
  daysUntilDue: number | null;
  isOverdue: boolean;
  version: VersionedRecord; // from @hbc/versioned-record
}
```

---
## Component Architecture

```
apps/estimating/src/features/bid-readiness/
├── useBidReadiness.ts              # now delegates to @hbc/health-indicator
├── BidReadinessSignal.tsx          # compact indicator for list rows
├── BidReadinessDashboard.tsx       # full detail panel in pursuit record
├── BidReadinessChecklist.tsx       # expandable criterion-by-criterion checklist
└── BidReadinessCriteria.ts         # criterion definitions (configurable)
```

(The entire model, offline logic, AI actions, and telemetry are now provided by the new `@hbc/health-indicator` primitive.)

---

## Component Specifications

### `BidReadinessSignal` — List Row Compact Indicator

**Visual behavior (Complexity-aware):**
- Essential: colored status dot + label + score + blocker badge only
- Standard/Expert: + owning avatar from `@hbc/bic-next-move`
- Hover tooltip shows top 3 incomplete criteria

### `BidReadinessDashboard` — Pursuit Record Detail Panel

**Visual behavior:**
- Large status indicator with score ring
- Bid due date with countdown
- Expandable `BidReadinessChecklist` (progressive disclosure per `@hbc/complexity`)

### `BidReadinessChecklist` — Criterion-by-Criterion Status

**Visual behavior:**
- Blockers first, then weighted criteria
- Each row includes completion status, assignee avatar (BIC), action deep-link (`@hbc/related-items`), and inline AI action buttons
- “Saved locally / Queued to sync” indicators when offline

---

## Admin Configuration & Governance

- Weights, blocker flags, and trade coverage threshold are configurable in the Admin module (Expert mode only)
- Full immutable audit trail via `@hbc/versioned-record`
- Admins can freeze/lock a readiness snapshot at submission
- Governance dashboard shows provenance of hybrid data sources and BIC ownership history

---

## AI Action Layer Integration

AI suggestions (“Suggest assignee”, “Draft acknowledgment from notes”, “Parse addendum from pasted email”) appear as contextual inline buttons inside the checklist. Suggestions cite sources, require explicit approval, and update both the criterion and the corresponding BIC record. No separate chat interface.

---

## Integration Points (All Tier-1 Primitives)

| Package | Integration |
|---|---|
| `@hbc/health-indicator` | New Tier-1 primitive providing the entire model |
| `@hbc/bic-next-move` | Granular per-criterion BIC ownership (blockers first) |
| `@hbc/complexity` | Essential/Standard/Expert progressive disclosure |
| `@hbc/versioned-record` | Immutable provenance, audit trail, snapshot freezing |
| `@hbc/related-items` | Direct deep-links from every criterion |
| `@hbc/project-canvas` | Automatic placement in role-aware My Work lane |
| `@hbc/notification-intelligence` | <48h with blockers → Immediate notification |
| `@hbc/acknowledgment` | CE sign-off criterion |
| `@hbc/sharepoint-docs` | Bid documents criterion |
| `@hbc/health-indicator` telemetry | Five KPIs (time-to-readiness, blocker-resolution latency, % Ready to Bid, submission error rate, checklist CES) surfaced in canvas and admin dashboard |

---

## Offline / PWA Resilience

Full tablet-native behavior: service worker caches the Dashboard and checklist; IndexedDB + `@hbc/versioned-record` persists drafts and state; Background Sync replays changes with optimistic UI and “Saved locally / Queued to sync” indicators. Works identically to Punch List and RFI drafts.

---

## Priority & ROI

**Priority:** P1 — The Estimating module's primary UX differentiator and the seed for the platform-wide `@hbc/health-indicator` primitive.
**Estimated build effort:** 2–3 sprint-weeks (now accelerated by reusing existing primitives).
**ROI:** Prevents bid submission failures; provides real-time accountability; creates measurable operational impact via UX telemetry; positions HB Intel as the first platform with a universal preconstruction health indicator.

---

## Definition of Done

- [ ] New `@hbc/health-indicator` Tier-1 primitive created and published
- [ ] All six locked integration patterns implemented and tested
- [ ] Offline/PWA resilience verified on tablet (service worker + IndexedDB + Background Sync)
- [ ] Embedded AI actions with provenance and approval guardrails
- [ ] Progressive disclosure via `@hbc/complexity` across all three modes
- [ ] Deep-links and canvas integration via `@hbc/related-items` and `@hbc/project-canvas`
- [ ] Versioned audit trail and admin governance via `@hbc/versioned-record`
- [ ] Five UX telemetry KPIs wired and surfaced
- [ ] Unit tests, Storybook stories for all modes and offline states
- [ ] ADR-00xx-health-indicator-primitive created

---

## ADR Reference

Create `docs/architecture/adr/0027-estimating-bid-readiness-signal.md` (and companion ADR for the new `@hbc/health-indicator` primitive) documenting the weighted scoring model, granular BIC integration, complexity-adaptive disclosure, offline strategy, AI Action Layer embedding, cross-module deep-linking, versioning/governance, and telemetry KPIs.
