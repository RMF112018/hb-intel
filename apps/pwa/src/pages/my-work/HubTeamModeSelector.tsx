/**
 * HubTeamModeSelector — P2-D4 §1, P2-D5 §7.
 *
 * Team mode toggle for the hub header using HbcTabs from @hbc/ui-kit.
 * Available modes per role:
 *   personal — all roles (default)
 *   delegated-by-me — all roles with active delegations
 *   my-team — Executive only (P2-D4 §1)
 *
 * UIF-027-addl: Count badges on non-active tabs show blocked item count,
 * creating a persistent attention signal for cross-role intelligence.
 * Badge counts are passed as props because this component renders in the
 * WorkspacePageShell headerSlot, outside the MyWorkProvider boundary.
 *
 * Persisted via useAutoSaveDraft with 16-hour TTL per P2-D5 §7.
 * Hidden at essential complexity tier.
 */
import React, { useMemo } from 'react';
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import type { TeamMode } from '@hbc/shell';
import { HbcTabs, HBC_STATUS_COLORS, HBC_BREAKPOINT_SIDEBAR } from '@hbc/ui-kit';
import type { LayoutTab } from '@hbc/ui-kit';
import { useComplexity } from '@hbc/complexity';
// Role resolution consolidated to MyWorkPage (P2-D1 / ARC-F4).

const useStyles = makeStyles({
  // UIF-048-addl: Flex row with tabs left, rightSlot right.
  tabBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  // UIF-048-addl: rightSlot hidden below sidebar breakpoint.
  rightSlotWrap: {
    display: 'none',
    [`@media (min-width: ${HBC_BREAKPOINT_SIDEBAR}px)`]: {
      display: 'flex',
      alignItems: 'center',
    },
  },
});

// UIF-027-addl: Urgent count badge — red pill with white text.
function TabBadge({ count }: { count: number }): ReactNode {
  if (count <= 0) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '18px',
        height: '18px',
        padding: '0 5px',
        borderRadius: '9px',
        fontSize: '0.6875rem',
        fontWeight: 600,
        lineHeight: 1,
        backgroundColor: HBC_STATUS_COLORS.error,
        color: '#FFFFFF',
        marginLeft: '6px',
      }}
      aria-label={`${count} blocked`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export interface HubTeamModeSelectorProps {
  activeMode: TeamMode;
  onModeChange: (mode: TeamMode) => void;
  /** P2-D1 / ARC-F4: Passed from parent — single role resolution site. */
  isExecutive: boolean;
  /** UIF-027-addl: Blocked count for "Delegated by Me" tab badge. */
  delegatedBlockedCount?: number;
  /** UIF-027-addl: Blocked count for "My Team" tab badge. */
  teamBlockedCount?: number;
  /** UIF-048-addl: Content rendered on the right side of the tab row (desktop only). */
  rightSlot?: ReactNode;
}

export function HubTeamModeSelector({
  activeMode,
  onModeChange,
  isExecutive,
  delegatedBlockedCount = 0,
  teamBlockedCount = 0,
  rightSlot,
}: HubTeamModeSelectorProps): ReactNode {
  const styles = useStyles();
  const { tier } = useComplexity();

  const tabs = useMemo<LayoutTab[]>(() => {
    const baseTabs: LayoutTab[] = [
      { id: 'personal', label: 'Personal' },
      {
        id: 'delegated-by-me',
        label: 'Delegated by Me',
        badge: activeMode !== 'delegated-by-me'
          ? <TabBadge count={delegatedBlockedCount} />
          : undefined,
      },
    ];
    if (isExecutive) {
      baseTabs.push({
        id: 'my-team',
        label: 'My Team',
        badge: activeMode !== 'my-team'
          ? <TabBadge count={teamBlockedCount} />
          : undefined,
      });
    }
    return baseTabs;
  }, [isExecutive, activeMode, delegatedBlockedCount, teamBlockedCount]);

  if (tier === 'essential') return null;

  return (
    <div className={styles.tabBar}>
      <HbcTabs
        tabs={tabs}
        activeTabId={activeMode}
        onTabChange={(tabId) => onModeChange(tabId as TeamMode)}
      />
      {rightSlot && (
        <div className={styles.rightSlotWrap}>{rightSlot}</div>
      )}
    </div>
  );
}
