# Prompt 05 — Structural redesign of preview, readiness, and publish command surface

## Objective

Rebuild the relationship between preview, blockers, warnings, publish intent, and primary actions so authors can understand what happens next without scanning a verbose operational rail.

## Why this issue exists / current-state problem

The repo already has distinct preview and readiness seams plus diagnostics. The remaining defect is structural composition: blockers, warnings, action state, lifecycle state, and publish consequence still demand too much mental stitching. This is not solved by shaving a few sentences.

## Intended future state

Authors should be able to tell, quickly and confidently: what is wrong, what to fix next, what will happen on publish, and what the result will look like. The preview must remain editorial. The command surface must remain truthful. Together they must form a fast trust loop.

## Governing authority / required references

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-12/Prompt-04-Close-preview-readiness-authoring-trust-loop.md`

Also use the following research-backed implementation guidance where relevant:

- WAI-ARIA Authoring Practices — Combobox Pattern / Editable Combobox with List Autocomplete
- GOV.UK Design System — Error Summary / Validation Pattern
- Tiptap Accessibility Guide
- progressive-disclosure / chunking guidance from mature UX references

## Exact repo files and seams to inspect

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/usePreviewController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/readinessSurface/PublishReadinessDiagnostics.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/ArticlePreview.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/lifecycleMessaging.js`
- related CSS modules in `previewSurface/` and `readinessSurface/`

## Implementation requirements

- Preserve controller truth, validation truth, and publish gating.
- Structurally redesign the right-side decision surface so primary action, blocker mapping, warnings, and publish consequence are more immediately legible.
- Improve issue-to-section routing and “fix next” prioritization.
- Demote technical detail to clearly secondary disclosure without hiding it from operators who need it.
- Reassess the preview/readiness adjacency itself; if the current split remains too slow, structurally recompose the relationship.

## Dependencies / supporting concepts

- The GOV.UK error-summary pattern and linked-fix model should inform the redesign of blocker mapping.
- Publish diagnostics and drift explanation must remain available.
- Section anchors and validation findings must continue to resolve correctly.

## Validation / proof-of-closure requirements

- Demonstrate healthy, blocker, warning, in-place-update, and regenerate states.
- Prove the next corrective action is easier to identify than before.
- Prove publish consequence is clearer than before.
- Confirm diagnostics remain reachable and truthful.

## Deliverables / closure docs

Create:

- `docs/architecture/reviews/publisher/wave-01-preview-readiness-command-structural-redesign-closure.md`

Include:

- what command-surface structures were rebuilt
- what blocker/warning mapping changes were made
- what publish-intent states were exercised
- why the new trust loop is materially faster and clearer

## Do-not-do instructions

- Do **not** close this prompt with modest UI edits, spacing cleanup, or copy-only refinement.
- Do **not** leave the same weak information architecture in place behind a few new disclosures.
- Do **not** re-read files already in active context unless you need to confirm drift, dependencies, or uncertainty after changes.
- Do **not** make unrelated code changes.
- Do **not** weaken or defer in-scope work into future prompts.
- Conduct an exhaustive scrub of the affected seam before making changes.
