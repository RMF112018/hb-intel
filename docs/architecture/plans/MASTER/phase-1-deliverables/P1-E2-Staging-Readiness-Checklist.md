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
| Auth error shape | `{ error: 'Unauthorized', reason: string }` — pre-D3 legacy shape; does NOT include `code` field or `requestId`. Target after C2: `{ message: '...', code: 'UNAUTHORIZED' }` per D3 lock | `unauthorizedResponse()` in `validateToken.ts` |
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

### Staging Environment Readiness Matrix

These items cannot be verified from repo alone — they require a deployed staging environment. Each item indicates which checklist sections depend on it and who is responsible for provisioning it.

| Prerequisite | Required For | Owner | How to Verify | Status |
|---|---|---|---|---|
| **Function app deployed** | All sections | Platform | `SMOKE_TEST_BASE_URL` resolves; `curl $URL/api/health` or any registered route returns HTTP response (not DNS/connection failure) | **NOT MET** — no staging URL confirmed |
| **Required env vars present** | Section 1 (startup) | Platform | `validateRequiredConfig()` runs without error in staging logs (requires G2.6 wiring) | **NOT MET** — validation not wired into startup |
| **`HBC_ADAPTER_MODE=proxy`** | Section 1 (adapter mode) | Platform | Startup logs contain `HBC_ADAPTER_MODE=proxy` | **NOT MET** — staging not deployed |
| **Auth app registration** (`AZURE_TENANT_ID`, `AZURE_CLIENT_ID`) | Section 2 (auth) | Platform + C2 | `validateToken()` successfully verifies a JWT against `api://<CLIENT_ID>` audience | **NOT MET** — CLIENT_ID not defined for staging |
| **Redis reachable** | Sections 3–8 (domain routes using proxy cache) | Platform | Proxy route returns cached response; no Redis connection errors in AI | **NOT MET** — required only if proxy routes use Redis for domain data |
| **Azure Table Storage reachable** | Section 9 (idempotency records) | Platform | D1 `IdempotencyStorageService` can read/write to `IdempotencyRecords` table | **NOT MET** — D1 not delivered; table not created |
| **OBO app registration** (API scope grants for downstream APIs) | Endpoints calling downstream APIs (e.g., Graph, SharePoint) | C2 + Platform | OBO token exchange succeeds for downstream API audience | **NOT MET** — C2 not delivered; NOT required for basic domain CRUD |
| **Application Insights workspace** | Section 11 (observability) | Platform | AI connection string in function app settings; telemetry appears in AI portal | **NOT MET** — access not confirmed |
| **Health endpoint registered** | Section 1 (health check) | C1 or Platform | `GET /api/health` returns 200 | **BLOCKED** — no health function in `backend/functions/src/index.ts` |

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

**Depends on:** Platform (staging deployment), G2.6 (startup validation wiring)

### Current Repo State

| Item | Status | Evidence |
|---|---|---|
| `validateRequiredConfig()` | **Exported but NOT called at startup** | `backend/functions/src/utils/validate-config.ts` — comment explicitly says "NOT called at startup. G2.6 will wire the call." |
| Adapter mode assertion | **No `assertAdapterModeForEnvironment()` function exists** | No such function found in repo |
| Health endpoint | **Not registered** | `backend/functions/src/index.ts` imports 7 function modules — none is a health endpoint |
| Startup timing threshold | **No governing plan defines a numeric threshold** | No `< 10 seconds` or equivalent rule found in any Phase 1 plan |

### Adapter Mode Checks (operator-verifiable after staging deploy)
- [ ] `HBC_ADAPTER_MODE=proxy` configured in staging environment variables
- [ ] Application startup log contains `HBC_ADAPTER_MODE=proxy`
- [ ] No warning or error logs for adapter mode mismatch

### Startup Validation (BLOCKED on G2.6 wiring)
- [ ] `validateRequiredConfig()` wired into startup initialization path (**BLOCKED** — currently exported but not called; G2.6 must wire it before this check is meaningful)
- [ ] After G2.6 wiring: startup with missing required env vars produces an aggregated error listing all missing variables (per `validate-config.ts` implementation)
- [ ] After G2.6 wiring: startup with all required env vars present completes without validation errors

### Startup Duration (measured baseline — no hard-coded threshold)
- [ ] Measure actual cold-start time for the staging function app and record as the Phase 1 baseline
- [ ] Document the measured value for future comparison (**NOTE:** no governing plan defines a numeric pass/fail threshold such as "< 10 seconds" — the baseline is evidence, not a gate)

### Health Endpoint (BLOCKED — not registered)
- [ ] Health endpoint registered in `backend/functions/src/index.ts` and responds — `GET /api/health` returns 200 (**BLOCKED** — no health function exists in the repo today; C1 or Platform must deliver it before this check is executable)
- [ ] If a health endpoint is delivered: response includes at minimum `{ status: 'ok' }` or equivalent

---

## Section 2: Auth — Bearer Validation — BLOCKED on C2

Confirm auth middleware rejects unauthenticated requests and accepts valid tokens.

**Depends on:** C2 (auth hardening), Platform (staging deployment)

### Current State vs Target State

| Aspect | Current (repo-evidenced) | Target (after C2) |
|---|---|---|
| **Token validation** | `validateToken()` verifies Entra ID Bearer tokens via JWKS against `api://<CLIENT_ID>` audience; returns `IValidatedClaims { upn, oid, roles, displayName }` | Same mechanism, potentially with additional claim requirements |
| **401 response shape** | `{ error: 'Unauthorized', reason: string }` via `unauthorizedResponse()` | `{ message: '...', code: 'UNAUTHORIZED' }` conforming to ErrorEnvelopeSchema per D3 lock (**TARGET — C2 must standardize**) |
| **Trace correlation on 401** | Not included in current `unauthorizedResponse()` | Should include W3C trace context or operation ID (see Section 11) |
| **OBO flow** | Not implemented — no downstream API calls requiring delegated user context | C2 deliverable — needed only for endpoints that call downstream APIs (e.g., Microsoft Graph) on the user's behalf |

### Bearer Token Validation vs OBO

These are distinct concerns and must not be conflated:

- **Bearer validation (this section):** The API verifies the caller's JWT at the API boundary. Every authenticated endpoint requires this. The current `validateToken()` already does this — it verifies the token's signature, issuer, audience, and required claims (`upn`/`preferred_username`, `oid`).
- **OBO (On-Behalf-Of):** The API acquires a new token to call a downstream API on the user's behalf. Only endpoints that need delegated access to downstream services (e.g., Microsoft Graph, SharePoint) require OBO. OBO readiness is a separate C2 deliverable and is NOT a precondition for basic domain CRUD endpoints.

### Auth Evidence Model

| Evidence Type | How to Verify | What It Proves | Failure Classification |
|---|---|---|---|
| **HTTP 401 on missing token** | Send request without `Authorization` header; confirm 401 status | Bearer validation is enforced at the API boundary | If 200 → auth middleware not wired (C2 not deployed) |
| **HTTP 401 on expired token** | Send request with expired JWT; confirm 401 status | Token expiry validation works | If 200 → JWKS verification not checking `exp` |
| **HTTP 401 on wrong audience** | Send request with ARM-scoped token (`aud: https://management.azure.com`); confirm 401 | Audience validation works | If 200 → audience check misconfigured |
| **HTTP 200 on valid token** | Send request with valid API-scoped JWT; confirm 200 | Full auth pipeline accepts legitimate requests | Requires C1 domain route to exist |
| **401 response body shape** | Parse 401 response body; check for `message` and `code` fields | C2 error standardization deployed | **TARGET-STATE** — current shape is `{ error, reason }`, target is `{ message, code }` per D3 lock |
| **Decoded token claims** | Decode the JWT used in the request; verify `aud`, `iss`, `upn`, `oid` match expected values | Token was correctly scoped to the API | Operator/config error if wrong audience or tenant |
| **OBO downstream call** | Endpoint calls Microsoft Graph or other downstream API successfully | OBO app registration and token exchange work | Only applicable to OBO-dependent endpoints — NOT all routes |

### Checks

#### Missing Token
- [ ] `GET /api/leads` (no Authorization header) → 401 response
- [ ] Response status is 401 (verifiable regardless of body shape)
- [ ] Response body shape (**current:** `{ error: 'Unauthorized', reason }` — **target after C2:** `{ message: '...', code: 'UNAUTHORIZED' }` conforming to ErrorEnvelopeSchema per D3 lock)

#### Expired Token
- [ ] Use a JWT token with `exp` claim in the past
- [ ] `GET /api/leads` with expired token → 401 response
- [ ] Confirm the rejection is due to expiry, not malformation (check `reason` in current shape or `code` in target shape)

#### Wrong Audience (Operator Error Detection)
- [ ] Use an ARM-scoped token (`az account get-access-token` without `--resource`)
- [ ] `GET /api/leads` with ARM token → 401 response
- [ ] This catches the most common operator error: using a management token instead of an API-scoped token

#### Valid Token
- [ ] Token acquired via `az account get-access-token --resource api://<CLIENT_ID>` — NOT an ARM-scoped token
- [ ] `GET /api/leads` with valid token → 200 response (**requires C1 leads route to exist**)
- [ ] Decoded token has `aud` matching `api://<CLIENT_ID>` and `iss` matching the staging tenant

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

Confirm client retry logic and backend idempotency guard behavior.

**Depends on:** B1 (proxy adapters with retry wiring), C1 (domain route handlers), C2 (auth middleware), D1 (`RetryPolicy` types, `withRetry` HOF, `withIdempotency` handler wrapper, `IdempotencyStorageService`, `WriteFailureReason` classification), Platform (staging deployment)

### Write-Safety Dependency Note

All retry and idempotency behavior in this section is governed by **P1-D1 (Write Safety, Retry, and Recovery)**. The specific details below are NOT frozen — they represent the expected D1 deliverable shape based on the current D1 plan. Do not execute this section until D1 deliverables are implemented, frozen, and deployed to staging.

| Detail | Governed By | Current Status |
|---|---|---|
| Retry timing and backoff policy | D1 `RetryPolicy` types | **NOT FROZEN** — D1 defines `withRetry` HOF but timing constants are TBD |
| Client-side automatic retry trigger | D1 `withRetry` wired into `ProxyHttpClient` | **BLOCKED on B1 + D1** — `ProxyHttpClient` does not exist yet |
| Idempotency key header name | D1 `IdempotencyContext` | **NOT FROZEN** — D1 defines `generateIdempotencyKey` but header name TBD |
| Backend idempotency guard | D1 `withIdempotency` handler wrapper | **NOT FROZEN** — D1 plan defines the wrapper but it is not implemented |
| Idempotency storage table | D1 `IdempotencyStorageService` | **NOT FROZEN** — dedicated `IdempotencyRecords` table planned but not created |
| 503 simulation mechanism | Not defined by any plan | **OUT OF SCOPE** — no feature flag or simulation path exists |
| `WriteFailureReason` classification | D1 `classifyWriteFailure` | **NOT FROZEN** — enum and classifier planned but not implemented |

### CONFIRMED NOW

Nothing in this section is currently verifiable. No retry logic, idempotency guard, or write-safety infrastructure exists in the repo.

### TARGET AFTER D1 + B1 DELIVERY

#### Client Retry Behavior
- [ ] Client proxy adapter sends request to temporarily unavailable endpoint → receives 503
- [ ] `ProxyHttpClient` retries automatically per D1 `RetryPolicy` (timing, max retries, and backoff strategy defined by D1)
- [ ] Retry succeeds → expected response returned to caller
- [ ] No duplicate side effects from retried request (backend must be safe for retry on idempotent methods)
- [ ] Non-retryable errors (4xx) are NOT retried — only transient failures (5xx, network errors) trigger retry

#### Backend Idempotency Guard
- [ ] `POST /api/leads` with idempotency key header (header name per D1 `IdempotencyContext`)
- [ ] Request succeeds → 201 with created lead (numeric `id`, fields per `ILead`)
- [ ] Identical request replayed with same idempotency key → returns cached 200 result (not re-created)
- [ ] Different request body with same idempotency key → returns cached result from first request (key takes precedence)
- [ ] Idempotency record persisted in D1's `IdempotencyStorageService` storage

#### Write Failure Classification
- [ ] Transient failure (503, network timeout) → classified as retryable by `classifyWriteFailure`
- [ ] Validation failure (422) → classified as non-retryable
- [ ] Auth failure (401) → classified as non-retryable
- [ ] Not-found (404) → classified as non-retryable

### OUT OF SCOPE / NOT YET DEFINED

- **Feature-flagged 503 simulation:** No plan defines a mechanism to trigger artificial 503 responses for testing. Retry verification may require real transient failures or a staging-specific test endpoint (not yet planned).
- **Idempotency record inspection:** Direct Azure Table Storage verification of idempotency records is an implementation-level concern. The staging checklist verifies behavior (replay returns cached result), not storage internals, unless D1 explicitly defines a verification query.
- **Circuit breaker behavior:** P1-D1 lists circuit breaker telemetry (`circuit.state.change`, `circuit.fallback.used`) as deferred / not a Phase 1 deliverable.

---

## Section 10: Error Recovery — BLOCKED on C1 + C2

Confirm error handling produces standardized shapes across all failure modes. Each failure class is tested independently so failures in one class do not mask issues in another.

**Depends on:** C1 (error middleware with `formatErrorResponse()`), C2 (auth middleware with standardized 401 shape), Platform (staging deployment)

### Failure Mode Classification

| Failure Class | HTTP Status | ErrorEnvelopeSchema `code` | Triggered By | Depends On |
|---|---|---|---|---|
| **Auth failure** | 401 | `UNAUTHORIZED` | Missing/expired/wrong-audience token | C2 (standardized shape) |
| **Validation failure** | 422 | `VALIDATION_ERROR` | Invalid request body (wrong types, missing required fields, invalid enum values) | C1 (Zod validation in route handlers) |
| **Not found** | 404 | `NOT_FOUND` | Request for non-existent resource ID | C1 (route handlers) |
| **Transport failure** | 502 / 503 | `INTERNAL_ERROR` or `SERVICE_UNAVAILABLE` | Backend dependency unavailable (database, downstream API) | C1 (error middleware) |
| **Backend dependency failure** | 500 / 502 | `INTERNAL_ERROR` | Unhandled exception in route handler or service layer | C1 (error middleware catch-all) |

### Auth Failure (401)
- [ ] `GET /api/leads` without Authorization header → 401
- [ ] Response body shape: **current** `{ error: 'Unauthorized', reason }` — **target after C2:** `{ message: '...', code: 'UNAUTHORIZED' }` conforming to ErrorEnvelopeSchema per D3 lock
- [ ] Expired token → 401 (same shape)
- [ ] Wrong-audience token (ARM-scoped) → 401 (same shape)
- [ ] **Distinguishing characteristic:** auth failures are operator/config errors, not contract failures — see Section 2 Auth Evidence Model

### Validation Failure (422)
- [ ] `POST /api/leads` with invalid `stage` value (e.g., `stage: "invalid"`) → 422
- [ ] Response conforms to ErrorEnvelopeSchema with `code: 'VALIDATION_ERROR'` and `details` array listing field-level errors
- [ ] `POST /api/leads` with missing required field (e.g., no `title`) → 422 with `details` indicating the missing field
- [ ] No 500 error or unhandled exception for invalid input — validation errors must be caught and formatted by C1 error middleware
- [ ] **Distinguishing characteristic:** validation failures indicate client-side payload problems, not server errors

### Not Found (404)
- [ ] `GET /api/leads/{nonexistent-numeric-id}` → 404
- [ ] Response conforms to ErrorEnvelopeSchema with `code: 'NOT_FOUND'`
- [ ] `PUT /api/leads/{nonexistent-numeric-id}` → 404 (same shape)
- [ ] `DELETE /api/leads/{nonexistent-numeric-id}` → 404 (same shape)
- [ ] **Distinguishing characteristic:** not-found is a normal application response, not an error — no error telemetry should fire for expected 404s

### Transport / Backend Dependency Failure (5xx)
- [ ] Simulate backend dependency failure (mechanism TBD — may require staging-specific configuration or temporary infrastructure outage)
- [ ] Response conforms to ErrorEnvelopeSchema with `code: 'INTERNAL_ERROR'` or equivalent
- [ ] Error is classified, logged to Application Insights, and returned as a structured response — not an unhandled exception or raw stack trace
- [ ] **Distinguishing characteristic:** 5xx errors indicate server-side problems that may be retryable (see Section 9)

**PROVISIONAL (D3):** The `error` field in ErrorEnvelopeSchema may be renamed to `message` when C1 decision D3 resolves. See P1-E1 Frozen vs Provisional Error Envelope Fields.

---

## Section 11: Observability — BLOCKED on C1 + C2 + C3

Confirm request tracing and telemetry across the stack.

**Depends on:** C1 (route handlers emitting telemetry events), C2 (auth middleware emitting auth events), C3 (Application Insights instrumentation), Platform (staging deployment + AI workspace)

### Tracing Evidence

Azure Functions integrates with Application Insights via the W3C Trace Context standard (`traceparent` / `tracestate` headers). This is the primary correlation mechanism — custom `X-Request-Id` headers are neither required nor sufficient as the sole observability proof.

**Correlation strategy:**

| Layer | Correlation Identifier | Source | How to Verify |
|---|---|---|---|
| **HTTP response** | W3C `traceparent` header (if present) or Application Insights `Request-Id` header | Azure Functions host automatically adds these when AI is configured | Inspect response headers |
| **Application Insights request telemetry** | `operation_Id` field | AI SDK auto-captures for every HTTP trigger invocation | KQL: `requests \| where operation_Id == "<id>"` |
| **Application Insights trace/log entries** | `operation_Id` field | Inherited from the request context when using `context.log()` or AI SDK | KQL: `traces \| where operation_Id == "<id>"` |
| **Application Insights dependency telemetry** | `operation_Id` field | AI SDK auto-captures outbound calls (Redis, Table Storage, HTTP) | KQL: `dependencies \| where operation_Id == "<id>"` |

**Custom request-ID header:** If C1 or C2 defines a custom `X-Request-Id` response header (e.g., for client-side correlation), that header contract is **PROVISIONAL** — no governing plan has frozen it. The W3C `traceparent` / AI `operation_Id` is the primary correlation mechanism regardless.

**What to verify:**

| Evidence | How | Proves |
|---|---|---|
| HTTP-level correlation exists | Response includes `traceparent` or `Request-Id` header | AI instrumentation is active on the function app |
| Request appears in AI | KQL: `requests \| where timestamp > ago(15m) \| where url contains "/api/leads"` | Function invocations are captured |
| Logs correlate to request | KQL: `traces \| where operation_Id == "<operation_Id from request>"` | Log statements share the request's operation ID |
| Dependencies correlate | KQL: `dependencies \| where operation_Id == "<operation_Id>"` | Outbound calls (Redis, Table Storage) are linked to the originating request |
| Errors correlate | KQL: `exceptions \| where operation_Id == "<operation_Id>"` | Exceptions are linked to the originating request |

### Checks

#### Platform Telemetry Baseline
- [ ] Azure Functions Application Insights dashboard loads
- [ ] AI connection string configured in staging function app settings
- [ ] Recent requests visible in "Requests" table (last 15 minutes after smoke test run)
- [ ] Failed requests appear in "Failures" tab with correct HTTP status codes
- [ ] Dependency calls (Redis, Table Storage) appear in dependency telemetry with correct target names

#### Distributed Trace Correlation
- [ ] API response includes `traceparent` header or AI `Request-Id` header (confirms AI instrumentation is active)
- [ ] Extract `operation_Id` from AI request telemetry for a known request
- [ ] Same `operation_Id` appears across `requests`, `traces`, and `dependencies` tables in AI
- [ ] Custom `X-Request-Id` header present in response (PROVISIONAL — only if C1/C2 defines this contract)

#### C3 Event Verification (manual KQL — see P1-E1 Task 9)
- [ ] `handler.invoke`, `handler.success`, `handler.error` events present after smoke test traffic
- [ ] `auth.bearer.validate`, `auth.bearer.success`, `auth.bearer.error` events present
- [ ] Proxy events (`proxy.request.start`, `proxy.request.success`) present for proxy-adapter domains
- [ ] Events carry `operation_Id` linking them to the originating HTTP request

#### Error Telemetry
- [ ] Simulated error appears in Application Insights `exceptions` table with full context
- [ ] Exception telemetry includes function name and error classification
- [ ] `operation_Id` links the exception to the originating request in the `requests` table
- [ ] No orphaned exceptions (every exception has a matching request entry)

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

## Execution Order

Run checklist sections in this dependency-ordered sequence. Do not skip ahead — later sections depend on earlier ones passing.

| Step | Section | Gate Condition |
|---|---|---|
| 1 | **Section 1: Adapter Mode & Startup** | Staging deployed; function app responding |
| 2 | **Section 2: Auth — Bearer Validation** | Step 1 passed; C2 auth hardening deployed |
| 3 | **Section 3: Domain Reads — Leads** | Steps 1–2 passed; C1 leads routes deployed |
| 4 | **Section 4: Domain Reads — Projects** | Steps 1–2 passed; C1 project routes deployed |
| 5 | **Section 5: Domain Reads — Estimating** | Steps 1–2 passed; C1 estimating routes deployed |
| 6 | **Section 6: Domain Writes — Leads** | Step 3 passed (reads work before testing writes) |
| 7 | **Section 7: Domain Writes — Projects** | Step 4 passed |
| 8 | **Section 8: Domain Writes — Estimating** | Step 5 passed |
| 9 | **Section 9: Retry & Idempotency** | Steps 6–8 passed; D1 + B1 deployed |
| 10 | **Section 10: Error Recovery** | Steps 3–8 passed; C1 error middleware deployed |
| 11 | **Section 11: Observability** | Steps 1–10 passed; C3 instrumentation deployed; AI workspace accessible |
| 12 | **Section 12: Acceptance Gates** | All steps 1–11 passed |

**Partial execution:** If only some upstream deliverables are available, execute only the sections whose gate conditions are met. Record blocked sections in the Evidence Log.

---

## Evidence to Capture

For each check item, the operator must record evidence in the following format. Copy this template into a separate evidence log file or spreadsheet for the test run.

| Section | Check Item | Command / Request | Expected Result | Actual Result | Staging Evidence (AI operation_Id, screenshot, or log link) | Outcome |
|---|---|---|---|---|---|---|
| _1_ | _Adapter mode in logs_ | _Check startup logs_ | _`HBC_ADAPTER_MODE=proxy`_ | _[fill]_ | _[link]_ | _Pass / Fail / Blocked / Waived_ |
| _2_ | _Missing token → 401_ | _`curl -s $URL/api/leads`_ | _HTTP 401_ | _[fill]_ | _[link]_ | _Pass / Fail / Blocked / Waived_ |
| _…_ | _…_ | _…_ | _…_ | _…_ | _…_ | _…_ |

**Outcome definitions:**

| Outcome | Meaning |
|---|---|
| **Pass** | Check produced the expected result with staging evidence captured |
| **Fail** | Check produced an unexpected result — investigate and document |
| **Blocked** | Prerequisites not met — section cannot be executed (record which dependency is missing) |
| **Waived** | Check intentionally skipped with documented rationale and sign-off approval |

---

## Known Non-Executable Items (as of 2026-03-18)

All items below remain blocked on upstream deliverables. This section must be updated as dependencies are delivered.

| Section | Blocked Item | Blocked On | Unblock Condition |
|---|---|---|---|
| 1 | Startup validation wired into runtime | G2.6 | `validateRequiredConfig()` called at startup |
| 1 | Health endpoint | C1 or Platform | `/api/health` function registered in `index.ts` |
| 2 | Standardized 401 response shape (`{ error, code }`) | C2 | Auth middleware returns ErrorEnvelopeSchema-conformant 401 |
| 3–5 | All domain read checks | C1 | Domain route handlers (leads, projects, estimating) deployed |
| 6–8 | All domain write checks | C1 | Domain route handlers + error middleware deployed |
| 9 | All retry and idempotency checks | B1 + D1 | `ProxyHttpClient` with retry wiring + `withIdempotency` handler wrapper |
| 10 | Standardized error shapes (422, 404, 5xx) | C1 | `formatErrorResponse()` error middleware deployed |
| 11 | C3 telemetry events | C3 | Application Insights instrumentation deployed |
| 11 | Custom `X-Request-Id` header | C1 or C2 | **PROVISIONAL** — header contract not frozen |
| 12 | All acceptance gates | All | All Sections 1–11 passed |

---

## Sign-Off

Each signer must record one of: **PASSED**, **FAILED** (with issue references), **BLOCKED** (with missing dependencies), or **WAIVED** (with rationale).

| Role | Name | Date | Outcome | Notes / Issue References |
|------|------|------|---------|--------------------------|
| QA Lead | __________ | __________ | Pass / Fail / Blocked / Waived | __________ |
| Platform Lead | __________ | __________ | Pass / Fail / Blocked / Waived | __________ |
| Architecture Lead | __________ | __________ | Pass / Fail / Blocked / Waived | __________ |

### Sign-Off Conditions

- **PASSED:** All Sections 1–12 checks pass with staging evidence captured. No items waived without rationale.
- **FAILED:** One or more checks failed. Issue references must be provided. Re-run after fixes.
- **BLOCKED:** One or more sections could not execute due to missing upstream deliverables. List blocked sections and their dependencies.
- **WAIVED:** Specific checks intentionally skipped. Each waiver requires written rationale and Architecture Lead approval.

### Sign-Off Notes

```
[Observations, deviations, waivers, or follow-ups]
```

---

## Post-Phase-1 Recommendations

- [ ] Convert manual checklist items into automated smoke tests (see P1-E1 Task 8)
- [ ] Document cold-start baseline from Section 1 for future performance comparison
- [ ] Review Application Insights cost and configure retention policy
- [ ] Schedule Phase 2 planning kickoff

---

## Definition of Ready to Execute This Checklist

Before beginning a checklist execution run, confirm all of the following:

- [ ] `SMOKE_TEST_BASE_URL` is set and resolves to a deployed staging Azure Functions instance
- [ ] `AUTH_TOKEN` is available (acquired via `az account get-access-token --resource api://<CLIENT_ID>`)
- [ ] The `Last Reviewed Against Repo Truth` date in the header is within 7 days of the execution date
- [ ] The Staging Environment Readiness Matrix has been reviewed — items marked NOT MET are understood as blocking their dependent sections
- [ ] The Known Non-Executable Items section has been reviewed — the operator knows which sections will be blocked
- [ ] An evidence log file or spreadsheet has been prepared using the Evidence to Capture template
- [ ] The operator has read the Checklist Usage Rule and understands the BLOCKED / PREP-ONLY / PROVISIONAL distinctions
- [ ] The Execution Order has been reviewed — the operator will follow the dependency sequence, not skip ahead
