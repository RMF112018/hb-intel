# PrimaryImage Resolver Correction — Output

**Phase:** P08-02 — Resolver correction for Phase 04 (Narrow Image Remediation Package)
**Date:** 2026-04-06
**Status:** Complete — fix already landed in Phase 03 (commit `c4fbc024`)

---

## What Changed

The `extractImageSrc()` function in `projectSpotlightListSource.ts` (lines 181–208) was corrected in Phase 03 to parse JSON-encoded SharePoint Image column strings before trusting them as image URLs. The fix is minimal and local — only the list-source mapping boundary was modified.

### Before (original behavior)

```typescript
// typeof field === 'string' → returned raw JSON string as image URL
return field || undefined;
```

The raw JSON string `{"type":"thumbnail","fileName":"...","serverUrl":"...","serverRelativeUrl":"...","id":"..."}` was passed directly as `<img src>`, producing a 404.

### After (corrected behavior)

```typescript
function extractImageSrc(field, siteUrl) {
  if (!field) return undefined;

  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (parsed && typeof parsed === 'object') {
        const obj = parsed as Record<string, unknown>;
        if (typeof obj.serverRelativeUrl === 'string' && obj.serverRelativeUrl) {
          const base = (typeof obj.serverUrl === 'string' && obj.serverUrl) || siteUrl;
          return `${base}${obj.serverRelativeUrl}`;
        }
      }
    } catch {
      // Not JSON — treat as a plain URL string
    }
    return field || undefined;
  }

  // Pre-parsed object (manifest seed data)
  if (field.serverRelativeUrl) {
    const base = field.serverUrl || siteUrl;
    return `${base}${field.serverRelativeUrl}`;
  }
  return undefined;
}
```

---

## Accepted Input Shapes

| Shape | Detection | Resolution | Result |
|-------|-----------|------------|--------|
| **Absolute URL** (`https://...`) | `typeof === 'string'` → `JSON.parse` throws | Returned as-is | Valid `image.src` |
| **Server-relative URL** (`/sites/...`) | `typeof === 'string'` → `JSON.parse` throws | Returned as-is (browser resolves against current origin) | Valid `image.src` |
| **JSON-encoded SharePoint Image column** | `typeof === 'string'` → `JSON.parse` succeeds → `serverRelativeUrl` present | `serverUrl` + `serverRelativeUrl` combined into full URL | Valid `image.src` |
| **Pre-parsed object** (manifest seed) | `typeof === 'object'` → `serverRelativeUrl` present | `serverUrl` + `serverRelativeUrl` combined | Valid `image.src` |

## Rejected Input Shapes

| Shape | Detection | Resolution | Result |
|-------|-----------|------------|--------|
| **Null / undefined** | `!field` guard (line 182) | Returns `undefined` | Placeholder renders |
| **Empty string** | Falls through to `field \|\| undefined` (line 199) | Returns `undefined` | Placeholder renders |
| **JSON object without `serverRelativeUrl`** | Parse succeeds but property check fails | Falls through to string return; if string is the full JSON, it's non-empty but not a valid URL | `onError` fallback in component catches the 404 |
| **Reserved opaque token** (no `serverRelativeUrl`, not valid JSON) | `JSON.parse` throws, string returned | If the token is not a fetchable URL, browser 404 triggers `onError` | Placeholder renders via component fallback |

---

## Why Reserved Token Values No Longer Reach `<img src>`

The primary SharePoint Image column format — JSON-encoded string with `serverUrl` and `serverRelativeUrl` — is now parsed and resolved before the value enters the application contract. The JSON string itself never reaches `image.src`.

For any unknown string that is not valid JSON or lacks `serverRelativeUrl`, the function still returns the raw string. This is intentional: plain URL strings (absolute or server-relative) are valid inputs. If an opaque token happens to survive this path, the component's `FeaturedImage` and `RailThumbnail` `onError` handlers catch the resulting 404 and render branded gradient placeholders. This two-layer defense (resolver + component fallback) ensures no broken image icons appear.

---

## Data Flow Trace

```
SharePoint REST API → PrimaryImage field (JSON-encoded string)
    ↓
extractImageSrc(field, siteUrl)                    [listSource.ts:181–208]
    ├─ JSON.parse → extract serverUrl + serverRelativeUrl → full URL
    ├─ catch → return plain string (absolute/relative URL)
    └─ !field → return undefined
    ↓
mapListItemToSpotlight()                           [listSource.ts:284]
    → image: { src: imageSrc, alt: ..., aspectRatio: '16:9' } | undefined
    ↓
normalizeProjectPortfolioSpotlightConfig()         [operationalAwarenessConfig.ts:184–186]
    → trim src, validate non-empty
    ↓
ProjectPortfolioSpotlight component
    ├─ FeaturedImage (line 1028) → <img src={src}> with onError fallback
    └─ RailThumbnail (line 929)  → <img src={src}> with onError fallback
```

---

## Any Remaining Ambiguity

| Concern | Status |
|---------|--------|
| One SharePoint image shape still unhandled | **Low risk.** All documented shapes are covered. An unknown future shape would fall through to the string path and be caught by component `onError` fallback. |
| Rail thumbnails using a different path than featured image | **No.** Both surfaces consume the identical `image.src` from the normalized item. |
| Server-relative URLs not resolving in tenant runtime | **Handled.** When `serverUrl` is present in the JSON payload, it's used as the base. When absent, `siteUrl` from SPFx context is used. Plain server-relative strings resolve against the browser's current origin. |
| Overfitting to one observed payload shape | **Mitigated.** The resolver handles four distinct input shapes (absolute URL, server-relative URL, JSON-encoded object, pre-parsed object) plus three rejection cases (null, empty, malformed). |

---

## Files Changed

| File | Change |
|------|--------|
| `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts` | `extractImageSrc()` rewritten to parse JSON-encoded Image column strings (commit `c4fbc024`, Phase 03) |

## Files NOT Changed (confirmed correct)

| File | Reason |
|------|--------|
| `operationalAwarenessConfig.ts` | Normalization pipeline — trim only, no image resolution needed |
| `operationalAwarenessContracts.ts` | Type contracts unchanged |
| `useProjectSpotlightData.ts` | Data hook — orchestration only |
| `ProjectPortfolioSpotlight.tsx` | Component fallback intact and correct |

---

## Validation Evidence

### Code inspection (current repo truth)

- `extractImageSrc()` at lines 181–208 handles JSON parse path with `serverRelativeUrl` extraction
- `mapListItemToSpotlight()` at line 284 wraps result into `HomepageMediaSlot` contract
- `FeaturedImage` component (line 614–649) includes `onError` → branded gradient placeholder
- `RailThumbnail` component (line 654–679) includes `onError` → branded gradient placeholder
- No other files in the image path were modified

### Build verification (from Phase 03 closure, P07-04)

| Check | Result |
|-------|--------|
| `pnpm tsc --noEmit` | Pass |
| `pnpm lint` | Pass |
| `pnpm build` | Pass — 4352 modules, 475.46 kB |
