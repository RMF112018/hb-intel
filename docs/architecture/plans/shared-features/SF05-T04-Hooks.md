# SF05-T04 — Hooks: `useStepWizard` + `useStepProgress`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 (visited tracking), D-03 (validation on blur/complete), D-05 (draft restore, allowReopen), D-07 (onAllComplete idempotency), D-08 (overdue polling), D-09 (useStepProgress self-fetches)
**Estimated Effort:** 0.5 sprint-weeks
**Wave:** 2

---

## Objective

Implement the two hooks: `useStepWizard` (all state management, mutations, validation, overdue polling, draft persistence bridge) and `useStepProgress` (lightweight draft read for `HbcStepProgress` list rows).

---

## 3-Line Plan

1. Implement `useStepWizard` with `useReducer`-based state management, delegating all transition logic to the state machine (T03), and wiring validation, overdue poll, and `onAllComplete` idempotency guard.
2. Implement `useStepProgress` as a thin draft-store reader keyed by resolved `draftKey`.
3. Verify all hook branches with unit tests using `createWizardWrapper` and `mockWizardStates`.

---

## `src/hooks/useStepWizard.ts`

```typescript
import * as React from 'react';
import { useDraftStore } from '@hbc/session-state';
import { useNotificationClient } from '@hbc/notification-intelligence';
import {
  buildWizardState,
  guardMarkComplete,
  guardGoTo,
  guardReopen,
  applyStatusUpdate,
  applyVisit,
  applyCompletionFired,
} from '../state/stepStateMachine';
import {
  mergeDraft,
  resolveDraftKey,
  resolveUnlockedSteps,
  computeIsComplete,
  type IStepWizardDraft,
} from '../state/draftPayload';
import type {
  IStepWizardConfig,
  IStepWizardState,
  IUseStepWizardReturn,
} from '../types/IStepWizard';

const INITIAL_DRAFT = (stepIds: string[]): IStepWizardDraft => ({
  stepStatuses: Object.fromEntries(stepIds.map((id) => [id, 'not-started'])),
  completedAts: Object.fromEntries(stepIds.map((id) => [id, null])),
  visitedStepIds: [],
  onAllCompleteFired: false,
  savedAt: new Date().toISOString(),
});

export function useStepWizard<T>(
  config: IStepWizardConfig<T>,
  item: T
): IUseStepWizardReturn {
  const draftKey = resolveDraftKey(config, item);
  const draftStore = useDraftStore(draftKey);
  const notifClient = useNotificationClient();

  const stepIds = config.steps.map((s) => s.stepId);

  // ── Draft initialisation ────────────────────────────────────────────────
  const [draft, setDraft] = React.useState<IStepWizardDraft>(() => {
    const stored = draftKey ? draftStore.read<IStepWizardDraft>() : null;
    if (!stored) return INITIAL_DRAFT(stepIds);

    // Monotonic merge on restore (D-02)
    const inMemoryStatuses = Object.fromEntries(stepIds.map((id) => [id, 'not-started' as const]));
    const merged = mergeDraft(inMemoryStatuses, stored);
    return {
      stepStatuses: merged.mergedStatuses,
      completedAts: merged.mergedCompletedAts,
      visitedStepIds: merged.mergedVisitedIds,
      onAllCompleteFired: merged.onAllCompleteFired,
      savedAt: stored.savedAt,
    };
  });

  // ── Validation error cache ─────────────────────────────────────────────
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string | null>>({});

  // ── Overdue step tracking ──────────────────────────────────────────────
  const [overdueStepIds, setOverdueStepIds] = React.useState<Set<string>>(new Set());

  // ── Persist draft on change ────────────────────────────────────────────
  React.useEffect(() => {
    if (draftKey) draftStore.write(draft);
  }, [draft, draftKey]);

  // ── Overdue polling (D-08) — 60-second interval ────────────────────────
  React.useEffect(() => {
    const checkOverdue = () => {
      const nowMs = Date.now();
      const newOverdue = new Set<string>();
      for (const step of config.steps) {
        if (!step.dueDate) continue;
        const status = draft.stepStatuses[step.stepId] ?? 'not-started';
        if (status === 'complete' || status === 'skipped') continue;
        const due = step.dueDate(item);
        if (due && nowMs > new Date(due).getTime()) {
          newOverdue.add(step.stepId);
          const assignee = step.resolveAssignee?.(item);
          notifClient.registerEvent({
            tier: 'immediate',
            type: 'step-wizard-overdue',
            moduleKey: `step-wizard:${draftKey ?? 'unknown'}:${step.stepId}`,
            assigneeUserId: assignee?.userId,
          });
        }
      }
      setOverdueStepIds(newOverdue);
    };

    checkOverdue(); // Run immediately on mount
    const interval = setInterval(checkOverdue, 60_000);
    return () => clearInterval(interval);
  }, [config.steps, draft.stepStatuses, item, draftKey]);

  // ── onAllComplete idempotency check (D-07) ────────────────────────────
  React.useEffect(() => {
    if (
      computeIsComplete(config.steps, draft.stepStatuses) &&
      !draft.onAllCompleteFired &&
      config.onAllComplete
    ) {
      const updated = applyCompletionFired(draft, true);
      setDraft(updated);
      void config.onAllComplete(item);
    }
  }, [draft.stepStatuses, draft.onAllCompleteFired]);

  // ── Derived state ──────────────────────────────────────────────────────
  const state = React.useMemo<IStepWizardState>(
    () => buildWizardState(config, item, draft, validationErrors, overdueStepIds),
    [config, item, draft, validationErrors, overdueStepIds]
  );

  // ── Mutation: advance ─────────────────────────────────────────────────
  const advance = React.useCallback(() => {
    if (!state.activeStepId) return;
    const currentIdx = config.steps.findIndex((s) => s.stepId === state.activeStepId);
    const next = config.steps[currentIdx + 1];
    if (!next) return;

    // Mark current step in-progress on blur — run passive validation (D-03)
    const current = config.steps[currentIdx];
    const error = current.validate?.(item) ?? null;
    if (error) {
      setValidationErrors((prev) => ({ ...prev, [current.stepId]: error }));
    }

    let updated = draft;
    if (config.orderMode === 'sequential-with-jumps') {
      updated = applyVisit(updated, next.stepId); // unlock next step (D-01)
    }
    updated = applyStatusUpdate(updated, next.stepId, 'in-progress');
    setDraft(updated);
  }, [config, item, draft, state.activeStepId]);

  // ── Mutation: goTo ───────────────────────────────────────────────────
  const goTo = React.useCallback((targetStepId: string) => {
    const unlockedStepIds = resolveUnlockedSteps(
      config.steps,
      draft.visitedStepIds,
      config.orderMode
    );
    const guard = guardGoTo(targetStepId, state.activeStepId, unlockedStepIds, config.orderMode);
    if (!guard.ok) {
      if (import.meta.env.DEV) console.warn(`[step-wizard] goTo blocked: ${guard.reason}`);
      return;
    }

    // Passive validation on departure from active step (D-03)
    if (state.activeStepId) {
      const leaving = config.steps.find((s) => s.stepId === state.activeStepId);
      const error = leaving?.validate?.(item) ?? null;
      setValidationErrors((prev) => ({
        ...prev,
        ...(state.activeStepId ? { [state.activeStepId]: error } : {}),
      }));
    }

    let updated = draft;
    if (config.orderMode === 'sequential-with-jumps') {
      updated = applyVisit(updated, targetStepId); // record visit (D-01)
    }
    updated = applyStatusUpdate(updated, targetStepId, 'in-progress');
    setDraft(updated);
  }, [config, item, draft, state.activeStepId]);

  // ── Mutation: markComplete ────────────────────────────────────────────
  const markComplete = React.useCallback(async (stepId: string, force = false) => {
    const step = config.steps.find((s) => s.stepId === stepId);
    if (!step) return;

    const guard = guardMarkComplete(step, item, draft, config, force);
    if (!guard.ok) {
      setValidationErrors((prev) => ({ ...prev, [stepId]: guard.reason }));
      return;
    }

    // Clear validation error on success
    setValidationErrors((prev) => ({ ...prev, [stepId]: null }));
    const updated = applyStatusUpdate(draft, stepId, 'complete');
    setDraft(updated);

    await step.onComplete?.(item);
  }, [config, item, draft]);

  // ── Mutation: markBlocked ─────────────────────────────────────────────
  const markBlocked = React.useCallback((stepId: string, reason?: string) => {
    const updated = applyStatusUpdate(draft, stepId, 'blocked');
    setDraft(updated);
    if (reason) {
      // Store blocking reason for sidebar tooltip — future enhancement
      if (import.meta.env.DEV) console.info(`[step-wizard] Step "${stepId}" blocked: ${reason}`);
    }
  }, [draft]);

  // ── Mutation: reopenStep (D-05) ───────────────────────────────────────
  const reopenStep = React.useCallback((stepId: string) => {
    const guard = guardReopen(stepId, config, draft);
    if (!guard.ok) {
      if (import.meta.env.DEV) console.warn(`[step-wizard] reopenStep blocked: ${guard.reason}`);
      return;
    }
    let updated = applyStatusUpdate(draft, stepId, 'in-progress');
    updated = applyCompletionFired(updated, false); // reset D-07 guard
    setDraft(updated);
  }, [config, draft]);

  const getValidationError = React.useCallback(
    (stepId: string) => validationErrors[stepId] ?? null,
    [validationErrors]
  );

  return { state, advance, goTo, markComplete, markBlocked, reopenStep, getValidationError };
}
```

---

## `src/hooks/useStepProgress.ts` (D-09)

```typescript
import { useDraftStore } from '@hbc/session-state';
import { resolveDraftKey, computeIsComplete, computePercentComplete } from '../state/draftPayload';
import type { IStepWizardConfig, IUseStepProgressReturn } from '../types/IStepWizard';

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Lightweight hook for HbcStepProgress list row rendering. (D-09)
 * Reads draft store synchronously — no network call, no TanStack Query.
 * Resolves draftKey from config and item (handles both string and function forms).
 */
export function useStepProgress<T>(
  config: IStepWizardConfig<T>,
  item: T
): IUseStepProgressReturn {
  const draftKey = resolveDraftKey(config, item);
  const draftStore = useDraftStore(draftKey);

  const draft = draftKey ? draftStore.read() : null;

  if (!draft) {
    return {
      completedCount: 0,
      requiredCount: config.steps.filter((s) => s.required).length,
      percentComplete: 0,
      isComplete: false,
      isStale: false,
    };
  }

  const completedCount = config.steps.filter(
    (s) => draft.stepStatuses[s.stepId] === 'complete'
  ).length;
  const requiredCount = config.steps.filter((s) => s.required).length;
  const isComplete = computeIsComplete(config.steps, draft.stepStatuses);
  const percentComplete = computePercentComplete(config.steps, draft.stepStatuses);
  const isStale = Date.now() - new Date(draft.savedAt).getTime() > STALE_THRESHOLD_MS;

  return { completedCount, requiredCount, percentComplete, isComplete, isStale };
}
```

---

## Unit Tests (Representative)

```typescript
// hooks/__tests__/useStepWizard.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStepWizard } from '../useStepWizard';
import { createMockWizardConfig, createWizardWrapper, mockWizardStates } from '@hbc/step-wizard/testing';

describe('useStepWizard', () => {
  it('initialises with not-started state when no draft exists', () => {
    const config = createMockWizardConfig({ orderMode: 'sequential' });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    expect(result.current.state.steps.every((s) => s.status === 'not-started')).toBe(true);
  });

  it('advance moves to next step', async () => {
    const config = createMockWizardConfig({ orderMode: 'sequential' });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    await act(async () => { result.current.advance(); });
    expect(result.current.state.steps[1].status).toBe('in-progress');
  });

  it('markComplete validates required step (D-03)', async () => {
    const config = createMockWizardConfig({
      orderMode: 'parallel',
      steps: [{ stepId: 'step-1', label: 'Step 1', required: true,
        validate: () => 'Must fill required fields' }],
    });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    await act(async () => {
      await result.current.markComplete('step-1');
    });
    expect(result.current.state.steps[0].status).not.toBe('complete');
    expect(result.current.getValidationError('step-1')).toBe('Must fill required fields');
  });

  it('optional step completes despite validation error (D-03)', async () => {
    const config = createMockWizardConfig({
      steps: [{ stepId: 'step-1', label: 'Step 1', required: false,
        validate: () => 'Optional field' }],
    });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    await act(async () => { await result.current.markComplete('step-1'); });
    expect(result.current.state.steps[0].status).toBe('complete');
  });

  it('onAllComplete fires exactly once (D-07)', async () => {
    const onAllComplete = vi.fn();
    const config = createMockWizardConfig({ onAllComplete, steps: [
      { stepId: 'step-1', label: 'Step 1', required: true },
    ]});
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    await act(async () => { await result.current.markComplete('step-1'); });
    await act(async () => { result.current.reopenStep('step-1'); });
    await act(async () => { await result.current.markComplete('step-1'); });
    expect(onAllComplete).toHaveBeenCalledTimes(2); // fires on each re-completion
  });

  it('reopenStep blocked when allowReopen not set (D-05)', async () => {
    const config = createMockWizardConfig({ allowReopen: undefined });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(mockWizardStates.complete),
    });
    act(() => { result.current.reopenStep(config.steps[0].stepId); });
    expect(result.current.state.steps[0].status).toBe('complete'); // unchanged
  });

  it('sequential-with-jumps: goTo locked step blocked (D-01)', () => {
    const config = createMockWizardConfig({ orderMode: 'sequential-with-jumps' });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(mockWizardStates.notStarted),
    });
    act(() => { result.current.goTo(config.steps[2].stepId); }); // step 3 not visited
    expect(result.current.state.activeStepId).not.toBe(config.steps[2].stepId);
  });
});
```

---

## Verification Commands

```bash
pnpm --filter @hbc/step-wizard typecheck
pnpm --filter @hbc/step-wizard test -- --reporter=verbose hooks/
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF05-T04 completed: 2026-03-09
Steps completed:
  - Step 1: Created ambient type declarations (vite-env.d.ts) for @hbc/session-state and @hbc/notification-intelligence
  - Step 2: Created mock files (__mocks__/session-state.ts, __mocks__/notification-intelligence.ts)
  - Step 3: Updated vitest.config.ts with resolve aliases + coverage exclude
  - Step 4: Updated tsconfig.json with path mappings
  - Step 5: Implemented createWizardWrapper testing utility
  - Step 6: Updated test setup with __resetMockDraft in afterEach
  - Step 7: Implemented useStepWizard and useStepProgress hooks (verbatim from spec)
  - Step 8: Created test suite (7 tests, all passing)
  - Step 9: Barrel already re-exports both hooks (no change needed)
  - Step 10: Verified — typecheck zero errors, 26 tests pass (19 state machine + 7 hooks)
Implementation note: Overdue polling effect optimized with early return when no steps have dueDate,
  and Set comparison to avoid unnecessary re-renders in test environment.
Next: SF05-T05
-->
