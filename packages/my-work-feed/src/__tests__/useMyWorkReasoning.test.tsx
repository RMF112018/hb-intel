import { renderHook, waitFor } from '@testing-library/react';
import { useMyWorkReasoning, buildReasoningPayload } from '../hooks/useMyWorkReasoning.js';
import { createTestWrapper } from './hookTestUtils.js';
import { createMockMyWorkFeedResult, createMockMyWorkItem } from '@hbc/my-work-feed/testing';

vi.mock('../api/aggregateFeed.js');

import { aggregateFeed } from '../api/aggregateFeed.js';

const mockAggregateFeed = vi.mocked(aggregateFeed);

describe('useMyWorkReasoning', () => {
  const item = createMockMyWorkItem({ workItemId: 'work-42' });

  beforeEach(() => {
    mockAggregateFeed.mockReset();
    mockAggregateFeed.mockResolvedValue(createMockMyWorkFeedResult({ items: [item] }));
  });

  it('returns reasoning payload for found item', async () => {
    const { result } = renderHook(() => useMyWorkReasoning('work-42'), {
      wrapper: createTestWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.reasoning).toEqual({
      workItemId: 'work-42',
      canonicalKey: item.canonicalKey,
      title: item.title,
      rankingReason: item.rankingReason,
      lifecycle: item.lifecycle,
      permissionState: item.permissionState,
      sourceMeta: item.sourceMeta,
      dedupeInfo: undefined,
      supersessionInfo: undefined,
    });
  });

  it('does not fetch when itemId is null', () => {
    const { result } = renderHook(() => useMyWorkReasoning(null), {
      wrapper: createTestWrapper(),
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.reasoning).toBeUndefined();
    expect(mockAggregateFeed).not.toHaveBeenCalled();
  });

  it('returns undefined reasoning when item is not found', async () => {
    mockAggregateFeed.mockResolvedValue(createMockMyWorkFeedResult({ items: [] }));
    const { result } = renderHook(() => useMyWorkReasoning('nonexistent'), {
      wrapper: createTestWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reasoning).toBeUndefined();
  });

  it('returns error state on failure', async () => {
    mockAggregateFeed.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useMyWorkReasoning('work-42'), {
      wrapper: createTestWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('buildReasoningPayload', () => {
  it('extracts reasoning fields from item', () => {
    const item = createMockMyWorkItem({
      workItemId: 'work-99',
      dedupe: { dedupeKey: 'dk', mergedSourceMeta: [], mergeReason: 'test' },
      supersession: {
        supersededByWorkItemId: 'work-100',
        supersessionReason: 'higher priority',
        originalRankingReason: { primaryReason: 'old', contributingReasons: [] },
      },
    });

    const payload = buildReasoningPayload(item);
    expect(payload.workItemId).toBe('work-99');
    expect(payload.dedupeInfo).toEqual(item.dedupe);
    expect(payload.supersessionInfo).toEqual(item.supersession);
    expect(payload.rankingReason).toBe(item.rankingReason);
    expect(payload.lifecycle).toBe(item.lifecycle);
    expect(payload.permissionState).toBe(item.permissionState);
    expect(payload.sourceMeta).toBe(item.sourceMeta);
  });
});
