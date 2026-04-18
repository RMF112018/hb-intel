# Plan Summary

## Objective

Upgrade the current package set into one repo-truth-grounded remediation package that preserves the correct `PriorityActionsRail -> hbHomepage` ownership model while forcing the hosted result to behave like a true flagship homepage command band.

## Current-state thesis

The live repo already codifies the correct relationship model:

- `HbHomepageEntryStack.tsx` renders the rail before the shell.
- `hbHomepageWrapperConfig.ts` keeps rail integration outside shell module semantics.
- `HbHomepageEntryStack.module.css` mirrors shell width and padding.
- `HbcPriorityRailSurface` and `priority-rail.module.css` still render the rail as a rounded, lightly bordered, softly tinted card.

That means the current failure is primarily **surface authority + wrapper envelope + closure proof**, not shell ownership.

## Locked implementation thesis

1. **Do not move the rail into the shell.**
2. Add an explicit **homepage flagship surface contract** so the rail cannot drift back to a generic card.
3. Rebuild the rail’s public surface to read as a top-band command system.
4. Rebalance the wrapper envelope so hero -> actions -> shell feels intentionally composed.
5. Harden overflow, touch/keyboard behavior, and breakpoint proof.
6. Refresh docs and scorecards only after hosted validation exists.

## Highest-value remediation units

1. Architecture boundary + flagship variant contract
2. Surface rebuild
3. Overflow / accessibility hardening
4. Entry-stack envelope recalibration
5. Breakpoint / presentation / regression hardening
6. Documentation and closure refresh
7. Hosted validation

## Definition of done

The work is done only when all of the following are true:

- the rail remains wrapper-owned and pre-shell
- the rail has an explicit homepage-flagship variant or equivalent locked contract
- the rendered rail no longer reads as a thin-border card nested inside a larger white panel
- hero, primary actions, and the beginning of the first shell lane are all visible on first view at required device classes
- overflow remains governed, keyboard-safe, touch-safe, and visually premium
- build/package/test outputs are clean
- hosted SharePoint screenshots and console proof exist
- docs and closure notes reflect actual proof, not optimistic intent
