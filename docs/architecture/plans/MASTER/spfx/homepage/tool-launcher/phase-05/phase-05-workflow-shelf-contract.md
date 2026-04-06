# Phase 05 — Workflow Shelf Contract

## 1. Shelf Contract

The `LauncherWorkflowShelf` type defines the contract consumed by the shelf rendering layer:

```typescript
interface LauncherWorkflowShelf {
  /** Shelf identity key (slugified name, e.g., "shelf-people-payroll"). */
  shelfId: string;
  /** Display name (e.g., "People & Payroll"). */
  shelfName: string;
  /** Number of visible platforms in this shelf. */
  platformCount: number;
  /** Platforms in this shelf, sorted by sortOrder then name. */
  platforms: LauncherPlatformRecord[];
}
```

### Contract fields

| Field | Source | Purpose |
|-------|--------|---------|
| `shelfId` | `slugifyShelfName(shelfName)` prefixed with `shelf-` | React key, `data-launcher-shelf` attribute, `HbcLauncherSurface` group ID |
| `shelfName` | `LauncherPlatformRecord.workflowShelf` | Heading display, group label |
| `platformCount` | `platforms.length` | Count badge in shelf heading |
| `platforms` | Filtered and sorted subset of all visible platforms | Card rendering |

### How this avoids grouped-tile thinking

The old `ToolLauncherGroup` type (`id`, `title`, `items[]`) was a generic container with no semantic meaning. The new `LauncherWorkflowShelf` is purpose-built:
- `shelfId` is derived from the shelf name, not a manually-assigned ID
- `shelfName` comes from normalized list metadata, not hardcoded group titles
- `platformCount` is a pre-computed summary, not a rendering-time calculation
- Platforms come pre-sorted from the normalization layer, not sorted at render time

## 2. Grouping Rules

### How normalized records become workflow shelves

```
LauncherPlatformRecord[]
  → filterByAudience(platforms, activeAudience)     // audience filtering
    → deriveWorkflowShelves(visible)                // grouping
      → for each platform with workflowShelf ≠ undefined:
          group into Map<shelfName, platforms[]>
      → for each group:
          sort platforms by sortOrder then name
          produce LauncherWorkflowShelf { shelfId, shelfName, platformCount, platforms }
      → sort shelves alphabetically by shelfName
```

### Grouping key

The grouping key is `LauncherPlatformRecord.workflowShelf` — a normalized string from the SharePoint list's `WorkflowShelf` Choice column. Expected values include:
- "People & Payroll"
- "Field & Operations"
- "Training & Compliance"
- "Finance & Admin"

New shelf values can be added to the SharePoint list without code changes. The normalization layer groups dynamically.

### Platforms without a shelf

Platforms where `workflowShelf` is `undefined` or empty are excluded from workflow shelves. They appear in the all-platforms index (Phase 06) and, if featured, in the flagship stage.

### Audience filtering

Audience filtering happens before shelf derivation in `deriveToolLauncherPresentation()`. Shelves only contain platforms visible to the current audience.

## 3. Ordering Rules

### Shelf order

Shelves are sorted **alphabetically by `shelfName`**. This is deterministic and stable — no explicit sort-order field exists on shelves. If shelf ordering needs to diverge from alphabetical, a `ShelfSortOrder` field would need to be added to the SharePoint list and normalization model.

### Item order within shelves

Platforms within each shelf are sorted by:
1. `sortOrder` ascending (default 999 for unset values)
2. `name` alphabetical as tiebreaker

This is the same `bySortOrderThenName` comparator used throughout the launcher.

### Featured platforms in shelves

A platform can be both `isFeatured: true` and have a `workflowShelf` assigned. Such platforms appear in **both** the flagship stage and their workflow shelf. This is intentional — flagship gives primary visibility; shelf provides categorical context.

## 4. Suppression Rules

### Shelf suppression

| Condition | Behavior |
|-----------|----------|
| `workflowShelf` is empty/undefined on a platform | Platform excluded from all shelves (not an empty shelf — just not grouped) |
| All platforms in a shelf are filtered by audience | Shelf is not derived (zero-platform shelves are never created) |
| All platforms in a shelf are inactive | Same — filtered before derivation |
| Shelves array is empty (no platforms have `workflowShelf`) | `LauncherWorkflowShelves` returns null; composition shell's shelves region is suppressed |

### Item suppression within shelves

Individual platforms are never suppressed within a shelf — if they made it through normalization (active, valid Title/LaunchURL, audience-visible), they render. There is no per-shelf item limit (unlike the utility rail's 5-item cap).

### Component-level suppression

`LauncherWorkflowShelves` returns `null` when `shelves.length === 0`. The composition shell renders without its workflow-shelves region.

## 5. Risks Avoided

| Risk | How avoided |
|------|------------|
| **Reverting to grouped-tile thinking** | Shelves are derived from normalized `workflowShelf` metadata, not from hardcoded group definitions. New shelf values are added in the SharePoint list, not in code. |
| **Binding to raw SharePoint fields** | The component receives `LauncherWorkflowShelf[]` from the presentation model. It never touches `RawToolLauncherListItem` or SharePoint field names. |
| **Hardcoded shelf buckets** | Shelf names are dynamic from list data. The code has no `if (shelfName === 'People & Payroll')` branches. |
| **Shelves competing with flagship stage** | Shelves use `HbcLauncherSurface` tiles (140px min, icon-only) while flagship uses `LauncherFlagshipCard` (240px min, 56px logo container, motion, CTA row). Visual hierarchy is structural. |
| **Empty shelf containers** | Zero-platform shelves are never derived. No empty `<div>` with just a heading. |
| **Over-engineering shelf metadata** | The contract adds `shelfId` and `platformCount` — both immediately useful. No speculative fields. |
