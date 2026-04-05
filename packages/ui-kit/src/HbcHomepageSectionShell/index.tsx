/**
 * HbcHomepageSectionShell — Accessible section wrapper for homepage zones
 * Phase 11A-02 — Production-grade section primitive
 *
 * Renders an accessible <section> with branded heading, optional subtitle,
 * intro text, and header-level action slot. Used by all 5 homepage zones.
 */
import * as React from 'react';
import { tokens } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { heading2, body, bodySmall } from '../theme/typography.js';
import { HBC_SPACE_XS, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_LG } from '../theme/grid.js';
import type { HbcHomepageSectionShellProps } from './types.js';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: `${HBC_SPACE_SM}px`,
    marginBottom: `${HBC_SPACE_LG}px`,
  },
  titleGroup: {
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontSize: heading2.fontSize,
    fontWeight: String(heading2.fontWeight),
    lineHeight: heading2.lineHeight,
    letterSpacing: heading2.letterSpacing,
    fontFamily: heading2.fontFamily,
    color: tokens.colorNeutralForeground1,
  },
  subtitle: {
    margin: `${HBC_SPACE_XS}px 0 0`,
    fontSize: bodySmall.fontSize,
    fontWeight: String(bodySmall.fontWeight),
    lineHeight: bodySmall.lineHeight,
    fontFamily: bodySmall.fontFamily,
    color: tokens.colorNeutralForeground3,
  },
  intro: {
    margin: `${HBC_SPACE_SM}px 0 0`,
    fontSize: body.fontSize,
    fontWeight: String(body.fontWeight),
    lineHeight: body.lineHeight,
    fontFamily: body.fontFamily,
    color: tokens.colorNeutralForeground2,
    maxWidth: '65ch',
  },
  content: {
    marginTop: `${HBC_SPACE_MD}px`,
  },
});

export const HbcHomepageSectionShell: React.FC<HbcHomepageSectionShellProps> = ({
  title,
  subtitle,
  intro,
  headerAction,
  children,
  className,
}) => {
  const styles = useStyles();

  return (
    <section aria-label={title} className={className} data-hbc-homepage="section-shell">
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {headerAction}
      </header>
      {intro && <p className={styles.intro}>{intro}</p>}
      <div className={styles.content}>{children}</div>
    </section>
  );
};

export type { HbcHomepageSectionShellProps } from './types.js';
