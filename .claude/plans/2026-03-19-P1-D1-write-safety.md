# P1-D1 Write Safety and Recovery — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement D1 Write Safety and Recovery: retry policy with exponential backoff, idempotency key generation (frontend), backend idempotency guard + storage, write failure classification, and IAuditRecord interface.

**Architecture:** `@hbc/data-access` owns retry policy + idempotency context generation + failure classification. `@hbc/functions` owns backend idempotency storage, guard middleware, and cleanup timer. `ProxyHttpClient` orchestrates retry and injects idempotency headers on write calls.

**Tech Stack:** TypeScript, Vitest, @azure/data-tables (backend), Azure Functions v4 timer trigger.

**Governing spec:** `docs/architecture/plans/MASTER/phase-1-deliverables/P1-D1-Write-Safety-Retry-Recovery.md`

**Key adaptation:** D1 spec (Task 1.2) was written before B1 delivered `ProxyHttpClient.ts`. We MODIFY existing `ProxyHttpClient.ts` rather than creating a new `http-client.ts`.

---

## File Map

**Create:**
- `packages/data-access/src/retry/retry-policy.ts` — RetryPolicy interface, defaults, withRetry HOF
- `packages/data-access/src/retry/retry-policy.test.ts` — 11 tests
- `packages/data-access/src/retry/idempotency.ts` — IdempotencyContext, generateIdempotencyKey, isExpired
- `packages/data-access/src/retry/idempotency.test.ts` — 7 tests
- `packages/data-access/src/write-safety/failure-classification.ts` — WriteFailureReason enum, classifyWriteFailure
- `packages/data-access/src/write-safety/failure-classification.test.ts` — ~10 tests
- `packages/data-access/src/write-safety/audit.ts` — IAuditRecord interface
- `backend/functions/src/services/idempotency-storage-service.ts` — IIdempotencyStorageService, real + mock
- `backend/functions/src/idempotency/idempotency-guard.ts` — checkIdempotency, recordIdempotencyResult
- `backend/functions/src/idempotency/with-idempotency.ts` — withIdempotency wrapper
- `backend/functions/src/functions/cleanupIdempotency/index.ts` — timer trigger

**Modify:**
- `packages/data-access/src/adapters/proxy/types.ts` — add readPolicy?, writePolicy? to ProxyConfig
- `packages/data-access/src/adapters/proxy/ProxyHttpClient.ts` — wrap requestRaw with withRetry, inject idempotency headers on post/put
- `packages/data-access/src/index.ts` — export retry + write-safety symbols
- `backend/functions/src/services/service-factory.ts` — add idempotency to IServiceContainer

---

## Task 1.1: retry-policy.ts + tests

**Files:**
- Create: `packages/data-access/src/retry/retry-policy.ts`
- Create: `packages/data-access/src/retry/retry-policy.test.ts`

- [ ] Write `retry-policy.ts` with `RetryPolicy` interface, `DEFAULT_RETRY_POLICY`, `READ_RETRY_POLICY`, `WRITE_RETRY_POLICY`, and `withRetry<T>(fn, policy, onRetry?)` HOF implementing bounded exponential backoff with ±25% jitter, Retry-After header support, maxTotalDurationMs guard, and retryable status code logic
- [ ] Write `retry-policy.test.ts` covering: success on first attempt, success after N retries, exhausted retries throw, jitter in delay, max duration guard, Retry-After honoring, NETWORK_ERROR retries, TIMEOUT retries, 409 non-retryable, 401 non-retryable, onRetry callback fires
- [ ] Run: `cd /sessions/zen-peaceful-curie/mnt/hb-intel && pnpm --filter @hbc/data-access run test 2>&1 | tail -20` — expect all tests pass

## Task 1.2: ProxyHttpClient.ts + types.ts modifications

**Files:**
- Modify: `packages/data-access/src/adapters/proxy/types.ts`
- Modify: `packages/data-access/src/adapters/proxy/ProxyHttpClient.ts`

- [ ] Add `readPolicy?: RetryPolicy` and `writePolicy?: RetryPolicy` to `ProxyConfig` in `types.ts`
- [ ] Import `withRetry` and `RetryPolicy` in `ProxyHttpClient.ts`; wire `withRetry()` around the `fetch` call in `requestRaw()` selecting policy by HTTP method (GET/HEAD → readPolicy, POST/PUT/PATCH/DELETE → writePolicy)
- [ ] Add `idempotency?: IdempotencyContext` as optional parameter to `post()` and `put()`; inject `Idempotency-Key` and `X-Idempotency-Operation` headers in `requestRaw()` when context present
- [ ] Run: `cd /sessions/zen-peaceful-curie/mnt/hb-intel && pnpm --filter @hbc/data-access run check-types 2>&1 | tail -20`

## Task 2.1: idempotency.ts + tests (frontend)

**Files:**
- Create: `packages/data-access/src/retry/idempotency.ts`
- Create: `packages/data-access/src/retry/idempotency.test.ts`

- [ ] Write `idempotency.ts`: `IdempotencyContext { key: string, operation: string, createdAt: number, expiresAt: number }`, `generateIdempotencyKey(operation, ttlMs=86400000)` using `crypto.randomUUID()`, `isExpired(ctx)` returning boolean
- [ ] Write `idempotency.test.ts`: key is UUID format, operation stored correctly, expiresAt = createdAt + ttlMs, isExpired false for fresh context, isExpired true for past expiresAt, custom TTL applied, multiple calls produce unique keys
- [ ] Run tests — expect all pass

## Task 2.2: Backend idempotency services

**Files:**
- Create: `backend/functions/src/services/idempotency-storage-service.ts`
- Create: `backend/functions/src/idempotency/idempotency-guard.ts`
- Create: `backend/functions/src/idempotency/with-idempotency.ts`
- Create: `backend/functions/src/functions/cleanupIdempotency/index.ts`
- Modify: `backend/functions/src/services/service-factory.ts`

- [ ] Write `idempotency-storage-service.ts`: `IIdempotencyStorageService` interface with `getRecord(key)`, `saveRecord(record)`; `IIdempotencyRecord { partitionKey, rowKey, statusCode, responseBodyJson, expiresAt, recordedAt, recordedBy }`; `RealIdempotencyStorageService` using `TableClient.fromConnectionString(conn, 'IdempotencyRecords')` with `ensureTable()`; `MockIdempotencyStorageService` with in-memory Map
- [ ] Write `idempotency-guard.ts`: `checkIdempotency(key, operation, service, logger)` — fail-open (catch + log, return null on error), return cached response if record found; `recordIdempotencyResult(key, operation, statusCode, body, upn, service, logger)` — fire-and-forget with `.catch()`
- [ ] Write `with-idempotency.ts`: `withIdempotency(handler)` wrapping an Azure Function handler, extracting `Idempotency-Key` and `X-Idempotency-Operation` headers, calling `checkIdempotency` → early return cached response if hit → call handler → call `recordIdempotencyResult` non-blocking
- [ ] Write `cleanupIdempotency/index.ts`: timer trigger (`0 0 2 * * *` = 2am daily), deletes records with `expiresAt < Date.now()` using table odata filter
- [ ] Add `idempotency: IIdempotencyStorageService` to `IServiceContainer` and `createServiceFactory()` (mock/real branching)
- [ ] Run: `cd /sessions/zen-peaceful-curie/mnt/hb-intel && pnpm --filter @hbc/functions run check-types 2>&1 | tail -20`

## Task 3.1: failure-classification.ts + tests

**Files:**
- Create: `packages/data-access/src/write-safety/failure-classification.ts`
- Create: `packages/data-access/src/write-safety/failure-classification.test.ts`

- [ ] Write `failure-classification.ts`: `WriteFailureReason` enum (NETWORK_ERROR, TIMEOUT, CONFLICT, VALIDATION_ERROR, AUTH_ERROR, NOT_FOUND, SERVER_ERROR, UNKNOWN); `classifyWriteFailure(error: unknown): WriteFailureReason` mapping `HbcDataAccessError` codes and HTTP status-derived codes to enum values
- [ ] Write tests: each enum member mapped from appropriate error, unknown error → UNKNOWN, null/undefined → UNKNOWN
- [ ] Run tests — expect all pass

## Task 3.2: IAuditRecord interface

**Files:**
- Create: `packages/data-access/src/write-safety/audit.ts`

- [ ] Write `audit.ts`: `IAuditRecord { operation: string, domain: string, entityId: string | number, userId: string, timestamp: string, payload?: unknown, outcome: 'success' | 'failure', failureReason?: WriteFailureReason }`

## Task 4: Barrel exports

**Files:**
- Modify: `packages/data-access/src/index.ts`

- [ ] Export `RetryPolicy`, `DEFAULT_RETRY_POLICY`, `READ_RETRY_POLICY`, `WRITE_RETRY_POLICY`, `withRetry` from `./retry/retry-policy.js`
- [ ] Export `IdempotencyContext`, `generateIdempotencyKey`, `isExpired` from `./retry/idempotency.js`
- [ ] Export `WriteFailureReason`, `classifyWriteFailure` from `./write-safety/failure-classification.js`
- [ ] Export type `IAuditRecord` from `./write-safety/audit.js`
- [ ] Run: `pnpm --filter @hbc/data-access run check-types && pnpm --filter @hbc/data-access run test`

## Final Verification

- [ ] `cd /sessions/zen-peaceful-curie/mnt/hb-intel && pnpm --filter @hbc/data-access run check-types`
- [ ] `cd /sessions/zen-peaceful-curie/mnt/hb-intel && pnpm --filter @hbc/data-access run lint`
- [ ] `cd /sessions/zen-peaceful-curie/mnt/hb-intel && pnpm --filter @hbc/data-access run test`
- [ ] `cd /sessions/zen-peaceful-curie/mnt/hb-intel && pnpm --filter @hbc/functions run check-types`
- [ ] `cd /sessions/zen-peaceful-curie/mnt/hb-intel && pnpm --filter @hbc/functions run lint`
- [ ] Bump `@hbc/data-access` version `0.3.9` → `0.4.0`
- [ ] Bump `@hbc/functions` version `0.0.33` → `0.0.34`
- [ ] Prepare conventional commit message
