# Admin SPFx IT Control Center — Phase 8 Repo-Truth Audit

**Prompt:** P8-01 — Phase 8 Repo-Truth Audit and Dependency Map
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Audit the live repo for Phase 8 (HB Intel SharePoint control and standards enforcement) and produce a durable dependency map so implementation targets real gaps.

---

## 1. Purpose

This audit captures verified present-truth about what the repo already provides for Phase 8 — and what is genuinely missing. Phase 8 implements the first-wave SharePoint control lane for HB Intel-managed assets: drift detection, standards comparison, preview/dry-run, controlled repair, and package/API posture visibility.

---

## 2. Authority set actually used

| Source | Path | Why |
|--------|------|-----|
| End-state plan — Phase 8 section | `admin-spfx-it-control-center-end-state-plan.md` lines 744–760 | Phase 8 objectives, deliverables, exit criteria |
| Phase 8 summary plan | `phase-08/Admin-SPFx-IT-Control-Center-Phase-8-Summary-Plan.md` | Governing intent and acceptance criteria |
| Phase 7 exit reconciliation | `phase-07/admin-spfx-phase-7-exit-reconciliation.md` | Explicit Phase 8 deferrals |
| Admin app routes and pages | `apps/admin/src/router/routes.ts`, `lane-registry.ts`, `pages/SharePointLanePage.tsx` | Route and scaffold state |
| Backend services | `backend/functions/src/services/` | SharePoint, Graph, control-plane inventory |
| Provisioning saga | `backend/functions/src/functions/provisioningSaga/` | Existing SharePoint operation patterns |
| Admin control plane models | `packages/models/src/admin-control-plane/` | Contract types, enums, evidence types |
| Features-admin package | `packages/features/admin/` | Admin-intelligence vs control-plane boundary |
| Provisioning package | `packages/provisioning/` | State machine, API client, failure modes |
| Admin adapter registry | `backend/functions/src/services/admin-control-plane/adapter-registry.ts`, `adapters.ts` | Registered adapters |
| Backend README | `backend/functions/README.md` | Documented capabilities and endpoints |

---

## 3. Confirmed existing SharePoint-control-related foundations

### 3.1 Admin app scaffolding

| Asset | Path | State |
|-------|------|-------|
| SharePoint route | `apps/admin/src/router/routes.ts` lines 130–137 | Defined — `/sharepoint`, lazy-loads `SharePointLanePage` |
| Lane registry entry | `apps/admin/src/router/lane-registry.ts` lines 75–84 | Registered as `scaffold` status, order 4, `deliversIn: 'Phase 7'` (stale label — Phase 8 owns this) |
| SharePoint page | `apps/admin/src/pages/SharePointLanePage.tsx` | Empty scaffold — `HbcSmartEmptyState` placeholder only |
| Shell navigation | `apps/admin/src/router/root-route.tsx` | SharePoint lane visible in nav but disabled (scaffold opacity) |

**Finding:** Route infrastructure exists. Page is a pure placeholder with no content.

### 3.2 Backend SharePoint service

**File:** `backend/functions/src/services/sharepoint-service.ts`

Provides provisioning-focused operations via PnPjs with Managed Identity tokens:

| Capability | Methods | Phase 8 reusable? |
|-----------|---------|-------------------|
| Site lifecycle | `createSite()`, `siteExists()`, `deleteSite()` | Partially — site existence/status queries useful for drift |
| Content provisioning | `createDocumentLibrary()`, `createDataLists()`, `uploadTemplateFiles()` | Partially — existence checks useful for standards comparison |
| ALM | `installWebParts()` | Partially — package install polling pattern useful for posture |
| Permissions | `setGroupPermissions()`, `assignGroupToPermissionLevel()` | Partially — permission assignment patterns useful for repair |
| Hub association | `associateHubSite()`, `isHubAssociated()`, `disassociateHubSite()` | Yes — association check is a standards comparison primitive |
| Audit trail | `writeAuditRecord()` | Yes — provisioning audit log pattern |

**Finding:** The service handles provisioning **writes**. Phase 8 needs **read/compare** operations (site posture inspection, standards comparison) that do not yet exist.

### 3.3 Graph service

**File:** `backend/functions/src/services/graph-service.ts`

| Capability | Phase 8 relevance |
|-----------|------------------|
| `createSecurityGroup()`, `addGroupMembers()` | Entra group posture comparison |
| `getGroupByDisplayName()` | Group existence verification for drift detection |
| `grantSiteAccess()` | Sites.Selected permission posture inspection |
| Permission gate (`GRAPH_GROUP_PERMISSION_CONFIRMED`) | Operator safety pattern for privileged operations |

### 3.4 Admin control-plane substrate

**Services in `backend/functions/src/services/admin-control-plane/`:**

| Service | Origin | Phase 8 reusable? |
|---------|--------|-------------------|
| `AdminAdapterRegistry` | Phase 3 | Yes — extend with SharePoint control adapters/invokers |
| `DurableAdminRunStore` | Phase 4 | Yes — SharePoint control runs use same run envelope |
| `DurableAdminAuditStore` | Phase 4 | Yes — audit events for SharePoint control actions |
| `DurableAdminEvidenceStore` | Phase 4 | Yes — drift reports, preview results as evidence |
| `AdminPreflightService` | Phase 6 | Pattern reference for prelaunch validation |
| `InstallOrchestrator` | Phase 6 | Pattern reference for step-based orchestration |
| `BindingVerificationService` | Phase 6A | **Key pattern reference** — drift detection with findings model |
| `AdminActorContextResolver` | Phase 3 | Yes — operator identity for SharePoint control actions |
| `ProvisioningAuditBridge` | Phase 4 | Pattern reference for fire-and-forget audit |
| `OrchestrationBridge` | Phase 3 | Pattern reference for cross-domain run translation |

### 3.5 Registered adapters

**File:** `backend/functions/src/services/admin-control-plane/adapters.ts`

| Adapter key | Category | Status | Phase 8 relevance |
|------------|----------|--------|-------------------|
| `sharepoint-site:lifecycle` | SharePointSite | Partial (provisioning invoker) | Extend — add drift/compare/repair invokers |
| `sharepoint-alm:package-install` | SharePointAlm | Planned (no invoker) | Implement — app catalog posture |
| `sharepoint-api-access:permissions` | SharePointApiAccess | Planned (no invoker) | Implement — API access posture |
| `provisioning:bridge` | SharePointSite | Active (real invoker) | Reference — provisioning integration |
| `validation-probe:readiness` | ValidationProbe | Partial | Reference — health probes |

### 3.6 Provisioning saga (7 steps)

**Directory:** `backend/functions/src/functions/provisioningSaga/`

Steps: Create Site → Document Libraries → Template Files → Data Lists → Web Parts → Permissions → Hub Association

Phase 8 relevance: The saga establishes what a "standard" HB Intel SharePoint site looks like. The provisioning step definitions implicitly encode the **expected standards** for site structure, content, permissions, and association. Phase 8 standards comparison should reference these same expectations.

### 3.7 Evidence and audit infrastructure

| Capability | Location | Phase 8 reuse |
|-----------|----------|---------------|
| `AdminEvidenceType.DriftReport` | `IAdminAudit.ts` line 195 | Yes — drift comparison evidence |
| `AdminEvidenceType.PreviewResult` | `IAdminAudit.ts` line 183 | Yes — preview/dry-run impact evidence |
| `AdminAuditEventType.StandardsApplied` | `IAdminAudit.ts` line 54 | Yes — standards application audit event |
| `AdminAuditEventType.BindingDriftDetected` | `IAdminAudit.ts` line 67 | Pattern reference — drift audit event |
| `IAdminStandardsReference` | `IAdminAudit.ts` lines 230–249 | Yes — standards version tracking |
| `IAdminConfigSnapshotReference` | `IAdminAudit.ts` lines 201–228 | Yes — config state at run time |
| `IAdminRunConfigTrace` | `IAdminAudit.ts` lines 328–340 | Yes — run-to-standards traceability |
| `IProvisioningEvidence` | `packages/models/src/provisioning/` | Pattern reference — structured evidence payload |

### 3.8 Preview / dry-run support

| Pattern | Location | State |
|---------|----------|-------|
| `IAdminRunLaunchRequest.dryRun` flag | `IAdminApi.ts` line 97 | Contract exists |
| `IAdminAdapterDescriptor.supportsDryRun` | `IAdminAdapter.ts` lines 78–79 | Contract exists |
| `IAdminAdapterInvocationContext.dryRun` | `IAdminAdapter.ts` lines 112–113 | Contract exists |
| `IAdminPreviewResponse` + `IAdminPreviewImpactItem` | `IAdminApi.ts` lines 314–343 | Contract exists |

**Finding:** Contracts for dry-run are modeled. No SharePoint-specific preview implementation exists.

### 3.9 Domain enum

`AdminDomain.SharePointControl = 'sharepoint-control'` exists in `AdminEnums.ts` line 29. Phase 8 runs should use this domain.

---

## 4. Confirmed missing or partial Phase 8 capabilities

| Capability | Status | Detail |
|-----------|--------|--------|
| SharePoint standards snapshot model | **Missing** | No implementation. Contracts (`IAdminStandardsReference`) exist but no snapshot resolution logic |
| SharePoint standards comparison engine | **Missing** | No code compares live site state against expected standards |
| SharePoint drift detection workflow | **Missing** | App-binding drift pattern exists (`BindingVerificationService`) but no SharePoint site/asset drift |
| SharePoint drift categories and severities | **Missing** | Binding drift uses `IAppBindingDriftFinding` — Phase 8 needs SharePoint-specific drift finding types |
| Managed asset boundary definition | **Missing** | No code or config defines which SharePoint assets are HB Intel-managed |
| Standards preview/dry-run implementation | **Missing** | Contracts exist, no SharePoint preview logic |
| Site repair / standards apply / reapply workflows | **Missing** | No code repairs site standards or reapplies configuration |
| App catalog posture inspector | **Missing** | `sharepoint-alm:package-install` adapter registered but has no invoker; no posture query logic |
| API access posture inspector | **Missing** | `sharepoint-api-access:permissions` adapter registered but has no invoker; no posture query logic |
| SharePoint control lane UX | **Missing** | `SharePointLanePage.tsx` is an empty scaffold |
| SharePoint control-plane services | **Missing** | No services in `admin-control-plane/` for SharePoint control orchestration |
| SharePoint control adapters/invokers | **Missing** | Adapter descriptors exist but no real invokers for comparison/repair operations |

---

## 5. Dependency map to prior phases

| Phase | What it provided for Phase 8 |
|-------|------------------------------|
| **Phase 1** | Health endpoint patterns, `hasEnv()` readiness probes, `wave0-env-registry.ts` environment variables |
| **Phase 2** | Generalized run model (`IAdminRunEnvelope`, `AdminRunStatus`), step tracking, checkpoint contracts, preflight/preview DTOs, audit/evidence type contracts |
| **Phase 3** | Adapter registry (`AdminAdapterRegistry`), adapter descriptors for SharePoint adapters, service container/factory, actor context resolver, orchestration bridge, session token factory, 13 admin API endpoints |
| **Phase 4** | Durable persistence (`DurableAdminRunStore`, `DurableAdminAuditStore`, `DurableAdminEvidenceStore`), Table Storage keying, audit bridge pattern |
| **Phase 5** | Operator console shell, lane-based navigation, command-rail pattern, lane registry |
| **Phase 6** | Install/bootstrap orchestration pattern (step catalog, adapter invocation, checkpoint pauses), preflight service, verification service, evidence capture pattern |
| **Phase 6A** | App-binding model, binding verification with drift detection pattern (`BindingVerificationService`), binding store, repair request/result contracts |
| **Phase 7** | Provisioning hardening — failure classification, evidence payload infrastructure, prelaunch validation model (6 failure categories), recovery guidance engine, audit trail enrichment, provisioning control-center UX patterns |

**Critical dependency:** The `BindingVerificationService` (Phase 6A) is the closest structural analogue to what Phase 8 needs for SharePoint drift detection. Phase 8 should follow the same pattern: side-effect-free check functions producing structured findings with severity levels.

---

## 6. Real gaps that this phase must close

### 6.1 Standards model

Define what "correct" looks like for an HB Intel-managed SharePoint site. The provisioning saga steps encode implicit standards (document libraries, data lists, template files, web parts, permissions, hub association). Phase 8 must formalize these into an inspectable, versionable standards model.

### 6.2 Managed asset boundary

Define which SharePoint sites, packages, and API permissions fall within HB Intel's first-wave control boundary. This is the scope limiter that prevents Phase 8 from becoming broad tenant governance.

### 6.3 Drift detection

Implement side-effect-free inspection that compares live SharePoint site state against the standards model and produces structured drift findings. Follow the `BindingVerificationService` pattern.

### 6.4 Preview / dry-run

Before any repair or standards application, produce a preview showing what would change (using the existing `IAdminPreviewResponse` / `IAdminPreviewImpactItem` contracts).

### 6.5 Controlled repair / apply / reapply

Implement backend workflows that apply or reapply standards to drifted assets. Constrain to first-wave boundary. Use existing adapter registry and step-based orchestration patterns.

### 6.6 Package and API posture visibility

Implement invokers for the `sharepoint-alm:package-install` and `sharepoint-api-access:permissions` adapter descriptors so operators can see app catalog and API access posture.

### 6.7 SharePoint control lane UX

Replace the `SharePointLanePage.tsx` scaffold with real operator surfaces for asset scoping, drift review, preview results, repair initiation, and evidence/history access.

### 6.8 SharePoint control-plane services

Create backend services for standards resolution, drift collection, comparison, preview, and repair orchestration.

---

## 7. Non-gaps that must not be reimplemented

| Existing capability | Location | Do not rebuild |
|--------------------|----------|----------------|
| Run lifecycle and envelope | `IAdminRunEnvelope`, `DurableAdminRunStore` | Use `AdminDomain.SharePointControl` in existing stores |
| Step tracking | `IAdminStepResult`, `AdminStepStatus` | Extend step catalogs, not the tracking model |
| Audit trail | `DurableAdminAuditStore`, `AdminAuditEventType` | Use existing event types (`StandardsApplied`, etc.) |
| Evidence capture | `DurableAdminEvidenceStore`, `AdminEvidenceType` | Use `DriftReport` and `PreviewResult` types |
| Adapter registry | `AdminAdapterRegistry` | Add invokers to existing descriptors; register new adapters if needed |
| Orchestration pattern | `InstallOrchestrator` step catalog approach | Follow same pattern for SharePoint control steps |
| Drift findings model | `IAppBindingDriftFinding` severity/field/expected/observed shape | Adapt the pattern; do not reinvent the structure |
| Preview/dry-run contracts | `IAdminPreviewResponse`, `dryRun` flag, `supportsDryRun` | Use existing contracts for SharePoint preview |
| Standards reference | `IAdminStandardsReference` | Use for versioning standards applied in control runs |
| Actor context | `AdminActorContextResolver` | Use for operator identity on SharePoint control actions |
| Service container | `service-factory.ts` | Wire Phase 8 services into existing factory |
| Admin API endpoints | `adminApi/index.ts` | Extend for SharePoint control routes; do not duplicate endpoint patterns |
| Lane navigation | Lane registry, root route | Update lane status from `scaffold` to active |
| SharePoint service | `sharepoint-service.ts` | Extend with read/compare operations; do not replace |
| Provisioning saga steps | Step 1–7 definitions | Reference as implicit standards baseline |
| Evidence payload model | `IProvisioningEvidence` | Pattern reference for structured SharePoint control evidence |
| Failure classification | `ProvisioningFailureClass` | Extend or mirror pattern for SharePoint control failures |

---

## 8. Risks / constraints the implementation must respect

| Risk | Constraint |
|------|-----------|
| Scope creep into broad tenant governance | First-wave boundary must be explicitly defined and enforced; only HB Intel-managed assets |
| Repair without preview | All standards application/repair flows must support and require preview/dry-run before execution |
| Privileged execution in SPFx | SharePoint control writes must stay in backend; SPFx is operator console only |
| Standards model drift from provisioning | Standards model should derive from or remain consistent with provisioning saga expectations |
| Adapter descriptor proliferation | Prefer extending existing SharePoint adapter descriptors over registering many new ones |
| Evidence storage growth | Use existing inline/offload threshold (32 KB) for drift reports; do not create new storage tables without justification |
| `features-admin` confusion | `packages/features/admin` is intelligence/monitoring — not the control plane; do not add Phase 8 control-plane logic there |
| Stale lane registry label | Lane registry entry says `deliversIn: 'Phase 7'` — must be corrected to Phase 8 |
| Permission escalation | Some repair operations may require tenant-admin consent; use checkpoint pattern from Phase 6 if needed |
| Backward compatibility | Extending `SharePointService` and shared contracts must not break existing provisioning flows |

---

## Cross-references

- [Phase 8 Summary Plan](Admin-SPFx-IT-Control-Center-Phase-8-Summary-Plan.md) — objectives and acceptance criteria
- [End-state plan — Phase 8](../admin-spfx-it-control-center-end-state-plan.md) — deliverables and exit criteria
- [Phase 7 Exit Reconciliation](../phase-07/admin-spfx-phase-7-exit-reconciliation.md) — explicit Phase 8 deferrals
- [Binding Verification Service](../../../../backend/functions/src/services/admin-control-plane/binding-verification-service.ts) — drift detection pattern reference
- [Adapter Registry](../../../../backend/functions/src/services/admin-control-plane/adapter-registry.ts) — adapter infrastructure
- [SharePoint Service](../../../../backend/functions/src/services/sharepoint-service.ts) — existing SharePoint operations
