# Audit 02 — Rendered Outcome and Root Cause Assessment

## Objective

Evaluate what the current launcher actually produces as a product surface and identify why it still reads as under-designed even after a real code-path change.

## Outcome assessment

## 1. The launcher still reads as buttons more than tiles

The current primary items are:
- short horizontal capsules
- 52–60px tall
- strongly button-like
- packed into a single dense row
- built around chip anatomy rather than tile anatomy

That means the launcher currently reads as:
- a premium-ish button strip
- a quick-action band
- a compact command row

It does **not** convincingly read as:
- a launcher tile family
- a homepage-grade work hub entry surface
- a premium utility launcher with meaningful spatial authority

## 2. The current `More Tools` treatment is visually and structurally wrong

The current overflow trigger is intentionally:
- white / surface-colored
- outlined
- uppercase utility language
- separated from the main family
- badge-count oriented
- described in code as a “secondary command layer”

That makes it read as:
- a detached utility button
- an overflow escape hatch
- a non-family control

It does **not** read as:
- an inline launcher tile
- a governed member of the launcher family
- a secondary tool tile with deliberate hierarchy

## 3. Current small-handheld behavior is structurally wrong

At phone widths, CSS stacks the primary chips vertically and leaves the overflow trigger as a separate full-width control.

The item budget is still governed as:
- 3 visible primary actions
- remaining actions in overflow
- overflow sheet contains only overflow items

That means the current phone mode is:
- a compressed desktop logic
- plus a different overflow container

It is **not**:
- a handheld launcher mode
- a single entry tile
- a drawer/sheet exposing all tools

## 4. The current surface is under-authoritative for first-screen homepage use

Because the launcher remains a compact chip band:
- the silhouette is low-authority
- the row reads as utility furniture
- family resemblance is incomplete
- the entry stack under-delivers relative to homepage doctrine

## Root causes

### Root cause 1 — wrong primitive vocabulary
The implementation never escaped chip vocabulary:
- chip model
- chip component
- chip CSS
- chip comments
- chip sizing

### Root cause 2 — hierarchy encoded into the wrong component boundary
The overflow entry is not a tile variant of the same family.
It is a distinct trigger primitive.

### Root cause 3 — mobile logic only changed the container, not the mode
Switching overflow from menu to sheet is not a mobile launcher strategy.
It is only an overflow presentation strategy.

### Root cause 4 — semantics are preserved in data but discarded in the surface
The adapter retains useful fields such as description and grouping metadata, but the primary surface renders only icon + title. The surface therefore has limited expressive room to become a stronger launcher without contract/variant expansion.

### Root cause 5 — tests lock weak assumptions
Current tests explicitly validate:
- 3 phone items + overflow
- overflow-only sheet behavior
- no featured slot / no richer tile layout
- one authoritative visible-count regime aligned to the chip-band model

## Fresh-eyes decision

This is not a “tighten spacing and color” problem.

This is a **primitive-family and interaction-model problem**.
The surface should be rebuilt from chip-band assumptions to launcher-tile assumptions.
