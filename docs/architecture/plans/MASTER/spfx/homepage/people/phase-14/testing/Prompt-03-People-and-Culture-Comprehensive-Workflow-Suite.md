# Prompt 03 — People & Culture Comprehensive Workflow Suite

## Objective

Build the People & Culture portion of the comprehensive suite using the preliminary harness, extracted schema truth, and the now-refactored People & Culture public and operational data model.

## Coverage targets

At minimum, cover where repo/schema truth supports them:
- create announcement
- create celebration / milestone item
- create culture-program/event item
- audience targeting vs company-wide behavior
- media/profile-photo-driving fields where testable
- draft / submit / approve / reject transitions
- schedule / publish-live transitions
- expiration / suppression / archive transitions
- homepage-governance-driving fields and override signals
- milestone-candidate review flow where supported

## Your tasks

1. Identify the authoritative People & Culture runtime/data model at local HEAD.
2. Build suite modules for supported workflows.
3. Assert workflow outcomes using proven field mappings.
4. Separate proven coverage from inferred/blocked coverage.

## Required outputs

1. People & Culture suite modules under the chosen suite structure
2. `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-culture-comprehensive-test-matrix.md`
3. `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-culture-comprehensive-test-notes.md`

The matrix must include:
- workflow name
- content family
- preconditions
- list(s)/surface(s) touched
- key fields asserted
- expected results
- live-run eligibility
- cleanup behavior
- status: fully covered / partially covered / blocked
