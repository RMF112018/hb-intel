/**
 * Editorial chooser group.
 *
 * Shared Publisher primitive that renders a labeled set of radio-style
 * buttons over an enum. Authors see governed labels (via `getLabel`)
 * while the underlying enum values remain the source of truth carried
 * to the adapter. Every chooser must route through a governed label
 * function from `authorLabels.ts` so no raw enum token reaches the
 * author.
 *
 * Implements the WAI-ARIA APG radio-group keyboard model with a
 * roving tabindex: the currently checked option (or the first option
 * when nothing is checked) owns tabindex=0; all others are -1. Arrow
 * keys move focus and selection between options, wrapping at the
 * ends; Home/End jump to the first/last option; Space activates the
 * focused option. Tab enters the group once and exits it once.
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

type ChooserOption<T extends string> = { readonly key: string; readonly value: T | undefined };

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
  const ordered = React.useMemo<ReadonlyArray<ChooserOption<T>>>(() => {
    const list: Array<ChooserOption<T>> = [];
    if (allowClear) list.push({ key: '__clear__', value: undefined });
    for (const opt of options) list.push({ key: opt, value: opt });
    return list;
  }, [allowClear, options]);

  const checkedIndex = ordered.findIndex((o) => o.value === value);
  const tabStopIndex = checkedIndex >= 0 ? checkedIndex : 0;

  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  buttonRefs.current.length = ordered.length;

  const selectAt = (index: number): void => {
    const target = ordered[index];
    if (!target) return;
    onChange(target.value);
    buttonRefs.current[index]?.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ): void => {
    const count = ordered.length;
    if (count === 0) return;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        event.preventDefault();
        selectAt((index + 1) % count);
        return;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        event.preventDefault();
        selectAt((index - 1 + count) % count);
        return;
      }
      case 'Home': {
        event.preventDefault();
        selectAt(0);
        return;
      }
      case 'End': {
        event.preventDefault();
        selectAt(count - 1);
        return;
      }
      case ' ': {
        event.preventDefault();
        selectAt(index);
        return;
      }
      default:
        return;
    }
  };

  return (
    <div className={styles.chooser}>
      <span className={styles.chooserLabel}>{label}</span>
      <div
        className={styles.chooserGroup}
        role="radiogroup"
        aria-label={ariaLabel ?? label}
      >
        {ordered.map((option, index) => {
          const active =
            option.value === undefined ? value === undefined : value === option.value;
          const displayLabel =
            option.value === undefined
              ? (clearLabel ?? 'Default')
              : getLabel(option.value);
          return (
            <button
              key={option.key}
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={index === tabStopIndex ? 0 : -1}
              className={`${styles.chooserChip} ${active ? styles.chooserChipActive : ''}`}
              onClick={() => selectAt(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>
      {helpText && <span className={styles.chooserHelp}>{helpText}</span>}
    </div>
  );
}
