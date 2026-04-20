# Project Portfolio Spotlight Audit Summary

## Bottom line

The current `Project Portfolio Spotlight` is **directionally improved but materially short of the required target state**.

It now has a cleaner repo shape than older homepage implementations:
- thin SPFx consumer
- shared UI-kit surface ownership
- deterministic data shaping
- a stronger editorial masthead
- explicit team-panel disclosure
- a single-column SharePoint-fit composition

That is the good news.

The remaining gap is not cosmetic. The current surface still behaves like a **full editorial card that compresses and stacks**, not a **mode-governed spotlight surface that becomes intentionally simpler as usable space decreases**.

## Most important findings

1. **No explicit layout-mode model exists.**  
   The target state requires explicit wide / medium / compact / minimal behavior or an equivalent mode system. The current implementation has no such contract.

2. **No real practical-usable-space logic exists.**  
   The current responsive behavior is governed by CSS viewport media queries. That is not the same thing as a container-aware, homepage-lane-aware compactness model.

3. **The default state still exposes too much at once.**  
   The current featured presentation tries to show the image, title, headline, summary, milestones, freshness, team strip, CTA, and the supporting rail in the default experience.

4. **There is no required progressive disclosure for the featured body.**  
   The target state requires an explicit user-controlled reveal path comparable to `Show spotlight details`. That does not exist today.

5. **There is no required progressive disclosure for past spotlights/history.**  
   The supporting rail is always present when secondary items exist. The target state requires an explicit reveal path comparable to `Show past spotlights` in compact states.

6. **The current compact behavior is still mostly compression, not selectivity.**  
   Smaller screens get the same story burden in a taller single-column stack. The screenshots confirm that the surface remains heavy and vertically dominant instead of becoming selective and lightweight.

7. **Documentation and implementation truth are misaligned in subtle but important ways.**  
   The current webpart README accurately states that the composition is now
   single-column stacked, but the phrase “tier-aware layout” at
   `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/README.md:42`
   overstates the current capability. The implementation does not yet have a
   true layout-mode contract.

## What is worth preserving

- Thin SPFx consumer boundary
- Shared `@hbc/ui-kit/homepage` surface ownership
- SharePoint list fetch + normalization pipeline
- Deterministic featured / secondary selection
- Stale-item demotion in the secondary collection
- Image-led editorial identity
- Team-strip popover / bottom-sheet pattern
- Single-column host-fit direction instead of a brittle desktop side rail

## What must change next

1. Add a real layout-mode contract.
2. Separate always-visible essentials from optional detail payload.
3. Collapse past spotlight history behind explicit disclosure in compact/minimal modes.
4. Make compactness dependent on practical usable space, not only viewport breakpoints.
5. Tune media scale and vertical footprint so larger screens feel premium but not bloated.
6. Update stories, README, and closure proof to match the new contract.

## Delivery structure

This package contains:
- current implementation map
- doctrine / benchmark assessment
- gap register
- prioritized enhancement plan
- recommended implementation waves
