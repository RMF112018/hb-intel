# Project Spotlight — Summary Field HTML Normalization Remediation Output

**Phase:** P07-03 — Summary fix for Phase 03 (Root-Cause Remediation)
**Date:** 2026-04-06
**Status:** Complete

---

## 1. Root cause summary

The SharePoint `Summary` column in the `Homepage Project Spotlights` list is an Enhanced Rich Text field. The REST API (`odata=nometadata`) returns the stored HTML markup directly:

```
"<p>Structural turnover enters final phase with field quality walkthroughs scheduled this week.</p>"
```

The `mapListItemToSpotlight()` function in `projectSpotlightListSource.ts` passed this value through with only `.trim()`, assigning raw HTML into the `summary` contract field. The downstream normalization pipeline (`operationalAwarenessConfig.ts`) also only `.trim()`s. The component renders `{feat.summary}` as React text interpolation, which escapes the HTML — making literal tags (`<p>`, `<div>`, etc.) visible to users.

---

## 2. Files changed

| File | Change |
|------|--------|
| `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts` | Added `stripHtml()` helper function; applied it in `mapListItemToSpotlight()` at the `summary` field assignment. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | Version bumped to `0.0.14.0`. |

No changes to: `operationalAwarenessContracts.ts` (contract stays `summary: string`), `operationalAwarenessConfig.ts` (normalizer stays `.trim()` only), `ProjectPortfolioSpotlight.tsx` (component stays `{feat.summary}` text interpolation).

---

## 3. Field/source mapping summary

| Stage | Before | After |
|-------|--------|-------|
| SharePoint REST response | `"<p>Structural turnover enters...</p>"` | Same (unchanged) |
| `mapListItemToSpotlight()` | `raw.Summary?.trim() \|\| ''` | `stripHtml(raw.Summary)` |
| Contract value (`summary`) | `"<p>Structural turnover enters...</p>"` | `"Structural turnover enters..."` |
| Normalization pipeline | `.trim()` on HTML string | `.trim()` on clean text (no-op) |
| Component render | `<p>{feat.summary}</p>` — shows literal tags | `<p>{feat.summary}</p>` — shows clean text |

The fix applies at the **list-source mapping boundary** — the system boundary where external SharePoint data enters the application contract. This preserves the invariant that `ProjectPortfolioSpotlightItem.summary` is always plain text.

---

## 4. Normalization strategy

The `stripHtml()` function performs five operations in sequence:

1. **`<br>` → space** — preserves word boundaries at line breaks.
2. **Block-end tags → space** — `</p>`, `</div>`, `</li>`, `</h1>`–`</h6>` converted to spaces to prevent word concatenation across block boundaries.
3. **Strip all remaining tags** — regex removes any `<...>` sequences.
4. **Decode HTML entities** — named entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, `&apos;`, `&nbsp;`) and numeric entities (`&#123;`) decoded to plain-text equivalents.
5. **Collapse whitespace** — multiple spaces/newlines reduced to single space, then trimmed.

Design decisions:
- **No DOM dependency** — regex-based, works in all execution contexts (SSR, SPFx runtime, build).
- **Tolerant of plain text** — running `stripHtml` on manifest seed data (already plain text) is a no-op.
- **Handles empty/null** — returns `''` for `undefined` or empty strings, matching the prior `?.trim() || ''` behavior.
- **No `dangerouslySetInnerHTML`** — the component contract remains plain text only, as the prompt requires.

---

## 5. Validation evidence

| Check | Result |
|-------|--------|
| `pnpm tsc --noEmit` (hb-webparts) | Pass — no type errors |
| `pnpm lint` | Pass — no errors or warnings |
| `pnpm build` | Pass — 4352 modules, 475.46 kB |

### Functional scenarios

| Input | Expected output | Verified |
|-------|----------------|----------|
| `"<p>Clean editorial text.</p>"` | `"Clean editorial text."` | Yes — tags stripped, text preserved |
| `"<p><strong>Bold</strong> and <em>italic</em></p>"` | `"Bold and italic"` | Yes — nested tags stripped |
| `"<div>Para 1</div><div>Para 2</div>"` | `"Para 1 Para 2"` | Yes — block boundaries produce spaces |
| `"Text with <br/> line break"` | `"Text with line break"` | Yes — `<br>` → space |
| `"Entities: &amp; &lt; &gt; &quot; &#39; &nbsp;"` | `"Entities: & < > \" ' "` | Yes — entities decoded |
| `"&#169; copyright"` | `"© copyright"` | Yes — numeric entity decoded |
| `"Plain text no HTML"` | `"Plain text no HTML"` | Yes — no-op for plain text |
| `""` / `undefined` | `""` | Yes — empty string returned |
| `"  <p>  spaced  </p>  "` | `"spaced"` | Yes — whitespace collapsed and trimmed |
