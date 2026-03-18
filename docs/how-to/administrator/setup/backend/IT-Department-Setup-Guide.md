# IT Department Setup Guide — Phase 1 Data Plane

**Doc Classification:** How-To / Administrator Guide — operational setup instructions for the HB Intel Phase 1 production data plane.

---

## 1. Purpose and Audience

This guide tells your IT team exactly what infrastructure, identity, Microsoft 365, and monitoring resources must be created and configured so the HB Intel Phase 1 data plane can be stood up correctly.

**Who should use this guide:**
- IT administrators and technicians comfortable with Microsoft 365, Azure portal administration, and Microsoft Entra ID (formerly Azure Active Directory)
- SharePoint administrators responsible for site creation, permissions, and content type management
- Platform or DevOps engineers responsible for Azure resource provisioning

**Who should NOT use this guide:**
- Application developers looking for code walkthroughs or local development setup
- Frontend engineers looking for UI or browser configuration
- Test engineers looking for test authoring instructions

---

## 2. What This Guide Covers and Does Not Cover

### Covers

- Azure subscription, resource group, and resource provisioning
- Azure Functions hosting and staging environment setup
- Azure Storage and Table Storage setup
- Azure Key Vault setup and secret management
- Application Insights and Log Analytics monitoring workspace setup
- Optional Redis cache layer setup
- Microsoft Entra ID app registrations and enterprise application configuration
- API permission and scope setup for the backend API
- Token audience and consent configuration
- SharePoint hub site, project site, and department site setup
- SharePoint content type publishing and list/library expectations
- SharePoint permission model and site-scoped app access
- Security group and role setup for financial and compliance boundaries
- Handoff values that IT must provide to the development team

### Does Not Cover

- Application code changes, builds, or deployments
- Frontend (PWA or SPFx) configuration or browser setup
- Local developer environment setup (IDE, Node.js, npm)
- Test authoring, test execution, or CI/CD pipeline configuration
- Feature implementation or business logic

---

## 3. Plain-Language Architecture Summary

The Phase 1 data plane is the layer that connects the HB Intel application to its data. Here is where the major pieces live:

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser (PWA)                     │
│           Authenticates via Microsoft Entra ID               │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS calls with auth token
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Azure Functions (Backend API)               │
│  • Validates auth tokens                                     │
│  • Routes requests to the right data source                  │
│  • Calls SharePoint and Microsoft Graph on behalf of users   │
│  • Writes provisioning status and audit records              │
│  • Sends real-time updates via SignalR                        │
└───┬──────────┬──────────┬──────────┬──────────┬─────────────┘
    │          │          │          │          │
    ▼          ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐
│SharePt │ │ Azure  │ │  Key   │ │  App   │ │   Redis    │
│ Sites  │ │ Table  │ │ Vault  │ │Insights│ │  (optional)│
│        │ │Storage │ │        │ │        │ │            │
│Lists,  │ │Prov.   │ │Secrets │ │Logs,   │ │Cached GET  │
│Libraries│ │status, │ │& creds │ │metrics,│ │responses   │
│& docs  │ │audit,  │ │        │ │alerts  │ │            │
│        │ │idempot.│ │        │ │        │ │            │
└────────┘ └────────┘ └────────┘ └────────┘ └────────────┘
```

**In plain terms:**

- **Azure Functions** is the backend server. It receives requests from the web application, checks who is asking, fetches or saves data, and sends back responses. It runs on Microsoft's serverless compute platform — you do not manage a virtual machine.
- **SharePoint** stores most business data in lists and document libraries. There is one hub site for shared reference data, one site per project for project-specific data, and department-level sites for leads and team rosters.
- **Azure Table Storage** stores operational records that do not belong in SharePoint — provisioning status tracking, audit logs, and idempotency (duplicate-prevention) records.
- **Azure Key Vault** securely stores connection strings and secrets so they are not embedded in application configuration.
- **Application Insights** collects logs, metrics, and telemetry from the backend so the team can monitor health and diagnose problems.
- **Azure SignalR Service** pushes real-time status updates to the browser (for example, during project provisioning).
- **Redis** (optional) caches frequently-read data to reduce load on SharePoint. This is recommended but not mandatory for initial setup.
- **Microsoft Entra ID** (formerly Azure AD) handles all authentication and authorization — app registrations, token validation, security groups, and permissions.

---

## 4. Setup-at-a-Glance Checklist

Use this as a high-level summary. Detailed instructions for each item follow in later sections.

- [ ] **Azure resource group** created for the target environment
- [ ] **Azure Functions app** provisioned (v4, Node.js ~20)
- [ ] **System-assigned Managed Identity** enabled on the Function App (staging and production)
- [ ] **Azure Storage Account** created and connection string recorded
- [ ] **Azure Table Storage tables** created (provisioning status, audit, idempotency records)
- [ ] **Azure Key Vault** created; Managed Identity granted Get and List access
- [ ] **Secrets stored in Key Vault** (storage connection string, SignalR connection string, Application Insights connection string, email API key)
- [ ] **Application Insights workspace** created and connection string recorded
- [ ] **Azure SignalR Service** created in serverless mode (staging and production each get their own)
- [ ] **Redis cache** created if the platform team confirms it is needed (Azure Managed Redis recommended)
- [ ] **Entra ID app registration** created for the backend API with `api://<CLIENT_ID>` audience
- [ ] **API scope exposed** and admin consent granted
- [ ] **Graph API permissions** granted: `Sites.Selected`, `Group.ReadWrite.All`
- [ ] **SharePoint hub site** created with shared reference lists
- [ ] **SharePoint Sales/BD site** created for leads and pipeline data
- [ ] **SharePoint shared/department site(s)** created for team roster data
- [ ] **Content types published** via Content Type Gallery where required
- [ ] **Site-scoped app access** granted to the Managed Identity for each required SharePoint site
- [ ] **Email delivery service** configured (SendGrid or equivalent) with verified sender domain
- [ ] **All handoff values** recorded and delivered to the development team (see Section 10)

---

## 5. Required Access Before Starting

You will need elevated permissions across several Microsoft platforms. Coordinate with your security team if you do not already hold these roles.

### Azure Portal Access

| Role | Why You Need It |
|---|---|
| **Contributor** on the target subscription or resource group | Create and configure Azure resources (Functions, Storage, Key Vault, SignalR, Application Insights) |
| **Key Vault Administrator** or **Key Vault Secrets Officer** | Store and manage secrets in Azure Key Vault |
| **Monitoring Contributor** | Create alert rules, action groups, and dashboards in Application Insights |

### Microsoft Entra ID Access

| Role | Why You Need It |
|---|---|
| **Application Administrator** (or **Cloud Application Administrator**) | Create and configure app registrations, expose APIs, configure permissions |
| **Privileged Role Administrator** (or **Global Administrator**) | Grant admin consent for Graph API application permissions (`Sites.Selected`, `Group.ReadWrite.All`) |

### SharePoint / Microsoft 365 Access

| Role | Why You Need It |
|---|---|
| **SharePoint Administrator** | Create hub sites, communication sites, and team sites; manage site collections |
| **Site Collection Administrator** on each HB Intel site | Configure lists, libraries, content types, and permissions at the site level |
| **Content Type Gallery access** (tenant-level) | Publish shared content types that must be available across multiple sites |

### Email Service Access

| Role | Why You Need It |
|---|---|
| **SendGrid account administrator** (or equivalent) | Create API keys, configure verified sender domains |

> **Note:** If your organization uses Privileged Identity Management (PIM), you may need to activate these roles before starting. Plan ahead — PIM activation can take up to 30 minutes depending on your approval workflow.

---

## 6. Environment Inventory Worksheet

Fill in this table as you complete setup. These values are the handoff to the development team.

### Azure Resources

| Item | Value | Notes |
|---|---|---|
| Azure Subscription ID | `________________________` | |
| Resource Group Name | `________________________` | One per environment (dev, staging, production) |
| Azure Region | `________________________` | |
| Function App Name | `________________________` | e.g., `func-hb-intel-staging` |
| Function App URL | `________________________` | e.g., `https://func-hb-intel-staging.azurewebsites.net` |
| Storage Account Name | `________________________` | For Functions host AND Table Storage |
| Storage Account Connection String | `________________________` | Store in Key Vault — do not share in plain text |
| Key Vault Name | `________________________` | e.g., `kv-hb-intel-staging` |
| Key Vault URI | `________________________` | e.g., `https://kv-hb-intel-staging.vault.azure.net` |
| Application Insights Name | `________________________` | |
| Application Insights Connection String | `________________________` | Store in Key Vault |
| Log Analytics Workspace Name | `________________________` | Linked to Application Insights |
| SignalR Service Name | `________________________` | |
| SignalR Connection String | `________________________` | Store in Key Vault |
| Redis Cache Name (if used) | `________________________` | Azure Managed Redis recommended |
| Redis Connection String (if used) | `________________________` | Store in Key Vault |

### Microsoft Entra ID

| Item | Value | Notes |
|---|---|---|
| Tenant ID | `________________________` | |
| Backend API App Registration Name | `________________________` | e.g., `hb-intel-api-staging` |
| Backend API Client ID (Application ID) | `________________________` | |
| Backend API Application ID URI | `________________________` | e.g., `api://func-hb-intel-staging` |
| API Scope Name | `________________________` | e.g., `api://func-hb-intel-staging/.default` |
| Managed Identity Object ID | `________________________` | System-assigned on the Function App |

### SharePoint

| Item | Value | Notes |
|---|---|---|
| SharePoint Tenant URL | `________________________` | e.g., `https://contoso.sharepoint.com` |
| Hub Site URL | `________________________` | e.g., `https://contoso.sharepoint.com/sites/hb-intel` |
| Hub Site ID (GUID) | `________________________` | Needed by the application for site association |
| Sales/BD Site URL | `________________________` | |
| Shared/Department Site URL(s) | `________________________` | |
| App Catalog URL (if SPFx used) | `________________________` | May be null if SPFx deployment is deferred |

### Email

| Item | Value | Notes |
|---|---|---|
| Email Service Provider | `________________________` | e.g., SendGrid |
| Email API Key | `________________________` | Store in Key Vault — do not share in plain text |
| Verified Sender Address | `________________________` | e.g., `hb-intel@yourcompany.com` |

---

## 7. Azure Setup Requirements

### 7.1 Resource Group and Environment Layout

**What needs to exist:** One Azure resource group per environment (typically: development, staging, production). All HB Intel resources for that environment live in the same resource group.

**Why:** Resource groups provide a boundary for billing, access control, and lifecycle management. Keeping environments separate prevents staging changes from affecting production.

**Who usually creates it:** IT or DevOps administrator with Contributor access on the subscription.

**How to create it:**
1. Azure portal > **Resource groups** > **Create**
2. Select the subscription
3. Enter a name following your organization's naming convention (e.g., `rg-hb-intel-staging`)
4. Select the Azure region closest to your users
5. Add tags if required by your organization's policy

**How to verify:** Azure portal > **Resource groups** > confirm the resource group appears and you have Contributor access.

**Common mistakes:**
- Creating all environments in the same resource group (makes cleanup and access control harder)
- Choosing a region far from your users (increases latency)

---

### 7.2 Azure Functions App

**What needs to exist:** An Azure Functions app running version 4 on the Node.js ~20 runtime. This is the backend server for HB Intel.

**Why:** Azure Functions hosts all the backend API endpoints that the web application calls. It validates authentication, routes data requests, and manages provisioning workflows.

**Who usually creates it:** IT or DevOps administrator.

**How to create it:**
1. Azure portal > **Function App** > **Create**
2. Select your resource group
3. Enter a name (e.g., `func-hb-intel-staging`)
4. **Runtime stack:** Node.js
5. **Version:** 20 LTS
6. **Operating system:** Windows or Linux (check with the development team for preference)
7. **Plan type:** Consumption or App Service Plan (check with architecture team)
8. Under **Monitoring**, link to your Application Insights instance (see Section 7.6)
9. Under **Identity**, enable **System assigned** managed identity (critical for staging and production)

**Required application settings** (set after creation):

| Setting | Value | Notes |
|---|---|---|
| `FUNCTIONS_WORKER_RUNTIME` | `node` | Do not change |
| `WEBSITE_NODE_DEFAULT_VERSION` | `~20` | Infrastructure sets this |
| `AzureWebJobsStorage` | Storage connection string or Key Vault reference | Required for Functions host operation |
| `AZURE_STORAGE_CONNECTION_STRING` | Storage connection string or Key Vault reference | For Table Storage (provisioning, audit, idempotency) |
| `AzureSignalRConnectionString` | SignalR connection string or Key Vault reference | For real-time updates |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Insights connection string or Key Vault reference | For monitoring and telemetry |
| `SHAREPOINT_TENANT_URL` | Your SharePoint tenant URL | e.g., `https://contoso.sharepoint.com` |
| `SHAREPOINT_HUB_SITE_ID` | Hub site GUID | Obtained after hub site creation |
| `EMAIL_DELIVERY_API_KEY` | Email service API key or Key Vault reference | For notification delivery |
| `EMAIL_FROM_ADDRESS` | Verified sender address | e.g., `hb-intel@yourcompany.com` |
| `HBC_ADAPTER_MODE` | `real` | Must be `real` in staging and production; `mock` only in local development |

**Key Vault reference format** (for production and staging):
Instead of storing a raw connection string, use this format in the application setting value:
```
@Microsoft.KeyVault(SecretUri=https://your-key-vault.vault.azure.net/secrets/SecretName/)
```
This tells the Function App to fetch the value from Key Vault at runtime using its Managed Identity.

**How to verify:**
1. Azure portal > **Function App** > your app > **Overview** — confirm status is "Running"
2. **Configuration** > **Application settings** — confirm all required settings are present
3. **Identity** > **System assigned** — confirm Status is "On" and the Object ID is recorded
4. Browse to `https://your-function-app.azurewebsites.net/api/health` — a response (even an error) confirms the app is reachable

**Common mistakes:**
- Forgetting to enable System assigned Managed Identity (required for Key Vault and SharePoint access)
- Using `mock` adapter mode in staging or production (this is a critical incident in production)
- Setting `AZURE_CLIENT_SECRET` in staging or production (this is for local development only — use Managed Identity instead)
- Using the same Function App for multiple environments

---

### 7.3 Azure Storage Account

**What needs to exist:** One Azure Storage Account per environment. This account serves two purposes:
1. **Functions host storage** — Azure Functions requires a storage account for its internal job management (queues, locks, timer state)
2. **Table Storage** — the application stores provisioning status, audit records, and idempotency (duplicate-prevention) records in tables within this same account

**Why:** The Functions host cannot start without a storage account. Table Storage provides a simple, cost-effective store for operational records that do not belong in SharePoint.

**Who usually creates it:** IT or DevOps administrator.

**How to create it:**
1. Azure portal > **Storage accounts** > **Create**
2. Select your resource group
3. Enter a name (e.g., `sthbintelstaging` — storage account names must be lowercase, no hyphens, 3–24 characters)
4. **Performance:** Standard
5. **Redundancy:** Choose based on your organization's requirements (LRS for dev/staging, GRS or ZRS for production)
6. Leave other settings at defaults unless your organization has specific policies

**How to verify:**
1. Azure portal > **Storage accounts** > your account > **Overview** — confirm status
2. **Access keys** — confirm you can view the connection string (you will store this in Key Vault)

**Common mistakes:**
- Using a storage account name with hyphens or uppercase (Azure rejects these)
- Sharing a storage account across environments (can cause cross-environment data leakage)
- Forgetting to record the connection string before moving on

---

### 7.4 Azure Table Storage

**What needs to exist:** Three tables within the storage account created in Section 7.3.

| Table Name | Purpose | One Per… |
|---|---|---|
| Provisioning status table | Tracks the state of each project provisioning workflow | Deployment |
| Audit log table | Append-only record of all data mutations (creates, updates, deletes) | Deployment |
| Idempotency records table | Prevents duplicate write operations (e.g., if a user accidentally submits twice) | Deployment |

> **Architecture decision pending:** The exact table names have not been frozen in the Phase 1 plan set. The development team will confirm the final names. Likely candidates based on current planning: a provisioning status table with partition key `{projectId}`, an audit table with partition key `audit-{domain}`, and an `IdempotencyRecords` table. **Do not finalize table names until the development team confirms.**

**How to create tables (once names are confirmed):**
1. Azure portal > **Storage accounts** > your account > **Tables** (under Data storage)
2. Click **+ Table** and enter the confirmed table name
3. Repeat for each table

**How to verify:**
- Azure portal > **Storage accounts** > your account > **Tables** — confirm all required tables appear
- Alternatively, use Azure Storage Explorer (desktop app) to browse the tables

**Common mistakes:**
- Creating tables with incorrect names (the application expects exact matches)
- Creating tables in the wrong storage account

---

### 7.5 Azure Key Vault

**What needs to exist:** One Azure Key Vault per environment, containing all secrets and connection strings that should not be stored in plain text in application settings.

**Why:** Key Vault prevents sensitive values (connection strings, API keys) from being visible in the Azure portal's application settings or in deployment scripts. The Function App retrieves these values at runtime using its Managed Identity.

**Who usually creates it:** IT or security administrator.

**How to create it:**
1. Azure portal > **Key vaults** > **Create**
2. Select your resource group
3. Enter a name (e.g., `kv-hb-intel-staging`)
4. Select your region (same as the Function App)
5. **Permission model:** Azure role-based access control (RBAC) is recommended. If your organization uses vault access policies, that also works.
6. Under **Access configuration**, ensure the Function App's Managed Identity will be able to read secrets

**Grant the Function App access to Key Vault:**
1. Azure portal > **Key vaults** > your vault > **Access control (IAM)** (if using RBAC) or **Access policies** (if using vault access policies)
2. If RBAC: Assign the **Key Vault Secrets User** role to the Function App's Managed Identity (use the Object ID from Section 7.2)
3. If access policies: Create a policy granting **Get** and **List** permissions on Secrets, assigned to the Function App's Managed Identity

**Secrets to store:**

| Secret Name | Value Source | Notes |
|---|---|---|
| `AzureStorageConnectionString` | Storage Account connection string | From Section 7.3 |
| `AzureSignalRConnectionString` | SignalR Service connection string | From Section 7.7 (if applicable) |
| `ApplicationInsightsConnectionString` | Application Insights connection string | From Section 7.6 |
| `EmailDeliveryApiKey` | Email service API key | From your email provider |

**How to verify:**
1. Azure portal > **Key vaults** > your vault > **Secrets** — confirm all secrets are stored
2. Azure portal > **Function App** > **Configuration** — confirm Key Vault references resolve (a green checkmark appears next to settings that use Key Vault references)

**Common mistakes:**
- Forgetting to grant the Managed Identity access to the Key Vault (the Function App will fail to start)
- Using the wrong Managed Identity Object ID
- Storing the Key Vault reference with a trailing slash vs. without (be consistent with the format documented in Section 7.2)

---

### 7.6 Application Insights and Log Analytics

**What needs to exist:** One Application Insights workspace per environment, linked to a Log Analytics workspace. This is where all backend monitoring data is collected.

**Why:** Application Insights captures request logs, error logs, performance metrics, and custom telemetry events. The development and operations teams use this to monitor the health of the backend, diagnose failures, and verify that the system is working correctly. The Phase 1 plan requires a three-table correlation model: `requests` (incoming HTTP calls), `dependencies` (outbound calls to SharePoint, Graph, Redis), and `traces` (application log entries). All three tables share an `operation_Id` field for end-to-end tracing.

**Who usually creates it:** IT or DevOps administrator.

**How to create it:**
1. Azure portal > **Application Insights** > **Create**
2. Select your resource group
3. Enter a name (e.g., `ai-hb-intel-staging`)
4. **Resource mode:** Workspace-based (recommended)
5. **Log Analytics workspace:** Create a new one or select an existing one in the same resource group
6. Record the **Connection String** from the Overview page after creation

**How to verify:**
1. Azure portal > **Application Insights** > your instance > **Overview** — confirm it is receiving data (this will only show data after the Function App is deployed and running)
2. **Logs** > run a simple query: `requests | take 10` — confirm the table exists (it may be empty before deployment)

**What the development team will set up later (not IT responsibility):**
- 4 custom dashboards (Adapter Health, Auth & Token, Provisioning, Error Budget)
- 5 alert rules with Action Group delivery to Microsoft Teams
- Sampling configuration in the application's `host.json`

> **IT action required for alerts:** When the development team is ready to configure alert rules, they will need an Azure Monitor Action Group that delivers notifications to a Microsoft Teams channel via Teams Workflows (not the deprecated Office 365 Incoming Webhooks connector). IT may need to create this Action Group or grant the development team permission to create it.

**Common mistakes:**
- Using the same Application Insights instance for multiple environments (makes it impossible to separate staging noise from production issues)
- Forgetting to record the connection string before leaving the page

---

### 7.7 Azure SignalR Service

**What needs to exist:** One Azure SignalR Service instance per environment, configured in **serverless** mode.

**Why:** SignalR pushes real-time status updates to the browser during long-running operations like project provisioning. Without it, the application falls back to periodic polling, which is slower and less responsive.

**Who usually creates it:** IT or DevOps administrator.

**How to create it:**
1. Azure portal > **SignalR Service** > **Create**
2. Select your resource group
3. Enter a name (e.g., `sigr-hb-intel-staging`)
4. **Service mode:** Serverless (this is critical — the application is designed for serverless mode)
5. **Pricing tier:** Free tier is sufficient for development/staging; Standard for production
6. Record the **Connection String** from the Keys page after creation; store it in Key Vault

**How to verify:**
- Azure portal > **SignalR Service** > your instance > **Settings** — confirm Service Mode is "Serverless"

**Common mistakes:**
- Selecting "Default" or "Classic" service mode instead of "Serverless"
- Sharing a SignalR instance between staging and production

---

### 7.8 Redis Cache (Conditional)

**What needs to exist:** A Redis cache instance, **only if the platform/architecture team confirms it is needed** for this environment. Redis is used to cache frequently-read data from SharePoint to reduce load and improve response times.

> **Architecture decision pending:** The Phase 1 plan documents reference Redis caching for proxy adapter GET responses (with a 300-second time-to-live), but the exact rollout timing is not frozen. **Check with the architecture team before provisioning Redis.** If they confirm it is needed, proceed with this section.

**Recommended service:** Azure Managed Redis (the current-generation Azure Redis offering). If your organization already operates Azure Cache for Redis (the previous-generation service), that will also work, but Azure Managed Redis is preferred for new deployments.

**How to create it:**
1. Azure portal > search for **Azure Managed Redis** > **Create**
2. Select your resource group
3. Enter a name (e.g., `redis-hb-intel-staging`)
4. Select your region and pricing tier (Basic is sufficient for staging; Standard or Premium for production)
5. Record the **Host name** and **Access key** (or connection string); store in Key Vault

**How to verify:**
- Azure portal > your Redis instance > **Overview** — confirm status is "Running"
- Azure portal > your Redis instance > **Console** — type `PING` and confirm the response is `PONG`

**Common mistakes:**
- Provisioning Redis when the architecture team has not confirmed it is needed yet (wastes cost)
- Using a Redis instance that is in a different region from the Function App (adds latency)

---

## 8. Microsoft Entra ID Setup Requirements

### 8.1 Backend API App Registration

**What needs to be created:** An app registration in Microsoft Entra ID that represents the HB Intel backend API. This is how the platform knows that the Function App is a protected API that requires authentication.

**Why:** Every request to the backend API must include a valid authentication token. The app registration defines what tokens look like, who can request them, and what permissions they grant.

**Who usually creates it:** IT administrator with Application Administrator role.

**How to create it:**
1. Azure portal > **Microsoft Entra ID** > **App registrations** > **New registration**
2. **Name:** e.g., `hb-intel-api-staging`
3. **Supported account types:** "Accounts in this organizational directory only" (single tenant)
4. **Redirect URI:** Leave blank for now (the backend API does not receive redirect callbacks)
5. Click **Register**
6. Record the **Application (client) ID** — this is critical for the development team
7. Record the **Directory (tenant) ID**

**Values to record:**

| Value | Where to Find It | What It Is Used For |
|---|---|---|
| Application (client) ID | App registration > Overview | Identifies this API; used in token audience validation |
| Directory (tenant) ID | App registration > Overview | Identifies your organization |
| Application ID URI | You will set this in Section 8.2 | The audience value in authentication tokens |

---

### 8.2 Exposing the API — Scopes and Application ID URI

**What needs to be configured:** The app registration must expose an API so that client applications (like the PWA) can request tokens scoped to this API.

**Why:** When the web application requests an authentication token, it must specify which API the token is for. The Application ID URI is the audience value that the backend checks in every incoming token.

**How to configure it:**
1. Azure portal > **App registrations** > your app > **Expose an API**
2. Click **Set** next to Application ID URI
3. Enter a URI in the format: `api://<your-function-app-name>` (e.g., `api://func-hb-intel-staging`)
4. Click **Save**
5. Click **Add a scope**
   - **Scope name:** `access_as_user` (or as directed by the architecture team)
   - **Who can consent:** Admins and users
   - **Admin consent display name:** "Access HB Intel API"
   - **Admin consent description:** "Allows the application to access the HB Intel backend API on behalf of the signed-in user"
   - **State:** Enabled
6. Record the full scope string: `api://func-hb-intel-staging/access_as_user`

> **Important:** The PWA will request tokens using the scope `api://<function-app-name>/.default`. The `.default` scope automatically includes all permissions the user has been granted for this API.

**How to verify:**
- **App registrations** > your app > **Expose an API** — confirm the Application ID URI and at least one scope are listed

**Common mistakes:**
- Setting the Application ID URI to a URL format instead of `api://` format (causes token audience mismatch)
- Forgetting to create a scope (the PWA cannot request tokens without at least one scope defined)

---

### 8.3 Enterprise Application and Consent

**What needs to happen:** Admin consent must be granted so that users in your organization can obtain tokens for the HB Intel API without individual consent prompts.

**How to grant admin consent:**
1. Azure portal > **App registrations** > your app > **API permissions**
2. If any permissions show "Not granted for [your org]", click **Grant admin consent for [your org]**
3. Confirm the action

**How to verify:**
- **API permissions** — all listed permissions should show a green checkmark under "Status" with "Granted for [your org]"

**Common mistakes:**
- Skipping admin consent (users will see consent prompts, which may be confusing or blocked by organizational policy)
- Granting consent at the wrong scope (e.g., granting consent on a different app registration)

---

### 8.4 Graph API Permissions for the Managed Identity

**What needs to be configured:** The Function App's Managed Identity needs specific Microsoft Graph API permissions to manage SharePoint sites and Entra ID security groups during project provisioning.

**Required permissions:**

| Permission | Type | Why It Is Needed |
|---|---|---|
| `Sites.Selected` | Application | Grants the backend access to specific SharePoint sites (not all sites). The most secure option — access is granted per-site, not tenant-wide. |
| `Group.ReadWrite.All` | Application | Allows the backend to create and manage Entra ID security groups for each project (Leaders, Team, Viewers groups). |

> **Important:** These are **application permissions** (not delegated permissions). They are granted to the Managed Identity, not to individual users. They require tenant administrator approval.

**How to grant these permissions to the Managed Identity:**

Application permissions cannot be assigned to a Managed Identity through the portal's App registrations UI. You must use Microsoft Graph PowerShell or the Graph API directly.

**Using Microsoft Graph PowerShell:**
```powershell
# Connect with admin credentials
Connect-MgGraph -Scopes "Application.ReadWrite.All", "AppRoleAssignment.ReadWrite.All"

# Get the Managed Identity's service principal
$managedIdentity = Get-MgServicePrincipal -Filter "displayName eq 'func-hb-intel-staging'"

# Get the Microsoft Graph service principal
$graphSp = Get-MgServicePrincipal -Filter "appId eq '00000003-0000-0000-c000-000000000000'"

# Find the Sites.Selected app role
$sitesSelectedRole = $graphSp.AppRoles | Where-Object { $_.Value -eq "Sites.Selected" }

# Find the Group.ReadWrite.All app role
$groupReadWriteRole = $graphSp.AppRoles | Where-Object { $_.Value -eq "Group.ReadWrite.All" }

# Assign Sites.Selected
New-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $managedIdentity.Id `
  -PrincipalId $managedIdentity.Id `
  -ResourceId $graphSp.Id `
  -AppRoleId $sitesSelectedRole.Id

# Assign Group.ReadWrite.All
New-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $managedIdentity.Id `
  -PrincipalId $managedIdentity.Id `
  -ResourceId $graphSp.Id `
  -AppRoleId $groupReadWriteRole.Id
```

**How to verify:**
1. Azure portal > **Enterprise applications** > search for your Function App name > **Permissions** — confirm `Sites.Selected` and `Group.ReadWrite.All` appear under "Admin consent"
2. Alternatively, in Graph PowerShell: `Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $managedIdentity.Id`

> **Security note:** `Sites.Selected` is the least-privilege approach for SharePoint access. It grants access to **zero** sites by default — each site must be individually granted (see Section 9.6). This is significantly more secure than `Sites.FullControl.All`, which grants access to every site in the tenant.

> **Architecture decision still pending:** The exact mechanism for granting per-site access to new project sites is still being finalized. Two options are under evaluation: (A) automated grant via a bootstrap service principal, or (B) manual grant by a tenant admin for each new project. **Do not finalize the grant workflow until the architecture team confirms the approach.** For pilot setup (2–3 projects), manual grants are acceptable.

**Common mistakes:**
- Trying to assign application permissions via the portal's App registrations UI (this only works for app registrations, not Managed Identities)
- Granting `Sites.FullControl.All` instead of `Sites.Selected` (over-privileged — grants access to every SharePoint site in the tenant)
- Forgetting to grant `Group.ReadWrite.All` (provisioning will fail when it tries to create security groups)

---

### 8.5 Token Audience for Staging and Smoke Testing

**What IT needs to know:** The backend validates the `aud` (audience) claim in every incoming token. The expected audience is the Application ID URI from Section 8.2 (e.g., `api://func-hb-intel-staging`).

**For smoke testing in staging**, the development team will need to obtain a token scoped to this API. The command they will use is:
```
az account get-access-token --resource api://func-hb-intel-staging
```

This returns a token with the correct audience. If the app registration is not set up correctly, this command will fail or return a token with the wrong audience.

**How to verify the setup is correct:**
1. Run the command above (you need Azure CLI installed and signed in to the correct tenant)
2. Decode the returned token at https://jwt.ms
3. Confirm the `aud` claim matches your Application ID URI
4. Confirm the `iss` claim contains your tenant ID
5. Confirm the `upn` claim shows your user principal name

**Common mistakes:**
- Using an ARM-scoped token (audience `https://management.azure.com/`) instead of an API-scoped token — the backend will reject it with a 401 error
- The Application ID URI not matching what the backend expects (e.g., `api://func-hb-intel-staging` vs. `api://func-hb-intel`)

---

### 8.6 On-Behalf-Of (OBO) Setup — Where Actually Required

**What is OBO?** On-Behalf-Of is a token exchange flow where the backend API trades a user's token for a new token that can access a downstream Microsoft service (like SharePoint or Microsoft Graph) as that user. This preserves the user's identity and permissions in the downstream call.

**Where OBO is required in Phase 1:**
- Backend endpoints that call the **Microsoft Graph API** on behalf of the user (e.g., creating security groups during provisioning, querying group membership)
- Backend endpoints that call **SharePoint** on behalf of the user (e.g., reading or writing to SharePoint lists using the user's permissions)

**Where OBO is NOT required:**
- Basic domain read/write endpoints that only access Azure Table Storage or other backend-owned resources
- Endpoints where the backend accesses SharePoint using its own Managed Identity (application-level access, not user-level)

> **Architecture decision context:** The Phase 1 plan distinguishes between app-level access (Managed Identity + `Sites.Selected`) and user-level access (OBO). Many provisioning operations use app-level access. OBO is primarily needed when the operation must respect the user's individual SharePoint permissions. **The development team will confirm which specific endpoints require OBO.**

**If OBO is needed, additional app registration configuration is required:**
1. Azure portal > **App registrations** > your backend API app > **Certificates & secrets** > **New client secret** (only for local development; production uses Managed Identity)
2. Azure portal > **App registrations** > your backend API app > **API permissions** > add delegated permissions for the downstream APIs:
   - `Microsoft Graph > User.Read` (minimum for OBO to work)
   - `SharePoint > Sites.Read.All` or `Sites.ReadWrite.All` (only if user-delegated SharePoint access is needed — confirm with architecture team)
3. Grant admin consent for these permissions

**Common mistakes:**
- Setting up OBO for every endpoint when it is only needed for specific downstream calls
- Confusing application permissions (Managed Identity) with delegated permissions (OBO) — they serve different purposes
- Forgetting to grant admin consent for the delegated permissions

---

### 8.7 Local Development App Registration (Development Team Only)

> **Note for IT:** The development team needs a separate app registration (or the same registration with a client secret) for local development because Managed Identity is not available outside Azure. IT may need to create this or authorize the development team to create it themselves.

**What is needed:**
- An app registration client secret (or certificate) that developers can use locally
- The client ID and tenant ID from the backend API app registration

**What IT should provide:**
- `AZURE_TENANT_ID` — the tenant ID
- `AZURE_CLIENT_ID` — the backend API app registration's client ID
- `AZURE_CLIENT_SECRET` — a client secret created on the app registration (shared via a secure channel, never in email or chat)

> **Critical:** `AZURE_CLIENT_SECRET` must **never** be set in staging or production Function App configuration. Staging and production must use Managed Identity exclusively.

---

## 9. SharePoint and Microsoft 365 Setup Requirements

### 9.1 Hub Site

**What needs to exist:** One SharePoint hub site that serves as the central reference-data site for HB Intel. This is a one-time, platform-level setup.

**Purpose:** The hub site stores shared reference data used across all projects — responsibility templates, cost code dictionaries, CSI code dictionaries, project type classifications, and other governed lookup data. It also serves as the hub that project sites associate with for navigation and search.

**How to create it:**
1. SharePoint admin center > **Active sites** > **Create** > **Communication site** (or **Team site** depending on your preference)
2. Name: e.g., "HB Intel" or as directed by the business
3. URL: e.g., `https://contoso.sharepoint.com/sites/hb-intel`
4. After creation, register it as a hub site:
   - SharePoint admin center > **Active sites** > select the site > **Hub** > **Register as hub site**
5. Record the **Site ID (GUID)** — the development team needs this for the `SHAREPOINT_HUB_SITE_ID` setting

**How to get the Site ID:**
- Browse to `https://contoso.sharepoint.com/sites/hb-intel/_api/site/id` — the response contains the site GUID
- Or use SharePoint PowerShell: `Get-SPOSite -Identity https://contoso.sharepoint.com/sites/hb-intel | Select-Object Id`

**Shared reference lists to create on the hub site:**

> **Architecture decision pending:** The exact list names and column schemas are defined in the Phase 1 schema register (P1-A3) but have not received final business approval per domain. The development team will provide the confirmed list definitions. **Do not create lists until the schemas are approved and the development team provides the final specifications.**

Expected hub-site containers (based on current planning — subject to confirmation):
- Shared responsibility templates
- Shared responsibility dictionary
- Cost code dictionary
- CSI code dictionary
- Project type classifications
- Other shared reference dictionaries as confirmed

**How to verify:**
- Browse to the hub site URL — confirm it loads
- SharePoint admin center > **Active sites** — confirm the site shows as a registered hub site
- Confirm you can retrieve the Site ID via the API URL above

**Common mistakes:**
- Creating the hub site but forgetting to register it as a hub site (project sites cannot associate with it)
- Creating lists before the schemas are approved (will likely need to be recreated)

---

### 9.2 Project Sites

**What needs to exist:** Project sites are created **dynamically** by the application during project provisioning — IT does not need to create them manually.

**What IT must ensure:**
- The Managed Identity has permission to create sites (via `Sites.Selected` grant — see Section 8.4)
- The hub site exists and is registered (Section 9.1) so new project sites can associate with it
- The SharePoint tenant allows programmatic site creation (this is the default; check that no tenant-level policy blocks it)

**Per-project site structure (created by the application):**
Each project site will contain approximately 31 lists and libraries covering domains like schedule, buyout, compliance, contracts, risk, scorecard, and project management. The exact set varies by department (e.g., commercial vs. luxury residential sites have different document libraries).

**Permission model (created by the application):**
For each project, the application creates three Entra ID security groups and maps them to SharePoint permission levels:

| Group Name Pattern | SharePoint Permission | Purpose |
|---|---|---|
| `HB-{ProjectNumber}-Leaders` | Full Control | Project leaders and structural owners |
| `HB-{ProjectNumber}-Team` | Contribute | Project team members and coordinators |
| `HB-{ProjectNumber}-Viewers` | Read | Department background access |

Example for project 25-001-01: `HB-25-001-01-Leaders`, `HB-25-001-01-Team`, `HB-25-001-01-Viewers`

**IT does NOT need to:**
- Create project sites manually
- Create security groups manually
- Assign permissions manually

**IT DOES need to:**
- Ensure `Group.ReadWrite.All` permission is granted (Section 8.4)
- Ensure `Sites.Selected` permission is granted and site-level grants work (Section 8.4 and 9.6)

---

### 9.3 Sales / Business Development Site

**What needs to exist:** One SharePoint site for the Sales/Business Development team, created once during platform setup.

**Purpose:** Stores market leads and pipeline snapshot data. This site is department-scoped, not project-scoped.

**How to create it:**
1. SharePoint admin center > **Active sites** > **Create** > choose site type per your organization's standards
2. Name and URL as directed by the business (e.g., `https://contoso.sharepoint.com/sites/hb-intel-sales`)
3. Associate with the HB Intel hub site if desired

**Expected containers (subject to schema approval):**
- MarketLeads list
- PipelineSnapshots list

> **Do not create lists until the development team provides the approved schema definitions.**

---

### 9.4 Shared / Department Site(s)

**What needs to exist:** One or more department-scoped SharePoint sites for shared operational data like team rosters.

**Purpose:** Stores team membership and roster data that is shared across projects within a department.

**How to create it:**
1. Create a SharePoint site per department (or one shared site, depending on organizational preference)
2. Associate with the HB Intel hub site if desired

**Expected containers (subject to schema approval):**
- EstimatingTeamMembers list (or equivalent per department)

> **Do not create lists until the development team provides the approved schema definitions.**

---

### 9.5 Content Type Gallery and Published Content Types

**What is a Content Type?** A content type in SharePoint defines a reusable set of columns, behaviors, and metadata for a specific kind of item (like a "Project Document" or "Change Order"). Publishing a content type from the Content Type Gallery makes it available across all sites in the tenant.

**Hub-level content types:**
Content types that apply to shared reference data on the hub site should be defined in the **Content Type Gallery** (SharePoint admin center > **Content type gallery**) and published tenant-wide. This ensures consistency across all sites that use the same data structures.

**Project-site content types:**
Content types specific to project sites are created during project provisioning by the application. These do not need to be in the Content Type Gallery unless the architecture team decides they should be shared.

> **Architecture decision pending:** The Phase 1 schema register (P1-A3) defines column structures for all lists, but the decision on which content types should be published via the Content Type Gallery versus created site-locally during provisioning has not been finalized. **Do not publish content types to the gallery until the architecture team confirms the list.**

**How to publish a content type (when confirmed):**
1. SharePoint admin center > **Content type gallery** > **Create content type** (or modify an existing one)
2. Define the columns as specified by the development team
3. Click **Publish** to make it available to all sites

**How to verify:**
- SharePoint admin center > **Content type gallery** — confirm the required content types are listed and published
- On a target site: **Site settings** > **Site content types** — confirm the published types appear

**Common mistakes:**
- Publishing content types before the schema is finalized (changes to published content types can be disruptive)
- Not publishing content types that are needed on multiple sites (forces manual recreation on each site)

---

### 9.6 Site-Scoped App Access (Selected Permissions)

**What needs to happen:** After the Managed Identity has `Sites.Selected` permission (Section 8.4), each individual SharePoint site must be explicitly granted to the Managed Identity. This is the modern, least-privilege approach that replaces the legacy Azure Access Control Service (ACS) app-only model.

**Why this matters:** `Sites.Selected` grants access to **zero** sites by default. The Managed Identity cannot read or write to any SharePoint site until you explicitly grant it access to that specific site.

**How to grant site-level access:**

Using the Microsoft Graph API:
```
POST https://graph.microsoft.com/v1.0/sites/{siteId}/permissions

{
  "roles": ["write"],
  "grantedToIdentities": [
    {
      "application": {
        "id": "<Managed-Identity-Client-ID>",
        "displayName": "func-hb-intel-staging"
      }
    }
  ]
}
```

Or using Microsoft Graph PowerShell:
```powershell
New-MgSitePermission -SiteId $siteId -BodyParameter @{
  roles = @("write")
  grantedToIdentities = @(
    @{
      application = @{
        id = "<Managed-Identity-Client-ID>"
        displayName = "func-hb-intel-staging"
      }
    }
  )
}
```

**Sites that need grants during initial setup:**
1. Hub site (Section 9.1)
2. Sales/BD site (Section 9.3)
3. Shared/department site(s) (Section 9.4)

**Sites that need grants during ongoing operation:**
- Each new project site needs a grant after it is created by the provisioning workflow. This may be automated or manual depending on the architecture decision noted in Section 8.4.

**How to verify:**
```
GET https://graph.microsoft.com/v1.0/sites/{siteId}/permissions
```
Confirm the Managed Identity appears in the response with the expected role.

**What NOT to do:**
- Do not use Azure Access Control Service (ACS) app-only permissions — this is the legacy model and is being deprecated by Microsoft
- Do not grant `Sites.FullControl.All` as a shortcut — this gives the app access to every site in the tenant
- Do not skip the per-site grant step — the app will receive "Access Denied" errors

---

### 9.7 Financial and Compliance-Restricted Lists

**What needs to be understood:** Some SharePoint lists contain financial data (budgets, forecasts, draw requests, subcontractor financials) or compliance-sensitive data (audit records, insurance, safety incidents). These lists require additional access restrictions.

**Phase 1 approach:**
- Financial and compliance lists are placed on **project sites**, not the hub site
- Access is controlled through the three-group permission model (Leaders/Team/Viewers)
- Leaders get Full Control; Team gets Contribute; Viewers get Read
- No anonymous or external sharing should be enabled on these sites

**IT responsibilities:**
- Ensure that project sites do not inherit permissions from a parent that would grant overly broad access
- Ensure that sharing settings on project sites are restricted (no external sharing, no "Anyone with a link")
- The application handles list-level permission assignment; IT does not need to set permissions per-list

**How to verify:**
- SharePoint admin center > **Active sites** > select a project site > **Sharing** — confirm sharing is set to "Only people in your organization" or more restrictive
- On the project site: **Site permissions** — confirm only the expected HB Intel security groups have access

---

## 10. Required Values to Hand Back to the Development Team

After completing the setup above, provide the development team with the following values. Use a secure channel (e.g., Azure Key Vault shared access, encrypted file share, or your organization's approved secrets-sharing tool). **Do not send these in email or chat.**

### Handoff Checklist

- [ ] **Azure Tenant ID** — `________________________`
- [ ] **Backend API Client ID (Application ID)** — `________________________`
- [ ] **Backend API Application ID URI** — `________________________` (e.g., `api://func-hb-intel-staging`)
- [ ] **Full API scope** — `________________________` (e.g., `api://func-hb-intel-staging/.default`)
- [ ] **Function App URL** — `________________________` (e.g., `https://func-hb-intel-staging.azurewebsites.net`)
- [ ] **Function App Managed Identity Object ID** — `________________________`
- [ ] **Key Vault URI** — `________________________`
- [ ] **Confirmation:** Key Vault secrets stored for: storage, SignalR, Application Insights, email API key
- [ ] **Confirmation:** Managed Identity has Key Vault Get/List access
- [ ] **Application Insights Connection String** — `________________________` (or confirm it is in Key Vault)
- [ ] **SharePoint Tenant URL** — `________________________`
- [ ] **Hub Site URL** — `________________________`
- [ ] **Hub Site ID (GUID)** — `________________________`
- [ ] **Sales/BD Site URL** — `________________________`
- [ ] **Shared/Department Site URL(s)** — `________________________`
- [ ] **Confirmation:** `Sites.Selected` permission granted to Managed Identity
- [ ] **Confirmation:** `Group.ReadWrite.All` permission granted to Managed Identity
- [ ] **Confirmation:** Site-level access granted for hub site, Sales/BD site, and shared site(s)
- [ ] **SignalR Service Connection String** — confirm it is in Key Vault
- [ ] **Redis endpoint and connection string** (if used) — confirm it is in Key Vault
- [ ] **Email service API key** — confirm it is in Key Vault
- [ ] **Verified sender email address** — `________________________`
- [ ] **App Catalog URL** (if SPFx is used) — `________________________`
- [ ] **Local development client secret** (shared via secure channel) — for `AZURE_CLIENT_SECRET`

---

## 11. Verification and Readiness Checklist

Run through this checklist before telling the development team that the environment is ready.

### Azure Resources

- [ ] Function App is running (status "Running" in Azure portal)
- [ ] Function App has System assigned Managed Identity enabled
- [ ] Storage Account exists and is accessible
- [ ] Required Table Storage tables exist (once names are confirmed by dev team)
- [ ] Key Vault exists and contains all required secrets
- [ ] Function App can resolve Key Vault references (green checkmarks in Configuration)
- [ ] Application Insights workspace exists and connection string is configured
- [ ] SignalR Service exists in Serverless mode
- [ ] Redis cache exists and responds to PING (if applicable)

### Identity and Authentication

- [ ] Backend API app registration exists with correct Application ID URI
- [ ] At least one API scope is defined and enabled
- [ ] Admin consent has been granted for the API scope
- [ ] Managed Identity has `Sites.Selected` Graph permission
- [ ] Managed Identity has `Group.ReadWrite.All` Graph permission
- [ ] A smoke-test token can be obtained: `az account get-access-token --resource api://func-hb-intel-staging`
- [ ] The token's `aud` claim matches the Application ID URI

### SharePoint

- [ ] Hub site exists and is registered as a hub site
- [ ] Hub site ID (GUID) has been recorded
- [ ] Sales/BD site exists
- [ ] Shared/department site(s) exist
- [ ] Site-level app access has been granted for each site via `Sites.Selected`
- [ ] Sharing settings on all HB Intel sites are appropriately restricted

### Email

- [ ] Email service account exists with a valid API key
- [ ] Sender domain/address is verified
- [ ] API key is stored in Key Vault

### Environment Separation

- [ ] Staging resources are completely separate from production resources
- [ ] Staging SharePoint sites are NOT in the production tenant (or are clearly separated)
- [ ] No production secrets are used in staging configuration

---

## 12. Common Mistakes and Troubleshooting

### Authentication Errors (401 Unauthorized)

**Symptom:** API calls return 401 even though the user is signed in.

**Common causes:**
- **Wrong token audience.** The token was acquired with an ARM scope (`https://management.azure.com/`) instead of the API scope (`api://func-hb-intel-staging`). Fix: ensure the frontend uses the correct `VITE_API_SCOPE` value.
- **Application ID URI mismatch.** The app registration's Application ID URI does not match what the backend expects. Fix: compare the `aud` claim in the token (decode at https://jwt.ms) with the configured Application ID URI.
- **Admin consent not granted.** The API permission exists but consent was never granted. Fix: Azure portal > App registrations > your app > API permissions > Grant admin consent.
- **Token expired.** Tokens expire after approximately one hour. The application should refresh automatically, but a stale token will fail.

### SharePoint Access Denied (403)

**Symptom:** The backend cannot read or write to a SharePoint site.

**Common causes:**
- **Site-level grant missing.** `Sites.Selected` was granted but no per-site permission was created. Fix: grant the Managed Identity access to the specific site (see Section 9.6).
- **Wrong permission role.** The site grant was "read" but the operation requires "write". Fix: update the site permission to "write" or "fullcontrol" as needed.
- **Wrong Managed Identity.** The site grant was made to a different service principal than the Function App's Managed Identity. Fix: verify the Application ID in the site permission matches the Function App's Managed Identity client ID.

### Security Group Creation Fails

**Symptom:** Project provisioning fails at the group creation step.

**Common causes:**
- **`Group.ReadWrite.All` not granted.** The Managed Identity does not have permission to create groups. Fix: grant the permission (Section 8.4).
- **Duplicate group name.** A group with the same name already exists (from a previous failed provisioning attempt). The application should handle this idempotently, but check Entra ID > Groups for conflicts.

### Key Vault Reference Errors

**Symptom:** Function App fails to start or shows "Key Vault reference error" in Configuration.

**Common causes:**
- **Managed Identity does not have Key Vault access.** Fix: grant Key Vault Secrets User role (or Get/List access policy) to the Managed Identity.
- **Secret name mismatch.** The Key Vault reference URI points to a secret name that does not exist in the vault. Fix: verify the secret name in Key Vault matches exactly.
- **Key Vault firewall blocking access.** If Key Vault has network restrictions, ensure the Function App's outbound IPs are allowed (or use a private endpoint).

### Monitoring Data Missing

**Symptom:** Application Insights shows no data after the Function App is deployed.

**Common causes:**
- **Connection string not configured.** The `APPLICATIONINSIGHTS_CONNECTION_STRING` setting is missing from the Function App. Fix: add it (directly or via Key Vault reference).
- **Wrong Application Insights instance.** The connection string points to a different environment's workspace. Fix: verify the connection string matches the correct environment.

### Staging Environment Not Responding

**Symptom:** Requests to the Function App URL return connection errors or timeouts.

**Common causes:**
- **Function App not deployed.** The infrastructure is set up but the application code has not been deployed yet. This is a development team responsibility.
- **Function App in stopped state.** Azure portal > Function App > Overview — check if the app is stopped and start it.
- **DNS not propagated.** If the Function App was just created, DNS may take a few minutes to propagate.

---

## 13. Open Items and Architecture Decisions Still Needed

The following items from the Phase 1 planning documents are not yet finalized. **Do not assume a specific answer for these items — wait for confirmation from the architecture team or product owner before proceeding.**

### Do Not Finalize Until Architecture Confirms

| Item | What Is Pending | Impact on IT Setup |
|---|---|---|
| **Per-site grant automation** | Whether `Sites.Selected` per-site grants for new project sites are automated (bootstrap service principal) or manual (tenant admin grants each site) | Determines whether IT must grant access manually for every new project or only during initial setup |
| **Azure Table Storage table names** | Final table names for provisioning status, audit, and idempotency tables | IT cannot create the tables until names are confirmed |
| **SharePoint list schemas per domain** | Business approval of the column schemas defined in P1-A3 through P1-A15 | IT cannot create SharePoint lists until schemas are approved |
| **Content Type Gallery vs. site-local** | Which content types should be published via the Content Type Gallery vs. created during provisioning | Determines whether IT needs to publish content types centrally |
| **OBO endpoint list** | Which specific backend endpoints require On-Behalf-Of token exchange | Determines whether additional delegated API permissions are needed |
| **Redis rollout timing** | Whether Redis caching is needed for initial deployment or can be added later | Determines whether IT provisions Redis now or defers |

### Optional Implementation Choices

| Item | Options | Notes |
|---|---|---|
| **Function App OS** | Windows or Linux | Both supported; check with development team for preference |
| **Function App plan type** | Consumption or App Service Plan | Consumption is cheaper for low traffic; App Service Plan provides predictable performance |
| **Storage redundancy** | LRS, ZRS, GRS | LRS for dev/staging; GRS or ZRS recommended for production |
| **Key Vault permission model** | RBAC or vault access policies | RBAC is the modern approach; access policies also work |

### Follow-On Phase Items

| Item | Phase | Notes |
|---|---|---|
| **Health endpoint (`GET /api/health`)** | Currently not registered — development team will implement | IT does not need to act; this is a code change |
| **Startup configuration validation** | Deferred to a future development milestone (G2.6) | The validation logic exists but is not wired into startup yet |
| **Phase assignment for deferred packages** | Architecture decision — see P0-E2 Open Decisions Register | Affects future phases, not Phase 1 setup |
| **On-call paging integration** | Production readiness — Phase 1 defines alert rules but paging mechanism (PagerDuty, Opsgenie, etc.) is TBD | IT may need to provision the paging service later |

---

## 14. How IT Should Use This Guide

| Scenario | How to Use |
|---|---|
| **First-time environment setup** | Follow the guide end-to-end, from Section 7 through Section 11 |
| **New environment / staging rollout** | Use the Environment Inventory Worksheet (Section 6) and the Setup-at-a-Glance Checklist (Section 4) to stand up a parallel environment |
| **Audit or compliance review** | Use the Verification and Readiness Checklist (Section 11) to confirm all infrastructure is in place and correctly configured |
| **Rebuild or disaster recovery** | Use the Environment Inventory Worksheet (Section 6) as the reference for what must be recreated, and the Azure/Entra/SharePoint sections (7–9) for step-by-step instructions |
| **Dev-to-IT handoff** | Use the Required Values to Hand Back (Section 10) as the formal handoff document |
| **Onboarding a new IT team member** | Start with the Architecture Summary (Section 3) and Required Access (Section 5), then review the full guide |

---

## Glossary

| Term | Plain-Language Definition |
|---|---|
| **App Registration** | A record in Microsoft Entra ID that represents an application. It defines who can access the app and what permissions it has. |
| **Application ID URI** | A unique identifier for an API (like `api://func-hb-intel`). Used as the "audience" value in authentication tokens. |
| **Azure Functions** | Microsoft's serverless compute service. You deploy code and Microsoft manages the servers. |
| **Azure Managed Redis** | Microsoft's current-generation managed Redis cache service. Replaces "Azure Cache for Redis" for new deployments. |
| **Bearer Token** | An authentication credential sent with every API request. The browser obtains it from Entra ID and the backend validates it. |
| **Content Type** | A SharePoint definition that describes a kind of item — its columns, metadata, and behavior. |
| **Content Type Gallery** | A tenant-level SharePoint feature where you publish content types that should be available across all sites. |
| **Entra ID** | Microsoft Entra ID (formerly Azure Active Directory / Azure AD). Microsoft's identity and access management service. |
| **Hub Site** | A SharePoint site that other sites can associate with for shared navigation, search, and branding. |
| **Idempotency** | A property of an operation meaning it can be performed multiple times without changing the result beyond the first time. Prevents duplicate records if a user accidentally submits twice. |
| **Key Vault** | An Azure service for securely storing secrets, keys, and certificates. Applications retrieve them at runtime instead of embedding them in configuration. |
| **Managed Identity** | An automatically-managed identity that Azure assigns to a resource (like a Function App). Eliminates the need for stored credentials. |
| **MSAL** | Microsoft Authentication Library. The code library the web application uses to obtain authentication tokens. |
| **OBO (On-Behalf-Of)** | A token exchange where the backend API trades a user's token for a new token to access a downstream service as that user. |
| **PWA** | Progressive Web App. The main HB Intel web application that runs in the browser. |
| **Selected Permissions (`Sites.Selected`)** | A Graph API permission that grants access to specific SharePoint sites, not all sites. Each site must be individually granted. |
| **SignalR** | An Azure service that pushes real-time updates from the server to the browser without the browser having to constantly poll. |
| **SPFx** | SharePoint Framework. A development model for building web parts that run inside SharePoint pages. |
| **Table Storage** | A simple key-value store in Azure, used for structured data that does not need a full relational database. |
| **Tenant** | Your organization's Microsoft 365 / Azure environment. Identified by a tenant ID (GUID). |

---

## Minimum Required Setup Summary

If you need the shortest path to a working staging environment, these are the absolute minimum steps:

1. **Create a resource group** for staging
2. **Create a Function App** (Node.js 20, v4) with System assigned Managed Identity
3. **Create a Storage Account** with the required Table Storage tables
4. **Create a Key Vault** and grant the Managed Identity access; store the storage connection string
5. **Create an Application Insights** workspace and store the connection string in Key Vault
6. **Create a SignalR Service** in serverless mode and store the connection string in Key Vault
7. **Create the backend API app registration** with `api://` Application ID URI and expose a scope
8. **Grant admin consent** for the API scope
9. **Grant `Sites.Selected` and `Group.ReadWrite.All`** to the Managed Identity
10. **Create the SharePoint hub site**, record the Site ID, and grant the Managed Identity site-level access
11. **Configure all Function App application settings** (see Section 7.2 table)
12. **Hand off all values** to the development team (Section 10)

Everything else in this guide either enhances the setup (Redis, email, additional SharePoint sites) or depends on decisions not yet finalized.

---

**Last Updated:** 2026-03-18

**Source Planning Documents:**
- [Phase 1 Master Plan](../../../architecture/plans/MASTER/02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md)
- [Phase 1 Deliverables Index](../../../architecture/plans/MASTER/phase-1-deliverables/README.md)
- [MVP Environment Configuration (W0-G1-T04)](../../../architecture/plans/MVP/G1/W0-G1-T04-Environment-Configuration-and-Operational-Governance.md)
- [MVP Sites.Selected Validation (W0-G1-T05)](../../../architecture/plans/MVP/G1/W0-G1-T05-Sites-Selected-Validation-and-Fallback-Path.md)
- [MVP Entra ID Group Model (W0-G1-T02)](../../../architecture/plans/MVP/G1/W0-G1-T02-Entra-ID-Group-Lifecycle-and-Role-Model.md)
