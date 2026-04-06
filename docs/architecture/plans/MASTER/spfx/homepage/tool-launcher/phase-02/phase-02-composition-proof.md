# Phase 02 — Composition Proof

## 1. Workflow Shelf Structure

### How shelves were scaffolded

`LauncherWorkflowShelves.tsx` — a dedicated component accepting `shelves: LauncherWorkflowShelf[]` from the presentation model.

**Per-shelf rendering:**
- Uppercase category heading (0.78rem, weight 600, letter-spacing 0.04em) with subtle bottom border
- `HbcLauncherSurface` tile grid rendering the shelf's platforms as compact icon-led tiles
- `data-launcher-shelf` attribute for testability

**Shelf ordering:** Preserved from the normalization layer — alphabetical by shelf name.

**Suppression:**
- Individual shelves with zero platforms are not rendered (normalization layer handles this)
- Component returns `null` when the shelves array is empty
- The composition shell's workflow-shelves region is suppressed when children are null

**Visual weight:** Shelves use the existing `HbcLauncherSurface` tile grid with `140px` min-width tiles — materially smaller and less prominent than the flagship stage's `240px` min-width cards with 56px logo containers.

### Icon resolution consolidation

`launcherIconResolution.ts` — a shared helper consolidating the icon maps and resolution functions previously duplicated across `ToolLauncherWorkHub.tsx`, `LauncherFlagshipStage.tsx`, and the inline shelf renderer:
- `PLATFORM_FALLBACK_ICON` — 9 platform-specific icons from asset manifest
- `TOOL_ICON_MAP` / `TOOL_TINT_MAP` — category-based icon and tint resolution
- `resolveToolIcon()`, `resolveToolTint()`, `resolveGroupIcon()`, `resolvePlatformIcon()`, `platformToTile()`

All launcher composition components now import from this single source.

## 2. Utility-Zone Fit Assessment

### Homepage sequence (top to bottom)

| Zone | Surface | Visual weight |
|------|---------|---------------|
| Zone 1 | **Signature Hero** — full-width branded hero with greeting | **Dominant** — largest, most visually impactful |
| Zone 2 | **Priority Actions Rail** — urgency-aware command surface | **Secondary** — dense, compact, action-oriented |
| Zone 2 | **Tool Launcher / Work Hub** — premium marketplace launcher | **Secondary** — structured but clearly subordinate to hero |
| Zone 3 | **Smart Search & Wayfinding** — discovery surface | **Tertiary** — informational |
| Zone 4 | **Communications** — editorial modules | **Tertiary** — editorial warmth |
| Zone 5 | **Operational** — intelligence modules | **Tertiary** — dashboard-adjacent |

### How the launcher fits

The launcher's outer container (subtle border, card-radius corners, semi-transparent white background, 16px padding) makes it read as a self-contained product surface within the Utility zone — not as loose components on a shared background.

The 4-region internal structure creates intentional hierarchy:
1. **Command band** — compact identity bar (44px min-height) that does not compete with the Signature Hero above
2. **Flagship stage** — prominent but not hero-scale cards (240px min-width vs hero's full-width)
3. **Utility rail** — quiet informational sections that collapse when empty
4. **Workflow shelves** — compact tile grids that are clearly secondary to the flagship stage

### What is NOT happening

- No faux shell chrome (no nav bars, sidebars, footers)
- No reversion to equal-weight grouped-card utility box
- No visual competition with the Signature Hero
- No app-shell mimicry
- The command band's search is a read-only placeholder, not a competing navigation surface

## 3. Remaining Visual Debt

| Debt | Phase | Description |
|------|-------|-------------|
| Real brand logo assets in flagship cards | Phase 03 | `logoAssetRef` slot exists but no real vendor logos are loaded yet |
| Flagship card hover/tap motion | Phase 03 | Cards have `transition` CSS but no `motion.div` spring animations |
| Dark logo variant support | Phase 03 | `darkLogoAssetRef` field is normalized but not consumed |
| Search behavior in command band | Phase 08 | Input is read-only with `tabIndex={-1}` |
| All Platforms overlay | Phase 06 | Button exists but has no handler |
| Favorites section in utility rail | Phase 04 | Not yet implemented |
| Recently-used section in utility rail | Phase 04 | Not yet implemented |
| Responsive breakpoints (tablet, mobile) | Phase 07 | Desktop-only layout; no media queries or responsive adaptation |
| Audience-aware filtering at component level | Future | Normalized but not yet filtered in rendering |
| Platform notice rendering in flagship cards | Complete (skeleton) | Tone-colored badge with label; detail expansion deferred |

## 4. Risks to Watch

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Flagship stage regressing to equal-weight tiles** | High | The flagship cards (240px, 56px logo container, descriptor, CTA row) are structurally different from shelf tiles (140px, icon-only). Changing the grid min-width or removing the card structure would collapse the hierarchy. |
| **Utility rail overgrowing** | Medium | The rail currently has 3 sections (notices, help, access) capped at 5 items each. Adding more sections without visual discipline could make the rail compete with the flagship stage. |
| **Command band becoming a second navigation** | Medium | The band has only 2 buttons and a read-only search. Adding dropdown menus, breadcrumbs, or navigation links would create faux shell chrome. |
| **Icon resolution drift** | Low | Consolidation in `launcherIconResolution.ts` prevents drift. If a new component bypasses this helper, icons will diverge. |
| **Bundle size growth** | Low | Phase 02 total: 492 KB (up from 475 KB at Phase 01 start). Growth is proportional to new components. Monitoring continues. |

## 5. Recommended Next Phase Handoff

### Phase 03 — Flagship Card Primitive and Stage Contract

Phase 03 should pick up the flagship stage from here and:

1. **Implement real logo rendering** — wire `logoAssetRef` and `darkLogoAssetRef` through the `@hbc/ui-kit` brand asset system. The 56px logo container in `LauncherFlagshipStage` is ready to receive `<img>` elements; the fallback icon chain is already in place.

2. **Add premium interaction** — replace the CSS `transition` on flagship cards with `motion.div` from the premium stack for hover lift, tap scale, and shadow transitions. Gate all motion with `prefers-reduced-motion`.

3. **Define the flagship card as a reusable primitive** — if the card structure proves stable, extract it into a `LauncherFlagshipCard` component. Evaluate whether it belongs local to the webpart or should be promoted to `@hbc/ui-kit`.

4. **Refine notice badge placement** — the current badge is inline in the CTA row. Phase 03 should evaluate whether badges should be corner-positioned, tooltip-capable, or status-icon-enhanced.

5. **Preserve the composition shell** — Phase 03 should deepen the flagship stage and card primitive without replacing the `LauncherCompositionShell`, `LauncherCommandBand`, `LauncherUtilityRail`, or `LauncherWorkflowShelves` structures. All 4 regions are proven and stable.
