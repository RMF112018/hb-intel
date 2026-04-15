# Prompt 06 — Close author-facing label governance and selector accessibility

## Objective

Finish the last Wave 01 author-trust gaps around friendly labeling and key selector/search interactions so audited author-facing surfaces no longer leak raw implementation language or rely on merely passable accessibility semantics.

## Why this issue matters

The repo already contains centralized label governance and meaningful selector improvements. That is good progress. But partial adoption is not closure. Raw implementation language and under-finished selector semantics directly undermine clarity, polish, and accessibility in an authoring product.

## Current repo-truth problem state

The live repo already includes:

- centralized author-facing label helpers
- tests for label governance
- a searchable project picker
- improved composer-driven selection flows

However, some author-facing surfaces still leak raw values or under-finished interaction semantics, and the baseline Wave 01 package failed to call this out directly.

## Intended future state

Wave 01-touched authoring surfaces should:

- render governed, friendly labels everywhere authors encounter enum-like values or system states
- avoid leaking raw storage or implementation tokens
- provide stronger selector/search accessibility semantics where authors search and choose controlled values
- feel polished and trustworthy rather than “almost finished”

## Governing authority / required reference docs

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.test.ts`

## Exact repo files and seams to inspect

- `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.test.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/GalleryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/MetadataPanel.tsx`
- any additional Wave 01-touched author-facing surfaces where raw values may still leak
- any affected CSS/modules needed to support selector state and focus behavior

## Required implementation outcome

- Exhaustively scrub the Wave 01-touched author-facing surfaces for raw enum-like, token-like, or storage-like value leaks.
- Route those surfaces through existing governed label helpers where appropriate.
- Expand label helpers and tests only where the live repo truth proves more coverage is needed.
- Harden selector/search semantics in the project picker and any related Wave 01-touched search/selection seam so the interaction is not merely visually functional but accessibility-credible.
- Preserve current lookup functionality and selected-value behavior.
- Do not broaden this prompt into a giant future accessibility wave.

## Validation / proof-of-closure requirements

Prove all of the following:

- no raw enum-like values remain in the audited Wave 01 author-facing surfaces
- the affected selector/search UI remains keyboard-usable
- focus, active-option, and expanded/collapsed state behavior are coherent
- label-governance tests still pass and were extended if coverage grew
- no regression was introduced into project selection or related authoring flows

## Deliverables / closure notes to create

Create:

- `docs/architecture/reviews/publisher/wave-01-label-governance-and-selector-a11y-closure.md`

Include:

- what label leaks were found
- what selector/search semantics were strengthened
- what tests were added or updated
- what keyboard/accessibility checks were performed


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

