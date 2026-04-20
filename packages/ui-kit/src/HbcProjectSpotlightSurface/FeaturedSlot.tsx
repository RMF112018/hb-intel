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
import type {
  ProjectSpotlightCompleteness,
  ProjectSpotlightFeaturedItem,
} from './types.js';
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

/**
 * Effective rendering posture derived from layout-mode visibility
 * + authored-content completeness. Keeps the rule set in one place
 * so the render tree stays free of scattered conditions.
 */
interface ContentPosture {
  showHeadline: boolean;
  showMilestoneList: boolean;
  showTeamStrip: boolean;
  summaryLineClamp: number;
  detailsOpenByDefault: boolean;
}

function resolveContentPosture(
  featured: ProjectSpotlightFeaturedItem,
  visibility: SpotlightLayoutVisibility,
): ContentPosture {
  const completeness: ProjectSpotlightCompleteness =
    featured.completeness ?? 'full';
  const milestoneCount = featured.milestones?.length ?? 0;
  const teamCount = featured.teamMembers?.length ?? 0;

  // Start from the mode matrix; then trim for thin authored payloads.
  const posture: ContentPosture = {
    showHeadline: visibility.showHeadline && Boolean(featured.headline),
    showMilestoneList: visibility.showMilestoneList && milestoneCount > 0,
    showTeamStrip: visibility.mode !== 'minimal' && teamCount > 0,
    summaryLineClamp: visibility.summaryLineClamp,
    detailsOpenByDefault: visibility.detailsOpenByDefault,
  };

  if (completeness === 'minimal') {
    // Minimal payloads: do not dress up the details region with
    // optional chrome, and do not expand it by default.
    posture.showHeadline = false;
    posture.showMilestoneList = false;
    posture.showTeamStrip = false;
    posture.summaryLineClamp = Math.min(posture.summaryLineClamp, 2);
    posture.detailsOpenByDefault = false;
  } else if (completeness === 'partial') {
    // Partial payloads: keep the milestone list only when it carries
    // real progress signal; otherwise let the essentials pill speak.
    if (milestoneCount < 2) posture.showMilestoneList = false;
    // If headline is present but summary is thin, keep it. If headline
    // is absent the mode check already suppresses it; nothing to do.
  }

  return posture;
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

  const posture = resolveContentPosture(featured, visibility);

  const detailsId = React.useId();
  const [detailsOpen, setDetailsOpen] = React.useState(
    posture.detailsOpenByDefault,
  );
  React.useEffect(() => {
    setDetailsOpen(posture.detailsOpenByDefault);
  }, [posture.detailsOpenByDefault, visibility.mode]);

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: EASE_OUT_EXPO },
      };

  const hasDetailsContent =
    (posture.showHeadline && Boolean(featured.headline)) ||
    Boolean(featured.summary) ||
    posture.showMilestoneList ||
    Boolean(featured.freshnessLabel) ||
    (posture.showTeamStrip && teamMembers.length > 0) ||
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
            {posture.showHeadline && featured.headline ? (
              <p className={styles.featuredHeadline}>{featured.headline}</p>
            ) : null}

            {featured.summary ? (
              <p
                className={styles.featuredSummary}
                style={{ WebkitLineClamp: posture.summaryLineClamp }}
              >
                {featured.summary}
              </p>
            ) : null}

            {posture.showMilestoneList ? (
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

            {posture.showTeamStrip ? (
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
