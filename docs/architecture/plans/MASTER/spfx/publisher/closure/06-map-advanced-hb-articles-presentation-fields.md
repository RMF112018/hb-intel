# Prompt-06 Closure: Map Advanced HB Articles Presentation Fields

## Chosen implementation
Advanced HB Articles presentation fields are now explicitly split into:
- **In scope and operationally wired**: template override path, advanced Team Viewer article settings, secondary-image article fields.
- **Deferred (schema-compatible only)**: campaign/meta/prominence fields with no current runtime consumer.

## Before / After
Before:
1. Descriptor/contract/mapper/writer carried only a subset of advanced article presentation fields.
2. Authoring UI omitted TemplateKey override control and advanced Team Viewer + secondary-image controls.
3. Team Viewer adapter used static layout/density/flags regardless of advanced article settings.

After:
1. `PublisherArticleRow`, descriptor MVP fields, mapper, and writer all include the newly in-scope advanced fields.
2. Authoring UI exposes TemplateKey override (with lock notice), advanced Team Viewer settings, and secondary image fields.
3. Team Viewer adapter consumes `TeamViewerMode` and `TeamViewerAllowExpand` into `TeamViewerConfig` deterministically.
4. Secondary image is persisted and round-tripped; composition support is explicitly deferred (no secondary slot in current shell/control contract).

## Changed surfaces
- `publisherEnums.ts`: added Team Viewer mode/grouping/sort enum tuples.
- `publisherContracts.ts`, `publisherListDescriptors.ts`, `publisherRowMappers.ts`, `publisherWriters.ts`: aligned field surface + read/write mapping for new advanced fields.
- `ArticlePublisher.tsx`: added authoring controls and notices for template override, advanced Team Viewer settings, and secondary image.
- `teamViewerAdapter.ts`: consumes advanced Team Viewer settings into emitted TeamViewer config.
- Tests updated/added:
  - `publisherArticleRow.test.ts`
  - `publisherListDescriptors.test.ts`
  - `teamViewerAdapter.test.ts`
  - `pageCompositor.test.ts`
  - `ArticlePublisher.test.tsx`

## Proof mapping
1. Descriptor/contract/mapper/writer/UI agreement:
   - `publisherListDescriptors.test.ts` and `publisherArticleRow.test.ts` pin the expanded field set.
2. Round-trip coverage for newly surfaced fields:
   - `publisherArticleRow.test.ts` validates mapper + writer round-trip for secondary-image and advanced Team Viewer fields.
3. Composition/adapter consumption where applicable:
   - `teamViewerAdapter.test.ts` validates mode/expand mapping.
   - `pageCompositor.test.ts` validates emitted TeamViewer properties and explicit secondary-image no-slot posture.
4. Authoring behavior:
   - `ArticlePublisher.tsx` adds controls and lock notices.
   - `ArticlePublisher.test.tsx` validates advanced field persistence through save-path policy application.

## Deferred fields (explicit)
The following schema-backed fields remain deferred from live authoring/composition until a concrete runtime consumer exists: campaign/meta/prominence fields (for example `CampaignWindowStartUtc`, `CampaignWindowEndUtc`, `ProminenceIntent`, `CanonicalTopic`, `MetaTitleOverride`, `MetaDescriptionOverride`, `SocialImageUrl`, `ExcludeFromAutomations`).
