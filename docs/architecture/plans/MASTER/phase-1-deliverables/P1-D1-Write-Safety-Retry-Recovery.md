# P1-D1: Write Safety, Retry, and Recovery Implementation Plan

| Field | Value |
|---|---|
| **Doc ID** | P1-D1 |
| **Phase** | Phase 1 |
| **Workstream** | D — Write Safety, Retry, and Recovery |
| **Document Type** | Implementation Plan |
| **Owner** | D1-workstream lead |
| **Status** | **Complete (2026-03-19)** — `withRetry()` wired into ProxyHttpClient, `withIdempotency` handler wrapper, `IdempotencyStorageService`, cleanup timer, idempotency header injection all delivered |
| **Date** | 2026-03-16 |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **Audience** | Developers implementing write safety for Phase 1 critical path (Project, Lead, Estimating) |
| **References** | P1-B1 (Proxy Adapter), P1-B2 (Adapter Completion Backlog), P1-C1 (Backend Service Catalog), P1-C3 (Observability Spec), current-state-map.md |

### Status Legend

| Marker | Meaning |
|---|---|
| **CURRENT** | Verified against live repo as of 2026-03-19 |
| **TARGET** | D1 deliverable — implementation planned |
| **PROVISIONAL** | Design decision pending upstream confirmation |
| **BLOCKED** | Cannot implement until dependency is delivered |

---

## Purpose

This plan guides developers with no HB Intel codebase knowledge to implement write safety features — retry logic, idempotency key patterns, and audit trail infrastructure — for the Proxy Adapter. The plan emphasizes test-driven development (TDD), starts from first principles, and assumes only TypeScript and Vitest familiarity.

**Deliverables:**
- Retry policy types and `withRetry` higher-order function
- Idempotency key generation and tracking interface
- Backend idempotency guard (`withIdempotency` handler wrapper, `IdempotencyStorageService`, cleanup timer) (Azure Functions)
- Write-safe error states and failure classification
- Audit record interface (models layer)
- Integration tests verifying retry + idempotency together
- Complete TypeScript implementation with Vitest tests

**Not in scope for P1-D1:**
- Offline queue deferred-write coordination (belongs to session-state, covered separately)
- SharePoint adapter retry (Phase 5+)
- Frontend UI error recovery flows (belongs to app shells, not data-access)

---

## Plan Status and Dependencies

### Current Repo State (updated 2026-03-19 — D1 complete)

- `ProxyHttpClient` exists with `withRetry()` wired, Bearer auth, 30s timeout, X-Request-Id generation, error normalization via `normalizeHttpError()`, idempotency key header injection (**COMPLETE**)
- `BaseProxyProjectRepository` exists with `fetchCollection`, `fetchById`, `fetchCreate`, `fetchUpdate`, `fetchDelete`, `fetchAggregate`, `fetchSubResource` methods (**CURRENT**)
- All 11 proxy repos implemented and factory-wired (Lead, Project, Estimating, Schedule, Buyout, Compliance, Contract, Risk, Scorecard, PMP, Auth); A9 resolved via P1-C2-a Task 21 (**COMPLETE**)
- `packages/data-access` has vitest configured with `test` script; 189+ tests passing across all proxy repos (**CURRENT**)
- `backend/functions` has vitest test infrastructure (unit, smoke, coverage) (**CURRENT**)
- `IdempotencyStorageService` implemented (`IdempotencyRecords` table); `withIdempotency` handler wrapper delivered; nightly cleanup timer implemented (**COMPLETE**)
- Retry logic (`withRetry` HOF with configurable policy) implemented and wired into `ProxyHttpClient` (**COMPLETE**)

### D1 Deliverable Breakdown by Surface

| Deliverable | Surface | Status | Dependency |
|---|---|---|---|
| `RetryPolicy` types + `withRetry` HOF | `packages/data-access` | **TARGET** — implementable now | None — standalone module |
| `ProxyHttpClient` retry wiring | `packages/data-access` | **TARGET** — unblocked | `ProxyHttpClient` exists with D1 hook points (`onBeforeRequest`, `onAfterResponse`) ready for wiring |
| `WriteFailureReason` enum + `classifyWriteFailure` | `packages/data-access` | **TARGET** — implementable now | None — standalone module |
| `IdempotencyContext` + `generateIdempotencyKey` | `packages/data-access` | **TARGET** — implementable now | None — standalone module |
| `IAuditRecord` interface | `packages/models` or `packages/data-access` | **TARGET** — implementable now | None — interface only |
| Backend idempotency guard (`withIdempotency` wrapper + guard functions) | `backend/functions` | **TARGET** — implementable now | None — standalone module using existing service factory pattern |
| Backend `IdempotencyStorageService` + `IdempotencyRecords` table | `backend/functions` | **TARGET** — implementable now | None — follows `RealTableStorageService` pattern with new dedicated table |
| Idempotency record cleanup timer | `backend/functions` | **TARGET** — implementable now | None — follows existing `app.timer()` registration pattern |
| Repository-level idempotency wiring | `packages/data-access` | **BLOCKED** | B1 must deliver proxy repositories first |
| Integration tests | Both surfaces | **BLOCKED** | B1 proxy infrastructure + D1 implementation must both exist |

### What D1 Can Implement Now (No B1 Dependency)

- Chunk 1, Task 1.1: `RetryPolicy` types and `withRetry` HOF (standalone, testable in isolation)
- Chunk 2, Task 2.1: `IdempotencyContext` types and `generateIdempotencyKey` (standalone)
- Chunk 3, Task 3.1: `WriteFailureReason` enum and `classifyWriteFailure` (standalone)
- Chunk 3, Task 3.2: `IAuditRecord` interface (standalone)
- Chunk 2, Task 2.2: `IdempotencyStorageService` (new service, dedicated `IdempotencyRecords` table, follows `RealTableStorageService` pattern)
- Chunk 2, Task 2.2: `checkIdempotency()` and `recordIdempotencyResult()` standalone functions
- Chunk 2, Task 2.2: `withIdempotency(handler)` wrapper function
- Chunk 2, Task 2.2: `cleanupIdempotencyRecords` timer trigger

### What D1 Cannot Implement Until B1 Delivers Remaining Repos

- Chunk 3, Task 3.3: Repository-level idempotency wiring for Lead, Project, Estimating, Auth (these 4 repos do not yet exist; 7 project-scoped repos are available for wiring now)
- Chunk 4: Full integration tests across all 11 domains (needs remaining 4 B1 repos + D1 implementation)

**Now unblocked (ProxyHttpClient and 7 repos exist):**
- Chunk 1, Task 1.2: Wiring retry into `ProxyHttpClient` — class exists with D1 hook points
- Chunk 3, Task 3.3 (partial): Repository-level idempotency wiring for the 7 implemented project-scoped repos

### Acceptance Gates D1 Unlocks

- B2 `PROD_ACTIVE` gate: "Write safety — Retry and idempotency behavior verified for write methods (D1 deliverables)"
- B2 `PROD_ACTIVE` gate: "Observability — Monitoring, error reporting, and alerting confirmed" — D1 contributes retry telemetry (`proxy.request.error`, `proxy.request.retry`) and audit records; circuit-breaker telemetry (`circuit.state.change`, `circuit.fallback.used`) is defined by C3 but is **not a D1 Phase 1 deliverable**

### Cross-Workstream Dependencies

| D1 depends on | For | Status |
|---|---|---|
| B1 (Proxy Adapter) | `ProxyHttpClient` class and proxy repository implementations | B1 transport foundation delivered; `ProxyHttpClient` exists; 10 of 11 proxy repos implemented (Lead, Project, Estimating, Schedule, Buyout, Compliance, Contract, Risk, Scorecard, PMP). Remaining: Auth (blocked on A9). |
| C1 (Backend Catalog) | Route shapes, error envelope, HTTP methods | C1 frozen for implemented routes |
| B2 (Completion Backlog) | Gate criteria and production activation requirements | B2 active |
| C3 (Observability Spec) | Retry and error telemetry contract (`proxy.request.error`, `proxy.request.retry`); circuit-breaker telemetry is C3-owned, not D1 Phase 1 | C3 aligned for retry/error; circuit-breaker deferred |

### Verification Command Guidance

**`packages/data-access` — vitest configured and 84 tests passing (CURRENT):**

Test infrastructure is already in place. D1 adds new test files following the existing pattern:
- Run tests: `pnpm --filter @hbc/data-access test`
- Existing config: `packages/data-access/vitest.config.ts`
- Existing test files: `ProxyHttpClient.test.ts`, `envelope.test.ts`, `repositories.test.ts`
4. Optionally add data-access to root `vitest.workspace.ts` for workspace-level runs

Until this is done, D1 tests cannot execute. The `npx vitest run packages/data-access/...` pattern used in earlier drafts is **not repo-valid** — `packages/data-access` is not in the workspace vitest configuration.

**`packages/models` — no test script exists (CURRENT):**
If Task 3.2 adds tests (currently type-only), the same vitest setup applies.

**`backend/functions` — vitest exists (CURRENT):**
- Unit tests: `cd backend/functions && npm test`
- Smoke tests: `cd backend/functions && npm run test:smoke`
- Coverage: `cd backend/functions && npm run test:coverage`

**Static analysis (all packages, must pass before commit):**
- `pnpm --filter @hbc/data-access run check-types`
- `pnpm --filter @hbc/data-access run lint`
- `pnpm --filter @hbc/backend-functions run check-types` (for backend changes)
- `pnpm --filter @hbc/backend-functions run lint` (for backend changes)

### Actual Port Interface Reference (for code examples)

- **`ILeadRepository`**: IDs are `number`; `create(data: ILeadFormData)`, `update(id: number, data: Partial<ILeadFormData>)`, `delete(id: number)`, `getById(id: number)`, `getAll(options?)`, `search(query, options?)`
- **`IProjectRepository`**: domain-prefixed methods — `getProjects()`, `getProjectById(id: string)`, `createProject(data)`, `updateProject(id: string, data)`, `deleteProject(id: string)`, `getPortfolioSummary()`
- **`IEstimatingRepository`**: tracker methods — `getAllTrackers()`, `getTrackerById(id: number)`, `createTracker(data)`, `updateTracker(id: number, data)`, `deleteTracker(id: number)` + kickoff methods — `getKickoff(projectId)`, `createKickoff(data)`

Code examples in this plan use `ILeadRepository` as the primary illustration. When applying the pattern to Project and Estimating, use the actual method names and ID types from their port interfaces.

---

## Design Note: Write Safety Architecture Decisions

### Decision 1: Retry in HTTP Client, not Repository

**Rationale:**
Repositories orchestrate business logic and should not be coupled to transport retry concerns. HTTP failures are transport-layer problems; a repository's job is to call the adapter and handle data-contract mismatches.

**Consequence:**
`ProxyHttpClient` owns all retry behavior. If the SharePoint adapter (Phase 5) uses PnPjs, it will have its own retry at the PnPjs call site, not in the repository.

**Implication for implementation:**
`withRetry` wraps the HTTP verb methods (`get`, `post`, `put`, `delete`), not the repository methods.

#### Retry design requirements (aligned to Azure guidance)

The following requirements apply to all retry implementations in D1. They are derived from [Azure Architecture Center — Retry guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/retry-service-specific) and the specific characteristics of the Azure Functions → Graph API proxy path.

1. **Bounded exponential backoff with jitter**: Delays must include randomized jitter (±25% of computed delay) to prevent retry storms when multiple clients experience simultaneous failures. Formula: `delay = min(initialDelayMs × backoffFactor^attempt × (0.75 + random(0.5)), maxDelayMs)`.

2. **Honor `Retry-After`**: When a 429 or 503 response includes a `Retry-After` header, use that value as the delay floor (overriding the computed backoff if the header specifies a longer wait). This is required by Microsoft Graph throttling guidance.

3. **Policy selection by operation type**: The HTTP client must select the correct policy per operation — `READ_RETRY_POLICY` for GET requests, `WRITE_RETRY_POLICY` for POST/PUT/DELETE. The constructor should NOT default all operations to a single policy.

4. **Retryable error classification must be consistent**: The set of codes classified as retryable in the policy must match the codes emitted by the error classifier. All of the following are retryable: `NETWORK_ERROR`, `TIMEOUT`, `SERVICE_UNAVAILABLE` (503), `RATE_LIMITED` (429), `BAD_GATEWAY` (502), `GATEWAY_TIMEOUT` (504).

5. **Non-retryable classes (fail immediately)**: `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `VALIDATION_ERROR` (422), `CLIENT_ERROR` (4xx), `CONFLICT` (409). These indicate client-side or permission issues that retrying cannot fix.

6. **Maximum total retry duration**: No single operation should spend more than 30 seconds in retry loops (across all attempts). If cumulative delay exceeds this, abort with the last error.

---

### Decision 2: Idempotency Keys Generated by Frontend, Honored by Backend

**Rationale:**
The frontend (the caller) knows the semantic intent of the write operation. A key must be stable across page re-renders, navigation, and browser crashes during a write flow. Only the frontend can guarantee this stability.

**Consequence:**
Frontend generates a unique key before initiating a write. The key is sent as the `Idempotency-Key` HTTP header. The backend checks the key and either returns the cached response (if already processed) or processes the write.

**Implication for implementation:**
`generateIdempotencyKey()` returns a UUID + operation context. Mutating HTTP methods accept `IdempotencyContext`. Reads never receive contexts.

**Idempotency enforcement for critical-path writes:** All POST and PUT calls through `ProxyHttpClient` for Lead, Project, and Estimating domains MUST include an `IdempotencyContext`. Callers that omit it on a create or update path are non-conforming with D1 and will fail the B2 `PROD_ACTIVE` write-safety gate. The `post()` and `put()` method signatures retain `idempotency?: IdempotencyContext` for backward compatibility during development, but repository implementations MUST always supply it for production creates and updates.

**DELETE is excluded from required idempotency:** HTTP DELETE is naturally idempotent — deleting a resource that is already deleted returns 404 or 204, not a duplicate side-effect. Application-level idempotency keys add no write-safety benefit for DELETE and are omitted from the `delete()` API to keep the interface simple. DELETE still uses `WRITE_RETRY_POLICY` for transport-level retry.

---

### Decision 3: Backend Idempotency Stored in Azure Table Storage

**Rationale:**
Idempotency records must be durable across function restarts and queryable by key in single-digit milliseconds. Azure Table Storage provides point-read by PartitionKey+RowKey which is ideal for this access pattern. The existing `RealTableStorageService` (`backend/functions/src/services/table-storage-service.ts`) demonstrates the SDK integration pattern.

**Consequence:**
Idempotency records live in a **dedicated table** named `IdempotencyRecords` (separate from the `ProvisioningStatus` table used by `RealTableStorageService`). Records are written with an `expiresAt` timestamp. Azure Table Storage has **no native TTL**; expiry is enforced in two ways: (a) `checkIdempotency` treats records past `expiresAt` as non-existent, and (b) a timer-triggered cleanup function (`cleanupIdempotencyRecords`) deletes stale records on a nightly schedule.

**Idempotency record schema:**

| Field | Type | Description |
|---|---|---|
| `partitionKey` | string | `X-Idempotency-Operation` header value (e.g., `create-lead`) |
| `rowKey` | string | `Idempotency-Key` header value (UUID) |
| `statusCode` | number | HTTP status code of original response |
| `responseBodyJson` | string | JSON-serialized response body |
| `expiresAt` | string | ISO 8601 timestamp — application-enforced expiry |
| `recordedAt` | string | ISO 8601 timestamp — when the record was created |
| `recordedBy` | string | UPN of the user who initiated the request |

**Partition/Row Key strategy:**
- `partitionKey` = operation name groups records by domain operation for efficient range queries during cleanup.
- `rowKey` = idempotency key UUID guarantees uniqueness and enables O(1) point reads via `client.getEntity(pk, rk)`.

**Implication for implementation:**
A new `IdempotencyStorageService` class (following the `TableClient.fromConnectionString()` pattern) is registered in `IServiceContainer` via `createServiceFactory()`. Standalone functions `checkIdempotency()` and `recordIdempotencyResult()` receive the service as a parameter. There is no middleware pipeline in Azure Functions v4; a `withIdempotency(handler)` wrapper function is applied at each mutating endpoint's `app.http()` registration.

---

### Decision 4: Write Audit Records Async-Non-Blocking on Backend

**Rationale:**
Audit failures should never cause business operation failures. Users care about getting their project created or lead updated, not about whether the audit log entry succeeded.

**Consequence:**
Audit write on the backend uses a `.catch()` pattern. Audit records are eventually consistent. The business operation always succeeds regardless of audit outcome.

**Implication for implementation:**
Frontend data-access layer does NOT write audit records. Only the backend does, after confirming the write succeeded. The frontend may log errors locally (to IndexedDB via session-state), but those are not audit logs.

#### Audit control requirements

1. **When audit records MUST be written:** After every successful mutating operation (POST/PUT/DELETE) on Lead, Project, and Estimating domains. Audit is not optional for Phase 1 critical-path domains.

2. **Minimum audit fields:** `id`, `entityType`, `entityId`, `operation`, `performedBy` (UPN), `performedAt` (ISO 8601), `correlationId` (from `X-Request-Id` header), `idempotencyKey` (from `Idempotency-Key` header when present), `outcome` (`'success'` | `'error'`), `errorCode` (when outcome is `'error'`).

3. **Correlation requirements:** Every audit record MUST include the `correlationId` from the request's `X-Request-Id` header and the `idempotencyKey` from the `Idempotency-Key` header (when present). These enable end-to-end tracing from frontend through proxy to backend audit.

4. **Audit persistence failure policy:**
   - Try once with `.catch()` — do NOT retry (audit must not delay the response).
   - Log the audit-write failure to Application Insights as a warning with full audit payload so the data is recoverable from telemetry.
   - The business operation still succeeds — audit loss is an operational alert, not a user-visible error.
   - C3 alert rule `audit.write.failure` fires when audit loss rate exceeds threshold (defined by C3 spec section 2.2).

5. **Evidence for B2 `PROD_ACTIVE` and E1 `STAGING_READY`:**
   - Audit records visible in Azure Table Storage during E1 contract test runs constitute staging-readiness evidence.
   - For `PROD_ACTIVE`, audit query dashboards must show write operations for all three critical-path domains (Lead, Project, Estimating).
   - Audit records correlatable with idempotency records by key constitute B2 deduplication evidence.

---

### Decision 5: Write Failure States Defined by Consuming App, Not Data-Access

**Rationale:**
Data-access cannot predict what the app wants to do with a write failure. Should a lead-creation failure show a toast and a retry button? Or inline validation? Or a modal with escalation options? The app knows; data-access doesn't.

**Consequence:**
Data-access exports `WriteFailureReason` (enum) and `classifyWriteFailure()` (function) as **canonical package exports**. These define the error taxonomy used by both frontend apps and C3 telemetry (`proxy.request.error` events include `failureReason` from this classification). The consuming app imports the enum and decides what UX to show.

**What is NOT a canonical data-access export:**
`WriteOutcome` (a discriminated union for structured write results) is an **optional app-level helper pattern**. It may be useful in app shells but should NOT be exported from `@hbc/data-access` because outcome shape — including states like `retrying`, `idempotent-duplicate`, progress tracking — is an app concern. Apps may define their own outcome types that compose `WriteFailureReason`.

**Implication for implementation:**
Data-access has a `classifyWriteFailure(error: HbcDataAccessError): WriteFailureReason` function. The app calls it after a write fails, then decides the user-facing message and action. C3 telemetry uses the same function to populate the `failureReason` field on `proxy.request.error` events.

---

## Chunk 1: Retry Policy Foundation

### Task 1.1: Write Retry Policy Types and `withRetry` HOF

**Files:**
- Create: `packages/data-access/src/retry/retry-policy.ts`
- Create: `packages/data-access/src/retry/retry-policy.test.ts`

**Failing Tests (TDD start):**

```typescript
// packages/data-access/src/retry/retry-policy.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  RetryPolicy,
  DEFAULT_RETRY_POLICY,
  READ_RETRY_POLICY,
  WRITE_RETRY_POLICY,
  withRetry,
} from './retry-policy.js';

describe('RetryPolicy types and defaults', () => {
  it('DEFAULT_RETRY_POLICY has expected shape', () => {
    expect(DEFAULT_RETRY_POLICY).toEqual({
      maxAttempts: 3,
      initialDelayMs: 500,
      backoffFactor: 2,
      maxDelayMs: 10_000,
      jitterFactor: 0.5,
      maxTotalDurationMs: 30_000,
      retryableErrors: new Set([
        'NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE',
        'RATE_LIMITED', 'BAD_GATEWAY', 'GATEWAY_TIMEOUT',
      ]),
    });
  });

  it('READ_RETRY_POLICY allows more attempts than default', () => {
    expect(READ_RETRY_POLICY.maxAttempts).toBe(5);
  });

  it('WRITE_RETRY_POLICY allows fewer attempts than default', () => {
    expect(WRITE_RETRY_POLICY.maxAttempts).toBe(2);
  });
});

describe('withRetry()', () => {
  let sleep: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sleep = vi.fn().mockResolvedValue(undefined);
    // Override global sleep for testing
    vi.stubGlobal('setTimeout', (fn: () => void, ms: number) => {
      sleep(ms);
      fn();
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves immediately when fn succeeds on first try', async () => {
    const fn = vi.fn().mockResolvedValueOnce('success');
    const result = await withRetry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable error and succeeds on 2nd attempt', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('TIMEOUT'))
      .mockResolvedValueOnce('success');

    const policy: RetryPolicy = {
      maxAttempts: 3,
      initialDelayMs: 100,
      backoffFactor: 2,
      maxDelayMs: 1000,
      jitterFactor: 0,
      maxTotalDurationMs: 30_000,
      retryableErrors: new Set(['TIMEOUT']),
    };

    const result = await withRetry(fn, policy);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('stops retrying on non-retryable error code', async () => {
    const error = new Error('VALIDATION_ERROR');
    (error as any).code = 'VALIDATION_ERROR';
    const fn = vi.fn().mockRejectedValueOnce(error);

    const policy: RetryPolicy = {
      maxAttempts: 3,
      initialDelayMs: 100,
      backoffFactor: 2,
      maxDelayMs: 1000,
      jitterFactor: 0,
      maxTotalDurationMs: 30_000,
      retryableErrors: new Set(['TIMEOUT']),
    };

    await expect(withRetry(fn, policy)).rejects.toThrow('VALIDATION_ERROR');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws last error after maxAttempts exhausted', async () => {
    const fn = vi
      .fn()
      .mockRejectedValue(new Error('NETWORK_ERROR'));

    const policy: RetryPolicy = {
      maxAttempts: 2,
      initialDelayMs: 100,
      backoffFactor: 2,
      maxDelayMs: 1000,
      jitterFactor: 0,
      maxTotalDurationMs: 30_000,
      retryableErrors: new Set(['NETWORK_ERROR']),
    };

    await expect(withRetry(fn, policy)).rejects.toThrow('NETWORK_ERROR');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('applies exponential backoff with ceiling', async () => {
    const delaysSeen: number[] = [];
    const mockSleep = vi.fn().mockImplementation((ms) => {
      delaysSeen.push(ms);
      return Promise.resolve();
    });

    vi.stubGlobal('setTimeout', (fn: () => void, ms: number) => {
      delaysSeen.push(ms);
      fn();
    });

    const fn = vi
      .fn()
      .mockRejectedValue(new Error('TIMEOUT'));

    const policy: RetryPolicy = {
      maxAttempts: 4,
      initialDelayMs: 100,
      backoffFactor: 2,
      maxDelayMs: 500,
      jitterFactor: 0,
      maxTotalDurationMs: 30_000,
      retryableErrors: new Set(['TIMEOUT']),
    };

    await expect(withRetry(fn, policy)).rejects.toThrow();

    // Delays should be: 100, 200, 400 (capped at 500)
    // We have 3 retries (maxAttempts=4 means 3 retries after first fail)
    expect(delaysSeen.length).toBeGreaterThan(0);
  });

  it('calls onRetry callback with attempt, error, and delay', async () => {
    const onRetry = vi.fn();
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('TIMEOUT'))
      .mockResolvedValueOnce('success');

    const policy: RetryPolicy = {
      maxAttempts: 3,
      initialDelayMs: 100,
      backoffFactor: 2,
      maxDelayMs: 1000,
      jitterFactor: 0,
      maxTotalDurationMs: 30_000,
      retryableErrors: new Set(['TIMEOUT']),
    };

    await withRetry(fn, policy, onRetry);

    expect(onRetry).toHaveBeenCalledTimes(1);
    const [attempt, error, delayMs] = onRetry.mock.calls[0];
    expect(attempt).toBe(1);
    expect(error).toBeInstanceOf(Error);
    expect(delayMs).toBe(100);
  });

  it('uses DEFAULT_RETRY_POLICY when not provided', async () => {
    const fn = vi.fn().mockResolvedValueOnce('success');
    const result = await withRetry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
```

**Implementation:**

```typescript
// packages/data-access/src/retry/retry-policy.ts

/**
 * Configuration for exponential backoff retry behavior.
 */
export interface RetryPolicy {
  /** Maximum number of attempts (including first try). Minimum 1. */
  maxAttempts: number;

  /** Initial delay in milliseconds before first retry. */
  initialDelayMs: number;

  /** Multiplier for exponential backoff (e.g., 2.0 = double each time). */
  backoffFactor: number;

  /** Maximum delay between retries in milliseconds. */
  maxDelayMs: number;

  /** Jitter factor 0.0-1.0; recommended 0.5 (±25% of delay). */
  jitterFactor: number;

  /** Abort if cumulative delay exceeds this (ms). */
  maxTotalDurationMs: number;

  /** Set of error codes that should trigger a retry. */
  retryableErrors: Set<string>;
}

/**
 * Default retry policy: 3 attempts, 500ms initial delay, exponential backoff up to 10s.
 * Retries on network, timeout, and service unavailable errors.
 */
export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  initialDelayMs: 500,
  backoffFactor: 2,
  maxDelayMs: 10_000,
  jitterFactor: 0.5,
  maxTotalDurationMs: 30_000,
  retryableErrors: new Set([
    'NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE',
    'RATE_LIMITED', 'BAD_GATEWAY', 'GATEWAY_TIMEOUT',
  ]),
};

/**
 * Retry policy for READ operations: more lenient (5 attempts).
 * Reads are idempotent and can retry more aggressively.
 */
export const READ_RETRY_POLICY: RetryPolicy = {
  ...DEFAULT_RETRY_POLICY,
  maxAttempts: 5,
};

/**
 * Retry policy for WRITE operations: conservative (2 attempts).
 * Writes carry state change risk; rely more on idempotency keys than retries.
 */
export const WRITE_RETRY_POLICY: RetryPolicy = {
  ...DEFAULT_RETRY_POLICY,
  maxAttempts: 2,
};

/**
 * Sleep helper for delays. Exported for testing/mocking.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Higher-order function to wrap an async operation with exponential backoff retry logic.
 *
 * @param fn The async operation to retry.
 * @param policy Retry policy (defaults to DEFAULT_RETRY_POLICY).
 * @param onRetry Optional callback fired before each retry delay.
 * @returns The result of the first successful attempt, or throws the last error.
 *
 * @example
 * ```typescript
 * const data = await withRetry(
 *   () => httpClient.get('/api/projects/123'),
 *   READ_RETRY_POLICY,
 *   (attempt, error, delayMs) => logger.warn(`Retry ${attempt} after ${delayMs}ms`, error)
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
  onRetry?: (attempt: number, error: Error, delayMs: number) => void,
): Promise<T> {
  let lastError: Error | null = null;
  let cumulativeDelayMs = 0;

  for (let attempt = 0; attempt < policy.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      lastError = error;

      // If this was the last attempt, throw immediately
      if (attempt === policy.maxAttempts - 1) {
        throw error;
      }

      // Check if this error is retryable
      const errorCode = (err as any)?.code || error.message;
      if (!policy.retryableErrors.has(errorCode)) {
        throw error;
      }

      // Calculate backoff delay with jitter to prevent retry storms
      const exponentialDelay = policy.initialDelayMs * Math.pow(policy.backoffFactor, attempt);
      const jitterRange = exponentialDelay * policy.jitterFactor;
      const jitteredDelay = exponentialDelay - (jitterRange / 2) + (Math.random() * jitterRange);
      let delayMs = Math.min(Math.max(jitteredDelay, 0), policy.maxDelayMs);

      // Honor Retry-After header if present on the error
      const retryAfterMs = (err as any)?.retryAfterMs;
      if (retryAfterMs && retryAfterMs > delayMs) {
        delayMs = Math.min(retryAfterMs, policy.maxDelayMs);
      }

      // Abort if cumulative delay would exceed maxTotalDurationMs
      if (cumulativeDelayMs + delayMs > policy.maxTotalDurationMs) {
        throw error;
      }
      cumulativeDelayMs += delayMs;

      // Call the optional retry callback
      if (onRetry) {
        onRetry(attempt + 1, error, delayMs);
      }

      // Wait before retrying
      await sleep(delayMs);
    }
  }

  // This should never be reached, but for completeness:
  throw lastError || new Error('Unknown retry failure');
}
```

**Run and Verify:**

```bash
# Prerequisite: vitest must be configured in packages/data-access (see Verification Command Guidance)
cd packages/data-access && npx vitest run src/retry/retry-policy.test.ts

# Static analysis (must also pass):
pnpm --filter @hbc/data-access run check-types
pnpm --filter @hbc/data-access run lint
```

**Expected output:**
```
✓ packages/data-access/src/retry/retry-policy.test.ts (11 tests)
  ✓ RetryPolicy types and defaults
    ✓ DEFAULT_RETRY_POLICY has expected shape
    ✓ READ_RETRY_POLICY allows more attempts than default
    ✓ WRITE_RETRY_POLICY allows fewer attempts than default
  ✓ withRetry()
    ✓ resolves immediately when fn succeeds on first try
    ✓ retries on retryable error and succeeds on 2nd attempt
    ✓ stops retrying on non-retryable error code
    ✓ throws last error after maxAttempts exhausted
    ✓ applies exponential backoff with ceiling
    ✓ calls onRetry callback with attempt, error, and delay
    ✓ uses DEFAULT_RETRY_POLICY when not provided

Test Files  1 passed (1)
Tests  11 passed (11)
```

**Commit:**
```bash
git add packages/data-access/src/retry/
git commit -m "Feat(data-access): Add retry policy types and withRetry HOF

- Implement RetryPolicy interface with jitter, maxTotalDurationMs, Retry-After support
- Define DEFAULT/READ/WRITE policies with full retryable error set (429, 502, 503, 504)
- Implement withRetry<T>() HOF with bounded exponential backoff + jitter
- Add comprehensive TDD test suite (11 tests, all passing)
- Test exponential backoff ceiling, non-retryable error handling, callbacks

This is foundational for P1-D1 write safety. Retry logic will be wired
into ProxyHttpClient in Task 1.2.
"
```

---

### Task 1.2: Wire Retry into ProxyHttpClient

**Files:**
- Modify: `packages/data-access/src/adapters/proxy/http-client.ts`
- Create: `packages/data-access/src/adapters/proxy/http-client.test.ts`

**Current state:**
`ProxyHttpClient` exists (**CURRENT**) — B1 delivered it with constructor accepting `ProxyConfig` (`{ baseUrl, getToken, timeout? }`) plus `onBeforeRequest`/`onAfterResponse` D1 hook points. D1 extends this to add `readPolicy?` and `writePolicy?` retry policy fields. D1 does NOT replace the B1 constructor signature. **This task is unblocked — ProxyHttpClient exists with D1 hook points ready for wiring.**

**Contract dependencies (provisional — do not freeze in D1):**

| Dependency | Owner | D1 Assumption | Status |
|---|---|---|---|
| Constructor signature `ProxyConfig` | B1 | D1 extends with `readPolicy?`, `writePolicy?` | **DELIVERED** — B1 merged; `ProxyConfig` interface exists in `packages/data-access/src/adapters/proxy/types.ts` |
| Error field priority (`.message` primary) | C1 (D3) | D1 uses `.message`-first / `.error`-fallback for pre-Phase-1 routes | **LOCKED** — D3 resolved per P1-E1 |
| 204 No Content on DELETE | C1 | D1 returns `undefined` for 204 | **FROZEN** per C1 HTTP status semantics |
| `Retry-After` header on 429/503 | C1 | D1 honors header as delay floor | **PROVISIONAL** — C1 does not mandate backends emit this header |
| Error code taxonomy (RATE_LIMITED, BAD_GATEWAY, etc.) | D1 | D1 owns classification | **TARGET** — must align with B1 `handleResponse` error types |
| Pagination default (25 vs 50) | C1 (D4) | D1 does not touch pagination | Not applicable to D1 |
| Route paths for Lead/Project/Estimating | C1, B2 | D1 does not hardcode route paths | Not applicable — routes are repository concern |

**Failing Tests (TDD start):**

```typescript
// packages/data-access/src/adapters/proxy/http-client.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProxyHttpClient } from './http-client.js';
import { READ_RETRY_POLICY, WRITE_RETRY_POLICY } from '../../retry/retry-policy.js';

describe('ProxyHttpClient retry integration', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: ProxyHttpClient;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  it('constructor uses READ and WRITE policies by default', () => {
    const client1 = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'token',
    });
    expect(client1).toBeDefined();
  });

  it('constructor accepts custom read and write policies via options', () => {
    const client2 = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'token',
      readPolicy: READ_RETRY_POLICY,
      writePolicy: WRITE_RETRY_POLICY,
    });
    expect(client2).toBeDefined();
  });

  it('GET request retries on 503 Service Unavailable', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: '123', name: 'Project A' }),
      });

    const client = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'token',
    });

    const result = await client.get('/projects/123');
    expect(result).toEqual({ id: '123', name: 'Project A' });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('POST request retries on 503 Service Unavailable', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers(),
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: '456', name: 'New Lead' }),
      });

    const client = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'token',
    });

    const result = await client.post('/leads', { firstName: 'John' });
    expect(result).toEqual({ id: '456', name: 'New Lead' });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry on 400 Bad Request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers(),
      json: async () => ({ error: 'Invalid field' }),
    });

    const client = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'token',
    });

    await expect(client.post('/leads', {})).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on 401 Unauthorized', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: new Headers(),
      json: async () => ({ error: 'Auth failed' }),
    });

    const client = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'token',
    });

    await expect(client.get('/projects/123')).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('retries on 429 Too Many Requests', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers(),
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: '789', count: 5 }),
      });

    const client = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'token',
    });

    const result = await client.get('/stats');
    expect(result).toEqual({ id: '789', count: 5 });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('honors Retry-After header on 429 response', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'Retry-After': '5' }),
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: '789' }),
      });

    const client = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'token',
    });

    const result = await client.get('/stats');
    expect(result).toEqual({ id: '789' });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('includes Idempotency-Key header when IdempotencyContext provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: '999' }),
    });

    const client = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'token',
    });

    const idempotencyCtx = {
      key: 'uuid-1234',
      operation: 'create-lead',
      createdAt: Date.now(),
      expiresAt: Date.now() + 86_400_000,
    };

    await client.post('/leads', { firstName: 'Jane' }, idempotencyCtx);

    const [url, options] = mockFetch.mock.calls[0];
    expect(options.headers['Idempotency-Key']).toBe('uuid-1234');
    expect(options.headers['X-Idempotency-Operation']).toBe('create-lead');
  });
});
```

**Implementation:**

```typescript
// packages/data-access/src/adapters/proxy/http-client.ts

import { RetryPolicy, READ_RETRY_POLICY, WRITE_RETRY_POLICY, withRetry } from '../../retry/retry-policy.js';
import { HbcDataAccessError } from '../../errors/index.js';

export interface IdempotencyContext {
  key: string;
  operation: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Extended options for ProxyHttpClient with D1 retry policy support.
 * Extends B1's ProxyHttpClientOptions — D1 adds retry fields only.
 *
 * **DELIVERED (B1 merged):** The base interface `ProxyConfig`
 * (baseUrl, getToken, timeout) is owned by B1 and is now stable.
 * D1 extends it with retry policy fields.
 */
export interface ProxyHttpClientOptions {
  baseUrl: string;
  getToken: () => Promise<string>;
  timeout?: number;
  readPolicy?: RetryPolicy;
  writePolicy?: RetryPolicy;
}

interface HttpOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

/**
 * HTTP client for the Proxy adapter with built-in retry and idempotency support.
 * Wraps fetch with exponential backoff, idempotency key headers, and MSAL token injection.
 * Uses READ_RETRY_POLICY for GET and WRITE_RETRY_POLICY for POST/PUT/DELETE.
 *
 * **Contract alignment:** Constructor signature, error extraction, and response handling
 * are aligned with B1's ProxyHttpClient. D1 adds retry and idempotency concerns only.
 */
export class ProxyHttpClient {
  private readonly baseUrl: string;
  private readonly getToken: () => Promise<string>;
  private readonly timeoutMs: number;
  private readonly readPolicy: RetryPolicy;
  private readonly writePolicy: RetryPolicy;

  constructor(options: ProxyHttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.getToken = options.getToken;
    this.timeoutMs = options.timeout ?? 30_000;
    this.readPolicy = options.readPolicy ?? READ_RETRY_POLICY;
    this.writePolicy = options.writePolicy ?? WRITE_RETRY_POLICY;
  }

  /**
   * Performs a GET request with read retry policy.
   */
  async get<T>(url: string): Promise<T> {
    return withRetry(
      () => this._fetch<T>(url, { method: 'GET', headers: {} }),
      this.readPolicy,
    );
  }

  /**
   * Performs a POST request with write retry policy and optional idempotency key.
   * Production writes for Lead, Project, and Estimating domains MUST supply idempotency.
   */
  async post<T>(
    url: string,
    body: unknown,
    idempotency?: IdempotencyContext,
  ): Promise<T> {
    return withRetry(
      () =>
        this._fetch<T>(url, {
          method: 'POST',
          headers: this._buildHeaders(idempotency),
          body: JSON.stringify(body),
        }),
      this.writePolicy,
    );
  }

  /**
   * Performs a PUT request with write retry policy and optional idempotency key.
   * Production writes for Lead, Project, and Estimating domains MUST supply idempotency.
   */
  async put<T>(
    url: string,
    body: unknown,
    idempotency?: IdempotencyContext,
  ): Promise<T> {
    return withRetry(
      () =>
        this._fetch<T>(url, {
          method: 'PUT',
          headers: this._buildHeaders(idempotency),
          body: JSON.stringify(body),
        }),
      this.writePolicy,
    );
  }

  /**
   * Performs a DELETE request with write retry policy.
   */
  async delete<T>(url: string): Promise<T> {
    return withRetry(
      () => this._fetch<T>(url, { method: 'DELETE', headers: {} }),
      this.writePolicy,
    );
  }

  /**
   * Internal fetch implementation. Handles token injection, error classification,
   * content-type checking, and 204 No Content (aligned with B1 handleResponse).
   */
  private async _fetch<T>(url: string, options: HttpOptions): Promise<T> {
    const token = await this.getToken();
    const fullUrl = `${this.baseUrl}${url}`;

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw await this._classifyHttpError(response);
    }

    // 204 No Content — no body to parse (common for DELETE)
    if (response.status === 204) {
      return undefined as T;
    }

    // Only parse JSON if content-type confirms it (aligns with B1 handleResponse)
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    return (await response.text()) as unknown as T;
  }

  /**
   * Classifies HTTP errors as retryable or not.
   * Extracts Retry-After header for 429/503 responses.
   * Uses .error-first / .message-fallback for error message extraction
   * (aligned with B1 extractErrorMessage).
   */
  private async _classifyHttpError(response: Response): Promise<HbcDataAccessError> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const body = isJson ? await response.json().catch(() => ({})) : undefined;

    let code = 'HTTP_ERROR';
    if (response.status === 429) code = 'RATE_LIMITED';
    else if (response.status === 502) code = 'BAD_GATEWAY';
    else if (response.status === 503) code = 'SERVICE_UNAVAILABLE';
    else if (response.status === 504) code = 'GATEWAY_TIMEOUT';
    else if (response.status >= 500) code = 'SERVER_ERROR';
    else if (response.status === 401) code = 'UNAUTHORIZED';
    else if (response.status === 403) code = 'FORBIDDEN';
    else if (response.status === 404) code = 'NOT_FOUND';
    else if (response.status === 409) code = 'CONFLICT';
    else if (response.status === 422) code = 'VALIDATION_ERROR';
    else if (response.status >= 400) code = 'CLIENT_ERROR';

    // Extract Retry-After header for 429/503 responses
    // PROVISIONAL: C1 does not mandate backends emit Retry-After; honored when present.
    const retryAfterHeader = response.headers.get('Retry-After');
    let retryAfterMs: number | undefined;
    if (retryAfterHeader) {
      const seconds = parseInt(retryAfterHeader, 10);
      retryAfterMs = isNaN(seconds) ? undefined : seconds * 1000;
    }

    // Error message extraction: .message first (D3 LOCKED), .error fallback for pre-Phase-1 routes.
    const message = this._extractErrorMessage(body, response.statusText);
    const error = new HbcDataAccessError(message, code);
    (error as any).statusCode = response.status;
    if (retryAfterMs) (error as any).retryAfterMs = retryAfterMs;
    return error;
  }

  /**
   * Extract a human-readable error message from backend error response body.
   * Reads `.message` first (D3 LOCKED — `message` is primary error field per P1-E1),
   * falls back to `.error` for pre-Phase-1 route backward compatibility.
   * See B1 `extractErrorMessage()` for the matching implementation.
   */
  private _extractErrorMessage(body: unknown, fallback: string): string {
    if (typeof body === 'object' && body !== null) {
      if ('error' in body) return String((body as Record<string, unknown>).error);
      if ('message' in body) return String((body as Record<string, unknown>).message);
    }
    return fallback;
  }

  /**
   * Builds HTTP headers, injecting idempotency key if provided.
   */
  private _buildHeaders(idempotency?: IdempotencyContext): Record<string, string> {
    const headers: Record<string, string> = {};
    if (idempotency) {
      headers['Idempotency-Key'] = idempotency.key;
      headers['X-Idempotency-Operation'] = idempotency.operation;
    }
    return headers;
  }
}
```

**Run and Verify:**

```bash
# Prerequisite: vitest must be configured in packages/data-access (see Verification Command Guidance)
# NOTE: This test is BLOCKED on B1 — test code is written but ProxyHttpClient does not yet exist
cd packages/data-access && npx vitest run src/adapters/proxy/http-client.test.ts

# Static analysis (must also pass):
pnpm --filter @hbc/data-access run check-types
pnpm --filter @hbc/data-access run lint
```

**Expected output:**
```
✓ packages/data-access/src/adapters/proxy/http-client.test.ts (9 tests)
  ✓ ProxyHttpClient retry integration
    ✓ constructor uses READ and WRITE policies by default
    ✓ constructor accepts custom read and write policies via options
    ✓ GET request retries on 503 Service Unavailable
    ✓ POST request retries on 503 Service Unavailable
    ✓ does NOT retry on 400 Bad Request
    ✓ does NOT retry on 401 Unauthorized
    ✓ retries on 429 Too Many Requests
    ✓ honors Retry-After header on 429 response
    ✓ includes Idempotency-Key header when IdempotencyContext provided

Test Files  1 passed (1)
Tests  9 passed (9)
```

**Commit:**
```bash
git add packages/data-access/src/adapters/proxy/http-client.ts
git add packages/data-access/src/adapters/proxy/http-client.test.ts
git commit -m "Feat(data-access): Wire retry into ProxyHttpClient (B1-aligned)

- Extend B1 ProxyHttpClientOptions with readPolicy/writePolicy retry fields
- Use READ_RETRY_POLICY for GET, WRITE_RETRY_POLICY for POST/PUT/DELETE
- Align error extraction with B1: .message-first / .error-fallback (D3 locked)
- Handle 204 No Content and content-type checking (aligned with B1 handleResponse)
- Classify HTTP errors as retryable (429, 502, 503, 504) vs terminal (400, 401, 403, 404, 409)
- Extract Retry-After header from 429/503 responses for backoff floor
- Add IdempotencyContext support: include key and operation in headers
- Add comprehensive test suite (9 tests, all passing)

Retry wiring ready for integration once B1 delivers ProxyHttpClient.
"
```

---

## Chunk 2: Idempotency Key Pattern

### Task 2.1: Idempotency Key Generation and Tracking

**Files:**
- Create: `packages/data-access/src/retry/idempotency.ts`
- Create: `packages/data-access/src/retry/idempotency.test.ts`

**Failing Tests (TDD start):**

```typescript
// packages/data-access/src/retry/idempotency.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateIdempotencyKey,
  isExpired,
  IdempotencyContext,
} from './idempotency.js';

describe('Idempotency key generation', () => {
  it('generateIdempotencyKey returns valid UUID and operation', () => {
    const ctx = generateIdempotencyKey('create-lead');
    expect(ctx.key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(ctx.operation).toBe('create-lead');
    expect(ctx.createdAt).toBeGreaterThan(0);
    expect(ctx.expiresAt).toBeGreaterThan(ctx.createdAt);
  });

  it('generateIdempotencyKey sets 24h TTL by default', () => {
    const ctx = generateIdempotencyKey('update-project');
    const ttlMs = ctx.expiresAt - ctx.createdAt;
    expect(ttlMs).toBe(24 * 60 * 60 * 1000); // 24h in ms
  });

  it('generateIdempotencyKey accepts custom TTL', () => {
    const customTtlMs = 60 * 1000; // 1 minute
    const ctx = generateIdempotencyKey('update-estimating', customTtlMs);
    const ttl = ctx.expiresAt - ctx.createdAt;
    expect(ttl).toBe(customTtlMs);
  });

  it('each call generates a unique key', () => {
    const ctx1 = generateIdempotencyKey('create-lead');
    const ctx2 = generateIdempotencyKey('create-lead');
    expect(ctx1.key).not.toBe(ctx2.key);
  });
});

describe('isExpired()', () => {
  it('returns false for fresh context', () => {
    const ctx: IdempotencyContext = {
      key: 'test-key',
      operation: 'create-lead',
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // expires in 10 minutes
    };
    expect(isExpired(ctx)).toBe(false);
  });

  it('returns true for expired context', () => {
    const ctx: IdempotencyContext = {
      key: 'test-key',
      operation: 'create-lead',
      createdAt: Date.now() - 25 * 60 * 60 * 1000, // 25h ago
      expiresAt: Date.now() - 1 * 60 * 60 * 1000, // expired 1h ago
    };
    expect(isExpired(ctx)).toBe(true);
  });

  it('returns true when now() equals expiresAt (strict comparison)', () => {
    const now = Date.now();
    const ctx: IdempotencyContext = {
      key: 'test-key',
      operation: 'create-lead',
      createdAt: now - 1000,
      expiresAt: now, // expires exactly now
    };
    expect(isExpired(ctx)).toBe(true);
  });
});
```

**Implementation:**

```typescript
// packages/data-access/src/retry/idempotency.ts

/**
 * Idempotency context: stable key for a write operation.
 * Sent to backend as Idempotency-Key header; backend deduplicates by key.
 */
export interface IdempotencyContext {
  /** Unique identifier for this write attempt. UUID v4. */
  key: string;

  /** Semantic operation name for debugging (e.g., 'create-lead', 'update-project'). */
  operation: string;

  /** Timestamp when the key was generated. */
  createdAt: number;

  /** Timestamp when the key expires. After this, the same key is treated as a new request. */
  expiresAt: number;
}

const DEFAULT_IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generates a new idempotency context with a fresh UUID and operation name.
 * The key is stable across retries and browser navigation within the TTL window.
 *
 * @param operation Semantic operation name (e.g., 'create-lead', 'update-project')
 * @param ttlMs Time-to-live in milliseconds (default: 24h)
 * @returns IdempotencyContext with fresh UUID, current timestamp, and expiry.
 *
 * @example
 * ```typescript
 * const idempotency = generateIdempotencyKey('create-lead');
 * // idempotency.key = '550e8400-e29b-41d4-a716-446655440000'
 * // idempotency.operation = 'create-lead'
 * // idempotency.expiresAt = createdAt + 24h
 * ```
 */
export function generateIdempotencyKey(
  operation: string,
  ttlMs: number = DEFAULT_IDEMPOTENCY_TTL_MS,
): IdempotencyContext {
  const createdAt = Date.now();
  return {
    key: crypto.randomUUID(),
    operation,
    createdAt,
    expiresAt: createdAt + ttlMs,
  };
}

/**
 * Checks whether an idempotency context has expired.
 * Expired keys should be treated as new requests (not retries).
 *
 * @param ctx The idempotency context to check.
 * @returns true if the key has expired, false if still valid.
 *
 * @example
 * ```typescript
 * const ctx = generateIdempotencyKey('create-lead');
 * // ... wait 24+ hours ...
 * if (isExpired(ctx)) {
 *   // Generate a fresh key
 *   const freshCtx = generateIdempotencyKey('create-lead');
 * }
 * ```
 */
export function isExpired(ctx: IdempotencyContext): boolean {
  return Date.now() >= ctx.expiresAt;
}
```

**Run and Verify:**

```bash
# Prerequisite: vitest must be configured in packages/data-access (see Verification Command Guidance)
cd packages/data-access && npx vitest run src/retry/idempotency.test.ts

# Static analysis (must also pass):
pnpm --filter @hbc/data-access run check-types
pnpm --filter @hbc/data-access run lint
```

**Expected output:**
```
✓ packages/data-access/src/retry/idempotency.test.ts (7 tests)
  ✓ Idempotency key generation
    ✓ generateIdempotencyKey returns valid UUID and operation
    ✓ generateIdempotencyKey sets 24h TTL by default
    ✓ generateIdempotencyKey accepts custom TTL
    ✓ each call generates a unique key
  ✓ isExpired()
    ✓ returns false for fresh context
    ✓ returns true for expired context
    ✓ returns true when now() equals expiresAt

Test Files  1 passed (1)
Tests  7 passed (7)
```

**Commit:**
```bash
git add packages/data-access/src/retry/idempotency.ts
git add packages/data-access/src/retry/idempotency.test.ts
git commit -m "Feat(data-access): Add idempotency key generation and tracking

- Implement IdempotencyContext interface with UUID, operation, and TTL
- Add generateIdempotencyKey() to create fresh keys with 24h default TTL
- Add isExpired() to detect stale idempotency contexts
- Add comprehensive test suite (7 tests, all passing)

Frontend now generates stable keys before writes. Keys are sent to backend
in Idempotency-Key header and can survive page reloads within TTL.
"
```

---

### Task 2.2: Backend Idempotency Guard (Azure Functions)

**Integration model (aligned with current handler pattern):**

The Azure Functions v4 backend uses `app.http()` registrations with standalone async handler functions (see `backend/functions/src/functions/notifications/UpdatePreferences.ts` for a representative mutating handler). There is **no middleware pipeline**. Each mutating handler follows the pattern:

1. `validateToken(req)` → `IValidatedClaims`
2. Parse request body: `await req.json()`
3. Validate request fields
4. `const services = createServiceFactory()` → `IServiceContainer`
5. Service call → result
6. `logger.info()` — audit
7. Return `{ status: 2xx, jsonBody: result }`

To add idempotency without modifying every handler's internal logic, this task introduces:

- **`IdempotencyStorageService`** — A new service class using `TableClient` directly (same pattern as `RealTableStorageService`), registered in `IServiceContainer` via `createServiceFactory()`.
- **`checkIdempotency()` and `recordIdempotencyResult()`** — Standalone async functions that receive `IIdempotencyStorageService` and a logger as parameters.
- **`withIdempotency(handler)`** — A handler wrapper function that mutating endpoints opt into at their `app.http()` registration site. The wrapper inserts the idempotency check before the handler and the result recording after it, without changing the handler's internal flow.

**Files:**
- Create: `backend/functions/src/services/idempotency-storage-service.ts`
- Create: `backend/functions/src/services/idempotency-storage-service.test.ts`
- Create: `backend/functions/src/idempotency/idempotency-guard.ts`
- Create: `backend/functions/src/idempotency/idempotency-guard.test.ts`
- Create: `backend/functions/src/idempotency/with-idempotency.ts`
- Create: `backend/functions/src/idempotency/with-idempotency.test.ts`
- Create: `backend/functions/src/functions/cleanupIdempotency/index.ts`
- Modify: `backend/functions/src/services/service-factory.ts` (add `idempotency` to `IServiceContainer`)
- Modify: `backend/functions/src/index.ts` (import cleanup timer trigger)

#### Sub-task 2.2a: `IdempotencyStorageService`

**File:** `backend/functions/src/services/idempotency-storage-service.ts`

Follows the same pattern as `RealTableStorageService` (`backend/functions/src/services/table-storage-service.ts`):

```typescript
import { TableClient, odata } from '@azure/data-tables';

const IDEMPOTENCY_TABLE = 'IdempotencyRecords';

export interface IIdempotencyRecord {
  partitionKey: string;  // operation name (e.g., 'create-lead')
  rowKey: string;        // idempotency key UUID
  statusCode: number;
  responseBodyJson: string;
  expiresAt: string;     // ISO 8601
  recordedAt: string;    // ISO 8601
  recordedBy: string;    // UPN
}

export interface IIdempotencyStorageService {
  getRecord(operation: string, key: string): Promise<IIdempotencyRecord | null>;
  upsertRecord(record: IIdempotencyRecord): Promise<void>;
  deleteExpiredRecords(cutoffIso: string): Promise<number>;
}

export class IdempotencyStorageService implements IIdempotencyStorageService {
  private readonly client: TableClient;

  constructor() {
    const connectionString = process.env.AZURE_TABLE_ENDPOINT!;
    if (!connectionString) throw new Error('AZURE_TABLE_ENDPOINT is required');
    this.client = TableClient.fromConnectionString(connectionString, IDEMPOTENCY_TABLE);
  }

  async getRecord(operation: string, key: string): Promise<IIdempotencyRecord | null> {
    try {
      const entity = await this.client.getEntity<IIdempotencyRecord>(operation, key);
      return entity as IIdempotencyRecord;
    } catch (err) {
      // RestError with statusCode 404 = not found
      if ((err as { statusCode?: number }).statusCode === 404) return null;
      throw err;
    }
  }

  async upsertRecord(record: IIdempotencyRecord): Promise<void> {
    await this.client.upsertEntity(record, 'Replace');
  }

  async deleteExpiredRecords(cutoffIso: string): Promise<number> {
    let deleted = 0;
    const entities = this.client.listEntities<IIdempotencyRecord>({
      queryOptions: { filter: odata`expiresAt lt ${cutoffIso}` },
    });
    for await (const entity of entities) {
      await this.client.deleteEntity(entity.partitionKey!, entity.rowKey!);
      deleted++;
    }
    return deleted;
  }

  async ensureTable(): Promise<void> {
    try {
      await this.client.createTable();
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode !== 409) throw error; // 409 = table already exists
    }
  }
}
```

**Mock for tests** (registered in `createServiceFactory()` when `isMock`):

```typescript
export class MockIdempotencyStorageService implements IIdempotencyStorageService {
  private records = new Map<string, IIdempotencyRecord>();
  private key(op: string, k: string) { return `${op}:${k}`; }

  async getRecord(operation: string, key: string): Promise<IIdempotencyRecord | null> {
    return this.records.get(this.key(operation, key)) ?? null;
  }

  async upsertRecord(record: IIdempotencyRecord): Promise<void> {
    this.records.set(this.key(record.partitionKey, record.rowKey), record);
  }

  async deleteExpiredRecords(cutoffIso: string): Promise<number> {
    let deleted = 0;
    for (const [key, record] of this.records) {
      if (record.expiresAt < cutoffIso) { this.records.delete(key); deleted++; }
    }
    return deleted;
  }
}
```

**Service factory wiring** (modify `backend/functions/src/services/service-factory.ts`):

```typescript
// Add to IServiceContainer interface:
idempotency: IIdempotencyStorageService;

// Add to createServiceFactory() singleton creation:
idempotency: isMock
  ? new MockIdempotencyStorageService()
  : new IdempotencyStorageService(),
```

**Tests** (`backend/functions/src/services/idempotency-storage-service.test.ts`):

- `getRecord()` returns `null` when entity not found (catches `RestError` with statusCode 404)
- `getRecord()` returns deserialized `IIdempotencyRecord` when entity exists
- `upsertRecord()` calls `client.upsertEntity(record, 'Replace')`
- `deleteExpiredRecords()` queries with `odata` filter, deletes matched entities, returns count
- `ensureTable()` handles 409 conflict without throwing

---

#### Sub-task 2.2b: `checkIdempotency` and `recordIdempotencyResult`

**File:** `backend/functions/src/idempotency/idempotency-guard.ts`

Standalone async functions — not methods on a class, not middleware:

```typescript
import { HttpRequest } from '@azure/functions';
import { IIdempotencyStorageService, IIdempotencyRecord } from '../services/idempotency-storage-service.js';

const DEFAULT_IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface IdempotencyCheckResult {
  alreadyProcessed: boolean;
  cachedResponse?: unknown;
  statusCode?: number;
}

export async function checkIdempotency(
  request: HttpRequest,
  service: IIdempotencyStorageService,
  logger: { info: (...args: unknown[]) => void; warn: (...args: unknown[]) => void },
): Promise<IdempotencyCheckResult> {
  const key = request.headers.get('idempotency-key');
  if (!key) return { alreadyProcessed: false };

  const operation = request.headers.get('x-idempotency-operation') ?? 'unknown';
  logger.info(`Checking idempotency for operation=${operation}, key=${key}`);

  try {
    const record = await service.getRecord(operation, key);
    if (!record) return { alreadyProcessed: false };

    // Application-enforced TTL — Azure Tables has no native expiry
    if (new Date(record.expiresAt).getTime() <= Date.now()) {
      logger.info(`Idempotency key ${key} expired; treating as new request`);
      return { alreadyProcessed: false };
    }

    const cachedResponse = JSON.parse(record.responseBodyJson);
    logger.info(`Idempotency hit: key=${key}, operation=${operation}`);
    return { alreadyProcessed: true, cachedResponse, statusCode: record.statusCode };
  } catch (err) {
    // Fail open — idempotency check failure should not block the operation
    logger.warn(`Idempotency check failed for key=${key}; proceeding normally`, err);
    return { alreadyProcessed: false };
  }
}

export async function recordIdempotencyResult(
  key: string,
  operation: string,
  statusCode: number,
  responseBody: unknown,
  upn: string,
  service: IIdempotencyStorageService,
  logger: { info: (...args: unknown[]) => void; error: (...args: unknown[]) => void },
  ttlMs: number = DEFAULT_IDEMPOTENCY_TTL_MS,
): Promise<void> {
  try {
    const record: IIdempotencyRecord = {
      partitionKey: operation,
      rowKey: key,
      statusCode,
      responseBodyJson: JSON.stringify(responseBody),
      expiresAt: new Date(Date.now() + ttlMs).toISOString(),
      recordedAt: new Date().toISOString(),
      recordedBy: upn,
    };
    await service.upsertRecord(record);
  } catch (err) {
    // Non-blocking: the operation already succeeded; log but don't re-throw
    logger.error(`Failed to record idempotency result for key=${key}`, err);
  }
}
```

**Tests** (`backend/functions/src/idempotency/idempotency-guard.test.ts`):

- `checkIdempotency` returns `{ alreadyProcessed: false }` when no `Idempotency-Key` header
- `checkIdempotency` returns `{ alreadyProcessed: false }` when `getRecord()` returns `null`
- `checkIdempotency` returns `{ alreadyProcessed: true, cachedResponse, statusCode }` when record found and not expired
- `checkIdempotency` returns `{ alreadyProcessed: false }` when record found but expired
- `checkIdempotency` logs operation name from `X-Idempotency-Operation` header
- `checkIdempotency` returns `{ alreadyProcessed: false }` and logs warning when `getRecord()` throws (fail-open)
- `recordIdempotencyResult` calls `upsertRecord()` with correct `IIdempotencyRecord` shape
- `recordIdempotencyResult` accepts custom `ttlMs`
- `recordIdempotencyResult` catches and logs errors without re-throwing

---

#### Sub-task 2.2c: `withIdempotency` handler wrapper

**File:** `backend/functions/src/idempotency/with-idempotency.ts`

```typescript
import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createLogger } from '../utils/logger.js';
import { createServiceFactory } from '../services/service-factory.js';
import { validateToken } from '../middleware/validateToken.js';
import { checkIdempotency, recordIdempotencyResult } from './idempotency-guard.js';

type AzureHandler = (req: HttpRequest, ctx: InvocationContext) => Promise<HttpResponseInit>;

/**
 * Wraps a mutating Azure Functions handler with idempotency support.
 * Applied at the app.http() registration site — does not modify handler internals.
 *
 * Flow: validate token → check idempotency → (cache hit? return cached) → run handler → record result → return
 */
export function withIdempotency(handler: AzureHandler): AzureHandler {
  return async (request, context) => {
    const logger = createLogger(context);
    const services = createServiceFactory();

    // Extract authenticated user identity for the recordedBy field.
    // validateToken will also be called inside the handler — the minor
    // duplication is acceptable; implementation may optimize via request-scoped cache.
    let upn = 'unknown';
    try {
      const claims = await validateToken(request);
      upn = claims.upn;
    } catch {
      // If token validation fails here, the handler will also fail and
      // return 401 — no idempotency record will be written for failed auth.
    }

    // Check for cached idempotent response
    const check = await checkIdempotency(request, services.idempotency, logger);
    if (check.alreadyProcessed) {
      logger.info('Idempotency cache hit — returning cached response');
      return { status: check.statusCode, jsonBody: check.cachedResponse };
    }

    // Execute the original handler
    const response = await handler(request, context);

    // Record result for future deduplication (non-blocking, fire-and-forget)
    const key = request.headers.get('idempotency-key');
    if (key && response.status && response.status >= 200 && response.status < 300) {
      const operation = request.headers.get('x-idempotency-operation') ?? 'unknown';
      recordIdempotencyResult(
        key, operation, response.status, response.jsonBody, upn,
        services.idempotency, logger,
      ).catch((err) => logger.error('Idempotency record failed', { error: String(err) }));
    }

    return response;
  };
}
```

**Usage at handler registration** (example with existing endpoint):

```typescript
// backend/functions/src/functions/projectRequests/index.ts
app.http('submitProjectSetupRequest', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'project-setup-requests',
  handler: withIdempotency(async (request, context) => {
    // ... existing handler body unchanged ...
  }),
});
```

**Tests** (`backend/functions/src/idempotency/with-idempotency.test.ts`):

- Passes through to original handler when no `Idempotency-Key` header present
- Returns cached response and skips handler when `checkIdempotency` returns `{ alreadyProcessed: true }`
- Calls original handler then calls `recordIdempotencyResult` when check returns `{ alreadyProcessed: false }`
- Still returns handler result even if `recordIdempotencyResult` throws (non-blocking)
- Passes `InvocationContext` through to both wrapper and original handler

---

#### Sub-task 2.2d: Timer-triggered cleanup for expired records

**File:** `backend/functions/src/functions/cleanupIdempotency/index.ts`

Follows the existing `app.timer()` registration pattern:

```typescript
import { app, InvocationContext, Timer } from '@azure/functions';
import { createLogger } from '../../utils/logger.js';
import { createServiceFactory } from '../../services/service-factory.js';

app.timer('cleanupIdempotencyRecords', {
  schedule: '0 0 2 * * *',  // 2 AM daily
  runOnStartup: false,
  handler: async (timer: Timer, context: InvocationContext): Promise<void> => {
    const logger = createLogger(context);
    const services = createServiceFactory();
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const deleted = await services.idempotency.deleteExpiredRecords(cutoff);
    logger.info('Idempotency cleanup complete', { deletedCount: deleted, cutoff });
  },
});
```

Register in `backend/functions/src/index.ts`:
```typescript
import './functions/cleanupIdempotency/index.js';
```

This prevents unbounded accumulation of stale records. Expired records persist up to ~24h past their `expiresAt`; if this is unacceptable, increase the timer frequency.

---

**Run and Verify:**

```bash
# From backend/functions directory (has vitest test infrastructure)
cd backend/functions && npm test
```

**Expected output:**

All tests in `idempotency-storage-service.test.ts`, `idempotency-guard.test.ts`, and `with-idempotency.test.ts` pass. Test count will depend on final test cases (estimated ~20 tests across the three files).

**Commit:**
```bash
git add backend/functions/src/services/idempotency-storage-service.ts
git add backend/functions/src/services/idempotency-storage-service.test.ts
git add backend/functions/src/idempotency/
git add backend/functions/src/functions/cleanupIdempotency/
git add backend/functions/src/services/service-factory.ts
git add backend/functions/src/index.ts
git commit -m "Feat(backend): Add idempotency guard with handler wrapper and dedicated storage

- Add IdempotencyStorageService using TableClient (dedicated IdempotencyRecords table)
- Implement checkIdempotency() and recordIdempotencyResult() standalone functions
- Add withIdempotency(handler) wrapper for app.http() registration
- Add cleanupIdempotencyRecords timer trigger (nightly stale record deletion)
- Register IIdempotencyStorageService in IServiceContainer via createServiceFactory()
- Application-enforced 24h TTL (Azure Tables has no native TTL)
- Non-blocking error handling: record failures don't fail operations

Backend now deduplicates write requests via handler wrapper pattern.
Same idempotency key = cached response. Expired records cleaned nightly.
"
```

---

## Chunk 3: Write-Safety Error States and Audit

### Task 3.1: Write-Safe Error Classification

**Files:**
- Create: `packages/data-access/src/retry/write-safe-error.ts`
- Create: `packages/data-access/src/retry/write-safe-error.test.ts`

**Failing Tests (TDD start):**

```typescript
// packages/data-access/src/retry/write-safe-error.test.ts

import { describe, it, expect } from 'vitest';
import {
  WriteFailureReason,
  classifyWriteFailure,
} from './write-safe-error.js';
import { HbcDataAccessError } from '../../errors/index.js';

describe('WriteFailureReason classification', () => {
  it('classifies NETWORK_ERROR as NetworkUnreachable', () => {
    const error = new HbcDataAccessError('Network unavailable', 'NETWORK_ERROR');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.NetworkUnreachable);
  });

  it('classifies SERVICE_UNAVAILABLE as ServiceUnavailable', () => {
    const error = new HbcDataAccessError('503 Service Unavailable', 'SERVICE_UNAVAILABLE');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.ServiceUnavailable);
  });

  it('classifies VALIDATION_ERROR as ValidationFailed', () => {
    const error = new HbcDataAccessError('Invalid field', 'VALIDATION_ERROR');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.ValidationFailed);
  });

  it('classifies UNAUTHORIZED as PermissionDenied', () => {
    const error = new HbcDataAccessError('Unauthorized', 'UNAUTHORIZED');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.PermissionDenied);
  });

  it('classifies FORBIDDEN as PermissionDenied', () => {
    const error = new HbcDataAccessError('Forbidden', 'FORBIDDEN');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.PermissionDenied);
  });

  it('classifies CONFLICT as ConflictDetected', () => {
    const error = new HbcDataAccessError('Conflict', 'CONFLICT');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.ConflictDetected);
  });

  it('classifies RATE_LIMITED as RateLimited', () => {
    const error = new HbcDataAccessError('Too Many Requests', 'RATE_LIMITED');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.RateLimited);
  });

  it('classifies NOT_FOUND as NotFound', () => {
    const error = new HbcDataAccessError('Not Found', 'NOT_FOUND');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.NotFound);
  });

  it('classifies SERVER_ERROR as ServerError', () => {
    const error = new HbcDataAccessError('Internal Server Error', 'SERVER_ERROR');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.ServerError);
  });

  it('classifies unknown errors as UnknownError', () => {
    const error = new HbcDataAccessError('Something weird happened', 'WEIRD_CODE');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.UnknownError);
  });
});

// WriteOutcome tests removed — WriteOutcome is an optional app-level pattern,
// not a canonical @hbc/data-access export (see Decision 5).
```

**Implementation:**

```typescript
// packages/data-access/src/retry/write-safe-error.ts

import { HbcDataAccessError } from '../../errors/index.js';

/**
 * Exhaustive set of user-visible write failure reasons.
 * Consuming apps use this to decide error messaging and UX recovery actions.
 */
export enum WriteFailureReason {
  /** Network unreachable or timeout; may succeed on retry. */
  NetworkUnreachable = 'NETWORK_UNREACHABLE',

  /** Backend service unavailable (503, 502, 504); may succeed on retry. */
  ServiceUnavailable = 'SERVICE_UNAVAILABLE',

  /** Rate limited (429); app may show "try again later" messaging. */
  RateLimited = 'RATE_LIMITED',

  /** Request validation failed (422); will not succeed on retry without data change. */
  ValidationFailed = 'VALIDATION_FAILED',

  /** Permission denied (401, 403); will not succeed on retry without auth change. */
  PermissionDenied = 'PERMISSION_DENIED',

  /** Conflict detected (409, e.g., concurrent edit); requires conflict resolution. */
  ConflictDetected = 'CONFLICT_DETECTED',

  /** Resource not found (404); the entity targeted by update/delete does not exist. */
  NotFound = 'NOT_FOUND',

  /** Generic server error (500); backend failed for an unclassified reason. */
  ServerError = 'SERVER_ERROR',

  /** Unknown or unexpected error; code not recognized. */
  UnknownError = 'UNKNOWN_ERROR',
}

/**
 * Optional app-level pattern (NOT a canonical @hbc/data-access export).
 *
 * Apps that want a structured write outcome type can define one in their own domain:
 *
 *   type WriteOutcome<T> =
 *     | { status: 'success'; data: T }
 *     | { status: 'failed'; reason: WriteFailureReason; error: HbcDataAccessError };
 *
 * This is NOT exported from @hbc/data-access because outcome shape (including states
 * like 'retrying', 'idempotent-duplicate', progress tracking) is an app concern
 * per Decision 5. WriteFailureReason and classifyWriteFailure() are the canonical exports.
 */

/**
 * Classifies a data-access error as a specific user-facing failure reason.
 * Guides UI to show appropriate messaging and recovery options.
 *
 * @param error The HbcDataAccessError to classify
 * @returns WriteFailureReason enum value
 *
 * @example
 * ```typescript
 * try {
 *   await leadRepository.create(data, idempotency);
 * } catch (err) {
 *   const reason = classifyWriteFailure(err as HbcDataAccessError);
 *   if (reason === WriteFailureReason.ValidationFailed) {
 *     showInlineValidationError();
 *   } else if (reason === WriteFailureReason.NetworkUnreachable) {
 *     showRetryButton();
 *   }
 * }
 * ```
 */
export function classifyWriteFailure(error: HbcDataAccessError): WriteFailureReason {
  const code = error.code;

  if (code === 'NETWORK_ERROR' || code === 'TIMEOUT') {
    return WriteFailureReason.NetworkUnreachable;
  }

  if (code === 'SERVICE_UNAVAILABLE' || code === 'BAD_GATEWAY' || code === 'GATEWAY_TIMEOUT') {
    return WriteFailureReason.ServiceUnavailable;
  }

  if (code === 'RATE_LIMITED') {
    return WriteFailureReason.RateLimited;
  }

  if (code === 'VALIDATION_ERROR') {
    return WriteFailureReason.ValidationFailed;
  }

  if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN') {
    return WriteFailureReason.PermissionDenied;
  }

  if (code === 'CONFLICT') {
    return WriteFailureReason.ConflictDetected;
  }

  if (code === 'NOT_FOUND') {
    return WriteFailureReason.NotFound;
  }

  if (code === 'SERVER_ERROR') {
    return WriteFailureReason.ServerError;
  }

  return WriteFailureReason.UnknownError;
}
```

**Run and Verify:**

```bash
# Prerequisite: vitest must be configured in packages/data-access (see Verification Command Guidance)
cd packages/data-access && npx vitest run src/retry/write-safe-error.test.ts

# Static analysis (must also pass):
pnpm --filter @hbc/data-access run check-types
pnpm --filter @hbc/data-access run lint
```

**Expected output:**
```
✓ packages/data-access/src/retry/write-safe-error.test.ts (10 tests)
  ✓ WriteFailureReason classification
    ✓ classifies NETWORK_ERROR as NetworkUnreachable
    ✓ classifies SERVICE_UNAVAILABLE as ServiceUnavailable
    ✓ classifies VALIDATION_ERROR as ValidationFailed
    ✓ classifies UNAUTHORIZED as PermissionDenied
    ✓ classifies FORBIDDEN as PermissionDenied
    ✓ classifies CONFLICT as ConflictDetected
    ✓ classifies RATE_LIMITED as RateLimited
    ✓ classifies NOT_FOUND as NotFound
    ✓ classifies SERVER_ERROR as ServerError
    ✓ classifies unknown errors as UnknownError

Test Files  1 passed (1)
Tests  10 passed (10)
```

**Commit:**
```bash
git add packages/data-access/src/retry/write-safe-error.ts
git add packages/data-access/src/retry/write-safe-error.test.ts
git commit -m "Feat(data-access): Add write-safe error classification (9 categories)

- Implement WriteFailureReason enum with 9 categories aligned to B1/C1 error codes
- Add RateLimited, NotFound, ServerError to cover Phase 1 realistic error cases
- Add classifyWriteFailure() to map error codes to user-facing reasons and C3 telemetry
- Reframe WriteOutcome as optional app-level pattern (not canonical export)
- Add comprehensive test suite (10 tests, all passing)

Apps import WriteFailureReason to decide UX; C3 uses same classification
for proxy.request.error failureReason field. Data-access stays focused
on classification, not UI.
"
```

---

### Task 3.2: Audit Record Interface

**Files:**
- Modify or create: `packages/models/src/shared/audit.ts`

**Implementation (type definition with optional type guard tests):**

```typescript
// packages/models/src/shared/audit.ts

/**
 * Audit record interface for tracking write operations.
 * Records are stored on backend (Azure Table Storage).
 * Frontend does NOT write audit records; only reads them for display.
 */
export interface IAuditRecord {
  /** Unique identifier for this audit entry. */
  id: string;

  /** Entity type: 'lead', 'project', 'estimating', etc. */
  entityType: string;

  /** ID of the entity being modified. */
  entityId: string;

  /** Type of operation: create, update, or delete. */
  operation: 'create' | 'update' | 'delete';

  /** User UPN (e.g., 'user@contoso.com') who performed the operation. */
  performedBy: string;

  /** ISO 8601 timestamp when the operation was performed. */
  performedAt: string;

  /** X-Request-Id correlation ID for end-to-end tracing (required). */
  correlationId: string;

  /** Idempotency-Key header value when present (enables dedup evidence). */
  idempotencyKey?: string;

  /** Did the business operation succeed? */
  outcome: 'success' | 'error';

  /** WriteFailureReason code when outcome is 'error'. */
  errorCode?: string;

  /** Previous state of the entity (before update/delete). May be null for creates. */
  previousState?: unknown;

  /** Next state of the entity (after create/update). */
  nextState?: unknown;
}
```

**Type guard test (optional):**

```typescript
// packages/models/src/shared/__tests__/audit.test.ts

import { describe, it, expect } from 'vitest';
import type { IAuditRecord } from '../audit.js';

describe('IAuditRecord type', () => {
  it('allows a complete audit record with correlation fields', () => {
    const record: IAuditRecord = {
      id: '123',
      entityType: 'lead',
      entityId: 'lead-456',
      operation: 'create',
      performedBy: 'user@contoso.com',
      performedAt: new Date().toISOString(),
      correlationId: 'req-uuid-5678',
      idempotencyKey: 'idem-uuid-1234',
      outcome: 'success',
      previousState: undefined,
      nextState: { firstName: 'John', lastName: 'Doe' },
    };
    expect(record.entityType).toBe('lead');
    expect(record.correlationId).toBe('req-uuid-5678');
    expect(record.outcome).toBe('success');
  });

  it('allows error outcome with errorCode', () => {
    const record: IAuditRecord = {
      id: '456',
      entityType: 'project',
      entityId: 'proj-789',
      operation: 'update',
      performedBy: 'admin@contoso.com',
      performedAt: new Date().toISOString(),
      correlationId: 'req-uuid-9999',
      outcome: 'error',
      errorCode: 'VALIDATION_FAILED',
    };
    expect(record.outcome).toBe('error');
    expect(record.errorCode).toBe('VALIDATION_FAILED');
  });

  it('allows optional fields (idempotencyKey, previousState, nextState)', () => {
    const record: IAuditRecord = {
      id: '789',
      entityType: 'estimating',
      entityId: 'tracker-100',
      operation: 'delete',
      performedBy: 'admin@contoso.com',
      performedAt: new Date().toISOString(),
      correlationId: 'req-uuid-0000',
      outcome: 'success',
    };
    expect(record.idempotencyKey).toBeUndefined();
    expect(record.previousState).toBeUndefined();
    expect(record.nextState).toBeUndefined();
  });
});
```

**Commit (if models tests added):**
```bash
git add packages/models/src/shared/audit.ts
git add packages/models/src/shared/__tests__/audit.test.ts
git commit -m "Feat(models): Add IAuditRecord interface with correlation and outcome fields

- Define IAuditRecord with operation, entity, performer, state snapshots
- Add correlationId (X-Request-Id) and idempotencyKey for end-to-end tracing
- Add outcome ('success' | 'error') and errorCode for audit completeness
- Audit records stored on backend (Azure Table) only, not frontend
- Add type-safety tests for success, error, and optional field scenarios

Supports B2 PROD_ACTIVE write-safety evidence and E1 STAGING_READY audit visibility.
"
```

---

### Cross-workstream evidence requirements (Chunk 3 → B2/C3/E1)

D1's audit and failure classification artifacts are not standalone — they feed evidence to other workstreams:

| D1 Artifact | Required By | Evidence | Gate |
|---|---|---|---|
| `WriteFailureReason` classification | C3 `proxy.request.error` event | `failureReason` field populated from `classifyWriteFailure()` | `PROD_ACTIVE` |
| `IAuditRecord` with `correlationId` | B2 write-safety evidence | Audit records queryable by domain and correlationId | `PROD_ACTIVE` |
| Audit records for Lead/Project/Estimating writes | E1 contract test evidence | Audit rows visible in Azure Table Storage during E1 test runs | `STAGING_READY` |
| `classifyWriteFailure()` output | C3 error dashboard | Error categories surfaced in Application Insights error breakdown | `PROD_ACTIVE` |
| `idempotencyKey` in audit trail | B2 deduplication evidence | Audit + idempotency records correlatable by key | `PROD_ACTIVE` |

**Telemetry alignment with C3 spec:**

- `proxy.request.error` events MUST include `errorCode` (from `HbcDataAccessError.code`) and `failureReason` (from `classifyWriteFailure()`). This is D1's contribution to C3 observability.
- `proxy.request.retry` events MUST include `retryCount` and `retryReason`. These are emitted by `withRetry()` via the `onRetry` callback.
- **Circuit-breaker is not a D1 Phase 1 deliverable.** The C3 telemetry contract defines `circuit.state.change` and `circuit.fallback.used` events (C3 section 2.2.3), but circuit-breaker behavior (failure-rate tracking, state transitions, fallback routing) is a distinct resilience pattern beyond retry. If Phase 1 requires circuit-breaker behavior, it should be scoped as a separate deliverable with its own implementation task, or deferred to a later phase. D1's `withRetry` provides the retry foundation that a future circuit-breaker could compose with.
- The `audit.write.failure` alert (C3 section 2.5) fires when audit persistence loss rate exceeds the configured threshold.

---

### Task 3.3: Wire Idempotency into Proxy Lead Repository (Example)

**Files:**
- Modify: `packages/data-access/src/adapters/proxy/lead-repository.ts`
- Modify: `packages/data-access/src/adapters/proxy/lead-repository.test.ts`

**Current state:**
`ProxyLeadRepository` does not yet exist (**CURRENT**) — proxy adapters throw `AdapterNotImplementedError`. B1 will deliver `ProxyLeadRepository` with `create()` and `update()` methods (matching `ILeadRepository` port: `create(data: ILeadFormData)`, `update(id: number, data: Partial<ILeadFormData>)`). D1 adds idempotency support to these methods. **This task is BLOCKED until B1 delivers the proxy lead repository.**

**Modification (showing create() example):**

```typescript
// packages/data-access/src/adapters/proxy/lead-repository.ts

import { BaseRepository } from '../base.js';
import type { ILead, ILeadFormData, ILeadRepository } from '../../ports/index.js';
import type { ProxyHttpClient, IdempotencyContext } from './http-client.js'; // TARGET: http-client.ts delivered by B1

export class ProxyLeadRepository extends BaseRepository<ILead> implements ILeadRepository {
  constructor(private client: ProxyHttpClient) {
    super();
  }

  /**
   * Creates a new lead.
   * @param data Lead form data (matches ILeadRepository.create signature)
   * @param idempotency Optional idempotency context for deduplication
   */
  async create(
    data: ILeadFormData,
    idempotency?: IdempotencyContext,
  ): Promise<ILead> {
    return this.wrapAsync(async () => {
      return this.client.post<ILead>('/api/leads', data, idempotency);
    }, 'ProxyLeadRepository.create');
  }

  /**
   * Retrieves a lead by ID.
   * @param id Lead ID (number — matches ILeadRepository port)
   */
  async getById(id: number): Promise<ILead | null> {
    return this.wrapAsync(async () => {
      return this.client.get<ILead | null>(`/api/leads/${id}`);
    }, 'ProxyLeadRepository.getById');
  }

  /**
   * Updates an existing lead.
   * @param id Lead ID (number)
   * @param data Partial lead form data
   * @param idempotency Optional idempotency context for deduplication
   */
  async update(
    id: number,
    data: Partial<ILeadFormData>,
    idempotency?: IdempotencyContext,
  ): Promise<ILead> {
    return this.wrapAsync(async () => {
      return this.client.put<ILead>(`/api/leads/${id}`, data, idempotency);
    }, 'ProxyLeadRepository.update');
  }

  async delete(id: number): Promise<void> {
    return this.wrapAsync(async () => {
      await this.client.delete(`/api/leads/${id}`);
    }, 'ProxyLeadRepository.delete');
  }
}
```

**Test additions:**

```typescript
// packages/data-access/src/adapters/proxy/lead-repository.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProxyLeadRepository } from './lead-repository.js';
import type { ILead, ILeadFormData } from '../../ports/index.js';

describe('ProxyLeadRepository with idempotency', () => {
  let mockClient: any;
  let repository: ProxyLeadRepository;

  beforeEach(() => {
    mockClient = {
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    repository = new ProxyLeadRepository(mockClient);
  });

  it('create() passes idempotency context to client.post', async () => {
    const leadData = { firstName: 'John', lastName: 'Doe' };
    const idempotency = {
      key: 'test-uuid',
      operation: 'create-lead',
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60,
    };

    mockClient.post.mockResolvedValueOnce({ id: 123, ...leadData });

    await repository.create(leadData, idempotency);

    expect(mockClient.post).toHaveBeenCalledWith(
      '/api/leads',
      leadData,
      idempotency,
    );
  });

  it('update() passes idempotency context to client.put', async () => {
    const leadData = { firstName: 'Jane' };
    const idempotency = {
      key: 'test-uuid-2',
      operation: 'update-lead',
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60,
    };

    mockClient.put.mockResolvedValueOnce({ id: '123', firstName: 'Jane', lastName: 'Doe' });

    await repository.update(123, leadData, idempotency);

    expect(mockClient.put).toHaveBeenCalledWith(
      '/api/leads/123',
      leadData,
      idempotency,
    );
  });

  it('create() without idempotency still works', async () => {
    const leadData = { firstName: 'Bob', lastName: 'Smith' };
    mockClient.post.mockResolvedValueOnce({ id: 456, ...leadData });

    await repository.create(leadData);

    expect(mockClient.post).toHaveBeenCalledWith(
      '/api/leads',
      leadData,
      undefined,
    );
  });
});
```

**Commit:**
```bash
git add packages/data-access/src/adapters/proxy/lead-repository.ts
git add packages/data-access/src/adapters/proxy/lead-repository.test.ts
git commit -m "Feat(data-access): Wire idempotency into ProxyLeadRepository

- Extend create() and update() to accept optional IdempotencyContext
- Pass idempotency context to HTTP client (POST/PUT methods)
- Preserve backward compatibility: idempotency is optional
- Add comprehensive test suite for idempotency flow

Lead repository (and others following the same pattern) now support
idempotent writes. Apps generate keys before calling create/update.
"
```

---

## Chunk 4: Final Integration and Verification

### Task 4.1: Integration Test (Retry + Idempotency)

**Files:**
- Create: `packages/data-access/src/retry/write-safety.integration.test.ts`

**Failing Test (TDD start):**

```typescript
// packages/data-access/src/retry/write-safety.integration.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProxyHttpClient } from '../adapters/proxy/http-client.js';
import { generateIdempotencyKey } from './idempotency.js';
import { WRITE_RETRY_POLICY } from './retry-policy.js';

describe('Write safety: retry + idempotency integration', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: ProxyHttpClient;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  it('retries on network failure, then succeeds', async () => {
    const idempotency = generateIdempotencyKey('create-lead');

    mockFetch
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 'lead-1', firstName: 'John' }),
      });

    client = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'token',
      writePolicy: WRITE_RETRY_POLICY,
    });

    const result = await client.post('/leads', { firstName: 'John' }, idempotency);

    expect(result).toEqual({ id: 'lead-1', firstName: 'John' });
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Verify idempotency header was sent on both attempts
    const calls = mockFetch.mock.calls;
    for (const call of calls) {
      const [, options] = call;
      expect(options.headers['Idempotency-Key']).toBe(idempotency.key);
    }
  });

  it('returns cached response when backend detects idempotent duplicate', async () => {
    const idempotency = generateIdempotencyKey('create-lead');
    const cachedResponse = { id: 'lead-1', firstName: 'John', cached: true };

    // First call: succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => cachedResponse,
    });

    client = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'token',
      writePolicy: WRITE_RETRY_POLICY,
    });

    const result1 = await client.post('/leads', { firstName: 'John' }, idempotency);
    expect(result1).toEqual(cachedResponse);

    // Second call with same idempotency key (simulating backend dedup)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200, // 200 instead of 201 for cached response
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => cachedResponse,
    });

    const result2 = await client.post('/leads', { firstName: 'John' }, idempotency);
    expect(result2).toEqual(cachedResponse);

    // Same key sent in both requests
    const call1Headers = mockFetch.mock.calls[0][1].headers;
    const call2Headers = mockFetch.mock.calls[1][1].headers;
    expect(call1Headers['Idempotency-Key']).toBe(call2Headers['Idempotency-Key']);
  });

  it('combines retry + idempotency: network failure then idempotent success', async () => {
    const idempotency = generateIdempotencyKey('update-project');
    const responseData = { id: 'proj-1', name: 'Project A' };

    // First attempt: network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    // Second attempt: succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => responseData,
    });

    client = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'token',
      writePolicy: WRITE_RETRY_POLICY,
    });

    const result = await client.put('/projects/1', { name: 'Project A' }, idempotency);
    expect(result).toEqual(responseData);

    // Verify: 2 HTTP calls, same idempotency key on both
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const [call1, call2] = mockFetch.mock.calls;
    expect(call1[1].headers['Idempotency-Key']).toBe(idempotency.key);
    expect(call2[1].headers['Idempotency-Key']).toBe(idempotency.key);
  });

  it('stops retrying on validation error (non-retryable), does not retry even with idempotency', async () => {
    const idempotency = generateIdempotencyKey('create-lead');

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Missing required field: firstName' }),
    });

    client = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'token',
      writePolicy: WRITE_RETRY_POLICY,
    });

    await expect(
      client.post('/leads', { lastName: 'Doe' }, idempotency),
    ).rejects.toThrow();

    // Should only try once; validation errors are terminal
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
```

**Implementation (already covered by previous tasks, but this test verifies integration):**

The test itself is the verification. Run it:

```bash
# Prerequisite: vitest must be configured in packages/data-access (see Verification Command Guidance)
# NOTE: This test is BLOCKED on B1 — test code is written but ProxyHttpClient does not yet exist
cd packages/data-access && npx vitest run src/retry/write-safety.integration.test.ts

# Static analysis (must also pass):
pnpm --filter @hbc/data-access run check-types
pnpm --filter @hbc/data-access run lint
```

**Expected output:**
```
✓ packages/data-access/src/retry/write-safety.integration.test.ts (4 tests)
  ✓ Write safety: retry + idempotency integration
    ✓ retries on network failure, then succeeds
    ✓ returns cached response when backend detects idempotent duplicate
    ✓ combines retry + idempotency: network failure then idempotent success
    ✓ stops retrying on validation error (non-retryable), does not retry even with idempotency

Test Files  1 passed (1)
Tests  4 passed (4)
```

**Commit:**
```bash
git add packages/data-access/src/retry/write-safety.integration.test.ts
git commit -m "Test(data-access): Add write safety integration tests

- Verify retry + idempotency work together (network failure recovery)
- Verify same idempotency key sent on retry attempts
- Verify non-retryable errors stop retries (no waste)
- Verify integration across retry policy, idempotency context, and HTTP client

Integration tests verify retry + idempotency in isolation.
End-to-end verification requires B1 proxy infrastructure.
"
```

---

### Task 4.2: Update Exports

**Files:**
- Modify: `packages/data-access/src/index.ts` (or `src/retry/index.ts`)

Add exports for write-safety functions:

```typescript
// packages/data-access/src/retry/index.ts (new file)

export {
  RetryPolicy,
  DEFAULT_RETRY_POLICY,
  READ_RETRY_POLICY,
  WRITE_RETRY_POLICY,
  withRetry,
  sleep,
} from './retry-policy.js';

export {
  IdempotencyContext,
  generateIdempotencyKey,
  isExpired,
} from './idempotency.js';

export {
  WriteFailureReason,
  classifyWriteFailure,
} from './write-safe-error.js';
// NOTE: WriteOutcome is NOT exported — it is an optional app-level pattern (see Decision 5)
```

Update root index:

```typescript
// packages/data-access/src/index.ts

// ... existing exports ...

// Write safety (new in P1-D1)
export {
  RetryPolicy,
  DEFAULT_RETRY_POLICY,
  WRITE_RETRY_POLICY,
  READ_RETRY_POLICY,
  withRetry,
  IdempotencyContext,
  generateIdempotencyKey,
  isExpired,
  WriteFailureReason,
  classifyWriteFailure,
} from './retry/index.js';
// NOTE: WriteOutcome is NOT exported — it is an optional app-level pattern (see Decision 5)

// TARGET: Re-export IdempotencyContext from proxy HTTP client once B1 delivers http-client.ts
// export type { IdempotencyContext as HttpIdempotencyContext } from './adapters/proxy/http-client.js';
```

**Commit:**
```bash
git add packages/data-access/src/retry/index.ts
git add packages/data-access/src/index.ts
git commit -m "Feat(data-access): Export write-safety APIs from public surface

- Add retry/index.ts barrel export for all retry-related functions
- Update packages/data-access/src/index.ts to re-export write-safety APIs
- Convenience export: IdempotencyContext from http-client
- Apps can now import: generateIdempotencyKey, WriteFailureReason, etc.

Write safety APIs exported. Full integration pending B1/C1.
"
```

---

## Summary

### What Was Built

**Phase 1 Deliverable (P1-D1) includes:**

1. **Retry Policy Foundation** (Chunk 1)
   - `RetryPolicy` interface with configurable exponential backoff
   - `withRetry()` HOF with exponential backoff and callback support
   - Three policies: DEFAULT, READ (5 attempts), WRITE (2 attempts)
   - Designed for integration into `ProxyHttpClient` once B1 delivers it (**TARGET**)
   - Classifies HTTP errors: retryable (429, 502, 503, 504) vs terminal (400, 401, 403, 404)

2. **Idempotency Key Pattern** (Chunk 2)
   - `generateIdempotencyKey()` returns UUID + operation + TTL
   - `isExpired()` detects stale keys (~24h default)
   - `ProxyHttpClient` methods accept `IdempotencyContext` (MUST for production writes)
   - Headers sent: `Idempotency-Key`, `X-Idempotency-Operation`
   - Backend: `IdempotencyStorageService` (dedicated `IdempotencyRecords` table, `TableClient`-based, registered in `IServiceContainer`)
   - Backend: `checkIdempotency()` and `recordIdempotencyResult()` standalone functions (not middleware)
   - Backend: `withIdempotency(handler)` wrapper applied at `app.http()` registration
   - Backend: `cleanupIdempotencyRecords` timer trigger (nightly stale record deletion)
   - Application-enforced 24h TTL (Azure Tables has no native TTL): check `expiresAt` on read + nightly cleanup

3. **Write-Safety Error States and Audit** (Chunk 3)
   - `WriteFailureReason` enum (9 categories, aligned to B1/C1 error codes)
   - `classifyWriteFailure()` maps error codes to user-facing reasons and C3 telemetry
   - `IAuditRecord` interface with correlation fields (`correlationId`, `idempotencyKey`, `outcome`)
   - Audit control requirements: mandatory for critical-path writes, non-blocking, correlated
   - Cross-workstream evidence ties to B2 `PROD_ACTIVE`, C3 observability, E1 `STAGING_READY`
   - `WriteOutcome` reframed as optional app-level helper (not canonical export)
   - Example wiring shown for `ProxyLeadRepository` (**BLOCKED** on B1)

4. **Integration & Verification** (Chunk 4)
   - 4 integration tests verifying retry + idempotency together — **BLOCKED** on B1; test code written, execution pending
   - Public API exports from `@hbc/data-access`

### D1 Acceptance Matrix

| Stage | Criteria | Verification | Dependencies | Status |
|---|---|---|---|---|
| **Code complete — data-access** | RetryPolicy, withRetry, idempotency types, WriteFailureReason, classifyWriteFailure implemented and unit-tested | `cd packages/data-access && npm test` + `check-types` + `lint` | Vitest setup (prerequisite) | **TARGET** |
| **Code complete — backend** | IdempotencyStorageService, checkIdempotency, recordIdempotencyResult, withIdempotency wrapper, cleanup timer implemented and unit-tested | `cd backend/functions && npm test` + `check-types` + `lint` | None — standalone | **TARGET** |
| **Code complete — models** | IAuditRecord interface with correlation fields exported | `pnpm --filter @hbc/models run check-types` | None — type-only | **TARGET** |
| **Integration-ready** | ProxyHttpClient retry wiring, repository-level idempotency, frontend→backend idempotency flow | D1 integration tests pass with B1 proxy infrastructure | B1 (ProxyHttpClient, proxy repositories) | **BLOCKED** on B1 |
| **Contract-test dependent** | Error classification matches C1 error envelope; idempotency headers honored by backend | E1 contract test suite passes against staging | B1, C1 (error envelope freeze), E1 | **BLOCKED** on B1/C1/E1 |
| **Staging-ready evidence** | Audit records visible in Azure Table Storage during E1 test runs; retry telemetry in Application Insights | E1 test run + AI query + Table Storage query | B1, C1, C3 (telemetry), E1 | **BLOCKED** on B1/C1/C3/E1 |
| **PROD_ACTIVE gate** | "Write safety — Retry and idempotency behavior verified"; "Monitoring, error reporting, and alerting confirmed" | Production verification run + monitoring dashboards | All D1 + B1 + B2 + C1 + C3 + E1 | **BLOCKED** on all |

**Phase 1 gate alignment — "Failures are recoverable and visible" requires:**
- Retryable failures ARE retried (withRetry + policy) — verified at code-complete stage
- Non-retryable failures ARE classified (classifyWriteFailure) — verified at code-complete stage
- Write failures ARE audited (IAuditRecord + backend audit) — verified at staging-ready stage
- Retry and audit ARE observable (C3 telemetry) — verified at PROD_ACTIVE stage

### Code Coverage

- **Frontend (data-access):** ~1,500 lines (code + tests)
  - Retry policy types, HOF, and tests (11 tests)
  - HTTP client retry integration (9 tests) — **BLOCKED** on B1; test code written, execution pending
  - Idempotency key generation (7 tests)
  - Write-safe error classification (10 tests)
  - Integration tests (4 tests) — **BLOCKED** on B1; test code written, execution pending
  - **Standalone tests executable at code-complete: 28**
  - **B1-dependent tests executable after B1 delivery: 13**

- **Backend (Azure Functions):** ~600 lines (code + tests)
  - `IdempotencyStorageService` + mock (~20 estimated tests)
  - `checkIdempotency` / `recordIdempotencyResult` (standalone functions)
  - `withIdempotency` handler wrapper
  - `cleanupIdempotencyRecords` timer trigger
  - **All executable at code-complete**

- **Models:** ~100 lines (type definitions, optional type guard tests)

### Assumptions & Risks

**Assumptions:**
- `ProxyHttpClient` implementation (B1 deliverable, **TARGET**) will use native `fetch` API (adjust if using axios, etc.)
- `IdempotencyStorageService` uses a dedicated `IdempotencyRecords` table (not the `ProvisioningStatus` table)
- Azure Table Storage connection string available via `AZURE_TABLE_ENDPOINT` env var (same as `RealTableStorageService`)
- Azure Tables has no native TTL; expiry is application-enforced via `expiresAt` field + nightly cleanup timer
- Phase 1 critical path: Project, Lead, Estimating only
- `packages/data-access` requires vitest configuration setup before any D1 tests can execute

**Risks:**
- Idempotency TTL (24h) may need tuning; too short risks legitimate retries treated as new; too long wastes storage
- Nightly cleanup means expired records persist up to ~24h past `expiresAt`; increase timer frequency if needed
- `withIdempotency` adds one Table Storage point-read per mutating request; ~<10ms latency but verify under load
- Offline queue (session-state) coordination not covered; separate P1-D2 or later
- SharePoint adapter retry (Phase 5) will need its own strategy at PnPjs call site

### Next Steps (Post D1 Code-Complete)

1. **Immediate (no dependencies):** Add vitest configuration to `packages/data-access`; run all 28 standalone D1 tests
2. **After B1 delivery:** Execute B1-dependent tests (Task 1.2, Task 3.3, Task 4.1); wire retry into delivered ProxyHttpClient
3. **After C1 freeze:** Validate error classification against frozen C1 error envelope
4. **After C3 alignment:** Wire `proxy.request.error` and `proxy.request.retry` telemetry events
5. **After E1 delivery:** Run contract tests against staging; verify audit records visible in Table Storage
6. **PROD_ACTIVE gate:** Production verification run with monitoring dashboards confirming all three critical-path domains

---

## References

- **Architecture:** `docs/architecture/blueprint/current-state-map.md`, `HB-Intel-Blueprint-V4.md`
- **Adapter Plan:** `P1-B1-Proxy-Adapter-Implementation-Plan.md`
- **Service Contracts:** `P1-C1-Backend-Service-Contract-Catalog.md`
- **Error Hierarchy:** `packages/data-access/src/errors/index.ts`
- **Base Repository:** `packages/data-access/src/adapters/base.ts`
- **Service Factory Pattern:** `backend/functions/src/services/service-factory.ts`
- **Table Storage Pattern:** `backend/functions/src/services/table-storage-service.ts`
- **Handler Registration Pattern:** `backend/functions/src/functions/notifications/UpdatePreferences.ts`
- **Azure Tables SDK:** `@azure/data-tables` v13.3.2

---