# 01 — Realign Breakpoint and Recipe Policy

## Objective

Correct the authored runtime policy that still forces the homepage shell to stack on `tablet-landscape` even though the locked target requires row pairing below the launcher on target non-handheld classes.

## Governing files / standards

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/bandRecipes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`

## Proven root cause being corrected

The preset already encodes the three target rows, but the downstream runtime policy still denies them:

- `tablet-landscape` remains `firstLaneColumns: 1` and `firstLanePairingAllowed: false`
- `feature-pair` remains ineligible for `tablet-landscape`
- `asymmetric-two-up` remains ineligible for `tablet-landscape`

That means the current source tree still intentionally stacks the homepage in a state the target says should pair.

## Required implementation outcome

- `tablet-landscape` must no longer be a hard single-column denial if the locked target still requires pairing there
- the recipes used by Row 1, Row 2, and Row 3 must be eligible in the target pairing states
- no unrelated breakpoint expansion
- no future-state page-builder work
- preserve the locked occupant list and row ordering already encoded in `defaultPreset.ts`

## Files and symbols to inspect

- `SHELL_ENTRY_STATES`
- `resolveEntryStateWithReason`
- `WIDE_ENTRY_STATES`
- `MULTI_COLUMN_ENTRY_STATES`
- `SHELL_BAND_RECIPE_RULES`
- `DEFAULT_PRESET`

## Proof of closure required

Return all of the following:

1. exact before/after diff explanation for breakpoint and recipe policy
2. explicit statement of which entry states now allow Row 1, Row 2, and Row 3 to pair
3. local runtime evidence showing `data-shell-entry-state`, `data-shell-columns`, and `data-shell-band-pairing-allowed` at:
   - a `tablet-landscape` width
   - a mid-band `standard-laptop` width
4. confirmation that no unrelated shell or launcher seams were modified

## Prohibitions

- do not redesign child zones
- do not change launcher behavior
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
