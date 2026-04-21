# Objective

Re-tune the flagship hero’s logo / lockup behavior so it holds correct visual authority across desktop, tablet, and handheld states.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- homepage UI/UX audit checklist
- homepage UI/UX audit scorecard

## Inspect first
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css`
- any relevant branding asset seam actually used by the hero

## Current gap
The current logo treatment is acceptable on large desktop but becomes increasingly over-assertive or compositionally awkward on tighter crops. The current implementation leans mainly on clamp values rather than a truly breakpoint-native composition strategy.

Also verify whether the rendered lockup fully satisfies the doctrine’s HB Central brand-lockup expectation.

## Required outcome
Deliver a logo/lockup treatment that:
- feels balanced on large desktop
- remains subordinate to the text hierarchy on smaller states
- does not crowd the right side on handheld/tablet
- uses responsive composition logic, not only simple size reduction
- satisfies the doctrine’s brand-lockup intent

## Proof of closure
Provide:
1. desktop, tablet, and phone screenshots
2. exact explanation of how logo behavior changes by mode
3. confirmation of the final lockup asset or treatment used

## Prohibitions
- do not add unnecessary ornamental frames or plates
- do not broaden into a full branding refactor
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
