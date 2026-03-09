import type { IStepWizardDraft } from '../src/state/draftPayload';

interface MockWizardStatePreset {
  draft: IStepWizardDraft;
}

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
  savedAt: new Date().toISOString(),
};

const completeDraft: IStepWizardDraft = {
  stepStatuses: {
    'step-1': 'complete',
    'step-2': 'complete',
    'step-3': 'complete',
  },
  completedAts: {
    'step-1': new Date().toISOString(),
    'step-2': new Date().toISOString(),
    'step-3': new Date().toISOString(),
  },
  visitedStepIds: ['step-1', 'step-2', 'step-3'],
  onAllCompleteFired: false,
  savedAt: new Date().toISOString(),
};

/**
 * Pre-built wizard state presets for testing.
 *
 * - `notStarted` — all steps 'not-started', no visits
 * - `complete` — all steps 'complete', onAllCompleteFired: false
 */
export const mockWizardStates: Record<string, MockWizardStatePreset> & {
  notStarted: MockWizardStatePreset;
  complete: MockWizardStatePreset;
} = {
  notStarted: { draft: notStartedDraft },
  complete: { draft: completeDraft },
};
