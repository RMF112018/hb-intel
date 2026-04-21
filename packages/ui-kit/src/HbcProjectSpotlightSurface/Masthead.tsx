/**
 * Masthead — editorial nameplate at the top of the Spotlight surface.
 * Owns only presentation: eyebrow, rule, freshness date, headline, and
 * the section-level "View all projects" action. Presence of the
 * dateline and section-level action is mode-governed via the
 * `SPOTLIGHT_LAYOUT_VISIBILITY` matrix so compact and minimal states
 * render as intentionally selective, not merely "the same masthead
 * with smaller padding."
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
  /**
   * When false, the masthead does not render the "updated …" dateline.
   * Governed by `SpotlightLayoutVisibility.showMastheadDate`.
   */
  showDate?: boolean;
  /**
   * When false, the masthead does not render the section-level
   * "View all projects" CTA. Governed by
   * `SpotlightLayoutVisibility.showMastheadAction`; compact and
   * minimal hand that CTA off to the rail footer inside the explicit
   * history disclosure so the section never double-furnishes.
   */
  showAction?: boolean;
}

export function Masthead({
  heading,
  eyebrow,
  latestFreshnessLabel,
  allProjectsLabel,
  allProjectsUrl,
  showDate = true,
  showAction = true,
}: MastheadProps): React.JSX.Element {
  const renderDate = showDate && !!latestFreshnessLabel;
  const renderAction = showAction && !!allProjectsUrl;
  return (
    <div className={styles.masthead}>
      <div className={styles.mastheadEyebrow}>
        <span className={styles.mastheadEyebrowIcon} aria-hidden="true">
          <Briefcase size={14} strokeWidth={2.25} />
        </span>
        <span className={styles.mastheadEyebrowLabel}>{eyebrow}</span>
        <span className={styles.mastheadEyebrowRule} aria-hidden="true" />
        {renderDate ? (
          <span className={styles.mastheadEyebrowDate}>
            {latestFreshnessLabel}
          </span>
        ) : null}
      </div>
      <div className={styles.mastheadRow}>
        <h2 className={styles.mastheadHeadline}>{heading}</h2>
        {renderAction ? (
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
