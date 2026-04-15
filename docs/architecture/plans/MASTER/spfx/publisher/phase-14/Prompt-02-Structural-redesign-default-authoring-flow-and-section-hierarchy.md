# Prompt 02 — Structural redesign of the default authoring flow and section hierarchy

## Objective

Rebuild the center authoring path so first-pass drafting is driven by a radically shorter, better-ordered editorial sequence, with advanced and presentation-oriented decisions clearly secondary.

## Why this issue exists / current-state problem

The current repo no longer suffers from raw-textarea-only authoring, but it still exposes too much decision surface too early. Identity, hero, story, media, team, promotion, destination, and preview are all structurally present, yet the first-pass experience still asks authors to process more UI than they should. This is an information-architecture failure, not a small field-priority bug.

## Intended future state

A first-time author should be able to move through a compact editorial sequence with obvious priorities: choose the bound project, write the headline and framing, compose the story, add people/media as needed, and verify the result. Advanced presentation overrides must exist, but they must feel like opt-in depth, not peer-level obligations.

## Governing authority / required references

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-12/Prompt-01-Refine-editorial-workspace-shell-and-cross-region-cohesion.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-12/Scope-Boundary-Notes.md`

Also use the following research-backed implementation guidance where relevant:

- WAI-ARIA Authoring Practices — Combobox Pattern / Editable Combobox with List Autocomplete
- GOV.UK Design System — Error Summary / Validation Pattern
- Tiptap Accessibility Guide
- progressive-disclosure / chunking guidance from mature UX references

## Exact repo files and seams to inspect

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/MetadataPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/HeroPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/StoryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/TeamPresentationPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/DisclosureSection.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`

## Implementation requirements

- Replace the current section/field hierarchy wherever it still behaves like a broad configuration canvas.
- Design a primary authoring path with a materially smaller visible decision set.
- Reclassify advanced hero/team/presentation controls into clearly secondary or tertiary disclosure structures.
- Do not bury required fields.
- Use progressive disclosure intentionally, not decoratively.
- Preserve intelligent defaults and override capability.

## Dependencies / supporting concepts

- Project binding and story authoring must remain first-class.
- Team heading defaults and template-bound behavior must still work.
- The redesign must stay compatible with readiness backlinks and validation messaging.

## Validation / proof-of-closure requirements

- Prove a first-pass draft can be created with materially fewer visible decisions than before.
- Show that advanced controls still exist but are clearly non-default.
- Confirm no required field became hidden in a way that harms readiness truth.
- Confirm the resulting section hierarchy reads as editorial, not configurational.

## Deliverables / closure docs

Create:

- `docs/architecture/reviews/publisher/wave-01-authoring-flow-structural-redesign-closure.md`

Include:

- what section hierarchy was replaced
- what first-pass fields remain visible
- what advanced controls moved and why
- what defaults were preserved
- why the new path is materially shorter and clearer

## Do-not-do instructions

- Do **not** close this prompt with modest UI edits, spacing cleanup, or copy-only refinement.
- Do **not** leave the same weak information architecture in place behind a few new disclosures.
- Do **not** re-read files already in active context unless you need to confirm drift, dependencies, or uncertainty after changes.
- Do **not** make unrelated code changes.
- Do **not** weaken or defer in-scope work into future prompts.
- Conduct an exhaustive scrub of the affected seam before making changes.
