# Prompt 01 — Redesign the Drawer Shell as a Wider Bottom Tray

## Objective

Rebuild the desktop/tablet drawer shell so it uses materially more of the available viewport width and reads as a premium bottom tray, not a small centered modal.

## Governing authority

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Inspect exactly these seams

- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Gap to close

The current `sheetSurface` width cap is too conservative on desktop/tablet. It underuses the viewport and makes the overflow state feel cramped.

## Required outcome

- desktop/tablet drawer uses more of the viewport width with breakpoint-governed max-inline behavior
- phone behavior remains appropriate and touch-safe
- drawer header is simplified and no longer over-signaled
- remove the drawer header count
- preserve bottom-anchored premium tray posture

## Proof of closure

Provide:
1. exact files changed
2. before/after drawer width measurements at 1920x1080 and 1024x900
3. screenshots showing materially wider tray usage
4. confirmation that handheld still behaves correctly

## Prohibited

- no unrelated row changes
- no data ordering changes
