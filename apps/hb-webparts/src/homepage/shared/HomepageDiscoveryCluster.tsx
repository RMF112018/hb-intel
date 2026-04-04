import * as React from 'react';
import type {
  DiscoveryQuickPath,
} from '../webparts/discoveryContracts.js';
import type {
  NormalizedDiscoveryCategoryGroup,
  NormalizedDiscoveryResource,
} from '../helpers/discoveryConfig.js';

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
      <h2 style={{ margin: 0 }}>{heading}</h2>
      <p style={{ margin: '8px 0 0', opacity: 0.75 }}>{strategyLabel}</p>

      <div style={{ marginTop: 10 }}>
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
          style={{
            width: '100%',
            marginTop: 6,
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.25)',
          }}
        />
      </div>

      {quickPaths.length > 0 ? (
        <nav aria-label="Quick paths" style={{ marginTop: 12 }}>
          <h3 style={{ margin: '0 0 8px' }}>Quick Paths</h3>
          <ul style={{ margin: 0, paddingInlineStart: 18, display: 'grid', gap: 6 }}>
            {quickPaths.map((path) => (
              <li key={path.id}>
                <a href={path.href}>{path.title}</a>
                {path.description ? <span style={{ marginLeft: 6, opacity: 0.75 }}>{path.description}</span> : null}
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {promotedResources.length > 0 ? (
        <section aria-label="Promoted destinations" style={{ marginTop: 12 }}>
          <h3 style={{ margin: '0 0 8px' }}>Promoted Destinations</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {promotedResources.map((resource) => (
              <article key={resource.id} style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: 10 }}>
                <a href={resource.href}>
                  <span aria-hidden="true" style={{ marginRight: 8 }}>
                    {iconToken(resource.iconKey)}
                  </span>
                  <span>{resource.title}</span>
                </a>
                {resource.description ? <p style={{ margin: '6px 0 0' }}>{resource.description}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {categoryGroups.length > 0 ? (
        <section aria-label="Discovery categories" style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          {categoryGroups.map((group) => (
            <section key={group.id} aria-label={group.title} style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: 10 }}>
              <h3 style={{ margin: 0 }}>{group.title}</h3>
              {group.description ? <p style={{ margin: '6px 0 0', opacity: 0.75 }}>{group.description}</p> : null}
              <ul style={{ margin: '8px 0 0', paddingInlineStart: 18, display: 'grid', gap: 6 }}>
                {group.resources.map((resource) => (
                  <li key={resource.id}>
                    <a href={resource.href}>
                      <span aria-hidden="true" style={{ marginRight: 8 }}>
                        {iconToken(resource.iconKey)}
                      </span>
                      <span>{resource.title}</span>
                    </a>
                    {resource.description ? <span style={{ marginLeft: 6, opacity: 0.75 }}>{resource.description}</span> : null}
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
