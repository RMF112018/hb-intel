/**
 * Phase 11 — Safety preview integration hook.
 *
 * Provides a React hook for consuming safety preview/dry-run results
 * from the backend. This is the frontend integration seam that admin
 * pages use to request and display preview results before executing
 * risky actions.
 *
 * @module features-admin/hooks
 */

import { useCallback, useState } from 'react';
import type {
  AdminActionKey,
  IAdminSafetyPreviewResult,
  IAdminSafetyProfile,
  AdminConfirmationType,
} from '@hbc/models/admin-control-plane';

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Configuration for the safety preview hook. */
export interface UseActionSafetyPreviewConfig {
  /** Base URL of the backend API (e.g., functionAppUrl) */
  readonly apiBaseUrl: string;
  /** Function to get an auth token for API calls */
  readonly getToken: () => Promise<string>;
}

/** State returned by the safety preview hook. */
export interface UseActionSafetyPreviewResult {
  /** Current preview result (null if no preview has been requested) */
  readonly preview: IAdminSafetyPreviewResult | null;
  /** Whether a preview request is in progress */
  readonly isLoading: boolean;
  /** Error from the last preview request (null if none) */
  readonly error: string | null;
  /** Evidence ID from the captured preview (for linking to confirmation) */
  readonly previewEvidenceId: string | null;
  /** Request a preview for an action */
  readonly requestPreview: (request: SafetyPreviewRequest) => Promise<IAdminSafetyPreviewResult | null>;
  /** Clear the current preview state */
  readonly clearPreview: () => void;
  /** Whether the preview recommends proceeding */
  readonly proceedRecommended: boolean;
  /** Convenience: number of critical warnings */
  readonly criticalWarningCount: number;
  /** Convenience: number of irreversible impact items */
  readonly irreversibleItemCount: number;
}

/** Request to initiate a safety preview. */
export interface SafetyPreviewRequest {
  readonly actionKey: AdminActionKey;
  readonly commandInput: Record<string, unknown>;
  readonly targetEntityId?: string;
  readonly dryRun?: boolean;
}

/** Shape of the backend preview API response. */
interface PreviewApiResponse {
  readonly data: {
    readonly preview: IAdminSafetyPreviewResult;
    readonly evidenceId: string;
  };
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Hook for requesting and consuming safety preview results.
 *
 * Usage:
 * ```tsx
 * const { preview, isLoading, requestPreview, proceedRecommended } =
 *   useActionSafetyPreview({ apiBaseUrl, getToken });
 *
 * const handlePreview = async () => {
 *   await requestPreview({
 *     actionKey: 'provisioning-rollout:saga:force-state-transition',
 *     commandInput: { runId: '...' },
 *     targetEntityId: 'project-123',
 *   });
 * };
 * ```
 */
export function useActionSafetyPreview(
  config: UseActionSafetyPreviewConfig,
): UseActionSafetyPreviewResult {
  const [preview, setPreview] = useState<IAdminSafetyPreviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewEvidenceId, setPreviewEvidenceId] = useState<string | null>(null);

  const requestPreview = useCallback(
    async (request: SafetyPreviewRequest): Promise<IAdminSafetyPreviewResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const token = await config.getToken();
        const response = await fetch(
          `${config.apiBaseUrl}/api/admin/safety/preview`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              actionKey: request.actionKey,
              commandInput: request.commandInput,
              targetEntityId: request.targetEntityId ?? null,
              dryRun: request.dryRun ?? false,
            }),
          },
        );

        if (!response.ok) {
          const errorBody = (await response.json()) as { message?: string };
          throw new Error(errorBody.message ?? `Preview request failed: ${response.status}`);
        }

        const body = (await response.json()) as PreviewApiResponse;
        setPreview(body.data.preview);
        setPreviewEvidenceId(body.data.evidenceId);
        return body.data.preview;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Preview request failed';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [config],
  );

  const clearPreview = useCallback(() => {
    setPreview(null);
    setError(null);
    setPreviewEvidenceId(null);
  }, []);

  const proceedRecommended = preview?.proceedRecommended ?? false;
  const criticalWarningCount = preview?.warnings.filter(w => w.severity === 'critical').length ?? 0;
  const irreversibleItemCount = preview?.impactItems.filter(i => !i.reversible).length ?? 0;

  return {
    preview,
    isLoading,
    error,
    previewEvidenceId,
    requestPreview,
    clearPreview,
    proceedRecommended,
    criticalWarningCount,
    irreversibleItemCount,
  };
}

// ─── Utility: Determine Preview Requirements ───────────────────────────────────

/**
 * Determine whether an action requires preview before execution,
 * based on its safety profile.
 *
 * This utility can be used by pages to decide whether to show a
 * "Preview" button before an "Execute" button.
 */
export function isPreviewRequired(profile: IAdminSafetyProfile | null): boolean {
  if (!profile) return false;
  return profile.supportsPreview && profile.confirmationType !== 'none';
}

/**
 * Determine the appropriate confirmation type for an action.
 */
export function getConfirmationType(profile: IAdminSafetyProfile | null): AdminConfirmationType {
  return profile?.confirmationType ?? 'none';
}
