# Prioritized Homepage Recomposition Plan

## 1. Replace the preset with the actual required three-row model
### Gaps closed
GAP-01, GAP-09

### Implementation direction
Author a new default preset whose live bands are exactly:
- Row 1: Project Portfolio Spotlight (major) + HB Kudos (minor)
- Row 2: Safety (minor) + Company Pulse (major) — right-dominant
- Row 3: Leadership Message (major) + People & Culture Public (minor)

Eliminate the triplicated Company Pulse slots and the duplicated Leadership Message slot. Remove the standalone `recognition` and `people-culture` `stacked-full` bands.

Re-baseline `protectedDecisions.ts` so protected band semantics defend the new three-row arrangement rather than the old one.

### Impact
Immediately aligns the shell with the user's requested content order and removes the internally inconsistent duplication in `DEFAULT_PRESET`.

### Classification
Structural redesign

## 2. Add per-band handedness and stronger paired-ratio support at laptop/desktop widths
### Gaps closed
GAP-02, GAP-03

### Implementation direction
Extend shell types, preset schema, validation, conformance, and CSS so a band can declare:
- `left-dominant`
- `right-dominant`
- `equal`
- `single`

Extend `HbHomepageShell.module.css` with mirrored column templates for each paired recipe in right-dominant mode, plus tuned ratios at the 1180px and 1600px container tiers so `feature-pair` and `asymmetric-two-up` read closer to ~2:1 without regressing the ≥1900px treatment.

### Impact
Enables alternating asymmetric rows without semantic-role abuse and delivers a credible premium dominance across the non-handheld range.

### Classification
Structural redesign

## 3. Rework occupant legality rules to match the requested rows
### Gaps closed
GAP-04, GAP-05, GAP-06, GAP-07, GAP-11

### Implementation direction
Update `occupantRegistry.ts`, `protectedDecisions.ts`, and `shellValidation.ts` so:
- HB Kudos gains `operational-spotlight` band-semantic eligibility for the secondary slot and remains `firstLaneEligible: false` for primary; `recognition-cannot-be-primary-anchor` is retained.
- Safety gains `communications-newsroom` band-semantic eligibility (or the preset expresses Row 2 as a right-dominant operational-spotlight band — pick whichever keeps semantics honest).
- People & Culture Public gains `allowedSlotRoles: ['primary', 'secondary']`, `pairedLayoutEligible: true`, an overlapping band semantic with Leadership Message (e.g. `communications-editorial` or a new `people-culture-paired` semantic), retires `people-culture-must-stack`, and the PCP↔HB Kudos `pairingRestrictions` are explicitly re-validated or retired.
- First-lane resolution selects Row 1 deterministically without relying on Kudos promotion ranking.

### Impact
Removes the governance blocks that would otherwise reject the new preset at validation and keeps the shell's legality rules coherent rather than patched.

### Classification
Structural redesign

## 4. Harden secondary-slot surfaces for stable narrow behavior
### Gaps closed
GAP-06 (surface side), GAP-08

### Implementation direction
- **People & Culture Public:** add a real compact mode and verify stability at the 1180–1599px paired width, tuned for the Row 3 small-right slot.
- **HB Kudos:** drive validation and premium tuning in the already-supported `compact` / `summary-collapsed` modes for the Row 1 small-right slot; treat this as premium QA rather than new mode work.
- **Newsroom / Company Pulse + Safety pairing:** validate the Row 2 pairing end-to-end across the target width range.

### Impact
Makes the requested three-row composition stable across the full non-handheld target range instead of only at very wide desktop widths.

### Classification
Cross-layer redesign (PCP) + targeted refinement (Kudos validation + Row 2 validation)

## 5. Add closure-proof instrumentation and tests
### Gaps closed
GAP-10

### Implementation direction
Extend `shellConformance.ts` and `__tests__` coverage to prove:
- exact row order against the locked target,
- exact occupant membership per row,
- handedness alternation (left, right, left),
- large/small ratio behavior at the 1180px, 1600px, and 1900px container tiers,
- handheld stack fallback collapses to a disciplined single column,
- no horizontal overflow.

### Impact
Turns subjective layout review into inspectable closure, and catches regressions that a future preset edit could otherwise reintroduce.

### Classification
Targeted refinement

## Scope boundary
GAP-12 (wrapper/launcher/entry-stack) is explicitly preserved. No work above the shell is required to land the target composition.
