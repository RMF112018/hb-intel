# P1-B2: Adapter Completion Backlog

| Field | Value |
|---|---|
| **Doc ID** | P1-B2 |
| **Phase** | Phase 1 (primary); future phases tracked as placeholders |
| **Workstream** | B — Adapter Completion |
| **Document Type** | Status Tracker |
| **Status** | Active Reference |
| **Owner** | Frontend Platform Team |
| **Update Authority** | B-workstream lead; status changes require evidence per gate definitions below |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **References** | P1-B1 (Engineering Plan), P1-B3 (Environment Configuration), P1-C1 (Service Contract Catalog), P1-C2 (Auth Hardening), P1-D1 (Write Safety), P1-E1 (Contract Test Suite) |

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
| Code Complete (Mocked) | `CODE_COMPLETE_MOCK` | Implementation passes all vitest tests against mocked data source; not yet validated against real backend or environment |
| Blocked | `BLOCKED` | Cannot proceed; upstream dependency unresolved |
| Contract-Aligned | `CONTRACT_ALIGNED` | Upstream contracts frozen; adapter paths or schemas reconciled; error envelope field priority (D3) and pagination defaults (D4) aligned |
| Integration-Ready | `INTEGRATION_READY` | Target environment deployed and configured; ready for real data source calls |
| Staging-Ready | `STAGING_READY` | Passes E1 contract tests against staging backend |
| Production-Active | `PROD_ACTIVE` | Live in production; mock fallback removed for this domain |
| Deferred | `DEFERRED` | Explicitly deferred to a later phase |

**Terminology note:** Open decisions D1–D6 refer to B1 engineering plan decisions (see [B1 Open Decisions table](#b1-open-decisions-affecting-route-shape)). P1-D1 refers to the Write Safety, Retry, and Recovery workstream. The "D" prefix is coincidental — context and the "P1-" workstream prefix disambiguate.

---

## Proxy Adapter: Domain Completion Matrix

B1 targets all 11 domain repositories for implementation against mocked fetch in Phase 1 (10 data domains in the table below; Auth tracked separately in its [own section](#auth-domain-special-case-tracking)). C1 backend routes are locked for 3 data domains (Lead, Project, Estimating — including A8 aggregate and D2 sub-resources, resolved per P1-E1). Transport conventions D1 and D6 are **LOCKED** for all 7 project-scoped domains; those domains' C1 route *handlers* are not yet delivered and remain the primary production-activation blocker.

| Domain | Port Interface | Method Families | Total | Phase Target | Status | B1 Task | Route Status |
|---|---|---|---|---|---|---|---|
| **Lead** | `ILeadRepository` | CRUD (5), Search (1) | 6 | Phase 1 | `CODE_COMPLETE_MOCK` | Task 3 | C1 locked |
| **Project** | `IProjectRepository` | CRUD (5), Aggregate (1) | 6 | Phase 1 | `CODE_COMPLETE_MOCK` | Task 4 | C1 locked (A8 aggregate locked: `/api/projects/summary`) |
| **Estimating** | `IEstimatingRepository` | Tracker CRUD (5), Kickoff (2) | 7 | Phase 1 | `CODE_COMPLETE_MOCK` | Task 5 | C1 locked (D2 sub-resources locked: `/api/estimating/trackers/`, `/api/estimating/kickoffs/`) |
| **Schedule** | `IScheduleRepository` | Activity CRUD (5), Metrics (1) | 6 | Phase 1 | `CODE_COMPLETE_MOCK` | Task 5 | D1, D6 LOCKED* |
| **Buyout** | `IBuyoutRepository` | Entry CRUD (5), Summary (1) | 6 | Phase 1 | `CODE_COMPLETE_MOCK` | Task 5 | D1, D6 LOCKED* |
| **Compliance** | `IComplianceRepository` | Entry CRUD (5), Summary (1) | 6 | Phase 1 | `CODE_COMPLETE_MOCK` | Task 6 | D1, D6 LOCKED* |
| **Contract** | `IContractRepository` | Contract CRUD (5), Approvals (2) | 7 | Phase 1 | `CODE_COMPLETE_MOCK` | Task 6 | D1, D6 LOCKED* |
| **Risk** | `IRiskRepository` | Item CRUD (5), Management (1) | 6 | Phase 1 | `CODE_COMPLETE_MOCK` | Task 6 | D1, D6 LOCKED* |
| **Scorecard** | `IScorecardRepository` | Scorecard CRUD (5), Versions (1) | 6 | Phase 1 | `CODE_COMPLETE_MOCK` | Task 7 | D1, D6 LOCKED* |
| **PMP** | `IPmpRepository` | Plan CRUD (5), Signatures (2) | 7 | Phase 1 | `CODE_COMPLETE_MOCK` | Task 7 | D1, D6 LOCKED* |

*D1 and D6 are now **LOCKED** per P1-E1 (plural paths, nested project-scoped paths). Production activation blocked until C1 delivers backend route handlers for these domains.

### Method Family Detail by Domain

Each domain's port methods are grouped into route groups below. Route patterns are B1-assumed shapes — not final contracts. Transport conventions (D1–D6) are locked per P1-E1. Route patterns below reflect locked conventions. Production activation remains blocked until C1 delivers backend route handlers.

**Route confidence key:** `C1 locked` = route confirmed in C1 catalog. `Convention-locked` = route shape follows locked D1/D6 conventions; production activation blocked until C1 delivers backend handler. `A9` = no C1/C2 catalog entry exists.

#### Lead (`ILeadRepository`) — C1 locked

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| CRUD | `getAll`, `getById`, `create`, `update`, `delete` | `GET/POST /api/leads`, `GET/PUT/DELETE /api/leads/{id}` | C1 locked | — |
| Search | `search` | `GET /api/leads?q={query}` | C1 locked | — |

#### Project (`IProjectRepository`) — C1 locked (A8 aggregate locked)

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| CRUD | `getProjects`, `getProjectById`, `createProject`, `updateProject`, `deleteProject` | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/{id}` | C1 locked | — |
| Aggregate | `getPortfolioSummary` | `GET /api/projects/summary` | A8 locked per P1-E1 decision 11 | — |

#### Estimating (`IEstimatingRepository`) — C1 locked (D2 sub-resources locked)

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Tracker CRUD | `getAllTrackers`, `getTrackerById`, `createTracker`, `updateTracker`, `deleteTracker` | `GET/POST /api/estimating/trackers`, `GET/PUT/DELETE /api/estimating/trackers/{id}` | C1 locked (D2 resolved per P1-E1) | — |
| Kickoff | `getKickoff`, `createKickoff` | `GET/POST /api/estimating/kickoffs?projectId={id}` | C1 locked (D2 resolved per P1-E1) | — |

#### Schedule (`IScheduleRepository`) — Convention-locked (D1, D6 resolved); project-scoped

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Activity CRUD | `getActivities`, `getActivityById`, `createActivity`, `updateActivity`, `deleteActivity` | `GET/POST /api/projects/{projectId}/schedule`, `GET/PUT/DELETE /api/schedule/{id}` | Convention-locked (D1, D6 resolved) | — |
| Metrics | `getMetrics` | `GET /api/projects/{projectId}/schedule/metrics` | Convention-locked (D6 resolved) | — |

#### Buyout (`IBuyoutRepository`) — Convention-locked (D1, D6 resolved); project-scoped

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Entry CRUD | `getEntries`, `getEntryById`, `createEntry`, `updateEntry`, `deleteEntry` | `GET/POST /api/projects/{projectId}/buyout`, `GET/PUT/DELETE /api/buyout/{id}` | Convention-locked (D1, D6 resolved) | — |
| Summary | `getSummary` | `GET /api/projects/{projectId}/buyout/summary` | Convention-locked (D6 resolved) | — |

#### Compliance (`IComplianceRepository`) — Convention-locked (D1, D6 resolved); project-scoped

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Entry CRUD | `getEntries`, `getEntryById`, `createEntry`, `updateEntry`, `deleteEntry` | `GET/POST /api/projects/{projectId}/compliance`, `GET/PUT/DELETE /api/compliance/{id}` | Convention-locked (D1, D6 resolved) | — |
| Summary | `getSummary` | `GET /api/projects/{projectId}/compliance/summary` | Convention-locked (D6 resolved) | — |

#### Contract (`IContractRepository`) — Convention-locked (D1, D6 resolved); project-scoped

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Contract CRUD | `getContracts`, `getContractById`, `createContract`, `updateContract`, `deleteContract` | `GET/POST /api/projects/{projectId}/contracts`, `GET/PUT/DELETE /api/contracts/{id}` | Convention-locked (D1, D6 resolved) | — |
| Approvals | `getApprovals`, `createApproval` | `GET/POST /api/contracts/{contractId}/approvals` | Convention-locked (D6 resolved) | — |

#### Risk (`IRiskRepository`) — Convention-locked (D1, D6 resolved); project-scoped

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Item CRUD | `getItems`, `getItemById`, `createItem`, `updateItem`, `deleteItem` | `GET/POST /api/projects/{projectId}/risk`, `GET/PUT/DELETE /api/risk/{id}` | Convention-locked (D1, D6 resolved) | — |
| Management | `getManagement` | `GET /api/projects/{projectId}/risk/management` | Convention-locked (D6 resolved) | — |

#### Scorecard (`IScorecardRepository`) — Convention-locked (D1, D6 resolved); project-scoped

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Scorecard CRUD | `getScorecards`, `getScorecardById`, `createScorecard`, `updateScorecard`, `deleteScorecard` | `GET/POST /api/projects/{projectId}/scorecards`, `GET/PUT/DELETE /api/scorecards/{id}` | Convention-locked (D1, D6 resolved) | — |
| Versions | `getVersions` | `GET /api/scorecards/{scorecardId}/versions` | Convention-locked (D6 resolved) | — |

#### PMP (`IPmpRepository`) — Convention-locked (D1, D6 resolved); project-scoped

| Route Group | Methods | Route Pattern (B1 assumed) | Route Confidence | Open Decisions |
|---|---|---|---|---|
| Plan CRUD | `getPlans`, `getPlanById`, `createPlan`, `updatePlan`, `deletePlan` | `GET/POST /api/projects/{projectId}/pmp`, `GET/PUT/DELETE /api/pmp/{id}` | Convention-locked (D1, D6 resolved) | — |
| Signatures | `getSignatures`, `createSignature` | `GET/POST /api/pmp/{pmpId}/signatures` | Convention-locked (D6 resolved) | — |

---

## Auth Domain: Special-Case Tracking

Auth is tracked separately from the 10 data domains because it has no CRUD pattern, no C1 route catalog entry (A9), and its responsibilities split across three distinct layers: adapter implementation, backend auth subsystem, and platform runtime token context. Its SharePoint surface strategy is also an open decision.

### Auth Capability Groups

| Capability Group | Port Methods | Responsibility Layer | Proxy Route (B1 assumed) | Route Confidence | Upstream Owner |
|---|---|---|---|---|---|
| Current User | `getCurrentUser` | Runtime token → user profile | `GET /api/auth/me` | A9 — no catalog entry | P1-C2 |
| Role Retrieval | `getRoles`, `getRoleById` | Auth subsystem — role definitions | `GET /api/auth/roles`, `GET /api/auth/roles/{id}` | A9 — no catalog entry | P1-C2 |
| Permission Templates | `getPermissionTemplates` | Auth subsystem — RBAC config | `GET /api/auth/permissions/templates` | A9 — no catalog entry | P1-C2 |
| Role Assignment | `assignRole`, `removeRole` | Auth subsystem — write ops | `POST/DELETE /api/auth/users/{userId}/roles/{roleId}` | A9 — no catalog entry | P1-C2 |

**Responsibility layer key:**
- **Runtime token** — depends on MSAL token context already available in the app shell; the adapter translates token identity into a user profile. This is platform runtime behavior, not traditional adapter work.
- **Auth subsystem** — depends on a backend auth service that manages roles, permissions, and assignments. This may be a dedicated auth microservice or part of the Azure Functions backend. The adapter calls it, but the service design is C2-owned.

### Auth Status

| Item | Status | Notes |
|---|---|---|
| Port interface (`IAuthRepository`) | Frozen | 6 methods across 4 capability groups |
| Proxy adapter (mocked fetch) | `IMPL_READY` | B1 Task 7; can proceed against mocked fetch |
| Backend route catalog | **Missing** | A9: no `/api/auth/*` routes in C1 or C2 catalog |
| OBO token exchange for auth routes | **Unresolved** | C2 owns; auth OBO may differ from standard domain OBO |
| SharePoint surface strategy | **Open decision** | Proxy-only vs native SPFx Entra ID/Graph; deferred to future SP engineering plan |

### Auth Blocking Dependencies

- **B1 Task 7** can proceed with mocked fetch — no external blocker for `CODE_COMPLETE_MOCK`
- **A9 resolution** required before `CONTRACT_ALIGNED` — C2 must publish auth management route definitions
- **C2 auth middleware** required before `INTEGRATION_READY` — OBO flow for auth routes may differ from standard domain OBO if auth uses a separate backend service
- **SharePoint Auth adapter** is an open decision — not blocked, not designed; tracked as a future-phase open item (see SharePoint section below)

---

## Definition of Done: Status Gate Checklists

Gates apply per domain per adapter type. Not all gates apply to all adapter types — SharePoint adapters have no OBO or Azure Functions dependencies; API adapters have no PnPjs dependencies. Each gate item requires an evidence artifact (CI run link, PR, config confirmation, etc.). "Passes tests" means a CI-reproducible green run, not a local-only claim.

### `CODE_COMPLETE_MOCK`

| Dimension | Requirement | Applies To |
|---|---|---|
| **Port completeness** | Adapter implements every method on its port interface — CRUD, search, aggregate, sub-resource, and non-CRUD methods as applicable | All adapter types |
| **Test readiness** | All vitest tests pass against mocked data source (mocked fetch for proxy; mocked PnPjs for SP; mocked SQL client for API) | All adapter types |
| **Code quality** | `check-types` and lint clean for the touched package | All adapter types |
| **Factory wiring** | Factory returns the adapter for this domain/mode combination; `AdapterNotImplementedError` no longer thrown | All adapter types |
| **Documentation** | Adapter README updated with domain-specific implementation notes | All adapter types |
| **Evidence** | Link to passing CI run or reproducible local test output | Required |

### `CONTRACT_ALIGNED`

| Dimension | Requirement | Applies To |
|---|---|---|
| **Upstream contract** | C1 routes frozen for all method families in this domain — CRUD, aggregate, sub-resource, and search routes | Proxy |
| **Path reconciliation** | Adapter path constants match C1 catalog for every route group | Proxy |
| **Response contract** | Error envelope aligned (D3), pagination default aligned (D4), HTTP methods aligned (D5) | Proxy |
| **Schema alignment** | List/library column schemas match port interface field contracts | SharePoint (future) |
| **Evidence** | Link to C1 catalog entry, route freeze confirmation, or schema approval | Required |

### `INTEGRATION_READY`

| Dimension | Requirement | Applies To |
|---|---|---|
| **Backend deployment** | Azure Functions deployed for this domain's route groups | Proxy |
| **Auth configuration** | MSAL scopes registered; OBO token exchange verified end-to-end | Proxy |
| **Network configuration** | CORS configured for frontend origins; environment variables set | Proxy |
| **Site provisioning** | SP site provisioned; lists/libraries created with correct schemas | SharePoint (future) |
| **SPFx context** | PnPjs `SPFx()` initialization verified in app shell | SharePoint (future) |
| **Permissions** | SP site/list permissions mapped to app roles | SharePoint (future) |
| **Database deployment** | Azure SQL schema deployed; connection strings configured | API (future) |
| **Evidence** | Link to environment configuration, deployment confirmation, or provisioning log | Required |

### `STAGING_READY`

| Dimension | Requirement | Applies To |
|---|---|---|
| **Contract testing** | E1 contract tests pass against staging environment | All adapter types |
| **Response validation** | Error and pagination behavior matches agreed contracts | All adapter types |
| **Auth flow** | Token acquisition and validation work end-to-end in staging | All adapter types |
| **Non-CRUD verification** | Aggregate, search, sub-resource, and assignment methods tested — not just CRUD | All adapter types |
| **Throttling** | SPO 429 handling and batch patterns verified under load | SharePoint (future) |
| **Evidence** | Link to E1 test run against staging | Required |

### `PROD_ACTIVE`

| Dimension | Requirement | Applies To |
|---|---|---|
| **Live verification** | Real traffic verified in production for all method families | All adapter types |
| **Mock removal** | Mock fallback removed for this domain in this adapter type | All adapter types |
| **Override testing** | Domain-level override tested if mechanism exists (see [Factory Wiring open decision](#open-decision-domain-level-adapter-overrides)) | All adapter types |
| **Observability** | Monitoring, error reporting, and alerting confirmed | All adapter types |
| **Write safety** | Retry and idempotency behavior verified for write methods (D1 deliverables) | Proxy, API (future) |
| **Evidence** | Link to production verification run or monitoring dashboard | Required |

---

## Execution Progress Tracker

This table is the live tracking surface for adapter implementation progress. Update it when status changes, blockers are resolved, or ownership is assigned.

**Two-track readiness:** The "Blocker" column distinguishes between code-progress blockers (prevents starting implementation) and production-activation blockers (prevents going live). A domain with only production-activation blockers can proceed with mocked-fetch implementation.

**Ownership key:** `B / Data Access` = B-workstream frontend adapter implementation (Frontend Platform / Data Access team). `C2 / Auth` = C2-workstream auth subsystem design. Joint ownership means both teams must coordinate for the domain to progress past `CODE_COMPLETE_MOCK`.

### Proxy Adapter Progress

| Domain | Owner | Current Gate | Blocker | Evidence | Next Action | Last Updated |
|---|---|---|---|---|---|---|
| Lead | B / Data Access | `CODE_COMPLETE_MOCK` | Production activation: awaits C1 route delivery | 84 tests passing; factory wired | Await C1 route delivery for `CONTRACT_ALIGNED` | 2026-03-19 |
| Project | B / Data Access | `CODE_COMPLETE_MOCK` | Production activation: awaits C1 route delivery | 84 tests passing; factory wired | Await C1 route delivery for `CONTRACT_ALIGNED` | 2026-03-19 |
| Estimating | B / Data Access | `CODE_COMPLETE_MOCK` | Production activation: awaits C1 route delivery | 84 tests passing; factory wired | Await C1 route delivery for `CONTRACT_ALIGNED` | 2026-03-19 |
| Schedule | B / Data Access | `CODE_COMPLETE_MOCK` | Production activation: awaits C1 route delivery | 84 tests passing; factory wired | Await C1 route delivery for `CONTRACT_ALIGNED` | 2026-03-19 |
| Buyout | B / Data Access | `CODE_COMPLETE_MOCK` | Production activation: awaits C1 route delivery | 84 tests passing; factory wired | Await C1 route delivery for `CONTRACT_ALIGNED` | 2026-03-19 |
| Compliance | B / Data Access | `CODE_COMPLETE_MOCK` | Production activation: awaits C1 route delivery | 84 tests passing; factory wired | Await C1 route delivery for `CONTRACT_ALIGNED` | 2026-03-19 |
| Contract | B / Data Access | `CODE_COMPLETE_MOCK` | Production activation: awaits C1 route delivery | 84 tests passing; factory wired | Await C1 route delivery for `CONTRACT_ALIGNED` | 2026-03-19 |
| Risk | B / Data Access | `CODE_COMPLETE_MOCK` | Production activation: awaits C1 route delivery | 84 tests passing; factory wired | Await C1 route delivery for `CONTRACT_ALIGNED` | 2026-03-19 |
| Scorecard | B / Data Access | `CODE_COMPLETE_MOCK` | Production activation: awaits C1 route delivery | 84 tests passing; factory wired | Await C1 route delivery for `CONTRACT_ALIGNED` | 2026-03-19 |
| PMP | B / Data Access | `CODE_COMPLETE_MOCK` | Production activation: awaits C1 route delivery | 84 tests passing; factory wired | Await C1 route delivery for `CONTRACT_ALIGNED` | 2026-03-19 |
| Auth | B / Data Access + C2 / Auth | `IMPL_READY` | Code: A9 (route paths unresolved); Production: A9 + C1/C2 delivery | — | Await C2 auth route definition before B1 Task 7 | 2026-03-19 |

### SharePoint and API Adapter Progress

Not yet active. Rows will be added when those phases begin planning.

---

## Blocking Dependencies

### Execution Summary

| Lane | Scope | Can Proceed Now? | Blocked Until |
|---|---|---|---|
| **Mocked-fetch implementation** | B1 Tasks 0–10: all 11 domain adapters | **Yes** — no external blockers | — |
| **Route reconciliation** | Align adapter paths with C1 catalog | Lead, Project (incl. A8 aggregate), Estimating (incl. D2 sub-resources) locked per P1-E1; 7 convention-locked domains pending C1 handler delivery | C1 delivers remaining 7 data-domain route handlers; Auth (A9) catalog entry still needed |
| **Response contract alignment** | Error envelope, pagination defaults | **LOCKED** — D3 (`message`), D4 (25/100) resolved per P1-E1 | — |
| **Auth integration** | MSAL registration, OBO flow, CORS | No | C2 delivers auth middleware and registers scopes |
| **Write safety** | Retry, idempotency, failure classification | No | P1-D1 delivers `withRetry()`, idempotency guard, `WriteFailureReason` |
| **Contract testing** | Zod schema + MSW harness against staging | No | E1 delivers test harness; staging backend available |
| **Production activation** | Remove mock fallback, live traffic | No | All above lanes resolved per domain |

B1 Tasks 0–10 can proceed immediately against mocked fetch. Production activation is blocked by the convergence of C1, C2, P1-D1, and E1 deliverables — see workstream detail below.

### P1-B1 — Frontend Adapter Implementation

**Owner:** B-workstream. **Scope:** All 11 proxy adapter domain repositories.

No external blockers for mocked-fetch implementation. All B1 tasks (vitest setup → `ProxyHttpClient` → `ProxyBaseRepository` → 11 domain repos → factory wiring → integration tests) proceed against mocked fetch. See `P1-B1-Proxy-Adapter-Implementation-Plan.md` for full task breakdown.

Currently, 4 of 11 domains (Lead, Project, Estimating, Auth) throw `AdapterNotImplementedError` for proxy mode in the factory (`packages/data-access/src/factory.ts`). The remaining 7 project-scoped domains are factory-wired to real proxy implementations and have reached `CODE_COMPLETE_MOCK`. Phase 1 implementation completes the remaining 4 proxy repos.

#### B1 Open Decisions Affecting Route Shape

These decisions do not block mocked-fetch implementation but must be resolved before any domain can reach `CONTRACT_ALIGNED`.

| ID | Decision | Owner | Resolution | Status |
|---|---|---|---|---|
| D1 | Singular vs plural route paths | P1-C1 | **Plural** for all domain routes | **LOCKED** — P1-E1 |
| D2 | Estimating sub-resource routing (`/trackers`, `/kickoffs`) vs flat | P1-C1 | `/api/estimating/trackers/` and `/api/estimating/kickoffs/` | **LOCKED** — P1-E1 |
| D3 | Error envelope field priority | P1-C1 + B1 | **`message`** is primary field; `extractErrorMessage()` reads `.message` first, `.error` fallback for pre-Phase-1 routes | **LOCKED** — P1-E1 |
| D4 | Pagination default | P1-C1 + B1 | **25** (max 100) — B1 and C1 aligned | **LOCKED** — P1-E1 |
| D5 | PATCH support in domain routes | P1-C1 | **PUT-only** in Phase 1; PATCH deferred to Phase 2 | **LOCKED** — P1-E1 |
| D6 | Project-scoped path pattern | P1-C1 | **Nested** `/api/projects/{projectId}/{domain}` — B1 assumption confirmed | **LOCKED** — P1-E1 |

#### B1 Assumptions

| ID | Assumption | Confidence | Upstream Owner |
|---|---|---|---|
| A1 | API paths follow C1 catalog patterns | High for Lead/Project/Estimating (C1 locked); convention-locked (D1, D6 resolved per P1-E1) for 7 project-scoped domains pending C1 handler delivery; low for Auth (A9 unresolved) | P1-C1 |
| A2 | Collection envelope: `{ items: T[], total, page, pageSize }` | **LOCKED** — E1 locked decision confirms `items` field (not `data`) | P1-C1, P1-E1 |
| A3 | Single-item envelope: `{ data: T }` | High | P1-C1 |
| A4 | Error responses use `message` as primary field | **LOCKED** — D3 resolved: `.message` first, `.error` fallback for pre-Phase-1 routes | P1-C1, P1-E1 |
| A5 | Default pageSize is 25, max 100 | **LOCKED** — D4 resolved; B1 and C1 aligned | P1-C1, P1-E1 |
| A6 | Bearer token in `Authorization` header accepted by backend | High | P1-C2 |
| A7 | Project-scoped routes use nested paths (`/api/projects/{projectId}/{domain}`) | **LOCKED** — D6 resolved: nested paths confirmed | P1-C1, P1-E1 |
| A8 | Aggregate endpoints exist (portfolio summary, metrics) | Low — not in C1 catalog | P1-C1 |
| A9 | Auth management routes (`/api/auth/*`) exist | Low — not in C1 or C2 catalog | P1-C1, P1-C2 |

### P1-C1 — Backend Service Contract Catalog

**Owner:** C1-workstream. **Blocks:** `CODE_COMPLETE_MOCK` → `CONTRACT_ALIGNED` for all domains.

C1 owns route path finalization, response envelope shape, and HTTP method definitions for all backend Azure Functions endpoints. Until C1 freezes routes for a domain, that domain's adapter cannot be verified against real paths.

**Current state:**
- **C1 locked (3 domains):** Lead, Project (including A8 aggregate: `/api/projects/summary`), Estimating (including D2 sub-resources: `/api/estimating/trackers/` and `/api/estimating/kickoffs/`) — all per P1-E1
- **Convention-locked, handler pending (7 data domains):** Schedule, Buyout, Compliance, Contract, Risk, Scorecard, PMP — transport conventions D1, D5, D6 **LOCKED** per P1-E1; route paths follow confirmed nested patterns; production activation blocked until C1 delivers backend route handlers
- **Auth (tracked separately):** A9 — no route catalog entry; see [Auth Domain: Special-Case Tracking](#auth-domain-special-case-tracking)

**Resolved transport decisions (all LOCKED per P1-E1):**
- D1: Plural paths — confirmed
- D3: `message` is primary error field — `extractErrorMessage()` reads `.message` first, `.error` fallback
- D4: Default pageSize 25, max 100 — B1 and C1 aligned
- D5: PUT-only in Phase 1 — PATCH deferred to Phase 2
- D6: Nested project-scoped paths — B1 assumption confirmed

**Remaining items blocking `CONTRACT_ALIGNED`:**
- A9: Auth management routes — no C1/C2 catalog entry; see Auth Domain section
- **C1 route handler delivery** — no domain data routes exist in backend yet; this is the primary remaining blocker for all non-Lead/Project/Estimating domains

*Note: D2 (Estimating sub-resources) and A8 (project aggregate) are now locked per P1-E1; they no longer block `CONTRACT_ALIGNED` for those domains.*

### P1-C2 — Auth and Validation Hardening

**Owner:** C2-workstream. **Blocks:** `CONTRACT_ALIGNED` → `INTEGRATION_READY` for all domains.

C2 owns MSAL app registration, OBO token exchange middleware, auth validation at service boundaries, and CORS configuration. No domain can accept real HTTP traffic until C2 delivers a working auth pipeline.

**Unresolved items:**
- A9: Auth management routes (`/api/auth/*`) have no C1 or C2 catalog entry — see [Auth Domain: Special-Case Tracking](#auth-domain-special-case-tracking) for full capability-group and dependency detail
- D3: Error envelope field priority — joint ownership with C1; affects how auth errors are surfaced to `ProxyHttpClient`

### P1-D1 — Write Safety, Retry, and Recovery

**Owner:** D1-workstream. **Blocks:** production activation (Phase 1 acceptance gate: "failures are recoverable and visible").

D1 owns retry policy implementation in `ProxyHttpClient`, frontend idempotency key generation, backend idempotency guard middleware, and write failure classification. Without D1 deliverables, write operations through proxy adapters have no retry, no idempotency protection, and no structured failure reporting.

**Key deliverables affecting B2:**
- `withRetry()` higher-order function for `ProxyHttpClient`
- `WriteFailureReason` enum (`NETWORK_UNREACHABLE`, `VALIDATION_FAILED`, `CONFLICT_DETECTED`)
- Idempotency key generation interface and `Idempotency-Key` header injection
- Backend idempotency guard middleware (Azure Functions)

**Cross-ref:** `P1-D1-Write-Safety-Retry-Recovery.md` for full scope. Retry and idempotency are `ProxyHttpClient` concerns — individual domain adapters do not implement their own retry logic.

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
| **proxy** | Calls Azure Functions via MSAL OBO | `IN_PROGRESS` — 10 of 11 repos `CODE_COMPLETE_MOCK`; 1 remaining (Auth — blocked on A9) | Phase 1 | `'proxy'` |
| **sharepoint** | Direct PnPjs calls (SPFx-only surface) | `STUB` | Future phase | `'sharepoint'` |
| **api** | REST / Azure SQL direct calls | Reserved | Future phase | `'api'` |

This table reflects the current repo implementation state by adapter mode. For per-domain execution-gate status, see the [Execution Progress Tracker](#execution-progress-tracker) above.

---

## Future-Phase Placeholders

The following adapter types are tracked here for completeness. Their domain matrices, definition-of-done gates, and blocking dependencies will be refined when those phases begin active planning.

### SharePoint Adapter (Future Phase)

The SharePoint adapter targets the SPFx collaborative-authoring surface. Not all domains map to simple single-list patterns — the matrix below classifies each domain by its likely SharePoint backing model. Full engineering detail belongs in a future SharePoint engineering plan; this section tracks enough to inform Phase 1 backlog awareness.

**Auth note:** SPFx uses MSAL-based `AadHttpClient` and `MSGraphClient` for token acquisition. PnPjs initializes via the `SPFx()` factory using the SPFx context's built-in token provider. ADAL is deprecated and is not the intended SharePoint auth strategy.

#### Domain Pattern Matrix

| Domain | Port Interface | SP Pattern | Entity → List Mapping | Notes |
|---|---|---|---|---|
| **Lead** | `ILeadRepository` | Single list | Leads list → `ILead` | CRUD + search via CAML/view |
| **Project** | `IProjectRepository` | List + computed aggregate | Projects list → `IActiveProject`; portfolio summary computed client-side or via view | A8: aggregate may require computed rollup |
| **Estimating** | `IEstimatingRepository` | Parent/child lists | Trackers list + Kickoffs list; linked by projectId | Sub-resource pattern (cf. proxy D2) |
| **Schedule** | `IScheduleRepository` | List + computed aggregate | Activities list → `IScheduleActivity`; metrics computed from list data | Project-scoped |
| **Buyout** | `IBuyoutRepository` | List + computed aggregate | Entries list → `IBuyoutEntry`; summary computed from entries | Project-scoped |
| **Compliance** | `IComplianceRepository` | List + computed aggregate | Entries list → `IComplianceEntry`; summary computed from entries | Project-scoped |
| **Contract** | `IContractRepository` | Parent/child lists | Contracts list + Approvals list; linked by contractId | Project-scoped; child sub-resource |
| **Risk** | `IRiskRepository` | List + computed aggregate | Items list → `IRiskCostItem`; management computed from items | Project-scoped |
| **Scorecard** | `IScorecardRepository` | Parent/child lists | Scorecards list + Versions list; linked by scorecardId | Project-scoped; child sub-resource |
| **PMP** | `IPmpRepository` | Parent/child lists | Plans list + Signatures list; linked by pmpId | Project-scoped; child sub-resource |
| **Auth** | `IAuthRepository` | **Not applicable** | See special handling below | Identity/RBAC — no SP list backing |

**SP Pattern key:**
- **Single list** — one SP list, straightforward CRUD via PnPjs `sp.web.lists`
- **List + computed aggregate** — one SP list for entities; summary/metrics computed client-side from list data
- **Parent/child lists** — two SP lists with a relational link; adapter manages both

#### Auth: Special Handling

Auth (`IAuthRepository`) does not receive a SharePoint adapter. Its methods — `getCurrentUser`, `getRoles`, `getRoleById`, `getPermissionTemplates`, `assignRole`, `removeRole` — are identity and RBAC operations backed by Entra ID (Azure AD), not SharePoint lists. In SPFx, user identity comes from `this.context.pageContext.user` and `AadHttpClient`/`MSGraphClient`; role management is an Azure AD / Microsoft Graph concern.

**Open decision:** Whether Auth in the SharePoint surface stays proxy-only (calling the same Azure Functions backend as the PWA) or uses native SPFx Entra ID / Graph integration. This decision belongs to the future SharePoint engineering plan, not B2. See [Auth Domain: Special-Case Tracking](#auth-domain-special-case-tracking) for the full Auth status and dependency picture.

#### SharePoint-Specific Blocking Dependencies

| Dependency | Description | Owner | When Needed |
|---|---|---|---|
| Site provisioning | Site collection or sub-site with correct URL and template | SharePoint Admin / DevOps | Before any SP adapter development |
| List provisioning | SP lists created for all list-backed domains with correct columns and content types | SharePoint Admin / DevOps | Before per-domain adapter implementation |
| Library provisioning | Document libraries for any document-backed domains (if applicable) | SharePoint Admin / DevOps | Before per-domain adapter implementation |
| Schema approval | List/library column schemas reviewed and approved against port interface contracts | Architecture / Data Ownership | Before per-domain adapter implementation |
| SPFx context pattern | PnPjs `SPFx()` initialization pattern established and tested in app shell | B-workstream / SPFx lead | Before any SP adapter development |
| Permission model | SP site/list permissions mapped to app roles; external sharing policy confirmed | SharePoint Admin / Security | Before integration testing |
| Throttling strategy | SPO 429 handling, batch request patterns, and retry policy for PnPjs calls | B-workstream | Before production activation |

### API Adapter (Future Phase)

All 11 domains are candidates for direct API adapter implementation in a future phase. Blocking dependency: Azure SQL schema and direct REST endpoint deployment.

---

## Factory Wiring Status

**Current File:** `packages/data-access/src/factory.ts`

### Current Repo Truth

- `resolveAdapterMode()` reads `HBC_ADAPTER_MODE` env var; defaults to `'mock'` if unset or unrecognized
- Each domain has a `create{Domain}Repository(mode?)` factory function with a `switch` on the resolved mode
- **Mock adapters:** fully implemented for all 11 domains — returned for `'mock'` mode
- **Proxy adapters:** 7 project-scoped domains (Schedule, Buyout, Compliance, Contract, Risk, Scorecard, PMP) fully wired — factory returns real proxy implementations for `'proxy'` mode. 4 domains (Lead, Project, Estimating, Auth) still throw `AdapterNotImplementedError` for `'proxy'` mode
- **Non-proxy real adapters:** `'sharepoint'` and `'api'` modes throw `AdapterNotImplementedError` for all 11 domains — hard fail, no silent fallback to mock
- **No domain-level override mechanism exists** — all domains resolve to the same global mode
- **No env validation guard exists** — if `HBC_ADAPTER_MODE` is unset, the factory silently defaults to `'mock'` with no warning

### Phase 1 Changes

| Change | Owner | Rationale |
|---|---|---|
| Replace proxy adapter stubs with real implementations for all 11 domains | P1-B1 | Phase 1 critical path — removes `AdapterNotImplementedError` for `'proxy'` mode |
| Add env validation guard to warn or error when `HBC_ADAPTER_MODE` is unset in non-dev environments | P1-B3 | Prevent silent mock fallback in production |

### Future-Phase Changes

| Change | Target Phase | Rationale |
|---|---|---|
| SharePoint adapter implementations for list-backed domains | Future (SP) | SPFx collaborative-authoring surface |
| API adapter implementations for direct-database domains | Future (API) | Azure SQL direct access surface |

### Open Decision: Domain-Level Adapter Overrides

The concept of per-domain overrides (e.g., `HBC_ADAPTER_MODE_LEADS`) has been discussed for gradual rollout support — enabling proxy mode for one domain while keeping others on mock. However, this pattern is **not yet approved**:

- **Naming convention:** Not locked (`HBC_ADAPTER_MODE_{DOMAIN}` is a placeholder, not a standard)
- **Governance model:** Not defined (who sets overrides, where they are documented, how they interact with the global mode)
- **Implementation approach:** Not designed (env var per domain vs config object vs feature flag)
- **Owner:** Not assigned — likely P1-B3 (environment configuration) or a platform configuration decision

If gradual domain-by-domain rollout is needed during Phase 1 activation, the override pattern must be defined and approved before implementation. Until then, all domains resolve to the same global `HBC_ADAPTER_MODE` value.

---

## Update Cadence

This backlog is updated:
- **On status change:** With evidence per the gate checklist for the new status
- **On B1 assumption or open decision resolution:** Reflect the resolved decision and update affected domain rows
- **On cross-workstream dependency change:** When C1, C2, or E1 status changes affect B2 readiness
- **Per phase start:** Phase target confirmation and new domain prioritization
