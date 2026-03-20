/**
 * HubFreshnessIndicator — P2-B3 §5–§6.
 *
 * Displays freshness timestamp and status badge above the primary zone.
 * Complexity-tier-aware:
 *   Essential: "Last synced [relative time]" when not live
 *   Standard: + freshness label badge + degraded-source summary
 *   Expert: + degraded source count detail
 *
 * Hidden when freshness is 'live' and data is within the freshness window.
 * Shows stale-while-revalidate treatment when refreshing stale data.
 */
import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { HBC_BREAKPOINT_MOBILE } from '@hbc/ui-kit';
import { useComplexity } from '@hbc/complexity';
import type { IHubTrustState } from './useHubTrustState.js';
import { formatRelativeTime } from './formatRelativeTime.js';

export interface HubFreshnessIndicatorProps {
  trustState: IHubTrustState;
  isLoading: boolean;
}

const FRESHNESS_LABELS: Record<'live' | 'cached' | 'partial', string> = {
  live: 'Live',
  cached: 'Cached',
  partial: 'Partial',
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--colorNeutralForeground3)',
    paddingBottom: '8px',
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '4px',
    },
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingLeft: '6px',
    paddingRight: '6px',
    paddingTop: '2px',
    paddingBottom: '2px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  badgeLive: {
    backgroundColor: 'var(--colorPaletteGreenBackground1)',
    color: 'var(--colorPaletteGreenForeground1)',
  },
  badgeCached: {
    backgroundColor: 'var(--colorPaletteBlueBorderActive)',
    color: 'var(--colorNeutralForegroundOnBrand)',
  },
  badgePartial: {
    backgroundColor: 'var(--colorPaletteYellowBackground1)',
    color: 'var(--colorPaletteYellowForeground1)',
  },
  refreshing: {
    fontStyle: 'italic',
  },
});

export function HubFreshnessIndicator({
  trustState,
  isLoading: _isLoading,
}: HubFreshnessIndicatorProps): ReactNode {
  const styles = useStyles();
  const { tier } = useComplexity();

  const { freshness, lastRefreshedIso, isWithinFreshnessWindow, isStaleWhileRevalidating, degradedSourceCount } =
    trustState;

  // P2-B3 §5: Hide when live and within freshness window
  if (freshness === 'live' && isWithinFreshnessWindow && !isStaleWhileRevalidating) {
    return null;
  }

  const relativeTime = lastRefreshedIso ? formatRelativeTime(lastRefreshedIso) : null;

  // P2-B3 §6: Stale-while-revalidate treatment
  if (isStaleWhileRevalidating) {
    return (
      <div className={styles.root} data-hub-trust="stale-revalidating">
        <span className={styles.refreshing}>Refreshing...</span>
        {relativeTime && <span>Last synced {relativeTime}</span>}
      </div>
    );
  }

  const badgeClass =
    freshness === 'live'
      ? styles.badgeLive
      : freshness === 'cached'
        ? styles.badgeCached
        : styles.badgePartial;

  return (
    <div className={styles.root} data-hub-trust={freshness}>
      {/* Essential tier: just the timestamp */}
      {relativeTime && <span>Last synced {relativeTime}</span>}

      {/* Standard+ tier: freshness badge */}
      {tier !== 'essential' && (
        <span className={mergeClasses(styles.badge, badgeClass)}>
          {FRESHNESS_LABELS[freshness]}
        </span>
      )}

      {/* Standard+ tier: degraded source summary */}
      {tier !== 'essential' && freshness === 'partial' && degradedSourceCount > 0 && (
        <span>{degradedSourceCount} source(s) unavailable</span>
      )}

      {/* Expert tier: detailed count */}
      {tier === 'expert' && degradedSourceCount > 0 && freshness !== 'partial' && (
        <span>{degradedSourceCount} degraded source(s)</span>
      )}
    </div>
  );
}
