| Field | Value |
|---|---|
| **Document ID** | P1-B1 |
| **Phase** | Phase 1 — Production Data Plane and Integration Backbone |
| **Workstream** | B — Adapter Completion |
| **Document Type** | Engineering Plan |
| **Status** | Draft v2 — corrected against repo truth |
| **Last Updated** | 2026-03-18 |
| **Owner** | Frontend Platform / Data Access |

# Proxy Adapter Implementation Plan

**Goal:** Implement a production-ready HTTP proxy adapter for the HB Intel frontend PWA, enabling all 11 domain repositories to communicate with Azure Functions backend via Bearer token authentication.

**Audience:** Developers implementing proxy adapter repositories with zero prior HB Intel codebase knowledge.

**Approach:** Test-driven development (TDD) with checkpoint commits after each task. Full TypeScript implementations, exact test harnesses, and complete factory wiring.

**Architecture:** The proxy adapter follows the factory pattern established in `factory.ts`. Each domain repository (e.g., `ProxyLeadRepository`) implements the corresponding port interface (e.g., `ILeadRepository`) by delegating HTTP calls through a shared `ProxyHttpClient`. The client handles auth headers, request tracing, and error translation. Each repository has its own domain-specific contract — method names, entity types, and query patterns vary per domain. Only Lead follows a generic CRUD+search shape; most repositories are project-scoped, handle multiple entity types, or have entirely non-CRUD contracts (e.g., Auth).

**Tech Stack:**
- TypeScript, Vitest (mocked `fetch`)
- Native `fetch` API (Node 18+), zero third-party HTTP libraries
- Bearer token from frontend context; backend performs MSAL OBO internally (OBO implementation is a P1-C2/backend dependency; B1 sends the token but does not validate or handle OBO failures beyond HTTP error translation)
- Error translation: HTTP status codes → `NotFoundError`, `ValidationError`, `HbcDataAccessError`

**Governance:**
- Authority: `factory.ts`, `base.ts`, error hierarchy in `errors/index.ts`
- Test pattern: mirror the mock adapter structure
- Factory wiring: follow existing switch pattern, remove `AdapterNotImplementedError` throws for proxy mode

---

## Scope

### In Scope

- `ProxyHttpClient` HTTP client with Bearer auth, error translation, timeout, and request tracing
- `ProxyBaseRepository<T>` abstract base with path building, project-scoped paths, and query marshaling
- 11 concrete proxy repository implementations matching their port interfaces in `@hbc/data-access`
- Factory wiring: `setProxyContext()`, lazy `ProxyHttpClient` singleton, factory switch for proxy mode
- Test infrastructure: vitest setup for `@hbc/data-access`, 100+ unit and integration tests with mocked `fetch`
- PWA bootstrap guidance for proxy activation (code example for `main.tsx`, not code changes)

### Out of Scope

| Concern | Owner | Reference |
|---|---|---|
| Backend Azure Functions routes and handlers | P1-C1 | Backend Service Contract Catalog |
| Auth middleware, token validation, OBO exchange | P1-C2 | Backend Auth and Validation Hardening |
| Retry logic, idempotency keys, failure classification | P1-D1 | Write Safety, Retry, Recovery |
| Contract testing with Zod schemas and MSW handlers | P1-E1 | Contract Test Suite Plan |
| SharePoint adapter implementation | P1-B2 | Adapter Completion Backlog |
| API adapter implementation | P1-B2 | Adapter Completion Backlog |
| Mock adapter changes | — | Existing mock adapters are untouched |

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| **Proxy pattern over direct API** | PWA must reach Azure Functions backend over HTTP; proxy adapter is the production data path for all domain repositories |
| **Factory + lazy singleton** | Consistent with the existing mock adapter factory pattern; provides DI-like behavior without a framework; `setProxyContext` defers initialization until MSAL is ready |
| **Token-provider function, not static token** | MSAL tokens expire (~1 hour); `getToken()` is called per-request to ensure fresh tokens via `acquireTokenSilent()` |
| **TDD with mocked fetch** | Proxy adapters are fully testable in isolation before any backend exists; mocked `fetch` validates HTTP method, path, headers, and error translation without network calls |
| **No retry in B1** | Retry is a transport-layer concern owned by P1-D1; B1 provides the `ProxyHttpClient` injection surface that D1 will wrap with `withRetry()` |
| **Domain-specific method names** | Port interfaces define the contract; proxy adapters implement the actual interface, not a generic CRUD template |

---

## Blockers, Assumptions, and Open Decisions

This section provides a consolidated view of execution risk for delivery planning. Items are categorized by their impact on implementation sequencing.

### Current Blockers

| Blocker | Impact | Resolution Path | Blocks |
|---|---|---|---|
| No vitest infrastructure in `@hbc/data-access` | Cannot run any tests | Task 0 adds vitest config and test script | All test tasks (1–10) |

**Not a B1 blocker:** SharePoint list schema approval (pending with Product Owner + Business Domains) affects SharePoint/production adapters but does NOT block proxy adapter work. Proxy adapters target Azure Functions via HTTP, not SharePoint directly.

### Explicit Assumptions

B1 is proceeding under these assumptions. Each is labeled with where verification must come from.

| # | Assumption | Verify With | Current Confidence | Reference |
|---|---|---|---|---|
| A1 | API paths follow C1 catalog patterns (e.g., `/api/leads`, `/api/projects/{id}`) | P1-C1 | Medium — Leads/Projects/Estimating paths locked; 8 domains provisional | Appendix A |
| A2 | Collection response envelope: `{ items: T[], total, page, pageSize }` | P1-C1, P1-E1 | **LOCKED** — E1 locked decision confirms `items` field (not `data`) | Appendix B |
| A3 | Single-item response envelope: `{ data: T }` | P1-C1 | High — C1 confirms this shape | Appendix B |
| A4 | Error responses use `message` as primary field | P1-C1, P1-E1 | **LOCKED** — D3 resolved: `message` is primary (not `error`). `extractErrorMessage()` should read `.message` first, `.error` fallback for pre-Phase-1 routes | Appendix B |
| A5 | Default pageSize is 25, max 100 | P1-C1, P1-E1 | **LOCKED** — D4 resolved: default 25, max 100 (see P1-E1 PaginationQuerySchema) | Appendix B |
| A6 | Bearer token in `Authorization` header is accepted by backend | P1-C2 | High — standard pattern | Cross-Workstream Boundaries |
| A7 | Project-scoped routes use nested paths (`/api/projects/{projectId}/{domain}`) | P1-C1, P1-E1 | **LOCKED** — D6 resolved: nested paths confirmed (not flat `?projectId=` query params) | Appendix A |
| A8 | Aggregate endpoints exist (portfolio summary, metrics, summaries, management) | P1-C1 | **Low** — not in C1 catalog; B1-assumed | Appendix A |
| A9 | Auth management routes (`/api/auth/*`) exist in backend | P1-C2 | Low — no C1 route defined; C2 owns auth subsystem | Appendix A, Tier 3 |

### Open Decisions

These must be resolved before production activation. B1 implementation can proceed with mocked `fetch` but the adapter code will need updates once decisions are made.

| # | Decision | Owner | Impact | When Needed |
|---|---|---|---|---|
| D1 | Singular vs plural route paths (schedule, buyout, risk, scorecard) | P1-C1 | Path constants in 4 repos + tests | Before production activation |
| D2 | Estimating sub-resource routing (`/trackers`, `/kickoffs`) vs flat `/api/estimating` | P1-C1 | May restructure estimating adapter | Before Task 5 implementation ideally |
| D3 | Error envelope field name (`.message` vs `.error`) | P1-C1 + B1 | `ProxyHttpClient.handleResponse()` update | Before production activation |
| D4 | Pagination default alignment (B1: 25 via `DEFAULT_PAGE_SIZE`, C1: 50) | P1-C1 + B1 | `mapPagedResponse` fallback + model constants | Before production activation |
| D5 | Whether proxy adapters need PATCH support | P1-C1 | C1 defines PATCH routes; B1 uses PUT only | Before production activation |
| D6 | Nested project-scoped paths vs flat query-param pattern | P1-C1 | Affects 8 project-scoped repos | Before production activation |

### Deferred Items

These are explicitly out of B1 scope and owned by other workstreams.

| Item | Deferred To | Reference |
|---|---|---|
| Retry logic, backoff strategy, failure classification | P1-D1 (Write Safety, Retry, Recovery) | B1 provides `ProxyHttpClient` injection surface |
| Contract testing with Zod schemas | P1-E1 (Contract Test Suite) | B1 tests use mocked `fetch`, not Zod validation |
| SharePoint adapter implementation | P1-B2 (Adapter Completion Backlog) | Different adapter mode, different data path |
| API adapter implementation | P1-B2 (Adapter Completion Backlog) | Future adapter mode |
| Mock isolation policy enforcement | P1-B3 (Mock Isolation Policy) | Governs when mock mode is allowed |
| Backend OBO token exchange | P1-C2 (Auth Hardening) | B1 sends frontend token; backend handles OBO |
| Idempotency key generation and tracking | P1-D1 | Transport-layer concern |

### Implementation Sequencing Guidance

| Phase | Tasks | Status | Dependencies |
|---|---|---|---|
| **Proceed now** | Tasks 0–4 (vitest setup, HTTP client, base repo, Lead, Project) | No external blockers | Foundational work independent of unresolved C1 decisions |
| **Proceed with caution** | Tasks 5–7 (remaining 9 domain repos) | API paths are provisional | Implementation valid against mocked `fetch`; paths may change when C1 freezes. Estimating adapter (Task 5) has highest C1 dependency due to sub-resource routing question (D2) |
| **Proceed** | Tasks 8–10 (factory wiring, integration tests, full suite) | No external blockers for test scope | Factory code and mocked integration tests are independent of C1/C2 |
| **Requires upstream resolution** | Production activation | Blocked | C1 route finalization, C2 auth middleware, MSAL registration, error envelope alignment (D3), path reconciliation (D1, D6), deployment env vars |

---

## Runtime Activation and Factory Reconciliation

This section explains how proxy mode is activated in production, how the existing `ProxyConfig` type relates to `ProxyHttpClientOptions`, and what external dependencies must be satisfied before proxy adapters can function.

### Adapter Mode Resolution

The factory function `resolveAdapterMode()` in `factory.ts` reads `process.env.HBC_ADAPTER_MODE` and returns one of `'mock' | 'sharepoint' | 'proxy' | 'api'`. If the env var is missing or unrecognized, it **silently defaults to `'mock'`**.

The env var is injected at build time via Vite `define`:

| Surface | Build Config | Dev Default | Prod Default |
|---|---|---|---|
| **PWA** | `process.env.VITE_ADAPTER_MODE` | `'mock'` | `'proxy'` |
| **dev-harness** | hardcoded | `'mock'` | `'mock'` |

**Proxy mode is the production default for PWA builds.** Developers do not need to set an env var for proxy mode to activate in production — the Vite config handles it:

```typescript
// apps/pwa/vite.config.ts (relevant excerpt)
define: {
  'process.env.HBC_ADAPTER_MODE': JSON.stringify(
    process.env.VITE_ADAPTER_MODE ?? (mode === 'development' ? 'mock' : 'proxy'),
  ),
}
```

### ProxyConfig Reconciliation

The existing `ProxyConfig` type in `adapters/proxy/types.ts` defines:

```typescript
interface ProxyConfig {
  baseUrl: string;
  accessToken?: string;   // static token string
  timeout?: number;
  retryCount?: number;
}
```

This plan evolves the config contract for proxy HTTP usage:

- **`accessToken?: string` → `getToken: () => Promise<string>`** — MSAL tokens expire (typically 1 hour) and must be acquired per-request via `acquireTokenSilent()`. A static token string is insufficient for production use. The `ProxyHttpClientOptions` type introduced in Task 1 replaces the static token with a token-provider function.
- **`timeout`** — preserved. `ProxyHttpClientOptions.timeout` defaults to `DEFAULT_TIMEOUT_MS` (30,000 ms) from `adapters/proxy/constants.ts`.
- **`retryCount`** — **deferred**. The existing `DEFAULT_RETRY_COUNT = 3` constant is preserved for future use, but this plan does NOT implement retry logic in `ProxyHttpClient`. Retry handling is a P1-D1 (Write Safety, Retry, Recovery) concern that requires decisions about which errors are retryable, backoff strategy, and interaction with token refresh. D1 injects retry logic at the HTTP transport layer by wrapping `ProxyHttpClient`, not inside repositories. This is explicitly a pending decision owned by D1.
- **`ProxyConfig` itself is NOT deleted.** It remains as the stub-phase contract in `types.ts`. `ProxyHttpClientOptions` is the runtime contract used by `ProxyHttpClient`. A future cleanup pass may unify them or deprecate `ProxyConfig`.

### Timeout and Retry Reconciliation

| Concern | This Plan (P1-B1) | Existing Constant | Resolution |
|---|---|---|---|
| Timeout | `ProxyHttpClient` constructor default | `DEFAULT_TIMEOUT_MS = 30_000` | Use `DEFAULT_TIMEOUT_MS` — import from constants, not hardcode |
| Retry | Not implemented | `DEFAULT_RETRY_COUNT = 3` | **Deferred.** Constant preserved; no retry logic in P1-B1 scope |

### PWA Bootstrap Activation

Proxy context must be initialized **after MSAL authentication completes** and **before the React tree renders**. The call site is `apps/pwa/src/main.tsx`:

```typescript
// apps/pwa/src/main.tsx — proxy activation (example implementation guidance, not a B1 code change)

import { setProxyContext, resolveAdapterMode } from '@hbc/data-access';
import { msalInstance } from './auth/msal-init.js';

// After MSAL init, before React render:
if (resolveAdapterMode() === 'proxy') {
  const baseUrl = import.meta.env.VITE_PROXY_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      'VITE_PROXY_BASE_URL must be set for proxy mode. '
      + 'Check .env.production or deployment config.',
    );
  }
  setProxyContext(baseUrl, async () => {
    const account = msalInstance.getActiveAccount();
    if (!account) {
      throw new Error('No active MSAL account — user must be signed in before proxy calls');
    }
    const response = await msalInstance.acquireTokenSilent({
      scopes: [import.meta.env.VITE_API_SCOPE],
      account,
    });
    return response.accessToken;
  });
}
```

**Key points:**
- `resolveAdapterMode` and `setProxyContext` are both exported from `@hbc/data-access` (via `factory.ts`)
- `VITE_PROXY_BASE_URL` is a build-time env var (e.g., `https://func-hb-intel.azurewebsites.net/api`)
- `VITE_API_SCOPE` is the Azure Functions app registration scope (e.g., `api://func-hb-intel/.default`)
- The token provider is called on **every HTTP request** — tokens are never cached by `ProxyHttpClient`
- If proxy mode is active but context is not initialized, `getProxyContext()` throws immediately (see Task 8)
- This snippet is **implementation guidance** — B1 does not modify `main.tsx` directly (see Package Ownership)

### Silent Mock Fallback Prevention

In production proxy builds, two guards prevent silent mock fallback:

1. **Compile-time guard:** PWA Vite config injects `HBC_ADAPTER_MODE = 'proxy'` into the bundle at build time. The env var cannot be absent at runtime because it is baked into the JavaScript output.

2. **Runtime guard:** Even if `resolveAdapterMode()` somehow returns `'proxy'`, the `getProxyContext()` function (Task 8) throws `Error('Proxy adapter context not initialized')` if `setProxyContext()` was never called. This prevents a proxy factory call from silently constructing a broken repository.

Together these guards ensure that:
- Dev mode uses mock adapters explicitly
- Prod mode activates proxy adapters explicitly
- Missing configuration fails loudly, never silently

---

## Cross-Workstream Boundaries

B1 is the **frontend-side HTTP client and domain adapter** workstream. It owns the proxy adapter implementation, factory wiring, and adapter-level tests. It does NOT own backend routes, auth middleware, retry/recovery, or contract validation. The following sections define where B1 ends and where each adjacent workstream begins.

### B1 Task Responsibility Matrix

| B1 Task | B1 Owns | Depends on C1 | Depends on C2 | Depends on D1 | Depends on E1 |
|---|---|---|---|---|---|
| Task 1: ProxyHttpClient | HTTP client, error translation, timeout, header injection | Error response shape (`{ error }` per C1, `.message` fallback — D3) | Bearer token format; 401/403 behavior | Retry policy injection point (deferred to D1) | — |
| Task 2: ProxyBaseRepository | Path building, query marshaling, paged response mapping | Paginated response shape (`{ data, total, page, pageSize }`) | — | — | — |
| Task 3: ProxyLeadRepository | Lead adapter implementation + tests | `/api/leads` endpoint paths and response contract | Auth middleware on lead routes | — | Lead contract schema |
| Task 4: ProxyProjectRepository | Project adapter implementation + tests | `/api/projects` endpoint paths and response contract | Auth middleware on project routes | — | Project contract schema |
| Tasks 5–7: Remaining 9 repos | Domain adapter implementations + tests | All domain endpoint paths and response contracts | Auth middleware on all domain routes | — | All domain contract schemas |
| Task 8: Factory wiring | `setProxyContext`, lazy `ProxyHttpClient` singleton, factory switch | — | MSAL app registration; API scopes | — | — |
| Task 9: Integration tests | Factory-level test with mocked fetch | Expected response shapes | Token provider behavior | — | — |
| Task 10: Full suite | Package-level verification | — | — | — | — |

### Dependency: P1-C1 — Backend Service Contract Catalog

**What B1 assumes from C1 (updated per locked decisions 2026-03-18):**
- Endpoint paths: Lead/Project/Estimating base paths locked; project-scoped domains use nested paths `/api/projects/{projectId}/{domain}` per D6 lock
- Response envelope shape: `{ items: T[], total, page, pageSize }` for paginated lists (D4: default 25, max 100), `{ data: T }` for single-entity responses
- Error response shape: `{ message, code, requestId?, details? }` — `message` is primary field per D3 lock. `extractErrorMessage()` should read `.message` first, `.error` fallback for pre-Phase-1 routes only
- HTTP status code semantics: 404 for not found, 422 for validation, 401/403 for auth

**Note:** Appendix B route paths for all 7 project-scoped domains were updated 2026-03-18 to use the D6 nested pattern (`/api/projects/{projectId}/{domain}`). Pseudocode examples in the implementation chunks may still reference the pre-D6 flat pattern as contextual commentary — the Appendix B route tables are authoritative.

**Blocking semantics:**
- B1 **can proceed before C1 is complete** because all HTTP calls are behind mocked `fetch` in tests
- **Production activation requires C1** — real backend routes must be deployed and accessible
- **Once C1 is frozen, B1 must reconcile** any path or response shape differences

**What B1 does NOT own:**
- Backend route handlers, middleware, request validation, database queries, response assembly — all C1

### Dependency: P1-C2 — Backend Auth and Validation Hardening

**What B1 assumes from C2:**
- Bearer token in `Authorization` header is the auth mechanism
- Backend returns 401 for invalid/expired tokens, 403 for insufficient permissions
- MSAL app registration exists with correct API scopes for the Functions app
- Backend OBO flow is implemented (B1 sends the frontend token; backend exchanges it for downstream access)

**Blocking semantics:**
- B1 **can proceed before C2 is complete** because token acquisition is mocked in tests
- **Production activation requires C2** — without auth middleware, backend will reject or ignore tokens
- B1 error translation (401→`UNAUTHORIZED`, 403→`FORBIDDEN`) must match C2's middleware behavior

**What B1 does NOT own:**
- Token validation, role checking, permission enforcement, Zod request validation, OBO exchange — all C2

### Dependency: P1-D1 — Write Safety, Retry, and Recovery

**What B1 defers to D1:**
- Retry policy types and `withRetry` higher-order function
- Idempotency key generation and tracking
- Failure classification (transient vs structural vs permissions)
- Backoff strategy and interaction with token refresh

**Blocking semantics:**
- **B1 does NOT block on D1.** B1 ships without retry capability
- D1 injects retry logic at the HTTP transport layer by wrapping or extending `ProxyHttpClient`, not inside individual repositories
- B1's `getProxyHttpClient()` lazy singleton in factory.ts is the injection point for D1
- The existing `DEFAULT_RETRY_COUNT = 3` constant is preserved for D1's use but is unused in B1

**What B1 does NOT own:**
- Retry logic, idempotency guards, write-safe error states, audit trail infrastructure — all D1

### Dependency: P1-E1 — Contract Test Suite

**What B1 defers to E1:**
- Shared Zod schemas in `@hbc/models/contracts/` for runtime contract validation
- MSW v2 handlers simulating real backend behavior in frontend tests
- Backend route shape validation against Zod schemas

**Blocking semantics:**
- **B1 does NOT block on E1.** B1 tests are self-contained with manually mocked `fetch` responses
- B1 tests verify adapter behavior against mocked HTTP responses, **not** against real backend contracts — this is explicitly not contract validation
- Once E1 Zod schemas exist, B1 tests should be upgraded to validate mock responses against them as a future enhancement

**What B1 does NOT own:**
- Contract schema definition, MSW handler authoring, backend shape validation — all E1

### Operational Dependencies (Outside All Workstreams)

| Dependency | Owner | Required For | Status |
|---|---|---|---|
| Azure Functions API deployed and accessible | Backend/DevOps | Production proxy activation | Pending |
| CORS configuration on Azure Functions for PWA origin | Backend/DevOps | Cross-origin requests from PWA | Pending |
| `VITE_PROXY_BASE_URL` env var in deployment config | DevOps | Proxy base URL resolution | Pending |
| `VITE_API_SCOPE` env var in deployment config | DevOps | MSAL token scope | Pending |

Until these operational dependencies are met, proxy mode will authenticate and construct requests but receive backend errors. The proxy adapter error translation (Task 1) will surface these as `HbcDataAccessError` with appropriate codes.

---

## Test Strategy

### Current State

`@hbc/data-access` currently has **no test infrastructure**: no `test` script, no vitest config, and no test files. Only `check-types` (`tsc --noEmit`), `lint` (`eslint`), and `build` (`tsc`) scripts exist. Task 0 below must be completed before any test commands in this plan become runnable.

### B1 Test Tiers

**Tier 1 — Unit tests (owned by B1):**
- `ProxyHttpClient`: mocked global `fetch`, error translation, Bearer header injection, timeout behavior, request tracing
- `ProxyBaseRepository`: path building, project-scoped path building, query param marshaling, paginated response mapping
- All 11 repository adapters: mocked `httpClient` via `vi.spyOn`, method delegation, domain-specific error handling
- These tests use `vi.stubGlobal('fetch', mockFetch)` or `vi.spyOn(httpClient, method)` — no network calls

**Tier 2 — Integration tests (owned by B1):**
- Factory wiring: `setProxyContext` → `createLeadRepository('proxy')` → method call with mocked fetch
- Verifies lazy `ProxyHttpClient` singleton, token provider per-request calls, cross-repository HTTP client reuse
- Uses mocked `fetch` — no real backend required

**NOT B1 scope (owned by P1-E1):**
- Contract validation against Zod schemas
- MSW v2 handler tests simulating real backend behavior
- Response shape conformance checks between frontend expectations and backend output
- B1 tests verify adapter behavior against manually mocked responses, not against real or simulated backend contracts

### Verification Command Reference

After Task 0 is complete, these commands become available:

| Command | What It Validates |
|---|---|
| `pnpm --filter @hbc/data-access test` | Run all vitest tests in the package |
| `pnpm --filter @hbc/data-access test -- http-client` | Run tests matching "http-client" |
| `pnpm --filter @hbc/data-access check-types` | TypeScript type checking (available now) |
| `pnpm --filter @hbc/data-access lint` | ESLint (available now) |
| `pnpm --filter @hbc/data-access build` | TypeScript compilation (available now) |

---

## Chunk 0: Test Infrastructure Prerequisite

### Task 0: Set up vitest for `@hbc/data-access`

**Prerequisite for all subsequent tasks.** This task must be completed before any test commands in this plan are runnable.

**Steps:**

1. Add vitest as a dev dependency (already available in workspace — reference existing vitest config from another tested package like `@hbc/auth`):

```bash
pnpm --filter @hbc/data-access add -D vitest
```

2. Create `packages/data-access/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

3. Add `test` script to `packages/data-access/package.json`:

```json
"scripts": {
  "build": "tsc --project tsconfig.json",
  "check-types": "tsc --noEmit",
  "lint": "eslint src/ --ext .ts,.tsx",
  "test": "vitest run"
}
```

4. Add `@hbc/data-access` to the root `package.json` test filter so workspace-level `pnpm test` includes it.

**Verification:**

```bash
# These commands are available now (no Task 0 needed):
pnpm --filter @hbc/data-access check-types
pnpm --filter @hbc/data-access lint

# After Task 0 — verify vitest runs (will show 0 tests initially):
pnpm --filter @hbc/data-access test
# Expected: vitest runs successfully with 0 test suites

# Commit:
# git commit -m "chore: add vitest test infrastructure to @hbc/data-access"
```

---

## Chunk 1: HTTP Client Foundation (≈450 lines)

### Task 1: Create `ProxyHttpClient` class

**Files:**
- Create: `packages/data-access/src/adapters/proxy/http-client.ts`
- Create: `packages/data-access/src/adapters/proxy/http-client.test.ts`

**Implementation:**

```typescript
// packages/data-access/src/adapters/proxy/http-client.ts

import { NotFoundError, ValidationError, HbcDataAccessError } from '../../errors/index.js';
import { DEFAULT_TIMEOUT_MS } from './constants.js';

/**
 * Configuration for ProxyHttpClient.
 * Aligned with the existing ProxyConfig contract in types.ts but uses a
 * token-provider function instead of a static accessToken string, because
 * MSAL tokens expire and must be acquired per-request.
 */
export interface ProxyHttpClientOptions {
  baseUrl: string;
  getToken: () => Promise<string>;
  timeout?: number;  // defaults to DEFAULT_TIMEOUT_MS (30,000 ms)
}

/**
 * HTTP client for proxy adapter.
 * Handles Bearer auth, request tracing (X-Request-Id), error translation,
 * and header injection for Azure Functions backend.
 *
 * Does NOT retry on failure — retry logic is deferred to P1-D1 (Write Safety, Retry, Recovery).
 * The existing DEFAULT_RETRY_COUNT constant is preserved but unused here.
 * Does NOT handle MSAL OBO; the backend performs OBO internally.
 */
export class ProxyHttpClient {
  private readonly baseUrl: string;
  private readonly getToken: () => Promise<string>;
  private readonly timeoutMs: number;

  constructor(options: ProxyHttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.getToken = options.getToken;
    this.timeoutMs = options.timeout ?? DEFAULT_TIMEOUT_MS;
  }

  /**
   * Execute a GET request.
   * @param path - URL path (e.g. "/api/leads")
   * @param params - Optional query string parameters
   * @returns Parsed JSON response as T
   * @throws {NotFoundError} on 404
   * @throws {ValidationError} on 422
   * @throws {HbcDataAccessError} on other errors
   */
  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>(url, {
      method: 'GET',
    });
  }

  /**
   * Execute a POST request with JSON body.
   * @param path - URL path (e.g. "/api/leads")
   * @param body - Request body (will be JSON-stringified)
   * @returns Parsed JSON response as T
   * @throws {ValidationError} on 422
   * @throws {HbcDataAccessError} on other errors
   */
  async post<T>(path: string, body: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Execute a PUT request with JSON body.
   * @param path - URL path (e.g. "/api/leads/123")
   * @param body - Request body (will be JSON-stringified)
   * @returns Parsed JSON response as T
   * @throws {NotFoundError} on 404
   * @throws {ValidationError} on 422
   * @throws {HbcDataAccessError} on other errors
   */
  async put<T>(path: string, body: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * Execute a DELETE request.
   * @param path - URL path (e.g. "/api/leads/123")
   * @throws {NotFoundError} on 404
   * @throws {HbcDataAccessError} on other errors
   */
  async delete(path: string): Promise<void> {
    const url = this.buildUrl(path);
    await this.request<unknown>(url, {
      method: 'DELETE',
    });
  }

  // Private helpers

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.set(key, value);
        }
      });
    }
    return url.toString();
  }

  private async request<T>(
    url: string,
    init: RequestInit,
  ): Promise<T> {
    const token = await this.getToken();
    const requestId = crypto.randomUUID();

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-Id': requestId,
    };

    const signal = AbortSignal.timeout(this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        headers,
        signal,
      });

      return await this.handleResponse<T>(response);
    } catch (err) {
      // AbortSignal.timeout() throws TimeoutError in Node 18+ and modern browsers,
      // but some environments still throw AbortError. Check for both.
      if (err instanceof DOMException && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
        throw new HbcDataAccessError(
          `Request timeout after ${this.timeoutMs}ms`,
          'TIMEOUT',
          err,
        );
      }
      if (err instanceof TypeError) {
        throw new HbcDataAccessError(
          `Network error: ${err.message}`,
          'NETWORK_ERROR',
          err,
        );
      }
      throw err;
    }
  }

  /**
   * Extract a human-readable error message from a backend error response body.
   * Reads `.error` first (C1 contract), falls back to `.message` for compatibility.
   * See decision D3: field name must be reconciled with C1 before production.
   */
  private extractErrorMessage(body: unknown, fallback: string): string {
    if (typeof body === 'object' && body !== null) {
      if ('error' in body) return String((body as Record<string, unknown>).error);
      if ('message' in body) return String((body as Record<string, unknown>).message);
    }
    return fallback;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let body: unknown;
    if (isJson) {
      body = await response.json();
    } else if (response.status === 204) {
      // 204 No Content — no body to parse
      body = undefined;
    } else {
      body = await response.text();
    }

    // Success responses (2xx)
    if (response.ok) {
      return body as T;
    }

    // Handle errors based on status code.
    // Status code semantics track the P1-C1 backend contract and P1-C2 auth middleware.
    // If C1 or C2 define different status code usage, update this mapping.
    switch (response.status) {
      case 404:
        throw new NotFoundError('Resource', 'unknown');

      case 422:
        // Unprocessable entity — validation error
        // Uses extractErrorMessage for dual-field compatibility (D3)
        throw new ValidationError(
          this.extractErrorMessage(isJson ? body : undefined, 'Validation failed'),
        );

      case 401:
      case 403:
        throw new HbcDataAccessError(
          response.status === 401
            ? 'Unauthorized: invalid or expired token'
            : 'Forbidden: insufficient permissions',
          response.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        );

      case 500:
      case 502:
      case 503:
        throw new HbcDataAccessError(
          `Server error (${response.status}): ${this.extractErrorMessage(body, 'backend service unavailable')}`,
          'SERVER_ERROR',
        );

      default:
        throw new HbcDataAccessError(
          `${response.status} ${response.statusText}: ${this.extractErrorMessage(body, `HTTP ${response.status}`)}`,
          `HTTP_${response.status}`,
        );
    }
  }
}
```

**Tests:**

```typescript
// packages/data-access/src/adapters/proxy/http-client.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ProxyHttpClient,
  ProxyHttpClientOptions,
} from './http-client.js';
import {
  NotFoundError,
  ValidationError,
  HbcDataAccessError,
} from '../../errors/index.js';

describe('ProxyHttpClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: ProxyHttpClient;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const createClient = (
    overrides?: Partial<ProxyHttpClientOptions>,
  ): ProxyHttpClient => {
    const opts: ProxyHttpClientOptions = {
      baseUrl: 'https://api.example.com',
      getToken: async () => 'test-token',
      timeout: 5000,
      ...overrides,
    };
    return new ProxyHttpClient(opts);
  };

  describe('get()', () => {
    it('should make a GET request with correct headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 1, name: 'Test' }),
      });

      client = createClient();
      const result = await client.get('/api/leads');

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/leads');
      expect(init.method).toBe('GET');
      expect(init.headers['Authorization']).toBe('Bearer test-token');
      expect(init.headers['Content-Type']).toBe('application/json');
      expect(init.headers['X-Request-Id']).toBeDefined();
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should include query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [],
      });

      client = createClient();
      await client.get('/api/leads', { page: '1', pageSize: '20' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('page=1');
      expect(url).toContain('pageSize=20');
    });

    it('should throw NotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Not found' }),
      });

      client = createClient();
      await expect(client.get('/api/leads/999')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw HbcDataAccessError on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      client = createClient();
      const err = await client.get('/api/leads').catch((e) => e);
      expect(err).toBeInstanceOf(HbcDataAccessError);
      expect(err.code).toBe('UNAUTHORIZED');
    });

    it('should throw HbcDataAccessError on 500 with C1 error field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Database error', code: 'DB_ERROR', requestId: 'req-123' }),
      });

      client = createClient();
      const err = await client.get('/api/leads').catch((e) => e);
      expect(err).toBeInstanceOf(HbcDataAccessError);
      expect(err.code).toBe('SERVER_ERROR');
      expect(err.message).toContain('Database error');
    });

    it('should fall back to .message field when .error is absent', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Legacy error format' }),
      });

      client = createClient();
      const err = await client.get('/api/leads').catch((e) => e);
      expect(err).toBeInstanceOf(HbcDataAccessError);
      expect(err.message).toContain('Legacy error format');
    });

    it('should throw HbcDataAccessError on network error', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      client = createClient();
      const err = await client.get('/api/leads').catch((e) => e);
      expect(err).toBeInstanceOf(HbcDataAccessError);
      expect(err.code).toBe('NETWORK_ERROR');
    });
  });

  describe('post()', () => {
    it('should make a POST request with JSON body', async () => {
      const responseData = { id: 101, title: 'New Lead' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => responseData,
      });

      client = createClient();
      const body = { title: 'New Lead', stage: 'prospecting' };
      const result = await client.post('/api/leads', body);

      const [, init] = mockFetch.mock.calls[0];
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(body));
      expect(result).toEqual(responseData);
    });

    it('should throw ValidationError on 422 with C1 error field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Title is required', code: 'VALIDATION_ERROR' }),
      });

      client = createClient();
      await expect(
        client.post('/api/leads', { title: '' }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('put()', () => {
    it('should make a PUT request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 1, title: 'Updated' }),
      });

      client = createClient();
      const body = { title: 'Updated' };
      const result = await client.put('/api/leads/1', body);

      const [, init] = mockFetch.mock.calls[0];
      expect(init.method).toBe('PUT');
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      client = createClient();
      await expect(
        client.put('/api/leads/999', { title: 'x' }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete()', () => {
    it('should make a DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
        text: async () => '',
      });

      client = createClient();
      await client.delete('/api/leads/1');

      const [, init] = mockFetch.mock.calls[0];
      expect(init.method).toBe('DELETE');
    });

    it('should throw NotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      client = createClient();
      await expect(client.delete('/api/leads/999')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('error handling', () => {
    it('should handle 403 Forbidden', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      client = createClient();
      const err = await client.get('/api/admin').catch((e) => e);
      expect(err).toBeInstanceOf(HbcDataAccessError);
      expect(err.code).toBe('FORBIDDEN');
    });

    it('should handle 502 Bad Gateway', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      client = createClient();
      const err = await client.get('/api/leads').catch((e) => e);
      expect(err).toBeInstanceOf(HbcDataAccessError);
      expect(err.code).toBe('SERVER_ERROR');
    });
  });
});
```

**Verification:**

```bash
# Requires: Task 0 (vitest setup) completed first
pnpm --filter @hbc/data-access test -- http-client
pnpm --filter @hbc/data-access check-types

# Expected: All 12+ tests pass, no type errors
# Commit: git commit -m "feat: create ProxyHttpClient with full error translation and header injection"
```

---

### Task 2: Create `ProxyBaseRepository<T>` abstract class

**Files:**
- Create: `packages/data-access/src/adapters/proxy/proxy-base.ts`
- Create: `packages/data-access/src/adapters/proxy/proxy-base.test.ts`

**Implementation:**

```typescript
// packages/data-access/src/adapters/proxy/proxy-base.ts

import type { IPagedResult, IListQueryOptions } from '@hbc/models';
import { DEFAULT_PAGE_SIZE } from '@hbc/models';
import { BaseRepository } from '../base.js';
import { ProxyHttpClient } from './http-client.js';

/**
 * Base class for all proxy repository implementations.
 * Provides shared URL building, query parameter marshaling, and HTTP client access.
 */
export abstract class ProxyBaseRepository<T> extends BaseRepository<T> {
  protected httpClient: ProxyHttpClient;
  protected resourcePath: string;

  constructor(httpClient: ProxyHttpClient, resourcePath: string) {
    super();
    this.httpClient = httpClient;
    this.resourcePath = resourcePath;
  }

  /**
   * Build a resource path with optional ID.
   * @param id - Optional entity ID
   * @returns Path like "/api/leads" or "/api/leads/123"
   */
  protected buildPath(id?: string | number): string {
    if (id !== undefined) {
      return `${this.resourcePath}/${id}`;
    }
    return this.resourcePath;
  }

  /**
   * Build a project-scoped resource path using nested URL segments.
   * D6 LOCKED — nested paths confirmed: `/api/projects/{projectId}/{domain}`.
   *
   * @param projectId - Project UUID
   * @param subResource - Sub-resource name (e.g., "activities", "entries")
   * @param id - Optional entity ID within the sub-resource
   * @returns Path like "/api/projects/{projectId}/activities"
   */
  protected buildProjectScopedPath(
    projectId: string,
    subResource: string,
    id?: string | number,
  ): string {
    const base = `/api/projects/${projectId}/${subResource}`;
    if (id !== undefined) {
      return `${base}/${id}`;
    }
    return base;
  }

  /**
   * DEPRECATED — D6 locked to nested paths. Use buildProjectScopedPath() instead.
   * Retained for reference only; do not use in production adapter implementation.
   *
   * @param params - Existing query params (from buildQueryParams)
   * @param projectId - Project UUID to add as query param
   * @returns Params with projectId added
   */
  protected addProjectScope(
    params: Record<string, string>,
    projectId: string,
  ): Record<string, string> {
    return { ...params, projectId };
  }

  /**
   * Convert query options to URL search parameters.
   * Filters out undefined or empty values.
   * @param options - Query options
   * @returns Record of string parameters ready for fetch
   */
  protected buildQueryParams(options?: IListQueryOptions): Record<string, string> {
    const params: Record<string, string> = {};

    if (options?.page !== undefined) {
      params.page = String(options.page);
    }
    if (options?.pageSize !== undefined) {
      params.pageSize = String(options.pageSize);
    }
    if (options?.sortBy) {
      params.sortBy = options.sortBy;
    }
    if (options?.sortOrder) {
      params.sortOrder = options.sortOrder;
    }
    if (options?.search) {
      params.search = options.search;
    }

    return params;
  }

  /**
   * Handle a paginated API response, normalizing the backend structure
   * to IPagedResult. Backend returns { data: T[], total, page, pageSize };
   * we extract and return as { items: T[], total, page, pageSize }.
   *
   * Fallback pageSize uses DEFAULT_PAGE_SIZE from @hbc/models (currently 25).
   * See decision D4: C1 specifies default 50. This fallback only applies when
   * the backend omits pageSize from the response, which should not happen in
   * normal operation. The mismatch must be reconciled before production.
   */
  protected mapPagedResponse<U>(response: unknown): IPagedResult<U> {
    const data = response as any;
    if (
      !data ||
      typeof data !== 'object' ||
      !Array.isArray(data.data)
    ) {
      throw new Error('Invalid paginated response structure');
    }
    return {
      items: data.data,
      total: data.total ?? 0,
      page: data.page ?? 1,
      pageSize: data.pageSize ?? DEFAULT_PAGE_SIZE,
    };
  }
}
```

**Tests:**

```typescript
// packages/data-access/src/adapters/proxy/proxy-base.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IPagedResult, IListQueryOptions } from '@hbc/models';
import { ProxyBaseRepository } from './proxy-base.js';
import { ProxyHttpClient } from './http-client.js';

describe('ProxyBaseRepository', () => {
  let httpClient: ProxyHttpClient;
  let repo: ProxyBaseRepository<{ id: number; name: string }>;

  beforeEach(() => {
    httpClient = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'test-token',
    });

    // Concrete test subclass
    class TestRepository extends ProxyBaseRepository<{
      id: number;
      name: string;
    }> {
      constructor(client: ProxyHttpClient) {
        super(client, '/api/items');
      }
    }

    repo = new TestRepository(httpClient);
  });

  describe('buildPath()', () => {
    it('should build resource path without ID', () => {
      const path = repo['buildPath']();
      expect(path).toBe('/api/items');
    });

    it('should build resource path with numeric ID', () => {
      const path = repo['buildPath'](42);
      expect(path).toBe('/api/items/42');
    });

    it('should build resource path with string ID', () => {
      const path = repo['buildPath']('uuid-123');
      expect(path).toBe('/api/items/uuid-123');
    });
  });

  // D6 LOCKED: Nested path pattern confirmed. Use buildProjectScopedPath().
  describe('buildProjectScopedPath() [D6 locked]', () => {
    it('should build nested project-scoped path without ID', () => {
      const path = repo['buildProjectScopedPath']('proj-uuid', 'activities');
      expect(path).toBe('/api/projects/proj-uuid/activities');
    });

    it('should build nested project-scoped path with numeric ID', () => {
      const path = repo['buildProjectScopedPath']('proj-uuid', 'activities', 42);
      expect(path).toBe('/api/projects/proj-uuid/activities/42');
    });
  });

  describe('addProjectScope() [alternative — D6]', () => {
    it('should add projectId as a query parameter', () => {
      const params = repo['addProjectScope']({ page: '1' }, 'proj-uuid');
      expect(params).toEqual({ page: '1', projectId: 'proj-uuid' });
    });
  });

  describe('buildQueryParams()', () => {
    it('should convert all query options to params', () => {
      const opts: IListQueryOptions = {
        page: 2,
        pageSize: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'highway',
      };
      const params = repo['buildQueryParams'](opts);

      expect(params).toEqual({
        page: '2',
        pageSize: '50',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'highway',
      });
    });

    it('should omit undefined fields', () => {
      const opts: IListQueryOptions = {
        page: 1,
        pageSize: 10,
      };
      const params = repo['buildQueryParams'](opts);

      expect(params).toEqual({
        page: '1',
        pageSize: '10',
      });
      expect(params.sortBy).toBeUndefined();
      expect(params.search).toBeUndefined();
    });

    it('should handle undefined options', () => {
      const params = repo['buildQueryParams'](undefined);
      expect(params).toEqual({});
    });

    it('should omit empty search strings', () => {
      const opts: IListQueryOptions = {
        search: '',
      };
      const params = repo['buildQueryParams'](opts);
      expect(params.search).toBeUndefined();
    });
  });

  describe('mapPagedResponse()', () => {
    it('should map backend paginated response to IPagedResult', () => {
      const backendResponse = {
        data: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        total: 50,
        page: 2,
        pageSize: 25,
      };

      const result = repo['mapPagedResponse'](backendResponse);

      expect(result).toEqual({
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        total: 50,
        page: 2,
        pageSize: 25,
      });
    });

    it('should provide defaults for missing pagination fields (D4: default from @hbc/models)', () => {
      const backendResponse = {
        data: [{ id: 1, name: 'Item 1' }],
      };

      const result = repo['mapPagedResponse'](backendResponse);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      // Uses DEFAULT_PAGE_SIZE from @hbc/models (currently 25).
      // D4: C1 defaults to 50; this fallback only applies when backend omits pageSize.
      expect(result.pageSize).toBe(25);
    });

    it('should throw on invalid response structure', () => {
      expect(() => {
        repo['mapPagedResponse']({ data: 'not an array' });
      }).toThrow();

      expect(() => {
        repo['mapPagedResponse'](null);
      }).toThrow();

      expect(() => {
        repo['mapPagedResponse']({});
      }).toThrow();
    });
  });
});
```

**Verification:**

```bash
# Requires: Task 0 (vitest setup) completed first
pnpm --filter @hbc/data-access test -- proxy-base
pnpm --filter @hbc/data-access check-types

# Expected: All 12+ tests pass
# Commit: git commit -m "feat: create ProxyBaseRepository with path building and query marshaling"
```

---

## Chunk 2: Lead and Project Repository Implementations (≈550 lines)

### Task 3: ProxyLeadRepository

**Files:**
- Create: `packages/data-access/src/adapters/proxy/lead-repository.ts`
- Create: `packages/data-access/src/adapters/proxy/lead-repository.test.ts`

**Implementation:**

```typescript
// packages/data-access/src/adapters/proxy/lead-repository.ts

import type {
  ILead,
  ILeadFormData,
  IPagedResult,
  IListQueryOptions,
} from '@hbc/models';
import type { ILeadRepository } from '../../ports/ILeadRepository.js';
import { NotFoundError } from '../../errors/index.js';
import { ProxyBaseRepository } from './proxy-base.js';
import { ProxyHttpClient } from './http-client.js';

export class ProxyLeadRepository
  extends ProxyBaseRepository<ILead>
  implements ILeadRepository
{
  // API path tracks P1-C1 backend contract catalog.
  // If C1 finalizes a different path, update here.
  constructor(httpClient: ProxyHttpClient) {
    super(httpClient, '/api/leads');
  }

  async getAll(options?: IListQueryOptions): Promise<IPagedResult<ILead>> {
    return this.wrapAsync(async () => {
      const params = this.buildQueryParams(options);
      const response = await this.httpClient.get<unknown>('/api/leads', params);
      return this.mapPagedResponse<ILead>(response);
    }, 'ProxyLeadRepository.getAll');
  }

  async getById(id: number): Promise<ILead | null> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'Lead');
      try {
        const path = this.buildPath(id);
        const response = await this.httpClient.get<{ data: ILead }>(path);
        return response.data;
      } catch (err) {
        if (err instanceof NotFoundError) {
          return null;
        }
        throw err;
      }
    }, 'ProxyLeadRepository.getById');
  }

  async create(data: ILeadFormData): Promise<ILead> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.post<{ data: ILead }>(
        '/api/leads',
        data,
      );
      return response.data;
    }, 'ProxyLeadRepository.create');
  }

  async update(id: number, data: Partial<ILeadFormData>): Promise<ILead> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'Lead');
      const path = this.buildPath(id);
      const response = await this.httpClient.put<{ data: ILead }>(
        path,
        data,
      );
      return response.data;
    }, 'ProxyLeadRepository.update');
  }

  async delete(id: number): Promise<void> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'Lead');
      const path = this.buildPath(id);
      await this.httpClient.delete(path);
    }, 'ProxyLeadRepository.delete');
  }

  async search(
    query: string,
    options?: IListQueryOptions,
  ): Promise<IPagedResult<ILead>> {
    return this.wrapAsync(async () => {
      const params = this.buildQueryParams(options);
      params.q = query;
      const response = await this.httpClient.get<unknown>(
        '/api/leads/search',
        params,
      );
      return this.mapPagedResponse<ILead>(response);
    }, 'ProxyLeadRepository.search');
  }
}
```

**Tests:**

```typescript
// packages/data-access/src/adapters/proxy/lead-repository.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ILead, ILeadFormData } from '@hbc/models';
import { ProxyLeadRepository } from './lead-repository.js';
import { ProxyHttpClient } from './http-client.js';
import { NotFoundError, ValidationError } from '../../errors/index.js';

describe('ProxyLeadRepository', () => {
  let httpClient: ProxyHttpClient;
  let repo: ProxyLeadRepository;

  const mockLead: ILead = {
    id: 1,
    title: 'Test Lead',
    stage: 'prospecting',
    clientName: 'Acme Corp',
    estimatedValue: 50000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    httpClient = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'test-token',
    });
    repo = new ProxyLeadRepository(httpClient);
  });

  describe('getAll()', () => {
    it('should fetch paginated leads', async () => {
      const spy = vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
        data: [mockLead],
        total: 1,
        page: 1,
        pageSize: 20,
      });

      const result = await repo.getAll({ page: 1, pageSize: 20 });

      expect(spy).toHaveBeenCalledWith('/api/leads', {
        page: '1',
        pageSize: '20',
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('Test Lead');
      expect(result.total).toBe(1);
    });

    it('should handle empty result set', async () => {
      vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
      });

      const result = await repo.getAll();

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getById()', () => {
    it('should fetch a single lead by ID', async () => {
      const spy = vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
        data: mockLead,
      });

      const result = await repo.getById(1);

      expect(spy).toHaveBeenCalledWith('/api/leads/1');
      expect(result).toEqual(mockLead);
    });

    it('should return null on 404', async () => {
      vi.spyOn(httpClient, 'get').mockRejectedValueOnce(
        new NotFoundError('Lead', 1),
      );

      const result = await repo.getById(1);

      expect(result).toBeNull();
    });

    it('should throw ValidationError on invalid ID', async () => {
      await expect(repo.getById(0)).rejects.toThrow(ValidationError);
      await expect(repo.getById(-1)).rejects.toThrow(ValidationError);
      await expect(repo.getById(NaN)).rejects.toThrow(ValidationError);
    });

    it('should propagate other errors', async () => {
      vi.spyOn(httpClient, 'get').mockRejectedValueOnce(
        new Error('Network error'),
      );

      await expect(repo.getById(1)).rejects.toThrow();
    });
  });

  describe('create()', () => {
    it('should create a new lead', async () => {
      const spy = vi.spyOn(httpClient, 'post').mockResolvedValueOnce({
        data: mockLead,
      });

      const input: ILeadFormData = {
        title: 'Test Lead',
        stage: 'prospecting',
        clientName: 'Acme Corp',
        estimatedValue: 50000,
      };

      const result = await repo.create(input);

      expect(spy).toHaveBeenCalledWith('/api/leads', input);
      expect(result).toEqual(mockLead);
    });

    it('should propagate validation errors from server', async () => {
      vi.spyOn(httpClient, 'post').mockRejectedValueOnce(
        new ValidationError('Title is required'),
      );

      const input: ILeadFormData = {
        title: '',
        stage: 'prospecting',
        clientName: 'Acme Corp',
        estimatedValue: 50000,
      };

      await expect(repo.create(input)).rejects.toThrow(ValidationError);
    });
  });

  describe('update()', () => {
    it('should update an existing lead', async () => {
      const updated: ILead = { ...mockLead, title: 'Updated' };
      const spy = vi.spyOn(httpClient, 'put').mockResolvedValueOnce({
        data: updated,
      });

      const result = await repo.update(1, { title: 'Updated' });

      expect(spy).toHaveBeenCalledWith('/api/leads/1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundError on missing lead', async () => {
      vi.spyOn(httpClient, 'put').mockRejectedValueOnce(
        new NotFoundError('Lead', 999),
      );

      await expect(
        repo.update(999, { title: 'Updated' }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should validate ID before sending request', async () => {
      const spy = vi.spyOn(httpClient, 'put');

      await expect(repo.update(0, { title: 'x' })).rejects.toThrow(
        ValidationError,
      );
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('delete()', () => {
    it('should delete a lead', async () => {
      const spy = vi.spyOn(httpClient, 'delete').mockResolvedValueOnce(
        undefined,
      );

      await repo.delete(1);

      expect(spy).toHaveBeenCalledWith('/api/leads/1');
    });

    it('should throw NotFoundError on missing lead', async () => {
      vi.spyOn(httpClient, 'delete').mockRejectedValueOnce(
        new NotFoundError('Lead', 999),
      );

      await expect(repo.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('search()', () => {
    it('should search leads by query', async () => {
      const spy = vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
        data: [mockLead],
        total: 1,
        page: 1,
        pageSize: 20,
      });

      const result = await repo.search('highway', { page: 1 });

      expect(spy).toHaveBeenCalledWith('/api/leads/search', {
        q: 'highway',
        page: '1',
      });
      expect(result.items).toHaveLength(1);
    });

    it('should include pagination in search results', async () => {
      vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
        data: [mockLead],
        total: 100,
        page: 2,
        pageSize: 50,
      });

      const result = await repo.search('test', { page: 2, pageSize: 50 });

      expect(result.total).toBe(100);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(50);
    });
  });
});
```

**Verification:**

```bash
# Requires: Task 0 (vitest setup) completed first
pnpm --filter @hbc/data-access test -- lead-repository
pnpm --filter @hbc/data-access check-types

# Expected: All 13+ tests pass
# Commit: git commit -m "feat: implement ProxyLeadRepository with full CRUD and search"
```

---

### Task 4: ProxyProjectRepository

**Files:**
- Create: `packages/data-access/src/adapters/proxy/project-repository.ts`
- Create: `packages/data-access/src/adapters/proxy/project-repository.test.ts`

**Implementation:** The Project repository uses `IActiveProject` (not `IProject`) and `IPortfolioSummary`. Method names are domain-specific (`getProjects`, `getProjectById`, etc.) and the repository has no `search` method. IDs are strings (UUIDs). The repository also exposes a `getPortfolioSummary()` aggregate query.

```typescript
// packages/data-access/src/adapters/proxy/project-repository.ts

import type {
  IActiveProject,
  IPortfolioSummary,
  IPagedResult,
  IListQueryOptions,
} from '@hbc/models';
import type { IProjectRepository } from '../../ports/IProjectRepository.js';
import { NotFoundError } from '../../errors/index.js';
import { ProxyBaseRepository } from './proxy-base.js';
import { ProxyHttpClient } from './http-client.js';

export class ProxyProjectRepository
  extends ProxyBaseRepository<IActiveProject>
  implements IProjectRepository
{
  // API path tracks P1-C1 backend contract catalog.
  // If C1 finalizes a different path, update here.
  constructor(httpClient: ProxyHttpClient) {
    super(httpClient, '/api/projects');
  }

  async getProjects(options?: IListQueryOptions): Promise<IPagedResult<IActiveProject>> {
    return this.wrapAsync(async () => {
      const params = this.buildQueryParams(options);
      const response = await this.httpClient.get<unknown>(
        '/api/projects',
        params,
      );
      return this.mapPagedResponse<IActiveProject>(response);
    }, 'ProxyProjectRepository.getProjects');
  }

  async getProjectById(id: string): Promise<IActiveProject | null> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'Project');
      try {
        const path = this.buildPath(id);
        const response = await this.httpClient.get<{ data: IActiveProject }>(path);
        return response.data;
      } catch (err) {
        if (err instanceof NotFoundError) {
          return null;
        }
        throw err;
      }
    }, 'ProxyProjectRepository.getProjectById');
  }

  async createProject(data: Omit<IActiveProject, 'id'>): Promise<IActiveProject> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.post<{ data: IActiveProject }>(
        '/api/projects',
        data,
      );
      return response.data;
    }, 'ProxyProjectRepository.createProject');
  }

  async updateProject(
    id: string,
    data: Partial<IActiveProject>,
  ): Promise<IActiveProject> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'Project');
      const path = this.buildPath(id);
      const response = await this.httpClient.put<{ data: IActiveProject }>(
        path,
        data,
      );
      return response.data;
    }, 'ProxyProjectRepository.updateProject');
  }

  async deleteProject(id: string): Promise<void> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'Project');
      const path = this.buildPath(id);
      await this.httpClient.delete(path);
    }, 'ProxyProjectRepository.deleteProject');
  }

  // PROVISIONAL (A8): Aggregate endpoint not in C1 catalog.
  // Path and existence must be confirmed with C1 before production.
  async getPortfolioSummary(): Promise<IPortfolioSummary> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.get<{ data: IPortfolioSummary }>(
        '/api/projects/portfolio-summary',
      );
      return response.data;
    }, 'ProxyProjectRepository.getPortfolioSummary');
  }
}
```

**Tests:** 10+ test cases covering getProjects, getProjectById, createProject, updateProject, deleteProject, getPortfolioSummary, and error handling. String IDs throughout.

**Verification:**

```bash
# Requires: Task 0 (vitest setup) completed first
pnpm --filter @hbc/data-access test -- project-repository
pnpm --filter @hbc/data-access check-types

# Expected: All tests pass
# Commit: git commit -m "feat: implement ProxyProjectRepository with domain-specific methods"
```

---

## Chunk 3: Remaining Domain Repositories (≈700 lines of listings + commits)

**Overview:** Tasks 5–7 each implement their port interface by delegating to `ProxyHttpClient` through `ProxyBaseRepository`. Unlike Lead (Task 3), each repository has its own domain-specific method names, entity types, and query patterns. Most are project-scoped (taking `projectId` as a parameter on list methods) and several manage multiple entity types (e.g., tracker + kickoff, contract + approval). None of the remaining repositories have a generic `search()` method.

### Task 5: ProxyEstimatingRepository, ProxyScheduleRepository, ProxyBuyoutRepository

**Files to create:**
- `packages/data-access/src/adapters/proxy/estimating-repository.ts`
- `packages/data-access/src/adapters/proxy/estimating-repository.test.ts`
- `packages/data-access/src/adapters/proxy/schedule-repository.ts`
- `packages/data-access/src/adapters/proxy/schedule-repository.test.ts`
- `packages/data-access/src/adapters/proxy/buyout-repository.ts`
- `packages/data-access/src/adapters/proxy/buyout-repository.test.ts`

**ProxyEstimatingRepository:**

The Estimating domain manages two entity types: `IEstimatingTracker` (bid tracking) and `IEstimatingKickoff` (kickoff meetings). Methods use domain-specific names (`getAllTrackers`, `getTrackerById`, `createTracker`, etc.) rather than generic CRUD. The kickoff entity has separate `getKickoff(projectId)` and `createKickoff()` methods.

> **Provisional routing (D2):** B1 uses sub-resource paths (`/trackers`, `/kickoffs`) under `/api/estimating`. C1 defines flat `/api/estimating` with generic CRUD. Sub-resource routing must be confirmed with C1 before this adapter is finalized. Implementation is safe with mocked `fetch` but paths may change.

```typescript
// packages/data-access/src/adapters/proxy/estimating-repository.ts

import type {
  IEstimatingTracker,
  IEstimatingKickoff,
  IPagedResult,
  IListQueryOptions,
} from '@hbc/models';
import type { IEstimatingRepository } from '../../ports/IEstimatingRepository.js';
import { NotFoundError } from '../../errors/index.js';
import { ProxyBaseRepository } from './proxy-base.js';
import { ProxyHttpClient } from './http-client.js';

export class ProxyEstimatingRepository
  extends ProxyBaseRepository<IEstimatingTracker>
  implements IEstimatingRepository
{
  // API path tracks P1-C1 backend contract catalog.
  // If C1 finalizes a different path, update here.
  constructor(httpClient: ProxyHttpClient) {
    super(httpClient, '/api/estimating/trackers');
  }

  async getAllTrackers(
    options?: IListQueryOptions,
  ): Promise<IPagedResult<IEstimatingTracker>> {
    return this.wrapAsync(async () => {
      const params = this.buildQueryParams(options);
      const response = await this.httpClient.get<unknown>(
        '/api/estimating/trackers',
        params,
      );
      return this.mapPagedResponse<IEstimatingTracker>(response);
    }, 'ProxyEstimatingRepository.getAllTrackers');
  }

  async getTrackerById(id: number): Promise<IEstimatingTracker | null> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'EstimatingTracker');
      try {
        const path = this.buildPath(id);
        const response = await this.httpClient.get<{ data: IEstimatingTracker }>(path);
        return response.data;
      } catch (err) {
        if (err instanceof NotFoundError) {
          return null;
        }
        throw err;
      }
    }, 'ProxyEstimatingRepository.getTrackerById');
  }

  async createTracker(
    data: Omit<IEstimatingTracker, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<IEstimatingTracker> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.post<{ data: IEstimatingTracker }>(
        '/api/estimating/trackers',
        data,
      );
      return response.data;
    }, 'ProxyEstimatingRepository.createTracker');
  }

  async updateTracker(
    id: number,
    data: Partial<IEstimatingTracker>,
  ): Promise<IEstimatingTracker> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'EstimatingTracker');
      const path = this.buildPath(id);
      const response = await this.httpClient.put<{ data: IEstimatingTracker }>(
        path,
        data,
      );
      return response.data;
    }, 'ProxyEstimatingRepository.updateTracker');
  }

  async deleteTracker(id: number): Promise<void> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'EstimatingTracker');
      const path = this.buildPath(id);
      await this.httpClient.delete(path);
    }, 'ProxyEstimatingRepository.deleteTracker');
  }

  // PROVISIONAL (D2 + A8): Kickoff sub-resource path not in C1 catalog.
  async getKickoff(projectId: string): Promise<IEstimatingKickoff | null> {
    return this.wrapAsync(async () => {
      try {
        const response = await this.httpClient.get<{ data: IEstimatingKickoff }>(
          `/api/estimating/kickoffs/${projectId}`,
        );
        return response.data;
      } catch (err) {
        if (err instanceof NotFoundError) {
          return null;
        }
        throw err;
      }
    }, 'ProxyEstimatingRepository.getKickoff');
  }

  async createKickoff(
    data: Omit<IEstimatingKickoff, 'id' | 'createdAt'>,
  ): Promise<IEstimatingKickoff> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.post<{ data: IEstimatingKickoff }>(
        '/api/estimating/kickoffs',
        data,
      );
      return response.data;
    }, 'ProxyEstimatingRepository.createKickoff');
  }
}
```

**ProxyScheduleRepository:**

> **Path discrepancy:** B1 uses `/api/schedules` (plural); C1 uses `/api/schedule` (singular). Also, B1 uses nested project-scoped paths (`/api/projects/{projectId}/activities`); C1 uses flat routes with query params. See Appendix A for details.

The Schedule domain is project-scoped and manages `IScheduleActivity` entries plus an `IScheduleMetrics` aggregate. Methods: `getActivities(projectId)`, `getActivityById(id)`, `createActivity(data)`, `updateActivity(id, data)`, `deleteActivity(id)`, `getMetrics(projectId)`. No search method.

```typescript
// packages/data-access/src/adapters/proxy/schedule-repository.ts

import type {
  IScheduleActivity,
  IScheduleMetrics,
  IPagedResult,
  IListQueryOptions,
} from '@hbc/models';
import type { IScheduleRepository } from '../../ports/IScheduleRepository.js';
import { NotFoundError } from '../../errors/index.js';
import { ProxyBaseRepository } from './proxy-base.js';
import { ProxyHttpClient } from './http-client.js';

export class ProxyScheduleRepository
  extends ProxyBaseRepository<IScheduleActivity>
  implements IScheduleRepository
{
  // API path tracks P1-C1 backend contract catalog.
  // If C1 finalizes a different path, update here.
  constructor(httpClient: ProxyHttpClient) {
    super(httpClient, '/api/schedules');
  }

  // D6 LOCKED: Uses nested project-scoped path `/api/projects/{projectId}/schedules`.
  async getActivities(
    projectId: string,
    options?: IListQueryOptions,
  ): Promise<IPagedResult<IScheduleActivity>> {
    return this.wrapAsync(async () => {
      const params = this.buildQueryParams(options);
      const response = await this.httpClient.get<unknown>(
        this.buildProjectScopedPath(projectId, 'activities'),
        params,
      );
      return this.mapPagedResponse<IScheduleActivity>(response);
    }, 'ProxyScheduleRepository.getActivities');
  }

  async getActivityById(id: number): Promise<IScheduleActivity | null> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'ScheduleActivity');
      try {
        const response = await this.httpClient.get<{ data: IScheduleActivity }>(
          `/api/schedules/activities/${id}`,
        );
        return response.data;
      } catch (err) {
        if (err instanceof NotFoundError) {
          return null;
        }
        throw err;
      }
    }, 'ProxyScheduleRepository.getActivityById');
  }

  async createActivity(
    data: Omit<IScheduleActivity, 'id'>,
  ): Promise<IScheduleActivity> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.post<{ data: IScheduleActivity }>(
        '/api/schedules/activities',
        data,
      );
      return response.data;
    }, 'ProxyScheduleRepository.createActivity');
  }

  async updateActivity(
    id: number,
    data: Partial<IScheduleActivity>,
  ): Promise<IScheduleActivity> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'ScheduleActivity');
      const response = await this.httpClient.put<{ data: IScheduleActivity }>(
        `/api/schedules/activities/${id}`,
        data,
      );
      return response.data;
    }, 'ProxyScheduleRepository.updateActivity');
  }

  async deleteActivity(id: number): Promise<void> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'ScheduleActivity');
      await this.httpClient.delete(`/api/schedules/activities/${id}`);
    }, 'ProxyScheduleRepository.deleteActivity');
  }

  // PROVISIONAL (A8 + D6): Aggregate endpoint not in C1 catalog; uses nested path.
  async getMetrics(projectId: string): Promise<IScheduleMetrics> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.get<{ data: IScheduleMetrics }>(
        this.buildProjectScopedPath(projectId, 'metrics'),
      );
      return response.data;
    }, 'ProxyScheduleRepository.getMetrics');
  }
}
```

**ProxyBuyoutRepository:**

> **Path discrepancy:** B1 uses `/api/buyouts` (plural); C1 uses `/api/buyout` (singular). See Appendix A for details.

The Buyout domain is project-scoped and manages `IBuyoutEntry` entries plus an `IBuyoutSummary` aggregate. Methods: `getEntries(projectId)`, `getEntryById(id)`, `createEntry(data)`, `updateEntry(id, data)`, `deleteEntry(id)`, `getSummary(projectId)` **(A8: aggregate endpoint provisional — not in C1 catalog)**. No search method.

Implementation follows the same project-scoped pattern as Schedule above, substituting `IBuyoutEntry`/`IBuyoutSummary` and using resource paths under `/api/buyouts`. All API paths are provisional and track the P1-C1 backend contract catalog.

**Test each:** 10+ test cases per repository, covering all domain-specific methods and error handling.

**Verification:**

```bash
# Requires: Task 0 (vitest setup) completed first
pnpm --filter @hbc/data-access test -- estimating-repository
pnpm --filter @hbc/data-access test -- schedule-repository
pnpm --filter @hbc/data-access test -- buyout-repository
pnpm --filter @hbc/data-access check-types

# Expected: 30+ tests pass across all three
# Commit (one per repo):
git commit -m "feat: implement ProxyEstimatingRepository with tracker and kickoff methods"
git commit -m "feat: implement ProxyScheduleRepository with project-scoped activities and metrics"
git commit -m "feat: implement ProxyBuyoutRepository with project-scoped entries and summary"
```

---

### Task 6: ProxyComplianceRepository, ProxyContractRepository, ProxyRiskRepository

**Files to create:**
- `packages/data-access/src/adapters/proxy/compliance-repository.ts`
- `packages/data-access/src/adapters/proxy/compliance-repository.test.ts`
- `packages/data-access/src/adapters/proxy/contract-repository.ts`
- `packages/data-access/src/adapters/proxy/contract-repository.test.ts`
- `packages/data-access/src/adapters/proxy/risk-repository.ts`
- `packages/data-access/src/adapters/proxy/risk-repository.test.ts`

**ProxyComplianceRepository:**

Project-scoped. Manages `IComplianceEntry` + `IComplianceSummary`. Methods: `getEntries(projectId, options?)`, `getEntryById(id)`, `createEntry(data)`, `updateEntry(id, data)`, `deleteEntry(id)`, `getSummary(projectId)` **(A8: aggregate provisional)**. No search. Follows the same project-scoped pattern as Buyout (Task 5). All API paths are provisional and track the P1-C1 backend contract catalog.

**ProxyContractRepository:**

Project-scoped with two entity types. Manages `IContractInfo` + `ICommitmentApproval`. Methods: `getContracts(projectId, options?)`, `getContractById(id)`, `createContract(data)`, `updateContract(id, data)`, `deleteContract(id)`, `getApprovals(contractId)` **(A8: sub-resource provisional)**, `createApproval(data)` **(A8)**. No search. The approval methods operate on a sub-resource scoped by contract ID. All API paths are provisional and track the P1-C1 backend contract catalog.

**ProxyRiskRepository:**

> **Path discrepancy:** B1 uses `/api/risks` (plural); C1 uses `/api/risk` (singular). See Appendix A for details.

Project-scoped. Manages `IRiskCostItem` + `IRiskCostManagement`. Methods: `getItems(projectId, options?)`, `getItemById(id)`, `createItem(data)`, `updateItem(id, data)`, `deleteItem(id)`, `getManagement(projectId)` **(A8: aggregate provisional)**. No search. Follows the project-scoped pattern with an aggregate query. All API paths are provisional and track the P1-C1 backend contract catalog.

**Verification:**

```bash
# Requires: Task 0 (vitest setup) completed first
pnpm --filter @hbc/data-access test -- compliance-repository
pnpm --filter @hbc/data-access test -- contract-repository
pnpm --filter @hbc/data-access test -- risk-repository
pnpm --filter @hbc/data-access check-types

# Expected: 30+ tests pass across all three
# Commits (one per repo):
git commit -m "feat: implement ProxyComplianceRepository with project-scoped entries and summary"
git commit -m "feat: implement ProxyContractRepository with contracts and approval sub-resource"
git commit -m "feat: implement ProxyRiskRepository with project-scoped items and management aggregate"
```

---

### Task 7: ProxyScorecardRepository, ProxyPmpRepository, ProxyAuthRepository

**Files to create:**
- `packages/data-access/src/adapters/proxy/scorecard-repository.ts`
- `packages/data-access/src/adapters/proxy/scorecard-repository.test.ts`
- `packages/data-access/src/adapters/proxy/pmp-repository.ts`
- `packages/data-access/src/adapters/proxy/pmp-repository.test.ts`
- `packages/data-access/src/adapters/proxy/auth-repository.ts`
- `packages/data-access/src/adapters/proxy/auth-repository.test.ts`

**ProxyScorecardRepository:**

> **Path discrepancy:** B1 uses `/api/scorecards` (plural); C1 uses `/api/scorecard` (singular). See Appendix A for details.

Project-scoped with two entity types. Manages `IGoNoGoScorecard` + `IScorecardVersion`. Methods: `getScorecards(projectId, options?)`, `getScorecardById(id)`, `createScorecard(data)`, `updateScorecard(id, data)`, `deleteScorecard(id)`, `getVersions(scorecardId)` **(A8: sub-resource provisional)**. No search. The versions method operates on a sub-resource scoped by scorecard ID. All API paths are provisional and track the P1-C1 backend contract catalog.

**ProxyPmpRepository:**

Project-scoped with two entity types. Manages `IProjectManagementPlan` + `IPMPSignature`. Methods: `getPlans(projectId, options?)`, `getPlanById(id)`, `createPlan(data)`, `updatePlan(id, data)`, `deletePlan(id)`, `getSignatures(pmpId)` **(A8: sub-resource provisional)**, `createSignature(data)` **(A8)**. No search. Signatures are a sub-resource scoped by PMP ID. All API paths are provisional and track the P1-C1 backend contract catalog.

**ProxyAuthRepository:**

**This repository has no CRUD pattern at all.** It does not extend `ProxyBaseRepository` in a meaningful way (or uses it only for `httpClient` access). The Auth port manages users, roles, and permissions with these methods:

> **All routes provisional (A9):** Auth management routes are not defined in C1 (domain CRUD catalog) or C2 (auth middleware). All `/api/auth/*` paths below are entirely B1-assumed. These routes must be confirmed with the auth/platform team before production activation.

- `getCurrentUser(): Promise<ICurrentUser>` — retrieve authenticated user profile
- `getRoles(): Promise<IRole[]>` — list all available roles
- `getRoleById(id: string): Promise<IRole | null>` — retrieve a single role by ID
- `getPermissionTemplates(): Promise<IPermissionTemplate[]>` — list permission templates
- `assignRole(userId: string, roleId: string): Promise<void>` — assign a role to a user
- `removeRole(userId: string, roleId: string): Promise<void>` — remove a role from a user

All methods delegate to `/api/auth/*` endpoints. No pagination, no entity creation/deletion in the traditional sense. IDs are strings.

```typescript
// packages/data-access/src/adapters/proxy/auth-repository.ts

import type {
  ICurrentUser,
  IRole,
  IPermissionTemplate,
} from '@hbc/models';
import type { IAuthRepository } from '../../ports/IAuthRepository.js';
import { NotFoundError } from '../../errors/index.js';
import { ProxyBaseRepository } from './proxy-base.js';
import { ProxyHttpClient } from './http-client.js';

export class ProxyAuthRepository
  extends ProxyBaseRepository<ICurrentUser>
  implements IAuthRepository
{
  // API path tracks P1-C1 backend contract catalog.
  // If C1 finalizes a different path, update here.
  constructor(httpClient: ProxyHttpClient) {
    super(httpClient, '/api/auth');
  }

  async getCurrentUser(): Promise<ICurrentUser> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.get<{ data: ICurrentUser }>(
        '/api/auth/me',
      );
      return response.data;
    }, 'ProxyAuthRepository.getCurrentUser');
  }

  async getRoles(): Promise<IRole[]> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.get<{ data: IRole[] }>(
        '/api/auth/roles',
      );
      return response.data;
    }, 'ProxyAuthRepository.getRoles');
  }

  async getRoleById(id: string): Promise<IRole | null> {
    return this.wrapAsync(async () => {
      try {
        const response = await this.httpClient.get<{ data: IRole }>(
          `/api/auth/roles/${id}`,
        );
        return response.data;
      } catch (err) {
        if (err instanceof NotFoundError) {
          return null;
        }
        throw err;
      }
    }, 'ProxyAuthRepository.getRoleById');
  }

  async getPermissionTemplates(): Promise<IPermissionTemplate[]> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.get<{ data: IPermissionTemplate[] }>(
        '/api/auth/permission-templates',
      );
      return response.data;
    }, 'ProxyAuthRepository.getPermissionTemplates');
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    return this.wrapAsync(async () => {
      await this.httpClient.post<void>(
        `/api/auth/users/${userId}/roles`,
        { roleId },
      );
    }, 'ProxyAuthRepository.assignRole');
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    return this.wrapAsync(async () => {
      await this.httpClient.delete(
        `/api/auth/users/${userId}/roles/${roleId}`,
      );
    }, 'ProxyAuthRepository.removeRole');
  }
}
```

**Verification:**

```bash
# Requires: Task 0 (vitest setup) completed first
pnpm --filter @hbc/data-access test -- scorecard-repository
pnpm --filter @hbc/data-access test -- pmp-repository
pnpm --filter @hbc/data-access test -- auth-repository
pnpm --filter @hbc/data-access check-types

# Expected: 30+ tests pass across all three
# Commits:
git commit -m "feat: implement ProxyScorecardRepository with project-scoped scorecards and versions"
git commit -m "feat: implement ProxyPmpRepository with project-scoped plans and signatures"
git commit -m "feat: implement ProxyAuthRepository with user/role/permission methods (non-CRUD)"
```

---

## Chunk 4: Factory Wiring and Integration (≈380 lines)

### Task 8: Create proxy adapter barrel and wire factory

**Files:**
- Modify: `packages/data-access/src/adapters/proxy/index.ts` — add exports for all proxy repositories
- Modify: `packages/data-access/src/factory.ts` — implement proxy factory functions

**Step 1: Update proxy adapter barrel:**

```typescript
// packages/data-access/src/adapters/proxy/index.ts

/**
 * Proxy adapters — Azure Functions proxy implementations for PWA (MSAL on-behalf-of).
 *
 * Each repository delegates HTTP calls to ProxyHttpClient, which handles:
 * - Bearer token injection from frontend context
 * - Request tracing (X-Request-Id)
 * - Error translation (HTTP status → domain errors)
 * - JSON marshaling
 *
 * Backend performs MSAL OBO internally; proxy adapter only sends Bearer tokens.
 */

export type { ProxyConfig } from './types.js';
export { DEFAULT_TIMEOUT_MS, DEFAULT_RETRY_COUNT } from './constants.js';
export { ProxyHttpClient } from './http-client.js';
export type { ProxyHttpClientOptions } from './http-client.js';
export { ProxyBaseRepository } from './proxy-base.js';
export { ProxyLeadRepository } from './lead-repository.js';
export { ProxyProjectRepository } from './project-repository.js';
export { ProxyEstimatingRepository } from './estimating-repository.js';
export { ProxyScheduleRepository } from './schedule-repository.js';
export { ProxyBuyoutRepository } from './buyout-repository.js';
export { ProxyComplianceRepository } from './compliance-repository.js';
export { ProxyContractRepository } from './contract-repository.js';
export { ProxyRiskRepository } from './risk-repository.js';
export { ProxyScorecardRepository } from './scorecard-repository.js';
export { ProxyPmpRepository } from './pmp-repository.js';
export { ProxyAuthRepository } from './auth-repository.js';
```

**Step 2: Wire factory.ts for proxy mode:**

The factory needs access to `baseUrl` and `getToken`. These come from:
- `baseUrl`: env var `PROXY_BASE_URL`
- `getToken`: a function passed to the factory (or resolved from global context)

Create a factory initialization function:

```typescript
// packages/data-access/src/factory.ts (excerpt - additions only)

import {
  ProxyHttpClient,
  ProxyLeadRepository,
  ProxyProjectRepository,
  ProxyEstimatingRepository,
  ProxyScheduleRepository,
  ProxyBuyoutRepository,
  ProxyComplianceRepository,
  ProxyContractRepository,
  ProxyRiskRepository,
  ProxyScorecardRepository,
  ProxyPmpRepository,
  ProxyAuthRepository,
} from './adapters/proxy/index.js';

/**
 * Global proxy factory context. Set via setProxyContext() before using proxy adapters.
 *
 * Uses the same getToken function shape as ProxyHttpClientOptions.
 * This replaces the static accessToken from the original ProxyConfig stub —
 * MSAL tokens expire and must be acquired per-request.
 */
let proxyContext: {
  baseUrl: string;
  getToken: () => Promise<string>;
} | null = null;

/**
 * Initialize proxy adapter context.
 * Must be called after MSAL auth init, before React render (see main.tsx).
 *
 * @param baseUrl - Azure Functions base URL (e.g., "https://func-hb-intel.azurewebsites.net/api")
 * @param getToken - Async function returning current Bearer token (called per-request)
 *
 * @example
 * ```ts
 * import { setProxyContext, resolveAdapterMode } from '@hbc/data-access';
 * import { msalInstance } from './auth/msal-init.js';
 *
 * // In main.tsx, after MSAL init:
 * if (resolveAdapterMode() === 'proxy') {
 *   const baseUrl = import.meta.env.VITE_PROXY_BASE_URL;
 *   if (!baseUrl) throw new Error('VITE_PROXY_BASE_URL must be set for proxy mode');
 *   setProxyContext(
 *     baseUrl,
 *     async () => {
 *       const account = msalInstance.getActiveAccount();
 *       if (!account) throw new Error('No active MSAL account');
 *       const response = await msalInstance.acquireTokenSilent({
 *         scopes: [import.meta.env.VITE_API_SCOPE],
 *         account,
 *       });
 *       return response.accessToken;
 *     },
 *   );
 * }
 * ```
 */
export function setProxyContext(
  baseUrl: string,
  getToken: () => Promise<string>,
): void {
  proxyContext = { baseUrl, getToken };
}

/**
 * Get current proxy context. Throws if not initialized.
 */
function getProxyContext() {
  if (!proxyContext) {
    throw new Error(
      'Proxy adapter context not initialized. Call setProxyContext() at app startup.',
    );
  }
  return proxyContext;
}

/**
 * Create or retrieve the shared ProxyHttpClient instance.
 * Lazy initialization; reused across all repositories.
 */
let proxyHttpClientInstance: ProxyHttpClient | null = null;

function getProxyHttpClient(): ProxyHttpClient {
  if (!proxyHttpClientInstance) {
    const context = getProxyContext();
    proxyHttpClientInstance = new ProxyHttpClient({
      baseUrl: context.baseUrl,
      getToken: context.getToken,
    });
  }
  return proxyHttpClientInstance;
}

// Now update the existing factory functions:

export function createLeadRepository(mode?: AdapterMode): ILeadRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockLeadRepository();
    case 'proxy':
      return new ProxyLeadRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'LeadRepository');
  }
}

export function createScheduleRepository(
  mode?: AdapterMode,
): IScheduleRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockScheduleRepository();
    case 'proxy':
      return new ProxyScheduleRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ScheduleRepository');
  }
}

export function createBuyoutRepository(mode?: AdapterMode): IBuyoutRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockBuyoutRepository();
    case 'proxy':
      return new ProxyBuyoutRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'BuyoutRepository');
  }
}

export function createEstimatingRepository(
  mode?: AdapterMode,
): IEstimatingRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockEstimatingRepository();
    case 'proxy':
      return new ProxyEstimatingRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'EstimatingRepository');
  }
}

export function createComplianceRepository(
  mode?: AdapterMode,
): IComplianceRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockComplianceRepository();
    case 'proxy':
      return new ProxyComplianceRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ComplianceRepository');
  }
}

export function createContractRepository(
  mode?: AdapterMode,
): IContractRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockContractRepository();
    case 'proxy':
      return new ProxyContractRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ContractRepository');
  }
}

export function createRiskRepository(mode?: AdapterMode): IRiskRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockRiskRepository();
    case 'proxy':
      return new ProxyRiskRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'RiskRepository');
  }
}

export function createScorecardRepository(
  mode?: AdapterMode,
): IScorecardRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockScorecardRepository();
    case 'proxy':
      return new ProxyScorecardRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ScorecardRepository');
  }
}

export function createPmpRepository(mode?: AdapterMode): IPmpRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockPmpRepository();
    case 'proxy':
      return new ProxyPmpRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'PmpRepository');
  }
}

export function createProjectRepository(
  mode?: AdapterMode,
): IProjectRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockProjectRepository();
    case 'proxy':
      return new ProxyProjectRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ProjectRepository');
  }
}

export function createAuthRepository(mode?: AdapterMode): IAuthRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockAuthRepository();
    case 'proxy':
      return new ProxyAuthRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'AuthRepository');
  }
}
```

**Verification:**

```bash
# These commands are available now (no Task 0 needed):
pnpm --filter @hbc/data-access check-types
pnpm --filter @hbc/data-access lint

# Expected: no type errors, no lint errors
# Commit: git commit -m "feat: wire proxy repositories into factory, export ProxyHttpClient"
```

---

### Task 9: Integration test — proxy adapter end-to-end

**Files:**
- Create: `packages/data-access/src/adapters/proxy/proxy-integration.test.ts`

**Test:**

```typescript
// packages/data-access/src/adapters/proxy/proxy-integration.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ILead, IActiveProject } from '@hbc/models';
import {
  setProxyContext,
  createLeadRepository,
  createProjectRepository,
  resolveAdapterMode,
} from '../../factory.js';

describe('Proxy Adapter Integration', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    // Initialize proxy context
    setProxyContext(
      'https://api.example.com',
      async () => 'test-jwt-token',
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('createLeadRepository with proxy mode', () => {
    it('should create ProxyLeadRepository when mode is proxy', async () => {
      const mockLead: ILead = {
        id: 1,
        title: 'Test Lead',
        stage: 'prospecting',
        clientName: 'Acme Corp',
        estimatedValue: 50000,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ data: [mockLead], total: 1, page: 1, pageSize: 20 }),
      });

      const repo = createLeadRepository('proxy');
      const result = await repo.getAll({ page: 1, pageSize: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('Test Lead');

      // Verify HTTP request details
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/leads');
      expect(init.headers['Authorization']).toBe('Bearer test-jwt-token');
      expect(init.method).toBe('GET');
    });

    it('should reuse single ProxyHttpClient instance across repositories', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ data: [], total: 0, page: 1, pageSize: 20 }),
      });

      const leadRepo = createLeadRepository('proxy');
      const projectRepo = createProjectRepository('proxy');

      await leadRepo.getAll();
      await projectRepo.getProjects();

      // Both calls should use same HTTP client (evidenced by sequential fetch calls)
      expect(mockFetch).toHaveBeenCalledTimes(2);
      const [firstUrl] = mockFetch.mock.calls[0];
      const [secondUrl] = mockFetch.mock.calls[1];
      expect(firstUrl).toContain('/api/leads');
      expect(secondUrl).toContain('/api/projects');
    });

    it('should handle authentication token refresh', async () => {
      let tokenCallCount = 0;
      setProxyContext('https://api.example.com', async () => {
        tokenCallCount++;
        return `token-${tokenCallCount}`;
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ data: [], total: 0, page: 1, pageSize: 20 }),
      });

      const repo = createLeadRepository('proxy');
      await repo.getAll();
      await repo.getAll();

      // Each request should call getToken
      expect(tokenCallCount).toBe(2);
      const [, firstInit] = mockFetch.mock.calls[0];
      const [, secondInit] = mockFetch.mock.calls[1];
      expect(firstInit.headers['Authorization']).toBe('Bearer token-1');
      expect(secondInit.headers['Authorization']).toBe('Bearer token-2');
    });

    it('should map paginated responses correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          data: [
            { id: 1, title: 'Lead 1', stage: 'prospecting', clientName: 'Client 1', estimatedValue: 10000, createdAt: '', updatedAt: '' },
            { id: 2, title: 'Lead 2', stage: 'qualified', clientName: 'Client 2', estimatedValue: 20000, createdAt: '', updatedAt: '' },
          ],
          total: 100,
          page: 3,
          pageSize: 25,
        }),
      });

      const repo = createLeadRepository('proxy');
      const result = await repo.getAll({ page: 3, pageSize: 25 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(100);
      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(25);
    });

    it('should require setProxyContext before creating proxy repos', () => {
      // Unstub to reset factory state
      vi.unstubAllGlobals();

      // Create new factory context without setProxyContext
      expect(() => {
        createLeadRepository('proxy');
      }).toThrow('Proxy adapter context not initialized');
    });
  });

  describe('error propagation', () => {
    it('should propagate 404 errors from backend', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Not found' }),
      });

      const repo = createLeadRepository('proxy');
      const result = await repo.getById(999);

      // getById should return null on 404
      expect(result).toBeNull();
    });

    it('should propagate 500 errors as HbcDataAccessError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Database error', code: 'DB_ERROR', requestId: 'req-456' }),
      });

      const repo = createLeadRepository('proxy');
      await expect(repo.getAll()).rejects.toThrow();
    });
  });
});
```

**Verification:**

```bash
# Requires: Task 0 (vitest setup) completed first
pnpm --filter @hbc/data-access test -- proxy-integration
pnpm --filter @hbc/data-access check-types

# Expected: All 8+ tests pass
# Commit: git commit -m "feat: add integration tests for proxy adapter factory wiring"
```

---

### Task 10: Run full test suite and clean up stubs

**Steps:**

1. **Run package tests** (requires Task 0 completed):

```bash
# Full data-access test suite
pnpm --filter @hbc/data-access test

# Expected: 100+ tests pass across all proxy adapter test files
```

2. **Type check** (available now):

```bash
pnpm --filter @hbc/data-access check-types

# Expected: no errors
```

3. **Lint** (available now):

```bash
pnpm --filter @hbc/data-access lint

# Expected: no errors
```

4. **Verify stubs are removed:**

All `AdapterNotImplementedError` throws for proxy mode should now be replaced with concrete implementations. The factory functions should construct real proxy repositories.

```bash
# Check for remaining stubs
grep -r "AdapterNotImplementedError.*proxy" packages/data-access/src/factory.ts

# Expected output: no matches (all proxy entries replaced)
```

5. **Final commit:**

```bash
git commit -m "feat: complete proxy adapter implementation - all 11 repositories wired and tested

- ProxyHttpClient: Bearer auth, error translation, request tracing
- ProxyBaseRepository: shared path building and query marshaling
- 11 domain repositories: Lead, Project, Estimating, Schedule, Buyout,
  Compliance, Contract, Risk, Scorecard, PMP, Auth
- Factory integration: setProxyContext() initialization, lazy HttpClient singleton
- 100+ tests covering domain-specific methods, pagination, error handling (B1 adapter tests with mocked fetch — not E1 contract validation)
- Integration tests verifying end-to-end factory wiring"
```

**Final verification command:**

```bash
# Full package validation (requires Task 0 completed for test command)
pnpm --filter @hbc/data-access test && \
pnpm --filter @hbc/data-access check-types && \
pnpm --filter @hbc/data-access lint

# Expected: ~100 tests pass, 0 type errors, 0 lint errors
```

---

## Milestones

| Milestone | Chunk | Deliverable | Gate |
|---|---|---|---|
| **M0** | Chunk 0 | Vitest configured for `@hbc/data-access`; `pnpm --filter @hbc/data-access test` runs successfully | `vitest run` exits 0 |
| **M1** | Chunk 1 | `ProxyHttpClient` + `ProxyBaseRepository` implemented and tested | 24+ unit tests pass; `check-types` clean |
| **M2** | Chunk 2 | Lead + Project proxy repositories complete | First two real domain adapters pass all tests; factory returns proxy repos |
| **M3** | Chunk 3 | All 11 proxy repositories implemented | 90+ tests across all adapter test files |
| **M4** | Chunk 4 | Factory wired, integration tests passing, full suite green | 100+ tests pass; `check-types` and `lint` clean; no `AdapterNotImplementedError` for proxy mode |

---

## Acceptance Criteria

B1 is **done** when all of the following are true:

1. All 11 proxy repository classes exist in `packages/data-access/src/adapters/proxy/` and implement their corresponding port interfaces
2. `pnpm --filter @hbc/data-access test` passes with 100+ tests (all using mocked `fetch`, no network calls)
3. `pnpm --filter @hbc/data-access check-types` passes with zero errors
4. `pnpm --filter @hbc/data-access lint` passes with zero errors
5. Every `create*Repository('proxy')` factory call returns a concrete proxy repository (no `AdapterNotImplementedError`)
6. `setProxyContext(baseUrl, getToken)` initializes the lazy `ProxyHttpClient` singleton correctly
7. Calling `create*Repository('proxy')` without prior `setProxyContext()` throws a clear initialization error
8. Proxy adapter barrel (`adapters/proxy/index.ts`) exports all implementations
9. `@hbc/data-access` is added to the root `pnpm test` filter

B1 is **not done** until these are independently verified. Backend availability, MSAL registration, and contract testing (E1) are NOT acceptance criteria for B1 — B1 delivers testable adapter code, not end-to-end integration.

---

## Package and App Ownership

| Package / App | Role | What Changes |
|---|---|---|
| `@hbc/data-access` | **Primary** | All proxy adapter code, factory wiring, test files, vitest config |
| `@hbc/models` | Referenced (read-only) | Domain types and shared pagination types consumed by adapters |
| `@hbc/query-hooks` | Consumer (not modified) | Calls factory functions; will automatically use proxy repos when mode='proxy' |
| `apps/pwa` | Guidance only | Bootstrap activation example for `main.tsx`; no code changes in B1 scope |

---

## Appendix A: Route Contract Planning Matrix

This appendix maps every proxy-backed repository method to its expected backend route. Each entry is labeled with its C1 confirmation status. **All response envelopes follow the C1-confirmed shapes documented in Appendix B unless otherwise noted.**

### Tier 1 — C1 Path Locked (Leads, Projects, Estimating)

These routes are confirmed in P1-C1 as high-priority Phase 1 targets with locked base paths.

#### Lead Repository (`/api/leads` — C1 confirmed)

| Method | Verb | Path | Params / Body | Response | C1 Status |
|---|---|---|---|---|---|
| `getAll(options?)` | GET | `/api/leads` | `?page=&pageSize=&sortBy=&sortOrder=&search=` | Collection envelope | Confirmed |
| `getById(id)` | GET | `/api/leads/{id}` | — | Single-item envelope | Confirmed |
| `create(data)` | POST | `/api/leads` | `ILeadFormData` body | Single-item envelope | Confirmed |
| `update(id, data)` | PUT | `/api/leads/{id}` | `Partial<ILeadFormData>` body | Single-item envelope | Confirmed |
| `delete(id)` | DELETE | `/api/leads/{id}` | — | 204 No Content | Confirmed |
| `search(query, options?)` | GET | `/api/leads/search` | `?q=&page=&pageSize=` | Collection envelope | Confirmed |

#### Project Repository (`/api/projects` — C1 confirmed)

| Method | Verb | Path | Params / Body | Response | C1 Status |
|---|---|---|---|---|---|
| `getProjects(options?)` | GET | `/api/projects` | `?page=&pageSize=&sortBy=&sortOrder=` | Collection envelope (`IActiveProject[]`) | Confirmed |
| `getProjectById(id)` | GET | `/api/projects/{id}` | — | Single-item envelope (`IActiveProject`) | Confirmed |
| `createProject(data)` | POST | `/api/projects` | `Omit<IActiveProject, 'id'>` body | Single-item envelope | Confirmed |
| `updateProject(id, data)` | PUT | `/api/projects/{id}` | `Partial<IActiveProject>` body | Single-item envelope | Confirmed |
| `deleteProject(id)` | DELETE | `/api/projects/{id}` | — | 204 No Content | Confirmed |
| `getPortfolioSummary()` | GET | `/api/projects/portfolio-summary` | — | Single-item envelope (`IPortfolioSummary`) | **Assumed** — C1 defines generic CRUD; this aggregate endpoint is not in the catalog |

#### Estimating Repository (`/api/estimating` — C1 confirmed base path)

| Method | Verb | Path | Params / Body | Response | C1 Status |
|---|---|---|---|---|---|
| `getAllTrackers(options?)` | GET | `/api/estimating/trackers` | `?page=&pageSize=` | Collection envelope (`IEstimatingTracker[]`) | **Discrepancy** — C1 defines `/api/estimating` flat; B1 uses `/trackers` sub-resource |
| `getTrackerById(id)` | GET | `/api/estimating/trackers/{id}` | — | Single-item envelope | **Discrepancy** — sub-resource path |
| `createTracker(data)` | POST | `/api/estimating/trackers` | `Omit<..., 'id'\|'createdAt'\|'updatedAt'>` body | Single-item envelope | **Discrepancy** |
| `updateTracker(id, data)` | PUT | `/api/estimating/trackers/{id}` | `Partial<IEstimatingTracker>` body | Single-item envelope | **Discrepancy** |
| `deleteTracker(id)` | DELETE | `/api/estimating/trackers/{id}` | — | 204 No Content | **Discrepancy** |
| `getKickoff(projectId)` | GET | `/api/estimating/kickoffs/{projectId}` | — | Single-item envelope (`IEstimatingKickoff`) or null | **Assumed** — not in C1 catalog |
| `createKickoff(data)` | POST | `/api/estimating/kickoffs` | `Omit<..., 'id'\|'createdAt'>` body | Single-item envelope | **Assumed** |

> **Resolution needed:** C1 defines flat `/api/estimating` with generic CRUD. B1 repo truth has two entity types (tracker + kickoff) requiring sub-resource paths. Must confirm with C1 whether backend will support sub-resource routing or a different pattern.

### Tier 2 — Project-Scoped Domain Routes (D1/D6 LOCKED)

These routes follow the locked D6 nested pattern: `/api/projects/{projectId}/{domain}`. D1 (plural naming) and D6 (nested paths) are resolved per P1-E1 Locked Decisions 1 and 8. Route paths updated 2026-03-18 to replace pre-D6 flat `?projectId=` patterns.

#### Schedule Repository — `/api/projects/{projectId}/schedules` (D1 plural, D6 nested)

| Method | Verb | Path | Params / Body | Response | Status |
|---|---|---|---|---|---|
| `getActivities(projectId, options?)` | GET | `/api/projects/{projectId}/schedules` | `?page=&pageSize=` | Collection envelope (`IScheduleActivity[]`) | D6 locked |
| `getActivityById(projectId, id)` | GET | `/api/projects/{projectId}/schedules/{id}` | — | Single-item envelope | D6 locked |
| `createActivity(projectId, data)` | POST | `/api/projects/{projectId}/schedules` | `Omit<IScheduleActivity, 'id'>` body | Single-item envelope (201) | D6 locked |
| `updateActivity(projectId, id, data)` | PUT | `/api/projects/{projectId}/schedules/{id}` | `Partial<IScheduleActivity>` body | Single-item envelope | D6 locked |
| `deleteActivity(projectId, id)` | DELETE | `/api/projects/{projectId}/schedules/{id}` | — | 204 No Content | D6 locked |
| `getMetrics(projectId)` | GET | `/api/projects/{projectId}/schedules/metrics` | — | Single-item envelope (`IScheduleMetrics`) | Aggregate — not in C1 catalog |

#### Buyout Repository — `/api/projects/{projectId}/buyouts` (D1 plural, D6 nested)

| Method | Verb | Path | Params / Body | Response | Status |
|---|---|---|---|---|---|
| `getEntries(projectId, options?)` | GET | `/api/projects/{projectId}/buyouts` | `?page=&pageSize=` | Collection envelope (`IBuyoutEntry[]`) | D6 locked |
| `getEntryById(projectId, id)` | GET | `/api/projects/{projectId}/buyouts/{id}` | — | Single-item envelope | D6 locked |
| `createEntry(projectId, data)` | POST | `/api/projects/{projectId}/buyouts` | `Omit<IBuyoutEntry, 'id'>` body | Single-item envelope (201) | D6 locked |
| `updateEntry(projectId, id, data)` | PUT | `/api/projects/{projectId}/buyouts/{id}` | `Partial<IBuyoutEntry>` body | Single-item envelope | D6 locked |
| `deleteEntry(projectId, id)` | DELETE | `/api/projects/{projectId}/buyouts/{id}` | — | 204 No Content | D6 locked |
| `getSummary(projectId)` | GET | `/api/projects/{projectId}/buyouts/summary` | — | Single-item envelope (`IBuyoutSummary`) | Aggregate — not in C1 catalog |

#### Compliance Repository — `/api/projects/{projectId}/compliance` (D6 nested)

| Method | Verb | Path | Params / Body | Response | Status |
|---|---|---|---|---|---|
| `getEntries(projectId, options?)` | GET | `/api/projects/{projectId}/compliance` | `?page=&pageSize=` | Collection envelope (`IComplianceEntry[]`) | D6 locked |
| `getEntryById(projectId, id)` | GET | `/api/projects/{projectId}/compliance/{id}` | — | Single-item envelope | D6 locked |
| `createEntry(projectId, data)` | POST | `/api/projects/{projectId}/compliance` | `Omit<IComplianceEntry, 'id'>` body | Single-item envelope (201) | D6 locked |
| `updateEntry(projectId, id, data)` | PUT | `/api/projects/{projectId}/compliance/{id}` | `Partial<IComplianceEntry>` body | Single-item envelope | D6 locked |
| `deleteEntry(projectId, id)` | DELETE | `/api/projects/{projectId}/compliance/{id}` | — | 204 No Content | D6 locked |
| `getSummary(projectId)` | GET | `/api/projects/{projectId}/compliance/summary` | — | Single-item envelope (`IComplianceSummary`) | Aggregate — not in C1 catalog |

#### Contract Repository — `/api/projects/{projectId}/contracts` (D6 nested)

| Method | Verb | Path | Params / Body | Response | Status |
|---|---|---|---|---|---|
| `getContracts(projectId, options?)` | GET | `/api/projects/{projectId}/contracts` | `?page=&pageSize=` | Collection envelope (`IContractInfo[]`) | D6 locked |
| `getContractById(projectId, id)` | GET | `/api/projects/{projectId}/contracts/{id}` | — | Single-item envelope | D6 locked |
| `createContract(projectId, data)` | POST | `/api/projects/{projectId}/contracts` | `Omit<IContractInfo, 'id'>` body | Single-item envelope (201) | D6 locked |
| `updateContract(projectId, id, data)` | PUT | `/api/projects/{projectId}/contracts/{id}` | `Partial<IContractInfo>` body | Single-item envelope | D6 locked |
| `deleteContract(projectId, id)` | DELETE | `/api/projects/{projectId}/contracts/{id}` | — | 204 No Content | D6 locked |
| `getApprovals(projectId, contractId)` | GET | `/api/projects/{projectId}/contracts/{contractId}/approvals` | — | Array envelope (`ICommitmentApproval[]`) | Sub-resource — not in C1 catalog |
| `createApproval(projectId, contractId, data)` | POST | `/api/projects/{projectId}/contracts/{contractId}/approvals` | `Omit<ICommitmentApproval, 'id'>` body | Single-item envelope (201) | Sub-resource — not in C1 catalog |

#### Risk Repository — `/api/projects/{projectId}/risks` (D1 plural, D6 nested)

| Method | Verb | Path | Params / Body | Response | Status |
|---|---|---|---|---|---|
| `getItems(projectId, options?)` | GET | `/api/projects/{projectId}/risks` | `?page=&pageSize=` | Collection envelope (`IRiskCostItem[]`) | D6 locked |
| `getItemById(projectId, id)` | GET | `/api/projects/{projectId}/risks/{id}` | — | Single-item envelope | D6 locked |
| `createItem(projectId, data)` | POST | `/api/projects/{projectId}/risks` | `Omit<IRiskCostItem, 'id'>` body | Single-item envelope (201) | D6 locked |
| `updateItem(projectId, id, data)` | PUT | `/api/projects/{projectId}/risks/{id}` | `Partial<IRiskCostItem>` body | Single-item envelope | D6 locked |
| `deleteItem(projectId, id)` | DELETE | `/api/projects/{projectId}/risks/{id}` | — | 204 No Content | D6 locked |
| `getManagement(projectId)` | GET | `/api/projects/{projectId}/risks/management` | — | Single-item envelope (`IRiskCostManagement`) | Aggregate — not in C1 catalog |

#### Scorecard Repository — `/api/projects/{projectId}/scorecards` (D1 plural, D6 nested)

| Method | Verb | Path | Params / Body | Response | Status |
|---|---|---|---|---|---|
| `getScorecards(projectId, options?)` | GET | `/api/projects/{projectId}/scorecards` | `?page=&pageSize=` | Collection envelope (`IGoNoGoScorecard[]`) | D6 locked |
| `getScorecardById(projectId, id)` | GET | `/api/projects/{projectId}/scorecards/{id}` | — | Single-item envelope | D6 locked |
| `createScorecard(projectId, data)` | POST | `/api/projects/{projectId}/scorecards` | `Omit<..., 'id'\|'createdAt'\|'updatedAt'>` body | Single-item envelope (201) | D6 locked |
| `updateScorecard(projectId, id, data)` | PUT | `/api/projects/{projectId}/scorecards/{id}` | `Partial<IGoNoGoScorecard>` body | Single-item envelope | D6 locked |
| `deleteScorecard(projectId, id)` | DELETE | `/api/projects/{projectId}/scorecards/{id}` | — | 204 No Content | D6 locked |
| `getVersions(projectId, scorecardId)` | GET | `/api/projects/{projectId}/scorecards/{scorecardId}/versions` | — | Array envelope (`IScorecardVersion[]`) | Sub-resource — not in C1 catalog |

#### PMP Repository — `/api/projects/{projectId}/pmp` (D6 nested)

| Method | Verb | Path | Params / Body | Response | Status |
|---|---|---|---|---|---|
| `getPlans(projectId, options?)` | GET | `/api/projects/{projectId}/pmp` | `?page=&pageSize=` | Collection envelope (`IProjectManagementPlan[]`) | D6 locked |
| `getPlanById(projectId, id)` | GET | `/api/projects/{projectId}/pmp/{id}` | — | Single-item envelope | D6 locked |
| `createPlan(projectId, data)` | POST | `/api/projects/{projectId}/pmp` | `Omit<..., 'id'\|'createdAt'\|'updatedAt'>` body | Single-item envelope (201) | D6 locked |
| `updatePlan(projectId, id, data)` | PUT | `/api/projects/{projectId}/pmp/{id}` | `Partial<IProjectManagementPlan>` body | Single-item envelope | D6 locked |
| `deletePlan(projectId, id)` | DELETE | `/api/projects/{projectId}/pmp/{id}` | — | 204 No Content | D6 locked |
| `getSignatures(projectId, pmpId)` | GET | `/api/projects/{projectId}/pmp/{pmpId}/signatures` | — | Array envelope (`IPMPSignature[]`) | Sub-resource — not in C1 catalog |
| `createSignature(projectId, pmpId, data)` | POST | `/api/projects/{projectId}/pmp/{pmpId}/signatures` | `Omit<IPMPSignature, 'id'>` body | Single-item envelope (201) | Sub-resource — not in C1 catalog |

### Tier 3 — No C1 Route Defined (Auth)

Auth is not part of C1's domain CRUD routes. It is a separate subsystem managed by C2 (auth hardening).

#### Auth Repository (`/api/auth` — **not in C1 catalog**)

| Method | Verb | Path (B1 provisional) | Params / Body | Response | C1 Status |
|---|---|---|---|---|---|
| `getCurrentUser()` | GET | `/api/auth/me` | — | Single-item envelope (`ICurrentUser`) | **Assumed** — no C1 route; managed by C2 |
| `getRoles()` | GET | `/api/auth/roles` | — | Array (`IRole[]`) | **Assumed** |
| `getRoleById(id)` | GET | `/api/auth/roles/{id}` | — | Single-item envelope (`IRole`) or null | **Assumed** |
| `getPermissionTemplates()` | GET | `/api/auth/permission-templates` | — | Array (`IPermissionTemplate[]`) | **Assumed** |
| `assignRole(userId, roleId)` | POST | `/api/auth/users/{userId}/roles` | `{ roleId }` body | 204 No Content | **Assumed** |
| `removeRole(userId, roleId)` | DELETE | `/api/auth/users/{userId}/roles/{roleId}` | — | 204 No Content | **Assumed** |

> Auth routes are entirely B1-assumed. C2 defines auth middleware behavior but does not catalog auth-management endpoints. These routes must be confirmed with the auth/platform team.

---

## Appendix B: Response Envelope Reconciliation

### C1-Confirmed Envelope Shapes

C1 defines these standard response shapes (updated per locked decisions D3, D4, D16). All B1 proxy adapter code must conform to these.

**Collection (paginated):**
```json
{ "items": [ /* T[] */ ], "total": 0, "page": 1, "pageSize": 25 }
```

**Single item:**
```json
{ "data": { /* T */ } }
```

**No content:** HTTP 204 with empty body (per RFC 9110 — no JSON wrapper).

**Error (D3 locked: `message` not `error`):**
```json
{ "message": "Human-readable message", "code": "ERROR_CODE", "requestId": "uuid" }
```

### B1 vs C1 Discrepancies

| Concern | B1 Current Code | C1 Contract | Action Required |
|---|---|---|---|
| **Error field name** | `extractErrorMessage()` reads `.message` first (D3 locked), falls back to `.error` for pre-Phase-1 routes | Target: `body.message` | **D3 RESOLVED:** `message` is primary field. B1 reads `.message` first, `.error` fallback for backward compatibility with existing routes only |
| **Error code field** | Does not read response `code` | Sends `code` in error body | **Should use:** Map C1's `code` field to `HbcDataAccessError.code` when available |
| **Request ID in errors** | Not extracted from error response | Sends `requestId` in error body | **Optional:** Could log `requestId` from error response for debugging |
| **Default pageSize** | `mapPagedResponse` uses `DEFAULT_PAGE_SIZE` from `@hbc/models` (25) as fallback when backend omits pageSize | Default 25, max 100 | **D4 RESOLVED:** B1 and C1 now agree on default 25, max 100 |
| **pageSize max** | `@hbc/models` `MAX_PAGE_SIZE` = 100 | Max 100 | **D4 RESOLVED:** C1 updated to max 100 (previously 200). B1 and C1 now aligned |

### Impact on Implementation

Most discrepancies are now resolved per locked decisions (D3, D4). Remaining items (error `code` mapping, `requestId` logging) are implementation enhancements, not blockers. All B1 tests use mocked fetch so implementation can proceed against the locked contract shapes.

---

## Summary

This plan delivers a production-ready proxy adapter across **11 sequential tasks** (Task 0–10), organized into **5 focused chunks**:

- **Chunk 0:** Test infrastructure prerequisite (vitest setup for @hbc/data-access)
- **Chunk 1:** HTTP client + base repository (~450 lines)
- **Chunk 2:** Lead + Project repositories (~550 lines)
- **Chunk 3:** Remaining 9 domain repositories (~700 lines + commit statements)
- **Chunk 4:** Factory wiring + integration tests (~380 lines)

**Key properties:**
- **TDD discipline:** Each task writes failing tests first, then implementation.
- **No external HTTP libraries:** Uses native `fetch` API only.
- **Zero-dependency auth:** Bearer tokens passed from frontend; backend performs MSAL OBO.
- **Full error translation:** HTTP status codes → domain errors.
- **Checkpoint commits:** After each task.
- **100+ test cases:** Unit, integration, error path coverage.
- **Domain-specific contracts:** Each repository implements its actual port interface — only Lead follows a generic CRUD+search pattern; others use domain-specific method names, project-scoped queries, and multi-entity contracts.
- **Exact TypeScript examples:** Developer can copy-paste and verify.

**Implementation is ready for a developer with zero HB Intel knowledge to execute end-to-end.**
