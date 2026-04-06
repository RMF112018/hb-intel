# Project Spotlight — Supporting Rail and Team Strip Refinement Output

**Phase:** P06-05 — Supporting rail and team strip refinement
**Date:** 2026-04-06
**Status:** Complete

---

## 1. Files changed

| File | Action | Purpose |
|------|--------|---------|
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` | **Modified** | Refined rail tile styling, thumbnail size, hover behavior, team strip presentation, avatar treatment, team flyout panel, and rail header copy. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | **Modified** | Version bumped to `0.0.5.0`. |

---

## 2. Rail refinement summary

### Thumbnail presence
- Thumbnail size increased from 72x54 to 80x60 for stronger gallery feel
- RailThumbnail component dimensions updated to match

### Tile spacing and hierarchy
- Tile gap increased from `HP_SPACE.lg` (10px) to `HP_SPACE.xl` (12px)
- Tile padding increased from `lg/lg` to `xl/xl` for more breathing room
- Tile alignment changed from `flex-start` to `center` for better thumbnail/content relationship
- Added `borderRadius: HP_RADIUS.image` to tiles for softer card-like edges
- Content gap increased from 3px to 4px
- Rail title letter-spacing refined to `-0.01em` for tighter editorial feel

### Hover behavior
- Hover background tint strengthened from `0.03α` to `0.04α`
- Added subtle `boxShadow: 0 1px 4px rgba(0,0,0,0.04)` on hover for gallery lift
- Added `box-shadow` to transition list for smooth interaction

### Rail header
- Text changed from "Also in progress" to "More projects" — simpler, more curated
- Weight softened from 700 to 600
- Letter-spacing widened to `0.05em` for quieter presence
- Color softened from `0.40α` to `0.36α`
- Padding adjusted for better rhythm with new tile spacing

---

## 3. Team strip / flyout refinement summary

### Team strip
- Label copy changed from "X team" to "X members" / "1 member" (warmer, more descriptive)
- Strip background: added subtle warm tint `rgba(229,126,70,0.03)` for intentional warmth
- Border radius: 20px → 22px for softer pill shape
- Padding: `4px 8px` → `5px 10px 5px 4px` for better balance around avatars
- Label margin-left: 4px → 6px for breathing room
- Label color: `0.50α` → `0.45α` — slightly quieter

### Avatar treatment
- Overlap: `-8px` → `-6px` for less aggressive stacking
- Added `boxShadow: 0 0 0 1px rgba(0,0,0,0.06)` ring for depth separation
- Initials background: `0.10α` → `0.08α` — slightly softer blue tint
- Overflow badge: margin-left matched to `-6px`, background `0.10α` → `0.08α`
- Icon opacity: `0.5` → `0.45`, marginRight: `3px` → `4px`

### Team flyout
- Detail avatar size: 36px → 40px for more human presence
- Detail panel min/max width: desktop 240/300 → 260/320 for comfortable reading
- Panel border-radius: `HP_RADIUS.card` (8px) → `HP_RADIUS.editorial` (10px)
- Panel shadow: `0 4px 16px 0.10` → `0 6px 20px 0.10` for softer depth
- Header: weight 700 → 600, color `0.40α` → `0.36α`, added bottom border separator
- Header padding: `10px 14px 8px` → `12px 14px 10px`
- Detail item gap: 10px → 12px, padding: `6px 14px` → `8px 14px`
- Detail avatar: added `boxShadow: 0 0 0 1px rgba(0,0,0,0.06)` ring
- Detail list padding: `0 0 6px` → `4px 0 8px` for top/bottom breathing room

---

## 4. Validation

| Check | Result |
|-------|--------|
| `pnpm check-types` | Pass — no type errors |
| `pnpm lint` | Pass — no errors or warnings |
| `pnpm build` | Pass — 4351 modules, 473.68 kB |
| Rail subordination | Rail remains clearly secondary: 28% desktop width, smaller thumbnails than featured, quieter header, no competing CTA hierarchy |
| Team interaction — desktop | Strip + popover architecture preserved. Escape close, outside-click close, focus return all unchanged |
| Team interaction — mobile | Bottom-sheet architecture preserved. Backdrop tap close, motion animation unchanged |
| Accessibility | No changes to ARIA attributes, keyboard handling, focus management, or screen reader behavior. Avatar alt text preserved. minHeight 44px touch targets maintained |
