# Phase 00 — Current-vs-Target Gap Map and Retirement Plan

## 1. Current-vs-Target Gap Matrix

| Category | Current state | Target state | Gap severity |
|----------|--------------|-------------|--------------|
| **Content source** | Local grouped config in `preconfiguredEntries` of the webpart manifest; no SharePoint query | Live SharePoint list adapter reading `Tool Launcher Contents` on HBCentral; single normalization layer between list fields and UI model | **Critical** — the entire data pipeline must be replaced |
| **Information architecture** | Flat: heading → groups → items; all groups rendered at equal weight in a uniform tile grid | 3-zone launcher: top command band → flagship stage (8/4 split with utility rail) → workflow shelves → all-platforms overlay; 3-tier card hierarchy (flagship, workflow, index) | **Critical** — composition model must be rebuilt |
| **Brand treatment** | Icon-led tiles using hard-coded `TOOL_ICON_MAP` mapping `iconKey` strings to Lucide icons; no platform logos; tint accent only | Official platform logos as primary brand treatment via `@hbc/ui-kit` shared brand asset system; Lucide icons demoted to secondary affordances only; governed fallback strategy for missing logos | **Critical** — brand treatment is structurally wrong |
| **Support / utility actions** | None; no help links, no access-request destinations, no support-owner routing; badge support exists but is static and locally configured | Utility rail with favorites, recently-used, help/access-request routing, and platform notices; badge data sourced from live list notice fields (`Notice Status`, `Badge Text`, `Notice Details`, `Notice Expires On`) | **High** — entire support layer is missing |
| **Search and discovery** | None; no search, no filtering beyond audience-based hiding; no command entry | Command band with smart search across platform names, aliases, keywords, workflow terms, and support actions; search results support direct launch, help destination, access request, and recent/favorite matching | **High** — no search surface exists |
| **Authoring and resilience** | Empty state: `HomepageEmptyState` with authoring governance messaging; loading state: `HomepageLoadingState` skeleton; no error boundary beyond empty-group detection; no partial-data normalization from live fields | Professional empty, loading, and error states; partial-data resilience for live SharePoint field normalization; stale-content detection; author-safe defaults that communicate webpart purpose even when minimally configured | **Medium** — foundation exists but must be extended for live-data scenarios |
| **Card hierarchy** | Single card type: uniform `LauncherTile` at 140px min-width in auto-fill grid; no size differentiation | 3-tier hierarchy: flagship launch cards (large, logo-led, with CTA), workflow shelf cards (medium, compact), and index rows (list-format in all-platforms overlay) | **Critical** — single-tier rendering cannot express the target hierarchy |
| **Responsive behavior** | `HbcLauncherSurface` uses CSS auto-fill grid that reflows; no explicit breakpoint strategy; no mobile-specific treatment | Desktop: command band + 8/4 stage split + shelves; tablet: 2-column flagship grid, rail collapses below; mobile: search first, stacked/swipeable flagships, accordion shelves, full-screen all-platforms sheet | **High** — responsive strategy must be designed explicitly |
| **Audience / role visibility** | Simple `isVisibleForAudience()` check: array membership filter per item | Same audience filtering preserved but extended with `Audience Rules JSON` from live list for richer visibility logic | **Low** — mechanism is sound, needs data-source upgrade |

## 2. What Can Be Reused

### Keep and extend

| Element | Location | Justification |
|---------|----------|---------------|
| **Normalization pipeline pattern** | `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts` | The validate → deduplicate → filter → sort → limit pipeline is structurally sound. The input shape changes when the data source changes, but the pattern is healthy. |
| **Audience visibility function** | `apps/hb-webparts/src/homepage/helpers/visibility.ts` | `isVisibleForAudience()` is correct and reusable. May later accept richer audience-rules JSON from the live list. |
| **Authoring governance registry entry** | `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts` | The `toolLauncherWorkHub` entry (owner role, freshness cadence, rotation expectation, zone intent, messages) is correct and should be extended for live-data states. |
| **Empty-state and loading-state patterns** | `HomepageEmptyState`, `HomepageLoadingState` | Consistent empty/loading rendering is healthy. Must be extended with error-state handling and partial-data resilience. |
| **Homepage zone placement** | `ReferenceHomepageComposition.tsx` — Utility zone (Zone 2) | Zone assignment is stable. The launcher stays in the utility zone. |
| **SPFx mount dispatcher pattern** | `apps/hb-webparts/src/mount.tsx` | UUID-keyed dispatch is correct and unchanged. |
| **Webpart manifest identity** | `ToolLauncherWorkHubWebPart.manifest.json` — UUID `cb7060f5-...` | Identity, alias, and host registration are correct. `preconfiguredEntries` will shed the local grouped config as the live adapter takes over. |
| **Badge contract shape** | `UtilityBadge` in `utilityContracts.ts` | Label + variant shape is reusable for notice badge rendering from live list data. |

### Keep but monitor

| Element | Location | Note |
|---------|----------|------|
| **`HbcLauncherSurface` shared primitive** | `packages/ui-kit/src/HbcLauncherSurface/index.tsx` | The current surface renders a uniform tile grid. It may serve as the foundation for **one tier** of the 3-tier card hierarchy (workflow shelf cards or index rows), but it cannot serve as the sole rendering primitive for the target composition. The flagship stage needs a different card primitive. |

## 3. What Must Be Replaced

| Element | Location | Replacement |
|---------|----------|-------------|
| **Local grouped config as data source** | `preconfiguredEntries` in manifest + `ToolLauncherWorkHubConfig` | Typed SharePoint list adapter targeting `Tool Launcher Contents`; single normalization layer mapping live list fields to the launcher data model |
| **`ToolLauncherWorkHubConfig` root contract** | `utilityContracts.ts` | New launcher data model aligned to the live list field contract (platform name, key, launch URL, logo references, workflow shelf, category, featured flag, audience rules, support fields, notice fields, etc.) |
| **Hard-coded `TOOL_ICON_MAP` / `TOOL_TINT_MAP`** | `ToolLauncherWorkHub.tsx` (inline) | Logo resolution from the shared brand asset system (`@hbc/ui-kit` branding lane); Lucide icons retained only as fallback/secondary affordances |
| **Group-icon inference by title substring** | `ToolLauncherWorkHub.tsx` (inline) | Shelf/category identity driven by live list metadata (`Workflow Shelf`, `Category` fields), not string matching on group titles |
| **Flat group → tile rendering** | `ToolLauncherWorkHub.tsx` → `HbcLauncherSurface` | 3-zone composition: command band, flagship stage (8/4 split with utility rail), workflow shelves, all-platforms overlay; 3-tier card hierarchy |
| **Single `LauncherGroup` / `LauncherTile` mapping** | `ToolLauncherWorkHub.tsx` | Distinct mapping paths for flagship cards, workflow shelf cards, and index rows, each with appropriate visual treatment |

## 4. What Must Be Retired

### Stale assumptions

| Assumption | Why it must be retired |
|-----------|----------------------|
| The platform data schema still needs to be designed | `Tool Launcher Contents` already exists with a full field contract, is created, and is seeded on HBCentral. Schema design is complete. |
| Grouped local config is the production data model | It is a transitional seam for development convenience. The production data source is the live SharePoint list. |
| The current flat grouped-tile rendering is the target composition | The architecture brief defines a 3-zone, 3-tier premium marketplace hierarchy. The flat grid is a placeholder. |
| Lucide icons are the primary brand treatment | Lucide icons are the secondary affordance system. Primary brand treatment requires official platform logos via the shared asset system. |
| All platforms should render at equal visual weight | The 3-tier card hierarchy (flagship, workflow, index) is a binding requirement from the architecture brief. Equal-weight grids are explicitly prohibited. |
| Decorative refinement of the current surface is valuable | Per Governing Standard §4.3, structural rebuild is preferred over decorative refinement when a surface materially underperforms. The current surface materially underperforms the premium marketplace target. |

### Local contract shapes to retire

| Shape | Location | Reason |
|-------|----------|--------|
| `ToolLauncherWorkHubConfig` | `utilityContracts.ts` | Root config shape designed for local grouped data; will be replaced by list-backed data model |
| `ToolLauncherGroup` | `utilityContracts.ts` | Group concept is replaced by shelf/category/featured-stage semantics from live list fields |
| `ToolLauncherItem` | `utilityContracts.ts` | Item shape is too narrow; the live list field contract includes logo references, support fields, notice fields, audience rules JSON, and governance metadata not present in the current shape |
| `NormalizedToolLauncherWorkHub` / `NormalizedToolLauncherGroup` | `utilityConfig.ts` | Normalized output shapes are coupled to the local grouped config model; must be redesigned for the list-backed data model |

**Note:** These shapes should not be deleted until the replacement adapter is proven and wired. Retirement means they are no longer the target — not that they should be ripped out prematurely.

### Composition shortcuts to retire

| Shortcut | Reason |
|----------|--------|
| Hard-coded `TOOL_ICON_MAP` keyed by string tokens | Does not support real platform logos; does not scale with live list content |
| Hard-coded `TOOL_TINT_MAP` keyed by string tokens | Tint assignment should be driven by data or design tokens, not inline string maps |
| Group-icon inference by title substring matching | Fragile; category identity must come from live list metadata |
| Single `HbcLauncherSurface` as sole rendering delegate | Cannot express the 3-tier card hierarchy; may serve one tier but not all three |

## 5. Sequence Implication

The gap map confirms the following sequence priorities for the next phases:

### Phase 01 — Live list wiring and data adapter

This must come first because every other improvement (brand treatment, card hierarchy, search, support actions) depends on having real data flowing from the live `Tool Launcher Contents` list. Without the adapter, all downstream work would be built on the transitional local config seam.

Phase 01 must:
1. Wire the webpart to the live `Tool Launcher Contents` list on HBCentral
2. Read and normalize live list fields into a typed launcher data model
3. Validate actual field names returned by the SharePoint access method
4. Preserve the normalization pipeline pattern (validate, deduplicate, filter, sort, limit)
5. Keep the transitional local config as a development fallback until the adapter is proven

### Phase 02+ — UI composition rebuild

Only after the data adapter is proven should the UI composition change:
- Flagship card primitive and stage layout
- Workflow shelf cards
- Command band and search
- Utility rail
- All-platforms overlay
- Responsive breakpoint strategy

### Brand treatment dependency

Logo-led brand treatment depends on both:
- the live list adapter (to read logo asset references from list fields)
- the `@hbc/ui-kit` shared brand asset system (to resolve and render platform logos)

Both must be available before flagship card rendering can reach its target quality.

## Conclusion

Phase 01 must implement **live SharePoint list wiring and data adapter foundation** — specifically: a typed adapter targeting the `Tool Launcher Contents` list on HBCentral, a normalization layer mapping live fields to the launcher data model, and validation against actual returned field names. This is the critical-path prerequisite for every downstream improvement identified in this gap map.
