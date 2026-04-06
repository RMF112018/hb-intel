# Phase 00 — Surface Reset Memo and Locked Target Contract

## 1. Locked Role of the Webpart

The Tool Launcher / Work Hub is the **premium internal app marketplace** on the HB Central SharePoint homepage. It occupies the Utility zone (Zone 2) in the homepage composition model and serves as the primary gateway to third-party platforms and internal work systems.

It is **not** a generic quick-links surface, a grouped list of text links, an equal-weight icon grid, a utility card, or a dashboard box of small launch tiles. It must feel like a curated, high-end platform gateway — organized by real work patterns, brand-aware, and clearly superior to a standard grouped tile launcher.

Within the homepage zone hierarchy, the launcher is a command surface — dense, efficient, and operationally grounded — but with premium visual hierarchy that distinguishes flagship platforms from supporting systems.

## 2. Locked Composition Model

The target composition uses a **3-zone launcher architecture** with a **3-tier card hierarchy**:

### Command Band (top)

| Region | Content |
|--------|---------|
| Left | Webpart title ("Work Hub" or "Platform Gateway") + optional supporting line |
| Center | Smart search / command entry — searches platform names, aliases, keywords, workflows, and support terms |
| Right | Utility controls: All Platforms, Favorites, Need Help, Request Access |

The command band makes the launcher feel like a product, not a card.

### Primary Platforms Stage (main body)

Uses an **8/4 desktop split**:

- **8-column flagship stage** — 5–6 large, brand-led launch cards for the most important daily-use platforms (BambooHR, Procore, ADP, hh2, Cornerstone, and similar). Each card includes: official platform logo, platform name, one-line purpose statement, launch CTA, optional audience/role tag, and optional status/notice badge.
- **4-column utility rail** — favorites, recently used, help/access-request links, and platform notices (outages, maintenance, temporary alerts). The rail is useful and polished but clearly secondary to the flagship stage.

### Workflow Shelves (below stage)

Organize remaining platforms by actual work patterns:

- People & Payroll
- Field & Operations
- Training & Compliance
- Finance & Admin

Each shelf renders **medium workflow cards** with: logo, name, short descriptor, and optional category/audience tag. Shelves feel like curated workflow entry points, not generic grouped lists.

### All-Platforms Layer (overlay/drawer)

A searchable platform index accessed from the command band. Contains: logo + name + short descriptor + optional role tag + quick launch action. Alphabetic or category grouping. Keeps the homepage clean while supporting a larger platform inventory.

### 3-Tier Card Hierarchy

| Tier | Use | Visual weight |
|------|-----|---------------|
| Flagship launch card | Top daily-use platforms in the primary stage | Large, logo-led, with CTA and status badge |
| Workflow shelf card | Supporting systems in category shelves | Medium, compact, whole-card click target |
| Index row | All-platforms searchable directory | List-format, information-dense |

This hierarchy is binding. Every platform must not render at equal weight.

## 3. Locked Content-Source Principle

The **SharePoint list `Tool Launcher Contents` on HBCentral** is the content source of truth. The list already exists, the schema is set, and it is seeded with platform records.

The **architecture brief** (`Tool_Launcher_Work_Hub_Webpart_Architecture_and_Layout.md`) remains the UI composition and hierarchy source.

The webpart must not collapse live list data into a flat grouped-tile renderer. The data source feeds the composition model; the composition model defines the visual hierarchy.

## 4. Locked Data-Seam Principle

The current grouped-config seam is **transitional**. It exists for development convenience and must not remain the long-term contract.

The production data path is:

```
SharePoint list (Tool Launcher Contents)
  → typed adapter (reads and normalizes live fields)
    → launcher data model (platform records with full field contract)
      → composition layer (maps records to flagship / workflow / index tiers)
        → rendering primitives (3-tier card hierarchy)
```

The transitional local config may remain as a development fallback until the live adapter is proven, but it must not be treated as the target architecture and must not receive further investment in polishing or extending its shape.

## 5. Locked Shared-vs-Local Boundary

### Stays local to `apps/hb-webparts`

| Concern | Reason |
|---------|--------|
| Tool Launcher component composition | Homepage-specific composition logic |
| Normalization pipeline (validate, deduplicate, filter, sort, limit) | Homepage-specific data processing |
| Audience visibility filtering | Homepage utility pattern, already shared across utility webparts |
| Authoring governance registry entry | Homepage-specific authoring policy |
| Empty, loading, and error state rendering | Homepage-specific state management |
| Command band, flagship stage, workflow shelves layout | Homepage-specific composition |
| Local mapping from launcher data model to card tier shapes | Homepage-specific rendering logic |

### Stays in `@hbc/ui-kit`

| Concern | Reason |
|---------|--------|
| `HbcLauncherSurface` (or evolved successors) | Reusable rendering primitive |
| Shared brand assets (platform logos, HB marks) | Reusable brand system via `@hbc/ui-kit` branding lane |
| Card primitives if they prove reusable beyond the launcher | Only promote when reuse is real, not speculative |
| Motion, icon, and variant system re-exports | Already governed by `@hbc/ui-kit/homepage` barrel |

### Promotion criteria

A local launcher element may be promoted to `@hbc/ui-kit` only when:
- a second consumer exists or is imminent,
- the element is stable enough to be a shared contract,
- promotion is reviewed against the package relationship map.

Do not promote speculatively. Do not duplicate into `@hbc/ui-kit` what can stay local.

## 6. Locked Exclusions

The next phases must **not**:

| Exclusion | Reason |
|-----------|--------|
| Re-open schema ideation for the platform registry | The `Tool Launcher Contents` list schema is set and seeded. Schema design is complete. |
| Polish or extend the local grouped-config contract | The local config is transitional. Investment should go toward the live adapter. |
| Build the all-platforms overlay before the data adapter is proven | The overlay depends on live list data flowing correctly. |
| Build search/command behavior before the data adapter is proven | Search operates over live list fields (names, aliases, keywords). |
| Create new reusable UI primitives outside `@hbc/ui-kit` | Per architectural invariant, reusable visual UI belongs in the kit. |
| Import from `@hbc/ui-kit` root or `@hbc/ui-kit/app-shell` | Homepage import discipline requires `@hbc/ui-kit/homepage` as the primary entry point. |
| Use Unicode glyphs, text initials, or placeholder icons for major platforms | The premium icon system and platform logos are required. Pseudo-icons are prohibited. |
| Redesign unrelated homepage webparts | Scope stays on the Tool Launcher surface. |
| Sacrifice authoring safety for visual ambition | The webpart must function correctly when minimally or partially configured. |
| Skip accessibility validation | WCAG 2.1 AA minimum, visible keyboard focus, `prefers-reduced-motion` support are required. |

## 7. Next-Phase Handoff

### Phase 01 objective

**Live SharePoint list wiring and data adapter foundation**

Phase 01 must:

1. **Wire the webpart to the live `Tool Launcher Contents` list on HBCentral** — establish the SharePoint access method and validate actual returned field names against the expected schema.

2. **Build a typed normalization layer** — map live list fields into a stable launcher data model covering: platform name, platform key, launch URL, logo references (official + dark + preferred type), short descriptor, workflow shelf, category, featured flag, featured sort order, sort order, audience visibility, audience rules JSON, aliases/keywords, help link, support owner, access request destination, notice fields (status, badge text, details, expires on), is-active flag, open-in-new-tab, favorite-eligible, status badge tone, vendor/product family, tenant/environment label, review fields, and notes.

3. **Preserve the normalization pipeline pattern** — validate, deduplicate, audience-filter, sort, and limit, adapted for the live list data model.

4. **Prove featured-stage ordering from live data** — demonstrate that the `Featured` flag and `Featured Sort Order` fields drive the flagship stage content.

5. **Prove shelf grouping from live data** — demonstrate that the `Workflow Shelf` field drives workflow shelf assignment.

6. **Keep the transitional local config as a development fallback** — do not remove it until the live adapter is proven and stable.

7. **Extend authoring governance** — add live-data states (stale content detection, partial-data resilience, live-field validation errors) to the existing authoring governance pattern.

### Phase 01 success criteria

The data adapter is considered proven when:
- live list records render in the webpart without local config fallback,
- featured platforms appear in the correct stage position,
- shelf grouping matches the `Workflow Shelf` field values,
- missing or malformed fields degrade gracefully with professional empty/error states,
- the adapter passes typecheck, lint, and build verification.
