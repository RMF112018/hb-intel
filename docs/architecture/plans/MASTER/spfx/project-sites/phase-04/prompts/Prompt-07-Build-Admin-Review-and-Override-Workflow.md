# Prompt 07 — Build Admin Review and Override Workflow

## Objective
Implement the maintainer workflow needed to review, correct, and govern legacy fallback records that are unmatched, ambiguous, disabled, or manually overridden.

## Current gap to close
The bridge cannot remain credible if ambiguous records have no review path. A governed fallback index requires a clean maintainer workflow for manual binding, ignore, disable, and revalidation actions.

## Governing files and authorities

Inspect and align to:

- `00-Legacy-Project-Fallback-Bridge-Spec-and-Implementation-Plan.md`
- `01-Implementation-Waves.md`
- output of Prompts 01 through 06
- any existing admin surface, list maintenance, or review-workflow patterns already present in the repo

## Required repo inspection areas

Inspect the live repo for:

- existing admin page or control-center patterns
- existing review queues or override workflows
- writeback patterns to SharePoint-backed registries
- authorization / maintainer-role handling
- whether the review workflow truly requires any additional HBCentral list or field changes

## Required implementation outcome

Build a governed workflow that supports:

1. filtering unmatched and low-confidence records
2. manually binding a fallback record to a project
3. ignoring a record
4. disabling fallback behavior for a record
5. viewing source metadata and opening the source folder
6. rerunning validation or discovery for a single record or a given year where appropriate
7. preserving notes and traceability

## Required implementation details

- Keep the workflow maintainer-facing, not public-facing.
- Preserve `MatchMethod` and notes when a manual override occurs.
- Do not destroy provenance from the discovery layer.
- Make review filters explicit and useful.
- Ensure authorization is clear and enforced.
- Keep the workflow focused; do not turn it into a generic SharePoint list editor.
- If the workflow truly needs extra HBCentral fields or lists, provision or alter them through the repo's provisioning path and document why they are necessary.

## Proof of closure

Provide:

- exact files added or modified
- the final maintainer workflow entrypoint(s)
- the supported review filters
- the supported override actions
- an example of a manual bind record after update
- confirmation that changes remain traceable
- summary of any HBCentral schema changes applied in this prompt

## Constraints

- Do not expose review controls in public `project-sites` runtime.
- Do not let manual overrides silently bypass auditability.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
