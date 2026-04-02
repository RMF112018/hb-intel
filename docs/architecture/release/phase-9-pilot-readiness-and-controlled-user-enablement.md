# Phase 9 — Pilot Readiness and Controlled User Enablement

**Date:** 2026-04-02
**Phase:** Phase 9 — Release Hardening, Pilot, and Cutover
**Scope:** Project Setup workflow — controlled pilot for Accounting controller review, provisioning runtime, and Admin exception handling.
**Prompt:** `Prompt-03_Phase-9-Pilot-Readiness-and-Controlled-User-Enablement.md`
**Baseline:**
- `docs/architecture/reviews/phase-9-release-readiness-audit.md`
- `docs/architecture/release/phase-9-staging-deployment-and-pre-cutover-validation-checklist.md`

---

## 1. Pilot Objective

Validate the Project Setup workflow end-to-end with a bounded set of real users and real SharePoint sites before any broader production cutover.

The pilot must prove:

1. The submit → controller review → approve → ReadyToProvision → backend auto-start → provisioning saga → completion path works against real tenant infrastructure.
2. The clarification and hold paths function correctly in a production-like context.
3. The admin exception handling path (retry, archive, escalate, force-state) is operationally viable.
4. The per-site Graph grant model (Option A2 manual workflow) is executable for a small number of projects.
5. The support model, runbooks, and observability tooling are sufficient for real incident response.

The pilot does **not** prove:
- Scalability beyond the bounded scope (<=3 projects).
- Automated bootstrap (Option A1) — this is future G2/G6/G8 scope.
- Wave 1 features (SF17 persistence, live email, Teams confirmation, deferred monitors/probes).
- Broad production readiness — that requires separate cutover validation (P9-04).

---

## 2. In-Scope Users and Surfaces

### Pilot users

| Role | Count | Surface | Permissions required |
|------|-------|---------|---------------------|
| Requester (Estimating coordinator) | 1–2 | Estimating SPFx webpart or PWA | Standard user; project setup request submission |
| Controller (Accounting reviewer) | 1 | Accounting SPFx webpart | Controller role (`CONTROLLER_UPNS`); review, clarify, hold, approve |
| Admin (exception handler) | 1 | Admin SPFx webpart | Admin role (`ADMIN_UPNS`); retry, archive, escalate, force-state |
| Observer (Product Owner / release lead) | 1 | All surfaces (read-only) | Read access; no action permissions |

**Total pilot audience:** 4–5 named users.

### Pilot surfaces

| Surface | Purpose in pilot |
|---------|-----------------|
| Estimating SPFx webpart | Request submission, draft resume, clarification response |
| Accounting SPFx webpart | Controller review queue, detail page, approve/clarify/hold flow |
| Admin SPFx webpart | Provisioning oversight, failure recovery, alert monitoring |
| PWA (if deployed) | Requester submission parity validation |
| Backend Functions host | All 8 in-scope route families |

### Pilot project scope

- **Maximum 3 projects** during pilot window.
- Each project exercises the full lifecycle: submit → review → approve → provision → complete (or fail → admin recovery).
- Per-site Graph grants executed manually via Option A2 for each project site.
- Scale threshold: if a 4th project is needed, assess Option A1 automated bootstrap before proceeding.

---

## 3. Prerequisites Before Pilot Start

All prerequisites are linked to the staging checklist (P9-02) and external dependency register (P9-01 section 7).

### Staging exit criteria (must be satisfied)

| # | Criterion | Source | Status |
|---|-----------|--------|--------|
| PRE-1 | All staging pass criteria met (P9-02 section 9) | Staging checklist | [ ] |
| PRE-2 | Full workflow smoke path completed in staging: submit through ReadyToProvision | Staging checklist W-1 through W-13 | [ ] |
| PRE-3 | At least one provisioning attempt executed in staging | Staging checklist W-14 | [ ] |
| PRE-4 | Admin exception handling validated in staging | Staging checklist W-18 through W-23 | [ ] |
| PRE-5 | Evidence package from staging complete and reviewed | Staging checklist EV-1 through EV-12 | [ ] |

### External prerequisites (must be resolved)

| # | Prerequisite | Owner | Source | Status |
|---|-------------|-------|--------|--------|
| PRE-6 | Sites.Selected consent granted in Entra ID OR Path B ADR approved | IT/Security tenant admin | P9-01 dependency #1 | [ ] |
| PRE-7 | Per-site Graph grant executed successfully on at least one staging site | IT/Security tenant admin | P9-01 dependency #2 | [ ] |
| PRE-8 | Managed Identity token acquisition confirmed for Graph and Table Storage | Platform/DevOps | P9-01 dependency #3 | [ ] |
| PRE-9 | Full provisioning saga completed end-to-end on at least one test project | Engineering | Staging exit X-5 | [ ] |

### Pilot-specific prerequisites

| # | Prerequisite | Owner | Status |
|---|-------------|-------|--------|
| PRE-10 | Pilot users identified by name and role (see section 2) | Product Owner | [ ] |
| PRE-11 | Pilot users have correct permissions in Bucket B settings (`CONTROLLER_UPNS`, `ADMIN_UPNS`) | Product Owner + DevOps | [ ] |
| PRE-12 | Pilot communication sent: scope, timeline, support contacts, known limitations | Product Owner | [ ] |
| PRE-13 | Support owner confirmed and available for pilot duration (see section 7) | Engineering lead | [ ] |
| PRE-14 | Observability tooling accessible: App Insights, KQL queries, alert rules active | Platform/DevOps | [ ] |

**Gate:** Do not start the pilot until PRE-1 through PRE-14 are all satisfied.

---

## 4. Pilot Execution Sequence

### Phase A — Environment confirmation (Day 0)

| Step | Action | Owner | Evidence |
|------|--------|-------|----------|
| A-1 | Confirm all PRE-* prerequisites are satisfied | Engineering lead | Signed-off prerequisite checklist |
| A-2 | Verify pilot users can access their assigned surfaces | Engineering | Screenshot of each user's landing page |
| A-3 | Verify App Insights is receiving telemetry | Platform/DevOps | Live Metrics screenshot |
| A-4 | Verify alert rules are active in Azure Monitor | Platform/DevOps | Alert rule configuration screenshot |
| A-5 | Communicate pilot start to all participants | Product Owner | Email/Teams message |

### Phase B — First project lifecycle (Days 1–3)

| Step | Action | Owner | Evidence |
|------|--------|-------|----------|
| B-1 | Requester submits first project setup request | Pilot requester | Request visible in queue |
| B-2 | Controller reviews, requests clarification (optional), approves with project number | Pilot controller | State transitions observed in UI |
| B-3 | Verify ReadyToProvision state and backend auto-start trigger | Engineering | Table Storage row + App Insights trace |
| B-4 | Execute per-site Graph grant for the project site (Option A2) | IT/Security admin | `grantSiteAccess()` 200 response |
| B-5 | Monitor provisioning saga execution (7 steps) | Engineering | App Insights correlationId timeline |
| B-6 | Verify completion OR capture failure for admin recovery | Engineering | Final state in UI and Table Storage |
| B-7 | If failed: exercise admin recovery path (retry/archive/escalate) | Pilot admin | Admin oversight page screenshot |

### Phase C — Additional projects (Days 3–7)

| Step | Action | Owner | Evidence |
|------|--------|-------|----------|
| C-1 | Repeat B-1 through B-7 for projects 2 and 3 | Pilot users | Per-project evidence set |
| C-2 | Vary the workflow paths: include at least one clarification and one hold | Pilot controller | State transition evidence |
| C-3 | Verify timer trigger fires on schedule (1:00 AM EST) | Engineering | App Insights timer trace |
| C-4 | Verify alert polling service detects any stuck or failed runs | Engineering | Admin alert badge evidence |

### Phase D — Observation and assessment (Days 7–10)

| Step | Action | Owner | Evidence |
|------|--------|-------|----------|
| D-1 | Review all captured evidence against success criteria (section 5) | Engineering lead | Assessment document |
| D-2 | Review any issues logged during pilot against failure thresholds (section 6) | Engineering lead | Issue triage log |
| D-3 | Run KQL observability queries from the observability runbook | Engineering | Query result exports |
| D-4 | Collect pilot user feedback | Product Owner | Feedback summary |
| D-5 | Make pilot-complete decision (section 10) | Engineering lead + Product Owner | Signed decision |

---

## 5. Success Criteria

All criteria must be met for the pilot to be considered successful.

### Functional success

| # | Criterion | Measurement | Threshold |
|---|-----------|-------------|-----------|
| SC-1 | Full lifecycle completes for at least 1 project | Project reaches `Completed` state | 1 of 3 |
| SC-2 | All workflow paths exercised | Submit, review, clarify, hold, approve, ReadyToProvision, provision, complete | All paths touched |
| SC-3 | Admin recovery path exercised | At least one retry or archive action performed on a real failure or test failure | 1 exercise |
| SC-4 | No data loss or state corruption | All state transitions are consistent between UI, Table Storage, and App Insights | 0 inconsistencies |
| SC-5 | Per-site Graph grant model works for pilot scale | Option A2 manual grant succeeds for each project site | 100% grant success |

### Operational success

| # | Criterion | Measurement | Threshold |
|---|-----------|-------------|-----------|
| SC-6 | Timer trigger fires reliably | 1:00 AM EST execution observed on all pilot days | >=90% of expected runs |
| SC-7 | Alert rules fire correctly | Stuck-run or timer-miss alert fires (or: no stuck runs to alert on, with monitoring confirmed active) | Alert system validated |
| SC-8 | Runbook procedures executable | At least one runbook procedure used during pilot (retry, diagnostics, or KQL query) | 1 procedure |
| SC-9 | Issue response time | All pilot issues triaged within 4 hours during business hours | 100% within SLA |
| SC-10 | No critical unplanned incidents | No data loss, no auth bypass, no unrecoverable state | 0 critical incidents |

### User experience success

| # | Criterion | Measurement | Threshold |
|---|-----------|-------------|-----------|
| SC-11 | Pilot users can complete assigned tasks without engineering assistance | Users follow workflow without ad-hoc debugging support | >=80% self-service |
| SC-12 | No blocking UX issues | No workflow step that cannot be completed due to UI defect | 0 blocking UX issues |
| SC-13 | State labels and guidance text are accurate | Explainability (C2) matches actual system behavior | No misleading labels |

---

## 6. Failure / Pause / Rollback Thresholds

### Pause thresholds (investigation required before continuing)

| # | Condition | Action |
|---|----------|--------|
| PT-1 | Any state corruption or data inconsistency between UI and Table Storage | Pause pilot; investigate root cause; resume only after fix confirmed |
| PT-2 | Provisioning saga fails on 2 consecutive projects for the same root cause | Pause pilot; diagnose failure; consult runbook FM-* recovery path |
| PT-3 | Alert rule fires but support team cannot triage within 4 hours | Pause pilot; review support model adequacy |
| PT-4 | Per-site Graph grant fails for any project | Pause pilot; escalate to IT/Security admin; verify Sites.Selected consent |
| PT-5 | Pilot user reports blocking UX issue preventing task completion | Pause affected workflow; investigate and patch or document workaround |

### Failure thresholds (pilot fails, rollback required)

| # | Condition | Action |
|---|----------|--------|
| FT-1 | Data loss: any submitted request disappears or becomes unrecoverable | Fail pilot; rollback; root-cause analysis before retry |
| FT-2 | Auth bypass: any unauthenticated request succeeds | Fail pilot; rollback; security review before retry |
| FT-3 | State machine violation: system enters a state not defined in the state machine | Fail pilot; rollback; contract review before retry |
| FT-4 | 0 of 3 projects complete the full lifecycle after all 10 pilot days | Fail pilot; assess whether blockers are fixable or systemic |
| FT-5 | 3+ critical incidents during pilot window | Fail pilot; comprehensive review before retry |

### Rollback procedure

1. **SPFx surfaces:** Remove or retract the .sppkg from App Catalog. Webpart becomes unavailable on affected pages.
2. **Backend Functions:** Redeploy the previous known-good artifact (or swap staging slot back if slot-based). Route families return to pre-pilot state.
3. **Table Storage data:** Pilot data is retained for forensic review. No automatic deletion.
4. **Pilot users:** Notify all pilot participants of rollback and timeline for retry.
5. **Post-rollback:** Capture incident report; update blocking conditions; re-enter at P9-03 prerequisites.

---

## 7. Support Model and Owner Matrix

### Support tiers during pilot

| Tier | Scope | Owner | Response target |
|------|-------|-------|----------------|
| Tier 0 — Self-service | Pilot users follow workflow; use embedded coaching callouts and state labels | Pilot users | Immediate (UI-guided) |
| Tier 1 — Engineering support | Workflow issues, configuration questions, triage using runbook procedures | Engineering lead | 4 hours (business hours) |
| Tier 2 — Platform/infrastructure | Azure Function App, Key Vault, Managed Identity, SignalR, App Insights issues | Platform/DevOps | 4 hours (business hours) |
| Tier 3 — Tenant admin | Sites.Selected grants, Graph permissions, App Catalog, API access approval | IT/Security tenant admin | Best effort (coordinate in advance) |

### Owner matrix

| Area | Primary owner | Escalation |
|------|--------------|------------|
| Pilot coordination | Product Owner | Engineering lead |
| Workflow correctness | Engineering lead | — |
| Backend / provisioning runtime | Engineering | Platform/DevOps |
| SPFx deployment | Engineering | SharePoint admin |
| Observability / alerting | Engineering | Platform/DevOps |
| Per-site Graph grants (Option A2) | IT/Security admin | Engineering (diagnosis support) |
| Bucket B settings | Product Owner | Engineering (format validation) |
| Pilot communication | Product Owner | — |
| Rollback decision | Engineering lead + Product Owner | — |

---

## 8. Issue Triage Model

### Severity classification

| Severity | Definition | Example | Response |
|----------|-----------|---------|----------|
| **Critical** | Data loss, auth bypass, state machine violation, or unrecoverable state | Request disappears; unauthenticated API access | Immediate pause; rollback if unresolvable within 2 hours |
| **High** | Workflow blocked for a specific user or path but no data loss | Approve button does not fire API call; timer trigger not executing | Investigate within 4 hours; pause affected path if needed |
| **Medium** | Degraded experience but workflow can complete | SignalR disconnected (polling fallback active); slow Table Storage response | Log issue; monitor; fix in next patch if reproducible |
| **Low** | Cosmetic or minor UX issue | Incorrect label text; styling inconsistency | Log issue; batch for post-pilot fix |

### Triage workflow

1. **Report:** Pilot user or monitor detects issue → report to Engineering lead via agreed channel (Teams/email).
2. **Classify:** Engineering lead assigns severity using the table above.
3. **Investigate:** For Critical/High: use runbook procedures, KQL queries, and App Insights traces. For Medium/Low: log for batch review.
4. **Resolve or escalate:** Fix in-place if possible; escalate to Tier 2/3 if infrastructure or tenant-level.
5. **Document:** Log issue in pilot triage record with: date, severity, description, root cause, resolution, time to resolve.
6. **Assess:** After resolution, check against pause/failure thresholds (section 6).

---

## 9. Evidence to Capture During Pilot

| # | Evidence item | When | Format |
|---|--------------|------|--------|
| PE-1 | Per-project lifecycle trace (correlationId timeline in App Insights) | After each project completes or fails | KQL export |
| PE-2 | Table Storage state snapshots (before and after key transitions) | At submit, approve, ReadyToProvision, complete/fail | Screenshot or query export |
| PE-3 | Per-site Graph grant confirmation | After each Option A2 grant | API response or screenshot |
| PE-4 | Timer trigger execution log | Daily during pilot | App Insights trace |
| PE-5 | Alert rule firing record (or confirmation of monitoring-active-no-alerts) | Daily during pilot | Azure Monitor screenshot |
| PE-6 | Admin recovery action log (retry, archive, escalate used) | When exercised | Admin UI screenshot + App Insights |
| PE-7 | Pilot user feedback | End of pilot | Survey or written feedback |
| PE-8 | Issue triage log | Throughout pilot | Structured log (date, severity, resolution, time) |
| PE-9 | KQL observability queries executed | End of pilot (Phase D) | Query result exports |
| PE-10 | Pilot decision document (go / no-go / constrained-go) | End of pilot | Signed document |

---

## 10. Pilot Completion Decision Framework

### Decision options

| Decision | Meaning | Conditions |
|----------|---------|------------|
| **Pilot GO** | Pilot successful; proceed to P9-04 cutover planning | All SC-* criteria met; 0 unresolved Critical/High issues; rollback not triggered |
| **Pilot CONSTRAINED GO** | Pilot partially successful; proceed with documented constraints | >=1 project completed full lifecycle; no Critical incidents; <=2 unresolved Medium issues with documented workarounds |
| **Pilot NO-GO** | Pilot failed or insufficient evidence; do not proceed to cutover | Any FT-* threshold triggered; OR <1 project completed; OR unresolved Critical issue |
| **Pilot RETRY** | Pilot inconclusive due to external blockers; retry after resolution | Pilot paused due to PT-* condition that was resolved; need additional data |

### Decision inputs

1. Success criteria assessment (section 5) — all SC-* evaluated
2. Issue triage log (section 8) — severity distribution and resolution status
3. Evidence package (section 9) — PE-1 through PE-10 complete
4. Pilot user feedback (PE-7)
5. Option A2 grant viability assessment — does manual grant model work at pilot scale?

### Decision authority

- **Primary:** Engineering lead + Product Owner (joint decision)
- **Escalation:** If Engineering and Product Owner disagree, escalate to project sponsor
- **Documentation:** Decision must be recorded in PE-10 with rationale and any carry-forward conditions

---

## 11. Constraints That Prevent Broader Release

Even a successful pilot does **not** authorize broader production cutover. The following constraints remain:

| # | Constraint | Why it prevents broader release | Resolution path |
|---|-----------|--------------------------------|-----------------|
| CR-1 | Option A2 manual grants do not scale beyond 3 projects | Each new project site requires manual IT/Security admin action | Assess Option A1 automated bootstrap (future G2/G6/G8); or accept manual model with documented SLA |
| CR-2 | Startup config validation not wired into boot path (G2.6) | Misconfigured production environment will not fail fast | Track G2.6 integration; validate config manually for cutover |
| CR-3 | SF17 persistence is in-memory only | Admin alerts, approval authority, and probe data do not survive Function App restart | Document limitation for production operators; Wave 1 resolution |
| CR-4 | Email notifications are console-logged, not delivered | Users do not receive email notifications for state transitions | Wave 1 scope; pilot users rely on UI-based status visibility |
| CR-5 | Slot-based rollback not yet evidenced | Rollback method for broader release depends on target environment posture | P9-04 must determine slot-based vs. artifact-based rollback |
| CR-6 | Pilot proves <=3 projects only | No evidence of system behavior at broader scale | Production cutover plan must address scale assumptions |

### What the pilot does prove for cutover planning

- The workflow contract works end-to-end against real tenant infrastructure.
- The support model is viable for a small audience.
- The admin recovery path is operationally sound.
- The observability tooling provides actionable signal.
- The permission model (Path A / Option A2) functions at pilot scale.

### Current pilot readiness status

**Ready once named prerequisites complete.** All repo-side evidence is in place (900+ tests, runbooks, config registry, verification matrix all passing). The pilot is blocked only on external prerequisites (PRE-6 through PRE-9) and pilot-specific setup (PRE-10 through PRE-14). No repo-side work blocks pilot entry.

---

## 12. Files Consulted

- `docs/architecture/reviews/phase-9-release-readiness-audit.md` — P9-01 baseline
- `docs/architecture/release/phase-9-staging-deployment-and-pre-cutover-validation-checklist.md` — P9-02 staging checklist
- `docs/reference/provisioning/verification-matrix.md` — C1-C4 pass/fail evidence
- `docs/maintenance/provisioning-runbook.md` — FM-01–FM-10 recovery procedures
- `docs/maintenance/provisioning-observability-runbook.md` — KQL queries, alert rules
- `docs/reference/configuration/wave-0-config-registry.md` — Bucket A/B governance
- `docs/reference/configuration/sites-selected-validation.md` — Option A2 pilot bridge model
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx` — workflow path verification
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx` — admin recovery verification
- `apps/admin/src/test/alertPollingService.test.ts` — alert polling verification
