# 05 — Prompt: People Picker Ownership and Dropdown Remediation

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Remove ownership drift in the HB Kudos people-picker path and consolidate onto the shared picker lane while preserving live directory search, avatar/photo behavior, and a high-quality dropdown experience inside the hosted sheet.

## Mandatory scope

Audit and remediate at minimum:

- `packages/ui-kit/src/HbcPeoplePicker/`
- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- homepage export surfaces if required

## Required outcomes

- the shared picker is the durable owner
- duplicate local picker behavior in the composer is removed or reduced to a thin bridge only
- the dropdown remains stable inside the hosted flyout
- result rows remain visually clear
- avatar/photo and text rendering remain premium
- the search experience still works in SharePoint-hosted runtime

## Required implementation direction

1. Identify every place where picker logic is duplicated.
2. Consolidate behavior into the shared picker lane.
3. Keep consumer-specific draft-shape bridging thin.
4. Verify dropdown behavior inside the revised hosted sheet.
5. Ensure no regression to search results, photo handling, or selection chips.

## Additional host-awareness requirement

Ensure picker dropdown rendering does not become the next collision point after the footer/sheet fixes.
The picker must coexist cleanly with the revised sheet body scroll and viewport constraints.

## Deliverables

Provide:
- files changed
- ownership summary
- duplicate logic removed
- proof that live people search still works
