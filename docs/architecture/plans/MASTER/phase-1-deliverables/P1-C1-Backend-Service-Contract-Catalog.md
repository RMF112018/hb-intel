# P1-C1: Backend Service Contract Catalog

**Document ID:** P1-C1
**Phase:** Phase 1
**Status:** Draft
**Date:** 2026-03-16
**Owner:** Backend Services Team

---

## Purpose

Define the complete HTTP service contract for HB Intel backend Azure Functions v4 (TypeScript). This catalog documents all existing routes and the planned domain API routes to be implemented in Phase 1, ensuring consistency in request/response envelopes, authentication, error handling, and pagination across all services.

---

## Catalog Overview

| Route Group | Status | Routes | Notes |
|---|---|---|---|
| Proxy | Implemented | `GET/POST/PATCH/PUT/DELETE proxy/{*path}` | Graph API forwarding with OBO, Redis cache |
| Project Setup Requests | Implemented | 3 routes | State machine: Submitted → PendingApproval → ReadyToProvision → Provisioning → Completed |
| Project Requests State Machine | Implemented | 3 routes | Project request lifecycle management |
| Acknowledgments | Implemented | 3 routes | Sign-off and acknowledgment operations |
| Notifications | Implemented | 3 routes | Notification delivery and read tracking |
| SignalR | Implemented | 2 routes | Real-time connection negotiation and updates |
| Provisioning Saga | Implemented | 3 routes | Site provisioning orchestration via Azure Table Storage |
| Health Check | Implemented | 1 route | Staging smoke test endpoint (no auth) |
| **Leads** | **Phase 1 Target** | **6 routes** | CRUD + search (paginated) |
| **Projects** | **Phase 1 Target** | **6 routes** | CRUD + search (paginated) |
| **Estimating** | **Phase 1 Target** | **6 routes** | CRUD + search (paginated) |
| Schedule | Phase 1 Target | 6 routes | CRUD + search (planned) |
| Buyout | Phase 1 Target | 6 routes | CRUD + search (planned) |
| Compliance | Phase 1 Target | 6 routes | CRUD + search (planned) |
| Contracts | Phase 1 Target | 6 routes | CRUD + search (planned) |
| Risk | Phase 1 Target | 6 routes | CRUD + search (planned) |
| Scorecard | Phase 1 Target | 6 routes | CRUD + search (planned) |
| PMP | Phase 1 Target | 6 routes | CRUD + search (planned) |

---

## Global Contract Standards

All Azure Function routes **must** adhere to the following standards:

### Authentication & Authorization

- **Bearer Token Required:** All routes except `GET /api/health` require a valid Bearer token in the `Authorization` header.
- **Token Validation:** Token is validated via `validateToken()` middleware; invalid/missing token returns `401 Unauthorized`.
- **OBO Flow:** For downstream Microsoft Graph or SharePoint calls, tokens are acquired via MSAL OBO service using the user's token as assertion.
- **Identity Trust Boundary:** User identity is sourced only from validated JWT claims; client-provided identity fields are ignored (server overwrites from `claims.upn`).

### Request/Response Content

- **Content-Type:** All requests and responses are `application/json`.
- **Request ID Tracking:** `X-Request-Id` header is passed through; generated (UUID) if absent; included in error responses and logs.
- **Idempotency:** `Idempotency-Key` header (optional) accepted on `POST/PATCH/PUT` mutations to detect and reject duplicate requests.

### Success Response Envelopes

**Collection Response (paginated list):**
```json
{
  "data": [ /* T[] */ ],
  "total": 0,
  "page": 1,
  "pageSize": 50
}
```

**Single Item Response:**
```json
{
  "data": { /* T */ }
}
```

**No-Content Response:**
```json
{
  "status": "ok"
}
```

### Error Response Envelope

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "requestId": "uuid-or-passed-header"
}
```

### HTTP Status Conventions

| Status | Meaning | Trigger |
|---|---|---|
| `200 OK` | Success; resource retrieved or mutation applied | GET, PATCH, PUT, DELETE (if returning updated entity) |
| `201 Created` | Success; new resource created | POST |
| `204 No Content` | Success; no response body | DELETE (if no response entity), or async operations |
| `400 Bad Request` | Invalid request; validation failed | Missing required fields, invalid format, malformed state transition |
| `401 Unauthorized` | Bearer token invalid, expired, or missing | Missing/invalid token on protected routes |
| `403 Forbidden` | Authenticated user lacks permission | Action requires role/scope not present in token |
| `404 Not Found` | Resource does not exist | GET/{id}, PATCH/{id}, DELETE/{id} with non-existent id |
| `409 Conflict` | Request conflicts with current state | State transition guard violation, duplicate idempotency key detected |
| `422 Unprocessable Entity` | Semantic validation failed (business logic) | Project number format invalid, invalid state transition, missing project number for ReadyToProvision |
| `500 Internal Server Error` | Unhandled exception | Service call failure, database error (wrapped in error envelope) |
| `502 Bad Gateway` | Downstream service unavailable | Graph API, SharePoint, or Azure Table Storage timeout/failure |

### Pagination

- **Query Parameters:** `?page=1&pageSize=50` (default `pageSize=50`, max `pageSize=200`).
- **Cursor vs Offset:** Phase 1 uses offset-based pagination; cursor-based pagination is a Phase 2 optimization.
- **Response Fields:** `total` (exact count or estimated), `page` (1-indexed), `pageSize`.

---

## Existing Route Catalog

### Proxy Routes (Implemented)

Generic authenticated forwarding to Microsoft Graph API with caching and OBO token acquisition.

| Method | Route | Auth | Cache | Mutation? |
|---|---|---|---|---|
| `GET` | `/api/proxy/{*path}` | Bearer → OBO | Redis TTL 300s | No |
| `POST` | `/api/proxy/{*path}` | Bearer → OBO | — | Yes |
| `PATCH` | `/api/proxy/{*path}` | Bearer → OBO | — | Yes |
| `PUT` | `/api/proxy/{*path}` | Bearer → OBO | — | Yes |
| `DELETE` | `/api/proxy/{*path}` | Bearer → OBO | — | Yes |

**Purpose:** Forward authenticated Graph API requests (groups, users, sites, etc.) without duplicating Graph client logic in each feature.

**Request:** Pass-through; client constructs Graph API query, server validates Bearer token and acquires OBO token.

**Response:** Forwarded Graph API response (success or error).

**Error Handling:** 502 Bad Gateway if Graph API unavailable; 401 if OBO token acquisition fails; 500 if unexpected error.

---

### Project Setup Requests Routes (Implemented)

State machine for project setup request lifecycle: Submitted → PendingApproval → ReadyToProvision → Provisioning → Completed/Rejected.

| Method | Route | State Transition | Status Code |
|---|---|---|---|
| `POST` | `/api/project-setup-requests` | Create (→ Submitted) | 201 |
| `GET` | `/api/project-setup-requests` | List (paginated, optional state filter) | 200 |
| `PATCH` | `/api/project-setup-requests/{requestId}/state` | Advance state (validate transition + business rules) | 200 |

**Request Body (POST):**
```json
{
  "projectName": "string (required)",
  "projectLocation": "string (optional)",
  "projectType": "string (optional)",
  "projectStage": "string (default: 'Pursuit')",
  "groupMembers": [ "email@domain.com" ] (required, array)
}
```

**Request Body (PATCH):**
```json
{
  "newState": "Submitted|PendingApproval|ReadyToProvision|Provisioning|Completed|Rejected",
  "projectNumber": "##-###-## (required if newState === ReadyToProvision)",
  "clarificationNote": "string (optional)"
}
```

**Response (all 3 routes):**
```json
{
  "data": {
    "requestId": "uuid",
    "projectId": "uuid",
    "projectName": "string",
    "projectLocation": "string",
    "projectType": "string",
    "projectStage": "string",
    "state": "ProjectSetupRequestState",
    "submittedBy": "upn",
    "submittedAt": "iso-timestamp",
    "projectNumber": "##-###-##|null",
    "clarificationNote": "string|null",
    "completedBy": "upn|null",
    "completedAt": "iso-timestamp|null",
    "groupMembers": [ "email@domain.com" ],
    "retryCount": 0
  }
}
```

**State Transition Guard:** `isValidTransition()` enforces legal state paths; invalid transitions return `400 Bad Request`.

**Validation Rules:**
- ReadyToProvision requires a valid project number matching `##-###-##` format (human-assigned).
- groupMembers array must not be empty on POST.

---

### Project Requests Routes (Implemented)

Alternative project request lifecycle implementation (see also Project Setup Requests).

| Method | Route | Notes |
|---|---|---|
| `POST` | `/api/project-requests` | Create project request |
| `GET` | `/api/project-requests` | List project requests (paginated) |
| `GET` | `/api/project-requests/{id}` | Fetch single request |
| `PATCH` | `/api/project-requests/{id}/submit` | Transition: Draft → Submitted |
| `PATCH` | `/api/project-requests/{id}/approve` | Transition: PendingApproval → Approved |
| `PATCH` | `/api/project-requests/{id}/reject` | Transition: PendingApproval → Rejected |

**Response Envelope:** Standard single-item or collection envelope (see Global Contract Standards).

---

### Acknowledgments Routes (Implemented)

Sign-off and acknowledgment operations.

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/acknowledgments/{context}` | Fetch acknowledgments for a context (e.g., project, phase) |
| `POST` | `/api/acknowledgments` | Record acknowledgment (sign-off) |
| `DELETE` | `/api/acknowledgments/{id}` | Revoke acknowledgment |

**Request Body (POST):**
```json
{
  "context": "string (e.g., 'project-123')",
  "acknowledgedBy": "upn (overwritten from token claims)",
  "type": "string (e.g., 'safety-review', 'budget-approval')"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "context": "string",
    "acknowledgedBy": "upn",
    "type": "string",
    "acknowledgedAt": "iso-timestamp"
  }
}
```

---

### Notifications Routes (Implemented)

Smart notification delivery (email, Teams, in-app).

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/notifications/send` | Trigger notification delivery |
| `GET` | `/api/notifications/{userId}` | Fetch user notifications (paginated) |
| `PATCH` | `/api/notifications/{id}/read` | Mark notification as read |

**Request Body (POST):**
```json
{
  "userId": "upn or object id",
  "type": "string (e.g., 'provisioning-complete', 'approval-requested')",
  "title": "string",
  "message": "string",
  "channels": [ "email", "teams", "in-app" ] (optional; defaults to in-app)
}
```

**Response (GET):**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "upn",
      "type": "string",
      "title": "string",
      "message": "string",
      "isRead": false,
      "createdAt": "iso-timestamp"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 50
}
```

---

### SignalR Routes (Implemented)

Real-time connection negotiation and message dispatch for provisioning updates.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/negotiate` | SignalR connection negotiation (WebSocket upgrade) |
| `POST` | `/api/signalr-message` | Send real-time update to connected clients |

**SignalR Hub:** Messages pushed to clients during provisioning saga (step completion, error, retry).

---

### Provisioning Saga Routes (Implemented)

Orchestrate multi-step site provisioning (create site, provision lists, configure groups, etc.) via state machine persisted in Azure Table Storage.

| Method | Route | Purpose | Trigger |
|---|---|---|---|
| `POST` | `/api/provision-project-site` | Begin provisioning saga | Project ReadyToProvision state transition |
| `GET` | `/api/provision-project-site/{projectId}/status` | Poll current provisioning status | Frontend polling or SignalR dispatch |
| `POST` | `/api/provision-project-site/{projectId}/retry` | Retry failed step | Manual intervention after step failure |

**Request Body (POST /provision-project-site):**
```json
{
  "projectId": "uuid (required)",
  "projectNumber": "##-###-## (required)",
  "projectName": "string (required)",
  "triggeredBy": "upn (overwritten from token claims)",
  "correlationId": "uuid (auto-generated if absent)"
}
```

**Response (GET /status):**
```json
{
  "data": {
    "projectId": "uuid",
    "currentStep": "create-site|create-lists|create-groups|...",
    "state": "running|completed|failed",
    "progress": 0.5,
    "lastError": { "code": "...", "message": "..." } | null,
    "retryCount": 0,
    "startedAt": "iso-timestamp",
    "completedAt": "iso-timestamp|null"
  }
}
```

**Saga Orchestration:** State machine steps are persisted in Azure Table Storage; deferred operations are triggered by timer function (`timerFullSpec`).

---

### Health Check Route (Implemented)

Smoke test endpoint for staging and monitoring.

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | None | Return service status |

**Response:**
```json
{
  "status": "ok",
  "timestamp": "iso-timestamp",
  "version": "1.0.0"
}
```

**Use Cases:** Kubernetes liveness/readiness probes, staging deployment smoke tests, CloudFlare health checks.

---

## Phase 1 Target Route Catalog

### Standard CRUD Pattern

All Phase 1 domain routes implement a consistent CRUD pattern with pagination, search, and validation:

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/{domain}?page={n}&pageSize={n}` | Paginated list (filtered by project context) |
| `GET` | `/api/{domain}/{id}` | Fetch single record |
| `POST` | `/api/{domain}` | Create record |
| `PUT` | `/api/{domain}/{id}` | Full update (replace all fields) |
| `PATCH` | `/api/{domain}/{id}` | Partial update (merge fields) |
| `DELETE` | `/api/{domain}/{id}` | Delete record (soft or hard per domain rules) |
| `GET` | `/api/{domain}/search?q={query}&projectId={id}` | Full-text or indexed search (where applicable) |

**Request Envelope (POST/PUT/PATCH):** Standard JSON body; respects `Idempotency-Key` on mutations.

**Response Envelope (GET):** Paginated list or single item (see Global Contract Standards).

**Error Codes:** 400 (validation), 401 (auth), 403 (permission), 404 (not found), 409 (conflict/duplicate), 422 (business logic), 500 (server error).

---

### Leads Domain (Phase 1 Priority)

Project lead management and tracking.

| Method | Route | Request | Response |
|---|---|---|---|
| `GET` | `/api/leads?projectId={id}&page=1&pageSize=50` | Query params | Paginated `ILead[]` |
| `GET` | `/api/leads/{id}` | Route param | Single `ILead` |
| `POST` | `/api/leads` | Omit<ILead, 'id'\|'createdAt'\|'updatedAt'> | Created `ILead` with server-generated id |
| `PUT` | `/api/leads/{id}` | Full `Omit<ILead, 'id'>`; overwrite all fields | Updated `ILead` |
| `PATCH` | `/api/leads/{id}` | Partial `Omit<ILead, 'id'>`; merge fields | Merged `ILead` |
| `DELETE` | `/api/leads/{id}` | — | `{ "status": "ok" }` |
| `GET` | `/api/leads/search?q={query}&projectId={id}` | Full-text query | Paginated `ILead[]` (top 20 results) |

**Data Model:**
```typescript
interface ILead {
  id: string;
  projectId: string;
  name: string;
  email: string;
  role: string; // e.g., "Project Manager", "Design Lead"
  department: string;
  phone?: string;
  notes?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  createdBy: string; // upn
}
```

---

### Projects Domain (Phase 1 Priority)

Project metadata and high-level information.

| Method | Route | Request | Response |
|---|---|---|---|
| `GET` | `/api/projects?page=1&pageSize=50` | Query params (optional context filter) | Paginated `IProject[]` |
| `GET` | `/api/projects/{id}` | Route param | Single `IProject` |
| `POST` | `/api/projects` | Omit<IProject, 'id'\|'createdAt'\|'updatedAt'> | Created `IProject` |
| `PUT` | `/api/projects/{id}` | Full `Omit<IProject, 'id'>`; overwrite | Updated `IProject` |
| `PATCH` | `/api/projects/{id}` | Partial `Omit<IProject, 'id'>`; merge | Merged `IProject` |
| `DELETE` | `/api/projects/{id}` | — | `{ "status": "ok" }` |
| `GET` | `/api/projects/search?q={query}` | Full-text query | Paginated `IProject[]` |

**Data Model:**
```typescript
interface IProject {
  id: string;
  projectNumber: string; // ##-###-##
  projectName: string;
  projectLocation: string;
  projectType: string; // e.g., "New Build", "Renovation"
  projectStage: string; // e.g., "Pursuit", "In-Construction", "Closeout"
  siteId: string; // SharePoint site ID
  status: string; // e.g., "Active", "On Hold", "Completed"
  budget?: number;
  startDate?: string; // ISO date
  estimatedEndDate?: string;
  actualEndDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

---

### Estimating Domain (Phase 1 Priority)

Cost estimation and bid analysis.

| Method | Route | Request | Response |
|---|---|---|---|
| `GET` | `/api/estimating?projectId={id}&page=1&pageSize=50` | Query params (project context required) | Paginated `IEstimatingItem[]` |
| `GET` | `/api/estimating/{id}` | Route param | Single `IEstimatingItem` |
| `POST` | `/api/estimating` | Omit<IEstimatingItem, 'id'\|'createdAt'\|'updatedAt'> | Created `IEstimatingItem` |
| `PUT` | `/api/estimating/{id}` | Full update | Updated `IEstimatingItem` |
| `PATCH` | `/api/estimating/{id}` | Partial update | Merged `IEstimatingItem` |
| `DELETE` | `/api/estimating/{id}` | — | `{ "status": "ok" }` |
| `GET` | `/api/estimating/search?q={query}&projectId={id}` | Full-text query | Paginated `IEstimatingItem[]` |

**Data Model:**
```typescript
interface IEstimatingItem {
  id: string;
  projectId: string;
  lineItem: string; // e.g., "Excavation", "Concrete"
  description: string;
  quantity: number;
  unit: string; // e.g., "CY", "SF", "HR"
  unitCost: number;
  totalCost: number;
  status: string; // e.g., "Draft", "Approved", "Bid"
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

---

### Remaining Domains (Phase 1 Planned, Implementation Order TBD)

Each domain follows the standard CRUD pattern above:
- **Schedule:** Project timeline, milestones, task dependencies.
- **Buyout:** Vendor management and purchase orders.
- **Compliance:** Safety, regulatory, and audit compliance records.
- **Contracts:** Contract agreements and procurement documents.
- **Risk:** Risk register and mitigation strategies.
- **Scorecard:** Project performance and KPI tracking.
- **PMP:** Project Management Plan artifacts and updates.

Each domain will define its own `IEntity` interface and validation rules; all share the same HTTP contract.

---

## Open Decisions

These questions must be resolved before Phase 1 domain route implementation begins:

1. **SharePoint List Schemas**
   - What are the canonical list names in SharePoint (Leads, Projects, Estimating, etc.)?
   - Which columns exist in each list? Are they custom columns?
   - What are the primary key strategies (ID field, lookup references)?

2. **Data Flow: Direct vs Cache**
   - Do routes call SharePoint directly via PnPjs service, or cache data in Azure Table Storage first?
   - If cached, what is the invalidation/refresh strategy (on-write, periodic, event-driven)?
   - Does query-by-projectId require a cached index in Table Storage, or can it be done in-memory after fetch?

3. **Pagination Strategy**
   - Current plan: offset-based (page + pageSize).
   - Acceptable, or should Phase 1 implement cursor-based for large result sets?
   - Max pageSize limit: 200 or 500?

4. **Auth Scopes & Permissions**
   - Which domains require role-based read/write checks (e.g., only lead can edit lead record)?
   - Are scopes enforced in token (Graph app roles), or application-level RBAC?
   - Does delete require a special permission or soft-delete only?

5. **Multi-Tenancy**
   - Is HB Intel single-tenant (one tenant ID per deployment), or multi-tenant (query filter by tenant)?
   - Should all queries auto-filter by current user's tenant from token?

6. **Soft vs Hard Delete**
   - DELETE routes: should they soft-delete (mark isDeleted=true) or hard-delete (remove from SharePoint)?
   - Audit trail implications?

7. **Validation & Business Rules**
   - Are validation rules enforced client-side, server-side, or both?
   - Which domains have cross-field or cross-record constraints (e.g., estimating total must match sum)?

---

## Implementation Notes

- All routes log key events (create, update, delete, state transition) with `X-Request-Id` correlation.
- All mutations (POST/PATCH/PUT/DELETE) are atomic from the perspective of a single resource.
- Batch operations (multi-record mutations) are not included in Phase 1; single-record CRUD only.
- Search is optional per domain; Phase 1 priority is **Leads** and **Projects** search support.

---

**End of Document**
