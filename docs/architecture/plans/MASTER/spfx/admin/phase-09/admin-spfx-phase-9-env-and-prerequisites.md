# Phase 9 — Environment and Prerequisites Guide

## Purpose

Document the external prerequisites, configuration requirements, and setup boundaries for the Phase 9 Hybrid Identity Administration feature. This guide distinguishes between what the app manages through its UI and what requires external infrastructure or admin-portal actions.

## Hard gate

After the final `.sppkg` is delivered, IT must complete setup without editing source code, manifests, `.env` files, backend configuration files, deployment templates, or package files. All connector configuration is UI-managed through the Connections tab.

## Graph API permissions (admin consent required)

The following permissions must be granted to the Function App's Managed Identity via the **Entra admin portal** (admin consent). These are **not** configurable through the app UI — they are standard Microsoft admin approval steps.

| Permission | Scope | Actions served | Justification |
|-----------|-------|---------------|---------------|
| `User.Read.All` | Application | User search, read, sync status | Read user profiles and directory state |
| `User.ReadWrite.All` | Application | Cloud-only user create, update, disable, delete | Cloud user lifecycle |
| `Group.Read.All` | Application | Group search, read, sync status | Read group properties |
| `Group.ReadWrite.All` | Application | Cloud-only group create, update, delete | Cloud group lifecycle |
| `GroupMember.Read.All` | Application | Read group membership | View group members |
| `GroupMember.ReadWrite.All` | Application | Cloud-only membership add/remove, rollout access | Membership mutations |
| `Organization.Read.All` | Application | Organization sync metadata | Read directory sync state |

**How to grant**: Entra admin portal > App registrations > (Function App MI) > API permissions > Add permission > Microsoft Graph > Application permissions > Grant admin consent.

## AD DS infrastructure prerequisites

These are **external infrastructure prerequisites** that the app can only validate, not create:

| Prerequisite | Owner | Verification |
|-------------|-------|-------------|
| AD DS service account provisioned | IT / AD admin | Service account exists with delegated OU permissions |
| OU-scoped delegation (not domain-admin) | IT / AD admin | Permissions scoped to specific target OUs for user/group operations |
| Network path from Azure Function to AD DS | Network team | LDAPS (port 636) reachable from Function App |
| AD DS domain controllers healthy | IT / AD admin | DC responds to LDAP bind test |
| Azure AD Connect configured | IT / AD admin | Delta sync operational (~30 min cycle) |

**Important**: The AD DS service account should use **least-privilege delegation** scoped to specific OUs. It should not be a domain administrator.

## UI-configurable connection settings

After deployment, IT configures these settings entirely through the app's **Connections tab** (`/entra` > Connections). No code edits required.

### AD DS connector

| Setting | UI-configurable | Notes |
|---------|----------------|-------|
| Server endpoint (FQDN/IP) | Yes | Testable via connectivity check |
| Port (default 636) | Yes | |
| Use LDAPS (default true) | Yes | |
| Base DN | Yes | Testable via LDAP search base |
| Service account DN | Yes | Testable via bind test |
| Password | Yes | Write-only/masked, rotatable, backend-stored |
| Certificate reference | Yes | Thumbprint shown only, rotatable |

### Graph Identity connector

| Setting | UI-configurable | Notes |
|---------|----------------|-------|
| Permission confirmed toggle | Yes | Testable via Graph API call |
| Confirmed by (auto-captured) | Read-only | |
| Confirmed at (auto-captured) | Read-only | |

## Credential security model

- Passwords and certificate references entered through the UI are transmitted via HTTPS POST to the backend API
- The backend stores credentials securely (Azure Table Storage with encryption at rest)
- API responses **never** return sensitive fields — only presence flags (`hasCredential: true`)
- SPFx/browser code never caches, persists, or logs credentials
- Credentials are resolved at execution time in backend memory only

## Deployment-time vs post-deployment configuration

| Category | When | Who | How |
|----------|------|-----|-----|
| Function App deployment | Deployment | Developer/DevOps | CI/CD pipeline |
| Managed Identity assignment | Deployment | DevOps | Azure portal / ARM template |
| Graph permission consent | Post-deployment | Tenant admin | Entra admin portal |
| AD DS service account | Pre-deployment | AD admin | Active Directory |
| AD DS connector setup | Post-deployment | IT admin | App UI (Connections tab) |
| Graph connector confirmation | Post-deployment | IT admin | App UI (Connections tab) |

## Deferred and constrained actions

The following actions are **not available** in Phase 9 due to permission, sensitivity, or scope boundaries:

| Action | Status | Reason |
|--------|--------|--------|
| Password reset (AD DS) | Deferred | Requires password policy review |
| Account unlock (AD DS) | Deferred | Bundled with password reset |
| Password reset (cloud) | Deferred | Requires SSPR architecture review |
| Role-assignable group management | Deferred | Requires PIM-level governance |
| Directory role assignment | Deferred | Requires approval workflow |
| Conditional Access management | Out of scope | Security policy domain |
| MFA method management | Out of scope | Security policy domain |

## Sync and propagation caveats

- AD DS mutations succeed immediately at the source of authority
- Cloud-side propagation depends on Azure AD Connect delta sync (~30 min typical)
- The app displays sync-pending indicators after AD DS mutations with estimated window
- Operators should not treat sync-pending as a failure
- Manual sync-status check is available but does not force a sync cycle

## No-code setup verification

IT can verify that setup is complete when:

1. AD DS connector shows "Healthy" status after save + test
2. Graph Identity connector shows "Healthy" status after confirm + test
3. User search returns results from both AD DS-synced and cloud-only users
4. The Overview tab shows both connectors as "Healthy"

No code edits, `.env` edits, manifest edits, or backend config file changes should be needed at any point.
