# Prompt 05 — Photo and Avatar Contract

You are now implementing the shared picker’s avatar/photo behavior.

## Canonical Evidence

Use the previously generated photo response-shape artifact as the source of truth.

The implementation must explicitly reflect the recorded evidence that:

- photo is **not** inline on the user record
- photo metadata comes from `/photo`
- image bytes come from `/photo/$value`
- missing-photo behavior can return `404` with `ImageNotFound`

Any design that assumes avatar data is inline on the user object is wrong.

## Primary Goal

Implement a reusable avatar/photo retrieval contract for the shared people picker that:

- fetches photo through the correct separate path
- renders photo when available
- handles missing-photo behavior cleanly
- falls back to initials/placeholder without broken-image UX
- is reusable outside HB Kudos

## Required Changes

### 1. Separate photo handling from directory search payload parsing

Do not treat the user search response as the avatar source.

Create the correct seam for:

- photo metadata lookup
- photo binary/URL retrieval
- fallback classification when photo is unavailable

### 2. Shared avatar state model

Add a typed avatar/photo state to the shared picker lane, such as:

- not requested
- loading
- available
- missing-photo
- failed

Use the repo’s naming conventions and strongest local pattern, but the state model must distinguish a normal missing-photo case from a generic failure.

### 3. Missing-photo fallback

When the photo endpoint yields the equivalent of `404 ImageNotFound`, do **not** treat that as a hard UI failure.

Render initials or a governed placeholder instead.

### 4. Caching/perf

Implement the smallest sensible caching/memoization behavior so repeated picker opens or keyboard navigation do not unnecessarily refetch the same avatar over and over.

### 5. Shared rendering

The shared picker result rows and selected-chip rendering must be able to show:

- avatar/photo when available
- initials/placeholder when unavailable

The avatar treatment must live in the shared picker lane, not only in HB Kudos local code.

## Guardrails

- do not inline base64 photo data into directory search result objects unless there is a deliberate, typed, and bounded reason
- do not allow missing-photo users to render as broken image icons
- do not silently swallow all photo failures without differentiating expected missing-photo behavior
- do not hardcode a local-only avatar rendering path in the Kudos composer

## Deliverable

Leave the repo with a reusable shared avatar/photo contract and UI behavior that correctly reflects the separate Graph photo endpoint model.
