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

## 7.3.3 — Preserve Public `ShellCore` Contract

- Keep `ShellCore` public props stable, keep `performShellSignOut()` stable, and avoid forcing downstream app changes in this stabilization pass.

## 7.3.4 — Extract Route/Access Orchestration

- Move route evaluation and access-decision coordination into a dedicated internal seam that does not own rendering or full experience-state selection.

## 7.3.5 — Extract Degraded/Recovery Orchestration

- Move degraded eligibility, sensitive action policy, restricted-zone resolution, recovery-state resolution, and recovered-state one-shot logic out of the coordinator and document the subsystem clearly.

## 7.3.6 — Extract Status Rail & Action Mediation

- Move shell-status snapshot and action dispatch rules into a dedicated seam while preserving allowlist behavior and `renderStatusRail` override semantics.

## 7.3.7 — Extract Redirect/Landing Orchestration

- Isolate redirect restore and role landing-path logic; cover authenticated root load, restored target, disallowed target fallback, and route parity in tests.

## 7.3.8 — Extract Startup Timing Completion Logic

- Isolate first-protected-render timing and snapshot callback semantics so they are auditable and testable.

## 7.3.9 — Keep `ShellCore` as Thin Composition Coordinator

- After extractions, `ShellCore` should mainly resolve props, invoke internal orchestrators, choose experience-state rendering branches, compose `ShellLayout`, and attach dev-only surfaces.

## 7.3.10 — Update Docs and Validation

- Update shell docs with the new internal architecture and add/refresh tests to verify route, degraded/recovery, status rail, and redirect behavior parity.

---

## Deliverables

- refactored internal shell orchestration modules
- updated shell docs
- parity tests / updated validation suites
- `docs/architecture/plans/PH7.3-Shell-Core-Decomposition.md`

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
- `docs/architecture/plans/PH7.3-Shell-Core-Decomposition.md`

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
