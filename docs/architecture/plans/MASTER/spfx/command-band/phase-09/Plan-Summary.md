# Plan Summary — Parity-First Replacement Package

## Objective

Prove why the hosted Priority Actions Rail still renders as a generic sparse card row, then force only the changes required to produce a **material, hosted, visually obvious improvement** in the Priority Actions Rail and its HB Homepage integration.

## Core question

Why does the hosted screenshot still show a weak generic rail when the repo already appears to contain a stronger wrapper-owned flagship path?

## In-scope seams

### Homepage wrapper / integration
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`

### Public rail
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`

### Shared surface family
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailAction.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailOverflow.tsx`
- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- `packages/ui-kit/src/HbcPriorityRail/variants.ts`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`

### Packaging / deployment truth
- `apps/hb-webparts/config/package-solution.json`
- relevant webpart manifests and build/package outputs
- attached `hb-intel-homepage.sppkg`

## Sequence

1. Prove hosted runtime parity or identify the mismatch.
2. Only after the mismatch is known, implement the minimum necessary changes to produce a materially different hosted rail.
3. Rebuild/package the app.
4. Return proof.

## Success standard

This package succeeds only if the hosted rail is no longer reasonably describable as:

- a generic sparse card row
- weakly grouped
- under-dense
- low-authority
- visually near-identical to the current screenshot

The result must clearly read as a stronger **Priority Actions Rail** surface.
