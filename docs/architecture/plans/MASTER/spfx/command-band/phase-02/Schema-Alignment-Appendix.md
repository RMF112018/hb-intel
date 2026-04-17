# Schema Alignment Appendix

## Canonical governing lists

### 1. `Priority Actions Band Config`
**Exact list title:** `Priority Actions Band Config`

**Operating posture**
- one active config row per `BandKey`
- initial canonical row: `homepage-primary`

**Active row resolution order**
1. `BandKey` exact match
2. `Enabled = true`
3. `IsActive = true`
4. newest `Modified`
5. highest `ID`

**Required internal names**
- `Title`
- `BandKey`
- `Enabled`
- `IsActive`
- `HeadingText`
- `OverflowLabel`
- `ShowHeading`
- `StickyAfterHero`
- `ShowBadges`
- `DesktopLayoutMode`
- `TabletLayoutMode`
- `MobileLayoutMode`
- `MaxVisibleDesktop`
- `MaxVisibleLaptop`
- `MaxVisibleTabletLandscape`
- `MaxVisibleTabletPortrait`
- `MaxVisiblePhone`
- `OpenExternalInNewTabByDefault`
- `AdminNotes`

**Implementation implications**
- Must have a descriptor module that centralizes list title and field map
- Must have raw-row type keyed to internal names
- Must have active-row resolver with duplicate-active invalid-state detection
- Must map storage fields to the normalized `PriorityRailBandConfig` contract

---

### 2. `Priority Actions Band Items`
**Exact list title:** `Priority Actions Band Items`

**Identity posture**
- join key: `BandKey`
- stable item key: `ActionKey`

**Required internal names**
- `Title`
- `BandKey`
- `ActionKey`
- `ItemStatus`
- `ActionDescription`
- `Href`
- `IconKey`
- `BadgeLabel`
- `BadgeVariant`
- `Priority`
- `GroupKey`
- `GroupTitle`
- `SortOrder`
- `OverflowOnly`
- `MobilePriority`
- `AudienceMode`
- `AudienceKeys`
- `IsExternal`
- `OpenInNewTab`
- `VisibleDesktop`
- `VisibleLaptop`
- `VisibleTabletLandscape`
- `VisibleTabletPortrait`
- `VisiblePhone`
- `StartsAtUtc`
- `EndsAtUtc`
- `AdminNotes`

**Normalization intent**
- trim strings
- normalize `AudienceKeys` newline payload into arrays
- enforce status/schedule/device visibility gates
- force overflow when `OverflowOnly = true`
- deterministic sort by `SortOrder` then stable key

**Implementation implications**
- Must have a descriptor module and raw-row type
- Must explicitly normalize storage rows into `PriorityRailActionItem`
- Must keep `ActionKey` stable across edits and migrations
- Must validate required `Title` and `Href`
- Must reject inconsistent schedule windows and invalid icon keys

---

## Cross-list relationship
- `BandKey` is the authoritative join between the active config row and item rows.
- The implementation must not infer a relationship using display names, URL position, or list order.

## Required code seams implied by schema truth
- `readPriorityRailBandConfig(...)`
- `readPriorityRailItems(...)`
- `resolveActivePriorityRailConfig(...)`
- `normalizePriorityRailData(...)`
- `filterPriorityRailByAudience(...)`
- `resolvePriorityRailByBreakpoint(...)`
- `savePriorityRailBandConfig(...)`
- `savePriorityRailItems(...)`
- `reorderPriorityRailItems(...)`
- `archivePriorityRailItem(...)`
- `validatePriorityRailDraft(...)`

## Hardening rules
- No direct scattered string literals for internal names
- No direct SharePoint row access in render components
- No UI-only fix that leaves schema drift unresolved
- No hidden fallback to undocumented fields
