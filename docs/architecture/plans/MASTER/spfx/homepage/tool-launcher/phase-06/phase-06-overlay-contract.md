# Phase 06 — Overlay Contract

## 1. Current-State Inventory Gap

### What the launcher was doing before Phase 06

The launcher had 3 tiers of platform visibility:
1. **Flagship stage** — featured platforms (isFeatured=true)
2. **Workflow shelves** — platforms with workflowShelf assigned
3. **Utility rail** — support metadata (not platform cards)

Platforms without `isFeatured` and without `workflowShelf` had no discovery path on the homepage. The "All Platforms" button in the command band was disabled (no handler).

### What the all-platforms layer requires

- A browsable inventory of **all active platforms** regardless of featured/shelf status
- Category-based grouping using `presentation.platformIndex` (already derived)
- Compact index rows (Tier 3) that are visually below both flagship and shelf cards
- Open/close behavior triggered from the command band
- Keyboard dismissal (Escape), click-outside dismissal
- Empty state when no platforms exist

## 2. Overlay / Index Contract

### Eligible records

All records in `presentation.allPlatforms` are eligible for the overlay. This means:
- Active platforms (IsActive=true) — enforced by normalization
- Audience-filtered platforms — enforced by `filterByAudience()` before derivation
- Both featured and non-featured platforms
- Both shelved and unshelved platforms

### Input model

The overlay consumes `LauncherPlatformIndex` from the presentation model:

```typescript
interface LauncherPlatformIndex {
  groups: Array<{
    category: string;           // "People & Payroll", "Finance & Admin", "Other"
    platforms: LauncherPlatformRecord[];  // sorted by sortOrder then name
  }>;
}
```

### Required fields per index row

| Field | Required | Fallback |
|-------|----------|----------|
| `platformKey` | Yes | React key |
| `name` | Yes | Row label |
| `launchUrl` | Yes | Navigation target |

### Optional fields per index row

| Field | Treatment when present | Treatment when absent |
|-------|----------------------|---------------------|
| `descriptor` | Shown inline after name | Row renders name only |
| `category` | Category tag badge | No tag |
| `logoAssetRef` | 32px `<img>` in logo container | Lucide icon fallback (5-step chain) |
| `openInNewTab` | `target="_blank"` | Default true |

### How index rows differ from other tiers

| Property | Flagship (Tier 1) | Shelf (Tier 2) | Index (Tier 3) |
|----------|------------------|----------------|----------------|
| Logo container | 56px | 40px | 32px |
| Layout | Column | Row | Row |
| Name font | 0.92rem / 650 | 0.8rem / 600 | 0.78rem / 600 |
| Descriptor | 0.78rem block | 0.68rem ellipsis | 0.65rem inline |
| Grid | 240px auto-fill | 180px auto-fill | Single-column list |
| CTA | Explicit row | Whole-card | Whole-row + ExternalLink icon |
| Motion | Spring | CSS transition | CSS transition |
| Category tag | No | No | Yes (badge) |
| Notice badge | Yes | No | No |

## 3. Ordering and Suppression Rules

### Category ordering

Categories within the overlay are sorted **alphabetically by category name**. The "Other" category (platforms without a category) sorts last alphabetically.

### Platform ordering within categories

Platforms within each category are sorted by `sortOrder` ascending then `name` alphabetical — the same `bySortOrderThenName` comparator used everywhere.

### Suppression

| Condition | Behavior |
|-----------|----------|
| No platforms in the presentation model | Overlay shows "No platforms available" empty state |
| Category has zero platforms | Category never appears (derivation only creates groups with platforms) |
| Overlay not open | Not rendered at all (state-driven) |

### Invalid row handling

Invalid records are already filtered by the normalization layer (missing Title or LaunchURL → skipped). The overlay never receives invalid records.

## 4. Structural Coding Plan

### `LauncherIndexRow.tsx` (new)

**Location:** `apps/hb-webparts/src/webparts/toolLauncherWorkHub/LauncherIndexRow.tsx`

**Responsibility:** Tier 3 compact row with 32px logo container, name, optional descriptor, optional category tag, ExternalLink icon. Whole-row `<a>` click target. Logo resolution via `resolveLogoAsset()` with `onError` fallback.

### `LauncherAllPlatformsOverlay.tsx` (new)

**Location:** `apps/hb-webparts/src/webparts/toolLauncherWorkHub/LauncherAllPlatformsOverlay.tsx`

**Responsibility:** Overlay panel consuming `LauncherPlatformIndex`. Category-grouped sections with headings. Scrollable with max-height constraint. Escape key and click-outside dismissal. Uses `role="dialog"` with `aria-modal="false"` (non-modal — the launcher remains visible beneath).

### `ToolLauncherWorkHub.tsx` (updated)

**Changes:** Added `overlayOpen` state via `useState`. Wired `onAllPlatforms` callback to `LauncherCommandBand`. Renders `LauncherAllPlatformsOverlay` when open, passing `presentation.platformIndex` and close handler.

### No changes to other launcher components

The composition shell, command band props, flagship stage, utility rail, and workflow shelves are unchanged. The overlay is additive.

## 5. Guardrails

| Must not | Reason |
|----------|--------|
| Create a separate page or faux app | The overlay anchors to the launcher, not a new route |
| Make the overlay visually primary | The overlay uses subtle styling (semi-transparent white, standard border, no hero-scale treatment) and sits below the launcher content |
| Bypass the normalized model | Overlay consumes `LauncherPlatformIndex` from the presentation model, not raw SP fields |
| Render a giant tile grid | Index rows are compact single-column list items, not cards or tiles |
| Block interaction with the launcher | `aria-modal="false"` — the launcher is still visible and the overlay dismisses on Escape or click-outside |
| Push overlay logic to `@hbc/ui-kit` | Overlay is launcher-specific; no second consumer exists |
| Implement advanced search in this prompt | Search/filter behavior is Phase 06 Prompt 03 scope |
