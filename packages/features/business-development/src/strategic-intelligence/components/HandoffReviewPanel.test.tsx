import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createMockStrategicIntelligenceState } from '@hbc/strategic-intelligence/testing';
import { HandoffReviewPanel } from './HandoffReviewPanel.js';

const createReview = () => {
  const state = createMockStrategicIntelligenceState('handoff-panel-test');
  return {
    ...state.handoffReview!,
    participants: [
      {
        participantId: 'pm-1',
        displayName: 'Pat PM',
        role: 'Project Manager',
        acknowledgedAt: null,
      },
      {
        participantId: 'px-1',
        displayName: 'Alex PX',
        role: 'Project Executive',
        acknowledgedAt: null,
      },
      {
        participantId: 'est-1',
        displayName: 'Evan Est',
        role: 'Estimating Lead',
        acknowledgedAt: null,
      },
      {
        participantId: 'bd-1',
        displayName: 'Bailey BD',
        role: 'BD Lead',
        acknowledgedAt: new Date().toISOString(),
      },
    ],
  };
};

describe('HandoffReviewPanel', () => {
  it('renders participants, steps, and completion gate blockers', () => {
    const onAcknowledgeParticipant = vi.fn();
    const onMarkCompletion = vi.fn();

    render(
      <HandoffReviewPanel
        review={createReview()}
        snapshotAligned={false}
        unresolvedCommitmentIds={['commitment-1']}
        unacknowledgedParticipantIds={['pm-1', 'px-1', 'est-1']}
        onAcknowledgeParticipant={onAcknowledgeParticipant}
        onMarkCompletion={onMarkCompletion}
      />
    );

    expect(screen.getByTestId('handoff-step-1')).toHaveTextContent('heritage snapshot walkthrough');
    expect(screen.getByTestId('handoff-step-4')).toHaveTextContent('acknowledgment confirmation');
    expect(screen.getByTestId('handoff-completion-gate')).toHaveTextContent('Unresolved commitments: 1');

    fireEvent.click(screen.getByRole('button', { name: 'Acknowledge Project Manager' }));
    expect(onAcknowledgeParticipant).toHaveBeenCalledWith('pm-1');

    fireEvent.click(screen.getByRole('button', { name: 'Mark handoff review completion' }));
    expect(onMarkCompletion).toHaveBeenCalled();
  });

  it('shows completion-ready state when all gates are met', () => {
    const review = createReview();
    review.participants = review.participants.map((item) => ({
      ...item,
      acknowledgedAt: new Date().toISOString(),
    }));

    render(
      <HandoffReviewPanel
        review={review}
        snapshotAligned={true}
        unresolvedCommitmentIds={[]}
        unacknowledgedParticipantIds={[]}
      />
    );

    expect(screen.getByText('Ready to complete handoff review')).toBeInTheDocument();
    expect(screen.getByText('Snapshot alignment: Aligned to heritage snapshot')).toBeInTheDocument();
  });
});
