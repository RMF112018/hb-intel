# Data Model and Tenant Schema Deltas

## Incremental schema deltas for Leadership lane

The first two lanes already introduced the shared schema fields:

- `ReaderKey`
- `Cadence`
- `HomepageSlot`
- `ArchiveGroup`
- `ActiveEdition`
- `PrimaryAudience`
- `LastEditorialUpdate`

The Leadership lane should not add new fields unless implementation proves it necessary.

## Required choice values

### `ReaderKey`

Add/verify:

```text
leadership-message
```

Existing values should remain:

```text
project-spotlight
company-pulse
```

### `HomepageSlot`

Add/verify:

```text
Leadership Message Reader
```

Existing values should remain:

```text
Project Spotlight Reader
Company Pulse Reader
```

### `PlacementKey`

Add/verify in `HB_FoleonHomepagePlacements`:

```text
Leadership Message Active
```

Existing values should remain, including:

```text
Hero
Primary Card
Secondary Card
Carousel
Archive Rail
Project Spotlight Active
Company Pulse Active
```

### `PageContext`

Add/verify in `HB_FoleonInteractionEvents`:

```text
Leadership Message
```

Existing values should remain:

```text
Homepage
Content Hub
Reader
Project Site
Project Spotlight
Company Pulse
```

## Recommended content registry values for Leadership Message

```json
{
  "ReaderKey": "leadership-message",
  "ContentTypeKey": "Leadership",
  "HomepageSlot": "Leadership Message Reader",
  "PlacementKey": "Leadership Message Active",
  "Cadence": "Ad Hoc",
  "ActiveEdition": true,
  "PublishStatus": "Published",
  "IsVisible": true,
  "IsHomepageEligible": true,
  "OpenMode": "Inline Reader",
  "AllowEmbed": true,
  "RequiresExternalOpen": false
}
```

## Public query rule

Leadership must follow the same scalar-safe public query discipline as the other lanes.

Allowed public filters:

- `ReaderKey`
- `ActiveEdition`
- `IsVisible`
- `PublishStatus`
- `IsHomepageEligible`
- `FoleonDocId` where required

Do not add public filters for non-indexed or non-filter-safe fields unless schema/index validation supports it.

Do not add public `$select` of:

- `MarketingOwner`
- `AudienceGroups`
- person fields
- lookup/person fields
- non-scalar fields requiring `$expand`

## Tenant provisioning

Provisioning should be additive and idempotent:

- no list recreation;
- no row mutation;
- no field deletion;
- no content type deletion;
- append missing choices only;
- verify indexes, but no new index should be needed for `ReaderKey` if it already exists and remains indexed.
