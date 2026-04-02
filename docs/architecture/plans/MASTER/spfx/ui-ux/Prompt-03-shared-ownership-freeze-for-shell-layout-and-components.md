# Prompt 03 — Shared Ownership Freeze For Shell Layout And Components

## Objective

Freeze the canonical ownership boundaries for shell, layout, component, facade, and app-local integration concerns so later implementation does not spread ambiguity.

## Mandatory operating instruction

Do **not** re-read files that are still within your active context or memory. Reuse already loaded repo context whenever possible and only open additional files when they are necessary to close uncertainty.

## Required repo-truth inputs

- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/ui-kit/`
- `packages/ui-kit/`
- `packages/shell/`
- `packages/app-shell/`
- `packages/spfx/`

## Instructions

1. Use the audit outputs to define the canonical ownership map for:
   - shell orchestration
   - host-boundary behavior
   - shared layout variants
   - shared interactive primitives
   - SPFx-specific composition adapters
   - app-local integration code
2. Explicitly decide what belongs in:
   - `@hbc/ui-kit`
   - `@hbc/shell`
   - `@hbc/app-shell`
   - `packages/spfx`
   - governed exception layers
   - app-local code
3. Resolve whether `@hbc/app-shell` remains the preferred facade for SPFx suite composition, whether `packages/spfx` should own more of the integration boundary, or whether a narrower refactor is better supported by repo truth.
4. Write the ownership freeze into an authoritative doc rather than leaving it as chat-only knowledge.
5. Identify any deprecated or misleading ownership patterns that should be phased out.

## Deliverables

- a written ownership-boundary decision record
- a package responsibility matrix
- a list of approved import directions
- a list of anti-pattern imports / boundary violations to eliminate

## Acceptance criteria

- every major shell/layout/component concern has a single canonical owner
- later prompts can implement without reopening package-boundary arguments
- the decision record is consistent with current-state-map and existing ADR posture
- the result does not create a second design-system or shell authority

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
