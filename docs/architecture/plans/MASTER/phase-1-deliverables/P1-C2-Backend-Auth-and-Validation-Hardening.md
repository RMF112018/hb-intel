# P1-C2: Backend Auth and Validation Hardening

**Document ID:** P1-C2
**Phase:** 1
**Status:** Draft
**Date:** 2026-03-16
**Owner:** Architecture

## Goal

Add centralized authentication middleware and Zod request validation to all Azure Functions routes, standardizing authentication enforcement, request/response shapes, and error handling across the Phase 1 domain APIs (leads, projects, estimating, acknowledgments, notifications).

## Architecture

- **Auth Pattern:** Express-style middleware adapted for Azure Functions v4; all auth checks in `middleware/auth.ts`
- **Validation:** Zod schemas for request body, query params, and path params; `middleware/validate.ts` parse helpers
- **Error Responses:** Standardized shape with `error`, `code`, `requestId`; helpers in `utils/response-helpers.ts`
- **Request Tracking:** X-Request-Id propagation via middleware

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

**Files:**
- Create: `backend/functions/src/validation/schemas/leads.ts`
- Create: `backend/functions/src/validation/schemas/projects.ts`
- Create: `backend/functions/src/validation/schemas/estimating.ts`
- Create: `backend/functions/src/validation/schemas/shared.ts`
- Create: `backend/functions/src/validation/schemas/index.ts` (barrel export)

**Shared Schemas** (`shared.ts`):
```typescript
export const UUIDSchema = z.string().uuid();
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
export const ProjectIdQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
});
```

**Leads Schemas** (`leads.ts`):
```typescript
export const CreateLeadSchema = z.object({
  name: z.string().min(1).max(255),
  status: z.enum(['prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost']),
  estimatedValue: z.number().nonnegative().optional(),
  companyName: z.string().max(255).optional(),
  contactEmail: z.string().email().optional(),
});

export const UpdateLeadSchema = CreateLeadSchema.partial();

export const ListLeadsQuerySchema = PaginationQuerySchema.merge(ProjectIdQuerySchema);
```

**Projects Schemas** (`projects.ts`):
```typescript
export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  budget: z.number().nonnegative().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const ListProjectsQuerySchema = PaginationQuerySchema;
```

**Estimating Schemas** (`estimating.ts`):
```typescript
export const CreateEstimateSchema = z.object({
  projectId: z.string().uuid(),
  description: z.string().min(1),
  estimatedHours: z.number().positive(),
  hourlyRate: z.number().nonnegative().optional(),
  confidence: z.enum(['low', 'medium', 'high']).optional(),
});

export const UpdateEstimateSchema = CreateEstimateSchema.partial();

export const ListEstimatesQuerySchema = PaginationQuerySchema.merge(
  z.object({ projectId: z.string().uuid().optional() })
);
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
// Error response
{
  status: 400,
  jsonBody: {
    error: string,
    code: string,
    message: string,
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

- **OBO Token Integration:** If `msal-obo-service` needs auth context (user ID), Task 1 may need to extract claims from bearer token. Mark for follow-up if the existing OBO service requires userId.
- **Backwards Compatibility:** Public routes (if any) cannot use `withAuth` wrapper. Coordinate with API contract owner for which routes are public vs protected.
- **Zod Dependency:** Confirm Zod is in `backend/functions/package.json`; if not, add it.

## Sign-off Gates

- [ ] All tests pass
- [ ] All routes apply `withAuth` wrapper
- [ ] All routes use `response-helpers` for responses
- [ ] No 401/422/500 responses bypass standardized shape
- [ ] Request ID propagates through all responses
