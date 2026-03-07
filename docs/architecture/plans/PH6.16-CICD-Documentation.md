# PH6.16 — CI/CD, Documentation & ADRs

**Version:** 2.0
**Purpose:** Complete the Phase 6 release pipeline by wiring up GitHub Actions deployment workflows for the Azure Functions backend and all affected apps, defining the three-environment strategy (dev / staging / prod), documenting every GitHub secret required, creating the mandatory Diátaxis documentation set (how-to guides, reference docs, explanation articles), and confirming all Architecture Decision Records are committed. This is the final gate before Phase 6 is considered shippable to production.
**Audience:** Implementation agent(s), CI/CD administrator, technical reviewers.
**Implementation Objective:** Every merge to `main` automatically deploys the Function App and affected SPFx packages to the staging environment. Every tagged release deploys to production after the E2E gate passes. Every new engineer can onboard using the documented how-to guides without asking anyone.

---

## Prerequisites

- PH6.1–PH6.15 complete and all success criteria checked.
- GitHub repository secrets listed in section 6.16.1 configured by the CI/CD administrator.
- Azure Function App (staging) and Azure Function App (production) provisioned with Managed Identity enabled.
- `WEBSITE_TIME_ZONE=Eastern Standard Time` set on both Function Apps.
- `AzureSignalRConnectionString`, `APPLICATIONINSIGHTS_CONNECTION_STRING` set on both Function Apps.

---

## 6.16.1 — GitHub Secrets Reference

All GitHub repository secrets must be configured before any workflow can run. This section is the authoritative source. Mirror it to `docs/how-to/developer/ci-secrets.md`.

| Secret Name | Description | Used By |
|---|---|---|
| `AZURE_TENANT_ID` | Entra ID tenant GUID | All workflows |
| `AZURE_CLIENT_ID` | App registration client ID (production) | deploy-functions.yml, e2e.yml |
| `AZURE_CLIENT_SECRET` | App registration secret (production) | deploy-functions.yml |
| `AZURE_CLIENT_ID_TEST` | App registration client ID (test tenant) | smoke-tests.yml |
| `AZURE_CLIENT_SECRET_TEST` | App registration secret (test tenant) | smoke-tests.yml |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID | deploy-functions.yml |
| `AZURE_RESOURCE_GROUP` | Production resource group name | deploy-functions.yml |
| `AZURE_FUNCTIONAPP_NAME_STAGING` | Function App name in staging | deploy-functions.yml |
| `AZURE_FUNCTIONAPP_NAME_PROD` | Function App name in production | deploy-functions.yml |
| `SHAREPOINT_TENANT_URL` | `https://hbconstruction.sharepoint.com` | smoke-tests.yml |
| `SHAREPOINT_HUB_SITE_ID` | GUID of the HB Intel hub site | smoke-tests.yml |
| `SHAREPOINT_TEST_SITE_COLLECTION` | Full URL of the test site collection | smoke-tests.yml |
| `STAGING_ESTIMATING_URL` | Full URL of the staging Estimating app | e2e.yml |
| `STAGING_ACCOUNTING_URL` | Full URL of the staging Accounting app | e2e.yml |

**How to add a secret:**
1. Go to the GitHub repository → Settings → Secrets and variables → Actions.
2. Click **New repository secret**.
3. Enter the name exactly as shown in the table (case-sensitive).
4. Paste the value and click **Add secret**.

---

## 6.16.2 — Three-Environment Strategy

| Environment | Branch / Trigger | Function App | SharePoint | Purpose |
|---|---|---|---|---|
| **Dev** | Feature branch (local only) | `local.settings.json` + Azurite | Test site collection | Individual developer iteration |
| **Staging** | Push to `main` | `hbintel-functions-staging` | Test site collection | Integration testing, smoke tests, E2E |
| **Production** | Git tag `v*` + E2E gate pass | `hbintel-functions-prod` | Production tenant | Live operations |

**Environment variable strategy:**
- `local.settings.json` is gitignored. Every developer creates their own from `local.settings.example.json`.
- Staging Function App settings are managed via Azure Portal or `az functionapp config appsettings set`.
- Production Function App settings are managed only via the GitHub Actions deployment workflow (never manual edits).
- `HBC_ADAPTER_MODE` is always `real` in staging and production; it defaults to `mock` in dev when the variable is absent.

---

## 6.16.3 — GitHub Actions: Function App Deployment

**File:** `.github/workflows/deploy-functions.yml`

```yaml
name: Deploy Azure Functions

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

permissions:
  id-token: write  # Required for OIDC login
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build shared packages
        run: pnpm turbo run build --filter=@hbc/models --filter=@hbc/provisioning

      - name: Build Functions
        run: pnpm turbo run build --filter=backend-functions

      - name: Run unit tests (gate)
        run: pnpm turbo run test --filter=backend-functions --filter=@hbc/provisioning
        env:
          AZURE_STORAGE_CONNECTION_STRING: UseDevelopmentStorage=true

      - name: Package Functions artifact
        run: |
          cd backend/functions
          zip -r ../../functions-artifact.zip dist/ host.json package.json

      - uses: actions/upload-artifact@v4
        with:
          name: functions-artifact
          path: functions-artifact.zip
          retention-days: 7

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    if: github.ref == 'refs/heads/main' || (github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'staging')
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: functions-artifact

      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy to Staging Function App
        uses: azure/functions-action@v1
        with:
          app-name: ${{ secrets.AZURE_FUNCTIONAPP_NAME_STAGING }}
          package: functions-artifact.zip
          respect-funcignore: true

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    if: startsWith(github.ref, 'refs/tags/v') || (github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'production')
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: functions-artifact

      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy to Production Function App
        uses: azure/functions-action@v1
        with:
          app-name: ${{ secrets.AZURE_FUNCTIONAPP_NAME_PROD }}
          package: functions-artifact.zip
          respect-funcignore: true
```

**Important notes:**
- The `environment: staging` and `environment: production` keys map to GitHub Environments (Settings → Environments), which can have required reviewers and deployment protection rules.
- Configure the production environment to require manual approval from a designated reviewer before deployment proceeds.
- OIDC federated credentials (Workload Identity Federation) are preferred over client secret rotation. Set `id-token: write` and configure the Azure App Registration with a federated credential for the GitHub Actions OIDC provider.

---

## 6.16.4 — GitHub Actions: Full CI Pipeline

**File:** `.github/workflows/ci.yml` (update existing, or create if absent)

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - name: Lint
        run: pnpm turbo run lint
      - name: Type check
        run: pnpm turbo run check-types

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile

      - name: Start Azurite (Azure Storage emulator)
        run: |
          npm install -g azurite
          azurite --silent --location /tmp/azurite &
          sleep 2

      - name: Run unit tests with coverage
        run: pnpm turbo run test --filter=backend-functions --filter=@hbc/provisioning
        env:
          AZURE_STORAGE_CONNECTION_STRING: UseDevelopmentStorage=true

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: |
            backend/functions/coverage/
            packages/provisioning/coverage/
          retention-days: 14
```

---

## 6.16.5 — GitHub Actions: Release Tagging Workflow

**File:** `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  validate-tag:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate tag format
        run: |
          TAG="${{ github.ref_name }}"
          if [[ ! "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "Tag $TAG does not match required format vMAJOR.MINOR.PATCH"
            exit 1
          fi
          echo "Tag $TAG is valid"

  e2e-gate:
    needs: validate-tag
    uses: ./.github/workflows/e2e.yml
    secrets: inherit

  deploy-production:
    needs: e2e-gate
    uses: ./.github/workflows/deploy-functions.yml
    with:
      environment: production
    secrets: inherit

  create-github-release:
    needs: deploy-production
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
          draft: false
```

---

## 6.16.6 — `local.settings.example.json`

Create this file at `backend/functions/local.settings.example.json` and add `local.settings.json` to `.gitignore` if not already present:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "WEBSITE_NODE_DEFAULT_VERSION": "~20",
    "AZURE_TENANT_ID": "<your-tenant-id>",
    "AZURE_CLIENT_ID": "<app-registration-client-id>",
    "AZURE_CLIENT_SECRET": "<app-registration-client-secret-for-local-dev>",
    "AZURE_STORAGE_CONNECTION_STRING": "UseDevelopmentStorage=true",
    "AzureSignalRConnectionString": "<signalr-connection-string>",
    "APPLICATIONINSIGHTS_CONNECTION_STRING": "<app-insights-connection-string>",
    "SHAREPOINT_TENANT_URL": "https://hbconstruction.sharepoint.com",
    "SHAREPOINT_HUB_SITE_ID": "<hub-site-guid>",
    "HBC_ADAPTER_MODE": "mock",
    "PROVISIONING_STEP5_TIMEOUT_MS": "90000"
  }
}
```

**Note:** `HBC_ADAPTER_MODE=mock` is the safe default for local dev. Set it to `real` only when doing full integration testing against the SharePoint test tenant.

---

## 6.16.7 — ADR Inventory (Phase 6)

All Phase 6 Architecture Decision Records must exist and be committed before production deployment:

| ADR File | Title | Status |
|---|---|---|
| `docs/architecture/adr/0060-project-identifier-model.md` | Project Identifier Model — projectId + projectNumber | Accepted |
| `docs/architecture/adr/0061-provisioning-package-boundary.md` | @hbc/provisioning Package Boundary | Accepted |
| `docs/architecture/adr/0062-bearer-token-managed-identity.md` | Bearer Token Auth + Managed Identity for SharePoint | Accepted |
| `docs/architecture/adr/0063-signalr-per-project-groups.md` | SignalR Per-Project Groups for Provisioning Progress | Accepted |

Verify all four exist:
```bash
ls docs/architecture/adr/0060-project-identifier-model.md
ls docs/architecture/adr/0061-provisioning-package-boundary.md
ls docs/architecture/adr/0062-bearer-token-managed-identity.md
ls docs/architecture/adr/0063-signalr-per-project-groups.md
```

If any ADR was not created during its corresponding task phase, create it now using the templates from PH6.1, PH6.2, and PH6.7 as references.

---

## 6.16.8 — How-To Guides (Diátaxis: Goal-Oriented)

Create the following files in `docs/how-to/`:

---

### `docs/how-to/developer/local-dev-setup.md`

```markdown
# How to Set Up Local Development for Phase 6

## Prerequisites
- Node.js 20 LTS installed
- pnpm 9+ installed (`npm install -g pnpm`)
- [Azure Functions Core Tools v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local) installed
- [Azurite](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite) installed (`npm install -g azurite`)
- Access to the HB Construction SharePoint tenant (for real-mode testing only)

## Step 1 — Clone and install
```bash
git clone https://github.com/hbconstruction/hb-intel.git
cd hb-intel
pnpm install
```

## Step 2 — Configure local settings
```bash
cp backend/functions/local.settings.example.json backend/functions/local.settings.json
```
Edit `local.settings.json` and fill in your Entra ID credentials. Leave `HBC_ADAPTER_MODE=mock` for day-to-day development.

## Step 3 — Start Azurite
```bash
azurite --location ~/.azurite
```
Leave this terminal open. Azurite emulates Azure Table Storage and Blob Storage locally.

## Step 4 — Start the Functions host
```bash
cd backend/functions
pnpm start
```
The Functions host starts on `http://localhost:7071`.

## Step 5 — Run unit tests
```bash
pnpm turbo run test --filter=backend-functions --filter=@hbc/provisioning
```

## Switching to Real SharePoint (integration testing)
Set `HBC_ADAPTER_MODE=real` in `local.settings.json` and provide real Azure credentials for the test app registration (`AZURE_CLIENT_ID_TEST`, `AZURE_CLIENT_SECRET_TEST`). Tests will run against `https://hbconstruction.sharepoint.com/sites/hb-intel-test`.
```

---

### `docs/how-to/developer/ci-secrets.md`

```markdown
# How to Configure GitHub Actions Secrets

This guide is for the CI/CD administrator. All secrets must be set before any deployment workflow can succeed.

## Required Secrets

| Secret Name | Where to find the value |
|---|---|
| `AZURE_TENANT_ID` | Azure Portal → Microsoft Entra ID → Overview → Tenant ID |
| `AZURE_CLIENT_ID` | Azure Portal → App Registrations → hb-intel-functions → Application (client) ID |
| `AZURE_CLIENT_SECRET` | Azure Portal → App Registrations → hb-intel-functions → Certificates & secrets → New client secret |
| `AZURE_CLIENT_ID_TEST` | Same as above but for the test app registration (`hb-intel-functions-test`) |
| `AZURE_CLIENT_SECRET_TEST` | Same as above |
| `AZURE_SUBSCRIPTION_ID` | Azure Portal → Subscriptions → your subscription → Subscription ID |
| `AZURE_RESOURCE_GROUP` | Azure Portal → Resource groups → the production resource group name |
| `AZURE_FUNCTIONAPP_NAME_STAGING` | Azure Portal → Function Apps → staging app → name |
| `AZURE_FUNCTIONAPP_NAME_PROD` | Azure Portal → Function Apps → production app → name |
| `SHAREPOINT_TENANT_URL` | Always `https://hbconstruction.sharepoint.com` |
| `SHAREPOINT_HUB_SITE_ID` | SharePoint Admin Center → Active sites → HB Intel hub → GUID in URL |
| `SHAREPOINT_TEST_SITE_COLLECTION` | Full URL of the dedicated test site collection |
| `STAGING_ESTIMATING_URL` | Full URL of the staging Estimating SPFx app deployment |
| `STAGING_ACCOUNTING_URL` | Full URL of the staging Accounting SPFx app deployment |

## How to add a secret
1. Go to the GitHub repository → Settings → Secrets and variables → Actions.
2. Click **New repository secret**.
3. Enter the name exactly as shown above.
4. Paste the value and click **Add secret**.

## Rotating secrets
When a client secret expires, generate a new one in Azure Portal, then update the GitHub secret value. The workflow will automatically use the new value on the next run.
```

---

### `docs/how-to/developer/spfx-signalr-auth.md`

This file was defined in PH6.7 (section 6.7.5). Verify it was created during that phase. If not, create it now with the SPFx `AadHttpClient` negotiate pattern and reconnection strategy documented in PH6.7.5.

---

### `docs/how-to/administrator/create-sharepoint-lists.md`

```markdown
# How to Create the Required SharePoint Lists

Phase 6 requires two SharePoint lists to be manually created in the tenant before provisioning can run.

## List 1: Projects (root site collection)

Create this list at the root of the HB Intel hub site collection.

1. Navigate to `https://hbconstruction.sharepoint.com/sites/hb-intel`.
2. Click the gear icon → **Add an app** → **Custom List**.
3. Name the list **Projects**.
4. After creation, go to **List Settings** → **Create Column** and add the following columns:

| Column Name | Type | Required | Notes |
|---|---|---|---|
| ProjectId | Single line of text | Yes | UUID v4, no spaces |
| ProjectNumber | Single line of text | No | Format: ##-###-## |
| ProjectName | Single line of text | Yes | |
| ProjectLocation | Single line of text | No | |
| ProjectType | Single line of text | No | |
| ProjectStage | Choice | Yes | Options: Pursuit, Active |
| RequestState | Single line of text | Yes | See state machine |
| SubmittedBy | Single line of text | Yes | UPN |
| SubmittedAt | Date and Time | Yes | ISO format |
| GroupMembers | Multiple lines of text | No | JSON array of UPNs |
| ProjectNumber | Single line of text | No | ##-###-## |
| ClarificationNote | Multiple lines of text | No | |
| CompletedBy | Single line of text | No | UPN |
| CompletedAt | Date and Time | No | |
| ProvisioningStatus | Single line of text | No | |
| SiteUrl | Single line of text | No | |

## List 2: ProvisioningAuditLog (root site collection)

1. Navigate to `https://hbconstruction.sharepoint.com/sites/hb-intel`.
2. Click the gear icon → **Add an app** → **Custom List**.
3. Name the list **ProvisioningAuditLog**.
4. Add the following columns:

| Column Name | Type | Required |
|---|---|---|
| ProjectId | Single line of text | Yes |
| ProjectNumber | Single line of text | No |
| ProjectName | Single line of text | Yes |
| CorrelationId | Single line of text | Yes |
| Event | Choice | Yes | Options: Started, Completed, Failed |
| TriggeredBy | Single line of text | Yes |
| SubmittedBy | Single line of text | Yes |
| Timestamp | Date and Time | Yes |
| SiteUrl | Single line of text | No |
| ErrorSummary | Multiple lines of text | No |

## Permissions
Both lists should inherit permissions from the site collection. The Managed Identity used by the Function App must have **Full Control** on the site collection (granted via Microsoft Graph `Sites.FullControl.All` — see PH6.2).
```

---

## 6.16.9 — Reference Documentation (Diátaxis: Technical Facts)

Create the following reference files:

---

### `docs/reference/provisioning/state-machine.md`

```markdown
# Provisioning State Machine Reference

## Project Setup Request States

| State | Description | Who can enter it |
|---|---|---|
| `Submitted` | Estimating Coordinator has submitted the request | System (on form submit) |
| `UnderReview` | Controller has opened the request | Controller |
| `NeedsClarification` | Controller requires more information | Controller |
| `AwaitingExternalSetup` | Controller is completing external system setup | Controller |
| `ReadyToProvision` | External setup complete, projectNumber assigned | Controller |
| `Provisioning` | Saga is actively running | System (on saga trigger) |
| `Completed` | All 7 steps completed successfully | System (on saga completion) |
| `Failed` | Saga failed and compensation ran | System (on saga failure) |

## Valid Transitions

| From | To | Actor |
|---|---|---|
| `Submitted` | `UnderReview` | Controller |
| `UnderReview` | `NeedsClarification` | Controller |
| `UnderReview` | `AwaitingExternalSetup` | Controller |
| `NeedsClarification` | `UnderReview` | Controller |
| `AwaitingExternalSetup` | `ReadyToProvision` | Controller (requires valid projectNumber) |
| `ReadyToProvision` | `Provisioning` | System |
| `Provisioning` | `Completed` | System |
| `Provisioning` | `Failed` | System |
| `Failed` | `Provisioning` | Admin (via retry) |

## Provisioning Saga Overall Status Values

`NotStarted` | `InProgress` | `BaseComplete` | `WebPartsPending` | `Completed` | `Failed`

## Saga Step Status Values

`NotStarted` | `InProgress` | `Completed` | `Failed` | `Skipped` | `DeferredToTimer`
```

---

### `docs/reference/provisioning/saga-steps.md`

```markdown
# Provisioning Saga Steps Reference

| Step | Name | Description | Compensation |
|---|---|---|---|
| 1 | Create Site | Creates SharePoint site from projectNumber + projectName | Delete site |
| 2 | Create Document Library | Creates "Project Documents" library | None (site deletion handles it) |
| 3 | Upload Template Files | Copies template documents from template library | None |
| 4 | Create Data Lists | Creates all HB Intel data lists per list definitions | None |
| 5 | Install Web Parts | Installs SPFx web parts; may defer to 1AM timer | None (deferred, not compensated) |
| 6 | Set Permissions | Breaks inheritance, sets role-based access | Restore inheritance |
| 7 | Associate Hub | Associates the new site with the HB Intel hub site | Disassociate |

## Idempotency Guarantee
Every step checks whether it has already been completed in Azure Table Storage before executing. If the step is found with status `Completed`, it is skipped with `idempotentSkip: true`. This makes the entire saga safe to retry.

## Step 5 Special Behavior
Step 5 uses a 90-second timeout (`PROVISIONING_STEP5_TIMEOUT_MS`). If the timeout is exceeded after 2 attempts, the step is recorded as `DeferredToTimer` and the overall saga status becomes `WebPartsPending`. The 1:00 AM EST timer trigger (`timerInstallWebParts`) will retry step 5 for all deferred jobs.

## Retry Policy
Each step uses `withRetry` with up to 3 attempts and exponential backoff (2s, 4s, 8s). Transient errors (HTTP 429, throttle, network reset) are retried. Non-transient errors (400, 403, 404) fail immediately.
```

---

### `docs/reference/provisioning/roles-permissions.md`

```markdown
# Provisioning Roles and Permissions Reference

## Role Definitions

| Role | SharePoint Access | Receives Notifications | Sees Full Checklist |
|---|---|---|---|
| **Admin** | Read-only to all sites | Yes — all projects | Yes — all projects |
| **Leadership** | Read-only to all sites | No | No |
| **Shared Services** | Read + limited write on all sites | No | No |
| **OpEx** | Full read/write on all sites | Yes — start/finish only | No |
| **Pursuit Team** | Full read/write on designated site | Yes — start/finish only | No |
| **Project Team** | Full read/write on designated site | Yes — start/finish only | No |

## Who Sees the Full 7-Step Checklist
Only two groups see the full provisioning checklist:
1. **Admin role users** — for any project, always.
2. **The Estimating Coordinator who submitted the request** — for their own request only (submitter-based, not role-based).

All other users with notification entitlement receive only "Provisioning started" and "Provisioning complete / site is ready" banners.

## Notification Text Strings

**Provisioning started:**
> "Your SharePoint site for [projectName] has started being created."

**Provisioning complete:**
> "Your SharePoint site for [projectName] is ready."

**Provisioning failed:**
> "There was a problem setting up the SharePoint site for [projectName]. Your administrator has been notified."

## OpEx Manager Default Inclusion
The OpEx Manager UPN is always included in `groupMembers` at the time the Estimating Coordinator submits the request. This is enforced in the `NewRequestPage` component and in the `submitProjectSetupRequest` API handler.
```

---

## 6.16.10 — Explanation Documentation (Diátaxis: Conceptual Understanding)

Create the following file:

**`docs/explanation/provisioning-architecture.md`:**

```markdown
# Provisioning Architecture — How It Works

## Overview
The Phase 6 provisioning system automates the creation and configuration of SharePoint project sites. When a new construction project is approved, the system automatically creates the site, sets up document libraries and data lists, installs the HB Intel web parts, sets the correct permissions for every team member, and connects the site to the HB Intel hub. The entire process takes approximately 5–10 minutes for steps 1–4 and 6–7; step 5 (web parts) may run at 1:00 AM EST if it cannot complete in the initial window.

## Why a Class-Based Saga Orchestrator?
The provisioning workflow must be transactional: if step 3 fails, steps 1 and 2 must be rolled back (compensation). Azure Durable Functions would add significant operational complexity (new SDK surface area, separate storage, debugging challenges). A class-based `SagaOrchestrator` running inside a regular Azure Function achieves the same durability through Azure Table Storage checkpointing with none of the overhead. Every step writes its completion status before moving to the next step, making the entire saga resumable from any point.

## Why Two Identifiers?
`projectId` is a UUID v4 generated the moment the Estimating Coordinator submits a Project Setup Request. It never changes and is never shown to end users. It is used as the primary database key and in all internal system references. `projectNumber` (format: `##-###-##`) is entered by the Controller after the project is registered in Sage Intacct and Procore. It appears in SharePoint site URLs and titles because it is the canonical business reference number. Separating these two concerns eliminates the `projectCode` ambiguity that existed in Phase 5.

## Why Azure Table Storage + SharePoint Audit Log?
Azure Table Storage provides fast, cheap, structured persistence for every step state change during the provisioning run. It is the system of record for the saga. SharePoint's `ProvisioningAuditLog` list provides a human-readable, business-accessible audit trail of lifecycle events (Started, Completed, Failed) stored directly in the platform where project sites live. Writing to both stores gives operations staff a place to look without needing database access.

## How Real-Time Progress Works
When the saga begins, the front-end calls the `/api/provisioning-negotiate` endpoint with a Bearer token and `?projectId=`. The negotiate endpoint validates the token, determines which SignalR groups the user belongs to (`provisioning-{projectId}` for all project members; `provisioning-admin` for admins), and returns a connection token. The SignalR client connects and listens for `provisioningProgress` events. Each time a step completes or fails, the saga pushes a `IProvisioningProgressEvent` to the per-project group and to `provisioning-admin`. When the saga reaches a terminal state (Completed or Failed), the per-project group is closed.

## The Step 5 Problem
Installing SPFx web parts requires an App Catalog deployment and site-level installation that can take 30–180 seconds depending on SharePoint service load. This is too slow and too unpredictable to block the entire saga. The solution is a split approach: attempt step 5 immediately with a 90-second timeout and 2 retries. If it succeeds, great. If not, the saga records `step5DeferredToTimer`, sets overall status to `WebPartsPending`, and continues to steps 6 and 7. The 1:00 AM EST timer trigger picks up all `WebPartsPending` jobs and retries step 5 when SharePoint service load is minimal.
```

---

## 6.16.11 — Maintenance Runbooks

**`docs/maintenance/provisioning-runbook.md`:**

```markdown
# Provisioning System Operations Runbook

## Daily Checks
- Verify the 1:00 AM timer trigger ran: Application Insights → Logs → query `customEvents | where name == "ProvisioningStep5TimerCompleted"`.
- Check for stuck runs (overall status `InProgress` for >30 minutes): the Application Insights alert "Provisioning Run Stuck >30min" fires automatically.

## How to Manually Retry a Failed Provisioning Run
1. Navigate to the Accounting app → Project Setup Requests → find the failed project.
2. Click the **Retry** button (requires Admin role).
3. Monitor progress in real time on the same page.

## How to Escalate a Stuck Run
1. An alert email is sent automatically when a run exceeds 30 minutes.
2. An Admin user can click **Escalate** in the Accounting app to mark the run as requiring manual intervention.
3. This sets `overallStatus = 'Failed'` and triggers the failure alert.

## How to Check Azure Table Storage State
1. Open Azure Portal → Storage Accounts → the production storage account.
2. Navigate to **Tables** → `ProvisioningJobs`.
3. Find the row with `PartitionKey = {projectId}` and `RowKey = {correlationId}`.
4. The `stepsJson` column contains the full step history as a JSON string.

## How to Re-run Step 5 Manually
If the timer trigger fails to install web parts:
1. Confirm the App Catalog has the correct `.sppkg` deployed.
2. Call `POST /api/provisioning-retry` with `{ "projectId": "..." }` using an Admin token.
3. The saga will resume from the last successful step (steps 1–4 and 6–7 already completed; only step 5 will run).

## Alert Thresholds
- **Stuck run:** Overall status `InProgress` for >30 minutes → Severity 2 alert.
- **Timer failure:** No `ProvisioningStep5TimerCompleted` event within 2 hours of midnight EST → Severity 1 alert.
```

---

## 6.16.12 — Release Sign-Off Checklist

Before tagging a `v*` release, a designated reviewer must confirm each item:

**Infrastructure**
- [ ] Azure Function App (production) has `WEBSITE_TIME_ZONE=Eastern Standard Time` configured.
- [ ] Azure Function App (production) has `HBC_ADAPTER_MODE=real` set (or variable absent, which defaults to real).
- [ ] Managed Identity on the production Function App has `Sites.FullControl.All` via Graph.
- [ ] Azure SignalR Service (Standard tier) is provisioned and connection string is set in production App Settings.
- [ ] Application Insights connected and alert rules active (stuck run + timer failure).
- [ ] `ProvisioningAuditLog` list exists in the production SharePoint hub site collection.
- [ ] `Projects` list exists in the production SharePoint hub site collection.

**Code & Tests**
- [ ] `pnpm turbo run build` exits 0 on `main`.
- [ ] Unit test coverage ≥ 80% on `backend/functions/src/` and `packages/provisioning/src/`.
- [ ] All 5 smoke tests pass against `https://hbconstruction.sharepoint.com/sites/hb-intel-test`.
- [ ] All Playwright E2E tests pass against the staging Function App URL.
- [ ] Zero occurrences of `projectCode` in any `.ts` or `.tsx` file.

**ADRs & Documentation**
- [ ] ADR-0060, ADR-0061, ADR-0062, ADR-0063 all exist and are committed.
- [ ] `docs/how-to/developer/local-dev-setup.md` exists.
- [ ] `docs/how-to/developer/ci-secrets.md` exists.
- [ ] `docs/how-to/developer/spfx-signalr-auth.md` exists.
- [ ] `docs/how-to/administrator/create-sharepoint-lists.md` exists.
- [ ] `docs/reference/provisioning/state-machine.md` exists.
- [ ] `docs/reference/provisioning/saga-steps.md` exists.
- [ ] `docs/reference/provisioning/roles-permissions.md` exists.
- [ ] `docs/explanation/provisioning-architecture.md` exists.
- [ ] `docs/maintenance/provisioning-runbook.md` exists.
- [ ] `backend/functions/local.settings.example.json` exists and is committed.

**Functionality (manual verification)**
- [ ] Estimating Coordinator can submit a new Project Setup Request from the Estimating app.
- [ ] Controller receives the request in the Accounting app and can advance through all 7 states.
- [ ] "Complete Project Setup" button is disabled until a valid `##-###-##` project number is entered.
- [ ] Provisioning saga triggers automatically when state transitions to `ReadyToProvision`.
- [ ] Real-time progress appears in the Estimating app for the request submitter.
- [ ] Only the submitter and Admin see the 7-step checklist; all others see start/finish banners only.
- [ ] "Open Project Site" link appears after `Completed` status.
- [ ] Failed run is retryable from the Accounting app Admin view.
- [ ] Step 5 deferred-to-timer path: `step5DeferredToTimer` flag set in Azure Table and `WebPartsPending` status shown.
- [ ] Timer trigger picks up `WebPartsPending` jobs and completes step 5.

---

## 6.16 Success Criteria Checklist

- [ ] 6.16.1 All 14 GitHub secrets documented in `docs/how-to/developer/ci-secrets.md` and configured in the repository.
- [ ] 6.16.2 Three-environment strategy documented; `local.settings.example.json` created and committed.
- [ ] 6.16.3 `deploy-functions.yml` workflow created; deploys to staging on push to `main`; deploys to production on `v*` tags after E2E gate.
- [ ] 6.16.4 `ci.yml` workflow runs lint, type-check, and unit tests on every PR and push to `main`.
- [ ] 6.16.5 `release.yml` workflow validates tag format, runs E2E gate, deploys to production, creates GitHub Release.
- [ ] 6.16.6 `local.settings.example.json` created with all required keys and safe defaults.
- [ ] 6.16.7 All four ADRs (0060–0063) committed to `docs/architecture/adr/`.
- [ ] 6.16.8 How-to guides created: `local-dev-setup.md`, `ci-secrets.md`, `spfx-signalr-auth.md`, `create-sharepoint-lists.md`.
- [ ] 6.16.9 Reference docs created: `state-machine.md`, `saga-steps.md`, `roles-permissions.md`.
- [ ] 6.16.10 Explanation doc created: `provisioning-architecture.md`.
- [ ] 6.16.11 Maintenance runbook created: `provisioning-runbook.md`.
- [ ] 6.16.12 Release sign-off checklist reviewed and all items checked before tagging `v*`.

## PH6.16 Progress Notes

_(To be completed during implementation)_

### Verification Evidence

- `ls .github/workflows/ci.yml .github/workflows/deploy-functions.yml .github/workflows/release.yml` → all present — PASS / FAIL
- `ls docs/architecture/adr/006{0,1,2,3}*.md` → 4 files — PASS / FAIL
- `ls docs/how-to/developer/local-dev-setup.md docs/how-to/developer/ci-secrets.md` → present — PASS / FAIL
- `ls docs/reference/provisioning/state-machine.md docs/reference/provisioning/saga-steps.md` → present — PASS / FAIL
- GitHub Actions CI workflow run on `main` → green — PASS / FAIL
- Staging deploy workflow triggered on merge to `main` → green — PASS / FAIL
- Full release sign-off checklist reviewed and all boxes checked — PASS / FAIL
