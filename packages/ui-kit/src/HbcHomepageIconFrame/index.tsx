/**
 * HbcHomepageIconFrame — Branded icon container for homepage surfaces
 * Phase 11A-02 — Production-grade icon primitive
 *
 * Renders an icon inside a sized, rounded frame with tint-controlled
 * background and foreground color. Replaces placeholder text-token icons
 * with a proper visual container for launcher tiles, discovery, and utility.
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
    borderRadius: HBC_RADIUS_LG,
    flexShrink: 0,
    transitionProperty: 'background-color',
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
  },
  lg: {
    width: '44px',
    height: '44px',
    fontSize: '22px',
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
});

export const HbcHomepageIconFrame: React.FC<HbcHomepageIconFrameProps> = ({
  children,
  size = 'md',
  tint = 'brand',
  label,
  className,
}) => {
  const styles = useStyles();
  const sizeClass = size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : styles.md;
  const tintClass = tint === 'neutral' ? styles.neutral : tint === 'subtle' ? styles.subtle : styles.brand;

  return (
    <span
      className={mergeClasses(styles.root, sizeClass, tintClass, className)}
      data-hbc-homepage="icon-frame"
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
