# Prompt-07-02 — Phase 1 Project Setup Domain Host Implementation

## Context
You are continuing the Phase 1 backend-scope remediation for Project Setup / Estimating.

The intended target is a **shared backend service architecture with unique Function Apps per domain**. Project Setup / Estimating must become its own backend host/composition root while still consuming shared monorepo backend libraries.

Relevant review file to keep current as you work:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Critical standing instruction:
- **Do not re-read files that are already in your active context or memory unless needed to verify a contradiction, inspect a dependency you have not yet loaded, or retrieve exact evidence for docs/tests.**

## Objective
Implement the **dedicated Project Setup backend host / Function App composition root** and remove Phase 1 ambiguity about backend scope.

The end state for this prompt is that Project Setup has a thin, domain-specific backend host that carries only the routes, config, auth, permissions, and operational surface genuinely needed for Project Setup.

## Scope
This prompt is for implementation, not just planning.

Do the real repo work needed to:
- introduce or finalize the Project Setup domain host,
- isolate its route registration surface,
- isolate its dependency wiring/composition root,
- preserve shared service reuse,
- avoid unrelated domain registration in the Project Setup host.

## Required Work

### 1) Create or adapt the Project Setup domain host
Implement a dedicated host/composition root for Project Setup that:
- registers only Project Setup / provisioning routes needed for the current retained release scope,
- consumes shared middleware/helpers/adapters from centralized packages or shared backend modules,
- avoids importing unrelated domain route families,
- keeps the host thin.

If repo conventions already support multi-host Function Apps, follow those conventions. If not, introduce the minimal durable pattern needed for per-domain hosts without destabilizing the repo.

### 2) Extract route registration to domain-specific composition
Refactor route registration so Project Setup host composition is explicit and auditable.

The Project Setup host should include only the capabilities that genuinely belong to the Project Setup domain boundary, such as the request/provisioning/admin surfaces that are part of its retained scope.

Do **not** carry unrelated domains like leads, risk, contracts, scorecards, PMP, etc. in the Project Setup host just because they exist in shared code today.

### 3) Isolate dependency initialization
Refactor dependency initialization so the Project Setup host only wires what it needs.

This includes:
- domain-specific route registration
- domain-specific config validation surface
- domain-specific auth posture
- domain-specific downstream service initialization assumptions
- domain-specific observability hooks where appropriate

Preserve shared adapters/services, but do not force the Project Setup host to construct unrelated services or carry unrelated runtime assumptions.

### 4) Preserve shared-service architecture
Shared code should remain centralized.

Do not:
- copy/paste service implementations,
- create one-off domain forks of shared helpers unless absolutely required,
- duplicate middleware or adapters.

Do:
- refactor shared pieces into reusable modules if needed,
- keep hosts as thin import-and-compose layers.

### 5) Preserve current retained behavior
Do not regress:
- requester route behavior,
- `ui-review` mode,
- Project Setup request lifecycle flows already in scope,
- legitimate Project Setup oversight/admin behaviors that belong to the Project Setup domain.

## Required Tests / Validation
Add or update targeted tests proving the new boundary.

At minimum, add or update tests that prove:
- Project Setup host does not register unrelated routes.
- Project Setup host does register all retained Project Setup routes.
- host-specific dependency wiring does not require unrelated services.
- any legacy broad-host tests are updated so they no longer falsely imply Project Setup is still meant to be monolithic.

Run the most targeted relevant tests. Favor precise verification over broad repo churn.

## Required Documentation Updates
Update `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md` with:

### Progress Notes
- what host/composition-root change was implemented,
- what routes were included/excluded,
- what service/container changes were made,
- what tests were added/updated and their results.

### Closure Statement
Add a clear statement indicating whether the **backend scope freeze portion of Phase 1** is now:
- closed,
- substantially closed with named residuals,
- or still open.

Do not overstate closure.

### Evidence
List the exact file paths proving the host split and route isolation.

Also update any related architecture docs or phase handoff docs necessary to keep repo truth honest.

## Constraints
- No duplicated backend codebase.
- No fake isolation achieved only by comments/docs.
- No unrelated route registration inside the Project Setup host.
- No weakening of least privilege or auth/config scoping.

## Deliverables
1. Working Project Setup domain host / composition root.
2. Updated tests proving route/dependency scope.
3. Updated review report with progress notes, closure statement, and evidence.

## Final Response Requirements
In your final response, summarize:
- host created or updated,
- in-scope route families,
- excluded route families,
- test results,
- remaining Phase 1 residuals, if any.
