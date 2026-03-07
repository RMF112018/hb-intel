# PH6F.2 – Persona Registry Alignment

**Plan ID:** PH6F.2-Cleanup-PersonaRegistryAlignment
**Parent Plan:** PH6F-DeadWiring-DevAuth-Cleanup-Plan.md
**Blueprint Reference:** §5c (DevToolbar / Persona System)
**Foundation Plan Reference:** Phase 5C.4 (DevAuthBypassAdapter mapRolesToPermissions)
**Gaps Addressed:** DA-07, DA-08, DA-09
**Execution Order:** 1st (prerequisite for PH6F.1)
**Estimated Effort:** 1–2 hours
**Risk:** LOW — changes are confined to DevAuthBypassAdapter; no production code path

---

## Problem Statement

`DevAuthBypassAdapter.normalizeSession()` internally calls `mapRolesToPermissions(roles: string[])`
to build the `ISessionData.permissions` map. This method has two critical problems:

**DA-07 — Ignored Persona Permissions**
When `useDevAuthBypass.selectPersona()` calls `adapter.normalizeSession()`, it passes
`roles: persona.roles` but does NOT pass `persona.permissions`. The adapter then regenerates
permissions from scratch using only role names, discarding the carefully defined permissions
in the `IPersona.permissions` field of the registry.

**DA-08 — Incomplete Permission Key Set**
`mapRolesToPermissions()` generates 11 permission keys. The persona registry defines 17 keys
per persona. 6 permission keys are completely absent from the adapter:
- `feature:audit-logs`
- `feature:override-requests`
- `action:read`
- `action:write`
- `action:delete`
- `action:approve`

**DA-09 — Role-Based Regeneration Is Structurally Wrong**
Beyond the key count issue, the fundamental problem is that a role-based permission map is
inherently less precise than the persona-defined permissions. The `Executive` persona has
`action:approve: true` but `action:write: false`. There is no way to express this nuance through
simple role-name inclusion checks — the adapter's `mapRolesToPermissions()` would require
increasingly complex logic to replicate what the registry already defines per persona.

---

## Solution Strategy

The fix has two parts:

**Part A:** Fix `useDevAuthBypass.selectPersona()` (in PH6F.1) to override the adapter's
generated permissions with `persona.permissions` after `normalizeSession()` returns. This is
the primary fix for runtime behavior — it means the persona registry is always authoritative
regardless of what the adapter generates.

**Part B (this task):** Fix `mapRolesToPermissions()` in `DevAuthBypassAdapter` to add all
missing permission keys. This is a defense-in-depth fix and also makes the adapter usable for
cases where the adapter is called without a persona context (e.g., `acquireIdentity()` alone).

Additionally, add a new `normalizeSessionWithPermissions()` method to `DevAuthBypassAdapter`
that accepts a pre-computed `permissions` map, bypassing `mapRolesToPermissions()` entirely.
This creates a clean API for persona-aware normalization.

---

## Step 1 — Fix `mapRolesToPermissions()` in `DevAuthBypassAdapter.ts`

**File:** `packages/auth/src/adapters/DevAuthBypassAdapter.ts` (lines 280–307)

**Current implementation:**
```typescript
private mapRolesToPermissions(roles: string[]): Record<string, boolean> {
  const permissions: Record<string, boolean> = {
    'feature:view-dashboard': true,
    'feature:view-profile': true,
    'feature:admin-panel': roles.includes('Administrator'),
    'feature:user-management': roles.includes('Administrator'),
    'feature:system-settings': roles.includes('Administrator'),
    'feature:accounting-invoice': roles.includes('AccountingUser'),
    'feature:accounting-reports': roles.includes('AccountingUser'),
    'feature:estimating-projects': roles.includes('EstimatingUser'),
    'feature:estimating-quotes': roles.includes('EstimatingUser'),
    'feature:project-hub': roles.includes('ProjectUser'),
    'feature:project-tracking': roles.includes('ProjectUser'),
  };
  return permissions;
}
```

**Replacement — add 6 missing keys:**
```typescript
private mapRolesToPermissions(roles: string[]): Record<string, boolean> {
  // D-PH6F-02: Full 17-key permission set aligned with IPersona.permissions in personaRegistry.ts.
  // Order matches personaRegistry.ts key order for diff readability.
  const isAdmin = roles.includes('Administrator');
  const isAccounting = roles.includes('AccountingUser');
  const isEstimating = roles.includes('EstimatingUser');
  const isProject = roles.includes('ProjectUser');
  const isExecutive = roles.includes('Executive') || roles.includes('Manager');
  const canApprove = isAdmin || isEstimating || isExecutive;
  const canWrite = isAdmin || isAccounting || isEstimating || isProject;
  const canDelete = isAdmin;
  const canRead = true; // All authenticated users have read access

  return {
    // Administrative features
    'feature:admin-panel': isAdmin,
    'feature:user-management': isAdmin,
    'feature:system-settings': isAdmin,
    'feature:override-requests': isAdmin,          // DA-09 — was missing
    'feature:audit-logs': isAdmin || isExecutive,  // DA-09 — was missing

    // Module-specific features
    'feature:accounting-invoice': isAdmin || isAccounting || isExecutive,
    'feature:accounting-reports': isAdmin || isAccounting || isExecutive,
    'feature:estimating-projects': isAdmin || isEstimating || isExecutive,
    'feature:estimating-quotes': isAdmin || isEstimating || isExecutive,
    'feature:project-hub': isAdmin || isProject || isExecutive,
    'feature:project-tracking': isAdmin || isProject || isExecutive,

    // Universal features
    'feature:view-dashboard': true,
    'feature:view-profile': true,

    // Standard action permissions — DA-09, were entirely missing
    'action:read': canRead,
    'action:write': canWrite,
    'action:delete': canDelete,
    'action:approve': canApprove,
  };
}
```

**Note on role-based approximation:** This updated `mapRolesToPermissions()` is a best-effort
role-to-permission mapping. It will produce permission sets that are close to, but not identical
to, the registry-defined persona permissions for edge cases (e.g., Executive role has
`action:write: false` in the registry but the role-based map might grant write access). The
registry-defined permissions in `PERSONA_REGISTRY` are always authoritative. The override in
`selectPersona()` (PH6F.1 Step 2b) uses `persona.permissions` directly, so the adapter's
`mapRolesToPermissions()` result is only used when no persona is available.

---

## Step 2 — Add `normalizeSessionWithPermissions()` Method

Add a new method to `DevAuthBypassAdapter` that accepts an explicit permissions map, bypassing
the role-based generation entirely. This creates a clean, explicit API for persona-aware
normalization and avoids the need for the override pattern in `useDevAuthBypass`.

**File:** `packages/auth/src/adapters/DevAuthBypassAdapter.ts`

Add immediately after `normalizeSession()` (after line 177):

```typescript
/**
 * normalizeSessionWithPermissions()
 * ===================================
 * D-PH6F-02: Variant of normalizeSession() that accepts an explicit permissions map.
 * Use this when a PERSONA_REGISTRY entry is available so that the registry-defined
 * permissions are used directly rather than regenerated from roles.
 *
 * This is the preferred method when called from useDevAuthBypass.selectPersona().
 */
async normalizeSessionWithPermissions(
  rawIdentity: IMockIdentity,
  explicitPermissions: Record<string, boolean>,
): Promise<ISessionData> {
  const startTime = performance.now();
  performance.mark('auth:normalize-session-with-perms-start');

  await this.delay(50);

  const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours

  const session: ISessionData = {
    sessionId: rawIdentity.metadata.sessionId,
    userId: rawIdentity.userId,
    displayName: rawIdentity.displayName,
    email: rawIdentity.email,
    roles: rawIdentity.roles,
    permissions: explicitPermissions,   // use registry-defined permissions directly
    expiresAt,
    acquiredAt: rawIdentity.metadata.loginTimestamp,
  };

  // Persist to sessionStorage
  sessionStorage.setItem(
    'hb-auth-dev-session',
    JSON.stringify({ version: 1, session }),
  );

  const elapsedMs = performance.now() - startTime;
  performance.mark('auth:normalize-session-with-perms-end');
  performance.measure(
    'auth:normalize-session-with-perms',
    'auth:normalize-session-with-perms-start',
    'auth:normalize-session-with-perms-end',
  );

  this.auditLog('NORMALIZE_SESSION_WITH_PERMS', rawIdentity.userId, elapsedMs);
  this.emit('auth:session-normalized', { session, elapsedMs });

  console.log(
    `[HB-AUTH-DEV] normalizeSessionWithPermissions completed in ${elapsedMs.toFixed(2)}ms`,
  );

  return session;
}
```

---

## Step 3 — Update `useDevAuthBypass.selectPersona()` to Use New Method

Once `normalizeSessionWithPermissions()` exists, update the call in `useDevAuthBypass.ts`
to use it. This eliminates the need for the permissions override in PH6F.1 Step 2b, replacing
it with a direct call:

```typescript
// In selectPersona() — use normalizeSessionWithPermissions instead of normalizeSession:
const session = await adapter.normalizeSessionWithPermissions(
  {
    ...identity,
    userId: persona.id,
    displayName: persona.name,
    email: persona.email,
    roles: persona.roles,
  },
  persona.permissions,   // pass registry permissions directly
);
// No override needed — session.permissions === persona.permissions
setCurrentSession(session);
```

**Note:** If implementing PH6F.2 and PH6F.1 together, use this approach instead of the
`enrichedSession` override pattern documented in PH6F.1 Step 2b. They are equivalent but this
is cleaner since the permissions are set at the source rather than overridden after the fact.

---

## Step 4 — Update TypeScript Export from `@hbc/auth/dev`

Verify that `packages/auth/src/dev.ts` (or equivalent dev-only barrel) exports the updated
`DevAuthBypassAdapter` including the new method. No new export is required since it's an
instance method — existing consumers will automatically gain access through the existing class.

If `packages/auth/src/dev.ts` does not exist, check `packages/auth/package.json` for the
`./dev` subpath export configuration and verify the correct entry file.

---

## Key Differences: Before and After

### Before (11 keys, role-regenerated)

Selecting "EstimatingUser" persona via DevToolbar produces:
```javascript
{
  'feature:view-dashboard': true,
  'feature:view-profile': true,
  'feature:admin-panel': false,
  'feature:user-management': false,
  'feature:system-settings': false,
  'feature:accounting-invoice': false,
  'feature:accounting-reports': false,
  'feature:estimating-projects': true,
  'feature:estimating-quotes': true,
  'feature:project-hub': false,
  'feature:project-tracking': false,
  // MISSING: feature:audit-logs, feature:override-requests
  // MISSING: action:read, action:write, action:delete, action:approve
}
```

### After (17 keys, registry-sourced via normalizeSessionWithPermissions)

Selecting "EstimatingUser" persona via DevToolbar produces (from `PERSONA_REGISTRY`):
```javascript
{
  'feature:admin-panel': false,
  'feature:user-management': false,
  'feature:system-settings': false,
  'feature:override-requests': false,   // ✅ now present
  'feature:audit-logs': false,           // ✅ now present
  'feature:accounting-invoice': false,
  'feature:accounting-reports': false,
  'feature:estimating-projects': true,
  'feature:estimating-quotes': true,
  'feature:project-hub': false,
  'feature:project-tracking': false,
  'feature:view-dashboard': true,
  'feature:view-profile': true,
  'action:read': true,                   // ✅ now present
  'action:write': true,                  // ✅ now present
  'action:delete': false,                // ✅ now present
  'action:approve': true,                // ✅ now present
}
```

---

## Files Modified

| Action | File |
|--------|------|
| Modify | `packages/auth/src/adapters/DevAuthBypassAdapter.ts` |

---

## Verification Commands

```bash
# 1. TypeScript compile check
cd packages/auth && pnpm tsc --noEmit

# 2. Verify new method is callable from shell package
cd packages/shell && pnpm tsc --noEmit

# 3. Full build
pnpm turbo run build

# 4. Manual verification via browser console (after PH6F.1 is also applied):
# Select any non-admin persona (e.g., AccountingUser)
# Run in browser console:
#   window.__authStore = (await import('@hbc/auth')).useAuthStore.getState()
#   console.log(window.__authStore.session.permissionSummary.grants)
# Expected: includes 'feature:accounting-invoice', 'action:read', does NOT include 'feature:admin-panel'

# 5. Unit test for mapRolesToPermissions
# Run: pnpm --filter @hbc/auth test
# Look for: DevAuthBypassAdapter permission mapping tests
```

---

## Notes on Permission Key Naming

The permission keys follow two naming conventions used in the registry:

- `feature:*` — coarse feature-level access gates (controls which modules/sections are visible)
- `action:*` — fine-grained action gates (controls read/write/delete/approve operations)
- `_system:*`, `_session:*`, `_override:*` — special flags for supplemental personas only

The `_*` prefixed flags (`_override:pending`, `_session:expired`, `_system:degraded`) are
supplemental persona markers and should NOT be passed to `usePermissionStore.setPermissions()`
— they are DevToolbar-internal signals. The `extractGrantedPermissions()` utility introduced in
PH6F.1 will include them since they are truthy boolean entries. Consider filtering them out:

```typescript
// In extractGrantedPermissions() — filter internal flags:
export function extractGrantedPermissions(permissions: Record<string, boolean>): string[] {
  return Object.entries(permissions)
    .filter(([key, allowed]) => allowed && !key.startsWith('_'))
    .map(([permissionKey]) => permissionKey);
}
```

This ensures internal flags don't pollute the permission store and cause unexpected behavior
in feature gate evaluations.

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
Status: Implementation complete (2026-03-07)
Execution: First in sequence (PH6F.1 depends on this)
Next: Implement mapRolesToPermissions fix, add normalizeSessionWithPermissions method
2026-03-07: Step 1 complete — DevAuthBypassAdapter.mapRolesToPermissions updated to the required 17-key set including feature:override-requests, feature:audit-logs, action:read, action:write, action:delete, and action:approve.
2026-03-07: Step 2 complete — DevAuthBypassAdapter.normalizeSessionWithPermissions(rawIdentity, explicitPermissions) added exactly per PH6F.2 with D-PH6F-02 JSDoc, timing marks, audit log, and session storage persistence.
2026-03-07: Verification complete — pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell, package lint/check-types, and manual persona-permission alignment validation all passed with zero blocking errors.
2026-03-07: PH6F.2 checklist status set to complete in PH6F-DeadWiring-DevAuth-Cleanup-Plan.md for Permission Accuracy + mapRolesToPermissions test coverage items.
-->
