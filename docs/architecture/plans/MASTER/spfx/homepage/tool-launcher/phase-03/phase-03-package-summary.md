# Phase 03 — Package Summary

## Phase Title

Flagship Platform Stage

## Objective

Implement the **premium featured-platform stage** for Tool Launcher / Work Hub so the launcher establishes strong visual hierarchy through brand-led primary launch cards driven by normalized live launcher data.

## What has already been solved

- the overall launcher architecture and hierarchy direction have been defined
- the SharePoint list already exists and should already be wired through the Phase 01 adapter seam
- the desktop composition skeleton should already exist from Phase 02
- the homepage lane, Utility zone placement, and Signature Hero relationship are already established in repo truth
- the tool-launcher asset manifest already defines preferred logo treatment and fallback posture for the current platform set

## What this phase must solve

- lock the featured-stage rendering contract
- create or refine the flagship card primitive used by featured platforms
- render featured platforms from normalized featured metadata rather than grouped tiles
- bind logo assets using launcher metadata plus the asset manifest
- provide clean status / notice / CTA treatment where supported by the normalized launcher model
- preserve a premium degraded state when logos or support metadata are partial or missing

## Key repo constraints

- keep work within `apps/hb-webparts` unless shared extraction is clearly warranted
- preserve `@hbc/ui-kit/homepage` import discipline
- do not regress the cumulative `hb-webparts` package or mount/dispatch seam
- do not move business-specific launcher list logic into shared kit prematurely
- do not let the flagship stage become a second hero or faux app shell
- do not collapse brand-led flagship cards back into generic icon tiles

## Required outputs

1. featured-stage rendering contract
2. flagship card primitive or local surface family
3. live featured-stage binding from normalized launcher data
4. asset-resolution strategy tied to the existing asset manifest
5. degraded / missing-asset fallback states
6. composition proof and documentation updates

## Dependencies

Phase 01 should have established the normalized launcher seam, and Phase 02 should have established the desktop launcher skeleton with a dedicated flagship region.

## Primary risks

- applying decorative styling while retaining the old grouped-tile interaction model underneath
- binding flagship rendering directly to raw SharePoint fields instead of the normalized launcher model
- creating a flagship card that visually competes with the Signature Hero instead of subordinating to it
- overpromoting launcher-specific brand logic into shared kit before the pattern is proven
- allowing missing logo assets to collapse the launcher back into generic pseudo-brand iconography
