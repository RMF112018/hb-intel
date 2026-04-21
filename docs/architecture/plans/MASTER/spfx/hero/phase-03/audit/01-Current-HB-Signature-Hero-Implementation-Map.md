# 01 — Current HB Signature Hero Implementation Map

## Primary seams reviewed

### Hero orchestrator
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`

### Homepage hero adapter
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`

### Hero styling
- `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css`

### Hero mode resolution
- `apps/hb-webparts/src/webparts/hbSignatureHero/heroModeResolver.ts`

### Background image source selection
- `apps/hb-webparts/src/webparts/hbSignatureHero/homepageHeroBannerSourceSelector.ts`
- `apps/hb-webparts/src/webparts/hbSignatureHero/homepageHeroBannerTimeOfDaySelector.ts`

### Homepage entry-stack integration
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`

### Shared shell measurement / entry-state authority
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/entryStackPolicy.ts`

### Launcher region
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`

### Manifest
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroWebPart.manifest.json`

### Governing doctrine
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Architectural read

### What is strong
The implementation is clearly no longer a generic single webpart banner:
- the hero is orchestrated through explicit mode resolution
- HBCentral is hard-locked to homepage mode
- article mode is a separate branch
- the flagship homepage path can be wrapper-embedded and share entry-state truth with the shell
- the hero height budget is shell-governed instead of purely self-governed
- the launcher band reads from the same entry-state model
- the hero has a dedicated image-selection seam rather than ad hoc inline URL assembly

### What is still limiting
The implementation remains visually dependent on:
- center-cropped background photography
- one generalized scrim strategy
- one generalized right-side brighten strategy
- static logo clamp rules
- a fixed left-text / right-logo composition that weakens under tighter crops

That means the architecture is more mature than the visual control system.

## Runtime composition model

The intended flagship stack is:
1. hero
2. launcher / priority-actions region
3. shell

That is correct directionally.

The unresolved issue is not the sequence. The unresolved issue is that the **rendered relationship between 1 and 2 is still too segmented**.
