# 06 — Implementation and Cutover Plan

## Implementation sequence

### Phase 1 — New launcher surface build
Build a completely new launcher surface with:
- new root
- new row
- new tile
- new `More Tools` trigger
- new bottom drawer
- new carousel rail

### Phase 2 — Data and adapter wiring
Connect the new launcher surface to the existing approved integration/data seams as needed.
Do not let data wiring force reuse of old UI structure.

### Phase 3 — Homepage cutover
Replace the homepage launcher consumption path so the homepage renders the new launcher surface.

### Phase 4 — Retirement
Retire old launcher render logic from the homepage path.
Do not leave the old surface family as an active parallel homepage implementation.

### Phase 5 — Proof
Validate:
- row parity
- `More Tools` parity
- drawer width
- carousel behavior
- hidden scrollbar behavior
- hosted breakpoint behavior
- package truth

## Cutover rule

The cutover is complete only when the homepage path uses the new launcher surface and no longer depends on the old launcher render family for row or drawer behavior.
