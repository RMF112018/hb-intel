# Prompt 04 — Embed Company Pulse, Leadership Message, and Project Portfolio Spotlight

You are working in the live local HB Intel repo.

## Objective

Embed the first-wave low-effort public homepage modules into `hb-homepage`:

- `CompanyPulse`
- `LeadershipMessage`
- `ProjectPortfolioSpotlight`

These should become orchestrator-rendered feature blocks rather than independent page-composition units within the target homepage architecture.

## Critical operating instruction

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Governing authority

- the two doctrine files
- the `hb-homepage` authority lock
- the `hb-homepage` architecture contract
- the Prompt 03 closure note

## Required implementation

1. wire the three target modules into the shell's composition flow
2. remove or bypass any outer layout assumptions that conflict with shell ownership
3. keep each module's internal feature/view logic intact unless refactor is required for shell compatibility
4. ensure shell-owned spacing and rhythm are authoritative
5. preserve professional loading / empty / sparse behavior

## Required closure note

Create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-02/04-Embed-Phase1-Modules.md`

Include:

- exact files changed
- any adapters created
- any outer-layout assumptions removed or neutralized
- remaining gaps before People & Culture integration
- remaining gaps before Kudos integration

## Constraints

- Do not embed People & Culture yet
- Do not embed Kudos yet
- Do not update packaging yet unless necessary for compile integrity
- Do not broaden this prompt into benchmark polishing beyond what is required for shell compatibility

## Completion standard

This prompt is complete when the three first-wave modules render through `hb-homepage` coherently and no longer depend on standalone SharePoint page section placement for their outer composition.
