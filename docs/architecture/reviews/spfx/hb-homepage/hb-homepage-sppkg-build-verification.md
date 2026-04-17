# HB Homepage `.sppkg` Build Verification Report

**Date:** 2026-04-17
**Pipeline:** `tools/build-spfx-package.ts --domain hb-homepage`
**Output:** `dist/sppkg/hb-intel-homepage.sppkg` (245,078 bytes)

## Commands executed

```bash
# 1. Clean build
rm -rf apps/hb-homepage/dist
pnpm --filter @hbc/spfx-hb-homepage build

# 2. Authoritative packaging
npx tsx tools/build-spfx-package.ts --domain hb-homepage
```

## Build result

- Vite build: **passed** (4474 modules, 2.45s)
- Bundle output: `hb-homepage-app.js` (719 KB, gzip 215 KB)
- CSS output: `spfx-hb-homepage.css` (104 KB)

## Packaging result

- Pipeline: **all checks passed**
- `supportsFullBleed: true` preserved
- `.sppkg` structure verified
- Bundle freshness verified (SHA-256 match)
- Shell asset references verified (`__hbIntel_hbHomepage`)
- Package-truth proof written

## Archive contents

| File | Size (bytes) |
|---|---:|
| `AppManifest.xml` | 1,108 |
| `[Content_Types].xml` | 1,035 |
| `_rels/.rels` | 288 |
| `_rels/AppManifest.xml.rels` | 484 |
| `_rels/ClientSideAssets.xml.rels` | 1,063 |
| `_rels/feature_c4e91f7d-….xml.rels` | 560 |
| `feature_c4e91f7d-8a23-4b56-9d0e-1f3c5a7b2d84.xml` | 283 |
| `feature_c4e91f7d-….xml.config.xml` | 189 |
| `c4e91f7d-…/WebPart_e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf.xml` | 2,278 |
| `ClientSideAssets/hb-homepage-app-f04ca571.js` | 719,077 |
| `ClientSideAssets/shell-entry-e0a11c44-…-acb35d2e.js` | 13,101 |
| `ClientSideAssets/shell-web-part_e0aeb009e9e12af6185e.js` | 13,101 |
| `ClientSideAssets/spfx-hb-homepage-62b9a078.css` | 103,790 |
| `ClientSideAssets.xml` | 312 |
| `ClientSideAssets.xml.config.xml` | 189 |

## Packaged manifest proof

- **Webpart id:** `e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf` (preserved)
- **Alias:** `HbHomepageWebPart`
- **Title:** HB Homepage
- **supportsFullBleed:** `true`
- **entryModuleId:** `e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf_1.0.0`
- **scriptResources:** points to `shell-entry-e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf-acb35d2e.js`

## Asset freshness proof

- **App bundle:** `hb-homepage-app-f04ca571.js` — SHA-256 prefix `f04ca571` matches current build
- **Shell-entry shim:** `shell-entry-e0a11c44-…-acb35d2e.js` — SHA-256 prefix `acb35d2e` matches generated mapping
- **freshBuildRequired: true** — pipeline enforced clean dist before build

## Source provenance (critical runtime paths)

| File | SHA-256 (first 16) |
|---|---|
| `apps/hb-homepage/src/mount.tsx` | varies per build |
| `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | `bafe8272e49f4898` |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx` | `76230084bd652dca` |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx` | `23ce105b524cf329` |
| `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts` | `055f1a85c732faec` |
| `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts` | `3b0e357180e6bc9f` |

## Duplicate ownership prevention

- Manifest id `e0a11c44-…` added to `HB_WEBPARTS_EXCLUDED_MANIFEST_IDS`
- `hb-homepage` is a separate domain in `ALL_DOMAINS`
- The standalone domain owns the `.sppkg`; `hb-webparts` no longer packages this manifest

## Remaining risks

- None identified. The package is structurally complete, asset-fresh, and free of duplicate-ownership drift.

## Conclusion

The output is **tenant-deployable**. The package was produced by the authoritative pipeline, inspected post-build, and verified against the same discipline as Project Sites and HB Webparts.
