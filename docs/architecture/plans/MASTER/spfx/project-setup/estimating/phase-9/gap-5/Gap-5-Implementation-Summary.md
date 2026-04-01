# Gap 5 Implementation Summary — Project Setup Authorization Convergence

## Objective

Implement the full future-state resolution for Gap 5 by converging Project Setup onto a single Microsoft Entra claim-based authorization architecture for interactive users, privileged users, and workload/app-only execution.

## Target End-State

The repo should exit this work with the following steady-state posture:

- **Authentication:** Microsoft Entra Bearer tokens only
- **Delegated API access:** explicit delegated scope enforcement for browser/SPFx callers
- **Privileged user authorization:** app roles in the `roles` claim
- **Resource authorization:** stable `oid`-based ownership and assignment checks
- **Workload authorization:** app-only roles for automation, timers, and internal execution paths
- **Operational assignment:** groups assigned to app roles in Entra, while the API authorizes from `roles`
- **Break-glass:** explicit audited override role, not env-based UPN allowlists
- **Deprecated steady-state behavior:** request-time env authorization via `ADMIN_UPNS` and `CONTROLLER_UPNS`

## Why this is the right target

This package is structured around current Microsoft guidance that says APIs should:

- authorize the calling app via delegated scope for user-delegated access,
- authorize the user to the specific resource using stable claims such as `oid` / `sub`,
- use app roles for workload/app-only authorization,
- prefer managed identities for Azure-hosted workloads,
- avoid designs that depend permanently on raw group claims because of token overage and portability concerns.

## Scope of the prompt package

This package is designed to fully cover the repo-owned implementation work required to resolve Gap 5 for a future-proof production release, including:

1. contract freeze and current-state inventory
2. target authorization architecture and route-policy matrix
3. Entra app registration and API scope/app-role contract
4. shared backend authorization policy engine
5. stable identity (`oid`) migration and dual-write/read compatibility
6. request-lifecycle authorization convergence
7. provisioning/admin-route authorization convergence
8. workload/app-only authorization for timers and internal operations
9. SPFx/frontend contract alignment and diagnostics
10. telemetry, break-glass, and auditability
11. tests, release gates, and security hardening
12. documentation, runbooks, and cutover plan
13. final reconciliation and closure evidence

## Repository Areas Expected to Change

- `backend/functions/src/**`
- `packages/provisioning/src/**`
- `packages/models/src/**`
- `apps/estimating/src/**`
- `apps/estimating/config/**`
- `tools/spfx-shell/src/**` if frontend/runtime contract work is needed
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/**`
- `docs/architecture/reviews/**`

## Required Central Artifacts

All prompts should maintain these central artifacts unless a prompt explicitly says otherwise:

- **Implementation report:** `docs/architecture/reviews/project-setup-gap-5-implementation-report.md`
- **Plan directory:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/`
- **Key summary docs expected by the end of the package:**
  - `Gap-5_Target-Authorization-Architecture.md`
  - `Gap-5_Route-Policy-Matrix.md`
  - `Gap-5_Entra-App-Role-and-Scope-Contract.md`
  - `Gap-5_Oid-Migration-and-Data-Contract.md`
  - `Gap-5_Workload-and-Break-Glass-Model.md`
  - `Gap-5_Cutover-and-Rollback-Runbook.md`
  - `Gap-5_Acceptance-and-Closure.md`

## Non-Negotiable Implementation Principles

- Treat **live repo truth** as authoritative.
- Do not re-read files that are still in active context or memory unless needed to verify a contradiction or capture exact evidence.
- Prefer **official Microsoft documentation** for platform guidance.
- Preserve a clean separation between:
  - token validation,
  - delegated API scope checks,
  - business-role authorization,
  - resource ownership/assignment checks,
  - workload/app-only authorization.
- Do not leave any permanent authorization decision on env-based UPN lists.
- Preserve backward compatibility where necessary, but make the migration direction explicit and finite.
- Do not merge unrelated cleanup unless it directly reduces authorization ambiguity or release risk.

## High-Level Ordered Work Plan

1. Freeze target posture and inventory current auth surfaces.
2. Define the route-policy matrix and target role/scope model.
3. Define Entra app roles, delegated scope contract, and environment dependencies.
4. Build the shared policy engine and claims model.
5. Introduce stable `oid`-based identity persistence and compatibility shims.
6. Migrate request lifecycle authorization to policy + ownership checks.
7. Migrate provisioning/admin authorization to the same model.
8. Formalize workload/app-only authorization for timers/internal paths.
9. Align SPFx/frontend diagnostics and token assumptions.
10. Add telemetry, break-glass, and audit support.
11. Add exhaustive tests and release gates.
12. Finalize docs, cutover, rollback, and acceptance.
13. Produce a final closure report proving Gap 5 is resolved in repo-owned code.

## Exit Criteria

This work is complete when repo truth shows:

- no permanent request-time authorization based on `ADMIN_UPNS` / `CONTROLLER_UPNS`,
- all privileged user routes enforce app-role-based authorization,
- delegated routes explicitly enforce scope and ownership/resource checks,
- workload/app-only routes enforce workload roles,
- identity persistence uses stable IDs and not only UPN/email,
- telemetry and release gates prove the final model,
- docs and runbooks explain deployment, cutover, rollback, and operational ownership,
- the final implementation report clearly marks Gap 5 as closed in repo-owned code.
