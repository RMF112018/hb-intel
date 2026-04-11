# 00 — Plan Summary

## Objective

Remediate the **public-facing HB Kudos homepage webpart** only.

The target outcome is a homepage-quality recognition surface that:
- remains premium and branded
- feels balanced at 100% browser zoom
- uses recipient photos where available
- avoids redundant CTA hierarchy
- gives the archive/browse area enough prominence to feel intentionally designed

## Primary defects to correct

1. Hero + featured card stack is too top-heavy
2. Duplicate `Give Kudos` CTA hierarchy wastes space and weakens action clarity
3. Featured card shell is oversized relative to its content payload
4. Archive/search zone is visually underpowered
5. Transition from featured recognition to archive utility is abrupt
6. Recipient avatar/photo path is not hydrated, so initials render where user photos should render
7. Surface remains functional at 100% zoom but is not properly calibrated for that zoom level

## Required workstreams

1. Shared surface recalibration
2. Recipient photo hydration
3. Archive and browse refinement
4. Hosted validation and closure

## Required execution order

1. Shared surface recalibration
2. Recipient photo hydration
3. Archive and browse refinement
4. Hosted validation and closure

## Why this order matters

If local archive refinements happen first, the agent will likely compensate for unresolved shared composition defects.
If avatar rendering is patched locally instead of fixing the data seam, the implementation will drift from correct ownership.

## Closure standard

This effort is not complete until the public-facing HB Kudos surface:
- looks intentionally balanced at 100% zoom
- uses the actual recipient photo when available
- preserves initials fallback only when no photo can be resolved
- presents the archive/search zone as a meaningful secondary browse layer
