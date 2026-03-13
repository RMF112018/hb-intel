import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HbcThemeProvider } from '@hbc/ui-kit';

const updateSectionDraftMock = vi.fn();
const escalateDeadlockMock = vi.fn();
const refreshMock = vi.fn(async () => undefined);
const submitMock = vi.fn(async () => undefined);

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
          score: 0.71,
          reasons: ['Client timing', 'Scope mismatch'],
          evidenceCoverage: 0.5,
        },
      },
    },
    loading: false,
    error: null,
    refresh: refreshMock,
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
          validationErrors: ['Missing second evidence source'],
          draftValue: '',
        },
        {
          sectionKey: 'strategy',
          title: 'Strategy Review',
          owner: { userId: 'owner-2', displayName: 'Jamie Owner', role: 'Strategy Lead' },
          evidenceCount: 2,
          evidenceComplete: true,
          validationErrors: [],
          draftValue: '',
        },
      ],
    },
    loading: false,
    error: null,
    refresh: refreshMock,
    updateSectionDraft: updateSectionDraftMock,
  }),
  usePostBidAutopsyReview: () => ({
    state: {
      disagreements: [
        {
          disagreementId: 'd-1',
          criterion: 'Root cause',
          summary: 'Team disagrees on whether pricing or timing dominated.',
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
    refresh: refreshMock,
    escalateDeadlock: escalateDeadlockMock,
  }),
  usePostBidAutopsyQueue: () => ({
    state: {
      optimisticStatusLabel: 'Queued to sync',
    },
    loading: false,
    error: null,
    refresh: refreshMock,
  }),
}));

vi.mock('../hooks/index.js', () => ({
  useBusinessDevelopmentPostBidLearning: () => ({
    state: {
      trustIndicator: {
        confidenceTier: 'moderate',
        reasonCount: 2,
        publicationReady: false,
      },
      avatarOwnership: {
        primaryOwner: 'Morgan Reviewer',
        coOwners: ['Alex Owner', 'Jamie Owner'],
      },
      myWorkPlacement: {
        bucket: 'review-queue',
      },
      route: '/business-development/post-bid-learning/pursuit-1',
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
    submitMock.mockReset();
  });

  it('renders the five-step sequence, blocks invalid advancement, and persists draft changes', async () => {
    renderWithTheme(
      <PostBidAutopsyWizard
        pursuitId="pursuit-1"
        complexityTier="Standard"
        impactPreview={{ title: 'Downstream impact', summary: 'Benchmark and intelligence updates will be seeded.' }}
        aiSuggestions={[
          {
            suggestionId: 'ai-1',
            action: 'summarize',
            text: 'Suggested retrospective summary.',
            citations: [],
          },
        ]}
        onSubmitForApproval={submitMock}
      />,
    );

    expect(screen.getByText('Outcome + pursuit context')).toBeInTheDocument();
    expect(screen.getByText('Evidence and linked references')).toBeInTheDocument();
    expect(screen.getByText('Findings, root cause, and recommendation')).toBeInTheDocument();
    expect(screen.getByText('Disagreements, approvals, and readiness')).toBeInTheDocument();
    expect(screen.getByText('Downstream impact preview and submit')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getByText('Document the outcome context before continuing.')).toBeInTheDocument();
    expect(screen.getByText('Outcome and pursuit context')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Outcome narrative'), {
      target: { value: 'We lost on timing and pricing alignment.' },
    });

    await waitFor(() => {
      expect(updateSectionDraftMock).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getByText('Evidence and linked references')).toBeInTheDocument();
    expect(screen.getByText('Avatar ownership: Alex Owner (Pricing Lead)')).toBeInTheDocument();
    expect(screen.getByText('Confidence reasons: Client timing, Scope mismatch')).toBeInTheDocument();
    expect(screen.getByText('Evidence incomplete')).toBeInTheDocument();
    expect(screen.getByText('Source citation required before this AI suggestion can be applied.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit for approval' })).toBeDisabled();
  });

  it('renders explainability, disagreement escalation, impact preview, and complexity-specific shells', async () => {
    const { rerender } = renderWithTheme(
      <PostBidAutopsyWizard
        pursuitId="pursuit-1"
        complexityTier="Essential"
        comparatorCallouts={[
          { title: 'Comparator 1', summary: 'Similar pursuit timing drift.' },
        ]}
        impactPreview={{ title: 'Downstream impact', summary: 'Benchmark and intelligence updates will be seeded.' }}
      />,
    );

    expect(screen.getByText('Collapsed autopsy badge')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resume guided autopsy' }));
    expect(screen.getByTestId('bd-post-bid-autopsy-wizard')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go to Findings, root cause, and recommendation' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open explainability panel' }));
    expect(screen.getByRole('dialog', { name: 'Explainability' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go to Disagreements, approvals, and readiness' }));
    fireEvent.click(screen.getByRole('button', { name: 'Capture disagreement or escalation' }));
    expect(screen.getByRole('dialog', { name: 'Disagreement capture' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Escalation reason'), {
      target: { value: 'Deadlock remains unresolved.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Escalate disagreement' }));
    await waitFor(() => {
      expect(escalateDeadlockMock).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Open downstream impact preview' }));
    expect(screen.getByRole('dialog', { name: 'Downstream impact preview' })).toBeInTheDocument();

    rerender(
      <HbcThemeProvider>
        <PostBidAutopsyWizard
          pursuitId="pursuit-1"
          complexityTier="Expert"
          comparatorCallouts={[
            { title: 'Comparator 1', summary: 'Similar pursuit timing drift.' },
          ]}
          impactPreview={{ title: 'Downstream impact', summary: 'Benchmark and intelligence updates will be seeded.' }}
        />
      </HbcThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go to Findings, root cause, and recommendation' }));
    expect(screen.getByText('Comparator callouts')).toBeInTheDocument();
  });
});
