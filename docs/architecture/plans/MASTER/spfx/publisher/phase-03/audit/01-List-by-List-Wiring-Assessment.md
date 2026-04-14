# 01 — List-by-List Wiring Assessment

## 1. HB Articles

### Expected role
Master article record and primary workflow / content / promotion / page-sync source of truth.

### Observed code usage
Read / write via:
- `publisherRepositories.ts` → `articles.getByArticleId`, `listByWorkflowState`, `upsert`
- `publisherRowMappers.ts` → `mapArticleRow`
- `publisherWriters.ts` → `mapArticleRowToListFields`
- `ArticlePublisher.tsx` → authoring UI save, filter, and transition paths
- `publishOrchestrator.ts` → post-publish metadata back-sync
- `validationEngine.ts` → validation rules
- `pageCompositor.ts` → destination page identity and slot payloads

### Wiring verdict
**Partially aligned; generally strongest seam in the app.**

### Proven strengths
- Correct list title: `HB Articles`
- Correct host site: HBCentral
- Most master-record field names used in read/write code match tenant schema
- Article reader / writer are materially closer to tenant truth than any other seam
- Post-publish metadata back-sync exists

### Proven mismatches / weaknesses
1. `publisherListDescriptors.ts` still declares a materially obsolete `mvpFields` set for the articles list, including fields not in tenant schema such as:
   - `BannerTitleOverride`
   - `PostFamily`
   - `PageShellKey`
   - `BannerImageUrl`
   - `TeamSectionHeading`
   - `TeamViewerLayout`
   - `GalleryLayoutProfile`
   - `TargetSiteKey`
   - `GeneratedPageName`
   - `SourceTemplatePath`
   - `AppliedTemplateVersion`
   - `AppliedShellVersion`
   - `LastSuccessfulPublishDateUtc`
2. `ArticlePublisher.tsx` seeds a new article with:
   - `ArticleContentType='monthlySpotlight'`
   - `Destination='projectSpotlight'`
   - `TemplateKey='ps-inprogress-monthly-v1'`
   - `TargetSiteUrl='https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight'`
   This is acceptable for current bounded scope, but it hard-locks the app to Project Spotlight and is not truly multi-destination.
3. `publishOrchestrator.ts` intentionally does not update `WorkflowState` after publish success.
4. `ArticlePublisher.tsx` allows a direct manual state change to `published`, bypassing publish orchestration.

### Runtime / hosted implication
The master article can drift away from real publish state:
- article says `published` while no page/binding exists
- page exists while article remains `approved`

### Verdict
**Active and required. Mostly wired, but operationally unsafe because lifecycle closure is incomplete.**

---

## 2. HB Article Team Members

### Expected role
Article child rows for team viewer / team roster content.

### Observed code usage
Read / write via:
- `publisherRepositories.ts` → `teamMembers.listByArticle`, `replaceAllForArticle`
- `publisherRowMappers.ts` → `mapTeamMemberRow`
- `publisherWriters.ts` → `mapTeamMemberRowToListFields`
- `ArticlePublisher.tsx` → TeamPanel
- `teamViewerAdapter.ts`
- `pageCompositor.ts` → `composeTeam`
- `validationEngine.ts`

### Wiring verdict
**Incorrectly wired.**

### Tenant schema authority
Actual tenant shape includes:
- required: `ArticleId`, `TeamMemberId`, `PersonPrincipal` (User), `DisplayName`, `Title`
- actual custom fields include `Company`, `Department`, `GroupKey`, `IsFeaturedMember`, `ParentMemberId`, `Role`, `BioSnippet`, `ContactLink`, `SortOrder`

### Proven mismatches
1. `publisherContracts.ts` defines `PersonPrincipal` as `string`, but tenant schema defines it as **User**.
2. `publisherRowMappers.ts` attempts to read `PersonPrincipal` with `requiredStr(raw['PersonPrincipal'])`.
   - That is not a safe mapping for a SharePoint User field.
3. `publisherContracts.ts` and `publisherWriters.ts` expect / write fields that do not exist on tenant list:
   - `JobTitle`
   - `PhotoUrl`
   - `ResumeRichText`
   - `ResumeDocumentUrl`
   - `IncludeInViewer`
4. Required tenant field `Title` is not represented or written in the team-member contract/writer.
5. `teamViewerAdapter.ts` depends on the non-schema `IncludeInViewer`, `JobTitle`, `PhotoUrl`, `ResumeRichText`, and `ResumeDocumentUrl`.
6. `validationEngine.ts` requires at least one row with `IncludeInViewer !== false`, but the tenant list has no such field.

### Runtime / hosted implication
Likely outcomes:
- Team-member saves fail at write time.
- Existing tenant rows fail to map cleanly on read.
- Team Viewer can appear empty even when rows exist in tenant.
- Validation can block publish based on a field that tenant schema does not contain.

### Verdict
**Actively required for team-viewer workflows, but currently broken.**

---

## 3. HB Article Media

### Expected role
Article child rows for gallery / supporting image content.

### Observed code usage
Read / write via:
- `publisherRepositories.ts` → `media.listByArticle`, `replaceAllForArticle`
- `publisherRowMappers.ts` → `mapMediaRow`
- `publisherWriters.ts` → `mapMediaRowToListFields`
- `ArticlePublisher.tsx` → GalleryPanel
- `pageCompositor.ts` → `composeGallery`
- `validationEngine.ts`

### Wiring verdict
**Incorrectly wired.**

### Tenant schema authority
Actual tenant fields include:
- required: `ArticleId`, `MediaId`, `MediaRole`, `ImageAsset`, `AltText`, `Title`
- optional: `Caption`, `SortOrder`, `FeaturedInGallery`, `GalleryGroup`

### Proven mismatches
1. The tenant URL field is `ImageAsset`, but code uses `ImageAssetUrl`.
   - `publisherContracts.ts` defines `ImageAssetUrl`
   - `publisherRowMappers.ts` reads `raw['ImageAssetUrl']`
   - `publisherWriters.ts` writes `ImageAssetUrl`
   - `pageCompositor.ts` consumes `r.ImageAssetUrl`
2. Required tenant field `Title` is not represented or written.
3. Tenant fields `FeaturedInGallery` and `GalleryGroup` are ignored.

### Runtime / hosted implication
Likely outcomes:
- Gallery rows fail to write.
- Existing tenant media rows do not load correctly.
- Gallery rendering becomes empty or validation-blocked even when media exists in tenant.

### Verdict
**Actively required for gallery workflows, but currently broken.**

---

## 4. HB Article Template Registry

### Expected role
Template/profile registry controlling destination, applicability, and composition settings.

### Observed code usage
Read only via:
- `publisherRepositories.ts` → `templateRegistry.listActive`, `getByKey`
- `templateResolver.ts`
- `publishResolutionContext.ts`
- `validationEngine.ts`
- `pageCompositor.ts`

### Wiring verdict
**Largely aligned.**

### Proven strengths
- Correct list title and host site
- Reads active rows only
- Correct keying on `TemplateKey`
- Resolver honors:
   - `IsActive`
   - `Destination`
   - `ContentTypes`
   - optional `SpotlightTypes`
   - optional `ProjectStages`
   - optional `ArticleSubjects`
   - `TemplatePriority`
   - `VersionLabel`
- `PublisherTemplateRegistryRow` is materially aligned to tenant schema

### Weaknesses
- No write path, which is fine for current scope
- Some older comments still reference pre-realignment posture, but current runtime contract is better than comments imply

### Verdict
**Active and correctly used as a read-only reference seam.**

---

## 5. HB Article Destination Pages

### Expected role
Durable page-binding registry between article and destination page.

### Observed code usage
Read / write via:
- `publisherRepositories.ts` → `pageBindings.getByArticleId`, `upsert`
- `pageBindingWriter.ts`
- `publishResolutionContext.ts`
- `publishOrchestrator.ts`
- `republishPolicy.ts`
- `validationEngine.ts`
- `ArticlePublisher.tsx` → StatusPanel
- TeamViewer hosted page binding logic references this list conceptually through article/page relationships

### Wiring verdict
**Mostly aligned and one of the stronger seams.**

### Proven strengths
- Correct list title and host site
- Correct keying on `ArticleId`
- Correct field names in writer:
   - `BindingId`
   - `ArticleId`
   - `Title`
   - `TargetSiteUrl`
   - `PageTemplateKey`
   - `PublishStatus`
   - `PageId`
   - `PageName`
   - `PageUrl`
   - `PageShellVersion`
   - `RenderVersion`
   - `SyncStatus`
   - `LastSyncDateUtc`
   - `LastSyncMessage`
   - `PublishedDateUtc`

### Weaknesses
1. Archive / withdraw lifecycle sets `PublishStatus='draft'` and `SyncStatus='pending'` but does not actually remove / unpublish the destination page.
2. Republish policy only regenerates on `PageTemplateKey` drift, not shell-version drift.

### Runtime / hosted implication
Binding data can remain structurally accurate while business meaning drifts:
- a live page can still exist after article withdraw/archive
- binding may say draft/pending while page remains visible

### Verdict
**Structurally aligned, but lifecycle semantics are incomplete.**

---

## 6. HB Article Workflow History

### Expected role
Audit trail of workflow transitions and publish-side state changes.

### Observed code usage
Read / write via:
- `publisherRepositories.ts` → `workflowHistory.listByArticle`, `append`
- `publisherWriters.ts` → `mapWorkflowHistoryRowToListFields`
- `ArticlePublisher.tsx` → direct transition history writes
- `publishOrchestrator.ts` → archive/withdraw history writes

### Wiring verdict
**Field mapping is aligned, but lifecycle coverage is incomplete.**

### Proven strengths
- Correct list title and host site
- Correct fields written:
   - `HistoryId`
   - `ArticleId`
   - `Title`
   - `NewState`
   - `PreviousState`
   - `ActionDateUtc`
   - `ActorEmail`
   - `ActionNote`

### Proven weakness
Publish / republish success does **not** append workflow history.
That means one of the most important operational lifecycle events is missing from the audit trail.

### Runtime / hosted implication
Editors and operators cannot rely on workflow history as a full publish ledger.

### Verdict
**Partially wired. The list seam is aligned, but the workflow lifecycle does not fully use it.**

---

## 7. HB Article Publishing Errors

### Expected role
Operational error log for publish/sync failures.

### Observed code usage
Write via:
- `publisherRepositories.ts` → `publishingErrors.append`
- `publisherWriters.ts` → `mapPublishingErrorRowToListFields`
- `publishOrchestrator.ts` → `recordPublishingError`

Read via:
- `publisherRepositories.ts` → `listByArticle`

### Wiring verdict
**Aligned and actively used.**

### Proven strengths
- Correct list title and host site
- Correct coarse operation mapping to tenant choices:
   - `create`
   - `update`
   - `publish`
   - `sync`
- Correct fields written:
   - `ErrorId`
   - `ArticleId`
   - `Title`
   - `Destination`
   - `Operation`
   - `ErrorSummary`
   - `BindingId`
   - `LastAttemptDateUtc`
   - `RetryStatus`

### Weaknesses
- Lifecycle helper for archive/withdraw calls `recordPublishingError` with `mode='create'`, which is semantically imprecise if those flows fail
- Error logging is best-effort only; failed error-log writes are swallowed

### Verdict
**Correctly wired enough for current purpose.**

---

## 8. HB Article Promotion Rules

### Expected role
Promotion defaults and override policy for destination/content combinations.

### Observed code usage
Read only via:
- `publisherRepositories.ts` → `promotionRules.listActive`
- `ArticlePublisher.tsx` → default new-article seed behavior
- `promotionRuleSelector` (via barrel export; used in UI)
- downstream defaulting for `IsFeatured` / `IsPinned`

### Wiring verdict
**Aligned for current bounded use.**

### Proven strengths
- Correct list title and host site
- Correct active-rule filter
- Correct contract alignment for:
   - `RuleId`
   - `Destination`
   - `Scope`
   - `IsActive`
   - `RuleContentType`
   - `FeaturedDefault`
   - `PinnedDefault`
   - `ManualOverrideAllowed`
   - `FeedWindowDays`
   - `Notes`

### Weaknesses
- Current app still hard-locks destination validation to Project Spotlight, so multi-destination promotion policy is only partially meaningful today

### Verdict
**Correctly wired as a supporting read-only seam.**
