# Wave 05 — Authoring, Sparse-State, and Governance Hardening (Completed)

> **Status:** Locked
> **Completed:** 2026-04-07
> **Source charter:** `Wave-05-Authoring-Sparse-State-and-Governance-Hardening.md`

---

## 1. Change Summary

Three governance and sparse-state defects fixed; four new test cases added covering sparse content, non-interactive items, invalid config, and category governance.

### Defects fixed

| Issue | Fix |
|-------|-----|
| **Empty meta row** — `.featuredMeta` rendered with border-top separator even when both byline and publishDate were missing | Conditionally render the entire meta row only when at least one metadata field exists |
| **Misleading cursor on non-clickable headlines** — `.headlineItem` had `cursor: pointer` even when no CTA/href existed | Added `.headlineItemStatic` CSS class without cursor/hover/focus-visible; HeadlineItem selects class based on whether CTA href exists |
| **Fabricated category chips** — TertiaryZone defaulted `item.category ?? 'update'`, displaying a category label the author never configured | Filter tertiary items to only those with an authored category; skip items without category instead of fabricating one |

### Files changed

| File | Change |
|------|--------|
| `NewsroomFeaturedStory.tsx` | Conditional meta row rendering |
| `NewsroomHeadlineStack.tsx` | `isClickable` class selection for headline items |
| `newsroom-surface.module.css` | Added `.headlineItemStatic` class |
| `newsroom-surface.module.css.d.ts` | Added `headlineItemStatic` type |
| `CompanyPulse.tsx` | TertiaryZone filters items by authored category |
| `communicationsWebparts.test.tsx` | 4 new sparse-state and governance tests |
| `CompanyPulseWebPart.manifest.json` | Version bump to 0.0.22.0 |
| `package.json` | Version bump to 0.0.22 |

---

## 2. How Sparse-State Resilience Was Improved Without Flattening the Design

The premium surface hierarchy is fully preserved — no layout modes were removed, no zones were suppressed, no typography was weakened. The fixes are purely defensive:

- **Meta row** — the separator line and metadata container simply don't render when there's nothing to show, avoiding an orphaned border-top. When metadata is present, the same premium treatment applies.
- **Headline cursor** — non-clickable items render as `<div>` without pointer cursor or hover/focus effects, while clickable items retain full interactive CSS. The visual density and hierarchy are identical.
- **Category chips** — the tertiary zone only shows chips for items with real authored categories. If no tertiary items have categories but an `archiveHref` exists, the zone still renders with just the archive CTA.

---

## 3. Test Coverage Added

| Test | Validates |
|------|-----------|
| Lead story without metadata fields renders cleanly, no empty meta container | Sparse content: missing byline, publishDate, media, category |
| Headline items without CTA render as non-interactive elements | Governance: cursor/click behavior matches content model |
| Invalid config (empty titles) shows invalid state | Authoring safety: malformed items produce governed error state |
| Tertiary zone renders only authored categories, no fabricated chips | Governance: no fake category labels when author didn't configure one |

---

## 4. Remaining Limitations

- The newsroom CSS module type declaration (`.d.ts`) is manually maintained. If new classes are added to the CSS module, the type file must be updated in parallel.
- The `NewsroomPalette.ts` still exports parallel palette constants for the motion library (which cannot consume CSS custom properties). This is by design.

## 5. Build Readiness for Wave 06

- **check-types:** pass
- **lint:** pass (0 errors, 0 warnings)
- **build:** pass (547.53 KB JS, 31.02 KB CSS)
- **tests:** 26/26 pass on changed scope
- Ready for Wave 06 (Packaging, Validation, and SharePoint Proof)
