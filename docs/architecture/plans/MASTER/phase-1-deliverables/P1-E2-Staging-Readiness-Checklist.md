# P1-E2: Staging Readiness Checklist

| Field | Value |
|---|---|
| **Doc ID** | P1-E2 |
| **Phase** | Phase 1 |
| **Workstream** | E — Contract Testing and Staging Readiness |
| **Document Type** | Acceptance Checklist |
| **Owner** | QA / Platform Engineering |
| **Status** | Draft — most sections BLOCKED on upstream deliverables |
| **Date** | 2026-03-16 |
| **Last Reviewed Against Repo Truth** | 2026-03-18 |
| **References** | P1-E1 (Contract Test Suite), P1-B1 (Proxy Adapter), P1-C1 (Backend Catalog), P1-C2 (Auth Hardening), P1-C3 (Observability), P1-D1 (Write Safety) |

---

## Checklist Usage Rule

This document is **not** a claim that all listed routes, features, or infrastructure exist today. It is a staging validation gate document whose sections become active **only** when their upstream dependencies are satisfied.

**Rules:**
- Do not execute a section marked **BLOCKED** — the prerequisites do not exist yet.
- A section becomes **READY TO VERIFY** only when all items in its "Depends on" row of the Dependency Matrix are delivered and deployed to staging.
- **PREP-ONLY** sections can be reviewed for correctness but cannot produce pass/fail results without staging infrastructure.
- Sections marked with PROVISIONAL items should note which items may change when upstream decisions (D3–D6) resolve.

### Domain Example Fidelity Rules

All example payloads, ID types, field names, and response assertions in this checklist must mirror the current `@hbc/models` interfaces and `@hbc/data-access` port signatures unless explicitly marked PROVISIONAL.

| Domain | Canonical Interface | ID Type | Writable Fields (`FormData`) | Port Interface |
|---|---|---|---|---|
| **Lead** | `ILead` | `number` | `title`, `stage` (LeadStage enum), `clientName`, `estimatedValue` | `ILeadRepository` |
| **Project** | `IActiveProject` | `string` (UUID) | `name`, `number`, `status`, `startDate`, `endDate` | `IProjectRepository` |
| **Estimating Tracker** | `IEstimatingTracker` | `number` | `projectId`, `bidNumber`, `status`, `dueDate` | `IEstimatingRepository` |
| **Estimating Kickoff** | `IEstimatingKickoff` | `number` | `projectId`, `kickoffDate`, `attendees`, `notes` | `IEstimatingRepository` |

**LeadStage valid values:** `Identified`, `Qualifying`, `BidDecision`, `Bidding`, `Awarded`, `Lost`, `Declined`

**Rules:**
- Do not use UUID examples for lead or estimating tracker IDs — they are numeric.
- Do not use field names that differ from the canonical interface (e.g., `name` for leads — the correct field is `title`).
- Do not treat estimating as a flat `/api/estimates` CRUD resource — it is split into tracker CRUD and kickoff operations.
- If a route path is not yet frozen by C1, mark it PROVISIONAL.

---

## Repo Truth Snapshot (2026-03-18)

### Currently Evidenced in Repo

| Area | Evidence | Source |
|---|---|---|
| Registered Azure Function routes | Provisioning saga, proxy (GET + mutate), timer (full spec), SignalR negotiate, project setup requests, acknowledgments, notifications | `backend/functions/src/index.ts` |
| Auth middleware | `validateToken()` verifies Entra ID Bearer tokens via JWKS; returns `IValidatedClaims { upn, oid, roles, displayName }` | `backend/functions/src/middleware/validateToken.ts` |
| Auth error shape | `{ error: 'Unauthorized', reason: string }` — does NOT include `code` field or `requestId` | `unauthorizedResponse()` in `validateToken.ts` |
| Startup config validation | `validateRequiredConfig()` exported but **NOT wired into startup** — explicitly deferred to G2.6 | `backend/functions/src/utils/validate-config.ts` |
| Health endpoint | **None registered** — no `/api/health` function found in `index.ts` imports | `backend/functions/src/index.ts` |
| Backend test infrastructure | Vitest with `unit` and `smoke` named projects; coverage targets provisioning only | `backend/functions/vitest.config.ts` |
| Domain route handlers (leads, projects, estimating) | **None exist** — `backend/functions/src/functions/` contains only provisioning, proxy, notification, acknowledgment, signalr, and timer functions | `backend/functions/src/functions/` |
| `@hbc/data-access` proxy adapters | **Stubs only** — `ProxyHttpClient` does not exist; proxy mode throws `AdapterNotImplementedError` | P1-E1 Repo Truth Snapshot |

### Planned but Blocked

| Item | Blocked On | Expected From |
|---|---|---|
| Domain route handlers (leads, projects, estimating) | C1 | P1-C1 Backend Service Contract Catalog |
| Error envelope standardization (`{ error, code, requestId?, details? }`) | C1 | P1-C1 error middleware |
| Auth middleware hardening (standardized error shapes, OBO for downstream APIs) | C2 | P1-C2 Auth Hardening |
| Proxy adapter implementations | B1 | P1-B1 Proxy Adapter Engineering Plan |
| Retry logic, idempotency guards, write safety | D1 | P1-D1 Write Safety |
| Telemetry instrumentation (Application Insights events) | C3 | P1-C3 Observability |
| Health check endpoint | C1 or Platform | Not yet assigned |

### Staging-Only (Not Verifiable from Repo)

| Item | What Must Exist |
|---|---|
| Staging Azure Functions deployment | Deployed instance at `SMOKE_TEST_BASE_URL` |
| Redis cache connectivity | Redis instance reachable from staging functions |
| Azure Table Storage connectivity | Table Storage reachable from staging functions |
| MSAL OBO app registration | Entra ID app registration with API scope grants |
| Application Insights workspace | AI workspace receiving telemetry from staging functions |

---

## Dependency Matrix

Each major section maps to the upstream workstreams that must deliver before the section can be executed.

| Section | B1 | C1 | C2 | C3 | D1 | Platform / Staging | Status |
|---|---|---|---|---|---|---|---|
| 1: Adapter Mode & Startup | — | — | — | — | — | Staging deploy | **PREP-ONLY** |
| 2: Auth — Bearer Validation | — | — | **Required** | — | — | Staging deploy | **BLOCKED on C2** |
| 3: Domain Reads — Leads | — | **Required** | **Required** | — | — | Staging deploy | **BLOCKED on C1 + C2** |
| 4: Domain Reads — Projects | — | **Required** | **Required** | — | — | Staging deploy | **BLOCKED on C1 + C2** |
| 5: Domain Reads — Estimating | — | **Required** | **Required** | — | — | Staging deploy | **BLOCKED on C1 + C2** |
| 6: Domain Writes — Leads | — | **Required** | **Required** | — | — | Staging deploy | **BLOCKED on C1 + C2** |
| 7: Domain Writes — Projects | — | **Required** | **Required** | — | — | Staging deploy | **BLOCKED on C1 + C2** |
| 8: Domain Writes — Estimating | — | **Required** | **Required** | — | — | Staging deploy | **BLOCKED on C1 + C2** |
| 9: Retry & Idempotency | **Required** | **Required** | **Required** | — | **Required** | Staging deploy | **BLOCKED on B1 + C1 + C2 + D1** |
| 10: Error Recovery | — | **Required** | **Required** | — | — | Staging deploy | **BLOCKED on C1 + C2** |
| 11: Observability | — | **Required** | **Required** | **Required** | — | Staging deploy + AI workspace | **BLOCKED on C1 + C2 + C3** |
| 12: Acceptance Gates | All | All | All | All | All | All | **BLOCKED on all upstream** |

---

## Section 1: Adapter Mode & Startup — PREP-ONLY

Confirm proxy adapter is configured and startup logic runs cleanly. This section can be partially reviewed against configuration, but full verification requires a staging deployment.

**Depends on:** Platform (staging deployment)

- [ ] `HBC_ADAPTER_MODE=proxy` configured in staging environment
- [ ] Application startup log contains `HBC_ADAPTER_MODE=proxy`
- [ ] No warning or error logs for adapter mode mismatch
- [ ] `validateRequiredConfig()` is wired into startup and completes without error (**NOTE:** currently exported but NOT called at startup — G2.6 must wire it)
- [ ] Startup duration measured and recorded as baseline (**NOTE:** no hard-coded threshold — measure actual cold-start time and document as the Phase 1 baseline for future comparison)

**Health check:**
- [ ] Health endpoint registered and responds — `GET /api/health` returns 200 (**NOTE:** no health function is currently registered in `backend/functions/src/index.ts` — C1 or Platform must add it)

---

## Section 2: Auth — Bearer Validation — BLOCKED on C2

Confirm auth middleware rejects unauthenticated requests and accepts valid tokens with standardized error shapes.

**Depends on:** C2 (auth hardening), Platform (staging deployment)

**Current repo state:** `validateToken()` verifies Entra ID Bearer tokens and returns `IValidatedClaims`. The current `unauthorizedResponse()` returns `{ error: 'Unauthorized', reason }` — it does NOT return the `{ error, code }` shape expected by P1-E1 contract schemas. C2 must standardize the error response shape.

**Important distinction:** Bearer token validation (verifying the caller's JWT) is different from OBO (On-Behalf-Of) flow, which is needed only when the Azure Functions API calls a downstream API (e.g., Microsoft Graph) on the user's behalf. Not every endpoint requires OBO. This section validates bearer validation only; OBO readiness is a separate C2 deliverable.

### Missing Token
- [ ] `GET /api/leads` (no Authorization header) → 401 response
- [ ] Response body conforms to ErrorEnvelopeSchema: `{ error: '...', code: 'UNAUTHORIZED' }` (PROVISIONAL — current shape is `{ error: 'Unauthorized', reason }` until C2 standardizes)
- [ ] Response includes distributed trace correlation (via W3C `traceparent` header or Application Insights request ID — see Section 11)

### Expired Token
- [ ] Use a JWT token with `exp` claim in the past
- [ ] `GET /api/leads` with expired token → 401 response
- [ ] Response body conforms to ErrorEnvelopeSchema

### Valid Token
- [ ] Use a valid bearer token scoped to the API audience (`api://<CLIENT_ID>`)
- [ ] `GET /api/leads` with valid token → 200 response (requires C1 leads route to exist)
- [ ] Token acquired via `az account get-access-token --resource api://<CLIENT_ID>` — NOT an ARM-scoped token

---

## Section 3: Domain Reads — Leads — BLOCKED on C1 + C2

Confirm `GET` endpoints return paginated responses and 404 for missing records.

**Depends on:** C1 (leads route handlers), C2 (auth middleware), Platform (staging deployment)

**NOTE:** No leads route handlers exist in the repo today. `backend/functions/src/functions/` contains only provisioning, proxy, notification, acknowledgment, signalr, and timer functions. C1 must deliver `leads.handler.ts` before this section is executable.

**Domain model reference:** Leads use **numeric IDs** (not UUIDs). Writable fields per `ILeadFormData`: `title`, `stage` (LeadStage enum), `clientName`, `estimatedValue`. Response fields per `ILead`: `id` (number), `title`, `stage`, `clientName`, `estimatedValue`, `createdAt`, `updatedAt`. Valid `LeadStage` values: `Identified`, `Qualifying`, `BidDecision`, `Bidding`, `Awarded`, `Lost`, `Declined`.

- [ ] `GET /api/leads` with valid token → 200 with `{ items: [...], total, page, pageSize }` (collection response per P1-E1 envelope convention)
- [ ] `GET /api/leads?page=1&pageSize=5` respects pagination (returns max 5 items)
- [ ] `GET /api/leads/search?q=acme` returns filtered results matching title or clientName
- [ ] `GET /api/leads?page=999` returns empty items array (valid, not error)
- [ ] `GET /api/leads/{numeric-id}` returns single lead with 200 (bare-object response per P1-E1 envelope convention)
- [ ] `GET /api/leads/{nonexistent-id}` returns 404 conforming to ErrorEnvelopeSchema
- [ ] Response includes all `ILead` fields: `id` (number), `title`, `stage`, `clientName`, `estimatedValue`, `createdAt`, `updatedAt`

---

## Section 4: Domain Reads — Projects — BLOCKED on C1 + C2

Confirm read endpoints work for projects domain.

**Depends on:** C1 (project route handlers), C2 (auth middleware), Platform (staging deployment)

**Domain model reference:** Projects use **string UUID IDs**. Writable fields per `IProjectFormData`: `name`, `number`, `status`, `startDate`, `endDate`. Response fields per `IActiveProject`: `id` (string UUID), `name`, `number`, `status`, `startDate`, `endDate`.

- [ ] `GET /api/projects` with valid token → 200 with paginated response `{ items: [...], total, page, pageSize }`
- [ ] `GET /api/projects?page=2&pageSize=10` respects pagination
- [ ] `GET /api/projects/{valid-uuid}` returns single project with 200 (bare-object response)
- [ ] `GET /api/projects/{invalid-uuid}` returns 404 conforming to ErrorEnvelopeSchema
- [ ] Project response includes all `IActiveProject` fields: `id` (string UUID), `name`, `number`, `status`, `startDate`, `endDate`

---

## Section 5: Domain Reads — Estimating — BLOCKED on C1 + C2

Confirm read endpoints work for estimating domain.

**Depends on:** C1 (estimating route handlers), C2 (auth middleware), Platform (staging deployment)

**Domain model reference:** Estimating is NOT a generic "estimates" CRUD resource. It is split into:
- **Tracker CRUD:** `getAllTrackers`, `getTrackerById`, `createTracker`, `updateTracker`, `deleteTracker` — trackers use **numeric IDs**, scoped by `projectId` (string)
- **Kickoff:** `getKickoff(projectId)`, `createKickoff(data)` — Tier 2 PROVISIONAL (D2 sub-resource routing open)

See `IEstimatingTracker`, `IEstimatingKickoff`, and `IEstimatingRepository` in `@hbc/models` and `@hbc/data-access/src/ports/`.

### Tracker Reads (Tier 1 — CONFIRMED)
- [ ] `GET /api/estimating/trackers` with valid token → 200 with paginated response `{ items: [...], total, page, pageSize }` (PROVISIONAL — base route path confirmed, but D2 sub-resource routing may change)
- [ ] `GET /api/estimating/trackers/{numeric-id}` returns single tracker with 200 (bare-object response)
- [ ] `GET /api/estimating/trackers/{nonexistent-id}` returns 404 conforming to ErrorEnvelopeSchema
- [ ] Tracker response includes all `IEstimatingTracker` fields: `id` (number), `projectId` (string), `bidNumber`, `status`, `dueDate`, `createdAt`, `updatedAt`

### Kickoff Reads (Tier 2 — PROVISIONAL, D2 routing open)
- [ ] `GET /api/estimating/kickoffs/{projectId}` returns kickoff record for the project with 200 (PROVISIONAL — D2 sub-resource routing not frozen; path may change)
- [ ] Kickoff response includes all `IEstimatingKickoff` fields: `id` (number), `projectId` (string), `kickoffDate`, `attendees` (string[]), `notes`, `createdAt`
- [ ] `GET /api/estimating/kickoffs/{nonexistent-projectId}` returns 404 conforming to ErrorEnvelopeSchema

---

## Section 6: Domain Writes — Leads — BLOCKED on C1 + C2

Confirm `POST`, `PUT`, `DELETE` enforce validation and update correctly.

**Depends on:** C1 (leads route handlers + error middleware), C2 (auth middleware), Platform (staging deployment)

### Create
- [ ] `POST /api/leads` with valid body → 201 status, response includes numeric `id`
- [ ] Valid body: `{ title: "Highway Bridge Replacement", stage: "Identified", clientName: "ACME Construction", estimatedValue: 2500000 }`
- [ ] `POST /api/leads` with missing required field (e.g., `title`) → 422 with ErrorEnvelopeSchema response including `details` array
- [ ] `POST /api/leads` with invalid `stage` value → 422

### Update
- [ ] `PUT /api/leads/{numeric-id}` with valid partial body → 200 with updated record (bare-object response)
- [ ] Partial update: `{ stage: "Bidding" }` updates only that field, others unchanged
- [ ] `PUT /api/leads/{nonexistent-id}` → 404 conforming to ErrorEnvelopeSchema
- [ ] `PUT /api/leads/{numeric-id}` with invalid `stage` value → 422

### Delete
- [ ] `DELETE /api/leads/{numeric-id}` → 204 (No Content, empty body)
- [ ] Verify lead is actually deleted: `GET /api/leads/{id}` → 404
- [ ] `DELETE /api/leads/{nonexistent-id}` → 404

### Search
- [ ] `GET /api/leads/search?q=bridge` → 200 with paginated results matching title or clientName
- [ ] `GET /api/leads/search?q=` (empty query) → 400 conforming to ErrorEnvelopeSchema

---

## Section 7: Domain Writes — Projects — BLOCKED on C1 + C2

Confirm create, update, delete for projects.

**Depends on:** C1 (project route handlers), C2 (auth middleware), Platform (staging deployment)

**Domain model reference:** Create/update body per `IProjectFormData`: `name`, `number`, `status`, `startDate`, `endDate`. All fields are required for create; update is partial.

### Create
- [ ] `POST /api/projects` with `{ name: "Highway Widening", number: "PRJ-HW2026", status: "Planning", startDate: "2026-04-01T00:00:00Z", endDate: "2026-12-31T00:00:00Z" }` → 201 with UUID `id`
- [ ] `POST /api/projects` missing `name` → 422 with ErrorEnvelopeSchema response including `details` array
- [ ] Response includes all `IActiveProject` fields with server-generated `id` (string UUID)

### Update
- [ ] `PUT /api/projects/{valid-uuid}` with `{ status: "Active" }` → 200, unchanged fields preserved (bare-object response)
- [ ] `PUT /api/projects/{invalid-uuid}` → 404 conforming to ErrorEnvelopeSchema

### Delete
- [ ] `DELETE /api/projects/{valid-uuid}` → 204 (No Content, empty body)
- [ ] Verify project is actually deleted: `GET /api/projects/{uuid}` → 404

---

## Section 8: Domain Writes — Estimating — BLOCKED on C1 + C2

Confirm create, update, delete for estimating trackers and kickoff creation.

**Depends on:** C1 (estimating route handlers), C2 (auth middleware), Platform (staging deployment)

### Tracker Writes (Tier 1 — CONFIRMED)

**Domain model reference:** Create/update body per `IEstimatingTrackerFormData`: `projectId` (string), `bidNumber`, `status`, `dueDate`. All fields required for create; update is partial.

- [ ] `POST /api/estimating/trackers` with `{ projectId: "770e8400-e29b-41d4-a716-446655440001", bidNumber: "BID-2026-001", status: "Draft", dueDate: "2026-05-01T00:00:00Z" }` → 201 with numeric `id`
- [ ] `POST /api/estimating/trackers` without `projectId` → 422 with ErrorEnvelopeSchema response including `details` array
- [ ] Response includes all `IEstimatingTracker` fields with server-generated `id` (number), `createdAt`, `updatedAt`
- [ ] `PUT /api/estimating/trackers/{numeric-id}` with `{ status: "InProgress" }` → 200, unchanged fields preserved (bare-object response)
- [ ] `PUT /api/estimating/trackers/{nonexistent-id}` → 404 conforming to ErrorEnvelopeSchema
- [ ] `DELETE /api/estimating/trackers/{numeric-id}` → 204 (No Content, empty body)
- [ ] Verify tracker is actually deleted: `GET /api/estimating/trackers/{id}` → 404

### Kickoff Writes (Tier 2 — PROVISIONAL, D2 routing open)

**Domain model reference:** Create body per `IEstimatingKickoffFormData`: `projectId` (string), `kickoffDate`, `attendees` (string[]), `notes`.

- [ ] `POST /api/estimating/kickoffs` with `{ projectId: "770e8400-e29b-41d4-a716-446655440001", kickoffDate: "2026-04-01T09:00:00Z", attendees: ["Alice", "Bob"], notes: "Initial kickoff" }` → 201 with numeric `id` (PROVISIONAL — D2 route path not frozen)
- [ ] `POST /api/estimating/kickoffs` without `projectId` → 422 with ErrorEnvelopeSchema response
- [ ] Response includes all `IEstimatingKickoff` fields with server-generated `id` (number) and `createdAt`

---

## Section 9: Retry & Idempotency — BLOCKED on B1 + C1 + C2 + D1

Confirm client retry logic and idempotency key handling.

**Depends on:** B1 (proxy adapters with retry wiring), C1 (domain route handlers), C2 (auth middleware), D1 (retry policy, idempotency guards, `withIdempotency` handler wrapper, `IdempotencyStorageService`), Platform (staging deployment)

**NOTE:** This section is the most speculative in the checklist. The specific retry timing (e.g., 2-second delay), idempotency key header name, 503 simulation mechanism, and Table Storage record structure are all defined by P1-D1. Do not execute this section until D1 deliverables are frozen and deployed.

### Retry Behavior (D1 `withRetry` HOF)
- [ ] Client sends request to a temporarily unavailable endpoint → receives 503
- [ ] Client retries automatically per D1 retry policy (timing TBD by D1)
- [ ] Retry succeeds → expected response
- [ ] No duplicate side effects from retry

### Idempotency (D1 `withIdempotency` handler wrapper)
- [ ] `POST /api/leads` with idempotency key header (header name TBD by D1)
- [ ] Request succeeds → 201 with created lead
- [ ] Identical request with same idempotency key → returns cached result (not re-created)
- [ ] Idempotency record exists in D1's `IdempotencyStorageService` (Table Storage table name TBD by D1)

---

## Section 10: Error Recovery — BLOCKED on C1 + C2

Confirm error handling produces standardized shapes across all failure modes.

**Depends on:** C1 (error middleware with `formatErrorResponse()`), C2 (auth middleware), Platform (staging deployment)

### Backend Failure (502 / 503)
- [ ] Simulate backend error (mechanism TBD — may require staging-specific configuration)
- [ ] Response conforms to ErrorEnvelopeSchema: `{ error: '...', code: 'INTERNAL_ERROR' }`
- [ ] Error is classified and logged, not an unhandled exception

### Validation Failure (422)
- [ ] Send `POST /api/leads` with invalid data (e.g., `stage: "invalid"`)
- [ ] Response is 422 conforming to ErrorEnvelopeSchema with `code: 'VALIDATION_ERROR'` and `details` array
- [ ] No 500 error or unhandled exception

### Not Found (404)
- [ ] Request non-existent resource → 404 conforming to ErrorEnvelopeSchema
- [ ] `code` is `'NOT_FOUND'`

**PROVISIONAL (D3):** The `error` field in ErrorEnvelopeSchema may be renamed to `message` when C1 decision D3 resolves. See P1-E1 Frozen vs Provisional Error Envelope Fields.

---

## Section 11: Observability — BLOCKED on C1 + C2 + C3

Confirm request tracing and telemetry across the stack.

**Depends on:** C1 (route handlers emitting telemetry events), C2 (auth middleware emitting auth events), C3 (Application Insights instrumentation), Platform (staging deployment + AI workspace)

**Tracing model:** Azure Functions uses W3C Trace Context (`traceparent` / `tracestate` headers) for distributed trace correlation, integrated with Application Insights. The checklist should verify W3C trace correlation, not rely solely on a custom `X-Request-Id` header.

### Distributed Trace Correlation
- [ ] API responses include W3C `traceparent` header (or Application Insights operation ID is set)
- [ ] Same operation ID appears in Application Insights request telemetry
- [ ] Related log entries share the same operation ID

### Application Insights
- [ ] Azure Functions Application Insights dashboard loads
- [ ] Recent requests visible in "Requests" table (last 15 minutes after smoke test run)
- [ ] Failed requests appear in "Failures" tab with correct status codes
- [ ] Dependency calls (Redis, Table Storage) appear in dependency telemetry

### C3 Event Verification (manual KQL — see P1-E1 Task 9)
- [ ] `handler.invoke`, `handler.success`, `handler.error` events present after smoke test traffic
- [ ] `auth.bearer.validate`, `auth.bearer.success`, `auth.bearer.error` events present
- [ ] Proxy events (`proxy.request.start`, `proxy.request.success`) present for proxy-adapter domains

### Error Telemetry
- [ ] Simulated error appears in Application Insights with full context
- [ ] Exception telemetry includes function name, error classification
- [ ] Operation ID links error to the originating request

---

## Section 12: Phase 1 Acceptance Gates — BLOCKED on All Upstream

Final verification that all Phase 1 work meets acceptance criteria. This section becomes executable only when ALL preceding sections are READY TO VERIFY and have passed.

**Depends on:** All workstreams (B1, C1, C2, C3, D1), Platform (staging deployment + AI workspace)

- [ ] All Sections 1–11 checks pass (no unchecked items in any READY TO VERIFY section)
- [ ] No mock adapter usage in staging logs (`HBC_ADAPTER_MODE` must be `proxy`)
- [ ] No test tokens or expired credentials in staging configuration
- [ ] Domain APIs (leads, projects, estimating) return 200 with valid auth
- [ ] All domain routes enforce auth (401 without token)
- [ ] Response shapes conform to P1-E1 contract schemas (ErrorEnvelopeSchema for errors, bare-object for single-item, `createPagedSchema` for collections)
- [ ] Error recovery and retry logic functional (D1 deliverables verified)
- [ ] Observability complete: W3C trace correlation + Application Insights events + C3 telemetry events
- [ ] `validateRequiredConfig()` wired into startup and passing in staging

---

## C1 Reconciliation Note

Several items in this checklist reference transport shapes (error envelope, pagination, single-item response wrapping) that are governed by C1 decisions not yet frozen:

| Decision | Affects | Current Provisional Convention |
|---|---|---|
| D3 — Error field naming | ErrorEnvelopeSchema `error` vs `message` | `.error` field used throughout |
| D4 — Pagination default | `pageSize` default value | 25 (matches `DEFAULT_PAGE_SIZE`) |
| D5 — PATCH support | Whether PUT-only or PUT+PATCH | PUT-only assumed |
| D6 — Path nesting | Project-scoped domain routes | Flat paths assumed for Tier 1 |

When C1 freezes these decisions, update the affected checklist items to match. See P1-E1 Provisional Response-Envelope Convention and Open Decision and Blocker Ledger for the authoritative tracking.

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | __________ | __________ | __________ |
| Platform Lead | __________ | __________ | __________ |
| Architecture Lead | __________ | __________ | __________ |

### Sign-Off Notes

Additional observations, deviations, or follow-ups:

```
[Notes here]
```

---

## Post-Phase-1 Recommendations

- [ ] Convert manual checklist items into automated smoke tests (see P1-E1 Task 8)
- [ ] Document cold-start baseline from Section 1 for future performance comparison
- [ ] Review Application Insights cost and configure retention policy
- [ ] Schedule Phase 2 planning kickoff
