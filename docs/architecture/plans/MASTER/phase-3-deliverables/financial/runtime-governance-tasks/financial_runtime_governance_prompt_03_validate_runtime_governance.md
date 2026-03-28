# Financial Runtime-Governance Definition — Prompt 03
## Objective
Validate that the Financial runtime-governance package is now coherent, cross-referenced, and implementation-safe after the persistence/seam and lifecycle/mutation governance work.

## Context
Prompts 01 and 02 should already be complete.
This is a validation and closure pass.
Do not expand scope into UI implementation, route implementation, or broad product redesign unless a tiny documentation-adjacent correction is strictly necessary to complete runtime-governance normalization.

## Critical Guardrails
- Validate against actual changed files, not memory alone.
- Do not reopen broad architecture debates unless a real contradiction still exists.
- Do not overclaim production readiness.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Prefer concise corrections over speculative rewrites.

## Validation Scope
Validate that the updated runtime-governance package now gives a developer clear answers to the following:

### Persistence and seam control
- Is the authoritative persistence posture clear for each major Financial capability?
- Are transitional versus final seams explicit?
- Are repository/service ownership boundaries explicit?

### Lifecycle and mutation control
- Are canonical lifecycle states explicit?
- Are critical state transitions governed?
- Are mutation guards and service-level enforcement boundaries clear?
- Are stale/invalidation rules explicit and implementable?

### Cross-reference and doctrine safety
- Do the runtime-governance files point back to the doctrine control index and source-of-truth files where needed?
- Are tool-specific governance docs aligned with the runtime-governance decisions?
- Are unresolved contradictions explicit instead of hidden?

### Implementation safety
- Can a local code agent now implement downstream Financial runtime behavior without guessing:
  - where data persists,
  - where mutations are enforced,
  - how readiness is evaluated,
  - how review/publication transitions are controlled,
  - and how stale-state propagation works?

## Required Actions
1. Re-read the changed runtime-governance files as needed for validation.
2. Perform a coherence pass across:
   - runtime-governance control docs
   - source-of-truth / action-boundary docs
   - runtime entity model docs
   - tool-specific governance docs
   - any touched acceptance/readiness references
3. Fix any final cross-reference, wording, precedence, or contradiction problems.
4. Produce a final runtime-governance closure summary.
5. Produce a recommended next-step list for downstream work, limited to:
   - route/context implementation tasks
   - repository/service implementation tasks
   - shared-spine integration tasks
   - acceptance/readiness hardening

## Deliverables
1. final changed-files summary
2. runtime-governance coherence verdict
3. implementation-safety verdict
4. remaining runtime-governance gaps, if any
5. recommended next task category sequence

## Definition of Done
This prompt is complete only when:
- the runtime-governance package is coherent and developer-navigable,
- persistence, lifecycle, mutation, and invalidation posture are explicit,
- remaining runtime-governance risk is minimal and explicitly documented,
- and the package is ready for downstream implementation work.

## Output Format
Return:
1. objective completed
2. files changed
3. coherence verdict
4. implementation-safety verdict
5. remaining runtime-governance gaps
6. recommended next-step sequence
