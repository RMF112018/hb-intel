# @hbc/auth

Authentication, authorization, and access-governance foundation for HB Intel.

`@hbc/auth` provides identity normalization, auth lifecycle management, permission evaluation, a declarative guard suite, governance workflows, and structured audit logging. It guarantees one shared auth model across PWA and SPFx runtime modes.

---

## Installation

This package is internal to the HB Intel monorepo. Add it as a workspace dependency:

```json
{
  "dependencies": {
    "@hbc/auth": "workspace:*"
  }
}
```

Peer dependencies: `react ^18.0.0`.

Optional dependencies (required for MSAL-based PWA auth):
- `@azure/msal-browser ^4.0.0`
- `@azure/msal-react ^3.0.0`

---

## Entry points

| Subpath | Import | Purpose |
|---------|--------|---------|
| `.` | `@hbc/auth` | Main barrel — guards, hooks, stores, adapters, workflows, admin, audit, types |
| `./dev` | `@hbc/auth/dev` | Dev-mode adapters and mock bootstrap helpers (tree-shaken from production) |
| `./spfx` | `@hbc/auth/spfx` | SPFx host-bridge bootstrap and adapter seam |

---

## Guards

### ProtectedContentGuard

Shell-level lifecycle boundary that resolves all runtime, auth, role, and permission checks before rendering protected content. Intended as a root-layout wrapper.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Protected content to render when all checks pass |
| `currentPathname` | `string` | — | Current route pathname (resolved by the caller from router context) |
| `requiredRole` | `string` | — | Role the user must hold |
| `requiredPermission` | `string` | — | Permission action the user must have |
| `supportedRuntimeModes` | `readonly AuthMode[]` | — | Restrict to specific runtime modes |
| `onCaptureRedirect` | `(pathname: string) => void` | — | Called when a redirect-worthy denial captures the current path |
| `onRequestAccessSubmit` | `AccessRequestSubmitter` | — | Handler for inline access-request submission |
| `requestAccessSeed` | `Omit<RequestAccessSubmission, 'requestedAt'>` | — | Seed data for the access request form |
| `onSignInAgain` | `() => void` | — | Handler for re-authentication CTA |
| `onRetryBootstrap` | `() => void` | — | Handler for bootstrap/restore retry |
| `onGoHome` | `() => void` | — | Navigation handler for access-denied surface |
| `onGoBack` | `() => void` | — | Navigation handler for access-denied surface |
| `loadingSurface` | `ReactNode` | `<ShellBootstrapSurface>` | Custom bootstrap loading surface |
| `restoreSurface` | `ReactNode` | `<SessionRestoreSurface>` | Custom session restore surface |
| `reauthSurface` | `ReactNode` | `<ExpiredSessionSurface>` | Custom re-auth required surface |
| `unsupportedSurface` | `ReactNode` | `<UnsupportedRuntimeSurface>` | Custom unsupported runtime surface |
| `fatalSurface` | `ReactNode` | `<FatalStartupSurface>` | Custom fatal error surface |
| `accessDeniedSurface` | `ReactNode` | `<AccessDenied>` | Custom access-denied surface |

Guard resolution follows strict precedence: runtime support → auth/session state → role authorization → permission authorization.

### PermissionGate

Inline permission guard. Renders children only when the user holds the required permission.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `action` | `string` | — | Permission action string (e.g. `"project:create"`) |
| `featureId` | `string` | — | Feature identifier for registration-aware access checks |
| `standardAction` | `StandardActionPermission` | `'view'` | Action level for feature-based checks |
| `children` | `ReactNode` | — | Content to render when permitted |
| `fallback` | `ReactNode` | `null` | Content to render when denied |

### FeatureGate

Feature-flag and registration-aware guard. Supports both legacy flag-only features and registered features with default-deny rules.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `feature` | `string` | — | Feature key |
| `action` | `StandardActionPermission` | `'view'` | Action for registration-aware evaluation |
| `children` | `ReactNode` | — | Content to render when enabled/accessible |
| `fallback` | `ReactNode` | `null` | Content to render when disabled |
| `lockedFallback` | `ReactNode` | `fallback` | Content to render when the feature is locked |

### RoleGate

Role-based guard. Renders children only when the user holds the required role.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `requiredRole` | `string` | — | Role name the user must hold |
| `children` | `ReactNode` | — | Content to render when authorized |
| `fallback` | `ReactNode` | `null` | Content to render when denied |

### AccessDenied

Structured access-denied surface with audit logging and optional request-access entry point. Automatically records a structured audit event on mount.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Access denied'` | Heading text |
| `message` | `string` | `'You do not currently have permission...'` | Explanatory message |
| `onGoHome` | `(() => void) \| null` | `null` | Show "Go to Project Hub" CTA |
| `onGoBack` | `(() => void) \| null` | `null` | Show "Go back" CTA |
| `onRequestAccess` | `(() => void) \| null` | `null` | Show "Request access" CTA |
| `onSubmitAccessRequest` | `AccessRequestSubmitter` | — | Show inline "Submit access request" CTA |
| `requestAccessSeed` | `Omit<RequestAccessSubmission, 'requestedAt'>` | — | Seed data for inline submission |

### Recovery surfaces

Five recovery surfaces rendered by `ProtectedContentGuard` when lifecycle phases require user action:

| Component | Phase | Purpose |
|-----------|-------|---------|
| `ShellBootstrapSurface` | `bootstrapping` | Loading/startup indicator with optional retry |
| `SessionRestoreSurface` | `restoring` | Session restoration indicator with optional retry |
| `ExpiredSessionSurface` | `reauth-required` | Prompt to sign in again |
| `UnsupportedRuntimeSurface` | `runtime-unsupported` | Environment not supported message |
| `FatalStartupSurface` | `error` | Fatal startup failure with retry option |

---

## Hooks

| Hook | Signature | Description |
|------|-----------|-------------|
| `useCurrentUser` | `() => ICurrentUser \| null` | Current authenticated user from the auth store |
| `useCurrentSession` | `() => NormalizedAuthSession \| null` | Normalized session for guard/hook consumers |
| `useResolvedRuntimeMode` | `() => AuthMode \| null` | Resolved runtime mode (PWA, SPFx, mock, etc.) |
| `usePermission` | `(action: string) => boolean` | Whether the user holds a specific permission |
| `usePermissionEvaluation` | `(featureId: string, action?: StandardActionPermission) => FeatureAccessEvaluation` | Full feature-access evaluation result |
| `useFeatureFlag` | `(feature: string) => boolean` | Whether a feature flag is enabled |

---

## Stores

### useAuthStore

Central auth lifecycle, session, and runtime mode store (Zustand). Owns the lifecycle phase machine (`idle` → `bootstrapping` → `authenticated` / `restoring` / `reauth-required` / `error` / `signed-out`).

**Key selectors:**

| Selector hook | Returns |
|---------------|---------|
| `useAuthLifecycleSelector()` | `{ lifecyclePhase, runtimeMode, isLoading }` |
| `useAuthBootstrapSelector()` | `{ authReady, permissionsReady, shellReadyToRender }` |
| `useAuthSessionSummarySelector()` | `{ userId, runtimeMode, resolvedRoles }` |
| `useAuthPermissionSummarySelector()` | `{ grants, overrides }` |

**Imperative access (outside React):**

```ts
const user = useAuthStore.getState().currentUser;
const session = useAuthStore.getState().session;
const phase = useAuthStore.getState().lifecyclePhase;
```

### usePermissionStore

Permission grants, feature flags, and feature registrations store (Zustand).

**Key methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `hasPermission` | `(action: string) => boolean` | Check permission with effective-set resolution |
| `hasFeatureFlag` | `(feature: string) => boolean` | Check feature flag |
| `hasFeatureAccess` | `(featureId, action?, runtimeMode?) => boolean` | Registration-aware access check |
| `getFeatureAccess` | `(featureId, action?, runtimeMode?) => FeatureAccessEvaluation` | Full evaluation result |
| `setPermissions` | `(permissions: string[]) => void` | Replace permission grants |
| `setFeatureFlags` | `(flags: Record<string, boolean>) => void` | Replace feature flags |
| `setFeatureRegistrations` | `(registrations: FeaturePermissionRegistration[]) => void` | Replace registrations |
| `registerFeature` | `(registration: FeaturePermissionRegistration) => void` | Add a single registration |

---

## TanStack Router integration

`@hbc/auth` does not depend on `@tanstack/react-router` — the router is an app-level concern. Instead, it provides two complementary integration patterns: imperative guards for route-level enforcement and declarative guards for component-level access control.

### Imperative route guards (beforeLoad)

Use Zustand `.getState()` to access auth and permission state outside the React tree. This is the canonical TanStack Router auth pattern — the PWA already uses this approach in `apps/pwa/src/router/route-guards.ts`.

```ts
import { redirect } from '@tanstack/react-router';
import { useAuthStore, usePermissionStore } from '@hbc/auth';

/** Require authenticated user. Redirect to root if not logged in. */
export function requireAuth(): void {
  const user = useAuthStore.getState().currentUser;
  if (!user) {
    throw redirect({ to: '/' });
  }
}

/** Require specific permission. Redirect if unauthorized. */
export function requirePermission(action: string): void {
  requireAuth();
  const hasIt = usePermissionStore.getState().hasPermission(action);
  if (!hasIt) {
    throw redirect({ to: '/project-hub' });
  }
}
```

Use in route definitions:

```ts
export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/access-control',
  beforeLoad: () => {
    requirePermission('admin:access-control:view');
  },
  component: AdminAccessControlPage,
});
```

### Declarative component guards

Use `PermissionGate`, `RoleGate`, or `FeatureGate` inside any route component to conditionally render content based on the user's access:

```tsx
import { PermissionGate, AccessDenied } from '@hbc/auth';

function AdminPage() {
  return (
    <PermissionGate action="admin:access-control:view" fallback={<AccessDenied />}>
      <AdminAccessControlPanel />
    </PermissionGate>
  );
}
```

```tsx
import { RoleGate } from '@hbc/auth';

function ManagerDashboard() {
  return (
    <RoleGate requiredRole="manager" fallback={<p>Manager access required.</p>}>
      <ManagerContent />
    </RoleGate>
  );
}
```

These guards accept `children: ReactNode`, render synchronously via Zustand selectors, and compose naturally inside any TanStack Router route `component`.

### Shell-level ProtectedContentGuard

Use `ProtectedContentGuard` at the root layout to enforce auth lifecycle before any protected content renders. Resolve `currentPathname` from the router context:

```tsx
import { useRouterState } from '@tanstack/react-router';
import { ProtectedContentGuard } from '@hbc/auth';

function RootLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <ProtectedContentGuard
      currentPathname={pathname}
      onSignInAgain={() => { /* trigger MSAL login */ }}
      onGoHome={() => { /* navigate to project hub */ }}
    >
      {children}
    </ProtectedContentGuard>
  );
}
```

### Architectural note

There is no `@hbc/auth` wrapper component for `<Route>`. This is by design, not an oversight:

- `PermissionGate`, `RoleGate`, and `FeatureGate` render synchronously and compose inside any route component — no adapter needed.
- `ProtectedContentGuard` is a lifecycle-aware shell boundary designed as a root-layout wrapper with `currentPathname` resolved by the caller.
- Imperative guards (`requireAuth`, `requirePermission`) are the canonical TanStack Router pattern using `.getState()`.
- Adding `@tanstack/react-router` as a dependency to `@hbc/auth` would violate package boundaries — the router is an app-level concern owned by `@hbc/shell`.

---

## Adapters

| Adapter | Purpose |
|---------|---------|
| `MsalAdapter` | MSAL-based identity acquisition for PWA mode |
| `SpfxAdapter` | SPFx host-identity bridge normalization |
| `MockAdapter` | Dev/test mock identity with persona registry |

Helper utilities: `resolveAuthMode`, `resolveCanonicalAuthMode`, `mapLegacyToCanonicalAuthMode`, `mapCanonicalToLegacyAuthMode`, `describeResolvedAuthRuntime`, `normalizeIdentityToSession`, `restoreSessionWithinPolicy`, `createAuthFailure`.

---

## Exports reference

### Guards

| Export | Kind |
|--------|------|
| `ProtectedContentGuard` | Component |
| `PermissionGate` | Component |
| `FeatureGate` | Component |
| `RoleGate` | Component |
| `AccessDenied` | Component |
| `ShellBootstrapSurface`, `SessionRestoreSurface`, `ExpiredSessionSurface`, `UnsupportedRuntimeSurface`, `FatalStartupSurface` | Recovery surfaces |
| `resolveGuardResolution` | Guard resolution function |
| `buildAccessDeniedActionModel` | Action model builder |

### Hooks

| Export | Kind |
|--------|------|
| `useCurrentUser` | Hook |
| `useCurrentSession` | Hook |
| `useResolvedRuntimeMode` | Hook |
| `usePermission` | Hook |
| `usePermissionEvaluation` | Hook |
| `useFeatureFlag` | Hook |

### Stores

| Export | Kind |
|--------|------|
| `useAuthStore` | Zustand store |
| `usePermissionStore` | Zustand store |
| `useAuthLifecycleSelector`, `useAuthBootstrapSelector`, `useAuthSessionSummarySelector`, `useAuthPermissionSummarySelector` | Selector hooks |
| `resolveEffectivePermissions`, `toEffectivePermissionSet`, `isPermissionGranted`, `isActionAllowed` | Permission resolution |
| `isProtectedFeatureRegistered`, `isFeatureVisible`, `isFeatureAccessible`, `evaluateFeatureAccess` | Feature access resolution |
| `getPermissionResolutionSnapshot` | Snapshot utility |

### Adapters

| Export | Kind |
|--------|------|
| `MsalAdapter`, `SpfxAdapter`, `MockAdapter` | Adapter classes |
| `resolveAuthMode`, `resolveCanonicalAuthMode` | Mode resolution |
| `mapLegacyToCanonicalAuthMode`, `mapCanonicalToLegacyAuthMode` | Mode mapping |
| `normalizeIdentityToSession`, `restoreSessionWithinPolicy` | Session helpers |
| `initMsalAuth`, `extractSpfxUser`, `createAuthFailure` | Provider helpers |

### Workflows

| Export | Kind |
|--------|------|
| `validateStructuredOverrideRequest`, `createStructuredOverrideRequest`, `toOverrideRequestInput` | Request workflow |
| `createPendingOverrideFromRequest`, `applyOverrideApprovalAction`, `isOverrideApprovalDecision`, `isOverrideExpired` | Approval workflow |
| `createRenewalRequest`, `runRenewalWorkflow` | Renewal workflow |
| `evaluateEmergencyBoundary`, `runEmergencyAccessWorkflow` | Emergency workflow |

### Admin

| Export | Kind |
|--------|------|
| `AdminAccessControlPage` | Component |
| `buildAccessControlAdminSnapshot`, `getAccessControlAdminSnapshot`, `loadAdminAccessControlSnapshot` | Snapshot utilities |
| `createInMemoryAccessControlAdminRepository`, `defaultAccessControlAdminRepository` | Repository factories |
| `toOverrideQueueItem`, `isRenewalDue`, `buildRoleAccessLookup`, `deriveQueueByDecision` | Admin helpers |
| `useAdminAccessControlData` | Hook |

### Audit

| Export | Kind |
|--------|------|
| `createStructuredAuditEvent`, `recordStructuredAuditEvent` | Event creation/recording |
| `getStructuredAuditEvents`, `seedStructuredAuditEvents`, `clearStructuredAuditEvents` | Event store |
| `partitionAuditEventsByRetention`, `buildAuditOperationalVisibility`, `sortAuditEventsNewestFirst` | Audit utilities |

### Backend

| Export | Kind |
|--------|------|
| `createBaseRoleDefinition`, `getChangedBaseRoleReferences` | Role definitions |
| `createOverrideRequest`, `approveOverrideRequest`, `revokeOverrideRecord`, `archiveOverrideRecord`, `renewOverrideRecord` | Override lifecycle |
| `resolveOverrideLifecycleStatus`, `flagOverrideForReview`, `markDependentOverridesForRoleReview` | Override resolution |
| `createPerOverrideRequest`, `isPerOverride`, `getPerOverridesForUser`, `getPerOverridesForProject`, `suspendPerOverridesForDepartmentChange` | PER override helpers (Phase 3) |
| `DEFAULT_SHELL_AUTH_CONFIGURATION`, `resolveShellAuthConfiguration`, `validateShellAuthConfiguration`, `loadShellAuthConfiguration` | Shell auth config |

### Types

Key type exports include: `AuthStoreSlice`, `PermissionState`, `NormalizedAuthSession`, `CanonicalAuthMode`, `AuthLifecyclePhase`, `AuthFailure`, `FeaturePermissionRegistration`, `FeatureAccessEvaluation`, `EffectivePermissionSet`, `PermissionResolutionSnapshot`, `GuardResolutionInput`, `GuardResolutionResult`, `ProtectedContentGuardProps`, `PermissionGateProps`, `FeatureGateProps`, `RoleGateProps`, `AccessDeniedProps`, `StandardActionPermission`, `IAuthAdapter`.

New Phase 3 types: `AccessControlOverrideType` (`'general' | 'out-of-scope-per'`), `AccessControlApproverScope` (`'company-wide' | 'department-scoped'`).

See `src/types.ts` and the barrel exports in `src/index.ts` for the full set.

---

## Portfolio Executive Reviewer (PER) Overrides

Phase 3 extends `AccessControlOverrideRecord` to support out-of-scope PER grants — time-bounded project access for Leadership-tier users outside their governed department scope.

```typescript
import { createPerOverrideRequest, approveOverrideRequest } from '@hbc/auth';

const pending = createPerOverrideRequest({
  id: 'per-001',
  targetUserId: 'exec-user-id',
  projectIds: ['proj-001'],
  department: 'Healthcare',
  reason: 'Cross-department portfolio review for Harbor View Medical Center.',
  requesterId: 'opex-manager-id',
  expiresAt: '2026-06-01T00:00:00.000Z',
});

const approved = approveOverrideRequest(pending, {
  approverId: 'opex-manager-id',
  approverScope: 'company-wide',
});
```

Governing: P3-A2 §2.3, §2.4, §6.1 path 7.

---

## Provisioning Override Permissions

G6-T02 introduced 6 granular permission constants for admin provisioning actions. These are exported from `@hbc/auth` and gate the admin-only actions in the provisioning oversight and dashboards pages.

| Constant | Permission String | Purpose |
|----------|------------------|---------|
| `ADMIN_PROVISIONING_RETRY` | `admin:provisioning:retry` | Retry a failed provisioning run (transient failures only) |
| `ADMIN_PROVISIONING_ESCALATE` | `admin:provisioning:escalate` | Escalate a failed run to a higher-tier admin |
| `ADMIN_PROVISIONING_ARCHIVE` | `admin:provisioning:archive` | Archive a failed run from the active queue |
| `ADMIN_PROVISIONING_FORCE_STATE` | `admin:provisioning:force-state` | Force a run into a specific state (expert-tier only) |
| `ADMIN_PROVISIONING_ALERT_FULL_DETAIL` | `admin:provisioning:alert:full-detail` | View full alert detail (error payloads, step metadata) |
| `ADMIN_APPROVAL_MANAGE` | `admin:approval:manage` | Manage approval authority rules (technical admin only) |

Convenience exports: `PROVISIONING_OVERRIDE_PERMISSIONS` (aggregate map), `ALL_PROVISIONING_OVERRIDE_PERMISSIONS` (readonly array for bulk-granting), `ADMIN_PROVISIONING_OVERRIDE` (organizational label — not a wildcard grant).

The global wildcard `*:*` grants all of these. Individual grants are explicit.

---

## Architecture boundaries

### What @hbc/auth owns vs does not own

| Owns | Does not own |
|------|-------------|
| Runtime mode detection and controlled dev/test override handling | Shell composition or shell-status UI orchestration |
| Provider adapters and identity normalization into a shared session contract | Shell route rendering decisions outside auth/guard contracts |
| Central auth/session/permission store contracts and selectors | SPFx host composition behavior beyond identity input seams |
| Role mapping and permission resolution with default-deny behavior | |
| Guard contracts for protected-content access decisions | |
| Override request/approval/renewal/emergency governance workflows | |
| Structured audit/retention recording and admin operability seams | |

These non-owned concerns belong to `@hbc/shell`.

### Internal ownership boundaries

| Layer | Owns | Does Not Own |
|-------|------|-------------|
| `stores/authStore.ts` | Central auth/session/permission state, atomic transitions, selectors, public API | Audit payload assembly, timing metadata construction, compat session building |
| `stores/helpers/` | Pure helper functions for audit payloads, timing metadata, restore-outcome mapping, compat session construction | State ownership, side effects, store subscriptions |
| `stores/permissionStore.ts` | Permission grants, feature flags, feature registrations | Auth lifecycle, session state |
| `stores/permissionResolution.ts` | Deterministic permission evaluation logic | State storage, UI concerns |
| `adapters/` | Provider SDK normalization, identity acquisition | Store mutations, guard decisions |
| `guards/` | Access-control decision logic, React gate components | Auth state mutations, adapter calls |
| `audit/` | Event recording, retention, operational visibility | Auth flow orchestration |
| `startup/` | Timing bridge emission (optional globalThis bridge) | Phase sequencing decisions |

**Rule:** `stores/helpers/` must not import from `adapters/` (prevents circular dependency).

### Dependency direction

- `@hbc/auth` depends on `@hbc/models` (shared identity types).
- `@hbc/auth` does **not** depend on `@hbc/shell`, `@tanstack/react-router`, or any feature package.
- Route rendering decisions are owned by `@hbc/shell`, not `@hbc/auth`.

---

## Running tests

```bash
pnpm --filter @hbc/auth check-types
pnpm --filter @hbc/auth test
pnpm --filter @hbc/auth test:coverage
pnpm --filter @hbc/auth build
```

Package-local scripts (from `packages/auth/`):

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
pnpm check-types
pnpm build
```

---

## Related plans and references

- **ADR chain:** ADR-0053 through ADR-0071 (`docs/architecture/adr/`)
- **Phase plan:** `docs/architecture/plans/PH5-Auth-Shell-Plan.md`
- **Task plans:** `docs/architecture/plans/PH5.2-Auth-Shell-Plan.md` through `PH5.18-Auth-Shell-Plan.md`
- **Blueprint anchors:** `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
- **Alignment markers:** `docs/reference/auth/alignment-markers.md`
- **Architecture overview:** `docs/architecture/auth-shell-phase5-documentation-overview.md`
