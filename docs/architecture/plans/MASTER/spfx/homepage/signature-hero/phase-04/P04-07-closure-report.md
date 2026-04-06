# P04-07 Closure Report — Strengthen Right-Side Luminance Overlay

**Date:** 2026-04-06
**Version:** 1.0.0.84

## Objective

Strengthen the existing right-side luminance treatment on the Signature Hero to improve full-color logo legibility and separation from the background image.

## Changes — CSS Only

Single file changed: `signature-hero.module.css` — tuned the `.brighten` layer values.

### Linear gradient (broad right-side lift)

| Stop | Before (P04-06) | After (P04-07) |
|------|-----------------|-----------------|
| Start | transparent 25% | transparent 25% (unchanged) |
| Mid | 0.10 at 65% | **0.14 at 60%** |
| End | 0.18 at 100% | **0.26 at 100%** |

Far-right lift increased from 18% to 26% white overlay (~44% stronger). Mid-point shifted left by 5% and strengthened for smoother ramp.

### Radial highlight (localized logo zone)

| Property | Before (P04-06) | After (P04-07) |
|----------|-----------------|-----------------|
| Alpha | 0.07 | **0.13** |
| Ellipse | 40% 60% | **45% 65%** |
| Position | 85% 50% | **84% 48%** |

Highlight nearly doubled in strength (7% → 13%), slightly enlarged for broader diffusion, repositioned marginally for better logo zone coverage.

### Combined perceived effect

- Far-right region: ~26% gradient + ~13% radial ≈ **~35% peak perceived luminance lift**
- Left side (0–25%): unchanged (transparent)
- Transition remains smooth with no visible banding

## Files Changed

| File | Change |
|------|--------|
| `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css` | Tune `.brighten` gradient and radial values |
| `tools/spfx-shell/config/package-solution.json` | Version → 1.0.0.84 |

## Verification

| Check | Scope | Result |
|-------|-------|--------|
| `tsc --noEmit` | `@hbc/spfx-hb-webparts` | Pass |
| `eslint src/` | `@hbc/spfx-hb-webparts` | Pass |
| `vite build` | `@hbc/spfx-hb-webparts` | Pass (452.67 KB JS / 20.56 KB CSS) |
| Clean rebuild | All stale artifacts removed | Confirmed |
| `build-spfx-package` | `.sppkg` generated | 2,946.9 KB |
| `supportsFullBleed: true` | Hero manifest | Preserved |

## What Was NOT Changed

- TSX component structure unchanged
- Left-side text exposure unchanged
- Background image (cover + center-crop) unchanged
- Hero height unchanged
- Text order unchanged
- Logo styling unchanged (full-color, no filter)
- Property-pane background override unchanged
- Runtime CSS loading unchanged
