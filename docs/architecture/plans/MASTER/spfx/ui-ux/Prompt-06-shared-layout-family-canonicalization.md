# Prompt 06 — Shared Layout Family Canonicalization

## Objective

Define and implement the canonical SPFx page/layout family so list/detail/create/dashboard/viewer/admin/review pages feel governed and consistent without erasing domain-specific behavior.

## Mandatory operating instruction

Do **not** re-read files that are still within your active context or memory. Reuse already loaded repo context whenever possible and only open additional files when they are necessary to close uncertainty.

## Required repo-truth inputs

- `packages/ui-kit/`
- `packages/shell/`
- `packages/app-shell/`
- `apps/accounting/src/pages/`
- `apps/estimating/src/pages/`
- `apps/admin/src/pages/`
- `docs/reference/ui-kit/`

## Instructions

1. Audit the current page-level layout variants used across the SPFx-facing apps.
2. Confirm which existing layout primitives already exist in shared ownership and which are missing or drifting.
3. Canonicalize layout families for, as appropriate:
   - landing / home
   - list
   - detail
   - create / update
   - dashboard / overview
   - split-pane / viewer
   - admin / oversight
   - queue / review
4. Migrate layout-bearing code into the correct shared layer where reuse is warranted.
5. Keep content and business logic app-local; move only the reusable layout structure and governed affordances.
6. Document layout selection rules and allowed extension points.

## Deliverables

- shared layout variants in the approved package owner
- app updates consuming the canonical layout family
- a layout selection / extension guidance doc
- a short record of governed exceptions that remain app-local

## Acceptance criteria

- layouts are consistent enough to feel like one suite
- valid domain-specific layouts remain possible where justified
- later app work can reuse the canonical layout family instead of inventing a new one
- the documentation explains when a new layout belongs in shared ownership versus app-local code

## Guardrails

- Treat `docs/architecture/blueprint/current-state-map.md` as the governing reference for present-state disagreements.
- Do not create a parallel design system outside `@hbc/ui-kit`.
- Do not flatten valid domain-specific workflow behavior just to make screenshots look more similar.
- Be explicit when something is a confirmed repo fact versus an inference.
- Prefer updating authoritative docs and existing package surfaces over introducing duplicate layers.
- Treat SPFx host limitations honestly rather than forcing false parity with non-SPFx surfaces.

## Completion note

When you finish, summarize:
- what you verified from repo truth
- what you changed
- what you intentionally left unchanged
- any residual risk or follow-up prompt dependencies
