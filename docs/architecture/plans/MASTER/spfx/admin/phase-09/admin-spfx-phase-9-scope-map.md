# Phase 9 Scope Map

## Purpose

Define what Phase 9 will and will not build, separating active scope from visibility-only, later-phase, and explicit non-goals.

This scope map is the single reference for whether a given capability belongs in Phase 9 implementation prompts (03–11).

---

## Active Phase 9 scope

### AD DS-authoritative user lifecycle actions

| Action | Authority | Execution boundary | Phase 9 disposition |
|--------|-----------|-------------------|---------------------|
| Search / lookup users | Read-only (Graph) | Graph service | **Active** — required for all user administration |
| View user profile and sync status | Read-only (Graph) | Graph service | **Active** — operator visibility |
| Create user (AD DS-synced environment) | AD DS authoritative | AD DS adapter | **Active** — core lifecycle |
| Update user properties (AD DS-synced) | AD DS authoritative | AD DS adapter | **Active** — core lifecycle |
| Disable user account (AD DS-synced) | AD DS authoritative | AD DS adapter | **Active** — core lifecycle |
| Enable user account (AD DS-synced) | AD DS authoritative | AD DS adapter | **Active** — core lifecycle |
| Delete user account (AD DS-synced) | AD DS authoritative | AD DS adapter | **Active** — destructive, requires elevated confirmation |
| Create cloud-only user | Entra authoritative | Graph service | **Active** — cloud-only lifecycle |
| Update cloud-only user | Entra authoritative | Graph service | **Active** — cloud-only lifecycle |
| Disable cloud-only user | Entra authoritative | Graph service | **Active** — cloud-only lifecycle |

### Group and membership actions by source of authority

| Action | Authority | Execution boundary | Phase 9 disposition |
|--------|-----------|-------------------|---------------------|
| Search / lookup groups | Read-only (Graph) | Graph service | **Active** |
| View group properties and sync status | Read-only (Graph) | Graph service | **Active** |
| View group membership | Read-only (Graph) | Graph service | **Active** |
| Create cloud-only security group | Entra authoritative | Graph service | **Active** — extends existing `createSecurityGroup` |
| Add members to cloud-only group | Entra authoritative | Graph service | **Active** — extends existing `addGroupMembers` |
| Remove members from cloud-only group | Entra authoritative | Graph service | **Active** |
| Delete cloud-only security group | Entra authoritative | Graph service | **Active** — extends existing `deleteSecurityGroup` |
| Add members to AD-synced group | AD DS authoritative | AD DS adapter | **Active** |
| Remove members from AD-synced group | AD DS authoritative | AD DS adapter | **Active** |

### Cloud-only identity / access actions

| Action | Authority | Execution boundary | Phase 9 disposition |
|--------|-----------|-------------------|---------------------|
| Grant rollout-critical group membership | Context-dependent | Authority-routed | **Active** — rollout-critical operations |
| Normalize access for new employee setup | Context-dependent | Authority-routed | **Active** — rollout support |
| View license assignments | Read-only (Graph) | Graph service | **Active** — visibility only |

### Sync-visibility actions

| Action | Execution boundary | Phase 9 disposition |
|--------|-------------------|---------------------|
| Check user sync status | Graph service | **Active** |
| Check group sync status | Graph service | **Active** |
| View last directory sync time | Graph service | **Active** |
| Verify sync propagation after AD DS mutation | Graph service | **Active** |

### Connection management

| Action | Phase 9 disposition |
|--------|---------------------|
| Configure AD DS connector (endpoint, credentials, base DN) | **Active** |
| Test AD DS connection | **Active** |
| View AD DS connection health / last-verified | **Active** |
| Rotate AD DS credentials | **Active** |
| Confirm Graph identity permissions (migrate from env-var gate) | **Active** |
| View Graph connection health | **Active** |
| Connection preflight before identity actions | **Active** |

### Infrastructure

| Item | Phase 9 disposition |
|------|---------------------|
| Connection registry service (Table Storage) | **Active** |
| AD DS adapter interface and implementation | **Active** |
| Graph service expansion (user read, sync, authority) | **Active** |
| Identity action API endpoints | **Active** |
| Identity audit/evidence integration | **Active** |
| Identity-specific permission strings | **Active** |
| Hybrid Identity lane in admin UI (promote scaffold) | **Active** |
| Connection management UI pages | **Active** |
| User administration UI pages | **Active** |
| Group administration UI pages | **Active** |

---

## Visibility-only or deferrable scope

These items may appear in Phase 9 as read-only visibility or with explicit deferral markers:

| Item | Phase 9 treatment | Why deferred |
|------|-------------------|-------------|
| Password reset / unlock (AD DS-synced) | **Visibility-only** — show whether account is locked; do not implement reset | High-risk action requiring SSPR/writeback architecture decisions |
| License assignment management | **Visibility-only** — show current assignments; do not implement changes | License management is broader M365 admin, not identity lifecycle |
| Conditional Access policy management | **Not in scope** — do not surface | Security policy, not identity lifecycle |
| Role-assignable group management | **Visibility-only** — show role-assignable groups; do not implement mutations | Elevated Entra role, requires PIM-level governance |
| Directory role assignments | **Visibility-only** — show current roles; do not implement changes | Privileged admin action requiring separate approval workflow |
| Multi-factor authentication management | **Not in scope** | Security policy, not identity lifecycle |

---

## Later-phase scope

These items are explicitly **not Phase 9** but are noted for phase boundary clarity:

| Item | Target phase | Dependency on Phase 9 |
|------|-------------|----------------------|
| White-glove device deployment | Phase 9B | Uses connection registry, no-code handoff model, adapter pattern |
| Live config drift detection and remediation | Phase 10 | Uses identity configuration as governed state |
| Automated approval workflows for destructive actions | Phase 11 | Uses risk tiers from Phase 9 action catalog |
| Identity observability dashboards | Phase 12 | Uses audit records and evidence from Phase 9 |
| Full SSPR / password writeback architecture | Later (unscheduled) | Requires dedicated architecture decision |
| Federation configuration management | Later (unscheduled) | Outside hybrid identity lifecycle scope |
| Automated credential expiry alerting | Later (improvement) | Phase 9 delivers manual rotation; alerting is refinement |
| Azure Key Vault integration for secrets | Later (hardening) | Phase 9 uses encrypted Table Storage as minimum viable |

---

## Explicit non-goals

These items must **not** be built in Phase 9:

| Non-goal | Reason |
|----------|--------|
| Full tenant-wide M365 administration | Phase 9 is hybrid identity, not broad M365 admin |
| Device-join / workstation management | Phase 9B scope |
| SharePoint site lifecycle outside identity | Phase 8 scope |
| Exchange mailbox management | Broader M365 admin |
| Teams management | Broader M365 admin |
| Intune device compliance | Phase 9B scope |
| `@hbc/features-admin` as privileged executor | Architectural violation |
| Direct SPFx-to-AD-DS communication | Architectural violation |
| Direct SPFx-to-Graph identity execution | Architectural violation — all identity Graph operations route through backend |
| Building empty frameworks for Phases 10–12 | Speculative — build only what Phase 9 needs |
| Rewriting the provisioning saga for identity | Reuse the pattern conceptually; do not refactor provisioning code |
| Broad rewrite of admin architecture docs | Update only what Phase 9 redirect requires |

---

## Scope decision matrix

When a capability is requested during Phase 9 implementation, use this matrix:

| Question | If yes | If no |
|----------|--------|-------|
| Is the object a user, group, or access action? | Continue | Out of scope |
| Does the action require source-of-authority routing? | Active scope | Check if read-only visibility |
| Is the action read-only / visibility? | Active scope (via Graph) | Continue |
| Is the action a lifecycle mutation? | Check authority type | Continue |
| Is the authority AD DS? | Route to AD DS adapter | Continue |
| Is the authority Entra (cloud-only)? | Route to Graph service | Continue |
| Is the action elevated/destructive? | Active with confirmation UX | Continue |
| Is the action password/SSPR/federation related? | Deferred | — |
| Is the action broader M365 admin? | Not in scope | — |
| Is the action device management? | Phase 9B | — |

---

## Cross-references

| Document | Purpose |
|----------|---------|
| `admin-spfx-phase-9-hybrid-identity-architecture-baseline.md` | Architecture baseline with responsibility split |
| `admin-spfx-phase-9-repo-truth-and-hybrid-gap-map.md` | Verified repo state and gap inventory |
| `admin-spfx-phase-9-connection-management-baseline.md` | Connection management architecture |
| `admin-spfx-phase-9-no-code-handoff-gate.md` | Architecture-level handoff gate |
| `Admin-SPFx-IT-Control-Center-Phase-9-Summary-Plan.md` | Phase 9 summary plan with acceptance criteria |
