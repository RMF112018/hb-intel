# Prompt 07 — Command Navigation And Detail Surface Standardization

## Objective

Standardize the suite’s shared command surfaces, navigation helpers, detail headers, and context-preserving traversal patterns for SPFx-hosted apps.

## Mandatory operating instruction

Do **not** re-read files that are still within your active context or memory. Reuse already loaded repo context whenever possible and only open additional files when they are necessary to close uncertainty.

## Required repo-truth inputs

- `packages/ui-kit/`
- `packages/shell/`
- `apps/accounting/`
- `apps/estimating/`
- `apps/admin/`
- `docs/reference/ui-kit/`

## Instructions

1. Audit command bars, page actions, breadcrumbs/navigation helpers, tabs, detail headers, and in-context navigation surfaces across the SPFx-facing apps.
2. Standardize primary versus secondary action hierarchy.
3. Reduce extra clicks and cross-page disorientation by preferring context-preserving detail presentation where appropriate.
4. Ensure tabs are used only where semantically appropriate and not as a catch-all navigation substitute.
5. Align navigation helpers with SharePoint/SPFx routing realities rather than generic SPA assumptions.
6. Expose continuity cues that preserve project/work context when users move between related items or pages.

## Deliverables

- shared command/navigation/detail primitives in the approved shared owner
- app updates consuming the canonical patterns
- guidance for when each pattern should or should not be used

## Acceptance criteria

- primary actions are visually and behaviorally consistent
- navigation helpers reduce disorientation instead of adding chrome
- tab usage is governed and not over-expanded
- detail headers and page actions feel coherent across apps
- the result remains SPFx-hosting-aware

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
