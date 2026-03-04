/**
 * HbcCard — Elevation Level 1 surface card
 * PH4.8 §Step 3 | Blueprint §1d
 *
 * Optional header/body/footer sections with border dividers.
 * Uses V2.1 dual-shadow elevationLevel1 (card).
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { elevationLevel1 } from '../theme/elevation.js';
import type { HbcCardProps } from './types.js';

const useStyles = makeStyles({
  root: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    borderRadius: '8px',
    boxShadow: elevationLevel1,
    overflow: 'hidden',
  },
  header: {
    paddingTop: '16px',
    paddingRight: '24px',
    paddingBottom: '16px',
    paddingLeft: '24px',
    ...shorthands.borderBottom('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
  },
  body: {
    paddingTop: '24px',
    paddingRight: '24px',
    paddingBottom: '24px',
    paddingLeft: '24px',
  },
  footer: {
    paddingTop: '16px',
    paddingRight: '24px',
    paddingBottom: '16px',
    paddingLeft: '24px',
    ...shorthands.borderTop('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
  },
});

export const HbcCard: React.FC<HbcCardProps> = ({ children, header, footer, className }) => {
  const styles = useStyles();

  return (
    <div className={mergeClasses(styles.root, className)} data-hbc-ui="card">
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
};

export type { HbcCardProps } from './types.js';
