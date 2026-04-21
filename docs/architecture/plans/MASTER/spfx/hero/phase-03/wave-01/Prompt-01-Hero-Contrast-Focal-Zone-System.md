# Objective

Rebuild the flagship homepage hero’s image-governance and contrast system so the greeting, tagline, and logo remain reliably legible across the approved image set and across the audited device classes.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- homepage UI/UX audit checklist
- homepage UI/UX audit scorecard

## Inspect first
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css`
- `apps/hb-webparts/src/webparts/hbSignatureHero/homepageHeroBannerSourceSelector.ts`
- `apps/hb-webparts/src/webparts/hbSignatureHero/homepageHeroBannerTimeOfDaySelector.ts`

## Current gap
The hero still depends too heavily on:
- generic `background-position: center center`
- one generalized scrim treatment
- one generalized right-side brighten treatment

That is not enough for a flagship hero using busy construction imagery. The current handheld and tablet crops prove that the composition is still too dependent on photographic luck.

## Required outcome
Implement a more deliberate image-control system that gives the hero:
- approved text-safe region behavior
- approved logo-safe region behavior
- per-image or per-daypart focal governance where needed
- stronger contrast stability without turning the hero muddy or over-darkened

## Proof of closure
Provide:
1. before/after hosted screenshots for desktop, tablet portrait, and phone portrait
2. explicit notes explaining how focal control now works
3. explicit notes confirming reliable greeting/tagline/logo legibility in each approved image/daypart state
4. any tests added or updated

## Prohibitions
- no unrelated shell changes
- no fake CTA additions
- no reintroduction of content furniture the doctrine retired
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
