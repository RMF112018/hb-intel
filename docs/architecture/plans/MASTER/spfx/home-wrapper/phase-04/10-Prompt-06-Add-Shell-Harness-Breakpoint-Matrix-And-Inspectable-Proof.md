# Prompt 06 — Add Shell Harness, Breakpoint Matrix, and Inspectable Proof

## Objective

Create a bounded shell preview / harness path and a repeatable breakpoint matrix that proves shell behavior across the required entry states.

The repo already has useful unit tests. This prompt exists because unit tests alone do not prove first-screen shell behavior.

## Why this issue exists in the current code

Current repo truth provides:
- shell unit tests
- runtime data attributes
- preview helpers for validation

But it still lacks a stronger closure mechanism for:
- breakpoint-by-breakpoint shell inspection
- visible first-lane proof
- policy-driven entry-state proof
- inspectable runtime diagnostics in a repeatable preview context

## Current repo-truth evidence

Use at minimum:
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`

## Required future state

You are done only when all of the following are true:

1. There is a bounded shell preview or harness path for shell validation.
2. The harness can exercise required entry classes.
3. The harness exposes inspectable output for:
   - selected entry state
   - preset
   - diagnostics count
   - normalization state
   - paired vs stacked result
   - pairing / stacking reason
4. A breakpoint matrix exists that covers all required shell targets.
5. The matrix can be used to generate closure evidence.

## Files / seams / symbols to inspect

Inspect at minimum:
- current shell data attributes in `HbHomepageShell`
- validation preview helpers
- any local composition preview seams
- existing repo tooling that can host a bounded harness without creating a production feature

## Implementation requirements

1. Prefer a dev-only or bounded preview path, not a public-shell control surface.
2. Make runtime shell state legible and inspectable.
3. Cover at least the following entry classes in the matrix:
   - ultrawide desktop
   - standard laptop / desktop
   - tablet landscape large / medium
   - tablet portrait large / medium
   - phone portrait large / standard
   - phone landscape / short-height constrained
4. Include constrained reflow conditions where practical.
5. Ensure the harness helps prove shell behavior, not child-module redesign.

## Validation / proof of closure

Return all of the following:
1. exact files changed
2. the preview/harness entry path
3. the breakpoint matrix
4. examples of inspectable output for at least three materially different states
5. explanation of how a future agent should use the harness for shell closure

## Out-of-scope guardrails

Do not:
- turn the harness into a tenant-admin product
- build a freeform layout editor
- use child-surface redesign as the proof mechanism

## Instruction not to re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes

Do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## No-deferral requirement

Do not defer any in-scope shell work to a later wave. If a detail is required now to make the shell correct, governed, and provably closed, address it now.

