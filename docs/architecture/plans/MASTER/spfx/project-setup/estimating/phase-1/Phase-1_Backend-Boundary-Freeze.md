# Phase 1 Backend Boundary Freeze — Project Setup Domain Host

**Date:** 2026-03-31
**ADR:** ADR-0124 (Per-Domain Backend Function App Hosts)
**Prompt:** Prompt-07 (Phase-1-Architecture-Freeze-and-Boundary-Plan)

---

## 1. Current State

The backend operates as a single monolithic Azure Function App host.

**Entry point:** `backend/functions/src/index.ts` (29 lines, 19 side-effect route imports)
**Service factory:** `backend/functions/src/services/service-factory.ts` (singleton container, 9 eager + 10 lazy services)
**Host config:** `backend/functions/host.json` (single unified CORS policy allowing `*.sharepoint.com`)

### Route family inventory

| # | Family | Directory | Functions | Route prefix(es) | Project Setup? |
|---|--------|-----------|-----------|-------------------|----------------|
| 1 | projectRequests | `functions/projectRequests/` | 4 HTTP | `/api/project-setup-requests[/*]` | YES |
| 2 | provisioningSaga | `functions/provisioningSaga/` | 10 HTTP | `/api/provision-project-site`, `/api/provisioning-status/*`, `/api/provisioning-failures`, `/api/admin/trigger-timer`, `/api/provisioning-retry/*`, `/api/provisioning-escalate/*`, `/api/provisioning-runs`, `/api/provisioning-archive/*`, `/api/provisioning-escalation-ack/*`, `/api/provisioning-force-state/*` | YES |
| 3 | timerFullSpec | `functions/timerFullSpec/` | 1 timer | (timer trigger — deferred provisioning step 5) | YES |
| 4 | signalr | `functions/signalr/` | 1 HTTP | `/api/provisioning-negotiate` | YES |
| 5 | acknowledgments | `functions/acknowledgments/` | 2 HTTP | `/api/acknowledgments[/*]` | YES |
| 6 | notifications | `functions/notifications/` | 7 HTTP + 1 timer + queue | `/api/notifications/*`, `/api/notification-preferences/*` | YES |
| 7 | health | `functions/health/` | 1 HTTP | `/api/health` | YES |
| 8 | cleanupIdempotency | `functions/cleanupIdempotency/` | 1 timer | (timer trigger — idempotency record cleanup) | YES |
| 9 | proxy | `functions/proxy/` | 2 HTTP | `/api/proxy/*` | NO (stub) |
| 10 | leads | `functions/leads/` | 5 HTTP | `/api/leads[/*]` | NO |
| 11 | projects | `functions/projects/` | 6 HTTP | `/api/projects[/*]`, `/api/projects/summary` | NO |
| 12 | estimating | `functions/estimating/` | 7 HTTP | `/api/estimating/trackers[/*]`, `/api/estimating/kickoffs[/*]` | NO |
| 13 | schedule | `functions/schedule/` | 6 HTTP | `/api/projects/{id}/schedule/activities[/*]` | NO |
| 14 | buyout | `functions/buyout/` | 6 HTTP | `/api/projects/{id}/buyout/entries[/*]`, `/api/projects/{id}/buyout/summary` | NO |
| 15 | compliance | `functions/compliance/` | 6 HTTP | `/api/projects/{id}/compliance[/*]`, summary | NO |
| 16 | contracts | `functions/contracts/` | 6 HTTP | `/api/projects/{id}/contracts[/*]`, summary | NO |
| 17 | risk | `functions/risk/` | 6 HTTP | `/api/projects/{id}/risk[/*]`, summary | NO |
| 18 | scorecards | `functions/scorecards/` | 6 HTTP | `/api/projects/{id}/scorecards[/*]`, versions | NO |
| 19 | pmp | `functions/pmp/` | 7 HTTP | `/api/projects/{id}/pmp[/*]`, signatures | NO |

### Service factory initialization

| Mode | Services | Needed for PS? |
|------|----------|----------------|
| Eager | sharePoint, tableStorage, signalR, managedIdentity, projectRequests, acknowledgments, graph, notifications, idempotency | YES (all 9) |
| Lazy | leads, projects, estimating, schedule, buyout, compliance, contracts, risk, scorecards, pmp | NO (none) |

---

## 2. Target State

A **dedicated Project Setup Function App composition root** that:

- Imports only the 8 in-scope route families (rows 1-8 above)
- Uses a scoped service factory initializing only the 9 eager Project Setup services
- Has its own `host.json` with tenant-specific CORS (`https://hedrickbrotherscom.sharepoint.com` only)
- Validates only Project Setup-required env vars at startup
- Shares all middleware, adapters, utils, and models via monorepo imports (no duplication)

### Proposed directory structure

```
backend/functions/src/
  hosts/
    project-setup/
      index.ts              ← composition root (8 route imports only)
      service-factory.ts    ← scoped container (9 eager, 0 lazy)
      host.json             ← domain-specific CORS, timeout, SignalR
  index.ts                  ← legacy monolithic host (unchanged)
  functions/                ← route handlers (unchanged, shared)
  middleware/               ← shared (unchanged)
  services/                 ← shared adapters (unchanged)
  utils/                    ← shared utilities (unchanged)
  validation/               ← shared schemas (unchanged)
  config/                   ← shared config (unchanged)
  state-machine.ts          ← shared (unchanged)
```

The legacy monolithic `index.ts` remains unchanged and operational. The Project Setup host is additive.

---

## 3. Shared vs Host-Specific Split

### Remains shared (consumed by all domain hosts via import)

| Category | Files |
|----------|-------|
| Middleware | `middleware/auth.ts`, `middleware/validateToken.ts`, `middleware/request-id.ts`, `middleware/validate.ts` |
| Utilities | `utils/logger.ts`, `utils/response-helpers.ts`, `utils/retry.ts`, `utils/withTelemetry.ts`, `utils/validate-config.ts`, `utils/adapter-mode-guard.ts`, `utils/env.ts`, `utils/table-client-factory.ts`, `utils/diagnose-permissions.ts` |
| Service adapters | `services/sharepoint-service.ts`, `services/table-storage-service.ts`, `services/signalr-push-service.ts`, `services/managed-identity-token-service.ts`, `services/project-requests-repository.ts`, `services/acknowledgment-service.ts`, `services/graph-service.ts`, `services/notification-service.ts`, `services/idempotency-storage-service.ts`, `services/projects-list-contract.ts`, `services/projects-list-mapper.ts` |
| Domain logic | `state-machine.ts`, `functions/provisioningSaga/saga-orchestrator.ts`, `functions/provisioningSaga/steps/*`, `functions/timerFullSpec/handler.ts` |
| Validation | `validation/*` |
| Config | `config/*` |
| Workspace packages | `@hbc/models`, `@hbc/acknowledgment`, `@hbc/notification-intelligence`, `@hbc/provisioning` |

### Moves to Project Setup host (host-specific)

| Concern | Implementation |
|---------|---------------|
| Composition root | `hosts/project-setup/index.ts` — 8 route family imports |
| Scoped service factory | `hosts/project-setup/service-factory.ts` — 9 eager services, no lazy domain CRUD |
| Host config | `hosts/project-setup/host.json` — tenant-specific CORS, SignalR binding, timeout |
| Config validation | Startup requires only PS-needed env vars |
| Deployment | Dedicated Azure Function App resource, app settings, MI grants |

### Stays outside Project Setup scope

| Family | Disposition |
|--------|------------|
| leads, projects, estimating, schedule, buyout, compliance, contracts, risk, scorecards, pmp | Remain in legacy monolithic host until their own domain hosts are created |
| proxy | Stub; not carried by Project Setup host; disposition per gap report item 8 |

---

## 4. Transitional Compatibility

- The existing monolithic host at `backend/functions/src/index.ts` is **not modified**.
- The Project Setup host is **additive** — a new composition root alongside the existing one.
- Both hosts may coexist during deployment transition as separate Azure Function App resources with different hostnames.
- The monolithic host continues serving all routes until the Project Setup host is validated in staging.
- No route conflicts arise because each host is its own Azure resource.
- The `apps/estimating` frontend's backend URL configuration determines which host it targets; switching is a config change, not a code change.

---

## 5. Acceptance Criteria

Phase 1 backend scope can be marked closed when all of the following are satisfied in repo truth:

| ID | Criterion |
|----|-----------|
| AC-1 | A dedicated Project Setup composition root exists that imports only the 8 in-scope route families. |
| AC-2 | The Project Setup service container initializes only Project Setup services (no leads/projects/estimating/schedule/buyout/compliance/contracts/risk/scorecards/pmp). |
| AC-3 | A regression test proves the Project Setup host does NOT register out-of-scope routes. |
| AC-4 | A regression test proves the Project Setup host DOES register all 8 in-scope route families. |
| AC-5 | The Project Setup `host.json` has tenant-specific CORS (not `*.sharepoint.com`). |
| AC-6 | Config validation at startup requires only Project Setup env vars. |
| AC-7 | Shared middleware, adapters, and utils are imported from shared paths (not duplicated). |
| AC-8 | ADR-0124 is accepted and referenced by this boundary plan. |
| AC-9 | The audit report Phase 1 section is updated with boundary freeze evidence. |
| AC-10 | No existing tests are broken by the addition of the Project Setup host. |

---

## 6. Implementation Checklist for Prompt-08

### Host creation

- [ ] Create `backend/functions/src/hosts/project-setup/index.ts`
  - Import only: `projectRequests`, `provisioningSaga`, `timerFullSpec`, `signalr`, `acknowledgments`, `notifications`, `health`, `cleanupIdempotency`
  - Do NOT import: `leads`, `projects`, `estimating`, `schedule`, `buyout`, `compliance`, `contracts`, `risk`, `scorecards`, `pmp`, `proxy`
- [ ] Create `backend/functions/src/hosts/project-setup/service-factory.ts`
  - Eager only: sharePoint, tableStorage, signalR, managedIdentity, projectRequests, acknowledgments, graph, notifications, idempotency
  - No lazy domain CRUD getters
  - Same adapter-mode-guard and tiered validation pattern as existing factory
- [ ] Create `backend/functions/src/hosts/project-setup/host.json`
  - CORS: tenant-specific origin only (`https://hedrickbrotherscom.sharepoint.com`)
  - SignalR binding config
  - Appropriate `functionTimeout`
- [ ] Verify existing monolithic `index.ts` is NOT modified (additive change only)

### Service wiring

- [ ] Project Setup route files import from the scoped service factory OR the scoped factory re-exports the same interface
- [ ] No shared service code is duplicated; all adapters imported from shared paths
- [ ] Config validation at startup only checks PS-required env vars

### Regression tests

- [ ] Add `backend/functions/src/test/project-setup-host-boundary.test.ts`
  - Test: PS host `index.ts` contains only 8 expected route imports
  - Test: PS host `index.ts` does NOT contain any of the 10 excluded domain imports
  - Test: PS service factory does not expose domain CRUD service getters
- [ ] Update `unsupported-scope-guard.test.ts` if needed for dual-host structure
- [ ] Run existing test suite — confirm zero regressions

### Documentation

- [ ] Update audit report per Prompt-07 plan
- [ ] Verify ADR-0124 and boundary freeze doc are committed
- [ ] Update `current-state-map.md` if host structure entry needs updating

### Validation

- [ ] `pnpm --filter @hbc/functions build` passes
- [ ] `pnpm --filter @hbc/functions test` passes
- [ ] New boundary test passes
- [ ] Existing `release-gates`, `infra-readiness`, `auth-release-readiness` tests pass
