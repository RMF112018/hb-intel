# PH7-BW-7 — SPFx RBAC & Permission Mapping: SharePoint Groups → Permission Keys

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md §2b (dual-mode auth), §4a (permissions & RBAC)
**Date:** 2026-03-07
**Priority:** MEDIUM — Required before any route-level access control works in SharePoint
**Depends on:** BW-2 (bootstrapSpfxAuth provides WebPartContext and stores auth state)
**Blocks:** Feature route guards (FeatureGate, PermissionGate, RoleGate) in all domains

---

## Summary

In the PWA, permissions come from Azure AD group membership resolved by MSAL. In SPFx webparts, there is no MSAL — permissions must be resolved from the user's SharePoint site group membership using the SharePoint REST API or PnPjs.

This task implements `resolveSpfxPermissions()` — an async function called during `WebPart.onInit()` that:
1. Reads the current user's SharePoint group memberships for the current site
2. Maps those group names to the HB Intel permission key set
3. Returns the resolved `string[]` to `bootstrapSpfxAuth()`

This ensures that `usePermissionStore.getState().getPermission('accounting:read')` (for example) returns the correct boolean in both PWA and SPFx modes.

---

## SharePoint Group Naming Convention (Locked)

HB Intel uses a consistent SharePoint group naming convention across all sites. Groups must be pre-created in each SharePoint site collection as part of the provisioning saga (Phase 6):

| SP Group Name | HB Intel Role | Example Domains |
|---|---|---|
| `HB Intel Administrators` | Administrator | admin, all sites |
| `HB Intel Accounting Managers` | Accounting Manager | accounting |
| `HB Intel Estimating Coordinators` | Estimating Coordinator | estimating, project-hub |
| `HB Intel Project Executives` | Project Executive | project-hub, leadership |
| `HB Intel Project Managers` | Project Manager | project-hub, all project sites |
| `HB Intel BD Managers` | BD Manager | business-development |
| `HB Intel Directors` | Director of Preconstruction | business-development |
| `HB Intel Safety Managers` | Safety Manager | safety |
| `HB Intel QC Managers` | QC Manager | quality-control-warranty |
| `HB Intel Risk Managers` | Risk Manager | risk-management |
| `HB Intel Field Personnel` | Field (read-only most domains) | safety, quality-control-warranty |
| `HB Intel Leadership` | VP / Leadership | leadership, all sites |

---

## Permission Key Mapping (SP Group → Permission Keys)

This mapping must be consistent with the PersonaRegistry in `packages/auth/src/mock/personaRegistry.ts` (which defines the same role→permission relationships for mock/dev mode). The 17-key permission set (from PH6F.2) is the canonical reference.

```typescript
// packages/auth/src/spfx/SpfxRbacAdapter.ts

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
    'provisioning:read', 'provisioning:write', // trigger provisioning
    'action:read', 'action:write',
    'project:read',
  ],
  'HB Intel Estimating Coordinators': [
    'estimating:read', 'estimating:write',
    'provisioning:read', // view status; cannot trigger
    'action:read', 'action:write',
    'project:read',
    'business-development:read', // receive handoff package
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
```

---

## resolveSpfxPermissions() Implementation

```typescript
// packages/auth/src/spfx/SpfxRbacAdapter.ts (continued)

import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/site-groups';
import '@pnp/sp/site-users';

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
    // Fail open with read-only permissions rather than crashing the webpart
    console.error('[HB Intel] Failed to resolve SPFx permissions:', error);
    return ['project:read', 'action:read']; // Minimum safe default
  }
}
```

---

## WebPart Entry Point Update (Replaces BW-1 Stub)

Update `[Domain]WebPart.ts` (BW-1 created this with a stub):

```typescript
// apps/accounting/src/webparts/accounting/AccountingWebPart.ts
import { bootstrapSpfxAuth } from '@hbc/auth/spfx';
import { resolveSpfxPermissions } from '@hbc/auth/spfx';

public async onInit(): Promise<void> {
  await super.onInit();
  // Resolve permissions BEFORE bootstrapping — auth store needs both user + permissions
  const permissionKeys = await resolveSpfxPermissions(this.context);
  await bootstrapSpfxAuth(this.context, permissionKeys);
}
```

---

## Domain-Specific Permission Gating Reference

Each domain's feature routes should gate access using the permission keys resolved above. The following table defines the minimum permission key required to access each domain's default route:

| Domain | Minimum Read Permission | Admin-Only Features |
|---|---|---|
| accounting | `accounting:read` | `accounting:write` for invoice actions |
| estimating | `estimating:read` | `estimating:write` for bid submission |
| project-hub | `project:read` | `project:write` for plan updates |
| leadership | `leadership:read` | `leadership:write` for forecast edits |
| business-development | `business-development:read` | `business-development:approve` for director review |
| admin | `admin:read` | `admin:write` for settings changes |
| safety | `safety:read` | `safety:write` for incident creation |
| quality-control-warranty | `quality-control:read` | `quality-control:write` for punch list |
| risk-management | `risk:read` | `risk:write` for register updates |
| operational-excellence | `action:read` | `action:write` for process logging |
| human-resources | `project:read` | *(no domain-specific permission yet — BW-11 scope)* |

---

## Verification

```bash
# TypeScript check — SpfxRbacAdapter
pnpm tsc --noEmit -p packages/auth/tsconfig.json

# Verify @pnp/sp is in auth package dependencies
grep "@pnp/sp" packages/auth/package.json

# Check SP_GROUP_TO_PERMISSIONS covers all 17 canonical permission keys
node -e "
  const { SP_GROUP_TO_PERMISSIONS } = require('./packages/auth/src/spfx/SpfxRbacAdapter.js');
  const all = new Set(Object.values(SP_GROUP_TO_PERMISSIONS).flat());
  console.log('Unique permission keys:', all.size);
  console.log(Array.from(all).sort());
"
```

**Manual verification (requires SharePoint dev tenant):**
1. Add test user to `HB Intel Accounting Managers` group on a test site
2. Load the Accounting webpart on that site
3. Inspect `usePermissionStore.getState().permissions` in browser console
4. Confirm `accounting:read` and `accounting:write` are present; `admin:read` is absent

---

## Definition of Done

- [x] `packages/auth/src/spfx/SpfxRbacAdapter.ts` created with `SP_GROUP_TO_PERMISSIONS` map and `resolveSpfxPermissions()`
- [x] `resolveSpfxPermissions()` exported from `packages/auth/src/spfx/index.ts`
- [x] All 11 `[Domain]WebPart.ts` files updated to call `resolveSpfxPermissions()` before `bootstrapSpfxAuth()`
- [x] Permission map covers all 12 SP group names
- [x] Permission map is consistent with PersonaRegistry permission assignments (cross-reference verified)
- [x] `resolveSpfxPermissions()` has error fallback (does not crash webpart on permission resolution failure)
- [x] `@pnp/sp` dependency added to `packages/auth/package.json`
- [ ] TypeScript compiles without errors
- [ ] Domain-specific permission gating table documented above is referenced in each domain's feature plan

<!-- IMPLEMENTATION PROGRESS & NOTES
BW-7 implemented: 2026-03-08
- Created packages/auth/src/spfx/SpfxRbacAdapter.ts with SP_GROUP_TO_PERMISSIONS (12 groups) and resolveSpfxPermissions()
- Exported resolveSpfxPermissions and SP_GROUP_TO_PERMISSIONS from packages/auth/src/spfx/index.ts
- Updated all 11 [Domain]WebPart.tsx files: replaced commented-out stubs with live resolveSpfxPermissions() → bootstrapSpfxAuth() calls
- Added @pnp/sp ^4.0.0 to packages/auth/package.json dependencies
- Error fallback returns ['project:read', 'action:read'] minimum safe default
- 14 file operations total (1 new, 13 modified)
-->
