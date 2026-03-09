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

## 7.2.2 — Define the Narrowed Boundary

- Keep core state, atomic state transitions, selector functions, and backward-compatible public store API inside `authStore.ts`.
- Evaluate extraction of audit payload assembly, startup timing metadata assembly, repeated state outcome normalization, restore-result translation, and compatibility-session construction helpers.

## 7.2.3 — Introduce Helper Modules

- Create internal helper modules for extracted orchestration concerns such as event builders, startup metadata helpers, and legacy session adaptation.
- Do not create shadow state or a second store.

## 7.2.4 — Preserve Public API Stability

- Keep current public store exports, selector hooks, and compatibility methods stable in this pass.
- Add or update tests proving selector outputs and compatibility wrappers still behave identically.

## 7.2.5 — Reduce Inline Complexity of Major Actions

- Refactor the most complex actions (`completeBootstrap`, `resolveRestore`, `signInSuccess`, `signOut`, `setUser`) so core transition logic is separated from event/timing/translation scaffolding.

## 7.2.6 — Preserve Audit and Startup Timing Behavior

- No regression is allowed in audit event semantics, lifecycle timing semantics, or shell-bootstrap readiness semantics.
- Add focused tests around sign-in, sign-out, restore success/failure, and bootstrap timing.

## 7.2.7 — Add Internal Boundary Documentation

- Update auth docs to state what the store owns, what helpers own, what adapters own, what guards consume, and what remains only for compatibility.

---

## Deliverables

- updated auth internal module structure
- updated tests
- updated auth README/reference docs
- `docs/architecture/plans/PH7.2-Auth-Store-Responsibility-Narrowing.md`

---

## Acceptance Criteria Checklist

- [ ] `authStore.ts` still owns central auth truth.
- [ ] Inline orchestration density is materially reduced.
- [ ] Public selectors and compatibility APIs remain stable.
- [ ] Audit and startup timing behavior remain intact.
- [ ] No shadow state model is introduced.
- [ ] Build, lint, type-check, and auth tests all pass.

---

## Verification Evidence

- `pnpm turbo run build --filter=@hbc/auth`
- `pnpm turbo run lint --filter=@hbc/auth`
- `pnpm turbo run check-types --filter=@hbc/auth`
- `pnpm turbo run test --filter=@hbc/auth`

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.2 started: YYYY-MM-DD
PH7.2 completed: YYYY-MM-DD

Artifacts:
- updated auth internal module structure
- updated tests
- updated auth README/reference docs
- `docs/architecture/plans/PH7.2-Auth-Store-Responsibility-Narrowing.md`

Verification:
- build: PASS/FAIL
- lint: PASS/FAIL
- check-types: PASS/FAIL
- test / validation: PASS/FAIL

Notes:
- unresolved items:
- deferred items with rationale:
-->
```
