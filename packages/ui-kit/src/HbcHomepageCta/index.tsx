/**
 * HbcHomepageCta — Branded call-to-action for homepage surfaces
 * Phase 11A — Shared homepage CTA primitive
 *
 * Provides a link or button-styled CTA with brand color, visible focus,
 * and reduced-motion-aware hover transitions.
 */
import * as React from 'react';
import { mergeClasses, tokens } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { HBC_RADIUS_MD } from '../theme/radii.js';
import { HBC_SPACE_SM, HBC_SPACE_MD } from '../theme/grid.js';
import type { HbcHomepageCtaProps } from './types.js';

const useStyles = makeStyles({
  link: {
    color: tokens.colorBrandForegroundLink,
    fontWeight: '600',
    textDecorationLine: 'none',
    transitionProperty: 'text-decoration-line',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    ':hover': {
      textDecorationLine: 'underline',
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: '2px',
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
    fontWeight: '600',
    textDecorationLine: 'none',
    borderRadius: HBC_RADIUS_MD,
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    ':hover': {
      backgroundColor: tokens.colorBrandBackgroundHover,
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: '2px',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0ms',
    },
  },
});

export const HbcHomepageCta: React.FC<HbcHomepageCtaProps> = ({
  label,
  href,
  variant = 'link',
  external = false,
  className,
}) => {
  const styles = useStyles();
  const styleClass = mergeClasses(
    variant === 'button' ? styles.button : styles.link,
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
    </a>
  );
};

export type { HbcHomepageCtaProps, HomepageCtaVariant } from './types.js';
