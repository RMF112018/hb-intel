/**
 * HubFreshnessIndicator — P2-B3 §5–§6.
 *
 * Displays freshness timestamp and status badge above the primary zone.
 * Uses HbcStatusBadge from @hbc/ui-kit for the badge rendering.
 * Complexity-tier-aware:
 *   Essential: "Last synced [relative time]" when not live
 *   Standard: + freshness label badge + degraded-source summary
 *   Expert: + degraded source count detail
 *
 * Hidden when freshness is 'live' and data is within the freshness window.
 * Shows stale-while-revalidate treatment when refreshing stale data.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HBC_BREAKPOINT_MOBILE, HbcStatusBadge } from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';
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

const FRESHNESS_TO_VARIANT: Record<'live' | 'cached' | 'partial', StatusVariant> = {
  live: 'success',
  cached: 'info',
  partial: 'warning',
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: 'var(--colorNeutralForeground2)',
    paddingBottom: '12px',
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '4px',
    },
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
        <HbcStatusBadge variant="info" label="Refreshing" size="small" />
        {relativeTime && <span>Last synced {relativeTime}</span>}
      </div>
    );
  }

  return (
    <div className={styles.root} data-hub-trust={freshness}>
      {/* Essential tier: just the timestamp */}
      {relativeTime && <span>Last synced {relativeTime}</span>}

      {/* Standard+ tier: freshness badge via HbcStatusBadge */}
      {tier !== 'essential' && (
        <HbcStatusBadge
          variant={FRESHNESS_TO_VARIANT[freshness]}
          label={FRESHNESS_LABELS[freshness]}
          size="small"
        />
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
