# Project Setup / Estimating SPFx Phase 1-5 Implementation and Gap Report

## 1. Executive Summary

> **Last updated:** 2026-03-31 (P6-01 persistence contract, validation, and clarification storage closure)

This report was originally authored as a gap analysis finding that Phases 1-5 were not fully completed as documented. Since then, Phase 1 backend scope has been fully remediated (Prompts 07-10, 2026-03-31). This executive summary reflects the post-remediation state.

### What is confirmed complete

- **Phase 1 scope-control findings are closed in repo-owned code and tests.** The frontend requester surface is isolated to Project Setup routes with regression guards (`apps/estimating/src/test/phase1ScopeGuards.test.ts`). The backend now has a dedicated Project Setup domain host (`backend/functions/src/hosts/project-setup/`) with scoped composition root, service factory, tenant-specific CORS, domain-scoped config validation, and 63 boundary regression tests. All 10 acceptance criteria (AC-1 through AC-10) from `Phase-1_Backend-Boundary-Freeze.md` are satisfied. Architecture decision recorded in ADR-0124.
- **Phase 2 code-level contract findings are closed in repo-owned code and tests.** The canonical request model, field contract, mapper, repository path, backward-compat handling, and mock-vs-real test truthfulness now align across the repo. What the repo does not prove on its own is the current live SharePoint list state; there is no checked-in schema export or live integration evidence for the external list.
- **Phase 3 auth findings are closed for Project Setup.** Auth architecture frozen (P3-07), production token/audience path verified (P3-08), cross-surface auth converged to factory-based providers (P3-09), proxy explicitly excluded from PS release scope (P3-10). Deprecated `resolveSessionToken()` removed from all retained surfaces. RBAC convergence remains a future follow-on but is not a Phase 3 blocker.
- **Phase 4 infrastructure architecture is frozen (P4-07).** Dedicated Project Setup host with domain-scoped config validation, tenant-specific CORS, pure managed identity, conditional SignalR, and diagnostic health output. Canonical vs transitional surfaces explicitly classified. Observability artifacts exist in repo but are not operationalized. Environment-gated deployment proof remains external.

### Remaining blockers

- ~~**Required-field enforcement is still intentionally disabled.**~~ **CLOSED (P6-01, 2026-03-31).** `PROJECT_SETUP_REQUIRED_FIELDS_ENABLED` set to `true`. Backend validation expanded to match the wizard's 11 required fields plus format checks. 43-field persistence contract confirmed aligned.
- **Several release-readiness items remain environment-gated** rather than proven against a live deployment (8 deployment prerequisites + D0 SP column migration, staging smoke execution, leadership/IT/support signoff).
- **External SharePoint list contract validation** remains outside repo evidence.

### Overall status

**Phases 1-4: closed or substantially closed. Phase 5: substantially closed — code-level work complete, environment-gated and operational items remain.** Phases 1 and 3 are fully closed. Phase 2 is substantially closed (repo-owned code path complete, external list proof external). Phase 4 is substantially closed (architecture frozen, operationalization deferred). Phase 5 is substantially closed in repo-owned terms: release scope frozen (P5-07), frontend baseline green (P5-08), smoke/deployment categorized (P5-09), signoff aligned to evidence (P5-10), docs reconciled (P5-11). Remaining release decisions depend on environment-level deployment prerequisites and operational signoff the repo cannot provide by itself.

## 2. Audit Scope and Method

### Phase docs reviewed

Phase intent and claimed completion were derived from the phase package READMEs, action plans, handoffs, and phase-specific supporting docs under:

- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-1/**`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-2/**`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-3/**`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-4/**`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/**`

The most important plan-intent files were:

- `phase-1/Phase-1_Scope-Control_Action-Plan.md`
- `phase-1/Phase-1_Handoff.md`
- `phase-2/Phase-2_Data-Contract_Action-Plan.md`
- `phase-2/Phase-2_Handoff.md`
- `phase-2/Phase-2_Data-Contract-Gaps.md`
- `phase-3/Phase-3_Auth_Action-Plan.md`
- `phase-3/Phase-3_Handoff.md`
- `phase-4/Phase-4_Infrastructure_Action-Plan.md`
- `phase-4/Phase-4_Handoff.md`
- `phase-4/Phase-4_Operational-Readiness-and-Handoff.md`
- `phase-5/Phase-5_Release-Hardening_Action-Plan.md`
- `phase-5/Phase-5_Handoff.md`
- `phase-5/Phase-5_Release-Gates-and-Diagnostics.md`
- `phase-5/Phase-5_Deployment-Runbook.md`
- `phase-5/Phase-5_Production-Readiness-Signoff.md`

### Repo areas audited

Repo truth was taken from:

- Requester surface: `apps/estimating/src/**`, `apps/estimating/config/**`, `apps/estimating/package.json`
- Feature-local wizard/config boundary: `packages/features/estimating/src/project-setup/**`
- Shared lifecycle package: `packages/provisioning/src/**`, `packages/provisioning/README.md`
- Backend runtime and infrastructure: `backend/functions/src/**`, `backend/functions/host.json`, `backend/functions/README.md`, `backend/functions/observability/**`
- Related controller/admin surfaces where they materially support cross-phase readiness claims: `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`, `apps/admin/src/pages/ProvisioningOversightPage.tsx`
- Current-state authority: `docs/architecture/blueprint/current-state-map.md`

### Repo truth prioritization

This report treats live code, tests, config, manifests, and current-state documentation as authoritative over phase-plan claims.

- Historical and scoped phase docs were used to establish intended objectives, deliverables, acceptance criteria, and claimed completion.
- Live repo state was then used to confirm, downgrade, or reject those claims.
- Where the handoff docs claimed `COMPLETE` but the live repo still showed open technical gaps, the report follows repo truth.

### Verification performed

The following targeted verification was run during the audit:

- `pnpm --filter @hbc/functions test -- src/test/auth-release-readiness.test.ts src/test/release-gates.test.ts src/test/request-lifecycle.integration.test.ts src/test/unsupported-scope-guard.test.ts`
  - Result: pass in current repo state; backend release/auth/scope guard evidence is real.
- `pnpm --filter @hbc/spfx-project-setup test -- src/test/phase1ScopeGuards.test.ts src/test/ProjectSetupUiReviewMode.test.tsx`
  - Result: the direct Phase 1 scope guards passed, but the package test invocation also surfaced broader app-package failures in `NewRequestPage.test.tsx`, `RequestDetailPage.test.tsx`, and `RequestDetailPage.coordinator.test.tsx`. That is material repo-truth evidence against a blanket Phase 5 “release-hardened” claim.

## 3. Phase-by-Phase Implementation Summary

### Phase 1

**Intended objective**

Constrain the Estimating SPFx application and backend to Project Setup scope only, freeze the allowed contract surface, and add regression guards to prevent removed scope from returning. Plan intent came from `phase-1/Phase-1_Scope-Control_Action-Plan.md` and `phase-1/Phase-1_Handoff.md`.

#### Original Audit Findings Status Ledger

- **Finding:** Frontend scope-control finding
  **Original audit position:** The requester route tree and visible shell surface were already narrowly scoped to Project Setup, and the audit treated frontend scope control as largely real even while backend scope remained broader.
  **Current repo-truth status:** **Closed**
  **Why this status applies:** The requester route tree remains Project Setup-only, the shell remains simplified for the requester flow, and scope guards directly protect route, client-surface, and import-boundary expectations.
  **Repo-truth evidence:** `apps/estimating/src/router/routes.ts`; `apps/estimating/src/router/root-route.tsx`; `apps/estimating/src/test/phase1ScopeGuards.test.ts`
  **Notes / remaining caveats:** No code-level frontend scope residual remains in repo truth.

- **Finding:** Backend code-level scope-isolation finding
  **Original audit position:** The backend did not originally satisfy a truthful Project Setup-only boundary because the monolithic host still registered many unrelated route families and a broader service container than the requester surface required.
  **Current repo-truth status:** **Closed**
  **Why this status applies:** Repo truth now contains a dedicated Project Setup composition root, a scoped Project Setup host service factory, domain-scoped startup validation, tenant-specific CORS, and machine-checkable boundary tests covering the in-scope/excluded route families.
  **Repo-truth evidence:** `backend/functions/src/hosts/project-setup/index.ts`; `backend/functions/src/hosts/project-setup/service-factory.ts`; `backend/functions/src/hosts/project-setup/host.json`; `backend/functions/src/test/project-setup-host-boundary.test.ts`; `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`
  **Notes / remaining caveats:** This closure is code/test-level. Live deployment-target proof is a separate finding.

- **Finding:** Broad-host / broad-service-container as the authoritative Project Setup backend boundary
  **Original audit position:** The original audit treated the monolithic Azure Functions host and broad shared service container as the actual backend boundary, which made Phase 1 closure unsupported.
  **Current repo-truth status:** **Superseded by Repo Truth**
  **Why this status applies:** Repo truth no longer supports a single-host interpretation. The monolithic host still exists, but it is no longer the only implementation posture; the dedicated Project Setup host supersedes it as the authoritative Phase 1 boundary artifact.
  **Repo-truth evidence:** `backend/functions/src/index.ts`; `backend/functions/src/services/service-factory.ts`; `backend/functions/src/hosts/project-setup/index.ts`; `backend/functions/src/hosts/project-setup/service-factory.ts`; `docs/architecture/adr/ADR-0124-project-setup-backend-host-boundary.md`
  **Notes / remaining caveats:** The monolithic host remains preserved during transition, so this finding is superseded rather than deleted from history.

- **Finding:** Deployment-surface / live host-boundary truth
  **Original audit position:** The original audit could not honestly claim that the deployed backend surface was Project Setup-only, because repo truth at the time reflected a broader shared host.
  **Current repo-truth status:** **External / Not Repo-Evidenced**
  **Why this status applies:** Repo truth proves the dedicated host exists, but it does not prove which host artifact is actually deployed, rehearsed, or released in a live environment.
  **Repo-truth evidence:** `backend/functions/src/hosts/project-setup/index.ts`; `backend/functions/src/index.ts`; `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-1/Phase-1_Backend-Boundary-Freeze.md`
  **Notes / remaining caveats:** This is now an environment/deployment-proof question, not a missing code implementation question.

- **Finding:** Acceptance-proof / release-scope regression-guard finding
  **Original audit position:** The original audit required machine-checkable proof that the retained Project Setup boundary and release scope could not silently drift back to the broad monolithic posture.
  **Current repo-truth status:** **Closed**
  **Why this status applies:** The repo now contains a release-scope manifest and a dedicated host-boundary regression suite that validates AC-1 through AC-10 and fails if the boundary or manifest drifts.
  **Repo-truth evidence:** `backend/functions/src/test/project-setup-host-boundary.test.ts`; `backend/functions/src/test/release-gates.test.ts`; `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`
  **Notes / remaining caveats:** These guards prove the repo-owned boundary artifact; they do not prove live deployment cutover.

**Current repo-truth summary**

- The original frontend scope-control finding is closed.
- The original backend code-level scope-isolation finding is closed.
- The original broad-host / service-container finding is superseded by later repo truth because the dedicated Project Setup host now exists and is guarded.
- The only Phase 1 residual that is not repo-evidenced is live deployment-target proof for that dedicated host.

The remediation notes below are retained as historical evidence from the 2026-03-31 Phase 1 repair sequence. The status ledger above is the authoritative current-status summary for the original Phase 1 audit findings.

### Phase 1 Remediation Progress (Historical Prompt-07 Baseline, 2026-03-31)

**Repo-truth review performed:**

- Confirmed `backend/functions/src/index.ts` registers 19 route families (8 Project Setup, 10 domain CRUD, 1 stub proxy).
- Confirmed `backend/functions/src/services/service-factory.ts` carries 9 eager + 10 lazy services; only the 9 eager services are needed for Project Setup.
- Confirmed no existing per-domain host convention or multi-host ADR existed prior to this work.
- Confirmed `host.json` uses wildcard CORS (`*.sharepoint.com`) rather than tenant-specific.

**Boundary decision made:**

- ADR-0124 accepted: per-domain Function App hosts backed by shared monorepo libraries.
- Project Setup is the first domain host. Routes, services, config, CORS, and deployment are host-specific. Middleware, adapters, models, and utils remain shared.

**Implementation path selected:**

- Additive composition root (not destructive refactor of the monolithic host).
- Thin Project Setup `index.ts` + scoped service factory + domain-specific `host.json`.
- Legacy monolithic host preserved until domain-by-domain decomposition is complete.

**What remained open at this Prompt-07 planning stage:**

- Prompt-08: implement the Project Setup composition root, scoped service factory, and domain-specific `host.json`.
- Prompt-09: domain-specific config validation, auth, CORS, and identity scoping.
- Prompt-10: regression guards and release scope proof.
- Prompt-11: documentation reconciliation and audit closure.

**Closure target for Phase 1 backend scope:**

Phase 1 backend scope can be marked closed when AC-1 through AC-10 from the boundary freeze plan (`docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-1/Phase-1_Backend-Boundary-Freeze.md`) are satisfied in repo truth.

**Evidence:**

- `docs/architecture/adr/ADR-0124-project-setup-backend-host-boundary.md`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-1/Phase-1_Backend-Boundary-Freeze.md`

### Phase 1 Host Implementation (2026-03-31, Prompt-08)

**Host/composition-root change implemented:**

- Created `backend/functions/src/hosts/project-setup/index.ts` — thin composition root importing only 8 in-scope route families (projectRequests, provisioningSaga, timerFullSpec, signalr, acknowledgments, notifications, health, cleanupIdempotency).
- Created `backend/functions/src/hosts/project-setup/service-factory.ts` — scoped container with 9 eager Project Setup services, no domain CRUD getters.
- Created `backend/functions/src/hosts/project-setup/host.json` — tenant-specific CORS (`https://hedrickbrotherscom.sharepoint.com` only), SignalR binding, 10-minute timeout.

**Routes included:**

projectRequests (4 HTTP), provisioningSaga (10 HTTP), timerFullSpec (1 timer), signalr (1 HTTP), acknowledgments (2 HTTP), notifications (7 HTTP + 1 timer + queue), health (1 HTTP), cleanupIdempotency (1 timer).

**Routes excluded:**

leads, projects, estimating, schedule, buyout, compliance, contracts, risk, scorecards, pmp, proxy.

**Service/container changes:**

- `IProjectSetupServiceContainer` interface exposes only: sharePoint, tableStorage, signalR, managedIdentity, projectRequests, acknowledgments, graph, notifications, idempotency.
- No lazy domain CRUD service getters. No domain service type imports.
- All shared middleware, adapters, and utils imported from centralized paths — no duplication.

**Tests added and results:**

- `backend/functions/src/test/project-setup-host-boundary.test.ts` — 37 tests proving AC-1 (8 in-scope imports, exactly 8 count), AC-2 (no domain CRUD service types, no lazy getters), AC-3 (11 out-of-scope routes excluded), AC-5 (tenant-specific CORS, no wildcards, credentials required), AC-7 (shared imports from services/, utils/, functions/ paths).
- Full suite: 597 passed, 3 skipped, 0 failed. Zero regressions (AC-10).
- check-types: clean. lint: 0 errors. build: clean.

**Closure statement:**

Backend scope freeze acceptance criteria AC-1, AC-2, AC-3, AC-5, AC-7, AC-8, AC-9, and AC-10 are now satisfied. AC-4 (positive route registration proof) is covered by the AC-1 tests that verify all 8 families are imported. AC-6 (config validation scoping) is deferred to Prompt-09. The backend boundary is **substantially closed** with one named residual: domain-specific config validation scoping (Prompt-09).

**Evidence:**

- `backend/functions/src/hosts/project-setup/index.ts`
- `backend/functions/src/hosts/project-setup/service-factory.ts`
- `backend/functions/src/hosts/project-setup/host.json`
- `backend/functions/src/test/project-setup-host-boundary.test.ts`

### Phase 1 Config/Auth/CORS/Identity Scoping (2026-03-31, Prompt-09)

**Config validation scoping (AC-6):**

- Added `validateProjectSetupStartupConfig()` to `backend/functions/src/utils/validate-config.ts` — validates only core tier at startup (auth, table storage, adapter mode). SharePoint config validated as warning, not blocking. Provisioning prerequisites are NOT validated at startup — they are validated at saga execution time.
- Updated `backend/functions/src/hosts/project-setup/service-factory.ts` to call `validateProjectSetupStartupConfig()` instead of `validateCoreConfig()`.

**Startup requirements now in scope:**

- Core tier: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_TABLE_ENDPOINT, APPLICATIONINSIGHTS_CONNECTION_STRING, HBC_ADAPTER_MODE, API_AUDIENCE
- SharePoint tier (warning, not blocking): SHAREPOINT_TENANT_URL, SHAREPOINT_PROJECTS_SITE_URL
- Role config (degraded-mode warnings): CONTROLLER_UPNS, ADMIN_UPNS

**Startup requirements removed from scope:**

- Provisioning prerequisites (GRAPH_GROUP_PERMISSION_CONFIRMED, SHAREPOINT_HUB_SITE_ID, SHAREPOINT_APP_CATALOG_URL, HB_INTEL_SPFX_APP_ID, OPEX_MANAGER_UPN) — validated at saga execution time only
- Email delivery config (EMAIL_DELIVERY_API_KEY, EMAIL_FROM_ADDRESS) — stub, not consumed
- Domain CRUD config — not part of this host
- Department-specific MI grants (DEPT_BACKGROUND_ACCESS_*) — provisioning-only

**Auth posture:**

- Uses shared `withAuth()` middleware from `backend/functions/src/middleware/auth.ts` — no custom auth logic in the PS host
- API audience validated via JWT `aud` claim against `API_AUDIENCE` env var
- Auth exceptions are health (unauthenticated by design) and timer triggers (non-HTTP)
- `ui-review` mode compatibility preserved via `ProjectSetupBackendContext.tsx` in the frontend

**CORS posture:**

- Tenant-specific: `https://hedrickbrotherscom.sharepoint.com` only (no wildcards)
- `supportCredentials: true` (required for SPFx token passing)
- Configured in `backend/functions/src/hosts/project-setup/host.json`

**Managed identity / downstream grants:**

- SharePoint: read/write to Projects list, site provisioning (via DefaultAzureCredential)
- Graph API: group creation, membership management (via DefaultAzureCredential)
- Table Storage: provisioning status, idempotency records (via DefaultAzureCredential)
- SignalR: real-time push for provisioning progress (via connection string)
- NOT needed: domain CRUD SharePoint lists, department background access grants

**Tests added:**

- 8 new tests in `project-setup-host-boundary.test.ts` covering AC-6: domain-scoped config validation, no provisioning prerequisites at startup, explicit auth posture, managed identity scope.
- Full suite: 605 passed, 3 skipped, 0 failed. check-types clean. build clean.

**Closure statement:**

All 10 acceptance criteria (AC-1 through AC-10) from the boundary freeze plan are now satisfied. Phase 1 backend scope freeze is **closed**. The operational boundary is truthful and self-contained.

**Evidence:**

- Domain-scoped config validation: `backend/functions/src/utils/validate-config.ts` (`validateProjectSetupStartupConfig`)
- Scoped service factory: `backend/functions/src/hosts/project-setup/service-factory.ts`
- CORS/runtime config: `backend/functions/src/hosts/project-setup/host.json`
- Tests: `backend/functions/src/test/project-setup-host-boundary.test.ts` (45 tests)

### Phase 1 Regression Guards and Release-Scope Proof (2026-03-31, Prompt-10)

**Regression guards added/updated:**

- Added 18 new tests to `project-setup-host-boundary.test.ts` under "P1-10 Regression guards and release-scope proof":
  - **Scope drift prevention** (5 tests): no dynamic imports, no require(), no delegation to monolithic factory, own singleton, exactly 1 CORS origin
  - **Config expansion prevention** (4 tests): no EMAIL config, no NOTIFICATION_API_BASE_URL, no SHAREPOINT_HUB_SITE_ID, no SHAREPOINT_APP_CATALOG_URL at startup
  - **Release-scope proof: runtime config** (3 tests): SignalR extension configured, function timeout matches monolithic host, api route prefix
  - **Release-scope proof: architecture docs** (4 tests): RELEASE-SCOPE.md exists and lists all 8 in-scope and 11 excluded families, ADR-0124 exists, boundary freeze plan exists
  - **Monolithic host unchanged** (1 test): monolithic index.ts still registers all 19 route families
- Added 1 new release gate to `release-gates.test.ts`: validates `validateProjectSetupStartupConfig` is exported (P1-09 Gate 4 extension)

**Proof artifacts:**

- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md` — machine-checkable release scope manifest documenting in-scope/excluded route families, service container scope, startup config tiers, CORS posture, and auth posture. Every claim is validated by the test suite.

**Tests run and results:**

- Full suite: 624 passed, 3 skipped, 0 failed (up from 605 in Prompt-09)
- check-types: clean
- build: clean
- lint: 0 errors (69 pre-existing warnings)

**Phase 1 closure assessment:**

Phase 1 backend scope remediation is **closed**. All 10 acceptance criteria (AC-1 through AC-10) are satisfied with machine-checkable evidence. The Project Setup host has:
- a dedicated composition root importing exactly 8 route families (63 tests prove this)
- a scoped service factory with 9 eager services and no domain CRUD (10 tests prove this)
- tenant-specific CORS with no wildcards (3 tests prove this)
- domain-scoped config validation (4 tests prove this)
- explicit auth, managed identity, and operational posture (5 tests prove this)
- a machine-checkable release-scope manifest (4 tests validate the manifest)
- regression guards preventing scope drift and config expansion (9 tests)
- the monolithic host is unchanged (1 test proves this)

No technical residuals remain for Phase 1 backend scope. The frontend scope control (route isolation, scope guards) was already confirmed as real in the original audit. Phase 1 is honestly closed.

**Evidence:**

- Regression guard tests: `backend/functions/src/test/project-setup-host-boundary.test.ts` (63 tests)
- Release gate extension: `backend/functions/src/test/release-gates.test.ts` (13 tests)
- Release-scope manifest: `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`

### Phase 2

**Intended objective**

Establish a canonical Project Setup data contract, centralize SharePoint field mapping and serialization, refactor read/write paths onto that contract, and protect the contract with tests and runtime validation. Plan intent came from `phase-2/Phase-2_Data-Contract_Action-Plan.md`.

#### Original Audit Findings Status Ledger

- **Finding:** Canonical request-contract completeness in repo-owned code
  **Original audit position:** The original audit found that the canonical `IProjectSetupRequest` shape was broader than the real persisted Project Setup contract, so the code-level contract boundary was incomplete.
  **Current repo-truth status:** **Closed**
  **Why this status applies:** The canonical request model and the repo-owned SharePoint contract now align around a 43-field field map, including the formerly missing location, team-role, classification, and clarification-lifecycle fields.
  **Repo-truth evidence:** `packages/models/src/provisioning/IProvisioning.ts`; `backend/functions/src/services/projects-list-contract.ts`
  **Notes / remaining caveats:** This closure applies to repo-owned code and tests. It does not itself prove the external live SharePoint list currently matches the same shape.

- **Finding:** Mapper / repository production-path completeness in repo-owned code
  **Original audit position:** The original audit found that the real mapper and repository path could not persist the full live request shape, so production-mode writes could silently lose user-entered fields.
  **Current repo-truth status:** **Closed**
  **Why this status applies:** The mapper now serializes and deserializes the expanded field set, the repository selects the full mapped field list, and the real adapter read/write path uses the centralized mapper end to end.
  **Repo-truth evidence:** `backend/functions/src/services/projects-list-mapper.ts`; `backend/functions/src/services/project-requests-repository.ts`; `backend/functions/src/services/__tests__/projects-list-mapper.test.ts`
  **Notes / remaining caveats:** This is a repo-owned code-path closure, not a deployed-environment proof.

- **Finding:** Required persisted-field coverage in repo-owned code and tests
  **Original audit position:** The original audit found that required persisted fields collected by the live wizard were not fully represented in the production persistence contract or its tests.
  **Current repo-truth status:** **Closed**
  **Why this status applies:** The field contract now covers the canonical persisted field set and the mapper tests explicitly cover the expanded fields, including the formerly missing groups.
  **Repo-truth evidence:** `backend/functions/src/services/projects-list-contract.ts`; `backend/functions/src/services/__tests__/projects-list-mapper.test.ts`; `backend/functions/src/services/__tests__/sp-field-mapping.test.ts`
  **Notes / remaining caveats:** The remaining Phase 2 caveat is not missing field coverage in repo-owned code; it is the lack of repo-owned proof for the live external list.

- **Finding:** Production data-loss finding in the repo-owned code path
  **Original audit position:** The original audit treated silent data loss on the real persistence path as a material blocker because the production adapter dropped fields the wizard already collected.
  **Current repo-truth status:** **Substantially Closed**
  **Why this status applies:** Repo-owned code and tests now support closure for the original code-path loss. The bounded residual is external: the repo does not contain a checked-in schema export or live integration run proving the external SharePoint list currently has the required columns.
  **Repo-truth evidence:** `backend/functions/src/services/projects-list-mapper.ts`; `backend/functions/src/services/project-requests-repository.ts`; `backend/functions/src/services/__tests__/projects-list-mapper.test.ts`; `backend/functions/src/services/__tests__/sp-field-mapping.test.ts`
  **Notes / remaining caveats:** `clarificationItems` also remains bounded by an SP Text length limit, which is a scaling caveat rather than proof of current field loss in repo-owned code.

- **Finding:** Real SharePoint persistence completeness in the live external list
  **Original audit position:** The original audit could not honestly claim end-to-end persistence completeness without proof that the real SharePoint `Projects` list exposed the columns required by the canonical request model.
  **Current repo-truth status:** **External / Not Repo-Evidenced**
  **Why this status applies:** Phase 2 docs refer to an exported SharePoint schema and code comments refer to a `2026-03-31 schema export`, but the repo does not currently contain a checked-in schema export artifact or live integration evidence for the external list itself.
  **Repo-truth evidence:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-2/Prompt-07_Phase-2-Canonical-Contract-and-Schema-Reconciliation.md`; `backend/functions/src/services/projects-list-contract.ts`
  **Notes / remaining caveats:** This is the one Phase 2 finding whose closure depends on external proof rather than repo-owned code or tests.

- **Finding:** Backward-compatibility / migration handling concern
  **Original audit position:** The original audit treated legacy-row handling and migration posture as open because newer fields could break old rows or require backfill/migration decisions.
  **Current repo-truth status:** **Closed**
  **Why this status applies:** The mapper uses safe defaults for legacy rows, retains legacy `field_17` / `field_18` / `field_19` compatibility, and the Phase 2 tests explicitly cover missing-column and old-row behavior without requiring backfill.
  **Repo-truth evidence:** `backend/functions/src/services/projects-list-contract.ts`; `backend/functions/src/services/projects-list-mapper.ts`; `backend/functions/src/services/__tests__/projects-list-mapper.test.ts`
  **Notes / remaining caveats:** The repo-owned compatibility strategy is closed even though the live external list is not independently proven by a checked-in export artifact.

- **Finding:** Mock-vs-real test-truthfulness finding
  **Original audit position:** The original audit found that a mock-repository round-trip test overstated production persistence completeness because it preserved fields in memory rather than through the real adapter path.
  **Current repo-truth status:** **Closed**
  **Why this status applies:** The mock test is now explicitly labeled as mock-only, while real contract proof and real mapper proof are separated into the correct tests.
  **Repo-truth evidence:** `backend/functions/src/services/__tests__/sp-field-mapping.test.ts`; `backend/functions/src/services/__tests__/projects-list-mapper.test.ts`
  **Notes / remaining caveats:** No repo-owned ambiguity remains about what the mock test does and does not prove.

**Current repo-truth summary**

- The original canonical-field-coverage finding is closed in repo-owned code and tests.
- The original mapper / repository production-path completeness finding is closed in repo-owned code and tests.
- The original persistence-gap finding is substantially closed: the repo-owned code path is repaired, but live-list proof remains external.
- The original backward-compatibility and mock-vs-real test-truthfulness findings are closed.
- The only original Phase 2 finding that remains not repo-evidenced is the current live SharePoint list state.

The remediation notes below are retained as the historical 2026-03-31 repair sequence. The status ledger above is the authoritative current-status summary for the original Phase 2 audit findings.

### Phase 2 Schema Reconciliation (2026-03-31, Prompt P2-07)

**Historical schema-reconciliation note:**

Phase 2 Prompt P2-07 documented an external production Projects list export that reportedly showed 17 additional columns using domain property names as SP internal names. That export is not checked into the repo, so the list below is historical context rather than current repo-owned proof:

- **5 structured location fields:** projectStreetAddress, projectCity, projectCounty, projectState, projectZip (Number type)
- **2 classification fields:** officeDivision, procoreProject
- **6 team-role fields:** projectExecutiveUpn, projectManagerUpn, leadEstimatorUpn, supportingEstimatorUpns, additionalTeamMemberUpns, timberscanApproverUpn
- **1 new field not previously in domain model:** sageAccessUpns (added to IProjectSetupRequest)
- **3 clarification lifecycle fields:** clarificationRequestedAt (DateTime type), requesterRetryUsed (Text), clarificationItems (Text)

**Code changes:**

- Added `sageAccessUpns?: string[]` to `IProjectSetupRequest` in `packages/models/src/provisioning/IProvisioning.ts`
- Added 17 new entries to `IProjectsListItem` interface and `PROJECTS_LIST_FIELD_MAP` in `projects-list-contract.ts`
- Extended `toDomain()` and `toListItem()` in `projects-list-mapper.ts` to map all 17 new fields with backward-compatible defaults for legacy rows
- Added `readOptionalZipFromNumber()` helper for SP Number → string ZIP code conversion
- Added `safeParseJsonObjects()` helper for clarification items (object array, not string array)
- Updated mapper tests to cover all 43 mapped fields (up from 26)
- Updated `PROJECTS_LIST_SELECT_FIELDS` count from 26 to 43

**Schema notes:**

- `field_17` (projectLeadId), `field_18` (viewerUPNs), `field_19` (addOns) are absent from the 2026-03-31 schema export but retained in code for legacy row compatibility
- ~~`clarificationItems` uses SP Text (MaxLength=255) — may truncate for requests with many clarification records~~ **CLOSED (P6-01).** Migrated to MultiLineText along with 3 other json-array gap fields. D0 deployment prerequisite added to runbook.
- `projectZip` is SP Number type — the mapper converts to/from string in the domain model

**Intentionally transient fields:** None. All `IProjectSetupRequest` fields are now mapped to SharePoint columns.

**Closure statement draft (historical, reconciled to current repo truth):**

The Phase 2 persistence gap was caused partly by suspected list-schema absence and partly by code-path incompletion. Repo-owned code now persists the canonical Project Setup field set through the real mapper/repository path, so the code-path portion of the gap is repaired. What the repo still does not prove is the current live SharePoint list state. Remaining follow-on: the `clarificationItems` field uses a Text column with 255-character limit, which may need migration for production-scale clarification records.

**Evidence:**

- Domain model: `packages/models/src/provisioning/IProvisioning.ts`
- Field contract: `backend/functions/src/services/projects-list-contract.ts`
- Mapper: `backend/functions/src/services/projects-list-mapper.ts`
- Mapper tests: `backend/functions/src/services/__tests__/projects-list-mapper.test.ts`

### Phase 2 Production-Path Mapping and Backward Compatibility (2026-03-31, Prompt P2-08)

**Production-path verification performed:**

End-to-end trace of all Project Setup persistence paths:

| Path | Component | Field Loss Risk | Result |
|------|-----------|-----------------|--------|
| Submit (write) | `projectRequests/index.ts` submitHandler | **CRITICAL — fixed** | P2-07 fields were not mapped from request body to newRequest object. Fixed: all 14 P2-07 fields now pass through from the request body. |
| State advance (update) | `projectRequests/index.ts` advanceRequestState | None | Uses read-modify-write pattern; full object preserved. |
| Repository upsert | `project-requests-repository.ts` | None | Full object write via `toListItem(request)`. |
| Mapper write | `projects-list-mapper.ts` toListItem | None | All 43 fields serialized correctly. |
| Mapper read | `projects-list-mapper.ts` toDomain | None | All 43 fields deserialized with backward-compat defaults. |
| Saga reconcile | `saga-orchestrator.ts` reconcileRequestState | None | Read-modify-write; only changes state + extras. |
| Controller/admin readers | AccountingPage, AdminPage | None | Defensive readers; no field-specific assumptions. |

**Backward-compatibility decisions:**

- Legacy rows missing P2-07 columns: all new fields default to `undefined` (optional strings/numbers) or `[]` (arrays) or `false` (boolean). No exceptions thrown for missing columns.
- `projectLocation` (legacy summary field) coexists with structured location fields. Both are persisted independently. No derivation or overwrite in either direction — this preserves existing row data while allowing new submissions to populate both.
- `field_17`/`field_18`/`field_19` retained in contract despite absence from latest schema export — protects existing row data.

**Closure statement (repo-owned code path):**

The production-path mapper/repository flow in repo-owned code now preserves the canonical Project Setup persisted field set, including backward-compatible handling for legacy list rows. The submit handler field-loss gap has been fixed. The remaining caveat is not the code path itself, but the lack of repo-owned proof for the currently deployed external list schema.

**Evidence:**

- Submit handler fix: `backend/functions/src/functions/projectRequests/index.ts` (lines 84-120)
- Lifecycle tests: `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts` (A1b, A1c)
- Full verification: 626 tests passed, 0 failed

### Phase 2 Test Suite Truthfulness and Contract Coverage (2026-03-31, Prompt P2-09)

**What was changed to make the test suite truthful:**

The `sp-field-mapping.test.ts` file was the source of the audit's "misleading mock round-trip coverage" concern. It used `MockProjectRequestsRepository` (in-memory) but its naming and doc comments implied it proved "SP field mapping contract" — which it did not. Changes:

| Test | Before | After |
|------|--------|-------|
| Mock round-trip test | Named "SP field mapping contract — full round-trip", used mock repo, implied SP proof | Renamed to "Mock repository round-trip (in-memory only — not SP proof)", explicit doc comment that this does NOT prove SharePoint persistence |
| Schema documentation test | Covered only 26 legacy columns (field_1..field_24 + Title + Year) | Replaced with real field contract proof validating all 43 PROJECTS_LIST_FIELD_MAP entries, including 17 P2-07 gap fields |
| P2-07 fields in mock test | Not covered | All 14 P2-07 fields now included in mock round-trip fixture |
| Regression guards | None | 3 new guards: field map ≥43 entries, SELECT_FIELDS ≥43, valid serialization strategies |
| P2-07 internal names | Not validated | New test proves all 17 P2-07 fields use domain-name SP internal names |

**Test organization after P2-09:**

| Category | File | What it proves |
|----------|------|----------------|
| Real mapper proof | `projects-list-mapper.test.ts` | toDomain/toListItem serialization for all 43 fields, normalization, backward compat, round-trip |
| Real contract proof | `sp-field-mapping.test.ts` | PROJECTS_LIST_FIELD_MAP covers all 43 production columns, P2-07 naming convention, regression guards |
| Mock fidelity | `sp-field-mapping.test.ts` | MockProjectRequestsRepository preserves all fields (explicitly labeled as mock-only) |
| Production lifecycle | `request-lifecycle.test.ts` | P2-07 fields survive submit→read and state transitions via mock repo |

**Closure statement:**

Phase 2 test coverage now proves the real production persistence contract rather than implying completeness from mock-only round-trips. The earlier "misleading test" concern is **closed**: the mock test is explicitly labeled as mock-only proof, and real contract proof is provided by the field map validation and mapper tests.

**Remaining blind spot:** The real `SharePointProjectRequestsAdapter` is not unit-testable without a live SharePoint environment. Production persistence proof relies on: (1) the mapper tests proving correct serialization for all 43 fields, (2) the repository using `toListItem()`/`toDomain()` exclusively, and (3) the adapter regression guard proving no inline `field_N` references.

**Evidence:**

- Restructured tests: `backend/functions/src/services/__tests__/sp-field-mapping.test.ts` (9 tests, 3 categories)
- Mapper tests: `backend/functions/src/services/__tests__/projects-list-mapper.test.ts` (41 tests, 43 fields — updated P6-01)
- Lifecycle tests: `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts` (70 tests — updated P6-01)

### Phase 2 Legacy Row Compatibility Strategy (2026-03-31, Prompt P2-10)

**Chosen strategy: Option A — read-compatible only, no historical backfill.**

**Why this strategy was selected:**

All operational read surfaces were reviewed and confirmed to handle missing P2-07 fields safely without code changes:

| Surface | P2-07 Fields Used? | Handling |
|---------|-------------------|----------|
| Estimating request detail (ReviewStepBody) | Yes — all location + team fields | `dv()` helper shows '—' for undefined; `dl()` helper shows '—' for empty arrays |
| Estimating wizard (ProjectInfoStepBody, TeamStepBody) | Yes — edit mode | `field ?? ''` conversion; undefined → empty input |
| Accounting review queue (ProjectReviewQueuePage) | No | Only legacy fields (name, number, department, state) |
| Accounting review detail (ProjectReviewDetailPage) | No (except clarificationItems) | Optional chaining: `request.clarificationItems?.length > 0` |
| Admin oversight (ProvisioningOversightPage) | No | Provisioning status only, not request fields |
| Team normalization (projectTeamFields.ts) | Yes | Fallback: derives team fields from legacy `projectLeadId` + `groupMembers` when P2-07 fields are undefined |
| Auth role resolution (resolveProjectRole.ts) | Yes — team UPNs | Optional chaining: `projectRecord.projectExecutiveUpn?.toLowerCase()` |
| BIC config (bic-config.ts) | Yes — clarificationRequestedAt | Guard: `request.clarificationRequestedAt && ...` |
| Backend mapper (toDomain) | Yes — all 17 fields | Safe defaults: `readOptionalString()` → undefined, `safeParseJsonArray()` → [] |

**Migration/backfill assessment:**

- **Not required:** Legacy rows display safely across all surfaces. Undefined P2-07 location fields show as '—'. Undefined team role fields trigger normalization fallback to legacy `projectLeadId`/`groupMembers`.
- **Not recommended:** Backfilling would risk data integrity issues (deriving structured fields from the legacy `projectLocation` summary is unreliable). Historical requests predating the wizard upgrade have no source data for the new fields.
- **Optional future consideration:** If reporting or analytics later requires populated P2-07 fields on historical rows, a manual backfill script could be added as a one-time operational task. This is not a code blocker.

**Operational implications:**

- **New requests through the current repo-owned code path:** all 43 mapped fields are serialized and deserialized by the production mapper/repository flow.
- **Legacy requests** (created before P2-07): P2-07 fields will be empty/undefined. All surfaces render this safely. No operator confusion expected — the fields simply show as blank or '—'.
- **No manual follow-up required** outside code.

**Closure statement:**

Legacy Project Setup rows are handled by an explicit read-compatibility strategy. The backend mapper normalizes missing P2-07 fields to safe defaults, all UI surfaces render undefined fields defensively, and the forward repo-owned production path persists the canonical field set without requiring hidden assumptions. No backfill is required in repo-owned code; live external-list proof remains outside the repo.

**Evidence:**

- Backend mapper defaults: `backend/functions/src/services/projects-list-mapper.ts` (toDomain lines 120-141)
- UI rendering helpers: `apps/estimating/src/project-setup/components/ReviewStepBody.tsx` (dv/dl helpers)
- Team fallback normalization: `packages/features/estimating/src/project-setup/config/projectTeamFields.ts` (lines 84-91)
- Controller/admin safety: `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`, `apps/admin/src/pages/ProvisioningOversightPage.tsx` (no P2-07 field dependencies)

### Phase 2 Documentation Reconciliation and Closure (Historical Reconciliation Note, 2026-03-31, Prompt P2-11)

**Re-audit verification:**

| Aspect | Status | Evidence |
|--------|--------|----------|
| Repo-owned schema/contract alignment | Verified | 43 fields in `PROJECTS_LIST_FIELD_MAP`; comments reference an external schema export, but the export itself is not checked into the repo |
| Canonical field contract | Verified | `IProjectsListItem` interface has all 43 SP columns |
| Production mapper | Verified | `toDomain()` and `toListItem()` cover all 43 fields with normalization |
| Submit handler | Verified | All P2-07 fields pass through from request body (P2-08 fix) |
| Test truthfulness | Verified | Mock tests explicitly labeled; real contract proof via field map; 9 contract tests + 39 mapper tests |
| Legacy-row handling | Verified | Option A (read-compatible, no backfill); all surfaces confirmed safe |

**Phase 2 closure status: SUBSTANTIALLY CLOSED IN REPO-OWNED CODE AND TESTS.**

The repo-owned Phase 2 persistence contract is now aligned across the canonical request model, field contract, mapper, repository, and real-adapter tests. The prior code-path persistence-loss finding is closed for the canonical persisted field set. What remains outside repo proof is the live SharePoint list itself: the repository does not contain a checked-in schema export or live integration evidence proving that the external list currently matches the 43-field contract.

**Remaining limitations (not blockers):**

- The current live SharePoint `Projects` list state remains **external / not repo-evidenced**.
- ~~`clarificationItems` uses SP Text column (MaxLength=255).~~ **CLOSED (P6-01).** Migrated to MultiLineText in the repo-owned contract. D0 deployment prerequisite documents the live list column migration.
- `field_17`/`field_18`/`field_19` absent from latest schema export but retained in code for legacy row compatibility.
- ~~Required-field enforcement remains disabled (`PROJECT_SETUP_REQUIRED_FIELDS_ENABLED = false`).~~ **CLOSED (P6-01).** Re-enabled with backend validation parity.

**Documents reconciled:**

- `Phase-2_Handoff.md`: annotated with reconciliation note; deferred items table now references resolution
- `Phase-2_Data-Contract-Gaps.md`: marked as HISTORICAL; all gaps closed
- Audit report: executive summary, cross-phase findings, gap analysis, remediation list, final status, and evidence appendix all updated

### Phase 3

**Intended objective**

Implement a production-safe auth model for the Project Setup package: explicit production mode, deliberate token acquisition, backend validator alignment, separation of delegated vs app-only flows, route protection, and release-readiness checks. Plan intent came from `phase-3/Phase-3_Auth_Action-Plan.md`.

**Confirmed implemented items**

- Runtime production-vs-`ui-review` mode exists in `apps/estimating/src/config/runtimeConfig.ts`.
- SPFx mount-time injection and audience-scoped token-provider setup exist in `apps/estimating/src/mount.tsx`.
- The Project Setup backend context gates production mode and falls back to `ui-review` when prerequisites fail in `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx`.
- Backend JWT validation supports explicit API audience and dual issuer handling in `backend/functions/src/middleware/validateToken.ts`.
- `withAuth()` route protection exists in `backend/functions/src/middleware/auth.ts`.
- Static auth enforcement tests exist in `backend/functions/src/middleware/auth-contract.test.ts`.
- Auth release-readiness checks exist in `backend/functions/src/test/auth-release-readiness.test.ts`.
- SignalR negotiation is auth-protected in `backend/functions/src/functions/signalr/index.ts`.

**Partially implemented items**

- The auth model is strong for the Estimating requester app, but Phase 3’s claimed overall completion is weakened by remaining transitional and inconsistent pieces:
  - `resolveSessionToken()` remains live and deprecated in `apps/estimating/src/utils/resolveSessionToken.ts`.
  - Cross-surface auth is not fully converged; related controller/admin pages still import session-token helpers in `apps/accounting/src/pages/ProjectReviewQueuePage.tsx` and `apps/admin/src/pages/ProvisioningOversightPage.tsx`.
  - Dual RBAC mechanisms remain split between JWT roles and UPN environment lists; even the Phase 3 handoff lists this as remaining follow-on work in `phase-3/Phase-3_Handoff.md`.

**Missing items**

- The proxy route is still a stub, despite being auth-protected. Evidence: `backend/functions/src/functions/proxy/proxy-handler.ts`.
- Production auth behavior remains dependent on external runtime configuration, SharePoint admin approval, and Azure deployment settings; code exists, but full production proof is still deployment-dependent.

**Divergence from plan**

- `phase-3/Phase-3_Handoff.md` says “All 7 success criteria ... are satisfied” and “production-safe auth model,” but repo truth supports a narrower statement: the Estimating requester auth path is substantially implemented, while adjacent surfaces and some auth-adjacent routes still retain transitional elements.

**Current status assessment**

**Closed (P3-07 through P3-11, 2026-03-31).** Auth architecture frozen (P3-07), production token/audience consistency verified (P3-08), cross-surface auth converged to factory-based providers — deprecated `resolveSessionToken()` removed from all retained surfaces (P3-09), proxy excluded from PS release scope with auth readiness tests (P3-10), documentation reconciled (P3-11). RBAC convergence (JWT roles vs UPN lists) is a future follow-on, not a Phase 3 blocker.

### Phase 3 Auth Architecture Freeze and Revalidation (2026-03-31, Prompt P3-07)

**Re-verification against current repo truth:**

All 10 auth-relevant files were inspected. Results:

| Original Audit Finding | Current Status |
|------------------------|----------------|
| Production-vs-ui-review mode exists | **Confirmed** — `getBackendMode()`, `checkProductionReadiness()` |
| SPFx audience-scoped token acquisition | **Confirmed** — `createSpfxApiTokenProvider()` in mount.tsx |
| Backend JWT validation and route protection | **Confirmed** — `validateToken()` + `withAuth()` + auth-contract tests |
| Deprecated `resolveSessionToken()` still exists | **Still accurate** — function retained with updated deprecation annotation |
| Controller/admin import session-token helpers | **Still accurate** — accounting and admin apps use deprecated single-capture pattern |
| Cross-surface auth convergence incomplete | **Still accurate** — SPFx path is canonical; PWA surfaces remain transitional |
| Proxy route is auth-protected stub | **Partially stale** — proxy IS now auth-protected (`withAuth()`); still a functional stub for Graph calls |

**Canonical Project Setup auth posture (frozen):**

1. **Token acquisition:** SPFx production path uses `createSpfxApiTokenProvider()` with `API_AUDIENCE` scoping. Tokens refresh automatically via SPFx `aadTokenProviderFactory`.
2. **Token validation:** Backend `validateToken()` verifies JWT against Azure Entra ID JWKS. Accepts v1/v2 issuers. Requires explicit `API_AUDIENCE` env var.
3. **Route protection:** All HTTP routes wrapped with `withAuth()`. Documented exceptions: health (unauthenticated), timer triggers (non-HTTP), notifications (internal delivery).
4. **Mode gating:** `ProjectSetupBackendContext` checks production readiness (Function App URL + token provider). Falls back to ui-review if prerequisites fail. ui-review uses local mock client.

**Transitional surfaces (out of Project Setup domain scope):**

- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx` — uses `resolveSessionToken()` (PWA surface)
- `apps/admin/src/pages/ProvisioningOversightPage.tsx` — uses `resolveSessionToken()` (PWA surface)

These are separate app surfaces with their own auth lifecycle. Migrating them to factory-based providers is a cross-surface convergence task, not a Phase 3 Project Setup deliverable.

**Closure statement:**

The Project Setup auth model is now explicitly frozen around a domain-scoped production path (SPFx token provider → backend JWT validation), a bounded ui-review fallback path, and documented transitional surfaces. The architecture/scoping portion of Phase 3 is **closed for Project Setup**. Cross-surface auth convergence for accounting/admin remains a future follow-on.

**Evidence:**

- Auth posture freeze comment: `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx`
- Deprecation annotation update: `apps/estimating/src/utils/resolveSessionToken.ts`
- SPFx token provider: `apps/estimating/src/mount.tsx`
- Backend JWT validation: `backend/functions/src/middleware/validateToken.ts`
- Route protection: `backend/functions/src/middleware/auth.ts`
- Auth contract enforcement: `backend/functions/src/middleware/auth-contract.test.ts`

### Phase 3 Production Token and API Audience Consistency (2026-03-31, Prompt P3-08)

**Production token-acquisition path (verified):**

```
SPFx Shell → mount.tsx → getApiAudience() → createSpfxApiTokenProvider(context, audience)
                                                    ↓
                                            SPFx aadTokenProviderFactory.getTokenProvider()
                                                    ↓
                                            Bearer token with aud = api://<client-id>
                                                    ↓
Backend → validateToken() → jose.jwtVerify(token, jwks, { audience: API_AUDIENCE })
```

**Frontend/backend audience contract:**

| Side | Source | Variable | Format |
|------|--------|----------|--------|
| Frontend (SPFx) | Shell mount config or `VITE_API_AUDIENCE` | `apiAudience` | `api://<client-id>` |
| Backend | Azure Function App setting | `API_AUDIENCE` | `api://<client-id>` |

Both must resolve to the same app registration audience URI. The backend enforces this via `resolveApiAudience()` which throws a `ConfigError` in production if `API_AUDIENCE` is not set — there is no implicit fallback.

**ui-review separation confirmed:**

- ui-review mode never acquires a real API token. `createDevTokenFactory()` returns a placeholder.
- ui-review mode uses `createUiReviewProjectSetupClient()` which operates on local mock data.
- Production readiness gating in `ProjectSetupBackendContext` requires both Function App URL and token provider — ui-review activates automatically when either is absent.
- No ui-review assumption contaminates production auth logic.

**Ambiguity removed:**

- Added explicit frontend/backend audience contract comment in `mount.tsx` (P3-08)
- No alternate token paths remain for the SPFx production surface — `createSpfxApiTokenProvider` is the single canonical path
- Deprecated `resolveSessionToken()` is isolated to non-SPFx PWA surfaces (documented in P3-07)

**Closure statement:**

The retained Project Setup release surface uses a single explicit production API token path (SPFx `aadTokenProviderFactory` → audience-scoped Bearer token → backend `validateToken` with explicit `API_AUDIENCE`). ui-review remains a bounded non-production mode with no token acquisition. The production token and audience consistency portion of Phase 3 is **closed**.

**Remaining external dependencies:**

- SharePoint admin must approve the API permission grant for the app registration
- Azure Function App must have `API_AUDIENCE` configured to match the app registration
- These are deployment prerequisites, not code gaps

**Evidence:**

- Audience contract comment: `apps/estimating/src/mount.tsx` (P3-08)
- API audience resolution: `apps/estimating/src/config/runtimeConfig.ts` (`getApiAudience`)
- Backend audience validation: `backend/functions/src/middleware/validateToken.ts` (`resolveApiAudience`)
- Production readiness gating: `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx`

### Phase 3 Cross-Surface Auth Convergence (2026-03-31, Prompt P3-09)

**Surfaces reviewed and converged:**

| Surface | File | Before | After |
|---------|------|--------|-------|
| Estimating (requester) | `ProjectSetupBackendContext.tsx` | Canonical (factory) | Unchanged — already canonical |
| Accounting (controller queue) | `ProjectReviewQueuePage.tsx` | `resolveSessionToken()` single-capture | `createSessionTokenFactory()` — factory-based |
| Accounting (controller detail) | `ProjectReviewDetailPage.tsx` | `resolveSessionToken()` single-capture | `createSessionTokenFactory()` — factory-based |
| Admin (oversight) | `ProvisioningOversightPage.tsx` | `resolveSessionToken()` single-capture | `createSessionTokenFactory()` — factory-based |
| Admin (dashboard) | `OperationalDashboardPage.tsx` | `resolveSessionToken()` single-capture | `createSessionTokenFactory()` — factory-based |
| Admin (alert polling) | `useAlertPolling.ts` | `resolveSessionToken()` single-capture | `createSessionTokenFactory()` — factory-based |
| Admin (probe polling) | `useProbePolling.ts` | `resolveSessionToken()` single-capture | `createSessionTokenFactory()` — factory-based |

**Deprecated paths removed/narrowed:**

- `apps/accounting/src/utils/resolveSessionToken.ts`: replaced with `createSessionTokenFactory()` export (deprecated function removed)
- `apps/admin/src/utils/resolveSessionToken.ts`: replaced with `createSessionTokenFactory()` export (deprecated function removed)
- `apps/estimating/src/utils/resolveSessionToken.ts`: deprecated `resolveSessionToken()` narrowed to dev-harness only; annotation updated to note no retained surface consumes it

**Closure statement:**

Retained Project Setup-related surfaces now converge on the canonical factory-based auth posture. Deprecated session-token single-capture paths are no longer part of any supported production or retained workflow surface. The cross-surface auth convergence finding from the original Phase 3 audit is **closed**.

**Evidence:**

- Accounting migration: `apps/accounting/src/utils/resolveSessionToken.ts`, `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`, `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- Admin migration: `apps/admin/src/utils/resolveSessionToken.ts`, `apps/admin/src/pages/ProvisioningOversightPage.tsx`, `apps/admin/src/pages/OperationalDashboardPage.tsx`, `apps/admin/src/hooks/useAlertPolling.ts`, `apps/admin/src/hooks/useProbePolling.ts`
- Estimating deprecation narrowing: `apps/estimating/src/utils/resolveSessionToken.ts`

### Phase 3 Protected Route Scope, Proxy Decision, and Auth Tests (2026-03-31, Prompt P3-10)

**Retained protected route surface for Project Setup host:**

| Route Family | Auth | Type | In PS Host? |
|--------------|------|------|-------------|
| projectRequests | withAuth() | 4 HTTP | Yes |
| provisioningSaga | withAuth() | 10 HTTP | Yes |
| signalr | withAuth() | 1 HTTP | Yes |
| acknowledgments | withAuth() | 2 HTTP | Yes |
| notifications | exception (internal delivery) | HTTP + queue + timer | Yes |
| health | exception (unauthenticated probe) | 1 HTTP | Yes |
| timerFullSpec | N/A (timer trigger) | 1 timer | Yes |
| cleanupIdempotency | N/A (timer trigger) | 1 timer | Yes |

**Proxy decision: EXCLUDED from Project Setup release scope.**

The proxy route (`/api/proxy/*`) is a functional stub returning `{ _mock: true }`. It is auth-protected (withAuth) but does not make real Graph API calls. Decision:
- Proxy is NOT in the Project Setup domain host (confirmed by boundary test)
- Proxy handler explicitly marked "NOT IN PROJECT SETUP RELEASE SCOPE" (P3-10)
- Proxy remains in the legacy monolithic host only
- Future options: implement for real Graph forwarding, or retire from the monolithic host

**Auth-readiness tests added:**

- 4 tests proving PS HTTP route families (projectRequests, provisioningSaga, signalr, acknowledgments) use `withAuth()`
- 1 test proving proxy is NOT in the PS host
- 1 test proving proxy handler is explicitly marked as out of PS release scope

**Closure statement:**

The retained Project Setup protected route surface is now explicit (8 route families, 4 with withAuth, 4 with documented exceptions). The proxy posture is no longer ambiguous — explicitly excluded from PS release scope. Phase 3 auth readiness is supported by route-accurate tests (6 new P3-10 tests + existing auth contract enforcement). The protected-route/scope/testing portion of Phase 3 is **closed**.

**Evidence:**

- Proxy scope annotation: `backend/functions/src/functions/proxy/proxy-handler.ts`
- PS auth readiness tests: `backend/functions/src/test/project-setup-host-boundary.test.ts` (P3-10 section)
- Auth contract enforcement: `backend/functions/src/middleware/auth-contract.test.ts`

### Phase 3 Documentation Reconciliation and Closure (2026-03-31, Prompt P3-11)

**Re-audit verification:**

| Aspect | Status | Evidence |
|--------|--------|----------|
| Auth architecture freeze | Verified | P3-07 posture comment in ProjectSetupBackendContext.tsx |
| Production token path | Verified | P3-08 audience contract comment in mount.tsx; getApiAudience → createSpfxApiTokenProvider → validateToken(API_AUDIENCE) |
| Cross-surface convergence | Verified | P3-09: accounting (2 pages) and admin (4 files) migrated from resolveSessionToken to createSessionTokenFactory |
| Deprecated token cleanup | Verified | P3-09: resolveSessionToken removed from accounting/admin; narrowed to dev-harness-only in estimating |
| Protected route scope | Verified | P3-10: 4 PS HTTP routes use withAuth; auth exceptions documented |
| Proxy decision | Verified | P3-10: explicitly excluded from PS release scope; proxy-handler.ts annotated |
| Auth readiness tests | Verified | P3-10: 6 new tests in project-setup-host-boundary.test.ts |

**Phase 3 closure status: CLOSED.**

The retained Project Setup auth model is now explicit across production mode (SPFx token provider → backend JWT validation with explicit API_AUDIENCE), bounded ui-review fallback, and documented auth exceptions. Deprecated session-token paths are no longer part of the supported retained release surface. Phase 3 auth readiness is supported by scope-accurate repo evidence.

**Remaining future follow-on (not Phase 3 blockers):**

- RBAC convergence: JWT roles vs UPN env lists remain split. This is an operational convenience, not a security gap — both mechanisms enforce authorization, just via different configuration models.
- Production auth deployment: requires external environment setup (API_AUDIENCE, SharePoint admin consent, MI grants). This is a deployment prerequisite, not a code gap.

**Documents reconciled:**

- `Phase-3_Handoff.md`: annotated with reconciliation note
- Audit report: executive summary, Phase 3 status, cross-phase findings, deferred implementations, remediation list, and final status all updated

### Phase 4

**Intended objective**

Harden the infrastructure posture: startup scoping, configuration validation, managed identity posture, storage/secret handling, CORS and permission alignment, observability, diagnostics, and operational handoff. Plan intent came from `phase-4/Phase-4_Infrastructure_Action-Plan.md` and `phase-4/Phase-4_Operational-Readiness-and-Handoff.md`.

**Confirmed implemented items**

- Tiered config validation exists in `backend/functions/src/utils/validate-config.ts`.
- The health endpoint exposes `operationalReadiness`, `configTiers`, and provisioning prerequisites in `backend/functions/src/functions/health/index.ts`.
- Managed-identity-oriented service posture exists in `backend/functions/src/services/service-factory.ts`, `backend/functions/src/services/sharepoint-service.ts`, and `backend/functions/src/services/managed-identity-token-service.ts`.
- `host.json` includes version-controlled CORS configuration and SignalR binding configuration.
- Version-controlled observability artifacts exist in `backend/functions/observability/README.md`, `backend/functions/observability/alerts.json`, and `backend/functions/observability/kql/*.kql`.
- Infrastructure and release-gate tests exist and currently pass, including `backend/functions/src/test/release-gates.test.ts`, `backend/functions/src/test/infra-readiness.test.ts`, and health tests under `backend/functions/src/functions/health/__tests__/health.test.ts`.

**Partially implemented items** *(original audit findings — see P4-07 through P4-11 reconciliation below)*

- ~~Startup scoping is materially implemented for the dedicated Project Setup host in `backend/functions/src/hosts/project-setup/**`, but repo truth does not prove that host is the live deployment target.~~ **RESOLVED (P4-07, P4-08).** Architecture frozen. PS host exists with 63 regression tests. Monolithic host explicitly labeled transitional per ADR-0124. Deployment cutover remains environment-gated.
- ~~Observability artifacts are real in repo, but deployment and operationalization are incomplete.~~ **CLASSIFIED (P4-10).** Evidence classification guardrail added to `backend/functions/observability/README.md`. 3 of 15 artifacts genuinely operationalized (health endpoint, telemetry wrapper, logger). Remaining 12 require DevOps deployment. DevOps setup checklist still unchecked — this is honest, not a gap.
- ~~CORS posture is split by host.~~ **RESOLVED (P4-07, P4-09).** Split is intentional per ADR-0124. PS host: single tenant origin, no wildcards, test-enforced. Monolithic host: broader (transitional). No ambiguity remains.

**Missing items** *(original audit findings — see reconciliation below)*

- ~~No repo evidence proves that the recommended alert rules, dashboards, or Teams delivery workflows have been deployed.~~ **CLASSIFIED (P4-10).** These are documentary specifications requiring DevOps deployment. The observability README now explicitly categorizes them as not operationalized. This is an environment-gated item, not a repo gap.
- No repo evidence proves live infrastructure rehearsal or live staging validation. **Still accurate.** This remains an environment-gated prerequisite.

**Divergence from plan** *(original audit findings — see reconciliation below)*

- ~~`phase-4/Phase-4_Handoff.md` says the package has a “production-safe infrastructure posture.” Repo truth does not support that as strongly because the backend host still co-deploys unrelated domains.~~ **RECONCILED (P4-07).** Handoff annotated with reconciliation note distinguishing repo-proven infrastructure from environment-gated items. The dedicated PS host is now the canonical deployment target; the monolithic host is transitional.
- ~~Phase 4 documentation frames CORS as tenant-aligned, but current `host.json` is broader.~~ **RESOLVED (P4-09).** The PS host `host.json` is tenant-aligned (single origin). The monolithic `host.json` is broader but transitional. Both are now explicitly classified.

**Current status assessment**

**Substantially closed — architecture frozen, operationalization deferred (P4-07, 2026-03-31).** The infrastructure model is frozen around a domain-scoped backend host with deployment-scoped validation, tenant-specific CORS, pure managed identity, and diagnostic health output. Environment-gated deployment proof and observability operationalization remain deferred.

### Phase 4 Infrastructure Architecture Freeze and Deployment-Scope Revalidation (2026-03-31, Prompt P4-07)

**Re-verification against current repo truth:**

All Phase 4 infrastructure surfaces were inspected against the five original audit findings:

| Original Audit Finding | Current Status |
|------------------------|----------------|
| Startup scoping only partial for PS host | **Partially stale** — dedicated PS host fully implemented at `backend/functions/src/hosts/project-setup/` with scoped composition root (8 families, 11 excluded), scoped service factory (9 eager services, no domain CRUD), tenant-specific CORS, and domain-scoped config validation. 63 regression tests (AC-1 through AC-10). ADR-0124 establishes per-domain hosts. Monolithic host preserved as transitional. |
| Observability artifacts not operationalized | **Still accurate** — `backend/functions/observability/README.md` DevOps setup checklist items all unchecked. KQL queries and `alerts.json` exist but are not deployed. Deferred to Prompt-10. |
| CORS posture split between hosts | **Architecturally resolved** — split is intentional per ADR-0124. PS host at `backend/functions/src/hosts/project-setup/host.json` has single tenant origin (`https://hedrickbrotherscom.sharepoint.com`). Monolithic host broader (transitional). |
| No repo proof of live deployment validation | **Still accurate** — environment-gated, not repo-completable |
| Handoff overstates deployment scoping | **Partially stale** — PS host now fully scoped with regression tests, but operationalization still overstated |

**Canonical Project Setup infrastructure posture (frozen):**

1. **Hosting:** Dedicated domain host at `backend/functions/src/hosts/project-setup/` with thin composition root importing exactly 8 route families (projectRequests, provisioningSaga, timerFullSpec, signalr, acknowledgments, notifications, health, cleanupIdempotency). 11 domain CRUD families explicitly excluded.
2. **Service container:** `createProjectSetupServiceFactory()` with 9 eager services. No domain CRUD service types imported. Standalone singleton — does not share instance with monolithic factory.
3. **Config validation:** Domain-scoped `validateProjectSetupStartupConfig()` validates core tier at startup (AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_TABLE_ENDPOINT, APPLICATIONINSIGHTS_CONNECTION_STRING, HBC_ADAPTER_MODE, API_AUDIENCE). SharePoint tier validated as warning. Provisioning prerequisites validated at saga execution time only.
4. **CORS:** Tenant-specific single origin (`https://hedrickbrotherscom.sharepoint.com`), `supportCredentials: true`, no wildcards. Test-enforced exactly 1 CORS origin.
5. **Managed identity:** Pure MI — `AZURE_CLIENT_SECRET` removed from config registry. 6 services use `DefaultAzureCredential`.
6. **SignalR:** Conditional initialization — `RealSignalRPushService` when `AzureSignalRConnectionString` present, `NoOpSignalRPushService` when absent.
7. **Health:** Non-blocking diagnostic endpoint with `operationalReadiness` (ready/degraded/blocked), `configTiers` (core/sharepoint/provisioning), and `provisioningPrereqs` detail. Always returns HTTP 200.
8. **Observability:** Version-controlled KQL queries and alert definitions checked in. Telemetry wrapper (`withTelemetry`) on all authenticated handlers. Structured events for auth, handler lifecycle, and provisioning. This is documentary infrastructure, not operationalized monitoring.
9. **Email:** Stubbed (logs only). Health endpoint reports `not-configured` when env vars absent. Explicitly deferred.

**Transitional surfaces (not canonical for Project Setup):**

- `backend/functions/src/index.ts` — monolithic host preserved during per-domain transition (ADR-0124)
- `backend/functions/src/services/service-factory.ts` — shared service factory for monolithic host with lazy domain CRUD services
- `backend/functions/host.json` — broader CORS (includes `https://*.sharepoint.com` wildcard) for monolithic host only

These are expected to remain until other domain hosts are created and the monolithic host is retired.

**Documentary-only surfaces (not operationalized):**

- `backend/functions/observability/kql/*.kql` — KQL query library for dashboards
- `backend/functions/observability/alerts.json` — 5 alert rule definitions
- `backend/functions/observability/README.md` — DevOps setup checklist (all items unchecked)

**Closure statement:**

The Project Setup infrastructure posture is now explicitly frozen around a domain-scoped backend host with deployment-scoped validation, bounded CORS/identity/runtime assumptions, and a truthful distinction between repo artifacts and operationalized readiness. The architecture/scoping portion of Phase 4 is **closed for Project Setup in repo-owned terms**. Two categories of work remain outside this closure:

1. **Environment-gated prerequisites:** Live deployment cutover to the dedicated PS host, MI grant application, CORS verification in Azure portal, SharePoint admin consent, Graph permission grants. These require external execution proof.
2. **Operationalization:** Observability artifacts exist but are not deployed. DevOps setup checklist remains unchecked. Email delivery remains stubbed. These are explicitly deferred.

**Evidence:**

- PS host composition root: `backend/functions/src/hosts/project-setup/index.ts`
- PS scoped service factory: `backend/functions/src/hosts/project-setup/service-factory.ts`
- PS tenant-specific CORS: `backend/functions/src/hosts/project-setup/host.json`
- Release-scope manifest: `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`
- Domain-scoped config validation: `backend/functions/src/utils/validate-config.ts` (`validateProjectSetupStartupConfig`)
- Health endpoint: `backend/functions/src/functions/health/index.ts`
- Boundary tests (63): `backend/functions/src/test/project-setup-host-boundary.test.ts`
- Infrastructure readiness tests: `backend/functions/src/test/infra-readiness.test.ts`
- Release-gate tests: `backend/functions/src/test/release-gates.test.ts`
- Observability artifacts: `backend/functions/observability/README.md`, `backend/functions/observability/alerts.json`, `backend/functions/observability/kql/*.kql`
- Monolithic host (transitional): `backend/functions/src/index.ts`
- Architecture decision: `docs/architecture/adr/ADR-0124-project-setup-backend-host-boundary.md`

**Remaining open infrastructure questions:**

1. Which host posture is the actual live deployment target? Repo truth creates both; deployment wiring is external.
2. When will the monolithic host be retired? Per ADR-0124, it is preserved during transition but has no explicit retirement timeline.
3. Will observability be operationalized before or after the Phase 5 release decision?

### Phase 4 Deployment-Scoped Config Validation and Health/Readiness Alignment (2026-03-31, Prompt P4-08)

**Re-verification against P4-08 acceptance criteria:**

All four acceptance criteria were verified against current repo truth. The required deployment-scoped validation and health/readiness alignment work was already implemented by P1-09 (AC-6 config validation scoping), P4-02 (tiered config validation), and P4-05 (operationalReadiness health output). No additional code changes are required.

| P4-08 Acceptance Criterion | Status | Implementing Work |
|---|---|---|
| Validation scoped to retained PS deployment posture | **Satisfied** | P1-09: `validateProjectSetupStartupConfig()` validates core tier only at startup. SharePoint as warning. Provisioning deferred to saga time. |
| Health/readiness truthfully describes PS host | **Satisfied** | P4-05: `operationalReadiness` (ready/degraded/blocked), `configTiers` (core/sharepoint/provisioning), `provisioningPrereqs` detail. Non-blocking HTTP 200. |
| Broad shared-host boot blockers removed/narrowed/isolated | **Satisfied** | P1-09: PS factory calls `validateProjectSetupStartupConfig()` not `validateRequiredConfig()`. Domain CRUD config, email config, notification API, department MI grants excluded from startup. |
| Review doc updated with truthful progress notes | **Satisfied** | This progress note. |

**Canonical Project Setup validation scope:**

Startup (blocking):
- Core tier: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_TABLE_ENDPOINT, APPLICATIONINSIGHTS_CONNECTION_STRING, HBC_ADAPTER_MODE, API_AUDIENCE

Startup (warning, not blocking):
- SharePoint tier: SHAREPOINT_TENANT_URL, SHAREPOINT_PROJECTS_SITE_URL
- Role config: CONTROLLER_UPNS, ADMIN_UPNS

Deferred to saga execution time:
- Provisioning prerequisites: GRAPH_GROUP_PERMISSION_CONFIRMED, SHAREPOINT_HUB_SITE_ID, SHAREPOINT_APP_CATALOG_URL, HB_INTEL_SPFX_APP_ID, OPEX_MANAGER_UPN

Not validated by PS host (excluded):
- Domain CRUD config (leads, projects, estimating, etc.)
- Email delivery config (EMAIL_DELIVERY_API_KEY, EMAIL_FROM_ADDRESS) — stub
- Notification API base URL (NOTIFICATION_API_BASE_URL) — localhost fallback
- Department background access grants (DEPT_BACKGROUND_ACCESS_*)

**Health/readiness mapping to PS deployment truth:**

| Health Field | PS Deployment Meaning |
|---|---|
| `operationalReadiness: blocked` | Core auth config missing — no authenticated requests can succeed |
| `operationalReadiness: degraded` | Core OK but SharePoint, provisioning, or SignalR incomplete |
| `operationalReadiness: ready` | All tiers operational |
| `configTiers.core` | Maps to `validateCoreConfig()` — 6 required vars |
| `configTiers.sharepoint` | Maps to `validateSharePointConfig()` — 2 required vars |
| `configTiers.provisioning` | Maps to `validateProvisioningPrerequisites()` — 5 saga-time gates |
| `integrations.signalR` | Conditional: `RealSignalRPushService` or `NoOpSignalRPushService` |
| `integrations.email` | Stub: always `not-configured` until real provider wired |
| `integrations.notifications` | Informational: localhost fallback if not set |

**Over-broad boot blockers confirmed absent in PS host:**

- PS factory uses `validateProjectSetupStartupConfig()`, not `validateRequiredConfig()` (test-enforced: AC-6 in `project-setup-host-boundary.test.ts`)
- No provisioning prerequisites validated at startup (test-enforced: AC-6 suite)
- No email or notification config required at startup
- No domain CRUD config required at startup
- No department MI grants required at startup
- Lazy domain CRUD service initialization does not exist in PS factory (only 9 eager services)

**Remaining environment-gated dependencies:**

These are external prerequisites — the PS host reports their status through the health endpoint but cannot validate them in repo code alone:
1. Azure Function App exists with system-assigned Managed Identity
2. MI role assignments applied (Storage Table Data Contributor, Sites.FullControl.All, Group.ReadWrite.All)
3. All 8 core+sharepoint env vars configured in the deployment environment
4. CORS verified in Azure portal against `host.json`
5. SPFx API access approved in SharePoint admin center

**Closure statement:**

Project Setup startup/config validation and health/readiness reporting are explicitly scoped to the retained Project Setup deployment boundary rather than a broader shared-host posture. The validation model is tiered (core blocking → sharepoint warning → provisioning deferred), the health endpoint truthfully reports per-tier status, and no over-broad boot blockers exist. All four P4-08 acceptance criteria are satisfied by existing implementation (P1-09, P4-02, P4-05) with test enforcement.

**Evidence:**

- Domain-scoped validation: `backend/functions/src/utils/validate-config.ts` (`validateProjectSetupStartupConfig`)
- PS service factory validation call: `backend/functions/src/hosts/project-setup/service-factory.ts` (line 64)
- Health endpoint: `backend/functions/src/functions/health/index.ts`
- Tiered readiness computation: `computeReadiness()` in health/index.ts
- Config tier classification: `backend/functions/src/config/wave0-env-registry.ts` (`configTier` field)
- AC-6 validation tests: `backend/functions/src/test/project-setup-host-boundary.test.ts` (8 tests)
- Infrastructure readiness tests: `backend/functions/src/test/infra-readiness.test.ts` (7 tests)
- Health endpoint tests: `backend/functions/src/functions/health/__tests__/health.test.ts`

### Phase 4 CORS, Managed Identity, and Downstream Permission Scoping (2026-03-31, Prompt P4-09)

**Re-verification against P4-09 acceptance criteria:**

All four acceptance criteria were verified against current repo truth. The required CORS, managed identity, and downstream permission scoping was already implemented by P1-09 (AC-5 CORS, AC-6 identity scoping), P4-03 (MI hardening, AZURE_CLIENT_SECRET removal), P4-04 (CORS/permissions/connected-services), and P1-10 (regression guards). No additional code changes are required.

| P4-09 Acceptance Criterion | Status | Implementing Work |
|---|---|---|
| PS CORS posture is explicit and truthful | **Satisfied** | P1-09 (AC-5): tenant-specific single origin, no wildcards, `supportCredentials: true`. P1-10: exactly 1 CORS origin test-enforced. |
| PS managed-identity/downstream assumptions are explicit and domain-scoped | **Satisfied** | P4-03: pure MI (`AZURE_CLIENT_SECRET` removed), 6 services use `DefaultAzureCredential`. P1-09: PS factory has 9 scoped services only. |
| Broad shared-host assumptions removed/narrowed/marked transitional | **Satisfied** | P4-07: monolithic host, shared factory, broader CORS explicitly classified as transitional per ADR-0124. |
| Review doc updated with truthful progress notes | **Satisfied** | This progress note. |

**Retained Project Setup CORS posture:**

| Aspect | PS Host | Monolithic Host (transitional) |
|---|---|---|
| Config file | `backend/functions/src/hosts/project-setup/host.json` | `backend/functions/host.json` |
| Allowed origins | `https://hedrickbrotherscom.sharepoint.com` (1 origin) | `https://hedrickbrotherscom.sharepoint.com`, `https://*.sharepoint.com` (2, includes wildcard) |
| Wildcards | None | Yes (`*.sharepoint.com`) |
| `supportCredentials` | `true` | `true` |
| Test enforcement | AC-5 (3 tests: tenant origin present, no wildcards, credentials required) + P1-10 (exactly 1 origin) | Not PS-scoped |

The CORS split is intentional, not ambiguous. The PS host uses tenant-specific CORS as the canonical posture. The monolithic host retains broader CORS for its transitional multi-domain role. ADR-0124 establishes the PS host as the canonical deployment target.

**Retained Project Setup managed-identity posture:**

All 6 downstream services used by the PS host authenticate via `DefaultAzureCredential` (system-assigned Managed Identity):

| Service | File | Downstream Resource | MI Permission Required |
|---|---|---|---|
| `SharePointService` | `backend/functions/src/services/sharepoint-service.ts` | SharePoint Online | Sites.FullControl.All |
| `GraphService` | `backend/functions/src/services/graph-service.ts` | Microsoft Graph | Group.ReadWrite.All |
| `RealTableStorageService` | `backend/functions/src/utils/table-client-factory.ts` | Azure Table Storage | Storage Table Data Contributor |
| `ManagedIdentityTokenService` | `backend/functions/src/services/managed-identity-token-service.ts` | Token acquisition | (uses MI credential) |
| `SharePointProjectRequestsAdapter` | `backend/functions/src/services/project-requests-repository.ts` | SharePoint Projects list | Sites.FullControl.All (via SP service) |
| `RealAcknowledgmentService` | `backend/functions/src/services/acknowledgment-service.ts` | SharePoint Projects list | Sites.FullControl.All (via SP service) |

No app-registration secrets exist. `AZURE_CLIENT_SECRET` was removed from the config registry by P4-03.

**Downstream dependencies classified by PS scope:**

| Dependency | Required for PS | Category |
|---|---|---|
| Azure Table Storage (idempotency, provisioning status) | Yes | Canonical |
| SharePoint Online (request persistence, site provisioning) | Yes | Canonical |
| Microsoft Graph (group creation, membership) | Yes | Canonical |
| Azure SignalR (real-time provisioning push) | Optional | Canonical (graceful degradation via `NoOpSignalRPushService`) |
| Application Insights (telemetry) | Yes | Canonical |
| Email delivery (SendGrid) | No | Stub — deferred |
| Notification API | No | Informational — localhost fallback |
| Domain CRUD SharePoint lists (leads, projects, etc.) | No | Excluded — not in PS host |
| Department background MI grants | No | Excluded — provisioning-only |

**Broad/shared-host assumptions explicitly labeled transitional:**

The following infrastructure surfaces belong to the monolithic host and do not define PS retained release truth:

1. `backend/functions/src/index.ts` — registers 19 route families including 11 domain CRUD families excluded from PS
2. `backend/functions/src/services/service-factory.ts` — shared service factory with lazy domain CRUD services
3. `backend/functions/host.json` — broader CORS with `*.sharepoint.com` wildcard
4. `validateRequiredConfig()` — validates all tiers; PS host uses `validateProjectSetupStartupConfig()` instead

These are preserved during the per-domain host transition (ADR-0124) and will remain until other domain hosts are created and the monolithic host is retired.

**Remaining operational/environment dependencies:**

1. MI role assignments must be applied in Azure portal (Storage Table Data Contributor, Sites.FullControl.All, Group.ReadWrite.All)
2. Entra ID app registration must have correct API permissions approved
3. SharePoint admin center must approve SPFx API access
4. `GRAPH_GROUP_PERMISSION_CONFIRMED=true` must be set after IT grants Graph permission
5. CORS in Azure portal must match or defer to `host.json` (portal overrides take precedence)

**Intentionally deferred least-privilege follow-up:**

- RBAC convergence from UPN env lists to JWT roles (Phase 5+ per P3-09)
- Sites.FullControl.All is broader than ideal; narrowing to Sites.Selected requires per-site admin consent (operational complexity)
- Group.ReadWrite.All could narrow to Group.Create + GroupMember.ReadWrite.All if Graph API supports the saga flow

**Closure statement:**

Project Setup CORS, managed identity, and downstream runtime assumptions are explicit and domain-scoped. The PS host uses tenant-specific CORS (single origin, no wildcards, test-enforced), pure managed identity (6 services, no secrets), and a bounded set of 9 services with classified downstream dependencies. Broad shared-host infrastructure posture no longer defines retained release truth — the monolithic host is explicitly labeled transitional per ADR-0124. All four P4-09 acceptance criteria are satisfied by existing implementation with test enforcement.

**Evidence:**

- PS tenant-specific CORS: `backend/functions/src/hosts/project-setup/host.json`
- Monolithic broader CORS (transitional): `backend/functions/host.json`
- CORS tests (AC-5): `backend/functions/src/test/project-setup-host-boundary.test.ts` (3 tests)
- CORS drift prevention (P1-10): `backend/functions/src/test/project-setup-host-boundary.test.ts` (exactly 1 origin test)
- MI services: `backend/functions/src/services/sharepoint-service.ts`, `graph-service.ts`, `managed-identity-token-service.ts`, `project-requests-repository.ts`, `acknowledgment-service.ts`, `backend/functions/src/utils/table-client-factory.ts`
- AZURE_CLIENT_SECRET removal: `backend/functions/src/config/wave0-env-registry.ts` (P4-03)
- PS scoped service factory: `backend/functions/src/hosts/project-setup/service-factory.ts`
- ADR-0124: `docs/architecture/adr/ADR-0124-project-setup-backend-host-boundary.md`
- Infra readiness tests: `backend/functions/src/test/infra-readiness.test.ts`

### Phase 4 Observability Operationalization and Readiness Proof (2026-03-31, Prompt P4-10)

**Audit of observability/readiness evidence for Project Setup:**

All observability artifacts were classified into evidence categories:

| Artifact | Location | Evidence Category | Operationalized? |
|---|---|---|---|
| KQL query: adapter health | `backend/functions/observability/kql/adapter-health.kql` | Repo artifact, executable locally | No — requires App Insights workspace |
| KQL query: auth/token | `backend/functions/observability/kql/auth-token.kql` | Repo artifact, executable locally | No |
| KQL query: provisioning | `backend/functions/observability/kql/provisioning.kql` | Repo artifact, executable locally | No |
| KQL query: error budget | `backend/functions/observability/kql/error-budget.kql` | Repo artifact, executable locally | No |
| KQL query: notifications | `backend/functions/observability/kql/notification.kql` | Repo artifact, executable locally | No |
| Alert rules (5) | `backend/functions/observability/alerts.json` | Documentary specification | No — requires Azure Monitor deployment |
| Dashboard specifications (4) | `backend/functions/observability/README.md` | Documentary | No — requires Workbook creation |
| Action group config | `backend/functions/observability/alerts.json` | Documentary | No — requires Azure portal setup |
| Teams workflow channels | `backend/functions/observability/README.md` | Documentary | No — requires Power Automate setup |
| DevOps setup checklist | `backend/functions/observability/README.md` | Deployment guidance | All items unchecked |
| Health endpoint | `backend/functions/src/functions/health/index.ts` | **Repo artifact + executable** | **Yes — returns live diagnostic payload** |
| Telemetry wrapper | `backend/functions/src/utils/withTelemetry.ts` | **Repo artifact + executable** | **Yes — emits events on every handler invocation** |
| Structured logger | `backend/functions/src/utils/logger.ts` | **Repo artifact + executable** | **Yes — JSON telemetry to App Insights traces table** |
| Infrastructure readiness tests | `backend/functions/src/test/infra-readiness.test.ts` | **Repo artifact + executable** | **Yes — runs in CI** |
| Health endpoint tests | `backend/functions/src/functions/health/__tests__/health.test.ts` | **Repo artifact + executable** | **Yes — runs in CI** |

**Summary:** 3 observability surfaces are genuinely operationalized from repo alone (health endpoint, telemetry wrapper, structured logger). 5 KQL queries are repo artifacts executable via copy-paste. 5 alert rules, 4 dashboards, action groups, and Teams workflows are documentary specifications requiring DevOps deployment. The DevOps setup checklist has 6 items, all unchecked.

**What is proven from repo:**

1. **Health endpoint** returns tiered diagnostic payload (`operationalReadiness`, `configTiers`, `provisioningPrereqs`) on every `GET /api/health` call — no deployment required beyond the Function App itself
2. **Telemetry events** are emitted by every authenticated handler via `withTelemetry()` wrapper — `handler.invoke`, `handler.success`, `handler.error` events flow to App Insights automatically
3. **Auth telemetry** emits `auth.bearer.success` and `auth.bearer.error` events via middleware
4. **Startup telemetry** emits `startup.mode.resolved` with adapter mode and surface name
5. **Infrastructure tests** verify CORS config, SignalR extension, function timeout, tiered validation exports, and config registry structure — run in CI
6. **KQL queries** are version-controlled and can be executed manually in App Insights

**What remains deployment/environment-dependent:**

1. Azure Monitor alert rules (5 definitions in `alerts.json`) — must be created in Azure portal or via Terraform
2. Azure Monitor Workbooks / App Insights dashboards (4 specified) — must be created from KQL queries
3. Action group `hbi-alert-action-group` — must be created in Azure portal
4. Teams Workflow for alert delivery — must be configured in Power Automate
5. On-call paging mechanism — open decision per observability README
6. Staging alert verification — requires test trigger in staging environment

**Guardrails added against overstated readiness:**

Added an **Evidence Classification** section to `backend/functions/observability/README.md` (P4-10) that:
- Defines four evidence categories: repo artifact, executable from repo, operationalized, documentary
- Explicitly states that none of the alert/dashboard/workflow items are operationalized
- Provides concrete examples of what each claim means ("alerts.json defines 5 rules" ≠ deployed alerting)
- Ties operationalized status to completion of the DevOps Setup Checklist

This makes it structurally harder for future documentation to treat artifact existence as operational proof.

**Remaining operationalization gaps:**

These are not code gaps — they are deployment/operational execution items:
1. No deployed alert rules in Azure Monitor
2. No deployed dashboards/workbooks
3. No configured action group or Teams alert channel
4. No verified staging alert trigger
5. No documented on-call paging mechanism
6. No repo-evidenced proof that any operator has used the health endpoint or triage runbook in a live scenario

**Closure statement:**

Project Setup observability and infrastructure readiness evidence are now categorized truthfully across repo proof, deployment prerequisites, and post-deploy operational verification. Three observability surfaces are genuinely operationalized from repo (health endpoint, telemetry events, structured logging). Documentary artifacts (KQL, alerts, dashboards) exist but are explicitly classified as not operationalized until DevOps deploys them. The observability README now includes an evidence classification guardrail (P4-10) that prevents future docs from treating artifact existence as operational proof. All four P4-10 acceptance criteria are satisfied.

**Evidence:**

- Evidence classification added: `backend/functions/observability/README.md` (P4-10 section)
- KQL queries: `backend/functions/observability/kql/*.kql` (5 files)
- Alert definitions: `backend/functions/observability/alerts.json` (5 rules)
- Health endpoint: `backend/functions/src/functions/health/index.ts`
- Telemetry wrapper: `backend/functions/src/utils/withTelemetry.ts`
- Structured logger: `backend/functions/src/utils/logger.ts`
- Infrastructure tests: `backend/functions/src/test/infra-readiness.test.ts`
- Health tests: `backend/functions/src/functions/health/__tests__/health.test.ts`
- Operational readiness doc: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-4/Phase-4_Operational-Readiness-and-Handoff.md`

### Phase 4 Documentation Reconciliation and Audit Closure (2026-03-31, Prompt P4-11)

**Reconciliation scope:**

Re-audited the Phase 4 section, cross-phase findings, gap analysis, deferred implementation inventory, remediation list, and final status table after P4-07 through P4-10 completed. Updated stale language where findings were resolved, downgraded, or explicitly classified.

**Documents reconciled:**

| Section | Change |
|---|---|
| Phase 4 "Partially implemented items" | 3 items annotated: startup scoping resolved (P4-07/P4-08), observability classified (P4-10), CORS resolved (P4-07/P4-09) |
| Phase 4 "Missing items" | Alert/dashboard item classified (P4-10). Live validation still accurate. |
| Phase 4 "Divergence from plan" | Handoff overstatement reconciled (P4-07). CORS resolved (P4-09). |
| Cross-phase findings: Phase 1/Phase 4 coupling | Updated to reflect frozen architecture, canonical/transitional classification |
| Recurring patterns | Scope isolation and auth convergence marked closed. Observability marked classified. |
| Gap analysis: non-blocking gaps | Observability and deployment-target ambiguity marked resolved |
| Gap analysis: documentation debt | Phases 1-4 handoffs reconciled. Phase 5 still pending. |
| Deferred work executive summary | Blocker count reduced from 5 to 4. CORS/MI/permissions downgraded from blocker to environment-gated prerequisite. |
| Phase 4 CORS/MI deferred item | P4-11 annotation added: repo-owned posture complete, environment-gated remainder. |
| Final status table | Phase 4 summary updated to reflect P4-07 through P4-11 |
| Overall recommendation | Updated to reflect Phase 4 closure progress |

**What is now fully closed for Phase 4 in repo-owned terms:**

1. Infrastructure architecture (P4-07): Dedicated PS host frozen with canonical/transitional classification
2. Deployment-scoped config validation (P4-08): Tiered validation with no over-broad boot blockers
3. CORS/MI/downstream permissions (P4-09): Tenant-specific CORS, pure MI, classified dependencies
4. Observability evidence (P4-10): 15 artifacts categorized, readiness guardrail added
5. Documentation reconciliation (P4-11): Stale audit language corrected, cross-phase findings updated

**What remains outside Phase 4 repo closure:**

1. **Environment-gated:** MI role assignments, CORS portal verification, SharePoint admin consent, Graph permission grants, live deployment cutover to PS host
2. **Operationalization:** DevOps deployment of alert rules, dashboards, action groups, Teams workflows (12 artifacts)
3. **External validation:** Live infrastructure rehearsal, staging smoke run

These are not repo gaps. They are operational execution items documented in the pre-deployment checklist (`Phase-4_Operational-Readiness-and-Handoff.md`).

**Closure statement:**

Phase 4 documentation is reconciled with current repo truth (P4-07 through P4-11). The retained Project Setup infrastructure posture is explicit across deployment-scoped validation, domain-scoped CORS/identity assumptions, and truthful readiness evidence. Observability/readiness claims are categorized across repo proof, deployment prerequisites, and post-deploy operational verification. Phase 4 no longer depends on implicit broader shared-host assumptions to describe retained Project Setup readiness. Unsupported "production-safe" language in the Phase 4 handoff has been annotated with reconciliation context. Phase 4 is **substantially closed** with all repo-owned work complete and environment-gated items explicitly documented.

**Evidence:**

- Phase 4 assessment reconciliation: this section of the audit report (lines 791-835)
- Cross-phase findings updated: section 4 of the audit report
- Gap analysis updated: section 6 of the audit report
- Deferred implementation inventory: section 7B (Phase 4 items annotated)
- Remediation list: section 8 (items #5 and #6 annotated)
- Final status table: section 9 (Phase 4 row updated)
- Phase 4 handoff reconciliation note: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-4/Phase-4_Handoff.md` (P4-07)
- Observability evidence classification: `backend/functions/observability/README.md` (P4-10)
- All P4-07 through P4-10 progress notes in this section

### Phase 5

**Intended objective**

Add final release-hardening: meaningful integration/regression evidence, explicit release gates, diagnostics, deployment and rollback procedures, post-deploy smoke checks, and signoff artifacts that support a production release decision. Plan intent came from `phase-5/Phase-5_Release-Hardening_Action-Plan.md`.

**Confirmed implemented items**

- Release-gate regression tests exist in `backend/functions/src/test/release-gates.test.ts`.
- Request lifecycle integration tests exist in `backend/functions/src/test/request-lifecycle.integration.test.ts`.
- Unsupported-scope regression tests exist in `backend/functions/src/test/unsupported-scope-guard.test.ts`.
- Post-deploy smoke checks exist in `backend/functions/src/test/smoke/post-deploy-smoke.test.ts`.
- Release-gate, deployment, rollback, and signoff docs exist in:
  - `phase-5/Phase-5_Release-Gates-and-Diagnostics.md`
  - `phase-5/Phase-5_Deployment-Runbook.md`
  - `phase-5/Phase-5_Production-Readiness-Signoff.md`
- Related controller/admin surfaces are implemented enough to support multi-surface operational claims:
  - `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
  - `apps/admin/src/pages/ProvisioningOversightPage.tsx`

**Partially implemented items** *(re-verified P5-07, 2026-03-31)*

- Backend release-hardening evidence is strong and current. Backend suite: 51 files passed, 638 tests, 22 skipped. **Still accurate.**
- Frontend/package-level release evidence is weaker than the handoff states. **Re-verified P5-07:** 4 test files fail (10 of 140 tests), including:
  - `apps/estimating/src/test/NewRequestPage.test.tsx` — 5 of 17 fail
  - `apps/estimating/src/test/RequestDetailPage.test.tsx` — 2 of 8 fail
  - `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx` — 2 of 12 fail
  - `apps/estimating/src/test/ProjectSetupUiReviewMode.test.tsx` — 1 of 13 fail *(newly identified — not in original audit)*
  - 15 files pass, 128 tests pass
- Smoke tests exist but remain environment-gated. **Still accurate.**
- Release docs remain procedural, not proven by live deployment. **Still accurate.**

**Missing items** *(re-verified P5-07)*

- No repo-truth evidence of live deployment rehearsal, staging smoke run, or completed signoff. **Still accurate.**
- Frontend test baseline unresolved. **Still accurate — 10 failures across 4 files confirmed.**
- No frontend telemetry. **Still accurate — accepted risk.**

**Divergence from plan** *(re-verified P5-07)*

- `phase-5/Phase-5_Handoff.md` says “Phase 5 Status: COMPLETE.” **Still overstated. P5-07 reconciliation note added.**
- `phase-5/Phase-5_Production-Readiness-Signoff.md` original claims reconciled 2026-03-31 with downgrade note. **No further change needed.**
- Remaining unresolved gaps confirmed: disabled required-field enforcement, 10 failing frontend tests across 4 files, no live deployment/smoke evidence.

**Current status assessment**

**Partial — release scope frozen, frontend baseline and deployment proof remain open (P5-07, 2026-03-31).** Backend release evidence is strong (638 tests, 30 release-specific tests across 4 suites). Frontend baseline has 10 failures across 4 files on the retained launch surface. Live deployment proof and signoff remain environment-gated/operational.

### Phase 5 Release Scope Freeze and Repo-Truth Revalidation (2026-03-31, Prompt P5-07)

**Re-verification against current repo truth:**

All five original Phase 5 audit findings were re-verified:

| Original Audit Finding | Current Status |
|------------------------|----------------|
| Frontend/package-level evidence weaker than docs claim | **Still accurate** — 4 files / 10 tests fail (NewRequestPage 5, RequestDetailPage 2, coordinator 2, UiReviewMode 1) |
| Retained-surface page-level SPFx tests not green | **Still accurate** — additionally discovered ProjectSetupUiReviewMode.test.tsx (1 failure) not in original audit |
| Smoke tests env-gated, not proof of live validation | **Still accurate** — `post-deploy-smoke.test.ts` skips without `SMOKE_TEST_BASE_URL` |
| Signoff docs overstate closure | **Partially stale** — `Production-Readiness-Signoff.md` already reconciled 2026-03-31. `Phase-5_Handoff.md` still says COMPLETE — P5-07 reconciliation note added. |
| Readiness dependencies external/deployment/operational | **Still accurate** — MI grants, CORS verification, admin consent, live staging all remain unproven |

**Canonical retained Project Setup release surface (frozen):**

Backend (20 HTTP routes + 3 timer/SignalR in 8 families):
- `projectRequests` — submit, list, get, advance state (4 routes)
- `provisioningSaga` — orchestrate 7-step provisioning (1 route)
- `timerFullSpec` — deferred step execution (1 timer)
- `signalr` — negotiate + connection info (2 routes)
- `acknowledgments` — workflow handoff (routes)
- `notifications` — dispatch, preferences (routes)
- `health` — diagnostic probe (1 route, unauthenticated)
- `cleanupIdempotency` — maintenance timer (1 timer)

Frontend (6 surfaces):
- New Request wizard page (`NewRequestPage`)
- Request Detail page (`RequestDetailPage`)
- Request List page
- Provisioning status display
- UI-review mode (local data, no backend)
- Production mode (live backend API)

**Phase 5 evidence classification:**

| Evidence | Category | Status |
|---|---|---|
| Release-gate regression tests (13 tests) | Repo-proven | PASSING |
| Request lifecycle integration tests (5 tests) | Repo-proven | PASSING |
| Unsupported-scope guard tests (5 tests) | Repo-proven | PASSING |
| Post-deploy smoke tests (7 tests) | Env-gated | Skipped locally (requires SMOKE_TEST_BASE_URL) |
| Frontend scope guards (7 tests) | Repo-proven | PASSING |
| Frontend mode-switching tests (12 tests) | Repo-proven | PASSING |
| Frontend page-level tests (50 tests across 4 files) | Repo-proven | **10 FAILING** |
| Frontend component/config tests (66 tests across 11 files) | Repo-proven | PASSING |
| Release-Gates-and-Diagnostics.md | Repo-proven procedure | Accurate — gates testable |
| Deployment-Runbook.md | Operational procedure | Accurate — not executed |
| Production-Readiness-Signoff.md | Signoff artifact | Reconciled — original claims downgraded |
| Phase-5_Handoff.md | Handoff artifact | **Overstated** — P5-07 reconciliation note added |
| Live deployment rehearsal | Environment-gated | **Not proven** — no repo evidence |
| Staging smoke run | Environment-gated | **Not proven** — no repo evidence |
| Leadership/IT/operations signoff | Operational | **Not completed** |
| Frontend telemetry | Deferred | Accepted risk (R7) |

**Backend evidence summary (strong):**
- 51 test files, 638 tests passed, 22 skipped, 0 failed
- 30 release-specific tests across 4 dedicated suites (release-gates, lifecycle integration, scope guard, smoke)
- check-types clean, lint 0 errors

**Frontend evidence summary (weak — 10 failures):**
- 19 test files, 128 tests passed, 10 failed, 2 todo
- 4 failing files on retained launch surface:
  - `NewRequestPage.test.tsx`: 5 fail (submit paths, clarification flow, legacy location normalization)
  - `RequestDetailPage.test.tsx`: 2 fail (error shell, SignalR disconnection warning)
  - `RequestDetailPage.coordinator.test.tsx`: 2 fail (retry API call, retry failure banner)
  - `ProjectSetupUiReviewMode.test.tsx`: 1 fail (mode switching without navigation)
- 15 passing files include: bootstrap, router, runtime config, host behavior, scope guards, mode-switching integration, component tests, theme enforcement

**Prior Phase 5 blockers — current status:**

| Blocker (from audit) | P5-07 Status |
|---|---|
| Disabled required-field enforcement | **Still open** — `PROJECT_SETUP_REQUIRED_FIELDS_ENABLED = false` |
| Frontend test baseline unresolved | **Still open** — 10 failures across 4 files confirmed |
| No live deployment proof | **Still open** — environment-gated |
| External SharePoint list alignment unproven | **Still open** — Phase 2 external validation |

**Remaining release-readiness questions:**

1. Are the 10 frontend test failures regressions from recent code changes, test drift from UI component updates, or accepted defects?
2. Should the frontend test baseline be fixed before or after release-scope freeze?
3. Is phased rollout (backend first, frontend separately) an acceptable launch strategy?
4. What is the timeline for live staging deployment and smoke validation?

**Closure statement:**

The retained Project Setup release surface and its evidence model are now explicitly frozen. Backend evidence is strong (638 tests, 30 release-specific, all passing). Frontend evidence has 10 failures across 4 files on the retained launch surface that must be resolved or explicitly accepted before release-scope closure. Release-scope architecture is **frozen** — the canonical surfaces, evidence categories, and remaining gaps are documented. Full Phase 5 closure is NOT supported by current repo truth.

**Evidence:**

- Backend release-gate tests: `backend/functions/src/test/release-gates.test.ts` (13 tests)
- Backend lifecycle integration: `backend/functions/src/test/request-lifecycle.integration.test.ts` (5 tests)
- Backend scope guard: `backend/functions/src/test/unsupported-scope-guard.test.ts` (5 tests)
- Backend smoke: `backend/functions/src/test/smoke/post-deploy-smoke.test.ts` (7 tests, env-gated)
- Frontend failing: `apps/estimating/src/test/NewRequestPage.test.tsx` (5 of 17 fail)
- Frontend failing: `apps/estimating/src/test/RequestDetailPage.test.tsx` (2 of 8 fail)
- Frontend failing: `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx` (2 of 12 fail)
- Frontend failing: `apps/estimating/src/test/ProjectSetupUiReviewMode.test.tsx` (1 of 13 fail)
- Release gates doc: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Release-Gates-and-Diagnostics.md`
- Deployment runbook: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Deployment-Runbook.md`
- Signoff (reconciled): `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Production-Readiness-Signoff.md`
- Handoff (annotated P5-07): `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Handoff.md`

### Phase 5 Retained-Surface Frontend Test Baseline and Stability (2026-03-31, Prompt P5-08)

**Root cause of 10 frontend test failures (identified and fixed):**

All 10 failures shared a single root cause: the `ProjectSetupBackendProvider` fell back to ui-review mode in tests because `getApiToken` was not provided to the provider, causing `checkProductionReadiness()` to fail. This meant tests' mock clients (via `createProvisioningApiClient`) were never used — the ui-review local-storage client was used instead, causing mock assertions to fail.

**Fixes applied:**

| File | Fix | Tests Fixed |
|---|---|---|
| `apps/estimating/src/test/NewRequestPage.test.tsx` | Mock `useProjectSetupBackend` to inject mock client directly | 5 (submit, navigate, error, clarification-return, clarification-submit) |
| `apps/estimating/src/test/RequestDetailPage.test.tsx` | Mock `useProjectSetupBackend` to inject mock client directly | 2 (error shell, SignalR disconnect warning) |
| `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx` | Mock `useProjectSetupBackend` to inject mock client directly | 2 (retry API call, retry failure banner) |
| `apps/estimating/src/test/ProjectSetupUiReviewMode.test.tsx` | Pass `getApiToken` and start in production mode with `allowBackendModeSwitch` so production readiness succeeds when switching | 1 (mode switch) |
| `apps/estimating/src/test/renderWithProviders.tsx` | Added `getApiToken` option; set `functionAppUrl` when `allowBackendModeSwitch` is true | (infrastructure fix) |

**Retained Project Setup frontend release proof set (all green):**

| Test File | Tests | Category |
|---|---|---|
| `NewRequestPage.test.tsx` | 17 | Retained — wizard, draft, submit, clarification |
| `RequestDetailPage.test.tsx` | 8 | Retained — summary, state, failure modes |
| `RequestDetailPage.coordinator.test.tsx` | 12 | Retained — retry, escalation, BIC gating |
| `RequestDetailPage.completion.test.tsx` | 5 | Retained — completion card, siteUrl |
| `ProjectSetupUiReviewMode.test.tsx` | 13 | Retained — ui-review mode, mode switching |
| `mode-switching.integration.test.ts` | 12 | Retained — production/ui-review integration |
| `phase1ScopeGuards.test.ts` | 14 | Retained — scope isolation regression |
| `bootstrap.test.ts` | 3 | Retained — app initialization |
| `runtimeConfig.test.ts` | 7 | Retained — config resolution |
| `uiReviewProjectSetupClient.test.ts` | 7 | Retained — ui-review client |
| `router.test.ts` | 3 | Retained — route handling |
| `hostBehavior.test.ts` | 3 | Retained — host mode |
| `complexity.test.tsx` | 3 | Retained — complexity preference |
| `DepartmentStepBody.test.tsx` | 4 | Retained — step component |
| `ProjectInfoStepBody.test.tsx` | 5 | Retained — step component |
| `ReviewStepBody.test.tsx` | 3 | Retained — step component |
| `TeamStepBody.test.tsx` | 8 | Retained — step component |
| `themeEnforcement.test.tsx` | 3 | Retained — theme compliance |
| `AppRouteSessionState.test.tsx` | 1 | Retained — session-state routing |

**Total: 19 files, 138 tests passed, 0 failed, 2 todo.**

**Verification results:**

| Check | Result |
|---|---|
| `tsc --noEmit` | Clean — 0 errors |
| `eslint` | 0 errors, 65 pre-existing warnings |
| `build` (vite) | Pass — 3627 modules, 1185 kB (338 kB gzip) |
| `test` (vitest) | 19 files, 138 passed, 0 failed, 2 todo |

**Closure statement:**

The retained Project Setup frontend release surface now has a truthful, stable test baseline. All 10 previously failing tests are fixed. The root cause was a test harness gap — mock clients were not injected because the `ProjectSetupBackendProvider` fell back to ui-review mode without `getApiToken`. The fix injects mock clients directly via `useProjectSetupBackend` mock (3 test files) and provides `getApiToken` in the test harness (1 test file + infrastructure). The retained proof set of 138 tests across 19 files is now entirely green.

**Evidence:**

- Fixed: `apps/estimating/src/test/NewRequestPage.test.tsx` (5 tests)
- Fixed: `apps/estimating/src/test/RequestDetailPage.test.tsx` (2 tests)
- Fixed: `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx` (2 tests)
- Fixed: `apps/estimating/src/test/ProjectSetupUiReviewMode.test.tsx` (1 test)
- Infrastructure: `apps/estimating/src/test/renderWithProviders.tsx` (added `getApiToken` option)
- Version bump: `apps/estimating/package.json` (0.2.24 → 0.2.25)

### Phase 5 Smoke Tests, Deployment Runbook, and Operational Proof Categorization (2026-03-31, Prompt P5-09)

**Smoke/deployment evidence classification:**

| Artifact | Category | Repo Status | Operationalized? |
|---|---|---|---|
| `post-deploy-smoke.test.ts` (7 tests) | Env-gated post-deploy verification | Present, version-controlled | No — requires live instance with `SMOKE_TEST_BASE_URL` |
| Health probe smoke (3 tests) | Env-gated, unauthenticated | Present | No — requires deployed Function App |
| Auth rejection smoke (2 tests) | Env-gated, unauthenticated | Present | No — requires deployed Function App |
| Authenticated smoke (2 tests) | Env-gated, requires `AUTH_TOKEN` | Present | No — requires deployed Function App + valid token |
| `Phase-5_Deployment-Runbook.md` | Documentary procedure | Present | No — not executed against any environment |
| `Phase-5_Release-Gates-and-Diagnostics.md` | Pre/deploy/post-deploy gate definitions | Present | Pre-deploy gates executable from repo; deploy/post-deploy gates env-gated |
| `release-gates.test.ts` (13 tests) | **Repo-proven** pre-deploy gate | Present, passing | **Yes — runs in CI** |
| `Phase-5_Production-Readiness-Signoff.md` | Signoff artifact | Present, reconciled | No — unsigned, no leadership/IT/support approval |

**What repo can prove:**
1. Smoke test definitions are correct and executable (7 tests, skipped locally)
2. Pre-deploy release gates pass (13 tests in `release-gates.test.ts`)
3. Deployment runbook procedure is documented and version-controlled
4. Release gate definitions are clear and testable

**What repo cannot prove:**
1. Any live staging or production deployment has succeeded
2. Any smoke test has passed against a deployed environment
3. The deployment runbook has been followed successfully
4. Post-deploy gates have been validated against a live instance
5. Leadership/IT/support have completed signoff

**Guardrails added:**
- Added Evidence Classification block to `post-deploy-smoke.test.ts` (P5-09) stating explicitly that file existence is NOT proof of successful smoke execution
- Classification follows the same pattern established in `backend/functions/observability/README.md` (P4-10)

**Closure statement:**

Project Setup smoke tests and deployment artifacts are now categorized truthfully across repo-present checks, environment-gated execution, and operational post-deploy verification. The smoke test file explicitly states that its existence is not proof of live validation. Pre-deploy release gates are the only fully repo-proven Phase 5 verification — all other deployment proof requires environment execution and recorded evidence.

**Evidence:**

- Smoke test with evidence classification: `backend/functions/src/test/smoke/post-deploy-smoke.test.ts` (P5-09 annotation)
- Pre-deploy release gates: `backend/functions/src/test/release-gates.test.ts` (13 tests, repo-proven)
- Deployment runbook: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Deployment-Runbook.md` (documentary)
- Release gates doc: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Release-Gates-and-Diagnostics.md` (mixed)
- Signoff (reconciled): `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Production-Readiness-Signoff.md` (documentary)

### Phase 5 Release Gates, Signoff Realism, and Decision-Ready Evidence (2026-03-31, Prompt P5-10)

**Release-gate and signoff artifacts re-verified:**

| Artifact | Original Claim | P5-10 Status |
|---|---|---|
| Phase status table in signoff doc | Mixed accuracy (Phases 2-5 statuses stale) | **Updated** — reflects P1-10, P2-11, P3-11, P4-11, P5-07–P5-09 reconciliation |
| "Code-Level Blockers: NONE" | Undermined by 10 frontend test failures | **Now supported** — P5-08 fixed all 10 failures; P5-10 note confirms. |
| Risk R6: "10 pre-existing frontend test failures" | Mischaracterized as pre-existing; actually repo-current failures | **CLOSED** — P5-08 fixed all 10 (root cause: test harness mock injection gap) |
| Decision-ready evidence framing | Absent — no section separating technical/deployment/operational readiness | **Added** — §9 "Decision-Ready Evidence Summary" with 5-layer readiness table |
| Release-Gates-and-Diagnostics.md | Accurate — gates are real, testable, well-scoped | **No change needed** — pre/deploy/post-deploy gates are honest |
| Deployment-Runbook.md | Accurate procedure, not executed | **No change needed** — documentary status unchanged |

**Overstatements removed or downgraded:**

1. Phase status table updated from stale per-phase labels to current reconciled status (all 5 phases)
2. R6 closed instead of accepting a mischaracterized risk
3. "Code-Level Blockers: NONE" annotated with P5-10 note confirming it is now repo-supported
4. Decision-ready evidence section added to separate technical, deployment, operational, and executive signoff layers

**What signoff can be supported from repo truth today:**

- **Technical readiness: YES.** Backend 659 tests green (updated P6-01), frontend 138 tests green, release gates 13 tests green, lifecycle integration 5 tests green. Type-checks and builds clean.
- **Deployment readiness: NO.** 8 deployment prerequisites (D1–D8) all "Pending." Requires Azure/IT/SharePoint admin action.
- **Operational readiness: PARTIAL.** Runbook documented, alert artifacts exist but not deployed, on-call mechanism undecided.
- **Executive signoff: NO.** Signoff form unsigned. No recorded leadership/IT/support approval.

**Remaining external signoff dependencies:**

1. D1–D8 deployment prerequisites completed by DevOps/IT
2. Post-deploy smoke tests passed against live staging with recorded execution log
3. Leadership/IT/support signoff completed on the §10 form
4. Required-field enforcement decision (currently disabled)
5. External SharePoint list contract validation

**Closure statement:**

Project Setup release gates and signoff artifacts are now aligned to retained-surface repo truth (P5-10). The phase status table, risk register, and blocker claims are updated to reflect P5-07 through P5-09 remediation. A decision-ready evidence summary separates technical, deployment, operational, and executive release decision evidence. Former overstatement concerns (stale status table, R6 mischaracterization, missing evidence framing) are closed. The "Code-Level Blockers: NONE" claim is now repo-supported. Remaining gaps are environment-gated (deployment prerequisites) and operational (signoff), not code-level.

**Evidence:**

- Signoff doc updated: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Production-Readiness-Signoff.md` (phase table, R6 closure, Code-Level Blockers note, §9 decision-ready evidence)
- Release gates doc (unchanged — accurate): `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Release-Gates-and-Diagnostics.md`
- Deployment runbook (unchanged — documentary): `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Deployment-Runbook.md`

### Phase 5 Documentation Reconciliation and Audit Closure (2026-03-31, Prompt P5-11)

**Reconciliation scope:**

Re-audited the Phase 5 section, executive summary, cross-phase findings, deferred implementation inventory, remediation list, closure-truth notes, unresolved questions, and final status table after P5-07 through P5-10 completed.

**Documents reconciled:**

| Section | Change |
|---|---|
| Executive summary "Remaining blockers" | Removed stale "Phase 5 claims overstated" and "page-level test issues" language. Updated to reflect P5-08 frontend fix and current environment-gated blockers. |
| Executive summary "Overall status" | Updated from "Phases 4-5 remain blocked" to "Phases 1-4 closed/substantially closed, Phase 5 substantially closed — code-level work complete." |
| Deferred work executive summary | Blocker count reduced from 4 to 3 (frontend test baseline closed by P5-08). Phase 5 docs no longer flagged as unreconciled. |
| Closure-truth notes: Phase 5 | Updated — Handoff annotated (P5-07), signoff updated (P5-10), "Code-Level Blockers: NONE" now repo-supported. |
| Unresolved questions | Frontend test question resolved (P5-08). |
| Overall recommendation | Updated to "Code-level work complete; environment-gated deployment and operational signoff remain." |
| Closing paragraph | Updated to reflect full P5-07 through P5-11 evidence model. |

**What is now fully closed for Phase 5 in repo-owned terms:**

1. Release scope frozen (P5-07): Canonical retained surfaces explicitly identified
2. Frontend test baseline (P5-08): 10 failures fixed, 19 files / 138 tests green
3. Smoke/deployment categorization (P5-09): Evidence classified, guardrail added
4. Release gates/signoff realism (P5-10): Signoff doc updated, R6 closed, decision-ready evidence section added
5. Documentation reconciliation (P5-11): Stale language corrected across executive summary, deferred inventory, closure notes, and final status

**What remains outside Phase 5 repo closure:**

1. **Environment-gated:** 8 deployment prerequisites (D1–D8), live staging smoke execution, CORS portal verification
2. **Operational:** Leadership/IT/support signoff, on-call mechanism, alert deployment
3. **External validation:** Live SharePoint list contract proof
4. **Product decision:** Required-field enforcement (`PROJECT_SETUP_REQUIRED_FIELDS_ENABLED`)

These are not repo gaps. They are deployment, operational, and product decision items.

**Closure statement:**

Phase 5 documentation is reconciled with current repo truth (P5-07 through P5-11). The retained Project Setup release evidence model is now explicit across repo-proven tests (776 total — 638 backend + 138 frontend), bounded environment-gated checks (7 smoke tests, 8 deployment prerequisites), and separately categorized operational signoff activities. Phase 5 no longer depends on overstated handoff/signoff language to describe retained Project Setup readiness. Release-decision artifacts are aligned to truthful retained-surface evidence. Phase 5 is **substantially closed** — all repo-owned code, test, and documentation work is complete. Remaining items are environment-gated, operational, or product decisions.

**Evidence:**

- Executive summary updated: this section of the audit report
- Deferred work summary updated: section 7A
- Closure-truth notes updated: section 7D (Phase 5)
- Unresolved questions updated: section 10 (frontend test question resolved)
- Overall recommendation updated: section 9
- Signoff doc (P5-10): `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Production-Readiness-Signoff.md`
- Handoff (P5-07): `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Handoff.md`
- All P5-07 through P5-10 progress notes in this section

### Phase 6 Persistence Contract, Validation, and Clarification Storage Closure (2026-03-31, Prompt P6-01)

**Scope:** Close the three remaining code-level blockers: clarificationItems storage ceiling, disabled required-field enforcement, and backend validation gap.

**Changes made:**

| Change | Files |
|--------|-------|
| Migrated 4 json-array SP columns from Text (255) to MultiLineText | `projects-list-contract.ts` |
| Added write-path diagnostic guard for json-array field length | `projects-list-mapper.ts` |
| Added multi-item round-trip tests (5 clarification items, 8 UPNs) | `projects-list-mapper.test.ts` |
| Expanded backend validation to 13 required-field checks + format validation | `projectRequests/index.ts` |
| Expanded VALID_PROJECT_STAGES to full domain set (6 stages) | `projectRequests/index.ts` |
| Added 19 backend validation unit tests (F1–F19) | `request-lifecycle.test.ts` |
| Re-enabled required-field enforcement (`true`) | `projectSetupSteps.ts` |
| Added D0 deployment prerequisite for SP column migration | `Phase-5_Deployment-Runbook.md` |

**Decisions:**

1. **clarificationItems storage:** Migrate to MultiLineText (not keep-as-is). Rationale: the UI and state machine explicitly support multiple clarification items, and a single item already approaches the 255-char ceiling. Same migration applied to `supportingEstimatorUpns`, `additionalTeamMemberUpns`, `sageAccessUpns` — all use json-array serialization.
2. **Required-field enforcement:** Re-enable (`true`). Precondition met: the 43-field persistence contract maps every wizard field to SharePoint and the storage ceiling is closed.
3. **Backend validation parity:** Expand `validateSubmission()` to match wizard contract. Direct API submissions now receive the same enforcement as wizard-based submissions.

**Closure statement:**

The persistence contract, required-field enforcement, and clarification storage items are closed in repo-owned code and tests. The remaining deployment prerequisite (D0: SP column migration) is environment-gated and documented in the deployment runbook. No code-level persistence or validation blockers remain.

### Phase 6 Backward Compatibility, Migration, and Test Truthfulness Closure (2026-03-31, Prompt P6-02)

**Scope:** Confirm that legacy-row handling, test truthfulness, and regression guards satisfy Prompt-02's acceptance criteria.

**Re-audit findings:**

All three acceptance criteria were already satisfied by Phase 2 remediation (P2-07 through P2-11) and confirmed stable after P6-01:

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Legacy rows have explicit handling strategy | **Met** | Option A: read-compatible only, no backfill (P2-10). `toDomain()` uses safe defaults for all 17 P2-07 fields. All UI surfaces render undefined fields defensively. |
| Tests distinguish production-path proof from mock-only proof | **Met** | `sp-field-mapping.test.ts` header and test labels explicitly state "not SP proof" (P2-09). Real mapper tests in `projects-list-mapper.test.ts` prove serialization for all 43 fields. Integration test header says "without a live SharePoint backend." |
| Review report reflects real compatibility and test posture | **Met** | Backward-compat finding "Closed" (line 358). Mock-vs-real finding "Closed" (line 365). Legacy row strategy documented with surface-by-surface evidence (P2-10). |

**Regression guards confirmed (5 guards):**

1. Field map size ≥43 (`sp-field-mapping.test.ts`)
2. SELECT_FIELDS size ≥43 (`sp-field-mapping.test.ts`)
3. Serialization strategy validation (`sp-field-mapping.test.ts`)
4. No `field_N` in adapter executable code (`projects-list-mapper.test.ts`)
5. Runtime schema drift detection via `validateSpItem()` (`projects-list-mapper.ts`)

**Post-P6-01 test counts:**

| Suite | Count | Delta from P2 baseline |
|-------|-------|----------------------|
| Backend tests total | 659 passed, 3 skipped (51 files) | +145 from Phase 2 baseline (514) |
| Mapper tests | 41 (was 39, +2 P6-01 overflow tests) | +11 from Phase 2 |
| Field mapping contract tests | 9 | Unchanged |
| Request lifecycle tests | 70 (was 51, +19 P6-01 validation tests) | +19 from P5 baseline |

**Closure statement:**

Prompt-02 is closed. No code changes required — the backward-compatibility strategy, test truthfulness restructuring, and regression guards were completed during Phase 2 remediation and remain sound after P6-01's contract and validation changes. The test suite accurately distinguishes real mapper proof (43-field serialization) from mock-only proof (in-memory round-trip), and 5 regression guards prevent silent field loss.

### Phase 6 Auth Convergence, Preferences Endpoint, and Proxy Scope Closure (2026-03-31, Prompt P6-03)

**Scope:** Close the four Phase 1/3 auth-related deferred items: deprecated session-token helpers, RBAC convergence, complexity preferences mismatch, and proxy scope.

**Item-by-item closure:**

| Item | Prior Status | P6-03 Status | Action Taken |
|------|-------------|-------------|-------------|
| Deprecated session-token helpers | Closed (P3-09) | **Confirmed closed** | Re-verified: no retained PS surface uses deprecated `resolveSessionToken()`. Accounting (2 pages) and admin (4 files) on `createSessionTokenFactory()`. |
| RBAC convergence | Explicitly deferred | **Documented as intentional posture** | JWT auth + UPN env-list role assignment is the intended PS release model. Future convergence to JWT app-roles is acceptable follow-on. |
| Complexity preferences backend | Explicitly deferred | **Closed — frontend expectation retired** | `ComplexityProvider.enableApiSync` prop added (default `false`). All consumers now use localStorage-only by default. Zero failed HTTP requests to non-existent endpoint. |
| Proxy scope | Decided (P3-10) | **Confirmed closed** | Re-verified: proxy excluded from PS host, handler annotated, boundary test proves exclusion. |

**Code changes:**

| File | Change |
|------|--------|
| `packages/complexity/src/context/ComplexityProvider.tsx` | Added `enableApiSync` prop (default `false`). API sync and `patchPreference()` fire-and-forget calls gated behind this prop. |
| `packages/complexity/src/__tests__/ComplexityProvider.test.tsx` | Updated 4 API-dependent tests to pass `enableApiSync`. Added new test verifying no fetch calls when `enableApiSync` is false. |

**Acceptance criteria met:**

1. Retained surfaces converge on canonical auth posture — JWT + UPN env-list model documented as intentional.
2. Deprecated session-token paths removed from retained surfaces — confirmed (P3-09, re-verified P6-03).
3. Preferences backend contract mismatch closed — `enableApiSync` defaults to `false`, eliminating silent API failures.
4. Proxy posture not ambiguous — excluded from PS host with boundary test proof (P3-10, re-verified P6-03).

**Closure statement:**

All four Prompt-03 items are closed. The auth posture for Project Setup is canonical: JWT authentication via Entra ID MSAL, role assignment via `ADMIN_UPNS`/`CONTROLLER_UPNS` env lists, `createSessionTokenFactory()` on all retained surfaces. The preferences mismatch is resolved by retiring the frontend API expectation (localStorage-only default). The proxy is excluded from PS release scope.

### Phase 6 Deployment Target Cutover and Environment Proof (2026-03-31, Prompt P6-04)

**Scope:** Close the deployment-truth gap by making the Project Setup deployment target explicit and categorizing all environment-gated prerequisites by proof tier.

**Deployment-target truth statement:**

The dedicated Project Setup host (`backend/functions/src/hosts/project-setup/`) is the canonical release target per ADR-0124. The repo-owned posture is complete: composition root (8 route families), service factory (9 scoped services), host.json (tenant-specific CORS), RELEASE-SCOPE.md (machine-checkable manifest), and 63 boundary regression tests. The monolithic host (`backend/functions/src/index.ts`) is explicitly transitional. Which host is actually deployed in the live environment remains external proof — the CI/CD pipeline targets generic Function App names.

**Environment prerequisites evidence table:**

| Prerequisite | Proof Tier | Repo Evidence | Post-Deploy Verification |
|-------------|-----------|---------------|-------------------------|
| Dedicated PS host exists as canonical target | **Repo-verified** | 63 boundary tests, ADR-0124, RELEASE-SCOPE.md | — |
| Host.json CORS (tenant-specific, no wildcards) | **Repo-verified** | AC-5 tests, release gates 2a-2b | `GET /api/health` confirms host is running |
| JWT validation against `API_AUDIENCE` | **Repo-verified** | `auth-contract.test.ts`, release gate 3 | `GET /api/project-setup-requests` returns 401 unauthenticated |
| Config startup gate (6 core vars) | **Repo-verified** | `validateProjectSetupStartupConfig()`, release gate 4b | `operationalReadiness: blocked` if core missing |
| Domain-scoped startup validation | **Repo-verified** | AC-6 boundary tests, provisioning validated at saga time only | `configTiers` section in health response |
| Health endpoint with tiered diagnostics | **Repo-verified** | Release gate 5, 11 tests in health suite | `GET /api/health` → `operationalReadiness` + `configTiers` + `provisioningPrereqs` |
| Entra ID app registration (`api://<client-id>`) | **Not yet proven** | — | Authenticated request succeeds (runbook Phase C step 3) |
| SharePoint admin consent | **Not yet proven** | — | SPFx webpart acquires token and calls API |
| MI → `Storage Table Data Contributor` | **Not yet proven** | — | Table Storage operations succeed |
| MI → `Sites.FullControl.All` on SharePoint | **Not yet proven** | — | `provisioningPrereqs.graphPermission` in health |
| MI → `Group.ReadWrite.All` on Graph | **Not yet proven** | — | Provisioning saga group creation succeeds |
| D0: SP column migration (4 json-array cols) | **Not yet proven** | Runbook D0 prerequisite (P6-01) | `toDomain()` succeeds for multi-item arrays |
| Live Function App runs dedicated host entry | **Not yet proven** | — | Health endpoint responds at expected URL |
| Staging smoke test execution | **Not yet proven** | Smoke suite exists: `post-deploy-smoke.test.ts` | Runbook Phase C step 4 |

**Repo-side verification package (machine-checkable, pre-deploy):**

| Evidence | Test File | Count |
|----------|-----------|-------|
| Release gates | `release-gates.test.ts` | 13 gates |
| Host boundary regression | `project-setup-host-boundary.test.ts` | 63 tests |
| Auth release readiness | `auth-release-readiness.test.ts` | 5 tests |
| Request lifecycle | `request-lifecycle.test.ts` | 70 tests |
| Mapper contract | `projects-list-mapper.test.ts` | 41 tests |
| Field mapping contract | `sp-field-mapping.test.ts` | 9 tests |
| Frontend retained baseline | `apps/estimating/src/test/` | 138 tests |

**Acceptance criteria met:**

1. Deployment-target posture is explicit — dedicated PS host is canonical, monolithic is transitional, cutover is environment-gated.
2. Dedicated-host cutover is truthfully classified — repo-verified architecture, environment-applied deployment.
3. Environment-gated auth/infrastructure prerequisites are categorized by proof tier with post-deploy verification paths.
4. The review report reflects repo truth — no ambiguous deployment assumptions remain.

**Closure statement:**

Prompt-04 is closed. The deployment-truth gap is resolved by explicit proof-tier categorization. Every environment prerequisite has a defined repo evidence level and a post-deploy verification path. The 14 environment prerequisites are split: 6 are repo-verified (architecture, CORS, JWT, config gates, health diagnostics), 8 require environment-level application (app registration, admin consent, MI grants, column migration, deployment target, smoke execution). No code changes required — the repo-owned deployment infrastructure (dedicated host, tiered validation, health diagnostics, release gates, boundary tests) was already complete.

### Phase 6 Observability, Notification Transport, and Provisioning Maturity Closure (2026-03-31, Prompt P6-05)

**Scope:** Close the remaining infrastructure and operational hardening debt by making observability, notification transport, and provisioning maturity postures explicit and decision-useful.

**Observability posture (decision-useful summary):**

| Layer | What Exists | Operationalized? | PS Launch Required? |
|-------|------------|-----------------|-------------------|
| Runtime diagnostics | Health endpoint with `operationalReadiness` tiers, `configTiers`, `provisioningPrereqs` | **Yes** | Yes — post-deploy verification path |
| Runtime telemetry | `withTelemetry` middleware on all HTTP handlers → App Insights | **Yes** | Yes — production telemetry |
| Runtime logging | `createLogger` with correlation IDs and structured context | **Yes** | Yes — operational troubleshooting |
| KQL query library | 5 queries (adapter-health, auth-token, provisioning, error-budget, notification) | Repo-executable | No — useful but not gating |
| Alert rule definitions | 5 rules in `alerts.json` (P1–P3 severity) | Documentary only | No — DevOps follow-on |
| Dashboard/workbook specs | 4 workbooks referenced in README | Documentary only | No — DevOps follow-on |
| Action group / Teams routing | Spec in alerts.json; checklist in README | Documentary only | No — DevOps follow-on |

**Decision:** Runtime observability (health, telemetry, logger) is sufficient for PS launch. Alerting and dashboards are recommended post-launch DevOps tasks.

**Notification transport posture:**

| Channel | Status | PS Launch? |
|---------|--------|-----------|
| In-app notification queue (`hbc-notifications-queue`) | **Operational** | Yes |
| Provisioning saga dispatch (non-blocking to submitter/controller/admin) | **Operational** | Yes |
| SignalR real-time push (provisioning progress) | **Operational when configured** | Yes (degrades gracefully) |
| Health endpoint diagnostic reporting | **Operational** | Yes |
| Email (SendGrid) | **Phase 1 stub** — console.log only | No — explicitly out of scope |
| Digest email (hourly) | **Stubbed** | No — explicitly out of scope |

**Decision:** Email delivery is explicitly out of PS launch scope. In-app notifications, saga dispatch, SignalR, and health endpoint provide adequate operator visibility. Email integration is post-launch follow-on requiring `SENDGRID_API_KEY` and real `emailDelivery.ts` implementation.

**Provisioning maturity:**

All 7 provisioning saga steps are implemented with retry (3 attempts, 2s base delay), compensation (reverse-order unwind for steps 1–4 and 7), idempotency guards, and comprehensive telemetry. Step 5 (web parts) defers to overnight timer after 2 immediate timeout attempts — saga continues to steps 6–7 while step 5 is pending. `validateProvisioningPrerequisites()` fails fast at saga start for 7 environment variables. Provisioning maturity is **code-complete**.

**Acceptance criteria met:**

1. Observability posture is explicit and decision-useful — 3 runtime assets operational, 9 DevOps-gated with deployment checklist.
2. Notification transport posture is explicit — in-app queue is supported transport, email is out of PS launch scope with documented alternative channels.
3. Provisioning maturity is closed — all 7 steps, prerequisites validation, compensation, Step 5 timer deferral, non-blocking dispatch.
4. Review report reflects updated operational truth — all three deferred items reclassified with evidence tables.

**Closure statement:**

Prompt-05 is closed. No code changes required — all three areas (observability, notification transport, provisioning maturity) are code-complete. The remaining operational gaps are truthfully categorized: observability alerting/dashboards are DevOps deployment tasks, email delivery is explicitly out of PS launch scope with in-app alternatives proven, and provisioning maturity is fully implemented with 7 saga steps, compensation, and fail-fast prerequisite validation.

## 4. Cross-Phase Findings

### Dependencies spanning multiple phases

- Phase 1 isolation and Phase 4 startup scoping are directly coupled. The backend boundary freeze (ADR-0124, 2026-03-31) produced a dedicated Project Setup host under `backend/functions/src/hosts/project-setup/**`. **P4-07 through P4-11 reconciliation:** The dedicated host is now the canonical deployment target with frozen architecture, deployment-scoped validation, tenant-specific CORS, and pure MI. The monolithic host is explicitly transitional. The remaining cross-phase gap is deployment cutover truth — repo evidence does not show which host is actually exercised in live deployment.
- Phase 2 no longer gates Phase 5 through missing repo-owned code or tests. The remaining cross-phase dependency is external validation: repo truth does not independently prove that the live SharePoint `Projects` list currently matches the repo-owned 43-field contract.
- Phase 3 production-mode safety depends on Phase 4 deployment/configuration truth. **Code-level Phase 3 findings are closed (P3-07 through P3-11).** Actual production readiness still depends on external environment configuration (API_AUDIENCE, SharePoint admin consent, MI grants) — these are deployment prerequisites, not code gaps.

### Recurring patterns of incompletion or drift

- Several phase handoffs declare `COMPLETE` even where the live repo still contains explicit transitional markers, accepted risks, or architectural incompletion. *(P4-11: Phase 4 handoff annotated. P5-07: Phase 5 handoff annotated with reconciliation note. Production-Readiness-Signoff.md previously reconciled 2026-03-31.)*
- A recurring pattern is “correct seam introduced, but not finished end-to-end.” This is true for:
  - ~~scope isolation~~ **CLOSED (P1-07 through P1-10)**
  - field mapping *(Phase 2: repo-owned closed, external list unproven)*
  - ~~auth convergence~~ **CLOSED (P3-07 through P3-11)**
  - ~~observability operationalization~~ **CLASSIFIED (P4-10)** — now explicitly categorized, no longer vaguely incomplete
  - release evidence *(Phase 5: release scope frozen P5-07, but frontend baseline and deployment proof still incomplete)*
- Mock-backed tests and local review pathways improve developer confidence but can overstate production readiness when the real production path remains incomplete.

### Places where later work invalidated earlier assumptions

- The repository no longer fits a single-host reading. It now contains both a scoped Project Setup host and the preserved monolithic host. Earlier “shared host only” assumptions are stale, but they were not fully replaced by repo-evidenced deployment cutover.
- `ui-review` mode became a major live workflow surface after the phase-doc baseline. This is an acceptable product divergence, but it also means some “production-safe” claims have to be interpreted in a two-mode system, not a single live-backend path.
- The current-state map shows later W0-G3/W0-G4/W0-G5 work as the stronger source of truth for actual Project Setup implementation surfaces than the phase handoff docs alone.

## 5. Implementation Confirmed in Repo Truth

The following items are genuinely implemented in the current repo:

- Project Setup-only requester route tree and simplified shell in `apps/estimating/src/router/**`
- App-local backend boundary with live vs `ui-review` switching in `apps/estimating/src/project-setup/backend/**`
- Feature-local wizard module in `packages/features/estimating/src/project-setup/**`
- Centralized provisioning state, BIC config, handoff config, and lifecycle utilities in `packages/provisioning/src/**`
- Centralized SharePoint field map and mapper for the Projects list in `backend/functions/src/services/projects-list-contract.ts` and `backend/functions/src/services/projects-list-mapper.ts`
- SharePoint-backed request repository adapter in `backend/functions/src/services/project-requests-repository.ts`
- Auth middleware and validator in `backend/functions/src/middleware/auth.ts` and `backend/functions/src/middleware/validateToken.ts`
- Auth-protected Project Setup request routes in `backend/functions/src/functions/projectRequests/index.ts`
- Auth-protected SignalR negotiate endpoint in `backend/functions/src/functions/signalr/index.ts`
- Tiered config validation and diagnostic health probe in `backend/functions/src/utils/validate-config.ts` and `backend/functions/src/functions/health/index.ts`
- Managed-identity-based backend service posture in `backend/functions/src/services/service-factory.ts` and related services
- Controller review and admin oversight surfaces in `apps/accounting/src/pages/ProjectReviewQueuePage.tsx` and `apps/admin/src/pages/ProvisioningOversightPage.tsx`
- Version-controlled release docs, runbooks, KQL queries, and alert definitions under `docs/architecture/plans/MASTER/.../phase-5/**` and `backend/functions/observability/**`

## 6. Gap Analysis

### Launch blockers

- **Live SharePoint list alignment is not repo-evidenced.**
  - Repo-owned code and tests now align to a 43-field contract, but the repo does not contain a checked-in schema export or live integration proof showing that the external SharePoint `Projects` list currently exposes that same contract.
  - Evidence: `backend/functions/src/services/projects-list-contract.ts`, `backend/functions/src/services/projects-list-mapper.ts`, `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-2/Prompt-07_Phase-2-Canonical-Contract-and-Schema-Reconciliation.md`.
- ~~**Required-field enforcement is intentionally disabled.**~~ **CLOSED (P6-01, 2026-03-31).**
  - `PROJECT_SETUP_REQUIRED_FIELDS_ENABLED = true` in `packages/features/estimating/src/project-setup/config/projectSetupSteps.ts`.
  - Backend `validateSubmission()` expanded to match the wizard's 11 required fields plus format checks for department and projectStage.
  - `VALID_PROJECT_STAGES` expanded from `['Pursuit', 'Active']` to the full domain set: `['Lead', 'Pursuit', 'Preconstruction', 'Construction', 'Closeout', 'Warranty']`.
- **~~Backend package is not truly isolated to Project Setup scope.~~ CLOSED (Prompts 07-10, 2026-03-31).**
  - Original evidence: `backend/functions/src/index.ts`, `backend/functions/src/services/service-factory.ts`.
  - Dedicated Project Setup host created at `backend/functions/src/hosts/project-setup/` with scoped composition root, service factory, domain-specific host.json, domain-scoped config validation, and release-scope manifest. All 10 acceptance criteria (AC-1 through AC-10) satisfied. 63 boundary regression tests. Architecture decision: ADR-0124.
- **Frontend/package-level release evidence is not green.**
  - Current `@hbc/spfx-project-setup` package test invocation still exposes failing page-level tests, which undercuts the Phase 5 “complete” claim.
- **No repo proof of live deployment validation.**
  - Smoke tests are env-gated; there is no checked-in evidence of successful staging or production validation.

### Important but non-blocking gaps

- Deprecated or transitional auth code still exists in `apps/estimating/src/utils/resolveSessionToken.ts`. *(P3-09: narrowed to dev-harness-only; not used by any retained surface.)*
- Cross-surface RBAC/auth convergence remains incomplete across requester, controller, and admin surfaces. *(P3-09: future follow-on, not a blocker.)*
- Proxy integration remains a stub in `backend/functions/src/functions/proxy/proxy-handler.ts`. *(P3-10: explicitly excluded from PS release scope.)*
- ~~Observability artifacts exist, but dashboards/alerts are not proven deployed.~~ **CLASSIFIED (P4-10).** Evidence classification guardrail added. 3 of 15 artifacts operationalized from repo (health, telemetry, logger). DevOps deployment required for remaining 12.
- ~~Deployment-target posture remains partly ambiguous.~~ **RESOLVED (P4-07, P4-09).** PS host is canonical (ADR-0124). Monolithic host is explicitly transitional. No ambiguity remains in repo classification.

### Cleanup / documentation debt

- ~~Phase handoff docs overstate completion and production readiness relative to current repo truth.~~ **RECONCILED for Phases 1-5.** Phase 1 handoff annotated (P1-10). Phase 3 handoff annotated (P3-11). Phase 4 handoff annotated (P4-07). Phase 5 handoff annotated (P5-07). Production-Readiness-Signoff.md previously reconciled 2026-03-31.
- Some phase docs still speak as if external SharePoint schema proof lives inside the repo, but the repo currently contains code comments and handoff notes rather than a checked-in schema export artifact. *(Phase 2 status unchanged.)*
- ~~Release/readiness docs should be reconciled with current repo state before they are used as signoff artifacts.~~ **SUBSTANTIALLY ADDRESSED.** Phase 4 docs reconciled (P4-07 through P4-11). Phase 5 handoff annotated (P5-07). Production-Readiness-Signoff.md previously reconciled. Release-scope frozen with evidence classification.

## Deferred Implementations Across Phases 1–5

### A. Executive summary of deferred work

Fifteen deferred or not-clearly-complete implementation items remain across all five phase families. Every phase still contains some deferred work when the updated phase docs are reconciled against live repo truth, even though Phase 1’s core scope boundary is materially closed and Phase 2’s repo-owned code/test findings are materially repaired.

**P4-11 reconciliation update:** Phase 4 infrastructure findings are now substantially closed (P4-07 through P4-10). The deployment-scoped CORS / MI / downstream-permission item is no longer ambiguous — the repo-owned model is frozen and classified, though environment-level application remains external. Observability operationalization is explicitly categorized rather than vaguely incomplete. The effective launch blocker count from Phase 4 is reduced: what remains is environment-gated deployment proof, not repo-level infrastructure gaps.

**P5-11 reconciliation update:** The frontend test baseline blocker is closed (P5-08). Phase 5 documentation is reconciled (P5-07 through P5-11). Three deferred items remain launch blockers: unresolved production auth/deployment prerequisites (environment-gated, Phases 3-4), the absence of repo-evidenced live smoke / deployment execution (Phase 5), and the lack of completed real signoff evidence (Phase 5). The remaining items are non-blocking follow-up, hardening debt, or external validation items.

The strongest cross-phase dependencies are: external live-list validation for the Phase 2 contract, and Phase 3/4 environment prerequisites gating production-mode claims. Phase 5 documentation is now reconciled against repo truth.

### B. Detailed deferred-implementation inventory

#### Phase 1 deferred implementations

- **Item:** ~~Complexity preferences backend contract~~ **CLOSED (P6-03, 2026-03-31)**
  **Category:** Code / integration
  **Status:** Closed — frontend API expectation retired
  **Resolution:** The `ComplexityProvider` API sync is now opt-in (`enableApiSync` prop, default `false`). When disabled (the default for all current consumers), the provider uses localStorage/sessionStorage only and makes zero network requests to `/api/users/me/preferences`. The API client code is retained for future use when a preferences backend is deployed. No consumer currently passes `enableApiSync={true}`.
  **Repo-truth evidence:** `packages/complexity/src/context/ComplexityProvider.tsx` (P6-03: `enableApiSync` prop); `packages/complexity/src/__tests__/ComplexityProvider.test.tsx` (new test: "does not call fetch when enableApiSync is false")
  **Cross-phase impact:** The mismatch between frontend expectation and backend reality is resolved. The complexity package no longer silently fails against a non-existent endpoint.

- **Item:** Dedicated host cutover and monolithic-host retirement proof
  **Category:** Infrastructure / deployment
  **Status:** Repo-configured and repo-verified; deployment-target application is environment-gated (P6-04)
  **P6-04 proof-tier classification:**

  | Aspect | Proof Tier | Evidence |
  |--------|-----------|----------|
  | Dedicated PS host exists as canonical target | **Repo-verified** | `backend/functions/src/hosts/project-setup/index.ts` (8 route families); ADR-0124; RELEASE-SCOPE.md; 63 boundary tests |
  | Monolithic host classified as transitional | **Repo-verified** | `backend/functions/src/index.ts` (still registers all 19 families); ADR-0124 establishes per-domain host model |
  | Host.json runtime contract (CORS, timeout, SignalR) | **Repo-configured** | `backend/functions/src/hosts/project-setup/host.json` (tenant-specific CORS, 10-min timeout, credentials required) |
  | CI/CD pipeline targets dedicated host | **Not yet proven** | `.github/workflows/deploy-functions.yml` uses generic Function App names; deployment-target binding is external |
  | Live Function App runs dedicated host entry point | **Not yet proven** | Requires Azure portal or IaC confirmation |

  **Blocker level:** Environment-gated prerequisite (repo-owned posture is complete)
  **Recommended next-step direction:** Record environment-level proof that the live Function App uses the Project Setup host entry point (`backend/functions/src/hosts/project-setup/index.ts`), or document that the monolithic host remains the operational target until cutover.

- **Item:** Phase 1’s deferred provisioning-maturity work remains only partially closed
  **Category:** Infrastructure / operational hardening
  **Status:** Substantially closed in repo-owned code; residual items reclassified (P6-05)
  **P6-05 reclassification:** The provisioning maturity originally deferred from Phase 1 has been materially addressed across Phases 1–6:

  | Sub-item | Original Deferral | Current Status |
  |----------|------------------|----------------|
  | Steps 5/6/7 hardening | Phase 1 handoff deferred | **Closed** — all 7 saga steps implemented with retry, compensation, idempotency, and telemetry |
  | Step 5 timer-based deferral | Not in original scope | **Closed** — `timerFullSpec` function handles overnight retry for web-parts timeout |
  | Prerequisites validation | Not in original scope | **Closed** — `validateProvisioningPrerequisites()` fails fast at saga start for 7 env vars |
  | Email delivery | Phase 1 stub | **Explicitly out of PS launch scope** — console.log stub; in-app notifications are the supported transport (P6-05) |
  | Alerting/observability | Phase 1 not started | **Repo-artifact complete, DevOps-gated** — KQL, alerts.json, evidence framework in repo; deployment external (P4-10, P6-05) |
  | Live deployment proof | Phase 1 not started | **Environment-gated** — categorized by proof tier (P6-04) |

  **Blocker level:** Non-blocking — provisioning code is complete; residual items are operational/DevOps-gated
  **Repo-truth evidence:** `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` (7 steps); `backend/functions/src/functions/timerFullSpec/` (Step 5 deferral); `backend/functions/src/utils/validate-config.ts` (prerequisites); `backend/functions/observability/` (repo artifacts)

#### Phase 2 deferred implementations

- **Item:** Live SharePoint `Projects` list contract proof
  **Category:** Data contract / environment-gated validation
  **Status:** External / Not Repo-Evidenced
  **Why it is still deferred:** Repo-owned code and tests now align to a 43-field contract, but the repo does not contain a checked-in schema export or live integration evidence proving that the external SharePoint list currently exposes the same columns.
  **Repo-truth evidence:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-2/Prompt-07_Phase-2-Canonical-Contract-and-Schema-Reconciliation.md`; `backend/functions/src/services/projects-list-contract.ts`
  **Affected files/surfaces:** external SharePoint list, release validation, Phase 5 signoff truth
  **Blocker level:** Important but non-blocking
  **Cross-phase impact:** Keeps end-to-end Phase 2 closure partly external even though the repo-owned code path is repaired.
  **Recommended next-step direction:** Capture and retain environment-level proof that the live list matches the repo-owned 43-field contract.

- **Item:** ~~`clarificationItems` storage ceiling~~ **CLOSED (P6-01, 2026-03-31)**
  **Category:** Data contract / scale follow-up
  **Status:** Closed
  **Resolution:** All four json-array Phase 2 gap fields (`supportingEstimatorUpns`, `additionalTeamMemberUpns`, `sageAccessUpns`, `clarificationItems`) migrated from SP Text (255-char limit) to MultiLineText (~63k chars) in the repo-owned field contract. This matches the established pattern used by the legacy CSV-import json-array fields (`groupMembers`, `groupLeaders`, `viewerUPNs`, `addOns`). Write-path diagnostic guard added to `toListItem()`. Round-trip tests added for multi-item arrays exceeding the former 255-char ceiling.
  **Repo-truth evidence:** `backend/functions/src/services/projects-list-contract.ts` (spType changed to MultiLineText); `backend/functions/src/services/projects-list-mapper.ts` (diagnostic guard); `backend/functions/src/services/__tests__/projects-list-mapper.test.ts` (P6-01 overflow tests)
  **Deployment prerequisite:** The four columns must also be migrated from Text to Note (MultiLineText) in the live HBCentral Projects list — documented as D0 in `Phase-5_Deployment-Runbook.md`.

#### Phase 3 deferred implementations

- **Item:** ~~Deprecated session-token helper removal~~ **CLOSED (P3-09, 2026-03-31)**
  **Category:** Auth / cleanup
  **Status:** Closed
  **Resolution:** Accounting (2 pages) and admin (4 files) migrated from `resolveSessionToken()` to `createSessionTokenFactory()`. Estimating's deprecated function narrowed to dev-harness-only. No retained surface uses the deprecated single-capture pattern.

- **Item:** Cross-surface auth convergence and RBAC unification
  **Category:** Auth / authorization
  **Status:** Documented as intentional PS release posture (P6-03)
  **P6-03 posture decision:** The dual-model RBAC split is the intended production posture for the Project Setup release. JWT (Entra ID MSAL) provides authentication for all retained surfaces. Role assignment uses `ADMIN_UPNS` and `CONTROLLER_UPNS` environment variables, resolved at runtime by `resolveRequestRole()` in `state-machine.ts`. This split is practical: JWT proves identity, env-list-based role resolution provides operator-configurable privilege without requiring Entra ID app-role provisioning. Full RBAC convergence to JWT app-roles is a future follow-on, not a PS release blocker.
  **Repo-truth evidence:** `backend/functions/src/state-machine.ts` (resolveRequestRole, lines 36-48); `backend/functions/src/middleware/auth.ts` (withAuth JWT validation); `backend/functions/src/middleware/auth-contract.test.ts` (all routes protected); all retained surfaces migrated to `createSessionTokenFactory()` (P3-09)
  **Blocker level:** Non-blocking — documented intentional posture
  **Cross-phase impact:** No longer a gap. The current model is the PS release model. Future RBAC convergence to JWT app-roles is acceptable follow-on.

- **Item:** ~~Proxy-route implement-or-remove decision~~ **DECIDED (P3-10, 2026-03-31)**
  **Category:** Code / scope cleanup
  **Status:** Closed — proxy excluded from Project Setup release scope
  **Resolution:** Proxy explicitly excluded from PS domain host (boundary test proves this). Handler annotated "NOT IN PROJECT SETUP RELEASE SCOPE." Remains in legacy monolithic host only. Future: implement for real Graph forwarding or retire from monolithic host.

- **Item:** Production auth deployment prerequisites
  **Category:** Auth / environment-gated deployment
  **Status:** Repo-configured and repo-verified; environment application is external (P6-04)
  **P6-04 proof-tier classification:**

  | Prerequisite | Proof Tier | Repo Evidence |
  |-------------|-----------|---------------|
  | JWT validation against `API_AUDIENCE` | **Repo-verified** | `validateToken.ts` validates JWT; `auth-contract.test.ts` proves all routes protected; release gate 3 |
  | SPFx Bearer token acquisition | **Repo-configured** | `apps/estimating/src/mount.tsx` acquires audience-scoped token via `aadTokenProviderFactory` |
  | Config startup gate for 6 core vars | **Repo-verified** | `validateProjectSetupStartupConfig()` fails startup if missing; release gate 4b; health endpoint reports `blocked` |
  | Entra ID app registration (`api://<client-id>`) | **Not yet proven** | Requires Azure AD admin action; no repo-owned verification possible |
  | SharePoint admin consent for SPFx API access | **Not yet proven** | Requires SharePoint admin center action |
  | MI role assignments (Graph, SharePoint, Table Storage) | **Not yet proven** | Requires Azure portal / IT; health endpoint reports `provisioningPrereqs` status |
  | CORS settings applied in live Function App | **Not yet proven** | host.json is repo-configured; Azure portal application required |

  **Blocker level:** Environment-gated prerequisite (all code paths implemented and tested; environment application is external)
  **Health endpoint verification:** `GET /api/health` reports `operationalReadiness: blocked` if core config missing, `degraded` if SharePoint/provisioning incomplete, `ready` when all tiers satisfied. This provides a machine-readable post-deploy verification path.
  **Recommended next-step direction:** Execute Phase-5_Deployment-Runbook.md Phase C (post-deploy validation) against the target environment and record the health endpoint output as deployment proof.

#### Phase 4 deferred implementations

- **Item:** Observability operationalization
  **Category:** Operationalization / observability
  **Status:** Repo-artifact complete; deployment is DevOps-gated (P6-05)
  **P6-05 observability asset inventory:**

  | Asset | Category | Operationalized? | Evidence |
  |-------|----------|-----------------|----------|
  | Health endpoint (`GET /api/health`) | Runtime diagnostic | **Yes** | Returns `operationalReadiness`, `configTiers`, `provisioningPrereqs`, `integrations`, `roleConfig` |
  | Telemetry middleware (`withTelemetry`) | Runtime telemetry | **Yes** | Wraps all HTTP handlers; pushes to App Insights |
  | Structured logger (`createLogger`) | Runtime logging | **Yes** | Contextual logging with correlation IDs |
  | KQL: `adapter-health.kql` | Repo-executable | No | Copy-paste to App Insights Log Analytics |
  | KQL: `auth-token.kql` | Repo-executable | No | Copy-paste to App Insights Log Analytics |
  | KQL: `provisioning.kql` | Repo-executable | No | Copy-paste to App Insights Log Analytics |
  | KQL: `error-budget.kql` | Repo-executable | No | Copy-paste to App Insights Log Analytics |
  | KQL: `notification.kql` | Repo-executable | No | Copy-paste to App Insights Log Analytics |
  | Alert rules (`alerts.json`, 5 rules) | Documentary | No | Requires Azure Monitor alert rule creation |
  | Dashboard specs (4 workbooks) | Documentary | No | Requires Azure Monitor Workbook creation |
  | Action group (`hbi-alert-action-group`) | Documentary | No | Requires Azure Monitor action group creation |
  | Teams Workflow routing | Documentary | No | Requires Power Automate + Teams channel config |

  **Operationalization decision (P6-05):** The 3 runtime-operationalized assets (health, telemetry, logger) provide sufficient observability for PS launch. The remaining 9 assets are DevOps deployment tasks documented in the observability README checklist (6 items). Deploying the alerting/dashboard stack is recommended post-launch but is not a code blocker.
  **Blocker level:** Non-blocking — runtime observability is operational; alerting/dashboards are DevOps follow-on
  **P4-07 update:** Classified as documentary infrastructure.
  **P4-10 update:** Evidence classification guardrail added to README. DevOps deployment remains the operationalization gate.

- **Item:** Email delivery / notification transport
  **Category:** Infrastructure / notification delivery
  **Status:** Email explicitly out of PS launch scope; in-app notifications are the supported transport (P6-05)
  **P6-05 transport decision:** Email delivery (`emailDelivery.ts`) remains a Phase 1 console.log stub. Real SendGrid integration is deferred as post-launch follow-on. The supported notification transport for PS launch is the **in-app notification center** via Azure Storage Queue:

  | Transport | Status | PS Launch Scope? | Evidence |
  |-----------|--------|-----------------|----------|
  | In-app notification queue | **Operational** | Yes | `SendNotification.ts` enqueues to `hbc-notifications-queue`; `ProcessNotification.ts` consumes; `notification-dispatch.ts` routes to submitter/controller/admin |
  | Provisioning saga dispatch | **Operational** | Yes | Non-blocking dispatch at saga start, completion, and failure; failures logged, never break saga |
  | Email (SendGrid) | **Stubbed** | No | `emailDelivery.ts` logs to console only; `SENDGRID_API_KEY` not configured |
  | Digest email (hourly) | **Stubbed** | No | `SendDigestEmail.ts` timer-triggered but delivery stubbed |

  **Alternative notification proof:** Controllers and admins receive provisioning status via (1) in-app notification center, (2) health endpoint diagnostic reporting (`GET /api/health`), and (3) SignalR real-time push (when configured). These three channels provide adequate operator visibility without email.
  **Blocker level:** Non-blocking — email is accepted risk; in-app transport is operational
  **Repo-truth evidence:** `backend/functions/src/functions/notifications/SendNotification.ts`; `backend/functions/src/functions/provisioningSaga/notification-dispatch.ts`; `backend/functions/src/functions/health/index.ts` (reports `integrations.email: not-configured` honestly)

- **Item:** Deployment-scoped CORS / managed-identity / downstream-permission application
  **Category:** Infrastructure / environment-gated deployment
  **Status:** Repo-configured and repo-verified; environment application is external (P6-04)
  **P6-04 proof-tier classification:**

  | Aspect | Proof Tier | Repo Evidence |
  |--------|-----------|---------------|
  | CORS: tenant-specific, no wildcards, credentials required | **Repo-verified** | `host.json` hardcodes `https://hedrickbrotherscom.sharepoint.com`; AC-5 boundary tests; release gates 2a-2b |
  | MI initialization in service factory | **Repo-verified** | `service-factory.ts` calls `DefaultAzureCredential`; AC-6 boundary test proves MI scoped |
  | MI grant requirements documented | **Repo-configured** | RELEASE-SCOPE.md lists required grants; deployment runbook lists IT prerequisites |
  | Graph `Group.ReadWrite.All` applied | **Not yet proven** | Requires IT approval + Azure portal; health reports `provisioningPrereqs.graphPermission` |
  | SharePoint `Sites.FullControl.All` applied | **Not yet proven** | Requires IT approval + SharePoint admin |
  | Table Storage `Data Contributor` applied | **Not yet proven** | Requires Azure portal role assignment |
  | CORS settings applied in live Azure portal | **Not yet proven** | host.json defines the contract; portal must match |

  **Blocker level:** Environment-gated prerequisite (repo-owned posture complete since P4-09)
  **Post-deploy verification path:** `GET /api/health` returns `configTiers`, `provisioningPrereqs`, and `roleConfig` sections that expose whether environment prerequisites are satisfied. A `blocked` or `degraded` readiness state triggers the deployment runbook rollback decision.
  **P4-07 update:** Repo-owned infrastructure model frozen and classified (canonical PS host vs transitional monolithic host).
  **P4-11 reconciliation:** Downgraded from "launch blocker" to "environment-gated prerequisite" — repo-owned posture complete.

#### Phase 5 deferred implementations

- **Item:** Retained-surface frontend regression baseline
  **Category:** Verification / regression coverage
  **Status:** Implicitly deferred / partially implemented
  **Why it is still deferred:** Prompt 08 requires a truthful retained frontend baseline. Repo truth still shows the requested `@hbc/spfx-project-setup` verification command surfacing failing page-level tests in the retained request lifecycle surface, even though some direct Phase 1 tests pass.
  **Repo-truth evidence:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Prompt-08_Phase-5-Frontend-Test-Baseline-and-Stability.md`; `apps/estimating/src/test/NewRequestPage.test.tsx`; `apps/estimating/src/test/RequestDetailPage.test.tsx`; `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx`; current audit verification notes in this review
  **Affected files/surfaces:** retained requester pages and page-level integration behavior
  **Blocker level:** Launch blocker
  **Cross-phase impact:** Prevents truthful “release-hardened” posture and undermines signoff confidence even when backend evidence is strong.
  **Recommended next-step direction:** Fix the retained page-level failures and rerun the requested package-local verification slice until the baseline is honestly green.
  **P5-07 update:** Re-verified 2026-03-31. 10 failures across 4 files confirmed: NewRequestPage (5 of 17), RequestDetailPage (2 of 8), coordinator (2 of 12), ProjectSetupUiReviewMode (1 of 13). Additionally discovered UiReviewMode failure not in original audit. 128 of 140 tests pass. Deferred to Prompt-08 for resolution.
  **P5-08 update: CLOSED.** All 10 failures fixed. Root cause: test harness gap — mock clients not injected because `ProjectSetupBackendProvider` fell back to ui-review mode without `getApiToken`. Fix: mock `useProjectSetupBackend` directly in 3 test files + provide `getApiToken` in test harness. Retained baseline: 19 files, 138 tests passed, 0 failed.

- **Item:** Smoke / deployment evidence execution proof
  **Category:** Deployment / release-readiness
  **Status:** External / environment-gated, not repo-complete
  **Why it is still deferred:** Prompt 09 explicitly warns not to treat smoke-test existence as completed deployment validation. Repo truth includes post-deploy smoke tests and runbooks, but there is no checked-in evidence of a successful staging or production smoke run.
  **Repo-truth evidence:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Prompt-09_Phase-5-Smoke-Tests-Deployment-Runbook-and-Operational-Proof-Categorization.md`; `backend/functions/src/test/smoke/post-deploy-smoke.test.ts`; `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Deployment-Runbook.md`
  **Affected files/surfaces:** post-deploy validation, rollback decision-making, release-gate evidence
  **Blocker level:** Launch blocker
  **Cross-phase impact:** Keeps Phase 5 in documentary readiness rather than executed readiness and leaves Phase 3/4 environment prerequisites unproven.
  **Recommended next-step direction:** Run the smoke suite against the intended deployment target and capture the resulting release evidence outside the repo-doc fiction layer.

- **Item:** Final signoff completion and decision proof
  **Category:** Release-readiness / governance
  **Status:** Documented as complete but not repo-evidenced complete
  **Why it is still deferred:** Phase 5 handoff and signoff docs present a decision-ready package, but repo truth does not include actual completed leadership / IT / support approval evidence, nor does it include live release execution showing those signoff assumptions were satisfied.
  **Repo-truth evidence:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Handoff.md`; `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Production-Readiness-Signoff.md`; `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Prompt-10_Phase-5-Signoff-Realism-and-Decision-Ready-Evidence.md`
  **Affected files/surfaces:** signoff artifacts, release governance, leadership / IT / support decision-making
  **Blocker level:** Launch blocker
  **Cross-phase impact:** Depends on unresolved items from Phases 2-4 and cannot be closed honestly while those items remain open or unproven.
  **Recommended next-step direction:** Recast signoff as pending until blockers and environment-gated evidence are actually closed.

- **Item:** Accepted-risk items that remain live implementation or operational debt
  **Category:** Mixed follow-up hardening
  **Status:** Explicitly deferred
  **Why it is still deferred:** Phase 5 documents accepted risks for no automated alerts, no frontend telemetry, no latency baseline, proxy stub, email stub, and dual RBAC. Repo truth still supports those risks as open items rather than closed work.
  **Repo-truth evidence:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Handoff.md`; `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Production-Readiness-Signoff.md`; `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Release-Gates-and-Diagnostics.md`; `backend/functions/observability/README.md`
  **Affected files/surfaces:** observability, client telemetry, performance monitoring, proxy scope, notification delivery, RBAC convergence
  **Blocker level:** Important but non-blocking
  **Cross-phase impact:** Aggregates unresolved debt inherited from Phases 3 and 4 and should not be mistaken for already-remediated work.
  **Recommended next-step direction:** Track these as live post-blocker hardening items rather than buried signoff footnotes.

### C. Cross-phase deferred dependencies

- **External live-list validation still affects release truth.** The Phase 2 repo-owned code path is repaired, but release decisions still depend on proving that the live SharePoint list matches the repo-owned contract.
- **Environment prerequisites span Phases 3, 4, and 5.** Auth configuration, managed-identity grants, CORS, SharePoint / Graph approvals, and dedicated-host deployment posture are documented, but repo truth does not prove they are complete in a live environment.
- **Operationalization is split between Phase 4 artifacts and Phase 5 signoff.** Observability, alerting, smoke execution, and runbook use are partially documented in-repo but still depend on actual deployment and operator execution evidence.
- **Transitional surface cleanup crosses requester, controller, and admin.** Deprecated token helpers, RBAC divergence, and the proxy stub are not isolated Phase 3 leftovers; they continue to affect Phase 4 support posture and Phase 5 signoff realism.
- **Phase 1 historical deferrals were not all truly closed by later phase closure language.** Preferences backend work and provisioning-maturity follow-on work remained open even after Phase 1 boundary remediation itself was honestly closed.

### D. Closure-truth notes

- **Phase 1:** `Phase-1_Handoff.md` now truthfully closes the backend boundary remediation, but the same handoff still explicitly defers the complexity-preferences endpoint and earlier provisioning-maturity follow-on. “Phase 1 closed” should therefore be read as “scope boundary closed,” not “every Phase 1 deferred dependency closed.”
- **Phase 2:** `Phase-2_Handoff.md` now aligns with the repaired repo-owned code path more than the older audit did, but its references to the external schema update should still be read cautiously because the repo does not contain a checked-in schema export artifact proving the current live list state.
- **Phase 3:** `Phase-3_Handoff.md` says the auth model is complete and has no must-fix blockers, yet the same phase family documents acceptable follow-on for proxy removal, deprecated helper removal, RBAC convergence, and external deployment prerequisites. Repo truth still shows those items open.
- **Phase 4:** `Phase-4_Handoff.md` says production-safe infrastructure posture is complete, but Prompt 10 and the observability README both preserve explicit evidence that operationalization and environment-level proof were not completed in repo truth.
- **Phase 5:** `Phase-5_Handoff.md` and `Phase-5_Production-Readiness-Signoff.md` originally used the strongest closure language in the phase set. **P5-07 through P5-11 reconciliation:** Handoff annotated with reconciliation note (P5-07). Signoff doc updated with corrected phase table, closed R6, and decision-ready evidence summary (P5-10). “Code-Level Blockers: NONE” is now repo-supported (P5-08 fixed frontend tests, P5-10 confirmed). Remaining gaps are environment-gated and operational, not code-level.

### E. Recommended interpretation for leadership / implementation planning

- Treat the launch blockers in this section as the real remaining production-readiness gates: environment-level auth/infrastructure proof, green retained-surface frontend tests, executed smoke validation, and actual signoff completion.
- Treat the non-blocking deferred items as follow-up hardening debt, not as proof that the package is already production-ready. Several of these are acceptable for post-blocker sequencing, but they are still unresolved work.
- Treat documentary closure claims conservatively. Where a phase handoff says `COMPLETE` but the deferred inventory still shows open implementation, test, or environment-gated work, leadership should rely on repo truth plus this deferred inventory rather than the handoff label alone.

## 7. Risk Analysis

### Technical risk

- Low-to-medium risk that live environment persistence could diverge from the repo-owned 43-field contract because the external SharePoint list is not independently proven by a checked-in schema export or live integration evidence.
- ~~Medium-to-high risk of invalid or incomplete submissions entering the lifecycle because required-field enforcement is disabled.~~ **CLOSED (P6-01).** Required-field enforcement re-enabled; backend validation matches wizard contract.
- Medium risk from residual differences between repo-owned proof and environment-level proof.

### Deployment risk

- Production activation depends on external configuration, SharePoint admin consent, managed-identity grants, and tenant setup; these are documented but not proven complete in repo truth.
- The repo contains both a dedicated Project Setup host and a preserved monolithic host, but it does not contain release evidence proving which host posture is actually exercised in live deployment.

### Operational / support risk

- Diagnostic assets exist, but no repo evidence shows deployed alerting or dashboards.
- Some operator runbooks are present only as documentation and linked admin guidance, not validated operational workflows.

### Release-readiness risk

- Backend readiness is materially stronger than frontend/package readiness.
- Current failing SPFx tests mean the repo cannot credibly claim a fully hardened retained launch surface.
- “Ready for production release decision review” is not supported by the current combined evidence set.

## 8. Prioritized Remediation List

1. **Obtain external proof that the live SharePoint `Projects` list matches the repo-owned 43-field contract.**
   - The repo-owned Phase 2 code path is repaired, but release decisions still need environment-level proof for the external list itself.
2. **~~Re-enable and align required-field enforcement.~~ CLOSED (P6-01, 2026-03-31).**
   - `PROJECT_SETUP_REQUIRED_FIELDS_ENABLED` set to `true`. Backend `validateSubmission()` expanded to 13 required-field checks plus format validation for department, projectStage, and estimatedValue. 19 new backend validation tests added. 39/39 frontend step tests pass.
3. **~~Resolve current SPFx retained-surface test failures.~~ CLOSED (P5-08, 2026-03-31).**
   - All 10 failures fixed. Root cause: test harness gap (mock client injection). 19 files, 138 tests green.
4. **~~Decide the real backend deployment boundary.~~ DECIDED (2026-03-31).**
   - ADR-0124 establishes per-domain Function App hosts. Project Setup host boundary frozen in `Phase-1_Backend-Boundary-Freeze.md`. Implementation: Prompt-08 (host creation), Prompt-09 (config/auth/CORS), Prompt-10 (regression guards). Closure: AC-1 through AC-10.
5. **Reconcile Phase 5 signoff and handoff docs with repo truth.**
   - Remove unsupported “complete / production-ready” claims until the live blockers above are closed.
   - P4-07: Phase 4 handoff annotated with reconciliation note distinguishing repo-proven infrastructure from environment-gated items.
6. **Operationalize observability.**
   - Deploy alert rules, dashboards, and notification channels corresponding to the checked-in artifacts.
   - P4-07: Explicitly classified as documentary infrastructure. Repo-owned artifacts are complete; deployment and operationalization deferred to Prompt-10.
   - P4-10: Evidence classification guardrail added to observability README. 3 of 15 artifacts genuinely operationalized (health, telemetry, logger). Remaining 12 require DevOps deployment.
7. **~~Finish auth/rbac cleanup.~~ SUBSTANTIALLY CLOSED (P3-07 through P3-10, 2026-03-31).**
   - Deprecated token paths removed from all retained surfaces (P3-09). Auth architecture frozen (P3-07). Production token path verified (P3-08). RBAC convergence (JWT roles vs UPN lists) remains a future follow-on but is not a blocker.
8. **~~Make a proxy-route decision.~~ DECIDED (P3-10, 2026-03-31).**
   - Proxy explicitly excluded from Project Setup release scope. Handler annotated. Boundary test proves exclusion from PS host.

## 9. Final Status Assessment

> **Last updated:** 2026-03-31 (P6-01 persistence contract, validation, and clarification storage closure)

### Phase-by-phase status

| Phase | Status | Summary |
|-------|--------|---------|
| Phase 1 | **Closed** | Frontend isolation + backend domain host + 63 regression tests. All AC-1-AC-10 satisfied. ADR-0124 accepted. |
| Phase 2 | **Substantially Closed** | Repo-owned contract, mapper, repository path, backward compatibility, and test truthfulness are closed. Live external-list proof remains outside repo evidence. |
| Phase 3 | **Closed** | Auth frozen (P3-07), token path verified (P3-08), cross-surface converged (P3-09), proxy excluded + tests (P3-10), docs reconciled (P3-11). RBAC convergence future follow-on. |
| Phase 4 | **Substantially Closed** | Architecture frozen (P4-07), validation scoped (P4-08), CORS/MI/permissions explicit (P4-09), observability classified (P4-10), docs reconciled (P4-11). Environment-gated deployment proof deferred. |
| Phase 5 | **Substantially Closed** | Release scope frozen (P5-07), frontend green (P5-08), smoke categorized (P5-09), signoff aligned (P5-10), docs reconciled (P5-11). 797 tests green (659 backend + 138 frontend — updated P6-01). Environment-gated deployment and operational signoff remain. |

### Overall recommendation

**Code-level work complete; environment-gated deployment and operational signoff remain.** Phases 1-3 are closed. Phases 2 and 4 are substantially closed in repo-owned terms. Phase 5 is substantially closed: release scope frozen, frontend baseline green, evidence categorized, signoff aligned to repo truth (P5-07 through P5-11). Production readiness now depends on environment-level prerequisites and operational execution, not code gaps.

The remaining blockers are:
1. ~~Disabled required-field enforcement (cross-phase)~~ **CLOSED (P6-01, 2026-03-31).** Required-field enforcement re-enabled, backend validation aligned with wizard contract.
2. ~~SPFx page-level test instability (Phase 5)~~ **CLOSED (P5-08, 2026-03-31).** 10 failures fixed, 138 tests green.
3. Environment-gated release evidence without live deployment proof (Phase 5)
4. External validation of the live SharePoint list and deployment posture (Phase 2 / Phase 4 / Phase 5)

> The Project Setup / Estimating SPFx implementation is substantially built and code-level work is complete. Phases 1 and 3 are honestly closed with machine-checkable evidence. Phase 2’s repo-owned code/test findings are closed, with external live-list proof remaining. Phase 4’s infrastructure architecture is frozen with canonical/transitional classification and truthful observability categorization (P4-07 through P4-11). Phase 5’s release evidence model is explicit: frontend baseline green (P5-08, 138 tests), backend strong (659 tests, 30 release-specific — updated P6-01), smoke/deployment categorized (P5-09), signoff aligned to evidence (P5-10), docs reconciled (P5-11). Phase 6 Prompt-01 closed the persistence contract storage ceiling, re-enabled required-field enforcement, and aligned backend validation with the wizard contract. Phase 6 Prompt-02 confirmed backward compatibility, test truthfulness, and regression guards remain sound (P6-02). Phase 6 Prompt-03 retired the preferences API expectation and documented the RBAC split as intentional (P6-03). Phase 6 Prompt-04 categorized all 14 environment prerequisites by proof tier: 6 repo-verified, 8 environment-gated with post-deploy verification paths (P6-04). Phase 6 Prompt-05 closed observability (runtime assets operational, alerting DevOps-gated), notification transport (in-app queue supported, email out of launch scope), and provisioning maturity (7 saga steps complete with compensation and fail-fast validation) (P6-05). Remaining launch prerequisites are environment-gated (D0 SP column migration + 8 deployment items, staging smoke execution) and operational (leadership/IT/support signoff, DevOps alerting deployment).

## 10. Explicit Unresolved Questions

- Does the currently deployed SharePoint `Projects` list still match the repo-owned 43-field contract reflected in `projects-list-contract.ts`?
- ~~Is the intended release target a Project Setup-only backend deployment, or a broader shared Azure Functions host that happens to include Project Setup?~~ **RESOLVED (ADR-0124, Prompt-08):** Per-domain Function App hosts. Project Setup host implemented at `backend/functions/src/hosts/project-setup/`.
- ~~Are the current failing `@hbc/spfx-project-setup` page-level tests known regressions, test drift, or accepted defects?~~ **RESOLVED (P5-08, 2026-03-31):** Test drift — mock client injection gap in test harness. All 10 failures fixed. 19 files, 138 tests green.
- Has any live staging deployment successfully run the post-deploy smoke suite documented in `backend/functions/src/test/smoke/post-deploy-smoke.test.ts`?

## 11. Evidence Appendix

### Phase 1 evidence

- Plan intent: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-1/Phase-1_Scope-Control_Action-Plan.md`
- Claimed completion: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-1/Phase-1_Handoff.md`
- Requester route isolation: `apps/estimating/src/router/routes.ts`
- Requester shell isolation: `apps/estimating/src/router/root-route.tsx`
- Scope guards: `apps/estimating/src/test/phase1ScopeGuards.test.ts`
- Backend breadth still present: `backend/functions/src/index.ts`
- Shared service surface still present: `backend/functions/src/services/service-factory.ts`
- Boundary decision: `docs/architecture/adr/ADR-0124-project-setup-backend-host-boundary.md`
- Boundary freeze plan: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-1/Phase-1_Backend-Boundary-Freeze.md`
- ADR-0009 cross-reference addendum: `docs/architecture/adr/ADR-0009-backend-functions.md` (Consequences section)
- Project Setup host composition root: `backend/functions/src/hosts/project-setup/index.ts`
- Project Setup scoped service factory: `backend/functions/src/hosts/project-setup/service-factory.ts`
- Project Setup domain host.json: `backend/functions/src/hosts/project-setup/host.json`
- Host boundary regression tests: `backend/functions/src/test/project-setup-host-boundary.test.ts` (63 tests)
- Release-scope manifest: `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`
- Release gate extension: `backend/functions/src/test/release-gates.test.ts` (P1-09 Gate 4 extension)

### Phase 2 evidence

- Plan intent: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-2/Phase-2_Data-Contract_Action-Plan.md`
- Original handoff: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-2/Phase-2_Handoff.md` (annotated with P2-07-P2-11 reconciliation)
- Gap document (historical): `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-2/Phase-2_Data-Contract-Gaps.md` (gaps now closed)
- Domain model (with sageAccessUpns): `packages/models/src/provisioning/IProvisioning.ts`
- Field contract (43 fields): `backend/functions/src/services/projects-list-contract.ts`
- Mapper (43 fields): `backend/functions/src/services/projects-list-mapper.ts`
- Mapper tests (39 tests, 43 fields): `backend/functions/src/services/__tests__/projects-list-mapper.test.ts`
- Contract proof + regression guards (9 tests): `backend/functions/src/services/__tests__/sp-field-mapping.test.ts` (restructured P2-09)
- Submit handler fix: `backend/functions/src/functions/projectRequests/index.ts` (P2-08)
- Lifecycle tests (51 tests): `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts`

### Phase 3 evidence

- Plan intent: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-3/Phase-3_Auth_Action-Plan.md`
- Claimed completion: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-3/Phase-3_Handoff.md`
- Runtime mode config: `apps/estimating/src/config/runtimeConfig.ts`
- SPFx mount and token setup: `apps/estimating/src/mount.tsx`
- Backend context gating: `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx`
- Token factory / deprecated path: `apps/estimating/src/utils/resolveSessionToken.ts`
- JWT validation: `backend/functions/src/middleware/validateToken.ts`
- Route auth wrapper: `backend/functions/src/middleware/auth.ts`
- Route-auth contract test: `backend/functions/src/middleware/auth-contract.test.ts`
- Auth release readiness test: `backend/functions/src/test/auth-release-readiness.test.ts`
- Proxy stub still live: `backend/functions/src/functions/proxy/proxy-handler.ts`

### Phase 4 evidence

- Plan intent: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-4/Phase-4_Infrastructure_Action-Plan.md`
- Claimed completion: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-4/Phase-4_Handoff.md`
- Tiered config validation: `backend/functions/src/utils/validate-config.ts`
- Health/readiness diagnostics: `backend/functions/src/functions/health/index.ts`
- Shared-host backend registration: `backend/functions/src/index.ts`
- Service initialization posture: `backend/functions/src/services/service-factory.ts`
- CORS and runtime host config: `backend/functions/host.json`
- Observability artifacts: `backend/functions/observability/README.md`, `backend/functions/observability/alerts.json`, `backend/functions/observability/kql/*.kql`
- Infrastructure tests: `backend/functions/src/test/release-gates.test.ts`, `backend/functions/src/test/infra-readiness.test.ts`

### Phase 5 evidence

- Plan intent: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Release-Hardening_Action-Plan.md`
- Claimed completion: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Handoff.md`
- Signoff package: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Production-Readiness-Signoff.md`
- Release gates doc: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Release-Gates-and-Diagnostics.md`
- Deployment runbook: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Deployment-Runbook.md`
- Request lifecycle integration: `backend/functions/src/test/request-lifecycle.integration.test.ts`
- Unsupported scope guard: `backend/functions/src/test/unsupported-scope-guard.test.ts`
- Post-deploy smoke suite: `backend/functions/src/test/smoke/post-deploy-smoke.test.ts`
- Current failing SPFx page-level tests encountered during audit run:
  - `apps/estimating/src/test/NewRequestPage.test.tsx`
  - `apps/estimating/src/test/RequestDetailPage.test.tsx`
  - `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx`

### Current-state authority used to reconcile scope drift

- `docs/architecture/blueprint/current-state-map.md`
  - requester surface entries
  - controller/admin surface entries
  - workflow-experience and Project Setup package entries
  - current-state records showing broader W0-G3/W0-G4 implementation truth beyond the phase handoffs
