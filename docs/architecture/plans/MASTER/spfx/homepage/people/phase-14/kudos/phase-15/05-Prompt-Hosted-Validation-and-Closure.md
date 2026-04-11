# 05 — Prompt: Hosted Validation and Closure

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Validate the new `View All` slide-out feed behavior for the public HB Kudos webpart in SharePoint-hosted runtime and prove closure.

## Mandatory validation baseline

- SharePoint-hosted runtime
- standard 100% browser zoom
- public-facing HB Kudos webpart instance

## Required proof points

You must prove all of the following:

1. Clicking `View All` no longer acts as a dead or insufficient anchor jump.
2. Clicking `View All` opens a slide-out panel.
3. The slide-out uses the same shell language as the `Give Kudos` panel.
4. The panel shows a feed of kudos from the live `People Culture Kudos` list.
5. The feed does not compact kudos into archive-row density.
6. The feed content is readable and scrollable.
7. No regression is introduced to the existing `Give Kudos` form panel.
8. The implementation remains ownership-correct.

## Required artifacts

Capture and provide:

- screenshot of the public webpart before opening `View All`
- screenshot of the opened `View All` feed panel
- screenshot showing multiple full kudos entries in the feed
- concise validation summary
- files changed
- any remaining issues, explicitly labeled

## Closure rule

Do not claim closure if any of the following remain true:

- `View All` still only jumps to `#hb-kudos-archive`
- the opened panel is just the `Give Kudos` form
- the feed is still rendered as compact archive rows
- the feed is not sourced from the live Kudos list path
- validation was not performed in hosted runtime

## Final output format

Return:
- completion status
- proof-point checklist
- screenshot inventory
- ownership summary
- remaining risks, if any
