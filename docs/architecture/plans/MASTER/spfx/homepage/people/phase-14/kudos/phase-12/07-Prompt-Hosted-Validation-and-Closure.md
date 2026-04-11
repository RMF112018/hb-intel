# 07 — Prompt: Hosted Validation and Closure

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Perform final validation and produce closure evidence proving the HB Kudos UI is now correct in SharePoint-hosted runtime.

## Mandatory validation environment

Validation must be performed in SharePoint-hosted runtime, not only local preview.

The persistent lower-right SharePoint assistant button must be visible during validation.

Browser zoom baseline:
- **100% zoom is mandatory**
- optional comparison captures at 90% may be included, but they are not closure proof

## Required proof points

You must prove all of the following:

1. The Give Kudos flyout header is fully visible.
2. The flyout does not render beneath SharePoint top chrome.
3. The flyout is fully usable at 100% browser zoom.
4. The user does not need reduced browser zoom to use the UI.
5. Footer actions remain fully visible with the SharePoint assistant button present.
6. Footer actions are not visually crowded by the assistant button.
7. The body scroll region behaves correctly.
8. The people picker still works.
9. The main Kudos card surface does not regress.
10. Ownership remains aligned with shared UI doctrine.

## Required artifacts

Capture and provide:

- screenshot of the main HB Kudos surface at 100% zoom
- screenshot of the Give Kudos flyout open at 100% zoom
- screenshot showing footer actions with the SharePoint assistant button visible
- screenshot showing live people-search results
- concise hosted validation summary
- files changed since start of remediation
- any remaining issues, explicitly labeled if present

## Closure rule

Do not claim closure if any of the following remain true:

- header is still partially hidden
- footer actions are still crowded by the assistant button
- the UI still only feels usable at 90% zoom
- validation was done without the SharePoint assistant button present
- the fix depends on a local-only patch instead of the correct shared owner

## Final output format

Return:
- completion status
- validation results against each proof point
- screenshot inventory
- final ownership summary
- remaining risks, if any
