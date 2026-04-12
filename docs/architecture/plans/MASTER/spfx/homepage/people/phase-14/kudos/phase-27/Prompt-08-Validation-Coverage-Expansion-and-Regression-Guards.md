# Prompt-08 — Validation Coverage Expansion and Regression Guards

## Objective

Close the finding that the current proof posture is too packaging-centric and does not sufficiently validate the real Kudos UX, moderation behavior, and accessibility risk surface.

This prompt is about **validation and regression coverage only**.

## Active finding only

Only remediate this finding:
- validation is too packaging-centric for the real UX risk profile

Do not use this prompt to keep changing production UI unless validation work exposes a specific defect that must be fixed immediately to make the tests honest.

## Repo-truth starting footprint

At minimum inspect:

- `scripts/testing/people-kudos/smoke/index.ts`
- `apps/hb-webparts/src/homepage/__tests__/kudosDoctrineGuards.test.ts`
- any existing dev-harness / Playwright / Vitest seams relevant to Kudos
- current `data-hbc-testid` contracts in the public and companion surfaces

## Required work

1. Expand validation beyond packaging and manifest linkage.
2. Add meaningful automated coverage for:
   - public-surface rendering hierarchy,
   - composer flow,
   - archive expand/search,
   - full-feed access,
   - reader opening,
   - companion filter behavior,
   - companion detail opening,
   - action availability by state,
   - degraded-state rendering where practical,
   - focus handling,
   - reduced-motion / accessible interaction seams where practical.
3. Preserve useful existing smoke and doctrine-guard tests.
4. Make the new coverage resilient and maintainable.

## Exhaustive scrub requirement

- Remove stale or misleading test coverage claims.
- Remove obsolete test selectors if the touched surfaces no longer need them.
- Ensure no new test silently encodes the old weak UX model after Prompt-06.

## Not acceptable

- Adding only more packaging checks
- Adding brittle screenshot tests without validating real behavior
- Adding tests that merely prove presence of DOM without proving workflow correctness

## Closure standard

Do not declare this finding closed until you provide:
1. the coverage matrix before and after,
2. the touched test files,
3. the key new user-path assertions,
4. any intentionally deferred coverage and why,
5. why the suite now matches the real risk surface materially better.
