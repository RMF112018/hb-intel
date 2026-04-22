# Prompt 02 — Make `More Tools` a Strict Peer Tile

## Objective

Rebuild the standard-mode `More tools` trigger so it follows the exact same size contract and peer-tile grammar as the primary row tiles across all non-handheld breakpoints.

## Governing authority

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Inspect exactly these seams

- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherTile.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Gap to close

The overflow trigger is nominally square-sized, but its active anatomy still makes it read differently from peer tiles. The count badge worsens this and is visible in the hosted runtime.

## Required outcome

- standard-mode `More tools` uses the same width, height, padding logic, icon scale relationship, and caption positioning contract as the primary tiles
- remove the standard-mode count badge from the trigger
- preserve the secondary orange identity only if it still reads as a peer tile, not a special-case button
- handheld linear trigger behavior may remain distinct; do not regress it

## Proof of closure

Provide:
1. exact files changed
2. measured tile dimensions for one primary tile and the `More tools` tile at desktop and tablet-landscape
3. screenshot proof showing strict peer sizing
4. updated tests if selector or expectations changed

## Prohibited

- no drawer-shell redesign in this prompt
- no unrelated icon registry changes
- no list/data ordering changes
