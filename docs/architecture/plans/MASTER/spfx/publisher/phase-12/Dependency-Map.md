# Wave 01 Dependency Map

## Purpose

This map identifies the hidden and adjacent seams that materially affect Wave 01 closure.

## Primary product seams

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/workspace/`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/`
- `apps/hb-publisher/src/webparts/articlePublisher/readinessSurface/`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/`

## Hidden dependencies that the baseline package underplayed

### 1. Shared chrome is already the visual foundation
The package must preserve and extend the existing shared-chrome seam rather than bypass it with ad hoc feature-level restyling.

Relevant files:
- `sharedChrome/PublisherButton.tsx`
- `sharedChrome/EditorialChip.tsx`
- `sharedChrome/Field.tsx`
- `sharedChrome/ChooserGroup.tsx`
- `sharedChrome/tokens.module.css`

### 2. Author-facing label governance already exists
Wave 01 closure now depends on finishing adoption of the existing label-governance module, not inventing one later.

Relevant files:
- `authorLabels.ts`
- `authorLabels.test.ts`

### 3. Queue and shell capabilities already exist and must not regress
The draft rail and queue are already richer than the baseline prompt implied.

Relevant files:
- `workspace/QueueRail.tsx`
- `draftQueue/DraftQueue.tsx`

### 4. Readiness logic is controller-owned and should stay that way
Prompt work can improve clarity and composition, but should preserve the existing derived-state boundary.

Relevant files:
- `controllers/useReadinessController.ts`
- `controllers/usePreviewController.ts`
- `readinessSurface/PublishReadinessDiagnostics.tsx`
- `previewSurface/ArticlePreview.tsx`

### 5. Team and gallery invariants are already encoded
Wave 01 UI work must not casually break featured exclusivity or sort-order restamping.

Relevant files:
- `teamComposer/teamInvariants.ts`
- `mediaComposer/mediaInvariants.ts`

### 6. Rich-text editing is already real, but the toolbar remains under-finished
The editor itself should not be thrown away. Toolbar semantics, iconography, and interaction quality should be strengthened.

Relevant files:
- `storyBodyEditor/StoryBodyEditor.tsx`
- `storyBodyEditor/editorToolbar.tsx`
- `storyBodyEditor/storyBodyEditor.module.css`

## Package boundary rule

If an adjacent seam is required to close one of the above issues cleanly, it belongs in Wave 01.

If it is merely nice-to-have or future-expansion work, keep it out.

