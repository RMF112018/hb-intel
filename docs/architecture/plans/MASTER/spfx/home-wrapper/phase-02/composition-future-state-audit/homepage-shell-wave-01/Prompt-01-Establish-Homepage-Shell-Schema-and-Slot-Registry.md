# Prompt 01 — Establish Homepage Shell Schema and Slot Registry

## Objective
Create a governed shell schema for `hbHomepage` so homepage composition is no longer defined only by fixed JSX order.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/00-Plan-Summary.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/01-Homepage-Webpart-Conformance-Standard.md`

## Exact repo seams to inspect
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/**`
- `apps/hb-webparts/src/mount.tsx`

## Current gap
The shell currently renders a fixed sequence of zone wrappers and does not have:
- a shell schema
- slot roles
- band semantics
- allowed occupancy rules
- breakpoint-aware placement data

## Required implementation outcome
Implement a shell contract layer that defines at minimum:
- bands
- slots
- slot role semantics
- default shell preset
- allowed footprints
- breakpoint-resolved placement metadata
- invalid-state fallback strategy

Use clear types and small, readable modules. Keep the top-band / flagship hero protected from future entropy.

## Proof of closure required
Provide:
- exact files added/changed
- resulting shell schema example
- explanation of how slot order is now resolved
- proof that the shell still renders the current intended modules correctly
- proof that old fixed-order assumptions are no longer the only source of truth

## Prohibited
- do not build an admin UI
- do not refactor unrelated standalone webparts
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
