# Safety Ingest Triage & Recovery Runbook

Operator-facing triage for the Safety backend ingest / preview / replay paths (`@hbc/functions`, live host `hb-intel-function-app`).

**When to use:** a Safety ingestion failure has surfaced in CI, in `/api/health*`, in Application Insights, or as a user-reported incident.

**When NOT to use:** provisioning saga failures → `provisioning-runbook.md`; SPFx deployment failures → `spfx-deployment-runbook.md`; generic alert routing → `docs/how-to/developer/operational-runbook.md`.

**Prerequisites:** admin bearer token for `hb-intel-function-app` `/api/health/ready`; `az` CLI logged in; access to Application Insights for the Function App.

**Single telemetry reference:** all event names, failure-class values, `authLane`, and `causeBucket` enums referenced below are defined in `docs/reference/developer/safety-ingest-telemetry-reference.md`. When in doubt about an event shape, consult that reference first.

## Quick signal table

| Symptom | Jump to |
| --- | --- |
| `/api/health` artifact field shows `"unknown"`, or `safety.ingestion.*` events stamp an unexpected `backendVersion` | [Proof-path #1 — Artifact drift](#proof-path-1--artifact-drift) |
| `safety.ingestion.graph.failure.classified` with `failureClass="identity-not-acquired"` or `authLane="identity"` | [Proof-path #2 — Identity drift](#proof-path-2--identity-drift) |
| 401 / 403 on Safety routes, `failureClass` starts with `permission-denied-`, `/api/health/ready` reports `safetyPermissionPosture.passed === false` | [Proof-path #3 — Graph grant failure](#proof-path-3--graph-grant-failure) |
| `safety.ingestion.reporting-period.read.failed` (any `causeBucket`), or `safety.ingestion.graph.concurrency.*` | [Proof-path #4 — Reporting-period / item binding failure](#proof-path-4--reporting-period--item-binding-failure) |

## Proof-path 1 — Artifact drift

### Signals

- `/api/health` returns `artifact.version === "unknown"`, `artifact.commitSha === "unknown"`, or `artifact.buildTimestamp === "unknown"`.
- Post-deploy parity workflow (`scripts/verify-functions-live-parity.ts`) failed with `identityParity.issues` containing `health.artifact.missing`, `identityParity.versionMatch === false`, or `identityParity.commitShaMatch === false`.
- `safety.ingestion.*` events stamp a `backendVersion` that does not match the last deployed `@hbc/functions` version.

### Diagnosis

```bash
# 1. What version / SHA / timestamp does the live host report?
curl -s https://hb-intel-function-app.azurewebsites.net/api/health | jq .artifact

# 2. What stamp env-vars does the Function App actually carry?
az functionapp config appsettings list \
  --name hb-intel-function-app \
  --resource-group <rg> \
  --query "[?contains(name,'HBC_FUNCTIONS_BUILD_')].{name:name,value:value}" -o table
```

**Kusto:**

```kusto
customEvents
| where timestamp > ago(1h)
| where name startswith "safety.ingestion"
| summarize count() by tostring(customDimensions.backendVersion)
| order by count_ desc
```

If the count shows mixed `backendVersion` values concurrently, a recent deploy did not fully roll out OR the env stamp did not apply; inspect the latest `main_hb-intel-function-app.yml` workflow run for the pre-deploy stamp re-query gate.

### Remediation

1. Re-run the deploy workflow on the correct commit. The pre-deploy stamp step re-queries and fails fast if Azure applied a partial update.
2. If the pre-deploy re-query fails persistently, check Azure control-plane health for the Function App resource group.
3. If the live parity gate fails after deploy, the artifact in the Function App does not match the pushed commit — rollback to the last known-good artifact or redeploy with the corrected manifest.
4. Confirm you are inspecting the **correct Function App resource**. The deploy workflow targets `hb-intel-function-app`, while `infra/legacy-fallback-hosting.bicep` provisions `func-hbintel-legacy-fallback-prod`. If the two are confused, operators will read stale artifact identity from the wrong resource. (This is the residual ops finding tracked in audit report 17; resolving it is outside this runbook.)

### Exit criteria

- `curl /api/health | jq .artifact` returns a 40-char lowercase hex `commitSha`, a valid ISO-8601 `buildTimestamp`, and the expected `version`.
- `safety.ingestion.*` events stamp a single consistent `backendVersion` matching that artifact.

## Proof-path 2 — Identity drift

### Signals

- `safety.ingestion.graph.failure.classified` with `failureClass === "identity-not-acquired"` and `authLane === "identity"`.
- Cold-start / startup logs contain Managed Identity acquisition errors (`DefaultAzureCredential`, `AZURE_CLIENT_ID` mismatches, token cache exhaustion).
- `/api/health/ready` returns with `configTiers.core === "missing"` or the `AZURE_CLIENT_ID` / `AZURE_TENANT_ID` env vars unset.

### Diagnosis

```bash
# 1. Confirm the user-assigned MI is still bound to the Function App.
az functionapp identity show \
  --name hb-intel-function-app \
  --resource-group <rg>

# 2. Confirm AZURE_CLIENT_ID matches the expected user-assigned MI client ID.
az functionapp config appsettings list \
  --name hb-intel-function-app \
  --resource-group <rg> \
  --query "[?name=='AZURE_CLIENT_ID' || name=='AZURE_TENANT_ID' || name=='API_AUDIENCE'].{name:name,value:value}" -o table
```

**Kusto:**

```kusto
customEvents
| where timestamp > ago(15m)
| where name == "safety.ingestion.graph.failure.classified"
| where tostring(customDimensions.failureClass) == "identity-not-acquired"
| project timestamp, requestId = tostring(customDimensions.requestId),
          operation = tostring(customDimensions.operation),
          graphOperation = tostring(customDimensions.graphOperation)
| order by timestamp desc
```

### Remediation

1. If the user-assigned MI is missing from the Function App, re-bind it (`az functionapp identity assign --identities <mi-resource-id>`).
2. If `AZURE_CLIENT_ID` drifted, set it back to the expected MI client ID and restart the Function App.
3. If the tenant changed, update `AZURE_TENANT_ID` to the expected tenant GUID.
4. After any of the above, restart and re-prove via `/api/health/ready` (expect `operationalReadiness: "ready"` and `safetyPermissionPosture.passed: true`).

### Exit criteria

- Zero `identity-not-acquired` events in the 5 minutes following the restart.
- `/api/health/ready` returns `configTiers.core === "ready"`.

## Proof-path 3 — Graph grant failure

### Signals

- `safety.ingestion.graph.failure.classified` with `failureClass in ("permission-denied-401","permission-denied-403")` and `authLane === "permission"`.
- `/api/health/ready` reports `safetyPermissionPosture.passed === false` with codes like `SAFETY_TIGHTENED_POSTURE_REQUIRES_SITES_SELECTED` or `SAFETY_TIGHTENED_POSTURE_REQUIRES_SITES_SELECTED_CONFIRMATION`.
- Ingest / preview / replay routes return 403 consistently.

### Diagnosis

```bash
# 1. Read the posture + inventory from the admin-gated readiness surface.
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://hb-intel-function-app.azurewebsites.net/api/health/ready \
  | jq '{posture: .safetyPermissionPosture.posture,
         passed: .safetyPermissionPosture.passed,
         issues: .safetyPermissionPosture.issues,
         inventory: .rolloutPermissionInventory}'

# 2. Confirm the MI has per-site grants on both sites the hot path touches.
# Replace SITE_ID with the Graph site-id for SAFETY_SITE_URL / HBCENTRAL_SITE_URL.
az rest --method GET \
  --uri "https://graph.microsoft.com/v1.0/sites/<SITE_ID>/permissions?$select=id,roles,grantedToIdentities"
```

**Kusto:**

```kusto
customEvents
| where timestamp > ago(1h)
| where name == "safety.ingestion.graph.failure.classified"
| where tostring(customDimensions.failureClass) startswith "permission-denied"
| summarize count() by
    failureClass = tostring(customDimensions.failureClass),
    statusCode = tostring(customDimensions.statusCode),
    graphOperation = tostring(customDimensions.graphOperation)
```

### Remediation

1. If a per-site `Sites.Selected` grant is missing on either site, re-run `tools/grant-site-access.sh` (or the equivalent `POST /sites/{siteId}/permissions` Graph call) granting the MI `write` role on the offending site. See audit report 16 "Residual operational steps" for the exact step order.
2. If the posture is `staging-broad` in a production environment, switch `SAFETY_PERMISSION_POSTURE=pre-rollout-tightened` (or `steady-state`) and confirm the proof-bundle env vars (`SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED`, `SAFETY_TIGHTENED_PROOF_EVIDENCE_ID`, etc.) are set. See audit report 16 §8 for the full app-setting list.
3. If the MI's Graph app-role assignments include `Sites.FullControl.All`, remove it; `Sites.Selected` + per-site grants is the rollout-safe posture.
4. After remediation, re-prove with the admin readiness query above — expect `safetyPermissionPosture.passed === true`.

### Exit criteria

- Zero `permission-denied-*` events in the 15 minutes following the grant / env-var update.
- `/api/health/ready` returns `safetyPermissionPosture.passed === true` and `rolloutPermissionInventory.required` contains `Sites.Selected`.

## Proof-path 4 — Reporting-period / item binding failure

### Signals

- `safety.ingestion.reporting-period.read.failed` with `failureClass === "item-binding-error"` and a `causeBucket` indicating which boundary failed.
- `safety.ingestion.graph.concurrency.conflict` or `safety.ingestion.graph.concurrency.retry-exhausted` on `SafetyReportingPeriods` / `SafetyProjectWeekRecords`.
- `safety.ingestion.graph.overlay.failed` with a non-null `failureClass` — list-GUID overlay could not be resolved.

### Diagnosis

**Kusto (join failed item binding to the owning run):**

```kusto
let failures = customEvents
  | where timestamp > ago(1h)
  | where name in ("safety.ingestion.reporting-period.read.failed",
                   "safety.ingestion.graph.concurrency.conflict",
                   "safety.ingestion.graph.concurrency.retry-exhausted",
                   "safety.ingestion.graph.overlay.failed")
  | project timestamp, name,
            runId = tostring(customDimensions.runId),
            failureClass = tostring(customDimensions.failureClass),
            causeBucket = tostring(customDimensions.causeBucket),
            listName = tostring(customDimensions.list),
            statusCode = tostring(customDimensions.statusCode);
let requests = customEvents
  | where timestamp > ago(1h)
  | where name == "safety.ingestion.request.failed"
  | project requestTimestamp = timestamp,
            runId = tostring(customDimensions.runId),
            requestFailureClass = tostring(customDimensions.failureClass);
failures
| join kind=leftouter requests on runId
| order by timestamp desc
```

### Remediation

Route by `causeBucket`:

| `causeBucket` | Likely cause | Action |
| --- | --- | --- |
| `item-missing` | List item deleted or never existed | Restore the missing list item; if it was deliberately deleted, update the ingestion input so it no longer references the dead ID |
| `item-contract` | List schema drifted from `FIELD_SCHEMA_BY_LIST` | Align the list schema with `packages/features/safety/src/lists/fieldSchema.ts`; re-run provisioning if needed |
| `list-binding` | List GUID overlay failed — list not found on the site | Re-run the GUID overlay resolver; confirm the list exists on the expected site and its title matches `SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS` |
| `site-binding` | Site not resolvable — MI may not be granted on the site | Follow Proof-path #3 for per-site grant remediation |
| `identity/grant` | Token / grant not in place at read time | Follow Proof-path #2 (identity) then Proof-path #3 (grant) |
| `unknown` | Classifier could not determine — inspect raw event properties | Pull the full `customDimensions` for the failed event and escalate |

For concurrency paths (`conflict` / `retry-exhausted`): the mutation is re-entering under a changing ETag. Confirm the upstream item is not being churned by another process; if the `retry-exhausted` rate spikes, consider temporarily backing off the caller or widening the retry budget after evidence.

### Exit criteria

- Zero `reporting-period.read.failed` and `overlay.failed` events in the 15 minutes after remediation.
- `safety.ingestion.graph.concurrency.retry-exhausted` rate returns to baseline.

## Retention assumption and escalation

Application Insights retention defaults to **90 days** for this Function App. No Bicep override or Log Analytics diagnostic-settings sink is declared today. If an incident requires evidence older than 90 days, it must be exported to Log Analytics **within** the 90-day window; there is no in-place long-term archive. See `docs/reference/developer/safety-ingest-telemetry-reference.md` "Retention assumptions" for the full statement.

Escalation chain: follow `docs/how-to/developer/operational-runbook.md` (Platform Engineering → IT → Architecture).

## Cross-references

- Telemetry reference: `docs/reference/developer/safety-ingest-telemetry-reference.md`
- Audit report 15 (Graph-only cutover closure): `docs/architecture/plans/MASTER/backend/phase-03/audit-reports/15-Graph-Only-Cutover-Closure.md`
- Audit report 16 (Permissions tightening): `docs/architecture/plans/MASTER/backend/phase-03/audit-reports/16-Permissions-Tightening-And-Reproof.md`
- Audit report 17 (Deployment proof & operator readiness): `docs/architecture/plans/MASTER/backend/phase-03/audit-reports/17-Deployment-Proof-And-Operator-Readiness.md`
- Monitoring queries (generic): `docs/reference/developer/monitoring-queries.md`
- App Insights queries (provisioning-focused): `docs/maintenance/appinsights-queries.md`
- Adjacent runbooks: `docs/maintenance/provisioning-runbook.md`, `docs/maintenance/provisioning-observability-runbook.md`, `docs/maintenance/spfx-deployment-runbook.md`
