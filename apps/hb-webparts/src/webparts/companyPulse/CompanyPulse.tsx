/**
 * CompanyPulse — Premium internal newsroom surface
 * Wave 03 — Render-layer rebuild with lead/secondary/tertiary hierarchy
 *
 * Custom composition replacing HbcEditorialSurface delegation. Uses the
 * newsroom primitives from homepage/shared/newsroom/ for a premium
 * editorial surface aligned with ProjectPortfolioSpotlight's family
 * grammar but tuned for newsroom/editorial content.
 *
 * Desktop: dominant lead story (~65%) + subordinate headline stack (~35%).
 * Tablet: lead story full-width, headline stack below.
 * Mobile: stacked vertical with compact spacing.
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
import { useResponsiveTier, type ResponsiveTier } from '../../homepage/shared/useResponsiveTier.js';
import { usePrefersReducedMotion } from '../../homepage/shared/usePrefersReducedMotion.js';
import {
  NewsroomFeaturedStory,
  NewsroomHeadlineStack,
  NewsroomCategoryChip,
  NR_PALETTE,
  NR_NO_MOTION,
} from '../../homepage/shared/newsroom/index.js';
import type { CompanyPulseConfig } from '../../homepage/webparts/communicationsContracts.js';

export interface CompanyPulseProps {
  config?: Partial<CompanyPulseConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

/* ── Root and header styles ─────────────────────────────────────── */

const rootStyle: React.CSSProperties = {
  fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  color: NR_PALETTE.text1,
  background: NR_PALETTE.rootBg,
  borderRadius: NR_PALETTE.rootRadius,
  borderLeft: NR_PALETTE.rootBorder,
  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
  borderRight: '1px solid rgba(0, 0, 0, 0.06)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  boxShadow: NR_PALETTE.rootShadow,
  overflow: 'hidden',
};

function getHeaderStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    padding: tier === 'mobile' ? '20px 16px 12px' : '20px 24px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  };
}

const headerTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  color: NR_PALETTE.headerTitle,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const headerIconStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
  borderRadius: 7,
  background: NR_PALETTE.headerIconBg,
  color: NR_PALETTE.headerIconColor,
};

const separatorStyle: React.CSSProperties = {
  height: 2,
  background: NR_PALETTE.headerSeparator,
  border: 'none',
  margin: '0 24px',
};

/* ── Composition styles ─────────────────────────────────────────── */

function getCompositionStyle(tier: ResponsiveTier): React.CSSProperties {
  if (tier === 'desktop') {
    return { display: 'flex', flexWrap: 'wrap' };
  }
  return { display: 'flex', flexDirection: 'column' };
}

function getFeaturedWrapperStyle(tier: ResponsiveTier): React.CSSProperties {
  if (tier === 'desktop') {
    return { flex: '1 1 65%', minWidth: 380 };
  }
  return { flex: '1 1 100%', minWidth: 0 };
}

function getRailWrapperStyle(tier: ResponsiveTier): React.CSSProperties {
  if (tier === 'desktop') {
    return { flex: '1 1 26%', minWidth: 240 };
  }
  return { flex: '1 1 100%', minWidth: 0 };
}

/* ── Tertiary zone ──────────────────────────────────────────────── */

function TertiaryZone({ items, archiveHref, tier }: {
  items: { id: string; title: string; category?: string }[];
  archiveHref?: string;
  tier: ResponsiveTier;
}): React.JSX.Element | null {
  if (items.length === 0 && !archiveHref) return null;

  return (
    <div
      style={{
        padding: tier === 'mobile' ? '10px 16px 16px' : '10px 24px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        borderTop: `1px solid ${NR_PALETTE.itemDivider}`,
      }}
    >
      {items.map((item) => (
        <NewsroomCategoryChip key={item.id} category={item.category ?? 'update'} size="sm" />
      ))}
      {archiveHref ? (
        <div style={{ marginLeft: 'auto' }}>
          <HbcPremiumCta
            label="View all news"
            href={archiveHref}
            variant="ghost"
            size="sm"
            arrow
          />
        </div>
      ) : null}
    </div>
  );
}

/* ── Sparse layout (lead only, no supporting stories) ───────────── */

function SparseLayout({ children, archiveHref, tier, reducedMotion }: {
  children: React.ReactNode;
  archiveHref?: string;
  tier: ResponsiveTier;
  reducedMotion: boolean;
}): React.JSX.Element {
  const motionProps = reducedMotion ? NR_NO_MOTION : {
    initial: { opacity: 0, y: 8 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <motion.div {...motionProps}>
      {children}
      {archiveHref ? (
        <div style={{
          padding: tier === 'mobile' ? '12px 16px 16px' : '12px 24px 20px',
          display: 'flex',
          justifyContent: 'flex-end',
          borderTop: `1px solid ${NR_PALETTE.itemDivider}`,
        }}>
          <HbcPremiumCta
            label="View all news"
            href={archiveHref}
            variant="ghost"
            size="sm"
            arrow
          />
        </div>
      ) : null}
    </motion.div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */

export function CompanyPulse({ config, activeAudience, isLoading = false }: CompanyPulseProps): React.JSX.Element {
  const tier = useResponsiveTier();
  const reducedMotion = usePrefersReducedMotion();

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
      style={rootStyle}
      data-hbc-premium="newsroom-surface"
    >
      {/* Header */}
      <div style={getHeaderStyle(tier)}>
        <h2 style={headerTitleStyle}>
          <span style={headerIconStyle} aria-hidden="true">
            <FileText size={16} strokeWidth={2} />
          </span>
          {normalized.heading}
        </h2>
        {normalized.archiveHref ? (
          <HbcPremiumCta
            label="See all"
            href={normalized.archiveHref}
            variant="ghost"
            size="sm"
            arrow
          />
        ) : null}
      </div>

      <hr style={separatorStyle} />

      {/* Content */}
      {hasLead && hasSecondary ? (
        /* Rich layout: lead + headline stack side by side */
        <>
          <div style={getCompositionStyle(tier)}>
            <div style={getFeaturedWrapperStyle(tier)}>
              <NewsroomFeaturedStory
                item={normalized.lead!}
                tier={tier}
                reducedMotion={reducedMotion}
              />
            </div>
            <div style={getRailWrapperStyle(tier)}>
              <NewsroomHeadlineStack
                items={normalized.secondary}
                tier={tier}
                reducedMotion={reducedMotion}
                header="More headlines"
              />
            </div>
          </div>
          <TertiaryZone
            items={normalized.tertiary}
            archiveHref={normalized.archiveHref}
            tier={tier}
          />
        </>
      ) : hasLead ? (
        /* Sparse layout: lead story only */
        <SparseLayout
          archiveHref={normalized.archiveHref}
          tier={tier}
          reducedMotion={reducedMotion}
        >
          <NewsroomFeaturedStory
            item={normalized.lead!}
            tier={tier}
            reducedMotion={reducedMotion}
          />
        </SparseLayout>
      ) : (
        /* No lead but has secondary — promote first secondary to featured-like */
        <>
          <div style={getCompositionStyle(tier)}>
            <div style={{ flex: '1 1 100%', minWidth: 0 }}>
              <NewsroomHeadlineStack
                items={normalized.secondary}
                tier={tier}
                reducedMotion={reducedMotion}
                header="Latest headlines"
              />
            </div>
          </div>
          <TertiaryZone
            items={normalized.tertiary}
            archiveHref={normalized.archiveHref}
            tier={tier}
          />
        </>
      )}
    </section>
  );
}
