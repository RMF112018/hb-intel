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

Mock adapters must not appear in any production-facing data flow. All production environments must use real adapters (proxy, sharepoint, or api) with no exceptions. Staging environments must use real adapters under normal operations; a time-boxed emergency exception requires dual approval from B-workstream lead and DevOps lead (see Exception Approval Authority). There is no acceptable scenario in which mock data serves real users or real business decisions. A mock adapter detected in production constitutes an incident requiring immediate response.

---

## Policy Scope

### This policy governs

- When mock adapters may be used (development, unit tests, CI test runs)
- When mock adapters are prohibited (production — absolute; staging — default, with documented emergency exception)
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

## Canonical Adapter-Mode Vocabulary

### Canonical Values

Source of truth: `AdapterMode` type in `packages/data-access/src/factory.ts`

| Value | Meaning | Phase Target |
|---|---|---|
| `'mock'` | In-memory seed data; no external calls | All phases — dev/test only in protected environments |
| `'proxy'` | Azure Functions backend via Bearer token (OBO) | Phase 1 |
| `'sharepoint'` | Direct PnPjs calls on SPFx surface | Future |
| `'api'` | Direct Azure SQL / REST | Future |

These four values are the only recognized adapter modes. Any other value (including `'real'`) causes `resolveAdapterMode()` to fall back to `'mock'`.

### Canonical Environment Variable Names

| Variable | Surface | Purpose |
|---|---|---|
| `HBC_ADAPTER_MODE` | Backend (runtime), Frontend (build-time injected) | Primary adapter mode variable read by `resolveAdapterMode()` |
| `VITE_ADAPTER_MODE` | Frontend build environment only | Vite reads this at build time; injects it as `process.env.HBC_ADAPTER_MODE` in the PWA bundle |

All policy rules, enforcement layers, and configuration guidance in this document use these canonical names and values exclusively.

### Tracked Remediation: Backend Adapter-Mode Vocabulary

**Classification:** Phase 1 prerequisite for complete mock-isolation enforcement.
**Status:** Not yet remediated.
**Owner:** Backend Platform Owner.

The following repo locations use non-canonical vocabulary that creates enforcement and configuration risk:

| Location | Issue | Risk |
|---|---|---|
| `backend/functions/src/services/service-factory.ts` (line 37) | Defaults to `'real'` — not in `AdapterMode` type | Backend service factory uses a value the frontend factory does not recognize; if `HBC_ADAPTER_MODE` is unset in production, the backend defaults to `'real'` while the frontend `resolveAdapterMode()` would fall back to `'mock'` — creating split-surface behavior |
| `backend/functions/README.md` (line 62) | Documents `'real'` as a valid adapter mode | Developers may set `HBC_ADAPTER_MODE='real'` in Azure app settings, which is not a canonical value and would not be caught by a startup guard checking for `'mock'` |

**Why this blocks enforcement closure:**
- The startup guard validates `HBC_ADAPTER_MODE` against canonical values. If the backend uses `'real'` instead of `'proxy'`, the guard cannot distinguish "correct real adapter" from "unrecognized value that should be rejected."
- Configuration templates and developer docs that reference `'real'` will cause ongoing drift even after the guard is implemented.
- The split default behavior (frontend→`'mock'`, backend→`'real'`) means a missing `HBC_ADAPTER_MODE` config produces different behavior per surface — the exact class of misconfiguration this policy exists to prevent.

**Required remediation:**
1. Update `backend/functions/src/services/service-factory.ts` to use `'proxy'` instead of `'real'` (or add an explicit `'real'` → `'proxy'` mapping)
2. Update `backend/functions/README.md` to use canonical vocabulary
3. Update `backend/functions/local.settings.example.json` if it references `'real'`
4. Verify no other backend files reference `'real'` as an adapter mode

This remediation must be completed before the backend startup guard (Layer 2) can be considered fully effective.

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
- **Implementation note:** The current entrypoint is pure side-effect imports (`import './functions/proxy/index.js'` etc.) which trigger function registration immediately on module load. ES module imports are hoisted and execute before any module-level code. A startup guard cannot be inserted "before" these imports without restructuring — see Layer 2 in Enforcement Layers for the engineering requirement.

### Runtime Environment Detection

The startup guard needs to know whether mock mode is permissible. Each surface detects its environment differently:

**Primary variable — Adapter mode** (`HBC_ADAPTER_MODE`): Controls which adapter the factory returns. This is the value the startup guard checks.

**Environment detection:**

| Surface | How environment is detected | Notes |
|---|---|---|
| **PWA (Vite)** | Build-time via Vite mode. Production builds inject `'proxy'` as a string literal into the bundle. There is no runtime env var check in the browser. | The guard validates the build-time-injected value. |
| **Backend (Azure Functions)** | Runtime via `AZURE_FUNCTIONS_ENVIRONMENT` — set automatically by Azure to `'Production'` in production slots, `'Development'` locally. | Already used in repo: `backend/functions/src/functions/provisioningSaga/index.ts` gates on this variable. |

**Per-domain override** (future): Per-domain overrides are an open decision (see B2 Factory Wiring). Not yet implemented.

**What NOT to use for environment detection:**
- Do not rely solely on `NODE_ENV` in the browser — Vite does not expose it at runtime the same way Node.js does
- Do not assume `NODE_ENV='staging'` exists — there is no such standard value; Azure Functions uses `AZURE_FUNCTIONS_ENVIRONMENT` for environment discrimination
- The adapter mode itself is the primary policy variable; environment detection is only needed for the startup guard to determine whether mock mode is permissible

### Environment → Adapter Mode Rules

| Environment | Detection | Required Adapter Mode | Mock Allowed? | Enforcement |
|---|---|---|---|---|
| **Local development** | Vite dev mode / `AZURE_FUNCTIONS_ENVIRONMENT='Development'` | `'mock'` (default) | Yes — developer may override | None (developer's choice) |
| **CI — unit tests** | CI pipeline config | `'mock'` | Yes — required for isolation | CI pipeline config |
| **CI — mocked-proxy tests** | CI pipeline config | `'proxy'` (mocked fetch) | Yes (fetch layer only) | CI pipeline config |
| **CI — contract tests** | CI pipeline config | `'proxy'` against test backend | No | CI pipeline config + test backend |
| **Staging** | Azure slot config / Vite production build | `'proxy'` (or other real adapter) | **No** (emergency exception only — see Exception Approval Authority) | Startup guard + deployment gate |
| **Production** | `AZURE_FUNCTIONS_ENVIRONMENT='Production'` / Vite production build | `'proxy'` (or other real adapter) | **No — zero tolerance** | Startup guard + deployment gate |
| **Demo / sandbox** | Explicit labeling | `'mock'` if no customer data | Conditional | Labeling requirement |

---

## Lane 2: Test Lane Governance

Phase 1 requires a progression from mocked execution through real-backend validation. The test policy must support all four lanes without blocking later gates. Mock isolation is strict for Test Lanes 1–2; Test Lanes 3–4 require real adapters and are mandatory for later B2 gates.

### Gate Alignment Summary

| Test Lane | Adapter Mode | Mock Allowed? | B2 Gate Served | CI Stage | Required For |
|---|---|---|---|---|---|
| Unit tests | `'mock'` | Yes — required | `CODE_COMPLETE_MOCK` | Every PR / push | All domains |
| Mocked-proxy tests | `'proxy'` + mocked fetch | Yes (fetch layer) | `CODE_COMPLETE_MOCK` | Every PR / push | Proxy adapter domains |
| Contract tests (E1) | `'proxy'` + real backend | No | `STAGING_READY` | Staging deploy gate | Domains with frozen C1 routes |
| Staging E2E | `'proxy'` + real auth + backend | No | `STAGING_READY` → `PROD_ACTIVE` | Staging validation | Domains targeting production |

### Test Lane 1: Unit Tests

- **Adapter mode:** `'mock'`
- **Purpose:** Fast, isolated tests of business logic and adapter interface compliance
- **Data source:** In-memory mock stores with seed data (16 seed constants: `SEED_LEADS`, `SEED_PROJECTS`, `SEED_ESTIMATING_TRACKERS`, `SEED_ESTIMATING_KICKOFFS`, etc.)
- **Network:** None — no fetch, no HTTP, no external calls
- **Factory usage:** Individual factory functions (`createProjectRepository()`, `createLeadRepository()`, etc.) — there is no generic `getRepository()` function
- **When required:** Every domain, every gate — unit tests must pass at all stages of the B2 progression

**Mock reset semantics (repo truth):**
- Each mock repository instance has its own private store, initialized from seed data on construction (e.g., `private store: ILead[] = [...SEED_LEADS]`)
- Creating a fresh repository instance gives you a clean copy of seed data — this is the primary isolation mechanism
- `resetAllMockStores()` resets the global ID counter to 1000 for deterministic ID assignment — it does NOT clear in-memory store contents on existing instances
- **Recommended pattern:** Call `resetAllMockStores()` in `beforeEach` for deterministic IDs, then create a fresh repository instance for full store isolation

**Example (repo-truth API):**

```typescript
import { createProjectRepository, resetAllMockStores } from '@hbc/data-access';
import type { IProjectRepository } from '@hbc/data-access';

describe('ProjectRepository (mock)', () => {
  let repo: IProjectRepository;

  beforeEach(() => {
    resetAllMockStores();                    // Reset ID counter for deterministic IDs
    repo = createProjectRepository('mock');  // Fresh instance with clean seed data
  });

  it('should list seed projects', async () => {
    const result = await repo.getProjects();
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('should create a project with deterministic ID', async () => {
    const project = await repo.createProject({
      name: 'Test Project',
      /* ... other required fields */
    } as Omit<IActiveProject, 'id'>);
    expect(project.id).toBeDefined();
  });
});
```

**Implementation note:** The current `resetAllMockStores()` only resets the ID counter. If a true "reset all stores to initial seed state" capability is needed (e.g., for test harnesses that reuse repository instances across tests), this is a follow-on implementation requirement for `@hbc/data-access`. For now, creating a fresh repository instance per test block is the recommended pattern for full isolation.

### Test Lane 2: Mocked-Proxy Tests

- **Adapter mode:** `'proxy'` with mocked `fetch` (per B1 engineering plan)
- **Purpose:** Validate proxy adapter implementations against mocked HTTP responses
- **Data source:** Mocked fetch returning typed response envelopes
- **Network:** Mocked — no real HTTP calls
- **B1 cross-ref:** This is the primary test strategy for B1 Tasks 3–10
- **When required:** Required for `CODE_COMPLETE_MOCK` gate per B1; runs on every PR for proxy adapter packages

**Example (repo-truth API):**

```typescript
import { createLeadRepository } from '@hbc/data-access';
import type { ILeadRepository } from '@hbc/data-access';

describe('ProxyLeadRepository (mocked fetch)', () => {
  let repo: ILeadRepository;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    repo = createLeadRepository('proxy');
  });

  it('should call /api/leads and return typed result', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({
        data: [{ id: 1, name: 'Test Lead' }],
        total: 1, page: 1, pageSize: 25,
      })),
    );
    const result = await repo.getAll();
    expect(result.data).toHaveLength(1);
  });
});
```

### Test Lane 3: Contract Tests (E1)

- **Adapter mode:** `'proxy'` against a deployed test or staging backend
- **Purpose:** Validate that adapter behavior matches real backend response contracts
- **Data source:** Real backend responses validated against Zod schemas
- **Network:** Real HTTP calls to a test Azure Functions instance
- **E1 cross-ref:** E1 owns the contract test harness; B3 requires this lane to use a real adapter
- **B2 cross-ref:** Required for `STAGING_READY` gate
- **When required:** Required for `STAGING_READY` gate; runs only for domains whose C1 routes are frozen and whose backend is deployed

### Test Lane 4: Staging E2E

- **Adapter mode:** `'proxy'` with real auth (MSAL) against staging backend
- **Purpose:** Full user workflow validation in a production-like environment
- **Data source:** Staging backend with test data
- **Network:** Real HTTP with real auth tokens
- **C2 cross-ref:** Requires C2 auth middleware to be operational
- **When required:** Required for `PROD_ACTIVE` gate validation; runs on staging deployment as final pre-production check

### CI Pipeline Stage Guidance

B3 does not prescribe a specific pipeline file, but CI must support multiple stages with different adapter mode policies. E1/E2 may implement the detailed pipeline configuration against these policy requirements.

**Stage 1 — Build + Unit + Mocked-Proxy** (every PR / push):
- Adapter mode: `'mock'` for unit tests; `'proxy'` with mocked fetch for proxy tests
- No external dependencies required
- B2 gates served: `CODE_COMPLETE_MOCK`
- This stage must never make real HTTP calls

**Stage 2 — Contract Tests** (on staging deploy or scheduled):
- Adapter mode: `'proxy'` against a deployed test backend
- Requires test Azure Functions instance to be available
- B2 gates served: `STAGING_READY`
- E1 owns the test harness; B3 requires this stage to use a real adapter
- Runs only for domains whose C1 routes are frozen

**Stage 3 — Staging E2E** (on staging deploy):
- Adapter mode: `'proxy'` with real MSAL auth against staging backend
- Requires C2 auth middleware to be operational
- B2 gates served: `STAGING_READY` → `PROD_ACTIVE` validation
- Full user workflow validation in production-like environment

**Stage 4 — Production Smoke** (post-deploy):
- Adapter mode: `'proxy'` in production
- Lightweight verification that real adapters are responding correctly
- B2 gates served: `PROD_ACTIVE` confirmation
- Must verify mock is not active (startup guard log check)

---

## Lane 3: Enforcement Layers (Defense in Depth)

Mock isolation is enforced through five layers. Each layer catches failures that earlier layers might miss. No single layer is sufficient alone.

### Layer 1 — Build-Time Guardrail

**What:** Vite `define` block injects `process.env.HBC_ADAPTER_MODE` as a string literal at build time.
**How:** `apps/pwa/vite.config.ts` reads `VITE_ADAPTER_MODE`; defaults to `'mock'` in dev mode, `'proxy'` for all other build modes.
**Effect:** Production PWA bundles contain `'proxy'` as a baked-in literal — mock mode cannot appear in a correctly built production artifact.
**Owner:** Data Access Maintainer
**Evidence:** Build log showing the injected `HBC_ADAPTER_MODE` value.

### Layer 2 — Startup Assertion

**What:** Runtime guard that throws a fatal error if mock mode is active in a protected environment.
**Implementation target:** `packages/data-access/src/config/adapter-mode-guard.ts` (to be created per B3 scope)

**Frontend** (`apps/pwa/src/main.tsx`):
- Checks the build-time-injected `process.env.HBC_ADAPTER_MODE`
- If `'mock'` in a non-development build, throws fatal error preventing render
- Defense-in-depth: Vite already defaults to `'proxy'`, so this catches misconfigured builds

**Backend** (`backend/functions/src/index.ts`):
- Checks `process.env.HBC_ADAPTER_MODE` against `AZURE_FUNCTIONS_ENVIRONMENT` (already used in repo for production gating)
- If `AZURE_FUNCTIONS_ENVIRONMENT` is `'Production'` and adapter mode is `'mock'`, throws fatal error preventing function execution
- **Engineering requirement:** The current entrypoint uses side-effect imports that register Azure Functions immediately on module load. A synchronous guard before these imports is not possible without restructuring. Implementation options include: (a) restructuring to a bootstrap module that validates config before dynamic `import()` of function registrations, (b) using an Azure Functions pre-invocation hook or app-level middleware, or (c) validating at the first adapter call site rather than at module load. This is a follow-on implementation task, not a line-level edit.

**Both surfaces:** Log resolved adapter mode and environment at startup for observability.
**Owner:** Data Access Maintainer
**Evidence:** Startup log line showing adapter mode and environment classification.

### Layer 3 — CI Validation

**What:** Each CI pipeline stage enforces the correct adapter mode for its test lane.
**How:** Pipeline configuration sets `HBC_ADAPTER_MODE` explicitly per stage; Stage 1 uses `'mock'` for unit tests and `'proxy'` with mocked fetch for proxy tests; Stages 2–4 use real adapters against deployed backends.
**Owner:** DevOps / QA Lead
**Evidence:** CI job logs showing adapter mode env var, test pass/fail, and no unexpected network calls in mock-only stages.

### Layer 4 — Deployment Gate

**What:** Pre-deployment check rejects `HBC_ADAPTER_MODE='mock'` for staging and production targets.
**How:** CI/CD pipeline step reads deployment configuration (Azure Functions app settings for backend; Vite build env for frontend) and fails if mock mode is detected.
**Owner:** DevOps / Release Engineer
**Evidence:** Deployment gate pass/fail log in pipeline run.

### Layer 5 — Runtime Telemetry

**What:** Post-deployment monitoring confirms real adapters are active and responding.
**How:** Startup log emits adapter mode; monitoring alerts on unexpected values; production smoke test (CI Stage 4) verifies real adapter responses.
**Owner:** DevOps / Backend Platform Owner
**Evidence:** Application Insights or log query confirming adapter mode per deployment; smoke test results.

### Evidence Requirements Summary

| Checkpoint | Evidence Required | Owner | When Verified |
|---|---|---|---|
| Build-time injection | Build log showing `HBC_ADAPTER_MODE` value | Data Access Maintainer | Every build |
| Startup assertion | Startup log with adapter mode + environment | Data Access Maintainer | Every app start |
| CI unit/proxy tests | CI job green with mock adapter mode | QA Lead | Every PR |
| CI contract tests | CI job green with proxy against test backend | QA Lead / E1 | Staging deploy |
| Deployment gate | Pipeline gate pass log for target environment | DevOps | Every staging/prod deploy |
| Runtime telemetry | Log query confirming adapter mode in production | DevOps | Post-deploy, ongoing |
| Staging E2E | E2E test pass with real auth against staging | QA Lead | Staging deploy |
| Production smoke | Smoke test confirming real adapter responses | DevOps | Post-production deploy |

---

## Lane 4: Production Rollout Governance

### Core Rule

Production rollout must ensure that every activated domain uses a real adapter. Mock fallback is never acceptable in production, even as a "safe default" during gradual rollout.

### What This Means for Gradual Rollout

If domains are activated incrementally (e.g., Lead and Project go live before Schedule), the rollout strategy must ensure:
- Activated domains use `'proxy'` (or another real adapter)
- Non-activated domains throw `AdapterNotImplementedError` — this is the current factory behavior and is the safe production default; it prevents both mock data leakage and access to unimplemented adapters
- Application-layer gating (feature flags, route guards, or UI visibility controls) should prevent users from reaching non-activated domain surfaces
- Under no circumstances does a non-activated domain silently fall back to mock data in production

**Preferred rollout mechanism:** Use managed feature flags or application-layer gating to control which domains are visible to users, rather than ad-hoc per-domain environment variable overrides. Azure App Configuration feature flags, application-level route guards, or UI feature toggles are preferred over environment variable sprawl because they are auditable, centrally managed, and do not require redeployment to change.

### Domain-Level Adapter Overrides

Per-domain adapter mode overrides (e.g., `HBC_ADAPTER_MODE_LEADS`) are **explicitly deferred** out of P1-B3 scope. See `P1-B2-Adapter-Completion-Backlog.md` section "Open Decision: Domain-Level Adapter Overrides" for the full status.

**Current state:** No domain-level override mechanism exists in the factory. All domains resolve to the same global `HBC_ADAPTER_MODE` value. This is sufficient for Phase 1 where all domains target the same adapter type (`'proxy'`).

**If domain-level overrides are pursued in the future:**
- A separate design decision document must be created before implementation
- Overrides may only select between real adapter types (`'proxy'`, `'sharepoint'`, `'api'`) — never `'mock'`
- An override value of `'mock'` in a protected environment must be rejected by the startup guard
- The naming convention, governance model, and implementation approach must be approved by B-workstream lead and Architecture

### B2 Cross-Reference

A domain reaches `PROD_ACTIVE` (per B2) only when:
- Mock fallback is removed for that domain
- Live traffic is verified in production
- Monitoring and error reporting are confirmed

This policy enforces the prerequisite: mock must be unreachable in the production code path for that domain.

---

## Ownership, Exceptions, and Incident Handling

| Role | Enforcement Layers Owned | Responsibility |
|---|---|---|
| **Data Access Maintainer** | Layers 1–2 (build-time, startup) | Owns startup guard implementation, factory adapter mode resolution, Vite config adapter defaults, adapter README docs |
| **Backend Platform Owner** | Layer 2 (startup), Layer 5 (telemetry) | Ensures Azure Functions app settings are correctly configured per environment; monitors runtime adapter mode |
| **DevOps / Release Engineer** | Layers 3–5 (CI, deployment gate, telemetry) | Owns deployment gate configuration; validates adapter mode before staging/production; owns production smoke tests |
| **QA Lead** | Layer 3 (CI) | Verifies CI test lane configuration; coordinates multi-lane test strategy across B2 gates |
| **B-workstream Lead** | Policy authority | Approves staging mock exceptions; owns policy updates; escalation point for incidents |
| **Architecture** | Policy review | Reviews policy changes; approves domain-level override design if proposed |

### Exception Approval Authority

| Exception Type | Approver(s) | Maximum Duration | Required Artifacts |
|---|---|---|---|
| Mock in staging (temporary) | B-workstream lead AND DevOps lead | 5 business days | Written justification, affected domains, expiry date, rollback plan |
| Mock in production | **Not available** — no exception path exists | — | — |
| Mock in demo/sandbox | No approval needed if no customer data | Unlimited | Clear "demo" labeling in UI and logs |

**Deployment gate behavior during a staging exception:** The deployment gate remains absolute — it rejects `HBC_ADAPTER_MODE='mock'` for all staging deployments by default. When an approved staging mock exception is active, the gate must be manually bypassed by a DevOps engineer with the documented exception artifact (approval record, affected domains, expiry date) attached to the deployment pipeline run. Automated bypass is not permitted.

**B2 evidence suspension during a staging exception:** While a staging mock exception is active, `STAGING_READY` and `PROD_ACTIVE` evidence collection is suspended for the affected domains. Contract test results and staging E2E results collected against mock adapters do not count toward B2 gate progression. Evidence collection resumes only after staging is restored to real adapters and the affected domains pass contract/E2E tests against the real backend.

### Incident Response: Mock Detected in Protected Environment

**Severity classification:**

| Severity | Condition | Response Time | Required Action |
|---|---|---|---|
| **SEV-1 (Critical)** | Mock adapter serving production traffic to real users | Immediate escalation | Rollback or redeploy with correct config; page DevOps and B-workstream lead |
| **SEV-2 (High)** | Mock mode detected in staging during validation | Within 1 hour | Block deployment pipeline; fix configuration before proceeding |
| **SEV-3 (Medium)** | Mock mode in non-customer environment that should use real adapters | Within 1 business day | Fix configuration; verify enforcement layers |

**Incident procedure (SEV-1):**
1. **Immediate:** Alert DevOps and B-workstream lead; begin rollback
2. **Triage:** Determine scope — which domains, which users, how long, what data was served
3. **Remediate:** Deploy correct adapter configuration; verify real adapters are active; confirm via startup logs
4. **Root cause:** Identify which enforcement layer failed (build misconfiguration, missing guard, deployment gate bypass, config drift)
5. **Follow-up:** Update the failed enforcement layer to prevent recurrence; document in incident log

**Required incident artifacts:** Timeline, affected scope (domains and users), root cause analysis, remediation steps taken, prevention measures added.

---

## Policy Enforcement Checklist

**Layer 1 — Build-time:**
- [ ] Vite config defaults to `'proxy'` for non-development builds — evidence: build log (verified in `apps/pwa/vite.config.ts`)

**Layer 2 — Startup:**
- [ ] `assertAdapterModeForEnvironment()` implemented in `packages/data-access/src/config/adapter-mode-guard.ts`
- [ ] Startup guard called in `apps/pwa/src/main.tsx` before first repository call — evidence: startup log
- [ ] Backend startup guard enforced — requires entrypoint restructuring or alternative mechanism (see Layer 2 engineering requirement) — evidence: startup log
- [ ] Adapter mode and environment logged at startup in all environments — evidence: log query

**Layer 3 — CI:**
- [ ] CI pipeline configures adapter mode per test lane (mock for unit/proxy, real for contract/E2E) — evidence: CI job logs
- [ ] Unit tests create fresh repository instances per test block for isolation — evidence: test code review

**Layer 4 — Deployment gate:**
- [ ] Deployment gate rejects `HBC_ADAPTER_MODE='mock'` for staging and production targets — evidence: pipeline gate log
- [ ] Staging and production Azure Functions app settings have `HBC_ADAPTER_MODE='proxy'` — evidence: app settings config

**Layer 5 — Runtime:**
- [ ] Production smoke test verifies real adapter responses post-deploy — evidence: smoke test results
- [ ] Monitoring alert configured for unexpected adapter mode values — evidence: alert rule config

**Prerequisites:**
- [ ] Backend adapter-mode vocabulary remediated — `'real'` replaced with `'proxy'` in service-factory and docs (see Tracked Remediation above)

**General:**
- [ ] No domain-level override uses `'mock'` in staging or production (if override mechanism is implemented)
- [ ] Local development `.env` files are in `.gitignore` and not committed
