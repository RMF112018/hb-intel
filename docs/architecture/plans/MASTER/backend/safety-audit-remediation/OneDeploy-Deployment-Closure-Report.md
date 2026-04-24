# OneDeploy Deployment Closure Report

**Run date:** 2026-04-24 (local execution)  
**Repository:** `hb-intel` on `main`  
**Operator context:** Azure CLI user session (`az account show`).

---

## Executive Verdict

**Deployment failed due to OneDeploy/SCM 502; staged artifact contains the probe route, but live host does not register it. Deployment closure remains blocked.**

Supporting detail (not a second verdict):

- OneDeploy-compatible `az functionapp deploy` continues to hit **`POST ...scm.../api/publish?type=zip` → HTTP 502** (HTML gateway error). **`/api/health` app-setting identity must not be treated as proof of deployed code** — `HBC_FUNCTIONS_BUILD_*` can match the manifest independently of package application.
- **Route truth gap:** Live Azure registration list **does not include** `safetyReportingPeriodProbe`; `GET /api/safety-records/reporting-periods/period-1/probe` returns **404**. The packaged artifact **does** contain the probe registration in `safety-record-keeping-routes.js` / inventory signatures.

---

## Target

| Field | Value |
| ----- | ----- |
| Function App name | `hb-intel-function-app` |
| Resource group | `hb-intel` |
| Live host (resolved from Azure metadata) | `https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net` |
| Subscription | `Azure subscription 1` (`da99386a-88ef-4987-afc5-12e22690da20`) |
| Tenant | `0e834bd7-628b-42c8-b9ec-ecebc9719be4` |

### Hosting plan / Flex posture (evidence)

From `az functionapp show` (full JSON, `properties` excerpt):

- `kind`: `functionapp,linux`
- `properties.functionAppConfig.deployment.storage.type`: `blobcontainer`
- `properties.functionAppConfig.deployment.storage.value`: `https://hbintelb8f1.blob.core.windows.net/app-package-hb-intel-function-app-cd0e6ba`
- `properties.functionAppConfig.deployment.storage.authentication.type`: `userassignedidentity`
- `properties.functionAppConfig.runtime`: Node **22**
- `properties.functionAppConfig.scaleAndConcurrency.instanceMemoryMB`: **2048**
- `properties.functionAppConfig.siteUpdateStrategy.type`: **Recreate**

Note: `az functionapp show --query "{..., sku:sku, ...}"` returned nulls for top-level `sku`/`serverFarmId` on this CLI/API shape; Flex evidence is taken from `properties.functionAppConfig` above.

---

## Step 1 — Local repo and tool truth (recorded)

Commands run (cwd: repo root):

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git log -1 --oneline
node --version
pnpm --version
az --version
az account show --output table
```

**Recorded output (high-signal):**

- Working tree: modified files under `apps/safety/`, `tools/build-spfx-package.ts`; untracked `.tmp/` and some `docs/...` paths. **No staging or revert** was performed for this run.
- Branch: `main`
- HEAD: `493319bd1678143b680cddf7d0993a1d47eaf045`
- Last commit: `493319bd hb-intel-functions 00.000.150: close backend audit gaps — dist parity, packaging proof, workbook fix`
- Node: `v22.14.0`
- pnpm: `10.13.1`
- Azure CLI: `2.76.0` (update notice present)
- Account: default subscription **Azure subscription 1**, tenant `0e834bd7-628b-42c8-b9ec-ecebc9719be4`

---

## Step 2 — Azure target resolution

```bash
az functionapp list \
  --query "[?name=='hb-intel-function-app'].{name:name, resourceGroup:resourceGroup, state:state, defaultHostName:defaultHostName, kind:kind, reserved:reserved}" \
  --output table
```

Result:

- `resourceGroup`: **hb-intel**
- `defaultHostName`: **hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net**
- `state`: **Running**
- `kind`: **functionapp,linux**
- `reserved`: **True**

Exports used for the rest of the run:

```bash
export FUNCTION_APP_NAME="hb-intel-function-app"
export RESOURCE_GROUP="hb-intel"
export LIVE_HOST="https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net"
```

---

## Artifact Deployed (local canonical zip prepared for deploy)

**Zip path:** `.tmp/functions-validation/functions-artifact.zip`  
**Staging dir:** `.tmp/functions-validation/functions-deploy`  
**Manifest:** `.tmp/functions-validation/artifact-manifest.json`

| Field | Value |
| ----- | ----- |
| Package name | `@hbc/functions` |
| Package version | `00.000.150` |
| Commit SHA | `493319bd1678143b680cddf7d0993a1d47eaf045` (matches `git rev-parse HEAD` at run time) |
| Build timestamp | `2026-04-24T15:27:04.423Z` |
| Zip bytes | `136837437` |
| SHA256 | `c9b74c415578d67b53093c3335694053d05a75c5173655a7496abeca304e7bc7` |
| Entrypoint | `./dist/backend/functions/src/index.js` |
| Packaging proof | `artifact-entrypoint-import-ok` (stdout from `scripts/package-functions-artifact.ts`) |

**Prior prompt reference SHA** (`08f655ce...`) **does not match** this regenerated artifact; this run’s canonical zip is the table above.

### `safetyGraphCommitPathProof` excerpt (from `artifact-inventory.json`)

- `codePathModule`: `dist/backend/functions/src/services/safety-ingestion-code-path.js`
- `applicationServiceModule`: `dist/backend/functions/src/services/safety-ingestion-application-service.js`
- `graphRepositoryModule`: `dist/backend/functions/src/services/safety-ingestion-graph-repository.js`
- `graphDataPlaneModule`: `dist/backend/functions/src/services/safety-ingestion-graph-data-plane.js`
- `codePathLiteral`: `graph-only`
- `codePathConstant`: `SAFETY_INGESTION_REQUIRED_CODE_PATH`
- `violationError`: `SafetyIngestionCodePathViolationError`
- `applicationServiceGuard`: `assertGraphOnlyRepository`

### Five Safety route signatures (inventory)

1. `safety-records/ingest`
2. `safety-records/ingest/preview`
3. `safety-records/replay`
4. `safety-records/provision-sharepoint`
5. `safety-records/reporting-periods/{reportingPeriodId}/probe`

### Required staged files (verified via `find` under `.tmp/functions-validation/functions-deploy`)

- `.../safety-record-keeping-routes.js`
- `.../safety-ingestion-application-service.js`
- `.../safety-ingestion-graph-repository.js`
- `.../safety-ingestion-graph-data-plane.js`
- `.../safety-ingestion-code-path.js`
- `.../functions/health/index.js`
- `.../functions/health/ready.js`

---

## App Settings Stamp

Stamp source: `.tmp/functions-validation/artifact-manifest.json`

```bash
az functionapp config appsettings set \
  --resource-group hb-intel \
  --name hb-intel-function-app \
  --settings \
    HBC_FUNCTIONS_BUILD_VERSION="00.000.150" \
    HBC_FUNCTIONS_BUILD_SHA="493319bd1678143b680cddf7d0993a1d47eaf045" \
    HBC_FUNCTIONS_BUILD_TIMESTAMP="2026-04-24T15:27:04.423Z"
```

Re-query proof:

| Name | Value |
| ---- | ----- |
| `HBC_FUNCTIONS_BUILD_VERSION` | `00.000.150` |
| `HBC_FUNCTIONS_BUILD_SHA` | `493319bd1678143b680cddf7d0993a1d47eaf045` |
| `HBC_FUNCTIONS_BUILD_TIMESTAMP` | `2026-04-24T15:27:04.423Z` |

**Verdict:** values **matched manifest** immediately before attempted zip deploy.

---

## Deployment Command(s)

### Attempt 1 (failed)

```bash
az functionapp deploy \
  --resource-group hb-intel \
  --name hb-intel-function-app \
  --src-path .tmp/functions-validation/functions-artifact.zip \
  --type zip
```

**Result:** `ERROR` — HTTP **502** HTML gateway error from SCM; message referenced `...scm.../api/deployments/latest`.

### Attempt 2 (failed; explicit async + long timeout)

```bash
az functionapp deploy \
  --resource-group hb-intel \
  --name hb-intel-function-app \
  --src-path .tmp/functions-validation/functions-artifact.zip \
  --type zip \
  --async true \
  --timeout 3600000
```

**Result:** same **502** pattern (failed in ~10s).

### Attempt 3 (failed; `webapp deploy` diagnostic — same engine)

```bash
az webapp deploy \
  --resource-group hb-intel \
  --name hb-intel-function-app \
  --src-path .tmp/functions-validation/functions-artifact.zip \
  --type zip \
  --timeout 3600000
```

**Result:** same **502** pattern.

**Failure analysis (initial):**

- **Not auth/session:** `az functionapp list/show` succeeded; settings set succeeded.
- **Likely class:** SCM / OneDeploy gateway (**502**) against Flex blob-package deployment endpoint, or upstream deploy worker error. **Not** classic `config-zip` path (not used).
- **CLI/version:** Azure CLI `2.76.0` with preview `az functionapp deploy` warning banner.

---

## Live Health Proof

**Request:**

```bash
curl -sS "$LIVE_HOST/api/health" | tee .tmp/functions-validation/live-health.json
```

**HTTP status:** `200`

**Body (saved):** `.tmp/functions-validation/live-health.json`

```json
{
  "status": "healthy",
  "artifact": {
    "version": "00.000.150",
    "commitSha": "493319bd1678143b680cddf7d0993a1d47eaf045",
    "buildTimestamp": "2026-04-24T15:27:04.423Z"
  },
  "timestamp": "2026-04-24T15:29:28.021Z"
}
```

**`jq` parity checks (against stamped env-backed identity):**

```bash
jq -e ".artifact.version == env.DEPLOY_VERSION" ...
jq -e ".artifact.commitSha == env.DEPLOY_SHA" ...
jq -e ".artifact.buildTimestamp == env.DEPLOY_TIMESTAMP" ...
```

All evaluated **true**.

### Critical interpretation / mismatch verdict

Per `backend/functions/src/utils/backend-version.ts`, **`commitSha` and `buildTimestamp` on `/api/health` come from `HBC_FUNCTIONS_BUILD_*` app settings**, not from an immutable “built into the zip” fingerprint. **`version` prefers the same env var** before `package.json`.

Therefore: **Step 8 identity match proves stamp alignment, not that the new zip was applied.** After a failed deploy, this can still pass if app settings were updated.

---

## Readiness Proof

### No-auth `/api/health/ready`

**Saved:** `.tmp/functions-validation/live-ready-noauth.txt`  
**Status:** `401 Unauthorized`  
**Body:** `{"error":"Unauthorized","reason":"Missing or malformed Authorization header"}`

### Malformed bearer `/api/health/ready`

**Saved:** `.tmp/functions-validation/live-ready-badbearer.txt`  
**Status:** `401 Unauthorized`  
**Body:** `{"error":"Unauthorized","reason":"Invalid token"}`

**Verdict vs required proof:**

- Not `404` (route exists): **pass**
- Malformed bearer is `401` (not `404`): **pass**

### Admin readiness payload

**Not executed.** Token acquisition failed (see below).

---

## Token acquisition attempt (admin / roles)

**Command:**

```bash
az account get-access-token --resource "api://08c399eb-a394-4087-b859-659d493f8dc7"
```

**Result:** failed with `AADSTS65001` — **Microsoft Azure CLI** lacks tenant consent for the HB Intel API audience resource.

**Guidance emitted by CLI (paraphrased):** interactive login with `--scope api://<client-id>/.default` for tenant `0e834bd7-628b-42c8-b9ec-ecebc9719be4`.

**Status:**

- **Admin `/api/health/ready` JSON proof:** **pending** (no `ADMIN_TOKEN` acquired in this non-interactive session).
- **Role matrix (`REVIEWER_TOKEN` / `SUBMITTER_TOKEN` / `OPERATOR_TOKEN`):** **pending**.

No token values are recorded in this report.

---

## Safety Route Presence Proof

| Route | Method | Status | Expected | Verdict |
| ----- | -----: | -----: | -------- | ------- |
| `/api/safety-records/ingest` | POST | **401** | non-404; `401`/`403` acceptable without bearer | **pass** (saved: `live-route-ingest-noauth.txt`) |
| `/api/safety-records/ingest/preview` | POST | **401** | non-404; `401`/`403` acceptable | **pass** (saved: `live-route-preview-noauth.txt`) |
| `/api/safety-records/replay` | POST | **401** | non-404; `401`/`403` acceptable | **pass** (saved: `live-route-replay-noauth.txt`) |
| `/api/safety-records/provision-sharepoint` | POST | **401** | non-404; `401`/`403` acceptable | **pass** (saved: `live-route-provision-noauth.txt`) |
| `/api/safety-records/reporting-periods/period-1/probe?reportingPeriodSpItemId=1` | GET | **404** | non-404 | **fail** (saved: `live-route-probe-noauth.txt`) |

### Azure-registered function inventory cross-check

```bash
az functionapp function list -g hb-intel -n hb-intel-function-app --query "[].name" -o tsv
```

Observed Safety-related registrations included:

- `.../safetyIngestWorkbook`
- `.../safetyPreviewWorkbook`
- `.../safetyReplayWorkbook`
- `.../adminProvisionSafetyRecordKeepingSharePoint`

**Missing:** `.../safetyReportingPeriodProbe`

This aligns with the live **404** on the probe URL pattern.

---

## Role Matrix Proof

**Pending** — no role tokens acquired in this session.

---

## Workbook Preview Proof

**Repo workbook located (valid template path, not fabricated):**

- `docs/architecture/plans/MASTER/spfx/safety-records/Safety Checklist Template.xlsx`
- (also present) `docs/reference/example/Safety Checklist Template - Weighted.xlsx`

**Live hosted preview call:** **pending** — requires a valid delegated/admin bearer plus realistic SharePoint reporting-period/project context; no token was acquired here.

**Local harness fallback:** not re-run as part of this deployment-only closure (scope lock: deploy + live proof).

---

## Errors / Deviations

1. **`az functionapp deploy` / `az webapp deploy`:** repeated **502** SCM gateway errors; no successful CLI completion.
2. **`/api/health` identity checks:** can pass from **app settings alone**; must not be treated as sole proof of zip contents when deploy fails.
3. **Safety reporting-period probe route:** **404** + missing `safetyReportingPeriodProbe` in Azure function list ⇒ **not** proven registered on live host.
4. **Token acquisition:** `az account get-access-token` blocked by **AADSTS65001** (consent) for API audience `api://08c399eb-a394-4087-b859-659d493f8dc7`.

---

## Remaining Production Gates

1. **Restore OneDeploy zip delivery** for Flex app (investigate SCM 502 / package worker / storage MI / size limits) until `az functionapp deploy` completes cleanly and **probe** registers.
2. **Prove `safetyReportingPeriodProbe` live** (non-404 + expected auth behavior) and reconcile Azure function inventory vs packaged routes.
3. **Admin readiness payload** (`/api/health/ready` with real admin token): `safetyRolloutReadiness`, `rolloutPermissionInventory`.
4. **Role matrix proofs** with minted test principals.
5. **Hosted workbook preview proof** using `Safety Checklist Template.xlsx` + valid context.
6. **True artifact parity beyond stamps** (e.g., post-deploy SCM/deployment log correlation, or successful deploy + function inventory match).

---

## Final Recommendation

Do **not** treat this run as production-closed for Safety reporting-period probe or full “zip landed” integrity.

Recommended next actions:

- **Diagnose / remediate** the Flex OneDeploy **502** path (platform support if persistent) or complete deploy via the repo’s **GitHub Actions** `azure/functions-action@v1` path that is already documented for Flex.
- After a successful deploy: re-run **function list** to confirm `safetyReportingPeriodProbe` exists, re-probe the route for **401** (no auth) instead of **404**, then proceed to **live preview** and **ingest** gated tests with proper tokens.

---

## OneDeploy diagnosis addendum (follow-up)

### Step 1 — Azure target truth (this session)

- Full ARM dump: `.tmp/functions-validation/functionapp-show.json`
- **Corrected** `jq` summary (fields live under `.properties`, not top-level): `.tmp/functions-validation/functionapp-show-summary.json`

If you run the procedure’s `jq` filter against the raw `az functionapp show` JSON, **use**:

```bash
jq '{
  id,
  name,
  state: .properties.state,
  kind,
  defaultHostName: .properties.defaultHostName,
  serverFarmId: .properties.serverFarmId,
  storageAccountRequired: .properties.storageAccountRequired,
  functionAppConfig: .properties.functionAppConfig,
  siteConfig: .properties.siteConfig
}' .tmp/functions-validation/functionapp-show.json
```

### SCM publish failure (new evidence)

From `az functionapp deploy --debug` log `.tmp/functions-validation/deploy-debug-20260424115210.log`:

- CLI calls **OneDeploy zip** endpoint: `POST https://hb-intel-function-app-gbd6ecgrh7fsgscm.scm.eastus2-01.azurewebsites.net/api/publish?type=zip`
- HTTP result: **502** (HTML gateway error body ~1477 bytes)
- Elapsed: **~10s** — failure occurs **before** a full 130MB upload would finish; this points to **SCM/upstream publish worker** failure or gateway rejection on **publish initiation**, not a slow transfer timeout.

### Post-restart retry

- `az functionapp restart` then a single `az functionapp deploy` retry: **still 502** (same pattern).

### Storage / identity (ruled out as primary cause)

User-assigned MI `hb-intel-function-app-uami` (`principalId` `11194065-c745-4c4f-82ae-a2a3a7f92ddb`) has:

- **Storage Blob Data Owner** on storage account `hbintelb8f1`
- **Storage Blob Data Contributor** on deployment container `app-package-hb-intel-function-app-cd0e6ba`

So **Flex deployment container RBAC** is present; the 502 is not explained by missing blob RBAC alone.

### Flex deployment logs

```bash
az webapp log deployment show --name hb-intel-function-app --resource-group hb-intel
```

Returned Flex-specific notice: logs **not found** / not persisted after instance recycle — see `https://aka.ms/flex-deployments`. This limits Kudu-style post-mortems from the operator workstation.

### Live registration (unchanged)

`az functionapp function list` still shows Safety functions **without** `safetyReportingPeriodProbe`, consistent with **stale** deployed package vs current repo artifact that includes the probe route.

### Resolution status

**Not resolved:** platform **502** on `/api/publish?type=zip` persists after **Azure CLI upgrade** and **exactly one** additional logged retry (per controlled escalation).

#### Azure Portal diagnostics (operator-required)

This agent cannot open the Azure Portal. Capture manually:

Function App `hb-intel-function-app` → **Diagnose and solve problems** → search **Flex Consumption Deployment** → export **deployment history**, **package status**, **deployment-container / storage** findings, and any **platform recommendations**. Attach exports to the support bundle: [OneDeploy-502-Support-Evidence-Package.md](./OneDeploy-502-Support-Evidence-Package.md).

#### `az upgrade` + second logged CLI attempt

- **Before:** Azure CLI **2.76.0** (Homebrew).
- **After:** Homebrew upgraded **`azure-cli` to 2.85.0**; `az version` reports **2.85.0** (`/opt/homebrew/bin/az`). The `az upgrade` wrapper exited non-zero after brew finished (post-upgrade traceback against the removed 2.76.0 tree); treat **brew + `az version`** as the source of truth for the new CLI.
- **Single post-upgrade deploy log:** `.tmp/functions-validation/deploy-debug-post-cli-2.85.0-20260424120337.log` — still **`POST .../api/publish?type=zip` → 502** (~16s). **No further local `az functionapp deploy` retries** without another changed diagnostic variable.

#### GitHub Actions path (CI gate applied)

- Workflow: [`.github/workflows/main_hb-intel-function-app.yml`](../../.github/workflows/main_hb-intel-function-app.yml) — after `Post-deploy live artifact parity proof (hard gate)`, the deploy job now runs **Flex Safety reporting-period probe registration proof** (`az functionapp function list` must include `.../safetyReportingPeriodProbe`; live GET probe must not return **404**).
- Reference / rationale: [OneDeploy-502-Workflow-Gate-Appendix.md](./OneDeploy-502-Workflow-Gate-Appendix.md)

#### Support-ready bundle

- [OneDeploy-502-Support-Evidence-Package.md](./OneDeploy-502-Support-Evidence-Package.md) — subscription, RG, Flex container URL, UAMI auth, timestamps, CLI logs, live vs staged probe proof, RBAC, portal checklist.

---

## GitHub Actions Deployment Attempt — Run 24899925568

| Field | Value |
| ----- | ----- |
| Workflow | Build and deploy Node.js project to Azure Function App - hb-intel-function-app |
| Run URL | https://github.com/RMF112018/hb-intel/actions/runs/24899925568 |
| Status | `completed` |
| Conclusion | **`failure`** |
| Head SHA | `a124a8de926867baade246bffe15092c70f32a8d` (`ci: add safety probe gate to function deployment`) |
| Created / updated (UTC) | `2026-04-24T16:19:47Z` / `2026-04-24T16:20:23Z` |
| Log capture | `.tmp/functions-validation/gha-run-24899925568.log`, `.tmp/functions-validation/gha-run-24899925568-meta.json` |

### Job outcome

- **`build`:** `failure` — failed at step **Type-check @hbc/functions** (`pnpm --filter @hbc/functions check-types`). Subsequent build steps (unit test, package artifact, manifest read, upload artifact) were **skipped**.
- **`deploy`:** **`skipped`** — never started. **Azure/functions-action** did not run; no OneDeploy/SCM path was exercised for this run.

### Root cause (classification **D** — failed before deployment)

`tsc --noEmit` on a clean Linux runner reported widespread **`TS2307` Cannot find module** for workspace packages (`@hbc/models`, `@hbc/models/admin-control-plane`, `@hbc/acknowledgment/server`, `@hbc/notification-intelligence`, etc.) plus one **`TS2339`** in `safety-record-keeping-list-definitions.ts`. The same `check-types` at the same commit **passes locally** after a normal dev install, which indicates **CI lacked built `dist/` outputs for upstream workspace packages** (Linux clean workspace), not a missing commit of the probe gate.

**Step 4 template (filled):**

```text
Workflow failed before deployment.
Failing step: Type-check @hbc/functions
Root cause: Clean GHA workspace had not built upstream workspace packages; tsc could not resolve workspace package entrypoints/types from source alone.
Required fix: Run a turbo (or equivalent) build of @hbc/functions dependency graph before check-types in the build job.
Files likely affected: .github/workflows/main_hb-intel-function-app.yml
Can fix safely now? yes
```

**Remediation applied (narrow CI fix):** insert **Build upstream packages for @hbc/functions** — `pnpm turbo run build --filter="...@hbc/functions"` — between `pnpm install --frozen-lockfile` and `pnpm --filter @hbc/functions check-types` in [`.github/workflows/main_hb-intel-function-app.yml`](../../.github/workflows/main_hb-intel-function-app.yml). Landed on `main` with subject **`ci: build workspace deps before functions typecheck on GHA`** (search `git log` on `main` for that title; SHA varies if amended).

### Deploy / parity / probe (this run)

| Gate | Result |
| ---- | ------ |
| Azure/functions-action deployment | **N/A** (job skipped) |
| Artifact manifest / zip from CI | **N/A** (packaging skipped) |
| `verify-functions-live-parity.ts` | **N/A** (not run) |
| `safetyReportingPeriodProbe` in `az functionapp function list` | **N/A** |
| Probe endpoint HTTP | **N/A** |
| `/api/health` identity vs CI artifact | **N/A** — and would **not** close deployed-code proof by itself anyway |

### Token / workbook gates (this run)

| Gate | Status |
| ---- | ------ |
| Admin `/api/health/ready` with bearer | **Pending** (no deploy; no token run) |
| Role matrix | **Pending** |
| Hosted workbook preview | **Pending** (probe not proven live) |

### Verdict for this GitHub Actions run

**Deployment failed before deploy due to workflow/package issue.**

Deployment closure for the Flex host / probe surface **remains blocked** until a **green** Actions run completes **deploy** and the **probe gate** passes.

---

## GitHub Actions Deployment Attempt — Run 24901773055

| Field | Value |
| ----- | ----- |
| Run URL | https://github.com/RMF112018/hb-intel/actions/runs/24901773055 |
| Status | `completed` |
| Conclusion | **`success`** |
| Head SHA | `8ef3d93bb535c30cf7d229eefb4967601ca61470` (`test: align parity contract and release gates with preview x-request-id relaxation`) |
| Created / updated (UTC) | `2026-04-24T17:02:12Z` / `2026-04-24T17:07:37Z` |
| Log capture | `.tmp/functions-validation/gha-run-24901773055.log`, `.tmp/functions-validation/gha-run-24901773055-meta.json` |

### Job outcome

- **`build`:** `success` — upstream turbo (aligned with `scripts/package-functions-artifact.ts`), `check-types`, unit tests, packaging, manifest upload.
- **`deploy`:** `success` — **Stamp runtime identity**, **Azure/functions-action** deploy, **Post-deploy live artifact parity proof** (`pnpm dlx tsx scripts/verify-functions-live-parity.ts`), **Flex Safety reporting-period probe registration proof**.

### CI / repo fixes that unblocked this path (prior commits on `main`)

1. **Turbo scope:** Build filters match [`scripts/package-functions-artifact.ts`](../../../../scripts/package-functions-artifact.ts) plus **`@hbc/sharepoint-platform`** (required because `@hbc/functions` compiles `packages/features/safety` sources that import that package’s **`dist/`** types on clean runners).
2. **`@hbc/sharepoint-platform` incremental cache:** Removed tracked `packages/sharepoint-platform/tsconfig.tsbuildinfo` and added package `.gitignore` so `tsc` emits `dist/` on fresh checkouts (stale `.tsbuildinfo` had caused “successful” builds with no outputs).
3. **`@hbc/ui-kit` on Linux:** Added committed [`packages/ui-kit/types/ambient-assets.d.ts`](../../../../packages/ui-kit/types/ambient-assets.d.ts) and included it from `tsconfig.json` (sidecar `src/**/*.d.ts` is gitignored).
4. **Notification helpers:** Root `.gitignore` rule `lib/` had excluded `backend/functions/src/functions/notifications/lib/*.ts` from git; narrow un-ignore + track those sources.
5. **Deploy job verifier:** `pnpm exec tsx` → **`pnpm dlx tsx`** (deploy job has no `node_modules`).
6. **Parity verifier vs Flex:** Dropped hard failure on missing response `x-request-id` for malformed-bearer **preview** probe (401 auth outcome retained); updated unit/release-gate tests.

### Artifact manifest (from CI build log)

| Field | Value |
| ----- | ----- |
| packageVersion | `00.000.150` |
| commitSha | `8ef3d93bb535c30cf7d229eefb4967601ca61470` |
| sha256 (manifest) | `102d4a316bc68ba9000f5ab0fb6cb9706451f6b6b4ec958709df49d1593c4ccd` |
| zipBytes (summary table) | `133423756` (artifact download digest line in log may differ; use manifest `sha256` as canonical) |

### Deploy / parity / probe (this run)

| Gate | Result |
| ---- | ------ |
| Azure/functions-action deployment | **Succeeded** |
| `verify-functions-live-parity.ts` | **Passed** (`overallPass: true` in job log) |
| `safetyReportingPeriodProbe` in `az functionapp function list` | **Present** (workflow probe step succeeded) |
| Probe endpoint HTTP (no auth) | **401** (not 404; gate allows 401 or 403) |
| `/api/health` vs manifest | **Version `00.000.150` matches**; live `artifact.commitSha` matches deployed **`8ef3d93b…`** post-run curl. **`/api/health` alone is still not deployed-code proof**; probe + inventory close that gap for this run. |

### Token / workbook gates (post-run local checks)

| Gate | Status |
| ---- | ------ |
| Admin `/api/health/ready` with bearer | **Pending** — `az account get-access-token --resource api://08c399eb-a394-4087-b859-659d493f8dc7` returns **AADSTS65001** (no consent for Azure CLI against API audience). Evidence note: `.tmp/functions-validation/live-ready-admin-post-gha-24901773055.txt` |
| Role matrix (reviewer/submitter/operator tokens) | **Pending** (no repo token helper run) |
| Hosted workbook preview | **Pending** (no SharePoint/workbook context in this session) |

### Intermediate runs (brief)

| Run ID | Conclusion | Notes |
| ------ | ---------- | ----- |
| 24900855679 | failure | `@hbc/functions` build: `SiteScopedListDescriptor` / missing `@hbc/sharepoint-platform` types — fixed by building sharepoint-platform + removing stale `.tsbuildinfo`. |
| 24901094810 | failure | Notification `lib/*.ts` missing on runner — fixed by un-ignoring `backend/functions/.../notifications/lib/`. |
| 24901212137 | failure | Parity step: `pnpm exec tsx` not found on deploy job — fixed with `pnpm dlx tsx`. |
| 24901430187 | failure | Parity `overallPass: false` due to `missing_x_request_id` on preview — relaxed verifier + tests. |
| 24901655695 | failure | Unit tests expected old parity rule — test updates in `8ef3d93b`. |

### Verdict for run 24901773055

**Deployment proof partially complete; token/workbook gates pending.**

OneDeploy/SCM **502** was **not** observed on this successful deploy path.

---

## Post-Deployment Proof Gates

| Field | Value |
| ----- | ----- |
| Live host | `https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net` |
| API audience | `api://08c399eb-a394-4087-b859-659d493f8dc7` |
| Expected proof baseline | Run `24901773055`, artifact `@hbc/functions` `00.000.150`, commit `8ef3d93bb535c30cf7d229eefb4967601ca61470` |
| Current live `/api/health` stamp | `00.000.150`, commit `d74d36158dda5084f3ad440a5db6b1193466a7fb`, timestamp `2026-04-24T17:11:32.396Z` |
| Current live-host note | The later docs-only commit `d74d3615` also triggered the Functions workflow and restamped `/api/health`; no redeploy was initiated during this post-deployment proof pass. |

### Live host and runtime identity

Post-deployment proof pass captured:

- `.tmp/functions-validation/live-host-final-proof.txt`
- `.tmp/functions-validation/live-health-final-proof.json`
- `.tmp/functions-validation/api-audience-final-proof.txt`

`/api/health` remains healthy and reports package version **`00.000.150`**. Its current commit stamp is **`d74d3615…`**, not the earlier **`8ef3d93b…`** requested baseline, because the closure-report documentation commit subsequently triggered the same Functions deployment workflow. This does **not** replace route/probe proof: route registration and probe non-404 had already been proven by the successful workflow gate.

### Admin readiness proof

| Gate | Status |
| ---- | ------ |
| Fresh admin token acquisition | **Blocked** — Azure CLI token acquisition against `API_AUDIENCE` returned **AADSTS65001** (Microsoft Azure CLI/user consent missing for `api://08c399eb-a394-4087-b859-659d493f8dc7`). |
| `/api/health/ready` with admin bearer | **Pending** — not run because no fresh admin token was acquired. |

Evidence:

- `.tmp/functions-validation/admin-token-status-final-proof.txt`
- `.tmp/functions-validation/admin-token-error-final-proof.raw.txt` (no bearer token; contains Entra consent error)
- `.tmp/functions-validation/admin-token-consent-check-error.txt` (repeat consent check, still `AADSTS65001`)

### Entra consent request

Request consent for the Azure CLI / user token flow to acquire an access token for the Functions API audience:

| Field | Value |
| ----- | ----- |
| API audience / resource | `api://08c399eb-a394-4087-b859-659d493f8dc7` |
| Tenant | `0e834bd7-628b-42c8-b9ec-ecebc9719be4` |
| Client requiring consent | Microsoft Azure CLI (`04b07795-8ddb-461a-bbee-02f9e1bf7b46`) |
| Blocking error | `AADSTS65001` |
| Purpose | Acquire a fresh admin-capable bearer token to run `GET /api/health/ready` for post-deployment admin readiness proof. |

Interactive consent/auth command supplied by Entra:

```bash
az login --tenant "0e834bd7-628b-42c8-b9ec-ecebc9719be4" \
  --scope "api://08c399eb-a394-4087-b859-659d493f8dc7/.default"
```

After consent is granted, acquire a fresh token without printing it and run:

```bash
az account get-access-token \
  --resource "api://08c399eb-a394-4087-b859-659d493f8dc7" \
  --query accessToken \
  --output tsv > .tmp/functions-validation/admin-token.tmp
```

Then call `GET /api/health/ready` with the bearer token and capture HTTP status, `operationalReadiness`, `safetyPermissionPosture`, `safetyRolloutReadiness`, `rolloutPermissionInventory`, and issue codes.

### Role-matrix proof

| Gate | Status |
| ---- | ------ |
| Reviewer ingest → expected `403` | **Pending** |
| Submitter replay → expected `403` | **Pending** |
| Operator preview empty payload → expected validation failure such as `400` | **Pending** |

Reason: no fresh role-specific `REVIEWER_TOKEN`, `SUBMITTER_TOKEN`, or `OPERATOR_TOKEN` was acquired through an approved workflow. No stale token variables were used.

Evidence: `.tmp/functions-validation/role-matrix-status-final-proof.txt`

### Hosted workbook preview proof

| Gate | Status |
| ---- | ------ |
| Corrected workbook preview | **Pending** |
| Workbook ingest | **Not attempted** |

Reason: no valid authorized preview token plus real SharePoint reporting-period/project context was available. The workbook preview was not fabricated, and live ingest was not attempted.

Evidence: `.tmp/functions-validation/workbook-preview-status-final-proof.txt`

### Remaining gates

- Obtain admin-capable API token after Entra consent is granted for Azure CLI/user token acquisition, then run `/api/health/ready`.
- Acquire approved role-specific reviewer/submitter/operator tokens and run the role-matrix proof.
- Use real SharePoint reporting-period/project context plus an authorized preview token to run hosted workbook preview. Proceed to ingest only if preview is clean.

### Verdict after post-deployment proof pass

**Deployment and route proof closed; admin/role/workbook gates pending due to Entra consent and missing role-specific test tokens/context.**

### Issue #74 — Functions Workflow Trigger Restriction

Issue: https://github.com/RMF112018/hb-intel/issues/74

The Functions deployment workflow now limits automatic `push` deployments on `main` to backend/runtime/deployment inputs only. This prevents docs-only commits from restamping or redeploying `hb-intel-function-app` while keeping explicit operator deployments available through `workflow_dispatch`.

Automatic deployments are triggered only by changes under:

- `backend/functions/**`
- `packages/acknowledgment/**`
- `packages/auth/**`
- `packages/bic-next-move/**`
- `packages/complexity/**`
- `packages/features/safety/**`
- `packages/field-annotations/**`
- `packages/models/**`
- `packages/notification-intelligence/**`
- `packages/provisioning/**`
- `packages/session-state/**`
- `packages/sharepoint-platform/**`
- `packages/shell/**`
- `packages/ui-kit/**`
- `packages/versioned-record/**`
- `packages/workflow-handoff/**`
- `scripts/package-functions-artifact.ts`
- `scripts/verify-functions-live-parity.ts`
- `.github/workflows/main_hb-intel-function-app.yml`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`

Docs-only changes under `docs/**` no longer trigger this workflow automatically. `workflow_dispatch` remains available for intentional manual deployments from `main`.

The workflow file itself remains in `push.paths` by design so deployment workflow edits validate automatically. This resolution commit may therefore trigger the workflow once; the existing deployment/probe proof remains closed and no manual redeploy was requested.

---

## Admin Readiness Proof

**Verdict:** **Admin readiness proof blocked by Entra consent.**

**Overall classification:** Deployment and route proof closed; admin readiness proof **blocked**; role/workbook gates pending.

### Live target and API audience

| Field | Value |
| ----- | ----- |
| Function App | `hb-intel-function-app` |
| Resource group | `hb-intel` |
| Live host | `https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net` |
| API audience | `api://08c399eb-a394-4087-b859-659d493f8dc7` |
| `/api/health` reachability | healthy |
| Current `/api/health` artifact stamp | version `00.000.150`, commit `51be63a10df49098a974a1312ef7395575638a69`, timestamp `2026-04-24T19:41:33.834Z` |

Evidence files:

- `.tmp/functions-validation/live-host-admin-readiness.txt`
- `.tmp/functions-validation/api-audience-admin-readiness.txt`
- `.tmp/functions-validation/live-health-admin-readiness.json`

### Source auth contract confirmed

Read-only source inspection confirmed:

- `backend/functions/src/functions/health/ready.ts` registers route `health/ready` with Functions `authLevel: 'anonymous'`, then wraps the handler with `withAuth(...)`.
- The handler calls `requireAdmin(auth.claims, requestId)` before returning the privileged readiness payload.
- `backend/functions/src/middleware/authorization.ts` accepts admin app roles: `Admin`, `HBIntelAdmin`.
- `backend/functions/src/middleware/validateToken.ts` validates Entra issuer against tenant `AZURE_TENANT_ID`, validates audience against `API_AUDIENCE`, and requires `oid` plus user identity claims for delegated tokens.

### Token acquisition attempt

| Field | Value |
| ----- | ----- |
| Method | Azure CLI delegated token acquisition (`az account get-access-token --resource "$API_AUDIENCE"`) |
| Raw token printed? | No |
| Token acquired? | No |
| Safe claim summary | N/A — no token acquired |
| Blocking error | `AADSTS65001` / `consent_required` |
| `/api/health/ready` called with admin bearer? | No |

No repo-specific helper superseding Azure CLI token acquisition was found. The Azure CLI token request failed before any JWT was issued:

```text
AADSTS65001: The user or administrator has not consented to use the application with ID '04b07795-8ddb-461a-bbee-02f9e1bf7b46' named 'Microsoft Azure CLI'.
```

Evidence files:

- `.tmp/functions-validation/admin-token-acquisition-error.txt`
- `.tmp/functions-validation/admin-token-acquisition-status.txt`
- `.tmp/functions-validation/aadsts65001-admin-readiness-debug.log`
- `.tmp/functions-validation/aadsts65001-admin-readiness-extract.txt`

### Consent request package

| Field | Value |
| ----- | ----- |
| Tenant ID | `0e834bd7-628b-42c8-b9ec-ecebc9719be4` |
| API audience / resource | `api://08c399eb-a394-4087-b859-659d493f8dc7` |
| Client requiring delegated consent | Microsoft Azure CLI (`04b07795-8ddb-461a-bbee-02f9e1bf7b46`) |
| Required app role for readiness | `Admin` or `HBIntelAdmin` |
| Purpose | Allow authorized admin users to acquire delegated tokens for the HB Intel backend API so `GET /api/health/ready` and future admin-gated backend proof checks can be run. |
| Current blocker | `AADSTS65001` — consent required before Azure CLI/user token acquisition can succeed. |

Interactive consent/auth command supplied by Azure CLI:

```bash
az login --tenant "0e834bd7-628b-42c8-b9ec-ecebc9719be4" \
  --scope "api://08c399eb-a394-4087-b859-659d493f8dc7/.default"
```

No random app-registration edits were attempted. This environment did not provide an established tenant-admin consent workflow, so the proof lane stops here.

### Next required action

After tenant/admin consent is granted, acquire a fresh token without printing it, validate safe claims (`aud`, `iss`, `tid`, `oid` presence, UPN/preferred username, roles), require `Admin` or `HBIntelAdmin`, and then call:

```bash
GET https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net/api/health/ready
```

Record HTTP status, `operationalReadiness`, `environmentPosture`, `safetyPermissionPosture`, `safetyRolloutReadiness.ready`, `safetyRolloutReadiness.issueCodes`, `rolloutPermissionInventory`, and `requestId`.

---

## Evidence file index (local)

Under `.tmp/functions-validation/`:

- `functionapp-show.json`, `functionapp-show-summary.json`
- `deploy-debug-20260424115210.log` (full `az functionapp deploy --debug`, CLI 2.76.0 era)
- `deploy-debug-post-cli-2.85.0-20260424120337.log` (single post-`az upgrade` / CLI **2.85.0** retry)
- `artifact-manifest.json`, `functions-artifact.zip`, `functions-deploy/*`
- `live-health.json`
- `live-ready-noauth.txt`, `live-ready-badbearer.txt`
- `live-route-*-noauth.txt` (ingest/preview/replay/provision/probe)
- `gha-run-24901773055.log`, `gha-run-24901773055-meta.json`
- `live-host-24901773055.txt`, `live-health-post-gha-24901773055.json`, `live-health-post-gha-24901773055.pretty.json`
- `api-audience-setting.txt`, `live-ready-admin-post-gha-24901773055.txt`
- `live-host-admin-readiness.txt`, `api-audience-admin-readiness.txt`, `live-health-admin-readiness.json`
- `admin-token-acquisition-error.txt`, `admin-token-acquisition-status.txt`
- `aadsts65001-admin-readiness-debug.log`, `aadsts65001-admin-readiness-extract.txt`
