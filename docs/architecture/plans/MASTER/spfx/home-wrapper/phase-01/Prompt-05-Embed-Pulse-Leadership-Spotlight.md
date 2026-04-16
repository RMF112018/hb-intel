# Prompt Title

Prompt 05 — Embed Company Pulse, Leadership Message, and Project Portfolio Spotlight

## Objective

Embed the three lowest-risk public modules into `hb-homepage` and prove that the shell now owns outer layout while those modules retain their internal product logic.

## Why this prompt exists now

These three modules are the safest first integration targets because the repo already treats them as relatively thin consumers over shared homepage surface families. The original package recognized that sequencing instinct, but it did not force the agent to prove what changed in ownership boundaries after embedding.

## Current repo truth

You must preserve that these modules already own meaningful internal content normalization and view-model shaping. The shell should not re-author those internals. The shell should take over:

- zone placement
- shell spacing
- shell rhythm
- composition ownership

## Intended future state

At completion of this prompt:

- the three modules render through `hb-homepage`
- they no longer independently dictate the outer homepage layout within the shell
- their internal product logic remains intact
- the shell can demonstrate real composition authority, not a decorative wrapper

## Research-informed technical considerations

Honor the locked import/dependency posture:

- reuse existing shared homepage surfaces
- do not duplicate premium-stack work already handled by those modules and `@hbc/ui-kit/homepage`
- prove reduced-motion and keyboard/focus behavior remain credible after composition changes

## Required implementation scope

Implement the embedding work and create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-02/05-Embed-Pulse-Leadership-Spotlight.md`

The note must include:

1. exact files changed
2. exact shell integration points added
3. what outer-layout responsibility moved to the shell
4. what internal responsibility stayed with each module
5. proof that the three modules now render through the host cleanly
6. exact boundary left for `PeopleCulturePublic`

## Explicit non-scope

- Do not embed `PeopleCulturePublic` yet
- Do not embed `HbKudos` yet
- Do not change packaging except for compile continuity strictly required by this prompt
- Do not broaden into companion/admin/product redesign work

## Required verification / burden of proof

You must prove:

- each module renders from inside `hb-homepage`
- shell spacing/layout ownership is real
- module internals were not unnecessarily re-authored
- no existing standalone manifest/runtime seam was broken

## Required output artifact(s)

- `05-Embed-Pulse-Leadership-Spotlight.md`

## Completion standard

This prompt is complete only when the shell is demonstrably compositional and these three modules are embedded without feature or quality regression.
