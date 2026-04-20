# 02 — Recalibrate Shell-Fit Contracts and CSS Activation

## Objective

Correct the paired-width math and visual activation thresholds that still force stacked rendering even where the updated policy says the rows should pair.

## Governing files / standards

- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Proven root cause being corrected

The shell currently uses a `2fr / 1fr` paired layout. The minor column is one-third of usable shell width. The current occupant shell-fit contracts make the locked rows impossible or nearly impossible to pair at the target widths:

- Row 1 minor occupant requires about `520px` stable paired width
- Row 2 minor occupant requires about `520px` stable paired width
- Row 3 minor occupant requires about `720px` stable paired width

That pushes the effective total-width requirement to roughly:

- Row 1: `>= 1560px`
- Row 2: `>= 1560px`
- Row 3: `>= 2160px`

Also, `HbHomepageShell.module.css` still activates paired grids only from `1180px` upward.

## Required implementation outcome

- recalibrate the relevant shell-fit thresholds so the locked rows can pair in the intended target states
- verify the row math against actual usable shell width, not hardware resolution
- lower the CSS paired-grid activation floor to match the corrected runtime policy
- keep orientation handling (`left-dominant`, `right-dominant`) intact
- avoid broad CSS churn outside the shell pairing seam

## Files and symbols to inspect

- `resolveSlotWidth`
- `checkOccupantComfort`
- `decideBandPairing`
- `canOccupantPairAtWidth`
- each locked row occupant entry in `occupantRegistry.ts`
- `.bandPaired`
- `.bandOrientation_left_dominant`
- `.bandOrientation_right_dominant`
- `.span_major`
- `.span_minor`

## Proof of closure required

Return all of the following:

1. the new effective width math for Row 1, Row 2, and Row 3
2. exact runtime evidence for each row at:
   - `tablet-landscape`
   - `standard-laptop`
   - `ultrawide-desktop`
3. proof that CSS and runtime now agree on when a band is paired
4. confirmation that the child zones themselves were not redesigned to force fit

## Prohibitions

- no module-internal UI redesign
- no hero / launcher / wrapper changes
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
