import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  __resetHealthPulseAdminConfigStoreForTests,
  HEALTH_PULSE_ADMIN_CONFIG_QUERY_KEY,
  HEALTH_PULSE_QUERY_KEY_ROOT,
  getProjectHealthPulseQueryKey,
  setHealthPulseAdminConfigStoreSnapshot,
  useHealthPulseAdminConfig,
  useProjectHealthPulse,
} from '../hooks/index.js';
import type { IHealthMetric } from '../types/index.js';

const metric = (key: string, value: number): IHealthMetric => ({
  key,
  label: key,
  value,
  isStale: false,
  isManualEntry: false,
  lastUpdatedAt: '2026-03-10T00:00:00.000Z',
  weight: 'leading',
});

const config = {
  weights: { field: 0.4, time: 0.3, cost: 0.15, office: 0.15 },
  stalenessThresholdDays: 14,
  metricStalenessOverrides: {},
  manualEntryGovernance: {
    approvalRequiredMetricKeys: ['forecast-confidence'],
    maxManualInfluencePercent: 40,
    maxOverrideAgeDays: 14,
  },
  officeHealthSuppression: {
    lowImpactSuppressionEnabled: true,
    duplicateClusterWindowHours: 24,
    severityWeights: { minor: 1, major: 2, critical: 3 },
  },
  portfolioTriageDefaults: {
    defaultBucket: 'attention-now' as const,
    defaultSort: 'deterioration-velocity' as const,
  },
};

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('health pulse hooks orchestration', () => {
  beforeEach(() => {
    __resetHealthPulseAdminConfigStoreForTests();
  });

  it('uses exact query keys and composes deterministic pulse output', async () => {
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(
      () =>
        useProjectHealthPulse({
          projectId: 'p-hooks',
          adminConfig: config,
          now: () => new Date('2026-03-12T00:00:00.000Z'),
          metricsByDimension: {
            cost: [
              metric('forecast-confidence', 90),
              metric('forecast-update-age', 90),
              metric('pending-change-order-aging', 90),
            ],
            time: [
              metric('look-ahead-reliability', 90),
              metric('near-critical-path-volatility', 90),
              metric('schedule-update-quality', 90),
            ],
            field: [
              metric('production-throughput-reliability', 90),
              metric('rework-trend', 90),
              metric('plan-complete-reliability', 90),
            ],
            office: [
              metric('clustering', 90),
              metric('severity-weighted-overdue-signals', 90),
              metric('low-impact-suppression', 90),
            ],
          },
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.pulse?.projectId).toBe('p-hooks');
    });

    expect(result.current.derivation.evaluatedAt).toBe('2026-03-12T00:00:00.000Z');
    expect(queryClient.getQueryData(getProjectHealthPulseQueryKey('p-hooks'))).toBeTruthy();
    expect(queryClient.getQueryData(HEALTH_PULSE_ADMIN_CONFIG_QUERY_KEY)).toBeTruthy();

    await act(async () => {
      await result.current.refresh();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [...getProjectHealthPulseQueryKey('p-hooks')],
    });
  });

  it('loads admin config from the package-local store when already seeded', async () => {
    setHealthPulseAdminConfigStoreSnapshot(config);
    const queryClient = createQueryClient();
    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(
      () =>
        useProjectHealthPulse({
          projectId: 'p-hooks-store',
          now: () => new Date('2026-03-12T00:00:00.000Z'),
          metricsByDimension: {
            cost: [metric('forecast-confidence', 90)],
            time: [metric('look-ahead-reliability', 90)],
            field: [metric('production-throughput-reliability', 90)],
            office: [metric('clustering', 90)],
          },
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pulse?.projectId).toBe('p-hooks-store');
    });
  });

  it('keeps stable error shape when admin config is missing', async () => {
    const queryClient = createQueryClient();
    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(
      () =>
        useProjectHealthPulse({
          projectId: 'p-hooks-error',
          now: () => new Date('2026-03-12T00:00:00.000Z'),
          metricsByDimension: { cost: [], time: [], field: [], office: [] },
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.pulse).toBeNull();
    expect(result.current.telemetry).toBeNull();
    expect(result.current.derivation).toEqual({
      confidenceReasonCodes: [],
      governanceReasonCodes: [],
      hasManualInfluence: false,
      evaluatedAt: null,
    });
  });

  it('exposes stable config state and invalidates all pulse queries on successful save', async () => {
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => useHealthPulseAdminConfig({ initialConfig: config }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.config).toBeTruthy();
      expect(result.current.draft).toBeTruthy();
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.validationIssues.every((issue) => issue.path.length > 0)).toBe(true);

    await act(async () => {
      await result.current.save({
        ...config,
        stalenessThresholdDays: 21,
      });
    });

    expect(result.current.config?.stalenessThresholdDays).toBe(21);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [...HEALTH_PULSE_QUERY_KEY_ROOT],
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [...HEALTH_PULSE_ADMIN_CONFIG_QUERY_KEY],
    });
  });

  it('surfaces validation failures from invalid admin-config saves', async () => {
    const queryClient = createQueryClient();
    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => useHealthPulseAdminConfig({ initialConfig: config }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(
        result.current.save({
          ...config,
          weights: { field: 1, time: 1, cost: 1, office: 1 },
        })
      ).rejects.toThrow('Cannot save invalid health pulse admin config.');
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
    expect(result.current.error?.message ?? '').toContain(
      'Cannot save invalid health pulse admin config.'
    );
  });
});
