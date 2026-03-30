# Prompt 06 — Final Verification and Handoff

## Objective

Run the final verification pass for Phase 2, confirm the data contract is production-accurate, and prepare a clean handoff package for the next phase.

## Context

This prompt begins only after Prompts 01–05 are complete.

## Critical instructions

- Do not re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not expand into Phase 3 work during this prompt.
- Validate what was actually implemented, not what was intended.

## Required work

1. Re-audit the active Project Setup persistence paths.
2. Verify the production `Projects` list field-map is fully centralized and in use.
3. Verify tests cover the intended contract boundaries.
4. Verify old display-name assumptions and scattered `field_*` usage are removed from active persistence code.
5. Produce a concise handoff note covering:
   - what changed
   - what was intentionally left out of Phase 2
   - any unresolved data-contract risks
   - recommended next phase blockers/actions

## Required deliverables

- Final verification markdown
- Phase 2 completion summary
- Unresolved items list, if any

## Acceptance criteria

- Phase 2 can be signed off as complete or explicitly blocked with evidence.
- A future engineer can understand the new data contract and its remaining boundaries from the handoff materials alone.
