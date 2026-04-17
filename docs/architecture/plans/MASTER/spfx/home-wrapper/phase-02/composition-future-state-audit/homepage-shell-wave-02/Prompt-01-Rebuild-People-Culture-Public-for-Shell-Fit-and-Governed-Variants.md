# Prompt 01 — Rebuild People & Culture Public for Shell Fit and Governed Variants

## Objective
Bring `PeopleCulturePublic` up to the same homepage-fit maturity level as the strongest shell modules, while preserving the split-runtime boundary from HB Kudos.

## Governing authority
- the two homepage doctrine files
- homepage benchmark package
- shell capability / slot contract created in Wave 01

## Exact repo seams to inspect
- `apps/hb-webparts/src/webparts/peopleCulturePublic/**`
- `apps/hb-webparts/src/homepage/helpers/peopleCultureSplitModel.*`
- any homepage shared primitives that should be reused
- relevant `@hbc/ui-kit/homepage` primitives when promotion is justified

## Current gap
`PeopleCulturePublicSurface` is the maturity outlier:
- heavy inline style usage
- weaker token/system discipline
- limited shell-fit behavior
- not yet clearly prepared for compact / standard slot variants

## Required implementation outcome
Refactor the People & Culture public surface so it has:
- clearer token discipline
- stronger shared primitive usage where appropriate
- explicit shell-fit variants
- better compact / standard behavior
- improved pairing compatibility with Leadership Message in the secondary band

Preserve the split-runtime separation from HB Kudos.

## Proof of closure required
Provide:
- before/after architecture
- exact files changed
- explanation of shell-fit variants
- proof that split-runtime boundaries remain intact
- proof that the result is benchmark-grade without becoming a clone of another module

## Prohibited
- do not collapse People & Culture into HB Kudos
- do not do a superficial CSS-only reskin
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
