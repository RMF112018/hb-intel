# SharePoint Indexes, Views, and Implementation Notes

## Objective

Add operational implementation notes so the SharePoint-list backend remains performant and governable as the app grows.

## Why indexing matters

SharePoint Online still uses a 5,000-item list view threshold for operations that cause excessive server load. Microsoft recommends designing large lists and libraries around indexed/filterable access patterns. citeturn829367search1turn682466search3

Practical consequence:
do not build companion or public list reads that depend on scanning large lists without indexed filters.

## Indexing strategy by list

### `HBCP_Settings`
Index:
- CPSettingKey
- CPSettingGroup
- CPIsActive

### `HBCP_Packages`
Index:
- CPPackageKey
- CPPackageType
- CPPublicState
- CPParentPackageKey
- CPOperatingCorridor
- CPPrimaryLifecycleStage
- CPPrimaryRoleEmphasis
- CPIsPromotedStandard
- CPFreshnessState
- CPIsActive
- CPEffectiveDate
- CPLastReviewedDate

### `HBCP_SourceItems`
Index:
- CPSourceKey
- CPSourceItemType
- CPPrimaryPackageKey
- CPCanonicalMode
- CPFileExtension
- CPPreviewMode
- CPFreshnessState
- CPIsActive
- CPLastReviewedDate

### `HBCP_PackageSourceLinks`
Index:
- CPLinkKey
- CPPackageKey
- CPSourceKey
- CPLinkType
- CPIsRequired
- CPIsActive
- CPDisplayOrder

### `HBCP_PackageRelations`
Index:
- CPRelationKey
- CPFromPackageKey
- CPToPackageKey
- CPRelationType
- CPIsPromotedPathRelation
- CPIsActive

### `HBCP_Feedback`
Index:
- CPFeedbackKey
- CPPackageKey
- CPChildPackageKey
- CPStatus
- CPIssueType
- CPUrgency
- CPAssignedAdmin
- CPClosedDate
- CPIsDuplicate

### `HBCP_GovernanceLog`
Index:
- CPEventKey
- CPObjectType
- CPObjectKey
- CPRelatedPackageKey
- CPEventType
- CPEventDate

### `HBCP_AudienceOverrides`
Index:
- CPOverrideKey
- CPPrincipalIdentifier
- CPDefaultRole
- CPIsActive
- CPEffectiveStartDate
- CPEffectiveEndDate

## View recommendations

### Companion default views

Default views should always filter first on indexed fields.

Recommended examples:

#### Packages
- Active Published Packages
- Draft/Review Packages
- Packages with Freshness Warning
- Parent-Locked Child Packages
- Promoted Child Packages

#### Source Items
- Active Canonical Sources
- Sources with Review Needed
- Derivative Sources
- Native-Open Sources
- In-App Preview Sources

#### Feedback
- New Feedback
- Triage Needed
- High Urgency Open
- Closed in Last 30 Days

#### Governance Log
- Recent Package Events
- Freshness Override Events
- Publish/Supersede/Archive Events

## Field-type implementation notes

Microsoft documents the standard list column types and their options for SharePoint lists and libraries. citeturn682466search6turn682466search3

Recommended use in this design:

- **Single line of text** for immutable keys, slugs, stable identifiers, and filterable references
- **Choice** for states, categories, and filter-heavy enumerations
- **Date and Time** for trust/freshness/governance timing
- **Yes/No** for booleans used in filtering and UI logic
- **Person or Group (single)** only where user identity adds admin value
- **Multiple lines of text (plain)** for long summaries, JSON arrays, and admin notes
- **Hyperlink** for source/open targets

Avoid making multi-value fields critical to primary list filters.

## Why JSON is used in several places

JSON-backed plain-text fields are recommended for:

- allowed roles
- secondary lifecycle stages
- additional package associations
- stakeholder arrays
- search synonyms
- dormant future project-context hints

Reason:
this keeps the schema list-backed and flexible without forcing many multi-value lookup relationships into SharePoint views.

## Recommended content-type setup

Create the following content types at the site level:

### Packages
- Corridor Package
- Child Package
- Supporting Package

### Source Items
- Canonical Source Item
- Derivative Source Item
- Reference-Only Source Item

### Feedback
- Package Feedback
- Child Package Feedback

Content types are the right SharePoint-native mechanism for applying shared metadata structure consistently. citeturn829367search4turn829367search6turn682466search9

## Permissions notes

### Public shell
- read access to published package data
- read access to active source references
- submit access to feedback list
- no edit rights to core admin lists

### Companion
- central admin edit rights to all core backend lists
- tightly controlled access to governance log and overrides
- no broad contributor authoring for MVP

## Freshness notes

Public app behavior:
- show stale-source caution markers
- do not hide stale content automatically

Companion behavior:
- surface freshness issues clearly
- permit central override
- record override in governance log

## Migration / seeding notes

Recommended initial implementation order:

1. Create reusable site columns
2. Create site content types
3. Create lists
4. Apply content types and columns
5. Build default indexed views
6. Seed `HBCP_Settings`
7. Seed corridor packages
8. Seed child packages
9. Seed source items
10. Seed relationship lists
11. Validate public shell reads
12. Validate companion writes

## Minimum viable API/query posture

Public shell should read:

- packages filtered by published + active + corridor/role
- package-source links by package key
- source items by source key set
- package relations by package key
- audience overrides only as needed for current user

Companion should read/write:

- all package states
- source item governance metadata
- feedback queue
- governance log
- overrides
- settings

## Final implementation recommendation

Keep the backend model:
- list-backed
- package-first
- index-aware
- lightly normalized
- history-separated
- future-project-ready but project-inactive in MVP

That is the safest way to keep all backend data in SharePoint list storage for now without turning the app into a brittle lookup-heavy pseudo-relational system.
