import * as React from 'react';
import { HbcCard } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
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
    const hasConfiguredInput = Boolean(config?.resources?.length || config?.quickPaths?.length || config?.categories?.length);
    const message = resolveAuthoringMessage('smartSearchWayfinding', hasConfiguredInput ? 'invalid' : 'noData');
    return (
      <HomepageEmptyState
        title={message.title}
        description={message.description}
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
          title={resolveAuthoringMessage('smartSearchWayfinding', 'noResults').title}
          description={resolveAuthoringMessage('smartSearchWayfinding', 'noResults').description}
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
