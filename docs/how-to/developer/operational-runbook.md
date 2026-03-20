# HB Intel Operational Runbook

**Classification:** How-To (Procedural)
**Audience:** Platform engineering, DevOps, on-call responders
**Last Updated:** 2026-03-20
**References:** [P1-C3 Observability Spec](../../architecture/plans/MASTER/phase-1-deliverables/P1-C3-Observability-and-Instrumentation-Spec.md), [monitoring-queries.md](../../reference/developer/monitoring-queries.md), `infra/monitoring.bicep`

---

## Alert Response Procedures

### Alert 1: Auth Failure Burst (Sev 1)

**Trigger:** > 3 `auth.bearer.error` events in 1 minute
**MTTD target:** < 2 minutes

**Response:**
1. Check if the failure is widespread or isolated to a single user (run Auth Failure Breakdown query)
2. Verify Azure AD service health: https://status.azure.com
3. Check MSAL configuration — is the app registration `AZURE_CLIENT_ID` still valid?
4. Check if the Bearer token audience matches the expected value
5. If widespread: escalate to IT for Entra ID investigation

**Common causes:** Expired app registration secret, Azure AD outage, misconfigured CORS allowing requests without valid tokens, token audience mismatch after app registration change.

---

### Alert 2: Handler Error Rate Elevated (Sev 2)

**Trigger:** > 10 `handler.error` events in 5 minutes
**MTTD target:** < 5 minutes

**Response:**
1. Run Handler Error Rate query to identify which domain is failing
2. Check if errors are 4xx (client) or 5xx (server) — 4xx spikes may be a broken client release
3. For 5xx: check downstream service health (SharePoint, Cosmos DB, Graph)
4. Verify `GET /api/health` returns 200
5. Check Function App metrics in Azure Portal for memory/CPU/cold-start issues

**Common causes:** Downstream SharePoint throttling (429), Cosmos DB RU exhaustion, bad deployment, schema mismatch between client and server.

---

### Alert 3: Provisioning Saga Failure (Sev 2)

**Trigger:** Any `ProvisioningSagaFailed` event
**MTTD target:** < 1 minute

**Response:**
1. Run Provisioning Saga Outcomes query — find the failed `projectId` and `correlationId`
2. Check which step failed using Step Duration query with the correlation ID
3. Compensation runs automatically — verify it completed (`ProvisioningStepCompleted` with compensation flag)
4. Common step failures:
   - **Step 1 (site creation):** SharePoint quota or naming conflict
   - **Step 2 (document library):** Permission issue on hub site
   - **Step 3 (template files):** Template file not found in source library
   - **Step 4 (data lists):** List schema conflict
   - **Step 5 (web parts):** Deferred to nightly timer if SPFx not ready
   - **Step 6 (permissions):** Graph permission not granted (IT action required)
5. After diagnosis: fix root cause, then retry via PATCH to re-enter the saga

---

### Alert 4: Timer Function Failure (Sev 2)

**Trigger:** Any `ProvisioningTimerJobFailed` or `idempotency.cleanup.error` event
**MTTD target:** < 5 minutes

**Response:**
1. Identify which timer failed (Step 5 nightly at 1 AM EST, or cleanup at 3 AM EST)
2. For Step 5 failures: run Timer Execution History query — check if the deferred job exceeded retry threshold
3. For cleanup failures: check Cosmos DB connectivity and table access
4. Timer failures are non-blocking — the next nightly run will retry. Escalate only if failures persist across 2+ consecutive nights.

---

## Health Verification

**Health endpoint:** `GET /api/health` (anonymous)

```bash
curl -s https://<func-app>.azurewebsites.net/api/health | jq .
```

Expected response (200):
```json
{
  "status": "healthy",
  "environment": "Production",
  "timestamp": "2026-03-20T12:00:00.000Z"
}
```

If the health endpoint returns non-200 or times out: check Function App status in Azure Portal, verify the app is started and not in a restart loop.

---

## Timer Function Schedule

| Timer | Schedule | Purpose |
|---|---|---|
| `timerFullSpec` | `0 0 1 * * *` (1:00 AM EST) | Process deferred Step 5 web part provisioning jobs |
| `cleanupIdempotency` | `0 0 3 * * *` (3:00 AM EST) | Delete expired idempotency records (24h TTL) |

Both timers require `WEBSITE_TIME_ZONE=Eastern Standard Time` in app settings.

---

## Escalation Path

1. **On-call responder** — acknowledge alert, run initial investigation
2. **Platform engineering** — infrastructure issues (Cosmos DB, Storage, Function App)
3. **IT** — Entra ID / Graph permission issues, SharePoint tenant configuration
4. **Architecture** — design-level issues requiring ADR or plan revision
