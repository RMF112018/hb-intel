# Prompt 01 — P0 load / error / empty-state closure

## Objective

Bring the **HB Kudos Companion** into compliance with the binding SPFx homepage doctrine that requires professional and clearly distinct **loading**, **error**, and **empty** states.

The current runtime must stop allowing a data-load or binding failure to appear as an ordinary “no results” condition.

## Governing authority

Primary governing files:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Secondary supporting references:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`

## Problem to correct

The Companion currently has a loading path and a generic empty-state path, but it does not render a clearly distinct **load-failure** state before falling through to normal queue rendering logic.

That creates operational ambiguity because a failed list/data load can present like an ordinary queue-empty condition.

That outcome is not acceptable under the homepage overlay’s binding requirement for clear empty, loading, and error states.

## Required implementation direction

### 1. Create explicit state separation
Implement clearly distinct render paths for at least the following conditions:

- **initial loading**
- **load failure / binding failure**
- **true no-data** condition
- **filtered-empty** condition where the base queue has items but active filters reduce the current view to zero

Do not collapse these states into one generic empty state.

### 2. Preserve operational clarity
The error state must communicate that the issue is a load/binding/runtime problem, not an ordinary queue condition.

The filtered-empty state must communicate that items may exist outside the current filter view.

The true no-data state must communicate that the system is working but there are currently no matching underlying items for the queue/state being viewed.

### 3. Keep the solution host-safe and homepage-safe
Use homepage-safe primitives and local homepage-shared seams where appropriate.

Do not introduce shell-like banners, fake admin chrome, or other host-fighting constructs.

### 4. Keep the changes narrow and production-minded
This prompt is about P0 clarity and runtime safety.

Do not redesign the full workspace. Do not drift into broader queue-layout overhaul.

## Files in scope

Primary targets:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`

You may add a narrow helper or local rendering component if that materially improves clarity.

## Constraints

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not change the core workflow model, queue filtering rules, or role model unless strictly required for correct state separation.
- Do not mask real errors behind fallback content that looks like success.
- Do not use broad `@hbc/ui-kit` root imports in homepage webpart code.

## Validation requirements

Validate the following scenarios explicitly:

1. loading state
2. runtime/data failure state
3. true empty queue state
4. filtered-empty state after applying filters/search
5. recovery from error or refresh/reload path if already supported by the existing runtime

Use the existing repo validation workflows and the dev harness where applicable.

## Deliverable

Implement the state separation and report:

- what distinct states now exist
- where the render branching was corrected
- how the user messaging differs between error, no-data, and filtered-empty outcomes
- what validation was performed
