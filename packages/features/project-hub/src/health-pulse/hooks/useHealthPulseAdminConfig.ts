import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  validateHealthPulseAdminConfig,
  type IHealthPulseConfigValidationIssue,
} from '../governance/index.js';
import type { IHealthPulseAdminConfig } from '../types/index.js';
import { HEALTH_PULSE_ADMIN_CONFIG_QUERY_KEY, HEALTH_PULSE_QUERY_KEY_ROOT } from './queryKeys.js';
import {
  getHealthPulseAdminConfigStoreSnapshot,
  setHealthPulseAdminConfigStoreSnapshot,
} from './stateStore.js';

export interface IHealthPulseAdminConfigValidationIssue {
  path: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface IUseHealthPulseAdminConfigResult {
  config: IHealthPulseAdminConfig | null;
  draft: IHealthPulseAdminConfig | null;
  isLoading: boolean;
  isSaving: boolean;
  isValid: boolean;
  error: Error | null;
  validationIssues: IHealthPulseAdminConfigValidationIssue[];
  save: (nextConfig: IHealthPulseAdminConfig) => Promise<void>;
  reset: () => void;
  refresh: () => Promise<void>;
}

export interface IUseHealthPulseAdminConfigInput {
  initialConfig: IHealthPulseAdminConfig;
}

const mapValidationIssues = (
  issues: IHealthPulseConfigValidationIssue[]
): IHealthPulseAdminConfigValidationIssue[] => issues;

const getError = (error: unknown): Error | null => {
  if (!error) return null;
  return error instanceof Error ? error : new Error(String(error));
};

export const useHealthPulseAdminConfig = (
  input: IUseHealthPulseAdminConfigInput
): IUseHealthPulseAdminConfigResult => {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<IHealthPulseAdminConfig | null>(null);

  const query = useQuery({
    queryKey: [...HEALTH_PULSE_ADMIN_CONFIG_QUERY_KEY],
    queryFn: async () => {
      const stored = getHealthPulseAdminConfigStoreSnapshot();
      if (stored) {
        return stored;
      }

      return setHealthPulseAdminConfigStoreSnapshot(input.initialConfig);
    },
  });

  useEffect(() => {
    if (query.data) {
      setDraft(query.data);
    }
  }, [query.data]);

  const validation = useMemo(() => {
    if (!draft) {
      return {
        isValid: false,
        issues: [
          {
            path: 'config',
            message: 'Health pulse admin config is unavailable.',
            severity: 'error' as const,
          },
        ],
      };
    }

    return validateHealthPulseAdminConfig(draft);
  }, [draft]);

  const mutation = useMutation({
    mutationFn: async (nextConfig: IHealthPulseAdminConfig) => {
      const validationResult = validateHealthPulseAdminConfig(nextConfig);
      if (!validationResult.isValid) {
        throw new Error('Cannot save invalid health pulse admin config.');
      }

      return setHealthPulseAdminConfigStoreSnapshot(nextConfig);
    },
    onSuccess: async (savedConfig) => {
      setDraft(savedConfig);
      await queryClient.invalidateQueries({
        queryKey: [...HEALTH_PULSE_QUERY_KEY_ROOT],
      });
      await queryClient.invalidateQueries({
        queryKey: [...HEALTH_PULSE_ADMIN_CONFIG_QUERY_KEY],
      });
    },
  });

  const save = useCallback(
    async (nextConfig: IHealthPulseAdminConfig): Promise<void> => {
      await mutation.mutateAsync(nextConfig);
    },
    [mutation]
  );

  const reset = useCallback((): void => {
    setDraft(query.data ?? getHealthPulseAdminConfigStoreSnapshot());
  }, [query.data]);

  const refresh = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: [...HEALTH_PULSE_ADMIN_CONFIG_QUERY_KEY],
    });
  }, [queryClient]);

  return {
    config: query.data ?? null,
    draft,
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    isValid: validation.isValid,
    error: getError(query.error) ?? getError(mutation.error),
    validationIssues: mapValidationIssues(validation.issues),
    save,
    reset,
    refresh,
  };
};
