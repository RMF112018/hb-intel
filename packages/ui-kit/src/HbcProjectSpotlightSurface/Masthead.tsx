/**
 * Masthead — editorial nameplate at the top of the Spotlight surface.
 * Owns only presentation: eyebrow, rule, freshness date, headline, and
 * the section-level "View all projects" action.
 */
import * as React from 'react';
import { Briefcase } from 'lucide-react';
import { HbcPremiumCta } from '../HbcPremiumCta/index.js';
import styles from './project-spotlight-surface.module.css';

export interface MastheadProps {
  heading: string;
  eyebrow: string;
  latestFreshnessLabel?: string;
  allProjectsLabel?: string;
  allProjectsUrl?: string;
}

export function Masthead({
  heading,
  eyebrow,
  latestFreshnessLabel,
  allProjectsLabel,
  allProjectsUrl,
}: MastheadProps): React.JSX.Element {
  return (
    <div className={styles.masthead}>
      <div className={styles.mastheadEyebrow}>
        <span className={styles.mastheadEyebrowIcon} aria-hidden="true">
          <Briefcase size={14} strokeWidth={2.25} />
        </span>
        <span>{eyebrow}</span>
        <span className={styles.mastheadEyebrowRule} aria-hidden="true" />
        {latestFreshnessLabel ? (
          <span className={styles.mastheadEyebrowDate}>
            {latestFreshnessLabel}
          </span>
        ) : null}
      </div>
      <div className={styles.mastheadRow}>
        <h2 className={styles.mastheadHeadline}>{heading}</h2>
        {allProjectsUrl ? (
          <div className={styles.mastheadAction}>
            <HbcPremiumCta
              label={allProjectsLabel ?? 'View all projects'}
              href={allProjectsUrl}
              variant="ghost"
              size="sm"
              arrow
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
