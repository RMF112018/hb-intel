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
| **References** | P1-B1 (Proxy Adapter Engineering Plan), P1-B2 (Adapter Completion Backlog), P1-C2 (Auth Hardening) |

---

## Purpose

Define the complete HTTP service contract for HB Intel backend Azure Functions v4 (TypeScript). This catalog separates currently implemented routes from target Phase 1 domain contracts so that consuming workstreams (B1 adapter implementation, E1 contract testing) can distinguish what exists today from what they are building toward.

---

## Contract Status Legend

| Status | Meaning |
|---|---|
| `IMPLEMENTED` | Route exists in repo and is deployed; behavior verified against code |
| `IMPLEMENTED (DELTA)` | Route exists but current response shape or behavior differs from target contract standards |
| `TARGET` | Phase 1 target contract; route not yet implemented in backend |
| `TARGET (PROVISIONAL)` | Target contract with open decisions pending (B1 D1–D6) |
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
| Provisioning Saga | `IMPLEMENTED (DELTA)` | 6 | — | Uses 202 Accepted for async (not 204); admin routes included |
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

**Delta from previous draft:** No DELETE route found in repo. Previous C1 listed 3 routes.

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

**Delta from previous draft:** Previous C1 listed 3 routes. Actual count is 7 HTTP + 3 background. Response shapes differ significantly from target collection envelope.

### SignalR (1 route)

| Method | Route | Handler | Notes |
|---|---|---|---|
| `POST` | `provisioning-negotiate` | `signalrNegotiate` | SignalR connection negotiation for provisioning events |

**Current response shape:** Azure-managed SignalR connection info (response shape controlled by Azure SignalR Service, not application code).

**Delta from previous draft:** Previous C1 listed 2 routes (negotiate + message). Only negotiate found in repo.

### Provisioning Saga (6 routes)

| Method | Route | Handler | Notes |
|---|---|---|---|
| `POST` | `provision-project-site` | `provisionProjectSite` | Begin saga; returns 202 Accepted |
| `GET` | `provisioning-status/{projectId}` | `getProvisioningStatus` | Poll provisioning status |
| `GET` | `provisioning-failures` | `listFailedRuns` | Admin-only failures inbox |
| `POST` | `admin/trigger-timer` | `triggerTimerManually` | Dev/staging only; blocked in Production |
| `POST` | `provisioning-retry/{projectId}` | `retryProvisioning` | Retry failed provisioning |
| `POST` | `provisioning-escalate/{projectId}` | `escalateProvisioning` | Escalate provisioning request |

**Current response shape:** POST provision returns 202 `{message: "Provisioning started", projectId, correlationId}`. GET status returns 200 raw `ProvisioningStatus` entity. GET failures returns 200 array. POST retry returns 202 `{message, projectId}`. POST escalate returns 202. Errors return `{error: string}`.

**Delta from previous draft:** Previous C1 listed 3 routes. Actual count is 6 (includes admin and escalation routes).

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
| `POST` escalate | 202 response | 202 `{message, correlationId}` | Normalize to async accepted shape |

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
| D6 — Project-scoped paths | B1: nested `/api/projects/{id}/...` | C1: not yet specified | Path shape for 8 project-scoped domains | C1 |
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
{ "data": [ /* T[] */ ], "total": 0, "page": 1, "pageSize": 50 }
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
{ "error": "Human-readable message", "code": "ERROR_CODE", "requestId": "uuid" }
```

**D3 note:** The target envelope uses `error` as the primary message field. B1's `extractErrorMessage()` currently reads `.error` first with `.message` fallback (dual-field strategy). Until D3 is resolved, backends should include the `error` field per this target standard. Backends may optionally include a `message` field for transitional compatibility, but `error` is authoritative.

### Mutation Methods

**Target:** Domain routes support both PUT (full replace) and PATCH (partial merge).

**D5 note:** B1 currently implements PUT only. D5 must resolve whether PATCH routes are also required for Phase 1 domain endpoints. Until D5 is resolved, PUT is the minimum requirement for all domain mutation routes. If PATCH is adopted, semantics are: PATCH merges provided fields into the existing resource; PUT replaces the entire resource (except server-managed fields like `id`, `createdAt`).

### Pagination

- Query params: `?page=1&pageSize=50` (max pageSize=200)
- **D4 note:** Target default pageSize is 50 (C1). B1 implements 25 as `DEFAULT_PAGE_SIZE` fallback when the backend omits the `pageSize` field. D4 must resolve the canonical default before `CONTRACT_ALIGNED`. Until resolved, backends should return `pageSize` in every collection response so the frontend does not need to assume a default.
- Offset-based pagination in Phase 1; cursor-based deferred to Phase 2

### Idempotency

- `Idempotency-Key` header accepted on POST/PUT/PATCH mutations
- **Target behavior pending P1-D1 delivery:** Idempotency guard middleware, key generation, and replay semantics are owned by P1-D1 (Write Safety). Until D1 delivers, idempotency support is aspirational in this catalog — backends are not yet required to honor the header.

### Request Tracking

- `X-Request-Id` header passed through; generated (UUID) if absent; included in error responses and logs

---

## Open Decisions (Cross-Referenced from B1/B2)

| ID | Decision | Owner | C1 Impact | When Needed |
|---|---|---|---|---|
| D1 | Singular vs plural route paths | C1 | Path definitions for Schedule, Buyout, Risk, Scorecard | Before `CONTRACT_ALIGNED` |
| D2 | Estimating sub-resource routing | C1 | Tracker/kickoff route structure | Before `CONTRACT_ALIGNED` |
| D3 | Error envelope field priority (`.error` vs `.message`) | C1 + B1 | Error response shape | Before `CONTRACT_ALIGNED` |
| D4 | Pagination default (50 vs 25) | C1 + B1 | Default pageSize in collection responses | Before `CONTRACT_ALIGNED` |
| D5 | PATCH support in domain routes | C1 | Whether PUT-only or PUT+PATCH | Before `CONTRACT_ALIGNED` |
| D6 | Project-scoped path pattern | C1 | Nested vs flat query-param for 8 domains | Before `CONTRACT_ALIGNED` |
| A8 | Aggregate endpoints (portfolio summary, metrics) | C1 | Whether aggregate routes are built | Before Project `CONTRACT_ALIGNED` |
| A9 | Auth management routes | C2 | Whether `/api/auth/*` routes are defined | Before Auth `CONTRACT_ALIGNED` |
