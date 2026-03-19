# P1-C1: Backend Service Contract Catalog

| Field | Value |
|---|---|
| **Doc ID** | P1-C1 |
| **Phase** | Phase 1 |
| **Workstream** | C — Backend Service Contracts and Hardening |
| **Document Type** | Contract Catalog |
| **Owner** | Backend Services Team |
| **Update Authority** | C-workstream lead; route additions require review by B-workstream (adapter consumers) |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **References** | P1-B1 (Proxy Adapter Engineering Plan), P1-B2 (Adapter Completion Backlog), P1-C2 (Auth Hardening), P1-D1 (Write Safety), P1-E1 (Contract Test Suite) |

---

## Purpose

Define the complete HTTP service contract for HB Intel backend Azure Functions v4 (TypeScript). This catalog separates currently implemented routes from target Phase 1 domain contracts so that consuming workstreams (B1 adapter implementation, E1 contract testing) can distinguish what exists today from what they are building toward.

---

## Contract Status Legend

| Status | Meaning |
|---|---|
| `IMPLEMENTED` | Route exists in repo; behavior verified against code inspection (not deployment verification) |
| `IMPLEMENTED (DELTA)` | Route exists but current response shape or behavior differs from target contract standards |
| `TARGET` | Phase 1 target contract; route not yet implemented in backend |
| `TARGET (PROVISIONAL)` | Target contract with open decisions pending (B1 open decisions D1–D6; not to be confused with P1-D1 workstream) |
| `NOT CATALOGED` | Known frontend port interface requirement with no backend route definition yet |

---

## Catalog Overview

### Currently Implemented Routes

| Route Group | Status | HTTP Routes | Non-HTTP Triggers | Notes |
|---|---|---|---|---|
| Proxy | `IMPLEMENTED` | 2 handlers (GET + mutate) | — | Graph API forwarding with OBO, Redis cache |
| Project Setup Requests | `IMPLEMENTED` | 3 | — | State machine lifecycle |
| Acknowledgments | `IMPLEMENTED` | 2 | — | Sign-off events (GET, POST only) |
| Notifications | `IMPLEMENTED (DELTA)` | 7 | 2 queue + 1 timer | Response shapes vary from target envelope |
| SignalR | `IMPLEMENTED` | 1 | — | Negotiate endpoint only |
| Provisioning Saga | `IMPLEMENTED (DELTA)` | 6 | — | Response shapes not yet normalized to target envelope; admin routes included |
| Timer (Full Spec) | `IMPLEMENTED` | — | 1 timer | Nightly deferred provisioning |

**Not found in repo:** Health check endpoint (`GET /api/health`) — listed in previous draft but not verified in current `backend/functions/src/index.ts` import barrel. Removed from catalog pending re-verification.

### Phase 1 Target Domain Routes

| Domain | Status | Port Interface | Method Families | Route Confidence | Open Decisions |
|---|---|---|---|---|---|
| **Lead** | `IMPLEMENTED` | `ILeadRepository` | CRUD (5) + Search (1) | C1 locked | — |
| **Project** | `IMPLEMENTED` | `IProjectRepository` | CRUD (5) + Portfolio Summary (1) | C1 locked; A8 resolved | — |
| **Estimating** | `IMPLEMENTED` | `IEstimatingRepository` | Tracker CRUD (5) + Kickoff (2) | C1 locked; D2 resolved | — |
| **Auth** | `TARGET` | `IAuthRepository` | Current User (1), Roles (6), Templates (4), Job Title Mappings (4), Assignment (2) | Routes defined in P1-C2-a Task 21 (A9 resolved); backend handlers Phase 2 | — |
| **Schedule** | `IMPLEMENTED` | `IScheduleRepository` | Activity CRUD (5) + Metrics (1) | D1/D6 resolved | — |
| **Buyout** | `IMPLEMENTED` | `IBuyoutRepository` | Entry CRUD (5) + Summary (1) | D1/D6 resolved | — |
| **Compliance** | `IMPLEMENTED` | `IComplianceRepository` | Entry CRUD (5) + Summary (1) | D1/D6 resolved | — |
| **Contract** | `IMPLEMENTED` | `IContractRepository` | Contract CRUD (5) + Approvals (2) | D1/D6 resolved | — |
| **Risk** | `IMPLEMENTED` | `IRiskRepository` | Item CRUD (5) + Management (1) | D1/D6 resolved | — |
| **Scorecard** | `IMPLEMENTED` | `IScorecardRepository` | Scorecard CRUD (5) + Versions (1) | D1/D6 resolved | — |
| **PMP** | `IMPLEMENTED` | `IPmpRepository` | Plan CRUD (5) + Signatures (2) | D1/D6 resolved | — |

---

## Contract Governance Matrix

This matrix ties each target domain to its contract owner, freeze status, blocking dependencies, downstream consumers, and B2 gate impact. It enables cross-workstream coordination between C1 (contract definition), B1 (adapter implementation), C2 (auth), and E1 (contract testing).

### Per-Domain Governance

| Domain | Contract Owner | Freeze Status | Blocked By | Downstream Consumers | B2 Gate Impact |
|---|---|---|---|---|---|
| **Lead** | C1 | Routes frozen and implemented | — | B1 ✅, E1 Tasks 4–7 ✅ | `CONTRACT_ALIGNED` |
| **Project** | C1 | Routes frozen and implemented; A8 resolved | — | B1 ✅, E1 Tasks 4–7 ✅ | `CONTRACT_ALIGNED` |
| **Estimating** | C1 | Routes frozen and implemented; D2 resolved | — | B1 ✅, E1 Tasks 4–7 ✅ | `CONTRACT_ALIGNED` |
| **Auth** | C2 | Routes defined (P1-C2-a Task 21; A9 resolved) | — | B1 ✅ | Route catalog available; backend handlers Phase 2 |
| **Schedule** | C1 | Routes frozen and implemented; D1/D6 resolved | — | B1 ✅ | `CONTRACT_ALIGNED` |
| **Buyout** | C1 | Routes frozen and implemented; D1/D6 resolved | — | B1 ✅ | `CONTRACT_ALIGNED` |
| **Compliance** | C1 | Routes frozen and implemented; D1/D6 resolved | — | B1 ✅ | `CONTRACT_ALIGNED` |
| **Contract** | C1 | Routes frozen and implemented; D1/D6 resolved | — | B1 ✅ | `CONTRACT_ALIGNED` |
| **Risk** | C1 | Routes frozen and implemented; D1/D6 resolved | — | B1 ✅ | `CONTRACT_ALIGNED` |
| **Scorecard** | C1 | Routes frozen and implemented; D1/D6 resolved | — | B1 ✅ | `CONTRACT_ALIGNED` |
| **PMP** | C1 | Routes frozen and implemented; D1/D6 resolved | — | B1 ✅ | `CONTRACT_ALIGNED` |

### Cross-Cutting Contract Dependencies

These affect all domain routes, not just one. They must be resolved before any domain can fully reach `CONTRACT_ALIGNED`.

| Dependency | Owner | Affects | Status |
|---|---|---|---|
| D3 — Error envelope field priority | C1 + B1 | All domain error responses | **LOCKED** — `message` (not `error`); see Resolved Decisions |
| D4 — Pagination default | C1 + B1 | All collection responses | **LOCKED** — 25 (max 100); see Resolved Decisions |
| D5 — PATCH support | C1 | All domain mutation routes | **LOCKED** — PUT-only in Phase 1; see Resolved Decisions |
| P1-D1 — Idempotency support | D1-workstream | All domain write routes | **DELIVERED** — `withRetry()` wired into ProxyHttpClient; `withIdempotency` handler wrapper + `IdempotencyStorageService` implemented; idempotency header injection active |

---

## Part 1: Current Implemented Route Inventory

Routes verified against `backend/functions/src/` as of 2026-03-18. Route paths shown without `/api/` prefix (Azure Functions adds it automatically).

### Proxy (2 handlers)

| Method | Route | Handler | Notes |
|---|---|---|---|
| `GET` | `proxy/{*path}` | `proxyGet` | Graph API forwarding with OBO; Redis cache TTL 300s |
| `POST, PATCH, PUT, DELETE` | `proxy/{*path}` | `proxyMutate` | Mutating proxy with cache invalidation |

**Current response shape:** Raw Graph API passthrough — response body is the unmodified Graph API response, not wrapped in `{data:...}` envelope. Status codes forwarded from Graph.

### Project Setup Requests (3 routes)

| Method | Route | Handler | Notes |
|---|---|---|---|
| `POST` | `project-setup-requests` | `submitProjectSetupRequest` | Create request (→ Submitted state) |
| `GET` | `project-setup-requests` | `listProjectSetupRequests` | List with optional state filter |
| `PATCH` | `project-setup-requests/{requestId}/state` | `advanceRequestState` | State machine transition with validation |

**Current response shape:** POST returns 201 with raw `IProjectSetupRequest` entity (not `{data:...}` wrapped). GET returns 200 with raw `IProjectSetupRequest[]` array (not `{data:[], total, page, pageSize}` collection envelope). PATCH returns 200 with raw updated entity. Errors return `{error: string}`.

### Acknowledgments (2 routes)

| Method | Route | Handler | Notes |
|---|---|---|---|
| `POST` | `acknowledgments` | `postAcknowledgment` | Submit acknowledgment, decline, or bypass event |
| `GET` | `acknowledgments` | `getAcknowledgments` | Retrieve events by contextType + contextId |

**Current response shape:** POST returns 200 with `{event: IAcknowledgmentEvent, updatedState: AcknowledgmentState, isComplete: boolean}` (custom shape, not `{data:...}`). GET returns 200 with `{events: IAcknowledgmentEvent[]}` (not `{data:[...]}`). Errors include 400 `{error}`, 403 `{error}`, 409 `{error, declinedBy}`.

### Notifications (7 HTTP routes + background triggers)

| Method | Route | Handler | Notes |
|---|---|---|---|
| `POST` | `notifications/send` | `SendNotification` | Enqueue notification for async processing |
| `GET` | `notifications/center` | `GetCenter` | Paginated notification center with tier filtering |
| `PATCH` | `notifications/{id}/read` | `MarkRead` | Mark single notification as read |
| `PATCH` | `notifications/{id}/dismiss` | `Dismiss` | Dismiss single notification |
| `POST` | `notifications/mark-all-read` | `MarkAllRead` | Bulk mark-as-read, optionally by tier |
| `GET` | `notifications/preferences` | `GetPreferences` | User notification preferences |
| `PATCH` | `notifications/preferences` | `UpdatePreferences` | Update notification preferences |

**Background triggers:** `hbc-notifications-queue` (queue), `hbc-email-queue` (queue), hourly digest timer.

**Current response shape:** POST send returns 202 `{message: "Notification queued."}`. GET center returns 200 `{totalCount, items: INotification[], cursor?, pageSize?}` (not `{data:[], total, page, pageSize}` target envelope). PATCH mark-read returns 200 `{message}`. GET preferences returns 200 raw `NotificationPreferences` entity. Errors return `{error: string}`.

### SignalR (1 route)

| Method | Route | Handler | Notes |
|---|---|---|---|
| `POST` | `provisioning-negotiate` | `signalrNegotiate` | SignalR connection negotiation for provisioning events |

**Current response shape:** Azure-managed SignalR connection info (response shape controlled by Azure SignalR Service, not application code).

### Provisioning Saga (6 routes)

| Method | Route | Handler | Notes |
|---|---|---|---|
| `POST` | `provision-project-site` | `provisionProjectSite` | Begin saga; returns 202 Accepted |
| `GET` | `provisioning-status/{projectId}` | `getProvisioningStatus` | Poll provisioning status |
| `GET` | `provisioning-failures` | `listFailedRuns` | Admin-only failures inbox |
| `POST` | `admin/trigger-timer` | `triggerTimerManually` | Dev/staging only; blocked in Production |
| `POST` | `provisioning-retry/{projectId}` | `retryProvisioning` | Retry failed provisioning |
| `POST` | `provisioning-escalate/{projectId}` | `escalateProvisioning` | Escalate provisioning request |

**Current response shape:** POST provision returns 202 `{message: "Provisioning started", projectId, correlationId}`. GET status returns 200 raw `ProvisioningStatus` entity. GET failures returns 200 array. POST retry returns 202 `{message, projectId}`. POST escalate returns 200 `{message: "Provisioning escalated", projectId}`. Errors return `{error: string}`.

### Timer (1 trigger)

| Schedule | Handler | Notes |
|---|---|---|
| 1:00 AM ET daily | `timerFullSpec` | Nightly deferred Step 5 provisioning jobs |

---

## Part 2: Target Phase 1 Domain Route Contracts

These routes do not yet exist in the backend. They define the contract that B1 proxy adapters will consume. Route shapes are derived from B1 engineering plan assumptions; provisional shapes will be reconciled when open decisions are resolved.

**Target response envelope standard** (see Global Contract Standards and Locked Transport Conventions below):
- Collection: `{ items: T[], total, page, pageSize }`
- Single item: `{ data: T }`
- Error: `{ message: "Human-readable message", code: "ERROR_CODE", requestId: "uuid" }`

### Lead Domain — `TARGET` (C1 locked)

Port interface: `ILeadRepository` — 6 methods (CRUD + search)

| Method | Route | Port Method | Request | Response |
|---|---|---|---|---|
| `GET` | `/api/leads?page=&pageSize=` | `getAll(options?)` | Query params | Collection `ILead[]` |
| `GET` | `/api/leads/{id}` | `getById(id)` | Route param | Single `ILead` |
| `POST` | `/api/leads` | `create(data)` | `ILeadFormData` body | Created `ILead` (201) |
| `PUT` | `/api/leads/{id}` | `update(id, data)` | Partial `ILeadFormData` body | Updated `ILead` |
| `DELETE` | `/api/leads/{id}` | `delete(id)` | — | 204 No Content |
| `GET` | `/api/leads?q={query}` | `search(query, options?)` | Query params | Collection `ILead[]` |

### Project Domain — `TARGET` (CRUD locked; aggregate A8 provisional)

Port interface: `IProjectRepository` — 6 methods (CRUD + portfolio summary)

| Method | Route | Port Method | Request | Response | Confidence |
|---|---|---|---|---|---|
| `GET` | `/api/projects?page=&pageSize=` | `getProjects(options?)` | Query params | Collection `IActiveProject[]` | C1 locked |
| `GET` | `/api/projects/{id}` | `getProjectById(id)` | Route param | Single `IActiveProject` | C1 locked |
| `POST` | `/api/projects` | `createProject(data)` | `Omit<IActiveProject, 'id'>` body | Created `IActiveProject` (201) | C1 locked |
| `PUT` | `/api/projects/{id}` | `updateProject(id, data)` | Partial body | Updated `IActiveProject` | C1 locked |
| `DELETE` | `/api/projects/{id}` | `deleteProject(id)` | — | 204 No Content | C1 locked |
| `GET` | `/api/projects/portfolio-summary` | `getPortfolioSummary()` | — | Single `IPortfolioSummary` | A8 provisional |

**Note:** This domain does NOT have a search route. Previous C1 listed `IProject` with search; repo truth uses `IActiveProject` with `getPortfolioSummary()`.

### Estimating Domain — `TARGET` (base locked; D2 sub-resource open)

Port interface: `IEstimatingRepository` — 7 methods (tracker CRUD + kickoff)

| Method | Route | Port Method | Request | Response | Confidence |
|---|---|---|---|---|---|
| `GET` | `/api/estimating/trackers?page=&pageSize=` | `getAllTrackers(options?)` | Query params | Collection `IEstimatingTracker[]` | C1 base locked |
| `GET` | `/api/estimating/trackers/{id}` | `getTrackerById(id)` | Route param | Single `IEstimatingTracker` | C1 base locked |
| `POST` | `/api/estimating/trackers` | `createTracker(data)` | Body | Created `IEstimatingTracker` (201) | C1 base locked |
| `PUT` | `/api/estimating/trackers/{id}` | `updateTracker(id, data)` | Body | Updated `IEstimatingTracker` | C1 base locked |
| `DELETE` | `/api/estimating/trackers/{id}` | `deleteTracker(id)` | — | 204 No Content | C1 base locked |
| `GET` | `/api/estimating/kickoffs?projectId={id}` | `getKickoff(projectId)` | Query param | Single `IEstimatingKickoff` | D2 provisional |
| `POST` | `/api/estimating/kickoffs` | `createKickoff(data)` | Body | Created `IEstimatingKickoff` (201) | D2 provisional |

**Note:** This domain does NOT use a flat `IEstimatingItem` entity. Previous C1 described generic CRUD+search for `IEstimatingItem`; repo truth has two sub-resources (trackers and kickoffs). D2 governs sub-resource routing.

### Auth Domain — `TARGET` (A9 resolved — routes defined in P1-C2-a Task 21)

Port interface: `IAuthRepository` — 16 methods across 5 capability groups. Route catalog defined in P1-C2-a Task 21 (20 system-level + 9 project-scoped routes). Auth does not follow a CRUD pattern. `ProxyAuthRepository` is fully implemented (19 tests, factory-wired).

| Capability Group | Port Methods | Route Paths (P1-C2-a) | Status |
|---|---|---|---|
| Current User | `getCurrentUser` | `GET /api/auth/me` | Route defined; proxy adapter complete |
| Role Definitions | `getRoles`, `getRoleById`, `createRole`, `updateRole`, `deleteRole` | `GET/POST /api/auth/roles`, `GET/PATCH/DELETE /api/auth/roles/{id}` | Routes defined; proxy adapter complete |
| Role Assignment | `assignRole`, `removeRole` | `POST /api/auth/users/{userId}/roles`, `DELETE /api/auth/users/{userId}/roles/{roleId}` | Routes defined; proxy adapter complete |
| Permission Templates | `getPermissionTemplates`, `createPermissionTemplate`, `updatePermissionTemplate`, `deletePermissionTemplate` | `GET/POST /api/auth/templates`, `PATCH/DELETE /api/auth/templates/{id}` | Routes defined; proxy adapter complete |
| Job Title Mappings | `getJobTitleMappings`, `createJobTitleMapping`, `updateJobTitleMapping`, `deleteJobTitleMapping` | `GET/POST /api/auth/job-title-mappings`, `PATCH/DELETE /api/auth/job-title-mappings/{id}` | Routes defined; proxy adapter complete |

**Responsibility-layer ownership:**
- **C2 scope:** Auth subsystem implementation — backend service that manages roles, permissions, templates, job title mappings, and assignments; OBO token exchange for auth-specific calls; role storage and permission logic. C2 owns whether this is a dedicated microservice or part of the Azure Functions backend. Route catalog is locked in P1-C2-a Task 21.
- **Runtime / app-shell:** Token acquisition (MSAL in PWA, Bearer in backend) and user identity context. `getCurrentUser` resolves from a backend profile endpoint that maps token claims + job title → `ICurrentUser` (discriminated union per P1-C2-a AD-2).

**Backend handler status:** Route catalog defined and locked; backend handler implementation is a Phase 2 delivery. `ProxyAuthRepository` is production-ready pending backend route delivery.

### Remaining Domains — `TARGET (PROVISIONAL)` (D1, D6 pending)

These 7 domains are project-scoped and depend on open decisions D1 (singular/plural paths) and D6 (nested paths vs flat `?projectId=` query params). Route shapes below are B1-assumed; they will be reconciled when D1/D6 are resolved. See B2 method family detail for full port method inventory.

| Domain | Port Interface | Method Families | Assumed Base Path | Open Decisions |
|---|---|---|---|---|
| Schedule | `IScheduleRepository` | Activity CRUD (5) + Metrics (1) | `/api/projects/{projectId}/schedule` | D1, D6 |
| Buyout | `IBuyoutRepository` | Entry CRUD (5) + Summary (1) | `/api/projects/{projectId}/buyout` | D1, D6 |
| Compliance | `IComplianceRepository` | Entry CRUD (5) + Summary (1) | `/api/projects/{projectId}/compliance` | D1, D6 |
| Contract | `IContractRepository` | Contract CRUD (5) + Approvals (2) | `/api/projects/{projectId}/contracts` | D1, D6 |
| Risk | `IRiskRepository` | Item CRUD (5) + Management (1) | `/api/projects/{projectId}/risk` | D1, D6 |
| Scorecard | `IScorecardRepository` | Scorecard CRUD (5) + Versions (1) | `/api/projects/{projectId}/scorecards` | D1, D6 |
| PMP | `IPmpRepository` | Plan CRUD (5) + Signatures (2) | `/api/projects/{projectId}/pmp` | D1, D6 |

---

## Part 3: Normalization Delta Matrix

This section shows how each implemented route group's current response shapes differ from the target contract. Use this matrix for E1 contract test design and B2 `CONTRACT_ALIGNED` gate assessment.

### Project Setup Requests — Normalization Deltas — **RESOLVED**

All project setup request handlers now use C2 standardized response helpers.

| Route | Previous Shape | Current Shape | Status |
|---|---|---|---|
| `POST` create | Raw `IProjectSetupRequest` entity | `successResponse(entity, 201)` → `{data: T}` | ✅ RESOLVED |
| `GET` list | Raw `IProjectSetupRequest[]` | `listResponse(items, total, page, pageSize)` → `{items, pagination}` | ✅ RESOLVED |
| `PATCH` advance | Raw entity | `successResponse(entity)` → `{data: T}` | ✅ RESOLVED |
| Errors | `{error: string}` | `errorResponse(status, code, message, requestId)` → `{message, code, requestId?}` | ✅ RESOLVED |

### Acknowledgments — Normalization Deltas — **RESOLVED**

All acknowledgment handlers now use C2 standardized response helpers.

| Route | Previous Shape | Current Shape | Status |
|---|---|---|---|
| `POST` acknowledge | `{event, updatedState, isComplete}` | `successResponse({event, updatedState, isComplete})` → `{data: {...}}` | ✅ RESOLVED |
| `GET` list | `{events: [...]}` | `listResponse(events, total, page, pageSize)` → `{items, pagination}` | ✅ RESOLVED |
| Errors | `{error}`, 403 `{error}`, 409 `{error, declinedBy}` | `errorResponse()`, `forbiddenResponse()` → `{message, code, requestId?}` | ✅ RESOLVED |

### Notifications — Normalization Deltas — **RESOLVED**

All notification handlers now use C2 standardized response helpers.

| Route | Previous Shape | Current Shape | Status |
|---|---|---|---|
| `POST` send | 202 `{message: "Notification queued."}` | 202 `{message: "Notification queued."}` (async accepted — correct) | ✅ RESOLVED |
| `GET` center | `{totalCount, items, cursor, pageSize}` | `successResponse(result)` → `{data: {totalCount, items, ...}}` | ✅ RESOLVED (cursor-based is intentional exception) |
| `PATCH` read/dismiss | `{message}` | `successResponse({message})` → `{data: {message}}` | ✅ RESOLVED |
| `POST` mark-all-read | `{message}` | `successResponse({message})` → `{data: {message}}` | ✅ RESOLVED |
| `GET` preferences | Raw `NotificationPreferences` | `successResponse(preferences)` → `{data: T}` | ✅ RESOLVED |
| `PATCH` preferences | Raw entity | `successResponse(updated)` → `{data: T}` | ✅ RESOLVED |

**Note:** Notification center's cursor-based pagination remains an intentional allowed exception per original catalog.

### Provisioning Saga — Normalization Deltas — **RESOLVED**

All provisioning saga handlers now use C2 standardized response helpers.

| Route | Previous Shape | Current Shape | Status |
|---|---|---|---|
| `POST` provision | 202 `{message, projectId, correlationId}` | 202 `{message, projectId, correlationId}` (async accepted — correct) | ✅ RESOLVED |
| `GET` status | Raw `ProvisioningStatus` | `successResponse(status)` → `{data: T}` | ✅ RESOLVED |
| `GET` failures | Raw array | `listResponse(failedRuns, total, page, pageSize)` → `{items, pagination}` | ✅ RESOLVED |
| `POST` retry | 202 `{message, projectId}` | 202 `{message, projectId}` (async accepted — correct) | ✅ RESOLVED |
| `POST` escalate | `{message, projectId}` | `successResponse({message, projectId})` → `{data: {...}}` | ✅ RESOLVED |

### Routes Not Requiring Normalization

| Route Group | Reason |
|---|---|
| **Proxy** | Passthrough — forwards Graph API responses unmodified; normalization not applicable |
| **SignalR** | Azure-managed connection negotiation; response shape controlled by Azure SignalR Service |
| **Timer** | Non-HTTP trigger; no response shape |

### Resolved Decision Deltas (Affecting Target Routes)

These decisions were locked on 2026-03-18 per P1-E1. The delta between B1's original assumptions and the locked resolutions is documented here for normalization tracking.

| Decision | B1 Original Assumption | Locked Resolution | Normalization Impact | Owner |
|---|---|---|---|---|
| D3 — Error field priority | B1 reads `.error` first, `.message` fallback | **`message`** is primary error field | B1 `extractErrorMessage()` already reads `.message` with `.error` fallback — compatible | C1 + B1 |
| D4 — Pagination default | B1: 25 (`DEFAULT_PAGE_SIZE`) | **25** (max 100) | No delta — B1 assumption matched | C1 + B1 |
| D5 — PATCH support | B1: PUT only | **PUT-only** in Phase 1; PATCH deferred to Phase 2 | No delta — B1 assumption matched | C1 |
| D6 — Project-scoped paths | B1: nested `/api/projects/{id}/...` | **Nested** `/api/projects/{projectId}/{domain}` | No delta — B1 assumption matched | C1 |
| A9 — Auth routes | No routes existed | **RESOLVED** — 20 system-level + 9 project-scoped auth routes defined in P1-C2-a Task 21; `ProxyAuthRepository` implemented (16 methods, 19 tests) | C2 |

---

## Global Contract Standards (Target State)

These standards define the target contract shape for Phase 1 domain routes. Currently implemented routes (Part 1) may not yet conform; normalization gaps are tracked in Part 3.

### Authentication & Authorization

- **Bearer Token Required:** All domain routes require a valid Bearer token in the `Authorization` header
- **Token Validation:** Invalid/missing token returns `401 Unauthorized`
- **OBO Flow:** For downstream Graph or SharePoint calls, tokens are acquired via MSAL OBO using the user's token as assertion
- **Identity Trust Boundary:** User identity is sourced only from validated JWT claims; client-provided identity fields are overwritten from token claims

### HTTP Status Codes (Target)

| Status | Meaning | Used For |
|---|---|---|
| `200 OK` | Success; resource retrieved or mutation applied | GET, PUT, PATCH responses |
| `201 Created` | Success; new resource created | POST responses |
| `202 Accepted` | Async operation accepted for processing | Provisioning, queued notifications, long-running operations |
| `204 No Content` | Success; no response body (per RFC 9110) | DELETE success — empty body, no JSON |
| `400 Bad Request` | Invalid request; validation failed | Missing required fields, invalid format |
| `401 Unauthorized` | Bearer token invalid, expired, or missing | All protected routes |
| `403 Forbidden` | Authenticated user lacks permission | Role/scope not present in token |
| `404 Not Found` | Resource does not exist | GET/PUT/PATCH/DELETE with non-existent id |
| `409 Conflict` | Request conflicts with current state | State transition violation, duplicate idempotency key |
| `422 Unprocessable Entity` | Semantic validation failed | Business logic constraint violation |
| `500 Internal Server Error` | Unhandled exception | Wrapped in error envelope |
| `502 Bad Gateway` | Downstream service unavailable | Graph API, SharePoint, Azure Table Storage failure |

### Success Response Envelopes

**Collection (paginated):**
```json
{ "items": [ /* T[] */ ], "total": 0, "page": 1, "pageSize": 25 }
```

**Single item:**
```json
{ "data": { /* T */ } }
```

**Async accepted (202):**
```json
{ "message": "Operation accepted", "correlationId": "uuid" }
```

**No content (204):** Empty response body — no JSON. Per RFC 9110, a 204 response must not contain a message body.

### Error Response Envelope

```json
{ "message": "Human-readable message", "code": "ERROR_CODE", "requestId": "uuid" }
```

Optional `details` array for validation errors: `"details": [{ "field": "name", "message": "Required" }]`

**D3 RESOLVED:** `message` is the primary error field (not `error`). See P1-E1 Locked Decision 2. B1's `extractErrorMessage()` reads `.message` with `.error` fallback for backward compatibility with pre-Phase-1 routes. New routes MUST use `message` only.

### Mutation Methods

**D5 RESOLVED:** PUT-only for new Phase 1 domain CRUD routes. PATCH is deferred to Phase 2.

PUT replaces the entire resource except server-managed fields (`id`, `createdAt`, `updatedAt`). New domain routes (leads, projects, estimating, etc.) MUST implement PUT, not PATCH.

**Existing operational routes exception:** Pre-Phase-1 routes that use PATCH for state transitions or partial updates (notification mark-read/dismiss, project-setup-request state changes) retain PATCH semantics. D5 applies to new domain CRUD routes, not to existing operational endpoints.

### Pagination

- Query params: `?page=1&pageSize=25` (max pageSize=100)
- **D4 RESOLVED:** Default pageSize is **25** (see P1-E1 Locked Decision 4). Backends MUST return `pageSize` in every collection response.
- Offset-based pagination in Phase 1; cursor-based deferred to Phase 2
- **Domain-specific exception:** Notification center (`GET notifications/center`) uses cursor-based pagination (`{items, cursor, totalCount, pageSize}`) as an allowed deviation from the default offset model. This is an intentional design choice for the notification surface and does not require normalization to offset-based.

### Idempotency

- `Idempotency-Key` header accepted on POST/PUT/PATCH mutations
- **Target behavior pending P1-D1 delivery:** Idempotency guard middleware, key generation, and replay semantics are owned by P1-D1 (Write Safety). Until D1 delivers, idempotency support is aspirational in this catalog — backends are not yet required to honor the header.

### Request Tracking

- `X-Request-Id` header passed through; generated (UUID) if absent; included in error responses and logs

---

## Resolved Decisions (Cross-Referenced from B1/B2/E1)

All transport-layer decisions were locked on 2026-03-18 per P1-E1. See P1-E1 "Locked Decisions Applied" for full resolution text.

| ID | Decision | Resolution | Reference |
|---|---|---|---|
| D1 | Singular vs plural route paths | **PLURAL** for all domain routes | P1-E1 line 155 |
| D2 | Estimating sub-resource routing | `/api/estimating/trackers/` and `/api/estimating/kickoffs/` | P1-E1 line 156 |
| D3 | Error envelope field priority | **`message`** (not `error`) | P1-E1 line 157 |
| D4 | Pagination default | **25** (max 100) | P1-E1 line 158 |
| D5 | PATCH support in domain routes | **PUT-only** in Phase 1; PATCH deferred to Phase 2 | P1-E1 line 159 |
| D6 | Project-scoped path pattern | **Nested** `/api/projects/{projectId}/{domain}` | P1-E1 line 160 |
| A8 | Aggregate endpoints | `/api/projects/summary` confirmed | P1-E1 line 161 |
| A9 | Auth management routes | External except `/api/auth/me` smoke utility | P1-E1 line 162 |

---

## Locked Transport Conventions (Quick Reference)

All transport-layer decisions were locked on 2026-03-18 per P1-E1. This section consolidates the locked shapes in one place. For full resolution text, see P1-E1 "Locked Decisions Applied" and the Resolved Decisions table above.

| Convention | Locked Value | Reference |
|---|---|---|
| **Collection envelope** | `{ items: T[], total, page, pageSize }` | Global Contract Standards §Success Response Envelopes |
| **Single-item envelope** | `{ data: T }` | Global Contract Standards §Success Response Envelopes |
| **Error envelope** | `{ message, code, requestId?, details? }` | D3 lock; Global Contract Standards §Error Response Envelope |
| **Primary error field** | `message` (not `error`) | D3 — P1-E1 Locked Decision 2 |
| **Pagination default** | `pageSize=25`, max 100 | D4 — P1-E1 Locked Decision 4 |
| **Mutation method** | PUT-only for new domain CRUD; PATCH deferred to Phase 2 | D5 — P1-E1 Locked Decision 5 |
| **Project-scoped paths** | Nested: `/api/projects/{projectId}/{domain}` | D6 — P1-E1 Locked Decision 6 |
| **Route plurality** | Plural for all domain routes | D1 — P1-E1 Locked Decision 1 |
| **Estimating sub-resources** | `/api/estimating/trackers/` and `/api/estimating/kickoffs/` | D2 — P1-E1 Locked Decision 2 |
| **Async accepted (202)** | `{ message, correlationId }` | Global Contract Standards §Success Response Envelopes |
| **Delete success (204)** | Empty body — no JSON (RFC 9110) | Global Contract Standards §HTTP Status Codes |

---

## Contract Divergence Register (Pre-Phase-1 Baseline)

This register documents where the current backend implementation diverges from the target contract conventions defined above. It establishes one authoritative baseline so that contract testing (P1-E1) and adapter implementation (P1-B1) can be planned against reality.

**Scope:** Existing implemented routes only. Target domain routes (leads, projects, estimating, etc.) do not exist yet and will be built to target conventions directly.

### Error Envelope — **RESOLVED**

| Previous Behavior | Target Convention | Resolution |
|---|---|---|
| All routes used `{ error: string }` | `{ message, code, requestId?, details? }` per D3 lock | ✅ `errorResponse()` returns `{message, code, requestId?}` — all handlers updated |
| `unauthorizedResponse()` returned `{ error: 'Unauthorized', reason }` | `{ message: 'Unauthorized', code: 'UNAUTHORIZED' }` | ✅ `unauthorizedResponse()` now delegates to `errorResponse(401, 'UNAUTHORIZED', ...)` |
| No `code` field in any error response | Required machine-readable code | ✅ All error helpers include `code` field |
| No `requestId` in responses | Optional UUID in error responses + response header | ✅ `extractOrGenerateRequestId()` middleware + `X-Request-Id` header propagation |
| Validation errors were flat strings | Structured `details` array: `[{ field?, message }]` | ✅ `parseBody<T>()` returns Zod issue details on validation failure |

### Success Envelope — **RESOLVED**

| Previous Behavior | Target Convention | Resolution |
|---|---|---|
| Single items returned as raw entity | `{ data: T }` wrapper | ✅ `successResponse(data)` wraps all single items — all handlers updated |
| Collections returned as raw arrays | `{ items: T[], pagination: {...} }` | ✅ `listResponse()` returns `{items, pagination: {total, page, pageSize, totalPages}}` — all handlers updated |
| Notification center uses cursor-based | Intentional allowed exception | ✅ No change needed — cursor-based is documented exception |
| Provisioning 202 includes `correlationId` | `{ message, correlationId }` | ✅ Already compliant |

### HTTP Verbs

| Current Behavior | Target Convention | Follow-up |
|---|---|---|
| PATCH used for: notification mark-read/dismiss, preferences, project-setup-request state | PUT-only for domain CRUD (D5) | **No refactor of existing PATCH routes.** D5 applies to new domain CRUD routes only. Existing operational PATCH endpoints serve state-transition and partial-update semantics that are distinct from domain CRUD. |
| POST /api/acknowledgments returns 200 (not 201) | POST creation returns 201 | Normalize to 201 when C2 standardizes response helpers |

### Pagination

| Current Behavior | Target Convention | Follow-up |
|---|---|---|
| No offset-based pagination in any route | `?page=1&pageSize=25`, max 100, returns `{ items, total, page, pageSize }` | New domain routes implement offset pagination per P1-E1 schema |
| Notification center uses cursor-based | Intentional allowed exception | No change |

### Auth and Validation — **RESOLVED**

| Previous Behavior | Target Convention | Resolution |
|---|---|---|
| Each route called `validateToken()` manually | Centralized `withAuth()` wrapper | ✅ `withAuth()` wrapper delivered; applied to all domain handlers (leads, projects, estimating) |
| Manual `if (!field)` validation checks | Zod-based `parseBody<T>()` / `parseQuery<T>()` | ✅ `parseBody<T>()` wired to leads, projects, estimating create/update handlers; `parseQuery<T>()` available |

### Observability — **PARTIALLY RESOLVED**

| Previous Behavior | Target Convention | Resolution |
|---|---|---|
| `createLogger()` + `ILogger` fully implemented | Required foundation | ✅ No gap |
| Provisioning saga telemetry (9 events, 3 metrics) | Required | ✅ No gap |
| No proxy/handler/auth/notification telemetry events | Multiple event families per P1-C3 | ✅ Partially resolved — proxy.request.*, auth.bearer.*, auth.obo.*, startup.mode.resolved, circuit breaker telemetry contracts delivered; handler lifecycle events (`withTelemetry`) wired to domain handlers; notification-specific events await C1 expansion |
| No `/api/health` endpoint | Required by C3 | ✅ **RESOLVED** — `/api/health` function registered |

**Note:** All pre-Phase-1 response shape divergences documented above have been resolved. All handlers now use C2 standardized response helpers (`successResponse`, `listResponse`, `errorResponse`, `notFoundResponse`, `forbiddenResponse`, `unauthorizedResponse`). New domain routes (leads, projects, estimating) were built to target conventions directly with `parseBody<T>()` Zod validation and `withAuth()` centralized auth.
