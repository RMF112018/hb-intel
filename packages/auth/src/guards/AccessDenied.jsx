import { useEffect, useRef, useState } from 'react';
import { recordStructuredAuditEvent } from '../audit/auditLogger.js';
/**
 * Build deterministic action visibility for structured access-denied UX.
 */
export function buildAccessDeniedActionModel(props) {
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
export function AccessDenied({ title = 'Access denied', message = 'You do not currently have permission to access this page.', onGoHome = null, onGoBack = null, onRequestAccess = null, homeLabel = 'Go to Project Hub', backLabel = 'Go back', requestAccessLabel = 'Request access', onSubmitAccessRequest, requestAccessSeed, }) {
    const [submissionMessage, setSubmissionMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const auditLogged = useRef(false);
    const model = buildAccessDeniedActionModel({
        onGoHome,
        onGoBack,
        onRequestAccess,
        onSubmitAccessRequest,
    });
    useEffect(() => {
        if (auditLogged.current) {
            return;
        }
        auditLogged.current = true;
        // PH5.13: access-denied visibility requires a dedicated trace event.
        recordStructuredAuditEvent({
            eventType: 'access-denied',
            actorId: 'unknown-user',
            subjectUserId: 'unknown-user',
            source: 'guard',
            action: requestAccessSeed?.targetPath,
            outcome: 'denied',
            details: {
                message,
                reason: requestAccessSeed?.reason,
            },
        });
    }, [message, requestAccessSeed]);
    const submitAccessRequest = async () => {
        if (!onSubmitAccessRequest || !requestAccessSeed || submitting) {
            return;
        }
        setSubmitting(true);
        try {
            const result = await onSubmitAccessRequest({
                ...requestAccessSeed,
                requestedAt: new Date().toISOString(),
            });
            recordStructuredAuditEvent({
                eventType: 'request-submitted',
                actorId: 'unknown-user',
                subjectUserId: 'unknown-user',
                source: 'guard',
                action: requestAccessSeed.targetPath,
                outcome: result.success ? 'pending' : 'failure',
                details: {
                    fromAccessDenied: true,
                    reason: requestAccessSeed.reason,
                    submissionMessage: result.message,
                },
            });
            setSubmissionMessage(result.success
                ? result.message ?? 'Your request was submitted to the admin review queue.'
                : result.message ?? 'Request submission failed. Please try again.');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (<section aria-live="polite" aria-label="Access denied">
      <h1>{title}</h1>
      <p>{message}</p>
      <div>
        {model.showGoHome ? <button onClick={onGoHome ?? undefined}>{homeLabel}</button> : null}
        {model.showGoBack ? <button onClick={onGoBack ?? undefined}>{backLabel}</button> : null}
        {model.showRequestAccess ? (<button onClick={onRequestAccess ?? undefined}>{requestAccessLabel}</button>) : null}
        {model.showSubmitRequestAccess ? (<button onClick={() => void submitAccessRequest()} disabled={submitting}>
            {submitting ? 'Submitting access request...' : 'Submit access request'}
          </button>) : null}
      </div>
      {submissionMessage ? <p>{submissionMessage}</p> : null}
    </section>);
}
//# sourceMappingURL=AccessDenied.jsx.map