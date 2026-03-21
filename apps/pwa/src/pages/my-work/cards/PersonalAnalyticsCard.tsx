/**
 * PersonalAnalyticsCard — P2-D1 §6: available to all roles.
 * Displays personal work KPIs from useMyWorkCounts().
 *
 * UIF-008: Responsive KPI grid with click-to-filter on each card.
 * UIF-001 fix: grid uses auto-fit + minmax so columns reflow to container width
 * instead of overflowing. Works correctly whether the tile spans 6 or 12 columns
 * in the secondary zone's 12-column grid.
 * Semantic status ramp colors on top borders per UIF-007.
 * Value typography: heading1 (1.5rem/700) via HbcKpiCard default.
 * Background: surface-1 (colorNeutralBackground1) via HbcKpiCard default.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HbcKpiCard,
  HbcSpinner,
  HBC_SPACE_MD,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_INFO,
  HBC_STATUS_ACTION_GREEN,
  HBC_PRIMARY_BLUE,
} from '@hbc/ui-kit';
import { useMyWorkCounts } from '@hbc/my-work-feed';
import { ViewList, SparkleIcon, Cancel, Notifications } from '@hbc/ui-kit/icons';

// UIF-001: auto-fit + minmax(90px, 1fr) replaces fixed repeat(4,1fr) with explicit
// breakpoints. The old breakpoints were calibrated for full-page width contexts and
// did not account for the constrained ~200-250px tile wrapper inside defaultColSpan:6.
// With auto-fit, the grid self-adapts: 4 cards per row at ≥408px, 2 per row at
// ≥196px, 1 per row below. No viewport-level media query needed.
const useStyles = makeStyles({
  kpiGrid: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
    gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
  },
  // INS-006: Summary card gets distinct background + full width + no maxWidth cap.
  summaryCard: {
    backgroundColor: '#1E3A5F',
    maxWidth: 'none',
  },
});

export interface PersonalAnalyticsCardProps {
  /** UIF-008: Currently active KPI filter key. */
  activeFilter?: string | null;
  /** UIF-008: Callback when a KPI card is clicked. */
  onFilterChange?: (filter: string) => void;
}

export function PersonalAnalyticsCard({
  activeFilter,
  onFilterChange,
}: PersonalAnalyticsCardProps): ReactNode {
  const styles = useStyles();
  const { counts, isLoading } = useMyWorkCounts();

  // Per-tile loading — WorkspacePageShell isLoading is page-level, not applicable here.
  // eslint-disable-next-line @hb-intel/hbc/no-direct-spinner
  if (isLoading) return <HbcSpinner size="sm" label="Loading insights" />;

  return (
    <div className={styles.kpiGrid}>
      {/* INS-006: Total Items as full-width summary card with distinct visual weight.
        * Wrapper div provides gridColumn span + background override via CSS variable. */}
      <div
        style={{
          gridColumn: '1 / -1',
          '--summary-bg': '#1E3A5F',
        } as React.CSSProperties}
      >
        <HbcKpiCard
          label="Total Items"
          value={counts?.totalCount ?? 0}
          subtitle="active work items"
          color={HBC_PRIMARY_BLUE}
          icon={<ViewList size="sm" />}
          ariaLabel={`Filter by Total Items: ${counts?.totalCount ?? 0} items`}
          isActive={activeFilter === null || activeFilter === undefined}
          onClick={() => onFilterChange?.('total')}
          className={styles.summaryCard}
        />
      </div>
      {/* INS-009: Flat trend placeholders — replaced with real deltas when data model supports it */}
      <HbcKpiCard
        label="Action Now"
        value={counts?.nowCount ?? 0}
        color={HBC_STATUS_ACTION_GREEN}
        icon={<SparkleIcon size="sm" />}
        trend={{ direction: 'flat', label: 'No change' }}
        ariaLabel={`Filter by Action Now: ${counts?.nowCount ?? 0} items`}
        isActive={activeFilter === 'action-now'}
        onClick={() => onFilterChange?.('action-now')}
      />
      <HbcKpiCard
        label="Blocked"
        value={counts?.blockedCount ?? 0}
        color={HBC_STATUS_RAMP_RED[50]}
        icon={<Cancel size="sm" />}
        trend={{ direction: 'flat', label: 'No change' }}
        ariaLabel={`Filter by Blocked: ${counts?.blockedCount ?? 0} items`}
        isActive={activeFilter === 'blocked'}
        onClick={() => onFilterChange?.('blocked')}
      />
      <HbcKpiCard
        label="Unread"
        value={counts?.unreadCount ?? 0}
        color={HBC_STATUS_RAMP_INFO[50]}
        icon={<Notifications size="sm" />}
        trend={{ direction: 'flat', label: 'No change' }}
        ariaLabel={`Filter by Unread: ${counts?.unreadCount ?? 0} items`}
        isActive={activeFilter === 'unread'}
        onClick={() => onFilterChange?.('unread')}
      />
    </div>
  );
}
