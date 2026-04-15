# Wave 02 validation strategy

## Required test posture
Every prompt in this wave must validate:
- happy-path authoring
- partial / empty / error states
- keyboard interaction
- SPFx-host-safe behavior
- no regression in existing save / publish truthfulness

## Minimum state matrix
1. New unsaved draft
2. Persisted draft with no validation blockers
3. Persisted draft with warnings
4. Persisted draft with blocking errors
5. Partially failed save (master row committed, child row failed)
6. Lost-focus / close-tab / in-app navigation while dirty
7. Preview available vs unavailable vs blocked
8. Media acquisition success vs cancelled vs invalid/broken asset

## Evidence expectations
- Document exactly what changed.
- Record what was intentionally preserved.
- Record what regression checks were run.
- Record any bounded known limitation that is truly outside Wave 02.

## Hard stop
No prompt in this wave is closed merely because the code compiles.
