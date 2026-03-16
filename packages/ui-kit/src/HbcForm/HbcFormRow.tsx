/**
 * HbcFormRow — Responsive flex row for form fields
 * PH4.11 §Step 4 | Blueprint §1d
 *
 * Side-by-side above 768px, stacked below. Children get equal flex width.
 * NOT the same as HbcFormLayout (CSS Grid) — different semantic purpose.
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { BREAKPOINT_MOBILE, HBC_SPACE_MD } from '../theme/grid.js';
import type { HbcFormRowProps } from './types.js';

const useStyles = makeStyles({
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    [`@media (max-width: ${BREAKPOINT_MOBILE - 1}px)`]: {
      flexDirection: 'column',
    },
  },
  child: {
    flex: '1 1 0',
    minWidth: 0,
  },
});

export const HbcFormRow: React.FC<HbcFormRowProps> = ({
  children,
  gap = HBC_SPACE_MD,
  className,
}) => {
  const styles = useStyles();

  return (
    <div
      data-hbc-ui="form-row"
      className={mergeClasses(styles.row, className)}
      style={{ gap }}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return (
          <div className={styles.child}>{child}</div>
        );
      })}
    </div>
  );
};
