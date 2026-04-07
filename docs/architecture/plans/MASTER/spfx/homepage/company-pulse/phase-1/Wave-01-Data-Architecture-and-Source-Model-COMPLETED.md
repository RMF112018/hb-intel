# Wave 01 — Data Architecture and Source Model (Completed)

> **Status:** Locked
> **Completed:** 2026-04-07
> **Source charter:** `Wave-01-Data-Architecture-and-Source-Model.md`

---

## 1. Contract Changes

### CompanyPulseItem — extended fields

| Field | Type | Purpose |
|-------|------|---------|
| `byline` | `string?` | Author or source attribution (e.g. "Corporate Communications") |
| `publishDate` | `string?` | ISO date string for freshness/recency display |
| `media` | `HomepageMediaSlot?` | Hero image with src, alt, and optional aspectRatio |

All three fields are optional — existing seed data and partial configurations remain valid.

### CompanyPulseConfig — extended fields

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `maxTertiaryItems` | `number?` | 4 | Bounds the tertiary quick-read tier |
| `archiveHref` | `string?` | — | Destination URL for "See all" CTA |

### NewsroomOutput — new output type

Replaces `CuratedCollection<CompanyPulseItem>` as the normalizer return type:

```typescript
interface NewsroomOutput {
  heading: string;
  lead?: CompanyPulseItem;
  secondary: CompanyPulseItem[];
  tertiary: CompanyPulseItem[];
  archiveHref?: string;
}
```

This three-tier structure directly supports the newsroom hierarchy:
- **Lead** — dominant featured story (first by priority)
- **Secondary** — headline stack (bounded by `maxSecondaryItems`)
- **Tertiary** — quick-read overflow (bounded by `maxTertiaryItems`)

### EditorialFeaturedItem — UI Kit extension

Added `media?: React.ReactNode` to `EditorialFeaturedItem` in `@hbc/ui-kit` so `HbcEditorialSurface` can render media within the featured slot.

---

## 2. Normalizer Changes

`normalizeCompanyPulseConfig()` now:
- Trims and validates `byline` and `publishDate` strings
- Validates media (requires both `src` and non-empty `alt`)
- Produces three-tier split: lead → secondary (bounded) → tertiary (bounded)
- Preserves `archiveHref` in output when provided
- Returns `NewsroomOutput` instead of `CuratedCollection<CompanyPulseItem>`

---

## 3. How the Source Model Supports the Newsroom Hierarchy

| UI Zone | Source Model Support |
|---------|---------------------|
| **Lead story** | First item by priority sort. Supports title, summary, byline, publishDate, media, category badge, and CTA. |
| **Secondary headlines** | Items 2–N bounded by `maxSecondaryItems`. Supports title, byline/metadata, category, and CTA link. |
| **Tertiary quick-reads** | Overflow items bounded by `maxTertiaryItems`. Available for future render-layer use in Wave 03. |
| **Archive continuity** | `archiveHref` wires the "See all" CTA to a real newsroom destination. |
| **Sparse state: 1 story** | `lead` populated, `secondary` and `tertiary` empty — UI remains intentional. |
| **Sparse state: 0 stories** | `lead` undefined — triggers authored empty state with newsroom-specific messaging. |
| **Partial media** | Media without alt text is normalized to `undefined` — no broken images. |
| **Missing metadata** | All new fields are optional — component degrades gracefully field by field. |

---

## 4. Validation

### Verified states

- Dominant lead story with full metadata (byline, publishDate, media, category, CTA) ✓
- Secondary headline stack bounded correctly ✓
- Tertiary overflow tier populated and bounded ✓
- Sparse state: single story produces lead-only output ✓
- Sparse state: zero stories produces undefined lead ✓
- Audience filtering preserved ✓
- Media without alt text dropped ✓
- Archive href preserved in output ✓
- Governance messages updated for newsroom posture ✓

### Verification results

- **check-types:** pass (ui-kit + hb-webparts)
- **lint:** pass (0 errors, 0 warnings)
- **build:** pass (540.64 KB JS, 24.98 KB CSS)
- **tests:** 19/19 pass on changed files; 6 pre-existing failures in unrelated test files (discovery, operational awareness, utility webparts)
