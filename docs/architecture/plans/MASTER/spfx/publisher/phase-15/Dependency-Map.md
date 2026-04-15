# Wave 02 dependency map

## Core authoring shell
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useStatusChannel.ts`

## Single-image seams
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/HeroPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/SecondaryImagePanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/ImageAssetField.tsx`

## Gallery / supporting-media seams
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/GalleryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/MediaComposer.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/buildMediaRow.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/mediaInvariants.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/altTextGuidance.ts`

## Story editor seams
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/StoryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/StoryBodyEditor.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/editorToolbar.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/editorSchema.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/pasteSanitization.ts`

## Preview / readiness seams
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/ArticlePreview.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/readinessSurface/PublishReadinessDiagnostics.tsx`
- authoring panel files where inline remediation cues are surfaced

## Save truth / recovery / guard seams
- `apps/hb-publisher/src/data/publisherAdapter/draftSaveOrchestrator.ts`
- `apps/hb-publisher/src/data/publisherAdapter/validation/validationEngine.ts`
- `packages/session-state/src/hooks/useAutoSaveDraft.ts`
- `packages/ui-kit/src/hooks/useUnsavedChangesBlocker.ts`
- `packages/ui-kit/src/HbcForm/HbcFormGuard.tsx`
- `docs/reference/workflow-experience/draft-key-registry.md`

## Host / hardening seams
- `apps/hb-publisher/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/*`
- `apps/hb-publisher/src/mount.tsx`
