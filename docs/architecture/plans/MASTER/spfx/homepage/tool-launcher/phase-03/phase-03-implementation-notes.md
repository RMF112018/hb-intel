# Phase 03 — Implementation Notes

## 1. Composition Proof Summary

### What was proven in the Utility zone composition

The Tool Launcher / Work Hub now renders a 4-region premium marketplace layout when live SharePoint list data is available:

| Region | Component | Proven behavior |
|--------|-----------|----------------|
| **Command band** | `LauncherCommandBand` | Renders "Work Hub" title, platform/featured count in supporting line, search placeholder, and disabled utility action buttons. 3-column grid layout with `role="toolbar"`. |
| **Flagship stage** | `LauncherFlagshipStage` → `LauncherFlagshipCard` | Featured platforms render at primary visual weight with 56px logo containers, name, descriptor, "Launch" CTA, optional notice badge, and spring-based motion (hover 1.015 scale, tap 0.985, gated by `prefers-reduced-motion`). Cards use 5-step logo resolution from `launcherAssetResolution.ts` with `onError` recovery. |
| **Utility rail** | `LauncherUtilityRail` | Three independently suppressible sections (notices, help, access request). Entire rail suppresses when empty, collapsing body grid from 2fr/1fr to 1fr. |
| **Workflow shelves** | `LauncherWorkflowShelves` | Secondary platform groupings by `workflowShelf` field with uppercase category headings and `HbcLauncherSurface` tile grids. Suppresses when empty. |

### Hierarchy validation

- **Flagship stage is clearly primary** — 240px min-width cards with 56px logo containers, descriptor, and explicit CTA are structurally distinct from workflow shelf tiles (140px, icon-only, no CTA row)
- **Utility rail is visually secondary** — quiet card sections with muted headings, capped at 5 items per section
- **Launcher is subordinate to Signature Hero** — outer container uses subtle border, card-radius, and semi-transparent white background; command band is 44px compact bar, not a hero-scale surface
- **No faux shell chrome** — command band has no navigation, breadcrumbs, or sidebar behavior

### Audience-aware filtering

`deriveToolLauncherPresentation()` now accepts `activeAudience` and filters platforms before all derivation steps. Platforms with no audience restrictions remain visible to all audiences.

### Config fallback

When running without SPFx context (local dev, demo, packaging), the component falls back to the flat `HbcLauncherSurface` bridge using the manifest `preconfiguredEntries`. The reference composition documents this dual-path behavior.

## 2. Remaining Debt

### Utility rail support actions (Phase 04)
- Favorites section not yet implemented
- Recently-used tracking not yet implemented
- Help link navigation is static (no interactive behavior beyond anchor)
- Access request navigation is static

### Workflow shelf refinement (Phase 05)
- Shelves use existing `HbcLauncherSurface` tile grid — no premium card treatment yet
- No shelf-level search or filtering
- No "show more" / "show less" for large shelves

### All-platforms overlay (Phase 06)
- "All Platforms" command band button is disabled (no handler)
- No overlay/drawer implementation
- No searchable full-platform index

### Advanced search / personalization (Phase 08+)
- Command band search input is read-only with `tabIndex={-1}`
- No platform name/alias/keyword matching
- No audience context wired from SPFx user profile

### Asset deployment
- Manifest logo paths (`/assets/tool-launcher/vendors/...`) reference files not yet deployed to HBCentral
- All flagship cards currently fall through to Lucide icon fallback
- `@hbc/ui-kit` brand asset system integration deferred

### Other deferred items
- Responsive breakpoints (Phase 07) — desktop-only layout
- Dark logo variant rendering — `preferDark` parameter exists but unused
- Flagship card focus styling — browser default, no custom brand-blue treatment
- Bundle size: 496 KB (up from 475 KB at Phase 01 start)

## 3. Risks Observed

| Risk | Severity | Impact on Phase 04+ |
|------|----------|---------------------|
| **Logo assets not yet deployed** | Medium | All flagship cards render with Lucide fallback icons until SVG logos are deployed to HBCentral. The launcher looks functional but not yet premium. |
| **Audience context not wired from SPFx** | Medium | `activeAudience` is passed from component props but the mount dispatcher doesn't extract audience from SharePoint user profile. All platforms are visible. |
| **Icon resolution duplication** | Low | `launcherIconResolution.ts` consolidates maps, but `launcherAssetResolution.ts` has its own inline manifest data. The two files share the icon fallback chain without duplicating maps. |
| **Utility rail may grow too many sections** | Medium | Adding favorites, recents, and additional support sections in Phase 04 could make the rail compete with the flagship stage. Section count and visual weight need monitoring. |
| **Config fallback divergence** | Low | The local config fallback still uses the flat `HbcLauncherSurface` bridge, which renders a fundamentally different layout than the live-data 4-region shell. The two paths will diverge further as later phases deepen the live-data rendering. |

## 4. Recommended Next Phase Entry Conditions

Before beginning **Phase 04 (Utility Rail Contract and Support Model)**, the following should be true:

1. **Phase 03 validation checklist is complete** (23/23 items checked)
2. **`apps/hb-webparts` builds cleanly** — typecheck, lint, and build all pass
3. **The flagship stage is rendering from normalized live data** — the composition shell, command band, flagship card primitive, asset resolution, and audience filtering are all in place
4. **The utility rail skeleton exists** with three sections (notices, help, access) that suppress independently
5. **The composition shell's body grid collapses correctly** when the rail is empty (2fr/1fr → 1fr)
6. **Remaining debt is documented** — no hidden assumptions about what Phase 03 delivered

### Phase 04 should focus on:
- Deepening the utility rail with favorites and recently-used sections
- Defining the support model for help links and access-request navigation
- Preserving the flagship stage's primary visual weight while enriching the secondary rail
