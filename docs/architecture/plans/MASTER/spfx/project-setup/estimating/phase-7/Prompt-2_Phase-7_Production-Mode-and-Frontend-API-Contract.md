# Prompt 2 — Phase 7 Production Mode and Frontend API Contract

## Title
Phase 7 — Remove baked UI-review assumptions and formalize the Project Setup frontend API contract

## Objective
Refactor the Project Setup frontend so that production behavior is not hard-coded to UI-review mode. Establish a clear, explicit, production-ready frontend API contract and runtime-mode resolution strategy.

## Repository context
Work primarily in the Project Setup SPFx package, shell/bootstrap logic, runtime config surfaces, and any frontend API clients used by the Project Setup flow.

## Critical instructions
- Follow the Phase 7 contract freeze produced in Prompt 1.
- Treat the shipped Project Setup package as a standalone product surface.
- Remove or isolate any logic that hard-forces UI-review mode in a way that prevents true backend-mode execution.
- Do not break intentional UI-review capability if it is still needed; instead, make it an explicit non-production or configuration-driven mode.
- Keep production-mode logic simple, explicit, and testable.

## Required work
1. Find all frontend/runtime locations where backend mode, ui-review mode, mock mode, or similar deployment posture is forced, inferred, or silently defaulted.
2. Refactor mode selection so that:
   - production-capable mode is a first-class supported path,
   - UI-review mode is no longer the baked default for the shipped production artifact unless explicitly configured,
   - and the mode-resolution behavior is obvious from repo truth.
3. Audit all frontend API endpoints used by the Project Setup surface and document the authoritative route list.
4. Create or update a Project Setup frontend API contract document in the appropriate docs path if repo truth does not already provide one.
5. Ensure the Project Setup frontend code clearly separates:
   - runtime mode selection,
   - backend base URL/config resolution,
   - and endpoint contract definitions.
6. Add or update tests covering:
   - production/backend mode resolution,
   - UI-review mode resolution,
   - and prevention of accidental fallback into UI-review in production-intended contexts.
7. Update the Phase 7 cumulative report with the exact files changed and the resulting contract.

## Deliverables
- Code changes that remove hard-coded UI-review lock-in.
- Updated frontend API contract documentation.
- Tests proving mode resolution and route contract behavior.
- Updated cumulative Phase 7 report.

## Required report content for this prompt
Add a section named:
`Prompt 2 completion notes`

Include:
- all frontend runtime-mode changes,
- exact files where UI-review assumptions were removed or isolated,
- the authoritative frontend endpoint inventory,
- test evidence added,
- and any remaining issues that must be addressed by Prompt 3 or later.

## Acceptance criteria
- The Project Setup frontend is no longer implicitly locked into UI-review mode.
- The authoritative frontend API contract is explicit in repo truth.
- Mode resolution is test-covered and understandable.
- The resulting implementation is consistent with the Phase 7 contract freeze.
