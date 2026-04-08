/**
 * HbcHomepageSurfaceCard — Premium surface-class-aware card for homepage zones
 * Phase 11A-02 — Initial shared surface card primitive
 * Phase 12B-02 — Added 'welcome' surface class
 * Phase 15-02 — Premium surface system rebuild
 *
 * Each surface class now renders a materially distinct visual treatment.
 * Surfaces are no longer thin wrappers around generic card weights —
 * each family has its own background, shadow, border, padding, and radius
 * to create real visual differentiation across homepage zones.
 */
import * as React from 'react';
import { mergeClasses, tokens } from '@fluentui/react-components';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_RADIUS_LG, HBC_RADIUS_XL } from '../theme/radii.js';
import { HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_LG, HBC_SPACE_XL } from '../theme/grid.js';
import { elevationLevel0, elevationLevel1, elevationLevel2, elevationHero, elevationEditorial } from '../theme/elevation.js';
import { HBC_SURFACE_PRESENTATION } from '../theme/tokens.js';
import type { HbcHomepageSurfaceCardProps } from './types.js';

/**
 * Premium surface system — each surface class gets distinct visual treatment.
 *
 * hero:        Deep brand background, prominent shadow, large radius, high-impact
 * welcome:     Brand-tinted left accent, warm background, signature presence
 * editorial:   Clean with warm left accent, generous spacing, magazine-like
 * utility:     Dense, structured, subtle cool background, compact radius
 * operational: Cool-toned, structured border, dashboard-adjacent
 * discovery:   Warm neutral background, inviting border, prominent feel
 */
const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    color: tokens.colorNeutralForeground1,
  },

  /* ── Signature surfaces ─────────────────────────────────── */

  hero: {
    backgroundColor: 'rgba(34, 83, 145, 0.04)',
    boxShadow: elevationHero,
    borderRadius: '12px',
    ...shorthands.border('0'),
    ...shorthands.borderBottom('4px', 'solid', 'rgb(34, 83, 145)'),
    paddingTop: `${HBC_SPACE_XL}px`,
    paddingBottom: `${HBC_SPACE_XL}px`,
    paddingLeft: `${HBC_SPACE_XL}px`,
    paddingRight: `${HBC_SPACE_XL}px`,
  },
  welcome: {
    backgroundColor: 'rgba(34, 83, 145, 0.03)',
    boxShadow: elevationLevel2,
    borderRadius: '12px',
    ...shorthands.border('1px', 'solid', 'rgba(34, 83, 145, 0.12)'),
    ...shorthands.borderLeft('5px', 'solid', 'rgb(34, 83, 145)'),
    paddingTop: `${HBC_SPACE_XL}px`,
    paddingBottom: `${HBC_SPACE_XL}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
  },

  /* ── Editorial surfaces ─────────────────────────────────── */

  editorial: {
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: elevationEditorial,
    borderRadius: HBC_RADIUS_XL,
    ...shorthands.border('1px', 'solid', 'rgba(0, 0, 0, 0.10)'),
    ...shorthands.borderLeft('3px', 'solid', 'rgba(229, 126, 70, 0.5)'),
    paddingTop: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_LG}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
  },

  /* ── Command / utility surfaces ─────────────────────────── */

  utility: {
    backgroundColor: 'rgba(34, 83, 145, 0.025)',
    boxShadow: elevationLevel0,
    borderRadius: HBC_RADIUS_LG,
    ...shorthands.border('1px', 'solid', 'rgba(34, 83, 145, 0.10)'),
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    transitionProperty: 'box-shadow, border-color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    ':hover': {
      boxShadow: elevationLevel1,
      ...shorthands.borderColor('rgba(34, 83, 145, 0.20)'),
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0ms',
    },
  },

  /* ── Operational surfaces ───────────────────────────────── */

  operational: {
    backgroundColor: 'rgba(34, 83, 145, 0.02)',
    boxShadow: elevationLevel1,
    borderRadius: HBC_RADIUS_XL,
    ...shorthands.border('1px', 'solid', 'rgba(34, 83, 145, 0.12)'),
    ...shorthands.borderLeft('4px', 'solid', 'rgb(34, 83, 145)'),
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
  },

  /* ── Discovery surfaces ─────────────────────────────────── */

  discovery: {
    backgroundColor: 'rgba(229, 126, 70, 0.03)',
    boxShadow: elevationLevel1,
    borderRadius: '10px',
    ...shorthands.border('1px', 'solid', 'rgba(229, 126, 70, 0.15)'),
    paddingTop: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_LG}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
  },
});

export const HbcHomepageSurfaceCard: React.FC<HbcHomepageSurfaceCardProps> = ({
  children,
  surface = 'editorial',
  header,
  footer,
  className,
}) => {
  const styles = useStyles();
  const surfaceClass = styles[surface] ?? undefined;
  const composedClass = mergeClasses(styles.root, surfaceClass, className);

  return (
    <div data-hbc-homepage="surface-card" data-hbc-surface={surface} className={composedClass}>
      {header && <div style={{ marginBottom: `${HBC_SPACE_SM}px` }}>{header}</div>}
      <div style={{ flexGrow: 1 }}>{children}</div>
      {footer && <div style={{ marginTop: `${HBC_SPACE_SM}px` }}>{footer}</div>}
    </div>
  );
};

export type { HbcHomepageSurfaceCardProps } from './types.js';
