# Plan Summary — Workstream B: Metadata Simplification and Automation

## Objective

Remove avoidable author burden in setup and metadata handling by replacing manual identity work with governed automation and friendly author-facing language.

## Package Contents

This package contains:
- `Plan-Summary.md`
- `README.md`
- one markdown prompt for each implementation step required to fully close the workstream

## Recommended execution order

- `Prompt-01-Implement-author-facing-label-governance-for-all-selectors-and-statuses.md` — build a governed label system so no raw enum-like values appear anywhere in the author-facing Publisher experience
- `Prompt-02-Replace-manual-project-id-and-name-with-authoritative-project-picker.md` — replace the manual Project ID and Project name fields with a searchable project picker backed by the HBCentral Projects list and authoritative field hydration
- `Prompt-03-Remove-author-facing-slug-management-and-implement-governed-slug-generation.md` — remove the author-facing slug field and implement system-generated slug behavior with safe uniqueness handling and minimal UI exposure
- `Prompt-04-Implement-intelligent-defaults-for-team-heading-and-related-metadata.md` — add intelligent metadata defaults, especially Team Viewer title defaulting to The Team at {project name}, while preserving appropriate editability
- `Prompt-05-Validate-metadata-simplification-end-to-end-and-close-workstream-B.md` — scrub the entire metadata flow for drift, ensure friendly labels and automation are wired everywhere, and produce closure evidence

## Closure standard

The workstream is only closed when:
- the product and UX intent of the workstream is fully implemented in repo truth
- the touched surfaces are scrubbed for drift and contradictory legacy behavior
- the result aligns with the governing SPFx doctrine
- the result is validated in a manner appropriate to the touched code and hosted SharePoint context
