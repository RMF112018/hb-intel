# HB Kudos Wave 4 — Plan Summary

## Objective

Finish HB Kudos by reducing remaining drift risk, proving model-grade homepage quality, tightening validation, and preserving the correct runtime/manifest/package seams.

## Wave 4 target outcomes

### 1. Contain split-runtime drift risk
The split public / companion / legacy-adjacent posture may be justified, but it increases drift risk if it is not explicitly contained.
Wave 4 should make those boundaries clearer and safer.

### 2. Raise the surface to a model-grade standard
HB Kudos is already functionally advanced.
Wave 4 should ensure it now qualifies as a **reference-quality homepage surface** for future work, not merely a good one-off implementation.

### 3. Tighten validation and closure
The dev-harness and runtime validation foundations exist.
Wave 4 should make closure rigorous:
- lint
- typecheck
- runtime verification
- harness / Playwright coverage already available in the repo
- doctrine and regression checks
- packaged/runtime integrity checks

### 4. Preserve what is already correct
Registration and manifest adjacency are already correct.
Wave 4 should explicitly preserve and verify that rather than destabilize it.

## Recommended sequence

1. Lock Wave 4 scope and preserve prior-wave decisions.
2. Contain split-runtime / coexistence drift risk without destabilizing the product model.
3. Apply an explicit reference-surface quality bar and close any remaining gaps preventing HB Kudos from being a model-grade homepage surface.
4. Run final validation, packaging, and release-readiness closure.
5. Stop cleanly.

## What success looks like

Wave 4 is successful only if:
- split-runtime and legacy coexistence risk is contained
- HB Kudos can credibly serve as a model/reference homepage surface
- validation is materially tighter and not merely asserted
- manifest, mount, and package integrity remain intact
- the implementation is ready to persist as long-lived production code
