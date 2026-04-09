# Prompt 02 — HB Kudos Comprehensive Workflow Suite

## Objective

Build the HB Kudos portion of the comprehensive suite using the preliminary harness, extracted schema truth, and the now-refactored HB Kudos application surfaces.

## Coverage targets

At minimum, cover where repo/schema truth supports them:
- create kudos submission
- recipient resolution and persistence
- author/submitter persistence
- pending/review state
- approval transition
- rejection transition
- pin / feature workflow
- scheduled/publication workflow
- live/display-driving field validation
- celebrate/reaction workflow
- archive/history workflow
- audit-event linkage/traceability

## Your tasks

1. Identify the authoritative HB Kudos runtime/data model at local HEAD.
2. Build suite modules for the supported workflows.
3. Assert results using real field mappings from the extracted schema artifacts.
4. Document unsupported or only partially provable flows instead of guessing.

## Required outputs

1. HB Kudos suite modules under the chosen suite structure
2. `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/hb-kudos-comprehensive-test-matrix.md`
3. `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/hb-kudos-comprehensive-test-notes.md`

The matrix must include:
- workflow name
- preconditions
- list(s)/surface(s) touched
- key fields asserted
- expected results
- live-run eligibility
- cleanup behavior
- status: fully covered / partially covered / blocked
