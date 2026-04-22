# 04 — Tile and More Tools Contract

## Core tile grammar

Each launcher tile in the primary row must share one geometry contract:

- same width
- same height
- same radius
- same internal icon/title composition
- same elevation family
- same hover and press behavior
- same alignment discipline

## Iconography

General icon design and iconography should remain consistent with the approved current direction.

This is the one permitted carry-forward area:
- icon assets
- icon selection logic
- icon visual language

## Caption behavior

Tile captions must:
- remain centered
- remain legible
- avoid awkward clipping
- compact proportionally by breakpoint
- remain visually consistent across row peers

## More Tools tile

The `More Tools` tile must be rebuilt as a **true peer tile**.

That means:
- identical geometry to all other primary tiles
- identical size
- identical spacing contract
- identical interaction motion/elevation family
- same internal vertical balance

Its only intentional difference should be:
- its orange signature shading / gradient treatment
- its `More Tools` identity

It must not read as:
- a button
- a smaller card
- a special-width tile
- a secondary CTA bolted onto the row

## Container treatment

The row must not be wrapped in a visible secondary box or plate that reads as a card behind the tiles.
The launcher row should read directly as part of the homepage composition.
