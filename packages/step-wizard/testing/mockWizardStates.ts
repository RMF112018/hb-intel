import type { IStepWizardDraft } from '../src/state/draftPayload';
import type { IStepWizardState, IStepRuntimeEntry } from '../src/types/IStepWizard';

interface MockWizardStatePreset {
  state: IStepWizardState;
  draft: IStepWizardDraft;
}

// ── Helper to build runtime steps ────────────────────────────────────────────

function runtimeStep(
  overrides: Partial<IStepRuntimeEntry> & { stepId: string; label: string; required: boolean },
): IStepRuntimeEntry {
  return {
    status: 'not-started',
    completedAt: null,
    assignee: null,
    validationError: null,
    isOverdue: false,
    isVisited: false,
    isUnlocked: true,
    ...overrides,
  };
}

// ── notStarted ──────────────────────────────────────────────────────────────

const notStartedDraft: IStepWizardDraft = {
  stepStatuses: {
    'step-1': 'not-started',
    'step-2': 'not-started',
    'step-3': 'not-started',
  },
  completedAts: {
    'step-1': null,
    'step-2': null,
    'step-3': null,
  },
  visitedStepIds: [],
  onAllCompleteFired: false,
  activeStepId: 'step-1',
  savedAt: new Date().toISOString(),
};

const notStartedState: IStepWizardState = {
  steps: [
    runtimeStep({ stepId: 'step-1', label: 'First Step', required: true, order: 1 }),
    runtimeStep({ stepId: 'step-2', label: 'Second Step', required: true, order: 2 }),
    runtimeStep({ stepId: 'step-3', label: 'Third Step', required: false, order: 3 }),
  ],
  activeStepId: 'step-1',
  completedCount: 0,
  requiredCount: 2,
  isComplete: false,
  percentComplete: 0,
  onAllCompleteFired: false,
};

// ── inProgress ──────────────────────────────────────────────────────────────

const inProgressDraft: IStepWizardDraft = {
  stepStatuses: {
    'step-1': 'complete',
    'step-2': 'in-progress',
    'step-3': 'not-started',
  },
  completedAts: {
    'step-1': '2026-03-08T09:00:00Z',
    'step-2': null,
    'step-3': null,
  },
  visitedStepIds: ['step-1', 'step-2'],
  onAllCompleteFired: false,
  activeStepId: 'step-2',
  savedAt: new Date().toISOString(),
};

const inProgressState: IStepWizardState = {
  steps: [
    runtimeStep({ stepId: 'step-1', label: 'First Step', required: true, order: 1, status: 'complete', completedAt: '2026-03-08T09:00:00Z', isVisited: true }),
    runtimeStep({ stepId: 'step-2', label: 'Second Step', required: true, order: 2, status: 'in-progress', isVisited: true }),
    runtimeStep({ stepId: 'step-3', label: 'Third Step', required: false, order: 3 }),
  ],
  activeStepId: 'step-2',
  completedCount: 1,
  requiredCount: 2,
  isComplete: false,
  percentComplete: 50,
  onAllCompleteFired: false,
};

// ── complete ────────────────────────────────────────────────────────────────

const completeDraft: IStepWizardDraft = {
  stepStatuses: {
    'step-1': 'complete',
    'step-2': 'complete',
    'step-3': 'complete',
  },
  completedAts: {
    'step-1': '2026-03-08T09:00:00Z',
    'step-2': '2026-03-08T09:30:00Z',
    'step-3': '2026-03-08T10:00:00Z',
  },
  visitedStepIds: ['step-1', 'step-2', 'step-3'],
  onAllCompleteFired: false,
  activeStepId: null,
  savedAt: new Date().toISOString(),
};

const completeState: IStepWizardState = {
  steps: [
    runtimeStep({ stepId: 'step-1', label: 'First Step', required: true, order: 1, status: 'complete', completedAt: '2026-03-08T09:00:00Z', isVisited: true }),
    runtimeStep({ stepId: 'step-2', label: 'Second Step', required: true, order: 2, status: 'complete', completedAt: '2026-03-08T09:30:00Z', isVisited: true }),
    runtimeStep({ stepId: 'step-3', label: 'Third Step', required: false, order: 3, status: 'complete', completedAt: '2026-03-08T10:00:00Z', isVisited: true }),
  ],
  activeStepId: null,
  completedCount: 3,
  requiredCount: 2,
  isComplete: true,
  percentComplete: 100,
  onAllCompleteFired: false,
};

// ── withBlocked ─────────────────────────────────────────────────────────────

const withBlockedDraft: IStepWizardDraft = {
  stepStatuses: {
    'step-1': 'complete',
    'step-2': 'blocked',
    'step-3': 'not-started',
  },
  completedAts: {
    'step-1': '2026-03-08T09:00:00Z',
    'step-2': null,
    'step-3': null,
  },
  visitedStepIds: ['step-1', 'step-2'],
  onAllCompleteFired: false,
  activeStepId: 'step-3',
  savedAt: new Date().toISOString(),
};

const withBlockedState: IStepWizardState = {
  steps: [
    runtimeStep({ stepId: 'step-1', label: 'First Step', required: true, order: 1, status: 'complete', completedAt: '2026-03-08T09:00:00Z', isVisited: true }),
    runtimeStep({ stepId: 'step-2', label: 'Second Step', required: true, order: 2, status: 'blocked', isVisited: true }),
    runtimeStep({ stepId: 'step-3', label: 'Third Step', required: false, order: 3 }),
  ],
  activeStepId: 'step-3',
  completedCount: 1,
  requiredCount: 2,
  isComplete: false,
  percentComplete: 50,
  onAllCompleteFired: false,
};

// ── withSkipped ─────────────────────────────────────────────────────────────

const withSkippedDraft: IStepWizardDraft = {
  stepStatuses: {
    'step-1': 'complete',
    'step-2': 'skipped',
    'step-3': 'not-started',
  },
  completedAts: {
    'step-1': '2026-03-08T09:00:00Z',
    'step-2': null,
    'step-3': null,
  },
  visitedStepIds: ['step-1', 'step-2'],
  onAllCompleteFired: false,
  activeStepId: 'step-3',
  savedAt: new Date().toISOString(),
};

const withSkippedState: IStepWizardState = {
  steps: [
    runtimeStep({ stepId: 'step-1', label: 'First Step', required: true, order: 1, status: 'complete', completedAt: '2026-03-08T09:00:00Z', isVisited: true }),
    runtimeStep({ stepId: 'step-2', label: 'Second Step', required: true, order: 2, status: 'skipped', isVisited: true }),
    runtimeStep({ stepId: 'step-3', label: 'Third Step', required: false, order: 3 }),
  ],
  activeStepId: 'step-3',
  completedCount: 1,
  requiredCount: 2,
  isComplete: true,
  percentComplete: 100,
  onAllCompleteFired: false,
};

// ── partialParallel ─────────────────────────────────────────────────────────

const partialParallelDraft: IStepWizardDraft = {
  stepStatuses: {
    'step-1': 'complete',
    'step-2': 'in-progress',
    'step-3': 'not-started',
  },
  completedAts: {
    'step-1': '2026-03-08T09:00:00Z',
    'step-2': null,
    'step-3': null,
  },
  visitedStepIds: ['step-1', 'step-2', 'step-3'],
  onAllCompleteFired: false,
  activeStepId: 'step-2',
  savedAt: new Date().toISOString(),
};

const partialParallelState: IStepWizardState = {
  steps: [
    runtimeStep({ stepId: 'step-1', label: 'First Step', required: true, order: 1, status: 'complete', completedAt: '2026-03-08T09:00:00Z', isVisited: true }),
    runtimeStep({ stepId: 'step-2', label: 'Second Step', required: true, order: 2, status: 'in-progress', isVisited: true }),
    runtimeStep({ stepId: 'step-3', label: 'Third Step', required: false, order: 3, isVisited: true }),
  ],
  activeStepId: 'step-2',
  completedCount: 1,
  requiredCount: 2,
  isComplete: false,
  percentComplete: 50,
  onAllCompleteFired: false,
};

// ── Export ───────────────────────────────────────────────────────────────────

/**
 * Pre-built wizard state presets for testing.
 *
 * Each preset includes both `state` (IStepWizardState) and `draft` (IStepWizardDraft).
 *
 * - `notStarted` — all steps 'not-started', no visits
 * - `inProgress` — step-1 complete, step-2 in-progress
 * - `complete` — all steps 'complete', onAllCompleteFired: false
 * - `withBlocked` — step-2 blocked
 * - `withSkipped` — step-2 skipped (counts as complete for required check)
 * - `partialParallel` — mixed states for parallel mode testing
 */
export const mockWizardStates = {
  notStarted: { state: notStartedState, draft: notStartedDraft } as MockWizardStatePreset,
  inProgress: { state: inProgressState, draft: inProgressDraft } as MockWizardStatePreset,
  complete: { state: completeState, draft: completeDraft } as MockWizardStatePreset,
  withBlocked: { state: withBlockedState, draft: withBlockedDraft } as MockWizardStatePreset,
  withSkipped: { state: withSkippedState, draft: withSkippedDraft } as MockWizardStatePreset,
  partialParallel: { state: partialParallelState, draft: partialParallelDraft } as MockWizardStatePreset,
};

export type { MockWizardStatePreset };
