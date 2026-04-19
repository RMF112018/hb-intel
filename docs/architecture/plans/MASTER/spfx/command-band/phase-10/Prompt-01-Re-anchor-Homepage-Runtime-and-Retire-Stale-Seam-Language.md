# Prompt-01 — Re-anchor Homepage Runtime and Retire Stale Seam Language

## Objective

Re-establish the real hosted homepage launcher runtime authority in the codebase and retire stale language that still invites work in the wrong seam.

## Governing authority

Treat the following as controlling implementation authority for this prompt:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/reference/spfx-surfaces/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

The doctrine and benchmark materials are binding. Do not preserve a weak launcher decision merely because it compiles, currently renders, or resembles a prior package recommendation.

## Inspect these exact seams

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- any nearby comments, compatibility shims, or explanatory docs directly describing the homepage launcher runtime
- compare as needed with `apps/hb-webparts/src/webparts/priorityActionsRail/*`
- compare as needed with `packages/ui-kit/src/HbcPriorityRail/*`

## Current problem to solve

The repo truth has shifted: the hosted homepage launcher is now governed by the homepage wrapper + launcher band + homepage launcher surface, not by the older flagship `PriorityActionsRail` path. The old packages identified that shift, but the repo still contains enough stale explanatory language and neighboring compatibility framing to make the authority easy to misread.

## Required implementation work

1. Audit active comments, compatibility shims, and nearby explanatory text in the homepage launcher path.
2. Update wording so the homepage authority is explicit and unambiguous.
3. Preserve the existence of the standalone rail path, but clearly frame it as adjacent / non-homepage authority.
4. Remove or tighten stale phrases that imply the homepage still meaningfully depends on the old flagship rail surface.
5. Where runtime markers or comments are used for hosted proof, ensure they identify the homepage launcher family clearly.
6. Keep changes tightly scoped to seam clarity, authority, and low-risk supporting cleanup.

## Required future state

A future maintainer or local code agent should be able to inspect the homepage path and immediately understand:

- which seam actually governs hosted homepage rendering
- which legacy rail path remains only as an adjacent non-homepage surface
- where launcher redesign work must and must not occur

## Proof of closure required

- comments and compatibility language no longer imply the wrong runtime authority
- homepage launcher runtime markers remain inspectable
- no homepage-hosted behavior regresses while authority language becomes clearer

## Prohibitions

- Do not redesign the launcher UI in this prompt.
- Do not break the standalone rail path.
- Do not broaden into unrelated homepage shell work.

## Working rule

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
