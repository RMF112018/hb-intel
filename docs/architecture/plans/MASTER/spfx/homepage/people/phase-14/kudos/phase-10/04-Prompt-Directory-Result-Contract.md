# Prompt 04 — Directory Result Contract

You are now implementing the **typed directory result contract** for the shared people picker.

## Canonical Evidence

Use the previously generated directory response-shape artifact as the source of truth.

The contract must explicitly account for the recorded evidence that the direct Graph user lookup includes core identity fields such as:

- `displayName`
- `givenName`
- `surname`
- `mail`
- `userPrincipalName`
- `id`

Do **not** downgrade this contract back to the current thin `PersonEntry` shape.

## Primary Goal

Define and implement a result contract that supports the required UI and reuse goals:

- live directory search
- human-name-first search behavior
- result rows showing first name and last name
- stable identity handling
- secondary metadata where useful
- compatibility with current HB Kudos selection/write paths

## Required Changes

### 1. Introduce or evolve the shared person result type

Refactor the shared picker type layer so the canonical selected/result object can carry at minimum:

- stable id
- display name
- given name
- surname
- mail if present
- userPrincipalName if present
- canonical lookup key used by the picker and selection logic
- optional job title / department if useful

You may preserve backward compatibility with the current `PersonEntry` consumer shape by:

- evolving `PersonEntry`, or
- introducing a richer canonical type plus a compatibility layer

Choose the cleanest path that minimizes consumer breakage without freezing the picker in an underspecified state.

### 2. Human-name-first behavior

Implement ranking/filtering logic that prioritizes human name matching over email-only behavior.

Email/UPN may remain supported, but it must not drive the primary experience.

### 3. Shared adapter contract

Define a clear shared search adapter contract that returns the richer directory type expected by the shared picker.

The shared picker must not be forced to infer first/last identity from a flat display string when the canonical data can provide better structure.

### 4. HB Kudos bridge

If HB Kudos still persists only `individualEmails: string[]`, implement a thin bridge that converts between:

- richer selected person objects in the picker UI
- the draft/write shape expected by the current Kudos composer pipeline

Do not make the shared picker itself beholden to the current narrow Kudos storage format.

## Guardrails

- do not assume Graph `displayName` alone is enough for the target UI
- do not collapse first/last name back into a single opaque label everywhere
- do not key selection solely by display name
- do not use unstable UI-only indexes as identity

## Deliverable

Leave the repo with a shared typed directory-result contract that is rich enough for avatar + first/last rendering and reusable beyond HB Kudos.
