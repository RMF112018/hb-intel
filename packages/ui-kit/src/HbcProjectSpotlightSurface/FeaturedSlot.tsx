/**
 * FeaturedSlot — composes the featured project into essentials and a
 * details region governed by the layout-mode visibility matrix.
 *
 *   Essentials (always visible):  media + title + compact milestone pill
 *   Details region (disclosure):  headline, summary, milestone list,
 *                                 freshness, team strip, CTA
 *
 * The disclosure is explicit, keyboard- and touch-safe, and its initial
 * posture follows `visibility.detailsOpenByDefault`: open in wide/medium,
 * closed in compact/minimal.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';
import { HbcPremiumCta } from '../HbcPremiumCta/index.js';
import type { ProjectSpotlightFeaturedItem } from './types.js';
import type { SpotlightLayoutVisibility } from './layout-mode.js';
import { EASE_OUT_EXPO } from './internals.js';
import { FeaturedMedia } from './FeaturedMedia.js';
import { MilestoneList, MilestoneProgressPill } from './Milestones.js';
import { TeamStrip } from './TeamStrip.js';
import styles from './project-spotlight-surface.module.css';

export interface FeaturedSlotProps {
  featured: ProjectSpotlightFeaturedItem;
  reducedMotion: boolean;
  visibility: SpotlightLayoutVisibility;
}

export function FeaturedSlot({
  featured,
  reducedMotion,
  visibility,
}: FeaturedSlotProps): React.JSX.Element {
  const eyebrowText =
    [featured.sector, featured.location].filter(Boolean).join(' \u00B7 ') ||
    'Featured Project';
  const milestones = featured.milestones ?? [];
  const teamMembers = featured.teamMembers ?? [];

  const detailsId = React.useId();
  const [detailsOpen, setDetailsOpen] = React.useState(
    visibility.detailsOpenByDefault,
  );
  React.useEffect(() => {
    setDetailsOpen(visibility.detailsOpenByDefault);
  }, [visibility.detailsOpenByDefault, visibility.mode]);

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: EASE_OUT_EXPO },
      };

  const hasDetailsContent =
    Boolean(featured.headline) ||
    Boolean(featured.summary) ||
    (visibility.showMilestoneList && milestones.length > 0) ||
    Boolean(featured.freshnessLabel) ||
    teamMembers.length > 0 ||
    Boolean(featured.cta);

  return (
    <motion.article
      className={styles.featuredLayout}
      aria-label="Featured project spotlight"
      {...motionProps}
    >
      <FeaturedMedia
        image={featured.image}
        eyebrowText={eyebrowText}
        status={featured.status}
        strategicEmphasis={featured.strategicEmphasis}
        isStale={featured.isStale}
        showOverlayChips={visibility.showInlineMeta}
      />

      <div className={styles.featuredContent}>
        <div className={styles.featuredEssentials}>
          <h3 className={styles.featuredTitle}>{featured.title}</h3>
          <MilestoneProgressPill milestones={milestones} />
        </div>

        {hasDetailsContent ? (
          <button
            type="button"
            className={styles.featuredDisclosure}
            onClick={() => setDetailsOpen((prev) => !prev)}
            aria-expanded={detailsOpen}
            aria-controls={detailsId}
          >
            <span className={styles.featuredDisclosureLabel}>
              {detailsOpen ? 'Hide spotlight details' : 'Show spotlight details'}
            </span>
            <span
              className={clsx(
                styles.featuredDisclosureChevron,
                detailsOpen && styles.featuredDisclosureChevronOpen,
              )}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>
        ) : null}

        {hasDetailsContent ? (
          <div
            id={detailsId}
            className={clsx(
              styles.featuredDetails,
              detailsOpen && styles.featuredDetailsOpen,
            )}
            hidden={!detailsOpen}
          >
            {visibility.showHeadline && featured.headline ? (
              <p className={styles.featuredHeadline}>{featured.headline}</p>
            ) : null}

            {featured.summary ? (
              <p
                className={styles.featuredSummary}
                style={{ WebkitLineClamp: visibility.summaryLineClamp }}
              >
                {featured.summary}
              </p>
            ) : null}

            {visibility.showMilestoneList ? (
              <MilestoneList milestones={milestones} />
            ) : null}

            {featured.freshnessLabel ? (
              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  <Calendar
                    size={12}
                    aria-hidden="true"
                    className={styles.metaIcon}
                    strokeWidth={2.25}
                  />
                  {featured.freshnessLabel}
                </span>
              </div>
            ) : null}

            {visibility.mode !== 'minimal' ? (
              <TeamStrip members={teamMembers} reducedMotion={reducedMotion} />
            ) : null}

            {featured.cta ? (
              <div className={styles.featuredCta}>
                <HbcPremiumCta
                  label={featured.cta.label}
                  href={featured.cta.href}
                  variant="primary"
                  size="md"
                  arrow
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}
