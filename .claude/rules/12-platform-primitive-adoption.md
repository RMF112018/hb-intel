# 12 — Platform Primitive Adoption

## Primary Rule

New domain work must not reimplement Tier-1 primitive concern areas locally without an ADR exception.

## Required Source

Read `docs/reference/platform-primitives.md` when feature work touches document lifecycle, ownership/BIC, or UI density/complexity.

## Mandatory Checks

| Concern | Required Primitive |
| --- | --- |
| SharePoint document lifecycle, upload, listing, migration, offline queue | `@hbc/sharepoint-docs` |
| Ownership, ball-in-court, next move, urgency tier, handoff | `@hbc/bic-next-move` |
| UI density, expertise tier, coaching gates, complexity tier | `@hbc/complexity` |

## Exception

If a primitive applies but cannot be used, require an ADR exception before local implementation.

## Closeout

For relevant feature work, report the primitive assessment and adoption status.
