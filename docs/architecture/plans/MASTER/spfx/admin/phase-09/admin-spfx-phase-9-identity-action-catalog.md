# Phase 9 Identity Action Catalog

## Purpose

Canonical action catalog for the Hybrid Identity control lane. Every action that Prompts 04–09 implement must trace back to a row in this catalog.

This catalog is governed by the Phase 9 hard gate: after `.sppkg` delivery, IT must complete setup and operation without editing code, manifests, env files, or backend config files.

---

## Catalog

### User domain

| # | Action | Domain | Source of authority | Rollout-critical | Risk tier | Destructive | Checkpoint / preview | Execution boundary | Graph permission | On-prem requirement | Audit | Connector dependency | Preflight | Phase disposition |
|---|--------|--------|-------------------|-----------------|-----------|-------------|---------------------|-------------------|-----------------|-------------------|-------|---------------------|-----------|-------------------|
| U-01 | Search / lookup users | User | Visibility-only | No | Routine | No | None | Graph service | `User.Read.All` | None | Read audit | Graph identity | Graph healthy | **Implement now** |
| U-02 | Read user profile and sync status | User | Visibility-only | No | Routine | No | None | Graph service | `User.Read.All` | None | Read audit | Graph identity | Graph healthy | **Implement now** |
| U-03 | Create user (AD DS-synced env) | User | AD DS authoritative | Yes | Elevated | No | Preview required — show OU, attributes | AD DS adapter | None (sync creates Entra object) | AD DS service account: create user in target OU | Full audit + evidence | AD DS connector | AD DS healthy + target OU writable | **Implement now** |
| U-04 | Create cloud-only user | User | Entra authoritative | Yes | Elevated | No | Preview required — show attributes | Graph service | `User.ReadWrite.All` | None | Full audit + evidence | Graph identity | Graph healthy + permission confirmed | **Implement now** |
| U-05 | Update user properties (AD DS-synced) | User | AD DS authoritative | No | Routine | No | Preview required — show before/after | AD DS adapter | None (sync propagates changes) | AD DS service account: modify user attributes | Full audit | AD DS connector | AD DS healthy | **Implement now** |
| U-06 | Update cloud-only user properties | User | Entra authoritative | No | Routine | No | Preview required — show before/after | Graph service | `User.ReadWrite.All` | None | Full audit | Graph identity | Graph healthy + permission confirmed | **Implement now** |
| U-07 | Disable user account (AD DS-synced) | User | AD DS authoritative | No | Elevated | No | Confirmation required — show impact | AD DS adapter | None (sync propagates state) | AD DS service account: disable account | Full audit + evidence | AD DS connector | AD DS healthy | **Implement now** |
| U-08 | Disable cloud-only user | User | Entra authoritative | No | Elevated | No | Confirmation required — show impact | Graph service | `User.ReadWrite.All` | None | Full audit + evidence | Graph identity | Graph healthy + permission confirmed | **Implement now** |
| U-09 | Enable user account (AD DS-synced) | User | AD DS authoritative | No | Routine | No | Confirmation required | AD DS adapter | None | AD DS service account: enable account | Full audit | AD DS connector | AD DS healthy | **Implement now** |
| U-10 | Enable cloud-only user | User | Entra authoritative | No | Routine | No | Confirmation required | Graph service | `User.ReadWrite.All` | None | Full audit | Graph identity | Graph healthy + permission confirmed | **Implement now** |
| U-11 | Delete user (AD DS-synced) | User | AD DS authoritative | No | Destructive | **Yes** | Double confirmation + preview + impact | AD DS adapter | None | AD DS service account: delete user | Full audit + evidence + pre-state | AD DS connector | AD DS healthy | **Implement now** — gated by complexity tier |
| U-12 | Delete cloud-only user | User | Entra authoritative | No | Destructive | **Yes** | Double confirmation + preview + impact | Graph service | `User.ReadWrite.All` | None | Full audit + evidence + pre-state | Graph identity | Graph healthy + permission confirmed | **Implement now** — gated by complexity tier |
| U-13 | Reset password (AD DS-synced) | User | AD DS authoritative | No | Elevated | No | Confirmation required | AD DS adapter | None | AD DS service account: reset password | Full audit + evidence | AD DS connector | AD DS healthy | **Defer** — requires password policy review |
| U-14 | Unlock account (AD DS-synced) | User | AD DS authoritative | No | Routine | No | Confirmation required | AD DS adapter | None | AD DS service account: unlock account | Full audit | AD DS connector | AD DS healthy | **Defer** — bundled with U-13 |
| U-15 | Reset password (cloud-only) | User | Entra authoritative | No | Elevated | No | Confirmation required | Graph service | `UserAuthenticationMethod.ReadWrite.All` or `User.ReadWrite.All` | None | Full audit + evidence | Graph identity | Graph healthy | **Defer** — requires SSPR architecture review |

### Group domain

| # | Action | Domain | Source of authority | Rollout-critical | Risk tier | Destructive | Checkpoint / preview | Execution boundary | Graph permission | On-prem requirement | Audit | Connector dependency | Preflight | Phase disposition |
|---|--------|--------|-------------------|-----------------|-----------|-------------|---------------------|-------------------|-----------------|-------------------|-------|---------------------|-----------|-------------------|
| G-01 | Search / lookup groups | Group | Visibility-only | No | Routine | No | None | Graph service | `Group.Read.All` | None | Read audit | Graph identity | Graph healthy | **Implement now** |
| G-02 | Read group properties and sync status | Group | Visibility-only | No | Routine | No | None | Graph service | `Group.Read.All` | None | Read audit | Graph identity | Graph healthy | **Implement now** |
| G-03 | View group membership | Group | Visibility-only | No | Routine | No | None | Graph service | `GroupMember.Read.All` | None | Read audit | Graph identity | Graph healthy | **Implement now** |
| G-04 | Create cloud-only security group | Group | Entra authoritative | No | Elevated | No | Preview required — show name, description | Graph service | `Group.ReadWrite.All` | None | Full audit + evidence | Graph identity | Graph healthy + permission confirmed | **Implement now** |
| G-05 | Update cloud-only group properties | Group | Entra authoritative | No | Routine | No | Preview required | Graph service | `Group.ReadWrite.All` | None | Full audit | Graph identity | Graph healthy + permission confirmed | **Implement now** |
| G-06 | Add members to cloud-only group | Group | Entra authoritative | No | Routine | No | Preview required — show member list | Graph service | `GroupMember.ReadWrite.All` | None | Full audit | Graph identity | Graph healthy + permission confirmed | **Implement now** |
| G-07 | Remove members from cloud-only group | Group | Entra authoritative | No | Elevated | No | Confirmation required — show removal impact | Graph service | `GroupMember.ReadWrite.All` | None | Full audit | Graph identity | Graph healthy + permission confirmed | **Implement now** |
| G-08 | Delete cloud-only security group | Group | Entra authoritative | No | Destructive | **Yes** | Double confirmation + preview | Graph service | `Group.ReadWrite.All` | None | Full audit + evidence + pre-state | Graph identity | Graph healthy + permission confirmed | **Implement now** — complexity gated |
| G-09 | Add members to AD-synced group | Group | AD DS authoritative | No | Routine | No | Preview required | AD DS adapter | None | AD DS service account: modify group membership | Full audit | AD DS connector | AD DS healthy | **Implement now** |
| G-10 | Remove members from AD-synced group | Group | AD DS authoritative | No | Elevated | No | Confirmation required | AD DS adapter | None | AD DS service account: modify group membership | Full audit | AD DS connector | AD DS healthy | **Implement now** |
| G-11 | Create AD-synced security group | Group | AD DS authoritative | No | Elevated | No | Preview required — show OU, name | AD DS adapter | None | AD DS service account: create group in target OU | Full audit + evidence | AD DS connector | AD DS healthy + target OU writable | **Implement now** |
| G-12 | Delete AD-synced security group | Group | AD DS authoritative | No | Destructive | **Yes** | Double confirmation + preview + impact | AD DS adapter | None | AD DS service account: delete group | Full audit + evidence + pre-state | AD DS connector | AD DS healthy | **Implement now** — complexity gated |

### Access-setup / rollout-critical domain

| # | Action | Domain | Source of authority | Rollout-critical | Risk tier | Destructive | Checkpoint / preview | Execution boundary | Graph permission | On-prem requirement | Audit | Connector dependency | Preflight | Phase disposition |
|---|--------|--------|-------------------|-----------------|-----------|-------------|---------------------|-------------------|-----------------|-------------------|-------|---------------------|-----------|-------------------|
| A-01 | Grant rollout-critical group membership | Access-setup | Coordinated | **Yes** | Elevated | No | Preview required — show groups and target user | Authority-routed (AD DS or Graph) | `GroupMember.ReadWrite.All` (if cloud group) | AD DS service account (if AD-synced group) | Full audit + evidence | Authority-dependent | Appropriate connector healthy | **Implement now** |
| A-02 | Normalize new-employee access setup | Access-setup | Coordinated | **Yes** | Elevated | No | Preview required — show all planned group assignments | Authority-routed | `GroupMember.ReadWrite.All` (if cloud groups involved) | AD DS service account (if AD-synced groups involved) | Full audit + evidence | Authority-dependent | All required connectors healthy | **Implement now** |

### Sync / visibility domain

| # | Action | Domain | Source of authority | Rollout-critical | Risk tier | Destructive | Checkpoint / preview | Execution boundary | Graph permission | On-prem requirement | Audit | Connector dependency | Preflight | Phase disposition |
|---|--------|--------|-------------------|-----------------|-----------|-------------|---------------------|-------------------|-----------------|-------------------|-------|---------------------|-----------|-------------------|
| S-01 | Check user sync status | Sync | Visibility-only | No | Routine | No | None | Graph service | `User.Read.All` | None | Read audit | Graph identity | Graph healthy | **Implement now** |
| S-02 | Check group sync status | Sync | Visibility-only | No | Routine | No | None | Graph service | `Group.Read.All` | None | Read audit | Graph identity | Graph healthy | **Implement now** |
| S-03 | View last directory sync time | Sync | Visibility-only | No | Routine | No | None | Graph service | `Organization.Read.All` | None | Read audit | Graph identity | Graph healthy | **Implement now** |
| S-04 | Verify sync propagation after AD DS mutation | Sync | Visibility-only | No | Sync-sensitive | No | None — auto-triggered post-mutation | Graph service | `User.Read.All` or `Group.Read.All` | None | Linked to parent action audit | Graph identity | Graph healthy | **Implement now** |

### Dangerous / constrained actions

| # | Action | Domain | Source of authority | Rollout-critical | Risk tier | Destructive | Checkpoint / preview | Execution boundary | Graph permission | On-prem requirement | Audit | Connector dependency | Preflight | Phase disposition |
|---|--------|--------|-------------------|-----------------|-----------|-------------|---------------------|-------------------|-----------------|-------------------|-------|---------------------|-----------|-------------------|
| D-01 | Manage role-assignable groups | Group | Entra authoritative | No | Privileged-admin | No | N/A | Graph service | `RoleManagement.ReadWrite.Directory` | None | N/A | Graph identity | N/A | **Defer** — requires PIM-level governance |
| D-02 | Assign directory roles | Cloud-side | Entra authoritative | No | Privileged-admin | No | N/A | Graph service | `RoleManagement.ReadWrite.Directory` | None | N/A | Graph identity | N/A | **Defer** — requires approval workflow |
| D-03 | Manage Conditional Access policies | Cloud-side | Entra authoritative | No | Privileged-admin | No | N/A | Graph service | `Policy.ReadWrite.ConditionalAccess` | None | N/A | Graph identity | N/A | **Not in scope** — security policy, not identity lifecycle |
| D-04 | Manage MFA methods | Cloud-side | Entra authoritative | No | Privileged-admin | No | N/A | Graph service | `UserAuthenticationMethod.ReadWrite.All` | None | N/A | Graph identity | N/A | **Not in scope** — security policy |

---

## Summary counts

| Disposition | Count |
|------------|-------|
| Implement now | 26 |
| Defer | 4 (U-13, U-14, U-15, D-01) |
| Not in scope | 2 (D-03, D-04) |
| **Total cataloged** | **32** |

---

## Cross-references

| Document | Purpose |
|----------|---------|
| `admin-spfx-phase-9-source-of-authority-matrix.md` | Authority routing per object type |
| `admin-spfx-phase-9-risk-taxonomy.md` | Risk tier definitions and UX consequences |
| `admin-spfx-phase-9-permission-access-role-and-consent-matrix.md` | Permission mapping per action |
| `admin-spfx-phase-9-connection-dependency-matrix.md` | Connector requirements per action |
| `admin-spfx-phase-9-ui-configurability-matrix.md` | UI-manageable configuration per action and connector |
| `admin-spfx-phase-9-scope-map.md` | Phase scope boundary |
| `admin-spfx-phase-9-hybrid-identity-architecture-baseline.md` | Architecture baseline |
