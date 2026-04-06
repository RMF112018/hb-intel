# PrimaryImage Remediation — Scope Lock Output

**Phase:** P08-01 — Scope lock for Phase 04 (Narrow Image Remediation Package)
**Date:** 2026-04-06
**Status:** Complete

---

## Confirmed Scope

The remediation target is the **PrimaryImage field normalization path** in the Project Spotlight list-source mapping layer. The root cause — a JSON-encoded SharePoint Image column string being passed directly as an image URL — was already fixed in Phase 03 (commit `c4fbc024`).

Phase 04 validates and closes the image path end-to-end: source truth, featured and rail surface coverage, package truth, and SharePoint runtime proof.

### Image field shapes handled by current `extractImageSrc()`

| Input shape | Detection | Handling |
|-------------|-----------|----------|
| JSON-encoded string (SharePoint Image column) | `typeof field === 'string'` → `JSON.parse` succeeds → `serverRelativeUrl` present | `serverUrl` + `serverRelativeUrl` → full URL |
| Plain URL string | `typeof field === 'string'` → `JSON.parse` throws | Return string as-is |
| Pre-parsed object (manifest seed data) | `typeof field === 'object'` → `serverRelativeUrl` present | `serverUrl` + `serverRelativeUrl` → full URL |
| Null / undefined | `!field` guard | Return `undefined` → placeholder renders |

---

## Files to Change

No code changes are required for the scope lock. The fix is already in place.

| File | Current state |
|------|---------------|
| `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts` | `extractImageSrc()` (lines 181–208) correctly parses JSON-encoded Image column strings. `mapListItemToSpotlight()` (line 284) wraps into `HomepageMediaSlot` contract. Already fixed in commit `c4fbc024`. |

---

## Files to Leave Alone

| File | Reason |
|------|--------|
| `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts` | Normalization pipeline — trims and validates. No image resolution logic needed here. |
| `apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts` | Type contracts — `HomepageMediaSlot` shape is correct and unchanged. |
| `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts` | Data hook — orchestration only, no image transformation. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/components/ProjectPortfolioSpotlight.tsx` | Component — receives valid URL or `undefined`. Fallback behavior is already correct. |
| All other homepage webparts | Out of scope. |

---

## Why the Fix Belongs in the Data/Resolver Layer

The SharePoint Image column's JSON-encoded format is an **external data boundary concern**. The correct normalization point is `extractImageSrc()` — the first function that interprets raw SharePoint field values before they enter the application contract.

Fixing at the component layer would:
- leak SharePoint-specific parsing into the UI,
- violate the existing contract where `image.src` is expected to be a valid URL or absent,
- require duplicate handling in both `FeaturedImage` and `RailThumbnail`.

Fixing at the normalization layer (`operationalAwarenessConfig.ts`) would:
- be too late — the contract already expects a valid URL from the list source,
- introduce unnecessary coupling between the normalization pipeline and SharePoint field shapes.

The data/resolver boundary is the correct and only fix point.

---

## Risk if Scope Expands

| Risk | Impact |
|------|--------|
| UI polish changes mask regression | Image rendering fix obscured by layout changes; harder to isolate cause of future failures |
| List schema redesign delays closure | Introduces migration and coordination overhead unrelated to the image URL normalization bug |
| Component-layer workarounds | Duplicate parsing logic; contract violation; harder to test |
| Touching unrelated webparts | Regression surface expands; package-truth validation becomes ambiguous |

---

## Validation Gate

### Where does the unresolved PrimaryImage value first become trusted?

`extractImageSrc()` at `projectSpotlightListSource.ts:181–208`. This is the **only** point where the raw SharePoint field value is interpreted. Prior to the Phase 03 fix, the JSON string was trusted as a direct URL at line 199 (the string fallthrough). The fix inserts JSON parsing (lines 187–195) before that fallthrough.

### Where does it become image.src?

`mapListItemToSpotlight()` at `projectSpotlightListSource.ts:284` wraps the extracted URL into `{ src: imageSrc, alt: ..., aspectRatio: '16:9' }`. This object flows through `normalizeProjectPortfolioSpotlightConfig()` (trim only) and reaches the component as `item.image.src`.

Both render surfaces consume the identical value:
- `FeaturedImage` at `ProjectPortfolioSpotlight.tsx:1028`
- `RailThumbnail` at `ProjectPortfolioSpotlight.tsx:929`

### Why should the fix happen before UI rendering?

The application contract (`HomepageMediaSlot.src`) guarantees a valid URL string or absence (`undefined`). Any code downstream of the list-source mapping boundary — normalization, component, render — is entitled to trust that contract. Fixing at the data boundary preserves this invariant and keeps the component layer free of SharePoint-specific concerns.

---

## Implementation Note Summary

- **Primary fix file:** `projectSpotlightListSource.ts` — `extractImageSrc()` (already fixed)
- **Secondary fix file:** None
- **Verification target:** Same file — confirm JSON parse path handles all documented shapes
- **Component fallback:** Acceptable as-is — `FeaturedImage` and `RailThumbnail` both have `onError` → branded gradient placeholder
- **Scope for remaining Phase 04 prompts:** Validate fix coverage (02–03), rebuild `.sppkg` and verify package truth (04), confirm SharePoint runtime proof (05)
