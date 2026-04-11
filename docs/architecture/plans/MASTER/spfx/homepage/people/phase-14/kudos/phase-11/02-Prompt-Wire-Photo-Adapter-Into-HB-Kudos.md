# Prompt 01 — Wire Photo Fetch Into HB Kudos Now

You are working in the live HB Intel repo.

## Objective
Close the current HB Kudos defect where the Give Kudos people search returns matching users but does not associate directory photos with those users in the dropdown or selected chips.

## Mandatory operating rules
- Do not reread files already in your current context or memory unless they changed, your context is stale, or scope expanded.
- Read only the smallest authoritative set needed.
- Do not redesign the picker from scratch.
- Do not create a duplicate photo cache, duplicate people picker, or local avatar rendering system.

## Repo-truth starting point
Treat the following as already established and verify only as needed:

- `HbKudos.tsx` passes `searchPeople = useSharePointPeopleSearch()`.
- `HbcKudosComposerForm` already accepts `fetchPersonPhoto?: PersonPhotoFn`.
- `KudosSharedPickerBridge` already forwards `fetchPersonPhoto` into `HbcPeoplePicker`.
- `usePersonPhotoCache` / `createGraphPersonPhotoFn` already exist in the shared picker lane.
- The defect is that HB Kudos is not supplying the photo adapter.

## Required files
Read only what is required from:
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `packages/ui-kit/src/HbcPeoplePicker/usePersonPhotoCache.ts`
- `packages/ui-kit/src/homepage.ts`
- any smallest-credible SPFx/Graph token helper you need to reuse if already present in repo

## Required implementation outcome
Implement the smallest correct fix so that:

1. HB Kudos creates a Graph-scoped photo adapter.
2. HB Kudos passes that adapter into `HbcKudosComposerForm` as `fetchPersonPhoto`.
3. The shared picker can resolve photos for:
   - live search result rows
   - selected recipient chips
4. Users without photos still render initials without errors.

## Boundary rules
- Keep photo cache / photo state / picker rendering in shared `@hbc/ui-kit`.
- Keep auth and environment-specific token acquisition in the consumer or appropriate SPFx-side adapter layer.
- Do not move SharePoint `ClientPeoplePickerSearchUser` logic into `@hbc/ui-kit`.
- Do not replace the active SharePoint search adapter in this prompt unless it is strictly required to make the photo path work.

## Implementation details
- Prefer the existing shared export lane from `@hbc/ui-kit/homepage` if it already exposes the required photo helper.
- Use the existing Graph photo pattern based on `/users/{id-or-upn}/photo/$value`.
- Support UPN-based fallback if stable Graph id is unavailable from the SharePoint search result.
- Do not assume photo is inline on the user search object.
- Do not special-case one user; implement the general fix.

## Deliverables
- Updated source files.
- Brief implementation summary stating:
  - what was changed
  - why the bug occurred
  - how the fix uses the shared lane
  - what remained intentionally local

## Minimum validation
Prove in code review notes or validation output:
- search still returns users
- users with photos now render photos
- users without photos still render initials
- no regression to chip selection/removal
