/**
 * HbcHomepageActionRow — Action/destination row for homepage utility surfaces
 * Phase 11A-02 — Shared homepage action row primitive
 *
 * Renders a horizontal row with optional icon frame, linked title, badge,
 * and description. Used in priority actions, tool launchers, and similar
 * utility-density surfaces where repeated action items need consistent
 * visual treatment.
 */
import * as React from 'react';
import { mergeClasses, tokens } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { body, bodySmall } from '../theme/typography.js';
import { HBC_SPACE_XS, HBC_SPACE_SM } from '../theme/grid.js';
import type { HbcHomepageActionRowProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${HBC_SPACE_SM}px`,
  },
  content: {
    flexGrow: 1,
    minWidth: 0,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: `${HBC_SPACE_SM}px`,
  },
  link: {
    color: tokens.colorBrandForegroundLink,
    fontWeight: '600',
    fontSize: body.fontSize,
    lineHeight: body.lineHeight,
    fontFamily: body.fontFamily,
    textDecorationLine: 'none',
    transitionProperty: 'color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    ':hover': {
      textDecorationLine: 'underline',
      color: tokens.colorBrandForegroundLinkHover,
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
  description: {
    margin: `${HBC_SPACE_XS}px 0 0`,
    fontSize: bodySmall.fontSize,
    lineHeight: bodySmall.lineHeight,
    fontFamily: bodySmall.fontFamily,
    color: tokens.colorNeutralForeground3,
  },
});

export const HbcHomepageActionRow: React.FC<HbcHomepageActionRowProps> = ({
  title,
  href,
  icon,
  badge,
  description,
  external = false,
  className,
}) => {
  const styles = useStyles();

  return (
    <div className={mergeClasses(styles.root, className)} data-hbc-homepage="action-row">
      {icon}
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <a
            href={href}
            className={styles.link}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {title}
          </a>
          {badge}
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  );
};

export type { HbcHomepageActionRowProps } from './types.js';
