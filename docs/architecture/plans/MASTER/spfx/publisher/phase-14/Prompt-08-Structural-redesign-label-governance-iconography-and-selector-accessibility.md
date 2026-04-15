# Prompt 08 — Structural redesign of label governance, iconography, and selector accessibility

## Objective

Complete Wave 01 by redesigning the remaining author-facing interaction language so selectors, labels, iconography, avatars, and keyboard behavior all operate at the same premium level as the rebuilt structure around them.

## Why this issue exists / current-state problem

The repo already contains label helpers, a real project picker, a TipTap toolbar, and better team/media managers. Yet raw implementation language, under-finished selector semantics, and low-ambition icon/microinteraction treatment still leak through some of the most visible author-facing seams. That makes the product feel unfinished even after larger redesign work lands.

## Intended future state

Authors should experience consistent, friendly labels; keyboard-credible selectors; real iconography; stronger focus/pressed states; and identity/avatar treatment that feels intentional and trustworthy. No raw enum-like values or pseudo-icon residue should remain in audited surfaces.

## Governing authority / required references

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-12/Prompt-03-Replace-pseudo-iconography-and-harden-toolbar-avatar-microinteractions.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-12/Prompt-06-Close-author-facing-label-governance-and-selector-accessibility.md`

Also use the following research-backed implementation guidance where relevant:

- WAI-ARIA Authoring Practices — Combobox Pattern / Editable Combobox with List Autocomplete
- GOV.UK Design System — Error Summary / Validation Pattern
- Tiptap Accessibility Guide
- progressive-disclosure / chunking guidance from mature UX references

## Exact repo files and seams to inspect

- `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.test.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/editorToolbar.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/TeamPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/GalleryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/ArticlePreview.tsx`
- any affected shared-chrome primitives or CSS modules

## Implementation requirements

- Exhaustively scrub for raw enum-like, token-like, or storage-like author-facing language leaks.
- Replace pseudo-icons and underpowered interaction affordances with a governed icon strategy where needed.
- Strengthen keyboard semantics, focus management, and active-option treatment for selectors and toolbars.
- Keep icon-only controls strongly named and stateful.
- Improve avatar/identity presentation where photos or stronger identity treatment already exist.
- Preserve lookup/editor/team/media logic unless a tightly bounded UI seam requires change.

## Dependencies / supporting concepts

- WAI combobox guidance should inform search/select behavior.
- Tiptap accessibility guidance should inform toolbar and editor affordances.
- Existing tests for label governance should be extended where coverage grows.

## Validation / proof-of-closure requirements

- Prove no raw enum-like values remain in the audited author-facing seams.
- Prove pseudo-icons are removed from audited surfaces.
- Exercise keyboard navigation for the project picker and toolbar.
- Confirm icon-only controls remain accessibly named and focus-safe.
- Confirm no regression to project selection, editor formatting, or team/gallery management.

## Deliverables / closure docs

Create:

- `docs/architecture/reviews/publisher/wave-01-label-iconography-selector-a11y-structural-redesign-closure.md`

Include:

- what author-facing language leaks were removed
- what icon strategy was used
- what selector/toolbar semantics were strengthened
- what keyboard/accessibility checks were performed

## Do-not-do instructions

- Do **not** close this prompt with modest UI edits, spacing cleanup, or copy-only refinement.
- Do **not** leave the same weak information architecture in place behind a few new disclosures.
- Do **not** re-read files already in active context unless you need to confirm drift, dependencies, or uncertainty after changes.
- Do **not** make unrelated code changes.
- Do **not** weaken or defer in-scope work into future prompts.
- Conduct an exhaustive scrub of the affected seam before making changes.
