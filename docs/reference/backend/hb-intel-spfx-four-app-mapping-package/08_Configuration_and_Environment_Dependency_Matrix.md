# 08 — Configuration and Environment Dependency Matrix

## Shared environment/config dependencies relevant to this subset

| Setting / config seam | Estimating | Accounting | Admin | Project Sites | Role |
|---|---:|---:|---:|---:|---|
| `functionAppUrl` runtime injection | yes | yes | indirect / env-based page usage | no | API base URL |
| `apiAudience` runtime injection | yes | yes | not confirmed in fetched admin page | no | audience-scoped token acquisition |
| `VITE_FUNCTION_APP_URL` | yes (fallback) | yes (fallback) | yes (page reads it) | no | dev/runtime API URL |
| `VITE_API_AUDIENCE` | yes | yes | not confirmed in fetched admin page | no | dev/runtime API audience |
| `backendMode` / `ui-review` | yes | config exists, mock path not active in provider | not evidenced in fetched admin page | no | review-mode switching / live-mode guard |
| SPFx `webApiPermissionRequests` | yes | yes | no in manifest | no | explicit SPFx protected API declaration |
| SPFx context for SharePoint | indirect | indirect | not needed for fetched page | yes | direct SharePoint access |
| `AZURE_TENANT_ID` | backend | backend | backend | — | core backend startup |
| `AZURE_CLIENT_ID` | backend | backend | backend | — | core backend startup |
| `AZURE_TABLE_ENDPOINT` | backend | backend | backend | — | backend persistence |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | backend | backend | backend | — | telemetry |
| `HBC_ADAPTER_MODE` | backend | backend | backend | — | live/mock adapter mode |
| `API_AUDIENCE` | backend | backend | backend | — | JWT validation |
| `SHAREPOINT_TENANT_URL` | backend/provisioning docs | backend/provisioning docs | backend/provisioning docs | SPFx context path instead | SharePoint target tenant |
| `SHAREPOINT_PROJECTS_SITE_URL` | backend/provisioning docs | backend/provisioning docs | backend/provisioning docs | indirectly relevant | project registry site |
| department viewer env vars | provisioning | provisioning | admin diagnostics context | no direct runtime use | background access model |

## Confirmed configuration patterns

### Estimating
- runtime config singleton
- shell-injected `functionAppUrl`
- shell-injected or env-based `apiAudience`
- explicit readiness check for production mode
- `backendMode` supports `production` or `ui-review`

### Accounting
- runtime config singleton
- shell-injected `functionAppUrl`
- shell-injected or env-based `apiAudience`
- explicit readiness check for production mode
- backend provider says reviewer-only, with no app-local ui-review mock client

### Admin
- fetched provisioning oversight page directly reads `VITE_FUNCTION_APP_URL`
- page builds provisioning API client from session token factory + env URL
- current-state docs also confirm a separate Admin Control Plane host exists

### Project Sites
- no Functions-host runtime config needed for normal operation
- relies on SPFx context and PnPjs setup
- SharePoint list schema mapping is its most important runtime configuration dependency

## Best-practice validation notes

- Microsoft Learn confirms SPFx protected API access is declared through `webApiPermissionRequests`.
- PnPjs documents providing the SPFx context to `spfi().using(SPFx(context))`.
- Microsoft SharePoint guidance supports indexed/filter-driven large-list patterns, which aligns with the repo’s `pid` indexing doctrine.

## Configuration risks

| Risk | Why it matters | Severity |
|---|---|---|
| Admin manifest lacks explicit protected API permission declaration | may indicate hidden auth assumption or missing packaging contract | High |
| Project Sites depends on imported field schema | SharePoint schema drift could break directory surface | Medium-high |
| Different API token acquisition postures across Estimating / Accounting / Admin | can create environment-specific failures that are hard to diagnose | High |
| Shared data projection into Projects list not documented as a first-class config/data dependency | weakens operational setup and change control | Medium |
