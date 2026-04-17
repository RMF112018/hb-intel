# Prompt 02 — Add Module Capability Contracts and Footprint Rules

## Objective
Create a capability registry for shell-eligible homepage modules so future resizing, reordering, and grouping can be governed safely.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/homepage-webpart-benchmark.md`

## Exact repo seams to inspect
- `apps/hb-webparts/src/webparts/companyPulse/**`
- `apps/hb-webparts/src/webparts/leadershipMessage/**`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/**`
- `apps/hb-webparts/src/webparts/peopleCulturePublic/**`
- `apps/hb-webparts/src/webparts/hbKudos/**`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/**`
- new shell schema files from Prompt 01

## Current gap
The shell currently does not know:
- which modules can be half-width
- which require wide placement
- which support compact mode
- which are unsafe neighbors
- which may be optional or contextual

## Required implementation outcome
Define capability metadata for each shell-eligible module, including:
- allowed slot roles
- allowed footprints
- minimum comfort width
- preferred height band
- compact mode support
- collapse / summary support
- incompatibility rules where justified
- configurable vs fixed placement boundaries

## Proof of closure required
Provide:
- registry structure
- one concrete capability record per current shell module
- explanation of how the shell can now reject or demote invalid placements
- proof that the model is suitable for future admin-controlled layout selection

## Prohibited
- do not expose every decision as configurable
- do not introduce freeform drag-anywhere semantics
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
