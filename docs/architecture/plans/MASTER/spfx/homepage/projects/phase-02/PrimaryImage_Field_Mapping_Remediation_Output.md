# Project Spotlight — PrimaryImage Field Mapping Remediation Output

**Date:** 2026-04-06
**Status:** Complete

---

## 1. Root cause summary

The featured image panel was empty because the SharePoint Image column (`PrimaryImage`) returns a **JSON-encoded string** via the REST API (`odata=nometadata`), not a plain URL. The actual response payload looks like:

```json
{
  "PrimaryImage": "{\"type\":\"thumbnail\",\"fileName\":\"image.jpg\",\"serverUrl\":\"https://hedrickbrotherscom.sharepoint.com\",\"serverRelativeUrl\":\"/sites/HBCentral/SiteAssets/Lists/.../image.jpg\",\"id\":\"...\"}"
}
```

The `extractImageSrc` function checked `typeof field === 'string'` and returned the raw value directly, passing a JSON string (not a URL) into `<img src>`. This caused the browser to attempt fetching the JSON string as a path, resulting in 404s against thumbnail endpoints and an empty featured image panel.

---

## 2. Files changed

| File | Purpose |
|------|---------|
| `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts` | Fixed `extractImageSrc()` to parse JSON-encoded Image column strings and extract `serverUrl` + `serverRelativeUrl` into a valid image URL. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | Version bumped to `0.0.9.0`. |

---

## 3. Mapping summary

The `extractImageSrc` function now handles three shapes:

| Input shape | Handling |
|-------------|----------|
| **JSON-encoded string** (SharePoint Image column) | `JSON.parse` → extract `serverUrl` + `serverRelativeUrl` → full URL |
| **Plain URL string** (fallback / direct URL) | JSON parse fails → returned as-is (existing behavior) |
| **Pre-parsed object** (manifest seed data) | `serverRelativeUrl` extracted directly (existing behavior) |

The JSON parse is wrapped in try/catch so non-JSON strings (plain URLs) fall through safely.

---

## 4. Fallback summary

When an image cannot be resolved (null `PrimaryImage`, empty JSON, or invalid URL):
- `extractImageSrc` returns `undefined`
- `mapListItemToSpotlight` sets `image: undefined`
- The `FeaturedImage` component (P06-03) shows the branded gradient placeholder with "Project Image" text
- The `RailThumbnail` component shows a gradient placeholder
- If the URL resolves but the image itself 404s at runtime, the existing `onError` handlers in `FeaturedImage` and `RailThumbnail` suppress the broken image and show the branded fallback

---

## 5. Validation evidence

| Check | Result |
|-------|--------|
| `pnpm check-types` | Pass — no type errors |
| `pnpm lint` | Pass — no errors or warnings |
| `pnpm build` | Pass — 4352 modules, 474.81 kB |
| JSON string parsing | `extractImageSrc` now parses `"{\"serverUrl\":\"...\",\"serverRelativeUrl\":\"...\"}"` into a full URL |
| Plain URL passthrough | Non-JSON strings still returned as-is |
| Object passthrough | Pre-parsed objects with `serverRelativeUrl` still handled correctly |
| Null/undefined | Returns `undefined` → branded placeholder renders |
| No unrelated changes | Only `extractImageSrc` function modified; no layout, typography, rail, team, or CTA changes |

---

## 6. Residual risk note

- If a SharePoint site uses a non-standard Image column configuration that returns a different JSON schema (e.g., without `serverRelativeUrl`), the function will fall through to plain-string behavior, which may still produce an invalid URL. The `onError` fallback in the component will handle this gracefully.
- The fix does not address potential CORS issues if `serverUrl` points to a different domain than the hosting site. This is unlikely in standard SharePoint deployments.
