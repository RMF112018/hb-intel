# Prompt 02 — Harden the Shared People-Picker Contract Without Scope Creep

You are continuing from the completed photo-wiring fix.

## Objective
Tighten the shared people-picker contract only where repo truth shows weakness, so the photo fix remains durable and the shared picker is more reusable platform-wide.

## Mandatory operating rules
- Do not reread files already in your current context or memory unless they changed, your context is stale, or scope expanded.
- Keep this pass tightly scoped.
- Do not convert this into a broad People & Culture redesign.
- Do not replace working behavior unless you are removing clear drift or fragility.

## Read only as needed
- `packages/ui-kit/src/HbcPeoplePicker/types.ts`
- `packages/ui-kit/src/HbcPeoplePicker/useGraphPeopleSearch.ts`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `packages/ui-kit/src/homepage.ts`

## Problem statement
Repo truth shows the shared lane is close, but still has weak spots:

- The active HB Kudos search path is SharePoint-based and does not return photo data.
- The shared Graph search lane should remain the richer canonical contract for reusable directory search.
- The shared person contract already includes:
  - `id`
  - `givenName`
  - `surname`
  - `mail`
  - `photoUrl`
- The shared Graph search lane should fully honor that contract and remain name-first.

## Required tasks
1. Verify that `useGraphPeopleSearch.ts` fully maps the rich `PersonEntry` fields that the shared picker expects.
2. Tighten naming / comments / type usage where the contract is ambiguous.
3. Confirm the homepage export surface remains correct and sufficient.
4. Preserve `rankPeopleResults` human-name-first behavior.
5. Ensure nothing in this pass undermines the already-working photo fix.

## Explicitly do not
- move SharePoint search into ui-kit
- create a second Graph search hook
- add photo fetching to the search response
- create a local HB Kudos-only `PersonEntry` fork

## Preferred result
A slightly tighter shared contract with better durability, while leaving the production defect already fixed and keeping the architecture clean.
