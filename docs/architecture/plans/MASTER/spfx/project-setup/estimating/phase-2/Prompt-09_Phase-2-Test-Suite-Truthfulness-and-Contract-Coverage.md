# Prompt 14 — Phase 2 Test Suite Truthfulness and Contract Coverage

## Objective
Resolve the Phase 2 audit finding that the test posture can overstate persistence completeness by ensuring the test suite proves the **real** production contract rather than a mock-only round-trip.

## Critical instructions
- Prioritize truthfulness over test volume.
- A smaller number of strong production-path tests is better than a large number of misleading mocks.
- Keep tests fast where possible, but do not fake proof of persistence completeness.
- Do not remove useful mocks unless they are actively misleading; instead, re-scope or rename them to reflect what they actually prove.

## Context
The prior audit identified a problem:
- the real mapper tests were valuable
- but at least one mock-based test could imply broader persistence coverage than the real SharePoint adapter actually provided

Now that the SharePoint schema has been updated and the mapper/repository should be aligned, the tests need to prove that truth directly.

## Required work
1. Audit the existing Phase 2-related tests.
   - identify which tests exercise:
     - the real field contract
     - the real mapper
     - the real repository adapter behavior
     - mock-only behavior
   - identify which test names or assertions currently overstate what is actually being proven

2. Strengthen real-adapter contract coverage.
   - add or update tests so the real mapper and repository prove persistence of the canonical Phase 2 field set
   - include the formerly missing fields, now expected to persist
   - include backward-compatibility / missing-column / missing-value handling where appropriate

3. Fix misleading test posture.
   - rename, split, or narrow tests that currently suggest full persistence proof when they only validate in-memory behavior
   - make mock-based tests explicit about their scope

4. Add regression guards against future contract drift.
   - ensure a future schema/mapper regression cannot silently drop the newly supported fields without failing tests
   - include exact field-coverage expectations where that is maintainable

5. Keep test organization clean.
   - avoid duplicated assertions in too many places
   - prefer a clear separation between:
     - field-contract tests
     - mapper tests
     - repository behavior tests
     - mock-only behavior tests

## Files likely in scope
Likely:
- `backend/functions/src/services/__tests__/projects-list-mapper.test.ts`
- `backend/functions/src/services/__tests__/sp-field-mapping.test.ts`
- repository adapter tests
- any schema/contract validation tests relevant to Phase 2

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 2 testing progress note** that:
- distinguishes real-adapter proof from mock-only proof
- records what was changed to make the suite truthful
- states whether the earlier “misleading test” concern is now closed or only reduced

Add a **closure statement draft** such as:
- “Phase 2 test coverage now proves the real production persistence contract rather than implying completeness from mock-only round-trips.”

## Evidence requirements
The review doc update must include:
- exact tests added / updated / renamed
- what each category of test now proves
- any remaining blind spots

## Acceptance criteria
- The test suite truthfully represents what is and is not proven.
- The canonical persisted field set is covered by real contract/mapping/repository tests.
- Misleading mock-only proof has been removed, narrowed, or explicitly labeled.
- The review doc is updated with progress notes, closure status, and evidence.
