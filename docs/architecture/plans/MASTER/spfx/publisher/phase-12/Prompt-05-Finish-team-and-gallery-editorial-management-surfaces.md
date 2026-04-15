# Prompt 05 — Finish team and gallery editorial management surfaces

## Objective

Take the existing team and gallery managers from “already much better than CRUD tables” to true editorial product-grade surfaces that better foreshadow published output, communicate hierarchy, and keep all current invariants intact.

## Why this issue matters

The repo already contains real team and gallery managers plus composer flows. That is meaningful progress. However, the visible management surfaces still carry enough utility-heavy language and interaction residue that they do not yet feel like premium editorial roster and media managers.

## Current repo-truth problem state

The live implementation already has:

- a people-picker-backed team flow
- a flyout composer
- feature / reorder / edit / remove actions
- gallery readiness cues
- image tiles
- invariant helpers for exclusivity and sort order

The remaining problem is **product-grade finish**, not existence.

## Intended future state

The team and gallery surfaces should:

- feel visual, curated, and editorial
- better foreshadow the published article layout
- make feature / reorder / edit / remove actions feel intentional
- expose row role and state with governed language
- preserve all current invariants and persistence behavior

## Governing authority / required reference docs

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`

## Exact repo files and seams to inspect

- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/TeamPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/TeamMemberComposer.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/teamInvariants.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/GalleryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/MediaComposer.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/mediaInvariants.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/ArticlePreview.tsx`
- any affected shared-chrome primitives

## Required implementation outcome

- Preserve current people-picker and flyout foundations.
- Preserve current team and media persistence boundaries.
- Improve the visual hierarchy and published-output foreshadowing of the team manager.
- Improve the visual hierarchy and media-storytelling posture of the gallery manager.
- Finish any still-raw label/state exposure on these surfaces using governed author-facing language.
- Remove lingering interaction or styling residue that makes the surfaces feel like row utilities.
- Do not break featured exclusivity, sort-order restamping, or current add/edit/remove flows.

## Validation / proof-of-closure requirements

Demonstrate and verify:

- add teammate
- edit teammate
- feature teammate
- reorder teammate
- remove teammate
- add image
- edit image
- feature image
- reorder image
- remove image

Also prove:

- featured teammate exclusivity still holds
- featured gallery exclusivity still holds
- sort-order restamping still holds
- the surfaces now better preview what the published result will feel like
- any raw or stale role/state language in these surfaces was cleaned through

## Deliverables / closure notes to create

Create:

- `docs/architecture/reviews/publisher/wave-01-team-and-gallery-product-closure.md`

Include:

- what product-grade gaps remained after the earlier rebuild
- what was preserved
- what was elevated
- invariant checks performed


## Required working method

Before you edit anything:

1. Scrub the full affected seam.
2. Verify that referenced files, exports, symbols, and CSS classes have not drifted.
3. Do **not** re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
4. Identify exactly what must be preserved.
5. Identify exactly what must be removed, consolidated, or rewritten.
6. Prove closure before you move to the next prompt.

## Explicit instruction not to make unrelated changes

Do not make unrelated code changes. Keep the work tightly bounded to the seams identified in this prompt unless an adjacent change is strictly required for closure.

