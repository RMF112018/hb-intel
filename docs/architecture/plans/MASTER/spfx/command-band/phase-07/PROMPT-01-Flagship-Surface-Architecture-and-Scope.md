# PROMPT 01 — Flagship Surface Architecture and Scope

## Implementation objective

Lock the correct flagship product model for the homepage rail and define the redesign boundary before any lower-level rendering work proceeds.

## Work classification

**Structural redesign**

## Exact repo files / seams / symbols to inspect

- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- `packages/ui-kit/src/HbcPriorityRail/variants.ts`
- any adjacent homepage-safe action/launcher primitives exposed through `@hbc/ui-kit/homepage`

## Current weakness

The live homepage path already has a distinct flagship context, but it still resolves into a row/list-first action product. The current attached package pair recognizes the weakness but does not force a crisp enough architecture decision about what the flagship band actually is.

## Why the current condition is inadequate

The current result is strong enough to mislead an implementation into doing one more tasteful styling pass while preserving the same underlying action grammar. That would not produce a signature application. The homepage band is above the shell and deserves a more decisive command/launcher model.

## Required future state

Define and implement the correct flagship model. That model must:

- preserve wrapper-owned pre-shell placement
- preserve the explicit `homepage-flagship` context
- remain host-safe for SharePoint page-canvas reality
- be recognition-first rather than serial-row-reading-first
- make primary actions more authoritative than supporting actions
- degrade credibly across compact states

Valid solutions may include:
- a hybrid command-band / launcher-strip model
- sectioned clusters with one featured primary action and supporting compact actions
- another structurally stronger flagship grammar that is clearly better than the current row-list model

Do **not** force a giant tile wall if it harms density.
Do **not** preserve the row/list model merely because it already works.

## What done actually looks like

Done means:

- the flagship path is structurally different from the default path
- the surface reads first as a homepage operating layer
- the architecture that is already correct remains intact
- the chosen flagship grammar can be explained in practical product terms
- the decision is encoded in the component structure, not hidden in CSS mood changes alone

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/sharepoint-homepage-shell-boundaries.md`
- `docs/architecture/blueprint/current-state-map.md`

## Recommended dependencies / development concepts

- Prefer the already-approved premium stack in the repo (`motion`, `lucide-react`, `@floating-ui/react`, Radix primitives, CVA, `clsx`) rather than introducing new visual-system dependencies.
- Treat this as a product-model decision first, visual styling second.
- Keep default/admin preview consumers viable while deepening the homepage flagship path.

## Required implementation and validation expectations

- Write the flagship model into the shared surface architecture explicitly.
- Preserve loading/empty/error handling.
- Preserve wrapper config boundaries.
- Confirm the redesign does not migrate the rail into shell-occupant semantics.
- Add or update tests if the flagship branching model changes materially.

## Prohibitions

- Do not perform a cosmetic restyle only.
- Do not broaden this into unrelated homepage-module work.
- Do not move the rail into shell bands or shell occupant registration.
- Do not introduce fake SharePoint shell chrome.

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
