/**
 * KudosFlyoutBody — shared wrapper that gives every Kudos flyout body
 * (article reader, composer panel, view-all feed) one rhythm.
 *
 * Phase-20 Wave 3 cohesion: the three flyout surfaces previously owned
 * their own padding / gap / reading-width rules. This wrapper applies
 * the shared `.body` stanza from `kudosFlyout.module.css` and seeds
 * the `--hbk-flyout-*` custom properties from KUDOS_GOV_TOKENS so all
 * downstream classes (prose, section heading, meta row) resolve to
 * governed values without per-consumer duplication.
 */
import * as React from 'react';
import { KUDOS_GOV_TOKENS } from '../../homepage/shared/KudosGovernancePrimitives.js';
import flyoutStyles from './kudosFlyout.module.css';

export interface KudosFlyoutBodyProps {
  children: React.ReactNode;
  testId?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  as?: 'div' | 'article' | 'section';
  className?: string;
}

export function KudosFlyoutBody({
  children,
  testId,
  ariaLabel,
  ariaLabelledBy,
  as = 'div',
  className,
}: KudosFlyoutBodyProps): React.JSX.Element {
  const style = {
    '--hbk-flyout-border': KUDOS_GOV_TOKENS.orangeSubtle18,
    '--hbk-flyout-ink-primary': KUDOS_GOV_TOKENS.textPrimary,
    '--hbk-flyout-ink-secondary': KUDOS_GOV_TOKENS.textSecondary,
    '--hbk-flyout-ink-muted': KUDOS_GOV_TOKENS.textMuted,
    '--hbk-flyout-ink-faint': KUDOS_GOV_TOKENS.textFaint,
  } as React.CSSProperties;

  const composed = className ? `${flyoutStyles.body} ${className}` : flyoutStyles.body;

  const commonProps = {
    className: composed,
    style,
    'data-hbc-testid': testId,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  };

  if (as === 'article') return <article {...commonProps}>{children}</article>;
  if (as === 'section') return <section {...commonProps}>{children}</section>;
  return <div {...commonProps}>{children}</div>;
}

export { default as kudosFlyoutStyles } from './kudosFlyout.module.css';
