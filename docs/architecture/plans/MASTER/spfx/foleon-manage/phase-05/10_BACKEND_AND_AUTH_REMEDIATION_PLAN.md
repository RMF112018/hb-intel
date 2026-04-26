# 10 — Backend and Auth Remediation Plan

## Objectives

- Make Foleon Manager write-readiness deterministic.
- Source safe configuration from the HB Platform Configuration Registry.
- Preserve backend-only handling of Foleon OAuth/client secrets.
- Preserve safe blocked states when configuration is missing or invalid.
- Avoid spreading new page-level properties as the primary fix.

## Current Backend Routes

The backend already exposes Foleon administrative routes for:

```text
GET    /api/foleon/content
POST   /api/foleon/content
PATCH  /api/foleon/content/{id}
POST   /api/foleon/content/{id}/validate
POST   /api/foleon/content/{id}/publish
POST   /api/foleon/content/{id}/suppress
GET    /api/foleon/placements
POST   /api/foleon/placements
PATCH  /api/foleon/placements/{id}
DELETE /api/foleon/placements/{id}
POST   /api/foleon/sync/docs
POST   /api/foleon/sync/projects
GET    /api/foleon/sync/status
GET    /api/foleon/sync/runs
POST   /api/foleon/provision-sharepoint
POST   /api/foleon/validate-sharepoint
GET    /api/foleon/config
```

The target is not to invent new Foleon content routes unless registry validation requires a narrow endpoint.

## Required New Capability

Add or identify a shared registry reader pattern that can resolve safe non-secret values from `HB Platform Configuration Registry`.

Candidate capabilities:

```text
- registry read service in packages/sharepoint-platform or packages/provisioning
- backend safe registry validation route
- SPFx runtime bridge that reads registry values before constructing Foleon mount config
- config source proof included in runtime diagnostics
```

## Runtime Precedence

Implement deterministic config precedence:

```text
1. Explicit page/webpart override
2. Active registry value
3. Build-time/package default
4. Safe blocked state with diagnostics
```

## Foleon Manager Required Runtime Values

The Manager should resolve the following through the registry or explicit override:

```text
contentRegistryListId
placementsListId
eventsListId
foleonApiBaseUrl
foleonApiResource
acceptedFoleonOrigins
allowPreview
expectedManifestId
expectedPackageVersion
foleonReaderRoutePath
```

## Backend Secret Boundary

The registry may contain references to:

```text
HB_FOLEON_CLIENT_SECRET
HB_FOLEON_CLIENT_ID
HB_FOLEON_TOKEN_URL
HB_FOLEON_DOCS_URL
HB_FOLEON_PROJECTS_URL
```

The backend remains responsible for resolving actual secret values from environment variables, Key Vault, App Configuration, or app settings. The SPFx frontend must never receive secrets.

## Token Provider Remediation

The token provider is created only when `foleonApiResource` exists and SPFx can acquire an AAD token provider.

Remediation must:

- surface `foleonApiResource` from registry or explicit override;
- show token-provider readiness in the Config tab;
- preserve blocked state when token acquisition fails;
- include a correlation ID in any failed backend request;
- avoid logging bearer tokens.

## Safe Config Endpoint Use

The Manager Config tab should consume `/api/foleon/config` to determine backend readiness booleans, not to retrieve secrets.

## Acceptance Criteria

- Valid registry records can make the Manager write-capable without page-local backend fields.
- Missing registry records produce actionable readiness warnings.
- Duplicate active registry keys produce a blocked Config tab state.
- Backend safe-config status appears in the Config tab.
- Secrets are never exposed to SPFx.
