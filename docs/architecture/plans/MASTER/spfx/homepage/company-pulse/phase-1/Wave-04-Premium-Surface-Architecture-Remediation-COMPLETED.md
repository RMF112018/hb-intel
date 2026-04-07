# Wave 04 — Premium Surface Architecture Remediation (Completed)

> **Status:** Locked
> **Completed:** 2026-04-07
> **Source charter:** `Wave-04-Premium-Surface-Architecture-Remediation.md`

---

## 1. Change Summary

Replaced the inline-style-object architecture across all four newsroom files with a dedicated CSS module system (`newsroom-surface.module.css`). Every `getXStyle()` helper, `const xStyle: React.CSSProperties`, and ad-hoc hover-state management has been removed. Structural styling, responsive tiers, hover/focus-visible states, and reduced-motion support are now handled entirely by CSS classes.

### Files changed

| File | Change |
|------|--------|
| `newsroom-surface.module.css` | New — 290+ lines of CSS module covering root, header, featured story, headline stack, category chip, tertiary zone, sparse layout, responsive tiers, hover/focus-visible, and reduced-motion |
| `newsroom-surface.module.css.d.ts` | New — TypeScript type declaration for 53 CSS class exports |
| `NewsroomFeaturedStory.tsx` | Rebuilt — all inline styles replaced with CSS module classes; image components simplified; tier-aware classes instead of style-object functions |
| `NewsroomHeadlineStack.tsx` | Rebuilt — hover/focus-visible handled by CSS `:hover` and `:focus-visible` pseudo-classes instead of React `useState` + inline style swap; all layout styles via CSS module |
| `NewsroomCategoryChip.tsx` | Rebuilt — structural chip styling via CSS module classes (`chipSm`/`chipMd`); only dynamic category colors remain inline (they vary per category) |
| `CompanyPulse.tsx` | Rebuilt — all `rootStyle`, `getHeaderStyle()`, `getCompositionStyle()`, `getFeaturedWrapperStyle()`, `getRailWrapperStyle()`, inline-style TertiaryZone/SparseLayout replaced with CSS module classes; tier selection uses class names not style objects |
| `CompanyPulseWebPart.manifest.json` | Version bump to 0.0.21.0 |
| `package.json` | Version bump to 0.0.21 |

---

## 2. How the Surface Moved Beyond the Inline-Style Ceiling

### Before (Wave 03)
- 8 `const xStyle: React.CSSProperties` objects in CompanyPulse.tsx
- 4 `getXStyle(tier)` functions returning conditional style objects
- `NewsroomHeadlineStack` used `useState` to toggle between `headlineItemStyle` and `headlineItemHoverStyle` on mouse events
- `NewsroomFeaturedStory` had 5 style-helper functions
- No `:hover` or `:focus-visible` pseudo-class support — everything was inline
- `@media (prefers-reduced-motion)` not in use — motion gating was JS-only

### After (Wave 04)
- **Zero inline style constants** in CompanyPulse.tsx
- **Zero `getXStyle()` functions** — replaced with tier-conditional class names
- **CSS `:hover` and `:focus-visible`** handle interaction states — no React state for hover
- **`@media (prefers-reduced-motion: reduce)`** in CSS module disables transitions
- **CSS custom properties** (`--nr-blue`, `--nr-blue-rgb`, `--nr-text-1` etc.) define the palette once at `.root` level
- Only truly dynamic values remain inline: category chip colors (vary per category enum)
- **`composes`** used in CSS module for tier variants (e.g. `railMobile composes rail`)

### Architecture quality improvement

| Aspect | Wave 03 | Wave 04 |
|--------|---------|---------|
| Style system | Inline objects + getXStyle helpers | CSS module + CSS custom properties |
| Hover states | `useState` + onMouseEnter/Leave | CSS `:hover` pseudo-class |
| Focus states | None | CSS `:focus-visible` with brand blue outline |
| Reduced motion | JS-only via hook | CSS `@media` + JS hook for motion library |
| Typography | Inline font-size/weight per element | CSS classes with consistent scale |
| Responsive | `getXStyle(tier)` returning different objects | `isMobile ? s.xMobile : s.x` class selection |
| Separation | Presentation mixed into component logic | Presentation in CSS, behavior in TSX |

---

## 3. Remaining Limitations

- Category chip colors remain inline because they are dynamic per-category enum value — this is the correct approach (CSS module classes can't receive runtime color arguments).
- The `NewsroomPalette.ts` still exports palette constants used by the CSS module via matching values — these are parallel by design (CSS module owns the styles, TS module provides motion token values for the motion library which cannot consume CSS custom properties).
- The newsroom CSS module is local to `apps/hb-webparts` — promotion to `@hbc/ui-kit` would require proven reuse by 2+ non-homepage consumers.

## 4. Build Readiness for Wave 05

- **check-types:** pass
- **lint:** pass (0 errors, 0 warnings)
- **build:** pass (547.42 KB JS ↓1.6 KB, 30.89 KB CSS ↑5.9 KB — net shift from JS to CSS)
- **tests:** 22/22 pass on changed scope
- Ready for Wave 05 (Authoring, Sparse-State, and Governance Hardening)
