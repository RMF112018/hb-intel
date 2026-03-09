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
