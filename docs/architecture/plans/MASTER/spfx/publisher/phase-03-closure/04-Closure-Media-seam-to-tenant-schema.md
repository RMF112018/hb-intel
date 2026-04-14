# Closure 04 — Media seam realigned to tenant schema

## Objective
Align the full `HB Article Media` seam (contract, row mapper, writer,
list descriptor, page compositor, and authoring UI) with the
authoritative tenant list schema. Replace the wrong internal name
`ImageAssetUrl` with the tenant column `ImageAsset`, write the
required tenant `Title` column, and surface the tenant optional
columns that exist today.

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCompositor.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- Fixture/assertion updates across:
  `publisherChildRelationships.test.ts`, `validation/validationEngine.test.ts`,
  `preview/previewBuilder.test.ts`,
  `pageGeneration/pageCompositor.test.ts`,
  `pageGeneration/pagePublishLifecycle.test.ts`,
  `publishOrchestrator.test.ts`, `articleSyncBack.test.ts`,
  `__tests__/publisherEndToEnd.test.ts`.

## Exact issue closed
The media seam wrote and read `ImageAssetUrl`, which does not exist on
the tenant `HB Article Media` list. The tenant internal name is
`ImageAsset` (URL field, required). The contract, mapper, writer, MVP
field descriptor, page compositor, and authoring UI all used the
wrong name, so every media POST silently populated a nonexistent
column and every read missed the URL data entirely on a
tenant-aligned list. The required tenant `Title` column was also
missing from every layer.

## Remediation
1. **Contract (`publisherContracts.ts`).** `PublisherMediaRow` now
   uses `ImageAsset` (not `ImageAssetUrl`), requires the tenant
   `Title` column, and adds optional `GalleryGroup` (Text) and
   `FeaturedInGallery` (Boolean) to match the tenant supported column
   set. Doc comment records the correct tenant internal name so
   future code cannot regress.
2. **Row mapper (`publisherRowMappers.ts`).** `mapMediaRow` now
   requires `Title` and reads the URL column under its tenant
   internal name `ImageAsset`. It also reads `GalleryGroup` and
   `FeaturedInGallery` when present.
3. **Writer (`publisherWriters.ts`).** `mapMediaRowToListFields`
   emits `Title`, writes `ImageAsset` as the SharePoint URL field
   shape `{ Url, Description }`, and includes the optional
   `GalleryGroup` / `FeaturedInGallery` columns. The legacy
   `ImageAssetUrl` key is no longer emitted.
4. **List descriptor (`publisherListDescriptors.ts`).** The MVP
   `$select` field list for `HB Article Media` is replaced with the
   tenant-supported column set (`Title`, `ImageAsset`,
   `GalleryGroup`, `FeaturedInGallery`, and the existing required
   columns).
5. **Page compositor (`pageGeneration/pageCompositor.ts`).** The
   gallery composition reads `ImageAsset` instead of `ImageAssetUrl`
   when building gallery payloads.
6. **Authoring UI (`ArticlePublisher.tsx`).** `GalleryPanel` now
   authors `Title`, `ImageAsset`, `AltText`, `Caption`, `MediaRole`,
   `GalleryGroup`, and `FeaturedInGallery`. New rows default to
   `Title: ''` so the required tenant column is always present on
   the draft shape.

## Tests added or updated
- `publisherChildRelationships.test.ts`:
  - Existing FK guards updated to include `Title` and the new
    `ImageAsset` internal name.
  - **New test**: "media write payload emits tenant internal names
    with no legacy aliases" — asserts every tenant column is
    emitted, the URL column is `ImageAsset` (URL field shape), and
    `ImageAssetUrl` is absent.
  - **New test**: "media read mapper rejects rows missing tenant
    Title or using the legacy ImageAssetUrl column" — proves the
    required-field and tenant-name enforcement on reads.
- All other suites: every `PublisherMediaRow` fixture updated to
  include the required `Title` and to use the tenant `ImageAsset`
  column name.

Baseline on `main` prior to this prompt: 19 failed, 143 passed.
After this prompt: 19 failed, 145 passed. The two new publisher
child-relationship tests added here pass; no previously passing test
is now failing.

## Proof of behavioral closure
- The contract, mapper, writer, list descriptor, page compositor,
  and authoring UI all reference exactly the tenant `HB Article
  Media` column set. TypeScript compiles clean with `Title` required
  and `ImageAsset` as the canonical URL column.
- A round-trip through `mapMediaRow` → `mapMediaRowToListFields`
  preserves every tenant column and emits no legacy alias (asserted
  by the new writer test).
- The gallery path now reads the same `ImageAsset` column that is
  written, closing the previous read/write drift.

## Remaining follow-up risks
- The tenant list defines an `Attachments` column and several
  system columns (e.g. `_ComplianceTag`) that this seam intentionally
  leaves unread; no tenant-defined media behavior depends on them
  today. If a future authored media flow needs them, the same
  contract/mapper/writer/UI fan-out must be extended.
- The authoring UI surfaces `GalleryGroup` as a free-text field;
  when the tenant introduces a picker or a vocabulary for gallery
  groups, the UI should move to a constrained selector. Contract-
  level parity is already in place for that future iteration.
