# Prompt 08 — Phase 6 Backward Compatibility, Migration, and Test Truthfulness

## Objective
Close the remaining Phase 2 supporting debt by making legacy-row handling explicit and ensuring the test suite proves the real production contract rather than overstating it.

## Required work
1. Audit legacy-row handling for Project Setup requests created before the fully aligned field contract.
2. Implement the minimum responsible compatibility strategy:
   - read-compatible only, or
   - derived fallback for specific fields, or
   - explicit migration/backfill utility.
3. Rework tests so they truthfully prove:
   - real field contract behavior
   - real mapper behavior
   - real repository behavior
   - any mock-only behavior clearly labeled as mock-only
4. Narrow or relabel misleading tests, especially where a mock round-trip currently implies full production persistence proof.
5. Add regression guards so newly supported fields cannot silently disappear again.

## Critical instructions
- Favor truthfulness over test count.
- A small number of strong real-adapter tests is better than a large number of misleading mocks.
- Do not invent a broad migration if a narrow compatibility strategy is sufficient.

## Required documentation updates
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add/update:
- Phase 2 compatibility and migration progress notes
- test-truthfulness progress notes
- closure statement for backward compatibility and real-adapter proof
- any remaining legacy-row caveats

## Acceptance criteria
- Legacy Project Setup rows have an explicit handling strategy.
- Tests accurately distinguish production-path proof from mock-only proof.
- The review report reflects the real compatibility and test posture.
