# Prompt-05 — Companion Component Decomposition and State Extraction

## Objective

Close the finding that `HbKudosCompanion.tsx` is still overgrown and carrying too many responsibilities.

This prompt is about **architectural decomposition of the companion runtime**, not the full UX redesign.

## Active finding only

Only remediate this finding:
- companion runtime is overgrown and under-extracted

Do not use this prompt to perform the main moderation UX redesign beyond what is necessary to extract clean seams.

## Repo-truth starting footprint

At minimum inspect:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- relevant helper/data modules already used by the companion
- any new local modules you create for extracted selectors, planners, panels, or regions

## Required work

1. Break the companion runtime into a cleaner orchestration host plus dedicated sub-seams.
2. Extract, at minimum where justified:
   - queue selectors / filter application,
   - queue region composition,
   - row rendering,
   - detail-surface composition,
   - dialog routing / action planning,
   - degraded-state rendering.
3. Keep the runtime split contract intact.
4. Keep typed patch contracts intact.
5. Make the resulting architecture easier to test, review, and evolve safely.

## Exhaustive scrub requirement

- Remove dead local helpers left behind in the original file.
- Remove stale inline component definitions if they are promoted into dedicated modules.
- Remove contradictory comments that describe an ownership model no longer reflected by the code.
- Confirm there is no duplicated logic between the old monolith file and the new extracted seams.

## Not acceptable

- Moving small chunks into new files while leaving the main file effectively just as overloaded
- Creating extraction seams with vague names and no clear ownership
- Duplicating filter/action logic in multiple places after the extraction

## Closure standard

Do not declare this finding closed until you provide:
1. the pre/post ownership map for the companion runtime,
2. all touched files,
3. what logic moved where,
4. what stale logic was removed,
5. why the resulting architecture is materially safer and cleaner.
