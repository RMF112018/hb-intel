/**
 * ProjectPortfolioSpotlight — Strategic operational intelligence surface
 * Phase 15-08 — Operational intelligence redesign
 *
 * Dashboard-adjacent project/portfolio intelligence with strategic
 * emphasis badges, structured status presentation, milestone tracking,
 * and deliberate freshness treatment. Visually reads as a high-value
 * business module, not an editorial card with badges.
 */
import * as React from 'react';
import { HbcHomepageCta, HbcHomepageMetadataRow, HbcStatusBadge, HbcHomepageEyebrow } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeProjectPortfolioSpotlightConfig } from '../../homepage/helpers/operationalAwarenessConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { HomepageOperationalAwarenessCluster } from '../../homepage/shared/HomepageOperationalAwarenessCluster.js';
import type { ProjectPortfolioSpotlightConfig } from '../../homepage/webparts/operationalAwarenessContracts.js';
import { HP_SPACE } from '../../homepage/tokens.js';

export interface ProjectPortfolioSpotlightProps {
  config?: Partial<ProjectPortfolioSpotlightConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

/** Featured project title — structured, authoritative */
const featuredTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.125rem',
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: '-0.01em',
  color: 'rgb(34, 83, 145)',
};

/** Featured summary — dashboard-grade readability */
const featuredSummaryStyle: React.CSSProperties = {
  margin: `${HP_SPACE.md}px 0 0`,
  fontSize: '0.9375rem',
  lineHeight: 1.6,
  maxWidth: '55ch',
  color: 'rgba(0, 0, 0, 0.75)',
};

/** Status strip — horizontal rail of status indicators */
const statusStripStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: HP_SPACE.md,
  alignItems: 'center',
  padding: `${HP_SPACE.md}px 0`,
  marginTop: HP_SPACE.md,
  borderTop: '1px solid rgba(34, 83, 145, 0.08)',
  borderBottom: '1px solid rgba(34, 83, 145, 0.08)',
};

/** Milestone list — structured operational tracking */
const milestoneListStyle: React.CSSProperties = {
  margin: `${HP_SPACE.xl}px 0 0`,
  padding: 0,
  listStyle: 'none',
  display: 'grid',
  gap: HP_SPACE.sm,
};

/** Milestone item — status-aware row */
const milestoneItemStyle = (completed: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
  padding: `${HP_SPACE.sm}px ${HP_SPACE.md}px`,
  fontSize: '0.875rem',
  lineHeight: 1.4,
  background: completed ? 'rgba(34, 83, 145, 0.02)' : 'transparent',
  borderRadius: 4,
  color: completed ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.75)',
  textDecoration: completed ? 'line-through' : 'none',
});

/** Milestone indicator */
const milestoneIndicatorStyle = (completed: boolean): React.CSSProperties => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: completed ? 'rgba(34, 83, 145, 0.3)' : 'rgb(34, 83, 145)',
  flexShrink: 0,
});

/** Freshness label — operational metadata */
const freshnessStyle: React.CSSProperties = {
  margin: `${HP_SPACE.md}px 0 0`,
  fontSize: '0.75rem',
  fontWeight: 500,
  letterSpacing: '0.02em',
  opacity: 0.5,
};

/** Secondary project title */
const secondaryTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9375rem',
  fontWeight: 600,
  lineHeight: 1.4,
};

/** Secondary summary */
const secondarySummaryStyle: React.CSSProperties = {
  margin: `${HP_SPACE.sm}px 0 0`,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  color: 'rgba(0, 0, 0, 0.65)',
};

export function ProjectPortfolioSpotlight({
  config,
  activeAudience,
  isLoading = false,
}: ProjectPortfolioSpotlightProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading project and portfolio spotlight" />;
  }

  const normalized = normalizeProjectPortfolioSpotlightConfig(config, activeAudience);

  if (!normalized.featured && normalized.secondary.length === 0) {
    const message = resolveAuthoringMessage('projectPortfolioSpotlight', config?.items?.length ? 'invalid' : 'noData');
    return (
      <HomepageEmptyState
        title={message.title}
        description={message.description}
      />
    );
  }

  return (
    <HomepageOperationalAwarenessCluster
      heading={normalized.heading}
      variant="strategic"
      featured={
        normalized.featured ? (
          <article>
            {normalized.featured.strategicEmphasis ? (
              <HbcHomepageEyebrow tone="default">Strategic Initiative</HbcHomepageEyebrow>
            ) : null}
            <h3 style={featuredTitleStyle}>{normalized.featured.title}</h3>

            {/* Status strip — structured horizontal rail */}
            <div style={statusStripStyle}>
              {normalized.featured.strategicEmphasis ? <HbcStatusBadge label="Strategic" variant="critical" /> : null}
              {normalized.featured.status ? (
                <HbcStatusBadge
                  label={normalized.featured.status.label}
                  variant={normalized.featured.status.variant ?? 'info'}
                />
              ) : null}
              {normalized.featured.isStale ? <HbcStatusBadge label="Stale" variant="warning" /> : null}
            </div>

            <p style={featuredSummaryStyle}>{normalized.featured.summary}</p>

            {/* Milestone tracking — structured list */}
            {normalized.featured.milestones.length > 0 ? (
              <ul style={milestoneListStyle}>
                {normalized.featured.milestones.map((milestone) => (
                  <li key={milestone.id} style={milestoneItemStyle(milestone.completed ?? false)}>
                    <span style={milestoneIndicatorStyle(milestone.completed ?? false)} aria-hidden="true" />
                    <span>{milestone.title}</span>
                    {milestone.completed ? <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>(Done)</span> : null}
                  </li>
                ))}
              </ul>
            ) : null}

            {normalized.featured.freshnessLabel ? (
              <p style={freshnessStyle}>{normalized.featured.freshnessLabel}</p>
            ) : null}
            {normalized.featured.cta ? (
              <div style={{ marginTop: HP_SPACE.xl }}>
                <HbcHomepageCta label={normalized.featured.cta.label} href={normalized.featured.cta.href} variant="link" arrow />
              </div>
            ) : null}
          </article>
        ) : undefined
      }
      secondary={normalized.secondary.map((item) => (
        <article key={item.id}>
          <h3 style={secondaryTitleStyle}>{item.title}</h3>
          <HbcHomepageMetadataRow>
            {item.status ? <HbcStatusBadge label={item.status.label} variant={item.status.variant ?? 'info'} /> : null}
            {item.isStale ? <HbcStatusBadge label="Stale" variant="warning" /> : null}
          </HbcHomepageMetadataRow>
          <p style={secondarySummaryStyle}>{item.summary}</p>
          {item.freshnessLabel ? <p style={freshnessStyle}>{item.freshnessLabel}</p> : null}
          {item.cta ? (
            <div style={{ marginTop: HP_SPACE.md }}>
              <HbcHomepageCta label={item.cta.label} href={item.cta.href} variant="link" arrow />
            </div>
          ) : null}
        </article>
      ))}
    />
  );
}
