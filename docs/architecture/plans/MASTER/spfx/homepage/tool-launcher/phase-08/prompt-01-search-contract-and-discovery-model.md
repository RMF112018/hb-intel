# Prompt 01 — Search Contract and Discovery Model

## Objective

Define and implement the **search contract and discovery model** for Tool Launcher / Work Hub so launcher discovery is grounded in the live normalized launcher data model rather than ad hoc UI filtering.

## Context you must respect

- This work belongs to the homepage lane under `apps/hb-webparts`.
- The launcher should already be wired to the live `Tool Launcher Contents` list through the Phase 01 normalization seam.
- The launcher composition, flagship stage, utility rail, workflow shelves, overlay/index layer, and responsive hardening should already exist from prior phases.
- Search must strengthen discovery without replacing the launcher hierarchy with a generic results view.

## Repo-truth targets

Audit and update the current launcher implementation paths under:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- related launcher helpers / models under `apps/hb-webparts/src/homepage/`
- any launcher-specific overlay, command-band, or search-support files created in prior phases

Preserve `@hbc/ui-kit/homepage` import discipline.

## Required work

1. Audit the current normalized launcher record shape and confirm which fields are usable for search matching.
2. Define a search contract that can match against at minimum:
   - platform name
   - aliases / keywords
   - short descriptor
   - workflow shelf
   - category
   - help / support terms where appropriate
3. Decide where search indexing / normalization logic should live in the launcher codebase.
4. Implement a stable search-preparation step so UI components consume already-prepared searchable records rather than assembling search fields inline.
5. Ensure matching logic is deterministic, readable, and safe for partial-data conditions.
6. Keep search local to the launcher domain unless a shared extraction is clearly justified.

## Explicit exclusions

- Do not build a new global site search system.
- Do not create speculative analytics or ranking infrastructure.
- Do not replace the launcher with a search-first single-screen experience.
- Do not invent persistence or remote search services.

## Validation requirements

- prove search matching works against the intended launcher fields
- prove records with missing optional fields do not break matching preparation
- prove search preparation does not regress existing flagship / shelf / overlay rendering
- document the search contract and field coverage clearly

## Deliverables

- updated launcher-domain search contract
- search normalization / preparation implementation
- any required launcher helper or model updates
- concise inline documentation and package-level doc updates

## Working rules

- repo truth first
- do not re-read files still in current context unless needed
- do not broaden scope
- preserve launcher hierarchy and host-aware behavior
- prefer maintainable, explicit matching behavior over clever ranking logic
