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
  applyActiveStep,
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
  activeStepId: stepIds[0] ?? null,
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
      activeStepId: merged.activeStepId ?? stepIds[0] ?? null,
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
    const stepsWithDueDate = config.steps.filter((s) => s.dueDate);
    if (stepsWithDueDate.length === 0) return; // No overdue tracking needed

    const checkOverdue = () => {
      const nowMs = Date.now();
      const newOverdue = new Set<string>();
      for (const step of stepsWithDueDate) {
        const status = draft.stepStatuses[step.stepId] ?? 'not-started';
        if (status === 'complete' || status === 'skipped') continue;
        const due = step.dueDate!(item);
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
      setOverdueStepIds((prev) => {
        // Avoid unnecessary re-renders when set contents haven't changed
        const prevArr = [...prev].sort();
        const newArr = [...newOverdue].sort();
        if (prevArr.length === newArr.length && prevArr.every((v, i) => v === newArr[i])) {
          return prev;
        }
        return newOverdue;
      });
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
    if ((updated.stepStatuses[next.stepId] ?? 'not-started') === 'not-started') {
      updated = applyStatusUpdate(updated, next.stepId, 'in-progress');
    }
    updated = applyActiveStep(updated, next.stepId);
    setDraft(updated);
  }, [config, item, draft, state.activeStepId]);

  // ── Mutation: goTo ───────────────────────────────────────────────────
  const goTo = React.useCallback((targetStepId: string) => {
    const unlockedStepIds = resolveUnlockedSteps(
      config.steps,
      draft.visitedStepIds,
      config.orderMode,
      state.activeStepId,
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
    if ((updated.stepStatuses[targetStepId] ?? 'not-started') === 'not-started') {
      updated = applyStatusUpdate(updated, targetStepId, 'in-progress');
    }
    updated = applyActiveStep(updated, targetStepId);
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
    let updated = applyStatusUpdate(draft, stepId, 'complete');
    if (state.activeStepId === stepId) {
      const currentIdx = config.steps.findIndex((s) => s.stepId === stepId);
      const next = currentIdx >= 0 ? config.steps[currentIdx + 1] : undefined;
      updated = applyActiveStep(updated, next?.stepId ?? null);
    }
    setDraft(updated);

    await step.onComplete?.(item);
  }, [config, item, draft, state.activeStepId]);

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
    updated = applyActiveStep(updated, stepId);
    setDraft(updated);
  }, [config, draft]);

  const getValidationError = React.useCallback(
    (stepId: string) => validationErrors[stepId] ?? null,
    [validationErrors]
  );

  return { state, advance, goTo, markComplete, markBlocked, reopenStep, getValidationError };
}
