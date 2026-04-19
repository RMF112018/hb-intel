# Audit 00 — Executive Summary

## Framing

This was executed as a fresh-eyes repo-truth audit of the live homepage launcher on `main`.

Authoritative inputs:

- live repo implementation seams under `apps/hb-webparts` and `packages/ui-kit`
- doctrine files under `docs/reference/ui-kit/doctrine/**`
- benchmark package under `docs/reference/spfx-surfaces/benchmark/**`
- current rendered-outcome concerns explicitly called out in the audit objective:
  - launcher still reads as buttons instead of tiles
  - `More Tools` is not acceptable in its current detached outlined treatment
  - small handheld must collapse to a single entry tile opening a drawer of all tools

## Executive conclusion

The current homepage launcher is **not a failed cutover**.
It is a **successful path cutover to the wrong primitive family**.

The homepage path no longer depends on the old flagship rail surface.
That part is real and should be preserved.

However, the new launcher surface itself is structurally wrong for the desired end state:

- it is explicitly conceived as a **chip band**
- the primary items are capsule-like anchors with chip semantics
- the overflow entry is explicitly treated as a separate white utility control
- the phone mode is a reduced-row compromise rather than a purpose-fit mobile launcher mode
- the current tests reinforce those decisions instead of challenging them

## Fresh-eyes preserve / replace call

### Preserve
- render path ownership
- data-loading seams
- filtering seams
- shell-entry-state alignment posture
- authoritative count budgeting
- hosted runtime marker strategy

### Replace
- primary launcher primitive
- overflow-entry primitive
- handheld interaction model
- contract shape needed to support those new modes
- closure expectations and tests

## Root cause summary

### Root cause 1 — Primitive framing error
The launcher was rebuilt as a compact horizontal chip system, not as a launcher tile system.

### Root cause 2 — Hierarchy model error
`More Tools` was deliberately separated from the launcher family instead of being treated as a governed secondary launcher tile.

### Root cause 3 — Handheld model error
Phone mode retained a compressed desktop-row mental model instead of switching to a handheld launcher-entry model.

### Root cause 4 — Test/proof error
The current test suite proves alignment to the chip-band rules, not alignment to the desired launcher outcome.

## Candid score

Using the benchmark scoring posture, the launcher currently lands roughly in the **mid-20s / 40**, not homepage-grade closure.

It gets partial credit for:
- architecture separation
- explicit contracts and mapping
- container-aware breakpoint posture
- runtime inspectability

It loses significant ground for:
- purpose-fit sophistication
- interaction completeness
- launcher persona execution
- handheld suitability
- visual family hierarchy
- proof that the surface is benchmark-grade rather than merely changed

## Required package posture

This updated package treats the launcher problem as:

- **architecturally preserved** at the wrapper/data seam
- **structurally non-compliant** at the surface seam
- requiring **material primitive rebuild**, not decorative refinement
