# Prompt 05 — Embed People Culture Public into HB Homepage

You are working in the live local HB Intel repo.

## Objective

Embed `PeopleCulturePublic` into `hb-homepage` as an orchestrated feature block.

This prompt should tighten any split/legacy bridging or config handoff required for stable shell integration, but it should not expand scope into Kudos.

## Critical operating instruction

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Governing authority

- the two doctrine files
- the `hb-homepage` authority and architecture docs
- the Prompt 04 closure note

## Required implementation

1. embed `PeopleCulturePublic` into the shell
2. harden the shell-to-module contract for its config and viewer context
3. remove any conflicting outer composition assumptions
4. preserve the separation between People & Culture and Kudos
5. keep shell ownership of outer layout rhythm

## Required closure note

Create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-03/05-Embed-People-Culture.md`

The note must include:

- exact files changed
- contract changes made
- whether legacy bridge behavior was preserved, tightened, or reduced
- any remaining blockers before Kudos integration
- exact next-step scope for Prompt 06

## Constraints

- Do not embed Kudos in this prompt
- Do not update packaging unless required for compile continuity
- Do not introduce People & Culture / Kudos responsibility leakage

## Completion standard

This prompt is complete when `PeopleCulturePublic` is shell-rendered cleanly and its integration boundary is explicit and stable.
