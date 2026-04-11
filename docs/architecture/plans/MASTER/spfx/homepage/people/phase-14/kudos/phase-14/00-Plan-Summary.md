# 00 — Plan Summary

## Objective

Add the intended reaction / like component to the **public-facing HB Kudos webpart** so users can interact directly with recognitions from the primary surface.

## Repo-truth starting point

The codebase already supports a celebrate model in persistence and secondary interaction paths.
The defect is that the main public surface does not visibly expose that interaction.

## Primary defects to correct

1. No obvious reaction / like affordance exists on the primary public UI
2. Reaction capability is buried in the detail-panel path instead of the homepage-facing surface
3. Count display is too passive and may remain invisible when the count is zero
4. Shared-surface contracts are biased toward href-style celebrate rendering rather than direct interactive callbacks for the public webpart
5. Public users cannot reasonably infer that recognition reactions are supported

## Required workstreams

1. Shared reaction affordance design and contract correction
2. Public webpart celebrate-action wiring
3. Count, state, and feedback behavior refinement
4. Hosted validation and closure

## Required execution order

1. Shared reaction affordance / contract correction
2. Public webpart wiring
3. Count/state refinement
4. Hosted validation

## Closure rule

This work is not complete until a user can clearly see and use the reaction component directly on the public Kudos webpart in SharePoint-hosted runtime.
