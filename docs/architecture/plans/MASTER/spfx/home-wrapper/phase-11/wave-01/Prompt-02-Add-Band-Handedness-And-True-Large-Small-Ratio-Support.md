# Prompt 02 — Add Band Handedness And True Large/Small Ratio Support

## Objective
Upgrade the shell so paired bands can express both left-dominant and right-dominant rows with a stronger premium large/small ratio than the current fixed `3fr 2fr` left-dominant-only posture.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Inspect these seams first
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellConformance.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`

## Current gap to close
The shell can only express:
- stacked
- or left-dominant paired

It cannot express the required alternating second row. Its paired ratio is also too weak to read as the requested premium hierarchy.

## Required implementation outcome
Add a real band orientation / handedness model so the shell can explicitly render:
- large-left / small-right
- small-left / large-right
- stacked fallback

Also strengthen the paired ratio so it reads materially closer to the requested approximately-2:1 hierarchy after gutters.

## Rules
- Do not fake the inversion by abusing semantic roles.
- Do not rely on DOM-order hacks that damage accessibility or focus order.
- Keep handheld and tablet portrait fallback disciplined.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Proof of closure
Provide:
1. the new type/schema shape for handedness/orientation,
2. the CSS/grid changes that actually realize it,
3. before/after explanation of how row 2 now renders small-left / large-right,
4. proof that handheld still collapses cleanly.
