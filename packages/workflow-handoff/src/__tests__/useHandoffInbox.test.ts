import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHandoffInbox } from '../hooks/useHandoffInbox';
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
  vi.mocked(HandoffApi.inbox).mockReset();
});

describe('useHandoffInbox', () => {
  it('returns empty pending array initially', async () => {
    vi.mocked(HandoffApi.inbox).mockResolvedValueOnce([]);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useHandoffInbox(), { wrapper });

    await waitFor(() => {
      expect(result.current.pending).toEqual([]);
      expect(result.current.pendingCount).toBe(0);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('returns populated pending array with correct count', async () => {
    const packages = [
      createMockHandoffPackage({ status: 'sent' }),
      createMockHandoffPackage({ status: 'received' }),
    ];
    vi.mocked(HandoffApi.inbox).mockResolvedValueOnce(packages);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useHandoffInbox(), { wrapper });

    await waitFor(() => {
      expect(result.current.pending).toHaveLength(2);
      expect(result.current.pendingCount).toBe(2);
    });
  });

  it('shows isLoading=true while fetching', () => {
    vi.mocked(HandoffApi.inbox).mockReturnValueOnce(new Promise(() => {})); // never resolves

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useHandoffInbox(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('sets isError when fetch fails', async () => {
    vi.mocked(HandoffApi.inbox).mockRejectedValueOnce(new Error('Network error'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useHandoffInbox(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('does not fetch when disabled', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useHandoffInbox(false), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.pending).toEqual([]);
    expect(HandoffApi.inbox).not.toHaveBeenCalled();
  });

  it('provides refetch function', async () => {
    vi.mocked(HandoffApi.inbox).mockResolvedValue([]);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useHandoffInbox(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});
