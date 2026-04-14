# Prompt 02 — HB Homepage Architecture and Surface Contract

You are working in the live local HB Intel repo.

## Objective

Define the architecture, composition contract, and module-boundary rules for the new `hb-homepage` SPFx orchestrator.

This prompt should produce the real implementation blueprint that the next prompts will execute.

## Critical operating instruction

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Binding authority

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-01/01-Authority-and-Repo-Truth-Lock.md`

## Locked scope

`hb-homepage` will orchestrate:

- `HbKudos`
- `LeadershipMessage`
- `ProjectPortfolioSpotlight`
- `PeopleCulturePublic`
- `CompanyPulse`

`hbSignatureHero` remains independent.

## Required work

Create the architecture plan and implementation contract at:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-01/02-Architecture-and-Surface-Contract.md`

It must define, at minimum:

1. the role of `hb-homepage`
2. the difference between independent flagship hero and orchestrated homepage shell
3. the shell's responsibilities
   - zone order
   - outer layout ownership
   - spacing / density ownership
   - responsive behavior
   - loading / sparse / error posture
   - host-safe behavior
4. the embedded modules' responsibilities
   - internal feature logic
   - internal presentation logic
   - what they must stop owning
5. a proposed folder / file structure for `hb-homepage`
6. the shell's configuration contract
7. the embedded-module registration contract
8. any required shared context or helper seams
9. the migration order for the target modules
10. explicit acceptance criteria for Prompts 03–08

## Required implementation discipline

- Do not implement the host yet
- Do not modify packaging yet
- Do not embed Kudos yet
- Do not let the shell duplicate the signature hero's authority
- Do not leave the architecture vague

## Completion standard

This prompt is complete only when the architecture document is specific enough that a code agent can implement the host without inventing missing decisions.
