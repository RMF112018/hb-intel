# Prompt 09 — Accounting Rollout And Conformance Cleanup

## Objective

Apply the conformed shared shell/layout/component patterns to the verified accounting package source app and eliminate unjustified accounting-specific drift.

## Mandatory operating instruction

Do **not** re-read files that are still within your active context or memory. Reuse already loaded repo context whenever possible and only open additional files when they are necessary to close uncertainty.

## Required repo-truth inputs

- `apps/accounting/`
- `dist/sppkg/hb-intel-accounting.sppkg`
- `docs/architecture/plans/MASTER/spfx/accounting/`

## Instructions

1. Use the verified package provenance mapping to target the correct accounting source app.
2. Replace unjustified app-local shell/layout/interaction implementations with the canonical shared assets established in prior prompts.
3. Preserve accounting-specific workflow content and business rules.
4. Update tests and package-specific docs as needed.
5. Record any remaining accounting-specific governed exceptions and why they are legitimate.

## Deliverables

- accounting source app updated to consume the canonical shared patterns
- obsolete drift removed
- accounting-specific governed exception list
- updated tests / docs where required

## Acceptance criteria

- the accounting experience is visibly aligned with suite-wide patterns
- valid accounting workflow specialization remains intact
- no new parallel UI layer is introduced
- the app still builds and packages through the verified accounting flow

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
