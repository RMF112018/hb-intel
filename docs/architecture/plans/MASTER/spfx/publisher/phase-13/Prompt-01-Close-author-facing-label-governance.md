# Prompt 01 — Close author-facing label governance

## Objective

Finish the remaining author-facing label-governance work so the Article Publisher no longer leaks raw enum-like, token-like, or storage-oriented language anywhere authors interact with the product.

## Why this issue matters

The live repo already contains a strong label-governance foundation in `authorLabels.ts` and corresponding tests. That is good progress, but partial adoption is not closure.

When a publishing product leaks raw implementation language to authors, it weakens trust, makes the app feel unfinished, and creates unnecessary cognitive translation work. In an editorial workspace, authors should see clear product language, not adapter language.

## Current repo-truth problem state

The repo already centralizes friendly labels for:

- article content type
- destination
- spotlight type
- project stage
- article subject
- hero theme variant
- media role
- team viewer modes / grouping / sort
- workflow outcome labels
- draft group headings / empty copy / transition actions

That foundation lives in `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.ts`, with coverage in `authorLabels.test.ts`.

However, Wave 02 closure still requires an exhaustive scrub of the **live current author-facing surfaces** because:

- label governance is only as strong as its actual adoption points
- the attached package did not force a precise seam-by-seam audit of remaining leak points
- current product polish depends on zero raw-value leakage in real author use, not just helper existence

## Intended future state

Every author-facing place where the publisher renders an enum-backed, workflow-backed, or selector-backed value should show governed product language.

The adapter layer may continue to use canonical stored values. The UI must not expose those values directly unless the value is already intentionally author-readable.

## Governing authority / required reference docs

- `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.test.ts`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- this package’s `Validation-Strategy.md`

## Exact repo files and seams to inspect

At minimum inspect:

- `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/authorLabels.test.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/MetadataPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/HeroPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/TeamPresentationPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/DraftQueue.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/`
- `apps/hb-publisher/src/webparts/articlePublisher/readinessSurface/`
- any chip, badge, chooser, readout, notice, summary, button label, or helper copy that renders enum-backed values

## Required implementation outcome

- Exhaustively scrub the affected author-facing seams for raw enum/token/storage language.
- Route every qualifying display value through the existing governed label helpers where appropriate.
- Expand `authorLabels.ts` only where the live repo proves real missing coverage.
- Do **not** collapse distinct user-facing phrases into one generic helper if the product meaning is different. For example, workflow outcome labels, draft-group headings, empty-copy text, and transition-action labels are intentionally different surfaces.
- Preserve canonical stored values and adapter contracts. Change display language, not persistence semantics.
- Preserve already-correct label governance where it exists; do not rewrite working helpers gratuitously.

## Validation / proof-of-closure requirements

Prove all of the following:

- every audited author-facing enum-like display path either uses governed label helpers or is intentionally author-readable as-is
- no raw implementation token remains in the audited Wave 02 surfaces
- `authorLabels.test.ts` still passes
- label-governance tests are extended if new helper coverage is added
- no display regression was introduced into queue, metadata, hero, team, media, preview, or readiness surfaces

Also perform a manual scrub specifically for:

- notices and helper copy
- chip and badge text
- transition/action labels
- selected-value summaries
- empty states

## Deliverables / closure notes to create

Create:

- `docs/architecture/reviews/publisher/wave-02-label-governance-closure.md`

Document:

- what remaining leaks were found
- which seams already complied and were preserved
- any new helper functions added
- what tests were updated

## Required working method

Before you edit anything:

1. Scrub the full affected seam.
2. Verify file/symbol drift.
3. Do **not** re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
4. Identify exactly what must be preserved.
5. Identify exactly what still leaks.
6. Prove closure before moving to the next prompt.

## Explicit instruction not to make unrelated changes

Do not turn this prompt into a broad copywriting pass. Keep the work tightly bounded to author-facing label governance in the identified seams unless an adjacent change is strictly required for closure.
