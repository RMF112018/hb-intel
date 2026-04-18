# 00 — Executive Summary

## Objective

Replace the attached packages with a stronger implementation package for wiring `PriorityActionsRail` into `HbHomepage` correctly and sustainably.

## Bottom line

The attached packages were **directionally correct** on the most important decision:

> `PriorityActionsRail` should be integrated as a **wrapper-owned pre-shell region** inside `HbHomepage`, not as a shell occupant.

But they were not complete enough to drive a safe finish.

## What the attached packages got right

- `HbHomepage.tsx` is only a pass-through today.
- `mount.tsx` still maps hero, rail, and homepage as distinct webparts.
- `entryStackOrchestration.ts` is governance-only today, not a unified runtime renderer.
- `HbHomepageShell` does not currently model the rail as an occupant.
- `HbKudosZone` is already proof that the repo accepts “render the React surface inside the homepage runtime” as a pattern.
- The wrapper-owned integration model is the best current target.

## What they under-specified or missed

### 1. They did not fully address page-canvas cutover
If the rail is embedded inside `HbHomepage` while the flagship homepage still contains:
- a separate standalone `PriorityActionsRail` webpart, or
- the old OOB Quick Links surface,

the user can end up with duplicate or contradictory action layers.

This is not optional cleanup. It is part of completion.

### 2. They did not define a precise wrapper contract
The package correctly avoided turning the rail into a shell slice, but it did not go far enough in defining the correct **wrapper-facing** integration seam:
- rail enabled/disabled
- band key
- fallback config only where needed
- active audience propagation
- wrapper-level diagnostics

### 3. They did not reconcile stale repo comments and doctrine strongly enough
Several repo files currently describe the entry stack as hero / actions / shell with **independent production mounting**. Once the flagship homepage embeds the rail inside `HbHomepage`, those comments become partially stale unless updated carefully.

### 4. They did not require enough proof of completion
The prior prompt set required order proof, but not enough:
- no explicit page-canvas proof requirement
- no strong visual proof requirement
- no explicit “no duplicate action layer” check
- no explicit wrapper data attributes / diagnostics expectations

## Stronger target state

The correct flagship homepage runtime should become:

1. standalone `HbSignatureHero` webpart at the page canvas
2. `HbHomepage` wrapper
   - wrapper-owned priority-actions region
   - `HbHomepageShell`
3. no separate page-level priority-actions layer on the flagship page after cutover
4. no shell-occupant migration for the rail
5. standalone `PriorityActionsRail` webpart still available for independent non-homepage use unless repo truth later proves otherwise

## Required files likely touched

At minimum, expect work across:
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- new wrapper runtime file(s) under `apps/hb-webparts/src/webparts/hbHomepage/`
- new wrapper CSS module under `apps/hb-webparts/src/webparts/hbHomepage/`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- a new wrapper-config extraction seam (preferred) or a narrowly justified existing seam update
- `apps/hb-webparts/src/homepage/entryStack/entryStackOrchestration.ts`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- homepage docs/comments describing production entry-stack ownership
- homepage tests / visual-proof seams
- homepage page-canvas cutover / proof tooling and docs under existing repo-native admin / PnP seams

## Final recommendation

Do this as a **five-part remediation**:

1. create the wrapper-owned runtime
2. add the wrapper contract/config seam
3. reconcile entry-stack semantics across comments/docs/reference seams
4. prove and complete homepage page-canvas cutover
5. add diagnostics, tests, visual proof, and hard closure
