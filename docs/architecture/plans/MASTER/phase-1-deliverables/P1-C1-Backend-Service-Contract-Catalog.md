# P1-C1: Backend Service Contract Catalog

| Field | Value |
|---|---|
| **Doc ID** | P1-C1 |
| **Phase** | Phase 1 |
| **Workstream** | C — Backend Service Contracts and Hardening |
| **Document Type** | Contract Catalog |
| **Owner** | Backend Services Team |
| **Update Authority** | C-workstream lead; route additions require review by B-workstream (adapter consumers) |
| **Last Reviewed Against Repo Truth** | 2026-03-18 |
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
| **Lead** | `TARGET` | `ILeadRepository` | CRUD (5) + Search (1) | C1 locked | — |
| **Project** | `TARGET` | `IProjectRepository` | CRUD (5) + Portfolio Summary (1) | CRUD: C1 locked; Aggregate: A8 provisional | A8 |
| **Estimating** | `TARGET` | `IEstimatingRepository` | Tracker CRUD (5) + Kickoff (2) | Base locked; sub-resource D2 open | D2 |
| **Auth** | `NOT CATALOGED` | `IAuthRepository` | Current User (1), Roles (2), Permissions (1), Assignment (2) | A9 — no route definition | A9 |
| **Schedule** | `TARGET (PROVISIONAL)` | `IScheduleRepository` | Activity CRUD (5) + Metrics (1) | Provisional | D1, D6 |
| **Buyout** | `TARGET (PROVISIONAL)` | `IBuyoutRepository` | Entry CRUD (5) + Summary (1) | Provisional | D1, D6 |
| **Compliance** | `TARGET (PROVISIONAL)` | `IComplianceRepository` | Entry CRUD (5) + Summary (1) | Provisional | D1, D6 |
| **Contract** | `TARGET (PROVISIONAL)` | `IContractRepository` | Contract CRUD (5) + Approvals (2) | Provisional | D1, D6 |
| **Risk** | `TARGET (PROVISIONAL)` | `IRiskRepository` | Item CRUD (5) + Management (1) | Provisional | D1, D6 |
| **Scorecard** | `TARGET (PROVISIONAL)` | `IScorecardRepository` | Scorecard CRUD (5) + Versions (1) | Provisional | D1, D6 |
| **PMP** | `TARGET (PROVISIONAL)` | `IPmpRepository` | Plan CRUD (5) + Signatures (2) | Provisional | D1, D6 |

---

## Contract Governance Matrix

This matrix ties each target domain to its contract owner, freeze status, blocking dependencies, downstream consumers, and B2 gate impact. It enables cross-workstream coordination between C1 (contract definition), B1 (adapter implementation), C2 (auth), and E1 (contract testing).

### Per-Domain Governance

| Domain | Contract Owner | Freeze Status | Blocked By | Downstream Consumers | B2 Gate Impact |
|---|---|---|---|---|---|
| **Lead** | C1 | Route paths frozen | — | B1 Task 3, E1 | `CONTRACT_ALIGNED` for routes; cross-cutting D3/D4/D5 still apply |
| **Project** | C1 | CRUD frozen; aggregate A8 provisional | A8 | B1 Task 4, E1 | `CONTRACT_ALIGNED` for CRUD; aggregate blocked |
| **Estimating** | C1 | Base frozen; sub-resource D2 open | D2 | B1 Task 5, E1 | `CONTRACT_ALIGNED` for base; kickoff blocked |
| **Auth** | C2 | Not cataloged | A9 | B1 Task 7, E1 | Cannot reach `CONTRACT_ALIGNED` |
| **Schedule** | C1 | Provisional | D1, D6 | B1 Task 5, E1 | Blocked until D1/D6 resolved |
| **Buyout** | C1 | Provisional | D1, D6 | B1 Task 5, E1 | Blocked until D1/D6 resolved |
| **Compliance** | C1 | Provisional | D1, D6 | B1 Task 6, E1 | Blocked until D1/D6 resolved |
| **Contract** | C1 | Provisional | D1, D6 | B1 Task 6, E1 | Blocked until D1/D6 resolved |
| **Risk** | C1 | Provisional | D1, D6 | B1 Task 6, E1 | Blocked until D1/D6 resolved |
| **Scorecard** | C1 | Provisional | D1, D6 | B1 Task 7, E1 | Blocked until D1/D6 resolved |
| **PMP** | C1 | Provisional | D1, D6 | B1 Task 7, E1 | Blocked until D1/D6 resolved |

### Cross-Cutting Contract Dependencies

These affect all domain routes, not just one. They must be resolved before any domain can fully reach `CONTRACT_ALIGNED`.

| Dependency | Owner | Affects | Status |
|---|---|---|---|
| D3 — Error envelope field priority | C1 + B1 | All domain error responses | Open |
| D4 — Pagination default | C1 + B1 | All collection responses | Open |
| D5 — PATCH support | C1 | All domain mutation routes | Open |
| P1-D1 — Idempotency support | D1-workstream | All domain write routes | Pending D1 delivery |

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

**Target response envelope standard** (see Global Contract Standards below):
- Collection: `{ data: T[], total, page, pageSize }`
- Single item: `{ data: T }`
- Error: `{ error: "message", code: "ERROR_CODE", requestId: "uuid" }`

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

### Auth Domain — `NOT CATALOGED` (A9 unresolved)

Port interface: `IAuthRepository` — 6 methods across 4 capability groups. No backend route definitions exist yet. Auth does not follow a CRUD pattern. See B2 [Auth Domain: Special-Case Tracking] for full capability-group and dependency detail.

| Capability Group | Port Methods | Responsibility Layer | Assumed Route Shape (B1) | Status |
|---|---|---|---|---|
| Current User | `getCurrentUser` | Runtime token → user profile | `GET /api/auth/me` | A9 — no catalog entry |
| Roles | `getRoles`, `getRoleById` | Auth subsystem — role definitions | `GET /api/auth/roles`, `GET /api/auth/roles/{id}` | A9 — no catalog entry |
| Permissions | `getPermissionTemplates` | Auth subsystem — RBAC config | `GET /api/auth/permissions/templates` | A9 — no catalog entry |
| Role Assignment | `assignRole`, `removeRole` | Auth subsystem — write operations | `POST/DELETE /api/auth/users/{userId}/roles/{roleId}` | A9 — no catalog entry |

**Responsibility-layer ownership:**
- **C1 scope:** Route path definitions and response envelope shape for `/api/auth/*` endpoints. C1 must publish these paths before Auth can reach `CONTRACT_ALIGNED`.
- **C2 scope:** Auth subsystem implementation — backend service that manages roles, permissions, and assignments; OBO token exchange for auth-specific calls; role storage and permission logic. C2 owns whether this is a dedicated microservice or part of the Azure Functions backend.
- **Runtime / app-shell:** Token acquisition (MSAL in PWA, Bearer in backend) and user identity context. The `getCurrentUser` capability may resolve partly from token claims (available in the app shell) and partly from a backend profile endpoint. This boundary is a C2 design decision.

**Freeze criteria for Auth `CONTRACT_ALIGNED`:**
1. C1 or C2 publishes route definitions for all 4 capability groups (resolving A9)
2. Response envelope shape is defined per route (consistent with C1 target standards)
3. Auth-specific error codes are defined (e.g., role-not-found, assignment-denied)
4. OBO flow for auth routes is confirmed as same-as-domain or distinct (C2 decision)

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

### Project Setup Requests — Normalization Deltas

| Route | Current Response | Target Normalized | Migration Note |
|---|---|---|---|
| `POST` create | 201 raw `IProjectSetupRequest` entity | 201 `{data: IProjectSetupRequest}` | Wrap in `{data:...}` envelope |
| `GET` list | 200 raw `IProjectSetupRequest[]` | 200 `{data: [...], total, page, pageSize}` | Add collection envelope with pagination fields |
| `PATCH` advance | 200 raw entity | 200 `{data: entity}` | Wrap in `{data:...}` envelope |
| Errors | `{error: string}` | `{error, code, requestId}` | Add `code` and `requestId` fields |

**Owner:** C-workstream

### Acknowledgments — Normalization Deltas

| Route | Current Response | Target Normalized | Migration Note |
|---|---|---|---|
| `POST` acknowledge | 200 `{event, updatedState, isComplete}` | 200 `{data: {event, updatedState, isComplete}}` | Wrap composite in `{data:...}` or restructure |
| `GET` list | 200 `{events: IAcknowledgmentEvent[]}` | 200 `{data: [...], total, page, pageSize}` | Rename `events` → `data`; add pagination fields |
| Errors | `{error}`, 403 `{error}`, 409 `{error, declinedBy}` | `{error, code, requestId}` | Normalize error shape; move `declinedBy` into error details |

**Owner:** C-workstream

### Notifications — Normalization Deltas

| Route | Current Response | Target Normalized | Migration Note |
|---|---|---|---|
| `POST` send | 202 `{message: "Notification queued."}` | 202 `{message, correlationId}` | Add `correlationId` for request tracking |
| `GET` center | 200 `{totalCount, items, cursor, pageSize}` | 200 `{data: [...], total, page, pageSize}` | Rename `items` → `data`, `totalCount` → `total`; cursor pagination is a future-phase concern |
| `PATCH` read/dismiss | 200 `{message}` | 204 empty body or 200 `{data: entity}` | Align with status code standards — 204 if no body needed |
| `POST` mark-all-read | 200 `{message}` | 204 empty body or 200 `{data: {count}}` | Same as above |
| `GET` preferences | 200 raw `NotificationPreferences` | 200 `{data: NotificationPreferences}` | Wrap in `{data:...}` envelope |
| `PATCH` preferences | 200 raw entity | 200 `{data: entity}` | Wrap in `{data:...}` envelope |

**Owner:** C-workstream. Notification center's cursor-based pagination is an intentional design — normalization to offset-based is not required if cursor is retained as a domain-specific extension.

### Provisioning Saga — Normalization Deltas

| Route | Current Response | Target Normalized | Migration Note |
|---|---|---|---|
| `POST` provision | 202 `{message, projectId, correlationId}` | 202 `{message, correlationId}` | Already close to target; `projectId` in body is useful, may keep |
| `GET` status | 200 raw `ProvisioningStatus` | 200 `{data: ProvisioningStatus}` | Wrap in `{data:...}` envelope |
| `GET` failures | 200 raw array | 200 `{data: [...], total, page, pageSize}` | Add collection envelope |
| `POST` retry | 202 `{message, projectId}` | 202 `{message, correlationId}` | Add `correlationId`; already async-correct |
| `POST` escalate | 200 `{message, projectId}` | 200 `{data: {message, projectId}}` or 202 `{message, correlationId}` | Decide sync vs async semantics; wrap if sync |

**Owner:** C-workstream

### Routes Not Requiring Normalization

| Route Group | Reason |
|---|---|
| **Proxy** | Passthrough — forwards Graph API responses unmodified; normalization not applicable |
| **SignalR** | Azure-managed connection negotiation; response shape controlled by Azure SignalR Service |
| **Timer** | Non-HTTP trigger; no response shape |

### Open-Decision Deltas (Affecting Target Routes)

These deltas affect Phase 1 target domain routes that are not yet implemented. They must be resolved before those domains can reach `CONTRACT_ALIGNED`.

| Decision | Current State | Target | Impact | Owner |
|---|---|---|---|---|
| D3 — Error field priority | B1 reads `.error` first, `.message` fallback | C1 target: `error` field | Error envelope shape for all domain routes | C1 + B1 |
| D4 — Pagination default | B1: 25 (`DEFAULT_PAGE_SIZE`); C1: 50 | Canonical default TBD | Collection response `pageSize` field | C1 + B1 |
| D5 — PATCH support | B1: PUT only | C1 target: PUT + PATCH | Whether domain routes implement PATCH | C1 |
| D6 — Project-scoped paths | B1: nested `/api/projects/{id}/...` | C1 direction: flat `?projectId=` query params | Path shape for 8 project-scoped domains | C1 |
| A9 — Auth routes | No routes exist | IAuthRepository requires 4 route groups | Auth domain cannot reach `CONTRACT_ALIGNED` | C2 |

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

## Contract Divergence Register (Pre-Phase-1 Baseline)

This register documents where the current backend implementation diverges from the target contract conventions defined above. It establishes one authoritative baseline so that contract testing (P1-E1) and adapter implementation (P1-B1) can be planned against reality.

**Scope:** Existing implemented routes only. Target domain routes (leads, projects, estimating, etc.) do not exist yet and will be built to target conventions directly.

### Error Envelope

| Current Behavior | Target Convention | Follow-up |
|---|---|---|
| All routes use `{ error: string }` for errors | `{ message, code, requestId?, details? }` per D3 lock | C2 introduces standardized `ErrorEnvelopeSchema` with `message` field |
| `unauthorizedResponse()` returns `{ error: 'Unauthorized', reason }` | `{ message: 'Unauthorized', code: 'UNAUTHORIZED' }` | C2 replaces `unauthorizedResponse()` with standardized helper |
| No `code` field in any error response | Required machine-readable code (e.g., `NOT_FOUND`, `VALIDATION_ERROR`) | C2 adds `code` to all error responses |
| No `requestId` in responses; no `X-Request-Id` propagation | Optional UUID in error responses + response header | C2 adds request ID middleware |
| Validation errors are flat strings (e.g., `"projectName and groupMembers are required"`) | Structured `details` array: `[{ field?, message }]` | C2 adds Zod-backed validation with structured error details |

### Success Envelope

| Current Behavior | Target Convention | Follow-up |
|---|---|---|
| Single items returned as raw entity (no wrapper) | `{ data: T }` wrapper | C2 introduces `successResponse()` helper; new routes use it |
| Collections returned as raw arrays or domain-specific shapes | `{ items: T[], total, page, pageSize }` | New domain routes implement standard collection envelope |
| Notification center uses `{ items, totalCount, hasMore, nextCursor }` | Cursor-based pagination is an **intentional allowed exception** | No normalization needed — documented exception in this catalog |
| Provisioning 202 includes `correlationId` ✅ | `{ message, correlationId }` | Closest to target; add `correlationId` to notification-send and provisioning-retry when C2 standardizes |

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

### Auth and Validation

| Current Behavior | Target Convention | Follow-up |
|---|---|---|
| Each route calls `validateToken()` manually | Centralized `withAuth()` wrapper | C2 builds `withAuth()` on existing `validateToken()` |
| Manual `if (!field)` validation checks | Zod-based `parseBody<T>()` / `parseQuery<T>()` | C2 adds `zod` to `backend/functions/package.json` and validation middleware |

### Observability

| Current Behavior | Target Convention | Follow-up |
|---|---|---|
| `createLogger()` + `ILogger` fully implemented | Required foundation | ✅ No gap |
| Provisioning saga telemetry (9 events, 3 metrics) | Required | ✅ No gap |
| No proxy/handler/auth/notification telemetry events | Multiple event families per P1-C3 | C3 implementation scope |
| No `/api/health` endpoint | Required by C3 | C3 builds health endpoint |

**Note:** Existing routes are NOT broken — they work correctly with their current shapes. The divergences above represent the gap between pre-Phase-1 ad-hoc conventions and the locked target conventions. Normalization occurs during C2 (response helpers, auth middleware) and as new domain routes are built to target conventions directly.
