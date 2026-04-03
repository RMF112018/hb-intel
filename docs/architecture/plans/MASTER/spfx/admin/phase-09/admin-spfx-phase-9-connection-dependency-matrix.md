# Phase 9 Connection Dependency Matrix

## Purpose

Map every implement-now action to its required connector, backend service boundary, credential requirements, degraded-mode behavior, and operator-visible preflight requirements.

No action marked "implement now" may silently assume code-bound configuration.

---

## Connector classes

| Connector ID | Connector class | Backend service | Credential type | Phase 9 status |
|-------------|----------------|----------------|-----------------|---------------|
| `ad-ds` | AD DS / on-prem directory | AD DS adapter (new) | Service account password or certificate — UI-entered, backend-stored | Must build |
| `graph-identity` | Graph / Entra identity | Graph service (expanded) | Managed Identity (deployment-time) + permission confirmation (UI-managed) | Must expand |

---

## Action-to-connector mapping

### User actions

| Action | Required connector | Backend service boundary | Degraded-mode behavior | Preflight |
|--------|-------------------|------------------------|----------------------|-----------|
| U-01 Search users | `graph-identity` | Graph service | **Blocked** — cannot search without Graph | Graph healthy |
| U-02 Read user profile | `graph-identity` | Graph service | **Blocked** | Graph healthy |
| U-03 Create user (AD DS) | `ad-ds` | AD DS adapter | **Blocked** — cannot create without AD DS connection | AD DS healthy + target OU writable |
| U-04 Create cloud-only user | `graph-identity` | Graph service | **Blocked** | Graph healthy + permission confirmed |
| U-05 Update user (AD DS) | `ad-ds` | AD DS adapter | **Blocked** | AD DS healthy |
| U-06 Update cloud-only user | `graph-identity` | Graph service | **Blocked** | Graph healthy + permission confirmed |
| U-07 Disable user (AD DS) | `ad-ds` | AD DS adapter | **Blocked** | AD DS healthy |
| U-08 Disable cloud-only user | `graph-identity` | Graph service | **Blocked** | Graph healthy + permission confirmed |
| U-09 Enable user (AD DS) | `ad-ds` | AD DS adapter | **Blocked** | AD DS healthy |
| U-10 Enable cloud-only user | `graph-identity` | Graph service | **Blocked** | Graph healthy + permission confirmed |
| U-11 Delete user (AD DS) | `ad-ds` | AD DS adapter | **Blocked** | AD DS healthy |
| U-12 Delete cloud-only user | `graph-identity` | Graph service | **Blocked** | Graph healthy + permission confirmed |

### Group actions

| Action | Required connector | Backend service boundary | Degraded-mode behavior | Preflight |
|--------|-------------------|------------------------|----------------------|-----------|
| G-01 Search groups | `graph-identity` | Graph service | **Blocked** | Graph healthy |
| G-02 Read group properties | `graph-identity` | Graph service | **Blocked** | Graph healthy |
| G-03 View group membership | `graph-identity` | Graph service | **Blocked** | Graph healthy |
| G-04 Create cloud-only group | `graph-identity` | Graph service | **Blocked** | Graph healthy + permission confirmed |
| G-05 Update cloud-only group | `graph-identity` | Graph service | **Blocked** | Graph healthy + permission confirmed |
| G-06 Add members (cloud group) | `graph-identity` | Graph service | **Blocked** | Graph healthy + permission confirmed |
| G-07 Remove members (cloud group) | `graph-identity` | Graph service | **Blocked** | Graph healthy + permission confirmed |
| G-08 Delete cloud-only group | `graph-identity` | Graph service | **Blocked** | Graph healthy + permission confirmed |
| G-09 Add members (AD group) | `ad-ds` | AD DS adapter | **Blocked** | AD DS healthy |
| G-10 Remove members (AD group) | `ad-ds` | AD DS adapter | **Blocked** | AD DS healthy |
| G-11 Create AD-synced group | `ad-ds` | AD DS adapter | **Blocked** | AD DS healthy + target OU writable |
| G-12 Delete AD-synced group | `ad-ds` | AD DS adapter | **Blocked** | AD DS healthy |

### Access-setup actions

| Action | Required connector | Backend service boundary | Degraded-mode behavior | Preflight |
|--------|-------------------|------------------------|----------------------|-----------|
| A-01 Grant rollout-critical membership | `ad-ds` and/or `graph-identity` | Authority-routed | **Partially degraded** — can execute cloud-only assignments if AD DS is down; AD DS assignments blocked | Appropriate connector(s) healthy |
| A-02 Normalize new-employee access | `ad-ds` and/or `graph-identity` | Authority-routed | **Partially degraded** — same as A-01 | All required connectors healthy |

### Sync/visibility actions

| Action | Required connector | Backend service boundary | Degraded-mode behavior | Preflight |
|--------|-------------------|------------------------|----------------------|-----------|
| S-01 Check user sync status | `graph-identity` | Graph service | **Blocked** | Graph healthy |
| S-02 Check group sync status | `graph-identity` | Graph service | **Blocked** | Graph healthy |
| S-03 View last directory sync time | `graph-identity` | Graph service | **Blocked** | Graph healthy |
| S-04 Verify sync propagation | `graph-identity` | Graph service | **Blocked** | Graph healthy |

---

## Connector credential and configuration requirements

### AD DS connector (`ad-ds`)

| Property | Entry method | Storage | Testable | Rotatable | Shown after save |
|----------|-------------|---------|----------|-----------|-----------------|
| Server endpoint (FQDN/IP) | Text input (UI) | Table Storage (plain) | Yes — connectivity check | Yes — update + retest | Yes |
| Port | Number input (UI, default 636) | Table Storage (plain) | Yes — connectivity check | Yes | Yes |
| Use LDAPS | Toggle (UI, default true) | Table Storage (plain) | Yes — TLS negotiation check | Yes | Yes |
| Base DN | Text input (UI) | Table Storage (plain) | Yes — LDAP search base validation | Yes | Yes |
| Service account UPN/DN | Text input (UI) | Table Storage (plain) | Yes — bind test | Yes | Yes |
| Auth method | Select: password/certificate (UI) | Table Storage (plain) | Yes | Yes | Yes |
| Service account password | Password input (UI) | Table Storage (encrypted at rest) | Yes — bind test | Yes — enter new + retest | **No — write-only / masked** |
| Certificate reference | Text/upload (UI) | Table Storage (reference only) | Yes — bind test | Yes — provide new + retest | Thumbprint only |

### Graph identity connector (`graph-identity`)

| Property | Entry method | Storage | Testable | Rotatable | Shown after save |
|----------|-------------|---------|----------|-----------|-----------------|
| Permission confirmed | Toggle (UI) | Table Storage (connection registry) | Yes — `GET /users?$top=1` test | N/A — boolean state | Yes |
| Confirmed by | Auto-captured from actor | Table Storage | N/A | N/A | Yes |
| Confirmed at | Auto-captured timestamp | Table Storage | N/A | N/A | Yes |

---

## Degraded-mode rules

| Scenario | Impact | Operator UX |
|----------|--------|-------------|
| AD DS connector unhealthy | All AD DS-authoritative actions blocked; cloud-only actions unaffected | Banner: "AD DS connection is unhealthy. AD DS-authoritative actions are unavailable." + link to connection management |
| Graph identity connector unhealthy | All actions blocked (including reads) | Banner: "Graph identity connection is unhealthy. Identity actions are unavailable." + link to connection management |
| Both connectors unhealthy | All identity actions blocked | Banner: "All identity connectors are unhealthy." + link to connection management |
| AD DS connector untested | AD DS-authoritative actions blocked until first successful test | Banner: "AD DS connection has not been tested. Configure and test the connection." |
| Graph permission not confirmed | Cloud-only write actions blocked; reads may work | Banner: "Graph identity permissions have not been confirmed." |

---

## Operator-visible preflight requirements

Before any identity action is submitted, the UI must display preflight status:

| Preflight check | Applies to | Pass condition | Failure message |
|----------------|-----------|---------------|-----------------|
| AD DS connection exists | AD DS actions | Connection registry has `ad-ds` entry | "AD DS connector is not configured. Go to Connection Management to set it up." |
| AD DS connection healthy | AD DS actions | Last test succeeded within staleness window | "AD DS connection is unhealthy or untested. Go to Connection Management to test it." |
| Graph permission confirmed | Cloud-only write actions | Connection registry `graph-identity.permissionConfirmed === true` | "Graph identity permissions have not been confirmed. Go to Connection Management." |
| Graph connection healthy | All identity actions | Graph test succeeded within staleness window | "Graph connection is unhealthy or untested." |
| Operator has required permission | All actions | `PermissionGate` check for action-specific permission | "You do not have permission to perform this action." |

---

## UI-configurable vs deployment-fixed classification

| Item | Classification | Connector |
|------|---------------|-----------|
| AD DS endpoint, port, base DN, account, password, auth method, LDAPS toggle | **UI-configurable** | `ad-ds` |
| Graph permission confirmation | **UI-configurable** | `graph-identity` |
| Managed Identity client ID (`AZURE_CLIENT_ID`) | **Deployment-fixed** | Platform infrastructure |
| Table Storage connection | **Deployment-fixed** | Platform infrastructure |
| Graph API endpoint (`https://graph.microsoft.com`) | **Deployment-fixed** | Platform constant |

---

## Cross-references

| Document | Purpose |
|----------|---------|
| `admin-spfx-phase-9-identity-action-catalog.md` | Action definitions |
| `admin-spfx-phase-9-permission-access-role-and-consent-matrix.md` | Permission requirements |
| `admin-spfx-phase-9-connection-management-baseline.md` | Connection management architecture |
| `admin-spfx-phase-9-ui-configurability-matrix.md` | UI configurability per setting |
