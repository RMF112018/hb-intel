# Financial Runtime-Governance Definition — Prompt 02
## Objective
Complete the second runtime-governance definition workstream for the Financial module by defining authoritative lifecycle transitions, mutation guards, staleness/invalidation rules, and service-level enforcement posture for production-safe Financial behavior.

## Context
Prompt 01 should already be complete.
Use the updated runtime-governance material and Financial doctrine control index as the governing basis for this pass.

This prompt is still a runtime-governance pass, not a UI implementation pass.

## Critical Guardrails
- Stay grounded in repo truth, actual runtime model doctrine, and actual implementation seams.
- Do not silently preserve contradictions; resolve them explicitly where repo truth allows, and flag them where it does not.
- Do not overclaim operational maturity.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not implement page, shell, or route UI in this prompt.
- Favor service/domain enforcement over UI-only rules when defining authoritative runtime governance.

## Files to Inspect First
Inspect the repo directly and ground this pass in actual file content, especially:

### Runtime-governance sources
- files revised in Prompt 01
- Financial runtime entity model files
- Financial source-of-truth / action-boundary files
- Financial tool governance specs
- review / PER / publication / export / history / audit doctrine
- acceptance/readiness files that encode lifecycle expectations

### Likely implementation seams
- repository, service, mutation, validation, and versioning code
- audit / activity / acknowledgment / notification / work-queue related packages where Financial runtime behavior depends on them
- tests that encode lifecycle or state-transition expectations

## Required Actions
1. Identify the canonical lifecycle states for each major Financial capability.
   - At minimum, pressure-test states and transitions related to:
     - imported / loaded / normalized
     - draft / working
     - ready / blocked / warning
     - stale / invalidated / superseded
     - submitted / in review / returned / approved
     - confirmed / published / released
     - reopened / revised / re-baselined
     - historical / audit / investigation access states where relevant

2. Define authoritative transition rules.
   - For each important state transition, specify:
     - who can trigger it
     - required preconditions
     - blocking conditions
     - downstream invalidations
     - side effects
     - resulting published/shared-spine consequences
     - audit / notification / evidence implications where applicable

3. Define mutation guards and enforcement posture.
   - Make explicit what must be enforced in repositories/domain services rather than trusted to UI behavior.
   - Clarify optimistic versus pessimistic assumptions where relevant.
   - Clarify concurrency / overwrite / confirmation / idempotency expectations if repo truth materially requires them.

4. Define stale-state and invalidation behavior.
   - Explicitly govern how upstream budget changes, GC/GR changes, checklist failures, review returns, or publication-affecting edits invalidate readiness or prior outputs.
   - Clarify what becomes stale, what must be recalculated, and what remains historically preserved.

5. Define service-level evaluation boundaries.
   - Clarify which service/domain layer evaluates:
     - readiness
     - publication eligibility
     - stale-state flags
     - review return consequences
     - reopen / revise behavior
     - exception or recovery posture

6. Strengthen doctrine and, if appropriate, add contract-style acceptance artifacts.
   - If existing files are too conceptual, rewrite them into implementation-governing language.
   - If needed, create a narrowly scoped lifecycle/mutation governance file rather than scattering key rules.
   - Preferred naming pattern:
     - `Financial-Lifecycle-and-Mutation-Governance.md`

7. Update cross-references and acceptance hooks.
   - Ensure the doctrine control index, runtime-governance docs, and acceptance/readiness surfaces point to the canonical lifecycle and mutation rules.

## Deliverables
1. Revised lifecycle-governance doctrine.
2. Revised mutation-guard / service-enforcement doctrine.
3. Any new lifecycle/mutation governance doc, if needed.
4. A transition-rule summary.
5. A stale-state / invalidation summary.
6. A list of unresolved lifecycle-governance risks, if any.

## Definition of Done
This prompt is complete only when:
- the major Financial lifecycle states are explicit,
- authoritative state transitions are defined,
- service-level enforcement boundaries are explicit,
- stale-state and invalidation behavior are implementation-safe,
- and downstream implementers can enforce runtime behavior without guessing which rules are merely UI guidance.

## Output Format
Return:
1. objective completed
2. files changed
3. lifecycle-governance findings
4. mutation-guard findings
5. invalidation/stale-state findings
6. unresolved issues / follow-ups
