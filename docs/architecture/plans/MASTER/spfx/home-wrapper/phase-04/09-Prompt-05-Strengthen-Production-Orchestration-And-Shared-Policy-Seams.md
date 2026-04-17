# Prompt 05 — Strengthen Production Orchestration and Shared Policy Seams

## Objective

Close the production seam problem by making the independently mounted entry surfaces refer to a disciplined, shell-facing shared policy model.

This prompt is not asking for a hero redesign or a new monolithic renderer. It is asking for future-proof orchestration discipline.

## Why this issue exists in the current code

Repo truth shows two different realities:

1. `ReferenceHomepageComposition.tsx` models the homepage as a composed entry sequence.
2. `mount.tsx` renders hero, actions, and shell as separate webpart seams in production.

That means the intended entry-stack experience exists conceptually, but production still lacks a strong shared policy seam across those independently mounted surfaces.

Without that seam, future unified governance will be forced to:
- couple ad hoc logic later
- duplicate entry policy assumptions
- drift between reference and production behavior

## Current repo-truth evidence

Use at minimum:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- any shared helper / contract seam introduced by Prompt 02

## Required future state

You are done only when all of the following are true:

1. Production seams and composition-reference seams can point to the same shell-facing entry policy model.
2. Future unified entry-stack governance can be built from disciplined shared references rather than inference.
3. The shell still preserves independent mount responsibility where required by SPFx reality.
4. The work does not redesign hero or actions internals.
5. The result is clearer for future agents than the current “separate dispatch plus reference composition” split.

## Files / seams / symbols to inspect

Inspect at minimum:
- `WEBPART_RENDERERS` in `mount.tsx`
- `ReferenceHomepageComposition`
- `HbHomepage`
- `HbHomepageShell`
- `HbSignatureHero`
- `PriorityActionsRail`
- any shared policy helpers or types

## Implementation requirements

1. Introduce or tighten the shared entry-policy seam referenced by production-adjacent code.
2. Reduce the conceptual drift between reference composition and production dispatch.
3. Add comments or disciplined helper usage where it materially lowers future orchestration ambiguity.
4. Keep the solution shell-facing and governance-focused.
5. Preserve SPFx-compatible independent webpart operation.

## Validation / proof of closure

Return all of the following:
1. exact files changed
2. explanation of the shared policy seam
3. explanation of how `mount.tsx` now aligns more cleanly with the composed entry-stack intent
4. explanation of how `ReferenceHomepageComposition.tsx` relates to production after the change
5. confirmation that hero/actions internals were not redesigned

## Out-of-scope guardrails

Do not:
- merge all entry surfaces into one production webpart
- redesign child visuals
- use this prompt as a back door for module maturity work

## Instruction not to re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes

Do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## No-deferral requirement

Do not defer any in-scope shell work to a later wave. If a detail is required now to make the shell correct, governed, and provably closed, address it now.

