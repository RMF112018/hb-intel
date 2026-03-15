import { renderHook, waitFor } from '@testing-library/react';
import { useMyWorkTeamFeed, projectTeamFeed } from '../hooks/useMyWorkTeamFeed.js';
import { createTestWrapper } from './hookTestUtils.js';
import { createMockMyWorkFeedResult, createMockMyWorkItem } from '@hbc/my-work-feed/testing';
import type { IMyWorkItem } from '../types/index.js';

vi.mock('../api/aggregateFeed.js');

import { aggregateFeed } from '../api/aggregateFeed.js';

const mockAggregateFeed = vi.mocked(aggregateFeed);

const delegator = { type: 'user' as const, id: 'user-002', label: 'Boss' };
const delegate = { type: 'user' as const, id: 'user-003', label: 'Team Member' };

describe('useMyWorkTeamFeed', () => {
  const items: IMyWorkItem[] = [
    createMockMyWorkItem({ workItemId: '1', delegatedTo: delegate }),
    createMockMyWorkItem({ workItemId: '2', delegatedBy: delegator }),
    createMockMyWorkItem({ workItemId: '3', isOverdue: true }),
    createMockMyWorkItem({ workItemId: '4', isBlocked: true, state: 'blocked' }),
    createMockMyWorkItem({ workItemId: '5' }), // no delegation, not overdue, not blocked
  ];

  beforeEach(() => {
    mockAggregateFeed.mockReset();
    mockAggregateFeed.mockResolvedValue(
      createMockMyWorkFeedResult({ items, lastRefreshedIso: '2026-01-15T12:00:00.000Z' }),
    );
  });

  it('filters delegated-by-me scope', async () => {
    const { result } = renderHook(
      () => useMyWorkTeamFeed({ ownerScope: 'delegated-by-me' }),
      { wrapper: createTestWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.teamFeed?.items.map((i) => i.workItemId)).toEqual(['1']);
  });

  it('filters my-team scope', async () => {
    const { result } = renderHook(
      () => useMyWorkTeamFeed({ ownerScope: 'my-team' }),
      { wrapper: createTestWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.teamFeed?.items.map((i) => i.workItemId)).toEqual(['1', '2']);
  });

  it('filters escalation-candidate scope', async () => {
    const { result } = renderHook(
      () => useMyWorkTeamFeed({ ownerScope: 'escalation-candidate' }),
      { wrapper: createTestWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.teamFeed?.items.map((i) => i.workItemId)).toEqual(['3', '4']);
  });

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(
      () => useMyWorkTeamFeed({ ownerScope: 'my-team', enabled: false }),
      { wrapper: createTestWrapper() },
    );
    expect(result.current.isLoading).toBe(false);
    expect(mockAggregateFeed).not.toHaveBeenCalled();
  });

  it('returns error state on failure', async () => {
    mockAggregateFeed.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(
      () => useMyWorkTeamFeed({ ownerScope: 'my-team' }),
      { wrapper: createTestWrapper() },
    );
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('passes query through to aggregateFeed', async () => {
    const query = { projectId: 'proj-001' };
    renderHook(
      () => useMyWorkTeamFeed({ ownerScope: 'my-team', query }),
      { wrapper: createTestWrapper() },
    );
    await waitFor(() => expect(mockAggregateFeed).toHaveBeenCalled());
    expect(mockAggregateFeed.mock.calls[0][0].query).toEqual(query);
  });
});

describe('projectTeamFeed', () => {
  const items: IMyWorkItem[] = [
    createMockMyWorkItem({ workItemId: '1', delegatedTo: delegate, isOverdue: true }),
    createMockMyWorkItem({ workItemId: '2', delegatedBy: delegator, isBlocked: true, state: 'blocked' }),
    createMockMyWorkItem({ workItemId: '3' }),
  ];

  it('computes correct counts for my-team scope', () => {
    const result = projectTeamFeed(items, 'my-team', '2026-01-15T12:00:00.000Z');
    expect(result.totalCount).toBe(2);
    expect(result.agingCount).toBe(1);
    expect(result.blockedCount).toBe(1);
    expect(result.escalationCandidateCount).toBe(2); // one overdue, one blocked
    expect(result.lastRefreshedIso).toBe('2026-01-15T12:00:00.000Z');
  });

  it('returns empty result for no matching items', () => {
    const result = projectTeamFeed(
      [createMockMyWorkItem()],
      'delegated-by-me',
      '2026-01-15T12:00:00.000Z',
    );
    expect(result.totalCount).toBe(0);
    expect(result.items).toEqual([]);
  });
});
