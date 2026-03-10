import * as React from 'react';
import { HbcStepWizard } from '../HbcStepWizard';
import { mockWizardStates } from '@hbc/step-wizard/testing';
import type { IStepWizardConfig, IStepWizardState, IUseStepWizardReturn } from '../../types/IStepWizard';

// ── Story Helpers ────────────────────────────────────────────────────────────

function createStoryConfig(overrides?: Partial<IStepWizardConfig<unknown>>): IStepWizardConfig<unknown> {
  return {
    title: 'Story Wizard',
    steps: [
      { stepId: 'step-1', label: 'Project Details', required: true, order: 1 },
      { stepId: 'step-2', label: 'Budget Allocation', required: true, order: 2 },
      { stepId: 'step-3', label: 'Review & Submit', required: false, order: 3 },
    ],
    orderMode: 'sequential',
    ...overrides,
  };
}

function StepBody({ stepId }: { stepId: string }): React.ReactElement {
  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: 8 }}>
      <p>Content for: <strong>{stepId}</strong></p>
      <p>This is a placeholder step body.</p>
    </div>
  );
}

const renderStep = (stepId: string) => <StepBody stepId={stepId} />;

// ── Stories ──────────────────────────────────────────────────────────────────

export default {
  title: 'Step Wizard/HbcStepWizard',
  component: HbcStepWizard,
};

export const SequentialVertical = {
  render: () => (
    <HbcStepWizard
      item={{}}
      config={createStoryConfig()}
      renderStep={renderStep}
      variant="vertical"
      complexityTier="standard"
    />
  ),
};

export const SequentialHorizontal = {
  render: () => (
    <HbcStepWizard
      item={{}}
      config={createStoryConfig()}
      renderStep={renderStep}
      variant="horizontal"
      complexityTier="standard"
    />
  ),
};

export const ParallelVertical = {
  render: () => (
    <HbcStepWizard
      item={{}}
      config={createStoryConfig({ orderMode: 'parallel' })}
      renderStep={renderStep}
      variant="vertical"
      complexityTier="standard"
    />
  ),
};

export const SequentialWithJumps = {
  render: () => (
    <HbcStepWizard
      item={{}}
      config={createStoryConfig({ orderMode: 'sequential-with-jumps' })}
      renderStep={renderStep}
      variant="vertical"
      complexityTier="standard"
    />
  ),
};

export const CompleteState = {
  render: () => (
    <HbcStepWizard
      item={{}}
      config={createStoryConfig({ draftKey: 'story-complete' })}
      renderStep={renderStep}
      variant="vertical"
      complexityTier="standard"
    />
  ),
  parameters: {
    docs: { description: { story: 'All steps marked complete. Uses mockWizardStates.complete preset.' } },
  },
};

export const WithBlockedStep = {
  render: () => (
    <HbcStepWizard
      item={{}}
      config={createStoryConfig({ draftKey: 'story-blocked' })}
      renderStep={renderStep}
      variant="vertical"
      complexityTier="standard"
    />
  ),
  parameters: {
    docs: { description: { story: 'Step 2 is blocked. Uses mockWizardStates.withBlocked preset.' } },
  },
};

export const WithSkippedStep = {
  render: () => (
    <HbcStepWizard
      item={{}}
      config={createStoryConfig({ draftKey: 'story-skipped' })}
      renderStep={renderStep}
      variant="vertical"
      complexityTier="standard"
    />
  ),
  parameters: {
    docs: { description: { story: 'Step 2 is skipped. Uses mockWizardStates.withSkipped preset.' } },
  },
};

export const EssentialTierAdjacentSidebar = {
  render: () => (
    <HbcStepWizard
      item={{}}
      config={createStoryConfig()}
      renderStep={renderStep}
      variant="vertical"
      complexityTier="essential"
    />
  ),
  parameters: {
    docs: { description: { story: 'Essential tier — sidebar shows only adjacent steps.' } },
  },
};

export const ExpertTierWithTimestamps = {
  render: () => (
    <HbcStepWizard
      item={{}}
      config={createStoryConfig({ draftKey: 'story-expert' })}
      renderStep={renderStep}
      variant="vertical"
      complexityTier="expert"
    />
  ),
  parameters: {
    docs: { description: { story: 'Expert tier — shows completedAt timestamps and validation dots.' } },
  },
};

export const WithBicAssignees = {
  render: () => (
    <HbcStepWizard
      item={{}}
      config={createStoryConfig({
        steps: [
          { stepId: 'step-1', label: 'Project Details', required: true, order: 1, resolveAssignee: () => ({ userId: 'u1', displayName: 'Alice Johnson' }) },
          { stepId: 'step-2', label: 'Budget Allocation', required: true, order: 2, resolveAssignee: () => ({ userId: 'u2', displayName: 'Bob Smith' }) },
          { stepId: 'step-3', label: 'Review & Submit', required: false, order: 3, resolveAssignee: () => null },
        ],
      })}
      renderStep={renderStep}
      variant="vertical"
      complexityTier="standard"
    />
  ),
  parameters: {
    docs: { description: { story: 'Steps with BIC assignees — avatars shown at Standard+ tier.' } },
  },
};
