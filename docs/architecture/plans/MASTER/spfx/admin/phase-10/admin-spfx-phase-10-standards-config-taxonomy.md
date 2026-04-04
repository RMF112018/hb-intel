# Phase 10 — Standards and Configuration Taxonomy

**Phase:** 10 — Live Admin-Maintained Standards and Configuration Governance  
**Prompt:** 03 (Taxonomy)  
**Date:** 2026-04-03  
**Status:** Frozen — governs catalog model, backend services, API surfaces, and admin UI  
**Inputs:** P10-02 hybrid config baseline, P10-01 repo-truth audit, wave-0 registry and reference docs

---

## 1. Purpose

This taxonomy defines the domain structure for all governed configuration items in Phase 10. Every config item maps to exactly one domain and subdomain. The taxonomy determines how the admin UI organizes its standards/config lane, how the API groups its endpoints, and how audit records classify changes.

---

## 2. Taxonomy design principles

- **Domains** reflect operational concern areas, not implementation layers.
- **Subdomains** provide one level of refinement within a domain.
- Every existing wave-0 config entry must map to a domain/subdomain.
- No "miscellaneous" or "other" categories. If an item doesn't fit, the taxonomy is incomplete.
- Future expansion domains are marked explicitly and are not active scope for Phase 10 implementation.
- A domain being present does not mean all items in it are live-editable. The baseline (P10-02 §6) controls editability.

---

## 3. Domain registry

| Domain ID | Domain Name | Description | Phase 10 Active |
|-----------|-------------|-------------|-----------------|
| `rollout` | Rollout and Provisioning | Settings governing site provisioning, saga execution, and deployment behavior | Yes |
| `sharepoint` | SharePoint Standards | Standards and posture rules for SharePoint site structure, naming, hub association, and app catalog behavior | Yes |
| `identity` | Identity and Entra | Entra ID / Azure AD tenant, authentication, permission model, and identity-related governance | Yes |
| `access-control` | Access Control and Roles | Role assignments, admin/controller/owner UPN lists, and department-scoped access | Yes |
| `notification` | Notification and Communication | Email delivery, notification routing, and operator communication settings | Yes |
| `infrastructure` | Infrastructure and Platform | Connection strings, endpoints, runtime platform settings, adapter mode, and telemetry | Yes |
| `app-binding` | App Binding and Backend Setup | Target app binding configuration, backend URL, API audience, and backend mode (Phase 6A slice) | Yes |
| `hybrid-identity` | Hybrid Identity Connectors | Connector configuration, AD DS bridge settings, and hybrid-identity governance (Phase 9 slice) | Yes |
| `device-package` | Device Package Standards | Package contract, deployment standards, and device-package posture rules (Phase 9B slice) | Yes |
| `validation-policy` | Validation Policy | Environment-readiness checks, startup validation policy, and prerequisite gating rules | Yes |
| `admin-presentation` | Admin Presentation | Admin UI-only display preferences (if any are allowed by the baseline) | Future — not active in Phase 10 |
| `tenant-governance` | Tenant-Wide Governance | Broad tenant-level SharePoint governance, compliance posture, and cross-site policy | Future — Phase 8+ scope |

---

## 4. Subdomain breakdown

### 4.1 `rollout` — Rollout and Provisioning

| Subdomain ID | Subdomain Name | Description |
|-------------|----------------|-------------|
| `rollout.saga` | Saga Execution | Timeouts, retry policy, and execution behavior for the provisioning saga |
| `rollout.gates` | Provisioning Gates | Permission confirmation flags and prerequisite gates for saga execution |
| `rollout.spfx-install` | SPFx Installation | SPFx app package identity and app catalog targeting for Step 5 |

### 4.2 `sharepoint` — SharePoint Standards

| Subdomain ID | Subdomain Name | Description |
|-------------|----------------|-------------|
| `sharepoint.tenant` | Tenant Topology | Tenant URL, projects site URL, and hub site association |
| `sharepoint.app-catalog` | App Catalog | App catalog URL and deployment targeting |
| `sharepoint.posture` | Posture Rules | Site structure standards, naming conventions, and compliance expectations (Phase 10 first-wave) |

### 4.3 `identity` — Identity and Entra

| Subdomain ID | Subdomain Name | Description |
|-------------|----------------|-------------|
| `identity.tenant` | Tenant Identity | Azure tenant ID and client registration |
| `identity.auth` | Authentication | API audience, token validation, and managed identity settings |
| `identity.permissions` | Permission Model | Sites.Selected vs. FullControl model and associated gating |

### 4.4 `access-control` — Access Control and Roles

| Subdomain ID | Subdomain Name | Description |
|-------------|----------------|-------------|
| `access-control.admin-roles` | Admin Role Assignments | Admin, controller, and OpEx manager UPN assignments |
| `access-control.structural-owners` | Structural Owners | Structural owner UPN assignments |
| `access-control.dept-access` | Department Access | Department-scoped background access grants |

### 4.5 `notification` — Notification and Communication

| Subdomain ID | Subdomain Name | Description |
|-------------|----------------|-------------|
| `notification.email` | Email Delivery | Email sender address, delivery API endpoint, and API key |
| `notification.routing` | Notification Routing | Notification API base URL and dispatch configuration |

### 4.6 `infrastructure` — Infrastructure and Platform

| Subdomain ID | Subdomain Name | Description |
|-------------|----------------|-------------|
| `infrastructure.storage` | Storage | Table storage endpoint, storage connection strings |
| `infrastructure.realtime` | Real-Time | SignalR connection and real-time push configuration |
| `infrastructure.telemetry` | Telemetry | Application Insights connection |
| `infrastructure.runtime` | Runtime Platform | Functions worker runtime, Node version, adapter mode |

### 4.7 `app-binding` — App Binding and Backend Setup

| Subdomain ID | Subdomain Name | Description |
|-------------|----------------|-------------|
| `app-binding.target` | Target App Identity | Function app URL, API audience, backend mode for target SPFx apps |
| `app-binding.publication` | Publication State | Binding publication status, active/inactive/superseded lifecycle |

### 4.8 `hybrid-identity` — Hybrid Identity Connectors

| Subdomain ID | Subdomain Name | Description |
|-------------|----------------|-------------|
| `hybrid-identity.connector` | Connector Setup | Connector configuration, AD DS bridge settings, connection topology |
| `hybrid-identity.verification` | Verification | Connection verification rules and health-check standards |

### 4.9 `device-package` — Device Package Standards

| Subdomain ID | Subdomain Name | Description |
|-------------|----------------|-------------|
| `device-package.contract` | Package Contract | Package metadata, version requirements, and deployment standards |
| `device-package.posture` | Posture Rules | Package-specific compliance and configuration posture |

### 4.10 `validation-policy` — Validation Policy

| Subdomain ID | Subdomain Name | Description |
|-------------|----------------|-------------|
| `validation-policy.startup` | Startup Validation | Core/SharePoint/provisioning tier validation behavior |
| `validation-policy.prerequisites` | Prerequisite Gates | Provisioning prerequisite enforcement rules |
| `validation-policy.readiness` | Environment Readiness | Connected-services readiness checks and environment health |

---

## 5. Wave-0 config entry → domain/subdomain mapping

This mapping classifies every existing wave-0 config entry into the taxonomy.

### 5.1 WAVE0_REQUIRED_CONFIG entries

| Config Entry | Bucket | Domain | Subdomain |
|-------------|--------|--------|-----------|
| `AZURE_TENANT_ID` | infrastructure | `identity` | `identity.tenant` |
| `AZURE_CLIENT_ID` | infrastructure | `identity` | `identity.tenant` |
| `AZURE_TABLE_ENDPOINT` | infrastructure | `infrastructure` | `infrastructure.storage` |
| `AzureSignalRConnectionString` | infrastructure | `infrastructure` | `infrastructure.realtime` |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | infrastructure | `infrastructure` | `infrastructure.telemetry` |
| `SHAREPOINT_TENANT_URL` | infrastructure | `sharepoint` | `sharepoint.tenant` |
| `SHAREPOINT_PROJECTS_SITE_URL` | infrastructure | `sharepoint` | `sharepoint.tenant` |
| `SHAREPOINT_HUB_SITE_ID` | infrastructure | `sharepoint` | `sharepoint.tenant` |
| `EMAIL_DELIVERY_API_KEY` | infrastructure | `notification` | `notification.email` |
| `SHAREPOINT_APP_CATALOG_URL` | infrastructure | `sharepoint` | `sharepoint.app-catalog` |
| `HBC_ADAPTER_MODE` | infrastructure | `infrastructure` | `infrastructure.runtime` |
| `HB_INTEL_SPFX_APP_ID` | infrastructure | `rollout` | `rollout.spfx-install` |
| `NOTIFICATION_API_BASE_URL` | infrastructure | `notification` | `notification.routing` |
| `EMAIL_FROM_ADDRESS` | infrastructure | `notification` | `notification.email` |
| `GRAPH_GROUP_PERMISSION_CONFIRMED` | infrastructure | `rollout` | `rollout.gates` |
| `OPEX_MANAGER_UPN` | business | `access-control` | `access-control.admin-roles` |
| `CONTROLLER_UPNS` | business | `access-control` | `access-control.admin-roles` |
| `ADMIN_UPNS` | business | `access-control` | `access-control.admin-roles` |
| `DEPT_BACKGROUND_ACCESS_COMMERCIAL` | business | `access-control` | `access-control.dept-access` |
| `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` | business | `access-control` | `access-control.dept-access` |
| `API_AUDIENCE` | infrastructure | `identity` | `identity.auth` |

### 5.2 WAVE0_OPTIONAL_CONFIG entries

| Config Entry | Bucket | Domain | Subdomain |
|-------------|--------|--------|-----------|
| `AzureWebJobsStorage` | infrastructure | `infrastructure` | `infrastructure.storage` |
| `FUNCTIONS_WORKER_RUNTIME` | infrastructure | `infrastructure` | `infrastructure.runtime` |
| `WEBSITE_NODE_DEFAULT_VERSION` | infrastructure | `infrastructure` | `infrastructure.runtime` |
| `PROVISIONING_STEP5_TIMEOUT_MS` | infrastructure | `rollout` | `rollout.saga` |
| `STRUCTURAL_OWNER_UPNS` | business | `access-control` | `access-control.structural-owners` |
| `SITES_PERMISSION_MODEL` | infrastructure | `identity` | `identity.permissions` |
| `SITES_SELECTED_GRANT_CONFIRMED` | infrastructure | `rollout` | `rollout.gates` |

---

## 6. Editability classification by domain

Based on P10-02 baseline §4 and §6, each domain's editability posture:

| Domain | Editability Posture | Rationale |
|--------|-------------------|-----------|
| `rollout` | Mixed — `rollout.saga` timeouts may be live-editable; `rollout.gates` are infrastructure-controlled | Timeout tuning is operational; permission gates are IT/Security decisions |
| `sharepoint` | Mixed — future posture rules may be live-editable; tenant topology is infrastructure-controlled | Topology is deployment-coupled; posture rules are business standards |
| `identity` | Not live-editable | Tenant/auth settings are infrastructure-controlled; changing live would break runtime |
| `access-control` | Live-editable (first-wave candidate) | Role assignments are business-controlled (Bucket B) and are the primary live-edit use case |
| `notification` | Mixed — sender address may be live-editable; API key is a secret | Business-controlled non-secret values vs. secret values |
| `infrastructure` | Not live-editable | All items are infrastructure-controlled or secrets |
| `app-binding` | Governed by Phase 6A model | Phase 6A already defines its own edit/publish lifecycle |
| `hybrid-identity` | Governed by Phase 9 model | Phase 9 already defines connector lifecycle |
| `device-package` | Governed by Phase 9B model | Phase 9B already defines package lifecycle |
| `validation-policy` | Not live-editable in Phase 10 | Validation policy changes require code-level review |
| `admin-presentation` | Future — not active | No items defined yet |
| `tenant-governance` | Future — not active | Phase 8+ scope |

---

## 7. First-wave live-editable candidates

Based on the editability analysis, these are the recommended first-wave items for live admin editing in Phase 10:

| Config Entry | Domain | Subdomain | Rationale |
|-------------|--------|-----------|-----------|
| `OPEX_MANAGER_UPN` | `access-control` | `access-control.admin-roles` | Business-controlled; personnel change doesn't require deployment |
| `CONTROLLER_UPNS` | `access-control` | `access-control.admin-roles` | Business-controlled; role assignment is operational |
| `ADMIN_UPNS` | `access-control` | `access-control.admin-roles` | Business-controlled; admin team changes are frequent |
| `STRUCTURAL_OWNER_UPNS` | `access-control` | `access-control.structural-owners` | Business-controlled; owner assignment is operational |
| `DEPT_BACKGROUND_ACCESS_COMMERCIAL` | `access-control` | `access-control.dept-access` | Business-controlled; department access grants are operational |
| `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` | `access-control` | `access-control.dept-access` | Business-controlled; department access grants are operational |
| `PROVISIONING_STEP5_TIMEOUT_MS` | `rollout` | `rollout.saga` | Operational tuning; low risk; has code default fallback |

Future candidates (not first-wave):
- `EMAIL_FROM_ADDRESS` — currently stub/unused; becomes candidate when email delivery is active
- `NOTIFICATION_API_BASE_URL` — has localhost fallback; becomes candidate when notification routing is active
- SharePoint posture rules — new items not yet defined; become candidates when posture rules are implemented

---

## 8. Recommended code catalog location

The canonical code catalog should live at:

```
backend/functions/src/config/catalog/
├── index.ts                    # barrel export
├── types.ts                    # IConfigCatalogEntry, ConfigDomain, ConfigSubdomain types
├── domains.ts                  # domain and subdomain registry constants
├── entries/                    # one file per domain
│   ├── rollout.ts
│   ├── sharepoint.ts
│   ├── identity.ts
│   ├── access-control.ts
│   ├── notification.ts
│   ├── infrastructure.ts
│   ├── app-binding.ts
│   ├── hybrid-identity.ts
│   ├── device-package.ts
│   └── validation-policy.ts
└── wave0-mapping.ts            # maps existing WAVE0_REQUIRED/OPTIONAL_CONFIG → catalog entries
```

This location is consistent with the existing `backend/functions/src/config/wave0-env-registry.ts` and keeps config concerns co-located. Implementation is deferred to Prompt-04.
