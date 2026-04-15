# Prompt 03 — Deepen project binding and lookup truthfulness

## Objective

Strengthen the project-identity flow so the picker remains authoritative, more truthful, and more resilient without backsliding into manual identity entry.

## Why this issue matters

The live repo already made the correct strategic move: it retired manual `ProjectId` / `ProjectName` entry in favor of an authoritative picker backed by the HBCentral `Projects` list.

However, the remaining closure gaps are now more specific than the attached package described. The issue is no longer “should there be a picker?” The issue is whether the current picker and lookup path fully communicate project identity clearly, fail safely, and behave like a trusted control-plane lookup.

## Current repo-truth problem state

The narrowed audit found that the live repo already has:

- `ProjectPicker.tsx`
- `MetadataPanel.tsx` integration
- `projectsLookupSource.ts` bound to the HBCentral `Projects` list
- canonical host-site authority in `publisherListDescriptors.ts`
- a backend field-contract reference in `backend/functions/src/services/projects-list-contract.ts`

But the remaining closure gaps include:

- selected-project presentation does not fully capitalize on the available project identity data
- the current metadata-panel-selected value object omits `projectNumber`
- the lookup adapter still depends on a title-bound list assumption that needs explicit hardening/validation posture
- search result clarity, empty/error handling, and trust copy can still be improved
- targeted tests for the project lookup path are weak or absent compared with the importance of the seam
- the attached Wave 02 prompt did not explicitly anchor the picker to the backend field-contract authority

## Intended future state

The publisher should keep the project picker as the sole authoritative identity entry path, while making project identity feel clearer, safer, and more trustworthy to authors.

Authors should immediately understand what project they selected, why that identity is authoritative, and what happens when lookup is unavailable.

## Governing authority / required reference docs

- `apps/hb-publisher/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/MetadataPanel.tsx`
- `apps/hb-publisher/src/data/publisherAdapter/projectsLookupSource.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherListDescriptors.ts`
- `backend/functions/src/services/projects-list-contract.ts`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- this package’s `Validation-Strategy.md`

## Exact repo files and seams to inspect

At minimum inspect:

- `apps/hb-publisher/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/MetadataPanel.tsx`
- `apps/hb-publisher/src/data/publisherAdapter/projectsLookupSource.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherListDescriptors.ts`
- `backend/functions/src/services/projects-list-contract.ts`
- any related tests or missing-test seams
- any CSS/classes that influence picker state and selected-value rendering

## Required implementation outcome

- Preserve the picker as the authoritative model.
- Do **not** reintroduce manual project identity text entry.
- Improve result clarity and selected-project presentation using the real available identity fields.
- Fix any live gap where the selected-value model is not carrying through useful project identity already returned by the lookup.
- Make lookup-unavailable and no-match states more trustworthy and more helpful without sounding like raw technical failure.
- Harden the seam around the title-bound `Projects` list assumption as far as is appropriate inside this app layer.
- Add targeted tests for the lookup and picker behaviors that are currently under-proven.

## Validation / proof-of-closure requirements

Prove all of the following:

- project selection still populates the correct article fields
- selected-project presentation is clearer after selection
- lookup unavailable, empty results, and failure states remain host-safe and understandable
- the picker remains authoritative and manual-entry regression did not return
- targeted tests now cover the key project-binding behavior and lookup mapping assumptions
- no regression was introduced into team-heading defaulting that depends on project selection

## Deliverables / closure notes to create

Create:

- `docs/architecture/reviews/publisher/wave-02-project-binding-and-lookup-closure.md`

Document:

- what project identity fields are now surfaced to authors
- what title-bound-list risks remain and how they are handled
- what tests were added or updated
- what was deliberately preserved to avoid reintroducing manual-entry ambiguity

## Required working method

Before you edit anything:

1. Scrub the full picker + metadata + lookup + contract seam.
2. Verify drift in the picker value shape, lookup return shape, and field-contract mapping comments.
3. Do **not** re-read files still in active context unless needed to confirm drift or uncertainty after changes.
4. Preserve the authoritative-picker model.
5. Prove closure before moving on.

## Explicit instruction not to make unrelated changes

Do not expand this into destination binding, publishing, or unrelated metadata redesign. Keep the work tightly bounded to project identity lookup/binding truthfulness and its immediate UX.
