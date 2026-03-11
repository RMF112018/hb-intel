import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import type { IRelatedItem } from '../types/index.js';

vi.mock('../api/index.js', () => ({
  RelatedItemsApi: {
    getRelatedItems: vi.fn(),
  },
}));

vi.mock('@hbc/session-state', () => ({
  loadDraft: vi.fn(),
  saveDraft: vi.fn(),
}));

import { RelatedItemsApi } from '../api/index.js';
import { loadDraft, saveDraft } from '@hbc/session-state';
import { useRelatedItems } from './useRelatedItems.js';

function createMockItems(): IRelatedItem[] {
  return [
    {
      recordType: 'project',
      recordId: 'p-2',
      label: 'Project 2',
      href: '/projects/p-2',
      moduleIcon: 'project',
      relationship: 'has',
      relationshipLabel: 'Projects',
      bicState: { currentState: 'watch' },
    },
    {
      recordType: 'project',
      recordId: 'p-1',
      label: 'Project 1',
      href: '/projects/p-1',
      moduleIcon: 'project',
      relationship: 'has',
      relationshipLabel: 'Projects',
      bicState: { currentState: 'immediate' },
      aiConfidence: 0.88,
    },
    {
      recordType: 'permit',
      recordId: 'permit-1',
      label: 'Permit 1',
      href: '/permits/permit-1',
      moduleIcon: 'permits',
      relationship: 'references',
      relationshipLabel: 'AI Suggestion',
    },
  ];
}

describe('useRelatedItems (SF14-T04)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and returns deterministically sorted/grouped related items', async () => {
    vi.mocked(RelatedItemsApi.getRelatedItems).mockResolvedValue(createMockItems());
    vi.mocked(saveDraft).mockResolvedValue(null);

    const { result } = renderHook(() =>
      useRelatedItems({
        sourceRecordType: 'project',
        sourceRecordId: 'project-1',
        sourceRecord: { id: 'project-1' },
        currentUserRole: 'PM',
      }),
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.items.map((item) => item.recordId)).toEqual([
      'permit-1',
      'p-1',
      'p-2',
    ]);
    expect(Object.keys(result.current.groups)).toEqual([
      'AI Suggestion',
      'Projects',
    ]);
    expect(result.current.groups.Projects).toHaveLength(2);
    expect(saveDraft).toHaveBeenCalledTimes(1);
  });

  it('returns deterministic empty state and skips fetch for missing source id/type', async () => {
    const { result } = renderHook(() =>
      useRelatedItems({
        sourceRecordType: ' ',
        sourceRecordId: '',
        sourceRecord: {},
        currentUserRole: 'PM',
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.groups).toEqual({});
    expect(result.current.aiSuggestions).toBeUndefined();
    expect(result.current.error).toBeNull();
    expect(RelatedItemsApi.getRelatedItems).not.toHaveBeenCalled();
  });

  it('returns empty state for no-relationship/empty API response', async () => {
    vi.mocked(RelatedItemsApi.getRelatedItems).mockResolvedValue([]);
    vi.mocked(saveDraft).mockResolvedValue(null);

    const { result } = renderHook(() =>
      useRelatedItems({
        sourceRecordType: 'project',
        sourceRecordId: 'project-1',
        sourceRecord: {},
        currentUserRole: 'PM',
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.groups).toEqual({});
    expect(result.current.error).toBeNull();
  });

  it('uses cached data as stale-safe fallback on API failure (with error message)', async () => {
    vi.mocked(RelatedItemsApi.getRelatedItems).mockRejectedValue(new Error('Network unavailable'));
    vi.mocked(loadDraft).mockResolvedValue({
      items: createMockItems().slice(0, 2),
      cachedAt: '2026-03-11T00:00:00.000Z',
    });

    const { result } = renderHook(() =>
      useRelatedItems({
        sourceRecordType: 'project',
        sourceRecordId: 'project-2',
        sourceRecord: {},
        currentUserRole: 'PM',
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.error).toContain('Network unavailable');
  });

  it('returns empty results with error when API fails and cache is unavailable', async () => {
    vi.mocked(RelatedItemsApi.getRelatedItems).mockRejectedValue(new Error('503'));
    vi.mocked(loadDraft).mockResolvedValue(null);

    const { result } = renderHook(() =>
      useRelatedItems({
        sourceRecordType: 'project',
        sourceRecordId: 'project-3',
        sourceRecord: {},
        currentUserRole: 'PM',
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.groups).toEqual({});
    expect(result.current.error).toContain('503');
  });

  it('passes role to API and exposes AI suggestions while keeping full item list', async () => {
    const items = createMockItems();
    vi.mocked(RelatedItemsApi.getRelatedItems).mockResolvedValue(items);
    vi.mocked(saveDraft).mockResolvedValue(null);

    const { result } = renderHook(() =>
      useRelatedItems({
        sourceRecordType: 'project',
        sourceRecordId: 'project-4',
        sourceRecord: { id: 'project-4' },
        currentUserRole: 'Project Executive',
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(RelatedItemsApi.getRelatedItems).toHaveBeenCalledWith(
      'project',
      'project-4',
      { id: 'project-4' },
      'Project Executive',
    );
    expect(result.current.items).toHaveLength(3);
    expect(result.current.aiSuggestions).toHaveLength(2);
  });

  it('hides bicState when showBicState is false and keeps deterministic ordering across rerenders', async () => {
    vi.mocked(RelatedItemsApi.getRelatedItems).mockResolvedValue(createMockItems());
    vi.mocked(saveDraft).mockResolvedValue(null);

    const { result, rerender } = renderHook(
      (props: {
        sourceRecordType: string;
        sourceRecordId: string;
        sourceRecord: unknown;
        currentUserRole: string;
        showBicState?: boolean;
      }) => useRelatedItems(props),
      {
        initialProps: {
          sourceRecordType: 'project',
          sourceRecordId: 'project-5',
          sourceRecord: {},
          currentUserRole: 'PM',
          showBicState: false,
        },
      },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items.every((item) => item.bicState === undefined)).toBe(true);
    const firstOrder = result.current.items.map((item) => item.recordId);

    rerender({
      sourceRecordType: 'project',
      sourceRecordId: 'project-5',
      sourceRecord: {},
      currentUserRole: 'PM',
      showBicState: false,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items.map((item) => item.recordId)).toEqual(firstOrder);
  });
});
