# SF05-T08 — Testing Strategy: `@hbc/step-wizard`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 through D-10 (all)
**Estimated Effort:** 0.25 sprint-weeks
**Wave:** 4

---

## Objective

Define the complete testing strategy: the `testing/` sub-path implementation (D-10), unit test matrix, Storybook story requirements, and Playwright E2E scenarios.

---

## 3-Line Plan

1. Implement all four `testing/` sub-path exports with 6 canonical `mockWizardStates` covering all significant rendering branches.
2. Define the unit test matrix covering all state machine transitions, hook mutations, and component rendering paths.
3. Define Storybook stories for all three modes and all five step statuses, plus Playwright E2E scenarios covering all locked decisions.

---

## Testing Sub-Path Exports (D-10)

### `testing/mockWizardStates.ts` — 6 Canonical States

```typescript
import type { IStepWizardState, IStepWizardDraft } from '../src/types/IStepWizard';

const STEP_1 = { stepId: 'step-1', label: 'First Step', required: true, order: 1,
  status: 'not-started' as const, completedAt: null, assignee: null,
  validationError: null, isOverdue: false, isVisited: true, isUnlocked: true };
const STEP_2 = { stepId: 'step-2', label: 'Second Step', required: true, order: 2,
  status: 'not-started' as const, completedAt: null, assignee: null,
  validationError: null, isOverdue: false, isVisited: false, isUnlocked: false };
const STEP_3 = { stepId: 'step-3', label: 'Third Step', required: false, order: 3,
  status: 'not-started' as const, completedAt: null, assignee: null,
  validationError: null, isOverdue: false, isVisited: false, isUnlocked: false };

const BASE_DRAFT: IStepWizardDraft = {
  stepStatuses: { 'step-1': 'not-started', 'step-2': 'not-started', 'step-3': 'not-started' },
  completedAts: { 'step-1': null, 'step-2': null, 'step-3': null },
  visitedStepIds: [],
  onAllCompleteFired: false,
  savedAt: '2026-03-08T09:00:00Z',
};

export const mockWizardStates = {
  /** All steps not-started; step-1 is active. */
  notStarted: {
    state: {
      steps: [STEP_1, STEP_2, STEP_3],
      activeStepId: 'step-1',
      completedCount: 0, requiredCount: 2,
      isComplete: false, percentComplete: 0,
      onAllCompleteFired: false,
    } satisfies IStepWizardState,
    draft: BASE_DRAFT,
  },

  /** Step 1 complete; step 2 in-progress; step 3 not-started. */
  inProgress: {
    state: {
      steps: [
        { ...STEP_1, status: 'complete', completedAt: '2026-03-08T09:10:00Z', isVisited: true },
        { ...STEP_2, status: 'in-progress', isVisited: true, isUnlocked: true },
        { ...STEP_3, isUnlocked: true },
      ],
      activeStepId: 'step-2',
      completedCount: 1, requiredCount: 2,
      isComplete: false, percentComplete: 50,
      onAllCompleteFired: false,
    } satisfies IStepWizardState,
    draft: {
      ...BASE_DRAFT,
      stepStatuses: { 'step-1': 'complete', 'step-2': 'in-progress', 'step-3': 'not-started' },
      completedAts: { 'step-1': '2026-03-08T09:10:00Z', 'step-2': null, 'step-3': null },
      visitedStepIds: ['step-1', 'step-2'],
    },
  },

  /** All required steps complete; onAllCompleteFired: true. (D-07) */
  complete: {
    state: {
      steps: [
        { ...STEP_1, status: 'complete', completedAt: '2026-03-08T09:10:00Z', isVisited: true },
        { ...STEP_2, status: 'complete', completedAt: '2026-03-08T09:20:00Z', isVisited: true, isUnlocked: true },
        { ...STEP_3, isUnlocked: true },
      ],
      activeStepId: null,
      completedCount: 2, requiredCount: 2,
      isComplete: true, percentComplete: 100,
      onAllCompleteFired: true,
    } satisfies IStepWizardState,
    draft: {
      ...BASE_DRAFT,
      stepStatuses: { 'step-1': 'complete', 'step-2': 'complete', 'step-3': 'not-started' },
      completedAts: { 'step-1': '2026-03-08T09:10:00Z', 'step-2': '2026-03-08T09:20:00Z', 'step-3': null },
      visitedStepIds: ['step-1', 'step-2'],
      onAllCompleteFired: true,
    },
  },

  /** Step 2 blocked; workflow stalled. (D-02 terminal state) */
  withBlocked: {
    state: {
      steps: [
        { ...STEP_1, status: 'complete', completedAt: '2026-03-08T09:10:00Z', isVisited: true },
        { ...STEP_2, status: 'blocked', isVisited: true, isUnlocked: true },
        { ...STEP_3 },
      ],
      activeStepId: 'step-2',
      completedCount: 1, requiredCount: 2,
      isComplete: false, percentComplete: 50,
      onAllCompleteFired: false,
    } satisfies IStepWizardState,
    draft: {
      ...BASE_DRAFT,
      stepStatuses: { 'step-1': 'complete', 'step-2': 'blocked', 'step-3': 'not-started' },
      completedAts: { 'step-1': '2026-03-08T09:10:00Z', 'step-2': null, 'step-3': null },
      visitedStepIds: ['step-1', 'step-2'],
    },
  },

  /** Step 2 skipped (optional); step 3 is active. (D-02 terminal state) */
  withSkipped: {
    state: {
      steps: [
        { ...STEP_1, status: 'complete', completedAt: '2026-03-08T09:10:00Z', isVisited: true },
        { ...STEP_2, status: 'skipped', isVisited: true, isUnlocked: true },
        { ...STEP_3, status: 'in-progress', isUnlocked: true },
      ],
      activeStepId: 'step-3',
      completedCount: 1, requiredCount: 2,
      isComplete: false, percentComplete: 50,
      onAllCompleteFired: false,
    } satisfies IStepWizardState,
    draft: {
      ...BASE_DRAFT,
      stepStatuses: { 'step-1': 'complete', 'step-2': 'skipped', 'step-3': 'in-progress' },
      completedAts: { 'step-1': '2026-03-08T09:10:00Z', 'step-2': null, 'step-3': null },
      visitedStepIds: ['step-1', 'step-2', 'step-3'],
    },
  },

  /** Parallel mode: steps 1 and 3 complete, step 2 still in-progress. */
  partialParallel: {
    state: {
      steps: [
        { ...STEP_1, status: 'complete', completedAt: '2026-03-08T09:10:00Z', isVisited: true, isUnlocked: true },
        { ...STEP_2, status: 'in-progress', isVisited: true, isUnlocked: true },
        { ...STEP_3, status: 'complete', completedAt: '2026-03-08T09:15:00Z', isVisited: true, isUnlocked: true },
      ],
      activeStepId: 'step-2',
      completedCount: 2, requiredCount: 2,
      isComplete: false, percentComplete: 50, // step-2 still required
      onAllCompleteFired: false,
    } satisfies IStepWizardState,
    draft: {
      ...BASE_DRAFT,
      stepStatuses: { 'step-1': 'complete', 'step-2': 'in-progress', 'step-3': 'complete' },
      completedAts: { 'step-1': '2026-03-08T09:10:00Z', 'step-2': null, 'step-3': '2026-03-08T09:15:00Z' },
      visitedStepIds: ['step-1', 'step-2', 'step-3'],
    },
  },
} as const;
```

---

### `testing/createMockWizardConfig.ts`

```typescript
import type { IStepWizardConfig } from '../src/types/IStepWizard';

export function createMockWizardConfig<T = unknown>(
  overrides?: Partial<IStepWizardConfig<T>>
): IStepWizardConfig<T> {
  return {
    title: 'Mock Wizard',
    orderMode: 'sequential',
    steps: [
      { stepId: 'step-1', label: 'First Step',  required: true,  order: 1 },
      { stepId: 'step-2', label: 'Second Step', required: true,  order: 2 },
      { stepId: 'step-3', label: 'Third Step',  required: false, order: 3 },
    ],
    allowReopen: false,
    allowForceComplete: false,
    draftKey: 'mock-wizard-test',
    ...overrides,
  };
}
```

---

### `testing/mockUseStepWizard.ts`

```typescript
import { vi } from 'vitest';
import type { IUseStepWizardReturn, IStepWizardState } from '../src/types/IStepWizard';
import { mockWizardStates } from './mockWizardStates';

export function mockUseStepWizard(
  state: IStepWizardState = mockWizardStates.notStarted.state
): IUseStepWizardReturn {
  return {
    state,
    advance: vi.fn(),
    goTo: vi.fn(),
    markComplete: vi.fn().mockResolvedValue(undefined),
    markBlocked: vi.fn(),
    reopenStep: vi.fn(),
    getValidationError: vi.fn().mockReturnValue(null),
  };
}
```

---

### `testing/createWizardWrapper.tsx`

```typescript
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComplexityTestProvider } from '@hbc/complexity/testing';
import type { IStepWizardState } from '../src/types/IStepWizard';

export function createWizardWrapper(
  initialState?: { state: IStepWizardState; draft: unknown },
  tier: 'essential' | 'standard' | 'expert' = 'standard'
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function WizardWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ComplexityTestProvider _testPreference={{ tier, showCoaching: false }}>
          {children}
        </ComplexityTestProvider>
      </QueryClientProvider>
    );
  };
}
```

---

## Unit Test Matrix

### State Machine (`stepStateMachine.ts`)

| Test | Covers |
|---|---|
| All 6 monotonic merge combinations | D-02 |
| `blocked` beats all non-terminal statuses | D-02 |
| `skipped` beats all non-terminal statuses | D-02 |
| `complete` beats `in-progress` | D-02 |
| `guardMarkComplete` — valid required step | D-03 |
| `guardMarkComplete` — invalid required step blocked | D-03 |
| `guardMarkComplete` — invalid optional step allowed | D-03 |
| `guardMarkComplete` — force=true bypasses validation | D-03 |
| `guardMarkComplete` — terminal step rejected | D-02 |
| `guardMarkComplete` — sequential order: prior step incomplete blocks | core |
| `guardGoTo` — sequential: only active step allowed | core |
| `guardGoTo` — parallel: any step allowed | core |
| `guardGoTo` — s-w-j: visited step allowed | D-01 |
| `guardGoTo` — s-w-j: unlocked-but-unvisited next step allowed | D-01 |
| `guardGoTo` — s-w-j: locked step blocked | D-01 |
| `guardReopen` — allowReopen=true + complete step → ok | D-05 |
| `guardReopen` — allowReopen=false → blocked | D-05 |
| `guardReopen` — non-complete step → blocked | D-05 |
| `applyCompletionFired` sets flag | D-07 |
| `applyCompletionFired` resets flag on reopen | D-07 |
| `resolveUnlockedSteps` — s-w-j: first step always unlocked | D-01 |
| `resolveUnlockedSteps` — s-w-j: next step unlocked after visit | D-01 |
| `resolveUnlockedSteps` — s-w-j: step after next remains locked | D-01 |

### `useStepWizard`

| Test | Covers |
|---|---|
| Initialises with not-started state (no draft) | core |
| Restores draft on mount — monotonic merge applied | D-02 |
| `advance` moves to next step | core |
| `markComplete` validates required step | D-03 |
| `markComplete` allows optional step despite error | D-03 |
| `markComplete` fires `onComplete` callback | core |
| `markComplete` triggers `onAllComplete` when all required done | D-07 |
| `onAllComplete` does not double-fire after re-complete without reopen | D-07 |
| `onAllComplete` fires again after reopen + re-complete | D-07 |
| `reopenStep` blocked when `allowReopen` not set | D-05 |
| `reopenStep` resets `onAllCompleteFired` to false | D-07 |
| `goTo` locked step in s-w-j blocked | D-01 |
| `goTo` visited step in s-w-j allowed | D-01 |
| Overdue poll fires notification for past-due step | D-08 |
| Overdue poll skips completed steps | D-08 |

---

## Storybook Stories

### `HbcStepWizard.stories.tsx`

| Story Name | Mode | Variant | Initial State | Tier |
|---|---|---|---|---|
| `SequentialVertical` | sequential | vertical | `notStarted` | Standard |
| `SequentialHorizontal` | sequential | horizontal | `inProgress` | Standard |
| `ParallelVertical` | parallel | vertical | `partialParallel` | Standard |
| `SequentialWithJumps` | sequential-with-jumps | vertical | `inProgress` | Standard |
| `CompleteState` | sequential | vertical | `complete` | Standard |
| `WithBlockedStep` | sequential | vertical | `withBlocked` | Standard |
| `WithSkippedStep` | sequential | vertical | `withSkipped` | Standard |
| `EssentialTierAdjacentSidebar` | sequential | vertical | `inProgress` | Essential |
| `ExpertTierWithTimestamps` | sequential | vertical | `inProgress` | Expert |
| `WithBicAssignees` | parallel | vertical | `partialParallel` | Standard |

### `HbcStepProgress.stories.tsx`

| Story Name | Variant | State |
|---|---|---|
| `FractionInProgress` | fraction | `inProgress` |
| `FractionComplete` | fraction | `complete` |
| `BarInProgress` | bar | `inProgress` |
| `BarComplete` | bar | `complete` |
| `RingInProgress` | ring | `inProgress` |
| `RingComplete` | ring | `complete` |

---

## Playwright E2E Scenarios

| # | Scenario | Decision Verified |
|---|---|---|
| E2E-01 | Sequential: Next button validates required step; error shown; step not advanced | D-03 |
| E2E-02 | Sequential: Valid step completes and advances; sidebar updates status icon | core |
| E2E-03 | `sequential-with-jumps`: Step 3 sidebar row is locked; clicking does nothing | D-01 |
| E2E-04 | `sequential-with-jumps`: Visit step 2 → step 3 unlocks in sidebar | D-01 |
| E2E-05 | `sequential-with-jumps`: Free navigation back to step 1 after visiting step 2 | D-01 |
| E2E-06 | Refresh page: draft restored; monotonic merge prevents regression of completed step | D-02 |
| E2E-07 | Complete all required steps → "All steps complete" shown; `onAllComplete` fires once | D-07 |
| E2E-08 | Reopen step (allowReopen=true) → status back to in-progress → re-complete → callback fires again | D-05, D-07 |
| E2E-09 | Essential tier: sidebar shows only current step + adjacent; other steps not rendered | D-06 |
| E2E-10 | Expert tier: completed step row shows `completedAt` timestamp | D-06 |

---

## Verification Commands

```bash
# Testing sub-path
node -e "import('@hbc/step-wizard/testing').then(m => console.log(Object.keys(m)))"
# Expected: ['createMockWizardConfig', 'mockWizardStates', 'mockUseStepWizard', 'createWizardWrapper']

# Unit tests with coverage
pnpm --filter @hbc/step-wizard test:coverage

# Storybook build
pnpm --filter @hbc/step-wizard storybook:build

# E2E
pnpm playwright test --grep step-wizard
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF05-T08 completed: 2026-03-09
Testing utilities:
  - testing/mockWizardStates.ts — 6 canonical states (notStarted, inProgress, complete, withBlocked, withSkipped, partialParallel) with both state + draft
  - testing/createMockWizardConfig.ts — step-2 now required, added allowReopen/allowForceComplete/draftKey defaults
  - testing/mockUseStepWizard.ts — full implementation with vi.fn() mocks for all mutations
  - testing/createWizardWrapper.tsx — wraps with ComplexityTestProvider, accepts optional tier param
  - vitest.config.ts — added @hbc/complexity/testing alias
Unit tests: 142 tests across 10 test files, all passing
Coverage: 100% statements, 100% lines, 100% functions, 95.61% branches (≥95% threshold met)
New test files created:
  - src/state/__tests__/draftPayloadHelpers.test.ts (28 tests)
  - src/hooks/__tests__/useStepProgress.test.ts (4 tests)
  - src/components/__tests__/StepStatusIcon.test.tsx (5 tests)
  - src/components/__tests__/WizardSidebar.test.tsx (10 tests)
  - src/components/__tests__/HbcStepWizard.test.tsx (19 tests)
Existing test files extended:
  - src/hooks/__tests__/useStepWizard.test.ts (+18 tests = 25 total)
  - src/components/__tests__/HbcStepProgress.test.tsx (+2 tests = 6 total)
  - src/components/__tests__/HbcStepSidebar.test.tsx (+1 test = 3 total)
  - src/state/__tests__/stepStateMachine.test.ts (+16 tests = 35 total)
Storybook stories created:
  - src/components/__stories__/HbcStepWizard.stories.tsx (10 stories)
  - src/components/__stories__/HbcStepProgress.stories.tsx (6 stories)
Playwright E2E created:
  - e2e/step-wizard.spec.ts (10 scenarios: E2E-01 through E2E-10)
-->
