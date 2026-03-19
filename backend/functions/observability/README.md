# Observability — KQL Queries, Dashboards, and Alert Rules

Version-controlled observability artifacts for the HB Intel backend Azure Functions.

## KQL Query Library

All queries target the Application Insights `traces` table with `_telemetryType` JSON parsing. The Functions host logger routes telemetry through `console.log` / `context.log` → `traces` table (not native `customEvents`). If the Application Insights SDK is adopted (C3 §4.1), queries would migrate to native `customEvents`/`customMetrics` tables.

| File | Dashboard | Source Events |
|------|-----------|---------------|
| `kql/adapter-health.kql` | Adapter Health | `proxy.request.*` (§2.1.1), `handler.*` (§2.1.2) |
| `kql/auth-token.kql` | Auth & Token | `handler.error` where errorCode = UNAUTHORIZED/FORBIDDEN (§2.1.3) |
| `kql/provisioning.kql` | Provisioning | `handler.*` where domain = provisioningSaga (§2.1.4) |
| `kql/error-budget.kql` | Error Budget | `handler.error` aggregate counts (§2.1.2) |
| `kql/notification.kql` | Notification Pipeline | `notification.send.*`, `notification.digest.*` (§2.1.5) |

## Required Dashboards (C3 §2.3.1)

| Dashboard | Owner | B2 Gate Evidence |
|-----------|-------|-----------------|
| **Adapter Health** | DevOps | Error rate < 5%, p95 latency < 10s |
| **Auth & Token** | Security / DevOps | Auth flow verified for production activation |
| **Provisioning** | Operations | Saga success rate >= 95% over 7-day window |
| **Error Budget** | Leadership / SRE | Overall error rate vs SLO; burn rate projection |

Implementation: Azure Monitor Workbooks or Application Insights dashboards using the KQL queries above.

## Alert Rules (C3 §2.3.2)

Defined in `alerts.json`. 5 rules:

| Alert | Severity | Condition | Owner |
|-------|----------|-----------|-------|
| High adapter error rate | P2 | > 5% in 5-min window | DevOps on-call |
| Adapter latency spike | P3 | p95 > 10s in 5-min window | DevOps on-call |
| Auth failure burst | P1 | > 3 failures in 1 minute | Security + DevOps |
| Provisioning saga failure | P2 | Any failure event | Operations on-call |
| Circuit breaker open | P1 | Any circuit opens | DevOps on-call (deferred until D1) |

## Alert Channel (C3 §2.3.3)

Microsoft Teams Workflows (Power Automate) posting to dedicated channels:
- **Production:** `#hb-intel-alerts`
- **Staging:** `#hb-intel-alerts-staging`

Action Group configuration in `alerts.json`. Office 365 Incoming Webhooks are deprecated — use Teams Workflows.

## DevOps Setup Checklist

- [ ] Create Azure Monitor Workbooks from KQL queries
- [ ] Create 5 Azure Monitor alert rules from `alerts.json`
- [ ] Create Action Group `hbi-alert-action-group`
- [ ] Configure Teams Workflow for alert delivery
- [ ] Verify staging alerts with test trigger
- [ ] Document on-call paging mechanism (open decision)
