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
