# Project Spotlight Media Schema / Content Model Plan (PS-03)

> **Status:** design and audit only. No source, schema, list, or provisioning changes are produced by this document. Implementation lands in PS-03A / PS-03B / PS-03C, each with its own copy-ready prompt at the end of this file.
>
> **Revision (Foleon-as-source-of-truth correction):** an earlier draft of this plan modeled rich media as a SharePoint-side concern with a new media-assets list and a document library. That direction is rejected. The Project Spotlight homepage card launches or displays Foleon documents; rich media (images, video, galleries, captions, alt text, transcripts, credits, focal points, cropping) is authored and governed inside Foleon. SharePoint stores only the placement/governance metadata required to surface a Foleon document on the homepage.

## 1. Context and accepted baseline

PS-02 (commit `1d8c6436a`, HB Homepage `1.1.88.0`) is the accepted Project Spotlight visual baseline. The Project Spotlight Foleon lane is now an employee-facing visual showcase that consumes the existing edition-level `FoleonContentRecord` fields:

- `title`, `summary`, `cadence`
- `heroImageUrl`, `thumbnailUrl`
- `region`, `sector`, `relatedProjectName`
- `embedUrl`, `publishedUrl`, `allowEmbed`, `requiresExternalOpen`

PS-03 does **not** redesign this layout.

### Foleon-as-source-of-truth principle

The remaining product gap is reliable rich-media presentation on the homepage card and the launched Foleon viewer. That gap is closed by **authoring inside Foleon**, not by storing assets in SharePoint:

- Foleon owns: images, video, galleries, captions, alt text, transcripts, credits, focal points, cropping, narrative copy.
- SharePoint owns: which Foleon document is on the homepage, in what order, with what governance (active/visible/eligible), under which display window, with which optional editorial override copy.

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
| Foleon doc ID | `FoleonDocId` | Number req | yes (unique) | `foleonDocId` | `foleonDocId` | none |
| Foleon doc UID | `FoleonDocUid` | Text | no | `foleonDocUid` | not in `FoleonContentMutation` | drift — sync-managed today |
| Foleon identifier | `FoleonIdentifier` | Text | no | `foleonIdentifier` | not in `FoleonContentMutation` | drift — sync-managed today |
| Hero image URL | `HeroImageUrl` | Hyperlink | no | `heroImageUrl` | not in `FoleonContentMutation` | **drift — Manager cannot mutate; sync-managed only** |
| Thumbnail URL | `ThumbnailUrl` | Hyperlink | no | `thumbnailUrl` | `thumbnailUrl` | none |
| Embed URL | `EmbedUrl` | Hyperlink | no | `embedUrl` | `embedUrl` | none |
| Published URL | `PublishedUrl` | Hyperlink | no | `publishedUrl` | `publishedUrl` | none |
| Preview URL | `PreviewUrl` | Hyperlink | no | `previewUrl` | not in `FoleonContentMutation` | drift — admin-only |
| Project number | `RelatedProjectNumber` | Text | no | `relatedProjectNumber` | not in `FoleonContentMutation` | drift |
| Project name | `RelatedProjectName` | Text | no | `relatedProjectName` | not in `FoleonContentMutation` | drift |
| Region | `Region` | Choice | no | `region` | `region` | none |
| Sector | `Sector` | Choice | no | `sector` | `sector` | none |
| Audience | `PrimaryAudience` | Choice | no | `primaryAudience` | `primaryAudience` | none |
| Cadence | `Cadence` | Choice | no | `cadence` | `cadence` | none |
| Archive group | `ArchiveGroup` | Text | yes | `archiveGroup` | `archiveGroup` | none |
| Active edition | `ActiveEdition` | Boolean | yes | `activeEdition` | `activeEdition` | none |
| Display window | `DisplayFrom` / `DisplayThrough` | DateTime | yes / yes | `displayFrom` / `displayThrough` | same | none |
| Sort/order | `SortRank` | Number | yes | `sortRank` | not in `FoleonContentMutation` | drift |

**Drift notes load-bearing for PS-03:** `HeroImageUrl` is sync-managed today (the Foleon sync writes the cover URL). The Manager cannot directly mutate it. PS-03 keeps that contract. The Manager's optional override path is `EditorialOverrideCopy` (text), not `HeroImageUrl` (URL). Other drift (`previewUrl`, `relatedProjectName`, `relatedProjectNumber`, `sortRank`) is logged but out of PS-03 scope.

## 3. Optional Content Registry extensions

PS-03 does **not** introduce a new SharePoint list and does **not** introduce a SharePoint document library. The default path is **no schema change**. Only when product confirms the need do the following extensions land:

### 3.1 `EditorialOverrideCopy` (Note, optional)

Homepage-card override copy distinct from `Summary`. Use cases:
- Editorial team wants to write a tighter, more employee-facing teaser for the homepage card without rewriting the Foleon-side `Summary`.
- The Foleon-side `Summary` is too long, too marketing-flavored, or the wrong audience tone for the homepage card.

Behavior:
- When `EditorialOverrideCopy` is non-empty, the homepage card teaser uses it.
- When empty or absent, the homepage card teaser falls back to `Summary` (current PS-02 behavior).
- The Foleon document itself, when launched, is unchanged — the override is homepage-card-only.

SharePoint shape: `Internal name: EditorialOverrideCopy`, `Type: Note (multi-line plain text)`, `Required: false`, `Indexed: false`.

### 3.2 `ParentSpotlightLookup` (Lookup → self, optional)

Lookup field on `HB_FoleonContentRegistry` pointing back at `HB_FoleonContentRegistry` itself. Lets a Project Spotlight edition declare child Foleon document records that should appear together as a multi-card gallery on the homepage.

Use cases:
- A featured project ships several Foleon documents (e.g. main story, photo essay, project-team interview) and the homepage card needs to surface a small gallery of related Foleon launches under the parent spotlight.
- The existing `ArchiveGroup` text field is a loose grouping key; a typed lookup is firmer and supports cross-edition queries.

Behavior:
- When `ParentSpotlightLookup` is set, the row is treated as a child of the parent spotlight edition for homepage-gallery purposes.
- When unset, the row is independent (current behavior).
- Reader-side multi-card gallery is itself optional and gated on PS-03B + PS-03C; PS-03A only adds the field.

SharePoint shape: `Internal name: ParentSpotlightLookup`, `Type: Lookup`, `lookupTarget: HB_FoleonContentRegistry`, `Required: false`, `Indexed: true` (single-edition fetch must stay threshold-safe).

### 3.3 What is explicitly NOT added

- No `MediaType` / `AltText` / `FocalPointX` / `FocalPointY` / `Credit` / `VideoUrl` / `ThumbnailOverrideUrl` / `TranscriptUrl` / `AssetUrl` field. Those concerns are Foleon-owned and are authored inside Foleon. SharePoint will not duplicate them.
- No new SharePoint list (`HB_FoleonProjectSpotlightMediaAssets` is rejected — see §4).
- No SharePoint document library (`HB_FoleonProjectSpotlightMedia` is rejected — see §4).
- No JSON column on `HB_FoleonContentRegistry` for embedded media items.

## 4. Storage strategy options

| # | Option | Verdict |
|---|---|---|
| a | Registry-only with no schema change. Use existing `HB_FoleonContentRegistry` fields exactly as they are; the homepage card consumes `heroImageUrl`/`thumbnailUrl` plus the existing edition-level metadata. | **Default recommendation.** |
| b | Registry-only with optional `EditorialOverrideCopy` (Note) and/or `ParentSpotlightLookup` (Lookup → self) added. | **Tier-up only when product confirms editorial override or multi-card gallery is required.** |
| c | New SharePoint list `HB_FoleonProjectSpotlightMediaAssets` for ordered metadata. | **Rejected.** Duplicates Foleon-owned authoring concerns into SharePoint and creates a second source of truth for media. |
| d | SharePoint document library `HB_FoleonProjectSpotlightMedia` for binary uploads. | **Rejected.** Foleon manages binary media; SharePoint must not duplicate that lifecycle. Reserved for a hypothetical future requirement that explicitly calls for non-Foleon homepage-specific binary uploads. |
| e | JSON column on `HB_FoleonContentRegistry` carrying embedded media items. | **Rejected.** Same duplication concern as (c); also unindexable. |

## 5. Recommended strategy

**Option (a) — registry-only with no schema change — is the default.** The PS-02 baseline already consumes the necessary edition-level fields (`heroImageUrl`, `thumbnailUrl`, `summary`, `cadence`, `region`, `sector`, `relatedProjectName`, `embedUrl`, `publishedUrl`, `allowEmbed`, `requiresExternalOpen`). For a single-Foleon-document Project Spotlight surface, no schema change is needed.

**Tier-up to option (b) is gated on explicit product approval.** PS-03A's scope shrinks accordingly:
- If product confirms editorial override copy is required, PS-03A adds `EditorialOverrideCopy` only.
- If product confirms multi-card gallery is required, PS-03A adds `ParentSpotlightLookup` only.
- If neither is required, PS-03A is **deferred indefinitely** and PS-03 closes with the design-only product of this document.

In every case, Foleon is the source of truth for rich media. The cover image displayed on the homepage card is the cover image authored in Foleon and surfaced via `HeroImageUrl` / `ThumbnailUrl` at sync time. SharePoint is a placement/governance overlay, not a media store.

## 6. List-threshold and indexing guidance

The default path adds zero new indexes. The Content Registry's existing indexing posture (`FoleonDocId`, `ReaderKey`, `HomepageSlot`, `ArchiveGroup`, `ActiveEdition`, `LastEditorialUpdate`, `PublishStatus`, `IsVisible`, `IsHomepageEligible`, `PublishedOn`, `DisplayFrom`, `DisplayThrough`, `SortRank`, `AllowEmbed`, `SyncSource`) already covers single-edition reads at threshold-safe scale.

If `ParentSpotlightLookup` is added (option b), index it at provisioning. The `requiredIndexedFields` array on `FOLEON_CONTENT_REGISTRY_SCHEMA` should include `ParentSpotlightLookup` so a "find children of parent X" query is single-column-indexed.

`EditorialOverrideCopy` (Note) is not indexable in any useful way and is not added to `requiredIndexedFields`.

No compound indexes are introduced.

## 7. Migration / backfill strategy

- **`heroImageUrl` and `thumbnailUrl` stay** as edition-level fallback/override URL fields. They may store a Foleon-served cover URL extracted at sync time (preferred) or an externally-pasted HTTPS URL (admin override). They are not deprecated and are not removed.
- **No automated migration** is required for shipping registry-only behavior. Editions with existing values continue to render via PS-02.
- **If `EditorialOverrideCopy` lands**, no backfill is required. Empty rows render via the existing `Summary` fallback path; the override is opt-in per edition.
- **If `ParentSpotlightLookup` lands**, no backfill is required. Rows without a parent lookup remain independent. Manager UI may surface an opt-in "group with active spotlight" affordance.
- **Foleon sync hardening** (PS-03A scope when option b lands): the Foleon sync service should reliably populate `HeroImageUrl` / `ThumbnailUrl` from Foleon-API metadata at sync time so the homepage card has a cover image without manual paste. Sync-hash drift detection ensures a republished Foleon document re-syncs the cover URL.

## 8. Manager UI requirements

There is **no new Media tab** in the Manager. There is **no upload UX**. There is **no alt-text editor**. Rich-media authoring lives in Foleon, not in the Manager.

The Manager surface changes only if option (b) lands, and only narrowly:

- **`EditorialOverrideCopy` field on the existing `ManageContentEditorPanel`** (`apps/hb-intel-foleon/src/pages/manage/ManageContentEditorPanel.tsx`). Renders below the existing `Summary` field using the same `ManageTextField` primitive (multi-line). Validation: optional, max length consistent with the registry Note column. The override copies to `FoleonContentMutation.editorialOverrideCopy` and round-trips through the existing `updateContent` route.
- **"Related Foleon documents" panel** mounted in `apps/hb-intel-foleon/src/pages/manage/SelectedLaneWorkspace.tsx` only when the lane is `project-spotlight` and the active edition has at least one record pointing at it via `ParentSpotlightLookup`. Renders a sortable list of child Content Registry rows. Each row carries the Foleon doc title, `IsActive` toggle, and a sort-rank up/down control. There are no media-asset-specific fields, no upload, no alt text, no focal point.

Both surfaces compose existing primitives in `ManageFieldPrimitives.tsx` and follow the existing `manageMutationUtils.ts` patterns (mutation/fingerprint/validation triple). Backend mutation goes through the existing `/foleon/content/{id}` route — no new route surface unless the parent-lookup grouping requires a "list children of parent" read endpoint, in which case a single thin route is added.

## 9. Reader / view-model consumption strategy

**Single-document Project Spotlight requires no reader change beyond the PS-02 baseline.** The homepage card already consumes `record.heroImageUrl` / `record.thumbnailUrl` for the media stage and `record.summary` for the teaser.

If option (b) lands:

- **`EditorialOverrideCopy` precedence** (PS-03B-side wiring is enough for this; reader change is trivial). Either the Manager API returns a precomputed `summary` that is `EditorialOverrideCopy ?? Summary`, or the reader-side adapter applies the precedence inside `createReadyFoleonReaderViewModel`. Default: do the precedence in the reader adapter so the Manager mutation surface stays single-purpose. The PS-02 layout is untouched — it reads `viewModel.summary`.
- **Multi-card gallery** (deferred). If/when a multi-card gallery is required, the reader-side service fetches Content Registry rows with `ParentSpotlightLookup === activeSpotlightId AND IsActive === true` ordered by `SortRank`, projects each into a thin gallery card, and exposes them on a new `viewModel.gallery: ReadonlyArray<GalleryCard>` field. The PS-02 single-card layout remains the default; gallery rendering is a separate, deferred layout decision (not part of PS-03C unless explicitly approved).

The PS-02 honest-fallback rule for accessible labels is preserved. The reader's generated label (`"Project Spotlight image for {title}"`) remains a fallback only — never represented as editorial alt text. Editorial alt text, when authored, lives inside Foleon and is presented when the Foleon document is launched.

## 10. Test and validation surface

### 10.1 Default path (option a)

No new tests. The PS-02 layout tests, `SourceMarkerProof.test.ts`, view-model tests, and version-authority lockstep tests are the regression gate.

### 10.2 If `EditorialOverrideCopy` lands

- Schema: `assertSelectFieldsInSchema` covers the new column; `assertFiltersAreIndexed` accepts the same default filter set (no filtering on the new column).
- Manager: `validateFoleonContentWorkflow` accepts the new optional field; round-trip via `toContentMutation` / `contentMutationFingerprint` preserves it.
- Reader: precedence test — `viewModel.summary === record.editorialOverrideCopy` when set, else `record.summary`.
- Integration: Manager edits the override copy, saves, the homepage card teaser reflects the override.

### 10.3 If `ParentSpotlightLookup` lands

- Schema: `assertFiltersAreIndexed` accepts `ParentSpotlightLookup` as an indexed filter target.
- Manager: "Related Foleon documents" panel reads the children list, toggles active, reorders. ETag round-trip on each child mutation.
- Reader: deferred (gallery layout is a separate decision).

### 10.4 Regression gates (always)

- PS-02 hosted-proof markers in `SourceMarkerProof.test.ts` stay green.
- `ProjectSpotlightReaderLayout.test.tsx`, `FoleonReaderModule.test.tsx`, `FoleonReaderViewModel.test.ts` stay green.
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepagePackageAuthority.test.ts` stays green (no version churn unless explicitly bundled in PS-03C).

## 11. Implementation waves

PS-03 splits into three sequenced (and individually optional) waves. Each wave's copy-ready prompt is included in §14.

### Wave PS-03A — Optional Content Registry extension and Foleon sync hardening

Scope (gated on product approval):
- Optional `EditorialOverrideCopy` Note field on `HB_FoleonContentRegistry`.
- Optional `ParentSpotlightLookup` self-Lookup field on `HB_FoleonContentRegistry`.
- Foleon sync service hardening so `HeroImageUrl` / `ThumbnailUrl` are reliably populated from Foleon API metadata at sync time, with sync-hash drift detection on cover-URL change.
- Schema constant updates in `apps/hb-intel-foleon/src/schema/foleonListSchemas.ts`.
- Feature Framework provisioning artifact updates (the existing `schema-content-registry.xml` gains the new fields).
- Optional registry-key for any new field if runtime exposure is required (likely none — the reader already gets the full record shape).
- Tenant-snapshot doc update in `docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-content-registry.md`.

If neither field is approved by product, PS-03A is deferred indefinitely and PS-03 closes with this document.

### Wave PS-03B — Optional Manager UI

Scope (gated on PS-03A landing):
- `EditorialOverrideCopy` field on `ManageContentEditorPanel` if PS-03A added it.
- "Related Foleon documents" panel on `SelectedLaneWorkspace` if PS-03A added `ParentSpotlightLookup`.
- Mutation utility updates in `manageMutationUtils.ts` (round-trip the new field; warning surface for parent-lookup orphans).
- Tests.

### Wave PS-03C — Optional reader / view-model wiring

Scope (gated on PS-03B landing):
- `EditorialOverrideCopy` precedence in `createReadyFoleonReaderViewModel` (`viewModel.summary` prefers the override when set).
- Multi-card gallery view-model + reader-side service (deferred until product explicitly approves a gallery layout).
- Hosted-proof marker on the rendered card (`data-foleon-summary-source="override" | "summary"`) so deploy validation can see which path is live.
- Version-authority lockstep bump if the SPFx bundle changes.

## 12. Preview-polish follow-ups (logged, not implemented)

These belong to a tiny separate prompt after PS-03 ships, not to PS-03 itself:
- **Replace or omit `Sample location` / `Sample market`** placeholder values in the Spotlight preview state. Decide whether to omit chips entirely in preview, or use editorial-honest sample copy (e.g. `Florida coast`, `Luxury Residential`) that does not look like real production data.
- **Disabled preview CTA pill contrast / state copy.** Audit the disabled-state CTA pill on the gradient placeholder for legibility at small viewports; tighten copy so the disabled-vs-enabled distinction is obvious without color reliance.

## 13. Closure

```text
Summary:
PS-03 delivers the design and audit package required to support a media-rich
Project Spotlight without redesigning the PS-02 visual baseline and without
duplicating Foleon-owned media authoring into SharePoint. The default path
is registry-only with no schema change. Optional Content Registry extensions
(EditorialOverrideCopy and/or ParentSpotlightLookup) tier up only when
product confirms a need. Foleon owns rich media. SharePoint owns
placement/governance metadata.

Current schema truth:
HB_FoleonContentRegistry (list ID 2e57615d-457e-49b8-aef3-038e85cbe068)
remains authoritative. Code source of truth is
apps/hb-intel-foleon/src/schema/foleonListSchemas.ts. HeroImageUrl is
sync-managed (Manager cannot mutate it; the Foleon sync writes the cover
URL). ThumbnailUrl is mutable. Drift between manager and reader on
heroImageUrl, previewUrl, relatedProjectName, relatedProjectNumber,
sortRank is logged but out of PS-03 scope.

Recommended media model:
Foleon-as-source-of-truth. Default = registry-only, no schema change. The
homepage card consumes the existing Content Registry fields exactly as in
PS-02. If product confirms editorial override is required, add an optional
EditorialOverrideCopy (Note) field. If product confirms multi-card gallery
is required, add an optional ParentSpotlightLookup (Lookup → self) field
indexed at provisioning. No new SharePoint list, no document library, no
binary upload UX, no alt-text/focal-point/credit/transcript fields in
SharePoint.

Implementation waves:
PS-03A — optional Content Registry extension (EditorialOverrideCopy and/or
        ParentSpotlightLookup) plus Foleon sync hardening for cover URL
        extraction. Deferred indefinitely if neither field is approved.
PS-03B — optional Manager UI (override-copy field, related-Foleon-documents
        panel). Gated on PS-03A.
PS-03C — optional reader / view-model wiring (override-copy precedence,
        deferred gallery). Gated on PS-03B. Includes the SPFx version
        lockstep bump if the bundle changes.

Files likely to change (only if waves land):
PS-03A:
  apps/hb-intel-foleon/src/schema/foleonListSchemas.ts
  apps/hb-intel-foleon/sharepoint/assets/schema-content-registry.xml
  apps/hb-intel-foleon/scripts/validate-foleon-feature-assets.ts
  apps/hb-intel-foleon/src/types/foleon-management.types.ts
  apps/hb-intel-foleon/src/services/FoleonContentService.ts
  apps/hb-intel-foleon/src/services/FoleonManagementApi.ts (only if a "list
    children of parent" route is required)
  packages/foleon-reader/src/types/foleon-content.types.ts
  packages/foleon-reader/src/services/FoleonReaderContentService.ts
  backend/functions/src/services/foleon-service.ts (sync hardening)
  docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-content-registry.md
PS-03B:
  apps/hb-intel-foleon/src/pages/manage/ManageContentEditorPanel.tsx
  apps/hb-intel-foleon/src/pages/manage/SelectedLaneWorkspace.tsx (only if
    parent-lookup grouping ships)
  apps/hb-intel-foleon/src/pages/manage/manageMutationUtils.ts
  apps/hb-intel-foleon/src/pages/manage/__tests__/manageMutationUtils.test.ts
PS-03C:
  packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
  packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts
  packages/foleon-reader/src/readers/__tests__/SourceMarkerProof.test.ts
  apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
  apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
  apps/hb-homepage/config/package-solution.json
  packages/homepage-launcher/src/constants.ts

Provisioning impact:
Default path: zero. The default option (a) needs no provisioning change.
If PS-03A adds EditorialOverrideCopy and/or ParentSpotlightLookup, those
columns are added to the existing HB_FoleonContentRegistry list via the
Feature Framework artifact — no new list, no new library. Tenant rollout
follows the same controlled provisioning path used for prior Foleon
schema additions. ParentSpotlightLookup must be indexed at provisioning.

Risks:
1. Foleon API availability — cover/thumbnail extraction at sync time may
   fail or rate-limit, leaving the homepage card without an image.
   Mitigation: Foleon sync hardening in PS-03A; surface a Manager warning
   when an active spotlight has no HeroImageUrl/ThumbnailUrl.
2. Foleon-served URL stability — when a Foleon document is republished,
   its cover URL may change. Mitigation: SyncHash drift detection re-runs
   the sync and updates HeroImageUrl/ThumbnailUrl; the registry stores the
   latest URL and the reader follows.
3. Foleon-side authoring quality — if a Foleon document is authored
   without a cover image, the homepage card falls back to the polished
   gradient placeholder (PS-02 already handles this honestly).
   Mitigation: Manager surfaces a "no cover image authored in Foleon"
   warning so editorial can request a cover.
4. Authoring drift between Foleon-side Summary and SharePoint-side
   EditorialOverrideCopy. Mitigation: Manager UI shows both side-by-side
   when the override is set; precedence rule is documented in code and
   in this design doc.
5. ParentSpotlightLookup orphan rows (children pointing at a deleted
   parent). Mitigation: a Manager warning rule, plus a one-time admin
   cleanup affordance if the volume warrants it.
Removed risks: SharePoint document-library binary governance (no longer
applicable); SharePoint media-list threshold pressure (no list created).

Prompt package for implementation:
Each of PS-03A, PS-03B, PS-03C is included verbatim in §14 below for
direct copy/paste into a fresh code-agent session. PS-03A is gated on
product approval of EditorialOverrideCopy and/or ParentSpotlightLookup;
without that approval, PS-03A is deferred and PS-03B/C do not run.
```

## 14. Copy-ready implementation prompts

### 14.1 PROMPT PS-03A — Optional Content Registry extension and Foleon sync hardening

```text
You are working in the RMF112018/hb-intel repository. Use current main as
repo truth. This wave is GATED on product approval for EditorialOverrideCopy
and/or ParentSpotlightLookup. If neither is approved, do not run this prompt.

## Objective

Extend the existing HB_FoleonContentRegistry list with optional fields the
Project Spotlight homepage card may consume, and harden Foleon sync so
HeroImageUrl / ThumbnailUrl reliably reflect the current Foleon-authored
cover image. Do NOT introduce a new SharePoint list. Do NOT introduce a
document library. Do NOT model rich media (alt text, focal point,
transcripts, credits, video URL, asset URL) in SharePoint — those concerns
live inside Foleon.

## Controlling design document

docs/architecture/plans/MASTER/spfx/foleon/phase-05/PROJECT_SPOTLIGHT_MEDIA_SCHEMA_PLAN.md

Read sections 3, 5, 6, 7, and 11.PS-03A. Treat them as binding.

## Files to inspect (read-only first)

apps/hb-intel-foleon/src/schema/foleonListSchemas.ts
apps/hb-intel-foleon/sharepoint/assets/schema-content-registry.xml
apps/hb-intel-foleon/scripts/validate-foleon-feature-assets.ts
apps/hb-intel-foleon/src/types/foleon-management.types.ts
apps/hb-intel-foleon/src/services/FoleonContentService.ts
apps/hb-intel-foleon/src/services/FoleonManagementApi.ts
backend/functions/src/services/foleon-service.ts
backend/functions/src/services/__tests__/foleon-service.test.ts
docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-content-registry.md
packages/foleon-reader/src/types/foleon-content.types.ts
packages/foleon-reader/src/services/FoleonReaderContentService.ts

## Required changes (only the approved subset)

1. If EditorialOverrideCopy is approved:
   - Add field to FOLEON_CONTENT_REGISTRY_SCHEMA in foleonListSchemas.ts:
     internalName: 'EditorialOverrideCopy', type: 'Note', required: false,
     indexedAtProvisioning: false. Do NOT add to requiredIndexedFields.
   - Add to schema-content-registry.xml provisioning artifact.
   - Extend FoleonManagedContent + FoleonContentMutation in
     foleon-management.types.ts with editorialOverrideCopy?: string.
   - Extend FoleonContentRecord in
     packages/foleon-reader/src/types/foleon-content.types.ts with
     editorialOverrideCopy?: string.
   - Extend the manager service mapping (FoleonContentService.ts) and the
     reader service mapping (FoleonReaderContentService.ts) to
     read/write/round-trip the new field.
   - Update tenant-snapshot doc.

2. If ParentSpotlightLookup is approved:
   - Add field to FOLEON_CONTENT_REGISTRY_SCHEMA: internalName
     'ParentSpotlightLookup', type 'Lookup', lookupTarget
     'HB_FoleonContentRegistry', required false, indexedAtProvisioning
     true. Add 'ParentSpotlightLookup' to requiredIndexedFields.
   - Add to schema-content-registry.xml provisioning artifact (Lookup with
     List="{HB_FoleonContentRegistry guid}" via Feature Framework
     placeholder).
   - Extend FoleonManagedContent with parentSpotlightId?: number.
   - Extend FoleonContentRecord with parentSpotlightId?: number.
   - Extend service mappings to read/write the lookup. SharePoint REST
     returns this as ParentSpotlightLookupId on the item.
   - If the Manager needs a "list children of parent" read endpoint, add
     a thin route at GET /foleon/content/{editionId}/related on the
     backend. The route filters HB_FoleonContentRegistry by
     ParentSpotlightLookupId eq {editionId}.
   - Update tenant-snapshot doc.

3. Foleon sync hardening (do this regardless of which fields are approved):
   - Verify the Foleon sync writes HeroImageUrl and ThumbnailUrl from
     Foleon API metadata when available. If the current sync omits one or
     the other, fix that. Use the existing SyncHash drift detection to
     trigger a re-sync when the Foleon-side cover URL changes.
   - Add (or strengthen) a backend test that proves a republished Foleon
     document re-syncs HeroImageUrl/ThumbnailUrl.

## Do-not-touch

- No reader layout changes (PS-02 visual baseline locked).
- No FoleonOriginPolicy or accepted-origins changes.
- No new SharePoint list. No document library.
- No alt-text, focal-point, credit, transcript, video-URL, asset-URL
  fields in SharePoint. Those are Foleon-owned.
- No HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION change (that constant tracks
  the standalone Foleon webpart and is not affected by this wave).

## Tests required

- Schema: assertSelectFieldsInSchema covers any added fields;
  assertFiltersAreIndexed accepts ParentSpotlightLookup if added.
- Manager: ETag round-trip of the new optional fields through
  toContentMutation / contentMutationFingerprint /
  validateFoleonContentWorkflow.
- Backend: sync test proving cover-URL refresh on republish.

## Validation commands

pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/functions test (or workspace-equivalent)

## Versioning

Conditional. If the standalone Foleon webpart's runtime contract bundle
changes (new types or new service surface), bump the Foleon webpart
manifest + package-solution + runtimeContract version in lockstep using
the SharePoint 4-part schema. Confirm the lockstep set by reading the
existing version-authority test for that webpart before bumping. Do NOT
bump the homepage webpart version in this wave.

## Closure

Return a concise closure with summary, files changed, validation commands
and results, version bump (or why none), and tenant-provisioning gate
(the new fields are NOT live in tenant by this commit; that is
operator-pending).
```

### 14.2 PROMPT PS-03B — Optional Manager UI

```text
You are working in the RMF112018/hb-intel repository. Use current main as
repo truth. This wave is GATED on PS-03A landing on main with at least one
of EditorialOverrideCopy or ParentSpotlightLookup live.

## Objective

Surface the optional Content Registry extensions in the Foleon Manager:
add a homepage-card editorial override field to the existing content
editor, and (if parent-lookup shipped) add a thin "Related Foleon
documents" panel that lets admins attach child Foleon document records to
the active Project Spotlight edition. Do NOT introduce a new media tab,
upload UX, alt-text editor, or any rich-media authoring surface — that
lives in Foleon.

## Prerequisites

PS-03A landed:
- FOLEON_CONTENT_REGISTRY_SCHEMA includes the approved field(s).
- FoleonContentMutation carries editorialOverrideCopy and/or
  parentSpotlightId.
- Backend round-trips the new field(s).

## Controlling design document

docs/architecture/plans/MASTER/spfx/foleon/phase-05/PROJECT_SPOTLIGHT_MEDIA_SCHEMA_PLAN.md

Read sections 3, 7, 8, 10, and 11.PS-03B. Treat them as binding.

## Files to inspect (read-only first)

apps/hb-intel-foleon/src/pages/manage/ManageContentEditorPanel.tsx
apps/hb-intel-foleon/src/pages/manage/SelectedLaneWorkspace.tsx
apps/hb-intel-foleon/src/pages/manage/manageMutationUtils.ts
apps/hb-intel-foleon/src/pages/manage/ManageFieldPrimitives.tsx
apps/hb-intel-foleon/src/pages/manage/manageFields.module.css
apps/hb-intel-foleon/src/pages/manage/manageShell.module.css
apps/hb-intel-foleon/src/services/FoleonManagementApi.ts
apps/hb-intel-foleon/src/pages/manage/__tests__/manageMutationUtils.test.ts

## Required changes (only the approved subset)

1. If EditorialOverrideCopy was added in PS-03A:
   - In ManageContentEditorPanel.tsx, add an EditorialOverrideCopy field
     below the existing Summary field using the same multi-line
     ManageTextField primitive. Label: "Homepage card override copy
     (optional)". Helper text: "Used by the homepage card teaser when
     set. Falls back to Summary when empty."
   - Round-trip the field through toContentMutation /
     contentMutationFingerprint in manageMutationUtils.ts.
   - Validation: optional; warn (do not block) when override is
     significantly longer than Summary or when it contains markup.

2. If ParentSpotlightLookup was added in PS-03A:
   - Mount a new RelatedFoleonDocumentsPanel inside SelectedLaneWorkspace
     when laneVm.lane === 'project-spotlight' AND there is at least one
     Content Registry row whose parentSpotlightId equals the active
     edition's sharePointItemId.
   - Panel renders a sortable list of child rows (existing primitives:
     ManageTextField for re-ordering by SortRank, ManageCheckbox for
     IsActive). Each row carries the child row's title, FoleonDocId,
     PublishStatus, IsActive, SortRank.
   - Mutations route through the existing api.updateContent for each
     child row. Order changes update each child's SortRank atomically by
     issuing the mutations in sequence — a dedicated reorder route is NOT
     introduced unless backend testing proves the per-row path is
     unsafe.
   - Add a "Group with active spotlight" affordance on Content Registry
     rows that match the current spotlight's contentTypeKey but have no
     parentSpotlightId yet. Setting it writes parentSpotlightId =
     activeSpotlight.sharePointItemId.
   - Warning surface: orphan child (parent deleted), duplicate sort
     ranks, child contentTypeKey mismatch.

3. Tests: extend
   apps/hb-intel-foleon/src/pages/manage/__tests__/manageMutationUtils.test.ts
   for the new field round-trip and the warning rules.

## Do-not-touch

- No reader layout changes.
- No FoleonOriginPolicy or accepted-origins changes.
- No new SharePoint list. No document library. No upload UX.
- No alt-text, focal-point, credit, transcript, video-URL, asset-URL
  fields anywhere.
- No sibling lane changes (Pulse, Leadership).
- No HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION bump.

## Validation commands

pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon lint

## Versioning

Conditional bump of the standalone Foleon webpart manifest if the SPFx
bundle's exported entry points change. Confirm via the standalone
webpart's version-authority test before bumping.

## Closure

Return a concise closure with summary, files changed, validation commands
and results, version bump (or why none), and operator-pending notes.
```

### 14.3 PROMPT PS-03C — Optional reader / view-model wiring + hosted proof

```text
You are working in the RMF112018/hb-intel repository. Use current main as
repo truth. This wave is GATED on PS-03B landing.

## Objective

Wire the @hbc/foleon-reader Project Spotlight view model to consume the
optional EditorialOverrideCopy when present, falling back to record.summary
otherwise. Add a hosted-proof marker so deploy validation can observe which
copy source rendered. Do NOT change the layout. Do NOT ship multi-card
gallery rendering — that is deferred and not part of PS-03C unless product
explicitly approves it as a distinct PS-03D wave.

## Prerequisites

PS-03A and PS-03B landed; the optional field(s) are live in tenant.

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
apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepagePackageAuthority.test.ts

## Required changes

1. In createReadyFoleonReaderViewModel
   (packages/foleon-reader/src/readers/FoleonReaderViewModel.ts), when the
   lane is projectSpotlight, set:
     summary = record.editorialOverrideCopy && record.editorialOverrideCopy.trim().length > 0
       ? record.editorialOverrideCopy
       : record.summary;
   The PS-02 layout reads viewModel.summary unchanged.

2. Surface the source through a stable hosted-proof marker on the
   rendered card in ProjectSpotlightReaderLayout.tsx. The layout file
   MUST stay visually unchanged. Add ONLY a new attribute on the existing
   article-card wrapper:
     data-foleon-summary-source="override" | "summary"
   No CSS, no copy, no structural change.

3. Update SourceMarkerProof.test.ts to assert the new marker literal is
   present in source.

4. Tests:
   - View-model precedence: override-when-present, summary-otherwise.
   - Layout test asserts data-foleon-summary-source carries the expected
     value in both states.
   - PS-02 hosted-proof tests stay green.

5. Version-authority lockstep bump if the SPFx bundle changes:
   - apps/hb-homepage/config/package-solution.json (solution + features[0])
   - apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
   - apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
   - packages/homepage-launcher/src/constants.ts (HOMEPAGE_LAUNCHER_VERSION)
   Use the SharePoint 4-part schema. Confirm via
   hbHomepagePackageAuthority.test.ts. Do NOT bump
   HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION.

## Multi-card gallery (deferred)

If product approves a multi-card gallery layout in the future, that is a
separate PS-03D wave. PS-03C does NOT introduce a gallery view-model
field, gallery layout component, or related-Foleon-documents fetch path
in the reader package.

## Do-not-touch

- No layout structural changes (PS-02 baseline locked).
- No accepted-origins or FoleonOriginPolicy changes.
- No FoleonContentRegistry schema changes; heroImageUrl / thumbnailUrl
  remain edition-level fallback/override URL fields.
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
naming the new data-foleon-summary-source marker. Operator-pending:
tenant proof that the override copy resolves at runtime — note this
explicitly, do not overclaim hosted reality.
```
