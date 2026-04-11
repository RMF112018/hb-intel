# Prompt 06 — Closure Report and Suite Operations Guide

## Objective

Close the package by producing the final suite report, operations guide, and explicit statement of what is comprehensively covered versus what remains deferred or manual.

## Your tasks

1. Run or dry-run the final suite as appropriate for the local environment.
2. Produce a closure report naming the actual covered surfaces and workflows.
3. Produce an operations guide explaining how future operators should run, extend, and troubleshoot the suite.
4. Explicitly identify remaining gaps and manual-validation needs.

## Required outputs

1. `docs/architecture/reviews/people-kudos-comprehensive-test-suite-closure-report.md`
2. `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-kudos-comprehensive-suite-operations-guide.md`

## Closure-report requirements

The closure report must state:
- which suite modules were created
- which named application surfaces are covered
- which workflows are fully covered
- which workflows are partially covered
- which workflows remain blocked or manual
- what packaging/deployment smoke coverage exists
- what evidence was produced
- the top remaining next actions

## Operations-guide requirements

The operations guide must include:
- prerequisites
- config/auth requirements
- run commands
- suite filters/options
- dry-run vs live-run behavior
- cleanup controls
- extension guidance
- common failure modes
- how to update the suite after future product changes

## Final rules

- Do not declare comprehensive coverage where proof is missing.
- Do not bury manual-only validations.
- Do not skip naming the real surfaces and workflows.
- Keep the final report accurate, explicit, and operationally useful.
