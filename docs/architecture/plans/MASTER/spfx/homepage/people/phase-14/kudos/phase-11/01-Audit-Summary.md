# Audit Summary — Repo-Truth Basis for the Fix

## What repo truth says now

### 1) HB Kudos wires search, but not photo fetch
`apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` creates:
- `const searchPeople = useSharePointPeopleSearch();`

That file does **not** currently pass any `fetchPersonPhoto` prop into the shared composer path. That is the immediate integration gap.

### 2) The shared composer already supports photo fetch
`packages/ui-kit/src/HbcKudosComposer/index.tsx` already defines and forwards:
- `fetchPersonPhoto?: PersonPhotoFn`
- `KudosSharedPickerBridge`
- `HbcPeoplePicker ... fetchPersonPhoto={fetchPersonPhoto}`

So the shared lane is already designed for this behavior.

### 3) The shared picker is already built for separate photo retrieval
`packages/ui-kit/src/HbcPeoplePicker/types.ts` explicitly states:
- photo retrieval is a separate path from user search
- `photoUrl` is asynchronous
- missing-photo is a first-class normal state

### 4) The shared photo cache already implements the correct Graph path
`packages/ui-kit/src/HbcPeoplePicker/usePersonPhotoCache.ts` already implements:
- per-person photo state
- missing-photo vs transient-failure distinction
- `createGraphPersonPhotoFn(getAccessToken)`
- Graph `/users/{id-or-upn}/photo/$value`

### 5) The current SharePoint search adapter is good enough for defect closure, but not the long-term rich contract
`apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`:
- resolves live people via `ClientPeoplePickerSearchUser`
- ranks results with `rankPeopleResults`
- maps `displayName`, `givenName`, `surname`, `mail`, `jobTitle`, `department`
- does not return photo
- does not return a stable Graph `id`

That is acceptable for immediate photo fix because the shared photo adapter can fetch by UPN, but it is still a thinner contract than the shared picker should ideally support long-term.

### 6) The shared homepage export lane already exposes the required primitives
`packages/ui-kit/src/homepage.ts` already exports:
- `HbcPeoplePicker`
- `useGraphPeopleSearch`
- `rankPeopleResults`
- `usePersonPhotoCache`
- `createGraphPersonPhotoFn`

That means the fix should use the existing shared lane, not invent a new one.

## What this means
The production defect is caused by incomplete consumer wiring, not by absence of a shared photo system. The targeted remediation should fix the consumer wiring first, then tighten shared contracts only as needed.
