# Prompt 04 — Finish story editor editorial-grade closure

## Objective

Take the current TipTap-based story editor from “substantially functional” to a fully closed editorial-grade authoring surface while preserving the governed schema, sanitization posture, and SharePoint-host-safe output model.

## Why this issue matters

The live repo already did the heavy lift:

- the body textarea is gone
- the editor is TipTap-based
- schema restrictions are explicit
- paste sanitization exists
- an accessible toolbar pattern already exists

That means the remaining Wave 02 work is not foundational editor creation. It is the finishing work that determines whether authors experience the editor as a premium editorial surface or as a technically correct but still under-finished internal tool.

## Current repo-truth problem state

The narrowed audit found that the editor stack already exists across:

- `storyBodyEditor/StoryBodyEditor.tsx`
- `storyBodyEditor/editorToolbar.tsx`
- `storyBodyEditor/editorSchema.ts`
- `storyBodyEditor/pasteSanitization.ts`
- `authoringPanels/StoryPanel.tsx`

The remaining closure gaps are now specific. At minimum investigate and close:

- any placeholder/empty-state behavior that is still brittle or implementation-hacky instead of editor-native
- toolbar discoverability / affordance quality gaps that still make the editor feel merely technical
- link-insertion ergonomics and validation clarity
- missing component-level tests for the higher-value editor interactions compared with the current test mix
- any premium-polish gaps that materially affect editorial author confidence but can be closed without violating schema safety

## Intended future state

The story editor should feel like a deliberate editorial-writing surface:

- clear affordances
- reliable empty/placeholder state
- coherent focus treatment
- strong but restrained formatting surface
- safe output discipline
- crisp micro-interactions for common actions like inserting links

## Governing authority / required reference docs

- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/StoryPanel.tsx`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- this package’s `Validation-Strategy.md`

Where helpful, also respect current external guidance already aligned with the implementation direction:

- Tiptap placeholder and extension guidance
- APG toolbar guidance

## Exact repo files and seams to inspect

At minimum inspect:

- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/StoryBodyEditor.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/editorToolbar.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/editorSchema.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/pasteSanitization.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/StoryPanel.tsx`
- existing editor-related tests and any missing-test seams

## Required implementation outcome

- Preserve the governed schema and sanitization model.
- Preserve the current allowed formatting set unless a clearly justified, still-safe change is required.
- Finish the editor’s empty/placeholder behavior using a robust, intentional approach rather than a brittle incidental one.
- Improve toolbar clarity, focus, and interaction feel where the live repo still feels under-finished.
- Improve the link-insertion microflow where needed, without broadening the allowed URL policy unsafely.
- Add targeted tests that prove the editor’s higher-value behaviors beyond the currently strongest low-level sanitizer coverage.

## Validation / proof-of-closure requirements

Prove all of the following:

- the editor still emits safe, schema-compliant HTML
- the empty/placeholder state behaves correctly on first render, after content removal, and after draft switching
- toolbar keyboard behavior still works
- link insertion and removal remain coherent and safely validated
- paste sanitization continues to strip disallowed content
- the editor feels visually stronger without drifting into generic heavy chrome or non-host-safe styling
- targeted editor interaction tests were added or updated

## Deliverables / closure notes to create

Create:

- `docs/architecture/reviews/publisher/wave-02-story-editor-closure.md`

Document:

- what remained under-finished before this prompt
- how placeholder/empty-state behavior is now handled
- what toolbar or link-flow improvements were made
- what tests now prove the editor contract

## Required working method

Before you edit anything:

1. Scrub the full editor seam, not just the top-level component.
2. Verify drift in the editor schema, toolbar assumptions, CSS classes, and tests.
3. Do **not** re-read files still in active context unless needed to confirm drift or regression risk.
4. Preserve schema safety and sanitization.
5. Prove closure before moving on.

## Explicit instruction not to make unrelated changes

Do not turn this into a broad content-model redesign or a feature-creep editor expansion. Keep the work tightly bounded to editorial-grade closure of the existing governed editor model.
