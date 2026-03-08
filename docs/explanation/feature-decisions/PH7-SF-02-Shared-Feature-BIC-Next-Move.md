# PH7-SF-02: `@hbc/bic-next-move` — Universal Ball-In-Court & Next Move Ownership

**Priority Tier:** 1 — Foundation (must exist before any domain module)
**Package:** `packages/bic-next-move/`
**Interview Decision:** Q16 — Option B confirmed; named `@hbc/bic-next-move` for construction-industry clarity
**Mold Breaker Source:** UX-MB §4 (Universal Next Move); con-tech-ux-study §8.2 (Procore Ball In Court); ux-mold-breaker.md Signature Solution #4

---

## Problem Solved

The single most critical UX question in construction management software is: **"Who owns the next move on this item?"** Procore's Ball In Court (BIC) system is the industry's best answer — but the UX study documents a fatal inconsistency: BIC exists on submittals and RFIs but not on Change Events. Users who rely on BIC in some tools and find it absent in others are disoriented and the platform loses its accountability value.

HB Intel solves this by making Next Move ownership a **platform-wide primitive** applied to every actionable item in every module. Every record shows not just who holds it, but what they need to do, when it's due, why it's blocked (if applicable), who passed it here, and who receives it next.

---

## Mold Breaker Rationale

The ux-mold-breaker.md Operating Principle §7.2 states: "Responsibility-first — every actionable item shows who owns the next move." Signature Solution #4 specifies the full data model: current owner, expected action, due/overdue state, escalation path, reason blocked, previous owner, next downstream owner. This extends Procore's BIC concept beyond its current inconsistencies and makes accountability a cross-platform primitive rather than a tool-specific feature.

The competitive impact is direct: HB Intel's `@hbc/bic-next-move` appears on every actionable item across every module — something no competitor currently achieves.

---

## Applicable Modules

Every module that has actionable items. Confirmed Phase 7 uses:

| Module | Items | Ownership Model |
|---|---|---|
| Business Development | Go/No-Go Scorecard | Workflow-state-derived (shifts by stage) |
| Business Development | Departmental sections | Direct assignee (tagged lead) |
| Estimating | Active Pursuits | Direct assignee (Estimating Coordinator) |
| Estimating | Kickoff meetings | Direct assignee (scheduler) |
| Project Hub | PMP approval cycle | Workflow-state-derived |
| Project Hub | Turnover Meeting sign-off | Direct assignee (each signatory) |
| Project Hub | Constraints | Direct assignee |
| Project Hub | Permit Log items | Direct assignee |
| Project Hub | Monthly Review steps | Direct assignee |
| Admin | Provisioning tasks | Direct assignee |

---

## Interface Contract

```typescript
// packages/bic-next-move/src/types/IBicNextMove.ts

export type BicOwnershipModel = 'direct-assignee' | 'workflow-state-derived';

export interface IBicNextMoveConfig<T> {
  /** Which ownership model this item type uses */
  ownershipModel: BicOwnershipModel;
  /**
   * For workflow-state-derived: function that computes current owner from item state.
   * For direct-assignee: function that returns the assignee field.
   */
  resolveCurrentOwner: (item: T) => IBicOwner | null;
  /** Plain-language description of what the current owner needs to do */
  resolveExpectedAction: (item: T) => string;
  /** ISO 8601 due date for the current owner's action */
  resolveDueDate: (item: T) => string | null;
  /** Returns true if the item cannot advance due to a blocking condition */
  resolveIsBlocked: (item: T) => boolean;
  /** Plain-language reason the item is blocked (if blocked) */
  resolveBlockedReason: (item: T) => string | null;
  /** Previous owner before the current BIC transfer */
  resolvePreviousOwner: (item: T) => IBicOwner | null;
  /** Next owner after current owner completes their action */
  resolveNextOwner: (item: T) => IBicOwner | null;
  /** Escalation rule: who is notified if action is not taken by due date */
  resolveEscalationOwner: (item: T) => IBicOwner | null;
}

export interface IBicOwner {
  userId: string;
  displayName: string;
  role: string;
  /** Optional group context (e.g., "Estimating Department") */
  groupContext?: string;
}

export interface IBicNextMoveState {
  currentOwner: IBicOwner | null;
  expectedAction: string;
  dueDate: string | null;
  isOverdue: boolean;
  isBlocked: boolean;
  blockedReason: string | null;
  previousOwner: IBicOwner | null;
  nextOwner: IBicOwner | null;
  escalationOwner: IBicOwner | null;
  /** Urgency tier for notification-intelligence integration */
  urgencyTier: 'immediate' | 'watch' | 'upcoming';
}
```

---

## Package Architecture

```
packages/bic-next-move/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IBicNextMove.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useBicNextMove.ts             # resolves state from config + item
│   │   └── useBicMyItems.ts              # returns all items where user is current owner
│   └── components/
│       ├── HbcBicBadge.tsx               # compact owner badge for list rows
│       ├── HbcBicDetail.tsx              # full ownership trail for record detail pages
│       ├── HbcBicBlockedBanner.tsx       # prominent banner when item is blocked
│       └── index.ts
```

---

## Component Specifications

### `HbcBicBadge` — List Row Compact Display

Renders in table/list rows to show ownership at a glance.

```typescript
interface HbcBicBadgeProps<T> {
  item: T;
  config: IBicNextMoveConfig<T>;
  /** Compact: show avatar + name only. Full: show action text */
  variant?: 'compact' | 'full';
}
```

**Visual behavior:**
- Shows owner avatar, display name, and urgency-colored dot (🔴 overdue / 🟡 due this week / 🟢 upcoming)
- Hovering shows a tooltip with expectedAction and dueDate
- Blocked items show a 🔒 indicator instead of urgency dot

### `HbcBicDetail` — Record Detail Full Ownership Trail

Renders in record detail pages as a section showing the complete Next Move picture.

```typescript
interface HbcBicDetailProps<T> {
  item: T;
  config: IBicNextMoveConfig<T>;
  /** Whether to show the full previous owner + next owner chain */
  showChain?: boolean;
}
```

**Visual behavior:**
- Full ownership trail: Previous Owner → **Current Owner** → Next Owner
- Expected action displayed as a prominent callout
- Due date with relative time ("Due in 2 days" / "Overdue by 3 days")
- Escalation owner shown in subdued text: "Escalates to [name] if not actioned by [date]"
- Blocked state shows `HbcBicBlockedBanner` inline

### `HbcBicBlockedBanner`

Prominent warning shown when an item cannot advance due to a blocking condition.

```typescript
interface HbcBicBlockedBannerProps {
  blockedReason: string;
  /** Link to the blocking item if cross-module */
  blockedByItem?: { label: string; href: string };
}
```

---

## Integration Points

| Package | Integration |
|---|---|
| My Work Feed (PH9b §A) | Feed aggregates all items where `currentOwner.userId === authenticatedUser.id`; urgency tier maps to feed priority tiers |
| `@hbc/notification-intelligence` | BIC transfers (ownership changes) register as Immediate-tier notifications; overdue items register as Immediate escalation |
| `@hbc/project-canvas` | Project Canvas widgets consume `useBicMyItems` to show role-relevant owned items |
| `@hbc/workflow-handoff` | Handoff events appear as BIC transfers — receipt acknowledgment creates a new BIC state |
| `@hbc/related-items` | Related items panel shows the BIC state of each linked record |
| `@hbc/search` | BIC state is a searchable dimension: filter by `responsibleParty`, `isBlocked`, `isOverdue` |

---

## SPFx Constraints

- `HbcBicBadge` imports from `@hbc/ui-kit/app-shell` in SPFx breakout webpart contexts (shell-only)
- `HbcBicDetail` imports from full `@hbc/ui-kit` in PWA and non-constrained contexts
- BIC state resolution (`useBicNextMove`) runs entirely client-side from cached item data — no additional API calls required at render time

---

## Module Adoption Guide

**Step 1: Define the BIC configuration for your item type**
```typescript
// In your module's domain types file
import { IBicNextMoveConfig } from '@hbc/bic-next-move';
import { IGoNoGoScorecard } from '../types';

export const scorecardBicConfig: IBicNextMoveConfig<IGoNoGoScorecard> = {
  ownershipModel: 'workflow-state-derived',
  resolveCurrentOwner: (scorecard) => {
    switch (scorecard.workflowStage) {
      case 'draft': return { userId: scorecard.bdManagerId, displayName: scorecard.bdManagerName, role: 'BD Manager' };
      case 'director-review': return { userId: scorecard.directorId, displayName: scorecard.directorName, role: 'Director of Preconstruction' };
      case 'committee-scheduling': return { userId: scorecard.estimatingCoordinatorId, displayName: scorecard.estimatingCoordinatorName, role: 'Estimating Coordinator' };
      default: return null;
    }
  },
  resolveExpectedAction: (scorecard) => {
    switch (scorecard.workflowStage) {
      case 'draft': return 'Complete all departmental sections and submit for review';
      case 'director-review': return 'Review scorecard and accept, reject, or request clarification';
      case 'committee-scheduling': return 'Schedule Go/No-Go Committee Meeting by ' + scorecard.meetingDeadline;
      default: return 'No action required';
    }
  },
  resolveDueDate: (scorecard) => scorecard.currentStageDueDate ?? null,
  resolveIsBlocked: (scorecard) => scorecard.incompleteDepartmentalSections.length > 0,
  resolveBlockedReason: (scorecard) => scorecard.incompleteDepartmentalSections.length > 0
    ? `Waiting on ${scorecard.incompleteDepartmentalSections.join(', ')} to complete their section`
    : null,
  resolvePreviousOwner: (scorecard) => scorecard.previousStageOwner ?? null,
  resolveNextOwner: (scorecard) => scorecard.nextStageOwner ?? null,
  resolveEscalationOwner: (scorecard) => ({ userId: scorecard.vpOperationsId, displayName: scorecard.vpOperationsName, role: 'VP of Operations' }),
};
```

**Step 2: Render in list rows**
```typescript
import { HbcBicBadge } from '@hbc/bic-next-move';

<HbcBicBadge item={scorecard} config={scorecardBicConfig} variant="compact" />
```

**Step 3: Render in detail view**
```typescript
import { HbcBicDetail } from '@hbc/bic-next-move';

<HbcBicDetail item={scorecard} config={scorecardBicConfig} showChain={true} />
```

---

## Priority & ROI

**Priority:** P0 — Accountability primitive; feeds My Work Feed, Project Canvas, and notification intelligence
**Estimated build effort:** 3–4 sprint-weeks (contract, hooks, three components, integration tests)
**ROI:** Resolves the #1 accountability gap documented across all seven competitors; makes HB Intel's responsibility model consistent where Procore's is not; every future module adopts this for free via the configuration contract

---

## Definition of Done

- [ ] `IBicNextMoveConfig<T>` contract defined and exported
- [ ] `useBicNextMove` resolves full `IBicNextMoveState` from config + item
- [ ] `useBicMyItems` returns paginated list of items owned by authenticated user across registered modules
- [ ] `HbcBicBadge` renders compact ownership in list rows with urgency dot
- [ ] `HbcBicDetail` renders full ownership trail with chain
- [ ] `HbcBicBlockedBanner` renders blocked state with reason and cross-module link
- [ ] My Work Feed integration verified (urgency tier → feed priority mapping)
- [ ] `@hbc/notification-intelligence` registration: BIC transfer → Immediate notification
- [ ] `@hbc/complexity` integration: Essential shows owner only; Expert shows full chain
- [ ] Unit tests ≥95% on all resolver functions
- [ ] Storybook stories for all three components in all urgency states

---

## ADR Reference

Create `docs/architecture/adr/0011-bic-next-move-platform-primitive.md` documenting the decision to generalize Procore's BIC concept into a platform-wide ownership primitive, the two ownership resolution models (direct-assignee vs. workflow-state-derived), and the naming rationale.
