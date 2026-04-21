# Objective

Tighten the runtime relationship between the flagship hero and the homepage launcher band so the top band reads as one authored premium entry system, not as two unrelated stacked surfaces.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- homepage UI/UX audit checklist
- homepage UI/UX audit scorecard

## Inspect first
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- any CSS modules directly governing entry-stack gaps / continuity
- relevant hero files from Wave 01

## Current gap
The current entry stack is structurally correct but visually segmented. The hero ends, then a white gap appears, then the launcher begins. That makes the top band feel assembled, not authored.

## Required outcome
Deliver a tighter flagship entry-band rhythm:
- more intentional hero-to-launcher continuity
- less dead white interruption
- cleaner shared material language
- stronger sense that the launcher belongs to the top-band experience

## Proof of closure
Provide:
1. hosted desktop and laptop screenshots
2. explanation of the gap/rhythm changes
3. confirmation that first-lane-first-view behavior remains intact

## Prohibitions
- no unrelated shell-lane redesign
- no fake shell chrome
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
