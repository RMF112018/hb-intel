# Run Legacy Fallback Discovery

This runbook covers hosted execution of the legacy fallback discovery pipeline for Project Sites.

## Host target

Authoritative host for the legacy fallback lane is the default Function App composition on `hb-intel-function-app`, whose entrypoint is `backend/functions/src/index.ts` (shipped as `dist/index.js` per `backend/functions/package.json`). That entrypoint registers exactly these eight functions for this lane:

- `legacyFallbackDiscoveryRun` — `POST /api/admin/legacy-fallback/discovery/run`
- `legacyFallbackDiscoveryTimer` — timer trigger (gated by config)
- `adminLegacyFallbackReviewList` — `GET /api/admin/legacy-fallback/review/records`
- `adminLegacyFallbackReviewGetRecord` — `GET /api/admin/legacy-fallback/review/records/{recordId}`
- `adminLegacyFallbackReviewManualBind` — `POST /api/admin/legacy-fallback/review/records/{recordId}/bind`
- `adminLegacyFallbackReviewIgnore` — `POST /api/admin/legacy-fallback/review/records/{recordId}/ignore`
- `adminLegacyFallbackReviewDisable` — `POST /api/admin/legacy-fallback/review/records/{recordId}/disable`
- `adminLegacyFallbackReviewRevalidate` — `POST /api/admin/legacy-fallback/review/revalidate`

The review/admin registrations live in `backend/functions/src/functions/adminApi/legacy-fallback-routes.ts`; that module is the single registration source and is imported by both the default host (`src/index.ts`) and the admin-control-plane host. The admin-control-plane host remains intentionally out of scope for this lane's operational deployment.

## Hosting model

This lane is hosted on **Azure Functions Flex Consumption** (plan SKU `FC1`, tier `FlexConsumption`, Linux, Node 22). Flex Consumption is the only supported hosting model for this backend lane; Dedicated / legacy Consumption paths are not approved here. Provisioning is owned by `infra/legacy-fallback-hosting.bicep` and the matching `*.bicepparam` files.

Confirm the target app still reports Flex Consumption before deploying:

```bash
az functionapp show -g hb-intel -n hb-intel-function-app \
  --query "{name:name,kind:kind,sku:properties.sku,functionAppConfig:properties.functionAppConfig}" -o json
```

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

The approved deploy path is `.github/workflows/deploy-functions.yml` via `azure/functions-action@v1`. For manual parity (e.g. incident remediation), use the Flex-compatible OneDeploy command:

```bash
az functionapp deploy \
  -g hb-intel \
  -n hb-intel-function-app \
  --src-path "$PWD/functions-artifact.zip" \
  --type zip -o json
```

Do not use `az functionapp deployment source config-zip` for this lane — it is the legacy Dedicated/Consumption zip-deploy path and is not approved for Flex Consumption.

If deploy status reports trigger sync failure (`status: 6`), force sync triggers and re-check function registration:

```bash
HOST="$(az functionapp show -g hb-intel -n hb-intel-function-app --query properties.defaultHostName -o tsv)"
MASTER_KEY="$(az functionapp keys list -g hb-intel -n hb-intel-function-app --query masterKey -o tsv)"

curl -sS -X POST "https://${HOST}/admin/host/synctriggers?code=${MASTER_KEY}" -H "Content-Length: 0" | jq .
curl -sS "https://${HOST}/admin/functions?code=${MASTER_KEY}" | jq 'map(.name)'
```

## Discovery endpoints

- HTTP trigger: `POST /api/admin/legacy-fallback/discovery/run`
- Timer trigger: `legacyFallbackDiscoveryTimer` (gated by config)

## Review and override endpoints

Maintainer review/override is hosted in the same admin API surface and requires delegated admin auth:

- `GET /api/admin/legacy-fallback/review/records`
- `GET /api/admin/legacy-fallback/review/records/{recordId}`
- `POST /api/admin/legacy-fallback/review/records/{recordId}/bind`
- `POST /api/admin/legacy-fallback/review/records/{recordId}/ignore`
- `POST /api/admin/legacy-fallback/review/records/{recordId}/disable`
- `POST /api/admin/legacy-fallback/review/revalidate`

`/review/records` defaults to queue view (`review-required` / `unmatched` and `low`/`none` confidence). Optional query filters:

- `status`
- `confidence`
- `year`
- `isActive`
- `queueOnly`
- `search`

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
- `HBC_LEGACY_FALLBACK_DISCOVERY_TIMER_SCHEDULE=0 0 2 * * *` (UTC six-field cron)
- `HBC_LEGACY_FALLBACK_DISCOVERY_YEARS=2024,2025`
- `HBC_LEGACY_FALLBACK_DISCOVERY_MAX_FOLDERS_PER_RUN=5000`
- `HBC_LEGACY_FALLBACK_MANUAL_RERUN_ENABLED=true|false`
- `HBC_LEGACY_FALLBACK_RERUN_MIN_INTERVAL_MINUTES=30`
- `HBC_LEGACY_FALLBACK_MATCH_ANOMALY_THRESHOLD=25`
- `HBC_LEGACY_FALLBACK_TARGET_AUTH_MODEL=least-privilege-sites-selected`
- `HBC_LEGACY_FALLBACK_TARGET_AUTH_MODEL_NOTES=<operational notes>`

Secret posture:
- Do not commit secrets into repo.
- Keep credentials in environment and/or Key Vault references.
- Treat portal-only ad-hoc config edits as temporary and back-port them to IaC/scripted configuration.

## Permissions posture

- **Interim runtime (active now):** app-only pilot identity `HB SharePoint Creator` (`08c399eb-a394-4087-b859-659d493f8dc7`).
- **Target production posture (documented, not cut over here):** least-privilege `Sites.Selected` + explicit app-role scoping to legacy source and HBCentral hosts.

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

## Hosted validation sequence

Closure for this lane requires **all five proof classes below, in order, with evidence captured together**. No later class substitutes for an earlier one. Record the artifact (CLI output, SP row, App Insights query) that proves each class in the closure report (`legacy-fallback-closure-report-template.md`). The helper script `scripts/collect-legacy-fallback-closure-evidence.sh` collects the raw evidence for classes B, D, and E into a single JSON.

### A. Deployment Proof

- Artifact is the deterministic zip from `scripts/package-functions-artifact.ts` (entrypoint `dist/index.js`, `artifact-inventory.json` present).
- Deployed via `azure/functions-action@v1` (CI) or `az functionapp deploy --type zip` (manual). `az functionapp deployment source config-zip` is not acceptable evidence.
- `az functionapp show … --query "{kind:kind,sku:properties.sku}"` reports `functionapp,linux` + `FC1 / FlexConsumption`.

### B. Registration Proof — presence only, not success

- `az functionapp function list -g <rg> -n <app>` lists all eight lane functions:
  - `legacyFallbackDiscoveryRun`, `legacyFallbackDiscoveryTimer`
  - `adminLegacyFallbackReviewList`, `adminLegacyFallbackReviewGetRecord`
  - `adminLegacyFallbackReviewManualBind`, `adminLegacyFallbackReviewIgnore`, `adminLegacyFallbackReviewDisable`, `adminLegacyFallbackReviewRevalidate`
- `/admin/functions?code=<master-key>` also lists the same eight names after `POST /admin/host/synctriggers`.
- **Registration is presence, not success.** A registered function that never runs is not closure.

### C. Execution Proof

- `POST /api/admin/legacy-fallback/discovery/run` returns `2xx` with a response body containing `runId` and a terminal `status` (`completed` or `failed`), OR the daily timer run completes and logs `legacy-fallback.timer.entry` / timer run summary.
- Capture the `runId` — every later proof class is filtered by it.

### D. Persistence Proof

- HBCentral list **Legacy Project Fallback Sync Runs** contains exactly one row with `RunId == <runId>`. That row has:
  - terminal `Status` (`completed` or `failed`) and non-empty `CompletedUtc`,
  - populated counters: `FoldersScanned`, `RecordsCreated`, `RecordsUpdated`, `RecordsMatched`, `RecordsReviewRequired`, `RecordsUnmatched`, `RecordsMarkedInactive`, `ErrorCount`,
  - populated operational fields: `DurationMs`, `SourceFailureCount`, `MatchAnomalyExceeded`, `FirstErrorMessage`,
  - `SummaryJson` as supplementary detail (no longer the only place run-level truth lives).
- HBCentral list **Legacy Project Fallback Registry** contains at least one row tagged `DiscoveryRunId == <runId>` (skip this subcheck for dry-run executions).

### E. Telemetry Proof

- Application Insights contains the run's `invocationId` with `legacy-fallback.boundary.success` markers for:
  - `startSyncRun`,
  - `graph.listRootFolders.first`,
  - `registry.upsert.first-after-sync-run-start` (non-dry-run).
- If the Sync Runs row has `MatchAnomalyExceeded = true`, a matching `legacy-fallback.match-anomaly threshold exceeded` warn log must exist for that `runId`.
- Any `legacy-fallback.boundary.failure` entries for this `runId` are surfaced in the closure report; silent failures are not acceptable.

Deployment success is not closure. Registration success is not closure. Closure requires all five proof classes captured together.

## Sync cadence, stale policy, and rerun posture

- Default cadence is once daily at `02:00 UTC` via `legacyFallbackDiscoveryTimer`.
- Stale policy: active records not seen in the current run are marked inactive (`IsActive=false`) and tagged `stale-not-seen-in-run`; identity (`DriveId + DriveItemId`) is preserved.
- Failure policy: per-year isolation; one year failure does not block remaining years; terminal run status is written with errors in sync-run summary.
- Manual reruns are throttled by `HBC_LEGACY_FALLBACK_RERUN_MIN_INTERVAL_MINUTES`; reruns return `429 LEGACY_FALLBACK_RERUN_BLOCKED` while cooldown is active.

## Disable-now and rerun-now playbook

1. Emergency disable:
   - set `HBC_LEGACY_FALLBACK_ENABLED=false`,
   - set `HBC_LEGACY_FALLBACK_DISCOVERY_ENABLED=false`,
   - set `HBC_LEGACY_FALLBACK_DISCOVERY_TIMER_ENABLED=false`.
2. Validate disabled posture:
   - timer logs show "timer skipped (disabled)",
   - HTTP discovery/revalidate routes reject execution.
3. Controlled rerun:
   - re-enable required flags,
   - wait for rerun cooldown or lower it intentionally,
   - run `POST /api/admin/legacy-fallback/review/revalidate` or `POST /api/admin/legacy-fallback/discovery/run`.

## Monitoring ownership and SLA

- Legacy fallback alerts are emitted from Application Insights scheduled query rules (`infra/monitoring.bicep`):
  - discovery failure burst,
  - registry/sync-run write failures,
  - match anomaly warning threshold.
- Ownership:
  - primary triage: Platform Operations,
  - functional triage: Project Sites maintainers,
  - escalation target: IT Director/on-call owner for environment.
- Response targets:
  - Sev2: acknowledge within 30 minutes; mitigation plan within 2 hours.
  - Sev3: review within same business day.

## Retry and error behavior

- Graph calls use retry/backoff for transient failures (429, timeout, 5xx).
- Resolution failures are logged per-year and surfaced in run summary `errors[]`.
- Registry upserts are idempotent by `(DriveId, DriveItemId)` identity.
