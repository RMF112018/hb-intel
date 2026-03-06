import type { ReactNode } from 'react';

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
}

/**
 * Action model used by tests and downstream wrappers to verify CTA behavior.
 */
export interface AccessDeniedActionModel {
  showGoHome: boolean;
  showGoBack: boolean;
  showRequestAccess: boolean;
}

/**
 * Build deterministic action visibility for structured access-denied UX.
 */
export function buildAccessDeniedActionModel(
  props: Pick<AccessDeniedProps, 'onGoHome' | 'onGoBack' | 'onRequestAccess'>,
): AccessDeniedActionModel {
  return {
    showGoHome: typeof props.onGoHome === 'function',
    showGoBack: typeof props.onGoBack === 'function',
    showRequestAccess: typeof props.onRequestAccess === 'function',
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
}: AccessDeniedProps): ReactNode {
  const model = buildAccessDeniedActionModel({ onGoHome, onGoBack, onRequestAccess });

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
      </div>
    </section>
  );
}
