/**
 * CompanyPulse — Premium internal newsroom surface
 * Wave 04 — CSS-module premium surface architecture
 *
 * Custom composition using the newsroom CSS module system for a
 * premium editorial surface aligned with ProjectPortfolioSpotlight's
 * family grammar but tuned for newsroom/editorial content.
 *
 * Desktop: dominant lead story (~65%) + subordinate headline stack (~35%).
 * Tablet/Mobile: stacked vertical.
 *
 * Three layout modes:
 * - Rich: lead + headline stack + tertiary zone
 * - Sparse: lead only + archive CTA
 * - Headline-only: full-width headline stack (no featured lead)
 */
import * as React from 'react';
import {
  HbcPremiumCta,
  motion,
  FileText,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeCompanyPulseConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { useResponsiveTier } from '../../homepage/shared/useResponsiveTier.js';
import { usePrefersReducedMotion } from '../../homepage/shared/usePrefersReducedMotion.js';
import {
  NewsroomFeaturedStory,
  NewsroomHeadlineStack,
  NewsroomCategoryChip,
  NR_NO_MOTION,
} from '../../homepage/shared/newsroom/index.js';
import type { CompanyPulseConfig } from '../../homepage/webparts/communicationsContracts.js';
import s from '../../homepage/shared/newsroom/newsroom-surface.module.css';

export interface CompanyPulseProps {
  config?: Partial<CompanyPulseConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

/* ── Tertiary zone ──────────────────────────────────────────────── */

function TertiaryZone({ items, archiveHref, isMobile }: {
  items: { id: string; title: string; category?: string }[];
  archiveHref?: string;
  isMobile: boolean;
}): React.JSX.Element | null {
  const categorizedItems = items.filter((item) => Boolean(item.category));
  if (categorizedItems.length === 0 && !archiveHref) return null;

  return (
    <div className={isMobile ? s.tertiaryZoneMobile : s.tertiaryZone}>
      {categorizedItems.map((item) => (
        <NewsroomCategoryChip key={item.id} category={item.category!} size="sm" />
      ))}
      {archiveHref ? (
        <div className={s.tertiaryArchive}>
          <HbcPremiumCta label="View all news" href={archiveHref} variant="ghost" size="sm" arrow />
        </div>
      ) : null}
    </div>
  );
}

/* ── Sparse layout ──────────────────────────────────────────────── */

function SparseFooter({ archiveHref, isMobile, reducedMotion }: {
  archiveHref?: string;
  isMobile: boolean;
  reducedMotion: boolean;
}): React.JSX.Element | null {
  if (!archiveHref) return null;

  const motionProps = reducedMotion ? NR_NO_MOTION : {
    initial: { opacity: 0, y: 6 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { duration: 0.3, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <motion.div
      className={isMobile ? s.sparseFooterMobile : s.sparseFooter}
      {...motionProps}
    >
      <HbcPremiumCta label="View all news" href={archiveHref} variant="ghost" size="sm" arrow />
    </motion.div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */

export function CompanyPulse({ config, activeAudience, isLoading = false }: CompanyPulseProps): React.JSX.Element {
  const tier = useResponsiveTier();
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = tier === 'mobile';
  const isDesktop = tier === 'desktop';

  if (isLoading) {
    return <HomepageLoadingState label="Loading company pulse" />;
  }

  const normalized = normalizeCompanyPulseConfig(config, activeAudience);
  const hasLead = Boolean(normalized.lead);
  const hasSecondary = normalized.secondary.length > 0;

  if (!hasLead && !hasSecondary) {
    const message = resolveAuthoringMessage('companyPulse', config?.items?.length ? 'invalid' : 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  return (
    <section
      aria-label={normalized.heading}
      className={s.root}
      data-hbc-premium="newsroom-surface"
    >
      {/* Header */}
      <div className={isMobile ? s.headerMobile : s.header}>
        <h2 className={s.headerTitle}>
          <span className={s.headerIcon} aria-hidden="true">
            <FileText size={16} strokeWidth={2} />
          </span>
          {normalized.heading}
        </h2>
        {normalized.archiveHref ? (
          <div className={s.headerAction}>
            <HbcPremiumCta label="See all" href={normalized.archiveHref} variant="ghost" size="sm" arrow />
          </div>
        ) : null}
      </div>

      <hr className={isMobile ? s.separatorMobile : s.separator} />

      {/* Content */}
      {hasLead && hasSecondary ? (
        <>
          <div className={isDesktop ? s.composition : s.compositionStacked}>
            <div className={isDesktop ? s.featuredWrapper : s.featuredWrapperFull}>
              <NewsroomFeaturedStory item={normalized.lead!} tier={tier} reducedMotion={reducedMotion} />
            </div>
            <div className={isDesktop ? s.railWrapper : s.railWrapperFull}>
              <NewsroomHeadlineStack items={normalized.secondary} tier={tier} reducedMotion={reducedMotion} header="More headlines" />
            </div>
          </div>
          <TertiaryZone items={normalized.tertiary} archiveHref={normalized.archiveHref} isMobile={isMobile} />
        </>
      ) : hasLead ? (
        <>
          <NewsroomFeaturedStory item={normalized.lead!} tier={tier} reducedMotion={reducedMotion} />
          <SparseFooter archiveHref={normalized.archiveHref} isMobile={isMobile} reducedMotion={reducedMotion} />
        </>
      ) : (
        <>
          <div className={s.compositionStacked}>
            <div className={s.railWrapperFull}>
              <NewsroomHeadlineStack items={normalized.secondary} tier={tier} reducedMotion={reducedMotion} header="Latest headlines" />
            </div>
          </div>
          <TertiaryZone items={normalized.tertiary} archiveHref={normalized.archiveHref} isMobile={isMobile} />
        </>
      )}
    </section>
  );
}
