# OneDeploy HTTP 502 — Support-Ready Evidence Package

**Classification:** Azure platform / SCM gateway / Flex OneDeploy publish path (local `POST .../api/publish?type=zip` returns **502** in ~10–16s; not consistent with a full 130MB upload timeout). **Do not treat `/api/health` app-setting identity as proof that new code was deployed.**

---

## 1. Subscription and resource identity

| Field | Value |
| ----- | ----- |
| Subscription ID | `da99386a-88ef-4987-afc5-12e22690da20` |
| Subscription name | Azure subscription 1 (from `az account show`) |
| Tenant ID | `0e834bd7-628b-42c8-b9ec-ecebc9719be4` |
| Resource group | `hb-intel` |
| Function App name | `hb-intel-function-app` |
| ARM resource ID | `/subscriptions/da99386a-88ef-4987-afc5-12e22690da20/resourceGroups/hb-intel/providers/Microsoft.Web/sites/hb-intel-function-app` |

---

## 2. Flex deployment container (from `functionapp-show.json` → `properties.functionAppConfig`)

| Field | Value |
| ----- | ----- |
| Storage type | `blobcontainer` |
| Container URL | `https://hbintelb8f1.blob.core.windows.net/app-package-hb-intel-function-app-cd0e6ba` |
| Authentication | `userassignedidentity` |
| UAMI resource ID | `/subscriptions/da99386a-88ef-4987-afc5-12e22690da20/resourceGroups/hb-intel/providers/Microsoft.ManagedIdentity/userAssignedIdentities/hb-intel-function-app-uami` |
| UAMI principalId (for RBAC lookups) | `11194065-c745-4c4f-82ae-a2a3a7f92ddb` |

### RBAC observed (CLI)

- **Storage Blob Data Owner** on storage account `hbintelb8f1`
- **Storage Blob Data Contributor** on container `app-package-hb-intel-function-app-cd0e6ba`

---

## 3. SCM / OneDeploy failure (CLI)

**SCM host:** `hb-intel-function-app-gbd6ecgrh7fsgscm.scm.eastus2-01.azurewebsites.net`

**Endpoint:** `POST /api/publish?type=zip` (Azure CLI `az functionapp deploy` logs this as `Deployment API: https://.../api/publish?type=zip`)

**HTTP result:** **502** (HTML “502 - Web server received an invalid response while acting as a gateway or proxy server”, body length ~1477 bytes)

### Timestamps (UTC)

| Event | Time |
| ----- | ---- |
| Prior diagnosis log (`azure-cli` 2.76.0) | `deploy-debug-20260424115210.log` (see repo `.tmp/functions-validation/`) |
| Post-`az upgrade` retry (`azure-cli` **2.85.0**) | `deploy-debug-post-cli-2.85.0-20260424120337.log` |

**Note:** `az upgrade` completed the Homebrew install of `azure-cli` **2.85.0**; the `az upgrade` command itself exited non-zero due to a post-upgrade Python path/traceback while invoking the **old** 2.76.0 shim. Current `which az` → `/opt/homebrew/bin/az`, `az version` → **2.85.0**.

---

## 4. Portal diagnostics (operator — cannot be captured from this agent)

Azure Portal cannot be driven from this environment. The operator should:

1. Open **Function App** `hb-intel-function-app`.
2. **Diagnose and solve problems** → search **Flex Consumption Deployment** (or equivalent Flex deployment troubleshooter).
3. Capture **deployment history**, **package status**, **deployment container / storage** checks, and any **recommended mitigations** (export or screenshots — do not paste secrets).

Attach those exports to the support case.

---

## 5. ARM / activity signals (CLI equivalents)

`az monitor activity-log list --resource-id <site ARM id> --offset 7d` shows recent **`.../sites/hb-intel-function-app/extensions/onedeploy`** write operations (historical successes from ARM) alongside recent **Restart** and **config/appsettings** updates.

This supports the narrative: **ARM-tracked OneDeploy** has succeeded in the past, while **local SCM `api/publish?type=zip`** is currently failing with **502**.

---

## 6. Artifact evidence (local canonical zip)

Paths under repo: `.tmp/functions-validation/` (when present from packaging runs).

| Field | Example from last packaging run (adjust if regenerated) |
| ----- | -------------------------------------------------------- |
| Zip path | `.tmp/functions-validation/functions-artifact.zip` |
| Zip size | ~130 MiB (`136837437` bytes in prior run) |
| SHA256 | `c9b74c415578d67b53093c3335694053d05a75c5173655a7496abeca304e7bc7` (regenerate → update) |
| Package | `@hbc/functions` |
| Version | `00.000.150` |
| Commit | `493319bd1678143b680cddf7d0993a1d47eaf045` |

### Proof the staged artifact contains the probe route

- **Inventory:** `.tmp/functions-validation/functions-deploy/artifact-inventory.json` includes route signature `safety-records/reporting-periods/{reportingPeriodId}/probe` under `adminControlPlaneReleaseProof.safetyRouteSignatures`.
- **Compiled output:** staged `dist/.../safety-record-keeping-routes.js` contains registration `app.http('safetyReportingPeriodProbe', {`.

---

## 7. Live host vs artifact (registration truth)

`az functionapp function list` (as of diagnosis) included `safetyIngestWorkbook`, `safetyPreviewWorkbook`, `safetyReplayWorkbook`, **but not** `safetyReportingPeriodProbe`.

`GET /api/safety-records/reporting-periods/period-1/probe?reportingPeriodSpItemId=1` returned **404** (route not registered on the live worker inventory).

**Conclusion:** Live host is **not** running the full five-route Safety surface from the staged artifact; **do not** close deployment on `/api/health` alone.

---

## 8. GitHub Actions path (recommended next deploy)

The repo already uses **`Azure/functions-action@v1`** in [`.github/workflows/main_hb-intel-function-app.yml`](../../.github/workflows/main_hb-intel-function-app.yml) with OIDC secrets, canonical **`scripts/package-functions-artifact.ts`**, zip **`functions-artifact.zip`**, manifest **`artifact-manifest.json`**, stamp gate, and **`scripts/verify-functions-live-parity.ts`**.

**Gap:** `verify-functions-live-parity.ts` currently probes **four** Safety POST routes; it does **not** include the **reporting-period probe** GET. Until code/workflow is updated in Agent mode, add a **separate workflow step** (bash + `curl` + `az functionapp function list` + `jq`) after the parity step to hard-gate:

- inventory contains a function name ending with `/safetyReportingPeriodProbe`
- GET probe URL returns **non-404** (expect **401** or **403** without bearer)

A ready-to-paste YAML block is in [OneDeploy-502-Workflow-Gate-Appendix.md](./OneDeploy-502-Workflow-Gate-Appendix.md).

---

## 9. If GitHub Actions also returns OneDeploy/SCM 502

Treat as **Azure platform / regional SCM / Flex publish worker** failure. Open a support case and attach:

- This document
- Both CLI debug logs (pre- and post-upgrade)
- Portal Flex deployment diagnostic exports
- Activity log excerpt for `extensions/onedeploy` + recent failures
- Artifact manifest + SHA256 + size
- Proof probe exists in staged artifact (Section 6)

---

## 10. Gates explicitly blocked by user policy

Until `safetyReportingPeriodProbe` is live and **non-404**:

- No hosted workbook preview proof
- No token role-matrix proof
