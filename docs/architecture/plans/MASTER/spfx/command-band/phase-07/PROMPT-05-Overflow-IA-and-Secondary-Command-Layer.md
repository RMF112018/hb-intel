# PROMPT 05 — Overflow IA and Secondary Command Layer

## Implementation objective

Rebuild overflow so it behaves as a curated secondary command layer, with semantics and breakpoint strategy matched to the interaction model actually being used.

## Work classification

**Refinement plus redesign**

## Exact repo files / seams / symbols to inspect

- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailOverflow.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`

## Current weakness

The live repo already supports `inline-disclosure`, `menu`, and `sheet`, which is useful. But the flagship surface still makes overflow feel appended and lower-energy than it should be.

## Why the current condition is inadequate

Overflow is not leftover UI. It is the second layer of the command surface. If it feels like spillover, the flagship band still lacks a finished information architecture. In addition, overflow semantics must match actual behavior: disclosure when revealing in-flow content, menu-button only when menu behavior is real, sheet only when it earns the state.

## Required future state

Upgrade overflow to a product-grade secondary layer. The future state must:

- keep the first view focused on primary actions
- make secondary actions easy to access and easy to scan
- choose strategy by mode intentionally
- strengthen trigger affordance and copy
- preserve keyboard dismissal and focus return
- keep semantics correct for the interaction model used

Review and refine:
- trigger label and prominence
- grouping inside overflow where useful
- density of overflow items
- strategy selection by breakpoint / layout mode
- relationship between overflow trigger and flagship band

## What done actually looks like

Done means:

- overflow feels curated, not appended
- the trigger clearly belongs to the flagship command surface
- disclosure/menu/sheet semantics match actual behavior
- focus return and dismissal remain correct
- compact states feel designed rather than fallback-ish

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- WAI APG button/disclosure/menu-button expectations where applicable

## Recommended dependencies / development concepts

- Use disclosure semantics for in-flow expansion.
- Use menu-button semantics only when the anchored overlay behaves like a menu of commands/links.
- Preserve the existing approved stack (`@floating-ui/react`, Radix ScrollArea, `motion`) rather than adding new overlay dependencies unless absolutely necessary.

## Required implementation and validation expectations

- Verify `aria-expanded`, `aria-controls`, focus return, Escape dismissal, and click-outside behavior as applicable.
- Revalidate inline, anchored, and sheet modes if retained.
- Revalidate compact and touch/zoom behavior.
- Add tests for the actual strategies kept in the final system.

## Prohibitions

- Do not keep the current trigger with only copy changes.
- Do not use menu semantics carelessly for something that is really just a disclosure region.
- Do not sacrifice accessibility to chase a more “premium” look.

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
