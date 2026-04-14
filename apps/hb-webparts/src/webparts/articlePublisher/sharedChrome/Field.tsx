/**
 * Editorial field wrapper.
 *
 * Shared Publisher primitive used by every authoring panel. Renders a
 * label row, an optional helper line, and an optional character counter
 * that surfaces soft/hard limit states. Pairs with inputs and textareas
 * in `article-publisher.module.css`; no panel should style a field row
 * by hand.
 */
import * as React from 'react';
import styles from '../article-publisher.module.css';

export interface FieldCounter {
  readonly value: number;
  readonly soft?: number;
  readonly hard?: number;
}

export interface FieldProps {
  readonly label: string;
  readonly helper?: string;
  readonly counter?: FieldCounter;
  readonly children: React.ReactNode;
}

export function Field({ label, helper, counter, children }: FieldProps) {
  const counterState = counter ? resolveCounterState(counter) : undefined;
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabelRow}>
        <span className={styles.fieldLabel}>{label}</span>
        {counterState && (
          <span
            className={`${styles.fieldCount} ${counterState.className}`}
            aria-live="polite"
          >
            {counterState.text}
          </span>
        )}
      </span>
      {helper && <span className={styles.fieldHelper}>{helper}</span>}
      {children}
    </label>
  );
}

export function resolveCounterState(
  counter: FieldCounter,
): { readonly text: string; readonly className: string } {
  const { value, soft, hard } = counter;
  const limit = hard ?? soft;
  const text = limit ? `${value} / ${limit}` : `${value}`;
  let className = styles.fieldCountOk;
  if (hard !== undefined && value > hard) {
    className = styles.fieldCountOver;
  } else if (soft !== undefined && value > soft) {
    className = styles.fieldCountWarn;
  }
  return { text, className };
}
