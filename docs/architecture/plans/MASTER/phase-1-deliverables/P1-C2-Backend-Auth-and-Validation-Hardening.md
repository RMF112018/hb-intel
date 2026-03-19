# P1-C2: Backend Auth and Validation Hardening

**Document ID:** P1-C2
**Phase:** 1
**Status:** Implementation-Ready
**Date:** 2026-03-16
**Owner:** Architecture

## Goal

Add centralized authentication middleware and Zod request validation to all Azure Functions routes, standardizing authentication enforcement, request/response shapes, and error handling across the Phase 1 domain APIs (leads, projects, estimating, acknowledgments, notifications).

## Current Backend State (Pre-Implementation Baseline)

Verified against live repo 2026-03-18. This section documents what exists so C2 implementation builds on the right foundation.

**What exists and can be reused:**
- `backend/functions/src/middleware/validateToken.ts` — JWT validation against Azure Entra ID JWKS via `jose` library. Returns `IValidatedClaims { upn, oid, roles, displayName? }`. Tested (valid token, missing header, expired, wrong audience, missing claims). **C2 builds `withAuth()` on top of this.**
- `backend/functions/src/utils/logger.ts` — `createLogger()` producing structured JSON with `trackEvent()` and `trackMetric()`. **Reuse for request ID logging.**
- `unauthorizedResponse()` helper in `validateToken.ts` — returns `{ error: 'Unauthorized', reason }`. **C2 replaces with standardized error envelope using `message` field per D3.**

**What does NOT exist (C2 must build):**
- Centralized `withAuth()` wrapper — each route currently calls `validateToken()` manually in try-catch
- Zod request validation — `zod` is not in `backend/functions/package.json`; all validation is manual `if (!field)` checks
- Standardized response helpers (`successResponse()`, `errorResponse()`, `listResponse()`) — each route constructs `{ status, jsonBody }` ad-hoc
- `X-Request-Id` propagation — no request ID middleware exists; no `requestId` in error responses
- Structured validation error details — validation errors are flat strings, not `{ field, message }[]` arrays

## Auth Readiness Clarifications

### What Exists Now (Implementation Foundation)

| Component | File | Status |
|---|---|---|
| `validateToken()` | `backend/functions/src/middleware/validateToken.ts` | Production-tested JWT validation against Entra ID JWKS via `jose` |
| `IValidatedClaims` | same file | Canonical claim shape: `{ upn, oid, roles, displayName? }` |
| `unauthorizedResponse()` | same file | Returns `{ error: 'Unauthorized', reason }` — pre-D3 shape, C2 replaces |
| `ManagedIdentityOboService` | `backend/functions/src/services/msal-obo-service.ts` | App-level MI token acquisition for downstream SharePoint/Graph calls; NOT user-delegated OBO |
| Identity trust boundary | All HTTP handlers | Server-managed fields (`triggeredBy`, `submittedBy`) overwritten from JWT claims (ADR-0078) |
| Per-handler auth pattern | All HTTP handlers | Every handler calls `validateToken()` directly in inline try-catch — no wrapper, no middleware |

### What C2 Must Build (Does Not Exist Yet)

| Component | Target File | Dependency |
|---|---|---|
| `withAuth()` middleware wrapper | `middleware/auth.ts` | None — builds on existing `validateToken()` |
| Zod request validation | `middleware/validate.ts` | `zod` must be added to `package.json` |
| `parseBody<T>()` / `parseQuery<T>()` helpers | `middleware/validate.ts` | Zod |
| `errorResponse()` / `successResponse()` / `listResponse()` | `utils/response-helpers.ts` | None |
| Error envelope using `message` field per D3 | response helpers | None |
| `X-Request-Id` propagation | `middleware/request-id.ts` | None |
| `/api/auth/me` smoke utility endpoint | TBD | C2 or C1 delivery |

### Implementation Entry Condition

C2 implementation can begin immediately. No upstream blocker prevents starting Chunk 1 (auth middleware). The foundation (`validateToken()`) is tested and production-ready. C2 does NOT depend on C1 domain routes — middleware can be built and tested independently, then applied to routes as C1 delivers them.

---

## Phase 1 Auth Boundary Model

This section is the canonical developer-facing reference for the Phase 1 auth and permission model across all surfaces. For IT/admin operational steps (Entra ID setup, app registration, permission grants, SharePoint site-scoped access, verification checklist), see the [IT Department Setup Guide](../../../../how-to/administrator/setup/backend/IT-Department-Setup-Guide.md).

### Surface Auth Boundaries

| Surface | Token Type | Audience | Credential | Permissions |
|---|---|---|---|---|
| **PWA** | MSAL Bearer (delegated) | `api://<function-app-name>` | User's Azure AD token via `PublicClientApplication` | `User.Read` scope; backend API scope `api://<function-app-name>/.default` |
| **SPFx** | SharePoint context (delegated) | SharePoint tenant | SPFx `WebPartContext.pageContext` | Site group membership → mapped to HBI permission keys via `SpfxRbacAdapter` |
| **Backend Functions** | Validates inbound Bearer | `api://<CLIENT_ID>` (via `jose` JWKS) | N/A — validator, not acquirer | Extracts `upn`, `oid`, `roles` from validated JWT claims |
| **Backend → SharePoint** | Managed Identity (application) | `https://{tenant}.sharepoint.com/.default` | `DefaultAzureCredential` (system-assigned MI) | `Sites.Selected` — per-site grant required for each site |
| **Backend → Graph** | Managed Identity (application) | `https://graph.microsoft.com/.default` | `DefaultAzureCredential` (system-assigned MI) | `Group.ReadWrite.All` — tenant-wide for security group lifecycle |

### App Registrations

| Registration | Purpose | Key Config |
|---|---|---|
| **Backend API** | Defines token audience + API scope | Application ID URI: `api://<function-app-name>`, scope: `access_as_user`, admin consent required |
| **PWA MSAL client** | Acquires user tokens for backend API | `VITE_MSAL_CLIENT_ID`, `VITE_MSAL_AUTHORITY`, `VITE_MSAL_SCOPES` |
| **Function App Managed Identity** | System-assigned; downstream SharePoint/Graph calls | No client secret in production; `AZURE_CLIENT_ID`/`AZURE_CLIENT_SECRET` for local dev only |

### Delegated vs Application vs OBO

| Pattern | Where Used | Status |
|---|---|---|
| **Delegated** | PWA user login (`User.Read`); SPFx page context (SharePoint site groups) | Production-ready |
| **Application (Managed Identity)** | Backend → SharePoint (provisioning, list ops); Backend → Graph (group lifecycle) | Production-ready for provisioning; `Sites.Selected` per-site grants required |
| **OBO (On-Behalf-Of)** | Proxy handler acquires downstream tokens using user's Bearer token | **STUB** — proxy handler returns `{ _mock: true }` responses; OBO token acquired but not used for real API calls |

### SharePoint Permission Model

- **Default:** `Sites.Selected` (least-privilege; per-site grants required)
- **Fallback:** `Sites.FullControl.All` (governed exception; requires ADR with expiry commitment)
- **Config:** `SITES_PERMISSION_MODEL` env var; defaults to `sites-selected`
- **Per-project grant process:** After site creation, Managed Identity must receive site-scoped permission via Graph API `POST /sites/{siteId}/permissions`
- **Pre-provisioned sites requiring grants:** Hub site, Sales/BD site, shared/department site(s)

### Entra ID Three-Group Model (per project)

| Group | SharePoint Permission Level | Initial Members |
|---|---|---|
| `HB-{projectNumber}-Leaders` | Full Control | `groupLeaders` UPNs + `OPEX_MANAGER_UPN` |
| `HB-{projectNumber}-Team` | Contribute | `groupMembers` UPNs + `submittedBy` |
| `HB-{projectNumber}-Viewers` | Read | Department-specific background viewers from `DEPT_BACKGROUND_ACCESS_{DEPARTMENT}` |

Requires `Group.ReadWrite.All` application permission on the Managed Identity.

### Phase 1 Auth Blockers

| # | Blocker | Impact | Owner | Reference | Status |
|---|---|---|---|---|---|
| ~~1~~ | ~~OBO endpoint list not finalized~~ | ~~Cannot determine which routes require delegated permissions~~ | ~~Architecture~~ | ~~IT Setup Guide §8.6~~ | **CLOSED** — See Endpoint Auth Matrix above. Only `/api/proxy/*` needs OBO; all other routes use MI. |
| 2 | **Per-site grant process** — manual script + automation extension point | Manual grants via `tools/grant-site-access.sh`; `IGraphService.grantSiteAccess()` available for future automation | IT + Architecture | IT Setup Guide §8.4, §9.6; `tools/grant-site-access.sh` | **Process-documented** — full automation deferred to post-pilot |
| 3 | **GraphService `Group.ReadWrite.All` permission** — real Graph API calls implemented and permission-gated | Step 6 gated behind `GRAPH_GROUP_PERMISSION_CONFIRMED` env var; throws `GraphPermissionNotConfirmedError` until IT confirms | Backend + IT | `backend/functions/src/services/graph-service.ts` | **Code-complete** — awaiting IT permission grant |
| ~~4~~ | ~~Startup config validation not wired~~ | ~~Backend could start with missing auth config~~ | ~~Backend~~ | ~~G2.6 task~~ | **CLOSED** — `validateRequiredConfig()` wired into `createServiceFactory()` (commit 4f89f0f). |

### Identity Trust Boundary

All HTTP endpoints enforce: identity is extracted from validated JWT claims only, never from request body. Server-managed fields (`triggeredBy`, `submittedBy`) are overwritten with `claims.upn` (ADR-0078, D-PH6-03).

### Endpoint Auth Matrix (OBO vs Managed Identity)

This matrix documents the locked auth treatment for every current and planned Phase 1 endpoint. **OBO** means the backend acquires a downstream token using the user's delegated identity. **Managed Identity (MI)** means the backend uses its system-assigned identity for downstream calls; user identity from the Bearer token is used for audit only.

#### OBO Routes (Delegated User Context)

| Route | Method | Auth Pattern | Rationale |
|---|---|---|---|
| `/api/proxy/{*path}` | GET | OBO | Acquires Graph token via `msalObo.acquireTokenOnBehalfOf(userToken)` for downstream Graph API calls on behalf of the user. Currently STUB (returns mock response). |
| `/api/proxy/{*path}` | POST/PATCH/PUT/DELETE | OBO | Same OBO flow for mutating Graph operations. |

#### Managed Identity Routes (App-Level Access)

| Route Group | Routes | Auth Pattern | Rationale |
|---|---|---|---|
| **Provisioning Saga** (6 routes) | `provision-project-site`, `provisioning-status/{id}`, `provisioning-failures`, `admin/trigger-timer`, `provisioning-retry/{id}`, `provisioning-escalate/{id}` | MI | Async saga steps use `DefaultAzureCredential` for SharePoint/Graph calls. User identity from Bearer for audit (`triggeredBy`) only. |
| **Project Setup Requests** (3 routes) | `project-setup-requests` (POST/GET), `project-setup-requests/{id}/state` (PATCH) | MI | Table Storage persistence only. User claims captured as `submittedBy` for audit. |
| **Notifications** (6 HTTP + 4 background) | `notifications/center`, `notifications/{id}/read`, `notifications/{id}/dismiss`, `notifications/mark-all-read`, `notifications/preferences` (GET/PATCH), `notifications/send` | MI | Internal store operations only. Queue/timer-triggered jobs use MI for email dispatch. |
| **Acknowledgments** (2 routes) | `acknowledgments` (POST/GET) | MI | Table Storage events. No downstream SharePoint/Graph calls. |
| **SignalR** (1 route) | `provisioning-negotiate` | MI | SignalR binding only. Validates user token for group assignment; no downstream calls. |
| **Planned Domain CRUD** (Phase 1 target) | `leads/*`, `projects/*`, `estimating/*`, `projects/{id}/schedules/*`, `projects/{id}/buyouts/*`, `projects/{id}/compliance/*`, `projects/{id}/contracts/*`, `projects/{id}/risks/*`, `projects/{id}/scorecards/*`, `projects/{id}/pmp/*` | MI | Backend accesses SharePoint lists via Managed Identity. User identity for audit/authorization only, not for downstream data access. |

#### C2 Middleware Independence

All C2 middleware work can proceed immediately regardless of OBO/MI classification:

| C2 Deliverable | OBO Dependency | Status |
|---|---|---|
| `withAuth()` Bearer validation wrapper | None — all routes validate Bearer tokens | Proceed |
| Zod request validation schemas | None — validation is independent of auth pattern | Proceed |
| Standardized response helpers | None — response shape is independent | Proceed |
| `X-Request-Id` propagation | None — request tracking is independent | Proceed |

#### Remaining Architecture Note

No planned Phase 1 domain route requires OBO. If a future route needs to call Graph on behalf of the user (e.g., checking user-specific SharePoint site permissions), only that specific route needs OBO treatment — the entire domain API surface does not need to change. This is a contained extension, not a design revision.

---

## Target Architecture (To Be Created by C2)

These files and patterns do not exist yet. C2 implementation creates them.

- **Auth Pattern:** Express-style middleware adapted for Azure Functions v4; create `middleware/auth.ts` with `withAuth()` wrapper on top of existing `validateToken()`
- **Validation:** Zod schemas for request body, query params, and path params; create `middleware/validate.ts` with `parseBody<T>()` and `parseQuery<T>()` helpers
- **Error Responses:** Standardized shape with `message`, `code`, `requestId` (per D3 lock: `message` not `error`); create `utils/response-helpers.ts`
- **Request Tracking:** X-Request-Id propagation via middleware; create `middleware/request-id.ts`

## Tech Stack

- Azure Functions v4 (TypeScript)
- Zod (schema validation)
- Vitest (test runner)

---

## Chunk 1: Auth Middleware

Centralize bearer token extraction and auth enforcement. All routes will use `withAuth()` wrapper for consistent 401 responses.

### Task 1: Create `extractAndValidateBearer` middleware

**Files:**
- Create: `backend/functions/src/middleware/auth.ts`
- Create: `backend/functions/src/middleware/auth.test.ts`

**Interface:**
```typescript
export interface AuthContext {
  userToken: string;
  userId?: string; // extracted from token claims if possible
}

export type AuthResult =
  | { ok: true; auth: AuthContext }
  | { ok: false; response: HttpResponseInit }

export function extractBearer(request: HttpRequest): AuthResult
```

**Logic:**
- Check `Authorization` header
- Validate format: `Bearer <token>`
- Return 401 if missing, malformed, or token is empty
- Return `{ ok: true, auth: { userToken: token } }` if valid

**Tests (write failing first):**
- missing Authorization header → `{ ok: false, response: { status: 401 } }`
- Authorization header with "Basic" prefix → 401
- Authorization header with "Bearer " (empty token) → 401
- valid "Bearer abc123def456" → `{ ok: true, auth: { userToken: 'abc123def456' } }`

---

### Task 2: Create `withAuth` route wrapper

**Files:**
- Modify: `backend/functions/src/middleware/auth.ts`

**Interface:**
```typescript
export function withAuth(
  handler: (request: HttpRequest, context: InvocationContext, auth: AuthContext) => Promise<HttpResponseInit>
): (request: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit>
```

**Logic:**
- Call `extractBearer(request)`
- If not ok, return the error response immediately
- If ok, call handler with `(request, context, auth)`
- Return handler result

**Tests:**
- unauthenticated request to wrapped handler → 401 before handler executes
- authenticated request → handler receives AuthContext with userToken
- handler throws error → error bubbles (handled by caller)

---

### Task 3: Apply `withAuth` to project-requests routes

**Files:**
- Modify: `backend/functions/src/functions/projectRequests/index.ts` (or route registration location)

**Before:**
```typescript
handler: async (request, context) => {
  // route logic
}
```

**After:**
```typescript
handler: withAuth(async (request, context, auth) => {
  // route logic uses auth.userToken
})
```

**Tests:**
- unauthenticated request to `GET /api/project-requests` → 401
- authenticated request to `GET /api/project-requests` → calls handler

---

## Chunk 2: Zod Validation

Add request body and query parameter validation schemas. Centralize parse helpers.

### Task 4: Create request validation helper

**Files:**
- Create: `backend/functions/src/middleware/validate.ts`
- Create: `backend/functions/src/middleware/validate.test.ts`

**Interface:**
```typescript
import { z } from 'zod';

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: HttpResponseInit }

export async function parseBody<T>(
  request: HttpRequest,
  schema: z.ZodType<T>
): Promise<ValidationResult<T>>

export function parseQuery<T>(
  request: HttpRequest,
  schema: z.ZodType<T>
): ValidationResult<T>
```

**Logic:**
- `parseBody`: read request body as JSON, validate against schema, return 422 if fails
- `parseQuery`: extract query string, validate against schema, return 422 if fails
- On validation failure: return `{ ok: false, response: { status: 422, body: { error: 'Validation failed', details: zodError.issues } } }`
- On success: return `{ ok: true, data: parsed }`

**Tests:**
- valid body → `{ ok: true, data: parsed }`
- invalid body (missing required field) → 422 with field errors
- body not JSON → 422 with parse error
- valid query params → `{ ok: true, data: { ... } }`
- invalid query params → 422
- query param type coercion → number string coerced to number

---

### Task 5: Create Zod schemas for Phase 1 domain routes

**Domain Model Fidelity Rule:** All Zod schemas MUST be derived from the canonical `@hbc/models` interfaces (`ILead`, `IActiveProject`, `IEstimatingTracker`, `IEstimatingKickoff`) and their corresponding `FormData` types. Do not invent field names or enum values. See P1-E2 Domain Example Fidelity Rules for the authoritative field reference.

**Files:**
- Create: `backend/functions/src/validation/schemas/leads.ts`
- Create: `backend/functions/src/validation/schemas/projects.ts`
- Create: `backend/functions/src/validation/schemas/estimating.ts`
- Create: `backend/functions/src/validation/schemas/shared.ts`
- Create: `backend/functions/src/validation/schemas/index.ts` (barrel export)

**Shared Schemas** (`shared.ts`):
```typescript
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25), // D4 lock: default 25
  search: z.string().optional(),
});
```

**Leads Schemas** (`leads.ts`) — derived from `ILead` / `ILeadFormData`:
```typescript
// ILead: id (number), title, stage (LeadStage), clientName, estimatedValue, createdAt, updatedAt
// LeadStage: Identified, Qualifying, BidDecision, Bidding, Awarded, Lost, Declined
export const CreateLeadSchema = z.object({
  title: z.string().min(1).max(255),
  stage: z.enum(['Identified', 'Qualifying', 'BidDecision', 'Bidding', 'Awarded', 'Lost', 'Declined']),
  clientName: z.string().max(255),
  estimatedValue: z.number().nonnegative().optional(),
});

export const UpdateLeadSchema = CreateLeadSchema.partial();
```

**Projects Schemas** (`projects.ts`) — derived from `IActiveProject` / `IProjectFormData`:
```typescript
// IActiveProject: id (string UUID), name, number, status, startDate, endDate
export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  number: z.string().min(1),
  status: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const ListProjectsQuerySchema = PaginationQuerySchema;
```

**Estimating Schemas** (`estimating.ts`) — derived from `IEstimatingTracker` / `IEstimatingKickoff`:
```typescript
// Estimating is NOT flat CRUD — it has two sub-resources: trackers and kickoffs
// IEstimatingTracker: id (number), projectId (string), bidNumber, status, dueDate, createdAt, updatedAt
export const CreateTrackerSchema = z.object({
  projectId: z.string().uuid(),
  bidNumber: z.string().min(1),
  status: z.string().min(1),
  dueDate: z.string().datetime(),
});

export const UpdateTrackerSchema = CreateTrackerSchema.partial();

// IEstimatingKickoff: id (number), projectId (string), kickoffDate, attendees (string[]), notes, createdAt
export const CreateKickoffSchema = z.object({
  projectId: z.string().uuid(),
  kickoffDate: z.string().datetime(),
  attendees: z.array(z.string()).min(1),
  notes: z.string().optional(),
});
```

**Tests:** For each schema, write:
- valid payload → parses successfully
- missing required field → validation error
- invalid enum value → validation error
- string too long → validation error
- number out of range → validation error
- optional field omitted → parses successfully

---

## Chunk 3: Error Response Standardization

Centralize error and success response helpers. Standardize all responses to include request ID.

### Task 6: Standardize error response helper

**Files:**
- Create: `backend/functions/src/utils/response-helpers.ts`
- Create: `backend/functions/src/utils/response-helpers.test.ts`

**Interface:**
```typescript
export function errorResponse(
  status: number,
  code: string,
  message: string,
  requestId?: string
): HttpResponseInit

export function successResponse<T>(
  data: T,
  status?: number
): HttpResponseInit

export function listResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  requestId?: string
): HttpResponseInit

export function notFoundResponse(entityType: string, id: string): HttpResponseInit
export function unauthorizedResponse(): HttpResponseInit
export function forbiddenResponse(): HttpResponseInit
```

**Response Shape:**
```typescript
// Error response (per D3 lock: `message` is primary field, not `error`)
{
  status: 400,
  jsonBody: {
    message: string,
    code: string,
    requestId: string
  }
}

// Success response
{
  status: 200,
  jsonBody: { data: T }
}

// List response
{
  status: 200,
  jsonBody: {
    items: T[],
    pagination: { total, page, pageSize, totalPages }
  }
}
```

**Tests:**
- `errorResponse(400, 'INVALID_REQUEST', 'message')` → status 400 with error shape
- `successResponse({ id: 1 })` → status 200 with `{ data: {...} }`
- `listResponse([...], 42, 1, 20)` → status 200 with items and pagination
- `notFoundResponse('Lead', 'abc-123')` → 404 with message "Lead 'abc-123' not found"
- `unauthorizedResponse()` → 401 with code 'UNAUTHORIZED'
- `forbiddenResponse()` → 403 with code 'FORBIDDEN'

---

### Task 7: Apply standardized responses to existing routes (acknowledgments example)

**Files:**
- Modify: `backend/functions/src/functions/acknowledgments/` (one route minimum)

**Before:**
```typescript
export default async function (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const data = await acknowledgementsService.list();
    return {
      status: 200,
      jsonBody: data
    };
  } catch (error) {
    return {
      status: 500,
      jsonBody: { error: error.message }
    };
  }
}
```

**After:**
```typescript
import { listResponse, errorResponse } from '@/utils/response-helpers';

export default withAuth(async (request, context, auth): Promise<HttpResponseInit> => {
  const requestId = extractOrGenerateRequestId(request);
  try {
    const { items, total } = await acknowledgementsService.list();
    return listResponse(items, total, 1, 20, requestId);
  } catch (error) {
    context.error(`Acknowledgments list failed: ${error.message}`, { requestId });
    return errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Failed to fetch acknowledgments', requestId);
  }
});
```

**Tests:**
- successful route call → uses `listResponse` helper, returns 200 with pagination shape
- error case → uses `errorResponse`, returns 500 with error shape

---

### Task 8: Request ID propagation middleware

**Files:**
- Create: `backend/functions/src/middleware/request-id.ts`

**Interface:**
```typescript
export function extractOrGenerateRequestId(request: HttpRequest): string
// Returns X-Request-Id header value if present, otherwise crypto.randomUUID()
```

**Logic:**
- Check for `X-Request-Id` header
- If present and non-empty, use it
- If absent or empty, generate via `crypto.randomUUID()`
- Return the ID

**Integration:**
- Call in `withAuth` middleware so all authenticated routes receive request ID
- Add `X-Request-Id` to response headers

**Tests:**
- request with `X-Request-Id` header → extracted and returned
- request without header → UUID generated (and is valid UUID format)
- request with empty header → new UUID generated

---

## Implementation Order

1. Implement Chunk 1 (auth middleware) first; apply to one route to validate pattern
2. Implement Chunk 2 (validation); create schemas, integrate with one route
3. Implement Chunk 3 (response standardization); refactor all routes to use helpers
4. Run full test suite and lint on `backend/functions`

## Verification

After all chunks complete, run:
```bash
cd backend/functions
npm run test -- --run
npm run lint
npm run build
```

Verify:
- All tests pass
- No TypeScript errors
- No linting errors
- All routes have auth middleware applied
- All routes use standardized response helpers

## Risk Notes

- **OBO Token Integration:** `ManagedIdentityOboService` uses system-assigned Managed Identity (`DefaultAzureCredential`), not user-delegated OBO. The `acquireTokenOnBehalfOf(userToken)` signature accepts a `userToken` parameter but the production implementation ignores it (D-PH6-04 compatibility bridge). No C2 change required for OBO — it is independent of the `withAuth()` wrapper. See Auth Blocker #1 (CLOSED).
- **All Phase 1 routes require auth:** No public (unauthenticated) routes exist or are planned. Every HTTP endpoint must use the `withAuth()` wrapper.
- **Zod Dependency:** `zod` is NOT in `backend/functions/package.json` today. C2 must add it before implementing Task 4.

## Sign-off Gates

- [ ] All tests pass
- [ ] All routes apply `withAuth` wrapper
- [ ] All routes use `response-helpers` for responses
- [ ] No 401/422/500 responses bypass standardized shape
- [ ] Request ID propagates through all responses
