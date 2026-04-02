# Prompt 12 — Conformance Enforcement Tests And Guardrails

## Objective

Strengthen enforcement so future SPFx work is less likely to reintroduce shell/layout/component drift.

## Mandatory operating instruction

Do **not** re-read files that are still within your active context or memory. Reuse already loaded repo context whenever possible and only open additional files when they are necessary to close uncertainty.

## Required repo-truth inputs

- `packages/ui-kit/`
- `packages/shell/`
- `packages/app-shell/`
- `packages/spfx/`
- `apps/accounting/`
- `apps/estimating/`
- `apps/admin/`
- `docs/reference/ui-kit/`
- `docs/architecture/adr/`

## Instructions

1. Review current lint rules, architectural constraints, tests, and package contracts related to component consumption and layout usage.
2. Add or tighten enforcement for:
   - approved import boundaries
   - shared layout usage
   - shell consumption rules
   - prohibited direct component usage where a governed shared wrapper is required
3. Add or improve tests/examples/verification coverage that make drift visible early.
4. Reconcile any stale enforcement docs or TODOs uncovered during implementation.

## Deliverables

- updated lint/contract/test/conformance guardrails
- clear enforcement notes in authoritative docs
- evidence that the most important drift paths are now harder to reintroduce

## Acceptance criteria

- enforcement aligns with the ownership freeze and shared patterns
- rules are targeted and meaningful, not noisy theater
- test coverage or verification evidence exists for the highest-risk drift areas
- future developers have explicit guidance on what is prohibited and why

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
