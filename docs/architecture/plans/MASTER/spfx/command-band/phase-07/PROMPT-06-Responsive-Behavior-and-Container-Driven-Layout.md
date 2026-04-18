# PROMPT 06 — Responsive Behavior and Container-Driven Layout

## Implementation objective

Treat breakpoint behavior as a governed application contract and refine the flagship rail’s layout modes against its actual container, not optimistic viewport assumptions.

## Work classification

**Refinement plus redesign**

## Exact repo files / seams / symbols to inspect

- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- related shell entry-state seams only as needed to confirm boundaries

## Current weakness

The live repo already has a real container-aware presentation seam and a real entry-stack envelope. The attached package pair correctly pushes responsive behavior, but not strongly enough against these exact seams.

## Why the current condition is inadequate

A flagship redesign can still fail if it only works at wide desktop widths. The homepage doctrine explicitly requires container-aware behavior, a narrowest stable mode, and meaningful degradation across device classes. This needs tighter closure than the attached pair provides.

## Required future state

Strengthen the rail’s responsive contract. The future state must:

- preserve container-aware device resolution
- author a narrowest stable flagship state
- keep wide states left-authoritative and confident
- keep laptop states dense but stable
- keep tablet/compact states clear and tappable
- prevent accidental centering, timid spacing, or fragile two-column behavior
- ensure overflow strategy and visible-primary counts feel intentional by device class

If the flagship path needs additional layout sub-modes, define them cleanly.

## What done actually looks like

Done means:

- ultrawide, laptop, tablet, phone, and short-height states all feel authored
- no state feels like accidental compression
- no primary content requires horizontal scrolling
- compact states preserve task clarity
- the implementation still responds to its container rather than relying only on viewport media queries

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/sharepoint-homepage-shell-boundaries.md`

## Recommended dependencies / development concepts

- Treat `priorityActionsPresentation.ts` as an application-level breakpoint contract.
- Use container-aware logic and/or container queries where they materially improve nested stability.
- Preserve the existing entry-stack envelope/gutter seam and refine it rather than replacing it casually.

## Required implementation and validation expectations

- Validate all required device/display classes.
- Validate common zoom conditions.
- Confirm there is no centered “design safety” fallback where stronger left-authoritative composition is correct.
- Keep evidence notes for each validated class.

## Prohibitions

- Do not regress to viewport-only assumptions.
- Do not force multi-column behavior where the container cannot support it.
- Do not let compact mode become a cramped afterthought.

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
