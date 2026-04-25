# HB Foleon Content Registry

## 1. Objective
- Target-state schema for `HB_FoleonContentRegistry` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- **Status: not yet provisioned on tenant.** Provision per `apps/hb-intel-foleon/docs/provisioning.md`.
- Code-level source of truth: `apps/hb-intel-foleon/src/schema/foleonListSchemas.ts`
  (`FOLEON_CONTENT_REGISTRY_SCHEMA`).

## 2. List-Level Metadata
- List ID: _assigned at provision time_
- Display Name: `Foleon Content Registry`
- Internal Name: `HB_FoleonContentRegistry`
- Template: Generic List (base template 100)
- Versioning: enabled (major only)
- Attachments: disabled unless tenant admin enables for authoring
- Classification: business/custom
- Primary consumer: Foleon SPFx webpart (homepage, reader, content hub)

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Indexed | Unique | Notes |
|---|---|---|---|---|---|---|
| Title | Title | Text | Yes | No | No | built-in field; not provisioned as a custom launch index |
| Foleon Doc ID | FoleonDocId | Number | Yes | Yes | Yes | canonical Foleon document id |
| Foleon Doc UID | FoleonDocUid | Text | No | No | No | |
| Foleon Identifier | FoleonIdentifier | Text | No | No | No | |
| Foleon Project ID | FoleonProjectId | Number | No | No | No | recommended future index only |
| Foleon Project Name | FoleonProjectName | Text | No | No | No | |
| Content Type | ContentTypeKey | Choice | Yes | No | No | recommended future index only; choices: Project Highlight, Newsletter, Company News, Market Update, Leadership, Other |
| Status | PublishStatus | Choice | Yes | Yes | No | choices: Draft, Preview, Published, Archived, Offline, Suppressed |
| Is Visible | IsVisible | Boolean | Yes | Yes | No | |
| Is Featured | IsFeatured | Boolean | No | No | No | recommended future index only |
| Is Homepage Eligible | IsHomepageEligible | Boolean | No | Yes | No | |
| Published URL | PublishedUrl | Hyperlink | No | No | No | |
| Preview URL | PreviewUrl | Hyperlink | No | No | No | admin review only; never published to the homepage |
| Embed URL | EmbedUrl | Hyperlink | No | No | No | |
| Thumbnail URL | ThumbnailUrl | Hyperlink | No | No | No | |
| Hero Image URL | HeroImageUrl | Hyperlink | No | No | No | |
| Summary | Summary | Note | No | No | No | multi-line, plain text |
| Marketing Owner | MarketingOwner | Person | No | No | No | |
| Issue Date | IssueDate | Date | No | No | No | |
| First Published On | FirstPublishedOn | DateTime | No | No | No | |
| Published On | PublishedOn | DateTime | No | Yes | No | |
| Foleon Modified On | FoleonModifiedOn | DateTime | No | No | No | |
| Display From | DisplayFrom | DateTime | No | Yes | No | |
| Display Through | DisplayThrough | DateTime | No | Yes | No | |
| Sort Rank | SortRank | Number | No | Yes | No | |
| Audience Groups | AudienceGroups | PersonMulti | No | No | No | M365/Entra groups; client-side audience check |
| Related Project Number | RelatedProjectNumber | Text | No | No | No | |
| Related Project Name | RelatedProjectName | Text | No | No | No | |
| Related Project Site URL | RelatedProjectSiteUrl | Hyperlink | No | No | No | |
| Region | Region | Choice | No | No | No | North Florida, Central Florida, Southeast Florida, Southwest Florida, Companywide |
| Sector | Sector | Choice | No | No | No | Luxury Residential, Commercial, Multifamily, Environmental, Internal, Other |
| Tags | Tags | MultiChoice | No | No | No | |
| Open Mode | OpenMode | Choice | Yes | No | No | Inline Reader, Fullscreen Reader, New Tab Only |
| Allow Embed | AllowEmbed | Boolean | Yes | Yes | No | reader hard gate |
| Requires External Open | RequiresExternalOpen | Boolean | No | No | No | forces fallback |
| Last Synced | LastSynced | DateTime | No | No | No | |
| Sync Source | SyncSource | Choice | Yes | Yes | No | Manual, Foleon API, Hybrid |
| Sync Hash | SyncHash | Text | No | No | No | |
| Raw Foleon JSON | RawFoleonJson | Note | No | No | No | hidden from default views |
| Admin Notes | AdminNotes | Note | No | No | No | |

## 4. Launch Provisioned Indexed Columns

Feature Framework launch provisioning intentionally avoids over-indexing.
Additional indexes must be created through controlled post-provisioning
and validated before service code treats them as filter-safe.

```
FoleonDocId
PublishStatus
IsVisible
IsHomepageEligible
PublishedOn
DisplayFrom
DisplayThrough
SortRank
AllowEmbed
SyncSource
```

## 5. Recommended Future Indexed Columns

These fields may be useful for future reporting or management paths but
are not provisioned as indexes during initial Feature Framework install:

```
FoleonProjectId
ContentTypeKey
IsFeatured
```

## 6. Recommended Views

| View Name | Filter | Sort |
|---|---|---|
| Active Published Content | `IsVisible = Yes AND PublishStatus = Published` | `PublishedOn desc` |
| Homepage Eligible | `IsHomepageEligible = Yes AND IsVisible = Yes AND PublishStatus = Published` | `SortRank asc, PublishedOn desc` |
| Newsletters | `ContentTypeKey = 'Newsletter' AND PublishStatus = Published` | `IssueDate desc` |
| Project Highlights | `ContentTypeKey = 'Project Highlight' AND PublishStatus = Published` | `IssueDate desc` |

## 7. Service consumers

- `apps/hb-intel-foleon/src/services/FoleonContentService.ts`
  - `$select` mirrors every non-computed field.
  - `$filter` only uses `FoleonDocId`, `IsVisible`, `PublishStatus`, `IsHomepageEligible` — all indexed.
  - `$top` defaults to 100.

## 8. Uniqueness Posture

`FoleonDocId` is provisioned with `Indexed="TRUE"` and
`EnforceUniqueValues="TRUE"` per Microsoft field schema guidance. Tenant
closure still requires clean-site proof that SharePoint created the
unique constraint.
