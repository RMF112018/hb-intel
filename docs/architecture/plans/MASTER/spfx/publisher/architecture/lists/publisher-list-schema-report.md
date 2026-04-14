# Publisher List Schema Report

## 1. Objective
- Extract real tenant-backed schema and implementation details for the 8 publisher lists on `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Source list set extracted exactly once each (duplicate `HB Article Team Members` reference deduped).
- Scripts/utilities used:
  - `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1` (`sharepoint-control:extraction:list-schema`)
  - Supplemental read-only PnP extraction command flow (direct `Get-PnPList`, `Get-PnPField`, `Get-PnPContentType`) to capture properties not emitted by baseline output.

## 2. Extraction Method
- Baseline extraction run from existing repo script to `/tmp/publisher-baseline-raw.json`, `/tmp/publisher-baseline-normalized.json`, `/tmp/publisher-baseline-summary.md`.
- Supplemental extraction run to `/tmp/publisher-supplemental-raw.json` for detailed list/field metadata (defaults, lookup metadata, formulas, rich text, person settings, form URLs, etc.).
- Auth/runtime assumptions: delegated device-code login with existing tenant app registration (`9bc3ab49-b65d-410a-85ad-de819febfddc`, tenant `0e834bd7-628b-42c8-b9ec-ecebc9719be4`).
- Repo script modifications: none required.
- Access limitations: taxonomy-specific properties were checked and not present on these lists; no custom Power Apps form binding proof beyond default form URLs was available through this extraction surface.

## 3. Target List Summary

| List Title | Resolved URL | Template/Base Type | Item Count | Content Types Enabled | Notes / Status |
|---|---|---:|---:|---|---|
| HB Article Destination Pages | https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB%20Article%20Destination%20Pages/AllItems.aspx | 100/0 | 0 | false | Resolved and extracted successfully |
| HB Article Media | https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB%20Article%20Media/AllItems.aspx | 100/0 | 0 | false | Resolved and extracted successfully |
| HB Article Promotion Rules | https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB%20Article%20Promotion%20Rules/AllItems.aspx | 100/0 | 0 | false | Resolved and extracted successfully |
| HB Article Publishing Errors | https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB%20Article%20Publishing%20Errors/AllItems.aspx | 100/0 | 0 | false | Resolved and extracted successfully |
| HB Article Team Members | https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB%20Article%20Team%20Members/AllItems.aspx | 100/0 | 0 | false | Resolved and extracted successfully |
| HB Article Template Registry | https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB%20Article%20Template%20Registry/AllItems.aspx | 100/0 | 0 | false | Resolved and extracted successfully |
| HB Article Workflow History | https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB%20Article%20Workflow%20History/AllItems.aspx | 100/0 | 0 | false | Resolved and extracted successfully |
| HB Articles | https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB%20Articles/AllItems.aspx | 100/0 | 0 | false | Resolved and extracted successfully |

## 4. Detailed List Schemas

### HB Article Destination Pages
- Purpose / observed role: Page-binding registry between article records and destination page/shell sync state.
- List-level metadata:
  - List ID: `eedc141e-4146-4302-9cb6-5da5d95270da`
  - Entity Type Name: `HB_x0020_Article_x0020_Destination_x0020_PagesList`
  - Site URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
  - Default View URL: `/sites/HBCentral/Lists/HB Article Destination Pages/AllItems.aspx`
  - Base Template / Base Type: `100` / `0`
  - Description: ``
  - Content Types Enabled: `false`
  - Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
  - Moderation: `EnableModeration=false`
  - Attachments Enabled: `true`
  - Item Count: `0`
  - Hidden: `false`
  - Forms: New=`/sites/HBCentral/Lists/HB Article Destination Pages/NewForm.aspx`, Edit=`/sites/HBCentral/Lists/HB Article Destination Pages/EditForm.aspx`, Display=`/sites/HBCentral/Lists/HB Article Destination Pages/DispForm.aspx`
  - Content types on list: `Item, Folder`

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| ArticleId | ArticleId | Text | Yes | No | No | No | MaxLength=255 |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| BindingId | BindingId | Text | Yes | No | No | No | MaxLength=255 |
| Content Type | ContentType | Computed | No | No | No | No |  |
| LastSyncDateUtc | LastSyncDateUtc | DateTime | No | No | No | No |  |
| LastSyncMessage | LastSyncMessage | Note | No | No | No | No | RichText=false; Lines=6 |
| PageId | PageId | Text | No | No | No | No | MaxLength=255 |
| PageName | PageName | Text | No | No | No | No | MaxLength=255 |
| PageShellVersion | PageShellVersion | Text | No | No | No | No | MaxLength=255 |
| PageTemplateKey | PageTemplateKey | Text | Yes | No | No | No | MaxLength=255 |
| PageUrl | PageUrl | URL | No | No | No | No |  |
| PublishedDateUtc | PublishedDateUtc | DateTime | No | No | No | No |  |
| PublishStatus | PublishStatus | Choice | Yes | No | No | No | Choices: draft, published, error, scheduled |
| RenderVersion | RenderVersion | Text | No | No | No | No | MaxLength=255 |
| SyncStatus | SyncStatus | Choice | No | No | No | No | Choices: in-sync, pending, error |
| TargetSiteUrl | TargetSiteUrl | Text | Yes | No | No | No | MaxLength=255 |
| Title | Title | Text | Yes | No | No | No | MaxLength=255 |
| Color Tag | _ColorTag | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Label setting | _ComplianceFlags | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label | _ComplianceTag | Lookup | No | No | Yes | No | System/OOB-like |
| Label applied by | _ComplianceTagUserId | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label Applied | _ComplianceTagWrittenTime | Lookup | No | No | Yes | No | System/OOB-like |
| Has Copy Destinations | _HasCopyDestinations | Boolean | No | Yes | Yes | No | System/OOB-like |
| Item is a Record | _IsRecord | Computed | No | No | Yes | No | System/OOB-like |
| Approval Status | _ModerationStatus | ModStat | No | Yes | Yes | No | Choices: 0;#Approved, 1;#Rejected, 2;#Pending, 3;#Draft, 4;#Scheduled; Default=0; System/OOB-like |
| Version | _UIVersionString | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| App Created By | AppAuthor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| App Modified By | AppEditor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| Created By | Author | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Compliance Asset Id | ComplianceAssetId | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Content Type ID | ContentTypeId | ContentTypeId | No | Yes | Yes | No | System/OOB-like |
| Created | Created | DateTime | No | No | Yes | No | System/OOB-like |
| Type | DocIcon | Computed | No | No | Yes | No | System/OOB-like |
| Edit | Edit | Computed | No | No | Yes | No | System/OOB-like |
| Modified By | Editor | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Name | FileLeafRef | File | No | Yes | No | No | System/OOB-like |
| URL Path | FileRef | Lookup | No | Yes | Yes | No | System/OOB-like |
| Folder Child Count | FolderChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| GUID | GUID | Guid | No | Yes | Yes | No | System/OOB-like |
| ID | ID | Counter | No | No | Yes | No | System/OOB-like |
| Item Child Count | ItemChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| Title | LinkTitle | Computed | No | No | Yes | No | System/OOB-like |
| Title | LinkTitleNoMenu | Computed | No | No | Yes | No | System/OOB-like |
| Modified | Modified | DateTime | No | No | Yes | No | System/OOB-like |
| Unique Id | UniqueId | Lookup | No | Yes | Yes | No | System/OOB-like |

- Relationship observations:
  - Uses `ArticleId` as foreign-key style linkage to `HB Articles`.
  - Carries page-shell/template linkage via `PageTemplateKey`.
- Implementation notes:
  - Non-hidden editable fields: `17`
  - Hidden field count: `61`; relevant hidden/system fields observed: `ContentTypeId, _HasCopyDestinations, _ModerationStatus, GUID, FileRef, FileLeafRef, UniqueId`
  - Taxonomy fields: `none detected`
- Risks / ambiguities / follow-ups:
  - No explicit list-level validation formula/message detected unless shown in metadata; if app relies on hidden governance constraints, validate via UI-level list settings audit.
  - Form URLs resolve to default list forms; this extraction cannot alone prove whether Power Apps custom forms are bound.

### HB Article Media
- Purpose / observed role: Child media rows for article gallery/supporting assets and ordering.
- List-level metadata:
  - List ID: `2a52a9ec-1432-4c59-8eec-b2c1c188ad45`
  - Entity Type Name: `HB_x0020_Article_x0020_MediaList`
  - Site URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
  - Default View URL: `/sites/HBCentral/Lists/HB Article Media/AllItems.aspx`
  - Base Template / Base Type: `100` / `0`
  - Description: ``
  - Content Types Enabled: `false`
  - Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
  - Moderation: `EnableModeration=false`
  - Attachments Enabled: `true`
  - Item Count: `0`
  - Hidden: `false`
  - Forms: New=`/sites/HBCentral/Lists/HB Article Media/NewForm.aspx`, Edit=`/sites/HBCentral/Lists/HB Article Media/EditForm.aspx`, Display=`/sites/HBCentral/Lists/HB Article Media/DispForm.aspx`
  - Content types on list: `Item, Folder`

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| AltText | AltText | Note | Yes | No | No | No | RichText=false; Lines=6 |
| ArticleId | ArticleId | Text | Yes | No | No | No | MaxLength=255 |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| Caption | Caption | Note | No | No | No | No | RichText=false; Lines=6 |
| Content Type | ContentType | Computed | No | No | No | No |  |
| FeaturedInGallery | FeaturedInGallery | Boolean | No | No | No | No |  |
| GalleryGroup | GalleryGroup | Text | No | No | No | No | MaxLength=255 |
| ImageAsset | ImageAsset | URL | Yes | No | No | No |  |
| MediaId | MediaId | Text | Yes | No | No | No | MaxLength=255 |
| MediaRole | MediaRole | Choice | Yes | No | No | No | Choices: gallery, supporting, hero, secondary |
| SortOrder | SortOrder | Number | No | No | No | No |  |
| Title | Title | Text | Yes | No | No | No | MaxLength=255 |
| Color Tag | _ColorTag | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Label setting | _ComplianceFlags | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label | _ComplianceTag | Lookup | No | No | Yes | No | System/OOB-like |
| Label applied by | _ComplianceTagUserId | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label Applied | _ComplianceTagWrittenTime | Lookup | No | No | Yes | No | System/OOB-like |
| Has Copy Destinations | _HasCopyDestinations | Boolean | No | Yes | Yes | No | System/OOB-like |
| Item is a Record | _IsRecord | Computed | No | No | Yes | No | System/OOB-like |
| Approval Status | _ModerationStatus | ModStat | No | Yes | Yes | No | Choices: 0;#Approved, 1;#Rejected, 2;#Pending, 3;#Draft, 4;#Scheduled; Default=0; System/OOB-like |
| Version | _UIVersionString | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| App Created By | AppAuthor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| App Modified By | AppEditor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| Created By | Author | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Compliance Asset Id | ComplianceAssetId | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Content Type ID | ContentTypeId | ContentTypeId | No | Yes | Yes | No | System/OOB-like |
| Created | Created | DateTime | No | No | Yes | No | System/OOB-like |
| Type | DocIcon | Computed | No | No | Yes | No | System/OOB-like |
| Edit | Edit | Computed | No | No | Yes | No | System/OOB-like |
| Modified By | Editor | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Name | FileLeafRef | File | No | Yes | No | No | System/OOB-like |
| URL Path | FileRef | Lookup | No | Yes | Yes | No | System/OOB-like |
| Folder Child Count | FolderChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| GUID | GUID | Guid | No | Yes | Yes | No | System/OOB-like |
| ID | ID | Counter | No | No | Yes | No | System/OOB-like |
| Item Child Count | ItemChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| Title | LinkTitle | Computed | No | No | Yes | No | System/OOB-like |
| Title | LinkTitleNoMenu | Computed | No | No | Yes | No | System/OOB-like |
| Modified | Modified | DateTime | No | No | Yes | No | System/OOB-like |
| Unique Id | UniqueId | Lookup | No | Yes | Yes | No | System/OOB-like |

- Relationship observations:
  - Uses `ArticleId` as foreign-key style linkage to `HB Articles`.
- Implementation notes:
  - Non-hidden editable fields: `12`
  - Hidden field count: `61`; relevant hidden/system fields observed: `ContentTypeId, _HasCopyDestinations, _ModerationStatus, GUID, FileRef, FileLeafRef, UniqueId`
  - Taxonomy fields: `none detected`
- Risks / ambiguities / follow-ups:
  - No explicit list-level validation formula/message detected unless shown in metadata; if app relies on hidden governance constraints, validate via UI-level list settings audit.
  - Form URLs resolve to default list forms; this extraction cannot alone prove whether Power Apps custom forms are bound.

### HB Article Promotion Rules
- Purpose / observed role: Configuration defaults for destination/content promotion behavior.
- List-level metadata:
  - List ID: `1616667c-3984-4886-9d54-618d986f0456`
  - Entity Type Name: `HB_x0020_Article_x0020_Promotion_x0020_RulesList`
  - Site URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
  - Default View URL: `/sites/HBCentral/Lists/HB Article Promotion Rules/AllItems.aspx`
  - Base Template / Base Type: `100` / `0`
  - Description: ``
  - Content Types Enabled: `false`
  - Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
  - Moderation: `EnableModeration=false`
  - Attachments Enabled: `true`
  - Item Count: `0`
  - Hidden: `false`
  - Forms: New=`/sites/HBCentral/Lists/HB Article Promotion Rules/NewForm.aspx`, Edit=`/sites/HBCentral/Lists/HB Article Promotion Rules/EditForm.aspx`, Display=`/sites/HBCentral/Lists/HB Article Promotion Rules/DispForm.aspx`
  - Content types on list: `Item, Folder`

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| Attachments | Attachments | Attachments | No | No | No | No |  |
| Content Type | ContentType | Computed | No | No | No | No |  |
| Destination | Destination | Choice | Yes | No | No | No | Choices: companyPulse, projectSpotlight |
| FeaturedDefault | FeaturedDefault | Boolean | No | No | No | No | Default=0 |
| FeedWindowDays | FeedWindowDays | Number | No | No | No | No |  |
| IsActive | IsActive | Boolean | Yes | No | No | No | Default=1 |
| ManualOverrideAllowed | ManualOverrideAllowed | Boolean | No | No | No | No | Default=1 |
| Notes | Notes | Note | No | No | No | No | RichText=false; Lines=6 |
| PinnedDefault | PinnedDefault | Boolean | No | No | No | No | Default=0 |
| ContentType | RuleContentType | Choice | No | No | No | No | Choices: newsUpdate, monthlySpotlight, milestoneSpotlight, projectUpdate, announcement |
| RuleId | RuleId | Text | Yes | No | No | No | MaxLength=255 |
| Scope | Scope | Choice | Yes | No | No | No | Choices: destination, homepage, global |
| Title | Title | Text | Yes | No | No | No | MaxLength=255 |
| Color Tag | _ColorTag | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Label setting | _ComplianceFlags | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label | _ComplianceTag | Lookup | No | No | Yes | No | System/OOB-like |
| Label applied by | _ComplianceTagUserId | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label Applied | _ComplianceTagWrittenTime | Lookup | No | No | Yes | No | System/OOB-like |
| Has Copy Destinations | _HasCopyDestinations | Boolean | No | Yes | Yes | No | System/OOB-like |
| Item is a Record | _IsRecord | Computed | No | No | Yes | No | System/OOB-like |
| Approval Status | _ModerationStatus | ModStat | No | Yes | Yes | No | Choices: 0;#Approved, 1;#Rejected, 2;#Pending, 3;#Draft, 4;#Scheduled; Default=0; System/OOB-like |
| Version | _UIVersionString | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| App Created By | AppAuthor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| App Modified By | AppEditor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| Created By | Author | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Compliance Asset Id | ComplianceAssetId | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Content Type ID | ContentTypeId | ContentTypeId | No | Yes | Yes | No | System/OOB-like |
| Created | Created | DateTime | No | No | Yes | No | System/OOB-like |
| Type | DocIcon | Computed | No | No | Yes | No | System/OOB-like |
| Edit | Edit | Computed | No | No | Yes | No | System/OOB-like |
| Modified By | Editor | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Name | FileLeafRef | File | No | Yes | No | No | System/OOB-like |
| URL Path | FileRef | Lookup | No | Yes | Yes | No | System/OOB-like |
| Folder Child Count | FolderChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| GUID | GUID | Guid | No | Yes | Yes | No | System/OOB-like |
| ID | ID | Counter | No | No | Yes | No | System/OOB-like |
| Item Child Count | ItemChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| Title | LinkTitle | Computed | No | No | Yes | No | System/OOB-like |
| Title | LinkTitleNoMenu | Computed | No | No | Yes | No | System/OOB-like |
| Modified | Modified | DateTime | No | No | Yes | No | System/OOB-like |
| Unique Id | UniqueId | Lookup | No | Yes | Yes | No | System/OOB-like |

- Relationship observations:
  - Contains destination-scoping dimension (`Destination`) used in routing/promotion/publish behavior.
- Implementation notes:
  - Non-hidden editable fields: `13`
  - Hidden field count: `61`; relevant hidden/system fields observed: `ContentTypeId, _HasCopyDestinations, _ModerationStatus, GUID, FileRef, FileLeafRef, UniqueId`
  - Taxonomy fields: `none detected`
- Risks / ambiguities / follow-ups:
  - No explicit list-level validation formula/message detected unless shown in metadata; if app relies on hidden governance constraints, validate via UI-level list settings audit.
  - Form URLs resolve to default list forms; this extraction cannot alone prove whether Power Apps custom forms are bound.

### HB Article Publishing Errors
- Purpose / observed role: Operational error log for publish/sync attempts and retry status.
- List-level metadata:
  - List ID: `f7e71247-3c40-49b5-b1d1-03e1938b93e2`
  - Entity Type Name: `HB_x0020_Article_x0020_Publishing_x0020_ErrorsList`
  - Site URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
  - Default View URL: `/sites/HBCentral/Lists/HB Article Publishing Errors/AllItems.aspx`
  - Base Template / Base Type: `100` / `0`
  - Description: ``
  - Content Types Enabled: `false`
  - Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
  - Moderation: `EnableModeration=false`
  - Attachments Enabled: `true`
  - Item Count: `0`
  - Hidden: `false`
  - Forms: New=`/sites/HBCentral/Lists/HB Article Publishing Errors/NewForm.aspx`, Edit=`/sites/HBCentral/Lists/HB Article Publishing Errors/EditForm.aspx`, Display=`/sites/HBCentral/Lists/HB Article Publishing Errors/DispForm.aspx`
  - Content types on list: `Item, Folder`

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| ArticleId | ArticleId | Text | Yes | No | No | No | MaxLength=255 |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| BindingId | BindingId | Text | No | No | No | No | MaxLength=255 |
| Content Type | ContentType | Computed | No | No | No | No |  |
| Destination | Destination | Choice | Yes | No | No | No | Choices: companyPulse, projectSpotlight |
| ErrorId | ErrorId | Text | Yes | No | No | No | MaxLength=255 |
| ErrorSummary | ErrorSummary | Note | Yes | No | No | No | RichText=false; Lines=6 |
| LastAttemptDateUtc | LastAttemptDateUtc | DateTime | No | No | No | No |  |
| Operation | Operation | Choice | Yes | No | No | No | Choices: create, update, publish, sync |
| RetryStatus | RetryStatus | Choice | No | No | No | No | Choices: none, pending, resolved |
| Title | Title | Text | Yes | No | No | No | MaxLength=255 |
| Color Tag | _ColorTag | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Label setting | _ComplianceFlags | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label | _ComplianceTag | Lookup | No | No | Yes | No | System/OOB-like |
| Label applied by | _ComplianceTagUserId | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label Applied | _ComplianceTagWrittenTime | Lookup | No | No | Yes | No | System/OOB-like |
| Has Copy Destinations | _HasCopyDestinations | Boolean | No | Yes | Yes | No | System/OOB-like |
| Item is a Record | _IsRecord | Computed | No | No | Yes | No | System/OOB-like |
| Approval Status | _ModerationStatus | ModStat | No | Yes | Yes | No | Choices: 0;#Approved, 1;#Rejected, 2;#Pending, 3;#Draft, 4;#Scheduled; Default=0; System/OOB-like |
| Version | _UIVersionString | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| App Created By | AppAuthor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| App Modified By | AppEditor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| Created By | Author | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Compliance Asset Id | ComplianceAssetId | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Content Type ID | ContentTypeId | ContentTypeId | No | Yes | Yes | No | System/OOB-like |
| Created | Created | DateTime | No | No | Yes | No | System/OOB-like |
| Type | DocIcon | Computed | No | No | Yes | No | System/OOB-like |
| Edit | Edit | Computed | No | No | Yes | No | System/OOB-like |
| Modified By | Editor | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Name | FileLeafRef | File | No | Yes | No | No | System/OOB-like |
| URL Path | FileRef | Lookup | No | Yes | Yes | No | System/OOB-like |
| Folder Child Count | FolderChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| GUID | GUID | Guid | No | Yes | Yes | No | System/OOB-like |
| ID | ID | Counter | No | No | Yes | No | System/OOB-like |
| Item Child Count | ItemChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| Title | LinkTitle | Computed | No | No | Yes | No | System/OOB-like |
| Title | LinkTitleNoMenu | Computed | No | No | Yes | No | System/OOB-like |
| Modified | Modified | DateTime | No | No | Yes | No | System/OOB-like |
| Unique Id | UniqueId | Lookup | No | Yes | Yes | No | System/OOB-like |

- Relationship observations:
  - Uses `ArticleId` as foreign-key style linkage to `HB Articles`.
  - Uses `BindingId` linkage to destination-page binding records.
  - Contains destination-scoping dimension (`Destination`) used in routing/promotion/publish behavior.
- Implementation notes:
  - Non-hidden editable fields: `11`
  - Hidden field count: `61`; relevant hidden/system fields observed: `ContentTypeId, _HasCopyDestinations, _ModerationStatus, GUID, FileRef, FileLeafRef, UniqueId`
  - Taxonomy fields: `none detected`
- Risks / ambiguities / follow-ups:
  - No explicit list-level validation formula/message detected unless shown in metadata; if app relies on hidden governance constraints, validate via UI-level list settings audit.
  - Form URLs resolve to default list forms; this extraction cannot alone prove whether Power Apps custom forms are bound.

### HB Article Team Members
- Purpose / observed role: Child people rows for article-bound team/member presentation.
- List-level metadata:
  - List ID: `e4ee8251-09cd-45d5-a059-c9fb6e0d2f71`
  - Entity Type Name: `HB_x0020_Article_x0020_Team_x0020_MembersList`
  - Site URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
  - Default View URL: `/sites/HBCentral/Lists/HB Article Team Members/AllItems.aspx`
  - Base Template / Base Type: `100` / `0`
  - Description: ``
  - Content Types Enabled: `false`
  - Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
  - Moderation: `EnableModeration=false`
  - Attachments Enabled: `true`
  - Item Count: `0`
  - Hidden: `false`
  - Forms: New=`/sites/HBCentral/Lists/HB Article Team Members/NewForm.aspx`, Edit=`/sites/HBCentral/Lists/HB Article Team Members/EditForm.aspx`, Display=`/sites/HBCentral/Lists/HB Article Team Members/DispForm.aspx`
  - Content types on list: `Item, Folder`

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| ArticleId | ArticleId | Text | Yes | No | No | No | MaxLength=255 |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| BioSnippet | BioSnippet | Note | No | No | No | No | RichText=false; Lines=6 |
| Company | Company | Text | No | No | No | No | MaxLength=255 |
| ContactLink | ContactLink | URL | No | No | No | No |  |
| Content Type | ContentType | Computed | No | No | No | No |  |
| Department | Department | Text | No | No | No | No | MaxLength=255 |
| DisplayName | DisplayName | Text | Yes | No | No | No | MaxLength=255 |
| GroupKey | GroupKey | Text | No | No | No | No | MaxLength=255 |
| IsFeaturedMember | IsFeaturedMember | Boolean | No | No | No | No |  |
| ParentMemberId | ParentMemberId | Text | No | No | No | No | MaxLength=255 |
| PersonPrincipal | PersonPrincipal | User | Yes | No | No | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0 |
| Role | Role | Text | No | No | No | No | MaxLength=255 |
| SortOrder | SortOrder | Number | No | No | No | No |  |
| TeamMemberId | TeamMemberId | Text | Yes | No | No | No | MaxLength=255 |
| Title | Title | Text | Yes | No | No | No | MaxLength=255 |
| Color Tag | _ColorTag | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Label setting | _ComplianceFlags | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label | _ComplianceTag | Lookup | No | No | Yes | No | System/OOB-like |
| Label applied by | _ComplianceTagUserId | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label Applied | _ComplianceTagWrittenTime | Lookup | No | No | Yes | No | System/OOB-like |
| Has Copy Destinations | _HasCopyDestinations | Boolean | No | Yes | Yes | No | System/OOB-like |
| Item is a Record | _IsRecord | Computed | No | No | Yes | No | System/OOB-like |
| Approval Status | _ModerationStatus | ModStat | No | Yes | Yes | No | Choices: 0;#Approved, 1;#Rejected, 2;#Pending, 3;#Draft, 4;#Scheduled; Default=0; System/OOB-like |
| Version | _UIVersionString | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| App Created By | AppAuthor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| App Modified By | AppEditor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| Created By | Author | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Compliance Asset Id | ComplianceAssetId | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Content Type ID | ContentTypeId | ContentTypeId | No | Yes | Yes | No | System/OOB-like |
| Created | Created | DateTime | No | No | Yes | No | System/OOB-like |
| Type | DocIcon | Computed | No | No | Yes | No | System/OOB-like |
| Edit | Edit | Computed | No | No | Yes | No | System/OOB-like |
| Modified By | Editor | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Name | FileLeafRef | File | No | Yes | No | No | System/OOB-like |
| URL Path | FileRef | Lookup | No | Yes | Yes | No | System/OOB-like |
| Folder Child Count | FolderChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| GUID | GUID | Guid | No | Yes | Yes | No | System/OOB-like |
| ID | ID | Counter | No | No | Yes | No | System/OOB-like |
| Item Child Count | ItemChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| Title | LinkTitle | Computed | No | No | Yes | No | System/OOB-like |
| Title | LinkTitleNoMenu | Computed | No | No | Yes | No | System/OOB-like |
| Modified | Modified | DateTime | No | No | Yes | No | System/OOB-like |
| Unique Id | UniqueId | Lookup | No | Yes | Yes | No | System/OOB-like |

- Relationship observations:
  - Uses `ArticleId` as foreign-key style linkage to `HB Articles`.
- Implementation notes:
  - Non-hidden editable fields: `16`
  - Hidden field count: `61`; relevant hidden/system fields observed: `ContentTypeId, _HasCopyDestinations, _ModerationStatus, GUID, FileRef, FileLeafRef, UniqueId`
  - Taxonomy fields: `none detected`
- Risks / ambiguities / follow-ups:
  - No explicit list-level validation formula/message detected unless shown in metadata; if app relies on hidden governance constraints, validate via UI-level list settings audit.
  - Form URLs resolve to default list forms; this extraction cannot alone prove whether Power Apps custom forms are bound.

### HB Article Template Registry
- Purpose / observed role: Template/profile registry controlling render composition and visibility toggles.
- List-level metadata:
  - List ID: `1ff18492-ba73-4591-a16e-2d4576744f18`
  - Entity Type Name: `HB_x0020_Article_x0020_Template_x0020_RegistryList`
  - Site URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
  - Default View URL: `/sites/HBCentral/Lists/HB Article Template Registry/AllItems.aspx`
  - Base Template / Base Type: `100` / `0`
  - Description: ``
  - Content Types Enabled: `false`
  - Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
  - Moderation: `EnableModeration=false`
  - Attachments Enabled: `true`
  - Item Count: `0`
  - Hidden: `false`
  - Forms: New=`/sites/HBCentral/Lists/HB Article Template Registry/NewForm.aspx`, Edit=`/sites/HBCentral/Lists/HB Article Template Registry/EditForm.aspx`, Display=`/sites/HBCentral/Lists/HB Article Template Registry/DispForm.aspx`
  - Content types on list: `Item, Folder`

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| ArticleSubjects | ArticleSubjects | MultiChoice | No | No | No | No | Choices: TBD |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| BodyProfileKey | BodyProfileKey | Text | Yes | No | No | No | MaxLength=255 |
| Content Type | ContentType | Computed | No | No | No | No |  |
| ContentTypes | ContentTypes | MultiChoice | Yes | No | No | No | Choices: TBD |
| Destination | Destination | Choice | Yes | No | No | No | Choices: companyPulse, projectSpotlight |
| GalleryProfileKey | GalleryProfileKey | Text | No | No | No | No | MaxLength=255 |
| HeroProfileKey | HeroProfileKey | Text | Yes | No | No | No | MaxLength=255 |
| IsActive | IsActive | Boolean | Yes | No | No | No | Default=1 |
| Notes | Notes | Note | No | No | No | No | RichText=false; Lines=6 |
| PageShellTemplateKey | PageShellTemplateKey | Text | Yes | No | No | No | MaxLength=255 |
| ProjectStages | ProjectStages | MultiChoice | No | No | No | No | Choices: TBD |
| RequiredFieldSetKey | RequiredFieldSetKey | Text | Yes | No | No | No | MaxLength=255 |
| ShowBody | ShowBody | Boolean | Yes | No | No | No | Default=1 |
| ShowGallery | ShowGallery | Boolean | Yes | No | No | No | Default=1 |
| ShowHero | ShowHero | Boolean | Yes | No | No | No | Default=1 |
| ShowSecondaryImage | ShowSecondaryImage | Boolean | Yes | No | No | No | Default=1 |
| ShowTeamViewer | ShowTeamViewer | Boolean | Yes | No | No | No | Default=1 |
| SpotlightTypes | SpotlightTypes | MultiChoice | No | No | No | No | Choices: TBD |
| TeamViewerProfileKey | TeamViewerProfileKey | Text | No | No | No | No | MaxLength=255 |
| TemplateKey | TemplateKey | Text | Yes | No | No | No | MaxLength=255 |
| TemplateName | TemplateName | Text | Yes | No | No | No | MaxLength=255 |
| TemplatePriority | TemplatePriority | Number | Yes | No | No | No |  |
| Title | Title | Text | Yes | No | No | No | MaxLength=255 |
| VersionLabel | VersionLabel | Text | No | No | No | No | MaxLength=255 |
| Color Tag | _ColorTag | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Label setting | _ComplianceFlags | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label | _ComplianceTag | Lookup | No | No | Yes | No | System/OOB-like |
| Label applied by | _ComplianceTagUserId | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label Applied | _ComplianceTagWrittenTime | Lookup | No | No | Yes | No | System/OOB-like |
| Has Copy Destinations | _HasCopyDestinations | Boolean | No | Yes | Yes | No | System/OOB-like |
| Item is a Record | _IsRecord | Computed | No | No | Yes | No | System/OOB-like |
| Approval Status | _ModerationStatus | ModStat | No | Yes | Yes | No | Choices: 0;#Approved, 1;#Rejected, 2;#Pending, 3;#Draft, 4;#Scheduled; Default=0; System/OOB-like |
| Version | _UIVersionString | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| App Created By | AppAuthor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| App Modified By | AppEditor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| Created By | Author | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Compliance Asset Id | ComplianceAssetId | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Content Type ID | ContentTypeId | ContentTypeId | No | Yes | Yes | No | System/OOB-like |
| Created | Created | DateTime | No | No | Yes | No | System/OOB-like |
| Type | DocIcon | Computed | No | No | Yes | No | System/OOB-like |
| Edit | Edit | Computed | No | No | Yes | No | System/OOB-like |
| Modified By | Editor | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Name | FileLeafRef | File | No | Yes | No | No | System/OOB-like |
| URL Path | FileRef | Lookup | No | Yes | Yes | No | System/OOB-like |
| Folder Child Count | FolderChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| GUID | GUID | Guid | No | Yes | Yes | No | System/OOB-like |
| ID | ID | Counter | No | No | Yes | No | System/OOB-like |
| Item Child Count | ItemChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| Title | LinkTitle | Computed | No | No | Yes | No | System/OOB-like |
| Title | LinkTitleNoMenu | Computed | No | No | Yes | No | System/OOB-like |
| Modified | Modified | DateTime | No | No | Yes | No | System/OOB-like |
| Unique Id | UniqueId | Lookup | No | Yes | Yes | No | System/OOB-like |

- Relationship observations:
  - Contains destination-scoping dimension (`Destination`) used in routing/promotion/publish behavior.
- Implementation notes:
  - Non-hidden editable fields: `25`
  - Hidden field count: `61`; relevant hidden/system fields observed: `ContentTypeId, _HasCopyDestinations, _ModerationStatus, GUID, FileRef, FileLeafRef, UniqueId`
  - Taxonomy fields: `none detected`
- Risks / ambiguities / follow-ups:
  - No explicit list-level validation formula/message detected unless shown in metadata; if app relies on hidden governance constraints, validate via UI-level list settings audit.
  - Form URLs resolve to default list forms; this extraction cannot alone prove whether Power Apps custom forms are bound.

### HB Article Workflow History
- Purpose / observed role: Audit trail of article workflow transitions and actors.
- List-level metadata:
  - List ID: `784a69bd-4276-4476-870c-ea957298c8aa`
  - Entity Type Name: `HB_x0020_Article_x0020_Workflow_x0020_HistoryList`
  - Site URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
  - Default View URL: `/sites/HBCentral/Lists/HB Article Workflow History/AllItems.aspx`
  - Base Template / Base Type: `100` / `0`
  - Description: ``
  - Content Types Enabled: `false`
  - Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
  - Moderation: `EnableModeration=false`
  - Attachments Enabled: `true`
  - Item Count: `0`
  - Hidden: `false`
  - Forms: New=`/sites/HBCentral/Lists/HB Article Workflow History/NewForm.aspx`, Edit=`/sites/HBCentral/Lists/HB Article Workflow History/EditForm.aspx`, Display=`/sites/HBCentral/Lists/HB Article Workflow History/DispForm.aspx`
  - Content types on list: `Item, Folder`

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| ActionDateUtc | ActionDateUtc | DateTime | Yes | No | No | No |  |
| ActionNote | ActionNote | Note | No | No | No | No | RichText=false; Lines=6 |
| ActorEmail | ActorEmail | Text | No | No | No | No | MaxLength=255 |
| ArticleId | ArticleId | Text | Yes | No | No | No | MaxLength=255 |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| Content Type | ContentType | Computed | No | No | No | No |  |
| HistoryId | HistoryId | Text | Yes | No | No | No | MaxLength=255 |
| NewState | NewState | Choice | Yes | No | No | No | Choices: draft, review, approved, scheduled, published, archived, withdrawn |
| PreviousState | PreviousState | Choice | No | No | No | No | Choices: draft, review, approved, scheduled, published, archived, withdrawn |
| Title | Title | Text | Yes | No | No | No | MaxLength=255 |
| Color Tag | _ColorTag | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Label setting | _ComplianceFlags | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label | _ComplianceTag | Lookup | No | No | Yes | No | System/OOB-like |
| Label applied by | _ComplianceTagUserId | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label Applied | _ComplianceTagWrittenTime | Lookup | No | No | Yes | No | System/OOB-like |
| Has Copy Destinations | _HasCopyDestinations | Boolean | No | Yes | Yes | No | System/OOB-like |
| Item is a Record | _IsRecord | Computed | No | No | Yes | No | System/OOB-like |
| Approval Status | _ModerationStatus | ModStat | No | Yes | Yes | No | Choices: 0;#Approved, 1;#Rejected, 2;#Pending, 3;#Draft, 4;#Scheduled; Default=0; System/OOB-like |
| Version | _UIVersionString | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| App Created By | AppAuthor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| App Modified By | AppEditor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| Created By | Author | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Compliance Asset Id | ComplianceAssetId | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Content Type ID | ContentTypeId | ContentTypeId | No | Yes | Yes | No | System/OOB-like |
| Created | Created | DateTime | No | No | Yes | No | System/OOB-like |
| Type | DocIcon | Computed | No | No | Yes | No | System/OOB-like |
| Edit | Edit | Computed | No | No | Yes | No | System/OOB-like |
| Modified By | Editor | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Name | FileLeafRef | File | No | Yes | No | No | System/OOB-like |
| URL Path | FileRef | Lookup | No | Yes | Yes | No | System/OOB-like |
| Folder Child Count | FolderChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| GUID | GUID | Guid | No | Yes | Yes | No | System/OOB-like |
| ID | ID | Counter | No | No | Yes | No | System/OOB-like |
| Item Child Count | ItemChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| Title | LinkTitle | Computed | No | No | Yes | No | System/OOB-like |
| Title | LinkTitleNoMenu | Computed | No | No | Yes | No | System/OOB-like |
| Modified | Modified | DateTime | No | No | Yes | No | System/OOB-like |
| Unique Id | UniqueId | Lookup | No | Yes | Yes | No | System/OOB-like |

- Relationship observations:
  - Uses `ArticleId` as foreign-key style linkage to `HB Articles`.
- Implementation notes:
  - Non-hidden editable fields: `10`
  - Hidden field count: `61`; relevant hidden/system fields observed: `ContentTypeId, _HasCopyDestinations, _ModerationStatus, GUID, FileRef, FileLeafRef, UniqueId`
  - Taxonomy fields: `none detected`
- Risks / ambiguities / follow-ups:
  - No explicit list-level validation formula/message detected unless shown in metadata; if app relies on hidden governance constraints, validate via UI-level list settings audit.
  - Form URLs resolve to default list forms; this extraction cannot alone prove whether Power Apps custom forms are bound.

### HB Articles
- Purpose / observed role: Primary master article record with content, workflow, promotion, and page-binding metadata.
- List-level metadata:
  - List ID: `35fa0564-6df6-4727-b983-2b34ad3a2874`
  - Entity Type Name: `HB_x0020_ArticlesList`
  - Site URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
  - Default View URL: `/sites/HBCentral/Lists/HB Articles/AllItems.aspx`
  - Base Template / Base Type: `100` / `0`
  - Description: ``
  - Content Types Enabled: `false`
  - Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
  - Moderation: `EnableModeration=false`
  - Attachments Enabled: `true`
  - Item Count: `0`
  - Hidden: `false`
  - Forms: New=`/sites/HBCentral/Lists/HB Articles/NewForm.aspx`, Edit=`/sites/HBCentral/Lists/HB Articles/EditForm.aspx`, Display=`/sites/HBCentral/Lists/HB Articles/DispForm.aspx`
  - Content types on list: `Item, Folder`

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| ApprovalOwnerEmail | ApprovalOwnerEmail | Text | No | No | No | No | MaxLength=255 |
| ArchiveDateUtc | ArchiveDateUtc | DateTime | No | No | No | No |  |
| ContentType | ArticleContentType | Choice | Yes | No | No | No | Choices: newsUpdate, monthlySpotlight, milestoneSpotlight, projectUpdate, announcement |
| ArticleId | ArticleId | Text | Yes | No | No | No | MaxLength=255 |
| ArticleSubject | ArticleSubject | Choice | No | No | No | No | Choices: general, people, project, operations, safety |
| Attachments | Attachments | Attachments | No | No | No | No |  |
| AudienceTags | AudienceTags | MultiChoice | No | No | No | No | Choices: TBD |
| AuthorDisplayName | AuthorDisplayName | Text | No | No | No | No | MaxLength=255 |
| AuthorEmail | AuthorEmail | Text | No | No | No | No | MaxLength=255 |
| BodyClosing | BodyClosing | Note | No | No | No | No | RichText=true; Lines=6 |
| BodyIntro | BodyIntro | Note | No | No | No | No | RichText=true; Lines=6 |
| BodyRichText | BodyRichText | Note | Yes | No | No | No | RichText=true; Lines=6 |
| BodyStyleVariant | BodyStyleVariant | Choice | No | No | No | No | Choices: default, feature, longform |
| BusinessUnit | BusinessUnit | Choice | No | No | No | No | Choices: estimating, operations, preconstruction, executive |
| CalloutText | CalloutText | Note | No | No | No | No | RichText=false; Lines=6 |
| CampaignWindowEndUtc | CampaignWindowEndUtc | DateTime | No | No | No | No |  |
| CampaignWindowStartUtc | CampaignWindowStartUtc | DateTime | No | No | No | No |  |
| ChangeReason | ChangeReason | Note | No | No | No | No | RichText=false; Lines=6 |
| Content Type | ContentType | Computed | No | No | No | No |  |
| CreatedDateUtc | CreatedDateUtc | DateTime | Yes | No | No | No |  |
| Destination | Destination | Choice | Yes | No | No | No | Choices: companyPulse, projectSpotlight |
| FeaturedRank | FeaturedRank | Number | No | No | No | No |  |
| FeaturedScope | FeaturedScope | MultiChoice | No | No | No | No | Choices: TBD |
| HeroCategoryLabel | HeroCategoryLabel | Text | No | No | No | No | MaxLength=255 |
| HeroCtaLabel | HeroCtaLabel | Text | No | No | No | No | MaxLength=255 |
| HeroCtaUrl | HeroCtaUrl | URL | No | No | No | No |  |
| HeroEyebrow | HeroEyebrow | Text | No | No | No | No | MaxLength=255 |
| HeroImageFocalPoint | HeroImageFocalPoint | Text | No | No | No | No | MaxLength=255 |
| HeroMetadataMode | HeroMetadataMode | Choice | No | No | No | No | Choices: standard, compact, hidden |
| HeroPrimaryImage | HeroPrimaryImage | URL | Yes | No | No | No |  |
| HeroPrimaryImageAltText | HeroPrimaryImageAltText | Note | Yes | No | No | No | RichText=false; Lines=6 |
| HeroShowMetadata | HeroShowMetadata | Boolean | No | No | No | No |  |
| HeroSubhead | HeroSubhead | Note | No | No | No | No | RichText=false; Lines=6 |
| HeroThemeVariant | HeroThemeVariant | Choice | No | No | No | No | Choices: default, light, dark |
| HeroTitle | HeroTitle | Text | No | No | No | No | MaxLength=255 |
| IncludeInArchive | IncludeInArchive | Boolean | No | No | No | No |  |
| IncludeInDestinationLanding | IncludeInDestinationLanding | Boolean | No | No | No | No |  |
| IncludeInHomepageFeed | IncludeInHomepageFeed | Boolean | No | No | No | No |  |
| IsFeatured | IsFeatured | Boolean | No | No | No | No |  |
| IsPinned | IsPinned | Boolean | No | No | No | No |  |
| LastPageSyncDateUtc | LastPageSyncDateUtc | DateTime | No | No | No | No |  |
| LastReviewedDateUtc | LastReviewedDateUtc | DateTime | No | No | No | No |  |
| ManualSortOverride | ManualSortOverride | Number | No | No | No | No |  |
| MarketSector | MarketSector | Choice | No | No | No | No | Choices: commercial, healthcare, education, public |
| MilestoneDateUtc | MilestoneDateUtc | DateTime | No | No | No | No |  |
| MilestoneLabel | MilestoneLabel | Text | No | No | No | No | MaxLength=255 |
| PageId | PageId | Text | No | No | No | No | MaxLength=255 |
| PageName | PageName | Text | No | No | No | No | MaxLength=255 |
| PageShellVersion | PageShellVersion | Text | No | No | No | No | MaxLength=255 |
| PageSyncStatus | PageSyncStatus | Choice | No | No | No | No | Choices: in-sync, pending, error |
| PageTemplateKey | PageTemplateKey | Text | No | No | No | No | MaxLength=255 |
| PageUrl | PageUrl | URL | No | No | No | No |  |
| PinRank | PinRank | Number | No | No | No | No |  |
| ProjectId | ProjectId | Text | No | No | No | No | MaxLength=255 |
| ProjectLocation | ProjectLocation | Text | No | No | No | No | MaxLength=255 |
| ProjectName | ProjectName | Text | No | No | No | No | MaxLength=255 |
| ProjectSector | ProjectSector | Text | No | No | No | No | MaxLength=255 |
| ProjectStage | ProjectStage | Choice | No | No | No | No | Choices: precon, active, closeout, completed |
| ProjectStatusLabel | ProjectStatusLabel | Text | No | No | No | No | MaxLength=255 |
| ProjectStatusVariant | ProjectStatusVariant | Choice | No | No | No | No | Choices: success, warning, info, critical |
| PublishedByEmail | PublishedByEmail | Text | No | No | No | No | MaxLength=255 |
| PublishedDateUtc | PublishedDateUtc | DateTime | No | No | No | No |  |
| PullQuote | PullQuote | Note | No | No | No | No | RichText=false; Lines=6 |
| Region | Region | Choice | No | No | No | No | Choices: north, central, south, west |
| RenderVersion | RenderVersion | Text | No | No | No | No | MaxLength=255 |
| RequiresReapprovalOnEdit | RequiresReapprovalOnEdit | Boolean | No | No | No | No |  |
| ReviewOwnerEmail | ReviewOwnerEmail | Text | No | No | No | No | MaxLength=255 |
| RevisionNote | RevisionNote | Note | No | No | No | No | RichText=false; Lines=6 |
| ScheduledPublishDateUtc | ScheduledPublishDateUtc | DateTime | No | No | No | No |  |
| SecondaryImage | SecondaryImage | URL | No | No | No | No |  |
| SecondaryImageAltText | SecondaryImageAltText | Note | No | No | No | No | RichText=false; Lines=6 |
| SecondaryImageCaption | SecondaryImageCaption | Note | No | No | No | No | RichText=false; Lines=6 |
| ShowSecondaryImage | ShowSecondaryImage | Boolean | No | No | No | No |  |
| ShowTeamViewer | ShowTeamViewer | Boolean | No | No | No | No |  |
| Slug | Slug | Text | Yes | No | No | No | MaxLength=255 |
| SpotlightType | SpotlightType | Choice | No | No | No | No | Choices: monthly, milestone, other |
| Subhead | Subhead | Note | Yes | No | No | No | RichText=false; Lines=6 |
| SummaryExcerpt | SummaryExcerpt | Note | Yes | No | No | No | RichText=false; Lines=6 |
| SuppressFromRollups | SuppressFromRollups | Boolean | No | No | No | No |  |
| TargetSiteUrl | TargetSiteUrl | Text | No | No | No | No | MaxLength=255 |
| TeamViewerAllowExpand | TeamViewerAllowExpand | Boolean | No | No | No | No |  |
| TeamViewerGroupingMode | TeamViewerGroupingMode | Choice | No | No | No | No | Choices: none, discipline, company, hierarchy |
| TeamViewerIntro | TeamViewerIntro | Note | No | No | No | No | RichText=false; Lines=6 |
| TeamViewerMaxInitialVisible | TeamViewerMaxInitialVisible | Number | No | No | No | No |  |
| TeamViewerMode | TeamViewerMode | Choice | No | No | No | No | Choices: compact, grouped, orgChart, summaryExpand |
| TeamViewerSortMode | TeamViewerSortMode | Choice | No | No | No | No | Choices: manual, role, hierarchy |
| TeamViewerTitle | TeamViewerTitle | Text | No | No | No | No | MaxLength=255 |
| TemplateKey | TemplateKey | Text | Yes | No | No | No | MaxLength=255 |
| TemplateOverrideAllowed | TemplateOverrideAllowed | Boolean | No | No | No | No |  |
| Title | Title | Text | Yes | No | No | No | MaxLength=255 |
| UpdatedDateUtc | UpdatedDateUtc | DateTime | Yes | No | No | No |  |
| WorkflowState | WorkflowState | Choice | Yes | No | No | No | Choices: draft, review, approved, scheduled, published, archived, withdrawn |
| Color Tag | _ColorTag | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Label setting | _ComplianceFlags | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label | _ComplianceTag | Lookup | No | No | Yes | No | System/OOB-like |
| Label applied by | _ComplianceTagUserId | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label Applied | _ComplianceTagWrittenTime | Lookup | No | No | Yes | No | System/OOB-like |
| Has Copy Destinations | _HasCopyDestinations | Boolean | No | Yes | Yes | No | System/OOB-like |
| Item is a Record | _IsRecord | Computed | No | No | Yes | No | System/OOB-like |
| Approval Status | _ModerationStatus | ModStat | No | Yes | Yes | No | Choices: 0;#Approved, 1;#Rejected, 2;#Pending, 3;#Draft, 4;#Scheduled; Default=0; System/OOB-like |
| Version | _UIVersionString | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| App Created By | AppAuthor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| App Modified By | AppEditor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| Created By | Author | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Compliance Asset Id | ComplianceAssetId | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Content Type ID | ContentTypeId | ContentTypeId | No | Yes | Yes | No | System/OOB-like |
| Created | Created | DateTime | No | No | Yes | No | System/OOB-like |
| Type | DocIcon | Computed | No | No | Yes | No | System/OOB-like |
| Edit | Edit | Computed | No | No | Yes | No | System/OOB-like |
| Modified By | Editor | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Name | FileLeafRef | File | No | Yes | No | No | System/OOB-like |
| URL Path | FileRef | Lookup | No | Yes | Yes | No | System/OOB-like |
| Folder Child Count | FolderChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| GUID | GUID | Guid | No | Yes | Yes | No | System/OOB-like |
| ID | ID | Counter | No | No | Yes | No | System/OOB-like |
| Item Child Count | ItemChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| Title | LinkTitle | Computed | No | No | Yes | No | System/OOB-like |
| Title | LinkTitleNoMenu | Computed | No | No | Yes | No | System/OOB-like |
| Modified | Modified | DateTime | No | No | Yes | No | System/OOB-like |
| Unique Id | UniqueId | Lookup | No | Yes | Yes | No | System/OOB-like |

- Relationship observations:
  - Uses `ArticleId` as foreign-key style linkage to `HB Articles`.
  - Likely resolves to `HB Article Template Registry.TemplateKey`.
  - Carries page-shell/template linkage via `PageTemplateKey`.
  - Contains destination-scoping dimension (`Destination`) used in routing/promotion/publish behavior.
- Implementation notes:
  - Non-hidden editable fields: `92`
  - Hidden field count: `61`; relevant hidden/system fields observed: `ContentTypeId, _HasCopyDestinations, _ModerationStatus, GUID, FileRef, FileLeafRef, UniqueId`
  - Taxonomy fields: `none detected`
- Risks / ambiguities / follow-ups:
  - No explicit list-level validation formula/message detected unless shown in metadata; if app relies on hidden governance constraints, validate via UI-level list settings audit.
  - Form URLs resolve to default list forms; this extraction cannot alone prove whether Power Apps custom forms are bound.

## 5. Cross-List Relationship Map
- Likely primary/master list: `HB Articles` (contains broad article content, workflow, promotion, and page-binding fields).
- Child/supporting lists with `ArticleId` linkage:
  - `HB Article Team Members`
  - `HB Article Media`
  - `HB Article Destination Pages`
  - `HB Article Workflow History`
  - `HB Article Publishing Errors`
- Template registry role: `HB Article Template Registry` keyed by `TemplateKey` with rendering/profile toggles.
- Promotion policy role: `HB Article Promotion Rules` keyed by `RuleId` with `Destination` and `RuleContentType` scope fields.
- Workflow/error tracking roles:
  - History: `HB Article Workflow History` (`HistoryId`, `ArticleId`, state transition fields)
  - Errors: `HB Article Publishing Errors` (`ErrorId`, `ArticleId`, optional `BindingId`, operation/retry fields)
- Lookup dependencies: no cross-list custom lookup columns detected among publisher custom fields; relationships are implemented primarily with key-style text fields (`ArticleId`, `BindingId`, `TemplateKey`, etc.).

## 6. Implementation-Relevant Findings
- All 8 requested lists resolved and were readable in tenant; duplicate source reference (`HB Article Team Members`) was extracted once.
- All lists are Generic List template (`BaseTemplate=100`) with zero items at extraction time.
- `ContentTypesEnabled=false` for all lists; list still carries OOB `Item` and `Folder` content types.
- Required publisher linkage fields are present as expected (`ArticleId`, `BindingId`, `TemplateKey`, `PageTemplateKey`, etc.).
- `HB Articles` uses `ArticleContentType` (not internal name `ContentType`) indicating reserved-name avoidance strategy in schema implementation.
- No custom indexed or unique-enforced publisher fields were detected in current schema export surface; check performance/index strategy if list volume is expected to grow materially.
- No managed metadata (taxonomy) fields were detected across the extracted lists.
- High OOB/system field footprint exists on each list (hidden/read-only fields), but publisher behavior appears to rely on non-hidden custom columns plus standard audit fields (`Author`, `Editor`, `Created`, `Modified`).
- Potential migration concern: key relationships are text-based rather than SharePoint lookup-enforced, so referential integrity must be enforced in app/business logic.

## 7. Open Questions / Follow-Up Checks
- Confirm whether any list currently has Power Apps custom forms bound despite default form URL patterns.
- Confirm desired indexing strategy for high-cardinality fields (`ArticleId`, `BindingId`, `TemplateKey`, `WorkflowState`, `Destination`) for production-scale query performance.
- Validate if text-key relationship strategy is intentional long-term vs potential future lookup hardening.
- If governance requires enforced uniqueness for IDs (`ArticleId`, `BindingId`, `RuleId`, `ErrorId`, `HistoryId`), add explicit unique constraints and migration checks.
