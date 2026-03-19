# Phase 1 — Contract Test Suite Engineering Plan

| Field | Value |
|---|---|
| **Doc ID** | P1-E1 |
| **Phase** | Phase 1 |
| **Workstream** | E — Contract Testing and Staging Readiness |
| **Document Type** | Implementation Plan |
| **Owner** | E1-workstream lead (TBD) |
| **Status** | Implementation-Ready — B1 and C1 DELIVERED; blocked only on schema infrastructure (Task 1–2) and staging infra (Task 8) |
| **Date** | 2026-03-16 |
| **Last Reviewed Against Repo Truth** | 2026-03-18 |
| **Audience** | Developers implementing contract tests for Phase 1 critical path |
| **References** | P1-B1 (Proxy Adapter), P1-B2 (Adapter Completion), P1-C1 (Backend Catalog), P1-C2 (Auth Hardening), P1-C3 (Observability), P1-D1 (Write Safety) |

### Status Legend

| Marker | Meaning |
|---|---|
| **CURRENT** | Verified against live repo as of 2026-03-18 |
| **TARGET** | E1 deliverable — implementation planned |
| **PROVISIONAL** | Design decision pending upstream confirmation |
| **BLOCKED** | Cannot implement until dependency is delivered |
| **RESOLVED** | Design decision locked — see Locked Decisions Applied |

### Locked Decisions Applied

The following design decisions were locked on 2026-03-18. This pass reconciles the entire document against these resolutions.

| # | Decision | Resolution |
|---|---|---|
| 1 | Single-record success envelope | `{ data: T }` wrapper — reverses previous bare-object convention |
| 2 | Error envelope field naming (D3) | `message` field — not `error` |
| 3 | Backend tests dependency on `@hbc/data-access` | Type-only `devDependency` — already applied |
| 4 | `@hbc/models` interfaces as canonical | Already applied |
| 5 | Schema conformance mechanism | Compile-time checks — already applied |
| 6 | Update method (D5) | PUT-only in Phase 1 — no PATCH |
| 7 | Default page size (D4) | 25 — confirmed |
| 8 | Project subresources (D6) | Nested `/api/projects/{projectId}/...` |
| 9 | Estimating routes (D2) | `/api/estimating/trackers/...` and `/api/estimating/kickoffs/...` |
| 10 | Tier 2 base routes (D1) | Plural |
| 11 | Project aggregate (A8) | `/api/projects/summary` |
| 12 | Auth routes (A9 partial) | External except `/api/auth/me` smoke utility |
| 13 | Blocked work | Stays blocked — no speculative unblocking |
| 14 | Smoke tests | Skip locally, fail in CI |
| 15 | Vitest setup | First workstream owns it |
| 16 | Delete response | `204 No Content` — confirmed |
| 17 | Telemetry | Requests + dependencies + traces |
| 18 | Request tracing | Response header AND error body |

### Terminology

| Term | Definition |
|---|---|
| **Contract schema** | Zod schema in `@hbc/models/src/api-schemas/` defining the transport shape contract between frontend and backend |
| **Transport shape** | HTTP response structure (envelope, pagination, error format) governed by C1 |
| **Domain interface** | TypeScript interface in `@hbc/models` defining entity field names and types (e.g., `ILead`, `IActiveProject`) |
| **Adapter contract test** | Test verifying proxy adapter responses parse against contract schemas (Tasks 4-5, `@hbc/data-access`) |
| **Route contract test** | Test verifying route handler responses conform to contract schemas (Task 6, `backend/functions`) |
| **Error contract test** | Test verifying error middleware output conforms to ErrorEnvelopeSchema (Task 7, `backend/functions`) |
| **Smoke test** | End-to-end test against a deployed staging instance over real HTTP with real auth tokens (Task 8) |

---

## Purpose

Phase 1 contract testing establishes agreement between frontend proxy adapters (`@hbc/data-access`) and backend Azure Functions on request/response shapes. Using Zod schemas as the contract validation layer, the test suite verifies:

1. **Frontend-backend shape agreement** — proxy adapter responses parse against contract schemas
2. **Backend service layer stability** — backend routes consistently produce contracted transport shapes
3. **Critical path coverage** — smoke tests validate end-to-end flows in production-like conditions

**Architecture:** Shared Zod schemas in `@hbc/models/src/api-schemas/` provide runtime validation for the contract. Domain entity shapes are defined by `@hbc/models` interfaces; Zod schemas must conform to those interfaces (see [Type Source-of-Truth Rule](#type-source-of-truth-rule)). MSW handlers simulate backend responses in frontend tests. Backend validation middleware uses the same schemas, ensuring both sides validate against the same shape rules.

**Tech Stack:** TypeScript, Vitest, MSW v2 (`msw/node`), Zod v3.22+

**Success Criteria:**
- All 11 domain types have contract schemas (Lead, Project, Estimating, +8 others)
- Adapter contract tests prove adapter → domain interface mapping is correct
- Route contract tests prove handlers return contracted transport shapes
- Smoke tests pass against staging Azure Functions
- No blocking contract violations between frontend and backend

### Document Scope

P1-E1 is a **plan-level design document** governing the contract test suite for Phase 1. It defines schemas, test structure, and verification strategy. Implementation proceeds only for items with **TARGET** status whose prerequisites are met. Code examples are implementation guidance — not authorization to build speculative infrastructure or implement ahead of upstream deliverables. As of 2026-03-18, all transport-layer design decisions (D1–D6, A8) are **RESOLVED** — see [Locked Decisions Applied](#locked-decisions-applied). The only remaining PROVISIONAL area is Tier 3 (auth), which awaits C2.

### Non-Goals

The following are explicitly out of scope for E1 implementation until their preconditions are met:

- **Tier 2 domain handlers or tests** — D1/D2/D6 route conventions are now resolved, but do not implement full test code until C1 delivers actual route handlers for each domain.
- **Tier 3 (Auth) schemas or tests** — do not implement full auth schemas or contract tests until C2 publishes auth routes (A9). Exception: `/api/auth/me` is confirmed as a smoke-test utility for token validation (decision 12) — it does not require a Zod schema or contract test lane.
- **Convenience wrapper methods on port interfaces** — use the exact method signatures from `@hbc/data-access/src/ports/`. Do not invent aliases.
- **Root `vitest.workspace.ts` registration** — do not add `@hbc/models` or `@hbc/data-access` to the root workspace until they have stable, passing test suites. Package-local vitest configs are the primary requirement.
- **Programmatic telemetry assertions** — C3 verification is a manual KQL gate step. Do not build automated Application Insights query assertions in test code.

---

## Plan Status and Dependencies

### Current Repo State (verified 2026-03-18)

- `@hbc/models` has no Zod dependency, no test script — only build, check-types, lint (**CURRENT**)
- `@hbc/models/src/contracts/` contains Contracts business domain models (`IContractInfo`, `ICommitmentApproval`, `ContractStatus`) — NOT Zod API schemas (**CURRENT**)
- `@hbc/data-access` has vitest configured (`test` script), 150+ tests passing; all 11 proxy adapters implemented and factory-wired — including `ProxyAuthRepository` (16 methods, 19 tests); A9 resolved per P1-C2-a Task 21 (**CURRENT 2026-03-19**)
- `backend/functions` has vitest test infrastructure (unit, smoke, coverage); all 10 data-domain route handlers delivered (leads, projects, estimating, schedule, buyout, compliance, contracts, risk, scorecards, pmp) using C2 standardized middleware (**CURRENT 2026-03-19**)
- Port interfaces for all 11 domains exist in `@hbc/data-access/src/ports/` (**CURRENT**)

### Repo Truth Snapshot (updated 2026-03-19)

| Package | Test Script | Vitest Config | Zod | Proxy State | Notes |
|---|---|---|---|---|---|
| `@hbc/models` | **No** | **No** | **No** | N/A | devDependency: `@types/react` only; no `api-schemas/` directory exists — E1 Task 1–2 creates this |
| `@hbc/data-access` | **Yes** (`test`) | **Yes** — `vitest.config.ts` | N/A | **Complete** — all 11 proxy repos factory-wired; `ProxyAuthRepository` done (16 methods, 19 tests); 150+ tests passing | v0.1.x |
| `backend/functions` | **Yes** (`test`, `test:smoke`, `test:coverage`, `test:contract-smoke`) | **Yes** — split `unit`/`smoke`/`contract-smoke` projects | N/A | N/A | Does NOT depend on `@hbc/data-access` today (**CURRENT**). Type-only `devDependency` approved. All 10 data-domain route handlers delivered (2026-03-19) with C2 standardized middleware |
| Root workspace | `pnpm test` (filtered) | **Yes** — 6 entries: auth, shell, sharepoint-docs, bic-next-move, complexity, pwa | N/A | N/A | `@hbc/models` and `@hbc/data-access` are NOT in the workspace test list |

**Adapter contract test status (updated 2026-03-19):** All 11 proxy repos are implemented. C1 route handlers for all 10 data domains are delivered. E1 can now proceed with schema infrastructure (Task 1–2) and adapter/route contract tests (Tasks 4–7). Only Auth backend handlers remain Phase 2; `ProxyAuthRepository` contract tests await C2 staging delivery.

### E1 Deliverable Breakdown by Surface

See [Implementation Summary](#implementation-summary) for the full task-by-task status breakdown. The summary below is a high-level surface map only.

| Deliverable | Surface | Status | Dependency |
|---|---|---|---|
| Contract schema infrastructure (shared schemas, per-domain schemas) | `@hbc/models` | **TARGET** — requires Zod dependency + `api-schemas/` setup | None — can start immediately (E1 Task 1–2) |
| MSW handler setup + test utilities | `@hbc/data-access` | **TARGET** — vitest already configured; MSW install + server setup remaining | Vitest already done (B1 Task 0) |
| Adapter contract tests (Lead, Project, Estimating, +7 more) | `@hbc/data-access` | **UNBLOCKED** — B1 all 11 repos delivered; blocked only on schema infrastructure | E1 Tasks 1–2 (schema infra) must land first |
| Route contract tests | `backend/functions` | **UNBLOCKED** — C1 all 10 domain route handlers delivered (2026-03-19) | E1 Tasks 1–2 (schema infra) must land first |
| Error contract tests | `backend/functions` | **UNBLOCKED** — error envelope locked and implemented | E1 Tasks 1–2 (schema infra) must land first |
| Smoke tests | `backend/functions` | **BLOCKED** | C2 (auth middleware) + staging infra |
| Telemetry baseline verification | `backend/functions` | **BLOCKED** | C3 (instrumentation) + staging infra |

### What E1 Can Implement Now

All upstream blockers (B1 proxy adapters, C1 domain route handlers) are **DELIVERED**. E1 can now proceed with:

- Zod dependency + vitest setup for `@hbc/models` (naming resolution is done — target `api-schemas/`)
- Shared Zod schemas (error envelope, pagination) in `@hbc/models/src/api-schemas/`
- Domain schemas for all 10 data domains (Lead, Project, Estimating, +7 project-scoped)
- MSW install + server setup for `@hbc/data-access` (vitest already configured)
- Adapter contract tests for all 10 data domains
- Route contract tests for all 10 data-domain handler groups
- Error contract tests (`ErrorEnvelopeSchema` conformance)

### What E1 Cannot Implement Until Upstream Delivers

See the Open Decision and Blocker Ledger below for the complete list of blocked items and their unblock conditions.

### Open Decision and Blocker Ledger

This is the single authoritative source for all open design decisions and workstream blockers affecting E1. Individual task sections reference this ledger rather than repeating blocker details.

**Table A: Design Decisions (7 of 8 RESOLVED — see Locked Decisions Applied)**

| ID | Decision | Owner | E1 Impact | Resolution | Status |
|---|---|---|---|---|---|
| D1 | Singular vs plural route paths (Schedule, Buyout, Risk, Scorecard) | P1-C1 | Tier 2 schema route-path assumptions | **Plural** — all Tier 2 base routes use plural form | **RESOLVED** |
| D2 | Estimating sub-resource routing (`/trackers`, `/kickoffs`) | P1-C1 | Estimating kickoff schema route assumption | `/api/estimating/trackers/...` and `/api/estimating/kickoffs/...` | **RESOLVED** |
| D3 | Error envelope field naming (`.error` vs `.message`) | P1-C1 + B1 | ErrorEnvelopeSchema field name, `extractErrorMessage()` | **`message`** field — not `error` | **RESOLVED** |
| D4 | Pagination default page size (25 vs 50) | P1-C1 + B1 | PaginationQuerySchema `.default(25)` | **25** — confirmed | **RESOLVED** |
| D5 | PATCH support in proxy adapters | P1-C1 | Whether UpdateLeadRequestSchema needs PATCH semantics | **PUT-only** in Phase 1 | **RESOLVED** |
| D6 | Nested project-scoped paths vs flat `?projectId=` query params | P1-C1 | Tier 2 domain route paths and MSW handler URL patterns | **Nested** `/api/projects/{projectId}/...` | **RESOLVED** |
| A8 | Aggregate endpoint for projects | P1-C1 | PortfolioSummarySchema route path | `/api/projects/summary` | **RESOLVED** |
| A9 | Auth route catalog | P1-C2 | Tier 3 — no auth schema or tests | External except `/api/auth/me` smoke utility; full auth routes still deferred to C2 | **PARTIAL** |

> **Note:** Table A design decisions are resolved — they no longer block schema design. Table B workstream blockers remain active — they block implementation of specific tasks pending upstream deliverables.

**Table B: Workstream Blockers**

| Blocker | Workstream | What It Blocks in E1 | Tasks Affected | What Can Proceed Now | Unblock Condition |
|---|---|---|---|---|---|
| B1 — Proxy Adapter | P1-B1 | Adapter contract tests | Tasks 4, 5 | **DELIVERED** — all 11 proxy repos implemented; unblocks Tasks 4–5 | **CLOSED** — B1 complete as of 2026-03-19 |
| C1 — Backend Catalog | P1-C1 | Route contract tests and error contract tests | Tasks 6, 7, 8 | **DELIVERED** — all 10 data-domain route handlers implemented with C2 middleware; unblocks Tasks 6–7 | **CLOSED** — C1 complete as of 2026-03-19 |
| C2 — Auth Hardening | P1-C2 | Smoke test auth validation | Task 8 (auth tests) | Non-auth smoke tests can be written (skip when no token) | C2 delivers auth middleware for staging |
| C3 — Observability | P1-C3 | Telemetry baseline verification | Task 9 | Telemetry event classification documented | C3 instrumentation lands in staging; events visible in Application Insights |
| D1 — Write Safety | P1-D1 | Shared vitest prerequisite for `@hbc/data-access` | Task 10 (partial) | **DELIVERED** — `withRetry()`, idempotency guard, cleanup timer all implemented; vitest already configured | **CLOSED** — D1 complete as of 2026-03-19 |
| Staging infra | Platform | Smoke tests + telemetry baseline | Tasks 8, 9 | All local contract tests | `SMOKE_TEST_BASE_URL` resolves to deployed staging instance |

### Execution Guardrails

- **Tier 1 (CONFIRMED and DELIVERED):** B1 proxy adapters are complete. C1 route handlers for Lead, Project, Estimating are delivered. Full adapter and route contract test implementation is unblocked — gated only on schema infrastructure (E1 Tasks 1–2).
- **Tier 2 (CONFIRMED and DELIVERED):** D1 (plural), D2 (estimating sub-resources), D6 (nested project-scoped paths), and A8 (`/api/projects/summary`) are resolved. C1 route handlers for all 7 project-scoped domains delivered 2026-03-19. Full test code, MSW handlers, and route contract tests for Tier 2 domains are unblocked — gated only on schema infrastructure (E1 Tasks 1–2).
- **Tier 3 (NOT CATALOGED):** Auth remains out of scope for full schemas — no auth schema or tests until C2 publishes auth route truth. `/api/auth/me` is available as a smoke utility only (decision 12).
- **Transport-layer details (LOCKED):** D3 (`message` field), D4 (page size 25), D5 (PUT-only), D6 (nested paths), single-item `{ data: T }` wrapper, and Delete `204 No Content` are all locked. No PROVISIONAL markers remain on transport-layer conventions.
- **No speculative unblocking:** Do not implement blocked tasks "optimistically" by guessing what B1/C1/C2 will deliver. Wait for the actual deliverable.
- **No placeholder scaffolding:** Do not create skipped test suites, empty test files, or `describe.skip()` blocks for blocked tasks just to show progress. Implement only what is truly unblocked. Placeholder code creates maintenance burden and false signals about readiness.

### Naming Conflict Resolution

The current `@hbc/models/src/contracts/` directory is the **Contracts business domain** (legal contracts, commitment approvals). E1 must NOT overwrite this with Zod API schemas.

**Resolution:** All E1 Zod schemas target `@hbc/models/src/api-schemas/` instead:
- `packages/models/src/api-schemas/shared-schema.ts`
- `packages/models/src/api-schemas/lead-schema.ts`
- `packages/models/src/api-schemas/project-schema.ts`
- `packages/models/src/api-schemas/estimating-schema.ts`
- (remaining domain schemas follow the same pattern)
- `packages/models/src/api-schemas/index.ts` — barrel export

### Verification Command Guidance

**Test infrastructure status (CURRENT):**

| Package | `test` Script | Vitest Config | In Root Workspace | Status |
|---|---|---|---|---|
| `@hbc/models` | **No** | **No** | **No** | E1 must add Zod + vitest config + test script (E1 Task 1–2 prerequisite) |
| `@hbc/data-access` | **Yes** (`test`) | **Yes** (`vitest.config.ts`) | **No** | **CURRENT — vitest already configured (B1 Task 0 + D1)**; E1 must add `msw` and contract test files only |
| `@hbc/functions` | **Yes** (`test`, `test:smoke`, `test:coverage`, `test:contract-smoke`) | **Yes** (unit + smoke + contract-smoke named projects) | **No** (standalone config) | E1 must add full `contract` project and route contract test files |

**E1 test lane classification:**

| Lane | Package | Command | What It Runs | Prerequisite |
|---|---|---|---|---|
| Schema unit tests | `@hbc/models` | `pnpm --filter @hbc/models test` | Zod schema parse/reject tests | Add vitest + test script |
| MSW setup tests | `@hbc/data-access` | `pnpm --filter @hbc/data-access test` | MSW server/handler smoke tests | Add vitest + test script |
| Adapter contract tests | `@hbc/data-access` | `pnpm --filter @hbc/data-access test` | Adapter → MSW → Zod pipeline | B1 proxy adapters + vitest setup |
| Route contract tests | `@hbc/functions` | `pnpm --filter @hbc/functions test:contract` | Route handler → contract schema conformance | C1 route handlers + vitest config update |
| Smoke tests | `@hbc/functions` | `pnpm --filter @hbc/functions test:smoke` | End-to-end against staging | C1 + C2 + staging infra |

**Setup tasks E1 must complete before verification commands work:**

1. **`@hbc/models` vitest setup** (required):
   - Add `zod` to `dependencies` and `vitest` to `devDependencies` in `packages/models/package.json`
   - Create `packages/models/vitest.config.ts`: `environment: 'node'`, `globals: true`, `include: ['src/**/*.test.ts']`
   - Add `"test": "vitest run"` to `packages/models/package.json` scripts
   - **Optional follow-on:** Register in root `vitest.workspace.ts` after the package has stable passing tests. The root workspace currently lists 6 packages (auth, shell, sharepoint-docs, bic-next-move, complexity, pwa). Package-local `pnpm --filter @hbc/models test` works without root registration.

2. **`@hbc/data-access` vitest setup** — **ALREADY COMPLETE** (B1 Task 0 + D1):
   - `vitest.config.ts` exists; `test` script in `package.json`; 150+ tests passing (**DONE**)
   - E1 remaining work: add `msw` to `devDependencies` and write MSW server setup + handler files
   - **Optional follow-on:** Register in root `vitest.workspace.ts` after stable tests exist. Same rationale as `@hbc/models`.

3. **`@hbc/functions` vitest config update** (required after C1 delivers route handlers):
   - **Why explicit discovery matters:** The current `backend/functions/vitest.config.ts` uses named projects (`unit`, `smoke`) with **explicit file-path include lists**. Vitest does NOT auto-discover files outside these lists — new `.contract.test.ts` files would be silently invisible to `vitest run`.
   - **Required:** Add a dedicated `contract` project to the `projects` array (see Task 10 for details). This matches the existing `unit`/`smoke` separation, enables independent `pnpm --filter @hbc/functions test:contract`, and prevents coupling between provisioning unit tests and contract test prerequisites.
   - Add `"test:contract": "vitest run --config vitest.config.ts --project contract"` to `backend/functions/package.json` scripts

**`@hbc/functions` existing test commands (CURRENT — runnable now):**
- Unit tests: `pnpm --filter @hbc/functions test`
- Smoke tests: `pnpm --filter @hbc/functions test:smoke`
- Coverage: `pnpm --filter @hbc/functions test:coverage`

### Test Lane Ownership

Each test lane has a single package owner, a specific command, and clear pass/fail criteria. Do not mix lanes across packages.

| Lane | Package Owner | Command | Pass Criteria | Blocked On | CI-Ready? |
|---|---|---|---|---|---|
| Schema unit tests | `@hbc/models` | `pnpm --filter @hbc/models test` | All Zod parse/reject assertions pass | Zod + vitest setup | Yes — after setup |
| MSW setup tests | `@hbc/data-access` | `pnpm --filter @hbc/data-access test` | Server starts, handlers registered, unhandled requests fail | Vitest + MSW setup | Yes — after setup |
| Adapter contract tests | `@hbc/data-access` | `pnpm --filter @hbc/data-access test` | Adapter responses parse against contract schemas | B1 proxy repositories | No — blocked |
| Route contract tests | `@hbc/functions` | `pnpm --filter @hbc/functions test:contract` | Route handlers return contract-schema-conformant responses | C1 route handlers | No — blocked |
| Error contract tests | `@hbc/functions` | `pnpm --filter @hbc/functions test:contract` | All error paths conform to ErrorEnvelopeSchema | C1 error middleware | No — blocked |
| Smoke tests | `@hbc/functions` | `pnpm --filter @hbc/functions test:smoke` | End-to-end flows pass against staging | C1 + C2 + staging | No — blocked |
| Telemetry baseline | `@hbc/functions` | `pnpm --filter @hbc/functions test:smoke` | Traffic generates expected C3 events (manual KQL) | C3 + staging | No — blocked |

---

## Architecture and Constraints

### Source-of-Truth Hierarchy

Contract tests enforce a strict two-layer shape agreement:

```
┌──────────────────────────────────────────────────┐
│ @hbc/models interfaces (ILead, IActiveProject…)  │  Canonical domain shapes
└──────────┬───────────────────────────────────────┘
           │ must conform to
┌──────────▼───────────────────────────────────────┐
│ Zod Contract Schemas (@hbc/models/api-schemas/)  │  Runtime validation layer
│ - LeadSchema, ActiveProjectSchema, etc.          │
│ - Validates transport payloads at runtime         │
│ - z.infer types are DERIVED, not canonical        │
└────────┬────────────────────┬────────────────────┘
         │                    │
    ┌────▼────────┐    ┌──────▼───────┐
    │ Backend     │    │ Frontend      │
    │ Validation  │    │ Adapter Tests │
    │ Middleware  │    │ (MSW + Zod)   │
    └─────────────┘    └───────────────┘
```

### Packages Involved

| Package | Role | P1 Task | Status |
|---------|------|---------|--------|
| `@hbc/models` | Zod schemas + types in `src/api-schemas/` | P1-E1 Task 1 | **TARGET** — new submodule |
| `@hbc/data-access` | Proxy adapter + frontend tests | P1-B1 + P1-E1 Task 4–5 | **BLOCKED** — adapter built in B1; tests here |
| `backend/functions` | Azure Functions + routes | P1-C1 + P1-E1 Task 6–9 | **BLOCKED** — routes built in C1; tests here |

### Architectural Invariants Protected

- Package dependency direction: `data-access` → `models`, `backend/functions` → `models` (+ type-only `devDependency` on `data-access` for test port interfaces — see [Dependency Boundary Decision](#dependency-boundary-decision))
- Reusable Zod schemas in `@hbc/models/src/api-schemas/` (not duplicated)
- Frontend and backend both validate against same schemas (not divergent validators)
- No runtime `data-access` ↔ `backend/functions` coupling (type-only `devDependencies` for port interfaces in test code is permitted — see [Dependency Boundary Decision](#dependency-boundary-decision))
- MSW handlers in frontend tests only (backend uses direct function calls)
- `@hbc/models/src/contracts/` remains the Contracts business domain — E1 does not touch it

### Dependency Boundary Decision

**Decision:** `backend/functions` may add `@hbc/data-access` as a **`devDependencies`-only, type-only** import for repository port interfaces. This is required for route contract tests (Task 6) to type-check their mock service factory against the canonical port interfaces.

**What is allowed:**
- `@hbc/data-access` in `backend/functions/package.json` `devDependencies` (not `dependencies`)
- `import type { ILeadRepository } from '@hbc/data-access/ports'` in test files and test utilities
- The `@hbc/data-access` `./ports` export path exposes only TypeScript interfaces with no runtime code

**What is NOT allowed:**
- `@hbc/data-access` in `backend/functions/package.json` `dependencies` (no runtime coupling)
- Runtime imports (`import { ... }`) from `@hbc/data-access` in production backend code
- Backend production code depending on adapter implementations, mock adapters, or any non-type export from `@hbc/data-access`

**Why this is safe:** The port interfaces (`ILeadRepository`, `IProjectRepository`, `IEstimatingRepository`, etc.) use only `import type` from `@hbc/models` — they contain zero runtime code. A `devDependencies` type-only import is erased at compile time and does not appear in the backend's production bundle. The architectural invariant "no runtime coupling between backend and data-access" is preserved.

**C1 prerequisite:** C1 must add `@hbc/data-access` to `backend/functions/package.json` `devDependencies` before Task 6 contract test imports resolve.

### Transport Shape vs Domain Interface Distinction

E1 contract schemas validate the **transport shape** — the HTTP envelope wrapping domain payloads. C1 governs transport shapes; domain interfaces in `@hbc/models` define the payload field shapes.

**Two distinct layers:**

| Layer | Governed by | Defines | Example |
|---|---|---|---|
| **Transport shape** | C1 (Backend Catalog) | HTTP envelope, status codes, field naming, pagination defaults | `{ items: ILead[], total, page, pageSize }` |
| **Domain interface** | `@hbc/models` interfaces | Entity field names, types, enums | `ILead { id: number, title, stage, clientName, estimatedValue, createdAt, updatedAt }` |

**Key implications for E1:**
- `IPagedResult<T>` uses `items: T[]` (**CURRENT**). If C1 defines a different transport shape field name (e.g., `data`), contract schemas adapt to the transport shape, not the domain interface.
- E1 does NOT invent transport shapes — it codifies shapes defined by C1 and verified against domain interfaces in `@hbc/models`.
- Previously open C1 transport-layer decisions — all now **RESOLVED**:
  - **D3** — Error envelope field naming: **`message`** (locked)
  - **D4** — Pagination default page size: **25** (locked)
  - **D5** — Update method: **PUT-only** in Phase 1 (locked)

### Type Source-of-Truth Rule

**Canonical:** `@hbc/models` TypeScript interfaces (`ILead`, `IActiveProject`, `IEstimatingTracker`, etc.) are the canonical source of truth for domain entity field names and types. These interfaces are owned by the models package and consumed across the workspace.

**Derived:** `z.infer<typeof Schema>` types in `api-schemas/` are derived convenience types for use within contract test code. They are NOT canonical replacements for the domain interfaces.

**How drift is detected:** Each contract schema file must include a compile-time assignability check that verifies the Zod-inferred type is structurally compatible with the canonical interface:

```typescript
import type { ILead } from '@hbc/models';

// Compile-time conformance check — fails if LeadSchema drifts from ILead
type _LeadConformance = ILead extends Lead ? Lead extends ILead ? true : never : never;
```

If this check produces a `never` type error, the schema has drifted from the canonical interface and must be corrected.

**What an implementer must NOT do:**
- Do not treat `z.infer<typeof Schema>` as a replacement for the domain interface in production code
- Do not import `Lead` (the Zod-inferred type) where `ILead` (the canonical interface) should be used
- Do not add fields to a Zod schema that don't exist in the corresponding `@hbc/models` interface
- Do not assume `z.infer` validates conformance — it only derives a type from the schema definition

### Compile-Time Conformance Policy

Schema-to-interface drift **must fail at compile time**, not just at test runtime.

1. **Every Zod schema file** must include a bidirectional assignability check against the canonical `@hbc/models` interface (see examples in Task 1 schema files).
2. **Compile-time checks are mandatory; runtime parse tests are additive.** A schema that passes `z.safeParse()` tests but fails the assignability check is non-conformant and must be corrected.
3. **`pnpm --filter @hbc/models check-types`** is the minimum verification — it must pass before any schema is considered valid.
4. Runtime parse/reject tests (Task 1 tests) provide defense-in-depth for edge cases the type system cannot catch (e.g., string format constraints, numeric ranges). They do not replace compile-time conformance.

### Key Assumptions

1. **Zod is the contract language** — TypeScript types alone are insufficient; runtime validation ensures both sides agree on shape
2. **MSW v2 is stable** — using `msw/node` for both Node.js test environments
3. **11 domain types exist** — Lead, Project, Estimating, + 8 others with port interfaces already defined in `@hbc/models` and `@hbc/data-access/src/ports/`
4. **Azure Functions v4 TypeScript** — backend uses modern async/await patterns, not legacy function bindings
5. **Vitest is the test runner** — both packages use Vitest; tests run via `pnpm test`
6. **No Pact or external contract framework** — pure Vitest with Zod schema assertions
7. **Schemas are tiered by C1 contract confidence** — only confirmed routes get full schemas; routes awaiting C1 handler delivery get skeleton schemas; uncataloged routes get no schemas

### Example Code Fidelity Rules

All code examples in this plan must mirror the current repo interfaces and locked transport conventions:

1. **Method names must match the port interface** — `ILeadRepository.getAll()`, `IProjectRepository.getProjects()`, `IEstimatingRepository.getAllTrackers()`, etc. Do not use generic CRUD aliases unless the port itself uses them.
2. **Return types must match the port signature** — if the port returns `Promise<void>`, the test must not expect a boolean; if the port throws on not-found, the test must not expect null.
3. **Field names and ID types must match `@hbc/models`** — Lead IDs are `number`, Project IDs are `string` (UUID), Estimating tracker IDs are `number`.
4. **D3–D6 and single-item envelope shape are resolved.** No PROVISIONAL markers are needed for these transport decisions. PROVISIONAL markers remain only for Tier 3 (auth) and any future unresolved decisions.
5. **BLOCKED examples must be labeled as representative** — code for tasks blocked on B1/C1/C2 is implementation guidance, not immediately executable.

---

## Chunk 1: Contract Schema Foundation

### Contract-Confidence Tiering

E1 does not treat all 11 domains equally. Schemas are tiered by C1 contract confidence:

| Tier | Domains | C1 Status | E1 Treatment |
|---|---|---|---|
| **Tier 1 — CONFIRMED** | Lead, Project (CRUD), Estimating (tracker CRUD) | Domain target groups and transport details all confirmed | Full Zod schemas + full test code + MSW fixtures |
| **Tier 2 — CONFIRMED routes** | Schedule, Buyout, Compliance, Contract, Risk, Scorecard, PMP; Project (aggregate), Estimating (kickoff) | D1/D2/D6/A8 resolved; route paths locked | Domain-accurate schema skeletons with confirmed route paths; no full test code until C1 delivers handlers |
| **Tier 3 — NOT CATALOGED** | Auth | A9 partial — `/api/auth/me` confirmed as smoke utility; full routes deferred to C2 | Capability-lane description only; no schema until C2 publishes full routes |

**What "CONFIRMED" means:** The domain group, CRUD method families, base route paths (`/api/leads`, `/api/projects`, `/api/estimating/trackers`, `/api/estimating/kickoffs`), and all transport-layer details are stable. Error envelope uses `message` (D3), page size defaults to 25 (D4), Phase 1 is PUT-only (D5), project-scoped domains use nested paths (D6), single-item responses use `{ data: T }` wrapper, and delete returns 204. Zod schemas should be written against current `@hbc/models` interfaces with no PROVISIONAL markers on transport conventions.

### Task 1: Create Domain Zod Schemas in `@hbc/models`

**Status:** **TARGET** — implementable after Zod setup (Task 2)

**Objective:** Define contract schemas for the 3 Tier 1 domains (Lead, Project, Estimating) with full precision, plus skeleton schemas for Tier 2 domains, matching the actual `@hbc/models` interfaces. Auth (Tier 3) gets no schema.

**Files to Create:**
- `packages/models/src/api-schemas/shared-schema.ts` — Error envelope, Paged result wrapper, pagination query
- `packages/models/src/api-schemas/lead-schema.ts` — Lead domain (Tier 1)
- `packages/models/src/api-schemas/project-schema.ts` — Project domain (Tier 1 CRUD + Tier 2 aggregate)
- `packages/models/src/api-schemas/estimating-schema.ts` — Estimating domain (Tier 1 tracker + Tier 2 kickoff)
- `packages/models/src/api-schemas/schedule-schema.ts` — Schedule domain (Tier 2)
- `packages/models/src/api-schemas/buyout-schema.ts` — Buyout domain (Tier 2)
- `packages/models/src/api-schemas/compliance-schema.ts` — Compliance domain (Tier 2)
- `packages/models/src/api-schemas/contract-schema.ts` — Contract domain (Tier 2)
- `packages/models/src/api-schemas/risk-schema.ts` — Risk domain (Tier 2)
- `packages/models/src/api-schemas/scorecard-schema.ts` — Scorecard domain (Tier 2)
- `packages/models/src/api-schemas/pmp-schema.ts` — PMP domain (Tier 2)
- `packages/models/src/api-schemas/index.ts` — Barrel export (no auth-schema)
- `packages/models/src/index.ts` — Update to export api-schemas

**Files to Modify:**
- `packages/models/package.json` — Add zod dependency

**Implementation Detail:** Each schema must conform to the canonical TypeScript interface in `packages/models/src/{domain}/`. Add a compile-time assignability check (see [Type Source-of-Truth Rule](#type-source-of-truth-rule)) to detect drift. The `z.infer<typeof Schema>` convenience type is derived, not canonical — production code must use the `@hbc/models` interface (e.g., `ILead`), not the inferred type (e.g., `Lead`). Schemas validate transport-layer payloads that carry domain data — field names and types must match `@hbc/models` exactly.

**Full Code Examples:**

**File: `packages/models/src/api-schemas/shared-schema.ts`**

```typescript
import { z } from 'zod';

/**
 * Standard error response envelope used across all error paths.
 *
 * D3 RESOLVED: Field is `message` (not `error`).
 * D18 RESOLVED: `requestId` is included in both the response header and the error body.
 */
export const ErrorEnvelopeSchema = z.object({
  message: z.string().describe('Human-readable error message'),
  code: z.string().describe('Machine-readable error code (e.g., NOT_FOUND, VALIDATION_ERROR)'),
  requestId: z.string().optional().describe('Unique request ID for tracing (also in response header)'),
  details: z.array(
    z.object({
      field: z.string().optional(),
      message: z.string(),
    })
  ).optional().describe('Field-level validation errors'),
});

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

/**
 * Generic paged result wrapper.
 * Matches IPagedResult<T> from @hbc/models/shared which uses `items: T[]`.
 *
 * D4 RESOLVED: Default page size is 25 (confirmed).
 */
export const createPagedSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema).describe('Items for the current page'),
    total: z.number().int().nonnegative().describe('Total count across all pages'),
    page: z.number().int().positive().describe('1-indexed page number'),
    pageSize: z.number().int().positive().describe('Number of items per page'),
  });

/**
 * Standard pagination query parameters.
 *
 * D4 RESOLVED: pageSize default is 25 (confirmed).
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(25).max(100),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

/**
 * LOCKED: Single-item responses (GET /:id, POST, PUT) use `{ data: T }` wrapper.
 * See "Locked Response-Envelope Convention" section for full details.
 */
export const createSuccessEnvelopeSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: itemSchema.describe('Single-item response payload'),
  });
```

#### Locked Response-Envelope Convention

All E1 code examples use the following transport shape conventions. These are the single source of truth for response shapes across Tasks 3, 4, 5, 6, 7, and 8. All conventions are now **LOCKED**.

| Response Type | Example Route | Convention | Status | Schema Validation |
|---|---|---|---|---|
| **Collection** | `GET /api/leads` | `{ items: T[], total, page, pageSize }` | **CONFIRMED** — matches `IPagedResult<T>` | `createPagedSchema(LeadSchema)` |
| **Search** | `GET /api/leads/search?q=` | Same as collection: `{ items: T[], total, page, pageSize }` | **CONFIRMED** — same shape as getAll | `createPagedSchema(LeadSchema)` |
| **Single-item** | `GET /api/leads/:id`, `POST /api/leads`, `PUT /api/leads/:id` | **`{ data: T }`** wrapper | **CONFIRMED** (decision 1) | `createSuccessEnvelopeSchema(LeadSchema)` on `body` |
| **Delete** | `DELETE /api/leads/:id` | `204 No Content` — empty body | **CONFIRMED** (decision 16) | No schema validation needed |
| **Error** | Any 4xx/5xx | `{ message, code, requestId?, details? }` | **CONFIRMED** (decision 2: `message` not `error`) | `ErrorEnvelopeSchema` |

**File: `packages/models/src/api-schemas/lead-schema.ts`** (Tier 1 — CONFIRMED)

```typescript
import { z } from 'zod';
import { PaginationQuerySchema } from './shared-schema';

/**
 * Lead domain contract schema — Tier 1 (CONFIRMED).
 * Matches ILead from @hbc/models/leads (packages/models/src/leads/ILead.ts).
 *
 * Lead is a numeric-ID CRUD + search domain.
 * Port: ILeadRepository (getAll, getById, create, update, delete, search)
 */

/** LeadStage enum values — matches LeadStage from @hbc/models/leads */
export const LeadStageValues = [
  'Identified', 'Qualifying', 'BidDecision', 'Bidding', 'Awarded', 'Lost', 'Declined',
] as const;

export const LeadSchema = z.object({
  id: z.number().int().positive().describe('Unique lead identifier'),
  title: z.string().min(1).describe('Descriptive title for the lead / opportunity'),
  stage: z.enum(LeadStageValues).describe('Current pipeline stage (LeadStage enum)'),
  clientName: z.string().min(1).describe('Name of the prospective client'),
  estimatedValue: z.number().nonnegative().describe('Estimated contract value in USD'),
  createdAt: z.string().datetime().describe('ISO-8601 creation timestamp'),
  updatedAt: z.string().datetime().describe('ISO-8601 last-updated timestamp'),
});

export type Lead = z.infer<typeof LeadSchema>;

// Compile-time conformance — fails if schema drifts from canonical interface
import type { ILead } from '@hbc/models';
type _LeadConformance = ILead extends Lead ? Lead extends ILead ? true : never : never;

/**
 * Create Lead request — matches ILeadFormData from @hbc/models/leads.
 * Omits server-generated fields (id, createdAt, updatedAt).
 */
export const CreateLeadRequestSchema = z.object({
  title: z.string().min(1),
  stage: z.enum(LeadStageValues),
  clientName: z.string().min(1),
  estimatedValue: z.number().nonnegative(),
});

export type CreateLeadRequest = z.infer<typeof CreateLeadRequestSchema>;

/** Update Lead — all fields optional. */
export const UpdateLeadRequestSchema = CreateLeadRequestSchema.partial();

export type UpdateLeadRequest = z.infer<typeof UpdateLeadRequestSchema>;

/**
 * Lead search query — extends pagination with free-text query.
 * Used by ILeadRepository.search(query, options).
 * Search matches against title and clientName.
 */
export const LeadSearchQuerySchema = PaginationQuerySchema.extend({
  q: z.string().min(1).describe('Free-text search against title and clientName'),
});

export type LeadSearchQuery = z.infer<typeof LeadSearchQuerySchema>;
```

**File: `packages/models/src/api-schemas/project-schema.ts`** (Tier 1 CRUD + Tier 2 aggregate)

```typescript
import { z } from 'zod';

/**
 * Project domain contract schema — Tier 1 (CONFIRMED) for CRUD operations.
 * Matches IActiveProject from @hbc/models/project (packages/models/src/project/IProject.ts).
 *
 * Project uses string (UUID) IDs. CRUD + getPortfolioSummary aggregate.
 * Port: IProjectRepository (getProjects, getProjectById, createProject, updateProject, deleteProject, getPortfolioSummary)
 */
export const ActiveProjectSchema = z.object({
  id: z.string().uuid().describe('Unique project identifier (UUID)'),
  name: z.string().min(1).describe('Project display name'),
  number: z.string().min(1).describe('Project number / code (e.g. "PRJ-A1B2C3")'),
  status: z.string().describe('Current project status (ProjectStatus enum)'),
  startDate: z.string().datetime().describe('ISO-8601 project start date'),
  endDate: z.string().datetime().describe('ISO-8601 project end date'),
});

export type ActiveProject = z.infer<typeof ActiveProjectSchema>;

// Compile-time conformance — fails if schema drifts from canonical interface
import type { IActiveProject } from '@hbc/models';
type _ProjectConformance = IActiveProject extends ActiveProject ? ActiveProject extends IActiveProject ? true : never : never;

/** Create Project request — omits server-generated id. */
export const CreateProjectRequestSchema = ActiveProjectSchema.omit({ id: true });

export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;

/** Update Project — all fields optional. */
export const UpdateProjectRequestSchema = CreateProjectRequestSchema.partial();

export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestSchema>;

/**
 * Portfolio summary aggregate — Tier 2, route CONFIRMED (A8 resolved).
 * Matches IPortfolioSummary from @hbc/models/project.
 * Route: /api/projects/summary (A8: confirmed).
 */
export const PortfolioSummarySchema = z.object({
  totalProjects: z.number().int().nonnegative(),
  activeProjects: z.number().int().nonnegative(),
  totalContractValue: z.number().nonnegative(),
  averagePercentComplete: z.number().min(0).max(100),
});

export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
```

**File: `packages/models/src/api-schemas/estimating-schema.ts`** (Tier 1 tracker + Tier 2 kickoff)

```typescript
import { z } from 'zod';

/**
 * Estimating Tracker contract schema — Tier 1 (CONFIRMED) for tracker CRUD.
 * Matches IEstimatingTracker from @hbc/models/estimating (packages/models/src/estimating/IEstimating.ts).
 *
 * Estimating is a bid-tracking domain with numeric IDs.
 * Port: IEstimatingRepository (getAllTrackers, getTrackerById, createTracker, updateTracker, deleteTracker, getKickoff, createKickoff)
 */
export const EstimatingTrackerSchema = z.object({
  id: z.number().int().positive().describe('Unique tracker identifier'),
  projectId: z.string().describe('Associated project identifier'),
  bidNumber: z.string().min(1).describe('Bid / proposal number'),
  status: z.string().describe('Current status of the estimate (EstimatingStatus enum)'),
  dueDate: z.string().datetime().describe('ISO-8601 due date for the estimate'),
  createdAt: z.string().datetime().describe('ISO-8601 creation timestamp'),
  updatedAt: z.string().datetime().describe('ISO-8601 last-updated timestamp'),
});

export type EstimatingTracker = z.infer<typeof EstimatingTrackerSchema>;

// Compile-time conformance — fails if schema drifts from canonical interface
import type { IEstimatingTracker } from '@hbc/models';
type _TrackerConformance = IEstimatingTracker extends EstimatingTracker ? EstimatingTracker extends IEstimatingTracker ? true : never : never;

/** Create Tracker request — matches IEstimatingTrackerFormData. Omits id, createdAt, updatedAt. */
export const CreateTrackerRequestSchema = EstimatingTrackerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateTrackerRequest = z.infer<typeof CreateTrackerRequestSchema>;

/** Update Tracker — all fields optional. */
export const UpdateTrackerRequestSchema = CreateTrackerRequestSchema.partial();

export type UpdateTrackerRequest = z.infer<typeof UpdateTrackerRequestSchema>;

/**
 * Estimating Kickoff schema — Tier 2, route CONFIRMED (D2 resolved).
 * Matches IEstimatingKickoff from @hbc/models/estimating.
 * Route: /api/estimating/kickoffs (D2: confirmed sub-resource routing).
 */
export const EstimatingKickoffSchema = z.object({
  id: z.number().int().positive().describe('Unique kickoff identifier'),
  projectId: z.string().describe('Associated project identifier'),
  kickoffDate: z.string().datetime().describe('ISO-8601 kickoff meeting date'),
  attendees: z.array(z.string()).describe('List of attendee names'),
  notes: z.string().describe('Meeting notes / action items'),
  createdAt: z.string().datetime().describe('ISO-8601 creation timestamp'),
});

export type EstimatingKickoff = z.infer<typeof EstimatingKickoffSchema>;
```

#### Tier 2 Domain Schemas — CONFIRMED (D1, D6 resolved)

The following 7 project-scoped domains have frozen `@hbc/models` interfaces and **confirmed route conventions**:
- **D1 (resolved):** All Tier 2 base routes use **plural** form.
- **D6 (resolved):** Project-scoped domains use **nested** paths: `/api/projects/{projectId}/{domain}`.
- **A8 (resolved):** Project aggregate endpoint is `/api/projects/summary`.

Schema fields match `@hbc/models` exactly. Route paths follow the locked conventions above.

No full test code is provided for Tier 2 schemas. Skeleton tests should validate basic parse/reject behavior only.

**File: `packages/models/src/api-schemas/schedule-schema.ts`** — CONFIRMED (D1: plural, D6: nested `/api/projects/{projectId}/schedules`)

```typescript
import { z } from 'zod';

/**
 * Schedule Activity — matches IScheduleActivity from @hbc/models/schedule.
 * Port: IScheduleRepository (getActivities, getActivityById, createActivity, updateActivity, deleteActivity, getMetrics)
 * Route: /api/projects/{projectId}/schedules (D1: plural, D6: nested)
 * ID: numeric. Scoped by projectId.
 */
export const ScheduleActivitySchema = z.object({
  id: z.number().int().positive(),
  projectId: z.string(),
  name: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  percentComplete: z.number().min(0).max(100),
  isCriticalPath: z.boolean(),
});

/** Schedule Metrics aggregate — matches IScheduleMetrics from @hbc/models/schedule. */
export const ScheduleMetricsSchema = z.object({
  projectId: z.string(),
  totalActivities: z.number().int().nonnegative(),
  completedActivities: z.number().int().nonnegative(),
  criticalPathVariance: z.number().describe('Days variance — negative means behind schedule'),
  overallPercentComplete: z.number().min(0).max(100),
});
```

**File: `packages/models/src/api-schemas/buyout-schema.ts`** — CONFIRMED (D1: plural, D6: nested `/api/projects/{projectId}/buyouts`)

```typescript
import { z } from 'zod';

/**
 * Buyout Entry — matches IBuyoutEntry from @hbc/models/buyout.
 * Port: IBuyoutRepository (getEntries, getEntryById, createEntry, updateEntry, deleteEntry, getSummary)
 * Route: /api/projects/{projectId}/buyouts (D1: plural, D6: nested)
 * ID: numeric. Scoped by projectId.
 */
export const BuyoutEntrySchema = z.object({
  id: z.number().int().positive(),
  projectId: z.string(),
  description: z.string(),
  amount: z.number(),
  status: z.string(),
});

/** Buyout Summary aggregate — matches IBuyoutSummary from @hbc/models/buyout. */
export const BuyoutSummarySchema = z.object({
  totalBuyout: z.number(),
  committedAmount: z.number(),
  uncommittedAmount: z.number(),
  projectId: z.string(),
});
```

**File: `packages/models/src/api-schemas/compliance-schema.ts`** — CONFIRMED (D1: plural, D6: nested `/api/projects/{projectId}/compliance`)

```typescript
import { z } from 'zod';

/**
 * Compliance Entry — matches IComplianceEntry from @hbc/models/compliance.
 * Port: IComplianceRepository (getEntries, getEntryById, createEntry, updateEntry, deleteEntry, getSummary)
 * Route: /api/projects/{projectId}/compliance (D1: plural, D6: nested)
 * ID: numeric. Scoped by projectId.
 */
export const ComplianceEntrySchema = z.object({
  id: z.number().int().positive(),
  projectId: z.string(),
  vendorId: z.string(),
  requirement: z.string(),
  status: z.string(),
  expiryDate: z.string().datetime().optional(),
});

/** Compliance Summary aggregate — matches IComplianceSummary from @hbc/models/compliance. */
export const ComplianceSummarySchema = z.object({
  totalVendors: z.number().int().nonnegative(),
  compliant: z.number().int().nonnegative(),
  atRisk: z.number().int().nonnegative(),
  projectId: z.string(),
});
```

**File: `packages/models/src/api-schemas/contract-schema.ts`** — CONFIRMED (D1: plural, D6: nested `/api/projects/{projectId}/contracts`)

```typescript
import { z } from 'zod';

/**
 * Contract Info — matches IContractInfo from @hbc/models/contracts (Contracts business domain).
 * Port: IContractRepository (getContracts, getContractById, createContract, updateContract, deleteContract, getApprovals, createApproval)
 * Route: /api/projects/{projectId}/contracts (D1: plural, D6: nested)
 * ID: numeric. Scoped by projectId. Has child entity: CommitmentApproval.
 */
export const ContractInfoSchema = z.object({
  id: z.number().int().positive(),
  projectId: z.string(),
  contractNumber: z.string(),
  vendorName: z.string(),
  amount: z.number(),
  status: z.string().describe('ContractStatus enum value'),
  executedDate: z.string().describe('ISO-8601 date'),
});

/** Commitment Approval child entity — matches ICommitmentApproval from @hbc/models/contracts. */
export const CommitmentApprovalSchema = z.object({
  id: z.number().int().positive(),
  contractId: z.number().int().positive(),
  approverName: z.string(),
  approvedAt: z.string().describe('ISO-8601 timestamp'),
  status: z.string().describe('ApprovalStatus enum value'),
  notes: z.string(),
});
```

**File: `packages/models/src/api-schemas/risk-schema.ts`** — CONFIRMED (D1: plural, D6: nested `/api/projects/{projectId}/risks`)

```typescript
import { z } from 'zod';

/**
 * Risk Cost Item — matches IRiskCostItem from @hbc/models/risk.
 * Port: IRiskRepository (getItems, getItemById, createItem, updateItem, deleteItem, getManagement)
 * Route: /api/projects/{projectId}/risks (D1: plural, D6: nested)
 * ID: numeric. Scoped by projectId.
 */
export const RiskCostItemSchema = z.object({
  id: z.number().int().positive(),
  projectId: z.string(),
  description: z.string(),
  category: z.string().describe('RiskCategory enum value'),
  probability: z.number().min(0).max(1),
  impact: z.number().min(0).max(1),
  riskValue: z.number().nonnegative().describe('probability × impact'),
  status: z.string().describe('RiskStatus enum value'),
});

/** Risk Cost Management aggregate — matches IRiskCostManagement from @hbc/models/risk. */
export const RiskCostManagementSchema = z.object({
  projectId: z.string(),
  totalRiskValue: z.number(),
  highRiskCount: z.number().int().nonnegative(),
});
```

**File: `packages/models/src/api-schemas/scorecard-schema.ts`** — CONFIRMED (D1: plural, D6: nested `/api/projects/{projectId}/scorecards`)

```typescript
import { z } from 'zod';

/**
 * Go/No-Go Scorecard — matches IGoNoGoScorecard from @hbc/models/scorecard.
 * Port: IScorecardRepository (getScorecards, getScorecardById, createScorecard, updateScorecard, deleteScorecard, getVersions)
 * Route: /api/projects/{projectId}/scorecards (D1: plural, D6: nested)
 * ID: numeric. Scoped by projectId. Has child entity: ScorecardVersion.
 */
export const GoNoGoScorecardSchema = z.object({
  id: z.number().int().positive(),
  projectId: z.string(),
  evaluationDate: z.string().datetime(),
  recommendation: z.string().describe('ScorecardRecommendation enum value'),
  score: z.number(),
  rationale: z.string(),
});

/** Scorecard Version child entity — matches IScorecardVersion from @hbc/models/scorecard. */
export const ScorecardVersionSchema = z.object({
  id: z.number().int().positive(),
  scorecardId: z.number().int().positive(),
  versionNumber: z.number().int().positive(),
  createdAt: z.string().datetime(),
  createdBy: z.string(),
});
```

**File: `packages/models/src/api-schemas/pmp-schema.ts`** — CONFIRMED (D1: plural, D6: nested `/api/projects/{projectId}/pmps`)

```typescript
import { z } from 'zod';

/**
 * Project Management Plan — matches IProjectManagementPlan from @hbc/models/pmp.
 * Port: IPmpRepository (getPlans, getPlanById, createPlan, updatePlan, deletePlan, getSignatures, createSignature)
 * Route: /api/projects/{projectId}/pmps (D1: plural, D6: nested)
 * ID: numeric. Scoped by projectId. Has child entity: PMPSignature.
 */
export const ProjectManagementPlanSchema = z.object({
  id: z.number().int().positive(),
  projectId: z.string(),
  documentName: z.string(),
  status: z.string().describe('PmpStatus enum value'),
  createdAt: z.string().datetime(),
});

/** PMP Signature child entity — matches IPMPSignature from @hbc/models/pmp. */
export const PMPSignatureSchema = z.object({
  id: z.number().int().positive(),
  pmpId: z.number().int().positive(),
  signerName: z.string(),
  signedAt: z.string().datetime().optional(),
  status: z.string().describe('SignatureStatus enum value'),
});
```

#### Tier 3 — Auth (NOT CATALOGED, A9)

Auth is **not a data-domain with CRUD**. It is a read-heavy capability lane with role assignment as the only write operation. Auth routes are not cataloged in C1 — they are deferred to C2 (Auth Hardening).

**No Zod schema or contract test code until C2 publishes auth routes.** Exception: `/api/auth/me` may be used in smoke tests as a token-validation utility (decision 12). This is an operational probe, not a business API contract lane — no `auth-schema.ts`, no contract tests, no MSW handlers for auth.

**Auth capability groups (reference only):**

| Group | Port Method | Model Interface | Route | Status |
|---|---|---|---|---|
| Current User | `getCurrentUser()` | `ICurrentUser` | `GET /api/auth/me` | **CONFIRMED** (decision 12: smoke utility) |
| Roles | `getRoles()`, `getRoleById(id)` | `IRole` | `GET /api/auth/roles`, `GET /api/auth/roles/:id` | Deferred to C2 |
| Permission Templates | `getPermissionTemplates()` | `IPermissionTemplate` | `GET /api/auth/permissions/templates` | Deferred to C2 |
| Role Assignment | `assignRole(userId, roleId)`, `removeRole(userId, roleId)` | void return | `POST/DELETE /api/auth/users/:userId/roles/:roleId` | Deferred to C2 |

**Model interfaces** (from `@hbc/models/auth`):
- `ICurrentUser` — `{ id: string, displayName: string, email: string, roles: IRole[] }`
- `IRole` — `{ id: string, name: string, permissions: string[] }`
- `IPermissionTemplate` — `{ id: string, name: string, description: string, permissions: string[] }`

**Decision 12 (partial A9):** `/api/auth/me` is confirmed as a smoke utility endpoint for validating token acceptance. Full auth route schemas remain deferred until C2 publishes the complete auth route catalog. When C2 delivers, create `packages/models/src/api-schemas/auth-schema.ts` with schemas matching these interfaces. Until then, no auth schema file exists — but smoke tests may use `/api/auth/me` to verify token validity.

**File: `packages/models/src/api-schemas/index.ts`**

```typescript
/**
 * API contract schemas for domain types.
 * Shared between frontend (@hbc/data-access) and backend (backend/functions).
 * Used by validation middleware and adapter tests.
 *
 * Each schema is a Zod validator that ensures runtime shape agreement.
 * Use z.safeParse(data) to validate transport payloads. Inferred types (z.infer)
 * are convenience aliases — canonical domain types are the interfaces in
 * @hbc/models (ILead, IActiveProject, etc.).
 *
 * NOTE: This directory is for Zod API contract schemas.
 * The Contracts business domain models live in src/contracts/ — do not conflate the two.
 *
 * Tier 1 (CONFIRMED): shared, lead, project (CRUD), estimating (tracker)
 * Tier 2 (CONFIRMED routes): schedule, buyout, compliance, contract, risk, scorecard, pmp,
 *   plus project (aggregate) and estimating (kickoff) — D1/D2/D6/A8 resolved
 * Tier 3 (NOT CATALOGED): auth — NO export until C2 publishes routes (A9 partial)
 */

// Tier 1 — CONFIRMED
export * from './shared-schema';
export * from './lead-schema';
export * from './project-schema';
export * from './estimating-schema';

// Tier 2 — CONFIRMED routes (D1: plural, D6: nested, D2: estimating sub-resources, A8: /api/projects/summary)
export * from './schedule-schema';
export * from './buyout-schema';
export * from './compliance-schema';
export * from './contract-schema';
export * from './risk-schema';
export * from './scorecard-schema';
export * from './pmp-schema';

// Tier 3 — Auth: no export. See auth capability-lane description in plan.
```

**File: `packages/models/src/index.ts`** (Update)

```typescript
// Existing exports...

/**
 * API contract schemas for shape validation.
 * Used by backend validation middleware and frontend adapter tests.
 */
export * as apiSchemas from './api-schemas';
```

**Task 1 Tests:**

**File: `packages/models/src/api-schemas/shared-schema.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ErrorEnvelopeSchema, createPagedSchema } from './shared-schema';

describe('ErrorEnvelopeSchema', () => {
  it('valid error envelope passes validation', () => {
    const validError = {
      message: 'Lead not found',
      code: 'NOT_FOUND',
    };
    const result = ErrorEnvelopeSchema.safeParse(validError);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe('NOT_FOUND');
    }
  });

  it('error envelope with requestId and details passes validation', () => {
    const withDetails = {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      requestId: 'req-12345',
      details: [
        { field: 'title', message: 'Title is required' },
      ],
    };
    const result = ErrorEnvelopeSchema.safeParse(withDetails);
    expect(result.success).toBe(true);
  });

  it('missing message fails validation', () => {
    const invalid = { code: 'NOT_FOUND' };
    const result = ErrorEnvelopeSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ['message'] })
      );
    }
  });

  it('missing code fails validation', () => {
    const invalid = { message: 'Something went wrong' };
    const result = ErrorEnvelopeSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('createPagedSchema', () => {
  it('valid paged result passes validation', () => {
    const PagedStringSchema = createPagedSchema(z.string());

    const validPaged = {
      items: ['item1', 'item2'],
      total: 2,
      page: 1,
      pageSize: 25,
    };
    const result = PagedStringSchema.safeParse(validPaged);
    expect(result.success).toBe(true);
  });

  it('page must be positive integer', () => {
    const PagedSchema = createPagedSchema(z.string());

    const invalidPage = {
      items: [],
      total: 0,
      page: 0,
      pageSize: 25,
    };
    const result = PagedSchema.safeParse(invalidPage);
    expect(result.success).toBe(false);
  });

  it('pageSize must be positive integer', () => {
    const PagedSchema = createPagedSchema(z.string());

    const invalidPageSize = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 0,
    };
    const result = PagedSchema.safeParse(invalidPageSize);
    expect(result.success).toBe(false);
  });

  it('total cannot be negative', () => {
    const PagedSchema = createPagedSchema(z.string());

    const negativeTotal = {
      items: [],
      total: -1,
      page: 1,
      pageSize: 25,
    };
    const result = PagedSchema.safeParse(negativeTotal);
    expect(result.success).toBe(false);
  });
});
```

**File: `packages/models/src/api-schemas/lead-schema.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { LeadSchema, CreateLeadRequestSchema, LeadSearchQuerySchema } from './lead-schema';
import { createPagedSchema } from './shared-schema';

describe('LeadSchema', () => {
  const validLead = {
    id: 1,
    title: 'Highway Bridge Replacement',
    stage: 'Qualifying' as const,
    clientName: 'ACME Construction',
    estimatedValue: 2500000,
    createdAt: '2026-03-16T10:00:00Z',
    updatedAt: '2026-03-16T10:00:00Z',
  };

  it('valid lead passes validation', () => {
    const result = LeadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Highway Bridge Replacement');
      expect(result.data.stage).toBe('Qualifying');
    }
  });

  it('id must be a positive integer (not uuid)', () => {
    const invalid = { ...validLead, id: 'not-a-number' };
    const result = LeadSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('zero id fails validation', () => {
    const invalid = { ...validLead, id: 0 };
    const result = LeadSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('missing title fails validation', () => {
    const { title, ...invalid } = validLead;
    const result = LeadSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ['title'] })
      );
    }
  });

  it('invalid stage fails validation', () => {
    const invalid = { ...validLead, stage: 'prospect' };
    const result = LeadSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('all LeadStage values are accepted', () => {
    const stages = ['Identified', 'Qualifying', 'BidDecision', 'Bidding', 'Awarded', 'Lost', 'Declined'];
    for (const stage of stages) {
      const result = LeadSchema.safeParse({ ...validLead, stage });
      expect(result.success).toBe(true);
    }
  });

  it('negative estimatedValue fails validation', () => {
    const invalid = { ...validLead, estimatedValue: -100 };
    const result = LeadSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('invalid datetime fails validation', () => {
    const invalid = { ...validLead, createdAt: 'not-a-datetime' };
    const result = LeadSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('Paged Leads (via createPagedSchema)', () => {
  const PagedLeadsSchema = createPagedSchema(LeadSchema);

  it('valid paged leads response passes validation', () => {
    const validPaged = {
      items: [
        {
          id: 1,
          title: 'Lead 1',
          stage: 'Identified' as const,
          clientName: 'Client A',
          estimatedValue: 500000,
          createdAt: '2026-03-16T10:00:00Z',
          updatedAt: '2026-03-16T10:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 25,
    };
    const result = PagedLeadsSchema.safeParse(validPaged);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.total).toBe(1);
      expect(result.data.items).toHaveLength(1);
    }
  });

  it('empty paged leads response passes validation', () => {
    const empty = { items: [], total: 0, page: 1, pageSize: 25 };
    const result = PagedLeadsSchema.safeParse(empty);
    expect(result.success).toBe(true);
  });
});

describe('CreateLeadRequestSchema', () => {
  it('valid create request passes validation', () => {
    const validRequest = {
      title: 'New Highway Project',
      stage: 'Identified' as const,
      clientName: 'State DOT',
      estimatedValue: 10000000,
    };
    const result = CreateLeadRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('missing required field fails validation', () => {
    const incomplete = {
      title: 'Incomplete Lead',
      stage: 'Identified' as const,
      // missing clientName and estimatedValue
    };
    const result = CreateLeadRequestSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });
});

describe('LeadSearchQuerySchema', () => {
  it('valid search query passes validation', () => {
    const query = { q: 'bridge', page: 1, pageSize: 25 };
    const result = LeadSearchQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
  });

  it('empty search string fails validation', () => {
    const query = { q: '', page: 1, pageSize: 25 };
    const result = LeadSearchQuerySchema.safeParse(query);
    expect(result.success).toBe(false);
  });
});
```

(Implement project-schema.test.ts and estimating-schema.test.ts following the same pattern, using `ActiveProjectSchema` with `id: 'uuid'`, `name`, `number`, `status`, `startDate`, `endDate` and `EstimatingTrackerSchema` with `id: 1`, `projectId`, `bidNumber`, `status`, `dueDate`, `createdAt`, `updatedAt` respectively.)

### Task 2: Add Zod Dependency to `@hbc/models`

**Status:** **TARGET** — prerequisite for Task 1

**Files to Modify:**
- `packages/models/package.json`

**Implementation:**

Add Zod to the `dependencies` section (not devDependencies, because schemas are used at runtime):

```json
{
  "dependencies": {
    "zod": "^3.22.0"
  }
}
```

**Verification** (see [Execution Sequence with Acceptance Criteria](#execution-sequence-with-acceptance-criteria) for prerequisites):

Run:
```bash
pnpm install
pnpm --filter @hbc/models test
```

Expected: All tests pass (green checkmark).

**Commit:** `feat: add Zod schemas for contract validation (P1-E1 Task 1–2)`

---

## Chunk 2: MSW Handler Setup and Adapter Contract Tests

### MSW Test Infrastructure Policy

All `@hbc/data-access` tests that intercept HTTP use a single shared MSW server instance. This prevents handler conflicts, ensures consistent error behavior, and keeps test setup DRY.

**Central server setup:**
- A single `packages/data-access/src/test-utils/msw-server.ts` exports the shared `server` instance.
- All test files import `{ server }` from `../../test-utils` — no inline `setupServer()` calls.

**Required lifecycle hooks (every test file that uses MSW):**

```typescript
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Why `onUnhandledRequest: 'error'`:** The existing PWA test setup uses `'warn'`, which logs but continues. Contract tests must use `'error'` because an unhandled request means a missing handler — that's a contract gap, not a warning. If a test makes a request that no handler covers, the test must fail immediately.

**Fixture and handler organization:**

| File | Purpose | Scope |
|---|---|---|
| `msw-fixtures.ts` | Domain fixture data conforming to Zod schemas | Tier 1 (CONFIRMED) domains only |
| `msw-handlers.ts` | HTTP handlers organized by domain (`leadsHandlers`, `projectsHandlers`, `estimatingHandlers`) | Tier 1 domains only |
| `msw-server.ts` | Server instance wired with `defaultHandlers` | Exports shared server |
| `index.ts` | Barrel export for all test utilities | Public API for test consumers |

**Boundary rule:** Tier 2 route conventions are now confirmed (D1/D2/D6/A8 resolved), but do NOT pre-build handler arrays for Tier 2 or Tier 3 domains until the actual route handlers exist in C1 and adapter classes exist in B1.

### Adapter Contract Test Readiness

| Test Category | Can Run Now? | Blocked On | Notes |
|---|---|---|---|
| MSW server setup + handler smoke tests | **Yes** — after vitest setup | Vitest config only | Independent of B1 |
| Schema validation (Task 1 tests) | **Yes** — after Zod + vitest setup | Zod dependency | Independent of B1 |
| Lead adapter contract tests | **No** | B1: `ProxyHttpClient` + `ProxyLeadRepository` | MSW intercepts HTTP; tests need real adapter code |
| Project adapter contract tests | **No** | B1: `ProxyHttpClient` + `ProxyProjectRepository` | Same pattern as Lead |
| Estimating adapter contract tests | **No** | B1: `ProxyHttpClient` + `ProxyEstimatingRepository` | Same pattern as Lead |
| Tier 2 domain adapter contract tests | **No** | B1 + C1 (D1/D6 route decisions) | Routes provisional; adapters not yet planned |
| Auth adapter contract tests | **No** | B1 + C2 (A9 route spec) | Auth routes not cataloged |

### Task 3: Create MSW Server Setup for `@hbc/data-access` Tests

**Status:** **TARGET** — implementable after vitest setup

**Objective:** Set up Mock Service Worker (MSW) to intercept HTTP requests in frontend tests. MSW handlers simulate backend responses; contract tests verify the adapter correctly parses those responses.

**Files to Create:**
- `packages/data-access/src/test-utils/msw-server.ts` — MSW server instance
- `packages/data-access/src/test-utils/msw-handlers.ts` — HTTP handler definitions
- `packages/data-access/src/test-utils/msw-fixtures.ts` — Sample data that conforms to Zod schemas
- `packages/data-access/src/test-utils/index.ts` — Barrel export

**Full Code:**

**File: `packages/data-access/src/test-utils/msw-fixtures.ts`**

```typescript
import type { Lead } from '@hbc/models/api-schemas';
import type { ActiveProject } from '@hbc/models/api-schemas';
import type { EstimatingTracker } from '@hbc/models/api-schemas';

/**
 * Fixture data for testing.
 * All fixtures conform to their respective Zod schemas and match @hbc/models interfaces.
 */

export const LEAD_FIXTURES: Lead[] = [
  {
    id: 1,
    title: 'Highway Bridge Replacement — I-95 Corridor',
    stage: 'Qualifying',
    clientName: 'ACME Construction',
    estimatedValue: 2500000,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-03-16T14:30:00Z',
  },
  {
    id: 2,
    title: 'Municipal Water Treatment Expansion',
    stage: 'Bidding',
    clientName: 'Riverside Utilities',
    estimatedValue: 8500000,
    createdAt: '2026-02-01T10:15:00Z',
    updatedAt: '2026-03-10T11:45:00Z',
  },
  {
    id: 3,
    title: 'Commercial Office Renovation',
    stage: 'Identified',
    clientName: 'Downtown Properties LLC',
    estimatedValue: 750000,
    createdAt: '2026-03-15T16:20:00Z',
    updatedAt: '2026-03-15T16:20:00Z',
  },
];

export const PROJECT_FIXTURES: ActiveProject[] = [
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    name: 'Highway Bridge Replacement',
    number: 'PRJ-HBR001',
    status: 'Active',
    startDate: '2026-02-01T00:00:00Z',
    endDate: '2026-12-31T00:00:00Z',
  },
];

export const ESTIMATING_FIXTURES: EstimatingTracker[] = [
  {
    id: 1,
    projectId: '660e8400-e29b-41d4-a716-446655440001',
    bidNumber: 'BID-2026-001',
    status: 'InProgress',
    dueDate: '2026-04-15T17:00:00Z',
    createdAt: '2026-02-05T09:00:00Z',
    updatedAt: '2026-03-16T09:00:00Z',
  },
];

/**
 * Helper to wrap items in a paged response.
 * Matches IPagedResult<T> shape: { items, total, page, pageSize }
 */
export function makePagedResponse<T>(
  allItems: T[],
  page: number,
  pageSize: number
): { items: T[]; total: number; page: number; pageSize: number } {
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  return {
    items: allItems.slice(startIdx, endIdx),
    total: allItems.length,
    page,
    pageSize,
  };
}
```

**File: `packages/data-access/src/test-utils/msw-handlers.ts`**

```typescript
import { http, HttpResponse } from 'msw';
import type { Lead } from '@hbc/models/api-schemas';
import { CreateLeadRequestSchema, CreateProjectRequestSchema, CreateTrackerRequestSchema } from '@hbc/models/api-schemas';
import { LEAD_FIXTURES, PROJECT_FIXTURES, ESTIMATING_FIXTURES, makePagedResponse } from './msw-fixtures';

const API_BASE = 'http://localhost:7071/api';

/**
 * MSW handlers for frontend tests.
 * Simulate backend Azure Functions responses.
 * All responses conform to Zod schemas and match @hbc/models interfaces.
 *
 * NOTE: Leads use numeric IDs. Projects use UUID string IDs. Estimating trackers use numeric IDs.
 */

let nextLeadId = 100;

export const leadsHandlers = [
  /** GET /api/leads — paged list */
  http.get(`${API_BASE}/leads`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 25);
    const paged = makePagedResponse(LEAD_FIXTURES, page, pageSize);
    return HttpResponse.json(paged, { status: 200 });
  }),

  /** GET /api/leads/search?q= — search leads by title/clientName */
  http.get(`${API_BASE}/leads/search`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') ?? '';
    if (!q) {
      return HttpResponse.json(
        { message: 'Search query is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 25);
    const filtered = LEAD_FIXTURES.filter(
      (l) => l.title.toLowerCase().includes(q.toLowerCase()) ||
             l.clientName.toLowerCase().includes(q.toLowerCase())
    );
    const paged = makePagedResponse(filtered, page, pageSize);
    return HttpResponse.json(paged, { status: 200 });
  }),

  /** GET /api/leads/:id — single lead (numeric ID) */
  http.get(`${API_BASE}/leads/:id`, ({ params }) => {
    const lead = LEAD_FIXTURES.find((l) => l.id === Number(params.id));
    if (!lead) {
      return HttpResponse.json(
        { message: 'Lead not found', code: 'NOT_FOUND', requestId: 'req-404-001' },
        { status: 404 }
      );
    }
    return HttpResponse.json({ data: lead }, { status: 200 });
  }),

  /** POST /api/leads — create lead */
  http.post(`${API_BASE}/leads`, async ({ request }) => {
    const body = await request.json();
    const validation = CreateLeadRequestSchema.safeParse(body);
    if (!validation.success) {
      return HttpResponse.json(
        {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 422 }
      );
    }
    const newLead: Lead = {
      ...validation.data,
      id: nextLeadId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ data: newLead }, { status: 201 });
  }),

  /** PUT /api/leads/:id — update lead (PUT-only, decision 6) */
  http.put(`${API_BASE}/leads/:id`, async ({ params, request }) => {
    const body = await request.json();
    const lead = LEAD_FIXTURES.find((l) => l.id === Number(params.id));
    if (!lead) {
      return HttpResponse.json({ message: 'Lead not found', code: 'NOT_FOUND' }, { status: 404 });
    }
    const updated: Lead = { ...lead, ...body, id: lead.id, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ data: updated }, { status: 200 });
  }),

  /** DELETE /api/leads/:id — 204 No Content (decision 16) */
  http.delete(`${API_BASE}/leads/:id`, ({ params }) => {
    const lead = LEAD_FIXTURES.find((l) => l.id === Number(params.id));
    if (!lead) {
      return HttpResponse.json({ message: 'Lead not found', code: 'NOT_FOUND' }, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),
];

export const projectsHandlers = [
  http.get(`${API_BASE}/projects`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 25);
    const paged = makePagedResponse(PROJECT_FIXTURES, page, pageSize);
    return HttpResponse.json(paged, { status: 200 });
  }),

  http.get(`${API_BASE}/projects/:id`, ({ params }) => {
    const project = PROJECT_FIXTURES.find((p) => p.id === params.id);
    if (!project) {
      return HttpResponse.json({ message: 'Project not found', code: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ data: project }, { status: 200 });
  }),

  http.post(`${API_BASE}/projects`, async ({ request }) => {
    const body = await request.json();
    const validation = CreateProjectRequestSchema.safeParse(body);
    if (!validation.success) {
      return HttpResponse.json(
        { message: 'Validation failed', code: 'VALIDATION_ERROR',
          details: validation.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })) },
        { status: 422 }
      );
    }
    const newProject = { ...validation.data, id: crypto.randomUUID() };
    return HttpResponse.json({ data: newProject }, { status: 201 });
  }),
];

export const estimatingHandlers = [
  http.get(`${API_BASE}/estimating/trackers`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 25);
    const paged = makePagedResponse(ESTIMATING_FIXTURES, page, pageSize);
    return HttpResponse.json(paged, { status: 200 });
  }),

  http.get(`${API_BASE}/estimating/trackers/:id`, ({ params }) => {
    const record = ESTIMATING_FIXTURES.find((r) => r.id === Number(params.id));
    if (!record) {
      return HttpResponse.json({ message: 'Tracker not found', code: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ data: record }, { status: 200 });
  }),

  http.post(`${API_BASE}/estimating/trackers`, async ({ request }) => {
    const body = await request.json();
    const validation = CreateTrackerRequestSchema.safeParse(body);
    if (!validation.success) {
      return HttpResponse.json(
        { message: 'Validation failed', code: 'VALIDATION_ERROR',
          details: validation.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })) },
        { status: 422 }
      );
    }
    const newTracker = {
      ...validation.data,
      id: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ data: newTracker }, { status: 201 });
  }),
];

/**
 * Default handlers for the three Tier 1 (CONFIRMED) domains.
 * Tier 2 route conventions are confirmed (D1/D2/D6/A8); add handlers when C1 delivers route implementations.
 * Tier 3 (Auth) handlers require C2 to publish route specs first.
 */
export const defaultHandlers = [
  ...leadsHandlers,
  ...projectsHandlers,
  ...estimatingHandlers,
];
```

**Future domain handlers (Tier 2 — route conventions confirmed, waiting on C1/B1 delivery):**

D1/D6 are resolved (plural, nested). When C1 delivers Tier 2 route handlers and B1 delivers Tier 2 proxy repositories, add domain-specific handler arrays following the `leadsHandlers` pattern. Each requires:
- Paged list handler (`GET /api/projects/{projectId}/{domain}?page=&pageSize=`)
- Single-item handler (`GET /api/projects/{projectId}/{domain}/:id` — returns `{ data: T }` wrapper)
- Create handler (`POST /api/projects/{projectId}/{domain}` — returns `{ data: T }` wrapper)
- Update handler (`PUT /api/projects/{projectId}/{domain}/:id` — PUT-only, returns `{ data: T }` wrapper)
- Delete handler (`DELETE /api/projects/{projectId}/{domain}/:id` → `204 No Content`, no response body)
- Error responses use `{ message, code, requestId?, details? }` envelope
- Aggregate/child handlers where applicable (e.g., Schedule metrics, Contract approvals)

Do NOT pre-define handler arrays until C1 delivers the actual route handler implementations and B1 delivers the adapter classes.

**File: `packages/data-access/src/test-utils/msw-server.ts`**

```typescript
import { setupServer } from 'msw/node';
import { defaultHandlers } from './msw-handlers';

/**
 * MSW server for data-access tests.
 * Use in test setup:
 *   beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 */
export const server = setupServer(...defaultHandlers);
```

**File: `packages/data-access/src/test-utils/index.ts`**

```typescript
/**
 * Test utilities for @hbc/data-access.
 * Exports MSW server, handlers, and fixtures for use in contract tests.
 * Only Tier 1 (CONFIRMED) domain handlers and fixtures are exported.
 */

export { server } from './msw-server';
export {
  defaultHandlers,
  leadsHandlers,
  projectsHandlers,
  estimatingHandlers,
} from './msw-handlers';
export {
  LEAD_FIXTURES,
  PROJECT_FIXTURES,
  ESTIMATING_FIXTURES,
  makePagedResponse,
} from './msw-fixtures';
```

**Task 3 Tests:**

**File: `packages/data-access/src/test-utils/msw-server.test.ts`**

```typescript
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './msw-server';

describe('MSW Server Setup', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('server starts and listens', () => {
    // If this test runs without errors, server is properly initialized
    expect(server).toBeDefined();
  });

  it('handlers are registered', () => {
    // Check that at least one handler exists
    expect(server.listHandlers().length).toBeGreaterThan(0);
  });
});
```

**Verification** (see [Execution Sequence with Acceptance Criteria](#execution-sequence-with-acceptance-criteria) for prerequisites):

Run:
```bash
pnpm --filter @hbc/data-access test test-utils
```

Expected: Tests pass.

**Commit:** `feat: set up MSW server and handlers for adapter contract tests (P1-E1 Task 3)`

### Task 4: Contract Test — Frontend Adapter vs Backend Shape

**Status:** **BLOCKED** on B1 — see [Open Decision and Blocker Ledger](#open-decision-and-blocker-ledger) (B1 — Proxy Adapter)

**Objective:** Prove that the ProxyLeadRepository adapter correctly parses backend responses according to LeadSchema.

**Files to Create:**
- `packages/data-access/src/adapters/proxy/lead-repository.contract.test.ts`

This is the critical contract test. It verifies that the adapter's response type matches the Zod schema. MSW intercepts HTTP calls made by `ProxyHttpClient`, so the test exercises the full adapter → HTTP → MSW → response → Zod validation pipeline.

**Full Code:**

> **Representative example — not executable until B1 delivers `ProxyHttpClient` and `ProxyLeadRepository`.**

**File: `packages/data-access/src/adapters/proxy/lead-repository.contract.test.ts`**

```typescript
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { LeadSchema, CreateLeadRequestSchema, createPagedSchema } from '@hbc/models/api-schemas';
import { ProxyLeadRepository } from './lead-repository';
import { ProxyHttpClient } from './http-client';
import { server } from '../../test-utils';

/**
 * Contract tests for ProxyLeadRepository.
 *
 * BLOCKED: This test requires B1 to deliver ProxyLeadRepository.
 * Currently, proxy adapters throw AdapterNotImplementedError.
 *
 * These tests verify that:
 * 1. The backend (via MSW) returns shapes that conform to Zod schemas
 * 2. The adapter maps those shapes to port interface types
 * 3. The runtime type is compatible with the port interface ILeadRepository
 *
 * If these tests fail, the proxy adapter and backend are not in contract.
 */
describe('ProxyLeadRepository Contract Tests', () => {
  // ProxyHttpClient is a B1 deliverable — does not exist yet
  const httpClient = new ProxyHttpClient({
    baseUrl: 'http://localhost:7071',
    getToken: async () => 'test-token', // MSW intercepts; token not validated
  });
  let repository: ProxyLeadRepository;

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
    repository = new ProxyLeadRepository(httpClient);
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  describe('getAll()', () => {
    it('response conforms to paged LeadSchema', async () => {
      const result = await repository.getAll({ page: 1, pageSize: 25 });

      // Assert response matches paged schema
      const PagedLeads = createPagedSchema(LeadSchema);
      const parsed = PagedLeads.safeParse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      });

      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.page).toBe(1);
        expect(parsed.data.pageSize).toBe(25);
        expect(Array.isArray(parsed.data.items)).toBe(true);
      }
    });

    it('each item in data array conforms to LeadSchema', async () => {
      const result = await repository.getAll({ page: 1, pageSize: 10 });

      for (const lead of result.items) {
        const parsed = LeadSchema.safeParse(lead);
        expect(parsed.success).toBe(true);
        if (parsed.success) {
          expect(parsed.data.id).toBeDefined();
          expect(parsed.data.title).toBeDefined();
          expect(parsed.data.stage).toBeDefined();
        }
      }
    });

    it('respects pagination parameters', async () => {
      const result = await repository.getAll({ page: 1, pageSize: 5 });

      expect(result.pageSize).toBe(5);
      expect(result.page).toBe(1);
      expect(result.items.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getById()', () => {
    it('single lead conforms to LeadSchema', async () => {
      const result = await repository.getById(1);

      const parsed = LeadSchema.safeParse(result);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.id).toBe(1);
        expect(parsed.data.title).toBe('Highway Bridge Replacement — I-95 Corridor');
      }
    });

    it('unknown id returns null', async () => {
      const result = await repository.getById(99999);

      expect(result).toBeNull();
    });

    it('all required fields present', async () => {
      const result = await repository.getById(1);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.id).toBeDefined();
        expect(result.title).toBeDefined();
        expect(result.stage).toBeDefined();
        expect(result.createdAt).toBeDefined();
        expect(result.updatedAt).toBeDefined();
      }
    });
  });

  describe('create()', () => {
    it('response conforms to LeadSchema', async () => {
      const request = {
        title: 'New Highway Project',
        stage: 'Identified' as const,
        clientName: 'State DOT',
        estimatedValue: 5000000,
      };

      const result = await repository.create(request);

      const parsed = LeadSchema.safeParse(result);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.id).toBeDefined();
        expect(parsed.data.createdAt).toBeDefined();
        expect(parsed.data.updatedAt).toBeDefined();
      }
    });

    it('created lead has assigned id', async () => {
      const request = {
        title: 'Another New Lead',
        stage: 'Identified' as const,
        clientName: 'Another Client',
        estimatedValue: 1000000,
      };

      const result = await repository.create(request);

      expect(result.id).toBeDefined();
      expect(result.id).not.toBeUndefined();
      expect(typeof result.id).toBe('number');
      expect(result.id).toBeGreaterThan(0);
    });

    it('created lead has timestamps', async () => {
      const request = {
        title: 'Timestamped Lead',
        stage: 'Identified' as const,
        clientName: 'Timestamp Client',
        estimatedValue: 500000,
      };

      const result = await repository.create(request);

      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      // Verify they are valid ISO 8601 datetimes
      expect(new Date(result.createdAt).toString()).not.toBe('Invalid Date');
      expect(new Date(result.updatedAt).toString()).not.toBe('Invalid Date');
    });

    it('invalid request fails with 422', async () => {
      const invalidRequest = {
        title: '',  // Empty title violates schema
        stage: 'Identified' as const,
        clientName: 'Test',
        estimatedValue: 0,
      };

      // Repository should throw or return error; contract test expects rejection
      await expect(repository.create(invalidRequest)).rejects.toThrow();
    });
  });

  describe('update()', () => {
    it('updated lead conforms to LeadSchema', async () => {
      const leadId = 1;
      const updates = {
        stage: 'Bidding' as const,
        estimatedValue: 3000000,
      };

      const result = await repository.update(leadId, updates);

      const parsed = LeadSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });

    it('unknown lead throws NotFoundError', async () => {
      const updates = { stage: 'Bidding' as const };

      await expect(repository.update(99999, updates)).rejects.toThrow();
    });
  });

  describe('delete()', () => {
    it('delete known lead resolves without error', async () => {
      await expect(repository.delete(1)).resolves.toBeUndefined();
    });

    it('delete unknown lead throws NotFoundError', async () => {
      await expect(repository.delete(99999)).rejects.toThrow();
    });
  });
});
```

**Verification** (see [Execution Sequence with Acceptance Criteria](#execution-sequence-with-acceptance-criteria) for prerequisites):

Run:
```bash
pnpm --filter @hbc/data-access test lead-repository.contract
```

Expected: All tests pass, proving adapter and schema agreement.

**Commit:** `test(data-access): add contract tests for ProxyLeadRepository (P1-E1 Task 4)`

### Task 5: Add Contract Tests for Project and Estimating Repositories

**Status:** **BLOCKED** on B1 — see [Open Decision and Blocker Ledger](#open-decision-and-blocker-ledger) (B1 — Proxy Adapter)

**Files to Create:**
- `packages/data-access/src/adapters/proxy/project-repository.contract.test.ts`
- `packages/data-access/src/adapters/proxy/estimating-repository.contract.test.ts`

**Implementation:** Use the same pattern as Task 4, adjusting for ActiveProject and EstimatingTracker types.

> **Representative examples — not executable until B1 delivers proxy repository classes.**

**File: `packages/data-access/src/adapters/proxy/project-repository.contract.test.ts`** (skeleton; show representative test)

```typescript
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { ActiveProjectSchema, createPagedSchema } from '@hbc/models/api-schemas';
import { ProxyProjectRepository } from './project-repository';
import { ProxyHttpClient } from './http-client';
import { server } from '../../test-utils';

describe('ProxyProjectRepository Contract Tests', () => {
  const httpClient = new ProxyHttpClient({
    baseUrl: 'http://localhost:7071',
    getToken: async () => 'test-token',
  });
  let repository: ProxyProjectRepository;

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
    repository = new ProxyProjectRepository(httpClient);
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('getProjects()', () => {
    it('response conforms to paged ActiveProjectSchema', async () => {
      const result = await repository.getProjects({ page: 1, pageSize: 25 });

      const parsed = createPagedSchema(ActiveProjectSchema).safeParse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      });

      expect(parsed.success).toBe(true);
    });

    it('each project conforms to ActiveProjectSchema', async () => {
      const result = await repository.getProjects({ page: 1, pageSize: 10 });

      for (const project of result.items) {
        const parsed = ActiveProjectSchema.safeParse(project);
        expect(parsed.success).toBe(true);
      }
    });
  });

  describe('getProjectById()', () => {
    it('single project conforms to ActiveProjectSchema', async () => {
      const result = await repository.getProjectById('660e8400-e29b-41d4-a716-446655440001');

      const parsed = ActiveProjectSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });

    it('unknown project returns null', async () => {
      const result = await repository.getProjectById('660e8400-e29b-41d4-a716-999999999999');

      expect(result).toBeNull();
    });
  });

  describe('createProject()', () => {
    it('created project conforms to ActiveProjectSchema', async () => {
      const request = {
        name: 'New Project',
        number: 'PRJ-NEW01',
        status: 'Planning',
        startDate: '2026-04-01T00:00:00Z',
        endDate: '2026-12-31T00:00:00Z',
      };

      const result = await repository.createProject(request);

      const parsed = ActiveProjectSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });
  });

  // ... updateProject(), deleteProject() following same pattern
});
```

**File: `packages/data-access/src/adapters/proxy/estimating-repository.contract.test.ts`** (skeleton)

```typescript
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { EstimatingTrackerSchema, createPagedSchema } from '@hbc/models/api-schemas';
import { ProxyEstimatingRepository } from './estimating-repository';
import { ProxyHttpClient } from './http-client';
import { server } from '../../test-utils';

describe('ProxyEstimatingRepository Contract Tests', () => {
  const httpClient = new ProxyHttpClient({
    baseUrl: 'http://localhost:7071',
    getToken: async () => 'test-token',
  });
  let repository: ProxyEstimatingRepository;

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
    repository = new ProxyEstimatingRepository(httpClient);
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('getAllTrackers()', () => {
    it('response conforms to paged EstimatingTrackerSchema', async () => {
      const result = await repository.getAllTrackers({ page: 1, pageSize: 25 });

      const parsed = createPagedSchema(EstimatingTrackerSchema).safeParse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      });

      expect(parsed.success).toBe(true);
    });

    it('each record conforms to EstimatingTrackerSchema', async () => {
      const result = await repository.getAllTrackers({ page: 1, pageSize: 10 });

      for (const record of result.items) {
        const parsed = EstimatingTrackerSchema.safeParse(record);
        expect(parsed.success).toBe(true);
      }
    });
  });

  describe('getTrackerById()', () => {
    it('single record conforms to EstimatingTrackerSchema', async () => {
      const result = await repository.getTrackerById(1);

      const parsed = EstimatingTrackerSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });
  });

  // ... createTracker(), updateTracker(), deleteTracker()
});
```

**Verification** (see [Execution Sequence with Acceptance Criteria](#execution-sequence-with-acceptance-criteria) for prerequisites):

Run:
```bash
pnpm --filter @hbc/data-access test contract
```

Expected: All contract tests pass.

**Commit:** `test(data-access): add contract tests for Project and Estimating repositories (P1-E1 Task 5)`

---

## Chunk 3: Route Contract Tests and Error Contract Tests

### Backend Contract Test Readiness

**Current backend test infrastructure (CURRENT):**
- Vitest configured with unit and smoke projects (`backend/functions/vitest.config.ts`) (**CURRENT**)
- Mock services for provisioning saga (`backend/functions/src/test-utils/mock-services.ts`) (**CURRENT**)
- Token validation middleware tests (`backend/functions/src/middleware/validateToken.test.ts`) (**CURRENT**)
- No domain route handlers exist — backend currently serves provisioning, proxy, notification, and acknowledgment functions only (**CURRENT**)
- `backend/functions` does NOT depend on `@hbc/data-access` — repository port interfaces are not available in the backend package (**CURRENT**)

**What C1 must deliver before E1 Tasks 6-7 can execute:**
- Domain route handlers: `leads.handler.ts`, `projects.handler.ts`, `estimating.handler.ts` in `backend/functions/src/functions/`
- Error middleware: `formatErrorResponse()` in `backend/functions/src/middleware/error-middleware.ts`
- Service container expansion: add domain repository access to `IServiceContainer` (currently only provisioning services)
- `@hbc/data-access` added as a `devDependency` (type-only) in `backend/functions/package.json` — see [Dependency Boundary Decision](#dependency-boundary-decision)

| Test Category | Can Run Now? | Blocked On |
|---|---|---|
| Route contract tests (Task 6) | **No** | C1: domain route handlers + `@hbc/data-access` dependency |
| Error contract tests (Task 7) | **No** | C1: error middleware |
| Smoke tests (Task 8) | **No** | C1 + C2 + staging infra |
| Telemetry baseline (Task 9) | **No** | C3 + staging infra |

### Task 6: Route Contract Tests (Leads Routes)

**Status:** **BLOCKED** on C1 — see [Open Decision and Blocker Ledger](#open-decision-and-blocker-ledger) (C1 — Backend Catalog)

**Objective:** Test that Azure Functions route handlers return responses conforming to contract schemas.

#### Backend Contract Test Strategy

Route contract tests and error contract tests occupy a distinct lane from the existing backend unit tests and from smoke tests:

| Aspect | Existing Unit Tests | Route/Error Contract Tests (Tasks 6-7) | Smoke Tests (Task 8) |
|---|---|---|---|
| **What is invoked** | Business logic classes (`SagaOrchestrator`, services) | HTTP handler functions (`handleGetLeads`, `handleCreateLead`) | Real HTTP endpoints over the network |
| **Dependencies** | `createMockServices()` — all service methods are `vi.fn()` stubs | Mock service factory implementing domain interface ports | Real staging deployment — no mocks |
| **Auth** | Not tested | Not tested (handlers receive pre-validated context) | Real Entra ID Bearer tokens required |
| **Network** | None | None | Real HTTP to staging Azure Functions |
| **What is validated** | Business logic correctness, state transitions, side effects | Response body conformance against contract schemas (success AND error paths) | End-to-end flow: auth → routing → transport shape → status codes |
| **Vitest project** | `unit` | `contract` (new — see Task 10) | `smoke` |

**Invocation pattern:** Route contract tests call the handler function directly — e.g., `handleGetLeads(request, context, services)` — passing a mock `HttpRequest` (plain object with `as any`, following the existing `validateToken.test.ts` pattern), a mock `InvocationContext`, and a mock service factory. The response body is parsed with `JSON.parse()` and validated against contract schemas.

**Why this is the contract boundary:** The HTTP handler is the public API surface. Business logic classes are internal implementation. By testing the handler directly with mocked dependencies, route contract tests verify that the handler produces schema-conformant output without requiring a deployed environment.

**`@hbc/data-access` dependency prerequisite:** Repository port interfaces (`ILeadRepository`, `IProjectRepository`, `IEstimatingRepository`) are defined in `@hbc/data-access/src/ports/`, NOT in `@hbc/models`. The mock service factory must implement these interfaces. **C1 must add `@hbc/data-access` to `backend/functions/package.json` `devDependencies`** (type-only — see [Dependency Boundary Decision](#dependency-boundary-decision)) before contract test imports resolve. Currently, `@hbc/functions` depends on `@hbc/models`, `@hbc/provisioning`, `@hbc/acknowledgment`, and `@hbc/notification-intelligence` — but not `@hbc/data-access`.

**Files to Create:**
- `backend/functions/src/functions/leads/leads.contract.test.ts`
- `backend/functions/src/test-utils/mock-service-factory.ts` (if not exists)
- `backend/functions/src/test-utils/mock-request.ts` (if not exists)

**Full Code (TARGET-STATE — C1 must deliver route handlers first; see ledger for unblock conditions):**

**File: `backend/functions/src/test-utils/mock-service-factory.ts`**

```typescript
/**
 * NOTE: backend/functions does NOT currently depend on @hbc/data-access.
 * C1 must add @hbc/data-access to devDependencies (type-only) before these imports work.
 * Only `import type` is permitted — see Dependency Boundary Decision.
 * Repository port interfaces live in @hbc/data-access, NOT @hbc/models.
 * @hbc/models exports domain model types (ILead, IActiveProject, etc.).
 *
 * This mock factory extends the existing provisioning mock pattern in
 * backend/functions/src/test-utils/mock-services.ts to cover domain repositories.
 */
import type { ILeadRepository, IProjectRepository, IEstimatingRepository } from '@hbc/data-access/ports';
import { vi } from 'vitest';

/**
 * Creates a mock service factory for testing domain route handlers.
 * Replace actual database/service implementations with Vitest mocks.
 */
export function createMockServiceFactory() {
  const mockLeadRepository: ILeadRepository = {
    getAll: vi.fn().mockResolvedValue({
      items: [
        {
          id: 1,
          title: 'Test Lead',
          stage: 'Identified',
          clientName: 'Test Client',
          estimatedValue: 100000,
          createdAt: '2026-03-16T10:00:00Z',
          updatedAt: '2026-03-16T10:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 25,
    }),
    getById: vi.fn().mockResolvedValue(null),
    search: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 25 }),
    create: vi.fn().mockResolvedValue({
      id: 100,
      title: 'New Lead',
      stage: 'Identified',
      clientName: 'New Client',
      estimatedValue: 50000,
      createdAt: '2026-03-16T10:00:00Z',
      updatedAt: '2026-03-16T10:00:00Z',
    }),
    update: vi.fn().mockResolvedValue({
      id: 1,
      title: 'Updated Lead',
      stage: 'Bidding',
      clientName: 'Test Client',
      estimatedValue: 200000,
      createdAt: '2026-03-16T10:00:00Z',
      updatedAt: '2026-03-16T12:00:00Z',
    }),
    delete: vi.fn().mockResolvedValue(undefined),
  };

  const mockProjectRepository: IProjectRepository = {
    getProjects: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
    }),
    getProjectById: vi.fn().mockResolvedValue(null),
    createProject: vi.fn().mockResolvedValue({
      id: '770e8400-e29b-41d4-a716-446655440001',
      name: 'New Project', number: 'PRJ-NEW01', status: 'Active',
      startDate: '2026-04-01T00:00:00Z', endDate: '2026-12-31T00:00:00Z',
    }),
    updateProject: vi.fn().mockResolvedValue({
      id: '770e8400-e29b-41d4-a716-446655440001',
      name: 'Updated Project', number: 'PRJ-NEW01', status: 'Active',
      startDate: '2026-04-01T00:00:00Z', endDate: '2026-12-31T00:00:00Z',
    }),
    deleteProject: vi.fn().mockResolvedValue(undefined),
    getPortfolioSummary: vi.fn().mockResolvedValue({
      totalProjects: 0, activeProjects: 0, totalContractValue: 0, averagePercentComplete: 0,
    }),
  };

  const mockEstimatingRepository: IEstimatingRepository = {
    getAllTrackers: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
    }),
    getTrackerById: vi.fn().mockResolvedValue(null),
    createTracker: vi.fn().mockResolvedValue({
      id: 100, projectId: '660e8400-e29b-41d4-a716-446655440001',
      bidNumber: 'BID-2026-100', status: 'Draft',
      dueDate: '2026-05-01T00:00:00Z',
      createdAt: '2026-03-16T10:00:00Z', updatedAt: '2026-03-16T10:00:00Z',
    }),
    updateTracker: vi.fn().mockResolvedValue({
      id: 1, projectId: '660e8400-e29b-41d4-a716-446655440001',
      bidNumber: 'BID-2026-001', status: 'InProgress',
      dueDate: '2026-05-01T00:00:00Z',
      createdAt: '2026-03-16T10:00:00Z', updatedAt: '2026-03-16T12:00:00Z',
    }),
    deleteTracker: vi.fn().mockResolvedValue(undefined),
    getKickoff: vi.fn().mockResolvedValue(null),
    createKickoff: vi.fn().mockResolvedValue({
      id: 1, projectId: '660e8400-e29b-41d4-a716-446655440001',
      kickoffDate: '2026-04-01T09:00:00Z', attendees: ['Alice', 'Bob'],
      notes: 'Initial kickoff', createdAt: '2026-03-16T10:00:00Z',
    }),
  };

  return {
    leadRepository: mockLeadRepository,
    projectRepository: mockProjectRepository,
    estimatingRepository: mockEstimatingRepository,
  };
}
```

**File: `backend/functions/src/test-utils/mock-request.ts`**

```typescript
import { HttpRequest } from '@azure/functions';

/**
 * Create a mock Azure Functions HttpRequest for testing.
 */
export function createMockRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  query?: Record<string, string>,
  body?: unknown
): HttpRequest {
  const url = new URL(`http://localhost:7071${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  return new HttpRequest({
    method,
    url: url.toString(),
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Mock Azure Functions context.
 *
 * NOTE: This is a simplified mock. Actual InvocationContext from @azure/functions
 * has additional required properties (triggerMetadata, trace, etc.). When C1
 * delivers real route handlers, this mock may need to be extended to satisfy
 * the handler's InvocationContext type signature. The existing provisioning
 * tests at backend/functions/src/test-utils/mock-services.ts may provide a
 * more complete InvocationContext mock pattern to follow.
 */
export function createMockContext() {
  return {
    invocationId: 'test-invocation-id',
    executionContext: {
      invocationId: 'test-invocation-id',
      functionDirectory: '/functions',
      functionName: 'test-function',
      retryContext: null,
    },
    log: () => {},
  };
}
```

**File: `backend/functions/src/functions/leads/leads.contract.test.ts`**

**TARGET-STATE:** This test file targets `leads.handler.ts` which does not exist today. The `backend/functions/src/functions/` directory currently contains only provisioning, proxy, notification, acknowledgment, signalr, and timer functions. No `leads/` directory exists. C1 must deliver the leads route module before this test can be created.

```typescript
import { describe, it, expect, vi } from 'vitest';
import type { HttpResponseInit } from '@azure/functions';
import { HttpResponse } from '@azure/functions';
import {
  LeadSchema,
  ErrorEnvelopeSchema,
  CreateLeadRequestSchema,
} from '@hbc/models/api-schemas';
import { createPagedSchema } from '@hbc/models/api-schemas';
import { handleGetLeads, handleCreateLead, handleGetLeadById } from './leads.handler'; // C1 deliverable
import { createMockServiceFactory } from '../../test-utils/mock-service-factory';
import { createMockRequest, createMockContext } from '../../test-utils/mock-request';

/**
 * Contract tests for Leads route handlers.
 *
 * BLOCKED: Requires C1 to deliver leads route handlers.
 *
 * These tests verify that:
 * 1. GET /api/leads returns a paged-lead-schema-conformant response
 * 2. GET /api/leads/:id returns a LeadSchema-conformant response
 * 3. POST /api/leads validates input and returns LeadSchema-conformant response
 * 4. All error responses conform to ErrorEnvelopeSchema
 *
 * If these fail, the backend is not producing contracted shapes.
 */
describe('Leads Route Handlers — Contract Tests', () => {
  describe('handleGetLeads()', () => {
    it('returns paged leads conforming to paged LeadSchema', async () => {
      const services = createMockServiceFactory();
      const request = createMockRequest('GET', '/api/leads', { page: '1', pageSize: '25' });
      const context = createMockContext();

      const response = await handleGetLeads(request, context, services);

      expect(response.status).toBe(200);
      const body = JSON.parse(await response.text());

      const parsed = createPagedSchema(LeadSchema).safeParse(body);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.items).toBeInstanceOf(Array);
        expect(parsed.data.total).toBeGreaterThanOrEqual(0);
      }
    });

    it('respects page and pageSize parameters', async () => {
      const services = createMockServiceFactory();
      const request = createMockRequest('GET', '/api/leads', { page: '2', pageSize: '10' });
      const context = createMockContext();

      const response = await handleGetLeads(request, context, services);
      const body = JSON.parse(await response.text());

      expect(body.page).toBe(2);
      expect(body.pageSize).toBe(10);
    });

    it('invalid page parameter returns error conforming to ErrorEnvelopeSchema', async () => {
      const services = createMockServiceFactory();
      const request = createMockRequest('GET', '/api/leads', { page: 'invalid' });
      const context = createMockContext();

      const response = await handleGetLeads(request, context, services);

      expect(response.status).toBe(400);
      const body = JSON.parse(await response.text());

      const parsed = ErrorEnvelopeSchema.safeParse(body);
      expect(parsed.success).toBe(true);
    });
  });

  describe('handleGetLeadById()', () => {
    it('returns single lead conforming to LeadSchema in { data } wrapper', async () => {
      const services = createMockServiceFactory();
      const mockLead = {
        id: 1,
        title: 'Test Lead',
        stage: 'Identified' as const,
        clientName: 'Test Client',
        estimatedValue: 100000,
        createdAt: '2026-03-16T10:00:00Z',
        updatedAt: '2026-03-16T10:00:00Z',
      };
      vi.spyOn(services.leadRepository, 'getById').mockResolvedValue(mockLead as any);

      const request = createMockRequest('GET', '/api/leads/1');
      const context = createMockContext();

      const response = await handleGetLeadById(request, context, services);

      expect(response.status).toBe(200);
      const body = JSON.parse(await response.text());

      // { data: T } wrapper — see Locked Response-Envelope Convention
      const parsed = LeadSchema.safeParse(body.data);
      expect(parsed.success).toBe(true);
    });

    it('unknown lead returns 404 conforming to ErrorEnvelopeSchema', async () => {
      const services = createMockServiceFactory();
      vi.spyOn(services.leadRepository, 'getById').mockResolvedValue(null);

      const request = createMockRequest('GET', '/api/leads/99999');
      const context = createMockContext();

      const response = await handleGetLeadById(request, context, services);

      expect(response.status).toBe(404);
      const body = JSON.parse(await response.text());

      const parsed = ErrorEnvelopeSchema.safeParse(body);
      expect(parsed.success).toBe(true);
      expect(body.code).toBe('NOT_FOUND');
    });
  });

  describe('handleCreateLead()', () => {
    it('valid create request returns lead conforming to LeadSchema', async () => {
      const services = createMockServiceFactory();
      const newLead = {
        id: 100,
        title: 'New Lead',
        stage: 'Identified' as const,
        clientName: 'New Client',
        estimatedValue: 50000,
        createdAt: '2026-03-16T10:00:00Z',
        updatedAt: '2026-03-16T10:00:00Z',
      };
      vi.spyOn(services.leadRepository, 'create').mockResolvedValue(newLead as any);

      const createRequest = {
        title: 'New Lead',
        stage: 'Identified',
        clientName: 'New Client',
        estimatedValue: 50000,
      };
      const request = createMockRequest('POST', '/api/leads', undefined, createRequest);
      const context = createMockContext();

      const response = await handleCreateLead(request, context, services);

      expect(response.status).toBe(201);
      const body = JSON.parse(await response.text());

      // { data: T } wrapper — see Locked Response-Envelope Convention
      const parsed = LeadSchema.safeParse(body.data);
      expect(parsed.success).toBe(true);
    });

    it('invalid request returns 422 conforming to ErrorEnvelopeSchema', async () => {
      const services = createMockServiceFactory();
      const invalidRequest = {
        title: '',  // Empty string violates schema
        stage: 'Identified',
        clientName: 'Test',
        estimatedValue: 0,
      };
      const request = createMockRequest('POST', '/api/leads', undefined, invalidRequest);
      const context = createMockContext();

      const response = await handleCreateLead(request, context, services);

      expect(response.status).toBe(422);
      const body = JSON.parse(await response.text());

      const parsed = ErrorEnvelopeSchema.safeParse(body);
      expect(parsed.success).toBe(true);
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.details).toBeInstanceOf(Array);
    });

    it('missing required fields returns 422', async () => {
      const services = createMockServiceFactory();
      const incompleteRequest = {
        title: 'New Lead',
        // stage, clientName, estimatedValue missing
      };
      const request = createMockRequest('POST', '/api/leads', undefined, incompleteRequest);
      const context = createMockContext();

      const response = await handleCreateLead(request, context, services);

      expect(response.status).toBe(422);
    });
  });

  describe('handleSearchLeads()', () => {
    it('search returns paged leads conforming to paged LeadSchema', async () => {
      const services = createMockServiceFactory();
      vi.spyOn(services.leadRepository, 'search').mockResolvedValue({
        items: [
          {
            id: 1,
            title: 'Highway Bridge Replacement',
            stage: 'Qualifying' as const,
            clientName: 'ACME Construction',
            estimatedValue: 2500000,
            createdAt: '2026-03-16T10:00:00Z',
            updatedAt: '2026-03-16T10:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 25,
      });

      const request = createMockRequest('GET', '/api/leads/search', { q: 'bridge', page: '1', pageSize: '25' });
      const context = createMockContext();

      const response = await handleSearchLeads(request, context, services);

      expect(response.status).toBe(200);
      const body = JSON.parse(await response.text());

      const parsed = createPagedSchema(LeadSchema).safeParse(body);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.items).toHaveLength(1);
        expect(parsed.data.total).toBe(1);
      }
    });

    it('empty search query returns 400 conforming to ErrorEnvelopeSchema', async () => {
      const services = createMockServiceFactory();
      const request = createMockRequest('GET', '/api/leads/search', { q: '' });
      const context = createMockContext();

      const response = await handleSearchLeads(request, context, services);

      expect(response.status).toBe(400);
      const body = JSON.parse(await response.text());

      const parsed = ErrorEnvelopeSchema.safeParse(body);
      expect(parsed.success).toBe(true);
    });
  });
});
```

> **Note:** The import line for this test file must also include `handleSearchLeads`:
> ```typescript
> import { handleGetLeads, handleCreateLead, handleGetLeadById, handleSearchLeads } from './leads.handler'; // C1 deliverable
> ```

**Verification** (see [Execution Sequence with Acceptance Criteria](#execution-sequence-with-acceptance-criteria) for prerequisites):

Run:
```bash
pnpm --filter @hbc/functions test leads.contract
```

Expected: All tests pass (when prerequisites are met).

**Commit:** `test(backend): add contract tests for leads route handlers (P1-E1 Task 6)`

### Task 7: Error Contract Tests

**Status:** **BLOCKED** on C1 — see [Open Decision and Blocker Ledger](#open-decision-and-blocker-ledger) (C1 — Backend Catalog)

**Objective:** Ensure all error paths return ErrorEnvelopeSchema-conformant responses.

#### Error Envelope Fields (All Locked)

| Field | Status | Notes |
|---|---|---|
| `message` | **LOCKED** (D3 resolved) | Human-readable error message |
| `code` | **LOCKED** | Machine-readable error code (e.g., `NOT_FOUND`, `VALIDATION_ERROR`); required on all error responses |
| `details` | **LOCKED** | Optional array of `{ field?, message }` for field-level validation errors |
| `requestId` | **LOCKED** | Optional tracing correlation ID (decision 18: also in response header) |

All error envelope fields are now locked. No PROVISIONAL markers remain.

**Relationship to Task 6:** Task 6 contract tests already validate error-path shapes for specific route handlers (400, 404, 422 cases). Task 7 tests the error middleware function (`formatErrorResponse`) in isolation, covering all HTTP error status codes and ensuring the middleware itself always produces schema-conformant output. Together, Tasks 6 and 7 provide complete error-shape coverage — Task 7 at the middleware layer, Task 6 at the handler layer.

**Files to Create:**
- `backend/functions/src/middleware/error-contract.test.ts`

**Full Code (TARGET-STATE — C1 must deliver error middleware first; see ledger for unblock conditions):**

**File: `backend/functions/src/middleware/error-contract.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { ErrorEnvelopeSchema } from '@hbc/models/api-schemas';
import { formatErrorResponse } from './error-middleware'; // C1 deliverable

/**
 * Contract tests for error response formatting.
 *
 * TARGET-STATE: Requires C1 to deliver error middleware.
 *
 * Ensures all error paths in the backend produce ErrorEnvelopeSchema-conformant responses.
 */
describe('Error Response Contract', () => {
  describe('formatErrorResponse()', () => {
    it('400 Bad Request conforms to ErrorEnvelopeSchema', () => {
      const error = new Error('Invalid input');
      const response = formatErrorResponse(400, 'INVALID_INPUT', 'Invalid input', 'req-001');

      const parsed = ErrorEnvelopeSchema.safeParse(response);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.code).toBe('INVALID_INPUT');
      }
    });

    it('401 Unauthorized conforms to ErrorEnvelopeSchema', () => {
      const response = formatErrorResponse(401, 'UNAUTHORIZED', 'Missing or invalid auth token', 'req-002');

      const parsed = ErrorEnvelopeSchema.safeParse(response);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.code).toBe('UNAUTHORIZED');
      }
    });

    it('403 Forbidden conforms to ErrorEnvelopeSchema', () => {
      const response = formatErrorResponse(403, 'FORBIDDEN', 'User lacks permission', 'req-003');

      const parsed = ErrorEnvelopeSchema.safeParse(response);
      expect(parsed.success).toBe(true);
    });

    it('404 Not Found conforms to ErrorEnvelopeSchema', () => {
      const response = formatErrorResponse(404, 'NOT_FOUND', 'Resource not found', 'req-004');

      const parsed = ErrorEnvelopeSchema.safeParse(response);
      expect(parsed.success).toBe(true);
      expect(response.code).toBe('NOT_FOUND');
    });

    it('422 Validation Error with field details conforms to ErrorEnvelopeSchema', () => {
      const details = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'status', message: 'Invalid status value' },
      ];
      const response = formatErrorResponse(422, 'VALIDATION_ERROR', 'Validation failed', 'req-005', details);

      const parsed = ErrorEnvelopeSchema.safeParse(response);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.code).toBe('VALIDATION_ERROR');
        expect(parsed.data.details).toHaveLength(2);
      }
    });

    it('500 Internal Server Error conforms to ErrorEnvelopeSchema', () => {
      const response = formatErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error', 'req-006');

      const parsed = ErrorEnvelopeSchema.safeParse(response);
      expect(parsed.success).toBe(true);
    });

    it('error must have message and code fields', () => {
      const incomplete = { message: 'Test error' };  // Missing 'code'

      const parsed = ErrorEnvelopeSchema.safeParse(incomplete);
      expect(parsed.success).toBe(false);
    });

    it('requestId is optional', () => {
      const response = {
        message: 'Not found',
        code: 'NOT_FOUND',
        // no requestId
      };

      const parsed = ErrorEnvelopeSchema.safeParse(response);
      expect(parsed.success).toBe(true);
    });
  });
});
```

**Note:** The `formatErrorResponse()` function must be implemented in the backend error middleware. It should use Zod validation to ensure compliance:

**File: `backend/functions/src/middleware/error-middleware.ts`** (TARGET-STATE sketch — C1 deliverable)

```typescript
import { ErrorEnvelopeSchema, type ErrorEnvelope } from '@hbc/models/api-schemas';

/**
 * Format an error response conforming to ErrorEnvelopeSchema.
 */
export function formatErrorResponse(
  status: number,
  code: string,
  message: string,
  requestId?: string,
  details?: Array<{ field?: string; message: string }>
): ErrorEnvelope {
  const response: ErrorEnvelope = {
    message,
    code,
    requestId,
    details,
  };

  // Validate response conforms to schema before returning
  const parsed = ErrorEnvelopeSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error(`Error response does not conform to schema: ${parsed.error.message}`);
  }

  return parsed.data;
}
```

**Verification** (see [Execution Sequence with Acceptance Criteria](#execution-sequence-with-acceptance-criteria) for prerequisites):

Run:
```bash
pnpm --filter @hbc/functions test error-contract
```

Expected: All error envelope tests pass.

**Commit:** `test(backend): add error response contract tests (P1-E1 Task 7)`

---

## Chunk 4: Smoke Tests and Telemetry Baseline

### Readiness Gates for Tasks 8 and 9

These gates document the concrete prerequisites that must be satisfied before staging smoke tests or telemetry baseline verification can produce meaningful results. All prerequisites are **NOT MET** as of 2026-03-18.

#### Task 8 Readiness Gate (Staging Smoke Tests)

| Prerequisite | Workstream | How to Verify | Current Status |
|---|---|---|---|
| Domain route handlers deployed to staging | C1 | `curl https://<staging>/api/leads` returns 401 (not 404) | **NOT MET** — no domain routes in repo |
| Auth middleware active on staging | C2 | Unauthenticated request returns 401 with `ErrorEnvelopeSchema`-conformant body | **NOT MET** — C2 not delivered |
| Staging Azure Functions instance deployed | Platform | `SMOKE_TEST_BASE_URL` resolves and returns HTTP responses | **NOT MET** — no staging URL confirmed |
| Valid API-scoped auth token obtainable | C2 + Platform | `az account get-access-token --resource api://<CLIENT_ID>` succeeds | **NOT MET** — CLIENT_ID not defined by C2 |
| `@hbc/models` Zod schemas published | E1 Tasks 1-2 | `@hbc/models/api-schemas` exports resolve | **NOT MET** — Zod not added yet |

#### Task 9 Readiness Gate (Telemetry Baseline)

All Task 8 prerequisites, plus:

| Prerequisite | Workstream | How to Verify | Current Status |
|---|---|---|---|
| C3 instrumentation deployed to staging | C3 | KQL query `traces \| where timestamp > ago(5m)` returns `handler.*` events after smoke traffic | **NOT MET** — C3 not implemented |
| Application Insights workspace accessible | Platform | Azure Portal → Application Insights → Logs → KQL query succeeds | **NOT MET** — access not confirmed |

**Do not attempt Tasks 8 or 9 until the relevant readiness gates are met.** Running smoke tests against a staging instance without domain routes, auth middleware, or instrumentation will produce misleading results — tests will fail for infrastructure reasons, not contract violations.

### Task 8: Critical Path Smoke Tests

**Status:** **BLOCKED** on C1 + C2 + staging infrastructure — see [Open Decision and Blocker Ledger](#open-decision-and-blocker-ledger) (C1, C2, Staging infra)

**Objective:** Run end-to-end tests against staging Azure Functions to verify critical flows work in production-like conditions.

**Files to Create:**
- `backend/functions/src/test/smoke/critical-paths.smoke.test.ts`

**Smoke test authentication policy:**

The staging API is protected by Entra ID Bearer token validation (C2 deliverable). Smoke tests must present a valid token scoped to the API audience — not a default Azure Resource Manager token.

**Required environment variables:**

| Variable | Required | Purpose |
|---|---|---|
| `SMOKE_TEST_BASE_URL` | Yes | Staging Azure Functions base URL (e.g., `https://hb-intel-stage.azurewebsites.net`) |
| `AUTH_TOKEN` | Yes | Bearer token — must be a JWT with `aud` matching the Azure Functions API app registration client ID (defined by C2). This is NOT an Azure Resource Manager token. |
| `SMOKE_CLIENT_ID` | No (documentation only) | Entra ID app registration client ID — used in token acquisition, not consumed by tests directly |

**Auth token expectations:**

`AUTH_TOKEN` must be a valid JWT with the following properties:
- `aud` (audience) matches the HB Intel Azure Functions API app registration (defined by C2)
- Token is not expired (MSAL tokens expire after ~1 hour)
- Token is from the correct tenant matching the staging environment
- Token has sufficient scope grants for the API operations under test

**Common failure:** `az account get-access-token` without `--resource api://<CLIENT_ID>` returns an ARM-scoped token (`aud: https://management.azure.com`) that the HB Intel API will reject with 401. This is the most common operator error.

**Skip/fail behavior:**

| Condition | Local Behavior | CI Behavior | Classification |
|---|---|---|---|
| `SMOKE_TEST_BASE_URL` not set | Skip silently | **Fail** (decision 14) | Local: expected; CI: env must be configured |
| `AUTH_TOKEN` not set | Skip with warning | **Fail** (decision 14) | Local: expected; CI: token must be injected |
| 401 response from staging | Fail with diagnostic | Fail with diagnostic | Operator error — token audience mismatch or expired |
| 5xx response from staging | Fail | Fail | Staging unavailable — retry later, not a contract failure |
| Response shape mismatch | Fail | Fail | **Actual contract failure** — investigate |
| Network timeout / DNS failure | Fail | Fail | Staging not deployed or unreachable |

#### Smoke Test Input Policy

**Required inputs:**

| Input | Variable | Required For | Source |
|---|---|---|---|
| Staging base URL | `SMOKE_TEST_BASE_URL` | All smoke tests | Platform team — staging deployment URL |
| API auth token | `AUTH_TOKEN` | All authenticated tests | Operator — `az account get-access-token --resource api://<CLIENT_ID>` |
| CI indicator | `CI` | Distinguishing local vs CI behavior | CI pipeline sets automatically |

**Local-vs-CI behavior (decision 14):**

| Condition | Local (`CI` unset) | CI (`CI=true`) |
|---|---|---|
| `SMOKE_TEST_BASE_URL` missing | Skip silently | **Hard fail** — CI must configure staging URL |
| `AUTH_TOKEN` missing | Skip with warning | **Hard fail** — CI must inject auth token |
| Both present | Run tests | Run tests |

Locally, developers run `pnpm --filter @hbc/functions test:smoke` without env vars and all smoke tests skip — this is expected and correct. In CI, missing inputs represent a pipeline configuration error that must fail the build, not silently skip. The `CI` environment variable (set automatically by all major CI providers) distinguishes the two modes.

The existing provisioning smoke test uses `SMOKE_TEST=true` + `describe.runIf(SMOKE_TEST)` as a boolean gate. E1 smoke tests use env-var presence detection with CI-aware failure logic — both patterns are acceptable.

**Token acquisition — operator/CI responsibility:**

The test runner does NOT acquire tokens. The operator or CI pipeline must provide `AUTH_TOKEN` via one of:

1. **Azure CLI (interactive/developer):**
   ```bash
   AUTH_TOKEN=$(az account get-access-token --resource api://<CLIENT_ID> --query accessToken -o tsv)
   ```
   Where `<CLIENT_ID>` is the Entra ID app registration for the HB Intel Azure Functions API (defined by C2).

2. **Service principal (CI/CD):**
   ```bash
   AUTH_TOKEN=$(az account get-access-token --resource api://<CLIENT_ID> \
     --tenant <TENANT_ID> --query accessToken -o tsv)
   ```
   Requires prior `az login --service-principal` with a test service principal that has API scope grants.

3. **MSAL CLI or custom script:**
   Any method that produces a valid JWT with `aud` matching the API's client ID.

**What will NOT work:**
- `az account get-access-token` with no `--resource` flag — returns an ARM-scoped token (`aud: https://management.azure.com`) that the API will reject with 401.
- Expired tokens — MSAL tokens expire after ~1 hour; CI pipelines must acquire fresh tokens per run.
- Tokens from the wrong tenant — multi-tenant app registrations must match the staging tenant.

**Full Code:**

**File: `backend/functions/src/test/smoke/critical-paths.smoke.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { LeadSchema, ActiveProjectSchema, createPagedSchema } from '@hbc/models/api-schemas';

/**
 * Critical path smoke tests for staging Azure Functions.
 *
 * BLOCKED: Requires C1 (routes) + C2 (auth) + staging infrastructure.
 *
 * Response-shape convention: Single-item responses use `{ data: T }` wrapper.
 * See "Locked Response-Envelope Convention" in the P1-E1 plan for full details.
 *
 * These tests run against a real staging instance (not mocked).
 * They verify that essential user flows work end-to-end.
 *
 * Usage:
 *   SMOKE_TEST_BASE_URL=https://hb-intel-stage.azurewebsites.net \
 *   AUTH_TOKEN=$(az account get-access-token --resource api://<CLIENT_ID> --query accessToken -o tsv) \
 *   pnpm --filter @hbc/functions test:smoke
 *
 * NOTE: AUTH_TOKEN must be acquired for the Azure Functions API audience.
 * Using `az account get-access-token` without --resource returns an ARM token
 * that will NOT authenticate against the HB Intel API.
 */

const BASE_URL = process.env.SMOKE_TEST_BASE_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const IS_CI = !!process.env.CI;

/**
 * Skip/fail semantics (decision 14):
 *
 * - LOCAL + missing env vars → skip silently (expected for local dev)
 * - CI + missing env vars    → FAIL (CI must configure env)
 * - 401 response             → fail (operator error — token audience mismatch or expired)
 * - 5xx response             → fail (staging temporarily unavailable)
 * - Wrong shapes             → fail (actual contract failure)
 */
if (IS_CI && !BASE_URL) {
  throw new Error('CI requires SMOKE_TEST_BASE_URL to be set for smoke tests');
}
if (IS_CI && !AUTH_TOKEN) {
  throw new Error('CI requires AUTH_TOKEN to be set for smoke tests');
}

const skipReason = !BASE_URL
  ? 'SMOKE_TEST_BASE_URL not set — staging not targeted (local skip)'
  : !AUTH_TOKEN
    ? 'AUTH_TOKEN not set — auth not configured (local skip)'
    : undefined;

describe.skipIf(skipReason !== undefined)('Critical Path Smoke Tests (Staging)', () => {
  /**
   * Test 1: Health check (no auth required)
   * NOTE: P1-C1 catalog notes "Not found in repo" for GET /api/health.
   * This endpoint may not exist in staging. If it returns 404, this test should
   * be removed or adapted to whatever health/readiness probe C1 implements.
   * Decision 12 also confirms /api/auth/me as a smoke utility — see Test 2.
   */
  it('health check endpoint responds 200', async () => {
    const response = await fetch(`${BASE_URL}/api/health`);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });

  /**
   * Test 2: Auth token validation (diagnostic — runs before domain tests)
   * If this fails with 401, the token is likely ARM-scoped or expired.
   * Do NOT investigate domain contract failures until this test passes.
   */
  it('auth token is accepted by the API (not ARM-scoped)', async () => {
    const response = await fetch(`${BASE_URL}/api/leads?page=1&pageSize=1`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
    });

    if (response.status === 401) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        `AUTH_TOKEN rejected (401). Likely causes:\n` +
        `  - Token acquired without --resource api://<CLIENT_ID>\n` +
        `  - Token expired (MSAL tokens last ~1 hour)\n` +
        `  - Wrong tenant or missing scope grants\n` +
        `Response: ${JSON.stringify(body)}`
      );
    }

    // Any non-401 response means the token was accepted
    expect(response.status).not.toBe(401);
  });

  /**
   * Test 3: List leads with authentication
   */
  it('GET /api/leads with auth token responds 200', async () => {
    const response = await fetch(`${BASE_URL}/api/leads?page=1&pageSize=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(200);
    const body = await response.json();

    // Validate response conforms to schema
    expect(Array.isArray(body.items)).toBe(true);
    if (body.items.length > 0) {
      const parsed = LeadSchema.safeParse(body.items[0]);
      expect(parsed.success).toBe(true);
    }
  });

  /**
   * Test 4: Unauthenticated request is rejected
   */
  it('unauthenticated request to /api/leads responds 401', async () => {
    const response = await fetch(`${BASE_URL}/api/leads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.code).toBe('UNAUTHORIZED');
    expect(body.message).toBeDefined();
  });

  /**
   * Test 5: Create a lead
   */
  it('POST /api/leads creates and returns new lead', async () => {
    const createPayload = {
      title: `Test Lead ${Date.now()}`,
      stage: 'Identified',
      clientName: 'Smoke Test Client',
      estimatedValue: 1000000,
    };

    const response = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    expect(response.status).toBe(201);
    const body = await response.json();

    // { data: T } wrapper — see Locked Response-Envelope Convention
    const parsed = LeadSchema.safeParse(body.data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.title).toBe(createPayload.title);
      expect(parsed.data.stage).toBe('Identified');
    }

    // Return created lead id for subsequent tests
    return body.data.id;
  });

  /**
   * Test 6: Retrieve created lead
   */
  it('GET /api/leads/{id} returns created lead', async () => {
    // Create a lead first
    const createPayload = {
      title: `Test Lead Retrieve ${Date.now()}`,
      stage: 'Identified',
      clientName: 'Retrieve Test Client',
      estimatedValue: 500000,
    };

    const createResponse = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    const created = await createResponse.json();
    const leadId = created.data.id;

    // Now fetch the created lead
    const getResponse = await fetch(`${BASE_URL}/api/leads/${leadId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });

    expect(getResponse.status).toBe(200);
    const body = await getResponse.json();

    const parsed = LeadSchema.safeParse(body.data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.id).toBe(leadId);
    }
  });

  /**
   * Test 7: Update a lead
   */
  it('PUT /api/leads/{id} updates and returns lead', async () => {
    // Create a lead
    const createPayload = {
      title: `Test Lead Update ${Date.now()}`,
      stage: 'Identified',
      clientName: 'Update Test Client',
      estimatedValue: 750000,
    };

    const createResponse = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    const created = await createResponse.json();
    const leadId = created.data.id;

    // Update the lead
    const updatePayload = {
      stage: 'Bidding',
      estimatedValue: 3000000,
    };

    const updateResponse = await fetch(`${BASE_URL}/api/leads/${leadId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    expect(updateResponse.status).toBe(200);
    const body = await updateResponse.json();

    const parsed = LeadSchema.safeParse(body.data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.stage).toBe('Bidding');
      expect(parsed.data.estimatedValue).toBe(3000000);
    }
  });

  /**
   * Test 8: Delete a lead
   */
  it('DELETE /api/leads/{id} removes lead', async () => {
    // Create a lead
    const createPayload = {
      title: `Test Lead Delete ${Date.now()}`,
      stage: 'Identified',
      clientName: 'Delete Test Client',
      estimatedValue: 250000,
    };

    const createResponse = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    const created = await createResponse.json();
    const leadId = created.data.id;

    // Delete the lead
    const deleteResponse = await fetch(`${BASE_URL}/api/leads/${leadId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });

    expect(deleteResponse.status).toBe(204);

    // Verify lead is deleted (should return 404)
    const getResponse = await fetch(`${BASE_URL}/api/leads/${leadId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });

    expect(getResponse.status).toBe(404);
  });

  /**
   * Test 9: Project creation flow
   */
  it('POST /api/projects creates and returns new project', async () => {
    const createPayload = {
      name: `Test Project ${Date.now()}`,
      number: `PRJ-TST${Date.now()}`,
      status: 'Planning',
      startDate: '2026-04-01T00:00:00Z',
      endDate: '2026-12-31T00:00:00Z',
    };

    const response = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    expect(response.status).toBe(201);
    const body = await response.json();

    // { data: T } wrapper — see Locked Response-Envelope Convention
    const parsed = ActiveProjectSchema.safeParse(body.data);
    expect(parsed.success).toBe(true);
  });

  /**
   * Test 10: Search leads
   */
  it('GET /api/leads/search?q= returns matching leads', async () => {
    const response = await fetch(`${BASE_URL}/api/leads/search?q=test&page=1&pageSize=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(200);
    const body = await response.json();

    // Search returns paged collection — same shape as GET /api/leads
    expect(Array.isArray(body.items)).toBe(true);
    expect(typeof body.total).toBe('number');
    expect(typeof body.page).toBe('number');
    expect(typeof body.pageSize).toBe('number');
  });
});
```

**Task 8 Verification** (see [Task 8 Readiness Gate](#task-8-readiness-gate-staging-smoke-tests) for prerequisites):

**Running smoke tests:**

Local (skips automatically — `skipReason` fires when env vars are absent):
```bash
pnpm --filter @hbc/functions test:smoke
```

Against staging (developer — interactive token acquisition):
```bash
export SMOKE_TEST_BASE_URL=https://hb-intel-stage.azurewebsites.net
export AUTH_TOKEN=$(az account get-access-token --resource api://<CLIENT_ID> --query accessToken -o tsv)
pnpm --filter @hbc/functions test:smoke
```

CI pipeline: set `SMOKE_TEST_BASE_URL` and `AUTH_TOKEN` as pipeline secrets/variables. Token must be acquired per-run with correct API audience scope — see "Smoke test authentication policy" above.

**Interpreting results:**
- All tests skip → env vars not set (expected for local dev; **fails in CI** per decision 14)
- Auth diagnostic test fails (401) → token audience mismatch or expired (operator error, not contract failure)
- Domain tests fail with 5xx → staging temporarily unavailable (retry)
- Domain tests fail with wrong shapes → actual contract failure (investigate)

**Commit:** `test(backend): add critical path smoke tests for staging (P1-E1 Task 8)`

### Task 9: Telemetry Baseline Verification

**Status:** **BLOCKED** on C3 + staging infrastructure — see [Open Decision and Blocker Ledger](#open-decision-and-blocker-ledger) (C3, Staging infra)

**Objective:** Define the telemetry evidence model and document how E1 smoke tests contribute to C3 verification.

**Telemetry verification approach (aligned to C3 section 2.5 and B2 gate model):**

- Phase 1 telemetry evidence requires **correlated signals** across three Application Insights tables: `requests`, `dependencies`, and `traces`.
- Smoke tests produce the **traffic** that generates telemetry; they do NOT assert telemetry programmatically.
- Telemetry verification is a **manual gate step** — engineers run KQL queries after smoke tests to confirm expected signals appear across all three tables.
- E1's contribution: generate traffic scenarios + document expected telemetry signals per scenario.
- E1's contribution does NOT include: automated Application Insights query assertions in test code, dashboard creation, or alert configuration.

**Gate-evidence alignment:**

| B2 Gate | What E1 Contributes | Telemetry Verified By |
|---|---|---|
| `STAGING_READY` | Smoke tests generate traffic producing correlated signals in `requests`, `dependencies`, and `traces` tables | Manual KQL verification across all three tables after test run |
| `PROD_ACTIVE` | Same smoke tests re-run against production | Full C3 2.5 checklist (dashboards, alerts, health probe, startup guard) — NOT E1's scope |

**Mock-mode evidence invalidation (B2 policy):**
Telemetry evidence gathered while the adapter runs in mock mode does NOT count toward gate progression. E1 telemetry baseline tests must run against a **real staging deployment** with `adapterMode: 'proxy'`. Mock-mode test runs are useful for development but produce no gate-creditable evidence.

**E1 telemetry event classification:**

| C3 Event | Produced by E1 Smoke Test? | Mandatory for STAGING_READY? | Dependency |
|---|---|---|---|
| `handler.invoke` | Yes (all 4 scenarios) | **Yes** | C1 route handlers |
| `handler.success` | Yes (200 scenario) | **Yes** | C1 route handlers |
| `handler.error` | Yes (401, 404, 422 scenarios) | **Yes** | C1 route handlers |
| `auth.bearer.validate` | Yes (all 4 scenarios) | **Yes** | C2 auth middleware |
| `auth.bearer.success` | Yes (200, 404, 422 scenarios) | **Yes** | C2 auth middleware |
| `auth.bearer.error` | Yes (401 scenario) | **Yes** | C2 auth middleware |
| `proxy.request.start` | Indirectly (if staging uses proxy adapter) | Yes (for proxy domains) | B1 proxy adapter |
| `proxy.request.success` | Indirectly (200 scenario) | Yes (for proxy domains) | B1 proxy adapter |
| `proxy.request.error` | Indirectly (error scenarios) | Yes (for proxy domains) | B1 proxy adapter |
| `proxy.request.retry` | No — D1 retry not implemented | **No** — deferred | D1 |
| `circuit.state.change` | No — circuit breaker deferred | **No** — deferred | D1 |
| `auth.obo.*` | No — separate verification | Non-blocking Phase 1 | C2 |
| `deploy.smoke.pass` | No — PROD_ACTIVE gate only | **No** — PROD_ACTIVE only | Deployment pipeline |

#### Telemetry Gate Evidence

Smoke tests generate the traffic; operators verify the correlated evidence manually across three Application Insights tables:

| AI Table | What It Proves | Example Signal |
|---|---|---|
| `requests` | HTTP requests are logged with status codes, durations, and route metadata | `GET /api/leads` → 200, 15ms |
| `dependencies` | Downstream calls (database, external APIs) are tracked with success/failure and timing | SQL query to leads table → 200, 8ms |
| `traces` | Application-level lifecycle events (handler invoke/success/error, auth flow) are emitted | `handler.invoke`, `auth.bearer.success` |

**Checking only `traces` is NOT sufficient for STAGING_READY.** A healthy deployment must show correlated signals: a `requests` entry for the inbound HTTP call, `dependencies` entries for any downstream calls, and `traces` entries for the application lifecycle events — all sharing the same `operation_Id` for a given request.

E1 does NOT build automated Application Insights query assertions in test code. Telemetry verification is a manual gate step using KQL queries after smoke test traffic is generated.

**Files to Create:**
- `backend/functions/src/test/smoke/telemetry-baseline.smoke.test.ts`

**Full Code:**

**File: `backend/functions/src/test/smoke/telemetry-baseline.smoke.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';

/**
 * Telemetry baseline smoke tests for staging.
 *
 * BLOCKED: Requires C3 (instrumentation) + staging infrastructure.
 *
 * These tests produce traffic against staging endpoints. They do NOT assert
 * telemetry programmatically — telemetry verification is a manual gate step
 * using KQL queries against Application Insights (see C3 section 2.5).
 *
 * After running these tests, verify telemetry in Azure Portal using:
 *
 *   traces
 *   | where timestamp > ago(5m)
 *   | where customDimensions.requestId == "<captured-request-id>"
 *   | order by timestamp asc
 *   | project timestamp, message, customDimensions
 *
 * Expected C3 telemetry events per scenario (from C3 section 2.1):
 *
 *   Successful GET:
 *     handler.invoke → auth.bearer.validate → auth.bearer.success → handler.success
 *     (proxy.request.start → proxy.request.success if proxy adapter is in the path)
 *
 *   404 Not Found:
 *     handler.invoke → auth.bearer.validate → auth.bearer.success → handler.error (status: 404)
 *
 *   401 Unauthorized (no/invalid token):
 *     handler.invoke → auth.bearer.validate → auth.bearer.error → handler.error (status: 401)
 *
 *   422 Validation Error:
 *     handler.invoke → auth.bearer.validate → auth.bearer.success → handler.error (status: 422)
 *
 * Mandatory Phase 1 events (must appear for STAGING_READY):
 *   handler.invoke, handler.success, handler.error
 *   auth.bearer.validate, auth.bearer.success, auth.bearer.error
 *
 * Non-blocking / deferred (NOT required for STAGING_READY):
 *   proxy.request.retry (D1 dependent)
 *   circuit.state.change, circuit.fallback.used (D1 dependent)
 *   auth.obo.* (C2 dependent, verified separately)
 *   deploy.smoke.pass (PROD_ACTIVE gate only)
 *
 * Usage:
 *   SMOKE_TEST_BASE_URL=https://hb-intel-stage.azurewebsites.net \
 *   AUTH_TOKEN=$(az account get-access-token --resource api://<CLIENT_ID> --query accessToken -o tsv) \
 *   pnpm --filter @hbc/functions test:smoke
 */

const BASE_URL = process.env.SMOKE_TEST_BASE_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const IS_CI = !!process.env.CI;

// Same skip/fail semantics as critical-paths smoke tests (decision 14)
if (IS_CI && !BASE_URL) {
  throw new Error('CI requires SMOKE_TEST_BASE_URL to be set for telemetry baseline tests');
}
if (IS_CI && !AUTH_TOKEN) {
  throw new Error('CI requires AUTH_TOKEN to be set for telemetry baseline tests');
}

const skipReason = !BASE_URL
  ? 'SMOKE_TEST_BASE_URL not set — staging not targeted (local skip)'
  : !AUTH_TOKEN
    ? 'AUTH_TOKEN not set — auth not configured (local skip)'
    : undefined;

describe.skipIf(skipReason !== undefined)('Telemetry Baseline (Staging)', () => {
  /**
   * Produce traffic for a successful request trace.
   * Expected C3 events: handler.invoke → auth.bearer.success → handler.success
   */
  it('GET /api/leads produces successful request trace', async () => {
    const response = await fetch(`${BASE_URL}/api/leads?page=1&pageSize=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(200);
    // Expected AI traces: handler.invoke + auth.bearer.success + handler.success
  });

  /**
   * Produce traffic for a not-found trace.
   * Expected C3 events: handler.invoke → auth.bearer.success → handler.error (status: 404)
   */
  it('GET /api/leads/{unknown-id} produces not-found trace', async () => {
    const response = await fetch(
      `${BASE_URL}/api/leads/99999`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
      }
    );

    expect(response.status).toBe(404);
    // Expected AI traces: handler.invoke + auth.bearer.success + handler.error (404)
  });

  /**
   * Produce traffic for an authorization failure trace.
   * Expected C3 events: handler.invoke → auth.bearer.error → handler.error (status: 401)
   */
  it('GET /api/leads without auth produces authorization failure trace', async () => {
    const response = await fetch(`${BASE_URL}/api/leads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(401);
    // Expected AI traces: handler.invoke + auth.bearer.error + handler.error (401)
  });

  /**
   * Produce traffic for a validation failure trace.
   * Expected C3 events: handler.invoke → auth.bearer.success → handler.error (status: 422)
   */
  it('POST /api/leads with invalid payload produces validation error trace', async () => {
    const invalidPayload = {
      title: '',  // Empty title
      stage: 'invalid-stage',
      clientName: 'Test',
      estimatedValue: 0,
    };

    const response = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidPayload),
    });

    expect(response.status).toBe(422);
    // Expected AI traces: handler.invoke + auth.bearer.success + handler.error (422)
  });
});
```

**Post-run KQL verification (manual gate step):**

After running telemetry baseline tests against staging, verify in Azure Portal → Application Insights → Logs:

**Query 1: Confirm handler lifecycle events**
```kql
traces
| where timestamp > ago(15m)
| extend evt = tostring(parse_json(tostring(customDimensions))._telemetryType)
| where evt in ('handler.invoke', 'handler.success', 'handler.error')
| summarize count() by evt
| order by evt asc
```
Expected: All three event types present with count > 0.

**Query 2: Confirm auth flow events**
```kql
traces
| where timestamp > ago(15m)
| extend evt = tostring(parse_json(tostring(customDimensions))._telemetryType)
| where evt in ('auth.bearer.validate', 'auth.bearer.success', 'auth.bearer.error')
| summarize count() by evt
| order by evt asc
```
Expected: `auth.bearer.validate` and `auth.bearer.success` present (from authenticated tests); `auth.bearer.error` present (from 401 test).

**Query 3: Confirm request and dependency correlation**
```kql
requests
| where timestamp > ago(15m)
| where url has "/api/leads" or url has "/api/projects"
| project operation_Id, url, resultCode, duration
| join kind=leftouter (
    dependencies
    | where timestamp > ago(15m)
    | project operation_Id, dep_type=type, dep_target=target, dep_resultCode=resultCode
) on operation_Id
| order by operation_Id asc
```
Expected: Each smoke test request appears with its downstream dependencies. `operation_Id` links requests to their dependencies.

**STAGING_READY gate check:** All three queries must show expected results from a non-mock adapter run: Queries 1 and 2 confirm lifecycle events in `traces`, Query 3 confirms correlated `requests` and `dependencies`. Checking only `traces` is insufficient. Mock-mode runs do not produce gate-creditable evidence.

**Commit:** `test(backend): add telemetry baseline smoke tests (P1-E1 Task 9)`

### Task 10: Verify Test Suite Configuration and Run All Contract Tests

**Status:** **TARGET** — shared with D1 vitest prerequisite

**Files to Modify:**
- `packages/data-access/vitest.config.ts`
- `backend/functions/vitest.config.ts`

**Implementation:**

**File: `packages/data-access/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Include contract tests
    include: [
      'src/**/*.test.ts',
      'src/**/*.contract.test.ts',
    ],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.contract.test.ts', 'src/test-utils/**'],
    },
  },
});
```

**File: `backend/functions/vitest.config.ts`** — MODIFY existing config, do NOT replace

The current `backend/functions/vitest.config.ts` uses named projects with explicit include lists:
- `unit` project: explicit paths for provisioning saga, middleware, services, config, utils, state-machine tests
- `smoke` project: provisioning smoke tests only with 180s timeout

**Do NOT replace this config with a generic `src/**/*.test.ts` pattern** — this would break the current project-based test separation and coverage targeting.

**Required:** Add a dedicated `contract` project alongside the existing `unit` and `smoke` projects.

**Why a dedicated project, not expanding `unit`:** The backend's `vitest.config.ts` uses **explicit include lists per project** — there is no glob-based auto-discovery. Adding contract patterns to the `unit` project's include list would couple contract test prerequisites (C1 route handlers, `@hbc/data-access` dependency) to provisioning unit tests, risking breakage when contract test files exist but their dependencies haven't landed. A separate `contract` project keeps these concerns independent, matches the existing `unit`/`smoke` separation pattern, and enables `pnpm --filter @hbc/functions test:contract` as a standalone command.

```typescript
// Add to the projects array in backend/functions/vitest.config.ts:
{
  test: {
    name: 'contract',
    include: [
      'src/functions/**/*.contract.test.ts',
      'src/middleware/error-contract.test.ts',
    ],
  },
}
```

Add a corresponding script to `backend/functions/package.json`:
```json
"test:contract": "vitest run --config vitest.config.ts --project contract"
```

**Backend test scripts (CURRENT — no changes needed except adding `test:contract`):**

```json
{
  "scripts": {
    "test": "vitest run --config vitest.config.ts --project unit",
    "test:smoke": "SMOKE_TEST=true vitest run --config vitest.config.ts --project smoke",
    "test:coverage": "vitest run --config vitest.config.ts --project unit --coverage",
    "test:contract": "vitest run --config vitest.config.ts --project contract"
  }
}
```

**Verification** (see [Execution Sequence with Acceptance Criteria](#execution-sequence-with-acceptance-criteria) for prerequisites):

Run schema tests (requires `@hbc/models` vitest setup):
```bash
pnpm --filter @hbc/models test
```

Run frontend tests (requires `@hbc/data-access` vitest setup + B1 for contract tests):
```bash
pnpm --filter @hbc/data-access test
```

Run backend tests (requires C1 route handlers + vitest config update):
```bash
pnpm --filter @hbc/functions test
```

Run smoke tests (requires C1 + C2 + staging infra):
```bash
SMOKE_TEST_BASE_URL=https://hb-intel-stage.azurewebsites.net \
AUTH_TOKEN=$(az account get-access-token --resource api://<CLIENT_ID> --query accessToken -o tsv) \
pnpm --filter @hbc/functions test:smoke
```

Expected: All tests in each lane pass when their prerequisites are met.

**Commit:** `test: configure Vitest for contract and smoke test suites (P1-E1 Task 10)`

---

## Implementation Summary

| Chunk | Task | Deliverable | Tier | Readiness | Status |
|---|---|---|---|---|---|
| 1 | 2 | Add Zod to `@hbc/models/package.json` | — | Implementable now | **TARGET** |
| 1 | 10 (partial) | Vitest config for `@hbc/models` and `@hbc/data-access` | — | Implementable now (coordinate with D1) | **TARGET** |
| 1 | 1 | Contract schemas — Tier 1 (Lead, Project CRUD, Estimating tracker) | 1 | Implementable after Tasks 2 + 10 | **TARGET** |
| 1 | 1 | Contract schemas — Tier 2 (7 domains + aggregates, routes confirmed) | 2 | Schema skeletons with confirmed route paths; no full tests until C1 delivers handlers | **TARGET** (routes confirmed) |
| 1 | 1 | Auth capability-lane description (Tier 3) | 3 | Blocked — no schema until C2 publishes routes | **BLOCKED** on C2 (A9) |
| 2 | 3 | MSW server and handlers (Tier 1 domains only) | 1 | Implementable after Task 10 (partial) | **TARGET** |
| 2 | 4 | Adapter contract tests (Leads) | 1 | Blocked — B1 must deliver proxy repositories | **BLOCKED** on B1 |
| 2 | 5 | Adapter contract tests (Project, Estimating) | 1 | Blocked — B1 must deliver proxy repositories | **BLOCKED** on B1 |
| 3 | 6 | Route contract tests (Leads) | 1 | Blocked — C1 must deliver route handlers | **BLOCKED** on C1 |
| 3 | 7 | Error contract tests | — | Blocked — C1 must deliver error middleware | **BLOCKED** on C1 |
| 3 | 10 (final) | Backend vitest `contract` project + `test:contract` script | — | Blocked — Tasks 6-7 must exist first | **BLOCKED** on C1 |
| 4 | 8 | Smoke tests | — | Blocked — see Task 8 Readiness Gate | **BLOCKED** on C1 + C2 + staging |
| 4 | 9 | Telemetry baseline | — | Blocked — see Task 9 Readiness Gate | **BLOCKED** on C3 + staging |

---

## Execution Sequence with Acceptance Criteria

Follow this dependency-ordered sequence. Each task lists its prerequisites, verification, and pass/fail conditions.

| Step | Task | Prerequisites | Files to Change | Verification Command | Pass Condition | Still-Blocked If |
|---|---|---|---|---|---|---|
| 1 | 2 | None | `packages/models/package.json` | `pnpm --filter @hbc/models check-types` | Zod resolves; types pass | — |
| 2 | 10 (partial) | Task 2 | `packages/models/vitest.config.ts`, `packages/models/package.json`, `packages/data-access/vitest.config.ts`, `packages/data-access/package.json` | `pnpm --filter @hbc/models test`, `pnpm --filter @hbc/data-access test` | Vitest runs with no errors; test scripts exist | D1 coordination incomplete |
| 3 | 1 | Tasks 2, 10 (partial) | `packages/models/src/api-schemas/*.ts`, `packages/models/src/index.ts` | `pnpm --filter @hbc/models test` | All contract schema parse/reject tests pass | — |
| 4 | 3 | Task 10 (partial) | `packages/data-access/src/test-utils/*.ts`, `packages/data-access/src/msw/*.ts` | `pnpm --filter @hbc/data-access test` | MSW server starts; handlers registered; unhandled request errors | — |
| 5 | 4 | Tasks 1, 3 + **B1 merged** | `packages/data-access/src/adapters/proxy/lead-repository.contract.test.ts` | `pnpm --filter @hbc/data-access test` | Adapter responses parse against contract schemas | B1 not merged — `ProxyLeadRepository` does not exist |
| 6 | 5 | Tasks 1, 3 + **B1 merged** | `…/project-repository.contract.test.ts`, `…/estimating-repository.contract.test.ts` | `pnpm --filter @hbc/data-access test` | Adapter responses parse against contract schemas | B1 not merged |
| 7 | 6 | Task 1 + **C1 delivered** + `@hbc/data-access` in `backend/functions` devDependencies (type-only) | `backend/functions/src/functions/leads/leads.contract.test.ts`, `…/test-utils/mock-service-factory.ts`, `…/test-utils/mock-request.ts` | `pnpm --filter @hbc/functions test:contract` | All handler responses conform to contract schemas (success + error) | C1 not delivered — no route handlers |
| 8 | 7 | Task 1 + **C1 delivered** | `backend/functions/src/middleware/error-contract.test.ts` | `pnpm --filter @hbc/functions test:contract` | All HTTP error codes produce ErrorEnvelopeSchema-conformant output | C1 not delivered — no error middleware |
| 9 | 10 (final) | Tasks 6, 7 | `backend/functions/vitest.config.ts`, `backend/functions/package.json` | `pnpm --filter @hbc/functions test:contract` | `contract` project runs; `test:contract` script works | — |
| 10 | 8 | Tasks 1, 6, 7 + **C1 + C2 + staging** | `backend/functions/src/test/smoke/critical-paths.smoke.test.ts` | `SMOKE_TEST_BASE_URL=… AUTH_TOKEN=… pnpm --filter @hbc/functions test:smoke` | All smoke tests pass; transport shapes conform to contract schemas | See Task 8 Readiness Gate |
| 11 | 9 | Task 8 + **C3 deployed** | `backend/functions/src/test/smoke/telemetry-baseline.smoke.test.ts` | Same as Task 8 + manual KQL verification | Traffic produces expected C3 events; KQL confirms handler/auth lifecycle | See Task 9 Readiness Gate |

---

## Post-Implementation Update Protocol

When any E1 task is implemented or an upstream blocker resolves, the implementer **must** update this document:

1. **`Last Reviewed Against Repo Truth`** — update the date in the header metadata table
2. **Status markers** — change affected task statuses: BLOCKED → TARGET → CURRENT as appropriate
3. **Blocker Ledger (Table B)** — update resolved blockers; update Table A for resolved design decisions
4. **Readiness Gates** — update "Current Status" column for any prerequisite that is now met
5. **Implementation Summary** — update the Status and Readiness columns
6. **Execution Sequence** — mark completed steps

Failure to update this document after implementation creates drift that misleads future implementers.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Contract schema drift (frontend vs backend) | Medium | High | Single schema source in `@hbc/models/src/api-schemas/`; both sides validate against it |
| MSW handlers out of sync with backend | Medium | Medium | Handlers aligned with C1 route contracts; update when C1 changes |
| Auth token audience mismatch in smoke tests | Medium | High | Require `--resource api://<CLIENT_ID>` flag; see Task 8 auth token expectations |
| Staging environment downtime | Low | Medium | Smoke tests skip gracefully when `SMOKE_TEST_BASE_URL` absent |
| `contracts/` naming collision with business domain | — | — | **Resolved:** `api-schemas/` directory; see Naming Conflict Resolution |
| ~~Provisional transport shapes become stale~~ | ~~Medium~~ | ~~Medium~~ | **RESOLVED** — D1/D2/D3/D4/D5/D6/A8 all locked; no provisional transport shapes remain |
| ~~Transport shape field naming (D3) changes~~ | ~~Medium~~ | ~~Medium~~ | **RESOLVED** — D3 locked: `message` field confirmed |

---

## Next Steps

After upstream dependencies deliver:

1. **B1 lands** → implement Tasks 4–5 (adapter contract tests)
2. **C1 lands** → implement Tasks 6–7 (route contract tests + error contract tests)
3. **C1 + C2 + staging ready** → implement Task 8 (smoke tests)
4. **C3 lands** → implement Task 9 (telemetry baseline traffic generation)
5. **All tasks pass** → update `current-state-map.md` and package READMEs

---

## Definition of Ready for Execution

Before handing any E1 task to an implementation agent, confirm:

**Task readiness:**
- [ ] The task's status is **TARGET** (not BLOCKED)
- [ ] All prerequisites in the Execution Sequence with Acceptance Criteria table are met
- [ ] The Readiness Gate (if applicable for Tasks 8-9) shows all prerequisites as MET
- [ ] The Blocker Ledger reflects current upstream status
- [ ] The implementer knows which vitest project and command to use for verification

**Document currency:**
- [ ] The `Last Reviewed Against Repo Truth` date is within 7 days
- [ ] The implementer has read the Execution Guardrails section (including no-placeholder-scaffolding rule)

**Decision reconciliation (confirmed 2026-03-18):**
- [x] All transport-layer decisions are locked (D1–D6, A8 resolved; see Locked Decisions Applied)
- [x] All code examples use `{ data: T }` wrapper for single-item responses
- [x] All code examples use `message` field (not `error`) in ErrorEnvelopeSchema
- [x] Blocked work is clearly bounded — no speculative tests or placeholder suites
- [x] Smoke test input policy is explicit (skip locally, fail in CI)
- [x] Telemetry gate evidence requires `requests` + `dependencies` + `traces` correlation
- [x] `/api/auth/me` is scoped as smoke-test-only utility, not a contract test lane
- [x] Canonical domain interfaces (`@hbc/models`) are distinguished from derived contract schemas
- [x] No remaining agent-facing ambiguity on Phase 1 contract shapes
