# 03A — Shared Homepage Primitives Catalog

## Purpose

Lock the reusable primitive inventory created by Prompt-03 so downstream webpart prompts consume one governed foundation.

## Implemented Primitive Set

- `HomepageSectionShell` — section/band wrapper with semantic header and region labeling.
- `HomepageEditorialCard` — editorial content card wrapper for curated pulse/message items.
- `HomepageUtilityTile` — compact utility tile scaffold for action-oriented destinations.
- `HomepageSpotlightCard` — operational spotlight/intelligence card with status affordance.
- `HomepagePersonRecognitionCard` — people/culture recognition card shell.
- `HomepageRailShell` — reusable horizontal/rail shell container.
- `HomepageEmptyState` — homepage-safe empty-state wrapper.
- `HomepageLoadingState` — homepage-safe loading state wrapper.

All primitives are implemented in `apps/hb-webparts/src/homepage/shared/` and consume `@hbc/ui-kit/homepage` contract surfaces.

## Consumption Rules

- Feature webparts in Prompts 04–08 should compose these primitives before introducing any feature-local visual wrapper.
- Primitive extensions must remain reusable and domain-agnostic.
- New reusable visual primitives still belong in `@hbc/ui-kit`; app-local primitives remain thin composition wrappers.
