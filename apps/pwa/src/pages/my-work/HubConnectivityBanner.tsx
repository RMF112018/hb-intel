/**
 * HubConnectivityBanner — P2-B3 §4.4.
 *
 * Hub-specific connectivity display complementing the shell-level
 * HbcConnectivityBar. Shows degraded/offline messaging with last
 * refresh timestamp when available.
 *
 * online → hidden
 * degraded → "Connection unstable — showing cached data while refreshing"
 * offline → "You are offline — showing last available data"
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useConnectivity } from '@hbc/session-state';
import { useMyWork } from '@hbc/my-work-feed';
import { formatRelativeTime } from './formatRelativeTime.js';

const useStyles = makeStyles({
  banner: {
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    borderRadius: '4px',
    fontSize: '13px',
    marginBottom: '8px',
  },
  degraded: {
    backgroundColor: 'var(--colorPaletteYellowBackground1)',
    color: 'var(--colorPaletteYellowForeground1)',
  },
  offline: {
    backgroundColor: 'var(--colorNeutralBackground3)',
    color: 'var(--colorNeutralForeground2)',
  },
});

export function HubConnectivityBanner(): ReactNode {
  const styles = useStyles();
  const connectivity = useConnectivity();
  const { feed } = useMyWork();

  if (connectivity === 'online') return null;

  const lastRefreshed = feed?.lastRefreshedIso
    ? formatRelativeTime(feed.lastRefreshedIso)
    : null;

  if (connectivity === 'degraded') {
    return (
      <div className={`${styles.banner} ${styles.degraded}`} role="status" data-hub-connectivity="degraded">
        Connection unstable — showing cached data while refreshing.
        {lastRefreshed && ` Last synced ${lastRefreshed}.`}
      </div>
    );
  }

  // offline
  return (
    <div className={`${styles.banner} ${styles.offline}`} role="status" data-hub-connectivity="offline">
      You are offline — {lastRefreshed ? `showing data from ${lastRefreshed}.` : 'no cached data available.'}
    </div>
  );
}
