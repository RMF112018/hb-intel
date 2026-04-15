# Prompt 01 — Structural redesign of the editorial shell and information architecture

## Objective

Replace the current “three adjacent working panels” posture with a deliberately authored editorial workspace whose shell, sectional hierarchy, and cross-region relationships are structurally redesigned around authoring first, preview second, and governed publishing third.

## Why this issue exists / current-state problem

The live repo already has a queue rail, a sectioned center canvas, a right readiness rail, and a section index. The remaining defect is structural: the workspace still reads as a competent operator console assembled from adjacent surfaces rather than as one premium editorial product. Leaving the same composition intact and merely softening it would not close the problem.

## Intended future state

The rendered surface should feel like one product with one dominant story: draft content confidently, understand what will publish, and ship. The center plane must clearly own the user’s attention. The supporting rails must feel intentionally subordinate, not visually equivalent siblings. Medium and narrow layouts must remain authored and premium rather than just stacked panels.

## Governing authority / required references

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-12/Prompt-01-Refine-editorial-workspace-shell-and-cross-region-cohesion.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-12/Plan-Summary.md`

Also use the following research-backed implementation guidance where relevant:

- WAI-ARIA Authoring Practices — Combobox Pattern / Editable Combobox with List Autocomplete
- GOV.UK Design System — Error Summary / Validation Pattern
- Tiptap Accessibility Guide
- progressive-disclosure / chunking guidance from mature UX references

## Exact repo files and seams to inspect

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/workspace/QueueRail.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/DraftQueue.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/`
- `apps/hb-publisher/src/webparts/articlePublisher/readinessSurface/`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/`

## Implementation requirements

- Preserve truthful workflow, save/publish gating, queue grouping, and section anchoring where they still serve the new architecture.
- Recompose region scale, section rhythm, visual dominance, and region adjacency until the shell no longer reads as equal-weight admin panels.
- Reconsider whether the current section index, section wrappers, region headers, and right-rail block structure are the correct shell primitives. Replace them if not.
- Reduce always-visible prose and secondary chrome at shell level.
- Keep SharePoint host respect; do not introduce fake global shell chrome.
- Treat this as a structural redesign, not a restyle.

## Dependencies / supporting concepts

- `sharedChrome/` is the visual foundation and may need bounded redesign or expansion.
- Section anchors and readiness backlinks must remain coherent.
- The current controller split between workspace, preview, and readiness should be preserved unless a tightly bounded seam forces a change.

## Validation / proof-of-closure requirements

- Demonstrate empty state, selected-draft state, blocker state, warning state, and publish-ready state.
- Prove the shell now reads as one authored workspace rather than three coordinated cards.
- Exercise medium-width and narrow-width states intentionally.
- Confirm no regression to queue selection, authoring, or action execution.

## Deliverables / closure docs

Create:

- `docs/architecture/reviews/publisher/wave-01-shell-ia-structural-redesign-closure.md`

Include:

- what structural shell changes were made
- what region hierarchy was replaced or recomposed
- what remained intentionally preserved
- what breakpoint states were exercised
- why the result is materially more editorial and less operator-like

## Do-not-do instructions

- Do **not** close this prompt with modest UI edits, spacing cleanup, or copy-only refinement.
- Do **not** leave the same weak information architecture in place behind a few new disclosures.
- Do **not** re-read files already in active context unless you need to confirm drift, dependencies, or uncertainty after changes.
- Do **not** make unrelated code changes.
- Do **not** weaken or defer in-scope work into future prompts.
- Conduct an exhaustive scrub of the affected seam before making changes.
