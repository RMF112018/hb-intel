# Plan Summary

## Objective

Replace the current chip-band launcher outcome with a true homepage-grade launcher tile family that is doctrine-compliant, host-aware, container-aware, brand-correct, and explicitly fit for desktop, tablet, and small-handheld modes.

## Summary judgment

The live homepage launcher is **partially modernized but not acceptably finished**.

The wrapper and data seams are mostly correct.
The visible product surface is not.

The current launcher should be treated as a **structurally incomplete rebuild**, not as a styling pass that only needs polish.

## Preserve vs rebuild

### Preserve
- homepage wrapper ownership of hero → launcher → shell entry stack
- list/config loading pipeline
- audience, schedule, and device filtering
- container-aware measurement posture
- breakpoint budget concept
- hosted runtime markers

### Rebuild
- tile primitive family and silhouette
- overflow-entry primitive
- handheld mode
- contract shape supporting tile variants / handheld entry mode
- tests and proof rules

## Recommended implementation waves

### Wave 1 — Primitive replacement
Replace the chip-band primitive with a tile family that visibly reads as launcher tiles, not buttons.

### Wave 2 — Inline overflow-entry tile
Replace detached `More Tools` control with an inline secondary launcher tile using the secondary orange brand posture.

### Wave 3 — Handheld mode
On small handheld only, collapse launcher to a single entry tile that opens a drawer/sheet containing **all** tools.

### Wave 4 — Contract and breakpoint hardening
Expand contract and breakpoint semantics so the surface is not faking its way into the new behavior with local hacks.

### Wave 5 — Closure proof
Strengthen tests, hosted evidence, runtime markers, and screenshot proof so the same weak outcome cannot pass again.

## Acceptance standard

The work closes only when all of the following are true:

- desktop/tablet launcher visibly reads as a premium tile launcher, not a capsule button strip
- `More Tools` is inline, tile-shaped, clearly related to the family, and brand-correct
- small handheld shows one launcher entry tile that opens a complete tools drawer/sheet
- all actions remain keyboard reachable and touch-safe
- breakpoint behavior is explicit and inspectable
- hosted screenshots and DOM markers prove the packaged result matches source
