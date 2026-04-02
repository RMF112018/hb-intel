# Prompt 10 — Project Setup Rollout And Conformance Cleanup

## Objective

Apply the conformed shared shell/layout/component patterns to the verified project-setup package source app and eliminate unjustified drift.

## Mandatory operating instruction

Do **not** re-read files that are still within your active context or memory. Reuse already loaded repo context whenever possible and only open additional files when they are necessary to close uncertainty.

## Required repo-truth inputs

- `dist/sppkg/hb-intel-project-setup.sppkg`
- `packages/spfx/`
- `apps/estimating/`
- `apps/admin/`
- `docs/architecture/plans/MASTER/spfx/accounting/`
- `docs/architecture/reviews/`

## Instructions

1. Use the verified package provenance mapping to target the correct project-setup source app.
2. Replace unjustified app-local shell/layout/interaction implementations with the canonical shared assets established in prior prompts.
3. Preserve project-setup-specific workflow content, provisioning behavior, and review/queue logic.
4. Update tests and package-specific docs as needed.
5. Record any remaining governed exceptions and why they are legitimate.

## Deliverables

- project-setup source app updated to consume the canonical shared patterns
- obsolete drift removed
- governed exception list
- updated tests / docs where required

## Acceptance criteria

- the project-setup experience is visibly aligned with suite-wide patterns
- provisioning-related domain behavior remains intact
- no new parallel UI layer is introduced
- the app still builds and packages through the verified project-setup flow

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
