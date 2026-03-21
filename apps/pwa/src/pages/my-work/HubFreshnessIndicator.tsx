/**
 * HubFreshnessIndicator — P2-B3 §5–§6.
 *
 * Displays freshness timestamp and status badge above the primary zone.
 * Uses HbcStatusBadge from @hbc/ui-kit for the badge rendering.
 * Complexity-tier-aware:
 *   Essential: "Last synced [relative time]" when not live
 *   Standard: + freshness label badge
 *   Expert: + degraded source count detail
 *
 * UIF-005-addl: When sources are degraded (partial freshness), renders a
 * full-width HbcBanner variant="warning" naming unavailable sources with
 * an inline Retry action. This replaces the previous small expandable
 * disclosure pattern to ensure the warning is proportional to its severity.
 *
 * UIF-011: Degraded source names and Retry action surfaced in banner.
 *
 * UIF-014-addl: Defensive fallback when degradedSources array is empty but
 * degradedSourceCount is non-zero — prevents blank interpolation in banner text.
 *
 * Hidden when freshness is 'live' and data is within the freshness window.
 * Shows stale-while-revalidate treatment when refreshing stale data.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HBC_BREAKPOINT_MOBILE, HbcStatusBadge, HbcBanner, HbcButton } from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';
import { useComplexity } from '@hbc/complexity';
import type { MyWorkSource } from '@hbc/my-work-feed';
import type { IHubTrustState } from './useHubTrustState.js';
import { formatRelativeTime } from './formatRelativeTime.js';

export interface HubFreshnessIndicatorProps {
  trustState: IHubTrustState;
  isLoading: boolean;
  /** UIF-011: Called when the user clicks Retry to re-fetch degraded sources. */
  onRetry?: () => void;
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

// UIF-011: Human-readable display names for MyWorkSource keys.
// Used to tell users which modules are unavailable (not just a count).
const SOURCE_DISPLAY_NAMES: Record<MyWorkSource, string> = {
  'bic-next-move': 'Bid Intelligence',
  'workflow-handoff': 'Workflow Handoffs',
  'acknowledgment': 'Acknowledgments',
  'notification-intelligence': 'Notifications',
  'session-state': 'Session',
  'module': 'Module Tasks',
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
    flexWrap: 'wrap',
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '4px',
    },
  },
  // UIF-005-addl: Banner wrapper gets bottom padding to separate from feed.
  bannerWrap: {
    paddingBottom: '12px',
  },
  // UIF-005-addl: Inline flex for banner content + retry button.
  bannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
});

export function HubFreshnessIndicator({
  trustState,
  isLoading: _isLoading,
  onRetry,
}: HubFreshnessIndicatorProps): ReactNode {
  const styles = useStyles();
  const { tier } = useComplexity();

  const { freshness, lastRefreshedIso, isWithinFreshnessWindow, isStaleWhileRevalidating, degradedSourceCount, degradedSources } =
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

  const hasDegradedSources = tier !== 'essential' && freshness === 'partial' && degradedSourceCount > 0;

  // UIF-005-addl: Promote partial-sync to HbcBanner when sources are degraded.
  // Banner is not dismissible — the warning persists until the issue is resolved.
  // UIF-014-addl: Defensive fallback when degradedSources is empty but count > 0.
  if (hasDegradedSources) {
    const sourceNames = degradedSources
      .map((s) => SOURCE_DISPLAY_NAMES[s] ?? s)
      .filter(Boolean)
      .join(', ');

    const syncSuffix = relativeTime ? ` Last synced ${relativeTime}.` : '';

    // UIF-014-addl: When source names can't be resolved, use generic fallback
    // so the banner never renders with blank interpolation variables.
    const message = !sourceNames ? (
      <>One or more data sources are unavailable.{syncSuffix}</>
    ) : degradedSourceCount === 1 ? (
      <>Data source &lsquo;<strong>{sourceNames}</strong>&rsquo; is unavailable.{syncSuffix}</>
    ) : (
      <>Data is incomplete — <strong>{sourceNames}</strong> are unavailable.{syncSuffix}</>
    );

    return (
      <div className={styles.bannerWrap} data-hub-trust={freshness}>
        <HbcBanner variant="warning">
          <div className={styles.bannerContent}>
            <span>{message}</span>
            {onRetry && (
              <HbcButton variant="secondary" size="sm" onClick={onRetry}>
                Retry
              </HbcButton>
            )}
          </div>
        </HbcBanner>
      </div>
    );
  }

  // Non-degraded states: small indicator row
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

      {/* Expert tier: extra degraded source count when freshness is not partial */}
      {tier === 'expert' && degradedSourceCount > 0 && freshness !== 'partial' && (
        <span>{degradedSourceCount} degraded source(s)</span>
      )}
    </div>
  );
}
