# Phase 9 User Workflow Implementation Notes

## Purpose

Document what backend user lifecycle workflows were implemented in Prompt-06 and how they wire the P9-04 service boundaries and P9-05 contracts together.

## Implemented actions

All 12 "implement now" user actions from the P9-03 action catalog:

| # | Action | Authority | Handler function |
|---|--------|-----------|-----------------|
| U-01 | Search users | Visibility (Graph) | `executeUserSearch` |
| U-02 | Read user profile | Visibility (Graph) | `executeUserRead` |
| U-03 | Create user (AD DS) | AD DS | `executeUserCreateADDS` |
| U-04 | Create cloud-only user | Entra | `executeUserCreateCloud` |
| U-05 | Update user (AD DS) | AD DS | `executeUserUpdateADDS` |
| U-06 | Update cloud-only user | Entra | `executeUserUpdateCloud` |
| U-07 | Disable user (AD DS) | AD DS | `executeUserToggleADDS` |
| U-08 | Disable cloud-only user | Entra | `executeUserToggleCloud` |
| U-09 | Enable user (AD DS) | AD DS | `executeUserToggleADDS` |
| U-10 | Enable cloud-only user | Entra | `executeUserToggleCloud` |
| U-11 | Delete user (AD DS) | AD DS | `executeUserDeleteADDS` |
| U-12 | Delete cloud-only user | Entra | `executeUserDeleteCloud` |

Deferred: U-13 (password reset AD), U-14 (unlock AD), U-15 (password reset cloud).

## API endpoints

| Method | Route | Handler | Purpose |
|--------|-------|---------|---------|
| POST | `/api/admin/identity/users/search` | `identityUserSearch` | Search users |
| GET | `/api/admin/identity/users/{userId}` | `identityUserRead` | Read user profile |
| POST | `/api/admin/identity/users` | `identityUserCreate` | Create user (body `authority` determines AD DS vs cloud) |
| PATCH | `/api/admin/identity/users/{userId}` | `identityUserUpdate` | Update user properties |
| POST | `/api/admin/identity/users/{userId}/enable` | `identityUserEnable` | Enable user |
| POST | `/api/admin/identity/users/{userId}/disable` | `identityUserDisable` | Disable user |
| DELETE | `/api/admin/identity/users/{userId}` | `identityUserDelete` | Delete user (requires `confirmationToken`) |

## Architecture pattern

Each workflow handler follows a consistent pattern:

1. **Input validation** — Uses P9-05 validators (`validateUpn`, `validateSamAccountName`, etc.)
2. **Connector preflight** — Calls `validateConnectorPreflight(actionId, connectionRegistry)` which asserts the required connector is configured and healthy
3. **Authoritative execution** — Dispatches to the correct adapter:
   - AD DS actions → `services.adDirectory.*`
   - Cloud actions → `services.graph.*`
4. **Sync state capture** — AD DS mutations return `syncPending: true` with 30-minute estimated window
5. **Audit payload** — Builds normalized audit payload via `buildAuditPayload()` from P9-05
6. **Result normalization** — Returns `IHybridIdentityResult` with authority-used, data, error, and sync-state

## Authority routing

The `authority` field in the request body determines which execution boundary is used:
- `"ad-ds"` → AD DS adapter (on-prem)
- `"entra"` or `"cloud"` → Graph service (cloud)

The API route handlers parse this field and dispatch to the correct workflow function. The workflow functions themselves enforce connector preflight and do not fall back to the wrong authority.

## Error handling

Workflow functions catch all errors and map them to `IHybridIdentityResult` with typed error codes. The API route layer maps error codes to HTTP status codes:

| Error code | HTTP status |
|-----------|-------------|
| `VALIDATION` | 400 |
| `NOT_FOUND` | 404 |
| `CONFLICT` | 409 |
| `AUTHORITY_MISMATCH` | 422 |
| `GRAPH_PERMISSION_INSUFFICIENT` / `ADDS_PERMISSION_INSUFFICIENT` | 403 |
| `ADDS_CONNECTIVITY` / `ADDS_AUTHENTICATION` / `GRAPH_TRANSIENT` | 502 |
| `CONNECTION_NOT_CONFIGURED` / `CONNECTION_UNHEALTHY` | 503 |
| `PHASE_BOUNDARY` | 501 |

## No-code handoff compliance

All workflows fail clearly when connectors are not configured or unhealthy. Error messages direct operators to Connection Management in the admin app, never to code or environment files.
