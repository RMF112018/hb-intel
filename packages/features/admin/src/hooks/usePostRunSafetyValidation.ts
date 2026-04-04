/**
 * Phase 11 — Post-run validation and recovery guidance hook.
 *
 * Manages the post-execution safety layer: fetches validation results,
 * fetches recovery guidance on failure, and assembles evidence summary.
 *
 * @module features-admin/hooks
 */

import { useCallback, useState } from 'react';
import type {
  AdminActionKey,
  IAdminPostRunValidationSummary,
  IAdminRecoveryGuidance,
  IAdminSafetyEvidenceSummary,
} from '@hbc/models/admin-control-plane';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface UsePostRunSafetyValidationConfig {
  /** Base URL of the backend API */
  readonly apiBaseUrl: string;
  /** Function to get an auth token */
  readonly getToken: () => Promise<string>;
}

export interface UsePostRunSafetyValidationResult {
  /** Post-run validation summary (null if not yet requested) */
  readonly validation: IAdminPostRunValidationSummary | null;
  /** Recovery guidance (null if not yet requested or not needed) */
  readonly recoveryGuidance: IAdminRecoveryGuidance | null;
  /** Safety evidence summary (null if not yet assembled) */
  readonly evidenceSummary: IAdminSafetyEvidenceSummary | null;
  /** Whether a request is in progress */
  readonly isLoading: boolean;
  /** Error from the last request */
  readonly error: string | null;
  /** Whether all validation checks passed */
  readonly allPassed: boolean;
  /** Request post-run validation for a completed action */
  readonly requestValidation: (request: PostRunValidationRequest) => Promise<IAdminPostRunValidationSummary | null>;
  /** Request recovery guidance for a failed action */
  readonly requestRecoveryGuidance: (request: RecoveryGuidanceRequest) => Promise<IAdminRecoveryGuidance | null>;
  /** Request evidence summary assembly */
  readonly requestEvidenceSummary: (request: EvidenceSummaryRequest) => Promise<IAdminSafetyEvidenceSummary | null>;
  /** Reset all state */
  readonly reset: () => void;
}

export interface PostRunValidationRequest {
  readonly actionKey: AdminActionKey;
  readonly runId: string;
  readonly commandInput: Record<string, unknown>;
  readonly targetEntityId?: string;
}

export interface RecoveryGuidanceRequest {
  readonly actionKey: AdminActionKey;
  readonly runId: string;
  readonly failureClass: string;
  readonly commandInput: Record<string, unknown>;
  readonly targetEntityId?: string;
}

export interface EvidenceSummaryRequest {
  readonly runId: string;
  readonly actionKey: AdminActionKey;
  readonly previewEvidenceId?: string | null;
  readonly confirmationEvidenceId?: string | null;
  readonly validationEvidenceId?: string | null;
  readonly recoveryEvidenceId?: string | null;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Hook for managing post-run validation, recovery guidance, and evidence summary.
 *
 * Usage:
 * ```tsx
 * const { requestValidation, validation, allPassed, requestRecoveryGuidance } =
 *   usePostRunSafetyValidation({ apiBaseUrl, getToken });
 *
 * // After action completes:
 * const result = await requestValidation({ actionKey, runId, commandInput });
 * if (!allPassed) {
 *   await requestRecoveryGuidance({ actionKey, runId, failureClass: 'validation-failure', commandInput });
 * }
 * ```
 */
export function usePostRunSafetyValidation(
  config: UsePostRunSafetyValidationConfig,
): UsePostRunSafetyValidationResult {
  const [validation, setValidation] = useState<IAdminPostRunValidationSummary | null>(null);
  const [recoveryGuidance, setRecoveryGuidance] = useState<IAdminRecoveryGuidance | null>(null);
  const [evidenceSummary, setEvidenceSummary] = useState<IAdminSafetyEvidenceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = useCallback(
    async <T>(endpoint: string, body: unknown): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await config.getToken();
        const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          const errorBody = (await response.json()) as { message?: string };
          throw new Error(errorBody.message ?? `Request failed: ${response.status}`);
        }
        const result = (await response.json()) as { data: T };
        return result.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Request failed');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [config],
  );

  const requestValidation = useCallback(
    async (request: PostRunValidationRequest): Promise<IAdminPostRunValidationSummary | null> => {
      const result = await callApi<{ summary: IAdminPostRunValidationSummary }>(
        '/api/admin/safety/validate',
        request,
      );
      if (result) {
        setValidation(result.summary);
      }
      return result?.summary ?? null;
    },
    [callApi],
  );

  const requestRecoveryGuidance = useCallback(
    async (request: RecoveryGuidanceRequest): Promise<IAdminRecoveryGuidance | null> => {
      const result = await callApi<{ guidance: IAdminRecoveryGuidance }>(
        '/api/admin/safety/recover',
        request,
      );
      if (result) {
        setRecoveryGuidance(result.guidance);
      }
      return result?.guidance ?? null;
    },
    [callApi],
  );

  const requestEvidenceSummary = useCallback(
    async (request: EvidenceSummaryRequest): Promise<IAdminSafetyEvidenceSummary | null> => {
      const result = await callApi<IAdminSafetyEvidenceSummary>(
        '/api/admin/safety/evidence-summary',
        request,
      );
      if (result) {
        setEvidenceSummary(result);
      }
      return result;
    },
    [callApi],
  );

  const reset = useCallback(() => {
    setValidation(null);
    setRecoveryGuidance(null);
    setEvidenceSummary(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const allPassed = validation?.checks.every(c => c.passed) ?? false;

  return {
    validation,
    recoveryGuidance,
    evidenceSummary,
    isLoading,
    error,
    allPassed,
    requestValidation,
    requestRecoveryGuidance,
    requestEvidenceSummary,
    reset,
  };
}
