/**
 * SPFx RBAC Adapter — resolves SharePoint site group membership
 * to HB Intel permission keys.
 *
 * @see docs/architecture/plans/PH7-BW-7-SPFx-RBAC-Mapping.md
 * @decision D-PH7-BW-7
 */
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/site-groups';
import '@pnp/sp/site-users';

/**
 * Maps SharePoint site group names to HB Intel permission keys.
 * Covers all 12 SP groups defined in the provisioning saga (Phase 6).
 */
export const SP_GROUP_TO_PERMISSIONS: Record<string, string[]> = {
  'HB Intel Administrators': [
    'admin:read', 'admin:write', 'admin:delete', 'admin:approve',
    'action:read', 'action:write', 'action:delete', 'action:approve',
    'feature:audit-logs', 'feature:override-requests',
    'accounting:read', 'accounting:write',
    'estimating:read', 'estimating:write',
    'provisioning:read', 'provisioning:write', 'provisioning:approve',
    'project:read', 'project:write',
    'leadership:read',
    'business-development:read', 'business-development:write',
  ],
  'HB Intel Accounting Managers': [
    'accounting:read', 'accounting:write',
    'provisioning:read', 'provisioning:write',
    'action:read', 'action:write',
    'project:read',
  ],
  'HB Intel Estimating Coordinators': [
    'estimating:read', 'estimating:write',
    'provisioning:read',
    'action:read', 'action:write',
    'project:read',
    'business-development:read',
  ],
  'HB Intel Project Executives': [
    'project:read', 'project:write', 'project:approve',
    'action:read', 'action:write', 'action:approve',
    'estimating:read',
    'accounting:read',
    'leadership:read',
  ],
  'HB Intel Project Managers': [
    'project:read', 'project:write',
    'action:read', 'action:write',
    'estimating:read',
    'accounting:read',
  ],
  'HB Intel BD Managers': [
    'business-development:read', 'business-development:write',
    'action:read', 'action:write',
  ],
  'HB Intel Directors': [
    'business-development:read', 'business-development:write', 'business-development:approve',
    'action:read', 'action:write', 'action:approve',
    'project:read',
    'leadership:read',
  ],
  'HB Intel Safety Managers': [
    'safety:read', 'safety:write',
    'action:read', 'action:write',
    'project:read',
  ],
  'HB Intel QC Managers': [
    'quality-control:read', 'quality-control:write',
    'warranty:read', 'warranty:write',
    'action:read', 'action:write',
    'project:read',
  ],
  'HB Intel Risk Managers': [
    'risk:read', 'risk:write',
    'action:read', 'action:write',
    'project:read',
  ],
  'HB Intel Field Personnel': [
    'safety:read',
    'quality-control:read',
    'action:read',
    'project:read',
  ],
  'HB Intel Leadership': [
    'leadership:read', 'leadership:write',
    'project:read',
    'accounting:read',
    'estimating:read',
    'action:read', 'action:approve',
    'feature:audit-logs',
  ],
};

/**
 * Resolves the current SPFx user's permission keys by reading their
 * SharePoint site group memberships and mapping to HB Intel permission keys.
 *
 * Called from BaseClientSideWebPart.onInit() before bootstrapSpfxAuth().
 */
export async function resolveSpfxPermissions(context: WebPartContext): Promise<string[]> {
  try {
    const sp = spfi().using(SPFx(context));
    const currentUser = await sp.web.currentUser();
    const userGroups = await sp.web.siteUsers
      .getById(currentUser.Id)
      .groups();

    const permissionKeys = new Set<string>();

    for (const group of userGroups) {
      const mapped = SP_GROUP_TO_PERMISSIONS[group.Title];
      if (mapped) {
        mapped.forEach((key) => permissionKeys.add(key));
      }
    }

    return Array.from(permissionKeys);
  } catch (error) {
    console.error('[HB Intel] Failed to resolve SPFx permissions:', error);
    return ['project:read', 'action:read'];
  }
}
