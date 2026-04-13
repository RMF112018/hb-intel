# 06 — Article/Page Binding Schema

## Purpose

The article/page binding model keeps the relationship between an article record and its destination page explicit, durable, and recoverable.

## Design rule

Article truth must live in lists. Pages are render shells.

## Binding entities

### Article master
From `HB Articles`:
- `ArticleId`
- `Destination`
- `TemplateKey`
- `Slug`
- `PageId`
- `PageUrl`
- `PageName`
- `PageTemplateKey`
- `PageShellVersion`
- `RenderVersion`
- `LastPageSyncDateUtc`
- `PageSyncStatus`

### Destination page binding row
From `HB Article Destination Pages`:
- `BindingId`
- `ArticleId`
- `TargetSiteUrl`
- `PageId`
- `PageUrl`
- `PageName`
- `PageTemplateKey`
- `PageShellVersion`
- `RenderVersion`
- `PublishStatus`
- `LastSyncDateUtc`
- `SyncStatus`
- `LastSyncMessage`

## Binding lifecycle

### 1. Before first publish
- article exists
- no destination page is yet bound
- `PageId`, `PageUrl`, `PageName` may be blank
- sync status is `not-created` or equivalent

### 2. First publish
- destination is resolved
- slug/page name is finalized
- page shell is created
- page is bound to `ArticleId`
- binding row is created or updated
- sync status becomes `in-sync` when successful

### 3. Republish / update
- same `ArticleId`
- same destination page unless explicitly regenerated
- page shell may be updated
- shell version and render version may increment
- sync status updated

### 4. Archive / withdraw
- article remains authoritative
- page behavior is rule-based:
  - remain published but suppressed from rollups, or
  - be unpublished/withdrawn if governance requires it

## Binding rules

1. `ArticleId` is the primary cross-system key
2. Destination page should carry or resolve `ArticleId`
3. Page URL and page id must be stored explicitly
4. Regeneration must preserve article identity
5. Template and shell version must be traceable
6. Recovery from failed page sync must be possible without re-authoring

## Page-shell resolution model

The page shell should be chosen from:
- destination
- template key
- page shell template key

The page should not derive its main structure by inspecting ad hoc article data at runtime alone.

## Render shell behavior

The destination page should:
- load bound `ArticleId`
- resolve the article master record
- resolve related team/media child rows
- render the destination-specific composition

## Future-proofing notes

Page binding schema may need extension when:
- page shell composition versioning becomes more formal
- partial render upgrades are supported
- multiple destination pages per single article become desirable
