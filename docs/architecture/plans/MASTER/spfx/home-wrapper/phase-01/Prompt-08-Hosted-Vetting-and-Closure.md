# Prompt 08 — Hosted Vetting, Validation, and Final Closure for HB Homepage

You are working in the live local HB Intel repo.

## Objective

Perform final validation and closure for the new `hb-homepage` implementation.

This prompt is for final proof, not open-ended redesign.

## Critical operating instruction

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Governing authority

- all prior `hb-homepage` docs and closure notes
- the two doctrine files
- hosted-runtime truth after packaging

## Required validation scope

1. compile/build validation
2. package validation
3. runtime registration validation
4. hosted rendering validation
5. doctrine-alignment validation
6. proof that the absorbed modules now render through `hb-homepage`
7. proof that `hbSignatureHero` remains independent
8. proof that shell layout ownership is real, not decorative

## Required final deliverables

Create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-04/08-Hosted-Vetting-and-Final-Closure.md`

The final closure document must include:

- implementation summary
- actual files changed across the full initiative
- final runtime architecture
- final packaging posture
- final hosted validation evidence
- any accepted limitations
- any clearly identified follow-on opportunities
- explicit statement of whether the result is ready for user vetting

## Constraints

- Do not reopen closed architecture unless a blocking defect forces it
- Do not add unrelated enhancement work
- Do not claim closure without package/runtime proof

## Completion standard

This prompt is complete only when a future reviewer can read the final closure doc and understand exactly what was implemented, how it was validated, and what remains open, if anything.
