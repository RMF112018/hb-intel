/**
 * Shell bridge — Phase 4.19, PH4B.5 §4b.5.3
 * Converts navStore / NAV_ITEMS registry → SidebarNavGroup[] expected by HbcAppShell,
 * and ICurrentUser → ShellUser.
 */
import { createElement } from 'react';
import type { ICurrentUser } from '@hbc/models';
import type { WorkspaceId, SidebarItem } from '@hbc/shell';
import { getNavItemsForWorkspace, isMyWorkCohortEnabled } from '@hbc/shell';
import type { SidebarNavGroup, ShellUser } from '@hbc/ui-kit';
import { DrawingSheet } from '@hbc/ui-kit';
import { WORKSPACE_DESCRIPTORS } from '../router/workspace-config.js';

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
        icon: createElement(DrawingSheet, { size: 'sm' }),
        href: `/${wsId}/${item.id}`,
      })),
    },
  ];
}

/**
 * Builds sidebar groups directly from the NAV_ITEMS registry — PH4B.5 §4b.5.3.
 * No dependency on navStore's sidebarItems for content.
 */
export function buildSidebarGroupsFromRegistry(
  workspaceId: WorkspaceId | null,
): SidebarNavGroup[] {
  const groups: SidebarNavGroup[] = [];

  // P2-B1 §11.5: "My Work" nav item when cohort flag is enabled.
  if (isMyWorkCohortEnabled()) {
    groups.push({
      id: 'my-work',
      label: 'My Work',
      items: [
        {
          id: 'my-work-hub',
          label: 'My Work',
          icon: createElement(DrawingSheet, { size: 'sm' }),
          href: '/my-work',
        },
      ],
    });
  }

  const wsId = workspaceId ?? 'project-hub';
  const navItems = getNavItemsForWorkspace(wsId);
  if (navItems.length > 0) {
    const descriptor = WORKSPACE_DESCRIPTORS[wsId];
    groups.push({
      id: wsId,
      label: descriptor?.label ?? 'Navigation',
      items: navItems.map((navItem) => ({
        id: navItem.key,
        label: navItem.label,
        icon: createElement(DrawingSheet, { size: 'sm' }),
        href: navItem.path,
        requiredPermission: navItem.requiredPermission,
      })),
    });
  }

  return groups;
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
