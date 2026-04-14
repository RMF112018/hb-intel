/**
 * StatusBanner — governed last-action status surface for the
 * Article Publisher. Workstream-h step-04.
 *
 * Renders a tinted banner with the correct ARIA politeness for the
 * tone: errors use role="alert" (assertive), success/info use
 * aria-live="polite". Replaces the previous undifferentiated
 * aria-live polite treatment that left error feedback silently
 * underweight.
 *
 * Three tones:
 *   - info     — work in flight, lifecycle transitions ("Saving…")
 *   - success  — closed-lifecycle confirmations ("Published.")
 *   - error    — anything that didn't complete
 */

import * as React from 'react';
import styles from './statusBanner.module.css';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- side-effect import to inject :root tokens
import tokens from './tokens.module.css';
void tokens;

export type StatusBannerTone = 'info' | 'success' | 'error';

export interface StatusBannerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'ref' | 'role' | 'aria-live'> {
  readonly tone?: StatusBannerTone;
  readonly busy?: boolean;
}

export const StatusBanner = React.forwardRef<HTMLDivElement, StatusBannerProps>(
  function StatusBanner(
    { tone = 'info', busy = false, className, children, ...rest },
    ref,
  ) {
    const toneClass =
      tone === 'error'
        ? styles.error
        : tone === 'success'
          ? styles.success
          : styles.info;
    const cls = [styles.base, toneClass, className].filter(Boolean).join(' ');
    const role = tone === 'error' ? 'alert' : 'status';
    const ariaLive = tone === 'error' ? 'assertive' : 'polite';
    return (
      <div
        ref={ref}
        className={cls}
        role={role}
        aria-live={ariaLive}
        aria-busy={busy || undefined}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
