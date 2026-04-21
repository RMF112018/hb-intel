# 07 — Prioritized Enhancement and Redesign Plan

## Priority 1 — Correct the flagship hero itself

### 1. Rebuild image control as a focal-zone system
Do not keep relying on `background-position: center center` plus a generalized scrim.
Implement:
- approved image inventory
- focal metadata
- protected text-safe region
- protected logo-safe region
- crop-aware mode behavior

### 2. Rework contrast control
Implement image-aware readability treatment:
- stronger but cleaner left-zone protection
- less generic brighten on the right
- explicit approval criteria for greeting, tagline, and logo across the image set

### 3. Fix doctrine drift in fallback mode
Replace the current visible blue/orange fallback pools with:
- deep charcoal
- restrained warmth
- grain / materiality
- no enterprise banner wash behavior

### 4. Re-tune logo lockup behavior
The logo needs mode-specific composition rules, not only size clamps.
Desktop, tablet, and handheld should not share the same conceptual placement strategy.

## Priority 2 — Tighten top-band integration

### 5. Make hero + launcher read as one authored flagship zone
Tighten:
- vertical rhythm
- gap logic
- shared material language
- visual continuity between hero base and launcher start
- breakpoint-specific continuity rules

### 6. Build breakpoint-native tablet and handheld hero modes
Smaller states should not feel like compressed desktop.
They should:
- show less
- anchor more deliberately
- protect readability first
- preserve brand authority without overloading the surface

## Priority 3 — Raise validation to closure-grade

### 7. Produce real hosted proof
Require:
- hosted screenshots at the same audited matrix
- explicit contrast sign-off
- packaged-result sign-off
- regression notes
- proof that the hero still respects first-lane-first-view expectations

### 8. Add regression coverage
At minimum:
- selector/daypart tests
- breakpoint-state tests
- lockup/fallback assertions
- screenshot review protocol
