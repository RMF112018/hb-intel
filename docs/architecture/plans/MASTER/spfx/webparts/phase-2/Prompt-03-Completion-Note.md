# Prompt-03 Completion Note — Build, Package, and Tenant-Validate

## Status

Local package inspection: **pass** (all acceptance criteria met).
Tenant deployment and runtime validation: **requires manual operator action** (see Section B–D below).

---

## A. Build result

| Step | Result |
|------|--------|
| Vite build (proof-case entry) | pass — 192.85 kB IIFE, `__hbIntel_hbWebparts` global |
| Content hash | `e2f7ec9c` → `hb-webparts-app-e2f7ec9c.js` |
| Runtime smoke test | pass — `mount()` and `unmount()` present on `globalThis` + `window` |
| gulp bundle --ship | pass — 1 manifest compiled |
| gulp package-solution --ship | pass — `hb-webparts.sppkg` (67.6 KB) |
| Shim proof | 0 emitted shims, 0 packaged shims |

## B. Package inspection result

### Manifest verification

| Field | Expected | Actual | Status |
|-------|----------|--------|--------|
| `id` | `39762a4d-c7fd-44a6-a11e-4f8de9f5778d` | `39762a4d-c7fd-44a6-a11e-4f8de9f5778d` | pass |
| `alias` | `HbHeroBannerWebPart` | `HbHeroBannerWebPart` | pass |
| `entryModuleId` | `39762a4d-..._1.0.0` (no shim alias) | `39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0` | pass |
| `scriptResources[entryModuleId]` | direct path, no shim | `{ type: "path", path: "shell-web-part_8324e4b9e8d300cdb032.js" }` | pass |
| Shim files in package | none | none | pass |
| Neutral shell manifest (`9a2f7f61-...`) | absent | absent | pass |

### .sppkg contents (16 files)

```
AppManifest.xml
[Content_Types].xml
_rels/AppManifest.xml.rels
_rels/.rels
feature_1f447e99-a2c7-43e5-83d8-d2ed78ed1a96.xml
feature_1f447e99-a2c7-43e5-83d8-d2ed78ed1a96.xml.config.xml
_rels/feature_1f447e99-a2c7-43e5-83d8-d2ed78ed1a96.xml.rels
1f447e99-a2c7-43e5-83d8-d2ed78ed1a96/WebPart_39762a4d-c7fd-44a6-a11e-4f8de9f5778d.xml
ClientSideAssets.xml
ClientSideAssets.xml.config.xml
_rels/ClientSideAssets.xml.rels
ClientSideAssets/hb-webparts-app-e2f7ec9c.js    (192,848 bytes — proof-case Vite bundle)
ClientSideAssets/shell-web-part_8324e4b9e8d300cdb032.js  (3,128 bytes — compiled shell loader)
```

### Loader chain (what SharePoint will execute)

```
1. SharePoint resolves webpart ID 39762a4d-c7fd-44a6-a11e-4f8de9f5778d
2. Reads loaderConfig.entryModuleId = "39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0"
3. Finds scriptResources["39762a4d-..._1.0.0"] → shell-web-part_8324e4b9e8d300cdb032.js
4. Loads shell-web-part → ShellWebPart.onInit()
5. ShellWebPart loads hb-webparts-app-e2f7ec9c.js via SPComponentLoader
6. Resolves globalThis.__hbIntel_hbWebparts.mount(el, context, config)
7. Renders HbHeroBanner directly (proof-case entry, no dispatcher)
```

No AMD shim in the chain. No neutral manifest indirection. No post-bundle surgery.

## C. Tenant deployment (manual — operator action required)

Deploy `dist/sppkg/hb-webparts.sppkg` to the SharePoint App Catalog:

1. Navigate to the App Catalog site → Apps for SharePoint
2. Upload `hb-webparts.sppkg` (overwrite existing)
3. Trust the app when prompted
4. Navigate to a page where HbHeroBanner is placed (or add it from the webpart toolbox under "HB Intel" → "HB Hero Banner")

## D. Runtime evidence to collect (manual)

After tenant deployment, verify:

| Check | Expected |
|-------|----------|
| Page render | HbHeroBanner renders (headline, message, card) |
| Console: `Could not load 39762a4d-... in require` | **absent** |
| Console: technical-details crash screen | **absent** |
| Network: `shell-web-part_8324e4b9e8d300cdb032.js` loaded | 200 OK |
| Network: `hb-webparts-app-e2f7ec9c.js` loaded | 200 OK |
| Network: `shell-entry-*.js` requests | **none** (no shims exist) |

### Cache sanity check

If the package inspection is clean but the tenant still shows old behavior:

1. Open DevTools → Application → Service Workers → Unregister `spserviceworker.js`
2. Hard refresh (Cmd+Shift+R)
3. If still failing, check the App Catalog version matches `01.000.014`
4. Check whether the CDN is still serving a cached older `shell-web-part_*.js`

A persistent old-behavior result after cache clear indicates a packaging defect, not a cache artifact.

## E. Remaining defects

None identified from local package inspection. All loader contract fields are coherent and first-class.

## F. Go / No-Go

**Local package: GO** — the `.sppkg` is structurally correct and ready for tenant deployment.
**Tenant runtime: awaiting manual validation** — cannot be confirmed without tenant access.

## Shim proof artifact

```json
{
  "domain": "hb-webparts",
  "sppkgFile": "hb-webparts.sppkg",
  "baseModuleId": "39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0",
  "emittedLocalShimFiles": [],
  "packagedShimMappings": []
}
```
