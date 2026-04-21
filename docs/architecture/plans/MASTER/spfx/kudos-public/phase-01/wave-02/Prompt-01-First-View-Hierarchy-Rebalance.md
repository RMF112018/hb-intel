# Prompt-01-First-View-Hierarchy-Rebalance

## Objective
Rebalance the public hbKudos first view so it reads as a complete recognition product, not a single strong featured card followed by comparatively weak leftovers.

## Inspect exactly
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- any directly related local style modules

## Current problem
The product overinvests in the featured story. When recent recognition is absent, the surface moves from a richly styled hero into a thin archive/feed zone, which weakens homepage value and visual cadence.

## Required implementation outcome
Create a stronger second tier beneath the featured story. This can be achieved through a compact recent-activity strip, a “this week at HB” summary, or another doctrine-compliant pattern that:
- strengthens first-screen scanability
- reinforces that hbKudos is an active recognition system
- does not turn the module into a noisy dashboard

## Proof of closure
Provide before/after hosted screenshots on desktop and laptop widths plus a short explanation of the new first-view hierarchy.
