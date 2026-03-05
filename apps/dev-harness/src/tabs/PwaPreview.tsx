/**
 * PwaPreview — Full HbcAppShell with workspace switching.
 * Foundation Plan Phase 3 / Phase 4.19.
 */
import { createElement } from 'react';
import { useNavStore } from '@hbc/shell';
import type { WorkspaceId, SidebarItem } from '@hbc/shell';
import { HbcAppShell, DrawingSheet } from '@hbc/ui-kit';
import type { SidebarNavGroup, ShellUser } from '@hbc/ui-kit';
import { WorkspacePlaceholder } from '../pages/WorkspacePlaceholder.js';

const WORKSPACE_LABELS: Record<string, string> = {
  'project-hub': 'Project Hub',
  accounting: 'Accounting',
  estimating: 'Estimating',
  scheduling: 'Scheduling',
  buyout: 'Buyout',
  compliance: 'Compliance',
  contracts: 'Contracts',
  risk: 'Risk',
  scorecard: 'Scorecard',
  pmp: 'PMP',
  leadership: 'Leadership',
  'business-development': 'Business Development',
  admin: 'Admin',
  'site-control': 'Site Control',
};

function toSidebarGroups(items: SidebarItem[], workspaceId: WorkspaceId | null): SidebarNavGroup[] {
  if (items.length === 0) return [];
  const wsId = workspaceId ?? 'project-hub';
  return [
    {
      id: wsId,
      label: WORKSPACE_LABELS[wsId] ?? 'Navigation',
      items: items.map((item) => ({
        id: item.id,
        label: item.label,
        icon: createElement(DrawingSheet, { size: 'sm' }),
        href: `/${wsId}/${item.id}`,
      })),
    },
  ];
}

const HARNESS_USER: ShellUser = {
  id: 'harness-user',
  displayName: 'Dev Harness',
  email: 'dev@hbintel.local',
  initials: 'DH',
};

export function PwaPreview() {
  const activeWorkspace = useNavStore((s) => s.activeWorkspace);
  const setActiveWorkspace = useNavStore((s) => s.setActiveWorkspace);
  const sidebarItems = useNavStore((s) => s.sidebarItems);

  const sidebarGroups = toSidebarGroups(sidebarItems, activeWorkspace);

  const handleNavigate = (href: string) => {
    // In dev-harness, parse workspace from href and switch
    const parts = href.split('/').filter(Boolean);
    if (parts.length > 0) {
      setActiveWorkspace(parts[0] as WorkspaceId);
    }
  };

  return (
    <HbcAppShell
      mode="pwa"
      user={HARNESS_USER}
      sidebarGroups={sidebarGroups}
      onNavigate={handleNavigate}
    >
      <WorkspacePlaceholder workspaceId={activeWorkspace ?? 'project-hub'} />
    </HbcAppShell>
  );
}
