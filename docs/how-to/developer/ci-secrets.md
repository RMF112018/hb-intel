# How to Configure GitHub Actions Secrets

**Traceability:** D-PH6-16

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
