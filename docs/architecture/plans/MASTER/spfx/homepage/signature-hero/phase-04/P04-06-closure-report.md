# P04-06 Closure Report — Right-Side Brightening Overlay

**Date:** 2026-04-06
**Version:** 1.0.0.83

## Objective

Add a directional luminance lift to the right side of the hero background to improve full-color logo legibility against the dark scrim, without washing out the image or changing the left-side text exposure.

## Implementation

### New layer: `.brighten`

A new absolute-positioned overlay layer sits above the scrim/grain and below the content (z-index 1, with content bumped to z-index 2).

The layer uses two composited backgrounds:
1. **Directional gradient** — left-to-right from transparent (25%) to `hsla(0 0% 100% / 0.18)` (100%). Provides the primary right-side brightness lift.
2. **Radial highlight** — diffused ellipse (`40% 60%` at `85% 50%`) with `hsla(0 0% 100% / 0.07)`. Adds a soft, localized luminance boost behind the logo zone without creating a visible spotlight artifact.

### Layer stack (after change)

| Z-Order | Layer | Purpose |
|---------|-------|---------|
| — | `.photo` | Background image |
| — | `.scrim` | Readability gradient (bottom-heavy) |
| — | `.grain` | Material grain texture |
| 1 | **`.brighten`** | **NEW — right-side luminance overlay** |
| 2 | `.content` | Text-left / logo-right composition |

### Perceived brightness lift

- Left side (0–25%): unchanged (transparent)
- Center-right (65%): ~10% white overlay
- Far right (100%): ~18% white overlay + ~7% radial boost ≈ **20–25% perceived luminance lift**

This falls within the 15–35% target range and reads as a natural exposure bias rather than a synthetic gradient.

## Files Changed

| File | Change |
|------|--------|
| `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css` | Add `.brighten` overlay, bump `.content` z-index to 2 |
| `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx` | Add `<div className={styles.brighten}>` between grain and content |
| `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css.d.ts` | Add `brighten` type declaration |
| `tools/spfx-shell/config/package-solution.json` | Version → 1.0.0.83 |

## Verification

| Check | Scope | Result |
|-------|-------|--------|
| `tsc --noEmit` | `@hbc/spfx-hb-webparts` | Pass |
| `eslint src/` | `@hbc/spfx-hb-webparts` | Pass |
| `vite build` | `@hbc/spfx-hb-webparts` | Pass (452.67 KB JS / 20.56 KB CSS) |
| Clean rebuild | All stale artifacts removed first | Confirmed |
| `build-spfx-package` | `.sppkg` generated | 2,946.9 KB |
| `brighten` class in emitted CSS | CSS marker check | Present |
| `banner_home_7.png` in sppkg | ClientSideAssets | 2,862,677 bytes |
| `supportsFullBleed: true` | Hero manifest | Preserved |

## What Was NOT Changed

- Left-side text exposure unchanged
- Background image (cover + center-crop) unchanged
- Hero height unchanged (256px desktop / 200px phone)
- Text order (greeting → tagline) unchanged
- Logo styling (full-color, no filter) unchanged
- Property-pane background override unchanged
- Runtime CSS loading unchanged
- No packaging pipeline changes
