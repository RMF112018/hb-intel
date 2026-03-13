import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HbcThemeProvider } from '@hbc/ui-kit';

const updateSectionDraftMock = vi.fn();
const escalateDeadlockMock = vi.fn();

vi.mock('@hbc/post-bid-autopsy', () => ({
  usePostBidAutopsyState: () => ({
    state: {
      autopsy: {
        autopsyId: 'autopsy-1',
        pursuitId: 'pursuit-1',
        scorecardId: 'scorecard-1',
        outcome: 'lost',
        status: 'review',
        confidence: {
          tier: 'moderate',
          score: 0.76,
          reasons: ['Estimate assumptions changed', 'Coverage gap'],
          evidenceCoverage: 0.6,
        },
      },
    },
    loading: false,
    error: null,
    refresh: async () => undefined,
    publicationBlockers: {
      publishable: false,
      blockers: ['review-pending'],
    },
  }),
  usePostBidAutopsySections: () => ({
    state: {
      autopsyId: 'autopsy-1',
      sections: [
        {
          sectionKey: 'pricing',
          title: 'Pricing Review',
          owner: { userId: 'owner-1', displayName: 'Alex Owner', role: 'Pricing Lead' },
          evidenceCount: 1,
          evidenceComplete: false,
          validationErrors: ['Need one more cost artifact'],
          draftValue: '',
        },
      ],
    },
    loading: false,
    error: null,
    refresh: async () => undefined,
    updateSectionDraft: updateSectionDraftMock,
  }),
  usePostBidAutopsyReview: () => ({
    state: {
      disagreements: [
        {
          disagreementId: 'd-1',
          criterion: 'Estimate contingency',
          summary: 'Contingency disagreement is still open.',
        },
      ],
      escalationEvents: [],
    },
    triage: {
      hasOpenDisagreements: true,
      escalationRequired: true,
    },
    loading: false,
    error: null,
    refresh: async () => undefined,
    escalateDeadlock: escalateDeadlockMock,
  }),
  usePostBidAutopsyQueue: () => ({
    state: {
      optimisticStatusLabel: 'Saved locally',
    },
    loading: false,
    error: null,
    refresh: async () => undefined,
  }),
}));

vi.mock('../hooks/index.js', () => ({
  useEstimatingPostBidLearning: () => ({
    state: {
      trustIndicator: {
        confidenceTier: 'moderate',
        blockerCount: 1,
        evidenceComplete: false,
      },
      avatarOwnership: {
        primaryOwner: 'Morgan Reviewer',
        escalationOwner: 'Chief Estimator',
      },
      myWorkPlacement: {
        bucket: 'review-queue',
      },
    },
    loading: false,
    error: null,
  }),
}));

vi.mock('@hbc/step-wizard', async () => {
  const ReactModule = await import('react');

  return {
    HbcStepProgress: () => <div data-testid="step-progress">5 steps</div>,
    useStepWizard: (config: { steps: Array<{ stepId: string; label: string; validate?: () => string | null }> }) => {
      const [activeStepId, setActiveStepId] = ReactModule.useState<string | null>(config.steps[0]?.stepId ?? null);
      const [completeIds, setCompleteIds] = ReactModule.useState<string[]>([]);
      const [errors, setErrors] = ReactModule.useState<Record<string, string | null>>({});

      const steps = config.steps.map((step) => ({
        ...step,
        status: completeIds.includes(step.stepId)
          ? 'complete'
          : step.stepId === activeStepId
            ? 'in-progress'
            : 'not-started',
        validationError: errors[step.stepId] ?? null,
        assignee: null,
      }));

      return {
        state: {
          steps,
          activeStepId,
        },
        goTo: (stepId: string) => setActiveStepId(stepId),
        advance: () => {
          const currentIndex = config.steps.findIndex((step) => step.stepId === activeStepId);
          const next = config.steps[currentIndex + 1];
          if (next) {
            setActiveStepId(next.stepId);
          }
        },
        markComplete: async (stepId: string) => {
          const step = config.steps.find((item) => item.stepId === stepId);
          const error = step?.validate?.() ?? null;
          setErrors((current) => ({ ...current, [stepId]: error }));
          if (!error) {
            setCompleteIds((current) => [...new Set([...current, stepId])]);
          }
        },
        getValidationError: (stepId: string) => errors[stepId] ?? null,
      };
    },
  };
});

import { PostBidAutopsyWizard } from './PostBidAutopsyWizard.js';

const renderWithTheme = (node: React.ReactElement) =>
  render(<HbcThemeProvider>{node}</HbcThemeProvider>);

describe('PostBidAutopsyWizard', () => {
  beforeEach(() => {
    updateSectionDraftMock.mockReset();
    escalateDeadlockMock.mockReset();
  });

  it('renders estimating-specific trust and workflow projections', async () => {
    renderWithTheme(
      <PostBidAutopsyWizard
        pursuitId="pursuit-1"
        complexityTier="Standard"
        impactPreview={{ title: 'Benchmark impact', summary: 'Benchmark update will be queued.' }}
      />,
    );

    expect(screen.getByText('Outcome + estimate context')).toBeInTheDocument();
    expect(screen.getByText('Trust indicator: moderate / blockers 1')).toBeInTheDocument();
    expect(screen.getByText('Escalation owner: Chief Estimator')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getByText('Document the estimate context before continuing.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Outcome narrative'), {
      target: { value: 'Estimate drift and incomplete evidence delayed approval.' },
    });
    await waitFor(() => {
      expect(updateSectionDraftMock).toHaveBeenCalled();
    });
  });

  it('renders disagreement escalation and expert comparator state', async () => {
    renderWithTheme(
      <PostBidAutopsyWizard
        pursuitId="pursuit-1"
        complexityTier="Expert"
        comparatorCallouts={[{ title: 'Comparator 1', summary: 'Historic estimate overrun.' }]}
        impactPreview={{ title: 'Benchmark impact', summary: 'Benchmark update will be queued.' }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go to Findings, cost impact, and recommendation' }));
    expect(screen.getByText('Comparator callouts')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go to Disagreements, approvals, and readiness' }));
    fireEvent.click(screen.getByRole('button', { name: 'Capture disagreement or escalation' }));
    expect(screen.getByRole('dialog', { name: 'Disagreement capture' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Escalation reason'), {
      target: { value: 'Estimator and reviewer still disagree.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Escalate disagreement' }));
    await waitFor(() => {
      expect(escalateDeadlockMock).toHaveBeenCalled();
    });
  });
});
