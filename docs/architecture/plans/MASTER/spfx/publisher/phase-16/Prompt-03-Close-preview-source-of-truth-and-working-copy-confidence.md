# Prompt 03 — Close preview source-of-truth and working-copy confidence

## Objective

Make the preview surface impossible to misread by closing the gap between:
- what the author sees in the canvas while editing
- what the preview is actually composed from
- what the product implies will happen if the author publishes now

## Why this issue matters

Repo truth currently shows a meaningful hidden dependency:
- the preview controller rebuilds from `selectedArticleId`
- the preview builder resolves through repositories by article ID
- the preview therefore reflects the **saved / persisted** draft state, not necessarily the author’s current unsaved working copy
- the product also has local working-copy resilience and save-state trust signals, which means the author can be editing a newer in-memory state than the preview currently shows

This is not a theoretical concern.
It affects author confidence immediately before save/publish.

## Governing authority / required references

- live local repo mirroring `main` in `RMF112018/hb-intel`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- the attached Wave 01 audit package, especially:
  - `00-Audit-Summary.md`
  - `01-Repo-Truth-Implementation-Map.md`
  - `03-UI-UX-Findings-Register.md`
  - `04-Prioritized-Enhancement-Plan.md`

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/usePreviewController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useLocalDraftResilience.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useSaveStateTrust.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/ArticlePreview.tsx`
- `apps/hb-publisher/src/data/publisherAdapter/preview/previewBuilder.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishResolutionContext.ts`
- any directly coupled preview/trust-bridge helpers or preview action labels

Before making changes, conduct an exhaustive scrub of the full affected path and any directly coupled seams those files call into.

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, contradictions, or uncertainty after new findings.

## Current-state problem description

The current preview/readiness system is stronger than a typical internal form.
However, the product still allows an author to infer a tighter parity between current editing state and preview state than the repo currently guarantees.

Wave 01 must close that ambiguity.

## Required implementation outcome

Implement one **coherent preview truth model** and make it explicit in the UI.

At minimum:

1. audit the current preview source-of-truth path end to end
   - from selected article identity
   - through repository reads
   - through preview composition
   - through trust-bridge narration and preview actions

2. close the saved-vs-working-copy ambiguity
   - if preview remains persisted-draft-based, the UI must state that clearly whenever unsaved changes exist
   - if you can safely compose preview from the current working copy **without forking publish rules or duplicating validation logic**, implement that instead
   - do **not** leave a hybrid, implied, or ambiguous answer

3. make the action path obvious
   - when preview is behind current edits, the author should have a clear, direct path to bring preview current
   - do not require the author to infer a hidden save/recompose sequence

4. keep preview/publish logic unified
   - do not create a second composition rule set for preview
   - keep the shared preview/publish contract intact

5. align all trust narration with the final truth model
   - preview headlines
   - trust-bridge copy
   - empty/error messaging
   - preview action labels
   - any saved/local-cache narration that affects preview interpretation

## Dependencies / cross-surface considerations

- Prompt 04 depends on this prompt establishing the real preview truth model first
- any solution must preserve the shared composition/validation contract used by the preview builder
- any change that threads in-memory draft state into preview must not drift from publish behavior
- local working-copy cache and save-state trust cues must remain accurate

## Validation / proof-of-closure requirements

Prove all of the following:

- the preview’s source of truth is now explicit and truthful in the UI
- authors cannot reasonably mistake a saved-state preview for an unsaved working-copy preview
- there is a clear path from dirty state to current preview state
- preview/publish composition logic remains unified
- no new contradiction is introduced between preview language, save-state language, and actual runtime behavior

## Deliverables / closure artifacts

- code changes required for closure
- any narrowly necessary tests or validation updates for the preview/trust path
- a concise closure note summarizing:
  - what the final preview truth model is
  - whether preview is saved-state-based or current-working-copy-based
  - how the author is told that truth
  - what was proven about preview/publish parity

## Explicit non-goals

- do not create a fake live preview that diverges from publish rules
- do not widen scope into unrelated publish-pipeline rewrites
- do not make unrelated visual-polish changes
