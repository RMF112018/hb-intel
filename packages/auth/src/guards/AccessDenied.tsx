import type { ReactNode } from 'react';
import { useState } from 'react';
import type { AccessRequestSubmitter, RequestAccessSubmission } from './requestAccess.js';

/**
 * UI contract for structured access-denied responses.
 */
export interface AccessDeniedProps {
  title?: string;
  message?: string;
  onGoHome?: (() => void) | null;
  onGoBack?: (() => void) | null;
  onRequestAccess?: (() => void) | null;
  homeLabel?: string;
  backLabel?: string;
  requestAccessLabel?: string;
  onSubmitAccessRequest?: AccessRequestSubmitter;
  requestAccessSeed?: Omit<RequestAccessSubmission, 'requestedAt'>;
}

/**
 * Action model used by tests and downstream wrappers to verify CTA behavior.
 */
export interface AccessDeniedActionModel {
  showGoHome: boolean;
  showGoBack: boolean;
  showRequestAccess: boolean;
  showSubmitRequestAccess: boolean;
}

/**
 * Build deterministic action visibility for structured access-denied UX.
 */
export function buildAccessDeniedActionModel(
  props: Pick<
    AccessDeniedProps,
    'onGoHome' | 'onGoBack' | 'onRequestAccess' | 'onSubmitAccessRequest'
  >,
): AccessDeniedActionModel {
  return {
    showGoHome: typeof props.onGoHome === 'function',
    showGoBack: typeof props.onGoBack === 'function',
    showRequestAccess: typeof props.onRequestAccess === 'function',
    showSubmitRequestAccess: typeof props.onSubmitAccessRequest === 'function',
  };
}

/**
 * Structured access-denied experience required by Phase 5.4.
 *
 * Alignment notes:
 * - Plain-language explanation
 * - Safe navigation options
 * - Optional request-access entry point
 */
export function AccessDenied({
  title = 'Access denied',
  message = 'You do not currently have permission to access this page.',
  onGoHome = null,
  onGoBack = null,
  onRequestAccess = null,
  homeLabel = 'Go to Project Hub',
  backLabel = 'Go back',
  requestAccessLabel = 'Request access',
  onSubmitAccessRequest,
  requestAccessSeed,
}: AccessDeniedProps): ReactNode {
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const model = buildAccessDeniedActionModel({
    onGoHome,
    onGoBack,
    onRequestAccess,
    onSubmitAccessRequest,
  });

  const submitAccessRequest = async (): Promise<void> => {
    if (!onSubmitAccessRequest || !requestAccessSeed || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmitAccessRequest({
        ...requestAccessSeed,
        requestedAt: new Date().toISOString(),
      });
      setSubmissionMessage(
        result.success
          ? result.message ?? 'Your request was submitted to the admin review queue.'
          : result.message ?? 'Request submission failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section aria-live="polite" aria-label="Access denied">
      <h1>{title}</h1>
      <p>{message}</p>
      <div>
        {model.showGoHome ? <button onClick={onGoHome ?? undefined}>{homeLabel}</button> : null}
        {model.showGoBack ? <button onClick={onGoBack ?? undefined}>{backLabel}</button> : null}
        {model.showRequestAccess ? (
          <button onClick={onRequestAccess ?? undefined}>{requestAccessLabel}</button>
        ) : null}
        {model.showSubmitRequestAccess ? (
          <button onClick={() => void submitAccessRequest()} disabled={submitting}>
            {submitting ? 'Submitting access request...' : 'Submit access request'}
          </button>
        ) : null}
      </div>
      {submissionMessage ? <p>{submissionMessage}</p> : null}
    </section>
  );
}
