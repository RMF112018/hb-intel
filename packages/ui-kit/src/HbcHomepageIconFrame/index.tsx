/**
 * HbcHomepageIconFrame — Branded icon container for homepage surfaces
 * Phase 11A — Shared homepage icon primitive
 *
 * Renders an icon inside a sized, rounded frame with brand-tinted background.
 * Used in launcher tiles, discovery quick-paths, and utility destinations.
 */
import * as React from 'react';
import { mergeClasses, tokens } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { HBC_RADIUS_MD } from '../theme/radii.js';
import type { HbcHomepageIconFrameProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorBrandForegroundLink,
    borderRadius: HBC_RADIUS_MD,
    flexShrink: 0,
  },
  sm: {
    width: '28px',
    height: '28px',
    fontSize: '14px',
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
});

export const HbcHomepageIconFrame: React.FC<HbcHomepageIconFrameProps> = ({
  children,
  size = 'md',
  label,
  className,
}) => {
  const styles = useStyles();
  const sizeClass = size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : styles.md;

  return (
    <span
      className={mergeClasses(styles.root, sizeClass, className)}
      data-hbc-homepage="icon-frame"
      {...(label
        ? { role: 'img' as const, 'aria-label': label }
        : { 'aria-hidden': 'true' as const })}
    >
      {children}
    </span>
  );
};

export type { HbcHomepageIconFrameProps, IconFrameSize } from './types.js';
