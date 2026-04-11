# Plan Summary — HB Kudos Shared People Picker Extraction

## Current-State Finding

Repo truth shows the current people-picker path is split across three places:

1. `HbKudos.tsx` is a thin orchestrator that wires the composer and passes `searchPeople` from `useSharePointPeopleSearch()`.
2. `useSharePointPeopleSearch.ts` dispatches tenant-wide SharePoint `ClientPeoplePickerSearchUser` requests and maps the response into the minimal `PersonEntry` shape.
3. `packages/ui-kit/src/HbcKudosComposer/index.tsx` contains a **local duplicated people-picker implementation** (`HbcKudosComposerPeopleBucket`) that owns query input, debounce, search dispatch invocation, result rendering, selection chips, and local display-name caching.

Separately, repo truth also shows that `packages/ui-kit/src/HbcPeoplePicker/` already exists as a shared governed primitive lane, but it is not currently the picker used by HB Kudos, and its current contract is too thin for the required end state.

## Target-State Architecture

The target architecture is:

- **shared picker ownership in `packages/ui-kit/src/HbcPeoplePicker/`**
- **homepage-safe export surface in `packages/ui-kit/src/homepage.ts`**
- **HB Kudos consuming the shared picker, not a local duplicated picker**
- **directory and photo parsing contracts driven by the prior response-shape evidence**
- **photo/avatar retrieval handled as a separate request path**
- **missing-photo behavior handled explicitly with initials/placeholder fallback**

The shared picker must be reusable outside HB Kudos.

## Shared Ownership Decision

Use the existing shared lane:

- primary implementation ownership: `packages/ui-kit/src/HbcPeoplePicker/`
- homepage/SPFx export lane: `packages/ui-kit/src/homepage.ts`
- HB Kudos local ownership limited to:
  - orchestration,
  - data adapter/token wiring that is genuinely environment-specific,
  - and any narrow bridge required to preserve the existing Kudos draft/submission shape

Do **not** leave the durable picker UI in `HbcKudosComposer`.

## Extraction Strategy

1. Audit current file-level ownership and duplication.
2. Expand the shared picker contract so it can represent the required directory and photo semantics.
3. Move real picker behavior to the shared picker lane instead of maintaining a local composer-only implementation.
4. Keep only a thin Kudos-specific wrapper if needed to bridge to `individualEmails: string[]` in the current draft shape.
5. Reinstate HB Kudos on top of the shared picker.
6. Add the smallest necessary export shims, stories, tests, and validation.

## Acceptance Criteria

The work is only complete when all of the following are true:

- HB Kudos no longer owns a duplicated people-picker implementation
- the shared picker renders result rows with avatar/photo, first name, and last name
- email/UPN is supported, but not the primary search posture
- the parsing contract uses the prior directory/photo response-shape evidence
- avatar retrieval is separate from user search payload parsing
- missing-photo fallback works cleanly
- the shared picker is consumable from the governed homepage lane
- the current Kudos submit path still works
