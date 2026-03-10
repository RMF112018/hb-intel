import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnnotationApi } from '../api/AnnotationApi';
import { useFieldAnnotation } from '../hooks/useFieldAnnotation';
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

describe('useFieldAnnotation', () => {
  it('returns annotations filtered by fieldKey and computes openCount', async () => {
    const mockData = [
      createMockAnnotation({ fieldKey: 'gmp', status: 'open' }),
      createMockAnnotation({ fieldKey: 'gmp', status: 'open', annotationId: 'a2' }),
      createMockAnnotation({ fieldKey: 'gmp', status: 'resolved', annotationId: 'a3' }),
    ];
    vi.mocked(AnnotationApi.list).mockResolvedValue(mockData);

    const { result } = renderHook(
      () => useFieldAnnotation('bd-scorecard', 'rec-001', 'gmp'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.annotations).toHaveLength(3);
    expect(result.current.openCount).toBe(2);
  });

  it('passes fieldKey to AnnotationApi.list', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);

    renderHook(
      () => useFieldAnnotation('bd-scorecard', 'rec-001', 'gmp'),
      { wrapper }
    );

    await waitFor(() => {
      expect(AnnotationApi.list).toHaveBeenCalledWith('bd-scorecard', 'rec-001', { fieldKey: 'gmp' });
    });
  });

  it('returns empty state when enabled=false', () => {
    const { result } = renderHook(
      () => useFieldAnnotation('bd-scorecard', 'rec-001', 'gmp', false),
      { wrapper }
    );

    expect(result.current.annotations).toEqual([]);
    expect(result.current.openCount).toBe(0);
    expect(AnnotationApi.list).not.toHaveBeenCalled();
  });

  it('does not fetch when fieldKey is empty', () => {
    const { result } = renderHook(
      () => useFieldAnnotation('bd-scorecard', 'rec-001', ''),
      { wrapper }
    );

    expect(result.current.annotations).toEqual([]);
    expect(AnnotationApi.list).not.toHaveBeenCalled();
  });

  it('exposes isError on API failure', async () => {
    vi.mocked(AnnotationApi.list).mockRejectedValue(new Error('fail'));

    const { result } = renderHook(
      () => useFieldAnnotation('bd-scorecard', 'rec-001', 'gmp'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
