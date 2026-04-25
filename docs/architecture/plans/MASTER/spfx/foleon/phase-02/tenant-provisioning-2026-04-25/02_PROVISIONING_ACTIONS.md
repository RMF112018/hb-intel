# 02 Provisioning Actions

## Fields Added

Added to `HB_FoleonContentRegistry` (`Foleon Content Registry`):

- `ReaderKey` Choice
- `Cadence` Choice
- `HomepageSlot` Choice
- `ArchiveGroup` Text
- `ActiveEdition` Boolean
- `PrimaryAudience` Choice
- `LastEditorialUpdate` DateTime

No existing fields required type conversion. No field, view, item, index, content type, or list was deleted or recreated.

## Choice Values Added

Appended to `ContentTypeKey`:

- `Project Spotlight`
- `Company Pulse`

Appended to `PlacementKey`:

- `Project Spotlight Active`
- `Company Pulse Active`

Appended to `PageContext`:

- `Project Spotlight`
- `Company Pulse`

Existing choice values were preserved.

## Indexes Created

Created on `HB_FoleonContentRegistry`:

- `ReaderKey`
- `HomepageSlot`
- `ArchiveGroup`
- `ActiveEdition`
- `LastEditorialUpdate`

## Indexes Verified Existing

Verified on `HB_FoleonContentRegistry`:

- `FoleonDocId`
- `PublishStatus`
- `IsVisible`
- `IsHomepageEligible`
- `PublishedOn`
- `DisplayFrom`
- `DisplayThrough`
- `SortRank`
- `AllowEmbed`
- `SyncSource`

Verified on `HB_FoleonHomepagePlacements`:

- `PlacementKey`
- `ContentIdCache`
- `IsActive`
- `DisplayFrom`
- `DisplayThrough`
- `SortRank`
- `LayoutVariant`

Verified on `HB_FoleonInteractionEvents`:

- `PageContext`

## Run Summary

Detailed action evidence is stored in `exports/provisioning-run-summary.json`.
