# Phase 9 — Hybrid Identity Operator Runbook

## Purpose

Explain what the Hybrid Identity lane can and cannot do, how operators should interpret its states, and how to handle common situations.

## What the Hybrid Identity lane does

The Hybrid Identity lane (`/entra`) enables authorized IT administrators to:

- **Search** users and groups across AD DS-synced and cloud-only objects
- **Create** users in AD DS (on-prem authoritative) or cloud-only (Entra authoritative)
- **Enable/disable** user accounts through the correct authority boundary
- **Delete** users with risk-aware double-confirmation
- **Configure and test** backend connectors (AD DS and Graph) through the UI
- **View audit history** of identity operations

## What it cannot do

- Password reset or account unlock (AD DS or cloud) — deferred
- Group lifecycle operations (create, membership, delete) — backend endpoints pending
- Role-assignable group management or directory role assignment — deferred
- Conditional Access or MFA management — out of scope
- Force an Azure AD Connect sync cycle — the app monitors but does not trigger sync
- Bypass admin consent for Graph permissions — must be granted in Entra admin portal

## Source-of-authority model

| Object type | Authority | Execution boundary | Sync implication |
|------------|-----------|-------------------|-----------------|
| AD DS-synced user (`onPremisesSyncEnabled=true`) | AD DS | AD DS adapter | Changes propagate after ~30 min delta sync |
| Cloud-only user (`onPremisesSyncEnabled=false`) | Entra | Graph service | Immediate — no sync delay |
| AD DS-synced group | AD DS | AD DS adapter | Changes propagate after delta sync |
| Cloud-only group | Entra | Graph service | Immediate |

The app resolves authority automatically based on the `onPremisesSyncEnabled` flag from Graph. Operators do not need to choose — the system routes to the correct boundary.

## Connection management

### How to configure connectors

1. Navigate to `/entra` > **Connections** tab
2. **AD DS Connector**: Enter server endpoint, port, base DN, service account DN, and password. Click **Save Connection**, then **Test Connection**
3. **Graph Identity Connector**: Click **Confirm Permissions Granted** (after granting consent in Entra portal), then **Test Connection**

### Connection health states

| Status | Badge | Meaning |
|--------|-------|---------|
| Healthy | Green | Last test succeeded — operations available |
| Unhealthy | Red | Last test failed — operations blocked |
| Not tested | Gray | Connection saved but never tested — must test before use |
| Not configured | Gray | Connector not set up — go to Connections tab |

### When connections fail

- **AD DS connector unhealthy**: All AD DS-authoritative operations are blocked. Cloud-only operations remain available. Check: network path to DC, service account credentials, LDAPS port accessibility.
- **Graph connector unhealthy**: All operations are blocked (including search). Check: admin consent granted in Entra portal, Managed Identity configured correctly.
- **Connection preflight banners** appear on the Users and Groups tabs when connectors are not healthy, directing operators to the Connections tab.

## Risk tiers and confirmations

| Risk tier | Actions | Confirmation required |
|-----------|---------|----------------------|
| **Routine** | Search, read, enable | Warning dialog |
| **Elevated** | Create, update, disable | Warning dialog with preview |
| **Destructive** | Delete (user or group) | Double confirmation (two dialogs) |

Destructive operations show red "danger" styling and require explicit final confirmation. The delete button on search results is colored red to avoid casual activation.

## Interpreting sync-pending state

After an AD DS mutation succeeds:

1. A **sync-pending** indicator appears in the result with an estimated window (~30 minutes)
2. This means the **authoritative action succeeded** in AD DS
3. Cloud-side state (visible in Entra/Graph) may not reflect the change yet
4. Sync depends on Azure AD Connect delta cycle — the app does not control this
5. Do **not** treat sync-pending as a failure or retry the operation

## Interpreting audit history

The **History** tab shows recent identity operations with:

- **Timestamp**: When the operation occurred
- **Summary**: What action was performed on which target
- **Actor**: Who performed the operation (UPN)
- **Result**: Success (green) or Failed (red) badge

Audit records are persisted in Azure Table Storage and survive app restarts. They are filtered to the `entra-control` domain.

## Common error codes and guidance

| Code | Meaning | What to do |
|------|---------|------------|
| `VALIDATION` | Input format error | Check field values and try again |
| `NOT_FOUND` | Target user/group not found | Entity may have been deleted elsewhere; refresh search |
| `CONFLICT` | Duplicate exists | A user/group with that identifier already exists |
| `AUTHORITY_MISMATCH` | Wrong authority for mutation | Cannot mutate AD DS-synced objects through Graph or vice versa |
| `GRAPH_PERMISSION_INSUFFICIENT` | Missing Graph permission | Grant admin consent in Entra admin portal |
| `ADDS_CONNECTIVITY` | Cannot reach AD DS | Check network path and DC health |
| `ADDS_AUTHENTICATION` | AD DS bind failed | Check service account credentials in Connections tab |
| `CONNECTION_NOT_CONFIGURED` | Connector missing | Configure the connector in the Connections tab |
| `CONNECTION_UNHEALTHY` | Connector failed test | Re-test or reconfigure in the Connections tab |
| `PROTECTED_TARGET` | Protected object | Role-assignable groups and admin accounts are protected |
| `PHASE_BOUNDARY` | Not available in this phase | Operation is deferred to a future phase |
