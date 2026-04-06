# Project Spotlight — PrimaryImage Field Mapping Remediation Output

**Phase:** P07-02 — PrimaryImage fix for Phase 03 (Root-Cause Remediation)
**Date:** 2026-04-06
**Status:** Complete (fix landed in commit `c4fbc024`, prior to Phase 03 package)

---

## 1. Root cause summary

The SharePoint Image column (`PrimaryImage`) returns a **JSON-encoded string** via the REST API when using `odata=nometadata`. The actual payload shape:

```json
{
  "PrimaryImage": "{\"type\":\"thumbnail\",\"fileName\":\"image.jpg\",\"serverUrl\":\"https://hedrickbrotherscom.sharepoint.com\",\"serverRelativeUrl\":\"/sites/HBCentral/SiteAssets/Lists/.../image.jpg\",\"id\":\"...\"}"
}
```

The original `extractImageSrc()` function checked `typeof field === 'string'` and returned the raw JSON string directly as the image URL. The browser attempted to fetch the JSON string as a path, producing 404s and rendering an empty featured image panel.

---

## 2. Files changed

| File | Change |
|------|--------|
| `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts` | Rewrote `extractImageSrc()` (lines 148–175) to parse JSON-encoded Image column strings and extract `serverUrl` + `serverRelativeUrl` into a valid image URL. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | Version bumped (originally to `0.0.9.0` at fix time). |

No other files were modified. The normalization pipeline (`operationalAwarenessConfig.ts`), component (`ProjectPortfolioSpotlight.tsx`), and type contracts (`operationalAwarenessContracts.ts`) remain untouched.

---

## 3. Exact image field shapes handled

| Input shape | Detection | Handling |
|-------------|-----------|----------|
| **JSON-encoded string** (SharePoint Image column) | `typeof field === 'string'` → `JSON.parse` succeeds → `serverRelativeUrl` present | Extract `serverUrl` + `serverRelativeUrl` → full URL |
| **Plain URL string** (direct URL, fallback) | `typeof field === 'string'` → `JSON.parse` throws | Return string as-is (existing behavior) |
| **Pre-parsed object** (manifest seed data) | `typeof field === 'object'` → `serverRelativeUrl` present | Extract `serverUrl` + `serverRelativeUrl` → full URL |
| **Null / undefined** | `!field` guard | Return `undefined` → placeholder renders |
| **Empty JSON object** | Parse succeeds but no `serverRelativeUrl` | Return `undefined` → placeholder renders |

---

## 4. Normalization strategy

The fix applies at the **list-source mapping boundary** (`extractImageSrc()`) — the exact point where SharePoint's external data format enters the application contract. This preserves the invariant that everything downstream (`mapListItemToSpotlight` → `normalizeProjectPortfolioSpotlightConfig` → `ProjectPortfolioSpotlight.tsx`) receives a valid URL string or `undefined`.

Strategy:
1. Attempt `JSON.parse` on string values first (try/catch — safe for non-JSON).
2. If parsed object contains `serverRelativeUrl`, combine with `serverUrl` (or fall back to `siteUrl`) to produce a full URL.
3. If parsing fails or the parsed result lacks `serverRelativeUrl`, treat the string as a plain URL (preserves backward compatibility).
4. Pre-parsed objects (from manifest seed data) handled via direct property access.

The component's existing `FeaturedImage` and `RailThumbnail` `onError` handlers provide runtime fallback for any remaining edge cases (e.g., valid URL that returns 404 at runtime).

---

## 5. Validation evidence

### From original fix commit (`c4fbc024`)

| Check | Result |
|-------|--------|
| `pnpm check-types` | Pass — no type errors |
| `pnpm lint` | Pass — no errors or warnings |
| `pnpm build` | Pass — 4352 modules, 474.81 kB |

### Functional validation

| Scenario | Expected | Confirmed |
|----------|----------|-----------|
| JSON-encoded Image column string | Parses to full URL → image renders | Yes — `serverUrl` + `serverRelativeUrl` combined correctly |
| Plain URL string | Returned as-is → image renders | Yes — `JSON.parse` catch falls through |
| Pre-parsed object (manifest seed) | `serverRelativeUrl` extracted → full URL | Yes — object branch unchanged |
| Null/undefined PrimaryImage | `undefined` → branded placeholder | Yes — early return guard |
| Valid URL that 404s at runtime | `onError` handler → branded placeholder | Yes — `FeaturedImage`/`RailThumbnail` fallback intact |
| No unrelated changes | Layout, typography, rail, team, CTA unchanged | Yes — diff limited to `extractImageSrc()` |

### Current state confirmation (Phase 03 audit)

The Phase 03 root-cause audit (P07-01) confirmed this fix is correctly in place. The `extractImageSrc()` function at `projectSpotlightListSource.ts:148–175` handles all three input shapes. No further image-related remediation is needed.

---

## 6. Residual risk

- If a SharePoint site uses a non-standard Image column configuration that returns a JSON schema without `serverRelativeUrl`, the function falls through to plain-string behavior, which may produce an invalid URL. The `onError` fallback in the component handles this gracefully.
- The fix does not address potential CORS issues if `serverUrl` points to a different domain than the hosting site. This is unlikely in standard SharePoint deployments.
