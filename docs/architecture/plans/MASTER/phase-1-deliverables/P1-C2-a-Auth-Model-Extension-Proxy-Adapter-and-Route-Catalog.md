# P1-C2-a: Auth Model Extension, Proxy Adapter, and Route Catalog

**Document ID:** P1-C2-a
**Phase:** 1
**Status:** Implementation-Ready
**Date:** 2026-03-19
**Owner:** Architecture / C2 Auth Team

## Goal

Extend the auth model layer to support Job Title-based role assignment, external users, and a complete admin surface; implement the `ProxyAuthRepository`; and produce the canonical auth management route catalog that resolves open decision A9 in P1-B1 and P1-C2. This plan is a companion to P1-C2 (Backend Auth and Validation Hardening) and executes after the C2 middleware foundation is in place.

---

## Scope

### In Scope

- `@hbc/models` auth model extension: `IUserRole`, `ICurrentUser` discriminated union, `IJobTitleMapping`, `IExternalMember`, `IProjectMember`, `SystemRole` enum expansion, `grants` rename
- `packages/data-access` port expansion: extended `IAuthRepository` with role CRUD, template CRUD, and job title mapping CRUD; updated `MockAuthRepository` and `seedData.ts`
- `packages/auth` breaking-change remediation: all files that construct or access `ICurrentUser.roles` or `IRole.permissions`
- Backend `validateToken.ts` extension for `jobTitle` claim extraction
- `ProxyAuthRepository` implementation and factory wiring
- Plan documentation updates: P1-C2 auth management route catalog section; P1-B1 A9 resolution notice

### Out of Scope

| Concern | Owner | Reference |
|---|---|---|
| Backend Azure Function route handlers for auth routes (20 system + 9 project-scoped) | Phase 2 / C2 continuation | Section "Backend Auth Function" below — greenfield, separate delivery |
| `IAuthStorageAdapter` + `SharePointAuthStorageAdapter` backend implementation | Phase 2 | Requires per-site grant process and backend storage schema decisions |
| `AccessControlAdminRepository` proxy implementation | Phase 2 | Admin workflow queue actions deferred until backend handlers exist |
| SPFx `jobTitle` gap (SPFx page context does not expose job title) | Phase 2 | Documented as known gap; deferred pending Graph API supplementation |
| External user invitation flow (Azure AD B2B guest account lifecycle) | Phase 2 | Requires IT infrastructure and B2B guest policy decisions |
| Override, renewal, emergency access backend handlers | Phase 2 | `AccessControlAdminRepository` already defines the frontend contract |

---

## Pre-Implementation Baseline (Verified 2026-03-19)

### What Exists and Can Be Reused

| Component | File | Notes |
|---|---|---|
| `ICurrentUser` (flat, 4 fields) | `packages/models/src/auth/IAuth.ts` | Being rewritten as discriminated union — existing consumers catalogued below |
| `IRole` with `permissions: string[]` | `packages/models/src/auth/IAuth.ts` | Field renamed to `grants`; all consumers updated in Chunk 3 |
| `IPermissionTemplate` with `permissions: string[]` | `packages/models/src/auth/IAuth.ts` | Field renamed to `grants`; mock consumers updated in Chunk 2 |
| `SystemRole` enum (5 values) | `packages/models/src/auth/AuthEnums.ts` | Expanded to 9 values; `constants.ts` updated in tandem |
| `IAuthRepository` (6 methods) | `packages/data-access/src/ports/IAuthRepository.ts` | Extended to 16 methods in Chunk 2 |
| `MockAuthRepository` | `packages/data-access/src/adapters/mock/MockAuthRepository.ts` | Updated in Chunk 2 |
| `normalizeIdentityToSession()` | `packages/auth/src/adapters/sessionNormalization.ts` | Line 55 accesses `role.permissions` — updated in Chunk 3 |
| `buildCompatSession()` | `packages/auth/src/stores/helpers/authStoreHelpers.ts` | Lines 145, 147 access `user.roles` without discriminant — updated in Chunk 3 |
| `mapSpfxContextToUser()` | `packages/auth/src/adapters/SpfxAdapter.ts` | Constructs `ICurrentUser` without `type` discriminant — updated in Chunk 3 |
| `DEFAULT_MOCK_USER` | `packages/auth/src/adapters/MockAdapter.ts` | Constructs `ICurrentUser` without `type` — updated in Chunk 3 |
| `personaToCurrentUser()` | `packages/auth/src/mock/bootstrapHelpers.ts` | Constructs `ICurrentUser` + `IRole` objects — updated in Chunk 3 |
| `mapIdentityToAppRoles()` / `toRoleMappingInput()` | `packages/auth/src/roleMapping.ts` | Reads `identity.user.roles` unconditionally — needs discriminant guard in Chunk 3 |
| `validateToken()` + `IValidatedClaims` | `backend/functions/src/middleware/validateToken.ts` | Returns `{ upn, oid, roles, displayName? }` — `jobTitle?` added in Chunk 4 |
| `AccessControlAdminRepository` (5 methods) | `packages/auth/src/types.ts` lines 873–883 | Workflow queue actions: review, renew, resolve, emergency review. **Not merged into `IAuthRepository`** — distinct concerns and distinct package ownership |
| `guardResolution.ts` | `packages/auth/src/guards/guardResolution.ts` | Takes pre-computed `resolvedRoles: string[]` + `hasPermission?: boolean` — **zero direct `ICurrentUser` access; change is invisible to guard logic** |
| `permissionStore.ts` | `packages/auth/src/stores/permissionStore.ts` | Reactive Zustand flat grant list for UI checks — **not duplicated by this plan**; `resolvedGrants` is deliberately excluded from `IInternalUser` (session `permissionSummary.grants` already carries this) |

### What Does Not Exist Yet (This Plan Builds)

| Component | Target File | Notes |
|---|---|---|
| `IUserRole` | `packages/models/src/auth/IAuth.ts` | New; extends role concept with `source: 'job-title' \| 'manual'` |
| `IInternalUser` / `IExternalUser` / `IExternalProjectAccess` | `packages/models/src/auth/IAuth.ts` | Replaces flat `ICurrentUser` |
| `IJobTitleMapping` | `packages/models/src/auth/IJobTitleMapping.ts` | New file |
| `IExternalMember` / `IProjectMember` | `packages/models/src/auth/IProjectMembership.ts` | New file |
| Extended `IAuthRepository` (16 methods) | `packages/data-access/src/ports/IAuthRepository.ts` | Adds role CRUD, template CRUD, job title mapping CRUD |
| `ProxyAuthRepository` | `packages/data-access/src/adapters/proxy/ProxyAuthRepository.ts` | New proxy implementation |
| Auth management route catalog | `P1-C2` §Auth Management Route Catalog | Resolves A9 — final task of this plan |

---

## Locked Decisions

These decisions were locked during the C2 auth design session (2026-03-19) and govern all implementation below.

| # | Decision | Resolution |
|---|---|---|
| A9 | Auth management routes (`/api/auth/*`) | **LOCKED** — 20 system-level + 9 project-scoped routes. Full catalog defined as final task of this plan (Task 21). |
| AD-1 | `IRole.permissions` → `grants` rename | **LOCKED** — `grants` is the canonical term across models, auth package, and session contract. `IPermissionTemplate.permissions` renamed to `grants` in the same pass. |
| AD-2 | `ICurrentUser` discriminated union | **LOCKED** — `type: 'internal'` (Entra ID users with system roles) vs `type: 'external'` (project-scoped only, no job title, no system roles). |
| AD-3 | `resolvedGrants` excluded from `IInternalUser` | **LOCKED** — `NormalizedAuthSession.permissionSummary.grants` already carries the flat grant list. Adding a third copy to the user model creates unnecessary state. `permissionStore` is the runtime reactive layer and is not replaced. |
| AD-4 | `AccessControlAdminRepository` not merged into `IAuthRepository` | **LOCKED** — `AccessControlAdminRepository` owns approval workflow queue orchestration (`packages/auth`). `IAuthRepository` owns entity CRUD (`packages/data-access`). Different abstraction layers, different package ownership, different consumers. |
| AD-5 | Job Title → SystemRole mapping is server-side (Option A) | **LOCKED** — Backend `validateToken()` (or a supplementary Graph call) resolves Job Title to SystemRole before returning to the frontend. `roleMapping.ts` stays synchronous. Frontend never loads the mapping table at session time. |
| AD-6 | `jobTitle` extraction from JWT optional claim (preferred) vs Graph API call (fallback) | **LOCKED as path preference** — Configure `jobTitle` as an optional claim in the Entra app manifest (requires IT to update app registration). If IT cannot configure in time, fall back to a supplementary `GET /users/{oid}?$select=jobTitle` Graph API call in `validateToken()`. Both paths produce the same `IValidatedClaims.jobTitle?` output. |
| AD-7 | `IPersona` role `source` default | **LOCKED** — `source: 'manual'` for all persona-derived `IUserRole` objects. Persona roles are explicitly configured, not resolved from a live job title lookup. |
| AD-8 | `IExternalUser` role mapping | **LOCKED** — External users have no system roles. `toRoleMappingInput()` returns empty `existingRoleNames` for `IExternalUser`. External users receive only project-scoped `IExternalProjectAccess` entries. |
| AD-9 | `SystemRole` enum expansion | **LOCKED** — 9 values: `SystemAdmin`, `Executive`, `ProjectExecutive`, `ProjectManager`, `Superintendent`, `Preconstruction`, `ProjectSupport`, `OfficeStaff`, `FieldStaff`. Replaces 5-value set (`Admin`, `CSuite`, `ProjectExecutive`, `ProjectManager`, `OperationsStaff`). |
| AD-10 | SPFx `jobTitle` gap | **DOCUMENTED** — SPFx page context (`ISpfxPageContext.user`) does not expose `jobTitle`. SPFx users receive role assignment via site admin flag and SharePoint permission mask only. Job Title-based mapping is PWA/MSAL-path only until Phase 2 Graph supplementation. |

---

## Blockers and Assumptions

### Blockers

| Blocker | Impact | Resolution Path |
|---|---|---|
| **Entra optional claim configuration for `jobTitle`** (IT action) | `validateToken()` cannot extract job title from JWT until the app registration is updated | Implement with graceful `undefined` fallback now; fallback to supplementary Graph call or accept missing job title until IT acts. Does not block any other task in this plan. |
| **P1-C2 Chunk 1 (`withAuth()` middleware)** | `ProxyAuthRepository` routes require `withAuth()` to be applied on the backend; proxy adapter can be built and tested independently with mocked `fetch` | Not a blocker for Tasks 1–18; is a blocker for live integration testing (Task 19+). |

### Assumptions

| # | Assumption | Confidence |
|---|---|---|
| A1 | Auth routes follow the route catalog defined in Task 21 of this plan | **LOCKED** — route catalog is the output of this plan |
| A2 | `IAuthRepository.getCurrentUser()` remains the single call that seeds the auth session | High — existing pattern in `normalizeIdentityToSession()` |
| A3 | External users will only exist in the system via project-level invite; no system-wide external user registry is needed in Phase 1 | High — confirmed by C2 team |
| A4 | `IJobTitleMapping` table is persisted in backend storage (Azure Table Storage, consistent with other backend state) | High — backend Table Storage pattern already established |
| A5 | `ProxyAuthRepository` targets the same base URL and uses the same `ProxyHttpClient` pattern as other proxy repos | **LOCKED** — factory pattern |

---

## Chunk 1: `@hbc/models` — Auth Model Layer

Extend the shared model package with the revised auth types. This is the foundation all other chunks depend on. All changes are additive except the `ICurrentUser` rewrite and the `permissions` → `grants` rename.

---

### Task 1: Rename `IRole.permissions` and `IPermissionTemplate.permissions` to `grants`

**Files:**
- Modify: `packages/models/src/auth/IAuth.ts`

**Changes:**
```typescript
// Before
export interface IRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface IPermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

// After
export interface IRole {
  id: string;
  name: string;
  /** Permission action strings granted by this role. */
  grants: string[];
}

export interface IPermissionTemplate {
  id: string;
  name: string;
  description: string;
  /** Permission action strings included in this template. */
  grants: string[];
}
```

**Notes:** This is a breaking rename. All consumers are updated in Chunk 2 (data-access) and Chunk 3 (packages/auth). TypeScript compiler will surface every missed callsite. Do not mark complete until typecheck passes across all packages.

---

### Task 2: Add `IUserRole` interface

**Files:**
- Modify: `packages/models/src/auth/IAuth.ts`

**Interface:**
```typescript
/**
 * A role as assigned to a specific user, carrying source provenance.
 *
 * Distinct from IRole (role definition) — IUserRole is the per-user
 * assignment record and tracks whether the role was auto-assigned from
 * a Job Title lookup or manually assigned by an administrator.
 */
export interface IUserRole {
  /** Role definition ID. */
  id: string;
  /** Human-readable role name. */
  name: string;
  /** Permission action strings granted by this role. */
  grants: string[];
  /**
   * Assignment provenance.
   * - `job-title`: auto-assigned at login via Job Title → SystemRole mapping
   * - `manual`: explicitly assigned by an administrator
   */
  source: 'job-title' | 'manual';
}
```

---

### Task 3: Rewrite `ICurrentUser` as discriminated union

**Files:**
- Modify: `packages/models/src/auth/IAuth.ts`

**Interface:**
```typescript
/**
 * Project-scoped access record for external (non-Entra) users.
 */
export interface IExternalProjectAccess {
  projectId: string;
  /** Specific grants applied to this project context. */
  grants: string[];
  invitedAt: string;
  expiresAt?: string;
}

/**
 * Internal user authenticated via Entra ID.
 * Receives system-level role assignment (manual or Job Title-based).
 */
export interface IInternalUser {
  type: 'internal';
  /** Entra Object ID (OID). */
  id: string;
  displayName: string;
  email: string;
  /**
   * Entra ID Job Title value.
   * Populated from JWT optional claim or Graph API supplementation.
   * May be undefined if IT has not configured optional claims and
   * Graph supplementation is not yet in place (SPFx surface always undefined).
   */
  jobTitle?: string;
  /** Roles assigned to this user with assignment provenance. */
  roles: IUserRole[];
}

/**
 * External user authenticated outside Entra ID (e.g. Azure AD B2B guest).
 * Receives only project-scoped access — no system roles.
 */
export interface IExternalUser {
  type: 'external';
  id: string;
  displayName: string;
  email: string;
  projectAccess: IExternalProjectAccess[];
}

/**
 * The currently authenticated user within HB Intel.
 *
 * Use the `type` discriminant to narrow to IInternalUser or IExternalUser
 * before accessing role or project-access fields.
 */
export type ICurrentUser = IInternalUser | IExternalUser;
```

**Notes:** The existing flat `ICurrentUser` is replaced entirely. TypeScript will surface every construction site and every property access across `packages/auth` that assumes the old flat shape. Chunk 3 remediates all of these.

---

### Task 4: Add `IJobTitleMapping`, `IExternalMember`, and `IProjectMember`

**Files:**
- Create: `packages/models/src/auth/IJobTitleMapping.ts`
- Create: `packages/models/src/auth/IProjectMembership.ts`

**`IJobTitleMapping.ts`:**
```typescript
/**
 * Maps one or more Entra ID Job Title strings to a SystemRole.
 *
 * Matching behavior:
 * - `exact`: Job Title must match one alias exactly (case-insensitive)
 * - `contains`: Job Title must contain one alias as a substring (case-insensitive)
 * - `starts-with`: Job Title must begin with one alias (case-insensitive)
 *
 * Aliases are evaluated in order; first match wins.
 * Inactive mappings are loaded but skipped during resolution.
 */
export interface IJobTitleMapping {
  id: string;
  /** Target SystemRole value (e.g. 'PROJECT_MANAGER'). */
  roleId: string;
  /** Human-readable role name for display. */
  roleName: string;
  /**
   * Entra ID Job Title strings (or substrings) that map to this role.
   * Store the exact values observed in Entra; alias matching is case-insensitive.
   */
  aliases: string[];
  matchMode: 'exact' | 'contains' | 'starts-with';
  active: boolean;
  updatedAt: string;
  updatedBy: string;
}
```

**`IProjectMembership.ts`:**
```typescript
/**
 * An internal user's membership record for a specific project.
 * Used by the Project Hub member management surface.
 */
export interface IProjectMember {
  userId: string;
  projectId: string;
  displayName: string;
  email: string;
  /** Project-level role override (if different from system role). */
  projectRoleId?: string;
  addedAt: string;
  addedBy: string;
}

/**
 * An external user's membership record for a specific project.
 * External users have time-bounded, project-scoped access only.
 */
export interface IExternalMember {
  /** Local user table ID (not an Entra OID). */
  id: string;
  projectId: string;
  displayName: string;
  email: string;
  /** Specific grants for this project context. */
  grants: string[];
  invitedBy: string;
  invitedAt: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'revoked';
}
```

---

### Task 5: Expand `SystemRole` enum and update `constants.ts`

**Files:**
- Modify: `packages/models/src/auth/AuthEnums.ts`
- Modify: `packages/models/src/auth/constants.ts`

**`AuthEnums.ts` — before / after:**
```typescript
// Before (5 values)
export enum SystemRole {
  Admin            = 'ADMIN',
  CSuite           = 'C_SUITE',
  ProjectExecutive = 'PROJECT_EXECUTIVE',
  ProjectManager   = 'PROJECT_MANAGER',
  OperationsStaff  = 'OPERATIONS_STAFF',
}

// After (9 values)
export enum SystemRole {
  SystemAdmin      = 'SYSTEM_ADMIN',
  Executive        = 'EXECUTIVE',
  ProjectExecutive = 'PROJECT_EXECUTIVE',
  ProjectManager   = 'PROJECT_MANAGER',
  Superintendent   = 'SUPERINTENDENT',
  Preconstruction  = 'PRECONSTRUCTION',
  ProjectSupport   = 'PROJECT_SUPPORT',
  OfficeStaff      = 'OFFICE_STAFF',
  FieldStaff       = 'FIELD_STAFF',
}
```

**`constants.ts` — update both records to include all 9 values:**
```typescript
export const SYSTEM_ROLE_LABELS: Record<SystemRole, string> = {
  [SystemRole.SystemAdmin]:      'System Administrator',
  [SystemRole.Executive]:        'Executive',
  [SystemRole.ProjectExecutive]: 'Project Executive',
  [SystemRole.ProjectManager]:   'Project Manager',
  [SystemRole.Superintendent]:   'Superintendent',
  [SystemRole.Preconstruction]:  'Preconstruction',
  [SystemRole.ProjectSupport]:   'Project Support',
  [SystemRole.OfficeStaff]:      'Office Staff',
  [SystemRole.FieldStaff]:       'Field Staff',
};

export const SYSTEM_ROLE_LEVELS: Record<SystemRole, number> = {
  [SystemRole.SystemAdmin]:      90,
  [SystemRole.Executive]:        80,
  [SystemRole.ProjectExecutive]: 70,
  [SystemRole.ProjectManager]:   60,
  [SystemRole.Superintendent]:   50,
  [SystemRole.Preconstruction]:  40,
  [SystemRole.ProjectSupport]:   30,
  [SystemRole.OfficeStaff]:      20,
  [SystemRole.FieldStaff]:       10,
};
```

**Notes:** Existing `Admin` → `SystemAdmin`, `CSuite` → `Executive`, `OperationsStaff` split into `Superintendent`, `Preconstruction`, `ProjectSupport`, `OfficeStaff`, `FieldStaff`. Any existing code comparing against old enum values (`SystemRole.Admin`, `SystemRole.CSuite`) must be updated. TypeScript will surface all mismatches.

---

### Task 6: Update barrel exports

**Files:**
- Modify: `packages/models/src/auth/index.ts`

**After:**
```typescript
export {
  type ICurrentUser,
  type IInternalUser,
  type IExternalUser,
  type IExternalProjectAccess,
  type IRole,
  type IUserRole,
  type IPermissionTemplate,
} from './IAuth.js';

export {
  type IJobTitleMapping,
} from './IJobTitleMapping.js';

export {
  type IProjectMember,
  type IExternalMember,
} from './IProjectMembership.js';

export { type ILoginFormData, type IRoleAssignmentFormData } from './IAuthFormData.js';
export { SystemRole, type AuthMode } from './AuthEnums.js';
export { type UserId, type RoleId, type PermissionAction } from './types.js';
export { SYSTEM_ROLE_LABELS, SYSTEM_ROLE_LEVELS } from './constants.js';
```

**Verification after Chunk 1:**
```bash
cd packages/models
pnpm typecheck   # or: npx tsc --noEmit
```
Chunk 1 is not complete until `packages/models` typechecks clean.

---

## Chunk 2: `packages/data-access` — Port and Mock

Update the `IAuthRepository` port to the full auth management surface, update the mock implementation, and fix the seed data to match the new model shapes.

---

### Task 7: Extend `IAuthRepository` port

**Files:**
- Modify: `packages/data-access/src/ports/IAuthRepository.ts`

**Extended interface (16 methods total):**
```typescript
import type {
  ICurrentUser,
  IRole,
  IUserRole,
  IPermissionTemplate,
  IJobTitleMapping,
} from '@hbc/models';

export interface IAuthRepository {
  // ── Session ─────────────────────────────────────────────────────────────
  /**
   * Retrieve the currently authenticated user.
   * For internal users, roles carry IUserRole with source provenance.
   */
  getCurrentUser(): Promise<ICurrentUser>;

  // ── Role definitions ─────────────────────────────────────────────────────
  /** Retrieve all role definitions. */
  getRoles(): Promise<IRole[]>;
  /** Retrieve a role definition by ID. Returns null if not found. */
  getRoleById(id: string): Promise<IRole | null>;
  /** Create a new role definition. */
  createRole(role: Omit<IRole, 'id'>): Promise<IRole>;
  /** Update an existing role definition. */
  updateRole(id: string, updates: Partial<Omit<IRole, 'id'>>): Promise<IRole>;
  /** Delete a role definition. */
  deleteRole(id: string): Promise<void>;

  // ── Role assignment ───────────────────────────────────────────────────────
  /**
   * Assign a role to a user.
   * @throws {NotFoundError} if the role does not exist.
   */
  assignRole(userId: string, roleId: string): Promise<void>;
  /** Remove a role from a user. */
  removeRole(userId: string, roleId: string): Promise<void>;

  // ── Permission templates ──────────────────────────────────────────────────
  /** Retrieve all permission templates. */
  getPermissionTemplates(): Promise<IPermissionTemplate[]>;
  /** Create a new permission template. */
  createPermissionTemplate(
    template: Omit<IPermissionTemplate, 'id'>,
  ): Promise<IPermissionTemplate>;
  /** Update an existing permission template. */
  updatePermissionTemplate(
    id: string,
    updates: Partial<Omit<IPermissionTemplate, 'id'>>,
  ): Promise<IPermissionTemplate>;
  /** Delete a permission template. */
  deletePermissionTemplate(id: string): Promise<void>;

  // ── Job Title mappings ────────────────────────────────────────────────────
  /** Retrieve all Job Title → SystemRole mapping rules. */
  getJobTitleMappings(): Promise<IJobTitleMapping[]>;
  /** Create a new Job Title mapping rule. */
  createJobTitleMapping(
    mapping: Omit<IJobTitleMapping, 'id'>,
  ): Promise<IJobTitleMapping>;
  /** Update an existing Job Title mapping rule. */
  updateJobTitleMapping(
    id: string,
    updates: Partial<Omit<IJobTitleMapping, 'id'>>,
  ): Promise<IJobTitleMapping>;
  /** Delete a Job Title mapping rule. */
  deleteJobTitleMapping(id: string): Promise<void>;
}
```

---

### Task 8: Update `MockAuthRepository`

**Files:**
- Modify: `packages/data-access/src/adapters/mock/MockAuthRepository.ts`

**Changes:**
- Rename all inline `permissions:` → `grants:` in template objects inside `getPermissionTemplates()`
- Add in-memory state for `jobTitleMappings: IJobTitleMapping[]`
- Implement the 10 new methods with simple in-memory CRUD (follow the pattern of `getRoles()` / `getRoleById()`)
- `createRole`, `createPermissionTemplate`, `createJobTitleMapping` — generate IDs with `crypto.randomUUID()` or a deterministic counter
- `updateRole`, `updatePermissionTemplate`, `updateJobTitleMapping` — merge partial updates; `throwNotFound` if ID missing
- `deleteRole`, `deletePermissionTemplate`, `deleteJobTitleMapping` — filter from in-memory array; no-op if not found (idempotent)

**`getPermissionTemplates()` inline template fix:**
```typescript
// Before
{ id: 'tpl-admin', name: 'Full Admin', description: '...', permissions: ['project:*', ...] }
// After
{ id: 'tpl-admin', name: 'Full Admin', description: '...', grants: ['project:*', ...] }
```

---

### Task 9: Update `seedData.ts`

**Files:**
- Modify: `packages/data-access/src/adapters/mock/seedData.ts`

**Changes:**

```typescript
// SEED_ROLES — rename permissions → grants, add IRole shape
export const SEED_ROLES: IRole[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    grants: ['project:*', 'user:*', 'audit:*', 'settings:*'],
  },
  {
    id: 'role-pm',
    name: 'Project Manager',
    grants: ['project:read', 'project:write', 'document:*', 'reports:read'],
  },
];

// SEED_CURRENT_USER — add type: 'internal'; roles become IUserRole[]
export const SEED_CURRENT_USER: IInternalUser = {
  type: 'internal',
  id: 'user-uuid-001',
  displayName: 'Dev User',
  email: 'dev@hbconstruction.com',
  jobTitle: 'Project Manager',
  roles: [
    {
      id: 'role-admin',
      name: 'Administrator',
      grants: ['project:*', 'user:*', 'audit:*', 'settings:*'],
      source: 'manual',
    },
  ],
};
```

**Verification after Chunk 2:**
```bash
cd packages/data-access
pnpm typecheck
pnpm test --run
```

---

## Chunk 3: `packages/auth` — Breaking Change Remediation

The model changes in Chunks 1–2 break 9 files in `packages/auth`. Each file is a targeted fix — no refactoring beyond what is required to restore type safety.

---

### Task 10: Fix `sessionNormalization.ts`

**File:** `packages/auth/src/adapters/sessionNormalization.ts`

**Line 55 — rename `.permissions` → `.grants`:**
```typescript
// Before
const grants = identity.user.roles.flatMap((role) => role.permissions);

// After — also add discriminant guard for IExternalUser
const grants =
  identity.user.type === 'internal'
    ? identity.user.roles.flatMap((role) => role.grants)
    : identity.user.projectAccess.flatMap((p) => p.grants);
```

---

### Task 11: Fix `authStoreHelpers.ts`

**File:** `packages/auth/src/stores/helpers/authStoreHelpers.ts`

**`buildCompatSession()` lines 145 and 147 — add discriminant guards:**
```typescript
// Before
resolvedRoles: user.roles.map((role) => role.name),
permissionSummary: {
  grants: user.roles.flatMap((role) => role.permissions),
  overrides: [],
},

// After
resolvedRoles: user.type === 'internal'
  ? user.roles.map((role) => role.name)
  : [],
permissionSummary: {
  grants: user.type === 'internal'
    ? user.roles.flatMap((role) => role.grants)
    : user.projectAccess.flatMap((p) => p.grants),
  overrides: [],
},
```

---

### Task 12: Fix `SpfxAdapter.ts` and `SpfxContextAdapter.ts`

**File:** `packages/auth/src/adapters/SpfxAdapter.ts`

`mapSpfxContextToUser()` constructs an `ICurrentUser` — add `type: 'internal'`; rename `permissions` → `grants` in role object; add `source: 'manual'`:
```typescript
return {
  type: 'internal',           // ADD
  id: `spfx-${user.loginName}`,
  displayName: user.displayName,
  email: user.email,
  roles: [
    {
      id: user.isSiteAdmin ? 'role-admin' : 'role-member',
      name: user.isSiteAdmin ? 'Administrator' : 'Member',
      grants,                 // RENAMED from permissions
      source: 'manual',       // ADD
    },
  ],
};
```

**File:** `packages/auth/src/spfx/SpfxContextAdapter.ts`

Add `type: 'internal'` to the `currentUser` construction block (same pattern as above).

---

### Task 13: Fix `MockAdapter.ts` and `msal/index.ts`

**File:** `packages/auth/src/adapters/MockAdapter.ts`

`DEFAULT_MOCK_USER` — add `type: 'internal'`; rename `permissions` → `grants`; add `source: 'manual'`:
```typescript
const DEFAULT_MOCK_USER: IInternalUser = {
  type: 'internal',
  id: 'mock-user-001',
  displayName: 'Mock User',
  email: 'mock.user@hbintel.local',
  roles: [
    {
      id: 'role-mock-admin',
      name: 'Administrator',
      grants: ['*:*'],
      source: 'manual',
    },
  ],
};
```

**File:** `packages/auth/src/msal/index.ts`

Add `type: 'internal'` to the returned `ICurrentUser` object. The MSAL path only ever produces internal users.

---

### Task 14: Fix `bootstrapHelpers.ts`

**File:** `packages/auth/src/mock/bootstrapHelpers.ts`

`personaToCurrentUser()` — add `type: 'internal'`; rename `permissions` → `grants`; add `source: 'manual'` (AD-7):
```typescript
return {
  type: 'internal',           // ADD
  id: persona.id,
  displayName: persona.name,
  email: persona.email,
  roles: persona.roles.map((roleName, index) => ({
    id: `dev-role-${roleName.toLowerCase().replace(/\s+/g, '-')}`,
    name: roleName,
    grants: index === 0 ? grantedPermissions : [],   // RENAMED
    source: 'manual' as const,                        // ADD (AD-7)
  })),
};
```

---

### Task 15: Fix `roleMapping.ts`

**File:** `packages/auth/src/roleMapping.ts`

`toRoleMappingInput()` — add discriminant guard for `IExternalUser` (AD-8):
```typescript
export function toRoleMappingInput(identity: AdapterIdentityPayload): RoleMappingInput {
  // External users have no system roles — return empty existingRoleNames (AD-8)
  const existingRoleNames =
    identity.user.type === 'internal'
      ? identity.user.roles.map((role) => role.name)
      : [];

  return {
    providerIdentityRef: identity.providerIdentityRef,
    runtimeMode: identity.runtimeMode,
    existingRoleNames,
    rawContext: identity.rawContext,
    hint: {
      loginName: identity.user.email,
    },
  };
}
```

---

### Task 16: Fix affected test files

Three test files construct `ICurrentUser` objects directly. Add `type: 'internal'`, `source: 'manual'`, and rename `permissions` → `grants` in each.

**Files:**
- Modify: `packages/auth/src/adapters/sessionRestoreTiming.test.ts`
- Modify: `packages/auth/src/validation/dualModeValidationMatrix.test.ts`
- Modify: `packages/auth/src/mock/__tests__/bootstrapHelpers.test.ts`

Pattern for all three:
```typescript
// Before
const user: ICurrentUser = {
  id: '...',
  displayName: '...',
  email: '...',
  roles: [{ id: '...', name: '...', permissions: [...] }],
};

// After
const user: IInternalUser = {
  type: 'internal',
  id: '...',
  displayName: '...',
  email: '...',
  roles: [{ id: '...', name: '...', grants: [...], source: 'manual' }],
};
```

**Verification after Chunk 3:**
```bash
cd packages/auth
pnpm typecheck
pnpm test --run
```

All existing `packages/auth` tests must pass. No behavior changes — this chunk is remediation only.

---

## Chunk 4: Backend `validateToken` Extension

Extend the existing `validateToken()` middleware to extract `jobTitle` from the JWT payload, enabling server-side Job Title → SystemRole resolution (AD-5, AD-6).

---

### Task 17: Add `jobTitle` to `IValidatedClaims`

**Files:**
- Modify: `backend/functions/src/middleware/validateToken.ts`
- Modify: `backend/functions/src/middleware/validateToken.test.ts`

**`IValidatedClaims` extension:**
```typescript
export interface IValidatedClaims {
  upn: string;
  oid: string;
  roles: string[];
  /** Display name from JWT `name` claim. Falls back to UPN if absent. */
  displayName?: string;
  /**
   * Entra ID Job Title from JWT optional claim (`jobTitle`).
   *
   * Populated only if the app registration is configured to include
   * `jobTitle` as an optional claim in the ID/access token. If the claim
   * is absent (SPFx path, or optional claim not yet configured), this
   * field is undefined — callers must handle gracefully.
   *
   * See: docs/how-to/administrator/setup/backend/IT-Department-Setup-Guide.md
   * §Entra Optional Claims Configuration
   */
  jobTitle?: string;
}
```

**`validateToken()` claim extraction — add to the existing claims destructure:**
```typescript
const claims = payload as JWTPayload & {
  upn?: string;
  preferred_username?: string;
  oid?: string;
  roles?: string[];
  name?: string;
  jobTitle?: string;    // ADD — optional claim; absent until IT configures
};

// In the return object:
return {
  upn,
  oid: claims.oid,
  roles: claims.roles ?? [],
  displayName: claims.name ?? upn,
  jobTitle: typeof claims.jobTitle === 'string' ? claims.jobTitle : undefined,  // ADD
};
```

**Tests to add:**
- JWT with `jobTitle` claim → `IValidatedClaims.jobTitle` is populated
- JWT without `jobTitle` claim → `IValidatedClaims.jobTitle` is `undefined`
- JWT with non-string `jobTitle` value → `IValidatedClaims.jobTitle` is `undefined` (type guard)

**Notes:** No behavior change if `jobTitle` is absent — existing handlers are unaffected. The IT action required to populate this field from Entra is documented in the IT Setup Guide. Until that action is taken, the field returns `undefined` and no Job Title-based mapping occurs. The backend auth function (Phase 2) will read `claims.jobTitle` and perform the `IJobTitleMapping` lookup.

---

## Chunk 5: `ProxyAuthRepository`

Implement the proxy adapter for the auth domain. This is the final piece that closes A9 and unblocks full proxy mode for the auth data plane.

---

### Task 18: Implement `ProxyAuthRepository`

**Files:**
- Create: `packages/data-access/src/adapters/proxy/ProxyAuthRepository.ts`
- Create: `packages/data-access/src/adapters/proxy/ProxyAuthRepository.test.ts`

**Route map (from the auth management route catalog locked in Task 21):**

| Method | HTTP | Route |
|---|---|---|
| `getCurrentUser()` | GET | `/api/auth/me` |
| `getRoles()` | GET | `/api/auth/roles` |
| `getRoleById(id)` | GET | `/api/auth/roles/{id}` |
| `createRole(role)` | POST | `/api/auth/roles` |
| `updateRole(id, updates)` | PATCH | `/api/auth/roles/{id}` |
| `deleteRole(id)` | DELETE | `/api/auth/roles/{id}` |
| `assignRole(userId, roleId)` | POST | `/api/auth/users/{userId}/roles` |
| `removeRole(userId, roleId)` | DELETE | `/api/auth/users/{userId}/roles/{roleId}` |
| `getPermissionTemplates()` | GET | `/api/auth/templates` |
| `createPermissionTemplate(t)` | POST | `/api/auth/templates` |
| `updatePermissionTemplate(id, u)` | PATCH | `/api/auth/templates/{id}` |
| `deletePermissionTemplate(id)` | DELETE | `/api/auth/templates/{id}` |
| `getJobTitleMappings()` | GET | `/api/auth/job-title-mappings` |
| `createJobTitleMapping(m)` | POST | `/api/auth/job-title-mappings` |
| `updateJobTitleMapping(id, u)` | PATCH | `/api/auth/job-title-mappings/{id}` |
| `deleteJobTitleMapping(id)` | DELETE | `/api/auth/job-title-mappings/{id}` |

**Class shape:**
```typescript
import type { ICurrentUser, IRole, IPermissionTemplate, IJobTitleMapping } from '@hbc/models';
import type { IAuthRepository } from '../../ports/IAuthRepository.js';
import { ProxyHttpClient } from './ProxyHttpClient.js';
import { buildResourcePath } from './paths.js';
import { parseItemEnvelope, parsePagedEnvelope } from './envelope.js';
import { normalizeHttpError } from './errors.js';

export class ProxyAuthRepository implements IAuthRepository {
  constructor(private readonly client: ProxyHttpClient) {}
  // ... 16 method implementations
}
```

**Implementation notes:**
- `getCurrentUser()` → `parseItemEnvelope<ICurrentUser>` response shape `{ data: ICurrentUser }`
- Collection methods (`getRoles`, `getPermissionTemplates`, `getJobTitleMappings`) → `parsePagedEnvelope` or flat array response — follow the C1 catalog response shape (see Task 21)
- `deleteRole`, `deletePermissionTemplate`, `deleteJobTitleMapping` → 204 No Content; return `void`
- 404 on `getRoleById` → return `null` (consistent with other proxy repos)
- 404 on `deleteJobTitleMapping` → no-op (idempotent delete)
- All errors → `normalizeHttpError()`

**Tests (vitest, `vi.stubGlobal('fetch', ...)` pattern matching other proxy repo tests):**

For each method, write:
- Success case — correct HTTP method + path called; response parsed correctly
- 404 case for `getById` methods → returns `null`
- Network error → `HbcDataAccessError` thrown
- Non-2xx response → appropriate typed error thrown

Minimum test count: 20 tests (at least one per method, plus error path coverage for key methods).

---

### Task 19: Wire `ProxyAuthRepository` into factory and barrel exports

**Files:**
- Modify: `packages/data-access/src/factory.ts`
- Modify: `packages/data-access/src/adapters/proxy/index.ts`

**`factory.ts` — `createAuthRepository` case:**
```typescript
import { ProxyAuthRepository } from './adapters/proxy/ProxyAuthRepository.js';

// In createAuthRepository():
case 'proxy':
  return new ProxyAuthRepository(getProxyClient());
```

**`proxy/index.ts` — barrel export:**
```typescript
export { ProxyAuthRepository } from './ProxyAuthRepository.js';
```

Update barrel comment from "10 of 11" to "11 of 11 — Auth proxy complete; A9 resolved".

**Verification after Chunk 5:**
```bash
cd packages/data-access
pnpm typecheck
pnpm test --run
```

Expected: all existing 84 tests pass; new `ProxyAuthRepository.test.ts` adds ≥20 tests; total ≥104 tests passing.

---

## Chunk 6: Plan Documentation Updates

The final tasks record the decisions made in this plan into the canonical plan files that reference them as open or unresolved.

---

### Task 20: Update P1-B1 to record A9 resolution and ProxyAuthRepository completion

**File:** `docs/architecture/plans/MASTER/phase-1-deliverables/P1-B1-Proxy-Adapter-Implementation-Plan.md`

**Changes:**
1. In the **Repo Truth Update** section at the top: update "10 of 11" → "11 of 11"; note `ProxyAuthRepository` complete; note A9 resolved via P1-C2-a.
2. In the **Blockers** table: mark assumption A9 as **RESOLVED** — "Auth management routes defined in P1-C2-a Task 21; `ProxyAuthRepository` implemented and factory-wired."
3. In the **Implementation Sequencing** table: mark Task 7 (Auth) as **COMPLETE**.

---

### Task 21: Update P1-C2 with the auth management route catalog

**File:** `docs/architecture/plans/MASTER/phase-1-deliverables/P1-C2-Backend-Auth-and-Validation-Hardening.md`

Add a new section **`## Auth Management Route Catalog (A9 Resolution)`** immediately after the existing **Endpoint Auth Matrix** section. This section is the canonical backend developer reference for all auth routes.

The section must define:

**System-level auth routes (20 routes) — all use Managed Identity auth pattern:**

| Route | Method | Handler Responsibility |
|---|---|---|
| `/api/auth/me` | GET | Return `ICurrentUser` for the validated token's OID; resolve Job Title → SystemRole via `IJobTitleMapping` table; return `IInternalUser` or `IExternalUser` based on user type |
| `/api/auth/roles` | GET | Return all `IRole` definitions |
| `/api/auth/roles` | POST | Create role definition; validate `grants[]` format |
| `/api/auth/roles/{id}` | GET | Return role by ID; 404 if not found |
| `/api/auth/roles/{id}` | PATCH | Partial update; 404 if not found |
| `/api/auth/roles/{id}` | DELETE | Delete role; 404 if not found |
| `/api/auth/users/{userId}/roles` | POST | Assign role to user; body: `{ roleId }` |
| `/api/auth/users/{userId}/roles/{roleId}` | DELETE | Remove role from user |
| `/api/auth/templates` | GET | Return all `IPermissionTemplate` definitions |
| `/api/auth/templates` | POST | Create template; validate `grants[]` |
| `/api/auth/templates/{id}` | GET | Return template by ID; 404 if not found |
| `/api/auth/templates/{id}` | PATCH | Partial update |
| `/api/auth/templates/{id}` | DELETE | Delete template |
| `/api/auth/job-title-mappings` | GET | Return all `IJobTitleMapping` rules |
| `/api/auth/job-title-mappings` | POST | Create mapping rule |
| `/api/auth/job-title-mappings/{id}` | GET | Return mapping by ID |
| `/api/auth/job-title-mappings/{id}` | PATCH | Update mapping rule |
| `/api/auth/job-title-mappings/{id}` | DELETE | Delete mapping rule |
| `/api/auth/users` | GET | List users from Entra + local table; supports `?search=` query |
| `/api/auth/users/{userId}` | GET | Get user profile with resolved roles |

**Project-scoped auth routes (9 routes) — all use Managed Identity auth pattern, nested under `/api/projects/{projectId}/`:**

| Route | Method | Handler Responsibility |
|---|---|---|
| `/api/projects/{projectId}/members` | GET | List internal project members (`IProjectMember[]`) |
| `/api/projects/{projectId}/members` | POST | Add internal member to project |
| `/api/projects/{projectId}/members/{userId}` | DELETE | Remove internal member |
| `/api/projects/{projectId}/members/{userId}/role` | PATCH | Update member's project-level role override |
| `/api/projects/{projectId}/external-members` | GET | List external members (`IExternalMember[]`) |
| `/api/projects/{projectId}/external-members` | POST | Invite external user; triggers B2B guest account creation |
| `/api/projects/{projectId}/external-members/{id}` | GET | Get external member record |
| `/api/projects/{projectId}/external-members/{id}` | PATCH | Update grants or extend expiry |
| `/api/projects/{projectId}/external-members/{id}` | DELETE | Revoke external member access |

**Also update in P1-C2:**
- **Phase 1 Auth Blockers table**: add row for "Entra optional claims `jobTitle` configuration" — process-documented, implementation unblocked (graceful `undefined` fallback in place)
- **`/api/auth/me` smoke utility endpoint** (listed in "What C2 Must Build" table): mark as **DEFINED** — route defined in P1-C2-a Task 21; backend handler is Phase 2 delivery

---

## Implementation Order

1. **Chunk 1** (`@hbc/models`) — must be first; all downstream chunks depend on updated types. Do not proceed to Chunk 2 until `packages/models` typechecks clean.
2. **Chunk 2** (`packages/data-access`) — depends on Chunk 1. Fix `seedData.ts` before `MockAuthRepository` to avoid cascading type errors.
3. **Chunk 3** (`packages/auth`) — depends on Chunk 1. Can proceed in parallel with Chunk 2 once Chunk 1 is complete. Fix in task order (Tasks 10 → 11 → 12 → 13 → 14 → 15 → 16); the type errors will guide sequencing.
4. **Chunk 4** (backend `validateToken`) — independent of Chunks 1–3; can be executed in any order. Prioritize early if IT is actively working on the Entra optional claims configuration.
5. **Chunk 5** (`ProxyAuthRepository`) — depends on Chunks 1–2 (model + port). Can begin once `IAuthRepository` is stable.
6. **Chunk 6** (documentation) — Tasks 20 and 21 can be drafted during implementation but should be finalized and written after Chunk 5 passes verification.

---

## Verification

After all chunks complete, run the following in order:

```bash
# 1. Models package
cd packages/models && pnpm typecheck

# 2. Data-access package
cd packages/data-access && pnpm typecheck && pnpm test --run

# 3. Auth package
cd packages/auth && pnpm typecheck && pnpm test --run

# 4. Backend middleware
cd backend/functions && npm run test -- --run --reporter=verbose src/middleware/validateToken.test.ts

# 5. Workspace-wide typecheck (catch any cross-package misses)
pnpm -r typecheck
```

**Pass criteria:**
- `packages/models` typechecks with zero errors
- `packages/data-access` typechecks and all tests pass (≥104 tests)
- `packages/auth` typechecks and all existing tests pass (no regressions)
- `backend/functions` `validateToken.test.ts` passes with new `jobTitle` tests included
- Workspace-wide typecheck clean

---

## Risk Notes

- **Broad discriminated union change:** The `ICurrentUser` rewrite touches 9 files across `packages/auth`. TypeScript will surface every missed callsite, but the fix pattern is mechanical. If a previously unknown construction site is found, apply the same `type: 'internal'` pattern — all existing users are internal.
- **`SystemRole` enum value rename:** Old values (`ADMIN`, `C_SUITE`, `OPERATIONS_STAFF`) are removed. Any string comparisons against old values in tests or runtime code will silently pass at runtime (TypeScript catches at compile time only if typed as `SystemRole`). Search for raw string literals `'ADMIN'`, `'C_SUITE'`, `'OPERATIONS_STAFF'` if typecheck finds no issues but behavior seems wrong.
- **Backend auth function is Phase 2:** `ProxyAuthRepository` will throw `HbcDataAccessError` for every method until the backend auth function exists. This is expected behavior in proxy mode during Phase 1. Factory mode `'mock'` remains fully functional for all development work.
- **Entra optional claims IT dependency:** `jobTitle` will be `undefined` for all users until IT configures the app registration. The Job Title → SystemRole mapping will silently produce no-op (no role assigned from job title) until this is in place. This is acceptable for Phase 1.
- **`AccessControlAdminRepository` proxy deferred:** The admin queue surface (override review, renewal, emergency access review) has no proxy implementation yet. The `inMemoryRepository` in `packages/auth/src/admin/` remains the only implementation. This is a Phase 2 item.

---

## Sign-off Gates

- [ ] `packages/models` typechecks with zero errors
- [ ] `packages/data-access` all tests pass (≥104); no regressions in existing 84 tests
- [ ] `packages/auth` all tests pass; no regressions
- [ ] `backend/functions` `validateToken.test.ts` passes including new `jobTitle` test cases
- [ ] Workspace-wide `pnpm -r typecheck` clean
- [ ] `ProxyAuthRepository` factory-wired and barrel-exported; proxy/index.ts comment updated to "11 of 11"
- [ ] P1-B1 updated to reflect A9 resolved and ProxyAuthRepository complete (Task 20)
- [ ] P1-C2 updated with the canonical auth management route catalog (Task 21)
