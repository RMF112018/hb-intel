# Native Integration Backbone Repo-Truth Audit

**Doc Classification:** Closeout Reconciliation Audit - Final  
**Date:** 2026-03-25  
**Scope:** Validate the locked native-integration decision set against current repo truth, the current implemented data layer, and the current MASTER/roadmap plan stack before any new integration family files are authored.  
**Disposition:** This document is a gating reconciliation artifact. It is not the first connector-family plan. No runtime code was changed in this pass.

---

## 1. Authority and Method

This audit used the requested governing truth order:

1. `docs/architecture/blueprint/current-state-map.md`
2. `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md`
3. `docs/architecture/blueprint/HB-Intel-Dev-Roadmap.md`
4. `docs/architecture/blueprint/package-relationship-map.md`
5. `docs/architecture/plans/MASTER/README.md`
6. `docs/architecture/plans/MASTER/00_HB-Intel_Master-Development-Summary-Plan.md`
7. `docs/architecture/plans/MASTER/phase-1-deliverables/README.md`
8. `docs/architecture/plans/MASTER/phase-1-deliverables/P1-A1-Data-Ownership-Matrix.md`
9. `docs/architecture/plans/MASTER/phase-1-deliverables/P1-A2-Source-of-Record-Register.md`
10. `docs/architecture/plans/MASTER/phase-3-deliverables/README.md`
11. Current implementation code under the inspected packages and apps

The audit then validated current implementation reality in:

- `packages/data-access/**`
- `packages/query-hooks/**`
- `packages/models/**`
- `backend/functions/**`
- `packages/provisioning/**`
- `packages/shell/**`
- `apps/pwa/src/sources/**`
- `packages/features/project-hub/**`
- `packages/features/admin/**`

The audit also checked the supplied official connector sources. Where the source set supported capability-level planning but not exact endpoint planning, this document marks the seam explicitly instead of guessing.

---

## 2. Repo-Truth Findings

### 2.1 Current data-plane custody is already hybrid, but not in the way Phase 1 documents currently claim

The current implemented backend is not "SharePoint-native business CRUD plus Azure operational state only." Current repo truth is:

- **Azure Table-backed business-domain services already exist** for leads, projects, estimating, schedule, buyout, compliance, contracts, risk, scorecards, and PMP.
- **SharePoint is real today** for project setup request persistence plus provisioning/site/list/document operations.
- **Provisioning operational state remains Azure Table backed**, which aligns with prior operational-state planning.

### 2.2 Evidence: Azure Table-backed domain services are live in backend/functions

| Domain / concern | Current implementation truth | Evidence paths |
|---|---|---|
| Leads | Azure Table-backed | `backend/functions/src/services/lead-service.ts` |
| Projects | Azure Table-backed | `backend/functions/src/services/project-service.ts` |
| Estimating trackers / kickoffs | Azure Table-backed | `backend/functions/src/services/estimating-service.ts` |
| Schedule | Azure Table-backed | `backend/functions/src/services/schedule-service.ts` |
| Buyout | Azure Table-backed | `backend/functions/src/services/buyout-service.ts` |
| Compliance | Azure Table-backed | `backend/functions/src/services/compliance-service.ts` |
| Contracts / approvals | Azure Table-backed | `backend/functions/src/services/contract-service.ts` |
| Risk | Azure Table-backed | `backend/functions/src/services/risk-service.ts` |
| Scorecards / versions | Azure Table-backed | `backend/functions/src/services/scorecard-service.ts` |
| PMP plans / signatures | Azure Table-backed | `backend/functions/src/services/pmp-service.ts` |
| Shared table client seam | Azure Table / Cosmos Table API seam | `backend/functions/src/utils/table-client-factory.ts` |
| Provisioning status | Azure Table-backed | `backend/functions/src/services/table-storage-service.ts` |

### 2.3 Evidence: SharePoint is real, but currently focused on provisioning and operational surfaces

| Concern | Current implementation truth | Evidence paths |
|---|---|---|
| Project setup requests | Persisted in SharePoint `Projects` list through repository layer | `backend/functions/src/services/project-requests-repository.ts` |
| Provisioning/site/list/document operations | SharePoint service present and live in service factory | `backend/functions/src/services/service-factory.ts`, `backend/functions/src/services/sharepoint-service.ts` |
| Admin "SharePoint" probe | Actually probes backend endpoint backed by SharePoint request storage, not a generalized SharePoint business-domain data plane | `packages/features/admin/src/probes/sharePointProbe.ts` |

### 2.4 PWA and shell startup still contain mock and unwired integration seams

| Finding | Evidence paths |
|---|---|
| My Work source assembly still uses mock domain query seams | `apps/pwa/src/sources/sourceAssembly.ts`, `apps/pwa/src/sources/domainQueryFns.ts` |
| PWA build defaults to `proxy` outside dev, but no startup wiring for proxy context was found | `apps/pwa/vite.config.ts` |
| `setProxyContext()` was found in tests, not in PWA or shell startup paths | `packages/data-access/src/factory.test.ts`; no corresponding usage found under `apps/pwa/**`, `packages/shell/**`, or `packages/query-hooks/**` |
| Project registry service remains mock-only | `packages/data-access/src/factory.ts`, `packages/data-access/src/services/MockProjectRegistryService.ts` |
| Shell depends on registry lookup seams that are not yet backed by a real registry implementation | `packages/shell/src/projectRouteContext.ts`, `packages/shell/src/spfxProjectContext.ts` |

### 2.5 Query and consumption boundaries already exist and should not be bypassed

`packages/query-hooks` is not a connector runtime layer. It is already a consumption boundary over `@hbc/data-access` repository resolution.

Evidence paths:

- `packages/query-hooks/src/useRepository.ts`
- `packages/data-access/src/factory.ts`

### 2.6 Generic Graph proxy remains stubbed

The generic proxy route exists, authenticates, and acquires/caches OBO context, but it still returns a mock response instead of forwarding to Microsoft Graph.

Evidence paths:

- `backend/functions/src/functions/proxy/index.ts`
- `backend/functions/src/functions/proxy/proxy-handler.ts`

---

## 3. Implemented Data-Layer and Seam Findings

The new integration backbone must reuse seams that already exist instead of inventing a parallel architecture.

### 3.1 Seams the connector program must explicitly leverage

| Seam | Why it matters | Evidence paths |
|---|---|---|
| Shared table client seam | Central point for Azure Table / Cosmos Table API-backed storage access | `backend/functions/src/utils/table-client-factory.ts` |
| Backend domain services | Current live repository/service layer for domain data | `backend/functions/src/services/*.ts` |
| Data-access ports and factory | Existing adapter/repository boundary for app consumption | `packages/data-access/src/ports/**`, `packages/data-access/src/factory.ts` |
| Query-hooks boundary | Existing consumption layer above repositories | `packages/query-hooks/src/useRepository.ts` |
| PWA source assembly | Current source registration seam for My Work and source composition | `apps/pwa/src/sources/sourceAssembly.ts` |
| Provisioning handoff config | Existing cross-surface handoff seam with deferred runtime integration hooks | `packages/provisioning/src/handoff-config.ts` |
| Project Hub financial import and reconciliation | Existing thin canonical / source-aligned normalization and reconciliation seam | `packages/features/project-hub/src/financial/import/index.ts`, `packages/features/project-hub/src/financial/__tests__/financial.import.test.ts` |
| Project Hub integration/publication constants | Existing publication and downstream integration boundary | `packages/features/project-hub/src/constraints/integration/constants.ts` |

### 3.2 Current implementation already exposes useful "thin canonical core" patterns

The codebase already contains behavior that aligns with the locked decision to preserve a thin canonical core over source-aligned normalization:

- Financial import logic resolves identity, detects ambiguity, and creates reconciliation conditions rather than flattening source-specific behavior into a broad universal model.
- Schedule and constraints packages already model reconciliation, source identity, Procore-mapping state, and publication boundaries.
- Closeout and other Project Hub areas already distinguish source records from derived read models.

Evidence paths:

- `packages/features/project-hub/src/financial/import/index.ts`
- `packages/features/project-hub/src/financial/types/index.ts`
- `packages/features/project-hub/src/schedule/commitments/index.ts`
- `packages/features/project-hub/src/constraints/change-ledger/types.ts`
- `packages/features/project-hub/src/closeout/foundation/constants.ts`

### 3.3 Proxy transport and backend route reality are not yet reconciled

Proxy repositories exist, but several expected routes do not match the actual backend routes:

| Area | Proxy expectation | Current backend reality | Evidence paths |
|---|---|---|---|
| Project number normalization | `/projects/by-number/{projectNumber}` | No matching backend route found | `packages/data-access/src/adapters/proxy/ProxyProjectRepository.ts`, `backend/functions/src/functions/projects/index.ts` |
| Lead search | `/leads/search` | Search is `GET /api/leads?q=...` | `packages/data-access/src/adapters/proxy/ProxyLeadRepository.ts`, `backend/functions/src/functions/leads/index.ts` |
| Estimating kickoffs | `/api/estimating/kickoffs/{projectId}` style assumptions in repo logic | Backend uses query-param route | `packages/data-access/src/adapters/proxy/ProxyEstimatingRepository.ts`, `backend/functions/src/functions/estimating/index.ts` |
| Schedule | `/projects/{projectId}/schedules` convention | Backend uses `/projects/{projectId}/schedule/activities` and `/metrics` | `packages/data-access/src/adapters/proxy/ProxyScheduleRepository.ts`, `backend/functions/src/functions/schedule/index.ts` |
| Buyout | `/projects/{projectId}/buyouts` | Backend uses `/projects/{projectId}/buyout/entries` | `packages/data-access/src/adapters/proxy/ProxyBuyoutRepository.ts`, `backend/functions/src/functions/buyout/index.ts` |
| Compliance | `/projects/{projectId}/compliance` | Backend uses `/projects/{projectId}/compliance/entries` | `packages/data-access/src/adapters/proxy/ProxyComplianceRepository.ts`, `backend/functions/src/functions/compliance/index.ts` |
| Risk | `/projects/{projectId}/risks` | Backend uses `/projects/{projectId}/risk/items` | `packages/data-access/src/adapters/proxy/ProxyRiskRepository.ts`, `backend/functions/src/functions/risk/index.ts` |
| Auth | Proxy auth repository expects a broad auth surface | No matching backend auth route family found | `packages/data-access/src/adapters/proxy/ProxyAuthRepository.ts`, `backend/functions/src/functions/**` |

### 3.4 Consequence for integration planning

The integration program must treat the current data-access and backend layers as **valuable but partially unreconciled seams**:

- Reuse them.
- Do not claim they are fully transport-locked.
- Reconcile route contracts before connector-backed consumption moves beyond audit/planning.

---

## 4. Plan Conflicts and Stale Assumptions

This section distinguishes between claims that are contradicted by code, incomplete against current implementation, or still directionally valid but in need of reframing.

### 4.1 Contradicted by code

| File | Contradicted claim | Why contradicted | Evidence paths |
|---|---|---|---|
| `docs/architecture/plans/MASTER/phase-1-deliverables/P1-A1-Data-Ownership-Matrix.md` | SharePoint is the authoritative business data store across core business domains | Current implemented domain CRUD services are Azure Table-backed across multiple domains | `backend/functions/src/services/lead-service.ts`, `project-service.ts`, `estimating-service.ts`, `schedule-service.ts`, `buyout-service.ts`, `compliance-service.ts`, `contract-service.ts`, `risk-service.ts`, `scorecard-service.ts`, `pmp-service.ts` |
| `docs/architecture/plans/MASTER/phase-1-deliverables/P1-A2-Source-of-Record-Register.md` | SharePoint is the current SoR for most domain writes/reads | Current backend reality is Azure Table-backed for most active domain data | same evidence set as above |
| `docs/architecture/plans/MASTER/02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md` | Phase 1 contract layer and route catalog are code-complete and transport-shape reconciled | Proxy routes and backend route reality still diverge; auth route family is missing; generic Graph proxy is stubbed | `packages/data-access/src/adapters/proxy/*.ts`, `backend/functions/src/functions/**/*.ts`, `backend/functions/src/functions/proxy/proxy-handler.ts` |
| `docs/architecture/plans/MASTER/phase-1-deliverables/README.md` | Backend routes, auth middleware, proxy adapters, and staging readiness are broadly code-complete with no further code work required | Route mismatches remain, auth route catalog is not implemented, proxy context is unwired, registry remains mock-only | `packages/data-access/src/factory.ts`, `packages/data-access/src/adapters/proxy/*.ts`, `backend/functions/src/functions/**/*.ts`, `apps/pwa/src/sources/domainQueryFns.ts` |
| `docs/architecture/plans/MASTER/phase-1-deliverables/P1-C2-a-Auth-Model-Extension-Proxy-Adapter-and-Route-Catalog.md` | Resolved auth route catalog has matching backend implementation | No matching backend auth route family was found | `packages/data-access/src/adapters/proxy/ProxyAuthRepository.ts`, `backend/functions/src/functions/**` |
| `packages/data-access/src/adapters/proxy/README.md` | Proxy adapter is still a stub and repository implementations should not exist yet | Repository implementations already exist | `packages/data-access/src/adapters/proxy/*.ts` |

### 4.2 Incomplete versus current implementation

| File | Incomplete claim | Required reframing |
|---|---|---|
| `docs/architecture/blueprint/package-relationship-map.md` | `@hbc/data-access` maturity description understates current proxy implementation | Update to reflect that proxy repos exist but contract alignment is incomplete |
| `packages/data-access/README.md` | Says proxy is only partial with 7 of 11 repos | Update to 11 repos implemented, but call out unresolved route and runtime wiring gaps |
| `backend/functions/README.md` | Auth migration note implies most handlers still need migration | Update to reflect current `withAuth()` usage across handlers while also documenting missing auth route family and generic proxy stub reality |
| `docs/architecture/plans/MASTER/README.md` | Describes Phase 1 as planning/implementation complete without reflecting current reconciliation gap | Reframe Phase 1 status as requiring native-integration repo-truth reconciliation before new connector-family planning begins |
| `docs/architecture/plans/MASTER/00_HB-Intel_Master-Development-Summary-Plan.md` | High-level Phase 1 positioning does not describe the present hybrid custody reality | Add reconciliation note that current real data layer is partially live but materially Azure Table-backed |

### 4.3 Still valid, but needs reframing

| File / concept | What remains valid | Reframing needed |
|---|---|---|
| `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md` | External systems remain source systems unless explicitly replaced; ports/adapters posture remains correct | Reconcile with current implemented Azure-backed domain layer and transitional published read-model doctrine |
| `docs/architecture/blueprint/HB-Intel-Dev-Roadmap.md` | Phase/wave structure and integration-backbone direction remain useful | Do not treat the roadmap as proof that the current implementation matches the original custody assumptions |
| `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md` | Module action-boundary doctrine remains important | Later updates must align module-level SoR language with the new transitional hybrid connector program |

---

## 5. Connector-Doc Verification Matrix

The connector list below preserves the locked wave set. This matrix only records what can be justified from the supplied official source set and accessible official pages in this audit pass.

### 5.1 Verification status legend

- **Verified at capability level**: The supplied official source set supports planning at the platform/capability level.
- **Endpoint shape not verified from supplied official source set**: The source set indicates capability and likely contract surface, but this audit did not validate route-level shapes from the supplied pages.
- **No-go for exact route planning**: The supplied and accessible official source set does not justify exact endpoint planning in this audit. Future family files must not invent exact structures from memory.

### 5.2 Wave 1

| Connector | Wave | Official source(s) | Audit classification | Notes |
|---|---|---|---|---|
| Procore | Wave 1 | [Introduction](https://developers.procore.com/documentation/introduction) | No-go for exact route planning | Official introduction supports capability-level planning only. Exact endpoint and webhook structure were not verified from the supplied source set alone. |
| Sage Intacct | Wave 1 | [OpenAPI root](https://developer.sage.com/intacct/apis/intacct/1/intacct-openapi), [OpenAPI indexes](https://developer.sage.com/intacct/docs/openapi/z-indexes/) | Verified at capability level | Official contract-oriented sources exist. Future family authoring may use those sources directly for route-level planning, but this audit does not enumerate endpoint shapes. |
| BambooHR | Wave 1 | [Getting started](https://documentation.bamboohr.com/docs/getting-started), [Employees directory](https://documentation.bamboohr.com/reference/get-employees-directory-2), [Employee](https://documentation.bamboohr.com/reference/get-employee-1), [Webhooks](https://documentation.bamboohr.com/docs/webhooks) | Verified at capability level | Official source set supports employee directory, employee detail, and webhook capability planning. Broader endpoint mapping remains out of scope for this audit. |

### 5.3 Wave 2

| Connector | Wave | Official source(s) | Audit classification | Notes |
|---|---|---|---|---|
| Unanet CRM | Wave 2 | [Swagger portal](https://dev.portal.unanet.io/platform/swagger/) | No-go for exact route planning | Accessible official content did not expose verifiable endpoint detail in this audit pass. Exact route planning remains unresolved. |
| Autodesk BuildingConnected | Wave 2 | [Cover page](https://aps.autodesk.com/buildingconnected-cover-page), [Overview](https://aps.autodesk.com/developer/overview/buildingconnected-and-tradetapp-apis) | No-go for exact route planning | Official overview pages support product/capability awareness but not exact route planning. |
| Autodesk TradeTapp | Wave 2 | [Cover page](https://aps.autodesk.com/buildingconnected-cover-page), [Overview](https://aps.autodesk.com/developer/overview/buildingconnected-and-tradetapp-apis) | No-go for exact route planning | Same limitation as BuildingConnected. |
| Microsoft 365 Graph Content | Wave 2 | [Graph overview](https://learn.microsoft.com/en-us/graph/overview), [OneDrive concept](https://learn.microsoft.com/en-us/graph/onedrive-concept-overview), [Delta query overview](https://learn.microsoft.com/en-us/graph/delta-query-overview) | Verified at capability level | The supplied source set supports content, OneDrive, and delta-query planning for read/ingest patterns. Exact route inventory is not enumerated in this audit. |
| Autodesk ACC Core | Wave 2 | [ACC overview](https://aps.autodesk.com/developer/overview/autodesk-construction-cloud) | No-go for exact route planning | Official overview supports capability-level planning only. Exact route families were not verified from the supplied source set. |

### 5.4 Wave 3

| Connector | Wave | Official source(s) | Audit classification | Notes |
|---|---|---|---|---|
| Oracle Primavera | Wave 3 | [REST API index](https://docs.oracle.com/cd/F37125_01/English/Integration_Documentation/rest_api/index.html) | Verified at capability level | Official REST reference exists. Future family authoring may use the reference directly for route-level planning, but exact route inventory is not reproduced here. |
| Microsoft 365 Graph Work-Orchestration | Wave 3 | [Graph overview](https://learn.microsoft.com/en-us/graph/overview) | No-go for exact route planning | The supplied Graph source set supports content and delta concepts, but not a verified work-orchestration contract surface. |
| Autodesk ACC Advanced Governance | Wave 3 | [ACC overview](https://aps.autodesk.com/developer/overview/autodesk-construction-cloud), [Reviews API GA blog](https://aps.autodesk.com/blog/autodesk-construction-cloud-reviews-api-general-availability) | No-go for exact route planning | The supplied source set is insufficient for exact route-level planning of the broader governance family. |

### 5.5 Required explicit no-go items

The following items are explicitly unresolved in this audit and must remain marked as no-go for exact route planning until future family authoring uses stronger official source evidence:

- Unanet exact endpoint structure
- Procore exact endpoint and webhook structure from the supplied introduction page alone
- Autodesk BuildingConnected exact route families
- Autodesk TradeTapp exact route families
- Autodesk ACC Core exact route families
- Autodesk ACC Advanced Governance exact route families
- Microsoft Graph work-orchestration exact contract surface beyond the supplied content/delta-oriented sources

---

## 6. Proposed MASTER Family Placement and Naming

### 6.1 Correct placement

The new connector program should remain under:

`docs/architecture/plans/MASTER/phase-1-deliverables/`

This is the correct placement because the work is still fundamentally:

- integration-backbone planning,
- data-plane custody reconciliation,
- adapter/backend/service-boundary planning,
- transport and read-model boundary planning.

It is not a new execution phase.

### 6.2 Naming and folder shape

The connector family should remain **flat in the Phase 1 deliverables folder**:

- follow existing MASTER flat file naming,
- follow the existing Phase 3 "master index plus detail family" pattern conceptually,
- avoid introducing a new nested directory until a later governance decision explicitly requires it.

Indexes should link related families. Connector family sprawl should be governed by file naming, not a new subfolder.

### 6.3 Locked placement decision

Before any `P1-F*` file is authored, this audit should be treated as the required gate confirming that:

- Phase 1 is still the correct home,
- the current plan stack has unresolved contradictions that must be acknowledged,
- the future connector family must be grounded in current implementation seams rather than the stale SharePoint-native custody model.

---

## 7. Exact Future File Tree Proposal

The following files should be created later, after this audit is accepted:

```text
docs/architecture/plans/MASTER/phase-1-deliverables/
├── P1-F1-Integration-Backbone-Family-Index.md
├── P1-F2-Wave-1-Connector-Index.md
├── P1-F3-Wave-2-Connector-Index.md
├── P1-F4-Wave-3-Connector-Index.md
├── P1-F5-Procore-Connector-Family.md
├── P1-F6-Sage-Intacct-Connector-Family.md
├── P1-F7-BambooHR-Connector-Family.md
├── P1-F8-Wave-1-Expansion-Pack-Index.md
├── P1-F9-Unanet-CRM-Connector-Family.md
├── P1-F10-Autodesk-BuildingConnected-Connector-Family.md
├── P1-F11-Autodesk-TradeTapp-Connector-Family.md
├── P1-F12-Microsoft-365-Graph-Content-Connector-Family.md
├── P1-F13-Autodesk-ACC-Core-Connector-Family.md
├── P1-F14-Oracle-Primavera-Connector-Family.md
├── P1-F15-Microsoft-365-Graph-Work-Orchestration-Connector-Family.md
├── P1-F16-Autodesk-ACC-Advanced-Governance-Connector-Family.md
├── P1-F17-Procore-Expansion-Pack-Family.md
├── P1-F18-Sage-Intacct-Expansion-Pack-Family.md
└── P1-F19-BambooHR-Expansion-Pack-Family.md
```

### 7.1 Naming notes

- `P1-F1` is the umbrella family index.
- `P1-F2` through `P1-F4` are wave indices.
- `P1-F5` through `P1-F16` are connector-family masters.
- `P1-F17` through `P1-F19` preserve the locked Wave 1 expansion-pack concept.

### 7.2 Deferred split policy

Deeper `-T0x` splits are deferred until each family is authored and justified. This audit does not authorize speculative `T01+` family decomposition yet.

---

## 8. Exact Files to Create and Update

### 8.1 File created by this audit pass

- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-CLOSEOUT-Native-Integration-Backbone-Repo-Truth-Audit.md`

### 8.2 Exact future files to create later

- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F1-Integration-Backbone-Family-Index.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F2-Wave-1-Connector-Index.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F3-Wave-2-Connector-Index.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F4-Wave-3-Connector-Index.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F5-Procore-Connector-Family.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F6-Sage-Intacct-Connector-Family.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F7-BambooHR-Connector-Family.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F8-Wave-1-Expansion-Pack-Index.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F9-Unanet-CRM-Connector-Family.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F10-Autodesk-BuildingConnected-Connector-Family.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F11-Autodesk-TradeTapp-Connector-Family.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F12-Microsoft-365-Graph-Content-Connector-Family.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F13-Autodesk-ACC-Core-Connector-Family.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F14-Oracle-Primavera-Connector-Family.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F15-Microsoft-365-Graph-Work-Orchestration-Connector-Family.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F16-Autodesk-ACC-Advanced-Governance-Connector-Family.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F17-Procore-Expansion-Pack-Family.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F18-Sage-Intacct-Expansion-Pack-Family.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-F19-BambooHR-Expansion-Pack-Family.md`

### 8.3 Exact existing files to update immediately

- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/package-relationship-map.md`
- `docs/architecture/plans/MASTER/README.md`
- `docs/architecture/plans/MASTER/00_HB-Intel_Master-Development-Summary-Plan.md`
- `docs/architecture/plans/MASTER/02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/README.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-A1-Data-Ownership-Matrix.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-A2-Source-of-Record-Register.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-B1-Proxy-Adapter-Implementation-Plan.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-C1-Backend-Service-Contract-Catalog.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-C2-a-Auth-Model-Extension-Proxy-Adapter-and-Route-Catalog.md`
- `packages/data-access/README.md`
- `packages/data-access/src/adapters/proxy/README.md`
- `backend/functions/README.md`

### 8.4 Exact follow-on plan files to reconcile after the new family exists

- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E4-Financial-Module-Field-Specification.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E4-T02-Budget-Line-Identity-and-Import.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E4-T08-Platform-Integration-and-Annotation-Scope.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E5-Schedule-Module-Field-Specification.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E6-Constraints-Module-Field-Specification.md`

---

## 9. Changes the Plans Must Call For in the Current Data Layer

The updated integration planning set must explicitly call for the following:

1. **Reframe custody as transitional hybrid**
   - Azure already backs most active domain data today.
   - SharePoint should be described as currently real for provisioning/site/list/document operations and selected operational surfaces, not as the active business-domain SoR across the board.

2. **Preserve v1 as ingest-first and read-only**
   - Keep connector v1 scoped to ingest, normalization, replay, reconciliation, audit, and published read-model consumption.
   - Preserve batch-led sync with event/webhook assist where the official source set supports it.

3. **Preserve thin canonical core over source-aligned normalization**
   - Reuse existing reconciliation and publication seams in Project Hub instead of replacing them with a heavy universal schema layer.

4. **Formalize published read-model consumption boundary**
   - Feature packages should consume published read models and governed repositories.
   - Feature packages should not host direct connector runtime logic.

5. **Add a real registry path**
   - `createProjectRegistryService()` cannot remain permanently in-memory if project identity, cross-source mapping, and read-model publication are to become durable.

6. **Reconcile proxy contracts against actual backend routes**
   - Do not advance connector-backed repo usage while proxy repository assumptions and backend route shapes remain materially misaligned.

7. **Wire proxy context at startup**
   - PWA startup must initialize proxy context if proxy mode remains part of the governed runtime path.

8. **Replace PWA mock domain source functions with published read-model providers**
   - `apps/pwa/src/sources/domainQueryFns.ts` should be replaced by governed read-model providers rather than direct connector calls.

9. **Keep connector runtime in backend/data-access seams**
   - Connector orchestration, normalization, replay, and canonical mapping belong in backend/data-access layers, not in feature-package UI logic.

10. **Preserve Wave 1 expansion-pack concept**
    - Expansion packs for Procore, Sage Intacct, and BambooHR remain reserved and must stay in the future file tree.

---

## 10. Verification Performed

This audit pass verified documentation truth only.

### 10.1 Repo path verification

All cited local repo paths in this document were checked for existence during the audit pass, including:

- current-state and MASTER governing files,
- backend service and function paths,
- data-access, query-hooks, shell, provisioning, PWA, Admin, and Project Hub evidence paths,
- local README targets listed for immediate update.

### 10.2 Stale-claim coverage verification

The audit explicitly references the stale-claim files requested in the task:

- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/package-relationship-map.md`
- `docs/architecture/plans/MASTER/README.md`
- `docs/architecture/plans/MASTER/00_HB-Intel_Master-Development-Summary-Plan.md`
- `docs/architecture/plans/MASTER/02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/README.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-A1-Data-Ownership-Matrix.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-A2-Source-of-Record-Register.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-B1-Proxy-Adapter-Implementation-Plan.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-C1-Backend-Service-Contract-Catalog.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-C2-a-Auth-Model-Extension-Proxy-Adapter-and-Route-Catalog.md`
- `packages/data-access/README.md`
- `packages/data-access/src/adapters/proxy/README.md`
- `backend/functions/README.md`

### 10.3 Future file naming verification

The proposed future `P1-F1` through `P1-F19` file names are unique, flat, Phase-1-scoped, and consistent with existing MASTER naming conventions.

### 10.4 No-go verification discipline

All no-go items in Section 5 are tied to limitations in the supplied and accessible official source set. No endpoint structures were invented from memory.

---

## 11. Conclusion

The locked native-integration decision set is broadly salvageable, but it cannot be carried forward on the existing assumption that Phase 1 already delivered a SharePoint-native business data plane and a fully reconciled proxy/backend contract surface.

Current repo truth supports the following preserved direction:

- one Phase 1 MASTER umbrella integration backbone family,
- transitional hybrid custody,
- ingest-first/read-only v1 posture,
- batch-led sync with event/webhook assist,
- thin canonical core over source-aligned normalization,
- published read-model consumption boundary,
- the locked Wave 1 / Wave 2 / Wave 3 connector set,
- preserved Wave 1 expansion packs.

Current repo truth also requires the future plan family to start from what actually exists:

- Azure Table-backed domain services,
- SharePoint-backed provisioning and selected operational surfaces,
- partially implemented but unreconciled proxy/data-access seams,
- unwired startup/runtime seams,
- already-useful normalization, reconciliation, and publication seams in Project Hub.

No `P1-F*` connector family file should be authored until the immediate reconciliation set in Section 8.3 is accepted as the required downstream update scope.
