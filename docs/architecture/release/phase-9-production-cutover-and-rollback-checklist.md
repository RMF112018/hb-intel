# Phase 9 — Production Cutover and Rollback Checklist

**Date:** 2026-04-02
**Phase:** Phase 9 — Release Hardening, Pilot, and Cutover
**Scope:** Project Setup workflow — Accounting controller review, provisioning runtime, Admin exception handling, connected Estimating/PWA surfaces.
**Prompt:** `Prompt-04_Phase-9-Production-Cutover-and-Rollback-Preparation.md`
**Baseline:**
- `docs/architecture/reviews/phase-9-release-readiness-audit.md`
- `docs/architecture/release/phase-9-staging-deployment-and-pre-cutover-validation-checklist.md`
- `docs/architecture/release/phase-9-pilot-readiness-and-controlled-user-enablement.md`

---

## 1. Pre-Cutover Prerequisites

All prerequisites must be satisfied before the go/no-go gate (section 2).

### Pilot completion

| # | Prerequisite | Source | Status |
|---|-------------|--------|--------|
| PC-1 | Pilot decision is GO or CONSTRAINED GO | P9-03 section 10 | [ ] |
| PC-2 | Pilot evidence package complete (PE-1 through PE-10) | P9-03 section 9 | [ ] |
| PC-3 | All Critical/High issues from pilot resolved or formally accepted | P9-03 section 6 | [ ] |
| PC-4 | Pilot decision document signed by Engineering lead + Product Owner | P9-03 section 10 | [ ] |

### Environment readiness

| # | Prerequisite | Owner | Status |
|---|-------------|-------|--------|
| PC-5 | All Bucket A infrastructure settings confirmed in production Function App | Platform/DevOps | [ ] |
| PC-6 | All Bucket B business settings populated with production UPNs | Product Owner | [ ] |
| PC-7 | Production App Insights resource active and receiving telemetry | Platform/DevOps | [ ] |
| PC-8 | Production Azure alert rules configured (stuck >30 min Severity 2; timer-miss Severity 1) | Platform/DevOps | [ ] |
| PC-9 | Production Table Storage provisioned with correct `AZURE_TABLE_ENDPOINT` | Platform/DevOps | [ ] |
| PC-10 | `FUNCTION_APP_URL` set in production build pipeline | DevOps | [ ] |
| PC-11 | Rollback strategy confirmed (see section 6 for selection) | Platform/DevOps + Engineering | [ ] |

### Permission and tenant readiness

| # | Prerequisite | Owner | Status |
|---|-------------|-------|--------|
| PC-12 | Sites.Selected consent confirmed in production Entra ID OR Path B ADR active | IT/Security admin | [ ] |
| PC-13 | Per-site Graph grant workflow operational in production | IT/Security admin | [ ] |
| PC-14 | Managed Identity token acquisition validated in production | Platform/DevOps | [ ] |
| PC-15 | App Catalog deployment path confirmed for production | SharePoint admin | [ ] |
| PC-16 | API access approved in production SharePoint admin center | Tenant admin | [ ] |

### Artifacts ready

| # | Prerequisite | Owner | Status |
|---|-------------|-------|--------|
| PC-17 | Production-tagged .sppkg artifacts built with correct `FUNCTION_APP_URL` | Engineering + DevOps | [ ] |
| PC-18 | Backend Functions deployment package tagged and tested in staging | Engineering | [ ] |
| PC-19 | Previous known-good artifacts archived for rollback | Engineering | [ ] |

---

## 2. Go / No-Go Gate

The go/no-go decision is made **after** all PC-* prerequisites are evaluated, **before** any cutover step executes.

### Gate criteria

| # | Criterion | Required | Status |
|---|-----------|----------|--------|
| GNG-1 | All PC-* prerequisites satisfied (or formally accepted with constraint) | Yes | [ ] |
| GNG-2 | Pilot decision document states GO or CONSTRAINED GO | Yes | [ ] |
| GNG-3 | Rollback strategy selected and validated (section 6) | Yes | [ ] |
| GNG-4 | Owner matrix confirmed: all named owners available during cutover window | Yes | [ ] |
| GNG-5 | Communication draft ready (section 8) | Yes | [ ] |
| GNG-6 | No unresolved Critical-severity issues from any Phase 9 stage | Yes | [ ] |
| GNG-7 | Cutover window scheduled and confirmed with all stakeholders | Yes | [ ] |

### Decision

| Decision | Meaning | Action |
|----------|---------|--------|
| **GO** | All criteria met; proceed with cutover | Execute section 3 |
| **CONSTRAINED GO** | Criteria met with accepted constraints documented | Execute section 3 with constraint annotations |
| **NO-GO** | One or more blocking criteria unmet | Halt; document blockers; reschedule |

**Decision authority:** Engineering lead + Product Owner (joint). Escalation: project sponsor.

---

## 3. Cutover Sequence

Execute in order. Do not skip steps. Each step has a named owner and a checkpoint.

### Phase 1 — Pre-deployment verification (T-60 min)

| Step | Action | Owner | Checkpoint | Pass? |
|------|--------|-------|------------|-------|
| CUT-1 | Confirm go/no-go gate passed (section 2) | Engineering lead | GNG-* all checked | [ ] |
| CUT-2 | Verify production Function App is running and healthy | Platform/DevOps | `GET /api/health` returns 200 | [ ] |
| CUT-3 | Verify current production state: capture baseline Table Storage row count | Engineering | Row count recorded | [ ] |
| CUT-4 | Verify rollback artifacts are archived and accessible | Engineering | Previous .sppkg and Functions package confirmed in archive | [ ] |
| CUT-5 | Send pre-cutover notification to stakeholders | Product Owner | Notification sent | [ ] |

### Phase 2 — Backend deployment (T-30 min)

| Step | Action | Owner | Checkpoint | Pass? |
|------|--------|-------|------------|-------|
| CUT-6 | **(If slot-based)** Deploy backend package to staging slot | Platform/DevOps | Staging slot health probe returns 200 | [ ] |
| CUT-7 | **(If slot-based)** Verify staging slot config matches production config | Platform/DevOps | All Bucket A settings identical | [ ] |
| CUT-8 | **(If slot-based)** Execute slot swap (staging → production) | Platform/DevOps | Production health probe returns 200 post-swap | [ ] |
| CUT-9 | **(If direct deploy)** Deploy backend package directly to production slot | Platform/DevOps | Deployment completes without error | [ ] |
| CUT-10 | Verify production health probe post-deployment | Engineering | `GET /api/health` returns 200 | [ ] |
| CUT-11 | Verify auth middleware active | Engineering | Unauthenticated `GET /api/project-requests` returns 401 | [ ] |
| CUT-12 | Verify CORS accepts production tenant origin | Engineering | Request from `https://<tenant>.sharepoint.com` succeeds | [ ] |
| CUT-13 | Verify App Insights telemetry flowing | Platform/DevOps | Live Metrics shows incoming requests | [ ] |

### Phase 3 — SPFx deployment (T-15 min)

| Step | Action | Owner | Checkpoint | Pass? |
|------|--------|-------|------------|-------|
| CUT-14 | Upload production .sppkg to App Catalog | SharePoint admin | Package appears with correct version | [ ] |
| CUT-15 | Deploy with "Make this solution available to all sites" (or site-scoped if applicable) | SharePoint admin | Deployment confirmed | [ ] |
| CUT-16 | Verify API access approved (no pending permissions) | Tenant admin | SharePoint admin center → API access → clean | [ ] |
| CUT-17 | Verify webpart loads on target page | Engineering | Console shows `[HB-Intel ShellWebPart] Module resolved.` | [ ] |
| CUT-18 | Verify no undefined URLs in console or network tab | Engineering | Zero `undefined` in any URL | [ ] |
| CUT-19 | Verify API base URL resolves correctly | Engineering | Network tab shows `https://<function-app>.azurewebsites.net/api/...` | [ ] |

### Phase 4 — Smoke validation (T+0)

| Step | Action | Owner | Checkpoint | Pass? |
|------|--------|-------|------------|-------|
| CUT-20 | Submit a test request (Estimating surface) | Engineering | Request appears in Table Storage with state = `Submitted` | [ ] |
| CUT-21 | Controller reviews and approves with project number (Accounting surface) | Engineering | State transitions to `ReadyToProvision` | [ ] |
| CUT-22 | Verify backend auto-start triggers provisioning | Engineering | App Insights shows provisioning saga start event | [ ] |
| CUT-23 | Verify admin oversight page renders with correct data | Engineering | Failures tab accessible; actions visible for admin user | [ ] |
| CUT-24 | Verify alert polling service is active | Engineering | Admin badge count updates or confirms zero active alerts | [ ] |

### Phase 5 — Cutover confirmation (T+15 min)

| Step | Action | Owner | Checkpoint | Pass? |
|------|--------|-------|------------|-------|
| CUT-25 | Review all Phase 4 smoke results | Engineering lead | All CUT-20 through CUT-24 pass | [ ] |
| CUT-26 | Verify no unexpected errors in App Insights | Engineering | No new exceptions in last 15 min | [ ] |
| CUT-27 | Confirm Table Storage data integrity | Engineering | Baseline row count + new test rows; no missing or corrupted rows | [ ] |
| CUT-28 | Make cutover-complete decision | Engineering lead + Product Owner | Decision: CONFIRM or ROLLBACK | [ ] |
| CUT-29 | Send cutover-complete notification | Product Owner | Notification sent | [ ] |

---

## 4. Validation Checkpoints During Cutover

These are the minimum validation gates embedded in the cutover sequence. If any gate fails, evaluate rollback triggers (section 5).

| Checkpoint | After step | What to verify | Failure action |
|-----------|-----------|----------------|---------------|
| Backend health | CUT-10 | Health probe 200 | Rollback backend (section 7) |
| Auth enforcement | CUT-11 | 401 on unauthenticated request | Rollback backend |
| CORS correctness | CUT-12 | Tenant origin accepted; foreign rejected | Rollback backend |
| Telemetry flowing | CUT-13 | App Insights Live Metrics active | Investigate; continue if non-blocking |
| SPFx module loads | CUT-17 | Console resolution message | Rollback SPFx (section 7) |
| No undefined URLs | CUT-18 | Zero undefined in URLs | Rollback SPFx |
| Smoke: submit works | CUT-20 | Request persisted to Table Storage | Rollback all |
| Smoke: approve works | CUT-21 | State transition to ReadyToProvision | Rollback all |
| Smoke: provisioning starts | CUT-22 | Saga start event in App Insights | Investigate; may be timer-dependent |

---

## 5. Immediate Rollback Triggers

If any of the following occur during cutover, **initiate rollback immediately** without waiting for further validation.

| # | Trigger | Severity | Rollback scope |
|---|---------|----------|---------------|
| RT-1 | Backend health probe returns non-200 after deployment | Critical | Backend only (or all if SPFx already deployed) |
| RT-2 | Auth middleware does not reject unauthenticated requests | Critical | All — security boundary compromised |
| RT-3 | Data loss: any existing Table Storage rows missing or corrupted after deployment | Critical | All |
| RT-4 | SPFx bundle shows `undefined` in API URLs — no backend connectivity | High | SPFx (retract .sppkg) |
| RT-5 | State machine violation: system enters undefined state | Critical | All |
| RT-6 | Smoke submit fails: request not persisted | High | All |
| RT-7 | Multiple unexpected 500 errors in App Insights within 5 minutes of deployment | High | Investigate; rollback if root cause unclear within 15 min |

---

## 6. Rollback Strategy Selection and Assumptions

### Strategy selection

The rollback strategy depends on the target environment's deployment posture. Determine which strategy applies **before cutover** during PC-11.

| Strategy | Condition | Classification |
|----------|-----------|----------------|
| **A — Slot swap** | Azure Functions staging slot exists and swap has been tested | **Not yet evidenced** — requires environment confirmation |
| **B — Artifact rollback** | No staging slot; deploy previous known-good artifact | **Available** — requires archived artifacts (PC-19) |
| **C — .sppkg retraction** | SPFx-only rollback needed | **Available** — remove or retract package from App Catalog |
| **D — Combined** | Both backend and SPFx need rollback | **Available** — B + C executed in sequence |

### Strategy A — Slot swap rollback (if evidenced)

| Assumption | Classification |
|-----------|----------------|
| Staging slot exists on production Function App | **Must be evidenced before cutover** |
| Slot swap preserves configuration (app settings travel with the slot) | Per Microsoft docs: app settings are slot-specific unless marked "deployment slot setting" |
| Swap-back returns to previous code + config | **Must be tested in staging** |

If Strategy A is confirmed, it is the preferred rollback method because it is atomic and near-instantaneous.

### Strategy B — Artifact rollback (default fallback)

| Assumption | Classification |
|-----------|----------------|
| Previous Functions deployment package is archived and accessible | **Must be confirmed during PC-19** |
| Redeployment takes <10 minutes | **Typical** per Microsoft docs; timing depends on package size |
| Configuration does not need to change (same settings, different code) | **Repo-proven** — config is environment-level, not artifact-level |

Strategy B is always available as the fallback. It is slower than slot swap but does not require any special environment setup.

### Strategy C — SPFx retraction

| Assumption | Classification |
|-----------|----------------|
| .sppkg can be retracted or removed from App Catalog | **Available** — standard SharePoint admin operation |
| Retraction makes the webpart unavailable on all pages | **Expected** — per SPFx deployment behavior |
| Previous .sppkg can be re-uploaded to restore prior version | **Available** — requires archived .sppkg (PC-19) |

### Table Storage data

Table Storage data is **not rolled back** during any rollback strategy. Data created during the cutover window is retained for forensic review. If data corruption is detected (RT-3), a separate data remediation procedure is required.

---

## 7. Rollback Steps

### Backend rollback

| Step | Action | Owner | Checkpoint |
|------|--------|-------|------------|
| RB-1 | **(If Strategy A)** Execute slot swap: production → staging | Platform/DevOps | Staging slot now has new code; production has previous code |
| RB-2 | **(If Strategy B)** Deploy previous known-good Functions package to production | Platform/DevOps | Deployment completes without error |
| RB-3 | Verify health probe | Engineering | `GET /api/health` returns 200 |
| RB-4 | Verify auth middleware | Engineering | Unauthenticated request returns 401 |
| RB-5 | Verify existing data accessible | Engineering | Table Storage rows from before cutover are intact |

### SPFx rollback

| Step | Action | Owner | Checkpoint |
|------|--------|-------|------------|
| RB-6 | Retract current .sppkg from App Catalog | SharePoint admin | Package removed or retracted |
| RB-7 | Upload previous known-good .sppkg | SharePoint admin | Previous version appears in App Catalog |
| RB-8 | Deploy previous .sppkg | SharePoint admin | Deployment confirmed |
| RB-9 | Verify webpart loads with previous version | Engineering | Console shows module resolved; correct version |

### Combined rollback (Strategy D)

Execute backend rollback (RB-1 through RB-5) first, then SPFx rollback (RB-6 through RB-9).

### Post-rollback verification

| Step | Action | Owner | Checkpoint |
|------|--------|-------|------------|
| RB-10 | Full smoke validation (repeat CUT-20 through CUT-24 against rolled-back state) | Engineering | All smoke checks pass on previous version |
| RB-11 | Verify no data loss from rollback | Engineering | Pre-cutover baseline row count intact |
| RB-12 | Send rollback notification to stakeholders | Product Owner | Notification sent |
| RB-13 | Create incident report | Engineering lead | Report includes: trigger, timeline, root cause, resolution, re-entry plan |

---

## 8. Communication Steps

| # | Communication | When | Audience | Owner | Channel |
|---|--------------|------|----------|-------|---------|
| COM-1 | Cutover scheduled notification | T-24 hours | All stakeholders, pilot users, support team | Product Owner | Email + Teams |
| COM-2 | Cutover starting notification | T-60 min (CUT-5) | All stakeholders | Product Owner | Teams |
| COM-3 | Backend deployed, SPFx deploying | After CUT-13 | Engineering team, support | Engineering lead | Teams |
| COM-4 | Smoke validation in progress | After CUT-19 | Engineering team | Engineering lead | Teams |
| COM-5 | Cutover CONFIRMED | After CUT-29 | All stakeholders | Product Owner | Email + Teams |
| COM-6 | **(If rollback)** Rollback initiated | Immediately on rollback trigger | All stakeholders | Engineering lead | Teams (urgent) |
| COM-7 | **(If rollback)** Rollback complete | After RB-13 | All stakeholders | Product Owner | Email + Teams |
| COM-8 | Post-cutover hypercare begins | After CUT-29 (if confirmed) | Support team | Engineering lead | Teams |

---

## 9. Owner Matrix

| Area | Primary owner | Backup | Availability required |
|------|--------------|--------|----------------------|
| Go/no-go decision | Engineering lead + Product Owner | Project sponsor | During gate evaluation |
| Backend deployment (CUT-6 through CUT-13) | Platform/DevOps | Engineering | Full cutover window |
| SPFx deployment (CUT-14 through CUT-19) | SharePoint admin | Engineering (upload assist) | Full cutover window |
| Smoke validation (CUT-20 through CUT-24) | Engineering | — | Full cutover window |
| Cutover confirmation (CUT-25 through CUT-29) | Engineering lead + Product Owner | — | Full cutover window |
| Backend rollback (RB-1 through RB-5) | Platform/DevOps | Engineering | Full cutover window + 2 hours |
| SPFx rollback (RB-6 through RB-9) | SharePoint admin | Engineering | Full cutover window + 2 hours |
| Post-rollback verification (RB-10 through RB-13) | Engineering | — | Until rollback confirmed |
| Communications (COM-*) | Product Owner | Engineering lead | Full cutover window |
| Incident report (if rollback) | Engineering lead | — | Within 24 hours of rollback |

---

## 10. Final Cutover Completion Criteria

Cutover is complete **only** when all of the following are true:

| # | Criterion | Status |
|---|-----------|--------|
| CC-1 | All CUT-* steps executed and passing | [ ] |
| CC-2 | Smoke validation (CUT-20 through CUT-24) all pass | [ ] |
| CC-3 | No rollback triggers (RT-*) activated | [ ] |
| CC-4 | No unexpected errors in App Insights for 15 minutes post-deployment | [ ] |
| CC-5 | Table Storage data integrity confirmed | [ ] |
| CC-6 | Cutover-complete decision made: CONFIRM | [ ] |
| CC-7 | Cutover-complete notification sent (COM-5) | [ ] |
| CC-8 | Hypercare notification sent (COM-8) | [ ] |
| CC-9 | Evidence captured: screenshots, App Insights traces, health probe responses | [ ] |

---

## 11. Constraints and Conditional Paths

### Slot-based rollback is not yet evidenced

Slot-based rollback (Strategy A) is a recommended Azure Functions deployment pattern per Microsoft guidance. As of this writing, the target production environment's staging slot configuration is **not yet evidenced**. The cutover is designed to work with either model:

- **If slot exists:** Prefer Strategy A (slot swap) for both deployment and rollback. Steps marked **(If slot-based)** apply.
- **If no slot:** Use Strategy B (artifact rollback) for backend and Strategy C (.sppkg retraction) for SPFx. Steps marked **(If direct deploy)** apply.

The rollback strategy must be confirmed during PC-11 before the go/no-go gate.

### Startup config validation not wired (G2.6)

`validateProvisioningPrerequisites()` is not integrated into the Function App startup path. A misconfigured production environment will not fail fast. Mitigation: manual config validation (P9-02 section 3) must be completed as part of PC-5 before cutover.

### SF17 persistence is in-memory

Admin alerts, approval authority rules, and infrastructure probe data do not survive Function App restart. A backend deployment (including slot swap) will clear in-memory state. Mitigation: alert polling service will re-generate alerts from current state on next poll cycle. No manual data recovery required, but operators should expect a brief gap in alert history immediately after deployment.

### Per-site Graph grants remain manual

Option A2 manual grants are the active permission model. Each new project site provisioned after cutover requires a manual IT/Security admin grant. This is a known operational constraint, not a cutover blocker. The pilot validated this model for <=3 projects.

### Wave 1 deferrals active during cutover

The following limitations are present in the production release and must not be treated as cutover failures:
- Email notifications: console-logged only (no SMTP delivery)
- Teams webhook: fire-and-forget (no delivery confirmation)
- SF17 persistence: in-memory only
- ErrorLogPage: HbcEmptyState placeholder
- Deferred monitors and probes: not active

---

## 12. Cutover Timeline Template

| Time | Phase | Key action |
|------|-------|-----------|
| T-24h | Communication | Send COM-1: cutover scheduled |
| T-60min | Pre-deployment | CUT-1 through CUT-5: verify prerequisites, baseline, notify |
| T-30min | Backend | CUT-6 through CUT-13: deploy backend, verify health/auth/CORS/telemetry |
| T-15min | SPFx | CUT-14 through CUT-19: deploy .sppkg, verify module/URLs/auth |
| T+0 | Smoke | CUT-20 through CUT-24: submit, review, approve, verify provisioning/admin |
| T+15min | Confirmation | CUT-25 through CUT-29: review results, confirm or rollback |
| T+15min | Hypercare | COM-8: begin hypercare monitoring (see P9-05) |

**Estimated total cutover window: 75–90 minutes** (T-60 through T+15–30).

---

## 13. Files Consulted

- `docs/architecture/reviews/phase-9-release-readiness-audit.md` — P9-01 baseline
- `docs/architecture/release/phase-9-staging-deployment-and-pre-cutover-validation-checklist.md` — P9-02 staging checklist
- `docs/architecture/release/phase-9-pilot-readiness-and-controlled-user-enablement.md` — P9-03 pilot plan
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md` — host boundary, route families, auth/CORS
- `docs/reference/configuration/wave-0-config-registry.md` — Bucket A/B settings, startup validation gap
- `docs/reference/configuration/sites-selected-validation.md` — permission model, Option A2
- `docs/maintenance/provisioning-runbook.md` — FM-01–FM-10 recovery procedures
- `docs/maintenance/provisioning-observability-runbook.md` — KQL queries, alert rules
