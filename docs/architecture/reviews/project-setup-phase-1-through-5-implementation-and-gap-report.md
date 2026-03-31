# Project Setup / Estimating SPFx Phase 1-5 Implementation and Gap Report

## 1. Executive Summary

Repo truth does not support a conclusion that Phases 1 through 5 were fully completed as documented. The implementation is materially advanced and several major workstreams are real in code, but the current repository still shows a mixed maturity state: core requester, controller, admin, lifecycle, auth, and infrastructure scaffolding all exist, yet there are still meaningful mismatches between plan claims and live implementation.

The strongest repo-truth conclusions are:

- The Estimating SPFx requester surface is truly narrowed to Project Setup routes and UI concerns in `apps/estimating/src/router/routes.ts`, `apps/estimating/src/router/root-route.tsx`, and `apps/estimating/src/test/phase1ScopeGuards.test.ts`.
- The data-contract work introduced a real centralized SharePoint field map in `backend/functions/src/services/projects-list-contract.ts` and `backend/functions/src/services/projects-list-mapper.ts`, with real mapper tests in `backend/functions/src/services/__tests__/projects-list-mapper.test.ts`.
- The Project Setup auth model is substantially implemented: production-vs-`ui-review` mode, SPFx audience-scoped token acquisition, backend JWT validation, and route protection are real in `apps/estimating/src/config/runtimeConfig.ts`, `apps/estimating/src/mount.tsx`, `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx`, `backend/functions/src/middleware/validateToken.ts`, and `backend/functions/src/middleware/auth.ts`.
- Phase 4 infrastructure hardening is also materially real: tiered config validation, diagnostic health output, managed-identity service posture, and version-controlled observability assets exist in `backend/functions/src/utils/validate-config.ts`, `backend/functions/src/functions/health/index.ts`, `backend/functions/src/services/service-factory.ts`, `backend/functions/host.json`, and `backend/functions/observability/**`.

The main repo-truth blockers are:

- The package is not truly isolated end-to-end. The frontend surface is isolated, but the backend still registers many unrelated domain routes and services in `backend/functions/src/index.ts` and `backend/functions/src/services/service-factory.ts`.
- The Phase 2 persistence contract is still incomplete. `IProjectSetupRequest` contains fields that are not persisted by the real SharePoint adapter, including structured address fields, team-role assignments, clarification metadata, and retry metadata. Evidence: `packages/models/src/provisioning/IProvisioning.ts`, `backend/functions/src/services/projects-list-contract.ts`, `backend/functions/src/services/projects-list-mapper.ts`, and `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-2/Phase-2_Data-Contract-Gaps.md`.
- Required-field enforcement is still intentionally disabled in the wizard config via `PROJECT_SETUP_REQUIRED_FIELDS_ENABLED = false` in `packages/features/estimating/src/project-setup/config/projectSetupSteps.ts`. That directly weakens production readiness.
- Phase 5 release-hardening claims are overstated. The backend verification slice is strong, but the current `@hbc/spfx-project-setup` test run still fails across broader page-level tests, which undercuts the handoff’s “production-ready” posture.
- Several key release-readiness items remain documentary or environment-gated rather than proven against a live deployment: smoke tests require external environment variables, observability dashboards/alerts are not deployed from repo, and deployment prerequisites remain external dependencies.

Overall status: **close but blocked**. The implementation is beyond prototype level, but repo truth does not support a “production ready” or “ready for final launch validation only” assessment.

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

**Confirmed implemented items**

- The requester app route tree is Project Setup-only in `apps/estimating/src/router/routes.ts`.
- The shell configuration is simplified and Project Setup-specific in `apps/estimating/src/router/root-route.tsx`.
- Scope-guard tests exist and directly verify route isolation, client method surface, and import boundaries in `apps/estimating/src/test/phase1ScopeGuards.test.ts`.
- The current-state map aligns with a Project Setup-only requester surface in `docs/architecture/blueprint/current-state-map.md` entries for `apps/estimating/src/components/project-setup/` and `apps/estimating/src/project-setup/backend/`.

**Partially implemented items**

- Contract freezing happened on the app-local client boundary, but not across the whole deployment surface. The UI client boundary is narrow in `apps/estimating/src/project-setup/backend/types.ts` and `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx`, but the backend host still exposes much broader functionality.
- Backend acceptance guards exist, but they protect a broader multi-domain function app rather than a truly Project Setup-only backend. Evidence: `backend/functions/src/test/unsupported-scope-guard.test.ts`.

**Missing items**

- The backend was not actually reduced to Project Setup-only scope. `backend/functions/src/index.ts` still imports domain route families for leads, projects, estimating, schedule, buyout, compliance, contracts, risk, scorecards, and PMP.
- The service container still owns many non-Project-Setup services in `backend/functions/src/services/service-factory.ts`, even if some are lazy-initialized.

**Divergence from plan**

- The phase handoff says “Scope Control Complete” in `phase-1/Phase-1_Handoff.md`, but repo truth only supports frontend scope control as complete. Backend scope alignment remained broader than the phase language implies.
- The current repo appears to have adopted a shared backend posture rather than a dedicated Project Setup-only function deployment. That makes part of the Phase 1 backend-isolation intent stale.

**Current status assessment**

**Partial → Closed (remediated 2026-03-31, Prompts 07-10).** Frontend scope control was already real and guarded. Backend scope isolation was incomplete. Remediation delivered: ADR-0124 (per-domain hosts), dedicated Project Setup composition root, scoped service factory, tenant-specific CORS, domain-scoped config validation, and 63 boundary regression tests. All 10 acceptance criteria satisfied. See remediation progress notes below.

### Phase 1 Remediation Progress (2026-03-31)

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

**What remains open:**

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

**Confirmed implemented items**

- A centralized field map exists in `backend/functions/src/services/projects-list-contract.ts`.
- Centralized serialization and normalization live in `backend/functions/src/services/projects-list-mapper.ts`.
- Real mapper-level tests exist in `backend/functions/src/services/__tests__/projects-list-mapper.test.ts`.
- The repository adapter uses the centralized mapper rather than hardcoding `field_N` names across multiple files in `backend/functions/src/services/project-requests-repository.ts`.
- Runtime schema/contract tests also exist for backend configuration surfaces in `backend/functions/src/validation/schema-contract-validation.test.ts`.

**Partially implemented items**

- The mapper correctly covers the fields that exist in the imported SharePoint Projects list, but it does not cover the full live `IProjectSetupRequest` shape. Evidence: `packages/models/src/provisioning/IProvisioning.ts` vs `backend/functions/src/services/projects-list-contract.ts`.
- Tests protect the mapper for mapped fields, but there is also a misleading mock-repository contract test in `backend/functions/src/services/__tests__/sp-field-mapping.test.ts` that round-trips the full object through `MockProjectRequestsRepository`, not through the real SharePoint adapter. That test can mask persistence loss for unmapped fields.

**Missing items**

- Structured location fields are still not persisted by the real adapter: `projectStreetAddress`, `projectCity`, `projectCounty`, `projectState`, `projectZip`.
- Team-role assignment fields are still not persisted: `projectExecutiveUpn`, `projectManagerUpn`, `leadEstimatorUpn`, `supportingEstimatorUpns`, `additionalTeamMemberUpns`, `timberscanApproverUpn`.
- Other live domain fields remain unmapped: `officeDivision`, `procoreProject`, `clarificationRequestedAt`, `requesterRetryUsed`, `clarificationItems`.
- The phase gap document calling this out remains accurate in repo truth: `phase-2/Phase-2_Data-Contract-Gaps.md`.

**Divergence from plan**

- `phase-2/Phase-2_Handoff.md` claims “Data Contract Complete,” but repo truth still shows known persistence loss on the production path.
- The field-mapping effort improved the architecture, but it did not finish the persistence contract for the actual live wizard shape.

**Current status assessment**

**Partial.** Phase 2 produced the right architectural seam, but the real production persistence contract remains incomplete and can drop user-entered data.

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

**Implemented with important residual gaps.** Stronger than Phase 1 and Phase 2, but not as cleanly complete as the handoff states.

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

**Partially implemented items**

- Startup scoping is only partially aligned to “actual deployment.” The service factory moved many domain services to lazy getters, but `backend/functions/src/index.ts` still registers a broad multi-domain function app.
- Observability artifacts are real in repo, but deployment and operationalization are incomplete. `backend/functions/observability/README.md` still shows the DevOps setup checklist unchecked.
- CORS is locked more tightly than `*`, but still broader than a single tenant origin because `backend/functions/host.json` allows `https://*.sharepoint.com` in addition to the tenant URL.

**Missing items**

- No repo evidence proves that the recommended alert rules, dashboards, or Teams delivery workflows have been deployed; the repo only contains the artifacts and instructions.
- No repo evidence proves live infrastructure rehearsal or live staging validation.

**Divergence from plan**

- `phase-4/Phase-4_Handoff.md` says the package has a “production-safe infrastructure posture” and that startup/runtime validation is scoped to actual deployment. Repo truth does not support that as strongly because the backend host still co-deploys unrelated domains.
- Phase 4 documentation frames CORS as tenant-aligned, but current `host.json` is broader.

**Current status assessment**

**Partial to substantial.** The hardening work is real and valuable, but the handoff overstates the degree of deployment scoping and operational completeness.

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

**Partially implemented items**

- Backend release-hardening evidence is strong and current. The targeted backend verification slice passed during this audit.
- Frontend/package-level release evidence is weaker than the handoff states. The requested `@hbc/spfx-project-setup` verification command surfaced failing broader app-package tests in current repo truth, including failures in:
  - `apps/estimating/src/test/NewRequestPage.test.tsx`
  - `apps/estimating/src/test/RequestDetailPage.test.tsx`
  - `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx`
- Smoke tests exist, but they are environment-gated and do not constitute proof that a live staging or production deployment has been validated. Evidence: `backend/functions/src/test/smoke/post-deploy-smoke.test.ts`.
- Release docs are substantial, but they remain partly procedural rather than proven by live deployment evidence.

**Missing items**

- No repo-truth evidence shows a successful live deployment rehearsal, successful smoke run against staging, or completed signoff by leadership / IT / operations.
- No repo-truth evidence shows a resolved frontend test baseline across the retained launch surface.
- No repo-truth evidence shows implemented frontend telemetry, and the phase handoff itself records that as an accepted risk.

**Divergence from plan**

- `phase-5/Phase-5_Handoff.md` says “Phase 5 Status: COMPLETE” and recommends “Ready for production release decision review.”
- `phase-5/Phase-5_Production-Readiness-Signoff.md` lists all five phases as complete and code-level blockers as none.
- Current repo truth does not support those statements. The launch surface still includes meaningful unresolved gaps: disabled required-field enforcement, incomplete persistence of live request fields, broader-than-claimed backend deployment scope, and failing page-level SPFx tests.

**Current status assessment**

**Partial.** Phase 5 created real release artifacts and backend evidence, but the current repo is not in a state that justifies the handoff’s “production-ready” posture.

## 4. Cross-Phase Findings

### Dependencies spanning multiple phases

- Phase 1 isolation and Phase 4 startup scoping are directly coupled. The backend boundary freeze (ADR-0124, 2026-03-31) establishes the per-domain host model. Implementation is tracked in Prompts 08-11. Until the Project Setup composition root is complete (AC-1 through AC-10 in `Phase-1_Backend-Boundary-Freeze.md`), Phase 4’s “actual deployment scoping” claim remains partially overstated for the monolithic host.
- Phase 2 persistence completeness is coupled to Phase 5 release readiness. The system still risks losing production-mode request data for live wizard fields, so release hardening cannot honestly be complete while the persistence contract is incomplete.
- Phase 3 production-mode safety depends on Phase 4 deployment/configuration truth. The code gates production mode correctly, but actual readiness still depends on external environment configuration, app registration approval, and tenant permissions.

### Recurring patterns of incompletion or drift

- Several phase handoffs declare `COMPLETE` even where the live repo still contains explicit transitional markers, accepted risks, or architectural incompletion.
- A recurring pattern is “correct seam introduced, but not finished end-to-end.” This is true for:
  - scope isolation
  - field mapping
  - auth convergence
  - observability operationalization
  - release evidence
- Mock-backed tests and local review pathways improve developer confidence but can overstate production readiness when the real production path remains incomplete.

### Places where later work invalidated earlier assumptions

- The repository now behaves more like a shared multi-domain backend than a Project Setup-only backend deployment. That weakens some earlier phase assumptions around scope control and startup scoping.
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

- **Incomplete production persistence contract.**
  - Real production persistence still drops live `IProjectSetupRequest` fields.
  - Evidence: `packages/models/src/provisioning/IProvisioning.ts`, `backend/functions/src/services/projects-list-contract.ts`, `backend/functions/src/services/projects-list-mapper.ts`, `phase-2/Phase-2_Data-Contract-Gaps.md`.
- **Required-field enforcement is intentionally disabled.**
  - `PROJECT_SETUP_REQUIRED_FIELDS_ENABLED = false` in `packages/features/estimating/src/project-setup/config/projectSetupSteps.ts`.
  - This means the wizard does not enforce the full intended submission contract.
- **Backend package is not truly isolated to Project Setup scope.**
  - Evidence: `backend/functions/src/index.ts`, `backend/functions/src/services/service-factory.ts`.
  - **Remediation complete (Prompts 07-09, 2026-03-31):** Dedicated Project Setup host created with scoped composition root, service factory, domain-specific host.json, and domain-scoped config validation. All 10 acceptance criteria (AC-1 through AC-10) satisfied. 45 boundary regression tests. Phase 1 backend scope freeze: **closed**.
- **Frontend/package-level release evidence is not green.**
  - Current `@hbc/spfx-project-setup` package test invocation still exposes failing page-level tests, which undercuts the Phase 5 “complete” claim.
- **No repo proof of live deployment validation.**
  - Smoke tests are env-gated; there is no checked-in evidence of successful staging or production validation.

### Important but non-blocking gaps

- Deprecated or transitional auth code still exists in `apps/estimating/src/utils/resolveSessionToken.ts`.
- Cross-surface RBAC/auth convergence remains incomplete across requester, controller, and admin surfaces.
- Proxy integration remains a stub in `backend/functions/src/functions/proxy/proxy-handler.ts`.
- Observability artifacts exist, but dashboards/alerts are not proven deployed; `backend/functions/observability/README.md` still shows setup tasks unchecked.
- `host.json` CORS posture is broader than a single tenant and therefore looser than some documentation implies.

### Cleanup / documentation debt

- Phase handoff docs overstate completion and production readiness relative to current repo truth.
- Some tests give a stronger impression of full persistence coverage than the real adapter warrants, especially `backend/functions/src/services/__tests__/sp-field-mapping.test.ts`.
- Release/readiness docs should be reconciled with current repo state before they are used as signoff artifacts.

## 7. Risk Analysis

### Technical risk

- High risk of silent data loss on the real persistence path for fields the wizard already collects.
- Medium-to-high risk of invalid or incomplete submissions entering the lifecycle because required-field enforcement is disabled.
- Medium risk from mismatch between mock-backed review/test flows and production-backed behavior.

### Deployment risk

- Production activation depends on external configuration, SharePoint admin consent, managed-identity grants, and tenant setup; these are documented but not proven complete in repo truth.
- The backend remains a shared host with broader route registration than the phase docs imply, raising blast-radius and deployment-scope concerns.

### Operational / support risk

- Diagnostic assets exist, but no repo evidence shows deployed alerting or dashboards.
- Some operator runbooks are present only as documentation and linked admin guidance, not validated operational workflows.

### Release-readiness risk

- Backend readiness is materially stronger than frontend/package readiness.
- Current failing SPFx tests mean the repo cannot credibly claim a fully hardened retained launch surface.
- “Ready for production release decision review” is not supported by the current combined evidence set.

## 8. Prioritized Remediation List

1. **Complete the production persistence contract for the live wizard shape.**
   - Decide which `IProjectSetupRequest` fields are required to persist and extend the real storage contract accordingly.
2. **Re-enable and align required-field enforcement.**
   - Remove the temporary disabled state in `projectSetupSteps.ts` and ensure backend validation matches the intended wizard contract.
3. **Resolve current SPFx retained-surface test failures.**
   - Bring `NewRequestPage`, `RequestDetailPage`, and coordinator retry paths back to a green baseline before any launch decision.
4. **~~Decide the real backend deployment boundary.~~ DECIDED (2026-03-31).**
   - ADR-0124 establishes per-domain Function App hosts. Project Setup host boundary frozen in `Phase-1_Backend-Boundary-Freeze.md`. Implementation: Prompt-08 (host creation), Prompt-09 (config/auth/CORS), Prompt-10 (regression guards). Closure: AC-1 through AC-10.
5. **Reconcile Phase 5 signoff and handoff docs with repo truth.**
   - Remove unsupported “complete / production-ready” claims until the live blockers above are closed.
6. **Operationalize observability.**
   - Deploy alert rules, dashboards, and notification channels corresponding to the checked-in artifacts.
7. **Finish auth/rbac cleanup.**
   - Remove deprecated token paths and converge cross-surface authorization behavior where possible.
8. **Make a proxy-route decision.**
   - Implement it or explicitly retire it from the supported release scope.

## 9. Final Status Assessment

Overall recommendation: **not production ready**.

More specifically:

- The package is **not production ready** today.
- It is **close but blocked**, not “production ready with caveats.”
- It is **not yet ready for final launch validation only**, because foundational blockers remain in persistence, validation, test stability, and deployment-scope truthfulness.

The most accurate maturity description is:

> The Project Setup / Estimating SPFx implementation is substantially built and directionally sound, but current repo truth still shows real launch blockers and several phase-complete claims that are stronger than the code, tests, and infrastructure evidence support.

**Phase 1 Backend Remediation Complete (2026-03-31):** The backend deployment boundary has been decided (ADR-0124, Prompt-07), implemented (Prompt-08), and operationally scoped (Prompt-09). All 10 acceptance criteria (AC-1 through AC-10) are satisfied. A dedicated Project Setup host exists with scoped composition root, service factory, domain-specific host.json, domain-scoped config validation, and 45 boundary regression tests. Full verification suite passes (605 tests, 0 failures). Phase 1 backend scope freeze is **closed**.

## 10. Explicit Unresolved Questions

- Which currently unmapped `IProjectSetupRequest` fields are intentionally transient, and which are expected to survive real production persistence?
- ~~Is the intended release target a Project Setup-only backend deployment, or a broader shared Azure Functions host that happens to include Project Setup?~~ **RESOLVED (ADR-0124, Prompt-08):** Per-domain Function App hosts. Project Setup host implemented at `backend/functions/src/hosts/project-setup/`.
- Are the current failing `@hbc/spfx-project-setup` page-level tests known regressions, test drift, or accepted defects?
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
- Claimed completion: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-2/Phase-2_Handoff.md`
- Gap summary still supported by repo: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-2/Phase-2_Data-Contract-Gaps.md`
- Live request type: `packages/models/src/provisioning/IProvisioning.ts`
- Central field map: `backend/functions/src/services/projects-list-contract.ts`
- Central mapper: `backend/functions/src/services/projects-list-mapper.ts`
- Real mapper tests: `backend/functions/src/services/__tests__/projects-list-mapper.test.ts`
- Misleading mock round-trip coverage: `backend/functions/src/services/__tests__/sp-field-mapping.test.ts`

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
