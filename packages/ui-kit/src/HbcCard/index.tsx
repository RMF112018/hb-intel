/**
 * HbcCard — Elevation surface card with weight classes
 * PH4.8 §Step 3 | Blueprint §1d | WS1-T04
 *
 * Optional header/body/footer sections with border dividers.
 * Weight prop controls visual hierarchy: primary, standard (default), supporting.
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { elevationLevel0, elevationLevel1, elevationLevel2 } from '../theme/elevation.js';
import { HBC_RADIUS_XL } from '../theme/radii.js';
import { HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_LG } from '../theme/grid.js';
import type { HbcCardProps } from './types.js';

const useStyles = makeStyles({
  root: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    borderRadius: HBC_RADIUS_XL,
    boxShadow: elevationLevel1,
    overflow: 'hidden',
  },
  // Weight variants
  weightPrimary: {
    boxShadow: elevationLevel2,
    ...shorthands.border('2px', 'solid', HBC_SURFACE_LIGHT['border-focus']),
  },
  weightSupporting: {
    boxShadow: elevationLevel0,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
  },
  // Header/footer with default (standard) padding
  header: {
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    ...shorthands.borderBottom('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
  },
  body: {
    paddingTop: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_LG}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
  },
  footer: {
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    ...shorthands.borderTop('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
  },
  // Primary weight uses increased header padding
  headerPrimary: {
    paddingTop: '20px',
    paddingBottom: '20px',
  },
  footerPrimary: {
    paddingTop: '20px',
    paddingBottom: '20px',
  },
  // Supporting weight uses compact padding
  headerSupporting: {
    paddingTop: '12px',
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingBottom: '12px',
    paddingLeft: `${HBC_SPACE_MD}px`,
  },
  bodySupporting: {
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
  },
  footerSupporting: {
    paddingTop: '12px',
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingBottom: '12px',
    paddingLeft: `${HBC_SPACE_MD}px`,
  },
});

export const HbcCard: React.FC<HbcCardProps> = ({ children, header, footer, className, weight = 'standard' }) => {
  const styles = useStyles();

  const rootClass = mergeClasses(
    styles.root,
    weight === 'primary' && styles.weightPrimary,
    weight === 'supporting' && styles.weightSupporting,
    className,
  );

  const headerClass = mergeClasses(
    styles.header,
    weight === 'primary' && styles.headerPrimary,
    weight === 'supporting' && styles.headerSupporting,
  );

  const bodyClass = mergeClasses(
    styles.body,
    weight === 'supporting' && styles.bodySupporting,
  );

  const footerClass = mergeClasses(
    styles.footer,
    weight === 'primary' && styles.footerPrimary,
    weight === 'supporting' && styles.footerSupporting,
  );

  return (
    <div className={rootClass} data-hbc-ui="card" data-hbc-card-weight={weight}>
      {header && <div className={headerClass}>{header}</div>}
      <div className={bodyClass}>{children}</div>
      {footer && <div className={footerClass}>{footer}</div>}
    </div>
  );
};

export type { HbcCardProps, CardWeight } from './types.js';
