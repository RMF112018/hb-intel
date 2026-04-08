# Wave 01 — Data Architecture and Source Model

## Objective

Replace the current digest-style content model with a newsroom-ready source model that can support a premium editorial surface.

## Core rule

The UI benchmark from the People & Culture prompt should influence the **presentation quality**, not force a People & Culture-style content model.

The source model for `CompanyPulse` should support editorial/news behavior such as:

- featured story selection
- supporting story stack
- freshness and publish metadata
- image/thumbnail logic
- category or shelf treatment
- homepage visibility / curation logic
- archive continuity

## Required direction

Prefer a source model that supports:

- live SharePoint News / Site Pages integration where practical
- optional curated override logic for homepage emphasis
- realistic seed/demo fallback behavior for local preview and manifest demonstration

Do **not** let the data model remain so small that the UI is forced back into a generic featured-plus-list shell.

## Implementation tasks

1. Audit the current `CompanyPulse` contract and normalizer.
2. Define the target newsroom contract.
3. Add or refactor the data-source and normalization seam needed to support:
   - lead story
   - secondary stories
   - tertiary utility/newsroom support content
4. Ensure sparse valid-result sets still translate into intentional UI states.

## UI-aware data requirement

The People & Culture prompt correctly identified that sparse data can make a premium module collapse visually. Apply that lesson here.

The data-to-UI translation must explicitly support:

- 1 strong story with no supporting items
- 1 strong story with 1 supporting item
- 0 lead story but several valid supporting stories
- missing or partial media
- inconsistent metadata completeness

The UI must remain intentional under those states.

## Deliverables

Produce:

1. updated or replaced CompanyPulse content model
2. any required normalizer/source files
3. short notes explaining how the new source model supports the intended newsroom hierarchy

## Validation

Before advancing, prove that the source model can drive:

- a dominant lead story
- a subordinate support stack
- sparse-state fallbacks without blank-space failure
