/**
 * HubFreshnessIndicator — P2-B3 §5–§6.
 *
 * Displays freshness timestamp and status badge above the primary zone.
 * Uses HbcStatusBadge from @hbc/ui-kit for the badge rendering.
 * Complexity-tier-aware:
 *   Essential: "Last synced [relative time]" when not live
 *   Standard: + freshness label badge + degraded-source summary (expandable)
 *   Expert: + degraded source count detail with names always visible
 *
 * UIF-011: When sources are degraded, renders an expandable disclosure of
 * source names and an inline Retry action (onRetry prop).
 *
 * Hidden when freshness is 'live' and data is within the freshness window.
 * Shows stale-while-revalidate treatment when refreshing stale data.
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HBC_BREAKPOINT_MOBILE, HbcStatusBadge } from '@hbc/ui-kit';
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
  // UIF-011: Inline row holding the expand trigger + retry button.
  degradedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  // UIF-011: Expand trigger — styled as inline text to blend with surrounding copy.
  expandTrigger: {
    background: 'none',
    border: 'none',
    padding: '0',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: 'var(--colorNeutralForeground2)',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    ':hover': {
      color: 'var(--colorNeutralForeground1)',
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: 'var(--colorBrandStroke1)',
      outlineOffset: '2px',
      borderRadius: '2px',
    },
  },
  // UIF-011: Retry action — minimal ghost button inline with the text.
  retryButton: {
    background: 'none',
    border: '1px solid var(--colorNeutralStroke1)',
    borderRadius: '3px',
    padding: '1px 8px',
    cursor: 'pointer',
    fontSize: '0.6875rem',
    fontWeight: '500',
    color: 'var(--colorBrandForeground1)',
    ':hover': {
      backgroundColor: 'var(--colorNeutralBackground3Hover)',
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: 'var(--colorBrandStroke1)',
      outlineOffset: '2px',
      borderRadius: '2px',
    },
  },
  // UIF-011: Expandable source name list.
  sourceList: {
    listStyleType: 'none',
    margin: '0',
    padding: '0',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    width: '100%',
    paddingBottom: '4px',
  },
  sourceItem: {
    fontSize: '0.6875rem',
    fontWeight: '500',
    padding: '1px 6px',
    borderRadius: '3px',
    backgroundColor: 'var(--colorStatusWarningBackground1)',
    color: 'var(--colorStatusWarningForeground1)',
  },
});

export function HubFreshnessIndicator({
  trustState,
  isLoading: _isLoading,
  onRetry,
}: HubFreshnessIndicatorProps): ReactNode {
  const styles = useStyles();
  const { tier } = useComplexity();
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

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

      {/* Standard+ tier: degraded source summary — UIF-011 expandable + retry */}
      {hasDegradedSources && (
        <span className={styles.degradedRow}>
          {tier === 'expert' ? (
            // Expert: show count as plain text (names always visible below)
            <span>{degradedSourceCount} source(s) unavailable</span>
          ) : (
            // Standard: expand trigger with dotted underline
            <button
              type="button"
              className={styles.expandTrigger}
              onClick={() => setSourcesExpanded((v) => !v)}
              aria-expanded={sourcesExpanded}
              aria-controls="hub-degraded-sources"
            >
              {degradedSourceCount} source(s) unavailable{' '}
              {sourcesExpanded ? '▲' : '▼'}
            </button>
          )}

          {onRetry && (
            <button
              type="button"
              className={styles.retryButton}
              onClick={onRetry}
              aria-label="Retry loading unavailable sources"
            >
              Retry
            </button>
          )}
        </span>
      )}

      {/* Expert tier: extra degraded source count when freshness is not partial */}
      {tier === 'expert' && degradedSourceCount > 0 && freshness !== 'partial' && (
        <span>{degradedSourceCount} degraded source(s)</span>
      )}

      {/* UIF-011: Source name list — always visible at expert, toggle at standard */}
      {hasDegradedSources && degradedSources.length > 0 && (tier === 'expert' || sourcesExpanded) && (
        <ul
          id="hub-degraded-sources"
          className={styles.sourceList}
          role="list"
          aria-label="Unavailable sources"
        >
          {degradedSources.map((source) => (
            <li key={source} className={styles.sourceItem}>
              {SOURCE_DISPLAY_NAMES[source] ?? source}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
