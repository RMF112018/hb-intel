# PH6F-3 — Initialize the Feature Registration System

**Plan ID:** PH6F-3-Cleanup-FeatureRegistration
**Parent Plan:** PH6F-DeadWiring-Cleanup-Plan.md
**Blueprint Reference:** §4a (Feature-gate access control), §2b (Permission model)
**Foundation Plan Reference:** Phase 5B (featureRegistration.ts, FeatureGate, evaluateFeatureAccess)
**Priority:** HIGH
**Execution Order:** 1st in sequence — prerequisite for all other PH6F tasks
**Estimated Effort:** 2–3 hours
**Risk:** MEDIUM — activates access control; pages currently open to all roles may become gated

---

## Problem Statement

`@hbc/shell` exports a complete, tested access-control foundation:
- `createProtectedFeatureRegistry` — builds a registry from contract objects
- `defineProtectedFeatureRegistration` — creates a validated contract for a feature
- `validateProtectedFeatureRegistration` — validates contracts at dev-mode startup
- `FeatureGate` — React component that renders fallback for unauthorized access
- `isFeatureAccessible` / `evaluateFeatureAccess` — programmatic access evaluation

**None of this has ever been initialized.** The auth permission store (`usePermissionStore`) has
`setFeatureRegistrations()` and `registerFeature()` methods that accept feature contracts — they
have never been called with any data. As a result:

1. Every `FeatureGate` component, if ever added to a route, would pass unconditionally (no
   registrations to evaluate against)
2. `evaluateFeatureAccess()` has no contract data and returns permissive defaults
3. Access control is effectively non-functional at the route level

This is the most foundational gap — it must be resolved before PH6F-1 through PH6F-5 can be
meaningfully tested with per-role behavior.

---

## Step 1 — Define the PWA Feature Registry

**New file:** `apps/pwa/src/features/featureRegistry.ts`

```typescript
// apps/pwa/src/features/featureRegistry.ts
// D-PH6F-3: PWA feature registry — defines access contracts for all protected workspaces.
// Registered with usePermissionStore at bootstrap via main.tsx.

import {
  defineProtectedFeatureRegistration,
  createProtectedFeatureRegistry,
  validateProtectedFeatureRegistration,
  type ProtectedFeatureRegistrationContract,
} from '@hbc/shell';

// ─── Feature Contracts ────────────────────────────────────────────────────────

const projectHub = defineProtectedFeatureRegistration({
  featureId: 'feature:project-hub',
  route: { primaryPath: '/project-hub', allowRedirectRestore: true },
  navigation: { workspaceId: 'project-hub', showInNavigation: true },
  permissions: {
    requiredFeaturePermissions: ['feature:project-hub'],
    requiredActionPermissions: {},
  },
  visibility: 'always',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

const accounting = defineProtectedFeatureRegistration({
  featureId: 'feature:accounting',
  route: { primaryPath: '/accounting', allowRedirectRestore: true },
  navigation: { workspaceId: 'accounting', showInNavigation: true },
  permissions: {
    requiredFeaturePermissions: ['feature:accounting-invoice'],
    requiredActionPermissions: {},
  },
  visibility: 'always',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

const estimating = defineProtectedFeatureRegistration({
  featureId: 'feature:estimating',
  route: { primaryPath: '/estimating', allowRedirectRestore: true },
  navigation: { workspaceId: 'estimating', showInNavigation: true },
  permissions: {
    requiredFeaturePermissions: ['feature:estimating-projects'],
    requiredActionPermissions: {},
  },
  visibility: 'always',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

const businessDevelopment = defineProtectedFeatureRegistration({
  featureId: 'feature:business-development',
  route: { primaryPath: '/bd', allowRedirectRestore: true },
  navigation: { workspaceId: 'business-development', showInNavigation: true },
  permissions: {
    // BD permission key will be refined when the BD auth model is finalized in PH7.
    // Uses project-hub as a proxy for now (BD users are project stakeholders).
    requiredFeaturePermissions: ['feature:project-hub'],
    requiredActionPermissions: {},
  },
  visibility: 'always',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

const admin = defineProtectedFeatureRegistration({
  featureId: 'feature:admin',
  route: { primaryPath: '/admin', allowRedirectRestore: false },
  navigation: { workspaceId: 'admin', showInNavigation: true },
  permissions: {
    requiredFeaturePermissions: ['feature:admin-panel'],
    requiredActionPermissions: {},
  },
  visibility: 'always',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

// ─── Registry ─────────────────────────────────────────────────────────────────

const ALL_FEATURES: readonly ProtectedFeatureRegistrationContract[] = [
  projectHub,
  accounting,
  estimating,
  businessDevelopment,
  admin,
];

// D-PH6F-3: Validate all registrations at module load time in DEV.
// Throws immediately if any contract is misconfigured — catches issues at startup not runtime.
if (import.meta.env.DEV) {
  for (const feature of ALL_FEATURES) {
    const result = validateProtectedFeatureRegistration(feature);
    if (!result.valid) {
      throw new Error(
        `[HB Intel] Invalid feature registration for "${feature.featureId}": ${result.errors.join(', ')}`,
      );
    }
  }
}

export const FEATURE_REGISTRY = createProtectedFeatureRegistry(ALL_FEATURES);

/**
 * Flat list of all feature permission strings required by registered features.
 * Used as a cross-reference when verifying persona permission coverage.
 */
export const ALL_FEATURE_PERMISSION_KEYS = ALL_FEATURES.flatMap(
  (f) => f.permissions.requiredFeaturePermissions,
);
```

**Adding new features:** When a new module is added (Leadership, HR, OpEx, etc.), add its
`defineProtectedFeatureRegistration` entry here and add its permission key to
`DevAuthBypassAdapter.mapRolesToPermissions()` and `PERSONA_REGISTRY` entries.

---

## Step 2 — Register Features with `usePermissionStore` at Bootstrap

**File:** `apps/pwa/src/main.tsx` (before the router renders and before React.render is called)

Add the registration call immediately after the mock/MSAL bootstrap:

```typescript
import { FEATURE_REGISTRY } from './features/featureRegistry.js';
import { usePermissionStore } from '@hbc/auth';

// After bootstrapMockEnvironment() or MSAL initialization:
// D-PH6F-3: Register protected feature contracts with the permission store.
// This must run before any route guard or FeatureGate evaluation.
usePermissionStore.getState().setFeatureRegistrations(
  Object.values(FEATURE_REGISTRY),
);
```

**Verify the API name:** Check `usePermissionStore` in `packages/auth/src/stores/permissionStore.ts`
for the correct method to load feature registrations. The plan references `setFeatureRegistrations()`
but the actual method could be `registerFeature()` (single) or another name.

From the current `permissionStore.ts`:
```typescript
setFeatureRegistrations: (registrations: FeaturePermissionRegistration[]) => void;
registerFeature: (registration: FeaturePermissionRegistration) => void;
```

Use `setFeatureRegistrations()` with the full array — this replaces the entire registry in one
atomic call, which is correct for bootstrap-time initialization.

---

## Step 3 — Add `FeatureGate` to Workspace Routes (Progressive)

Once the registry is initialized, adding `FeatureGate` to routes enforces access control.
Apply to workspace routes as they exist or are built. This is the "progressive" part —
the registry initialization in Step 2 is critical; `FeatureGate` additions are ongoing.

**Pattern for any workspace route component:**

```typescript
// In the workspace route component — example: accounting route
import { FeatureGate } from '@hbc/auth'; // or @hbc/shell — verify export location

function AccountingRoute() {
  return (
    <FeatureGate featureId="feature:accounting" fallback={<AccessDenied />}>
      <AccountingPage />
    </FeatureGate>
  );
}
```

**`AccessDenied` component:** Create a shared component for the fallback:
```typescript
// apps/pwa/src/components/AccessDenied.tsx
export function AccessDenied() {
  return (
    <div className="access-denied">
      <h2>Access Denied</h2>
      <p>You don't have permission to view this page.</p>
    </div>
  );
}
```

---

## Step 4 — Verify `createProtectedFeatureRegistry` Return Type

Before implementing Step 2, check what `createProtectedFeatureRegistry()` returns. If it
returns a typed registry object rather than an array, the call in Step 2 needs adjustment:

```typescript
// If FEATURE_REGISTRY is an object with .getAll() or similar:
usePermissionStore.getState().setFeatureRegistrations(FEATURE_REGISTRY.getAll());

// Or if it returns a plain array:
usePermissionStore.getState().setFeatureRegistrations(FEATURE_REGISTRY);
```

Find `createProtectedFeatureRegistry` in `packages/shell/src/` and check its return type.

---

## Files Modified / Created

| Action | File |
|--------|------|
| Create | `apps/pwa/src/features/featureRegistry.ts` |
| Modify | `apps/pwa/src/main.tsx` (add registration call) |
| Create | `apps/pwa/src/components/AccessDenied.tsx` |
| Modify | Route components (progressive — add FeatureGate as routes are built) |

---

## Verification Commands

```bash
# 1. TypeScript check
pnpm turbo run type-check

# 2. Build
pnpm turbo run build

# 3. Dev verification — select AccountingUser persona in DevToolbar, then:
pnpm --filter pwa dev

# a. As AccountingUser:
#    Navigate to /accounting — should render (has feature:accounting-invoice)
#    Navigate to /admin — should show AccessDenied (no feature:admin-panel)

# b. As Administrator:
#    Navigate to /admin — should render

# c. As Member:
#    Navigate to /project-hub — should render (has feature:project-hub)
#    Navigate to /accounting — should show AccessDenied

# 4. Check permissionStore state in React DevTools:
#    featureRegistrations should have 5 entries (projectHub, accounting, estimating, bd, admin)
```

---

## Success Criteria

- [ ] PH6F-3.1 `featureRegistry.ts` created with 5 initial feature contracts
- [ ] PH6F-3.2 `validateProtectedFeatureRegistration` runs at module load in DEV mode
- [ ] PH6F-3.3 `FEATURE_REGISTRY` registered with `usePermissionStore` at bootstrap
- [ ] PH6F-3.4 `FeatureGate` blocks access for personas without the required permission
- [ ] PH6F-3.5 `FeatureGate` passes access for personas with the required permission
- [ ] PH6F-3.6 `AccessDenied` fallback component created and wired to `FeatureGate`
- [ ] PH6F-3.7 Build passes with zero TypeScript errors

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
Status: Pending implementation
Execution: First in sequence — all other PH6F tasks depend on this
Key verification: Check createProtectedFeatureRegistry return type before Step 2
-->
