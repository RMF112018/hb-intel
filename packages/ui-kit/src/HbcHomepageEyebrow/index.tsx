/**
 * HbcHomepageEyebrow — Editorial kicker/metadata above headings
 * Phase 12B-02 — Top-band editorial hierarchy primitive
 *
 * Renders a small, uppercase, letter-spaced text line used above headings
 * to establish editorial hierarchy. Supports tonal variants for light
 * surfaces (welcome) and dark/gradient surfaces (hero banner).
 *
 * Usage:
 *   <HbcHomepageEyebrow>Updated weekly</HbcHomepageEyebrow>
 *   <HbcHomepageEyebrow tone="on-dark">This week at HB</HbcHomepageEyebrow>
 */
import * as React from 'react';
import { mergeClasses, tokens } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { label as labelTypo } from '../theme/typography.js';
import { HBC_SPACE_XS } from '../theme/grid.js';
import type { HbcHomepageEyebrowProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'block',
    fontSize: labelTypo.fontSize,
    fontWeight: '600',
    lineHeight: labelTypo.lineHeight,
    fontFamily: labelTypo.fontFamily,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: `${HBC_SPACE_XS}px`,
  },
  default: {
    color: tokens.colorNeutralForeground2,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  'on-dark': {
    color: 'rgba(255, 255, 255, 0.85)',
  },
});

export const HbcHomepageEyebrow: React.FC<HbcHomepageEyebrowProps> = ({
  children,
  tone = 'default',
  className,
}) => {
  const styles = useStyles();
  const toneClass = tone === 'muted' ? styles.muted
    : tone === 'on-dark' ? styles['on-dark']
    : styles.default;

  return (
    <span
      className={mergeClasses(styles.root, toneClass, className)}
      data-hbc-homepage="eyebrow"
      data-hbc-eyebrow-tone={tone}
    >
      {children}
    </span>
  );
};

export type { HbcHomepageEyebrowProps, EyebrowTone } from './types.js';
