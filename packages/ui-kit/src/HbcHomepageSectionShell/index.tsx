/**
 * HbcHomepageSectionShell — Accessible section wrapper for homepage zones
 * Phase 11A — Shared homepage section primitive
 *
 * Renders an accessible <section> with heading, optional subtitle/intro,
 * and a content region. Used by all 5 homepage zones.
 */
import * as React from 'react';
import { makeStyles } from '@griffel/react';
import { heading2, body, bodySmall } from '../theme/typography.js';
import { HBC_SPACE_SM, HBC_SPACE_MD } from '../theme/grid.js';
import type { HbcHomepageSectionShellProps } from './types.js';

const useStyles = makeStyles({
  header: {
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  title: {
    margin: 0,
    fontSize: heading2.fontSize,
    fontWeight: String(heading2.fontWeight),
    lineHeight: heading2.lineHeight,
    letterSpacing: heading2.letterSpacing,
    fontFamily: heading2.fontFamily,
  },
  subtitle: {
    margin: `${HBC_SPACE_SM}px 0 0`,
    fontSize: bodySmall.fontSize,
    fontWeight: String(bodySmall.fontWeight),
    lineHeight: bodySmall.lineHeight,
    fontFamily: bodySmall.fontFamily,
    opacity: 0.75,
  },
  intro: {
    margin: `${HBC_SPACE_SM}px 0 0`,
    fontSize: body.fontSize,
    fontWeight: String(body.fontWeight),
    lineHeight: body.lineHeight,
    fontFamily: body.fontFamily,
  },
});

export const HbcHomepageSectionShell: React.FC<HbcHomepageSectionShellProps> = ({
  title,
  subtitle,
  intro,
  children,
  className,
}) => {
  const styles = useStyles();

  return (
    <section aria-label={title} className={className} data-hbc-homepage="section-shell">
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {intro && <p className={styles.intro}>{intro}</p>}
      </header>
      <div>{children}</div>
    </section>
  );
};

export type { HbcHomepageSectionShellProps } from './types.js';
