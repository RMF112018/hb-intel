# Prompt 13 — Ui Doctrine And Spfx Guidance Update

## Objective

Update `docs/reference/ui-kit/` and any closely related authoritative docs so future SPFx development has clear doctrine for shell, layout, shared components, and governed exceptions.

## Mandatory operating instruction

Do **not** re-read files that are still within your active context or memory. Reuse already loaded repo context whenever possible and only open additional files when they are necessary to close uncertainty.

## Required repo-truth inputs

- `docs/reference/ui-kit/`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/adr/`
- `docs/architecture/plans/MASTER/spfx/accounting/`
- `docs/architecture/reviews/`

## Instructions

1. Update or add the minimum necessary doctrine and guidance in `docs/reference/ui-kit/`.
2. Explain clearly:
   - what must be shared
   - what may remain app-local
   - what belongs in `@hbc/ui-kit`
   - what belongs in `@hbc/shell`
   - what belongs in `@hbc/app-shell` or `packages/spfx`
   - when a governed exception is acceptable
   - how SPFx apps should compose shell + layout + shared components
   - responsive and tablet guidance
   - accessibility expectations
   - permission/degraded-state messaging expectations
   - anti-patterns and prohibited drift
3. Prefer updating existing docs over spawning duplicate doctrine files.
4. Reconcile any stale plan/review notes that would otherwise contradict current repo truth after implementation.

## Deliverables

- updated doctrine in `docs/reference/ui-kit/`
- any necessary cross-links to current-state, ADRs, or SPFx plans/reviews
- a short “what changed in the doctrine and why” note

## Acceptance criteria

- doctrine is concrete enough to guide future development decisions
- ownership and exception rules are explicit
- SPFx-specific realities are addressed directly
- stale contradictory guidance is reconciled or clearly superseded

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
