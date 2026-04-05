# Prompt-03 Completion Note — Build, Inspect, and Tenant-Validate PriorityActionsRail

## Status

Local package inspection: **pass** (all acceptance criteria met).
Tenant deployment and runtime validation: **requires manual operator action**.

---

## 1. Build result

| Step | Result |
|------|--------|
| Vite build (proof-case entry) | pass — 227.38 kB IIFE, `__hbIntel_hbWebparts` global |
| Content hash | `a7ad4e75` → `hb-webparts-app-a7ad4e75.js` |
| Runtime smoke test | pass — `mount()` and `unmount()` present on `globalThis` + `window` |
| gulp bundle --ship | pass — 1 manifest compiled |
| gulp package-solution --ship | pass — `hb-webparts.sppkg` (77.1 KB) |
| Shim proof | 0 emitted shims, 0 packaged shims |

## 2. Package inspection result

### A. Manifest identity

| Field | Expected | Actual | Status |
|-------|----------|--------|--------|
| `id` | `b3f07190-79cf-437d-a1d6-ecbf3f77e616` | `b3f07190-79cf-437d-a1d6-ecbf3f77e616` | pass |
| `alias` | `PriorityActionsRailWebPart` | `PriorityActionsRailWebPart` | pass |

### B. Loader contract

| Field | Expected | Actual | Status |
|-------|----------|--------|--------|
| `entryModuleId` | `b3f07190-..._1.0.0` (no shim) | `b3f07190-79cf-437d-a1d6-ecbf3f77e616_1.0.0` | pass |
| `scriptResources[entryModuleId]` | direct path | `{ type: "path", path: "shell-web-part_062094b2773cd97b0b32.js" }` | pass |
| Shim mappings | none | none | pass |

### C. Package structure

| Check | Status |
|-------|--------|
| No neutral shell manifest | pass |
| No `shell-entry-*` files | pass |
| Proof-case Vite bundle present (`hb-webparts-app-a7ad4e75.js`) | pass |
| Compiled shell loader present (`shell-web-part_062094b2773cd97b0b32.js`) | pass |
| AppManifest.xml Version | `1.0.0.18` (valid 4-part) |

### D. Bundle isolation

Confirmed: Vite built from `src/mount-priority-actions-rail-proof-case.tsx` (227.38 KB vs 262.49 KB full bundle). The proof-case entry imports only `PriorityActionsRail`.

## 3. Loader chain

```
1. SharePoint resolves webpart ID b3f07190-79cf-437d-a1d6-ecbf3f77e616
2. Reads loaderConfig.entryModuleId = "b3f07190-79cf-437d-a1d6-ecbf3f77e616_1.0.0"
3. Finds scriptResources["b3f07190-..._1.0.0"] → shell-web-part_062094b2773cd97b0b32.js
4. Loads shell-web-part → ShellWebPart.onInit()
5. ShellWebPart loads hb-webparts-app-a7ad4e75.js via SPComponentLoader
6. Resolves globalThis.__hbIntel_hbWebparts.mount(el, context, config)
7. Renders PriorityActionsRail directly (proof-case entry, no dispatcher)
```

## 4. Manual tenant-deployment steps

1. Navigate to the App Catalog site → Apps for SharePoint
2. Upload `dist/sppkg/hb-webparts.sppkg` (overwrite existing)
3. Trust the app when prompted
4. Navigate to a page and add "Priority Actions Rail" from the webpart toolbox under "HB Intel"

## 5. Runtime evidence to collect

| Check | Expected |
|-------|----------|
| Page render | PriorityActionsRail renders (heading, action groups, badges) |
| Console: `Could not load b3f07190-..._1.0.0 in require` | **absent** |
| Console: technical-details crash screen | **absent** |
| Network: `shell-web-part_062094b2773cd97b0b32.js` | 200 OK |
| Network: `hb-webparts-app-a7ad4e75.js` | 200 OK |
| Network: `shell-entry-*.js` requests | **none** |

### Cache sanity check

If tenant shows stale behavior:
- Unregister `spserviceworker.js` in DevTools → Application → Service Workers
- Hard refresh (Cmd+Shift+R)
- Confirm App Catalog version = `1.0.0.18`
- Confirm CDN is not serving older shell asset

## 6. Go / No-Go

**Local package: GO** — structurally correct, ready for tenant deployment.
**Tenant runtime: awaiting manual validation.**
