# HB Kudos Public Webpart — `View All` Feed Slide-Out Prompt Package

This package is limited to the **public-facing HB Kudos webpart** and the specific `View All` behavior defect.

## Objective

Replace the current dead / insufficient `View All` behavior with a real slide-out feed experience.

### Required target behavior

When a user clicks `View All` on the public HB Kudos webpart:

- it must open the **same slide-out shell pattern** used by the `Give Kudos` form
- it must **not** open the form
- it must instead display a **full feed of kudos** from the `People Culture Kudos` list
- the feed must show kudos content **without compaction**
- the experience must feel like a premium browse surface, not an archive jump target

## Repo-truth starting point

The current implementation hardcodes `viewAllHref="#hb-kudos-archive"` in `HbKudos.tsx`, so the public webpart is still using an in-page anchor rather than a real browse panel.
The shared public surface currently accepts `viewAllHref` as an href-style CTA input, and the shared flyout shell already exists via `HbcKudosComposerFlyout`.

## This package covers

- shared `View All` CTA contract correction
- public-webpart slide-out feed wiring
- feed rendering contract and layout rules
- full-content, non-compacted kudos browse behavior
- hosted validation and closure

## This package does not cover

- `Give Kudos` form remediation
- companion moderation app changes
- general flyout host-clearance work unless directly required by the new `View All` feed panel

## Mandatory repo scope

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx`
- `packages/ui-kit/src/HbcPeopleCultureSurface/people-culture-surface.module.css`
- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts`

## Agent instruction

Do not re-read files that are already in your active context unless you need to verify a dependency, confirm drift, or resolve uncertainty after making changes.

## Ownership rule

- shared public-surface CTA contract belongs in `HbcPeopleCultureSurface`
- shared slide-out shell reuse belongs in `HbcKudosComposerFlyout` or a thin shared wrapper using that shell
- public-feed state and entry selection belong in `HbKudos.tsx`
- data sourcing must continue to use the existing Kudos list read path
