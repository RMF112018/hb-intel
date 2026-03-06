# Phase 7: Azure Functions Backend — Developer Guide

## Overview

Phase 7 introduces `backend/functions/` as an Azure Functions v4 Node.js serverless app. It provides three capabilities:

1. **Provisioning Saga** — 7-step project site creation with compensation, retry, and escalation
2. **Proxy Layer** — Secure cache-through proxy for SharePoint/Graph API with MSAL on-behalf-of
3. **Real-time Updates** — SignalR push for provisioning progress events

## Prerequisites

- Node.js >= 18.17.0
- pnpm 9.x
- Azure Functions Core Tools v4 (optional, for local runtime)

## Project Structure

```
backend/functions/
├── package.json              # @hbc/functions
├── tsconfig.json             # Node16 module, no DOM
├── host.json                 # Azure Functions v2.0 config
├── local.settings.json       # Dev env vars (HBC_SERVICE_MODE=mock)
└── src/
    ├── index.ts              # Entry — imports trigger registrations
    ├── functions/
    │   ├── provisioningSaga/ # POST/GET provisioning endpoints
    │   ├── proxy/            # GET/POST proxy catch-all
    │   ├── timerFullSpec/    # 1:00 AM EST timer for deferred step 5
    │   └── signalr/          # SignalR negotiate endpoint
    ├── services/             # Port interfaces + mock implementations
    └── utils/                # Logger + env helpers
```

## Building

```bash
# Build backend only
pnpm turbo run build --filter=@hbc/functions

# Full monorepo build (21 tasks)
pnpm turbo run build
```

The backend compiles with `tsc` to `dist/`. No bundler is needed for Azure Functions.

## Service Mode

The `HBC_SERVICE_MODE` environment variable controls which service implementations are used:

| Value | Behavior |
|---|---|
| `mock` (default) | In-memory mocks — no Azure dependencies needed |
| `azure` | Real Azure implementations (not yet implemented) |

Set in `local.settings.json` for local development.

## API Endpoints

### Provisioning Saga

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/provision-project-site` | Start provisioning (returns 202) |
| `GET` | `/api/provisioning-status/{projectCode}` | Poll status |
| `POST` | `/api/provisioning-retry/{projectCode}` | Retry from failed step |
| `POST` | `/api/provisioning-escalate/{projectCode}` | Escalate to admin |

**POST /api/provision-project-site** request body:
```json
{
  "projectCode": "PRJ-A1B2C3",
  "projectName": "Downtown Tower",
  "triggeredBy": "user@contoso.com",
  "templateId": "standard-commercial",
  "hubSiteUrl": "https://contoso.sharepoint.com/sites/hub"
}
```

### Proxy

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/proxy/{*path}` | Cached proxy to Graph API |
| `POST/PATCH/PUT/DELETE` | `/api/proxy/{*path}` | Pass-through proxy |

Requires `Authorization: Bearer <token>` header. The proxy acquires an OBO token and forwards to the target API.

### SignalR

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/signalr/negotiate` | Get SignalR connection info |

## Saga Execution Flow

### Immediate Steps (synchronous)
1. **Create Site** — SharePoint site creation
2. **Document Library** — Project Documents library
3. **Template Files** — Upload template files
4. **Data Lists** — Create 8 data lists (Submittals, RFIs, Change Orders, etc.)
6. **Permissions** — Configure site permissions
7. **Hub Association** — Associate with hub site

### Deferred Step
5. **Web Parts** — Skipped during immediate execution, processed by 1:00 AM EST timer

### Compensation (Rollback)
On failure, steps are rolled back in reverse order. Step 1 compensation (site deletion) cascades removal of all child resources.

## Adding a Real Service Implementation

1. Create a class implementing the port interface (e.g., `AzureSharePointService implements ISharePointService`)
2. Update `service-factory.ts` to instantiate it when `HBC_SERVICE_MODE === 'azure'`
3. Add required environment variables to `local.settings.json`

## timerFullSpec — Deferred Provisioning Timer (PH4B.10 §4b.10.5)

The `timerFullSpec` Azure Function runs on a cron schedule to process deferred full-spec (step 5) projects:

| Property | Value |
|----------|-------|
| Trigger | Timer (cron) |
| Schedule | `0 0 6 * * *` (6:00 AM UTC = 1:00 AM EST) |
| Purpose | Processes projects deferred at step 5 (web parts) for provisioning |
| SignalR payload | `IProvisioningProgressEvent` from `@hbc/models` |

### SignalR Reconnect-on-Focus Pattern

Field workers frequently background the app (phone calls, camera, etc.). When the app returns to foreground, the SignalR connection must reconnect to receive pending provisioning events.

```ts
// apps/hb-site-control/src/hooks/useSignalR.ts
// Phase 6 mock implementation — pauses/resumes setInterval
// Phase 7: replace with hubConnection.start() / .stop()

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause: clear interval / stop connection
    stopInterval();
    setIsConnected(false);
  } else {
    // Resume: restart interval / reconnect
    setTimeout(() => {
      setIsConnected(true);
      startInterval();
    }, 300);
  }
});
```

In Phase 7 with real `@microsoft/signalr`, replace `startInterval()`/`stopInterval()` with `hubConnection.start()`/`hubConnection.stop()`.

## Shared Types

Provisioning domain types live in `packages/models/src/provisioning/index.ts` and are shared between frontend and backend:

- `IProvisioningStatus` — Full provisioning state
- `IProvisionSiteRequest` — Request to start provisioning
- `IProvisioningProgressEvent` — SignalR push event
- `ISagaStepResult` — Individual step result
- `IProvisioningEscalation` — Escalation request
