# Prompt 04 — Recalibrate hbHomepage Entry-Stack Envelope

## Objective

Keep the rail in the correct wrapper-owned pre-shell region, but recalibrate the entry-stack envelope so the top-band actions layer gains more page-canvas authority and the hero-to-actions-to-shell transition feels intentionally authored.

## Current condition

`HbHomepageEntryStack.module.css` currently mirrors shell width and horizontal padding to keep alignment coherent. That solves one problem, but it also contributes to the hosted reading that the rail is just another padded module inside a larger shell-like region.

## Why the current condition is inadequate

The top-band doctrine requires brand + action + value on first view. If the actions layer feels visually over-contained, it underdelivers even when the code structure is correct.

## Intended future state

The wrapper should still own:
- rail placement
- band key propagation
- audience propagation
- pre-shell ordering

But the rendered result should feel more like:
- deliberate top-band composition
- a strong transition out of the hero
- a separate but related actions layer that bridges the hero and shell

## What done looks like

- the wrapper still renders rail first, shell second
- the actions layer gains more authority without fake shell chrome
- the first shell lane still begins on first view where required
- the “nested panel inside empty white wrapper” reading is materially reduced or removed

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/entryStackPolicy.ts`
- any related shell-fit comments / docs / proof hooks

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/sharepoint-homepage-shell-boundaries.md`

## Required implementation tasks

1. Revisit entry-stack spacing, horizontal containment, and transition rhythm.
2. Preserve wrapper-owned placement and data propagation.
3. Improve how the actions region relates visually to the hero above and shell below.
4. Keep the shell’s own container-aware behavior intact.

## Constraints and anti-patterns

### Do not do these things
- do not move rail rendering into the shell
- do not create fake global shell chrome
- do not bury the first shell lane below first view
- do not destroy alignment discipline in the name of “more width”

## Proof of closure

Provide:
- exact files changed
- before/after explanation of composition effect
- confirmation that wrapper ownership remains intact
- hosted validation notes for first-view relationship across major states

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
