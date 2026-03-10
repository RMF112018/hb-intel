import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnnotationApi } from '../api/AnnotationApi';
import { useAnnotationActions } from '../hooks/useAnnotationActions';
import { createMockAnnotation } from '../../testing/createMockAnnotation';
import { createMockAnnotationReply } from '../../testing/createMockAnnotationReply';

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

let queryClient: QueryClient;

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  vi.mocked(AnnotationApi.create).mockReset();
  vi.mocked(AnnotationApi.addReply).mockReset();
  vi.mocked(AnnotationApi.resolve).mockReset();
  vi.mocked(AnnotationApi.withdraw).mockReset();
});

describe('useAnnotationActions', () => {
  it('createAnnotation calls AnnotationApi.create and invalidates cache', async () => {
    const created = createMockAnnotation({ annotationId: 'new-001' });
    vi.mocked(AnnotationApi.create).mockResolvedValue(created);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useAnnotationActions('bd-scorecard', 'rec-001'),
      { wrapper }
    );

    await act(async () => {
      const r = await result.current.createAnnotation({
        recordType: 'bd-scorecard',
        recordId: 'rec-001',
        fieldKey: 'gmp',
        fieldLabel: 'GMP',
        intent: 'comment',
        body: 'New annotation',
      });
      expect(r.annotationId).toBe('new-001');
    });

    expect(AnnotationApi.create).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  it('addReply calls AnnotationApi.addReply and invalidates cache', async () => {
    const reply = createMockAnnotationReply({ replyId: 'reply-new' });
    vi.mocked(AnnotationApi.addReply).mockResolvedValue(reply);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useAnnotationActions('bd-scorecard', 'rec-001'),
      { wrapper }
    );

    await act(async () => {
      const r = await result.current.addReply({ annotationId: 'ann-001', body: 'Reply' });
      expect(r.replyId).toBe('reply-new');
    });

    expect(AnnotationApi.addReply).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  it('resolveAnnotation calls AnnotationApi.resolve and invalidates cache', async () => {
    const resolved = createMockAnnotation({ status: 'resolved' });
    vi.mocked(AnnotationApi.resolve).mockResolvedValue(resolved);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useAnnotationActions('bd-scorecard', 'rec-001'),
      { wrapper }
    );

    await act(async () => {
      const r = await result.current.resolveAnnotation({
        annotationId: 'ann-001',
        resolutionNote: 'Done.',
      });
      expect(r.status).toBe('resolved');
    });

    expect(AnnotationApi.resolve).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  it('withdrawAnnotation calls AnnotationApi.withdraw and invalidates cache', async () => {
    const withdrawn = createMockAnnotation({ status: 'withdrawn' });
    vi.mocked(AnnotationApi.withdraw).mockResolvedValue(withdrawn);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useAnnotationActions('bd-scorecard', 'rec-001'),
      { wrapper }
    );

    await act(async () => {
      const r = await result.current.withdrawAnnotation({ annotationId: 'ann-001' });
      expect(r.status).toBe('withdrawn');
    });

    expect(AnnotationApi.withdraw).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  it('exposes pending states during mutations', async () => {
    let resolveCreate!: (v: any) => void;
    const pending = new Promise((res) => { resolveCreate = res; });
    vi.mocked(AnnotationApi.create).mockReturnValue(pending as any);

    const { result } = renderHook(
      () => useAnnotationActions('bd-scorecard', 'rec-001'),
      { wrapper }
    );

    expect(result.current.isCreating).toBe(false);

    act(() => {
      result.current.createAnnotation({
        recordType: 'bd-scorecard',
        recordId: 'rec-001',
        fieldKey: 'gmp',
        fieldLabel: 'GMP',
        intent: 'comment',
        body: 'Test',
      }).catch(() => {});
    });

    await waitFor(() => {
      expect(result.current.isCreating).toBe(true);
    });

    await act(async () => {
      resolveCreate(createMockAnnotation());
    });

    await waitFor(() => {
      expect(result.current.isCreating).toBe(false);
    });
  });
});
