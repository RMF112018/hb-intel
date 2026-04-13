# 07 — Implementation Prompt 03 — Wire Author Identity and Photo Seam

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
## Objective

Wire author name/photo behavior into article mode using the shared identity/photo mechanics proven by Kudos, without coupling article rendering to Kudos runtime code.

## Required outcome

- Article mode can display author name and author photo.
- Author photo resolves through a neutral shared seam.
- Fallback behavior is clean when no photo exists.

## Repo-truth starting points

Inspect the current live implementations and reusable seams in:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/useRecipientPhotoHydration.ts`
- `packages/ui-kit/src/HbcPeoplePicker/usePersonPhotoCache.ts`
- `packages/ui-kit/src/HbcPeoplePicker/types.ts`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`

## Required implementation direction

1. Reuse shared mechanics, not Kudos domain code.
2. Create a neutral author identity/photo helper.
3. Recommended behavior:
   - if explicit `photoUrl` is provided, use it
   - else if `author.upn` exists, resolve Graph photo
   - else render initials / no-photo fallback
4. Cache photo lookups appropriately.
5. Keep article author rendering independent of recognition/feed/composer logic.

## Hard constraints

- Do not import article rendering from Kudos components.
- Do not hard-wire hero logic to Kudos entry models.
- Do not turn the article hero into a people-picker workflow unless that is already required by the current scope.

## Required scrub

Clean up:
- accidental Kudos coupling
- duplicate photo utilities
- mismatched author identity shapes
- stale author comments or naming

## Validation

Prove all of the following before closing:

- author display name renders correctly
- Graph photo lookup works when UPN is present
- missing photos degrade cleanly
- no direct runtime coupling to Kudos remains
- the code remains host-safe and doctrine-aligned

## Deliverable note

When finished, leave a closure note covering:
- exact shared seams reused
- where the new neutral helper lives
- fallback order
- any remaining runtime/config work needed for article inputs
