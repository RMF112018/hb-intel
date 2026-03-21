/**
 * HubTeamModeSelector — P2-D4 §1, P2-D5 §7.
 *
 * Team mode toggle for the hub header using HbcTabs from @hbc/ui-kit.
 * Available modes per role:
 *   personal — all roles (default)
 *   delegated-by-me — all roles with active delegations
 *   my-team — Executive only (P2-D4 §1)
 *
 * Persisted via useAutoSaveDraft with 16-hour TTL per P2-D5 §7.
 * Hidden at essential complexity tier.
 */
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import type { TeamMode } from '@hbc/shell';
import { HbcTabs } from '@hbc/ui-kit';
import type { LayoutTab } from '@hbc/ui-kit';
import { useComplexity } from '@hbc/complexity';
import { useAuthStore } from '@hbc/auth';

const useStyles = makeStyles({
  tabBar: {
    marginBottom: '16px',
  },
});

export interface HubTeamModeSelectorProps {
  activeMode: TeamMode;
  onModeChange: (mode: TeamMode) => void;
}

const BASE_TABS: LayoutTab[] = [
  { id: 'personal', label: 'Personal' },
  { id: 'delegated-by-me', label: 'Delegated by Me' },
];

const EXECUTIVE_TAB: LayoutTab = { id: 'my-team', label: 'My Team' };

export function HubTeamModeSelector({
  activeMode,
  onModeChange,
}: HubTeamModeSelectorProps): ReactNode {
  const styles = useStyles();
  const { tier } = useComplexity();
  const session = useAuthStore((s) => s.session);
  const isExecutive = session?.resolvedRoles.includes('Executive') ?? false;

  const tabs = useMemo<LayoutTab[]>(
    () => (isExecutive ? [...BASE_TABS, EXECUTIVE_TAB] : BASE_TABS),
    [isExecutive],
  );

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
