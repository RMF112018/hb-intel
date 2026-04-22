# Prompt 02 — Adopt a Governed Overflow Rail and Reduced-Motion Behavior

## Objective
Raise the dedicated launcher’s overflow and motion quality to doctrine level by using governed overflow behavior and explicit reduced-motion handling.

## Governing repo authorities
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`

## Files / seams to inspect
- `packages/homepage-launcher/src/HomepageLauncherSurface.tsx`
- `packages/homepage-launcher/src/homepage-launcher-surface.module.css`
- `packages/ui-kit/src/homepage.ts`
- any existing Radix scroll-area or reduced-motion helpers that can be used without violating homepage import discipline

## Current gap to close
The launcher currently uses a custom horizontal overflow rail and simple CSS transitions. That works, but it does not yet demonstrate the class of governed overflow and motion polish the doctrine expects for flagship homepage utility work.

## Required implementation outcome
Improve the overflow rail and motion model so that:
- horizontal overflow remains single-row and scrollbar-hidden
- touch, wheel, and keyboard behavior remain strong
- reduced-motion users get a clearly simplified interaction path
- the implementation uses governed primitives or helpers where that materially improves the surface
- the result still feels compact, premium, and host-safe

## Proof of closure required
Provide:
- what primitive/helper changes were introduced
- how reduced-motion is now handled
- confirmation that the drawer still behaves as a single-row tray across supported breakpoints
- updated screenshots or proof output

## Prohibitions
- no grouped sections
- no visual downgrade into generic scroll containers
- no unrelated shell work
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
