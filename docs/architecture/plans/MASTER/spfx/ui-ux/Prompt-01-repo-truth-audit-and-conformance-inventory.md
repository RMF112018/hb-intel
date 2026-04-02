# Prompt 01 — Repo Truth Audit And Conformance Inventory

## Objective

Conduct a precise repo-truth audit of the SPFx shared UI/UX landscape and produce a conformance inventory that distinguishes reusable shared assets from app-local drift.

## Mandatory operating instruction

Do **not** re-read files that are still within your active context or memory. Reuse already loaded repo context whenever possible and only open additional files when they are necessary to close uncertainty.

## Required repo-truth inputs

- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/reviews/`
- `docs/architecture/plans/MASTER/spfx/accounting/`
- `docs/reference/ui-kit/`
- `packages/ui-kit/`
- `packages/shell/`
- `packages/app-shell/`
- `packages/spfx/`
- `apps/accounting/`
- `apps/estimating/`
- `apps/admin/`
- `apps/project-hub/`

## Instructions

1. Audit the current shared-platform landscape for SPFx-facing UI/UX work.
2. Verify the current role and maturity of:
   - `@hbc/ui-kit`
   - `@hbc/shell`
   - `@hbc/app-shell`
   - `packages/spfx`
   - the SPFx-facing source apps
3. Inventory current shell, layout, navigation, command-bar, table, form, modal, drawer, banner, tab, detail-header, dashboard, empty-state, loading-state, and degraded-state implementations across the SPFx-facing apps.
4. Classify each major implementation as one of:
   - canonical shared asset already in the right place
   - shared asset present but not sufficiently enforced
   - duplicate app-local implementation that should move into shared ownership
   - valid governed exception
   - unresolved / needs deeper verification
5. Reconcile findings against the existing architecture and review docs instead of treating current code in isolation.
6. Produce a drift inventory that is concrete enough to drive later prompts without re-discovery.

## Deliverables

- a markdown audit report stored under an appropriate authoritative planning/review path
- a conformance inventory table
- a drift classification table
- a preliminary “move / keep / govern exception / deprecate” recommendation list
- a short list of unresolved questions that truly require code-level follow-up

## Acceptance criteria

- the report clearly distinguishes confirmed repo facts from recommendations
- the inventory covers shell, layout, and interactive surfaces rather than only component names
- package ownership recommendations are explicit
- the report references the actual source paths that were audited
- later prompts can rely on this report without repeating the entire discovery pass

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
