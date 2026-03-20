/**
 * HubConnectivityBanner — P2-B3 §4.4.
 *
 * Hub-specific connectivity display using HbcBanner from @hbc/ui-kit.
 * Complements the shell-level HbcConnectivityBar with hub-specific messaging
 * and last-refresh timestamp context.
 *
 * online → hidden
 * degraded → HbcBanner variant="warning"
 * offline → HbcBanner variant="info"
 */
import type { ReactNode } from 'react';
import { HbcBanner } from '@hbc/ui-kit';
import { useConnectivity } from '@hbc/session-state';
import { useMyWork } from '@hbc/my-work-feed';
import { formatRelativeTime } from './formatRelativeTime.js';

export function HubConnectivityBanner(): ReactNode {
  const connectivity = useConnectivity();
  const { feed } = useMyWork();

  if (connectivity === 'online') return null;

  const lastRefreshed = feed?.lastRefreshedIso
    ? formatRelativeTime(feed.lastRefreshedIso)
    : null;

  if (connectivity === 'degraded') {
    return (
      <HbcBanner variant="warning">
        Connection unstable — showing cached data while refreshing.
        {lastRefreshed && ` Last synced ${lastRefreshed}.`}
      </HbcBanner>
    );
  }

  // offline
  return (
    <HbcBanner variant="info">
      You are offline — {lastRefreshed ? `showing data from ${lastRefreshed}.` : 'no cached data available.'}
    </HbcBanner>
  );
}
