# Prompt 04 — P0 retirement of prohibited inline visual authoring in the Companion runtime

## Objective

Reduce or eliminate prohibited **ordinary-source inline visual authoring** from the **HB Kudos Companion** runtime so the homepage webpart better complies with the SPFx homepage doctrine’s source-discipline requirement.

## Governing authority

Primary governing files:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Secondary supporting references:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`

## Problem to correct

The Companion runtime still carries too much direct inline visual styling in ordinary homepage source.

That includes layout, spacing, type, chip, and row/detail presentation authored directly inside `HbKudosCompanion.tsx` rather than being expressed through cleaner CSS-module, variant, or governed local-shared seams.

Under the homepage overlay, direct hex/rgb values and hardcoded pixel spacing in ordinary homepage webpart source are prohibited unless clearly justified as a deliberate exception for flagship work.

The Companion is not a flagship hero exception.

## Required implementation direction

### 1. Retire inline visual styling from the Companion runtime where feasible
Systematically move visual authoring out of `HbKudosCompanion.tsx` and into more disciplined seams such as:

- `companion.module.css`
- `governance.module.css`
- existing variant systems in `kudosVariants.ts`
- narrow new local classes/variants only where truly needed

Focus first on the highest-volume and most obviously ordinary visual authoring in the runtime.

### 2. Preserve behavioral clarity
Do not make the code harder to understand in the name of eliminating every last inline object.

The goal is disciplined retirement of prohibited ordinary-source visual authoring, not performative abstraction.

### 3. Keep homepage import and scope discipline intact
Do not broaden imports to prohibited entry points.

Do not turn this into a root-level UI-kit migration exercise.

### 4. Keep the Companion visually premium and host-aware
Do not degrade the surface into a generic enterprise card grid.

The doctrine requires a visibly non-generic, productized outcome even while tightening source discipline.

## Files in scope

Primary targets:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`

You may add a narrow local class/variant seam where needed.

## Constraints

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not widen scope into general Wave 1 redesign.
- Do not create fake shell chrome or host-fighting layout behavior.
- Do not use subtle styling-only tweaks as a substitute for retiring the actual prohibited inline authoring.
- Do not break the existing functional behavior of queue rows, detail actions, dialogs, or state handling.

## Validation requirements

Validate that:

1. the Companion runtime source materially contains less inline visual authoring
2. styling ownership is clearer and easier to reason about
3. the rendered output is not visually degraded
4. homepage import discipline remains intact

## Deliverable

Implement the source-discipline cleanup and report:

- which inline visual-authoring regions were retired
- which styling seams now own that logic
- what remained inline and why
- what validation was performed
