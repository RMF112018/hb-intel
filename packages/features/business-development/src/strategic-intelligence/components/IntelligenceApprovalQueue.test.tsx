import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createMockStrategicIntelligenceState } from '@hbc/strategic-intelligence/testing';
import { IntelligenceApprovalQueue } from './IntelligenceApprovalQueue.js';

const createQueueData = () => {
  const state = createMockStrategicIntelligenceState('approval-queue-test');
  state.livingEntries = [
    {
      ...state.livingEntries[0],
      entryId: 'entry-1',
      title: 'Pending Intelligence Entry',
      lifecycleState: 'pending-approval',
      trust: {
        ...state.livingEntries[0].trust,
        provenanceClass: 'ai-assisted-draft',
        reliabilityTier: 'review-required',
        isStale: true,
      },
      conflicts: [
        {
          conflictId: 'conflict-open-1',
          type: 'contradiction',
          relatedEntryIds: ['entry-1'],
          resolutionStatus: 'open',
        },
      ],
    },
  ];

  return {
    queue: [
      {
        queueItemId: 'queue-1',
        entryId: 'entry-1',
        submittedBy: 'author-1',
        submittedAt: new Date().toISOString(),
        approvalStatus: 'pending' as const,
      },
    ],
    entries: state.livingEntries,
  };
};

describe('IntelligenceApprovalQueue', () => {
  it('enforces reason for reject and request revision; approve action works', () => {
    const { queue, entries } = createQueueData();
    const onApprove = vi.fn();
    const onReject = vi.fn();
    const onRequestRevision = vi.fn();

    render(
      <IntelligenceApprovalQueue
        complexity="Expert"
        isApprover
        queue={queue}
        entries={entries}
        onApprove={onApprove}
        onReject={onReject}
        onRequestRevision={onRequestRevision}
      />
    );

    fireEvent.click(screen.getByText('Approve'));
    expect(onApprove).toHaveBeenCalledWith('queue-1');

    fireEvent.click(screen.getByText('Reject'));
    expect(onReject).not.toHaveBeenCalled();
    expect(
      screen.getByText('Reason is required for rejection and revision requests.')
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Reason for queue-1'), {
      target: { value: 'Needs stronger citations.' },
    });
    fireEvent.click(screen.getByText('Request revision'));
    expect(onRequestRevision).toHaveBeenCalledWith('queue-1', 'Needs stronger citations.');
  });

  it('renders complexity differences and stale/conflict action rows', () => {
    const { queue, entries } = createQueueData();
    const onRenewStaleReview = vi.fn();
    const onResolveConflict = vi.fn();

    const { rerender } = render(
      <IntelligenceApprovalQueue
        complexity="Essential"
        isApprover
        queue={queue}
        entries={entries}
      />
    );

    expect(screen.queryByTestId('intelligence-approval-queue')).not.toBeInTheDocument();

    rerender(
      <IntelligenceApprovalQueue
        complexity="Standard"
        isApprover
        queue={queue}
        entries={entries}
      />
    );

    expect(screen.getByTestId('intelligence-approval-queue-summary')).toHaveTextContent(
      'Pending approvals: 1'
    );

    rerender(
      <IntelligenceApprovalQueue
        complexity="Expert"
        isApprover
        queue={queue}
        entries={entries}
        onRenewStaleReview={onRenewStaleReview}
        onResolveConflict={onResolveConflict}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Renew stale review for entry-1' }));
    expect(onRenewStaleReview).toHaveBeenCalledWith('entry-1');

    fireEvent.click(screen.getByRole('button', { name: 'Resolve conflict conflict-open-1' }));
    expect(onResolveConflict).toHaveBeenCalledWith('conflict-open-1', 'Resolved from approval queue');
  });

  it('handles unauthorized expert view, missing entry rows, and empty stale/conflict states', () => {
    const { queue, entries } = createQueueData();
    const onOpenConfigureApprovers = vi.fn();

    const { rerender } = render(
      <IntelligenceApprovalQueue
        complexity="Expert"
        isApprover={false}
        queue={queue}
        entries={entries}
      />
    );

    expect(screen.getByTestId('intelligence-approval-queue-unauthorized')).toBeInTheDocument();

    rerender(
      <IntelligenceApprovalQueue
        complexity="Expert"
        isApprover
        queue={[...queue, { ...queue[0], queueItemId: 'queue-missing', entryId: 'missing-entry' }]}
        entries={[
          {
            ...entries[0],
            trust: {
              ...entries[0].trust,
              isStale: false,
            },
            conflicts: [],
          },
        ]}
        onOpenConfigureApprovers={onOpenConfigureApprovers}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Configure approvers route' }));
    expect(onOpenConfigureApprovers).toHaveBeenCalledTimes(1);
    expect(screen.getByText('No stale entries.')).toBeInTheDocument();
    expect(screen.getByText('No open conflicts.')).toBeInTheDocument();
    expect(screen.queryByTestId('approval-queue-item-queue-missing')).not.toBeInTheDocument();
  });

  it('renders all provenance label branches for queue entries', () => {
    const state = createMockStrategicIntelligenceState('approval-queue-provenance');
    const provenances = [
      'firsthand-observation',
      'meeting-summary',
      'project-outcome-learning',
      'inferred-observation',
    ] as const;

    const entries = provenances.map((provenance, index) => ({
      ...state.livingEntries[0],
      entryId: `entry-${index}`,
      title: `Entry ${index}`,
      trust: {
        ...state.livingEntries[0].trust,
        provenanceClass: provenance,
      },
    }));

    const queue = entries.map((entry, index) => ({
      queueItemId: `queue-${index}`,
      entryId: entry.entryId,
      submittedBy: `author-${index}`,
      submittedAt: new Date().toISOString(),
      approvalStatus: 'pending' as const,
    }));

    render(
      <IntelligenceApprovalQueue
        complexity="Expert"
        isApprover
        queue={queue}
        entries={entries}
      />
    );

    expect(screen.getByText('Provenance: Firsthand observation')).toBeInTheDocument();
    expect(screen.getByText('Provenance: Meeting summary')).toBeInTheDocument();
    expect(screen.getByText('Provenance: Project outcome learning')).toBeInTheDocument();
    expect(screen.getByText('Provenance: Inferred observation')).toBeInTheDocument();
  });
});
