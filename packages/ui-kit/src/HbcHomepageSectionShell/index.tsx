/**
 * HbcHomepageSectionShell — Accessible section wrapper for homepage zones
 * Phase 11A-02 — Production-grade section primitive
 * Phase 15-02 — Premium surface rebuild: zone-aware accent, stronger header
 *
 * Renders an accessible <section> with a premium-grade heading treatment
 * including a zone-aware accent bar below the header. The accent bar
 * creates visible section identity and hierarchy separation.
 */
import * as React from 'react';
import { tokens } from '@fluentui/react-components';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { heading2, body, bodySmall } from '../theme/typography.js';
import { HBC_SPACE_XS, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_LG, HBC_SPACE_XL, HBC_SPACE_2XL } from '../theme/grid.js';
import type { HbcHomepageSectionShellProps } from './types.js';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_LG}px`,
  },
  accentBrand: {
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'rgba(34, 83, 145, 0.3)',
  },
  accentWarm: {
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'rgba(229, 126, 70, 0.3)',
  },
  accentNeutral: {
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
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
    letterSpacing: heading2.letterSpacing ?? '0',
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
    marginTop: `${HBC_SPACE_LG}px`,
  },
  /** Presentation-grade section gap for editorial vertical rhythm (W01-P03) */
  sectionRoot: {
    marginBottom: `${HBC_SPACE_2XL}px`,
  },
});

const accentMap = {
  brand: 'accentBrand',
  warm: 'accentWarm',
  neutral: 'accentNeutral',
} as const;

export const HbcHomepageSectionShell: React.FC<HbcHomepageSectionShellProps> = ({
  title,
  subtitle,
  intro,
  headerAction,
  accent = 'brand',
  children,
  className,
}) => {
  const styles = useStyles();
  const accentClass = styles[accentMap[accent]];

  return (
    <section aria-label={title} className={mergeClasses(styles.sectionRoot, className)} data-hbc-homepage="section-shell">
      <header className={mergeClasses(styles.header, accentClass)}>
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

export type { HbcHomepageSectionShellProps, SectionAccent } from './types.js';
