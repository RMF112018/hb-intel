# PH7.2 — Auth Store Responsibility Narrowing

**Version:** 1.0  
**Purpose:** Reduce orchestration density inside `packages/auth/src/stores/authStore.ts` while preserving it as the authoritative auth/session/permission truth store.  
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.  
**Implementation Objective:** Narrow the responsibilities of `authStore.ts`, extract side-effect-heavy helpers where appropriate, preserve public selectors and compatibility wrappers, and reduce the risk that `@hbc/auth` becomes a second-generation monolith.

---

## Prerequisites

- PH7.1 complete.
- Review `packages/auth/src/stores/authStore.ts`, related types, adapters, guards, audit modules, startup timing helpers, README/reference docs, and Phase 5 ADRs.
- Inventory every import into `authStore.ts` and classify each by state ownership vs orchestration vs telemetry vs compatibility.

---

## Source Inputs

- `packages/auth/src/stores/authStore.ts`
- `packages/auth/src/audit/*`
- `packages/auth/src/startup/*`
- auth validation suites
- auth adapters
- guard-related modules
- auth README/reference docs

---

## 7.2.1 — Create the Responsibility Map

- Document every current auth store responsibility under: state ownership, state transitions, cross-cutting side effects, and compatibility preservation.
- For each responsibility mark whether it should stay in the store, move to a helper module, remain temporarily for compatibility, or be deprecated later.
- **`setUser` consumer chain — do not break:** `setUser(user: ICurrentUser | null) => void` is consumed indirectly by `mock/bootstrapHelpers.ts` → `personaToCurrentUser()` → callers (primarily `apps/dev-harness` and `apps/pwa` in dev/mock bootstrap mode). Its external signature must not change. Any refactoring of the internal `NormalizedAuthSession` construction logic must remain entirely within the action body or a private `stores/` helper; the compat wrapper's call contract is frozen for this phase.

## 7.2.2 — Define the Narrowed Boundary

- Keep core state, atomic state transitions, selector functions, and backward-compatible public store API inside `authStore.ts`.
- Evaluate extraction of audit payload assembly, startup timing metadata assembly, repeated state outcome normalization, restore-result translation, and compatibility-session construction helpers.

## 7.2.3 — Introduce Helper Modules

- Create internal helper modules for extracted orchestration concerns such as event builders, startup metadata helpers, and legacy session adaptation.
- Do not create shadow state or a second store.
- **Placement constraint:** All new helper modules must be created within `packages/auth/src/stores/` (e.g., `stores/authStoreHelpers.ts` or a `stores/helpers/` subdirectory). They must not import from `packages/auth/src/adapters/` — doing so would create a `stores/ → adapters/` circular import path given that adapters already depend on types resolved through the stores boundary. `sessionNormalization.ts` in `adapters/` performs analogous session construction but takes `AdapterIdentityPayload`, not `ICurrentUser`; the new compat-session helper is a separate concern and must remain in the `stores/` layer.

## 7.2.4 — Preserve Public API Stability

- Keep current public store exports, selector hooks, and compatibility methods stable in this pass.
- Add or update tests proving selector outputs and compatibility wrappers still behave identically.

## 7.2.5 — Reduce Inline Complexity of Major Actions

- Refactor the most complex actions (`completeBootstrap`, `resolveRestore`, `signInSuccess`, `signOut`, `setUser`) so core transition logic is separated from event/timing/translation scaffolding.

## 7.2.6 — Preserve Audit and Startup Timing Behavior

- No regression is allowed in audit event semantics, lifecycle timing semantics, or shell-bootstrap readiness semantics.
- Add focused tests covering the following scenarios (pre-validation review confirmed the current `authStore.audit.test.ts` is missing the last four):
  - sign-in audit event recorded correctly (`session-restore-success` / `sign-in`)
  - sign-out audit event recorded correctly (`sign-out`)
  - restore **success** audit event (`session-restore-success`)
  - restore **failure** audit event (`session-restore-failure`) — using the `'fatal'` outcome path
  - restore **`'invalid-expired'`** outcome — must also emit a `session-restore-failure` audit event; the outcome branch currently shares the `'failure'` audit path with `'reauth-required'` and this equivalence must be explicitly asserted in tests, not assumed
  - `beginBootstrap` → `startStartupPhase` is called with correct phase name and metadata
  - `completeBootstrap` → `endStartupPhase` is called with correct phase name and outcome metadata
- **Startup timing bridge mock requirement:** Tests for `beginBootstrap`/`completeBootstrap` must configure `globalThis.__HBC_STARTUP_TIMING_BRIDGE__` before the action is invoked and assert against the mock's recorded calls. Set this up in a `beforeEach` / `afterEach` pair within the bootstrap-timing describe block to avoid leaking mock state across tests.

## 7.2.7 — Add Internal Boundary Documentation

- Update auth docs to state what the store owns, what helpers own, what adapters own, what guards consume, and what remains only for compatibility.

---

## Deliverables

- updated auth internal module structure
- updated tests
- updated auth README/reference docs
- `docs/architecture/plans/ph7-remediation/PH7.2-Auth-Store-Responsibility-Narrowing.md`

---

## Acceptance Criteria Checklist

- [x] `authStore.ts` still owns central auth truth.
- [x] Inline orchestration density is materially reduced.
- [x] Public selectors and compatibility APIs remain stable.
- [x] Audit and startup timing behavior remain intact.
- [x] No shadow state model is introduced.
- [x] Build, lint, type-check, and auth tests all pass.

---

## Verification Evidence

- `pnpm turbo run build --filter=@hbc/auth`
- `pnpm turbo run lint --filter=@hbc/auth`
- `pnpm turbo run check-types --filter=@hbc/auth`
- `pnpm turbo run test --filter=@hbc/auth`

---

## Progress Notes Template

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.2 started: 2026-03-09
PH7.2 completed: 2026-03-09

Artifacts:
- `packages/auth/src/stores/helpers/authStoreHelpers.ts` — 7 extracted pure helper functions
- `packages/auth/src/stores/helpers/index.ts` — barrel export
- `packages/auth/src/stores/authStore.ts` — refactored to delegate to helpers
- `packages/auth/src/stores/authStore.audit.test.ts` — expanded from 2 to 7 tests
- `packages/auth/README.md` — added Internal Ownership Boundaries table

Verification:
- build: N/A (turbo cyclic dep in unrelated packages; tsc --noEmit PASS)
- lint: PASS (only pre-existing alignment-markers rule-not-found)
- check-types: PASS
- test / validation: PASS (112 tests, 25 files, 7 new auth store tests)

Notes:
- unresolved items: none
- deferred items with rationale: none
-->
