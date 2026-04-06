# Featured and Rail Image Validation — Output

**Phase:** P08-03 — Featured + rail validation for Phase 04 (Narrow Image Remediation Package)
**Date:** 2026-04-06
**Status:** Complete — both surfaces confirmed safe

---

## Featured Surface Result

The featured image surface at `ProjectPortfolioSpotlight.tsx:1027–1033` consumes the corrected normalized `image.src`:

```tsx
{feat.image ? (
  <FeaturedImage key={feat.image.src} src={feat.image.src} alt={feat.image.alt || feat.title} tier={tier} />
) : (
  <div style={getImagePlaceholderStyle(tier)} aria-hidden="true">
    Project Image
  </div>
)}
```

- `feat` is the first item from the normalized config (`NormalizedProjectPortfolioSpotlightItem`)
- `feat.image` is the `HomepageMediaSlot` produced by `mapListItemToSpotlight()` → `normalizeProjectPortfolioSpotlightConfig()`
- `feat.image.src` is the value returned by `extractImageSrc()` — the corrected resolver
- When `feat.image` is `undefined` (no valid image URL), a branded placeholder `div` renders directly

The `FeaturedImage` component (lines 614–649) provides a second layer of defense:
- A branded gradient placeholder div sits behind the `<img>` via absolute positioning (always rendered)
- On load success, the image covers the placeholder (`zIndex: 1` over `zIndex: 0`)
- On load error, `onError` sets `error` state → the `<img>` is removed → the placeholder remains visible
- No broken image icon is ever shown

---

## Rail Surface Result

The supporting rail thumbnails at `ProjectPortfolioSpotlight.tsx:927–932` consume the same corrected `image.src`:

```tsx
{item.image ? (
  <RailThumbnail key={item.image.src} src={item.image.src} alt={item.image.alt || item.title} />
) : (
  <div style={railThumbnailPlaceholderStyle} aria-hidden="true" />
)}
```

- `item` is a secondary item from the same normalized config array
- `item.image` uses the identical `HomepageMediaSlot` contract and the identical `extractImageSrc()` resolver path
- When `item.image` is `undefined`, a gradient placeholder `div` renders directly

The `RailThumbnail` component (lines 654–679) provides its own fallback:
- On load error, `onError` sets `error` state → returns `railThumbnailPlaceholderStyle` div
- Renders `<img width={88} height={66}>` with `decoding="async" loading="lazy"`
- No broken image icon is ever shown

---

## Placeholder / Fallback Result

Both surfaces have **two-tier fallback protection**:

| Tier | Featured | Rail | Trigger |
|------|----------|------|---------|
| **Tier 1 — Data layer** | `feat.image` is `undefined` → placeholder div with "Project Image" text | `item.image` is `undefined` → gradient placeholder div | `extractImageSrc()` returns `undefined` for null/empty/malformed input |
| **Tier 2 — Component layer** | `FeaturedImage.onError` → removes `<img>`, branded placeholder remains | `RailThumbnail.onError` → renders gradient placeholder div | Valid URL that returns 404/error at runtime |

Neither surface emits a bad request from an unresolved reserved token:
- JSON-encoded Image column strings are parsed by `extractImageSrc()` before reaching the contract
- If parsing fails and the raw string is not a fetchable URL, the browser 404 triggers `onError` fallback
- No broken image icons appear in any scenario

---

## Shared Contract Assumptions

| Assumption | Confirmed |
|------------|-----------|
| Featured and rail both consume `NormalizedProjectPortfolioSpotlightItem.image` | Yes — same TypeScript type, same normalized config source |
| Image resolution happens once at `extractImageSrc()` | Yes — lines 181–208 in `projectSpotlightListSource.ts` |
| No secondary image resolver or thumbnail-specific path exists | Yes — both surfaces use `item.image.src` directly |
| Normalization pipeline (`operationalAwarenessConfig.ts:184–186`) only trims, does not re-resolve | Yes — `hasText(item.image?.src)` guard + `.trim()` |
| Component `key={item.image.src}` resets `error` state when URL changes | Yes — React unmounts/remounts on key change |

---

## Open Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| SharePoint Image column returns a new undocumented JSON schema | Low | Falls through to string path; component `onError` catches 404 |
| CORS on image URL if `serverUrl` points to a different domain | Very low | Standard SharePoint deployments use same-origin; component fallback handles failure |
| `key={item.image.src}` causes unnecessary remounts if src changes between renders | Very low | Only happens on data refresh; no performance concern for 1–4 items |
| **No automated test coverage** for image resolution path | Medium | The repo does not currently have unit tests for `extractImageSrc()`. Validation relies on build verification + code inspection. Tenant runtime proof (Phase 04, Prompt 05) remains the authoritative gate. |

---

## Validation Gate

Both required statements are confirmed:

1. **The corrected value path is shared:** Featured and rail surfaces both consume `image.src` from the same `NormalizedProjectPortfolioSpotlightItem` produced by the single `extractImageSrc()` → `mapListItemToSpotlight()` → `normalizeProjectPortfolioSpotlightConfig()` pipeline. There is no divergent image path.

2. **Both image surfaces behave correctly with valid and invalid inputs:**
   - Valid URL → image renders (featured: full panel with scrim; rail: 88×66 thumbnail)
   - Invalid/missing URL at data layer → `image` is `undefined` → branded placeholder renders
   - Valid URL that 404s at runtime → `onError` fallback → branded placeholder renders
   - No broken image icons in any scenario
