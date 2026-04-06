# Project Spotlight — Media Reliability and Image Fallback System Output

**Phase:** P06-03 — Media reliability and image fallback system
**Date:** 2026-04-06
**Status:** Complete

---

## 1. Files changed

| File | Action | Purpose |
|------|--------|---------|
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` | **Modified** | Added three internal safe-media components (`FeaturedImage`, `RailThumbnail`, `SafeAvatar`) and replaced all raw `<img>` tags with safe variants. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | **Modified** | Version bumped to `0.0.3.0`. |

---

## 2. Media-state matrix

### Featured project image

| State | Behavior |
|-------|----------|
| **Good image** | Image renders at full zone size with scrim overlay. Branded placeholder hidden behind. |
| **Slow image** | Branded gradient placeholder visible immediately. Image covers it when loaded. No flash or layout shift. |
| **Missing image** (no src) | Placeholder with "Project Image" text. Same branded gradient as slow-load state. |
| **Broken URL** | `onError` fires → img removed → branded placeholder with "Project Image" text remains visible. |

### Supporting rail thumbnail

| State | Behavior |
|-------|----------|
| **Good image** | 72×54 thumbnail renders normally in rail tile. |
| **Slow image** | Zone background (`rgba(0,0,0,0.025)`) visible during load. |
| **Missing image** (no src) | Branded gradient placeholder fills thumbnail slot. |
| **Broken URL** | `onError` fires → `RailThumbnail` switches to gradient placeholder. No broken-image icon. |

### Team avatar photos (strip + detail panel)

| State | Behavior |
|-------|----------|
| **Good photo** | Circular avatar renders at correct size (30px strip / 36px detail). |
| **Missing photo** (no URL) | Initials badge with blue tint background — same style used before. |
| **Broken photo URL** | `SafeAvatar` `onError` fires → seamlessly switches to initials badge. No broken-image icon. |

---

## 3. Implementation details

### Internal components (webpart-local, not promoted to ui-kit)

- **`FeaturedImage`** — Renders branded gradient placeholder absolutely positioned behind the `<img>`. On load, image naturally covers placeholder. On error, img is removed and placeholder remains. Uses `key={src}` at call site to reset error state when data changes.

- **`RailThumbnail`** — On error, switches from `<img>` to the existing `railThumbnailPlaceholderStyle` gradient div. Uses `key={src}` for state reset.

- **`SafeAvatar`** — Generic safe avatar for both strip (30px) and detail (36px) sizes. Accepts `imgStyle` and `fallbackStyle` props. On error, renders initials span using `getInitials()`. Uses `key={member.id}` for state reset.

### Design decisions

- No new dependencies. All safety uses React `useState` + `onError` event.
- No shimmer/skeleton animations — the branded gradient placeholders are premium and intentional per doctrine.
- No `onLoad` opacity transitions — keeps the implementation focused on reliability, not animation polish (reserved for P06-04).
- Focal/crop: the existing `objectPosition: 'center'` is retained. The `objectFit: 'cover'` crop behavior was already correct. No additional focal-point system was added because the current SharePoint list schema does not include focal-point metadata.

---

## 4. Validation

| Check | Result |
|-------|--------|
| `pnpm check-types` | Pass — no type errors |
| `pnpm lint` | Pass — no errors or warnings |
| `pnpm build` | Pass — 4351 modules, 473.33 kB |
| Broken-image suppression | `onError` handlers on all `<img>` tags. Verified: featured, rail, strip avatar, detail avatar. |
| Fallback visual quality | Featured: branded gradient with "Project Image" label. Rail: gradient fill. Avatars: blue-tinted initials badge. All use existing premium tone. |
| Accessibility | Alt text preserved on all images. Placeholder divs use `aria-hidden="true"`. Initials fallbacks use `aria-hidden="true"`. No change to keyboard navigation or screen reader behavior. |
| Layout stability | No CLS risk: featured placeholder uses same dimensions as image zone. Rail placeholder fills 72×54 wrapper. Avatar initials match photo dimensions exactly. |
