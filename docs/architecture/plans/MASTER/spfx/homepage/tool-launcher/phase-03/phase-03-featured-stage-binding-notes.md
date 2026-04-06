# Phase 03 — Featured Stage Binding Notes

## 1. Binding Approach

### How featured data is selected

Featured platforms are selected by the normalization layer in `deriveToolLauncherPresentation()`:

```
LauncherPlatformRecord[]
  → filterByAudience(platforms, activeAudience)    // NEW in P03-02
    → deriveFeaturedStage(visible)
      → filter: p.isFeatured === true
      → sort: byFeaturedSort (featuredSortOrder asc, name asc)
      → LauncherFeaturedStage.platforms
```

### Ordering logic

1. **Primary sort:** `featuredSortOrder` ascending (default 999 for unset values — sorts to end)
2. **Secondary sort:** alphabetical by `name` (stable tiebreaker)

This ordering is enforced in the normalization layer's `byFeaturedSort()` comparator. The `LauncherFlagshipStage` component renders platforms in the order it receives them — it does not re-sort.

### Audience-aware filtering (new in P03-02)

`deriveToolLauncherPresentation()` now accepts an optional `activeAudience` parameter. When provided:
- Platforms with **no audience restrictions** (empty `audiences` array) remain visible to all
- Platforms with **audience restrictions** are filtered to only include those matching the active audience
- When `activeAudience` is `undefined`, **no filtering is applied** (admin/demo mode)

Filtering is applied **before** all derivation steps (featured stage, workflow shelves, platform index, notices summary), ensuring consistent audience awareness across all regions.

### Data flow from component to stage

```
ToolLauncherWorkHub
  → useToolLauncherData()                          // LauncherPlatformRecord[]
  → deriveToolLauncherPresentation(platforms, activeAudience)  // NEW: audience param
    → presentation.featuredStage.platforms          // featured, audience-filtered, sorted
  → <LauncherFlagshipStage platforms={...} />
    → <LauncherFlagshipCard platform={p} />         // per featured platform
```

## 2. Suppression Rules

| Condition | Stage behavior | Shell behavior |
|-----------|---------------|----------------|
| No platforms have `isFeatured: true` | `LauncherFlagshipStage` returns `null` | Flagship region suppressed; body grid has no flagship content |
| All featured platforms filtered by audience | Same as above | Same as above |
| List returns zero active items | Component renders `HomepageEmptyState` with `listEmpty` message | Shell not rendered at all |
| Fetch error | Component falls through to config fallback | Shell not rendered; `HbcLauncherSurface` bridge used instead |
| Some featured platforms have missing descriptors | Cards render without descriptor line | Stage renders normally |
| Some featured platforms have missing logos | Cards render with fallback Lucide icons | Stage renders normally |

The flagship stage never renders an empty grid. If `platforms.length === 0`, the component returns `null` immediately.

## 3. Data Assumptions

### What the stage assumes the normalized launcher seam provides

| Field | Assumed type | Assumed contract |
|-------|-------------|-----------------|
| `platformKey` | `string` | Non-empty, unique across the array |
| `name` | `string` | Non-empty (records without Title are skipped by normalization) |
| `launchUrl` | `string` | Non-empty (records without LaunchURL are skipped) |
| `isFeatured` | `boolean` | `true` for stage entries; `false` for non-featured |
| `featuredSortOrder` | `number` | Finite number; default 999 from normalization |
| `descriptor` | `string \| undefined` | Optional; card renders without it |
| `logoAssetRef` | `string \| undefined` | Optional; fallback icon rendered when absent |
| `openInNewTab` | `boolean` | Default `true` from normalization |
| `notice` | `LauncherNoticeBadge \| undefined` | Optional; badge rendered when present with valid tone |
| `audiences` | `string[]` | May be empty (visible to all); filtering done in derivation |

### What the component passes to the stage

- `presentation.featuredStage.platforms` — already filtered by `isFeatured`, audience, and sorted by `featuredSortOrder`
- The stage and card components do not re-filter or re-sort

### What the command band receives

- `platformCount` — total visible platforms after audience filtering (`presentation.allPlatforms.length`)
- `featuredCount` — number of featured platforms (`presentation.featuredStage.platforms.length`)

## 4. Residual Debt

| Debt | Phase | Description |
|------|-------|-------------|
| Real brand logo assets | Phase 03 Prompt 03 | `logoAssetRef` slot exists but no real vendor logos are loaded from the asset manifest yet |
| Dark logo variant | Phase 03 Prompt 03 | `darkLogoAssetRef` is normalized but not consumed by the card |
| Logo image error handling | Phase 03 Prompt 03 | No `onError` handler on the `<img>` element; broken image falls through without fallback |
| Flagship card focus styling | Future | Keyboard focus uses browser default ring; no custom brand-blue focus treatment |
| All Platforms overlay | Phase 06 | Featured platforms in the overlay should be visually distinguished |
| Audience context wiring | Runtime | `activeAudience` is passed from component props but the SPFx mount path does not yet extract audience from SharePoint user profile |
| Platform count in command band | Complete | Now shows "N platforms · M featured" context |
