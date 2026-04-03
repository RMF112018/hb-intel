# Phase 9 No-Code Handoff Gate Checklist

## Purpose

Explicitly answer whether the current repository would let a developer hand off the `.sppkg` and walk away today for hybrid identity functionality.

This checklist classifies every setup and operation requirement against the Phase 9 hard gate:

> After the final `.sppkg` is delivered, IT must be able to install the app and complete required operational setup and ongoing maintenance **without editing source code, manifests, environment files, backend configuration files, deployment templates, or package files**.

---

## Answer: Can a developer hand off the `.sppkg` and walk away today?

**No.**

The current repository cannot support a no-code IT handoff for hybrid identity functionality. The following blockers must be resolved in Phase 9:

1. **No hybrid identity feature exists** — the `/entra` lane is a scaffold placeholder with no operational functionality.
2. **No UI-managed connection configuration** — all backend connections are configured via environment variables and deployment config that require developer intervention.
3. **No AD DS connection path** — zero on-prem identity connectivity exists in the codebase.
4. **Graph permission gating requires env-var edit** — `GRAPH_GROUP_PERMISSION_CONFIRMED=true` must be set in deployment configuration, not through the UI.
5. **No connection health/test capability** — IT has no way to verify connections work after deployment.
6. **No secure backend credential storage for UI-entered values** — no application-level mechanism stores connection credentials entered through the admin interface.

---

## Checklist

### What IT can configure entirely through the UI after deployment

| Capability | Current state | Compliant? |
|------------|---------------|------------|
| Admin access control (who can use the admin app) | `SystemSettingsPage.tsx` — working | Yes |
| Approval authority rules | `ApprovalRuleEditor` — working (not persisted in Wave 0) | Partial |
| View provisioning run status | `ProvisioningOversightPage.tsx` — working | Yes |
| Force retry / archive provisioning runs | Working with permission gates | Yes |
| View operational health dashboard | `OperationalDashboardPage.tsx` — working | Yes |
| **Configure AD DS connection** | **Does not exist** | **No** |
| **Configure Graph identity permissions** | **Requires env-var edit** | **No** |
| **Test backend connections** | **Does not exist** | **No** |
| **Rotate connection credentials** | **Does not exist** | **No** |
| **Manage hybrid identity operations** | **Does not exist** | **No** |

### What connection details / secrets / identifiers must be UI-manageable

| Item | Required? | Current state | Gap |
|------|-----------|---------------|-----|
| AD DS server endpoint and port | Yes | Does not exist | Must build connection registry + UI |
| AD DS base DN (search base) | Yes | Does not exist | Must build connection registry + UI |
| AD DS service account identity | Yes | Does not exist | Must build connection registry + UI |
| AD DS service account credential | Yes | Does not exist | Must build secure backend storage + UI |
| AD DS authentication method (password / certificate / Kerberos) | Yes | Does not exist | Must build connection model + UI |
| Graph permission confirmation | Yes | Env-var gate (`GRAPH_GROUP_PERMISSION_CONFIRMED`) | Must migrate to connection registry |
| Connection test results and health status | Yes | Does not exist | Must build health check service + UI |
| Last-verified timestamp per connection | Yes | Does not exist | Must build health metadata + UI |

### What secure backend storage / resolution path exists or is missing

| Storage concern | Current state | Gap |
|-----------------|---------------|-----|
| Table Storage for durable data | Working — `ProvisioningStatus`, `AdminRuns`, `AdminAudit`, `AdminEvidence` tables | Pattern exists, can be extended |
| Connection registry table | Does not exist | Must create `ConnectionRegistry` table or equivalent |
| Credential encryption at rest | Table Storage supports Azure encryption at rest for the storage account | Acceptable for non-secret metadata; secrets may need Key Vault |
| Key Vault integration for secrets | Not integrated | May be needed for AD DS credentials and certificate references |
| Secret resolution at execution time | Does not exist for UI-entered values | Must build resolver that loads credentials from secure store without frontend exposure |
| Credential rotation without downtime | Does not exist | Must build update + re-test flow |

### What external admin approvals are still required

| Approval | Where IT completes it | Classification |
|----------|----------------------|----------------|
| Graph API consent (application permissions) | Entra admin portal → Enterprise Applications → API Permissions | Acceptable external admin-page step |
| SharePoint app catalog approval | SharePoint admin center → App Catalog | Acceptable external admin-page step |
| Tenant-level permission grants | Microsoft 365 admin center or Entra admin portal | Acceptable external admin-page step |
| Entra app registration (if needed) | Entra admin portal → App Registrations | Acceptable external admin-page step |

### What external infrastructure prerequisites are still required

| Prerequisite | Who is responsible | Classification |
|--------------|-------------------|----------------|
| AD DS domain controllers must be operational | IT / infrastructure team | Acceptable external infrastructure prerequisite |
| Network path from Azure Function to AD DS must exist (VPN, ExpressRoute, or hybrid agent) | IT / network team | Acceptable external infrastructure prerequisite |
| AD DS service account with appropriate permissions must be provisioned | IT / identity team | Acceptable external infrastructure prerequisite |
| DNS resolution for AD DS endpoints from Azure | IT / network team | Acceptable external infrastructure prerequisite |

### What current repo realities would still force code interaction

| Reality | Blocker type | Classification |
|---------|-------------|----------------|
| `GRAPH_GROUP_PERMISSION_CONFIRMED=true` env-var gate | Backend config edit required | **Must fix in Phase 9** |
| No connection registry service | No path for UI-managed config | **Must fix in Phase 9** |
| No connection management API endpoints | No backend capability for UI to call | **Must fix in Phase 9** |
| No AD DS connector implementation | No on-prem execution path at all | **Must fix in Phase 9** |
| No connection management UI pages | No operator surface for connection setup | **Must fix in Phase 9** |
| No secure credential storage for UI-entered values | Credentials cannot be safely persisted | **Must fix in Phase 9** |
| No connection test capability | IT cannot verify connections work | **Must fix in Phase 9** |
| No connection health display | IT cannot see connection status | **Must fix in Phase 9** |
| `local.settings.json` required for local dev Graph/SharePoint | Dev-time only; does not affect deployed IT experience | **Not a blocker** — gitignored, developer-only |
| Managed Identity env vars (`AZURE_CLIENT_ID`) | Platform infrastructure, set at deployment | **Not a blocker** — acceptable deployment-time config |

---

## Blocker summary by classification

### Must fix in Phase 9 (8 blockers)

1. Migrate Graph permission gate from env-var to UI-managed connection registry
2. Build connection registry service with Table Storage persistence
3. Build connection management API endpoints
4. Build AD DS connector interface and implementation
5. Build secure backend credential storage and resolution
6. Build connection test/health check capability
7. Build connection management UI pages in admin app
8. Build connection health/status display in admin app

### Acceptable external admin-page steps (4 items)

1. Graph API consent in Entra admin portal
2. SharePoint app catalog approval
3. Tenant-level permission grants
4. Entra app registration configuration

### Acceptable external infrastructure prerequisites (4 items)

1. AD DS domain controllers operational
2. Network path from Azure to AD DS
3. AD DS service account provisioned
4. DNS resolution for AD DS endpoints

### Later-phase improvements (2 items)

1. Azure Key Vault integration for enhanced secret management — Phase 9 can use encrypted Table Storage as minimum viable; Key Vault is a hardening improvement
2. Automated credential expiry alerting — Phase 9 delivers manual rotation through UI; automated expiry monitoring is a refinement

---

## Preflight check recommendations for Phase 9

When Phase 9 is complete, the admin app preflight system (already established in `SetupWizardPage.tsx` calling `POST /api/admin/preflight`) should include these hybrid identity checks:

| Check | Category | What it validates |
|-------|----------|-------------------|
| AD DS connection configured | `hybrid-identity` | Connection registry has an AD DS connector entry |
| AD DS connection healthy | `hybrid-identity` | Last connection test succeeded within acceptable window |
| AD DS service account valid | `hybrid-identity` | Credential can authenticate to AD DS |
| Graph identity permissions confirmed | `graph-entra` | Connection registry confirms Graph permission gate |
| Graph API consent granted | `graph-entra` | Graph calls succeed with current Managed Identity permissions |
| Network path to AD DS | `hybrid-identity` | Backend can reach AD DS endpoint |

These checks should produce clear, actionable error messages that direct IT to the connection management UI or the appropriate Microsoft admin portal — never to code or config files.

---

## Validation

- All referenced file paths verified to exist in the repository.
- All blocker classifications based on verified repo state, not speculation.
- The current repo would **not** pass the no-code handoff gate for hybrid identity functionality.
- The 8 must-fix blockers map directly to the Phase 9 implementation prompts (02–11).
