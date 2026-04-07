# Prompt 03 — Featured and Rail Image Validation

## Objective

Validate that the corrected Spotlight image resolution path works for both the **featured image** and the **supporting rail thumbnails**.

## Why This Prompt Exists

A narrow fix can still fail if:

- only the featured image path is corrected
- rail thumbnails consume a separate mapping path
- one image surface still accepts bad unresolved values

This prompt is about proving that both rendering surfaces are protected.

## Target Files

- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/components/ProjectPortfolioSpotlight.tsx`
- any immediately related local subcomponent or mapper feeding its `image` props

## Required Actions

1. Confirm the featured surface consumes the corrected normalized `image.src`.
2. Confirm the supporting rail consumes the same corrected normalized `image.src` path or an equivalent safe value.
3. Confirm that when no valid image URL exists:
   - the featured surface shows the intended placeholder
   - the rail surface shows the intended placeholder
   - neither surface emits a bad request from an unresolved reserved token
4. Add or update the smallest credible unit / integration proof available within the repo’s current standards.

## Hard Constraints

- Do **not** redesign the component.
- Do **not** change styling.
- Do **not** change animation behavior unless required for a test harness.
- Do **not** re-read files that are already in your active context window; use current context first and only open additional files when needed to complete the task safely and correctly.

## Deliverables

Provide a short validation note with:

- `Featured Surface Result`
- `Rail Surface Result`
- `Placeholder / Fallback Result`
- `Any Shared Contract Assumptions`
- `Open Risks`

If tests are added or updated, include:

- test file name
- scenario coverage
- any gap that still requires tenant runtime proof

## Risk Exposure

Explicitly check for:

- featured and rail using subtly different image assumptions
- placeholder behavior masking a still-bad request
- one path still accepting unresolved string tokens

## Validation Gate

Do not move to package rebuild until you can state:

- the corrected value path is shared or equivalently safe
- both image surfaces behave correctly with valid and invalid inputs
