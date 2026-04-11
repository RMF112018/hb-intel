# Audit Summary — Repo-Truth Findings

## Executive Conclusion

The correct move is **not** to invent a new shared people picker from scratch.

The repo already contains a shared people-picker lane in `packages/ui-kit/src/HbcPeoplePicker/`, but HB Kudos is still using a separate local picker embedded inside `packages/ui-kit/src/HbcKudosComposer/index.tsx`.

The required remediation is to consolidate onto the existing shared lane, upgrade its contract and rendering so it satisfies the required directory/photo behavior, expose it through the governed homepage entrypoint, and then rewire HB Kudos to consume it.

## Current Architecture of the HB Kudos People-Picker Path

### 1. Webpart orchestration

`apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`

Current responsibilities:

- imports shared homepage surface/composer primitives from `@hbc/ui-kit/homepage`
- resolves `searchPeople` via `useSharePointPeopleSearch()`
- passes `searchPeople` into `HbcKudosComposerForm`
- keeps local orchestration, data adaptation, and submit flow wiring

This file is not the correct durable owner for a reusable people picker.

### 2. Search dispatch + response parsing adapter

`apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`

Current responsibilities:

- dispatches tenant-wide `ClientPeoplePickerSearchUser`
- handles multiple SharePoint response wrappers
- maps SharePoint principal payload into the current `PersonEntry` contract
- currently returns only:
  - `upn`
  - `displayName`
  - optional `jobTitle`
  - optional `department`

This adapter is useful as current-state evidence and possibly as a fallback or environment-specific bridge, but it is not sufficient as the canonical long-term directory contract for the extracted shared picker because it does not align to the required Graph directory/photo evidence.

### 3. Actual picker UI currently used by Kudos

`packages/ui-kit/src/HbcKudosComposer/index.tsx`

Current responsibilities inside the local `HbcKudosComposerPeopleBucket` implementation:

- query input behavior
- debounce timing
- search dispatch invocation
- result filtering against selected values
- result rendering
- keyboard interaction
- chip/token rendering
- local display-name cache for selected users

This is the real duplicate implementation that must be removed or collapsed into the shared picker lane.

### 4. Existing shared picker lane

`packages/ui-kit/src/HbcPeoplePicker/`

Current responsibilities:

- shared people-picker component exists already
- shared types exist already
- shared Graph search hook exists already
- manual UPN fallback exists already

Current limitations:

- current `PersonEntry` shape is too thin
- current rendering does not show photo/avatar
- current rendering does not explicitly separate first/last name
- current Graph adapter only maps a narrow subset of fields
- current Graph search/ranking is limited and not explicitly human-name-first
- current homepage entrypoint does not export the actual `HbcPeoplePicker` component or Graph hook for homepage consumption

## File-Level Ownership Matrix

### Query input behavior

Current owner:

- `packages/ui-kit/src/HbcKudosComposer/index.tsx` (`HbcKudosComposerPeopleBucket`)

Target owner:

- `packages/ui-kit/src/HbcPeoplePicker/`

### Search dispatch

Current owner:

- adapter: `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- caller/invocation loop: `packages/ui-kit/src/HbcKudosComposer/index.tsx`

Target owner:

- shared picker invokes an injected search adapter from `packages/ui-kit/src/HbcPeoplePicker/`
- environment-specific token or transport acquisition may remain outside the shared picker

### Response parsing

Current owner:

- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `packages/ui-kit/src/HbcPeoplePicker/useGraphPeopleSearch.ts`

Target owner:

- shared typed contract in `packages/ui-kit/src/HbcPeoplePicker/`
- adapter-specific parsing in the appropriate adapter layer

### Ranking

Current owner:

- mostly backend response ordering + basic selected-item filtering
- no strong shared human-name-first ranking layer is evident

Target owner:

- shared adapter/search normalization layer used by `HbcPeoplePicker`

### Result rendering

Current owner:

- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- separate alternate rendering in `packages/ui-kit/src/HbcPeoplePicker/index.tsx`

Target owner:

- single shared result renderer in `packages/ui-kit/src/HbcPeoplePicker/`

### Chip/token selection

Current owner:

- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- parallel implementation in `packages/ui-kit/src/HbcPeoplePicker/index.tsx`

Target owner:

- shared selection/chip behavior in `packages/ui-kit/src/HbcPeoplePicker/`
- thin wrapper seam only where consumer-specific draft shape requires it

### Avatar rendering

Current owner:

- effectively none for the picker path

Target owner:

- `packages/ui-kit/src/HbcPeoplePicker/`

## What Should Become Shared

These concerns must become shared:

- search input behavior
- debounce/live-query handling
- keyboard interaction
- result rendering
- selection chips/tokens
- typed directory result contract
- avatar/photo display behavior
- initials fallback behavior
- human-name-first ranking/ordering rules

## What May Remain Local to HB Kudos

These concerns may remain local if kept thin:

- SPFx/homepage-specific token or request acquisition
- adapter selection when the runtime/environment dictates it
- bridge logic that preserves the current Kudos draft shape if it still stores `individualEmails: string[]`
- webpart orchestration and submit wiring

## Best Shared Destination

The best durable destination is the existing shared primitive lane:

- `packages/ui-kit/src/HbcPeoplePicker/`

with homepage-safe export from:

- `packages/ui-kit/src/homepage.ts`

This matches repo doctrine and avoids creating a second shared boundary.

## Required Contract Direction

The shared picker contract must account for:

- stable identity key (`id` and/or canonical directory key)
- first name
- last name
- display name
- email / userPrincipalName handling
- optional secondary metadata
- photo state separate from user payload
- missing-photo fallback semantics

## Key Architectural Risks

- leaving the real picker duplicated inside `HbcKudosComposer`
- placing the shared picker anywhere under `apps/hb-webparts`
- exposing the wrong import surface for homepage consumers
- preserving only the current thin `PersonEntry` contract and therefore blocking first/last/photo behavior
- assuming photo is inline on the user object
- breaking Kudos draft persistence by replacing the local schema without a bridge plan
