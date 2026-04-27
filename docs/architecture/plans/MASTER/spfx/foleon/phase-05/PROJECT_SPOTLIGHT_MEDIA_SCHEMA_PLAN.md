# Project Spotlight Media Schema / Content Model Plan (PS-03)

> **Status:** design and audit only. No source, schema, list, or provisioning changes are produced by this document. Implementation lands in PS-03A / PS-03B / PS-03C, each with its own copy-ready prompt at the end of this file.

## 1. Context and accepted baseline

PS-02 (commit `1d8c6436a`, HB Homepage `1.1.88.0`) is the accepted Project Spotlight visual baseline. The Project Spotlight Foleon lane is now an employee-facing visual showcase that consumes the existing edition-level `FoleonContentRecord` fields:

- `title`, `summary`, `cadence`
- `heroImageUrl`, `thumbnailUrl`
- `region`, `sector`, `relatedProjectName`
- `embedUrl`, `publishedUrl`, `allowEmbed`, `requiresExternalOpen`

PS-03 does **not** redesign this layout. The remaining product gap is structured media content — gallery images, video, captions, alt text, focal points, credits, sort order, and date-bounded display — that the current edition-level URL fields cannot represent. PS-03 produces the schema, Manager UI, reader/view-model, and provisioning design that closes this gap. Implementation is gated on this design landing first.

Two preview-polish follow-ups are logged separately in §12 (not implemented in PS-03).

## 2. Existing content registry field map

Tenant authority: `HB_FoleonContentRegistry` (list ID `2e57615d-457e-49b8-aef3-038e85cbe068`).
Code authority: `apps/hb-intel-foleon/src/schema/foleonListSchemas.ts::FOLEON_CONTENT_REGISTRY_SCHEMA`.
Manager-side type: `apps/hb-intel-foleon/src/types/foleon-management.types.ts::FoleonManagedContent` / `FoleonContentMutation`.
Reader-side type: `packages/foleon-reader/src/types/foleon-content.types.ts::FoleonContentRecord`.

| Topic | SharePoint field (internal name) | Type | Indexed | Reader type field | Manager mutation field | Drift |
|---|---|---|---|---|---|---|
| Title | `Title` | Text req | no | `title` | `title` | none |
| Summary | `Summary` | Note | no | `summary` | `summary` | none |
| Hero image | `HeroImageUrl` | Hyperlink | no | `heroImageUrl` | not in `FoleonContentMutation` | **drift — Manager cannot mutate hero today** |
| Thumbnail | `ThumbnailUrl` | Hyperlink | no | `thumbnailUrl` | `thumbnailUrl` | none |
| Published URL | `PublishedUrl` | Hyperlink | no | `publishedUrl` | `publishedUrl` | none |
| Embed URL | `EmbedUrl` | Hyperlink | no | `embedUrl` | `embedUrl` | none |
| Preview URL | `PreviewUrl` | Hyperlink | no | `previewUrl` | not in `FoleonContentMutation` | **drift — admin-only field; Manager cannot mutate** |
| Project number | `RelatedProjectNumber` | Text | no | `relatedProjectNumber` | not in `FoleonContentMutation` | **drift — Manager cannot mutate** |
| Project name | `RelatedProjectName` | Text | no | `relatedProjectName` | not in `FoleonContentMutation` | **drift — Manager cannot mutate** |
| Region | `Region` | Choice | no | `region` | `region` | none |
| Sector | `Sector` | Choice | no | `sector` | `sector` | none |
| Audience | `PrimaryAudience` | Choice | no | `primaryAudience` | `primaryAudience` | none |
| Cadence | `Cadence` | Choice | no | `cadence` | `cadence` | none |
| Archive | `ArchiveGroup` | Text | yes | `archiveGroup` | `archiveGroup` | none |
| Sort/order | `SortRank` | Number | yes | `sortRank` | not in `FoleonContentMutation` | **drift — Manager cannot mutate** |

**Drift notes load-bearing for PS-03:**
- The Manager can change `thumbnailUrl` but not `heroImageUrl` or `previewUrl`. PS-03B should not silently widen `FoleonContentMutation` — that is a separate fix and would need its own backend route work. The PS-03 media path supersedes both fields functionally.
- `relatedProjectName`/`relatedProjectNumber`/`sortRank` are admin-managed today; PS-03 leaves that contract untouched. PS-03B's Media tab does not introduce new edition-level mutations.

## 3. Proposed `ProjectSpotlightMediaItem` schema

### 3.1 TypeScript shape (proposal)

```ts
export type FoleonMediaType = 'image' | 'video';

export interface ProjectSpotlightMediaItem {
  // ----- required -----
  readonly id: string;                       // SharePoint item id (string for transport)
  readonly parentEditionId: number;          // FK to FoleonContentRegistry SharePoint item id
  readonly mediaType: FoleonMediaType;
  readonly displayLabel: string;             // short caption / display label
  readonly sortRank: number;                 // integer; lane/lift ordering
  readonly isActive: boolean;                // gate without delete
  readonly altText: string;                  // required when mediaType === 'image'
                                             // required when mediaType === 'video' AND a poster/cover frame is shown
                                             // (see §3.3 — "video alt rule")
  // ----- optional -----
  readonly focalPointX?: number;             // 0..1 normalized
  readonly focalPointY?: number;             // 0..1 normalized
  readonly credit?: string;                  // photographer / source attribution
  readonly videoUrl?: string;                // required when mediaType === 'video'
  readonly thumbnailOverrideUrl?: string;    // override generated/derived thumbnail
  readonly transcriptUrl?: string;           // accessibility transcript
  readonly displayFrom?: string;             // ISO datetime; window start
  readonly displayThrough?: string;          // ISO datetime; window end
  readonly assetUrl?: string;                // for image type, this is the bound image URL
                                             // (see §4 — storage strategy)
}
```

### 3.2 SharePoint field mapping (proposal)

Internal-name convention follows existing Foleon list spelling (PascalCase for fields, no spaces, no separators).

| TS field | SharePoint internal name | Field type | Required |
|---|---|---|---|
| `parentEditionId` | `ParentEditionLookup` | Lookup → `HB_FoleonContentRegistry` | yes |
| `mediaType` | `MediaType` | Choice (`Image`, `Video`) | yes |
| `displayLabel` | `DisplayLabel` | Text | yes |
| `sortRank` | `SortRank` | Number | yes |
| `isActive` | `IsActive` | Boolean | yes |
| `altText` | `AltText` | Note (multi-line text) | yes (see §3.3) |
| `focalPointX` | `FocalPointX` | Number | no |
| `focalPointY` | `FocalPointY` | Number | no |
| `credit` | `Credit` | Text | no |
| `videoUrl` | `VideoUrl` | Hyperlink | no (req when video) |
| `thumbnailOverrideUrl` | `ThumbnailOverrideUrl` | Hyperlink | no |
| `transcriptUrl` | `TranscriptUrl` | Hyperlink | no |
| `displayFrom` | `DisplayFrom` | DateTime | no |
| `displayThrough` | `DisplayThrough` | DateTime | no |
| `assetUrl` | `AssetUrl` | Hyperlink (file URL or library URL) | yes for `Image` |

> `Title` (built-in) is set to `${parent edition title} · ${displayLabel}` for human-readable list views — not used by code.

### 3.3 Required-when rules (validation)

- `mediaType === 'image'` ⇒ `altText` required, `assetUrl` required.
- `mediaType === 'video'` ⇒ `videoUrl` required. `altText` required when a poster/cover frame will be shown to users (PS-03B always treats poster as user-visible, so `altText` is effectively required for video too — state this explicitly in the Manager validation rules; do not silently allow empty).
- `displayFrom` and `displayThrough` honored only as soft window; default-on when both unset. If both set, `displayFrom <= displayThrough`.
- `focalPointX`/`focalPointY` ∈ `[0, 1]` when present; both-or-neither (xor invalid).
- `sortRank` is a non-negative integer.

## 4. Storage strategy options

| # | Option | Threshold / index implications | Manager UX | Migration | Test / provisioning impact | Verdict |
|---|---|---|---|---|---|---|
| 1 | JSON column on `HB_FoleonContentRegistry` (e.g. `MediaItemsJson`) | Zero new lists; no thresholds. Cannot index inside JSON. | Single edition mutation per save → simpler concurrency surface, but every save round-trips the entire array. | Trivial (just add a Note column). | Adds JSON-parser tests and one schema field. No new provisioning list. | **Acceptable only at trivial scale (~≤ 6 items per edition).** Loses per-asset history, per-asset ETags, per-asset audit. |
| 2 | New list `HB_FoleonProjectSpotlightMediaAssets` with `ParentEditionLookup` to registry | Standard list-view threshold (5,000) is far above HB scale. Indexed `(ParentEditionLookup, IsActive, SortRank)` keeps single-edition fetch under threshold even at growth. | Per-asset CRUD, ETags, validation; Manager handles ordered list inline in a dedicated Media tab. | New Feature Framework provisioning artifact; backend routes; Manager UI surface. | Requires a new schema constant, new service module, new backend Functions routes, new Manager panel, new tests. | **Acceptable. Default if media files live on an external CDN already.** |
| 3 | Document library + library metadata columns | Document library is itself list-shaped; threshold guidance same as option 2 but with file-storage pattern. Files inherit SharePoint indexing on the library. | Native upload flow (drag/drop) but library metadata UI is awkward inside the Manager unless we wrap it. | Library + columns provisioning; library URL handling. | Backend routes interact with Files API for binaries plus Lists API for metadata if columns are on the library. | Mixes concerns: file binary lives next to ordering metadata. Less clean separation when ordering is manipulated frequently. |
| 4 | **Hybrid** — document library for binary assets + `HB_FoleonProjectSpotlightMediaAssets` list for ordered metadata | Library threshold for files; list threshold for ordered metadata. Each layer is single-purpose. Indexed on the list, not the library. | Manager keeps one Media tab that orchestrates upload (library) + metadata edit (list). | Library + list provisioning; list lookup keys files by URL. | Adds two provisioning artifacts; backend routes split read/write between files + list. Cleaner long-run. | **Recommended (see §5).** |

## 5. Recommended strategy

**Hybrid (option 4)** is the default recommendation. Rationale, matched to repo truth:

1. **Foleon content registry stays the edition / placement source of truth.** Media records live as subordinate children of the active Project Spotlight edition via `ParentEditionLookup`. The lane registry / placement model is unchanged.
2. **Library carries binary files** so upload UX is native and content owners do not have to externally host before adding to the homepage. Binary lifecycle (versioning, retention) is governed by the library.
3. **List carries ordered metadata** so single-edition fetches are predictable: one query, indexed `(ParentEditionLookup, IsActive)` with sort by `SortRank`. The list never holds binary blobs; the `AssetUrl` on each list row points at the corresponding library file (or an external CDN URL when authored that way).
4. **Two-list audit / mutation symmetry** with the existing `HB_FoleonHomepagePlacements` model. Backend routes, Manager mutation utilities, and tests all follow the same proven pattern (`manageMutationUtils.ts`, `FoleonManagementApi.ts`).
5. **Conditions favoring option 2 instead:** if all media is fully externally hosted (CDN-only) and HB will not author new uploads inside SharePoint, then the document library disappears and option 2 alone is sufficient. Default decision in this plan: ship hybrid; trivially degrade to option 2 if the library is omitted at provisioning time.

## 6. List-threshold and indexing guidance

For the new `HB_FoleonProjectSpotlightMediaAssets` list:

- **Indexed at provisioning (3 fields, minimum viable):**
  - `ParentEditionLookup` — every read filters here; the most-load-bearing index.
  - `IsActive` — gates published vs. archived without deleting rows.
  - `SortRank` — required for stable order without server-side sort tricks.
- **Not indexed (avoid over-indexing):**
  - `MediaType`, `DisplayLabel`, `Credit`, `VideoUrl`, `ThumbnailOverrideUrl`, `TranscriptUrl`, `AltText`, `AssetUrl`, `FocalPointX`, `FocalPointY`, `DisplayFrom`, `DisplayThrough`. None of these drive query shape.
- **Compound index:** none initially. SharePoint composite indexes have lifecycle costs; revisit only if `(ParentEditionLookup, SortRank)` queries demonstrably exceed the 5,000-row list view threshold per edition (extremely unlikely at HB scale).
- **Threshold guard rails:** at HB scale the absolute row count should stay well under 5,000 per list. The ordered-fetch query is always `ParentEditionLookup eq <editionId> and IsActive eq 1` ordered by `SortRank` — that filter resolves on a single indexed column, so it remains threshold-safe even if rows accumulate broadly.
- **Mirror in code:** `requiredIndexedFields` array in the new schema constant must list exactly these three fields (`ParentEditionLookup`, `IsActive`, `SortRank`) so service-side `assertFiltersAreIndexed` enforces the contract — same posture as `FOLEON_HOMEPAGE_PLACEMENTS_SCHEMA`.

## 7. Migration / backfill strategy

- **Edition-level fallback fields stay.** `heroImageUrl` and `thumbnailUrl` on `HB_FoleonContentRegistry` remain in place, are not deprecated, and are not removed. They are the **edition-level compatibility seam** for editions that have not yet been authored with rich media.
- **Reader precedence** (PS-03C):
  1. If `HB_FoleonProjectSpotlightMediaAssets` has any `IsActive` rows for the active Project Spotlight edition, derive `projectMedia` from the highest-`SortRank` image as primary; second image (or first video poster) as supporting tile.
  2. Else fall back to `record.heroImageUrl` (then `record.thumbnailUrl`) — the current PS-02 behavior.
- **No automated migration.** Editions without media-asset rows continue to render the PS-02 fallback path. There is no batch backfill script.
- **Opt-in copy on first edit (Manager).** The first time an admin opens the Media tab for an edition that has `heroImageUrl` (or `thumbnailUrl`) set but no media-asset rows, the Manager surfaces a one-click "Copy hero image into media list" affordance that inserts a single image row with `SortRank: 0`, `IsActive: true`, `AltText: ''` (admin must supply), and `AssetUrl: <heroImageUrl>`. The edition-level `heroImageUrl` is **not** cleared by this action — both representations co-exist; reader precedence still prefers the asset list.
- **Compatibility window:** indefinite. Do not deprecate `heroImageUrl`/`thumbnailUrl`. Document this in the next package README touch as a load-bearing compatibility seam.

## 8. Manager UI requirements

Surface placement, named in terms of the existing files:

- A new `MediaAssetsPanel` component co-located in `apps/hb-intel-foleon/src/pages/manage/`. Mounted by `SelectedLaneWorkspace` only when `props.laneVm.lane === 'project-spotlight'` (Pulse and Leadership are out of scope; their media model lands later if/when needed).
- The panel renders **inside** the existing Project Spotlight workspace, between `ManageContentEditorPanel` and the readiness-rail siblings — same visual rhythm as the existing form.
- Read path: `api.listMediaAssetsForEdition(editionSharePointItemId)`.
- Write path: `api.createMediaAsset`, `api.updateMediaAsset`, `api.deleteMediaAsset`, plus `api.reorderMediaAssets(editionId, orderedIds)` (atomic batch reorder so SortRank changes resolve in one round-trip).
- The panel composes the same primitives the editor already uses (`ManageTextField`, `ManageSelectField`, `ManageCheckbox`, validation lists from `manageFields.module.css`).

Workflow expectations (mirrored from prompt + PS-03 design):
1. Admin selects the Project Spotlight edition in the lane navigation rail (existing flow).
2. Media tab/panel lists current media in `SortRank` order.
3. **Add** an image: choose document-library file (existing tenant library) or paste an externally-hosted HTTPS URL → enter `displayLabel` → enter `altText` (required) → optional credit / focal point.
4. **Add** a video: paste `videoUrl` (must be HTTPS allowed-origin per existing `FoleonOriginPolicy`) → optional `thumbnailOverrideUrl` → required `displayLabel` and `altText` for poster.
5. **Reorder** by drag-handle or up/down keyboard arrows → atomic save.
6. **Toggle active** without deleting (preserves history).
7. **Preview** opens the homepage Project Spotlight lane in a side iframe with the in-progress media rendered (uses existing reader path; no new origin policy).
8. **Validate** before publish: at least one active image with `altText`, all rows valid per §3.3, no orphan rows pointing at deleted library files.

Validation surface mirrors `manageMutationUtils.ts` patterns:
- `validateMediaAssetMutation(draft)` — required-when rules, URL allowlist, focal-point bounds.
- `buildMediaAssetWarnings({ draft, allAssetsForEdition, originPolicy })` — duplicates, missing alt text, sort collisions, archive ratio.

## 9. Reader / view-model consumption strategy (PS-03C)

Reader package (`@hbc/foleon-reader`) gains:

- A new content-side type `FoleonProjectSpotlightMediaAsset` mirrored from §3.1 (read-side projection — drop `etag`/Manager fields, keep what the reader needs).
- A new content service method on `FoleonReaderContentService` that fetches assets for the active edition and maps them into a `gallery: ReadonlyArray<...>` field on `FoleonReaderProjectMedia`.
- The view model adapter keeps current PS-02 fallback path: if the assets fetch returns empty, the reader continues to consume `heroImageUrl`/`thumbnailUrl` exactly as today.
- The PS-02 `MediaStage` component and `showcase*` CSS are **not** changed by PS-03C. The change is internal — the layout reads from `projectMedia.primaryImageUrl` / `projectMedia.thumbnailUrl` regardless of source. Future PS-03D (deferred) introduces a gallery rendering surface; PS-03C stops short of that to keep the visual baseline frozen.
- A11y rule preserved: editorial alt text comes from `altText` on the asset record (now an authoritative field). The PS-02 generated fallback label (`"Project Spotlight image for {title}"`) remains as the absolute-last-resort path when both the assets list and the edition-level URL render via raw URL with no record-bound alt — and is still labeled in code as a fallback, not as editorial alt.

## 10. Test and validation surface

### 10.1 Unit (foleon-reader package)

- Asset list mapping: SharePoint-shaped item → `FoleonProjectSpotlightMediaAsset` with type narrowing, required-when alt rule, allowed origin check on `assetUrl` / `videoUrl` / `thumbnailOverrideUrl`.
- `FoleonReaderProjectMedia` derivation precedence (assets-list first, edition fallback second).
- No-fabrication: when the list returns empty, the view model returns the PS-02 fallback shape and never invents asset URLs.

### 10.2 Unit (foleon-manager package — `apps/hb-intel-foleon`)

- `validateMediaAssetMutation(draft)` covers all §3.3 rules.
- `buildMediaAssetWarnings(...)` returns deduped, ordered warnings.
- Reorder helper preserves SortRank monotonicity and rejects duplicate ranks.

### 10.3 Integration

- Manager tab opens, lists assets for the current edition, toggles active, edits alt text, reorders, saves.
- Backend route contract (Functions): create/update/delete/reorder all return ETag-aware payloads matching the existing content-mutation envelope.

### 10.4 Schema / provisioning

- Add the new schema to `FOLEON_LIST_SCHEMAS` and verify `assertSelectFieldsInSchema` covers all fields used by service `$select`.
- `assertFiltersAreIndexed` rejects any service that filters on a non-indexed column.

### 10.5 Regression

- PS-02 hosted-proof markers stay green (`SourceMarkerProof.test.ts`, layout tests, ProjectSpotlightReaderLayout.test.tsx, FoleonReaderModule.test.tsx).
- hbHomepage version-authority lockstep tests pass (no version churn in PS-03A/B/C unless those waves bundle into a new SPFx package).

## 11. Implementation waves

PS-03 splits into three sequenced waves. Each wave's copy-ready prompt is included in §13.

### Wave PS-03A — Schema, provisioning, and backend
- New SharePoint list `HB_FoleonProjectSpotlightMediaAssets` (Feature Framework artifact + schema constant in `apps/hb-intel-foleon/src/schema/foleonListSchemas.ts`).
- Optional document library `HB_FoleonProjectSpotlightMedia` (provisioned together with the list when the hybrid path is chosen).
- Backend Functions routes: `GET /foleon/content/{editionId}/media`, `POST /foleon/content/{editionId}/media`, `PATCH /foleon/media/{id}`, `DELETE /foleon/media/{id}`, `POST /foleon/content/{editionId}/media/reorder`.
- New types in `foleon-management.types.ts` and a parallel reader-side projection in `packages/foleon-reader/src/types/foleon-content.types.ts` (or a sibling file).
- Updates to `tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1` if a new registry config key is required (e.g. `FoleonProjectSpotlightMediaAssetsListGuid`) and to the homepage runtime config if the reader needs the list GUID at runtime.

### Wave PS-03B — Manager UI + workflow
- New `MediaAssetsPanel` component, mounted only for the Project Spotlight lane.
- Service additions on `FoleonManagementApi` mirroring the new backend routes (`listMediaAssetsForEdition`, `createMediaAsset`, `updateMediaAsset`, `deleteMediaAsset`, `reorderMediaAssets`).
- Validation utilities in a new `manageMediaAssetUtils.ts`, mirroring `manageMutationUtils.ts` patterns (required-when, ETag, fingerprint).
- Form, drag/drop reorder, alt-text-required gate before save, opt-in "copy hero image into media list" affordance.
- Tests — unit and integration.

### Wave PS-03C — Reader / view-model consumption + hosted proof
- New reader-side service method that maps list rows to `FoleonReaderProjectMedia.gallery`.
- View-model precedence: assets list first, edition-level `heroImageUrl`/`thumbnailUrl` fallback otherwise.
- Layout untouched (PS-02 baseline locked); the view-model abstraction means the existing `MediaStage` continues to render unchanged.
- Hosted proof: extend the homepage hosted-proof checklist to assert `data-foleon-media-source="assets-list" | "edition-fallback"` on the rendered card so deploy validation can see which path is live.

## 12. Preview-polish follow-ups (logged, not implemented)

These belong to a tiny separate prompt after PS-03 ships, not to PS-03 itself:
- **Replace or omit `Sample location` / `Sample market`** placeholder values in the Spotlight preview state. Decide whether to omit chips entirely in preview, or use editorial-honest sample copy (e.g. `Florida coast`, `Luxury Residential`) that does not look like real production data.
- **Disabled preview CTA pill contrast / state copy.** Audit the disabled-state CTA pill on the gradient placeholder for legibility at small viewports; tighten copy so the disabled-vs-enabled distinction is obvious without color reliance.

## 13. Closure

```text
Summary:
PS-03 delivers the design and audit package required to support a media-rich
Project Spotlight without redesigning the PS-02 visual baseline. It defines
a subordinate-to-edition media model, recommends a hybrid library + list
storage strategy, specifies required/optional schema fields with required-when
validation, sets minimum-viable indexing, locks the migration/backfill path
on the existing heroImageUrl/thumbnailUrl fallback, and produces three
copy-ready implementation prompts (PS-03A schema/provisioning, PS-03B Manager
UI/workflow, PS-03C reader/view-model consumption + hosted proof).

Current schema truth:
HB_FoleonContentRegistry (list ID 2e57615d-457e-49b8-aef3-038e85cbe068) and
HB_FoleonHomepagePlacements remain authoritative. Code source of truth is
apps/hb-intel-foleon/src/schema/foleonListSchemas.ts. Drift confirmed
between FoleonContentMutation (manager) and FoleonContentRecord (reader)
on heroImageUrl, previewUrl, relatedProjectName, relatedProjectNumber, and
sortRank — Manager cannot mutate these today. PS-03 supersedes the
hero/thumbnail mutation gap functionally; the other drift is logged but
out of PS-03 scope.

Recommended media model:
Hybrid library + list. New list HB_FoleonProjectSpotlightMediaAssets with
ParentEditionLookup → HB_FoleonContentRegistry. Optional document library
HB_FoleonProjectSpotlightMedia for binary assets. Required fields per row:
parentEditionId, mediaType, displayLabel, sortRank, isActive, altText
(image always; video poster always). Optional fields: focalPointX/Y,
credit, videoUrl, thumbnailOverrideUrl, transcriptUrl, displayFrom/Through,
assetUrl. Indexed at provisioning: ParentEditionLookup, IsActive, SortRank.
No compound index initially.

Implementation waves:
PS-03A — schema constant, Feature Framework provisioning artifact, backend
        Functions routes, manager + reader types.
PS-03B — Manager UI MediaAssetsPanel, mutation utilities, validation,
        opt-in hero-copy migration affordance, tests.
PS-03C — reader content service, view-model precedence, hosted-proof
        marker for deploy validation. PS-02 layout untouched.

Files likely to change:
PS-03A:
  apps/hb-intel-foleon/src/schema/foleonListSchemas.ts (add schema constant)
  apps/hb-intel-foleon/src/types/foleon-management.types.ts (new types)
  apps/hb-intel-foleon/src/services/FoleonManagementApi.ts (new methods)
  apps/hb-intel-foleon/sharepoint/assets/schema-*.xml (new provisioning artifact)
  apps/hb-intel-foleon/scripts/validate-foleon-feature-assets.ts (new fixture)
  packages/foleon-reader/src/types/foleon-content.types.ts (asset projection)
  packages/foleon-reader/src/services/FoleonReaderContentService.ts (new fetch method)
  backend/functions/src/* (new routes)
  docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-project-spotlight-media-assets.md (new)
  tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1 (optional registry key)
PS-03B:
  apps/hb-intel-foleon/src/pages/manage/MediaAssetsPanel.tsx (new)
  apps/hb-intel-foleon/src/pages/manage/manageMediaAssetUtils.ts (new)
  apps/hb-intel-foleon/src/pages/manage/SelectedLaneWorkspace.tsx (mount new panel for spotlight)
  apps/hb-intel-foleon/src/pages/manage/__tests__/manageMediaAssetUtils.test.ts (new)
PS-03C:
  packages/foleon-reader/src/readers/FoleonReaderViewModel.ts (precedence wiring)
  packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts (new precedence cases)
  packages/foleon-reader/src/readers/__tests__/SourceMarkerProof.test.ts (new media-source marker)
  apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json (version bump bundled with C)
  apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
  apps/hb-homepage/config/package-solution.json
  packages/homepage-launcher/src/constants.ts

Provisioning impact:
PS-03A introduces one new SharePoint list (and optionally one document library)
under HBCentral. Tenant rollout requires a controlled provisioning pass — same
posture as the original Foleon list provisioning. The runtime registry may
need a new GUID config key (FoleonProjectSpotlightMediaAssetsListGuid). No
existing list schemas change. No existing field is renamed or retyped.

Risks:
1. Authoring drift — admins author rich media records that disagree with the
   edition-level heroImageUrl. Mitigation: opt-in copy affordance + reader
   precedence rule + warnings list in Manager.
2. Origin allow-list — externally hosted media URLs must pass the existing
   FoleonOriginPolicy. Mitigation: validate at draft time using the same
   isAllowedFoleonUrl path used for embedUrl/publishedUrl today.
3. Backend route surface growth — five new routes increase the attack surface.
   Mitigation: route-level auth identical to existing /foleon/content routes,
   no new auth model.
4. List-threshold drift — if the assets list grows broadly across editions,
   ParentEditionLookup index keeps single-edition fetches under threshold;
   compound index only if proven necessary.
5. PS-02 visual regression — PS-03C must not change the layout. Mitigation:
   precedence is internal to the view model; existing layout tests stay green
   as the regression gate.

Prompt package for implementation:
PS-03A and PS-03B are gated on this design landing on main. PS-03C requires
PS-03A+B in tenant. Each prompt is included verbatim in §14 below for direct
copy/paste into a fresh code-agent session.
```

## 14. Copy-ready implementation prompts

### 14.1 PROMPT PS-03A — Schema, provisioning, and backend

```text
You are working in the RMF112018/hb-intel repository. Use current main as repo truth.

## Objective

Implement the Project Spotlight media-asset SharePoint list, the corresponding
schema constant, the Feature Framework provisioning artifact, the backend
Functions routes, and the type surface needed by Wave PS-03B (Manager UI) and
Wave PS-03C (reader). This wave does NOT touch the Manager UI or reader layout.

## Controlling design document

docs/architecture/plans/MASTER/spfx/foleon/phase-05/PROJECT_SPOTLIGHT_MEDIA_SCHEMA_PLAN.md

Read sections 3, 4, 5, 6, 7, and 11.PS-03A. Treat them as binding.

## Files to inspect (read-only first)

apps/hb-intel-foleon/src/schema/foleonListSchemas.ts
apps/hb-intel-foleon/sharepoint/assets/schema-content-registry.xml
apps/hb-intel-foleon/scripts/validate-foleon-feature-assets.ts
apps/hb-intel-foleon/src/types/foleon-management.types.ts
apps/hb-intel-foleon/src/services/FoleonManagementApi.ts
apps/hb-intel-foleon/src/services/FoleonContentService.ts
backend/functions/src/services/foleon-service.ts
backend/functions/src/services/__tests__/foleon-service.test.ts
docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-content-registry.md
tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1

## Required changes

1. Add a new schema constant FOLEON_PROJECT_SPOTLIGHT_MEDIA_ASSETS_SCHEMA in
   apps/hb-intel-foleon/src/schema/foleonListSchemas.ts:
   - displayName: "Foleon Project Spotlight Media Assets"
   - internalName: "HB_FoleonProjectSpotlightMediaAssets"
   - fields per design §3.2 (Title built-in; ParentEditionLookup, MediaType,
     DisplayLabel, SortRank, IsActive, AltText, FocalPointX, FocalPointY,
     Credit, VideoUrl, ThumbnailOverrideUrl, TranscriptUrl, DisplayFrom,
     DisplayThrough, AssetUrl)
   - requiredIndexedFields: ['ParentEditionLookup', 'IsActive', 'SortRank']
   - choices for MediaType: ['Image', 'Video']
   - Add to FOLEON_LIST_SCHEMAS array.
   - Add 'HB_FoleonProjectSpotlightMediaAssets' to FoleonListInternalName.

2. Add a Feature Framework provisioning artifact at
   apps/hb-intel-foleon/sharepoint/assets/schema-project-spotlight-media-assets.xml
   that mirrors the schema constant exactly. Cross-validate with
   validate-foleon-feature-assets.ts (extend the script if it does not yet
   walk this list).

3. Add a tenant-snapshot doc at
   docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-project-spotlight-media-assets.md
   following the same shape as the existing hb-foleon-content-registry.md,
   but mark "Status: design only, not yet provisioned".

4. Extend types in apps/hb-intel-foleon/src/types/foleon-management.types.ts
   - FoleonMediaType = 'image' | 'video'
   - FoleonProjectSpotlightMediaAsset (manager-side, includes etag and
     sharePointItemId)
   - FoleonProjectSpotlightMediaAssetMutation (mirror of design §3.1 minus
     identity/etag fields)
   - Mirror reader-side projection in
     packages/foleon-reader/src/types/foleon-content.types.ts (or a sibling
     file foleon-media.types.ts) with ONLY the fields the reader needs.

5. Extend the management API surface in
   apps/hb-intel-foleon/src/services/FoleonManagementApi.ts:
   - listMediaAssetsForEdition(editionId)
   - createMediaAsset(editionId, mutation)
   - updateMediaAsset(id, mutation)
   - deleteMediaAsset(id)
   - reorderMediaAssets(editionId, orderedIds: ReadonlyArray<string>)
   The contract MUST mirror existing content/placement methods (ETag, error
   envelope, request id).

6. Extend backend Functions in backend/functions/src/* to back the same five
   routes:
   - GET /foleon/content/{editionId}/media
   - POST /foleon/content/{editionId}/media
   - PATCH /foleon/media/{id}
   - DELETE /foleon/media/{id}
   - POST /foleon/content/{editionId}/media/reorder
   Reuse the existing auth/role pattern. Do NOT introduce a new auth model.

7. If the runtime needs a new registry config key
   (FoleonProjectSpotlightMediaAssetsListGuid) so the reader can resolve the
   list GUID at runtime, add it via the existing
   provision-platform-configuration-registry.ps1 pattern AND threading
   through apps/hb-webparts/src/webparts/hbHomepage/wiring/foleonHomepageConfig.ts.
   Confirm this is needed by reading how listIds.contentRegistry is threaded
   today; if the same shape suffices, skip the registry key.

## Do-not-touch

- No reader layout changes (PS-02 visual baseline locked).
- No FoleonOriginPolicy or accepted-origins changes.
- No changes to FOLEON_CONTENT_REGISTRY_SCHEMA fields, types, or indexes.
- No HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION changes (that constant tracks
  the standalone Foleon webpart, not the homepage).

## Tests required

- Unit: schema-constant shape, assertSelectFieldsInSchema and
  assertFiltersAreIndexed for the new schema, ETag round-trip on the new
  service methods, validation rules from design §3.3.
- Backend: route auth, ETag conflict, reorder atomicity.

## Validation commands

pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/functions test (or the workspace-equivalent)

## Versioning

Conditional. If the standalone Foleon webpart's runtime contract bundle
changes (new types or new service surface), bump
apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts and
apps/hb-intel-foleon/config/package-solution.json AND
apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json
in lockstep using the SharePoint 4-part schema. Confirm lockstep set by
reading the existing version-authority test for that webpart before bumping.

## Closure

Return a concise closure with:
- summary, files changed, validation commands and results, version bump (or
  why none), tenant provisioning gate (note: the new list/library is NOT
  provisioned by this commit; that is operator-pending).
```

### 14.2 PROMPT PS-03B — Manager UI / workflow

```text
You are working in the RMF112018/hb-intel repository. Use current main as repo truth.

## Objective

Implement the Project Spotlight Media Assets Manager UI on top of PS-03A's
schema and service. Add a new MediaAssetsPanel that lets admins add, edit,
reorder, and toggle active media for a Project Spotlight edition. Do NOT
change the reader layout or any sibling lane.

## Prerequisites

Wave PS-03A landed on main:
- FOLEON_PROJECT_SPOTLIGHT_MEDIA_ASSETS_SCHEMA exists.
- FoleonManagementApi exposes listMediaAssetsForEdition / createMediaAsset /
  updateMediaAsset / deleteMediaAsset / reorderMediaAssets.
- Manager + reader types for FoleonProjectSpotlightMediaAsset and its
  mutation exist.

## Controlling design document

docs/architecture/plans/MASTER/spfx/foleon/phase-05/PROJECT_SPOTLIGHT_MEDIA_SCHEMA_PLAN.md

Read sections 3, 7, 8, 10, and 11.PS-03B. Treat them as binding.

## Files to inspect (read-only first)

apps/hb-intel-foleon/src/pages/manage/SelectedLaneWorkspace.tsx
apps/hb-intel-foleon/src/pages/manage/ManageContentEditorPanel.tsx
apps/hb-intel-foleon/src/pages/manage/ManagePlacementPanel.tsx
apps/hb-intel-foleon/src/pages/manage/manageMutationUtils.ts
apps/hb-intel-foleon/src/pages/manage/ManageFieldPrimitives.tsx
apps/hb-intel-foleon/src/pages/manage/manageFields.module.css
apps/hb-intel-foleon/src/pages/manage/manageShell.module.css
apps/hb-intel-foleon/src/services/FoleonManagementApi.ts
apps/hb-intel-foleon/src/services/FoleonOriginPolicy.ts
apps/hb-intel-foleon/src/pages/manage/__tests__/manageMutationUtils.test.ts

## Required changes

1. Create apps/hb-intel-foleon/src/pages/manage/manageMediaAssetUtils.ts:
   - toMediaAssetMutation(record), mediaAssetMutationFingerprint(input).
   - validateMediaAssetMutation(args): per-row required-when rules from
     design §3.3 (image alt required, video alt required for poster, video
     URL required for video, focal point bounds + xor, sort rank ≥ 0,
     URL allowlist via FoleonOriginPolicy).
   - buildMediaAssetWarnings(args): duplicate sort ranks, missing alt text
     across active rows, orphan refs, archive/active ratio thresholds.

2. Create apps/hb-intel-foleon/src/pages/manage/MediaAssetsPanel.tsx:
   - props: contract, editionRecord, api, onRefresh, setMessage,
     canWrite, writeBlockReason.
   - reads list via api.listMediaAssetsForEdition.
   - renders an ordered list of media rows (existing primitives:
     ManageTextField, ManageSelectField, ManageCheckbox).
   - drag-handle reorder OR up/down keyboard reorder; invokes
     api.reorderMediaAssets atomically.
   - per-row save via api.updateMediaAsset; ETag-driven concurrency.
   - new-row form with mediaType pivot (image vs video) and required-when
     rules visible in the form; validation calls validateMediaAssetMutation.
   - "Copy hero image into media list" affordance: visible only when the
     edition has heroImageUrl AND the assets list is empty. Inserts one row
     with sortRank 0, isActive true, mediaType image, assetUrl set to
     editionRecord.heroImageUrl, altText empty (admin must supply before
     save).
   - alt-text-required gate: cannot save image rows with empty altText.
   - Mount only when the lane is project-spotlight; do not mount for other
     lanes.

3. Mount MediaAssetsPanel in
   apps/hb-intel-foleon/src/pages/manage/SelectedLaneWorkspace.tsx
   when the lane is 'project-spotlight'. Place it immediately below
   ManageContentEditorPanel within the same workspace section. Do not
   change the workspace shell or sibling panels.

4. Add tests in
   apps/hb-intel-foleon/src/pages/manage/__tests__/manageMediaAssetUtils.test.ts
   covering every required-when rule, the URL allowlist path, and warning
   stability.

5. Add a focused integration test that renders MediaAssetsPanel against a
   mocked api and verifies the basic user flow (add row, edit alt, reorder,
   save) without depending on the live backend.

## Do-not-touch

- No reader layout changes.
- No FoleonOriginPolicy or accepted-origins changes.
- No changes to FoleonContentMutation or FoleonContentRegistry.
- No changes to sibling lanes (Pulse, Leadership) or their workspaces.
- No HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION bump.

## Validation commands

pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon lint

## Versioning

Conditional bump of the standalone Foleon webpart manifest if the SPFx
bundle binds new entry points (drag/drop libraries, new dependencies).
Confirm via the standalone webpart's version-authority test before bumping.

## Closure

Return a concise closure with summary, files changed, validation commands
and results, version bump (or why none), and operator-pending notes (the
new list must be provisioned in tenant before the panel can read live
records).
```

### 14.3 PROMPT PS-03C — Reader / view-model consumption + hosted proof

```text
You are working in the RMF112018/hb-intel repository. Use current main as repo truth.

## Objective

Wire the @hbc/foleon-reader Project Spotlight view model to consume the
new media-assets list when present, falling back to the PS-02 edition-level
heroImageUrl/thumbnailUrl when not. Do NOT change the layout. Add a hosted-
proof marker so deploy validation can observe which media source rendered.

## Prerequisites

Waves PS-03A and PS-03B landed and the new list is provisioned in tenant.

## Controlling design document

docs/architecture/plans/MASTER/spfx/foleon/phase-05/PROJECT_SPOTLIGHT_MEDIA_SCHEMA_PLAN.md

Read sections 7, 9, and 11.PS-03C. Treat them as binding.

## Files to inspect (read-only first)

packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/services/FoleonReaderContentService.ts
packages/foleon-reader/src/types/foleon-content.types.ts
packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts
packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx
packages/foleon-reader/src/readers/__tests__/SourceMarkerProof.test.ts
apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
apps/hb-homepage/config/package-solution.json
apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
packages/homepage-launcher/src/constants.ts

## Required changes

1. Extend FoleonReaderContentService.ts (or a new sibling service):
   - fetchProjectSpotlightMediaAssets(editionId, signal) returns
     ReadonlyArray<FoleonProjectSpotlightMediaAsset> filtered by IsActive
     and ordered by SortRank.
   - The list GUID resolves the same way as the content registry list
     (reuse the existing IFoleonRuntimeContract.listIds shape; add a
     projectSpotlightMediaAssets entry if needed). Coordinate with the
     PS-03A registry-key decision.

2. Update buildReadyProjectMedia in
   packages/foleon-reader/src/readers/FoleonReaderViewModel.ts so that:
   - When the assets fetch returns one or more active items: primary =
     first IMAGE in SortRank order; thumbnail = next image (or first video
     thumbnailOverrideUrl) when distinct; accessibleLabel = altText from
     the chosen primary record (NOT the generated fallback).
   - When the assets fetch returns empty OR fails: use the existing
     PS-02 fallback path (heroImageUrl || thumbnailUrl, generated
     accessibleLabel).
   - Add a new field projectMedia.source: 'assets-list' | 'edition-fallback'.

3. Surface the source through a stable hosted-proof marker on the rendered
   card:
   - The layout file MUST stay visually unchanged. Add ONLY a
     data-foleon-media-source={source} attribute to the existing card
     wrapper. No CSS, no copy, no structural change.
   - Update SourceMarkerProof.test.ts to assert the new marker literal is
     present in source.

4. Tests:
   - View-model precedence: assets-list-first, fallback-second.
   - View-model uses altText from the chosen asset record.
   - Layout test asserts data-foleon-media-source carries the expected
     value in both states.
   - PS-02 hosted-proof tests still pass.

5. Version-authority lockstep bump if the SPFx bundle changes:
   - apps/hb-homepage/config/package-solution.json (solution + features[0])
   - apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
   - apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
   - packages/homepage-launcher/src/constants.ts (HOMEPAGE_LAUNCHER_VERSION)
   Use the SharePoint 4-part schema. Confirm via
   apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepagePackageAuthority.test.ts.
   Do NOT bump HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION.

## Do-not-touch

- No layout structural changes (PS-02 baseline locked).
- No accepted-origins or FoleonOriginPolicy changes.
- No FoleonContentRegistry schema changes; heroImageUrl / thumbnailUrl
  stay as edition-level compatibility fields.
- No sibling lane changes.

## Validation commands

pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
pnpm --filter @hbc/homepage-launcher check-types

## Closure

Return a concise closure with summary, files changed, validation commands
and results, version bump (lockstep set), and a hosted-proof statement
naming the new data-foleon-media-source marker. Operator-pending: tenant
proof that the assets list resolves at runtime — note this explicitly,
do not overclaim hosted reality.
```
