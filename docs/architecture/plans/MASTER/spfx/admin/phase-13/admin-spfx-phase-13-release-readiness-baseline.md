# Admin SPFx IT Control Center — Phase 13 Release Readiness Baseline and Gates

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-02 — Phase 13 Release Readiness Baseline and Gates
**Scope:** Release-readiness definition and gating criteria
**Evidence base:** `admin-spfx-phase-13-production-posture-audit.md` (P13-01)

---

## 1. Purpose

This document defines the canonical release-readiness baseline and production gates for the Admin SPFx IT Control Center. It is the single authority for determining whether the system is ready for production rollout.

Every gate is testable, evidentiary, or both. Vague assertions such as "looks good" or "mostly ready" are not acceptable evidence. Each gate must be satisfied with a specific artifact, verification result, or sign-off before the system is considered release-ready.

---

## 2. Readiness principles

1. **Evidence over assertion.** Every gate requires a verifiable artifact — a passing CI run, a confirmed configuration, a signed-off document, or a demonstrated capability.
2. **Repo truth over plan truth.** Readiness is measured against what exists in the repository and deployed environment, not against what a plan said would exist.
3. **Blockers stop release; warnings require documented acceptance.** A blocker means the system cannot be released. A warning means release can proceed with explicit risk acceptance and a remediation timeline.
4. **Deferred items are not hidden items.** Every known deferral must be documented with its impact, mitigation status, and owner.
5. **No silent dependencies.** Every external dependency (Azure services, SharePoint tenant, Entra ID, Teams webhooks) must be verified, not assumed.
6. **Rollback is mandatory.** The system must have a tested rollback path before production deployment.
7. **Support readiness is release readiness.** A system with no defined support ownership is not ready for production.

---

## 3. Release gating categories

| # | Category | Scope | Gate type |
|---|----------|-------|-----------|
| RC-01 | Architecture and boundary integrity | Package boundaries, dependency direction, ownership | Blocker |
| RC-02 | Authentication / authorization / least-privilege posture | Auth flow, permission gates, managed identity, CORS | Blocker |
| RC-03 | Deployment and rollback readiness | CI/CD pipeline, staging → production promotion, rollback procedure | Blocker |
| RC-04 | Configuration and secret posture | Environment variables, Key Vault, managed identity, config validation | Blocker |
| RC-05 | Backend / runtime health readiness | API surface, durable storage, timer functions, function timeout | Blocker |
| RC-06 | Observability and incident visibility | Monitors, probes, error log, alert delivery, KQL queries | Warning |
| RC-07 | Audit / evidence completeness | Audit spine, evidence assembly, run history | Blocker |
| RC-08 | Support ownership and escalation readiness | Ownership matrix, escalation path, on-call structure | Blocker |
| RC-09 | Environment promotion / staging confidence | Staging deployment, staging verification, production promotion gate | Blocker |
| RC-10 | Documentation completeness | Runbooks, operator guides, IT setup guide, config reference | Warning |

---

## 4. Required evidence for each gate

### RC-01 — Architecture and boundary integrity

| Evidence | How to verify | Status |
|----------|--------------|--------|
| `apps/admin` depends only on approved workspace packages | Inspect `apps/admin/package.json` dependencies against `package-relationship-map.md` | **Satisfied** — 10 workspace deps, all architecturally correct |
| No direct cross-feature-package coupling | Verify `@hbc/features-admin` does not import other feature packages | **Satisfied** — ports-and-adapters pattern with dependency injection |
| Reusable UI lives in `@hbc/ui-kit`, not duplicated in feature packages | Verify no duplicate visual primitives in `@hbc/features-admin` or `apps/admin` | **Satisfied** — ESLint enforcement rules block direct FluentUI imports |
| Backend domain hosts respect ADR-0124 boundaries | Inspect `backend/functions/src/hosts/` structure | **Satisfied** — 3 isolated hosts (monolithic, project-setup, admin-control-plane) |
| SPFx WebPart manifest has stable, unique GUID | Verify via `tools/validate-manifests.ts` in CI | **Satisfied** — `cfade002-7ec3-4939-92bf-4aec3e2162e7`, validated in `spfx-build.yml` |

**Gate verdict: PASS**

### RC-02 — Authentication / authorization / least-privilege posture

| Evidence | How to verify | Status |
|----------|--------------|--------|
| SPFx auth bootstrap wires SharePoint group → permission keys | Inspect `AdminWebPart.tsx` — `bootstrapSpfxAuth()` in `onInit()` | **Satisfied** — D-PH7-BW-7 RBAC mapping |
| Route-level permission guards on all admin routes | Inspect `routes.ts` — `requireAdminAccessControl()` before load | **Satisfied** — All routes except index (intentional to prevent redirect loop) |
| Component-level permission gates on sensitive actions | Inspect page files — `PermissionGate` on retry, archive, escalate, force-state, approval manage | **Satisfied** |
| Backend JWT validation on authenticated endpoints | Inspect backend auth middleware — `jose` token validation against `API_AUDIENCE` | **Satisfied** |
| CORS locked to SharePoint tenant origin | Inspect `host.json` — `allowedOrigins` | **Satisfied** — Single origin: `https://hedrickbrotherscom.sharepoint.com` |
| Production uses managed identity (no client secrets) | Inspect `wave0-env-registry.ts` and `IT-Department-Setup-Guide.md` | **Satisfied** — `AZURE_CLIENT_SECRET` is local-dev only |
| `Sites.Selected` least-privilege model for SharePoint | Inspect `validate-config.ts` — `SITES_PERMISSION_MODEL` defaults to `sites-selected` | **Satisfied** — Per-site grants with confirmation gate |
| `requiresCustomScript: false` in WebPart manifest | Inspect `AdminWebPart.manifest.json` | **Satisfied** — SPFx sandbox compliance |

**Gate verdict: PASS** (repo-verifiable evidence satisfied; production environment verification is a residual unknown — see RC-09)

### RC-03 — Deployment and rollback readiness

| Evidence | How to verify | Status |
|----------|--------------|--------|
| Automated CI pipeline runs build, test, lint, bundle check, manifest validation | Inspect `.github/workflows/spfx-build.yml` | **Satisfied** |
| Automated staging deployment on successful main build | Inspect `.github/workflows/spfx-deploy.yml` — staging job | **Satisfied** — PnP PowerShell with Azure AD app credentials |
| Production deployment requires GitHub Environment protection rule approval | Inspect `spfx-deploy.yml` — production job depends on staging + environment gate | **Satisfied** |
| Rollback procedure is documented and tested | Check for rollback runbook | **NOT SATISFIED** — No rollback runbook exists (P13-01 gap G9) |
| Admin-specific deployment runbook covers SPFx + backend coordination | Check for coordinated deployment doc | **NOT SATISFIED** — No admin-specific deployment runbook (P13-01 gap G11) |
| Artifact retention supports rollback to prior version | Inspect `spfx-build.yml` — artifact retention | **Satisfied** — 30-day retention |

**Gate verdict: BLOCKED** — Rollback runbook (G9) and deployment runbook (G11) required. Target: P13-05.

### RC-04 — Configuration and secret posture

| Evidence | How to verify | Status |
|----------|--------------|--------|
| All required production config entries are documented | Inspect `wave0-env-registry.ts` — 9 required entries with tier labels | **Satisfied** |
| Tiered config validation runs at startup | Inspect `validate-config.ts` — `validateCoreConfig()`, `validateAdminControlPlaneStartupConfig()` | **Satisfied** |
| Provisioning prerequisites validated at saga execution time | Inspect `validateProvisioningPrerequisites()` — 7 gates | **Satisfied** |
| Secrets stored in Key Vault, not app settings | Inspect IT-Department-Setup-Guide Section 8 | **Satisfied** — Key Vault references documented |
| `local.settings.json` is gitignored; only `.example.json` committed | Verify no `local.settings.json` in repo | **Satisfied** |
| Environment variable reference is complete and current | Inspect P12 config-and-retention guide + wave0-env-registry | **Satisfied** — 25+ entries documented with tiers and ownership |
| Timer function timezone documented | Check operational-runbook.md | **Satisfied** — `WEBSITE_TIME_ZONE=Eastern Standard Time` documented |

**Gate verdict: PASS** (repo-verifiable; production population of values is a residual unknown — see Section 8 cross-links)

### RC-05 — Backend / runtime health readiness

| Evidence | How to verify | Status |
|----------|--------------|--------|
| Azure Functions v4 with Node.js 20 | Inspect `backend/functions/package.json` | **Satisfied** — `@azure/functions@^4.6.0` |
| All 4 API endpoint families operational | Inspect backend README — admin control plane (13), app binding (5), hybrid identity (9), observability (15) | **Satisfied** — 40+ endpoints |
| 6 Azure Table Storage tables defined with durable stores | Inspect backend store implementations | **Satisfied** — AdminRuns, AdminAuditEvents, AdminEvidence, ObservabilityAlerts, ObservabilityProbeSnapshots, ObservabilityErrors |
| Timer functions configured with correct schedules | Inspect operational-runbook.md | **Satisfied** — `timerFullSpec` (1 AM EST), `cleanupIdempotency` (3 AM EST) |
| Function timeout set appropriately | Inspect `host.json` | **Satisfied** — 10-minute timeout |
| Application Insights sampling configured | Inspect `host.json` | **Satisfied** — 20 items/sec, exceptions excluded |
| Health endpoint documented | Inspect operational-runbook.md — `GET /api/health` | **Satisfied** |

**Gate verdict: PASS**

### RC-06 — Observability and incident visibility

| Evidence | How to verify | Status |
|----------|--------------|--------|
| 3 live monitors detecting provisioning anomalies | Inspect `@hbc/features-admin` README | **Satisfied** — provisioning-failure, stuck-workflow, overdue-provisioning |
| 2 live probes with real network connections | Inspect `@hbc/features-admin` README | **Satisfied** — azure-functions, sharepoint |
| Error log with backend persistence and operator filtering | Inspect ErrorLogPage — `/errors` route | **Satisfied** — P12-08 |
| Alert polling integrated at shell level | Inspect root route — `useAlertPolling()` | **Satisfied** — 30s cycle |
| Probe polling integrated at shell level | Inspect root route — `useProbePolling()` | **Satisfied** — 15min cycle |
| Teams webhook dispatch with delivery tracking | Inspect TeamsWebhookDispatchAdapter | **Satisfied** — P12-09, acknowledged-alert suppression, 5-min cooldown |
| 5 KQL queries available for Azure Monitor | Inspect `backend/functions/observability/kql/` | **Satisfied** |
| Alert rules deployed to Azure Monitor | Inspect Azure Portal | **NOT SATISFIED** — Defined but not deployed (P13-01 gap G1) |
| 3 deferred monitors documented with prerequisites | Inspect P13-01 audit — G3 | **Satisfied** as deferral — Domain data providers not yet modeled |
| 3 deferred probes documented with prerequisites | Inspect P13-01 audit — G4 | **Satisfied** as deferral — Live endpoints not yet available |

**Gate verdict: WARNING** — Alert rules not deployed to Azure Monitor (G1). Release can proceed with documented risk acceptance if Teams webhook dispatch is confirmed operational. Alert rule deployment should be a pre-production DevOps task.

### RC-07 — Audit / evidence completeness

| Evidence | How to verify | Status |
|----------|--------------|--------|
| Admin audit store with 16 event types | Inspect `admin-audit-store.ts` | **Satisfied** — Append-only, durable |
| Admin evidence store with terminal-state payloads | Inspect backend evidence store | **Satisfied** |
| Provisioning audit bridge mapping 11 event types | Inspect `provisioning-audit-bridge.ts` | **Satisfied** |
| 5-class failure classification | Inspect `classify-failure.ts` | **Satisfied** — Transient, permissions, structural, repeated, admin-class |
| Evidence payload assembly at terminal saga states | Inspect `build-evidence-payload.ts` | **Satisfied** |
| Observability error emitter with classification heuristics | Inspect `observability-emitter.ts` | **Satisfied** |
| Run history queryable with correlation metadata | Inspect observability API routes | **Satisfied** |

**Gate verdict: PASS**

### RC-08 — Support ownership and escalation readiness

| Evidence | How to verify | Status |
|----------|--------------|--------|
| Support ownership matrix with named roles | Check for support model document | **NOT SATISFIED** — No formal support model (P13-01 gap G10) |
| Escalation path with tier definitions | Inspect operational-runbook.md | **Partially satisfied** — 4-tier path exists (on-call → platform engineering → IT → architecture) but lacks SLA, on-call structure, and contact details |
| On-call paging mechanism configured | Check P13-01 residual unknowns | **NOT SATISFIED** — Open architecture decision |
| Incident triage procedure | Check for incident runbook | **NOT SATISFIED** — No incident triage runbook (P13-01 gap G8) |

**Gate verdict: BLOCKED** — Support model (G10), on-call paging, and incident triage runbook (G8) required. Target: P13-04 (support model) + P13-06 (incident triage).

### RC-09 — Environment promotion / staging confidence

| Evidence | How to verify | Status |
|----------|--------------|--------|
| Staging deployment automated on main merge | Inspect `spfx-deploy.yml` — staging job | **Satisfied** |
| Production deployment gated by GitHub Environment protection | Inspect `spfx-deploy.yml` — production job | **Satisfied** |
| Staging environment has matching configuration | Verify staging Function App config matches production schema | **NOT VERIFIABLE FROM REPO** — Residual unknown |
| Staging SPFx app deployed and functional | Verify staging App Catalog deployment | **NOT VERIFIABLE FROM REPO** — Residual unknown |
| Bundle size within limits | Inspect CI — `spfx-bundle-check.ts` (800 KB limit) | **Satisfied** — Enforced in CI |
| Security audit passing | Inspect `.github/workflows/security.yml` | **Satisfied** — Weekly + PR-triggered `pnpm audit --audit-level=high` |

**Gate verdict: PASS** (repo-verifiable gates satisfied; environment-level verification is a production prerequisite documented in residual unknowns)

### RC-10 — Documentation completeness

| Evidence | How to verify | Status |
|----------|--------------|--------|
| IT Department infrastructure setup guide | Inspect `IT-Department-Setup-Guide.md` | **Satisfied** — 1,157 lines, comprehensive |
| Platform operational runbook | Inspect `operational-runbook.md` | **Satisfied** — 4 alert procedures, health endpoint, escalation |
| Phase-specific operator runbooks (6) | Inspect P13-01 audit Section 3 | **Satisfied** — Install, binding, SharePoint, identity, observability, config/retention |
| CI/CD guide | Inspect `phase-8-ci-cd-guide.md` | **Satisfied** — 3 workflows documented |
| Azure Functions guide | Inspect `phase-7-azure-functions-guide.md` | **Satisfied** — Runtime, saga, timer, SignalR |
| Deployment runbook (admin-specific) | Check for document | **NOT SATISFIED** — G11 |
| Rollback/recovery runbook | Check for document | **NOT SATISFIED** — G9 |
| Incident triage runbook | Check for document | **NOT SATISFIED** — G8 |
| Operational doctrine document | Check for document | **NOT SATISFIED** — G15 |
| Expansion architecture document | Check for document | **NOT SATISFIED** — G16 |

**Gate verdict: WARNING** — Core operational documentation exists. Phase 13 deliverables (P13-05 through P13-08) will close the remaining gaps. Release can proceed once deployment runbook (G11), rollback runbook (G9), and incident triage runbook (G8) are delivered.

---

## 5. Blockers vs warnings

### Blockers (must be resolved before production release)

| ID | Blocker | Gap ref | Resolution target | Owner |
|----|---------|---------|-------------------|-------|
| B1 | No rollback/recovery runbook | G9 | P13-05: Deployment and rollback runbooks | Phase 13 |
| B2 | No admin-specific deployment runbook (SPFx + backend coordination) | G11 | P13-05: Deployment and rollback runbooks | Phase 13 |
| B3 | No formal support ownership matrix | G10 | P13-04: Support model and escalation matrix | Phase 13 |
| B4 | No incident triage or break-glass runbook | G8 | P13-06: Incident triage, recovery, and break-glass runbooks | Phase 13 |
| B5 | No operational doctrine document | G15 | P13-07: Operational doctrine and service boundaries | Phase 13 |

### Warnings (release can proceed with documented risk acceptance)

| ID | Warning | Gap ref | Mitigation in place | Recommended remediation timeline |
|----|---------|---------|--------------------|---------------------------------|
| W1 | Alert rules not deployed to Azure Monitor | G1 | Teams webhook dispatch with delivery tracking (P12-09); KQL queries available for manual use | Pre-production DevOps task; should not delay Phase 13 docs work |
| W2 | Email relay console-logged only | G2 | Teams is primary notification channel; email is supplementary | Post-release; requires SMTP integration |
| W3 | 3 monitors are stubs | G3 | Return `[]` (safe); domain data providers not yet modeled | Post-release; requires domain modeling |
| W4 | 3 probes return `unknown` | G4 | Corrected from misleading `healthy` (P12-06); no false positives | Post-release; requires live endpoints |
| W5 | ApprovalAuthority not persisted | G5 | Wave 0 limitation banner displayed; SF17-T05 scope | Post-release; separate feature track |
| W6 | Teams webhook no retry queue | G6 | Delivery tracking provides failure visibility (P12-09) | Post-release; requires persistent retry mechanism |
| W7 | No expansion architecture document | G16 | Does not affect current production scope | P13-08 delivery |
| W8 | SignalR real integration not tested | G14 | Mock implementation in place; reconnect-on-focus pattern documented | Pre-production staging verification |

### Risk acceptance protocol for warnings

For each warning, release proceeds only when:
1. The warning is explicitly documented in the release notes.
2. The mitigation status is confirmed accurate (not stale).
3. A remediation owner and timeline are recorded.
4. The approver acknowledges the residual risk.

---

## 6. Approval / sign-off expectations

### Sign-off roles

| Role | Responsibility | Signs off on |
|------|---------------|-------------|
| Technical lead | Verifies code quality, test coverage, architecture compliance | RC-01, RC-02, RC-05, RC-07 |
| Platform / DevOps | Verifies deployment pipeline, environment configuration, infrastructure | RC-03, RC-04, RC-09 |
| Operations | Verifies support readiness, runbooks, escalation model | RC-06, RC-08, RC-10 |
| Product owner | Accepts known limitations and deferred items | Warnings W1–W8 |

### Sign-off process

1. **Pre-sign-off:** All blockers (B1–B5) must be resolved with verifiable evidence.
2. **Gate review:** Each gate category is reviewed against its evidence table. Evidence must be current (not stale from a prior phase).
3. **Warning acceptance:** Each warning is reviewed. The product owner explicitly accepts or rejects each warning with documented rationale.
4. **Final sign-off:** All four roles sign off. Sign-off is recorded in the Phase 13 exit reconciliation document (P13-10).

### Sign-off artifact

The signed-off release readiness baseline is recorded in the P13-10 exit reconciliation document with:
- Date of sign-off
- Gate-by-gate status (pass / pass-with-warning / fail)
- Warning acceptance records
- Residual unknowns verified or deferred with rationale

---

## 7. Deferred items policy

### Definition

A deferred item is a known gap that will not be resolved before production release. Deferred items are not the same as unknown items (Section 8 of the P13-01 audit covers unknowns).

### Current deferred items

| ID | Deferred item | Why deferred | Impact | Mitigation | Owner |
|----|--------------|-------------|--------|------------|-------|
| D1 | Email relay SMTP integration | No SMTP provider configured; Teams is primary | No email notifications for medium/low-severity alerts | Teams webhook handles critical/high; console logging provides audit trail | Post-release roadmap |
| D2 | 3 stub monitors (permission-anomaly, upcoming-expiration, stale-record) | Domain data providers not yet modeled | No detection for these 3 anomaly types | Monitors return `[]` (safe); no false alerts | Future domain modeling phase |
| D3 | 3 deferred probes (search, notification, module-record-health) | Backend health endpoints not yet available | No real health checks for these 3 subsystems | Probes return `unknown` (not misleading `healthy`) | Future backend feature work |
| D4 | ApprovalAuthority persistence | SF17-T05 scope; separate feature track | Rules lost on page reload | Wave 0 limitation banner in SystemSettingsPage | SF17-T05 delivery |
| D5 | Teams webhook retry queue | Requires persistent retry mechanism | Failed webhook deliveries not retried | Delivery tracking (P12-09) provides failure visibility | Post-release enhancement |
| D6 | SignalR real integration | Requires staging environment with Azure SignalR Service | Real-time updates use mock in development | Mock implementation functional; reconnect pattern documented | Pre-production staging verification |
| D7 | Observability dashboard/timeline service completion | Interfaces defined; implementations partially complete | Combined summary and run correlation endpoints may return incomplete responses | Individual alert, probe, and error endpoints fully operational | Phase 12 partial closure or post-release |

### Deferral discipline

1. **No silent deferrals.** Every deferred item must appear in this table and in the P13-10 exit reconciliation.
2. **No deferral without mitigation.** Each deferred item must have a documented mitigation that prevents the deferral from causing production incidents.
3. **No indefinite deferrals.** Each deferred item must have an identified owner, even if the timeline is "future roadmap."
4. **Deferred items do not weaken gates.** A deferred item does not change a gate from blocker to warning. Gates are defined by what production requires, not by what is convenient to defer.
5. **Re-evaluation on change.** If a deferred item's mitigation becomes invalid (e.g., Teams webhook stops working), the item must be re-evaluated and may become a blocker.

---

## 8. Cross-links to runbooks and support docs

### Existing documentation (verified in P13-01 audit)

| Document | Location | Covers |
|----------|----------|--------|
| IT Department Setup Guide | `docs/how-to/administrator/setup/backend/IT-Department-Setup-Guide.md` | Azure resources, Entra ID, SharePoint, email, verification, troubleshooting |
| Platform Operational Runbook | `docs/how-to/developer/operational-runbook.md` | 4 alert response procedures, health endpoint, timer schedule, escalation path |
| CI/CD Guide | `docs/how-to/developer/phase-8-ci-cd-guide.md` | 3 GitHub Actions workflows, secrets, local commands |
| Azure Functions Guide | `docs/how-to/developer/phase-7-azure-functions-guide.md` | Runtime, saga, SignalR, timer functions |
| Install Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-06/admin-spfx-install-operator-runbook.md` | Backend install/bootstrap |
| App Binding Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-operator-runbook.md` | App binding status/repair |
| SharePoint Control Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-08/admin-spfx-phase-8-sharepoint-control-operator-runbook.md` | SharePoint control operations |
| Hybrid Identity Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-09/admin-spfx-phase-9-operator-runbook.md` | Identity administration |
| Observability Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-operator-runbook-notes.md` | Error log, alerts, probes, severity, escalation triggers |
| Configuration and Retention Guide | `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-config-and-retention-guide.md` | Storage tables, retention, polling intervals, adapter modes |
| Production Posture Audit | `docs/architecture/plans/MASTER/spfx/admin/phase-13/admin-spfx-phase-13-production-posture-audit.md` | 16 gaps, foundations, non-gaps, residual unknowns (P13-01) |
| KQL Query Library | `backend/functions/observability/kql/` | 5 queries: adapter health, auth token, provisioning, error budget, notification |

### Phase 13 deliverables that will close blocker gaps

| Blocker | Phase 13 deliverable | Expected document |
|---------|---------------------|-------------------|
| B1 (rollback runbook) | P13-05 | `admin-spfx-phase-13-deployment-and-rollback-runbook.md` |
| B2 (deployment runbook) | P13-05 | `admin-spfx-phase-13-deployment-and-rollback-runbook.md` |
| B3 (support model) | P13-04 | `admin-spfx-phase-13-support-model-and-escalation-matrix.md` |
| B4 (incident triage) | P13-06 | `admin-spfx-phase-13-incident-triage-and-recovery-runbook.md` |
| B5 (operational doctrine) | P13-07 | `admin-spfx-phase-13-operational-doctrine.md` |

### Pre-production DevOps tasks (not Phase 13 docs, but required for full readiness)

| Task | Evidence source | Verification |
|------|----------------|-------------|
| Deploy 5 alert rules to Azure Monitor | `backend/functions/observability/README.md` — DevOps setup checklist | Alert rules fire on staging test data |
| Create action group `hbi-alert-action-group` | `backend/functions/observability/README.md` | Action group visible in Azure Portal |
| Configure Teams Workflow for production + staging channels | `backend/functions/observability/README.md` | Test alert reaches `#hb-intel-alerts` channel |
| Create Azure Monitor Workbooks from KQL queries | `backend/functions/observability/kql/` | Workbooks visible and returning data |
| Verify all 9 required config entries populated in production | `wave0-env-registry.ts` | `validateCoreConfig()` passes in production |
| Verify 6 Azure Table Storage tables exist with correct access | P13-01 residual unknowns | Table reads succeed from Function App |
| Verify managed identity permissions match required scopes | P13-01 residual unknowns | Provisioning saga completes in staging |
| Confirm `WEBSITE_TIME_ZONE=Eastern Standard Time` | `operational-runbook.md` | Timer functions execute at expected times |

---

## Validation checklist

- [x] Every gate has testable or evidentiary criteria — no vague language
- [x] Blockers and warnings are explicitly separated with resolution targets
- [x] Deferred items have mitigations that do not weaken production discipline
- [x] Cross-links reference verified file paths from P13-01 audit
- [x] Sign-off process is concrete with named roles and recorded artifacts
- [x] Pre-production DevOps tasks are separated from Phase 13 documentation scope
