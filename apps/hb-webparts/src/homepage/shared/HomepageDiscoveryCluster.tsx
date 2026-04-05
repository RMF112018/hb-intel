/**
 * HomepageDiscoveryCluster — Discovery zone composition
 *
 * Uses shared primitives from @hbc/ui-kit/homepage:
 * - HbcHomepageSectionShell for section structure
 * - HbcHomepageActionRow for promoted resources and category items
 * - HbcHomepageIconFrame to replace placeholder text-token icons
 * - HbcHomepageCta for quick-path links
 * - HbcHomepageSurfaceCard for category group cards
 */
import * as React from 'react';
import {
  HbcHomepageSectionShell,
  HbcHomepageActionRow,
  HbcHomepageIconFrame,
  HbcHomepageCta,
  HbcHomepageSurfaceCard,
} from '@hbc/ui-kit/homepage';
import type {
  DiscoveryQuickPath,
} from '../webparts/discoveryContracts.js';
import type {
  NormalizedDiscoveryCategoryGroup,
  NormalizedDiscoveryResource,
} from '../helpers/discoveryConfig.js';
import { HP_SPACE, hpSearchInput } from '../tokens.js';
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

function iconInitials(iconKey: string | undefined): string {
  if (!iconKey) return '\u2022';
  return iconKey.slice(0, 2).toUpperCase();
}

const subheadingStyle: React.CSSProperties = {
  margin: `0 0 ${HP_SPACE.md}px`,
  fontWeight: 600,
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.md,
};

const categoryGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.lg,
  marginTop: HP_SPACE.xl,
};

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
      {/* Search */}
      <div style={{ marginTop: HP_SPACE.lg }}>
        <label htmlFor="smart-search-query" style={{ display: 'block', fontWeight: 600 }}>
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
          style={hpSearchInput}
        />
      </div>

      {/* Quick Paths */}
      {quickPaths.length > 0 ? (
        <nav aria-label="Quick paths" style={{ marginTop: HP_SPACE.xl }}>
          <h3 style={subheadingStyle}>Quick Paths</h3>
          <div style={gridStyle}>
            {quickPaths.map((path) => (
              <HbcHomepageCta
                key={path.id}
                label={path.title}
                href={path.href}
                variant="link"
                arrow
              />
            ))}
          </div>
        </nav>
      ) : null}

      {/* Promoted Resources */}
      {promotedResources.length > 0 ? (
        <section aria-label="Promoted destinations" style={{ marginTop: HP_SPACE.xl }}>
          <h3 style={subheadingStyle}>Promoted Destinations</h3>
          <div style={gridStyle}>
            {promotedResources.map((resource) => (
              <HbcHomepageActionRow
                key={resource.id}
                title={resource.title}
                href={resource.href}
                description={resource.description}
                icon={
                  <HbcHomepageIconFrame size="sm" tint="brand">
                    {iconInitials(resource.iconKey)}
                  </HbcHomepageIconFrame>
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Category Groups */}
      {categoryGroups.length > 0 ? (
        <section aria-label="Discovery categories" style={categoryGridStyle}>
          {categoryGroups.map((group) => (
            <HbcHomepageSurfaceCard key={group.id} surface="discovery">
              <h3 style={subheadingStyle}>{group.title}</h3>
              {group.description ? (
                <p style={{ margin: `0 0 ${HP_SPACE.md}px`, opacity: 0.75 }}>
                  {group.description}
                </p>
              ) : null}
              <div style={gridStyle}>
                {group.resources.map((resource) => (
                  <HbcHomepageActionRow
                    key={resource.id}
                    title={resource.title}
                    href={resource.href}
                    description={resource.description}
                    icon={
                      <HbcHomepageIconFrame size="sm" tint="subtle">
                        {iconInitials(resource.iconKey)}
                      </HbcHomepageIconFrame>
                    }
                  />
                ))}
              </div>
            </HbcHomepageSurfaceCard>
          ))}
        </section>
      ) : null}
    </HbcHomepageSectionShell>
  );
}
