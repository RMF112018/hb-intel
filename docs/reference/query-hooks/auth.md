# Auth Hooks Reference

> **Package:** `@hb-intel/data-access` | **Domain:** Auth

## Hooks

### `useCurrentUser()`
- **Type:** Query
- **Key:** `queryKeys.auth.currentUser()`
- **Returns:** `UseQueryResult<CurrentUser>`
- **Description:** Fetches the currently authenticated user's profile and permissions.

### `useRoles()`
- **Type:** Query
- **Key:** `queryKeys.auth.roles()`
- **Returns:** `UseQueryResult<Role[]>`
- **Description:** Fetches all available system roles.

### `useRoleById(id: string)`
- **Type:** Query
- **Key:** `queryKeys.auth.role(id)`
- **Returns:** `UseQueryResult<Role>`
- **Description:** Fetches a single role by its string ID.

### `usePermissionTemplates()`
- **Type:** Query
- **Key:** `queryKeys.auth.templates()`
- **Returns:** `UseQueryResult<PermissionTemplate[]>`
- **Description:** Fetches all available permission templates.

### `useAssignRole()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.auth.roles()`, `queryKeys.auth.currentUser()`
- **Returns:** `UseMutationResult<void, Error, AssignRoleInput>`
- **Description:** Assigns a role to a user.

### `useRemoveRole()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.auth.roles()`, `queryKeys.auth.currentUser()`
- **Returns:** `UseMutationResult<void, Error, RemoveRoleInput>`
- **Description:** Removes a role from a user.

## Query Keys

| Key | Factory | Usage |
|-----|---------|-------|
| `auth.all` | `queryKeys.auth.all` | Top-level invalidation target for all auth data |
| `auth.currentUser()` | `queryKeys.auth.currentUser()` | Current user profile and permissions |
| `auth.roles()` | `queryKeys.auth.roles()` | All available roles |
| `auth.role(id)` | `queryKeys.auth.role(id)` | Single role by string ID |
| `auth.templates()` | `queryKeys.auth.templates()` | Permission templates |
