# Phase 1 — Scope Control Package

This package contains a sequenced implementation kit for bringing the **HB Intel Estimating / Project Setup SPFx package** through **Phase 1 — Scope control**.

## Included files

1. `Phase-1_Scope-Control_Action-Plan.md`
   - Master action plan
   - Workstreams
   - Deliverables
   - Acceptance criteria
   - Execution sequence

2. `Prompt-01_Repo-Truth-and-Scope-Inventory.md`
   - Establish current truth
   - Inventory the actual frontend and backend surfaces
   - Produce a scope matrix before cutting code

3. `Prompt-02_Frontend-Isolation_Route-Tree-and-Shell-Pruning.md`
   - Isolate the package to Project Setup only
   - Remove out-of-scope routes, navigation, and shell residue

4. `Prompt-03_Backend-Scope-Alignment_and-Orphaned-Call-Removal.md`
   - Align backend scope to the isolated frontend
   - Remove or disable orphaned API expectations

5. `Prompt-04_Contract-Freeze_API-Surface-and-Types.md`
   - Freeze the allowed frontend ↔ backend contract
   - Lock request/response/error shapes and runtime config assumptions

6. `Prompt-05_Acceptance-Guards_and-Regression-Tests.md`
   - Add acceptance checks and regression protection for Phase 1 outputs

7. `Prompt-06_Final-Verification_and-Handoff.md`
   - Run the final verification pass
   - Produce handoff notes, unresolved items, and next-phase blockers

8. `Prompt-07_Phase-1-Architecture-Freeze-and-Boundary-Plan.md`
   - Freeze the backend boundary for Project Setup
   - Produce ADR-0124 and the boundary freeze plan
   - Update the audit report with remediation progress and closure criteria

9. `Prompt-08_Phase-1-Project-Setup-Domain-Host-Implementation.md`
   - Implement the dedicated Project Setup backend host / composition root
   - Scoped service factory and domain-specific host.json

10. `Prompt-09_Phase-1-Config-Auth-CORS-Identity-Scoping.md`
    - Domain-specific config validation, auth, CORS, and identity scoping

11. `Prompt-10_Phase-1-Regression-Guards-and-Release-Scope-Proof.md`
    - Regression guards and release scope proof for the Project Setup host

12. `Prompt-11_Phase-1-Documentation-Reconciliation-and-Audit-Closure.md`
    - Documentation reconciliation and audit closure

## Supporting documents

- `Phase-1_Backend-Boundary-Freeze.md`
  - Backend boundary plan with current/target state, shared-vs-host-specific split, acceptance criteria (AC-1 through AC-10), and Prompt-08 implementation checklist

## Recommended use

- Run the prompts **in order**.
- Do **not** merge work from a later prompt until the acceptance criteria from the prior prompt are satisfied.
- Treat this package as **Phase 1 only**.
- Keep list-field remapping, auth redesign, token-version hardening, and broader infrastructure work for later phases unless a prompt explicitly calls for a narrowly scoped enabling change.

## Governing intent for Phase 1

Phase 1 is complete only when all of the following are true:

- The package is isolated to **Project Setup** only.
- The active frontend surface contains **no orphaned routes or calls** for out-of-scope capabilities.
- The backend startup and callable surface are appropriate for the isolated deployment posture.
- The allowed frontend ↔ backend contract is written down and enforced in code.
- Regression guards exist so that removed scope cannot silently return later.
