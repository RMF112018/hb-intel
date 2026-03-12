import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createSuggestedIntelligenceMatch } from '@hbc/strategic-intelligence';
import { createMockStrategicIntelligenceState } from '@hbc/strategic-intelligence/testing';
import { StrategicIntelligenceFeed } from './StrategicIntelligenceFeed.js';

const createFeedState = () => {
  const state = createMockStrategicIntelligenceState('bd-feed-test');
  state.livingEntries = [
    {
      ...state.livingEntries[0],
      entryId: 'entry-approved',
      type: 'risk-gap',
      title: 'Approved Entry',
      lifecycleState: 'approved',
      sensitivity: 'public-internal',
      metadata: {
        ...state.livingEntries[0].metadata,
        sector: 'Healthcare',
        geography: 'Midwest',
      },
      commitmentIds: ['commitment-1'],
      trust: {
        ...state.livingEntries[0].trust,
        reliabilityTier: 'high',
        isStale: false,
      },
    },
    {
      ...state.livingEntries[0],
      entryId: 'entry-pending',
      type: 'market-insight',
      title: 'Pending Entry',
      lifecycleState: 'pending-approval',
      sensitivity: 'restricted-project',
      trust: {
        ...state.livingEntries[0].trust,
        reliabilityTier: 'review-required',
        isStale: true,
      },
      conflicts: [
        {
          conflictId: 'conflict-2',
          type: 'supersession',
          relatedEntryIds: ['entry-pending'],
          resolutionStatus: 'open',
        },
      ],
      commitmentIds: ['commitment-1'],
    },
  ];

  return state;
};

describe('StrategicIntelligenceFeed', () => {
  it('renders entries with filters, stale/conflict markers, and callback wiring', () => {
    const state = createFeedState();
    const onFilterChange = vi.fn();
    const onOpenResolutionNote = vi.fn();

    render(
      <StrategicIntelligenceFeed
        entries={state.livingEntries}
        suggestions={[
          createSuggestedIntelligenceMatch({ suggestionId: 's1', reason: 'heritage snapshot match' }),
          createSuggestedIntelligenceMatch({ suggestionId: 's2', reason: 'intelligence metadata match' }),
        ]}
        bicOwnerAvatars={[
          {
            commitmentId: 'commitment-1',
            owner: {
              userId: 'owner-1',
              displayName: 'Casey Owner',
              role: 'BD Lead',
            },
          },
        ]}
        canViewNonApproved
        onFilterChange={onFilterChange}
        onOpenResolutionNote={onOpenResolutionNote}
        onOpenRelatedItem={(entryId) => `/related/${entryId}`}
        syncBadge="Queued to sync"
      />
    );

    expect(screen.getByTestId('strategic-intelligence-feed')).toBeInTheDocument();
    expect(screen.getByTestId('strategic-intelligence-sync-badge')).toHaveTextContent('Queued to sync');
    expect(screen.getByTestId('strategic-intelligence-owner-entry-approved')).toHaveTextContent('Casey Owner');
    expect(screen.getByText('Stale intelligence')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filter by lifecycle state'), {
      target: { value: 'pending-approval' },
    });
    expect(onFilterChange).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Open resolution note conflict-2/i }));
    expect(onOpenResolutionNote).toHaveBeenCalledWith('conflict-2');
  });

  it('renders redacted projection and empty-state CTA for unauthorized contexts', () => {
    const state = createFeedState();

    render(
      <StrategicIntelligenceFeed
        entries={state.livingEntries}
        suggestions={[]}
        roleLabel="Project Manager"
      />
    );

    expect(screen.getByTestId('strategic-intelligence-redacted-entry-pending')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filter by lifecycle state'), {
      target: { value: 'rejected' },
    });

    expect(screen.getByTestId('strategic-intelligence-feed-empty-state')).toHaveTextContent(
      'Project Manager: add a contribution'
    );
    expect(screen.getByRole('button', { name: 'Add strategic intelligence contribution' })).toBeInTheDocument();
  });
});
