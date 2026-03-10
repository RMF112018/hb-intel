import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnnotationApi } from '../api/AnnotationApi';
import { useFieldAnnotations, computeAnnotationCounts } from '../hooks/useFieldAnnotations';
import { createMockAnnotation } from '../../testing/createMockAnnotation';

vi.mock('../api/AnnotationApi', () => ({
  AnnotationApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    addReply: vi.fn(),
    resolve: vi.fn(),
    withdraw: vi.fn(),
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  vi.mocked(AnnotationApi.list).mockReset();
});

describe('computeAnnotationCounts', () => {
  it('returns zero counts for empty array', () => {
    const counts = computeAnnotationCounts([]);
    expect(counts).toEqual({
      totalOpen: 0,
      openClarificationRequests: 0,
      openRevisionFlags: 0,
      openComments: 0,
      totalResolved: 0,
    });
  });

  it('counts open annotations by intent', () => {
    const annotations = [
      createMockAnnotation({ intent: 'clarification-request', status: 'open' }),
      createMockAnnotation({ intent: 'clarification-request', status: 'open' }),
      createMockAnnotation({ intent: 'flag-for-revision', status: 'open' }),
      createMockAnnotation({ intent: 'comment', status: 'open' }),
    ];
    const counts = computeAnnotationCounts(annotations);
    expect(counts.totalOpen).toBe(4);
    expect(counts.openClarificationRequests).toBe(2);
    expect(counts.openRevisionFlags).toBe(1);
    expect(counts.openComments).toBe(1);
    expect(counts.totalResolved).toBe(0);
  });

  it('counts resolved annotations separately', () => {
    const annotations = [
      createMockAnnotation({ intent: 'comment', status: 'open' }),
      createMockAnnotation({ intent: 'comment', status: 'resolved' }),
      createMockAnnotation({ intent: 'clarification-request', status: 'resolved' }),
    ];
    const counts = computeAnnotationCounts(annotations);
    expect(counts.totalOpen).toBe(1);
    expect(counts.totalResolved).toBe(2);
  });

  it('handles mixed annotations with withdrawn status', () => {
    const annotations = [
      createMockAnnotation({ intent: 'comment', status: 'open' }),
      createMockAnnotation({ intent: 'comment', status: 'withdrawn' }),
    ];
    const counts = computeAnnotationCounts(annotations);
    expect(counts.totalOpen).toBe(1);
    expect(counts.openComments).toBe(1);
    expect(counts.totalResolved).toBe(0);
  });
});

describe('useFieldAnnotations', () => {
  it('returns annotations and counts on success', async () => {
    const mockData = [
      createMockAnnotation({ intent: 'clarification-request', status: 'open' }),
      createMockAnnotation({ intent: 'comment', status: 'resolved' }),
    ];
    vi.mocked(AnnotationApi.list).mockResolvedValue(mockData);

    const { result } = renderHook(
      () => useFieldAnnotations('bd-scorecard', 'rec-001'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.annotations).toHaveLength(2);
    expect(result.current.counts.totalOpen).toBe(1);
    expect(result.current.counts.openClarificationRequests).toBe(1);
    expect(result.current.counts.totalResolved).toBe(1);
  });

  it('returns empty state when enabled=false', () => {
    const { result } = renderHook(
      () => useFieldAnnotations('bd-scorecard', 'rec-001', false),
      { wrapper }
    );

    expect(result.current.annotations).toEqual([]);
    expect(result.current.counts.totalOpen).toBe(0);
    expect(AnnotationApi.list).not.toHaveBeenCalled();
  });

  it('does not fetch when recordId is empty', () => {
    const { result } = renderHook(
      () => useFieldAnnotations('bd-scorecard', ''),
      { wrapper }
    );

    expect(result.current.annotations).toEqual([]);
    expect(AnnotationApi.list).not.toHaveBeenCalled();
  });

  it('exposes isError on API failure', async () => {
    vi.mocked(AnnotationApi.list).mockRejectedValue(new Error('API down'));

    const { result } = renderHook(
      () => useFieldAnnotations('bd-scorecard', 'rec-001'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
