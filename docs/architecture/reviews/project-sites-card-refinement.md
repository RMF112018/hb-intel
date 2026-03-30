# Project Sites — Card Visual Refinement

> **Date**: 2026-03-30
> **Scope**: Targeted UI refinement — background removal, full-height cards, HBC color, state differentiation

---

## 1. Changes Made

### A. Removed app-owned white background

Removed `backgroundColor: HBC_SURFACE_LIGHT['surface-1']` from the `emptyContainer` style in `ProjectSitesRoot.tsx`. The root already had no background. This allows the Project Sites surface to integrate with the SharePoint section background rather than sitting inside a separate white slab.

### B. Full-height cards

**HbcCard enhancement** (`packages/ui-kit/src/HbcCard/index.tsx`): Added `display: 'flex'` and `flexDirection: 'column'` to the card root, and `flexGrow: 1` to the body section. This makes the body expand to fill available space when the card is inside a height-constrained parent. Non-breaking — cards without height constraints render identically.

**Grid items** (`ProjectSitesRoot.tsx`): Added `display: 'flex'` to `gridItem` class so CSS grid's implicit `align-items: stretch` flows through to the card wrapper.

**Card wrapper** (`ProjectSiteCard.tsx`): Changed from `display: 'block'` to `display: 'flex'` with `height: '100%'`. HbcCard receives `className={classes.cardFull}` (`width: '100%'`) to fill the flex container. The result: every card in a grid row stretches to the same height, with footer pinned to the bottom.

### C. Restrained HBC blue and orange

| Element | Token | Purpose |
|---------|-------|---------|
| Active card top accent | `HBC_PRIMARY_BLUE` (3px solid top border) | Signals "this site is live and active" |
| Provisioning card top accent | `HBC_ACCENT_ORANGE` (3px solid top border) | Signals "this site is being set up" |
| Provisioning dot | `HBC_ACCENT_ORANGE` (was muted gray) | Reinforces the in-progress signal |
| Provisioning label text | `HBC_ACCENT_ORANGE` (was muted gray) | Consistent with dot color |
| Project number chip | `HBC_PRIMARY_BLUE` text + `hbcBrandRamp[150]` bg | Unchanged — already correct |
| Open Site action | `HBC_BRAND_ACTION` | Unchanged — already correct |

### D. State differentiation

Three card states via `resolveCardState()` helper:

| State | Condition | Top accent | Shadow | Opacity | Border | Hover |
|-------|-----------|-----------|--------|---------|--------|-------|
| **Active** | `hasSiteUrl` + stage is "active" or "pursuit" | 3px `HBC_PRIMARY_BLUE` | `elevationLevel1` | 1.0 | none | lift -2px + `elevationLevel2` |
| **Archived** | `hasSiteUrl` + other stages | 3px `surface-3` (muted) | `elevationLevel0` | 0.8 | none | subtle lift -1px + `elevationLevel1` |
| **Provisioning** | `!hasSiteUrl` | 3px `HBC_ACCENT_ORANGE` | none | 0.75 | dashed `surface-3` sides/bottom | none (cursor: default) |

Each state is immediately distinguishable at a glance:
- Active cards are prominent (blue accent, full shadow)
- Archived cards recede (gray accent, flat, slightly faded)
- Provisioning cards read as in-progress (orange accent, dashed border, pulsing dot)

## 2. ui-kit Enhancement

`HbcCard` (`packages/ui-kit/src/HbcCard/index.tsx`) — added flex-column layout to root + flex-grow on body. This is a non-breaking enhancement that enables full-height card behavior when parents set height constraints. All existing consumers render identically.

## 3. Files Changed

| File | Change |
|------|--------|
| `packages/ui-kit/src/HbcCard/index.tsx` | Added flex layout for full-height support |
| `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx` | Removed white bg, added flex to grid items |
| `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx` | State differentiation, accent bars, HBC color, full-height |
| `apps/project-sites/package.json` | Version bump 0.0.7 → 0.0.8 |

## 4. Verification

| Check | Result |
|-------|--------|
| ui-kit check-types | Pass |
| ui-kit build | Pass |
| spfx check-types | Pass |
| spfx lint | Pass (0 errors) |
| spfx tests (projectSites) | 62/62 pass (6 files) |
| project-sites build | Pass (482.42 KB, gzip 141.43 KB) |
