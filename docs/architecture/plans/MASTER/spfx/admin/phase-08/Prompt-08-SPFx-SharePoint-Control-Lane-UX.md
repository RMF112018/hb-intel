# Prompt-08 — SPFx SharePoint Control Lane UX

## Objective

Implement the operator-facing SharePoint control lane in `apps/admin` so an admin can scope assets, review drift, inspect preview results, and initiate bounded SharePoint control actions through the proper backend workflows.

## Important execution rules

- SPFx remains the operator console only.
- No privileged SharePoint execution logic belongs in the client.
- Reuse the app shell, route, and UI-kit patterns already established in the repo.
- Correct any repo-truth drift between admin docs and actual routes/pages as part of this work.

## Inputs

Use:
- all completed Phase 8 backend and contract work
- current `apps/admin` route/page structure
- current admin shell patterns
- `@hbc/ui-kit` and any suitable reusable admin UI support
- `@hbc/features-admin` only where its boundary remains respected

## Scope of work

Implement the smallest correct UI / routing / data-loading support for:
- SharePoint control landing page
- managed-asset scoping
- drift result browsing
- preview / dry-run review
- constrained repair / apply / reapply initiation
- package / API posture visibility
- run / evidence access where appropriate

## Required UX behavior

The lane should make these distinctions clear:
- advisory vs actionable findings
- preview vs executed actions
- in-scope vs out-of-scope assets
- repair vs apply / reapply
- current status vs historical run evidence

## Required documentation output

Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-8/admin-spfx-phase-8-sharepoint-control-ux.md`

Also update local app docs as needed so repo documentation matches the actual admin routes and surfaces.

## Validation

Run the smallest targeted validation necessary for:
- route correctness
- page rendering
- contract compatibility
- operator-flow sanity for the new lane

## Completion condition

Stop after the SharePoint control lane is implemented and documented.
Do not do the final cross-phase reconciliation yet.
