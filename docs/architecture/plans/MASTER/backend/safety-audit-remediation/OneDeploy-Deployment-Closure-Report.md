# OneDeploy Deployment Closure Report

**Run date:** 2026-04-24 (local execution)  
**Repository:** `hb-intel` on `main`  
**Operator context:** Azure CLI user session (`az account show`).

---

## Executive Verdict

**Deployment and route proof are closed. Entra consent is resolved. Admin-gated readiness is proven, but rollout/posture readiness remains blocked.**

Current authoritative status:

- **Deployment / route proof:** **Closed** — GitHub Actions run `24901773055` completed deployment, live parity verification, Azure function inventory proof, and `safetyReportingPeriodProbe` non-404 proof.
- **Entra consent:** **Resolved** — delegated token acquisition for `api://08c399eb-a394-4087-b859-659d493f8dc7` succeeded after consent.
- **Admin readiness call:** **Closed** — `GET /api/health/ready` returned HTTP **200** with `requestId` **`518c085d-6ed2-47c0-87eb-9cd92d2c393d`** using a token whose safe claims included `scp=access_as_user` and the **`Admin`** app role.
- **Current blocker:** **Rollout / posture readiness** — `/api/health/ready` reports `operationalReadiness` **`degraded`** and Safety rollout readiness blocked by missing rollout/proof app settings and incomplete provisioning prerequisites. **Update (after tenant app catalog URL applied in Azure):** `provisioningPrereqs.appCatalog` is now **`true`**; hub id, SPFx product id, Graph/Sites.Selected confirmations, and Safety tightened proof env vars remain open (see **Latest `/api/health/ready` capture**).
- **Role matrix proof:** **Blocked** (2026-04-24 UTC re-run) — Hedrick CLI principal token still `roles: Admin` only (no Safety app roles in JWT); evidence `.tmp/functions-validation/role-matrix-20260424T211708Z/` (prior attempt: `role-matrix-20260424T204926Z/`).
- **Still pending:** hosted workbook preview.
- **Not authorized:** live ingest / commit-path proof.

Historical note: the earlier local OneDeploy/SCM `502` and missing `safetyReportingPeriodProbe` route were valid historical deployment blockers during the local CLI path. They are preserved below as diagnostic history, but they are **superseded** by the successful GitHub Actions deployment path and are **not** the current closure blocker.

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
| Admin `/api/health/ready` with bearer | **At run 24901773055 follow-up:** **Pending** — `az account get-access-token --resource api://08c399eb-a394-4087-b859-659d493f8dc7` returned **AADSTS65001** (evidence: `.tmp/functions-validation/live-ready-admin-post-gha-24901773055.txt`). **Superseded:** post-consent operator proof — **HTTP 200** admin `/api/health/ready` with `requestId` **`518c085d-6ed2-47c0-87eb-9cd92d2c393d`** (see **Post-Deployment Proof Gates** and `proof-pass-admin-ready-20260424-*`). |
| Role matrix (reviewer/submitter/operator tokens) | **Blocked** — latest evidence `.tmp/functions-validation/role-matrix-20260424T211708Z/` (earlier attempt: `role-matrix-20260424T204926Z/`) |
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

### Authoritative gate status (post-consent admin readiness update)

| Gate | Status |
| ---- | ------ |
| Deployment / route proof | **Closed** |
| Entra consent (delegated token to `API_AUDIENCE`, e.g. Azure CLI) | **Resolved** |
| Admin readiness (`GET /api/health/ready` with admin bearer) | **Closed** — HTTP **200**; `requestId` **`518c085d-6ed2-47c0-87eb-9cd92d2c393d`** |
| Rollout readiness (operational + Safety rollout gates in readiness payload) | **Blocked** — `operationalReadiness` **`degraded`**; Safety rollout readiness **blocked** (missing rollout/proof app settings; incomplete provisioning prerequisites); **not** an authentication or admin-role failure |
| Role matrix | **Blocked** — post–Entra assignment re-run: sole Hedrick `az account` identity still issues API token with `roles: Admin` only (no `HBIntelSafetyReviewer` / `HBIntelSafetySubmitter` / `HBIntelSafetyOperator` in JWT); evidence `.tmp/functions-validation/role-matrix-20260424T211708Z/` |
| Hosted workbook preview | **Pending** |
| Live ingest | **Not authorized** |

Historical note: the 2026-04-24 automated re-check recorded **`AADSTS65001`** before consent; that material remains **historical** under **Proof pass — 2026-04-24 UTC** and prior evidence files. It does **not** describe the current Entra posture after consent.

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
| Fresh admin token acquisition | **Resolved** — delegated token acquired for `api://08c399eb-a394-4087-b859-659d493f8dc7` (historical **`AADSTS65001`** evidence retained below). |
| `/api/health/ready` with admin bearer | **Closed** — HTTP **200**; `requestId` **`518c085d-6ed2-47c0-87eb-9cd92d2c393d`**. Safe token claims (decoded only): `scp=access_as_user`; `roles` includes **`Admin`**. |
| Rollout / posture gates inside readiness payload | **Blocked** — `operationalReadiness` **`degraded`**; Safety rollout readiness **blocked** (missing rollout/proof app settings; incomplete provisioning prerequisites). |

Evidence:

- `.tmp/functions-validation/admin-token-status-final-proof.txt`
- `.tmp/functions-validation/admin-token-error-final-proof.raw.txt` (no bearer token; contains Entra consent error)
- `.tmp/functions-validation/admin-token-consent-check-error.txt` (repeat consent check, still `AADSTS65001`)
- `.tmp/functions-validation/proof-pass-admin-ready-20260424-operator-summary.txt` (post-consent operator proof, no secrets)
- `.tmp/functions-validation/proof-pass-admin-ready-20260424-ready-sanitized.json` (sanitized excerpt; not a full response body)

### Entra consent request

Request consent for the Azure CLI / user token flow to acquire an access token for the Functions API audience:

| Field | Value |
| ----- | ----- |
| API audience / resource | `api://08c399eb-a394-4087-b859-659d493f8dc7` |
| Tenant | `0e834bd7-628b-42c8-b9ec-ecebc9719be4` |
| Client requiring consent | Microsoft Azure CLI (`04b07795-8ddb-461a-bbee-02f9e1bf7b46`) |
| Blocking error (historical, pre-consent) | `AADSTS65001` |
| Purpose | Acquire a fresh admin-capable bearer token to run `GET /api/health/ready` for post-deployment admin readiness proof. |
| **Current status** | **Resolved** — consent granted; delegated acquisition succeeds for operator proof (see post-consent evidence files). |

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

## Role Matrix Proof

**Timestamp (UTC):** `2026-04-24T21:17:08Z` (evidence folder suffix `20260424T211708Z`) — **re-run after Enterprise Application app-role assignment** (per operator).

| Field | Value |
| ----- | ----- |
| Live host | `https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net` |
| API audience | `api://08c399eb-a394-4087-b859-659d493f8dc7` |
| Token source type | **Azure CLI** delegated `az account get-access-token --resource <API_AUDIENCE>` (JWT never written to evidence files) |

**CLI identity inventory (`az account list`):** two subscriptions — `bfetting@hedrickbrothers.com` (tenant `0e834bd7-628b-42c8-b9ec-ecebc9719be4`, default) and `bfetting@kmeholding.com` (separate tenant; cannot request this API audience).

**Safe claim summary (Hedrick default principal — diagnostic only, not used for Safety POST proof):**

| Claim | Value |
| ----- | ----- |
| `aud` | `api://08c399eb-a394-4087-b859-659d493f8dc7` |
| `iss` | `https://sts.windows.net/0e834bd7-628b-42c8-b9ec-ecebc9719be4/` |
| `tid` | `0e834bd7-628b-42c8-b9ec-ecebc9719be4` |
| `oid_present` | **true** |
| `upn` | `bfetting@hedrickbrothers.com` |
| `preferred_username` | *(absent)* |
| `scp` | `access_as_user` |
| `roles` | **`["Admin"]` only** — **does not** contain `HBIntelSafetyReviewer`, `HBIntelSafetySubmitter`, or `HBIntelSafetyOperator` |
| `ver` | `1.0` |

**Per–proof-principal tokens:** **not acquired** — `reviewer-claims.safe.json`, `submitter-claims.safe.json`, and `operator-claims.safe.json` each set `token_acquired_for_proof: false` with the same CLI probe embedded. **Admin token was not substituted** for the three POSTs.

| Gate | Route | Expected | Actual | Verdict |
| ---- | ----- | -------- | ------ | ------- |
| Reviewer | `POST /api/safety-records/ingest` (`{}`) | `403` | **Not run** | **Blocked** — no `HBIntelSafetyReviewer` bearer |
| Submitter | `POST /api/safety-records/replay` (`{}`) | `403` | **Not run** | **Blocked** — no `HBIntelSafetySubmitter` bearer |
| Operator | `POST /api/safety-records/ingest/preview` (`{}`) | `400`/`422` (not `401`/`403`) | **Not run** | **Blocked** — no `HBIntelSafetyOperator` bearer |

**Secret scan:** `secret-scan.txt` in the evidence folder — **PASS** (no `Bearer ` / `eyJ` substrings).

**Mutation-capable actions avoided:** no live ingest, no replay with `parentRunId`, no hosted workbook preview, no deploy, no app settings change, no `HBC_FUNCTIONS_BUILD_*` restamp.

**Evidence folder (local, not committed):** `.tmp/functions-validation/role-matrix-20260424T211708Z/`

- `role-matrix-summary.md`, `secret-scan.txt`
- `reviewer-claims.safe.json`, `reviewer-ingest-status.txt`, `reviewer-ingest-response.sanitized.json`
- `submitter-claims.safe.json`, `submitter-replay-status.txt`, `submitter-replay-response.sanitized.json`
- `operator-claims.safe.json`, `operator-preview-status.txt`, `operator-preview-response.sanitized.json`

**Interpretation / unblocker:** Entra **Enterprise Application** assignments do not affect this proof until **the signed-in user’s access token** includes the new app roles. Either (a) assignments were not applied to `bfetting@hedrickbrothers.com`, (b) propagation delay / need new sign-in, or (c) assignments are on **other users** who must run `az login` on this workstation so they appear in `az account list`. Then re-acquire tokens and re-run the three POSTs.

**Remaining gates:** role matrix (still); **hosted workbook preview** pending; **live ingest** not authorized; **rollout readiness** still blocked per `/api/health/ready` posture.

### Hosted workbook preview proof

| Gate | Status |
| ---- | ------ |
| Corrected workbook preview | **Pending** |
| Workbook ingest | **Not attempted** |

Reason: no valid authorized preview token plus real SharePoint reporting-period/project context was available. The workbook preview was not fabricated, and live ingest was not attempted.

Evidence: `.tmp/functions-validation/workbook-preview-status-final-proof.txt`

### Remaining gates

- **Rollout readiness:** remediate missing rollout/proof app settings and provisioning prerequisites until `operationalReadiness` and Safety rollout gates in `/api/health/ready` align with release policy (full JSON captured: `.tmp/functions-validation/health-ready-full-20260424T203332Z.json`; see **Full readiness JSON capture — remediation checklist**).
- **Role matrix:** **blocked** — JWT for default CLI user still lacks Safety app roles after Entra assignment work; `az login` as each assigned test UPN (or wait for propagation on this user), then re-run POST proof (evidence: `.tmp/functions-validation/role-matrix-20260424T211708Z/`).
- **Hosted workbook preview:** use real SharePoint reporting-period/project context plus an authorized preview token. Proceed to ingest only if preview is clean and the operator authorizes commit-path proof.

### Verdict after post-deployment proof pass

**Deployment and route proof closed; Entra consent resolved; admin /api/health/ready call closed; rollout/posture readiness blocked; role matrix blocked (missing role-specific tokens; 2026-04-24 UTC evidence); hosted workbook preview pending; live ingest not authorized.**

**Re-check (2026-04-24 UTC — Safety Proof Gates plan execution):** Entra consent **still blocks** Azure CLI delegated token acquisition against `api://08c399eb-a394-4087-b859-659d493f8dc7` (**`AADSTS65001` / `consent_required`** for Microsoft Azure CLI `04b07795-8ddb-461a-bbee-02f9e1bf7b46`). **`GET /api/health/ready` with admin bearer was not run**; **role-matrix** and **hosted workbook preview** were **not run** (no fabricated token, role, preview, or ingest proof). **No deployment** and **no `HBC_FUNCTIONS_BUILD_*` app-settings restamp** were performed during this pass. Baseline **`/api/health`** (HTTP **200**) was captured **only** as runtime identity context, not as deployed-code proof. Evidence: `.tmp/functions-validation/proof-pass-20260424-*` (see section **Proof pass — 2026-04-24 UTC** below).

**Supersession (post-consent operator proof):** Entra consent for delegated acquisition to `api://08c399eb-a394-4087-b859-659d493f8dc7` is **resolved**. **`GET /api/health/ready`** returned **HTTP 200** with `requestId` **`518c085d-6ed2-47c0-87eb-9cd92d2c393d`** using a token whose safe claims include `scp=access_as_user` and **`Admin`** app role. **Rollout readiness remains blocked** by configured gates (`operationalReadiness` **`degraded`**; Safety rollout readiness blocked for missing rollout/proof app settings and incomplete provisioning prerequisites). **Role matrix** is **blocked** until Reviewer/Submitter/Operator delegated tokens exist on CLI (see `.tmp/functions-validation/role-matrix-20260424T211708Z/`). **Hosted workbook preview** remains **pending**; **live ingest** is **not authorized**. Evidence: `.tmp/functions-validation/proof-pass-admin-ready-20260424-*` and section **Post-consent admin readiness — operator proof** under **Proof pass — 2026-04-24 UTC** below.

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

**Verdict (current):** **Entra consent resolved.** **Admin-gated `GET /api/health/ready` is proven** (HTTP **200**; `requestId` **`518c085d-6ed2-47c0-87eb-9cd92d2c393d`**; safe token claims: `scp=access_as_user`, `roles` includes **`Admin`**). **Rollout readiness remains blocked** by configured gates: `operationalReadiness` **`degraded`**; Safety rollout readiness **blocked** (missing rollout/proof app settings; incomplete provisioning prerequisites) — **not** an auth failure.

**Verdict (historical — pre-consent):** Automated token acquisition previously failed with **`AADSTS65001`**; see evidence files and **Proof pass — 2026-04-24 UTC** below.

**Overall classification:** Deployment and route proof **closed**; admin **HTTP call** to `/api/health/ready` **closed**; **rollout/posture readiness blocked**; role matrix **blocked** (token/assignment gap); hosted workbook preview **pending**; live ingest **not authorized**.

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
| Method | Azure CLI delegated token acquisition (`az account get-access-token --resource "$API_AUDIENCE"`) and/or approved interactive login |
| Raw token printed? | No (repo policy) |
| Token acquired? | **Yes** (post-consent operator proof) |
| Safe claim summary | `scp=access_as_user`; `roles` includes **`Admin`** |
| Blocking error (historical) | Previously `AADSTS65001` / `consent_required` — **superseded** |
| `/api/health/ready` called with admin bearer? | **Yes** — HTTP **200**; `requestId` **`518c085d-6ed2-47c0-87eb-9cd92d2c393d`** |

**Historical (pre-consent):** The Azure CLI token request failed before any JWT was issued:

```text
AADSTS65001: The user or administrator has not consented to use the application with ID '04b07795-8ddb-461a-bbee-02f9e1bf7b46' named 'Microsoft Azure CLI'.
```

Evidence files:

- `.tmp/functions-validation/admin-token-acquisition-error.txt`
- `.tmp/functions-validation/admin-token-acquisition-status.txt`
- `.tmp/functions-validation/aadsts65001-admin-readiness-debug.log`
- `.tmp/functions-validation/aadsts65001-admin-readiness-extract.txt`
- `.tmp/functions-validation/proof-pass-admin-ready-20260424-operator-summary.txt`
- `.tmp/functions-validation/proof-pass-admin-ready-20260424-ready-sanitized.json`

### Consent request package

| Field | Value |
| ----- | ----- |
| Tenant ID | `0e834bd7-628b-42c8-b9ec-ecebc9719be4` |
| API audience / resource | `api://08c399eb-a394-4087-b859-659d493f8dc7` |
| Client requiring delegated consent | Microsoft Azure CLI (`04b07795-8ddb-461a-bbee-02f9e1bf7b46`) |
| Required app role for readiness | `Admin` or `HBIntelAdmin` |
| Purpose | Allow authorized admin users to acquire delegated tokens for the HB Intel backend API so `GET /api/health/ready` and future admin-gated backend proof checks can be run. |
| Prior blocker (historical) | `AADSTS65001` — consent required before Azure CLI/user token acquisition could succeed. |
| **Current status** | **Resolved** — operator proof shows successful delegated acquisition and admin-gated readiness HTTP **200**. |

Interactive consent/auth command supplied by Azure CLI:

```bash
az login --tenant "0e834bd7-628b-42c8-b9ec-ecebc9719be4" \
  --scope "api://08c399eb-a394-4087-b859-659d493f8dc7/.default"
```

No random app-registration edits were attempted in the documented passes.

### Next required action

**Rollout / posture closure:** full `/api/health/ready` JSON is captured at `.tmp/functions-validation/health-ready-full-20260424T203332Z.json` (verified no bearer/JWT substrings). Re-run after each settings change and compare extracts. Remediate using **Full readiness JSON capture — remediation checklist** until Safety rollout gates match policy.

**Downstream proofs:** role matrix (approved tokens), hosted workbook preview (real SharePoint context), then live ingest only when preview is clean and explicitly authorized.

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
- `proof-pass-20260424-baseline.txt`, `proof-pass-20260424-health.json`, `proof-pass-20260424-az-account.json`
- `proof-pass-20260424-token-acquisition-stderr.txt`, `proof-pass-20260424-token-acquisition-status.txt`
- `proof-pass-admin-ready-20260424-operator-summary.txt`, `proof-pass-admin-ready-20260424-ready-sanitized.json` (post-consent admin `/api/health/ready` proof; no bearer material)
- `health-ready-latest-path.txt` (pointer to latest full capture basename)
- `health-ready-full-20260424T203332Z.json`, `health-ready-full-20260424T203332Z-http.txt`, `health-ready-full-20260424T203332Z-readiness-extract.json` (full `/api/health/ready` body + HTTP code + non-secret extract; verified no `eyJ` / `Bearer`)

---

## Proof pass — 2026-04-24 UTC (Safety Proof Gates plan execution)

**Timestamp (UTC):** `2026-04-24T19:54:16Z` (baseline) / `2026-04-24T19:54:26Z` (token attempt, per Azure error line in stderr evidence)

**Repo state (local):** branch `main`, HEAD `190fc85362033e4221281be18c486e3be45d0b9a` (`docs: record admin readiness consent blocker`).

### Constraints honored

- **No** Functions deployment or redeploy (`azure/functions-action`, `az functionapp deploy`, etc.).
- **No** `HBC_FUNCTIONS_BUILD_*` app-settings restamp.
- **`/api/health`** used **only** as optional runtime identity context (HTTP status + public JSON fields), **not** as sole proof of deployed package contents.

### Commands executed (cwd: repo root)

**Baseline + `/api/health` (no bearer):**

```bash
mkdir -p .tmp/functions-validation
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "timestamp_utc=$TS" > .tmp/functions-validation/proof-pass-20260424-baseline.txt
git rev-parse --abbrev-ref HEAD >> .tmp/functions-validation/proof-pass-20260424-baseline.txt
git rev-parse HEAD >> .tmp/functions-validation/proof-pass-20260424-baseline.txt
git log -1 --oneline >> .tmp/functions-validation/proof-pass-20260424-baseline.txt
echo "LIVE_HOST=https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net" \
  >> .tmp/functions-validation/proof-pass-20260424-baseline.txt
curl -sS -o .tmp/functions-validation/proof-pass-20260424-health.json -w "http_code=%{http_code}\n" \
  "https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net/api/health" \
  >> .tmp/functions-validation/proof-pass-20260424-baseline.txt
```

**Azure CLI account context (read-only):**

```bash
az account show -o json > .tmp/functions-validation/proof-pass-20260424-az-account.json
```

**Delegated token acquisition (no token printed; stdout directed to temp path only):**

```bash
API="api://08c399eb-a394-4087-b859-659d493f8dc7"
OUT_ERR=".tmp/functions-validation/proof-pass-20260424-token-acquisition-stderr.txt"
OUT_STATUS=".tmp/functions-validation/proof-pass-20260424-token-acquisition-status.txt"
TOKEN_TMP=".tmp/functions-validation/proof-pass-20260424-admin-token.tmp"
rm -f "$TOKEN_TMP"
if az account get-access-token --resource "$API" --query accessToken -o tsv > "$TOKEN_TMP" 2> "$OUT_ERR"; then
  echo "exit=0 acquired=yes" > "$OUT_STATUS"
else
  echo "exit=$? acquired=no" > "$OUT_STATUS"
fi
rm -f "$TOKEN_TMP"
```

### Entra consent — 2026-04-24 agent pass (historical)

**At the time of the automated 2026-04-24 re-check, consent was still blocking:** `az account get-access-token --resource api://08c399eb-a394-4087-b859-659d493f8dc7` failed with **`AADSTS65001`** (user/administrator had not consented for **Microsoft Azure CLI** `04b07795-8ddb-461a-bbee-02f9e1bf7b46` to the API resource). Full stderr preserved in `.tmp/functions-validation/proof-pass-20260424-token-acquisition-stderr.txt` (no bearer token material).

**Superseded for the admin-call gate:** post-consent operator proof shows delegated acquisition and **`GET /api/health/ready` HTTP 200** (see **Post-consent admin readiness — operator proof** below). This historical subsection documents the **2026-04-24 agent** state only.

### Gate outcomes (2026-04-24 agent pass only)

| Gate | Verdict |
| ---- | ------- |
| Admin readiness (`GET /api/health/ready` + admin roles) | **Not run** — no access token issued in that automated pass |
| Role matrix (reviewer ingest / submitter replay / operator preview validation) | **Not run** — blocked by token acquisition in that pass |
| Hosted workbook preview | **Not run** — blocked by token acquisition in that pass |

### Post-consent admin readiness — operator proof (supersedes admin-call gate only)

| Field | Value |
| ----- | ----- |
| Endpoint | `GET https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net/api/health/ready` |
| HTTP status | **200** (admin bearer; first operator-attested call) |
| `requestId` (first operator-attested call) | **`518c085d-6ed2-47c0-87eb-9cd92d2c393d`** |
| Token safe claims (decoded only) | `scp=access_as_user`; `roles` includes **`Admin`** |
| `operationalReadiness` | **`degraded`** |
| Safety rollout readiness | **Blocked** — missing rollout/proof app settings; incomplete provisioning prerequisites (**not** auth failure) |

**Full JSON capture (subsequent automated call, same endpoint):** HTTP **200**; `requestId` **`658325d8-6b27-429a-a324-b15a73157be5`**; files `.tmp/functions-validation/health-ready-full-20260424T203332Z.json` (full body), `.tmp/functions-validation/health-ready-full-20260424T203332Z-http.txt` (status code), `.tmp/functions-validation/health-ready-full-20260424T203332Z-readiness-extract.json` (non-secret field extract). Confirmed **no** `eyJ` / `Bearer` material in the saved JSON.

| Field (from full capture) | Value |
| ----- | ----- |
| `operationalReadiness` | **`degraded`** |
| `environmentPosture` | **`staging`** |
| `safetyPermissionPosture` | **`pre-rollout-tightened`** / `permissionModel` **`sites-selected`** / `passed` **`false`** |
| `safetyRolloutReadiness.ready` | **`false`** |
| `safetyRolloutReadiness.issueCodes` | **`SAFETY_TIGHTENED_POSTURE_REQUIRES_SITES_SELECTED_CONFIRMATION`**, **`SAFETY_TIGHTENED_POSTURE_PROOF_NOT_CONFIRMED`**, **`SAFETY_TIGHTENED_E2E_PROOF_NOT_CONFIRMED`**, **`SAFETY_TIGHTENED_PROOF_EVIDENCE_ID_MISSING`**, **`SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC_MISSING`**, **`SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL_MISSING`**, **`SAFETY_ROLLOUT_GATE_NOT_ENABLED`**, **`SAFETY_ROLLOUT_CHECKPOINT_ID_MISSING`** |
| `provisioningPrereqs` | `graphPermission` **`false`**; `hubSite` **`false`**; `appCatalog` **`false`**; `spfxAppId` **`false`**; `opexManager` **`true`** |
| `configTiers` | `core` **`ready`**; `sharepoint` **`ready`**; `provisioning` **`incomplete`**; `safetyPermissionPosture` **`blocked`**; `safetyRolloutGate` **`blocked`** |
| `rolloutPermissionInventory` | `posture` **`pre-rollout-tightened`**; `required` includes **`Sites.Selected`**, **`Group.ReadWrite.All`**; `forbidden` includes **`Sites.FullControl.All`** |

Evidence: `.tmp/functions-validation/proof-pass-admin-ready-20260424-operator-summary.txt`, `.tmp/functions-validation/proof-pass-admin-ready-20260424-ready-sanitized.json`.

### Latest `/api/health/ready` capture — after `SHAREPOINT_APP_CATALOG_URL` apply (2026-04-24 UTC)

| Item | Value |
| ----- | ----- |
| Azure change | `az functionapp config appsettings set -g hb-intel -n hb-intel-function-app --settings SHAREPOINT_APP_CATALOG_URL=https://hedrickbrotherscom.sharepoint.com/sites/appcatalog` — **no** `HBC_FUNCTIONS_BUILD_*` restamp. |
| Catalog URL source | Microsoft Graph `GET https://graph.microsoft.com/v1.0/sites/hedrickbrotherscom.sharepoint.com:/sites/appcatalog` → `webUrl` **`https://hedrickbrotherscom.sharepoint.com/sites/appcatalog`** (pre-apply verification). |
| `GET /api/health/ready` | HTTP **200**; `requestId` **`e335cda7-693f-480c-9435-ebd66dbae234`** (delegated token audience `api://08c399eb-a394-4087-b859-659d493f8dc7`; token material **not** stored in evidence files). |
| `provisioningPrereqs.appCatalog` | **`true`** (was **`false`** in `.tmp/functions-validation/health-ready-full-20260424T203332Z.json`). |
| `provisioningPrereqs` still **`false`** | `graphPermission`, `hubSite`, `spfxAppId` — see **Hub / SPFx determination** below. |
| `safetyRolloutReadiness.ready` | **`false`** — same eight `issueCodes` as prior capture (tightened proof, Sites.Selected confirmation, rollout gate/checkpoint still absent). |
| `configTiers.provisioning` | **`incomplete`** (hub + SPFx + Graph confirmation still open). |

Artifacts: `.tmp/functions-validation/health-ready-full-20260424T213921Z.json` (full body), `health-ready-full-20260424T213921Z-http.txt`, `health-ready-full-20260424T213921Z-readiness-extract.json`.

#### Hub site id (`SHAREPOINT_HUB_SITE_ID`) — determination status

- **Not set on the Function App** in this pass (no fabricated hub proof).
- **PnP contract:** Step 7 calls `joinHubSiteById` with the configured GUID ([`sharepoint-provisioning-service.ts`](../../../../../../backend/functions/src/services/sharepoint-provisioning-service.ts)); the value must match a **SharePoint-registered hub site** id, not merely “a site we use for projects.”
- **Graph fact (site addressing, not hub registration proof):** `GET /v1.0/sites/hedrickbrotherscom.sharepoint.com:/sites/HBCentral` returns composite `id` **`hedrickbrotherscom.sharepoint.com,a40963f8-7702-4f7a-a65b-27e6bf96a09e,b0421fa9-8885-4449-b281-95a5f4512102`** — middle segment **`a40963f8-7702-4f7a-a65b-27e6bf96a09e`** is the usual **site collection id** encoding for that URL; it is a **candidate** hub join id **only if** HB Central is the designated tenant hub. Aligns with live **`SHAREPOINT_PROJECTS_SITE_URL`** pointing at `/sites/HBCentral`, but **does not** prove hub registration.
- **Blocked automation:** SharePoint REST `GET https://hedrickbrotherscom.sharepoint.com/_api/HubSites` with Azure CLI–issued SharePoint resource token returned **`401`** body **`{"error":"invalid_request"}`** (no hub enumeration in this session). Microsoft Graph site search / catalog list APIs were not usable here without **`Sites.Read.All`** (search returned **403**) or returned **empty** catalog lists under the current token.
- **Operator / portal next step:** SharePoint admin center or `Get-SPOHubSite` / support ticket — confirm which hub **`SiteId`** must receive new project-site associations; set **`SHAREPOINT_HUB_SITE_ID`** to that confirmed id.

#### SPFx product id (`HB_INTEL_SPFX_APP_ID`) — determination status

- **Not set on the Function App** in this pass (no tenant catalog package enumeration succeeded).
- **Graph:** `GET /v1.0/sites/{appcatalogGraphId}/lists?$top=100` returned **`value: []`** for the app catalog site id resolved above (insufficient visibility or API shape for “Apps for SharePoint” in this token context).
- **Repo build ids (candidates only — must match deployed catalog `ProductId`):** e.g. Safety solution id **`e78a16be-7853-40a4-be18-3b01b3ca405d`** ([`apps/safety/config/package-solution.json`](../../../../../../apps/safety/config/package-solution.json)); Admin **`a77a1dbc-7ba3-42e1-b8f1-3524550dd136`** ([`apps/admin/config/package-solution.json`](../../../../../../apps/admin/config/package-solution.json)); Foleon shell **`c23635f5-ab4d-44c2-96b5-2a2c90f4afc0`** ([`tools/spfx-shell/config/package-solution.json`](../../../../../../tools/spfx-shell/config/package-solution.json)); other packages under `apps/*/config/package-solution.json`. **Pick the id of the package Step 5 actually installs** (tenant App Catalog UI or ALM `AvailableApps` with appropriate SharePoint app-only rights).

### Full readiness JSON capture — remediation checklist (2026-04-24 UTC)

Apply in order appropriate to your change window; each item maps to live `issueCodes` and/or `provisioningPrereqs` / `configTiers` from `.tmp/functions-validation/health-ready-full-20260424T203332Z.json` **superseded for `appCatalog` status by** `.tmp/functions-validation/health-ready-full-20260424T213921Z.json`.

**Provisioning prerequisites (`configTiers.provisioning` = `incomplete`):**

1. Set **`GRAPH_GROUP_PERMISSION_CONFIRMED=true`** after Entra **`Group.ReadWrite.All`** consent is confirmed for provisioning control-plane (currently `provisioningPrereqs.graphPermission` = `false`).
2. Set **`SHAREPOINT_HUB_SITE_ID`** to the hub site id (`provisioningPrereqs.hubSite` = `false`).
3. ~~Set **`SHAREPOINT_APP_CATALOG_URL`** to the tenant app catalog URL (`provisioningPrereqs.appCatalog` = `false`).~~ **Done** — see **Latest `/api/health/ready` capture — after `SHAREPOINT_APP_CATALOG_URL` apply** (`provisioningPrereqs.appCatalog` = **`true`** in `health-ready-full-20260424T213921Z.json`).
4. Set **`HB_INTEL_SPFX_APP_ID`** to the deployed SPFx solution app id (`provisioningPrereqs.spfxAppId` = `false`).
5. **`OPEX_MANAGER_UPN`** is already satisfied (`opexManager` = `true` in capture).

**Safety tightened proof + posture confirmations (`safetyRolloutReadiness.issueCodes`):**

6. Set **`SITES_SELECTED_GRANT_CONFIRMED=true`** after Sites.Selected per-site grant workflow is verified (`SAFETY_TIGHTENED_POSTURE_REQUIRES_SITES_SELECTED_CONFIRMATION`).
7. Set **`SAFETY_TIGHTENED_PROOF_EVIDENCE_ID`** to the immutable proof artifact / run identifier (`SAFETY_TIGHTENED_PROOF_EVIDENCE_ID_MISSING`).
8. Set **`SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC`** to ISO-8601 UTC when tightened proof was executed (`SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC_MISSING`).
9. Set **`SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL=sites-selected`** after proof ran under the tightened model (`SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL_MISSING`).
10. Set **`SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED=true`** after validating the final Safety permission matrix and rollout gates (`SAFETY_TIGHTENED_POSTURE_PROOF_NOT_CONFIRMED`).
11. Set **`SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED=true`** after successful ingest + replay under tightened posture (`SAFETY_TIGHTENED_E2E_PROOF_NOT_CONFIRMED`).
12. Set **`SAFETY_ROLLOUT_CHECKPOINT_ID`** to the immutable approval identifier (pattern per backend: 8–128 chars, alphanumerics plus `._:-`) (`SAFETY_ROLLOUT_CHECKPOINT_ID_MISSING`).
13. Set **`SAFETY_ROLLOUT_GATE_ENABLED=true`** only after rollout approval is recorded **with** checkpoint id (`SAFETY_ROLLOUT_GATE_NOT_ENABLED`).

**Integrations (contribute to `operationalReadiness` = `degraded` when not ready):**

14. Configure **`AzureSignalRConnectionString`** so `integrations.signalR` moves from `not-configured` to `ready`, **or** set **`OPERATIONAL_READINESS_SIGNALR_MODE=optional`** on the Function App only if operators explicitly accept that Safety closure work may proceed while SignalR remains absent — `operationalReadiness` then ignores the SignalR dimension, but **`integrations.signalR` still reports `not-configured`** until the connection string exists (see `backend/functions/src/utils/signalr-operational-readiness.ts`, package **`@hbc/functions` `00.000.151`**).
15. Optionally configure email (`EMAIL_DELIVERY_API_KEY`, `EMAIL_FROM_ADDRESS`) and other integrations as required by policy.

**Not in this pass:** role matrix, hosted workbook preview, live ingest (see **Remaining gates (current)**).

### Rollout remediation — repo findings and live actions (no fabricated proof booleans)

**SharePoint URLs / IDs:**

- **`SHAREPOINT_APP_CATALOG_URL`:** **Applied** on live **`hb-intel-function-app`** (rg **`hb-intel`**) to **`https://hedrickbrotherscom.sharepoint.com/sites/appcatalog`**, matching Graph-resolved `webUrl` for `…:/sites/appcatalog`. Canonical pattern remains documented in [backend/functions/README.md](../../../../../../backend/functions/README.md).
- **`SHAREPOINT_HUB_SITE_ID`:** **Still unset** in Azure — see **Hub site id** subsection under **Latest `/api/health/ready` capture** for candidate vs proof requirements.
- **`HB_INTEL_SPFX_APP_ID`:** **Still unset** in Azure — see **SPFx product id** subsection for repo candidate GUIDs vs tenant catalog proof.

**Confirmation booleans (do not set `true` without real evidence):**

- **`GRAPH_GROUP_PERMISSION_CONFIRMED=true`:** Justified only after IT confirms **application permission `Group.ReadWrite.All`** for the Functions app identity per [backend/functions/src/utils/validate-config.ts](../../../../../../backend/functions/src/utils/validate-config.ts) and provisioning docs (README **Provisioning Staging Gates**). **Action:** Entra portal → App registration → API permissions → verify granted admin consent; export evidence; then set the flag.
- **`SITES_SELECTED_GRANT_CONFIRMED=true`:** Justified only after **per-site `Sites.Selected` admin consent** for the Safety resource sites is verified (Option A2 workflow). **Action:** SharePoint / Graph grant audit; do **not** set from repo inspection alone.

**Safety tightened / rollout proof flags (remain blocked in this session per policy):**

- Do **not** set **`SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED`**, **`SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED`**, or **`SAFETY_ROLLOUT_GATE_ENABLED`** until the corresponding ingest/replay proof and approval artifacts exist (`SAFETY_TIGHTENED_PROOF_*`, **`SAFETY_ROLLOUT_CHECKPOINT_ID`**, etc., per live `issueCodes` in the archived readiness JSON).

**SignalR vs Safety closure:**

- **`safetyRolloutReadiness`** does **not** read SignalR — SignalR only influenced **`operationalReadiness`** via `computeReadiness`.
- **Default:** SignalR connection string **still required** for a fully **ready** operational tier unless **`OPERATIONAL_READINESS_SIGNALR_MODE=optional`** is set as documented above.

**Azure / manual actions:** set the SharePoint + provisioning env vars in the Function App; complete Entra and Sites.Selected verification; wire SignalR or opt in to optional operational mode; then re-capture `/api/health/ready` to `.tmp/functions-validation/` (not committed).

### Baseline `/api/health` (identity context only)

- **HTTP status:** `200` (recorded in `proof-pass-20260424-baseline.txt`).
- **Response body (public):** `proof-pass-20260424-health.json` — `artifact.version` **`00.000.150`**, `artifact.commitSha` **`51be63a10df49098a974a1312ef7395575638a69`**, `artifact.buildTimestamp` **`2026-04-24T19:41:33.834Z`**.

### Remaining gates (2026-04-24 agent pass — historical list)

1. Tenant/admin **Entra consent** so Azure CLI (or another approved client) can obtain delegated tokens for `api://08c399eb-a394-4087-b859-659d493f8dc7`. (**Done** as of post-consent proof — kept for audit trail.)
2. Acquire a **fresh** admin-capable token (claims include **`Admin`** or **`HBIntelAdmin`**), decode **safe claims only**, then **`GET /api/health/ready`** and record required readiness fields + `requestId`. (**Done** — full redacted JSON captured under `.tmp/functions-validation/health-ready-full-20260424T203332Z.json`; see **Full readiness JSON capture** below.)
3. With **approved** role-specific tokens, run **role-matrix** proof (reviewer ingest denied, submitter replay denied, operator empty preview → validation failure not auth). (**Still pending.**)
4. **Hosted workbook preview** with real SharePoint reporting-period + `reportingPeriodSpItemId` + project context + governed workbook; **no live ingest** until preview is clean and operator authorizes commit-path proof. (**Preview pending; ingest not authorized.**)

### Remaining gates (current)

1. **Rollout readiness:** remediate app settings / provisioning until Safety rollout gates clear (see **Remediation checklist** under **Full readiness JSON capture**). Full `/api/health/ready` JSON is archived locally at `.tmp/functions-validation/health-ready-full-20260424T203332Z.json` and **post–app-catalog apply** at `.tmp/functions-validation/health-ready-full-20260424T213921Z.json` (not committed).
2. **Role matrix** with approved reviewer/submitter/operator tokens.
3. **Hosted workbook preview** with real SharePoint + project context.
4. **Live ingest** only after clean preview and explicit operator authorization.

### Evidence files (2026-04-24 agent pass)

| File | Purpose |
| ---- | ------- |
| `.tmp/functions-validation/proof-pass-20260424-baseline.txt` | UTC timestamp, git ref, live host line, `/api/health` HTTP code |
| `.tmp/functions-validation/proof-pass-20260424-health.json` | `/api/health` JSON (no secrets) |
| `.tmp/functions-validation/proof-pass-20260424-az-account.json` | `az account show` (tenant/subscription/user type) |
| `.tmp/functions-validation/proof-pass-20260424-token-acquisition-stderr.txt` | Entra error text (`AADSTS65001`) |
| `.tmp/functions-validation/proof-pass-20260424-token-acquisition-status.txt` | Acquisition outcome summary |

### Evidence files (post-consent operator proof)

| File | Purpose |
| ---- | ------- |
| `.tmp/functions-validation/proof-pass-admin-ready-20260424-operator-summary.txt` | Operator-attested HTTP **200**, `requestId`, safe claims, posture summary (no secrets) |
| `.tmp/functions-validation/proof-pass-admin-ready-20260424-ready-sanitized.json` | Sanitized excerpt; superseded for field detail by full capture below |
| `.tmp/functions-validation/health-ready-full-20260424T203332Z.json` | Full `/api/health/ready` JSON (no bearer/JWT material) |
| `.tmp/functions-validation/health-ready-full-20260424T203332Z-http.txt` | HTTP status line output (`200`) |
| `.tmp/functions-validation/health-ready-full-20260424T203332Z-readiness-extract.json` | Non-secret subset for quick diffing |
| `.tmp/functions-validation/health-ready-full-20260424T213921Z.json` | Full `/api/health/ready` after **`SHAREPOINT_APP_CATALOG_URL`** apply (`provisioningPrereqs.appCatalog` **true**) |
| `.tmp/functions-validation/health-ready-full-20260424T213921Z-http.txt` | HTTP status (`200`) for post-catalog capture |
| `.tmp/functions-validation/health-ready-full-20260424T213921Z-readiness-extract.json` | Non-secret subset for post-catalog capture |
| `.tmp/functions-validation/hub-sites-rest-probe-20260424T213800Z.txt` | SharePoint `/_api/HubSites` probe outcome (**401** `invalid_request` with CLI-issued SPO token — hub list not machine-readable in this pass) |
