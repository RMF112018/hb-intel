# 07 — Prompt 03: Surface Build and Interaction System

You are working in the live local HB Intel repo.

## Objective

Build the premium `teamViewer` surface and interaction model so it meets homepage doctrine and benchmark-grade quality relative to its own purpose, without becoming a cloned Kudos surface.

## Mandatory operating instruction

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

## Governing authority

Treat the doctrine and benchmark files from prior prompts as binding.

## Required benchmark translation rule

Use Kudos as the benchmark for:
- implementation seriousness
- state completeness
- host-safe polish
- interaction credibility

Do **not** copy:
- archive/feed grammar
- recognition copy style
- celebratory workflow affordances
- Kudos domain vocabulary

## Surface goals

The result must be:
- premium
- people-centric
- visually refined
- scan-friendly
- accessible
- clearly beyond a default SharePoint people list
- visibly non-generic

## Required implementation work

Implement the actual surface components and styling for `teamViewer`.

At minimum:
- primary surface composition
- compact / standard / or otherwise justified density handling
- strong hover / focus / press states
- loading state
- empty state
- error state
- large-team handling
- article-context-aware rendering state when no bound article/team members resolve

The person-detail slide-out is not optional in this package.
You must:
- implement it semantically
- keep it people-viewer-fit
- use Kudos-grade shell mechanics without borrowing Kudos article/feed semantics
- wire it behind an explicit feature flag / disabled-by-default config posture
- still finish the component as a real implementation, not a placeholder

## Stack expectations

Use the approved premium stack where relevant:
- `motion`
- `lucide-react`
- `class-variance-authority`
- `clsx`
- relevant Radix/Floating primitives only if they materially improve the outcome

Do not merely install them symbolically.

## Import discipline

Primary UI imports must come from:
- `@hbc/ui-kit/homepage`

Supplement only where the doctrine allows it.

## Prohibited outcomes

- timid enterprise card grid
- thin-border white-card sameness
- placeholder-grade directory list
- renamed Kudos layout
- hover-only critical information
- premium-in-name-only styling

## Closure requirements

Before closing this prompt:

- prove the rendered surface has a distinct `teamViewer` persona
- prove the state set is complete
- prove the surface remains doctrine-compliant
- capture the exact photo/identity integration points needed for Prompt 04


## Mandatory drawer behavior

For the team-member bio/resume slide-out:

- person tiles/rows must be authored as future-clickable affordances
- the enabled path must open a real right-side profile drawer
- the disabled-by-default path must remain explicit and intentional in code
- focus management, close behavior, and reduced-motion behavior must be complete
- the drawer content must be ready to render bio/resume data from the locked contracts
