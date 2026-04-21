# Objective

Make the flagship hero behave like a breakpoint-native composition on tablet portrait and handheld states instead of a compressed desktop crop.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- shell and application breakpoint expectations
- homepage UI/UX audit checklist and scorecard

## Inspect first
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/entryStackPolicy.ts`

## Current gap
Tablet and handheld states are functional, but they still feel like a reduced desktop concept. The greeting, tagline, logo, and image crop are not yet re-authored enough for compact-state positivity.

## Required outcome
Implement compact states that:
- show less, not just smaller
- protect contrast first
- keep brand authority without crowding
- feel intentionally mobile/tablet-native

## Proof of closure
Provide:
1. hosted screenshots for tablet portrait and both phone screenshots from the audited matrix
2. exact explanation of what changed in compact states
3. confirmation that no awkward horizontal scrolling or stressed tap behavior was introduced

## Prohibitions
- do not change the locked content model unless repo-truth proves a blocker
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
