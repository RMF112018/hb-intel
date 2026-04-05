/**
 * HomepageDiscoveryCluster — Discovery zone composition (Phase C)
 *
 * Premiumized discovery surface with:
 * - anchored search posture with framed input
 * - quick-path shortcut rows with icon frames and directional arrows
 * - promoted destination tiles with medium icon treatment
 * - category-group cards with improved scan rhythm
 *
 * Uses shared primitives from @hbc/ui-kit/homepage:
 * - HbcHomepageSectionShell for section structure
 * - HbcHomepageActionRow for promoted resources and category items
 * - HbcHomepageIconFrame for icon containers
 * - HbcHomepageSurfaceCard for category group cards
 */
import * as React from 'react';
import {
  HbcHomepageSectionShell,
  HbcHomepageActionRow,
  HbcHomepageIconFrame,
  HbcHomepageSurfaceCard,
} from '@hbc/ui-kit/homepage';
import type {
  DiscoveryQuickPath,
} from '../webparts/discoveryContracts.js';
import type {
  NormalizedDiscoveryCategoryGroup,
  NormalizedDiscoveryResource,
} from '../helpers/discoveryConfig.js';
import { resolveDiscoveryIconContent } from '../helpers/iconResolver.js';
import { HP_SPACE, HP_RADIUS, HP_BORDER, hpSearchInput } from '../tokens.js';
import interactiveStyles from '../homepage-interactive.module.css';

export interface HomepageDiscoveryClusterProps {
  heading: string;
  searchPlaceholder: string;
  query: string;
  onQueryChange: (nextQuery: string) => void;
  quickPaths: DiscoveryQuickPath[];
  promotedResources: NormalizedDiscoveryResource[];
  categoryGroups: NormalizedDiscoveryCategoryGroup[];
  strategyLabel: string;
}

// ── Style constants ────────────────────────────────────────────────

const searchAreaStyle: React.CSSProperties = {
  marginTop: HP_SPACE.lg,
  padding: HP_SPACE['2xl'],
  background: 'rgba(0,0,0,0.015)',
  borderRadius: HP_RADIUS.card,
  border: HP_BORDER.subtle,
};

const sectionHeadingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.8125rem',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  opacity: 0.65,
};

const subheadingStyle: React.CSSProperties = {
  margin: `0 0 ${HP_SPACE.md}px`,
  fontWeight: 600,
};

const promotedGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.lg,
  marginTop: HP_SPACE.xl,
};

const categoryGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.lg,
  marginTop: HP_SPACE.xl,
};

const itemGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.sm,
};

// ── Quick-path row ─────────────────────────────────────────────────

function QuickPathRow({ path }: { path: DiscoveryQuickPath }): React.JSX.Element {
  return (
    <div className={interactiveStyles.actionRowContainer}>
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <HbcHomepageActionRow
          title={path.title}
          href={path.href}
          description={path.description}
          icon={
            <HbcHomepageIconFrame size="sm" tint="brand">
              {'\u2192'}
            </HbcHomepageIconFrame>
          }
        />
      </div>
      <span className={interactiveStyles.actionRowArrow} aria-hidden="true">{'\u203A'}</span>
    </div>
  );
}

// ── Promoted destination tile ──────────────────────────────────────

function PromotedDestinationTile({ resource }: { resource: NormalizedDiscoveryResource }): React.JSX.Element {
  return (
    <div className={interactiveStyles.actionRowContainer}>
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <HbcHomepageActionRow
          title={resource.title}
          href={resource.href}
          description={resource.description}
          icon={
            <HbcHomepageIconFrame size="md" tint="brand">
              {resolveDiscoveryIconContent(resource.iconKey)}
            </HbcHomepageIconFrame>
          }
        />
      </div>
      <span className={interactiveStyles.actionRowArrow} aria-hidden="true">{'\u203A'}</span>
    </div>
  );
}

// ── Category resource row ──────────────────────────────────────────

function CategoryResourceRow({ resource }: { resource: NormalizedDiscoveryResource }): React.JSX.Element {
  return (
    <div className={interactiveStyles.actionRowContainer}>
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <HbcHomepageActionRow
          title={resource.title}
          href={resource.href}
          description={resource.description}
          icon={
            <HbcHomepageIconFrame size="sm" tint="subtle">
              {resolveDiscoveryIconContent(resource.iconKey)}
            </HbcHomepageIconFrame>
          }
        />
      </div>
      <span className={interactiveStyles.actionRowArrow} aria-hidden="true">{'\u203A'}</span>
    </div>
  );
}

// ── Main composition ───────────────────────────────────────────────

export function HomepageDiscoveryCluster({
  heading,
  searchPlaceholder,
  query,
  onQueryChange,
  quickPaths,
  promotedResources,
  categoryGroups,
  strategyLabel,
}: HomepageDiscoveryClusterProps): React.JSX.Element {
  return (
    <HbcHomepageSectionShell title={heading} subtitle={strategyLabel}>
      {/* Search area — framed container anchoring the surface */}
      <div style={searchAreaStyle}>
        <label htmlFor="smart-search-query" style={sectionHeadingStyle}>
          Search resources
        </label>
        <input
          id="smart-search-query"
          aria-label="Search resources"
          value={query}
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder={searchPlaceholder}
          type="search"
          className={interactiveStyles.searchInput}
          style={{ ...hpSearchInput, marginTop: HP_SPACE.sm }}
        />
      </div>

      {/* Quick Paths — shortcut rows with icon and directional arrow */}
      {quickPaths.length > 0 ? (
        <nav aria-label="Quick paths" style={{ marginTop: HP_SPACE.xl }}>
          <h3 style={sectionHeadingStyle}>Quick Paths</h3>
          <div style={{ ...itemGridStyle, marginTop: HP_SPACE.md }}>
            {quickPaths.map((path) => (
              <QuickPathRow key={path.id} path={path} />
            ))}
          </div>
        </nav>
      ) : null}

      {/* Promoted Destinations — medium-icon tiles */}
      {promotedResources.length > 0 ? (
        <section aria-label="Promoted destinations" style={promotedGridStyle}>
          <h3 style={sectionHeadingStyle}>Promoted Destinations</h3>
          {promotedResources.map((resource) => (
            <PromotedDestinationTile key={resource.id} resource={resource} />
          ))}
        </section>
      ) : null}

      {/* Category Groups — framed cards with improved rhythm */}
      {categoryGroups.length > 0 ? (
        <section aria-label="Discovery categories" style={categoryGridStyle}>
          {categoryGroups.map((group) => (
            <HbcHomepageSurfaceCard key={group.id} surface="discovery">
              <h3 style={subheadingStyle}>{group.title}</h3>
              {group.description ? (
                <p style={{ margin: `0 0 ${HP_SPACE.md}px`, opacity: 0.65, fontSize: '0.875rem' }}>
                  {group.description}
                </p>
              ) : null}
              <div style={itemGridStyle}>
                {group.resources.map((resource) => (
                  <CategoryResourceRow key={resource.id} resource={resource} />
                ))}
              </div>
            </HbcHomepageSurfaceCard>
          ))}
        </section>
      ) : null}
    </HbcHomepageSectionShell>
  );
}
