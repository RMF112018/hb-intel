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

The Bid Readiness Signal computes a health score from these criteria and surfaces it at the top of every Active Pursuit — visible at a glance in the list view and detailed in the record view.

---

## Mold Breaker Rationale

This is a direct application of the `@hbc/bic-next-move` philosophy (Universal Next Move, Signature Solution #4) at the bid preparation level: every bid preparation requirement has an owner, a completion state, and a due date — and the system makes the incomplete requirements visible rather than hiding them behind a status field.

No current construction platform provides real-time bid readiness computation. Procore's estimating module shows bid status but not bid health. The Bid Readiness Signal is the Estimating module's most visible UX differentiator.

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
// In Estimating module domain types

export interface IBidReadinessCriterion {
  criterionId: string;
  label: string;
  weight: number; // 0-1, sum across all criteria = 1
  isBlocker: boolean;
  isComplete: (pursuit: IEstimatingPursuit) => boolean;
  completionDescription: (pursuit: IEstimatingPursuit) => string;
  /** Link to the section where this can be resolved */
  actionHref: (pursuit: IEstimatingPursuit) => string;
  /** Assignee responsible for this criterion */
  resolveAssignee: (pursuit: IEstimatingPursuit) => IBicOwner | null;
}

export interface IBidReadinessState {
  score: number; // 0-100
  status: 'ready-to-bid' | 'nearly-ready' | 'attention-needed' | 'not-ready';
  criteria: Array<{
    criterion: IBidReadinessCriterion;
    isComplete: boolean;
    assignee: IBicOwner | null;
    actionHref: string;
  }>;
  blockers: IBidReadinessCriterion[]; // incomplete blockers only
  daysUntilDue: number | null;
  isOverdue: boolean;
}
```

---

## Component Architecture

```
apps/estimating/src/features/bid-readiness/
├── useBidReadiness.ts              # computes IBidReadinessState from pursuit
├── BidReadinessSignal.tsx          # compact indicator for list rows
├── BidReadinessDashboard.tsx       # full detail panel in pursuit record
├── BidReadinessChecklist.tsx       # expandable criterion-by-criterion checklist
└── BidReadinessCriteria.ts         # criterion definitions (configurable)
```

---

## Component Specifications

### `BidReadinessSignal` — List Row Compact Indicator

**Visual behavior:**
- Colored status dot + label: "🟢 Ready to Bid" / "🟡 Nearly Ready" / "🟠 Attention Needed" / "🔴 Not Ready"
- Score percentage in subdued text: "(94%)"
- Blocker count badge: "2 blockers" in red if any blockers incomplete
- Hovering shows tooltip: top 3 incomplete criteria by weight

### `BidReadinessDashboard` — Pursuit Record Detail Panel

**Visual behavior:**
- Large status indicator at top with score ring
- Bid due date with countdown: "Due in 4 days" / "Overdue by 2 days"
- Expandable `BidReadinessChecklist` below

### `BidReadinessChecklist` — Criterion-by-Criterion Status

**Visual behavior:**
- Checklist of all criteria, grouped: Blockers first, then weighted criteria
- Each row: completion status icon, criterion label, assignee avatar, action link ("Complete bid bond", "Acknowledge addendum")
- Blocker rows in red with "BLOCKING" badge
- Complete rows in green with completion timestamp

---

## Admin Configuration

The criterion weights, blocker designations, and required trade coverage threshold are configurable in the Admin module:

- Admin can add custom criteria (e.g., "Prequalification submitted" for specific owner types)
- Admin can adjust weights for firm-specific priorities
- Admin can set the trade coverage threshold (e.g., "Mechanical, Electrical, Plumbing must have ≥1 quote")

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | Incomplete blocker criteria → BIC ownership assigned to criterion's `resolveAssignee`; blocker clears when criterion is met |
| `@hbc/acknowledgment` | CE sign-off criterion uses `@hbc/acknowledgment` single-party acknowledgment |
| `@hbc/sharepoint-docs` | "Bid documents attached" criterion resolves against `@hbc/sharepoint-docs` document list for the pursuit |
| `@hbc/notification-intelligence` | Bid due within 48h with incomplete blockers → Immediate notification to Estimating Lead and CE |
| `@hbc/complexity` | Essential: status dot only; Standard: checklist visible; Expert: full criterion weights + admin config link |
| PH9b My Work Feed (§A) | Pursuit with incomplete blockers within 48h of due date → high-priority My Work Feed item |

---

## Priority & ROI

**Priority:** P1 — The Estimating module's primary UX differentiator; transforms static bid status into actionable readiness intelligence
**Estimated build effort:** 2–3 sprint-weeks (readiness model, three components, criterion definitions, admin config)
**ROI:** Prevents bid submission failures; provides real-time accountability for bid preparation tasks; creates a visible, role-specific BIC chain across all bid preparation requirements

---

## Definition of Done

- [ ] `IBidReadinessCriterion` and `IBidReadinessState` types defined
- [ ] `useBidReadiness` computes score and status from pursuit state + criteria
- [ ] Default 6 criteria implemented with correct weights and blocker flags
- [ ] `BidReadinessSignal` renders compact status dot + label + score in list rows
- [ ] `BidReadinessDashboard` renders score ring + due date countdown
- [ ] `BidReadinessChecklist` renders all criteria with completion status + assignee + action link
- [ ] Admin configuration: weights, blocker flags, trade coverage threshold adjustable
- [ ] `@hbc/bic-next-move` integration: incomplete blockers create BIC ownership records
- [ ] `@hbc/acknowledgment` integration: CE sign-off criterion uses acknowledgment pattern
- [ ] `@hbc/notification-intelligence`: <48h with blockers → Immediate notification
- [ ] `@hbc/complexity` integration: all three tiers
- [ ] Unit tests on readiness score computation and status classification
- [ ] Storybook: all four status states, checklist with mixed completion states

---

## ADR Reference

Create `docs/architecture/adr/0027-estimating-bid-readiness-signal.md` documenting the weighted scoring model, the blocker vs. non-blocker criterion distinction, the admin configurability rationale, and the BIC integration strategy for criterion-level ownership.
