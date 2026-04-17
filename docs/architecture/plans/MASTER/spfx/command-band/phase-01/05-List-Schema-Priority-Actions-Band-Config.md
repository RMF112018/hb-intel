# 05 — SharePoint List Schema — `Priority Actions Band Config`

## Purpose

This is the authoritative schema for the band-level configuration list used by:

- `PriorityActionsRail`
- `PriorityActionsRailAdmin`

This schema is part of the implementation contract. The code agent must not re-derive or silently mutate this model during implementation. If repo truth already contains a different schema, the agent must either align runtime to this schema or produce an explicit migration/update in the same pass.

## Canonical list identity

- **List title:** `Priority Actions Band Config`
- **Recommended URL / entity type alias:** `PriorityActionsBandConfig`
- **Template:** Generic list
- **Attachments:** disabled
- **Folder creation:** disabled
- **Versioning:** enabled
- **Content types:** disabled unless repo standards require otherwise
- **Default item posture:** one active row per `BandKey`
- **Initial seeded row:** `homepage-primary`

## Operational model

This list stores the active presentation rules for one command band.

The intended runtime model is:

- exactly one active + enabled row per `BandKey`
- one canonical homepage band for initial rollout: `homepage-primary`
- the admin surface edits the active row in place
- SharePoint versioning provides history; the app does not create ad hoc duplicate config rows unless a future versioning workflow is intentionally added

If repo truth already uses multiple config rows per band, the implementation must still resolve the active row deterministically and block invalid duplicates in admin validation.

## Field schema

| Display Name | Internal Name | Type | Required | Default | Indexed | Notes |
|---|---|---|---:|---|---:|---|
| Config Name | `Title` | Single line of text | Yes | `Homepage Priority Actions` | No | Human-readable row label. Built-in SharePoint title field. |
| Band Key | `BandKey` | Single line of text | Yes | `homepage-primary` | Yes | Stable band identifier used to join config to action items. |
| Enabled | `Enabled` | Yes/No | Yes | `Yes` | Yes | Public runtime must ignore disabled config rows. |
| Is Active | `IsActive` | Yes/No | Yes | `Yes` | Yes | Intended to be unique per `BandKey`. Admin validation must block multiple active rows for the same band. |
| Heading Text | `HeadingText` | Single line of text | No | blank | No | Optional visible heading above / within the rail. |
| Overflow Label | `OverflowLabel` | Single line of text | Yes | `More tools` | No | Label for overflow affordance. |
| Show Heading | `ShowHeading` | Yes/No | Yes | `No` | No | Governs whether `HeadingText` renders publicly. |
| Sticky After Hero | `StickyAfterHero` | Yes/No | Yes | `No` | No | Enables sticky compact mode when supported and host-safe. |
| Show Badges | `ShowBadges` | Yes/No | Yes | `Yes` | No | Governs badge rendering globally. |
| Desktop Layout Mode | `DesktopLayoutMode` | Choice | Yes | `rail` | No | Allowed values: `rail`, `segmented`, `hybrid`. |
| Tablet Layout Mode | `TabletLayoutMode` | Choice | Yes | `grid` | No | Allowed values: `grid`, `rail`, `hybrid`. |
| Mobile Layout Mode | `MobileLayoutMode` | Choice | Yes | `sheet-trigger` | No | Allowed values: `grid`, `scroll`, `sheet-trigger`. |
| Max Visible Desktop | `MaxVisibleDesktop` | Number (integer) | Yes | `5` | No | Typical supported range: `1–6`. |
| Max Visible Laptop | `MaxVisibleLaptop` | Number (integer) | Yes | `5` | No | Typical supported range: `1–5`. |
| Max Visible Tablet Landscape | `MaxVisibleTabletLandscape` | Number (integer) | Yes | `4` | No | Typical supported range: `1–6`. |
| Max Visible Tablet Portrait | `MaxVisibleTabletPortrait` | Number (integer) | Yes | `4` | No | Typical supported range: `1–4`. |
| Max Visible Phone | `MaxVisiblePhone` | Number (integer) | Yes | `4` | No | Typical supported range: `1–4`. |
| Open External In New Tab By Default | `OpenExternalInNewTabByDefault` | Yes/No | Yes | `Yes` | No | Default for item-level `OpenInNewTab` when item value is not explicitly set or is inherited. |
| Admin Notes | `AdminNotes` | Multiple lines of text (plain) | No | blank | No | Optional maintainer notes. Not rendered publicly. |

## List-level validation rules

1. There must be **exactly one** row where `BandKey = <target>` and both `Enabled = Yes` and `IsActive = Yes`.
2. `OverflowLabel` must not be empty.
3. `DesktopLayoutMode`, `TabletLayoutMode`, and `MobileLayoutMode` must remain within the allowed choice sets.
4. Visible-count fields must be integers greater than zero.
5. Visible-count defaults should remain consistent with doctrine and shell breakpoint rules:
   - desktop: 5 default
   - laptop: 5 default
   - tablet landscape: 4 default
   - tablet portrait: 4 default
   - phone: 4 default
6. The admin surface must block duplicate active rows per `BandKey` even if SharePoint itself does not enforce that uniqueness.

## Runtime resolution rule

The runtime resolver should use this precedence:

1. `BandKey` exact match
2. `Enabled = Yes`
3. `IsActive = Yes`
4. newest `Modified`
5. highest `ID`

The admin surface must still treat duplicate active rows as a validation error, even if the runtime can resolve one deterministically.

## Typed-contract mapping

### Raw row interface target

```ts
interface PriorityActionsBandConfigRow {
  Id: number;
  Title: string;
  BandKey: string;
  Enabled: boolean;
  IsActive: boolean;
  HeadingText?: string | null;
  OverflowLabel: string;
  ShowHeading: boolean;
  StickyAfterHero: boolean;
  ShowBadges: boolean;
  DesktopLayoutMode: 'rail' | 'segmented' | 'hybrid';
  TabletLayoutMode: 'grid' | 'rail' | 'hybrid';
  MobileLayoutMode: 'grid' | 'scroll' | 'sheet-trigger';
  MaxVisibleDesktop: number;
  MaxVisibleLaptop: number;
  MaxVisibleTabletLandscape: number;
  MaxVisibleTabletPortrait: number;
  MaxVisiblePhone: number;
  OpenExternalInNewTabByDefault: boolean;
  AdminNotes?: string | null;
}
```

### Normalized public contract mapping

| Normalized Property | Source Field |
|---|---|
| `bandKey` | `BandKey` |
| `heading` | `HeadingText` |
| `overflowLabel` | `OverflowLabel` |
| `enabled` | `Enabled` |
| `maxVisibleDesktop` | `MaxVisibleDesktop` |
| `maxVisibleLaptop` | `MaxVisibleLaptop` |
| `maxVisibleTabletLandscape` | `MaxVisibleTabletLandscape` |
| `maxVisibleTabletPortrait` | `MaxVisibleTabletPortrait` |
| `maxVisiblePhone` | `MaxVisiblePhone` |
| `mobileLayoutMode` | `MobileLayoutMode` |
| `tabletLayoutMode` | `TabletLayoutMode` |
| `desktopLayoutMode` | `DesktopLayoutMode` |
| `showHeading` | `ShowHeading` |
| `stickyAfterHero` | `StickyAfterHero` |
| `showBadges` | `ShowBadges` |
| `openExternalInNewTabByDefault` | `OpenExternalInNewTabByDefault` |

## Provisioning / documentation rules

The code agent must:

1. provision or normalize this exact list title and field contract
2. update repo list-schema docs under `docs/reference/sharepoint/list-schemas/hbcentral/**`
3. update any descriptor modules and seam adapters to use these exact internal names
4. avoid introducing alternate internal names unless the agent also performs the migration and updates the schema docs in the same pass

## Non-goals

This list is not intended to:

- store per-action rows
- store maintainers or permissions
- store analytics
- store audience membership detail beyond band-level presentation settings
