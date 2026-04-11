# 11 — Prompt: Preview Avatar Must Use Recipient Photo with Avatar Fallback

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Correct the Give Kudos preview card so the preview avatar uses the selected recipient's actual photo whenever a photo is available.

If no photo is available, the preview must fall back to the current avatar / initials treatment.

This is a preview data-binding and display-priority correction.
Do not treat it as a cosmetic-only styling task.

## Mandatory scope

Audit and remediate all code materially involved in preview avatar rendering, including but not limited to:

- `apps/hb-webparts/src/webparts/hbKudos/`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `packages/ui-kit/src/HbcKudosComposer/`
- `packages/ui-kit/src/HbcPeoplePicker/`
- any shared avatar / photo rendering utilities used by the preview card
- any draft-to-preview mapping code that transforms selected recipients into preview display data

## Required tasks

### 1. Find the actual preview avatar binding path
Identify:
- where the preview card gets its avatar/photo data
- where the selected recipient object is normalized for preview use
- whether the preview currently ignores available photo data and always renders initials/avatar fallback

### 2. Reconcile preview avatar behavior with picker result behavior
If the people picker already has access to a recipient photo or photo URL, the preview should not discard it.

The preview avatar and picker result should follow the same display priority logic unless there is a clearly documented reason not to.

### 3. Implement correct display priority
The preview avatar must use this priority order:

1. selected recipient photo / photo URL / image source
2. selected recipient avatar image data already available from the picker/search result
3. current fallback avatar / initials treatment

Do not skip directly to initials if usable photo data already exists.

### 4. Preserve current fallback behavior
If no photo is available:
- keep the current initials/avatar fallback
- do not introduce broken-image icons
- do not render empty avatar shells
- do not regress typography or spacing in the preview card

### 5. Keep preview identity consistent
Ensure the preview card identity elements are internally consistent:
- preview avatar reflects the selected recipient
- preview name reflects the selected recipient display name
- preview subline and footer identity treatment do not contradict the selected person

## Required implementation direction

- Audit the selected recipient object shape from the people picker/search result.
- Identify what photo-related fields are already available.
- Thread that data through the draft-to-preview mapping layer.
- Render the photo in the preview avatar when present.
- Preserve fallback initials/avatar behavior when not present.

## Explicit prohibitions

Do not:
- hardcode a photo URL
- add a second network fetch in the preview if the picker/search result already has the needed photo data
- regress picker behavior to fix preview behavior
- remove the current fallback avatar behavior
- introduce a broken image state when photo data is absent

## Deliverables

Provide:

1. the exact files changed
2. the exact preview binding path corrected
3. the photo field(s) used by the preview
4. the fallback behavior retained
5. validation proof showing:
   - recipient with photo renders photo in preview
   - recipient without photo renders fallback avatar correctly

## Validation criteria

You must prove all of the following:

- preview avatar shows the selected recipient photo when available
- preview falls back cleanly to the current avatar/initials treatment when no photo exists
- preview name and avatar refer to the same recipient
- no regression to people picker results
- no regression to preview card spacing, styling, or hosted SharePoint rendering
- behavior works in SharePoint-hosted runtime at 100% zoom
