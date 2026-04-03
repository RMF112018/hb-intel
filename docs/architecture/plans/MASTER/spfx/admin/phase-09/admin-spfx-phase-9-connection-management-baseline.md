# Phase 9 Connection Management Baseline

## Purpose

Define the connection management architecture for Phase 9 Hybrid Identity Administration — what connections are required, how they are configured through the UI, how credentials are stored securely in the backend, and how connection health is monitored and maintained.

This document is governed by the Phase 9 hard gate:

> After the final `.sppkg` is delivered, IT must be able to install the app and complete required operational setup and ongoing maintenance **without editing source code, manifests, environment files, backend configuration files, deployment templates, or package files**.

---

## Connection classes Phase 9 requires

### Class 1: AD DS / on-prem directory connection

| Property | Detail |
|----------|--------|
| **Purpose** | Authoritative user lifecycle and AD-synced group membership operations |
| **Configuration** | Server endpoint (FQDN or IP), port (default 636 for LDAPS), base DN, service account UPN/DN, authentication method |
| **Sensitive values** | Service account password or certificate reference |
| **Health check** | LDAP bind test against configured endpoint with service account credentials |
| **Rotation** | Service account password or certificate rotation through UI without downtime |
| **Phase 9 status** | Must build — does not exist |

### Class 2: Graph / Entra identity connection

| Property | Detail |
|----------|--------|
| **Purpose** | Cloud-side identity operations — user read/search, sync-status, cloud-only lifecycle, group operations |
| **Configuration** | Permission confirmation status (migrated from `GRAPH_GROUP_PERMISSION_CONFIRMED` env var), identity-specific permission scope validation |
| **Sensitive values** | None directly — Graph uses Managed Identity, which is deployment infrastructure. The connection registry tracks permission confirmation state, not credentials. |
| **Health check** | Test Graph API call (e.g., `GET /users?$top=1`) to verify Managed Identity has required permissions |
| **Rotation** | Not applicable for Managed Identity — rotation is platform-managed. The registry tracks permission status. |
| **Phase 9 status** | Must build — env-var gate must migrate to connection registry |

### Deployment-time infrastructure connections (NOT UI-managed)

These connections are Azure platform infrastructure set by the developer at deployment time. They are **acceptable** as deployment-time config and do NOT need UI management:

| Connection | Why not UI-managed |
|------------|-------------------|
| `AZURE_CLIENT_ID` (Managed Identity) | Azure platform identity — set once per Function App deployment |
| `AzureWebJobsStorage` (Table Storage) | Azure Functions runtime plumbing |
| `SHAREPOINT_TENANT_URL` | Tenant URL — set once per deployment |
| `SIGNALR_CONNECTION_STRING` | Azure Functions binding plumbing |

---

## What the UI must allow an authorized IT operator to configure

### AD DS connector configuration

| Field | Type | Required | Sensitive |
|-------|------|----------|-----------|
| Display name | Text | Yes | No |
| Server endpoint (FQDN or IP) | Text | Yes | No |
| Port | Number (default: 636) | Yes | No |
| Use LDAPS (TLS) | Boolean (default: true) | Yes | No |
| Base DN | Text (e.g., `DC=corp,DC=contoso,DC=com`) | Yes | No |
| Service account UPN or DN | Text | Yes | No |
| Authentication method | Enum: `password`, `certificate` | Yes | No |
| Service account password | Password | Conditional (if auth method = password) | **Yes** |
| Certificate reference | Text/file | Conditional (if auth method = certificate) | **Yes** |
| Description / notes | Text | No | No |

### Graph identity permission confirmation

| Field | Type | Required | Sensitive |
|-------|------|----------|-----------|
| Permission confirmed | Boolean | Yes | No |
| Confirmed by (auto-captured) | Actor identity | Auto | No |
| Confirmed at (auto-captured) | Timestamp | Auto | No |
| Notes | Text | No | No |

---

## Sensitive values: UI collection and backend custody

### Security model

1. **The UI may collect sensitive values** (passwords, certificate references) through form fields.
2. **The UI must transmit sensitive values only via HTTPS** to the authenticated backend API.
3. **The backend must store sensitive values securely** — never return them in API responses.
4. **API responses must redact sensitive fields** — return existence indicators (e.g., `hasPassword: true`) but never the actual value.
5. **SPFx must never cache, persist, or log sensitive values** — they exist in memory only during form submission.

### Backend storage model

**Phase 9 minimum viable:** Azure Table Storage with Azure Storage Service Encryption (SSE) at rest.

| Storage concern | Approach |
|-----------------|----------|
| Non-sensitive metadata | Stored as plain Table Storage entity properties |
| Passwords | Stored as encrypted property or hashed indicator; the actual credential is used only at execution time |
| Certificate references | Stored as reference identifier (e.g., Key Vault secret name or thumbprint); the actual certificate is resolved at execution time |
| API responses | Sensitive fields are **never** included in GET responses — replaced with existence flags |

**Later hardening (not Phase 9):** Azure Key Vault integration for enhanced secret management. Phase 9's Table Storage approach is acceptable because:
- Azure Storage SSE provides encryption at rest
- Bearer token authentication prevents unauthorized API access
- Permission gating limits who can configure connections
- The connection registry is a backend-only store, never exposed to SPFx

### Credential lifecycle

```
IT admin (UI) → enters password → HTTPS POST → Backend API
  → validates input
  → writes to ConnectionRegistry Table Storage (encrypted at rest)
  → returns success (NO credential in response)

Identity action execution:
  → Backend loads connection from registry
  → Resolves credential from stored entity
  → Passes to AD DS adapter for execution
  → Credential exists only in backend memory during execution
```

---

## Connection tests / health checks / last-verified state

### Connection test flow

```
IT admin clicks "Test Connection" in UI
  → POST /api/admin/connections/{id}/test
  → Backend loads connection config from registry
  → Resolves credentials
  → Executes test:
    - AD DS: LDAP bind attempt
    - Graph: GET /users?$top=1
  → Records result:
    - lastTestedAt: timestamp
    - lastTestResult: success | failure
    - lastTestError: error detail (if failed)
    - testedBy: actor identity
  → Returns result to UI (NO credentials in response)
```

### Health metadata per connection

| Field | Type | Updated by |
|-------|------|-----------|
| `lastTestedAt` | ISO timestamp | Connection test |
| `lastTestResult` | `success` \| `failure` | Connection test |
| `lastTestError` | String (error detail) | Connection test (on failure) |
| `lastTestedBy` | Actor UPN | Connection test |
| `lastSuccessfulTestAt` | ISO timestamp | Connection test (on success) |
| `status` | `healthy` \| `unhealthy` \| `untested` | Derived from test results |

### Preflight integration

Before executing any hybrid identity action, the backend preflight must:
1. Check that the required connection exists in the registry.
2. Check that the connection has been tested successfully.
3. Optionally check that the last successful test is within an acceptable window (configurable staleness threshold).
4. Refuse execution with a clear error if any preflight check fails.

---

## Credential rotation and endpoint updates without code edits

### Password rotation flow

1. IT admin navigates to connection management page.
2. IT admin selects the AD DS connector.
3. IT admin enters the new password (old password is not required — this is a replacement, not a change).
4. Backend validates the new credential by executing a connection test.
5. If test succeeds: update the stored credential, update health metadata.
6. If test fails: reject the update, display the error, retain the old credential.
7. No downtime — the update is atomic in Table Storage.

### Endpoint update flow

1. IT admin updates the server endpoint, port, or base DN.
2. Backend validates the new endpoint by executing a connection test with existing credentials.
3. If test succeeds: update the stored configuration, update health metadata.
4. If test fails: reject the update, display the error, retain the old configuration.

### Certificate rotation flow

1. IT admin provides a new certificate reference (thumbprint, Key Vault name, or upload).
2. Backend validates the new certificate by executing a connection test.
3. Same success/failure handling as password rotation.

---

## Security controls preventing unsafe secret handling in SPFx

| Control | Enforcement |
|---------|-------------|
| SPFx never receives credentials in API responses | Backend API serialization omits sensitive fields |
| SPFx never caches credentials | No credential state in Zustand, React Query, or local storage |
| SPFx transmits credentials only via authenticated HTTPS POST | Session token factory provides Bearer token; form submission is POST-only |
| Connection configuration requires permission | `PermissionGate` with identity-admin permission string |
| Backend validates caller identity before connection writes | Bearer token validation via `validateToken` middleware |
| Audit trail for connection changes | All connection CRUD operations produce audit records |

---

## What must remain deployment-time vs app-configurable

| Item | Classification | Reason |
|------|---------------|--------|
| Azure Managed Identity (`AZURE_CLIENT_ID`) | Deployment-time | Azure platform identity — cannot be changed through app UI |
| Table Storage connection (`AzureWebJobsStorage`) | Deployment-time | Azure Functions runtime binding |
| SharePoint tenant URL | Deployment-time | Tenant-specific — set once per deployment |
| SignalR connection | Deployment-time | Azure Functions binding |
| AD DS connector configuration | **App-configurable** | IT must manage without code edits |
| AD DS credentials | **App-configurable** | IT must rotate without code edits |
| Graph permission confirmation | **App-configurable** | IT must confirm after consent without code edits |

---

## Cross-references

| Document | Purpose |
|----------|---------|
| `admin-spfx-phase-9-hybrid-identity-architecture-baseline.md` | Architecture baseline defining responsibility split |
| `admin-spfx-phase-9-connection-topology-and-config-gap-map.md` | Prompt-01 gap analysis for connections |
| `admin-spfx-phase-9-no-code-handoff-gate.md` | Architecture-level handoff gate |
| `admin-spfx-phase-9-no-code-handoff-gate-checklist.md` | Prompt-01 blocker enumeration |
