# Backend Functions

This package hosts HB Intel Azure Functions for provisioning and integration endpoints.

## Local Development Setup

`local.settings.json` is gitignored and must be created per developer machine.

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_TENANT_ID": "<your-tenant-id>",
    "AZURE_CLIENT_ID": "<app-registration-client-id>",
    "AZURE_CLIENT_SECRET": "<dev-service-principal-secret>",
    "AzureSignalRConnectionString": "<signalr-connection-string>",
    "AZURE_STORAGE_CONNECTION_STRING": "UseDevelopmentStorage=true",
    "SHAREPOINT_TENANT_URL": "https://hbconstruction.sharepoint.com",
    "SHAREPOINT_APP_CATALOG_URL": "https://hbconstruction.sharepoint.com/sites/appcatalog",
    "HB_INTEL_SPFX_APP_ID": "<hb-intel-spfx-product-id-guid>",
    "SHAREPOINT_HUB_SITE_ID": "<hub-site-id>",
    "OPEX_MANAGER_UPN": "opex.manager@hbconstruction.com",
    "PROVISIONING_STEP5_TIMEOUT_MS": "90000",
    "HBC_ADAPTER_MODE": "mock",
    "ADMIN_SIGNALR_GROUP": "provisioning-admin"
  }
}
```

### Managed Identity vs Local Credentials

- Production uses system-assigned Managed Identity with `DefaultAzureCredential`.
- Local development uses a developer service principal (`AZURE_CLIENT_SECRET`) because IMDS is not available locally.
- Keep `HBC_ADAPTER_MODE=mock` for normal local development unless explicitly testing the real adapter path.

### Phase 6.5 Environment Variables

- `SHAREPOINT_APP_CATALOG_URL`: Tenant app catalog URL used for Step 5 SPFx installation flow.
- `HB_INTEL_SPFX_APP_ID`: Product ID GUID of the HB Intel SPFx package in the App Catalog.
- `SHAREPOINT_HUB_SITE_ID`: Hub site GUID required for Step 7 association.
- `OPEX_MANAGER_UPN`: UPN of the OpEx manager always included in Step 6 permission assignment.
