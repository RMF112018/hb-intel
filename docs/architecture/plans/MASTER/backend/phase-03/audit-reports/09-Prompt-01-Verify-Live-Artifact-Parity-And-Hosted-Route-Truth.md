# Prompt-01 Closure — Verify Live Artifact Parity and Hosted Route Truth

Date: April 23, 2026  
Repo: `/Users/bobbyfetting/hb-intel`  
Branch: `main`  
Commit at execution: `c621aee82bc9ec0dc0434225726b83a632ace5c7`

## Scope executed

Implemented a machine-checkable live parity verifier and wired it into the Azure Functions deployment workflow as a hard post-deploy gate.

## Exact files changed

- `.github/workflows/main_hb-intel-function-app.yml`
- `scripts/verify-functions-live-parity.ts`
- `scripts/verify-functions-live-parity.test.ts`
- `backend/functions/README.md`
- `docs/reference/developer/verification-commands.md`
- `docs/architecture/plans/MASTER/backend/phase-03/audit-reports/README.md`
- `docs/architecture/plans/MASTER/backend/phase-03/audit-reports/09-Prompt-01-Verify-Live-Artifact-Parity-And-Hosted-Route-Truth.md`

## Exact verification commands run

```bash
pnpm exec vitest run --config scripts/vitest.config.ts scripts/verify-functions-live-parity.test.ts
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-cutover-guard.test.ts
pnpm --filter @hbc/functions test -- src/functions/health/__tests__/health.test.ts
pnpm exec tsx scripts/package-functions-artifact.ts --skip-build --staging /tmp/functions-deploy-prompt01 --output /tmp/functions-artifact-prompt01.zip
pnpm exec tsx scripts/verify-functions-live-parity.ts --app-name hb-intel-function-app --resource-group hb-intel --expected-sha c621aee82bc9ec0dc0434225726b83a632ace5c7 --expected-version 00.000.145 --output /tmp/live-parity-evidence-prompt01.json
```

## Local expected artifact identity (from packaging run)

```json
{
  "packageVersion": "00.000.145",
  "commitSha": "c621aee82bc9ec0dc0434225726b83a632ace5c7",
  "buildTimestamp": "2026-04-23T21:06:41.183Z",
  "sha256": "f6638770ac6ee1db1c0841094e3bae1c94086f4f855d24ddb8086dbc5ebd6166"
}
```

## Exact health artifact output observed

Live `/api/health` response observed during execution:

```json
{"status":"healthy","operationalReadiness":"degraded","environment":"unknown","adapterMode":"proxy","coreConfigReady":true,"configTiers":{"core":"ready","sharepoint":"ready","provisioning":"incomplete"},"provisioningPrereqs":{"graphPermission":false,"hubSite":false,"appCatalog":false,"spfxAppId":false,"opexManager":true},"integrations":{"signalR":"not-configured","email":"not-configured","notifications":"ready"},"notificationRecipients":{"controllerNotifications":"configured","adminNotifications":"configured"},"timestamp":"2026-04-23T20:30:31.704Z"}
```

This response has no `artifact` block, so it fails current source parity expectations.

## Route-status evidence observed

From parity verifier output:

- `POST /api/safety-records/ingest` → `401` (route exists)
- `POST /api/safety-records/ingest/preview` → `404` (route missing)
- `POST /api/safety-records/replay` → `404` (route missing)
- `GET /api/health/ready` → `404` (route missing)

## Verifier evidence register (verbatim)

```json
{
  "appName": "hb-intel-function-app",
  "resourceGroup": "hb-intel",
  "hostName": "hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net",
  "checkedAtUtc": "2026-04-23T21:07:19.883Z",
  "expectedIdentity": {
    "version": "00.000.145",
    "commitSha": "c621aee82bc9ec0dc0434225726b83a632ace5c7"
  },
  "liveIdentity": {
    "version": "missing",
    "commitSha": "missing",
    "buildTimestamp": "missing"
  },
  "identityParity": {
    "hasArtifactBlock": false,
    "versionMatch": false,
    "commitShaMatch": false,
    "issues": [
      "health.artifact.missing",
      "health.artifact.version.missing",
      "health.artifact.commitSha.missing",
      "health.artifact.buildTimestamp.missing",
      "health.artifact.version.mismatch(expected=00.000.145,live=missing)",
      "health.artifact.commitSha.mismatch(expected=c621aee82bc9ec0dc0434225726b83a632ace5c7,live=missing)"
    ]
  },
  "routeTruth": {
    "routes": [
      {
        "route": "/api/safety-records/ingest",
        "method": "POST",
        "status": 401,
        "exists": true
      },
      {
        "route": "/api/safety-records/ingest/preview",
        "method": "POST",
        "status": 404,
        "exists": false
      },
      {
        "route": "/api/safety-records/replay",
        "method": "POST",
        "status": 404,
        "exists": false
      }
    ],
    "allPresent": false,
    "issues": [
      "route.missing(POST /api/safety-records/ingest/preview status=404)",
      "route.missing(POST /api/safety-records/replay status=404)"
    ]
  },
  "healthReadyTruth": {
    "status": 404,
    "exists": false,
    "issues": [
      "route.missing(GET /api/health/ready status=404)"
    ]
  },
  "deployStampTruth": {
    "present": false,
    "settings": {
      "buildVersion": "missing",
      "buildSha": "missing",
      "buildTimestamp": "missing"
    },
    "versionMatch": false,
    "commitShaMatch": false,
    "issues": [
      "appsettings.HBC_FUNCTIONS_BUILD_VERSION.missing",
      "appsettings.HBC_FUNCTIONS_BUILD_SHA.missing",
      "appsettings.HBC_FUNCTIONS_BUILD_TIMESTAMP.missing"
    ]
  },
  "overallPass": false
}
```

## Required statements

- **Is deployed artifact current?**  
  **Not proven.** Current live host response does not expose `artifact` identity and fails parity checks.

- **Is deployed artifact graph-native on the Safety hot path?**  
  **Not proven.** Hosted route truth is divergent (`ingest/preview` and `replay` return `404`), so current source route registration parity is not present.

- **Evidence of stale/divergent deployment behavior?**  
  **Yes.** Missing `/api/health` artifact contract, missing `/api/health/ready`, missing preview/replay Safety routes, and missing deploy-stamp app settings.

## Remediation status after this change

Implemented hard-gate enforcement so these conditions can no longer be silently accepted in CI deployment success:

- CI now runs `scripts/verify-functions-live-parity.ts` post-deploy and fails the job if parity is not complete.
- Verifier checks identity parity, hosted route truth, readiness route presence, and deploy-stamp setting integrity.
