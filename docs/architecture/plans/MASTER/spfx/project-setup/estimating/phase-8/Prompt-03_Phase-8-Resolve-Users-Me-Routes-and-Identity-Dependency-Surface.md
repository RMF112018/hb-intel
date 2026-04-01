# Prompt-03 — Phase 8 Resolve `/api/users/me/*` Routes and Identity Dependency Surface

## Objective

Resolve the ambiguous ownership of the frontend’s `/api/users/me/preferences` and `/api/users/me/groups` dependencies and eliminate any dead, misplaced, or production-blocking identity/data-access assumptions.

## Context

The audit identified same-origin frontend calls that do not appear to be satisfied by the currently audited Functions host. The correct answer is not yet known. This prompt must resolve that ambiguity by repo truth and then implement the right production path.

## Required Working Rules

- Do not assume these routes belong in the current backend.
- Do not assume they should remain in the frontend.
- Do not re-read files that are still within your active context or memory unless needed to verify a contradiction, inspect exact evidence, or resolve an ambiguity.
- Resolve the narrowest production-correct answer, not the most expansive one.

## Tasks

### 1. Audit the true dependency graph
Determine:
- where these `/api/users/me/*` calls originate in source truth
- whether they still exist in current source or only in packaged output
- whether they are PWA-only, shell-only, legacy-only, or active Project Setup release-scope dependencies
- whether they are part of sanctioned identity flow or stale leftover code

Audit all relevant callsites and consuming components.

### 2. Determine the correct production architecture
Based on repo truth, choose the correct resolution path:

#### Path A — Dead dependency
If the calls are stale or not required for Project Setup release scope:
- remove them from the active Project Setup surface
- replace them with existing sanctioned sources where needed
- clean up dead code and related wiring

#### Path B — Legitimate dependency, wrong host
If the capability is legitimate but belongs in a different host or service:
- refactor the frontend to use the correct sanctioned data source
- do not quietly leave the wrong dependency in place

#### Path C — Legitimate dependency, should be in this backend
If repo truth proves the Project Setup release surface genuinely requires these routes in the current backend:
- implement them properly
- secure them correctly
- document why they belong here
- ensure they are not stubs or misleading partial implementations

### 3. Resolve Graph search assumptions
The packaged artifact also surfaced a direct `graph.microsoft.com/v1.0/users` dependency. Determine whether that should remain:
- direct from frontend via sanctioned SPFx/Graph path
- proxied through backend
- removed/replaced

Use repo truth and production-correct least-privilege reasoning.

### 4. Clean up boundary confusion
Wherever the final answer lands, remove ambiguity in:
- code comments
- routing assumptions
- data-source selection
- production-readiness docs

## Deliverables

### Code / Repo Deliverables
- implementation of the chosen correct path
- removal of stale dependencies where appropriate
- secure route implementation if such routes are truly required
- cleaned-up frontend callsites and data-source wiring

### Documentation Deliverables
Update the Phase 8 report with:
- findings on `/api/users/me/*`
- final architecture decision
- rationale for why the chosen path is correct
- files changed
- closure statement for Prompt-03
- carry-forward items for Prompt-04+

## Completion Standard

This prompt is complete only when the Project Setup release surface no longer has ambiguous identity/data-access dependencies that “might exist somewhere else.”
