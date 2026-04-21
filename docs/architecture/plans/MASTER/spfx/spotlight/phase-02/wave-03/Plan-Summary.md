# Plan Summary — Project Portfolio Spotlight Surface Remediation

## Locked objective

Rebuild the Spotlight so the deployed homepage surface no longer reads as a card inside a card, and instead reads as a single authored premium editorial module that meets the doctrine and benchmark standard for homepage surfaces.

## Current root cause

The current Spotlight composition stacks multiple independently carded regions:

- outer `.root` shell
- inner `.featuredLayout` bordered/shadowed white card
- separate bordered/shadowed history rail container

This creates the exact visual repetition the doctrine rejects.

## What stays

- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/ProjectPortfolioSpotlightZone.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/layout-mode.ts`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/use-spotlight-layout-mode.ts`
- explicit details/history disclosures
- normalization and freshness/completeness logic

## What changes

Primary focus is the shared ui-kit surface:

- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedSlot.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/HistoryDisclosure.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/SupportingRail.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/Masthead.tsx`
- other `HbcProjectSpotlightSurface` internals only when directly required

## Required end state

The Spotlight must read as:

- one premium parent surface
- one integrated featured section, not a second card
- one subordinated history section, not a third inset card
- strong editorial hierarchy
- compact/selective behavior in smaller modes
- doctrine-compliant visual language

## Proof standard

Closure must include:

- exact files changed
- before/after explanation of how nested card identity was removed
- lint/type/test/build results
- packaged `.sppkg` or hosted proof that the deployed composition now reads as one surface
- screenshots or equivalent runtime proof across at least desktop and one constrained state
