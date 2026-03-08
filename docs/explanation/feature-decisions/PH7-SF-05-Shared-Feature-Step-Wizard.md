# PH7-SF-05: `@hbc/step-wizard` — Multi-Step Guided Workflow Primitive

**Priority Tier:** 1 — Foundation (must exist before any multi-step form or onboarding flow)
**Package:** `packages/step-wizard/`
**Interview Decision:** Q4 — Option B confirmed
**Mold Breaker Source:** UX-MB §11 (Learnability); ux-mold-breaker.md Signature Solution #2 (Complexity Dial); con-tech-ux-study §11 (Learnability gap across platforms)

---

## Problem Solved

Several HB Intel workflows require guided, multi-step user journeys where:
- Each step has distinct validation requirements
- Progress must be preserved if the user navigates away (or loses connectivity)
- Steps may be completed out of order in some contexts but not others
- Individual steps may be assigned to different users (requiring BIC-awareness)
- Completion of one step unlocks or triggers the next

Current construction platforms present these multi-step processes as flat forms or ad hoc page sequences — with no persistent progress indicator, no step-level validation feedback, and no memory of partial completion. Users who are interrupted mid-process must restart from scratch or rely on memory.

**Confirmed Phase 7 use cases:**
- BD Go/No-Go Scorecard: 5-step departmental completion flow (BD, Estimating, Operations, Finance, Executive)
- Project Hub Turnover Meeting: structured meeting preparation steps
- Admin User Provisioning: multi-step provisioning task list
- `@hbc/workflow-handoff`: multi-step handoff package assembly

Without a shared `@hbc/step-wizard`, each module builds its own stepper widget, creating inconsistent UX, duplicated draft-persistence code, and incompatible step-validation patterns.

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #2 (Complexity Dial) identifies step-by-step guidance as a key Essential-tier UX mode. The learnability principle (§7.3) requires that complex multi-step processes be presented progressively, with clear progress indication and the ability to resume. The con-tech UX study §11 scores learnability as the lowest dimension across all seven platforms — none offer a persistent, resumable step system.

`@hbc/step-wizard` makes progressive guided workflows a platform-wide primitive, ensuring that every multi-step process in HB Intel behaves consistently regardless of which module the user is in.

---

## Applicable Modules

| Module | Use Case | Steps | Order |
|---|---|---|---|
| Business Development | Go/No-Go Scorecard sections | 5 (one per department) | Parallel (any order) |
| Business Development | Scorecard submission flow | 3 (review → submit → confirm) | Sequential |
| Project Hub | Turnover Meeting prep | Variable (configurable) | Sequential |
| Project Hub | PMP approval workflow | Variable | Sequential |
| Admin | User provisioning tasks | Variable | Sequential |
| `@hbc/workflow-handoff` | Handoff package assembly | Variable | Sequential |

---

## Interface Contract

```typescript
// packages/step-wizard/src/types/IStepWizard.ts

export type StepStatus = 'not-started' | 'in-progress' | 'complete' | 'blocked' | 'skipped';
export type StepOrderMode = 'sequential' | 'parallel' | 'sequential-with-jumps';

export interface IStep<T> {
  /** Unique stable key for this step */
  stepId: string;
  /** Display label */
  label: string;
  /** Optional icon key from @hbc/ui-kit icon set */
  icon?: string;
  /** Whether this step is required for overall completion */
  required: boolean;
  /** For sequential mode: step index (1-based) */
  order?: number;
  /** Resolves assigned user for this step (integrates with BIC) */
  resolveAssignee?: (item: T) => IBicOwner | null;
  /** Resolves whether this step is currently blocked */
  resolveIsBlocked?: (item: T) => boolean;
  /** Blocking reason text */
  resolveBlockedReason?: (item: T) => string | null;
  /** Validation: returns null if valid, error message string if invalid */
  validate?: (item: T) => string | null;
  /** Called when this step is marked complete */
  onComplete?: (item: T) => void | Promise<void>;
}

export interface IStepWizardConfig<T> {
  /** Human-readable title for the wizard */
  title: string;
  steps: IStep<T>[];
  orderMode: StepOrderMode;
  /** Whether the user can mark a step complete without validation passing */
  allowForceComplete?: boolean;
  /** Called when all required steps are complete */
  onAllComplete?: (item: T) => void | Promise<void>;
  /** Draft key for @hbc/session-state persistence */
  draftKey?: string;
}

export interface IStepWizardState {
  steps: Array<IStep<unknown> & { status: StepStatus; completedAt: string | null; assignee: IBicOwner | null }>;
  activeStepId: string | null;
  completedCount: number;
  requiredCount: number;
  isComplete: boolean;
  percentComplete: number;
}
```

---

## Package Architecture

```
packages/step-wizard/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IStepWizard.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useStepWizard.ts              # resolves state, advance, go-to, complete
│   │   └── useStepProgress.ts            # returns completion metrics for display
│   └── components/
│       ├── HbcStepWizard.tsx             # full stepper UI with content slot
│       ├── HbcStepProgress.tsx           # compact progress bar / ring for list rows
│       ├── HbcStepSidebar.tsx            # vertical step nav for detail pages
│       └── index.ts
```

---

## Component Specifications

### `HbcStepWizard` — Full Guided Stepper

The primary rendering component. Accepts a content render function for each step's body.

```typescript
interface HbcStepWizardProps<T> {
  item: T;
  config: IStepWizardConfig<T>;
  /** Render function for the active step's body content */
  renderStep: (stepId: string, item: T) => React.ReactNode;
  /** Variant: 'horizontal' (top progress bar) or 'vertical' (sidebar nav) */
  variant?: 'horizontal' | 'vertical';
}
```

**Visual behavior:**

- **Horizontal variant** (modal/focused flows):
  - Top progress bar with step dots
  - Active step label displayed prominently
  - Back / Next / Complete CTAs at bottom
  - Step validation error shown inline on Next attempt

- **Vertical variant** (detail page embedded flows):
  - Left sidebar: step list with status icons
  - Right content: active step body
  - Each step row shows: status icon, label, assignee avatar (if BIC-integrated), completion timestamp

**Status icons:**
- ○ Not started (grey)
- ◐ In progress (blue)
- ✓ Complete (green)
- 🔒 Blocked (amber)
- ⊘ Skipped (grey strikethrough)

### `HbcStepProgress` — List Row Compact Indicator

```typescript
interface HbcStepProgressProps<T> {
  item: T;
  config: IStepWizardConfig<T>;
  /** 'bar' (horizontal progress bar) or 'ring' (circular) or 'fraction' (e.g., "3 of 5") */
  variant?: 'bar' | 'ring' | 'fraction';
}
```

### `HbcStepSidebar` — Standalone Sidebar Navigation

Standalone version of the vertical step nav for embedding in existing detail page layouts that manage their own content area.

```typescript
interface HbcStepSidebarProps<T> {
  item: T;
  config: IStepWizardConfig<T>;
  activeStepId: string;
  onStepSelect: (stepId: string) => void;
}
```

---

## Draft Persistence Integration

`@hbc/step-wizard` integrates with `@hbc/session-state` to persist step progress across sessions:

```typescript
// Automatic if draftKey is provided in config
const wizardConfig: IStepWizardConfig<IGoNoGoScorecard> = {
  title: 'Go/No-Go Scorecard',
  draftKey: `scorecard-wizard-${scorecard.id}`,  // unique per record
  // ...
};

// On mount: useStepWizard restores step status from session state
// On step completion: step status auto-persisted
// On reconnect: pending step completions sync to server
```

---

## BIC Integration

When `resolveAssignee` is provided for a step, `@hbc/step-wizard` registers BIC state for each step:
- The step's current assignee becomes the BIC owner
- The step's status maps to BIC urgency: `in-progress` + past due date → Immediate; `in-progress` + due this week → Watch
- BIC transfers automatically when a step is completed and the wizard advances to the next step's assignee

---

## Module Adoption Guide

**Step 1: Define step configuration**
```typescript
import { IStepWizardConfig } from '@hbc/step-wizard';
import { IGoNoGoScorecard } from '../types';

export const scorecardWizardConfig: IStepWizardConfig<IGoNoGoScorecard> = {
  title: 'Go/No-Go Scorecard Completion',
  orderMode: 'parallel',
  draftKey: (scorecard) => `scorecard-wizard-${scorecard.id}`,
  steps: [
    {
      stepId: 'bd-section',
      label: 'Business Development Section',
      required: true,
      resolveAssignee: (s) => ({ userId: s.bdManagerId, displayName: s.bdManagerName, role: 'BD Manager' }),
      resolveIsBlocked: () => false,
      validate: (s) => s.bdSectionComplete ? null : 'BD section has unanswered required questions.',
    },
    {
      stepId: 'estimating-section',
      label: 'Estimating Section',
      required: true,
      resolveAssignee: (s) => ({ userId: s.estimatingLeadId, displayName: s.estimatingLeadName, role: 'Estimating Lead' }),
      validate: (s) => s.estimatingSectionComplete ? null : 'Estimating section has unanswered required questions.',
    },
    // ... operations, finance, executive sections
  ],
  onAllComplete: async (scorecard) => {
    await submitScorecardForDirectorReview(scorecard.id);
  },
};
```

**Step 2: Render the wizard**
```typescript
import { HbcStepWizard } from '@hbc/step-wizard';

<HbcStepWizard
  item={scorecard}
  config={scorecardWizardConfig}
  variant="vertical"
  renderStep={(stepId, item) => {
    switch (stepId) {
      case 'bd-section': return <BdSectionForm scorecard={item} />;
      case 'estimating-section': return <EstimatingSectionForm scorecard={item} />;
      // ...
    }
  }}
/>
```

**Step 3: Show progress in list rows**
```typescript
import { HbcStepProgress } from '@hbc/step-wizard';

<HbcStepProgress item={scorecard} config={scorecardWizardConfig} variant="fraction" />
```

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | Each step's assignee registers as BIC owner; step completion triggers BIC transfer |
| `@hbc/session-state` | Step progress persisted via `draftKey`; offline completions queued and synced |
| `@hbc/acknowledgment` | A wizard step may embed `HbcAcknowledgmentPanel` as its body content |
| `@hbc/complexity` | Essential: simplified step view with coaching; Expert: full step detail with validation messages |
| `@hbc/notification-intelligence` | Step assignment → Immediate notification to assignee; step overdue → Immediate escalation |
| PH9b Auto-Save Draft (§C) | Step body forms use `useFormDraft` for field-level auto-save within each step |
| PH9b My Work Feed (§A) | Steps assigned to current user appear in My Work Feed |

---

## SPFx Constraints

- `HbcStepWizard` vertical variant is the preferred SPFx webpart layout
- Step content slots (`renderStep`) must be SPFx-compatible (no TanStack Router dependencies within step bodies)
- Draft persistence uses `@hbc/session-state` IndexedDB layer, available in both PWA and SPFx contexts

---

## Priority & ROI

**Priority:** P0 — Blocks BD scorecard section flow, Project Hub Turnover Meeting prep, and Admin provisioning task list; all three are core Phase 7 deliverables
**Estimated build effort:** 3–4 sprint-weeks (three components, two modes, draft integration, BIC integration)
**ROI:** Eliminates per-module stepper duplication (estimated 3–5 modules would otherwise each build their own); provides consistent progress visibility across all multi-step flows; makes onboarding workflows resumable

---

## Definition of Done

- [ ] `IStepWizardConfig<T>` contract defined and exported
- [ ] `useStepWizard` resolves state, exposes `advance`, `goTo`, `markComplete`, `markBlocked`
- [ ] `HbcStepWizard` renders horizontal and vertical variants correctly
- [ ] `HbcStepProgress` renders bar, ring, and fraction variants
- [ ] `HbcStepSidebar` renders standalone with onStepSelect callback
- [ ] Sequential mode: enforces step order; blocks advance until validation passes
- [ ] Parallel mode: allows any order; tracks independent step statuses
- [ ] BIC integration: step assignees registered as BIC owners; transfers on completion
- [ ] Draft persistence: step status auto-saved via `@hbc/session-state` when `draftKey` provided
- [ ] `@hbc/notification-intelligence` registration: step assignment → Immediate; overdue → escalation
- [ ] `@hbc/complexity` integration: Essential coaching mode, Expert detailed validation messages
- [ ] Unit tests ≥95% on step state machine (all status transitions)
- [ ] Storybook: sequential and parallel modes, all step states, BIC-integrated example

---

## ADR Reference

Create `docs/architecture/adr/0014-step-wizard-platform-primitive.md` documenting the decision to build a shared step wizard rather than per-module implementations, the sequential vs. parallel mode design, and the BIC integration strategy for step-level ownership.
