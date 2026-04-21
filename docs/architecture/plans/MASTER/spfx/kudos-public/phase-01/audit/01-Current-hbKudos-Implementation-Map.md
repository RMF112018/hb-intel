# 01-Current-hbKudos-Implementation-Map

## Architectural map

### Public runtime shell
`HbKudos.tsx` is the orchestration layer for the viewer-facing runtime. It resolves config, reads current-user identity, loads public/archive recognition data, hydrates recipient photos, wires celebrate mutations, owns article-reader/composer/feed state, and renders the public surface plus archive/feed/reader/composer shells.

### Data seams
- `usePublicKudosData.ts`
  - loads kudos through `usePeopleCultureData`
  - derives `publicKudos` and `archiveKudos`
  - exposes `isLoading`, `error`, `hasListConfig`, and `refresh`
- `useCurrentUserId.ts`
  - SharePoint current-user resolution
- `useRecipientPhotoHydration.ts`
  - Graph-backed recipient photo hydration/cache
- `useCelebrateAction.ts`
  - celebrate mutation + refresh coupling

### Presentation seams
- `PublicKudosSurface.tsx`
  - masthead
  - featured card
  - recent-recognition stream
- `ArchiveList.tsx`
  - archive header, toggle, search, archive rows, browse-all CTA
- `KudosArticleReader.tsx`
  - reader shell with full content
- `KudosFeedPanel.tsx`
  - flyout wrapper for full browse surface
- `KudosComposerPanel.tsx`
  - submission flow entry

### Styling seams
- `kudosSurface.module.css`
  - hero gradient
  - featured card
  - recent rows
  - archive rows
  - terminal feed CTA
  - root shell/safe-zone sentinel
- `kudosVariants.ts`
  - CVA-backed recurring visual patterns
- `KudosGovernancePrimitives.tsx`
  - CSS variable bridge and shared primitives

### Host/runtime seams
- `useHostSafeLayout.ts`
  - iframe detection
  - bottom-right assistant safe-zone padding
  - sentinel contract for harness validation
- `HbKudosWebPart.manifest.json`
  - non-full-bleed public posture

### Proof / drift-control seams
- `README.md`
  - declares hbKudos as reference-quality implementation
- `kudosDoctrineGuards.test.ts`
  - icon, token, manifest, mount, and shell invariants

## Assessment of the architecture
**Strength:** the runtime is meaningfully decomposed and far less monolithic than weaker homepage surfaces.
**Weakness:** strong internal architecture is not yet matched by equally strong responsive composition strategy in the public surface.
