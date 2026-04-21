# Objective

Refine the homepage launcher’s visual continuity with the flagship hero without regressing the current governed visible-cap / overflow behavior.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- entry-stack breakpoint rules
- homepage UI/UX audit checklist
- homepage UI/UX audit scorecard

## Inspect first
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- any launcher presentation / adapter seams that materially affect hosted appearance
- entry-stack CSS affecting region rhythm
- hero files as needed for continuity

## Current gap
The launcher behavior is functionally more disciplined than older versions, but it still looks visually detached from the hero in desktop/tablet states.

## Required outcome
Refine continuity while preserving:
- governed visible caps
- governed overflow
- handheld single-entry behavior
- shell-owned entry-state authority

## Proof of closure
Provide:
1. desktop, tablet portrait, and phone screenshots
2. confirmation that launcher caps and overflow behavior did not regress
3. concise explanation of visual continuity improvements

## Prohibitions
- do not revert to the old vertical rail posture
- do not broaden into unrelated launcher feature work
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
