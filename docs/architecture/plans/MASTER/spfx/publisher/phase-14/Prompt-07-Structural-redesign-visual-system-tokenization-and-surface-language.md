# Prompt 07 — Structural redesign of the visual system, tokenization, and surface language

## Objective

Finish the Publisher’s visual-system closure by structurally redesigning weak surface families, completing token adoption, and deleting the timid enterprise-card language that still keeps the product visually under-authored.

## Why this issue exists / current-state problem

The live repo already has a Publisher token seam and shared chrome. The problem is no longer “no system exists.” The problem is that the current system is partial, unevenly adopted, and visually too polite. Hardcoded values, stale CSS residue, and thin-border admin-surface language still make the product feel safer than it should.

## Intended future state

The Publisher should read as one deliberate visual system with confident hierarchy, coherent spacing rhythm, strong surface families, clear control language, and minimal hardcoded policy leakage. Feature-local CSS should express composition, not repeat visual rules.

## Governing authority / required references

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-12/Prompt-02-Finish-publisher-tokenization-and-delete-stale-visual-css-debt.md`

Also use the following research-backed implementation guidance where relevant:

- WAI-ARIA Authoring Practices — Combobox Pattern / Editable Combobox with List Autocomplete
- GOV.UK Design System — Error Summary / Validation Pattern
- Tiptap Accessibility Guide
- progressive-disclosure / chunking guidance from mature UX references

## Exact repo files and seams to inspect

- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/tokens.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/readinessSurface/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/*.module.css`

## Implementation requirements

- Preserve the token seam, but expand or refactor it as needed to support a stronger product language.
- Remove stale classes and repeated hardcoded-value clusters.
- Replace timid surface language with stronger, more intentional surface families.
- Normalize notices, chips, controls, panels, action clusters, and editorial blocks into a coherent vocabulary.
- Do not turn this into a repo-wide design-system exercise.
- This is structural redesign of the Publisher visual system, not a color pass.

## Dependencies / supporting concepts

- `sharedChrome/` must remain the primary reusable seam unless repo truth requires a bounded replacement.
- Surface redesign must remain light-theme safe for SharePoint hosting.
- Any class deletions must be reconciled with TSX callsites and tests.

## Validation / proof-of-closure requirements

- Inventory and reduce hardcoded visual-policy repetition.
- Prove shell, panel, notice, chip, input, and action surfaces now read as one stronger family.
- Confirm dead visual residue was removed or explicitly justified.
- Confirm the result still renders safely in the SharePoint-hosted light theme.

## Deliverables / closure docs

Create:

- `docs/architecture/reviews/publisher/wave-01-visual-system-tokenization-structural-redesign-closure.md`

Include:

- what surface families were structurally redesigned
- what token adoption gaps were closed
- what stale CSS residue was removed
- what local exceptions remain and why

## Do-not-do instructions

- Do **not** close this prompt with modest UI edits, spacing cleanup, or copy-only refinement.
- Do **not** leave the same weak information architecture in place behind a few new disclosures.
- Do **not** re-read files already in active context unless you need to confirm drift, dependencies, or uncertainty after changes.
- Do **not** make unrelated code changes.
- Do **not** weaken or defer in-scope work into future prompts.
- Conduct an exhaustive scrub of the affected seam before making changes.
