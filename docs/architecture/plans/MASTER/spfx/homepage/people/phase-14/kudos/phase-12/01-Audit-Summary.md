# 01 — Audit Summary

## Primary conclusion

The most important UI issue is not the presence of the SharePoint assistant button.
The real issue is that the current HB Kudos hosted flyout does not properly accommodate permanent SharePoint host chrome at either the top edge or the lower-right edge.

## Repo-truth summary

### Shared flyout / composer seam
The shared `HbcKudosComposerFlyout` is the primary owner of:
- backdrop behavior
- panel positioning
- header rendering
- body scrolling
- footer action layout

That makes it the correct owner for:
- top SharePoint header accommodation
- viewport-fit logic
- bottom-right host-control clearance

### Shared picker seam
The repo already has a shared `HbcPeoplePicker` lane.
The composer still contains duplicate picker behavior, which increases fragility and makes the sheet harder to stabilize.

### Local Kudos webpart seam
`HbKudos.tsx` owns local composition, archive/footer integration, and the webpart-level orchestration.
It is not the correct durable owner for hosted overlay fixes.

## Defect framing update

### Incorrect framing
- “There is a floating button over the footer; remove it.”
- “Out-z-index the host control.”
- “Patch around it locally.”

### Correct framing
- The floating assistant button is immutable host UI.
- The shared flyout/footer system must reserve safe clearance for it.
- Footer actions must remain visible, accessible, and visually balanced while that host control is present.

## Material defects to fix

1. Flyout header collision with top SharePoint chrome
2. Host-unaware viewport origin assumptions
3. Footer action crowding near the lower-right assistant button
4. Inadequate bottom clearance strategy for persistent SharePoint controls
5. Composer density that becomes fragile at standard 100% zoom
6. Duplicate picker ownership inside the composer
7. Secondary surface/archive density issues

## Required implementation posture

- no one-off CSS band-aid
- no local-only z-index hack
- no validation performed without the assistant button visible
- no closure claim based only on local preview
