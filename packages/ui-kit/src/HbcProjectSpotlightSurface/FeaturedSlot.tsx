/**
 * FeaturedSlot — composes the featured project into essentials and a
 * details region governed by the layout-mode visibility matrix.
 *
 * Two macro-postures:
 *
 *   image-led (hasImage = true):
 *     media zone → essentials (title + progress pill) → disclosure
 *     → details (headline, summary, milestones, freshness, team, CTA)
 *
 *   title-led (hasImage = false):
 *     subordinate header strip (eyebrow + inline status / strategic /
 *     stale chips) → boosted title → progress pill → primary CTA
 *     (inline) → disclosure → details (headline, summary, milestones,
 *     freshness, team).
 *
 *   The title-led posture deliberately promotes the CTA out of the
 *   collapsed details region so first-view density carries a real
 *   next-best action without waiting for a disclosure click. The
 *   media zone does not render at all in this posture — the surface
 *   becomes materially shorter instead of staging a placeholder.
 *
 * The disclosure is explicit, keyboard- and touch-safe, and its initial
 * posture follows `visibility.detailsOpenByDefault` for the image-led
 * posture. The title-led posture overrides to open-by-default in every
 * mode except `minimal`, which keeps a tight default profile.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { Calendar, ChevronDown } from 'lucide-react';
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
  hasImage: boolean,
): ContentPosture {
  const completeness: ProjectSpotlightCompleteness =
    featured.completeness ?? 'full';
  const milestoneCount = featured.milestones?.length ?? 0;
  const teamCount = featured.teamMembers?.length ?? 0;

  const posture: ContentPosture = {
    showHeadline: visibility.showHeadline && Boolean(featured.headline),
    showMilestoneList: visibility.showMilestoneList && milestoneCount > 0,
    showTeamStrip: visibility.mode !== 'minimal' && teamCount > 0,
    summaryLineClamp: visibility.summaryLineClamp,
    detailsOpenByDefault: visibility.detailsOpenByDefault,
  };

  if (completeness === 'minimal') {
    posture.showHeadline = false;
    posture.showMilestoneList = false;
    posture.showTeamStrip = false;
    posture.summaryLineClamp = Math.min(posture.summaryLineClamp, 2);
    posture.detailsOpenByDefault = false;
  } else if (completeness === 'partial') {
    if (milestoneCount < 2) posture.showMilestoneList = false;
  }

  // Title-led override: when there is no hero image, promote the
  // details region so freshness + milestones + summary land in first
  // view without a disclosure click. `minimal` keeps its tight profile —
  // the inline CTA below still lands in first view for that mode.
  if (!hasImage && visibility.mode !== 'minimal') {
    posture.detailsOpenByDefault = true;
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
  const hasImage = Boolean(featured.image?.src);

  const posture = resolveContentPosture(featured, visibility, hasImage);

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

  // Inline CTA rides above the disclosure in the title-led posture so
  // the primary action is in first view. The details region drops the
  // CTA duplicate in that case.
  const renderInlineCta = !hasImage && Boolean(featured.cta);
  const renderDetailsCta = hasImage && Boolean(featured.cta);

  const hasDetailsContent =
    (posture.showHeadline && Boolean(featured.headline)) ||
    Boolean(featured.summary) ||
    posture.showMilestoneList ||
    Boolean(featured.freshnessLabel) ||
    (posture.showTeamStrip && teamMembers.length > 0) ||
    renderDetailsCta;

  // Title-led header chip row (status / strategic / stale). Shown only
  // in the no-image posture; image-led keeps these as media overlays.
  const statusLabel = featured.status?.label;
  const showHeaderChips =
    !hasImage &&
    Boolean(statusLabel || featured.strategicEmphasis || featured.isStale);

  return (
    <motion.article
      className={styles.featuredLayout}
      data-has-image={hasImage ? 'true' : 'false'}
      aria-label="Featured project spotlight"
      {...motionProps}
    >
      {hasImage && featured.image ? (
        <FeaturedMedia
          image={featured.image}
          eyebrowText={eyebrowText}
          status={featured.status}
          strategicEmphasis={featured.strategicEmphasis}
          isStale={featured.isStale}
          showOverlayChips={visibility.showInlineMeta}
        />
      ) : null}

      <div className={styles.featuredContent}>
        {!hasImage ? (
          <div className={styles.featuredHeader}>
            <span className={styles.featuredHeaderEyebrow}>{eyebrowText}</span>
            {showHeaderChips ? (
              <div className={styles.featuredHeaderChips}>
                {statusLabel ? (
                  <span className={styles.featuredHeaderChip}>
                    {statusLabel}
                  </span>
                ) : null}
                {featured.strategicEmphasis ? (
                  <span
                    className={clsx(
                      styles.featuredHeaderChip,
                      styles.featuredHeaderChipStrategic,
                    )}
                  >
                    Strategic
                  </span>
                ) : null}
                {featured.isStale ? (
                  <span
                    className={clsx(
                      styles.featuredHeaderChip,
                      styles.featuredHeaderChipStale,
                    )}
                  >
                    Stale
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className={styles.featuredEssentials}>
          <h3 className={styles.featuredTitle}>{featured.title}</h3>
          <MilestoneProgressPill milestones={milestones} />
          {renderInlineCta && featured.cta ? (
            <div className={styles.featuredCtaInline}>
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
              <ChevronDown size={14} strokeWidth={2.25} />
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
                    size={14}
                    aria-hidden="true"
                    className={styles.metaIcon}
                    strokeWidth={2.25}
                  />
                  {featured.freshnessLabel}
                </span>
              </div>
            ) : null}

            {posture.showTeamStrip ? (
              <TeamStrip
                members={teamMembers}
                reducedMotion={reducedMotion}
                mode={visibility.mode}
              />
            ) : null}

            {renderDetailsCta && featured.cta ? (
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
