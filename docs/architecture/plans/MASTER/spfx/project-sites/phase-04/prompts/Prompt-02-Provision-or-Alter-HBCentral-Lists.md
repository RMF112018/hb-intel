# Prompt 02 — Provision or Alter HBCentral Lists

## Objective
Provision any missing bridge lists at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` and alter any existing equivalent lists that require schema changes so the bridge has authoritative storage before discovery and matching begin.

## Current gap to close
The package now requires live HBCentral list readiness. Discovery and matching must not depend on hand-created lists, partial schemas, or undocumented admin follow-up work.

## Governing files and authorities

Inspect and align to:

- `00-Legacy-Project-Fallback-Bridge-Spec-and-Implementation-Plan.md`
- `01-Implementation-Waves.md`
- output of Prompt 01
- existing repo provisioning tooling, list descriptor patterns, and HBCentral list documentation seams

## Required repo inspection areas

Inspect the live repo for the correct places to implement:

- SharePoint list provisioning tooling
- PnP / Graph / admin-runner / local-runner seams already used for list provisioning
- list descriptor definitions
- schema documentation patterns
- any HBCentral-specific provisioning precedents

Use repo-truth provisioning patterns if they already exist. Do not invent a disconnected manual workflow if the repo already has a governed provisioning path.

## Required implementation outcome

Provision or alter the required bridge lists at HBCentral.

Required lists:

1. `Legacy Project Fallback Registry`
2. `Legacy Project Fallback Sync Runs`

If equivalent lists already exist:

- detect them
- compare live schema to the governed descriptor shape
- apply required alterations
- do not create competing duplicates unless repo truth proves there is no safe alternative

## Required implementation details

- Ensure the lists are hosted at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Create all required fields with the correct field types.
- Add any required indexes or constraints if the provisioning pattern supports them.
- Keep descriptor definitions aligned to the live schema.
- Update or create any list-schema documentation required by the repo's standards.
- Capture enough proof that the live HBCentral site is the storage host for these bridge lists.

## Proof of closure

Provide:

- exact files added or modified
- the provisioning / alteration entrypoint(s)
- the final governed field set for each list
- evidence that the lists now exist at HBCentral or were altered successfully there
- evidence that descriptors match the live provisioned schema
- a brief note on any schema mutation that could not be automated and why

## Constraints

- Do not begin annual-site discovery yet beyond any minimal validation needed to prove the provisioning flow works.
- Do not leave required list creation as a manual instruction-only outcome if repo-truth tooling can perform the work.
- Do not create extra lists casually.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
