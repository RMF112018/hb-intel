/**
 * KudosFlyoutBody — shared wrapper that gives every Kudos flyout body
 * (article reader, composer panel, view-all feed, companion detail)
 * one rhythm.
 *
 * ## Flyout interaction contract (Phase-23 Prompt 07)
 *
 * The shared `HbcKudosComposerFlyout` shell owns:
 *   - open / close state + ESC-to-close
 *   - focus trap during open
 *   - explicit trigger-focus restoration on close
 *   - scroll lock (host-aware, SPFx-compatible)
 *   - scroll-area overflow for long content
 *   - host-chrome safe-zone offset + safe-area-inset-bottom padding
 *   - motion choreography (reduced-motion aware)
 *   - primary/secondary action footer
 *
 * Consumers own:
 *   - `title` / `subtitle` for the gradient header
 *   - `primaryAction` / `secondaryAction` props for the shell footer
 *   - body content, wrapped in `KudosFlyoutBody` so padding, gap,
 *     reading-width, and token seam stay one system
 *   - semantic role via `as` prop when the body represents a landmark
 *     ("article" for the reader, "section" for governance detail,
 *     plain "div" for composer + feed)
 *
 * Every Kudos flyout body MUST wrap its content in this component —
 * the composer, feed, article reader, and companion detail panel
 * all compose through this one seam so future changes to flyout-body
 * rhythm flow through a single module.
 */
import * as React from 'react';
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
  const composed = className ? `${flyoutStyles.body} ${className}` : flyoutStyles.body;

  // `--hbk-*` custom properties cascade in from the `HbKudos` webpart
  // root via `kudosCSSVars()` — no inline style spreading needed here.
  const commonProps = {
    className: composed,
    'data-hbc-testid': testId,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  };

  if (as === 'article') return <article {...commonProps}>{children}</article>;
  if (as === 'section') return <section {...commonProps}>{children}</section>;
  return <div {...commonProps}>{children}</div>;
}

export { default as kudosFlyoutStyles } from './kudosFlyout.module.css';
