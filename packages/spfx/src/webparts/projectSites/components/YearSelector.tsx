/**
 * YearSelector — polished segmented pill control for year filtering.
 *
 * Uses HbcButton from @hbc/ui-kit with a "Year:" label prefix,
 * consistent pill width, and keyboard navigation support.
 * Light-theme only, governed by @hbc/ui-kit tokens.
 */
import React, { useCallback, useRef, type FC, type KeyboardEvent } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HbcButton,
  HBC_SURFACE_LIGHT,
} from '@hbc/ui-kit';

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  label: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: HBC_SURFACE_LIGHT['text-muted'],
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  pillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    alignItems: 'center',
  },
});

export interface YearSelectorProps {
  /** Available years sorted descending (newest first). */
  years: number[];
  /** Currently selected year. */
  selectedYear: number;
  /** Called when the user selects a different year. */
  onYearChange: (year: number) => void;
}

export const YearSelector: FC<YearSelectorProps> = ({
  years,
  selectedYear,
  onYearChange,
}) => {
  const classes = useStyles();
  const groupRef = useRef<HTMLDivElement>(null);

  // Arrow-key navigation within the radiogroup
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const currentIdx = years.indexOf(selectedYear);
      if (currentIdx === -1) return;

      let nextIdx = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIdx = currentIdx < years.length - 1 ? currentIdx + 1 : 0;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIdx = currentIdx > 0 ? currentIdx - 1 : years.length - 1;
      }

      if (nextIdx >= 0) {
        e.preventDefault();
        onYearChange(years[nextIdx]);
        // Focus the newly selected button
        const buttons = groupRef.current?.querySelectorAll('button');
        buttons?.[nextIdx]?.focus();
      }
    },
    [years, selectedYear, onYearChange],
  );

  return (
    <div className={classes.wrapper}>
      <span className={classes.label} id="year-selector-label">Year:</span>
      <div
        ref={groupRef}
        className={classes.pillRow}
        role="radiogroup"
        aria-labelledby="year-selector-label"
        onKeyDown={handleKeyDown}
      >
        {years.map((year) => {
          const isSelected = year === selectedYear;
          return (
            <HbcButton
              key={year}
              variant={isSelected ? 'primary' : 'secondary'}
              size="sm"
              pressed={isSelected}
              onClick={() => onYearChange(year)}
            >
              {year}
            </HbcButton>
          );
        })}
      </div>
    </div>
  );
};
