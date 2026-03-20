/**
 * HubPrimaryZone — P2-D2 §3 protected primary zone.
 *
 * Renders HbcMyWorkFeed directly. This zone MUST NOT be wrapped in
 * HbcProjectCanvas and MUST NOT support EditMode. The feed handles
 * its own truly-empty, filter-empty, and first-use empty states internally.
 */
import type { ReactNode } from 'react';
import { HbcMyWorkFeed } from '@hbc/my-work-feed';
import type { IMyWorkItem } from '@hbc/my-work-feed';

export interface HubPrimaryZoneProps {
  onItemSelect?: (item: IMyWorkItem) => void;
}

export function HubPrimaryZone({ onItemSelect }: HubPrimaryZoneProps): ReactNode {
  return <HbcMyWorkFeed onItemSelect={onItemSelect} />;
}
