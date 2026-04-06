/**
 * ProjectPortfolioSpotlight — Premium editorial spotlight surface
 * Phase P05-02 — Featured spotlight anatomy and desktop composition
 *
 * Image-led editorial composition with warm accent styling aligned
 * with HbcEditorialSurface. Featured spotlight is the dominant surface;
 * supporting rail is deferred to Phase 03.
 */
import * as React from 'react';
import {
  HbcPremiumCta,
  HbcPremiumBadge,
  HbcHomepageEyebrow,
  HbcHomepageMetadataRow,
  motion,
  Calendar,
  CheckCircle2,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeProjectPortfolioSpotlightConfig } from '../../homepage/helpers/operationalAwarenessConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { ProjectPortfolioSpotlightConfig } from '../../homepage/webparts/operationalAwarenessContracts.js';
import {
  HP_SPACE,
  HP_RADIUS,
  HP_IMAGE,
} from '../../homepage/tokens.js';

export interface ProjectPortfolioSpotlightProps {
  config?: Partial<ProjectPortfolioSpotlightConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

/* ── Warm accent palette (aligned with HbcEditorialSurface) ─────── */
const WARM = {
  accent: 'rgb(229, 126, 70)',
  dark: '#c26434',
  border: 'rgba(229, 126, 70, 0.40)',
  borderSubtle: 'rgba(0, 0, 0, 0.06)',
  separator: 'linear-gradient(90deg, rgba(229, 126, 70, 0.30) 0%, rgba(229, 126, 70, 0.05) 100%)',
  eyebrow: 'rgba(229, 126, 70, 0.70)',
  iconBg: 'rgba(229, 126, 70, 0.08)',
  scrim: 'linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.08) 40%, transparent 100%)',
} as const;

/* ── Style objects ──────────────────────────────────────────────── */

const rootStyle: React.CSSProperties = {
  fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  color: '#1a1a1a',
  background: '#ffffff',
  borderRadius: HP_RADIUS.editorial,
  borderLeft: `3px solid ${WARM.border}`,
  borderTop: `1px solid ${WARM.borderSubtle}`,
  borderRight: `1px solid ${WARM.borderSubtle}`,
  borderBottom: `1px solid ${WARM.borderSubtle}`,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  padding: `${HP_SPACE['3xl']}px ${HP_SPACE['2xl']}px ${HP_SPACE.xl}px`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: HP_SPACE.xl,
};

const headerTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9375rem',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
};

const separatorStyle: React.CSSProperties = {
  height: 2,
  background: WARM.separator,
  margin: `0 ${HP_SPACE['2xl']}px`,
  border: 'none',
};

const featuredLayoutStyle: React.CSSProperties = {
  display: 'flex',
  gap: 0,
};

const imageZoneStyle: React.CSSProperties = {
  position: 'relative',
  flex: '0 0 48%',
  minHeight: 280,
  overflow: 'hidden',
  backgroundColor: 'rgba(0, 0, 0, 0.04)',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: HP_IMAGE.objectFit,
  objectPosition: 'center',
  display: 'block',
};

const imageScrimStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: WARM.scrim,
  pointerEvents: 'none',
};

const imagePlaceholderStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: 280,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(229, 126, 70, 0.06) 0%, rgba(34, 83, 145, 0.04) 100%)',
  color: 'rgba(0, 0, 0, 0.20)',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
};

const contentZoneStyle: React.CSSProperties = {
  flex: '1 1 52%',
  padding: `${HP_SPACE['3xl']}px ${HP_SPACE['2xl']}px`,
  display: 'flex',
  flexDirection: 'column',
  gap: HP_SPACE.md,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.375rem',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: 1.2,
  color: '#1a1a1a',
};

const headlineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9375rem',
  fontWeight: 500,
  lineHeight: 1.5,
  color: 'rgba(26, 26, 26, 0.75)',
};

const summaryStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.8125rem',
  lineHeight: 1.55,
  color: 'rgba(26, 26, 26, 0.60)',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical' as unknown as React.CSSProperties['WebkitBoxOrient'],
  overflow: 'hidden',
};

const badgeRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: HP_SPACE.sm,
  flexWrap: 'wrap',
};

const metaIconStyle: React.CSSProperties = {
  opacity: 0.5,
  flexShrink: 0,
};

const metaItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

const teamStripPlaceholderStyle: React.CSSProperties = {
  minHeight: 32,
};

const ctaWrapperStyle: React.CSSProperties = {
  marginTop: 'auto',
  paddingTop: HP_SPACE.md,
};

/* ── Featured reveal animation ──────────────────────────────────── */
const featuredMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
};

/* ── Component ──────────────────────────────────────────────────── */

export function ProjectPortfolioSpotlight({
  config,
  activeAudience,
  isLoading = false,
}: ProjectPortfolioSpotlightProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading project spotlight" />;
  }

  const normalized = normalizeProjectPortfolioSpotlightConfig(config, activeAudience);

  if (!normalized.featured && normalized.secondary.length === 0) {
    const message = resolveAuthoringMessage(
      'projectPortfolioSpotlight',
      config?.items?.length ? 'invalid' : 'noData',
    );
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const feat = normalized.featured;
  if (!feat) {
    const message = resolveAuthoringMessage('projectPortfolioSpotlight', 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const eyebrowText = [feat.sector, feat.location].filter(Boolean).join(' \u00B7 ') || 'Featured Project';
  const completedMilestones = feat.milestones.filter((m) => m.completed).length;
  const totalMilestones = feat.milestones.length;

  return (
    <section
      data-hbc-homepage="project-spotlight"
      aria-label={normalized.heading}
      style={rootStyle}
    >
      {/* Header */}
      <div style={headerStyle}>
        <h2 style={headerTitleStyle}>{normalized.heading}</h2>
        {feat.cta ? (
          <HbcPremiumCta
            label="View all projects"
            href={feat.cta.href}
            variant="ghost"
            size="sm"
            arrow
          />
        ) : null}
      </div>

      {/* Separator */}
      <div role="separator" style={separatorStyle} />

      {/* Featured spotlight */}
      <motion.div
        style={featuredLayoutStyle}
        {...featuredMotion}
      >
        {/* Image zone */}
        <div style={imageZoneStyle}>
          {feat.image ? (
            <>
              <img
                src={feat.image.src}
                alt={feat.image.alt || feat.title}
                style={imageStyle}
                loading="lazy"
              />
              <div style={imageScrimStyle} aria-hidden="true" />
            </>
          ) : (
            <div style={imagePlaceholderStyle} aria-hidden="true">
              Project Image
            </div>
          )}
        </div>

        {/* Content zone */}
        <div style={contentZoneStyle}>
          <HbcHomepageEyebrow>{eyebrowText}</HbcHomepageEyebrow>

          <h3 style={titleStyle}>{feat.title}</h3>

          {feat.highlightHeadline ? (
            <p style={headlineStyle}>{feat.highlightHeadline}</p>
          ) : null}

          {/* Metadata row — milestone + freshness */}
          {(totalMilestones > 0 || feat.freshnessLabel) ? (
            <HbcHomepageMetadataRow separated>
              {totalMilestones > 0 ? (
                <span style={metaItemStyle}>
                  <CheckCircle2 size={11} aria-hidden="true" style={metaIconStyle} />
                  {completedMilestones}/{totalMilestones} milestones
                </span>
              ) : null}
              {feat.freshnessLabel ? (
                <span style={metaItemStyle}>
                  <Calendar size={11} aria-hidden="true" style={metaIconStyle} />
                  {feat.freshnessLabel}
                </span>
              ) : null}
            </HbcHomepageMetadataRow>
          ) : null}

          {/* Summary */}
          <p style={summaryStyle}>{feat.summary}</p>

          {/* Badges — restrained: status only, strategic only when flagged */}
          {(feat.status || feat.strategicEmphasis) ? (
            <div style={badgeRowStyle}>
              {feat.status ? (
                <HbcPremiumBadge label={feat.status.label} status={feat.status.variant ?? 'info'} size="sm" />
              ) : null}
              {feat.strategicEmphasis ? (
                <HbcPremiumBadge label="Strategic" status="info" size="sm" />
              ) : null}
            </div>
          ) : null}

          {/* Team strip placeholder — reserved for Phase 05 */}
          <div
            data-slot="team-strip"
            style={teamStripPlaceholderStyle}
            aria-hidden="true"
          />

          {/* Primary CTA */}
          {feat.cta ? (
            <div style={ctaWrapperStyle}>
              <HbcPremiumCta
                label={feat.cta.label}
                href={feat.cta.href}
                variant="secondary"
                size="sm"
                arrow
              />
            </div>
          ) : null}
        </div>
      </motion.div>
    </section>
  );
}
