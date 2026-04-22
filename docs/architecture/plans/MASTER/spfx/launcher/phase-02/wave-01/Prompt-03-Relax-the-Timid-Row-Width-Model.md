# Prompt 03 — Relax the Timid Row Width Model

## Objective

Correct the homepage launcher row so it uses the available lane width with more confidence instead of reading as a small centered strip with oversized dead margins.

## Governing authority

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Inspect exactly these seams

- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Gap to close

The current `.bandScroller` width math hard-caps the row to the exact visible tile matrix and centers it. On hosted desktop widths this makes the launcher feel timid and underpowered.

## Required outcome

- preserve governed visible counts and tile sizes
- reduce the visual impression of a narrow floating strip
- use the available container width more confidently
- do not introduce horizontal overflow for the primary row
- keep the row looking premium, not stretched or sparse

## Proof of closure

Provide:
1. exact files changed
2. width math / layout explanation
3. screenshot proof at 1920x1080 and 1512x982 showing improved first-view authority
4. confirmation that primary row still has no horizontal overflow

## Prohibited

- no shell row pairing changes
- no hero changes
- no drawer implementation in this prompt
