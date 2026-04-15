/**
 * ExceptionalNotice — compact alert primitive for legacy / operator
 * / unsupported-state narration that must remain accessible but must
 * not dominate the standard authoring path.
 *
 * Surface contract:
 *   - A single-line `headline` that conveys the exceptional state
 *     (e.g. "Legacy scheduled state", "Unsupported destination").
 *   - An optional one-line `hint` for the short, author-actionable
 *     next step.
 *   - An optional `<details>`-backed "Operator details" block that
 *     holds the longer, maintenance-grade narration (rule IDs,
 *     legacy-state rationale, support-mode explanations) behind
 *     progressive disclosure.
 *
 * Rendering stays truthful — every word of the legacy/unsupported
 * narration remains present in the DOM (and therefore in `textContent`
 * and in screen-reader navigation) — but at ordinary reading depth
 * the standard author sees a compact cue instead of a full operator
 * paragraph.
 */
import * as React from 'react';
import styles from './exceptionalNotice.module.css';

export type ExceptionalNoticeTone = 'info' | 'warn' | 'danger' | 'neutral';

export interface ExceptionalNoticeProps {
  readonly tone?: ExceptionalNoticeTone;
  readonly headline: string;
  readonly hint?: string;
  readonly details?: React.ReactNode;
  /** When `true`, forces `role="alert"` on the headline row. */
  readonly blocking?: boolean;
  readonly testId?: string;
  readonly detailsLabel?: string;
}

export function ExceptionalNotice({
  tone = 'warn',
  headline,
  hint,
  details,
  blocking = false,
  testId,
  detailsLabel = 'Operator details',
}: ExceptionalNoticeProps): JSX.Element {
  const toneClass = toneClassName(tone);
  return (
    <aside
      className={`${styles.notice} ${toneClass}`}
      role={blocking ? 'alert' : 'status'}
      aria-live={blocking ? 'assertive' : 'polite'}
      data-testid={testId}
    >
      <div className={styles.headlineRow}>
        <span className={styles.badge} aria-hidden="true">
          {tone === 'danger' ? '!' : tone === 'warn' ? '⚠' : 'i'}
        </span>
        <span className={styles.headline}>{headline}</span>
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
      {details && (
        <details className={styles.detailsDisclosure}>
          <summary className={styles.detailsSummary}>{detailsLabel}</summary>
          <div className={styles.detailsBody}>{details}</div>
        </details>
      )}
    </aside>
  );
}

function toneClassName(tone: ExceptionalNoticeTone): string {
  switch (tone) {
    case 'danger':
      return styles.toneDanger;
    case 'info':
      return styles.toneInfo;
    case 'neutral':
      return styles.toneNeutral;
    case 'warn':
    default:
      return styles.toneWarn;
  }
}
