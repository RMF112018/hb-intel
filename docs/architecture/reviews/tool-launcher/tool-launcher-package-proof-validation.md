# Tool Launcher Package Proof: Validation

## Proof markers selected

Eight distinctive string literals were selected from phases 11D through 11H. These survive minification because they are user-facing text, HTML attribute values, or CSS string values — not JavaScript identifiers subject to mangling.

| # | Marker | Source phase | Source file | Why it survives bundling |
|---|--------|-------------|-------------|------------------------|
| 1 | `launcher-suggestion-` | 11H | `LauncherCommandBand.tsx` | HTML `id` attribute prefix |
| 2 | `data-launcher-state` | 11G | `ToolLauncherWorkHub.tsx` | HTML data attribute name |
| 3 | `Try a different name, category, or workflow` | 11E | `LauncherCommandBand.tsx` | User-facing UI text |
| 4 | `rgba(34,83,145,0.10) 0%, transparent 80%` | 11D | `LauncherUtilityRail.tsx` | CSS gradient string |
| 5 | `loading:"lazy"` | 11H | `LauncherLogo.tsx` | HTML attribute in JSX |
| 6 | `"aria-modal":"true"` | 11H | `LauncherAllPlatformsOverlay.tsx` | ARIA attribute (was `"false"` before 11H) |
| 7 | `Platform owners and support contacts` | 11F | `LauncherUtilityRail.tsx` | Section description text |
| 8 | `Unable to load platforms` | 11G | `ToolLauncherWorkHub.tsx` | Error state title text |

## Verification in Vite bundle (source build output)

**File:** `apps/hb-webparts/dist/hb-webparts-app.js` (521,993 bytes)

| # | Marker | Occurrences |
|---|--------|-------------|
| 1 | `launcher-suggestion-` | 1 |
| 2 | `data-launcher-state` | 1 |
| 3 | `Try a different name, category, or workflow` | 1 |
| 4 | `rgba(34,83,145,0.10) 0%, transparent 80%` | 1 |
| 5 | `loading:"lazy"` | 1 |
| 6 | `"aria-modal":"true"` | 1 |
| 7 | `Platform owners and support contacts` | 1 |
| 8 | `Unable to load platforms` | 1 |

**Result:** All 8 markers present. The Vite build reflects current source.

## Verification in final .sppkg (packaged output)

**File:** `dist/sppkg/hb-webparts.sppkg` (2,966.7 KB)

The sppkg was unpacked (it is an OPC/ZIP format) and the main client-side asset `ClientSideAssets/hb-webparts-app-42b733c6.js` was inspected.

| # | Marker | Occurrences |
|---|--------|-------------|
| 1 | `launcher-suggestion-` | 1 |
| 2 | `data-launcher-state` | 1 |
| 3 | `Try a different name, category, or workflow` | 1 |
| 4 | `rgba(34,83,145,0.10) 0%, transparent 80%` | 1 |
| 5 | `loading:"lazy"` | 1 |
| 6 | `"aria-modal":"true"` | 1 |
| 7 | `Platform owners and support contacts` | 1 |
| 8 | `Unable to load platforms` | 1 |

**Result:** All 8 markers present in the packaged bundle.

## SHA256 hash verification

The SHA256 hash of the Vite source bundle and the packaged bundle inside the sppkg are identical:

| Asset | SHA256 prefix |
|-------|--------------|
| `apps/hb-webparts/dist/hb-webparts-app.js` | `42b733c670d0249e` |
| `sppkg → ClientSideAssets/hb-webparts-app-42b733c6.js` | `42b733c670d0249e` |

**Result:** Byte-identical. The packaging pipeline did not transform, truncate, or substitute the bundle.

## Package structure verification

| Check | Result |
|-------|--------|
| Content hash in filename | `42b733c6` — matches SHA256 prefix |
| Bundle size in package | 521,993 bytes — matches source build |
| CSS bundle present | `spfx-hb-webparts.css` — present |
| Webpart manifests | 11 manifests present |
| Shell entry shims | 11 per-webpart shims present |
| `supportsFullBleed` on Tool Launcher manifest | Preserved (cb7060f5) |
| Solution metadata | Valid OPC structure with AppManifest.xml |

## Final statement

**The generated `dist/sppkg/hb-webparts.sppkg` is confirmed to contain the latest Tool Launcher code from all phases (11A through 11H).**

The package is the correct file for upload to the SharePoint app catalog. No packaging defects were found. The suspected deployment mismatch is not a packaging-pipeline issue — it is an upload/deployment issue that will be resolved by uploading this freshly-built package and confirming the app catalog upgrade.

### Upload path

```
dist/sppkg/hb-webparts.sppkg
```

### Post-upload checklist

1. Upload `hb-webparts.sppkg` to the SharePoint tenant app catalog
2. Confirm "Replace" when prompted (existing app)
3. Click "Deploy" to complete the upgrade
4. Wait 5–10 minutes for CDN propagation
5. Hard-refresh the homepage (Ctrl+Shift+R) to bypass browser cache
6. Verify Tool Launcher renders with the rebuilt support/status surface (11F) and search improvements (11E)
