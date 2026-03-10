import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSeedHistory } from '../useSeedHistory';

// Mock SeedApi
vi.mock('../../api/SeedApi', () => ({
  SeedApi: {
    getHistory: vi.fn(),
  },
}));

const { SeedApi } = await vi.importMock<typeof import('../../api/SeedApi')>('../../api/SeedApi');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useSeedHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns history data on success', async () => {
    const mockHistory = [
      {
        importId: 'import-001',
        recordType: 'bd-lead',
        status: 'complete' as const,
        totalRows: 50,
        successCount: 50,
        errorCount: 0,
        importedAt: '2026-01-15T10:00:00Z',
        importedBy: 'user-001',
        importedByName: 'Test User',
        sourceDocumentId: 'doc-001',
        sourceDocumentUrl: 'https://sp.example.com/doc',
        sourceFileName: 'leads.xlsx',
      },
    ];
    SeedApi.getHistory.mockResolvedValue(mockHistory);

    const { result } = renderHook(() => useSeedHistory('bd-lead'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].importId).toBe('import-001');
    expect(result.current.error).toBeNull();
  });

  it('returns loading state initially', () => {
    SeedApi.getHistory.mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useSeedHistory('bd-lead'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.history).toHaveLength(0);
  });

  it('returns error state on failure', async () => {
    SeedApi.getHistory.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSeedHistory('bd-lead'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.history).toHaveLength(0);
  });

  it('provides a refetch function', async () => {
    SeedApi.getHistory.mockResolvedValue([]);

    const { result } = renderHook(() => useSeedHistory('bd-lead'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
    // Actually invoke refetch to cover the wrapper arrow function
    result.current.refetch();
    expect(SeedApi.getHistory).toHaveBeenCalledTimes(2);
  });
});
