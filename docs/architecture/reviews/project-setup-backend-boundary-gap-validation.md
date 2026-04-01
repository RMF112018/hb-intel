# Backend Boundary Enforcement Gap Validation — Project Setup

## Executive Summary

**Verdict: Partially confirmed — the dedicated host and scoped service factory exist, but the boundary is structurally enforced at route-registration level only, not at service-resolution level.**

A dedicated Project Setup composition root (`hosts/project-setup/index.ts`) correctly limits route registration to 8 in-scope families. A scoped service factory (`hosts/project-setup/service-factory.ts`) correctly excludes domain CRUD services. Boundary regression tests validate both artifacts structurally.

However, **`createProjectSetupServiceFactory()` is never called by any route handler.** All 5 PS-host route modules that need services import and call the monolithic `createServiceFactory()`, which exposes all 10 domain CRUD services via lazy getters. The scoped factory exists as a tested architectural artifact, but route handlers bypass it entirely.

This is already documented as OI-05 in the Phase 8 remediation report ("Backend host surface broader than PS release scope") and explicitly deferred. The practical risk is low because domain CRUD services are lazily initialized and never accessed by PS handlers. The gap is primarily architectural integrity and future-drift risk, not a runtime defect.

---

## 1. Dedicated Host Evidence

### 1.1 Composition root exists and is correctly scoped

**File:** `backend/functions/src/hosts/project-setup/index.ts` (lines 1-32)

The composition root imports exactly 8 route families via static side-effect imports:

```typescript
import '../../functions/projectRequests/index.js';
import '../../functions/provisioningSaga/index.js';
import '../../functions/timerFullSpec/index.js';
import '../../functions/signalr/index.js';
import '../../functions/acknowledgments/index.js';
import '../../functions/notifications/index.js';
import '../../functions/health/index.js';
import '../../functions/cleanupIdempotency/index.js';
```

The header comment (lines 3-9) explicitly documents the exclusion of domain CRUD route families: leads, projects, estimating, schedule, buyout, compliance, contracts, risk, scorecards, pmp.

**Confirmed repo fact:** The dedicated host exists and correctly limits route registration.

### 1.2 Host infrastructure exists

**Files in `backend/functions/src/hosts/project-setup/`:**
- `index.ts` — composition root
- `service-factory.ts` — scoped container
- `host.json` — Azure Functions runtime config with tenant-specific CORS
- `RELEASE-SCOPE.md` — architecture manifest documenting in-scope and excluded families

**Confirmed repo fact:** Full host infrastructure exists.

---

## 2. Scoped Project Setup Service Factory Evidence

### 2.1 Factory exists and excludes domain CRUD services

**File:** `backend/functions/src/hosts/project-setup/service-factory.ts` (lines 1-105)

The scoped factory defines `IProjectSetupServiceContainer` (line 31) with 9 eagerly-initialized services:

```typescript
export interface IProjectSetupServiceContainer {
  sharePoint: ISharePointService;
  tableStorage: ITableStorageService;
  signalR: ISignalRPushService;
  managedIdentity: IManagedIdentityTokenService;
  projectRequests: IProjectRequestsRepository;
  acknowledgments: IAcknowledgmentService;
  graph: IGraphService;
  notifications: INotificationService;
  idempotency: IIdempotencyStorageService;
}
```

**No domain CRUD services appear** — no `ILeadService`, `IProjectService`, `IEstimatingService`, etc. No lazy getters. No CRUD imports.

The factory function (line 45) uses domain-scoped startup validation (`validateProjectSetupStartupConfig()`) and logs `surface: 'project-setup-host'` telemetry.

**Confirmed repo fact:** The scoped factory correctly excludes domain CRUD services.

### 2.2 Scoped factory is never called by route handlers

**Grep result:** `createProjectSetupServiceFactory` appears in exactly 2 files:
- `hosts/project-setup/service-factory.ts:45` — function definition
- `test/project-setup-host-boundary.test.ts:253` — test assertion that the factory exists

**No route handler, function module, or middleware imports or calls `createProjectSetupServiceFactory()`.**

**Confirmed repo fact:** The scoped factory is defined and tested but never used at runtime.

---

## 3. Monolithic Service Factory Evidence

### 3.1 Monolithic factory exposes domain CRUD services

**File:** `backend/functions/src/services/service-factory.ts`

The monolithic `IServiceContainer` interface includes all 9 PS-core services plus 10 domain CRUD services as lazy getters:

```typescript
// Domain CRUD services (lazy)
get leads() { return (_leads ??= isMock ? new MockLeadService() : new RealLeadService()); },
get projects() { ... },
get estimating() { ... },
get schedule() { ... },
get buyout() { ... },
get compliance() { ... },
get contracts() { ... },
get risk() { ... },
get scorecards() { ... },
get pmp() { ... },
```

Uses `validateCoreConfig()` (broader validation) and logs `surface: 'backend'` telemetry.

**Confirmed repo fact:** The monolithic factory exposes all domain CRUD services.

---

## 4. Retained Route-Module Import/Call-Path Evidence

### 4.1 Every PS-host route module uses the monolithic factory

All 5 PS-host route modules that require services import from `../../services/service-factory.js`:

| Route Module | File | Import Line | Call Sites |
|-------------|------|-------------|------------|
| projectRequests | `functions/projectRequests/index.ts` | Line 6 | Lines 116, 189, 234, 270 |
| provisioningSaga | `functions/provisioningSaga/index.ts` | Line 4 | Lines 49, 91, 121, 165, 204, 235, 259, 290, 330 |
| acknowledgments | `functions/acknowledgments/index.ts` | Line 17 | Lines 98, 207 |
| cleanupIdempotency | `functions/cleanupIdempotency/index.ts` | Line 12 | Line 20 |
| timerFullSpec | `functions/timerFullSpec/handler.ts` | Line 3 | Line 23 |

Three PS-host route modules do NOT use any service factory:
- `health/index.ts` — pure config checking, no services needed
- `signalr/index.ts` — uses Azure Functions SignalR bindings directly
- `notifications/index.ts` — uses injected stores and Azure bindings

**Every call site uses `createServiceFactory()`, not `createProjectSetupServiceFactory()`.**

**Confirmed repo fact:** Retained route modules resolve services through the monolithic factory.

---

## 5. Boundary Enforcement Analysis

### 5.1 What the boundary tests actually validate

**File:** `backend/functions/src/test/project-setup-host-boundary.test.ts`

The tests validate **structural properties of the host artifacts**, not runtime service resolution by handlers:

| Test | What It Proves | What It Does NOT Prove |
|------|---------------|----------------------|
| AC-1 (line 51) | Composition root imports only 8 in-scope families | Handlers use the scoped factory |
| AC-2 (line 83) | Scoped factory interface excludes CRUD services | Handlers call the scoped factory |
| AC-3 (line 71) | Composition root excludes 11 out-of-scope families | Handlers can't reach CRUD services |
| Line 246 | PS factory doesn't re-export `createServiceFactory` | Handlers don't import `createServiceFactory` directly |
| Line 251 | PS factory has its own singleton | Route handlers use that singleton |

The test at line 246 verifies the **factory file** doesn't contain `createServiceFactory`, but does NOT verify that **route handler files** don't import it. This is the structural gap in test coverage.

### 5.2 Two-layer boundary model

The current implementation enforces the boundary at two levels with different effectiveness:

| Layer | Mechanism | Enforced? | Evidence |
|-------|-----------|-----------|----------|
| **Route registration** | Composition root imports only 8 families | **Yes** | Tested by AC-1, AC-3 |
| **Service resolution** | Scoped factory excludes CRUD services | **No — bypassed** | Handlers call monolithic factory |

Route registration is enforced: a PS-host deployment will only register the 8 in-scope route families. Domain CRUD HTTP endpoints are unreachable.

Service resolution is NOT enforced: every handler that needs services receives the monolithic container with all 10 domain CRUD services accessible (though lazily initialized and never accessed).

### 5.3 Practical impact assessment

**What the gap means at runtime:**
- Domain CRUD **routes** are unreachable (composition root doesn't register them) — route scope is enforced
- Domain CRUD **services** are reachable via the container's lazy getters — service scope is not enforced
- Domain CRUD services are never instantiated by PS handlers (lazy init, never accessed) — no actual coupling
- Config validation is broader than necessary (`validateCoreConfig` vs `validateProjectSetupStartupConfig`) — startup scope is not narrowed
- Telemetry logs `surface: 'backend'` instead of `surface: 'project-setup-host'` — observability is not scoped

**Risk profile:**
- **Runtime defect:** No. PS handlers don't access domain CRUD services.
- **Startup coupling:** Low. Lazy getters don't initialize until accessed.
- **Future drift:** Medium. A future PS handler could accidentally access `services.leads` and it would work, silently violating the boundary.
- **Config scope:** Low. `validateCoreConfig()` checks the same core tier; domain CRUD services don't need additional config at startup.
- **Documentation accuracy:** The scoped factory is described as the PS host's service container, but handlers don't actually use it.

---

## 6. Prior Claims vs Current Repo Truth

### Claims that are accurate

| Claim | Source | Status |
|-------|--------|--------|
| Dedicated PS composition root exists, imports 8 families | ADR-0124, Phase 7, Phase 8 | **Accurate** |
| Scoped factory exists, excludes domain CRUD | ADR-0124 AC-2, boundary tests | **Accurate** |
| Domain CRUD routes not registered in PS host | AC-1, AC-3 tests | **Accurate** |
| PS host.json has tenant-specific CORS | AC-5 test, Phase 7 | **Accurate** |
| Domain CRUD services lazily initialized, not instantiated for PS | OI-05 mitigation note | **Accurate** |

### Claims that are structurally true but operationally incomplete

| Claim | Source | Issue |
|-------|--------|-------|
| "The Project Setup service container initializes only Project Setup services" (AC-2) | Phase-1_Backend-Boundary-Freeze.md | The container EXISTS but is never used by handlers |
| "IProjectSetupServiceContainer ... Accurate — domain-scoped, excludes non-PS CRUD per ADR-0124" (Phase 7 line 601) | Phase 7 report | Accurate about the interface, but handlers use `IServiceContainer` instead |
| "service factory does not re-export createServiceFactory" (boundary test line 246) | Boundary tests | True for the factory file, but route handlers import `createServiceFactory` directly |

### Claims that already acknowledge the gap

| Claim | Source |
|-------|--------|
| "Backend host surface broader than Project Setup release surface" (OI-05) | Phase 8, line 687 |
| "P8-04 (Backend Boundary Reduction) was deferred as OI-05" | Phase 8, line 664 |
| "Unrelated routes are behind auth; lazy domain CRUD services not instantiated for PS operations" | Phase 8, line 711 |

---

## 7. Verdict

**Partially confirmed — the boundary is real at route-registration level but not enforced at service-resolution level.**

The gap classification:

| Dimension | Assessment |
|-----------|-----------|
| Composition-root design | **Sound** — correctly scopes route registration |
| Scoped factory design | **Sound** — correctly excludes CRUD services |
| Handler wiring | **Gap** — handlers call monolithic factory, bypassing scoped container |
| Service resolution | **Gap** — handlers receive full monolithic container with CRUD access |
| Test coverage | **Partial** — tests validate factory structure but not handler usage |
| Documentation | **Partially overstated** — AC-2 claims are true about the artifact but incomplete about enforcement |
| Prior acknowledgment | **Yes** — OI-05 documents this as deferred |
| Runtime risk | **Low** — no PS handler accesses CRUD services; lazy init prevents coupling |
| Future-drift risk | **Medium** — nothing prevents a future handler from accessing CRUD services |

---

## 8. Why the Verdict Is Correct

1. **The scoped factory is never called.** `createProjectSetupServiceFactory` has zero call sites outside its own definition and a test assertion. Every PS route handler imports and calls `createServiceFactory()`.

2. **The monolithic singleton is what runs.** Because handlers call the monolithic factory, the PS host process initializes the monolithic singleton (with `surface: 'backend'` telemetry, `validateCoreConfig()`, and all 10 CRUD lazy getters available).

3. **The boundary tests have a coverage gap.** Tests verify the scoped factory file doesn't contain `createServiceFactory`, but no test verifies that PS route handler files don't import it. The structural check on the factory file doesn't extend to handler files.

4. **The Phase 8 report already acknowledges this.** OI-05 explicitly documents "Backend host surface broader than PS release scope" as deferred. The gap is known but the characterization in AC-2 and Phase 7 claims is incomplete — the scoped container exists but is not wired.

5. **Practical risk is genuinely low.** PS handlers access only `services.sharePoint`, `services.tableStorage`, `services.projectRequests`, etc. No handler accesses `services.leads` or any CRUD service. Lazy initialization means CRUD services are never instantiated in a PS-only deployment.

---

## 9. Remediation Targets

The following changes would close the gap. **Not implemented in this validation.**

### 9.1 Wire route handlers to scoped factory

Migrate the 5 PS-host route modules from `createServiceFactory()` to `createProjectSetupServiceFactory()`:

| File | Current Import | Target Import |
|------|---------------|--------------|
| `functions/projectRequests/index.ts:6` | `../../services/service-factory.js` | `../../hosts/project-setup/service-factory.js` |
| `functions/provisioningSaga/index.ts:4` | `../../services/service-factory.js` | `../../hosts/project-setup/service-factory.js` |
| `functions/acknowledgments/index.ts:17` | `../../services/service-factory.js` | `../../hosts/project-setup/service-factory.js` |
| `functions/cleanupIdempotency/index.ts:12` | `../../services/service-factory.js` | `../../hosts/project-setup/service-factory.js` |
| `functions/timerFullSpec/handler.ts:3` | `../../services/service-factory.js` | `../../hosts/project-setup/service-factory.js` |

**Complication:** The monolithic host (`backend/functions/src/index.ts`) also imports these same route modules. If handlers are changed to use the scoped factory, the monolithic host would also use the scoped factory for these routes. This is either acceptable (monolithic host gets the scoped container for PS routes) or requires a factory-selection mechanism (e.g., host-level DI, ambient factory binding, or separate handler registrations per host).

### 9.2 Add handler-level boundary test

Extend `project-setup-host-boundary.test.ts` to verify that route handler files imported by the PS host do not import `createServiceFactory`:

```typescript
it('PS-host route handlers do not import the monolithic factory', () => {
  for (const family of IN_SCOPE_FAMILIES) {
    const handlerSource = readFileSync(resolve(FUNCTIONS_DIR, family, 'index.ts'), 'utf-8');
    expect(handlerSource).not.toContain('createServiceFactory');
  }
});
```

### 9.3 Resolve dual-host import conflict

Since the same route module files are imported by both the PS host and the monolithic host, the remediation must decide:
- **Option A:** Accept that PS route modules use the scoped factory in both hosts (monolithic host gets narrower container for PS routes)
- **Option B:** Create host-aware factory resolution (e.g., ambient host context, factory parameter injection)
- **Option C:** Duplicate route registrations per host (violates DRY but fully isolates)

This is the primary architectural decision blocking remediation.

---

## 10. Unresolved Questions

| # | Question | Why It Matters |
|---|----------|---------------|
| 1 | Should the monolithic host also use the scoped factory for PS routes? | Determines whether route handlers can simply switch imports or need a host-aware mechanism |
| 2 | Is the dual-host coexistence model transitional or permanent? | If transitional, a simpler migration path may be acceptable |
| 3 | Should `IProjectSetupServiceContainer` be a strict subset type of `IServiceContainer`? | Would allow gradual migration without breaking the monolithic host's type expectations |
| 4 | Are there integration tests that exercise PS routes through the monolithic host? | Switching factories could break tests that expect `IServiceContainer` |

---

## Appendix: Evidence Index

| Evidence | File | Lines | Type |
|----------|------|-------|------|
| PS host composition root | `backend/functions/src/hosts/project-setup/index.ts` | 1-32 | Confirmed repo fact |
| PS scoped factory definition | `backend/functions/src/hosts/project-setup/service-factory.ts` | 31-40, 45-105 | Confirmed repo fact |
| Monolithic factory with CRUD getters | `backend/functions/src/services/service-factory.ts` | 51-76, 158-167 | Confirmed repo fact |
| projectRequests imports monolithic | `backend/functions/src/functions/projectRequests/index.ts` | 6 | Confirmed repo fact |
| provisioningSaga imports monolithic | `backend/functions/src/functions/provisioningSaga/index.ts` | 4 | Confirmed repo fact |
| acknowledgments imports monolithic | `backend/functions/src/functions/acknowledgments/index.ts` | 17 | Confirmed repo fact |
| cleanupIdempotency imports monolithic | `backend/functions/src/functions/cleanupIdempotency/index.ts` | 12 | Confirmed repo fact |
| timerFullSpec imports monolithic | `backend/functions/src/functions/timerFullSpec/handler.ts` | 3 | Confirmed repo fact |
| Scoped factory never called (grep) | All `backend/functions/src/` | — | Confirmed repo fact |
| Boundary test validates factory structure | `backend/functions/src/test/project-setup-host-boundary.test.ts` | 83-110, 236-255 | Confirmed repo fact |
| Boundary test does NOT validate handler imports | `backend/functions/src/test/project-setup-host-boundary.test.ts` | — | Confirmed test-coverage gap |
| OI-05 deferred acknowledgment | `docs/architecture/reviews/project-setup-phase-8-remediation-report.md` | 687, 711 | Prior report claim |
| AC-2 scoped container criterion | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-1/Phase-1_Backend-Boundary-Freeze.md` | AC-2 | Prior report claim |
| Phase 7 scoped container accuracy claim | `docs/architecture/reviews/project-setup-phase-7-production-alignment-remediation-report.md` | 601 | Prior report claim (structurally true, operationally incomplete) |
