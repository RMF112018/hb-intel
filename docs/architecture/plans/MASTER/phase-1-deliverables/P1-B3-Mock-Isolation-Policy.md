# P1-B3: Mock Isolation Policy

| Field | Value |
|---|---|
| **Doc ID** | P1-B3 |
| **Phase** | Phase 1 |
| **Workstream** | B — Adapter Completion |
| **Document Type** | Governance Policy |
| **Owner** | Frontend Platform Team / Data Access Maintainer |
| **Update Authority** | B-workstream lead; changes require review by DevOps and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-18 |
| **References** | P1-B1 (Engineering Plan), P1-B2 (Adapter Completion Backlog), P1-C2 (Auth Hardening), P1-E1 (Contract Test Suite) |

---

## Policy Statement

Mock adapters must not appear in any production-facing data flow. All production and staging environments must use real adapters (proxy, sharepoint, or api). There is no acceptable scenario in which mock data serves real users or real business decisions. A mock adapter detected in production constitutes an incident requiring immediate response.

---

## Policy Scope

### This policy governs

- When mock adapters may be used (development, unit tests, CI test runs)
- When mock adapters are prohibited (staging, production)
- How adapter mode is resolved and enforced at runtime
- How test lanes are governed across the Phase 1 gate progression
- How production rollout is governed with respect to mock isolation

### This policy does NOT govern

- Adapter implementation details — see `P1-B1-Proxy-Adapter-Implementation-Plan.md`
- Adapter completion tracking and gate checklists — see `P1-B2-Adapter-Completion-Backlog.md`
- Backend auth and OBO configuration — see P1-C2
- Contract test harness design — see P1-E1

---

## Definitions

| Term | Meaning |
|---|---|
| **Adapter mode** | The `HBC_ADAPTER_MODE` value that controls which adapter implementation the factory returns: `'mock'`, `'proxy'`, `'sharepoint'`, or `'api'` |
| **Mock isolation** | The principle that mock adapters must only be used in controlled contexts where no real user data or production behavior is at stake |
| **Production-facing flow** | Any code path where user actions result in data reads or writes that affect real business state |
| **Test lane** | A category of test execution with its own adapter mode and environment constraints |
| **Deployment environment** | The infrastructure target (local, CI, staging, production) with its own adapter mode requirements |
| **Production-active** | Per B2 — a domain whose mock fallback is removed and live traffic is verified |

---

## Policy Precedence

- **B3** governs adapter mode selection and mock isolation enforcement
- **B1** governs adapter implementation; **B2** governs adapter completion tracking and gate checklists
- Where B3 and B2 conflict on what constitutes "production-active," B2's gate definitions take precedence
- **C2** governs auth configuration; B3 does not override auth mode decisions
- **E1** governs contract test design; B3 defines which test lanes require which adapter modes

---

## Lane 1: Adapter Mode Governance

### How Adapter Mode Is Resolved

**Factory behavior** (`packages/data-access/src/factory.ts`):
- `resolveAdapterMode()` reads `process.env.HBC_ADAPTER_MODE`
- Returns `'proxy'`, `'sharepoint'`, or `'api'` if the env var matches one of those values
- Falls back to `'mock'` if the env var is unset or unrecognized
- Each domain's `create{Domain}Repository(mode?)` factory function delegates to `resolveAdapterMode()` when no explicit mode is passed

**Vite build-time injection** (`apps/pwa/vite.config.ts`):
- Vite injects `process.env.HBC_ADAPTER_MODE` as a build-time string literal
- Reads `VITE_ADAPTER_MODE` from the build environment
- Defaults to `'mock'` when Vite mode is `'development'`; defaults to `'proxy'` for all other build modes (including production)
- This means production PWA builds will use `'proxy'` by default even if the env var is unset at build time

**Backend** (`backend/functions/src/index.ts`):
- Azure Functions read `HBC_ADAPTER_MODE` from app settings (configured per deployment slot)
- No build-time injection; the value is resolved at runtime from the Azure app settings environment

### Runtime Environment Detection

The startup guard needs to know whether mock mode is permissible. Each surface detects its environment differently:

**Layer 1 — Adapter mode** (`HBC_ADAPTER_MODE`): The primary policy variable. Controls which adapter the factory returns. This is the value the startup guard checks.

**Layer 2 — Deployment environment detection:**

| Surface | How environment is detected | Notes |
|---|---|---|
| **PWA (Vite)** | Build-time via Vite mode. Production builds inject `'proxy'` as a string literal into the bundle. There is no runtime env var check in the browser. | The guard validates the build-time-injected value. |
| **Backend (Azure Functions)** | Runtime via `AZURE_FUNCTIONS_ENVIRONMENT` — set automatically by Azure to `'Production'` in production slots, `'Development'` locally. | Already used in repo: `backend/functions/src/functions/provisioningSaga/index.ts` gates on this variable. |

**Layer 3 — Adapter mode override** (future): Per-domain overrides are an open decision (see B2 Factory Wiring). Not yet implemented.

**What NOT to use for environment detection:**
- Do not rely solely on `NODE_ENV` in the browser — Vite does not expose it at runtime the same way Node.js does
- Do not assume `NODE_ENV='staging'` exists — there is no such standard value; Azure Functions uses `AZURE_FUNCTIONS_ENVIRONMENT` for environment discrimination
- The adapter mode itself is the primary policy variable; environment detection is only needed for the startup guard to determine whether mock mode is permissible

### Environment → Adapter Mode Rules

| Environment | Detection | Required Adapter Mode | Mock Allowed? | Enforcement |
|---|---|---|---|---|
| **Local development** | Vite dev mode / `AZURE_FUNCTIONS_ENVIRONMENT='Development'` | `'mock'` (default) | Yes — developer may override | None (developer's choice) |
| **CI — unit tests** | CI pipeline config | `'mock'` | Yes — required for isolation | CI pipeline config |
| **CI — mocked-proxy tests** | CI pipeline config | `'mock'` fetch layer | Yes — proxy tested against mocked fetch | CI pipeline config |
| **CI — contract tests** | CI pipeline config | `'proxy'` against test backend | No | CI pipeline config + test backend |
| **Staging** | Azure slot config / Vite production build | `'proxy'` (or other real adapter) | **No** | Startup guard + deployment gate |
| **Production** | `AZURE_FUNCTIONS_ENVIRONMENT='Production'` / Vite production build | `'proxy'` (or other real adapter) | **No — zero tolerance** | Startup guard + deployment gate |
| **Demo / sandbox** | Explicit labeling | `'mock'` if no customer data | Conditional | Labeling requirement |

---

## Lane 2: Test Lane Governance

Phase 1 requires a progression from mocked execution through real-backend validation. The test policy must support all four lanes without blocking later gates.

### Test Lane 1: Unit Tests

- **Adapter mode:** `'mock'`
- **Purpose:** Fast, isolated tests of business logic and adapter interface compliance
- **Data source:** In-memory mock stores with seed data (`SEED_LEADS`, `SEED_PROJECTS`, etc.)
- **Reset:** Call `resetAllMockStores()` in `beforeEach` — note this resets the mock ID counter only, not in-memory store contents; create a fresh repository instance per test for full isolation
- **Network:** None — no fetch, no HTTP, no external calls
- **Factory usage:** Individual factory functions (`createProjectRepository()`, `createLeadRepository()`, etc.) — there is no generic `getRepository()` function

### Test Lane 2: Mocked-Proxy Tests

- **Adapter mode:** `'proxy'` with mocked `fetch` (per B1 engineering plan)
- **Purpose:** Validate proxy adapter implementations against mocked HTTP responses
- **Data source:** Mocked fetch returning typed response envelopes
- **Network:** Mocked — no real HTTP calls
- **B1 cross-ref:** This is the primary test strategy for B1 Tasks 3–10 (`CODE_COMPLETE_MOCK` gate)

### Test Lane 3: Contract Tests (E1)

- **Adapter mode:** `'proxy'` against a deployed test or staging backend
- **Purpose:** Validate that adapter behavior matches real backend response contracts
- **Data source:** Real backend responses validated against Zod schemas
- **Network:** Real HTTP calls to a test Azure Functions instance
- **E1 cross-ref:** E1 owns the contract test harness; B3 defines that this lane must use a real adapter
- **B2 cross-ref:** Required for `STAGING_READY` gate

### Test Lane 4: Staging E2E

- **Adapter mode:** `'proxy'` with real auth (MSAL) against staging backend
- **Purpose:** Full user workflow validation in a production-like environment
- **Data source:** Staging backend with test data
- **Network:** Real HTTP with real auth tokens
- **C2 cross-ref:** Requires C2 auth middleware to be operational

---

## Lane 3: Deployment Environment Governance

### Startup Guard

A startup guard must assert that mock mode is not active in protected environments. This guard runs early in application initialization.

**Implementation target:** `packages/data-access/src/config/adapter-mode-guard.ts` (to be created per B3 scope)

**Frontend startup guard** (`apps/pwa/src/main.tsx`):
- Checks the build-time-injected `process.env.HBC_ADAPTER_MODE` value (set by Vite `define` block)
- If the value is `'mock'` and the build was not a development build, throws a fatal error preventing render
- In practice, Vite's config already defaults non-dev builds to `'proxy'`, so this guard is a defense-in-depth safety net against misconfigured build environments
- Logs the resolved adapter mode for observability

**Backend startup guard** (`backend/functions/src/index.ts`):
- Checks `process.env.HBC_ADAPTER_MODE` against the deployment environment
- Uses `AZURE_FUNCTIONS_ENVIRONMENT` to determine whether mock is permissible (repo truth: this variable is already used in `backend/functions/src/functions/provisioningSaga/index.ts` for production gating)
- If `AZURE_FUNCTIONS_ENVIRONMENT` is `'Production'` (or a staging slot) and `HBC_ADAPTER_MODE` resolves to `'mock'`, throws a fatal error preventing function registration
- Logs the resolved adapter mode and environment for observability

### Deployment Gate

A pre-deployment check must validate that the target environment's configuration does not include `HBC_ADAPTER_MODE='mock'` before allowing deployment to staging or production.

**Implementation:** CI/CD pipeline step that reads the deployment configuration and fails the pipeline if mock mode is detected.

**Scope:** Azure Functions app settings for backend; Vite build env for frontend.

---

## Lane 4: Production Rollout Governance

### Core Rule

Production rollout must ensure that every activated domain uses a real adapter. Mock fallback is never acceptable in production, even as a "safe default" during gradual rollout.

### What This Means for Gradual Rollout

If domains are activated incrementally (e.g., Lead and Project go live before Schedule), the rollout strategy must ensure:
- Activated domains use `'proxy'` (or another real adapter)
- Non-activated domains either throw `AdapterNotImplementedError` (current factory behavior) or are gated at the application layer to prevent user access
- Under no circumstances does a non-activated domain silently fall back to mock data in production

### Domain-Level Adapter Overrides

Per-domain adapter mode overrides (e.g., `HBC_ADAPTER_MODE_LEADS`) are an **open decision** — see B2 [Factory Wiring open decision](#). If implemented:
- Overrides may only select between real adapter types (`'proxy'`, `'sharepoint'`, `'api'`)
- An override value of `'mock'` in production must be rejected by the startup guard
- The naming convention, governance model, and implementation approach must be approved before use

### B2 Cross-Reference

A domain reaches `PROD_ACTIVE` (per B2) only when:
- Mock fallback is removed for that domain
- Live traffic is verified in production
- Monitoring and error reporting are confirmed

This policy enforces the prerequisite: mock must be unreachable in the production code path for that domain.

---

## Exception Policy

### Production: No Exceptions

There is no approved exception for mock adapters in production. If mock data is detected serving production traffic, this is an incident (see Incident Response below).

### Staging: Time-Boxed Exception Only

A temporary mock exception in staging may be approved under these conditions:
- **Approval required from:** B-workstream lead AND DevOps lead
- **Maximum duration:** 5 business days
- **Documentation:** Written justification, affected domains, expiry date, rollback plan
- **Monitoring:** The exception must be visible in startup logs and deployment dashboards

### Demo / Sandbox

Mock adapters are permitted in demo or sandbox environments if:
- No customer data is involved
- The environment is clearly labeled as "demo" in both UI and logs
- The environment is not reachable from production networks

---

## Ownership and Accountability

| Role | Responsibility |
|---|---|
| **Data Access Maintainer** | Owns startup guard implementation, factory adapter mode resolution, adapter README docs |
| **Backend Platform Owner** | Ensures Azure Functions app settings are correctly configured per environment |
| **DevOps / Release Engineer** | Owns deployment gate configuration; validates adapter mode before staging/production deployment |
| **QA Lead** | Verifies CI test lane configuration; coordinates multi-lane test strategy |
| **B-workstream Lead** | Approves staging mock exceptions; owns policy updates |
| **Architecture** | Reviews policy changes; approves domain-level override design if proposed |

### Incident Response: Mock Detected in Production

If mock adapter usage is detected in a production environment:
1. **Immediate:** Alert DevOps and B-workstream lead
2. **Triage:** Determine scope — which domains, which users, how long
3. **Remediate:** Deploy correct adapter configuration; verify real adapters are active
4. **Root cause:** Identify how mock mode reached production (configuration drift, missing guard, build error)
5. **Follow-up:** Update deployment gates or startup guards to prevent recurrence; document in incident log

---

## Policy Enforcement Checklist

- [ ] `assertAdapterModeForEnvironment()` implemented in `packages/data-access/src/config/adapter-mode-guard.ts`
- [ ] Startup guard called in `apps/pwa/src/main.tsx` before first repository call
- [ ] Startup guard called in `backend/functions/src/index.ts` before function registration
- [ ] Vite config defaults to `'proxy'` for non-development builds (verified in `apps/pwa/vite.config.ts`)
- [ ] CI pipeline configures adapter mode per test lane (mock for unit, proxy for contract tests)
- [ ] Deployment gate rejects `HBC_ADAPTER_MODE='mock'` for staging and production targets
- [ ] Staging and production Azure Functions app settings have `HBC_ADAPTER_MODE='proxy'`
- [ ] No domain-level override uses `'mock'` in staging or production (if override mechanism is implemented)
- [ ] Local development `.env` files are in `.gitignore` and not committed
- [ ] Adapter mode is logged at startup in all environments for observability
