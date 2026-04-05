/**
 * HomepageDiscoveryCluster — Premium discovery surface composition
 * Phase 15-06 — Discovery and launcher productization
 *
 * A productized discovery experience with:
 * - prominent search entry with warm-themed container and search affordance
 * - icon-forward quick-path shortcuts with warm tint
 * - featured promoted destinations with xl icon frames
 * - authored category groups with warm accent headers
 *
 * The discovery zone must feel like a destination within the homepage,
 * not an afterthought search box at the bottom.
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
import { HP_SPACE, HP_RADIUS } from '../tokens.js';
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

/** Premium search container — warm-themed, prominent, inviting */
const searchAreaStyle: React.CSSProperties = {
  marginTop: HP_SPACE.lg,
  padding: `${HP_SPACE['2xl']}px ${HP_SPACE['2xl']}px`,
  background: 'linear-gradient(135deg, rgba(229, 126, 70, 0.04) 0%, rgba(229, 126, 70, 0.02) 100%)',
  borderRadius: HP_RADIUS.editorial,
  border: '1px solid rgba(229, 126, 70, 0.12)',
};

/** Search input — larger, more prominent, warm accent on focus */
const searchInputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: HP_SPACE.md,
  padding: `${HP_SPACE.xl}px ${HP_SPACE['2xl']}px`,
  borderRadius: HP_RADIUS.card,
  border: '2px solid rgba(229, 126, 70, 0.15)',
  outline: 'none',
  fontSize: '0.9375rem',
  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  background: 'rgba(255, 255, 255, 0.8)',
  color: '#323130',
};

const searchLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  color: 'rgba(180, 90, 40, 0.7)',
};

/** Section sub-heading for discovery zones */
const zoneLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  color: 'rgba(229, 126, 70, 0.7)',
  paddingBottom: HP_SPACE.md,
  borderBottom: '2px solid rgba(229, 126, 70, 0.15)',
  marginBottom: HP_SPACE.md,
};

const promotedGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.xl,
  marginTop: HP_SPACE.xl,
};

const categoryGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.xl,
  marginTop: HP_SPACE.xl,
};

const itemGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.sm,
};

/** Category group header — warm accent */
const categoryHeadingStyle: React.CSSProperties = {
  margin: `0 0 ${HP_SPACE.md}px`,
  fontSize: '0.875rem',
  fontWeight: 700,
  color: '#323130',
};

// ── Quick-path row ─────────────────────────────────────────────────

function QuickPathRow({ path }: { path: DiscoveryQuickPath }): React.JSX.Element {
  return (
    <div className={interactiveStyles.actionRowContainer} style={{ padding: `${HP_SPACE.sm}px ${HP_SPACE.md}px` }}>
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <HbcHomepageActionRow
          title={path.title}
          href={path.href}
          description={path.description}
          icon={
            <HbcHomepageIconFrame size="md" tint="warm">
              {resolveDiscoveryIconContent(path.iconKey)}
            </HbcHomepageIconFrame>
          }
        />
      </div>
      <span className={interactiveStyles.actionRowArrow} aria-hidden="true">{'\u203A'}</span>
    </div>
  );
}

// ── Promoted destination tile — featured treatment ─────────────────

const promotedTileStyle: React.CSSProperties = {
  padding: `${HP_SPACE.md}px ${HP_SPACE.xl}px`,
  background: 'rgba(229, 126, 70, 0.03)',
  borderRadius: HP_RADIUS.card,
  border: '1px solid rgba(229, 126, 70, 0.10)',
};

function PromotedDestinationTile({ resource }: { resource: NormalizedDiscoveryResource }): React.JSX.Element {
  return (
    <div className={interactiveStyles.actionRowContainer} style={promotedTileStyle}>
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <HbcHomepageActionRow
          title={resource.title}
          href={resource.href}
          description={resource.description}
          icon={
            <HbcHomepageIconFrame size="xl" tint="warm">
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
    <div className={interactiveStyles.actionRowContainer} style={{ padding: `${HP_SPACE.sm}px ${HP_SPACE.md}px` }}>
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
    <HbcHomepageSectionShell title={heading} subtitle={strategyLabel} accent="warm">
      {/* Search area — premium warm-themed container */}
      <div style={searchAreaStyle}>
        <label htmlFor="smart-search-query" style={searchLabelStyle}>
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
          style={searchInputStyle}
        />
      </div>

      {/* Quick Paths — warm-tinted icon shortcuts */}
      {quickPaths.length > 0 ? (
        <nav aria-label="Quick paths" style={{ marginTop: HP_SPACE.xl }}>
          <h3 style={zoneLabelStyle}>Quick Paths</h3>
          <div style={{ ...itemGridStyle, marginTop: HP_SPACE.md }}>
            {quickPaths.map((path) => (
              <QuickPathRow key={path.id} path={path} />
            ))}
          </div>
        </nav>
      ) : null}

      {/* Promoted Destinations — featured xl-icon tiles */}
      {promotedResources.length > 0 ? (
        <section aria-label="Promoted destinations" style={promotedGridStyle}>
          <h3 style={zoneLabelStyle}>Promoted Destinations</h3>
          {promotedResources.map((resource) => (
            <PromotedDestinationTile key={resource.id} resource={resource} />
          ))}
        </section>
      ) : null}

      {/* Category Groups — authored cards with warm accent */}
      {categoryGroups.length > 0 ? (
        <section aria-label="Discovery categories" style={categoryGridStyle}>
          {categoryGroups.map((group) => (
            <HbcHomepageSurfaceCard key={group.id} surface="discovery">
              <h3 style={categoryHeadingStyle}>{group.title}</h3>
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
