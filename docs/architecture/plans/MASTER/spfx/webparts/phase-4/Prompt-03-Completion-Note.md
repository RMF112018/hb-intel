# Prompt-03 Completion Note — Build, Inspect, and Tenant-Validate Full Package

## Status

Local package inspection: **pass** (all acceptance criteria met).
Tenant deployment and runtime validation: **requires manual operator action**.

---

## 1. Build results

| Step | Result |
|------|--------|
| Vite build (full `mount.tsx` dispatcher) | pass — 262.49 kB IIFE, all 10 components |
| Content hash | `ab43ba83` → `hb-webparts-app-ab43ba83.js` |
| Runtime smoke test | pass — `mount()` / `unmount()` on `globalThis` + `window` |
| gulp bundle --ship | pass — 1 shell module compiled |
| Manifest cloning | pass — 10 per-webpart manifests |
| AMD shim generation | pass — 10 shim files |
| gulp package-solution --ship | pass — `hb-webparts.sppkg` (100.5 KB) |
| AppManifest.xml Version | `1.0.0.22` (valid 4-part) |

## 2. Package inspection results

### .sppkg contents (35 files)

| Category | Count | Details |
|----------|-------|---------|
| WebPart XMLs | 10 | One per homepage webpart |
| Shim files (`shell-entry-*.js`) | 10 | One per webpart, 147 bytes each |
| Compiled shell loader | 1 | `shell-web-part_33c64341ed81ee506c2a.js` (3,128 bytes) |
| Vite bundle | 1 | `hb-webparts-app-ab43ba83.js` (262,488 bytes) |
| Neutral shell manifest | 0 | Correctly deleted after cloning |
| Package metadata | 13 | AppManifest, features, rels, content types |

## 3. Manifest / component inventory

| Webpart | Manifest ID | Shim file | entryModuleId |
|---------|-------------|-----------|---------------|
| CompanyPulse | `0b53f651-...` | `shell-entry-0b53f651-...-21e2e97c.js` | `0b53f651-..._1.0.0` |
| SmartSearchWayfinding | `11d72b36-...` | `shell-entry-11d72b36-...-a946d23e.js` | `11d72b36-..._1.0.0` |
| PeopleCulture | `27ac10f4-...` | `shell-entry-27ac10f4-...-6d60494d.js` | `27ac10f4-..._1.0.0` |
| **HbHeroBanner** | `39762a4d-...` | `shell-entry-39762a4d-...-5f9f31fc.js` | `39762a4d-..._1.0.0` |
| PersonalizedWelcomeHeader | `46bfde64-...` | `shell-entry-46bfde64-...-5d6cfd80.js` | `46bfde64-..._1.0.0` |
| ProjectPortfolioSpotlight | `8370ab0c-...` | `shell-entry-8370ab0c-...-7581fc3d.js` | `8370ab0c-..._1.0.0` |
| SafetyFieldExcellence | `89ca5ff3-...` | `shell-entry-89ca5ff3-...-b471be44.js` | `89ca5ff3-..._1.0.0` |
| **PriorityActionsRail** | `b3f07190-...` | `shell-entry-b3f07190-...-7a18a3b3.js` | `b3f07190-..._1.0.0` |
| ToolLauncherWorkHub | `cb7060f5-...` | `shell-entry-cb7060f5-...-c5f2c9de.js` | `cb7060f5-..._1.0.0` |
| LeadershipMessage | `e8fa8a84-...` | `shell-entry-e8fa8a84-...-e4c214c3.js` | `e8fa8a84-..._1.0.0` |

Both previously validated proof cases (bold) are present and have correct loader contracts.

## 4. Loader-contract assessment

**Architecture: neutral shell manifest + AMD shims (transitional, verified)**

Each webpart manifest's `scriptResources` contains:
1. Base module: `9a2f7f61-..._1.0.0` → `shell-web-part_33c64341ed81ee506c2a.js` (compiled shell)
2. Per-webpart shim: `{webpartId}_1.0.0` → `shell-entry-{webpartId}-{hash}.js` (AMD alias)

Shim content (verified):
```javascript
define("{webpartId}_1.0.0", ["9a2f7f61-..._1.0.0"], function(baseModule) { return baseModule; });
```

Loader chain per webpart:
```
SharePoint require("{webpartId}_1.0.0")
  → shim loads "9a2f7f61-..._1.0.0" → shell-web-part_{hash}.js
  → ShellWebPart.onInit() loads hb-webparts-app-ab43ba83.js
  → globalThis.__hbIntel_hbWebparts.mount(el, context, {webPartId})
  → mount.tsx dispatcher renders the correct React component
```

The neutral manifest (`9a2f7f61-...`) is **not** present as a webpart in the package — it was deleted after cloning. It exists only as a `scriptResources` key pointing to the compiled shell asset.

## 5. Regression assessment

| Check | Result |
|-------|--------|
| HbHeroBanner present in package | pass |
| PriorityActionsRail present in package | pass |
| All 10 webparts present | pass |
| Each `entryModuleId` = `{webpartId}_1.0.0` | pass |
| Each `scriptResources` includes both base module + shim | pass |
| Each shim file present in ClientSideAssets | pass |
| No `Could not load ... in require` pattern possible (shim → base chain complete) | pass |
| No missing `scriptResources` mapping | pass |
| No stale or orphaned manifest IDs | pass |
| Previously validated webparts not excluded | pass |

## 6. Manual tenant-validation checklist

### Deployment

1. Upload `dist/sppkg/hb-webparts.sppkg` to the App Catalog
2. Trust the app when prompted
3. Confirm App Catalog shows version `1.0.0.22`

### Toolbox verification

4. Edit a SharePoint page → Add webpart → search "HB Intel" group
5. Confirm all 10 webparts appear in the toolbox:
   - HB Hero Banner
   - Priority Actions Rail
   - Personalized Welcome Header
   - Tool Launcher Work Hub
   - Company Pulse
   - Leadership Message
   - People Culture
   - Project Portfolio Spotlight
   - Safety Field Excellence
   - Smart Search Wayfinding

### Regression checks (previously validated webparts)

6. Add HB Hero Banner → confirm renders (headline, message, card)
7. Add Priority Actions Rail → confirm renders (heading, action groups, badges)
8. Console filter on `39762a4d` and `b3f07190` → no `require` failure

### Newly restored webpart checks

9. Add each remaining webpart → confirm it renders without crash
10. Console filter on each webpart ID → no `Could not load ... in require`

### Network checks

11. Network tab: confirm `shell-web-part_33c64341ed81ee506c2a.js` loads (200 OK)
12. Network tab: confirm `hb-webparts-app-ab43ba83.js` loads (200 OK)
13. Network tab: confirm `shell-entry-{webpartId}-{hash}.js` loads for each active webpart (200 OK)

### Cache sanity

If tenant shows stale behavior:
- Unregister `spserviceworker.js` in DevTools → Application → Service Workers
- Hard refresh (Cmd+Shift+R)
- Confirm App Catalog version matches `1.0.0.22`

## 7. Go / No-Go

**Local package: GO** — 10 manifests, 10 shims, correct loader contracts, both validated proof cases retained, all remaining webparts restored, no structural regressions.

**Tenant runtime: awaiting manual validation.**
