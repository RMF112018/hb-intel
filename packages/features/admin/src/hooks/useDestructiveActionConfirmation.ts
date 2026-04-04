/**
 * Phase 11 — Destructive-action confirmation flow hook.
 *
 * Manages the full confirmation lifecycle for risky admin actions:
 * submit confirmation → validate → record evidence → return gate context.
 *
 * @module features-admin/hooks
 */

import { useCallback, useState } from 'react';
import type {
  AdminActionKey,
  IAdminSafetyProfile,
  IAdminConfirmationPayload,
  IAdminExecutionScope,
} from '@hbc/models/admin-control-plane';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface UseDestructiveActionConfirmationConfig {
  /** Base URL of the backend API */
  readonly apiBaseUrl: string;
  /** Function to get an auth token */
  readonly getToken: () => Promise<string>;
}

export interface UseDestructiveActionConfirmationResult {
  /** Whether the confirmation has been recorded */
  readonly confirmed: boolean;
  /** Whether a confirmation request is in progress */
  readonly isSubmitting: boolean;
  /** Error from the last confirmation attempt */
  readonly error: string | null;
  /** Validation errors from the backend */
  readonly validationErrors: readonly string[];
  /** Evidence ID of the recorded confirmation */
  readonly confirmationEvidenceId: string | null;
  /** Submit a confirmation for an action */
  readonly submitConfirmation: (request: ConfirmationRequest) => Promise<boolean>;
  /** Reset the confirmation state */
  readonly resetConfirmation: () => void;
  /** Build a safety gate context from the current state */
  readonly buildGateContext: (previewEvidenceId?: string | null) => SafetyGateContext;
}

export interface ConfirmationRequest {
  readonly actionKey: AdminActionKey;
  readonly operatorAcknowledgment: string;
  readonly previewEvidenceId?: string | null;
  readonly scope?: IAdminExecutionScope | null;
  readonly rationale?: { reason: string; externalReference?: string | null } | null;
}

/** Mirrors the backend ISafetyGateContext for building the execution request. */
export interface SafetyGateContext {
  readonly previewCompleted: boolean;
  readonly previewEvidenceId: string | null;
  readonly dryRunCompleted: boolean;
  readonly confirmationCaptured: boolean;
  readonly scopeDeclared: boolean;
}

/** Shape of the backend confirmation API response. */
interface ConfirmationApiResponse {
  readonly data: {
    readonly valid: boolean;
    readonly errors: readonly string[];
    readonly confirmationEvidenceId: string | null;
  };
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Hook for managing the destructive-action confirmation flow.
 *
 * Usage:
 * ```tsx
 * const { submitConfirmation, confirmed, confirmationEvidenceId, buildGateContext } =
 *   useDestructiveActionConfirmation({ apiBaseUrl, getToken });
 *
 * // After preview is done and user types acknowledgment:
 * const success = await submitConfirmation({
 *   actionKey: 'entra-control:user:delete',
 *   operatorAcknowledgment: 'DELETE',
 *   previewEvidenceId: 'ev-123',
 *   scope: executionScope,
 * });
 *
 * if (success) {
 *   // Build gate context for the execution request
 *   const gates = buildGateContext('ev-123');
 *   // gates.confirmationCaptured === true
 * }
 * ```
 */
export function useDestructiveActionConfirmation(
  config: UseDestructiveActionConfirmationConfig,
): UseDestructiveActionConfirmationResult {
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<readonly string[]>([]);
  const [confirmationEvidenceId, setConfirmationEvidenceId] = useState<string | null>(null);

  const submitConfirmation = useCallback(
    async (request: ConfirmationRequest): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);
      setValidationErrors([]);

      try {
        const token = await config.getToken();
        const response = await fetch(
          `${config.apiBaseUrl}/api/admin/safety/confirm`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              actionKey: request.actionKey,
              operatorAcknowledgment: request.operatorAcknowledgment,
              previewEvidenceId: request.previewEvidenceId ?? null,
              scopeDeclared: !!request.scope,
              rationale: request.rationale ?? null,
              scope: request.scope ?? null,
            }),
          },
        );

        if (!response.ok) {
          const errorBody = (await response.json()) as { message?: string; errors?: string[] };
          if (errorBody.errors) {
            setValidationErrors(errorBody.errors);
          }
          throw new Error(errorBody.message ?? `Confirmation failed: ${response.status}`);
        }

        const body = (await response.json()) as ConfirmationApiResponse;
        if (!body.data.valid) {
          setValidationErrors(body.data.errors);
          return false;
        }

        setConfirmed(true);
        setConfirmationEvidenceId(body.data.confirmationEvidenceId);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Confirmation failed';
        setError(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [config],
  );

  const resetConfirmation = useCallback(() => {
    setConfirmed(false);
    setIsSubmitting(false);
    setError(null);
    setValidationErrors([]);
    setConfirmationEvidenceId(null);
  }, []);

  const buildGateContext = useCallback(
    (previewEvidenceId?: string | null): SafetyGateContext => ({
      previewCompleted: !!previewEvidenceId,
      previewEvidenceId: previewEvidenceId ?? null,
      dryRunCompleted: false,
      confirmationCaptured: confirmed,
      scopeDeclared: confirmed, // confirmation includes scope declaration
    }),
    [confirmed],
  );

  return {
    confirmed,
    isSubmitting,
    error,
    validationErrors,
    confirmationEvidenceId,
    submitConfirmation,
    resetConfirmation,
    buildGateContext,
  };
}
