# Phase 8 Plan — Project Setup Frontend/Backend Reconciliation and Production Readiness

## Objective

Resolve the remaining production blockers and ambiguous implementation areas for the Project Setup SPFx solution by reconciling the current `.sppkg` build, current repo truth, and the intended production deployment model.

## Why Phase 8 Exists

The prior audit established that current repo source code is materially more mature than the attached `.sppkg` artifact posture, but several critical items remain unresolved or only partially complete:

- the packaged shell/runtime-config contract may be stale relative to current source
- same-origin `/api/users/me/*` dependencies are not yet clearly owned or resolved
- the backend host surface remains broader than the Project Setup release surface
- production prerequisites are not yet fully hardened into release gates
- CORS origins are not configured
- SharePoint API-access approvals are not yet granted
- production requires a user-assigned identity before go-live

## Target End State

By the end of Phase 8, the repo should demonstrate all of the following:

| Area | Target End State |
|---|---|
| Build artifact truth | Current `.sppkg` build is verified, reproducible, and reconciled with runtime contract expectations |
| SPFx runtime contract | Shell bundle injects the correct runtime config for function URL, backend mode, token audience, and any other required mount inputs |
| Identity dependency surface | Any `/api/users/me/*` dependency is either properly implemented in the sanctioned host or fully removed/replaced |
| Backend scope | Project Setup release surface is narrowed or explicitly gated so unrelated routes do not create avoidable blast radius |
| Managed identity posture | User-assigned identity is the documented and implemented production path |
| Operational prerequisites | API-access approvals, CORS configuration, and site/app grants are represented as explicit deployment gates |
| Startup/release hardening | Missing production prerequisites fail clearly and intentionally, without ambiguous demo-path behavior |
| Documentation | Phase 8 plan and review report provide repo-truth evidence, closure notes, and remaining external prerequisites |

## Workstreams

### 1. Build and Artifact Reconciliation
- verify current packaging pipeline
- generate and audit a fresh `.sppkg`
- compare packaged shell/app behavior to current source truth
- eliminate stale artifact/runtime-config drift

### 2. Frontend Runtime and Token Contract
- reconcile shell mount config
- verify `functionAppUrl`, `backendMode`, `allowBackendModeSwitch`, and `apiAudience`
- verify production-mode gating behaves correctly in packaged form

### 3. Missing Route / Identity Surface Resolution
- determine ownership of `/api/users/me/preferences` and `/api/users/me/groups`
- determine whether they are dead dependencies, shell-owned endpoints, or backend-owned endpoints
- implement the correct production path

### 4. Backend Boundary and Scope Reduction
- reduce avoidable coupling between Project Setup release surface and unrelated functions
- preserve only what is required for this release posture
- document any retained broader host scope with explicit rationale

### 5. User-Assigned Identity Migration
- shift production guidance and config validation toward user-assigned identity
- ensure SharePoint and Graph access assumptions reflect that model

### 6. Operational Gates
- represent API-access approvals, CORS, Graph/SharePoint grants, and deployment-time prerequisites as first-class release gates
- do not fake completion for items that require tenant admin action

### 7. Final Verification and Documentation
- run end-to-end repo-truth verification
- update the report with closure statements and residual external actions
- confirm whether the solution is code-ready, ops-ready, or still blocked

## Execution Order

1. artifact audit and scaffolding
2. shell/runtime-config/token reconciliation
3. route ownership resolution
4. backend boundary reduction
5. user-assigned identity implementation alignment
6. operational gate implementation
7. startup/release hardening
8. final verification and reconciliation

## Definition of Done

Phase 8 is done only when:

- the packaged artifact and source truth agree on the runtime contract
- ambiguous identity-related frontend route dependencies are resolved
- the backend host surface is appropriately constrained or intentionally justified
- user-assigned identity is reflected in code, docs, and deployment expectations
- approvals/CORS/site grants are explicit operational blockers with hard release-gate treatment
- the final report distinguishes:
  - code-complete items
  - operator-executed prerequisites
  - remaining unresolved risks
