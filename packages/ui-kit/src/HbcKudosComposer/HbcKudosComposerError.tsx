/**
 * HbcKudosComposerError — Inline error banner for submission failures.
 */
import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './styles/error.module.css';
import { kudosComposerCSSVars } from './tokens.js';
import type { HbcKudosComposerErrorProps } from './types.js';

export function HbcKudosComposerError({
  title = 'Submission failed',
  body,
}: HbcKudosComposerErrorProps): React.JSX.Element {
  return (
    <div role="alert" className={styles.errorBanner} style={kudosComposerCSSVars()}>
      <span className={styles.errorBannerIcon} aria-hidden="true">
        <AlertCircle size={14} strokeWidth={2.5} />
      </span>
      <div className={styles.errorBannerBody}>
        <div className={styles.errorBannerTitle}>{title}</div>
        <div className={styles.errorBannerMessage}>{body}</div>
      </div>
    </div>
  );
}
