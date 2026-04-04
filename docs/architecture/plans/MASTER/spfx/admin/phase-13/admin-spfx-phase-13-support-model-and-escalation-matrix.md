# Admin SPFx IT Control Center — Phase 13 Support Model and Escalation Matrix

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-04 — Phase 13 Support Model and Escalation Matrix
**Scope:** Support ownership, escalation paths, severity guidance
**Evidence base:** P13-01 audit, P13-02 release readiness baseline, P13-03 environment baseline

---

## 1. Purpose

This document defines the support ownership model and escalation matrix for the Admin SPFx IT Control Center in production. It is sized for a small, realistic support footprint — not a large enterprise support organization.

This document references existing runbooks rather than duplicating their content. For specific response procedures, see the cross-referenced runbooks in each section.

---

## 2. Support tiers / ownership groups

The support model uses four tiers aligned with the existing escalation path documented in `docs/how-to/developer/operational-runbook.md`.

| Tier | Role | Typical staffing | Scope |
|------|------|-----------------|-------|
| **T1 — Operator / Admin** | HB Intel admin operator | 1–2 trained operators | First-contact triage, in-app actions, known-procedure execution |
| **T2 — Platform Engineering** | HB Intel development team | 1–2 engineers | Code-level investigation, backend diagnostics, configuration changes, deployment actions |
| **T3 — IT / Infrastructure** | IT department (Entra ID, SharePoint, Azure) | IT admin(s) as needed | Tenant-level changes, permission grants, identity/certificate issues, Azure resource management |
| **T4 — Architecture** | HB Intel architect / technical lead | 1 person | Design-level decisions, ADR-worthy changes, cross-system impact assessment |

### Staffing assumptions

- This is a small-team product. There is no dedicated 24/7 NOC.
- T1 and T2 are the primary operational tiers. Most issues resolve at T1 or T2.
- T3 is engaged only when the issue requires tenant-level, identity, or infrastructure changes that T2 cannot make.
- T4 is engaged only when the issue reveals a design flaw or requires an architecture decision.

---

## 3. Primary responsibilities by tier

### T1 — Operator / Admin

| Responsibility | Tools / surfaces | Reference |
|---------------|-----------------|-----------|
| Monitor Health dashboard for active alerts and probe status | `/health` — `OperationalDashboardPage` | P12 observability operator runbook |
| Acknowledge and resolve alerts | Alert dashboard — acknowledge/resolve actions | P12 observability operator runbook |
| Monitor Error Log for new error events | `/errors` — `ErrorLogPage` | P12 observability operator runbook |
| Retry failed provisioning runs | `/runs` — retry action (with retry ceiling check) | P6 install operator runbook |
| Escalate stuck or repeatedly failing runs | `/runs` — escalation acknowledgment | P6 install operator runbook |
| Verify app binding status | `/setup/bindings` — `BindingStatusPage` | P6A app binding operator runbook |
| Monitor SharePoint drift and repair posture | `/sharepoint` — `SharePointControlPage` | P8 SharePoint control operator runbook |
| Manage identity operations | `/entra` — `EntraLanePage` | P9 hybrid identity operator runbook |
| Report unresolvable issues to T2 with evidence | See Section 7 — evidence expectations | — |

### T2 — Platform Engineering

| Responsibility | Tools / surfaces | Reference |
|---------------|-----------------|-----------|
| Investigate backend errors and handler failures | Application Insights, KQL queries (`backend/functions/observability/kql/`) | Platform operational runbook — Alerts 1–4 |
| Diagnose provisioning saga step failures | Saga telemetry, failure classification, evidence payloads | Platform operational runbook — Alert 3 |
| Verify backend health endpoint | `GET /api/health` (anonymous) | Platform operational runbook |
| Investigate timer function failures | App Insights traces for `timerFullSpec`, `cleanupIdempotency` | Platform operational runbook — Alert 4 |
| Deploy hotfix or rollback SPFx package | `spfx-deploy.yml` — re-deploy prior .sppkg artifact | P13-05 deployment runbook (pending) |
| Update backend configuration | Azure Portal → Function App → Configuration | P13-03 environment baseline — Section 4 |
| Rotate secrets when expiring | GitHub Environment secrets, Key Vault | P13-03 environment baseline — Section 4.3 |
| Escalate to T3 when issue requires tenant/identity changes | See Section 4 — escalation triggers | — |

### T3 — IT / Infrastructure

| Responsibility | Tools / surfaces | Reference |
|---------------|-----------------|-----------|
| Grant `Sites.Selected` per-site permissions for new project sites | Azure Portal → Entra ID → App registrations | IT-Department-Setup-Guide Sections 7–9 |
| Manage Entra ID app registration and Graph permission grants | Azure Portal → Entra ID | IT-Department-Setup-Guide Section 9 |
| Manage SharePoint App Catalog trust and deployment | SharePoint Admin Center | IT-Department-Setup-Guide Section 10 |
| Manage Azure resource provisioning (Function App, Storage, Key Vault, App Insights) | Azure Portal | IT-Department-Setup-Guide Section 6 |
| Investigate tenant-level auth failures (Azure AD outages, certificate issues) | Azure AD health dashboard, Azure Status | Platform operational runbook — Alert 1 |
| Resolve SharePoint tenant-level access issues | SharePoint Admin Center | Standard tenant support path |

### T4 — Architecture

| Responsibility | When engaged |
|---------------|-------------|
| Assess design-level impact of recurring failures | Pattern of failures reveals a design assumption that no longer holds |
| Authorize ADR-worthy changes (new dependencies, boundary changes, permission model changes) | Issue resolution requires changing an architectural invariant |
| Evaluate expansion scope (new admin domains, new external integrations) | Proposed fix or feature exceeds current production scope |
| Arbitrate cross-tier disagreements on resolution approach | T2 and T3 disagree on root cause or ownership |

---

## 4. Escalation triggers

### T1 → T2 (Operator → Platform Engineering)

| Trigger | Evidence to attach | Urgency |
|---------|-------------------|---------|
| Alert persists > 30 minutes after acknowledgment | Alert ID, timestamp, acknowledgment time, screenshot | High |
| Provisioning run fails after maximum retry attempts | Run ID, failure classification, step detail from `/runs` | High |
| Multiple probes simultaneously in error state | Probe dashboard screenshot, timestamps | High |
| Error Log shows repeated errors across projects | Error domain, severity, classification filters applied | Medium |
| In-app action produces unexpected error | Screenshot, action attempted, user context | Medium |
| Backend appears unreachable (polling stops, health check fails) | Browser console output, backend URL configured | High |

### T2 → T3 (Platform Engineering → IT / Infrastructure)

| Trigger | Evidence to attach | Urgency |
|---------|-------------------|---------|
| Auth failure burst — widespread 401 errors | App Insights query results (KQL: `kql/auth-token.kql`), token audience check | Critical |
| Graph API permission error on group/site operations | Error response body, managed identity object ID, permission scope attempted | High |
| SharePoint site-level access denied (403) | Site URL, managed identity object ID, `Sites.Selected` grant status | High |
| Azure resource unavailable (Storage, Key Vault, App Insights) | Azure Portal resource health status, Function App logs | High |
| App registration secret expired | Deployment pipeline failure log, secret expiry date | Critical |
| New project site needs per-site grant | Project site URL, managed identity object ID | Medium |

### T2 → T4 (Platform Engineering → Architecture)

| Trigger | Evidence to attach | Urgency |
|---------|-------------------|---------|
| Recurring failure pattern suggests design issue | Failure timeline, root cause analysis, proposed alternatives | Medium |
| Resolution requires changing package boundaries, dependency direction, or shared primitives | Proposed change description, affected packages | Low |
| Resolution requires new external dependency or new Azure service | Dependency justification, cost/risk assessment | Low |
| Permission model change needed (Sites.Selected → broader, or new Graph scope) | Current vs. proposed permission model, security impact | Medium |

### T3 → T4 (IT → Architecture)

| Trigger | Evidence to attach | Urgency |
|---------|-------------------|---------|
| Tenant-level policy conflicts with HB Intel requirements | Policy details, conflict description | Medium |
| Infrastructure change would alter the runtime or deployment model | Proposed change, impact on existing deployments | Low |

---

## 5. Severity / priority guidance

### Severity definitions

| Severity | Definition | Examples | Target response | Target resolution |
|----------|-----------|----------|----------------|-------------------|
| **Sev 1 — Critical** | System-level or safety failure; admin console unusable or producing incorrect results | Auth failure burst (all users locked out), total backend outage, data corruption, provisioning saga creating incorrect site structures | Acknowledge within 15 minutes | Mitigate within 1 hour; root cause within 4 hours |
| **Sev 2 — High** | Significant capability degraded; admin can work around but core workflow is impaired | Provisioning saga failures across multiple projects, probe health all-error, deployment pipeline broken, configuration drift affecting multiple sites | Acknowledge within 30 minutes | Mitigate within 4 hours; root cause within 1 business day |
| **Sev 3 — Medium** | Non-critical degradation; specific feature or workflow impaired but alternatives exist | Single provisioning run stuck, one probe returning error, alert notification not delivered, single-site permission issue | Acknowledge within 2 hours | Resolve within 2 business days |
| **Sev 4 — Low** | Cosmetic, informational, or improvement request; no workflow impact | UI rendering inconsistency, documentation gap, non-blocking warning in logs, feature request | Acknowledge within 1 business day | Schedule for next planned work cycle |

### Priority matrix

| Impact ↓ / Urgency → | Immediate (production down) | Soon (degraded) | Scheduled (non-blocking) |
|----------------------|---------------------------|-----------------|------------------------|
| **Broad** (all users/projects) | Sev 1 | Sev 2 | Sev 3 |
| **Narrow** (single user/project) | Sev 2 | Sev 3 | Sev 4 |
| **Cosmetic** (no workflow impact) | Sev 3 | Sev 4 | Sev 4 |

### Alignment with existing alert severities

The alert severity levels in the observability system (Critical, High, Medium, Low) map directly to these support severities:
- **Critical alert** → Sev 1 — immediate Teams webhook notification
- **High alert** → Sev 2 — immediate Teams webhook notification
- **Medium alert** → Sev 3 — digest queue (Wave 0: console-logged)
- **Low alert** → Sev 4 — digest queue (Wave 0: console-logged)

Source: P12 observability operator runbook, `@hbc/features-admin` notification router

---

## 6. Hand-off expectations

### T1 → T2 hand-off

| Expectation | Detail |
|------------|--------|
| **What T1 must provide** | Issue description, severity assessment, evidence collected (see Section 7), actions already taken, time of first occurrence |
| **What T1 must NOT do** | Modify backend configuration, access Azure Portal directly, attempt code-level fixes, redeploy packages |
| **T2 acknowledgment** | T2 acknowledges receipt and provides initial assessment within the target response time for the assigned severity |
| **Ownership transfer** | Issue ownership transfers to T2 upon acknowledgment. T1 remains available for context questions. |

### T2 → T3 hand-off

| Expectation | Detail |
|------------|--------|
| **What T2 must provide** | Root cause analysis (or best hypothesis), specific action needed from IT, affected Azure resources / Entra objects / SharePoint sites, urgency justification |
| **What T2 must NOT do** | Make tenant-level permission changes, modify Entra ID app registrations directly, change SharePoint Admin Center settings |
| **T3 acknowledgment** | T3 acknowledges and provides estimated completion time |
| **Ownership transfer** | Issue ownership transfers to T3 for the specific infrastructure action. T2 retains ownership of the overall issue and verifies resolution. |

### T2 → T4 hand-off

| Expectation | Detail |
|------------|--------|
| **What T2 must provide** | Technical analysis, proposed alternatives with trade-offs, impact assessment, recommendation |
| **T4 response** | Architecture decision or direction, typically within 1 business day for non-critical issues |
| **Ownership** | T4 provides direction; T2 implements. T4 does not take operational ownership. |

---

## 7. Communication and evidence expectations

### Evidence to collect before escalation

| Issue type | Required evidence |
|-----------|-------------------|
| **Auth / permission failure** | Error response (status code, body), user identity, permission key expected, timestamp, App Insights correlation ID if available |
| **Provisioning saga failure** | Run ID, failed step number, failure classification (from `/runs` detail), retry count, project ID |
| **Backend error / outage** | Health endpoint response (`GET /api/health`), App Insights KQL query results, Function App status in Azure Portal |
| **Deployment failure** | GitHub Actions workflow run URL, error log from failed step, artifact version attempted |
| **Alert / observability issue** | Alert ID, severity, category, timestamp, notification delivery status (if webhook failure) |
| **SharePoint / site issue** | Site URL, operation attempted, error message, managed identity object ID |
| **Configuration drift** | Expected vs. actual value, environment (staging/production), when drift was detected |
| **Timer function failure** | Function name, expected schedule, last successful run, App Insights trace |

### Communication channels

| Channel | Use for | Participants |
|---------|---------|-------------|
| In-app surfaces (Health, Error Log, Runs) | T1 monitoring, evidence collection, operator actions | T1 operators |
| Teams `#hb-intel-alerts` (production) | Automated alert notifications (Critical/High) | T1, T2 |
| Teams `#hb-intel-alerts-staging` (staging) | Staging alert notifications | T2 |
| Direct message / call | Sev 1 escalations requiring immediate response | T1 → T2, T2 → T3 |
| Issue tracker | Non-urgent issues, feature requests, improvement tracking | All tiers |
| Azure Portal | Infrastructure investigation and changes | T2, T3 |
| GitHub Actions | Deployment monitoring and re-runs | T2 |

### Evidence retention

- In-app alert history: indefinite for active alerts, 90 days for resolved (P12 config-and-retention guide)
- Error log: 90-day retention (P12 config-and-retention guide)
- Audit events: 365-day retention (P12 config-and-retention guide)
- Run history: 365-day retention (P12 config-and-retention guide)
- Application Insights: per Log Analytics workspace retention policy (default 90 days)
- GitHub Actions artifacts: 30-day retention

---

## 8. Out-of-scope issues and routing guidance

### Issues NOT owned by the Admin IT Control Center support model

| Issue type | Route to | Reason |
|-----------|---------|--------|
| Requester-facing PWA bugs or feature requests | PWA product team | Admin console is the operator surface, not the requester surface |
| SharePoint tenant-wide policy changes unrelated to HB Intel | IT / SharePoint Admin (general) | HB Intel admin controls only HB Intel-managed assets |
| Azure subscription billing, quota, or resource limit issues | Cloud operations / finance | Infrastructure cost management is outside product support |
| Entra ID tenant-wide security policy changes | IT security team | HB Intel does not own tenant-wide identity policy |
| End-user device issues (non-white-glove) | IT helpdesk | Standard IT support, not HB Intel scope |
| Business process questions (project setup decisions, approval workflows) | Project management / business operations | Product support handles system behavior, not business decisions |
| Feature requests for new admin domains not in current scope | T4 (architecture) for evaluation → product backlog | Expansion rails are documented (P13-08, pending) but not in production scope |

### Routing decision aid

When an issue arrives and ownership is unclear:

1. **Is the issue visible in the Admin console (Health, Error Log, Runs, SharePoint, Entra)?** → T1 owns triage.
2. **Does the issue require code, configuration, or deployment changes?** → T2.
3. **Does the issue require Azure Portal, Entra ID, or SharePoint Admin Center changes?** → T3.
4. **Does the issue suggest a design flaw or need a new architectural decision?** → T4.
5. **Is the issue about a system or surface not listed above?** → Route to the appropriate product or IT team; it is out of scope for this support model.

---

## Runbook cross-references

This document defines ownership and escalation. For specific response procedures, use these runbooks:

| Runbook | Location | Covers |
|---------|----------|--------|
| Platform Operational Runbook | `docs/how-to/developer/operational-runbook.md` | 4 alert response procedures, health endpoint, timer schedule, escalation path |
| Install Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-06/admin-spfx-install-operator-runbook.md` | Backend install/bootstrap operations |
| App Binding Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-operator-runbook.md` | App binding status and repair |
| SharePoint Control Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-08/admin-spfx-phase-8-sharepoint-control-operator-runbook.md` | SharePoint control operations |
| Hybrid Identity Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-09/admin-spfx-phase-9-operator-runbook.md` | Identity administration operations |
| Observability Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-operator-runbook-notes.md` | Error log, alerts, probes, severity, operator actions |
| Configuration and Retention Guide | `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-config-and-retention-guide.md` | Storage tables, retention targets, polling intervals |
| IT Department Setup Guide | `docs/how-to/administrator/setup/backend/IT-Department-Setup-Guide.md` | Azure resources, Entra ID, SharePoint, infrastructure setup |
| Deployment and Rollback Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-13/admin-spfx-phase-13-deployment-and-rollback-runbook.md` | **Pending** — P13-05 deliverable |
| Incident Triage and Recovery Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-13/admin-spfx-phase-13-incident-triage-and-recovery-runbook.md` | **Pending** — P13-06 deliverable |

---

## Validation checklist

- [x] Model is sized for a small, realistic support footprint (4 tiers, 1–2 people per operational tier)
- [x] Every major failure mode has an owner and escalation route
- [x] Escalation triggers are specific with required evidence
- [x] Severity definitions are concrete with target response/resolution times
- [x] Hand-off expectations are explicit for each tier transition
- [x] Document references runbooks instead of duplicating response procedures
- [x] Out-of-scope issues have routing guidance
- [x] Alert severity levels align with support severity definitions
