# 03 — Exact Field Definitions

## Conventions

- `Required` indicates whether the field is required on the list schema
- `MVP` indicates whether the field should exist in initial delivery
- `May Evolve` flags fields likely to change as shell/renderer contracts evolve

---

## A. Project Spotlight Posts — exact fields

| Internal Field | Type | Required | MVP | Description | Notes |
|---|---|---:|---:|---|---|
| `PostId` | Single line text | Yes | Yes | Durable post key | Primary cross-list / cross-page identity |
| `Title` | Single line text | Yes | Yes | Editorial post title | Feeds the page banner title by default |
| `BannerTitleOverride` | Single line text | No | Yes | Optional banner title override | May evolve if `hbSignatureHero` is introduced |
| `Subhead` | Multiple lines plain text | Yes | Yes | Post subheading / dek | Maps to the shell subheading text block |
| `SummaryExcerpt` | Multiple lines plain text | Yes | Yes | Short summary / teaser | Used in rollups and previews |
| `BodyRichText` | Multiple lines rich text | Yes | Yes | Main post body | Maps to the shell body text block |
| `PostFamily` | Choice | Yes | Yes | `monthlySpotlight`, `milestoneSpotlight`, `projectUpdate`, `projectStory` | Primary template driver |
| `SpotlightType` | Choice | No | Yes | `inProgress`, `milestone`, `update`, `feature`, etc. | Template driver |
| `ProjectStage` | Choice | No | Yes | `preconstruction`, `inProgress`, `closeout`, etc. | Template driver |
| `ArticleSubject` | Choice or taxonomy | No | Yes | Subject family / topic | Template driver |
| `TemplateKey` | Single line text | Yes | Yes | Resolved template identifier | Usually system-resolved |
| `PageShellKey` | Single line text | Yes | Yes | Resolved shell identifier | Points to XML-shell family |
| `Slug` | Single line text | Yes | Yes | Generated page slug / file-name base | Unique within Project Spotlight |
| `WorkflowState` | Choice | Yes | Yes | `draft`, `inReview`, `approved`, `scheduled`, `published`, `archived`, `withdrawn` | |
| `AuthorEmail` | Single line text | No | Yes | Author identity reference | |
| `AuthorDisplayName` | Single line text | No | Yes | Cached author display name | |
| `CreatedDateUtc` | DateTime | Yes | Yes | System-created timestamp | |
| `UpdatedDateUtc` | DateTime | Yes | Yes | System-updated timestamp | |
| `PublishedDateUtc` | DateTime | No | Yes | Actual publish timestamp | |
| `ScheduledPublishDateUtc` | DateTime | No | Yes | Scheduled publish time | |
| `ArchiveDateUtc` | DateTime | No | Yes | Archive threshold | |
| `ReviewOwnerEmail` | Single line text | No | No | Reviewer identity | |
| `ApprovalOwnerEmail` | Single line text | No | No | Approver identity | |
| `PublishedByEmail` | Single line text | No | No | Publisher identity | |
| `RevisionNote` | Multiple lines plain text | No | No | Editorial change note | |
| `ChangeReason` | Multiple lines plain text | No | No | Publish / republish rationale | |
| `RequiresReapprovalOnEdit` | Yes/No | No | No | Governance rule | |
| `ProjectId` | Single line text | Yes | Yes | Project identifier | Required for Project Spotlight posts |
| `ProjectName` | Single line text | Yes | Yes | Project display name | |
| `ProjectLocation` | Single line text | No | Yes | Project location | |
| `ProjectSector` | Single line text | No | Yes | Project sector / market | |
| `ProjectStatusLabel` | Single line text | No | No | Status text | May later feed a badge/callout |
| `MilestoneLabel` | Single line text | No | No | Milestone descriptor | Required by milestone templates |
| `MilestoneDateUtc` | DateTime | No | No | Milestone date | Required by milestone templates |
| `BannerImageUrl` | Hyperlink/Image reference | Yes | Yes | Primary banner image | Current shell uses OOB Page Title / banner |
| `BannerImageAltText` | Multiple lines plain text | Yes | Yes | Alt text for banner image | Required for accessibility |
| `BannerEyebrow` | Single line text | No | Yes | Eyebrow / category value | May evolve |
| `BannerCategoryLabel` | Single line text | No | Yes | Category label | May evolve |
| `BannerThemeVariant` | Choice | No | Yes | Banner visual profile | May evolve |
| `BannerImageFocalPoint` | Single line text / JSON | No | No | Crop / focal point hint | May evolve |
| `BannerShowPublishDate` | Yes/No | No | Yes | Show publish date in banner | Mirrors shell/header capability |
| `BannerShowGradient` | Yes/No | No | Yes | Show banner gradient treatment | Mirrors current shell capability |
| `HeroRendererKind` | Choice | No | Yes | `oobPageTitle` or future `hbSignatureHero` | Current template uses `oobPageTitle` |
| `ShowTeamViewer` | Yes/No | No | Yes | Toggle team section visibility | Template may force true/false |
| `TeamSectionHeading` | Single line text | No | Yes | Section heading for `teamViewer` | Maps to `heading` |
| `TeamViewerLayout` | Choice | No | Yes | `grid`, `list`, future modes | Current XML uses `grid` |
| `TeamViewerDensity` | Choice | No | Yes | `standard`, `compact`, `comfortable` | Current XML uses `standard` |
| `TeamViewerEnableProfileDrawer` | Yes/No | No | Yes | Enables profile-detail drawer | Default false in current shell |
| `TeamViewerListHostOverride` | Single line text | No | No | Optional list-host override URL | Needed only if control-plane lists are remote from destination site |
| `ShowGallery` | Yes/No | No | Yes | Toggle gallery section visibility | Template may force true/false |
| `GalleryMaxImages` | Number | No | No | Max image count rendered | Current OOB gallery is configured for up to 10 |
| `GalleryLayoutProfile` | Choice | No | Yes | `grid`, `carousel`, `shellDefault` | Current shell defaults to gallery layout from XML |
| `IsFeatured` | Yes/No | No | Yes | Featured eligibility inside Project Spotlight | No cross-destination semantics |
| `FeaturedRank` | Number | No | Yes | Featured ordering | |
| `IsPinned` | Yes/No | No | Yes | Pinned behavior in Project Spotlight rollups | |
| `PinRank` | Number | No | Yes | Pin ordering | |
| `IncludeInProjectSpotlightRollups` | Yes/No | No | Yes | Include in Project Spotlight landing/feed | |
| `IncludeInArchive` | Yes/No | No | Yes | Archive visibility | |
| `SuppressFromRollups` | Yes/No | No | No | Prevent rollup inclusion | |
| `ManualSortOverride` | Number | No | No | Optional manual ordering | |
| `CampaignWindowStartUtc` | DateTime | No | No | Optional promotion window start | |
| `CampaignWindowEndUtc` | DateTime | No | No | Optional promotion window end | |
| `TargetSiteUrl` | Single line text | Yes | Yes | Publish target site URL | Locked to Project Spotlight |
| `TargetSiteKey` | Single line text | Yes | Yes | Destination key | Locked to `projectSpotlight` |
| `GeneratedPageName` | Single line text | No | Yes | Destination page file name | Usually `{Slug}.aspx` |
| `PageUrl` | Hyperlink | No | Yes | Bound page URL | |
| `PageId` | Single line text | No | Yes | Bound SharePoint page id | |
| `SourceTemplatePath` | Single line text | Yes | Yes | XML shell source page path | Example: `SitePages/Templates/Project-Spotlight---In-Progress.aspx` |
| `AppliedTemplateVersion` | Single line text | No | Yes | Resolved template version | |
| `AppliedShellVersion` | Single line text | No | Yes | Shell version used to generate page | |
| `RenderVersion` | Single line text | No | No | Renderer contract version set | |
| `RegenerationPolicy` | Choice | No | No | `updateInPlace`, `regenerateOnShellChange`, `manualDecision` | |
| `LastPageSyncDateUtc` | DateTime | No | Yes | Last page sync timestamp | |
| `PageSyncStatus` | Choice | No | Yes | `pending`, `inSync`, `error`, `staleShell`, `staleTemplate` | |
| `LastSuccessfulPublishDateUtc` | DateTime | No | Yes | Last successful publish timestamp | |
| `LastPreviewDateUtc` | DateTime | No | No | Last preview generation timestamp | |

### Notes
- Banner-related fields should be treated as likely to evolve because the current shell uses OOB Page Title while future shell variants may adopt `hbSignatureHero`.
- There is **no** canonical secondary-image field in the base shell. If a future shell introduces an image slot, the field set can be extended deliberately rather than implicitly.

---

## B. Project Spotlight Post Team Members — exact fields

| Internal Field | Type | Required | MVP | Description | Notes |
|---|---|---:|---:|---|---|
| `PostId` | Single line text | Yes | Yes | Parent post key | |
| `TeamMemberId` | Single line text | Yes | Yes | Durable child key | |
| `PersonPrincipal` | Person or text reference | Yes | Yes | Person binding | Can be backed by people picker logic |
| `DisplayName` | Single line text | Yes | Yes | Cached display name | |
| `JobTitle` | Single line text | No | Yes | Role / title label | Visible in Team Viewer |
| `Department` | Single line text | No | No | Department classifier | |
| `Company` | Single line text | No | No | Company classifier | |
| `PhotoUrl` | Hyperlink/Image reference | No | Yes | Member photo URL | Preferred for direct rendering |
| `SortOrder` | Number | No | Yes | Manual order | |
| `GroupKey` | Single line text | No | No | Grouping value | Future grouped modes |
| `ParentMemberId` | Single line text | No | No | Hierarchy parent link | Future hierarchy modes |
| `IsFeaturedMember` | Yes/No | No | No | Highlighted member | |
| `BioSnippet` | Multiple lines plain text | No | Yes | Short bio for profile drawer | Drawer remains disabled by default in current shell |
| `ResumeRichText` | Multiple lines rich text | No | Yes | Sanitized HTML resume/profile body | Future/detail-drawer support |
| `ResumeDocumentUrl` | Hyperlink | No | Yes | Optional resume/profile document | |
| `ContactLink` | Hyperlink | No | Yes | Optional profile/contact link | |
| `IncludeInViewer` | Yes/No | No | Yes | Include this person in Team Viewer | Default true |

---

## C. Project Spotlight Post Media — exact fields

| Internal Field | Type | Required | MVP | Description | Notes |
|---|---|---:|---:|---|---|
| `PostId` | Single line text | Yes | Yes | Parent post key | |
| `MediaId` | Single line text | Yes | Yes | Durable child key | |
| `MediaRole` | Choice | Yes | Yes | `gallery` in current MVP | Keep extensible for future shell variants |
| `ImageAssetUrl` | Hyperlink/Image reference | Yes | Yes | Image source | |
| `AltText` | Multiple lines plain text | Yes | Yes | Accessibility text | Required for every gallery image |
| `Caption` | Multiple lines plain text | No | Yes | Image caption | |
| `Credit` | Single line text | No | No | Photo credit | |
| `SortOrder` | Number | No | Yes | Display order | |
| `IsHidden` | Yes/No | No | No | Soft hide flag | |
| `GalleryGroupKey` | Single line text | No | No | Future grouping support | |

---

## D. Project Spotlight Template Registry — exact fields

| Internal Field | Type | Required | MVP | Description | Notes |
|---|---|---:|---:|---|---|
| `TemplateKey` | Single line text | Yes | Yes | Unique template identifier | Example: `ps-inprogress-monthly-v1` |
| `TemplateDisplayName` | Single line text | Yes | Yes | Human-readable template name | |
| `TemplateStatus` | Choice | Yes | Yes | `active`, `inactive`, `deprecated`, `draft` | |
| `TemplateVersion` | Single line text | Yes | Yes | Template version string | |
| `PageShellKey` | Single line text | Yes | Yes | Linked shell identifier | |
| `PageShellVersion` | Single line text | Yes | Yes | Shell version required by template | |
| `ShellSourceSiteUrl` | Single line text | Yes | Yes | Site containing the shell source | Project Spotlight site |
| `ShellSourcePagePath` | Single line text | Yes | Yes | Source page path used for generation | |
| `PostFamily` | Choice multi | Yes | Yes | Applicable post families | |
| `SpotlightType` | Choice multi | No | Yes | Applicable spotlight types | |
| `ProjectStage` | Choice multi | No | Yes | Applicable project stages | |
| `ArticleSubject` | Choice multi or taxonomy | No | Yes | Subject applicability | |
| `BannerRendererKind` | Choice | Yes | Yes | `oobPageTitle` or future `hbSignatureHero` | |
| `BodyRendererKind` | Choice | Yes | Yes | `oobText` | Current shell |
| `TeamRendererKind` | Choice | No | Yes | `teamViewer` or `none` | |
| `GalleryRendererKind` | Choice | No | Yes | `oobImageGallery` or `none` | |
| `ShowTeamBlock` | Yes/No | Yes | Yes | Team block visibility | |
| `ShowGalleryBlock` | Yes/No | Yes | Yes | Gallery block visibility | |
| `RequiredFieldSetKey` | Single line text | Yes | Yes | Validation ruleset key | |
| `ValidationProfileKey` | Single line text | Yes | Yes | Template-aware validation profile | |
| `RenderProfileKey` | Single line text | Yes | Yes | Composite renderer profile key | |
| `AllowRepublishInPlace` | Yes/No | No | Yes | In-place republish allowed | |
| `ForceRegenerationOnShellChange` | Yes/No | No | Yes | Full regeneration required when shell version changes | |
| `ControlMapJson` | Multiple lines plain text / JSON | No | Yes | Logical-to-canvas-control mapping | May include control IDs from the canonical shell |
| `Notes` | Multiple lines plain text | No | No | Registry notes | |

---

## E. Project Spotlight Page Bindings — exact fields

| Internal Field | Type | Required | MVP | Description | Notes |
|---|---|---:|---:|---|---|
| `BindingId` | Single line text | Yes | Yes | Durable binding key | |
| `PostId` | Single line text | Yes | Yes | Parent post key | |
| `TargetSiteUrl` | Single line text | Yes | Yes | Destination site URL | Project Spotlight only |
| `TargetSiteKey` | Single line text | Yes | Yes | Destination key | `projectSpotlight` |
| `PageId` | Single line text | No | Yes | Destination page id | |
| `PageName` | Single line text | Yes | Yes | Destination page name | Usually `{Slug}.aspx` |
| `PageUrl` | Hyperlink | No | Yes | Destination page URL | |
| `SourceTemplatePath` | Single line text | Yes | Yes | Shell source path used | |
| `PageShellKey` | Single line text | Yes | Yes | Applied shell key | |
| `PageShellVersion` | Single line text | Yes | Yes | Applied shell version | |
| `TemplateKey` | Single line text | Yes | Yes | Applied template key | |
| `TemplateVersion` | Single line text | Yes | Yes | Applied template version | |
| `RenderVersion` | Single line text | No | No | Renderer contract version | |
| `BindingStatus` | Choice | Yes | Yes | `previewOnly`, `published`, `archived`, `withdrawn`, `error` | |
| `LastOperation` | Choice | No | Yes | `preview`, `publish`, `republish`, `regenerate`, `archive`, `withdraw` | |
| `LastOperationDateUtc` | DateTime | No | Yes | Timestamp of last operation | |
| `LastSuccessfulSyncDateUtc` | DateTime | No | Yes | Last successful generation/sync | |
| `ShellChecksum` | Single line text | No | No | Optional shell snapshot/hash | |
| `GenerationNotes` | Multiple lines plain text | No | No | Operation notes | |

---

## F. Project Spotlight Workflow History — suggested fields

- `HistoryId`
- `PostId`
- `FromState`
- `ToState`
- `Action`
- `ActorEmail`
- `ActionDateUtc`
- `Note`

---

## G. Project Spotlight Publishing Errors — suggested fields

- `ErrorId`
- `PostId`
- `BindingId`
- `Operation`
- `TemplateKey`
- `PageShellKey`
- `OccurredDateUtc`
- `ErrorCategory`
- `ErrorSummary`
- `ErrorDetails`
- `RetryStatus`
