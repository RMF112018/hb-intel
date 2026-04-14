/**
 * Editorial chooser group.
 *
 * Shared Publisher primitive that renders a labeled set of radio-style
 * buttons over an enum. Authors see governed labels (via `getLabel`)
 * while the underlying enum values remain the source of truth carried
 * to the adapter. Every chooser must route through a governed label
 * function from `authorLabels.ts` so no raw enum token reaches the
 * author.
 */
import * as React from 'react';
import styles from '../article-publisher.module.css';

export interface ChooserGroupProps<T extends string> {
  readonly label: string;
  readonly value: T | undefined;
  readonly options: readonly T[];
  readonly onChange: (next: T | undefined) => void;
  readonly getLabel: (value: T) => string;
  readonly allowClear?: boolean;
  readonly clearLabel?: string;
  readonly helpText?: string;
  readonly ariaLabel?: string;
}

export function ChooserGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  getLabel,
  allowClear,
  clearLabel,
  helpText,
  ariaLabel,
}: ChooserGroupProps<T>): React.ReactElement {
  const showCleared = allowClear && value === undefined;
  return (
    <div className={styles.chooser}>
      <span className={styles.chooserLabel}>{label}</span>
      <div
        className={styles.chooserGroup}
        role="radiogroup"
        aria-label={ariaLabel ?? label}
      >
        {allowClear && (
          <button
            type="button"
            role="radio"
            aria-checked={showCleared}
            className={`${styles.chooserChip} ${showCleared ? styles.chooserChipActive : ''}`}
            onClick={() => onChange(undefined)}
          >
            {clearLabel ?? 'Default'}
          </button>
        )}
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={active}
              className={`${styles.chooserChip} ${active ? styles.chooserChipActive : ''}`}
              onClick={() => onChange(opt)}
            >
              {getLabel(opt)}
            </button>
          );
        })}
      </div>
      {helpText && <span className={styles.chooserHelp}>{helpText}</span>}
    </div>
  );
}
