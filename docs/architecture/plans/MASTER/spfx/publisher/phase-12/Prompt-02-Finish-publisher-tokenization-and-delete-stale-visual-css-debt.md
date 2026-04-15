# Prompt 02 — Finish Publisher tokenization and delete stale visual CSS debt

## Objective

Complete the Publisher’s visual-system closure by finishing adoption of the existing token seam, normalizing feature-level surfaces around it, and removing stale CSS debt left behind by earlier iterations.

## Why this issue matters

The repo already has a Publisher token seam and shared visual primitives, but feature-level CSS still duplicates colors, borders, spacing, and interaction treatments. That weakens doctrine alignment, makes the product harder to evolve, and keeps the UI visually inconsistent even when the structure is sound.

## Current repo-truth problem state

The current implementation already includes a local token layer under `sharedChrome/tokens.module.css` and shared Publisher primitives under `sharedChrome/`.

Even so, feature-level CSS modules still contain substantial hardcoded surface values and repeated interaction treatments. Some modules also retain stale class definitions from pre-primitive iterations that no longer reflect the live component callsites.

This means the problem is no longer “there is no system.” The problem is that the system is **partial, unevenly adopted, and not yet cleaned through**.

## Intended future state

The Publisher should have:

- one clear visual vocabulary for surfaces, borders, spacing, status ramps, and control states
- minimal repetition of hardcoded values
- feature-local CSS that expresses composition, not duplicated visual policy
- no stale or misleading CSS residue that obscures ownership or invites drift

## Governing authority / required reference docs

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/tokens.module.css`
- any relevant upstream token references already used by `@hbc/ui-kit`

## Exact repo files and seams to inspect

- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/tokens.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/readinessSurface/*.module.css`

## Required implementation outcome

- Audit all affected CSS modules against the existing token seam.
- Replace repeated hardcoded values with Publisher token aliases where those aliases already exist or should clearly exist.
- Add bounded new Publisher-local aliases only when they are truly needed for this product surface.
- Remove stale classes that no longer have live callsites after shared primitive migration.
- Keep local exceptions only where there is a clear product reason and document them.
- Normalize notice, chip, panel, control, and state styling so the product reads as one system.
- Do not turn this into a repo-wide design-system rewrite.

## Validation / proof-of-closure requirements

Prove all of the following:

- a concrete inventory of hardcoded-value reductions
- the remaining local exceptions are explicitly justified
- no misleading dead visual classes remain in the affected feature CSS without good reason
- shell, rail, panel, notice, chip, input, and action surfaces now read as one coherent visual family
- the result still renders correctly and safely in the SharePoint-hosted light-theme context
- any renamed or deleted classes were reconciled with live TSX callsites

## Deliverables / closure notes to create

Create:

- `docs/architecture/reviews/publisher/wave-01-tokenization-and-css-debt-closure.md`

Include:

- what token seam was preserved
- what hardcoded clusters were removed
- what stale CSS residue was deleted
- any deliberately retained local exceptions and why they remain


## Required working method

Before you edit anything:

1. Scrub the full affected seam.
2. Verify that referenced files, exports, symbols, and CSS classes have not drifted.
3. Do **not** re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
4. Identify exactly what must be preserved.
5. Identify exactly what must be removed, consolidated, or rewritten.
6. Prove closure before you move to the next prompt.

## Explicit instruction not to make unrelated changes

Do not make unrelated code changes. Keep the work tightly bounded to the seams identified in this prompt unless an adjacent change is strictly required for closure.

