# 03 — Prompt: Recipient Photo Hydration

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Correct the public-facing HB Kudos avatar path so the featured recognition and any other recipient-avatar surfaces use the **actual user photo associated with the kudos recipient** whenever one is available.

## Critical ownership rule

This is primarily a **data hydration / mapping seam** issue, not an avatar-rendering issue.

The strongest implementation path is:
- hydrate recipient photo/media at the data-mapping layer
- pass it through the existing recipient `src` path
- preserve initials fallback only when no photo can be resolved

## Mandatory scope

Audit and remediate at minimum:

- `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `packages/ui-kit/src/HbcAvatarStack/index.tsx`
- any existing profile-photo resolver utilities already used elsewhere in the People & Culture lane

## Required outcomes

- featured recognition hero avatar uses recipient photo when available
- recent/archive avatar presentation uses recipient photo when available
- initials fallback remains intact only when no photo is available or the image fails
- ownership remains correct
- no local-only display hack is used as the primary solution

## Required implementation direction

1. Audit the current Kudos recipient mapping.
2. Identify the correct photo-resolution pattern already used elsewhere in the People & Culture system.
3. Hydrate recipient media/photo data for individual recipients.
4. Thread that media through the existing surface adapter path.
5. Validate that the shared avatar component now receives a real `src`.
6. Keep fallback behavior resilient.

## Explicit prohibitions

Do not:
- hardcode photo URLs in `HbKudos.tsx`
- add a one-off avatar override only for the featured card
- regress initials fallback behavior
- attach photo logic to the wrong ownership seam if the existing People & Culture lane already has a reusable resolver pattern

## Deliverables

Return:
- files changed
- exact seam where recipient photo is now hydrated
- exact seam where the public webpart consumes it
- proof that initials now appear only as fallback
