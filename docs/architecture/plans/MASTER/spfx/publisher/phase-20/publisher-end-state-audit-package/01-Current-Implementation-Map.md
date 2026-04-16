# Current Implementation Map

## Primary entrypoints and runtime seams

### SPFx mount boundary
- `apps/hb-publisher/src/mount.tsx`
- stores SharePoint site URL
- resolves operator identity
- wires Graph token provider
- dispatches by stable webpart GUID
- mounts `ArticlePublisher` inside the forced-light homepage theme provider

### Stable runtime identity
- `apps/hb-publisher/src/webparts/articlePublisher/runtimeContract.ts`
- preserves the original deployment GUID lineage through the Article Publisher rebrand

### Manifest seam
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- hidden-from-toolbox webpart
- explicit SharePoint host targeting
- full-bleed support declared
- product description truthfully states current Project Spotlight-only runtime scope

## Shell composition

### Main shell
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`

The shell owns:
- workspace composition
- queue rail placement
- editorial canvas sequencing
- readiness rail placement
- top-level exceptional notices
- save/publish/transition action wiring
- preview staleness bridge
- next-action guidance
- local recovery offer
- active editorial spine behavior

### Styling architecture
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- token-driven editorial workspace styling
- asymmetric three-region layout
- authored breakpoint behavior
- lane-based section grouping
- stickied rails
- trust/readiness surface styling

## Controller seams

### Workspace / queue orchestration
- `workspace/useDraftWorkspace.ts`
- owns workflow-group loading
- selected article identity
- promotion rules preload
- template registry preload
- left-rail grouping and collapse logic

### Draft lifecycle
- `controllers/useDraftLifecycle.ts`
- owns article/team/media draft state
- save, transition, and publish handlers
- durable persistence flow
- binding and promotion-policy relationships

### Readiness model
- `controllers/useReadinessController.ts`
- reduces draft, binding, preview, and validation state into:
  - save gating
  - publish/republish gating
  - readiness summary
  - binding signal
  - publish intent
  - unsupported destination/content-type handling
  - promotion-rule health narration

### Save trust and recovery
- `controllers/useLocalDraftResilience.ts`
- `controllers/useSaveStateTrust.ts`
- local working-copy cache
- cached-vs-saved truth model
- save-state phrase selection
- dirty-state narration and navigation-loss protection support

### Preview controller
- `controllers/usePreviewController.ts`
- preview composition loading
- refresh flow
- preview outcome state feeding both editorial preview and readiness surfaces

## Authoring surfaces

### Identity / metadata
- `authoringPanels/MetadataPanel.tsx`
- searchable project selection
- headline
- summary excerpt
- article type
- editorial metadata disclosure
- destination readout
- milestone legacy notice

### Hero
- `authoringPanels/HeroPanel.tsx`
- primary hero image
- advanced hero overrides
- theme selection
- metadata-on-hero toggle

### Story
- `authoringPanels/StoryPanel.tsx`
- subhead
- TipTap-backed story editor
- optional editorial flourishes

### Team
- `teamComposer/TeamPanel.tsx`
- `teamComposer/TeamMemberComposer.tsx`
- people search
- row hydration from directory data
- featured-member invariants
- ordering and editing

### Media
- `mediaComposer/GalleryPanel.tsx`
- `mediaComposer/MediaComposer.tsx`
- featured-gallery invariants
- readiness summary
- alt-text guidance
- ordering and edit-composer behavior

### Destination and preview
- `authoringPanels/DestinationBindingPanel.tsx`
- `previewSurface/ArticlePreview.tsx`
- current binding narration
- homepage-card preview
- full article preview
- trust-bridge inline remediation cues

## Shared product primitives

### Project binding
- `ProjectPicker.tsx`
- governed searchable project lookup UX
- anchored overlay dropdown
- selected-chip system-identifier demotion

### Asset acquisition seam
- `sharedChrome/ImageAssetField.tsx`
- `sharedChrome/assetLibrarySource.ts`
- designed to support governed asset-library browse as the primary path when wired
- falls back to raw URL entry when not wired

### Story editor
- `storyBodyEditor/StoryBodyEditor.tsx`
- `storyBodyEditor/editorToolbar.tsx`
- `storyBodyEditor/editorSchema.ts`
- TipTap-backed schema-locked editorial editor
- accessible toolbar
- paste sanitization
- trusted-formatting boundary

## Data seams

### Project lookup source
- `data/publisherAdapter/projectsLookupSource.ts`
- HBCentral Projects list lookup
- title-bound list access
- generic CSV-style field mapping

### People search
- `data/useSharePointPeopleSearch.ts`
- SharePoint client people picker search adapter

### Person photos
- `data/useRecipientPhotoHydration.ts`
- Graph-backed person photo seam

### Slug governance
- `slugGovernance.ts`
- system-derived slug generation
- uniqueness enforcement
- post-draft stability

### Metadata defaults
- `metadataDefaults.ts`
- save-time default filling for team heading and hero category
