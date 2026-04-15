# Prompt 05 — Upgrade story authoring ergonomics within the governed schema

## Objective

Raise the quality of the writing experience without reopening already-closed governance work.

## Why this issue matters

Repo truth already proves that the body editor is no longer a raw textarea and already has:
- a real rich-text surface
- a governed schema
- paste sanitization
- a keyboard-accessible toolbar
- counts and shortcut hints

That means Wave 01 no longer needs a “replace the body field” prompt.
It needs a **real ergonomic refinement prompt** that improves writing confidence, discoverability, and flow inside the existing safe authoring model.

## Governing authority / required references

- live local repo mirroring `main` in `RMF112018/hb-intel`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- the attached Wave 01 audit package, especially:
  - `00-Audit-Summary.md`
  - `01-Repo-Truth-Implementation-Map.md`
  - `03-UI-UX-Findings-Register.md`
  - `04-Prioritized-Enhancement-Plan.md`

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/StoryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/StoryBodyEditor.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/editorToolbar.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/editorSchema.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/pasteSanitization.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/linkValidation.ts`
- any directly coupled story-body tests or helpers

Before making changes, conduct an exhaustive scrub of the full affected path and any directly coupled seams those files call into.

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, contradictions, or uncertainty after new findings.

## Current-state problem description

The rich editor is real and materially improved.
The remaining gap is that the authoring experience is still intentionally narrow and still carries some friction in:
- compose-time coaching
- empty-state guidance
- toolbar clarity
- link workflow polish
- the relationship between subhead, body, and optional flourishes

## Required implementation outcome

Improve the live writing experience **without breaking schema governance**.

At minimum:

1. keep the governed schema intact unless an expansion is explicitly justified, fully implemented, and fully validated

2. improve compose-time guidance
   - placeholder / empty-state behavior
   - how the editor explains what is supported
   - how subhead/body/flourishes read as one editorial workflow instead of isolated fields

3. improve toolbar quality
   - affordance clarity
   - keyboard discoverability
   - link workflow smoothness
   - general author confidence while editing

4. preserve safe paste and output behavior
   - no regression to unsafe or ungoverned HTML
   - no raw textarea fallback

5. keep accessibility strong
   - toolbar behavior
   - editable-area semantics
   - keyboard path
   - any helper or status narration added during the refinement

## Dependencies / cross-surface considerations

- preview and publish continue to depend on the stored body HTML remaining governed and predictable
- any new affordance must still reflect what the schema truly allows
- do not add styling/functionality that implies support for constructs the schema will strip out
- if you adjust empty-state or placeholder behavior, preserve stable hydration when switching drafts

## Validation / proof-of-closure requirements

Prove all of the following:

- the body editor remains governed and safe
- the writing experience is materially more usable than before
- keyboard and accessibility behavior still hold
- save, preview, and validation contracts remain intact
- no misleading affordance implies support for formatting the schema does not actually preserve

## Deliverables / closure artifacts

- code changes required for closure
- any narrowly necessary tests or validation updates
- a concise closure note summarizing:
  - what ergonomic gaps were closed
  - what governance constraints were preserved
  - whether any schema-level decision changed and why

## Explicit non-goals

- do not widen scope into a large-format WYSIWYG feature expansion unless it is fully justified and fully closed now
- do not weaken sanitization or schema enforcement
- do not introduce a textarea fallback
