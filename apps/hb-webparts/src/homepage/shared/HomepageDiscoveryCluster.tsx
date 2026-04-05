import * as React from 'react';
import type {
  DiscoveryQuickPath,
} from '../webparts/discoveryContracts.js';
import type {
  NormalizedDiscoveryCategoryGroup,
  NormalizedDiscoveryResource,
} from '../helpers/discoveryConfig.js';
import {
  HP_SPACE, HP_TEXT_OPACITY,
  hpHeadingReset, hpSecondaryText, hpSecondaryCard, hpListStyle, hpSearchInput,
} from '../tokens.js';

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

function iconToken(iconKey: string | undefined): string {
  if (!iconKey) {
    return 'NAV';
  }
  return iconKey.slice(0, 3).toUpperCase();
}

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
    <section aria-label={heading}>
      <h2 style={hpHeadingReset}>{heading}</h2>
      <p style={hpSecondaryText}>{strategyLabel}</p>

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
          style={hpSearchInput}
        />
      </div>

      {quickPaths.length > 0 ? (
        <nav aria-label="Quick paths" style={{ marginTop: HP_SPACE.xl }}>
          <h3 style={{ margin: `0 0 ${HP_SPACE.md}px` }}>Quick Paths</h3>
          <ul style={hpListStyle}>
            {quickPaths.map((path) => (
              <li key={path.id}>
                <a href={path.href}>{path.title}</a>
                {path.description ? <span style={{ marginLeft: HP_SPACE.sm, opacity: HP_TEXT_OPACITY.secondary }}>{path.description}</span> : null}
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {promotedResources.length > 0 ? (
        <section aria-label="Promoted destinations" style={{ marginTop: HP_SPACE.xl }}>
          <h3 style={{ margin: `0 0 ${HP_SPACE.md}px` }}>Promoted Destinations</h3>
          <div style={{ display: 'grid', gap: HP_SPACE.md }}>
            {promotedResources.map((resource) => (
              <article key={resource.id} style={hpSecondaryCard}>
                <a href={resource.href}>
                  <span aria-hidden="true" style={{ marginRight: HP_SPACE.md }}>
                    {iconToken(resource.iconKey)}
                  </span>
                  <span>{resource.title}</span>
                </a>
                {resource.description ? <p style={{ margin: `${HP_SPACE.sm}px 0 0` }}>{resource.description}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {categoryGroups.length > 0 ? (
        <section aria-label="Discovery categories" style={{ marginTop: HP_SPACE.xl, display: 'grid', gap: HP_SPACE.lg }}>
          {categoryGroups.map((group) => (
            <section key={group.id} aria-label={group.title} style={hpSecondaryCard}>
              <h3 style={hpHeadingReset}>{group.title}</h3>
              {group.description ? <p style={{ margin: `${HP_SPACE.sm}px 0 0`, opacity: HP_TEXT_OPACITY.secondary }}>{group.description}</p> : null}
              <ul style={hpListStyle}>
                {group.resources.map((resource) => (
                  <li key={resource.id}>
                    <a href={resource.href}>
                      <span aria-hidden="true" style={{ marginRight: HP_SPACE.md }}>
                        {iconToken(resource.iconKey)}
                      </span>
                      <span>{resource.title}</span>
                    </a>
                    {resource.description ? <span style={{ marginLeft: HP_SPACE.sm, opacity: HP_TEXT_OPACITY.secondary }}>{resource.description}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </section>
      ) : null}
    </section>
  );
}
