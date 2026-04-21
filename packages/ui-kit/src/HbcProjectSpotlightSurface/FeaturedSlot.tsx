/**
 * FeaturedSlot — composes the featured project body into a four-beat
 * information hierarchy so first view always carries a paced story
 * rather than a stack of fields:
 *
 *   1. identity    — eyebrow + title (or poster overlay in wide/medium
 *                    image-led). Header chip row in title-led.
 *   2. signal      — milestone progress pill + strongest secondary
 *                    chip (status / strategic / stale / freshness).
 *                    This row lands in first view in every posture so
 *                    the portfolio health signal never hides behind a
 *                    disclosure.
 *   3. explanation — short summary snippet (2-line clamp) as the
 *                    editorial reason-to-care. Pulled out of the
 *                    disclosure so the body reads without a click.
 *   4. action      — primary CTA. Resolved as
 *                      `featured.cta ?? fallbackCta`
 *                    so a missing authored item CTA still produces a
 *                    credible next step when the caller provides a
 *                    section-level destination.
 *
 * The disclosure now carries only supporting depth: the full-depth
 * summary, milestone list, freshness full line, team strip, and
 * (when not already in the poster overlay) the authored headline.
 * Disclosure remains explicit, keyboard- and touch-safe, with
 * `detailsOpenByDefault` still driving its initial posture.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { Calendar, ChevronDown } from 'lucide-react';
import { HbcPremiumCta } from '../HbcPremiumCta/index.js';
import type {
  ProjectSpotlightCompleteness,
  ProjectSpotlightCta,
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
  /**
   * Section-level fallback CTA. Used when the authored `featured.cta`
   * is absent but the surface's caller has a section-level destination
   * (typically `allProjectsUrl`). The fallback is rendered with the
   * same premium CTA treatment but stamped `data-cta-source="section"`
   * so tests and styling can distinguish it from an item-authored CTA.
   */
  fallbackCta?: ProjectSpotlightCta;
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
  // details region so freshness + milestones + team land in first
  // view without a disclosure click. `minimal` keeps its tight
  // profile — the essentials block still carries the four-beat
  // hierarchy in that mode.
  if (!hasImage && visibility.mode !== 'minimal') {
    posture.detailsOpenByDefault = true;
  }

  return posture;
}

export function FeaturedSlot({
  featured,
  reducedMotion,
  visibility,
  fallbackCta,
}: FeaturedSlotProps): React.JSX.Element {
  const eyebrowText =
    [featured.sector, featured.location].filter(Boolean).join(' \u00B7 ') ||
    'Featured Project';
  const milestones = featured.milestones ?? [];
  const teamMembers = featured.teamMembers ?? [];
  const hasImage = Boolean(featured.image?.src);
  // Poster-led: in wide/medium with a hero image, the title and
  // authored headline live inside the hero overlay so first view
  // carries title + status + CTA without a tall image pushing them
  // below the fold. Compact/minimal keep the classic posture.
  const posterLed =
    hasImage &&
    (visibility.mode === 'wide' || visibility.mode === 'medium');

  const posture = resolveContentPosture(featured, visibility, hasImage);

  // Effective CTA — authored item CTA wins; otherwise the section-level
  // fallback. Missing both suppresses the slot cleanly. Stamped with a
  // source hint so QA / tests can verify the resolution path.
  const effectiveCta: ProjectSpotlightCta | undefined =
    featured.cta ?? fallbackCta;
  const ctaSource: 'item' | 'section' | null = featured.cta
    ? 'item'
    : fallbackCta
      ? 'section'
      : null;

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

  // Title-led header chip row (status / strategic / stale). Shown only
  // in the no-image posture; image-led keeps these as media overlays.
  const statusLabel = featured.status?.label;
  const showHeaderChips =
    !hasImage &&
    Boolean(statusLabel || featured.strategicEmphasis || featured.isStale);

  // Signal row — strongest secondary signal chip next to the milestone
  // pill. In image-led postures the chips already live over the hero;
  // the signal row then carries progress + a freshness chip only, and
  // suppresses itself entirely when there's nothing to show.
  const signalFreshnessChip =
    featured.freshnessLabel && visibility.mode !== 'minimal'
      ? featured.freshnessLabel
      : undefined;
  const hasSignalRow =
    milestones.length > 0 || Boolean(signalFreshnessChip);

  // Essentials-level summary snippet. Hard 2-line clamp so it never
  // competes with the full-depth summary disclosed below, but still
  // gives first-view readers a reason-to-care without a click. Always
  // derived from `featured.summary`; no separate authoring surface.
  const summarySnippet = featured.summary?.trim() || undefined;

  // The disclosure governs depth content only: full-depth summary
  // (with the mode's native clamp), milestone list, freshness full
  // line, team strip, and (unless poster already carries it) the
  // authored headline.
  const hasHeadlineInDetails =
    !posterLed && posture.showHeadline && Boolean(featured.headline);
  const hasFullSummary =
    Boolean(featured.summary) && posture.summaryLineClamp > 2;
  const hasFreshnessLine = Boolean(featured.freshnessLabel);
  const hasDetailsContent =
    hasHeadlineInDetails ||
    hasFullSummary ||
    posture.showMilestoneList ||
    hasFreshnessLine ||
    (posture.showTeamStrip && teamMembers.length > 0);

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
          posterTitle={posterLed ? featured.title : undefined}
          posterHeadline={
            posterLed && posture.showHeadline ? featured.headline : undefined
          }
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

        {/* 1. identity — title (suppressed when poster-led carries it) */}
        <div className={styles.featuredEssentials}>
          {posterLed ? null : (
            <h3 className={styles.featuredTitle}>{featured.title}</h3>
          )}

          {/* 2. signal — milestone progress + strongest secondary chip */}
          {hasSignalRow ? (
            <div className={styles.featuredSignalRow}>
              <MilestoneProgressPill milestones={milestones} />
              {signalFreshnessChip ? (
                <span
                  className={clsx(
                    styles.featuredSignalChip,
                    featured.isStale && styles.featuredSignalChipStale,
                  )}
                >
                  <Calendar
                    size={12}
                    aria-hidden="true"
                    strokeWidth={2.25}
                  />
                  {signalFreshnessChip}
                </span>
              ) : null}
            </div>
          ) : null}

          {/* 3. explanation — short summary snippet */}
          {summarySnippet ? (
            <p className={styles.featuredSummarySnippet}>{summarySnippet}</p>
          ) : null}

          {/* 4. action — item CTA, else section-level fallback */}
          {effectiveCta && ctaSource ? (
            <div
              className={styles.featuredCtaInline}
              data-cta-source={ctaSource}
            >
              <HbcPremiumCta
                label={effectiveCta.label}
                href={effectiveCta.href}
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
            {hasHeadlineInDetails && featured.headline ? (
              <p className={styles.featuredHeadline}>{featured.headline}</p>
            ) : null}

            {hasFullSummary && featured.summary ? (
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

            {hasFreshnessLine && featured.freshnessLabel ? (
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
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}
