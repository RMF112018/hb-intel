# Auth Models Reference

> Users, roles, permissions, and authentication types.

**Package:** `@hbc/models` | **Module:** `auth`
**Data-access port:** `IAuthRepository`

## Interfaces

### `ICurrentUser`

The currently authenticated user.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique user identifier (UUID / Azure OID) |
| `displayName` | `string` | User's display name |
| `email` | `string` | User's email address |
| `roles` | `IRole[]` | Assigned roles with permissions |

### `IRole`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Role identifier |
| `name` | `string` | Human-readable role name |
| `permissions` | `string[]` | Permission action strings |

### `IPermissionTemplate`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Template identifier |
| `name` | `string` | Template name |
| `description` | `string` | Description of intended use |
| `permissions` | `string[]` | Permission action strings |

### `ILoginFormData`

Credential-based sign-in form (dev mode only).

### `IRoleAssignmentFormData`

Form for assigning a role to a user.

## Enums

### `SystemRole`

| Value | Label | Level |
|-------|-------|-------|
| `Admin` | Administrator | 50 |
| `CSuite` | C-Suite | 40 |
| `ProjectExecutive` | Project Executive | 30 |
| `ProjectManager` | Project Manager | 20 |
| `OperationsStaff` | Operations Staff | 10 |

### `AuthMode` (type alias)

`'msal' | 'dev'` — Production (Azure Entra ID) vs. development credentials.

## Constants

| Constant | Description |
|----------|-------------|
| `SYSTEM_ROLE_LABELS` | Human-readable labels for system roles |
| `SYSTEM_ROLE_LEVELS` | Numeric privilege levels per role |

## Import Examples

```ts
import type { ICurrentUser, IRole } from '@hbc/models';
import { SystemRole, SYSTEM_ROLE_LABELS } from '@hbc/models/auth';
```
