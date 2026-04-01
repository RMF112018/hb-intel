# Prompt-1-02 — Implement Scoped Service Resolution for Project Setup Routes

## Objective

Implement the handler-level wiring change that closes the Backend Boundary Enforcement Gap, using the decision recorded in:

`docs/architecture/reviews/project-setup-backend-boundary-remediation-decision.md`

## Preconditions

- Read the decision memo first.
- Follow the chosen architecture path exactly.
- Do not reopen the architecture decision unless repo truth forces it.

## Required working rules

- Treat live repo truth as authoritative.
- Do not re-read files already in your active context or memory unless needed to verify exact implementation details.
- Keep the change tightly scoped to this gap.
- Do not broaden the Project Setup route surface.
- Do not change frontend contract, API routes, or auth behavior unless required by the chosen coexistence model.
- Preserve the dedicated Project Setup host as the authoritative Project Setup boundary.

## Primary implementation target

Close the gap where the following Project Setup route modules still use the monolithic service factory:

1. `backend/functions/src/functions/projectRequests/index.ts`
2. `backend/functions/src/functions/provisioningSaga/index.ts`
3. `backend/functions/src/functions/acknowledgments/index.ts`
4. `backend/functions/src/functions/cleanupIdempotency/index.ts`
5. `backend/functions/src/functions/timerFullSpec/handler.ts`

## Implementation requirements

### If the decision memo selected Option A
- switch Project Setup handlers to the scoped Project Setup factory
- ensure the monolithic host can still import and run these handlers safely
- keep the monolithic host transitional
- avoid adding host-aware global state

### If the decision memo selected Option B
- implement the narrowest host-aware resolution mechanism needed
- make the host/factory selection explicit and testable
- avoid hidden ambient behavior unless fully documented and justified

### If the decision memo selected Option C
- keep duplication minimal
- document exactly why duplication was required
- ensure release-scope clarity remains strong

## Required verification

- type-check clean
- targeted backend tests green
- no route-surface drift
- no import cycles introduced
- no accidental dependency on CRUD services from Project Setup handlers

## Required documentation during implementation

Update or create an implementation note at:

`docs/architecture/reviews/project-setup-backend-boundary-remediation-implementation.md`

The note must include:

1. Chosen remediation path
2. Files changed
3. Before/after factory resolution behavior
4. Host coexistence behavior after the change
5. Any type/interface adjustments
6. Test results
7. Remaining residuals, if any

## Acceptance criteria

- The in-scope Project Setup handlers no longer resolve services through the monolithic factory unless the decision memo explicitly justifies a different pattern.
- The chosen coexistence model is clearly expressed in code.
- Project Setup route behavior remains intact.
- Implementation note is complete and evidence-based.
