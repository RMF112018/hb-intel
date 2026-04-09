# Prompt 01 — Test Architecture and Shared Harness Foundation

## Objective

Turn the preliminary workflow harness into a structured, extensible shared testing foundation that can support comprehensive coverage across the refactored People & Culture / HB Kudos application surfaces.

## Your tasks

1. Inspect the preliminary harness and identify what should be preserved vs refactored.
2. Create or normalize the shared test architecture.
3. Separate shared utilities from domain-specific suites.
4. Establish safe synthetic data conventions and cleanup rules.
5. Create a clear run model for dry-run, live-run, targeted-suite, and full-suite execution.

## Preferred implementation shape

Use a disciplined TypeScript/Node structure under a logical testing path, for example:
- `scripts/testing/people-kudos/`
  - `shared/`
  - `kudos/`
  - `people-culture/`
  - `companions/`
  - `smoke/`
  - `fixtures/`
  - `runAll.ts`
  - `runSuite.ts`

You may adjust the structure if local repo conventions strongly suggest a better fit.

## Required foundation capabilities

- config loading
- auth/token handling consistent with the local environment
- deterministic synthetic data generation
- correlation/test-run IDs
- dry-run mode
- live-run mode
- structured pass/fail/warn output
- step-level logging
- cleanup helpers scoped only to harness-created items
- explicit assertion helpers
- suite filtering by domain/workflow

## Required outputs

1. Shared test foundation code
2. `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-kudos-comprehensive-test-architecture.md`
3. `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-kudos-comprehensive-test-inventory.md`

The architecture doc must explain:
- suite structure
- shared helper responsibilities
- config/runtime prerequisites
- synthetic data rules
- cleanup policy
- extension model for future workflows

The inventory doc must list:
- suite modules
- named workflows intended to be covered
- which are currently proven vs partially inferable
