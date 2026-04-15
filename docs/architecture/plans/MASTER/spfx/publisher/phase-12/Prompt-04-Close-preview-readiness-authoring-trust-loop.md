# Prompt 04 — Close the preview / readiness / authoring trust loop

## Objective

Strengthen the relationship between authoring, preview, validation, diagnostics, and publish actions so authors can understand what will happen next with less scanning, less guesswork, and higher confidence.

## Why this issue matters

The live repo already has distinct preview and readiness seams, which is good. The remaining problem is compositional: authors still have to mentally stitch together blockers, warnings, publish consequences, and the rendered outcome. That slows decision-making and makes the experience feel more operational than editorial.

## Current repo-truth problem state

The current implementation already includes:

- a visual preview surface
- a homepage-card preview
- readiness summary language
- blocking issues
- warnings
- publish action gating
- a diagnostic disclosure explaining publish behavior and drift

The gap is that these seams are still only partially composed into a fast, confidence-building author workflow.

## Intended future state

Authors should be able to tell, quickly:

- what is blocking them
- what they should fix next
- what will happen on publish
- whether the existing page will be created, updated, or regenerated
- how the rendered article will look once those issues are resolved

The preview should remain editorial.
The readiness rail should remain operationally truthful.
Together, they should form one trust loop.

## Governing authority / required reference docs

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`

## Exact repo files and seams to inspect

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/usePreviewController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/ArticlePreview.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/readinessSurface/PublishReadinessDiagnostics.tsx`
- any affected CSS modules in `previewSurface/` and `readinessSurface/`

## Required implementation outcome

- Preserve the controller ownership boundaries for preview and readiness derivation.
- Improve the visual and informational mapping between authoring state, preview state, and readiness state.
- Improve “fix next” clarity for blocking and warning states.
- Make publish consequences easier to parse without burying the author in technical prose.
- Keep diagnostics available for operators who need them, but do not let technical detail dominate the editorial reading flow.
- Where useful, add bounded cross-links, anchoring, or stronger state cues that help authors move from issue to resolution faster.
- Do not rewrite backend preview composition or publish orchestration unless a tightly bounded UI seam truly requires it.

## Validation / proof-of-closure requirements

Demonstrate all of the following:

- a healthy draft with no blockers
- a draft with blockers
- a draft with warnings
- a bound page that will update in place
- a bound page that will regenerate, if that state is reproducible in the local seam

Also prove:

- publish intent is clearer than before
- the next corrective action is easier to identify
- the preview remains editorial and readable
- diagnostics are still accessible when needed
- controller seams remained clean and understandable

## Deliverables / closure notes to create

Create:

- `docs/architecture/reviews/publisher/wave-01-trust-loop-closure.md`

Include:

- what author-confidence problem was solved
- what mapping changes were introduced
- what states were exercised
- any bounded residual edge cases


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

