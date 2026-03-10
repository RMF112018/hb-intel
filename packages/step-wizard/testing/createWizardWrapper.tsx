import * as React from 'react';
import { __setMockDraft, __resetMockDraft } from '../src/__mocks__/session-state';
import { ComplexityTestProvider } from '@hbc/complexity/testing';
import type { ComplexityTier } from '@hbc/complexity';
import type { IStepWizardDraft } from '../src/state/draftPayload';

interface WizardPreset {
  draft: IStepWizardDraft;
}

interface CreateWizardWrapperOptions {
  tier?: ComplexityTier;
}

/**
 * Factory that returns a React wrapper component for renderHook tests.
 * When a preset is provided, its draft is injected into the session-state mock
 * so that useStepWizard initialises with that draft on mount.
 * Wraps children with ComplexityTestProvider at the given tier (default 'standard').
 */
export function createWizardWrapper(
  preset?: WizardPreset,
  options?: CreateWizardWrapperOptions,
): React.FC<{ children: React.ReactNode }> {
  if (preset) {
    __setMockDraft(preset.draft);
  } else {
    __resetMockDraft();
  }

  const tier = options?.tier ?? 'standard';

  return function WizardWrapper({ children }: { children: React.ReactNode }) {
    return (
      <ComplexityTestProvider tier={tier}>
        {children}
      </ComplexityTestProvider>
    );
  };
}
