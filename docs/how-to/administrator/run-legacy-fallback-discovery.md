# Run Legacy Fallback Discovery (Prompt 04)

This runbook covers hosted execution of the legacy fallback discovery pipeline for Project Sites.

## Host target

Prompt 04 closure target is the existing hosted Function App lane (`hb-intel-function-app`) while dedicated Prompt 03 hosting constraints are remediated.

## Deployment model gate (required before publish)

Capture hosting/runtime truth first and select the deployment command only after this gate:

```bash
az functionapp show -g hb-intel -n hb-intel-function-app \
  --query "{name:name,kind:kind,sku:properties.sku,functionAppConfig:properties.functionAppConfig}" -o json
```

Then validate command support:

```bash
az functionapp deploy -h
az functionapp deployment source config-zip -h
func azure functionapp publish --help
```

Use the command path that is confirmed to be supported by the discovered hosting model.

## Build and package artifact

Build and stage the deterministic Functions deploy artifact:

```bash
pnpm exec tsx scripts/package-functions-artifact.ts \
  --output "$PWD/functions-artifact.zip" \
  --staging "/tmp/functions-deploy"
```

The artifact includes:
- compiled runtime output (`dist/`)
- host metadata (`host.json`)
- runtime package metadata (`package.json`)
- production dependencies required by runtime imports (`node_modules`, including `@hbc/*` runtime packages)

## Deploy hosted artifact

For Flex Consumption closure, deploy the packaged zip via Azure CLI:

```bash
az functionapp deploy \
  -g hb-intel \
  -n hb-intel-function-app \
  --src-path "$PWD/functions-artifact.zip" \
  --type zip \
  --restart true
```

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
FUNCTION_BASE_URL="https://$(az functionapp show -g hb-intel -n hb-intel-function-app --query properties.defaultHostName -o tsv)"
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

1. `az functionapp function list -g hb-intel -n hb-intel-function-app` shows:
   - `legacyFallbackDiscoveryRun`
   - `legacyFallbackDiscoveryTimer`
1. HBCentral list **Legacy Project Fallback Registry** contains upserted folder records.
2. HBCentral list **Legacy Project Fallback Sync Runs** contains a run entry with counters and `SummaryJson`.
3. Function logs include source-resolution and error telemetry for any failed year/site/drive resolution.

## Retry and error behavior

- Graph calls use retry/backoff for transient failures (429, timeout, 5xx).
- Resolution failures are logged per-year and surfaced in run summary `errors[]`.
- Registry upserts are idempotent by `(DriveId, DriveItemId)` identity.
