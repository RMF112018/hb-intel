import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createSuggestedIntelligenceMatch } from '@hbc/strategic-intelligence';
import { createMockStrategicIntelligenceState } from '@hbc/strategic-intelligence/testing';
import { BdHeritagePanel } from './BdHeritagePanel.js';

const createPanelState = () => {
  const state = createMockStrategicIntelligenceState('bd-panel-test');
  state.heritageSnapshot.clientPriorities = ['Schedule certainty', 'Safety'];
  state.commitmentRegister = [
    {
      ...state.commitmentRegister[0],
      commitmentId: 'commitment-open',
      fulfillmentStatus: 'open',
    },
  ];

  state.handoffReview = {
    ...(state.handoffReview ?? {
      reviewId: 'review-1',
      scorecardId: state.heritageSnapshot.scorecardId,
      startedAt: new Date().toISOString(),
      startedBy: 'user-1',
      participants: [],
      completionStatus: 'in-progress',
      outstandingCommitmentIds: [],
      version: state.version,
    }),
    participants: [
      {
        participantId: 'participant-1',
        displayName: 'Pat Reviewer',
        role: 'Project Manager',
        acknowledgedAt: new Date().toISOString(),
      },
      {
        participantId: 'participant-2',
        displayName: 'Casey Reviewer',
        role: 'BD Lead',
        acknowledgedAt: null,
      },
    ],
  };

  state.livingEntries = [
    {
      ...state.livingEntries[0],
      entryId: 'entry-approved',
      lifecycleState: 'approved',
      trust: {
        ...state.livingEntries[0].trust,
        reliabilityTier: 'high',
        isStale: false,
      },
      sensitivity: 'public-internal',
      commitmentIds: ['commitment-open'],
    },
    {
      ...state.livingEntries[0],
      entryId: 'entry-pending',
      lifecycleState: 'pending-approval',
      trust: {
        ...state.livingEntries[0].trust,
        reliabilityTier: 'review-required',
        isStale: true,
      },
      sensitivity: 'restricted-project',
      conflicts: [
        {
          conflictId: 'conflict-1',
          type: 'contradiction',
          relatedEntryIds: ['entry-pending'],
          resolutionStatus: 'open',
        },
      ],
      commitmentIds: ['commitment-open'],
    },
  ];

  return state;
};

describe('BdHeritagePanel', () => {
  it('renders split sections and trust/commitment/acknowledgment summaries', () => {
    const state = createPanelState();

    render(
      <BdHeritagePanel
        heritageSnapshot={state.heritageSnapshot}
        livingEntries={state.livingEntries}
        commitments={state.commitmentRegister}
        handoffReview={state.handoffReview}
        suggestions={[createSuggestedIntelligenceMatch({ suggestionId: 'suggestion-1' })]}
        complexity="Standard"
      />
    );

    expect(screen.getByTestId('heritage-snapshot-section')).toBeInTheDocument();
    expect(screen.getByTestId('living-strategic-intelligence-section')).toBeInTheDocument();
    expect(screen.getByTestId('commitment-summary-strip')).toHaveTextContent('Unresolved commitments: 1');
    expect(screen.getByTestId('handoff-ack-summary')).toHaveTextContent('Acknowledged: 1/2');
    expect(screen.getByTestId('heritage-immutable-indicator')).toHaveTextContent('Locked snapshot');
  });

  it('honors complexity differences for Essential and Expert', () => {
    const state = createPanelState();
    const workflowAction = vi.fn();

    const { rerender } = render(
      <BdHeritagePanel
        heritageSnapshot={state.heritageSnapshot}
        livingEntries={state.livingEntries}
        commitments={state.commitmentRegister}
        handoffReview={state.handoffReview}
        suggestions={[]}
        complexity="Essential"
      />
    );

    expect(screen.getByTestId('heritage-essential-summary')).toBeInTheDocument();
    expect(screen.getByTestId('living-essential-summary')).toBeInTheDocument();

    rerender(
      <BdHeritagePanel
        heritageSnapshot={state.heritageSnapshot}
        livingEntries={state.livingEntries}
        commitments={state.commitmentRegister}
        handoffReview={state.handoffReview}
        suggestions={[]}
        complexity="Expert"
        canViewNonApproved
        canViewSensitiveContent
        onOpenWorkflowAction={workflowAction}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open workflow action center' }));
    expect(workflowAction).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('expert-workflow-cta')).toBeInTheDocument();
  });

  it('renders fallback client context and complete acknowledgment copy', () => {
    const state = createPanelState();
    state.heritageSnapshot.clientPriorities = [];
    state.handoffReview = {
      ...state.handoffReview!,
      participants: state.handoffReview!.participants.map((participant) => ({
        ...participant,
        acknowledgedAt: new Date().toISOString(),
      })),
    };

    render(
      <BdHeritagePanel
        heritageSnapshot={state.heritageSnapshot}
        livingEntries={state.livingEntries}
        commitments={state.commitmentRegister.map((item) => ({
          ...item,
          fulfillmentStatus: 'fulfilled',
        }))}
        handoffReview={state.handoffReview}
        suggestions={[]}
        complexity="Standard"
      />
    );

    expect(screen.getByText('Client context: Not set')).toBeInTheDocument();
    expect(screen.getByText('Acknowledgment complete')).toBeInTheDocument();
    expect(screen.getByText('Unresolved commitments: 0')).toBeInTheDocument();
  });
});
