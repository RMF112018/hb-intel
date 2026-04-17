# Prompt 05 — Final Validation And Closure

## Objective

Perform final repo-level and runtime-level validation for the command-band list-model provisioning work and leave a clean closure package in the repo with no unresolved ambiguity.

## Why this issue exists / current-state problem

Provisioning, seeding, and docs work are not complete until they are verified end-to-end. The runner, schema, extraction, seeded outputs, and docs must all agree, and the final provisioned result must match the two binding schema files included in this package.

## Required validation scope

Validate all of the following:

### A. Runner integrity
- local runner still starts cleanly
- Device Login remains the expected auth path
- new actions are discoverable through the runner contract
- tests/type-checks pass for touched areas

### B. SharePoint provisioning outcome
- both lists exist in HBCentral
- field/internal-name drift is not present relative to:
  - `05-List-Schema-Priority-Actions-Band-Config.md`
  - `06-List-Schema-Priority-Actions-Band-Items.md`
- seeded config row exists and is enabled
- item seed rows exist and are ordered deterministically

### C. Extraction-to-seed fidelity
- extracted Quick Links row count
- seeded item row count
- any mismatches explicitly explained
- title/URL fidelity verified

### D. Documentation fidelity
- docs reflect the final schema actually provisioned
- docs reflect the final runner/provisioning path
- hbcentral list-schema docs are discoverable and complete
- the final docs align to the two included schema files or explicitly document the migration/update that changed them

## Required closure deliverable

Create a final closure report in the repo that includes:

- summary of changes
- files changed
- commands run
- validation performed
- extraction row count vs seeded row count
- any defaults applied during migration
- final doc files updated
- remaining issues, if any, stated plainly and narrowly

The default expectation is zero material remaining issues.

## Constraints / prohibitions

- Do not close with soft language.
- Do not hide mismatches.
- Do not defer unresolved implementation gaps.
- Do not treat schema drift as acceptable without explicit migration/update explanation.
- Do not re-read files that are already in active context unless you need to verify drift, dependencies, or uncertainty after changes.

## What done really looks like

Done means:
- the repo contains a real runner-backed provisioning path
- HBCentral contains the real lists and seeded data
- the docs are complete
- the closure report proves the work is actually finished
- the final provisioned schema is proven against the two included schema files

## Proof of closure required

- closure report committed in repo
- successful validation output
- explicit statement that the workflow is complete and rerunnable
