# Prompt 3 — Phase 7 Route Parity and `/api/users/me/*` Endpoints

## Title
Phase 7 — Restore frontend/backend route parity, with explicit resolution of `/api/users/me/preferences` and `/api/users/me/groups`

## Objective
Eliminate route mismatch between the Project Setup frontend/shared frontend callers and the backend by implementing or reconciling all required routes. The `/api/users/me/preferences` and `/api/users/me/groups` contract must be explicitly resolved in repo truth.

## Critical instructions
- Use the authoritative contract decisions from Prompt 1 and the frontend inventory from Prompt 2.
- Do not leave ambiguous aliases unless they are intentional, documented, and tested.
- If the right answer is to migrate callers away from `/api/users/me/*`, do so comprehensively.
- If the right answer is to expose `/api/users/me/*` compatibility routes, implement them cleanly and document their purpose.
- Preserve backward compatibility only where it is justified and documented.

## Required work
1. Inventory every frontend caller relevant to Project Setup that depends on:
   - `/api/users/me/preferences`
   - `/api/users/me/groups`
   - or any other route currently lacking backend parity.
2. Decide and implement one explicit route strategy:
   - **Option A:** make `/api/users/me/*` authoritative and align backend to it, or
   - **Option B:** migrate frontend/shared callers to the authoritative backend routes and remove stale paths.
3. If `/api/users/me/groups` is required, implement the backend route and any supporting service code needed to return the expected data contract.
4. If `/api/users/me/preferences` remains needed, reconcile it against the current notifications/preferences or other shared-feature route architecture.
5. Ensure all affected frontend callers, backend handlers, and shared packages reflect the same authoritative route contract.
6. Add or update tests for:
   - route existence,
   - happy-path responses,
   - auth-required behavior,
   - and compatibility behavior where retained.
7. Update any relevant docs that still reference stale routes.
8. Update the cumulative Phase 7 report.

## Deliverables
- Route-parity code changes.
- Any needed backend handlers or compatibility endpoints.
- Updated frontend/shared callers.
- Tests and docs proving the resolved route contract.
- Updated cumulative report.

## Required report content for this prompt
Add a section named:
`Prompt 3 completion notes`

Include:
- which routes were made authoritative,
- which stale routes were removed, migrated, or aliased,
- all files changed,
- test evidence,
- and any remaining route/auth issues for later prompts.

## Acceptance criteria
- No known frontend-required Project Setup route lacks a corresponding backend implementation or intentional migration path.
- `/api/users/me/preferences` and `/api/users/me/groups` are explicitly resolved.
- Repo truth shows one coherent route contract rather than multiple conflicting assumptions.
