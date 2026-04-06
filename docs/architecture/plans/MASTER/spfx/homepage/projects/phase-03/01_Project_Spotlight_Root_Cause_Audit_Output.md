# Project Spotlight — Root-Cause Audit Output

**Phase:** P07-01 — Entry gate for Phase 03 (Root-Cause Remediation)
**Date:** 2026-04-06
**Status:** Complete

---

## 1. Root cause — PrimaryImage not rendering

**Status:** Already fixed (commit `c4fbc024`).

**Root cause:** The SharePoint Image column (`PrimaryImage`) returns a JSON-encoded string via the REST API when using `odata=nometadata`:

```json
{
  "PrimaryImage": "{\"type\":\"thumbnail\",\"fileName\":\"image.jpg\",\"serverUrl\":\"https://hedrickbrotherscom.sharepoint.com\",\"serverRelativeUrl\":\"/sites/HBCentral/SiteAssets/Lists/.../image.jpg\",\"id\":\"...\"}"
}
```

The original `extractImageSrc()` checked `typeof field === 'string'` and returned the raw JSON string directly as the image URL. The browser attempted to fetch the JSON string as a path, producing 404s and an empty featured image panel.

**Fix applied:** `extractImageSrc()` now attempts `JSON.parse` on string values first. When the parsed result contains `serverRelativeUrl`, it constructs a full URL from `serverUrl` + `serverRelativeUrl`. Non-JSON strings (plain URLs) fall through via try/catch. Pre-parsed object handling is unchanged for manifest seed data.

**Originating file:** `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts` — `extractImageSrc()` (lines 148–175).

---

## 2. Root cause — raw HTML in summary/body area

**Status:** Open — requires remediation in Prompt 03.

**Root cause:** The SharePoint `Summary` column is an Enhanced Rich Text field. The REST API returns the stored HTML markup directly:

```
"<p>Structural turnover enters final phase with field quality walkthroughs scheduled this week.</p>"
```

The entire data pipeline performs only `.trim()` on the summary value — no HTML tag stripping or entity decoding occurs at any point:

| Stage | File | Line | Operation |
|-------|------|------|-----------|
| List mapping | `projectSpotlightListSource.ts` | 247 | `raw.Summary?.trim() \|\| ''` |
| Normalization | `operationalAwarenessConfig.ts` | 199 | `item.summary.trim()` |
| Render | `ProjectPortfolioSpotlight.tsx` | 1065 | `<p>{feat.summary}</p>` |

React's default text interpolation (`{feat.summary}`) escapes HTML entities, so the literal tags (`<p>`, `<div>`, etc.) appear as visible text in the rendered output rather than being interpreted as HTML. The user sees markup characters in the card body.

**No HTML-to-text utility exists anywhere in `apps/hb-webparts/src/`.**

---

## 3. Originating files

| Issue | Primary file | Function / line |
|-------|-------------|----------------|
| PrimaryImage (fixed) | `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts` | `extractImageSrc()` lines 148–175 |
| Summary HTML (open) | `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts` | `mapListItemToSpotlight()` line 247 |
| Summary passthrough | `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts` | `normalizeProjectPortfolioSpotlightConfig()` line 199 |
| Summary render | `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` | Line 1065 |

---

## 4. Smallest correct fix path

### PrimaryImage — no further action

Already resolved. The `extractImageSrc()` JSON-parse path is correct and the `FeaturedImage` / `RailThumbnail` `onError` fallbacks handle runtime 404s gracefully.

### Summary HTML — recommended fix

Add a `stripHtml()` helper function in `projectSpotlightListSource.ts` that:

1. Strips all HTML tags via regex or DOMParser.
2. Decodes common HTML entities (`&amp;` → `&`, `&nbsp;` → space, `&#39;` → `'`, `&lt;`/`&gt;` → `<`/`>`, `&quot;` → `"`).
3. Collapses excess whitespace.

Apply at the mapping boundary — `mapListItemToSpotlight()` line 247:

```typescript
summary: stripHtml(raw.Summary)?.trim() || '',
```

This keeps the normalization pipeline (`operationalAwarenessConfig.ts`) and the component (`ProjectPortfolioSpotlight.tsx`) untouched. The contract (`ProjectPortfolioSpotlightItem.summary: string`) remains plain text as designed.

**Why at the list source, not the normalizer:** The list source is the system boundary where external data enters the application. Sanitization belongs at ingestion, not downstream. The normalizer and component already assume `summary` is clean text — fixing at the source preserves that invariant.

---

## 5. Edge cases to preserve

| Edge case | Expected behavior |
|-----------|-------------------|
| Manifest seed data (plain text) | `stripHtml` on plain text is a no-op — safe |
| Empty / null `Summary` | Already handled by `?.trim() \|\| ''` — `stripHtml` should tolerate `undefined` |
| Nested HTML tags (`<p><strong>text</strong></p>`) | Must extract inner text content, not just strip outer tag |
| HTML entities (`&amp;`, `&nbsp;`, `&#39;`, `&lt;`, `&quot;`) | Must decode to plain-text equivalents |
| Line breaks (`<br>`, `<br/>`) | Should convert to space or newline, not silently drop |
| SharePoint `<div>` wrappers around paragraphs | Must strip all block-level tags |
| Very long HTML content | Stripping should not change the downstream line-clamp truncation behavior |
| Non-HTML string that contains `<` or `>` (e.g., math expressions) | Acceptable loss — SharePoint Enhanced Rich Text will always return HTML-wrapped content; raw `<`/`>` would be entity-encoded by SharePoint |

---

## 6. Execution recommendation

The Phase 03 prompts should execute in order as designed:

| Order | Prompt | Status | Notes |
|-------|--------|--------|-------|
| 1 | P07-01 — Root-cause audit | **Complete** (this document) | Both root causes identified |
| 2 | P07-02 — PrimaryImage remediation | **Already complete** (commit `c4fbc024`) | Skip or close with reference |
| 3 | P07-03 — Summary HTML normalization | **Open** | Implement `stripHtml()` in `projectSpotlightListSource.ts` |
| 4 | P07-04 — End-to-end validation and closure | **Open** | Validate both fixes in packaged SharePoint-hosted output |
