/**
 * HbcHomepageCta — Branded call-to-action for homepage surfaces
 * Phase 11A-02 — Production-grade homepage CTA primitive
 *
 * Provides link, button, and secondary CTA variants with brand color,
 * visible focus, reduced-motion-aware hover transitions, and optional
 * trailing arrow indicator.
 */
import * as React from 'react';
import { mergeClasses, tokens } from '@fluentui/react-components';
import { makeStyles, shorthands } from '@griffel/react';
import { HBC_RADIUS_MD } from '../theme/radii.js';
import { HBC_SPACE_SM, HBC_SPACE_MD } from '../theme/grid.js';
import type { HbcHomepageCtaProps } from './types.js';

const useStyles = makeStyles({
  base: {
    fontWeight: '600',
    textDecorationLine: 'none',
    cursor: 'pointer',
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: '2px',
    },
  },
  link: {
    color: tokens.colorBrandForegroundLink,
    transitionProperty: 'color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    ':hover': {
      textDecorationLine: 'underline',
      color: tokens.colorBrandForegroundLinkHover,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0ms',
    },
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    borderRadius: HBC_RADIUS_MD,
    ...shorthands.border('0'),
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    ':hover': {
      backgroundColor: tokens.colorBrandBackgroundHover,
    },
    ':active': {
      backgroundColor: tokens.colorBrandBackgroundPressed,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0ms',
    },
  },
  secondary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    backgroundColor: 'transparent',
    color: tokens.colorBrandForegroundLink,
    borderRadius: HBC_RADIUS_MD,
    ...shorthands.border('1px', 'solid', tokens.colorBrandStroke1),
    transitionProperty: 'background-color, color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2,
      color: tokens.colorBrandForegroundLink,
    },
    ':active': {
      backgroundColor: tokens.colorBrandBackground2Pressed,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0ms',
    },
  },
  arrow: {
    marginLeft: '0.35em',
  },
});

const variantStyleMap = {
  link: 'link',
  button: 'button',
  secondary: 'secondary',
} as const;

export const HbcHomepageCta: React.FC<HbcHomepageCtaProps> = ({
  label,
  href,
  variant = 'link',
  external = false,
  arrow = false,
  className,
}) => {
  const styles = useStyles();
  const styleClass = mergeClasses(
    styles.base,
    styles[variantStyleMap[variant]],
    className,
  );

  return (
    <a
      href={href}
      className={styleClass}
      data-hbc-homepage="cta"
      data-hbc-cta-variant={variant}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
      {arrow && <span className={styles.arrow} aria-hidden="true">{'\u2192'}</span>}
    </a>
  );
};

export type { HbcHomepageCtaProps, HomepageCtaVariant } from './types.js';
