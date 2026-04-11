# 00 — Plan Summary

## Objective

Correct the HB Kudos hosted UI so the Give Kudos flyout and related surfaces are production-ready inside SharePoint, with explicit accommodation for the persistent lower-right SharePoint assistant button.

## Decision lock

The SharePoint assistant button is part of the host environment and must be treated as permanent runtime chrome.

The fix is therefore not “remove overlap by suppressing the button.”
The fix is “make the shared sheet/footer/scrolling system host-aware and clearance-safe.”

## Workstreams

1. **Shared hosted overlay correction**
   - Fix the flyout/sheet hosting strategy so it behaves correctly inside SharePoint.
   - Eliminate top-edge/header collision with SharePoint chrome.
   - Ensure viewport origin, panel height, and internal scroll behavior are host-aware.

2. **Footer safe-zone + host-control clearance**
   - Add explicit lower-right clearance behavior for persistent SharePoint controls.
   - Ensure footer actions remain fully visible and comfortably clickable with the assistant button present.

3. **Composer layout + 100% zoom usability**
   - Rebalance the form, preview, bucket flow, and footer density for normal desktop use.
   - Ensure the UI does not require reduced browser zoom to be usable.

4. **People picker ownership correction**
   - Collapse duplicate picker behavior onto the shared picker lane.
   - Preserve live search, photo/avatar behavior, and selection quality.

5. **Surface and archive responsive refinement**
   - Tighten any remaining cramped or fragile spacing on the main Kudos surface.
   - Correct local density issues only after shared hosted fixes are in place.

6. **Hosted validation and closure**
   - Validate in SharePoint-hosted runtime with the assistant button visible.
   - Capture proof at standard 100% zoom.

## Required execution order

Execute in this order:

1. Shared hosted overlay correction
2. Footer safe-zone + host-control clearance
3. Composer layout + 100% zoom remediation
4. People picker ownership correction
5. Surface/archive refinement
6. Hosted validation and closure

## Why this order is mandatory

If the agent starts with local spacing tweaks before fixing the shared hosting seam, it will produce cosmetic drift and fragile hacks rather than a durable correction.

## Closure rule

This effort is not complete until the Give Kudos flyout is fully usable at 100% zoom in SharePoint while the assistant button remains visible in the lower-right corner.
