/**
 * YearSelector — segmented pill button row for year filtering.
 *
 * Uses HbcButton from @hbc/ui-kit: `primary` for the selected year,
 * `ghost` for unselected years. Supports keyboard navigation and
 * wraps gracefully on narrow viewports.
 */
import React, { type FC } from 'react';
import { makeStyles } from '@griffel/react';
import { HbcButton } from '@hbc/ui-kit';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
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

  return (
    <div
      className={classes.container}
      role="radiogroup"
      aria-label="Filter by year"
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
  );
};
