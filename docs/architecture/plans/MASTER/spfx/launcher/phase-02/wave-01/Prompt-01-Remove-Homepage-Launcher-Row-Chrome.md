# Prompt 01 — Remove Homepage Launcher Row Chrome

## Objective

Remove any homepage-path launcher heading/count chrome so the flagship row renders as a tile-first utility surface only.

## Governing authority

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Inspect exactly these seams

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- any homepage-path seam currently surfacing the row title or row count in the hosted runtime
- related tests/proof seams only if needed after implementation

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Gap to close

The hosted homepage still shows row-level heading/count chrome (`Homepage tools`, `Priority Actions`, top-level count pill). That weakens the flagship tile-family posture and adds inventory noise.

## Required outcome

- the homepage launcher row renders without row-heading chrome
- the homepage launcher row renders without row-level count chrome
- no stale homepage-path wrapper or package artifact continues to surface that text
- diagnostics remain intact where useful, but user-facing row chrome is removed

## Proof of closure

Provide:
1. exact files changed
2. before/after DOM markers or rendered structure description
3. hosted/local screenshot proof showing the row without heading/count chrome
4. any updated tests or why none were needed

## Prohibited

- no unrelated shell layout changes
- no hero changes
- no drawer redesign work in this prompt beyond what is required to remove row-level chrome
