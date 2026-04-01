# Prompt-1-01 — Architecture Decision and Coexistence Plan

## Objective

Resolve the **dual-host coexistence decision** required to remediate the Backend Boundary Enforcement Gap for Project Setup, then document the chosen approach before any implementation changes are made.

## Context

Validated gap:

- the dedicated Project Setup host exists
- the scoped Project Setup service factory exists
- but the retained Project Setup handler modules still import and call the monolithic `createServiceFactory()`
- therefore boundary enforcement is structural only, not runtime-enforced at handler/service-resolution level

The main complication is that the same Project Setup route modules are imported by both:

- `backend/functions/src/hosts/project-setup/index.ts`
- `backend/functions/src/index.ts`

So simply swapping imports may change behavior in both hosts.

## Required working rules

- Treat live repo truth as authoritative.
- Do not assume prior reports are correct when contradicted by code.
- Do not re-read files already in your active context or memory unless needed to verify a contradiction or capture exact evidence.
- Do not implement the code change yet in this prompt unless a tiny exploratory scaffold is strictly necessary.
- Prefer the narrowest change that truthfully closes the gap.
- Avoid unnecessary duplication.

## Files to inspect first

- `backend/functions/src/index.ts`
- `backend/functions/src/hosts/project-setup/index.ts`
- `backend/functions/src/hosts/project-setup/service-factory.ts`
- `backend/functions/src/services/service-factory.ts`
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`
- `backend/functions/src/functions/acknowledgments/index.ts`
- `backend/functions/src/functions/cleanupIdempotency/index.ts`
- `backend/functions/src/functions/timerFullSpec/handler.ts`
- any tests that exercise Project Setup routes through the monolithic host
- `docs/architecture/adr/ADR-0124-project-setup-backend-host-boundary.md`
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`

## Decision options to evaluate

### Option A
Use `createProjectSetupServiceFactory()` for the Project Setup route modules in both the dedicated host and the monolithic host.

### Option B
Introduce host-aware factory selection or explicit dependency injection so Project Setup handlers choose the factory based on host context.

### Option C
Create separate host-specific handler registrations or duplicate route modules.

## Required analysis

1. Determine whether the monolithic host can safely use the scoped Project Setup factory for Project Setup routes.
2. Determine whether any existing tests or code paths require Project Setup handlers to receive the full monolithic `IServiceContainer`.
3. Determine whether `IProjectSetupServiceContainer` needs type changes to support migration cleanly.
4. Determine whether host-aware injection is actually necessary or just theoretically possible.
5. Recommend one option as the implementation path.

## Required output

Create a decision memo at:

`docs/architecture/reviews/project-setup-backend-boundary-remediation-decision.md`

The memo must include:

1. Executive summary
2. Current coexistence posture
3. Findings from repo truth
4. Assessment of Options A/B/C
5. Recommended decision
6. Risks of the chosen option
7. Why the rejected options were rejected
8. Exact implementation impact by file
9. Explicit unresolved questions, if any

## Acceptance criteria

- The memo clearly selects one path.
- The memo is specific enough to let the next prompt implement without redoing the architecture decision.
- If Option A is viable, say so explicitly.
- If Option A is not viable, prove why with exact repo evidence.
