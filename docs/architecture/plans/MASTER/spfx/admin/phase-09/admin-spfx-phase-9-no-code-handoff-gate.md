# Phase 9 No-Code Handoff Gate

## Purpose

Define, in architecture terms, what the Phase 9 **no-code IT handoff and setup** requirement means and how the exit prompt must enforce it.

This is the architecture-level gate document. The companion checklist (`admin-spfx-phase-9-no-code-handoff-gate-checklist.md`) provides the item-by-item audit against current repo state.

---

## What "developer hands off the `.sppkg` and walks away" means

After Phase 9 is complete and the final `.sppkg` package is delivered:

1. **The developer deploys** the Azure Function App and the SPFx package to the tenant.
2. **The developer walks away.** From this point forward, the developer is not needed for setup, configuration, or normal operation.
3. **IT installs** the SPFx app through the SharePoint admin center (standard app catalog approval).
4. **IT configures** hybrid identity connections through the admin app UI:
   - Enters AD DS connector details (endpoint, credentials, base DN)
   - Confirms Graph identity permissions after granting consent in Entra admin portal
   - Tests all connections through the UI
   - Verifies connection health
5. **IT completes external prerequisites** through standard Microsoft admin pages:
   - Grants Graph API consent in Entra admin portal
   - Approves any required tenant-level permissions
6. **The feature becomes operational** — IT can administer hybrid identity through the admin app.

At no point in steps 2–6 does IT need to:
- Edit source code
- Edit `.env` files
- Edit backend configuration files
- Edit manifests
- Edit deployment templates
- Edit package files
- Open the repository
- Contact the developer for "one quick setting change"

---

## What setup must be possible through the app UI

| Setup action | UI surface | Backend support |
|-------------|-----------|-----------------|
| Configure AD DS connector | Connection management page | Connection registry API + Table Storage |
| Enter AD DS service account credentials | Connection management page (password field) | Secure backend storage, never returned in API responses |
| Test AD DS connection | Connection management page (test button) | Backend LDAP bind test with stored credentials |
| View AD DS connection health | Connection management page (status display) | Health metadata in connection registry |
| Rotate AD DS credentials | Connection management page (update password) | Validate-then-replace flow in backend |
| Confirm Graph identity permissions | Connection management page (confirmation toggle) | Migrated from env-var gate to connection registry |
| Test Graph identity connection | Connection management page (test button) | Backend Graph API test call |
| View Graph connection health | Connection management page (status display) | Health metadata in connection registry |

---

## What setup may occur in standard Microsoft admin pages

These are **acceptable external admin-page steps** because the product cannot legally or safely replace them:

| External step | Admin page | Why acceptable |
|--------------|-----------|----------------|
| Graph API consent (application permissions) | Entra admin portal → Enterprise Applications → API Permissions → Grant admin consent | Microsoft requires tenant-admin consent for application permissions — the app cannot self-consent |
| SharePoint app catalog approval | SharePoint admin center → App Catalog → Deploy | Microsoft requires admin approval for SPFx solutions — the app cannot self-approve |
| Tenant-level permission grants | Microsoft 365 admin center or Entra admin portal | Some permissions require global or tenant admin action |
| Entra app registration (if needed) | Entra admin portal → App Registrations | App registration is a platform prerequisite, not an app-level setting |

**Key distinction:** These steps happen in Microsoft-owned admin pages, not in the repository or in developer tools. IT is accustomed to performing these actions as part of normal app deployment in Microsoft 365.

---

## What setup may remain an external infrastructure prerequisite

These are **acceptable external infrastructure prerequisites** because the app cannot create infrastructure:

| Prerequisite | Responsible team | Why acceptable |
|-------------|-----------------|----------------|
| AD DS domain controllers must be operational | IT / infrastructure | The app connects to AD DS — it cannot create AD DS |
| Network path from Azure Function to AD DS | IT / network | VPN, ExpressRoute, or hybrid connectivity is infrastructure — the app cannot establish it |
| AD DS service account with appropriate permissions | IT / identity | The app uses a service account — it cannot provision one |
| DNS resolution for AD DS endpoints from Azure | IT / network | DNS configuration is infrastructure |

**Key distinction:** These prerequisites exist before the app is installed. They are documented explicitly so IT can verify them before attempting to configure connections.

---

## What setup is forbidden

Any post-deployment setup that requires **code interaction** is a Phase 9 failure:

| Forbidden action | Why forbidden |
|-----------------|---------------|
| "Set `GRAPH_GROUP_PERMISSION_CONFIRMED=true` in App Settings" | Requires Azure portal deployment config edit — must be replaced by UI-managed connection registry state |
| "Edit `.env` to add AD DS connection string" | Requires source code or deployment config edit |
| "Add this value to `local.settings.json`" | Requires source code edit |
| "Update the backend config file with the AD DS endpoint" | Requires backend file edit |
| "Open the repo and set one value" | Requires repository access |
| "Edit the manifest to add a new permission" | Requires manifest edit and redeployment |
| "Run this script to configure the connection" | Requires developer tooling |
| "SSH into the Function App and update a setting" | Requires infrastructure access beyond normal admin |

**If any of these remain after Phase 9 implementation, the phase has not met its exit criteria.**

---

## How the exit prompt must enforce the gate

Prompt-11 (Validation, Reconciliation, and Phase 9 Exit) must:

### 1. Verify UI-managed setup completeness

For each connection class (AD DS, Graph):
- Confirm a connection management page exists in the admin UI
- Confirm the backend API supports CRUD + test for the connection
- Confirm the connection registry persists the configuration in Table Storage
- Confirm credentials are stored securely and never returned in API responses
- Confirm connection health metadata is tracked and displayed

### 2. Verify no-code setup path

Walk through the complete IT setup flow:
1. Install SPFx app (standard SharePoint admin action)
2. Navigate to connection management
3. Configure AD DS connector through UI
4. Test AD DS connection through UI
5. Confirm Graph permissions through UI
6. Test Graph connection through UI
7. Execute a hybrid identity action through UI

If any step requires code, config file, or deployment template edits → **fail the phase**.

### 3. Verify env-var gate migration

Confirm that `GRAPH_GROUP_PERMISSION_CONFIRMED` is no longer required as an environment variable for hybrid identity operations. The connection registry must be the sole authority for Graph permission confirmation status.

### 4. Verify preflight integration

Confirm that identity action preflight checks:
- Verify connection existence and health before execution
- Produce clear, actionable error messages pointing to the UI (not to config files)
- Block execution when connections are unhealthy or unconfigured

### 5. Document remaining external steps

The exit reconciliation must list:
- All acceptable external admin-page steps (with clear instructions)
- All acceptable external infrastructure prerequisites
- Confirmation that no code-interaction steps remain

---

## Architecture invariants enforced by this gate

| Invariant | Enforcement |
|-----------|-------------|
| SPFx is not a secret store | Backend never returns credentials in API responses; SPFx never caches credentials |
| Backend owns secure secret custody and resolution | Connection registry stores credentials; resolves them only at execution time in backend memory |
| Manual backend configuration by IT outside governed UI/admin flows is a phase failure | Unless explicitly classified as a non-Phase-9 infrastructure prerequisite |
| Connection configuration is governed and auditable | All connection CRUD operations produce audit records with actor, action, and timestamp |
| Permission-scoped access | Connection management requires appropriate admin permission via `@hbc/auth` |

---

## Cross-references

| Document | Purpose |
|----------|---------|
| `admin-spfx-phase-9-no-code-handoff-gate-checklist.md` | Item-by-item blocker audit (Prompt-01) |
| `admin-spfx-phase-9-connection-management-baseline.md` | Connection management architecture |
| `admin-spfx-phase-9-hybrid-identity-architecture-baseline.md` | Overall architecture baseline |
| `Admin-SPFx-IT-Control-Center-Phase-9-Summary-Plan.md` | Phase 9 summary with acceptance criteria |
| `Prompt-11-Validation-Reconciliation-and-Phase-9-Exit.md` | Exit prompt that enforces this gate |
