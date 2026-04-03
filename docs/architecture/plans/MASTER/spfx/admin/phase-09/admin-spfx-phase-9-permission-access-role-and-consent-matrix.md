# Phase 9 Permission, Access, Role, and Consent Matrix

## Purpose

Map every implement-now action to its required Graph permissions, on-prem executor requirements, Entra role implications, and consent prerequisites. This matrix prevents over-permissioning and documents IT approval prerequisites explicitly.

---

## Graph permission mapping (application permissions via Managed Identity)

The backend uses a user-assigned Managed Identity (`DefaultAzureCredential` with `AZURE_CLIENT_ID`) per ADR-0078. All Graph permissions are **application permissions** (not delegated), requiring **admin consent**.

### Required Graph permissions for Phase 9

| Permission | Scope | Actions served | Justification |
|-----------|-------|---------------|---------------|
| `User.Read.All` | Application | U-01, U-02, S-01, S-04 | Read user profiles, sync status, search |
| `User.ReadWrite.All` | Application | U-04, U-06, U-08, U-10, U-12 | Cloud-only user lifecycle (create, update, disable, enable, delete) |
| `Group.Read.All` | Application | G-01, G-02, S-02 | Read group properties, sync status, search |
| `Group.ReadWrite.All` | Application | G-04, G-05, G-08 | Cloud-only group lifecycle (create, update, delete) |
| `GroupMember.Read.All` | Application | G-03 | Read group membership |
| `GroupMember.ReadWrite.All` | Application | G-06, G-07, A-01, A-02 | Cloud-only group membership (add, remove) |
| `Organization.Read.All` | Application | S-03 | Read organization sync metadata |

### Existing permissions (already required by provisioning)

These permissions are already required for provisioning-era operations in `graph-service.ts`:

| Permission | Current use | Phase 9 additional use |
|-----------|-------------|----------------------|
| `Group.ReadWrite.All` | `createSecurityGroup`, `deleteSecurityGroup` | G-04, G-05, G-08 (same permission) |
| `GroupMember.ReadWrite.All` | `addGroupMembers` | G-06, G-07, A-01, A-02 (same permission) |
| `Sites.Selected` | `grantSiteAccess` | Not used by Phase 9 identity actions |

### New permissions Phase 9 requires

| Permission | Why new | Actions |
|-----------|---------|---------|
| `User.Read.All` | Provisioning never needed user read | U-01, U-02, S-01, S-04 |
| `User.ReadWrite.All` | Provisioning never managed users | U-04, U-06, U-08, U-10, U-12 |
| `Organization.Read.All` | Provisioning never checked org sync time | S-03 |

### Permissions the phase should avoid

| Permission | Why avoided |
|-----------|------------|
| `Directory.ReadWrite.All` | Overly broad — grants write to nearly all directory objects. Use specific resource permissions instead. |
| `RoleManagement.ReadWrite.Directory` | Required only for D-01, D-02 which are deferred. Do not request until needed. |
| `UserAuthenticationMethod.ReadWrite.All` | Required only for U-15 (cloud password reset) which is deferred. |
| `Policy.ReadWrite.ConditionalAccess` | D-03 is out of scope. Never request. |
| `Directory.Read.All` | Redundant — the specific `User.Read.All` + `Group.Read.All` + `Organization.Read.All` are narrower and sufficient. |

---

## On-prem executor requirement mapping

### AD DS service account permissions

The AD DS connector uses a dedicated service account whose credentials are stored in the connection registry. The service account requires:

| AD DS permission | Actions served | Scope recommendation |
|-----------------|---------------|---------------------|
| Create user objects | U-03 | Delegated to specific target OU(s) — not domain-wide |
| Modify user attributes | U-05, U-07, U-09 | Delegated to specific target OU(s) |
| Delete user objects | U-11 | Delegated to specific target OU(s) — highest privilege in scope |
| Create group objects | G-11 | Delegated to specific target OU(s) |
| Modify group membership | G-09, G-10 | Delegated to target group OUs or specific groups |
| Delete group objects | G-12 | Delegated to specific target OU(s) |

### Service account principle: least-privilege delegation

The AD DS service account should **not** be a Domain Admin. It should use delegated permissions scoped to specific OUs where the hybrid identity feature operates.

**Recommended approach:**
1. Create a dedicated service account (e.g., `svc-hb-intel-identity`).
2. Delegate permissions only to the OUs where users and groups are managed.
3. Do not grant domain-wide or forest-wide permissions.
4. Document the required delegation in the operator runbook.

### Service account as external infrastructure prerequisite

The AD DS service account with appropriate delegated permissions is an **acceptable external infrastructure prerequisite** per the no-code handoff gate. IT provisions it before configuring the AD DS connector in the admin app. The app documents what permissions are needed but cannot provision the account itself.

---

## Delegated vs app-only implications

The repo's backend architecture (ADR-0078) uses **app-only** authentication via Managed Identity for all Graph calls. This means:

| Aspect | Implication |
|--------|------------|
| Authentication | `DefaultAzureCredential` with user-assigned Managed Identity — no user token flow |
| Permission type | Application permissions only — delegated permissions are not used |
| Consent | Requires admin consent (tenant-level) — not per-user consent |
| User context | The `actor` field in audit records comes from the Bearer token of the IT admin who triggered the action via SPFx, not from Graph auth context |
| Scope | Application permissions apply tenant-wide — cannot be scoped to specific users/groups by Graph itself |

**Implication for Phase 9:** Since application permissions are tenant-wide, the admin app enforces scope through:
1. **UI-level permission gating** (`PermissionGate` in SPFx),
2. **Backend-level permission validation** (Bearer token → actor role check),
3. **AD DS OU-scoped delegation** (service account limited to specific OUs),
4. **Action-level authorization** (the backend validates the operator's permission to perform the specific action on the specific target).

---

## Entra role requirements

| Entra role | When relevant | Phase 9 implication |
|-----------|--------------|-------------------|
| Global Administrator | Required to grant admin consent for application permissions | **External admin-page step** — IT admin grants consent in Entra portal |
| Application Administrator | Can manage app registrations and grant consent | Alternative to Global Admin for consent |
| Privileged Role Administrator | Required for D-01, D-02 (role-assignable groups, directory roles) | **Deferred** — not needed in Phase 9 |
| User Administrator | Grants user management permissions in Entra | Not directly used — the app uses application permissions via Managed Identity, not role-based |
| Groups Administrator | Grants group management permissions in Entra | Not directly used — same reason |

**Key point:** The Managed Identity approach means Entra directory roles are not used for runtime authorization. The Managed Identity is granted application permissions, and the admin app enforces authorization through its own permission model.

---

## IT approval prerequisites

### Must be documented as external admin-page steps

| Prerequisite | Where IT completes it | When required |
|-------------|----------------------|--------------|
| Grant admin consent for `User.Read.All` | Entra admin portal → Enterprise Applications → API Permissions | Before user search/read actions work |
| Grant admin consent for `User.ReadWrite.All` | Entra admin portal → Enterprise Applications → API Permissions | Before cloud-only user lifecycle actions work |
| Grant admin consent for `Group.Read.All` | Entra admin portal → Enterprise Applications → API Permissions | Before group search/read actions work (may already be consented from provisioning) |
| Grant admin consent for `Group.ReadWrite.All` | Entra admin portal → Enterprise Applications → API Permissions | Before cloud-only group lifecycle actions work (may already be consented from provisioning) |
| Grant admin consent for `GroupMember.ReadWrite.All` | Entra admin portal → Enterprise Applications → API Permissions | Before membership operations work (may already be consented from provisioning) |
| Grant admin consent for `Organization.Read.All` | Entra admin portal → Enterprise Applications → API Permissions | Before org sync time check works |

### Must be documented as external infrastructure prerequisites

| Prerequisite | Who provisions it |
|-------------|------------------|
| AD DS service account with delegated OU permissions | IT / identity team |
| Network connectivity from Azure Function to AD DS (LDAPS) | IT / network team |
| AD DS domain controllers accessible and healthy | IT / infrastructure team |

### Must be UI-configurable (not code-bound)

| Item | UI surface |
|------|-----------|
| AD DS connector endpoint and credentials | Connection management page |
| AD DS base DN and target OU | Connection management page |
| Graph permission confirmation status | Connection management page |

---

## Connector settings that must be operator-configurable through the UI

| Setting | Connector class | Why UI-required |
|---------|----------------|-----------------|
| AD DS server endpoint | AD DS connector | No-code handoff gate — IT sets during initial setup |
| AD DS port | AD DS connector | May vary by environment |
| AD DS base DN | AD DS connector | Environment-specific |
| AD DS service account UPN/DN | AD DS connector | IT-provisioned account |
| AD DS service account password | AD DS connector | Rotatable by IT |
| AD DS authentication method | AD DS connector | Environment-specific |
| AD DS use LDAPS toggle | AD DS connector | Security configuration |
| Graph permission confirmed | Graph identity | Replaces `GRAPH_GROUP_PERMISSION_CONFIRMED` env var |

---

## Cross-references

| Document | Purpose |
|----------|---------|
| `admin-spfx-phase-9-identity-action-catalog.md` | Action catalog with permission columns |
| `admin-spfx-phase-9-connection-dependency-matrix.md` | Connector requirements per action |
| `admin-spfx-phase-9-connection-management-baseline.md` | Connection management architecture |
| `admin-spfx-phase-9-no-code-handoff-gate.md` | No-code handoff gate requirements |
