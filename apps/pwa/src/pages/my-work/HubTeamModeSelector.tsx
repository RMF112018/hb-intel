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
import { HbcTabs, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import type { LayoutTab } from '@hbc/ui-kit';
import { useComplexity } from '@hbc/complexity';
import { useAuthStore } from '@hbc/auth';

const useStyles = makeStyles({
  tabBar: {
    marginBottom: '16px',
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
  /** UIF-027-addl: Blocked count for "Delegated by Me" tab badge. */
  delegatedBlockedCount?: number;
  /** UIF-027-addl: Blocked count for "My Team" tab badge. */
  teamBlockedCount?: number;
}

export function HubTeamModeSelector({
  activeMode,
  onModeChange,
  delegatedBlockedCount = 0,
  teamBlockedCount = 0,
}: HubTeamModeSelectorProps): ReactNode {
  const styles = useStyles();
  const { tier } = useComplexity();
  const session = useAuthStore((s) => s.session);
  const isExecutive = session?.resolvedRoles.includes('Executive') ?? false;

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
    </div>
  );
}
