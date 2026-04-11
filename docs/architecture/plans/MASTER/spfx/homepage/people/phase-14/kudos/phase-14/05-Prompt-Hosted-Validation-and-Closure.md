# 05 — Prompt: Hosted Validation and Closure

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Validate the new public reaction component on the HB Kudos webpart in SharePoint-hosted runtime and prove closure.

## Mandatory validation baseline

- SharePoint-hosted runtime
- standard 100% browser zoom
- real public-facing HB Kudos webpart instance

## Required proof points

You must prove all of the following:

1. The public webpart now visibly exposes a reaction / like affordance.
2. The affordance is visible even when count = 0.
3. Reacting from the public surface performs the intended celebrate action.
4. The count updates correctly after interaction.
5. The UI provides sensible loading / feedback behavior.
6. The public surface remains premium and visually balanced.
7. No regression has been introduced to the detail-panel celebrate path.
8. The implementation remains ownership-correct.

## Required artifacts

Capture and provide:

- screenshot of the public webpart with the visible reaction component before interaction
- screenshot after reaction showing updated count/state
- concise summary of the interaction path
- files changed
- any remaining issues, explicitly labeled

## Closure rule

Do not claim closure if any of the following remain true:

- the public webpart still gives no obvious sign that reactions are supported
- reaction is only available in the detail panel
- the count does not update correctly
- the feature is invisible at zero count
- the implementation bypasses the existing celebrate write path
- validation was not performed in hosted runtime

## Final output format

Return:
- completion status
- proof-point checklist
- screenshot inventory
- ownership summary
- remaining risks, if any
