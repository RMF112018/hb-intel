# Execution Prerequisites and Scope Lock

## Hard prerequisite

This package must **not** be executed until all earlier split/implementation prompt packages have been completed.

At the start of execution, the agent must verify and document:

1. Which prompts from the split-initiation package were executed.
2. Which prompts from the HB Kudos companion package were executed.
3. Which prompts from the People & Culture companion package were executed.
4. Whether the preliminary workflow harness exists and runs.
5. Which SharePoint schema artifacts currently exist and are authoritative.

If those prerequisites are not proven, stop and produce a blocker report.

## Scope lock

This package exists to **create the comprehensive test suite**, not to finish product implementation.

Allowed work:
- test architecture
- test helpers
- fixtures/config
- coverage modules
- smoke validation
- operator docs
- completion report

Disallowed work unless narrowly required to unblock the suite:
- material UX redesign
- material runtime redesign
- broad product refactors not required by testing
- speculative workflow changes to make tests pass

## Authoritative inputs

Use local repo HEAD plus the already-generated schema/report artifacts and preliminary test harness as the final basis for test construction.

Expected supporting inputs include:
- the split-initiation package outputs
- the final People & Culture implementation outputs
- the final HB Kudos implementation outputs
- extracted SharePoint schemas under `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/`
- the preliminary workflow test harness and related docs

## Coverage principle

The suite must name the actual application surfaces and workflows it covers.

At minimum, coverage reporting must distinguish:
- HB Kudos public
- People & Culture public
- HB Kudos companion / moderation
- People & Culture HR operating companion
- shared list/API lifecycle validations
- packaging/deployment smoke validations

## Proof principle

Do not mark a workflow as comprehensively covered unless:
- its list/schema/runtime basis is known,
- the suite contains a named test for it,
- and the expected result is explicitly asserted.
