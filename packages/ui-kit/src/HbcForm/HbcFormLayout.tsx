/**
 * HbcFormLayout — CSS Grid layout for form fields
 * Blueprint §1d — responsive grid with configurable columns
 * WS1-T07 — Added responsive column collapse for mobile/tablet
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import type { HbcFormLayoutProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: '1fr',
  },
  col1: { gridTemplateColumns: '1fr' },
  col2: {
    gridTemplateColumns: '1fr',
    '@media (min-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  col3: {
    gridTemplateColumns: '1fr',
    '@media (min-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: '1fr 1fr 1fr',
    },
  },
  col4: {
    gridTemplateColumns: '1fr',
    '@media (min-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
    },
  },
  gapSmall: { gap: '8px' },
  gapMedium: { gap: '16px' },
  gapLarge: { gap: '24px' },
});

const COL_MAP = {
  1: 'col1',
  2: 'col2',
  3: 'col3',
  4: 'col4',
} as const;

const GAP_MAP = {
  small: 'gapSmall',
  medium: 'gapMedium',
  large: 'gapLarge',
} as const;

export const HbcFormLayout: React.FC<HbcFormLayoutProps> = ({
  children,
  columns = 1,
  gap = 'medium',
  className,
}) => {
  const styles = useStyles();

  return (
    <div
      data-hbc-ui="form-layout"
      className={mergeClasses(
        styles.root,
        styles[COL_MAP[columns]],
        styles[GAP_MAP[gap]],
        className,
      )}
    >
      {children}
    </div>
  );
};
