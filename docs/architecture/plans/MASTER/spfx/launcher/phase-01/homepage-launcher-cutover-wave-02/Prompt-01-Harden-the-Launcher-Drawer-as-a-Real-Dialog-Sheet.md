# Prompt 01 — Harden the Launcher Drawer as a Real Dialog Sheet

## Objective
Upgrade the homepage launcher drawer from a working custom dialog shell to a closure-grade sheet/dialog interaction with correct focus and accessibility behavior.

## Governing repo authorities
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Files / seams to inspect
- `packages/homepage-launcher/src/HomepageLauncherSurface.tsx`
- `packages/homepage-launcher/src/homepage-launcher-surface.module.css`
- any governed dialog/sheet primitive or Radix-based shell already present in the repo
- relevant launcher tests under `e2e/webparts/` and `e2e/live-sharepoint/`

## Current gap to close
The drawer currently supports:
- open / close
- Escape
- backdrop close
- keyboard scrolling of the rail

But it is still missing closure-grade dialog behavior:
- focus trap
- deterministic initial focus
- focus return to trigger
- stronger semantic sheet behavior

## Required implementation outcome
Implement a real dialog/sheet lifecycle for the launcher drawer while preserving:
- bottom-sheet posture
- single-row horizontal rail
- handheld and desktop entry behavior
- existing runtime markers where still useful

## Proof of closure required
Provide:
- exact focus lifecycle behavior after the change
- keyboard path proof for open, traverse, close, and return
- any updated test coverage
- confirmation that handheld and desktop entry paths still work

## Prohibitions
- no redesign into grouped drawer sections
- no modal-centered card treatment
- no unrelated homepage-shell changes
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
