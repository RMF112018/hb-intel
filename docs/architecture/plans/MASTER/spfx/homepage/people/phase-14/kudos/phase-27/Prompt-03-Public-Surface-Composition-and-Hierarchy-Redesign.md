# Prompt-03 — Public Surface Composition and Hierarchy Redesign

## Objective

Close the finding that the HB Kudos public surface is visually polished but still structurally underpowered and too dependent on decorative premiumization.

This prompt is about the **public product surface**:
- hero / masthead relationship,
- featured-recognition authority,
- recent-recognition rhythm,
- archive / view-all hierarchy,
- overall page-canvas posture.

## Active finding only

Only remediate this finding:
- public surface is visually polished but still structurally underpowered

Do not use this prompt to refactor the companion runtime or expand the test suite except where targeted validation is required to prove this public-surface change.

## Repo-truth starting footprint

At minimum inspect:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- relevant CSS / variant seams touched by this redesign

## Required work

1. Re-evaluate the rendered hierarchy, not just the styling.
2. Strengthen the relationship between:
   - the top band,
   - the featured recognition object,
   - the recent-recognition zone,
   - the archive / full-feed entry point.
3. Make the surface feel more productized and less like a set of styled recognition cards.
4. Preserve the current strong behaviors that are worth keeping:
   - featured-recipient-first hierarchy,
   - role-safe reader path,
   - clear give-kudos entry point,
   - archive collapse / expand behavior where still useful.
5. Improve the public browsing experience where it is currently too conservative.

## Design posture

Prefer structural improvement over additional decoration.

That may include:
- rebalancing the hero/featured composition,
- improving recent-row scanability,
- upgrading the archive/feed hierarchy,
- tightening spacing rhythm,
- improving the “View all recognition” surface so it feels like a product surface, not a bolted-on overflow panel.

## Exhaustive scrub requirement

- Remove obsolete local composition rules and stale markup that only served the old hierarchy.
- Remove duplicate entry points or weak hierarchy furniture that no longer belongs.
- Confirm that the public surface does not preserve the same structural weakness in a slightly restyled form.

## Not acceptable

- A “visual refresh” that leaves the same hierarchy intact
- More gradients, glow, or blur in place of structural improvement
- Treating recent/archive/feed as secondary leftovers rather than part of the product surface

## Closure standard

Do not declare this finding closed until you provide:
1. the old vs new hierarchy model,
2. the touched files,
3. what structural weaknesses were removed,
4. what was intentionally preserved,
5. why the new composition is a stronger SPFx homepage surface.
