# Prompt 04 — Canonical Spfx App Composition Foundation

## Objective

Implement or harden the canonical SPFx app-composition foundation so SPFx-facing apps stop independently wiring the same root-level providers, bootstrapping, and host-boundary behavior.

## Mandatory operating instruction

Do **not** re-read files that are still within your active context or memory. Reuse already loaded repo context whenever possible and only open additional files when they are necessary to close uncertainty.

## Required repo-truth inputs

- `apps/accounting/src/`
- `apps/estimating/src/`
- `apps/admin/src/`
- `apps/project-hub/src/`
- `packages/ui-kit/`
- `packages/shell/`
- `packages/app-shell/`
- `packages/spfx/`

## Instructions

1. Audit app-root duplication across the SPFx-facing source apps, including:
   - provider composition
   - query-client setup
   - theme setup
   - error boundaries
   - router bootstrap
   - SPFx context handoff
   - mock/bootstrap dev entry behavior
2. Design and implement a canonical shared composition pattern for SPFx-facing apps.
3. Move repeated composition glue into the correct shared owner defined by Prompt 03.
4. Keep app-specific business routing and page logic app-local unless it is truly shared.
5. Ensure the result is safe for SharePoint hosting and local development.
6. Update or add tests around the shared composition contract.
7. Reconcile app entrypoints and imports so future SPFx apps can compose from the shared foundation instead of copy/pasting old patterns.

## Deliverables

- shared composition code in the approved package location
- simplified app-root wiring in the affected SPFx-facing apps
- updated tests / contracts for the composition layer
- documentation notes explaining how new SPFx apps should compose the root

## Acceptance criteria

- repeated provider/bootstrap scaffolding is materially reduced
- the shared composition layer is used by the relevant apps
- the solution is compatible with SPFx hosting and current dev flows
- app-local workflow code remains where it belongs
- imports align with the ownership freeze from Prompt 03

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
