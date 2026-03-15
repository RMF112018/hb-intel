/**
 * HbcMyWorkOfflineBanner — SF29-T05
 *
 * Offline connectivity banner.
 * Returns null when online. Complexity-tier-aware display.
 */

import React from 'react';
import { useComplexity } from '@hbc/complexity';
import { HbcBanner } from '@hbc/ui-kit';
import { CloudOffline } from '@hbc/ui-kit/icons';
import { useMyWorkOfflineState } from '../../hooks/useMyWorkOfflineState.js';

export interface IHbcMyWorkOfflineBannerProps {
  className?: string;
}

function formatRelativeTime(isoString: string): string {
  if (!isoString) return 'unknown';
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes === 1) return '1 minute ago';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return '1 hour ago';
  return `${diffHours} hours ago`;
}

export function HbcMyWorkOfflineBanner({
  className,
}: IHbcMyWorkOfflineBannerProps): JSX.Element | null {
  const { tier } = useComplexity();
  const { offlineState } = useMyWorkOfflineState();

  if (offlineState.isOnline) return null;

  const essentialMessage = 'You are offline';

  let message = essentialMessage;
  if (tier !== 'essential') {
    const syncTime = offlineState.lastSuccessfulSyncIso
      ? formatRelativeTime(offlineState.lastSuccessfulSyncIso)
      : 'never';
    message = `You are offline. Last synced ${syncTime}.`;
    if (offlineState.queuedActionCount > 0) {
      message += ` ${offlineState.queuedActionCount} action${offlineState.queuedActionCount !== 1 ? 's' : ''} queued.`;
    }
  }

  return (
    <HbcBanner
      variant="warning"
      className={`hbc-my-work-offline-banner${className ? ` ${className}` : ''}`}
      icon={<CloudOffline size="sm" />}
    >
      <span>{message}</span>
      {tier === 'expert' && offlineState.queuedActions.length > 0 && (
        <ul className="hbc-my-work-offline-banner__actions">
          {offlineState.queuedActions.map((action, i) => (
            <li key={`${action.workItemId}-${i}`}>
              {action.actionKey} — {action.workItemId}
            </li>
          ))}
        </ul>
      )}
    </HbcBanner>
  );
}
