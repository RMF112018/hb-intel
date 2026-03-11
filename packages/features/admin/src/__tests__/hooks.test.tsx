import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminAlerts } from '../hooks/useAdminAlerts.js';
import { useInfrastructureProbes } from '../hooks/useInfrastructureProbes.js';
import { useApprovalAuthority } from '../hooks/useApprovalAuthority.js';
// Mock factories available via @hbc/features-admin/testing

// Mock the API modules
vi.mock('../api/AdminAlertsApi.js', () => ({
  AdminAlertsApi: vi.fn().mockImplementation(() => ({
    listActive: vi.fn().mockResolvedValue([]),
    acknowledge: vi.fn().mockResolvedValue(undefined),
    listHistory: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock('../api/InfrastructureProbeApi.js', () => ({
  InfrastructureProbeApi: vi.fn().mockImplementation(() => ({
    getLatestSnapshot: vi.fn().mockResolvedValue(null),
    listSnapshots: vi.fn().mockResolvedValue([]),
    runNow: vi.fn().mockResolvedValue({ snapshotId: 'run-1', capturedAt: '2026-01-01T00:00:00.000Z', results: [] }),
  })),
}));

vi.mock('../api/ApprovalAuthorityApi.js', () => ({
  ApprovalAuthorityApi: vi.fn().mockImplementation(() => ({
    getRules: vi.fn().mockResolvedValue([]),
    upsertRule: vi.fn().mockResolvedValue({
      ruleId: 'rule-new',
      approvalContext: 'provisioning-task-completion',
      approverUserIds: ['user-001'],
      approverGroupIds: [],
      approvalMode: 'any',
      lastModifiedBy: 'system',
      lastModifiedAt: '2026-01-01T00:00:00.000Z',
    }),
    deleteRule: vi.fn().mockResolvedValue(undefined),
    testEligibility: vi.fn().mockResolvedValue({
      approvalContext: 'provisioning-task-completion',
      userId: 'user-001',
      eligible: true,
      matchedBy: 'direct-user',
    }),
  })),
}));

vi.mock('@hbc/auth', () => ({
  useCurrentUser: vi.fn(() => ({ id: 'current-user-001', displayName: 'Test User' })),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useAdminAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial loading state', () => {
    const { result } = renderHook(() => useAdminAlerts(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.alerts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('returns empty alerts after loading', async () => {
    const { result } = renderHook(() => useAdminAlerts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.alerts).toEqual([]);
    expect(result.current.badge.totalCount).toBe(0);
  });

  it('provides filteredAlerts callback', async () => {
    const { result } = renderHook(() => useAdminAlerts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const filtered = result.current.filteredAlerts('provisioning-failure');
    expect(filtered).toEqual([]);
  });

  it('provides badge with zero counts initially', async () => {
    const { result } = renderHook(() => useAdminAlerts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.badge).toEqual({
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      totalCount: 0,
    });
  });

  it('exposes acknowledge function', async () => {
    const { result } = renderHook(() => useAdminAlerts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.acknowledge).toBe('function');
  });

  it('exposes refresh function', async () => {
    const { result } = renderHook(() => useAdminAlerts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.refresh).toBe('function');
  });
});

describe('useInfrastructureProbes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial loading state', () => {
    const { result } = renderHook(() => useInfrastructureProbes(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.latestSnapshot).toBeNull();
  });

  it('returns null snapshot after loading with no data', async () => {
    const { result } = renderHook(() => useInfrastructureProbes(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.latestSnapshot).toBeNull();
    expect(result.current.probeStatusMap.size).toBe(0);
    expect(result.current.lastRunAt).toBeNull();
  });

  it('exposes refresh function', async () => {
    const { result } = renderHook(() => useInfrastructureProbes(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.refresh).toBe('function');
  });

  it('returns empty probeStatusMap when no snapshot', async () => {
    const { result } = renderHook(() => useInfrastructureProbes(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.probeStatusMap).toBeInstanceOf(Map);
    expect(result.current.probeStatusMap.size).toBe(0);
  });

  it('has null error initially', async () => {
    const { result } = renderHook(() => useInfrastructureProbes(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
  });
});

describe('useApprovalAuthority', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial loading state', () => {
    const { result } = renderHook(() => useApprovalAuthority(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.rules).toEqual([]);
  });

  it('returns empty rules after loading', async () => {
    const { result } = renderHook(() => useApprovalAuthority(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.rules).toEqual([]);
  });

  it('provides ruleByContext callback', async () => {
    const { result } = renderHook(() => useApprovalAuthority(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const rule = result.current.ruleByContext('provisioning-task-completion');
    expect(rule).toBeUndefined();
  });

  it('exposes upsertRule function', async () => {
    const { result } = renderHook(() => useApprovalAuthority(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.upsertRule).toBe('function');
  });

  it('exposes deleteRule function', async () => {
    const { result } = renderHook(() => useApprovalAuthority(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.deleteRule).toBe('function');
  });

  it('exposes testEligibility function', async () => {
    const { result } = renderHook(() => useApprovalAuthority(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.testEligibility).toBe('function');
  });

  it('has null error initially', async () => {
    const { result } = renderHook(() => useApprovalAuthority(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
  });
});
