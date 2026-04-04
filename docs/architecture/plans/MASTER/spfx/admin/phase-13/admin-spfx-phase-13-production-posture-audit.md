# Admin SPFx IT Control Center — Phase 13 Production Posture and Gap Audit

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-01 — Phase 13 Production Posture and Gap Audit
**Scope:** Audit only — no implementation changes

---

## 1. Purpose

This document records the verified production posture of the Admin SPFx IT Control Center as of Phase 13 entry. It serves as the grounding evidence for all subsequent Phase 13 prompts (P13-02 through P13-10).

This is a present-truth audit, not a roadmap. Every claim is categorized as one of:

- **[repo fact]** — verified from live code, configuration, or documentation in the repository
- **[inferred risk]** — a production concern derived from confirmed facts but not directly observable as a failing state
- **[recommendation]** — a suggested Phase 13 action to address a gap or risk

---

## 2. Authority set used

| Source | Purpose |
|--------|---------|
| `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md` | Phase definitions, locked decisions, exit criteria |
| `docs/architecture/plans/MASTER/spfx/admin/phase-13r/Admin-SPFx-IT-Control-Center-Phase-13-Summary-Plan.md` | Phase 13 objectives and deliverables |
| `docs/architecture/blueprint/current-state-map.md` | Present-truth repo coverage and Wave 0 closeout status |
| `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-observability-gap-map.md` | Phase 12 observability state and remaining limitations |
| `apps/admin/package.json` | App version (`00.000.132`), dependencies, scripts |
| `apps/admin/src/router/routes.ts` | Current route definitions (20 routes) |
| `apps/admin/src/router/lane-registry.ts` | Lane status and navigation metadata |
| `apps/admin/README.md` | Operator console model, polling services, lane governance |
| `apps/admin/vite.config.ts` | Build configuration, chunk strategy, environment variables |
| `apps/admin/.eslintrc.cjs` | 10 custom enforcement rules |
| `apps/admin/src/webparts/admin/AdminWebPart.manifest.json` | WebPart identity and host support |
| `apps/admin/config/package-solution.json` | SPFx solution packaging |
| `apps/admin/config/deploy-azure-storage.json` | Azure Storage deployment config |
| `packages/features/admin/README.md` | Phase 12 completions, known limitations, exports |
| `backend/functions/README.md` | API surface, domain hosts, environment guidance |
| `backend/functions/package.json` | Backend version (`00.000.135`), dependencies, scripts |
| `backend/functions/src/config/wave0-env-registry.ts` | 25+ configuration entries with production requirements |
| `backend/functions/src/utils/validate-config.ts` | Tiered configuration validation |
| `backend/functions/src/hosts/admin-control-plane/host.json` | CORS, sampling, timeout, SignalR |
| `backend/functions/observability/README.md` | KQL queries, alert rules, DevOps setup checklist |
| `.github/workflows/spfx-build.yml` | CI pipeline (build, test, lint, bundle, manifest) |
| `.github/workflows/spfx-deploy.yml` | CD pipeline (staging auto, production manual) |
| `docs/how-to/administrator/setup/backend/IT-Department-Setup-Guide.md` | Production infrastructure setup (1,157 lines) |
| `docs/how-to/developer/phase-8-ci-cd-guide.md` | CI/CD workflow documentation |
| `docs/how-to/developer/phase-7-azure-functions-guide.md` | Azure Functions runtime and saga guide |
| `docs/how-to/developer/operational-runbook.md` | Platform alert response and escalation |
| `docs/architecture/plans/MASTER/spfx/admin/phase-06/admin-spfx-install-operator-runbook.md` | Install operator runbook |
| `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-operator-runbook.md` | App binding operator runbook |
| `docs/architecture/plans/MASTER/spfx/admin/phase-08/admin-spfx-phase-8-sharepoint-control-operator-runbook.md` | SharePoint control operator runbook |
| `docs/architecture/plans/MASTER/spfx/admin/phase-09/admin-spfx-phase-9-operator-runbook.md` | Hybrid identity operator runbook |
| `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-operator-runbook-notes.md` | Observability operator runbook |
| `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-config-and-retention-guide.md` | Configuration and retention guidance |

---

## 3. Confirmed production-relevant foundations already present

### SPFx application (`apps/admin`)

| Foundation | Evidence | Notes |
|-----------|----------|-------|
| Real SPFx app package | `apps/admin/package.json` v`00.000.132` | [repo fact] Private, ES module, workspace dependencies |
| 20 route definitions with lazy code splitting | `apps/admin/src/router/routes.ts` | [repo fact] TanStack Router v1, permission-gated |
| 8-lane operator console | `apps/admin/src/router/lane-registry.ts` | [repo fact] 7 active lanes + 1 scaffold (Validation) |
| Permission-gated route access | `routes.ts` — `requireAdminAccessControl()` | [repo fact] `admin:access-control:view` enforced before load |
| Legacy backward-compatible redirects | `routes.ts` | [repo fact] `/provisioning-failures`→`/runs`, `/dashboards`→`/health`, `/error-log`→`/errors` |
| SPFx WebPart with stable GUID | `AdminWebPart.manifest.json` — `cfade002-7ec3-4939-92bf-4aec3e2162e7` | [repo fact] Supports SharePointWebPart + TeamsPersonalApp |
| SPFx auth bootstrap with RBAC mapping | `AdminWebPart.tsx` — `bootstrapSpfxAuth()` | [repo fact] D-PH7-BW-7 SP group → permission key resolution |
| Dev mode isolation | `apps/admin/src/bootstrap.ts` | [repo fact] Mock auth/permissions for Vite dev server |
| 10 custom ESLint enforcement rules | `apps/admin/.eslintrc.cjs` | [repo fact] 6 error-level (CI-blocking), 4 warn-level |
| Alert polling at shell level | `apps/admin` root route — `useAlertPolling()` | [repo fact] 30s cycle, skips if no backend URL |
| Probe polling at shell level | `apps/admin` root route — `useProbePolling()` | [repo fact] 15min cycle, in-memory snapshots |
| Unit test suite | `apps/admin/src/test/` | [repo fact] Router, bootstrap, alertPolling, pages, bottleneck rules |

### CI/CD pipeline

| Foundation | Evidence | Notes |
|-----------|----------|-------|
| Automated SPFx build pipeline | `.github/workflows/spfx-build.yml` | [repo fact] Triggers on push to main/develop, PRs to main |
| Build job: shared packages → SPFx apps → unit tests → bundle check → manifest validation → .sppkg packaging | `spfx-build.yml` | [repo fact] All 11 SPFx apps built and tested |
| Parallel lint + typecheck job | `spfx-build.yml` | [repo fact] `pnpm turbo run lint` + `check-types` |
| Bundle size enforcement | `spfx-build.yml` — `tools/spfx-bundle-check.ts` | [repo fact] 800 KB warning limit |
| Manifest GUID uniqueness validation | `spfx-build.yml` — `tools/validate-manifests.ts` | [repo fact] Prevents GUID collisions across 11 apps |
| Auto-deploy to staging | `.github/workflows/spfx-deploy.yml` | [repo fact] Triggered by successful build on main |
| Manual production deploy with approval gate | `spfx-deploy.yml` | [repo fact] GitHub Environment protection rule required |
| Artifact retention | `spfx-build.yml` | [repo fact] 30-day .sppkg retention |
| Turborepo caching | `spfx-build.yml` | [repo fact] GitHub Actions cache for incremental builds |
| Security audit workflow | `.github/workflows/security.yml` | [repo fact] Weekly + PR-triggered `pnpm audit --audit-level=high` |

### Backend (`backend/functions`)

| Foundation | Evidence | Notes |
|-----------|----------|-------|
| Azure Functions v4, Node.js 20 | `backend/functions/package.json` v`00.000.135` | [repo fact] `@azure/functions@^4.6.0` |
| 3 domain hosts (ADR-0124) | `backend/functions/README.md` | [repo fact] Monolithic (19 route families), project-setup (8), admin-control-plane (2) |
| 40+ API endpoints across 4 families | `backend/functions/README.md` | [repo fact] Admin control plane (13), app binding (5), hybrid identity (9), observability (15) |
| Managed Identity in production | `backend/functions/README.md`, `wave0-env-registry.ts` | [repo fact] Service principal for local dev only |
| CORS locked to SharePoint tenant | `hosts/admin-control-plane/host.json` | [repo fact] `allowedOrigins: ["https://hedrickbrotherscom.sharepoint.com"]` |
| Tiered configuration validation | `backend/functions/src/utils/validate-config.ts` | [repo fact] Core, SharePoint, and provisioning tiers with startup + execution-time gates |
| 9 required production config entries | `wave0-env-registry.ts` | [repo fact] Core tier: tenant ID, client ID, table endpoint, App Insights, API audience, adapter mode; SharePoint tier: tenant URL, projects site URL |
| Provisioning prerequisite gates (7) | `validate-config.ts` — `validateProvisioningPrerequisites()` | [repo fact] Graph permission, tenant ID, SharePoint URLs, hub site, app catalog, SPFx app ID, OpEx manager UPN |
| JWT validation via `jose` | `backend/functions/package.json` | [repo fact] `jose@^5.9.6` |
| Schema validation via `zod` | `backend/functions/package.json` | [repo fact] `zod@^3.24.2` |
| Application Insights sampling | `host.json` | [repo fact] 20 items/sec, exceptions excluded from sampling |
| 10-minute function timeout | `host.json` | [repo fact] `functionTimeout: "00:10:00"` |
| Timer functions | Phase 7 Azure Functions guide | [repo fact] `timerFullSpec` (1 AM EST deferred Step 5), `cleanupIdempotency` (3 AM EST, 24h TTL) |

### Durable storage

| Foundation | Evidence | Notes |
|-----------|----------|-------|
| 6 Azure Table Storage tables | Backend README, observability gap map | [repo fact] `AdminRuns`, `AdminAuditEvents`, `AdminEvidence`, `ObservabilityAlerts`, `ObservabilityProbeSnapshots`, `ObservabilityErrors` |
| Admin run store | `admin-run-store.ts` | [repo fact] Partition by domain, row by runId |
| Admin audit store | `admin-audit-store.ts` | [repo fact] Append-only, 16 audit event types |
| Admin evidence store | Backend README | [repo fact] Durable evidence persistence |
| Observability alert store | `observability-alert-store.ts` | [repo fact] Category-partitioned, deduplication, severity tracking, acknowledge/resolve (P12-04) |
| Observability probe store | `observability-probe-store.ts` | [repo fact] Probe snapshot persistence (P12-05); full query operations partially implemented |
| Observability error store | `observability-error-store.ts` | [repo fact] Append-only, domain-partitioned, filtered query (P12-01) |

### Observability and monitoring

| Foundation | Evidence | Notes |
|-----------|----------|-------|
| 3 live monitors | `@hbc/features-admin` README | [repo fact] provisioning-failure, stuck-workflow, overdue-provisioning |
| 2 live probes | `@hbc/features-admin` README | [repo fact] azure-functions, sharepoint (real network connections) |
| 15 backend observability API endpoints | `observability-routes.ts` | [repo fact] Alerts CRUD, probes, errors, dashboard, timeline |
| Observability error emitter | `observability-emitter.ts` | [repo fact] Fire-and-forget ingestion from route handlers with classification heuristics |
| Provisioning audit bridge | `provisioning-audit-bridge.ts` | [repo fact] 11 provisioning event types mapped to audit spine |
| 5-class failure classification | `classify-failure.ts` | [repo fact] Transient, permissions, structural, repeated, admin-class |
| Teams webhook dispatch with delivery tracking | `TeamsWebhookDispatchAdapter` | [repo fact] Acknowledged-alert suppression, 5-min cooldown (P12-09) |
| Notification router | `@hbc/features-admin` | [repo fact] Severity-based immediate/digest routing |
| 5 KQL query files | `backend/functions/observability/kql/` | [repo fact] Adapter health, auth token, provisioning, error budget, notification |
| 5 alert rule definitions | `backend/functions/observability/README.md` | [repo fact] Defined in documentation but NOT deployed to Azure Monitor |
| Error Log operator surface | `apps/admin` — `/errors` | [repo fact] Backend-integrated, domain/severity/classification filters, smart empty states (P12-08) |
| Operational Dashboard surface | `apps/admin` — `/health` | [repo fact] Queue health, bottleneck detection, alert dashboard integration |
| Provisioning Oversight surface | `apps/admin` — `/runs` | [repo fact] Retry/archive/escalate/force-state, failure classification, tab views |

### Safety model (Phase 11)

| Foundation | Evidence | Notes |
|-----------|----------|-------|
| Safety workflow orchestrator | `@hbc/features-admin` | [repo fact] Preview, confirmation, post-run validation, recovery |
| Backend enforcement | `backend/functions` | [repo fact] Durable evidence persistence at terminal states |
| Risk-tiered action gates | Phase 11 plan deliverables | [repo fact] Complexity dial: essential/standard/expert tiers |

### Existing operational documentation

| Document | Location | Scope |
|----------|----------|-------|
| IT Department Setup Guide | `docs/how-to/administrator/setup/backend/IT-Department-Setup-Guide.md` | [repo fact] 1,157 lines: Azure resources, Entra ID, SharePoint, email, verification checklist, troubleshooting |
| Phase 8 CI/CD Guide | `docs/how-to/developer/phase-8-ci-cd-guide.md` | [repo fact] 3 GitHub Actions workflows, secrets, local commands |
| Phase 7 Azure Functions Guide | `docs/how-to/developer/phase-7-azure-functions-guide.md` | [repo fact] Runtime, saga, SignalR, timer functions |
| Platform Operational Runbook | `docs/how-to/developer/operational-runbook.md` | [repo fact] 4 alert response procedures, health endpoint, timer schedule, escalation path |
| Install Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-06/admin-spfx-install-operator-runbook.md` | [repo fact] Backend install/bootstrap operations |
| App Binding Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-operator-runbook.md` | [repo fact] App binding status and repair |
| SharePoint Control Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-08/admin-spfx-phase-8-sharepoint-control-operator-runbook.md` | [repo fact] SharePoint control operations |
| Hybrid Identity Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-09/admin-spfx-phase-9-operator-runbook.md` | [repo fact] Identity administration operations |
| Observability Operator Runbook | `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-operator-runbook-notes.md` | [repo fact] Error log, alerts, probes, severity levels, operator actions, escalation triggers |
| Configuration and Retention Guide | `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-config-and-retention-guide.md` | [repo fact] Storage tables, retention targets, polling intervals, adapter modes |

---

## 4. Confirmed production-readiness gaps

| ID | Gap | Evidence | Category | Severity | Phase 13 target |
|----|-----|----------|----------|----------|-----------------|
| G1 | Observability alert rules and dashboards NOT deployed to Azure Monitor | `backend/functions/observability/README.md` — DevOps setup checklist fully unchecked | Implementation-dependent | Significant | P13-03 (environment baseline) |
| G2 | Email relay is console-logged only — no SMTP integration | `@hbc/features-admin` README — "Still open" | Implementation-dependent | Minor | P13-10 (exit reconciliation — document as known deferral) |
| G3 | 3 of 6 monitors are stubs returning empty arrays | `@hbc/features-admin` README — permission-anomaly, upcoming-expiration, stale-record lack domain data providers | Implementation-dependent | Minor | P13-10 (exit reconciliation — document as known deferral) |
| G4 | 3 of 5 probes return `unknown` status | `@hbc/features-admin` README — search, notification, module-record-health lack live endpoints | Implementation-dependent | Minor | P13-10 (exit reconciliation — document as known deferral) |
| G5 | ApprovalAuthority not persisted (rules lost on reload) | `@hbc/features-admin` README — SF17-T05 scope | Implementation-dependent | Minor | P13-10 (exit reconciliation — document as known deferral) |
| G6 | Teams webhook delivery is fire-and-forget with no retry queue | `@hbc/features-admin` README — "Still open" | Implementation-dependent | Minor | P13-10 (exit reconciliation — document as known deferral) |
| G7 | No consolidated production readiness checklist or release gate document | No such document exists in repo | Doc-only | Blocking | P13-02 (release readiness baseline) |
| G8 | No incident triage or break-glass runbook | Existing `operational-runbook.md` covers alert response but not incident management or break-glass paths | Doc-only | Blocking | P13-06 (incident triage runbooks) |
| G9 | No rollback/recovery runbook | No such document in repo; `spfx-deploy.yml` supports re-deploy but no documented rollback procedure | Doc-only | Blocking | P13-05 (deployment and rollback runbooks) |
| G10 | No defined support/escalation model | `operational-runbook.md` has a 4-tier escalation path but no formal ownership matrix, on-call structure, or SLA expectations | Doc-only | Blocking | P13-04 (support model and escalation matrix) |
| G11 | No admin-specific deployment runbook covering SPFx + backend coordination | `spfx-deploy.yml` handles SPFx; no doc coordinates admin app + backend/functions deployment together | Doc-only | Significant | P13-05 (deployment and rollback runbooks) |
| G12 | No automated environment separation verification | IT-Department-Setup-Guide mentions environment separation but no automated check exists | Implementation-dependent | Minor | P13-03 (environment baseline — document as recommendation) |
| G13 | Open architecture decisions blocking IT operational readiness | IT-Department-Setup-Guide Section 13: table names (dev team pending), list schemas (business pending), per-site grant automation, Redis timing, OBO endpoints, on-call paging | Doc-only + external dependency | Significant | P13-03 (environment baseline) + P13-10 (exit reconciliation) |
| G14 | SignalR real integration not tested in production-like environment | Phase 7 guide documents theory; mock implementation still in place | Implementation-dependent | Minor | P13-10 (exit reconciliation — document as known deferral) |
| G15 | No operational doctrine document covering incident handling, degraded mode, service boundaries, and ownership | No such consolidated document exists; fragments in various runbooks | Doc-only | Blocking | P13-07 (operational doctrine) |
| G16 | No expansion architecture document for future admin domains | End-state plan references expansion but no dedicated expansion rails document exists | Doc-only | Significant | P13-08 (expansion rails architecture) |

---

## 5. What is documentation-only vs implementation-dependent

### Documentation-only gaps (closable within Phase 13 docs work)

| ID | Gap | Phase 13 deliverable |
|----|-----|---------------------|
| G7 | No production readiness checklist / release gate document | P13-02: Release readiness baseline and gates |
| G8 | No incident triage / break-glass runbook | P13-06: Incident triage, recovery, and break-glass runbooks |
| G9 | No rollback/recovery runbook | P13-05: Deployment and rollback runbooks |
| G10 | No support/escalation model with ownership matrix | P13-04: Support model and escalation matrix |
| G11 | No admin-specific deployment runbook (SPFx + backend) | P13-05: Deployment and rollback runbooks |
| G15 | No operational doctrine document | P13-07: Operational doctrine and service boundaries |
| G16 | No expansion architecture document | P13-08: Expansion rails architecture |
| G13 (partial) | Open architecture decisions need documentation/resolution tracking | P13-03 + P13-10 |

### Implementation-dependent gaps (require code, infrastructure, or external changes beyond Phase 13 scope)

| ID | Gap | Required action | Recommended Phase 13 treatment |
|----|-----|----------------|-------------------------------|
| G1 | Alert rules/dashboards not deployed to Azure Monitor | DevOps must create Azure Monitor workbooks, alert rules, action group, and Teams Workflow | Document as production prerequisite in P13-03; include in release gate checklist (P13-02) |
| G2 | Email relay console-logged only | Requires SMTP integration (SendGrid or equivalent) | Document as known Wave 0 deferral in exit reconciliation (P13-10) |
| G3 | 3 monitors are stubs | Requires domain data providers not yet modeled | Document as known deferrals with data-provider prerequisites (P13-10) |
| G4 | 3 probes return `unknown` | Requires live backend health endpoints not yet available | Document as known deferrals with endpoint prerequisites (P13-10) |
| G5 | ApprovalAuthority not persisted | SF17-T05 scope — requires backend persistence work | Document as out-of-scope deferral (P13-10) |
| G6 | Teams webhook no retry queue | Requires persistent retry mechanism | Document as known Wave 0 limitation; delivery tracking (P12-09) mitigates observability gap (P13-10) |
| G12 | No automated env separation verification | Requires infrastructure tooling | Document as recommendation in environment baseline (P13-03) |
| G14 | SignalR not tested with real Azure SignalR | Requires staging environment with real SignalR Service | Document as pre-production verification item (P13-10) |

Phase 13 is a production-hardening phase focused on documentation, readiness packaging, and operational doctrine. Implementation-dependent gaps should be documented as known risks with mitigation status, not treated as Phase 13 deliverables.

---

## 6. Earlier-phase outputs this phase depends on

| Dependency | Phase | Status | Evidence |
|-----------|-------|--------|---------|
| Admin app exists as real SPFx package with route-driven operator console | Phase 2–5 | **Satisfied** | `apps/admin/package.json` v`00.000.132`, 20 routes, 8-lane console |
| Privileged backend with authenticated API surface | Phase 3 | **Satisfied** | `backend/functions` with JWT validation, auth middleware, managed identity |
| Durable run/audit/evidence stores in Azure Table Storage | Phase 4 | **Satisfied** | `DurableAdminRunStore`, `DurableAdminAuditStore`, `DurableAdminEvidenceStore` with round-trip tests |
| Provisioning saga with structured telemetry and failure classification | Phase 4 | **Satisfied** | `saga-orchestrator.ts`, `classify-failure.ts`, `build-evidence-payload.ts` |
| In-app backend install and bootstrap | Phase 6 | **Satisfied** | Install operator runbook delivered |
| Managed app binding and backend-setup configuration | Phase 6A | **Satisfied** | App binding operator runbook delivered |
| Provisioning saga refinement | Phase 7 | **Satisfied** | Azure Functions guide, timer functions, SignalR pattern documented |
| SharePoint control surface | Phase 8 | **Satisfied** | `SharePointControlPage`, operator runbook delivered |
| CI/CD pipeline with staging and production deployment | Phase 8 | **Satisfied** | `spfx-build.yml`, `spfx-deploy.yml`, CI/CD guide |
| Hybrid identity administration | Phase 9 | **Satisfied** | `EntraLanePage`, 7 identity API endpoints, operator runbook delivered |
| White-glove device deployment | Phase 9.1 | **Satisfied** | 7 white-glove routes, 5 hooks |
| Standards and configuration governance | Phase 10 | **Satisfied** | `StandardsConfigPage`, `SystemSettingsPage` |
| High-risk action safety model | Phase 11 | **Satisfied** | Safety workflow orchestrator, preview, confirmation, recovery |
| Admin intelligence and observability | Phase 12 | **Satisfied (with noted partial items)** | Durable storage, 15 observability APIs, 3 live monitors, 2 live probes, error log, operator runbook; partial: dashboard/timeline services, 3 deferred monitors, 3 deferred probes |
| IT Department infrastructure setup guidance | Cross-phase | **Satisfied** | IT-Department-Setup-Guide (1,157 lines) with verification checklist |
| Platform operational runbook | Cross-phase | **Satisfied** | `operational-runbook.md` — 4 alert response procedures, health endpoint, escalation path |

All earlier-phase dependencies are satisfied at a level that supports Phase 13 production-hardening work. No earlier phase must be revisited before Phase 13 can proceed.

---

## 7. Explicit non-gaps

These items may appear to be production gaps but are intentionally correct by design.

| Item | Why it is not a gap |
|------|-------------------|
| Dev mode with mock auth/permissions | [repo fact] Correct for local development; `HBC_ADAPTER_MODE=mock` / `HBC_AUTH_MODE=mock` are dev-only. Production uses `proxy` / `spfx` modes. |
| In-memory caches in `AdminAlertsApi` and `InfrastructureProbeApi` | [repo fact] Durable state lives in backend Azure Table Storage (P12-04, P12-05). In-memory `Map` is an intentional local cache for the polling cycle. |
| Validation lane as scaffold | [repo fact] Phase 7 delivery scope, not a Phase 13 concern. Lane registry correctly marks it as `scaffold` with dimmed rendering. |
| Legacy redirects (`/provisioning-failures`, `/dashboards`, `/error-log`) | [repo fact] Intentional backward compatibility preserving bookmarks and external links. |
| 3 deferred monitors returning empty arrays | [repo fact] These monitors lack domain data providers (permission audit, expiration tracking, record freshness). Returning `[]` is correct behavior — they cannot fire without the domain modeling, which is future scope. |
| 3 deferred probes returning `unknown` | [repo fact] Corrected from misleading `healthy` in P12-06. Returning `unknown` accurately reflects that no live endpoint exists for these probes. |
| ApprovalAuthority as stub | [repo fact] SF17-T05 scope. `SystemSettingsPage` displays Wave 0 limitation banner. Not a Phase 13 concern. |
| `requiresCustomScript: false` in WebPart manifest | [repo fact] Correct for SPFx security sandbox compliance. |
| `AZURE_CLIENT_SECRET` in `local.settings.example.json` | [repo fact] Marked as local development only. Production uses managed identity (no secret). The example file is correctly gitignored for actual settings. |
| Fire-and-forget observability error emitter | [repo fact] By design: non-blocking error ingestion from route handlers. Failures in the emitter must not cascade to request handling. |
| Alert polling skips when `VITE_FUNCTION_APP_URL` is not configured | [repo fact] Prevents HTML fallback parse errors in environments without a backend. Correct graceful degradation. |

---

## 8. Residual unknowns requiring later verification

These items cannot be verified from the repository alone. They require access to the actual production environment, external services, or human confirmation.

| Unknown | Why it matters | Verification method |
|---------|---------------|-------------------|
| Whether the 9 required production config entries are populated in the production Azure Function App | Missing entries will cause startup or runtime failures | Inspect Azure Portal Function App → Configuration; or run `validateCoreConfig()` against production |
| Whether GitHub Environment protection rules for `spfx-production` are configured with intended approval gates | Without protection rules, production deployment could proceed without review | Inspect GitHub repository Settings → Environments → `spfx-production` |
| Whether 6 Azure Table Storage tables exist in the production subscription with correct access policies | Missing tables will cause 404 errors on first write | Inspect Azure Portal Storage Account → Tables; verify managed identity has Table Data Contributor role |
| Whether managed identity permissions in production match the required Graph and SharePoint scopes | Incorrect permissions will cause 403 errors in provisioning saga and identity operations | Verify `Sites.Selected` grants per site, `Group.ReadWrite.All` grant, Application ID URI format |
| Whether the SharePoint App Catalog has correct trust and deployment settings for the admin WebPart | Untrusted app will not render in SharePoint pages | Verify App Catalog → `hb-intel-admin.sppkg` → Deployed + Trusted |
| Whether Teams webhook URLs are configured in production environment variables | Unconfigured webhooks mean no alert notifications despite delivery tracking code being present | Inspect `VITE_TEAMS_WEBHOOK_URL` in Function App configuration |
| Whether Application Insights is provisioned, connected, and receiving telemetry | Without App Insights, KQL queries and alert rules (G1) have no data source | Inspect `APPLICATIONINSIGHTS_CONNECTION_STRING` in Function App; verify telemetry in App Insights Live Metrics |
| Whether `WEBSITE_TIME_ZONE=Eastern Standard Time` is set in production | Timer functions (`timerFullSpec`, `cleanupIdempotency`) will run at wrong times without this | Inspect Function App → Configuration |
| Whether the on-call paging mechanism is decided and configured | No paging means alerts may not reach responders outside business hours | IT-Department-Setup-Guide Section 13 lists this as an open decision |
| Whether per-site grant automation decision (manual vs. bootstrap) is resolved | Affects operational burden for every new project site | IT-Department-Setup-Guide Section 13 lists this as an open decision |
| Whether Azure Table Storage table names are confirmed by the development team | Mismatch between code and actual table names will cause silent failures | IT-Department-Setup-Guide Section 13 lists this as pending dev team confirmation |

---

## Validation checklist

- [x] All named file paths verified to exist in the repository
- [x] No speculative claims presented as repo facts
- [x] Every gap includes evidence source
- [x] Gaps clearly categorized as doc-only vs implementation-dependent
- [x] Earlier-phase dependencies assessed with satisfaction status
- [x] Non-gaps explicitly documented to prevent unnecessary Phase 13 work
- [x] Residual unknowns separated from confirmed gaps
- [x] Audit is usable as the evidence basis for Phase 13 prompts P13-02 through P13-10
