# Phase 9 — Post-Cutover Verification and Hypercare Plan

**Date:** 2026-04-02
**Phase:** Phase 9 — Release Hardening, Pilot, and Cutover
**Scope:** Project Setup workflow — immediate production verification and hypercare after cutover.
**Prompt:** `Prompt-05_Phase-9-Post-Cutover-Verification-and-Hypercare-Readiness.md`
**Baseline:**
- `docs/architecture/reviews/phase-9-release-readiness-audit.md`
- `docs/architecture/release/phase-9-staging-deployment-and-pre-cutover-validation-checklist.md`
- `docs/architecture/release/phase-9-pilot-readiness-and-controlled-user-enablement.md`
- `docs/architecture/release/phase-9-production-cutover-and-rollback-checklist.md`

---

## 1. Immediate Verification Checks After Cutover

These checks execute immediately after cutover confirmation (P9-04 CUT-29) and before hypercare begins. All must pass within the first 30 minutes of production operation.

### Infrastructure health

| # | Check | Owner | Method | Classification | Pass? |
|---|-------|-------|--------|----------------|-------|
| IV-1 | Function App health probe | Platform/DevOps | `GET /api/health` returns 200 | **repo-proven** (health endpoint) + **manual verification** (live) | [ ] |
| IV-2 | App Insights telemetry ingestion | Platform/DevOps | Live Metrics shows incoming requests within 60s | **manual verification** | [ ] |
| IV-3 | Table Storage connectivity | Engineering | Query `ProjectRequests` table; verify read returns without error | **manual verification** | [ ] |
| IV-4 | SignalR Service connectivity | Engineering | SignalR negotiate endpoint returns 200 | **manual verification** | [ ] |
| IV-5 | Alert rules active | Platform/DevOps | Azure Monitor → verify both alert rules (stuck >30 min Severity 2; timer-miss Severity 1) are enabled | **manual verification** | [ ] |

### Auth and security boundary

| # | Check | Owner | Method | Classification | Pass? |
|---|-------|-------|--------|----------------|-------|
| IV-6 | Auth middleware rejects unauthenticated requests | Engineering | `GET /api/project-requests` without bearer token returns 401 | **repo-proven** (test) + **manual verification** (live) | [ ] |
| IV-7 | CORS accepts production tenant origin | Engineering | Request from `https://<tenant>.sharepoint.com` succeeds with credentials | **manual verification** | [ ] |
| IV-8 | CORS rejects foreign origin | Engineering | Request from non-tenant origin returns CORS error | **repo-proven** (test) + **manual verification** (live) | [ ] |

### SPFx surface readiness

| # | Check | Owner | Method | Classification | Pass? |
|---|-------|-------|--------|----------------|-------|
| IV-9 | Accounting webpart loads | Engineering | Console shows `[HB-Intel ShellWebPart] Module resolved.`; no `undefined` URLs | **manual verification** | [ ] |
| IV-10 | API base URL resolves | Engineering | Network tab: all API calls target `https://<function-app>.azurewebsites.net/api/...` | **manual verification** | [ ] |
| IV-11 | Estimating webpart loads | Engineering | Same console/network verification on Estimating surface | **manual verification** | [ ] |
| IV-12 | Admin webpart loads | Engineering | Same console/network verification on Admin surface | **manual verification** | [ ] |

### Data integrity

| # | Check | Owner | Method | Classification | Pass? |
|---|-------|-------|--------|----------------|-------|
| IV-13 | Pre-cutover data intact | Engineering | Table Storage row count matches pre-cutover baseline (P9-04 CUT-3) | **manual verification** | [ ] |
| IV-14 | No orphaned or corrupted state | Engineering | Query for rows with unexpected state values; expect zero | **manual verification** | [ ] |

**Gate:** All IV-* checks must pass before hypercare begins. If any IV-* fails, evaluate rollback per P9-04 section 5.

---

## 2. Production Workflow Checks

Execute these role-based workflow checks within the first 2 hours of production operation. These verify that the full workflow contract functions in the live production environment.

### Requester (Estimating surface)

| # | Check | Actor | Expected result | Pass? |
|---|-------|-------|-----------------|-------|
| PW-1 | Navigate to Project Setup tab | Requester | Queue page loads; existing requests visible or empty state | [ ] |
| PW-2 | Submit a new project setup request | Requester | Request created; appears in queue with state = `Submitted` | [ ] |
| PW-3 | Verify request appears in Table Storage | Engineering | Row exists with correct state and field values | [ ] |

### Controller (Accounting surface)

| # | Check | Actor | Expected result | Pass? |
|---|-------|-------|-----------------|-------|
| PW-4 | Navigate to review queue | Controller | Queue loads; submitted request visible in Pending tab | [ ] |
| PW-5 | Begin review on submitted request | Controller | State transitions to `UnderReview`; detail page loads | [ ] |
| PW-6 | Approve with valid project number (`##-###-##`) | Controller | State transitions to `ReadyToProvision`; auto-trigger messaging appears | [ ] |
| PW-7 | Verify ReadyToProvision persisted | Engineering | Table Storage row shows correct state and project number | [ ] |

### Backend auto-start

| # | Check | Actor | Expected result | Pass? |
|---|-------|-------|-----------------|-------|
| PW-8 | Provisioning saga starts after ReadyToProvision | Engineering | App Insights shows saga start event for the request | [ ] |
| PW-9 | Status visibility during provisioning | Engineering | UI shows provisioning progress (SignalR real-time or polling fallback) | [ ] |
| PW-10 | Provisioning completes or fails with expected behavior | Engineering | Final state = `Completed` or `Failed` with FM-* category in App Insights | [ ] |

### Admin (Admin surface)

| # | Check | Actor | Expected result | Pass? |
|---|-------|-------|-----------------|-------|
| PW-11 | Navigate to Provisioning Oversight | Admin | Failures tab loads; data reflects current state | [ ] |
| PW-12 | Verify alert polling service active | Admin | Badge count updates; or confirms zero active alerts | [ ] |
| PW-13 | If failed run exists: verify retry action available | Admin | "Retry (0/3)" button visible with confirmation dialog | [ ] |
| PW-14 | Permission gating enforced | Engineering | Read-only user sees no action buttons; force-state requires expert tier | [ ] |

---

## 3. Monitoring / Telemetry Checks

These checks validate that observability tooling is operational and producing actionable signal. Execute during the first hypercare day and then daily.

### App Insights telemetry

| # | Check | Owner | Runbook reference | Pass? |
|---|-------|-------|-------------------|-------|
| MT-1 | Request traces flowing | Engineering | `provisioning-observability-runbook.md` — KQL: timeline by correlationId | [ ] |
| MT-2 | Exception logging active | Engineering | App Insights → Failures → verify exceptions are captured (or confirm zero exceptions) | [ ] |
| MT-3 | Custom events for saga steps | Engineering | KQL: step durations query from observability runbook | [ ] |
| MT-4 | Success rate trend query returns data | Engineering | `provisioning-observability-runbook.md` — KQL: success rate trend | [ ] |

### Alert rules

| # | Check | Owner | Runbook reference | Pass? |
|---|-------|-------|-------------------|-------|
| MT-5 | Stuck provisioning alert (>30 min, Severity 2) | Platform/DevOps | `provisioning-observability-runbook.md` — Alert Rule 1 | [ ] |
| MT-6 | Timer completion missing alert (Severity 1) | Platform/DevOps | `provisioning-observability-runbook.md` — Alert Rule 2 | [ ] |
| MT-7 | Alert notification routing verified | Platform/DevOps | Confirm alerts route to correct action group / email / Teams channel | [ ] |

### Timer trigger

| # | Check | Owner | Runbook reference | Pass? |
|---|-------|-------|-------------------|-------|
| MT-8 | 1:00 AM EST timer trigger fires | Engineering | `provisioning-runbook.md` — Daily Checks | [ ] |
| MT-9 | Timer execution visible in App Insights | Engineering | `provisioning-observability-runbook.md` — timer trace | [ ] |

### Admin polling and probes

| # | Check | Owner | Runbook reference | Pass? |
|---|-------|-------|-------------------|-------|
| MT-10 | Alert polling service generates alerts from failed/stuck runs | Engineering | `alertPollingService.test.ts` — repo-proven logic; verify in live environment | [ ] |
| MT-11 | Infrastructure probes report health status | Engineering | Probe results visible in Admin surface (dev-harness safe; verify in production) | [ ] |

---

## 4. Incident / Defect Severity Model

This model governs issue handling during hypercare. It extends the pilot triage model (P9-03 section 8) to production context.

| Severity | Definition | Production example | Response SLA (business hours) | Escalation |
|----------|-----------|-------------------|-------------------------------|------------|
| **Critical** | Data loss, auth bypass, state machine violation, or system-wide outage | Request data lost; unauthenticated API access; provisioning enters undefined state | **Immediate** — within 30 min | Engineering lead → Platform/DevOps → rollback decision within 2 hours |
| **High** | Workflow blocked for one or more users; no data loss | Approve button fails; timer not firing; admin actions non-functional | **2 hours** | Engineering → runbook procedures → escalate to Platform if infrastructure |
| **Medium** | Degraded experience; workflow can complete via alternative path | SignalR disconnected (polling active); slow responses; cosmetic UI error | **4 hours** | Engineering logs issue; monitors for recurrence; batches fix |
| **Low** | Minor UX issue; no functional impact | Label text incorrect; minor styling inconsistency | **Next business day** | Log for post-hypercare fix |

### Severity-specific actions

**Critical:**
1. Immediately notify Engineering lead and Product Owner.
2. Evaluate rollback triggers (P9-04 section 5).
3. If rollback triggered: execute P9-04 section 7.
4. If not rollback: hotfix within 2 hours; revalidate IV-* checks after fix.

**High:**
1. Investigate using runbook procedures (`provisioning-runbook.md` FM-01–FM-10).
2. Use KQL queries from `provisioning-observability-runbook.md` for diagnosis.
3. If infrastructure-related: escalate to Platform/DevOps.
4. If code defect: assess hotfix viability vs. workaround.

**Medium / Low:**
1. Log in issue tracker with reproduction steps.
2. Monitor for escalation pattern (3+ occurrences of same Medium issue → re-classify as High).
3. Batch for post-hypercare resolution.

---

## 5. Hypercare Roles and Time Window

### Hypercare window

| Parameter | Value |
|-----------|-------|
| **Start** | Immediately after cutover confirmation (P9-04 CUT-29) |
| **Duration** | 10 business days (2 calendar weeks) |
| **Hours** | Business hours: 8:00 AM – 6:00 PM local time |
| **Extended coverage** | First 3 business days: Engineering lead available until 8:00 PM for Critical/High issues |
| **Timer monitoring** | Daily 1:00 AM EST check for first 5 business days (can be automated via alert rule MT-6) |

### Hypercare roles

| Role | Person/Team | Responsibilities | Availability |
|------|------------|-----------------|--------------|
| **Hypercare lead** | Engineering lead | Triage all incoming issues; daily stabilization review; exit-criteria assessment | Full hypercare window |
| **Backend support** | Engineering | Investigate provisioning saga failures; run KQL diagnostics; apply hotfixes | Full hypercare window |
| **Frontend support** | Engineering | SPFx surface issues; webpart loading; UI defects | Full hypercare window |
| **Platform support** | Platform/DevOps | Infrastructure issues: Function App, Key Vault, Table Storage, SignalR, App Insights | On-call during hypercare |
| **Tenant support** | IT/Security admin | Per-site Graph grants (Option A2); permission issues; App Catalog | Coordinated availability |
| **Product liaison** | Product Owner | User feedback; workflow correctness; priority decisions | Business hours |
| **Rollback authority** | Engineering lead + Product Owner | Joint decision to initiate rollback if Critical threshold met | Reachable within 30 min |

---

## 6. Escalation Paths

### Escalation chain

```
User reports issue
    ↓
Tier 0: Self-service (UI coaching callouts, state labels, embedded guidance)
    ↓ (if unresolved)
Tier 1: Hypercare lead triages → assigns severity → routes to correct support role
    ↓ (if infrastructure)
Tier 2: Platform/DevOps investigates using runbook + observability tooling
    ↓ (if tenant/permission)
Tier 3: IT/Security admin for Graph grants, API approval, Managed Identity
    ↓ (if Critical and unresolvable within 2 hours)
Rollback decision: Engineering lead + Product Owner
```

### Escalation triggers

| Condition | Escalation action |
|----------|------------------|
| Issue unresolved after 2 hours (Critical) | Escalate to rollback decision |
| Issue unresolved after 4 hours (High) | Escalate to Engineering lead for priority review |
| Same Medium issue reported 3+ times | Re-classify as High; escalate to Engineering |
| Platform/infrastructure issue suspected | Direct escalate to Platform/DevOps |
| Permission or tenant issue | Direct escalate to IT/Security admin |
| Provisioning saga failure matching FM-* pattern | Use `provisioning-runbook.md` recovery procedure; escalate to admin oversight if retry ceiling reached |

### Runbook cross-references

| Scenario | Primary runbook | Key section |
|----------|----------------|-------------|
| Stuck provisioning run | `provisioning-runbook.md` | Daily Checks — verify timer; check stuck >30 min |
| Failed provisioning | `provisioning-runbook.md` | Manual Retry, Archive Path, Force State Override |
| Timer not firing | `provisioning-runbook.md` | Timer Diagnostics |
| Observability diagnosis | `provisioning-observability-runbook.md` | KQL Queries (5 templates) |
| Alert investigation | `provisioning-observability-runbook.md` | Alert Rule 1 (stuck), Alert Rule 2 (timer-miss) |
| Permission diagnosis | `sites-selected-validation.md` | `diagnose-permissions.ts` grant readiness check |
| Admin recovery actions | `provisioning-runbook.md` | Retry vs Archive vs Override decision matrix |

---

## 7. Daily Stabilization Review Expectations

A stabilization review is held daily during hypercare to assess production health and progress toward exit criteria.

### Review cadence

| Day | Type | Duration | Attendees |
|-----|------|----------|-----------|
| Day 1–3 | Full review | 30 min | Hypercare lead, Engineering, Platform/DevOps, Product Owner |
| Day 4–7 | Standard review | 15 min | Hypercare lead, Engineering, Product Owner |
| Day 8–10 | Exit assessment | 15 min | Hypercare lead, Product Owner |

### Review agenda

1. **Issue summary:** New issues since last review; severity distribution; resolution status.
2. **Telemetry review:** App Insights error rate; timer execution status; alert rule activity.
3. **Workflow throughput:** Number of requests submitted, reviewed, approved, provisioned since cutover.
4. **KQL health check:** Run success rate trend query; review step duration query for anomalies.
5. **Open items:** Unresolved Medium/Low issues; pending Graph grants; any carry-forward from prior review.
6. **Exit criteria progress:** Check each criterion in section 8 against current evidence.
7. **Decision:** Continue hypercare / escalate concern / initiate exit assessment.

### Review outputs

- Updated issue log with current status.
- Telemetry snapshot (success rate, error count, alert activity).
- Exit criteria checklist progress.
- Action items with owners and due dates.

---

## 8. Exit Criteria from Hypercare

Hypercare ends when **all** of the following are true. The exit decision is made during the Day 8–10 exit assessment review.

### Stability criteria

| # | Criterion | Measurement | Threshold | Status |
|---|-----------|-------------|-----------|--------|
| HX-1 | No Critical incidents in last 5 business days | Issue log | 0 Critical in last 5 days | [ ] |
| HX-2 | No unresolved High incidents | Issue log | 0 open High issues | [ ] |
| HX-3 | Timer trigger fires reliably | App Insights traces | >=95% success rate over last 5 days | [ ] |
| HX-4 | Alert rules validated (fired correctly or confirmed active with no alerts needed) | Azure Monitor | Rules tested or confirmed active | [ ] |
| HX-5 | No data integrity issues | Table Storage audits | 0 corrupted or orphaned rows | [ ] |

### Operational criteria

| # | Criterion | Measurement | Threshold | Status |
|---|-----------|-------------|-----------|--------|
| HX-6 | At least 1 full project lifecycle completed in production | Workflow throughput | 1 project: submit → provision → complete | [ ] |
| HX-7 | Runbook procedures validated in production context | Runbook usage log | At least 1 runbook procedure used or confirmed executable | [ ] |
| HX-8 | Support model proven viable | Issue response times | All issues triaged within SLA (section 4) | [ ] |
| HX-9 | Option A2 per-site grant executed in production | Grant log | At least 1 successful production grant | [ ] |

### Transition criteria

| # | Criterion | Measurement | Threshold | Status |
|---|-----------|-------------|-----------|--------|
| HX-10 | Steady-state support owner identified | Owner matrix | Named owner for ongoing support | [ ] |
| HX-11 | Hypercare handoff document created | Documentation | Key findings, open items, known limitations | [ ] |
| HX-12 | Product Owner accepts exit from hypercare | Sign-off | Written acceptance | [ ] |

### Exit decision

| Decision | Meaning | Action |
|----------|---------|--------|
| **EXIT** | All HX-* criteria met | Transition to steady-state; hypercare lead hands off to ongoing support owner |
| **EXTEND** | Criteria not yet met but progress is positive | Extend hypercare by 5 business days; re-assess at next review |
| **ESCALATE** | Criteria not met and systemic issues identified | Escalate to project sponsor; consider rollback or remediation plan |

**Decision authority:** Hypercare lead + Product Owner (joint).

---

## 9. Constraints / Blind Spots / Manual Verification Areas

### Known constraints active during hypercare

| # | Constraint | Impact on hypercare | Mitigation |
|---|-----------|-------------------|------------|
| CS-1 | SF17 persistence is in-memory | Admin alerts, approval rules, and probe data clear on Function App restart. After any restart (including auto-scale events), alert polling service re-generates alerts from current state on next cycle. | Operators expect brief alert history gap after restarts; no manual recovery needed. |
| CS-2 | Email notifications console-logged only | Users do not receive email for state transitions. | Rely on UI-based status visibility; communicate to users during hypercare that email is Wave 1. |
| CS-3 | Teams webhook fire-and-forget | No delivery confirmation for Teams notifications. | Do not treat missing Teams notification as an incident unless payload generation fails. |
| CS-4 | Startup config validation not wired (G2.6) | Misconfigured environment will not fail fast on restart. | After any Function App restart during hypercare: manually verify Bucket A config resolves (IV-1 through IV-5). |
| CS-5 | Option A2 manual grants required for each new project site | Each provisioned project requires IT/Security admin action. | Pre-coordinate grant schedule with IT/Security; expect 4-hour turnaround during business hours. |

### Blind spots requiring manual verification

| # | Area | What the repo cannot prove | Manual check required |
|---|------|--------------------------|----------------------|
| BS-1 | Real SignalR behavior under load | Repo tests mock SignalR; real-time behavior depends on SignalR Service capacity | Monitor for "Live updates paused" fallback activation; investigate if persistent |
| BS-2 | Azure alert rule notification delivery | Repo documents alert rule definitions; actual notification routing is Azure Monitor configuration | Verify alert notifications reach correct recipients during first triggered alert (or test alert) |
| BS-3 | Timer trigger reliability in production | Repo tests timer handler logic; actual trigger depends on Azure Functions timer infrastructure | Monitor MT-8/MT-9 daily for first 5 days |
| BS-4 | Key Vault reference resolution after restart | Repo documents config structure; actual resolution depends on Key Vault availability and Managed Identity | After any restart: confirm API calls succeed (not returning config errors) |
| BS-5 | Concurrent provisioning behavior | Repo tests sequential saga execution; concurrent request behavior depends on Table Storage partition behavior and timer pickup logic | Monitor for unexpected behavior if 2+ requests reach ReadyToProvision simultaneously |

### What is repo-proven for hypercare

The following support artifacts are repo-proven and directly usable during hypercare without additional validation:

- **Provisioning runbook:** FM-01–FM-10 recovery paths, retry/archive/force-state procedures, escalation path, daily checks, timer diagnostics — `docs/maintenance/provisioning-runbook.md`
- **Observability runbook:** 5 KQL query templates, 2 alert rule definitions, admin action verification — `docs/maintenance/provisioning-observability-runbook.md`
- **Verification matrix:** C1-C4 all PASS; lifecycle, explainability, supportability, dead-wiring dimensions confirmed — `docs/reference/provisioning/verification-matrix.md`
- **Admin oversight surface:** 18 tests verifying retry, archive, escalate, force-state, permission gating, retry ceiling, coaching callout — `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- **Alert polling service:** 10 tests verifying alert generation, severity escalation, polling lifecycle — `apps/admin/src/test/alertPollingService.test.ts`
- **Permission diagnosis tool:** `diagnose-permissions.ts` with grant readiness checks — `docs/reference/configuration/sites-selected-validation.md`
- **Config registry:** Two-bucket governance with environment separation — `docs/reference/configuration/wave-0-config-registry.md`

---

## 10. Files Consulted

- `docs/maintenance/provisioning-runbook.md` — FM-01–FM-10 recovery, daily checks, timer diagnostics
- `docs/maintenance/provisioning-observability-runbook.md` — KQL queries, alert rules, admin verification
- `docs/reference/provisioning/verification-matrix.md` — C1-C4 pass/fail evidence
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx` — admin recovery action verification
- `apps/admin/src/test/alertPollingService.test.ts` — alert polling verification
- `docs/architecture/reviews/phase-9-release-readiness-audit.md` — P9-01 baseline
- `docs/architecture/release/phase-9-staging-deployment-and-pre-cutover-validation-checklist.md` — P9-02
- `docs/architecture/release/phase-9-pilot-readiness-and-controlled-user-enablement.md` — P9-03
- `docs/architecture/release/phase-9-production-cutover-and-rollback-checklist.md` — P9-04
- `docs/reference/configuration/wave-0-config-registry.md` — Bucket A/B settings
- `docs/reference/configuration/sites-selected-validation.md` — permission model, diagnosis tool
