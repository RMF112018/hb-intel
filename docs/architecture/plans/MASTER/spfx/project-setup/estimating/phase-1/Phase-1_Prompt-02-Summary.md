# Prompt 02 Summary — Frontend Isolation: Route Tree and Shell Pruning

> Completed: 2026-03-30

## Outcome

The frontend was **already correctly scoped** to Project Setup. No routes, shell affordances, or API calls needed removal. The isolation work consisted of removing vestigial bootstrap code that survived from an earlier broader app scope.

## Routes Removed

None. All four routes (`/`, `/project-setup`, `/project-setup/new`, `/project-setup/$requestId`) are in scope and retained.

## Shell Affordances Removed

None. The shell already uses `"simplified"` mode with an empty tool picker, no sidebar nav, and only Project Setup–relevant controls (back-to-hub, backend mode toggle, UI Review banner).

## Frontend Calls Removed or Neutralized

None needed removal — all active API calls (5 client methods + SignalR negotiate) are in scope and backend-supported.

## Bootstrap Scope Residue Removed

| Item | File | What Changed |
|------|------|-------------|
| `useProjectStore` mock-project seeding | `apps/estimating/src/bootstrap.ts` | Removed `useProjectStore` import, `MOCK_PROJECTS` constant, `setAvailableProjects()`, and `setActiveProject()` calls. No component consumed this data. |
| `bid-tracking` feature flag | `apps/estimating/src/bootstrap.ts` | Removed from `setFeatureFlags()` call. Flag was never read by any component. |
| `IActiveProject` type import | `apps/estimating/src/bootstrap.ts` | Removed — only used by deleted `MOCK_PROJECTS` constant. |

## Items Retained (With Rationale)

| Item | Rationale |
|------|-----------|
| `setActiveWorkspace('estimating')` | `'estimating'` is the canonical workspace ID in the shell package. Renaming would break the contract. Simplified shell ignores workspace identity anyway. |
| `'provisioning-status'` feature flag | Actively used by the provisioning status display components. |

## Remaining Frontend Scope Residue for Prompt 03

None identified. The frontend surface is cleanly isolated to Project Setup.

## Acceptance Criteria Status

| Criterion | Status |
|-----------|--------|
| Only Project Setup user journeys remain reachable | **Met** — 4 routes, all Project Setup |
| Shell no longer implies broader application surface | **Met** — simplified mode, no workspace label, no tool picker |
| No retained frontend call for out-of-scope features | **Met** — all 5 client methods + SignalR are in scope |
| `ui-review` still boots and supports Project Setup review | **Met** — bootstrap preserved, mock client intact |
