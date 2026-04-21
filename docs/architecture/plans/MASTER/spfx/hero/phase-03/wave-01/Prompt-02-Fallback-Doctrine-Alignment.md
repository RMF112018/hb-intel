# Objective

Correct the no-image fallback for the flagship homepage hero so it aligns with the homepage overlay doctrine.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`

## Inspect first
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css`

## Current gap
The stricter homepage overlay rejects a blue/orange gradient-wash fallback posture for the flagship hero. The current `.surface.noImage` treatment still uses visible presentation-blue and presentation-orange pools over charcoal.

That is too close to the prohibited outcome and does not meet the doctrine cleanly.

## Required outcome
Replace the fallback with a doctrine-aligned treatment:
- deep charcoal / graphite base
- restrained warmth only
- subtle materiality / grain
- no visible enterprise-banner wash behavior
- premium, premium, premium — but quiet, not colorful

## Proof of closure
Provide:
1. a visual rationale for the new fallback
2. a screenshot of the hero rendered with no image source
3. confirmation that text contrast remains strong in the fallback state

## Prohibitions
- do not touch unrelated launcher or shell code
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
