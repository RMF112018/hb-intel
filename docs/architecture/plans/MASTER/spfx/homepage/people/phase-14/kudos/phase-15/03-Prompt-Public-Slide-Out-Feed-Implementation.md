# 03 — Prompt: Public Slide-Out Feed Implementation

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Implement the HB Kudos `View All` slide-out feed using the same slide-out shell pattern as the `Give Kudos` form, but with browse/feed content instead of the form.

## Mandatory scope

Audit and remediate at minimum:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `packages/ui-kit/src/HbcKudosComposer/index.tsx` if the existing shell needs a small shared enhancement
- any thin local helper/component extracted for the feed body

## Required outcomes

- clicking `View All` opens a slide-out panel
- the slide-out visually reuses the same shell language as the `Give Kudos` form
- the panel title/subtitle are appropriate for a Kudos feed browse experience
- the panel content is a feed of kudos entries, not the submission form
- the user can close the panel cleanly
- no duplicate overlay system is introduced

## Required implementation direction

1. Audit how the existing `Give Kudos` flyout is opened and rendered.
2. Reuse the existing shared flyout shell pattern.
3. Add a dedicated public browse/feed panel state path in `HbKudos.tsx`.
4. Ensure `View All` opens that feed panel instead of navigating to `#hb-kudos-archive`.
5. Keep the implementation thin and ownership-correct.

## Explicit prohibitions

Do not:
- create a second unrelated flyout implementation if the existing shell can be reused
- open the `Give Kudos` form and swap content awkwardly in a brittle way
- leave the old archive jump target as the effective public behavior
- over-couple the feed panel to the form state path if a cleaner sibling panel state is available

## Deliverables

Return:
- files changed
- summary of the new public feed panel state model
- summary of shared shell reuse
- note on whether any shared shell enhancements were needed
