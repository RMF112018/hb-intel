# P15-02 — Shared Premium Surface System Rebuild — Closure Note

## What changed

The homepage shared surface system was rebuilt so that each surface family produces a materially distinct visual treatment, replacing the previous approach where all surfaces mapped to three near-identical card weights.

## Perception change (not just code)

### Before
All 10 homepage webparts rendered through `HbcHomepageSurfaceCard` → `HbcCard` with only three weight tiers (primary, standard, supporting). Visual differences were limited to slight shadow depth changes and barely-visible border accents. Zone backgrounds were set at 0.02–0.03 opacity — imperceptible on most displays. The result was a page of near-identical white rectangles.

### After
Each surface class now renders with its own background color, shadow depth, border treatment, padding rhythm, and border radius:

| Surface | Background | Shadow | Radius | Border | Character |
|---|---|---|---|---|---|
| hero | Brand-tinted (0.04) | Level 3 (deep) | 12px | 4px brand bottom | Commanding, high-impact |
| welcome | Brand-tinted (0.03) | Level 2 (raised) | 12px | 5px brand left + brand border | Signature, personal |
| editorial | Clean white | Level 1 (card) | 8px | 3px warm left accent | Magazine-like, curated |
| utility | Cool-tinted (0.025) | Level 0 → 1 on hover | 6px | Brand-tinted border | Dense, tool-like |
| operational | Cool-tinted (0.02) | Level 1 (card) | 8px | 4px brand left | Dashboard-adjacent |
| discovery | Warm-tinted (0.03) | Level 1 (card) | 10px | Warm-tinted border | Inviting, browsable |

Zone backgrounds are now set at 0.025–0.05 opacity — perceptible on standard displays.

## Components changed

### HbcHomepageSurfaceCard (`packages/ui-kit`)
- No longer delegates to `HbcCard` for rendering
- Each surface class gets its own complete Griffel style block with distinct background, shadow, border, padding, and radius
- Utility surface gains hover interaction (shadow lift + border strengthen)
- All transitions respect `prefers-reduced-motion`

### HbcHomepageIconFrame (`packages/ui-kit`)
- Added `xl` size (56×56px, 28px font, 10px radius) for premium/signature surfaces
- Added `accent` tint (strong brand blue, 0.12 opacity background) for command/utility zones
- Added `warm` tint (orange-toned, 0.10 opacity background) for editorial/discovery zones

### HbcHomepageSectionShell (`packages/ui-kit`)
- Added `accent` prop with three values: `brand` (default), `warm`, `neutral`
- Header now includes a 2px bottom accent bar in the zone's color family
- Section headers create visible hierarchy breaks between zones

### Homepage tokens (`apps/hb-webparts`)
- Zone backgrounds strengthened: topBand 0.03→0.05, utility transparent→0.025, communications 0.02→0.04, operational 0.02→0.035, discovery 0.015→0.03
- Added `HP_RADIUS.command` (6px), `HP_RADIUS.editorial` (10px), `HP_RADIUS.signature` (12px) for surface-family-aware radius
- Added `HP_BORDER.brandAccent` and `HP_BORDER.warmAccent` for zone-specific border treatments
- Added `HP_SPACE['4xl']` (28px) and `HP_SPACE['5xl']` (40px) for signature surfaces and zone separation
- `HP_WELCOME.accentWidth` increased from 4px to 5px

### Homepage entrypoint (`packages/ui-kit/src/homepage.ts`)
- Exports `SectionAccent` type
- Exports `HBC_HOMEPAGE_SURFACE_FAMILIES` constant describing each surface family's visual contract
- Extended `HBC_HOMEPAGE_BRAND_FOUNDATION.antiPatterns` with P15 anti-pattern register items

## API compatibility

All existing consumer APIs remain backward-compatible:
- `HbcHomepageSurfaceCard` still accepts the same `surface` prop values
- `HbcHomepageIconFrame` still accepts existing `size` and `tint` values; new values are additive
- `HbcHomepageSectionShell` has a new optional `accent` prop with default `'brand'`; existing consumers without the prop work unchanged

## Verification

- `@hbc/ui-kit` check-types: pass
- `@hbc/ui-kit` build: pass
- `@hbc/spfx-hb-webparts` check-types: pass
- `@hbc/spfx-hb-webparts` build: pass (338 KB, 2369 modules)
- `@hbc/ui-kit` lint: 1 pre-existing error (unrelated `useVoiceDictation.test.ts`), 1466 pre-existing warnings — no new issues
- `@hbc/spfx-hb-webparts` lint: pass

## Success criteria check

- [x] Each surface family materially differs in perceived quality from the old uniform card system
- [x] The rebuilt system can support later homepage redesign prompts without local hack styling
- [x] Accessibility and reduced-motion behavior remain intact (all transitions gated by `prefers-reduced-motion`)
- [x] Existing consumers compile and build without changes
