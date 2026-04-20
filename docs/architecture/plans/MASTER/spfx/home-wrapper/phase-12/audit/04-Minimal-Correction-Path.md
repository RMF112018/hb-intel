# 04 — Minimal Correction Path

## Minimum source changes required

### 1. Realign breakpoint policy with the locked target

Edit `shell/breakpointPolicy.ts` so `tablet-landscape` no longer encodes mandatory single-column posture if the target still requires row pairing there.

This is a **policy change**, not a child-zone change.

### 2. Realign recipe eligibility with the locked target

Edit `shell/bandRecipes.ts` so the recipes used by the locked rows are eligible in the target pairing states.

At minimum:

- Row 1 recipe must be legal where Row 1 is expected to pair
- Row 2 recipe must be legal where Row 2 is expected to pair
- Row 3 recipe must be legal where Row 3 is expected to pair

This is also a **policy change**, not a module redesign.

### 3. Recalibrate paired shell-fit contracts for the locked rows

Edit the per-occupant shell-fit and paired-width thresholds in `shell/occupantRegistry.ts`, and verify them against `slotComfortResolver.ts`.

Without this step:

- Row 1 and Row 2 still collapse for most standard-laptop widths
- Row 3 still cannot pair at all in standard-laptop

This is the most important practical fix.

### 4. Lower the CSS paired-grid activation floor

Edit `HbHomepageShell.module.css` so visual pairing can activate in the same states where runtime policy now allows it.

Without this step, runtime can say "pair" while CSS still renders one column.

## What should not be changed unnecessarily

Do **not** redesign the child zones to make them fit.
Do **not** change the wrapper/hero/launcher ownership model.
Do **not** widen the homepage into a general page-builder exercise.
Do **not** change unrelated launcher or hero seams.

## Minimum viable verification after the source fix

- prove the measured shell width on each target class
- prove `data-shell-entry-state`
- prove `data-shell-columns`
- prove `data-shell-band-pairing-allowed`
- prove `data-shell-band-pairing-reason`
- prove paired grid CSS activation on the same width classes
