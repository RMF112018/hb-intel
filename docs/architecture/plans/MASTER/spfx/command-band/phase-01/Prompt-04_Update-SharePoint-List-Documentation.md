# Prompt 04 — Update SharePoint List Documentation

## Objective

Perform a comprehensive update to the SharePoint list documentation under `/Users/bobbyfetting/hb-intel/docs/reference/sharepoint/list-schemas/hbcentral/**` so the new command-band data model is fully documented, operationally clear, and aligned both to repo truth and to the two binding schema files included in this package.

## Why this issue exists / current-state problem

The provisioning work is incomplete if the list model exists only in code and in SharePoint. The hbcentral list-schema docs must become the durable reference for:
- list titles
- internal names
- field purposes
- defaults
- choice values
- indexes
- provisioning behavior
- seed provenance
- public/admin consumption seams

## Repo-truth evidence and exact files / seams to inspect

Inspect:
- existing files under `docs/reference/sharepoint/list-schemas/hbcentral/**`
- the included schema files:
  - `05-List-Schema-Priority-Actions-Band-Config.md`
  - `06-List-Schema-Priority-Actions-Band-Items.md`
- all new/updated descriptor/source/writer/admin files created for this implementation
- the existing hero banner descriptor/source/admin docs pattern where useful
- the final list schema actually provisioned in HBCentral

## Required documentation outcome

Update the hbcentral list-schema documentation so it includes, at minimum:

### A. New list reference docs
Full schema reference for:
- `Priority Actions Band Config`
- `Priority Actions Band Items`

Those repo docs must faithfully reflect the field contract locked in the included schema files unless this package implemented a deliberate migration/update and documented why.

Each reference must include:
- list purpose
- hosting site
- operating model
- read/write ownership
- field table with:
  - display name
  - internal name
  - type
  - required
  - indexed
  - default
  - choice values where applicable
  - semantic purpose

### B. Runtime usage notes
Document:
- which public runtime consumes the lists
- which admin/runtime write seams maintain them
- how the public command band resolves the active config row
- how items are filtered and normalized
- how audience and breakpoint visibility are intended to work

### C. Provisioning + seeding notes
Document:
- that the lists are provisioned via the local runner path
- that the initial item seed was derived from the live HBCentral Quick Links configuration
- what fields were inferred/defaulted during the initial migration
- how rerun/idempotency is handled

### D. Maintenance guidance
Document:
- maintainers should use the friendly admin UI, not raw SharePoint list editing, once the admin surface exists
- any current temporary maintenance caveat, if relevant
- safe update expectations

### E. Cross-links
Update any relevant hbcentral list index / README / navigation docs in that folder so these new lists are discoverable.

## Constraints / prohibitions

- Do not leave the docs as thin placeholders.
- Do not document only list titles without full field-level detail.
- Do not let the docs drift from actual provisioned internal names.
- Do not let the docs drift from the included schema files without recording the exact migration/update rationale.
- Do not re-read files that are already in active context unless you need to verify drift, dependencies, or uncertainty after changes.

## What done really looks like

Done means a developer or maintainer can open the hbcentral list-schema docs and understand:
- what each list is for
- how the fields are defined
- how the lists are provisioned
- how they are seeded
- how the public rail and future admin surface rely on them
- and how the repo docs align to the binding schema artifacts included in this package

## Proof of closure required

- list of docs added/updated
- field tables included
- cross-links/index updates included
- docs match the implemented schema exactly
