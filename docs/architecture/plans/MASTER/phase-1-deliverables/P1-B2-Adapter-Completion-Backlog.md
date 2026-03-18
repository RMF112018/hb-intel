# P1-B2: Adapter Completion Backlog

| Field | Value |
|---|---|
| **Doc ID** | P1-B2 |
| **Phase** | Phase 1 |
| **Workstream** | B — Proxy Adapter Implementation |
| **Document Type** | Status Tracker |
| **Owner** | Frontend Platform Team |
| **Update Authority** | B-workstream lead; status changes require evidence per gate definitions below |
| **Last Reviewed Against Repo Truth** | 2026-03-18 |
| **References** | P1-B1 (Engineering Plan), P1-C1 (Service Contract Catalog), P1-C2 (Auth Hardening), P1-E1 (Contract Test Suite) |

**Evidence expectations:** A status change requires the evidence defined in the gate checklist for the target status. "Passes tests" means a CI-reproducible green run, not a local-only claim.

---

## Status Model

All adapter domain tracking in this document uses the following status progression.

| Status | Code | Meaning |
|---|---|---|
| Stub | `STUB` | Factory throws `AdapterNotImplementedError`; type exists but no real implementation |
| Planned | `PLANNED` | In scope for a phase; no implementation work started |
| Implementation-Ready | `IMPL_READY` | Port interface frozen, dependencies identified, coding can begin |
| In Progress | `IN_PROGRESS` | Active implementation underway |
| Code Complete (Mocked) | `CODE_COMPLETE_MOCK` | Implementation passes all vitest tests against mocked fetch; not yet validated against real backend |
| Blocked | `BLOCKED` | Cannot proceed; upstream dependency unresolved |
| Contract-Aligned | `CONTRACT_ALIGNED` | C1 routes frozen; adapter paths reconciled; error envelope (D3) and pagination (D4) aligned |
| Integration-Ready | `INTEGRATION_READY` | Backend deployed; MSAL registered; CORS configured; env vars set; ready for real HTTP calls |
| Staging-Ready | `STAGING_READY` | Passes E1 contract tests against staging backend |
| Production-Active | `PROD_ACTIVE` | Live in production; mock fallback removed for this domain |
| Deferred | `DEFERRED` | Explicitly deferred to a later phase |

---

## Proxy Adapter: Domain Completion Matrix

B1 implements all 11 domain repositories against mocked fetch in Phase 1 per the engineering plan. C1 backend routes are locked for 3 domains; the remaining 8 proceed with provisional route assumptions and will reconcile before production activation.

| Domain | Port Interface | Method Families | Total | Phase Target | Status | B1 Task | Route Status |
|---|---|---|---|---|---|---|---|
| **Lead** | `ILeadRepository` | CRUD (5), Search (1) | 6 | Phase 1 | `IMPL_READY` | Task 3 | C1 locked |
| **Project** | `IProjectRepository` | CRUD (5), Aggregate (1) | 6 | Phase 1 | `IMPL_READY` | Task 4 | C1 locked; A8 |
| **Estimating** | `IEstimatingRepository` | Tracker CRUD (5), Kickoff (2) | 7 | Phase 1 | `IMPL_READY` | Task 5 | C1 base locked; D2 |
| **Auth** | `IAuthRepository` | Current User (1), Roles (2), Permissions (1), Assignment (2) | 6 | Phase 1 | `IMPL_READY` | Task 7 | A9 provisional |
| **Schedule** | `IScheduleRepository` | Activity CRUD (5), Metrics (1) | 6 | Phase 1* | `PLANNED` | Task 5 | D1, D6 provisional |
| **Buyout** | `IBuyoutRepository` | Entry CRUD (5), Summary (1) | 6 | Phase 1* | `PLANNED` | Task 5 | D1, D6 provisional |
| **Compliance** | `IComplianceRepository` | Entry CRUD (5), Summary (1) | 6 | Phase 1* | `PLANNED` | Task 6 | D1, D6 provisional |
| **Contract** | `IContractRepository` | Contract CRUD (5), Approvals (2) | 7 | Phase 1* | `PLANNED` | Task 6 | D1, D6 provisional |
| **Risk** | `IRiskRepository` | Item CRUD (5), Management (1) | 6 | Phase 1* | `PLANNED` | Task 6 | D1, D6 provisional |
| **Scorecard** | `IScorecardRepository` | Scorecard CRUD (5), Versions (1) | 6 | Phase 1* | `PLANNED` | Task 7 | D1, D6 provisional |
| **PMP** | `IPmpRepository` | Plan CRUD (5), Signatures (2) | 7 | Phase 1* | `PLANNED` | Task 7 | D1, D6 provisional |

*Phase 1 scope for mocked-fetch implementation. Production activation for these domains is blocked until C1 route finalization resolves D1/D6.

### Method Family Detail by Domain

Each domain's port methods are grouped into route groups below. Route patterns are B1-assumed shapes — not final contracts. Provisional routes will be reconciled when the owning open decision is resolved.

**Route confidence key:** `C1 locked` = route confirmed in C1 catalog. `Provisional` = B1-assumed shape, pending open decision. `A9` = no C1/C2 catalog entry exists.

#### Lead (`ILeadRepository`) — C1 locked

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| CRUD | `getAll`, `getById`, `create`, `update`, `delete` | `GET/POST /api/leads`, `GET/PUT/DELETE /api/leads/{id}` | C1 locked | — |
| Search | `search` | `GET /api/leads?q={query}` | C1 locked | — |

#### Project (`IProjectRepository`) — C1 locked; A8 aggregate

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| CRUD | `getProjects`, `getProjectById`, `createProject`, `updateProject`, `deleteProject` | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/{id}` | C1 locked | — |
| Aggregate | `getPortfolioSummary` | `GET /api/projects/portfolio-summary` | C1 locked; A8 assumed | A8 |

#### Estimating (`IEstimatingRepository`) — C1 base locked; D2 sub-resource open

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Tracker CRUD | `getAllTrackers`, `getTrackerById`, `createTracker`, `updateTracker`, `deleteTracker` | `GET/POST /api/estimating/trackers`, `GET/PUT/DELETE /api/estimating/trackers/{id}` | C1 base locked | D2 |
| Kickoff | `getKickoff`, `createKickoff` | `GET/POST /api/estimating/kickoffs?projectId={id}` | Provisional | D2 |

#### Auth (`IAuthRepository`) — A9 provisional; no CRUD pattern

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Current User | `getCurrentUser` | `GET /api/auth/me` | A9 — not in C1/C2 catalog | A9 |
| Roles | `getRoles`, `getRoleById` | `GET /api/auth/roles`, `GET /api/auth/roles/{id}` | A9 — not in C1/C2 catalog | A9 |
| Permissions | `getPermissionTemplates` | `GET /api/auth/permissions/templates` | A9 — not in C1/C2 catalog | A9 |
| Role Assignment | `assignRole`, `removeRole` | `POST/DELETE /api/auth/users/{userId}/roles/{roleId}` | A9 — not in C1/C2 catalog | A9 |

#### Schedule (`IScheduleRepository`) — D1, D6 provisional; project-scoped

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Activity CRUD | `getActivities`, `getActivityById`, `createActivity`, `updateActivity`, `deleteActivity` | `GET/POST /api/projects/{projectId}/schedule`, `GET/PUT/DELETE /api/schedule/{id}` | Provisional | D1, D6 |
| Metrics | `getMetrics` | `GET /api/projects/{projectId}/schedule/metrics` | Provisional | D6 |

#### Buyout (`IBuyoutRepository`) — D1, D6 provisional; project-scoped

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Entry CRUD | `getEntries`, `getEntryById`, `createEntry`, `updateEntry`, `deleteEntry` | `GET/POST /api/projects/{projectId}/buyout`, `GET/PUT/DELETE /api/buyout/{id}` | Provisional | D1, D6 |
| Summary | `getSummary` | `GET /api/projects/{projectId}/buyout/summary` | Provisional | D6 |

#### Compliance (`IComplianceRepository`) — D1, D6 provisional; project-scoped

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Entry CRUD | `getEntries`, `getEntryById`, `createEntry`, `updateEntry`, `deleteEntry` | `GET/POST /api/projects/{projectId}/compliance`, `GET/PUT/DELETE /api/compliance/{id}` | Provisional | D1, D6 |
| Summary | `getSummary` | `GET /api/projects/{projectId}/compliance/summary` | Provisional | D6 |

#### Contract (`IContractRepository`) — D1, D6 provisional; project-scoped

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Contract CRUD | `getContracts`, `getContractById`, `createContract`, `updateContract`, `deleteContract` | `GET/POST /api/projects/{projectId}/contracts`, `GET/PUT/DELETE /api/contracts/{id}` | Provisional | D1, D6 |
| Approvals | `getApprovals`, `createApproval` | `GET/POST /api/contracts/{contractId}/approvals` | Provisional | D6 |

#### Risk (`IRiskRepository`) — D1, D6 provisional; project-scoped

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Item CRUD | `getItems`, `getItemById`, `createItem`, `updateItem`, `deleteItem` | `GET/POST /api/projects/{projectId}/risk`, `GET/PUT/DELETE /api/risk/{id}` | Provisional | D1, D6 |
| Management | `getManagement` | `GET /api/projects/{projectId}/risk/management` | Provisional | D6 |

#### Scorecard (`IScorecardRepository`) — D1, D6 provisional; project-scoped

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Scorecard CRUD | `getScorecards`, `getScorecardById`, `createScorecard`, `updateScorecard`, `deleteScorecard` | `GET/POST /api/projects/{projectId}/scorecards`, `GET/PUT/DELETE /api/scorecards/{id}` | Provisional | D1, D6 |
| Versions | `getVersions` | `GET /api/scorecards/{scorecardId}/versions` | Provisional | D6 |

#### PMP (`IPmpRepository`) — D1, D6 provisional; project-scoped

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Plan CRUD | `getPlans`, `getPlanById`, `createPlan`, `updatePlan`, `deletePlan` | `GET/POST /api/projects/{projectId}/pmp`, `GET/PUT/DELETE /api/pmp/{id}` | Provisional | D1, D6 |
| Signatures | `getSignatures`, `createSignature` | `GET/POST /api/pmp/{pmpId}/signatures` | Provisional | D6 |

---

## Definition of Done: Status Gate Checklists

### `CODE_COMPLETE_MOCK`

- [ ] Proxy adapter class implements every method on its port interface
- [ ] All vitest tests pass against mocked fetch (no network calls)
- [ ] `check-types` clean for the touched package
- [ ] Lint clean for the touched package
- [ ] Factory wiring registers the adapter for the domain

### `CONTRACT_ALIGNED`

- [ ] C1 routes frozen for this domain (no provisional paths remain)
- [ ] Adapter path constants reconciled with C1 catalog
- [ ] Error envelope aligned with D3 resolution (`.message` vs `.error`)
- [ ] Pagination default aligned with D4 resolution (B1: 25 via `DEFAULT_PAGE_SIZE`, C1: 50)
- [ ] PATCH vs PUT decision applied per D5 resolution

### `INTEGRATION_READY`

- [ ] Backend Azure Functions deployed for this domain
- [ ] MSAL app registration includes required scopes
- [ ] CORS configured for frontend origins
- [ ] Environment variables set (`HBC_ADAPTER_MODE`, domain endpoint URLs)
- [ ] OBO token exchange verified end-to-end

### `STAGING_READY`

- [ ] E1 contract tests pass against staging backend
- [ ] Error responses match agreed envelope shape
- [ ] Pagination behavior matches agreed defaults
- [ ] Auth token flow works with staging identity provider

### `PROD_ACTIVE`

- [ ] Live traffic verified in production
- [ ] Mock fallback removed for this domain
- [ ] Domain-level override (`HBC_ADAPTER_MODE_{DOMAIN}`) tested
- [ ] Monitoring and error reporting confirmed

---

## Blocking Dependencies

### Execution Summary

| Lane | Scope | Can Proceed Now? | Blocked Until |
|---|---|---|---|
| **Mocked-fetch implementation** | B1 Tasks 0–10: all 11 domain adapters | **Yes** — no external blockers | — |
| **Route reconciliation** | Align adapter paths with C1 catalog | Lead, Project, Estimating base only | C1 finalizes remaining 8 domain routes (D1, D2, D5, D6) |
| **Response contract alignment** | Error envelope, pagination defaults | No | C1 + B1 resolve D3, D4 |
| **Auth integration** | MSAL registration, OBO flow, CORS | No | C2 delivers auth middleware and registers scopes |
| **Write safety** | Retry, idempotency, failure classification | No | D1 delivers `withRetry()`, idempotency guard, `WriteFailureReason` |
| **Contract testing** | Zod schema + MSW harness against staging | No | E1 delivers test harness; staging backend available |
| **Production activation** | Remove mock fallback, live traffic | No | All above lanes resolved per domain |

B1 Tasks 0–10 can proceed immediately against mocked fetch. Production activation is blocked by the convergence of C1, C2, D1, and E1 deliverables — see workstream detail below.

### P1-B1 — Frontend Adapter Implementation

**Owner:** B-workstream. **Scope:** All 11 proxy adapter domain repositories.

No external blockers for mocked-fetch implementation. All B1 tasks (vitest setup → `ProxyHttpClient` → `ProxyBaseRepository` → 11 domain repos → factory wiring → integration tests) proceed against mocked fetch. See P1-B1 engineering plan for full task breakdown.

Currently, all non-mock adapter modes throw `AdapterNotImplementedError` from the factory (`packages/data-access/src/factory.ts`). Phase 1 replaces these stubs with real proxy implementations.

#### B1 Open Decisions Affecting Route Shape

These decisions do not block mocked-fetch implementation but must be resolved before any domain can reach `CONTRACT_ALIGNED`.

| ID | Decision | Owner | Impact | When Needed |
|---|---|---|---|---|
| D1 | Singular vs plural route paths for Schedule, Buyout, Risk, Scorecard | P1-C1 | Path constants in 4 domain adapters | Before `CONTRACT_ALIGNED` |
| D2 | Estimating sub-resource routing (`/trackers`, `/kickoffs`) vs flat | P1-C1 | May restructure estimating adapter paths | Before Task 5 ideally |
| D3 | Error envelope field name (`.message` vs `.error`) | P1-C1 + B1 | `ProxyHttpClient.handleResponse()` branch | Before `CONTRACT_ALIGNED` |
| D4 | Pagination default alignment (B1: 25 via `DEFAULT_PAGE_SIZE`, C1: 50) | P1-C1 + B1 | `mapPagedResponse` fallback + model constants | Before `CONTRACT_ALIGNED` |
| D5 | Whether proxy adapters need PATCH support | P1-C1 | C1 defines PATCH routes; B1 currently uses PUT only | Before `CONTRACT_ALIGNED` |
| D6 | Nested project-scoped paths vs flat query-param pattern | P1-C1 | Affects list/aggregate routes in 8 project-scoped repos | Before `CONTRACT_ALIGNED` |

#### B1 Assumptions

| ID | Assumption | Confidence | Upstream Owner |
|---|---|---|---|
| A1 | API paths follow C1 catalog patterns | High for Lead/Project/Estimating; provisional for remaining 8 | P1-C1 |
| A2 | Collection envelope: `{ data: T[], total, page, pageSize }` | High | P1-C1 |
| A3 | Single-item envelope: `{ data: T }` | High | P1-C1 |
| A4 | Error responses contain a human-readable `message` field | Medium — D3 open | P1-C1, P1-C2 |
| A5 | Default pageSize fallback is 25 (`DEFAULT_PAGE_SIZE`) | Medium — D4 open | P1-C1 |
| A6 | Bearer token in `Authorization` header accepted by backend | High | P1-C2 |
| A7 | Project-scoped routes use nested paths | Medium — D6 open | P1-C1 |
| A8 | Aggregate endpoints exist (portfolio summary, metrics) | Medium | P1-C1 |
| A9 | Auth management routes (`/api/auth/*`) exist | Low — not in C1 or C2 catalog | P1-C1, P1-C2 |

### P1-C1 — Backend Service Contract Catalog

**Owner:** C1-workstream. **Blocks:** `CODE_COMPLETE_MOCK` → `CONTRACT_ALIGNED` for all 11 domains.

C1 owns route path finalization, response envelope shape, and HTTP method definitions for all backend Azure Functions endpoints. Until C1 freezes routes for a domain, that domain's adapter cannot be verified against real paths.

**Current state:**
- **C1 locked (3 domains):** Lead, Project, Estimating base paths
- **Provisional (8 domains):** Schedule, Buyout, Compliance, Contract, Risk, Scorecard, PMP, Auth — route shapes assumed per B1, pending D1/D2/D5/D6 resolution

**Unresolved items blocking `CONTRACT_ALIGNED`:**
- D1: Singular vs plural paths — affects 4 domain path constants
- D2: Estimating sub-resource structure — affects tracker/kickoff route groups
- D3: Error envelope field name — affects `ProxyHttpClient.handleResponse()` (joint with B1)
- D4: Pagination default — affects `mapPagedResponse` fallback (joint with B1)
- D5: PATCH support — affects update methods across all domains
- D6: Project-scoped path pattern — affects list/aggregate routes in 8 domains

### P1-C2 — Auth and Validation Hardening

**Owner:** C2-workstream. **Blocks:** `CONTRACT_ALIGNED` → `INTEGRATION_READY` for all domains.

C2 owns MSAL app registration, OBO token exchange middleware, auth validation at service boundaries, and CORS configuration. No domain can accept real HTTP traffic until C2 delivers a working auth pipeline.

**Unresolved items:**
- A9: Auth management routes (`/api/auth/*`) have no C1 or C2 catalog entry — the Auth domain's 4 route groups (current user, roles, permissions, role assignment) have no confirmed backend paths
- D3: Error envelope field name — joint ownership with C1; affects how auth errors are surfaced to `ProxyHttpClient`

### P1-D1 — Write Safety, Retry, and Recovery

**Owner:** D1-workstream. **Blocks:** production activation (Phase 1 acceptance gate: "failures are recoverable and visible").

D1 owns retry policy implementation in `ProxyHttpClient`, frontend idempotency key generation, backend idempotency guard middleware, and write failure classification. Without D1 deliverables, write operations through proxy adapters have no retry, no idempotency protection, and no structured failure reporting.

**Key deliverables affecting B2:**
- `withRetry()` higher-order function for `ProxyHttpClient`
- `WriteFailureReason` enum (`NETWORK_UNREACHABLE`, `VALIDATION_FAILED`, `CONFLICT_DETECTED`)
- Idempotency key generation interface and `Idempotency-Key` header injection
- Backend idempotency guard middleware (Azure Functions)

**Cross-ref:** P1-D1 plan for full scope. Retry and idempotency are `ProxyHttpClient` concerns — individual domain adapters do not implement their own retry logic.

### P1-E1 — Contract and Integration Test Hardening

**Owner:** E1-workstream. **Blocks:** `INTEGRATION_READY` → `STAGING_READY` for all domains.

E1 owns the Zod schema contract test suite and MSW-based test harness that validates adapter behavior against a staging backend. No domain can reach `STAGING_READY` without passing E1 contract tests.

**Key deliverables affecting B2:**
- Zod schemas matching C1 response contracts per domain
- MSW handlers for integration test isolation
- Staging environment test runner configuration
- Per-domain contract test pass/fail reporting

---

## Adapter Type Overview

| Adapter Type | Description | Current Status | Target Phase | `HBC_ADAPTER_MODE` Value |
|---|---|---|---|---|
| **mock** | In-memory seed data; fully functional | Complete | All phases | `'mock'` |
| **proxy** | Calls Azure Functions via MSAL OBO | `STUB` | Phase 1 | `'proxy'` |
| **sharepoint** | Direct PnPjs calls (SPFx-only surface) | `STUB` | Future phase | `'sharepoint'` |
| **api** | REST / Azure SQL direct calls | Reserved | Future phase | `'api'` |

---

## Future-Phase Placeholders

The following adapter types are tracked here for completeness. Their domain matrices, definition-of-done gates, and blocking dependencies will be refined when those phases begin active planning.

### SharePoint Adapter (Future Phase)

All 11 domains are candidates for SharePoint adapter implementation in a future phase targeting collaborative authoring on the SPFx surface. Blocking dependency: site provisioning and list schema definition.

### API Adapter (Future Phase)

All 11 domains are candidates for direct API adapter implementation in a future phase. Blocking dependency: Azure SQL schema and direct REST endpoint deployment.

---

## Factory Wiring Status

**Current File:** `packages/data-access/src/factory.ts`

| Change | Current State | Phase 1 Change | Rationale |
|---|---|---|---|
| Mock adapter registration | Implemented | Keep as-is | Default for dev/test |
| Proxy adapter import | Stub only | Implement all domains per matrix above | Phase 1 critical path |
| `HBC_ADAPTER_MODE` read | Implemented | Add env validation guard (see P1-B3) | Prevent silent mock fallback |
| Domain-level overrides | Not present | Implement `HBC_ADAPTER_MODE_{DOMAIN}` per domain | Gradual rollout support |

---

## Update Cadence

This backlog is updated:
- **On status change:** With evidence per the gate checklist for the new status
- **On B1 assumption or open decision resolution:** Reflect the resolved decision and update affected domain rows
- **On cross-workstream dependency change:** When C1, C2, or E1 status changes affect B2 readiness
- **Per phase start:** Phase target confirmation and new domain prioritization
