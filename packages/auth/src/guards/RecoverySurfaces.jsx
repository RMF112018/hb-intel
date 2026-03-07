/**
 * Dedicated shell surface for bootstrap/loading state.
 */
export function ShellBootstrapSurface({ onRetry }) {
    return (<section aria-live="polite" data-hbc-auth-surface="bootstrap">
      <h1>Loading HB Intel</h1>
      <p>We are preparing your session and validating access prerequisites.</p>
      {onRetry ? <button onClick={onRetry}>Retry startup</button> : null}
    </section>);
}
/**
 * Dedicated shell surface for active session restoration.
 */
export function SessionRestoreSurface({ onRetry }) {
    return (<section aria-live="polite" data-hbc-auth-surface="restore">
      <h1>Restoring your session</h1>
      <p>We are safely restoring your previous destination and permissions.</p>
      {onRetry ? <button onClick={onRetry}>Retry restore</button> : null}
    </section>);
}
/**
 * Dedicated shell surface for reauthentication-required outcomes.
 */
export function ExpiredSessionSurface({ onSignInAgain }) {
    return (<section aria-live="assertive" data-hbc-auth-surface="reauth-required">
      <h1>Session expired</h1>
      <p>Please sign in again to continue to protected content.</p>
      {onSignInAgain ? <button onClick={onSignInAgain}>Sign in again</button> : null}
    </section>);
}
/**
 * Dedicated shell surface for unsupported runtime/environment requirements.
 */
export function UnsupportedRuntimeSurface({ onRetry }) {
    return (<section aria-live="assertive" data-hbc-auth-surface="unsupported-runtime">
      <h1>Unsupported environment</h1>
      <p>This feature is not available in the current runtime context.</p>
      {onRetry ? <button onClick={onRetry}>Retry</button> : null}
    </section>);
}
/**
 * Dedicated shell surface for fatal startup failures.
 */
export function FatalStartupSurface({ onRetry }) {
    return (<section aria-live="assertive" data-hbc-auth-surface="fatal-startup">
      <h1>Startup failed</h1>
      <p>HB Intel could not complete startup. Retry to restore access.</p>
      {onRetry ? <button onClick={onRetry}>Retry startup</button> : null}
    </section>);
}
//# sourceMappingURL=RecoverySurfaces.jsx.map