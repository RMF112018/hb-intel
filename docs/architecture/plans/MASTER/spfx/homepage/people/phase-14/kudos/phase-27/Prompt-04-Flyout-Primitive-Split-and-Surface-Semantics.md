# Prompt-04 — Flyout Primitive Split and Surface Semantics

## Objective

Close the finding that the current Kudos implementation overuses `HbcKudosComposerFlyout` as a generic shell for unrelated workflows and therefore has a weak primitive seam.

This prompt is about **surface-shell semantics only**.

## Active finding only

Only remediate this finding:
- flyout shell reuse has become a weak primitive seam

Do not redesign the moderation workflow as a whole here. Do not redesign the public hero here. Focus on the shell / container layer and the workflows that are currently forced through the same wrapper.

## Repo-truth starting footprint

At minimum inspect:

- `apps/hb-webparts/src/webparts/hbKudos/KudosComposerPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- any related flyout / drawer / dialog body shells and style modules

## Required work

1. Identify every distinct workflow currently using the composer flyout shell.
2. Define the correct shell families for those workflows, at minimum separating:
   - composer,
   - reader/detail,
   - governance decision/detail,
   - compact task dialog.
3. Refactor callers to use the correct shell.
4. Preserve shared internals only where they are legitimately reusable.
5. Improve semantic clarity, layout fit, and future extensibility.

## Exhaustive scrub requirement

- Remove misleading shared naming where the primitive is no longer “composer”-specific.
- Remove stale wrapper components that become redundant after the split.
- Remove fallback code that quietly routes unrelated workflows back through the old shell.
- Confirm there are no remaining unrelated surfaces still piggybacking on the wrong container primitive.

## Not acceptable

- Renaming the composer flyout and leaving the same primitive mismatch in place
- Creating multiple thin aliases around the same weak shell
- Splitting primitives only in name while keeping the same layout semantics and constraints underneath

## Closure standard

Do not declare this finding closed until you provide:
1. the workflow-to-shell map before and after,
2. the touched files,
3. what was removed,
4. what shell families now exist,
5. why the resulting primitive seam is materially stronger.
