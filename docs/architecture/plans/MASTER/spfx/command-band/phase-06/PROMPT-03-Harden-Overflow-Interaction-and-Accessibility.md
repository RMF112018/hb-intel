# Prompt 03 — Harden Overflow Interaction and Accessibility

## Objective

Upgrade overflow behavior from merely governed to flagship-grade by hardening interaction quality, dismissal behavior, tall-list handling, and accessibility.

## Current condition

Overflow already supports `inline-disclosure`, `menu`, and `sheet` strategies, but the current implementation still behaves more like a generic expandable panel than a fully productized overflow system. The repo already includes `@floating-ui/react`, `@radix-ui/react-scroll-area`, and `@radix-ui/react-tooltip`, but the current rail does not fully leverage them.

## Why the current condition is inadequate

On a command band, overflow is not secondary plumbing. It is part of the primary navigation experience. Weak overflow makes the entire surface feel less intentional and less premium.

## Intended future state

Overflow should:
- remain breakpoint-governed
- feel visually and behaviorally deliberate
- support keyboard and touch use credibly
- handle tall inventories without degrading the experience
- distinguish inline-disclosure, anchored-menu, and sheet behavior clearly when those modes are chosen

## What done looks like

- the chosen overflow strategies behave distinctly and intentionally
- anchored overlays are collision-safe if used
- tall lists remain usable without awkward custom scrolling
- keyboard dismissal and focus flow are solid
- compact/mobile states remain pointer-safe

## Exact repo seams to inspect

- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailOverflow.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailAction.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Research-backed implementation guidance

- Use `@floating-ui/react` if a menu-like overflow needs anchored positioning and collision handling.
- Use `@radix-ui/react-scroll-area` if overflow content becomes tall enough that a scrollable viewport is justified.
- Preserve native-feeling interaction and keyboard behavior.
- Ensure pointer targets remain credible in compact states.

## Required implementation tasks

1. Audit each overflow mode and decide what interaction model it should actually express.
2. Harden focus, dismissal, and Escape behavior.
3. Improve tall-list handling without inventing fragile custom scroll logic.
4. Ensure overflow trigger, compact rows, and close affordances remain touch-safe.
5. Update styles and state choreography so overflow feels like part of the flagship system, not an afterthought.

## Constraints and anti-patterns

### Do not do these things
- do not add new libraries if existing repo dependencies already solve the problem
- do not let menu mode remain a visually disguised accordion
- do not create inaccessible focus traps or focus loss on close
- do not rely on hover-only access to critical meaning

## Proof of closure

Provide:
- exact files changed
- chosen interaction model per overflow strategy
- keyboard and dismissal behavior summary
- tall-list handling summary
- hosted validation steps for overflow-open states

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
