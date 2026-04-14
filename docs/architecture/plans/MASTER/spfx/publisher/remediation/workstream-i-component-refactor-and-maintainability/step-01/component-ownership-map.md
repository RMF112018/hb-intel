# Publisher Component / Controller / Service Ownership Map

Binding authority: `UI-Doctrine-SPFx-Governing-Standard.md`, `UI-Doctrine-SPFx-Homepage-Overlay.md`, live repo code.

Repo-truth baseline (2026-04-14):
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` — 1972 LOC monolith
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts` — 416 LOC
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts` — 1252 LOC
- `apps/hb-webparts/src/mount.tsx` — 291 LOC (SPFx host wiring)

---

## Layer 1 — SPFx host wiring
**Owner:** `mount.tsx`
**Responsibility:** Resolve SPFx context (site URL, current user, graph token, people search, photo hydration) and render `<ArticlePublisher/>` with typed props. No business logic.
**Boundary:** Does not import anything under `articlePublisher/` except the component entry + its public prop type.

## Layer 2 — Shell (thin host)
**Target file:** `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` (reduced to a composition root)
**Responsibilities after refactor:**
- Accept props (`siteUrl`, `currentUserEmail`, `graphToken`, search / photo injections).
- Instantiate `repositories`, `orchestrator`, `searchProjects` via `React.useMemo` (already present — pattern is correct).
- Compose workspace, controllers, and panels; render layout.
- No inline panel components, no inline helpers beyond JSX composition.

## Layer 3 — Workspace orchestration
**Target module:** `articlePublisher/workspace/useDraftWorkspace.ts`
**Responsibility:** Owns the queue + selection lifecycle.
**State it owns:**
`groups`, `groupsLoading`, `groupsError`, `collapsedGroups`, `promotionRules`, `promotionPolicy`, `selectedArticleId`, `articleDraft`, `teamDraft`, `mediaDraft`, `binding`, `resolutionContext`.
**Effects it owns:**
`reloadGroups`, `reloadSelected`, initial-load effect, selection-change effect, `handleCreateNew`.
**Inputs:** `repositories`, `orchestrator`, `currentUserEmail`.
**Outputs:** read-only snapshot + mutators consumed by Shell and controllers.

## Layer 4 — Controller hooks (by concern)
Folder: `articlePublisher/controllers/`

| Hook | File | Owns | Depends on |
|------|------|------|------------|
| `useDraftLifecycle` | `useDraftLifecycle.ts` | `handleSave`, `handleTransition`, `handlePublishAction`, republish / withdraw / archive; `busy` flag | workspace state, orchestrator, lifecycleMessaging |
| `usePreviewController` | `usePreviewController.ts` | `preview`, `previewLoading`, `loadPreview`, debounce effect | `buildPublisherPreview`, workspace draft |
| `useReadinessController` | `useReadinessController.ts` | readiness summary, promotion summary, binding signal memos | workspace state, `selectPromotionPolicy`, `validTransitionsFrom` |
| `useStatusChannel` | `useStatusChannel.ts` | `status`, `statusTone`, `setStatus` helper | none (pure state) |

**Rule:** Only controllers (and workspace) call into `publisherAdapter`. Panels never do.

## Layer 5 — Authoring panels
Folder: `articlePublisher/authoringPanels/`

| Panel | Current inline location | New file |
|-------|------------------------|----------|
| `MetadataPanel` | ArticlePublisher.tsx:1409 | `authoringPanels/MetadataPanel.tsx` |
| `HeroPanel` | ArticlePublisher.tsx:1569 | `authoringPanels/HeroPanel.tsx` |
| `StoryPanel` | ArticlePublisher.tsx:1643 | `authoringPanels/StoryPanel.tsx` |
| `SecondaryImagePanel` | ArticlePublisher.tsx:1719 | `authoringPanels/SecondaryImagePanel.tsx` |
| `TeamPresentationPanel` | ArticlePublisher.tsx:1762 | `authoringPanels/TeamPresentationPanel.tsx` |
| `DestinationBindingPanel` | ArticlePublisher.tsx:1856 | `authoringPanels/DestinationBindingPanel.tsx` |

**Contract:** Every panel is presentational — receives `draft`, `onChange`, plus targeted injections (e.g. `searchProjects` for Metadata). No adapter imports, no lifecycle handlers, no `useState` beyond local UI state (e.g., expand/collapse).

## Layer 6 — Shared publisher chrome (cross-panel primitives)
Folder: `articlePublisher/sharedChrome/` (already exists — already hosts `PublisherButton`, `StatusBanner`, `EditorialChip`).
**Add during Prompt 03:**
- `Field` (ArticlePublisher.tsx:1929) → `sharedChrome/Field.tsx`
- `ChooserGroup` (ArticlePublisher.tsx:1299) → `sharedChrome/ChooserGroup.tsx`
- `resolveCounterState` (ArticlePublisher.tsx:1960) → co-located with `Field`.

## Layer 7 — Feature surfaces (already extracted, preserve)
No ownership change. Consumers of workspace/controller output:
- `draftQueue/` — renders `groups` + selection.
- `previewSurface/ArticlePreview` — renders preview state from `usePreviewController`.
- `readinessSurface/PublishReadinessDiagnostics` — renders readiness from `useReadinessController`.
- `teamComposer/TeamPanel`, `mediaComposer/GalleryPanel`, `storyBodyEditor/StoryBodyEditor` — remain owners of their sub-domain editing.

## Layer 8 — Service layer (unchanged)
`apps/hb-webparts/src/homepage/data/publisherAdapter/**` — repositories, orchestrator, workflow machine, preview builder, promotion rules, page bindings, validation. Treated as a stable seam. No extraction in this workstream.

---

## Non-overlap invariants
1. Only **workspace + controllers** import from `publisherAdapter`.
2. **Panels** never import from `publisherAdapter` or from `controllers/`; they accept props.
3. **sharedChrome** contains cross-panel primitives only; no feature-specific logic.
4. **Shell** contains no business handlers and no inline components.
5. Already-extracted surfaces (queue, preview, readiness, team, media, story) keep their current ownership and are not duplicated.

## Dependency direction
```
mount.tsx
  └─ ArticlePublisher (Shell)
        ├─ useDraftWorkspace ──► publisherAdapter
        ├─ controllers/* ───────► publisherAdapter
        ├─ authoringPanels/* ──► sharedChrome/*  (no adapter)
        └─ feature surfaces (queue, preview, readiness, team, media, story)
```

## Out of scope for Workstream I
- Splitting `publishOrchestrator.ts` further.
- Changing repository contracts or list descriptors.
- UI doctrine / visual changes.
- Cross-webpart refactors.
