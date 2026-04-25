# 02 — System Architecture

## Architecture overview

```text
SPFx Foleon Connector
  ↓ authenticated API calls
Azure Functions backend app
  ↓ Foleon OAuth client credentials
Foleon API
  ↓ mapped DTOs
Azure Functions backend app
  ↓ Microsoft Graph app/delegated write path
HBCentral SharePoint lists
  ↓ list GUID runtime config
Foleon Display App / Reader / Highlights / Content Hub
```

## Frontend responsibilities

The SPFx connector owns:

- premium admin experience;
- role-aware navigation display;
- form state and validation display;
- optimistic-but-safe UI state;
- calls to backend APIs;
- accessible dialogs/panels/overlays;
- zero direct Foleon credential handling;
- zero direct production list writes.

The SPFx connector may read from backend APIs only. Avoid direct SharePoint list reads in the connector except for diagnostics explicitly approved by the architecture.

## Backend responsibilities

The Azure Functions backend owns:

- Entra token validation / role checks;
- route-level authorization;
- Foleon OAuth token acquisition;
- Foleon API calls;
- DTO normalization;
- content validation;
- SharePoint list writes via Graph;
- list contract validation;
- eTag / concurrency protection;
- operational logging to `HB_FoleonSyncRuns`;
- telemetry ingestion if needed.

## SharePoint list responsibilities

SharePoint lists remain storage and reporting contracts:

- `HB_FoleonContentRegistry` — content source of truth for display app.
- `HB_FoleonHomepagePlacements` — editorial placement source of truth for highlights/homepage route.
- `HB_FoleonInteractionEvents` — display app telemetry, not connector user content.
- `HB_FoleonSyncRuns` — backend sync and operational log.

## Foleon API responsibilities

Foleon remains the content-authoring platform. The connector should not replicate Foleon authoring.

The integration should consume Foleon APIs for:

- Docs metadata;
- Projects/workspaces where available and useful;
- publishing and URL data where available;
- analytics in later phases.

## Safety-record workflow alignment

The Foleon connector should mirror the Safety Records posture:

- route gates are backend-enforced;
- privileged writes occur server-side;
- backend owns Graph permissions;
- user role claims control operations;
- validation is centralized;
- read-before-write/eTag protection prevents stale overwrite;
- operational proof is captured.

## Deployment surfaces

### Backend

Same Azure Functions app used by Safety Records.

Add route group:

```text
/api/foleon/*
```

### Frontend

Recommended options:

1. Extend `apps/hb-intel-foleon` with connector/admin route.
2. Create companion `apps/hb-foleon-connector` if domain separation is preferred.

Preferred starting point: extend the existing Foleon app package only if package boundaries remain clean and the admin surface can be permission-gated.

## Configuration

Backend environment variables should include:

```text
FOLEON_API_BASE_URL
FOLEON_CLIENT_ID
FOLEON_CLIENT_SECRET
FOLEON_ACCOUNT_ID
FOLEON_CLUSTER
FOLEON_ALLOWED_ORIGINS
FOLEON_CONNECTOR_ENABLED
HB_CENTRAL_SITE_ID
FOLEON_CONTENT_REGISTRY_LIST_ID
FOLEON_HOMEPAGE_PLACEMENTS_LIST_ID
FOLEON_INTERACTION_EVENTS_LIST_ID
FOLEON_SYNC_RUNS_LIST_ID
```

Secrets must live in Azure App Settings or Key Vault-backed settings, not SPFx.
