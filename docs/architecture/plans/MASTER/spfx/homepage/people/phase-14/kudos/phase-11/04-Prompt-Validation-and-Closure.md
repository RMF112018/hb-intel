# Prompt 03 — Validate and Close the HB Kudos Photo Association Fix

You are validating the completed targeted remediation.

## Objective
Prove that the HB Kudos Give Kudos panel now associates directory photos with users correctly, using the shared people-picker/photo lane and without introducing regression.

## Mandatory operating rules
- Do not reread files already in your current context or memory unless they changed, your context is stale, or scope expanded.
- Use the smallest credible validation set.
- If validation fails, identify the exact seam and fix that seam rather than widening scope.

## Required proof points
You must verify all of the following:

### A. Shared-lane correctness
- `HbKudos.tsx` now supplies `fetchPersonPhoto`.
- The prop flows into `HbcKudosComposerForm`.
- The prop flows through `KudosSharedPickerBridge`.
- `HbcPeoplePicker` remains the rendering owner.
- `usePersonPhotoCache` remains the photo-state owner.

### B. Functional behavior
- Typing a real employee name returns live search results.
- A user with a directory photo shows a photo in the result row.
- Selecting that user shows a photo in the selected chip.
- A user without a directory photo renders initials instead of a broken image.
- Search and selection still work.
- Removing a selected chip still works.

### C. Boundary correctness
- No duplicate picker created.
- No duplicate photo cache created.
- No direct local avatar hack inserted into HB Kudos row rendering.
- No SharePoint-specific request-digest or people-search code was moved into ui-kit.

## Validation commands
Run only the smallest meaningful set for this scope:
- targeted typecheck / lint / test / build commands applicable to touched packages
- any smallest credible local verification path for the webpart surface

If a broader validation command is required, justify why.

## Required final output
Return a concise closure note with:
1. files changed
2. validation run
3. result
4. any residual risk
5. whether the defect is closed
6. if not fully closed, the exact remaining blocker

## Closure bar
Do not claim completion unless the UI now shows real photos for users who have them.
