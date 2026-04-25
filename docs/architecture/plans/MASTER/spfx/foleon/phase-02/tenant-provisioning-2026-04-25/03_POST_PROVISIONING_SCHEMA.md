# 03 Post Provisioning Schema

## Content Registry Fields

`HB_FoleonContentRegistry` post-provision verification confirms:

- `ReaderKey`: Choice, indexed, choices `project-spotlight`, `company-pulse`
- `Cadence`: Choice, choices `Monthly`, `Weekly`, `Frequent`, `Ad Hoc`
- `HomepageSlot`: Choice, indexed, choices `Project Spotlight Reader`, `Company Pulse Reader`
- `ArchiveGroup`: Text, indexed
- `ActiveEdition`: Boolean, indexed
- `PrimaryAudience`: Choice, choices `Companywide`, `Operations`, `Field`, `Leadership`, `Marketing`, `Safety`, `IT`
- `LastEditorialUpdate`: DateTime, indexed

`ContentTypeKey` includes:

- `Project Highlight`
- `Newsletter`
- `Company News`
- `Market Update`
- `Leadership`
- `Other`
- `Project Spotlight`
- `Company Pulse`

## Placement Choices

`HB_FoleonHomepagePlacements.PlacementKey` includes:

- `Hero`
- `Primary Card`
- `Secondary Card`
- `Carousel`
- `Archive Rail`
- `Project Spotlight Active`
- `Company Pulse Active`

## Interaction Event Choices

`HB_FoleonInteractionEvents.PageContext` includes:

- `Homepage`
- `Content Hub`
- `Reader`
- `Project Site`
- `Project Spotlight`
- `Company Pulse`

## Evidence

The full post-provision field snapshot is stored at `exports/post-provision-fields.json`.
