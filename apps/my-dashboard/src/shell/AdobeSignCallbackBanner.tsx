/**
 * Adobe Sign OAuth callback banner.
 *
 * Renders a small accessible status/alert region in the My Work shell
 * when the user has just been redirected back from the backend's
 * `/api/my-work/adobe-sign/oauth/callback`. Reads
 * `adobeSignAuthorization` from the URL via `useAdobeSignCallbackResult`,
 * which also cleans the parameter from the URL so a refresh doesn't
 * re-show the banner.
 *
 * Renders `null` when no marker is present.
 *
 * @module shell/AdobeSignCallbackBanner
 */

import { useAdobeSignCallbackResult } from '../runtime/useAdobeSignCallbackResult.js';

export function AdobeSignCallbackBanner(): JSX.Element | null {
  const result = useAdobeSignCallbackResult();
  if (!result) return null;
  const isSuccess = result.kind === 'success';
  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      aria-live={isSuccess ? 'polite' : 'assertive'}
      data-my-work-adobe-sign-callback={result.kind}
      data-my-work-adobe-sign-callback-status={result.backendStatus}
    >
      <p>{result.headline}</p>
      <p>{result.message}</p>
    </div>
  );
}

export default AdobeSignCallbackBanner;
