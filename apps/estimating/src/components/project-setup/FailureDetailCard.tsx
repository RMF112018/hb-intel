import type { ReactNode } from 'react';
import { HbcComplexityGate } from '@hbc/complexity';
import type { IProvisioningStatus } from '@hbc/models';
import { HbcCard, HbcStatusBadge, HbcTypography } from '@hbc/ui-kit';
import { HBC_SPACE_SM, HBC_SPACE_XS } from '@hbc/ui-kit/theme';
import {
  FAILURE_CLASS_BADGE_VARIANT,
  FAILURE_CLASS_LABELS,
  getFailedStep,
} from '../../utils/failureClassification.js';

/**
 * W0-G4-T02: Coordinator-tier failure detail card.
 * Displays failed step info, failure classification badge, error message, and retry metadata.
 * Entire component gated to standard tier (coordinator).
 */
export function FailureDetailCard({ status }: { status: IProvisioningStatus }): ReactNode {
  const failedStep = getFailedStep(status);

  return (
    <HbcComplexityGate minTier="standard">
      <HbcCard>
        <HbcTypography intent="heading3">Failure Detail</HbcTypography>

        {failedStep && (
          <p>
            <strong>Failed Step:</strong> Step {failedStep.stepNumber} — {failedStep.stepName}
          </p>
        )}

        {status.failureClass ? (
          <p>
            <strong>Classification:</strong>{' '}
            <HbcStatusBadge
              variant={FAILURE_CLASS_BADGE_VARIANT[status.failureClass]}
              label={FAILURE_CLASS_LABELS[status.failureClass]}
              size="small"
            />
          </p>
        ) : (
          <p>
            <strong>Classification:</strong> Pending
          </p>
        )}

        {failedStep?.errorMessage && (
          <p>
            <strong>Error:</strong> {failedStep.errorMessage}
          </p>
        )}

        <p>
          <strong>Retry Count:</strong> {status.retryCount}
        </p>

        {status.lastRetryAt && (
          <p>
            <strong>Last Retry:</strong> {new Date(status.lastRetryAt).toLocaleString()}
          </p>
        )}

        <HbcComplexityGate minTier="expert">
          {failedStep?.metadata && (
            <div>
              <HbcTypography intent="label">Raw Step Metadata</HbcTypography>
              <pre style={{ fontFamily: 'monospace', fontSize: `${HBC_SPACE_SM + HBC_SPACE_XS}px`, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(failedStep.metadata, null, 2)}
              </pre>
            </div>
          )}
        </HbcComplexityGate>
      </HbcCard>
    </HbcComplexityGate>
  );
}
