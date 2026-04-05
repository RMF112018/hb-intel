/**
 * HbcHomepageIconFrame — Branded icon container for homepage surfaces
 * Phase 11A-02 — Production-grade icon primitive
 * Phase 15-02 — Premium surface rebuild: added xl size, accent/warm tints
 *
 * Renders an icon inside a sized, rounded frame with tint-controlled
 * background and foreground color. Stronger visual presence than Phase 11A
 * with purpose-built tints for different homepage zones.
 */
import * as React from 'react';
import { mergeClasses, tokens } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { HBC_RADIUS_MD, HBC_RADIUS_LG } from '../theme/radii.js';
import type { HbcHomepageIconFrameProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transitionProperty: 'background-color, transform',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0ms',
    },
  },
  sm: {
    width: '28px',
    height: '28px',
    fontSize: '14px',
    borderRadius: HBC_RADIUS_MD,
  },
  md: {
    width: '36px',
    height: '36px',
    fontSize: '18px',
    borderRadius: HBC_RADIUS_LG,
  },
  lg: {
    width: '44px',
    height: '44px',
    fontSize: '22px',
    borderRadius: HBC_RADIUS_LG,
  },
  xl: {
    width: '56px',
    height: '56px',
    fontSize: '28px',
    borderRadius: '10px',
  },
  brand: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  neutral: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground2,
  },
  subtle: {
    backgroundColor: tokens.colorSubtleBackground,
    color: tokens.colorNeutralForeground3,
  },
  accent: {
    backgroundColor: 'rgba(34, 83, 145, 0.12)',
    color: 'rgb(34, 83, 145)',
  },
  warm: {
    backgroundColor: 'rgba(229, 126, 70, 0.10)',
    color: 'rgb(180, 90, 40)',
  },
});

const sizeMap = { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' } as const;
const tintMap = { brand: 'brand', neutral: 'neutral', subtle: 'subtle', accent: 'accent', warm: 'warm' } as const;

export const HbcHomepageIconFrame: React.FC<HbcHomepageIconFrameProps> = ({
  children,
  size = 'md',
  tint = 'brand',
  label,
  className,
}) => {
  const styles = useStyles();
  const sizeClass = styles[sizeMap[size]];
  const tintClass = styles[tintMap[tint]];

  return (
    <span
      className={mergeClasses(styles.root, sizeClass, tintClass, className)}
      data-hbc-homepage="icon-frame"
      data-hbc-icon-size={size}
      data-hbc-icon-tint={tint}
      {...(label
        ? { role: 'img' as const, 'aria-label': label }
        : { 'aria-hidden': 'true' as const })}
    >
      {children}
    </span>
  );
};

export type { HbcHomepageIconFrameProps, IconFrameSize, IconFrameTint } from './types.js';
