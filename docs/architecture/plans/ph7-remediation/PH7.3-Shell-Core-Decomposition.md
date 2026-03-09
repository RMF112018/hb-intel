# PH7.3 — Shell Core Decomposition

**Version:** 1.0  
**Purpose:** Decompose `packages/shell/src/ShellCore.tsx` into narrower orchestration seams without changing the public shell entry contract used by current apps.  
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.  
**Implementation Objective:** Turn `ShellCore.tsx` into a thinner coordinator backed by explicit internal modules for route/access, degraded/recovery handling, shell-status derivation, redirect restoration, startup timing, SPFx host adaptation, and sign-out cleanup.

---

## Prerequisites

- PH7.1 complete.
- Review `packages/shell/src/ShellCore.tsx`, related helper modules, shell stores, docs, and Phase 5 shell ADRs.
- Inventory each import and each major inline responsibility inside `ShellCore.tsx`.

---

## Source Inputs

- `packages/shell/src/ShellCore.tsx`
- `packages/shell/src/types.ts`
- `packages/shell/src/stores/*`
- shell validation suites
- shell status/degraded/redirect/sign-out/host-bridge helpers

---

## 7.3.1 — Build the Shell Responsibility Matrix

- Identify every major concern currently coordinated by `ShellCore.tsx`: shell mode rules, route evaluation, degraded eligibility, sensitive action policy, restricted zones, recovery state, shell-status snapshot derivation, bootstrap and workspace sync, first protected render timing, redirect restore, status action dispatch, slot composition, and dev toolbar loading.
- Classify each concern as remain in `ShellCore`, move to internal orchestrator, remain in imported helper, or defer.

## 7.3.2 — Define the Target Internal Architecture

- Split internal responsibilities into clearly named orchestration seams such as route/access, degraded state, status rail, redirect restore, startup timing, SPFx bridge, and recovery signals.
- Only introduce new modules where they reduce cognitive load and isolate a meaningful policy seam.
- **Extraction target is custom React hooks, not plain modules.** Pre-validation confirmed that all pure-function helpers are already extracted and independently tested: `degradedMode.ts`, `shellStatus.ts`, `redirectMemory.ts`, `startupTiming.ts`, `spfxHostBridge.ts`, `shellModeRules.ts`, and `signOutCleanup.ts` all exist. Do not create new plain-module files for concerns already covered by these modules. The remaining extraction work targets only the `useMemo`, `useEffect`, and local state currently inlined in the `ShellCore` component body. Each seam should become a custom hook co-located in `packages/shell/src/` (e.g., `useShellDegradedRecovery.ts`, `useRouteEnforcement.ts`, `useStartupTimingCompletion.ts`, `useRedirectRestore.ts`, `useShellStatusRail.ts`, `useShellBootstrapSync.ts`, `useSpfxHostAdapter.ts`). Hooks call into the existing pure-function modules — they do not replicate their logic.

## 7.3.3 — Preserve Public `ShellCore` Contract

- Keep `ShellCore` public props stable, keep `performShellSignOut()` stable, and avoid forcing downstream app changes in this stabilization pass.
- **`index.ts` re-export update requirement:** Three exported pure functions are currently defined inside `ShellCore.tsx` and publicly re-exported from `@hbc/shell` via `index.ts` pointing at `'./ShellCore.js'`: `resolveRoleLandingPath`, `resolveShellExperienceState`, and `canCompleteFirstProtectedShellRender`. If any of these functions are relocated to a new hook file during extraction, `index.ts` must be updated to re-export them from the new module path. The public API surface of `@hbc/shell` must not change — only the origin path of the re-export changes. Record the file decision (moved vs. left in `ShellCore.tsx`) in a progress note.
- **`performShellSignOut` is already thin:** Its 7-line body fully delegates to `signOutCleanup.ts`. No decomposition is required or permitted in this pass.

## 7.3.4 — Extract Route/Access Orchestration

- Move route evaluation and access-decision coordination into a dedicated internal seam that does not own rendering or full experience-state selection.

## 7.3.5 — Extract Degraded/Recovery Orchestration

- Move degraded eligibility, sensitive action policy, restricted-zone resolution, recovery-state resolution, and recovered-state one-shot logic out of the coordinator and document the subsystem clearly.
- **`wasDegraded` state ownership — must move inside the hook:** The `wasDegraded` local state (`useState(false)`) and its tracking `useEffect` (which flips it to `true` on entering degraded mode and resets it on `recoveryState.recovered`) are tightly coupled. Both must be declared *inside* the extracted `useShellDegradedRecovery` hook. Do not retain `wasDegraded` in the `ShellCore` component and pass it as a parameter to the hook — that externalizes state that is an internal implementation detail of the degraded/recovery subsystem and defeats the encapsulation goal.

## 7.3.6 — Extract Status Rail & Action Mediation

- Move shell-status snapshot and action dispatch rules into a dedicated seam while preserving allowlist behavior and `renderStatusRail` override semantics.

## 7.3.7 — Extract Redirect/Landing Orchestration

- Isolate redirect restore and role landing-path logic; cover authenticated root load, restored target, disallowed target fallback, and route parity in tests.
- **Preserve the double-call semantics of `restoreRedirectTarget`.** In the live redirect restore effect, `restoreRedirectTarget()` is invoked twice per evaluation: once implicitly inside `resolvePostGuardRedirect()` (which returns only a path string — the resolved redirect target or fallback) and once explicitly immediately after (to obtain the full `RedirectMemoryRecord` and check `restored.pathname === resolvedPath` before deciding whether to call `clearRedirectMemory()`). The two calls serve different purposes and must not be collapsed into one or reordered. Any `useRedirectRestore` hook must replicate this exact call sequence. Collapsing or reordering the calls changes the clearing semantics and constitutes a behavior regression.

## 7.3.8 — Extract Startup Timing Completion Logic

- Isolate first-protected-render timing and snapshot callback semantics so they are auditable and testable.
- **`resolveMonotonicNowMs()` must travel with the hook.** This private unexported utility (currently at the bottom of `ShellCore.tsx`) is used exclusively by the startup timing effect to compute elapsed mount time. When the effect is extracted to a `useStartupTimingCompletion` hook, `resolveMonotonicNowMs` must be co-located in the same hook file. Do not leave it as an orphan in `ShellCore.tsx` after the effect is removed.
- **`canCompleteFirstProtectedShellRender` file decision.** This function is a public export of `@hbc/shell` (currently defined in `ShellCore.tsx` and re-exported from `index.ts`). The implementation agent must make an explicit choice: either (a) leave it in `ShellCore.tsx` and note the deliberate decision in a progress note, or (b) move it into the `useStartupTimingCompletion` hook file and update `index.ts` accordingly (per the rule in §7.3.3). Both are valid. What is not valid is moving it without updating `index.ts`.

## 7.3.9 — Keep `ShellCore` as Thin Composition Coordinator

- After extractions, `ShellCore` should mainly resolve props, invoke internal orchestrators, choose experience-state rendering branches, compose `ShellLayout`, and attach dev-only surfaces.

## 7.3.10 — Update Docs and Validation

- Update shell docs with the new internal architecture and add/refresh tests to verify route, degraded/recovery, status rail, and redirect behavior parity.
- **Zero existing component-level tests — treat setup as a discrete sub-task.** Pre-validation confirmed that `ShellCore.test.ts` currently tests only the three exported pure functions (`resolveRoleLandingPath`, `resolveShellExperienceState`, `canCompleteFirstProtectedShellRender`). No component-level or hook-level tests exist for any of the inlined behaviors this phase extracts. Build the mock and reset infrastructure as a named sub-task before writing behavioral assertions.
- **Required mock and reset infrastructure for hook/component tests:**
  - Zustand store mocking for `useAuthStore` (from `@hbc/auth`), `useNavStore`, and `useShellCoreStore` — reset to known initial state in each `beforeEach`
  - A controllable `adapter` object with a stubbable async `enforceRoute` function for route evaluation tests
  - `startupTiming.clear()` called in `beforeEach` / `afterEach` to reset the module-level singleton in `startupTiming.ts` and prevent record bleed-through between test cases
  - `clearRedirectMemory()` called in `beforeEach` / `afterEach` to reset the `inMemoryRedirectRecord` module singleton in `redirectMemory.ts`
  - `sessionStorage` mock or `vi.stubGlobal('sessionStorage', ...)` for redirect memory storage-path tests
  - `import.meta.env.DEV` flag control (`vi.stubEnv`) for tests that interact with the DevToolbar conditional — do not assume a default value

---

## Deliverables

- refactored internal shell orchestration modules
- updated shell docs
- parity tests / updated validation suites
- `docs/architecture/plans/ph7-remediation/PH7.3-Shell-Core-Decomposition.md`

---

## Acceptance Criteria Checklist

- [ ] `ShellCore.tsx` is materially thinner.
- [ ] Route/access, degraded/recovery, status rail, redirect, and startup timing logic are no longer heavily inlined.
- [ ] Public `ShellCore` contract remains stable.
- [ ] Behavior parity is preserved across degraded mode, recovery, status rail, and redirect handling.
- [ ] Build, lint, type-check, and shell tests all pass.

---

## Verification Evidence

- `pnpm turbo run build --filter=@hbc/shell`
- `pnpm turbo run lint --filter=@hbc/shell`
- `pnpm turbo run check-types --filter=@hbc/shell`
- `pnpm turbo run test --filter=@hbc/shell`

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.3 started: YYYY-MM-DD
PH7.3 completed: YYYY-MM-DD

Artifacts:
- refactored internal shell orchestration modules
- updated shell docs
- parity tests / updated validation suites
- `docs/architecture/plans/ph7-remediation/PH7.3-Shell-Core-Decomposition.md`

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

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.3 started: 2026-03-09
PH7.3 completed: 2026-03-09

Artifacts:
- `packages/shell/src/shellExperience.ts` — extracted `resolveShellExperienceState` (D1)
- `packages/shell/src/useSpfxHostAdapter.ts` — SPFx validation + signal handling hook
- `packages/shell/src/useRouteEnforcement.ts` — route evaluation + routeDecision state hook
- `packages/shell/src/useShellDegradedRecovery.ts` — degraded eligibility, experience state, policies, recovery, wasDegraded hook
- `packages/shell/src/useShellBootstrapSync.ts` — lifecycle→bootstrap mapping, experience/workspace sync hook
- `packages/shell/src/useShellStatusRail.ts` — status snapshot, action mediation, rail rendering hook
- `packages/shell/src/useRedirectRestore.ts` — redirect restore with double-call semantics hook
- `packages/shell/src/useStartupTimingCompletion.ts` — first protected render timing + resolveMonotonicNowMs + canCompleteFirstProtectedShellRender (D2)
- `packages/shell/src/ShellCore.tsx` — refactored to thin coordinator (345 lines, down from 573)
- `packages/shell/src/index.ts` — updated canCompleteFirstProtectedShellRender import path
- `packages/shell/src/ShellCore.test.ts` — 43 tests (8 existing pure function + 35 new hook behavioral)
- `packages/shell/README.md` — added Internal Architecture section
- `packages/shell/package.json` — added @testing-library/react devDependency

File decisions (per §7.3.3):
- `resolveShellExperienceState` → moved to `shellExperience.ts`, re-exported from `ShellCore.tsx` for backward compat
- `canCompleteFirstProtectedShellRender` → moved to `useStartupTimingCompletion.ts`, `index.ts` updated
- `resolveRoleLandingPath` → stays in `ShellCore.tsx` (D3, no circular import concern)
- `resolveMonotonicNowMs` → co-located in `useStartupTimingCompletion.ts` (§7.3.8)
- `performShellSignOut` → unchanged, already thin (§7.3.3)
- `wasDegraded` → inside `useShellDegradedRecovery` hook (§7.3.5)

Verification:
- check-types: PASS
- test: PASS (43/43)

Notes:
- Turbo build blocked by pre-existing @hbc/complexity ↔ @hbc/ui-kit cyclic dependency (unrelated to PH7.3)
- Direct tsc --noEmit and vitest runs confirm full type safety and behavioral parity
-->
