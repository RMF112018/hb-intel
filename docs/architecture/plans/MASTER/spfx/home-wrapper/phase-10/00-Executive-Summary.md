# Executive Summary

## Objective

Unify the flagship homepage hero into the `HbHomepage` runtime, align it with the same entry-stack authority already used by the launcher band and shell, and materially improve the hero’s constrained-screen behavior without collapsing wrapper/shell boundaries.

## Bottom-line conclusion

The attached package was directionally correct on the main architecture problem, but it was not complete enough to drive clean closure.

It correctly identified that the current flagship homepage is still split between a standalone hero and a separate homepage app.

It did **not** go far enough on:
- wrapper-owned hero config migration,
- shared measurement / entry-state truth,
- duplicate-hero transition risk,
- runtime/reference/governance cutover,
- and closure-grade validation.

## Repo-truth position

The live repo currently treats the flagship entry stack as:

1. hero = standalone webpart,
2. actions = wrapper-embedded inside `HbHomepage`,
3. shell = post-entry operating layer inside `HbHomepage`.

That architecture is explicitly stated in:
- `HbHomepageEntryStack.tsx`
- `entryStackOrchestration.ts`
- `hbHomepageContract.ts`
- `mount.tsx`

This means the requested target state requires a **controlled architecture reversal**.

## Correct target state

The correct flagship composition after remediation is:

1. wrapper-owned hero
2. wrapper-owned launcher/actions band
3. `HbHomepageShell`

all within `HbHomepage`.

The hero should remain a reusable hero surface and should continue to support non-flagship/article usage. It should **not** remain the flagship page’s separately authored top webpart, and it should **not** be demoted into a shell occupant.

## Most important findings

### 1. The repo already has most of the governance machinery
The repo already includes:
- entry-state classification,
- short-height handling,
- entry-stack budgets,
- wrapper-owned entry-stack container measurement,
- shared snapshot helpers,
- wrapper-owned launcher composition.

This is not a blank-slate redesign problem. It is a cutover and alignment problem.

### 2. The hero is the outlier
The launcher band already consumes the wrapper-owned `entryContainer` state. The shell obviously does too. The hero is now the surface that is still responding primarily through its own viewport media-query posture rather than the wrapper-owned entry-stack truth.

### 3. The prior package underplayed property migration
Today there is a typed wrapper-owned integration seam for the embedded launcher band. There is **not** an equivalent wrapper-owned seam for the flagship hero. A clean migration path for hero inputs must be created.

### 4. The prior package underplayed hosted rollout risk
If the hero is embedded into `HbHomepage` but the old standalone hero remains authored on the flagship page, the homepage can render duplicate hero surfaces. This risk must be closed intentionally with authoring guidance and, if necessary, transition-safe runtime suppression.

### 5. The prior package mixed critical work with overbroad work
The primary waves should focus on runtime composition, wrapper config, shared entry-state truth, responsive hero behavior, and closure proof. Manifest edits should only happen where repo truth actually requires them. They are not the primary objective.

## Recommended remediation structure

The implementation should be executed as eight closure units:

1. Cut over flagship wrapper-owned hero composition.
2. Create a wrapper-owned hero integration seam and migrate flagship hero inputs.
3. Unify entry-stack measurement truth across hero, launcher, and shell.
4. Rebuild hero responsive modes and crowding controls around entry-state/container truth.
5. Prevent duplicate hero during hosted cutover.
6. Update repo-truth seams and reference composition.
7. Add responsive regression proof and runtime diagnostics.
8. Document hosted validation and operational cutover.

## Decision that must remain firm

Do **not** make the hero a shell occupant.

That would be the wrong architectural abstraction.

The hero is an entry-stage surface. The wrapper owns entry-stage sequencing. The shell owns post-entry lane orchestration. That boundary should become clearer after the cutover, not blurrier.

## What “done” actually looks like

The work is only done when all of the following are true:

- the flagship homepage no longer depends on a separately authored standalone hero above `HbHomepage`,
- the wrapper owns hero + launcher ordering,
- the hero consumes shared entry-state/container truth instead of acting like a largely independent viewport-only masthead,
- the hero no longer dominates or crowds constrained displays,
- runtime/reference/comments/doc seams all describe the same composition,
- the hosted page cannot accidentally end up with two heroes during cutover,
- and closure is proven through diagnostics, tests, and hosted validation.
