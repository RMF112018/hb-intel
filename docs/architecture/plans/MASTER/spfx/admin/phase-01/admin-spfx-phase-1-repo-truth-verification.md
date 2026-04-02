# Admin SPFx IT Control Center — Phase 1 Repo-Truth Verification

## 1. Purpose

This document captures the verified present-state facts for the Admin SPFx IT Control Center as of the start of Phase 1. It exists to prevent later prompts from operating against stale assumptions or unverified claims. All assertions below are derived from direct repo inspection, not from target-state plans or historical narratives.

## 2. Authority set actually used

The following files were read and verified during this audit:

1. `CLAUDE.md`
2. `docs/reference/developer/agent-authority-map.md`
3. `docs/architecture/blueprint/current-state-map.md`
4. `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
5. `apps/admin/package.json`
6. `apps/admin/src/App.tsx`
7. `apps/admin/src/router/root-route.tsx`
8. `apps/admin/src/router/routes.ts`
9. `apps/admin/src/pages/SystemSettingsPage.tsx`
10. `apps/admin/src/pages/ProvisioningOversightPage.tsx` — **note**: Prompt-01 references `ProvisioningFailuresPage.tsx`, but the actual file is `ProvisioningOversightPage.tsx`; the route path `/provisioning-failures` maps to this component
11. `apps/admin/src/pages/ErrorLogPage.tsx`
12. `apps/admin/src/webparts/admin/AdminWebPart.tsx`
13. `packages/features/admin/README.md`
14. `packages/features/admin/src/index.ts`
15. `backend/functions/README.md`
16. `backend/functions/src/services/service-factory.ts`
17. `backend/functions/src/services/graph-service.ts`
18. `backend/functions/src/services/sharepoint-service.ts`
19. `backend/functions/src/services/table-storage-service.ts`
20. `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`

Additionally verified:
- `apps/admin/README.md` — exists and is comprehensive
- `apps/admin/src/pages/OperationalDashboardPage.tsx` — exists (referenced in routes)
- `apps/admin/config/package-solution.json` — SPFx packaging manifest

## 3. Confirmed repo facts

### apps/admin (v0.0.31)

- **SPFx entry point**: `AdminWebPart.tsx` uses `resolveSpfxPermissions()` + `bootstrapSpfxAuth()` in `onInit()` (decision D-PH7-BW-7). React 18 concurrent mode via `createRoot()`.
- **Provider stack**: HbcThemeProvider → HbcToastProvider → QueryClientProvider → HbcErrorBoundary → ComplexityProvider → Router.
- **Routing**: TanStack Router via `createWebpartRouter()` with 4 routes:
  - `/` → `SystemSettingsPage` (no permission gate — infinite redirect protection)
  - `/error-log` → `ErrorLogPage` (gated: `admin:access-control:view` or `*:*`)
  - `/provisioning-failures` → `ProvisioningOversightPage` (gated: same)
  - `/dashboards` → `OperationalDashboardPage` (gated: same)
- **Shell layout**: "simplified" mode (tenant-level, no "Back to Project Hub"). Tool picker with 4 nav items. AdminAlertBadge with live alert polling.
- **Polling hooks**: `useAlertPolling()` (G6-T04) and `useProbePolling()` (G6-T06) in root route.
- **Dependencies**: All workspace internal (`@hbc/auth`, `@hbc/provisioning`, `@hbc/complexity`, `@hbc/shell`, `@hbc/features-admin`). Fluent UI v9, TanStack Router/Query, Zustand.
- **Package-solution.json**: Version `1.0.0.0` (SPFx 4-part default, not yet aligned to repo convention).

### Page statuses

| Page | Status | Notes |
|------|--------|-------|
| SystemSettingsPage | **Live** | Access-control admin + approval authority config. Approval rules not persisted in Wave 0 (SF17-T05). Design G6-T02. |
| ProvisioningOversightPage | **Live** | 759 lines. Full CRUD: retry (ceiling enforcement), archive, escalation acknowledge, expert-tier manual state override. Complexity gating (Standard/Expert). Session guard (W0-G4-T07). Session token factory (P3-09). Query param validation (P5-02). |
| OperationalDashboardPage | **Live** | Referenced in routes, operational. |
| ErrorLogPage | **Placeholder** | HbcSmartEmptyState with guidance to Provisioning Oversight. Deferred (SF17-T05). |

### @hbc/features-admin (v0.2.1)

- **Role**: Admin intelligence layer — monitoring, probes, approval authority, dashboards. Ports-and-adapters pattern per ADR-0106.
- **Public exports**: 70+ symbols across types (19), constants (10), monitors (11), probes (8), APIs (3), hooks (6), integrations (6), components (5), testing mocks (4).
- **Monitor maturity**: 2 of 6 monitors live (`provisioningFailureMonitor`, `stuckWorkflowMonitor`); 4 deferred stubs.
- **Probe maturity**: 2 of 5 probes live (`sharePointProbe`, `azureFunctionsProbe`); 3 deferred stubs.
- **Store maturity**: Wave 0 uses in-memory alert store. Wave 1 targets SharePoint-list-backed persistence.
- **API maturity**: `ApprovalAuthorityApi` is a stub. `AdminAlertsApi` is in-memory. `InfrastructureProbeApi` is live.
- **Build/test/lint scripts**: Mature. Vitest 3.2, Storybook 8.6.

### backend/functions

- **Service factory** (`service-factory.ts`): Singleton container. Dual-mode: mock for local dev/tests, proxy for production (Managed Identity). Eager initialization for core Project Setup services. Lazy initialization for Phase 1 CRUD services. Startup validation with degraded-mode warnings.
- **Graph service** (`graph-service.ts`): Entra ID group lifecycle — `createSecurityGroup`, `addGroupMembers` (idempotent on 409), `getGroupByDisplayName`, `grantSiteAccess` (Sites.Selected). All operations gated behind `GRAPH_GROUP_PERMISSION_CONFIRMED` env var. Real implementation uses `DefaultAzureCredential` + fetch to Graph v1.0 API. Mock maintains in-memory group map.
- **SharePoint service** (`sharepoint-service.ts`): Full provisioning contract — site lifecycle (create, exists, delete, hub associate/disassociate), document libraries, lists and fields (Text, Number, DateTime, Boolean, Choice, User, URL, Lookup, MultiLineText), web part installation (poll until visible, 60s timeout), permissions (Entra group → SharePoint role), audit record writes. PnPjs + Managed Identity tokens. Deterministic site URL derivation. Eventual-consistency poll loops.
- **Table storage service** (`table-storage-service.ts`): Azure Table-backed persistence. Write: `upsertProvisioningStatus` (replace semantics). Read: `getProvisioningStatus`, `getLatestRun`, `listFailedRuns`, `listPendingStep5Jobs`, `listAllRuns`. Escalation support. JSON serialization for complex fields. Full deserialization boundary with backward-compat fields.
- **Saga orchestrator** (`saga-orchestrator.ts`): Production-grade. 7-step provisioning (site → doc library → templates → data lists → web parts → permissions → hub). Durable run identity (correlationId, parentCorrelationId for retry chains). `withRetry` (3 attempts, 2s base delay). Compensation in reverse step order. Step 5 deferral to overnight timer (`step5DeferredToTimer`, `WebPartsPending` status). Dual-store audit writes (fire-and-forget). Real-time SignalR progress. Escalation-aware notifications. Request reconciliation (Provisioning → Completed/Failed). Permission model diagnostics. Comprehensive telemetry events and metrics.

### Target architecture document

- `admin-spfx-target-architecture.md` contains only an ASCII architecture diagram.
- No prose, no boundary definitions, no operational clarity.
- Directionally useful but too thin to serve as the Phase 1 baseline by itself.

## 4. Confirmed partial foundations already present

- **Admin routing and shell**: Exists and works but is provisioning-focused. Not yet a general control-center workflow shell. Navigation has 4 items; end-state target has ~8+ workflow areas.
- **Permission model**: Working RBAC bootstrap and route-level gating. Current scope: `admin:access-control:view` and fine-grained action permissions (retry, archive, escalate, force-state, approval-manage). Not yet generalized to the full domain taxonomy.
- **Backend saga**: Production-grade for provisioning. Not yet generalized for other admin domain runs (Entra, SharePoint control, install/bootstrap).
- **Features-admin monitors/probes**: Architecture is mature (ports-and-adapters, ADR-0106), but only 4 of 11 total monitors/probes are live. Remaining are deferred stubs.
- **Wave 0 stores**: In-memory alert store and stub approval authority API. Durability is a Wave 1 target.
- **Target architecture doc**: ASCII diagram captures the right shape but lacks the prose, boundary rules, and layer ownership needed for a real baseline.

## 5. Confirmed gaps Phase 1 still needs to close

These are documentation/boundary gaps only — Phase 1 does not add runtime capability:

- **No boundary matrix**: No document codifies what belongs in SPFx vs backend vs adapters vs persistence vs governance.
- **No admin domain taxonomy**: No canonical taxonomy of admin capabilities, domains, or sub-capabilities.
- **No locked-decisions document**: Locked decisions exist in the end-state plan but are not yet written into a standalone durable artifact.
- **No release-scope map**: No map separating first-wave active scope from advisory-only from later expansion.
- **Target architecture too thin**: Needs enrichment into a properly cross-linked reference with prose and boundary definitions.
- **Local guidance alignment**: `apps/admin/README.md`, `packages/features/admin/README.md`, and `backend/functions/README.md` may need minor updates to align with the Phase 1 baseline once written.

## 6. Explicit non-gaps

The following already exist and must **not** be re-invented in Phase 1:

| What exists | Where | Why it is not a gap |
|-------------|-------|---------------------|
| SPFx entry point with RBAC bootstrap | `AdminWebPart.tsx` | Working. D-PH7-BW-7 decision implemented. |
| Provider stack and router | `App.tsx`, `routes.ts`, `root-route.tsx` | Working. TanStack Router + Query + Fluent UI v9. |
| ProvisioningOversight surface | `ProvisioningOversightPage.tsx` | Live, complex (759 lines), production-grade with CRUD, complexity gating, session guards. |
| SystemSettings surface | `SystemSettingsPage.tsx` | Live. Access-control admin + approval authority config. |
| OperationalDashboard surface | `OperationalDashboardPage.tsx` | Live. Referenced in routes. |
| Alert and probe polling | Root route hooks | Working. G6-T04, G6-T06. |
| `@hbc/features-admin` architecture | `packages/features/admin/` | Ports-and-adapters per ADR-0106. 70+ exports. |
| Service factory dual-mode pattern | `service-factory.ts` | Working. Mock/proxy with lazy CRUD initialization. |
| Saga orchestrator | `saga-orchestrator.ts` | Production-grade. Retry, compensation, durable identity, Step 5 deferral, dual-store audit. |
| Graph service | `graph-service.ts` | Entra group lifecycle with permission gate and mock parity. |
| SharePoint service | `sharepoint-service.ts` | Full provisioning contract with PnPjs, Managed Identity, eventual-consistency. |
| Azure Table persistence | `table-storage-service.ts` | Durable run/escalation persistence with deserialization boundary. |
| `apps/admin/README.md` | `apps/admin/README.md` | Comprehensive. Update only if Phase 1 baseline changes require it. |

## 7. Phase 1 implications

Phase 1 must produce:
- A **boundary matrix** codifying what belongs in each layer (Prompt-03).
- An **admin domain taxonomy** with capability classification (Prompt-04).
- A **release-scope map** separating first-wave active scope from later expansion (Prompt-04).
- A **locked-decisions document** with boundary guards and no-go statements (Prompt-05).
- An **enriched target architecture** that serves as a proper cross-linked reference (Prompt-06).
- **Aligned local guidance** in apps/admin, features/admin, and backend/functions READMEs (Prompt-06).

Phase 1 must **not**:
- Add new runtime capability.
- Restructure existing foundations that are working.
- Move privileged logic into SPFx.
- Redefine `@hbc/features-admin` as the control plane.
- Update `current-state-map.md` with target-state claims.

## 8. Open issues requiring later-phase handling, not Phase 1 implementation

| Issue | Phase |
|-------|-------|
| Generalized admin run model and contracts | Phase 2 |
| Backend API contracts for run launch, status, retry, repair | Phase 2 |
| Generalized backend skeleton beyond provisioning | Phase 3 |
| Durable run/audit persistence generalization | Phase 4 |
| Operator console shell rework (IA/navigation) | Phase 5 |
| In-app backend install/bootstrap | Phase 6 |
| Provisioning saga hardening | Phase 7 |
| HB Intel SharePoint control and standards enforcement | Phase 8 |
| Broad Entra administration | Phase 9 |
| Live admin-maintained standards/configuration | Phase 10 |
| High-risk action safety model | Phase 11 |
| ErrorLogPage implementation (currently placeholder, SF17-T05) | Phase 12 |
| Monitor/probe completion (4 stub monitors, 3 stub probes) | Phase 12 |
| Durable stores replacing in-memory (Wave 1) | Phase 12 |
| Production hardening and expansion rails | Phase 13 |
| `package-solution.json` version format alignment | Next packaging change |
