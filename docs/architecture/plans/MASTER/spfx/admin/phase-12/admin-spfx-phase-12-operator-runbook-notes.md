# Admin SPFx IT Control Center — Phase 12 Operator Runbook Notes

**Created:** 2026-04-04
**Prompt:** P12-10 — Testing, Docs, Runbooks, and Config Guidance

---

## 1. What operators can now see

### Error Log (`/errors`)
- Durable error records from provisioning, identity, device deployment, and other admin domains.
- Each error shows: title, message, severity badge, domain, source, classification, timestamp, and correlation metadata (runId, actionKey).
- Filters by domain, severity, and classification. Auto-refreshes every 30 seconds.

### Health Dashboard (`/health`)
- **Alert Dashboard:** Active alerts grouped by severity with acknowledge action. Badge count in navigation.
- **Probe Dashboard:** Per-probe health status (healthy/degraded/error/unknown) with staleness detection and manual probe trigger.
- **Queue Health:** Provisioning run state distribution, bottleneck detection, and runbook links.

### Provisioning Oversight (`/runs`)
- All provisioning runs with state tabs (Active, Failures, Completed, All).
- Retry, archive, escalate, and force-state actions on failed runs.
- Step-level diagnostics in detail modals.

---

## 2. Where data comes from

| Surface | Data source | Backend table |
|---------|-------------|--------------|
| Error Log | `GET /api/admin/observability/errors` | `ObservabilityErrors` |
| Alert Dashboard | `useAdminAlerts` (30s poll) + in-memory cache | `ObservabilityAlerts` |
| Alert Summary | `GET /api/admin/observability/alerts/summary` | `ObservabilityAlerts` |
| Probe Health | `useInfrastructureProbes` (15min poll) | `ObservabilityProbeSnapshots` |
| Dashboard Summary | `GET /api/admin/observability/dashboard` | All 3 tables combined |
| Run Timeline | `GET /api/admin/observability/timeline/{runId}` | `AdminAuditEvents` + `ObservabilityAlerts` + `ObservabilityErrors` |

---

## 3. Severity interpretation

| Severity | Meaning | Notification |
|----------|---------|-------------|
| **Critical** | System-level or safety-critical failure requiring immediate action | Teams webhook (immediate) |
| **High** | Significant failure or degradation requiring prompt attention | Teams webhook (immediate) |
| **Medium** | Non-critical issue for review during normal operations | Digest queue (logged only in Wave 0) |
| **Low** | Informational or minor issue for awareness | Digest queue (logged only in Wave 0) |

---

## 4. Status interpretation

### Alert statuses
| Status | Meaning |
|--------|---------|
| **Active** | Alert condition detected, not yet acknowledged |
| **Acknowledged** | Operator has seen the alert but not yet resolved it |
| **Resolved** | Operator has resolved the alert |
| **Superseded** | Alert was replaced by a newer evaluation |

### Probe statuses
| Status | Meaning |
|--------|---------|
| **Healthy** | Component is functioning normally |
| **Degraded** | Component operational but showing issues |
| **Error** | Component is unreachable or returning errors |
| **Unknown** | Probe has not yet run or is deferred |

---

## 5. Operator actions

| Action | Where | What happens |
|--------|-------|-------------|
| **Acknowledge alert** | Health dashboard | Marks alert as seen; removes from active list; suppresses re-notification |
| **Resolve alert** | Health dashboard / API | Marks alert as resolved; auto-acknowledges if not already; removes from active list |
| **Filter errors** | Error Log page | Filters by domain, severity, classification using dropdowns |
| **Clear filters** | Error Log page | Resets all filters to show all error events |
| **Trigger probe** | Health dashboard | Runs all probes immediately instead of waiting for next scheduled cycle |
| **View CTA** | Alert card | Navigates to the affected entity (e.g., specific provisioning run) |

---

## 6. Escalation guidance

### When to escalate
- **Critical alert persists > 30 minutes** after acknowledgment without resolution path.
- **Multiple probes in error state** simultaneously — may indicate infrastructure outage.
- **Repeated provisioning failures** across projects (not just one project) — may indicate systemic issue.
- **Permission errors** on identity operations — may require Azure AD admin intervention.

### Where to escalate
- **Infrastructure issues:** Azure portal → Function App diagnostics, Application Insights live metrics.
- **SharePoint issues:** SharePoint admin center → site health, API limits.
- **Identity issues:** Azure AD admin center → audit logs, group membership.
- **Provisioning saga stuck:** Use force-state override (expert tier, `/runs` page) as last resort.

---

## 7. What still requires later-phase work

| Item | Current state | Target |
|------|--------------|--------|
| Email digest notifications | Console-logged only | Phase 13+ — requires SMTP relay |
| Permission anomaly alerts | Monitor stub (returns empty) | Phase 13+ — requires permission audit source |
| Expiration alerts | Monitor stub (returns empty) | Phase 13+ — requires expiration model |
| Search probe | Returns `unknown` | Phase 13+ — requires Azure Search adoption |
| Notification probe | Returns `unknown` | Phase 13+ — requires delivery tracking service |
| Incident management | Not yet implemented | Phase 13+ — creation, linking, resolution |
| Webhook retry queue | Fire-and-forget | Phase 13+ — persistent retry with backoff |
