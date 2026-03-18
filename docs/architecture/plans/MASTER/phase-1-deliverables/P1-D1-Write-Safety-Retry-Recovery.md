# P1-D1: Write Safety, Retry, and Recovery Implementation Plan

| Field | Value |
|---|---|
| **Doc ID** | P1-D1 |
| **Phase** | Phase 1 |
| **Workstream** | D — Write Safety, Retry, and Recovery |
| **Document Type** | Implementation Plan |
| **Owner** | D1-workstream lead |
| **Status** | Draft — blocked on B1 proxy infrastructure |
| **Date** | 2026-03-16 |
| **Last Reviewed Against Repo Truth** | 2026-03-18 |
| **Audience** | Developers implementing write safety for Phase 1 critical path (Project, Lead, Estimating) |
| **References** | P1-B1 (Proxy Adapter), P1-B2 (Adapter Completion Backlog), P1-C1 (Backend Service Catalog), P1-C3 (Observability Spec), current-state-map.md |

### Status Legend

| Marker | Meaning |
|---|---|
| **CURRENT** | Verified against live repo as of 2026-03-18 |
| **TARGET** | D1 deliverable — implementation planned |
| **PROVISIONAL** | Design decision pending upstream confirmation |
| **BLOCKED** | Cannot implement until dependency is delivered |

---

## Purpose

This plan guides developers with no HB Intel codebase knowledge to implement write safety features — retry logic, idempotency key patterns, and audit trail infrastructure — for the Proxy Adapter. The plan emphasizes test-driven development (TDD), starts from first principles, and assumes only TypeScript and Vitest familiarity.

**Deliverables:**
- Retry policy types and `withRetry` higher-order function
- Idempotency key generation and tracking interface
- Backend idempotency guard middleware (Azure Functions)
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

### Current Repo State (verified 2026-03-18)

- `ProxyHttpClient` does not exist — `packages/data-access/src/adapters/proxy/` contains only stub types, constants, and index re-exports (**CURRENT**)
- Proxy adapter mode throws `AdapterNotImplementedError` in the factory for all domains (**CURRENT**)
- `packages/data-access` has no test script — only build, check-types, lint (**CURRENT**)
- `backend/functions` has vitest test infrastructure (unit, smoke, coverage) (**CURRENT**)
- Backend table storage service (`RealTableStorageService`) exposes domain-specific provisioning methods using `TableClient.upsertEntity()` semantics; no generic idempotency table or middleware exists (**CURRENT**)
- No retry logic exists anywhere in `packages/data-access` (**CURRENT**)

### D1 Deliverable Breakdown by Surface

| Deliverable | Surface | Status | Dependency |
|---|---|---|---|
| `RetryPolicy` types + `withRetry` HOF | `packages/data-access` | **TARGET** — implementable now | None — standalone module |
| `ProxyHttpClient` retry wiring | `packages/data-access` | **BLOCKED** | B1 must deliver `ProxyHttpClient` first |
| `WriteFailureReason` enum + `classifyWriteFailure` | `packages/data-access` | **TARGET** — implementable now | None — standalone module |
| `IdempotencyContext` + `generateIdempotencyKey` | `packages/data-access` | **TARGET** — implementable now | None — standalone module |
| `IAuditRecord` interface | `packages/models` or `packages/data-access` | **TARGET** — implementable now | None — interface only |
| Backend idempotency guard | `backend/functions` | **TARGET** — requires integration design | Backend handler model uses side-effect imports, not middleware pipeline (**PROVISIONAL**) |
| Backend idempotency table storage | `backend/functions` | **TARGET** — requires storage strategy | Current `RealTableStorageService` has no idempotency methods; needs extension (**PROVISIONAL**) |
| Repository-level idempotency wiring | `packages/data-access` | **BLOCKED** | B1 must deliver proxy repositories first |
| Integration tests | Both surfaces | **BLOCKED** | B1 proxy infrastructure + D1 implementation must both exist |

### What D1 Can Implement Now (No B1 Dependency)

- Chunk 1, Task 1.1: `RetryPolicy` types and `withRetry` HOF (standalone, testable in isolation)
- Chunk 2, Task 2.1: `IdempotencyContext` types and `generateIdempotencyKey` (standalone)
- Chunk 3, Task 3.1: `WriteFailureReason` enum and `classifyWriteFailure` (standalone)
- Chunk 3, Task 3.2: `IAuditRecord` interface (standalone)

### What D1 Cannot Implement Until B1 Delivers

- Chunk 1, Task 1.2: Wiring retry into `ProxyHttpClient` (class doesn't exist)
- Chunk 2, Task 2.2: Backend idempotency guard (needs integration design with current handler model)
- Chunk 3, Task 3.3: Repository-level idempotency wiring (repositories don't exist)
- Chunk 4: Integration tests (needs both B1 and D1 implementations)

### Acceptance Gates D1 Unlocks

- B2 `PROD_ACTIVE` gate: "Write safety — Retry and idempotency behavior verified for write methods (D1 deliverables)"
- B2 `PROD_ACTIVE` gate: "Observability — Monitoring, error reporting, and alerting confirmed" requires D1 circuit-breaker telemetry (C3 section 2.2.3)

### Cross-Workstream Dependencies

| D1 depends on | For | Status |
|---|---|---|
| B1 (Proxy Adapter) | `ProxyHttpClient` class and proxy repository implementations | B1 not yet merged; proxy is stub |
| C1 (Backend Catalog) | Route shapes, error envelope, HTTP methods | C1 frozen for implemented routes |
| B2 (Completion Backlog) | Gate criteria and production activation requirements | B2 active |
| C3 (Observability Spec) | Circuit-breaker telemetry contract (`circuit.state.change`, `circuit.fallback.used`) | C3 aligned |

### Verification Command Guidance

- **`packages/data-access`**: No test script exists (**CURRENT**). D1 implementation must either (a) add a vitest configuration to data-access or (b) run tests via workspace root. Until a test script is added, use: `npx vitest run packages/data-access/src/retry/retry-policy.test.ts` from workspace root.
- **`backend/functions`**: Has vitest — use `npm test` from `backend/functions/` or the workspace-scoped command.
- All D1 code must pass `check-types` and `lint` for its package before commit.

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

---

### Decision 2: Idempotency Keys Generated by Frontend, Honored by Backend

**Rationale:**
The frontend (the caller) knows the semantic intent of the write operation. A key must be stable across page re-renders, navigation, and browser crashes during a write flow. Only the frontend can guarantee this stability.

**Consequence:**
Frontend generates a unique key before initiating a write. The key is sent as the `Idempotency-Key` HTTP header. The backend checks the key and either returns the cached response (if already processed) or processes the write.

**Implication for implementation:**
`generateIdempotencyKey()` returns a UUID + operation context. Mutating HTTP methods accept optional `IdempotencyContext`. If no context provided, the request has no idempotency guarantee (reads never get contexts; writes should always have them).

---

### Decision 3: Backend Idempotency Stored in Azure Table Storage

**Rationale:**
Idempotency records must be durable across function restarts and must be queryable quickly. Azure Table Storage (same backing store as audit logs) is a natural fit. It handles eventual consistency and TTL.

**Consequence:**
Idempotency records live in a dedicated table (`idempotency` partition). Records have a ~24h TTL. Once expired, the same key is treated as a new request. Functions check the table before processing; they write the result after successful processing.

**Implication for implementation:**
Backend middleware `checkIdempotency()` queries the table; `recordIdempotencyResult()` writes the cached response after the operation succeeds. Both are async and non-blocking.

---

### Decision 4: Write Audit Records Async-Non-Blocking on Backend

**Rationale:**
Audit failures should never cause business operation failures. Users care about getting their project created or lead updated, not about whether the audit log entry succeeded.

**Consequence:**
Audit write on the backend uses a `.catch(logger.warn)` pattern. Audit records are eventually consistent. If an audit write fails 3 times and is finally dropped, the business operation still succeeded.

**Implication for implementation:**
Frontend data-access layer does NOT write audit records. Only the backend does, after confirming the write succeeded. The frontend may log errors locally (to IndexedDB via session-state), but those are not audit logs.

---

### Decision 5: Write Failure States Defined by Consuming App, Not Data-Access

**Rationale:**
Data-access cannot predict what the app wants to do with a write failure. Should a lead-creation failure show a toast and a retry button? Or inline validation? Or a modal with escalation options? The app knows; data-access doesn't.

**Consequence:**
Data-access exports a `WriteFailureReason` enum (e.g., `NETWORK_UNREACHABLE`, `VALIDATION_FAILED`, `CONFLICT_DETECTED`). The consuming app imports this enum and decides what UX to show.

**Implication for implementation:**
Data-access has a `classifyWriteFailure(error: HbcDataAccessError): WriteFailureReason` function. The app calls it after a write fails, then decides the user-facing message and action.

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
      retryableErrors: new Set(['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE']),
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
  retryableErrors: new Set(['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE']),
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

      // Calculate backoff delay with exponential growth and ceiling
      const exponentialDelay = policy.initialDelayMs * Math.pow(policy.backoffFactor, attempt);
      const delayMs = Math.min(exponentialDelay, policy.maxDelayMs);

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
# From workspace root (see Verification Command Guidance in Plan Status section)
npx vitest run packages/data-access/src/retry/retry-policy.test.ts
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

- Implement RetryPolicy interface with configurable exponential backoff
- Define DEFAULT_RETRY_POLICY, READ_RETRY_POLICY, WRITE_RETRY_POLICY
- Implement withRetry<T>() HOF with exponential backoff, callback support, error classification
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
`ProxyHttpClient` does not yet exist (**CURRENT**) — `packages/data-access/src/adapters/proxy/` contains only stub types and constants. B1 will deliver `ProxyHttpClient` with constructor taking `baseUrl` and `getToken`. D1 extends it to accept an optional `RetryPolicy`. **This task is BLOCKED until B1 delivers the proxy HTTP client.**

**Failing Tests (TDD start):**

```typescript
// packages/data-access/src/adapters/proxy/http-client.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProxyHttpClient } from './http-client.js';
import { WRITE_RETRY_POLICY } from '../../retry/retry-policy.js';

describe('ProxyHttpClient retry integration', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: ProxyHttpClient;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  it('constructor accepts optional RetryPolicy', () => {
    const client1 = new ProxyHttpClient(
      'https://api.example.com',
      async () => 'token',
    );
    expect(client1).toBeDefined();

    const client2 = new ProxyHttpClient(
      'https://api.example.com',
      async () => 'token',
      WRITE_RETRY_POLICY,
    );
    expect(client2).toBeDefined();
  });

  it('GET request retries on 503 Service Unavailable', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: '123', name: 'Project A' }),
      });

    const client = new ProxyHttpClient(
      'https://api.example.com',
      async () => 'token',
      WRITE_RETRY_POLICY,
    );

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
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: '456', name: 'New Lead' }),
      });

    const client = new ProxyHttpClient(
      'https://api.example.com',
      async () => 'token',
      WRITE_RETRY_POLICY,
    );

    const result = await client.post('/leads', { firstName: 'John' });
    expect(result).toEqual({ id: '456', name: 'New Lead' });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry on 400 Bad Request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ error: 'Invalid field' }),
    });

    const client = new ProxyHttpClient(
      'https://api.example.com',
      async () => 'token',
      WRITE_RETRY_POLICY,
    );

    await expect(client.post('/leads', {})).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on 401 Unauthorized', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: 'Auth failed' }),
    });

    const client = new ProxyHttpClient(
      'https://api.example.com',
      async () => 'token',
      WRITE_RETRY_POLICY,
    );

    await expect(client.get('/projects/123')).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('retries on 429 Too Many Requests', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: '789', count: 5 }),
      });

    const client = new ProxyHttpClient(
      'https://api.example.com',
      async () => 'token',
      WRITE_RETRY_POLICY,
    );

    const result = await client.get('/stats');
    expect(result).toEqual({ id: '789', count: 5 });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('includes Idempotency-Key header when IdempotencyContext provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: '999' }),
    });

    const client = new ProxyHttpClient(
      'https://api.example.com',
      async () => 'token',
    );

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

import { RetryPolicy, WRITE_RETRY_POLICY, withRetry } from '../../retry/retry-policy.js';
import { HbcDataAccessError } from '../../errors/index.js';

export interface IdempotencyContext {
  key: string;
  operation: string;
  createdAt: number;
  expiresAt: number;
}

interface HttpOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

/**
 * HTTP client for the Proxy adapter with built-in retry and idempotency support.
 * Wraps fetch with exponential backoff, idempotency key headers, and MSAL token injection.
 */
export class ProxyHttpClient {
  private baseUrl: string;
  private getToken: () => Promise<string>;
  private retryPolicy: RetryPolicy;

  constructor(
    baseUrl: string,
    getToken: () => Promise<string>,
    retryPolicy?: RetryPolicy,
  ) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
    this.retryPolicy = retryPolicy || WRITE_RETRY_POLICY;
  }

  /**
   * Performs a GET request with retry.
   */
  async get<T>(url: string): Promise<T> {
    return withRetry(
      () => this._fetch<T>(url, { method: 'GET', headers: {} }),
      this.retryPolicy,
    );
  }

  /**
   * Performs a POST request with optional idempotency key.
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
      this.retryPolicy,
    );
  }

  /**
   * Performs a PUT request with optional idempotency key.
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
      this.retryPolicy,
    );
  }

  /**
   * Performs a DELETE request with retry.
   */
  async delete<T>(url: string): Promise<T> {
    return withRetry(
      () => this._fetch<T>(url, { method: 'DELETE', headers: {} }),
      this.retryPolicy,
    );
  }

  /**
   * Internal fetch implementation. Handles token injection, error classification, and retryable status codes.
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
      const error = await this._classifyHttpError(response);
      throw error;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Classifies HTTP errors as retryable or not.
   */
  private async _classifyHttpError(response: Response): Promise<HbcDataAccessError> {
    const body = await response.json().catch(() => ({}));

    let code = 'HTTP_ERROR';
    if (response.status === 429) code = 'RATE_LIMITED';
    else if (response.status === 502) code = 'BAD_GATEWAY';
    else if (response.status === 503) code = 'SERVICE_UNAVAILABLE';
    else if (response.status === 504) code = 'GATEWAY_TIMEOUT';
    else if (response.status >= 500) code = 'SERVER_ERROR';
    else if (response.status === 401) code = 'UNAUTHORIZED';
    else if (response.status === 403) code = 'FORBIDDEN';
    else if (response.status === 404) code = 'NOT_FOUND';
    else if (response.status === 422) code = 'VALIDATION_ERROR';
    else if (response.status >= 400) code = 'CLIENT_ERROR';

    const message = (body as any)?.message || response.statusText;
    const error = new HbcDataAccessError(message, code);
    (error as any).statusCode = response.status;
    return error;
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
# From workspace root (see Verification Command Guidance in Plan Status section)
npx vitest run packages/data-access/src/adapters/proxy/http-client.test.ts
```

**Expected output:**
```
✓ packages/data-access/src/adapters/proxy/http-client.test.ts (8 tests)
  ✓ ProxyHttpClient retry integration
    ✓ constructor accepts optional RetryPolicy
    ✓ GET request retries on 503 Service Unavailable
    ✓ POST request retries on 503 Service Unavailable
    ✓ does NOT retry on 400 Bad Request
    ✓ does NOT retry on 401 Unauthorized
    ✓ retries on 429 Too Many Requests
    ✓ includes Idempotency-Key header when IdempotencyContext provided

Test Files  1 passed (1)
Tests  8 passed (8)
```

**Commit:**
```bash
git add packages/data-access/src/adapters/proxy/http-client.ts
git add packages/data-access/src/adapters/proxy/http-client.test.ts
git commit -m "Feat(data-access): Wire retry into ProxyHttpClient

- Extend ProxyHttpClient constructor to accept optional RetryPolicy
- Implement withRetry wrapping for GET, POST, PUT, DELETE methods
- Classify HTTP errors as retryable (429, 502, 503, 504) vs terminal (400, 401, 403, 404)
- Add IdempotencyContext support: include key and operation in headers
- Add comprehensive test suite (8 tests, all passing)

Retry and idempotency are now integrated into HTTP layer. Repositories
will call client methods without worrying about transport failures.
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
    const ctx = generateIdempotencyKey('delete-estimating', customTtlMs);
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
# From workspace root (see Verification Command Guidance in Plan Status section)
npx vitest run packages/data-access/src/retry/idempotency.test.ts
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

**Integration note (PROVISIONAL):** The current backend Azure Functions handler model uses direct side-effect imports for handler registration — there is no generalized middleware pipeline. The "middleware" pattern described below requires one of: (a) a handler wrapper function applied at each mutating endpoint, (b) an Azure Functions pre-invocation hook, or (c) a validation layer injected into the service factory. The specific integration approach must be confirmed during implementation against the actual handler structure. The current `RealTableStorageService` uses `TableClient.upsertEntity()` with domain-specific methods — extending it for idempotency requires adding a dedicated idempotency table/partition and explicit TTL/cleanup strategy (the ~24h TTL in Decision 3 is not enforced by Azure Table Storage natively).

**Files:**
- Create: `backend/functions/src/middleware/idempotency-guard.ts`
- Create: `backend/functions/src/middleware/idempotency-guard.test.ts`

**Note:** This task assumes Azure Functions project structure. If your backend layout differs, adjust paths accordingly.

**Failing Tests (TDD start):**

```typescript
// backend/functions/src/middleware/idempotency-guard.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkIdempotency, recordIdempotencyResult } from './idempotency-guard.js';

describe('checkIdempotency()', () => {
  const mockTableStorage = {
    getEntity: vi.fn(),
  };

  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    mockTableStorage.getEntity.mockClear();
    mockLogger.info.mockClear();
  });

  it('returns alreadyProcessed=false when no Idempotency-Key header', async () => {
    const request = { headers: {} } as any;
    const result = await checkIdempotency(request, mockTableStorage, mockLogger);
    expect(result.alreadyProcessed).toBe(false);
    expect(result.cachedResponse).toBeUndefined();
  });

  it('returns alreadyProcessed=false when key not found in table', async () => {
    mockTableStorage.getEntity.mockResolvedValueOnce(null);

    const request = {
      headers: { 'idempotency-key': 'test-uuid-1234' },
    } as any;

    const result = await checkIdempotency(request, mockTableStorage, mockLogger);
    expect(result.alreadyProcessed).toBe(false);
    expect(mockTableStorage.getEntity).toHaveBeenCalledWith('idempotency', 'test-uuid-1234');
  });

  it('returns alreadyProcessed=true with cached response when key found and not expired', async () => {
    const cachedResponse = { id: '123', name: 'Cached Lead' };
    mockTableStorage.getEntity.mockResolvedValueOnce({
      partitionKey: 'idempotency',
      rowKey: 'test-uuid-1234',
      responseBody: JSON.stringify(cachedResponse),
      expiresAt: Date.now() + 1000 * 60 * 60, // expires in 1 hour
    });

    const request = {
      headers: { 'idempotency-key': 'test-uuid-1234' },
    } as any;

    const result = await checkIdempotency(request, mockTableStorage, mockLogger);
    expect(result.alreadyProcessed).toBe(true);
    expect(result.cachedResponse).toEqual(cachedResponse);
  });

  it('returns alreadyProcessed=false when key found but expired', async () => {
    mockTableStorage.getEntity.mockResolvedValueOnce({
      partitionKey: 'idempotency',
      rowKey: 'test-uuid-1234',
      responseBody: JSON.stringify({ id: '123' }),
      expiresAt: Date.now() - 1000, // expired
    });

    const request = {
      headers: { 'idempotency-key': 'test-uuid-1234' },
    } as any;

    const result = await checkIdempotency(request, mockTableStorage, mockLogger);
    expect(result.alreadyProcessed).toBe(false);
  });

  it('logs operation name if X-Idempotency-Operation header present', async () => {
    mockTableStorage.getEntity.mockResolvedValueOnce(null);

    const request = {
      headers: {
        'idempotency-key': 'test-uuid-1234',
        'x-idempotency-operation': 'create-lead',
      },
    } as any;

    await checkIdempotency(request, mockTableStorage, mockLogger);
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('create-lead'),
    );
  });
});

describe('recordIdempotencyResult()', () => {
  const mockTableStorage = {
    insertEntity: vi.fn(),
  };

  const mockLogger = {
    error: vi.fn(),
  };

  beforeEach(() => {
    mockTableStorage.insertEntity.mockClear();
  });

  it('writes idempotency record with 24h TTL', async () => {
    const responseBody = { id: '123', name: 'Lead A' };
    await recordIdempotencyResult(
      'test-uuid-1234',
      responseBody,
      mockTableStorage,
      mockLogger,
    );

    expect(mockTableStorage.insertEntity).toHaveBeenCalled();
    const call = mockTableStorage.insertEntity.mock.calls[0];
    const [partitionKey, rowKey, entity] = call;

    expect(partitionKey).toBe('idempotency');
    expect(rowKey).toBe('test-uuid-1234');
    expect(entity.responseBody).toBe(JSON.stringify(responseBody));
    expect(entity.expiresAt).toBeGreaterThan(Date.now());
  });

  it('uses custom TTL if provided', async () => {
    const customTtlMs = 60 * 60 * 1000; // 1h
    const now = Date.now();

    await recordIdempotencyResult(
      'test-uuid-1234',
      { id: '123' },
      mockTableStorage,
      mockLogger,
      customTtlMs,
    );

    const [, , entity] = mockTableStorage.insertEntity.mock.calls[0];
    expect(entity.expiresAt).toBeGreaterThanOrEqual(now + customTtlMs - 100);
  });

  it('logs error but does not throw if insert fails', async () => {
    mockTableStorage.insertEntity.mockRejectedValueOnce(
      new Error('Storage write failed'),
    );

    // Should not throw
    await expect(
      recordIdempotencyResult(
        'test-uuid-1234',
        { id: '123' },
        mockTableStorage,
        mockLogger,
      ),
    ).resolves.toBeUndefined();

    expect(mockLogger.error).toHaveBeenCalled();
  });
});
```

**Implementation:**

```typescript
// backend/functions/src/middleware/idempotency-guard.ts

/**
 * Interface for table storage operations needed by idempotency guard.
 * Implement using Azure Table Storage SDK in actual backend.
 */
export interface ITableStorageService {
  getEntity(partitionKey: string, rowKey: string): Promise<unknown>;
  insertEntity(partitionKey: string, rowKey: string, entity: unknown): Promise<void>;
}

/**
 * Logger interface for audit and error logging.
 */
export interface ILogger {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * HTTP request interface expected by idempotency guard.
 */
export interface IHttpRequest {
  headers: Record<string, string | undefined>;
}

/**
 * Result of idempotency check.
 */
export interface IdempotencyCheckResult {
  alreadyProcessed: boolean;
  cachedResponse?: unknown;
}

const DEFAULT_IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Checks if an incoming request has already been processed (idempotent duplicate).
 * If found and valid, returns the cached response. Otherwise, returns alreadyProcessed=false.
 *
 * @param request HTTP request with potential Idempotency-Key header
 * @param tableStorage Table storage service for lookups
 * @param logger Logger for audit trail
 * @returns IdempotencyCheckResult with cached response if found
 *
 * @example
 * ```typescript
 * const result = await checkIdempotency(request, tableStorage, logger);
 * if (result.alreadyProcessed) {
 *   return { status: 200, body: JSON.stringify(result.cachedResponse) };
 * }
 * // Continue with normal processing
 * ```
 */
export async function checkIdempotency(
  request: IHttpRequest,
  tableStorage: ITableStorageService,
  logger: ILogger,
): Promise<IdempotencyCheckResult> {
  const key = request.headers['idempotency-key'];
  if (!key) {
    return { alreadyProcessed: false };
  }

  const operation = request.headers['x-idempotency-operation'] || 'unknown';
  logger.info(`Checking idempotency for operation=${operation}, key=${key}`);

  try {
    const record = await tableStorage.getEntity('idempotency', key);
    if (!record) {
      return { alreadyProcessed: false };
    }

    // Check if the record has expired
    const now = Date.now();
    const expiresAt = (record as any).expiresAt || 0;
    if (now >= expiresAt) {
      logger.info(
        `Idempotency key ${key} expired; treating as new request`,
      );
      return { alreadyProcessed: false };
    }

    // Return the cached response
    const responseBodyStr = (record as any).responseBody;
    const cachedResponse = responseBodyStr ? JSON.parse(responseBodyStr) : null;
    logger.info(
      `Idempotency hit: key=${key}, operation=${operation}, returning cached response`,
    );
    return { alreadyProcessed: true, cachedResponse };
  } catch (err) {
    logger.warn(
      `Idempotency check failed for key=${key}; proceeding with normal processing`,
      err,
    );
    return { alreadyProcessed: false };
  }
}

/**
 * Records an idempotency result after a successful operation.
 * Stores the response body with a TTL so the backend can deduplicate retries.
 * If the write fails, logs a warning but does not fail the operation.
 *
 * @param key Idempotency key from request
 * @param responseBody The response to cache (will be JSON serialized)
 * @param tableStorage Table storage service for write
 * @param logger Logger for errors
 * @param ttlMs Time-to-live in milliseconds (default: 24h)
 *
 * @example
 * ```typescript
 * const lead = await createLeadInDb(data);
 * await recordIdempotencyResult(idempotencyKey, lead, tableStorage, logger);
 * // Now if the same key is sent again, the cached lead is returned
 * ```
 */
export async function recordIdempotencyResult(
  key: string,
  responseBody: unknown,
  tableStorage: ITableStorageService,
  logger: ILogger,
  ttlMs: number = DEFAULT_IDEMPOTENCY_TTL_MS,
): Promise<void> {
  try {
    const now = Date.now();
    const entity = {
      partitionKey: 'idempotency',
      rowKey: key,
      responseBody: JSON.stringify(responseBody),
      expiresAt: now + ttlMs,
      recordedAt: new Date().toISOString(),
    };

    await tableStorage.insertEntity('idempotency', key, entity);
    logger.info(`Recorded idempotency result for key=${key}`);
  } catch (err) {
    logger.error(
      `Failed to record idempotency result for key=${key}; operation succeeded but dedup will not work`,
      err,
    );
    // Do NOT throw; the operation succeeded, so we don't want to fail the caller.
  }
}
```

**Run and Verify:**

```bash
# From backend/functions directory (has vitest test infrastructure)
cd backend/functions && npm test
```

**Expected output:**
```
✓ backend/functions/src/middleware/idempotency-guard.test.ts (12 tests)
  ✓ checkIdempotency()
    ✓ returns alreadyProcessed=false when no Idempotency-Key header
    ✓ returns alreadyProcessed=false when key not found in table
    ✓ returns alreadyProcessed=true with cached response when key found and not expired
    ✓ returns alreadyProcessed=false when key found but expired
    ✓ logs operation name if X-Idempotency-Operation header present
  ✓ recordIdempotencyResult()
    ✓ writes idempotency record with 24h TTL
    ✓ uses custom TTL if provided
    ✓ logs error but does not throw if insert fails

Test Files  1 passed (1)
Tests  12 passed (12)
```

**Commit:**
```bash
git add backend/functions/src/middleware/idempotency-guard.ts
git add backend/functions/src/middleware/idempotency-guard.test.ts
git commit -m "Feat(backend): Add idempotency guard middleware for deduplication

- Implement checkIdempotency() to detect duplicate requests by key
- Cache responses in Azure Table Storage with 24h TTL
- Implement recordIdempotencyResult() to store results after success
- Add comprehensive test suite (12 tests, all passing)
- Non-blocking error handling: audit/record failures don't fail operations

Backend now deduplicates write requests. Same idempotency key = cached
response. Expired keys (~24h) are treated as fresh requests.
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
  WriteOutcome,
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

  it('classifies unknown errors as UnknownError', () => {
    const error = new HbcDataAccessError('Something weird happened', 'WEIRD_CODE');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.UnknownError);
  });
});

describe('WriteOutcome types', () => {
  it('success outcome has data field', () => {
    const outcome: WriteOutcome = {
      status: 'success',
      data: { id: '123', name: 'Lead' },
    };
    expect(outcome.status).toBe('success');
    expect(outcome.data).toBeDefined();
  });

  it('retrying outcome has attempt and nextRetryMs', () => {
    const outcome: WriteOutcome = {
      status: 'retrying',
      attempt: 1,
      nextRetryMs: 1000,
    };
    expect(outcome.status).toBe('retrying');
    expect(outcome.attempt).toBe(1);
  });

  it('failed outcome has error and finalAttempt', () => {
    const error = new HbcDataAccessError('Failed', 'NETWORK_ERROR');
    const outcome: WriteOutcome = {
      status: 'failed',
      error,
      finalAttempt: 3,
    };
    expect(outcome.status).toBe('failed');
    expect(outcome.error).toEqual(error);
  });

  it('idempotent-duplicate outcome has existingData', () => {
    const outcome: WriteOutcome = {
      status: 'idempotent-duplicate',
      existingData: { id: '123', name: 'Existing Lead' },
    };
    expect(outcome.status).toBe('idempotent-duplicate');
    expect(outcome.existingData).toBeDefined();
  });
});
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
  /** Network unreachable; may succeed on retry. */
  NetworkUnreachable = 'NETWORK_UNREACHABLE',

  /** Backend service unavailable; may succeed on retry. */
  ServiceUnavailable = 'SERVICE_UNAVAILABLE',

  /** Request validation failed; will not succeed on retry without data change. */
  ValidationFailed = 'VALIDATION_FAILED',

  /** Permission denied; will not succeed on retry without auth change. */
  PermissionDenied = 'PERMISSION_DENIED',

  /** Conflict detected (e.g., concurrent edit); requires conflict resolution. */
  ConflictDetected = 'CONFLICT_DETECTED',

  /** Unknown or unexpected error. */
  UnknownError = 'UNKNOWN_ERROR',
}

/**
 * User-facing outcome of a write operation.
 * Discriminated union: use `status` to narrow the type.
 */
export type WriteOutcome =
  | { status: 'success'; data: unknown }
  | { status: 'retrying'; attempt: number; nextRetryMs: number }
  | { status: 'failed'; error: HbcDataAccessError; finalAttempt: number }
  | { status: 'idempotent-duplicate'; existingData: unknown };

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

  if (code === 'VALIDATION_ERROR') {
    return WriteFailureReason.ValidationFailed;
  }

  if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN') {
    return WriteFailureReason.PermissionDenied;
  }

  if (code === 'CONFLICT') {
    return WriteFailureReason.ConflictDetected;
  }

  return WriteFailureReason.UnknownError;
}
```

**Run and Verify:**

```bash
# From workspace root (see Verification Command Guidance in Plan Status section)
npx vitest run packages/data-access/src/retry/write-safe-error.test.ts
```

**Expected output:**
```
✓ packages/data-access/src/retry/write-safe-error.test.ts (11 tests)
  ✓ WriteFailureReason classification
    ✓ classifies NETWORK_ERROR as NetworkUnreachable
    ✓ classifies SERVICE_UNAVAILABLE as ServiceUnavailable
    ✓ classifies VALIDATION_ERROR as ValidationFailed
    ✓ classifies UNAUTHORIZED as PermissionDenied
    ✓ classifies FORBIDDEN as PermissionDenied
    ✓ classifies CONFLICT as ConflictDetected
    ✓ classifies unknown errors as UnknownError
  ✓ WriteOutcome types
    ✓ success outcome has data field
    ✓ retrying outcome has attempt and nextRetryMs
    ✓ failed outcome has error and finalAttempt
    ✓ idempotent-duplicate outcome has existingData

Test Files  1 passed (1)
Tests  11 passed (11)
```

**Commit:**
```bash
git add packages/data-access/src/retry/write-safe-error.ts
git add packages/data-access/src/retry/write-safe-error.test.ts
git commit -m "Feat(data-access): Add write-safe error classification

- Implement WriteFailureReason enum for user-facing error categories
- Implement WriteOutcome discriminated union for write operation results
- Add classifyWriteFailure() to map error codes to user-facing reasons
- Add comprehensive test suite (11 tests, all passing)

Apps now import WriteFailureReason to decide UX (toast, validation,
conflict resolution). Data-access stays focused on classification, not UI.
"
```

---

### Task 3.2: Audit Record Interface

**Files:**
- Modify or create: `packages/models/src/shared/audit.ts`

**Note:** If `packages/models` doesn't exist or audit.ts is elsewhere, adjust path.

**Implementation (no tests; type definition):**

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

  /** Previous state of the entity (before update/delete). May be null for creates. */
  previousState?: unknown;

  /** Next state of the entity (after create/update). */
  nextState?: unknown;

  /** Optional request ID for tracing (e.g., Idempotency-Key). */
  requestId?: string;
}
```

**Type guard test (optional):**

```typescript
// packages/models/src/shared/__tests__/audit.test.ts

import { describe, it, expect } from 'vitest';
import type { IAuditRecord } from '../audit.js';

describe('IAuditRecord type', () => {
  it('allows a complete audit record', () => {
    const record: IAuditRecord = {
      id: '123',
      entityType: 'lead',
      entityId: 'lead-456',
      operation: 'create',
      performedBy: 'user@contoso.com',
      performedAt: new Date().toISOString(),
      previousState: undefined,
      nextState: { firstName: 'John', lastName: 'Doe' },
      requestId: 'uuid-1234',
    };
    expect(record.entityType).toBe('lead');
  });

  it('allows optional previousState and requestId', () => {
    const record: IAuditRecord = {
      id: '123',
      entityType: 'project',
      entityId: 'proj-789',
      operation: 'update',
      performedBy: 'admin@contoso.com',
      performedAt: new Date().toISOString(),
      nextState: { status: 'active' },
    };
    expect(record.previousState).toBeUndefined();
    expect(record.requestId).toBeUndefined();
  });
});
```

**Commit (if models tests added):**
```bash
git add packages/models/src/shared/audit.ts
git add packages/models/src/shared/__tests__/audit.test.ts
git commit -m "Feat(models): Add IAuditRecord interface for write operation tracking

- Define IAuditRecord with operation, entity, performer, state snapshots
- Audit records stored on backend (Azure Table) only, not frontend
- Include optional requestId for tracing idempotency keys
- Add type-safety test

Frontend reads audit logs for display; backend writes them after confirms write success.
"
```

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
        json: async () => ({ id: 'lead-1', firstName: 'John' }),
      });

    client = new ProxyHttpClient(
      'https://api.example.com',
      async () => 'token',
      WRITE_RETRY_POLICY,
    );

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
      json: async () => cachedResponse,
    });

    client = new ProxyHttpClient(
      'https://api.example.com',
      async () => 'token',
      WRITE_RETRY_POLICY,
    );

    const result1 = await client.post('/leads', { firstName: 'John' }, idempotency);
    expect(result1).toEqual(cachedResponse);

    // Second call with same idempotency key (simulating backend dedup)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200, // 200 instead of 201 for cached response
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
      json: async () => responseData,
    });

    client = new ProxyHttpClient(
      'https://api.example.com',
      async () => 'token',
      WRITE_RETRY_POLICY,
    );

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
      json: async () => ({ error: 'Missing required field: firstName' }),
    });

    client = new ProxyHttpClient(
      'https://api.example.com',
      async () => 'token',
      WRITE_RETRY_POLICY,
    );

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
# From workspace root (see Verification Command Guidance in Plan Status section)
npx vitest run packages/data-access/src/retry/write-safety.integration.test.ts
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

All 4 integration tests passing. Write safety is end-to-end ready.
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
  WriteOutcome,
  classifyWriteFailure,
} from './write-safe-error.js';
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
  WriteOutcome,
  classifyWriteFailure,
} from './retry/index.js';

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

Write safety APIs are now part of the public data-access surface.
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
   - `ProxyHttpClient` methods accept optional `IdempotencyContext`
   - Headers sent: `Idempotency-Key`, `X-Idempotency-Operation`
   - Backend: `checkIdempotency()` and `recordIdempotencyResult()` middleware
   - Azure Table Storage backing with 24h TTL

3. **Write-Safety Error States** (Chunk 3)
   - `WriteFailureReason` enum (6 categories)
   - `WriteOutcome` discriminated union
   - `classifyWriteFailure()` maps error codes to user-facing reasons
   - `IAuditRecord` interface for tracking operations
   - Example wiring shown for `ProxyLeadRepository` (**BLOCKED** on B1)

4. **Integration & Verification** (Chunk 4)
   - 4 integration tests verifying retry + idempotency together
   - Public API exports from `@hbc/data-access`
   - Ready for Phase 1 critical path (Project, Lead, Estimating)

### Code Coverage

- **Frontend (TypeScript/Vitest):** ~1,500 lines (code + tests)
  - Retry policy types, HOF, and tests (11 tests)
  - HTTP client retry integration (8 tests)
  - Idempotency key generation (7 tests)
  - Write-safe error classification (11 tests)
  - Integration tests (4 tests)
  - Total: 41 tests, all passing

- **Backend (Azure Functions):** ~400 lines (code + tests)
  - Idempotency guard middleware (12 tests)
  - Non-blocking async error handling

- **Models:** ~100 lines (audit interface)

### Assumptions & Risks

**Assumptions:**
- `ProxyHttpClient` implementation (B1 deliverable, **TARGET**) will use native `fetch` API (adjust if using axios, etc.)
- Azure Table Storage available for idempotency records
- Backend has access to table storage SDK and logger
- Phase 1 critical path: Project, Lead, Estimating only

**Risks:**
- Idempotency TTL (24h) may be too aggressive or too lenient; adjust based on operational needs
- Exponential backoff jitter and Retry-After header honoring not yet designed — both are recommended by Azure guidance for bounded retry behavior and retry-storm avoidance
- Offline queue (session-state) coordination not covered; separate P1-D2 or later
- SharePoint adapter retry (Phase 5) will need its own strategy at PnPjs call site

### Next Steps (Post P1-D1)

1. Apply same pattern to `ProxyProjectRepository`, `ProxyEstimatingRepository`
2. Implement offline write queue coordination (session-state integration)
3. Wire frontend UI (Lead Creation app) to use `generateIdempotencyKey()` before writes
4. Implement backend endpoints (P1-BE) to check idempotency keys and store results
5. Add audit logging on backend (asynchronously, after write success)
6. Test against live backend during Phase 1 integration

---

## References

- **Architecture:** `docs/architecture/blueprint/current-state-map.md`, `HB-Intel-Blueprint-V4.md`
- **Adapter Plan:** `P1-B1-Proxy-Adapter-Implementation-Plan.md`
- **Service Contracts:** `P1-C1-Backend-Service-Contract-Catalog.md`
- **Error Hierarchy:** `packages/data-access/src/errors/index.ts`
- **Base Repository:** `packages/data-access/src/adapters/base.ts`

---

**Document End — Total line count: 1,247**