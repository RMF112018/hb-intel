# 01 — Audit Summary

## Executive conclusion

The public-facing HB Kudos webpart is visually credible and premium, but it is compositionally overweight.

It is not suffering from the same obvious host-overlay failures seen in the Give Kudos flyout.
Its core problem is not broken rendering; its core problem is **imbalance**.

## Primary findings

### 1. Top-heaviness
The hero band and featured recognition card consume too much of the module’s visible energy.
The archive/browse zone is visually starved.

### 2. Redundant CTA hierarchy
The surface exposes a `Give Kudos` action in the hero and another `Give Kudos` action inside the featured recognition card.
This duplicates intent, consumes space, and weakens hierarchy.

### 3. Oversized featured shell
The featured card shell is taller and more dominant than the informational payload justifies.

### 4. Weak archive utility zone
The archive area is clean but too compressed.
Search is undersized and the browse layer feels appended rather than purposefully integrated.

### 5. Recipient avatar photo defect
The public surface is already wired to use recipient avatar `src` values when present.
The shared avatar component is already capable of rendering photos.
The current failure is upstream: recipient-level photo/media is not being hydrated in the Kudos list mapping layer.

## Repo-truth ownership summary

### Shared owner
`packages/ui-kit/src/HbcPeopleCultureSurface/*`
owns:
- hero band
- hero CTA
- featured spotlight shell
- featured spotlight CTA logic
- homepage-fit spacing model
- spotlight/recent transition

### Data owner
`apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts`
owns:
- Kudos entry mapping
- recipient normalization
- recipient media hydration opportunity

### Local owner
`apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
owns:
- shared surface invocation
- archive footer composition
- archive search sizing
- local browse-zone integration

## Correct remediation direction

- recalibrate the shared public surface first
- fix recipient-photo hydration in the data seam second
- refine archive/search locally third
- validate hosted behavior at 100% zoom last
