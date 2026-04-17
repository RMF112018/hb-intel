# 06 — SharePoint List Schema — `Priority Actions Band Items`

## Purpose

This is the authoritative schema for the action-item list used by:

- `PriorityActionsRail`
- `PriorityActionsRailAdmin`

This schema is part of the implementation contract. The code agent must not infer an alternate field model from old list contents or from incomplete runtime code. If repo truth differs, the agent must either migrate to this schema or update the docs and runtime together with an explicit justification.

## Canonical list identity

- **List title:** `Priority Actions Band Items`
- **Recommended URL / entity type alias:** `PriorityActionsBandItems`
- **Template:** Generic list
- **Attachments:** disabled
- **Folder creation:** disabled
- **Versioning:** enabled
- **Content types:** disabled unless repo standards require otherwise
- **Operational join key:** `BandKey`
- **Primary stable item key:** `ActionKey`

## Operational model

Each row represents one candidate action in a Priority Actions command band.

The intended runtime model is:

- one item belongs to one band via `BandKey`
- one item has one stable `ActionKey`
- public rendering uses only rows with `ItemStatus = Enabled`
- disabled and archived rows remain available to the admin surface for maintenance and history
- order is controlled by `SortOrder`
- item-specific visibility, audience, scheduling, and overflow rules determine whether an enabled item appears in the visible rail or overflow for a given user and breakpoint

## Field schema

| Display Name | Internal Name | Type | Required | Default | Indexed | Notes |
|---|---|---|---:|---|---:|---|
| Action Title | `Title` | Single line of text | Yes | blank | No | Built-in SharePoint title field. Public label source. |
| Band Key | `BandKey` | Single line of text | Yes | `homepage-primary` | Yes | Joins items to the band config row. |
| Action Key | `ActionKey` | Single line of text | Yes | blank | Yes | Stable app-facing key. Should be unique across the list or at minimum unique per band. |
| Item Status | `ItemStatus` | Choice | Yes | `Enabled` | Yes | Allowed values: `Enabled`, `Disabled`, `Archived`. |
| Action Description | `ActionDescription` | Multiple lines of text (plain) | No | blank | No | Optional supporting description. |
| Href | `Href` | Single line of text | Yes | blank | No | Canonical URL target. Absolute or site-relative URL allowed. |
| Icon Key | `IconKey` | Single line of text | No | blank | No | Must map to approved icon registry or adapter. |
| Badge Label | `BadgeLabel` | Single line of text | No | blank | No | Optional badge text. |
| Badge Variant | `BadgeVariant` | Choice | Yes | `neutral` | No | Allowed values: `neutral`, `info`, `warning`, `success`, `critical`. |
| Priority | `Priority` | Choice | Yes | `primary` | No | Allowed values: `primary`, `secondary`, `overflow`. |
| Group Key | `GroupKey` | Single line of text | No | blank | No | Optional grouping key. |
| Group Title | `GroupTitle` | Single line of text | No | blank | No | Optional human-readable group label. |
| Sort Order | `SortOrder` | Number (integer) | Yes | `100` | Yes | Governs deterministic ordering. |
| Overflow Only | `OverflowOnly` | Yes/No | Yes | `No` | No | When true, item should not render in visible primary set. |
| Mobile Priority | `MobilePriority` | Number (integer) | No | `100` | No | Lower values surface earlier in phone layouts. |
| Audience Mode | `AudienceMode` | Choice | Yes | `all` | No | Allowed values: `all`, `include-only`, `exclude`, `role-driven`. |
| Audience Keys | `AudienceKeys` | Multiple lines of text (plain) | No | blank | No | Canonical storage is newline-delimited keys. Runtime may also normalize comma/semicolon input. |
| Is External | `IsExternal` | Yes/No | Yes | `No` | No | Explicit external-link indicator. Runtime may derive fallback from `Href` if needed. |
| Open In New Tab | `OpenInNewTab` | Yes/No | Yes | `No` | No | Item-level launch behavior. May be overridden by config default if app supports inherited state. |
| Visible Desktop | `VisibleDesktop` | Yes/No | Yes | `Yes` | No | Device visibility gate. |
| Visible Laptop | `VisibleLaptop` | Yes/No | Yes | `Yes` | No | Device visibility gate. |
| Visible Tablet Landscape | `VisibleTabletLandscape` | Yes/No | Yes | `Yes` | No | Device visibility gate. |
| Visible Tablet Portrait | `VisibleTabletPortrait` | Yes/No | Yes | `Yes` | No | Device visibility gate. |
| Visible Phone | `VisiblePhone` | Yes/No | Yes | `Yes` | No | Device visibility gate. |
| Starts At UTC | `StartsAtUtc` | Date and time | No | blank | Yes | Optional scheduled start. Store in UTC. |
| Ends At UTC | `EndsAtUtc` | Date and time | No | blank | Yes | Optional scheduled end. Store in UTC. |
| Admin Notes | `AdminNotes` | Multiple lines of text (plain) | No | blank | No | Optional maintainer notes. Not rendered publicly. |

## List-level validation rules

1. `ActionKey` is required and must remain stable after initial creation.
2. `Title` and `Href` are required.
3. `ItemStatus` must remain within the allowed values.
4. `Priority` must remain within the allowed values.
5. `BadgeVariant` must remain within the allowed values.
6. If `AudienceMode` is not `all`, `AudienceKeys` must contain at least one normalized key.
7. At least one device visibility field must be `Yes`.
8. If `OverflowOnly = Yes`, the normalized item must resolve to overflow treatment even if `Priority = primary`.
9. If `StartsAtUtc` and `EndsAtUtc` are both populated, `StartsAtUtc` must be earlier than or equal to `EndsAtUtc`.
10. If `GroupTitle` is set and `GroupKey` is blank, admin validation should either block save or derive a slugged `GroupKey` deterministically.
11. `SortOrder` must be an integer and the reorder workflow must persist deterministic values.
12. `Archived` items must not render publicly.

## Normalization rules

The runtime normalization seam should apply these rules:

- trim all string fields
- treat blank multiline `AudienceKeys` as an empty array
- normalize `AudienceKeys` by newline first, then comma / semicolon fallback
- derive `isExternal` from `Href` if `IsExternal` is absent or stale
- coerce `OverflowOnly = true` to overflow treatment
- ignore items outside an active schedule window
- exclude items whose `ItemStatus` is not `Enabled`

## Typed-contract mapping

### Raw row interface target

```ts
interface PriorityActionsBandItemRow {
  Id: number;
  Title: string;
  BandKey: string;
  ActionKey: string;
  ItemStatus: 'Enabled' | 'Disabled' | 'Archived';
  ActionDescription?: string | null;
  Href: string;
  IconKey?: string | null;
  BadgeLabel?: string | null;
  BadgeVariant: 'neutral' | 'info' | 'warning' | 'success' | 'critical';
  Priority: 'primary' | 'secondary' | 'overflow';
  GroupKey?: string | null;
  GroupTitle?: string | null;
  SortOrder: number;
  OverflowOnly: boolean;
  MobilePriority?: number | null;
  AudienceMode: 'all' | 'include-only' | 'exclude' | 'role-driven';
  AudienceKeys?: string | null;
  IsExternal: boolean;
  OpenInNewTab: boolean;
  VisibleDesktop: boolean;
  VisibleLaptop: boolean;
  VisibleTabletLandscape: boolean;
  VisibleTabletPortrait: boolean;
  VisiblePhone: boolean;
  StartsAtUtc?: string | null;
  EndsAtUtc?: string | null;
  AdminNotes?: string | null;
}
```

### Normalized public contract mapping

| Normalized Property | Source Field |
|---|---|
| `actionKey` | `ActionKey` |
| `title` | `Title` |
| `description` | `ActionDescription` |
| `href` | `Href` |
| `iconKey` | `IconKey` |
| `badgeLabel` | `BadgeLabel` |
| `badgeVariant` | `BadgeVariant` |
| `priority` | `Priority` |
| `groupKey` | `GroupKey` |
| `groupTitle` | `GroupTitle` |
| `order` | `SortOrder` |
| `isExternal` | `IsExternal` |
| `openInNewTab` | `OpenInNewTab` |
| `audienceMode` | `AudienceMode` |
| `audienceKeys` | normalized `AudienceKeys` |
| `visibleDesktop` | `VisibleDesktop` |
| `visibleLaptop` | `VisibleLaptop` |
| `visibleTabletLandscape` | `VisibleTabletLandscape` |
| `visibleTabletPortrait` | `VisibleTabletPortrait` |
| `visiblePhone` | `VisiblePhone` |
| `overflowOnly` | `OverflowOnly` |
| `mobilePriority` | `MobilePriority` |
| `startsAtUtc` | `StartsAtUtc` |
| `endsAtUtc` | `EndsAtUtc` |

## Provisioning / documentation rules

The code agent must:

1. provision or normalize this exact list title and field contract
2. update repo list-schema docs under `docs/reference/sharepoint/list-schemas/hbcentral/**`
3. update descriptor modules, raw row types, adapters, validation seams, and write seams to use these exact internal names
4. avoid introducing alternate field names unless the migration and docs update happen in the same pass
5. seed or migrate legacy quick-links data into this list only after mapping every legacy field into the canonical item model

## Non-goals

This list is not intended to:

- store band-level settings
- store analytics or click telemetry
- store raw audience membership objects
- replace permission enforcement
