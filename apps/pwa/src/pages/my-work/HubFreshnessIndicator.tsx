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
import { useState, useEffect } from 'react';
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

const FRESHNESS_LABELS: Record<'live' | 'cached' | 'partial' | 'queued', string> = {
  live: 'Live',
  cached: 'Cached',
  partial: 'Partial',
  queued: 'Pending Sync',
};

const FRESHNESS_TO_VARIANT: Record<'live' | 'cached' | 'partial' | 'queued', StatusVariant> = {
  live: 'success',
  cached: 'info',
  partial: 'warning',
  queued: 'info',
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
  isLoading,
  onRetry,
}: HubFreshnessIndicatorProps): ReactNode {
  const styles = useStyles();
  const { tier } = useComplexity();

  // FRS-01: Split timestamp model — lastTrustedDataIso for "last synced" display,
  // lastRefreshAttemptIso for stale-while-revalidate context.
  const { freshness, lastTrustedDataIso, lastRefreshAttemptIso, isWithinFreshnessWindow, isStaleWhileRevalidating, degradedSourceCount, degradedSources } =
    trustState;

  // UIF-028-addl: Dismissible banner — resets when degraded state changes.
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => setDismissed(false), [degradedSourceCount]);

  // P2-B3 §5: Hide when live and within freshness window
  if (freshness === 'live' && isWithinFreshnessWindow && !isStaleWhileRevalidating) {
    return null;
  }

  // FRS-01: Display trusted data age, not attempt age, for "Last synced".
  const relativeTime = lastTrustedDataIso ? formatRelativeTime(lastTrustedDataIso) : null;
  // FRS-01: Attempt time used for stale-while-revalidate context.
  const attemptTime = lastRefreshAttemptIso ? formatRelativeTime(lastRefreshAttemptIso) : null;

  // P2-B3 §6: Stale-while-revalidate treatment
  // UX-F5: isLoading now actively used (was dead _isLoading parameter).
  if (isStaleWhileRevalidating) {
    return (
      <div className={styles.root} data-hub-trust="stale-revalidating">
        <HbcStatusBadge variant="info" label={isLoading ? 'Refreshing…' : 'Stale'} size="small" />
        {relativeTime && <span>Last synced {relativeTime}</span>}
        {attemptTime && attemptTime !== relativeTime && <span>(retry {attemptTime})</span>}
      </div>
    );
  }

  const hasDegradedSources = tier !== 'essential' && freshness === 'partial' && degradedSourceCount > 0;

  // UIF-005-addl: Promote partial-sync to HbcBanner when sources are degraded.
  // UIF-028-addl: Banner is now dismissible; resets on degraded-state change.
  // UIF-014-addl: Defensive fallback when degradedSources is empty but count > 0.
  if (hasDegradedSources && !dismissed) {
    const sourceNames = degradedSources
      .map((s) => SOURCE_DISPLAY_NAMES[s] ?? s)
      .filter(Boolean)
      .join(', ');

    // UIF-028-addl: Unambiguous sync suffix — when source names are unknown
    // (fallback), say "Last sync attempt was incomplete" instead of the
    // contradictory "Last synced just now" which implies success.
    const syncSuffix = !sourceNames
      ? (relativeTime ? ' Last sync attempt was incomplete.' : '')
      : (relativeTime ? ` Last synced ${relativeTime}.` : '');

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
        {/* UIF-003: polite for persistent degraded-source state */}
        <HbcBanner variant="warning" polite onDismiss={() => setDismissed(true)}>
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
