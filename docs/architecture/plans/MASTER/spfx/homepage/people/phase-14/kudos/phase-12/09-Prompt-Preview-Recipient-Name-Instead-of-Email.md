# 09 — Prompt: Preview Recipient Name Instead of Email

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Correct the Give Kudos preview card at the bottom of the panel so that the line beneath the headline displays the selected recipient's **first and last name**, not their email address.

This is a presentation and data-mapping correction inside the preview path.
The preview should read like a recognition card, not a directory/contact record.

## Mandatory scope

Audit and remediate at minimum:

- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- any preview-card rendering code used by the composer
- any shared draft / recipient mapping helpers used by the preview
- `packages/ui-kit/src/HbcPeoplePicker/` only if the selected recipient shape is influencing the wrong preview field
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` only if local composition is incorrectly passing preview data

## Problem statement

The current preview shows the recipient email address below the headline.
That is not the correct display treatment for a Kudos recognition preview.

The preview should display:
- headline
- recipient first + last name on the subline
- message body
- supporting sender/recipient metadata only where appropriate

Email may still exist in the underlying selected-person object, but it should not be the primary preview subline when a proper display name is available.

## Required outcomes

You must ensure:

- the preview subline uses recipient first + last name
- email is not shown in that subline when a valid display name exists
- the preview remains stable for:
  - single-recipient selection
  - multi-recipient scenarios if supported
  - recipients with display name + email
  - recipients with only partial name data
- fallback logic is explicit and sensible

## Required implementation direction

1. Audit the preview-card binding path and determine exactly which field is currently populating the subline.
2. Identify the strongest ownership seam for this correction.
3. Change the preview to prefer:
   - `displayName`, or
   - joined `firstName + lastName`,
   - then a sensible fallback only if a proper name is unavailable.
4. Do not hardcode this as a one-off text replacement detached from the actual selected-recipient model.
5. Keep the preview consistent with the selected-chip/result-row naming treatment.

## Fallback rule

Use this display priority unless repo-truth shows a stronger existing contract:

1. full display name
2. first + last name
3. first name only or last name only
4. email only as a final fallback when no usable name exists

## Explicit prohibitions

Do not:
- leave email as the default preview subline when name data exists
- patch only the screenshot state without correcting the real preview binding path
- introduce divergence between picker display naming and preview display naming
- regress preview rendering for recipients lacking photo/avatar data

## Validation standard

You must prove all of the following:

- selecting a user with a normal profile shows first + last name under the headline
- the preview no longer shows email there when a name exists
- the preview still renders correctly after typing headline/message
- no regression to picker chips, selected recipients, or preview avatar/initials behavior
- the corrected preview works at standard 100% zoom in SharePoint-hosted runtime

## Deliverables

Return:

- files changed
- exact preview binding path corrected
- final name/fallback rule used
- concise before/after summary
- screenshot proof of the corrected preview
