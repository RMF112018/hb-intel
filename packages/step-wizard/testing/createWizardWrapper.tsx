import * as React from 'react';
import { __setMockDraft, __resetMockDraft } from '../src/__mocks__/session-state';
import type { IStepWizardDraft } from '../src/state/draftPayload';

interface WizardPreset {
  draft: IStepWizardDraft;
}

/**
 * Factory that returns a React wrapper component for renderHook tests.
 * When a preset is provided, its draft is injected into the session-state mock
 * so that useStepWizard initialises with that draft on mount.
 */
export function createWizardWrapper(preset?: WizardPreset): React.FC<{ children: React.ReactNode }> {
  if (preset) {
    __setMockDraft(preset.draft);
  } else {
    __resetMockDraft();
  }

  return function WizardWrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
}
