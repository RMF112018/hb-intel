# Plan Summary — Wave 01

The current hero architecture is stronger than the rendered result. This wave keeps the good seams and rebuilds the weakest visual-control layer.

## Core repo seams
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css`
- `apps/hb-webparts/src/webparts/hbSignatureHero/homepageHeroBannerSourceSelector.ts`
- `apps/hb-webparts/src/webparts/hbSignatureHero/homepageHeroBannerTimeOfDaySelector.ts`

## Rules
- Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.
- Do not broaden this into a generic homepage redesign.
- Keep the orchestrator / mode boundary intact unless inspection proves a direct blocker.
- Produce proof of closure for every prompt.
