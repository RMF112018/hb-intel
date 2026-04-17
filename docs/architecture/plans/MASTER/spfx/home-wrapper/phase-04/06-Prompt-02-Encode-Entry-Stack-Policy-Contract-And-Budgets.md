# Prompt 02 — Encode Entry-Stack Policy Contract and Budgets

## Objective

Create or harden a **shell-facing entry-stack policy contract** that governs how the independently mounted entry surfaces relate as one authored first-screen system.

This prompt exists because the biggest remaining shell gap is not generic breakpoint work. It is the absence of an explicit shared policy model for:
- hero height budgets
- visible primary action budgets
- overflow posture
- first-lane-first-view requirements
- short-height fallback behavior

## Why this issue exists in the current code

The repo already has:
- detailed governing entry-state doctrine
- a shell breakpoint model
- container-aware shell logic
- an independently mature priority-actions surface
- an independently mounted hero

What it does **not** yet have is a disciplined, reusable, shell-facing policy artifact that lets those three parts be governed together without forcing a single runtime mount path.

Today the policy is mostly documented in doctrine and implied in implementation. That is not enough for:
- future unified entry-stack governance
- control-panel-safe policy references
- robust closure proof

## Current repo-truth evidence

Use at minimum:
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`

## Required future state

You are done only when all of the following are true:

1. There is a typed shell-facing entry-stack policy artifact.
2. That artifact can express, per entry class:
   - recommended hero height budget
   - visible primary action budget
   - overflow posture
   - first-lane-first-view expectation
   - short-height fallback posture
3. Protected entry rules remain protected and are not freely overrideable by persisted payloads.
4. The policy can be referenced by:
   - shell runtime logic
   - production mount/dispatch seams
   - preview/harness logic
   - future controlled admin tooling
5. The work does **not** redesign the hero or the actions surface internals.

## Files / seams / symbols to inspect

Inspect at minimum:
- `HB-Shell-Entry-Breakpoint-Spec.md`
- `mount.tsx`
- `ReferenceHomepageComposition.tsx`
- `breakpointPolicy.ts`
- `protectedDecisions.ts`
- `PriorityActionsRail.tsx`
- `HbSignatureHero.tsx`

Also inspect any existing shell helper / contract seams where a shared policy artifact naturally belongs.

## Implementation requirements

1. Define a typed entry-stack policy contract.
2. Encode the governing budgets from the shell-entry spec in that contract.
3. Separate:
   - protected policy rules
   - configurable policy references
4. Keep the policy shell-facing. Do not build a fake unified renderer just to express the contract.
5. Where helpful, expose stable metadata or helper functions so the shell, hero, and actions seams can reference the same policy model.
6. Keep the resulting design future-safe for a governed control panel without enabling freeform changes.

## Validation / proof of closure

Return all of the following:
1. exact files changed
2. the new entry-stack policy type / schema / helper summary
3. the encoded hero height budgets by entry class
4. the encoded visible-action budgets by entry class
5. the encoded short-height fallback posture
6. explanation of which entry-stack rules remain protected
7. explanation of how the policy can be consumed without redesigning hero or actions internals

## Out-of-scope guardrails

Do not:
- merge hero, actions, and shell into one runtime component unless that becomes strictly necessary for a tiny shared contract seam
- redesign hero visuals
- redesign priority-actions visuals
- broaden this prompt into child-module feature work

## Instruction not to re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes

Do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## No-deferral requirement

Do not defer any in-scope shell work to a later wave. If a detail is required now to make the shell correct, governed, and provably closed, address it now.

