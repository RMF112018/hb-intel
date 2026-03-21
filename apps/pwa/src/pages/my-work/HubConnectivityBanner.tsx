/**
 * HubConnectivityBanner — P2-B3 §4.4, UIF-018 actionability.
 *
 * Hub-specific connectivity display using HbcBanner from @hbc/ui-kit.
 * Complements the shell-level HbcConnectivityBar with hub-specific messaging
 * and last-refresh timestamp context.
 *
 * UIF-018:
 *   - "Retry" button triggers feed re-sync on degraded/offline states
 *   - Success flash with slideInUp animation on reconnect (auto-dismiss 2s)
 *   - Warning left-border accent uses HBC_STATUS_RAMP_AMBER[10]
 *
 * online → hidden (or success flash if recovering)
 * degraded → HbcBanner variant="warning" + Retry button
 * offline → HbcBanner variant="info" + Retry button
 */
import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { HbcBanner, HbcButton, HBC_STATUS_RAMP_AMBER } from '@hbc/ui-kit';
import { useConnectivity } from '@hbc/session-state';
import { useMyWork } from '@hbc/my-work-feed';
import { useHubFeedRefresh } from './useHubFeedRefresh.js';
import { formatRelativeTime } from './formatRelativeTime.js';

/** UIF-018: Auto-dismiss delay for success flash (ms). */
const SUCCESS_FLASH_MS = 2000;

export function HubConnectivityBanner(): ReactNode {
  const connectivity = useConnectivity();
  const { feed } = useMyWork();
  const { refreshFeed } = useHubFeedRefresh();

  // UIF-018: Track previous connectivity state for recovery detection
  const prevConnectivity = useRef(connectivity);
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);

  useEffect(() => {
    const wasOfflineOrDegraded = prevConnectivity.current !== 'online';
    const isNowOnline = connectivity === 'online';

    if (wasOfflineOrDegraded && isNowOnline) {
      setShowSuccessFlash(true);
      const timer = setTimeout(() => setShowSuccessFlash(false), SUCCESS_FLASH_MS);
      return () => clearTimeout(timer);
    }

    prevConnectivity.current = connectivity;
  }, [connectivity]);

  const lastRefreshed = feed?.lastRefreshedIso
    ? formatRelativeTime(feed.lastRefreshedIso)
    : null;

  // UIF-018: Success flash on reconnect — slideInUp animation via HbcBanner
  if (connectivity === 'online') {
    if (showSuccessFlash) {
      return (
        <HbcBanner variant="success" onDismiss={() => setShowSuccessFlash(false)}>
          Connection restored — data refreshed.
        </HbcBanner>
      );
    }
    return null;
  }

  // UIF-018: Retry button for degraded/offline states
  const retryButton = (
    <HbcButton variant="secondary" size="sm" onClick={refreshFeed}>
      Retry
    </HbcButton>
  );

  if (connectivity === 'degraded') {
    return (
      <div style={{ borderLeftColor: HBC_STATUS_RAMP_AMBER[10] }}>
        <HbcBanner variant="warning">
          <span style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span>
              Connection unstable — showing cached data while refreshing.
              {lastRefreshed && ` Last synced ${lastRefreshed}.`}
            </span>
            {retryButton}
          </span>
        </HbcBanner>
      </div>
    );
  }

  // offline
  return (
    <HbcBanner variant="info">
      <span style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span>
          You are offline — {lastRefreshed ? `showing data from ${lastRefreshed}.` : 'no cached data available.'}
        </span>
        {retryButton}
      </span>
    </HbcBanner>
  );
}
