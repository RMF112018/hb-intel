# Prompt 03 — Structural redesign of project selection and bound-project presentation

## Objective

Keep the authoritative HBCentral-backed project lookup model, but redesign the bound-project experience so it behaves like a high-trust editorial selection surface instead of an operational identity chip with internal residue.

## Why this issue exists / current-state problem

The repo already contains a real project picker and authoritative lookup. But the current selected state still foregrounds internal identity residue and a utilitarian chip layout. That is not a small copy issue; it is a structural product-language mismatch at one of the first critical authoring moments.

## Intended future state

Project binding should feel like selecting the editorial subject of the article. The search state, result state, selected state, unavailable state, and change-state affordance should all communicate confidence, relevance, and context. Internal IDs should never be first-order author presentation.

## Governing authority / required references

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-12/Prompt-06-Close-author-facing-label-governance-and-selector-accessibility.md`

Also use the following research-backed implementation guidance where relevant:

- WAI-ARIA Authoring Practices — Combobox Pattern / Editable Combobox with List Autocomplete
- GOV.UK Design System — Error Summary / Validation Pattern
- Tiptap Accessibility Guide
- progressive-disclosure / chunking guidance from mature UX references

## Exact repo files and seams to inspect

- `apps/hb-publisher/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/MetadataPanel.tsx`
- `apps/hb-publisher/src/data/publisherAdapter/projectsLookupSource.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`

## Implementation requirements

- Preserve authoritative lookup; do not reintroduce manual project entry.
- Rebuild the selected-state presentation around project number, project name, and location/context in an editorial hierarchy.
- Demote or hide raw internal project identifiers behind diagnostics if they must remain available at all.
- Rebuild empty/loading/no-results/unavailable states so they feel product-grade, not fallback-grade.
- Revisit the combobox/search-result layout itself if the current presentation remains too operational.

## Dependencies / supporting concepts

- Keyboard semantics must remain credible.
- Existing lookup contracts and search behavior must remain intact.
- Any redesign must remain compatible with validation and readiness logic.

## Validation / proof-of-closure requirements

- Prove no raw internal project identity is first-order in the author-facing selected state.
- Prove project search, select, clear, and reselect still work.
- Exercise empty, loading, error, and no-results states.
- Confirm the surface now reads as subject selection, not system binding admin.

## Deliverables / closure docs

Create:

- `docs/architecture/reviews/publisher/wave-01-project-selection-structural-redesign-closure.md`

Include:

- what project-binding structures were redesigned
- what identity residue was removed or demoted
- what interaction states were exercised
- what semantics were preserved

## Do-not-do instructions

- Do **not** close this prompt with modest UI edits, spacing cleanup, or copy-only refinement.
- Do **not** leave the same weak information architecture in place behind a few new disclosures.
- Do **not** re-read files already in active context unless you need to confirm drift, dependencies, or uncertainty after changes.
- Do **not** make unrelated code changes.
- Do **not** weaken or defer in-scope work into future prompts.
- Conduct an exhaustive scrub of the affected seam before making changes.
