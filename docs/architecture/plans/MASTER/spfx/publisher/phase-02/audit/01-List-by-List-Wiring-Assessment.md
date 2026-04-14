# 01 — List-by-List Wiring Assessment

## Rebranding alignment note
The app has been rebranded to **Article Publisher**, but the tenant list set under audit remains the same `HB Article*` family and the current publish destination remains **Project Spotlight**. This report therefore updates app-identity references while preserving destination-specific findings where they remain materially correct.


## 1. HB Articles
### Expected tenant role
Primary master article list containing article content, workflow, destination, hero/body content, page-binding metadata, and promotion-related flags.

### Observed code usage
The current code does **not** model this list as `HB Articles`. It models a different list named `Project Spotlight Posts` and expects a `PublisherPostRow` shape keyed by `PostId`.

### Repo evidence
- `publisherListDescriptors.ts` binds the master list as `Project Spotlight Posts`
- `publisherContracts.ts` defines the master row as `PublisherPostRow`
- `publisherRepositories.ts` reads/writes by `PostId`
- `publisherRowMappers.ts` expects fields such as:
  - `PostId`
  - `PostFamily`
  - `PageShellKey`
  - `TargetSiteKey`
  - `SourceTemplatePath`
  - `BannerImageUrl`
  - `BannerImageAltText`

### Tenant-schema reality
The actual master list is `HB Articles` and uses tenant fields such as:
- `ArticleId`
- `ArticleContentType`
- `Destination`
- `HeroPrimaryImage`
- `HeroPrimaryImageAltText`
- `PageTemplateKey`
- `PageShellVersion`
- `PageSyncStatus`
- `WorkflowState`

### Verdict
**Incorrectly wired**

### Proven mismatches
- Wrong list title
- Wrong parent key (`PostId` vs `ArticleId`)
- Wrong content-type field model (`PostFamily` vs `ArticleContentType`)
- Wrong hero/banner field names
- Wrong page-template/page-shell field model
- Wrong destination model (`TargetSiteKey` in code vs `Destination` in tenant)
- Wrong sync-status enum model (`inSync` vs `in-sync`)

### Risk
Core article load, save, and workflow operations will fail or behave incorrectly.

---

## 2. HB Article Team Members
### Expected tenant role
Child team-member rows keyed by `ArticleId`, with person, display, grouping, role, and ordering data.

### Observed code usage
The current code models a different list named `Project Spotlight Post Team Members`, keyed by `PostId`.

### Repo evidence
- `publisherListDescriptors.ts`
- `publisherContracts.ts`
- `publisherRepositories.ts`
- `publisherRowMappers.ts`
- `publisherWriters.ts`

### Tenant-schema reality
Actual fields include:
- `ArticleId`
- `TeamMemberId`
- `PersonPrincipal`
- `DisplayName`
- `Role`
- `SortOrder`
- `GroupKey`
- `BioSnippet`
- `Company`
- `Department`
- `ContactLink`

### Code expectations that do not match tenant schema
- `PostId`
- `JobTitle`
- `PhotoUrl`
- `ResumeRichText`
- `ResumeDocumentUrl`
- `IncludeInViewer`

### Verdict
**Incorrectly wired**

### Proven mismatches
- Wrong list title
- Wrong parent key
- Multiple wrong or non-authoritative field names
- Writer uses a replace-all strategy against `PostId`, not `ArticleId`

### Risk
Team-member load/save paths are not tenant-aligned. Published Team Viewer integration cannot reliably consume what the Publisher writes.

---

## 3. HB Article Media
### Expected tenant role
Child media rows keyed by `ArticleId`, carrying image asset URLs, alt text, captions, roles, grouping, and order.

### Observed code usage
The code models `Project Spotlight Post Media`, keyed by `PostId`.

### Repo evidence
- `publisherListDescriptors.ts`
- `publisherContracts.ts`
- `publisherRepositories.ts`
- `publisherRowMappers.ts`
- `publisherWriters.ts`

### Tenant-schema reality
Actual fields include:
- `ArticleId`
- `MediaId`
- `ImageAsset`
- `AltText`
- `Caption`
- `MediaRole`
- `SortOrder`
- `FeaturedInGallery`
- `GalleryGroup`

### Code expectations that do not match tenant schema
- `PostId`
- `ImageAssetUrl`

### Verdict
**Incorrectly wired**

### Proven mismatches
- Wrong list title
- Wrong parent key
- Wrong image field name
- No tenant-aware handling for `FeaturedInGallery` or `GalleryGroup`

### Risk
Media rows will not read or write correctly against the tenant list.

---

## 4. HB Article Template Registry
### Expected tenant role
Tenant template/profile registry keyed by `TemplateKey`, scoped by destination/content types and toggle/profile fields.

### Observed code usage
The code models `Project Spotlight Template Registry` with a much richer but incompatible schema.

### Repo evidence
- `publisherContracts.ts`
- `publisherListDescriptors.ts`
- `publisherRepositories.ts`
- `publisherRowMappers.ts`
- `templateResolver.ts`
- `publishResolutionContext.ts`
- `validationEngine.ts`

### Tenant-schema reality
Actual fields include:
- `Destination`
- `ContentTypes`
- `TemplateKey`
- `TemplateName`
- `TemplatePriority`
- `VersionLabel`
- `PageShellTemplateKey`
- `BodyProfileKey`
- `HeroProfileKey`
- `GalleryProfileKey`
- `TeamViewerProfileKey`
- `RequiredFieldSetKey`
- `IsActive`
- `ShowBody`
- `ShowHero`
- `ShowGallery`
- `ShowSecondaryImage`
- `ShowTeamViewer`

### Code expectations that do not match tenant schema
- `TemplateDisplayName`
- `TemplateStatus`
- `TemplateVersion`
- `PageShellKey`
- `PageShellVersion`
- `ShellSourceSiteUrl`
- `ShellSourcePagePath`
- `BannerRendererKind`
- `BodyRendererKind`
- `TeamRendererKind`
- `GalleryRendererKind`
- `ValidationProfileKey`
- `RenderProfileKey`
- `AllowRepublishInPlace`
- `ForceRegenerationOnShellChange`
- `ControlMapJson`

### Verdict
**Incorrectly wired**

### Proven mismatches
- Wrong list title
- Wrong active/inactive model (`TemplateStatus` vs `IsActive`)
- Wrong version model (`TemplateVersion` vs `VersionLabel`)
- Wrong shell/template linkage model
- Wrong resolver assumptions

### Risk
Template selection, validation, preview, and publish decisions cannot operate correctly against the tenant registry.

---

## 5. HB Article Destination Pages
### Expected tenant role
Tenant page-binding registry keyed by `ArticleId` + `BindingId`, carrying page URL / ID / template / shell sync state.

### Observed code usage
The code models a different list named `Project Spotlight Page Bindings`, keyed by `PostId`.

### Repo evidence
- `publisherListDescriptors.ts`
- `publisherContracts.ts`
- `publisherRepositories.ts`
- `pageBindingWriter.ts`
- `publisherRowMappers.ts`

### Tenant-schema reality
Actual fields include:
- `ArticleId`
- `BindingId`
- `PageId`
- `PageName`
- `PageUrl`
- `PageTemplateKey`
- `PageShellVersion`
- `TargetSiteUrl`
- `PublishStatus`
- `SyncStatus`
- `LastSyncDateUtc`
- `LastSyncMessage`
- `RenderVersion`

### Code expectations that do not match tenant schema
- `PostId`
- `TargetSiteKey`
- `SourceTemplatePath`
- `PageShellKey`
- `TemplateKey`
- `TemplateVersion`
- `BindingStatus`
- `LastOperation`
- `LastOperationDateUtc`
- `LastSuccessfulSyncDateUtc`

### Verdict
**Incorrectly wired**

### Proven mismatches
- Wrong list title
- Wrong parent key
- Wrong field names across nearly the entire binding record
- Wrong status model (`BindingStatus` vs `PublishStatus` / `SyncStatus` split)

### Risk
Binding reads and writes are structurally incompatible with the tenant list.  
Republish, regeneration, and hosted page-resolution behavior are therefore untrustworthy.

---

## 6. HB Article Workflow History
### Expected tenant role
Tenant workflow audit trail keyed by `ArticleId`, capturing previous/new state, actor, timestamp, and note.

### Observed code usage
The code models `Project Spotlight Workflow History` and writes a different shape.

### Repo evidence
- `workflowStateMachine.ts`
- `ArticlePublisher.tsx`
- `publisherContracts.ts`
- `publisherRepositories.ts`
- `publisherRowMappers.ts`
- `publisherWriters.ts`

### Tenant-schema reality
Actual fields include:
- `HistoryId`
- `ArticleId`
- `PreviousState`
- `NewState`
- `ActorEmail`
- `ActionDateUtc`
- `ActionNote`

### Code expectations that do not match tenant schema
- `PostId`
- `FromState`
- `ToState`
- `Action`
- `Note`

### Verdict
**Incorrectly wired**

### Proven mismatches
- Wrong list title
- Wrong parent key
- Wrong field names
- Code expects an `Action` field that the tenant history list does not have
- State enum mismatch (`inReview` vs `review`)

### Risk
Even if the UI transitions look functional, the authoritative tenant history log will not be correctly written.

---

## 7. HB Article Publishing Errors
### Expected tenant role
Tenant error log keyed by `ArticleId`, optionally linked by `BindingId`, carrying destination, operation, retry status, summary, and last-attempt date.

### Observed code usage
The code models `Project Spotlight Publishing Errors`, but write support is not implemented.

### Repo evidence
- `publisherListDescriptors.ts`
- `publisherContracts.ts`
- `publisherRepositories.ts`
- `publisherRowMappers.ts`

### Tenant-schema reality
Actual fields include:
- `ArticleId`
- `BindingId`
- `Destination`
- `ErrorId`
- `Operation`
- `ErrorSummary`
- `LastAttemptDateUtc`
- `RetryStatus`

### Code expectations that do not match tenant schema
- `PostId`
- `TemplateKey`
- `PageShellKey`
- `OccurredDateUtc`
- `ErrorCategory`
- `ErrorDetails`

### Verdict
**Incorrectly wired and partially unwired**

### Proven mismatches
- Wrong list title
- Wrong field model
- Append/write path intentionally not implemented

### Risk
Publishing failures cannot be logged to the authoritative tenant error list.

---

## 8. HB Article Promotion Rules
### Expected tenant role
Tenant configuration list controlling promotion defaults and manual overrides by destination/content type/scope.

### Observed code usage
No live repository/service wiring was found for this list.

### Repo evidence
- No list descriptor
- No repository
- No row mapper
- No writer
- No import/use in the authoring component
- No import/use in the publish orchestrator

### Verdict
**Currently unwired**

### Proven gap
The tenant has an actual promotion-rules list, but the current Article Publisher implementation does not consume it.

### Risk
Promotion behavior is either missing, hardcoded elsewhere, or left to future work.  
That creates operational drift between authored content and expected rollup/promotion behavior.

---

## Summary
### Correctly wired
- Shell bootstrapping / manifest / runtime-contract linkage
- HBCentral host-site assumption in the publisher data layer

### Incorrect or missing
- Actual list-title binding
- Field-level master/child/schema alignment
- Workflow-history alignment
- Error-log alignment
- Template-registry alignment
- Destination-page binding alignment
- Promotion-rules integration
