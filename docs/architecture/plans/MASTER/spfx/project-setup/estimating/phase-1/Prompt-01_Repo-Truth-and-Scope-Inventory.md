# Prompt 01 — Repo Truth and Scope Inventory

You are continuing an in-progress architecture, deployment, and production-readiness effort for the **HB Intel Estimating / Project Setup SPFx application**.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Establish the **current repo-truth scope inventory** required to execute **Phase 1 — Scope control**.

Your job in this prompt is **not** to start broad refactors blindly. Your job is to build the authoritative inventory and decision matrix that will govern every Phase 1 code change.

## Critical instructions

- Treat the live repo as the authoritative implementation source.
- Treat the current Project Setup / Estimating SPFx source and current build behavior as frontend truth for this phase.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** assume previous findings are still correct.
- Do **not** make changes before you finish the inventory and scope matrix.
- Do **not** expand scope beyond Phase 1.

## Known Phase 1 intent

The package must become a **strictly isolated Project Setup package**.

That means this phase must identify and then remove or neutralize:
- non-Project-Setup routes
- non-Project-Setup shell affordances
- orphaned API expectations
- backend startup or route dependencies that are broader than the isolated deployment posture

## Required working approach

1. Audit the current frontend route tree.
2. Audit all visible shell/navigation affordances reachable from the Project Setup package.
3. Audit all frontend API calls still present in the active Project Setup bundle path.
4. Audit the active backend handler registration surface relevant to this package.
5. Build a matrix mapping each frontend expectation to one of:
   - `Keep — in scope and supported`
   - `Remove — out of scope`
   - `Add support — required but not currently supported`
   - `Unresolved`

## Required output before code changes

Create a markdown file in the repo, in an appropriate architecture/review/plans location, containing:

### 1. Frontend route inventory
- each route
- whether it stays or goes
- why

### 2. Visible shell inventory
- nav items
- picker items
- toolbar actions
- mode toggles
- banners / info panels
- any residual shell features

### 3. Frontend API expectation inventory
For each call/path:
- where it is initiated
- whether it is blocking or non-blocking
- whether it is in scope
- whether the backend supports it now
- whether it should be removed

### 4. Backend surface inventory
- active handlers
- routes relevant to Project Setup
- routes unrelated to Project Setup
- startup dependencies that may become boot blockers

### 5. Scope decision matrix
One authoritative matrix for Phase 1.

## Required implementation outputs

After the inventory is complete, you may make only the minimal code changes necessary to:
- document the scope matrix in repo truth
- add TODO / implementation markers if useful
- prepare the repo for Prompt 02

Do **not** yet remove routes or refactor shell code unless a tiny enabling edit is required.

## Acceptance criteria

- There is one authoritative Phase 1 scope matrix in repo truth.
- Every known frontend route and backend expectation is classified.
- Orphaned calls are explicitly listed.
- The next prompt can execute without needing to rediscover scope.

## Required summary back to me

When done, report:
- inventory file path(s)
- top items marked `Remove`
- top items marked `Add support`
- any unresolved items that could block Prompt 02
