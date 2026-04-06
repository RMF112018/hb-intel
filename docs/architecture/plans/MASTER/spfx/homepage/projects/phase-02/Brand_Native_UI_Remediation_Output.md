# Project Spotlight — Brand-Native UI Remediation Output

**Date:** 2026-04-06
**Status:** Complete

---

## 1. Visual direction summary

The dark cinematic surface from the prior Big-UI pass is replaced with a **light premium brand-native surface** that uses HB brand colors (`#225391` blue, `#E57E46` orange) as the primary hierarchy engine. The result is a strong, authoritative spotlight that remains clearly part of the HB homepage family — compatible with adjacent webparts, the SharePoint page canvas, and the `@hbc/ui-kit` design system.

The hierarchy is driven by **blue-tinted depth layers**, **brand-colored structural accents**, and **stronger proportions/typography** — not by darkness or visual isolation.

---

## 2. Token usage summary

| Token / Color | Source | Usage |
|---------------|--------|-------|
| `#225391` (HB Primary Blue) | `HBC_HOMEPAGE_BRAND_FOUNDATION.primaryBlue` | Left border accent, header title, metadata icons, avatar initials bg, section separator start, shadow tint, image placeholder tint, rail background tint, tile hover, team strip bg, CLS containment bg |
| `#E57E46` (HB Secondary Orange) | `HBC_HOMEPAGE_BRAND_FOUNDATION.secondaryOrange` | Overflow avatar accent, image placeholder gradient end, rail placeholder gradient end, separator gradient mid, warm editorial accent |
| `HP_RADIUS.signature` (12px) | Homepage tokens | Root border-radius |
| `HP_RADIUS.card` (8px) | Homepage tokens | Rail thumbnail radius |
| `HP_RADIUS.image` (6px) | Homepage tokens | Tile radius |
| `HP_SPACE.*` | Homepage tokens | All spacing values |
| `HP_IMAGE.objectFit` | Homepage tokens | Image cover behavior |

All colors derived from `HBC_HOMEPAGE_BRAND_FOUNDATION` — no ad hoc palette invented.

---

## 3. Files changed

| File | Purpose |
|------|---------|
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` | Full palette replacement: dark DARK/WARM system → brand-native HB/BRAND system using `#225391`/`#E57E46` with tonal tints. Light surface, blue-tinted shadows, blue-accent left border, brand-colored scrim, blue-tinted rail background, brand-colored separators, metadata icons, avatar/initials styling, all text hierarchy on light. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | Version bumped to `0.0.11.0`. |

---

## 4. Structural UI summary

| Element | Dark (removed) | Brand-native (new) |
|---------|---------------|-------------------|
| Root background | `hsl(220, 14%, 12%)` charcoal | `#ffffff` white |
| Root border-left | `rgba(229,126,70,0.50)` orange | `4px solid #225391` brand blue |
| Root shadow | Dark opacity (0.18/0.14) | Blue-tinted `rgba(34,83,145,0.06/0.08)` |
| Text primary | White 0.95α | `#1a1a1a` dark |
| Text secondary | White 0.70α | Dark 0.68α |
| Header title | Orange accent uppercase | `#225391` blue, 0.875rem, weight 700 |
| Separator | Orange accent gradient | Blue→orange brand gradient |
| Image scrim | Black 0.55α | Blue 0.65α (brand-tinted readability) |
| Image placeholder | Dark gradient | Blue+orange tint gradient |
| Rail background | `hsl(220,12%,16%)` dark raised | `rgba(34,83,145,0.04)` blue tint |
| Rail hover | Dark hover bg | `rgba(34,83,145,0.06)` blue hover |
| Rail tile divider | White 0.06α | `rgba(34,83,145,0.08)` blue |
| Thumbnail bg | Dark `hsl(220,12%,10%)` | `rgba(34,83,145,0.04)` blue tint |
| Thumbnail placeholder | Dark gradient | Blue+orange gradient |
| Rail title | White | `#1a1a1a` dark |
| Rail meta | White muted | Dark 0.48α |
| Metadata icons | Orange accent | `#225391` blue brand |
| Team strip bg | White 0.04α | `rgba(34,83,145,0.03)` blue |
| Avatar border | Dark bg ring | White ring + dark shadow |
| Initials | Orange on dark | Blue on light (`#225391`) |
| Overflow badge | Orange on dark | Orange on light (`#E57E46`) |
| Detail panel shadow | Heavy dark (0.24/0.12) | Blue-tinted `rgba(34,83,145,0.12)` |

**Preserved from Big-UI pass:** 2rem title, 56% image zone, 380px minHeight, 88×66 thumbnails, expo-out motion, 70/30 split, rail translateX hover.

---

## 5. Validation evidence

| Check | Result |
|-------|--------|
| `pnpm check-types` | Pass — no type errors |
| `pnpm lint` | Pass — no errors or warnings |
| `pnpm build` | Pass — 4352 modules, 475.13 kB |
| Light surface | Root `#ffffff` with blue-tinted shadow, no dark takeover |
| Brand colors | All structural colors derive from `#225391`/`#E57E46` with alpha tints |
| Token alignment | HP_SPACE, HP_RADIUS, HP_IMAGE tokens used for all spacing/radius/sizing |
| Typography | 2rem title, `#1a1a1a` primary, 0.68α secondary — strong hierarchy on light |
| Rail separation | Blue-tinted `rgba(34,83,145,0.04)` background creates visible zone distinction |
| No dark mode | Zero dark-surface values remain |

---

## 6. Family-alignment note

The result is stronger **without** becoming visually dissimilar because:

1. **All colors come from the shared brand system** — `#225391` (blue) and `#E57E46` (orange) are the same values used by the Signature Hero, Company Pulse, and other homepage webparts via `HBC_HOMEPAGE_BRAND_FOUNDATION`.
2. **The surface is light** — white background, dark text, consistent with the SharePoint page canvas and all other homepage webpart surfaces.
3. **Blue-tinted shadows and borders** create cohesion with the HP_BORDER, HP_FOCUS, and HP_CTA brand tokens that govern the rest of the homepage.
4. **The rail uses the same subtle blue tint** (`rgba(34,83,145,0.04)`) that `HP_ZONE.operational` uses for the operational awareness zone — staying in the same tonal family.
5. **The scrim is blue-tinted** rather than pure black, creating a branded image treatment that feels coherent with the HB Hero gradient language.
6. **Typography, spacing, and radius** all use the shared `HP_*` tokens unchanged.

The webpart is now premium and authoritative while remaining a natural sibling of every other HB homepage surface.
