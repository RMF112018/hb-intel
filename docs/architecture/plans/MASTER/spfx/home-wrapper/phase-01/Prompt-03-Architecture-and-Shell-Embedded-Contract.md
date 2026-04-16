# Prompt Title

Prompt 03 — HB Homepage Architecture and Shell/Embedded Contract

## Objective

Define the real implementation architecture for `hb-homepage`, including shell responsibilities, embedded-module responsibilities, file structure, context flow, and coexistence rules with the existing standalone public webparts.

## Why this prompt exists now

The original architecture prompt was too generic. It asked for a blueprint, but it did not force decisions on:

- additive versus replacement behavior
- coexistence with existing standalone webparts
- shell-owned versus module-owned layout
- context and configuration handoff
- full-width-capable versus standard-section posture
- required acceptance criteria for later prompts

This prompt exists to remove that ambiguity before code is written.

## Current repo truth

You must design around these realities:

- the dispatcher already maps many homepage surfaces
- the target modules are not uniform; some are already thin shared-surface consumers, while `PeopleCulturePublic` and especially `HbKudos` carry more product-specific runtime concerns
- `hbSignatureHero` is already a mature independent flagship surface
- the package must preserve current runtime/package integrity while introducing a new webpart

## Intended future state

At completion of this prompt, the repo has a contract-grade architecture document that defines:

- what `hb-homepage` is
- where it lives
- what it renders
- what it does not render
- what embedded modules keep owning
- what the shell newly owns
- how the new webpart coexists with existing standalone webparts during Phase 01

## Research-informed technical considerations

In the architecture document, translate the prior host/dependency lock into concrete architecture rules, including:

- whether `hb-homepage` is full-width-capable in manifest posture
- what authoring defaults and sparse states are required
- how reduced-motion obligations affect shell transitions
- how embedded modules should consume shared homepage primitives instead of duplicating premium-stack work

## Required implementation scope

Create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-01/03-Architecture-and-Shell-Embedded-Contract.md`

It must define, at minimum:

1. the role of `hb-homepage`
2. the additive coexistence model with standalone public webparts
3. the difference between the independent hero and the composed operating layer
4. shell responsibilities:
   - zone order
   - outer spacing
   - responsive behavior
   - section/full-width posture
   - sparse/loading/error treatment
   - host-safe behavior
   - reduced-motion behavior
5. embedded-module responsibilities:
   - internal feature logic
   - internal presentation logic
   - what they must stop owning
6. proposed folder and file structure for `hb-homepage`
7. shell configuration contract
8. embedded module registration contract
9. any required shared context/helper seams
10. migration order for the target modules
11. explicit acceptance criteria for Prompts 04–09

## Explicit non-scope

- Do not create files under `apps/hb-webparts/src/webparts/hb-homepage/` yet
- Do not edit `mount.tsx` yet
- Do not edit packaging yet
- Do not embed modules yet

## Required verification / burden of proof

The architecture document must be specific enough that a code agent can:

- create the host
- embed the modules in order
- know what to preserve
- know what not to touch
- know how closure will be judged

## Required output artifact(s)

- `03-Architecture-and-Shell-Embedded-Contract.md`

## Completion standard

This prompt is complete only when the architecture document leaves no material shell-boundary decisions to ad hoc interpretation.
