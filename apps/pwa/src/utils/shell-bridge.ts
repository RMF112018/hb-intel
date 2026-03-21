/**
 * Shell bridge — Phase 4.19, PH4B.5 §4b.5.3
 * Converts navStore / NAV_ITEMS registry → SidebarNavGroup[] expected by HbcAppShell,
 * and ICurrentUser → ShellUser.
 *
 * UIF-013: Icon resolver maps NavItemConfig.icon → JSX. Top-level workspace
 * entries always visible (≥4 destinations per conformance plan §5.3).
 */
import { createElement } from 'react';
import type React from 'react';
import type { ICurrentUser } from '@hbc/models';
import type { WorkspaceId, SidebarItem } from '@hbc/shell';
import { getNavItemsForWorkspace, isMyWorkCohortEnabled } from '@hbc/shell';
import type { SidebarNavGroup, ShellUser } from '@hbc/ui-kit';
import { DrawingSheet, Home, Toolbox, BudgetLine, GoNoGo, HardHat } from '@hbc/ui-kit';
import { WORKSPACE_DESCRIPTORS } from '../router/workspace-config.js';

// UIF-013: Icon resolver — maps NavItemConfig.icon string to JSX component.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, React.FC<any>> = {
  'home': Home,
  'toolbox': Toolbox,
  'budget-line': BudgetLine,
  'go-no-go': GoNoGo,
  'hard-hat': HardHat,
  'drawing-sheet': DrawingSheet,
};

function resolveIcon(iconName?: string): React.ReactNode {
  const Icon = iconName ? ICON_MAP[iconName] ?? DrawingSheet : DrawingSheet;
  return createElement(Icon, { size: 'sm' });
}

// UIF-013: Top-level workspace entries that should always be visible in the sidebar.
// Ensures ≥4 navigation destinations are reachable from any page.
const TOP_LEVEL_WORKSPACES: Array<{ workspace: WorkspaceId; label: string; icon: string; path: string }> = [
  { workspace: 'my-work', label: 'My Work', icon: 'home', path: '/my-work' },
  { workspace: 'business-development', label: 'BD', icon: 'toolbox', path: '/bd' },
  { workspace: 'estimating', label: 'Estimating', icon: 'go-no-go', path: '/estimating' },
  { workspace: 'project-hub', label: 'Project Hub', icon: 'hard-hat', path: '/project-hub' },
];

/**
 * Maps flat navStore sidebar items into the grouped structure HbcAppShell expects.
 * @deprecated Prefer buildSidebarGroupsFromRegistry() — PH4B.5 §4b.5.3
 */
export function mapNavStoreToSidebarGroups(
  items: SidebarItem[],
  workspaceId: WorkspaceId | null,
): SidebarNavGroup[] {
  if (items.length === 0) return [];
  const wsId = workspaceId ?? 'project-hub';
  const descriptor = WORKSPACE_DESCRIPTORS[wsId];
  return [
    {
      id: wsId,
      label: descriptor?.label ?? 'Navigation',
      items: items.map((item) => ({
        id: item.id,
        label: item.label,
        icon: resolveIcon(),
        href: `/${wsId}/${item.id}`,
      })),
    },
  ];
}

/**
 * Builds sidebar groups directly from the NAV_ITEMS registry — PH4B.5 §4b.5.3.
 * UIF-013: Always includes top-level workspace entries (≥4 destinations).
 */
export function buildSidebarGroupsFromRegistry(
  workspaceId: WorkspaceId | null,
): SidebarNavGroup[] {
  const groups: SidebarNavGroup[] = [];

  // UIF-013: Top-level workspace quick-nav group — always visible.
  if (isMyWorkCohortEnabled()) {
    groups.push({
      id: 'workspaces',
      label: 'Workspaces',
      items: TOP_LEVEL_WORKSPACES.map((ws) => ({
        id: `ws-${ws.workspace}`,
        label: ws.label,
        icon: resolveIcon(ws.icon),
        href: ws.path,
      })),
    });
  }

  // Active workspace sub-navigation (if workspace has sub-items)
  const wsId = workspaceId ?? 'project-hub';
  const navItems = getNavItemsForWorkspace(wsId);
  // UIF-012-addl: Skip workspace sub-nav when it's a single item already in the
  // top-level Workspaces group — prevents duplicate "My Work" entries in sidebar.
  const isDuplicateSingleItem = isMyWorkCohortEnabled() &&
    navItems.length === 1 &&
    TOP_LEVEL_WORKSPACES.some((ws) => ws.workspace === wsId && ws.path === navItems[0].path);
  if (navItems.length > 0 && !isDuplicateSingleItem) {
    const descriptor = WORKSPACE_DESCRIPTORS[wsId];
    groups.push({
      id: wsId,
      label: descriptor?.label ?? 'Navigation',
      items: navItems.map((navItem) => ({
        id: navItem.key,
        label: navItem.label,
        icon: resolveIcon(navItem.icon),
        href: navItem.path,
        requiredPermission: navItem.requiredPermission,
      })),
    });
  }

  // Deduplicate groups by id
  const seen = new Set<string>();
  return groups.filter((g) => {
    if (seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });
}

/**
 * Maps the auth store's ICurrentUser to the ShellUser shape HbcAppShell expects.
 */
export function mapCurrentUserToShellUser(user: ICurrentUser | null): ShellUser | null {
  if (!user) return null;
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    initials: user.displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  };
}
