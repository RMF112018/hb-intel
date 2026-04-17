/**
 * Priority Actions admin permission resolver.
 *
 * Resolves real SharePoint runtime capabilities for the maintainer
 * authoring surface and maps them to explicit admin postures.
 */
import type {
  PriorityActionsAdminPermissionResolution,
  PriorityActionsAdminPermissions,
  PriorityActionsPermissionMaskParts,
} from './priorityActionsContracts.js';
import { PRIORITY_ACTIONS_CONFIG_LIST_TITLE } from './priorityActionsConfigListDescriptor.js';
import { PRIORITY_ACTIONS_ITEMS_LIST_TITLE } from './priorityActionsItemsListDescriptor.js';

const PERMISSION_KIND = {
  ViewListItems: 1,
  EditListItems: 3,
  OpenItems: 6,
} as const;

const NO_MUTATION_PERMISSIONS: PriorityActionsAdminPermissions = {
  canView: false,
  canEdit: false,
  canReorder: false,
  canArchive: false,
  canPublish: false,
};

function parseHexMaskPart(value: string | undefined): bigint {
  if (!value) return 0n;
  const trimmed = value.trim();
  if (!trimmed) return 0n;
  const normalized = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;
  try {
    return BigInt(normalized);
  } catch {
    return 0n;
  }
}

export function decodeSharePointPermissionMask(mask: PriorityActionsPermissionMaskParts): bigint {
  const high = parseHexMaskPart(mask.High);
  const low = parseHexMaskPart(mask.Low);
  return (high << 32n) | low;
}

export function hasPermission(mask: bigint, permissionKind: number): boolean {
  return (mask & (1n << BigInt(permissionKind))) !== 0n;
}

function mapListMaskToCapabilities(mask: bigint): Pick<PriorityActionsAdminPermissions, 'canView' | 'canEdit'> {
  const canView = hasPermission(mask, PERMISSION_KIND.ViewListItems)
    || hasPermission(mask, PERMISSION_KIND.OpenItems);
  const canEdit = hasPermission(mask, PERMISSION_KIND.EditListItems);
  return { canView, canEdit };
}

function toPermissions(configMask: bigint, itemsMask: bigint, isSiteAdmin: boolean): PriorityActionsAdminPermissions {
  if (isSiteAdmin) {
    return {
      canView: true,
      canEdit: true,
      canReorder: true,
      canArchive: true,
      canPublish: true,
    };
  }

  const config = mapListMaskToCapabilities(configMask);
  const items = mapListMaskToCapabilities(itemsMask);

  const canView = config.canView || items.canView;
  const canEdit = config.canEdit && items.canEdit;
  return {
    canView,
    canEdit,
    canReorder: canEdit,
    canArchive: canEdit,
    canPublish: canEdit,
  };
}

export function mapPermissionsToPosture(
  permissions: PriorityActionsAdminPermissions,
): PriorityActionsAdminPermissionResolution['posture'] {
  if (permissions.canPublish && permissions.canEdit) {
    return 'editable';
  }
  if (permissions.canView) {
    return 'read-only';
  }
  return 'insufficient-permission';
}

function listPermissionsEndpoint(siteUrl: string, listTitle: string): string {
  return `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(listTitle)}')/EffectiveBasePermissions`;
}

function toPermissionMaskParts(value: unknown): PriorityActionsPermissionMaskParts {
  if (!value || typeof value !== 'object') return {};
  const candidate = value as Record<string, unknown>;
  return {
    High: typeof candidate.High === 'string' ? candidate.High : undefined,
    Low: typeof candidate.Low === 'string' ? candidate.Low : undefined,
  };
}

async function fetchListMask(siteUrl: string, listTitle: string): Promise<bigint> {
  const response = await fetch(listPermissionsEndpoint(siteUrl, listTitle), {
    headers: { Accept: 'application/json;odata=nometadata' },
  });
  if (!response.ok) {
    throw new Error(`Permission lookup failed for "${listTitle}" (${response.status}).`);
  }
  const body = (await response.json()) as
    | PriorityActionsPermissionMaskParts
    | { EffectiveBasePermissions?: PriorityActionsPermissionMaskParts };
  const parts = 'EffectiveBasePermissions' in body
    ? toPermissionMaskParts(body.EffectiveBasePermissions)
    : toPermissionMaskParts(body);
  return decodeSharePointPermissionMask(parts);
}

async function fetchCurrentUser(siteUrl: string): Promise<{ isSiteAdmin: boolean; title?: string; email?: string }> {
  const response = await fetch(`${siteUrl}/_api/web/currentuser?$expand=Groups`, {
    headers: { Accept: 'application/json;odata=nometadata' },
  });
  if (!response.ok) {
    throw new Error(`Current-user lookup failed (${response.status}).`);
  }
  const body = (await response.json()) as {
    IsSiteAdmin?: boolean;
    Title?: string;
    Email?: string;
  };
  return {
    isSiteAdmin: Boolean(body.IsSiteAdmin),
    title: body.Title,
    email: body.Email,
  };
}

export async function resolvePriorityActionsAdminPermissions(
  siteUrl: string | undefined,
): Promise<PriorityActionsAdminPermissionResolution> {
  if (!siteUrl) {
    const permissions: PriorityActionsAdminPermissions = {
      canView: true,
      canEdit: true,
      canReorder: true,
      canArchive: true,
      canPublish: true,
    };
    return {
      status: 'simulated',
      permissions,
      posture: mapPermissionsToPosture(permissions),
      reason: 'Site URL unavailable; using simulated maintainer permissions.',
      user: { isSiteAdmin: false },
    };
  }

  try {
    const [user, configMask, itemsMask] = await Promise.all([
      fetchCurrentUser(siteUrl),
      fetchListMask(siteUrl, PRIORITY_ACTIONS_CONFIG_LIST_TITLE),
      fetchListMask(siteUrl, PRIORITY_ACTIONS_ITEMS_LIST_TITLE),
    ]);

    const permissions = toPermissions(configMask, itemsMask, user.isSiteAdmin);
    return {
      status: 'resolved',
      permissions,
      posture: mapPermissionsToPosture(permissions),
      user,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Permission resolution failed.';
    return {
      status: 'resolution-failed',
      permissions: NO_MUTATION_PERMISSIONS,
      posture: 'insufficient-permission',
      reason,
      user: { isSiteAdmin: false },
    };
  }
}
