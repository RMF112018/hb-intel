# 03 — Exact Field Definitions

## Conventions

- `Required` indicates whether the field is required on the list schema
- `MVP` indicates whether the field should exist in initial delivery
- `May Evolve` flags fields likely to change as shared renderers evolve

---

## A. HB Articles — exact fields

| Internal Field | Type | Required | MVP | Description | Notes |
|---|---|---:|---:|---|---|
| `ArticleId` | Single line text | Yes | Yes | Durable article key | Primary external article identity |
| `Title` | Single line text | Yes | Yes | Editorial article title | Used in rollups and often hero |
| `HeroTitle` | Single line text | No | Yes | Optional hero title override | May evolve with `hbSignatureHero` |
| `Subhead` | Multiple lines plain text | Yes | Yes | Editorial subhead/dek | |
| `HeroSubhead` | Multiple lines plain text | No | Yes | Optional hero subhead override | May evolve with `hbSignatureHero` |
| `SummaryExcerpt` | Multiple lines plain text | Yes | Yes | Short summary/teaser | Used in feeds and cards |
| `Destination` | Choice | Yes | Yes | `companyPulse` / `projectSpotlight` | Template driver |
| `ContentType` | Choice | Yes | Yes | News/update/monthly spotlight/milestone spotlight/etc. | Template driver |
| `ArticleSubject` | Choice or taxonomy | No | Yes | Subject family / topic | Template driver |
| `TemplateKey` | Single line text | Yes | Yes | Resolved template identifier | Usually system-resolved |
| `TemplateOverrideAllowed` | Yes/No | No | No | Whether admin override is permitted | |
| `Slug` | Single line text | Yes | Yes | Destination page slug / file-name base | Unique per destination |
| `WorkflowState` | Choice | Yes | Yes | Draft/review/approved/scheduled/published/archived/withdrawn | |
| `AuthorEmail` | Single line text | No | Yes | Author identity reference | |
| `AuthorDisplayName` | Single line text | No | Yes | Author display name | |
| `CreatedDateUtc` | DateTime | Yes | Yes | System-created timestamp | |
| `UpdatedDateUtc` | DateTime | Yes | Yes | System-updated timestamp | |
| `PublishedDateUtc` | DateTime | No | Yes | Actual publish timestamp | |
| `ScheduledPublishDateUtc` | DateTime | No | Yes | Scheduled publish time | |
| `ArchiveDateUtc` | DateTime | No | Yes | Archive threshold | |
| `BusinessUnit` | Choice or taxonomy | No | Yes | Business unit classifier | |
| `MarketSector` | Choice or taxonomy | No | Yes | Market/sector classifier | |
| `Region` | Choice or taxonomy | No | Yes | Regional classifier | |
| `AudienceTags` | Choice multi or taxonomy | No | No | Audience targeting classifier | |
| `ProjectId` | Single line text | No | Yes | Project identifier for ProjectSpotlight | |
| `ProjectName` | Single line text | No | Yes | Project display name | |
| `ProjectStage` | Choice | No | Yes | Stage for spotlight articles | Template driver |
| `SpotlightType` | Choice | No | Yes | Monthly/milestone/other spotlight mode | Template driver |
| `MilestoneDateUtc` | DateTime | No | No | Milestone date | |
| `MilestoneLabel` | Single line text | No | No | Milestone descriptor | |
| `ProjectLocation` | Single line text | No | Yes | Project location | |
| `ProjectSector` | Single line text | No | Yes | Project sector | |
| `ProjectStatusLabel` | Single line text | No | No | Status text | Future display module candidate |
| `ProjectStatusVariant` | Choice | No | No | success/warning/info/etc. | |
| `HeroPrimaryImage` | Hyperlink/Image reference | Yes | Yes | Main hero image | |
| `HeroPrimaryImageAltText` | Multiple lines plain text | Yes | Yes | Alt text for hero image | |
| `HeroEyebrow` | Single line text | No | Yes | Hero eyebrow/category | May evolve |
| `HeroCategoryLabel` | Single line text | No | Yes | Hero category label | May evolve |
| `HeroThemeVariant` | Choice | No | Yes | Hero visual variant | May evolve |
| `HeroImageFocalPoint` | Single line text / JSON | No | No | Crop/focal point hint | May evolve |
| `HeroShowMetadata` | Yes/No | No | No | Toggle hero metadata display | |
| `HeroMetadataMode` | Choice | No | No | Metadata rendering profile | May evolve |
| `HeroCtaLabel` | Single line text | No | No | Optional CTA label | |
| `HeroCtaUrl` | Hyperlink | No | No | Optional CTA target | |
| `ShowTeamViewer` | Yes/No | No | Yes | Toggle teamViewer | |
| `TeamViewerMode` | Choice | No | Yes | compact/grouped/org chart/summary-expand | May evolve |
| `TeamViewerTitle` | Single line text | No | Yes | Render title for teamViewer | |
| `TeamViewerIntro` | Multiple lines plain text | No | No | Supporting intro copy | |
| `TeamViewerMaxInitialVisible` | Number | No | No | Initial visible count before expand | |
| `TeamViewerAllowExpand` | Yes/No | No | No | Expand interaction toggle | |
| `TeamViewerSortMode` | Choice | No | No | manual/role/hierarchy | May evolve |
| `TeamViewerGroupingMode` | Choice | No | No | none/discipline/company/hierarchy | May evolve |
| `SecondaryImage` | Hyperlink/Image reference | No | Yes | Secondary image | |
| `SecondaryImageAltText` | Multiple lines plain text | No | Yes | Secondary image alt text | |
| `SecondaryImageCaption` | Multiple lines plain text | No | No | Caption | |
| `ShowSecondaryImage` | Yes/No | No | Yes | Toggle secondary image block | |
| `BodyIntro` | Multiple lines rich text | No | No | Optional intro text block | |
| `BodyRichText` | Multiple lines rich text | Yes | Yes | Main article body | |
| `BodyClosing` | Multiple lines rich text | No | No | Optional closing text block | |
| `PullQuote` | Multiple lines plain text | No | No | Optional quote/callout | |
| `CalloutText` | Multiple lines plain text | No | No | Optional supplemental callout | |
| `BodyStyleVariant` | Choice | No | No | Body rendering profile | |
| `IsFeatured` | Yes/No | No | Yes | Featured eligibility | |
| `FeaturedScope` | Choice multi | No | Yes | Destination landing/HBCentral/both | |
| `FeaturedRank` | Number | No | Yes | Featured ordering | |
| `IsPinned` | Yes/No | No | Yes | Pinned behavior | |
| `PinRank` | Number | No | Yes | Pinned ordering | |
| `IncludeInHomepageFeed` | Yes/No | No | Yes | Feed inclusion | |
| `IncludeInDestinationLanding` | Yes/No | No | Yes | Destination landing inclusion | |
| `IncludeInArchive` | Yes/No | No | Yes | Archive visibility | |
| `SuppressFromRollups` | Yes/No | No | No | Prevent rollup inclusion | |
| `ManualSortOverride` | Number | No | No | Override order | |
| `CampaignWindowStartUtc` | DateTime | No | No | Active promotion window start | |
| `CampaignWindowEndUtc` | DateTime | No | No | Active promotion window end | |
| `ReviewOwnerEmail` | Single line text | No | No | Reviewer | |
| `ApprovalOwnerEmail` | Single line text | No | No | Approver | |
| `PublishedByEmail` | Single line text | No | No | Publisher | |
| `LastReviewedDateUtc` | DateTime | No | No | Last review timestamp | |
| `RevisionNote` | Multiple lines plain text | No | No | Revision note | |
| `ChangeReason` | Multiple lines plain text | No | No | Publish/edit reason | |
| `RequiresReapprovalOnEdit` | Yes/No | No | No | Governance rule | |
| `TargetSiteUrl` | Single line text | No | Yes | Destination site URL | Redundant but useful |
| `PageId` | Single line text | No | Yes | Bound page id | |
| `PageUrl` | Hyperlink | No | Yes | Bound page URL | |
| `PageName` | Single line text | No | Yes | Bound page file name | |
| `PageTemplateKey` | Single line text | No | Yes | Applied page-shell template | |
| `PageShellVersion` | Single line text | No | No | Page shell version id | |
| `RenderVersion` | Single line text | No | No | Render contract version | |
| `LastPageSyncDateUtc` | DateTime | No | Yes | Last page sync timestamp | |
| `PageSyncStatus` | Choice | No | Yes | in-sync/pending/error | |

### Notes
- Any field marked as hero-related or team-related should be treated as subject to revision following updates to `hbSignatureHero` or `teamViewer`.
- If body rendering moves toward structured sections later, `BodyRichText` may split into section-based child records.

---

## B. HB Article Team Members — exact fields

| Internal Field | Type | Required | MVP | Description | Notes |
|---|---|---:|---:|---|---|
| `ArticleId` | Single line text | Yes | Yes | Parent article key | |
| `TeamMemberId` | Single line text | Yes | Yes | Durable child key | |
| `PersonPrincipal` | Person or text reference | Yes | Yes | Person binding | via `hbcpeoplepicker` |
| `DisplayName` | Single line text | Yes | Yes | Cached display name | |
| `Role` | Single line text | No | Yes | Role label | |
| `Department` | Single line text | No | No | Department classifier | |
| `Company` | Single line text | No | No | Company classifier | |
| `SortOrder` | Number | No | Yes | Manual order | |
| `GroupKey` | Single line text | No | No | Grouping value | |
| `ParentMemberId` | Single line text | No | No | Hierarchy parent link | For future org chart |
| `IsFeaturedMember` | Yes/No | No | No | Highlight person | |
| `BioSnippet` | Multiple lines plain text | No | Yes | Short bio rendered in the TeamViewer profile drawer | |
| `ResumeRichText` | Multiple lines rich text | No | Yes | Sanitized HTML resume body rendered in the TeamViewer drawer | Added Phase-01 closure for disabled-by-default drawer |
| `ResumeDocumentUrl` | Hyperlink | No | Yes | Link to an uploaded resume document | Added Phase-01 closure |
| `ResumeDocumentLabel` | Single line text | No | No | Editor-supplied label for the resume-document link | Falls back to `Open resume document` |
| `ContactLink` | Hyperlink | No | Yes | Optional profile/contact link | |

---

## C. HB Article Media — exact fields

| Internal Field | Type | Required | MVP | Description | Notes |
|---|---|---:|---:|---|---|
| `ArticleId` | Single line text | Yes | Yes | Parent article key | |
| `MediaId` | Single line text | Yes | Yes | Durable child key | |
| `MediaRole` | Choice | Yes | Yes | gallery/supporting/future types | |
| `ImageAsset` | Hyperlink/Image reference | Yes | Yes | Image reference | |
| `AltText` | Multiple lines plain text | Yes | Yes | Accessibility alt text | |
| `Caption` | Multiple lines plain text | No | Yes | Caption | |
| `SortOrder` | Number | No | Yes | Display order | |
| `GalleryGroup` | Single line text | No | No | Grouping support | |
| `FeaturedInGallery` | Yes/No | No | No | Highlight within gallery | |

---

## D. HB Article Template Registry — exact fields

| Internal Field | Type | Required | MVP | Description | Notes |
|---|---|---:|---:|---|---|
| `TemplateKey` | Single line text | Yes | Yes | Unique template key | |
| `TemplateName` | Single line text | Yes | Yes | Human-readable name | |
| `Destination` | Choice | Yes | Yes | Applicable destination | |
| `ContentTypes` | Choice multi | Yes | Yes | Applicable content types | |
| `ArticleSubjects` | Choice multi | No | No | Subject applicability | |
| `ProjectStages` | Choice multi | No | No | Stage applicability | |
| `SpotlightTypes` | Choice multi | No | Yes | Spotlight applicability | |
| `HeroProfileKey` | Single line text | Yes | Yes | Hero contract profile | |
| `TeamViewerProfileKey` | Single line text | No | Yes | Team profile | |
| `BodyProfileKey` | Single line text | Yes | Yes | Body profile | |
| `GalleryProfileKey` | Single line text | No | Yes | Gallery profile | |
| `PageShellTemplateKey` | Single line text | Yes | Yes | Destination shell | |
| `ShowHero` | Yes/No | Yes | Yes | Block rule | |
| `ShowTeamViewer` | Yes/No | Yes | Yes | Block rule | |
| `ShowSecondaryImage` | Yes/No | Yes | Yes | Block rule | |
| `ShowGallery` | Yes/No | Yes | Yes | Block rule | |
| `ShowBody` | Yes/No | Yes | Yes | Block rule | |
| `RequiredFieldSetKey` | Single line text | Yes | Yes | Validation set key | |
| `TemplatePriority` | Number | Yes | Yes | Rule resolution priority | |
| `IsActive` | Yes/No | Yes | Yes | Active flag | |
| `VersionLabel` | Single line text | No | Yes | Template version | |
| `Notes` | Multiple lines plain text | No | No | Admin notes | |

---

## E. HB Article Destination Pages — exact fields

| Internal Field | Type | Required | MVP | Description | Notes |
|---|---|---:|---:|---|---|
| `BindingId` | Single line text | Yes | Yes | Durable binding key | |
| `ArticleId` | Single line text | Yes | Yes | Parent article key | |
| `TargetSiteUrl` | Single line text | Yes | Yes | Destination site | |
| `PageId` | Single line text | No | Yes | Destination page id | |
| `PageUrl` | Hyperlink | No | Yes | Destination page url | |
| `PageName` | Single line text | No | Yes | File name | |
| `PageTemplateKey` | Single line text | Yes | Yes | Applied shell template | |
| `PageShellVersion` | Single line text | No | No | Shell version | |
| `RenderVersion` | Single line text | No | No | Render contract version | |
| `PublishStatus` | Choice | Yes | Yes | draft/published/error/etc. | |
| `LastSyncDateUtc` | DateTime | No | Yes | Sync timestamp | |
| `SyncStatus` | Choice | No | Yes | in-sync/pending/error | |
| `LastSyncMessage` | Multiple lines plain text | No | No | Message | |
| `PublishedDateUtc` | DateTime | No | Yes | Publish timestamp | |

---

## F. HB Article Workflow History — suggested fields

| Internal Field | Type | Required | MVP | Description |
|---|---|---:|---:|---|
| `HistoryId` | Single line text | Yes | No | Durable history key |
| `ArticleId` | Single line text | Yes | No | Parent article key |
| `PreviousState` | Choice | No | No | Prior state |
| `NewState` | Choice | Yes | No | New state |
| `ActorEmail` | Single line text | No | No | Acting user |
| `ActionDateUtc` | DateTime | Yes | No | Timestamp |
| `ActionNote` | Multiple lines plain text | No | No | Note |

---

## G. HB Article Publishing Errors — suggested fields

| Internal Field | Type | Required | MVP | Description |
|---|---|---:|---:|---|
| `ErrorId` | Single line text | Yes | No | Durable error key |
| `ArticleId` | Single line text | Yes | No | Parent article key |
| `BindingId` | Single line text | No | No | Related page binding |
| `Operation` | Choice | Yes | No | create/update/publish/sync |
| `Destination` | Choice | Yes | No | Destination site key |
| `ErrorSummary` | Multiple lines plain text | Yes | No | Human-readable error |
| `RetryStatus` | Choice | No | No | none/pending/resolved |
| `LastAttemptDateUtc` | DateTime | No | No | Timestamp |
