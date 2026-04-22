# 00 — Design Summary

## Objective

Define the homepage launcher replacement as a **fresh-built flagship utility surface** with clean row geometry, a seamless `More Tools` tile, and a single-row bottom-sheet carousel drawer.

## Design correction

The launcher design package must remain **site-agnostic**.
No reference to any specific SharePoint site belongs in this package.

## Locked design outcomes

1. **Primary row**
   - One premium row of launcher tiles on non-handheld breakpoints
   - Equal tile sizing across the full row
   - No extra heading label above the row
   - No visible tool count in the row container
   - No secondary plate/background treatment that reads as a separate card behind the row

2. **More Tools**
   - Same tile shape as every other tile
   - Same size
   - Same shadow/elevation family
   - Same hover/press behavior
   - Retains the orange signature gradient/shading

3. **Drawer**
   - Bottom-sheet disclosure
   - One horizontal row / carousel
   - Same tile design language as the row
   - Correct spacing between all tiles
   - Functional swipe/scroll when overflowing
   - No visible scrollbar
   - No grouped sections
   - No helper text such as “Swipe horizontally to see more tools”

4. **Fresh-build posture**
   - Nothing from the current launcher render implementation is to be copied except icon assets and approved iconography choices
   - New code, new styling, new component boundaries, clean cutover

## Product intent

The launcher should feel like the homepage’s **intentional execution surface**, not a row of buttons and not an overbuilt modal utility tray.
