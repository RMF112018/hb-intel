# Plan Summary

## Objective

Turn the homepage `PriorityActionsRail` into a signature-grade, recognition-first, SharePoint-hosted command/launcher band without breaking the wrapper-owned entry-stack architecture that the live repo already established.

## Preserve

- wrapper-owned pre-shell placement in `HbHomepageEntryStack.tsx`
- explicit `homepage-flagship` context threading
- separation between wrapper config, rail data seam, and shell semantics
- list-sourced + manifest-fallback behavior in `PriorityActionsRail.tsx`
- container-aware presentation seam in `priorityActionsPresentation.ts`
- existing overflow accessibility baseline
- existing wrapper boundary tests

## Rewrite / strengthen

- flagship surface grammar
- section-level hierarchy
- primary-vs-secondary action treatment
- action recognition cues and launch affordance
- overflow information architecture
- compact / constrained-state behavior
- default-vs-flagship contract isolation
- regression lock-in for flagship behavior
- hosted packaging and proof-of-closure expectations

## Major repo-truth decisions

1. **Architecture is not the main failure.**  
   The wrapper, shell boundary, and data/presentation split are largely correct.

2. **The flagship surface is the main failure.**  
   The current result is still a grouped row/list system with stronger styling, not a decisively different homepage command model.

3. **The redesign must preserve host-fit discipline.**  
   No shell takeover, no shell-occupant migration, no fake chrome, no fragile host assumptions.

4. **Breakpoint behavior must be treated as a contract.**  
   `priorityActionsPresentation.ts` is not incidental plumbing; it is one of the key seams that needs stronger closure.

## What was missing from the attached package pair

- a dedicated closure unit for default/admin vs homepage-flagship isolation
- stronger emphasis on entry-stack gutter/authority seams already present in CSS
- stronger emphasis on the wrapper config seam
- stronger emphasis on behavioral lock-in tests
- stronger hosted SharePoint proof expectations
- stronger research-backed handling of overflow semantics, target size, and reduced motion

## Recommended execution sequence

1. Flagship architecture and scope lock
2. Homepage composition / entry-stack closure
3. Flagship section hierarchy and primary-action model
4. Action rendering and recognition cues
5. Overflow IA and secondary command layer
6. Responsive and container-driven layout closure
7. Accessibility, focus, target size, reduced motion
8. Shared variant contracts and flagship isolation
9. Regression tests and behavioral lock-in
10. Packaging, hosted validation, and closure proof

## Non-goals

- unrelated shell-lane redesign
- shell-occupant registration changes
- SharePoint list schema redesign
- backend or admin-surface redesign outside what is strictly needed for the homepage flagship rail
