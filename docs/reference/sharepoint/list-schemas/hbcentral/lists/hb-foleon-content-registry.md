# HB Foleon Content Registry

## 1. Objective
- Target-state schema for `HB_FoleonContentRegistry` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- **Status: provisioned and tenant-validated (2026-04-25).**
- Code-level source of truth: `apps/hb-intel-foleon/src/schema/foleonListSchemas.ts`
  (`FOLEON_CONTENT_REGISTRY_SCHEMA`).

## 2. List-Level Metadata
- List ID: `2e57615d-457e-49b8-aef3-038e85cbe068`
- Display Name: `Foleon Content Registry`
- Internal Name: `HB_FoleonContentRegistry`
- Root URL: `/sites/HBCentral/Lists/HB_FoleonContentRegistry`
- Template: Generic List (base template 100)
- Hidden: `false`
- Item count at audit: `0`
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
| Content Type | ContentTypeKey | Choice | Yes | No | No | recommended future index only; choices: Project Spotlight, Company Pulse, Project Highlight, Newsletter, Company News, Market Update, Leadership, Other |
| Reader Key | ReaderKey | Choice | No | Yes | No | scalar lane key; choices: project-spotlight, company-pulse |
| Cadence | Cadence | Choice | No | No | No | choices: Monthly, Weekly, Frequent, Ad Hoc |
| Homepage Slot | HomepageSlot | Choice | No | Yes | No | choices: Project Spotlight Reader, Company Pulse Reader |
| Archive Group | ArchiveGroup | Text | No | Yes | No | scalar archive grouping key |
| Active Edition | ActiveEdition | Boolean | No | Yes | No | lane active marker; one-active enforcement deferred |
| Primary Audience | PrimaryAudience | Choice | No | No | No | choices: Companywide, Operations, Field, Leadership, Marketing, Safety, IT |
| Last Editorial Update | LastEditorialUpdate | DateTime | No | Yes | No | scalar recency timestamp |
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
ReaderKey
HomepageSlot
ArchiveGroup
ActiveEdition
LastEditorialUpdate
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

## 6.1 Deferred Package Versioning

Prompt 01 adds schema and contract support only. The SPFx package/runtime
version bump is deferred to the final package-proof wave so runtime proof,
Feature Framework proof, and manifest truth move together.

## 6. Feature Framework Views

Initial Feature Framework provisioning creates only the minimal default
`All Items` view. Filtered and sorted operational views are intentionally
deferred to controlled post-provision creation after clean-site list
rendering is proven.

## 7. Recommended Post-Provision Views

| View Name | Filter | Sort |
|---|---|---|
| Active Published Content | `IsVisible = Yes AND PublishStatus = Published` | `PublishedOn desc` |
| Homepage Eligible | `IsHomepageEligible = Yes AND IsVisible = Yes AND PublishStatus = Published` | `SortRank asc, PublishedOn desc` |
| Newsletters | `ContentTypeKey = 'Newsletter' AND PublishStatus = Published` | `IssueDate desc` |
| Project Highlights | `ContentTypeKey = 'Project Highlight' AND PublishStatus = Published` | `IssueDate desc` |

## 8. Service consumers

- `apps/hb-intel-foleon/src/services/FoleonContentService.ts`
  - Runtime currently derives `$select` from `FOLEON_CONTENT_REGISTRY_SCHEMA`.
  - `$filter` only uses `FoleonDocId`, `IsVisible`, `PublishStatus`, `IsHomepageEligible` — all indexed.
  - `$top` defaults to 100.

## 9. Runtime Query Constraint (Tenant-Proven)

- The public filter path is valid on tenant:
  - `IsVisible eq 1 and PublishStatus eq 'Published' and IsHomepageEligible eq 1`
- The hosted `400` root cause is invalid person-field projection in the full schema-derived `$select`:
  - `MarketingOwner` is `Type="User"` and cannot be selected as a scalar without `$expand`.
  - `AudienceGroups` is `Type="UserMulti"` and has the same constraint.
- Current remediation direction: narrow public `$select` to scalar-safe fields unless a route explicitly uses `$expand` for person targets.

## 10. Uniqueness Posture

`FoleonDocId` is provisioned with `Indexed="TRUE"` and
`EnforceUniqueValues="TRUE"` per Microsoft field schema guidance. Tenant
audit confirms the uniqueness flag is present in live `SchemaXml` and
matches provisioning assets.
