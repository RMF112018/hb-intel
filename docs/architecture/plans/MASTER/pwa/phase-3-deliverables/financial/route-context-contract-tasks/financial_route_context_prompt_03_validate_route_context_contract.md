# Financial Route / Context Contract — Prompt 03
## Objective
Validate the implemented Financial route/context contract so the module now has a canonical project-scoped route family, durable context behavior, safe project switching, reliable deep-link entry, and implementation-safe navigation patterns for downstream work.

## Context
Prompts 01 and 02 should already be complete.
This is a validation and hardening pass.
Do not expand into broad runtime-governance, business-logic, or UI redesign work unless a tightly scoped fix is required to make the route/context contract actually safe.

## Critical Guardrails
- Validate against actual changed files and tests, not memory alone.
- Do not overclaim completion.
- Do not reopen settled doctrine questions unless implementation exposed a real contradiction.
- Do not re-read files already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Prefer precise fixes over speculative rewrites.

## Validation Scope
Validate that the implemented route/context contract gives a developer clear, trustworthy behavior for the following:

### Canonical route posture
- Is there one clear canonical Financial route family?
- Are major Financial surfaces reachable through it?
- Are legacy/invalid route behaviors explicit and bounded?

### Route-safe context
- Is project identity durable?
- Are reporting period / version / artifact contexts handled safely where required?
- Is deep-link entry reliable?
- Is invalid or incomplete context handled safely?

### Project switching and return-memory
- Is project switching deterministic and cross-project safe?
- Is draft-sensitive behavior protected where required?
- Is per-project return-memory bounded and trustworthy?

### Implementation safety
- Are route builders, loaders, shell state, session state, and navigation helpers aligned?
- Are there still duplicated or contradictory context patterns?
- Can downstream Financial work now rely on the route/context contract without guessing?

## Required Actions
1. Re-read the changed route/context files and tests as needed for validation.
2. Run a coherence pass across:
   - route definitions
   - route builders / link helpers
   - deep-link entry logic
   - shell/project-context state handling
   - project switching behavior
   - return-memory behavior
   - touched docs if any
3. Fix any final inconsistencies or unsafe behaviors.
4. Validate test coverage for the critical route/context behaviors.
5. Produce a final route/context closure summary.
6. Produce a recommended downstream next-step list limited to:
   - lane implementation tasks
   - source-of-truth / action-boundary tasks
   - actionable work-surface implementation
   - acceptance/readiness hardening

## Deliverables
1. Final changed-files summary.
2. Route/context coherence verdict.
3. Implementation-safety verdict.
4. Remaining route/context gaps, if any.
5. Recommended downstream next-step sequence.

## Definition of Done
This prompt is complete only when:
- the Financial module has a validated canonical route family,
- route-safe context and re-entry behavior are proven,
- project switching and return-memory are safe and deterministic,
- route/context helpers are aligned across the implementation,
- remaining risk is explicitly documented,
- and downstream implementation can build on this contract without guessing.

## Output Format
Return:
1. objective completed
2. files changed
3. route/context coherence verdict
4. implementation-safety verdict
5. remaining route/context gaps
6. recommended next-step sequence
