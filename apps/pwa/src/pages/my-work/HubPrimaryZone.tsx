/**
 * HubPrimaryZone — P2-D2 §3 protected primary zone.
 *
 * Renders HbcMyWorkFeed directly. This zone MUST NOT be wrapped in
 * HbcProjectCanvas and MUST NOT support EditMode. The feed handles
 * its own truly-empty, filter-empty, and first-use empty states internally.
 *
 * P2-B3: Freshness indicator above feed shows trust-state cues.
 * UIF-008: Passes kpiFilter to HbcMyWorkFeed for KPI click-to-filter.
 */
import type { ReactNode } from 'react';
import { HbcMyWorkFeed, useMyWork } from '@hbc/my-work-feed';
import type { IMyWorkItem } from '@hbc/my-work-feed';
import { useHubTrustState } from './useHubTrustState.js';
import { HubFreshnessIndicator } from './HubFreshnessIndicator.js';

export interface HubPrimaryZoneProps {
  onItemSelect?: (item: IMyWorkItem) => void;
  /** UIF-001a: ID of the currently active/detail-viewed item for row highlighting. */
  activeItemId?: string;
  kpiFilter?: string | null;
  /** UIF-020-addl: Callback to clear the active KPI filter. */
  onClearKpiFilter?: () => void;
}

export function HubPrimaryZone({ onItemSelect, activeItemId, kpiFilter, onClearKpiFilter }: HubPrimaryZoneProps): ReactNode {
  const { feed, isLoading, refetch } = useMyWork();
  const trustState = useHubTrustState(feed, isLoading);

  return (
    <>
      {/* UIF-011: onRetry wires the feed refetch into the degraded-source Retry button. */}
      <HubFreshnessIndicator trustState={trustState} isLoading={isLoading} onRetry={refetch} />
      <HbcMyWorkFeed onItemSelect={onItemSelect} activeItemId={activeItemId} kpiFilter={kpiFilter} onClearKpiFilter={onClearKpiFilter} />
    </>
  );
}
