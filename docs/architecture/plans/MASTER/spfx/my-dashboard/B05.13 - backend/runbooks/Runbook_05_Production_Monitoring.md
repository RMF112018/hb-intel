# Runbook 05 | Production Monitoring

## Objective

Operate the My Projects projection subsystem after cutover using App Insights-first observability, Azure portal queue visibility, and documented escalation criteria.

---

# 1. Daily Operator Review — MVP

During first two weeks post-cutover, review once per business day:

1. Subscription health events.
2. Delta pull failures.
3. Queue DLQ count.
4. Stale projection read warnings.
5. Drift audit results.

---

# 2. Azure Portal Checks

## 2.1 Service Bus queue

```text
Azure Portal
→ Service Bus namespace
→ Queues
→ my-projects-projection-sync
→ Overview
```

Monitor:
- Active messages
- Dead-letter messages
- Incoming / outgoing trend if shown

### Interpretation

| Observation | Meaning |
|---|---|
| active count briefly > 0 then returns to 0 | normal burst processing |
| active count continuously rising | worker stuck or throughput failure |
| DLQ > 0 | processing poison/failure path requires triage |

---

## 2.2 Table state review

```text
Azure Portal
→ Operational storage account
→ Storage browser
→ Tables
```

Review as needed:
- subscription entities active and not expired,
- delta state entities advancing after changes,
- run ledger showing successful syncs/seed/audits.

---

# 3. Alert Escalation Thresholds — MVP

Formal Teams/email alerts are staged later. For MVP, these are operator-watch criteria:

| Condition | Action |
|---|---|
| Queue DLQ count > 0 | investigate same day |
| Subscription renewal failure | investigate immediately |
| Subscription expires in <72h without successful renewal | immediate escalation |
| Delta `410 Gone` resync event | confirm controlled resync completed |
| Projection freshness breach >5 minutes in repeated reads | investigate queue/delta worker |
| Drift audit detects non-zero unresolved mismatch | review and trigger repair/rebuild path if required |

---

# 4. Drift/Reconciliation Cadence

## Locked MVP posture

| Cadence | Behavior |
|---|---|
| Nightly | Read-only drift audit enabled |
| Weekly | Automated repair implementation exists but disabled for first 14 days post-cutover |
| Manual | Admin endpoint + CLI rebuild available when operator-approved |

After 14 stable days, the weekly automated repair timer may be enabled by approved configuration change.

---

# 5. Monthly Retention Maintenance

Projection rows use:
- soft-deactivate on obsolescence,
- 90-day retention for inactive rows,
- monthly purge for inactive rows older than 90 days.

Review purge telemetry monthly. Purge failures should not block active projection reads but should be remediated to prevent list bloat.

---

# 6. Troubleshooting Decision Tree

## A. My Projects card stale or wrong
1. Check read telemetry freshness marker.
2. Check last successful delta pull for the relevant source list.
3. Check queue backlog/DLQ.
4. Check latest projection run ledger.
5. If pipeline appears healthy, run parity/drift check for the impacted record.

## B. No new source changes reflected
1. Confirm active Graph subscription state.
2. Confirm renewal has not failed.
3. Confirm notification telemetry exists.
4. Confirm worker drained a queued wake-up.
5. Confirm delta state advanced.

## C. Subscription health problem
1. Inspect subscription state table.
2. Review renewal timer telemetry.
3. Re-run operator renewal command if available.
4. If expired, recreate subscription and reseed/continue delta state per implementation contract.

---

# 7. Stage-Two Alerting

After MVP stabilization, implement:
- Azure Monitor alert rules or equivalent operational alerting for:
  - renewal failure,
  - DLQ > 0,
  - repeated worker failure,
  - freshness breach,
  - drift mismatch counts.
- Notifications can route to Teams/email per company standard.

---

# 8. Stage-Three Admin UI

Later UI control surface should expose:
- projection subsystem health,
- source subscription status,
- last successful sync,
- manual rebuild button,
- drift audit trigger,
- link to operator docs.

The MVP must not wait on this UI.
