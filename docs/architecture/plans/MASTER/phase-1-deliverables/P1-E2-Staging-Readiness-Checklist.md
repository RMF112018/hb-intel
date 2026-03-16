# P1-E2: Staging Readiness Checklist

**Document ID:** P1-E2
**Phase:** 1 – Acceptance Validation
**Status:** Draft
**Date:** 2026-03-16
**Owner:** QA / Platform Engineering

## Purpose

Confirm all Phase 1 backbone and domain work is live and functioning correctly in staging before formal Phase 1 acceptance. This checklist validates adapter mode, authentication, domain read/write paths, retry behavior, error recovery, observability, and architecture compliance.

---

## Pre-Conditions

Before running this checklist, confirm:

- [ ] `HBC_ADAPTER_MODE=proxy` configured in staging environment
- [ ] Azure Functions v4 deployed and healthy in staging
- [ ] MSAL OBO app registration configured and credentials valid
- [ ] Redis cache available and reachable from functions
- [ ] Azure Table Storage available and reachable from functions
- [ ] Backend health endpoint responds successfully: `GET /api/health`
- [ ] Staging deployment is post-P1-C2 (auth middleware and validation applied)

---

## Section 1: Adapter Mode Verification

Confirm proxy adapter is active and startup logic runs cleanly.

- [ ] Application startup log contains `HBC_ADAPTER_MODE=proxy`
- [ ] `assertAdapterModeForEnvironment()` completes without throwing error
- [ ] `GET /api/health` returns `{ status: 'ok' }` with 200 status
- [ ] No warning or error logs for adapter mode mismatch
- [ ] Startup duration is acceptable (< 10 seconds)

---

## Section 2: Authentication Verification

Confirm auth middleware rejects unauthenticated requests and accepts valid tokens.

### Missing Token
- [ ] `GET /api/leads` (no Authorization header) → 401 response
- [ ] Response body includes `{ error: 'Unauthorized', code: 'UNAUTHORIZED' }`
- [ ] Response includes `X-Request-Id` header

### Expired Token
- [ ] Use a JWT token with `exp` claim in the past
- [ ] `GET /api/leads` with expired token → 401 response
- [ ] Response includes same error shape

### Valid Token
- [ ] Use a valid bearer token (generated via test service or OAuth flow)
- [ ] `GET /api/leads` with valid token → 200 response
- [ ] Response body is valid (not 401)
- [ ] Response includes `X-Request-Id` header

---

## Section 3: Domain Read Paths – Leads

Confirm `GET` endpoints return paginated responses and 404 for missing records.

- [ ] `GET /api/leads` with valid token → 200 with `{ items: [...], pagination: {...} }`
- [ ] Response includes pagination: `{ total, page, pageSize, totalPages }`
- [ ] `GET /api/leads?page=1&pageSize=5` respects pagination (returns max 5 items)
- [ ] `GET /api/leads?search=acme` filters results by name/company
- [ ] `GET /api/leads?page=999` returns empty items array (valid, not error)
- [ ] `GET /api/leads/{valid-uuid}` returns single lead record with 200
- [ ] `GET /api/leads/{invalid-uuid}` returns 404 with `{ error: 'Not Found' }`
- [ ] `GET /api/leads/{valid-uuid}` response includes all key fields: name, status, estimatedValue, etc.

---

## Section 4: Domain Read Paths – Projects

Confirm read endpoints work for projects domain.

- [ ] `GET /api/projects` with valid token → 200 with paginated response
- [ ] `GET /api/projects?page=2&pageSize=10` respects pagination
- [ ] `GET /api/projects/{valid-uuid}` returns single project with 200
- [ ] `GET /api/projects/{invalid-uuid}` returns 404

---

## Section 5: Domain Read Paths – Estimating

Confirm read endpoints work for estimating domain.

- [ ] `GET /api/estimates` with valid token → 200 with paginated response
- [ ] `GET /api/estimates?projectId={uuid}` filters by project
- [ ] `GET /api/estimates/{valid-uuid}` returns single estimate with 200
- [ ] `GET /api/estimates/{invalid-uuid}` returns 404

---

## Section 6: Domain Write Paths – Leads

Confirm `POST`, `PUT`, `DELETE` enforce validation and update correctly.

### Create
- [ ] `POST /api/leads` with valid body → 201 status, response includes `id`
- [ ] Valid body: `{ name: "Acme Corp", status: "prospect", estimatedValue: 50000 }`
- [ ] `POST /api/leads` with missing required field (e.g., name) → 422 with field error details
- [ ] Response includes `{ error: 'Validation failed', details: [{ path: ['name'], message: 'Required' }] }`

### Update
- [ ] `PUT /api/leads/{valid-uuid}` with valid partial body → 200 with updated record
- [ ] Partial update: `{ status: "qualified" }` updates only that field, others unchanged
- [ ] `PUT /api/leads/{invalid-uuid}` → 404
- [ ] `PUT /api/leads/{valid-uuid}` with invalid enum value (e.g., `status: "unknown"`) → 422

### Delete
- [ ] `DELETE /api/leads/{valid-uuid}` → 204 (No Content)
- [ ] Verify lead is actually deleted: `GET /api/leads/{uuid}` → 404
- [ ] `DELETE /api/leads/{invalid-uuid}` → 404

---

## Section 7: Domain Write Paths – Projects

Confirm create, update, delete for projects.

- [ ] `POST /api/projects` with `{ name: "Website Redesign" }` → 201 with id
- [ ] `POST /api/projects` missing name → 422 with field error
- [ ] `PUT /api/projects/{valid-uuid}` with `{ budget: 150000 }` → 200, unchanged fields preserved
- [ ] `DELETE /api/projects/{valid-uuid}` → 204, verify deleted

---

## Section 8: Domain Write Paths – Estimating

Confirm create, update, delete for estimates.

- [ ] `POST /api/estimates` with `{ projectId: "{uuid}", description: "Design", estimatedHours: 40 }` → 201
- [ ] `POST /api/estimates` without projectId → 422
- [ ] `PUT /api/estimates/{valid-uuid}` with `{ estimatedHours: 50 }` → 200
- [ ] `DELETE /api/estimates/{valid-uuid}` → 204

---

## Section 9: Retry and Idempotency

Confirm client retry logic and idempotency key handling.

### Simulated Backend Failure
- [ ] Configure function to return 503 on next request (via feature flag or local override)
- [ ] Client sends request → receives 503
- [ ] Client retries automatically after 2 seconds
- [ ] Retry succeeds → 200 or expected response
- [ ] Function received only one successful request (not duplicate work)

### Idempotency Key Header
- [ ] `POST /api/leads` with header `Idempotency-Key: test-key-123`
- [ ] Request succeeds → 201 with created lead ID (e.g., id: "abc-def-123")
- [ ] Send identical request again with same `Idempotency-Key`
- [ ] Response is 200 with same lead ID (cached, not re-created)
- [ ] Verify Azure Table Storage contains idempotency record with key "test-key-123"

---

## Section 10: Error Recovery

Confirm error handling and observability during failures.

### Backend Failure (502 / 503)
- [ ] Simulate backend 502 error
- [ ] Frontend receives typed error response (not unhandled exception)
- [ ] Error includes `code`, `message`, `requestId`
- [ ] Browser console shows `WriteFailureReason` with classification (e.g., 'SERVER_ERROR')
- [ ] No blank error pages or raw stack traces visible to user

### Validation Failure (422)
- [ ] Send `POST /api/leads` with invalid data (e.g., `status: "invalid"`)
- [ ] Response is 422 with `{ error: 'Validation failed', details: [...] }`
- [ ] Frontend can parse field errors and display validation messages
- [ ] No 500 error or unhandled exception

### Not Found (404)
- [ ] Request non-existent resource → 404 with `{ error: 'Not Found' }`
- [ ] Error code is 'NOT_FOUND', not generic error
- [ ] Request ID in response for tracing

---

## Section 11: Observability

Confirm request tracing and logging across the stack.

### Request ID Propagation
- [ ] All API responses include `X-Request-Id` header
- [ ] Request ID is a valid UUID format
- [ ] Same Request ID appears in Azure Functions Application Insights logs
- [ ] All log entries for the request share the same Request ID

### Application Insights
- [ ] Azure Functions Application Insights dashboard loads
- [ ] Recent requests visible in "Requests" table (last 5 minutes)
- [ ] Failed requests appear in "Failures" tab
- [ ] Dependency calls (Redis, Table Storage, OBO service) appear in trace
- [ ] No orphaned logs (all logs have matching request ID)

### Error Logs
- [ ] Simulate an error scenario (e.g., database unavailable)
- [ ] Error appears in Application Insights with full context
- [ ] Stack trace includes function name, line number
- [ ] Request ID and auth context included in error log

---

## Section 12: Phase 1 Acceptance Gates

Final verification that all Phase 1 work meets acceptance criteria.

- [ ] All Section 1–11 checks pass (no unchecked items)
- [ ] No mock adapter usage in staging logs (no `HBC_ADAPTER_MODE=mock`)
- [ ] No test tokens or fake credentials in staging (all auth is production-credentialed)
- [ ] P0 entry blockers from Phase 1 initiation resolved
- [ ] P1-C2 (auth and validation) fully deployed and functional
- [ ] Domain APIs (leads, projects, estimating, acknowledgments, notifications) return 200 with auth
- [ ] All routes enforce auth and validation
- [ ] Response shapes are standardized
- [ ] Request IDs propagate end-to-end
- [ ] Error recovery and retry logic functional
- [ ] Observability complete (logs, tracing, Application Insights)

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

- [ ] Document any manual test procedures needed for future staging validation
- [ ] Create automated smoke tests for staging deployment validation
- [ ] Review Application Insights cost; consider retention policy
- [ ] Schedule Phase 2 planning kickoff
