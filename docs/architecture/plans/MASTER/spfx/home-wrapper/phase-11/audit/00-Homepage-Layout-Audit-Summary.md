# Homepage Layout Audit Summary

## Objective
Audit the live HB Homepage implementation on `main` and determine exactly what must change below the launcher so the homepage body renders only the approved six applications in the requested three-row alternating asymmetric composition.

## Target state
Below the launcher, the homepage body must render only:
1. Project Portfolio Spotlight
2. hbKudos
3. Safety
4. Newsroom / Company Pulse
5. Leadership Message
6. People Culture

Required non-handheld rows:
- Row 1: Project Portfolio Spotlight (large) + hbKudos (small)
- Row 2: Safety (small) + Newsroom / Company Pulse (large)
- Row 3: Leadership Message (large) + People Culture (small)

## Executive verdict
The current implementation is **not a cosmetic miss**. It is a structural mismatch, and the preset is materially more degraded than the prior phrasing of this audit implied.

What is already good:
- The wrapper/shell/launcher split is clean and the shell is container-aware and container-queried.
- The shell uses a real typed composition model (preset + recipes + occupant registry + validation + conformance reporting).
- The live occupant registry is already narrowed to the six target application families.
- Multiple paired recipes and multiple paired ratios already exist (`feature-pair`, `balanced-two-up`, `asymmetric-two-up`, `feature-utility-strip`), with recipe-specific ratios that scale up to a true ~2:1 at ultrawide.

What is materially wrong (validated against `main`):
- The default preset **duplicates Company Pulse across three bands** (`defaultPreset.ts`: `slot-company-pulse`, `slot-company-pulse-newsroom`, `slot-company-pulse-safety`). HB Kudos is pinned to a `stacked-full` recognition band, not paired. The current live row sequence has six bands, not the target three.
- Pairing is expressible in only one direction: `DominanceRule` in `shellTypes.ts` is `'left-dominant' | 'equal' | 'single'`. There is no `right-dominant` — Row 2's small-left / large-right arrangement cannot be expressed.
- The approximately-2:1 target ratio is reached only at `>=1900px` (`feature-pair` = 10fr 5fr, `asymmetric-two-up` = 8fr 4fr). At `1180–1599px` (the common laptop/desktop band) the paired ratios land at 1.5:1–1.75:1 — materially weaker than the intended premium dominance.
- Three of the requested row pairings are illegal under current occupant governance:
  - **Row 1 (PPS + Kudos):** HB Kudos `allowedBandSemantics: ['recognition']` (not `operational-spotlight`), `prominenceCeiling: 'contextual'`, `firstLaneEligible: false`, `protectedConstraints: ['recognition-cannot-be-primary-anchor']`. Project Portfolio Spotlight is `operational-spotlight` only and `reorderDomain: 'locked'`.
  - **Row 2 (Safety + CP, right-dominant):** Safety `allowedBandSemantics: ['operational-spotlight']` only — not `communications-newsroom`. Requires handedness support the shell type system does not yet model.
  - **Row 3 (Leadership + PCP):** People & Culture Public `allowedSlotRoles: ['primary']`, `pairedLayoutEligible: false`, `fallbackWhenUnsafe: 'deny-pairing'`, `protectedConstraints: ['people-culture-must-stack']`, `pairingRestrictions: ['hb-kudos']`. Actively forbidden from pairing at the governance layer.
- Protected band semantics preserve the current arrangement rather than the requested target arrangement.

## Bottom line
The homepage is already organized around a serious shell architecture, but the architecture is still pointed at the wrong composition model and the default preset is internally inconsistent (triplicated Company Pulse, stacked-full Kudos). The work now required is:
1. replace the preset with the exact locked three-row target,
2. add row-handedness/orientation support to `ShellTypes`, preset schema, validation, conformance, and CSS,
3. revise occupant governance so the requested pairings are explicitly legal and protected,
4. then harden the hosted surfaces that must survive in the secondary slot.

Wave-01 and Wave-02 execution plans already live alongside this audit in `../wave-01/` and `../wave-02/`; they reflect the validated correction direction in this package.
