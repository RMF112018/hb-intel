import * as React from 'react';
import { HbcStepProgress } from '../HbcStepProgress';
import type { IStepWizardConfig } from '../../types/IStepWizard';

// ── Story Helpers ────────────────────────────────────────────────────────────

function createStoryConfig(overrides?: Partial<IStepWizardConfig<unknown>>): IStepWizardConfig<unknown> {
  return {
    title: 'Progress Wizard',
    steps: [
      { stepId: 'step-1', label: 'Step 1', required: true, order: 1 },
      { stepId: 'step-2', label: 'Step 2', required: true, order: 2 },
      { stepId: 'step-3', label: 'Step 3', required: true, order: 3 },
    ],
    orderMode: 'sequential',
    draftKey: 'story-progress',
    ...overrides,
  };
}

// ── Stories ──────────────────────────────────────────────────────────────────

export default {
  title: 'Step Wizard/HbcStepProgress',
  component: HbcStepProgress,
};

export const FractionInProgress = {
  render: () => (
    <HbcStepProgress item={{}} config={createStoryConfig()} variant="fraction" />
  ),
  parameters: {
    docs: { description: { story: 'Fraction variant showing "X of Y" in progress.' } },
  },
};

export const FractionComplete = {
  render: () => (
    <HbcStepProgress item={{}} config={createStoryConfig({ draftKey: 'story-progress-complete' })} variant="fraction" />
  ),
  parameters: {
    docs: { description: { story: 'Fraction variant showing "✓ Complete".' } },
  },
};

export const BarInProgress = {
  render: () => (
    <HbcStepProgress item={{}} config={createStoryConfig()} variant="bar" />
  ),
  parameters: {
    docs: { description: { story: 'Bar variant with partial fill.' } },
  },
};

export const BarComplete = {
  render: () => (
    <HbcStepProgress item={{}} config={createStoryConfig({ draftKey: 'story-bar-complete' })} variant="bar" />
  ),
  parameters: {
    docs: { description: { story: 'Bar variant at 100%.' } },
  },
};

export const RingInProgress = {
  render: () => (
    <HbcStepProgress item={{}} config={createStoryConfig()} variant="ring" />
  ),
  parameters: {
    docs: { description: { story: 'Ring variant with SVG arc and percentage label.' } },
  },
};

export const RingComplete = {
  render: () => (
    <HbcStepProgress item={{}} config={createStoryConfig({ draftKey: 'story-ring-complete' })} variant="ring" />
  ),
  parameters: {
    docs: { description: { story: 'Ring variant at 100% showing checkmark.' } },
  },
};
