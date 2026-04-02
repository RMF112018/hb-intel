# Prompt 05 — Shared Spfx Shell Implementation And Host Continuity

## Objective

Implement or harden the shared SPFx shell so the suite feels like one governed application environment inside SharePoint while preserving truthful host behavior.

## Mandatory operating instruction

Do **not** re-read files that are still within your active context or memory. Reuse already loaded repo context whenever possible and only open additional files when they are necessary to close uncertainty.

## Required repo-truth inputs

- `packages/shell/`
- `packages/app-shell/`
- `packages/spfx/`
- `apps/accounting/`
- `apps/estimating/`
- `apps/admin/`
- `docs/reference/ui-kit/`

## Instructions

1. Use the ownership freeze to implement the approved shell architecture for SPFx-hosted experiences.
2. Standardize the shell framing for:
   - workspace identity
   - shared navigation framing
   - command framing
   - continuity cues across apps
   - back-to-project or back-to-work context where appropriate
   - degraded/error continuity
   - tablet behavior
3. Verify current use of any global SharePoint chrome suppression and make sure it is intentional, documented, and safe.
4. Ensure shell states are compatible with permission transparency, degraded mode, and host-boundary rules.
5. Remove unjustified app-local shell implementations or wrappers.
6. Document the shell contract and approved extension points.

## Deliverables

- hardened shell implementation in the approved shared owner(s)
- reduced app-local shell drift
- shell contract documentation
- tests or verification notes for core shell states

## Acceptance criteria

- the SPFx apps read as one governed suite rather than unrelated pages
- shell behavior is consistent without hiding real host constraints
- shell states for loading, degraded, and error conditions are coherent
- tablet and narrow-width behavior are explicitly addressed
- shell-related imports follow the ownership freeze

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
