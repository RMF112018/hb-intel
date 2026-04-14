# 01 - List-by-List Wiring Assessment

## 1. HB Articles

### Expected role
Primary master article record for content, workflow, destination, template key, promotion flags, and synced page metadata.

### Observed code usage
- Read/write through `publisherRepositories.ts` and `publisherWriters.ts`
- Typed by `PublisherArticleRow`
- Read mapper: `mapArticleRow`
- Write mapper: `mapArticleRowToListFields`

### Verdict
**Mostly wired to the correct list and field family, but incomplete operationally.**

### What is correct
- Correct list title: `HB Articles`
- Correct key column usage: `ArticleId`
- Correct use of `ArticleContentType`, `Destination`, `WorkflowState`, `TemplateKey`
- Correct post-publish back-sync target for page metadata (`PageId`, `PageName`, `PageUrl`, `PageTemplateKey`, `PageShellVersion`, `RenderVersion`, `PageSyncStatus`, `LastPageSyncDateUtc`, `PublishedDateUtc`)

### Mismatches / gaps
- `mapArticleRowToListFields` does **not** persist some schema-supported fields that are operationally relevant, including:
  - `MilestoneLabel`
  - `MilestoneDateUtc`
- The UI surface does not expose milestone editing fields, but validation can require them.
- The app treats `TargetSiteUrl` as functionally required for current sprint behavior, while the list schema does not require it.

### Risk
Milestone-oriented article flows are incomplete and can fail validation or lose data.

---

## 2. HB Article Team Members

### Expected role
Child rows for article-bound people shown through the Team Viewer.

### Observed code usage
- Read/write through `publisherRepositories.ts` and `publisherWriters.ts`
- Read mapper: `mapTeamMemberRow`
- Write mapper: `mapTeamMemberRowToListFields`
- Authoring UI managed inside `ArticlePublisher.tsx`

### Verdict
**Not safely wired end to end.**

### What is correct
- Correct list title: `HB Article Team Members`
- Correct parent key: `ArticleId`
- Correct child key: `TeamMemberId`
- Correct recognition that tenant field is a SharePoint User field (`PersonPrincipal`) and REST write payload must use `PersonPrincipalId`

### Mismatches / gaps
- Authoring UI creates rows with:
  - `PersonPrincipal` string
  - no guaranteed `PersonPrincipalId`
- Writer emits `PersonPrincipalId: row.PersonPrincipalId ?? null`
- No SharePoint user-resolution step was found before save
- Descriptor drift:
  - descriptor MVP field list uses `PersonPrincipalId`
  - tenant field/internal name is `PersonPrincipal`
- Read path is also at risk:
  - repository read does not explicitly `$select/$expand` the user field
  - mapper expects a flattened or expanded usable principal

### Risk
This is a likely save-path failure and edit-path hydration failure for team members.

---

## 3. HB Article Media

### Expected role
Child media rows for gallery/supporting/hero/secondary assets.

### Observed code usage
- Read/write through `publisherRepositories.ts` and `publisherWriters.ts`
- Mapper correctly uses tenant field `ImageAsset`

### Verdict
**Generally wired correctly.**

### What is correct
- Correct list title: `HB Article Media`
- Correct foreign key: `ArticleId`
- Correct child key: `MediaId`
- Correct media URL field name: `ImageAsset`
- Correct keyed sync writer behavior instead of destructive delete-all recreation

### Gaps
- Gallery behavior is template-driven and current shell-driven, so some authored media types can be suppressed without clear persistence-side differentiation.
- Secondary media is not structurally represented in the current shell.

### Risk
Low relative to the other seams.

---

## 4. HB Article Template Registry

### Expected role
Reference registry controlling template resolution, profile keys, display-block toggles, and selection priority.

### Observed code usage
- Read-only through `templateRegistry.listActive()`
- Resolution via `templateResolver.ts`

### Verdict
**Technically wired, but partially bypassed in practice.**

### What is correct
- Correct list title: `HB Article Template Registry`
- Correct fields used:
  - `TemplateKey`
  - `IsActive`
  - `TemplatePriority`
  - `ContentTypes`
  - `Destination`
  - `SpotlightTypes`
  - `ProjectStages`
  - `ArticleSubjects`
  - `PageShellTemplateKey`
  - profile keys
  - `RequiredFieldSetKey`

### Mismatches / gaps
- New-article creation hard-wires `TemplateKey='ps-inprogress-monthly-v1'`
- The resolver treats non-empty `TemplateKey` as an override
- Therefore, registry selection logic is often bypassed for new rows

### Risk
Template registry exists, but operationally behaves more like a hard-coded override path for new content.

---

## 5. HB Article Destination Pages

### Expected role
Binding registry between article records and destination pages, including sync and publish metadata.

### Observed code usage
- Read via `pageBindings.getByArticleId`
- Write via `pageBindingWriter.ts`
- Updated by publish / republish / archive / withdraw paths

### Verdict
**List title and core fields are correct, but lifecycle semantics are incomplete.**

### What is correct
- Correct list title: `HB Article Destination Pages`
- Correct upsert target fields:
  - `BindingId`
  - `ArticleId`
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

### Mismatches / gaps
- Binding rows are upserted by `ArticleId`, so there is effectively one live binding row per article
- Republish policy comments describe superseding prior bindings on regeneration, but implementation does not preserve prior binding rows
- Archive/withdraw demote binding to `PublishStatus='draft'` and `SyncStatus='pending'`, which is workable but semantically lossy

### Risk
Binding lineage and regeneration auditability are weak.

---

## 6. HB Article Workflow History

### Expected role
Audit trail for workflow transitions and lifecycle operations.

### Observed code usage
- Appended on generic workflow transitions
- Appended on publish / republish success
- Appended on archive / withdraw success

### Verdict
**Mostly wired correctly.**

### What is correct
- Correct list title: `HB Article Workflow History`
- Correct field family:
  - `HistoryId`
  - `ArticleId`
  - `NewState`
  - `PreviousState`
  - `ActionDateUtc`
  - `ActorEmail`
  - `ActionNote`

### Mismatches / gaps
- When workflow-history append fails after publish/republish, the publishing error log classifies the stage as `articleSync` instead of `historyAppend`

### Risk
Operational triage is weaker than it should be.

---

## 7. HB Article Publishing Errors

### Expected role
Operational error log for publishing, syncing, and recovery attempts.

### Observed code usage
- Appended from publish and lifecycle error paths through `recordPublishingError`

### Verdict
**Actively wired and useful, but not perfectly classified.**

### What is correct
- Correct list title: `HB Article Publishing Errors`
- Correct tenant operation buckets used:
  - `create`
  - `update`
  - `publish`
  - `sync`
- Correct use of:
  - `ErrorId`
  - `ArticleId`
  - `Title`
  - `Destination`
  - `Operation`
  - `ErrorSummary`
  - `BindingId`
  - `LastAttemptDateUtc`
  - `RetryStatus`

### Mismatches / gaps
- Some failure paths are bucketed too coarsely or under the wrong stage label in caller logic
- Error rows can be technically present while still obscuring the true failure seam

### Risk
Medium. Operational debugging exists, but can still mislead.

---

## 8. HB Article Promotion Rules

### Expected role
Rule table for feature/pin defaults and manual-override behavior.

### Observed code usage
- Read-only active-rule load on mount
- Used to seed defaults for new article creation

### Verdict
**Wired, but lightly used.**

### What is correct
- Correct list title: `HB Article Promotion Rules`
- Correct field usage:
  - `RuleId`
  - `Destination`
  - `Scope`
  - `IsActive`
  - `RuleContentType`
  - `FeaturedDefault`
  - `PinnedDefault`
  - `ManualOverrideAllowed`
  - `FeedWindowDays`

### Mismatches / gaps
- Promotion rules influence only a narrow slice of authoring defaults today
- Broader downstream promotion behavior is not materially implemented here

### Risk
Low to medium. Not a blocking seam, but not a fully expressed operating model either.

---

## Overall list-set conclusion

### Correctly wired overall
- List titles
- HBCentral host-list assumption
- Most master-record and binding field names
- Workflow history and publishing error seams
- Promotion rule read path
- Media list seam

### Not correctly closed overall
- Team-member user-field seam
- Regeneration / supersession semantics on destination bindings
- Republish identity guarantee
- Complete workflow coverage for scheduled publishing
