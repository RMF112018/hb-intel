import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { computeProjectHealthPulse, type IComputeProjectHealthPulseInput } from '../computors/index.js';
import type {
  IHealthPulseAdminConfig,
  IProjectHealthPulse,
  IProjectHealthTelemetry,
} from '../types/index.js';
import { HEALTH_PULSE_ADMIN_CONFIG_QUERY_KEY, getProjectHealthPulseQueryKey } from './queryKeys.js';
import {
  getHealthPulseAdminConfigStoreSnapshot,
  setHealthPulseAdminConfigStoreSnapshot,
} from './stateStore.js';

export interface IProjectHealthPulseDerivationMetadata {
  confidenceReasonCodes: string[];
  governanceReasonCodes: string[];
  hasManualInfluence: boolean;
  evaluatedAt: string | null;
}

export interface IUseProjectHealthPulseResult {
  pulse: IProjectHealthPulse | null;
  telemetry: IProjectHealthTelemetry | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  derivation: IProjectHealthPulseDerivationMetadata;
}

export interface IUseProjectHealthPulseInput
  extends Omit<IComputeProjectHealthPulseInput, 'computedAt' | 'adminConfig'> {
  adminConfig?: IHealthPulseAdminConfig;
  now?: () => Date;
}

const getError = (error: unknown): Error | null => {
  if (!error) return null;
  return error instanceof Error ? error : new Error(String(error));
};

const hasManualInfluence = (pulse: IProjectHealthPulse | null): boolean => {
  if (!pulse) return false;
  return (['cost', 'time', 'field', 'office'] as const).some((key) =>
    pulse.dimensions[key].metrics.some((metric) => metric.isManualEntry)
  );
};

const EMPTY_DERIVATION: IProjectHealthPulseDerivationMetadata = {
  confidenceReasonCodes: [],
  governanceReasonCodes: [],
  hasManualInfluence: false,
  evaluatedAt: null,
};

export const useProjectHealthPulse = (
  input: IUseProjectHealthPulseInput
): IUseProjectHealthPulseResult => {
  const now = input.now ?? (() => new Date());
  const queryClient = useQueryClient();

  const adminConfigQuery = useQuery({
    queryKey: [...HEALTH_PULSE_ADMIN_CONFIG_QUERY_KEY],
    queryFn: async () => {
      const stored = getHealthPulseAdminConfigStoreSnapshot();
      if (stored) {
        return stored;
      }

      if (input.adminConfig) {
        return setHealthPulseAdminConfigStoreSnapshot(input.adminConfig);
      }

      throw new Error(
        'Health pulse admin config is unavailable. Seed via useHealthPulseAdminConfig or hook input.'
      );
    },
  });

  const pulseQuery = useQuery({
    queryKey: [...getProjectHealthPulseQueryKey(input.projectId)],
    enabled: !!adminConfigQuery.data,
    queryFn: async () => {
      const config =
        getHealthPulseAdminConfigStoreSnapshot() ??
        (adminConfigQuery.data as IHealthPulseAdminConfig);

      return computeProjectHealthPulse({
        projectId: input.projectId,
        adminConfig: config,
        metricsByDimension: input.metricsByDimension,
        recommendationCandidates: input.recommendationCandidates,
        explainability: input.explainability,
        integrationCompleteness: input.integrationCompleteness,
        trendHistorySufficient: input.trendHistorySufficient,
        computedAt: now().toISOString(),
      });
    },
  });

  const refresh = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: [...getProjectHealthPulseQueryKey(input.projectId)],
    });
  }, [input.projectId, queryClient]);

  const pulse = pulseQuery.data?.pulse ?? null;
  const telemetry = pulseQuery.data?.telemetry ?? null;

  const derivation = useMemo<IProjectHealthPulseDerivationMetadata>(() => {
    if (!pulse) {
      return EMPTY_DERIVATION;
    }

    return {
      confidenceReasonCodes: pulse.overallConfidence.reasons,
      governanceReasonCodes: [],
      hasManualInfluence: hasManualInfluence(pulse),
      evaluatedAt: pulse.computedAt,
    };
  }, [pulse]);

  return {
    pulse,
    telemetry,
    isLoading: adminConfigQuery.isLoading || pulseQuery.isLoading,
    error: getError(adminConfigQuery.error) ?? getError(pulseQuery.error),
    refresh,
    derivation,
  };
};
