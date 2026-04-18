# Prompt 01 — Lock Architecture Boundary and Homepage Flagship Variant

## Objective

Preserve the correct wrapper-owned pre-shell placement of `PriorityActionsRail` while introducing an explicit homepage flagship surface contract so the homepage rendering cannot regress back into a generic shared-card outcome.

## Current condition

The live repo already proves that the rail belongs outside shell occupant semantics:
- `HbHomepageEntryStack.tsx` renders the rail before the shell
- `hbHomepageWrapperConfig.ts` isolates rail integration from shell module config
- comments in the entry-stack file explicitly forbid shell reclassification

At the same time, `HbcPriorityRailSurface` only exposes urgency/layout variants. There is no explicit homepage flagship context.

## Why the current condition is inadequate

The current architecture is correct, but the absence of a flagship contract leaves the homepage expression too dependent on whatever the generic shared surface happens to look like. That is one reason the rail can still render as a rounded utility card instead of a flagship command band.

## Intended future state

The homepage-facing rail should have an explicit, durable contract indicating that it is rendering in a flagship homepage top-band context. That contract must:
- preserve standalone rail mountability
- preserve wrapper-owned integration
- avoid leaking rail concerns into shell occupant semantics
- give the shared surface family a stable, named path for flagship-only presentation decisions

## What done looks like

- the architecture boundary remains unchanged
- a deliberate homepage flagship context / variant / mode exists in the surface family
- the homepage path uses that context explicitly
- the implementation makes it harder to accidentally style the homepage rail as a generic card in the future

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- `packages/ui-kit/src/HbcPriorityRail/variants.ts`
- any related exports under `packages/ui-kit/src/homepage*`

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/sharepoint-homepage-shell-boundaries.md`
- `docs/architecture/blueprint/current-state-map.md`

## Required implementation tasks

1. Confirm the architecture boundary and preserve it.
2. Add an explicit flagship contract for the homepage-facing rail surface.
3. Thread that contract through the homepage-owned rail render path without reclassifying the rail as shell-owned.
4. Add or update any supporting types, exports, or data attributes that make the flagship context inspectable.
5. Keep non-homepage use cases intact.

## Constraints and anti-patterns

### Do not do these things
- do not move the rail into shell band/slot/preset semantics
- do not widen `ModuleConfigSlices` just to carry rail surface context
- do not make the shell responsible for rail content authorship
- do not add a context name that is so generic it becomes meaningless

## Proof of closure

Provide:
- exact file list changed
- the final chosen flagship-contract name and rationale
- explanation of how the homepage now opts into the flagship contract
- confirmation that standalone rail use is preserved
- tests or proof hooks added/updated if applicable

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
