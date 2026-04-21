# Prompt-01-Featured-Compact-Mode-Redesign

## Objective
Redesign the public hbKudos featured recognition surface so phone and narrow-tablet modes become intentionally composed compact experiences rather than compressed desktop layouts.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

The governing finding to close is this:
- compact states must show less information where appropriate, not the same information in a tighter box
- the surface must remain credible across tablet portrait and phone portrait
- “technically renders” is not acceptable closure

## Inspect exactly
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurface.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`
- any directly imported local style/module seam needed by those files

## Current problem
The current public surface changes the featured badge label on compact widths, but otherwise preserves the desktop card grammar:
- masthead remains desktop-like
- featured card keeps the same general structure
- recipient/title/excerpt/footer all stay visible
- phone widths inherit crowding instead of selective disclosure

The attached audit screenshots show the failure clearly at 402x872 and 440x956:
- recipient/title stack becomes too narrow
- content becomes vertically expensive
- the card feels compressed rather than purpose-designed

## Required implementation outcome
Implement a real compact-mode strategy. At minimum:
1. Define an explicit compact layout state for the featured card.
2. Re-stage the featured hierarchy on phone widths so the recipient/title moment is legible and calm.
3. Reduce visible content in compact mode instead of preserving every desktop element.
4. Keep the “Give Kudos” CTA obvious and comfortable to tap.
5. Maintain warm, premium, recognition-oriented tone.

Allowed solutions can include:
- stacked editorial card composition
- reduced excerpt length
- mobile-only metadata collapse
- lower visual priority for secondary info
- alternate badge placement or badge suppression if justified

## Proof of closure
Provide:
- before/after hosted screenshots at 440x956, 402x872, 834x1210, and 1366x768
- a concise explanation of what changes between default, compact, and handheld states
- confirmation that no unrelated homepage surfaces changed
