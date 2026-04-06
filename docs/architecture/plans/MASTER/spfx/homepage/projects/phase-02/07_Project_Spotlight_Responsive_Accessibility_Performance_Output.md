# Project Spotlight — Responsive, Accessibility, and Performance Hardening Output

**Phase:** P06-07 — Responsive, accessibility, and performance hardening
**Date:** 2026-04-06
**Status:** Complete

---

## 1. Files changed

| File | Action | Purpose |
|------|--------|---------|
| `apps/hb-webparts/src/homepage/shared/usePrefersReducedMotion.ts` | **Created** | Reusable hook that detects `prefers-reduced-motion: reduce` and listens for dynamic changes. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` | **Modified** | Added reduced-motion support, CLS containment, aria-haspopup, motion discipline. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | **Modified** | Version bumped to `0.0.7.0`. |

---

## 2. Breakpoint validation summary

| Breakpoint | Featured | Rail | Team detail | Image crop |
|------------|----------|------|-------------|------------|
| **Desktop** (≥1200px) | 68% dominant, 52% image zone, 320px minHeight | 28% subordinate, right column | Popover anchored below strip | `cover` / `center` — intentional |
| **Tablet** (768–1199px) | Full-width, 44% image zone, 280px minHeight | Full-width below featured | Popover anchored below strip | `cover` / `center` — intentional |
| **Mobile** (≤767px) | Full-width, stacked vertical, 220–280px image | Full-width stacked below | Bottom-sheet with backdrop | `cover` / `center` — intentional |

Featured item always renders first at all breakpoints. Rail always renders subordinate below or beside.

---

## 3. Accessibility validation summary

| Feature | Status | Detail |
|---------|--------|--------|
| `prefers-reduced-motion` | **Added** | New `usePrefersReducedMotion` hook. All three motion configs (featured reveal, rail reveal, bottom-sheet) suppressed when user prefers reduced motion. |
| `aria-haspopup="dialog"` | **Added** | Team strip button now declares it opens a dialog. |
| `aria-expanded` | Verified | Team strip button tracks open/closed state. |
| `role="dialog"` | Verified | Team detail panel has dialog role with label. |
| Escape close | Verified | Closes team panel, returns focus to trigger. |
| Outside-click close | Verified | Closes on click outside panel + trigger. |
| Focus return | Verified | Focus returns to trigger button on close. |
| Keyboard focus order | Verified | Natural tab order: header CTA → featured content → team strip → rail tiles. |
| Focus-visible | Verified | CSS module `.teamStripButton` provides focus-visible outline. |
| Touch targets | Verified | All interactive elements maintain `minHeight: 44px`. |
| Alt text | Verified | All images maintain alt text. SafeAvatar/FeaturedImage/RailThumbnail preserve it. |
| Non-hover dependency | Verified | All interactive content accessible via click/tap. Hover is enhancement only. |

---

## 4. Performance summary

| Optimization | Implementation |
|-------------|---------------|
| **CLS containment — featured image** | `contain: layout style` on image zone prevents layout reflow during image load. |
| **CLS containment — rail thumbnails** | `contain: strict` on 80×60 thumbnail wrapper. Fixed dimensions prevent any shift. |
| **Image loading** | `loading="lazy"` + `decoding="async"` on all images (unchanged, verified). |
| **Image fallback** | `onError` handlers suppress broken-image display instantly (P06-03, verified). |
| **Motion efficiency** | Framer Motion animations use GPU-friendly `opacity` and `transform: translateY` only. No layout-triggering properties animated. |
| **Reduced motion** | All entry animations fully suppressed when `prefers-reduced-motion: reduce` — no wasted animation frames. |
| **Bundle impact** | New hook adds ~0.6 kB. Total: 474.60 kB (from 474.00 kB). |
| **SharePoint realism** | No heavy effects (parallax, video, canvas). All styles inline or CSS module — no runtime CSS-in-JS. Fetch uses single REST call with `$top=20`. |

---

## 5. Validation

| Check | Result |
|-------|--------|
| `pnpm check-types` | Pass — no type errors |
| `pnpm lint` | Pass — no errors or warnings |
| `pnpm build` | Pass — 4352 modules, 474.60 kB |
| Breakpoints | Featured-first hierarchy maintained at desktop (68/28), tablet (full-width stacked), mobile (vertical stack) |
| Accessibility | prefers-reduced-motion supported, aria-haspopup added, all existing a11y behaviors verified intact |
| Performance | CLS containment on image zones, no layout-triggering animations, lazy loading preserved |
| Motion discipline | All motion suppressed for reduced-motion users; animations remain GPU-friendly (opacity + translateY) |
