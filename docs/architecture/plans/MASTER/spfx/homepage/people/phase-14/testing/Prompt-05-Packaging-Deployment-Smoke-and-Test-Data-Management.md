# Prompt 05 — Packaging, Deployment Smoke, and Test-Data Management

## Objective

Add the final smoke-validation layer and the operational safety controls needed to run the comprehensive suite repeatedly against the refactored application surfaces.

## Your tasks

1. Add lightweight packaging/deployment smoke validation where the repo/runtime supports it.
2. Validate package/build artifacts for the refactored webparts.
3. Add robust synthetic test-data tracking and cleanup controls.
4. Produce an operator-facing smoke/run guide.

## Coverage targets

At minimum, cover:
- package build success
- manifest inclusion / registration checks
- stale-artifact prevention checks where relevant
- smoke checks for named refactored surfaces
- cleanup/reporting for test-created items
- optional retention mode for debugging

## Required outputs

1. Smoke-validation and cleanup modules under the chosen suite structure
2. `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-kudos-packaging-and-smoke-guide.md`
3. `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-kudos-test-data-management.md`

The test-data management doc must explain:
- test prefixes/markers
- correlation IDs
- cleanup strategy
- failure-safe behavior
- how to avoid touching non-test records
