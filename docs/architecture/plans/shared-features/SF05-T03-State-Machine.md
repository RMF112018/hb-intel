# SF05-T03 — Step State Machine

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 (visited unlock), D-02 (monotonic merge), D-03 (validation), D-05 (visited persist, allowReopen), D-07 (onAllCompleteFired)
**Estimated Effort:** 0.5 sprint-weeks
**Wave:** 1

---

## Objective

Implement `src/state/stepStateMachine.ts` — the pure, framework-free state machine that governs all step status transitions, sequential-with-jumps unlock logic, validation, completion detection, and the `onAllCompleteFired` idempotency guard. This is the testable core of the package; all hook and component logic delegates here.

---

## 3-Line Plan

1. Implement all valid state transitions as pure functions with explicit guard conditions.
2. Implement `buildWizardState()` — the master derivation function that converts raw config + draft into a full `IStepWizardState`.
3. Verify all transitions and edge cases with exhaustive unit tests before any hook or component work begins.

---

## `src/state/stepStateMachine.ts`

```typescript
import type {
  IStep,
  IStepWizardConfig,
  IStepWizardState,
  IStepRuntimeEntry,
  StepStatus,
  StepOrderMode,
} from '../types/IStepWizard';
import {
  mergeStepStatus,
  computeIsComplete,
  computePercentComplete,
  resolveUnlockedSteps,
  isTerminalStatus,
  STATUS_RANK,
  type IStepWizardDraft,
} from './draftPayload';

// ─── Master State Builder ─────────────────────────────────────────────────────

/**
 * Derives the full IStepWizardState from config, item, and current draft.
 * Called on every state mutation — the single source of truth for derived state.
 */
export function buildWizardState<T>(
  config: IStepWizardConfig<T>,
  item: T,
  draft: IStepWizardDraft,
  validationErrors: Record<string, string | null>,
  overdueStepIds: Set<string>
): IStepWizardState {
  const { steps, orderMode } = config;
  const { stepStatuses, completedAts, visitedStepIds, onAllCompleteFired } = draft;

  const unlockedStepIds = resolveUnlockedSteps(steps, visitedStepIds, orderMode);

  const runtimeSteps: IStepRuntimeEntry[] = steps.map((step) => {
    const status = stepStatuses[step.stepId] ?? 'not-started';
    const assignee = step.resolveAssignee?.(item) ?? null;
    const isVisited = visitedStepIds.includes(step.stepId);
    const isUnlocked = unlockedStepIds.has(step.stepId);

    return {
      stepId: step.stepId,
      label: step.label,
      icon: step.icon,
      required: step.required,
      order: step.order,
      status,
      completedAt: completedAts[step.stepId] ?? null,
      assignee,
      validationError: validationErrors[step.stepId] ?? null,
      isOverdue: overdueStepIds.has(step.stepId),
      isVisited,
      isUnlocked,
    };
  });

  const isComplete = computeIsComplete(steps, stepStatuses);
  const completedCount = steps.filter(
    (s) => stepStatuses[s.stepId] === 'complete'
  ).length;
  const requiredCount = steps.filter((s) => s.required).length;
  const percentComplete = computePercentComplete(steps, stepStatuses);

  // Active step derivation — never null while incomplete:
  // 1. First required step that is in-progress (user is mid-step)
  // 2. First required step that is not-started and unlocked
  // 3. First step overall if nothing else matches
  const activeStepId = isComplete
    ? null
    : deriveActiveStepId(runtimeSteps, orderMode);

  return {
    steps: runtimeSteps,
    activeStepId,
    completedCount,
    requiredCount,
    isComplete,
    percentComplete,
    onAllCompleteFired,
  };
}

function deriveActiveStepId(
  steps: IStepRuntimeEntry[],
  orderMode: StepOrderMode
): string | null {
  // Prefer in-progress step
  const inProgress = steps.find((s) => s.status === 'in-progress' && s.isUnlocked);
  if (inProgress) return inProgress.stepId;

  // Next unlocked not-started required step
  const nextRequired = steps.find(
    (s) => s.required && s.status === 'not-started' && s.isUnlocked
  );
  if (nextRequired) return nextRequired.stepId;

  // Fall back to first unlocked step
  return steps.find((s) => s.isUnlocked)?.stepId ?? null;
}

// ─── Transition Guards ────────────────────────────────────────────────────────

export type TransitionResult =
  | { ok: true; nextStatus: StepStatus }
  | { ok: false; reason: string };

/**
 * Guard: can this step be marked complete?
 *
 * Fails if:
 * - Step is already terminal (blocked/skipped)
 * - Step has a validation error AND is required AND force is not set (D-03)
 * - In sequential mode: a prior required step is not complete
 */
export function guardMarkComplete<T>(
  step: IStep<T>,
  item: T,
  draft: IStepWizardDraft,
  config: IStepWizardConfig<T>,
  force: boolean
): TransitionResult {
  const currentStatus = draft.stepStatuses[step.stepId] ?? 'not-started';

  if (isTerminalStatus(currentStatus)) {
    return { ok: false, reason: `Step "${step.label}" is ${currentStatus} and cannot be completed.` };
  }

  // Validation guard (D-03)
  if (step.validate && !force) {
    const error = step.validate(item);
    if (error && step.required) {
      return { ok: false, reason: error };
    }
  }

  // Sequential order guard
  if (config.orderMode === 'sequential') {
    const ordered = [...config.steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const stepIndex = ordered.findIndex((s) => s.stepId === step.stepId);
    for (let i = 0; i < stepIndex; i++) {
      const prior = ordered[i];
      const priorStatus = draft.stepStatuses[prior.stepId] ?? 'not-started';
      if (prior.required && priorStatus !== 'complete' && priorStatus !== 'skipped') {
        return {
          ok: false,
          reason: `"${prior.label}" must be completed before "${step.label}".`,
        };
      }
    }
  }

  return { ok: true, nextStatus: 'complete' };
}

/**
 * Guard: can the user navigate to this step?
 *
 * Fails if:
 * - In sequential-with-jumps: step is not unlocked (not yet visited in order) (D-01)
 * - In sequential: step is not the current active step (no jumps)
 */
export function guardGoTo<T>(
  targetStepId: string,
  activeStepId: string | null,
  unlockedStepIds: Set<string>,
  orderMode: StepOrderMode
): TransitionResult {
  if (orderMode === 'sequential') {
    if (targetStepId !== activeStepId) {
      return { ok: false, reason: 'Sequential mode does not allow jumping to non-active steps.' };
    }
  }

  if (orderMode === 'sequential-with-jumps') {
    if (!unlockedStepIds.has(targetStepId)) {
      return { ok: false, reason: 'This step is locked — complete the preceding steps first.' };
    }
  }

  return { ok: true, nextStatus: 'in-progress' };
}

/**
 * Guard: can this step be reopened?
 *
 * Fails if:
 * - config.allowReopen is not set (D-05)
 * - Step is not currently 'complete'
 */
export function guardReopen<T>(
  stepId: string,
  config: IStepWizardConfig<T>,
  draft: IStepWizardDraft
): TransitionResult {
  if (!config.allowReopen) {
    return { ok: false, reason: 'Step reopening is not enabled for this wizard.' };
  }
  const status = draft.stepStatuses[stepId] ?? 'not-started';
  if (status !== 'complete') {
    return { ok: false, reason: `Step is "${status}" — only completed steps can be reopened.` };
  }
  return { ok: true, nextStatus: 'in-progress' };
}

// ─── Draft Mutation Helpers ───────────────────────────────────────────────────

/** Returns a new draft with the step status updated and completedAt set if completing. */
export function applyStatusUpdate(
  draft: IStepWizardDraft,
  stepId: string,
  nextStatus: StepStatus
): IStepWizardDraft {
  const now = new Date().toISOString();
  return {
    ...draft,
    stepStatuses: { ...draft.stepStatuses, [stepId]: nextStatus },
    completedAts: {
      ...draft.completedAts,
      [stepId]: nextStatus === 'complete' ? now : draft.completedAts[stepId] ?? null,
    },
    savedAt: now,
  };
}

/** Returns a new draft with the stepId added to visitedStepIds (idempotent). */
export function applyVisit(
  draft: IStepWizardDraft,
  stepId: string
): IStepWizardDraft {
  if (draft.visitedStepIds.includes(stepId)) return draft;
  return {
    ...draft,
    visitedStepIds: [...draft.visitedStepIds, stepId],
    savedAt: new Date().toISOString(),
  };
}

/** Returns a new draft with onAllCompleteFired set to the given value. (D-07) */
export function applyCompletionFired(
  draft: IStepWizardDraft,
  fired: boolean
): IStepWizardDraft {
  return { ...draft, onAllCompleteFired: fired, savedAt: new Date().toISOString() };
}
```

---

## Status Transition Map (Exhaustive)

| From | Action | Guard | To |
|---|---|---|---|
| `not-started` | `goTo` | mode allows | `in-progress` |
| `not-started` | `markComplete` | validation + order | `complete` |
| `not-started` | `markBlocked` | always | `blocked` |
| `in-progress` | `markComplete` | validation + order | `complete` |
| `in-progress` | `markBlocked` | always | `blocked` |
| `in-progress` | `goTo` (other step) | mode allows | stays `in-progress` (other step activates) |
| `complete` | `reopenStep` | `allowReopen: true` | `in-progress` |
| `complete` | `markComplete` | — | rejected (already complete) |
| `blocked` | any | — | rejected (terminal — D-02) |
| `skipped` | any | — | rejected (terminal — D-02) |

---

## Unit Tests (Representative)

```typescript
// state/__tests__/stepStateMachine.test.ts
import { describe, it, expect } from 'vitest';
import {
  guardMarkComplete, guardGoTo, guardReopen,
  applyStatusUpdate, applyVisit, applyCompletionFired,
  buildWizardState,
} from '../stepStateMachine';
import { mergeStepStatus } from '../draftPayload';
import { createMockWizardConfig, mockWizardStates } from '@hbc/step-wizard/testing';

// ── Monotonic merge (D-02) ──────────────────────────────────────────────────
describe('mergeStepStatus', () => {
  it('complete beats in-progress', () =>
    expect(mergeStepStatus('complete', 'in-progress')).toBe('complete'));
  it('in-progress beats not-started', () =>
    expect(mergeStepStatus('in-progress', 'not-started')).toBe('in-progress'));
  it('stored wins on tie', () =>
    expect(mergeStepStatus('in-progress', 'in-progress')).toBe('in-progress'));
  it('terminal blocked beats complete', () =>
    expect(mergeStepStatus('blocked', 'complete')).toBe('blocked'));
  it('terminal skipped beats in-progress', () =>
    expect(mergeStepStatus('skipped', 'in-progress')).toBe('skipped'));
  it('inMemory terminal beats non-terminal stored', () =>
    expect(mergeStepStatus('not-started', 'blocked')).toBe('blocked'));
});

// ── guardMarkComplete (D-03) ────────────────────────────────────────────────
describe('guardMarkComplete', () => {
  const config = createMockWizardConfig({ orderMode: 'parallel' });
  const step = config.steps[0];
  const baseDraft = mockWizardStates.notStarted;

  it('allows completion of in-progress required step', () => {
    const result = guardMarkComplete(step, undefined, baseDraft.draft, config, false);
    expect(result.ok).toBe(true);
  });

  it('blocks required step with validation error', () => {
    const stepWithValidation = { ...step, validate: () => 'Field required' };
    const result = guardMarkComplete(stepWithValidation, undefined, baseDraft.draft, config, false);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('Field required');
  });

  it('allows force-complete despite validation error', () => {
    const stepWithValidation = { ...step, validate: () => 'Field required' };
    const result = guardMarkComplete(stepWithValidation, undefined, baseDraft.draft, config, true);
    expect(result.ok).toBe(true);
  });

  it('allows optional step completion with validation error (soft warn only, D-03)', () => {
    const optionalStep = { ...step, required: false, validate: () => 'Optional field incomplete' };
    const result = guardMarkComplete(optionalStep, undefined, baseDraft.draft, config, false);
    expect(result.ok).toBe(true); // optional steps not blocked
  });

  it('rejects completion of terminal blocked step (D-02)', () => {
    const blockedDraft = { ...baseDraft.draft, stepStatuses: { [step.stepId]: 'blocked' as const } };
    const result = guardMarkComplete(step, undefined, blockedDraft, config, false);
    expect(result.ok).toBe(false);
  });
});

// ── sequential-with-jumps unlock (D-01) ────────────────────────────────────
describe('guardGoTo — sequential-with-jumps', () => {
  it('allows navigation to visited step', () => {
    const result = guardGoTo('step-2', 'step-1', new Set(['step-1', 'step-2']), 'sequential-with-jumps');
    expect(result.ok).toBe(true);
  });

  it('blocks navigation to unvisited/unlocked step', () => {
    const result = guardGoTo('step-3', 'step-1', new Set(['step-1', 'step-2']), 'sequential-with-jumps');
    expect(result.ok).toBe(false);
  });

  it('blocks all jumps in sequential mode', () => {
    const result = guardGoTo('step-2', 'step-1', new Set(['step-1', 'step-2']), 'sequential');
    expect(result.ok).toBe(false);
  });

  it('allows any jump in parallel mode', () => {
    const result = guardGoTo('step-3', 'step-1', new Set(['step-1', 'step-2', 'step-3']), 'parallel');
    expect(result.ok).toBe(true);
  });
});

// ── onAllCompleteFired idempotency (D-07) ──────────────────────────────────
describe('applyCompletionFired', () => {
  it('sets flag to true', () => {
    const draft = { ...mockWizardStates.complete.draft, onAllCompleteFired: false };
    expect(applyCompletionFired(draft, true).onAllCompleteFired).toBe(true);
  });

  it('resets flag on reopen', () => {
    const draft = { ...mockWizardStates.complete.draft, onAllCompleteFired: true };
    expect(applyCompletionFired(draft, false).onAllCompleteFired).toBe(false);
  });
});

// ── guardReopen (D-05) ──────────────────────────────────────────────────────
describe('guardReopen', () => {
  it('allows reopen when allowReopen=true and step is complete', () => {
    const config = createMockWizardConfig({ allowReopen: true });
    const draft = { ...mockWizardStates.complete.draft };
    const result = guardReopen(config.steps[0].stepId, config, draft);
    expect(result.ok).toBe(true);
  });

  it('blocks reopen when allowReopen is not set', () => {
    const config = createMockWizardConfig({ allowReopen: undefined });
    const draft = { ...mockWizardStates.complete.draft };
    const result = guardReopen(config.steps[0].stepId, config, draft);
    expect(result.ok).toBe(false);
  });
});
```

---

## Verification Commands

```bash
pnpm --filter @hbc/step-wizard typecheck
pnpm --filter @hbc/step-wizard test -- --reporter=verbose state/
```
