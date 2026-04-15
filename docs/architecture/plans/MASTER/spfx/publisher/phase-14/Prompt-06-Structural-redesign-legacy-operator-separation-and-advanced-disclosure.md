# Prompt 06 — Structural redesign of legacy/operator separation and advanced disclosure posture

## Objective

Re-architect how legacy states, operator-only narrative, and low-frequency technical detail are exposed so standard authors are not forced to process maintenance-grade information in the normal path.

## Why this issue exists / current-state problem

The repo currently keeps legacy truth, which is good, but too much of that truth still leaks into the standard authoring path at ordinary reading depth. Simply dimming or rewording these notices is not enough; the exposure architecture itself needs redesign.

## Intended future state

Legacy and operator-only information should remain accessible, truthful, and safe, but visibly quarantined from standard authoring. The default path should assume a normal author performing normal work. Exceptional states should look exceptional, not peer-level.

## Governing authority / required references

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-12/Scope-Boundary-Notes.md`

Also use the following research-backed implementation guidance where relevant:

- WAI-ARIA Authoring Practices — Combobox Pattern / Editable Combobox with List Autocomplete
- GOV.UK Design System — Error Summary / Validation Pattern
- Tiptap Accessibility Guide
- progressive-disclosure / chunking guidance from mature UX references

## Exact repo files and seams to inspect

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/workspace/useDraftWorkspace.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/draftHelpers.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.ts`

## Implementation requirements

- Preserve truthful handling of `scheduled`, milestone legacy content, unsupported states, and other maintenance-grade narration.
- Redesign where and how this information appears so it is clearly secondary or exceptional.
- Replace blunt always-visible narrative with a stronger advanced/legacy/operator disclosure architecture where appropriate.
- Do not silently suppress important truth.
- Do not let legacy safety dominate the normal author experience.

## Dependencies / supporting concepts

- Queue visibility for legacy rows must remain safe.
- Lifecycle and transition safety must remain intact.
- Any disclosure design must still support support/admin investigation when needed.

## Validation / proof-of-closure requirements

- Prove standard authors encounter materially less legacy/operator noise in normal flows.
- Prove legacy rows and unsupported states remain safely accessible and truthful.
- Confirm no destructive risk is introduced by demoting the wrong information.

## Deliverables / closure docs

Create:

- `docs/architecture/reviews/publisher/wave-01-legacy-operator-disclosure-structural-redesign-closure.md`

Include:

- what legacy/operator exposures were re-architected
- what remained directly visible and why
- what moved behind advanced disclosure
- how safety and truth were preserved

## Do-not-do instructions

- Do **not** close this prompt with modest UI edits, spacing cleanup, or copy-only refinement.
- Do **not** leave the same weak information architecture in place behind a few new disclosures.
- Do **not** re-read files already in active context unless you need to confirm drift, dependencies, or uncertainty after changes.
- Do **not** make unrelated code changes.
- Do **not** weaken or defer in-scope work into future prompts.
- Conduct an exhaustive scrub of the affected seam before making changes.
