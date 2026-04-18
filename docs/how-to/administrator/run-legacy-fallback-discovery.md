# Run Legacy Fallback Discovery (Prompt 04)

This runbook covers hosted execution of the legacy fallback discovery pipeline for Project Sites.

## Host target

Prompt 04 closure target is the existing hosted Function App lane (`hb-intel-function-app`) while dedicated Prompt 03 hosting constraints are remediated.

## Discovery endpoints

- HTTP trigger: `POST /api/admin/legacy-fallback/discovery/run`
- Timer trigger: `legacyFallbackDiscoveryTimer` (gated by config)

## Required configuration

In Function App settings:

- `HBC_LEGACY_FALLBACK_ENABLED=true`
- `HBC_LEGACY_FALLBACK_DISCOVERY_ENABLED=true`
- `HBC_LEGACY_FALLBACK_AUTH_POSTURE=pilot-interim`
- `HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID=08c399eb-a394-4087-b859-659d493f8dc7`
- `HBC_LEGACY_FALLBACK_GRAPH_SCOPE=https://graph.microsoft.com/.default`
- `HBC_LEGACY_FALLBACK_HBCENTRAL_SITE_URL=https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- `SHAREPOINT_TENANT_URL=https://hedrickbrotherscom.sharepoint.com`
- `AZURE_TENANT_ID=<tenant-id>`
- `AZURE_CLIENT_ID=<managed-identity-client-id>`

Optional discovery controls:

- `HBC_LEGACY_FALLBACK_DISCOVERY_TIMER_ENABLED=true|false`
- `HBC_LEGACY_FALLBACK_DISCOVERY_YEARS=2024,2025`
- `HBC_LEGACY_FALLBACK_DISCOVERY_MAX_FOLDERS_PER_RUN=5000`

## Run discovery manually

```bash
FUNCTION_BASE_URL="https://hb-intel-function-app.azurewebsites.net"
FUNCTION_TOKEN="<delegated-admin-bearer-token>"

curl -sS -X POST "${FUNCTION_BASE_URL}/api/admin/legacy-fallback/discovery/run" \
  -H "Authorization: Bearer ${FUNCTION_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"year":2024,"dryRun":false}'
```

## Expected normalized raw record shape

Each registry upsert is normalized to at least:

- `DriveId`
- `DriveItemId`
- `FolderName`
- `FolderPath`
- `FolderWebUrl`
- `LegacyYear`
- `SourceSiteName`
- `SourceSitePath`
- `SourceLibraryName`
- `DiscoveryRunId`
- `MatchStatus=unmatched`
- `MatchMethod=no-match`

## Validation checklist

After a hosted run:

1. HBCentral list **Legacy Project Fallback Registry** contains upserted folder records.
2. HBCentral list **Legacy Project Fallback Sync Runs** contains a run entry with counters and `SummaryJson`.
3. Function logs include source-resolution and error telemetry for any failed year/site/drive resolution.

## Retry and error behavior

- Graph calls use retry/backoff for transient failures (429, timeout, 5xx).
- Resolution failures are logged per-year and surfaced in run summary `errors[]`.
- Registry upserts are idempotent by `(DriveId, DriveItemId)` identity.
