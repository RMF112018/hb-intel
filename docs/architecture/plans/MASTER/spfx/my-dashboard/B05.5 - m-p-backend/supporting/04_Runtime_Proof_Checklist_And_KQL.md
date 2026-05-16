# Supporting 04 — Runtime Proof Checklist and KQL

## Purpose

This file defines the exact operator proof sequence after the federated Graph token path is implemented and deployed.

---

# 1. Deploy Backend

Deploy the Function App through the existing governed CI/CD deployment lane.

Do not expect any effect before the new backend artifact is deployed.

---

# 2. Refresh My Dashboard

Open or hard-refresh:

```text
https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard/SitePages/Dashboard.aspx
```

---

# 3. Confirm Frontend Data Path Remains Live

Inspect DOM and verify:

```html
data-my-work-data-path="backend-live"
```

The frontend runtime posture should remain unchanged.

---

# 4. Inspect the Project-Links Response

Open the network request:

```text
GET /api/my-work/me/project-links
```

## Expected healthy next state

The response should no longer be:

```text
classification = source-unavailable
projectsSourceStatus = source-unavailable
legacyFallbackRegistrySourceStatus = source-unavailable
```

The expected post-fix state should move to one of:

```text
available
zero-match-available-sources
partial
```

If `partial` appears, the flow may have advanced past site resolution and exposed a downstream list/items issue.

---

# 5. Existing Traces-Based Loader Failure Query

Run:

```kusto
traces
| extend payload = parse_json(message)
| where timestamp > ago(30m)
| where tostring(payload._telemetryType) == "customEvent"
| where tostring(payload.name) in ("projects-loader.failed", "registry-loader.failed")
| project
    timestamp,
    Name = tostring(payload.name),
    CorrelationId = tostring(payload.correlationId),
    ListName = tostring(payload.listName),
    Stage = tostring(payload.stage),
    SanitizedMessage = tostring(payload.sanitizedMessage),
    RuntimeOperation = tostring(payload.runtimeOperation)
| order by timestamp desc
```

---

# 6. How to Interpret Fresh Post-Deploy Events

| Stage | Meaning |
|---|---|
| `token` | The federation / app-exchange path is not active or cannot mint the expected token. Check app settings, federated credential trust, and token-provider implementation. |
| `site` | The exchanged app token still lacks effective Graph/HBCentral authorization, or Graph is not actually using the HB SharePoint Creator app token. |
| `list` | Site resolution succeeded; one or both list lookups now fail. |
| `items` | Site and list resolution succeeded; item retrieval fails. |
| `other` | Read sanitized message and inspect classifier coverage. |

---

# 7. Expected Success Signal

A successful fix should produce:

- no fresh `site`-stage `401` loader failures from the reproduced dashboard load;
- `/project-links` no longer classifies as dual source-unavailable;
- My Projects card leaves the source-unavailable banner posture.

---

# 8. If Telemetry Still Shows Site-Stage 401

Do not reopen frontend/runtime config.

The likely failure modes are then:

1. backend did not deploy the intended artifact;
2. token provider still not used by `GraphListClient`;
3. app token is not actually issued under HB SharePoint Creator;
4. HB SharePoint Creator grants are not effective in the active tenant/site posture.

---

# 9. If Telemetry Moves to Token Stage

That is useful. It means the backend has moved onto the new federation path and is now failing at the explicit token-exchange layer, rather than silently direct-calling Graph under the UAMI.

Use the sanitized failure message to isolate:
- missing env setting;
- assertion token failure;
- app token exchange failure.
