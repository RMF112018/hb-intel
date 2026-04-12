# Prompt 04 — P1 Styling ownership and visual-governance hardening

## Objective

Tighten **styling ownership** for the HB Kudos Companion so the runtime stops carrying unnecessary ordinary-source visual authoring and instead routes visual behavior through a cleaner doctrine-aligned structure.

## Governing authority

Treat the following as binding:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Key doctrine implications for this prompt:

- direct hardcoded visual values in ordinary homepage source are prohibited unless they are deliberate and well-justified exceptions
- homepage-local shared components are allowed, but they still need disciplined token and ownership behavior
- structural clarity and maintainability matter as much as immediate appearance

## Files in scope

Primary targets:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`

## Problem to solve

The Companion still spreads visual ownership across:

- inline styles in the runtime
- local CSS modules
- shared governance primitives
- token alias injection patterns

The result works, but ownership is harder to reason about than it should be, and too much ordinary-source visual authoring still lives inside the runtime TSX.

## Required implementation direction

### 1. Reduce runtime-level inline visual authoring
Move repeatable visual rules out of `HbKudosCompanion.tsx` where practical.

The runtime should increasingly focus on:

- state
- orchestration
- render structure
- wiring

not carrying a large amount of direct visual specification.

### 2. Clarify ownership boundaries
Make it easier to understand what belongs to:

- Companion-local visual grammar
- shared governance primitives
- shared variant layer
- detail-panel-specific styling

### 3. Strengthen variant discipline
Where repeated Companion or governance UI patterns exist, use or improve the current variant/CSS-module approach rather than leaving conditional inline-style objects in place.

### 4. Preserve doctrine-safe local homepage patterns
Do not overcorrect by force-promoting everything into broad shared kit territory. Homepage-local shared components remain allowed when scoped appropriately.

## Constraints

- Do not break working render behavior.
- Do not move large amounts of code just for symbolism.
- Do not weaken readability or maintainability in the name of “purity”.
- Do not introduce fake abstraction that obscures real ownership.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Prefer a cleaner ownership model, not gratuitous file churn.
- Keep the solution consistent with homepage-family SPFx doctrine.

## Deliverable

Implement the styling-ownership hardening and report:

- what visual logic moved out of runtime TSX
- how ownership boundaries are now clearer
- what still intentionally remains local and why
