# 01 — Audit Summary

## Executive conclusion

The current `View All` behavior is not aligned with the intended public browse experience.

Repo-truth shows that:

- `HbKudos.tsx` currently passes `viewAllHref="#hb-kudos-archive"` into the shared public surface
- the shared surface expects `viewAllHref` as an href-style CTA input
- the public webpart already uses `HbcKudosComposerFlyout` for the `Give Kudos` interaction

That means the missing behavior is not a missing overlay primitive.
It is a **CTA contract + public browse implementation** gap.

## Correct diagnosis

This is primarily a **shared public CTA seam problem** plus a **local feed implementation problem**.

## Ownership summary

### Shared owner
`packages/ui-kit/src/HbcPeopleCultureSurface/*`
should own:
- `View All` interaction contract
- support for callback-driven open behavior instead of href-only navigation when required by the consumer

### Shared shell owner
`packages/ui-kit/src/HbcKudosComposer/*`
already owns:
- the slide-out shell pattern that should be reused rather than duplicated

### Local owner
`apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
should own:
- opening/closing the browse feed panel
- mapping live Kudos entries into the slide-out feed
- entry-level interaction inside that feed if required

### Data owner
existing Kudos list read path should continue to own:
- sourcing all feed data from the live `People Culture Kudos` list
- public/archive eligibility filtering as appropriate for the chosen product behavior

## Required implementation posture

- do not leave `View All` as an in-page anchor jump
- do not create a second, unrelated overlay system
- do not compact the feed into archive-row density
- do not rewrite the Kudos data source when the live read path already exists
