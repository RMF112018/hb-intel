# Phase 00 — Repo-Truth Audit and Doctrine Lock

## 1. Current Surface Summary

The Tool Launcher / Work Hub is a homepage webpart in `apps/hb-webparts` that renders a grouped tile launcher inside the homepage Utility zone (Zone 2), alongside the Priority Actions Rail.

**Component path:**
`apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`

**SPFx identity:**
- ID: `cb7060f5-b852-4600-b912-a5f6f7221ce2`
- Alias: `ToolLauncherWorkHubWebPart`
- Manifest: `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHubWebPart.manifest.json`
- Hidden from toolbox (`hiddenFromToolbox: true`) — embedded in the reference homepage composition only

**How it renders:**
1. SPFx mount dispatcher receives `webPartProperties` and routes to the component by UUID.
2. The component normalizes the incoming config through `normalizeToolLauncherWorkHubConfig()`.
3. Normalization validates, deduplicates, audience-filters, sorts, and limits the groups and items.
4. If groups survive normalization, items are mapped to `LauncherGroup` / `LauncherTile` shapes with hard-coded icon and tint resolution, then delegated to `HbcLauncherSurface`.
5. If no groups survive, the component renders `HomepageEmptyState` with authoring governance messaging.

**Homepage zone placement:**
The launcher sits in the `utility` zone defined in `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx` — a dense command-surface zone with subtle cool-blue tint background, 10px editorial border radius, and 20px padding.

## 2. Current Data Contract

The launcher consumes a **local grouped configuration** seam. There is no live SharePoint list wiring.

**Root config** (`ToolLauncherWorkHubConfig` in `utilityContracts.ts`):

| Field | Type | Default |
|-------|------|---------|
| `heading` | `string?` | `"Tool Launcher / Work Hub"` |
| `groups` | `ToolLauncherGroup[]?` | `[]` |
| `maxGroups` | `number?` | `4` |
| `maxItemsPerGroup` | `number?` | `6` |

**Group shape** (`ToolLauncherGroup`):

| Field | Type | Purpose |
|-------|------|---------|
| `id` | `string` | Deduplication key |
| `title` | `string` | Display label and group-icon inference source |
| `order` | `number?` | Sort priority |
| `items` | `ToolLauncherItem[]` | Tile entries |

**Item shape** (`ToolLauncherItem`):

| Field | Type | Purpose |
|-------|------|---------|
| `id` | `string` | Deduplication key |
| `title` | `string` | Tile label |
| `href` | `string` | Navigation destination |
| `description` | `string?` | Tile subtitle |
| `iconKey` | `string?` | Resolved against hard-coded `TOOL_ICON_MAP` |
| `order` | `number?` | Sort priority |
| `audiences` | `string[]?` | Role-based visibility filter |
| `badge` | `UtilityBadge?` | Status badge (label + variant) |

**Normalized output** (`NormalizedToolLauncherWorkHub`):
Heading string plus validated, filtered, sorted, and limited groups array.

**Key limitation:** The entire contract is locally defined in `preconfiguredEntries` within the manifest. There is no adapter layer, no SharePoint list query, and no content-governance pipeline.

## 3. Current Primitive Stack

### Shared primitives (from `@hbc/ui-kit`)

| Primitive | Import path | Role |
|-----------|------------|------|
| `HbcLauncherSurface` | `@hbc/ui-kit/homepage` | Core rendering engine — grid/list layout, tile motion, group sections |
| `LauncherGroup`, `LauncherTile`, `LauncherTileTint` | `@hbc/ui-kit/homepage` | Type contracts for the rendering surface |
| `motion` | `@hbc/ui-kit/homepage` (re-export) | Tile hover/tap animation |
| `lucide-react` icons | `@hbc/ui-kit/homepage` (curated re-export) | Icon system |
| `cva`, `clsx` | `@hbc/ui-kit/homepage` (re-export) | Variant system and class merging |

### Local primitives (in `apps/hb-webparts`)

| Primitive | File | Role |
|-----------|------|------|
| `ToolLauncherWorkHubConfig` and related types | `homepage/webparts/utilityContracts.ts` | Local config contract |
| `normalizeToolLauncherWorkHubConfig()` | `homepage/helpers/utilityConfig.ts` | Validation, dedup, audience filter, sort, limit |
| `isVisibleForAudience()` | `homepage/helpers/visibility.ts` | Role-based item filtering |
| `resolveAuthoringMessage()` | `homepage/helpers/authoringGovernance.ts` | Empty/error state governance messaging |
| `HomepageEmptyState` | `homepage/components/HomepageEmptyState.tsx` | Consistent empty-state rendering |
| `HomepageLoadingState` | `homepage/components/HomepageLoadingState.tsx` | Loading skeleton |
| `TOOL_ICON_MAP` / `TOOL_TINT_MAP` | `ToolLauncherWorkHub.tsx` (inline) | Hard-coded icon and tint resolution |

### Rendering characteristics of `HbcLauncherSurface`

- Grid layout: `repeat(auto-fill, minmax(140px, 1fr))` with 8px gap
- List layout: single-column `1fr`
- Tiles: 44px min-height (touch-target compliant), 8px border radius, subtle brand-tint background
- Motion: `scale(1.02)` hover / `scale(0.98)` tap, gated by `prefers-reduced-motion`
- Tiles render as `<a>` (if `href`) or `<button>` (if `onClick`) via Radix `Slot`
- Group sections separated by gradient dividers with uppercased labels

## 4. Doctrine Lock

The following binding rules govern the Tool Launcher surface going forward, drawn from the SPFx Governing Standard, the Homepage Overlay, and the SharePoint Homepage Design Brief.

### 4.1 Identity and role

The Tool Launcher is a **premium internal app marketplace** — not a generic quick-links surface, not an equal-weight icon grid, not a grouped list of text links, and not a utility card. It must be operationally grounded and provide strong visual hierarchy.

_Source: Design Brief §13.10; Governing Standard §4.1–4.3_

### 4.2 Host respect and canvas ownership

The launcher owns the page canvas within its zone. It must not create shell chrome, navigation bars, sidebars, or footer rails. It must coexist with the SharePoint host chrome without duplicating or fighting it.

_Source: Governing Standard §3.1–3.3; Homepage Overlay §3.1_

### 4.3 Premium stack — mandatory

The launcher must materially use the approved premium stack:
- `motion` — intentional animation, lighter than PWA but clearly premium
- `lucide-react` — canonical premium icon system for launcher affordances (secondary role; primary brand treatment uses platform logos)
- `@floating-ui/react` — for anchored launcher flyouts where justified
- `@radix-ui/react-*` — accessible primitives
- `class-variance-authority` + `clsx` — variant systems

These must be materially used, not installed symbolically.

_Source: Governing Standard §5.1; Homepage Overlay §4.1–4.2_

### 4.4 Import discipline

Homepage webparts must import from `@hbc/ui-kit/homepage` as the primary UI entry point. Broad `@hbc/ui-kit` and `@hbc/ui-kit/app-shell` imports are **prohibited**.

_Source: Homepage Overlay §3.2_

### 4.5 Prohibited outcomes

| Prohibited outcome | Rule source |
|--------------------|-------------|
| Generic Fluent-shaped cards as dominant language | Governing Standard §4.1 |
| Thin-border white-card grids | Governing Standard §4.2; Homepage Overlay §5.1 |
| Timid hierarchy | Governing Standard §4.2 |
| Undersized modules floating in excessive empty canvas | Governing Standard §4.2 |
| Pseudo-icons (Unicode, text initials) in place of real icon system | Governing Standard §4.2; Homepage Overlay §5.3 |
| Equal-weight icon grid | Design Brief §13.10 |
| Grouped list of text links | Design Brief §13.10 |
| Stock enterprise UI with a brand tint | Governing Standard §4.1 |

### 4.6 Authoring safety and resilience

Every state must be professional and communicative:
- **Empty state** — authoring guidance when no groups are configured
- **Loading state** — professional skeleton
- **Error state** — graceful degradation
- Must behave well when minimally configured, partially configured, or moved between sections.

_Source: Homepage Overlay §3.4–3.5; Tenant Shell Blueprint §6.1_

### 4.7 Content governance

The launcher must have defined ownership, freshness policy, and stale-content handling. Content governance must not remain undefined.

- Owner role: Operations Program Managers
- Freshness cadence: weekly
- Content source: SharePoint list `Tool Launcher Contents` on HBCentral

_Source: Tenant Shell Blueprint §6.2; authoringGovernance.ts registry_

### 4.8 Token discipline

Use shared semantic tokens by default. Homepage-specific aliases are allowed and expected. Direct hex/rgb values and hardcoded pixel spacing are prohibited unless documented as deliberate local exceptions for flagship work.

_Source: Governing Standard §6.1; Homepage Overlay §3.6_

### 4.9 Structural rebuild over decorative refinement

When a surface materially underperforms the premium marketplace target, replace weak primitives, composition models, and interaction patterns. Do not preserve a weak system simply because it already compiles.

_Source: Governing Standard §4.3_

## 5. Immediate Constraints

The next implementation phase must respect:

1. **The SharePoint list `Tool Launcher Contents` is the content source.** The list already exists, the schema is set, and it is seeded. Schema creation is not pending work.

2. **The architecture brief is the UI hierarchy source.** The target composition model is a flagship stage + utility rail + workflow shelves + all-platforms layer — not the current flat grouped-tile model.

3. **The current `HbcLauncherSurface` shared primitive may be reused or evolved**, but it must not lock the new implementation into the current equal-weight tile grid if the premium marketplace target requires a different visual hierarchy.

4. **The normalizer pipeline (`normalizeToolLauncherWorkHubConfig`) is structurally sound** for validation, dedup, audience filtering, and limiting. Its shape will change when the data source changes, but the pattern is worth preserving.

5. **The authoring governance registry, empty-state pattern, and loading-state pattern are healthy** and should be preserved and extended.

6. **The homepage zone model is stable.** The launcher remains in the Utility zone (Zone 2). Zone placement is not changing.

7. **Import discipline must be maintained.** All UI imports must flow through `@hbc/ui-kit/homepage`.

8. **The icon resolution strategy must evolve.** The current hard-coded `TOOL_ICON_MAP` / `TOOL_TINT_MAP` is a transitional placeholder. The target uses real platform logos from the asset-manifest system with Lucide icons as secondary affordances only.

## 6. Retired Assumptions

The following assumptions must be retired immediately:

| Retired assumption | Reason |
|--------------------|--------|
| The data schema still needs to be designed | The `Tool Launcher Contents` list already exists with a full field contract, is created, and is seeded on HBCentral. |
| The grouped local config is the desired end state | It is a transitional seam. The target is live SharePoint list wiring with a typed adapter. |
| The current flat grouped-tile rendering is the target composition | The target is a multi-tier premium marketplace hierarchy: flagship stage, utility rail, workflow shelves, and all-platforms index. |
| Lucide icons are the primary brand treatment for platform tiles | Lucide icons are the secondary affordance system. Primary brand treatment uses official platform logos via the asset-manifest pipeline. |
| Polishing the current grouped config surface is valuable work | Structural rebuild is required. Decorative refinement of the current model is wasted effort per Governing Standard §4.3. |
| The launcher can remain a generic utility card | The Design Brief explicitly prohibits this outcome. The launcher must be a premium internal app marketplace. |

## Conclusion

The repo-truth audit confirms that the current Tool Launcher implementation is structurally sound as a grouped-config proof of concept but is not yet the premium marketplace surface defined by the governing doctrine and design brief.

The next data-related phase is:

**Live SharePoint list wiring and data adapter foundation**

Phase 01 must replace the local grouped-config intake with a typed, normalized, SharePoint-backed content adapter targeting the `Tool Launcher Contents` list on HBCentral — not schema ideation, not grouped-config polishing, and not UI redesign.
