/**
 * HubPrimaryZone — P2-D2 §3 protected primary zone.
 *
 * Renders HbcMyWorkFeed directly. This zone MUST NOT be wrapped in
 * HbcProjectCanvas and MUST NOT support EditMode. The feed handles
 * its own truly-empty, filter-empty, and first-use empty states internally.
 *
 * P2-B3: Freshness indicator above feed shows trust-state cues.
 */
import type { ReactNode } from 'react';
import { HbcMyWorkFeed, useMyWork } from '@hbc/my-work-feed';
import type { IMyWorkItem } from '@hbc/my-work-feed';
import { useHubTrustState } from './useHubTrustState.js';
import { HubFreshnessIndicator } from './HubFreshnessIndicator.js';

export interface HubPrimaryZoneProps {
  onItemSelect?: (item: IMyWorkItem) => void;
}

export function HubPrimaryZone({ onItemSelect }: HubPrimaryZoneProps): ReactNode {
  const { feed, isLoading } = useMyWork();
  const trustState = useHubTrustState(feed, isLoading);

  return (
    <>
      <HubFreshnessIndicator trustState={trustState} isLoading={isLoading} />
      <HbcMyWorkFeed onItemSelect={onItemSelect} />
    </>
  );
}
