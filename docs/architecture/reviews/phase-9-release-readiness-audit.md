# Phase 9 — Repo-Truth Release Readiness Audit

**Date:** 2026-04-02
**Phase:** Phase 9 — Release Hardening, Pilot, and Cutover
**Scope:** Project Setup workflow spanning requester submission (Estimating), Accounting controller review, provisioning runtime behavior, Admin exception handling, and connected backend/SPFx/PWA surfaces.
**Prompt:** `Prompt-01_Phase-9-Repo-Truth-Release-Readiness-Audit.md`

---

## 1. Executive Summary

**The Project Setup workflow is repo-complete for all deterministic lifecycle paths.** The Wave 0 implementation covers the full submit-through-completion lifecycle with verified coverage across lifecycle (C1), explainability (C2), supportability (C3), and dead-wiring (C4) dimensions. Over 900 tests span the provisioning package, backend functions, and four frontend apps (Estimating, Accounting, Admin, PWA).

Gaps that remain are concentrated in two categories:

1. **Environment-gated validations** — SPFx deployment, auth bootstrap, SignalR real-time events, timer execution, Azure alert activation, and Key Vault secret resolution must be validated in a hosted staging environment.
2. **Tenant-admin prerequisites** — Sites.Selected API consent, per-site Graph grants, managed identity permissions, and app catalog deployment require external action before pilot entry.

No gap blocks further repo-side Phase 9 work. All blocking items affect staging and pilot execution, not repo completeness.

Slot-based rollback (Azure Functions deployment-slot swap) is a recommended deployment pattern per Microsoft guidance but is **not yet evidenced** in the target environment. The cutover prompt (P9-04) must handle both slot-based and artifact-based rollback paths.

Wave 1 deferrals (SF17 persistence, Teams webhook confirmation, email relay, 4 monitors, 3 probes, ErrorLogPage) are explicitly documented in `current-state-map.md` and are **not release blockers** for Wave 0.

---

## 2. Canonical Copy Check

| Item | Finding |
|------|---------|
| Package location | `docs/architecture/plans/MASTER/spfx/accounting/phase-9/` |
| Committed in workspace | Yes — 9 files (implementation plan, README, audit report, Prompts 01–06) |
| Duplicate copies found | None |
| Artifact status | Committed canonical package |

---

## 3. Scope Reviewed

### Current-state and release boundary
- `docs/architecture/blueprint/current-state-map.md`
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`

### Verification and support evidence
- `docs/reference/provisioning/verification-matrix.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`

### Configuration and external prerequisite posture
- `docs/reference/configuration/wave-0-config-registry.md`
- `docs/reference/configuration/sites-selected-validation.md`

### Current verification suites
- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/admin/src/test/alertPollingService.test.ts`

### Prior phase outputs
- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`
- `docs/architecture/reviews/project-setup-phase-7-final-readiness-report.md`
- `docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`
- `docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-closure-report.md`
- `docs/architecture/reviews/project-setup-phase-8-remediation-report.md`
- `docs/architecture/reviews/estimating-spfx-release-readiness-checklist-and-summary.md`

### Phase 9 meta-audit
- `docs/architecture/plans/MASTER/spfx/accounting/phase-9/Accounting_Phase9_Prompt_Audit_Report.md`

### Release governance
- `docs/architecture/release/PH7-final-verification-evidence.md`
- `docs/architecture/release/release-signoff-template.md`

---

## 4. Confirmed Repo Facts

### 4.1 Current-state and release boundary

**Source:** `current-state-map.md` (Tier 1 authority)

The Wave 0 closeout baseline was established 2026-03-15 with all six goal groups confirmed complete:

| Goal | Scope | Status |
|------|-------|--------|
| G1 | Contracts and configuration | Complete |
| G2 | Backend hardening and workflow data | Complete |
| G3 | Shared platform wiring and workflow experience | Complete |
| G4 | SPFx surfaces and workflow experience (including Accounting) | Complete |
| G5 | PWA requester surfaces | Complete |
| G6 | Admin support and observability | Complete |
| SF29 | My Work Feed | Complete |

**Source:** `RELEASE-SCOPE.md` (machine-checkable manifest)

| Aspect | Detail |
|--------|--------|
| In-scope route families | 8: projectRequests, provisioningSaga, timerFullSpec, signalr, acknowledgments, notifications, health, cleanupIdempotency |
| Excluded route families | 11: all domain CRUD routes (leads, projects, estimating, schedule, buyout, compliance, contracts, risk, scorecards, pmp, proxy) |
| Service container | `createProjectSetupServiceFactory()` — 9 eager services included, 10 domain CRUD services excluded at compile time |
| Regression tests | 24 handler-wiring tests (P9-G3-03) |
| Auth posture | All HTTP routes use `withAuth()` except health probe and timers |
| CORS | Tenant-specific origin only, credentials required |
| Startup config | 3 tiers: Core (blocking), SharePoint (warning), Provisioning (saga-time validation) |

### 4.2 Verification evidence

**Source:** `verification-matrix.md` (Wave 0 closeout, 2026-03-15)

| Dimension | Status | Coverage |
|-----------|--------|----------|
| C1 — Lifecycle paths | PASS | Submit → controller review → approve → ReadyToProvision → backend auto-start → completion; clarification path; failure and recovery; admin recovery |
| C2 — Explainability | PASS | 8 state labels, action maps, owner derivation, failure scenarios, coaching prompts, urgency indicators |
| C3 — Supportability | PASS | UI diagnosable, admin recovery actions, runbook coverage, observability queries, permission model, failure modes, integration rules |
| C4 — Dead wiring | PASS | All incomplete items (SF17, Teams, email, 4 monitors, 3 probes, ErrorLogPage) documented with Wave 1 disposition |

**Test suite counts:**

| Suite | Tests | Status |
|-------|-------|--------|
| `@hbc/provisioning` package (including Phase 8) | 355 | PASS (98.78% coverage) |
| `@hbc/spfx-accounting` app | 37 | PASS |
| `@hbc/spfx-estimating` app | ~40 | PASS |
| `@hbc/spfx-admin` app | 59 | PASS |
| `@hbc/pwa` parity | ~10 | PASS |
| `backend/functions` provisioning | ~200 | PASS |
| **Total** | **~900+** | **PASS** |

### 4.3 Configuration and permission posture

**Source:** `wave-0-config-registry.md`

- **Bucket A (infrastructure):** Governed by Platform/DevOps via Terraform, Key Vault, CI/CD. Includes `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_TABLE_ENDPOINT`, `APPLICATIONINSIGHTS_CONNECTION_STRING`, `HBC_ADAPTER_MODE`, `API_AUDIENCE`.
- **Bucket B (business):** Governed by Product Owner/Admin. Includes `OPEX_MANAGER_UPN`, `CONTROLLER_UPNS`, `ADMIN_UPNS`, `STRUCTURAL_OWNER_UPNS`, `DEPT_BACKGROUND_ACCESS_*`.
- **Startup validation:** `validate-config.ts` exports `validateProvisioningPrerequisites()` with fail-fast logic. **Not yet wired into startup path** — integration is G2.6, deferred past Wave 0.
- **Environment separation:** Local dev uses `.local.settings.json`; staging and production use Key Vault references.

**Source:** `sites-selected-validation.md`

| Permission path | Status | Scope |
|-----------------|--------|-------|
| **A — Sites.Selected** | Preferred | Per-site scoped access; requires admin consent + per-site grants |
| **A2 — Pilot bridge** | Acceptable for <=3 sites | Manual per-site grants; scale threshold = 4th project |
| **A1 — Automated bootstrap** | Future (G2/G6/G8) | Separate privileged identity; Step 0 bootstrap automation |
| **B — FullControl fallback** | Governed exception | Tenant-wide; requires ADR, 90-day max, re-assessment commitment |

Group 2 entry condition: Path A confirmed = GO; Path B activated with ADR = GO (constrained); Pending = BLOCKED.

### 4.4 Operational readiness

**Source:** `provisioning-runbook.md`

- Daily checks: verify 1:00 AM timer; check for stuck runs >30 min
- Recovery procedures: manual retry, archive, force-state override, escalation
- Failure modes: FM-01 through FM-10 all have documented recovery paths
- Escalation path: self-service → admin oversight → manual intervention
- Azure Table Storage: manual state inspection documented (ProvisioningStatus table)

**Source:** `provisioning-observability-runbook.md`

- 5 KQL query templates: timeline by correlationId, failed runs 7d, step durations, success rate trend, Step 5 deferral rate
- 2 alert rules: stuck provisioning >30 min (Severity 2), timer completion missing (Severity 1)
- Admin action verification: 6 permission-gated actions, alert polling, infrastructure probes
- Telemetry dependency: `APPLICATIONINSIGHTS_CONNECTION_STRING` must be active

### 4.5 Wave 1 deferrals (not release blockers)

Per `current-state-map.md` sections 7.2–7.3, the following are intentionally deferred:

| Item | Disposition |
|------|------------|
| SF17 persistence (admin alerts, approval authority, infrastructure probes) | In-memory only; Wave 1 scope |
| Teams webhook delivery | Fire-and-forget; no confirmation |
| Email relay | Console-logged; no SMTP |
| 4 deferred monitors (overdue, stale, permission anomaly, expiration) | Wave 1 scope |
| 3 deferred probes (search, notification, module-record-health) | Wave 1 scope |
| ErrorLogPage | HbcEmptyState placeholder |
| SharePoint list persistence for alerts/probes/approval rules | Wave 1 scope |
| Frontend Application Insights SDK | Backend-only in Wave 0 |
| Historical trend charts | Wave 1 scope |
| Bulk queue actions | Wave 1 scope |
| Coordinator/requester admin views | Wave 1 scope |
| Live SMTP email relay | Wave 1 scope |

---

## 5. Current Release Evidence Inventory

| Evidence Item | Source | Classification |
|---------------|--------|----------------|
| Workflow lifecycle: submit → controller review → approve → ReadyToProvision → backend auto-start → completion | Verification matrix C1 | **repo-proven** |
| Clarification path: requester responds in wizard; ownership transfers | Verification matrix C1 | **repo-proven** |
| Failure and recovery path: first failure notification, coordinator retry, escalation, compensation | Verification matrix C1 | **repo-proven** |
| Admin recovery path: failure inbox, detail modal, 6 admin-exclusive actions, alert monitoring | Verification matrix C1 | **repo-proven** |
| Explainability: 8 state labels, action maps, owner derivation, failure scenarios | Verification matrix C2 | **repo-proven** |
| Supportability: UI diagnosable, recovery actions, runbook coverage, observability queries | Verification matrix C3 | **repo-proven** |
| Dead wiring audit: all incomplete items documented with disposition | Verification matrix C4 | **repo-proven** |
| Project Setup host boundary: 8 in-scope, 11 excluded, compile-time enforcement | RELEASE-SCOPE.md | **repo-proven** |
| CORS: tenant-specific origin, credentials required | RELEASE-SCOPE.md | **repo-proven** |
| Auth: all HTTP routes use `withAuth()` except health and timers | RELEASE-SCOPE.md | **repo-proven** |
| Provisioning runbook: FM-01–FM-10 recovery paths, daily checks | provisioning-runbook.md | **repo-proven** |
| Observability runbook: KQL queries, alert rules, admin action verification | provisioning-observability-runbook.md | **repo-proven** |
| Config registry: two-bucket governance, environment separation matrix | wave-0-config-registry.md | **repo-proven** |
| Permission model documentation: Path A/B decision matrix, diagnosis tools | sites-selected-validation.md | **repo-proven** |
| SPFx package deployment to app catalog | — | **manual verification required** |
| Auth bootstrap in SharePoint hosted context | — | **manual verification required** |
| SignalR real-time event delivery in hosted environment | — | **manual verification required** |
| Timer trigger execution (1:00 AM EST) | — | **manual verification required** |
| Azure alert rule activation in target environment | — | **manual verification required** |
| Key Vault reference resolution for secrets | — | **manual verification required** |
| CORS validation against live tenant origin | — | **manual verification required** |
| Azure Functions staging slot availability | — | **not yet evidenced** |
| Startup config validation wired into boot path (G2.6) | wave-0-config-registry.md | **not yet evidenced** |
| Sites.Selected consent in Entra ID | sites-selected-validation.md | **externally blocked** |
| Per-site Graph grants operational | sites-selected-validation.md | **externally blocked** |
| Managed Identity permissions in target environment | — | **externally blocked** |
| App Catalog deployment path confirmed | — | **externally blocked** |
| SF17 persistence layer | current-state-map.md | **deferred / out of scope** |
| Teams webhook delivery confirmation | current-state-map.md | **deferred / out of scope** |
| Email relay (live SMTP) | current-state-map.md | **deferred / out of scope** |
| 4 deferred monitors | current-state-map.md | **deferred / out of scope** |
| 3 deferred probes | current-state-map.md | **deferred / out of scope** |
| ErrorLogPage implementation | current-state-map.md | **deferred / out of scope** |

---

## 6. Readiness Classification by Area

### 6.1 Repo Complete

The following are fully evidenced in the repo with passing tests and documentation:

- All 8 in-scope route families implemented with compile-time boundary enforcement
- All workflow state transitions: submit, controller review, clarify / hold / approve, ReadyToProvision, backend auto-start, status visibility, admin exception handling
- 7-step provisioning saga with compensation chain
- 10 failure modes (FM-01–FM-10) codified with recovery paths
- 7 integration rules codified and tested
- BIC (best-interest-of-child) ownership model verified for all 8 states
- Accounting controller review surfaces: queue page (9 tests) and detail page (16 tests) with tier-gated rendering
- Admin oversight surface: failures tab, 4 exclusive actions (retry, archive, acknowledge escalation, force-state override), permission gating (18 tests)
- Alert polling service: failure-based and stuck-run alerts with severity escalation (10 tests)
- Provisioning operations and observability runbooks
- Configuration registry with environment separation and two-bucket governance
- Permission model documentation with Path A/B decision matrix and staging validation test cases

### 6.2 Staging Ready (pending manual validation)

These items are repo-documented but require execution in a hosted staging environment:

| Item | Validation needed |
|------|-------------------|
| SPFx .sppkg upload and trust | Upload to app catalog, verify module resolution |
| API base URL resolution | Network inspection: no `undefined/api` in hosted bundle |
| Auth bootstrap | SharePoint context auth, identity resolution |
| SignalR negotiate and real-time updates | Real-time event delivery with Function App URL |
| Timer trigger (1:00 AM EST Step 5) | Observed execution in staging slot |
| Azure alert rule activation | Stuck >30 min and timer-missing alerts fire correctly |
| Key Vault reference resolution | All Bucket A secrets resolve at startup |
| CORS validation | Request from tenant origin succeeds with credentials |

### 6.3 Pilot Ready (pending external prerequisites + staging pass)

| Prerequisite | Owner | Status |
|--------------|-------|--------|
| Sites.Selected consent granted in Entra ID | IT/Security tenant admin | Externally blocked |
| Per-site grants operational (Option A2 for <=3 projects) | IT/Security tenant admin | Externally blocked |
| `SITES_SELECTED_GRANT_CONFIRMED=true` environment gate | DevOps | Awaiting prerequisite |
| Managed Identity token acquisition validated | Platform/DevOps | Externally blocked |
| Pilot audience identified and approved | Product Owner | Not yet evidenced |
| Business-controlled settings (Bucket B) populated with production UPNs | Product Owner | Not yet evidenced |

### 6.4 Production Ready (pending pilot success + remaining prerequisites)

| Prerequisite | Owner | Status |
|--------------|-------|--------|
| Rollback path validated in target environment (slot-based or artifact-based) | Platform/DevOps | Not yet evidenced |
| All Bucket A infrastructure settings confirmed in production Function App | Platform/DevOps | Not yet evidenced |
| All Bucket B business settings confirmed | Product Owner | Not yet evidenced |
| Production monitoring active (alert rules, KQL queries validated) | Platform/DevOps | Not yet evidenced |
| Option A1 automated bootstrap assessment (triggered at 4th project) | Engineering | Deferred — future G2/G6/G8 |

---

## 7. External / Tenant / Operational Dependencies

| # | Dependency | Owner | Evidence Required | Impacted Stage | Blocking Severity |
|---|-----------|-------|-------------------|----------------|-------------------|
| 1 | Sites.Selected API consent in Entra ID | IT/Security tenant admin | Consent confirmation (screenshot or API) | Pilot | **Blocking** |
| 2 | Per-site Graph grant workflow operational | IT/Security tenant admin | Successful test grant on staging site | Pilot | **Blocking** |
| 3 | Managed Identity permissions (Graph, Table Storage) | Platform/DevOps | Token acquisition test in target environment | Staging | **Blocking** |
| 4 | Key Vault provisioned with required secrets | Platform/DevOps | Key Vault reference resolution test | Staging | **Blocking** |
| 5 | App Catalog deployment path confirmed | SharePoint admin | .sppkg uploaded and trusted in target catalog | Staging | **Blocking** |
| 6 | SignalR Service provisioned and connected | Platform/DevOps | Real-time event delivery test | Staging | **Blocking** |
| 7 | Application Insights resource provisioned | Platform/DevOps | Telemetry ingestion test | Staging | **High** |
| 8 | Azure Functions staging slot (if slot-based rollback desired) | Platform/DevOps | Slot existence and swap test | Cutover | **Medium** (artifact rollback is alternative) |
| 9 | Pilot audience and schedule approved | Product Owner | Written approval | Pilot | **High** |
| 10 | Business-controlled UPNs (Bucket B) populated | Product Owner | Settings review confirmation | Pilot | **High** |
| 11 | `FUNCTION_APP_URL` configured in CI/build | DevOps | SPFx bundle resolves API base URL in staging | Staging | **Blocking** |

---

## 8. Blocking Items

These items block staging or pilot execution. None block further repo-side Phase 9 work.

1. **Tenant API approvals not yet evidenced** — Sites.Selected consent and Group.ReadWrite.All application permissions require IT/Security tenant admin action before provisioning saga can execute against real SharePoint sites.
2. **Target Azure environment not yet validated** — Key Vault secret resolution, Managed Identity token acquisition, SignalR Service connectivity, Application Insights telemetry ingestion, and `FUNCTION_APP_URL` configuration must be confirmed in the target environment.
3. **App Catalog deployment path not confirmed** — Whether deployment uses tenant app catalog or site-collection app catalog has not been evidenced.
4. **Staging slot existence not evidenced** — Slot-based rollback is a recommended Azure Functions deployment pattern but the target environment's slot configuration is unknown. This affects rollback strategy selection only.

---

## 9. Recommended Order for Remaining Phase 9 Work

Each subsequent prompt should consume this audit's classifications and dependency register rather than re-auditing from scratch.

1. **P9-02 — Staging Deployment and Pre-Cutover Validation**
   Define an executable staging checklist anchored to the dependency register (section 7). Reconcile against the existing estimating SPFx release-readiness checklist for pattern reuse.

2. **P9-03 — Pilot Readiness and Controlled User Enablement**
   Define a bounded pilot (<=3 projects) using Option A2 manual per-site grant model. Establish measurable success/failure thresholds tied to actual workflow metrics.

3. **P9-04 — Production Cutover and Rollback Preparation**
   Select rollback strategy based on staging evidence: slot-based swap if available, artifact-based redeployment as fallback. Handle both paths explicitly.

4. **P9-05 — Post-Cutover Verification and Hypercare Readiness**
   Align to existing `provisioning-runbook.md` and `provisioning-observability-runbook.md` rather than creating parallel support docs. Define hypercare duration and escalation model.

5. **P9-06 — Final Release Closure and Signoff Report**
   Consolidate all evidence into a go / no-go / constrained-go recommendation with explicit conditions for each classification.

---

## 10. Explicit Open Risks

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | Startup config validation is not wired into the boot path (G2.6) — a misconfigured environment will not fail fast | Medium | Validate configuration manually during staging; track G2.6 integration for post-Wave-0 |
| 2 | Slot-based rollback is recommended but may not be available in the target environment | Medium | P9-04 must define both slot-based and artifact-based rollback paths; staging evidence determines selection |
| 3 | Option A2 (manual per-site grants) does not scale beyond 3 projects | Low (pilot) | Pilot must track toward Option A1 automated bootstrap assessment at 4th project threshold |
| 4 | Some documentation wording is stronger than evidence supports (e.g., "ready for Wave 1 expansion" in verification matrix reads as deployment-ready) | Low | This audit establishes that "repo-complete" does not equal "production-ready"; subsequent prompts must preserve the distinction |
| 5 | SF17 persistence deferral means admin alerting, approval authority, and probe data do not survive app restart | Low (Wave 0) | Documented as Wave 1 scope; not a Wave 0 release blocker; pilot operators must understand the limitation |

---

## 11. Evidence Appendix

### Phase 8 closure evidence

Per `project-setup-phase-8-reliability-testing-and-operational-readiness-closure-report.md`:

| Metric | Value |
|--------|-------|
| Phase 8 new contract tests | 83 (4 test files) |
| Provisioning package total | 355 tests (98.78% statement coverage) |
| Accounting app tests | 37 passing |
| Runbook drift corrections needed | 0 |

### Verification matrix evidence

Per `verification-matrix.md`:

| Dimension | Paths/Requirements | Status |
|-----------|-------------------|--------|
| C1 — Lifecycle | 5 paths (happy, clarification, failure/recovery, admin recovery, timer) | PASS |
| C2 — Explainability | 8 requirements | PASS |
| C3 — Supportability | 7 vectors | PASS |
| C4 — Dead wiring | All incomplete items documented | PASS |

### Release-scope manifest evidence

Per `RELEASE-SCOPE.md`:

| Metric | Value |
|--------|-------|
| In-scope route families | 8 |
| Excluded route families | 11 |
| Handler-wiring regression tests | 24 |
| Service container boundary | Compile-time enforced via `IProjectSetupServiceContainer` |

### Accounting app test coverage

| Test file | Tests | Key coverage |
|-----------|-------|-------------|
| ProjectReviewQueuePage.test.tsx | 9 | Table rendering, tab filtering, tier-gated UI, navigation |
| ProjectReviewDetailPage.test.tsx | 16 | Approve/clarify/hold flow, state-based buttons, project number validation, admin escalation, tier gating |
| ProvisioningOversightPage.test.tsx | 18 | Retry/archive/escalate/force-state, permission gating, retry ceiling, coaching callout, deep-linking |
| alertPollingService.test.ts | 10 | Alert generation, severity escalation, polling lifecycle, API integration |
| **Total** | **53** | |

---

## 12. Exact Files Inspected

### Current-state and release boundary
- `docs/architecture/blueprint/current-state-map.md`
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`

### Verification and support evidence
- `docs/reference/provisioning/verification-matrix.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`

### Configuration and prerequisite posture
- `docs/reference/configuration/wave-0-config-registry.md`
- `docs/reference/configuration/sites-selected-validation.md`

### Test suites
- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/admin/src/test/alertPollingService.test.ts`

### Prior phase reviews
- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`
- `docs/architecture/reviews/project-setup-phase-7-final-readiness-report.md`
- `docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`
- `docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-closure-report.md`
- `docs/architecture/reviews/project-setup-phase-8-remediation-report.md`
- `docs/architecture/reviews/estimating-spfx-release-readiness-checklist-and-summary.md`

### Phase 9 package
- `docs/architecture/plans/MASTER/spfx/accounting/phase-9/Accounting_Phase9_Prompt_Audit_Report.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-9/Phase-9_Release-Hardening-Pilot-and-Cutover_Implementation-Plan.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-9/README_Phase-9-Release-Hardening-Pilot-and-Cutover.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-9/Prompt-01_Phase-9-Repo-Truth-Release-Readiness-Audit.md`

### Release governance
- `docs/architecture/release/PH7-final-verification-evidence.md`
- `docs/architecture/release/release-signoff-template.md`

### Package manifests
- `apps/accounting/package.json`
- `apps/admin/package.json`
- `apps/accounting/config/package-solution.json`
