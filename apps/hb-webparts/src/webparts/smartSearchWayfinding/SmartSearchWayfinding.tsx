import * as React from 'react';
import { HbcCard } from '@hbc/ui-kit/homepage';
import { normalizeSmartSearchWayfindingConfig } from '../../homepage/helpers/discoveryConfig.js';
import { HomepageDiscoveryCluster } from '../../homepage/shared/HomepageDiscoveryCluster.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { SmartSearchWayfindingConfig } from '../../homepage/webparts/discoveryContracts.js';

export interface SmartSearchWayfindingProps {
  config?: Partial<SmartSearchWayfindingConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

export function SmartSearchWayfinding({
  config,
  activeAudience,
  isLoading = false,
}: SmartSearchWayfindingProps): React.JSX.Element {
  const [query, setQuery] = React.useState('');

  if (isLoading) {
    return <HomepageLoadingState label="Loading smart search and wayfinding" />;
  }

  const baseNormalized = normalizeSmartSearchWayfindingConfig(config, activeAudience, '');
  const normalized = normalizeSmartSearchWayfindingConfig(config, activeAudience, query);
  const hasDiscoverySurface =
    baseNormalized.hasResources || baseNormalized.quickPaths.length > 0;

  if (!hasDiscoverySurface) {
    return (
      <HomepageEmptyState
        title="No discovery resources configured"
        description="Add categories, resources, or quick paths in the property pane to publish smart search and wayfinding."
      />
    );
  }

  const hasQueryNoResults =
    query.trim().length > 0 &&
    normalized.categoryGroups.length === 0 &&
    normalized.promotedResources.length === 0;

  if (hasQueryNoResults) {
    return (
      <HbcCard>
        <HomepageDiscoveryCluster
          heading={normalized.heading}
          searchPlaceholder={normalized.searchPlaceholder}
          query={query}
          onQueryChange={setQuery}
          quickPaths={baseNormalized.quickPaths}
          promotedResources={[]}
          categoryGroups={[]}
          strategyLabel={normalized.strategyLabel}
        />
        <HomepageEmptyState
          title="No matching resources found"
          description="Try another keyword or clear search to see all curated resources."
        />
      </HbcCard>
    );
  }

  return (
    <HbcCard>
      <HomepageDiscoveryCluster
        heading={normalized.heading}
        searchPlaceholder={normalized.searchPlaceholder}
        query={query}
        onQueryChange={setQuery}
        quickPaths={normalized.quickPaths}
        promotedResources={normalized.promotedResources}
        categoryGroups={normalized.categoryGroups}
        strategyLabel={normalized.strategyLabel}
      />
    </HbcCard>
  );
}
