# P1-C2-b: Route Handler Auth and Response Upgrade

| Field | Value |
|---|---|
| **Doc ID** | P1-C2-b |
| **Phase** | Phase 1 |
| **Workstream** | C — Backend Service Contracts and Hardening |
| **Document Type** | Implementation Plan |
| **Owner** | C-workstream lead |
| **Status** | Implementation-Ready |
| **Date** | 2026-03-19 |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **Audience** | Developers completing P1-C2 sign-off gates |
| **References** | P1-C2 (Auth and Validation Hardening), P1-C1-a (Backend Domain Route Handlers), P1-E1 (Contract Test Suite) |

---

## Purpose

Apply the P1-C2 middleware and response helpers to all remaining route handlers. P1-C2 Chunks 1–3 delivered `withAuth()`, `response-helpers`, and `extractOrGenerateRequestId()` and applied them to `projectRequests` and `acknowledgments` as proving grounds. This plan covers the 13 remaining handler directories needed to close the P1-C2 sign-off gates.

**Deliverables:**
- All 10 C1-a domain handler directories upgraded (leads, projects, estimating, schedule, buyout, compliance, contracts, risk, scorecards, pmp)
- 3 pre-existing handler directories upgraded (provisioningSaga, signalR, notifications HTTP handlers)
- P1-C2 sign-off gates satisfied
- `pnpm --filter @hbc/functions check-types` passes with zero errors

**Not in scope:**
- Changes to service layer or storage logic
- Queue-triggered or timer-triggered notification handlers (`ProcessNotification`, `SendNotificationEmail`, `SendDigestEmail`, timer in `index.ts`) — these do not process Bearer tokens
- Zod schema application to upgraded handlers — that is a follow-on C2 hardening step; handlers keep manual field validation for now

---

## Current State (verified 2026-03-19)

| Directory | Trigger | `withAuth` | `response-helpers` | `extractOrGenerateRequestId` | Notes |
|---|---|---|---|---|---|
| `leads` | HTTP | ✓ | ✓ | ✓ | **UPGRADED** (2026-03-19) — 5 handlers migrated |
| `projects` | HTTP | ✓ | ✓ | ✓ | **UPGRADED** (2026-03-19) — 6 handlers migrated; `randomUUID` removed (not needed for entity IDs) |
| `estimating` | HTTP | ✓ | ✓ | ✓ | **UPGRADED** (2026-03-19) — 7 handlers migrated (5 trackers + 2 kickoffs) |
| `schedule` | HTTP | ✓ | ✓ | ✓ | **UPGRADED** (2026-03-19) — 6 handlers migrated |
| `buyout` | HTTP | ✓ | ✓ | ✓ | **UPGRADED** (2026-03-19) — 6 handlers migrated |
| `compliance` | HTTP | ✓ | ✓ | ✓ | **UPGRADED** (2026-03-19) — 6 handlers migrated |
| `contracts` | HTTP | ✓ | ✓ | ✓ | **UPGRADED** (2026-03-19) — 7 handlers migrated (5 CRUD + 2 approvals) |
| `risk` | HTTP | ✓ | ✓ | ✓ | **UPGRADED** (2026-03-19) — 6 handlers migrated (5 CRUD + management) |
| `scorecards` | HTTP | ✓ | ✓ | ✓ | **UPGRADED** (2026-03-19) — 6 handlers migrated (5 CRUD + versions) |
| `pmp` | HTTP | ✓ | ✓ | ✓ | **UPGRADED** (2026-03-19) — 7 handlers migrated (5 CRUD + 2 signatures) |
| `provisioningSaga` | HTTP | ✗ | ✗ | ✗ | 6 handlers; inline `validateToken`; `{ error: string }` error shape; 202 Accepted response |
| `signalR` | HTTP | ✓ | ✓ | ✓ | **UPGRADED** (2026-03-19) — 1 handler migrated; raw negotiate response preserved per SignalR SDK |
| `notifications` (HTTP only) | HTTP | ✗ | ✗ | ✗ | 7 HTTP handlers in individual files; barrel `index.ts` does not need changes |

---

## Upgrade Pattern

Every handler upgrade follows the same mechanical steps. Apply this pattern to each handler unless a special case is noted below.

### Import changes

```typescript
// Remove:
import { validateToken, unauthorizedResponse, type IValidatedClaims } from '../../middleware/validateToken.js';

// Add:
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import {
  errorResponse,
  successResponse,
  listResponse,
  notFoundResponse,
} from '../../utils/response-helpers.js';
```

Import only the helpers actually used by the file. `notFoundResponse` is optional if the file uses `errorResponse(404, ...)` directly.

Remove `import { randomUUID } from 'node:crypto'` (or `'crypto'`) only if it is no longer used after removing the inline `requestId: randomUUID()` call from 500 error responses. Retain it in files that use `randomUUID()` for entity ID generation (e.g. `projects/index.ts` generates project UUIDs).

### Handler wrapper

```typescript
// Before:
handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  let claims: IValidatedClaims;
  try {
    claims = await validateToken(request);
  } catch {
    return unauthorizedResponse('Invalid token');
  }
  // ... handler logic using claims.upn
}

// After:
handler: withAuth(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
  const requestId = extractOrGenerateRequestId(request);
  // ... handler logic using auth.claims.upn
})
```

Handlers that do not use `context` or `auth` may omit those parameters from the inner function signature — TypeScript permits this.

### Response replacements

| Before | After |
|---|---|
| `{ status: 200, jsonBody: { items, total, page, pageSize } }` | `listResponse(items, total, page, pageSize, requestId)` |
| `{ status: 200, jsonBody: { data: x } }` | `successResponse(x)` |
| `{ status: 201, jsonBody: { data: x } }` | `successResponse(x, 201)` |
| `{ status: 204 }` | `{ status: 204 }` — no change; DELETE returns empty body |
| `{ status: 404, jsonBody: { message: 'X not found', code: 'NOT_FOUND' } }` | `notFoundResponse('X', id, requestId)` |
| `{ status: 400, jsonBody: { message: ..., code: 'VALIDATION_ERROR' } }` | `errorResponse(400, 'VALIDATION_ERROR', ..., requestId)` |
| `{ status: 500, jsonBody: { message: ..., code: 'INTERNAL_ERROR', requestId: randomUUID() } }` | `errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId)` |
| `{ status: 400, jsonBody: { error: '...' } }` (pre-C2 shape) | `errorResponse(400, 'VALIDATION_ERROR', '...', requestId)` |
| `{ status: 500, jsonBody: { error: '...' } }` (pre-C2 shape) | `errorResponse(500, 'INTERNAL_ERROR', '...', requestId)` |

---

## Critical: Collection Response Shape Change

`listResponse()` produces a nested envelope:

```typescript
// listResponse output:
{ items: T[], pagination: { total, page, pageSize, totalPages } }

// C1-a handlers currently produce:
{ items: T[], total, page, pageSize }
```

This is a breaking shape change for every paginated endpoint. It is intentional — the C2 plan defines `pagination` as the canonical nested shape. Since no frontend consumers or P1-E1 contract tests exist yet for these routes, the change carries no breakage risk now. P1-E1 must codify the `pagination` shape when writing contract tests.

---

## Special Cases

### `provisioningSaga` — 202 Accepted and `{ error }` pre-C2 shape

`provisionProjectSite` returns `202` with `{ message, projectId, correlationId }`. This is a fire-and-forget acknowledgment, not a domain entity — do not wrap in `successResponse`. Return the raw `{ status: 202, jsonBody: { message, projectId, correlationId } }` as-is. All other error responses (`400`, `500`) use `errorResponse()`.

`IValidatedClaims` type import can be removed once `withAuth` is applied — claims are accessed via `auth.claims`.

### `signalR` — raw negotiate response

The `signalrNegotiate` 200 response returns raw `{ ...connectionInfo, userId, groups }`. The SignalR client SDK expects this specific shape from the negotiate endpoint — do **not** wrap in `successResponse`. Only the error path (`400` for missing `projectId`) uses `errorResponse()`. Auth migrates to `withAuth`; claims accessed via `auth.claims.upn` and `auth.claims.roles`.

### `notifications` — individual HTTP files

The `notifications/index.ts` barrel does not need changes. Each of the 7 HTTP handler files (`Dismiss.ts`, `GetCenter.ts`, `GetPreferences.ts`, `MarkAllRead.ts`, `MarkRead.ts`, `SendNotification.ts`, `UpdatePreferences.ts`) follows the standard upgrade pattern. Queue and timer handlers (`ProcessNotification.ts`, `SendNotificationEmail.ts`, `SendDigestEmail.ts`, `index.ts`) do not handle Bearer tokens and are not upgraded.

---

## Tasks

### Task 1: Upgrade `functions/leads/index.ts`

Apply standard upgrade pattern to all 5 handlers (`getLeads`, `getLeadById`, `createLead`, `updateLead`, `deleteLead`).

- `getLeads`: replace flat collection response with `listResponse`
- `getLeadById`: replace 404 with `notFoundResponse('Lead', String(id), requestId)`
- `createLead`: replace 201 with `successResponse(lead, 201)`
- `updateLead`: replace 200 with `successResponse(updated)`; 404 with `notFoundResponse`
- `deleteLead`: `{ status: 204 }` — no change
- `randomUUID` import: remove if only used for requestId in 500 errors

---

### Task 2: Upgrade `functions/projects/index.ts`

Apply standard upgrade pattern to all 6 handlers (`getProjects`, `getPortfolioSummary`, `getProjectById`, `createProject`, `updateProject`, `deleteProject`).

- `getProjects`: replace flat collection response with `listResponse`
- `getPortfolioSummary`: replace with `successResponse(summary)`
- `getProjectById`: `notFoundResponse('Project', id, requestId)`
- `createProject`: `successResponse(project, 201)`
- `updateProject`: `successResponse(updated)`; `notFoundResponse`
- `deleteProject`: `{ status: 204 }` — no change
- `randomUUID` import: **retain** — used for project ID generation via `randomUUID()` in `createProject`

---

### Task 3: Upgrade `functions/estimating/index.ts`

Apply standard upgrade pattern to all 7 handlers across 2 sub-resources.

**Trackers (5 handlers):** `getTrackers`, `getTrackerById`, `createTracker`, `updateTracker`, `deleteTracker` — follow standard collection/single-item/create/update/delete pattern.

**Kickoffs (2 handlers):** `getKickoff`, `createKickoff` — single-item returns; `getKickoff` returns `notFoundResponse('EstimatingKickoff', projectId, requestId)` when not found.

---

### Task 4: Upgrade `functions/schedule/index.ts`

Apply standard upgrade pattern to all 6 handlers (`getScheduleActivities`, `getScheduleActivityById`, `createScheduleActivity`, `updateScheduleActivity`, `deleteScheduleActivity`, `getScheduleMetrics`).

- `getScheduleActivities`: `listResponse`
- `getScheduleMetrics`: `successResponse(metrics)`
- Others: standard single-item/create/update/delete pattern

---

### Task 5: Upgrade `functions/buyout/index.ts`

Apply standard upgrade pattern to all 6 handlers (`getBuyoutEntries`, `getBuyoutEntryById`, `createBuyoutEntry`, `updateBuyoutEntry`, `deleteBuyoutEntry`, `getBuyoutSummary`).

Same pattern as schedule. `getBuyoutSummary` → `successResponse(summary)`.

---

### Task 6: Upgrade `functions/compliance/index.ts`

Apply standard upgrade pattern to all 6 handlers (`getComplianceEntries`, `getComplianceEntryById`, `createComplianceEntry`, `updateComplianceEntry`, `deleteComplianceEntry`, `getComplianceSummary`).

Same pattern as buyout.

---

### Task 7: Upgrade `functions/contracts/index.ts`

Apply standard upgrade pattern to all 7 handlers (5 contract CRUD + 2 approval sub-resource).

- Contract CRUD: standard pattern
- `getContractApprovals`: returns `successResponse(approvals)` where `approvals` is an array — this is a full list with no pagination, so `successResponse({ data: approvals[] })` is correct; do not use `listResponse`
- `createContractApproval`: `successResponse(approval, 201)`

---

### Task 8: Upgrade `functions/risk/index.ts`

Apply standard upgrade pattern to all 6 handlers (`getRiskItems`, `getRiskItemById`, `createRiskItem`, `updateRiskItem`, `deleteRiskItem`, `getRiskManagement`).

- `getRiskManagement`: `successResponse(management)` where management includes `items[]` — not a paginated collection, so `successResponse` is correct.

---

### Task 9: Upgrade `functions/scorecards/index.ts`

Apply standard upgrade pattern to all 6 handlers (5 scorecard CRUD + `getScorecardVersions`).

- `getScorecardVersions`: `successResponse(versions)` where versions is an array — unpaginated sub-resource list, `successResponse` is correct.

---

### Task 10: Upgrade `functions/pmp/index.ts`

Apply standard upgrade pattern to all 7 handlers (5 plan CRUD + `getPmpSignatures` + `createPmpSignature`).

- `getPmpSignatures`: `successResponse(signatures)` — unpaginated sub-resource list
- `createPmpSignature`: `successResponse(signature, 201)`

---

### Task 11: Upgrade `functions/provisioningSaga/index.ts`

Apply `withAuth` and `errorResponse` to all 6 HTTP handlers (`provisionProjectSite`, `getProvisioningStatus`, `getProvisioningFailures`, `adminTriggerTimer`, `retryProvisioning`, `escalateProvisioning`).

**Special handling:**
- `provisionProjectSite` returns `{ status: 202, jsonBody: { message, projectId, correlationId } }` — keep raw; do not wrap in `successResponse`
- Remove `IValidatedClaims` type import; access claims via `auth.claims`
- All `{ error: string }` error bodies → `errorResponse(status, code, message, requestId)`
- For 400 validation errors: code `'VALIDATION_ERROR'`
- For 500 internal errors: code `'INTERNAL_ERROR'`
- For 404 not-found: `notFoundResponse(entityType, id, requestId)`

---

### Task 12: Upgrade `functions/signalR/index.ts`

Apply `withAuth` to `signalrNegotiate`.

**Special handling:**
- Remove `import { validateToken, unauthorizedResponse }` from `validateToken.js`
- Wrap handler with `withAuth`; access `auth.claims.upn` and `auth.claims.roles`
- `400` for missing `projectId` → `errorResponse(400, 'VALIDATION_ERROR', 'projectId query parameter is required', requestId)`
- `200` response remains raw `{ status: 200, jsonBody: { ...connectionInfo, userId, groups } }` — the SignalR client SDK requires this exact negotiate shape; do not wrap in `successResponse`

---

### Task 13: Upgrade `functions/notifications/` HTTP files (7 files)

Apply standard upgrade pattern to each of the 7 HTTP handler files individually:

- `Dismiss.ts`
- `GetCenter.ts`
- `GetPreferences.ts`
- `MarkAllRead.ts`
- `MarkRead.ts`
- `SendNotification.ts`
- `UpdatePreferences.ts`

`index.ts` (barrel), `ProcessNotification.ts` (queue), `SendNotificationEmail.ts` (queue), and `SendDigestEmail.ts` (timer) are not modified.

---

### Task 14: Typecheck and verify

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions build
```

**Expected:** Zero TypeScript errors on both commands.

**What to verify:**
- No `validateToken` or `unauthorizedResponse` imports remain in upgraded files (grep check)
- No `{ error: string }` response bodies remain in upgraded files (pre-C2 shape)
- No `{ items, total, page, pageSize }` flat collection responses remain (replaced by `listResponse`)
- `randomUUID` retained only in files that use it for entity ID generation

**Grep verification commands:**
```bash
# Should return only validateToken.ts itself and auth.ts (which imports it):
grep -rl "from.*validateToken" backend/functions/src/functions/

# Should return zero results across function handlers:
grep -rl "jsonBody: { error:" backend/functions/src/functions/
```

---

## P1-C2 Sign-off Gates (post-completion)

- [ ] All tests pass
- [ ] All routes apply `withAuth` wrapper
- [ ] All routes use `response-helpers` for responses
- [ ] No 401/422/500 responses bypass standardized shape
- [ ] Request ID propagates through all responses

---

## Dependency Note

Complete this plan before P1-E1 begins writing contract tests. P1-E1 will codify the `{ items, pagination: { total, page, pageSize, totalPages } }` collection shape. Upgrading after E1 tests are written would require updating those tests.
