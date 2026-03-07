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
    "SHAREPOINT_HUB_SITE_ID": "<hub-site-id>",
    "PROVISIONING_STEP5_TIMEOUT_MS": "90000",
    "ADMIN_SIGNALR_GROUP": "provisioning-admin"
  }
}
```

### Managed Identity vs Local Credentials

- Production uses system-assigned Managed Identity with `DefaultAzureCredential`.
- Local development uses a developer service principal (`AZURE_CLIENT_SECRET`) because IMDS is not available locally.
- Keep `HBC_SERVICE_MODE=mock` for normal local development unless explicitly testing the azure adapter path.
