import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHandoffStatus } from '../hooks/useHandoffStatus';
import { HandoffApi } from '../api/HandoffApi';
import { createMockHandoffPackage } from '../../testing/createMockHandoffPackage';

vi.mock('../api/HandoffApi', () => ({
  HandoffApi: {
    create: vi.fn(),
    get: vi.fn(),
    inbox: vi.fn(),
    outbox: vi.fn(),
    send: vi.fn(),
    markReceived: vi.fn(),
    acknowledge: vi.fn(),
    reject: vi.fn(),
    updateContextNotes: vi.fn(),
  },
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: qc }, children),
    queryClient: qc,
  };
}

beforeEach(() => {
  vi.mocked(HandoffApi.get).mockReset();
});

describe('useHandoffStatus', () => {
  it('returns null status when handoffId is null', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useHandoffStatus(null), { wrapper });

    expect(result.current.status).toBeNull();
    expect(result.current.package).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches package and returns status when handoffId is provided', async () => {
    const pkg = createMockHandoffPackage({ status: 'sent' });
    vi.mocked(HandoffApi.get).mockResolvedValueOnce(pkg);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useHandoffStatus('hoff-001'), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe('sent');
      expect(result.current.package).not.toBeNull();
    });
  });

  it('returns acknowledged as terminal status (no polling)', async () => {
    const pkg = createMockHandoffPackage({ status: 'acknowledged' });
    vi.mocked(HandoffApi.get).mockResolvedValueOnce(pkg);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useHandoffStatus('hoff-001'), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe('acknowledged');
    });
  });

  it('returns rejected as terminal status', async () => {
    const pkg = createMockHandoffPackage({ status: 'rejected' });
    vi.mocked(HandoffApi.get).mockResolvedValueOnce(pkg);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useHandoffStatus('hoff-001'), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe('rejected');
    });
  });

  it('sets isError when fetch fails', async () => {
    vi.mocked(HandoffApi.get).mockRejectedValueOnce(new Error('Network error'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useHandoffStatus('hoff-001'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('provides refetch function', async () => {
    const pkg = createMockHandoffPackage({ status: 'sent' });
    vi.mocked(HandoffApi.get).mockResolvedValue(pkg);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useHandoffStatus('hoff-001'), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe('sent');
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('does not fetch when handoffId transitions from string to null', async () => {
    const pkg = createMockHandoffPackage({ status: 'sent' });
    vi.mocked(HandoffApi.get).mockResolvedValue(pkg);

    const { wrapper } = createWrapper();
    const { result, rerender } = renderHook(
      ({ id }: { id: string | null }) => useHandoffStatus(id),
      { wrapper, initialProps: { id: 'hoff-001' as string | null } }
    );

    await waitFor(() => {
      expect(result.current.status).toBe('sent');
    });

    rerender({ id: null });

    // After switching to null, should report null status
    expect(result.current.status).toBeNull();
  });
});
