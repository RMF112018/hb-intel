# ADR-0118: Tertiary Zone Reserved for Recent Activity

**Status:** Accepted
**Date:** 2026-03-22
**Deciders:** Architecture review (TRZ-01 resolution)

## Context

P2-D2 §5.3 specifies that the tertiary zone should support "limited EditMode" — users should be able to configure which tiles appear, add from role-eligible utility tiles, reorder via drag-and-drop, and remove configurable tiles. The specification was written when the tertiary zone was expected to host multiple utility tiles.

In the implemented architecture, the tertiary zone is a single-purpose zone that displays only the Recent Activity card (`hub:recent-context`). It renders via a dedicated `HbcProjectCanvas` instance with `projectId="my-work-hub-tertiary"` and `editable={false}`.

Enabling edit mode in this zone would:

1. Allow users to remove the sole tile, leaving an empty utility zone with no way to restore it outside of edit mode
2. Expose the tile catalog, which could allow adding secondary-zone tiles into the tertiary zone, undermining P2-D2 Gate 3 zone isolation
3. Add UI complexity (edit button, jiggle animation, done button) for a zone where the user has no meaningful configuration choices

## Decision

**The tertiary zone is reserved for `hub:recent-context` only.** `editable={false}` is intentional and correct. P2-D2 §5.3's EditMode requirement is superseded for this zone.

If the tertiary zone is expanded to host multiple configurable tiles in a future phase, this ADR should be revisited and EditMode re-enabled at that time.

## Rationale

- The tertiary zone is a single-purpose display area — edit mode adds no user value
- Removing the sole tile would leave an empty zone with degraded UX
- Zone isolation (P2-D2 Gate 3) depends on separate canvas instances with distinct tile registrations; enabling the tile catalog could break this boundary
- The `:tertiary` role suffix in `ROLE_DEFAULT_TILES` ensures the tertiary zone receives only `hub:recent-context` — edit mode would bypass this governance

## Consequences

- `HubTertiaryZone.tsx` passes `editable={false}` to `HbcProjectCanvas` — this is the intended behavior
- No edit button, tile catalog, or drag-to-reorder is available in the tertiary zone
- Future expansion of the tertiary zone to multiple tiles should revisit this ADR

## Supersedes

P2-D2 §5.3 EditMode requirement for the tertiary zone only. Secondary zone EditMode is unaffected.
