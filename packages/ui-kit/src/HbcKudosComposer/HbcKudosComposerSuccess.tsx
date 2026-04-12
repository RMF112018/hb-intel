/**
 * HbcKudosComposerSuccess — Post-submit confirmation pane with
 * celebratory gradient icon, matching the surface register.
 */
import * as React from 'react';
import { CheckCircle2 } from 'lucide-react';
import styles from './styles/success.module.css';
import { kudosComposerCSSVars } from './tokens.js';
import type { HbcKudosComposerSuccessProps } from './types.js';

export function HbcKudosComposerSuccess({
  title = 'Kudos sent!',
  body = 'Your recognition has been submitted for review. It will appear on the homepage once approved.',
}: HbcKudosComposerSuccessProps): React.JSX.Element {
  return (
    <div className={styles.successPane} style={kudosComposerCSSVars()}>
      <div className={styles.successIcon} aria-hidden="true">
        <CheckCircle2 size={30} strokeWidth={2.2} />
      </div>
      <div className={styles.successTitle}>{title}</div>
      <p className={styles.successBody}>{body}</p>
    </div>
  );
}
