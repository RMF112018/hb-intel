# 08 — Mount, Runtime, Manifest, and Packaging Integration

## Objective

Wire `hb-homepage` into the real `hb-webparts` runtime and packaging pipeline.

## Files changed

| File | Change |
|------|--------|
| `src/mount.tsx` | Added import for `HbHomepage` and `HB_HOMEPAGE_WEBPART_ID`. Added renderer entry in `WEBPART_RENDERERS` map. |
| `src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Created with GUID `e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf`, `supportsFullBleed: true`. |

## Runtime GUID mapping proof

```typescript
[HB_HOMEPAGE_WEBPART_ID]: ({ config, identity, assetBaseUrl, siteUrl, getGraphToken, getApiToken }) =>
  createElement(HbHomepage, { config, identity, assetBaseUrl, siteUrl, getGraphToken, getApiToken }),
```

- `HB_HOMEPAGE_WEBPART_ID` = `'e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf'` (from `hbHomepageContract.ts`)
- Matches manifest `id` field in `HbHomepageWebPart.manifest.json`
- Single source of truth via the contract constant

## Manifest proof

- **Location:** `src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` — adjacent to the webpart folder (follows existing convention)
- **ID:** `e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf`
- **componentType:** `WebPart`
- **manifestVersion:** `2`
- **supportsFullBleed:** `true`
- **supportedHosts:** `["SharePointWebPart"]`
- **groupId:** `5c03119e-3074-46fd-976b-c60198311f70` (HB Intel group)

## Packaging behavior

The `build-spfx-package.ts` pipeline discovers manifests by scanning `src/webparts/*/` for `*.manifest.json` files. The new `HbHomepageWebPart.manifest.json` is in the correct location and will be:

1. Discovered during manifest collection
2. Processed through the multi-manifest shell-entry shim pipeline
3. Assigned a unique `shell-entry-{manifestId}-{hash}.js` shim
4. Included in the `package-solution.json` feature componentIds
5. Packaged into the `.sppkg` archive

No changes to `build-spfx-package.ts` were required — the existing pipeline handles new manifest discovery automatically.

## Build/package proof

- **Type check:** `pnpm --filter @hbc/spfx-hb-webparts check-types` — clean
- **Vite build:** `pnpm --filter @hbc/spfx-hb-webparts build` — produces `hb-webparts-app.js` (1,014 KB gzip: 326 KB) and CSS (153 KB gzip: 25 KB)
- **Lint:** No new lint issues introduced; all 4 pre-existing errors are in unrelated files

## Existing package integrity

- No existing GUID-to-renderer mapping was removed or modified
- No existing manifest was deleted, hidden, or modified
- No packaging exclusion was added for any currently active webpart
- The new entry is purely additive to the `WEBPART_RENDERERS` map

## Remaining boundary

Only hosted validation remains — communication-site deployment proof for full-width behavior. This is an external/environmental constraint.
