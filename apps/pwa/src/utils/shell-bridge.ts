/**
 * Shell bridge — Phase 4.19
 * Converts navStore (flat SidebarItem[]) → SidebarNavGroup[] expected by HbcAppShell,
 * and ICurrentUser → ShellUser.
 */
import { createElement } from 'react';
import type { ICurrentUser } from '@hbc/models';
import type { WorkspaceId, SidebarItem } from '@hbc/shell';
import type { SidebarNavGroup, ShellUser } from '@hbc/ui-kit';
import { DrawingSheet } from '@hbc/ui-kit';
import { WORKSPACE_DESCRIPTORS } from '../router/workspace-config.js';

/**
 * Maps flat navStore sidebar items into the grouped structure HbcAppShell expects.
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
