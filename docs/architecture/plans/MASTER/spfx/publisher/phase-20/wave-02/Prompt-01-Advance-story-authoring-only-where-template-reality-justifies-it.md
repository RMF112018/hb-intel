# Prompt-01-Advance-story-authoring-only-where-template-reality-justifies-it

## Objective
Move the body-authoring experience beyond a good constrained baseline only where the actual published template and product standard justify additional editorial capability.

## Authorities
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/*`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/StoryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/ArticlePreview.tsx`
- any live template/page composition seams that govern what the published page can faithfully render

## Current gap to close
The story editor is now credible, but it is still a deliberately narrow schema. That may be correct for the current template, or it may now be too limiting for the stated product standard. Determine the truth from repo reality and close the gap accordingly.

## Required implementation outcome
1. Audit what the current published page/template actually supports and what the product truly needs.
2. Add only the editorial capability that materially improves authoring and publish quality.
3. Preserve strong schema governance and paste sanitization.
4. Keep authored-content-to-published-result trust high.

## Proof of closure
- identify what capability was intentionally kept out vs added
- show why the final schema is the correct product answer
- prove preview and publish paths remain faithful
- run focused verification

## Constraints
- do not bloat the editor for vanity
- do not add formatting the published page cannot faithfully support
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
