import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { HbcComplexityGate } from '@hbc/complexity';
import type { IProvisioningStatus } from '@hbc/models';
import { createProvisioningApiClient } from '@hbc/provisioning';
import { HbcBanner, HbcButton } from '@hbc/ui-kit';
import { getAdminAppUrl } from '../../utils/crossAppUrls.js';
import {
  FAILURE_CLASS_DESCRIPTIONS,
  canCoordinatorRetry,
} from '../../utils/failureClassification.js';
import { resolveSessionToken } from '../../utils/resolveSessionToken.js';

export interface RetrySectionProps {
  status: IProvisioningStatus;
  projectId: string;
  onRetryComplete: () => void;
}

/**
 * W0-G4-T02: Coordinator-tier retry/escalation section.
 * Three rendering paths per spec §8.3–8.4:
 * 1. Retryable transient failure → retry button
 * 2. Non-retryable with defined failureClass → admin escalation banner
 * 3. failureClass undefined → renders nothing (spec R1)
 */
export function RetrySection({ status, projectId, onRetryComplete }: RetrySectionProps): ReactNode {
  const session = useCurrentSession();
  const authToken = useMemo(() => resolveSessionToken(session), [session]);
  const client = useMemo(
    () => createProvisioningApiClient(import.meta.env.VITE_FUNCTION_APP_URL, async () => authToken),
    [authToken],
  );

  const [loading, setLoading] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const adminUrl = useMemo(() => getAdminAppUrl(), []);

  const handleRetry = useCallback(async () => {
    setLoading(true);
    setRetryError(null);
    try {
      await client.retryProvisioning(projectId);
      onRetryComplete();
    } catch {
      setRetryError('Retry failed. If the issue persists, contact Admin.');
    } finally {
      setLoading(false);
    }
  }, [client, projectId, onRetryComplete]);

  const handleEscalate = useCallback(async () => {
    setLoading(true);
    try {
      const escalatedBy = session?.providerIdentityRef ?? 'unknown';
      await client.escalateProvisioning(projectId, escalatedBy);
      onRetryComplete();
    } catch {
      setRetryError('Escalation failed. Please contact Admin directly.');
    } finally {
      setLoading(false);
    }
  }, [client, projectId, session, onRetryComplete]);

  // Path 3: failureClass undefined → render nothing (spec R1)
  if (status.failureClass === undefined) return null;

  return (
    <HbcComplexityGate minTier="standard">
      {canCoordinatorRetry(status) ? (
        // Path 1: Retryable transient failure
        <div>
          <HbcButton variant="primary" onClick={handleRetry} loading={loading} disabled={loading}>
            Retry Provisioning
          </HbcButton>
          {retryError && <HbcBanner variant="error">{retryError}</HbcBanner>}
        </div>
      ) : (
        // Path 2: Non-retryable with defined failureClass → admin escalation
        <HbcBanner variant="warning">
          <p>
            <strong>This failure requires Admin recovery.</strong>
          </p>
          <p>{FAILURE_CLASS_DESCRIPTIONS[status.failureClass]}</p>
          <HbcButton variant="secondary" onClick={handleEscalate} loading={loading} disabled={loading}>
            Escalate to Admin
          </HbcButton>
          {adminUrl && (
            <HbcButton
              variant="secondary"
              onClick={() => window.open(
                `${adminUrl}/provisioning-oversight?projectId=${projectId}`,
                '_blank',
              )}
              disabled={loading}
            >
              Open Admin Recovery
            </HbcButton>
          )}
        </HbcBanner>
      )}
    </HbcComplexityGate>
  );
}
