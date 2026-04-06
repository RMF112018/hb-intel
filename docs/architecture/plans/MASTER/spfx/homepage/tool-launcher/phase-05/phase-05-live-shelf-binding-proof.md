# Phase 05 — Live Shelf Binding Proof

## 1. Binding Path

### How live normalized data reaches the shelf layer

```
SharePoint REST API ("Tool Launcher Contents" list)
  ↓
fetchToolLauncherListItems(siteUrl)         [toolLauncherListSource.ts]
  → RawToolLauncherListItem[]
  ↓
normalizeToolLauncherItems(rawItems)        [toolLauncherNormalization.ts]
  → LauncherPlatformRecord[]
  ↓
useToolLauncherData()                       [useToolLauncherData.ts]
  → { platforms, isLoading, error }
  ↓
ToolLauncherWorkHub component               [ToolLauncherWorkHub.tsx]
  ↓
deriveToolLauncherPresentation(platforms, activeAudience)  [toolLauncherNormalization.ts]
  → filterByAudience(platforms, activeAudience)
    → deriveWorkflowShelves(visible)
      → group by workflowShelf field
      → per shelf: sort platforms by sortOrder then name
      → sort shelves alphabetically by shelfName
      → produce LauncherWorkflowShelf[] with shelfId, shelfName, platformCount, platforms
  ↓
<LauncherWorkflowShelves shelves={presentation.workflowShelves} />  [LauncherWorkflowShelves.tsx]
  → per shelf: heading row (name + count badge) + card grid
    → per platform: <LauncherShelfCard platform={p} />              [LauncherShelfCard.tsx]
      → resolveLogoAsset(p) for logo treatment
      → whole-card <a> with name + optional descriptor
```

### No manual per-shelf hardcoding

Shelf names come from the `WorkflowShelf` Choice field in the SharePoint list. New shelf values (e.g., "Legal & Compliance") can be added by editing the list without any code changes. The derivation layer groups dynamically.

### No raw SharePoint field access in rendering

`LauncherWorkflowShelves` and `LauncherShelfCard` receive only `LauncherWorkflowShelf[]` and `LauncherPlatformRecord` respectively. They never touch `RawToolLauncherListItem` or SharePoint field names.

## 2. Ordering Proof

### Shelf ordering

Shelves are sorted **alphabetically by `shelfName`** in `deriveWorkflowShelves()`.

Given shelves "Training & Compliance", "Finance & Admin", "People & Payroll", "Field & Operations":
→ Rendered order: Finance & Admin, Field & Operations, People & Payroll, Training & Compliance

This is deterministic and stable. No explicit shelf-sort-order field exists in the data model — alphabetical is the current contract.

### Card ordering within shelves

Platforms within each shelf are sorted by:
1. `sortOrder` ascending (default 999 for unset values)
2. `name` alphabetical as tiebreaker

This uses the same `bySortOrderThenName()` comparator used throughout the launcher (featured stage, all-platforms index).

Given platforms in "People & Payroll" shelf:
- BambooHR (sortOrder: 1) → first
- Employee Navigator (sortOrder: 2) → second
- ADP (sortOrder: 999, default) → third (alphabetical: "ADP" before any other unordered)

### Ordering is enforced at derivation time

Neither `LauncherWorkflowShelves` nor `LauncherShelfCard` re-sort. They render in the order they receive from the presentation model. This prevents render-time sorting inconsistencies.

## 3. Suppression Proof

### Shelf-level suppression

| Scenario | Behavior | Where enforced |
|----------|----------|---------------|
| Platform has no `workflowShelf` value | Excluded from all shelves | `deriveWorkflowShelves()` — `if (!p.workflowShelf) continue` |
| All platforms in a shelf filtered by audience | Shelf never produced (grouping happens after audience filter) | `filterByAudience()` runs before `deriveWorkflowShelves()` |
| All platforms in a shelf are inactive | Same — inactive records dropped in `normalizeToolLauncherItem()` | Normalization layer |
| Zero shelves derived | `LauncherWorkflowShelves` returns `null` | Component-level check: `if (shelves.length === 0) return null` |

### Composition-level suppression

When `LauncherWorkflowShelves` returns `null`, the `LauncherCompositionShell`'s `workflowShelves` region is not rendered. The shell's grid adjusts — the body (flagship + rail) takes the full layout without a dead shelves area below.

### No empty shelf containers

Zero-platform shelves are never derived. The normalization layer only creates a `LauncherWorkflowShelf` when at least one platform has that `workflowShelf` value and survives audience filtering. There are no empty `<div>` containers or "no platforms in this shelf" placeholders.

## 4. Partial-Data Proof

### Platform with name and URL but missing everything else

| Missing field | Shelf card behavior |
|--------------|-------------------|
| `descriptor` | Card renders name only — horizontal layout still reads well |
| `logoAssetRef` | Falls through 5-step resolution: manifest logo → manifest icon → monogram → category icon → Settings default |
| `workflowShelf` | Platform excluded from shelves (appears only in all-platforms index or flagship stage if featured) |
| `category` | Icon resolution falls to platform-specific or default icon |
| `sortOrder` | Defaults to 999 — sorts to end, alphabetical tiebreaker |

### Image load failure at runtime

`LauncherShelfCard` maintains `imageErrored` state. When `<img>` fires `onError`:
1. State set to `true`
2. Card re-renders with Lucide icon fallback
3. 40px container dimensions preserved — no layout shift

### Platform with all optional fields present

Card renders logo image (from `resolveLogoAsset`), name (0.8rem/600), and descriptor (0.68rem muted) in horizontal layout. Full rendering with no degradation.

### Shelf with single platform

Grid auto-fill produces a single card stretching to fill the first column. No special single-item handling needed — the grid is self-organizing.

### Shelf with many platforms

No platform count cap on shelves (unlike utility rail's 5-item limit). All platforms in a shelf render. For shelves with many platforms, the `minmax(180px, 1fr)` grid wraps naturally to additional rows.

## 5. Remaining Debt

| Debt | Phase | Description |
|------|-------|-------------|
| **Shelf sort order field** | Future | Shelves sort alphabetically. A `ShelfSortOrder` field in the list would allow editorial control over shelf display order. |
| **Shelf description/subtitle** | Future | Shelves have no description metadata. A shelf-level subtitle (e.g., "BambooHR, ADP, and benefits systems") could improve scannability. |
| **All-platforms overlay** | Phase 06 | Unshelved platforms need a browsable index accessible from the command band "All Platforms" button. |
| **Advanced search** | Phase 08 | No search within shelves. Platform name/alias matching deferred. |
| **Show more / collapse** | Future | Large shelves render all platforms. No "show 3 / show all" toggle. |
| **Responsive shelf layout** | Phase 07 | Desktop-only grid. Tablet/mobile breakpoints not implemented. |
| **Real logo asset deployment** | Ops | Manifest logo paths reference files not yet deployed to HBCentral. |
| **Shelf-level notice aggregation** | Future | Notices render in the utility rail, not per-shelf. A shelf with many platforms under maintenance gets no shelf-level signal. |
