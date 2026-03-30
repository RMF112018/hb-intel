/**
 * HbcSegmentedControl — Governed pill-group selector
 *
 * Composes HbcButton pills into a radiogroup with full keyboard navigation
 * (ArrowLeft/Right/Up/Down with wrapping). Designed for compact filter
 * controls like year selectors, mode toggles, and category pickers.
 *
 * Uses HbcButton variant toggling (primary=selected, secondary=unselected)
 * with pressed state for ARIA compliance.
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { HbcButton } from '../HbcButton/index.js';
import { label as labelType } from '../theme/typography.js';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import type { HbcSegmentedControlProps } from './types.js';

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  label: {
    fontSize: labelType.fontSize,
    fontWeight: '600',
    color: HBC_SURFACE_LIGHT['text-muted'],
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    paddingTop: '0',
    paddingBottom: '0',
    paddingLeft: '0',
    paddingRight: '0',
    marginTop: '-1px',
    marginBottom: '0',
    marginLeft: '0',
    marginRight: '0',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderTopWidth: '0',
    borderBottomWidth: '0',
    borderLeftWidth: '0',
    borderRightWidth: '0',
  },
  pillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    alignItems: 'center',
  },
});

function HbcSegmentedControlInner<T extends string | number = string>(
  props: HbcSegmentedControlProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
): React.ReactElement {
  const {
    label,
    showLabel = true,
    options,
    value,
    onChange,
    size = 'sm',
    disabled = false,
    className,
  } = props;

  const classes = useStyles();
  const groupRef = React.useRef<HTMLDivElement>(null);
  const labelId = React.useId();

  // Arrow-key navigation within the radiogroup (wrapping)
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const enabledOptions = options.filter((o) => !o.disabled);
      const currentIdx = enabledOptions.findIndex((o) => o.value === value);
      if (currentIdx === -1) return;

      let nextIdx = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIdx = currentIdx < enabledOptions.length - 1 ? currentIdx + 1 : 0;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIdx = currentIdx > 0 ? currentIdx - 1 : enabledOptions.length - 1;
      }

      if (nextIdx >= 0) {
        e.preventDefault();
        onChange(enabledOptions[nextIdx].value);
        // Focus the newly selected button
        const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>(
          'button:not([disabled])',
        );
        buttons?.[nextIdx]?.focus();
      }
    },
    [options, value, onChange],
  );

  return (
    <div
      ref={ref}
      className={mergeClasses(classes.wrapper, className)}
      data-hbc-ui="segmented-control"
    >
      <span
        id={labelId}
        className={showLabel ? classes.label : classes.srOnly}
      >
        {label}
      </span>
      <div
        ref={groupRef}
        className={classes.pillRow}
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={handleKeyDown}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          const isDisabled = disabled || option.disabled;
          return (
            <HbcButton
              key={String(option.value)}
              variant={isSelected ? 'primary' : 'secondary'}
              size={size}
              pressed={isSelected}
              disabled={isDisabled}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </HbcButton>
          );
        })}
      </div>
    </div>
  );
}

export const HbcSegmentedControl = React.forwardRef(HbcSegmentedControlInner) as <
  T extends string | number = string,
>(
  props: HbcSegmentedControlProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement;

export type { HbcSegmentedControlProps, SegmentedOption } from './types.js';
