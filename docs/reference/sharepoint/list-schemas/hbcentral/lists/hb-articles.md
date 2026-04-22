# HB Articles

## 1. Objective
- Tenant-backed schema/reference snapshot for `HB Articles` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.

## 2. List-Level Metadata
- List ID: `35fa0564-6df6-4727-b983-2b34ad3a2874`
- Entity Type Name: `HB_x0020_ArticlesList`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB Articles/AllItems.aspx`
- Default View URL: `/sites/HBCentral/Lists/HB Articles/AllItems.aspx`
- Root Folder URL: `/sites/HBCentral/Lists/HB Articles`
- Base Template / Base Type: `100` / `0`
- Classification: `business/custom`
- Description: ``
- Hidden: `false`
- Item Count: `0`
- Content Types Enabled: `false`
- Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
- Moderation: `EnableModeration=false`
- Attachments Enabled: `true`

## 3. Field Schema

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

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: `Item, Folder`
- Default New Form: `/sites/HBCentral/Lists/HB Articles/NewForm.aspx`
- Default Edit Form: `/sites/HBCentral/Lists/HB Articles/EditForm.aspx`
- Default Display Form: `/sites/HBCentral/Lists/HB Articles/DispForm.aspx`
- Appears Custom Forms (URL heuristic): `true`
- Observed Role Hint: `list role inferred from schema and naming`

## 5. Relationship Observations
- Contains key field `ArticleId` (likely join/filter dimension).
- Contains key field `TemplateKey` (likely join/filter dimension).
- Contains key field `PageTemplateKey` (likely join/filter dimension).
- Contains key field `ProjectId` (likely join/filter dimension).
- Contains key field `WorkflowState` (likely join/filter dimension).
- Contains key field `Destination` (likely join/filter dimension).
- Outbound lookup references: AppPrincipals, User Information List.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `92`
- Hidden fields: `61`
- Non-hidden lookup fields: `4`
- Unique-enforced fields: `0`
- Indexed non-hidden fields: `0`
- System/OOB fields are included where integration-relevant; app contracts should prefer non-hidden business fields unless specific OOB audit/compliance metadata is required.

## 7. Open Questions / Follow-Up Checks
- Confirm custom form bindings in list settings if app UX depends on Power Apps forms.
- Confirm canonical join keys and index strategy for production query patterns.
- Re-extract after provisioning changes or when schema drift is suspected.
