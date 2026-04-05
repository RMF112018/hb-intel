# Prompt 06 — Discovery and Launcher Productization

## Objective

Rebuild Tool Launcher / Work Hub and Smart Search / Wayfinding so they feel like premium discovery products, not grouped lists and a generic search box inside cards.

## Primary Scope

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- `apps/hb-webparts/src/webparts/smartSearchWayfinding/`
- discovery and launcher shared primitives
- iconography and search treatment in `@hbc/ui-kit`

## Hard Instructions

- Do not reread files already in current context or memory.
- The current launcher and discovery surfaces are not acceptable.
- The current icon strategy is not acceptable.
- Do not settle for “cleaner grouping.”
- These surfaces must feel productized.

## Required Work

1. Replace placeholder-grade or initials-based icon behavior with real iconography.
2. Redesign the launcher so it feels like a premium destination system, potentially using:
   - featured launch tiles
   - pinned / frequent / recent affordances
   - stronger group identity
   - better visual icons and hover states
3. Redesign Smart Search / Wayfinding so it feels like a true discovery surface, with:
   - premium search entry treatment
   - stronger quick-path presentation
   - better promoted destinations
   - stronger zero-query and no-results states
   - more authored category grouping
4. Rebuild weak shared discovery and launcher primitives where needed.
5. Ensure these surfaces have clear visual distinction from editorial and operational surfaces.

## Required Validation

- Show that launcher and discovery now feel like products, not content cards.
- Validate empty, loading, populated, and no-results states.
- Provide before/after proof.

## Deliverables

- redesigned launcher and discovery implementations
- shared primitive and iconography changes
- closure note focused on productization of discovery behavior
