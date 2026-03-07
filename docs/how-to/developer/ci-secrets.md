# CI Secrets Reference

## Purpose

D-PH6-15 documentation for GitHub Actions secrets required by Layer 1 (unit), Layer 2 (smoke), and Layer 3 (E2E) provisioning test workflows.

## Required Secrets

- `AZURE_TENANT_ID`: Microsoft Entra tenant ID for test and smoke authentication.
- `AZURE_CLIENT_ID_TEST`: App registration client ID used by smoke tests.
- `AZURE_CLIENT_SECRET_TEST`: App registration client secret used by smoke tests.
- `SHAREPOINT_TENANT_URL`: SharePoint tenant root URL, for example `https://hbconstruction.sharepoint.com`.
- `SHAREPOINT_HUB_SITE_ID`: Hub site GUID used in Step 7 smoke coverage.
- `SHAREPOINT_TEST_SITE_COLLECTION`: Dedicated smoke-test site collection URL.
- `SHAREPOINT_APP_CATALOG_URL`: Tenant app catalog URL used by provisioning setup.
- `HB_INTEL_SPFX_APP_ID`: SPFx app ProductId for web part install scenarios.
- `STAGING_ESTIMATING_URL`: Deployed staging URL for estimating app E2E runs.
- `STAGING_ACCOUNTING_URL`: Deployed staging URL for accounting app E2E runs.

## Workflow Mapping

- `ci.yml` (Layer 1): uses local Azurite and does not require production secrets for table tests.
- `smoke-tests.yml` (Layer 2): requires SharePoint and Entra secrets listed above.
- `e2e.yml` (Layer 3): requires staging app URLs to execute the provisioning journey.
