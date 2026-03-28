# Phase 3 Project Hub Canvas Wiring — Implementation Report

**Date:** 2026-03-28
**Version:** @hbc/pwa 0.13.16
**Scope:** Wire the live Project Hub home to `@hbc/project-canvas` as the governing runtime, resolved through the profile system.

## 1. What Changed

The Project Hub control center's default view no longer renders static summary cards. It now resolves a profile via `resolveProjectHubProfile()` and renders `HbcProjectCanvas` for all canvas-capable profiles (`hybrid-operating-layer`, `canvas-first-operating-layer`, `next-move-hub`).

### Before

```
ProjectHubControlCenterPage
  → resolveProjectHubLayoutFamily({ role: 'project-manager', ... })  // hardcoded
  → ProjectOperatingSurface
    → canvasSlot: 4 static Card components + "Open Reports Baseline" button
```

### After

```
ProjectHubControlCenterPage
  → useAuthStore → resolveProfileRole() → resolveDeviceClass()
  → resolveProjectHubProfile({ role, deviceClass })
  → profileId selects rendering path:
    → 'hybrid-operating-layer' | 'canvas-first-operating-layer' | 'next-move-hub'
      → ProjectOperatingSurface
        → canvasSlot: <HbcProjectCanvas projectId userId role editable />
    → 'executive-cockpit'
      → ExecutiveCockpitSurface
    → 'field-tablet-split-pane'
      → FieldTabletSurface
```

## 2. Files Changed

| File | Change |
|------|--------|
| `apps/pwa/src/pages/ProjectHubPage.tsx` | Replaced static card canvas slot with `HbcProjectCanvas`; replaced hardcoded `resolveProjectHubLayoutFamily()` with `resolveProjectHubProfile()`; added `resolveProfileRole()` mapper and `resolveDeviceClass()` helper; added auth store selectors for userId and resolvedRoles; imported and called `registerReferenceTiles()` at module level; removed unused `canvasCardGrid`/`reportsButton` styles; title now reflects profile ID |
| `apps/pwa/src/pages/ProjectHubPage.test.tsx` | Updated control center test to verify `HbcProjectCanvas` renders (via `data-testid="hbc-project-canvas"`) instead of asserting "Open Reports Baseline" button |
| `apps/pwa/package.json` | Version bump 0.13.15 → 0.13.16 |

## 3. How Profile Resolution Works

1. **Auth context:** `useAuthStore` provides `currentUser.id` and `session.resolvedRoles`
2. **Role mapping:** `resolveProfileRole(resolvedRoles)` maps auth roles to `ProjectHubProfileRole` via priority-ordered regex matching (portfolio-exec → leadership → safety → qa/qc → field-eng → superintendent → project-exec → project-manager fallback)
3. **Device detection:** `resolveDeviceClass()` maps `window.innerWidth` to `desktop` (≥1024) / `tablet` (768–1023) / `narrow` (<768)
4. **Profile resolution:** `resolveProjectHubProfile({ role, deviceClass })` returns `profileId` + `layoutFamily` per the governed policy matrix
5. **Rendering:** `layoutFamily` determines which surface renders; for `project-operating` family, `HbcProjectCanvas` is the canvas slot

## 4. Where @hbc/project-canvas Governs

- **Tile registry:** `registerReferenceTiles()` registers 14 reference tiles (including 3 Phase 3 real implementations: `project-work-queue`, `project-activity`, `related-items`)
- **Role defaults:** `HbcProjectCanvas` uses `useRoleDefaultCanvas(role)` internally to resolve initial tile placement by role
- **Mandatory enforcement:** `useCanvasMandatoryTiles()` prevents users from removing mandatory tiles
- **Lock enforcement:** `useCanvasEditor()` blocks remove/move on locked tiles
- **Persistence:** `useCanvasConfig()` with `ICanvasPersistenceAdapter` (defaults to in-memory in dev, `CanvasApi` in production)
- **iOS homescreen editing:** Edit button toggles jiggle mode, drag-to-reorder, tile catalog

## 5. Mandatory Operational Surfaces by Profile

| Profile | Mandatory Tiles (from canvas) | Mandatory Regions (from profile) |
|---------|------------------------------|----------------------------------|
| hybrid-operating-layer | bic-my-items, project-health-pulse, pending-approvals, related-items, project-work-queue, project-activity | header, center, left |
| canvas-first-operating-layer | Same tile set | header, center |
| next-move-hub | Same tile set | header, center, right |
| executive-cockpit | N/A (uses ExecutiveCockpitSurface) | header, center, left, right |
| field-tablet-split-pane | N/A (uses FieldTabletSurface) | header, left, center, bottom |

## 6. Upgrade Notes

- The `resolveProjectHubLayoutFamily()` function from `@hbc/features-project-hub` is no longer used by `ProjectHubPage.tsx`. It remains available in the package for consumers that need the layout-family layer without the profile layer.
- The `onOpenReports` prop on `ProjectHubControlCenterPageProps` is preserved for API compatibility but is no longer rendered in the default canvas view. Reports access is now via the `/project-hub/:projectId/reports` section route.
- The `cards` array (project status/number/dates) has been removed. This information is now available through canvas tiles (`project-health-pulse`) rather than static cards.

## 7. Verification

- **Tests:** 162/162 pass (12 test files), zero regressions
- **Lint:** 0 errors in `ProjectHubPage.tsx`, 1 warning (D-09 `window.innerWidth` — intentional for profile resolver), 1 warning (`_onOpenReports` prefixed unused)
- **Canvas renders:** Verified via `data-testid="hbc-project-canvas"` in component test
